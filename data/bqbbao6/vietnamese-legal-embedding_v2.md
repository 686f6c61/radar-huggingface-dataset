# bqbbao6/vietnamese-legal-embedding_v2

## Resumen

`bqbbao6/vietnamese-legal-embedding_v2` es un modelo de embeddings de frases especializado en texto legal vietnamita, obtenido mediante fine-tuning del modelo multilingüe `intfloat/multilingual-e5-base` de Microsoft. Lo desarrolla el usuario independiente bqbbao6 y está pensado para tareas de similitud semántica y recuperación de información (information retrieval) sobre corpus jurídicos en vietnamita, un dominio en el que los modelos genéricos multilingües suelen rendir por debajo de lo necesario debido a la terminología técnica, la estructura de los documentos normativos y las convenciones de citación de artículos y cláusulas.

El modelo se distribuye como `SentenceTransformer` con pesos en formato safetensors y un total de 278.043.648 parámetros (la arquitectura XLM-RoBERTa base de la que deriva e5-base), lo que lo sitúa en la categoría de modelos de embeddings de tamaño medio: suficientemente ligero para desplegarse en GPU de consumo y en CPU con cuantización, y lo bastante expresivo para capturar matices semánticos en textos legales largos. El entrenamiento se realizó sobre un conjunto de 506.134 ejemplos y utiliza la convención de prefijos `query:` y `passage:` heredada de la familia E5, tal como muestran los ejemplos de la model card.

