# HybridRMD/Ternary-Bonsai-2-27B-Heretic-Satellite

## Resumen

Ternary-Bonsai-2-27B-Heretic-Satellite es una variante ("Satellite") del modelo HybridRMD/Ternary-Bonsai-2-27B-Heretic, un transformer denso de la familia Qwen3.5 con 26.895.998.464 de parametros (~26,9 B). Lo desarrolla el usuario HybridRMD y su proposito no es ser un asistente general, sino actuar como un decisor explicito de compactacion de contexto: ante una transcripcion de conversacion, el modelo emite primero un bloque JSON con la decision de compactar y despues responde con normalidad. Es, por tanto, una especializacion de un solo comportamiento sobre un modelo base ya existente.

La tecnica empleada es destilacion de decisiones mediante LoRA: se entreno un adaptador LoRA r=16 sobre el modelo base para imitar la politica de compactacion de laya (convaiinnovations/laya), de modo que el modelo aprenda a juzgar la redundancia de una transcripcion y a declarar su decision antes de contestar. El resultado se publica en formato GGUF con dos cuantizaciones (Q4_K_M y Q8_0) listas para desplegar con llama.cpp.

Su relevancia es acotada pero concreta: cubre el problema de la gestion de memoria en agentes conversacionales de largo recorrido, donde decidir cuando resumir o descartar contexto es tan importante como generar la respuesta. El modelo es solo texto, no tiene encoder de vision, y su comportamiento especializado unicamente se activa en peticiones con formato de transcripcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido Qwen3.5 (etiqueta `qwen3_5`), sin encoder de vision |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (longitud maxima de entrenamiento documentada: 1536 tokens) |
| Tipos de cuantizacion | Q4_K_M (~4,9 bpw) y Q8_0 (~8,5 bpw); GGUF F16 intermedio para fusion y validacion |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF (`Ternary-Bonsai-2-27B-Heretic-Satellite-Q4_K_M.gguf` y `-Q8_0.gguf`); safetensors fp16 text-keyed de 851 tensores (50,1 GiB) en la etapa intermedia |
| Tamano del repositorio | 16,5 GB |
| Pipeline | text-generation |
| Libreria | gguf |

## Arquitectura y entrenamiento

El modelo parte de HybridRMD/Ternary-Bonsai-2-27B-Heretic, descrito por el autor como un "dense-merge heretic" de la familia Qwen3.5. La cadena de construccion documentada es: se dequantizo el GGUF Q8_0 publicado del modelo base a safetensors fp16 text-keyed (851 tensores, 50,1 GiB); sobre esos pesos se entreno un LoRA de rango 16 y alpha 32 aplicado a los modulos `in_proj_qkv`, `q`, `k`, `v`, `o` y `out_proj`; el entrenamiento duro 3 epocas y 129 pasos con perdida restringida a la cola (`tail-only loss`), LR 5e-5 y MAX_LEN 1536, sobre 86 ventanas etiquetadas por laya; finalmente el adaptador se fusiono en los pesos (merge denso real, verificado: los modulos objetivo cambian y los no objetivo difieren solo por redondeo bf16, con un maximo de 4,9e-4) y se genero un GGUF F16 del que derivan las cuantizaciones Q4_K_M y Q8_0.

La innovacion tecnica es la destilacion de decisiones: en lugar de entrenar al modelo para resumir, se le entrena para emitir un juicio estructurado de compactacion (`should_compact`, `preserve`, `level`, `mode`) antes de cualquier respuesta. El diseno del corpus es deliberado: la longitud de la ventana no determina la etiqueta, y las etiquetas estan mezcladas dentro de cada banda de longitud, porque un clasificador basado solo en longitud obtendria un 77,9 % en ese conjunto (99,6 % en una version ingenua). Existe un antecedente en el que el modelo degenero a responder siempre la misma decision porque la longitud predecia la etiqueta.

