# OpenMOSS-Team/MOSS-VL-Instruct-0708-NF4

## Resumen

MOSS-VL-Instruct-0708-NF4 es la versión cuantizada en 4 bits (W4A16 NF4) del modelo visión-lenguaje MOSS-VL-Instruct-0708, desarrollado por OpenMOSS (equipo MOSS AI). Se trata de un modelo de la familia MOSS-VL orientado a comprensión de imágenes, comprensión de vídeo de larga duración e interacción en tiempo real por streaming. Esta variante concreta reduce el peso del checkpoint original en BF16 mediante cuantización de solo peso con bitsandbytes NF4 y doble cuantización, manteniendo el cómputo en BF16.

El modelo resuelve el problema de desplegar un VLM multimodal de tamaño medio (11.336 millones de parámetros totales, aproximadamente 11,3 B) en hardware de gama alta de consumo: el perfil validado por el autor cabe en una única GPU NVIDIA de 24 GB de VRAM. Esto lo hace relevante para desarrolladores que necesitan procesar imágenes y vídeo (incluido vídeo largo) sin acceso a clústeres multi-GPU ni a GPUs de centro de datos.

La ficha se centra en la variante NF4 publicada en Hugging Face. El modelo base en BF16 es OpenMOSS-Team/MOSS-VL-Instruct-0708, del que este repositorio es una cuantización oficial. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino. Existe un informe técnico asociado en arXiv (2608.15045) y una referencia adicional (2606.07639).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (MOSS-VL); capas de lenguaje con atención, proyección cross-attention, encoder de visión y merger; se cita FlashAttention 2 como backend de atención |
| Parametros totales | 11.336.371.208 (≈11,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 NF4 (bitsandbytes, solo peso, doble cuantización, cómputo BF16); 240 capas Linear de las capas de lenguaje 4-43 cuantizadas; primeras y últimas 4 capas de lenguaje, cross-attention, encoder de visión, merger, embeddings, norms y lm_head en BF16; KV cache en BF16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 11,9 GB), cargable con transformers y bitsandbytes 0.49.2 |

## Arquitectura y entrenamiento

La información disponible describe la arquitectura a nivel de componentes: un encoder de visión, un módulo merger, proyecciones de cross-attention y un stack de lenguaje con capas de atención. El checkpoint cuantizado conserva en BF16 el encoder de visión, el merger, las proyecciones de cross-attention, las cuatro primeras y las cuatro últimas capas de lenguaje, los embeddings, las normas y el `lm_head`; solo las 240 capas Linear elegibles de las capas 4 a 43 se almacenan en NF4. El backend de atención es FlashAttention 2 y el KV cache se mantiene en BF16 (esta variante no activa HQQ KV8). El pipeline declarado es video-text-to-text.

No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF/DPO o preferencias. Tampoco se detallan innovaciones de decodificación especulativa ni mecanismos de atención lineal. El modelo soporta procesamiento de imagen con parámetros de parcheo (`patch_size=16`, `temporal_patch_size=1`, `merge_size=2`) y de vídeo con extracción de frames a FPS configurable (`video_fps=1.0`, `min_frames=1`, `max_frames=32` en el perfil validado).

## Capacidades

- Comprensión de imágenes: descripción, respuesta a preguntas visuales y extracción de información de documentos (el benchmark DocVQA se evalúa en esta variante).
- Comprensión de vídeo: procesamiento de vídeo con muestreo de frames a FPS configurable y ventanas de hasta 32 frames en el perfil validado.
- Comprensión de vídeo largo: el autor declara soporte de "long-video understanding" y evalúa con VideoMME, MLVU_dev y TimeLens.
- Interacción en tiempo real por streaming: la familia MOSS-VL se presenta como apta para interacción en streaming.
- Procesamiento multimodal conjunto de imagen y vídeo con prompts de texto (pipeline video-text-to-text).
- Capacidades multilingües limitadas a inglés y chino según la model card.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes o modo de razonamiento extendido (thinking).

## Casos de uso

