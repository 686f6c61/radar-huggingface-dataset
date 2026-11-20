# Oursdesvosges/coilstellaration-ccnorton-coil-optimizer

## Resumen

CCNorton Coil Optimizer es un modelo ONNX autocontenido desarrollado por el usuario Oursdesvosges para el benchmark CoilStellaration de Proxima Fusion, centrado en la optimización de bobinas de confinamiento magnético en reactores de fusión de tipo stellarator. No es un modelo de lenguaje: se trata de un artefacto de optimización numérica que combina una red neuronal prior (physics-informed) con recuperación de vecinos sobre el split de entrenamiento y un solver Levenberg-Marquardt analítico compilado dentro del grafo ONNX.

El modelo resuelve el problema de, dado un contorno de plasma (representado por coeficientes armónicos de frontera) y unos requisitos de métricas, producir la geometría de las bobinas (coordenadas y corrientes) que satisfacen restricciones físicas de separación y curvatura. Su relevancia radica en que cubre simultáneamente las dos pistas del benchmark (`fixed_shape` y `variable_shape`) con un único fichero de 48,78 MiB y 4.348.180 parámetros, alcanzando un `overall_score` oficial de 0,9937 sobre 10.829 instancias de evaluación.

La arquitectura sigue el paradigma "Physics-in-the-Graph": todo el pipeline (prior neuronal, retrieval, optimizador iterativo y selección multi-arranque) está compilado en un único grafo ONNX de opset 20 e IR 10, ejecutable en CPU con `CPUExecutionProvider` y sin ficheros `.data` externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX compilado: prior neuronal FP16 + retrieval k-NN sobre split train + solver Levenberg-Marquardt analítico con Jacobiano compilado (physics-in-the-graph) |
| Parametros totales | 4.348.180 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entradas de dimensión fija: `boundary_r_cos [5,9]`, `boundary_z_sin [5,9]`, `requirement_metrics [4]`) |
| Tipos de cuantizacion | FP16 interno para la red prior; el artefacto distribuido es un único `model.onnx` (no se documentan otras cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 20, IR 10, `model.onnx`, 51.148.759 bytes, sin ficheros `.data` externos) |

## Arquitectura y entrenamiento

El pipeline se organiza en cuatro etapas compiladas en un único grafo ONNX. La etapa 0 aplica una comprobación analítica de círculos de holgura alrededor de la sección del plasma, de modo que las instancias trivialmente holgadas salen sin ejecutar la optimización completa. La etapa 1 construye un pool multi-arranque (hasta 4 arranques sobre las 17 topologías `(NFP, N_c)`) combinando tres fuentes: una red neuronal prior de warm-start comprimida en FP16 y troceada en chunks GEMM por hilo, una búsqueda de vecinos más cercanos (`DB_BYTES=1`, `NEIGHBOURS=2`) estrictamente restringida al `split="train"` (coherente con `no_eval_training=true`), y un fallback de círculos de holgura analíticos (`RING_TURN=1`, `FALLBACKS=3`).

La etapa 2 ejecuta un optimizador Levenberg-Marquardt compilado coarse-to-fine. La fase coarse usa 28 pasos con rejilla de baja resolución (`P_F=24`, `P_K=160`), Jacobiano de simetría de 3 imágenes (`NJ=3`) y filtrado de abandono (`ABANDON=2.8`). La fase fine emplea hasta 60 + 16 + 12 pasos adaptativos con rejilla toroidal escalada por `N_c` (`GRID_T=32`, `GRID_PK=3.2`), anti-aliasing cíclico de 4 fases con memoria de Jacobiano linealizado multipaso (`MEMORY=3`), congelación de campo lejano escalada por corriente (`FAR_HOLD=1`), restricciones smoothed-hinge con lookahead predictivo de Gauss-Newton (`EPS_H=0.12`), suelos aditivos de holgura (`ABS_GAP=0.014`, `MARGIN_CC=0.035`, `MARGIN_CP=0.032`, `MARGIN_K=0.012`), distancia continua segmento-punto (`CC_ALL=2`) y un solver Jacobi-PCG sin matriz de 40 iteraciones con amortiguación espectral armónica `n^4`. La etapa 3 selecciona el mejor iterado según la métrica exponencial oficial del benchmark (`SCORE_KEY=1`) con fallback ante NaN o divergencia.

