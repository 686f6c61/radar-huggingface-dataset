# maxgfr/s6-cast-pico

## Resumen

s6-cast-pico es un modelo de predicción de series temporales probabilística desarrollado por maxgfr, publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un modelo de 369.792 parámetros con pesos ternarios, empaquetado en un fichero GGUF de 143 KB, que dado un historial de hasta 2.048 puntos devuelve nueve cuantiles (los deciles) para cada uno de los siguientes 64 pasos. Está construido sobre el codificador s6 del proyecto skycmd, implementado íntegramente en Rust y ejecutable tanto de forma nativa como en WebAssembly.

Su relevancia no reside en el rendimiento, sino en su naturaleza de resultado negativo pre-registrado. El autor fijó de antemano un umbral de calidad (nGMASE ≤ 0.838 y nWQL ≤ 0.587 en GIFT-Eval) que el modelo no alcanzó: obtuvo 0.9471 y 0.6646 respectivamente. El modelo se publica para que el resultado pueda verificarse y reproducirse, no para su uso en producción. El propio autor recomienda no utilizarlo y señalar que TinyCast (Apache-2.0, 146.505 parámetros) es mejor en 86 de las 97 configuraciones evaluadas.

La arquitectura emplea parches de 32 puntos, dos bloques con pesos compartidos ejecutados dos veces, salida temprana tras cada bucle, dimensión 96, dos cabezas de atención y un decodificador para dos parches de horizonte (64 puntos). El contexto máximo es de 64 parches (2.048 puntos) y los horizontes más largos se obtienen por despliegue iterativo (rollout).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador s6 sobre parches de 32 puntos; 2 bloques con pesos compartidos en bucle doble; salida temprana; d=96; 2 cabezas |
| Parametros totales | 369.792 (la ficha de Hugging Face indica 103.584 en safetensors; la model card indica 369.792) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 puntos de historial (64 parches de 32 puntos) |
| Tipos de cuantizacion | Pesos ternarios (QAT sobre el 20 % final del entrenamiento); empaquetado GGUF |
| Idiomas soportados | No aplica (modelo de series temporales, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tag `skycmd-cast`), ejecutable solo en el motor skycmd |

## Arquitectura y entrenamiento

El modelo es un codificador basado en parches (patch-based encoder) sobre la arquitectura s6 del proyecto skycmd. La entrada se divide en parches de 32 puntos; dos bloques transformer con pesos compartidos se ejecutan dos veces, con una salida (exit) tras cada bucle. La dimensión del modelo es 96 con dos cabezas de atención, y un decodificador genera dos parches de horizonte (64 puntos) con nueve salidas cuantílicas. Incorpora salida temprana: una pasada se detiene cuando la mediana de una salida se desplaza menos que `exit_tolerance` respecto a la anterior; el fichero almacena el valor 0.012839192, calibrado sobre 2.000 ventanas sintéticas (α 0,05, δ 0,02). No incluye Parallax ni XSA, que la receta pre-registrada no adoptó, lo que resultó en 369.792 parámetros en lugar de los 388.320 previstos.

El entrenamiento se realizó desde cero en Rust (mlx-rs) sobre un Apple M5, en una única ejecución de 480 minutos de trabajo (250.092 pasos) en modo limitado. Se usó AdamW con tasa 3e-3 (elegida por un piloto pre-registrado), batch de 256, cuantización consciente del entrenamiento (QAT) sobre el último 20 %, EMA 0,999 (se exportan los pesos EMA: pinball de validación 0,0431 frente a 0,0442 de los últimos pesos) y semilla 1. TinyCast actuó como profesor en el 50 % de las ventanas con un peso atenuado de 0,5 a 0. Los datos combinan series sintéticas (kernels de proceso gaussiano, trenes de pulsos, tendencia más estacionalidad más ruido, SARIMA), variables de estado de los juegos de skycmd y series reales permisivas: archivo Monash (contadores inteligentes de Londres, parques eólicos, conteos de peatones, rideshare; CC-BY-4.0), pageviews de Wikimedia (CC0-1.0) y NOAA USHCN diario (dominio público). Ninguna de estas series pertenece a GIFT-Eval ni al benchmark zero-shot de Chronos.

