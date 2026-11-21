# Comfy-Org/Wan_2.1_ComfyUI_repackaged

## Resumen

Wan 2.1 es una familia de modelos de difusión para generación de vídeo desarrollada por Wan-AI (Alibaba), redistribuida por Comfy-Org en este repositorio como un paquete de ficheros "single-file" listos para usar en ComfyUI. El repositorio no contiene un modelo único, sino un conjunto de pesos repackaged que cubren las distintas variantes de la familia Wan 2.1: text-to-video (T2V), image-to-video (I2V), first-last-frame-to-video (FLF2V), VACE (control de vídeo, inpainting, outpainting, referencia a vídeo), además de finetunes de terceros como Wan-Fun (Control, Control-Camera, InP), MAGREF, Wan-Alpha e InfiniteTalk.

Las variantes principales se ofrecen en dos escalas: 1.3B y 14B parámetros. La familia incluye text encoders UMT5-XXL (umt5_xxl) y un VAE específico (wan_2.1_vae), junto con variantes de cuantización fp16, bf16, fp8_e4m3fn, fp8_scaled e int8_convrot. El repositorio pesa 549,4 GB y acumula más de 5,1 millones de descargas, lo que lo convierte en la vía de acceso práctica a Wan 2.1 para la comunidad de ComfyUI.

Su relevancia actual radica en que unifica en un solo paquete reproducible todos los checkpoints, VAEs, text encoders, LoRAs y patches necesarios para ejecutar los flujos de Wan 2.1 en ComfyUI, con workflows oficiales publicados para cada tarea (T2V, I2V, FLF2V, VACE, inpainting, outpainting, dubbing con audio, etc.). La licencia Apache 2.0 facilita el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelos de difusión para vídeo (familia Wan 2.1); arquitectura interna no detallada en la información disponible |
| Parámetros totales | Variantes de 1.3B y 14B (según checkpoint) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (modelo de difusión de vídeo, no LLM) |
| Tipos de cuantización | fp16, bf16, fp8_e4m3fn, fp8_scaled, int8_convrot (text encoder) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de los modelos Wan 2.1 (tipo de backbone, número de bloques, mecanismo de atención o estrategia de compresión temporal). Se trata de modelos de difusión para generación de vídeo, no de modelos de lenguaje, por lo que conceptos como "longitud de contexto" o "parámetros activos" no aplican directamente. El repositorio incluye los componentes auxiliares habituales de un pipeline de difusión: text encoder UMT5-XXL (en fp16, fp8_e4m3fn_scaled e int8_convrot), VAE específico de Wan 2.1 y un VAE alternativo con canales alpha y RGB para el finetune Wan-Alpha.

El paquete cubre múltiples variantes y finetunes: T2V (1.3B y 14B), I2V 480p y 720p (14B), FLF2V 720p (14B), VACE 1.3B y 14B, y los finetunes Wan-Fun V1.1 (Control, Control-Camera, InP) en 1.3B y 14B, además de MAGREF 14B, el LoRA wan_alpha_2.1_rgba_lora y los patches wan2.1_infiniteTalk_multi_fp16 y wan2.1_infiniteTalk_single_fp16. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (T2V) en variantes 1.3B y 14B.
- Generación de vídeo a partir de imagen (I2V) en resoluciones 480p y 720p (14B).
- Generación de vídeo entre primer y último fotograma (FLF2V) a 720p con el modelo de 14B.
- Control de vídeo con VACE: vídeo a vídeo, inpainting, outpainting, referencia a vídeo y text-to-video con control.
- Control estructural y de cámara mediante los finetunes Wan-Fun V1.1 (Control, Control-Camera) en 1.3B y 14B.
- Inpainting guiado por prompt con el finetune Wan-Fun InP (1.3B).
- Doblaje de vídeo completo guiado por audio mediante InfiniteTalk (patches single y multi).
- Generación con canal alpha (transparencia) mediante Wan-Alpha y su LoRA RGBA asociada.
- Integración nativa con ComfyUI mediante workflows oficiales publicados para cada tarea.

## Casos de uso

