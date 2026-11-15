# iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B

## Resumen

Sentence-Sarashina-Bi-EN-0.5B es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05 dentro de la familia MIREI. Se trata de un encoder basado en la arquitectura Llama, con 661.976.320 parámetros totales (530M sin contar embeddings), que produce representaciones vectoriales densas de 1.280 dimensiones mediante mean pooling. El modelo parte del checkpoint preentrenado iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B-PT y se afina con aprendizaje contrastivo supervisado sobre los subconjuntos supervisados del dataset sentence-transformers/embedding-training-data.

El problema que resuelve es la generación de embeddings de alta calidad para tareas de recuperación de información, similitud semántica, clasificación, reranking y clustering en inglés. Su relevancia radica en que demuestra que un decoder transformer de tamaño reducido (0,5B) puede superar a encoders dedicados como ModernBERT en el benchmark MTEB, con un MTEB-Avg de 56,54 frente a 53,66 del modelo ModernBERT de parámetros comparables.

La ventana de contexto es de 8.192 tokens, utiliza tokenizador SentencePiece con vocabulario de 102.400 entradas, codificación posicional RoPE y métrica de similitud coseno. La licencia es MIT, lo que facilita su uso comercial, y se distribuye en formato safetensors con código personalizado (custom_code) que requiere confiar en el código remoto al cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder transformer adaptado a embeddings) |
| Parametros totales | 661.976.320 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 1.280 (mean pooling) |
| Tokenizador | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Tamano del repo | 2,7 GB |
| Modelo base | iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B-PT |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Llama de tipo decoder transformer reutilizada como encoder de frases. La representación final se obtiene mediante mean pooling sobre las salidas del modelo, generando un vector de 1.280 dimensiones. La codificación posicional es RoPE y el tokenizador SentencePiece cubre un vocabulario de 102.400 entradas. La longitud máxima de secuencia es de 8.192 tokens.

El entrenamiento consiste en un ajuste fino con aprendizaje contrastivo supervisado sobre los subconjuntos supervisados de sentence-transformers/embedding-training-data, que incluyen AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA. El checkpoint de partida es un modelo preentrenado de la misma familia (sufijo -PT). El modelo se enmarca en el trabajo de investigación MIREI, presentado en el congreso NLP2026 de la Asociación de Procesamiento del Lenguaje de Japón, que analiza el rendimiento de embeddings de frases según arquitecturas encoder/decoder bajo condiciones equivalentes.

## Capacidades

- Generación de embeddings de frases en inglés de 1.280 dimensiones, normalizables para similitud coseno.
- Recuperación de información (retrieval) densa sobre documentos y consultas.
- Detección de similitud semántica entre pares de textos (STS).
- Clasificación de texto mediante embeddings como características de entrada.
- Reranking de resultados de búsqueda.
- Clustering de documentos o frases en el espacio de embeddings.
- Extracción de características (feature-extraction) para pipelines de transformers.
- Soporte de secuencias largas de hasta 8.192 tokens.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-step, ya que es un modelo de embeddings y no un modelo generativo de instrucciones.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y código en inglés con embeddings de 1.280 dimensiones, permitiendo consultas en lenguaje natural con recuperación densa sobre fragmentos de hasta 8.192 tokens.
- Sistemas de preguntas y respuestas sobre bases documentales: usar el modelo para emparejar preguntas con pasajes relevantes en corpus como SQuAD o NQ, aprovechando su entrenamiento directo sobre esos datasets.
- Deduplicación de contenido: detectar preguntas o artículos duplicados o casi duplicados mediante similitud coseno, útil en foros como Quora o en agregadores de noticias.
- Reranking en pipelines de búsqueda híbrida: reordenar los resultados de un motor léxico (BM25) recalculando la similitud semántica entre consulta y documento con el modelo.
- Clustering de tickets de soporte: agrupar incidencias de clientes en inglés por temática para enrutamiento automático o análisis de tendencias.
- Clasificación de textos con embeddings congelados: entrenar un clasificador ligero (regresión logística o MLP) sobre los vectores del modelo para tareas de moderación o etiquetado.
- Sistemas de recomendación basados en contenido: calcular similitud entre descripciones de productos o artículos para sugerir ítems relacionados.
- Construcción de índices vectoriales para RAG: generar embeddings de fragmentos documentales que alimenten bases de datos vectoriales (FAISS, Qdrant, Milvus) en aplicaciones de generación aumentada por recuperación.

