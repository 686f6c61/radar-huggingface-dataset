# cstr/ettin-reranker-32m-v1-GGUF

## Resumen

El modelo `cstr/ettin-reranker-32m-v1-GGUF` es una cuantización en formato GGUF del reranker cross-encoder `cross-encoder/ettin-reranker-32m-v1`, desarrollado por el equipo de Cross-Encoder y convertido por el usuario cstr mediante la librería CrispEmbed. Se trata de un modelo de 32,8 millones de parámetros basado en la arquitectura ModernBERT, diseñado para reordenar documentos en pipelines de recuperación de información (RAG, búsqueda semántica, etc.) puntuando pares consulta-documento.

El modelo original forma parte de la familia ettin-reranker-v1, que se presenta como state-of-the-art en su rango de tamaños hasta 1B de parámetros, entrenado mediante destilación puntual (MSE) desde un profesor de mayor capacidad sobre un conjunto de datos de dominios amplios y específicos de recuperación. Esta versión GGUF permite desplegar el modelo en entornos con recursos limitados, incluyendo CPU y GPUs de consumo, gracias a las cuantizaciones Q4_K y Q8_0.

La relevancia actual del modelo radica en su eficiencia: con solo 32M de parámetros y un contexto de 512 tokens, ofrece un equilibrio entre latencia y calidad para tareas de reranking en producción, donde los modelos grandes son inviables por coste o latencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (10 capas, 384 hidden) con clasificador head Dense(384→384, GELU) → LayerNorm → Dense(384→1) |
| Parámetros totales | 32.488.328 (32M) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (presumiblemente 512 tokens, típico de ModernBERT, pero no confirmado) |
| Tipos de cuantización | F32, Q8_0, Q4_K |
| Idiomas soportados | no disponible (probablemente inglés, dado el tokenizer GPT-2 ByteLevel BPE, pero no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors del modelo original en cross-encoder/ettin-reranker-32m-v1) |

## Arquitectura y entrenamiento
El modelo base es un cross-encoder basado en ModernBERT, una arquitectura transformer optimizada para eficiencia y contexto largo. El clasificador head consiste en dos capas densas con activación GELU y normalización LayerNorm, que producen una puntuación de relevancia escalar para el par consulta-documento. El tokenizer es GPT-2 ByteLevel BPE con 50.368 tokens.

La familia ettin-reranker-v1 se entrenó con un único procedimiento de destilación pointwise (MSE) desde un profesor de mayor capacidad, sobre una mezcla de datos de dominios amplios y específicos de recuperación. El entrenamiento escala de 17M a 1B de parámetros, variando únicamente la tasa de aprendizaje y el tamaño de batch por dispositivo. No se mencionan técnicas como RLHF o DPO en la información disponible.

## Capacidades
- Reranking de pares consulta-documento: dado un par, devuelve una puntuación de relevancia escalar.
- Compatible con pipelines de recuperación de dos etapas: un retriever (basado en embeddings) recupera candidatos y el reranker reordena los top-k.
- Soporte de cuantización GGUF para despliegue ligero en CPU y GPU.
- Integración con la libr CrispEmbedding para la conversión y el uso.
- No se mencionan capacidades de generación de texto, tool calling, agentes ni multimodalidad; es un modelo puramente de reranking.

## Casos de uso
- **Búsqueda semántica en producción**: después de un retriever por embeddings, el modelo reordena los top-100 resultados para mejorar la precisión. Con 32M de parámetros y cuantización Q4_K, puede ejecutarse en CPU con latencia moderada.
- **Sistemas RAG**: en un pipeline de generación aumentada por recuperación, el reranker filtra los fragmentos más relevantes antes de pasarlos al generador, reduciendo alucinaciones y mejorando la calidad de las respuestas.
- **Búsqueda en bases de datos vectoriales**: al combinar con FAISS o Milvus, el modelo puede refinar los resultados de similitud coseno con una puntuación cross-encoder más precisa.
- **Moderación de contenido**: puntuar la relevancia de documentos respecto a una consulta específica, útil para filtrado de contenidos en plataformas.
- **Soporte técnico y FAQ**: en un sistema de tickets, el modelo puede reordenar artículos de la base de conocimiento según la pregunta del usuario, mejorando la precisión de las respuestas sugeridas.
- **Búsqueda de código**: aunque no está especializado en código, puede reordenar resultados de búsqueda de fragmentos de código si se usa con un retriever adecuado, en contextos de documentación técnica.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks específicos para el modelo de 32M en la información disponible. La familia ettin-reranker-v1 fue evaluada en el benchmark MTEB (inglés, v2) Retrieval con 10 tareas y re-ranking top-100, pero no se proporcionan los números concretos para esta variante. Se indica que el rendimiento es state-of-the-art hasta 1B de parámetros, pero no hay datos numéricos disponibles.

