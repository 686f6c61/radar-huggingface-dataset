# prasan-24/text-embedding

## Resumen

prasan-24/text-embedding es un modelo de embeddings de frases publicado en HuggingFace por el usuario prasan-24. Se trata de un fine-tuning de BAAI/bge-small-en-v1.5, un encoder Transformer tipo BERT de 33.360.000 parámetros (aproximadamente 33,4 millones) que proyecta texto en un espacio vectorial denso de 384 dimensiones. La longitud máxima de secuencia es de 512 tokens, la función de similitud es coseno y el pipeline declarado es sentence-similarity.

El modelo se enmarca en la librería sentence-transformers y está pensado para tareas de similitud semántica, búsqueda semántica, minería de paráfrasis, clasificación y clustering. Su principal singularidad, y a la vez su principal limitación, es el régimen de entrenamiento: se ha ajustado sobre un conjunto de solo 210 pares anchor/positive con la pérdida MultipleNegativesRankingLoss, lo que lo convierte en un experimento de ajuste ligero más que en un modelo de propósito general validado.

Su relevancia actual es limitada: el repositorio registra 0 descargas y 0 likes, no declara licencia ni idiomas soportados, y no publica resultados de evaluación. Resulta útil como caso de estudio de fine-tuning mínimo sobre un backbone pequeño, pero no como componente de producción sin una evaluación previa por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BertModel) con pooling CLS y normalización L2, empaquetado como SentenceTransformer |
| Parámetros totales | 33.360.000 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; el autor no distribuye variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (el autor no los declara; el modelo base BAAI/bge-small-en-v1.5 tiene foco principal en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repositorio: 0,1 GB) |
| Dimensión de salida | 384 |
| Función de similitud | Similitud coseno |
| Modalidad | Texto |
| Modelo base | BAAI/bge-small-en-v1.5 (revisión 5c38ec7c405ec4b44b94cc5a9bb96e735b38267a) |
| Librería | sentence-transformers |

## Arquitectura y entrenamiento

La arquitectura es un pipeline estándar de sentence-transformers compuesto por tres módulos: un BertModel que produce last_hidden_state, un módulo de Pooling con modo cls y embedding_dimension de 384, y un módulo Normalize que aplica normalización L2 al vector de frase. No hay innovaciones arquitectónicas propias: es el esquema clásico de Sentence-BERT aplicado a un backbone pequeño de la familia BGE. El modelo base, bge-small-en-v1.5, es un encoder de 12 capas y 384 dimensiones ampliamente utilizado como referencia en recuperación densa por su relación entre calidad y coste computacional.

El ajuste se realizó con la pérdida MultipleNegativesRankingLoss sobre un dataset sin nombre de 210 muestras de entrenamiento con dos columnas, anchor y positive. Según las estadísticas aproximadas que reporta la model card sobre las primeras 100 muestras, los textos son muy cortos: el ancho medio del campo anchor es de 10,07 tokens y el mínimo es de 6 tokens. No se especifican el número de épocas, el tamaño de batch, la tasa de aprendizaje, el optimizador ni si hubo etapas adicionales de RLHF o DPO (en un modelo de embeddings no serían aplicables del modo habitual). La model card no documenta ninguna innovación técnica destacable ni proceso de destilación o decodificación especulativa.

## Capacidades

