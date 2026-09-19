# lucataco/gliner2.5-cua-grounder-macos-v2

## Resumen

GLiNER2.5 CUA Grounder macOS v2 es un modelo de seleccion de acciones (action chooser) para agentes de uso de ordenador (computer-use agents, CUA), publicado por el usuario lucataco como ajuste fino de fastino/gliner2.5-multi-v1. No es un modelo generativo: recibe un paso de planificador en texto y un menu cerrado de entre 2 y 32 acciones totalmente especificadas, y devuelve la probabilidad de cada candidata, incluyendo las opciones especiales `reobserve` y `abstain`. Su funcion es actuar como capa de decision determinista y auditable por debajo de un planificador de mas alto nivel.

Tecnicamente se apoya en la arquitectura `BoundaryExtractor` de GLiNER2.5 con un encoder mDeBERTa-v3-base y 287.355.159 parametros. El ajuste se realizo con LoRA de rango 16 (alpha 32, dropout 0) sobre 2.715.664 parametros entrenables, seleccionando el paso 100 de 400, y los pesos finales se publican fusionados en FP32 (safetensors, aproximadamente 1,07 GiB). El repositorio incluye ademas una puerta logistica de efecto verificado (`gate.json` + `gate_calibration.json`) de 14 caracteristicas, entrenada por separado con el transformer congelado.

Su relevancia actual radica en un detalle critico de seguridad: el selector por si solo no alcanza un umbral de ejecucion en su propia particion de calibracion (ningun umbral cumplia el criterio de 5 % de error y 20 casos aceptados), por lo que el autor prohibe explicitamente usar sus probabilidades crudas para autorizar ejecuciones. La puerta de efecto verificado, que exige evidencia de la observacion actual, cubre `com.apple.TextEdit` y `local.browser-forms`; para cualquier otra aplicacion devuelve `abstain`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2.5 `BoundaryExtractor` con encoder mDeBERTa-v3-base |
| Parametros totales | 287.355.159 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens codificados, incluyendo esquema y descripciones |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos FP32 fusionados; no se declaran variantes GGUF, INT8 ni otras) |
| Idiomas soportados | en (entrenamiento y evaluacion en ingles; el grounding multilingue no ha sido probado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32 fusionado, aproximadamente 1,07 GiB; tamano del repositorio 1,2 GB) |

Datos adicionales de configuracion: revision base `235cf92d6d4318da9bfca0d08975c8fa7250d13b`, adaptacion LoRA de rango 16 (alpha 32, dropout 0) con 2.715.664 parametros entrenables, paso seleccionado 100 de 400, y puerta logistica de efecto verificado de 14 caracteristicas con L2 0,001, umbral 0,95 a temperatura 1,0. Entorno de ejecucion verificado: Python 3.12, GLiNER2 2.0.0, PyTorch 2.14.0, Transformers 4.57.6, huggingface-hub 0.36.2.

## Arquitectura y entrenamiento

El modelo no genera texto. Es un extractor/Clasificador de eleccion acotada (`bounded-choice`) construido sobre el `BoundaryExtractor` de GLiNER2.5, que a su vez usa un encoder mDeBERTa-v3-base. La entrada se serializa como un objeto JSON con el paso del planificador y se combina con un esquema de clasificacion que contiene una etiqueta por cada accion candidata y una instruccion fija de tarea. La salida son probabilidades por candidata, entre las que se elige la de mayor valor. El numero de candidatas admitidas va de 2 a 32 e incluye siempre `reobserve` (pedir una observacion nueva cuando la actual esta incompleta o cargando) y `abstain` (no actuar si ninguna accion suministrada encaja).

El ajuste fino se hizo desde Fastino GLiNER2.5 Multi mediante LoRA de rango 16 con alpha 32 y dropout 0, sobre 2.715.664 parametros entrenables y seleccionando el paso 100 de 400. Los pesos del adaptador se fusionaron con la base, de modo que el repositorio es autocontenido y no requiere descargar el modelo base. La innovacion destacable es la separacion en dos etapas: un selector congelado que propone una accion y una puerta logistica de 14 caracteristicas entrenada por separado que estima si esa propuesta producira el efecto solicitado en la aplicacion, a partir de evidencia explicita de la observacion actual. La puerta se entreno con el transformer congelado y solo cubre dos objetivos (`com.apple.TextEdit` y `local.browser-forms`) bajo el contrato de ejecucion de guardado en segundo plano; cualquier otra aplicacion devuelve `abstain` con la razon `unmeasured_application`.

