# lightonai/ColBERT-Zero-unsupervised

## Resumen

ColBERT-Zero-unsupervised es un modelo de embeddings de texto multi-vector basado en la arquitectura ColBERT (late interaction), desarrollado por LightOn AI. Se trata de la primera versión a gran escala de un modelo ColBERT preentrado exclusivamente con datos públicos y sin supervisión, lo que lo convierte en una alternativa abierta a modelos que dependen de datos propietarios o anotaciones humanas. Con 149 millones de parámetros y una longitud de contexto de 8192 tokens, alcanza un nDCG@10 de 55,43 en el benchmark BEIR, superando a modelos como GTE-ModernColBERT y GTE-ModernBERT, que fueron entrenados con datos cerrados y de mayor calidad. Este resultado lo sitúa como nuevo estado del arte en BEIR para modelos de menos de 150 millones de parámetros.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors, y es compatible con la librería PyLate, el ecosistema sentence-transformers y Text Embeddings Inference (TEI). Su diseño multi-vector representa cada token de la consulta y del documento en un espacio de 128 dimensiones, lo que permite capturar similitudes semánticas a nivel de token mediante el operador MaxSim. Esta característica mejora la generalización fuera de dominio en tareas de recuperación de información, un punto crítico para aplicaciones reales donde los datos de entrenamiento no cubren todos los escenarios posibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT (late interaction multi-vector) basado en ModernBERT |
| Parametros totales | 149.015.808 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión no especificada) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ColBERT-Zero-unsupervised emplea la arquitectura de interacción tardía (late interaction) propuesta en el artículo original de ColBERT (Khattab y Zaharia, 2020). En lugar de comprimir toda la secuencia en un único vector, el modelo genera un embedding por token tanto para la consulta como para el documento. La similitud se calcula mediante el operador MaxSim, que toma el máximo de las similitudes coseno entre cada token de la consulta y todos los tokens del documento, y luego suma esos máximos. Este enfoque preserva información contextual fina y mejora la precisión en tareas de retrieval.

El preentrenamiento se realizó de forma completamente no supervisada sobre un conjunto de datos públicos de gran tamaño (238.998.494 muestras, según el tag dataset_size), utilizando la pérdida CachedContrastive. A diferencia de otros modelos ColBERT que requieren pares consulta-documento anotados, este modelo se entrena únicamente con datos no etiquetados, lo que elimina la dependencia de datasets supervisados costosos. La arquitectura subyacente es ModernBERT, un transformer optimizado para eficiencia, aunque los detalles específicos del número de capas, cabezas de atención y dimensiones ocultas no se han publicado en la información disponible. El entrenamiento se describe en el artículo arXiv 2602.16609, donde se compara con variantes supervisadas y se demuestra que el preentrenamiento multi-vector no supervisado es viable y competitivo.

## Capacidades

- Generación de embeddings de texto multi-vector con 128 dimensiones por token, adecuados para búsqueda semántica y similitud de documentos.
- Recuperación de información con interacción tardía, que captura coincidencias parciales entre tokens y mejora la generalización a dominios no vistos.
- Similitud de oraciones y documentos mediante agregación de los embeddings (por ejemplo, media o CLS).
- Compatibilidad con la librería PyLate para entrenamiento y evaluación de modelos late interaction.
- Integración con sentence-transformers y Text Embeddings Inference (TEI) para despliegue en producción.
- Soporte para tareas de retrieval en inglés, con capacidad de adaptación a otros idiomas mediante fine-tuning (aunque el modelo base está entrenado solo en inglés).
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso

- Búsqueda semántica en corpus científicos y técnicos: el modelo puede indexar artículos, patentes o informes técnicos y recuperar los documentos más relevantes para una consulta en lenguaje natural, gracias a su capacidad de capturar similitudes token a token incluso con vocabulario especializado.
- Recuperación aumentada por generación (RAG) para chatbots de dominio específico: al integrarse como componente de retrieval, permite a un sistema de preguntas y respuestas obtener fragmentos relevantes de una base de conocimiento antes de generar la respuesta, mejorando la precisión y reduciendo alucinaciones.
- Deduplicación de documentos y detección de plagio: los embeddings multi-vector permiten comparar documentos completos y detectar pasajes duplicados o parcialmente copiados, incluso cuando se reformulan las frases.
- Clasificación de textos mediante k-NN: se pueden generar embeddings para un corpus etiquetado y clasificar nuevos documentos por proximidad vectorial, sin necesidad de entrenar un clasificador específico.
- Verificación de hechos (fact-checking): el modelo puede recuperar evidencias relevantes de una base de datos de noticias o artículos para contrastar afirmaciones, como se evalúa en el dataset FEVER.
- Indexación y búsqueda en bases de conocimiento estructuradas: por ejemplo, en DBPedia o Wikidata, el modelo permite buscar entidades y propiedades a partir de descripciones textuales, facilitando tareas de enlazado de entidades y relleno de ontologías.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card (model-index) para los datasets Nano* se presentan a continuación. Estos valores no han sido verificados de forma independiente.

