# kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6

` block
- v6 is experimental, gate not fully passed
- Sampled probes 91.7%, held-out decisions 92.3%, greedy probes 88.7%
- Weak: neg_task 2/8 greedy, 5/8 sampled; first tool name on held-out turns 61.8%
- Merged model not published (teacher-forced loss 1.43 vs 1.65)
- Datasets: kaivoss/UltraData-SFT-Agent-2609-GLM53-20k, openbmb/UltraData-SFT-2605
- License apache-2.0
- Language en
- Tags: encoder-decoder, mixture-of-experts, ul2, lora, tool-use, function-calling, chat
- arXiv:2602.09003
- Region: us
- Downloads: 20, Likes: 0

Base model details from web search:
- 34-35B unique parameters
- 512 experts per MoE layer, top-8 routing
- 16-layer encoder, 12-layer decoder
- 135,040-token vocabulary
- 1,536-dimensional hidden... (cut off probably hidden dimension per expert?)

Wait, "1,536-dimensional hidden" - hmm. Let me be careful. Actually it could be expert hidden dimension.

Let me note what's available and what's not.

Parameters total: ~34.35B (35B)
Active: ~0.6B
Context length: no disponible (not stated)
Quantization types: no disponible (it's a LoRA adapter, bf16)
Languages: en
License: apache-2.0
Weight format: safetensors (PEFT adapter)

Architecture: encoder-decoder T5-style sparse MoE (UL2)

Let me write the ficha.

For benchmarks, the model card has some probe data:
- Sampled probes 91.7%
- Held-out decisions 92.3%
- Greedy probes 88.7%
- neg_task: 2/8 greedy, 5/8 sampled
- First tool name on held-out turns: 61.8%
- v5: 96% right-kind-of-reply on held-out real turns
- Base model: 11% probes

I should not invent numbers. Only use these.

Hardware requirements: 35B total, 0.6B active. So VRAM for the full weights ~70GB in bf16 (35B * 2 bytes = 70GB). But active is only 0.6B so compute is low. For LoRA adapter, need to load base model.

Let me be careful about the context length - not stated anywhere. Say "no disponible".

Now let me write the sheet in Castilian Spanish.

Let me be thorough and technical.

For the create date 2026-10-02 — that's odd but I'll just note it.

Let me write.## Resumen

AliceAI-T5-35B-A0.6B-chat-lora-v6 es un adaptador LoRA (rango 16, alpha 16) desarrollado por el usuario kaivoss sobre el modelo base yandex/AliceAI-T5-35B-A0.6B. Se trata de un modelo encoder-decoder de tipo T5 con arquitectura MoE dispersa (35B parámetros totales, ~0,6B activos por token) que, en su forma original, no dispone de formato de chat. Este adaptador le enseña a conversar, a invocar herramientas cuando la tarea lo requiere, a responder en texto cuando no las necesita y a permanecer en silencio cuando no hay nada que decir.

La innovación central de la versión 6 es una regla de formato estricta: toda respuesta no silenciosa comienza obligatoriamente con un bloque `<think>...</think>`. El constructor de datos rechaza cualquier objetivo de entrenamiento que no cumpla esta condición y vuelve a validar el fichero final. El razonamiento es real cuando la fuente lo aporta (datos de agente en los turnos de acción y finales de Code, General y Search, junto con el split IF-think de UltraData) y exacto cuando es plantillado (flujos, saludos, negaciones).

El modelo se publica en estado experimental y el propio autor indica que no ha superado por completo su umbral de calidad (gate). Los pesos fusionados (merged) no se publicaron porque su loss forzada por profesor difería de la del adaptador (1,43 frente a 1,65). Está entrenado exclusivamente en inglés y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque su naturaleza de adaptador exige cargar el modelo base de 35B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder T5-style con MoE dispersa (UL2); encoder de 16 capas, decoder de 12 capas, 512 expertos por capa MoE, enrutamiento top-8 por token |
| Parametros totales | ~34,35B (35B nominales) en el modelo base |
| Parametros activos | ~0,6B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion pero no se especifica en la informacion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el repositorio ocupa 0,0 GB |
| Vocabulario | 135.040 tokens (modelo base) |
| Rango/alpha LoRA | 16 / 16 |
| Fecha de creacion | 2026-10-02 |
| Descargas / likes | 20 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder al estilo T5 (familia UL2) con mezcla de expertos dispersa. Segun la informacion disponible, cuenta con 512 expertos por capa MoE y enrutamiento top-8 por token, un encoder de 16 capas, un decoder de 12 capas y un vocabulario de 135.040 tokens, lo que da un total de aproximadamente 34,35B parametros de los que solo ~0,6B se activan por token. Yandex describe este modelo como la columna vertebral de las respuestas de Alice AI en su motor de busqueda, con el objetivo de reducir los costes de inferencia. La innovacion arquitectonica clave es esta relacion entre capacidad total y computo activo: 35B de conocimiento con un coste de calculo por token comparable al de un modelo de 0,6B.

El adaptador v6 se entreno sobre dos conjuntos de datos: kaivoss/UltraData-SFT-Agent-2609-GLM53-20k y openbmb/UltraData-SFT-2605. La evolucion de las versiones anteriores (v1 a v5) documenta un proceso de depuracion centrado exclusivamente en los datos. La v1 fallo porque su formato de chat empleaba tokens de la propia base del vocabulario (`[INST_START]`, `[REPLY_END]`, `[SYSTEM_*]`, `[TOOL_RESULT_*]`) cuyos embeddings eran marcadores de posicion sin entrenar, identicos al token no usado `<SPAN#5000>`; el LoRA sobre atencion no puede reentrenar embeddings, de ahi que se listaran los 5.832 tokens marcador de posicion en `placeholder_ids.json`. La v2 paso a marcadores de rol en texto plano y `</s>` como fin de turno. Las versiones posteriores ajustaron la mezcla de datos (saludos, conversacion trivial, instrucciones de "no usar herramientas", turnos reales de respuesta tras resultado de herramienta, razonamiento limitado a 600 tokens y opcional, silencio ante agradecimientos). No se menciona en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat.
- Razonamiento explicito: toda respuesta no silenciosa genera primero un bloque `<think>...</think>`.
- Tool calling / function calling: invoca herramientas cuando la tarea las necesita.
- Respuesta en texto plano cuando la tarea no requiere herramientas.
- Capacidad de permanecer en silencio (no responder) cuando no hay nada que decir.
- Uso en entornos de agente: la version anterior (v5) se probo en el arnes `pi` y funciono correctamente en los prompts que habian roto la v1.
- Capacidades multilingues: solo ingles declarado; el modelo base no documenta otros idiomas en esta informacion.
- No se declaran capacidades de vision, audio ni otros modos.

