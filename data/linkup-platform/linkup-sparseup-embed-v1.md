# Linkup-Platform/linkup-sparseup-embed-v1

## Resumen

SPARSEUP es un modelo de recuperacion (retrieval) de tipo sparse aprendido, desarrollado por Linkup y publicado en HuggingFace bajo el identificador `Linkup-Platform/linkup-sparseup-embed-v1`. Se inicializa desde el backbone `lightonai/LateOn-unsupervised` (ModernBERT-base, 149M de parametros) al que se le injerta la cabeza MLM de ModernBERT, y se afina de forma contrastiva sobre la mezcla de datos abiertos publicada por LightOn. El objetivo es ocupar la casilla que faltaba en la familia: LightOn libero receta y datos para DenseOn (vector unico) y LateOn (interaccion tardia), y SPARSEUP anade el tercer paradigma, el sparse de vocabulario, manteniendo backbone y datos fijos para permitir una comparacion controlada entre las tres arquitecturas.

El modelo genera representaciones dispersas de tipo SPLADE: aplica la cabeza MLM, transforma los logits con `log1p(ReLU(x - 15))`, retiene como maximo 12 dimensiones de vocabulario por token (`position_top_k=12`), hace max-pooling sobre la secuencia y pliega las variantes de superficie (mayusculas/minusculas y prefijo `Ġ`) sobre un unico id (`vocab_fold=case_space`). El resultado es un vector disperso de aproximadamente 34k dimensiones, en lugar de las 50k del vocabulario original, con scoring por producto escalar.

Su relevancia actual es doble: por un lado, es el encoder sparse publico mas fuerte por debajo de 150M de parametros en BEIR-13 que sus autores conocen (56.4 nDCG@10 sin MS MARCO); por otro, al compartir backbone y datos con LateOn y DenseOn, permite por primera vez aislar el efecto de la arquitectura de recuperacion en un benchmark estandar. Se distribuye con licencia Apache 2.0 y esta pensado para motores de busqueda sparse invertidos, donde puede alcanzar latencias por debajo del milisegundo con infraestructura dedicada (Seismic).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer ModernBERT-base (bidireccional, atencion alterna global/local) con cabeza MLM injertada; variante sparse tipo SPLADE |
| Parametros totales | 188.391.300 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Longitudes maximas de evaluacion: 128 tokens para consultas y 512 para documentos. No se especifica la longitud maxima del backbone en la informacion disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |
| Dimensionalidad de salida | Dispersa, aproximadamente 34*k* dimensiones tras el plegado de vocabulario |
| Funcion de similitud | Producto escalar (dot) |
| Prefijos de entrada | `[Q] ` para consultas, `[D] ` para documentos |
| Modelo base | lightonai/LateOn-unsupervised |

## Arquitectura y entrenamiento

SPARSEUP parte de `LateOn-unsupervised` y le injerta la cabeza MLM de ModernBERT (`head` / `decoder.bias`), manteniendo `decoder.weight` atado a los embeddings de LateOn. Sobre ese backbone se aplica un afinado contrastivo con la mezcla de datos de LightOn (7 negativos duros muestreados de 50 candidatos, mas negativos en lote). No se emplea destilacion desde cross-encoder, a diferencia de otras recetas de retrieval sparse. La codificacion sparse sigue la cadena: logits MLM, transformacion `log(1 + ReLU(x - 15))`, retencion de los 12 terminos de vocabulario de mayor peso por posicion, max-pooling sobre la secuencia y plegado de formas superficiales.

La innovacion principal frente a un SPLADE vanilla son tres hiperparametros anadidos. Primero, `logit_shift=15`, que desplaza el umbral del ReLU para que el soporte de activaciones arranque ya disperso. Segundo, `position_top_k=12`, que limita el presupuesto de expansion por token antes del pooling. Tercero, `vocab_fold=case_space`, que pliega las variantes de caso y el prefijo `Ġ` sobre un unico identificador tras el pooling; esto reduce el vocabulario efectivo de 50*k* a unas 34*k* dimensiones, eliminando duplicados de superficie y mejorando la eficiencia del indice invertido. Los prefijos `[Q] ` y `[D] ` se atienden pero no se agregan en el pooling. El scoring final es producto escalar entre las representaciones dispersas de consulta y documento.

