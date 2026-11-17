# silenceGDO/Wan-2.2

## Resumen

Wan 2.2 es una familia de modelos de difusión para generación y edición de vídeo desarrollada originalmente por el equipo Wan-AI (Alibaba). Este repositorio concreto, `silenceGDO/Wan-2.2`, no contiene un modelo nuevo entrenado desde cero, sino un **reempaquetado de pesos en formato single-file para ComfyUI** de hasta trece variantes oficiales de la familia Wan 2.2, junto con sus LoRAs de destilación y los componentes auxiliares (VAE, text encoder UMT5-XXL y codificador de audio wav2vec2).

El paquete cubre las tareas principales de la familia: texto a vídeo (T2V), imagen a vídeo (I2V), primer y último fotograma a vídeo (FLF2V), texto e imagen a vídeo en la variante ligera de 5B (TI2V), animación con audio (S2V), control de cámara, control e inpainting (Fun), animación de personajes (Animate) y edición de imagen (ChronoEdit de NVIDIA). Las variantes pesadas son modelos de 14B parámetros con arquitectura de doble experto (high noise / low noise) y las ligeras son de 5B.

Su relevancia es práctica: evita a los usuarios de ComfyUI tener que descargar y reorganizar manualmente pesos dispersos en múltiples repositorios oficiales, ya que todo viene preconvertido a `safetensors` con variantes fp16, bf16, fp8 escalado e int8. El repositorio pesa 728,7 GB, lo que refleja que se trata de una recopilación completa, no de un único modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de difusión (familia Wan 2.2) con variantes de doble experto high/low noise; no se detalla la arquitectura interna en la información disponible |
| Parametros totales | 14B (variantes A14B) y 5B (variantes ligeras); ChronoEdit 14B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ventana temporal de vídeo no especificada) |
| Tipos de cuantizacion | fp16, bf16, fp8 escalado (`fp8_scaled`), int8 (`int8_convrot`) |
| Idiomas soportados | no disponible (el text encoder es UMT5-XXL) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (single-file para ComfyUI) |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura interna, el proceso de entrenamiento, el volumen de datos ni las técnicas de alineación (RLHF/DPO) en la información disponible. Lo que sí se deduce del listado de ficheros es la organización de la familia: las variantes de 14B emplean un esquema de **dos expertos de ruido** (`high_noise` y `low_noise`), cada uno con sus propios pesos, que se combinan en el pipeline de muestreo; las variantes de 5B (`wan2.2_ti2v_5B`, `wan2.2_fun_control_5B`, `wan2.2_fun_inpaint_5B`) usan un único conjunto de pesos.

El paquete incluye LoRAs de destilación de lightx2v (`wan2.2_i2v_lightx2v_4steps_lora_v1` y `wan2.2_t2v_lightx2v_4steps_lora_v1.1`, en versiones high y low noise) que permiten reducir el muestreo a 4 pasos, además de una LoRA de relighting para Animate y una LoRA de destilación para ChronoEdit. Los componentes auxiliares son el text encoder **UMT5-XXL** (en fp16 y fp8 e4m3fn escalado), el VAE de Wan 2.2 y el VAE de Wan 2.1, y el codificador de audio **wav2vec2 large english fp16** para las variantes con audio (S2V).

## Capacidades

- Generación de vídeo a partir de texto (T2V) con las variantes `wan2.2_t2v_*_14B`.
- Generación de vídeo a partir de imagen (I2V) con `wan2.2_i2v_*_14B`.
- Generación de vídeo a partir de primer y último fotograma (FLF2V), según el workflow oficial enlazado.
- Texto e imagen a vídeo en la variante ligera de 5B (`wan2.2_ti2v_5B`).
- Vídeo dirigido por audio (S2V) con `wan2.2_s2v_14B`, apoyado en wav2vec2.
- Control de cámara (`fun_camera`) y control estructural (`fun_control`) en 14B y 5B.
- Inpainting y outpainting de vídeo (`fun_inpaint`) en 14B y 5B.
- Edición de vídeo con VACE (`fun_vace_14B`).
- Animación de personajes con relighting (`wan2.2_animate_14B` más LoRA de relight).
- Edición de imagen con ChronoEdit 14B (`chrono_edit_14B`).
- Aceleración por destilación a 4 pasos mediante las LoRAs de lightx2v.