## Capacidades

- Predicción probabilística de series temporales: devuelve nueve cuantiles (los deciles) por cada paso de horizonte.
- Horizonte de una pasada de 64 puntos; horizontes mayores mediante despliegue iterativo (rollout) con salida tras cada bucle.
- Contexto de hasta 2.048 puntos de historial.
- Salida temprana adaptativa que reduce cómputo cuando la predicción se estabiliza.
- Ejecución nativa y en WebAssembly a través del motor skycmd (`sky-infer`).
- Inferencia en navegador mediante la API `new Forecaster(bytes)` y `forecast(history, horizon, flip)`, que devuelve `horizon × 9` cuantiles en las unidades del historial.
- No soporta tool calling, agentes ni capacidades multilingües: es un modelo numérico de forecasting, no un modelo de lenguaje.

## Casos de uso

- Predicción de demanda energética a corto plazo: con hasta 2.048 puntos de historial y 64 pasos de horizonte, puede generar distribuciones cuantílicas de consumo horario o por franjas de 10 minutos; sin embargo, su MASE en el dominio Energy (1,080) es peor que el del naive estacional, por lo que no es recomendable en producción.
- Planificación de capacidad en cloud y operaciones web: el dominio Web/CloudOps obtiene MASE 0,983 y WQL 0,662, próximo al naive estacional; podría usarse como línea base exploratoria, no como predictor principal.
- Evaluación comparativa de modelos de forecasting: sirve como referencia reproducible en GIFT-Eval para validar arneses de evaluación y protocolos pre-registrados.
- Investigación sobre cuantización ternaria en modelos de series temporales: el modelo demuestra que es posible empaquetar un predictor probabilístico en 143 KB con pesos ternarios, útil para estudiar el equilibrio entre compresión y precisión.
- Despliegue en entornos con restricciones extremas de memoria: el tamaño de 143 KB permite ejecutarlo en navegador o dispositivos embebidos vía WASM, aunque con la advertencia de que el autor no lo recomienda para uso real.
- Estudio de destilación con profesor (TinyCast): el uso de TinyCast como profesor en el 50 % de las ventanas documenta una estrategia de destilación parcial que puede replicarse en otros experimentos.
- Análisis de resultados negativos y reproducibilidad: el modelo y su informe asociado permiten verificar la metodología de pre-registro y la transparencia en la publicación de fallos.

## Benchmarks y rendimiento

Resultados en GIFT-Eval (97 configuraciones, 371.330 ventanas, protocolo oficial con gluonts `evaluate_model`, nueve deciles; métricas normalizadas por el naive estacional y promediadas geométricamente):

| Modelo | nGMASE | nWQL | nMSIS |
|---|---:|---:|---:|
| s6-cast-pico, sin flip (modelo reportado) | 0,9471 | 0,6646 | 0,7190 |
| s6-cast-pico, con flip | 0,9099 | 0,6417 | 0,6860 |
| Umbral: FLAIR sin entrenamiento (paper TinyCast) | 0,838 | 0,587 | No disponible |
| Objetivo: TinyCast publicado | 0,774 | 0,545 | No disponible |
| TinyCast, port del autor, con flip | 0,7856 | 0,5570 | 0,5781 |
| Naive estacional, arnés del autor | 0,9999 | 0,8876 | 2,6778 |

Desglose por término (MASE): 0,860 en corto, 1,046 en medio y 1,105 en largo, frente a 0,756, 0,806 y 0,848 del port de TinyCast. Los horizontes medio y largo son peores que el naive estacional.

Desglose por dominio (MASE / WQL): Econ/Fin 1,018 / 0,901; Energy 1,080 / 0,800; Healthcare 0,760 / 0,614; Nature 0,862 / 0,467; Sales 0,753 / 0,457; Transport 0,833 / 0,644; Web/CloudOps 0,983 / 0,662. Healthcare es el único dominio donde su WQL supera a TinyCast (0,614 frente a 0,639).

