# 3p3r/aegis-firewall-attack-text-light

## Resumen

Aegis-firewall-attack-text-light es un clasificador binario de texto desarrollado por el usuario 3p3r, disenado para responder una unica pregunta: si un texto de entrada constituye un ataque dirigido a un agente de IA. El modelo se presenta como una capa de defensa ligera ("firewall") que puede evaluar prompts y entradas de usuario antes de que lleguen a un sistema agentico, devolviendo una respuesta de tipo si/no.

Tecnicamente, el modelo combina un encoder `all-MiniLM-L6-v2` afinado y ejecutado sobre un acelerador Hailo-10H (integrado en un Asus UGen300), con una cabeza de clasificacion lineal que se ejecuta en el host. Se trata por tanto de un modelo de muy pequeno tamano, orientado a inferencia de baja latencia en hardware de borde, mas que a razonamiento general.

Su relevancia actual radica en el creciente interes por la seguridad de agentes y la deteccion de prompt injection y jailbreaks. El autor lo entrena sobre una combinacion amplia de datasets de seguridad (WildJailbreak, Aegis-AI-Content-Safety, ToxicChat, prompt-injections, entre otros) y publica resultados de benchmarks propios medidos directamente sobre el dispositivo Hailo. El modelo es muy reciente (creado en noviembre de 2026) y cuenta con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (all-MiniLM-L6-v2 afinado) + cabeza lineal de clasificacion binaria en el host |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (ejecucion sobre Hailo-10H; el formato de compilacion no se detalla) |
| Idiomas soportados | en (ingles) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; pesos posiblemente compilados para Hailo o no publicados) |

## Arquitectura y entrenamiento

El modelo se basa en `all-MiniLM-L6-v2`, un encoder transformer pequeno y ampliamente utilizado para tareas de similitud semantica y clasificacion. Sobre ese encoder se ha realizado un fine-tuning para la tarea concreta de clasificacion binaria (ataque / no ataque). La cabeza de decision es una capa lineal que se ejecuta en el host, mientras que el encoder se ejecuta sobre el acelerador Hailo-10H del Asus UGen300. El modelo esta etiquetado con el tag `hailo`, lo que sugiere que los pesos estan orientados a ese hardware.

El entrenamiento combina datos de diez datasets publicos de seguridad y jailbreak mas filas benignas extraidas de prompts de instruccion de chatbot, Orca AgentInstruct y Open-Instruct. Entre los datasets destacan WildJailbreak, Nemotron Content Safety V2 (Aegis-AI-Content-Safety-Dataset-2.0), ToxicChat, deepset/prompt-injections, Salad-Data, in-the-wild jailbreak prompts, SPML Chatbot Prompt Injection, jailbreak-classification, safe-guard-prompt-injection y NotInject. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El autor indica que cada benchmark esta limitado a 2.000 filas por limitaciones de velocidad del dispositivo, con intencion de eliminar ese limite en el futuro.

## Capacidades

- Clasificacion binaria de texto: determina si una entrada es un ataque dirigido a un agente (respuesta si/no).
- Deteccion de prompt injection y jailbreaks en prompts de usuario.
- Deteccion de contenido de seguridad en conversaciones de chatbot (entrenado con datos de ToxicChat y Aegis-AI-Content-Safety).
- Inferencia de baja latencia en hardware de borde (Hailo-10H): 8,9 ms de media por llamada en batch 1.
- Clasificacion por lotes segun los benchmarks publicados (hasta 2.000 filas por bench).
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking: es exclusivamente un clasificador de texto.
- Capacidad multilingue limitada al ingles (`en`).

## Casos de uso

