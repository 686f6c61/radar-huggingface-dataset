# mariakrissmer/ALIAS-MA-star

## Resumen

ALIAS MA* es un modelo de embeddings de frases (SentenceTransformer) desarrollado por mariakrissmer en el contexto del proyecto ALIAS, orientado a la representación semántica conjunta de descripciones celulares y texto biomédico. Se trata de un fine-tuning del encoder NeuML/pubmedbert-base-embeddings, un BERT base especializado en literatura biomédica, y su propósito es mapear anotaciones de tipos celulares (por ejemplo, "CD8 T cell") y descripciones textuales ("cytotoxic T lymphocyte") a un espacio vectorial compartido donde la similitud semántica refleje equivalencias biológicas.

El modelo tiene 109.482.240 parámetros (aproximadamente 109,5 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,4 GB. Está etiquetado con los tags biology, single-cell, biomedical y alias, y su pipeline declarado es sentence-similarity. La relevancia actual radica en la necesidad de normalizar y alinear vocabularios heterogéneos en datos de single-cell y literatura científica, una tarea donde los embeddings genéricos suelen fallar por falta de dominio.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face y en la model card del autor. No se han publicado resultados de benchmarks ni detalles completos del proceso de entrenamiento más allá de los identificadores de datasets y del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base), fine-tuned como SentenceTransformer |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | NeuML/pubmedbert-base-embeddings |
| Pipeline | sentence-similarity |
| Libreria | sentence-transformers |
| Tamano del repositorio | 0,4 GB |
| Dimension de embedding | no disponible |
| Etiqueta en manuscrito | MA* |
| ID interno de modelo | MJ_HIAI_Tcells_S2_N3_200k_lr5e5 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder de tipo BERT base, heredado de NeuML/pubmedbert-base-embeddings, que a su vez deriva de PubMedBERT. Sobre esa base, el autor aplica un fine-tuning con la librería sentence-transformers para producir embeddings de frase comparables mediante similitud coseno. El modelo conserva la estructura del encoder original y añade el pipeline de pooling propio de SentenceTransformer, aunque la model card no detalla la estrategia exacta de pooling ni la dimensión final del vector.

El entrenamiento se realizó sobre dos conjuntos de datos identificados en la model card: `S2_heldout_donor_semantic_200k` y `N3_ncbi_literature_shuffled_labels`. El identificador interno `MJ_HIAI_Tcells_S2_N3_200k_lr5e5` sugiere un entrenamiento con 200.000 ejemplos y una tasa de aprendizaje de 5e-5, centrado en células T (Tcells) y con datos de literatura de NCBI. No se especifican el número total de tokens, la composición detallada del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal; se trata de un fine-tuning estándar de embeddings.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información.
- Alineación de descripciones de tipos celulares con texto biomédico en un espacio vectorial compartido.
- Búsqueda semántica y clustering sobre anotaciones de single-cell y literatura científica.
- Soporte de similitud coseno para tareas de matching y deduplicación de términos biológicos.
- Capacidad multilingüe: no disponible (la model card no documenta idiomas; el modelo base es predominantemente inglés biomédico).
- Tool calling / function calling: no disponible (no es una capacidad de este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo de embeddings, no generativo).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Normalización de anotaciones de tipos celulares: el modelo permite mapear etiquetas heterogéneas de distintos estudios de single-cell a un espacio común, facilitando la integración de datasets con vocabularios incompatibles.
- Búsqueda semántica en literatura biomédica: dado un término celular, recuperar pasajes de PubMed que describan el mismo concepto con otras palabras, usando similitud coseno sobre los embeddings.
- Deduplicación de ontologías y catálogos celulares: agrupar términos equivalentes ("CD8 T cell", "cytotoxic T lymphocyte") mediante clustering de embeddings para limpiar bases de datos de anotaciones.
- Enriquecimiento de pipelines de anotación automática: integrar el modelo como paso de verificación semántica que compara las etiquetas predichas por un clasificador con descripciones de referencia.
- Construcción de índices vectoriales para retrieval en bases de conocimiento biomédicas: indexar descripciones de tipos celulares y literatura para consultas en lenguaje natural con motores como FAISS o similares.
- Análisis exploratorio de datos de single-cell: proyectar descripciones textuales asociadas a clusters y estudiar su coherencia semántica con la literatura, como apoyo a la interpretación biológica.
- Evaluación de similitud entre anotaciones de donantes distintos: el dataset de entrenamiento incluye `heldout_donor`, lo que sugiere uso en escenarios de generalización entre donantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~109,5 millones de parámetros, la inferencia en fp32 requiere aproximadamente 0,44 GB de pesos, más overhead de activaciones; en fp16 alrededor de 0,22 GB. Cifras orientativas, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para lotes pequeños; se puede ejecutar en CPU para volúmenes moderados.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y superiores, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: sentence-transformers (nativo), Hugging Face Text Embeddings Inference (el tag `text-embeddings-inference` está presente), y potencialmente ONNX u otras runtimes compatibles con BERT, aunque no se documentan explícitamente.
- Latencia y throughput estimados: no disponibles. Para un BERT base de ~109M parámetros, la codificación de frases cortas suele ser del orden de milisegundos por frase en GPU moderna, pero no hay datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ALIAS MA* | 109.482.240 | no disponible | MIT | Hugging Face | Fine-tune de PubMedBERT para single-cell y texto biomédico |
| NeuML/pubmedbert-base-embeddings | no disponible | no disponible | Apache 2.0 | Hugging Face | Modelo base; embeddings biomédicos generales |
| PubMedBERT (base) | ~110M (BERT base) | 512 tokens (típico en BERT base) | MIT/Apache según variante | Hugging Face | Encoder de dominio biomédico sin fine-tuning de similitud |
| Sentence-transformers/all-MiniLM-L6-v2 | ~22M | 256 tokens (típico) | Apache 2.0 | Hugging Face | Embeddings genéricos, no especializados en biomedicina |

La comparativa se limita a los datos disponibles; no se han publicado métricas de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo declarado por el autor para uso exclusivamente de investigación exploratoria; no validado para uso clínico.
- No se han publicado benchmarks ni evaluaciones cuantitativas, por lo que su rendimiento real frente a alternativas es desconocido.
- Los sesgos del modelo base (PubMedBERT) y de los datasets de entrenamiento pueden propagarse; no se documentan análisis de sesgo.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en similitud semántica: términos distintos pueden quedar próximos en el espacio vectorial.
- Idiomas soportados no documentados; el modelo base está orientado a inglés biomédico, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Longitud de contexto no disponible; al derivar de un BERT base, probablemente limitada a 512 tokens, aunque no se confirma.
- Licencia MIT para el modelo, pero el modelo base es Apache 2.0; se incluye el texto de la licencia upstream en el repositorio. Verificar cumplimiento en uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.
- La fecha de creación indicada (2026-11-08) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mariakrissmer/ALIAS-MA-star
- Modelo base: https://huggingface.co/NeuML/pubmedbert-base-embeddings
- Repositorio de código y procedencia de datasets (rama de reproducibilidad del manuscrito): https://github.com/MariaKrissmer/alias/tree/manuscript-reproducibility
- Documentación de sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
