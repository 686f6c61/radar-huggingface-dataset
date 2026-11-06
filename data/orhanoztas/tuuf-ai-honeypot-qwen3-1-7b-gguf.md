# OrhanOztas/tuuf-ai-honeypot-qwen3-1.7b-GGUF

## Resumen

Tuuf AI Honeypot es un modelo señuelo de 1.720.574.976 parámetros (1,7B) derivado de Qwen/Qwen3-1.7B mediante QLoRA SFT con Unsloth, publicado en formato GGUF Q4_K_M (aproximadamente 1,1 GB) por el usuario OrhanOztas. No es un asistente de propósito general: es un artefacto de investigación diseñado para interpretar el papel de "Sepetly Ops Assistant", un asistente interno de operaciones de una SaaS ficticia de comercio electrónico turca llamada Sepetly, dentro del honeypot de LLM y agentes de IA Tuuf AI Honeypot.

El modelo existe para atraer a atacantes humanos y a agentes de IA hostiles y hacer que revelen sus técnicas: inyección de prompts, extracción del system prompt, intentos de exfiltración de datos, ejecución remota de comandos y jailbreaks. Todas las herramientas a las que el modelo aparenta tener acceso (consulta de pedidos y clientes, SQL de solo lectura, shell con allowlist, S3) son falsas, respaldadas por una base de datos SQLite sintética, un shell simulado y secretos canary.

Su relevancia es acotada pero específica: cubre un nicho poco explorado, el de la decepción defensiva con modelos pequeños desplegables en hardware mínimo (el autor lo ejecuta en un servidor llama.cpp sobre una sola vCPU a unos 2 tokens/s). La licencia Apache 2.0 y el formato GGUF facilitan su replicación en entornos de investigación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), fine-tuning QLoRA sobre Qwen/Qwen3-1.7B |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de entrenamiento; el runtime del honeypot usa `-c 2048`) |
| Tipos de cuantizacion | GGUF Q4_K_M (única publicada, ~1,1 GB) |
| Idiomas soportados | Turco (principal), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only de la familia Qwen3, y se entrena mediante QLoRA SFT con Unsloth: rango 16, alpha 32, adaptadores en todas las proyecciones de atención y MLP, learning rate 2e-4 con scheduler coseno, 2 épocas y longitud máxima de 2048 tokens. El resultado se exporta a GGUF Q4_K_M.

El conjunto de datos de entrenamiento es sintético y se genera con `training/gen_dataset.py` del repositorio del honeypot. Las salidas de las herramientas provienen de la misma base de datos falsa que el honeypot usa en tiempo de ejecución, de modo que las respuestas del modelo son coherentes con lo que devuelven las herramientas. La mezcla cubre preguntas operativas normales con llamadas correctas a herramientas, inyección de prompts y extracción del system prompt (respondidas con un system prompt señuelo), intentos de exfiltración de datos, intentos de shell/RCE (respuestas limitadas a la allowlist), peticiones dañinas (rechazadas en personaje) y conversación fuera de tema. No se emplearon datos reales de clientes ni secretos reales. No se documenta el uso de RLHF o DPO.

El modelo se entrenó con el system prompt y el esquema de herramientas específicos del honeypot; sin ellos se comporta como un Qwen3-1.7B ligeramente ajustado. El autor advierte que, cuando hay herramientas presentes, no debe desactivarse el modo thinking con `enable_thinking=False`, ya que en sus pruebas eso impedía que Qwen3 generase llamadas a herramientas.

## Capacidades

- Generación de texto conversacional en turco e inglés, con registro de asistente interno de operaciones.
- Llamadas a herramientas (tool calling) conforme al esquema del honeypot: consulta de pedidos y clientes, SQL de solo lectura, shell con allowlist y S3.
- Respuestas en personaje ante inyección de prompts y extracción del system prompt, devolviendo un system prompt señuelo.
- Revelación deliberada de señuelos: secretos falsos y registros de clientes ficticios, pensados para funcionar junto con tokens canary y registro de eventos.
- Rechazo en personaje de peticiones dañinas y manejo de conversación fuera de tema.
- Modo thinking nativo de Qwen3 (necesario para producir tool calls según las pruebas del autor).
- No dispone de visión, audio ni capacidades multimodales.

## Casos de uso

