# GermannM/kenga-embed-z5

## Resumen

kenga-embed-z5 es un codificador de frases bilingüe (ruso e inglés) desarrollado por GermannM dentro del proyecto Kenga (kenga-lang). Está diseñado para generar embeddings de texto de 768 dimensiones normalizados L2, orientados a tareas de similitud semántica, recuperación de información, clasificación y agrupación. Con 44,2 millones de parámetros, es un modelo compacto pensado para competir con otros codificadores rusos de 30-40M, ofreciendo una alternativa ligera para entornos con recursos limitados.

Su arquitectura se basa en un transformer bidireccional con factorización Z de las proyecciones de atención y de la red feed-forward, un embedding de tokens factorizado y un tokenizador SentencePiece de 16k piezas. El modelo maneja un contexto máximo de 512 tokens y sigue el protocolo de prefijos FRIDA/BERTA, lo que facilita su integración en pipelines existentes sin cambios.

Fue entrenado mediante destilación desde el modelo BERTA (128M) a partir de 1,23 millones de segmentos ruso/inglés, sin etiquetas, y se ha evaluado en MTEB(rus, v1.1) con una media de 57,5 en 23 tareas. Su relevancia radica en ofrecer un buen equilibrio entre tamaño y rendimiento para el idioma ruso, especialmente en comparación con modelos de mayor tamaño como Giga-Embeddings-instruct-480M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con factorización Z: 8 capas, 12 cabezas, d_model=768, dff=3072, embedding de tokens factorizado (16385 x 128 -> 768), proyecciones de atención y FF con factorización Z (rango 192/512), posiciones aprendidas hasta 512 |
| Parametros totales | 44,2 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ruso, inglés |
| Licencia | MIT |
| Formato de pesos | pytorch_model.bin (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un encoder de frases bidireccional basado en la arquitectura Kenga (proyecto kenga-lang). Utiliza un transformer con 8 capas, 12 cabezas de atención y una dimensión oculta de 768. La principal innovación es la factorización Z de las proyecciones de atención y de la red feed-forward, con rangos de 192 y 512 respectivamente, lo que reduce el número de parámetros sin sacrificar en exceso la calidad. Además, el embedding de tokens está factorizado: el vocabulario de 16385 piezas se proyecta con una dimensión intermedia de 128 y se expande a 768. La salida se obtiene mediante agrupación media y se normaliza con norma L2. El tokenizador es SentencePiece de 16k piezas. El modelo maneja un contexto máximo de 512 tokens y sigue el protocolo de prefijos de FRIDA/BERTA, lo que permite usarlo en pipelines existentes sin cambios.

El entrenamiento se realizó por destilación desde el modelo BERTA (128M), que a su vez fue destilado de FRIDA. Se emplearon 30.000 pasos de destilación con pérdida de coseno y KL relacional sobre un conjunto de 1,23 millones de segmentos en ruso e inglés (Wikipedia, diálogos, reseñas, titulares e intenciones) con prefijos estilo FRIDA. No se utilizaron etiquetas. Las capas con factorización Z siguieron un currículo de rango: 25% -> 50% -> 100% del rango final durante el entrenamiento. El checkpoint corresponde al paso 50.000.

## Capacidades

- Embeddings de frases de 768 dimensiones, normalizados L2, aptos para similitud del coseno.
- Recuperación de documentos (retrieval) con prefijos `search_query` y `search_document`.
- Clasificación y agrupación (clustering) de textos con prefijos `categorize`, `categorize_sentiment` y `categorize_topic`.
- Similitud semántica textual (STS) y detección de parafraseo con prefijo `paraphrase`.
- Reranking de resultados con prefijos `search_query` y `search_document`.
- NLI / entailment (TERRa) con prefijo `categorize_entailment`.
- Soporte bilingüe ruso-inglés.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica en corpus ruso: codificar consultas y documentos con los prefijos `search_query` y `search_document` y calcular el producto escalar. Adecuado para motores de recuperación en dominios como noticias o documentación técnica.
- Moderación automática de contenido: clasificar mensajes como inapropiados usando el prefijo `categorize` y un clasificador lineal sobre los embeddings. Útil en foros o redes sociales rusas.
- Análisis de sentimiento en reseñas: usar el prefijo `categorize_sentiment` para obtener embeddings y entrenar un clasificador sobre reseñas de Kinopoisk o RuReviews.
- Agrupación de noticias por tema: aplicar clustering (por ejemplo, k-means) sobre los embeddings de titulares con prefijo `categorize_topic` para agrupar noticias relacionadas.
- Reranking en un buscador: combinar con un modelo de recuperación inicial y reordenar resultados con los embeddings del modelo, mejorando la relevancia.
- Detección de parafraseo en un chatbot: usar el prefijo `paraphrase` para comparar respuestas del usuario y detectar si se refieren a la misma intención.
- Sistemas de recomendación: codificar artículos o productos y recomendar ítems similares por similitud de coseno.

## Benchmarks y rendimiento

Se han publicado resultados oficiales en MTEB(rus, v1.1) con 23/23 tareas completadas, utilizando `mteb==2.20.5`. La siguiente tabla reproduce los resultados de la model card, comparando con Giga-Embeddings-instruct-480M, BERTA-128M, USER2-small-34M y rubert-tiny-turbo-29M.

| task | kenga-embed-z5 | Giga-Embeddings-instruct-480M | BERTA-128M | USER2-small-34M | rubert-tiny-turbo-29M |
|---|---:|---:|---:|---:|---:|
| GeoreviewClassification | 47.0 | 55.4 | 54.8 | 41.1 | 41.4 |
| HeadlineClassification | 85.4 | 89.0 | 89.0 | 74.3 | 68.9 |
| InappropriatenessClassification | 62.1 | 86.1 | 74.8 | 60.7 | 59.1 |
| KinopoiskClassification | 62.5 | 73.0 | 67.8 | 52.2 | 50.5 |
| MassiveIntentClassification | 63.0 | 85.3 | 74.0 | 66.1 | 58.0 |
| MassiveScenarioClassification | 74.1 | 90.9 | 84.5 | 70.3 | 62.9 |
| RuReviewsClassification | 69.9 | 76.3 | 72.3 | 60.8 | 60.7 |
| RuSciBenchGRNTIClassification | 64.3 | 74.0 | 69.0 | 63.1 | 52.9 |
| RuSciBenchOECDClassification | 50.1 | 59.9 | 54.8 | 49.2 | 40.8 |
| CEDRClassification | 55.9 | 69.8 | 73.0 | 39.4 | 39.0 |
| SensitiveTopicsClassification | 29.8 | 44.3 | 39.9 | 27.5 | 25.2 |
| GeoreviewClusteringP2P | 47.1 | 73.8 | 73.8 | 66.2 | 59.7 |
| RuSciBenchGRNTIClusteringP2P | 60.4 | 70.5 | 65.0 | 56.4 | 48.1 |
| RuSciBenchOECDClusteringP2P | 52.0 | 58.1 | 55.6 | 48.6 | 41.1 |
| TERRa | 55.5 | 79.6 | 65.7 | 54.0 | 56.3 |
| RuBQReranking | 66.9 | 80.5 | 75.2 | 66.0 | 62.2 |
| MIRACLReranking | 50.1 | 67.5 | 64.3 | 50.5 | 47.7 |
| RiaNewsRetrievalHardNegatives.v2 | 42.9 | 88.9 | 84.5 | 74.5 | 52.3 |
| RuBQRetrieval | 52.4 | 80.6 | 71.0 | 61.1 | 51.7 |
| MIRACLRetrievalHardNegatives.v2 | 43.3 | 74.7 | 65.9 | 46.1 | 42.4 |
| RUParaPhraserSTS | 63.6 | 78.3 | 77.8 | 69.6 | 72.1 |
| RuSTSBenchmarkSTS | 70.7 | 83.6 | 82.2 | 81.0 | 78.5 |
| STS22 | 53.3 | 65.3 | 61.1 | 66.1 | 64.6 |
|---|---|---|---|---|---|
| *Classification (mean)* | 64.3 | 76.7 | 71.2 | 59.8 | 55.0 |
| *MultilabelClassification (mean)* | 42.8 | 57.1 | 56.5 | 33.5 | 32.1 |
| *Clustering (mean)* | 53.2 | 67.5 | 64.8 | 57.1 | 49.6 |
| *PairClassification (mean)* | 55.5 | 79.6 | 65.7 | 54.0 | 56.3 |
| *Reranking (mean)* | 58.5 | 74.0 | 69.7 | 58.3 | 54.9 |
| *Retrieval (mean)* | 46.2 | 81.4 | 73.8 | 60.6 | 48.8 |
| *STS (mean)* | 62.5 | 75.7 | 73.7 | 72.2 | 71.7 |
| **mean over tasks** | **57.5** | **74.2** | **69.4** | **58.5** | **53.7** |
| **mean over task types (leaderboard)** | **54.7** | **73.1** | **67.9** | **56.5** | **52.6** |
| tasks done | 23 | 23 | 23 | 23 | 23 |

El autor de la model card señala que el modelo no supera a Giga-Embeddings-instruct-480M y que debe compararse con codificadores rusos de 30-40M. En la media simple de las 23 tareas, kenga-embed-z5 obtiene 57,5, por debajo de Giga (74,2) y ligeramente por debajo de USER2-small-34M (58,5). La media estilo leaderboard (promedio de medias por tipo de tarea) es 54,7.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El checkpoint fp32 pesa 177 MB, lo que sugiere un modelo ligero, pero no se confirma un valor de VRAM.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No se especifica. Dado el tamaño de parámetros (44,2M) y el peso del checkpoint (177 MB), es plausible que quepa en cualquier GPU moderna, pero no hay confirmación del autor.
- Opciones de despliegue: PyTorch mediante el módulo custom `modeling_kenga_embed_v2.py` incluido en el repositorio. Se puede cargar con `KengaEmbedV2HF.from_pretrained(...)` en CPU o GPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media MTEB (23 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kenga-embed-z5 | 44,2M | 512 tokens | 57,5 | MIT | HuggingFace |
| Giga-Embeddings-instruct-480M | 480M | no disponible | 74,2 | no disponible | no disponible |
| USER2-small-34M | 34M | no disponible | 58,5 | no disponible | no disponible |
| rubert-tiny-turbo-29M | 29M | no disponible | 53,7 | no disponible | no disponible |

Nota: el modelo profesor BERTA-128M obtiene una media de 69,4 en las mismas 23 tareas, pero no se dispone de su licencia ni contexto en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento limitado en recuperación (retrieval): en tareas como RiaNewsRetrievalHardNegatives.v2 obtiene 42,9 frente a 88,9 de Giga-Embeddings-instruct-480M. El autor reconoce que no supera a Giga.
- Contexto limitado a 512 tokens, lo que puede ser insuficiente para documentos largos o conversaciones extensas.
- Solo soporta ruso e inglés. No funciona en otros idiomas.
- Al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación no aplica en el sentido generativo. Sin embargo, los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento (Wikipedia, diálogos, reseñas, etc.).
- Licencia MIT permite uso comercial sin restricciones, pero se debe verificar el cumplimiento de las licencias de los datos de entrenamiento, que no se especifican.
- El código de entrenamiento no es público en el repositorio de kenga-lang; solo se documenta la receta en `docs/PROPHETS.md`. Esto puede dificultar la reproducibilidad.
- No hay información sobre sesgos conocidos o evaluaciones de seguridad.
- El modelo es una investigación personal de GermannM con 0 descargas y 0 likes en HuggingFace en el momento de la consulta, lo que puede indicar que no está ampliamente probado en producción.

## Enlaces

- HuggingFace: https://huggingface.co/GermannM/kenga-embed-z5
- Proyecto Kenga: https://github.com/GermannM/kenga-lang
- Documentación de PROPHETS: https://github.com/GermannM/kenga-lang/blob/main/docs/PROPHETS.md
- Modelo profesor BERTA: https://huggingface.co/sergeyzh/BERTA
- Repositorio de resultados de benchmarks: https://github.com/embeddings-benchmark/results
