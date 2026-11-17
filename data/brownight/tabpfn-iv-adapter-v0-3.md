# Brownight/tabpfn-iv-adapter-v0.3

## Resumen

TabPFN-IV adapter v0.3 es un adaptador de salida de 397.507 parámetros que se monta sobre el backbone congelado TabPFN 3.5 para estimar funciones de nuisance en problemas de variables instrumentales binarias. El modelo predice las cinco funciones `[e(x), mD(x,0), mD(x,1), mY(x,0), mY(x,1)]` y, a partir de ellas, calcula el efecto causal local medio (LATE) mediante AIPW con validación cruzada de 5 folds y errores estándar basados en funciones de influencia. Lo desarrolla Brownight y se publica bajo la licencia propietaria tabpfn-3-5-license-v1.0.

El interés del modelo es práctico: sustituye el ajuste clásico de modelos de regresión para cada función de nuisance por una predicción amortizada con un transformer tabular preentrenado (PFN, prior-fitted network). Según la model card, en su pool de test de 2.000 tablas con n=500 logra un RMSE de 0,268 frente a 3,41 de un baseline de random forest con bootstrap (183 s por tabla) y 0,316 del mismo baseline con trimming, con una cobertura del intervalo del 95,65 % y 0,366 s por tabla en bf16 sobre una GPU L4.

