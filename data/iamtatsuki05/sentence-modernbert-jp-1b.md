# iamtatsuki05/Sentence-ModernBERT-JP-1B

## Resumen

Sentence-ModernBERT-JP-1B es un modelo de embeddings de frases para japones desarrollado por iamtatsuki05, parte de la familia MIREI. Se trata de un encoder basado en la arquitectura ModernBERT con 1.304 millones de parametros totales, afinado mediante aprendizaje contrastivo supervisado sobre el dataset cl-nagoya/ruri-v3-dataset-ft. Su proposito es generar representaciones vectoriales densas de 1.792 dimensiones para tareas de similitud semantica, recuperacion de informacion y clustering en japones.

El modelo parte del checkpoint preentrenado iamtatsuki05/Sentence-ModernBERT-JP-1B-PT y se distribuye bajo licencia MIT, lo que facilita su uso comercial. Su ventana de contexto alcanza los 8.192 tokens, un valor notablemente superior al de muchos encoders de frases convencionales, lo que permite codificar documentos largos sin truncamiento agresivo.

La relevancia actual del modelo radica en su comparativa directa con alternativas de la misma familia (basadas en Llama) y en su inclusion en el benchmark JMTEB v2, donde obtiene una media global de 63,51 puntos. Es un modelo especializado exclusivamente en japones, no multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 1.304 millones (1.120 millones sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via transformers) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 1.792 (mean pooling) |
| Tokenizador | SentencePiece, vocabulario de 102.400 tokens |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Tamano del repositorio | 5,2 GB |
| Libreria | sentence-transformers (>=4.1.0), transformers (>=4.51.0) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ModernBERT, un encoder transformer que incorpora codificacion posicional rotatoria (RoPE) y atencion con soporte para FlashAttention 2. Cuenta con 1.304 millones de parametros totales, de los cuales 1.120 millones corresponden al cuerpo del modelo sin la capa de embeddings. El tokenizador es SentencePiece con un vocabulario de 102.400 entradas, optimizado para japones.

El entrenamiento consta de dos fases: un preentrenamiento con supervisacion debil que produce el checkpoint base (Sentence-ModernBERT-JP-1B-PT), seguido de un ajuste fino supervisado con aprendizaje contrastivo sobre el dataset cl-nagoya/ruri-v3-dataset-ft. El resultado es un modelo que genera embeddings de 1.792 dimensiones mediante mean pooling. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset. El modelo esta asociado a la publicacion "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析" presentada en NLP2026.

## Capacidades

- Generacion de embeddings de frases y documentos en japones con 1.792 dimensiones.
- Similitud semantica entre textos (sentence-similarity) mediante distancia coseno.
- Recuperacion de informacion (retrieval) en corpus japoneses, incluyendo pasajes largos de hasta 8.192 tokens.
- Clustering de textos por similitud semantica.
- Reranking de resultados de busqueda.
- Clasificacion de textos basada en representaciones densas.
- Extraccion de caracteristicas (feature-extraction) para pipelines downstream.
- Compatible con Text Embeddings Inference (TEI) y endpoints de Hugging Face.
- Soporte de FlashAttention 2 para inferencia acelerada.
- No soporta tool calling, agentes ni generacion de texto: es exclusivamente un encoder de embeddings.

## Casos de uso

- Busqueda semantica en documentacion tecnica japonesa: el modelo codifica tanto consultas como fragmentos de hasta 8.192 tokens, permitiendo indexar manuales, normativas o documentacion interna sin truncar secciones largas.
- Sistemas de preguntas y respuestas sobre corpus japoneses (RAG): los embeddings de 1.792 dimensiones alimentan un indice vectorial para recuperar pasajes relevantes antes de pasarlos a un modelo generativo.
- Deduplicacion y clustering de articulos de noticias en japones: agrupando textos por similitud coseno se detectan duplicados o temas recurrentes en grandes volumenes de contenido editorial.
- Moderacion y clasificacion de contenido: las representaciones densas sirven como entrada a clasificadores ligeros para categorizar tickets de soporte o comentarios de usuarios en japones.
- Reranking en motores de busqueda internos: dado un conjunto de candidatos recuperados por BM25, el modelo reordena por relevancia semantica usando similitud coseno.
- Analisis de similitud entre documentos legales o contractuales: comparacion de clausulas y deteccion de textos casi identicos en expedientes japoneses.
- Construccion de indices vectoriales para recomendacion de contenido: similitud entre descripciones de productos o articulos para sugerencias personalizadas.

