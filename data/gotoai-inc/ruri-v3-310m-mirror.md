# GotoAI-Inc/ruri-v3-310m-mirror

## Resumen

Ruri v3 310m es un modelo de embeddings de texto en japones de proposito general desarrollado por cl-nagoya sobre la arquitectura ModernBERT-Ja. Este repositorio concreto (`GotoAI-Inc/ruri-v3-310m-mirror`) es un espejo no oficial, sin modificaciones en los pesos, del modelo original `cl-nagoya/ruri-v3-310m` en la revision `18b60fb8c2b9df296fb4212bb7d23ef94e579cd3`, mantenido por GotoAI como respaldo para servicios que dependen de el. No es un modelo generativo: es un encoder que produce representaciones vectoriales densas de 768 dimensiones para tareas de similitud semantica, recuperacion de informacion, clasificacion, clustering y reranking.

La relevancia de esta version frente a las anteriores (v1 y v2) radica en tres cambios tecnicos: la longitud de contexto pasa de 512 a 8192 tokens, el vocabulario se amplia de 32K a 100K tokens (lo que acorta las secuencias de entrada y mejora la eficiencia), y el tokenizador pasa a basarse unicamente en SentencePiece, eliminando la dependencia de herramientas externas de segmentacion de palabras japonesas. Con 314.611.968 parametros totales y 236M sin contar embeddings, alcanza un promedio de 77,24 en el benchmark JMTEB, superando a modelos de embeddings japoneses de mas de mil millones de parametros como PLaMo-Embedding-1B (76,10) y sarashina-embedding-v1-1b (75,50), y a las APIs de OpenAI text-embedding-3-large (73,97) y text-embedding-3-small (70,86).

El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, con un tamano de repositorio de 1,3 GB. Esta pensado para integrarse en pipelines de busqueda semantica, RAG y deduplicacion de documentos en japones, no para generacion de texto ni para conversacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional) sobre ModernBERT-Ja |
| Parametros totales | 314.611.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en el formato original) |
| Idiomas soportados | japones (ja) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension del embedding | 768 |
| Numero de capas | 25 |
| Vocabulario | 100K tokens (SentencePiece) |
| Parametros sin embeddings | 236M |
| Pipeline | sentence-similarity / feature-extraction |
| Modelo base | cl-nagoya/ruri-v3-310m |
| Dataset de fine-tuning | cl-nagoya/ruri-v3-dataset-ft |
| SHA-256 de model.safetensors | 8229a6c3bbb16aa1a563eb62df60855af75b5e6e9c586f2ae571d3ab30df2804 |

## Arquitectura y entrenamiento

Ruri v3 310m es un encoder transformer bidireccional basado en ModernBERT-Ja, con 25 capas, dimension oculta de 768 y 314,6 millones de parametros totales (236M excluyendo la matriz de embeddings). ModernBERT aporta dos innovaciones estructurales que el modelo hereda: atencion lineal con FlashAttention integrada, que acelera tanto la inferencia como el fine-tuning, y soporte nativo de secuencias largas, lo que permite procesar entradas de hasta 8192 tokens frente a los 512 de Ruri v1 y v2. El vocabulario de 100K tokens, tokenizado exclusivamente con SentencePiece, reduce el numero de tokens necesarios para representar texto japones y elimina la necesidad de pre-tokenizacion externa con herramientas como MeCab o Sudachi.

El fine-tuning se realizo sobre el dataset `cl-nagoya/ruri-v3-dataset-ft`. La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada. Una innovacion destacable en el uso del modelo es el esquema de prefijos "1+3": una cadena vacia para codificar significado semantico puro, `トピック: ` para clasificacion, clustering e informacion tematica, `検索クエリ: ` para consultas de recuperacion y `検索文書: ` para documentos a recuperar. Este esquema condiciona la representacion y es necesario respetarlo para obtener el rendimiento reportado.

## Capacidades

- Generacion de embeddings de texto japones de 768 dimensiones para similitud semantica y feature extraction.
- Recuperacion de informacion (retrieval) con contexto de hasta 8192 tokens, adecuado para documentos largos sin truncamiento agresivo.
- Clasificacion de texto y clustering semantico mediante el prefijo `トピック: `.
- Reranking de resultados de busqueda y pair classification.
- Busqueda semantica asimetrica consulta-documento mediante los prefijos `検索クエリ: ` y `検索文書: `.
- Tokenizacion SentencePiece sin pre-segmentacion externa del japones.
- Inferencia acelerada con FlashAttention 2 en GPUs compatibles.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modos de razonamiento multi-paso: es exclusivamente un encoder de representaciones.

## Casos de uso

