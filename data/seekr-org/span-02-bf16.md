# seekr-org/span-02-bf16

## Resumen

Span-02 BF16 es una conversión de pesos del modelo multimodal Span-02 de Respan, un modelo de decisión estructurada construido sobre Google Gemma 4 26B-A4B. El modelo original está diseñado para resolver tareas de clasificación y decisión tipada (elección entre opciones, sí/no, puntuaciones y respuestas numéricas) sobre estados de entrada que pueden incluir texto, JSON e imágenes, en lugar de generar texto libre. Esta conversión, empaquetada por seekr-org, dequantiza los expertos nativos en NVFP4 y los pesos FP8 con escalado por fila del modelo original a safetensors BF16 estándar para su uso con vLLM, sin entrenamiento adicional.

La arquitectura es `Gemma4ForConditionalGeneration`, un transformer con mezcla de expertos (MoE) de 25.805.936.206 parámetros totales, de los cuales aproximadamente 4.000 millones están activos por token (según la nomenclatura A4B del modelo base). El repositorio ocupa 51,6 GB distribuidos en 32 shards de safetensors, e incluye el codificador de visión y la proyección en BF16 originales, junto con los pesos de normalización y las escalas del router preservados.

La relevancia de esta ficha es doble: por un lado, documenta un modelo especializado en decisiones estructuradas con una API tipada (`/v1/systemone`) que no se implementa con el serving estándar de chat de Gemma 4; por otro, advierte de que la conversión no recupera la precisión perdida en la cuantización original y de que no se ha establecido paridad de precisión o rendimiento con el motor nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Gemma4ForConditionalGeneration` (transformer MoE multimodal) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | no disponible (el nombre del base model indica A4B, ~4B activos, no confirmado en la información) |
| Longitud de contexto | 32.768 tokens (configurado para validación) |
| Tipos de cuantizacion | BF16 (pesos); el original usaba NVFP4 en expertos y FP8 con escalado por fila |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors BF16, 32 shards estándar (51.611.872.412 bytes, ~48,1 GiB) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) y capacidad multimodal, derivado de `google/gemma-4-26B-A4B-it` y afinado por Respan (Harvey Li) como `respanai/span-02`. La conversión de seekr-org no añade entrenamiento: únicamente dequantiza los expertos NVFP4 y los pesos FP8 con escalado por fila del checkpoint original a BF16 estándar, preservando el codificador de visión, la proyección, los pesos de normalización y las escalas del router. La revisión fuente está fijada en `63cbdd774391f1b7d9bc3829179efe996d0191ce`.

La innovación principal no está en la arquitectura sino en la capa de decisión: el modelo se sirve a través de una integración `SpanStrategy` que expone un endpoint `/v1/systemone` para preguntas tipadas (`choice`, `noul`, `score`, `number`). El decodificador especulativo nativo y el modelo de coste determinista de "thinking" específico por GPU no están implementados en esta integración; en su lugar se usa decodificación greedy de vLLM con límites explícitos de tokens y tiempo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Decisión estructurada tipada: preguntas de elección (`choice`, hasta 26 opciones), sí/no (`noul`), puntuación (`score`, hasta 10 niveles) y respuestas numéricas generadas (`number`, hasta 32 tokens, con `confidence`).
- Entrada multimodal: texto y JSON como estado, más hasta 4 imágenes PNG/JPEG validadas por prompt.
- Modo de razonamiento configurable: `auto` (por defecto, activa pensamiento si la probabilidad máxima inicial de opción es inferior a 0,8), `on` y `off`, con `budget_ms`, `max_tokens` (hasta 4096) y `trace`.
- Lectura de etiquetas A/B/C para preguntas de opción, con mezcla de distribuciones inicial y post-pensamiento a partes iguales.
- Generación de trazas de razonamiento (`answers[id].reasoning.trace`) y contabilidad de tokens de razonamiento dentro de `usage.output_tokens`.
- Diagnósticos de etiquetas (`label_mass`, `argmax_is_label`) para preguntas de opción.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso ni audio/vídeo (el serving limita `audio` y `video` a 0).

## Casos de uso

- Clasificación de tickets de soporte: enrutar cada ticket a un equipo (`returns`, `shipping`, etc.) mediante preguntas `choice` con criterios explícitos, aprovechando la lectura de etiquetas y el modo de razonamiento automático cuando la confianza es baja.
- Triaje de solicitudes de reembolso: usar preguntas `noul` para determinar si el cliente pide reembolso y combinarlas con preguntas `score` para priorizar el caso, todo en una sola llamada con estado JSON.
- Extracción de importes y cálculos: preguntas `number` para sumar campos de un estado JSON (por ejemplo, `a + b`) y devolver `number`, `text` y `confidence` calculada como `exp(mean logprob)`.
- Verificación documental con imágenes: adjuntar hasta 4 imágenes PNG/JPEG por prompt (facturas, albaranes, capturas) junto al estado textual para responder preguntas de decisión sobre su contenido.
- Moderación y cumplimiento: formular preguntas `noul` o `score` sobre el contenido de un mensaje para decidir si requiere revisión humana, con trazas de razonamiento auditables cuando se activa `trace`.
- Enrutamiento en pipelines de atención al cliente: integrar el endpoint `/v1/systemone` en un backend de tickets para obtener decisiones tipadas y probabilidades, en lugar de parsear texto libre generado por un chat convencional.
- Evaluación de confianza en producción: usar `label_mass` y `argmax_is_label` para monitorizar la fiabilidad de las lecturas y derivar a revisión manual los casos con masa de etiqueta baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona "pruebas de humo sintéticas" (synthetic smoke tests) en una GPU AMD MI300X; no se aportan cifras de precisión, latencia ni throughput, y se indica explícitamente que la capacidad de contexto largo y el rendimiento de serving no se han medido.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 ocupan unos 48,1 GiB (51,6 GB); hay que sumar memoria para el codificador de visión, activaciones y caché KV, por lo que se necesita bastante más que esa cifra.
- GPU recomendadas: la validación se realizó en una AMD MI300X (ROCm) con ejecución eager, `TRITON_ATTN` y `TORCH_SDPA` para la atención del codificador multimodal. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en GPUs de consumo habituales (24 GB o menos) en BF16; no se documentan alternativas cuantizadas para este repositorio.
- Despliegue: vLLM con soporte de Gemma 4; para el endpoint `/v1/systemone` se requiere además una build con el endpoint SystemOne y la integración `SpanStrategy`. Comando de referencia: `vllm serve seekr-org/span-02-bf16 --dtype bfloat16 --max-model-len 32768 --enable-prefix-caching --limit-mm-per-prompt '{"image":4,"audio":0,"video":0}' --mm-processor-kwargs '{"max_soft_tokens":560}'`.
- Latencia y throughput: no disponibles. El modo de razonamiento tiene un presupuesto por defecto de 700 ms en `auto` (desactivable con `0`), pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| seekr-org/span-02-bf16 | 25,8B totales (MoE) | 32.768 | Texto/JSON + imagen | Apache 2.0 | safetensors BF16 | Conversión de pesos, sin entrenamiento adicional |
| respanai/span-02 | no disponible | no disponible | Texto/JSON + imagen | no disponible | NVFP4/FP8 nativo | Modelo original de Respan, motor nativo con decodificador especulativo |
| google/gemma-4-26B-A4B-it | ~26B (MoE, ~4B activos) | no disponible | Multimodal (imagen, audio, vídeo) | Licencia Gemma 4 | safetensors | Modelo base instructivo de Google, chat general |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- La conversión a BF16 no recupera la precisión perdida en la cuantización NVFP4/FP8 original; la paridad de precisión y rendimiento con el motor nativo no se ha establecido.
- La integración usa decodificación greedy de vLLM; el decodificador especulativo nativo y el modelo de coste de pensamiento determinista por GPU no están implementados.
- Las definiciones de `confidence` y `usage` siguen las de SystemOne en vLLM y difieren de las del servidor nativo de Span.
- La ejecución usa operaciones BF16, no la cuantización de activaciones FP8/NVFP4 del motor nativo.
- El serving estándar de chat de Gemma 4 no implementa la API de decisión tipada; descargar los pesos no instala la integración de servidor necesaria.
- Solo se validaron hasta 4 imágenes por prompt y una ventana de 32.768 tokens; la capacidad de contexto largo y el throughput no se midieron.
- El modo `auto` intenta un pensamiento cuando la probabilidad máxima inicial de opción es inferior a 0,8; esto puede añadir latencia (presupuesto por defecto de 700 ms) y el presupuesto de pensamiento no limita el tiempo total de la petición.
- Las preguntas numéricas no tienen puerta de confianza por opción: en `auto` responden directamente y solo intentan pensar en modo `on`.
- No se dispone de información sobre sesgos, idiomas soportados ni evaluación de alucinación; al ser un modelo de decisión tipada, el riesgo principal es una lectura de etiqueta incorrecta, mitigable con `label_mass` y revisión humana.
- Licencia Apache 2.0 en el repositorio, con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos de la licencia del modelo base para uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/seekr-org/span-02-bf16
- Modelo original de Respan: https://huggingface.co/respanai/span-02
- Modelo base de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
