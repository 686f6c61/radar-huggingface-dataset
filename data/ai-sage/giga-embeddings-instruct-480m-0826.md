# ai-sage/Giga-Embeddings-instruct-480M-0826

## Resumen

Giga-Embeddings-instruct-480M-0826 es un modelo de embeddings textuales desarrollado por la organización ai-sage, diseñado para producir representaciones densas de frases y párrafos en ruso e inglés. Está basado en una arquitectura Qwen3 modificada: el self-attention se convierte en bidireccional (estilo encoder) para adaptarse a tareas de recuperación y similitud semántica. El modelo cuenta con aproximadamente 480 millones de parámetros, una dimensión de embedding de 1024 y se entrena con una función de pérdida contrastiva InfoNCE, lo que lo hace adecuado para retrieval, clasificación y clustering.

La relevancia actual de este modelo reside en su enfoque instructivo: para tareas asimétricas como recuperación de información, se debe añadir una instrucción al query mientras que los documentos se codifican tal cual, un patrón que ha demostrado mejorar el rendimiento en benchmarks como MTEB. Se distribuye con licencia MIT, lo que facilita su uso comercial y académico, y está disponible en el hub de Hugging Face con pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-style basado en Qwen3, self-attention bidireccional, 28 capas, hidden 1024, 16 cabezas de atención / 8 KV heads, head_dim 64, pooling medio + L2-normalización |
| Parametros totales | 483.617.632 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (pesos originales); cuantizaciones adicionales no documentadas |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura Qwen3 adaptada: la self-attention original, típicamente causal en modelos decoder, se ha transformado en bidireccional, lo que permite que cada token atienda a todo el contexto, similar a un encoder clásico. La configuración incluye 28 capas, una dimensión oculta de 1024, 16 cabezas de atención y 8 cabezas KV con head_dim 64. El pooling se realiza mediante la media de los embeddings de los tokens no padding, seguido de una normalización L2. La dimensión del embedding final es 1024.

El entrenamiento se llevó a cabo con una función de pérdida contrastiva InfoNCE, típica en modelos de embeddings. No se mencionan datos concretos sobre el volumen de tokens ni la composición del dataset de entrenamiento. Además, el modelo se entrena en un estilo "instructivo": para tareas asimétricas (retrieval), se debe anteponer una instrucción al query con el formato `Instruct: {descripción de la tarea}\nQuery: {texto}`, mientras que los documentos se codifican sin instrucción. No se indica el uso de técnicas de RLHF o DPO; el entrenamiento es puramente contrastivo.

## Capacidades

- Genera embeddings densos de 1024 dimensiones para frases y párrafos en ruso e inglés.
- Soporta tareas de recuperación (retrieval) con instrucciones: añade una descripción de la tarea al query para mejorar resultados.
- Adecuado para similitud semántica (STS), clasificación de texto y clustering.
- Presenta un rendimiento destacado en benchmarks MTEB para ruso e inglés (ver sección de benchmarks).
- No es un modelo generativo: no produce texto, solo vectores de representación.
- No tiene soporte para tool calling, agentes ni razonamiento multi-paso.
- La comparación entre embeddings se realiza mediante similitud coseno (producto escalar de vectores normalizados).

## Casos de uso

- **Búsqueda semántica en ruso e inglés**: dado un query, se añade la instrucción `Instruct: Given a query, retrieve relevant passages` y se calcula la similitud coseno con los embeddings de los documentos. Adecuado para motores de búsqueda internos o RAG.
- **Sistemas de pregunta-respuesta con recuperación**: en pipelines de RAG, el modelo indexa los documentos y recupera los pasajes más relevantes para una pregunta, mejorando la calidad de las respuestas generadas por un LLM.
- **Deduplicación de documentos**: para detectar textos duplicados o casi duplicados en corpus grandes, se generan embeddings y se comparan con umbrales de similitud coseno.
- **Clasificación de texto**: usando los embeddings como características de entrada para un clasificador supervisado (por ejemplo, regresión logística) se pueden clasificar documentos por categoría o tema.
- **Clustering de contenidos**: agrupar artículos, tickets o comentarios en temas similares mediante técnicas de clustering sobre los embeddings (K-means, HDBSCAN).
- **Búsqueda de código**: el modelo muestra resultados en MTEB (code), por lo que puede utilizarse para recuperar fragmentos de código a partir de consultas en lenguaje natural.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados en MTEB, comparados con otros modelos de embeddings:

