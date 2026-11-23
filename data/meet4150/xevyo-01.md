# meet4150/xevyo-01

## Resumen
xevyo-01 es un modelo especializado en planificación de turnos conversacionales (turn planner) desarrollado por el equipo Xevyo para su asistente de salud y propósito general. No responde al usuario directamente: lee un turno de chat y devuelve un objeto JSON con el plan de acción que un segundo modelo ejecutará después. Es un fine-tune de Qwen/Qwen3.5-9B (Apache 2.0) mediante LoRA supervisado fusionado en los pesos base.

El modelo resuelve un problema de orquestación: decide el nivel de seguridad, si hace falta imagen, documento o respuesta de chat, reescribe la pregunta para que sea autónoma, determina si hay que buscar en la web y con qué consultas, activa herramientas de cálculo o consulta de fármacos, gestiona comandos de memoria, selecciona la ruta y las herramientas a invocar, y añade notas de estilo. Todo ello en un único objeto JSON con formato `xv01.1` que la capa de respuesta consume.

Esta es la ronda 4 (19 de noviembre de 2026), con la ronda 3 aún disponible como revisión `r3`. El checkpoint pesa 19,3 GB en bfloat16 (9,04 B parámetros usados, más los pesos de visión del modelo base no utilizados). El contexto de entrenamiento cubre los últimos 8 mensajes, o hasta 24 mensajes dentro de 12.000 caracteres en la variante "agent".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, con capas de atención híbrida; solo 8 de 32 capas mantienen caché por token) |
| Parámetros totales | 9.653.104.368 (9,04 B usados en bfloat16) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Últimos 8 mensajes, o hasta 24 mensajes dentro de 12.000 caracteres (ambas variantes entrenadas); servido con `--max-model-len 8192` |
| Tipos de cuantización | no disponible (entrenado y servido en bfloat16) |
| Idiomas soportados | Inglés, hinglish, hindi (devanagari), español |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
xevyo-01 parte de Qwen/Qwen3.5-9B en la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`. La arquitectura es la del modelo base: un transformer con atención híbrida en el que solo 8 de las 32 capas conservan caché por token, lo que abarata los prompts largos. El checkpoint incluye los pesos de visión del modelo base aunque el uso principal sea texto; el servidor se lanza con `--language-model-only`.

El ajuste se realizó mediante LoRA supervisado (SFT) fusionado en los pesos base. El modelo aprende un formato de prompt exacto (system prompt con lista de directivas y catálogo de herramientas, más un bloque de usuario con historial reciente, flags de adjuntos, memoria, sesión, locale y mensaje) y produce un JSON con el esquema `xv01.1`. Los campos que quedan en su valor por defecto se omiten, por lo que la mayoría de planes rondan los 40 tokens. El repositorio incluye el código de renderizado, validación, reglas duras, esquema de servicio, entrenamiento y puntuación en `code/`.

## Capacidades
- Planificación de turnos conversacionales: devuelve un único objeto JSON por turno con el esquema `xv01.1`.
- Clasificación de seguridad: `none`, `medication_risk`, `possible_emergency`, `possible_crisis`.
- Decisión sobre imagen: `none`, `generate`, `edit`, `analyze`, con prompt, texto visible e instrucción.
- Distinción entre respuesta de chat y generación de documento (`pdf`, `docx`, `xlsx`, `pptx`).
- Reformulación autónoma de la pregunta (`standalone_question`) para eliminar dependencia del historial.
- Planificación de búsqueda web con 1-3 consultas.
- Selección de herramientas de datos: `calc`, `bmi`, `dose`, `barcode`, `usda`, `food`.
- Búsqueda de fármacos (`names`, `wants_research`).
- Comandos de memoria: recordar, olvidar, recuperar, con tipo y contenido.
- Enrutado por dominio (`general`, `medical`, `coding`, `personal_memory`, `prompt_authoring`) y profundidad (`quick`, `normal`, `deep`, `research`).
- Emisión ordenada de llamadas a herramientas con argumentos, restringidas al catálogo ofrecido en el prompt.
- Directivas de estilo o seguridad para el modelo que redacta la respuesta.
- Multilingüe en inglés, hinglish, hindi y español.
- No genera respuestas al usuario: su salida es siempre un plan.

## Casos de uso
- Orquestación de un asistente de salud: el modelo clasifica el turno como `medication_risk` o `possible_emergency` antes de que se genere cualquier respuesta, activando directivas de seguridad adecuadas; es adecuado porque la decisión se toma en una llamada de ~0,38 s de mediana.
- Enrutado de consultas médicas a herramientas de cálculo: ante preguntas de dosis o IMC, emite `data_tool: dose` o `bmi` con los argumentos necesarios, evitando que el modelo generador improvise cálculos.
- Reformulación de preguntas de seguimiento: convierte "¿y su capitán?" en "¿Quién fue el capitán de Australia en la final del Mundial de Críquet masculino de 2023?" para que un motor de búsqueda o un modelo sin historial pueda responder.
- Planificación de búsqueda web: decide `needs_search` y emite hasta 3 consultas concretas, lo que permite desacoplar la recuperación de información de la generación de la respuesta.
- Gestión de memoria de usuario: detecta peticiones de recordar, olvidar o recuperar información personal y las estructura con tipo y contenido, integrándose en un almacén de memoria externo.
- Generación de documentos: identifica cuándo el usuario quiere un PDF, DOCX, XLSX o PPTX y lo marca como `request_kind: document` con `doc_format`, activando el pipeline de generación de documentos.
- Atención al cliente multilingüe: soporta inglés, hinglish, hindi y español, con contexto de hasta 24 mensajes en 12.000 caracteres en la ventana "agent", suficiente para conversaciones multi-turno con historial extenso.
- Enrutado de dominio en pipelines de agentes: clasifica el turno en `general`, `medical`, `coding`, `personal_memory` o `prompt_authoring` con profundidad `quick`/`normal`/`deep`/`research`, lo que permite seleccionar el modelo o la cadena de herramientas adecuada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de latencia: 0,38 s de mediana y 0,60 s de p90 por plan en una porción de una H100 con vLLM y ~1.600 tokens de prompt.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 20 GB en bfloat16 (pesos de 19,3 GB más overhead de caché y activaciones); una GPU de 24 GB o más es suficiente según el autor.
- GPU recomendadas: H100 (referencia de latencia reportada), A100 40/80 GB, L40S, RTX 4090 (24 GB) para uso individual.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o GPUs con al menos 24 GB en bfloat16; no se documentan cuantizaciones alternativas.
- Opciones de despliegue: vLLM >= 0.17.0 (recomendado, servidor compatible con OpenAI) con flags `--dtype bfloat16 --max-model-len 8192 --language-model-only --enable-prefix-caching --mamba-cache-mode align --reasoning-parser qwen3 --generation-config vllm`. No se documentan despliegues con llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,38 s de mediana y 0,60 s de p90 por plan en una porción de H100 con vLLM y ~1.600 tokens de prompt. Solo 8 de 32 capas mantienen caché por token, lo que reduce el coste de prompts largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xevyo-01 | 9,04 B usados (9,65 B totales) | 8 mensajes / 24 mensajes en 12.000 caracteres | Planificador de turnos (JSON) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B | 9 B (aprox.) | no disponible en la información proporcionada | Modelo generativo generalista | Apache 2.0 | Hugging Face |
| Alternativas de planificación/orquestación | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros planificadores comparables en la información proporcionada.

## Limitaciones y advertencias
- El modelo no responde al usuario: cualquier uso que espere texto dirigido al usuario final fallará; su salida es exclusivamente un plan JSON.
- La precisión depende críticamente de reproducir el formato exacto de prompt (system prompt con `{directive_list}` y `{tool_catalogue}` sustituidos, y bloque de usuario con el formato documentado); desviarse de él degrada el rendimiento.
- Las llamadas a herramientas solo pueden referirse a herramientas ofrecidas en el prompt con `"plannable": true`; el modelo no inventa herramientas fuera del catálogo, pero el integrador debe validar la salida.
- El contexto de entrenamiento está limitado a 8 mensajes (o 24 dentro de 12.000 caracteres en la ventana "agent"); historiales más largos quedan fuera del régimen entrenado.
- Idiomas soportados limitados a inglés, hinglish, hindi y español; no se documenta cobertura de otras lenguas.
- Riesgo de alucinación en los campos del plan (por ejemplo, consultas de búsqueda o reformulaciones) no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B también es Apache 2.0 según la información disponible; conviene verificar los términos del modelo base y de los datos de entrenamiento del fine-tune.
- El checkpoint incluye pesos de visión no utilizados; servir con `--language-model-only` para evitar consumo innecesario de memoria.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ); el despliegue en hardware limitado requeriría cuantización no validada por el autor.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/meet4150/xevyo-01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del modelo (código en `code/`, esquema en `prompt/turn_plan.schema.json`, ejemplos en `examples/examples.jsonl`): https://huggingface.co/meet4150/xevyo-01/tree/main
- Revisión r3 (ronda 3): https://huggingface.co/meet4150/xevyo-01/tree/r3
