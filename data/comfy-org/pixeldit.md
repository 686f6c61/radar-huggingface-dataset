# Comfy-Org/PixelDiT

## Resumen

PixelDiT y PiD son dos familias de modelos de difusion desarrolladas por NVIDIA y reempaquetadas por Comfy-Org para su uso directo en ComfyUI. PixelDiT es un modelo de difusion de tipo transformer (DiT) de 1300 millones de parametros orientado a generacion texto-a-imagen a 1024 px. PiD (Pixel Diffusion) es una familia de upscalers generativos que operan sobre latentes de distintos modelos base (FLUX.1, FLUX.2, Qwen-Image, SD3, SDXL) para escalar de 1024 a 4096 px o de 512 a 2048 px en cuatro pasos.

El interes de este repositorio no esta en el modelo en si, sino en el formato: Comfy-Org ha convertido los pesos originales en ficheros `safetensors` de un solo archivo (`diffusion-single-file`) listos para colocarse en `ComfyUI/models/diffusion_models/`, con variantes en bf16, int8 con rotacion de convolucion y mxfp8. Esto elimina la necesidad de gestionar checkpoints fragmentados y facilita el despliegue en pipelines de generacion de imagen.

La relevancia actual es doble: por un lado, PiD ofrece una via de upscaling generativo de alta resolucion compatible con los principales modelos de imagen open source; por otro, el repositorio incluye el text encoder Gemma 2 2B IT en variantes bf16 y fp8 escalada, lo que sugiere que PixelDiT usa un LLM como codificador de texto. El repositorio acumula 58.561 descargas y 159 likes, con un tamano total de 71,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para PixelDiT; upscaler generativo sobre latentes para PiD |
| Parametros totales | 1300M (PixelDiT-1300M); PiD no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a difusion) |
| Tipos de cuantizacion | bf16, int8 con rotacion de convolucion (convrot), mxfp8, fp8 escalada (text encoder) |
| Idiomas soportados | no disponible |
| Licencia | nsclv1 (NVIDIA Source Code License v1, etiquetada como `other`) |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

PixelDiT sigue la estela de los Diffusion Transformers: en lugar de una U-Net convolucional, el modelo procesa los parches de la imagen mediante bloques de atencion, lo que escala mejor con la resolucion y permite entrenar a 1024 px de forma nativa. El repositorio incluye el checkpoint `pixeldit_1300m_1024px` en bf16 y mxfp8, con 1300 millones de parametros. El uso de Gemma 2 2B IT como text encoder (en bf16 y fp8 escalada) indica un pipeline de condicionamiento textual basado en un LLM decoder-only, en linea con la tendencia de sustituir CLIP/T5 por modelos de lenguaje.

PiD es una familia distinta: no genera desde ruido, sino que actua como decodificador/upscaler de latentes. Los ficheros disponibles cubren combinaciones de modelo base y rango de resolucion (`flux1`, `flux2`, `qwenimage`, `sd3`, `sdxl`), con variantes de 4 pasos (`4step`) y sin ellas, y con soporte de 512→2048 y 1024→4096. La existencia de variantes `int8_convrot` sugiere cuantizacion post-entrenamiento con rotacion aplicada a las capas convolucionales para preservar calidad. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; estos modelos de difusion no usan RLHF en el sentido de los LLM.

## Capacidades

- Generacion texto-a-imagen con PixelDiT a 1024 px nativos.
- Upscaling generativo de latentes de 1024 a 4096 px y de 512 a 2048 px con PiD.
- Compatibilidad con latentes de FLUX.1, FLUX.2, Qwen-Image, SD3 y SDXL como entrada para PiD.
- Inferencia en 4 pasos en las variantes `4step`, lo que reduce el coste computacional frente a samplers de 20-50 pasos.
- Cuantizacion int8 con rotacion de convolucion y mxfp8 para reducir huella de VRAM.
- Integracion nativa con ComfyUI mediante workflows oficiales (text-to-image y latent upscale).
- No se han documentado capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking; son modelos generativos de imagen, no LLM.

## Casos de uso

