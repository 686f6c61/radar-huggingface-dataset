# everymemory/Nemotron-3-Embed-1B-BF16

## Resumen

Nemotron-3-Embed-1B-BF16 es un modelo de embeddings de texto denso desarrollado por NVIDIA, orientado a tareas de recuperación de informacion (retrieval) y similitud semantica multilingue. Se construyo a partir de Ministral-3-3B-Instruct-2512 mediante dos rondas iterativas de poda estructurada (structured pruning) y destilacion, hasta reducirlo a aproximadamente 1,14 mil millones de parametros. Genera un unico vector denso de 2048 dimensiones por cada texto de entrada, con una longitud maxima de secuencia de 32.768 tokens. La ficha de HuggingFace analizada (everymemory/Nemotron-3-Embed-1B-BF16) es una reproduccion de terceros del modelo oficial de NVIDIA, con cero descargas y cero likes en el momento de la consulta.

El modelo resuelve el problema de la recuperacion semantica en sistemas RAG (Retrieval-Augmented Generation) sobre corpus multilingues: convierte preguntas y pasajes en representaciones vectoriales comparables mediante similitud coseno, lo que permite busqueda semantica, deduplicacion, agrupamiento y memoria de agentes. NVIDIA lo posiciona como componente fundacional de sistemas RAG y de recuperacion agentica en entornos empresariales, y declara que es apto para uso comercial.

Su relevancia actual radica en la combinacion de un tamano reducido (1,14B parametros, 2,3 GB en BF16) con una cobertura declarada de 34 idiomas y una ventana de contexto de 32.768 tokens, inusualmente larga para un modelo de embeddings de esta escala. El modelo forma parte de la familia Nemotron 3 Embed, que incluye variantes de 1B en BF16 y NVFP4 y una variante de 8B en BF16, lo que permite elegir el equilibrio entre coste de inferencia y calidad de recuperacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder, basado en Ministral-3-3B-Instruct-2512 podado; atencion bidireccional (bidirectional attention masking) y average pooling sobre las representaciones de tokens |
| Parametros totales | 1.140.918.272 (~1,14 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens (las entradas mas largas deben trocearse o truncarse) |
| Tipos de cuantizacion | BF16 (este repositorio); la familia incluye una variante oficial NVFP4; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | 34: ingles, arabe, asames, bengali, bulgaro, chino, danes, neerlandes, fines, frances, aleman, hindi, hinglish, indonesio, italiano, japones, coreano, malayo, marati, nepali, noruego, persa, portugues, rumano, ruso, espanol, suajili, sueco, tamil, telugu, tailandes, ucraniano, urdu y vietnamita |
| Licencia | OpenMDW License Agreement version 1.1 (openmdw-1.1); informacion adicional bajo Apache License 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 2,3 GB) |
| Dimension del embedding | 2048 |
| Hidden size | 2048 |
| Libreria de inferencia | sentence-transformers |
| Pipeline declarado | sentence-similarity |
| Modelo base | mistralai/Ministral-3-3B-Instruct-2512 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder derivado de Ministral-3-3B-Instruct-2512. A diferencia de un modelo generativo causal, emplea enmascaramiento de atencion bidireccional, de modo que cada token atiende a todos los demas de la secuencia. El vector final se obtiene aplicando average pooling sobre las representaciones a nivel de token, produciendo un embedding denso de 2048 dimensiones por texto. La ventana de entrada maxima es de 32.768 tokens.

El proceso de construccion tuvo tres fases documentadas. Primero, el modelo padre de 3B se entreno como modelo de embeddings de texto. Despues se podo a 2B mediante busqueda de arquitectura neuronal (NAS) con NVIDIA ModelOpt mcore_minitron, que explora el ancho oculto, el tamano de la FFN, el numero de cabezas de atencion y la profundidad, y selecciona el mejor candidato del frente de Pareto top-10; los candidatos se evaluaron contra las representaciones del modelo padre usando un corpus de calibracion in-domain de 50.000 ejemplos, que tambien sirvio para estimar puntuaciones de importancia. Por ultimo, el modelo de 2B se destilo desde el modelo profesor Nemotron-3-Embed-8B-BF16 combinando una perdida de distancia coseno (COS) y una perdida de error cuadratico medio (MSE) sobre una mezcla multilingue de datos de recuperacion in-domain. El mismo procedimiento de poda y destilacion, con la misma mezcla de datos, se repitio para producir el modelo final de 1,14B.