- Investigación en decepción y honeypots de LLM: desplegar el modelo como fachada de un stack de IA expuesto para registrar cómo atacan humanos y agentes autónomos, aprovechando que imita un asistente interno con acceso a herramientas.
- Estudio de inyección de prompts en modelos pequeños: analizar qué técnicas logran extraer el system prompt señuelo o redirigir las llamadas a herramientas, con un modelo de 1,7B que cabe en una vCPU.
- Detección de LLMjacking: monitorizar el uso no autorizado de un endpoint aparentemente corporativo y correlacionar los intentos con tokens canary embebidos en las respuestas.
- Evaluación de agentes de IA ofensivos: exponer el modelo a agentes autónomos y observar cadenas de reconocimiento, enumeración de herramientas y exfiltración simulada.
- Investigación sobre jailbreaks multilingües: el autor documenta que atacantes en francés consiguieron que escribiera código ofensivo, lo que permite estudiar la transferencia de jailbreaks a idiomas no entrenados.
- Pruebas de pipelines de seguridad y registro: validar la instrumentación de logs, alertas y canary tokens contra un objetivo controlado y de bajo coste computacional.
- Docencia y formación en seguridad de IA: usar el honeypot como entorno de prácticas donde los alumnos atacan un sistema simulado sin datos ni infraestructura reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta observaciones cualitativas de 14 días de tráfico real contra el honeypot (22 de octubre a 4 de noviembre de 2026) y un rendimiento en producción de aproximadamente 2 tokens/s en una sola vCPU con llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa aproximadamente 1,1 GB; la inferencia completa cabe holgadamente en 2 GB de memoria, incluido el contexto de 2048 tokens.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer con 4 GB o más es suficiente (por ejemplo, RTX 3050, RTX 4060, GTX 1660). También funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; el autor lo ejecuta en CPU con una sola vCPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja -c 2048`), y por formato GGUF es compatible con Ollama y otros runners basados en llama.cpp. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: aproximadamente 2 tokens/s en una sola vCPU según el autor; no se han publicado cifras para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Formato |
|---|---|---|---|---|---|
| Tuuf AI Honeypot (Qwen3-1.7B) | 1,72B | 2048 | Señuelo para honeypot de LLM/agentes | Apache 2.0 | GGUF Q4_K_M |
| Qwen/Qwen3-1.7B | 1,72B | no disponible en la información proporcionada | Asistente generalista con tool calling y thinking | Apache 2.0 | safetensors, GGUF |
| Modelos señuelo de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con su modelo base: el honeypot hereda la arquitectura y el tamaño de Qwen3-1.7B, pero sustituye el comportamiento generalista por una persona concreta y un esquema de herramientas fijo, y añade respuestas señuelo deliberadas. No se conocen en la información disponible otros modelos señuelo comparables con los que establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No es un asistente de propósito general ni apto para producción: el propio autor lo declara fuera de alcance para atención al cliente, operaciones reales o cualquier uso con datos o herramientas reales.
- Puede ser convencido de escribir código ofensivo: atacantes con personas jailbreak de "operador" en francés lograron que escribiera un one-liner de reverse socket, un escáner de wallets y secretos, y que "arreglara" código keylogger pegado. Rechazó algunas peticiones, pero no todas.
- Sigue pruebas de instrucción simples del tipo "responde exactamente: …", que los atacantes usan para fingerprinting de modelos.
- Filtra su identidad base bajo interrogatorio directo (por ejemplo, nombrando Alibaba Cloud); el system prompt no constituye una frontera de seguridad.
- A veces desvía o trunca los resultados de herramientas en su respuesta final, aunque la llamada haya tenido éxito.
- Entrega señuelos por diseño: revela secretos falsos y registros de clientes ficticios que solo tienen sentido junto con tokens canary y registro de eventos.
- Idiomas limitados a turco e inglés; el comportamiento en otros idiomas no está caracterizado y los jailbreaks en francés ya mostraron fugas.
- Contexto corto (2048 tokens), insuficiente para conversaciones o documentos largos.
- Riesgo de alucinación inherente a un modelo de 1,7B, agravado por el diseño señuelo: las respuestas no deben interpretarse como información veraz.
- Aunque la licencia es Apache 2.0, el uso responsable exige aislar el modelo y no exponerlo a usuarios a los que no se quiera ayudar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OrhanOztas/tuuf-ai-honeypot-qwen3-1.7b-GGUF
- Repositorio del honeypot (código, arquitectura y hallazgos): https://github.com/0qqY/tuuf-ai-honeypot
- Script de generación del dataset: https://github.com/0qqY/tuuf-ai-honeypot/blob/main/training/gen_dataset.py
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Versión Unsloth del modelo base: https://huggingface.co/unsloth/Qwen3-1.7B