## Requisitos de hardware
- **VRAM estimada para inferencia**: con cuantización Q4_K, el modelo ocupa aproximadamente 29 MB de pesos; la VRAM necesaria es mínima, por lo que puede ejecutarse en GPU de consumo con menos de 1 GB de VRAM, incluso en CPU.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (GTX 1060, RTX 3050, etc.) es suficiente; para inferencia en CPU, funciona sin GPU.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo moderna.
- **Opciones de despliegue**: llama.cpp, llama-cpp-python, Ollama (si se convierte a un formato compatible), o a través de la libr CrispEmbedding para carga directa. También se puede usar vLLM con soporte de GGUF, aunque no está confirmado.
- **Latencia y throughput**: no disponibles; con 32M de parámetros, se espera una latencia de decenas de milisegundos por par consulta-documento en CPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares
No se dispone de datos comparativos con modelos similares en la información proporcionada. Modelos comparables en la categoría de rerankers cross-encoder de tamaño pequeño incluyen `ms-marco-MiniLM-L-6-v2` (22M), `cross-encoder/ms-marco-MiniLM-L-12-v2` (33M) o `bge-reranker-base` (278M), pero no hay datos de rendimiento comparados en la información disponible.

## Limitaciones y advertencias
- **Idiomas**: no se especifican idiomas soportados; el tokenizer GPT-2 ByteLevel BPE es típicamente entrenado en inglés, por lo que el rendimiento en otros idiomas puede ser limitado.
- **Alucinación**: al ser un modelo de reranking, no genera texto, por lo que no hay riesgo de alucinación en la salida; sin embargo, la puntuación puede ser poco fiable en dominios fuera del entrenamiento.
- **Contexto**: la longitud de contexto no está confirmada; ModernBERT soporta hasta 512 tokens, pero este modelo puede tener un límite menor o mayor. Se recomienda verificar con la documentación oficial.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de licencia.
- **Dependencia del retriever**: el rendimiento del reranker depende de la calidad del retriever previo; si el retriever no genera buenos candidatos, el reranker no puede mejorar la recuperación.
- **Cuantización**: las versiones GGUF Q4_K pueden degradar ligeramente la precisión respecto al modelo en punto flotante, aunque se espera que sea mínima.

## Enlaces
- HuggingFace del modelo GGUF: https://huggingface.co/cstr/ettin-reranker-32m-v1-GGUF
- Modelo original: https://huggingface.co/cross-encoder/ettin-reranker-32m-v1
- Repositorio CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Blog de Hugging Face sobre la familia ettin-reranker: https://github.com/huggingface/blog/blob/main/ettin-reranker.md
- Artículo sobre la familia ettin-reranker: https://bittide.aicompass.dev/article/ffba36f8-bda2-44d0-bcd4-32943ea04a0e
- Conversión alternativa en GGUF: https://huggingface.co/keisuke-miyako/ettin-reranker-v1-gguf## Resumen

El modelo `cstr/ettin-reranker-32m-v1-GGUF` es una cuantización en formato GGUF del reranker cross-encoder `cross-encoder/ettin-reranker-32m-v1`, desarrollado por Cross-Encoder y convertido por el usuario cstr mediante la librería CrispEmbed. Se trata de un modelo de 32,8 millones de parámetros basado en la arquitectura ModernBERT, diseñado para reordenar documentos en pipelines de recuperación de información (RAG, búsqueda semántica) puntuando pares consulta-documento.

La familia ettin-reranker-v1, a la que pertenece este modelo, se entrenó con un procedimiento de destilación pointwise (MSE) desde un profesor de mayor capacidad, escalando desde 17M hasta 1B de parámetros con el mismo recetario. Según el blog oficial de Hugging Face, alcanza resultados de última generación en el benchmark MTEB Retrieval (inglés, v2) en todos los tamaños publicados hasta 1B. Esta versión GGUF permite desplegar el modelo en entornos con recursos limitados, incluyendo CPU y GPUs de consumo.