- Busqueda semantica en japones: indexar un corpus de documentos con el prefijo `検索文書: ` y codificar las consultas de usuario con `検索クエリ: `, comparando por similitud coseno. Los 8192 tokens de contexto permiten indexar articulos y fichas tecnicas completas sin fragmentarlos en exceso.
- RAG (retrieval-augmented generation) sobre documentacion corporativa japonesa: el modelo actua como recuperador en la fase de retrieval de un pipeline RAG, alimentando a un LLM generativo con los pasajes mas relevantes. Su JMTEB de retrieval (81,89) lo hace competitivo frente a modelos tres veces mayores.
- Deduplicacion y near-duplicate detection: codificar registros de una base de datos y agrupar por similitud coseno para detectar entradas duplicadas o casi identicas en catalogos, tickets de soporte o bases de conocimiento.
- Clustering de feedback de usuarios: agrupar encuestas, resenas o tickets en japones usando el prefijo `トピック: ` para identificar temas recurrentes sin etiquetado previo.
- Clasificacion zero-shot y few-shot: usar los embeddings como features de entrada para un clasificador ligero (regresion logistica, SVM) en tareas de moderacion de contenido, enrutamiento de tickets o categorizacion de noticias.
- Reranking en motores de busqueda hibridos: combinar un retriever lexico (BM25) con el re-scoring de los candidatos mediante similitud de embeddings para mejorar la precision del top-k.
- Sistemas de recomendacion basados en contenido: representar descripciones de productos o articulos y calcular vecinos mas cercanos para sugerencias semanticamente relacionadas.
- Monitorizacion de similitud en produccion: detectar derivas semanticas comparando embeddings de lotes de documentos a lo largo del tiempo con un coste computacional bajo gracias a los 315M de parametros.

## Benchmarks y rendimiento

