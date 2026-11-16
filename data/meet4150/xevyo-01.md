# meet4150/xevyo-01

## Resumen

xevyo-01 es un modelo especializado en planificación de turnos conversacionales, desarrollado por el equipo de Xevyo como un fine-tune de Qwen/Qwen3.5-9B. No es un modelo generativo de respuestas: su función es leer un turno de chat y devolver un objeto JSON que describe qué debe hacer el asistente antes de que otro modelo redacte la respuesta final. El plan cubre nivel de seguridad, necesidad de imagen o documento, reescritura de la pregunta para eliminar dependencias del historial, búsqueda web con consultas concretas, consultas de medicamentos, calculadora, comandos de memoria, ruta de dominio, herramientas a invocar y notas de estilo.

El modelo se construyó mediante fine-tuning supervisado con LoRA (posteriormente fusionado en los pesos base) sobre Qwen3.5-9B, una arquitectura transformer con capacidades multimodales heredadas del modelo original. El checkpoint contiene 9.653.104.368 parámetros en bfloat16 (19,7 GB en el repositorio) e incluye los pesos de visión del modelo base, aunque el propio modelo se sirve en modo solo-texto mediante `--language-model-only`. La longitud de contexto operativa recomendada es de 8.192 tokens.

Su relevancia radica en el patrón de orquestación: separar la planificación (estructurada, determinista, con esquema JSON validable) de la generación de respuestas (a cargo de un modelo distinto). Esto permite auditar decisiones del asistente, imponer políticas de seguridad antes de responder y encadenar herramientas sin que el modelo generativo tenga que razonar sobre su propia orquestación. El modelo está pensado para el asistente sanitario y general de Xevyo, con soporte para inglés, hinglish, hindi (devanagari) y español.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B), fine-tune LoRA fusionado |
| Parámetros totales | 9.653.104.368 (9,04 B usados en bfloat16) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (configuración recomendada en vLLM) |
| Tipos de cuantización | No disponible (el autor solo publica bfloat16; el modelo base admite cuantizaciones estándar) |
| Idiomas soportados | Inglés, hinglish, hindi (devanagari), español |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 19,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), un transformer de 9.000 millones de parámetros con pesos de visión heredados que xevyo-01 conserva en el checkpoint pero no utiliza en inferencia (se sirve con `--language-model-only`). El fine-tune se realizó con LoRA supervisado y se fusionó en los pesos base, de modo que el artefacto final es un modelo denso estándar sin adaptadores separados.

La innovación técnica principal no está en la arquitectura sino en el contrato de salida: el modelo genera un único objeto JSON conforme al esquema `xv01.1` (`prompt/turn_plan.schema.json`), con campos que solo se emiten cuando difieren de su valor por defecto, lo que produce planes típicos de unos 40 tokens. El entrenamiento se apoya en un formato de prompt exacto y rígido (bloque `RECENT CHAT` + `TURN` + `MESSAGE`) que el autor advierte que debe respetarse para no degradar la precisión. La decodificación estructurada se fuerza con `--reasoning-parser qwen3` y un esquema JSON específico para vLLM (`prompt/turn_plan.vllm.schema.json`). No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Planificación de turnos conversacionales con salida JSON estructurada y validable contra esquema.
- Clasificación de seguridad con cuatro niveles: `none`, `medication_risk`, `possible_emergency`, `possible_crisis`.
- Detección de intención multimodal: acciones de imagen `none`, `generate`, `edit`, `analyze`, con prompt, texto visible e instrucción.
- Clasificación de tipo de petición: `chat` o `document`, con formatos `pdf`, `docx`, `xlsx`, `pptx`.
- Generación de preguntas de aclaración (`clarify`) cuando la petición es ambigua.
- Reescritura de la pregunta a formato autónomo (`standalone_question`) eliminando dependencias del historial.
- Planificación de búsqueda web con 1-3 consultas concretas (`search_queries`).
- Selección de herramientas de datos: `calc`, `bmi`, `dose`, `barcode`, `usda`, `food`.
- Consulta de medicamentos (`drug.names`, `drug.wants_research`).
- Gestión de memoria: `remember`, `forget`, `recall`, con tipo y contenido.
- Enrutamiento de dominio: `general`, `medical`, `coding`, `personal_memory`, `prompt_authoring`.
- Planificación de profundidad: `quick`, `normal`, `deep`, `research`.
- Emisión ordenada de llamadas a herramientas con argumentos, restringidas al catálogo ofrecido en el prompt.
- Aplicación de directivas de estilo y seguridad mediante identificadores (`directives`).
- Soporte multilingüe en inglés, hinglish, hindi y español.
- No genera respuestas al usuario: su única salida es el plan JSON.

## Casos de uso

