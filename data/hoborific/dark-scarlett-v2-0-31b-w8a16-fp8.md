# hoborific/Dark-Scarlett-v2.0-31B-W8A16-FP8

## Resumen

Dark-Scarlett-v2.0-31B-W8A16-FP8 es una versión cuantizada del modelo ReadyArt/Dark-Scarlett-v2.0-31B, desarrollada por hoborific. Se trata de un modelo de 31.273 millones de parámetros con arquitectura de tipo Gemma 4 (según los tags), diseñado para tareas conversacionales y de roleplay, con capacidad multimodal (image-text-to-text). La cuantización W8A16 FP8 reduce el tamaño de los pesos a float8 manteniendo las activaciones en bf16/fp16, lo que permite una inferencia más eficiente en hardware compatible.

El modelo se distribuye en formato compressed-tensors, con pesos cuantizados por canal de salida y un esquema de clipping optimizado mediante búsqueda de error MSE. Está pensado para desplegarse con vLLM en plataformas Intel XPU y NVIDIA CUDA (SM75+). Al ser una versión cuantizada, mantiene las capacidades del modelo original, incluyendo procesamiento de imágenes y texto, aunque con una ligera pérdida de precisión inherente a la cuantización.

La relevancia de este modelo radica en su optimización para entornos de producción donde el uso de memoria es crítico, ofreciendo una alternativa FP8 de alta calidad frente a cuantizaciones más agresivas como GGUF de 4 bits. Su enfoque en roleplay y conversación lo hace atractivo para aplicaciones de entretenimiento y asistentes virtuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Grouped-Query Attention (GQA), QK-Norm y Self-attention (basada en Gemma 4) |
| Parametros totales | 31.273.088.876 (31,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (pesos en float8_e4m3fn, activaciones en bf16/fp16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el modelo base podría tener Apache 2.0 según el GGUF, pero no confirmado) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base, ReadyArt/Dark-Scarlett-v2.0-31B, emplea una arquitectura transformer con Grouped-Query Attention (GQA), normalización QK-Norm y self-attention, típica de la familia Gemma 4. Según la información disponible, el modelo es multimodal (image-text-to-text), lo que implica la presencia de una torre de visión y un proyector multimodal, aunque los detalles específicos de esta arquitectura no se detallan en la información proporcionada.

La versión cuantizada W8A16 FP8 se obtiene mediante cuantización offline con el formato float-quantized de compressed-tensors. El proceso cuantiza únicamente las proyecciones lineales 2D (atención Q/K/V/O y MLP gate/up/down) a float8_e4m3fn, con escalas simétricas por canal de salida calculadas a partir de amax/448 y refinadas mediante una búsqueda de clipping MSE sobre ~9 fracciones (0.8–1.0× amax). Los embeddings, normas, lm_head, routers/experts y la torre de visión permanecen en bf16. No se dispone de información sobre los datos de entrenamiento del modelo base, ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y roleplay, según los tags del modelo.
- Procesamiento multimodal imagen-texto (pipeline image-text-to-text), lo que permite entender y generar respuestas basadas en imágenes.
- Soporte de instrucciones (instruct), lo que facilita su uso en tareas guiadas por prompts.
- Capacidades multilingües no confirmadas; la información no especifica idiomas soportados.
- No se menciona soporte explícito para tool calling, agentes o razonamiento multi-paso, aunque al ser un modelo de 31B podría tener ciertas capacidades implícitas, pero no está documentado.

## Casos de uso

- Asistentes conversacionales para entretenimiento: el modelo está diseñado para roleplay y conversación natural, por lo que puede integrarse en chatbots de personajes o juegos de rol.
- Generación de contenido creativo multimodal: al aceptar imágenes como entrada, puede describir imágenes o generar historias a partir de ellas, útil en aplicaciones de narrativa interactiva.
- Moderación de contenido visual: puede analizar imágenes y generar descripciones o alertas, aunque su especialización principal es conversacional.
- Aplicaciones de atención al cliente con soporte visual: puede procesar capturas de pantalla o fotos enviadas por usuarios para ayudar a resolver incidencias técnicas.
- Prototipos de agentes conversacionales con memoria de contexto: aunque no se confirma tool calling, su tamaño permite manejar diálogos largos con contexto razonable.
- Despliegue en entornos con restricciones de memoria: gracias a la cuantización FP8, puede ejecutarse en GPUs con menor VRAM que el modelo original, facilitando su uso en edge o en entornos cloud con costes optimizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 33,3 GB, lo que sugiere que la carga completa del modelo requiere al menos esa cantidad de memoria, aunque en inferencia con FP8 los pesos ocupan menos (aproximadamente 31,3 GB para todos los parámetros en FP8, pero solo las capas lineales están cuantizadas, así que el peso total en memoria podría rondar los 25-30 GB).
- Para inferencia con vLLM, se requiere una GPU NVIDIA con soporte SM75+ (Turing o posterior) o Intel XPU. No se soportan ROCm, CPU ni TPU.
- Se recomienda al menos 32 GB de VRAM para ejecutar el modelo con contexto moderado; con cuantización FP8 y técnicas de offloading podría caber en GPUs de 24 GB (como RTX 3090/4090) con limitaciones de contexto.
- Opciones de despliegue: vLLM (con kernels específicos para XPU o CUDA), y potencialmente otros frameworks que soporten compressed-tensors, aunque la documentación se centra en vLLM.
- La latencia y throughput dependen del hardware y la configuración; no se proporcionan datos específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dark-Scarlett-v2.0-31B (base) | 31,3B | BF16 | no disponible | no disponible | Hugging Face |
| Dark-Scarlett-v2.0-31B-W8A16-FP8 (este) | 31,3B | FP8 | no disponible | no disponible | Hugging Face |
| Dark-Scarlett-v2.0-31B-GGUF | 31,3B | GGUF (varios) | no disponible | Apache 2.0 (según llms.info) | Hugging Face |

La comparativa se limita a las variantes del mismo modelo, ya que no se dispone de información sobre modelos comparables de otros desarrolladores con características similares.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos del modelo, pero al ser un modelo de roleplay podría reflejar estereotipos presentes en sus datos de entrenamiento.
- Riesgo de alucinación inherente a los modelos generativos; no se han evaluado métricas de fiabilidad.
- La cuantización FP8 puede introducir una ligera degradación en la calidad de las respuestas frente al modelo en BF16, aunque el esquema de clipping busca minimizarla.
- La licencia no está especificada en la información proporcionada; se debe verificar antes de un uso comercial.
- El soporte de plataformas es limitado: no funciona en ROCm, CPU ni TPU con vLLM.
- No se confirma la longitud de contexto, lo que dificulta dimensionar aplicaciones que requieran ventanas largas.
- Los idiomas soportados no están documentados; es posible que el modelo esté optimizado principalmente para inglés.

## Enlaces

- Modelo cuantizado: https://huggingface.co/hoborific/Dark-Scarlett-v2.0-31B-W8A16-FP8
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v2.0-31B
- Versión GGUF: https://huggingface.co/ReadyArt/Dark-Scarlett-v2.0-31B-GGUF (o el enlace de llms.info: https://llms.info/models/readyart-dark-scarlett-v2-0-31b-gguf-1326)
- Adaptador LoRA: https://huggingface.co/ReadyArt/Dark-Scarlett-v2.0-31B-LORA
- Vista de arquitectura: https://hfviewer.com/ReadyArt/Dark-Scarlett-v2.0-31B