Su relevancia actual radica en la creciente demanda de sistemas RAG (retrieval-augmented generation) y de búsqueda semántica sobre normativa vietnamita, donde la recuperación precisa de cláusulas y artículos concretos es crítica. El modelo declara métricas muy altas en su conjunto de validación interno (Recall@1 de 0,859 y Recall@10 de 1,0), aunque se trata de resultados no verificados por terceros y sobre un conjunto de evaluación propio del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base, fine-tuning de `intfloat/multilingual-e5-base`) |
| Parametros totales | 278.043.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base e5-base admite 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | no disponible en los metadatos; el modelo base es multilingue y los datos de entrenamiento son en vietnamita |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity / feature-extraction |
| Funcion de perdida | CachedMultipleNegativesRankingLoss, MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 506.134 ejemplos |
| Prefijos de entrada | `query:` para consultas, `passage:` para documentos |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-base`, un encoder transformer basado en XLM-RoBERTa con 278 millones de parametros y 12 capas, entrenado originalmente por Microsoft con objetivos de contraste a gran escala sobre pares de texto multilingues. Sobre esa base, el autor aplica un fine-tuning supervisado con `SentenceTransformer`, empleando dos funciones de perdida de la familia de ranking por negativos: `MultipleNegativesRankingLoss` y su variante con cache `CachedMultipleNegativesRankingLoss`, que permite usar lotes efectivos mas grandes sin incrementar proporcionalmente el consumo de memoria. Esta combinacion es habitual en el ajuste de modelos de recuperacion densa porque aprovecha los negativos en el lote como ejemplos contrastivos.

El conjunto de entrenamiento consta de 506.134 ejemplos, presumiblemente pares consulta-documento o pares de similitud extraidos de corpus legales vietnamitas, aunque la model card no detalla la composicion exacta del dataset, el numero de tokens procesados ni si se aplicaron etapas de filtrado o deduplicacion. La convencion de prefijos `query:` y `passage:` se mantiene del modelo base y es obligatoria para reproducir el comportamiento esperado: el modelo espera que las consultas vayan precedidas de `query:` y los documentos de `passage:`. No se documentan innovaciones adicionales como atencion lineal, decodificacion especulativa ni modulos de atencion dispersa.

## Capacidades

- Generacion de embeddings densos de frases y parrafos para similitud semantica y recuperacion de informacion.
- Busqueda semantica sobre corpus legales en vietnamita, incluyendo articulos, clausulas y disposiciones normativas.
- Recuperacion de pasajes relevantes para una consulta dada en un pipeline RAG (retrieval-augmented generation).
- Clasificacion y agrupamiento (clustering) de documentos legales por similitud de contenido.
- Deteccion de duplicados y near-duplicates en bases de datos normativas.
- Soporte de prefijos `query:` y `passage:` para separar el espacio de consultas del de documentos.
- Capacidades multilingues heredadas del modelo base e5-base, aunque no validadas especificamente para este fine-tuning.
- No soporta tool calling, function calling, agentes ni generacion de texto: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en portales de legislacion vietnamita: indexar el corpus de decretos, circulares y leyes como `passage:` y permitir consultas en lenguaje natural con prefijo `query:`, recuperando los articulos mas relevantes mediante similitud coseno.
- Asistentes juridicos con RAG: integrar el modelo como retriever en un pipeline que alimente a un LLM generativo con los fragmentos normativos correctos antes de redactar una respuesta, reduciendo alucinaciones en materia legal.
- Revision de contratos y cumplimiento normativo: comparar clausulas de contratos con la normativa vigente para detectar disposiciones potencialmente incompatibles mediante umbrales de similitud.
- Sistemas de preguntas y respuestas sobre tramites administrativos: dado que los ejemplos de la model card cubren consultas sobre plazos, competencias ministeriales y requisitos tecnicos, el modelo es adecuado para resolver preguntas factuales acotadas a un articulo concreto.
- Deduplicacion y consolidacion de bases de datos legales: agrupar versiones de documentos, enmiendas y textos refundidos detectando pasajes casi identicos.
- Enrutamiento de consultas ciudadanas: clasificar consultas entrantes hacia el organismo o area normativa correspondiente comparando su embedding con descripciones de categorias predefinidas.
- Analisis de jurisprudencia: agrupar sentencias y resoluciones por tematica para estudios estadisticos o paneles de expertos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre un conjunto de evaluacion propio denominado `val eval` (no verificados por terceros):

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,859 |
| Cosine Accuracy@3 | 0,995 |
| Cosine Accuracy@5 | 0,999 |
| Cosine Accuracy@10 | 1,000 |
| Cosine Precision@1 | 0,859 |
| Cosine Precision@3 | 0,3317 |
| Cosine Precision@5 | 0,1998 |
| Cosine Precision@10 | 0,1000 |
| Cosine Recall@1 | 0,859 |
| Cosine Recall@3 | 0,995 |
| Cosine Recall@5 | 0,999 |
| Cosine Recall@10 | 1,000 |
| Cosine NDCG@10 | 0,9451 |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de embeddings y no de generacion. Tampoco se aportan metricas sobre conjuntos de evaluacion publicos y estandarizados de recuperacion en vietnamita.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,1 GB solo para pesos, mas overhead de activaciones y tokenizador; en la practica, entre 2 y 3 GB para lotes pequenos.
- VRAM estimada en FP16/BF16: alrededor de 0,6 GB de pesos, con un consumo total tipico de 1,5 a 2 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090, asi como en GPUs de datacenter (A100, H100, L4, T4) para despliegues de alto throughput.
- Ejecutable en CPU para cargas moderadas, con latencia mayor; adecuado para indexacion por lotes en maquinas sin GPU.
- Opciones de despliegue: `sentence-transformers` (nativo), `text-embeddings-inference` (el repo incluye el tag `text-embeddings-inference` y `endpoints_compatible`), Hugging Face Inference Endpoints, y conversion a ONNX para servir con `optimum` o `fastembed`. No se documenta soporte explicito de vLLM ni llama.cpp, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Notas |
|---|---|---|---|---|---|
| `bqbbao6/vietnamese-legal-embedding_v2` | 278 M | no disponible (base e5: 512 tokens) | Vietnamita (legal) | no disponible | Fine-tuning especifico de dominio; metricas solo en validacion propia |
| `intfloat/multilingual-e5-base` | 278 M | 512 tokens | Multilingue | MIT (segun el modelo original) | Modelo base; rendimiento generico, sin especializacion legal |
| `intfloat/multilingual-e5-large` | 560 M | 512 tokens | Multilingue | MIT (segun el modelo original) | Mayor capacidad y coste computacional; alternativa si el base se queda corto |
| `keepitreal/vietnamese-sbert` | no disponible | no disponible | Vietnamita | no disponible | Embedding vietnamita de proposito general, no especifico de dominio legal |

La comparativa con alternativas especificas de embeddings legales en vietnamita no esta disponible en la informacion proporcionada. La licencia del modelo base e5-base se cita como MIT segun la documentacion publica de Microsoft, pero la licencia de este fine-tuning concreto no aparece en los metadatos y debe confirmarse con el autor antes de un uso comercial.

## Limitaciones y advertencias

- La licencia no esta declarada en los metadatos del repositorio; no se puede asumir uso comercial permitido sin consultar al autor.
- Los benchmarks proceden de un conjunto de validacion propio del autor y estan marcados como `verified: false`; no hay evaluacion independiente ni comparacion con estandares publicos de recuperacion en vietnamita.
- El modelo esta especializado en vietnamita legal; su rendimiento en otros dominios o idiomas no esta documentado y probablemente sea inferior al de modelos de proposito general.
- Riesgo de falsos positivos en similitud: textos legales comparten formulismos y estructuras repetitivas, lo que puede elevar la similitud coseno entre pasajes no relacionados semanticamente; se recomienda calibrar umbrales con datos propios.
- La longitud de contexto efectiva no se documenta; si hereda los 512 tokens de e5-base, los articulos largos deberan fragmentarse, con el riesgo de perder contexto entre fragmentos.
- No se detalla la composicion del dataset de entrenamiento (506.134 ejemplos), por lo que no se puede evaluar la cobertura temporal ni la representatividad de la normativa vigente frente a textos derogados.
- Como modelo de embeddings, no genera texto ni razona; cualquier uso en un asistente juridico requiere un LLM generativo adicional y mecanismos de verificacion de fuentes.
- No se han publicado analisis de sesgos; en el dominio legal, los sesgos pueden manifestarse como una recuperacion desigual de normativa de determinadas regiones o epocas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bqbbao6/vietnamese-legal-embedding_v2
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Multiple Negatives Ranking / Cached MNRL (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Paper de SimCSE (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Documentacion de sentence-transformers: https://www.sbert.net/
- Documentacion de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
