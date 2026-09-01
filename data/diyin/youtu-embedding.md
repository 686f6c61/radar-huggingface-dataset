# DIYIN/Youtu-Embedding

## Resumen

Youtu-Embedding es un modelo de embeddings de texto de propósito general desarrollado por Tencent Youtu Lab, diseñado para representar frases y documentos en vectores densos de alta calidad. Está orientado a tareas de recuperación de información, similitud semántica, clustering, reranking y clasificación, con un enfoque principal en el idioma chino. El modelo alcanzó la primera posición en el benchmark CMTEB (Chinese Massive Text Embedding Benchmark) con una puntuación de 77,58 en septiembre de 2025, lo que lo sitúa como uno de los modelos de embeddings chinos más competitivos del momento.

Con 2.410 millones de parámetros y una dimensión de embedding de 2048, Youtu-Embedding ofrece una longitud de secuencia máxima de 8K tokens, suficiente para procesar documentos extensos. Su principal innovación es un framework de fine-tuning colaborativo-discriminativo que aborda el problema de "negative transfer" en el aprendizaje multitarea, mediante un formato de datos unificado, funciones de pérdida diferenciadas por tarea y un mecanismo de muestreo dinámico de tareas. El modelo se distribuye bajo una licencia "other" con restricciones específicas, incluyendo la prohibición de uso en la Unión Europea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo encoder transformer, no especificado) |
| Parametros totales | 2.410.289.152 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (8K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | other (con restricciones, incluye extra_gated_eu_disallowed: true) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la documentación pública, pero por su naturaleza de modelo de embeddings y su tamaño (2B parámetros), se presume un transformer encoder con capas de atención, aunque no se confirma oficialmente. El entrenamiento se basa en un framework de fine-tuning colaborativo-discriminativo, descrito en el technical report (arXiv:2508.11442). Este framework unifica el formato de datos para múltiples tareas, aplica funciones de pérdida diferenciadas según la tarea (por ejemplo, contrastiva para recuperación, softmax para clasificación) y utiliza un muestreo dinámico de tareas para evitar que el aprendizaje de una tarea degrade el rendimiento de otras (negative transfer). No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del corpus ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de embeddings de texto para recuperación de información (IR), similitud semántica (STS), clustering, reranking y clasificación.
- Soporte de consultas y pasajes con instrucciones específicas: el modelo distingue entre queries (con prefijo "Instruction: ... Query:") y documentos (sin prefijo), lo que mejora la precisión en tareas de retrieval.
- Capacidad de procesar secuencias de hasta 8K tokens, adecuado para documentos largos.
- Multilingüe limitado: entrenado principalmente para chino, aunque podría generalizar a otros idiomas con menor rendimiento.
- No soporta tool calling, agentes ni razonamiento multi-step; es un modelo puramente de representación de texto.
- No incluye capacidades multimodales (solo texto).

## Casos de uso

- Búsqueda semántica en chino: integrar Youtu-Embedding en motores de búsqueda para recuperar pasajes relevantes a partir de consultas en lenguaje natural, aprovechando su alta precisión en CMTEB y su manejo de contexto largo.
- Sistemas de recomendación de contenido: generar embeddings de artículos, noticias o publicaciones para calcular similitudes y sugerir ítems relacionados a usuarios.
- Clustering de documentos: agrupar grandes colecciones de textos chinos (informes, correos, actas) por temas mediante la comparación de vectores, facilitando la organización y el análisis.
- Clasificación de texto: usar los embeddings como características de entrada para clasificadores supervisados en tareas como análisis de sentimiento, detección de spam o categorización de tickets de soporte.
- Reranking en pipelines de recuperación: combinar el modelo con un primer paso de búsqueda basada en BM25 u otro método, y luego rerankear los candidatos con las puntuaciones de similitud coseno de Youtu-Embedding para mejorar la relevancia final.
- Fine-tuning para dominios específicos: adaptar el modelo a dominios como legal, médico o financiero en chino, utilizando el código de entrenamiento proporcionado en el repositorio oficial, para obtener embeddings especializados.

## Benchmarks y rendimiento

El modelo reporta una puntuación de **77,58** en el benchmark CMTEB (Chinese Massive Text Embedding Benchmark), alcanzando el primer puesto en septiembre de 2025. No se han publicado resultados detallados de otros benchmarks (como MMLU, HumanEval o MTEB multilingüe) en la información disponible. Tampoco se dispone de comparativas numéricas con otros modelos de embeddings en el mismo documento.

## Requisitos de hardware

- VRAM estimada: con 2.410 millones de parámetros, en precisión fp16 los pesos ocupan aproximadamente 4,8 GB. Con overhead de activaciones y optimizaciones, se recomienda al menos 8 GB de VRAM para inferencia en lotes pequeños.
- GPU recomendadas: tarjetas con 8-16 GB de VRAM, como RTX 3080/3090, RTX 4070/4080, A10, A100 (para producción a gran escala). En cuantización de 8 bits o 4 bits, podría caber en GPUs consumer de 6-8 GB, aunque no se han publicado configuraciones oficiales.
- Despliegue: compatible con transformers (carga con trust_remote_code=True), sentence-transformers, y text-embeddings-inference (según los tags). También se puede servir con vLLM o llama.cpp si se convierte a GGUF, aunque no hay soporte oficial documentado.
- Latencia y throughput: no se han publicado mediciones oficiales. Para un modelo de 2B, se espera una latencia de decenas de milisegundos por lote en GPUs modernas, pero depende del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de embeddings chinos (como BGE, GTE, M3E, etc.) en la información proporcionada. La única referencia es su posición #1 en CMTEB, pero sin desglose por tarea ni comparación directa con alternativas. Por tanto, no se puede elaborar una tabla comparativa fiable.

## Limitaciones y advertencias

- Enfoque principal en chino: el modelo está entrenado y evaluado principalmente en chino; su rendimiento en otros idiomas puede ser significativamente inferior.
- Licencia restrictiva: la licencia "other" incluye la restricción `extra_gated_eu_disallowed: true`, lo que prohíbe su uso en la Unión Europea. Esto limita su adopción en entornos comerciales o de investigación dentro de la UE.
- Sin capacidades generativas: al ser un modelo de embeddings, no puede generar texto, responder preguntas abiertas ni mantener conversaciones; solo produce representaciones vectoriales.
- Riesgo de sesgos: al igual que otros modelos entrenados con datos web, puede reflejar sesgos presentes en el corpus de entrenamiento, especialmente en dominios sensibles.
- Alucinación no aplica directamente, pero los embeddings pueden verse afectados por ruido en los datos de entrenamiento, lo que podría degradar la calidad de las representaciones en dominios muy específicos.
- No se documentan limitaciones de contexto más allá de los 8K tokens; secuencias más largas requerirían truncamiento o estrategias de chunking.

## Enlaces

- Modelo en Hugging Face (copia de DIYIN): https://huggingface.co/DIYIN/Youtu-Embedding
- Modelo original de Tencent: https://huggingface.co/tencent/Youtu-Embedding
- Repositorio GitHub oficial: https://github.com/TencentCloudADP/youtu-embedding
- Technical report en arXiv: https://arxiv.org/abs/2508.11442
- Colección de modelos de DIYIN: https://huggingface.co/collections/DIYIN/embedding