No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni el uso de RLHF o DPO, tecnicas que en cualquier caso no son habituales en modelos de embeddings.

## Capacidades

- Generacion de embeddings densos de texto: una unica representacion vectorial de 2048 dimensiones por entrada, obtenida mediante average pooling sobre las representaciones de tokens.
- Recuperacion de informacion (retrieval) multilingue y cross-lingual: entrenado y evaluado sobre 34 idiomas, incluyendo recuperacion entre idiomas distintos.
- Busqueda semantica: comparacion de textos por similitud coseno entre vectores, sin necesidad de coincidencia lexica.
- Base para sistemas RAG: indexacion de corpus y recuperacion de pasajes relevantes para alimentar a un modelo generativo.
- Recuperacion agentica (agentic RAG) y memoria de agentes, segun la descripcion del autor.
- Similitud semantica de frases y pares de textos (pipeline sentence-similarity).
- Procesamiento de entradas largas de hasta 32.768 tokens, lo que permite indexar documentos completos sin troceado previo en muchos casos.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, y no tiene modo de razonamiento (thinking mode).
- No dispone de capacidades de vision ni de audio segun la informacion disponible.

## Casos de uso

- Busqueda semantica sobre documentacion empresarial: indexar manuales, politicas internas y bases de conocimiento de hasta 32.768 tokens por fragmento y recuperar pasajes relevantes ante consultas en cualquiera de los 34 idiomas soportados, sin depender de coincidencias exactas de palabras.
- Pipeline RAG multilingue para atencion al cliente: el modelo indexa articulos de ayuda en varios idiomas y recupera el fragmento correcto aunque la consulta del usuario y el documento esten en idiomas distintos, gracias a sus capacidades cross-lingual.
- Busqueda de codigo y documentacion tecnica: la propia coleccion de NVIDIA lo orienta a code search; puede indexar docstrings, comentarios y documentacion de API para localizar funciones relevantes por descripcion en lenguaje natural.
- Deduplicacion y agrupamiento de grandes corpus: generar embeddings de cientos de miles de registros y agruparlos por similitud para detectar duplicados, casi duplicados o temas recurrentes en un dataset.
- Memoria de agentes: almacenar interacciones previas como vectores en una base de datos vectorial y recuperar los recuerdos mas relevantes en cada paso de un agente multi-turno, una de las aplicaciones que NVIDIA destaca para esta familia.
- Moderacion y clasificacion por similitud: comparar el contenido entrante contra un conjunto de textos de referencia etiquetados (por ejemplo, politicas de uso) y decidir por umbral de similitud coseno.
- Sistemas de recomendacion basados en contenido: representar articulos, publicaciones o productos como vectores y recomendar elementos proximos a los que el usuario ha consumido, con cobertura multilingue.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card original de NVIDIA afirma que el modelo alcanza rendimiento state-of-the-art en multiples benchmarks de recuperacion multilingue entre modelos de tamano comparable, y remite al blog "Nemotron 3 Embed wins RTEB" para los detalles, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K, MTEB ni RTEB en la informacion proporcionada. Al tratarse de un modelo de embeddings, las metricas relevantes serian de recuperacion (nDCG@10, recall@k, MRR) y no las de generacion citadas.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 2,3 GB, segun el tamano del repositorio. En FP32 la copia en memoria rondaria los 4,6 GB.
- VRAM estimada para inferencia: en el entorno de 3-4 GB para lotes pequenos con secuencias cortas en BF16; la atencion bidireccional crece de forma cuadratica con la longitud, por lo que procesar secuencias cercanas a los 32.768 tokens o lotes grandes puede elevar el consumo a decenas de GB. Estas cifras son estimaciones a partir del numero de parametros y no estan confirmadas por el fabricante.
- GPU recomendadas: cabe con holgura en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090. Para indexacion a gran escala o secuencias de 32k tokens con lotes grandes son preferibles A100, H100 o L40S.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU con 6 GB o mas de VRAM para uso con secuencias moderadas.
- Opciones de despliegue: sentence-transformers (libreria declarada del repositorio), transformers, vLLM (etiqueta oficial del modelo) y NVIDIA NIM, con ficha publicada en build.nvidia.com. No hay confirmacion de soporte para llama.cpp, Ollama, TGI u otras alternativas en la informacion disponible; al no publicarse pesos GGUF, esas rutas requeririan conversion propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar dentro de la propia familia Nemotron 3 Embed. Para alternativas de terceros (BGE-M3, multilingual-e5, Qwen3-Embedding u otras de tamano similar) no hay datos en la informacion disponible, por lo que no se incluyen cifras.

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Embed-1B-BF16 (este modelo) | ~1,14 B | 32.768 tokens | BF16 | OpenMDW 1.1 | HuggingFace (nvidia/) y NVIDIA NIM |
| Nemotron-3-Embed-1B-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | HuggingFace (nvidia/) |
| Nemotron-3-Embed-8B-BF16 | no disponible (etiquetado como 8B) | no disponible | BF16 | no disponible | HuggingFace (nvidia/) |
| Alternativas de terceros de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