## Casos de uso

- Agentes de codigo en terminal: el adaptador esta entrenado con trayectorias de agente reales (los datos de agente cubren Code, General y Search) y herramientas tipo `read`/`bash`/`edit`/`write`, por lo que encaja en asistentes que leen ficheros, ejecutan comandos y editan codigo paso a paso.
- Asistentes de atencion al cliente en ingles: gestiona conversaciones multi-turno con marcadores de rol en texto plano y sabe cuando responder en texto en lugar de invocar herramientas, evitando llamadas innecesarias a sistemas backend.
- Orquestacion de herramientas empresariales: el modelo decide entre responder directamente o invocar una funcion, lo que permite integrarlo en pipelines que consultan APIs, bases de datos o servicios internos segun la intencion del usuario.
- Sistemas de busqueda conversacional: dado que el modelo base es la columna vertebral de las respuestas de Alice en el buscador de Yandex, el adaptador puede emplearse para generar respuestas conversacionales sobre resultados de busqueda con coste de inferencia bajo (~0,6B activos).
- Modulos de razonamiento previo a accion: la regla de `<think>` obligatorio permite inspeccionar la traza de razonamiento antes de que el modelo ejecute una herramienta, util para depuracion y auditoria en produccion.
- Filtrado de silencio en canales conversacionales: la capacidad de no responder ante entradas sin contenido (por ejemplo un "gracias") reduce ruido en asistentes que no deben contestar a todo.
- Fine-tuning como punto de partida: al ser un adaptador LoRA de rango 16 sobre un base sin formato de chat, sirve como plantilla (el repositorio incluye `finetune_chat_lora.py`) para adaptar el modelo base a dominios o idiomas especificos.

## Benchmarks y rendimiento

Los datos disponibles son resultados de sondas de comportamiento del propio proceso de entrenamiento, no benchmarks estandar como MMLU o HumanEval, que no se han publicado en la informacion disponible.

| Metrica | v6 | Referencia |
|---|---|---|
| Sondas muestreadas (sampled) | 91,7% | Base: 11% (sondas v2) |
| Decisiones en turnos reservados (held-out) | 92,3% | - |
| Sondas greedy | 88,7% (no supera el umbral) | - |
| neg_task ("haz la tarea pero no uses herramientas"), greedy | 2/8 | - |
| neg_task ("haz la tarea pero no uses herramientas"), sampled | 5/8 | - |
| Primer nombre de herramienta en turnos reservados | 61,8% | - |
| Turnos reservados, tipo de respuesta correcto (v5) | - | 96% (v5) |

