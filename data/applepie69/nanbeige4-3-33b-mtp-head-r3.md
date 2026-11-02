# applepie69/Nanbeige4.3-33B-MTP-head-r3

## Resumen

Nanbeige4.3-33B-MTP-head-r3 es una cabeza de predicción multi-token (MTP, multi-token prediction) de profundidad 1, al estilo de DeepSeek, entrenada para acoplarse al modelo base Nanbeige4.3-33B. La publica el usuario applepie69 como repositorio de staging (ronda 3) y no es un modelo completo, sino un componente auxiliar de unos 1,4 GB en bf16 que se carga junto al modelo base para acelerar la decodificación especulativa. Su función es predecir el siguiente token adicional en paralelo al modelo principal, lo que permite aceptar varios tokens por paso de verificación y reducir la latencia de generación.

La ronda 3 se ha reentrenado con una mezcla de datos orientada a uso agéntico y a código multilingüe: un 28 % de datos de tool calling, un 39 % de código en 13 lenguajes, un 15 % de matemáticas, un 12 % de datos generales y un 6 % de chino. Según la model card, la cabeza parte de la versión anterior (la del repositorio 1101, validada con el benchmark v7) y añade 6 épocas extra con un LR máximo de 7e-5 sobre 680.960 filas de entrenamiento empaquetadas.

Es relevante ahora porque la decodificación especulativa con cabezas MTP es una de las vías más baratas para acelerar inferencia sin cambiar el modelo base ni requerir un modelo draft separado. La ficha describe únicamente la cabeza y sus métricas; los datos del modelo base Nanbeige4.3-33B no están incluidos en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP de profundidad 1, estilo DeepSeek, acoplada a un transformer base (Nanbeige4.3-33B) |
| Parametros totales | No disponible (el repo de la cabeza pesa 1,4 GB en bf16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible en la model card; el mix de entrenamiento incluye chino (6 %) y código en 13 lenguajes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, layout de claves DeepSeek, `model.layers.52.*`) |

## Arquitectura y entrenamiento

La cabeza es una MTP de profundidad 1 con layout de claves compatible con DeepSeek (`model.layers.52.*`), pensada para predecir el token siguiente a la posición que predice el modelo base. Se inicializa desde la cabeza del repositorio `applepie69/Nanbeige4.3-33B-MTP-1101` (la validada con el benchmark v7) y se reentrena durante 6 épocas adicionales con AdamW8bit, LR máximo de 7e-5 y checkpointing best-by-top1. El conjunto de entrenamiento consta de 680.960 filas empaquetadas y mezcla datos agénticos de tool calling (hermes-fc-v1, glaive-fc-v2, function-calling-chatml; 28 %), código en 13 lenguajes (CodeFeedback rebalanceado por lenguaje, glaive-code-assistant-v3, self-oss-instruct; 39 %), matemáticas (15 %), datos generales (12 %) y chino (6 %).

La innovación técnica es la propia decodificación especulativa: la cabeza propone tokens que el modelo base verifica en un solo paso, de modo que la aceptación greedy determina la ganancia de velocidad. En la evaluación held-out de 25.575 posiciones, la cabeza de ronda 3 alcanza un 55,50 % de acuerdo top-1 (frente al 50,12 % de la ronda 1), un 72,44 % de top-3 que contiene al top-1 (frente al 69,80 %) y una aceptación greedy de profundidad 1 del 45,81 % (referencia teacher-forced de la ronda 1: 44,6 %). La KL frente al modelo base sube de 1,782 a 1,896, divergencia esperada al especializarse en el nuevo mix. La promoción al repositorio definitivo exige que el benchmark v8 muestre una aceleración global de al menos 1,01x, al menos 1,02x en matemáticas y una identidad greedy de al menos el 80 %.

## Capacidades

- Predicción multi-token de profundidad 1 para decodificación especulativa sobre Nanbeige4.3-33B.
- Mejora del acuerdo top-1 y top-3 respecto a la ronda 1 en posiciones held-out.
- Entrenamiento específico para tool calling y function calling (28 % del mix), lo que debería favorecer la aceptación en flujos agénticos.
- Cobertura de código en 13 lenguajes (python, js, c++, java, c, go, rust, sql, ts, php, kotlin, swift, ruby) en el mix de entrenamiento.
- Refuerzo en matemáticas (15 % del mix) orientado a la puerta de promoción de al menos 1,02x en esa categoría.
- Soporte de chino en el mix de entrenamiento (6 %).
- No es un modelo autónomo: no genera texto por sí misma sin el modelo base y el cargador `mtp_head.py`.

## Casos de uso

