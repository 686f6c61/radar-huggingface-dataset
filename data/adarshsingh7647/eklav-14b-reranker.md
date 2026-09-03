# AdarshSingh7647/Eklav-14B-Reranker

## Resumen

Eklav-14B-Reranker es un modelo de reranking pointwise desarrollado por AdarshSingh7647, construido sobre la base de Qwen/Qwen3-14B. Su principal innovación es el método de entrenamiento Eklav, que condiciona el aprendizaje del estudiante a un trazo de razonamiento parcial del profesor, en lugar de imitar la cadena de pensamiento completa. Esto permite al modelo continuar el razonamiento por sí mismo y producir la respuesta, logrando una mejora del 7% en BRIGHT (nDCG@10) frente a la destilación estándar de CoT con el mismo modelo base y datos, y reduciendo un 24% los FLOPs de entrenamiento.

El modelo está diseñado específicamente para tareas de reranking de pasajes en sistemas de recuperación aumentada por generación (RAG) y búsqueda. Genera su propio razonamiento y puntúa la relevancia a partir de los logits del token final ("true" o "false"), siguiendo el estilo de Rank1. Con 14.768 millones de parámetros y un checkpoint fusionado en bf16, es un modelo de tamaño medio-grande que requiere recursos de GPU considerables para inferencia.

Su relevancia actual radica en que aborda un problema práctico en pipelines de RAG: mejorar la precisión de la recuperación sin incurrir en el coste computacional de los métodos de reranking basados en LLM de gran escala. Al ser un modelo abierto con pesos disponibles en HuggingFace, permite su integración en entornos de producción con vLLM u otros servidores de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-14B base) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso configura max_model_len=20000) |
| Tipos de cuantizacion | no disponible (checkpoint bf16; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible (heredados del base Qwen3, no especificados) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B, un transformer denso con atención estándar y capacidad de razonamiento (thinking mode). El entrenamiento utiliza el método Eklav, una variante de destilación de cadena de pensamiento (CoT) condicionada a pistas: el estudiante recibe un trazo de razonamiento parcial del profesor, con la parte final de la respuesta eliminada, y debe continuar razonando y producir la respuesta por sí mismo. A diferencia de la destilación completa, el modelo no se entrena para reproducir el trazo palabra por palabra, sino que su propio razonamiento se condiciona al trazo parcial durante el entrenamiento.

No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El checkpoint está fusionado y en formato bf16, listo para inferencia. En inferencia no se utiliza ninguna pista del profesor, ya que una consulta real no dispone de trazo de referencia; el modelo razona de forma autónoma a partir del prompt.

## Capacidades

- Reranking pointwise de pasajes: genera un razonamiento propio y puntúa la relevancia mediante los logits del token final ("true" o "false"), sin depender de la generación de texto.
- Razonamiento de cadena de pensamiento: activa el modo thinking de Qwen3 para producir justificaciones internas antes de la decisión de relevancia.
- Clasificación binaria de relevancia: puede usarse para filtrar o ordenar documentos según su pertinencia a una consulta.
- Integración con vLLM: el ejemplo oficial muestra uso con vLLM, aprovechando logprobs y stop strings para extraer la puntuación.
- Multilingüismo: no documentado específicamente, pero hereda las capacidades del base Qwen3 (no confirmado).
- Sin soporte de tool calling, visión ni audio: es un modelo puramente textual para tareas de reranking.

## Casos de uso

- Mejora de pipelines RAG: tras una recuperación inicial con un retriever denso o BM25, Eklav-14B-Reranker reordena los pasajes candidatos para que el generador reciba solo los más relevantes, reduciendo alucinaciones y mejorando la calidad de las respuestas.
- Búsqueda semántica en dominios especializados: en bases de conocimiento técnicas o científicas, el modelo puede puntuar pasajes con razonamiento explícito, superando a los rerankers basados en embeddings cuando la relevancia requiere inferencia.
- Filtrado de resultados en motores de búsqueda internos: empresas con grandes volúmenes de documentos pueden usar el modelo como segunda etapa de ranking para mostrar solo resultados pertinentes, aprovechando su capacidad de razonamiento para consultas ambiguas.
- Evaluación de relevancia en datasets de IR: investigadores pueden emplear el modelo para generar juicios de relevancia automáticos o para validar anotaciones humanas en colecciones como BRIGHT o NevIR.
- Sistemas de preguntas y respuestas de dominio abierto: al combinar el reranker con un LLM generativo, se puede construir un sistema que seleccione pasajes de una base amplia y luego sintetice la respuesta, mejorando la precisión en tareas de QA.
- Asistentes de documentación técnica: en entornos de soporte, el modelo puede ordenar fragmentos de manuales o foros según su utilidad para una consulta concreta, reduciendo el tiempo de búsqueda del usuario.

## Benchmarks y rendimiento

Según la model card, el modelo reporta un promedio de 34.7 nDCG@10 en BRIGHT (12 dominios), con una mejora del 7% frente a la destilación estándar de CoT SFT con el mismo base y datos. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K) ni comparaciones con otros rerankers en la información disponible.

