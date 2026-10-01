# kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v4

text\n<tool_call>name<arg_key>k</arg_key><arg_value>v</arg_value></tool_call></s>
- Tools go in system message as text in GLM format (# Tools … <tools>{json per line}</tools> …), produced by glm_tools.py
- Reasoning optional and short, empty reply is just </s>
- alice_frame=False when runtime adds [_S_] and <SPAN#0> itself (vLLM plugin)

Files referenced:
- finetune_chat_lora.py
- placeholder_ids.json
- pi_flows.py
- chat_template.jinja
- glm_tools.py

Earlier versions: v3, v2, v1

Merged bf16 weights: kaivoss/AliceAI-T5-35B-A0.6B-chat-v4

The README got cut off at "from transformers i". So I don't have the full Use section.

Now I need to be careful about not inventing data. Let me note what's not available:
- Context length: not stated explicitly. Actually let me think - the base model is UL2, no context length given.
- Quantization types: not available (it's a LoRA adapter)
- Parameters total: 35B (from the model name)
- Active parameters: 0.6B

Let me note the benchmark-like data:
- v4: 90% of 103 probes greedy, 80% sampled at T=0.6
- After-tool probes: 22/23
- Held-out real turns right-kind-of-reply rate: 83%
- Greetings: 24/24 (v3)
- v2: 61% behaviour probes; base: 11%
- v3: 88% probes, after-tool probes 4/10

These aren't standard benchmarks like MMLU, HumanEval, GSM8K. They're custom behaviour probes. I should present them as such, not as standard benchmarks.

Let me now write the ficha.

Note: The current date seems to be 2026 based on the model creation date. Interesting.

Let me write it carefully in Castilian Spanish.

For the specs table:

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder con MoE disperso (DL, marco) |
| Parametros totales | 35B |
| Parametros activos | 0.6B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador LoRA; pesos fusionados en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Wait, the header says "encoder-decoder, mixture-of-experts, ul2". UL2 is a framework (Unified Language Learning). So the architecture would be "encoder-decoder MoE bajo el marco UL2".

Let me write the whole thing.

For benchmarks, I'll present the custom probe results in a table.

For hardware requirements - this is a 35B MoE with 0.6B active. LoRA adapter only. Let me estimate:
- The adapter itself is tiny (rank 16). Repo size 0.0 GB.
- The base model is 35B params - in bf16 that's ~70GB. In 4-bit ~17.5GB. 
- Active params 0.6B means inference is fast like a 0.6B model.

I need to be careful not to invent too much. I'll base estimates on the parameter count and note they're estimates.

Let me write VRAM estimates:
- bf16/fp16: ~70 GB (35B × 2 bytes)
- 8-bit: ~35 GB
- 4-bit: ~17.5 GB

GPUs: A100 80GB, H100 80GB for full precision; consumer RTX 4090 24GB for 4-bit quantization.

Actually since active params are 0.6B, inference compute is low, but memory for full weights still needs to fit.

Deployment options: transformers + PEFT (as shown), vLLM (they mention a vLLM plugin), possibly llama.cpp/Ollama would need GGUF conversion (not mentioned).

I should note that llama.cpp/Ollama are not mentioned in the info.

Let me include a note about the vLLM plugin since it's mentioned.

For the comparative table - I don't have clear comparable models. I could mention the base model. Let me use the base and perhaps other chat LoRAs. Actually, since I must not invent, I'll compare with the base model and previous versions, and note "no disponible" for external comparables.

Let me write the whole ficha.

Actually, for comparatives, I can mention the base model yandex/AliceAI-T5-35B-A0.6B and previous versions v1-v3. Let me do a table.

Let me write it out.

For the enlaces:
- HuggingFace: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v4
- Base model: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Merged weights: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-v4
- v3: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v3
- v2: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2
- v1: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora
- arXiv: 2602.09003 → https://arxiv.org/abs/2602.09003
- Datasets: 
  - https://huggingface.co/datasets/kaivoss/UltraData-SFT-Agent-2609-GLM53-20k
  - https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
  - https://huggingface.co/datasets/HuggingFaceTB/smoltalk

Note about the arXiv reference: 2602.09003 - this seems odd but I'll include as-is.

Let me write it now. Keep titles with only first word capitalized.

Let me be careful with the "Dos o tres parrafos (6-10 lineas total)" for the summary.

OK writing now.

For capacidades - what does the model do:
- Chat conversation
- Tool calling / function calling
- Decides when to use tools vs answer in text
- Says nothing (empty reply </s>) when nothing to say
- Reasoning in <think> tags, optional, short
- English only
- pi-style agentic flows (read, bash, edit, write tools)
- Multi-step flows

For casos de uso - at least 6 concrete:
1. Agente de codificacion (pi harness)
2. Function calling
3. Chat
4. Negation handling
5. Silence handling
6. Multi-step agent
7. Tool orchestration

Let me write concrete ones.

Now let me write the final ficha.## Resumen

AliceAI-T5-35B-A0.6B-chat-lora-v4 es un adaptador LoRA (rango 16, alpha 16) publicado por el usuario kaivoss sobre el modelo base yandex/AliceAI-T5-35B-A0.6B, un encoder-decoder con mezcla de expertos dispersa (MoE) de 35B parametros totales y 0.6B activos, enmarcado en la formulacion UL2 y sin formato de chat nativo. El adaptador ensena al modelo a conversar, a invocar herramientas cuando la tarea las requiere, a responder en texto cuando no las necesita y a permanecer en silencio cuando no hay nada que decir. Es la cuarta iteracion de una serie (v1 a v4) centrada en corregir fallos de comportamiento en entornos de agente, en particular la repeticion de llamadas a herramientas tras recibir un resultado.

El problema que aborda es concreto: el modelo base no dispone de plantilla de chat ni de tokens entrenados para delimitar roles, de modo que el autor define una plantilla sobre el marco UL2 y produce datos especificos para ensenar el comportamiento de agente. La version 4 esta etiquetada explicitamente por el autor como "no todavia robusta": corrige el fallo objetivo (repetir la llamada tras un resultado de herramienta, con 22/23 sondas superadas frente a 8/23 en v3) pero introduce regresiones (preguntas generales que disparan lecturas de fichero inutiles y negaciones ignoradas en 3 de 8 sondas). No alcanzo el umbral fijado antes de la ejecucion, por lo que no se escalo a un entrenamiento mayor.

Su relevancia actual reside en dos aspectos: primero, documenta con detalle un patron de fallo habitual al adaptar modelos base sin formato de chat (el uso de tokens de rol no entrenados que actuan como marcadores vacios) y como detectarlo; segundo, muestra un caso de ingenieria de datos iterativa sobre un MoE encoder-decoder poco convencional, con herramientas de llamada en formato GLM y un plugin de vLLM para integrar el marco UL2 en el runtime. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder con mezcla de expertos dispersa (MoE), marco UL2 |
| Parametros totales | 35B |
| Parametros activos | 0.6B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador LoRA; pesos fusionados disponibles en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT; pesos fusionados en bf16 en repo separado) |
| Tipo de adaptador | LoRA, rango 16, alpha 16 |
| Modelo base | yandex/AliceAI-T5-35B-A0.6B |
| Libreria | peft |
| Tamano del repositorio | 0.0 GB (solo adaptador) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder con mezcla de expertos dispersa: 35B parametros totales con 0.6B activos por token, lo que reduce el coste computacional de inferencia al nivel de un modelo denso de aproximadamente 0.6B manteniendo la capacidad de almacenamiento de 35B. El autor enmarca el modelo dentro de UL2 y la plantilla de chat se define explicitamente en ese marco: en el encoder se concatenan los turnos con marcadores de texto plano (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|tool|>`) precedidos de `[_S_]` y con ` <SPAN#0>` como ultimo token del encoder; el decoder arranca con `<s><SPAN#0>` y genera razonamiento opcional entre `<think>` y `</think>`, seguido de texto o de una llamada a herramienta con el formato `<tool_call>name<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>` y terminacion en `</s>`. Las herramientas se insertan en el mensaje de sistema como texto en formato GLM (`# Tools … <tools>{json por linea}</tools> …`), generado por el script `glm_tools.py`.

El adaptador se entreno exclusivamente sobre datos SFT en ingles (los datasets declarados son kaivoss/UltraData-SFT-Agent-2609-GLM53-20k, openbmb/UltraData-SFT-2605 y HuggingFaceTB/smoltalk). La card no menciona RLHF ni DPO. La evolucion entre versiones es enteramente de datos, salvo el cambio de formato entre v1 y v2. En v1 el fallo medido fue el uso de tokens de vocabulario (`[INST_START]`, `[REPLY_END]`, `[SYSTEM_*]`, `[TOOL_RESULT_*]`) cuyos embeddings en el modelo base son marcadores vacios no entrenados (identicos al token no usado `<SPAN#5000>`); el fichero `placeholder_ids.json` lista los 5.832 tokens afectados. La v2 sustituyo esos tokens por marcadores de rol en texto plano y `</s>`, y anadio chat comun a los datos. La v3 amplio saludos, conversacion trivial e instrucciones de "no usar herramientas", limito el razonamiento a 600 tokens (opcional) e introdujo el silencio tras agradecimientos, con lo que alcanzo el 88% de las sondas. La v4 reintroduce, en lugar de generar, trayectorias reales con las herramientas de General-Agent (`read`, `exec`, `edit`, `write`), que mapean aproximadamente al 85% con las de `pi` (`read`, `bash`, `edit`, `write`), recortando cada trayectoria antes de la primera llamada no mapeable, desenvuelve los resultados `{"result": ...}`, parsea argumentos de `edit` e inyecta el prompt de sistema y los esquemas de herramientas de `pi`. Ademas anade flujos `pi` plantillados (`pi_flows.py`): leer valores, listas, notas o codigo, `ls`, `cat`, `wc -l`, escritura, edicion en dos pasos y comparacion de dos ficheros, con resultados y respuestas finales deterministas.

## Capacidades

- Generacion de texto conversacional en ingles con multiples turnos.
- Llamada a herramientas (tool calling / function calling) con deteccion de cuando es necesaria.
- Decision explicita entre responder en texto y ejecutar una herramienta, incluida la capacidad de emitir una respuesta vacia (`</s>`) cuando no hay nada que aportar.
- Razonamiento breve y opcional dentro de etiquetas `<think>`, acotado a unos 600 tokens en los datos de entrenamiento.
- Ejecucion de flujos de agente multi-paso con herramientas de tipo `pi` (`read`, `bash`, `edit`, `write`), incluida la segunda llamada de un flujo que debe diferir de la primera.
- Emision de llamadas en formato `<tool_call>` con pares clave-valor (`<arg_key>`, `<arg_value>`).
- Comprension de mensajes de sistema con definiciones de herramientas en formato GLM.
- Multilingue: no, unicamente ingles segun los metadatos.

## Casos de uso

- Agente de codificacion sobre el arnes `pi`: el adaptador esta entrenado especificamente para el prompt de sistema y los esquemas de herramientas de `pi`, de modo que puede leer ficheros, ejecutar comandos, editar y escribir, y cerrar la tarea con una respuesta final de texto en lugar de repetir la ultima llamada.
- Orquestacion de function calling en produccion: el modelo emite llamadas estructuradas en `<tool_call>` con argumentos tipados clave-valor y decide cuando conviene responder directamente, lo que permite integrarlo en pipelines de automatizacion que necesitan un router de herramientas.
- Automatizacion de tareas de mantenimiento de repositorios: flujos como leer un fichero, listar un directorio (`ls`), contar lineas (`wc -l`), escribir y editar en dos pasos estan cubiertos por datos plantillados, lo que lo hace adecuado para bots de refactorizacion sencilla.
- Comparacion y verificacion de ficheros: el flujo de comparar dos ficheros con resultados deterministas permite usar el modelo como verificador de diferencias antes de aplicar un cambio.
- Asistente conversacional con supresion de ruido: en contextos donde el silencio es preferible (agradecimientos, mensajes sin accion posible), el modelo puede devolver una respuesta vacia, util para reducir notificaciones espurias en agentes de chat.
- Deteccion de intencion para herramientas: el modelo distingue entre peticiones que requieren accion y peticiones que solo requieren texto, lo que permite usarlo como capa de enrutado previa a un sistema mayor.
- Investigacion sobre adaptacion de modelos base sin formato de chat: por la documentacion del fallo de los tokens placeholder y de la metodologia por sondas, sirve como referencia para reproducir el diagnostico en otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor reporta unicamente resultados sobre un conjunto propio de sondas de comportamiento y sobre turnos retenidos, que se recogen aqui tal cual:

| Metrica | v4 | v3 | Base |
|---|---|---|---|
| Sondas superadas (greedy) | 90% (de 103) | 80% | no disponible |
| Sondas superadas (muestreo, T=0.6) | 80% | no disponible | no disponible |
| Sondas tras resultado de herramienta | 22/23 | 8/23 | no disponible |
| Tasa de respuesta correcta en turnos reales retenidos | 83% | 91% | no disponible |
| Turnos de llamada respondidos en texto | 7 de 38 | no disponible | no disponible |
| Sondas superadas (v2) | no disponible | no disponible | 61% (base: 11%) |
| Saludos correctos (v3) | no disponible | 24/24 | no disponible |

El autor indica que v4 no alcanzo el umbral fijado antes de la ejecucion (sondas muestreadas >= 90%, precision de decision en turnos retenidos >= 88%, sin fugas de marcadores de turno), por lo que no se escalo el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache de atencion): aproximadamente 70 GB en bf16/fp16 (35B x 2 bytes), 35 GB en 8 bits y 17,5 GB en 4 bits. Estas cifras son estimaciones derivadas del recuento de parametros, no datos aportados por el autor.
- El coste computacional por token corresponde a un modelo con 0.6B parametros activos, por lo que la latencia esperada es la de un modelo denso de ese orden, condicionada por el ancho de banda de memoria necesario para cargar los pesos de los expertos.
- GPU recomendadas: A100 80 GB o H100 80 GB para pesos en bf16; una RTX 4090 (24 GB) seria suficiente para cuantizacion de 4 bits si se dispone de una conversion compatible.
- Opciones de despliegue: transformers con PEFT (el adaptador se carga sobre el base), y vLLM mediante un plugin que el autor menciona y que se activa pasando `alice_frame=False` a `apply_chat_template` cuando el runtime ya inserta `[_S_]` y `<SPAN#0>`. No se mencionan en la informacion disponible soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han proporcionado modelos comparables de la misma categoria en la informacion disponible. La comparacion mas directa es con el propio modelo base y con las versiones anteriores del adaptador:

| Modelo | Parametros | Contexto | Sondas greedy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AliceAI-T5-35B-A0.6B-chat-lora-v4 | 35B (0.6B activos) | no disponible | 90% | apache-2.0 | adaptador LoRA |
| AliceAI-T5-35B-A0.6B-chat-lora-v3 | 35B (0.6B activos) | no disponible | 80% | apache-2.0 | adaptador LoRA |
| AliceAI-T5-35B-A0.6B-chat-lora-v2 | 35B (0.6B activos) | no disponible | 61% | apache-2.0 | adaptador LoRA |
| yandex/AliceAI-T5-35B-A0.6B (base, sin chat) | 35B (0.6B activos) | no disponible | 11% | no disponible en la informacion | pesos base |

No se dispone de datos para comparar con modelos densos de tamano equivalente ni con otros adaptadores de chat para el mismo base.

## Limitaciones y advertencias

- El propio autor clasifica la version 4 como "no todavia robusta": supera el 90% de las sondas en modo greedy pero solo el 80% con muestreo a T=0.6, lo que indica decisiones poco confiables.
- Regresiones conocidas frente a v3: una pregunta general bajo el prompt de `pi` dispara a veces una lectura de fichero innecesaria (2 de 4 en greedy); la instruccion "no usar herramientas" se ignora en 3 de 8 sondas de negacion.
- En turnos reales retenidos, la tasa de respuesta del tipo correcto bajo del 91% al 83%; 7 de 38 turnos que debian llamar a una herramienta se respondieron en texto.
- El unico idioma declarado es el ingles; no hay evidencia de capacidades multilingues.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar despliegues con ventanas largas.
- El modelo base carece de formato de chat nativo y de tokens de rol entrenados; cualquier uso fuera de la plantilla proporcionada (`chat_template.jinja`) o de los flujos cubiertos por los datos puede degradar el comportamiento.
- El repositorio no registra descargas ni interacciones, y no incluye una seccion completa de uso en la model card proporcionada (el fragmento termina en el bloque de codigo de ejemplo), por lo que no se documenta aqui un procedimiento de inferencia verificado.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es inherente a un modelo de generacion de texto y no se han publicado evaluaciones de factualidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base subyacente tiene su propia licencia, que no se detalla en la informacion disponible y debe verificarse antes de un despliegue en produccion.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v4
- Modelo base: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Pesos fusionados en bf16: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-v4
- Version v3: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v3
- Version v2: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2
- Version v1: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora
- Dataset kaivoss/UltraData-SFT-Agent-2609-GLM53-20k: https://huggingface.co/datasets/kaivoss/UltraData-SFT-Agent-2609-GLM53-20k
- Dataset openbmb/UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Dataset HuggingFaceTB/smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Referencia arXiv: https://arxiv.org/abs/2602.09003
