# Comfy-Org/Wan_2.2_ComfyUI_Repackaged

## Resumen
Wan 2.2 Repackaged es un repositorio de Comfy-Org que redistribuye los pesos de la familia Wan 2.2 de generación de vídeo por difusión, empaquetados en formato single-file safetensors listos para cargar directamente en ComfyUI. No se trata de un modelo único, sino de un contenedor que agrupa los distintos checkpoints de la familia (T2V, I2V, TI2V, S2V, Animate, Fun-Control, Fun-Camera, Fun-Inpaint, VACE, ChronoEdit) junto con los text encoders UMT5-XXL, VAEs y LoRAs de destilación. Los modelos originales proceden de Wan-AI (Alibaba) y de alibaba-pai, NVIDIA y lightx2v.

El problema que resuelve es operativo: los pesos originales están distribuidos en múltiples repositorios con distintos formatos (Diffusers, bf16, fp16, fp8), y este repack los normaliza en un único árbol de directorios con nombres consistentes (`diffusion_models/`, `text_encoders/`, `vae/`, `loras/`), de modo que los workflows oficiales de ComfyUI funcionan sin conversiones manuales. Es relevante ahora por su enorme adopción (más de 9,8 millones de descargas) y porque la familia Wan 2.2 cubre prácticamente todo el espectro de generación y edición de vídeo open source.

Los checkpoints principales son de 14B parámetros (variantes high-noise/low-noise en un esquema de dos etapas) y 5B (TI2V y Fun-Control/Inpaint). La licencia agregada del repo es Apache 2.0. El tamaño del repositorio completo es de 731,6 GB, al incluir todas las variantes de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de difusión para vídeo (familia Wan 2.2); no disponible el detalle de bloques internos en la información proporcionada |
| Parametros totales | 14B (variantes T2V, I2V, S2V, Animate, Fun 14B/A14B, VACE, ChronoEdit) y 5B (TI2V, Fun-Control, Fun-Inpaint) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusión, no LLM) |
| Tipos de cuantizacion | bf16, fp16, fp8_scaled, int8_convrot; LoRAs de destilación a 4 pasos (lightx2v) |
| Idiomas soportados | no disponible (el prompt textual se procesa vía text encoder UMT5-XXL) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors single-file (diffusion-single-file) |

## Arquitectura y entrenamiento
La familia Wan 2.2 emplea modelos de difusión para generación de vídeo, organizados en las variantes 14B con un esquema de dos etapas: un checkpoint *high noise* y otro *low noise* que se encadenan durante el muestreo. Las variantes 5B (TI2V, Fun-Control, Fun-Inpaint) usan un único checkpoint. El repositorio incluye además un text encoder UMT5-XXL en fp16 y fp8_e4m3fn_scaled, dos VAEs (`wan2.2_vae` y `wan_2.1_vae`) y un encoder de audio wav2vec2 (`wav2vec2_large_english_fp16`) para la variante S2V de generación de vídeo guiada por audio.

No se dispone en la información proporcionada del número de tokens de entrenamiento, composición del dataset ni detalles de alineación (RLHF/DPO). Las innovaciones destacables documentadas en el repack son la integración de LoRAs de destilación de lightx2v que permiten generar en 4 pasos (frente a muestreos largos), las variantes Fun para control de cámara e inpainting, la variante Animate con LoRA de relight, y ChronoEdit-14B para edición de imagen.

## Capacidades
- Generación de vídeo texto-a-vídeo (T2V) con checkpoints 14B high/low noise.
- Generación de vídeo imagen-a-vídeo (I2V) y primer-último fotograma a vídeo (FLF2V).
- Generación texto-imagen-a-vídeo (TI2V) con checkpoint 5B.
- Generación de vídeo guiada por audio (S2V) con encoder wav2vec2 y sincronización labial implícita.
- Animación de personajes (Animate 14B) con LoRA de relight para reiluminación.
- Control de cámara (Fun-Camera 14B) y control estructural (Fun-Control 14B y 5B).
- Inpainting de vídeo (Fun-Inpaint 14B y 5B).
- Control de vídeo VACE (Fun-VACE 14B).
- Edición de imagen con ChronoEdit-14B y LoRA de destilación.
- Aceleración por destilación a 4 pasos mediante LoRAs lightx2v.
- No disponible: tool calling, function calling, agentes, modo thinking o capacidades multilingües verificadas.