- Producción de vídeo publicitario a partir de texto: usar T2V 14B para generar clips base y refinar con I2V para mantener coherencia de producto entre planos.
- Animación de imágenes fijas para redes sociales: I2V 480p o 720p convierte una fotografía en un clip corto, adecuado para contenido rápido con el modelo de 14B o, en equipos modestos, con las variantes ligeras.
- Interpolación y transiciones controladas: FLF2V 720p permite fijar el primer y último fotograma y generar la transición intermedia, útil en montaje y storytelling.
- Edición y retoque de vídeo existente: VACE posibilita inpainting y outpainting sobre metraje real, sustituyendo objetos o ampliando el encuadre sin regrabar.
- Control de cámara virtual: los finetunes Wan-Fun Control-Camera permiten definir trayectorias de cámara en la generación, útil para previsualización y storyboards animados.
- Doblaje y sincronización labial: InfiniteTalk, aplicado como patch sobre los checkpoints Wan 2.1, permite reanimar un vídeo con una pista de audio nueva para localización de contenido.
- Assets con transparencia: Wan-Alpha y su LoRA RGBA generan vídeo con canal alpha, aprovechable en composición y motion graphics.
- Previsualización en pipelines de VFX: combinar VACE con Control para generar plates de referencia antes del rodaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial en la información proporcionada. Como referencia orientativa por tamaño de checkpoint: las variantes de 1.3B en fp16 ocupan del orden de unos pocos GB de pesos, mientras que las de 14B en fp16 requieren del orden de decenas de GB solo para los pesos, a lo que hay que sumar el text encoder UMT5-XXL y el VAE durante la inferencia. Las versiones fp8_e4m3fn y fp8_scaled reducen sustancialmente el consumo.
- GPU recomendadas: no especificadas en la información disponible. Por el tamaño de los checkpoints de 14B, son necesarias GPU de datacenter (A100, H100) o consumer de gama alta con suficiente VRAM; las variantes de 1.3B son las indicadas para GPUs consumer.
- Compatibilidad con GPU consumer: las variantes de 1.3B y las cuantizaciones fp8 de 14B son las opciones realistas en GPUs consumer; los checkpoints de 14B en fp16/bf16 no caben en GPUs consumer de VRAM habitual.
- Opciones de despliegue: ComfyUI (destino principal de este repositorio), con workflows oficiales; el formato single-file safetensors es específico de ComfyUI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wan 2.1 (este repositorio) | 1.3B y 14B | no aplica (vídeo) | Apache 2.0 | Hugging Face, ComfyUI | Familia completa T2V/I2V/FLF2V/VACE y finetunes |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El repositorio es un repackaging para ComfyUI, no el repositorio original del modelo; para documentación técnica detallada conviene consultar los repositorios base de Wan-AI y de los finetunes de terceros.
- El tamaño total del repositorio (549,4 GB) exige planificación de almacenamiento; no es necesario descargar todos los ficheros, solo los del workflow concreto.
- La información disponible no detalla sesgos, tasas de alucinación visual ni limitaciones idiomáticas; deben evaluarse con pruebas propias antes de producción.
- Las variantes de 14B en fp16/bf16 tienen requisitos de VRAM elevados; en entornos limitados hay que recurrir a fp8 o a las variantes de 1.3B, con posible pérdida de calidad.
- Los finetunes de terceros (Wan-Fun, MAGREF, Wan-Alpha, InfiniteTalk) pueden tener condiciones adicionales propias; la licencia Apache 2.0 del repositorio no garantiza por sí sola los términos de cada modelo base.
- La calidad y coherencia temporal de los clips generados no está cuantificada en la información disponible; conviene validar con prompts y duraciones representativas del caso de uso.
- El uso comercial está permitido por Apache 2.0, pero debe verificarse el cumplimiento de derechos de imagen y audio en material de entrada (especialmente en doblaje con InfiniteTalk).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged
- Wan2.1 T2V 14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Wan2.1 T2V 1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Wan2.1 I2V 14B 720P: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P
- Wan2.1 I2V 14B 480P: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
- Wan2.1 FLF2V 14B 720P: https://huggingface.co/Wan-AI/Wan2.1-FLF2V-14B-720P
- Wan2.1 VACE 14B: https://huggingface.co/Wan-AI/Wan2.1-VACE-14B
- Wan2.1 VACE 1.3B: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
- Wan2.1 Fun V1.1 Control 1.3B: https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-1.3B-Control
- Wan2.1 Fun V1.1 Control-Camera 1.3B: https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-1.3B-Control-Camera
- Wan2.1 Fun V1.1 Control-Camera 14B: https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-14B-Control-Camera
- Wan2.1 Fun V1.1 InP 1.3B: https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-1.3B-InP
- MAGREF: https://huggingface.co/MAGREF-Video/MAGREF
- Wan-Alpha: https://huggingface.co/htdong/Wan-Alpha
- InfiniteTalk: https://huggingface.co/MeiGen-AI/InfiniteTalk
- Ejemplos de ComfyUI para Wan: https://comfyanonymous.github.io/ComfyUI_examples/wan
- Plantillas de workflows Comfy-Org: https://github.com/Comfy-Org/workflow_templates
- ComfyUI (repositorio): https://github.com/Comfy-Org/ComfyUI
- Documentación oficial de ComfyUI: https://docs.comfy.org/
- Comfy Cloud: https://cloud.comfy.org/