- Análisis de documentos escaneados y recibos: el modelo obtiene 89,53 en DocVQA en esta variante NF4, por lo que es adecuado para extracción de campos y respuesta a preguntas sobre documentos con una sola GPU de 24 GB.
- Moderación y descripción de vídeo en pipelines de contenido: con muestreo a 1 FPS y hasta 32 frames, se puede generar descripción o etiquetado de clips cortos de forma automatizada.
- Búsqueda y resumen de vídeo largo: las evaluaciones en VideoMME, MLVU_dev y TimeLens indican uso para responder preguntas sobre contenido audiovisual extenso, útil en archivística y medios.
- Asistencia visual en atención al cliente: un agente puede recibir capturas o vídeos del usuario y describir el problema; el prompt multimodal se integra vía `offline_image_generate` y `offline_video_generate`.
- Control de calidad industrial por imagen: inspección visual con prompts descriptivos y respuesta determinista (`do_sample=False`) para clasificación de defectos en lotes.
- Accesibilidad: generación de descripciones de imágenes y vídeos para lectores de pantalla o subtitulado descriptivo, con despliegue en una estación de trabajo con GPU de 24 GB.
- Prototipado e investigación multimodal: al ser Apache 2.0 y cargarse con transformers, sirve para experimentar con cuantización NF4 sobre tareas de DocVQA, VideoMME o VSIBench.

## Benchmarks y rendimiento

| Benchmark | Resultado (NF4) |
|---|---|
| DocVQA | 89,53 |
| VideoMME | 67,30 |
| MLVU_dev | 75,86 |
| TimeLens (subconjunto 1) | 51,00 |
| TimeLens (subconjunto 2) | 48,17 |
| TimeLens (subconjunto 3) | 59,33 |
| VSIBench | 61,76 |

El autor indica que estos resultados corresponden a la comparación entre el modelo BF16 original y los cuatro perfiles de cuantización publicados; no se incluyen en la información proporcionada los valores del modelo BF16 ni de otros modelos para comparación directa.

## Requisitos de hardware

- VRAM validada: 12.494 MiB de pico de proceso en la prueba de imagen; 16.708 MiB de pico en la prueba de vídeo a 1 FPS con máximo de 32 frames.
- GPU recomendada: una única NVIDIA GPU con 24 GB de VRAM es suficiente para el perfil validado.
- Cabe en GPU de consumo de 24 GB (por ejemplo, RTX 4090 o RTX 3090); no se especifican otras GPU concretas en la información disponible.
- Despliegue: ruta de inferencia offline de MOSS-VL con transformers, `AutoModelForCausalLM` y `AutoProcessor`, `device_map="auto"`, `torch_dtype=torch.bfloat16` y `attn_implementation="flash_attention_2"`. El autor indica que este checkpoint no es una release de SGLang.
- Entorno validado: Python 3.12.8, PyTorch 2.8.0 con CUDA 12.8, Transformers 4.57.1, Accelerate 1.12.0, FlashAttention 2.8.1, bitsandbytes 0.49.2; FFmpeg en `PATH` para decodificar vídeo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / cuantizacion | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-VL-Instruct-0708-NF4 | ≈11,3 B | no disponible | Apache 2.0 | safetensors, NF4 W4A16 | Hugging Face |
| MOSS-VL-Instruct-0708 (base BF16) | ≈11,3 B (mismo base) | no disponible | Apache 2.0 | safetensors BF16 | Hugging Face |
| Otros VLM de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas declarados limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos generativos multimodales; las respuestas sobre documentos o vídeos deben validarse en producción.
- La cuantización NF4 introduce una degradación respecto al BF16 original; el autor publica la comparativa de benchmarks, pero no se detalla en esta ficha la magnitud de la pérdida por tarea.
- El checkpoint lleva su propia configuración de bitsandbytes: no debe añadirse una segunda configuración de cuantización en tiempo de ejecución.
- Esta variante no activa HQQ KV8; el KV cache es BF16, lo que afecta al consumo de memoria con contextos largos.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica ejecutar código del repositorio.
- El vídeo validado se limita a 1 FPS y 32 frames en el perfil probado; vídeos más largos o con mayor FPS pueden exceder la VRAM validada.
- No es una release de SGLang; el despliegue validado es la ruta offline de transformers.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse las licencias de las dependencias (bitsandbytes, FlashAttention) y de los datos de entrenamiento, no detallados aquí.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708-NF4
- Modelo base BF16: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708
- README en chino: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708-NF4/blob/main/README_zh.md
- Informe técnico (arXiv 2608.15045): https://arxiv.org/pdf/2608.15045
- Referencia adicional (arXiv 2606.07639): https://arxiv.org/abs/2606.07639
- Repositorio de código: https://github.com/OpenMOSS/MOSS-VL
- Web oficial: https://www.moss-ai.com/models/moss-vl
- Documentación de API: https://platform.moss.cn/en/docs/scenarios/image-video-understanding
