# hyperquader/ministral-3-3b-instruct-genai-int4

## Resumen

`hyperquader/ministral-3-3b-instruct-genai-int4` es un artefacto de conversion de formato, no un modelo entrenado ni ajustado. Su autor, el usuario hyperquader, ha tomado los pesos de `mistralai/Ministral-3-3B-Instruct-2512` y los ha exportado a directorios de modelo de ONNX Runtime GenAI, cuantizados a int4, para que un equipo de escritorio pueda cargarlos sin depender de PyTorch. El motivo declarado es operativo: el broker de Amber Linux carga directorios genai y no existia una build de este modelo con ese formato.

El problema que resuelve es una incompatibilidad concreta de ecosistema. Mistral publica una exportacion ONNX de este modelo, pero en el layout de transformers.js (`decoder_model_merged`, `embed_tokens`, sin `genai_config.json`), que onnxruntime-genai no puede cargar. Esta ficha cubre ese hueco con dos builds completos, uno para CPU y otro para CUDA, cada uno con su propio grafo, pesos y fichero de configuracion.

El artefacto solo incluye la torre de lenguaje (`mistral3_text`), con una ventana de contexto declarada de 262.144 tokens. Al ser una conversion de pesos, su calidad de generacion es la del modelo base; lo que anade este repositorio son la cuantizacion, los grafos ONNX y un conjunto de mediciones de rendimiento y de tool calling realizadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Mistral Ministral 3 3B Instruct); el artefacto exporta unicamente la torre de lenguaje, tipo `mistral3_text` |
| Parametros totales | 3B (segun la denominacion del modelo base; la model card no detalla el recuento exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | int4 (los grafos de CPU y CUDA estan cuantizados de forma distinta) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | ONNX en directorios de modelo onnxruntime-genai, con `genai_config.json` por build; tokenizer, config y plantilla de chat compartidos en la raiz |
| Tamano del repositorio | 4,3 GB |
| Builds incluidas | `cpu/` y `cuda/` (grafos independientes) |
| Runtime requerido | onnxruntime-genai 0.16.0 (el autor advierte de que builder y runtime deben ser de la misma version) |

## Arquitectura y entrenamiento

No hay entrenamiento. El autor lo declara explicitamente: "This is a format conversion, not a fine-tune. Nothing was trained." Los pesos proceden integramente de `mistralai/Ministral-3-3B-Instruct-2512`, un transformer denso de la familia Ministral de Mistral AI, y se han convertido con el modulo `onnxruntime_genai.models.builder` a directorios de modelo de ONNX Runtime GenAI en precision int4. El repositorio no aporta informacion sobre el dataset, el numero de tokens de entrenamiento ni sobre si el modelo base recibio RLHF o DPO.

La innovacion tecnica del artefacto es de empaquetado, no de modelado. Se generan dos grafos completos, `cpu/` y `cuda/`, cada uno con sus pesos y su `genai_config.json`, mientras que el tokenizer, su configuracion y la plantilla de chat se almacenan una sola vez en la raiz porque son identicos byte a byte entre ambas builds. La cuantizacion difiere entre los dos grafos, y por eso la build de CPU ocupa mas espacio en disco (2,28 GB) que la de CUDA (2,01 GB). Un aviso practico del autor: una build CUDA puede cargarse en CPU si se vacia `provider_options`, pero el rendimiento cae a 21 tok/s frente a los 33 tok/s de la build de CPU, de modo que ambos artefactos no son intercambiables. El codificador de vision del modelo base no se ha convertido.

## Capacidades

- Generacion de texto e instrucciones en modo instruct, con la calidad heredada del modelo base Mistral.
- Tool calling mediante un formato propio: una llamada es `[TOOL_CALLS]name[ARGS]{...}`, donde ambos marcadores son tokens especiales unicos y los argumentos son un objeto JSON plano que termina cuando las llaves cuadran.
- Decodificacion restringida por gramatica construida a partir de los esquemas de las herramientas, que impide emitir llamadas malformadas o argumentos fuera de un enumerado.
- Manejo de catalogos de herramientas extensos: el catalogo de 13 herramientas usado en las pruebas consume 2.837 tokens de prompt.
- Ventana de contexto de 262.144 tokens declarada.
- Capacidades multimodales: no disponibles, porque el codificador de vision no se ha convertido.
- Soporte multilingue: no disponible en la informacion proporcionada.
- No se documentan modo de razonamiento explicito (thinking), vision, audio ni otros modos especiales.

## Casos de uso

- Asistentes de escritorio en Linux: el artefacto nace para el broker de Amber Linux, que carga directorios genai; se puede integrar como motor local sin arrastrar una instalacion de PyTorch.
- Agentes locales con tool calling: con un catalogo de herramientas en el prompt y decodificacion restringida por gramatica, el modelo enruta peticiones a la herramienta correcta en la mayoria de los casos medidos (114 de 119), lo que permite construir agentes de un solo paso sobre servicios locales.
- Enrutado y clasificacion de peticiones: la salida JSON constrenida por gramatica encaja bien en tareas donde se necesita una etiqueta o un argumento estructurado en lugar de texto libre.
- Inferencia en equipos sin GPU: la build de CPU ocupa 2,28 GB en disco y rinde 33 tok/s en un i7-13700K, suficiente para asistentes interactivos de un solo usuario o procesos por lotes pequeños.
- Servicio interno con GPU de gama media: la build CUDA rinde 323 tok/s en una RTX 5070 Ti, lo que permite atender varias sesiones concurrentes de baja latencia en una sola tarjeta de consumo.
- Prototipado y evaluacion rapida de tool calling: sirve para validar esquemas de herramientas, prompts y gramaticas antes de trasladar el flujo a un modelo mayor, dado que la conversion mantiene los pesos originales.
- Procesamiento de entradas largas: la ventana declarada de 262.144 tokens permite tareas de resumen o extraccion sobre documentos extensos, siempre que la memoria para la cache KV lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si publica mediciones propias de decodificacion y de tool calling.

Rendimiento de decodificacion (decodificacion greedy, 128 tokens, mejor de tres ejecuciones, onnxruntime-genai 0.16.0):

| Dispositivo | Tamano en disco | Carga | Decodificacion |
|---|---|---|---|
| CPU — i7-13700K | 2,28 GB | 3,9 s | 33 tok/s |
| CUDA — RTX 5070 Ti | 2,01 GB | 1,0 s | 323 tok/s |

Tool calling (119 prompts reservados contra un servidor de herramientas real, catalogo de 13 herramientas en el prompt y generacion restringida por gramatica):

| Medida | Resultado |
|---|---|
| Eligio la herramienta correcta | 98 / 103 |
| Rechazo correctamente cuando no aplicaba ninguna herramienta | 16 / 16 |
| Total correcto | 114 / 119 |
| Coste del catalogo | 2.837 tokens de prompt |

El propio autor matiza dos condiciones de esa cifra: la gramatica restringe la forma pero nunca el juicio (impide una llamada malformada o un argumento fuera de enumerado, no fuerza a elegir bien), y el catalogo es imprescindible, porque sin el el modelo toma la rama de texto libre en todos los prompts que requeran una llamada. Los fallos restantes son mayoritariamente de argumentos, no de enrutado, y parte de ellos son discrepancias con la respuesta de referencia y no errores reales.

## Requisitos de hardware

- Peso en disco: 2,28 GB la build de CPU y 2,01 GB la de CUDA; ambas caben sin problema en cualquier GPU de consumo y en equipos de escritorio corrientes.
- Memoria para inferencia: los pesos int4 ocupan del orden de 2 GB; a eso hay que sumar la cache KV, que crece con la longitud de contexto y no esta cuantificada en la informacion disponible.
- GPU recomendadas: no se publica una lista; la unica medicion es sobre una RTX 5070 Ti (323 tok/s). Cualquier GPU NVIDIA moderna con soporte CUDA deberia poder ejecutar la build CUDA.
- CPU: la build de CPU funciona en un i7-13700K a 33 tok/s, lo que confirma viabilidad en equipos sin GPU dedicada.
- Cabe en GPU de consumo: si, con 2 GB de pesos int4; el limite practico es la cache KV para contextos muy largos.
- Opciones de despliegue: exclusivamente onnxruntime-genai, version 0.16.0 segun las mediciones. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual, salvo que se reconvierta.
- Latencia de carga: 3,9 s en CPU y 1,0 s en CUDA.
- Nota de rendimiento: ejecutar la build CUDA en CPU vaciando `provider_options` funciona, pero baja a 21 tok/s, por debajo de los 33 tok/s de la build especifica de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| hyperquader/ministral-3-3b-instruct-genai-int4 | 3B | 262.144 tokens | ONNX int4 para onnxruntime-genai | Apache 2.0 | Conversion con builds CPU y CUDA; sin benchmark academico publicado; 0 descargas |
| mistralai/Ministral-3-3B-Instruct-2512 (modelo base) | 3B | no disponible en esta ficha | pesos PyTorch originales | Apache 2.0 | Es el origen de los pesos; incluye el codificador de vision que esta conversion omite |
| Exportacion ONNX oficial de Mistral (layout transformers.js) | 3B | no disponible en esta ficha | ONNX para transformers.js | Apache 2.0 | No carga en onnxruntime-genai por carecer de `genai_config.json` |

## Limitaciones y advertencias

- Es una conversion de formato: no se ha entrenado ni ajustado nada, por lo que no cabe esperar ninguna mejora sobre el modelo base.
- El codificador de vision no se ha convertido; el artefacto es exclusivamente de texto.
- Dependencia estricta de version: el autor advierte de que builder y runtime deben ser de la misma version, porque un builder mas reciente escribe un `genai_config.json` que el runtime no puede cargar.
- Las builds de CPU y CUDA no son equivalentes en rendimiento (33 frente a 21 tok/s si se fuerza la CUDA sobre CPU), aunque puedan parecerlo.
- En tool calling, los fallos residuales se concentran en los argumentos, no en la eleccion de herramienta; parte de ellos son discrepancias con la referencia.
- Sin un catalogo de herramientas explicito en el prompt, el modelo no emite llamadas: la gramatica no sustituye a informar de que existen herramientas.
- No hay datos publicados sobre sesgos, idiomas soportados ni comportamiento frente a alucinaciones.
- No hay resultados de benchmarks academicos que permitan comparar con alternativas de su tamano.
- Licencia Apache 2.0, heredada del modelo base, que permite uso comercial; la atribucion del modelo corresponde a Mistral AI y el repositorio solo aporta la conversion y las mediciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Para contextos cercanos al maximo declarado, la memoria de la cache KV puede superar ampliamente el tamano de los pesos y no se han publicado cifras al respecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hyperquader/ministral-3-3b-instruct-genai-int4
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Amber Linux (proyecto que motiva la conversion): https://amberlinux.org
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo, por lo que no se anaden enlaces externos adicionales.
