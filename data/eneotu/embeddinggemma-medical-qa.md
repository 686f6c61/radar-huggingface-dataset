# eneotu/embeddinggemma-medical-qa

## Resumen

eneotu/embeddinggemma-medical-qa es un modelo de embeddings de frases publicado por el usuario eneotu en HuggingFace, obtenido mediante ajuste fino de unsloth/embeddinggemma-300m, que a su vez deriva de la familia EmbeddingGemma de Google basada en la arquitectura Gemma 3 text (tag `gemma3_text`). No es un modelo generativo: su salida son vectores densos que permiten calcular similitud semantica entre textos, y su pipeline declarado es `sentence-similarity` con tareas asociadas de `feature-extraction` y recuperacion de informacion.

El ajuste se ha realizado con la libreria sentence-transformers sobre un conjunto de 10.000 pares (tag `dataset_size:10000`) y la funcion de perdida MultipleNegativesRankingLoss, un esquema de negativos en lote habitual en recuperacion densa. El nombre del modelo y los ejemplos del widget de la model card (una pregunta clinica en ingles enfrentada a fragmentos biomedicos en ingles y en frances) apuntan a un uso especializado en dominio medico y posiblemente multilingue, aunque el autor no documenta ni el corpus de entrenamiento ni los idiomas cubiertos.

Su relevancia es acotada pero clara: los modelos de embeddings genericos rinden peor en vocabulario biomedico especializado, y este ajuste busca mejorar la recuperacion semantica en ese dominio. Sin embargo, el modelo acumula cero descargas y cero likes, no declara licencia ni idiomas, y sus unicos benchmarks proceden de la propia model card sin verificacion externa, por lo que debe tratarse como un experimento a evaluar antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Gemma 3 text (`gemma3_text`) usado como codificador de frases con embedding denso |
| Parametros totales | No declarado en la ficha; la denominacion del modelo base (embeddinggemma-300m) sugiere aproximadamente 300 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan versiones cuantizadas; el autor solo publica pesos safetensors) |
| Idiomas soportados | No disponible (los ejemplos del widget incluyen texto en ingles y en frances) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Dimension del embedding | No disponible |
| Funcion de perdida | MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 10.000 pares |
| Tamano del repositorio | 0,1 GB |
| Libreria | sentence-transformers |
| Modelo base | unsloth/embeddinggemma-300m |
| Fecha de publicacion | 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo base unsloth/embeddinggemma-300m, un transformer de tipo Gemma 3 text reconvertido a codificador de frases: el modelo procesa el texto de entrada y produce una representacion vectorial densa sobre la que se calcula similitud coseno. La etiqueta `dense` y la tarea `feature-extraction` confirman este uso, y la tarea declarada `sentence-similarity` indica que el entrenamiento optimiza directamente la cercania entre pares semanticamente relacionados.

El ajuste se ha realizado con la libreria sentence-transformers con la perdida MultipleNegativesRankingLoss sobre 10.000 pares. Esta perdida emplea los demas elementos del lote como negativos implicitos, lo que la hace eficiente con volumenes de datos moderados como el declarado. La presencia del tag `unsloth` indica que el entrenamiento se ejecuto con el framework Unsloth, orientado a ajuste fino eficiente en memoria (habitualmente mediante LoRA o QLoRA, aunque la ficha no detalla la configuracion). No se documentan tokens de entrenamiento, composicion del corpus, fases de RLHF o DPO, ni innovaciones tecnicas adicionales como decodificacion especulativa (no aplicable a un modelo de embeddings) o atencion lineal. Los tags `arxiv:1908.10084` y `arxiv:1807.03748` remiten a trabajos de referencia sobre representaciones de frases, pero la ficha no especifica su papel en el entrenamiento.

## Capacidades

