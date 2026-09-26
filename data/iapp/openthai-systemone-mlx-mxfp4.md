# iapp/OpenThai-SystemOne-MLX-mxfp4

## Resumen

OpenThai-SystemOne-MLX-mxfp4 es la version cuantizada en formato MLX MXFP4 de OpenThai-SystemOne v0.3, un modelo de decision (System One) bilingue tailandes-ingles desarrollado por iApp Technology / OpenThaiGPT. No es un modelo generativo: recibe un texto o un estado JSON y responde, en un unico forward pass, preguntas tipadas con probabilidades calibradas. Admite tres tipos de consulta: `choice` (eleccion entre hasta 255 opciones), `score` (puntuacion ordinal) y `noul` (si/no).

La arquitectura combina una torre de texto Qwen3.5-0.8B sometida a preentrenamiento continuado en tailandes con una cabeza de decision de 256 ranuras. El conjunto suma 752.412.480 parametros (unos 752 M) y el repositorio ocupa 401 MB. La cuantizacion afecta a la torre completa, incluida la tabla de embeddings, mientras que la cabeza de decision y las temperaturas por tipo de pregunta se mantienen en fp32.

Su relevancia practica esta en el coste de inferencia: medido en un MacBook Pro M3 Max, resuelve una decision de tres preguntas en tailandes en aproximadamente 19 ms, frente a los ~150 ms del modelo original en PyTorch sobre MPS. Se distribuye con licencia Apache-2.0 y esta pensado para ejecutarse en Apple Silicon mediante mlx-lm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (torre de texto Qwen3.5-0.8B con preentrenamiento continuado en tailandes) mas cabeza de decision de 256 ranuras |
| Parametros totales | 752.412.480 (~752 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX MXFP4 de 4 bits (el modelo base existe en bf16) |
| Idiomas soportados | th (tailandes), en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en MLX MXFP4; `head.safetensors` en fp32 |
| Tamano del repositorio | 401 MB |
| Biblioteca de inferencia | mlx (mlx-lm) |
| Tarea declarada (pipeline) | text-classification |
| Modelo base | iapp/OpenThai-SystemOne (relacion: quantized, v0.3, commit f3709948) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint v0.3 (commit `f3709948`) de OpenThai-SystemOne. La parte cuantizada es la torre de texto, incluida la tabla de embeddings de tokens, que MLX tambien cuantiza. La cabeza de decision de 256 ranuras y las temperaturas especificas de cada tipo de pregunta permanecen en fp32 dentro de `head.safetensors`; por tanto, la cuantizacion solo perturba el estado oculto que lee la cabeza. El flujo de ejecucion es mixto: mlx-lm ejecuta la torre y el cliente incluido aplica la cabeza de decision sobre los estados ocultos finales.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base, mas alla de que la torre parte de Qwen3.5-0.8B con preentrenamiento continuado en tailandes. La innovacion destacable es el planteamiento de "System One": respuestas tipadas con probabilidades calibradas en una sola pasada, sin decodificacion autoregresiva de texto, lo que reduce drasticamente la latencia frente a un modelo generativo del mismo orden de tamano.

## Capacidades

- Decision en un unico forward pass: responde preguntas tipadas sobre un texto o un estado JSON sin generar texto libre.
- Tipo `choice`: eleccion entre hasta 255 opciones, con distribucion de probabilidades por opcion.
- Tipo `score`: puntuacion ordinal (por ejemplo, niveles de evaluacion), con exactitud a nivel exacto.
- Tipo `noul`: respuesta binaria si/no.
- Probabilidades calibradas, con temperaturas especificas por tipo de pregunta.
- Clasificacion de sentimiento, intencion, topicos, coherencia, relevancia, implicacion textual y moderacion de contenido.
- Seleccion de herramientas: en el subconjunto xlam_tools alcanza 99,2 de exactitud tras la cuantizacion, lo que indica capacidad para elegir la herramienta o funcion adecuada en un conjunto cerrado de opciones.
- Bilinguismo tailandes-ingles, con evaluacion especifica en conjuntos tailandeses (wisesight, wongnai, prachathai, massive_th) e ingleses.
- No genera texto, no soporta tool calling generativo, agentes multi-step, vision ni audio.

## Casos de uso

- Analisis de sentimiento en resenas y redes sociales en tailandes: el modelo clasifica un texto de entrada en categorias como positivo, negativo o neutro y devuelve probabilidades calibradas, util para monitorizacion de marca en tiempo real.
- Moderacion de contenido: los tipos `noul` permiten filtrar comentarios toxicos o no conformes (conjuntos aegis2 y civil_comments evaluados) con una latencia de milisegundos por decision, adecuada para pipelines de alto volumen.
- Clasificacion de intenciones en atencion al cliente: con el tipo `choice` se puede mapear una consulta entrante a una de las intenciones predefinidas (evaluado en banking77 y massive_th) antes de derivarla a un flujo automatico.
- Enrutado de herramientas en agentes: dado un estado JSON con la conversacion, el modelo selecciona la herramienta correcta entre un conjunto cerrado (xlam_tools con 99,2 de exactitud), lo que sirve como capa de enrutado previa a un LLM generativo mas costoso.
- Verificacion de respuestas y QA extractivo: los tipos `noul` y `choice` permiten comprobar si una respuesta se deduce del contexto (squad2, boolq) y clasificar preguntas de dominio medico (pubmedqa).
- Evaluacion automatica de resumenes: con el tipo `score` puntua coherencia y relevancia de un resumen respecto al documento fuente (summeval), util para control de calidad en pipelines de generacion.
- Deteccion de parafrasis y duplicados: el tipo `noul` sobre pares de frases (paws) permite deduplicar contenidos o detectar reformulaciones en ingesta de datos.
- Clasificacion tematica multilingue restringida a th/en: asignacion de categoria tematica (sib200_th) o inferencia de idioma/relacion textual (xnli_th) en lotes de documentos.

## Benchmarks y rendimiento

Se comparan el modelo original en bf16 y esta cuantizacion sobre los mismos registros (primeros 800 de cada conjunto, `--limit 800`, con un unico orden de opciones). Los subconjuntos marcados como `score` reportan exactitud a nivel exacto.

| Subconjunto | Original bf16 | Esta cuantizacion | Delta |
|---|---|---|---|
| aegis2 (noul) | 83,2 | 82,8 | -0,4 |
| boolq (noul) | 79,7 | 78,3 | -1,3 |
| civil_comments (noul) | 79,0 | 78,7 | -0,3 |
| helpsteer2 (score) | 41,6 | 42,0 | +0,4 |
| massive-de-DE (choice) | 88,3 | 80,9 | -7,4 |
| massive-en-US (choice) | 88,3 | 82,9 | -5,4 |
| multinli (choice) | 89,0 | 87,3 | -1,7 |
| paws (noul) | 94,0 | 92,4 | -1,6 |
| pubmedqa (choice) | 64,0 | 62,0 | -2,0 |
| squad2 (noul) | 89,3 | 84,9 | -4,3 |
| summeval-consistency (score) | 75,0 | 80,6 | +5,6 |
| summeval-relevance (score) | 21,7 | 21,7 | +0,0 |
| vitaminc-dev (choice) | 72,5 | 68,4 | -4,0 |
| Macro, banco publico de 13 subconjuntos | 74,3 | 72,5 | -1,7 |
| banking77 (choice) | 59,1 | 50,6 | -8,5 |
| contrastive_th (choice) | 80,7 | 79,1 | -1,7 |
| contrastive_th (noul) | 83,5 | 82,3 | -1,2 |
| contrastive_th (score) | 78,6 | 76,8 | -1,8 |
| massive_th (choice) | 90,6 | 87,4 | -3,2 |
| prachathai (choice) | 98,3 | 98,5 | +0,2 |
| prachathai (noul) | 93,4 | 93,4 | +0,0 |
| sib200_th (choice) | 77,9 | 71,6 | -6,4 |
| wisesight (choice) | 48,9 | 45,5 | -3,4 |
| wongnai (score) | 64,5 | 63,7 | -0,8 |
| xlam_tools (choice) | 99,4 | 99,2 | -0,1 |
| xnli_th (choice) | 79,8 | 77,1 | -2,6 |
| xnli_th (noul) | 86,8 | 85,8 | -1,0 |
| Macro, conjuntos de evaluacion tailandeses | 80,1 | 77,8 | -2,3 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con modelos de otros autores.

## Requisitos de hardware

- Peso en disco de los pesos cuantizados: 401 MB (repositorio completo de 0,4 GB).
- Al tratarse de 752 M de parametros en 4 bits, la inferencia cabe holgadamente en la memoria unificada de cualquier Apple Silicon reciente; no se publica una cifra oficial de VRAM o RAM reservada, por lo que se indica como no disponible.
- Hardware de referencia del autor: MacBook Pro con M3 Max, donde la decision de tres preguntas en tailandes tarda aproximadamente 19 ms.
- Consumer GPU: el formato MLX MXFP4 esta pensado para Apple Silicon (M1 o posterior). Para GPU NVIDIA o AMD habria que recurrir al modelo base en bf16 y ejecutarlo con PyTorch (el autor reporta ~150 ms por decision comparable sobre MPS), por lo que este repositorio no es directamente utilizable en CUDA.
- Opciones de despliegue: mlx-lm para la torre mas el cliente incluido `openthai_systemone.mlx_client.MLXSystemOneClient` para aplicar la cabeza de decision. No se documentan recetas para vLLM, TGI, llama.cpp u Ollama con esta cuantizacion.
- Dependencias declaradas: mlx-lm, torch, transformers, safetensors y pydantic.
- Throughput: no se publica una cifra agregada de peticiones por segundo; la unica medida disponible es la latencia por consulta mencionada arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai-SystemOne-MLX-mxfp4 (este) | 752 M | no disponible | Macro 72,5 (publico, 13 subconjuntos) y 77,8 (tailandes) | Apache-2.0 | HuggingFace, formato MLX MXFP4 para Apple Silicon |
| OpenThai-SystemOne v0.3 (bf16) | 752 M | no disponible | Macro 74,3 (publico, 13 subconjuntos) y 80,1 (tailandes) | Apache-2.0 | HuggingFace, pesos bf16 para PyTorch |
| Torre base Qwen3.5-0.8B | ~0,8 B (segun nomenclatura del autor) | no disponible | no disponible | no disponible | no disponible como modelo independiente en esta ficha |
| Clasificadores multilingues tipo XLM-R o mDeBERTa | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparativas publicadas frente a otras alternativas en la informacion proporcionada; la unica comparacion documentada por el autor es la del modelo cuantizado frente a su version bf16.

## Limitaciones y advertencias

- La cuantizacion degrada la exactitud de forma desigual: la macro publica baja 1,7 puntos y la tailandesa 2,3, pero hay caidas notables en banking77 (-8,5), massive-de-DE (-7,4) y sib200_th (-6,4). Conviene validar el subconjunto concreto de uso antes de desplegar.
- No es un modelo generativo: no produce texto, no razona en multiples pasos y no sirve para tareas de resumen, traduccion o respuesta libre.
- Alcance limitado a tailandes e ingles; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- La seleccion de opciones es de tipo conjunto cerrado (hasta 255 opciones); cambios en el orden o en el numero de opciones pueden alterar los resultados, ya que la evaluacion publicada usa un unico orden de opciones.
- Algunos subconjuntos presentan valores absolutos bajos incluso en el modelo original (summeval-relevance 21,7; wisesight 45,5-48,9; banking77 50,6-59,1), por lo que no son adecuados como unico criterio de decision en produccion.
- La cabeza de decision permanece en fp32, de modo que el modelo no es un artefacto puramente de 4 bits; hay que conservar `head.safetensors` junto con la torre.
- Dependencia del ecosistema MLX: el formato no es portable a runners CUDA convencionales, lo que limita el despliegue a hardware Apple Silicon o a una conversion previa al modelo base.
- Riesgo de sesgo y alucinacion no evaluado en la informacion disponible: no se publican analisis de sesgo ni tasas de calibracion por subgrupo.
- Licencia Apache-2.0, que permite uso comercial, pero se debe conservar la atribucion y los avisos de licencia del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iapp/OpenThai-SystemOne-MLX-mxfp4
- Modelo base (bf16, v0.3): https://huggingface.co/iapp/OpenThai-SystemOne
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- Resultados de la busqueda web: ninguna fuente relevante. Los enlaces devueltos (iapp.org, prod.iapp.org, myiapp.org, articulo de Wikipedia sobre la International Association of Privacy Professionals) corresponden a una organizacion de privacidad sin relacion con el autor del modelo, por lo que no se incluyen como referencias tecnicas.
