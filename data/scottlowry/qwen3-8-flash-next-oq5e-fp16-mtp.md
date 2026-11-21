# scottlowry/Qwen3.8-Flash-Next-oQ5e-fp16-mtp

## Resumen

Qwen3.8-Flash-Next-oQ5e-fp16-mtp es una cuantización mixta de precisión del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario scottlowry. El checkpoint está pensado para su uso con MLX, el framework de Apple para ejecutar modelos en silicio de la serie M, y combina distintos formatos de almacenamiento (afín de 5 y 8 bits, FP16, FP32) para reducir el peso total a 121,43 GiB manteniendo una media efectiva de 5,795 bits por peso sobre los 180.000 millones de parámetros del checkpoint completo.

El modelo base incorpora un cabezal de predicción multi-token (MTP), una tabla de embeddings N-gram de gran tamaño (51.200 millones de parámetros lógicos) y un módulo de visión de 0,449 mil millones de parámetros, según el desglose de almacenamiento publicado. La cuantización se ha realizado con oMLX v0.7.4.dev1, la herramienta oQ del autor jundot, que permite asignar precisión distinta a cada tensor según su sensibilidad. El resultado es un artefacto de 130,4 GB de repositorio que ocupa 121,43 GiB en disco.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de cuantización mixta sobre un modelo de 180.000 millones de parámetros orientado a inferencia local en hardware Apple; por otro, sirve de referencia sobre qué información publica (y cuál no) un checkpoint derivado de un modelo base del que no se incluyen especificaciones originales en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabezal MTP y embeddings N-gram (según desglose de almacenamiento); detalles del modelo base no disponibles |
| Parametros totales | 179.999.981.459 (180.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín 5 bits grupo 64, afín 8 bits grupo 128, afín 8 bits grupo 64, N-gram afín 5 bits grupo 32, FP16, FP32, I64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización mixta; media efectiva 5,795 bits/peso |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo Qwen/Qwen3.8-Flash-Next, no un modelo entrenado desde cero. La model card del autor no describe el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), por lo que esos datos no están disponibles en la información proporcionada. Lo que sí se detalla es la estructura de almacenamiento del checkpoint cuantizado: 125.744 millones de parámetros lógicos en el modelo de lenguaje (88,358 GB), 51.200 millones en la tabla de embeddings N-gram (38,400 GB), 0,449 millones en el módulo de visión (1,796 GB) y 2,607 millones en el cabezal MTP (1,827 GB).

La innovación técnica principal de esta publicación es la cuantización mixta de precisión. El 68,507% de los pesos lógicos se almacena en afín de 5 bits con grupo de 64 (5,50 bits efectivos), mientras que la tabla N-gram usa afín de 5 bits con grupo de 32 (6,00 bits efectivos) y un 2,628% de los pesos se mantiene en afín de 8 bits grupo 64 (8,50 bits efectivos). Los tensores más sensibles (0,037% en FP16 y 0,249% en FP32) conservan precisión completa. El cabezal MTP, que permite decodificación especulativa multi-token, se conserva como componente separado dentro del checkpoint.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.8-Flash-Next; el nivel concreto no está documentado en la model card.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,449 mil millones de parámetros, lo que indica soporte multimodal de entrada de imágenes.
- Decodificación especulativa multi-token: el cabezal MTP de 2,607 mil millones de parámetros permite predecir varios tokens por paso, lo que puede aumentar el throughput en inferencia.
- Embeddings N-gram de gran tamaño: la tabla de 51.200 millones de parámetros lógicos sugiere un mecanismo de recuperación léxica o memorización que no está detallado en la información disponible.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización mixta están diseñados para ejecutarse en Macs con memoria unificada; un equipo con 128 GB o más podría cargar el checkpoint completo (121,43 GiB) y realizar inferencia sin GPU dedicada.
- Investigación sobre cuantización mixta: el desglose por componente y bits efectivos permite estudiar el impacto de asignar distinta precisión a embeddings, cabezal MTP y capas del transformer, comparando con otras recetas de cuantización.
- Evaluación de decodificación especulativa: al conservar el cabezal MTP en el checkpoint, se puede medir la ganancia de throughput de la predicción multi-token frente a la decodificación autoregresiva estándar en MLX.
- Prototipado multimodal: el módulo de visión incluido permite experimentar con tareas imagen-texto en local, siempre que se validen las capacidades reales del modelo base.
- Reproducción de pipelines de cuantización: el checkpoint sirve como referencia para validar la herramienta oMLX v0.7.4.dev1 y comparar la distribución de bits con otras configuraciones (por ejemplo, 4 bits o 6 bits).
- Despliegue de un modelo de 180.000 millones de parámetros en un solo equipo: la reducción a 121,43 GiB hace viable ejecutar un modelo de este tamaño en estaciones de trabajo con memoria unificada alta, algo imposible con los pesos en FP16 (que ocuparían aproximadamente 360 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 121,43 GiB para los pesos; se necesita margen adicional para caché KV y activaciones, por lo que se recomienda un equipo con al menos 128 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada alta (M2 Ultra, M3 Ultra o M4 Max con 128 GB o más). No está pensado para GPUs NVIDIA por el formato MLX.
- ¿Cabe en GPU de consumo? No en GPUs de consumo convencionales de 24 GB o 48 GB. Solo es viable en configuraciones Apple con 128 GB o más de memoria unificada.
- Opciones de despliegue: MLX (librería nativa del checkpoint) y herramientas compatibles con MLX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El cabezal MTP puede mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ5e-fp16-mtp (este) | 180.000 M | no disponible | Mixta 5/8 bits + FP16/FP32 | no disponible | MLX safetensors |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | Original (precisión completa) | no disponible | no disponible |
| Alternativas de 180.000 M en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base ni del proceso de cuantización.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas para este checkpoint.
- La cuantización mixta puede degradar la calidad respecto al modelo base en tareas sensibles a la precisión numérica; no se aportan métricas de degradación.
- La tabla N-gram de 51.200 millones de parámetros lógicos, almacenada a 6,00 bits efectivos, podría comportarse de forma distinta a la versión original; no se detalla su función exacta.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible consultar la licencia del modelo base Qwen/Qwen3.8-Flash-Next antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Compatibilidad limitada a MLX: no hay evidencia de que el checkpoint funcione en otros runtimes sin reconversión.
- El checkpoint se actualizó el 2026-11-11 con oMLX v0.7.4.dev1; versiones anteriores pueden tener distribuciones de bits distintas y conviene volver a descargarlo.
- El repositorio ocupa 130,4 GB, lo que exige espacio en disco considerable y tiempos de descarga largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-Flash-Next-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
