# evalstate/ettin-encoder-32m-colbert-nq-mnrl-meanmaxsim

## Resumen

Ettin-encoder-32m-colbert-nq-mnrl-meanmaxsim es un modelo de recuperación de información (information retrieval) de tipo multi-vector basado en la arquitectura ColBERT y en el encoder Ettin de 32 millones de parámetros. Lo publica el usuario evalstate en Hugging Face y deriva del modelo base jhu-clsp/ettin-encoder-32m, un encoder de la familia ModernBERT desarrollado por el grupo JHU-CLSP. El modelo no genera texto: produce representaciones multi-vector (una por token) que permiten puntuar pares consulta-documento mediante late interaction, la técnica de MaxSim introducida por ColBERT.

El problema que resuelve es el de la búsqueda semántica y el ranking de documentos con un coste computacional muy bajo. Con solo 31,88 millones de parámetros y un repositorio de 0,1 GB, está pensado para entornos donde el presupuesto de cómputo y de memoria es limitado, como la recuperación sobre corpus pequeños o medianos, prototipos de RAG o despliegues en CPU. Se ha ajustado con la pérdida MultiVectorMultipleNegativesRankingLoss sobre un conjunto de 96.658 ejemplos construido a partir de negativos duros de Natural Questions (NQ).

Es relevante ahora porque el ecosistema de recuperación densa tiende a modelos de cientos de millones o miles de millones de parámetros, y esta ficha demuestra que un encoder de 32M puede ofrecer resultados razonables en benchmarks reducidos (NanoMSMARCO, NanoNQ) manteniendo una licencia MIT permisiva y compatibilidad con text-embeddings-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, familia Ettin) con cabeza multi-vector ColBERT y late interaction (MaxSim) |
| Parametros totales | 31.883.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del encoder base jhu-clsp/ettin-encoder-32m; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma ColBERT: un encoder transformer procesa la consulta y el documento por separado y genera un embedding por cada token. La puntuacion de relevancia se calcula con MaxSim, es decir, para cada token de la consulta se toma la similitud maxima contra todos los tokens del documento y se suman esos maximos. Esta operacion de late interaction permite un ranking mas fino que un unico vector denso, a costa de almacenar una matriz de vectores por documento. El backbone es jhu-clsp/ettin-encoder-32m, un encoder pequeno de la familia Ettin, construida sobre ModernBERT con atencion lineal y sesgos posicionales rotatorios, aunque la model card no detalla la configuracion exacta de capas ni de dimensiones ocultas.

El ajuste fino se realizo con la perdida MultiVectorMultipleNegativesRankingLoss (MNRL) sobre 96.658 ejemplos, construidos a partir de negativos duros de Natural Questions. No se documenta en la informacion disponible si hubo una fase de RLHF, DPO ni un preentrenamiento adicional; el modelo se marca como generated_from_trainer, lo que indica que procede directamente de un job de entrenamiento de sentence-transformers. La innovacion principal es la combinacion de un backbone muy pequeno con entrenamiento especifico en negativos duros, orientada a maximizar la calidad de recuperacion por parametro.

## Capacidades

