# Comfy-Org/Wan-2.1

## Resumen

Wan 2.1 es una familia de modelos de difusión para generación de vídeo desarrollada originalmente por Wan-AI (Alibaba) y redistribuida por Comfy-Org como un repositorio de archivos únicos ("single-file") optimizados para su uso directo en ComfyUI. El repositorio no contiene un modelo único, sino un empaquetado de más de una docena de variantes de la familia Wan 2.1: text-to-video (T2V), image-to-video (I2V), first-last-frame-to-video (FLF2V), VACE (control de vídeo), así como los derivados Fun-Control, Fun-Camera e InP de alibaba-pai, además de adaptaciones como MAGREF, Wan-Alpha e InfiniteTalk.

La familia Wan 2.1 cubre dos escalas de parámetros: variantes de 1.3B (orientadas a inferencia en hardware de consumo) y variantes de 14B (mayor calidad, resoluciones de 480p y 720p). El repositorio incluye los pesos en múltiples precisiones (fp16, bf16, fp8_e4m3fn, fp8_scaled) junto con el text encoder UMT5-XXL, el VAE de Wan 2.1 y el encoder de visión CLIP, todo empaquetado para colocarse directamente en las carpetas de ComfyUI.

Su relevancia actual radica en que es el punto de entrada práctico para usar Wan 2.1 en un entorno ComfyUI sin tener que gestionar manualmente las conversiones y dependencias de los repositorios originales. La licencia Apache 2.0 facilita el uso comercial, y el tamaño del repositorio (549,4 GB) refleja la acumulación de todas las variantes y precisiones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (familia Wan 2.1); detalles de arquitectura interna no disponibles en la información proporcionada |
| Parametros totales | Variantes de 1.3B y 14B (según el archivo; p. ej. `wan2.1_t2v_1.3B`, `wan2.1_t2v_14B`) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (modelo de difusión de vídeo; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | fp16, bf16, fp8_e4m3fn, fp8_scaled, int8_convrot (text encoder); no se listan GGUF |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de Wan 2.1 (tipo de backbone, mecanismo de atención, número de tokens de entrenamiento ni composición del dataset). Lo que sí se deduce del repositorio es la estructura del pipeline: un text encoder UMT5-XXL (`umt5_xxl_fp16`, `umt5_xxl_fp8_e4m3fn_scaled`, `umt5_xxl_int8_convrot`), un VAE específico de Wan 2.1 (`wan_2.1_vae.safetensors`) y un encoder de visión CLIP (`clip_vision_h.safetensors`) para las variantes image-to-video. Las variantes Wan-Alpha añaden VAE con canal alfa (`wan_alpha_2.1_vae_alpha_channel` y `wan_alpha_2.1_vae_rgb_channel`) y una LoRA RGBA.

El repositorio es un repackaging: Comfy-Org redistribuye los pesos originales de Wan-AI y de terceros (alibaba-pai, MAGREF-Video, htdong, MeiGen-AI) en archivos únicos listos para ComfyUI, con conversiones a fp16/bf16/fp8. No se aportan datos sobre el proceso de entrenamiento (RLHF, DPO, número de tokens) en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto (T2V) en variantes de 1.3B y 14B.
- Generación de vídeo a partir de imagen (I2V) en 480p y 720p (14B).
- Generación de vídeo entre primer y último fotograma (FLF2V) en 720p (14B).
- Control de vídeo mediante VACE: text-to-video, video-to-video, reference-to-video, inpainting, outpainting y first-last-frame.
- Control de cámara y control estructural mediante las variantes Fun-Control y Fun-Camera (1.3B y 14B).
- Inpainting de vídeo con la variante Fun-InP (1.3B).
- Doblaje de vídeo completo con audio mediante el adaptador InfiniteTalk (multi y single).
- Generación con canal alfa (transparencia) mediante Wan-Alpha (LoRA RGBA y VAE con canal alfa).
- Integración nativa con ComfyUI mediante workflows predefinidos.

## Casos de uso

- Generación de clips publicitarios a partir de texto: usar `wan2.1_t2v_14B` en 720p para producir vídeo de calidad comercial sin rodaje, con la variante 1.3B para prototipado rápido.
- Animación de imágenes fijas para redes sociales: `wan2.1_i2v_14B_720P` convierte una fotografía en un clip animado, útil para contenido de marketing y catálogos.
- Transiciones entre fotogramas concretos: `wan2.1_flf2v_720p_14B` permite fijar el primer y último fotograma y generar la interpolación, adecuado para secuencias narrativas controladas.
- Edición y retoque de vídeo existente: las variantes VACE permiten inpainting, outpainting y sustitución de referencias sobre metraje real, útil en postproducción.
- Doblaje y sincronización labial: el adaptador InfiniteTalk (`wan2.1_infiniteTalk_multi_fp16`) permite redoblaje de cuerpo completo con audio, aplicable a localización de contenido audiovisual.
- Control de cámara virtual: las variantes Fun-Camera (1.3B y 14B) generan movimientos de cámara definidos, útiles para previsualización y storyboards.
- Generación con transparencia: Wan-Alpha (LoRA RGBA + VAE alfa) produce vídeo con canal alfa, útil para overlays y composición en pipelines de VFX.
- Prototipado en hardware de consumo: la variante T2V de 1.3B en fp16 permite iterar en GPU de gama alta de consumo antes de escalar a 14B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita en la información proporcionada. Como referencia orientativa por tamaño de pesos: las variantes de 1.3B en fp16 ocupan del orden de 2,6 GB solo en pesos del modelo de difusión, mientras que las de 14B en fp16 rondan los 28 GB; a ello hay que sumar el text encoder UMT5-XXL y el VAE.
- Las variantes de 14B en fp8 (`fp8_e4m3fn`, `fp8_scaled`) reducen el peso del modelo de difusión aproximadamente a la mitad respecto a fp16, lo que facilita su despliegue en GPU con menos VRAM.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, las variantes de 14B en fp16 requieren GPU de clase profesional (A100/H100) o configuraciones multi-GPU; las de 1.3B son las candidatas para GPU de consumo.
- Cabe en GPU de consumo: las variantes de 1.3B en fp16/bf16 son las únicas plausibles en GPU de consumo según el tamaño de pesos; las de 14B en fp8 podrían requerir GPU de gama alta con 24 GB o más, aunque no se confirma en la información.
- Opciones de despliegue: ComfyUI es el entorno objetivo (librería `diffusion-single-file`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generación de vídeo que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio es un repackaging de terceros: la calidad y el comportamiento dependen de los modelos originales de Wan-AI, alibaba-pai, MAGREF-Video, htdong y MeiGen-AI, no de Comfy-Org.
- El tamaño del repositorio (549,4 GB) implica una descarga muy costosa; conviene descargar solo los archivos necesarios para el workflow concreto.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas en la información disponible.
- La licencia es Apache 2.0, lo que permite uso comercial, pero deben verificarse las licencias de los modelos base y derivados referenciados (algunos podrían tener condiciones adicionales no reflejadas aquí).
- No se especifican requisitos mínimos de hardware ni límites de resolución o duración de vídeo en la información proporcionada.
- Al ser modelos de difusión de vídeo, el coste computacional por generación es elevado y no apto para inferencia en tiempo real en hardware de consumo para las variantes de 14B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/Wan-2.1
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Ejemplos de Wan en ComfyUI: https://comfyanonymous.github.io/ComfyUI_examples/wan
- Plantillas de workflows: https://github.com/Comfy-Org/workflow_templates
- Modelos base originales:
  - https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
  - https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
  - https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
  - https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P
  - https://huggingface.co/Wan-AI/Wan2.1-FLF2V-14B-720P
  - https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
  - https://huggingface.co/Wan-AI/Wan2.1-VACE-14B
  - https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-1.3B-Control
  - https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-1.3B-Control-Camera
  - https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-14B-Control-Camera
  - https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-1.3B-InP
  - https://huggingface.co/MAGREF-Video/MAGREF
  - https://huggingface.co/htdong/Wan-Alpha
  - https://huggingface.co/MeiGen-AI/InfiniteTalk