- Aceleración de inferencia en producción: cargar la cabeza junto a Nanbeige4.3-33B para reducir la latencia por token mediante verificación especulativa, siempre que el benchmark v8 confirme la ganancia mínima de 1,01x exigida por la puerta de promoción.
- Servicio de agentes con tool calling: el mix del 28 % en datos de function calling busca elevar la tasa de aceptación en turnos con llamadas a herramientas, donde la distribución de tokens difiere de la conversación general.
- Asistentes de código: el 39 % de datos en 13 lenguajes apunta a mejorar la aceptación en generación de código multilingüe, útil en IDE y pipelines de revisión automática.
- Razonamiento matemático asistido: el 15 % de matemáticas y el umbral específico de 1,02x en el benchmark v8 indican un objetivo de aceleración en cadenas de cálculo paso a paso.
- Investigación en decodificación especulativa: el repositorio incluye `test_results.json` con el volcado completo de evaluación, útil para reproducir y comparar tasas de aceptación entre rondas.
- Evaluación comparativa de cabezas MTP: al ser un repo de staging con métricas held-out publicadas, sirve para estudiar el compromiso entre divergencia KL y tasa de aceptación antes de promover una cabeza a producción.
- Despliegue en entornos con presupuesto de VRAM ajustado: una cabeza de 1,4 GB en bf16 añade poca memoria frente a un modelo draft independiente del mismo orden de magnitud que el base.

## Benchmarks y rendimiento

| Metrica (25.575 posiciones held-out) | Cabeza ronda 1 | Cabeza ronda 3 |
|---|---:|---:|
| Acuerdo top-1 | 50,12 % | 55,50 % |
| Top-3 contiene al top-1 | 69,80 % | 72,44 % |
| KL (cabeza vs base) | 1,782 | 1,896 |
| Aceptación greedy profundidad 1 | 44,6 % (referencia teacher-forced) | 45,81 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras de aceleración extremo a extremo del kernel `nanbeige-mtp-speed-test` v8 no están incluidas en la model card.

## Requisitos de hardware

- VRAM de la cabeza: aproximadamente 1,4 GB en bf16, adicionales a la memoria que requiera el modelo base Nanbeige4.3-33B.
- VRAM del conjunto: no disponible para el modelo base; el requisito total depende de su tamaño (33B nominal) y de la cuantización empleada.
- GPU recomendadas: no disponibles en la información proporcionada; para el base de 33B se necesitarán, en general, GPUs de centro de datos (A100, H100) o consumer de gama alta con cuantización.
- Cabe en GPU consumer: la cabeza sí; el conjunto depende enteramente del modelo base.
- Opciones de despliegue: transformers (librería declarada) con el cargador `mtp_head.py`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la puerta de promoción exige una aceleración global de al menos 1,01x y de 1,02x en matemáticas frente al benchmark v7.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MTP-head-r3 | Cabeza MTP profundidad 1 | No disponible (1,4 GB bf16) | No disponible | Apache 2.0 | Staging, 0 descargas |
| Nanbeige4.3-33B-MTP-1101 | Cabeza MTP profundidad 1 (ronda previa) | No disponible | No disponible | Apache 2.0 | Repositorio de referencia promovido |
| Cabeza MTP de DeepSeek (referencia de diseño) | MTP multi-token | No disponible | No disponible | No disponible | Arquitectura inspiradora del layout de claves |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Nanbeige4.3-33B y el cargador `mtp_head.py`; no puede usarse de forma independiente.
- Repositorio de staging: la cabeza no ha sido promovida al repositorio definitivo y su promoción depende de superar el benchmark v8 (al menos 1,01x global, 1,02x en matemáticas, identidad greedy de al menos 80 %).
- Divergencia creciente respecto al base: la KL sube de 1,782 a 1,896, lo que puede aumentar la tasa de rechazo en dominios alejados del mix de entrenamiento.
- Tasa de aceptación moderada: un 45,81 % de aceptación greedy implica que más de la mitad de las propuestas se descartan, limitando la ganancia práctica de velocidad.
- Sesgos: el mix incluye un 6 % de chino y un 28 % de datos agénticos, pero no se documentan evaluaciones de sesgo ni de seguridad.
- Riesgo de alucinación: no evaluado en la información disponible; la cabeza no genera contenido propio, pero puede alterar la distribución de tokens aceptados.
- Idiomas: no se declaran idiomas soportados más allá de la composición del mix de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar la licencia y las condiciones del modelo base Nanbeige4.3-33B.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/applepie69/Nanbeige4.3-33B-MTP-head-r3
- Repositorio base (ronda previa): https://huggingface.co/applepie69/Nanbeige4.3-33B-MTP-1101
- Kernel de benchmark citado: `nanbeige-mtp-speed-test` (v8) en Kaggle; no se proporciona URL directa.