- Extraccion de embeddings multi-vector para recuperacion de informacion (feature-extraction).
- Ranking de documentos mediante late interaction y puntuacion MaxSim.
- Busqueda semantica sobre pares consulta-documento en ingles.
- Entrenado especificamente con negativos duros de Natural Questions, lo que mejora la discriminacion entre documentos similares.
- Compatible con text-embeddings-inference y con endpoints de Hugging Face.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Busqueda semantica en corpus pequenos y medianos: el modelo indexa documentos como matrices de vectores y responde a consultas en ingles con puntuacion MaxSim, adecuado cuando el corpus cabe en memoria y no se justifica un modelo de mayor tamano.
- Prototipos de RAG (retrieval-augmented generation): sirve como recuperador ligero en pipelines donde el generador es un LLM aparte; su tamano de 32M permite ejecutarlo en CPU junto al generador sin competir por VRAM.
- Ranking de segunda fase (reranking): dada una lista de candidatos recuperados por un retriever de primer nivel, el modelo reordena con late interaction y mejora la precision en el top-k, con un coste de inferencia muy bajo.
- Despliegue en entornos con recursos limitados: con 0,1 GB de pesos y licencia MIT, puede ejecutarse en contenedores pequenos, dispositivos edge o funciones serverless sin GPU dedicada.
- Evaluacion y experimentacion academica: como baseline reproducible de ColBERT a escala 32M, permite comparar tecnicas de entrenamiento con negativos duros frente a encoders densos de un solo vector.
- Filtrado de documentos en pipelines de datos: clasificar pares consulta-documento por relevancia antes de un procesamiento mas costoso, aprovechando el bajo coste por par.
- Sistemas de busqueda interna sobre documentacion tecnica en ingles: indexar manuales, FAQs o tickets y recuperar los fragmentos mas relevantes para una consulta del usuario.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | NanoMSMARCO | NanoNQ |
|---|---|---|
| Accuracy@1 | 0,34 | 0,46 |
| Accuracy@3 | 0,50 | 0,62 |
| Accuracy@5 | 0,60 | 0,62 |
| Accuracy@10 | 0,72 | 0,74 |
| Precision@1 | 0,34 | 0,46 |
| Precision@3 | 0,1667 | 0,2133 |
| Precision@5 | 0,1200 | 0,1280 |
| Precision@10 | 0,0720 | 0,0780 |
| Recall@1 | 0,34 | 0,44 |
| Recall@3 | 0,50 | 0,59 |
| Recall@5 | 0,60 | 0,59 |
| Recall@10 | 0,72 | 0,70 |
| NDCG@10 | 0,5033 | 0,5736 |
| MRR@10 | 0,4364 | 0,5466 |
| MAP@100 | 0,4472 | 0,5339 |

No se han publicado en la informacion disponible resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 31,88M de parametros (unos 128 MB de pesos); en FP16, alrededor de 64 MB. El coste real depende del numero de documentos indexados y de la longitud de las secuencias.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es viable en RTX 3060, RTX 4090, A100 o H100, aunque no necesita GPU dedicada.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual e incluso en CPU.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference, endpoints de Hugging Face; no se documentan integraciones con vLLM, llama.cpp u Ollama (no aplicables a un encoder de este tipo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en CPU y muy alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evalstate/ettin-encoder-32m-colbert-nq-mnrl-meanmaxsim | 31,88M | no disponible | ColBERT multi-vector | MIT | Hugging Face |
| jhu-clsp/ettin-encoder-32m (base) | ~32M | no disponible | Encoder denso | no disponible en la informacion | Hugging Face |
| ColBERTv2 (referencia) | ~110M | 512 tokens (tipico) | ColBERT multi-vector | no disponible en la informacion | Hugging Face / repositorios academicos |
| Encoders densos tipo MiniLM (referencia) | ~22M-33M | 512 tokens (tipico) | Bi-encoder de un vector | no disponible en la informacion | Hugging Face |

La comparativa se limita a referencias de categoria; no se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada para una comparacion numerica directa.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta garantizado.
- Es un modelo de recuperacion, no generativo: no produce respuestas, codigo ni razonamiento.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos en el ranking cuando los documentos comparten vocabulario con la consulta.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.
- El contexto maximo no se documenta; secuencias largas pueden degradar la calidad o requerir truncado.
- El almacenamiento multi-vector crece con el numero de tokens por documento, lo que puede encarecer la indexacion a gran escala frente a un bi-encoder de un solo vector.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base jhu-clsp/ettin-encoder-32m antes de un despliegue en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad, por lo que se recomienda evaluarlo en el dominio propio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evalstate/ettin-encoder-32m-colbert-nq-mnrl-meanmaxsim
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Paper de ColBERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de MaxSim / late interaction (arXiv:1705.00652): https://arxiv.org/abs/1705.00652
- Documentacion de sentence-transformers: https://sbert.net
- Documentacion de text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