- Generacion de embeddings densos de frases y fragmentos de texto para similitud semantica y busqueda por similitud coseno.
- Extraccion de caracteristicas (`feature-extraction`) para alimentar clasificadores, sistemas de ranking o clusterizado aguas abajo.
- Recuperacion de informacion (`information-retrieval`) en dominio biomedico, segun se deduce del nombre del modelo y de los ejemplos del widget.
- Emparejamiento pregunta-documento en contextos de pregunta-respuesta medica, tal como ilustra el widget con la consulta sobre tratamiento de tumores SFT.
- Posible cobertura multilingue: los ejemplos del widget incluyen texto en ingles y en frances, aunque el autor no declara lista de idiomas.
- Compatibilidad declarada con Text Embeddings Inference (`text-embeddings-inference`) y con Inference Endpoints de HuggingFace (`endpoints_compatible`).
- No genera texto, no realiza razonamiento multi-paso, no soporta tool calling ni function calling y no procesa imagenes ni audio: es exclusivamente un modelo de representacion.

## Casos de uso

- Busqueda semantica sobre literatura medica: indexar resumenes y articulos como vectores y recuperar los fragmentos mas cercanos a una consulta clinica en lenguaje natural, aprovechando el ajuste de dominio frente a un modelo de embeddings generico.
- Recuperacion aumentada (RAG) en asistentes clinicos: usar el modelo como recuperador sobre una base documental medica y pasar los fragmentos recuperados a un LLM generativo que redacte la respuesta final.
- Deduplicacion y agrupamiento de registros clinicos o notas de paciente: calcular similitud coseno entre documentos para detectar duplicados o agrupar casos con vocabulario biomedico similar.
- Enrutado y triaje de consultas: clasificar una consulta entrante comparandola con embeddings de categorias predefinidas (cardiologia, endocrinologia, oncologia) y derivarla al servicio correspondiente.
- Emparejamiento pregunta-respuesta sobre corpus de guias clinicas y articulos: construir un indice vectorial de pares pregunta-respuesta y devolver la respuesta mas proxima a la consulta del usuario.
- Filtrado de revision sistematica: ordenar un gran volumen de referencias por similitud con un criterio de inclusion descrito en texto, reduciendo el trabajo de cribado manual.
- Coincidencia multilingue de documentos: si se confirma la cobertura de idiomas, alinear documentos en ingles con equivalentes en frances u otros idiomas mediante similitud en el espacio de embeddings.
- Cache semantica para servicios de QA medica: reutilizar respuestas previas cuando la nueva consulta supera un umbral de similitud coseno con una consulta ya registrada, reduciendo llamadas a modelos generativos.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en el `model-index` de la model card. El conjunto de evaluacion aparece como "Unknown" y las metricas no estan verificadas (`verified: false`). Los valores de precision son coherentes con un escenario de un unico documento relevante por consulta.

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,7030 |
| Cosine Accuracy@3 | 0,8305 |
| Cosine Accuracy@5 | 0,8730 |
| Cosine Accuracy@10 | 0,9125 |
| Cosine Precision@1 | 0,7030 |
| Cosine Precision@3 | 0,2768 |
| Cosine Precision@5 | 0,1746 |
| Cosine Precision@10 | 0,0913 |
| Cosine Recall@1 | 0,7030 |
| Cosine Recall@3 | 0,8305 |
| Cosine Recall@5 | 0,8730 |
| Cosine Recall@10 | 0,9125 |
| Cosine NDCG@10 | 0,8082 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, MTEB, BEIR u otros) ni comparaciones con modelos de referencia. La lista completa de metricas del `model-index` aparece truncada en la informacion proporcionada, por lo que podrian existir metricas adicionales no recogidas aqui.

## Requisitos de hardware

