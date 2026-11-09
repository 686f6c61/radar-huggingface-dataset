# mariakrissmer/ALIAS-MC-star

## Resumen

ALIAS MC* es un modelo de embeddings de frases (sentence-transformers) desarrollado por Maria Krissmer, orientado a la investigación biomédica y, en particular, al análisis de células individuales (single-cell). Se trata de un encoder basado en BERT que proyecta descripciones celulares y texto biomédico en un espacio vectorial compartido, de modo que conceptos equivalentes expresados con terminología distinta (por ejemplo, "CD8 T cell" y "cytotoxic T lymphocyte") queden próximos en el espacio de embeddings. El modelo corresponde a la variante etiquetada como `MC*` en el manuscrito asociado al proyecto ALIAS.

El modelo deriva de un ajuste fino sobre `NeuML/pubmedbert-base-embeddings`, un encoder PubMedBERT especializado en texto biomédico, y cuenta con 109.482.240 parámetros totales en formato safetensors, con un repositorio de 0,4 GB. Su pipeline declarado es `sentence-similarity` y está pensado exclusivamente para uso exploratorio en investigación, sin validación clínica.

Su relevancia actual radica en la creciente necesidad de representaciones semánticas robustas para datos biomédicos heterogéneos, donde la anotación manual de tipos celulares es costosa y la terminología es muy variable. El modelo se distribuye con licencia MIT y es compatible con Text Embeddings Inference y endpoints, lo que facilita su despliegue en pipelines de búsqueda semántica y clustering sobre corpus biomédicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), ajustado como SentenceTransformer |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo base Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT, con 109,48 millones de parámetros, adaptado mediante la librería sentence-transformers para producir embeddings de frases. Parte del modelo base `NeuML/pubmedbert-base-embeddings`, especializado en dominio biomédico, sobre el que se aplica un ajuste fino. El identificador interno del modelo es `MH_HIAI_Tcells_S5_200k_lr5e5`, lo que sugiere un entrenamiento sobre aproximadamente 200.000 ejemplos con una tasa de aprendizaje de 5e-5, aunque estos detalles no se documentan de forma explícita en la model card.

El conjunto de datos de entrenamiento se identifica como `S5_heldout_donor_semantic_shuffled_labels_200k`, orientado a la tarea de alinear descripciones celulares con texto biomédico. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO (poco habituales en modelos de embeddings). La procedencia del código y de los datos se documenta en la rama de reproducibilidad del manuscrito ALIAS en GitHub.

## Capacidades

- Generación de embeddings de frases y textos biomédicos en un espacio vectorial compartido.
- Similitud semántica entre descripciones celulares y terminología biomédica (por ejemplo, sinónimos de tipos celulares).
- Búsqueda semántica y recuperación de información sobre corpus biomédicos.
- Agrupamiento (clustering) y análisis de vecinos más cercanos sobre representaciones de células y textos.
- Alineación entre modalidades textuales del dominio biomédico (descripciones celulares y literatura).
- Compatibilidad con Text Embeddings Inference y endpoints para despliegue como servicio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Búsqueda semántica en literatura biomédica: indexar abstracts y artículos con el modelo y recuperar pasajes relevantes para una consulta en lenguaje natural, aprovechando el ajuste en dominio PubMed.
- Anotación asistida de tipos celulares: calcular la similitud entre descripciones de células procedentes de experimentos single-cell y un vocabulario controlado de tipos celulares para sugerir anotaciones.
- Deduplicación y normalización de términos: agrupar sinónimos y variantes terminológicas ("CD8 T cell", "cytotoxic T lymphocyte") en un pipeline de normalización de ontologías biomédicas.
- Clustering exploratorio de poblaciones celulares: generar embeddings de descripciones y aplicar clustering para descubrir agrupaciones semánticas antes de la revisión manual.
- Construcción de índices vectoriales para asistentes de investigación: integrar el modelo en un sistema RAG biomédico para recuperar contexto relevante en preguntas sobre inmunología o biología celular.
- Evaluación de similitud en pipelines de control de calidad: comparar descripciones generadas automáticamente con descripciones de referencia para detectar desviaciones semánticas.
- Experimentación académica en representaciones biomédicas: servir como baseline reproducible (rama de reproducibilidad del manuscrito) para comparar estrategias de embedding en tareas de single-cell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 109,48 millones de parámetros, en precisión completa (fp32) requiere aproximadamente 0,44 GB solo para pesos; en fp16 alrededor de 0,22 GB. El consumo total en inferencia depende del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para lotes moderados; GPU de datacenter como A100 o H100 no son necesarias para este tamaño, aunque pueden mejorar el throughput en cargas masivas.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en CPU para volúmenes pequeños.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (declarado compatible), endpoints de Hugging Face; el formato safetensors permite su carga directa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALIAS MC* (este modelo) | 109,48 M | no disponible | Biomédico / single-cell | MIT | Hugging Face |
| NeuML/pubmedbert-base-embeddings (base) | no disponible | no disponible | Biomédico | Apache 2.0 | Hugging Face |
| Modelos sentence-transformers genéricos (p. ej. all-MiniLM) | ~22 M (MiniLM-L6) | no disponible | General | Apache 2.0 | Hugging Face |

La comparación con alternativas específicas de embeddings biomédicos no está disponible en la información proporcionada; los datos de rendimiento comparativo no se han publicado.

## Limitaciones y advertencias

- Modelo destinado exclusivamente a investigación exploratoria; no ha sido validado para uso clínico.
- No se documentan los sesgos del modelo ni la composición detallada del dataset de entrenamiento, lo que dificulta evaluar sesgos de dominio o terminológicos.
- Riesgo de alucinación no aplicable en el sentido generativo (es un encoder), pero sí riesgo de similitudes espurias en el espacio de embeddings.
- Idiomas soportados no especificados; el modelo base es de dominio biomédico en inglés, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Longitud de contexto no documentada; textos largos pueden requerir truncamiento.
- Aunque la licencia del modelo es MIT, el modelo base es Apache 2.0 y se incluye su texto de licencia; conviene revisar ambas para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No se han publicado benchmarks que permitan comparar su rendimiento con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mariakrissmer/ALIAS-MC-star
- Modelo base: https://huggingface.co/NeuML/pubmedbert-base-embeddings
- Repositorio del manuscrito ALIAS (rama de reproducibilidad): https://github.com/MariaKrissmer/alias/tree/manuscript-reproducibility
