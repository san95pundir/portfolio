  document.getElementById('year').textContent = new Date().getFullYear();

  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  const counters = document.querySelectorAll('[data-count]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const co = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const isDecimal = el.dataset.count.includes('.');
      if(reduceMotion){
        el.textContent = prefix + target + suffix;
        co.unobserve(el);
        return;
      }
      const duration = 1200;
      const startTime = performance.now();
      function tick(now){
        const progress = Math.min((now - startTime) / duration, 1);
        const value = target * progress;
        el.textContent = prefix + (isDecimal ? value.toFixed(2) : Math.round(value)) + suffix;
        if(progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      co.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => co.observe(el));

  // InsightAI mini live-typing demo
  const sqlEl = document.getElementById('sqlTyped');
  if(sqlEl){
    const phrases = [
      { q: '"top 5 cities by revenue"', sql: 'SELECT city, SUM(revenue) ...' },
    ];
    let played = false;
    const sqlObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(!entry.isIntersecting || played) return;
        played = true;
        sqlObserver.unobserve(entry.target);
        if(reduceMotion){ sqlEl.textContent = phrases[0].q + '  →  ' + phrases[0].sql; return; }
        const full = phrases[0].q;
        let i = 0;
        const typer = setInterval(() => {
          i++;
          sqlEl.textContent = full.slice(0, i);
          if(i >= full.length){
            clearInterval(typer);
            setTimeout(() => {
              sqlEl.textContent = full + '  →  generating SQL...';
              setTimeout(() => {
                sqlEl.textContent = full + '  →  ' + phrases[0].sql;
              }, 700);
            }, 400);
          }
        }, 45);
      });
    }, { threshold: 0.4 });
    sqlObserver.observe(sqlEl.closest('.case-visual'));
  }
