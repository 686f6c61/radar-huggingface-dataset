# AurelPx/SnapGuard-0.8B

## Resumen

SnapGuard-0.8B es un modelo de clasificación de seguridad (guardrail) desarrollado por AurelPx a partir de Qwen3.5-0.8B. Su funcion es determinar si un mensaje dirigido a un asistente de IA es seguro o malicioso: inyeccion de prompt, jailbreak, exfiltracion de datos o secretos, abuso de herramientas o solicitud de contenido danino. A diferencia de los LLM generativos usados como filtros, SnapGuard es un modelo de decision: lee el mensaje una sola vez y devuelve una probabilidad calibrada de que sea inseguro, sin generar ningun token.

El modelo parte de la arquitectura Qwen3.5-0.8B (24 capas, hidden size 1024, vocabulario de 248 320 tokens) y anade una cabeza de decision de estilo Clef sobre el decodificador, entrenada con LoRA (r=16) mediante la libreria Unsloth (`FastDecisionModel`). El resultado son 873 millones de parametros totales (853 M del decodificador y 27 M de la cabeza de decision), con una ventana de contexto de 512 tokens.

Su relevancia practica radica en la relacion entre coste y rendimiento: con aproximadamente 8 veces menos parametros que Llama Guard 7B, obtiene un AUPRC de 0.668 frente a 0.626 en el conjunto de test ToxicChat, y realiza una unica pasada forward de unos 100 ms por mensaje en una GPU de portatil. Esta pensado como una capa ligera de defensa en pipelines de agentes y asistentes conversacionales, no como un clasificador generico de toxicidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de decision tipo Clef sobre decodificador Qwen3.5-0.8B (sin cabeza de lenguaje en inferencia) |
| Parametros totales | 873 438 784 (853 M decodificador + 27 M cabeza de decision) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles, frances, aleman, espanol, italiano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1.8 GB, libreria unsloth) |

## Arquitectura y entrenamiento

El modelo reutiliza el decodificador de Qwen3.5-0.8B (24 capas, hidden size 1024) y sustituye la cabeza de lenguaje por una cabeza de decision estilo Clef que produce `p(unsafe)` para una unica pregunta si/no. En inferencia no se genera texto: una sola pasada forward sobre la pregunta de seguridad y el mensaje del usuario devuelve la probabilidad de que el mensaje sea un ataque. La pregunta de seguridad esta fijada en el entrenamiento y debe mantenerse literalmente para obtener resultados calibrados.

El entrenamiento se realizo con LoRA r=16 mas la cabeza de decision completa, optimizador AdamW, learning rate 2e-4 con scheduler coseno, batch efectivo de 32 y 2 epocas, seguido de calibracion de temperatura. El conjunto de datos consta de 11 291 mensajes etiquetados: prompts multilingues escritos a mano y subconjuntos filtrados de conjuntos publicos de seguridad (WildGuardTrain, OR-Bench, Lakera Gandalf y XSTest). Todo el entrenamiento se ejecuto en un MacBook Pro M4 Pro con MLX en 3 horas y 24 minutos, sin GPU NVIDIA.

## Capacidades

- Clasificacion binaria de seguridad de prompts: devuelve `p(unsafe)` para inyeccion de prompt (directa o oculta en documentos), jailbreak, evasion de reglas, extraccion del system prompt o secretos, abuso de herramientas (SQL, shell, SSRF, borrado masivo, envio sin confirmacion, fraude) y solicitudes de contenido odioso, acosador, sexualmente explicito, violento, peligroso o ilegal.
- Modelo de decision sin generacion: una unica pasada forward, sin decodificacion autoregresiva.
- Probabilidad calibrada tras el entrenamiento, lo que permite ajustar el umbral de estrictez segun el trafico.
- Multilingue en ingles, frances, aleman, espanol e italiano.
- Capacidad de reentrenamiento para cualquier otra pregunta si/no mediante el repositorio LLM2Decider.
- No soporta tool calling, agentes ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Filtro de entrada en asistentes conversacionales: colocar SnapGuard delante del LLM principal para bloquear inyecciones de prompt y jailbreaks antes de que lleguen al modelo generativo, con unos 100 ms de latencia por mensaje en GPU de portatil.
- Proteccion de agentes con acceso a herramientas: detectar solicitudes de abuso de herramientas (SQL, shell, SSRF, borrado masivo o envio sin confirmacion) antes de que el agente ejecute acciones irreversibles.
- Defensa contra exfiltracion del system prompt: clasificar mensajes que intentan extraer instrucciones internas, secretos o datos personales de terceros, aprovechando la definicion explicita de ataque incluida en la pregunta de seguridad.
- Moderacion multilingue en Europa: cubrir trafico en ingles, frances, aleman, espanol e italiano con un unico modelo de 0.88 B, simplificando el despliegue frente a soluciones por idioma.
- Segunda capa de defensa en pipelines de moderacion: combinarlo con clasificadores de toxicidad o APIs de moderacion para reducir falsos negativos en categorias especificas de ataque.
- Evaluacion offline de trafico historico: al devolver una probabilidad calibrada, permite puntuar grandes volumenes de prompts registrados para calibrar umbrales antes de desplegar el filtro en produccion.
- Entrenamiento de clasificadores de decision propios: usar el flujo LLM2Decider con SnapGuard como referencia para crear filtros si/no adaptados a dominios concretos (por ejemplo, cumplimiento normativo o politicas internas).

