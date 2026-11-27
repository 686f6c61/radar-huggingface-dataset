# CheezOne/reranker-chinese-japanese-korean-small

## Resumen

CheezOne/reranker-chinese-japanese-korean-small es un cross-encoder de 141 millones de parametros disenado para la fase de reranking dentro de pipelines de recuperacion aumentada por generacion (RAG) y busqueda, con foco en chino, japones y coreano. Lo desarrolla CheezOne y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Su proposito es reordenar las candidaturas devueltas por un recuperador de primera fase (BM25 o un modelo de embeddings) para mejorar la precision final de los resultados.

El modelo se obtiene por destilacion del reranker BAAI/bge-reranker-v2-m3 (568M), del que hereda las etiquetas de relevancia sobre 551.000 pares consulta-pasaje. Frente a su profesor, sacrifica 2,2 puntos de nDCG de media pero se ejecuta 3,7 veces mas rapido, lo que lo hace viable en CPU y en entornos con presupuesto de latencia ajustado. Su ventana de contexto alcanza los 8.000 tokens, aunque el entrenamiento se realizo con longitud maxima de 384.

Es relevante ahora porque cubre un hueco practico: rerankers multilingues ligeros y de licencia permisiva para idiomas CJK, con exportacion ONNX en fp32 e int8 y soporte directo en transformers.js, LangChain, LlamaIndex y Haystack. Ademas, su integracion en navegador mediante el demo oficial permite evaluar la calidad sin desplegar infraestructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (mmBERT-small) |
| Parametros totales | 140.641.921 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.000 tokens (entrenado a 384) |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (230 MB); cuantizacion adicional no documentada |
| Idiomas soportados | zh, ja, ko, th, id, en, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (model.onnx y model_quantized.onnx) |

## Arquitectura y entrenamiento

Se trata de un cross-encoder, es decir, un clasificador de pares (consulta, pasaje) que procesa ambos textos conjuntamente y emite un logit de relevancia. La base es jhu-clsp/mmBERT-small, un modelo de la familia ModernBERT de 141M de parametros, adecuado para tareas de clasificacion de texto con coste de inferencia bajo. La cabeza de clasificacion produce una puntuacion cruda (logit) que puede normalizarse con una sigmoide para obtener valores entre 0 y 1.

El entrenamiento sigue un esquema de destilacion desde BAAI/bge-reranker-v2-m3. El profesor genero puntuaciones sobre 551.000 pares consulta-pasaje. Los datos provienen del dataset CheezOne/reranker-train-chinese-japanese-korean (51.858 grupos de consultas), construido con T2Ranking para chino y Mr. TyDi para japones, coreano, tailandes e ingles. La funcion de perdida combina una KL listwise contra las puntuaciones del profesor mas un termino MSE con peso 0,05. Se entrenaron 2 epocas con tasa de aprendizaje 5e-5, longitud maxima de 384 y una unica GPU L40. El 77% de los grupos de entrenamiento son en chino; el indonesio no aparece en el corpus, por lo que su rendimiento en ese idioma es zero-shot. Las consultas de MIRACL se eliminaron del conjunto de entrenamiento.

## Capacidades

- Reranking de pares consulta-pasaje mediante cross-encoder, con salida de logits ordenables.
- Soporte multilingue para chino, japones, coreano, tailandes, indonesio e ingles, con sesgo de entrenamiento hacia el chino.
- Integracion con stacks RAG: LangChain (HuggingFaceCrossEncoder y CrossEncoderReranker), LlamaIndex (SentenceTransformerRerank) y Haystack 3 (SentenceTransformersSimilarityRanker).
- Ejecucion en navegador y Node mediante transformers.js con pesos ONNX int8.
- Inferencia en CPU con cuantizacion int8, manteniendo nDCG dentro de 0,003 respecto a PyTorch en zh/ja/ko.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- No es un recuperador: requiere un primer paso de recuperacion (BM25 o embeddings) sobre el que aplicar el reranking.

## Casos de uso

- RAG sobre documentacion corporativa en chino, japones o coreano: se recuperan los 50-100 pasajes mas relevantes con BM25 o un modelo de embeddings y se reordenan con este cross-encoder para seleccionar los 5 mejores antes de pasarlos al LLM generador, mejorando la precision del contexto inyectado.
- Busqueda empresarial multilingue en intranets: el modelo reordena resultados de un buscador lexico existente sin necesidad de reemplazarlo, lo que reduce el coste de migracion y mantiene la latencia baja gracias a su velocidad de inferencia.
- Atencion al cliente automatizada: en un sistema de FAQ o base de conocimiento en idiomas CJK, el reranker filtra respuestas candidatas y descarta las irrelevantes antes de que el modelo generativo componga la respuesta, reduciendo alucinaciones por contexto erroneo.
- Despliegue en el navegador con transformers.js: aplicaciones web de busqueda documental que ejecutan el reranking en el cliente con el modelo int8 de 230 MB, sin enviar las consultas a un servidor y sin coste de GPU.
- Filtrado de candidatos en pipelines de agentes: cuando un agente recupera evidencias de multiples fuentes, el reranker puntua y ordena los fragmentos para que el paso de razonamiento multi-turno reciba solo el material mas relevante, controlando el consumo de contexto.
- Evaluacion y ajuste de sistemas de recuperacion: al ser un modelo ligero y reproducible, sirve como baseline para comparar estrategias de chunking, embeddings o hibridacion en corpus multilingues sin incurrir en el coste de un reranker de 568M.
- Moderacion y triaje de contenido en foros o soporte: reordenar mensajes candidatos frente a una consulta de incidencia para priorizar los casos mas relacionados antes de la revision humana.

## Benchmarks y rendimiento

