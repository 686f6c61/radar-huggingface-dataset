# ferry-el-kom/qwen3.8-4b-empero-v27-Hermes-agentic-subagent-toolcalls

## Resumen

Qwen3.8-4B-empero-v27-Hermes-agentic-subagent-toolcalls es un ajuste fino (LoRA) de 4.000 millones de parámetros orientado específicamente al uso como subagente dentro del arnés Hermes. Lo publica el usuario ferry-el-kom sobre el modelo base Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2, que a su vez es una destilación de razonamiento al estilo Claude sobre la familia Qwen3.5. La versión v27 no busca mejorar capacidades generales, sino corregir modos de fallo observados al ejecutar la v26b como agente real: informes de éxito confabulados, entregables escritos fuera del directorio de trabajo, fabricación de entradas cuando falla la resolución de rutas y falta de cumplimiento de condiciones de parada.

El modelo se distribuye en formato GGUF (q8_0 y q4_K_M) con el tokenizador y la plantilla de chat embebidos, y está pensado para servir en local con LM Studio, Ollama o llama.cpp. Su licencia MIT y su reducido tamaño lo hacen atractivo para orquestaciones de agentes con múltiples subagentes en hardware de consumo, aunque la ausencia de benchmarks publicados y de un README con especificaciones formales obliga a tratarlo como un artefacto experimental.

