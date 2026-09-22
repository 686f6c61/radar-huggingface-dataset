# FluidInference/lfm2-5-350m-rlcd-coreml

## Resumen

`FluidInference/lfm2-5-350m-rlcd-coreml` es una exportacion Core ML de forma fija del camino de decision restringida del modelo `notnotsamuel/LFM2.5-350M-RLCD`. No es un modelo nuevo: reutiliza sin cambios el checkpoint LFM2.5-350M de 354.483.968 parametros y el renderizador de prompts y esquemas RLCD del proyecto original, y lo empaqueta como un grafo Core ML que puntua valores candidatos de un esquema JSON cerrado en lugar de generar texto libre.

El artefacto publicado, `lfm350_rlcd_fp16_L256_B8_V16.mlpackage`, acepta entradas de 256 tokens, hasta 8 candidatos por llamada y hasta 16 tokens por valor. En lugar de compartir la cache hibrida de atencion y convolucion del implementacion upstream, el grafo recalcula el prompt completo para cada candidato: es un metodo de puntuacion fiel, pero con un esquema de computo y una velocidad distintos a los de la implementacion cacheada original.

Su relevancia es acotada y muy especifica: permite ejecutar una tarea de decision estructurada sobre Apple Silicon sin depender de servicios en la nube, con una validacion declarada de 9/9 coincidencias con el scorer nativo en nueve casos de tarea RLCD seleccionados. No es un modelo de chat, no genera texto abierto y su licencia impone un umbral de ingresos para el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion y convolucion (la model card menciona la "hybrid attention/convolution cache" upstream); exportado como grafo Core ML de forma fija |
| Parametros totales | 354.483.968 |
| Parametros activos | no aplica (no se indica configuracion MoE) |
| Longitud de contexto | 256 tokens de entrada por llamada en el artefacto Core ML (forma fija); contexto del checkpoint base: no disponible |
| Tipos de cuantizacion | FP16 (unico artefacto incluido, `lfm350_rlcd_fp16_L256_B8_V16.mlpackage`). Existe una exportacion de referencia FP32 que igualo al scorer nativo, pero no se distribuye |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`), con umbral de ingresos para la concesion de uso comercial; el codigo RLCD upstream se incluye como `LICENSE-CODE` |
| Formato de pesos | Core ML `.mlpackage` (ML Program), con tokenizer incluido en el repositorio; el checkpoint de origen esta en safetensors |

Datos adicionales del artefacto: 709.563.326 bytes, tamano del repositorio 0,7 GB, compute units validados `.all` en el Mac Apple Silicon probado. Fecha de creacion y actualizacion: 2026-09-22. Descargas y likes: 0.

## Arquitectura y entrenamiento

El artefacto no entrena nada: es una conversion. Los pesos provienen del checkpoint `notnotsamuel/LFM2.5-350M-RLCD` en el commit `deb589d803d141cabd158ef55f6617b128529f36` (`model.safetensors` con SHA256 `1c9c77a4471a7f590f85240f74ed1fc26df7fbde88c3006724e2f93ca993ea4e`), cuyo manifiesto de publicacion afirma que son copias byte a byte de los pesos de `LiquidAI/LFM2.5-350M`. La capa RLCD aporta el renderizador de prompts y el esquema de decision, no un reentrenamiento documentado en esta ficha.

La innovacion tecnica relevante esta en el grafo exportado. Para cada valor permitido del esquema, el modelo suma las log-probabilidades de **todos** los tokens de ese valor, en lugar de evaluar solo el primero. El precio es computacional: el grafo Core ML recalcula el prompt para cada candidato en vez de reutilizar la cache hibrida de atencion y convolucion upstream, por lo que reproduce fielmente el metodo de puntuacion pero no su planificacion de computo ni su velocidad. El detalle de composicion del dataset, numero de tokens de entrenamiento y uso de RLHF o DPO no se documenta en la informacion disponible.

## Capacidades

- Prediccion estructurada restringida: dado un contexto y un esquema JSON cerrado y plano, elige el valor correcto entre los candidatos permitidos sumando log-probabilidades de tokens completos.
- Soporte de campos de tipo enumeracion de cadena (`string-enum`) y de tipo booleano, ambos obligatorios en el esquema.
- Puntuacion por lotes de hasta 8 candidatos por llamada; mas de 8 candidatos se procesan en varias llamadas.
- Procesamiento de hasta 16 tokens por valor candidato.
- Rechazo explicito de entradas fuera de rango: entradas de mas de 256 tokens o valores de mas de 16 tokens provocan un error. No hay truncamiento silencioso.
- Ejecucion local en Apple Silicon mediante el runtime Core ML incluido.
- No incluye generacion de texto sin restricciones.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso abierto, vision, audio ni capacidades multilingues.
- No se documenta un modo de pensamiento (thinking mode).

## Casos de uso

- Enrutado de tickets y facturas: con el esquema de ejemplo de la model card (`"route"` con enum `["billing","support"]`), el modelo clasifica una incidencia como facturacion o soporte a partir de un contexto corto, sin salida de texto libre y con el valor restringido al conjunto permitido.
- Extraccion de campos con vocabulario cerrado: para formularios o documentos con categorias predefinidas (tipo de contrato, canal de contacto, motivo de reclamacion), se define un enum por campo y el modelo devuelve unicamente valores validos por construccion.
- Banderas booleanas de cumplimiento: campos como `requiere_revision_humana` o `contiene_datos_personales` se modelan como booleanos requeridos y el modelo decide verdadero o falso sumando log-probabilidades de los tokens de cada opcion.
- Clasificacion de intencion en el dispositivo: al ser un artefacto Core ML de ~0,7 GB que se ejecuta en local, permite clasificar texto de usuario sin enviar datos a un servicio externo, util en escenarios con requisitos de privacidad.
- Seleccion de ruta en un agente: el caso de enrutado con 9 candidatos citado en la model card requiere dos llamadas al modelo (8 candidatos como maximo por llamada), lo que encaja en un paso de decision previo a la invocacion de una herramienta.
- Moderacion o triaje con umbral: al devolver una decision categorica restringida, se puede integrar como primer filtro antes de un modelo generativo mayor, reduciendo coste y latencia en el camino comun.
- Etiquetado por lotes en pipelines de datos: la puntuacion de hasta 8 candidatos por llamada y los 65,1 ms de mediana por llamada tras la primera permiten procesar volumenes moderados de registros en un Mac Apple Silicon, siempre que la tarea se formule como decision cerrada.
- Automatizaciones de escritorio en macOS: al ser Core ML puro, puede embeberse en aplicaciones nativas o scripts locales que necesiten tomar decisiones discretas documentadas, sin dependencias de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de validacion son los declarados por el autor para este artefacto concreto:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Coincidencia de valores con el scorer nativo de valores completos | 9/9 casos | Nueve casos de tarea RLCD seleccionados, exportacion FP16 con compute units `.all` |
| Diferencia maxima de log-verosimilitud por candidato | 0,0478 | Misma validacion |
| Latencia mediana por llamada al modelo | 65,1 ms | B8/L256, tras la primera llamada, 10 llamadas de modelo en los casos citados |
| Llamadas necesarias en el caso de enrutado con 9 candidatos | 2 | Limite de 8 candidatos por llamada |
| Via CPU+ANE forzada en FP16 | Error grande de verosimilitud en un fixture seleccionado, aunque eligio los mismos valores | Ruta no valida para este grafo |
| Via solo CPU | No supero el umbral predeclarado de 0,5 de error de verosimilitud | Ruta no valida |
| Via `.all` | Supero el umbral predeclarado | Ruta validada |

El autor indica explicitamente que estas cifras miden solo llamadas al modelo y no constituyen una puntuacion oficial del Decision Index, una estimacion de precision ni una latencia extremo a extremo. Tampoco se reclama que el artefacto reproduzca el valor de Decision Index reportado por el tracker.

## Requisitos de hardware

- Memoria estimada: el artefacto ocupa 709.563.326 bytes (~0,71 GB) en FP16; una estimacion orientativa de memoria en ejecucion ronda 0,8-1 GB, aunque no hay cifra oficial publicada.
- Plataforma: Apple Silicon exclusivamente. La validacion se realizo en un Mac Apple Silicon concreto con compute units `.all`, que es la configuracion validada.
- GPU NVIDIA: no aplica. Core ML no es un runtime de despliegue para A100, H100 o RTX 4090, y no se publican pesos GGUF ni safetensors listos para vLLM o TGI.
- Consumer GPU: no procede; el destino es hardware Apple (SoC de la serie M).
- Restriccion critica de compute units: el grafo FP16 **no debe forzarse a CPU+ANE**, porque en un fixture seleccionado esa ruta produjo un error grande de verosimilitud pese a elegir los mismos valores. La ruta solo CPU tampoco supero el umbral de 0,5 de error de verosimilitud. Solo `.all` paso.
- Despliegue: `coremltools` y el runtime incluido (`runtime.py`), con las dependencias fijadas en `runtime-requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 65,1 ms de mediana por llamada al modelo despues de la primera, a B8/L256, medida sobre 10 llamadas. No incluye el coste de extremo a extremo de la peticion.
- Rendimiento: no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Puntuacion | Licencia |
|---|---|---|---|---|---|
| `FluidInference/lfm2-5-350m-rlcd-coreml` (este) | 354.483.968 | 256 tokens de entrada por llamada (forma fija) | Core ML `.mlpackage` FP16 | Suma log-probabilidades de todos los tokens de cada valor; recalcula el prompt por candidato | LFM Open License v1.0 con umbral de ingresos |
| `notnotsamuel/LFM2.5-350M-RLCD` | 354.483.968 | no disponible | safetensors | Scorer nativo de valores completos con cache hibrida de atencion y convolucion | LFM Open License v1.0 |
| `LiquidAI/LFM2.5-350M` | 354.483.968 | no disponible | safetensors | Modelo base, sin la capa RLCD de decision restringida | LFM Open License v1.0 |
| Otros export Core ML de LLM para decision estructurada | no disponible | no disponible | no disponible | no disponible | no disponible |

