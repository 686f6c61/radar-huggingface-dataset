# arshvir/granite-embedding-311m-multilingual-r2-GGUF

## Resumen

El modelo `granite-embedding-311m-multilingual-r2-GGUF` es una conversión a formato GGUF del modelo de embeddings multilingüe `ibm-granite/granite-embedding-311m-multilingual-r2`, desarrollado por IBM. Esta conversión, creada por el usuario arshvir, tiene como objetivo ofrecer una versión ligera y portable del modelo original para su uso con herramientas como llama.cpp, Ollama y otras que soporten este formato. El modelo base pertenece a la familia Granite Embedding R2, diseñada para recuperación densa empresarial en más de 200 idiomas, con soporte mejorado para 52 lenguas y código de programación.

Con 311 millones de parámetros y una arquitectura ModernBERT, el modelo produce vectores de 768 dimensiones (reducibles mediante Matryoshka Representation Learning hasta 128) y admite una ventana de contexto de 32 768 tokens, una expansión de 64 veces respecto a la versión R1. Su licencia Apache 2.0 permite uso comercial sin restricciones. La relevancia de esta conversión GGUF radica en que facilita el despliegue local en entornos sin GPU dedicada o con recursos limitados, manteniendo un rendimiento competitivo en tareas de búsqueda semántica, recuperación de información y similitud de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (attention alternada, activaciones GeGLU, posiciones rotatorias RoPE) |
| Parametros totales | 311 664 384 (311M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | f16 (GGUF) |
| Idiomas soportados | Más de 200, con soporte mejorado para 52 idiomas y código de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único de ~623 MB) |

## Arquitectura y entrenamiento

El modelo base utiliza la arquitectura ModernBERT, que incorpora atención alternada entre capas, activaciones GeGLU y embeddings posicionales rotatorios (RoPE). Esta arquitectura está optimizada para tareas de recuperación y similitud de texto, ofreciendo un equilibrio entre calidad y eficiencia computacional. La versión R2 introduce una expansión del contexto de 32 768 tokens (64 veces superior a la R1), lo que permite procesar documentos largos de forma íntegra.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no están disponibles en la información proporcionada. Sin embargo, el model card indica que el modelo fue entrenado con un enfoque multilingüe y de código, y que presenta un salto de +13 puntos en MTEB retrieval multilingüe respecto a la generación anterior de 278M parámetros. La conversión a GGUF no modifica los pesos originales, solo el formato de almacenamiento.

## Capacidades

- Generación de embeddings de texto de longitud fija (768 dimensiones, truncables a 512, 384, 256 o 128 mediante Matryoshka Representation Learning).
- Búsqueda semántica y recuperación de información multilingüe en más de 200 idiomas, con soporte mejorado para 52 lenguas.
- Recuperación de código de programación (Python, Go, Java, JavaScript, C++, SQL, entre otros).
- Similitud de frases y documentos, clustering y clasificación de texto.
- Procesamiento de documentos largos gracias a su contexto de 32 768 tokens.
- Compatible con pipelines de sentence-transformers y con herramientas de inferencia GGUF como llama.cpp y Ollama.
- No es un modelo generativo: su salida es un vector numérico, no texto.

## Casos de uso

- Búsqueda semántica multilingüe en aplicaciones empresariales: el modelo puede indexar documentos en varios idiomas y recuperar los más relevantes para una consulta, aprovechando su contexto largo para procesar párrafos completos sin truncamiento.
- Sistemas de recuperación aumentada por generación (RAG): al convertir documentos y consultas en embeddings de alta calidad, permite construir pipelines de RAG con precisión mejorada en entornos multilingües.
- Deduplicación de contenidos: comparando embeddings de documentos se pueden identificar duplicados o casi duplicados en grandes corpus, útil en gestión de bases de conocimiento o moderación de contenidos.
- Clasificación de texto y análisis de sentimiento: los embeddings generados pueden alimentar clasificadores supervisados o modelos de clustering para categorizar textos en múltiples idiomas.
- Recuperación de código fuente: gracias a su entrenamiento específico en lenguajes de programación, puede utilizarse para buscar funciones o fragmentos de código por similitud semántica, mejorando herramientas de búsqueda en repositorios.
- Chatbots y asistentes virtuales con base de conocimiento multilingüe: los embeddings permiten seleccionar respuestas relevantes de una base documental en tiempo real, incluso con consultas en idiomas minoritarios.