La relevancia actual radica en el enfoque: entrenamiento conductual sobre ventanas de corrección (480 ventanas en 5 familias) en lugar de ampliación de conocimiento, una práctica cada vez más común para convertir modelos pequeños en componentes fiables de pipelines agénticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con capa MTP/nextn para decodificación especulativa |
| Parametros totales | 4B (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como valor oficial; la model card menciona funcionamiento con caché KV q8_0 a 72k+ tokens en 8 GB de VRAM |
| Tipos de cuantizacion | q8_0 (4,29 GiB) y q4_K_M (2,59 GiB) publicados; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (el dataset incluye correcciones de comprensión de rumano, lo que sugiere cobertura multilingüe parcial) |
| Licencia | MIT |
| Formato de pesos | GGUF (tokenizador y plantilla de chat embebidos); safetensors no disponible en la información |

## Arquitectura y entrenamiento

El modelo parte de Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2, una destilación de razonamiento sobre la arquitectura Qwen3.5 de 4B parámetros. Sobre esa base se aplica un LoRA nuevo con r=32 y α=64, entrenado durante 2 épocas y 426 pasos con secuencia de 1280 tokens, learning rate 2e-5, batch de 16 y semilla 5, alcanzando una pérdida final de 0,79. El dataset totaliza 3.401 ventanas: 2.921 normalizadas de la versión v21 más 480 ventanas de corrección conductual.

Las 480 ventanas de corrección se organizan en cinco familias: disciplina de entregables «golden» (195), rituales de flujo de trabajo (75), condiciones de parada (50), correcciones conductuales (130, que cubren parada ante comandos, gestión de timeouts, prioridad de ejecución en primer plano, seguimiento de PID, verificación antes de destruir, versión de Python, confirmación de tareas y comprensión de rumano) y anti-fabricación (30, con reverificación de rutas, solicitud de aclaración e informe de ausencia). Los GGUF contienen 441 tensores, incluida la capa MTP/nextn necesaria para la inferencia de Qwen3.5, que puede desactivarse si no se emplea decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento destilado al estilo de cadenas de pensamiento de Claude, heredado del modelo base.
- Llamada a herramientas (tool calling / function calling), eje central del ajuste fino.
- Comportamiento como subagente dentro de un arnés de orquestación (Hermes), con herencia de directorio de trabajo de sesión recomendada.
- Cumplimiento de condiciones de parada y gestión de timeouts en ejecución de comandos.
- Seguimiento de PID y verificación previa a operaciones destructivas.
- Anti-fabricación: reverificación de rutas, solicitud de aclaración y reporte explícito de ausencias en lugar de inventar entradas.
- Comprensión de rumano en el contexto de las correcciones conductuales entrenadas.
- Decodificación especulativa opcional mediante la capa MTP/nextn.
- Capacidades generales de código y matemáticas: no disponibles de forma verificada (sin benchmarks).

## Casos de uso

- Orquestación multiagente en local: el modelo actúa como subagente especializado en ejecutar subtareas con tool calling dentro de un agente mayor, con un peso de 2,59 GiB en q4_K_M que permite desplegar varias instancias en una sola GPU de consumo.
- Automatización de tareas de sistema con salvaguardas: las correcciones de parada ante comandos, gestión de timeouts y verificación antes de destruir lo hacen adecuado para scripts que operan sobre ficheros y procesos, donde un modelo genérico tendería a ejecutar acciones irreversibles.
- Pipelines de CI/CD con informes fiables: las ventanas anti-fabricación (reverificación de rutas, reporte de ausencia) reducen el riesgo de que el agente declare éxito sin haber producido el artefacto, un fallo crítico en integración continua.
- Asistente de terminal para desarrolladores: con LM Studio u Ollama y una ventana de contexto ampliada mediante caché KV q8_0 (72k+ tokens en 8 GB de VRAM), puede mantener sesiones largas de depuración y edición de código.
- Evaluación de arneses agénticos: sirve como sujeto de prueba controlado para medir disciplina de entregables y cumplimiento de parada en comparación con la v26b y otros finetunes.
- Despliegue en hardware modesto: al caber en 8 GB de VRAM con cuantización q4_K_M, es viable en portátiles y GPUs de gama media para prototipos de agentes sin coste de API.
- Procesamiento de instrucciones multilingües con rumano: las correcciones específicas de comprensión de rumano lo hacen útil en flujos de trabajo que combinan castellano/inglés con contenido en rumano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB para q4_K_M (2,59 GiB de pesos) y unos 5 GB para q8_0 (4,29 GiB), más el espacio de caché KV.
- La model card indica que la caché KV en q8_0 funciona bien a 72k+ tokens de contexto con 8 GB de VRAM.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, cualquier GPU con 8 GB o más (RTX 3060/4060, RTX 4070, etc.) debería alojar el modelo con contexto amplio. A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, con q4_K_M en GPUs de 4-6 GB y con q8_0 en GPUs de 8 GB o más.
- Opciones de despliegue: LM Studio, Ollama y llama.cpp, según la model card. vLLM y TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-4B-empero-v27 (este) | 4B | no disponible (72k+ con KV q8_0) | Subagente Hermes con tool calling y correcciones conductuales | MIT | GGUF en Hugging Face |
| Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2 (base) | 4B | no disponible | Destilación de razonamiento | no disponible | Hugging Face |
| Qwen3.5-4B (modelo original de Alibaba) | 4B | no disponible | Modelo generalista | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente a la v26b ni frente al modelo base; las afirmaciones de la model card son cualitativas.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; no ha pasado por validación comunitaria.
- Riesgo de alucinación persistente: aunque el ajuste incluye 30 ventanas anti-fabricación, un modelo de 4B sigue siendo propenso a confabular en tareas largas o ambiguas.
- Idiomas no declarados formalmente; la cobertura multilingüe más allá del rumano e inglés no está verificada.
- Longitud de contexto oficial no especificada; el dato de 72k+ proviene de una nota de servicio con caché KV q8_0, no de una ficha técnica.
- El comportamiento está optimizado para el arnés Hermes; fuera de ese entorno, las correcciones conductuales pueden no activarse o interferir con otros flujos.
- La licencia MIT permite uso comercial, pero al derivar de Qwen3.5 conviene verificar las condiciones de la licencia del modelo original de Alibaba antes de producción.
- El nombre del modelo («Qwen3.8») no se corresponde con una versión oficial de Qwen; es una denominación del autor y puede generar confusión.

## Enlaces

- Hugging Face: https://huggingface.co/ferry-el-kom/qwen3.8-4b-empero-v27-Hermes-agentic-subagent-toolcalls
- Modelo base: https://huggingface.co/Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2
- Artículo de referencia sobre Hermes Agent + Qwen 3.8: http://go/v1/AayHsHR_XlMCawQ_2AHFwXQW4BjNwWKyyTnkxwI3g2WurRWG3nvYy9eOHqcIUPZSldgkFCZ_dofVxCysBiU_TVtpP9hoWoSJ5GR6ePQMR-ILBYUQvkq1s7zikLy6q1g3-eI72OXFxO8qFubHVzGUZFkzKIjJaGz10sE_sHiJ3I7jqSVTS1D-pLIrwyveh3d2VhSl7eGPNDI_w0955q3OWhw7DfSOEDwBzBJ9Bw
