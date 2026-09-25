# damianborek/polaris-2

## Resumen

Polaris 2 es un adaptador LoRA de tipo clasificador, desarrollado por el usuario damianborek, que se monta sobre el modelo base bespokelabs/Bespoke-Nimble-9B (a su vez construido sobre Qwen3.5-9B). No es un modelo generativo: no produce texto libre, sino que devuelve una probabilidad para cada una de las etiquetas permitidas de una tarea de decision cerrada. Su proposito es actuar como "modelo conductor" (conductor) de agentes autonomos de programacion, decidiendo el siguiente paso en la orquestacion de tareas.

El adaptador cubre dos pistas independientes, con una unica pregunta por peticion: la pista `decision` decide que debe hacer el conductor con una lane (`STOP`, `ASK`, `DISPATCH`) y la pista `manager` decide que debe ocurrir con la evidencia devuelta (`ACCEPT`, `VERIFY`, `REJECT`, `REOPEN`, `ESCALATE`). Sustituye a Polaris 1 y, segun la model card, mejora su precision del 59 % (57/96) al 72 % (69/96) sobre 96 paquetes reales de orquestador de la version v9, acertando ademas todos los paquetes de las versiones v5 a v8.

Su relevancia actual es acotada pero concreta: propone un patron de "modelo de decision" especializado y de bajo coste (adaptador de 0,2 GB sobre un base de 9B) en lugar de usar un LLM generativo generalista para decidir el flujo de un agente. La contrapartida, advertida por el propio autor, es que la confianza del modelo no esta calibrada sobre paquetes reales: cinco de los errores de v9 son decisiones peligrosas (un `ACCEPT` o un `DISPATCH` incorrectos) con confianza igual o superior a 0,99, por lo que el umbral de actuacion de 0,8 no los filtra.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso de tipo decoder; el adaptador funciona como clasificador de etiquetas, no como generador |
| Parametros totales | Aproximadamente 9 000 millones en el modelo base (Bespoke-Nimble-9B, derivado de Qwen3.5-9B); el recuento exacto no esta disponible. El adaptador ocupa 0,2 GB en el repositorio |
| Parametros activos | No aplica (no es MoE); no disponible el desglose de parametros del adaptador |
| Longitud de contexto | El ejemplo de configuracion del servidor fija `max_input_tokens` a 2048; la ventana nativa del modelo base no esta disponible |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye en safetensors y se carga en bf16). El autor advierte que fusionar el adaptador en bf16 altera las probabilidades |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 (adaptador). La licencia del modelo base debe verificarse por separado |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); el base se descarga desde bespokelabs/Bespoke-Nimble-9B en la revision `594dfdcfb6f94e3d0c0db7535180d3c71689169a` |

## Arquitectura y entrenamiento

El sistema no es un LLM autonomo: es un adaptador LoRA que se acopla sin fusionar a bespokelabs/Bespoke-Nimble-9B, un modelo base de unos 9 000 millones de parametros derivado de Qwen3.5-9B. La inferencia se realiza mediante el pipeline de Nimble (`nimble.scoring.parallel_schema.prepare_prompts` y `nimble.training.schema_train.candidate_logits`): Nimble construye el prompt, puntua los tokens de respuesta candidatos y el adaptador devuelve una probabilidad por cada etiqueta permitida. La convencion de llamada es estricta y replica la del entrenamiento: una sola pregunta por peticion con id de campo `label`, estado `{"packet": <texto del paquete>}` y descripciones de campo y de opciones copiadas literalmente de `conductor-questions.json` (`instructions` y `criteria` de la pista correspondiente).

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; al tratarse de un clasificador de etiquetas con logits candidatos, el ajuste parece plantearse como una tarea de puntuacion supervisada mas que como alineamiento generativo. La innovacion destacable es el propio patron de diseno: separar la decision de orquestacion en dos pistas con vocabularios de etiquetas cerrados (3 y 5 clases), delegar la puntuacion en el framework Nimble y dejar la generacion de texto al modelo principal del agente. El autor tambien documenta explicitamente que la fusion del adaptador en bf16 desplaza las probabilidades, de modo que la carga debe hacerse sin fusionar.

