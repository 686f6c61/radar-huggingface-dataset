# 3p3r/aegis-firewall-attack-text-heavy

## Resumen

Aegis-firewall-attack-text-heavy es un clasificador binario de texto disenado para detectar si una entrada de texto constituye un ataque dirigido a un agente conversacional. Lo desarrolla el usuario 3p3r y se distribuye como un adaptador LoRA sobre el modelo base Qwen2-1.5B-Instruct, con el adaptador bautizado como `yesno` y aplicado sobre los modulos MLP. Su funcion es responder de forma estricta con "yes" o "no" ante la pregunta de si el texto recibido es un ataque, lo que lo convierte en un componente de filtrado previo para pipelines de agentes.

El modelo esta pensado para ejecutarse en hardware de borde, concretamente en un Asus UGen300 con acelerador Hailo-10H, lo que explica su orientacion a un despliegue ligero y de baja latencia (0,398 s hasta el primer token segun la model card). Se ha afinado sobre una mezcla amplia de conjuntos de datos de seguridad: WildJailbreak, Nemotron Content Safety V2, ToxicChat, prompt-injections de deepset, Salad-Data, jailbreak prompts en libertad, SPML Chatbot Prompt Injection, jailbreak-classification, safe-guard-prompt-injection y NotInject, ademas de filas benignas de instrucciones de chatbot, Orca AgentInstruct y Open-Instruct.

