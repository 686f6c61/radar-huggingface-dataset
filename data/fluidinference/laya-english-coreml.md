# FluidInference/laya-english-coreml

## Resumen

Laya English Core ML es una conversión a Core ML del checkpoint raíz en inglés del modelo convaiinnovations/laya, publicada por FluidInference. Se trata de un modelo de decisión de 421.293.827 parámetros construido sobre un backbone ModernBERT-large al que se le han entrenado cuatro cabezas específicas: choice, score, noul y action. No es un modelo generativo de texto libre, sino un clasificador que, dada una pregunta con un conjunto de opciones, devuelve logits sobre las alternativas disponibles y probabilidades de acción.

El artefacto se distribuye como dos paquetes Core ML de forma fija y precisión FP16, denominados L128 y L512, que cubren entradas de hasta 128 tokens y de 129 a 512 tokens respectivamente. Cada paquete admite un máximo de 32 opciones y está orientado a iOS 17 y macOS 14 o superior, con el objetivo de ejecutar decisiones de agente en el propio dispositivo Apple Silicon, sin depender de servidores externos.

Su relevancia actual radica en que permite latencias de decenas de milisegundos en hardware de consumo: en un Apple M5 Pro, la ruta automática/GPU registró tiempos medianos de llamada de 7,79 ms para L128 y 20,79 ms para L512, con errores máximos de probabilidad calibrada de 0,00225 y 0,00425 frente a PyTorch. Es importante señalar que el autor advierte explícitamente de que este artefacto no debe presentarse como una reproducción verificada del resultado de 16,39 que el tracker Decision Index atribuye a Laya, ya que el checkpoint seleccionado por su adaptador histórico no está autenticado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large con cabezas de decision entrenadas (choice, score, noul, action) |
| Parametros totales | 421.293.827 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (`max_len` del config raiz de Laya); `head_max_len = 192`; dos buckets fijos, L128 (hasta 128 tokens) y L512 (129-512 tokens) |
| Tipos de cuantizacion | FP16, en programas Core ML de forma fija |
| Idiomas soportados | ingles (checkpoint raiz en ingles); los metadatos de HuggingFace no declaran idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquetes MLProgram; no se distribuyen safetensors ni GGUF) |

Entradas y salidas de los paquetes Core ML:

| Elemento | Forma y tipo |
|---|---|
| `input_ids` | `[1, L]` int32 |
| `attention_mask` | `[1, L]` int32 |
| `marker_map` | `[1, 32, L]` float32 |
| `question_type` | `[1, 3]` float32 |
| Salida `logits` | logits crudos |
| Salida `probabilities` | probabilidades sin calibrar |
| Salida `action_probabilities` | probabilidades de accion |

## Arquitectura y entrenamiento

El modelo parte de un backbone ModernBERT-large de 421.293.827 parametros sobre cuyo representacion se han entrenado cuatro cabezas de decision: choice, score, noul y action. El checkpoint ingles esta fijado en el commit `1c5edc17a7acd8701df6fc341c0d179f1c62c982` del repositorio upstream. El config raiz de Laya define `max_len = 512` y `head_max_len = 192`, y la conversion a Core ML respeta esa ventana mediante dos programas de forma fija (L128 y L512) con 32 slots de opcion cada uno.

La conversion, cuyo codigo fuente esta en el repositorio FluidInference/mobius, genera programas Core ML en FP16 y conserva la paridad con la implementacion nativa en PyTorch, registrada en los ficheros `verification-english-L128.json` y `verification-english-L512.json`. Los informes de conversion y el lock de origen incluyen los hashes SHA-256 y el recuento de parametros. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. Tampoco se detalla ninguna innovacion de atencion mas alla de lo atribuible al backbone ModernBERT.

Un aspecto operativo relevante es que las probabilidades de salida no vienen calibradas: el anfitrion debe aplicar las temperaturas especificas por tipo de pregunta y numero de opciones definidas en `rl_agent_config.json`. El fichero `calibration.py` incluido contiene el helper de temperatura y softmax, mientras que `preprocessing.py` requiere el paquete Python upstream `laya` para el renderizado de la entrada.

