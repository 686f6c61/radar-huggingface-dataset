# finvector/sbert_raw_finmodern_tri_merged

## Resumen

`sbert_raw_finmodern_tri_merged` es un modelo de embeddings de frases (sentence embeddings) desarrollado por finvector, construido mediante fine-tuning de `sentence-transformers/bert-base-nli-mean-tokens` con la librería sentence-transformers. Su propósito es generar representaciones vectoriales densas de frases y párrafos para tareas de similitud semántica, búsqueda semántica y extracción de características. Con 109.482.240 parámetros y un tamaño de repositorio de 0,2 GB, se posiciona como un modelo compacto orientado a la recuperación de información en dominios financieros o de informes corporativos, a juzgar por los ejemplos de la model card.

El modelo se entrenó con la función de pérdida `CachedMultipleNegativesRankingLoss` sobre un conjunto de datos de 11.687 ejemplos, lo que sugiere un ajuste orientado a tareas de ranking y recuperación (tripletas y pares positivos). La model card declara un resultado de 0,9904 de precisión coseno en una evaluación de tripletas, aunque se trata de una métrica no verificada de forma independiente y sobre un conjunto de evaluación no especificado.

Es relevante ahora porque los embeddings ligeros basados en BERT siguen siendo la opción por defecto para pipelines de RAG, búsqueda semántica y clustering de documentos cuando no se dispone de GPU de gran capacidad. Su licencia Apache 2.0 y su compatibilidad con `text-embeddings-inference` y endpoints lo hacen desplegable en infraestructura estándar, aunque su entrenamiento y evaluación están limitados al inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base), embeddings de frase con mean pooling |
| Parámetros totales | 109.482.240 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT admite 512 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base fine-tuneado desde `sentence-transformers/bert-base-nli-mean-tokens`, un checkpoint ya adaptado a la generación de embeddings de frases mediante mean pooling sobre las representaciones del token `[CLS]`/tokens. La arquitectura subyacente es un transformer encoder estándar de 12 capas y 768 dimensiones ocultas, con 109,48 millones de parámetros, que produce vectores de 768 dimensiones por frase.

El entrenamiento se realizó con la pérdida `CachedMultipleNegativesRankingLoss`, una variante de contrastive learning que aprovecha negativos en el batch y cachea representaciones para reducir el coste de memoria. El conjunto de entrenamiento consta de 11.687 ejemplos, un volumen modesto que sugiere un ajuste específico de dominio más que un entrenamiento generalista a gran escala. No se dispone de información sobre el número total de tokens procesados, la composición del dataset, ni si se aplicaron fases de RLHF o DPO (no aplicables habitualmente en modelos de embeddings). El sufijo "tri_merged" en el nombre sugiere una fusión de checkpoints o de variantes entrenadas con tripletas, pero no se detalla el procedimiento en la información disponible.

## Capacidades

- Generación de embeddings de frases y párrafos para similitud semántica (pipeline `sentence-similarity`).
- Extracción de características (`feature-extraction`) para representaciones vectoriales reutilizables.
- Recuperación de información y búsqueda semántica mediante similitud coseno.
- Clustering y deduplicación de documentos a partir de sus embeddings.
- Ranking de pasajes en pipelines de RAG (retrieval-augmented generation).
- Entrenado con pérdida de ranking por tripletas, lo que favorece la discriminación entre pasajes relevantes y no relevantes.
- Soporte multilingüe: limitado al inglés según la model card.
- No se documenta soporte de tool calling, agentes, visión, audio ni modos de razonamiento extendido; es un modelo puramente de representación.

## Casos de uso