## Capacidades

- Eleccion de accion en vocabulario cerrado: dada una instruccion de planificador y un menu de acciones descritas, selecciona la accion correcta por identificador.
- Desambiguacion fina de campos y controles: distingue, por ejemplo, escribir en el campo "Destination city" frente a "Departure city" o "Passenger name" a partir de la descripcion de la accion.
- Absteccion explicita: devuelve `abstain` cuando ninguna accion candidata corresponde a la instruccion, y `reobserve` cuando la observacion es incompleta o esta cargando.
- Estimacion de efecto verificado: la puerta adjunta calcula `gate.execute_probability`, una probabilidad de que la accion elegida produzca el efecto pedido, usando evidencia de la observacion actual.
- Integracion con esquemas de clasificacion de GLiNER2: admite varias etiquetas por tarea mediante `ClassificationSchema`.
- Inferencia local y offline: funciona en CPU y en MPS (Apple Silicon); requiere `HF_HUB_OFFLINE=1` y la ruta local para operar sin red.
- No dispone de: capacidades de vision (la entrada es solo texto, la observacion la aporta el planificador), generacion de texto libre, tool calling generativo, agentes multi-paso autonomos ni modo de razonamiento explicito.
- Capacidades multilingues: no probadas. El autor indica que el grounding multilingue esta sin evaluar.

## Casos de uso

- Automatizacion de aplicaciones de escritorio en macOS: el modelo actua como capa de decision bajo un agente que opera TextEdit, eligiendo entre las acciones que el planificador propone y evitando que el agente invente acciones fuera del menu.
- Rellenado de formularios web: con el objetivo `local.browser-forms`, selecciona la accion que escribe cada valor en el campo correcto, distinguiendo entre campos con etiquetas similares.
- Guardarraíl de ejecucion en agentes CUA: la puerta de efecto verificado permite bloquear acciones cuya probabilidad de exito no supera el umbral de 0,95, reduciendo ejecuciones erroneas en produccion.
- Deteccion de observaciones incompletas o en carga: mediante `reobserve`, el agente puede esperar a tener un estado de interfaz fiable antes de decidir, en lugar de actuar sobre informacion parcial.
- Enrutado con absteccion en pipelines heterogeneos: para aplicaciones no cubiertas por la puerta, el modelo devuelve `abstain` con la razon `unmeasured_application`, lo que permite derivar la peticion a un operador humano o a otro controlador.
- Evaluacion de planificadores: al ser un selector determinista y acotado, sirve como componente fijo para medir la calidad de las acciones que propone un planificador, manteniendo constante la capa de decision.
- Despliegue en portatiles Apple Silicon: al ocupar aproximadamente 1,07 GiB en FP32 y ejecutarse en MPS, es viable como componente residente en un equipo de desarrollo sin GPU dedicada.
- Clasificacion textual de proposito general: al mantener la interfaz de clasificacion de GLiNER2, admite tareas de etiquetado por esquema, aunque su ajuste esta orientado al dominio de acciones de interfaz.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Bounded-action grounding | Owned synthetic CUA grounding v2 (256 peticiones de test; vocabulario y plantillas disjuntos) | Accepted-action accuracy | 0,7695 | No |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros), lo cual es coherente con la naturaleza del modelo: no es un generador de texto y su tarea es una clasificacion de eleccion acotada sobre un conjunto sintetico propio. Tampoco se aportan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, entre 1,5 y 2 GB; en FP16, aproximadamente 0,6 GB de pesos mas overhead; en INT8, alrededor de 0,3 GB de pesos. Son estimaciones derivadas del recuento de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre. El autor verifico la ejecucion en MPS (Apple Silicon); tambien funciona en CPU. No se documentan pruebas en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna, e incluso en CPU o en un portatil con Apple Silicon.
- Opciones de despliegue: la libreria `gliner2[local]==2.0.0` con `AutoExtractor` (no el cargador antiguo `GLiNER2`, limitado a spans) y `gliner2.classification.Classifier`. El repositorio clasifica con la CLI `gliner-cua cua-gate-choose`. No se ha publicado soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Requisitos de version: Python 3.12, PyTorch 2.14.0, Transformers 4.57.6, huggingface-hub 0.36.2, sentencepiece >= 0.2 y < 1, protobuf >= 4 y < 8. Se recomienda mantener el modelo residente entre llamadas y fijar una revision concreta para que todos los ficheros sean coherentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gliner2.5-cua-grounder-macos-v2 (este modelo) | 287.355.159 | 4.096 tokens codificados | Seleccion acotada de acciones CUA + puerta de efecto verificado | Apache-2.0 | HuggingFace, repositorio con acceso restringido (gated) |
| fastino/gliner2.5-multi-v1 | no disponible en la informacion proporcionada | no disponible | Grounding/extraccion multilingue base | no disponible en la informacion proporcionada | HuggingFace |
| Planificadores CUA generativos multimodales (por ejemplo, la familia UI-TARS y similares) | no disponible en la informacion proporcionada | no disponible | Planificacion y grounding visual de extremo a extremo | no disponible en la informacion proporcionada | no disponible |