## Capacidades

- Decision entre opciones: selecciona una alternativa entre un maximo de 32 opciones por consulta, devolviendo logits y probabilidades por opcion a traves de la cabeza choice.
- Puntuacion de candidatos: la cabeza score permite ordenar o valorar opciones segun el criterio aprendido.
- Senal de accion: la cabeza action produce `action_probabilities`, pensada para decidir si el agente debe actuar o abstenerse.
- Tipificacion de pregunta: la entrada `question_type` con tres componentes permite condicionar la decision al tipo de pregunta.
- Marcado de opciones: la entrada `marker_map` de forma `[1, 32, L]` identifica la posicion de cada opcion dentro del texto renderizado.
- Ejecucion en dispositivo: inferencia local en Apple Silicon mediante Core ML, con soporte de rutas GPU y CPU+ANE.
- Idioma: el checkpoint es la variante raiz en ingles; no se declaran capacidades multilingues en este artefacto (la variante multilingue es otro repositorio).
- No dispone de generacion de texto libre, tool calling, capacidades de vision ni modo de razonamiento explicito segun la informacion disponible.

## Casos de uso

- Toma de decisiones de agente en aplicaciones iOS: el modelo puede integrarse como politica de seleccion de accion en un agente embebido, eligiendo entre hasta 32 opciones con latencias de 7,79 ms en L128 en un M5 Pro.
- Enrutamiento de intenciones en asistentes de voz: con `question_type` y `marker_map` se puede clasificar la intencion del usuario entre un conjunto predefinido de alternativas y derivar la conversacion al flujo adecuado.
- Puerta de accion (actuar frente a no actuar): la cabeza action permite filtrar en el dispositivo si una peticion debe ejecutarse o rechazarse antes de invocar servicios externos.
- Valoracion de respuestas candidatas en pipelines de generacion: la cabeza score puede puntuar varias respuestas generadas por otro modelo y seleccionar la mejor segun el criterio aprendido.
- Sistemas de decision offline en macOS: el paquete L512 cubre entradas de hasta 512 tokens, util para clasificar casos con contexto mas largo sin salir del equipo local.
- Prototipado de investigacion en aprendizaje por refuerzo: el formato Core ML y el fichero `rl_agent_config.json` facilitan experimentar con politicas de decision calibradas por temperatura sin reentrenar.
- Aplicaciones con requisitos de privacidad: al ejecutarse en el dispositivo, los textos de entrada no abandonan el terminal, lo que encaja en escenarios con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento son las verificaciones de paridad frente a PyTorch realizadas por el autor:

| Prueba | Ruta de ejecucion | Longitud | Resultado |
|---|---|---|---|
| Paridad de eleccion (16 fixtures) | automatic/GPU en Apple M5 Pro | L128 | 16/16 elecciones coincidentes |
| Paridad de eleccion (16 fixtures) | automatic/GPU en Apple M5 Pro | L512 | 16/16 elecciones coincidentes |
| Error maximo de probabilidad calibrada | automatic/GPU | L128 | 0,00225 |
| Error maximo de probabilidad calibrada | automatic/GPU | L512 | 0,00425 |
| Latencia mediana de llamada | automatic/GPU | L128 | 7,79 ms |
| Latencia mediana de llamada | automatic/GPU | L512 | 20,79 ms |
| Paridad de eleccion | CPU+ANE forzado | ambas | todas las elecciones coincidentes |
| Error maximo de probabilidad calibrada | CPU+ANE forzado | caso de 20 opciones | 0,0355 (supera el umbral predeclarado de 0,02) |

