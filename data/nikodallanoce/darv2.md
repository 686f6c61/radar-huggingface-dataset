# nikodallanoce/DARv2

## Resumen

DARv2 es un modelo de embeddings densos para similitud semántica y recuperación de información, desarrollado por Niko Dalla Noce (nikodallanoce) y publicado en Hugging Face. Se basa en el modelo `jinaai/jina-embeddings-v5-text-nano-retrieval`, al que se le ha aplicado un ajuste fino (fine-tuning) con una pérdida de ranking de negativos múltiples (CachedMultipleNegativesRankingLoss) sobre un conjunto de datos de 48.119 ejemplos. El modelo está orientado al idioma italiano y, según los ejemplos de uso incluidos en su ficha, está especializado en el dominio legal y normativo, donde se utiliza para emparejar consultas con artículos de leyes o disposiciones.

Con 211,7 millones de parámetros, DARv2 es un modelo de tamaño medio que genera representaciones vectoriales de frases o párrafos, permitiendo búsquedas por similitud coseno. Su relevancia radica en ofrecer una alternativa ajustada para tareas de recuperación de información en italiano, un idioma con menos recursos que el inglés, y en un ámbito tan específico como el jurídico. El modelo se distribuye en formato safetensors y se integra con la librería sentence-transformers, lo que facilita su uso en pipelines de búsqueda semántica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en jina-embeddings-v5-text-nano-retrieval) |
| Parametros totales | 211.766.016 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Italiano (it) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `jinaai/jina-embeddings-v5-text-nano-retrieval`, un modelo de embeddings de la familia Jina, que emplea una arquitectura transformer con atención densa y está diseñado para recuperación de información. Sobre esta base, DARv2 se ha ajustado con la función de pérdida CachedMultipleNegativesRankingLoss, una variante de MultipleNegativesRankingLoss que optimiza el ranking de pares positivos frente a negativos dentro de un lote. El conjunto de entrenamiento contiene 48.119 ejemplos, aunque no se especifica la composición exacta del dataset ni el número de épocas. Los ejemplos mostrados en la model card sugieren que los datos provienen de textos legales italianos (artículos de códigos, normativas, etc.), lo que indica un ajuste de dominio para el sector jurídico. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de embeddings densos para frases y párrafos, optimizados para similitud coseno.
- Recuperación de información semántica en italiano, especialmente en el dominio legal y normativo.
- Búsqueda de documentos relevantes a partir de consultas en lenguaje natural.
- Clasificación y agrupación de textos por similitud semántica.
- Soporte para tareas de sentence-similarity y feature-extraction mediante sentence-transformers.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de representación vectorial.

## Casos de uso

- Búsqueda semántica en bases de datos jurídicas: permite localizar artículos de leyes, sentencias o disposiciones a partir de consultas formuladas en lenguaje natural, como la que aparece en el widget de ejemplo. El modelo empareja la consulta con los fragmentos normativos más relevantes mediante similitud coseno.
- Asistencia a profesionales legales: un abogado o asesor puede introducir una descripción de un caso y obtener referencias a normativas relacionadas, acelerando la investigación documental.
- Clasificación automática de documentos legales: los embeddings generados pueden alimentar clasificadores o sistemas de agrupación para organizar grandes volúmenes de textos normativos por temática o tipo de disposición.
- Sistemas de preguntas y respuestas sobre legislación: combinado con un motor de recuperación, DARv2 puede servir como componente de búsqueda en un sistema RAG (Retrieval-Augmented Generation) para responder consultas sobre normativa italiana.
- Deduplicación de documentos: al comparar embeddings, se pueden identificar textos duplicados o muy similares en repositorios legales, facilitando la limpieza de datos.
- Filtrado de contenido relevante en portales de transparencia: organismos públicos pueden usar el modelo para recomendar o mostrar normativas relacionadas con las consultas de los ciudadanos.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el model-index de Hugging Face, sobre un conjunto de validación (no se especifica el nombre del dataset). Las métricas son accuracy y precision con similitud coseno para distintos valores de k.

| Metrica | Valor |
|---|---|
| Cosine Accuracy@3 | 0,8492 |
| Cosine Accuracy@5 | 0,8994 |
| Cosine Accuracy@10 | 0,9330 |
| Cosine Accuracy@20 | 0,9665 |
| Cosine Accuracy@40 | 0,9888 |
| Cosine Accuracy@60 | 1,0000 |
| Cosine Accuracy@80 | 1,0000 |
| Cosine Accuracy@100 | 1,0000 |
| Cosine Accuracy@300 | 1,0000 |
| Cosine Precision@3 | 0,3352 |
| Cosine Precision@5 | 0,2346 |
| Cosine Precision@10 | 0,1397 |

Estos valores indican que, en el conjunto de validación, el modelo recupera correctamente el documento relevante entre los 60 primeros resultados en el 100% de los casos, aunque la precisión es baja para valores pequeños de k, lo que sugiere que la tarea de recuperación es difícil o que el corpus contiene muchos elementos similares. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 211,7 millones de parámetros, en precisión fp32 el modelo ocupa aproximadamente 850 MB, y en fp16 unos 425 MB. Esto permite ejecutarlo en GPUs con 2 GB de VRAM o más.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, o superiores. También funciona en CPU para inferencia por lotes pequeños.
- Despliegue: al ser un modelo de sentence-transformers, se puede servir con la librería `sentence-transformers` directamente, o mediante servidores de embeddings como Hugging Face Inference Endpoints, TEI (Text Embeddings Inference) o vLLM (si se convierte a un formato compatible).
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de este tamaño, la latencia típica en GPU es de unos pocos milisegundos por lote de 32 frases, y en CPU puede ser de decenas de milisegundos por frase.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para DARv2 frente a otros modelos de embeddings en italiano. Como referencia, se puede comparar con su modelo base, `jina-embeddings-v5-text-nano-retrieval`, que es multilingüe y tiene un tamaño similar, pero no está especializado en el dominio legal italiano. Otras alternativas genéricas para italiano son `intfloat/multilingual-e5-small` (118M parámetros) o `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (118M parámetros), pero no se han evaluado en los mismos benchmarks. La comparativa directa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para italiano y en un dominio legal específico; su rendimiento en otros idiomas o dominios será muy limitado.
- No se ha publicado la licencia, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Los benchmarks declarados provienen de un conjunto de validación no identificado y no han sido verificados de forma independiente; los resultados pueden no generalizar a otros corpus.
- La precisión para valores bajos de k es baja (0,335 en @3), lo que indica que el modelo puede recuperar muchos falsos positivos en tareas de búsqueda con pocos resultados.
- Al ser un modelo de embeddings, no genera texto ni respuestas; solo produce vectores. Cualquier sistema de preguntas y respuestas necesitará un componente adicional de generación.
- No se especifican sesgos conocidos, pero al entrenarse con datos legales italianos, puede reflejar los sesgos presentes en dicha normativa (por ejemplo, lenguaje formal y técnico, o desequilibrios en la representación de ciertos temas).
- El tamaño del repositorio (0.9 GB) sugiere que los pesos están en precisión fp32; para despliegues con menos memoria se recomienda convertir a fp16 o cuantizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikodallanoce/DARv2
- Perfil del autor en Hugging Face: https://huggingface.co/nikodallanoce
- Perfil del autor en GitHub: https://github.com/nikodallanoce/
- Modelo base: https://huggingface.co/jinaai/jina-embeddings-v5-text-nano-retrieval
