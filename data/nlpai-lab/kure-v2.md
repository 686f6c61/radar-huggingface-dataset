# nlpai-lab/KURE-v2

## Resumen

KURE-v2 es un modelo de retrieval bilingüe coreano-inglés basado en interacción tardía (late interaction) multi-vector, desarrollado por el laboratorio NLP & AI de la Universidad de Corea (nlpai-lab). Construido sobre el encoder base skt/A.X-Encoder-base (arquitectura ModernBERT), codifica cada token en un vector de 128 dimensiones y puntúa los pares consulta-documento mediante MaxSim. Con 154 millones de parámetros, alcanza un nDCG@10 medio de 0,8160 en las nueve tareas de retrieval del benchmark MTEB(kor, v2), superando a todos los modelos de vector único evaluados, incluido uno 175 veces mayor.

El modelo se entrena en dos etapas: primero un preentrenamiento contrastivo no supervisado sobre 20,7 millones de pares sin etiquetar (publicado como KURE-v2-unsupervised), seguido de un ajuste fino supervisado con pérdida contrastiva y destilación KL desde un reranker. Soporta documentos de hasta 8.192 tokens y no requiere prefijos de instrucción: la expansión de consulta a 64 tokens la gestiona el propio modelo. Su relevancia actual radica en ofrecer un retrieval de alta calidad para coreano con un coste computacional reducido, compitiendo favorablemente con modelos mucho más grandes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT (late interaction, multi-vector) sobre skt/A.X-Encoder-base (ModernBERT) |
| Parametros totales | 148.733.184 (154M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

KURE-v2 emplea la arquitectura ColBERT de interacción tardía: cada token de la consulta y del documento se codifica de forma independiente en un vector de 128 dimensiones, y la relevancia se calcula mediante MaxSim, que suma la similitud máxima de cada vector de consulta contra todos los vectores del documento. Esta aproximación multi-vector captura mejor el solapamiento léxico y semántico que los embeddings densos de vector único, especialmente en tareas de retrieval con vocabulario especializado o parafraseo.

El entrenamiento se realiza en dos fases. La primera es un preentrenamiento contrastivo no supervisado sobre 20,7 millones de pares de texto sin etiquetar, que produce el checkpoint KURE-v2-unsupervised. La segunda fase aplica ajuste fino supervisado con pérdida contrastiva y destilación de conocimiento KL desde un reranker, lo que permite transferir señales de relevancia más finas al modelo. El modelo base, skt/A.X-Encoder-base, es un encoder ModernBERT de 154M parámetros optimizado para eficiencia y contexto largo. No se han publicado detalles adicionales sobre la composición exacta del dataset de entrenamiento supervisado ni sobre el número total de tokens procesados.

## Capacidades

- Retrieval bilingüe coreano-inglés con interacción tardía multi-vector, puntuación MaxSim y expansión de consulta integrada a 64 tokens.
- Codificación de documentos largos de hasta 8.192 tokens, adecuada para artículos, informes y páginas web extensas.
- Indexación y búsqueda eficiente mediante el índice PLAID de PyLate, con soporte para recuperación top-k y reranking de candidatos.
- No requiere prefijos de instrucción ni plantillas de prompt: las consultas y documentos se codifican directamente.
- Integración con sentence-transformers a través de la clase MultiVectorEncoder, lo que facilita su uso en pipelines existentes.
- Compatible con text-embeddings-inference y endpoints de Hugging Face para despliegue en producción.
- Capacidad de reranking de listas de candidatos de primera etapa sin necesidad de construir un índice completo.

## Casos de uso

- Búsqueda semántica en corpus coreanos: KURE-v2 puede indexar grandes colecciones de documentos en coreano (noticias, artículos académicos, documentos legales) y recuperar los pasajes más relevantes para consultas en lenguaje natural, gracias a su ventana de 8.192 tokens y su alto rendimiento en tareas como LawIRKo y PubHealthQA.
- Sistemas de respuesta a preguntas (QA) sobre documentación corporativa: al combinarse con un reranker y un generador, permite construir pipelines de retrieval-augmented generation (RAG) para asistentes internos que necesitan consultar manuales, políticas o bases de conocimiento en coreano e inglés.
- Búsqueda jurídica especializada: con un nDCG@10 de 0,7550 en LawIRKo, el modelo es adecuado para recuperar sentencias, artículos legales y jurisprudencia, donde la precisión terminológica es crítica.
- Recuperación de información médica y de salud pública: su resultado de 0,8229 en PubHealthQA indica capacidad para encontrar respuestas fiables en corpus de salud, útil para portales de información sanitaria o asistentes de triaje.
- Búsqueda multilingüe mixta coreano-inglés: al estar entrenado en ambos idiomas, puede indexar documentos en inglés y recuperarlos con consultas en coreano (y viceversa), lo que resulta útil en entornos académicos o empresariales internacionales.
- Reranking de resultados de búsqueda: el modelo puede usarse como segunda etapa para reordenar los resultados de un recuperador denso o BM25, mejorando la precisión final sin necesidad de reindexar todo el corpus.
- Chatbots y asistentes con memoria de documentos: su capacidad para manejar documentos largos permite a un agente conversacional recuperar fragmentos relevantes de manuales de usuario o FAQs extensas antes de generar una respuesta.

## Benchmarks y rendimiento

KURE-v2 se evalúa en las nueve tareas de retrieval del benchmark MTEB(kor, v2), reportando nDCG@10. La siguiente tabla recoge los resultados publicados en la model card, comparados con otros modelos de interacción tardía y un modelo denso de gran tamaño.

| Modelo | Params | Media | AutoRAG | PubHealthQA | Ko-StrategyQA | LawIRKo | SQuADKorV1 | Belebele (ko-ko) | MrTidy | MLDR | MIRACL |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **nlpai-lab/KURE-v2** | 154M | **0,8160** | 0,9718 | 0,8229 | 0,8070 | 0,7550 | 0,9846 | 0,9660 | 0,5974 | 0,7159 | 0,7237 |
| nlpai-lab/KURE-v2-unsupervised | 154M | 0,7283 | 0,8822 | 0,8240 | 0,7818 | 0,7680 | 0,9427 | 0,9525 | 0,3496 | 0,6130 | 0,4411 |
| yjoonjang/colbert-ko-en-v2 | 149M | 0,8063 | 0,9686 | 0,8222 | 0,7940 | 0,7181 | 0,9846 | 0,9687 | 0,5783 | 0,6992 | 0,7230 |
| lightonai/mLateOn | 307M | 0,7906 | 0,9392 | 0,8061 | 0,7905 | 0,6431 | 0,9803 | 0,9608 | 0,5817 | 0,7005 | 0,7135 |
| perplexity-ai/pplx-embed-v1-late-0.6b | 596M | 0,7381 | 0,8557 | 0,8089 | 0,7973 | 0,7285 | 0,9696 | 0,9548 | 0,5400 | 0,2816 | 0,7064 |
| dragonkue/colbert-ko-0.1b | 149M | 0,6776 | 0,9700 | 0,7482 | 0,7364 | 0,4475 | 0,9794 | 0,9644 | 0,3966 | 0,2872 | 0,5685 |
| yjoonjang/colbert-ko-v1 | 149M | 0,6282 | 0,9557 | 0,6783 | 0,6560 | 0,4823 | 0,9594 | 0,9154 | 0,3279 | 0,2214 | 0,4575 |
| sionic-ai/comsat-embed-ko-8b-preview (denso) | 7,6B | 0,7927 | 0,8518 | 0,8871 | 0,8394 | 0,8164 | 0,9168 | 0,9853 | 0,6253 | 0,5157 | 0,6964 |

KURE-v2 supera a todos los modelos comparados en la media de las nueve tareas, incluido el denso de 7,6B parámetros, con una ventaja de 0,0233 puntos sobre el siguiente mejor modelo de interacción tardía (colbert-ko-en-v2).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 154M parámetros, los pesos en FP16 ocupan aproximadamente 300 MB. Sin embargo, la memoria total depende del número de tokens procesados, ya que se almacena un vector de 128 dimensiones por token. Para un lote de 32 documentos de 512 tokens, la memoria adicional es del orden de 8 MB por documento, lo que resulta manejable en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en lotes pequeños. Para indexación de corpus grandes con PyLate, se recomienda una GPU con 8-16 GB (por ejemplo, RTX 3060, RTX 4070, A10) para acelerar el proceso.
- Cabe en GPU de consumo: sí, el modelo es lo bastante pequeño para ejecutarse en GPUs de gama media como RTX 3060 o superiores, e incluso en CPU para tareas de baja latencia.
- Opciones de despliegue: PyLate (con índice PLAID), sentence-transformers (MultiVectorEncoder), text-embeddings-inference, y endpoints compatibles de Hugging Face. También puede usarse con vLLM si se adapta, aunque no es el flujo principal.
- Latencia y throughput: no se han publicado cifras oficiales. Dado el tamaño del modelo y la naturaleza multi-vector, la latencia por consulta es superior a la de un modelo denso equivalente, pero inferior a la de modelos de 500M+ parámetros. Para producción, se recomienda usar el índice PLAID para acelerar la búsqueda.

## Comparativa con modelos similares

| Modelo | Arquitectura | Params | Contexto | nDCG@10 medio (MTEB kor v2) | Licencia |
|---|---|---|---|---|---|
| **nlpai-lab/KURE-v2** | ColBERT (late interaction) | 154M | 8.192 | 0,8160 | Apache 2.0 |
| yjoonjang/colbert-ko-en-v2 | ColBERT (late interaction) | 149M | no disponible | 0,8063 | no disponible |
| lightonai/mLateOn | ColBERT (late interaction) | 307M | no disponible | 0,7906 | no disponible |
| perplexity-ai/pplx-embed-v1-late-0.6b | ColBERT (late interaction) | 596M | no disponible | 0,7381 | no disponible |
| sionic-ai/comsat-embed-ko-8b-preview | Denso (single-vector) | 7,6B | no disponible | 0,7927 | no disponible |

KURE-v2 ofrece el mejor rendimiento medio con el menor número de parámetros entre los modelos de interacción tardía comparados, y supera también al denso de 7,6B. Su licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de algunos competidores cuyas licencias no se especifican.

## Limitaciones y advertencias

- El modelo está optimizado para retrieval y similitud de frases; no es un modelo generativo ni de razonamiento. No debe usarse para tareas de generación de texto.
- Aunque soporta inglés, su rendimiento en tareas exclusivamente en inglés no está documentado; la evaluación se centra en el benchmark coreano MTEB(kor, v2). Para retrieval en inglés puro, pueden existir alternativas más adecuadas.
- La expansión de consulta a 64 tokens es automática y no configurable; en consultas muy cortas o ambiguas, la expansión puede introducir ruido.
- No se han publicado análisis de sesgos ni de robustez ante consultas adversariales. Como cualquier modelo de retrieval, puede reflejar sesgos presentes en los datos de entrenamiento.
- La memoria de indexación crece linealmente con el número de tokens de los documentos; para corpus muy grandes, el índice PLAID puede requerir una planificación cuidadosa del almacenamiento.
- No hay información sobre cuantizaciones oficiales (GGUF, int8, etc.), por lo que el despliegue en entornos con memoria muy limitada puede requerir conversiones manuales no validadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nlpai-lab/KURE-v2
- Checkpoint no supervisado: https://huggingface.co/nlpai-lab/KURE-v2-unsupervised
- Repositorio GitHub del proyecto KURE: https://github.com/nlpai-lab/KURE
- Organización nlpai-lab en Hugging Face: https://huggingface.co/nlpai-lab
- Documentación del proyecto en DeepWiki: https://deepwiki.com/nlpai-lab/KURE
- Leaderboard MTEB(kor, v2) Retrieval: https://mteb-leaderboard.hf.space/benchmark/MTEB(kor%2C%20v2)?types=Retrieval&s.summary=meanTask&d.summary=desc
