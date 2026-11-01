# Mikhail385/fly-brain-trader

## Resumen

Fly-Brain Trader v3 es un artefacto de investigación publicado en HuggingFace por Mikhail385 que implementa un aprendiz de recompensa inspirado biológicamente en el cuerpo de hongo (mushroom body) de la mosca de la fruta (Drosophila). No es un modelo de lenguaje ni un transformer: es una red de características aleatorias con una capa de expansión dispersa fija y una readout lineal entrenable, que aprende online mediante una regla de plasticidad de tres factores modulada por dopamina. El modelo se distribuye en cinco checkpoints que corresponden a distintas etapas de un único entrenamiento continuo: inicialización aleatoria, currículo sintético, preentrenamiento con datos reales, validación y test ciego.

El problema que aborda es la aplicación de principios neurocientíficos (código disperso k-WTA, plasticidad local, error de predicción de recompensa) a la selección de acciones en mercados de renta variable, sin retropropagación ni descenso de gradiente. Su relevancia es fundamentalmente metodológica: demuestra que una regla de aprendizaje local y biológicamente plausible puede entrenarse de forma prequential sobre datos financieros reales y compararse contra un benchmark. No obstante, el propio autor lo califica explícitamente como artefacto de investigación y no como modelo de trading.

La arquitectura consta de dos "cerebros" separados: un stock brain (22 features de entrada, 110 neuronas de proyección, 2.000 células de Kenyon con top-100 activas, 4.220 sinapsis entrenables) y un market brain (10 features, 50 neuronas de proyección, 500 células de Kenyon con top-25 activas, 1.100 sinapsis entrenables). El repositorio tiene un tamaño de 0,0 GB y no incluye pesos en formatos estándar de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de características aleatorias con expansión dispersa fija (k-WTA) y readout lineal entrenable; plasticidad de tres factores modulada por recompensa |
| Parametros totales | Stock brain: 14.000 no-cero en proyección fija + 4.220 sinapsis entrenables; market brain: 3.500 no-cero + 1.100 entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto; procesa features semanales) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | No disponible (el repo tiene 0,0 GB; se distribuyen checkpoints del entrenamiento, formato no especificado) |

## Arquitectura y entrenamiento

La arquitectura sigue el circuito del cuerpo de hongo de la Drosophila: las neuronas de proyección codifican cada feature de entrada mediante cinco curvas de sintonía gaussianas (σ = 1,2), produciendo 110 neuronas de proyección en el stock brain y 50 en el market brain. Estas se proyectan a una capa de células de Kenyon mediante una proyección aleatoria dispersa fija (7 entradas por célula, pesos log-normales, 14.000 no-cero en el stock brain), con inhibición global k-WTA que mantiene activas solo el 5% de las células (top 100 de 2.000). La capa de expansión nunca se entrena; solo cambian las sinapsis de salida (readout), que incluyen además una vía directa proyección→salida (tipo lóbulo lateral) con 110 conexiones adicionales.

El entrenamiento no usa retropropagación. Cada semana, el resultado de cada posición se convierte en una valencia aversa a las pérdidas (λ = 2, como en teoría de perspectivas) y se calcula un error de predicción de recompensa respecto a una línea base móvil. La actualización sigue una regla de tres factores: actividad presináptica × objetivo postsináptico × señal de recompensa, aplicada solo a las células de Kenyon activas, con homeostasis (ρ = 2×10⁻⁴, w₀ = 1) y recorte a [0, 3]. Se añaden actualizaciones ficticias (φ = 0,3) para el lado no operado y un refuerzo por rendimiento ("love") cuando la rentabilidad trailing a 52 semanas supera al S&P 500. El entrenamiento es continuo en cinco etapas: currículo sintético (hasta 30 lecciones, lr = 0,03), preentrenamiento con small caps de Tokio 2017-2021 (~250 semanas, lr = 0,01), validación 2022-23 (97 semanas) y test ciego enero 2024-octubre 2026 (136 semanas), con evaluación prequential.

## Capacidades

- Ranking semanal de acciones: asigna una puntuación a cada acción y construye una cartera long de las 20 mejores.
- Decisión long/short semanal: el market brain determina la dirección de la posición.
- Aprendizaje online sin reinicio: las sinapsis se actualizan semana a semana con cada resultado observado.
- Aprendizaje por refuerzo con recompensa aversa a pérdidas y actualizaciones contrafactuales.
- Currículo sintético: entrenamiento previo en mercados simulados que siguen reglas de libro de texto.
- Inspección de la evolución de pesos: cinco checkpoints permiten analizar qué hizo cada etapa al readout.
- No soporta tool calling, function calling, agentes, multilingüismo, visión ni audio.

