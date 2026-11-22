# sachinyerrawar/sbert_raw_investo-finmodern_tri_merged

## Resumen

`sbert_raw_investo-finmodern_tri_merged` es un modelo de embeddings de frases (sentence transformer) desarrollado por el usuario `sachinyerrawar` y publicado en Hugging Face. Se construye a partir del checkpoint `sentence-transformers/bert-base-nli-mean-tokens` mediante un ajuste fino orientado a similitud semántica y recuperación de información en el dominio financiero, empleando la pérdida `CachedMultipleNegativesRankingLoss` sobre un conjunto de datos de 144.522 ejemplos (y un segundo conjunto de 11.687 ejemplos). El modelo tiene 109.482.240 parámetros y un tamaño de repositorio de 0,4 GB en formato safetensors.

El problema que resuelve es la generación de representaciones vectoriales densas para búsqueda semántica y recuperación de pasajes en textos financieros en inglés, como preguntas y respuestas sobre seguros, inversiones, planificación de jubilación o mercados. El nombre del modelo sugiere una fusión ("merged") de variantes entrenadas sobre datos de Investopedia y material financiero moderno, lo que apunta a un uso especializado en dominios de finanzas y seguros.

Es relevante porque los modelos de embeddings genéricos rinden peor en vocabulario y matices del dominio financiero, y este checkpoint declara métricas de recuperación sobre un conjunto de validación propio ("investo val") con un Accuracy@1 de 0,868 y un nDCG@10 de 0,9178. No obstante, se trata de un modelo recién publicado, con cero descargas y cero valoraciones en el momento de la ficha, y sus métricas no están verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder), con pooling de media para embeddings de frase |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT admite 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible |
| Libreria | sentence-transformers |
| Funcion de perdida | CachedMultipleNegativesRankingLoss |
| Tamano del repositorio | 0,4 GB |
| Modelo base | sentence-transformers/bert-base-nli-mean-tokens |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT en su variante base, inicializado desde `sentence-transformers/bert-base-nli-mean-tokens`, un checkpoint ya entrenado para similitud de frases con pooling de media. Sobre esa base se realiza un ajuste fino con la pérdida `CachedMultipleNegativesRankingLoss`, una variante de Multiple Negatives Ranking Loss que cachea los embeddings para permitir lotes efectivos grandes con menor coste de memoria, técnica habitual para entrenar recuperadores densos con pares pregunta-respuesta o pares positivos.

Los datos de entrenamiento declarados incluyen dos conjuntos: uno de 144.522 ejemplos y otro de 11.687 ejemplos, ambos orientados al dominio financiero según el nombre del modelo (Investopedia y finanzas modernas). No se especifica en la información disponible el número total de tokens, la composición exacta del corpus ni si hubo etapas de RLHF o DPO, algo poco habitual en modelos de embeddings. El sufijo "tri_merged" sugiere una fusión de pesos de tres variantes entrenadas, pero no se detalla el método de merge ni los checkpoints intermedios.

## Capacidades

