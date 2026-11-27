# houyuanchen/MT-Forcing

## Resumen

MT Forcing es un modelo de edición de imágenes multi-turno construido sobre SenseNova U1.5 8B MoT, un transformer de 8.766 millones de parámetros (17.530 millones en el checkpoint completo en safetensors) especializado en mantener la coherencia visual a lo largo de secuencias de edición encadenadas. Lo desarrolla el autor houyuanchen y se distribuye bajo licencia Apache 2.0 a través de Hugging Face, con integración nativa en ComfyUI y compatibilidad con la librería diffusers.

El problema que resuelve es el "drift" o deriva acumulativa: en edición de imágenes multi-turno convencional, cada edición sucesiva degrada la consistencia del contenido respecto a la imagen original y a las instrucciones previas. MT Forcing introduce técnicas de entrenamiento (Single-Turn Distribution Matching Distillation y Teacher-Forcing Guidance) que enseñan al estudiante a arrastrar detalles e instrucciones anteriores, logrando una consistencia de contenido de 8,40/10 frente a 7,09/10 del baseline en MTEdit-Bench.

Es relevante ahora porque la edición iterativa de imágenes es un caso de uso creciente en flujos creativos y de producción, y las soluciones existentes no escalan más allá de pocos turnos. El modelo se publica con pesos BF16 (35,07 GB), un checkpoint específico para ComfyUI y un repositorio de 140,3 GB que incluye assets y ejemplos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SenseNova U1.5 8B MoT (transformer multimodal, image-to-image) |
| Parámetros totales | 17.532.854.464 (según safetensors); 8B según denominación del autor |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (checkpoint publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de imagen; instrucciones en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint raíz y variante ComfyUI v0.1) |

## Arquitectura y entrenamiento

El modelo se basa en SenseNova U1.5 8B MoT, un transformer multimodal orientado a edición de imágenes (pipeline image-to-image). El checkpoint publicado contiene 17.532.854.464 parámetros en safetensors, lo que sugiere que el total incluye componentes adicionales (posiblemente codificadores o módulos auxiliares) más allá de los 8B nominales del backbone.

El entrenamiento de MT Forcing se articula en dos procedimientos. Primero, Single-Turn Distribution Matching Distillation: el estudiante edita sus propias salidas previas mientras un teacher parte de la imagen original y aplica en una sola pasada las instrucciones acumuladas hasta ese turno. Segundo, Teacher-Forcing Guidance: se usan secuencias de edición de referencia para enseñar al estudiante qué detalles deben propagarse entre turnos. Ambos son procedimientos de entrenamiento; en inferencia se ejecuta el checkpoint liberado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Edición de imágenes multi-turno: mantiene la coherencia de contenido a lo largo de secuencias de hasta 15 ediciones encadenadas (demostrado en el ejemplo del gatito).
- Edición referencial a elementos introducidos en turnos previos: puede añadir objetos que no existían en la imagen original pero sí en ediciones anteriores (por ejemplo, una etiqueta dorada sobre un collar añadido en un turno previo).
- Instrucciones en lenguaje natural por turno, con encadenamiento de contexto visual e instruccional.
- Integración con ComfyUI mediante nodo SenseNova Conditioning con opción de edición multi-turno.
- Compatibilidad con diffusers (pipeline image-to-image).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso textual, visión general, audio ni thinking mode.

## Casos de uso

- Edición iterativa de retratos para producción fotográfica: el modelo permite cambiar color de prendas, sustituir objetos y añadir accesorios en turnos sucesivos guardando cada imagen intermedia, lo que facilita la revisión y el control de calidad en flujos de posproducción.
- Creación de variaciones consistentes de producto: a partir de una imagen base, se aplican cambios de color, materiales o elementos decorativos manteniendo la identidad del producto, útil para catálogos de e-commerce.
- Storyboarding y previsualización: encadenar ediciones sobre un mismo personaje o escena (por ejemplo, 15 turnos sobre un gatito) para explorar narrativas visuales sin perder la coherencia del sujeto.
- Iteración creativa en ComfyUI: artistas y diseñadores pueden construir grafos con el nodo SenseNova Conditioning y encadenar KSampler para editar paso a paso, inspeccionando cada salida.
- Edición de imágenes para redes sociales y marketing: aplicar cambios progresivos (fondo, vestuario, iluminación) manteniendo la consistencia del sujeto entre versiones.
- Investigación en edición multimodal: el modelo sirve como referencia para estudiar drift acumulativo y técnicas de destilación de distribución en tareas de edición secuencial.

