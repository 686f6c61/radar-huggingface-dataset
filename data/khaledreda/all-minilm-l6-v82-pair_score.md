# KhaledReda/all-MiniLM-L6-v82-pair_score

## Resumen

KhaledReda/all-MiniLM-L6-v82-pair_score es un modelo de sentence embeddings desarrollado por KhaledReda a partir de un fine-tuning del modelo base sentence-transformers/all-MiniLM-L6-v2. Su objetivo es mapear frases y párrafos a un espacio vectorial denso de 384 dimensiones, optimizado para tareas de similitud semántica, búsqueda semántica, minería de paráfrasis, clasificación y clustering. La relevancia de este modelo radica en su ajuste específico sobre el dataset `pairs_with_scores_v66`, compuesto por 55.014.339 pares de textos con puntuaciones de similitud, utilizando la función de pérdida CoSENTLoss. Con aproximadamente 22,7 millones de parámetros y una ventana de contexto de 256 tokens, es un modelo ligero que puede ejecutarse en CPU y en GPUs de consumo, lo que lo hace adecuado para aplicaciones de recuperación de información a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sentence Transformer basado en BERT (BertModel) con pooling de media de tokens y normalizacion |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de Sentence Transformers: un encoder Transformer de tipo BERT (BertModel) con una capa de pooling que calcula la media de los embeddings de los tokens (mean pooling), seguida de una capa de normalización. La dimensión de salida es de 384, y la función de similitud empleada es la similitud coseno. La longitud máxima de secuencia está fijada en 256 tokens.

El entrenamiento se realizó mediante fine-tuning sobre el modelo base `all-MiniLM-L6-v2` con el dataset `KhaledReda/pairs_with_scores_v66`, que contiene más de 55 millones de pares de textos anotados con puntuaciones de similitud. Se utilizó la función de pérdida CoSENTLoss, diseñada para optimizar el orden de similitud entre pares de frases, de modo que los embeddings resultantes reflejen mejor la similitud semántica puntuada. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para frases y párrafos, útiles para representar textos en espacios vectoriales.
- Similitud semántica mediante similitud coseno, apta para comparar textos cortos y párrafos de hasta 256 tokens.
- Búsqueda semántica y minería de paráfrasis, gracias al entrenamiento específico sobre pares con puntuaciones.
- Clasificación de textos y clustering, utilizando los embeddings como características de entrada para clasificadores o algoritmos de agrupación.
- Extracción de características para pipelines de NLP (feature extraction).
- Compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face (tag `endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible (no es un modelo de chat ni generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés (etiqueta `en`).
- Capacidades especiales como visión o audio: no disponibles.

## Casos de uso

- Busqueda semantica en bases de conocimiento internas: codificar consultas y documentos en vectores de 384 dimensiones y recuperar los documentos mas relevantes mediante similitud coseno. El modelo es adecuado por su ligereza y rapidez en CPU, permitiendo indexar grandes volumenes de textos.
- Deduplicacion de tickets de soporte: agrupar tickets similares calculando la similitud entre sus embeddings y aplicando un umbral. El entrenamiento con CoSENTLoss mejora la discriminacion entre pares con distintos grados de similitud.
- Clasificacion automatica de textos: usar los embeddings como entrada para un clasificador lineal (por ejemplo, regresion logistica o SVM). Al generar representaciones de 384 dimensiones, se reduce la necesidad de modelos grandes y se acelera el entrenamiento.
- Clustering de articulos o noticias: aplicar K-means o clustering jerarquico sobre los embeddings para agrupar documentos por tema. La ventana de 256 tokens limita el uso a textos cortos, pero es suficiente para titulares, resumenes o fragmentos.
- Mineria de parafrasis en corpus de preguntas y respuestas: detectar frases que expresan lo mismo mediante similitud coseno. El modelo fue entrenado especificamente con pares puntuados, lo que lo hace especialmente util para esta tarea.
- Recomendacion de contenido basada en texto: codificar items (productos, articulos, anuncios) y perfiles de usuario en el mismo espacio vectorial para recomendar items similares a los que el usuario ha interactuado. Su bajo coste computacional permite actualizar los embeddings con frecuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en precision FP32 (el repositorio ocupa 0.1 GB). Con cuantizacion, el uso de memoria es aun menor.
- GPU recomendadas: cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso CPU, gracias al reducido tamano del modelo.
- Compatible con hardware de consumo: si, se ejecuta sin problemas en ordenadores portatiles y servidores modestos.
- Opciones de despliegue: sentence-transformers en Python, text-embeddings-inference, endpoints de Hugging Face, y herramientas de busqueda vectorial como FAISS o ChromaDB.
- Latencia y throughput estimados: la inferencia es de orden de milisegundos por lote en CPU y mucho menor en GPU. Al ser un modelo de 22,7 millones de parametros, el throughput es alto, pero no se dispone de cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de salida | Licencia | Notas |
|---|---|---|---|---|---|
| KhaledReda/all-MiniLM-L6-v82-pair_score | 22.713.216 | 256 tokens | 384 | Apache 2.0 | Fine-tuning sobre pares con puntuaciones para similitud semantica |
| sentence-transformers/all-MiniLM-L6-v2 | 22.713.216 | 256 tokens | 384 | Apache 2.0 | Modelo base, sin el ajuste especifico sobre el dataset de pares |
| sentence-transformers/all-MiniLM-L12-v2 | no disponible | 256 tokens | 384 | Apache 2.0 | Alternativa con mas parametros y mayor capacidad, pero sin datos de rendimiento en esta ficha |

El modelo v82-pair_score se diferencia del modelo base por su entrenamiento adicional con CoSENTLoss sobre un dataset de pares puntuados, lo que puede mejorar la precision en tareas de similitud semantica dentro del dominio de ese dataset. Frente a all-MiniLM-L12-v2, el v82 es mas ligero y rapido, aunque puede tener menor capacidad expresiva al no disponer de los parametros adicionales.

## Limitaciones y advertencias

- Solo soporta texto en ingles. Cualquier uso en otros idiomas requerira un modelo distinto o una traduccion previa.
- Longitud maxima de entrada de 256 tokens, lo que impide procesar documentos largos o conversaciones extensas de una sola vez.
- No es un modelo generativo: no produce texto ni responde preguntas, solo genera vectores de embeddings.
- Los sesgos del dataset de entrenamiento (pares con puntuaciones) y del modelo base pueden trasladarse a los embeddings, afectando a la calidad en dominios muy alejados del corpus de entrenamiento.
- Al ser un modelo de representacion, no aplica el concepto de alucinacion en el sentido clasico, pero la calidad de la similitud puede ser deficiente en textos ambiguos o muy especializados.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero se recomienda revisar el dataset de entrenamiento para posibles restricciones o problemas de privacidad.
- No se han publicado benchmarks formales, por lo que el rendimiento en tareas concretas debe validarse experimentalmente antes de su uso en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/KhaledReda/all-MiniLM-L6-v82-pair_score
- Dataset de entrenamiento: https://huggingface.co/datasets/KhaledReda/pairs_with_scores_v66
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/UKPLab/sentence-transformers
- Busqueda de modelos Sentence Transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