## Benchmarks y rendimiento

Según la información del model card del modelo base:

| Métrica | Resultado |
|---|---|
| MTEB Multilingual Retrieval (18 tareas) | 65.2 |
| Code Retrieval | Rendimiento de última generación para modelos abiertos con menos de 500M de parámetros |
| Throughput | ~1828 documentos por segundo a 512 tokens de longitud |

No se han publicado comparaciones directas con otros modelos en la información disponible. El salto de +13 puntos sobre la generación anterior (278M) indica una mejora sustancial en recuperación multilingüe.

## Requisitos de hardware

- El archivo GGUF en f16 ocupa aproximadamente 623 MB, por lo que cabe en memoria RAM de cualquier equipo moderno (mínimo 1 GB de RAM libre).
- Puede ejecutarse en CPU sin necesidad de GPU, con latencia aceptable para tareas de embeddings (no generativas).
- En GPU consumer (por ejemplo, RTX 3060 o superior) la inferencia es muy rápida, aunque no es imprescindible.
- Herramientas de despliegue compatibles: llama.cpp, llama-cpp-python, Ollama, y cualquier framework que soporte GGUF.
- Para producción con alto volumen, se recomienda servir con vLLM (si soporta embeddings GGUF) o mediante la API de sentence-transformers con el modelo original en safetensors.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de embeddings en la información proporcionada. Como referencia, el modelo base de IBM (granite-embedding-311m-multilingual-r2) es la versión oficial en safetensors, con las mismas especificaciones pero sin conversión GGUF. La versión GGUF aquí descrita es una adaptación de terceros que no altera el rendimiento teórico, pero puede presentar ligeras diferencias numéricas debido al redondeo de la cuantización f16 (mínimo impacto). Otros modelos de embeddings multilingües como BGE-M3 o E5-mistral no han sido comparados en esta documentación.

## Limitaciones y advertencias

- Al ser un modelo de embeddings, no genera texto; su salida es un vector. No es adecuado para tareas generativas.
- La conversión GGUF ha sido realizada por un tercero (arshvir), no por IBM. Aunque el autor proporciona un script de conversión reproducible, se recomienda verificar la integridad de los pesos antes de usarlo en producción.
- La cuantización f16 puede introducir una degradación mínima en la precisión de los embeddings en comparación con los pesos originales en float32, aunque en la práctica suele ser insignificante.
- El modelo puede presentar sesgos inherentes a los datos de entrenamiento, especialmente en idiomas con menor representación. No se han publicado evaluaciones específicas de sesgo.
- Aunque soporta más de 200 idiomas, la calidad varía según la lengua; los 52 idiomas con soporte mejorado tendrán mejor rendimiento que el resto.
- No se recomienda usar este modelo para tareas de razonamiento o generación, ya que no es su propósito.

## Enlaces

- Repositorio HuggingFace de la conversión GGUF: https://huggingface.co/arshvir/granite-embedding-311m-multilingual-r2-GGUF
- Modelo base original en HuggingFace: https://huggingface.co/ibm-granite/granite-embedding-311m-multilingual-r2
- Repositorio GitHub de IBM Granite Embedding Models: https://github.com/ibm-granite/granite-embedding-models
- Documentación oficial de IBM sobre Granite Embedding: https://www.ibm.com/granite/docs/models/embedding
- Paper sobre la familia R2: https://arxiv.org/html/2605.13521v2
