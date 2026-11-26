# Quakeer444/Kasya-embed-150M

## Resumen

Kasya-embed-150M es un modelo de embeddings de texto para ruso desarrollado por Quakeer444, construido sobre deepvk/RuModernBERT-base mediante destilación desde ai-sage/Giga-Embeddings-instruct-10B-A1.8B-0826 y posterior ajuste contrastivo. Con 149 millones de parámetros y vectores de 768 dimensiones, está diseñado para tareas de similitud semántica, recuperación de información, clasificación y clustering, y se posiciona como el modelo de menos de 1.000 millones de parámetros con mejor media en MTEB(rus, v1.1).

El modelo emplea una arquitectura ModernBERT (transformer encoder con atención optimizada) y sigue un esquema instruction-based: las consultas y las tareas simétricas se codifican con una instrucción en el formato `Instruct: {instruction}\nQuery: {text}`, mientras que los documentos de recuperación se codifican sin prompt. Su ventana de entrada alcanza los 2.048 tokens y su salida es una media con normalización L2.

Su relevancia actual radica en la combinación de tamaño reducido (150M), licencia Apache-2.0 y un rendimiento que supera a modelos considerablemente mayores como FRIDA (823M) en la media global y en recuperación. Además, el 34% de las tareas evaluadas (8 de 23) son zero-shot, lo que indica una capacidad de generalización no dependiente de ajuste específico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parámetros totales | 149.014.272 (150M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Ruso (principal); inglés y código como secundarios |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de deepvk/RuModernBERT-base, un encoder ModernBERT adaptado al ruso. Sobre esa base se aplicó un proceso de destilación desde un modelo mayor (ai-sage/Giga-Embeddings-instruct-10B-A1.8B-0826) y un ajuste contrastivo posterior. La salida se obtiene mediante pooling de media con normalización L2, produciendo vectores de 768 dimensiones. El modelo es instruction-based: incorpora prompts predefinidos en su configuración para consultas, documentos y tareas simétricas (STS, clasificación, clustering, reranking), además de un prompt específico por cada una de las 23 tareas de ruMTEB.

Los datos de entrenamiento incluyen un conjunto amplio de corpus y datasets de evaluación rusos e ingleses: epfml/FineWeb2-HQ, deepvk/cultura_ru_edu, wikimedia/wikipedia, HuggingFaceFW/fineweb-edu, codefuse-ai/F2LLM-v2, hotchpotch/wikipedia-multilingual-synthetic-ir-query, miracl/miracl, castorini/mr-tydi, deepvk/ru-WANLI, d0rj/geo-reviews-dataset-2023, zloelias/lenta-ru, mlsa-iai-msu-lab/ru_sci_bench, NiGuLa/Russian_Inappropriate_Messages, its5Q/yandex-q, blinoff/kinopoisk y merionum/ru_paraphraser, entre otros. No se especifica en la información disponible el número exacto de tokens de entrenamiento ni la composición porcentual del dataset.

## Capacidades

- Generación de embeddings de texto para similitud semántica y búsqueda semántica.
- Recuperación de información (retrieval) con codificación asimétrica query/documento mediante instrucciones.
- Clasificación de texto y clasificación multi-etiqueta a partir de las representaciones vectoriales.
- Clustering de textos y detección de duplicados o paráfrasis.
- Reranking de resultados de búsqueda.
- Soporte de instrucciones personalizadas para tareas propias mediante el formato `Instruct: ...\nQuery: ...`.
- Capacidades multilingües limitadas: ruso como idioma principal, inglés y código como secundarios.
- Integración con sentence-transformers, mteb y text-embeddings-inference (endpoints compatibles).

## Casos de uso

- Búsqueda semántica en corpus rusos: el modelo codifica consultas con el prompt `query` y documentos sin prompt, permitiendo recuperar pasajes relevantes en bases documentales de hasta 2.048 tokens por fragmento.
- Sistemas de preguntas y respuestas sobre documentación: indexación de fragmentos y recuperación de los más similares a la pregunta del usuario, con buen rendimiento en las tres tareas de retrieval de ruMTEB (77,44).
- Moderación y clasificación de contenido: uso de las representaciones para clasificar mensajes inapropiados o temas sensibles, aprovechando su rendimiento en InappropriatenessClassification (85,48) y SensitiveTopics.
- Deduplicación y agrupamiento de noticias: clustering de titulares y artículos con el prompt `Clustering`, útil en agregadores de medios en ruso.
- Análisis de reseñas y opiniones: clasificación de sentimiento y temática en reseñas de películas (Kinopoisk) o geolocalizaciones (Georeview), con features de clasificación.
- Detección de paráfrasis y similitud: comparación de pares de textos con el prompt `STS` para control de calidad de traducciones o detección de contenido duplicado.
- Reranking en pipelines de búsqueda híbrida: reordenación de candidatos recuperados por un motor léxico o vectorial previo, gracias a su rendimiento en las dos tareas de reranking (71,64).
- Enrutado de tickets de soporte: clasificación de la temática de tickets mediante instrucciones personalizadas, con bajo coste computacional por su tamaño de 150M.

## Benchmarks y rendimiento

Evaluación en MTEB(rus, v1.1) con 23 tareas, todas puntuadas por el autor sobre el mismo stack (mteb 2.26.33) y con los prompts propios de cada modelo:

| Métrica | Kasya-embed-150M | FRIDA | Giga-Embeddings-instruct-480M | komaru_embeddings | BERTA |
|---|---:|---:|---:|---:|---:|
| Parámetros | 150M | 823M | 484M | 128M | 128M |
| Media (Task) | **73,37** | 71,03 | 70,97 | 70,92 | 69,02 |
| Media (TaskType) | **70,38** | 68,95 | 68,44 | 69,08 | 67,31 |
| Classification (9) | **77,96** | 73,71 | 75,15 | 74,29 | 71,22 |
| Clustering (3) | **69,96** | 67,37 | 63,36 | 66,89 | 64,67 |
| MultilabelClassification (2) | **56,61** | 52,26 | 54,79 | 54,65 | 52,14 |
| PairClassification (1) | 64,92 | 66,37 | 65,08 | **70,16** | 65,74 |
| Reranking (2) | **71,64** | 71,50 | 70,78 | 70,27 | 69,71 |
| Retrieval (3) | **77,44** | 77,12 | 76,08 | 73,26 | 73,96 |
| STS (3) | 74,10 | **74,33** | 73,81 | 74,07 | 73,72 |

Resultados por tarea disponibles parcialmente en la model card: GeoreviewClassification 62,00; HeadlineClassification 83,33 (zero-shot); InappropriatenessClassification 85,48. El resto de tareas individuales no se detalla en la información proporcionada. El autor indica que 8 de las 23 tareas son zero-shot (34%).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 150M parámetros, en FP32 ocupa aproximadamente 0,6 GB de pesos; en FP16/BF16 unos 0,3 GB; en cuantización de 8 bits en torno a 0,15 GB. La memoria adicional depende del tamaño de lote y de la longitud de secuencia (hasta 2.048 tokens).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU, donde el autor reporta una velocidad aproximadamente 5 veces superior a FRIDA.
- Cabe holgadamente en GPU consumer e incluso en entornos con poca VRAM o en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers, mteb, text-embeddings-inference (endpoints compatibles) y, presumiblemente, llama.cpp/Ollama si se generan pesos GGUF (no confirmado en la información disponible).
- Latencia y throughput: no se proporcionan cifras concretas más allá de la comparación relativa de 5x frente a FRIDA en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media ruMTEB | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Kasya-embed-150M | 150M | 2.048 | 73,37 | Apache-2.0 | Hugging Face |
| FRIDA | 823M | no disponible | 71,03 | no disponible | Hugging Face |
| Giga-Embeddings-instruct-480M | 484M | no disponible | 70,97 | no disponible | Hugging Face |
| komaru_embeddings | 128M | no disponible | 70,92 | no disponible | Hugging Face |
| BERTA | 128M | no disponible | 69,02 | no disponible | Hugging Face |

Kasya-embed-150M lidera la media global y cinco de los siete tipos de tarea entre los modelos comparados, con la excepción de PairClassification (donde komaru_embeddings obtiene 70,16) y STS (donde FRIDA alcanza 74,33). Su principal ventaja es la relación rendimiento/tamaño: supera a modelos de 3 a 5 veces más parámetros con una licencia permisiva Apache-2.0.

## Limitaciones y advertencias

- El modelo está optimizado para ruso; su rendimiento en inglés y código es secundario y no se han publicado métricas específicas para esos idiomas.
- Requiere el uso correcto de instrucciones: las consultas y tareas simétricas deben codificarse con el prompt adecuado; los documentos de retrieval, sin prompt. Un uso incorrecto de los prompts degrada la calidad de los embeddings.
- Ventana de contexto limitada a 2.048 tokens; textos más largos deben fragmentarse.
- No se han publicado datos sobre sesgos, tasas de alucinación en tareas generativas (el modelo no genera texto, solo embeddings) ni robustez frente a dominios fuera de los datasets de entrenamiento.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el autor no documenta restricciones adicionales; conviene verificar la licencia del modelo base (deepvk/RuModernBERT-base) para producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado en noviembre de 2026; su adopción y validación por la comunidad son aún incipientes.
- Los benchmarks han sido puntuados por el propio autor sobre un stack concreto (mteb 2.26.33); los números de la leaderboard oficial con otras versiones de mteb difieren ligeramente (por ejemplo, FRIDA 70,95 frente a 71,03).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quakeer444/Kasya-embed-150M
- Modelo base: https://huggingface.co/deepvk/RuModernBERT-base
- Modelo profesor (destilación): https://huggingface.co/ai-sage/Giga-Embeddings-instruct-10B-A1.8B-0826
