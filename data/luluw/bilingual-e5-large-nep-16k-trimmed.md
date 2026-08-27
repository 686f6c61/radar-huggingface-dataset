# luluw/bilingual-e5-large-nep-16k-trimmed

## Resumen

El modelo `luluw/bilingual-e5-large-nep-16k-trimmed` es una adaptación del conocido `intfloat/multilingual-e5-large`, diseñada específicamente para ofrecer embeddings de texto bilingües (inglés y nepalí) con una huella de memoria significativamente reducida. Desarrollado por el usuario luluw, este modelo combina dos técnicas de optimización: la extensión de la longitud de contexto de 512 a 1024 tokens mediante atención LSG (Local-Sparse-Global) y el recorte del vocabulario de 250.002 a 16.384 tokens, seleccionados por frecuencia de uso en corpus de inglés y nepalí. El resultado es un modelo de 321,7 millones de parámetros que conserva la calidad de los embeddings del modelo original para estos dos idiomas, pero con un tamaño de vocabulario un 93% menor, lo que reduce el coste de memoria y acelera la inferencia.

La relevancia de este modelo radica en su capacidad para trabajar con nepalí, un idioma con escasos recursos en el ecosistema de modelos de embeddings, y en su enfoque de optimización sin reentrenamiento: los vectores de embedding de los tokens conservados se copian directamente del modelo original, evitando la necesidad de un costoso fine-tuning. Aunque el modelo requiere funciones de tokenización personalizadas debido al recorte de vocabulario, ofrece una solución práctica para aplicaciones de búsqueda semántica y recuperación de información en contextos bilingües inglés-nepalí, con una ventana de contexto ampliada que permite procesar documentos más largos que el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (basado en `intfloat/multilingual-e5-large`) con atención LSG |
| Parámetros totales | 321.714.176 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (originalmente 512) |
| Tipos de cuantización | No disponible (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | Inglés y nepalí |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura XLM-RoBERTa de `multilingual-e5-large`, que consta de 24 capas transformer con un tamaño de embedding de 1024 dimensiones. La modificación principal consiste en sustituir la atención self-attention estándar por atención LSG (Local-Sparse-Global), que combina atención local en ventanas, atención global en tokens seleccionados y atención dispersa para reducir la complejidad computacional, permitiendo así duplicar la longitud máxima de secuencia de 512 a 1024 tokens sin necesidad de reentrenar el modelo. Esta conversión se realizó mediante la herramienta `lsg-converter`.

El segundo paso fue el recorte del vocabulario: se redujo de 250.002 a 16.384 tokens, seleccionando los más frecuentes en textos en inglés y nepalí a partir del dataset `lbourdois/fineweb-2-trimming`. Los vectores de embedding de los tokens conservados se copiaron directamente del modelo original, sin reentrenamiento. El proceso de entrenamiento, por tanto, no implicó ningún paso de optimización de pesos; se trata de una transformación estructural y de vocabulario sobre un modelo preentrenado. No se aplicaron técnicas como RLHF o DPO, y no se dispone de información sobre el dataset de entrenamiento original más allá de la del modelo base.

## Capacidades

- Generación de embeddings de texto densos de 1024 dimensiones, normalizados mediante mean pooling y normalización L2.
- Búsqueda semántica bilingüe: recuperación de pasajes relevantes en inglés y nepalí mediante similitud coseno.
- Procesamiento de contextos largos de hasta 1024 tokens, útil para documentos extensos o conversaciones multi-turno.
- Clustering y agrupación de textos por similitud semántica en ambos idiomas.
- Clasificación de texto mediante embeddings (por ejemplo, con un clasificador lineal entrenado sobre las representaciones).
- Requiere el uso de prefijos "query: " y "passage: " en la entrada, siguiendo la convención de la familia E5.
- No soporta tool calling, generación de texto autoregresivo ni capacidades multimodales; es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en corpus bilingües inglés-nepalí: el modelo permite indexar documentos en ambos idiomas y recuperar pasajes relevantes a partir de consultas en cualquiera de ellos, gracias a su espacio de embeddings compartido y su contexto de 1024 tokens.
- Recuperación de información en dominios específicos (legal, médico, educativo) donde el nepalí es el idioma principal: al estar optimizado para este idioma, ofrece mejores resultados que modelos multilingües genéricos con vocabularios más amplios pero menos enfocados.
- Clustering de documentos para organizar grandes volúmenes de texto en nepalí e inglés, por ejemplo en bibliotecas digitales o archivos gubernamentales.
- Sistemas de recomendación basados en similitud de contenido: comparar artículos, noticias o publicaciones en ambos idiomas para sugerir elementos relacionados.
- Deduplicación de contenido: detectar documentos duplicados o casi duplicados en repositorios bilingües, aprovechando la ventana de contexto ampliada para comparar párrafos completos.
- Clasificación de texto con aprendizaje supervisado: usar los embeddings como características de entrada para entrenar clasificadores ligeros (regresión logística, SVM) en tareas como análisis de sentimiento o categorización de documentos en nepalí e inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor menciona evaluaciones internas sobre corrección del mapeo de tokens, calidad de embeddings (similitud coseno entre pares similares y disimilares), manejo de contextos largos y recuperación end-to-end en un corpus bilingüe pequeño, pero no se proporcionan métricas cuantitativas comparables (como MMLU, HumanEval o MTEB). No se dispone de datos objetivos de rendimiento frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 321,7 millones de parámetros. En fp32, los pesos ocupan aproximadamente 1,29 GB; en fp16, unos 645 MB; en int8, unos 322 MB. A esto hay que sumar la memoria para activaciones y el tokenizador, por lo que se recomienda al menos 2 GB de VRAM para fp32 y 1 GB para fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp32 (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060). Para producción con mayor throughput, se recomienda una GPU de gama media como RTX 3080 o superior, o GPUs de datacenter como A10 o A100.
- El modelo cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna con 2 GB o más de VRAM.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con bibliotecas como Hugging Face Transformers, Sentence-Transformers, o mediante servidores de inferencia como vLLM (aunque vLLM está más orientado a generación, también soporta modelos de embeddings), ONNX Runtime o TensorRT. También es posible ejecutarlo en CPU con buena latencia para tareas por lotes.
- Latencia y throughput estimados: no se dispone de datos medidos. Como referencia, un modelo de 321M parámetros en una GPU RTX 3090 puede procesar cientos de secuencias por segundo en modo batch, pero la latencia por secuencia individual dependerá de la longitud del texto (hasta 1024 tokens).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Vocabulario | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| `luluw/bilingual-e5-large-nep-16k-trimmed` | 321,7 M | 1024 | 16.384 | Inglés, nepalí | Apache 2.0 | safetensors |
| `intfloat/multilingual-e5-large` (base) | 560 M (aprox.) | 512 | 250.002 | 100+ idiomas | MIT | safetensors |
| `luluw/Multilingual-E5-Large-Nep-GGUF` | 321,7 M (aprox.) | 1024 (presumible) | 16.384 | Inglés, nepalí | Apache 2.0 | GGUF |

El modelo recortado es un 42,73% más pequeño que el original en términos de tamaño de vocabulario, lo que reduce significativamente la memoria de embeddings. Frente al modelo base, ofrece el doble de contexto (1024 vs 512 tokens) pero solo soporta dos idiomas. El modelo GGUF relacionado es la misma arquitectura en formato cuantizado, pensado para ejecución en CPU o dispositivos con recursos limitados. No se dispone de comparativas con otros modelos de embeddings bilingües como BGE-M3 o LaBSE, ya que no hay datos de rendimiento publicados.

## Limitaciones y advertencias

- El vocabulario recortado a 16.384 tokens puede no cubrir adecuadamente términos poco frecuentes, jerga técnica o nombres propios en nepalí o inglés, lo que podría degradar la calidad de los embeddings en dominios especializados.
- El modelo solo soporta inglés y nepalí; cualquier otro idioma producirá embeddings de baja calidad o tokens desconocidos.
- Requiere funciones de tokenización personalizadas (`encode_trimmed` y `embed`) que no son compatibles con el flujo estándar de `AutoTokenizer` de Hugging Face, lo que complica su integración en pipelines existentes.
- No se ha realizado fine-tuning posterior al recorte; la calidad de los embeddings para nepalí depende de la frecuencia de los tokens en el dataset de recorte, que puede no reflejar todos los registros del idioma.
- No se han publicado benchmarks objetivos, por lo que el rendimiento real frente a alternativas como `multilingual-e5-large` o `LaBSE` es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `multilingual-e5-large` tiene licencia MIT, por lo que no hay restricciones adicionales conocidas.
- El modelo no es adecuado para generación de texto, razonamiento o tareas de chat; es exclusivamente para embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luluw/bilingual-e5-large-nep-16k-trimmed
- Modelo GGUF relacionado: https://huggingface.co/luluw/Multilingual-E5-Large-Nep-GGUF
- Modelo base `intfloat/multilingual-e5-large`: https://huggingface.co/intfloat/multilingual-e5-large
- Documentación de LSG attention (herramienta `lsg-converter`): no disponible en la información proporcionada
- Dataset de recorte `lbourdois/fineweb-2-trimming`: no disponible en la información proporcionada
