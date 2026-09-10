# iammayur/bge-base-financial-matryoshka-2

## Resumen

iammayur/bge-base-financial-matryoshka-2 es un modelo de embeddings de frases (sentence embeddings) especializado en dominio financiero, publicado por el usuario iammayur y derivado por fine-tuning de BAAI/bge-base-en-v1.5. Se distribuye como modelo de sentence-transformers con pipeline de similitud semantica y extraccion de caracteristicas, y su objetivo es recuperar pasajes financieros relevantes (informes 10-K, memorias anuales, notas contables) a partir de consultas en lenguaje natural en ingles.

El modelo tiene 109.482.240 parametros (aproximadamente 109 M) y genera embeddings densos de 768 dimensiones. Su rasgo tecnico diferencial es el uso de MatryoshkaLoss combinada con MultipleNegativesRankingLoss, lo que permite truncar el embedding a dimensiones menores (por ejemplo 512) manteniendo buena parte del rendimiento de recuperacion, con el consiguiente ahorro de memoria y de coste de busqueda vectorial.

El fine-tuning se realizo sobre un dataset de 6.300 ejemplos, presumiblemente pares consulta-pasaje de tipo financiero, y la licencia es Apache 2.0, lo que facilita su uso comercial. Es relevante ahora para equipos que construyen sistemas RAG sobre documentacion financiera en ingles y necesitan un encoder pequeno, rapido y desplegable en CPU o en GPU de gama baja sin renunciar a metricas de recuperacion razonables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base), orientado a embeddings de frases; modelo base BAAI/bge-base-en-v1.5 |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (fp32) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos: dimension de embedding 768 (con soporte de truncado Matryoshka, por ejemplo a 512), tamano del repositorio 0,4 GB, libreria sentence-transformers, tarea sentence-similarity y feature-extraction, compatible con text-embeddings-inference.

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT base, el mismo backbone de BAAI/bge-base-en-v1.5, adaptado a la generacion de representaciones de frase mediante pooling sobre las salidas del encoder. El modelo no es generativo: produce un vector denso por texto, y la similitud se calcula tipicamente con distancia coseno. El entrenamiento parte de los pesos de BGE base en ingles v1.5 y se realiza un fine-tuning adicional sobre un dataset de 6.300 ejemplos del dominio financiero.

La innovacion tecnica principal es la combinacion de dos funciones de perdida declaradas en la model card: MatryoshkaLoss y MultipleNegativesRankingLoss. MultipleNegativesRankingLoss es una perdida contrastiva que usa los demas elementos del lote como negativos, eficaz cuando solo se dispone de pares positivos. MatryoshkaLoss, derivada del trabajo de representaciones Matryoshka (arXiv:2205.13147), fuerza a que los primeros fragmentos del vector de embedding sean utiles por si mismos, de modo que truncar la dimension (por ejemplo de 768 a 512) degrade el rendimiento de forma gradual en lugar de romperlo. Esto permite almacenar y comparar vectores mas pequenos en un indice vectorial sin reentrenar. No se documenta en la informacion disponible el uso de RLHF, DPO ni datos de entrenamiento mas alla del numero de ejemplos.

## Capacidades

- Generacion de embeddings densos de frases y pasajes en ingles, con dimension de salida 768 truncable mediante Matryoshka.
- Similitud semantica y recuperacion de informacion (information retrieval) sobre texto financiero: notas contables, estados financieros, comentarios de resultados.
- Extraccion de caracteristicas (feature-extraction) para clasificacion, clustering o deduplicacion de documentos.
- Busqueda semantica dentro de un pipeline RAG: codificacion de consultas y de fragmentos de documento en el mismo espacio vectorial.
- Soporte de truncado de dimension en inferencia, util para reducir coste de indexacion y de memoria.
- Compatibilidad con text-embeddings-inference y con el ecosistema sentence-transformers.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo exclusivamente de representacion.
- No dispone de capacidades de vision, audio ni thinking mode.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.

## Casos de uso

- RAG sobre informes anuales y 10-K: indexar los fragmentos de los documentos con embeddings de 512 dimensiones (truncados del vector de 768) y recuperar los pasajes que responden a una consulta como "que factores considera la compania al evaluar la provision por perdidas crediticias". El modelo esta ajustado precisamente sobre ese tipo de pares.
- Busqueda semantica en bases de conocimiento financieras internas: sustituir la busqueda por palabras clave en un corpus de notas contables y comentarios de direccion, donde la terminologia varia entre documentos.
- Deduplicacion y agrupacion de fragmentos: calcular similitud coseno entre fragmentos de distintos informes para detectar texto repetido (por ejemplo, politicas contables identicas en ejercicios consecutivos) mediante clustering.
- Enrutado de consultas (query routing): clasificar la intencion de una consulta de un asistente financiero comparandola con embeddings de consultas prototipo, y dirigirla al indice o herramienta adecuada.
- Moderacion y control de calidad de respuestas: comparar la respuesta generada por un LLM con los pasajes recuperados y descartar respuestas cuya similitud con la evidencia sea baja.
- Preprocesado para analisis de sentimiento o clasificacion de riesgo: usar los embeddings congelados como entrada de un clasificador ligero sobre frases de informes financieros.
- Recuperacion en tiempo real con latencia baja: al ser un modelo de 109 M de parametros, puede ejecutarse en CPU dentro de un servicio de busqueda sin necesidad de GPU dedicada.
- Deteccion de similitud entre preguntas de usuarios: agrupar tickets o consultas repetidas en un sistema de soporte para analistas financieros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (information retrieval, tarea de recuperacion). Los valores estan marcados como no verificados (`verified: false`).

