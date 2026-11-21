# 223Harsh/alfred-guard-0.8b

## Resumen

ALFRED Guard 0.8B es un detector de ataques de prompt diseñado como capa de defensa para asistentes de IA internos en entornos regulados, en particular banca. Lo desarrolla 223Harsh en el contexto del hackathon GDG *Agentic AI in companies* (Turín, 21 de noviembre de 2026) para el banco ficticio Lumen Bank, dentro del proyecto ALFRED (Agentic Ledger For Regulated Enterprise Decisions). El modelo resuelve un problema acotado: clasificar un mensaje de usuario como `ATTACK` o `SAFE`, cubriendo inyección de prompt, jailbreak y role-play, reclamación de roles para obtener más privilegios, intentos de extraer o desanonimizar datos personales y peticiones para actuar sin aprobación humana.

Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-0.8B, con 852.985.920 parámetros totales (aproximadamente 0,85B) y un repositorio de 1,7 GB en formato safetensors. Su interés práctico reside en el tamaño: es lo bastante pequeño para ejecutarse en local o en infraestructura on-premise de un banco, lo que encaja con el requisito de despliegue sin salida de datos a terceros. La licencia Apache 2.0 facilita su integración comercial.

El modelo no es un asistente conversacional general: es un clasificador binario de seguridad que debe usarse como una capa más de defensa, no como la única. Distingue ataques de preguntas legítimas sobre fraude, AML o correos sospechosos, que marca como `SAFE`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning de Qwen/Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en, it |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85B de parámetros, y se especializa mediante fine-tuning supervisado para una tarea de clasificación binaria con salida textual (`ATTACK` o `SAFE`). No se documentan en la información disponible detalles sobre la arquitectura interna del base (número de capas, dimensiones, mecanismos de atención) ni sobre el contexto máximo soportado.

El entrenamiento se realizó sobre 3.947 prompts procedentes del *red-team arena* de ALFRED, generados por un atacante de 180B parámetros en 9 categorías, en inglés e italiano, con técnicas de ofuscación, más cuatro conjuntos públicos: deepset/prompt-injections (Apache-2.0), jackhhao/jailbreak-classification (Apache-2.0), Lakera/gandalf_ignore_instructions (MIT) y reshabhs/SPML_Chatbot_Prompt_Injection (MIT). Todos los datos propios son sintéticos (clientes ficticios generados con Faker), sin datos reales de clientes ni personales. No se especifica en la información disponible si se aplicaron técnicas de RLHF, DPO u otro ajuste posterior al SFT.

## Capacidades