Resultados en reranking MIRACL (nDCG@10):

| Modelo | zh | ja | ko | th | id | en | avg |
|---|---|---|---|---|---|---|---|
| Este modelo (141M) | 0.525 | 0.716 | 0.727 | 0.788 | 0.608 | 0.629 | 0.666 |
| BAAI/bge-reranker-v2-m3 (568M, profesor) | 0.546 | 0.738 | 0.722 | 0.813 | 0.658 | 0.649 | 0.688 |
| hotchpotch/japanese-reranker-cross-encoder-small-v1 (118M) | 0.510 | 0.678 | 0.696 | 0.785 | 0.580 | 0.609 | 0.643 |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 (118M) | 0.498 | 0.640 | 0.679 | 0.768 | 0.552 | 0.580 | 0.620 |
| BAAI/bge-reranker-base (278M) | 0.460 | 0.561 | 0.586 | 0.686 | 0.508 | 0.552 | 0.559 |

Comparacion directa con otro reranker mmBERT pequeno, con las mismas 100 consultas por idioma y ejecucion en CPU:

| Modelo | zh | ja | ko | th | id | en | avg |
|---|---|---|---|---|---|---|---|
| Este modelo | 0.534 | 0.707 | 0.719 | 0.786 | 0.567 | 0.650 | 0.661 |
| Horizon-Labs/multilingual-reranker-small | 0.527 | 0.701 | 0.693 | 0.779 | 0.567 | 0.649 | 0.653 |

El autor senala que ambos modelos estan practicamente empatados y que solo la diferencia en coreano supera el ruido estadistico con 100 consultas. Ademas, el modelo de Horizon-Labs se entreno con el split de entrenamiento de MIRACL, mientras que este no. No se han publicado resultados de benchmarks en otros dominios (legal, medico, codigo).

## Requisitos de hardware

- VRAM estimada: el modelo en fp32 ocupa aproximadamente 560 MB de pesos (141M parametros); en int8 ONNX, 230 MB. La inferencia puede ejecutarse en CPU sin GPU.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el autor entreno con una L40. Para alto throughput en servidor, A100, H100 o L40S; para desarrollo, RTX 4090, RTX 3090 o inferiores.
- Cabe en GPU consumer: si, en todas las GPU con al menos 1 GB de memoria libre en fp32, y en CPU con int8.
- Opciones de despliegue: sentence-transformers, transformers (4.x), transformers.js (navegador y Node), text-embeddings-inference, ONNX Runtime, y los wrappers de LangChain, LlamaIndex y Haystack.
- Latencia y throughput: el autor reporta que es 3,7 veces mas rapido que BAAI/bge-reranker-v2-m3 (568M), pero no publica cifras absolutas de latencia ni de pares por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | nDCG@10 medio (MIRACL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 141M | 8k (entrenado a 384) | 0.666 | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| BAAI/bge-reranker-v2-m3 | 568M | no disponible en la informacion | 0.688 | no disponible en la informacion | Hugging Face |
| hotchpotch/japanese-reranker-cross-encoder-small-v1 | 118M | no disponible en la informacion | 0.643 | no disponible en la informacion | Hugging Face |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 | 118M | no disponible en la informacion | 0.620 | no disponible en la informacion | Hugging Face |
| BAAI/bge-reranker-base | 278M | no disponible en la informacion | 0.559 | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- El modelo esta sesgado hacia el chino: el 77% de los grupos de entrenamiento son en ese idioma, lo que puede penalizar el rendimiento relativo en japones, coreano y tailandes frente a un entrenamiento equilibrado.
- El indonesio es zero-shot: no aparece en los datos de entrenamiento, por lo que su rendimiento en ese idioma no esta garantizado fuera de la evaluacion realizada.
- No se ha evaluado en dominios legal, medico ni de codigo; su uso en esos entornos requiere validacion propia.
- Es un reranker, no un recuperador: no puede usarse como unico componente de busqueda; necesita un primer paso de recuperacion.
- Riesgo de alucinacion no aplica directamente porque no genera texto, pero una puntuacion erronea puede introducir pasajes irrelevantes en el contexto del LLM y degradar la respuesta final.
- La ventana de contexto es de 8k tokens, pero el entrenamiento se hizo a 384; el comportamiento con entradas mucho mas largas no esta documentado.
- Las puntuaciones son logits crudos; es necesario aplicar una sigmoide si se requieren valores normalizados entre 0 y 1.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base mmBERT y los datos de entrenamiento (T2Ranking, Mr. TyDi) tienen sus propias condiciones que conviene revisar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CheezOne/reranker-chinese-japanese-korean-small
- Demo en navegador (transformers.js, int8): https://huggingface.co/spaces/CheezOne/reranker-cjk-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/CheezOne/reranker-train-chinese-japanese-korean
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo profesor: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Otro reranker de referencia: https://huggingface.co/hotchpotch/japanese-reranker-cross-encoder-small-v1
- Otro reranker de referencia: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
- Otro reranker de referencia: https://huggingface.co/BAAI/bge-reranker-base
- Reranker comparable de Horizon-Labs: https://huggingface.co/Horizon-Labs/multilingual-reranker-small
- Candidatos de evaluacion MIRACL: https://huggingface.co/datasets/mteb/MIRACLReranking
- Guard de inyeccion de prompts del mismo autor: https://huggingface.co/CheezOne/prompt-injection-guard-chinese-japanese-korean-english-small
- Modelo de parafrasis del mismo autor: https://huggingface.co/CheezOne/paraphrase-multilingual-MiniLM-L12-v2-zh-ja-ko-en
- Generador de sprites del mismo autor: https://huggingface.co/CheezOne/pixel-art-sprite-generator-16x16