## Casos de uso
- Producción de clips publicitarios: con T2V 14B en fp8_scaled se generan vídeos desde prompts de texto en una GPU de 24 GB, encadenando high/low noise para calidad máxima.
- Animación de fotogramas clave en postproducción: FLF2V permite interpolar entre un primer y un último fotograma definidos por el artista, útil para transiciones controladas.
- Doblaje y avatares parlantes: S2V con wav2vec2 sincroniza el movimiento labial a una pista de audio, adecuado para localización de vídeo sin regrabar.
- Previz y animática: Fun-Control 5B permite dirigir el movimiento con mapas de control sin exigir hardware de gama alta.
- Rotoscopia y limpieza de planos: Fun-Inpaint 14B elimina objetos o marcas de agua fotograma a fotograma manteniendo coherencia temporal.
- Reiluminación de metraje existente: Animate 14B con LoRA relight permite reajustar la iluminación de un personaje animado sin rehacer la escena.
- Edición de stills para storyboards: ChronoEdit-14B con LoRA de destilación permite iterar ediciones de imagen en pocos pasos.
- Prototipado rápido en ComfyUI: los workflows oficiales en JSON del repositorio `workflow_templates` permiten montar un pipeline funcional sin escribir código.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: 14B en bf16/fp16 requiere del orden de 28 GB solo para pesos, más activaciones y VAE; en fp8_scaled baja a unos 14-16 GB de pesos, siendo viable en GPUs de 24 GB con offloading.
- 5B en bf16 se sitúa en torno a 10-12 GB de pesos, apto para GPUs consumer de 16-24 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB y RTX 4090 24 GB para las variantes 14B; RTX 4080/3090 24 GB o 4070 Ti Super 16 GB para 5B.
- Cabe en consumer GPU: sí, con fp8_scaled o cuantización int8_convrot para 14B y bf16 para 5B, asumiendo offloading parcial a RAM.
- Despliegue: ComfyUI (nativo, formato del repack), Comfy Cloud; no disponible confirmación de soporte en vLLM, llama.cpp, Ollama o TGI (son runtimes de LLM, no aplicables directamente a difusión de vídeo).
- Latencia y throughput: no disponibles; los LoRAs lightx2v de 4 pasos reducen el número de pasos de muestreo, lo que implica menor tiempo de inferencia por clip, aunque no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan 2.2 (este repack) | 14B y 5B | no disponible | Apache 2.0 | Hugging Face, ComfyUI, Comfy Cloud |
| Wan 2.1 | no disponible en la información | no disponible | no disponible | Hugging Face |
| ChronoEdit-14B (NVIDIA) | 14B | no disponible | no disponible | Incluido como base en este repack |
| Modelos competidores de vídeo open source | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar internamente las variantes de la propia familia Wan 2.2; no se dispone de datos de benchmarks ni de especificaciones de modelos competidores para una comparación rigurosa.

## Limitaciones y advertencias
- Repositorio agregador, no modelo original: la licencia y condiciones efectivas dependen de cada modelo base (Wan-AI, alibaba-pai, NVIDIA, lightx2v); conviene verificar Apache 2.0 en cada repo de origen antes de uso comercial.
- Tamaño de descarga muy elevado (731,6 GB para el repo completo); descargar solo los subdirectorios necesarios.
- Los checkpoints 14B se dividen en high noise y low noise: usar solo uno produce resultados degradados; hay que encadenarlos según los workflows oficiales.
- Riesgo de artefactos temporales, flickering y deriva de identidad en clips largos; no se documentan límites de duración en la información disponible.
- Sesgos: no documentados en la información proporcionada; los modelos de difusión de vídeo pueden reproducir sesgos demográficos y estilísticos presentes en sus datos de entrenamiento.
- Riesgo de alucinación visual: anatomías incorrectas, texto ilegible y físicas inconsistentes, habitual en difusión de vídeo.
- Idiomas: no disponible; el comportamiento multilingüe del text encoder UMT5-XXL no está verificado en esta ficha.
- Dependencia de ComfyUI: los nombres de fichero y rutas están pensados para ese entorno; otros runtimes requerirían renombrado o conversión.
- Los LoRAs de destilación a 4 pasos sacrifican calidad frente al muestreo completo; validar antes de producción.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- Ejemplos ComfyUI Wan 2.2: https://comfyanonymous.github.io/ComfyUI_examples/wan22/
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Comfy Cloud: https://cloud.comfy.org/
- Workflows oficiales: https://github.com/Comfy-Org/workflow_templates
- Modelos base: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B, https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B, https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B, https://huggingface.co/Wan-AI/Wan2.2-S2V-14B, https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
- Variantes Fun: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control, https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control-Camera, https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control, https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-InP, https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-InP, https://huggingface.co/alibaba-pai/Wan2.2-VACE-Fun-A14B
- ChronoEdit: https://huggingface.co/nvidia/ChronoEdit-14B-Diffusers
- LoRAs de destilación: https://huggingface.co/lightx2v/Wan2.2-Distill-Loras
