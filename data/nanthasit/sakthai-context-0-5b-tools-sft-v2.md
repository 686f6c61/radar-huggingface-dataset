# Nanthasit/sakthai-context-0.5b-tools-sft-v2

## Resumen

El modelo `Nanthasit/sakthai-context-0.5b-tools-sft-v2` es una versión afinada mediante aprendizaje supervisado (SFT) del modelo base `Nanthasit/sakthai-context-0.5b-tools`, un pequeño modelo de lenguaje de 0,5 mil millones de parámetros orientado al uso de herramientas (tool calling) y a la ejecución de agentes conversacionales en entornos de bajos recursos. El autor, Nanthasit, desarrolla la familia "Sakthai" para ofrecer modelos ligeros que puedan ejecutarse en dispositivos como Raspberry Pi o hardware de borde, con un contexto largo de hasta 32 000 tokens según fuentes externas.

Este fine-tune se ha entrenado con el framework TRL (Transformers Reinforcement Learning) sobre un conjunto de datos de conversaciones multi-turno con herramientas, con el objetivo de mejorar la consistencia en el seguimiento de instrucciones y el formato de salida JSON/XML. Aunque el repositorio no incluye métricas ni detalles de entrenamiento, el modelo se presenta como una opción viable para aplicaciones de asistencia conversacional y automatización ligera donde el coste computacional es crítico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base sugiere Qwen2, sin confirmar) |
| Parámetros totales | 0,5 mil millones (según el nombre del modelo) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | 32 000 tokens (según llm-explorer.com, no confirmado en la ficha oficial) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el ejemplo de uso está en inglés) |
| Licencia | no disponible (el README indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información oficial no detalla la arquitectura interna del modelo. El modelo base `sakthai-context-0.5b-tools` presenta etiquetas que hacen referencia a Qwen2 y Qwen2.5, por lo que es plausible que esta variante SFT herede una arquitectura transformer estándar de tipo Qwen, pero no se puede confirmar con los datos disponibles. El entrenamiento se realizó mediante supervisión directa (SFT) con la librería TRL, sobre un conjunto de datos de más de 2965 ejemplos de diálogos multi-turno con herramientas, según la descripción de FriendliAI. No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto en formato conversacional, con soporte de mensajes de sistema y usuario.
- Tool calling y function calling: el modelo está especializado en la invocación de herramientas externas, con salidas en JSON o XML.
- Manejo de diálogos multi-turno con contexto largo (32K), útil para agentes que mantienen conversaciones extensas.
- Orientado a despliegue en entornos de bajos recursos, como dispositivos de borde (Raspberry Pi, etc.).
- No se dispone de información sobre capacidades de visión, audio o razonamiento avanzado.

## Casos de uso

- Asistentes conversacionales en dispositivos embebidos: el modelo puede ejecutarse en una Raspberry Pi con 1 GB de VRAM, lo que permite desplegar asistentes locales que gestionen diálogos con herramientas sin depender de la nube.
- Agentes de automatización de tareas: gracias a su capacidad de tool calling, puede integrarse en flujos que requieren consultar APIs, bases de datos o ejecutar acciones específicas (por ejemplo, control de domótica).
- Chatbots de atención al cliente en entornos con restricciones de hardware: su contexto de 32K permite mantener conversaciones largas y recordar interacciones previas, aunque su tamaño reducido limita la complejidad de las respuestas.
- Prototipado rápido de aplicaciones de lenguaje: al ser pequeño y ligero, es adecuado para pruebas de concepto en entornos de desarrollo sin GPU dedicada.
- Procesamiento de formularios y extracción de datos estructurados: la salida en JSON/XML facilita la integración con sistemas de automatización.
- Entrenamiento adicional en tareas específicas: al ser un modelo pequeño, puede afinarse con recursos limitados para dominios concretos (por ejemplo, atención médica básica o educación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas comparativas.

## Requisitos de hardware

- VRAM estimada: alrededor de 1 GB para inferencia con cuantización (según llm-explorer.com).
- GPU recomendadas: no se especifican modelos concretos, pero el tamaño permite ejecución en CPU y GPUs de gama baja como NVIDIA Jetson o Raspberry Pi con aceleradores.
- Compatible con hardware de borde: el modelo está etiquetado como "edge", "lightweight" y "low-resource", por lo que puede ejecutarse en dispositivos con poca memoria.
- Opciones de despliegue: al ser un modelo de la familia transformers, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se han publicado guías específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos suficientes. El modelo comparte categoría con otros SLM de 0,5B como Qwen2.5-0.5B-Instruct, pero no se han encontrado evaluaciones directas. La comparativa queda pendiente de datos oficiales.

## Limitaciones y advertencias

- Al ser un modelo de 0,5B, su capacidad de razonamiento complejo y conocimiento general es limitada; es adecuado para tareas específicas de herramientas y diálogos simples.
- No se ha publicado información sobre sesgos o alucinaciones; se recomienda validar las salidas en aplicaciones críticas.
- La licencia no está especificada, por lo que el uso comercial es incierto hasta que el autor aclare los términos.
- No hay confirmación oficial del contexto de 32K; la cifra proviene de un directorio externo y podría variar.
- El modelo no ha sido evaluado en español; el ejemplo de uso está en inglés y no se garantiza soporte multilingüe.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Nanthasit/sakthai-context-0.5b-tools-sft-v2
- Modelo base: https://huggingface.co/Nanthasit/sakthai-context-0.5b-tools
- Ficha en llm-explorer.com: https://llm-explorer.com/model/Nanthasit%2Fsakthai-context-0.5b-tools,2uRR58vkfEN1si4EHjSpZj
- Página en FriendliAI: https://friendli.ai/models/Nanthasit/sakthai-context-0.5b-tools-sft-v2
- Repositorio TRL (framework de entrenamiento): https://github.com/huggingface/trl
