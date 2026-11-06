# metacognitive-behavioral-tuning/Qwen3.5-4B-Unedited-SFT

## Resumen

Qwen3.5-4B-Unedited-SFT es un ajuste fino supervisado de Qwen/Qwen3.5-4B-Base, publicado por el colectivo de investigación metacognitive-behavioral-tuning. El modelo forma parte de un conjunto de cuatro variantes (Unedited-SFT, MBT-R, MBT-I y MBT-A) que acompañan al artículo "Distilling Metacognitive Behaviors through Agentic Editing", actualmente en revisión anónima. Su particularidad es que se ha entrenado con las trazas de razonamiento de un modelo profesor tal cual se generaron, sin edición posterior, lo que lo convierte en la línea base contra la que se comparan las variantes con edición agéntica.

El modelo cuenta con 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) en precisión bf16 y un tamaño de repositorio de 9,1 GB. La arquitectura es la del transformer denso de la familia Qwen3.5, con soporte para entradas de imagen y texto (pipeline image-text-to-text), aunque la model card se centra en generación de texto y razonamiento. La longitud de contexto declarada en el entrenamiento alcanza los 131.072 tokens, y el ejemplo de uso de la model card recomienda hasta 122.880 tokens de generación, lo que refleja un diseño orientado a cadenas de razonamiento muy largas.

Su relevancia actual es metodológica: sirve para estudiar cómo la edición de trazas de razonamiento (reescritura, inserción o edición agéntica) afecta a la destilación de comportamientos metacognitivos en modelos pequeños. La licencia Apache-2.0 y el ecosistema transformers/vLLM facilitan su reproducción y su uso como referencia en experimentos de razonamiento y matemáticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base, un transformer denso de la familia Qwen3.5 con capacidades multimodales de entrada (image-text-to-text). El ajuste fino es supervisado a parámetros completos (full-parameter SFT), con la función de pérdida calculada únicamente sobre los tokens del asistente. Se entrenó durante 15 épocas con el optimizador Muon (implementación de Megatron), tasa de aprendizaje 1e-5, weight decay 0, schedule constante con 40 pasos de calentamiento, batch global de 64 secuencias (8 GPUs x 8 pasos de acumulación) y empaquetado sin padding (padding-free packing). La longitud máxima de secuencia fue de 131.072 tokens, con autocast en bf16 y pesos maestros en fp32; la publicación final es en bf16.

Los datos de entrenamiento provienen del dataset metacognitive-behavioral-tuning/mbt-traces y consisten en las trazas de razonamiento del profesor generadas sin edición. La innovación del trabajo no está en la arquitectura, sino en el protocolo de destilación: comparar trazas sin editar frente a trazas reescritas (MBT-R), con inserciones (MBT-I) o editadas de forma agéntica (MBT-A) para inducir comportamientos metacognitivos. La plantilla de chat del modelo abre un bloque `<think>`, de modo que la salida generada es primero el razonamiento, después `</think>` y finalmente la respuesta.

## Capacidades