## Capacidades

- Recuperacion sparse aprendida: genera un diccionario `{termino: peso}` por texto, ordenado por peso descendente, apto para indexacion invertida.
- Expansion de terminos: a partir de una palabra de la entrada el modelo activa variantes morfologicas, sinonimos y terminos relacionados (`player` activa `players`, `pay`; `NYC` activa `ny`, `York`, `capit`, `Capitol`).
- Codificacion asimetrica consulta/documento con prefijos distintos y longitudes maximas distintas (128 frente a 512).
- Scoring por producto escalar para ranking de documentos.
- Utilidades de diagnostico: `encode_to_dict` (diccionarios termino-peso con control de `top_k` y redondeo), y `render` (grafico de barras en terminal con atribucion del termino de origen y marca de expansion pura mediante `<- source@pos` o `<exp>`).
- Compatibilidad con `sentence-transformers` (tag declarado) y con `text-embeddings-inference` (tag `endpoints_compatible`).
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio: es exclusivamente un encoder de recuperacion, no un modelo generativo.

## Casos de uso

- Motor de busqueda sparse en produccion: la representacion `{termino: peso}` se indexa directamente en un indice invertido tipo Lucene/OpenSearch, de modo que la recuperacion reutiliza infraestructura de busqueda clasica en lugar de requerir un indice vectorial denso.
- Busqueda hibrida con reordenacion: al compartir backbone y datos con DenseOn y LateOn, los tres modelos pueden combinarse sobre el mismo corpus y fusionar puntuaciones sparse y densas sin desajustes de tokenizacion ni de distribucion de datos.
- Recuperacion de baja latencia: con el motor Seismic sobre MS MARCO alcanza latencias por debajo del milisegundo en un solo hilo, lo que lo hace apto para autocompletado de busqueda y sugerencias en tiempo real.
- Analisis de atribucion y depuracion de recuperacion: la funcion `render` muestra que termino de la entrada genero cada expansion y con que peso, util para auditar por que un documento concreto aparece en el ranking.
- Sistemas RAG con restricciones de memoria: al ser un encoder de 188M de parametros y pesos de menos de 1 GB, cabe en servidores modestos y permite desplegar recuperacion sobre corpus grandes con coste de GPU bajo.
- Deduplicacion y busqueda de similitud a nivel de terminos: el vocabulario plegado (~34k dimensiones) reduce la ambiguedad entre variantes de superficie, util en catalogos con nombres de producto o entidades escritas de formas inconsistentes.
- Filtrado previo en pipelines de reranking: al ser un modelo sparse barato, puede actuar como primera etapa para reducir un corpus de millones de documentos a un conjunto pequeno que luego se reordena con un cross-encoder.
- Evaluacion comparativa de arquitecturas de retrieval: sirve como referencia controlada frente a LateOn y DenseOn en experimentos academicos sobre BEIR, al mantener constante backbone y datos de entrenamiento.

## Benchmarks y rendimiento

Comparacion controlada en BEIR-13 (nDCG@10) frente a LateOn y DenseOn, mismo backbone y mismos datos. SPARSEUP usa busqueda aproximada con Seismic; LateOn y DenseOn reportan busqueda exacta:

| Modelo | Media BEIR-13 | Media sin MS MARCO |
|---|---|---|
| LateOn | 57.9 | 58.9 |
| DenseOn | 56.9 | 57.9 |
| SPARSEUP | 55.4 | 56.4 |

Comparacion frente a otros encoders sparse competitivos, media sin MS MARCO:

| Modelo | Media (sin MS MARCO) |
|---|---|
| splade-v3 | 51.7 |
| granite-embedding-30m-sparse | 50.6 |
| ModernBERT-VT | 52.4 |
| opensearch-neural-sparse-encoding-v1 | 52.44 |
| opensearch-neural-sparse-encoding-doc-v3-gte | 54.6 |
| SPARSEUP | 56.4 |
| LACONIC-1B | 58.7 |