El autor senala que el "gate" no se ha superado completamente: las sondas greedy (88,7%) quedan por debajo del umbral. Las debilidades declaradas son la instruccion de "no usar herramientas" (neg_task) y la seleccion del primer nombre de herramienta en turnos reservados (61,8%). La v6 piensa siempre antes de responder (100% de las sondas y turnos reservados). El rendimiento greedy de la v4 fue de 83% en tipo de respuesta correcta en turnos reales reservados.

## Requisitos de hardware

- VRAM estimada para el modelo base en bf16: ~70 GB solo para los pesos (34,35B parametros x 2 bytes), mas el adaptador LoRA (despreciable por tamano).
- En cuantizacion de 8 bits: ~35 GB; en 4 bits: ~18-20 GB. Los tipos de cuantizacion concretos no estan documentados en la informacion disponible.
- GPU recomendadas: para bf16 sin cuantizar, GPU de 80 GB (A100 80GB, H100). Con cuantizacion 4 bits puede caber en una unica RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque la informacion disponible no confirma compatibilidad probada.
- Aunque el modelo cabe en GPU de consumo con cuantizacion, el coste de inferencia es bajo porque solo activa ~0,6B parametros por token; el cuello de botella es la memoria para almacenar los 35B pesos, no el computo.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con Hugging Face Transformers y aplicar el LoRA. No se confirma soporte especifico de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles. El diseno busca reducir costes de inferencia respecto a un modelo denso de 35B.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos comparativos con otros adaptadores LoRA o modelos MoE encoder-decoder de tamano equivalente. La comparacion con versiones anteriores del mismo adaptador es la unica disponible:

| Version | Estado | Sondas / held-out | Limitacion principal |
|---|---|---|---|
| v6 (esta) | Experimental, gate no superado | 91,7% sampled / 92,3% held-out / 88,7% greedy | neg_task y primer nombre de herramienta (61,8%) |
| v5 | Mejor version previa | 96% tipo de respuesta en held-out | Bucle de 13.221 tokens en una peticion de historia; fallos en "no usar herramientas" |
| v4 | Superada | 83% tipo de respuesta en held-out | Bajo-llamada de herramientas; lecturas de fichero inutiles |
| Base (yandex/AliceAI-T5-35B-A0.6B) | Sin chat | 11% en sondas (v2) | No tiene formato de chat ni tool calling |

Comparacion con alternativas de la misma categoria (otros MoE encoder-decoder de 35B): no disponible.

## Limitaciones y advertencias

- Estado experimental: el propio autor indica que la v6 no ha superado por completo su umbral de calidad y que la tabla de rendimiento se genera a partir de la propia ejecucion.
- Pesos fusionados no publicados: el modelo merged de la v6 no se publico porque su loss forzada por profesor (1,43) diferia de la del adaptador (1,65); hay que usar el adaptador, no un modelo fusionado.
- Debilidad en la instruccion "no usar herramientas": solo 2/8 en modo greedy y 5/8 en modo muestreado.
- Debilidad en la seleccion del primer nombre de herramienta en turnos reservados: 61,8%.
- Riesgo de bucle: la version previa (v5) genero un bucle de un mismo dialogo durante 13.221 tokens en una peticion de historia; no se confirma que la v6 lo haya eliminado por completo.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible.
- Idioma: soporte declarado unicamente en ingles.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de 35B con ~0,6B activos, la capacidad de conocimiento efectiva por token es limitada y puede aumentar el riesgo en tareas de conocimiento factual.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de un modelo base de Yandex conviene verificar las condiciones del modelo base.
- Compatibilidad de despliegue: al ser un adaptador PEFT, el stack de inferencia debe soportar la carga del adaptador sobre el base; no se confirma soporte en motores de alto rendimiento.
- Las pruebas de agente se realizaron en un arnes concreto (`pi`), por lo que el comportamiento en otros arneses y prompts puede diferir.

## Enlaces

- Repositorio HuggingFace (adaptador v6): https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6
- Modelo base: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Pesos fusionados bf16 (v6): https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-v6
- Versiones anteriores del adaptador: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v5 , https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v4 , https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v3 , https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2 , https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora
- Dataset: https://huggingface.co/datasets/kaivoss/UltraData-SFT-Agent-2609-GLM53-20k
- Dataset: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Paper (referenciado en los tags): arXiv:2602.09003
- Ejemplo de fine-tuning: finetune_chat_lora.py (incluido en el repositorio)
- Lista de tokens marcador de posicion: placeholder_ids.json (incluido en el repositorio)
- Vision general del modelo base: https://www.aimodels.fyi/models/huggingFace/aliceai-t5-35b-a0.6b-yandex
- Noticia sobre el modelo base de Yandex: https://thevalue.engineering/news/yandex-hybrid-opensources-ai-model-cuts-inference-costs.html
- Analisis del MoE de Yandex: https://www.aimodeling.com/en/news/slug/yandex-aliceai-t5-sparse-moe