- Generación de texto conversacional con plantilla de chat basada en bloques `<think>`.
- Razonamiento paso a paso con cadenas de pensamiento extensas (hasta decenas de miles de tokens).
- Razonamiento matemático, incluyendo problemas que requieren respuesta final en formato `\boxed{}`.
- Capacidad multimodal de entrada imagen-texto heredada del modelo base Qwen3.5 (pipeline image-text-to-text).
- Comportamientos metacognitivos inducidos por destilación de trazas del profesor (autorreflexión y revisión del razonamiento).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el trabajo se enmarca en edición agéntica de trazas, pero no se detallan capacidades de agencia en inferencia.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Investigación en destilación de razonamiento: usar esta variante como línea base "sin editar" para medir el efecto de las técnicas MBT-R, MBT-I y MBT-A sobre las mismas trazas del profesor, controlando el resto de variables de entrenamiento.
- Reproducción de experimentos académicos: el modelo permite replicar el pipeline completo (dataset mbt-traces, código en GitHub y configuración de entrenamiento documentada) en entornos con 8 GPUs.
- Evaluación de metacognición en modelos pequeños: analizar si un modelo de 4,5B parámetros expone autorreflexión y revisión de errores en sus cadenas de razonamiento, comparando con las variantes editadas.
- Generación de soluciones matemáticas con razonamiento largo: el prompt recomendado ("Please reason step by step, and put your final answer within \boxed{}") y la ventana de 131k tokens permiten resolver problemas que requieren derivaciones extensas.
- Fine-tuning posterior como punto de partida: al ser un SFT completo sobre la base, puede servir de inicialización para experimentos de RLHF/DPO o para adaptaciones a dominios específicos en inglés.
- Estudio de estabilidad de trazas largas: con 15 épocas sobre trazas sin editar, es útil para analizar degradación, repetición o deriva en cadenas de decenas de miles de tokens.
- Docencia y divulgación técnica: ejemplo didáctico de cómo se documenta un SFT completo con Muon, empaquetado sin padding y pérdida solo en tokens del asistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos (4,54B parámetros x 2 bytes), más overhead de KV cache; con contexto de 131k tokens la KV cache puede superar con creces el tamaño de los pesos.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB (estimaciones teóricas, no verificadas porque el autor no publica variantes cuantizadas).
- GPU recomendadas para bf16 con contexto largo: A100 80 GB, H100 80 GB o múltiples GPUs; el ejemplo del autor usa vLLM y el entrenamiento se hizo con 8 GPUs.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 para contextos moderados; en RTX 3090/4080 (16-24 GB) es viable con cuantización. Para contextos de decenas de miles de tokens se requiere más memoria por la KV cache.
- Opciones de despliegue: vLLM (documentado por el autor), transformers; llama.cpp, Ollama y TGI no están documentados para este modelo.
- Latencia y throughput: no disponibles. El autor advierte que las respuestas largas son habituales y recomienda reservar espacio para decenas de miles de tokens, lo que implica latencias altas en generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Unedited-SFT | 4,54B | 131.072 | Apache-2.0 | Hugging Face (192 descargas) | SFT completo sobre trazas sin editar |
| Qwen3.5-4B-MBT-R | No disponible | No disponible | Apache-2.0 (según base) | Hugging Face | Misma base, trazas reescritas |
| Qwen3.5-4B-MBT-I | No disponible | No disponible | Apache-2.0 (según base) | Hugging Face | Misma base, trazas con inserción |
| Qwen3.5-4B-MBT-A | No disponible | No disponible | Apache-2.0 (según base) | Hugging Face | Misma base, edición agéntica |
| Qwen/Qwen3.5-4B-Base | No disponible | No disponible | Apache-2.0 | Hugging Face | Modelo base sin ajuste |

No se dispone de datos de benchmarks ni de comparaciones con modelos de otras familias (por ejemplo, Llama o Gemma de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Al ser un SFT sobre trazas sin editar, puede heredar errores, atajos o patrones del profesor, incluidos razonamientos incorrectos o inconsistentes.
- Riesgo de alucinación en matemáticas y razonamiento: no hay benchmarks publicados que cuantifiquen su fiabilidad.
- Las respuestas muy largas (decenas de miles de tokens) complican el despliegue en producción por latencia, coste y gestión de KV cache.
- No se documentan capacidades de tool calling ni de agencia en inferencia, pese a la orientación del artículo a la edición agéntica de trazas.
- El modelo está vinculado a un artículo anónimo en revisión; los resultados y la metodología pueden cambiar tras la revisión por pares.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento son CC BY-SA 4.0 y requieren atribución según la dataset card; conviene revisar las condiciones de los datos upstream antes de un uso comercial.
- No hay variantes cuantizadas oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo sin conversión manual.
- Con solo 192 descargas y 0 likes, la comunidad de validación es mínima; no hay evidencia de terceros sobre su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-Unedited-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset de trazas: https://huggingface.co/datasets/metacognitive-behavioral-tuning/mbt-traces
- Variante MBT-R: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-R
- Variante MBT-I: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-I
- Variante MBT-A: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-A
- Código y prompts: https://github.com/metacognitive-behavioral-tuning/metacognitive-behavioral-tuning
- Artículo "Distilling Metacognitive Behaviors through Agentic Editing": no disponible (envío anónimo en revisión)