## Casos de uso

- Investigación en neurociencia computacional: reproducir el circuito del cuerpo de hongo y estudiar cómo una regla de plasticidad local de tres factores converge en una tarea de decisión secuencial, usando los cinco checkpoints para aislar el efecto de cada etapa.
- Estudio de aprendizaje online prequential: analizar cómo se comporta un readout lineal entrenado sin retropropagación cuando cada decisión se toma antes de aprender del resultado, como banco de pruebas de metodologías de evaluación financiera.
- Comparación de reglas de plasticidad: sustituir la regla de tres factores por alternativas (Hebb, Oja, STDP) y comparar la evolución de los pesos y la rentabilidad en el mismo currículo sintético.
- Docencia en aprendizaje por refuerzo bioinspirado: usar los checkpoints como material didáctico para mostrar la diferencia entre gradiente de política y modulación por recompensa con código disperso.
- Análisis de sensibilidad a hiperparámetros: modificar λ (aversión a pérdidas), φ (factor ficticio) o ρ (homeostasis) y medir el impacto en el test ciego, dado que el código y los scripts están disponibles en GitHub.
- Reproducibilidad de resultados financieros: replicar el test ciego 2024-2026 con la semilla 0 y verificar la significancia estadística reportada (p = 0,041 bruto, Holm p = 0,41), como ejercicio de buenas prácticas en investigación cuantitativa.

## Benchmarks y rendimiento

| Metrica | Fly-Brain Trader v3 | S&P 500 (referencia) |
|---|---|---|
| Retorno anualizado test ciego (ene 2024 – oct 2026, USD) | +3,0% | +22,5% |
| Comparación vs selección aleatoria (misma programación) | p bruto = 0,041 | — |
| Corrección de Holm (10 tests) | p = 0,41 (no significativo) | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el modelo completo ocupa 0,0 GB según el repositorio y consta de 4.220 + 1.100 sinapsis entrenables más proyecciones fijas dispersas.
- GPU recomendadas: ninguna en particular; el modelo cabe en CPU y en cualquier GPU consumer (RTX 3060, RTX 4090) sin problemas.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria, e incluso en CPU.
- Opciones de despliegue: no se especifican en la información disponible; el código de entrenamiento y evaluación está en GitHub (github.com/MikhailPeganov/fly-brain-trader), por lo que el despliegue sería mediante los scripts del repositorio.
- Latencia y throughput: no disponibles; el procesamiento es semanal, no por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fly-Brain Trader v3 | 4.220 + 1.100 sinapsis entrenables | No aplica | +3,0% anualizado en test ciego | MIT | HuggingFace + GitHub |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (aprendices bioinspirados con plasticidad local aplicados a finanzas) en la documentación proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor advierte explícitamente que no debe usarse para operar en mercados reales.
- Rendimiento inferior al benchmark: +3,0% anualizado frente a +22,5% del S&P 500 en el test ciego.
- Significancia estadística no robusta: el p bruto de 0,041 deja de ser significativo tras la corrección de Holm (p = 0,41) por los 10 tests del estudio.
- Sesgo de selección de datos: el entrenamiento usa small caps de Tokio, lo que limita la generalización a otros mercados y capitalizaciones.
- Sin datos de sesgos demográficos ni de alucinación: el modelo no procesa lenguaje, por lo que esas categorías no aplican, pero tampoco hay evaluación de robustez ante regímenes de mercado no vistos.
- Licencia MIT: permite uso comercial, pero el autor desaconseja su uso en producción financiera.
- Terminología antropomórfica: "pain", "happiness" y "love" son términos escalares de la regla de actualización; el modelo no experimenta nada, y malinterpretarlos puede llevar a conclusiones erróneas.
- Repositorio de 0,0 GB sin formatos de pesos estándar: la reproducibilidad depende de los scripts de GitHub y de la semilla 0.
- Idiomas no disponibles: no es un modelo lingüístico, por lo que no soporta interacción en lenguaje natural.

## Enlaces

- HuggingFace: https://huggingface.co/Mikhail385/fly-brain-trader
- Paper (PDF): paper.pdf (referenciado en la model card, *Pain, Happiness and Love in a Fly-Brain Trader: Blind Tests of a Connectome-Inspired Reward Learner in Equity Markets*, working paper, octubre 2026)
- Código, entrenamiento y evaluación: https://github.com/MikhailPeganov/fly-brain-trader