## Benchmarks y rendimiento

Resultados en JMTEB v2 (media macro sobre cinco familias de tareas):

| Modelo | Arquitectura | Parametros | JMTEB-Avg | Retrieval | STS | Classification | Reranking | Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-ModernBERT-JP-1B (este modelo) | ModernBERT | 1304M | 63,51 | 60,52 | 81,61 | 57,92 | 67,04 | 50,47 |
| Sentence-Llama-Bi-JP-1B | Llama | 1224M | 61,50 | 56,38 | 79,14 | 55,63 | 64,66 | 51,70 |
| Sentence-Sarashina-Bi-JP-1B | Llama | 1224M | 66,36 | 65,03 | 83,16 | 61,90 | 71,37 | 50,34 |

Cada puntuacion de familia promedia todos los datasets, splits y subconjuntos de dicha familia. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,6 GB solo para los pesos (1.304M parametros x 2 bytes), mas overhead de activaciones que depende del tamano de lote y de la longitud de secuencia.
- En fp32: aproximadamente 5,2 GB para los pesos.
- Cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090, siempre que se ajuste el tamano de lote para secuencias largas.
- GPUs recomendadas para produccion: A100, H100 o L40S para alto throughput con lotes grandes y secuencias de hasta 8.192 tokens.
- Despliegue via sentence-transformers, Text Embeddings Inference (TEI), o integracion en pipelines con transformers y accelerate.
- FlashAttention 2 (>=2.7.3) recomendado para acelerar la atencion en secuencias largas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | JMTEB-Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentence-ModernBERT-JP-1B | ModernBERT | 1304M | 8.192 | 63,51 | MIT | Hugging Face |
| Sentence-Llama-Bi-JP-1B | Llama | 1224M | no disponible | 61,50 | no disponible | Hugging Face |
| Sentence-Sarashina-Bi-JP-1B | Llama | 1224M | no disponible | 66,36 | no disponible | Hugging Face |

El modelo Sarashina-Bi-JP-1B supera a este modelo en cuatro de las cinco familias de tareas (media global, retrieval, STS, clasificacion y reranking), mientras que Sentence-ModernBERT-JP-1B obtiene un mejor resultado en clustering (50,47 frente a 50,34) y supera a Sentence-Llama-Bi-JP-1B en la media global. Los datos de contexto y licencia de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en japones: no soporta consultas ni documentos en otros idiomas, lo que limita su uso en entornos multilingues.
- No es un modelo generativo: no puede producir texto, responder preguntas directamente ni ejecutar tool calling.
- Riesgo de sesgos: al entrenarse sobre un dataset japones (cl-nagoya/ruri-v3-dataset-ft), puede heredar sesgos presentes en el corpus de origen; no se detallan analisis de sesgo en la informacion disponible.
- Riesgo de alucinacion no aplicable en sentido estricto (no genera texto), pero los embeddings pueden producir similitudes espurias en dominios muy especializados no representados en el entrenamiento.
- La dimension de embedding de 1.792 es elevada, lo que incrementa el coste de almacenamiento y memoria en indices vectoriales a gran escala en comparacion con modelos de 768 o 1.024 dimensiones.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero se recomienda verificar la licencia del dataset de entrenamiento (cl-nagoya/ruri-v3-dataset-ft) para usos derivados.
- El modelo tiene muy pocas descargas (4) y ningun "like" en el momento de la consulta, por lo que la validacion comunitaria es limitada.
- No se especifican requisitos de normalizacion de texto japones previos a la codificacion; conviene aplicar normalizacion Unicode y segmentacion coherente con el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-JP-1B
- Modelo base (preentrenado): https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-JP-1B-PT
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/cl-nagoya/ruri-v3-dataset-ft
- Modelo comparable Sentence-Llama-Bi-JP-1B: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-JP-1B
- Modelo comparable Sentence-Sarashina-Bi-JP-1B: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-JP-1B
- Licencia MIT: https://opensource.org/license/mit/
