# DataScience-UIBK/uibk-embedding-v1

## Resumen

UIBK-Embedding-v1 es un modelo de recuperación de información (retrieval) en inglés desarrollado por DataScience-UIBK (Universidad de Innsbruck). Su particularidad es que integra en un único codificador dos recuperadores: uno de interacción tardía estilo ColBERT (multi-vector, MaxSim por token) y uno denso (un único vector de frase de 768 dimensiones). El modelo está construido sobre ModernBERT-base, con un tronco compartido de 18 capas y 4 capas propias por cabeza, y produce vectores de 128 dimensiones con norma unitaria.

El modelo resuelve el problema clásico de elegir entre recuperación léxica por tokens (buena en coincidencias exactas de términos y frases) y recuperación semántica densa (buena en paráfrasis). En lugar de requerir dos índices o dos scorers, UIBK-Embedding-v1 codifica ambos en un solo índice ColBERT: aplicar MaxSim simple sobre su salida equivale a calcular «token MaxSim + 0,75 × coseno denso». Según la model card, esto le permite superar a LateOn (149M) en la media de BEIR (59,74 frente a 57,22 en nDCG@10) usando el mismo tipo de infraestructura (PyLate con índice PLAID).

Es relevante ahora porque reduce el coste operativo de los pipelines de RAG y búsqueda semántica: una sola pasada del encoder por texto y un solo índice sirven para cubrir tanto la coincidencia léxica como la semántica. La licencia Apache-2.0 facilita su uso comercial, aunque su alcance queda limitado al inglés y a un tamaño de documento de 2048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con dos cabezas: interaccion tardia (ColBERT, multi-vector) y densa; tronco compartido de 18 capas y 4 capas propias por cabeza |
| Parametros totales | 149.015.808 segun los pesos safetensors del repositorio; la model card declara 179M (discrepancia no aclarada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens para documentos y 256 tokens para consultas |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (requiere trust_remote_code=True; biblioteca PyLate) |

## Arquitectura y entrenamiento

El modelo es un encoder tipo transformer con un tronco compartido derivado de answerdotai/ModernBERT-base y dos cabezas diferenciadas a partir de la capa 18. La cabeza de tokens aplica cuatro capas propias y una proyeccion lineal de 768 a 128 dimensiones, generando un vector de 128 dimensiones por token. La cabeza densa aplica otras cuatro capas propias, un pooling por atencion latente que produce un vector de frase de 768 dimensiones, y despues una rotacion que lo divide en 3 porciones de 127 dimensiones, a las que se anade una dimension de etiqueta, dando 3 «slot vectors» de 128 dimensiones. La dimension 0 actua como etiqueta con signo opuesto para vectores de token y de slot, de modo que en el MaxSim un token solo empareja con tokens y un slot solo con su slot homonimo. El resultado es que un unico paso de MaxSim sobre la salida completa calcula la suma de la puntuacion de tokens y 0,75 veces la similitud coseno densa.

El entrenamiento parte del backbone ModernBERT-base, preentrenado de forma contrastiva sobre la coleccion publica de preentrenamiento de LightOn. El ajuste fino se realizo durante 1 epoca con perdidas contrastivas en ambas cabezas y negativos duros, destilacion desde un cross-encoder (mixedbread-ai/mxbai-rerank-large-v2) sobre la cabeza densa y sobre la puntuacion fusionada, y anclas de caracteristicas respecto a modelos anteriores de una sola cabeza del mismo grupo. Los datos son el conjunto publico de ajuste fino en ingles de LightOn (MS MARCO, NQ, HotpotQA, FEVER, FiQA, SQuAD v2, TriviaQA y MIRACL) mas aproximadamente 560.000 pares minados de la coleccion de preentrenamiento (Quora, StackExchange, S2ORC y Reddit). Las consultas de entrenamiento identicas a alguna consulta de test de BEIR fueron eliminadas.

## Capacidades

- Recuperacion de documentos en ingles mediante interaccion tardia (ColBERT) con MaxSim por token.
- Recuperacion densa de frases en el mismo codificador, fusionada con la senal de tokens sin necesidad de un scorer adicional.
- Extraccion de caracteristicas (feature-extraction) y similitud semantica entre frases (pipeline sentence-similarity).
- Reranking de listas de candidatos sin indice, mediante el modulo rank de PyLate.
- Compatibilidad con indices PLAID, lo que permite busqueda a gran escala con el mismo codigo de ColBERT.
- Soporte de prompts obligatorios «query» y «document» para codificar consultas y documentos respectivamente.
- Compatibilidad declarada con text-embeddings-inference y con endpoints (etiquetas text-embeddings-inference y endpoints_compatible).
- No soporta vision, audio, tool calling, agentes ni modo de razonamiento; es exclusivamente un modelo de representacion de texto para recuperacion.

## Casos de uso

- Generacion aumentada por recuperacion (RAG) en ingles: el modelo indexa fragmentos de hasta 2048 tokens y recupera con un unico indice que combina coincidencia exacta de terminos y similitud semantica, reduciendo el numero de componentes del pipeline frente a las arquitecturas que mantienen un indice BM25 y otro denso en paralelo.
- Busqueda semantica interna en documentacion tecnica o repositorios de codigo en ingles: los 256 tokens de consulta permiten formular preguntas largas y el MaxSim por token penaliza menos las coincidencias parciales de identificadores y nombres de API.
- Reranking de candidatos recuperados por un buscador previo: con el modulo rank de PyLate se pueden reordenar los primeros k resultados de un retriever mas barato antes de pasarlos a un LLM, aprovechando la cabeza densa y la de tokens en una sola pasada.
- Respuesta a preguntas sobre literatura cientifica: los resultados declarados en SCIDOCS (23,50 nDCG@10) y SciFact (77,98) indican utilidad en dominios cientificos en ingles, aunque con margen de mejora en el caso de SCIDOCS.
- Verificacion de hechos y recuperacion de evidencia: las puntuaciones en FEVER (93,23) y HotpotQA (81,60) lo hacen adecuado como retriever de pasajes de evidencia en pipelines de fact-checking en ingles.
- Deduplicacion y agrupacion de documentos por similitud: los vectores densos de 768 dimensiones permiten calcular similitud coseno directa entre frases sin construir un indice multi-vector.
- Filtrado de candidatos en motores de busqueda de comercio electronico en ingles: la combinacion de coincidencia lexica por token y semantica densa ayuda tanto en consultas con modelo o referencia exacta como en consultas descriptivas.

## Benchmarks y rendimiento

Datos de la model card: nDCG@10 sobre MTEB 2.21.6 con PyLate y un indice PLAID con configuracion por defecto (sin reranking adicional).

| Benchmark | UIBK-Embedding-v1 | LateOn (149M) |
|---|---|---|
| BEIR (15 datasets), media | 59,74 | 57,22 |
| NanoBEIR (13 datasets), media | 70,55 | no disponible |

| Dataset BEIR | UIBK-Embedding-v1 | LateOn |
|---|---|---|
| ArguAna | 56,78 | 50,52 |
| CQADupStack | 48,61 | 47,36 |
| ClimateFEVER | 44,29 | 39,67 |
| DBPedia | 49,41 | 45,99 |
| FEVER | 93,23 | 92,02 |
| FiQA | 53,61 | 53,12 |
| HotpotQA | 81,60 | 79,98 |
| MSMARCO | 46,71 | 45,67 |
| NFCorpus | 38,91 | 37,79 |
| NQ | 67,66 | 63,91 |
| Quora | 89,90 | 89,67 |
| SCIDOCS | 23,50 | 21,90 |
| SciFact | 77,98 | 76,61 |
| TREC-COVID | 83,73 | 83,60 |
| Touche-2020 | 40,21 | 30,52 |

| Dataset NanoBEIR | UIBK-Embedding-v1 |
|---|---|
| NanoArguAna | 59,84 |
| NanoClimateFever | 51,65 |
| NanoDBPedia | 69,20 |
| NanoFEVER | 96,57 |
| NanoFiQA2018 | 64,34 |
| NanoHotpotQA | 92,72 |
| NanoMSMARCO | 68,99 |
| NanoNFCorpus | 39,22 |
| NanoNQ | 82,14 |
| NanoQuora | 96,99 |
| NanoSCIDOCS | 45,40 |
| NanoSciFact | 83,93 |
| NanoTouche2020 | 66,14 |

No se han publicado en la informacion disponible resultados de otros benchmarks habituales (MMLU, HumanEval, GSM8K) ni datos de latencia o throughput; no aplican a un modelo de recuperacion.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 0,6 GB en fp32 (149M parametros) y 0,3 GB en fp16. Cabe con holgura en cualquier GPU de consumo.
- VRAM para inferencia con lotes de documentos de hasta 2048 tokens: estimacion de 1 a 2 GB en fp16, dependiendo del tamano de lote y de la longitud real de los documentos; no hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluidas RTX 3060, RTX 4060, RTX 4090 y superiores. Para indexacion masiva, A100 o H100 reducen el tiempo de codificacion, aunque el cuello de botella suele estar en el almacenamiento del indice.
- Almacenamiento del indice ColBERT: la salida multi-vector ocupa mucho mas que un indice denso. Con documentos de 2048 tokens se generan unas 2051 matrices de 128 dimensiones por documento (2048 vectores de token mas 3 vectores de slot); en fp32 son aproximadamente 1 MB por documento, es decir del orden de 1 TB por millon de documentos, y la mitad en fp16. Es una estimacion calculada a partir de la arquitectura, no un dato publicado.
- Opciones de despliegue: PyLate con indices PLAID (uso documentado), text-embeddings-inference (etiqueta declarada por el autor) y despliegue directo con transformers >= 5.3 y sentence-transformers >= 5.3. No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI para este modelo.
- Requisitos de software: trust_remote_code=True, transformers >= 5.3, sentence-transformers >= 5.3 y pylate. Los prompts «query» y «document» son obligatorios al codificar.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | BEIR (nDCG@10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| UIBK-Embedding-v1 | 149M (safetensors); 179M declarados | 2048 doc / 256 query | ColBERT multi-vector + cabeza densa en un solo encoder | 59,74 | Apache-2.0 | HuggingFace, via PyLate |
| LateOn | 149M | no disponible | Recuperacion por interaccion tardia | 57,22 | no disponible en la informacion proporcionada | HuggingFace (cifras tomadas de su model card) |
| answerdotai/ModernBERT-base | no disponible | no disponible | Encoder base, no optimizado para retrieval | no aplica | Apache-2.0 | HuggingFace (es el modelo base) |

No se dispone de datos comparativos de otros recuperadores ColBERT o densos de tamano similar en la informacion proporcionada. Cabe senalar que el unico modelo con el que el autor compara directamente es LateOn, y que las cifras de LateOn proceden de su propia model card, no de una evaluacion independiente.

## Limitaciones y advertencias

- Solo ingles: el modelo no soporta consultas ni documentos en castellano ni en otros idiomas.
- No es zero-shot en los datasets de BEIR cuyos splits de entrenamiento forman parte de los datos (MS MARCO, NQ, HotpotQA, FEVER y FiQA). Las puntuaciones en esos conjuntos estan infladas respecto a un escenario de dominio nuevo, tal como reconoce el propio autor.
- Salida multi-vector: el indice ColBERT resultante es considerablemente mayor que un indice de un solo vector, con el coste de almacenamiento y de E/S asociado.
- Requiere trust_remote_code=True, lo que implica ejecutar codigo alojado en el repositorio del modelo; conviene revisarlo antes de desplegarlo en produccion.
- Depende de versiones recientes del ecosistema (transformers >= 5.3, sentence-transformers >= 5.3), lo que puede complicar la integracion en entornos con dependencias fijadas.
- Los prompts «query» y «document» son obligatorios; omitirlos degrada la calidad de la recuperacion sin producir un error explicito.
- Limite de 2048 tokens por documento: los fragmentos mas largos deben dividirse, con la perdida de contexto que ello implica.
- Riesgo de alucinacion: no aplica directamente, ya que no genera texto, pero al integrarse en un pipeline RAG la calidad de la respuesta final dependera del LLM que consuma los pasajes recuperados.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de equidad en la informacion disponible. Al entrenarse sobre MS MARCO, NQ, HotpotQA, FEVER, FiQA, SQuAD v2, TriviaQA, MIRACL, Quora, StackExchange, S2ORC y Reddit, hereda los sesgos de dominio y de estilo de esas fuentes.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar los avisos de licencia y de atribucion.
- No se documentan resultados reproducibles por terceros; todas las cifras de la tabla de benchmarks proceden del autor del modelo.
- Existe una discrepancia entre el recuento de parametros de los pesos safetensors (149.015.808) y el declarado en la model card (179M) que conviene verificar antes de dimensionar infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DataScience-UIBK/uibk-embedding-v1
- Perfil de la organizacion en HuggingFace: https://huggingface.co/DataScience-UIBK/models
- Web del grupo Data Science UIBK: https://datascienceuibk.github.io/
- Libreria PyLate: https://github.com/lightonai/pylate
- Benchmark MTEB: https://github.com/embeddings-benchmark/mteb
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Cross-encoder usado como profesor: https://huggingface.co/mixedbread-ai/mxbai-rerank-large-v2
- Paper o publicacion asociada: no disponible en la informacion proporcionada (la model card indica que la cita esta pendiente de anadir)
- Demo: no disponible en la informacion proporcionada
