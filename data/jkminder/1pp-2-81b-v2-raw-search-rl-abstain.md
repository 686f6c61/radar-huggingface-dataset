# jkminder/1pp-2.81b-v2-raw-search-rl-abstain

## Resumen

1pp-2.81b-v2-raw-search-rl-abstain es un checkpoint de investigacion publicado por el usuario jkminder en Hugging Face. Se trata de un agente de busqueda en Wikipedia construido sobre el modelo One Persona Pretraining (1PP) de 2.81B parametros, en su condicion "raw", semilla 28, cuyo punto de partida es el SFT Raghav-Singhal/1pp-2.81b-v2-raw-sft. El modelo ha sido afinado primero con supervision sobre conversaciones de busqueda (warm start) y despues entrenado con GRPO para responder preguntas consultando un indice BM25 de la Wikipedia de 2018.

La particularidad del modelo es que puede responder "no lo se": se le entrena explicitamente para abstenerse cuando las pasajes recuperados no contienen la respuesta, en lugar de inventarla. El checkpoint publicado corresponde al paso 905, momento en el que el computo de RL alcanzo el 5 % del computo de preentrenamiento del modelo (convencion 6ND, incluyendo muestreo).

Por su tamano (2.807.699.328 parametros) y su naturaleza de research checkpoint, esta pensado para estudiar el comportamiento de agentes de busqueda con abstención y el efecto del RL sobre la calibracion, no como modelo de produccion. La ventana de contexto practica es de 4.096 tokens por conversacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tags) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens por conversacion (limite practico indicado por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only de la familia Llama con 2.81B parametros, heredado del SFT base. El entrenamiento se divide en dos fases. La primera es un warm start supervisado de una epoca sobre 2.417 conversaciones: 2.175 episodios de busqueda reescritos por Claude en el estilo de chat de los modelos SFT (aproximadamente el 1 % terminan en "I could not find the answer") y 242 conversaciones de chat ordinarias.

La segunda fase es RL con GRPO implementado en verl, con un entrenador asincrono en la misma GPU (los episodios pueden estar como maximo a dos versiones de pesos de distancia). Se ejecutaron 905 pasos de 256 preguntas x 8 rollouts sobre 4 nodos (16 GPUs). El optimizador es Muon con learning rate 1e-4 para las matrices, con grupos AdamW a las ratios de preentrenamiento y una perdida KL de 0.001 (estimador de baja varianza) respecto al warm start. Las preguntas provienen de HotpotQA, NQ, 2WikiMultihopQA y MuSiQue, mas conversaciones multiturno con seguimientos escritos por Claude (198.002 filas); en el 2 % de las preguntas se ocultan de la busqueda los pasajes que contienen la respuesta para que "no lo se" sea la respuesta correcta. La recompensa por pregunta es 1 por respuesta correcta (exact match del tag de respuesta, o PEDANTS con umbral 0.5 y regla de solapamiento de palabras sin respuestas rellenadas), 0 por no responder y -0.5 por respuesta incorrecta, menos 0.03 por cada busqueda despues de la primera, 0.1 por error de formato y 0.3 por responder sin buscar. Se aplica un filtro de correccion que sustituye grupos de preguntas cuyos 8 rollouts puntuan igual y omite preguntas acertadas en los 8 intentos. Cada paso incorpora ademas 32 conversaciones de chat (perdida solo en tokens del asistente, peso 0.1) extraidas de 60.000 chats del mix de entrenamiento de los SFT, de los cuales alrededor del 37 % proceden de los conjuntos de seguridad WildJailbreak y WildGuardMix.

## Capacidades

- Generacion de texto conversacional multiturno con la plantilla de chat del modelo base (`<|im_start|>` / `<|im_end|>`).
- Busqueda en un indice BM25 de la Wikipedia de 2018 mediante tool calling con el formato `<tool_call>{"name": "search", "arguments": {"query": "..."}}</tool_call>`.
- Razonamiento multi-paso: hasta 5 busquedas por pregunta de usuario, encadenando resultados devueltos como turnos `<tool_response>` con los 3 mejores pasajes (titulo y primeras 100 palabras).
- Respuesta estructurada en exactamente un tag `<answer>...</answer>`.
- Abstención calibrada: responde sin tag cuando no encuentra la respuesta, comportamiento entrenado explicitamente con RL.
- Seguimiento de conversacion: admite preguntas de seguimiento en turnos posteriores del usuario.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion sobre calibracion y abstención en agentes de busqueda: el modelo permite medir la tasa de respuestas correctas frente a la tasa de abstención (69,6 % de acierto entre las preguntas que responde, respondiendo solo el 56,8 %), un escenario ideal para estudiar trade-offs entre cobertura y precision.
- Experimentos de RL para agentes con herramientas: sirve como referencia reproducible de un pipeline GRPO en verl con recompensas compuestas (correccion, coste de busqueda, formato y penalizacion por responder sin buscar).
- Preguntas factuales sobre conocimiento enciclopedico de 2018: el modelo consulta la Wikipedia de ese ano y devuelve respuestas con pasajes de soporte, util para evaluar QA multihop sobre HotpotQA, 2WikiMultihopQA o MuSiQue.
- Evaluacion de alucinacion en sistemas RAG: al estar entrenado para abstenerse cuando los pasajes no contienen la respuesta, permite comparar la tasa de invencion frente a modelos que siempre contestan.
- Estudio de destilacion de estilo conversacional: los episodios de busqueda reescritos por Claude y el chat replay de 60.000 conversaciones permiten analizar como el RL degrada o preserva capacidades conversacionales (NLL en chats retenidos de 1.543 frente a 1.712 del warm start).
- Prototipado de agentes de busqueda en entornos con recursos limitados: con 2.81B parametros y contexto de 4.096 tokens, es viable en una unica GPU para pruebas de concepto, aunque no se recomienda para produccion.

## Benchmarks y rendimiento

Resultados en dev (768 preguntas, 8 intentos cada una a temperatura 1), comparando el warm start con este checkpoint:

| Metrica | Warm start | Este modelo |
|---|---|---|
| Acierto en un intento (pass@1), % | 10,4 | 32,0 |
| Acierto en al menos uno de 8 intentos (pass@8), % | 30,7 | 42,2 |
| Acierto entre las preguntas que responde, % | 16,7 | 69,6 |
| Proporcion de preguntas que responde, % | 83,3 | 56,8 |
| NLL de tokens del asistente en chats retenidos | 1,712 | 1,543 |
| Proporcion de chats retenidos con llamada de busqueda, % | 20 | 2 |

El conjunto dev incluye 128 preguntas de cada fuente: HotpotQA, NQ, 2WikiMultihopQA, MuSiQue, conversaciones y preguntas con respuesta oculta. "Acierto" es la puntuacion de respuesta de la recompensa de entrenamiento, y "no lo se" cuenta como no acertada. Los chats retenidos son 128 conversaciones ordinarias que no requieren busqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2,81B parametros en safetensors (5,6 GB de repo) se situa en torno a 5,6 GB en fp16/bf16 y aproximadamente 1,5-3 GB en cuantizaciones de 4-8 bits, aunque el autor no publica cifras.
- GPU recomendadas: el entrenamiento se realizo en 16 GPUs repartidas en 4 nodos; para inferencia basta una GPU consumer con al menos 6-8 GB de VRAM en bf16.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes, aunque no hay confirmacion oficial.
- Opciones de despliegue: al estar en safetensors con arquitectura Llama, es compatible con vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF; el autor no documenta ninguna integracion concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-raw-search-rl-abstain | 2,81B | 4.096 tokens | Agente de busqueda con RL y abstención | other | Hugging Face (jkminder) |
| Raghav-Singhal/1pp-2.81b-v2-raw-sft | 2,81B (no confirmado) | no disponible | SFT base (warm start) | no disponible | Hugging Face |
| Search-R1 (familia) | no disponible | no disponible | RL para busqueda, corpus Wikipedia 2018 | no disponible | no disponible |

La comparativa se limita al modelo base del que deriva y a la linea Search-R1, citada por el autor como origen del corpus BM25. No se dispone de datos publicados de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Las respuestas de "no lo se" son formulaicas ("None of these passages mention ..."), lo que puede resultar poco natural en un producto final.
- El razonamiento a veces cita hechos que ningun pasaje contiene, incluso cuando la respuesta es correcta.
- Es un checkpoint de investigacion y no esta ajustado para seguridad mas alla del SFT del modelo base.
- La licencia es "other": no se especifican condiciones de uso comercial, por lo que debe revisarse antes de cualquier despliegue productivo.
- El contexto esta limitado a 4.096 tokens por conversacion y a un maximo de 5 busquedas por pregunta.
- El conocimiento esta acotado a la Wikipedia de 2018 indexada con BM25; no cubre informacion posterior ni fuentes fuera de ese corpus.
- La tasa de abstención es alta (responde solo el 56,8 % de las preguntas en dev), lo que puede ser inadecuado para casos donde se espera siempre una respuesta.
- No se documentan idiomas soportados; el entrenamiento y las evaluaciones se describen en ingles.
- Riesgo de sesgos heredados del modelo base y de los conjuntos de entrenamiento (HotpotQA, NQ, 2WikiMultihopQA, MuSiQue y chats de Claude), no evaluados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkminder/1pp-2.81b-v2-raw-search-rl-abstain
- Modelo base (SFT): https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-sft
- Revision del modelo base citada: `216fc67`
- Corpus Wikipedia 2018 de Search-R1: no disponible como enlace directo en la informacion proporcionada
- Repositorio verl (framework de RL usado): no disponible como enlace directo en la informacion proporcionada
- Paper o blog del autor: no disponible