Diferencias internas conocidas: el 1B-BF16 es el resultado de dos rondas de poda y destilacion sobre el 8B, y la variante NVFP4 ofrece el mismo modelo en una precision de 4 bits orientada a reducir el coste de inferencia en hardware NVIDIA compatible.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings. Usarlo para generar texto, razonar o invocar herramientas no es posible.
- Longitud de contexto limitada a 32.768 tokens: las entradas mas largas deben trocearse o truncarse, lo que puede degradar la recuperacion si el fragmento relevante queda cortado.
- Riesgo de alucinacion no aplicable en sentido estricto (no genera texto), pero si existe riesgo de recuperacion incorrecta: embeddings mal calibrados pueden devolver pasajes semanticamente proximos pero factualmente irrelevantes para la consulta.
- Sesgos: no se documentan evaluaciones de sesgo, equidad o toxicidad en la informacion disponible. La cobertura declarada de 34 idiomas no implica calidad uniforme; es previsible un rendimiento inferior en idiomas de bajos recursos del conjunto (asames, nepali, marati, telugu, tamil) frente a ingles, espanol o chino.
- Licencia: OpenMDW 1.1 con informacion adicional bajo Apache 2.0. Aunque el fabricante declara que el modelo esta listo para uso comercial, OpenMDW 1.1 no es una licencia OSI estandar y conviene revisar sus terminos completos antes de integrarlo en un producto, especialmente en lo relativo a atribucion y redistribucion.
- El repositorio analizado (everymemory/Nemotron-3-Embed-1B-BF16) es una reproduccion de terceros con 0 descargas y 0 likes; para produccion es preferible usar el repositorio oficial de NVIDIA y verificar la integridad de los pesos.
- El modelo se distribuye como proyecto que descarga e instala software de terceros; hay que revisar las licencias de esas dependencias.
- No se documentan datos de entrenamiento detallados (numero de tokens, composicion), lo que dificulta auditar sesgos o cobertura real del dataset.
- El rendimiento declarado como state-of-the-art procede del propio fabricante y no se acompana de cifras verificables en la informacion disponible.

## Enlaces

- Repositorio analizado (reproduccion de terceros): https://huggingface.co/everymemory/Nemotron-3-Embed-1B-BF16
- Repositorio oficial BF16 de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Variante oficial NVFP4: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-NVFP4
- Variante oficial 8B BF16 (modelo profesor de destilacion): https://huggingface.co/nvidia/Nemotron-3-Embed-8B-BF16
- Coleccion Nemotron 3 Embed: https://huggingface.co/collections/nvidia/nemotron-3-embed
- Blog de NVIDIA sobre RTEB: https://huggingface.co/blog/nvidia/nemotron-3-embed-wins-rteb
- Ficha en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-embed-1b/modelcard
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- NVIDIA Model-Optimizer (poda NAS): https://github.com/NVIDIA/Model-Optimizer
- Paper de ModelOpt NAS: https://arxiv.org/pdf/2407.14679
- Referencia adicional citada por el modelo: https://arxiv.org/abs/2502.13595
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