- Firewall de prompts en agentes: colocar el clasificador delante de un agente LLM para filtrar entradas maliciosas antes de que lleguen al modelo principal, aprovechando su latencia de ~9 ms por llamada.
- Deteccion de prompt injection en aplicaciones de chatbot: integrar el clasificador en el pipeline de entrada de un chatbot para marcar mensajes que intenten manipular las instrucciones del sistema.
- Moderacion de contenido en tiempo real: usar las capacidades entrenadas con ToxicChat y Aegis-AI-Content-Safety para clasificar mensajes de usuarios en plataformas de conversacion.
- Despliegue en dispositivos de borde: al ejecutarse sobre un Asus UGen300 con Hailo-10H, es adecuado para entornos con recursos limitados o sin conectividad a la nube.
- Filtrado previo en pipelines de evaluacion de seguridad: clasificar lotes de prompts de benchmarks (AgentDojo, InjecAgent, JailbreakBench) para triage rapido antes de analisis mas profundos.
- Capa de defensa en profundidad: combinarlo con otros clasificadores de seguridad o con guardrails basados en LLM para reducir la tasa de falsos negativos en sistemas criticos.
- Preprocesado en sistemas de registro de conversaciones: etiquetar retroactivamente logs de interacciones para identificar intentos de ataque y alimentar analitica de seguridad.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre Hailo-10H. Una respuesta cuenta como correcta solo si el texto es exactamente "yes" o "no". Cada bench limitado a 2.000 filas.

| Bench | Correctas | Precision |
|---|---|---|
| AgentDojo | 103/142 | 72,5% |
| BIPIA | 65/1999 | 3,3% |
| deepset | 63/116 | 54,3% |
| InjecAgent | 1057/2000 | 52,9% |
| jackhhao | 303/387 | 78,3% |
| JailbreakBench | 120/200 | 60,0% |
| Sentinel | 1749/1999 | 87,5% |
| WildJailbreak | 1332/1999 | 66,6% |
| xTRam1 | 1917/1999 | 95,9% |
| Micro (agregado) | 6709/10841 | 61,9% |

Latencia: tiempo de chip en batch 1, 300 llamadas tras calentamiento: media 8,9 ms, mediana 8,8 ms.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se ejecuta sobre un acelerador Hailo-10H, no sobre GPU convencional.
- GPU recomendadas: no aplica para el despliegue previsto; el autor lo ejecuta en un Asus UGen300 (Hailo-10H).
- Compatibilidad con GPU de consumo: no disponible; al ser un encoder MiniLM, en teoria podria ejecutarse en CPU o GPU de consumo si se dispusiera de los pesos en formato estandar, pero el repo no publica pesos convencionales (tamano 0.0 GB).
- Opciones de despliegue: ejecucion sobre Hailo-10H segun el autor; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: media de 8,9 ms y mediana de 8,8 ms por llamada en batch 1 sobre Hailo-10H.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| aegis-firewall-attack-text-light | Encoder MiniLM + cabeza lineal | no disponible | no disponible | GPL-3.0 | Clasificacion binaria ataque/no ataque en borde |
| Llama Guard (Meta) | LLM clasificador de seguridad | no disponible en esta ficha | no disponible | licencia Llama | Clasificacion de seguridad de contenido |
| ShieldGemma (Google) | LLM clasificador de seguridad | no disponible en esta ficha | no disponible | licencia Gemma | Moderacion de contenido |
| deepset/prompt-injections (baseline) | Dataset / clasificador de referencia | no disponible | no disponible | no disponible | Deteccion de prompt injection |

No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a categoria y enfoque.

## Limitaciones y advertencias

- Precision agregada moderada (61,9% en el micro-promedio) y muy baja en BIPIA (3,3%) y deepset (54,3%), lo que indica un rendimiento irregular segun el tipo de ataque.
- Solo soporta ingles; no hay evidencia de rendimiento en castellano u otros idiomas.
- El modelo esta disenado para hardware Hailo-10H; el repo no publica pesos en formatos convencionales (tamano 0.0 GB), lo que limita su reutilizacion fuera de ese ecosistema.
- Riesgo de falsos negativos y positivos: al ser un clasificador binario simple, puede fallar ante ataques novedosos o parafraseados no representados en los datasets de entrenamiento.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial y distribucion; conviene revisar su compatibilidad con productos propietarios.
- Benchmarks limitados a 2.000 filas por conjunto y medidos con criterio estricto de respuesta exacta ("yes"/"no"), lo que puede no reflejar el comportamiento en produccion.
- Modelo muy reciente y sin adopcion (0 descargas, 0 likes): no hay validacion independiente de los resultados.
- No se documentan sesgos especificos, pero los datasets de seguridad pueden introducir sesgos de dominio y de estilo de escritura.

## Enlaces

- Hugging Face: https://huggingface.co/3p3r/aegis-firewall-attack-text-light
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