| Benchmark | Giga-Embeddings-instruct-480M-0826 | Qwen3-Embedding-0.6B | EmbeddingGemma-300M | FRIDA-820M |
|:----------|:-----------------------------------:|:---------------------:|:-------------------:|:-----:|
| MTEB (rus, v1.1) | **70.98** | 63.64 | 64.02 | 70.95 |
| MTEB (eng, v2) | 69.52 | **70.70** | 69.67 | — |
| MTEB (code, v1) | 72.87 | **75.41** | 68.76 | — |
| MTEB (multilingual, v2) | 56.97 | **64.33** | 61.15 | — |

Los valores en negrita indican el mejor resultado por fila; los subrayados indican el segundo mejor. El modelo destaca en ruso y código, mientras que en inglés y multilingüe se queda por detrás de Qwen3-Embedding-0.6B. No hay datos sobre latencia o throughput.

## Requisitos de hardware

- **VRAM estimada**: con 483 millones de parámetros en bfloat16, el peso ocupa aproximadamente 0,97 GB. Para inferencia con secuencias de longitud típica (512-1024 tokens) se recomienda al menos 2 GB de VRAM para evitar cuellos de botella.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo NVIDIA RTX 3060, RTX 4060 o superiores. También puede ejecutarse en CPU para cargas bajas, aunque con mayor latencia.
- **Compatibilidad con consumer GPU**: sí, es un modelo relativamente pequeño y cabe en tarjetas de gama media y baja.
- **Opciones de despliegue**: se puede usar con `sentence-transformers` (incluye el código personalizado para la atención bidireccional), `transformers` (con pooling manual) y `vLLM` (según la model card, el pooling se maneja automáticamente). También se puede integrar en pipelines de inferencia con ONNX si se convierte, aunque no se proporcionan archivos ONNX.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con otras alternativas de la misma categoría (embeddings de texto de tamaño similar) según los datos disponibles en la model card:

| Modelo | Parámetros | Contexto | MTEB (rus) | MTEB (eng) | MTEB (code) | Licencia |
|---|---|---|---|---|---|---|
| Giga-Embeddings-instruct-480M-0826 | ~480M | no disponible | 70.98 | 69.52 | 72.87 | MIT |
| Qwen3-Embedding-0.6B | ~600M | no disponible | 63.64 | 70.70 | 75.41 | no disponible |
| EmbeddingGemma-300M | ~300M | no disponible | 64.02 | 69.67 | 68.76 | no disponible |
| FRIDA-820M | ~820M | no disponible | 70.95 | — | — | no disponible |

El modelo se posiciona como un competidor fuerte en ruso y código, aunque pierde en inglés frente a Qwen3-Embedding-0.6B. La licencia MIT es un punto a favor para uso comercial. No se dispone de información sobre contexto máximo, formatos de cuantización o requisitos de hardware para los modelos comparados.

## Limitaciones y advertencias

- **Idiomas**: solo cubre ruso e inglés; no está entrenado para otros idiomas, lo que limita su uso en entornos multilingües amplios.
- **Instrucción obligatoria**: para retrieval asimétrico es necesario añadir la instrucción al query; si no se hace, el rendimiento se degrada. No existe un prompt único válido para todas las tareas.
- **Pooling específico**: el modelo requiere mean pooling + L2 normalización; usar CLS o last-token pooling dará resultados incorrectos.
- **No es generativo**: no puede generar texto ni completar frases; solo produce embeddings.
- **Sesgos y alucinación**: no se han documentado sesgos específicos. Al ser un modelo de embeddings, no hay riesgo de alucinación textual, pero los vectores pueden reflejar sesgos presentes en los datos de entrenamiento.
- **Reproducibilidad**: pequeñas diferencias en versiones de `transformers` o `pytorch` pueden causar variaciones menores en los resultados.
- **Contexto**: no se ha documentado la longitud máxima de secuencia soportada; se recomienda validar con el propio modelo antes de desplegar en producción.

## Enlaces

- [Hugging Face: ai-sage/Giga-Embeddings-instruct-480M-0826](https://huggingface.co/ai-sage/Giga-Embeddings-instruct-480M-0826)
- [Organización ai-sage en Hugging Face](https://huggingface.co/ai-sage)

Nota: los resultados de búsqueda web incluyen enlaces a páginas de modelos similares (Giga-Embeddings-instruct sin el sufijo -480M-0826) que no corresponden a este modelo concreto, por lo que no se incluyen aquí.