## Casos de uso

- **Prototipado rápido de vídeo generativo en ComfyUI**: al estar todo preconvertido a single-file, un usuario puede cargar el workflow oficial de T2V o I2V y empezar a generar sin gestionar conversiones de pesos. Adecuado para equipos que iteran sobre prompts y estilos.
- **Producción de clips cortos para redes sociales**: las variantes I2V de 14B permiten animar una imagen fija manteniendo coherencia de contenido; combinadas con la LoRA de 4 pasos, reducen el coste de muestreo para lotes grandes.
- **Doblaje y avatares parlantes**: la variante S2V con wav2vec2 permite sincronizar vídeo con audio, útil para generar presentaciones o avatares con voz pregrabada.
- **Postproducción con inpainting de vídeo**: `fun_inpaint` en 14B o 5B permite eliminar objetos o rellenar regiones en secuencias existentes, integrándose en flujos de edición donde se necesita retocar planos sin regrabar.
- **Control de cámara virtual para previsualización**: `fun_camera` permite definir trayectorias de cámara sobre una escena generada, útil en previsualización de storyboards o animáticas.
- **Animación de personajes con relighting**: `wan2.2_animate_14B` más la LoRA de relight sirve para dar movimiento a ilustraciones o retratos manteniendo una iluminación coherente, aplicable a contenido de marketing o videojuegos.
- **Edición de imagen con ChronoEdit**: para retoques puntuales sobre imágenes fijas dentro del mismo entorno ComfyUI, sin cambiar de herramienta.
- **Investigación comparativa de la familia Wan 2.2**: el repositorio agrupa todas las variantes, lo que facilita experimentar con 5B frente a 14B bajo el mismo pipeline y medir el compromiso calidad/coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial en la información proporcionada. Como referencia orientativa por tamaño de fichero: las variantes de 14B en fp16/bf16 ocupan del orden de 28 GB de pesos, las de 14B en fp8 escalado del orden de 14 GB, y las de 5B en fp16 del orden de 10 GB; a ello hay que sumar el text encoder UMT5-XXL y el VAE, y el coste de activaciones durante el muestreo.
- **GPU recomendadas**: no especificadas en la información disponible. Por tamaño de pesos, las variantes de 14B en fp8 o con offloading encajan en GPUs de 24 GB (RTX 4090) y en GPUs de datacenter (A100, H100) para ejecución en bf16 sin cuantizar.
- **Consumer GPU**: las variantes de 5B y las de 14B en fp8 son las candidatas razonables para GPUs de consumo; no hay datos oficiales de VRAM mínima en la información disponible.
- **Despliegue**: el paquete está pensado explícitamente para **ComfyUI** (carpetas `diffusion_models`, `loras`, `text_encoders`, `vae`, `audio_encoders`). No se mencionan otros runners (vLLM, TGI, llama.cpp, Ollama) en la información disponible.
- **Latencia y throughput**: no disponibles. La presencia de LoRAs de destilación a 4 pasos sugiere que el muestreo completo por defecto requiere más pasos que esa cifra, pero no se aportan números.

## Comparativa con modelos similares

| Modelo | Parametros | Tareas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| silenceGDO/Wan-2.2 (este repo) | 14B y 5B (varias variantes) | T2V, I2V, FLF2V, S2V, control, inpainting, edición | Apache 2.0 | safetensors single-file | Hugging Face, 0 descargas, 0 likes |
| Wan-AI/Wan2.2-T2V-A14B | 14B | Texto a vídeo | Apache 2.0 (según repo base) | safetensors (formato original) | Hugging Face (repo oficial) |
| Wan-AI/Wan2.2-I2V-A14B | 14B | Imagen a vídeo | Apache 2.0 (según repo base) | safetensors (formato original) | Hugging Face (repo oficial) |
| Wan-AI/Wan2.2-TI2V-5B | 5B | Texto/imagen a vídeo | Apache 2.0 (según repo base) | safetensors (formato original) | Hugging Face (repo oficial) |