## Benchmarks y rendimiento

Resultados en MTEdit-Bench (100 sesiones de ocho ediciones cada una; medias sobre los ocho turnos):

| Modelo | Instruction following ↑ /10 | Content consistency ↑ /10 | Drift resistance ↑ /5 | Matched-point displacement ↓ |
|---|---:|---:|---:|---:|
| SenseNova U1.5 | 8,47 | 7,09 | 3,83 | 6,34 px |
| + MT Forcing | 9,66 | 8,40 | 4,30 | 0,74 px |

En el turno ocho, la consistencia de contenido alcanza 7,68/10 con MT Forcing frente a 3,22/10 del baseline SenseNova U1.5.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el checkpoint pesa 35,07 GB, por lo que se necesitan al menos ~36-40 GB de VRAM para cargarlo completo; con overhead de activaciones, se recomienda 48 GB o más.
- GPU recomendadas: A100 80 GB, H100 80 GB, A6000 48 GB. En consumer GPU, solo tarjetas con 48 GB o más (RTX 6000 Ada, RTX 5090 si dispone de suficiente VRAM) podrían alojar el checkpoint BF16 completo.
- No se documentan cuantizaciones alternativas (GGUF, FP8, INT8) en la información disponible, lo que limita el despliegue en GPUs de consumo de 24 GB o menos.
- Opciones de despliegue: ComfyUI (con checkout específico en el commit 7c78b5641ab2d6cb7f7766a183a8a43a59de0a8b), diffusers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de imagen).
- Latencia y throughput: no disponibles. El ejemplo de ComfyUI usa 8 pasos Euler, scheduler simple, CFG 1.0 y shift 3.0 por turno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Consistencia multi-turno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MT Forcing (SenseNova U1.5 8B MoT) | 17,53B (checkpoint) / 8B nominal | no disponible | 8,40/10 media; 7,68/10 en turno 8 | Apache 2.0 | Hugging Face, ComfyUI, diffusers |
| SenseNova U1.5 (baseline) | 8B MoT | no disponible | 7,09/10 media; 3,22/10 en turno 8 | no disponible en la información | Referenciado como baseline en el paper |
| Otros modelos de edición multi-turno | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para edición de imágenes; no es un modelo de lenguaje ni soporta tareas textuales, tool calling o agentes.
- Riesgo de deriva residual: aunque MT Forcing mejora la consistencia, en secuencias largas (más de 15 turnos) no se documenta el comportamiento.
- No se especifican sesgos conocidos ni limitaciones idiomáticas en la información disponible; al tratarse de un modelo de imagen, el sesgo vendría de los datos de entrenamiento, no documentados.
- Riesgo de alucinación visual: el modelo puede introducir o modificar elementos no solicitados, especialmente en ediciones referenciales a objetos introducidos previamente.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales ni cláusulas de responsabilidad.
- El tamaño del checkpoint (35,07 GB en BF16, repo de 140,3 GB) dificulta el despliegue en hardware de consumo; no hay cuantizaciones publicadas.
- La integración en ComfyUI requiere un checkout específico y copia manual de código (comfyui/comfy y comfyui/comfy_extras), lo que añade complejidad operativa.
- No se documentan tiempos de inferencia ni throughput, lo que impide estimar costes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/houyuanchen/MT-Forcing
- Paper: https://arxiv.org/pdf/2610.25404
- Paper (HTML, método): https://arxiv.org/html/2610.25404v2#S3
- Paper (HTML, resultados): https://arxiv.org/html/2610.25404v2#S4
- GitHub: https://github.com/houyuanchen111/MT-Forcing
- Galería del proyecto: https://houyuanchen111.github.io/mt-forcing.github.io/#explore
- Resultados por turno: https://houyuanchen111.github.io/mt-forcing.github.io/#results
- Vídeo comparativo (gatito, 15 turnos): https://houyuanchen111.github.io/mt-forcing.github.io/videos/kitten_15turn_comparison_12s.mp4
- Checkpoint ComfyUI: ./SenseNova-U1.5-8B-MoT-MT-Forcing-BF16-v0.1-ComfyUI.safetensors (en el repo)
- Workflow de ejemplo: examples/comfyui_mt_forcing_3turn_api.json
- Imagen de entrada de ejemplo: examples/mt_forcing_test_input.jpg
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Guía de instalación de ComfyUI: https://docs.comfy.org/installation/manual_install