## Benchmarks y rendimiento

Resultados declarados por el autor en ToxicChat (`toxicchat0124`, split test: 5 083 prompts reales, 362 toxicos; metrica AUPRC sin umbral):

| Modelo | Parametros | AUPRC |
|---|---:|---:|
| SnapGuard-0.8B | 0.88 B | 0.668 |
| Llama Guard | 7 B | 0.626 |
| OpenAI Moderation API | no disponible | 0.588 |
| Perspective API | no disponible | 0.532 |

Las cifras de referencia de Llama Guard, OpenAI Moderation API y Perspective API proceden de la tabla 2 del paper de Llama Guard (arXiv:2312.06674). El resultado de SnapGuard no esta verificado de forma independiente (`verified: false` en la model card).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 873 M parametros, en fp16 el peso ronda 1.7 GB y en cuantizaciones de 8 o 4 bits quedaria por debajo de 1 GB, aunque el autor no publica cifras de VRAM ni variantes cuantizadas.
- GPU recomendadas: no disponible; el autor reporta unos 100 ms por mensaje en una GPU de portatil Apple M4 Pro.
- Cabe en GPU consumer: si, por el reducido tamano del modelo (0.88 B), aunque no se detallan modelos concretos.
- Opciones de despliegue: libreria Unsloth (`FastDecisionModel.from_pretrained` y `FastDecisionModel.predict`), tal como indica la model card; no se documentan otras rutas (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: aproximadamente 100 ms por mensaje en Apple M4 Pro; no se publican cifras de throughput agregado.
- Entrenamiento: 3 h 24 min en MacBook Pro M4 Pro con MLX, sin GPU NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUPRC en ToxicChat | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| SnapGuard-0.8B | 0.88 B | 512 tokens | 0.668 | Apache-2.0 | Hugging Face |
| Llama Guard | 7 B | no disponible en la informacion | 0.626 | Llama Guard License (no disponible en detalle) | Meta / Hugging Face |
| OpenAI Moderation API | no disponible | no disponible | 0.588 | servicio propietario | API de pago |
| Perspective API | no disponible | no disponible | 0.532 | servicio propietario | API de Google Jigsaw |

SnapGuard destaca por obtener el mayor AUPRC de la tabla con aproximadamente 8 veces menos parametros que Llama Guard, y por ser el unico de los comparados con pesos abiertos y licencia Apache-2.0. Como contrapartida, su contexto de 512 tokens es mucho menor que el de los LLM generativos usados como guardrails.

## Limitaciones y advertencias

- Responde a una unica pregunta fija: contenido ofensivo que no sea un ataque ni una solicitud danina (por ejemplo, un chiste grosero) puede pasar por diseno.
- Fallos conocidos: preguntas sobre autolesion y jailbreaks disfrazados de proyecto escolar o de investigacion.
- No proporciona explicaciones ni etiquetas de categoria: solo una probabilidad.
- La calibracion solo esta garantizada en datos similares a los de entrenamiento; debe validarse sobre el trafico real antes de produccion.
- Ventana de contexto de 512 tokens, insuficiente para documentos largos donde la inyeccion podria estar oculta.
- Cobertura multilingue limitada a ingles, frances, aleman, espanol e italiano.
- Debe usarse como una capa de defensa adicional, nunca como unica proteccion.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las obligaciones de atribucion y las condiciones del modelo base Qwen3.5-0.8B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AurelPx/SnapGuard-0.8B
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio LLM2Decider: https://github.com/Aurelien7877/llm2decider
- Documentacion de Unsloth sobre modelos de decision: https://unsloth.ai/docs/basics/train-your-own-decision-model-with-unsloth
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Dataset ToxicChat: https://huggingface.co/datasets/lmsys/toxic-chat
- Paper de Llama Guard: https://arxiv.org/abs/2312.06674