- Orquestación de asistentes sanitarios: el modelo clasifica cada turno como `medical` o `general`, detecta `medication_risk` o `possible_emergency` y activa directivas de seguridad antes de que el modelo generativo responda, lo que permite bloquear o matizar respuestas potencialmente peligrosas.
- Enrutamiento previo a búsqueda web: ante preguntas que requieren información actualizada, emite entre una y tres consultas concretas en `search_queries`, evitando que el modelo generativo formule búsquedas inconsistentes o redundantes.
- Gestión de memoria conversacional: interpreta comandos como "recuerda que soy alérgico a la penicilina" y los traduce a `memory.action=remember` con `memory_type` y `content`, lo que permite persistir hechos del usuario de forma estructurada y auditable.
- Atención al cliente con derivación a herramientas: cuando el usuario pide un cálculo de IMC, una dosis o información nutricional, el plan incluye la herramienta adecuada (`bmi`, `dose`, `usda`, `food`) con argumentos ya extraídos, lo que reduce errores de extracción en el modelo generativo.
- Procesamiento de documentos adjuntos: clasifica la petición como `document` con formato `pdf`, `docx`, `xlsx` o `pptx`, lo que permite enrutar el turno a un pipeline de extracción distinto del de chat.
- Reescritura de preguntas de seguimiento: convierte "¿y su capitán?" en una pregunta autónoma ("¿Quién fue el capitán de Australia en la final del Mundial de Críquet masculino de 2023?") que puede enviarse a un buscador sin arrastrar el historial.
- Moderación y triaje en chats de salud mental: la clasificación `possible_crisis` permite activar protocolos de derivación antes de generar cualquier respuesta, con independencia del modelo que redacte.
- Generación y edición de imágenes asistidas: decide si el turno requiere `generate`, `edit` o `analyze` y prepara el prompt y la instrucción para el modelo de imagen, separando la decisión de la ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de latencia: 0,40 s de mediana y 0,62 s de percentil 90 por plan en una fracción de H100 con vLLM, con aproximadamente 1.600 tokens de prompt.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 19-20 GB solo para pesos, más overhead de caché KV; una GPU de 24 GB o más es suficiente según el autor.
- GPU recomendadas: H100 (referencia de latencia del autor), A100 40/80 GB, L40S, RTX 4090 (24 GB, al límite).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con contexto moderado; en GPUs de 16 GB requeriría cuantización, no publicada por el autor.
- Opciones de despliegue: vLLM >= 0.17.0 con `--language-model-only`, `--enable-prefix-caching`, `--mamba-cache-mode align` y `--reasoning-parser qwen3`; el servidor es compatible con la API de OpenAI. No se documentan despliegues con llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,40 s mediana y 0,62 s p90 por plan en una fracción de H100 con vLLM y ~1.600 tokens de prompt. Solo 8 de las 32 capas mantienen caché por token, lo que abarata los prompts largos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de planificación de turnos con salida JSON estructurada. La comparación más directa es con el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Función | Licencia |
|---|---|---|---|---|
| xevyo-01 | 9,04 B | 8.192 | Planificador JSON de turnos | Apache 2.0 |
| Qwen/Qwen3.5-9B | 9 B | No disponible | Modelo generativo generalista multimodal | Apache 2.0 |
| Alternativas de planificación | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo no responde al usuario: cualquier uso que espere texto conversacional directo fallará por diseño.
- La precisión depende críticamente de respetar el formato exacto de prompt (`prompt/system_prompt.txt`, bloque `RECENT CHAT`/`TURN`/`MESSAGE`, límites de 500/600/2.000 caracteres y recorte a 1.500 + 500). Desviarse del formato degrada la calidad del plan.
- Los planes solo pueden invocar herramientas presentes en el catálogo ofrecido en el prompt; herramientas no listadas no serán seleccionadas.
- Riesgo de alucinación en campos como `standalone_question` o `search_queries`: el plan puede contener reformulaciones o consultas que no reflejen fielmente la intención original, por lo que conviene validarlas contra el esquema y, en producción, contra políticas adicionales.
- La clasificación de seguridad (`possible_emergency`, `possible_crisis`) es un componente de triaje, no un sustituto de revisión humana ni de protocolos clínicos.
- Idiomas limitados a inglés, hinglish, hindi y español; el rendimiento en otras lenguas no está documentado.
- El checkpoint incluye pesos de visión no utilizados, lo que infla el tamaño del repositorio (19,7 GB) sin aportar capacidad multimodal en el modo de despliegue recomendado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta garantías ni evaluación independiente; el modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria.
- No se han publicado datos sobre sesgos, composición del dataset de entrenamiento ni evaluaciones de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/meet4150/xevyo-01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Esquema del plan (`prompt/turn_plan.schema.json`): https://huggingface.co/meet4150/xevyo-01/blob/main/prompt/turn_plan.schema.json
- Esquema para vLLM (`prompt/turn_plan.vllm.schema.json`): https://huggingface.co/meet4150/xevyo-01/blob/main/prompt/turn_plan.vllm.schema.json
- Prompt de sistema (`prompt/system_prompt.txt`): https://huggingface.co/meet4150/xevyo-01/blob/main/prompt/system_prompt.txt
- Directivas (`prompt/directives.json`): https://huggingface.co/meet4150/xevyo-01/blob/main/prompt/directives.json
- Catálogo de herramientas (`prompt/tools.json`): https://huggingface.co/meet4150/xevyo-01/blob/main/prompt/tools.json
- Ejemplos (`examples/examples.jsonl`, `examples/rendered_request.json`): https://huggingface.co/meet4150/xevyo-01/tree/main/examples