La relevancia de este modelo radica en su eficiencia: con 32M de parámetros y cuantizaciones de 29-36 MB, ofrece un equilibrio entre latencia y calidad para tareas de reranking en producción, donde los modelos de mayor tamaño resultan inviables por coste o tiempo de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (10 capas, 384 hidden) con clasificador head Dense(384→384, GELU) → LayerNorm → Dense(384→1) |
| Parametros totales | 32.488.328 (32M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (típico de ModernBERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | F32, Q8_0, Q4_K |
| Idiomas soportados | no disponible (tokenizer GPT-2 ByteLevel BPE, probablemente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento
El modelo base es un cross-encoder basado en ModernBERT, una arquitectura transformer optimizada para eficiencia. El clasificador head consta de dos capas densas con activación GELU y normalización LayerNorm, que producen una puntuación de relevancia escalar para cada par consulta-documento. El tokenizer es GPT-2 ByteLevel BPE con 50.368 tokens.

La familia ettin-reranker-v1 se entrenó mediante destilación pointwise (MSE) desde un modelo maestro de alta capacidad, sobre una mezcla de datos de dominios amplios y específicos de recuperación. El entrenamiento escala de 32M a 1B de parámetros variando solo la tasa de aprendizaje y el batch size por dispositivo. No se mencionan técnicas como RLHF o DPO en la información disponible.

## Capacidades
- Reranking de pares consulta-documento: devuelve una puntuación de relevancia escalar entre 0 y 1.
- Integración en pipelines de recuperación de dos etapas: un retriever genera candidatos top-100 y el reranker los reordena.
- Compatible con la librería CrispEmbedding para conversión y despliegue en GGUF.
- No genera texto, no soporta tool calling ni agentes; es un modelo puramente discriminativo.
- Multilingüismo: no confirmado; el tokenizer ByteLevel BPE sugiere entrenamiento en inglés.

## Casos de uso
- **Recuperación en RAG**: tras un retriever por embeddings, el reranker reordena los documentos top-100 para seleccionar los más relevantes antes de pasarlos al generador, mejorando la precisión de las respuestas.
- **Búsqueda en bases de conocimiento**: en sistemas de tickets o FAQ, el modelo puede priorizar los artículos más adecuados según la consulta del usuario, reduciendo el tiempo de resolución.
- **Búsqueda semántica en entornos corporativos**: integrado con Elasticsearch o Pinecone, permite refinar resultados de búsqueda híbrida (densa + léxica) con una puntuación cross-encoder más precisa.
- **Moderación y filtrado de contenido**: puntúa la relevancia de documentos respecto a criterios específicos, útil para clasificar y filtrar contenido en plataformas.
- **Análisis de contratos y documentos legales**: reordena cláusulas o documentos según su relevancia para una consulta legal, agilizando la revisión de grandes volúmenes.
- **Sistemas de recomendación**: para pares de ítems y consultas de usuario, el modelo puede puntuar la relevancia y mejorar la personalización de recomendaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible para este modelo específico. La familia ettin-reranker-v1 fue evaluada en el benchmark MTEB (inglés, v2) Retrieval con 10 tareas y re-ranking top-100, pero no se proporcionan cifras numéricas para el modelo de 32M. Se indica que es state-of-the-art hasta 1B de parámetros, pero no hay datos concretos.

## Requisitos de hardware
- **VRAM estimada**: con cuantización Q4_K, el peso ocupa ~29 MB; la inferencia puede ejecutarse en CPU o GPU con menos de 2 GB de VRAM.
- **GPU recomendadas**: cualquier GPU de consumo (GTX 1060, RTX 3060, etc.) es suficiente; también funciona en CPU con llama.cpp.
- **Opciones de despliegue**: llama.cpp, llama-cpp-python, Ollama (si se convierte a formato compatible), o la librería CrispEmbedding para el modelo original.
- **Latencia**: no disponible, pero con 32M de parámetros se espera latencia de decenas de milisegundos por par en CPU moderna.
- **Throughput**: no disponible.

## Comparativa con modelos similares
No se dispone de datos de rendimiento comparativo para este modelo en la información proporcionada. Modelos similares de la misma categoría (rerankers cross-encoder de tamaño pequeño) incluyen `ms-marco-MiniLM-L-6-v2` (22.7M), `ms-marco-MiniLM-L-12-v2` (117M) y `bge-reranker-base` (278M), pero no hay resultados de comparación disponibles.

## Limitaciones y advertencias
- **Idiomas**: no se especifican idiomas soportados; el tokenizer GPT-2 ByteLevel BPE está entrenado principalmente para inglés, por lo que el rendimiento en otros idiomas puede ser limitado.
- **Alucinación**: al ser un reranker, no genera texto, por lo que no hay riesgo de alucinación en la salida, pero la puntuación puede ser poco fiable en dominios no cubiertos por el entrenamiento.
- **Contexto**: la longitud de contexto no está confirmada; ModernBERT soporta hasta 512 tokens, pero no se ha verificado para este modelo.
- **Dependencia del retriever**: el rendimiento del reranker depende de la calidad del retriever; si los candidatos no son relevantes, el reranker no puede mejorar la recuperación.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia.
- **Producción**: la cuantización Q4_K puede degradar ligeramente la precisión respecto al modelo en punto flotante, aunque suele ser aceptable.

## Enlaces
- Modelo GGUF en HuggingFace: https://huggingface.co/cstr/ettin-reranker-32m-v1-GGUF
- Modelo original: https://huggingface.co/cross-encoder/ettin-reranker-32m-v1
- Librería CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Blog de HuggingFace sobre la familia ettin-reranker: https://github.com/huggingface/blog/blob/main/ettin-reranker.md
- Artículo sobre la familia ettin-reranker: https://bittide.aicompass.dev/article/ffba36f8-bda2-44d0-bcd4-32943ea04a0e
- Conversión GGUF alternativa: https://huggingface.co/keisuke-miyako/ettin-reranker-v1-gguf