| Benchmark | Metrica | Resultado |
|---|---|---|
| BRIGHT (promedio 12 dominios) | nDCG@10 | 34.7 |
| Mejora vs. CoT SFT estandar | nDCG@10 | +7% |
| Reduccion de FLOPs de entrenamiento | - | -24% |

## Requisitos de hardware

- VRAM estimada: el checkpoint bf16 ocupa aproximadamente 29.5 GB, por lo que se necesitan al menos 32 GB de VRAM para inferencia sin cuantización. Con cuantización de 8 bits podría caber en 16-20 GB, y en 4 bits en 10-12 GB (no publicada oficialmente).
- GPU recomendadas: A100 40GB, A100 80GB, H100, o RTX 4090 (24GB) con cuantización. No cabe en GPUs de consumo de 8-12 GB sin cuantización agresiva.
- Despliegue: compatible con vLLM (usado en el ejemplo oficial), TGI, y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no disponibles actualmente).
- Latencia y throughput: no se han publicado datos. Al ser un modelo de 14B con generación de razonamiento, la latencia por consulta será del orden de cientos de milisegundos a segundos en GPUs de datacenter, dependiendo de la longitud del razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | BRIGHT nDCG@10 | Licencia |
|---|---|---|---|---|---|
| Eklav-14B-Reranker | 14.8B | no disponible | Eklav (hint conditioned SFT) | 34.7 | no disponible |
| Rank1-7B (jhu-clsp/rank1-7b) | 7B | no disponible | Generate-then-score | no disponible | no disponible |
| Qwen3-14B (base) | 14.8B | 32k (tipico) | Sin fine-tuning | no aplicable | Apache 2.0 (base) |

Eklav-14B-Reranker comparte el estilo de Rank1 (puntuación por logits tras razonamiento), pero con mayor tamaño y el método de entrenamiento Eklav. Frente al base Qwen3-14B, el fine-tuning lo especializa en reranking, aunque pierde la versatilidad general del modelo original. No se dispone de comparaciones directas con otros rerankers como bge-reranker-v2-m3 o Cohere Rerank en los datos proporcionados.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo fine-tuneado, lo que genera incertidumbre sobre su uso comercial. El base Qwen3-14B es Apache 2.0, pero el checkpoint derivado puede tener restricciones adicionales.
- Sesgos y alucinaciones: al ser un modelo de razonamiento, puede generar justificaciones plausibles pero incorrectas, afectando a la puntuación de relevancia en dominios donde no ha sido entrenado.
- Contexto limitado: no se documenta la longitud de contexto nativa; el ejemplo usa 20k tokens, pero el rendimiento con contextos más largos no está verificado.
- Idiomas no especificados: aunque Qwen3 soporta múltiples idiomas, no hay garantía de que el fine-tuning mantenga el rendimiento en todos ellos.
- Dependencia de la generación de razonamiento: la puntuación depende de que el modelo genere el token "true" o "false" correctamente; si el razonamiento se desvía, la puntuación puede ser poco fiable.
- Sin cuantizaciones oficiales: no se ofrecen versiones GGUF o AWQ, lo que limita el despliegue en entornos con recursos reducidos.
- Datos de entrenamiento no publicados: no se detalla la composición del dataset, lo que dificulta evaluar posibles sesgos o cobertura de dominios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdarshSingh7647/Eklav-14B-Reranker
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Rank1-7B (referencia de estilo): https://huggingface.co/jhu-clsp/rank1-7b
- Otro trabajo del autor (TabRankMultiTableCoTGen): https://huggingface.co/AdarshSingh7647/TabRankMultiTableCoTGen
