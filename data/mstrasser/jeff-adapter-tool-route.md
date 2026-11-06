# mstrasser/jeff-adapter-tool-route

## Resumen

`mstrasser/jeff-adapter-tool-route` es un adaptador LoRA de tipo decision-model publicado por el usuario mstrasser (proyecto Jeff, repositorio `firelex/jeff`) sobre el modelo base `mstrasser/jeff-base` v1.4, un fine-tune de Qwen3.5-0.8B. Su funcion no es generar texto, sino clasificar: dada una situacion (aplicacion, fecha, menu de herramientas y conversacion previa) y un mensaje del usuario, devuelve una distribucion de probabilidad calibrada sobre las opciones de un menu de herramientas, indicando cual debe invocarse a continuacion, si no hace falta ninguna o si conviene preguntar al usuario por un dato que falta.

El modelo resuelve un problema muy concreto en pipelines de agentes: la seleccion de herramienta (tool routing) sin necesidad de generar y parsear texto. Al producir probabilidades por opcion en un unico forward pass, permite aplicar umbrales de confianza y decidir de forma determinista, lo que simplifica la integracion en sistemas con requisitos de latencia y trazabilidad. Es relevante porque separa la decision de enrutado de la generacion de argumentos, un patron que reduce errores de parseo y facilita la calibracion.

El adaptador se distribuye en formato PEFT/safetensors, ocupa 0,1 GB, esta licenciado bajo Apache 2.0, solo soporta ingles y esta etiquetado como `text-classification`. Su adopcion publica es practicamente nula en el momento de la ficha (0 descargas, 0 likes), y su ecosistema (SDK, servidor) aun no esta publicado en PyPI segun la documentacion del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base derivada de Qwen3.5-0.8B) |
| Parametros totales | no disponible (adaptador de 0,1 GB; el modelo base no detalla su recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato de pesos safetensors; el autor no documenta cuantizaciones del adaptador) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre `mstrasser/jeff-base` en la revision `v1.4`, que segun el autor es un fine-tune de Qwen3.5-0.8B. La tarea es de clasificacion sobre un conjunto de etiquetas definido por el llamante (hasta 24 opciones, cada una con una clave y su descripcion textual). El modelo recibe como contexto la aplicacion (nombre y descripcion), la fecha actual en texto, el menu de herramientas en cualquier formato comun (firmas Python, esquemas JSON, etc.) y la conversacion previa como lista de mensajes; como entrada recibe el ultimo mensaje del usuario. La salida es una probabilidad calibrada por opcion en un unico forward pass, sin generacion de texto.

El entrenamiento del adaptador se realizo el 2026-10-25 segun la model card. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO; la informacion disponible indica que parte de los tests de evaluacion son generados por el mismo generador que los datos de entrenamiento, lo que sugiere un pipeline de datos sinteticos. La calibracion se documenta con un conjunto de 2.000 filas y un umbral de confianza de 0,413 para la funcion `tool`. El motor de Jeff rechaza adaptadores entrenados sobre otra revision del modelo base, por lo que el adaptador solo carga sobre `v1.4`.

## Capacidades

- Seleccion de herramienta a partir de un menu proporcionado en la peticion (hasta 24 opciones), devolviendo una probabilidad calibrada por opcion.
- Deteccion de casos en los que no se necesita ninguna herramienta (`none`): conversacion social, preguntas ya respondidas en el historial o peticiones fuera del alcance del menu.
- Deteccion de informacion faltante (`ask_user`): cuando una herramienta encaja pero falta un dato requerido que no puede extraerse de la conversacion, o cuando la peticion es ambigua entre dos registros o acciones.
- Uso del contexto conversacional multi-turno (mensajes de usuario, asistente, llamadas a herramientas y resultados) para resolver referencias y datos implicitos.
- Salida determinista y estructurada: probabilidades por etiqueta, sin texto generado que parsear.
- Clasificacion de texto en ingles (pipeline `text-classification`).
- No genera argumentos de llamada a herramientas: solo selecciona la herramienta.

## Casos de uso

