# Cloudflare/clef-flash

## Resumen

Clef-Flash es un modelo multimodal de 9.409.813.744 parámetros desarrollado por Cloudflare, afinado a partir de Qwen/Qwen3.5-9B. Su propósito no es la generación de texto libre, sino convertir un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas en decisiones estructuradas: devuelve una probabilidad para cada opción permitida de cada pregunta en un único forward pass, sin parseo de salida posterior.

El modelo combina el backbone de Qwen3.5-9B (incluido su codificador visual) con una cabeza transformer específica, denominada joint schema head, que enruta la evidencia del estado hacia cada pregunta y puntúa conjuntamente todas las opciones. Soporta tres tipos de pregunta: elección entre criterios, puntuación ordinal y pregunta booleana (noul).

Su relevancia actual reside en que ataca el problema de integrar LLM en pipelines de decisión deterministas: elimina la generación libre y el parseo frágil, expone una API compatible con Jev y SystemOne y puede servirse con SGLang. La licencia es Apache-2.0 y el modelo se publicó en septiembre de 2026, con actualización en noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.5-9B con codificador visual) más joint schema head (cabeza transformer) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 (variante indicada en el cookbook de SGLang); otras no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (backbone fragmentado con índice), safetensors separado para la cabeza (`joint_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-9B, que incluye su codificador de visión, almacenado como safetensors fragmentados estándar. Sobre las representaciones ocultas finales del backbone se aplica una cabeza transformer pequeña (joint schema head) que codifica el esquema de preguntas, enruta la evidencia desde el estado hacia cada pregunta y produce un logit por cada opción permitida de cada pregunta. La salida se interpreta aplicando un softmax por pregunta para obtener probabilidades.

El proceso de post-entrenamiento se describe como "post-train" sobre Qwen3.5-9B, orientado a la tarea image-text-to-typed-output. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. La innovación principal documentada es el propio esquema de decisión conjunta: una sola pasada forward para todas las preguntas y opciones, sin generación de texto ni parseo.

## Capacidades

- Decisión estructurada: devuelve probabilidades por opción para preguntas de tipo `choice`, `score` (escala ordinal con leyenda) y `noul` (probabilidad de verdadero).
- Entrada multimodal: acepta estado en texto, JSON, imágenes (PIL) y vídeo (arrays de fotogramas), y permite mezclar registros de solo texto y multimodales en el mismo lote.
- Puntuación conjunta: todas las preguntas y opciones se puntúan en un único forward pass, lo que permite modelar dependencias entre preguntas del mismo esquema.
- Salida tipada sin parseo: no hay generación de texto libre; la salida es directamente consumible por sistemas posteriores.
- Compatibilidad de API: interfaz compatible con Jev y SystemOne (`POST /v1/systemone`), con respuestas que incluyen `answers`, `confidence`, `probabilities`, `legend` y `usage`.
- Instrucciones opcionales por pregunta (`instructions`) y criterios por opción.
- Servido con SGLang mediante la imagen `lmsysorg/sglang:dev-clef`.
- No se documentan tool calling, function calling, razonamiento multi-paso ni modo thinking en la información disponible.

## Casos de uso

- Clasificación de tickets de soporte: con preguntas `choice` para departamento (facturación, técnico) y `noul` para detectar caídas de servicio, el modelo devuelve probabilidades que permiten enrutar automáticamente con umbral de confianza configurable.
- Triaje de urgencia: una pregunta `score` con leyenda ("puede esperar", "esta semana", "hoy") produce una puntuación esperada y su confianza, útil para priorizar colas de atención.
- Procesamiento de facturas y recibos: combinando estado JSON (proveedor, importe, moneda, estado) e imágenes del documento, se responden preguntas booleanas como si el total es legible o si supera un umbral.
- Moderación y cumplimiento: esquemas de preguntas tipadas sobre texto o imágenes permiten obtener decisiones auditables con distribuciones de probabilidad, en lugar de texto libre difícil de validar.
- Enrutamiento en agentes: el modelo actúa como componente de decisión dentro de un pipeline mayor, eligiendo la siguiente acción o herramienta a partir de un estado estructurado, sin necesidad de parsear la salida.
- Inspección de vídeo: con arrays de fotogramas como entrada, se pueden responder preguntas booleanas o de elección sobre eventos observados en el vídeo.
- Evaluación de riesgo en mensajes de clientes: preguntas `noul` sobre urgencia o criticidad permiten puntuar mensajes entrantes de forma masiva y por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente enlaza al leaderboard Decision Index (clef-evals.workers-ai-mle.workers.dev) sin incluir cifras.

## Requisitos de hardware

- Inferencia probada en una única GPU H200 con bf16, usando `torch` 2.11 y `transformers` 5.10.2.
- El cookbook de SGLang incluye comandos de despliegue para H200, B200 y B300 en un solo nodo.
- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 19,1 GB, lo que da una referencia del orden de magnitud en bf16 (backbone más cabeza y codificador visual).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Despliegue: SGLang (imagen `lmsysorg/sglang:dev-clef`) y uso directo con `transformers` mediante `load_release_model`; requiere `pillow` para imagen y vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clef-Flash | 9.409.813.744 | No disponible | Probabilidades por opción tipada | Apache-2.0 | Hugging Face, SGLang |
| Qwen/Qwen3.5-9B (modelo base) | 9B (aproximado) | No disponible | Texto generativo libre | No disponible en la información | Hugging Face |
| Cloudflare/clef (variante mayor) | No disponible | No disponible | Probabilidades por opción tipada | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto libre: no es adecuado para tareas de redacción, resumen o conversación abierta.
- La salida está restringida al esquema de preguntas y opciones definido por el usuario; preguntas mal formuladas o criterios ambiguos degradan la calidad de la decisión.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática; los idiomas soportados figuran como no disponibles.
- La longitud de contexto no está publicada, lo que dificulta planificar estados de gran tamaño.
- El soporte de cuantización documentado se limita a bf16; no se confirman GGUF, GPTQ ni AWQ.
- Requiere código personalizado (`joint_schema_model.py`) y versiones concretas de `torch` y `transformers`; la integración estándar de `transformers` no cubre la cabeza de decisión.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B.
- El despliegue probado se limita a GPU de datacenter (H200, B200, B300); no hay evidencia de funcionamiento en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cloudflare/clef-flash
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante mayor Clef: https://huggingface.co/Cloudflare/clef
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Cookbook de SGLang para Clef: https://docs.sglang.io/cookbook/autoregressive/Cloudflare/clef
