# Cloudflare/clef

## Resumen

Clef es un modelo multimodal de 27.356.728.560 parámetros (unos 27,36 mil millones) desarrollado por Cloudflare y publicado bajo licencia Apache-2.0. Su función no es generar texto libre, sino convertir un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas en decisiones: devuelve una probabilidad para cada opción permitida de cada pregunta en una única pasada hacia delante, sin generación autoregresiva ni parseo de la salida.

El modelo parte de Qwen/Qwen3.8-27B, incluye su codificador de visión y se ha post-entrenado para una tarea muy concreta: la decisión estructurada. Sobre el backbone se añade una cabeza de esquema conjunta (joint schema head), una pequeña cabeza transformer que lee los estados ocultos finales del backbone, encamina la evidencia del estado hacia cada pregunta y puntúa de forma conjunta todas las opciones de todas las preguntas.

Su relevancia actual está en el nicho de la clasificación y el enrutamiento con salida tipada y probabilística, pensado para integrarse en pipelines automatizados donde se necesita un umbral de confianza y no una respuesta en lenguaje natural. La API del modelo es compatible con Jev y SystemOne, y existe una variante menor y más rápida, Clef-Flash.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen/Qwen3.8-27B con codificador de visión) más cabeza de esquema conjunta (joint schema head) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 16.384 tokens por defecto (`max_length` en `encode_record`); acotable con `max_state_tokens` |
| Tipos de cuantización | No disponible (el repositorio se distribuye en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors fragmentados (`model-*.safetensors` + `model.safetensors.index.json`) y `joint_head.safetensors` para la cabeza |

## Arquitectura y entrenamiento

Clef se construye sobre el backbone Qwen/Qwen3.8-27B y conserva su codificador de visión, almacenado como safetensors fragmentados estándar. Sobre los estados ocultos finales del backbone se sitúa una cabeza de esquema conjunta, descrita en la model card como una pequeña cabeza transformer que encamina la evidencia desde el estado hacia cada pregunta y puntúa simultáneamente todas las opciones de todas las preguntas. La salida es un logit por cada opción permitida; aplicando un softmax por pregunta se obtienen las probabilidades. No hay decodificación autoregresiva ni texto libre, lo que elimina la necesidad de parsear la respuesta.

El modelo es un post-entrenamiento (finetune) del modelo base Qwen/Qwen3.8-27B. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. El código de carga, codificación de registros y batching se distribuye en el propio repositorio mediante `joint_schema_model.py` (funciones `load_release_model`, `encode_record`, `collate_records` y `systemone`), lo que implica que el modelo requiere código personalizado para su uso.

## Capacidades

- Decisión estructurada con esquema tipado: devuelve probabilidades por opción para los tres tipos de pregunta soportados.
- Preguntas de tipo `noul` (verdadero/falso), con la probabilidad de ser verdadero.
- Preguntas de tipo `choice` (opciones con nombre), con un mapa de ID de opción a descripción.
- Preguntas de tipo `score` (opciones ordenadas), con una puntuación esperada, confianza y leyenda.
- Entrada multimodal: acepta `state` como cadena o valor JSON, más listas opcionales de `images` (imágenes PIL) y `videos` (arrays de fotogramas).
- Procesamiento por lotes que mezcla registros de solo texto y multimodales en el mismo batch.
- Compatibilidad de API con Jev y SystemOne mediante la función `systemone`, que acepta y devuelve el mismo cuerpo de petición/respuesta de `POST /v1/systemone` (campos `model`, `answers`, `usage`).
- No realiza generación de texto libre, tool calling, function calling ni razonamiento multi-paso en lenguaje natural según la información disponible.
- Capacidades multilingües: no disponibles (no se listan idiomas en la información proporcionada).

## Casos de uso

- Triaje de tickets de soporte: un mismo registro puede combinar una pregunta `choice` para asignar el equipo (por ejemplo, facturación o técnico), una pregunta `score` para priorizar la urgencia y una `noul` para detectar si hay una caída de servicio. La salida probabilística permite enrutar solo por encima de un umbral de confianza.
- Enrutamiento de mensajes a departamentos: usando el cuerpo del mensaje como `state` y una pregunta `choice` con criterios por departamento, el modelo devuelve la distribución de probabilidad entre equipos, lo que habilita colas de revisión manual para los casos ambiguos.
- Procesamiento de facturas y recibos con visión: adjuntando la imagen en el campo `images` y formulando preguntas `noul` o `choice` (por ejemplo, si el total es legible o si la factura está pagada), se obtiene una decisión tipada sin necesidad de OCR ni de parseo posterior.
- Clasificación y moderación de contenido con esquema fijo: definir un `choice` con las categorías permitidas y umbral de confianza por categoría, aprovechando que la salida es una probabilidad por opción y no texto libre.
- Puntuación de riesgo o severidad: con preguntas de tipo `score`, el modelo devuelve una puntuación esperada sobre una escala ordenada (por ejemplo, «puede esperar», «esta semana», «hoy»), útil para priorización automatizada.
- Extracción de decisiones sobre vídeo: pasando arrays de fotogramas en `videos`, se pueden formular preguntas tipadas sobre eventos observados en el material, con la probabilidad asociada como medida de confianza.
- Anotación y etiquetado de datasets: al devolver distribuciones por opción, permite generar etiquetas con confianza asociada y filtrar por acuerdo para construir conjuntos de entrenamiento o evaluación.
- Revisión documental automatizada con control de umbral: integrar la salida en un pipeline donde solo las decisiones con confianza alta se aceptan automáticamente y el resto se deriva a revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona un «Decision Index» y enlaza a un leaderboard interno de Cloudflare (`clef-evals.workers-ai-mle.workers.dev`), pero el extracto disponible no incluye los valores por benchmark.

## Requisitos de hardware

- Entorno de referencia del autor: una única GPU H200, con `torch` 2.11 y `transformers` 5.10.2; las entradas de imagen y vídeo requieren además `pillow`.
- VRAM en bf16: aproximadamente 55 GB solo para los pesos (27,36 mil millones de parámetros a 2 bytes), más overhead de activaciones y caché; encaja en GPUs de 80 GB como H200, H100 80 GB y A100 80 GB.
- Estimación en 8 bits: en torno a 27-28 GB de pesos, por lo que podría desplegarse en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB. Es una estimación derivada del número de parámetros; no hay cuantizaciones oficiales publicadas.
- Estimación en 4 bits: en torno a 14-16 GB de pesos, lo que en teoría cabría en GPUs de consumo como RTX 4090 o RTX 3090 (24 GB). Estimación derivada, sin cuantización oficial documentada.
- Opciones de despliegue: el modelo se carga mediante código propio del repositorio (`joint_schema_model.py`, función `load_release_model`), por lo que la ruta documentada es `transformers` con código personalizado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cloudflare/clef | 27.356.728.560 | 16.384 tokens por defecto | Probabilidades por opción de un esquema tipado, sin texto libre | Apache-2.0 | HuggingFace (Cloudflare/clef) |
| Qwen/Qwen3.8-27B (modelo base) | No disponible en la información proporcionada | No disponible | Generación de texto | No disponible | HuggingFace (Qwen) |
| Cloudflare/clef-flash | No disponible | No disponible | Igual que Clef, pero variante menor y más rápida | No disponible | HuggingFace (Cloudflare/clef-flash) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparados en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo no genera texto libre: cualquier caso de uso que requiera respuestas en lenguaje natural o razonamiento abierto queda fuera de su alcance.
- Requiere definir previamente un esquema de preguntas tipadas (`noul`, `choice`, `score`); sin esquema no hay salida que interpretar.
- La salida son logits por opción que deben convertirse en probabilidades con un softmax por pregunta; el manejo del umbral de decisión es responsabilidad del integrador.
- Requiere código personalizado (`joint_schema_model.py`); no es un modelo que se pueda servir directamente con runtimes estándar como vLLM, llama.cpp u Ollama según la información disponible.
- Idiomas soportados: no disponibles. No se puede afirmar el comportamiento multilingüe sin datos.
- Sesgos conocidos: no disponibles en la información proporcionada. Al derivar de Qwen/Qwen3.8-27B, podría heredar sesgos del modelo base, pero esto no está documentado.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre, pero sí puede asignar probabilidades altas a opciones incorrectas cuando la evidencia del estado es insuficiente o ambigua.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen/Qwen3.8-27B, cuya licencia no se detalla en la información disponible.
- Estado del repositorio: creado el 30 de septiembre de 2026 y actualizado el 1 de octubre de 2026, con 18 descargas y 24 likes, lo que indica una adopción todavía muy limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cloudflare/clef
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Variante menor: https://huggingface.co/Cloudflare/clef-flash
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