| Metrica | dim 768 | dim 512 |
|---|---|---|
| Cosine Accuracy@1 | 0,6957 | 0,6957 |
| Cosine Accuracy@3 | 0,8271 | 0,8271 |
| Cosine Accuracy@5 | 0,8714 | 0,8643 |
| Cosine Accuracy@10 | 0,9086 | 0,9100 |
| Cosine Precision@1 | 0,6957 | 0,6957 |
| Cosine Precision@3 | 0,2757 | 0,2757 |
| Cosine Precision@5 | 0,1743 | 0,1729 |
| Cosine Recall@1 | 0,6957 | no disponible en la informacion proporcionada |
| Cosine Recall@3 | 0,8271 | no disponible en la informacion proporcionada |
| Cosine Recall@5 | 0,8714 | no disponible en la informacion proporcionada |
| Cosine Recall@10 | 0,9086 | no disponible en la informacion proporcionada |
| Cosine NDCG@10 | 0,8049 | no disponible en la informacion proporcionada |
| Cosine MRR@10 | 0,7715 | no disponible en la informacion proporcionada |
| Cosine MAP@100 | 0,7749 | no disponible en la informacion proporcionada |

Observacion: los resultados con dimension truncada a 512 son practicamente identicos a los de 768 en las metricas disponibles, lo que respalda el comportamiento Matryoshka. No se han proporcionado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generativos, ya que el modelo no es generativo. Tampoco se incluye comparacion con MTEB ni con la puntuacion del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 109.482.240 parametros):
  - fp32: aproximadamente 0,44 GB de pesos, mas activaciones.
  - fp16/bf16: aproximadamente 0,22 GB.
  - int8: aproximadamente 0,11 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU integradas con varios GB de memoria compartida.
- Ejecucion en CPU viable para cargas moderadas, al tratarse de un encoder de 109 M de parametros.
- GPU de datacenter (A100, H100) solo justificables si se necesita indexar grandes volumenes por lotes a muy alta velocidad.
- Opciones de despliegue: sentence-transformers (referencia), text-embeddings-inference (etiqueta declarada en el repositorio), y servidores de embeddings compatibles con el formato safetensors. No se publican pesos GGUF ni ONNX, por lo que llama.cpp y Ollama no estan soportados de forma directa con los artefactos disponibles.
- Impacto del truncado Matryoshka: reducir de 768 a 512 dimensiones rebaja aproximadamente un 33 por ciento el almacenamiento del indice vectorial y acelera la comparacion coseno, sin perdida apreciable en las metricas declaradas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Dominio | Formato | Benchmarks declarados |
|---|---|---|---|---|---|---|
| iammayur/bge-base-financial-matryoshka-2 | 109,5 M | en | apache-2.0 | Financiero (fine-tuning) | safetensors | Accuracy@1 0,6957; NDCG@10 0,8049 (dim 768) |
| BAAI/bge-base-en-v1.5 (modelo base) | 109,5 M | en | no disponible en la informacion proporcionada | Generalista | safetensors | no disponible en la informacion proporcionada |
| BAAI/bge-small-en-v1.5 | no disponible en la informacion proporcionada | en | no disponible en la informacion proporcionada | Generalista | safetensors | no disponible en la informacion proporcionada |
| Modelos de embeddings Matryoshka generalistas | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Generalista | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

No se dispone en la informacion proporcionada de resultados comparativos directos (mismo dataset de evaluacion) frente a alternativas. La unica referencia estructural fiable es el modelo base, del que este modelo hereda arquitectura y numero de parametros, y sobre el que aplica un fine-tuning de dominio financiero y la perdida Matryoshka.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no puede producir respuestas, codigo ni razonamiento por si mismo.
- Solo soporta ingles; las consultas o documentos en castellano degradaran la calidad de recuperacion.
- El fine-tuning se realizo con 6.300 ejemplos, un volumen reducido que puede provocar sobreajuste al estilo concreto de los documentos financieros usados y peor generalizacion a otros subdominios (por ejemplo, noticias financieras o criptoactivos).
- Riesgo de sesgo hacia la terminologia y las plantillas de los informes regulatorios estadounidenses, dado el tipo de ejemplos mostrados en la model card.
- Los benchmarks declarados estan marcados como no verificados y no se especifica el dataset de evaluacion ni la composicion del conjunto de prueba, por lo que deben tomarse con cautela.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026: no hay validacion independiente de la comunidad.
- No se documenta la composicion exacta del dataset de entrenamiento ni si contiene datos con derechos de terceros.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y de atribucion; no incluye garantias.
- No hay pesos cuantizados publicados, lo que limita el despliegue en entornos que requieran GGUF u ONNX.
- Al integrarse en un RAG, la calidad final dependera del troceado de documentos, del indice vectorial y del modelo generativo que consuma los pasajes recuperados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iammayur/bge-base-financial-matryoshka-2
- Modelo base: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper de Sentence-BERT: https://arxiv.org/abs/1908.10084
- Paper de Matryoshka Representation Learning: https://arxiv.org/abs/2205.13147
- Referencia adicional citada en las etiquetas del modelo: https://arxiv.org/abs/1807.03748
- Busqueda web realizada: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos correspondian a contenidos sin relacion (foros sobre mensajeria y guias de telefonia).