Una salvedad honesta declarada por el autor: la base de entrenamiento se reconstruyo dequantizando el GGUF Q8_0 publicado porque la base fp16 original se perdio con la maquina que la albergaba. Q8_0 esta en torno a 8,5 bpw y es casi sin perdida, pero no es bit-exacta, por lo que la base arrastra cierto ruido de cuantizacion. La reconstruccion se valido contra el GGUF fuente con 5/5 de coincidencia top-1 en el siguiente token y un delta maximo de |logprob| de 0,135 en los candidatos de cola.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo base.
- Emision de un bloque de decision JSON estricto como primer contenido de la respuesta, seguido del marcador literal `---decision-end---` y de la respuesta normal.
- Campos del bloque de decision: `should_compact` (`yes` / `no`), `preserve` (`code`, `numbers`, `decisions`, `recency`, `nothing`), `level` (0 ligero, 1 moderado, 2 agresivo) y `mode` (`narrative`, `extractive`, `by_topic`).
- Juicio de redundancia, no de longitud: una transcripcion corta pero repetitiva puede recibir `yes`, y una larga pero densa en informacion puede recibir `no`.
- Activacion del comportamiento especializado solo en peticiones con formato de transcripcion: un mensaje de sistema mas un turno de usuario que contenga `[conversation]` y la transcripcion.
- Ante una peticion directa que no sea una transcripcion, el modelo no emite bloque de decision y responde como el asistente heretic subyacente.
- Modelo exclusivamente de texto: sin vision, sin audio, sin capacidades multimodales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad propia; el modelo esta pensado como componente de decision dentro de un bucle de agente.
- Capacidades multilingues: no disponibles.
- Modo "thinking": el autor advierte que debe desactivarse (`enable_thinking=False`) al construir el prompt, porque con el valor por defecto de Qwen3.5 el modelo razona primero y no llega a emitir el bloque a tiempo.

## Casos de uso

- Compactacion de contexto en agentes conversacionales: el modelo se inserta antes de la llamada principal al LLM para decidir si conviene compactar el historial. Su salida `should_compact` y `mode` permite disparar una estrategia de resumen concreta sin depender de un umbral fijo de tokens.
- Gestion de memoria en asistentes multi-turno de larga duracion: al indicar `preserve`, el sistema sabe que debe conservar literalmente (codigo, numeros, decisiones o los turnos mas recientes) y que puede descartar sin perdida funcional.
- Preservacion de codigo en sesiones tecnicas: cuando `preserve` vale `code`, el pipeline de compactacion puede aplicar un resumen extractivo que mantenga los fragmentos de codigo intactos y comprima solo la prosa circundante.
- Resumen extractivo de transcripciones redundantes: con `mode` en `extractive` (63 de 86 casos del corpus de entrenamiento), el modelo senala que la compactacion debe eliminar repeticiones literales en lugar de reescribir el contenido.
- Enrutado dentro de sistemas multi-agente: un orquestador puede usar la decision como senal barata para decidir si lanza un subagente de resumen, si continua con el contexto actual o si pasa a una fase de consolidacion.
- Filtro previo a llamadas costosas: dado que el modelo se ejecuta en GGUF con llama.cpp y ocupa 15,4 GiB en Q4_K_M, puede desplegarse como paso de bajo coste que evita enviar contextos inflados a un modelo mayor y mas caro.
- Agrupacion tematica de historiales largos: con `mode` en `by_topic` (17 de 86 casos), la salida sugiere compactar agrupando por temas, util para reconstruir el estado de una sesion de soporte tecnico.
- Evaluacion y auditoria de politicas de compactacion: al comparar sus decisiones con las de laya sobre el mismo corpus, sirve para medir la calidad de una politica antes de integrarla en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. El unico rendimiento medido es una evaluacion interna sobre 9 ventanas retenidas de sesiones usadas en entrenamiento, decodificadas de forma greedy con `llama-server` sobre el modelo fusionado en F16:

| Comprobacion | Resultado |
|---|---|
| El bloque de decision es lo primero que se emite | 9/9 |
| Respuestas distintas (sin colapso a respuesta constante) | 9 distintas, 0 duplicadas |
| `should_compact` coincide con laya | 8/9 |

La unica discrepancia se produjo en una ventana de 90 palabras en la que laya dijo `yes` y el modelo dijo `no`.

Estadisticas del corpus de entrenamiento (86 pares de decision, 6 sesiones en una sola maquina), relevantes para calibrar expectativas:

| Campo | Distribucion |
|---|---|
| `should_compact` | `yes` 50 / `no` 36 |
| `preserve` | `nothing` 43, `code` 21, `recency` 19, `decisions` 3 |
| `level` | 1 -> 82, 2 -> 4 |
| `mode` | `extractive` 63, `by_topic` 17, `narrative` 6 |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 15,4 GiB (16.547.400.096 bytes), por lo que se necesitan aproximadamente 16-18 GB de VRAM contando el contexto en KV cache. El fichero Q8_0 ocupa 26,6 GiB (28.595.763.616 bytes), lo que exige del orden de 28-30 GB de VRAM.
- GPU recomendadas para Q4_K_M: RTX 4090 (24 GB), RTX 3090 (24 GB), L40S (48 GB) o A100 40 GB. Para Q8_0: A100 40 GB, A100 80 GB, H100 o L40S 48 GB.
- Compatibilidad con GPU de consumo: el Q4_K_M cabe en tarjetas consumer de 24 GB (RTX 3090, RTX 4090) e incluso en algunas de 16 GB con contexto reducido. El Q8_0 no cabe en una unica GPU consumer de 24 GB sin offload a CPU o sin repartir entre dos tarjetas.
- Opciones de despliegue: el autor valido el modelo con `llama-server` (llama.cpp), que es la via de referencia para GGUF. Tambien es compatible con Ollama, LM Studio y otros runners de llama.cpp. La model card incluye la etiqueta `endpoints_compatible`. El uso con `transformers` esta documentado para la tokenizacion y la construccion del prompt (`apply_chat_template` con `add_generation_prompt=True` y `enable_thinking=False`).
- Latencia y throughput estimados: no disponibles. Solo se documenta que las 9 ventanas de evaluacion se decodificaron de forma greedy.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo padre. No se documentan cifras de alternativas externas de la misma categoria.

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-Heretic-Satellite | ~26,9 B (denso) | no disponible | Emite bloque de decision de compactacion y despues responde | other | GGUF Q4_K_M y Q8_0 en HuggingFace |
| Ternary-Bonsai-2-27B-Heretic (padre) | ~26,9 B (denso) | no disponible | Asistente heretic; no emite bloque de decision | other | GGUF Q8_0 publicado |
| Alternativas externas de compactacion o decision de contexto | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia practica entre el padre y esta variante es que la Satellite anade un comportamiento especifico aprendido por destilacion de decisiones, con un coste de licencia y de pesos practicamente identico (misma base, mismo tamano de parametros).

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido: 86 pares de decision procedentes de 6 sesiones grabadas en una sola maquina, un volumen que limita la generalizacion a otros dominios, idiomas y estilos de conversacion.
- `level` es practicamente constante en 1 (82 de 86 filas) porque las puntuaciones de laya se situan cerca de 1. No debe usarse ese campo para discriminar.
- `mode` esta sesgado hacia `extractive` (63 de 86 casos), por lo que las categorias `by_topic` y `narrative` estan infrarrepresentadas (17 y 6 casos respectivamente).
- `preserve` esta dominado por `nothing` (43 casos) y `decisions` apenas aparece 3 veces, de modo que la preservacion de decisiones apenas esta cubierta.
- El bloque de decision solo se emite en peticiones con formato de transcripcion (mensaje de sistema mas turno de usuario con `[conversation]`). En peticiones directas el modelo no emite bloque: es el comportamiento esperado segun los datos de entrenamiento, no un fallo, pero implica que no toda respuesta comienza con una decision.
- El comportamiento de rechazo se hereda del modelo base heretic y no se ha vuelto a caracterizar para esta version. Un rechazo sustituye la respuesta completa, de modo que una peticion rechazada no produce bloque de decision.
- Ruido de cuantizacion en la base: el entrenamiento se hizo sobre una base reconstruida por dequantizacion del GGUF Q8_0, no sobre los pesos fp16 originales. Es casi sin perdida, pero no bit-exacta.
- Riesgo de alucinacion: no se documenta una evaluacion especifica; se hereda el riesgo del modelo base y no se ha medido en esta variante.
- Idiomas soportados: no disponibles. El corpus de entrenamiento esta en ingles, lo que hace previsible un rendimiento peor en castellano para la tarea de decision.
- Licencia `other`: no se detallan los terminos. Es imprescindible revisar las condiciones exactas antes de cualquier uso comercial, asi como las del modelo base.
- Ausencia de benchmarks estandar: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no es posible comparar su calidad general con otros modelos de 27 B.
- Requisito de prompt no obvio: si no se desactiva el modo thinking (`enable_thinking=False`), el modelo razona primero y no llega a emitir el bloque de decision. En produccion esto puede manifestarse como un fallo silencioso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HybridRMD/Ternary-Bonsai-2-27B-Heretic-Satellite
- Modelo base: https://huggingface.co/HybridRMD/Ternary-Bonsai-2-27B-Heretic
- Politica de compactacion laya: https://huggingface.co/convaiinnovations/laya