Resultados en JMTEB (evaluado con [JMTEB](https://github.com/sbintuitions/JMTEB)):

| Modelo | Parametros | Avg. | Retrieval | STS | Classification | Reranking | Clustering | PairClassification |
|---|---|---|---|---|---|---|---|---|
| Ruri-v3-30m | 37M | 74,51 | 78,08 | 82,48 | 74,80 | 93,00 | 52,12 | 62,40 |
| Ruri-v3-70m | 70M | 75,48 | 79,96 | 79,82 | 76,97 | 93,27 | 52,70 | 61,75 |
| Ruri-v3-130m | 132M | 76,55 | 81,89 | 79,25 | 77,16 | 93,31 | 55,36 | 62,26 |
| **Ruri-v3-310m (este modelo)** | **315M** | **77,24** | **81,89** | **81,22** | **78,66** | **93,43** | **55,69** | **62,60** |
| sarashina-embedding-v1-1b | 1,22B | 75,50 | 77,61 | 82,71 | 78,37 | 93,74 | 53,86 | 62,00 |
| PLaMo-Embedding-1B | 1,05B | 76,10 | 79,94 | 83,14 | 77,20 | 93,57 | 53,47 | 62,37 |
| OpenAI text-embedding-ada-002 | no disponible | 69,48 | 64,38 | 79,02 | 69,75 | 93,04 | 48,30 | 62,40 |
| OpenAI text-embedding-3-small | no disponible | 70,86 | 66,39 | 79,46 | 73,06 | 92,92 | 51,06 | 62,27 |
| OpenAI text-embedding-3-large | no disponible | 73,97 | 74,48 | 82,52 | 77,58 | 93,58 | 53,32 | 62,35 |
| GLuCoSE-base-ja | 133M | 70,44 | 59,02 | 78,71 | 76,82 | 91,90 | 49,78 | 66,39 |
| GLuCoSE-base-ja-v2 | 133M | 72,23 | 73,36 | 82,96 | 74,21 | 93,01 | 48,65 | 62,37 |
| amber-base | 130M | 72,no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de amber-base estan truncados en la informacion proporcionada; solo se conoce su promedio parcial (72,xx) y no se dispone del resto de metricas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,7-0,9 GB para los pesos (315M parametros x 2 bytes), mas overhead de activaciones y del runtime de PyTorch, lo que situa el consumo practico en torno a 1,5-2,5 GB con lotes pequenos y secuencias cortas.
- En FP32: alrededor de 1,3 GB solo de pesos, con consumo total tipico de 2,5-3,5 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090. Tambien es viable en GPUs de 8 GB e incluso en CPU para cargas de baja concurrencia.
- GPUs de datacenter recomendadas para alto throughput: A100 (40/80 GB), H100, L40S, con margen sobrado para lotes grandes y secuencias de 8192 tokens.
- Opciones de despliegue: `sentence-transformers` (recomendado, requiere transformers >= 4.48.0), `transformers` con `AutoModel`, y FlashAttention 2 (`pip install flash-attn --no-build-isolation`) en GPUs compatibles para acelerar inferencia y fine-tuning. Para servir a escala, el modelo puede exportarse a ONNX o integrarse en servidores de embeddings propios; no se documentan integraciones especificas con vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no se publican cifras concretas en la model card. Por el tamano del modelo y el soporte de FlashAttention, se espera un throughput alto en GPU moderna, pero no hay mediciones oficiales disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Avg. JMTEB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ruri-v3-310m | 315M | 8192 | 77,24 | Apache 2.0 | Hugging Face (original y espejo) |
| PLaMo-Embedding-1B | 1,05B | no disponible | 76,10 | no disponible en la informacion | Hugging Face (pfnet) |
| sarashina-embedding-v1-1b | 1,22B | no disponible | 75,50 | no disponible en la informacion | Hugging Face (sbintuitions) |
| GLuCoSE-base-ja-v2 | 133M | no disponible | 72,23 | no disponible en la informacion | Hugging Face (pkshatech) |
| OpenAI text-embedding-3-large | no disponible (API) | no disponible | 73,97 | propietaria | API de pago |

Ruri-v3-310m ofrece el mejor promedio JMTEB de la comparativa con menos de un tercio de los parametros de PLaMo-Embedding-1B y sarashina-embedding-v1-1b, y con licencia Apache 2.0 explicita, lo que facilita su uso comercial sin las ambiguedades de licencia de algunos competidores. Frente a text-embedding-3-large, gana en promedio (77,24 vs 73,97) y en retrieval (81,89 vs 74,48), aunque pierde ligeramente en STS (81,22 vs 82,52) y en classification (78,66 vs 77,58 a favor de Ruri). La ventaja principal es el despliegue local sin coste por token y sin dependencia de API externa.

## Limitaciones y advertencias

- El modelo solo soporta japones. Su rendimiento en otros idiomas, incluido el castellano, no esta documentado y previsiblemente sera muy inferior.
- Es un encoder de embeddings, no un modelo generativo: no produce texto, no razona de forma autonoma y no soporta tool calling ni agentes.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en similitud semantica: embeddings cercanos no garantizan equivalencia factual, especialmente en dominios tecnicos o con negaciones.
- El esquema de prefijos (`トピック: `, `検索クエリ: `, `検索文書: `) es parte del contrato de uso; omitirlo o mezclar prefijos degrada el rendimiento respecto a los benchmarks publicados.
- La model card no documenta sesgos especificos del corpus de entrenamiento ni evaluaciones de robustez ante texto coloquial, dialectos o japones informal.
- Este repositorio es un espejo no oficial mantenido por GotoAI. Aunque los pesos son byte-identicos a la revision original (verificable por el SHA-256 publicado), las cuestiones, citas e incidencias deben dirigirse al repositorio original `cl-nagoya/ruri-v3-310m`, que puede tener revisiones mas recientes.
- La licencia Apache 2.0 permite uso comercial, pero el espejo solo anade el texto completo de la licencia como archivo `LICENSE`; conviene verificar la licencia en el repositorio upstream antes de un despliegue en produccion.
- No se publican datos sobre cuantizacion (GGUF, ONNX, int8); quien necesite formatos optimizados para CPU o edge debera convertirlos por su cuenta.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/GotoAI-Inc/ruri-v3-310m-mirror
- Modelo original: https://huggingface.co/cl-nagoya/ruri-v3-310m
- Revision espejada del original: https://huggingface.co/cl-nagoya/ruri-v3-310m/tree/18b60fb8c2b9df296fb4212bb7d23ef94e579cd3
- Coleccion ModernBERT-Ja: https://huggingface.co/collections/sbintuitions/modernbert-ja-67b68fe891132877cf67aa0a
- Dataset de fine-tuning: https://huggingface.co/datasets/cl-nagoya/ruri-v3-dataset-ft
- Repositorio JMTEB: https://github.com/sbintuitions/JMTEB
- Paper de referencia (arXiv 2409.07737): https://arxiv.org/abs/2409.07737
- Ruri-v3-30m: https://huggingface.co/cl-nagoya/ruri-v3-30m
- Ruri-v3-70m: https://huggingface.co/cl-nagoya/ruri-v3-70m
- Ruri-v3-130m: https://huggingface.co/cl-nagoya/ruri-v3-130m
- PLaMo-Embedding-1B: https://huggingface.co/pfnet/plamo-embedding-1b
- sarashina-embedding-v1-1b: https://huggingface.co/sbintuitions/sarashina-embedding-v1-1b
- GLuCoSE-base-ja: https://huggingface.co/pkshatech/GLuCoSE-base-ja
- GLuCoSE-base-ja-v2: https://huggingface.co/pkshatech/GLuCoSE-base-ja-v2
- amber-base: https://huggingface.co/retrieva-jp/amber-base