Su relevancia actual radica en la necesidad creciente de defensas especificas contra inyeccion de prompts y jailbreaks en sistemas con agentes. No obstante, los resultados publicados son desiguales: mientras que en AgentDojo alcanza un 83,1 % de acierto, en BIPIA cae al 12,0 % y en JailbreakBench al 28,5 %, lo que indica un rendimiento muy dependiente del tipo de ataque y del conjunto de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador `yesno`) sobre Qwen2-1.5B-Instruct, aplicado en modulos MLP |
| Parametros totales | No disponible (el adaptador LoRA se monta sobre un base de 1.500 millones de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | No disponible (repo de 2,3 GB; incluye tag `hailo`, compatible con Hailo-10H) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango sobre Qwen2-1.5B-Instruct, un transformer decoder-only. El adaptador, denominado `yesno`, se aplica exclusivamente sobre los modulos MLP del modelo base, no sobre las capas de atencion, lo que reduce el numero de parametros entrenables y el coste de adaptacion. La tarea es de clasificacion binaria formulada como generacion restringida: el modelo debe emitir exactamente "yes" o "no", y solo se contabiliza como acierto una respuesta que coincida de forma exacta con una de esas dos cadenas.

El entrenamiento combina diez conjuntos de datos publicos de seguridad y jailbreak (WildJailbreak, Nemotron Content Safety V2, ToxicChat, deepset/prompt-injections, Salad-Data, in-the-wild jailbreak prompts, SPML Chatbot Prompt Injection, jailbreak-classification, safe-guard-prompt-injection y NotInject) junto con filas benignas extraidas de instrucciones de chatbot, Orca AgentInstruct y Open-Instruct para equilibrar la clase negativa. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se describen innovaciones como decodificacion especulativa o atencion lineal; la unica particularidad tecnica destacable es el despliegue sobre el acelerador Hailo-10H.

## Capacidades

- Clasificacion binaria de texto: responde "yes" o "no" a la pregunta de si el texto es un ataque dirigido a un agente.
- Deteccion de inyeccion de prompts y jailbreaks en entradas de usuario.
- Deteccion de contenido danino y texto toxico, gracias a los conjuntos de datos de seguridad incluidos en el entrenamiento.
- Filtrado previo (firewall) para agentes conversacionales y pipelines de LLM.
- Operacion en hardware de borde (Hailo-10H) con baja latencia de primer token.
- Capacidad multilingue: no disponible; el modelo declara solo ingles.
- Soporte de tool calling, agentes multi-paso, vision o audio: no disponible; no es un modelo generativo de proposito general.

## Casos de uso

- Firewall de entrada para agentes: antes de que un prompt llegue al LLM principal, el clasificador lo evalua y bloquea las entradas marcadas como ataque, reduciendo la superficie de inyeccion de prompts en produccion.
- Proteccion de chatbots de atencion al cliente: se intercala en la ruta de mensajes del usuario para descartar intentos de jailbreak o instrucciones maliciosas antes de que el modelo conversacional las procese.
- Moderacion de contenido en plataformas UGC: clasificacion rapida de textos enviados por usuarios para detectar contenido toxico o danino, aprovechando el entrenamiento sobre ToxicChat y Salad-Data.
- Despliegue en dispositivos de borde: al ejecutarse en un Asus UGen300 con Hailo-10H, permite filtrado local sin enviar el texto a la nube, util en entornos con requisitos de privacidad o conectividad limitada.
- Capa de defensa en pipelines RAG: evaluacion de los prompts de consulta antes de recuperar documentos, para evitar que instrucciones maliciosas manipulen la generacion aumentada.
- Evaluacion y monitorizacion de seguridad: uso como clasificador de referencia para medir la tasa de ataques que superan un sistema y alimentar paneles de telemetria de seguridad.
- Prefiltro en sistemas de agentes con herramientas: descarte de entradas sospechosas antes de invocar herramientas externas, reduciendo el riesgo de ejecucion de acciones no deseadas.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en Hailo-10H y contabilizando solo respuestas exactas "yes" o "no". Cada banco esta limitado a 2.000 filas.

| Bench | Correctas | Precision |
|---|---|---|
| AgentDojo | 118/142 | 83,1 % |
| BIPIA | 239/1999 | 12,0 % |
| deepset | 77/116 | 66,4 % |
| InjecAgent | 1144/2000 | 57,2 % |
| jackhhao | 293/387 | 75,7 % |
| JailbreakBench | 57/200 | 28,5 % |
| Sentinel | 1249/1999 | 62,5 % |
| WildJailbreak | 1031/1999 | 51,6 % |
| xTRam1 | 1128/1999 | 56,4 % |
| Micro | 5336/10841 | 49,2 % |

Tiempo hasta el primer token: 0,398 s. No se han publicado resultados comparativos con otros modelos de deteccion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un LoRA sobre un base de 1.500 millones de parametros, el peso del base en precision completa ronda los 3 GB, aunque el repo ocupa 2,3 GB y el despliegue objetivo es el acelerador Hailo-10H.
- GPU recomendadas: no disponibles; el modelo esta validado en Asus UGen300 con Hailo-10H, no en GPU convencionales.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; por tamano del base (1,5B) seria viable en GPU consumer con cuantizacion, pero no hay datos publicados de ese despliegue.
- Opciones de despliegue: Hailo-10H (hardware objetivo); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: tiempo hasta el primer token de 0,398 s en Hailo-10H; throughput no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros clasificadores de seguridad en la informacion proporcionada. Como referencia de categoria, se puede situar frente a modelos como Llama Guard o clasificadores de inyeccion de prompts, pero no hay resultados publicados que permitan una comparacion cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Aegis-firewall-attack-text-heavy | LoRA sobre Qwen2-1.5B | No disponible | GPL-3.0 | Hugging Face |
| Llama Guard (familia) | No disponible | No disponible | No disponible | No disponible |
| Clasificadores de prompt injection genericos | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Rendimiento muy desigual segun el tipo de ataque: 12,0 % en BIPIA y 28,5 % en JailbreakBench frente a 83,1 % en AgentDojo, lo que desaconseja su uso como unica defensa.
- Evaluacion limitada a 2.000 filas por banco; el autor indica que la puntuacion completa es demasiado lenta en el dispositivo y que planea eliminar el limite, por lo que los resultados pueden no ser representativos.
- Solo soporta ingles; el uso con otros idiomas no esta validado.
- Formulacion de salida estricta: solo se contabiliza una respuesta exacta "yes" o "no", lo que puede infravalorar el rendimiento real si el modelo genera variantes.
- Riesgo de falsos negativos en ataques novedosos no representados en los conjuntos de entrenamiento.
- Licencia GPL-3.0: impone obligaciones de copyleft que pueden condicionar su integracion en productos comerciales propietarios; conviene revisar la compatibilidad antes de usarlo en produccion.
- No hay informacion sobre sesgos especificos, tasas de alucinacion ni comportamiento fuera de dominio.
- Dependencia de hardware especifico (Hailo-10H) para el rendimiento reportado; el comportamiento en otras plataformas no esta documentado.
- Modelo con cero descargas y cero likes en el momento de la ficha, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/3p3r/aegis-firewall-attack-text-heavy
- Dataset WildJailbreak: https://huggingface.co/datasets/allenai/wildjailbreak
- Dataset Nemotron Content Safety V2: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Dataset ToxicChat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset Salad-Data: https://huggingface.co/datasets/OpenSafetyLab/Salad-Data
- Dataset In-the-wild jailbreak prompts: https://huggingface.co/datasets/TrustAIRLab/in-the-wild-jailbreak-prompts
- Dataset SPML Chatbot Prompt Injection: https://huggingface.co/datasets/reshabhs/SPML_Chatbot_Prompt_Injection
- Dataset jailbreak-classification: https://huggingface.co/datasets/jackhhao/jailbreak-classification
- Dataset safe-guard-prompt-injection: https://huggingface.co/datasets/xTRam1/safe-guard-prompt-injection
- Dataset NotInject: https://huggingface.co/datasets/leolee99/NotInject