## Benchmarks y rendimiento

Resultados en el subconjunto inglés de 37 tareas de MTEB (eng, v2), según la model card:

| Modelo | Arquitectura | Parametros | MTEB-Avg | MTEB-Retrieval | MTEB-STS | MTEB-Classification | MTEB-Reranking | MTEB-Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-Sarashina-Bi-EN-0.5B (este modelo) | Llama | 661M | 56,54 | 42,62 | 78,91 | 72,45 | 45,39 | 43,35 |
| Sentence-ModernBERT-EN-0.5B | ModernBERT | 677M | 53,66 | 40,32 | 76,04 | 67,31 | 42,93 | 41,69 |
| Sentence-Llama-Bi-EN-0.5B | Llama | 661M | 52,12 | 37,31 | 74,10 | 66,28 | 42,29 | 40,63 |
| Sentence-Mistral-Bi-EN-0.5B | Mistral | 518M | 52,70 | 38,44 | 75,04 | 66,60 | 42,53 | 40,87 |
| Sentence-Qwen2.5-Bi-EN-0.5B | Qwen2.5 | 494M | 57,19 | 44,18 | 79,48 | 71,92 | 45,23 | 45,15 |
| Sentence-InstructLM-Bi-EN-0.5B | Mistral | 518M | 57,73 | 46,11 | 80,01 | 73,19 | 45,71 | 43,62 |

El modelo supera al ModernBERT de tamaño comparable y a las variantes Llama y Mistral de la misma familia, pero queda por debajo de Sentence-Qwen2.5-Bi-EN-0.5B y Sentence-InstructLM-Bi-EN-0.5B en la media global y en retrieval.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,3-1,5 GB para los pesos (661M parámetros), más overhead de activaciones que depende de la longitud de secuencia y el tamaño de batch.
- Cabe en GPU de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de datacenter A100, H100, L40S o T4.
- En CPU es viable para cargas moderadas, aunque con mayor latencia; se recomienda GPU para indexación a gran escala.
- Opciones de despliegue: sentence-transformers (librería nativa), Hugging Face Text Embeddings Inference (TEI, etiqueta text-embeddings-inference), transformers con accelerate, y endpoints compatibles de Hugging Face. No se documenta soporte explícito para vLLM, llama.cpp u Ollama, aunque al ser safetensors podría adaptarse.
- Requiere flash-attn >= 2.7.3 para la implementación de atención recomendada (flash_attention_2).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | MTEB-Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentence-Sarashina-Bi-EN-0.5B | Llama | 661M | 8.192 | 56,54 | MIT | Hugging Face |
| Sentence-ModernBERT-EN-0.5B | ModernBERT | 677M | no disponible | 53,66 | no disponible | Hugging Face |
| Sentence-Qwen2.5-Bi-EN-0.5B | Qwen2.5 | 494M | no disponible | 57,19 | no disponible | Hugging Face |
| Sentence-InstructLM-Bi-EN-0.5B | Mistral | 518M | no disponible | 57,73 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- Es un modelo de embeddings, no un modelo generativo: no produce texto ni responde instrucciones.
- Riesgo de sesgos heredados de los datasets de entrenamiento (AllNLI, MS MARCO, Quora, NQ, SQuAD, TriviaQA), que pueden reflejar sesgos sociales o de dominio.
- Los embeddings pueden degradarse en dominios muy alejados de los datos de entrenamiento (por ejemplo, texto jurídico o biomédico especializado).
- Requiere trust_remote_code=True por el uso de código personalizado, lo que implica revisar el código antes de ejecutarlo en producción.
- La longitud efectiva de contexto de 8.192 tokens puede no aprovecharse igual en todas las tareas; el mean pooling sobre secuencias muy largas puede diluir la señal.
- Licencia MIT permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento subyacentes si se redistribuye el modelo.
- El modelo tiene muy pocas descargas y likes en el momento de la ficha (1 descarga, 0 likes), lo que reduce la validación comunitaria.
- No se han publicado datos de latencia ni throughput, por lo que el dimensionamiento de producción debe medirse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B
- Modelo base (preentrenado): https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B-PT
- Colección MIREI en Hugging Face: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Licencia MIT: https://opensource.org/license/mit/
- Modelos comparables de la familia: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-0.5B, https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-0.5B, https://huggingface.co/iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B, https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B, https://huggingface.co/iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B, https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Scratch-Bi-EN-0.5B