| Dataset | Accuracy@1 | NDCG@10 | MRR@10 | MAP@100 |
|---|---|---|---|---|
| NanoClimateFEVER | 0,42 | 0,3518 | 0,5177 | 0,2944 |
| NanoDBPedia | 0,80 | 0,6608 | 0,8742 | 0,5341 |
| NanoFEVER | 0,90 | 0,9268 | 0,9357 | 0,9017 |
| NanoFiQA2018 | 0,48 | no disponible | no disponible | no disponible |

En la página de HuggingFace se indica que el modelo alcanza un nDCG@10 de 55,43 en el benchmark BEIR, superando a GTE-ModernColBERT y GTE-ModernBERT, que fueron entrenados con datos cerrados y más fuertes. Este resultado lo convierte en el nuevo estado del arte en BEIR para modelos con menos de 150 millones de parámetros. No se han publicado resultados adicionales de benchmarks como MMLU o HumanEval, ya que el modelo no está diseñado para tareas de generación de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149 millones de parámetros, el modelo ocupa aproximadamente 596 MB en fp32, 298 MB en fp16 y 149 MB en int8. Cualquier GPU con al menos 2 GB de VRAM puede ejecutarlo sin problemas.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100, H100, o cualquier GPU con soporte CUDA. También puede ejecutarse en CPU para cargas de trabajo pequeñas, aunque con mayor latencia.
- Compatible con GPUs de consumo: sí, cabe en cualquier GPU moderna, incluso en las de gama baja.
- Opciones de despliegue: PyLate, sentence-transformers, Text Embeddings Inference (TEI), ONNX Runtime, y llama.cpp (si se convierte a GGUF, aunque no es el formato nativo).
- Latencia y throughput: no se han publicado datos específicos. Se estima que para un lote de 32 consultas con contexto de 512 tokens, la latencia media en una RTX 4090 sería inferior a 10 ms por consulta, pero estos valores son orientativos y dependen de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BEIR nDCG@10 | Licencia |
|---|---|---|---|---|
| ColBERT-Zero-unsupervised | 149M | 8192 | 55,43 | Apache 2.0 |
| GTE-ModernColBERT | no disponible | no disponible | inferior a 55,43 | no disponible |
| GTE-ModernBERT | no disponible | no disponible | inferior a 55,43 | no disponible |

Según la información publicada por el autor, ColBERT-Zero-unsupervised supera a GTE-ModernColBERT y GTE-ModernBERT en el benchmark BEIR, a pesar de que estos últimos fueron entrenados con datos supervisados y de mayor calidad. No se dispone de especificaciones técnicas detalladas de estos modelos comparables en las fuentes consultadas, por lo que la comparativa se limita al rendimiento declarado.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés. Su rendimiento en otros idiomas será significativamente inferior sin un fine-tuning previo con datos multilingües.
- No es un modelo generativo: no puede producir texto, solo representaciones vectoriales. Cualquier tarea que requiera generación de lenguaje debe combinarse con un modelo de texto.
- La longitud de contexto está limitada a 8192 tokens. Consultas o documentos más largos deberán truncarse, lo que puede perder información relevante.
- Al ser un modelo preentrenado sin supervisión, puede presentar sesgos presentes en los datos públicos de entrenamiento (por ejemplo, sesgos de género o procedencia geográfica en los textos).
- El rendimiento en dominios muy especializados o con vocabulario técnico puede ser inferior al de modelos ajustados específicamente para esos dominios.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se ofrece sin garantías y los resultados de los benchmarks no han sido verificados de forma independiente.
- No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset, lo que dificulta evaluar la cobertura y posibles solapamientos con conjuntos de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lightonai/ColBERT-Zero-unsupervised
- Artículo arXiv (ColBERT-Zero: To Pre-train Or Not To Pre-train ColBERT models): https://arxiv.org/html/2602.16609v1
- Repositorio PyLate (librería de entrenamiento y evaluación): https://github.com/lightonai/pylate
- Ejemplo de entrenamiento no supervisado: https://github.com/lightonai/pylate/blob/main/examples/train/ColBERT-zero/unsupervised.py
- Entrada en el leaderboard MTEB: https://leaderboard.mteb.org/models/lightonai/ColBERT-Zero-unsupervised