- Generacion de imagen desde prompt en produccion: PixelDiT en bf16 o mxfp8 dentro de un workflow de ComfyUI, con el text encoder Gemma 2 2B cargado en fp8 para liberar VRAM. Adecuado para pipelines por lotes donde se necesita 1024 px sin upscaling posterior.
- Upscaling de material generado con FLUX.1: usar `pid_flux1_1024_to_4096_4step_bf16.safetensors` para llevar latentes de 1024 a 4096 px en cuatro pasos, evitando el upscaler clasico que pierde detalle fino.
- Restauracion y ampliacion de imagenes de catalogo: PiD sobre latentes de SDXL permite reescalar assets existentes de 1024 a 4096 px manteniendo coherencia semantica, util para e-commerce y prensa.
- Post-produccion de storyboards: combinar un modelo base rapido a 512 px con `pid_*_512_to_2048_4step` para iterar rapido en baja resolucion y escalar solo los frames aprobados.
- Integracion en ComfyUI como backend de estudio: los ficheros single-file se colocan directamente en `models/diffusion_models/` y se versionan con Git LFS o un registro de artefactos, simplificando el despliegue en maquinas de artistas.
- Evaluacion comparativa de upscalers: al existir variantes para cinco familias de modelos base, se puede medir el mismo PiD sobre latentes de FLUX.2, Qwen-Image y SD3 con un unico pipeline y aislar el efecto del modelo base.
- Despliegue con cuantizacion agresiva: las variantes `int8_convrot` y `mxfp8` permiten ejecutar PixelDiT y PiD en GPUs con menos VRAM que la requerida por bf16, a costa de una perdida de calidad no cuantificada en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para PixelDiT-1300M: en bf16, aproximadamente 2,6 GB solo para pesos; en mxfp8, alrededor de 1,3 GB. A esto hay que sumar el text encoder Gemma 2 2B (unos 4-5 GB en bf16, la mitad en fp8 escalada) y las activaciones de atencion a 1024 px.
- VRAM estimada para PiD: no disponible con precision; el repositorio incluye variantes int8_convrot y mxfp8 precisamente para reducir la huella, pero no se publican cifras.
- GPU recomendadas: no disponible. Por tamano, una RTX 4090 (24 GB) deberia acomodar el pipeline completo en bf16; GPUs de 12-16 GB probablemente requieran fp8/mxfp8 y atencion optimizada.
- Cabe en GPU de consumo: previsiblemente si en RTX 3090/4090 y modelos con 16 GB o mas usando cuantizacion, aunque no hay confirmacion oficial en la informacion proporcionada.
- Opciones de despliegue: ComfyUI es el entorno de referencia (los pesos estan empaquetados para sus carpetas). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles. Las variantes `4step` implican cuatro evaluaciones del modelo por muestra, lo que reduce el coste frente a samplers de decenas de pasos, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PixelDiT-1300M (NVIDIA) | 1300M | 1024 px | no aplica | nsclv1 | Hugging Face (nvidia/PixelDiT-1300M-1024px) |
| PiD (NVIDIA) | no disponible | 512→2048 / 1024→4096 | no aplica | nsclv1 | Hugging Face (nvidia/PiD) |
| FLUX.1 | no disponible en la informacion | 1024 px | no aplica | no disponible en la informacion | usado como modelo base de PiD |
| Qwen-Image | no disponible en la informacion | 1024 px | no aplica | no disponible en la informacion | usado como modelo base de PiD |
| SD3 / SDXL | no disponible en la informacion | 1024 px | no aplica | no disponible en la informacion | usados como modelos base de PiD |

No se dispone de datos de rendimiento comparativo (FID, CLIP score, etc.) para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia `nsclv1` (NVIDIA Source Code License v1): es una licencia propietaria con condiciones, no una licencia open source aprobada por la OSI. Hay que revisar los terminos antes de cualquier uso comercial o redistribucion.
- El repositorio es un reempaquetado de Comfy-Org, no el repositorio original de NVIDIA; para trazabilidad y condiciones de uso conviene consultar `nvidia/PixelDiT-1300M-1024px` y `nvidia/PiD`.
- No se documentan sesgos conocidos, tasas de alucinacion visual ni limitaciones idiomaticas; la ausencia de esta informacion no implica ausencia de sesgos.
- Los modelos de difusion pueden reproducir sesgos de genero, etnia y estilo presentes en sus datos de entrenamiento; no hay evaluacion publicada en la informacion disponible.
- El rendimiento de PiD depende del modelo base cuyos latentes recibe; usar una variante `flux1` sobre latentes de otro modelo producira resultados degradados.
- Las variantes cuantizadas (int8_convrot, mxfp8, fp8 escalada) pueden introducir perdida de calidad no cuantificada; no se publican metricas de degradacion.
- El tamano del repositorio (71,5 GB) exige planificacion de almacenamiento y ancho de banda; descargar solo las variantes necesarias.
- No hay informacion sobre idiomas soportados en los prompts ni sobre el maximo de tokens del text encoder Gemma 2 2B en este pipeline.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/PixelDiT
- Modelo original PixelDiT: https://huggingface.co/nvidia/PixelDiT-1300M-1024px
- Modelo original PiD: https://huggingface.co/nvidia/PiD
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Workflow texto-a-imagen PixelDiT: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_pixeldit_t2i.json
- Workflow upscale PiD latent decode: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_pid_latent_upscale_dit.json
- Repositorio de plantillas de workflow: https://github.com/Comfy-Org/workflow_templates