Ademas, el tracker Decision Index reporta un valor de 16,39 para Laya, pero el propio autor indica que el checkpoint seleccionado por su adaptador historico no esta autenticado y que este artefacto en ingles no debe presentarse como una reproduccion verificada de esa puntuacion.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon con iOS 17, macOS 14 o superior. Los paquetes Core ML no estan pensados para GPU NVIDIA ni para ejecucion en servidor x86 convencional.
- VRAM o memoria unificada: no disponible de forma explicita. Como referencia, 421.293.827 parametros en FP16 equivalen a unos 842 MB de pesos, y el repositorio completo ocupa 1,7 GB porque incluye los dos paquetes (L128 y L512).
- GPU recomendadas: no disponibles en el sentido habitual; el hardware validado es un Apple M5 Pro. No se han documentado pruebas en A100, H100 o RTX 4090.
- Cabe en hardware de consumo: si, en equipos Apple Silicon. No hay datos para GPUs de consumo tipo RTX.
- Opciones de despliegue: Core ML exclusivamente. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, dado que el formato no es safetensors ni GGUF.
- Latencia medida: 7,79 ms (L128) y 20,79 ms (L512) de mediana en la ruta automatic/GPU sobre Apple M5 Pro. No se proporcionan datos de throughput.
- Restriccion de ruta: el autor recomienda usar `.all`; la ruta CPU+ANE no esta validada para salidas calibradas porque su error maximo (0,0355) supera el umbral de 0,02, agravado por la temperatura de 0,10058 del checkpoint ingles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia |
|---|---|---|---|---|---|
| FluidInference/laya-english-coreml | 421.293.827 | 512 (`max_len`) | ingles | Core ML FP16 | Apache 2.0 |
| FluidInference/laya-coreml | aproximadamente 322 M | no disponible | multilingue | Core ML | no disponible |
| convaiinnovations/laya (upstream) | no disponible | `max_len = 512`, `head_max_len = 192` | no disponible | no disponible | Apache 2.0 |

La busqueda web realizada no devolvio modelos comparables independientes de la misma categoria (modelos de decision para agentes en dispositivo); los resultados obtenidos no eran pertinentes al tema. Por tanto, la comparativa se limita a las variantes de la propia familia Laya. Ambas variantes Core ML comparten autoria de conversion (FluidInference) y difieren en el checkpoint de origen y en el idioma cubierto.

## Limitaciones y advertencias

- Limite duro de 32 opciones por consulta: las peticiones que lo excedan deben rechazarse o gestionarse segun la politica de truncado de la API upstream.
- Formas fijas: cada paquete solo acepta su bucket de longitud (L128 o L512). Si la entrada renderizada no encaja, hay que seleccionar el bucket correcto o rechazar la peticion.
- Salidas sin calibrar: las probabilidades crudas no son utilizables directamente; es obligatorio aplicar las temperaturas de `rl_agent_config.json`. Omitir este paso invalida la comparacion con los errores reportados.
- Temperatura baja y amplificacion de errores: la temperatura de 0,10058 del checkpoint ingles amplifica diferencias pequenas de logits, lo que explica el fallo del umbral del 0,02 en la ruta CPU+ANE.
- Ruta CPU+ANE no validada: el autor indica explicitamente que no esta validada para salidas calibradas; debe usarse la ruta `.all`.
- Idioma: el artefacto es el checkpoint raiz en ingles. No debe asumirse un comportamiento correcto en castellano u otros idiomas.
- Sin generacion ni agentes completos: no es un modelo de lenguaje generativo, no soporta tool calling ni razonamiento multi-paso por si mismo; solo produce decisiones y puntuaciones.
- Puntuacion no verificada: el valor de 16,39 del tracker Decision Index no esta autenticado para este checkpoint y no debe citarse como resultado de este artefacto.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion externa es inexistente.
- Dependencia del paquete upstream `laya` para el preprocesado: `preprocessing.py` no es autosuficiente.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar las condiciones del repositorio upstream `convaiinnovations/laya` antes de desplegar en produccion.
- No se dispone de informacion sobre sesgos, tasas de alucinacion o evaluaciones de seguridad en la documentacion proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FluidInference/laya-english-coreml
- Modelo base upstream: https://huggingface.co/convaiinnovations/laya
- Variante multilingue Core ML: https://huggingface.co/FluidInference/laya-coreml
- Codigo fuente de la conversion: https://github.com/FluidInference/mobius