El entrenamiento se realizó sobre el dataset `proxima-fusion/coilstellaration` con `bench_version=1.0` y `no_eval_training=true`, es decir, sin contaminación del split de evaluación. No se detallan en la información disponible el número de tokens/instancias de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables en este dominio).

## Capacidades

- Optimización de geometría de bobinas para stellarators a partir de contornos de plasma armónicos y requisitos de métricas.
- Soporte simultáneo de las pistas `fixed_shape` y `variable_shape` del benchmark CoilStellaration en un único artefacto (`supported_tracks = "fixed_shape,variable_shape"`).
- Generación de coordenadas de bobina (`coil_x_n`, `coil_y_n`, `coil_z_n`, cada una `[n_coils, 15]`) y corrientes (`currents [n_coils]`).
- Manejo de las 17 topologías `(NFP, N_c)` mediante pool multi-arranque.
- Cálculo interno de holguras, curvatura y restricciones físicas (círculos de holgura, distancia segmento-punto, campo lejano) dentro del grafo.
- Ejecución determinista en CPU con `CPUExecutionProvider`, apta para runners de leaderboard y entornos sin GPU.
- No soporta tool calling, agentes, razonamiento multi-paso genérico, visión, audio ni capacidades multilingües: es un modelo de dominio específico.

## Casos de uso

- Evaluación en el leaderboard de CoilStellaration: el modelo se carga directamente en el runner ONNX oficial de `proxima-fusion/coilstellaration` y produce las salidas esperadas sin adaptadores, lo que permite reproducir el `overall_score` de 0,9937.
- Diseño preliminar de bobinas en estudios de stellarator: dado un contorno de plasma y requisitos de métricas, el modelo devuelve geometrías de bobina factibles en ~1,7-3,0 s por instancia en un solo hilo, adecuado para barridos paramétricos masivos.
- Generación de warm-starts para solvers de mayor fidelidad: las salidas del modelo pueden servir como punto de partida para códigos de optimización magnetohidrodinámica de mayor coste computacional.
- Despliegue en entornos sin GPU: al ser un único ONNX de ~49 MiB ejecutable en CPU, se puede integrar en contenedores ligeros, CI/CD o servicios serverless para validación automática de configuraciones.
- Filtrado rápido de configuraciones inviables: la etapa 0 de círculos de holgura descarta instancias trivialmente holgadas en ~0,6 s, útil para precribar grandes conjuntos de candidatos antes de optimizaciones costosas.
- Investigación en optimización física-informada: el grafo sirve como referencia reproducible del paradigma "physics-in-the-graph" (prior neuronal + retrieval + solver analítico) para comparar con enfoques basados en RL o gradientes diferenciables.
- Benchmarking de hardware y runtimes ONNX: con latencias documentadas por estrato y un solo hilo, es un caso de prueba útil para medir throughput de `onnxruntime` en CPU.

## Benchmarks y rendimiento

Resultados oficiales sobre `split="eval"` (`bench_version=1.0`, `overall_score=0.9937`, 10.829 instancias, `OMP_NUM_THREADS=1` por worker):