La diferencia funcional relevante no es de tamano sino de contrato: frente a un planificador generativo multimodal que produce acciones en texto libre, este modelo restringe la salida a un menu cerrado y anade una puerta calibrada que puede abstenerse. No se dispone de datos comparativos de rendimiento frente a las alternativas citadas.

## Limitaciones y advertencias

- El selector por si solo no tiene umbral de ejecucion valido: en su propia particion de calibracion ningun umbral cumplia el criterio de 5 % de error con 20 casos aceptados. El autor indica explicitamente que las probabilidades crudas del selector no deben usarse como puerta de ejecucion.
- La puerta de efecto verificado solo cubre `com.apple.TextEdit` y `local.browser-forms` bajo el contrato de ejecucion de guardado en segundo plano. Cualquier otra aplicacion devuelve `abstain` con razon `unmeasured_application`.
- La supervision es texto, no vision: el modelo depende de que el planificador le entregue una descripcion fiel de la observacion actual. Una observacion erronea o incompleta degrada la decision.
- Idioma: entrenado y evaluado en ingles. El grounding multilingue no se ha probado y no hay garantias de comportamiento en castellano u otros idiomas.
- Evaluacion no verificada: la exactitud de 0,7695 procede de un conjunto sintetico propio del autor (256 peticiones de test, con vocabulario y plantillas disjuntos) y figura marcada como `verified: false`. No hay validacion en entornos reales ni comparacion con terceros.
- Riesgo de alucinacion: bajo en el sentido generativo, porque la salida se restringe a las candidatas suministradas; el riesgo real es de eleccion erronea o de sobreconfianza de la puerta ante observaciones ambiguas.
- Limite de contexto operativo: 4.096 tokens codificados que incluyen el esquema y las descripciones de las acciones. Menus muy largos o descripciones extensas pueden provocar truncamiento, y el numero de candidatas esta acotado entre 2 y 32.
- Limitacion de alcance: no es un modelo de proposito general. No genera codigo, no razona en multiples pasos ni planifica; solo elige dentro de un conjunto cerrado.
- Compatibilidad: con Transformers 4.57.6 el tokenizer puede emitir una advertencia espuria de expresion regular de Mistral pese a no ser un modelo Mistral. Debe conservarse el tokenizer suministrado, ya que la paridad entre exportacion y puntuacion fue verificada con el.
- Licencia: Apache-2.0, que permite uso comercial. Conviene verificar de forma independiente la licencia de `fastino/gliner2.5-multi-v1` y de los datos de entrenamiento antes de un despliegue comercial, ya que en la informacion disponible no se detalla su licencia.
- Estado del repositorio: 19 descargas y 1 like en el momento de la consulta, con acceso restringido (gated). El codigo, los scripts de entrenamiento y los artefactos de experimentos se mantienen en un arbol separado, por lo que la trazabilidad completa no esta en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucataco/gliner2.5-cua-grounder-macos-v2
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Referencia arXiv citada en las etiquetas del repositorio: https://arxiv.org/abs/2507.18546
- Los resultados de la busqueda web disponible no contienen enlaces relevantes a este modelo: todas las entradas devueltas tratan sobre turismo en Florencia y no guardan relacion con el contenido de la ficha.