Es un componente de nicho dentro de la inferencia causal aplicada: no es un modelo de lenguaje ni un modelo generativo general, sino un adaptador especializado que requiere el código del proyecto y el checkpoint del backbone TabPFN 3.5 (no incluido en el repositorio) para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de salida sobre backbone TabPFN 3.5 (transformer tabular tipo prior-fitted network), backbone congelado |
| Parametros totales | 397.507 (solo el adaptador; el backbone no se incluye en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 500 filas de contexto en entrenamiento (v0.3); 256 filas en v0.1 |
| Tipos de cuantizacion | No disponible (la model card solo menciona ejecución en bf16) |
| Idiomas soportados | No disponible (modelo tabular, no lingüístico) |
| Licencia | tabpfn-3-5-license-v1.0 (license: other) |
| Formato de pesos | Checkpoints PyTorch (`best.pt`, `last.pt`); backbone en safetensors (`tabpfn-v3.5-20260909.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se sitúa en la salida de un backbone TabPFN 3.5 congelado y aprende a predecir las cinco funciones de nuisance de un problema de variable instrumental binaria: la probabilidad de tratamiento `e(x)`, las medias condicionales de tratamiento `mD(x,0)` y `mD(x,1)`, y las medias condicionales de resultado `mY(x,0)` y `mY(x,1)`. La estimación final del LATE se obtiene fuera del adaptador, mediante AIPW con validación cruzada de 5 folds y errores estándar calculados con funciones de influencia. El esquema de datos se identifica como `iv-nuisance-v0.3` y el cargador verifica la identidad del código mediante sha256 `2606069c…`.

El entrenamiento de la v0.3 usó 20.000 tablas sintéticas con contexto de 500 filas, muestreadas uniformemente de tres familias generadoras: Ding (2017), Qiu (2021) y Kennedy-Balakrishnan-G'Sell (2020). Se ejecutaron 20 épocas con ROOT_SEED 20261116 y la pérdida de selección final fue 0,3861. El repositorio conserva también versiones anteriores: la v0.2, entrenada solo con las familias Ding y Qiu (20.000 tablas, contexto de 500 filas), y la v0.1, con 12.000 tablas y contexto de 256 filas. No se documentan fases de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo de regresión tabular.

## Capacidades

- Predicción de las cinco funciones de nuisance de un problema de variable instrumental binaria a partir de datos tabulares.
- Estimación de LATE mediante AIPW con validación cruzada de 5 folds y errores estándar por función de influencia.
- Cálculo de intervalos de confianza al 95 % (longitud media de 0,875 en el pool de test de la v0.3).
- Generalización a tres familias de generación de datos causales (Ding, Qiu, Kennedy-Balakrishnan-G'Sell).
- Ejecución en precisión bf16 sobre GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo tabular especializado, no un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Evaluación de políticas públicas con asignación no aleatoria: cuando existe un instrumento binario (por ejemplo, asignación por sorteo de una carta de invitación), el adaptador estima las funciones de nuisance y el pipeline calcula el LATE con intervalos de confianza, evitando el ajuste manual de cinco modelos de regresión.
- Experimentos naturales en economía aplicada: para muestras de hasta 500 filas de contexto, el modelo produce estimaciones amortizadas en 0,366 s por tabla (bf16, L4), lo que permite iterar sobre muchas especificaciones o submuestras en minutos en lugar de horas.
- Análisis de ensayos con cumplimiento imperfecto: en diseños de intención de tratar donde el tratamiento efectivo es endógeno, el adaptador predice `mD(x,0)` y `mD(x,1)` y el AIPW corrige el sesgo por incumplimiento.
- Docencia y prototipado en inferencia causal: el repositorio incluye versiones v0.1, v0.2 y v0.3 con distintos tamaños de entrenamiento y contexto, útiles para comparar el efecto de la familia de datos y del contexto en la calidad de la estimación.
- Validación de pipelines causales frente a baselines clásicos: el pool de test de 2.000 tablas permite comparar el adaptador con random forest más bootstrap (RMSE 3,41 sin trimming, 0,316 con trimming) y verificar cobertura y longitud de intervalos.
- Investigación metodológica sobre PFN aplicados a causalidad: al ser un adaptador pequeño (397.507 parámetros) sobre un backbone congelado, sirve como banco de pruebas para estudiar cómo se transfiere el prior tabular de TabPFN a tareas de nuisance en variables instrumentales.

## Benchmarks y rendimiento

Resultados publicados en la model card para el pool de test de la v0.3 (2.000 tablas, n=500, tres familias mezcladas):

| Metrica | TabPFN-IV adapter v0.3 | RF + refit bootstrap (sin trim) | RF + refit bootstrap (con trim) |
|---|---|---|---|
| RMSE | 0,268 | 3,41 | 0,316 |
| Sesgo | +0,012 | No disponible | No disponible |
| Cobertura del IC al 95 % | 95,65 % | 91,4 % | 90,3 % |
| Longitud media del IC | 0,875 | No disponible | No disponible |
| Tiempo por tabla | 0,366 s (bf16, un proceso en L4) | 183 s | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador es diminuto (397.507 parámetros), pero requiere cargar el backbone TabPFN 3.5 completo, cuyo consumo de memoria no se detalla en la model card.
- GPU recomendadas: la model card reporta ejecución en bf16 sobre una NVIDIA L4; no se especifican otras GPU probadas.
- GPU de consumo: no disponible; no se confirma compatibilidad con RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el proyecto proporciona su propio pipeline (`python pipeline.py infer --checkpoint <backbone> --adapter best.pt --data input.npz`); no se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,366 s por tabla en bf16 con un proceso en L4, según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TabPFN-IV adapter v0.3 | 397.507 (adaptador) + backbone TabPFN 3.5 | 500 filas | Adaptador PFN + AIPW para LATE | tabpfn-3-5-license-v1.0 | Hugging Face (requiere backbone y código del proyecto) |
| RF + refit bootstrap (baseline de la model card) | No aplica | No aplica | Random forest con bootstrap para nuisance | No disponible | Implementación propia del autor |
| TabPFN 3.5 (backbone) | No disponible | No disponible | Prior-fitted network tabular | tabpfn-3-5-license-v1.0 | Checkpoint `tabpfn-v3.5-20260909.safetensors` (no incluido en el repo) |

No se dispone de información sobre otros adaptadores de variables instrumentales comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye el backbone TabPFN 3.5; sin el checkpoint `tabpfn-v3.5-20260909.safetensors` (sha256 `ece4d67e…`) y el código del proyecto, el adaptador no es utilizable.
- El cargador verifica la identidad del código por sha256 (`2606069c…`); modificaciones en el pipeline pueden impedir la carga.
- El entrenamiento se limita a tres familias generadoras (Ding, Qiu, Kennedy-Balakrishnan-G'Sell) y a un contexto de 500 filas; el comportamiento fuera de ese régimen no está documentado.
- Solo cubre variables instrumentales binarias; no se documenta soporte para instrumentos continuos, múltiples instrumentos ni variables de tratamiento multinivel.
- La licencia tabpfn-3-5-license-v1.0 es propietaria (`license: other`); deben revisarse sus términos antes de cualquier uso comercial.
- No se documentan sesgos específicos ni tasas de alucinación (no aplica en sentido lingüístico), pero al ser un modelo entrenado con datos sintéticos, su validez en distribuciones reales distintas de las familias de entrenamiento no está verificada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Los resultados de benchmarks proceden exclusivamente de la model card del autor y no han sido replicados de forma externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Brownight/tabpfn-iv-adapter-v0.3
- TabPFN (proyecto base): no disponible en la información proporcionada
- Paper de Ding (2017): no disponible en la información proporcionada
- Paper de Qiu (2021): no disponible en la información proporcionada
- Paper de Kennedy-Balakrishnan-G'Sell (2020): no disponible en la información proporcionada