| Pista / estrato | N | Score medio | Mediana | p10 | Factible >= 0,9 | Factible estricto | Latencia media (1 hilo) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `fixed_shape` | 2.771 | 0,9931 | 1,0000 | 1,0000 | 98,34% | 96,36% | 1,737 s |
| `fixed_shape/loose` | 1.026 | 0,9962 | 1,0000 | 1,0000 | 99,42% | 98,73% | 0,627 s |
| `fixed_shape/medium` | 861 | 0,9905 | 1,0000 | 1,0000 | 97,21% | 94,77% | 2,380 s |
| `fixed_shape/tight` | 884 | 0,9922 | 1,0000 | 1,0000 | 98,19% | 95,14% | 2,401 s |
| `variable_shape` | 8.058 | 0,9943 | 1,0000 | 1,0000 | 98,59% | 96,35% | 2,051 s |
| `variable_shape/loose` | 2.697 | 0,9976 | 1,0000 | 1,0000 | 99,63% | 98,67% | 0,814 s |
| `variable_shape/medium` | 2.660 | 0,9920 | 1,0000 | 1,0000 | 97,78% | 95,11% | 2,350 s |
| `variable_shape/tight` | 2.701 | 0,9931 | 1,0000 | 1,0000 | 98,33% | 95,26% | 2,992 s |

Comparación declarada por el autor frente al baseline universal previo `#1` (0,9802): mejora de +0,0135 en score global, +2,78% en factibilidad estricta sobre `fixed_shape` y +5,16% sobre `variable_shape`. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) por no ser aplicables a este dominio.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU (`CPUExecutionProvider`). El artefacto ocupa 51.148.759 bytes (~48,78 MiB) y el repo 0,1 GB.
- GPU recomendadas: no disponibles; no se documenta soporte CUDA/TensorRT ni se han publicado requisitos de GPU.
- Cabe en cualquier CPU consumer: con ~49 MiB de pesos y 4,35 M de parámetros, la huella de memoria es mínima; el cuello de botella es el solver iterativo, no la memoria.
- Opciones de despliegue: `onnxruntime` (CPU), integrable en el runner ONNX del leaderboard de CoilStellaration; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia: 0,627 s (loose, fixed) a 2,992 s (tight, variable) por instancia con `OMP_NUM_THREADS=1`; el autor menciona troceado GEMM por hilo para throughput multi-worker sin contención, pero no publica cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Score CoilStellaration | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CCNorton Coil Optimizer (este) | ONNX physics-in-the-graph | 4.348.180 | no aplica | 0,9937 (eval oficial) | Apache 2.0 | Hugging Face (`Oursdesvosges/coilstellaration-ccnorton-coil-optimizer`) |
| Baseline universal previo `#1` (sin identificar) | no disponible | no disponible | no aplica | 0,9802 | no disponible | no disponible |
| Otros participantes del leaderboard CoilStellaration | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información detallada sobre modelos alternativos comparables en la documentación proporcionada; la única referencia cuantitativa es el baseline previo `#1` con score 0,9802.

## Limitaciones y advertencias

- Modelo de dominio muy específico (optimización de bobinas de stellarator); no es reutilizable para tareas de lenguaje, visión u otras.
- El score se ha medido sobre `split="eval"` con `bench_version=1.0`; cambios de versión del benchmark o de la métrica pueden invalidar la comparación.
- Dependencia de la recuperación sobre `split="train"`: aunque se respeta `no_eval_training=true`, el rendimiento puede degradarse en distribuciones de instancias alejadas de las del dataset de entrenamiento.
- Riesgo de divergencia numérica en configuraciones patológicas: el autor incluye fallback de sanity ante NaN/divergencia en la etapa 3, lo que sugiere que existen casos límite.
- Latencia variable según estrato (hasta ~3 s por instancia en `tight`/`variable_shape` a un solo hilo); en barridos grandes puede requerir paralelización multi-worker.
- No se documentan sesgos, idiomas ni restricciones de uso comercial más allá de la licencia Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es nula; conviene verificar la reproducibilidad del score de forma independiente.
- No se documenta el proceso de entrenamiento (datos, hiperparámetros, semillas), lo que dificulta auditar la generalización.

## Enlaces

- Hugging Face: https://huggingface.co/Oursdesvosges/coilstellaration-ccnorton-coil-optimizer
- Dataset CoilStellaration: https://huggingface.co/datasets/proxima-fusion/coilstellaration
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
