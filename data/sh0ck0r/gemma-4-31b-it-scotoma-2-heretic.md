# sh0ck0r/gemma-4-31B-it-scotoma-2-heretic

## Resumen

`sh0ck0r/gemma-4-31B-it-scotoma-2-heretic` es un ajuste fino (finetune) del modelo `ReadyArt/gemma-4-31B-it-scotoma-2`, que a su vez deriva de la familia Gemma 4 de Google en su variante de 31B instruida. El modelo ha sido procesado con la herramienta Heretic v2.1.0, una técnica de "ablación" (ablation) que modifica selectivamente los pesos para reducir la tasa de rechazos (refusals) ante peticiones que el modelo original rechazaría. El autor lo etiqueta como "decensored", "uncensored" y "abliterated".

La relevancia de este modelo radica en su enfoque reproducible: el autor incluye el directorio `reproduce` con la configuración exacta de Heretic (parámetros ARA: Arbitrary-Rank Ablation) para que terceros puedan replicar el proceso. Según la model card, la tasa de rechazos baja de 92/100 en el modelo original a 21/100 en esta versión, con una divergencia KL de 0,3086 respecto al original, lo que indica un cambio moderado en la distribución de salidas.

El modelo tiene 31.273.086.512 parámetros (aproximadamente 31,3B), se distribuye en formato safetensors con un tamaño de repositorio de 62,6 GB y está pensado para generación de texto e image-text-to-text según los tags de Hugging Face. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google, lo que introduce una ambigüedad que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), según tags del repo; detalles de capas y atención no disponibles |
| Parametros totales | 31.273.086.512 (31,3B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con license_link a los términos de Gemma 4 de Google) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 4 en su variante de 31B instruida, un transformer decoder-only. El modelo base intermedio es `ReadyArt/gemma-4-31B-it-scotoma-2`, sobre el que se aplica un proceso de modificación de pesos con Heretic v2.1.0. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en las etapas previas; la model card no detalla esos aspectos.

La innovación técnica destacable es la aplicación de Arbitrary-Rank Ablation (ARA) con los siguientes parámetros: `start_layer_index` 30, `end_layer_index` 47, `preserve_good_behavior_weight` 0,4138, `steer_bad_behavior_weight` 0,0510, `overcorrect_relative_weight` 0,6492 y `neighbor_count` 12. Este método interviene en las capas 30 a 47 del modelo para preservar el comportamiento deseado y redirigir el comportamiento no deseado (rechazos), con un peso de sobrecorrección relativo de 0,6492. El resultado es una reducción de rechazos de 92/100 a 21/100 con una divergencia KL de 0,3086, lo que sugiere que el modelo conserva buena parte de su distribución original pero con menor tendencia a negarse a responder.

## Capacidades

- Generación de texto conversacional en formato instruido (chat), heredada de la variante `-it` de Gemma 4.
- Procesamiento image-text-to-text según los tags del repositorio, lo que implica capacidad multimodal de entrada (imagen y texto) aunque no se detallan los detalles.
- Reducción significativa de rechazos: responde a un 79% de peticiones que el modelo original rechazaba (21/100 rechazos frente a 92/100).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo varía la tasa de rechazos y la divergencia KL al aplicar técnicas de ablación, sirviendo como caso de estudio reproducible gracias al directorio `reproduce`.
- Evaluación de robustez de filtros de seguridad: comparar las respuestas del modelo original y de esta versión permite medir la eficacia de las salvaguardas y diseñar mejores clasificadores de contenido.
- Generación creativa sin restricciones excesivas: para escritura de ficción, guiones o narrativa que requiera tratar temas sensibles sin que el modelo se niegue sistemáticamente, aprovechando la reducción de rechazos.
- Análisis de sesgos y comportamiento: al modificar las capas 30-47, se puede investigar qué representaciones internas se asocian con la negativa a responder y cómo afecta a otros comportamientos.
- Desarrollo de pipelines de generación de texto con transformers: al estar en formato safetensors y ser compatible con la librería transformers, se puede integrar en flujos existentes de generación y evaluación.
- Docencia y divulgación técnica: como ejemplo práctico de técnicas de ablación de pesos y de reproducibilidad en modelos abiertos, con parámetros ARA documentados y verificables.

## Benchmarks y rendimiento

La model card proporciona dos métricas comparativas respecto al modelo original:

| Métrica | Este modelo | Modelo original (ReadyArt/gemma-4-31B-it-scotoma-2) |
|---|---|---|
| Rechazos (refusals) | 21/100 | 92/100 |
| Divergencia KL | 0,3086 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,3B parámetros en safetensors (62,6 GB de repositorio), la inferencia en precisión completa (fp16/bf16) requiere aproximadamente 62 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: para fp16/bf16 se necesitan GPUs de数据中心 como A100 80GB, H100 80GB o múltiples GPUs. No cabe en una sola RTX 4090 (24 GB) en precisión completa.
- Si cabe en consumer GPU: no en fp16. Sería necesario cuantizar a 4 bits (aproximadamente 16-18 GB) para intentar encajarlo en una RTX 4090 o RTX 3090, aunque no se distribuyen pesos GGUF oficialmente en el repositorio.
- Opciones de despliegue: transformers (safetensors) es el formato disponible. vLLM, llama.cpp, Ollama o TGI no están confirmados en la información proporcionada, aunque transformers es compatible por defecto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| sh0ck0r/gemma-4-31B-it-scotoma-2-heretic | 31,3B | No disponible | Apache 2.0 | Gemma 4 31B con ablación (Heretic) |
| ReadyArt/gemma-4-31B-it-scotoma-2 | 31,3B (presumiblemente) | No disponible | No disponible | Modelo base intermedio, sin ablación |
| Gemma 4 31B it (original de Google) | 31B (presumiblemente) | No disponible | Términos Gemma | Modelo instruido original con salvaguardas |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada, más allá de la tasa de rechazos y la divergencia KL indicadas.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al ser un modelo derivado de Gemma 4, hereda los sesgos del modelo original, potencialmente amplificados o alterados por la ablación.
- Riesgo de alucinación: no cuantificado; la reducción de rechazos puede aumentar la probabilidad de respuestas plausibles pero incorrectas en temas sensibles.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar un comportamiento multilingüe o de contexto largo.
- Restricciones de licencia: aunque se declara Apache 2.0, el `license_link` apunta a los términos de Gemma 4 de Google, que pueden imponer restricciones adicionales al uso comercial; es necesario revisar ambos documentos antes de desplegar en producción.
- Caveat para producción: el modelo está diseñado explícitamente para reducir negativas, lo que puede ser inadecuado en aplicaciones donde se requieran salvaguardas estrictas (atención al cliente, contenido para menores, etc.). La divergencia KL de 0,3086 indica un cambio no trivial en la distribución de salidas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/sh0ck0r/gemma-4-31B-it-scotoma-2-heretic
- Modelo base: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Heretic (proyecto): https://heretic-project.org
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Directorio de reproducción: `reproduce/README.md` dentro del repositorio de Hugging Face