Peores configuraciones: `solar/10T/long` y `solar/10T/medium`, con ratios MASE de 2,729 y 2,282, frente a 0,973 y 0,955 del port de TinyCast.

No medidos en la ejecución: latencia, número medio de salidas utilizadas en GIFT-Eval (la calibración da 3,64 de 4 sobre ventanas sintéticas) y la diferencia respecto a Timestral-5M. 2.017 ventanas en 12 configuraciones no tienen observación en los últimos 2.048 puntos del modelo y son predichas por el naive estacional en ambas pasadas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para los pesos (143 KB en GGUF); el consumo real depende del motor skycmd y del búfer de contexto (2.048 puntos de entrada).
- GPU recomendadas: no requiere GPU; el entrenamiento se realizó en un Apple M5 y la inferencia está pensada para CPU o WASM.
- Cabe en cualquier GPU de consumo e incluso en navegador; no se necesita aceleración dedicada.
- Opciones de despliegue: exclusivamente el motor skycmd (`sky-infer`), de forma nativa o en WASM. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no medidos en la ejecución publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | nGMASE (GIFT-Eval) | nWQL | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| s6-cast-pico | 369.792 | 2.048 puntos | 0,9471 | 0,6646 | Apache-2.0 | GGUF en HF; solo motor skycmd |
| TinyCast (port del autor) | 146.505 | No disponible | 0,7856 | 0,5570 | Apache-2.0 | Disponible |
| FLAIR (sin entrenamiento) | No disponible | No disponible | 0,838 | 0,587 | No disponible | No disponible |
| Naive estacional | 0 | No aplica | 0,9999 | 0,8876 | No aplica | Referencia |

TinyCast supera a s6-cast-pico en 86 de las 97 configuraciones en MASE y en 87 en WQL, con menos de la mitad de parámetros. El naive estacional, sin parámetros, queda próximo en nGMASE (0,9999 frente a 0,9471), lo que relativiza la ventaja del modelo.

## Limitaciones y advertencias

- El modelo falló su umbral pre-registrado: nGMASE 0,9471 frente a 0,838 exigido y nWQL 0,6646 frente a 0,587. El autor lo publica como resultado negativo, no para uso.
- No supera el objetivo de batir a TinyCast (0,774 / 0,545); TinyCast es mejor en 86 de 97 configuraciones en MASE.
- Una sola ejecución con una sola semilla; no hay validación de robustez entre semillas.
- El horizonte de una pasada es de 64 puntos; los horizontes largos requieren rollout y los términos medio y largo son peores que el naive estacional.
- Peor que el naive estacional en predicción puntual en los dominios Econ/Fin y Energy.
- Casos extremos documentados: `solar/10T/long` y `solar/10T/medium` con ratios MASE de 2,729 y 2,282.
- 2.017 ventanas sin observación en el contexto de 2.048 puntos son predichas por el naive estacional.
- No se midieron latencia, número medio de salidas ni la comparación con Timestral-5M.
- Ejecutable únicamente en el motor skycmd; no es compatible con ecosistemas estándar de inferencia.
- Licencia Apache-2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso en producción.
- No es un modelo de lenguaje: no soporta generación de texto, código, tool calling ni capacidades multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-cast-pico
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/maxgfr/s6-cast-pico
- Repositorio de código (Rust): https://github.com/maxgfr/skycmd
- Pre-registro: https://github.com/maxgfr/skycmd/blob/main/docs/s6-cast-prereg.md
- Especificación: https://github.com/maxgfr/skycmd/blob/main/docs/SPEC-S6-CAST.md
- Informe de la ejecución: https://github.com/maxgfr/skycmd/blob/main/docs/big-run-report.md
- Resultados completos (incluidos fallos): https://maxgfr.github.io/skycmd/results/
- Benchmarks: https://github.com/maxgfr/skycmd/blob/main/BENCH.md#s6-cast-pico-probabilistic-forecasting-pre-registered-gate-failed