## Capacidades

- Clasificacion de decision en la pista `decision`: asigna una de tres etiquetas (`STOP`, `ASK`, `DISPATCH`) indicando que debe hacer el conductor con una lane.
- Clasificacion de gestion en la pista `manager`: asigna una de cinco etiquetas (`ACCEPT`, `VERIFY`, `REJECT`, `REOPEN`, `ESCALATE`) sobre la evidencia devuelta para una lane.
- Salida de probabilidades por etiqueta, no solo la etiqueta ganadora, lo que permite aplicar umbrales de confianza en el cliente.
- Integracion con agentes de programacion autonomos mediante servidor local y plugins para Pi y Claude Code.
- Exposicion por HTTP crudo: una pregunta con id `label` y el estado con el paquete, aplicando el cliente su propio umbral.
- No genera texto: no tiene capacidad de redaccion, resumen, codigo, matematicas, vision ni audio.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso por parte del propio modelo; el multi-paso reside en el agente que lo invoca.
- Solo ingles.

## Casos de uso

- Orquestacion de agentes de programacion: el adaptador decide si el conductor debe parar, preguntar o despachar una lane, sustituyendo a una llamada a un LLM grande por una clasificacion de coste bajo sobre un paquete de estado.
- Control de calidad de evidencia en pipelines de agente: con la pista `manager` se etiqueta la evidencia devuelta como aceptable, verificable, rechazable, reabrible o escalable antes de que el agente continue.
- Puerta de seguridad en flujos autonomos: al devolver probabilidades por etiqueta, el cliente puede exigir un umbral (por ejemplo 0,8) y no actuar cuando no se alcanza, dejando la decision a un modelo mayor o a una persona.
- Enrutado de tareas en entornos de integracion continua: clasificar paquetes de estado procedentes de un orquestador para decidir si una tarea se despacha a un runner o se detiene por falta de informacion.
- Triaje con escalado a humano: la etiqueta `ESCALATE` permite derivar casos dudosos a revision manual dentro de un flujo con supervision.
- Uso como componente evaluado en investigacion sobre orquestacion de agentes: el par de pistas y su formato de paquete permiten reproducir la comparacion Polaris 1 frente a Polaris 2 sobre el mismo conjunto de paquetes.
- Despliegue local en estacion de trabajo con GPU: el servidor es un proceso Python en loopback sin autenticacion, adecuado para un entorno de desarrollo de un solo usuario.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Metrica | Polaris 2 | Polaris 1 |
|---|---|---|---|
| 96 paquetes reales de orquestador, version v9 | Aciertos | 72 % (69/96) | 59 % (57/96) |
| Paquetes de las versiones v5 a v8 | Aciertos | Todos correctos (recuento no disponible) | No disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte que, de los errores de v9, cinco son decisiones inseguras (un `ACCEPT` o un `DISPATCH` incorrectos) con confianza igual o superior a 0,99.

## Requisitos de hardware