La diferencia principal frente a los repositorios oficiales no es de rendimiento ni de capacidades, sino de **empaquetado**: este repo entrega los pesos ya convertidos y organizados para ComfyUI, mientras que los oficiales requieren descargar componentes por separado. No se dispone de datos de benchmarks que permitan comparar calidad entre variantes.

## Limitaciones y advertencias

- **No es un modelo original**: es un reempaquetado de terceros; la autoría y el soporte técnico corresponden a los repositorios oficiales listados. Cualquier corrección o actualización debe buscarse allí.
- **Tamaño del repositorio**: 728,7 GB en total; descargar el repo completo no es viable para la mayoría de usuarios. Conviene descargar solo los ficheros necesarios.
- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia pública de que los ficheros hayan sido verificados más allá de lo que declara el autor.
- **Riesgo de alucinación visual**: como todo modelo generativo de vídeo, puede producir artefactos, inconsistencias temporales, anatomías incorrectas y texto ilegible; no se han publicado evaluaciones al respecto en la información disponible.
- **Sesgos**: no hay información sobre sesgos en los datos de entrenamiento de la familia base en la información proporcionada.
- **Idiomas**: el text encoder es UMT5-XXL, multilingüe por diseño, pero no se especifica la cobertura real de prompts en castellano.
- **Licencia**: Apache 2.0 según los metadatos, lo que en principio permite uso comercial, pero conviene verificar la licencia de cada modelo base por separado (incluido ChronoEdit de NVIDIA) antes de usos comerciales.
- **Hardware**: las variantes de 14B en bf16/fp16 requieren GPUs de alta gama; sin cuantización o destilación, la inferencia es costosa.
- **Dependencia de ComfyUI**: los nombres de fichero y la estructura de carpetas están pensados para ComfyUI; usarlos en otros runners requiere adaptación manual.

## Enlaces

- Repositorio del reempaquetado: https://huggingface.co/silenceGDO/Wan-2.2
- ChronoEdit 14B (NVIDIA): https://huggingface.co/nvidia/ChronoEdit-14B-Diffusers
- Wan2.2-Animate-14B: https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
- Wan2.2-Fun-A14B-Control-Camera: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control-Camera
- Wan2.2-Fun-A14B-Control: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control
- Wan2.2-Fun-5B-Control: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control
- Wan2.2-Fun-5B-InP: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-InP
- Wan2.2-Fun-A14B-InP: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-InP
- Wan2.2-VACE-Fun-A14B: https://huggingface.co/alibaba-pai/Wan2.2-VACE-Fun-A14B
- Wan2.2-I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Wan2.2-S2V-14B: https://huggingface.co/Wan-AI/Wan2.2-S2V-14B
- Wan2.2-T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Wan2.2-Distill-Loras (lightx2v): https://huggingface.co/lightx2v/Wan2.2-Distill-Loras
- Ejemplos de ComfyUI para Wan 2.2: https://comfyanonymous.github.io/ComfyUI_examples/wan22/
- Workflow I2V 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_i2v.json
- Workflow FLF2V 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_flf2v.json
- Workflow T2V 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_t2v.json
- Workflow TI2V 5B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_ti2v.json
- Workflow Fun Control 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_control.json
- Workflow S2V (audio-driven): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_s2v.json
- Workflow ChronoEdit 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_chrono_edit_14B.json
- Workflow Fun Camera Control 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_camera.json
- Workflow Fun Control 5B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_control.json
- Workflow Fun Inpaint 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_inpaint.json
- Workflow Fun Inpaint 5B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_inpaint.json