En rendimiento, la unica comparacion publicada es contra el scorer nativo: el artefacto Core ML eligio los mismos valores en 9 de 9 casos, con una diferencia maxima de log-verosimilitud de 0,0478, pero con un coste de computo mayor al no compartir cache entre candidatos. No se dispone de comparaciones con modelos de otra familia ni de puntuaciones en benchmarks abiertos.

## Limitaciones y advertencias

- No genera texto libre. Cualquier uso que espere una respuesta abierta, resumen o chat queda fuera del alcance del artefacto.
- Solo acepta un esquema JSON cerrado y plano, con campos obligatorios de tipo `string-enum` o booleano. Esquemas anidados, tipos numericos libres o propiedades adicionales no estan soportados.
- Limite duro de 256 tokens de entrada y 16 tokens por valor. Superar cualquiera de los dos provoca un error; no hay truncamiento silencioso, lo que puede romper pipelines que asuman recorte automatico.
- Maximo de 8 candidatos por llamada. Conjuntos mayores exigen varias llamadas y coordinacion externa para agregar resultados.
- Sensibilidad a la configuracion de ejecucion: forzar CPU+ANE en FP16 produjo un error grande de verosimilitud en un fixture y la ruta solo CPU no paso el umbral predeclarado de 0,5. Solo `.all` esta validado.
- Precision limitada: en FP16 la diferencia maxima de log-verosimilitud por candidato llego a 0,0478. En decisiones con candidatos muy proximos en probabilidad, esa diferencia puede alterar el resultado.
- Base de validacion estrecha: 9 casos de tarea y una unica maquina Apple Silicon. No hay garantia de generalizacion a otros dominios, idiomas o hardware.
- El autor declara explicitamente que no reclama reproducir el valor de Decision Index del tracker ni ofrecer una estimacion de precision.
- Licencia: LFM Open License v1.0, con umbral de ingresos en la concesion de uso comercial. Es un artefacto modificado respecto a los pesos originales, y hay que leer la licencia incluida antes de cualquier uso productivo.
- Sesgos conocidos: no disponibles. No se documenta composicion del dataset ni evaluaciones de sesgo.
- Idiomas soportados: no disponible. No se puede asumir cobertura multilingue.
- Riesgo de error en la decision: aunque no hay generacion abierta y por tanto no hay alucinacion en el sentido habitual, el modelo puede elegir un valor incorrecto del enum o un booleano equivocado, y no expone una medida de calibracion.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Las fechas de creacion y actualizacion del repositorio son 2026-09-22, con una ventana de publicacion de menos de un minuto entre ambas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/lfm2-5-350m-rlcd-coreml
- Checkpoint de origen: https://huggingface.co/notnotsamuel/LFM2.5-350M-RLCD
- Commit de origen: https://huggingface.co/notnotsamuel/LFM2.5-350M-RLCD/blob/deb589d803d141cabd158ef55f6617b128529f36/LICENSE
- Casos de tarea RLCD upstream: https://huggingface.co/notnotsamuel/LFM2.5-350M-RLCD/blob/deb589d803d141cabd158ef55f6617b128529f36/rlcd/tasks.py
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia LFM Open License v1.0: https://huggingface.co/notnotsamuel/LFM2.5-350M-RLCD/blob/deb589d803d141cabd158ef55f6617b128529f36/LICENSE
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados disponibles tratan sobre herramientas de traduccion (DeepL, QTranslate) y no guardan relacion con este artefacto.