- Enrutado de herramientas en agentes conversacionales: el adaptador recibe el menu de funciones del agente y el historial de la conversacion, y devuelve la herramienta a invocar con una probabilidad asociada; permite aplicar un umbral de confianza (por ejemplo, 0,413 segun la calibracion publicada) y derivar a un fallback cuando la confianza es baja.
- Atencion al cliente con backends de acciones: en un asistente de gestion (facturas, pedidos, cuentas), el modelo decide si debe buscar un registro, enviar un documento o pedir un dato adicional, usando el historial para resolver referencias como "la factura de octubre de Orbit Print".
- Orquestacion de pipelines con multiples APIs: dado un catalogo de funciones descritas como esquemas JSON, el modelo selecciona la API adecuada para cada mensaje del usuario, lo que simplifica el enrutado en integraciones con muchos endpoints.
- Control de flujo en asistentes de operaciones internas: en herramientas de helpdesk o administracion, decide entre consultar, crear o escalar un ticket, y detecta cuando la peticion es ambigua y conviene preguntar al usuario.
- Pre-filtrado antes de un LLM generador: usar el adaptador como primera etapa barata (un forward pass sobre un modelo de 0,8B) para decidir la herramienta y reservar el modelo grande para la generacion de argumentos y la respuesta final.
- Evaluacion y monitorizacion de agentes: al devolver probabilidades calibradas, permite registrar la confianza de cada decision de enrutado y auditar casos de baja cobertura o alta incertidumbre en produccion.
- Asistentes de gestion documental: decidir entre buscar un documento, enviarlo por correo o crear uno nuevo a partir de la conversacion y del menu de funciones disponible.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Test | Filas | Precision (accuracy) |
|---|---:|---:|
| When2Call (benchmark publico de function calling, preguntas y herramientas del Berkeley Function Calling Leaderboard) | 3.646 | 71,6% |
| Test interno (generador) | 2.000 | 98,2% |
| Segundo test interno de casos no vistos (generador) | 2.000 | 96,7% |

Calibracion de la funcion `tool`:

| Funcion | Umbral | Precision | Cobertura | Filas de calibracion |
|---|---:|---:|---:|---:|
| `tool` | 0,413 | 98,5% | 100,0% | 2.000 |

Nota: la precision se define como la proporcion de filas cuyo resultado principal fue correcto. Los tests marcados como "generator" proceden del mismo generador que los datos de entrenamiento y, segun el propio autor, miden menos que un test publico o real. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre un modelo base de aproximadamente 0,8B de parametros, la huella es reducida y cabe en GPUs de consumo, aunque el autor no publica cifras.
- GPU recomendadas: no disponible; por tamano del modelo base, cualquier GPU consumer reciente (por ejemplo, RTX 3060 en adelante) deberia ser suficiente, pero no hay datos oficiales.
- Cabe en GPU consumer: si, segun el tamano del modelo base (0,8B) y el peso del adaptador (0,1 GB), aunque no se documentan requisitos oficiales.
- Opciones de despliegue: SDK de Python `jeff` con el motor de Jeff (`jeff.Jeff.local(["tool-route"])`), que descarga el adaptador y el modelo base desde Hugging Face la primera vez; segun el autor, los paquetes aun no estan en PyPI y deben instalarse desde `github.com/firelex/jeff`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El adaptador es un decision-model especializado en enrutado de herramientas sobre un modelo base de 0,8B, una categoria poco cubierta por modelos publicos con benchmarks comparables. Alternativas genericas de function calling (por ejemplo, modelos instruct de proposito general con soporte de tool calling) no se detallan aqui por falta de datos verificables en la informacion disponible.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jeff-adapter-tool-route | no disponible (base ~0,8B) | no disponible | Clasificacion calibrada sobre menu de herramientas | Apache 2.0 | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles (`en`); no se documenta soporte multilingue.
- No genera argumentos de llamada: si el pipeline necesita construir la llamada completa, requiere una etapa adicional.
- El adaptador solo carga sobre `mstrasser/jeff-base` en la revision `v1.4`; el motor rechaza adaptadores entrenados sobre otra base, lo que limita la portabilidad.
- Los tests internos (98,2% y 96,7%) proceden del mismo generador que los datos de entrenamiento y, segun el autor, miden menos que un benchmark publico; el resultado en el benchmark publico When2Call es del 71,6%, muy inferior.
- La calibracion publicada (precision 98,5% con cobertura 100%) corresponde a un conjunto de calibracion de 2.000 filas; no hay garantias de que se mantenga en dominios distintos.
- Riesgo de alucinacion: al ser un clasificador, el riesgo se traslada a seleccionar una herramienta incorrecta o a decidir `none`/`ask_user` de forma erronea; no hay datos publicados sobre tasas de error por tipo.
- Ecosistema inmaduro: 0 descargas y 0 likes en Hugging Face, paquetes no publicados en PyPI en el momento de la ficha y dependencia de un SDK y motor propios (`firelex/jeff`).
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y sus dependencias deben verificarse por separado.
- No se documentan sesgos conocidos, longitud de contexto ni tipos de cuantizacion; conviene validar el comportamiento en el dominio concreto antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-tool-route
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Pagina de catalogo: https://jeffhub.ai/catalogue/jeff.agents.tool-route
- Codigo, servidor y SDKs: https://github.com/firelex/jeff
- Guia de instalacion del SDK: https://jeffhub.ai/docs/sdk/install
- Berkeley Function Calling Leaderboard (origen de las preguntas y herramientas de When2Call): no disponible en la informacion proporcionada