- VRAM estimada: alrededor de 20 GB en bf16 segun el autor, para el modelo base de 9B mas el adaptador sin fusionar.
- GPU: se indica una GPU NVIDIA como requisito; no se enumeran modelos concretos.
- Ajuste en GPU de consumo: los 20 GB en bf16 encajan con dificultad en tarjetas de 24 GB como la RTX 4090, pero el dato exacto de consumo no esta confirmado en la informacion disponible.
- Dependencias: torch, transformers, peft y huggingface_hub, mas el codigo de Nimble (`nimble.scoring.parallel_schema`, `nimble.training.schema_train`).
- Despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo generativo, el despliegue previsto es el servidor propio `server/server.py` escuchando en `http://127.0.0.1:8765` (solo loopback, sin autenticacion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Etiquetas | Rendimiento (v9, 96 paquetes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| damianborek/polaris-2 | Adaptador LoRA clasificador sobre Bespoke-Nimble-9B | ~9B en el base; adaptador de 0,2 GB | 3 (`decision`) + 5 (`manager`) | 72 % (69/96) | Apache 2.0 (adaptador) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| damianborek/polaris-1 | Adaptador predecesor para el mismo tipo de tarea | No disponible | No disponible (preguntas distintas a las de Polaris 2) | 59 % (57/96) | No disponible | HuggingFace |
| damianborek/vega-1 | Modelo generativo anterior del mismo autor | No disponible | No aplica (generativo) | No disponible | No disponible | HuggingFace |

No se dispone de comparativas con alternativas externas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Confianza no calibrada sobre paquetes reales: cinco errores de v9 son decisiones inseguras con confianza mayor o igual a 0,99, por lo que el umbral de 0,8 no los detiene. El autor recomienda tratar `ACCEPT` como "verificar primero".
- No es generativo: solo emite etiquetas y probabilidades; cualquier tarea de redaccion, codigo o razonamiento debe recaer en otro modelo.
- Convencion de llamada estricta: una pregunta por peticion, id de campo `label`, estado `{"packet": ...}` y textos de `conductor-questions.json` copiados literalmente. Las preguntas difieren de las de Polaris 1, por lo que hay que usar el fichero de preguntas correspondiente a esta version.
- El adaptador no debe fusionarse: la fusion en bf16 desplaza las probabilidades respecto al entrenamiento.
- Dependencia de versiones concretas de los clientes: Pi (`pi-autonoxis-model` 0.4.0 o superior) y Claude Code (`autonoxis-model` 0.3.0 o superior); las versiones antiguas siguen ligadas a Polaris 1.
- Servidor local sin autenticacion, escuchando solo en loopback: no esta pensado para exposicion en red.
- Idiomas: unicamente ingles.
- Contexto de entrada limitado en el ejemplo de configuracion a 2048 tokens, inferior a las ventanas habituales de los modelos generativos, lo que restringe el tamano del paquete analizable.
- Riesgo de alucinacion acotado por diseno (no genera texto), pero riesgo de clasificacion erronea con alta confianza en decisiones de aceptacion o despacho.
- Licencia Apache 2.0 para el adaptador; conviene comprobar la licencia del modelo base Bespoke-Nimble-9B antes de un uso comercial, dato no disponible en la informacion recibida.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes) y validacion limitada a los conjuntos internos del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/damianborek/polaris-2
- Modelo predecesor Polaris 1: https://huggingface.co/damianborek/polaris-1
- Modelo generativo anterior Vega 1: https://huggingface.co/damianborek/vega-1
- Modelo base: https://huggingface.co/bespokelabs/Bespoke-Nimble-9B (revision `594dfdcfb6f94e3d0c0db7535180d3c71689169a`)
- Servidor y extension para Pi: https://github.com/damian87x/pi-autonoxis-model
- Servidor del adaptador: https://github.com/damian87x/pi-autonoxis-model/tree/main/server
- Plugin para Claude Code: https://github.com/damian87x/autonoxis-model
- Framework Nimble: https://github.com/bespokelabsai/nimble

Nota sobre la busqueda web: los resultados encontrados corresponden a proyectos homonimos sin relacion con este adaptador. "Polaris: A Safety-focused LLM Constellation Architecture for Healthcare" (https://arxiv.org/pdf/2403.13313), "Polaris 2.0" de Hippocratic AI (https://hippocraticai.com/polaris2/) y "Project Polaris" de Microsoft para GitHub Copilot (https://byteiota.com/github-copilot-project-polaris/, https://digitalmatters.me/artificial-intelligence-ai/project-polaris/) son sistemas distintos que comparten nombre y no deben confundirse con damianborek/polaris-2.