Latencia: con infraestructura dedicada (Seismic) alcanza latencias por debajo del milisegundo en MS MARCO en ejecucion monohilo. No se publican cifras de throughput agregado en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 753 MB en fp32 (188,4M de parametros), unos 377 MB en fp16/bf16 y unos 188 MB en int8. Son estimaciones aritmeticas sobre el numero de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para el calculo del encoder. Para servir a escala se recomienda A100, H100 o L40S, pero no por requisito de memoria sino por concurrencia y throughput.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090). El cuello de botella en produccion sera el indice invertido, no la GPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (uso directo con `AutoModel`), `sentence-transformers`, `text-embeddings-inference` (tag declarado) y motores de busqueda sparse como Seismic para el indice invertido.
- Latencia: por debajo del milisegundo en MS MARCO con Seismic y ejecucion monohilo, segun el autor. No disponible para otras configuraciones.
- CPU: viable para inferencia en CPU dado el tamano del modelo, aunque el dato no se especifica en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de recuperacion | BEIR-13 (sin MS MARCO) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPARSEUP | 188,4M | Sparse aprendido (SPLADE-like, vocabulario plegado) | 56.4 | Apache 2.0 | HuggingFace, transformers |
| LateOn | 149M (backbone) | Interaccion tardia (multi-vector) | 58.9 (busqueda exacta) | No disponible en la informacion | HuggingFace (lightonai) |
| DenseOn | 149M (backbone) | Vector unico denso | 57.9 (busqueda exacta) | No disponible en la informacion | HuggingFace (lightonai) |
| splade-v3 | No disponible | Sparse aprendido (SPLADE) | 51.7 | No disponible en la informacion | HuggingFace |
| opensearch-neural-sparse-encoding-doc-v3-gte | No disponible | Sparse aprendido | 54.6 | No disponible en la informacion | OpenSearch / HuggingFace |
| LACONIC-1B | 1B | Sparse aprendido | 58.7 | No disponible en la informacion | HuggingFace |

Nota: los numeros de LateOn y DenseOn proceden de busqueda exacta, mientras que SPARSEUP usa busqueda aproximada con Seismic, por lo que la comparacion no es estrictamente homogenea en el metodo de recuperacion.

## Limitaciones y advertencias

- Solo ingles: el tag de idioma es `en` y no se declara soporte multilingue.
- Longitudes limitadas en evaluacion: 128 tokens para consultas y 512 para documentos. No se especifica el comportamiento con textos mas largos.
- No es un modelo generativo: no puede usarse para generacion de texto, resumen, traduccion ni razonamiento. Tampoco soporta tool calling ni flujos de agente.
- Requiere `trust_remote_code=True`, ya que el repositorio incluye codigo personalizado (`custom_code`) con metodos propios (`encode_to_dict`, `render`, `score`). Auditar ese codigo antes de desplegarlo en produccion.
- Riesgo de falso positivo por expansion de terminos: el modelo activa variantes y relacionados con pesos altos (por ejemplo, `Capitol` y `capit` para una consulta sobre capitales), lo que puede introducir ruido en dominios muy tecnicos o con vocabulario especializado.
- Los pesos son aprendidos sobre la mezcla de datos de LightOn; puede heredar los sesgos de ese corpus, que no se detalla en la informacion proporcionada.
- El rendimiento reportado en BEIR emplea busqueda aproximada (Seismic), por lo que las cifras no son directamente comparables con las de recuperacion exacta de LateOn y DenseOn.
- El plegado de vocabulario (`case_space`) reduce dimensionalidad pero puede perder distinciones que dependan de mayusculas, relevantes en entidades, siglas o nombres propios.
- Uso comercial permitido bajo Apache 2.0, sin restricciones adicionales declaradas; aun asi, conviene verificar las condiciones del modelo base `lightonai/LateOn-unsupervised` del que deriva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Linkup-Platform/linkup-sparseup-embed-v1
- Entrada de blog de Linkup sobre SPARSEUP: https://www.linkup.so/blog/introducing-sparseup-by-linkup
- Modelo base: https://huggingface.co/lightonai/LateOn-unsupervised

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo. Los resultados obtenidos corresponden a entidades homonimas sin relacion (Linkup Coaching, Sage LinkUp Experts y el grupo musical Linkup).