- Clasificación binaria de seguridad: responde `ATTACK` o `SAFE` a un mensaje de usuario.
- Detección de inyección de prompt (instrucciones ocultas o superpuestas al contenido legítimo).
- Detección de jailbreak y role-play malicioso.
- Detección de reclamación de roles o identidades para obtener privilegios adicionales.
- Detección de intentos de extracción o desanonimización de datos personales.
- Detección de peticiones para que el asistente actúe sin aprobación humana.
- Robustez frente a ofuscación en los prompts de ataque (entrenado con ejemplos ofuscados).
- Diferenciación de consultas legítimas sobre fraude, AML o correos sospechosos, clasificadas como `SAFE`.
- Soporte bilingüe inglés e italiano.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Puerta de entrada de seguridad en asistentes internos bancarios: cada mensaje del empleado se pasa primero por ALFRED Guard; si devuelve `ATTACK`, se bloquea o se deriva a revisión humana antes de llegar al modelo principal. Adecuado por su tamaño reducido, que permite ejecutarlo en la misma infraestructura on-premise.
- Filtro previo en pipelines RAG: antes de recuperar documentos o ejecutar una consulta, el guard clasifica la pregunta del usuario para evitar que instrucciones inyectadas manipulen la recuperación o la respuesta.
- Protección de agentes con acceso a herramientas: cuando el asistente puede ejecutar acciones (consultas a core bancario, envío de correos), el guard intercepta peticiones del tipo "actúa sin pedir aprobación" o "asume el rol de administrador" antes de que lleguen al planificador del agente.
- Cumplimiento y prevención de fuga de datos (DLP): detección de intentos de extraer o reidentificar datos personales de clientes sintéticos o reales en el contexto del asistente, como capa complementaria a los controles de acceso.
- Evaluación de robustez y red teaming continuo: uso del modelo como juez automático para medir la tasa de ataques que superan la primera línea de defensa en pruebas periódicas, comparando con los conjuntos públicos de referencia.
- Moderación en despliegues multilingües limitados a inglés e italiano: útil en filiales o equipos que operan en esos dos idiomas, con un coste computacional bajo frente a clasificadores basados en LLM de mayor tamaño.
- Telemetría de seguridad: registro de las clasificaciones `ATTACK` para alimentar paneles de detección y análisis de intentos de manipulación dirigidos al asistente.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Recall de ataque | Falsas alarmas |
|---|---|---|
| Ataques del arena ALFRED (789, held-out) | 97,8% | 2,9% |
| Conjuntos publicos de inyeccion (400, held-out) | 99,6% | 1,4% |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con otros clasificadores de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,85B parámetros, en fp16 requiere aproximadamente 1,7 GB de pesos más overhead de activaciones y KV cache; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, aproximadamente 0,5 GB (estimaciones calculadas a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 con contexto moderado; tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 son suficientes. Para despliegue de alta concurrencia en servidor, A100 o H100 no son necesarias pero permiten mayor throughput.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas con 4 GB o más de VRAM.
- Opciones de despliegue: el repositorio solo publica safetensors, por lo que el despliegue directo requiere transformers, vLLM o TGI. No se documentan pesos GGUF ni integración con llama.cpp u Ollama; sería necesario convertirlos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALFRED Guard 0.8B | 0,85B | no disponible | Clasificacion de prompt injection y jailbreak | Apache-2.0 | Hugging Face |
| deepset/deberta-v3-base-prompt-injection | no disponible en la informacion | no disponible | Clasificacion de prompt injection | no disponible | Hugging Face (usado como dato de entrenamiento) |
| jackhhao/jailbreak-classification | no disponible en la informacion | no disponible | Clasificacion de jailbreak | Apache-2.0 | Hugging Face (usado como dato de entrenamiento) |
| Lakera/gandalf_ignore_instructions | no disponible en la informacion | no disponible | Deteccion de instrucciones ignoradas | MIT | Hugging Face (usado como dato de entrenamiento) |

Los tres conjuntos públicos citados se emplearon como datos de entrenamiento, por lo que no constituyen comparaciones independientes; no se dispone de una comparativa de rendimiento frente a ellos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que debe usarse como una capa de defensa, no como la única; un clasificador binario no sustituye controles de acceso, validación de herramientas ni revisión humana.
- Solo cubre inglés e italiano; mensajes en otros idiomas pueden clasificarse de forma errónea.
- Tasa de falsas alarmas del 2,9% en ataques del arena y 1,4% en conjuntos públicos: en producción esto implica bloquear consultas legítimas y requiere un flujo de revisión o apelación.
- Recall no perfecto (97,8% y 99,6%): una fracción de ataques pasa el filtro; la evaluación se realizó sobre conjuntos held-out del mismo dominio de entrenamiento, por lo que el rendimiento en ataques nuevos y no vistos puede ser inferior.
- Entrenado con datos sintéticos y conjuntos públicos; puede presentar sesgos heredados del modelo base Qwen3.5-0.8B y de los datasets de terceros.
- Riesgo de alucinación en el formato de salida: al ser un modelo generativo, podría producir respuestas distintas de `ATTACK` o `SAFE`; conviene validar estrictamente la salida en el pipeline.
- No se documentan longitud de contexto, cuantizaciones ni latencia, lo que dificulta planificar el despliegue sin pruebas propias.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene sus propios términos que deben revisarse.
- El prompt de la tarea `guard` está en el repositorio de GitHub, no en la model card; usarlo con un prompt distinto puede degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/223Harsh/alfred-guard-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub (código, evaluación y arena de red team): https://github.com/Harsh223/alfred
- Demo en vivo y arena: https://alfred.harsh.one
- deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- jackhhao/jailbreak-classification: https://huggingface.co/datasets/jackhhao/jailbreak-classification
- Lakera/gandalf_ignore_instructions: https://huggingface.co/datasets/Lakera/gandalf_ignore_instructions
- reshabhs/SPML_Chatbot_Prompt_Injection: https://huggingface.co/datasets/reshabhs/SPML_Chatbot_Prompt_Injection
