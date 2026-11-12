# MHRDYN7/native-photoz-mdn-ls-leakage-raw

## Resumen

`MHRDYN7/native-photoz-mdn-ls-leakage-raw` es un modelo de estimación de desplazamiento al rojo fotométrico (photo-z) desarrollado por el usuario MHRDYN7, publicado como prototipo de la "Limited Task 2" con fecha 2026-11-12. Se trata de una red de densidad mixta (Mixture Density Network, MDN) implementada en PyTorch que predice la distribución de probabilidad del redshift a partir únicamente de fotometría, sin utilizar imágenes ni espectros como entrada.

El modelo se ha entrenado sobre una muestra controlada contra fugas de información (leakage-controlled) que combina datos de DESI DR1 con Legacy Survey, y declara explícitamente que no emplea datos de COSMOS 2025. Con 4.242.459 parámetros entrenables y un checkpoint de 16,2 MiB, es un modelo compacto orientado a experimentación y validación metodológica más que a producción a gran escala.

Su relevancia radica en que aborda uno de los problemas clásicos de la astrofísica de grandes cartografiados: estimar redshifts precisos solo con fotometría, controlando fugas entre conjuntos de entrenamiento y test, y proporcionando una salida probabilística (mezcla de gaussianas) en lugar de una estimación puntual. La métrica principal reportada es σ_NMAD = 0,0409 sobre 15.000 objetos de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture Density Network (MDN) con 8 bloques residuales, anchura 512, K=9 componentes |
| Parametros totales | 4.242.459 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular de fotometría) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo cientifico numerico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`, cargable con `torch.load`) |

## Arquitectura y entrenamiento

El modelo es una red de densidad mixta (MDN) que combina un tronco residual con 8 bloques residuales de anchura 512 y una cabeza de salida que parametriza una mezcla de K=9 gaussianas. La entrada es un vector de características fotométricas en formato `raw` (sin ingeniería de características adicional según la model card). La salida es una distribución de probabilidad sobre el redshift, lo que permite obtener tanto una estimación puntual (media de la mezcla) como intervalos de credibilidad.

El entrenamiento se realizó con semilla 42 sobre una muestra de DESI DR1 cruzada con Legacy Survey, con cortes de selección diseñados para controlar fugas de información entre entrenamiento y test (leakage-controlled). La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables en este dominio). El checkpoint ocupa 16,2 MiB y el modelo se distribuye como `model.pt` junto con un `summary.json` que contiene tiempos, memoria GPU máxima, arquitectura y los cortes exactos aplicados.

## Capacidades

- Predicción de redshift fotométrico a partir exclusivamente de fotometría (sin imágenes ni espectros).
- Salida probabilística: distribución como mezcla de 9 gaussianas, permitiendo estimaciones puntuales (media de la mezcla) e intervalos de incertidumbre.
- Estimación puntual mediante media de la mezcla con sesgo reportado de 0,0009.
- Métricas de calidad reportadas: σ_NMAD = 0,0409, η(0,15) = 0,0801, η(0,02) = 0,5933 sobre 15.000 objetos.
- Diseñado para experimentación metodológica en control de leakage entre cartografiados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no aplica).
- No procesa imágenes ni audio; entrada tabular numérica.

## Casos de uso

- Validación metodológica de photo-z: sirve como referencia reproducible (semilla 42, cortes documentados en `summary.json`) para comparar pipelines de estimación de redshift con control de leakage.
- Estudio de fugas entre cartografiados: el diseño leakage-controlled permite analizar cómo afecta la contaminación entre DESI DR1 y Legacy Survey a las métricas de photo-z.
- Generación de distribuciones de probabilidad de redshift: la salida MDN con K=9 componentes es útil para propagar incertidumbres en análisis cosmológicos que requieren p(z) completas en lugar de estimaciones puntuales.
- Prototipado rápido en entornos con recursos limitados: con 4,2 M de parámetros y 16,2 MiB de checkpoint, se puede entrenar y evaluar en una sola GPU consumer.
- Evaluación de métricas de photo-z: útil para reproducir y comparar σ_NMAD, bias y tasas de outlier η(0,15) y η(0,02) en muestras controladas.
- Docencia e investigación en astroestadística: ejemplo compacto de MDN aplicada a un problema real de regresión probabilística con datos tabulares.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| n (test) | 15.000 |
| σ_NMAD | 0,04092385896019426 |
| bias | 0,0009077856235782189 |
| η(0,15) | 0,08006666666666666 |
| η(0,02) | 0,5932666666666667 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 4,2 M de parámetros y checkpoint de 16,2 MiB, cabe holgadamente en cualquier GPU con al menos 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna; no requiere A100 ni H100. Una RTX 3060 o superior es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer reciente e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: PyTorch nativo (`torch.load("model.pt")`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; `summary.json` contiene tiempos y memoria GPU máxima del entrenamiento, no de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de photo-z con MDN sobre muestras leakage-controlled de DESI DR1 × Legacy Survey.

## Limitaciones y advertencias

- Modelo prototipo ("Limited Task 2 prototype") sin descargas ni likes; no validado por la comunidad.
- Entrenado sobre una muestra específica de DESI DR1 × Legacy Survey con cortes concretos; la generalización a otros cartografiados o rangos de redshift no está documentada.
- No utiliza imágenes ni espectros como entrada; su precisión está acotada por la información fotométrica disponible.
- Métricas reportadas solo sobre un conjunto de test de 15.000 objetos; no se documenta validación cruzada ni robustez frente a distintos cortes.
- η(0,02) = 0,5933 indica que solo el 59 % de los objetos cae dentro de |Δz|/(1+z) < 0,02, lo que limita su uso en análisis que requieran precisión alta.
- No se documentan sesgos por población (tipo espectral, luminosidad, extinción) ni análisis de submuestras.
- Licencia MIT permite uso comercial, pero la ausencia de documentación sobre el dataset subyacente y los cortes exactos (solo referenciados en `summary.json`) dificulta la reproducibilidad completa.
- No apto para producción sin validación externa; el propio autor lo etiqueta como prototipo.

## Enlaces

- Hugging Face: https://huggingface.co/MHRDYN7/native-photoz-mdn-ls-leakage-raw
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