- VRAM estimada para inferencia, asumiendo aproximadamente 300 M de parametros y etiquetando los calculos como estimaciones a partir del tamano del modelo base: en fp32, en torno a 1,2 GB solo de pesos (unos 2 GB con overhead de runtime); en fp16/bf16, unos 0,6 GB de pesos; en int8, unos 0,3 GB. La longitud de contexto no esta documentada, por lo que el consumo de activaciones con lotes grandes no puede acotarse.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente. En la practica, una RTX 3060, RTX 4060, RTX 4090 o una GPU de datacenter como T4, L4, A10G, A100 o H100 funcionan sin limitaciones de memoria. El modelo tambien es viable en CPU.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo actual, y tambien en hardware de gama baja o en CPU.
- Opciones de despliegue: sentence-transformers (libreria declarada), Text Embeddings Inference (tag explicito) e Inference Endpoints de HuggingFace (tag `endpoints_compatible`). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que el autor no documenta.
- Latencia y throughput: no disponibles; el autor no publica mediciones. En un modelo de este tamano se espera latencia de milisegundos por lote en GPU, pero no hay datos confirmados en la informacion proporcionada.
- Nota de coherencia: el repositorio declarado ocupa 0,1 GB, por debajo de lo esperable para 300 M de parametros en fp32 (aproximadamente 1,2 GB), por lo que conviene verificar el contenido real de los archivos antes de dimensionar la infraestructura.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de terceros ni de fichas comparables en la informacion proporcionada. La comparativa se limita a aspectos cualitativos de la familia de modelos:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eneotu/embeddinggemma-medical-qa | No declarado; ~300 M segun el nombre del base | No disponible | No disponible | Publicado en HuggingFace, 0 descargas, 0 likes |
| unsloth/embeddinggemma-300m (modelo base) | No disponible | No disponible | No disponible | Modelo base del ajuste; sin especializacion en dominio medico documentada |
| EmbeddingGemma 300M original de Google | No disponible | No disponible | No disponible | Origen de la familia; datos no presentes en la informacion proporcionada |
| Modelos de embeddings biomedicos derivados de PubMedBERT y similares | No disponible | No disponible | No disponible | Alternativas habituales en recuperacion medica; no se dispone de datos comparativos en esta busqueda |

No es posible comparar rendimiento (Accuracy@k, NDCG, MTEB) con alternativas porque los unicos numeros disponibles son los del propio autor y no se ha encontrado ninguna evaluacion independiente.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion. Es un riesgo legal directo si se integra en un producto.
- Idiomas no declarados: aunque el widget muestra ejemplos en ingles y frances, no se puede asumir cobertura multilingue ni un rendimiento homogeneo por idioma.
- Contexto no documentado: se desconoce la longitud maxima de secuencia, lo que impide planificar la estrategia de troceado (chunking) de documentos largos.
- Benchmarks sin verificar: las metricas proceden del `model-index` del autor, marcadas como no verificadas y evaluadas sobre un conjunto identificado como "Unknown". No deben tratarse como comparables con resultados de MTEB o BEIR.
- Corpus de entrenamiento reducido: 10.000 pares es un volumen pequeno, suficiente para un ajuste ligero pero con riesgo de sobreajuste al estilo y vocabulario de ese corpus concreto.
- Sesgo de dominio y de idioma: un ajuste sobre datos medicos puede degradar el rendimiento en textos generales o en jerga clinica no representada en el conjunto de entrenamiento.
- Riesgo de falsos positivos en similitud: dos fragmentos con vocabulario biomedico parecido pueden quedar proximos en el espacio de embeddings aunque su significado clinico difiera; el umbral de similitud debe calibrarse por caso de uso.
- No es una herramienta clinica: el modelo ordena y recupera texto, no valida informacion medica. Cualquier flujo de decision clinica requiere supervision profesional.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta implican ausencia de validacion independiente, de informes de errores y de mantenimiento conocido.
- Incoherencia de tamano: el repositorio declarado (0,1 GB) no cuadra con el tamano esperable de un modelo de ~300 M de parametros en fp32, lo que sugiere que el repositorio puede estar incompleto o que los pesos estan en un formato distinto al supuesto.
- Formato unico: solo se publican pesos safetensors; no hay versiones GGUF, ONNX ni cuantizadas, lo que limita el despliegue en entornos ligeros sin conversion manual.
- Fechas anomales: la fecha de creacion y actualizacion figura como septiembre de 2026, posterior a la fecha habitual de publicacion de la familia EmbeddingGemma; conviene verificar la procedencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eneotu/embeddinggemma-medical-qa
- Modelo base: https://huggingface.co/unsloth/embeddinggemma-300m
- Referencia arXiv declarada en los tags: https://arxiv.org/abs/1908.10084
- Referencia arXiv declarada en los tags: https://arxiv.org/abs/1807.03748
- Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (paginas genericas de Facebook y Meta for Business), por lo que no se incluye ningun enlace adicional. No se han encontrado papers, blogs, repositorios ni demos asociados a este modelo en la informacion proporcionada.