- Búsqueda semántica en corpus financieros: el modelo puede indexar informes anuales, notas de prensa y filings, y recuperar pasajes relevantes por similitud coseno. Los ejemplos de la model card (informes de ventas, contingencias legales, contratos de suministro de gas) indican un ajuste hacia este tipo de texto.
- RAG sobre documentación corporativa: generar embeddings de chunks de documentos para que un LLM recupere contexto relevante antes de responder, reduciendo alucinaciones en dominios con jerga específica.
- Deduplicación de documentos: comparar embeddings de pares de textos para detectar duplicados o versiones casi idénticas en repositorios documentales.
- Clustering temático de noticias o informes: agrupar documentos por similitud semántica para análisis exploratorio o clasificación no supervisada.
- Moderación y detección de similitud: comparar mensajes de usuario contra una base de textos conocidos para detectar repeticiones o contenido casi idéntico.
- Motor de recomendación de contenido textual: calcular similitud entre artículos, FAQs o productos descritos en texto para sugerir elementos relacionados.
- Evaluación de calidad de traducciones o resúmenes: medir la similitud semántica entre el texto generado y una referencia mediante embeddings.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Triplet | triplet eval | Cosine Accuracy | 0,9904 |

No se han publicado en la información disponible resultados en benchmarks estándar como MMLU, HumanEval, GSM8K, MTEB o BEIR, ni comparaciones con otros modelos de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en FP32 (109 M de parámetros), menos de 0,5 GB en FP16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, T4, A10, A100 o H100 son válidas. Para lotes grandes, una GPU con más memoria mejora el throughput.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 2 GB o más de VRAM, e incluso puede ejecutarse en CPU con latencia aceptable para volúmenes moderados.
- Opciones de despliegue: sentence-transformers (Python), `text-embeddings-inference` (compatible según los tags del repo), Hugging Face Inference Endpoints, y exportación a ONNX para inferencia optimizada. No se documenta soporte explícito de vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Para un BERT base de 109 M de parámetros, se espera un throughput de cientos a miles de frases por segundo en GPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| finvector/sbert_raw_finmodern_tri_merged | 109,48 M | No disponible (base BERT: 512 tokens) | Inglés | Apache 2.0 | Fine-tune con 11.687 ejemplos, pérdida CachedMultipleNegativesRankingLoss |
| sentence-transformers/bert-base-nli-mean-tokens | ~109 M | 512 tokens | Inglés | Apache 2.0 | Modelo base del que deriva; entrenado en NLI |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | Inglés | Apache 2.0 | Más ligero y rápido, menor dimensión (384), ampliamente usado en RAG |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 tokens | Inglés | MIT | Referencia habitual en MTEB para recuperación en inglés |

La comparación con `all-MiniLM-L6-v2` y `bge-base-en-v1.5` es orientativa: no se dispone de resultados MTEB o BEIR de este modelo que permitan una comparación cuantitativa rigurosa. El modelo aquí descrito parte de un checkpoint NLI y se ajusta con un dataset pequeño, por lo que su rendimiento fuera del dominio financiero no está documentado.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- El conjunto de entrenamiento es pequeño (11.687 ejemplos) y de dominio aparentemente financiero; puede generalizar mal a otros dominios.
- La métrica de 0,9904 de precisión coseno en tripletas no está verificada y corresponde a un conjunto de evaluación no especificado; no debe interpretarse como rendimiento en MTEB o BEIR.
- No se documentan sesgos conocidos, pero al derivar de BERT entrenado en NLI, puede heredar sesgos de género, raza o ideología presentes en los datos originales.
- Riesgo de alucinación: no aplica directamente porque no genera texto, pero los embeddings pueden producir similitudes espurias en textos con vocabulario compartido pero significado distinto.
- Longitud de contexto limitada a 512 tokens por la arquitectura BERT base; los documentos largos deben trocearse.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener sus propias condiciones; conviene revisar la procedencia del dataset de 11.687 ejemplos, no documentada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta el procedimiento de fusión ("merged") ni qué checkpoints se combinaron, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finvector/sbert_raw_finmodern_tri_merged
- Modelo base: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de CachedMultipleNegativesRankingLoss / Multiple Negatives Ranking (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Librería sentence-transformers: https://www.sbert.net/
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