- Generación de embeddings de frases y pasajes para similitud semántica y recuperación de información.
- Extracción de características (`feature-extraction`) a partir de texto en inglés.
- Búsqueda semántica y ranking de documentos mediante similitud coseno.
- Recuperación densa pregunta-respuesta en dominios financieros, de seguros e inversión.
- Agrupamiento y deduplicación semántica de textos.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un encoder de embeddings.
- Capacidad multilingüe limitada al inglés declarado.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en bases de conocimiento financiero: indexar artículos de Investopedia, guías de seguros y notas de inversión, y recuperar los pasajes más relevantes para una consulta del usuario mediante similitud coseno, aprovechando el ajuste específico del modelo al vocabulario financiero.
- Sistemas de preguntas y respuestas sobre finanzas personales: emparejar preguntas de usuarios con respuestas o fragmentos de documentación previamente indexados, usando el modelo como recuperador en una arquitectura RAG con un generador independiente.
- Atención al cliente en seguros y banca: clasificar y enrutar consultas entrantes comparando su embedding con el de plantillas o categorías predefinidas, reduciendo el coste de reglas manuales.
- Deduplicación y agrupamiento de documentos financieros: detectar artículos o informes duplicados o casi duplicados en un corpus mediante umbrales de similitud coseno sobre los embeddings generados.
- Moderación y filtrado de contenido: comparar mensajes de usuarios con listas de referencia de contenido prohibido o fraudulento en el ámbito financiero.
- Motor de recomendación de contenidos: sugerir artículos, guías o productos financieros similares a partir del embedding del contenido que el usuario está leyendo.
- Evaluación de similitud en pipelines de control de calidad: medir la coherencia semántica entre resúmenes generados y documentos fuente en dominios financieros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el conjunto de validación "investo val" para la tarea de recuperación de información:

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,868 |
| Cosine Accuracy@3 | 0,9275 |
| Cosine Accuracy@5 | 0,947 |
| Cosine Accuracy@10 | 0,9675 |
| Cosine Precision@1 | 0,868 |
| Cosine Precision@3 | 0,3092 |
| Cosine Precision@5 | 0,1894 |
| Cosine Precision@10 | 0,0968 |
| Cosine Recall@1 | 0,868 |
| Cosine Recall@3 | 0,9275 |
| Cosine Recall@5 | 0,947 |
| Cosine Recall@10 | 0,9675 |
| Cosine nDCG@10 | 0,9178 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de generación, ya que el modelo no es generativo. Tampoco hay comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para los pesos (109,5 M de parámetros), más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- En fp16: aproximadamente 0,22 GB para los pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, así como en CPU para cargas moderadas.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir grandes volúmenes de embeddings; en consumer, RTX 4090 o RTX 3090 permiten procesar lotes grandes con baja latencia.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (el modelo declara compatibilidad con endpoints), `vLLM` (soporte de embeddings), `FastEmbed` y exportación a ONNX; también es viable en CPU con `sentence-transformers`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un BERT base, se espera un throughput alto en GPU (miles de frases por segundo en lote), pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sbert_raw_investo-finmodern_tri_merged | 109,5 M | no disponible | apache-2.0 | Ajustado a dominio financiero; métricas declaradas solo en "investo val" |
| sentence-transformers/bert-base-nli-mean-tokens | 109,5 M | 512 tokens (BERT base) | apache-2.0 | Modelo base genérico de similitud de frases; sin ajuste financiero |
| BAAI/bge-base-en-v1.5 | 109 M | 512 tokens | MIT | Recuperador denso popular con buen rendimiento general en MTEB |
| intfloat/e5-base-v2 | 109 M | 512 tokens | MIT | Recuperador denso con instrucciones, ampliamente usado en RAG |

No hay datos de benchmarks comparativos directos entre estos modelos y el presente checkpoint en la información disponible; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto ni soporta razonamiento, tool calling o agentes.
- Idioma limitado al inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Las métricas declaradas proceden del propio autor y no están verificadas (`verified: false`); deben tomarse con cautela.
- El conjunto de evaluación "investo val" es propio y no un benchmark público estándar, lo que dificulta la comparación con otros modelos.
- Riesgo de sesgos heredados del corpus financiero de entrenamiento (por ejemplo, sesgos de género, culturales o de clase en textos económicos).
- Posible sobreajuste al dominio financiero: el rendimiento en otros dominios puede ser inferior al de un modelo genérico.
- Cero descargas y cero valoraciones en el momento de la ficha: no hay evidencia de uso en producción ni validación comunitaria.
- Aunque la licencia es apache-2.0 y permite uso comercial, conviene revisar las licencias del modelo base y de los datos de entrenamiento, no detalladas.
- No se especifica la dimensión de embedding ni la longitud máxima de secuencia efectiva, lo que complica la integración sin inspeccionar el checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/sachinyerrawar/sbert_raw_investo-finmodern_tri_merged
- Modelo base: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
- Paper de Sentence-BERT: https://arxiv.org/abs/1908.10084
- Paper de Multiple Negatives Ranking Loss: https://arxiv.org/abs/2101.06983
- Documentación de sentence-transformers: https://www.sbert.net/