- Generación de embeddings de frases y párrafos de hasta 512 tokens en un espacio denso de 384 dimensiones.
- Similitud semántica entre pares de textos mediante similitud coseno.
- Búsqueda semántica y recuperación densa (dense retrieval) sobre colecciones de documentos previamente indexadas.
- Minería de paráfrasis: detección de frases con significado equivalente y redacción distinta.
- Clustering y agrupación semántica de textos no etiquetados.
- Feature extraction para clasificación supervisada aguas abajo, usando los embeddings como entrada de otro modelo.
- No dispone de tool calling ni function calling: es un modelo de representación, no generativo.
- No dispone de soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no declaradas por el autor; el comportamiento fuera del inglés no está documentado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Búsqueda semántica interna en documentación técnica: indexar artículos, manuales o tickets con los embeddings de 384 dimensiones y recuperar los fragmentos más cercanos a una consulta en lenguaje natural, con el límite de 512 tokens por fragmento.
- Deduplicación de tickets de soporte: agrupar incidencias con la misma causa raíz calculando la similitud coseno entre embeddings y fijando un umbral de corte, reduciendo el volumen de colas duplicadas.
- Detección de preguntas frecuentes en un chatbot: mapear cada consulta entrante al embedding de una pregunta canónica previamente almacenada y devolver la respuesta asociada cuando la similitud supere un umbral definido.
- Filtrado de contenido duplicado en un corpus propio: usar el modelo para agrupar noticias, reseñas o publicaciones casi idénticas antes de alimentar un pipeline de análisis.
- Etiquetado semántico previo a un clasificador: generar embeddings de 384 dimensiones para entrenar un clasificador ligero (regresión logística, SVM) sobre un conjunto pequeño de datos etiquetados.
- Recuperación aumentada (RAG) como retriever de segunda línea: emplearlo en un entorno controlado y de dominio acotado, siempre que se valide antes su calidad frente al modelo base BAAI/bge-small-en-v1.5, dado el reducido tamaño del conjunto de fine-tuning.
- Clustering exploratorio de encuestas o formularios abiertos: agrupar respuestas de texto libre por proximidad semántica para descubrir temas recurrentes sin etiquetado previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna evaluación sobre MTEB, BEIR ni sobre conjuntos de similitud semántica, y tampoco se proporcionan métricas de la pérdida de validación más allá del valor de entrenamiento MultipleNegativesRankingLoss asociado a los tags.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos en safetensors ocupan aproximadamente 133 MB en precisión fp32 (33,36 millones de parámetros × 4 bytes) y unos 67 MB en fp16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo está muy por debajo de la capacidad de todas ellas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de los últimos ocho años e incluso en iGPU y en CPU sin aceleración dedicada.
- Opciones de despliegue: sentence-transformers (vía Python), HuggingFace Text Embeddings Inference (TEI), FastAPI con sentence-transformers como backend, y exportación a ONNX Runtime si se necesita reducir latencia en CPU. El tag text-embeddings-inference y endpoints_compatible del repositorio indica compatibilidad declarada con TEI y con los endpoints de HuggingFace.
- Latencia y throughput: no disponibles. El autor no publica mediciones, y al tratarse de un encoder de 33 millones de parámetros con secuencias de 512 tokens, el rendimiento dependerá del hardware y del tamaño de batch; conviene medirlo en el entorno objetivo antes de dimensionar un servicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prasan-24/text-embedding | 33.360.000 | 384 | 512 tokens | no disponible | HuggingFace, 0 descargas |
| BAAI/bge-small-en-v1.5 | 33.000.000 (aprox.) | 384 | 512 tokens | MIT | HuggingFace, ampliamente desplegado |
| sentence-transformers/all-MiniLM-L6-v2 | 22.700.000 (aprox.) | 384 | 256 tokens | Apache-2.0 | HuggingFace, muy extendido |
| intfloat/e5-small-v2 | 33.000.000 (aprox.) | 384 | 512 tokens | MIT | HuggingFace, ampliamente desplegado |

Frente a estas alternativas, prasan-24/text-embedding comparte arquitectura, dimensión de salida y ventana de contexto con bge-small-en-v1.5 y e5-small-v2, pero no aporta resultados de evaluación que justifiquen su uso por encima de ellos. all-MiniLM-L6-v2 es más pequeño (22,7 millones de parámetros) y tiene una ventana de 256 tokens, pero cuenta con licencia Apache-2.0 y una validación comunitaria muy amplia. Los datos de parámetros, dimensión y contexto de los modelos comparados proceden de sus fichas públicas; la licencia del modelo objeto de esta ficha no está declarada.

## Limitaciones y advertencias

- Conjunto de entrenamiento de solo 210 pares: el riesgo de sobreajuste es alto y el ajuste puede degradar el rendimiento general heredado del modelo base fuera del dominio de esos ejemplos.
- Textos de entrenamiento muy cortos (media de 10,07 tokens en el campo anchor, mínimo de 6): el modelo puede comportarse peor en documentos largos o en consultas con estructura compleja.
- Ventana máxima de 512 tokens: cualquier entrada superior se trunca, con pérdida de información.
- Idiomas no declarados: no hay evidencia de que el fine-tuning conserve un comportamiento multilingüe correcto, y el modelo base tiene foco principal en inglés.
- Licencia no especificada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarlo en un producto.
- Ausencia total de evaluación publicada: no hay métricas de recuperación, similitud ni clasificación que permitan estimar su calidad.
- Sin validación comunitaria: 0 descargas y 0 likes, sin issues ni discusiones que documenten fallos conocidos.
- Riesgo de alucinación: no aplica en sentido generativo, porque el modelo no produce texto; el riesgo equivalente es devolver vecinos semánticamente espurios cuando las similitudes son bajas o los umbrales no están calibrados.
- Posible sesgo estructural heredado del corpus de entrenamiento de bge-small-en-v1.5, no analizado ni mitigado en esta ficha.
- Metadatos incoherentes con un uso en producción: fecha de creación 2026-10-12, sin versionado semántico ni changelog.
- La model card deja sin rellenar los apartados de uso fuera de alcance, sesgos y recomendaciones, por lo que el autor no documenta limitaciones propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prasan-24/text-embedding
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos sentence-transformers en HuggingFace: https://huggingface.co/models?library=sentence-transformers
- Referencia arXiv citada en los tags del modelo: https://arxiv.org/abs/1908.10084
- Referencia arXiv citada en los tags del modelo (título no disponible en la información proporcionada): https://arxiv.org/abs/1807.03748
- Los resultados de búsqueda web disponibles no contienen enlaces relacionados con este modelo: corresponden a ayudas gubernamentales francesas sobre combustible y no aportan información técnica aprovechable.
