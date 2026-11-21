# perplexity-ai/pplx-embed-v2-late-9b

## Resumen

pplx-embed-v2-late-9b es un modelo de embeddings de interacción tardía (late-interaction, estilo ColBERT) desarrollado por Perplexity AI para recuperación multimodal de texto, imágenes y documentos visuales. Forma parte de la familia `pplx-embed-v2-late`, junto con una variante de 0.6B, y está construido sobre Qwen3.5 con atención bidireccional. Cada token se proyecta a un vector de 128 dimensiones y la similitud consulta-documento se calcula mediante MaxSim, en lugar de colapsar todo el documento en un único vector.

El modelo resuelve el problema de la recuperación de información densa de alta precisión sobre corpus heterogéneos: páginas de documentos escaneados, capturas de pantalla, markdown enriquecido y texto plano. Al mantener una representación por token, conserva granularidad fina que los bi-encoders clásicos pierden, lo que se traduce en mejores resultados en benchmarks de recuperación visual (ViDoRe v3).

Con 8.392.695.024 parámetros totales (7.4B activos según la model card), contexto heredado de Qwen3.5 y licencia MIT, es relevante ahora porque ofrece una alternativa abierta y comercialmente permisiva a los retrievers multimodales propietarios, y porque comparte espacio de embeddings con la variante de 0.6B, lo que permite indexar con el modelo grande y consultar con el pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 con atención bidireccional, late-interaction (ColBERT) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | 7.4B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 33.6 GB) |

## Arquitectura y entrenamiento

El modelo es un retriever de interacción tardía tipo ColBERT construido sobre Qwen3.5 con atención bidireccional. En lugar de producir un vector por documento, genera un vector de 128 dimensiones por cada token, tanto para la consulta como para el documento, y puntúa la relevancia mediante MaxSim (suma de las similitudes máximas por token de consulta). Esta arquitectura preserva información granular y mejora la precisión en tareas de recuperación frente a bi-encoders de vector único. El modelo es multimodal: procesa texto, imágenes y documentos visuales, e incorpora un encoder de visión.

El entrenamiento se realizó por destilación desde un teacher interno de 18B también ColBERT, entrenado con datos de pares y tripletas. La destilación empleó un objetivo a nivel de token de estilo LEAF. En el caso del modelo de 9B, solo las ocho últimas capas del transformer se ajustaron por completo, mientras que el resto de capas y el encoder de visión se adaptaron mediante LoRA. La familia incluye una variante de 0.6B (340M activos) que comparte espacio de embeddings con la de 9B, lo que permite usar la pequeña como encoder de consultas sobre un índice construido con la grande.

## Capacidades

- Generación de embeddings multimodales para texto, imágenes y documentos visuales.
- Recuperación de información mediante similitud MaxSim sobre representaciones por token (128 dimensiones).
- Búsqueda cross-modal: consultas de texto contra documentos en imagen y viceversa.
- Representación multilingüe.
- Compatible con Sentence Transformers mediante `MultiVectorEncoder` (requiere sentence-transformers >= 6.0.0 y transformers >= 5.4.0).
- Interoperabilidad de espacio de embeddings con `pplx-embed-v2-late-0.6b`.
- Soporte de marcadores Q/D al inicio de la secuencia (diferencia respecto a PyLate, que los inserta en segunda posición).
- No soporta lotes mixtos de texto e imagen: requiere llamadas de codificación separadas.

## Casos de uso

- Búsqueda documental empresarial sobre PDFs escaneados y capturas: el modelo indexa páginas como imágenes y permite consultas textuales con MaxSim, adecuado para archivos con maquetación compleja donde el OCR introduce ruido.
- Recuperación aumentada (RAG) multimodal: sirve como retriever en pipelines que necesitan mezclar texto, tablas renderizadas e imágenes de producto, manteniendo granularidad por token para mejorar el ranking.
- Indexación con el modelo grande y consulta con el pequeño: gracias al espacio de embeddings compartido, se puede construir el índice con el 9B y atender consultas en producción con el 0.6B, reduciendo coste de inferencia en línea.
- Búsqueda visual de documentos técnicos: localización de figuras, diagramas o fragmentos de manuales a partir de descripciones en lenguaje natural.
- Moderación y deduplicación de contenido visual: comparación de imágenes y documentos para detectar duplicados o contenido similar a escala.
- Sistemas de recomendación basados en contenido: representación de ítems multimodales para similitud semántica entre catálogos heterogéneos.
- Investigación en recuperación multimodal: base reproducible con licencia MIT para experimentar con late-interaction sobre Qwen3.5.

## Benchmarks y rendimiento

| Modelo | Params activos | Dimensión | ViDoRe v3 (Image) nDCG@10 | ViDoRe v3 (Markdown) nDCG@10 |
|---|---|---|---|---|
| pplx-embed-v2-late-0.6b | 340M | 128 | 62.3% | 61.2% |
| pplx-embed-v2-late-9b | 7.4B | 128 | 65.2% | 64.7% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje general, ya que el modelo es un retriever y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 17-18 GB solo para pesos, más overhead de activaciones y del encoder de visión; en la práctica se recomienda 24 GB o más.
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) puede alojar el modelo en bf16 con margen limitado.
- En consumer GPU: viable en RTX 4090 y GPUs de 24 GB; en tarjetas de 16 GB requeriría cuantización, cuyos formatos no están documentados en la información disponible.
- Opciones de despliegue: Sentence Transformers (`MultiVectorEncoder`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Dimensión | ViDoRe v3 Image | Licencia |
|---|---|---|---|---|---|
| pplx-embed-v2-late-9b | 8.4B (7.4B activos) | no disponible | 128/token | 65.2% | MIT |
| pplx-embed-v2-late-0.6b | 340M activos | no disponible | 128/token | 62.3% | MIT |
| Teacher interno 18B ColBERT | 18B | no disponible | no disponible | no disponible | propietario |

No se dispone de datos de benchmarks de otros retrievers multimodales comparables (por ejemplo ColPali o ColQwen) en la información proporcionada, por lo que la comparativa se limita a la propia familia.

## Limitaciones y advertencias

- No admite lotes mixtos de texto e imagen; hay que codificar por separado, lo que complica pipelines heterogéneos.
- Los marcadores Q/D deben colocarse al inicio de la secuencia; PyLate los inserta en segunda posición, lo que puede degradar resultados si se usa esa librería sin ajustes.
- Requiere versiones recientes de sentence-transformers (>= 6.0.0) y transformers (>= 5.4.0), lo que puede limitar entornos legacy.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sí de falsos positivos en el ranking por sesgos del corpus de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible.
- Longitud de contexto no disponible; documentos muy largos pueden requerir troceado.
- Licencia MIT permite uso comercial, pero conviene revisar las condiciones heredadas de Qwen3.5 y del encoder de visión.
- El tamaño de 33.6 GB del repo y los ~17 GB en bf16 encarecen el despliegue frente a la variante de 0.6B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-9b
- Variante pequeña: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-0.6b
- Blog de Perplexity: https://www.perplexity.ai/hub/blog/multimodal-embeddings-beyond-a-single-vector
- Paper (arXiv): https://arxiv.org/abs/2610.29523
- Referencia LEAF: https://aclanthology.org/2026.acl-long.2008/
