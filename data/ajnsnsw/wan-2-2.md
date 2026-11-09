# ajnsnsw/Wan-2.2

## Resumen

Wan 2.2 es una familia de modelos de difusión para generación y edición de vídeo desarrollada originalmente por Alibaba (Wan-AI) y empaquetada en este repositorio por el usuario ajnsnsw como un conjunto de archivos únicos (single-file) listos para su uso en ComfyUI. El repositorio no contiene un modelo entrenado de forma independiente, sino una recopilación de pesos de distintos variantes de la familia Wan 2.2 (T2V, I2V, TI2V, S2V, Animate, Fun-Control, Fun-InP, VACE y ChronoEdit), junto con sus LoRAs de destilación y aceleración, el text encoder umT5-XXL y los VAE asociados.

La relevancia de este paquete es práctica: agrupa en un solo lugar los archivos necesarios para ejecutar los flujos de trabajo oficiales de Wan 2.2 en ComfyUI, evitando que el usuario tenga que descargar decenas de repositorios separados. Las variantes principales son modelos de 14B parámetros (en versiones high-noise y low-noise, típicas de los modelos de difusión con mezcla de expertos por etapa de ruido) y una variante ligera de 5B (TI2V-5B y Fun-5B). El pipeline declarado es image-to-video, aunque el repositorio cubre también text-to-video, speech-to-video, control de cámara, inpainting y edición de imagen.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligatorias de la licencia. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de difusión (familia Wan 2.2); variantes 14B con pares high-noise/low-noise y variante 5B; no se detalla la arquitectura interna en la información disponible |
| Parametros totales | 14B (variantes 14B) y 5B (variantes 5B); no disponible el desglose exacto por componente |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de difusión para vídeo/imagen); no disponible la longitud máxima de secuencia de vídeo |
| Tipos de cuantizacion | bf16, fp16, fp8_scaled (e4m3fn escalado), int8_convrot; LoRAs en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

El repositorio es un repackaging de pesos, no un modelo entrenado por el autor del repo. Los modelos base declarados incluyen Wan2.2-T2V-A14B, Wan2.2-I2V-A14B, Wan2.2-TI2V-5B, Wan2.2-S2V-14B, Wan2.2-Animate-14B, las variantes Fun (Control, Control-Camera, InP, VACE) de 14B y 5B, ChronoEdit-14B-Diffusers de NVIDIA y las LoRAs de destilación de lightx2v (4 pasos). No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; estos datos corresponden a las model cards originales de cada modelo base, no incluidas en la información disponible.

La estructura de archivos revela un diseño típico de los modelos de difusión modernos para vídeo: un text encoder umT5-XXL (en fp16 o fp8 escalado), un VAE (wan2.2_vae y wan_2.1_vae), y los UNet/DiT de difusión separados en variantes high-noise y low-noise para el muestreo en dos etapas. Las LoRAs lightx2v de 4 pasos permiten reducir el número de pasos de inferencia, y la LoRA de relight de Animate añade control de iluminación. El modelo S2V incorpora un audio encoder wav2vec2-large-english-fp16 para generación de vídeo guiada por voz. No se detallan innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.) en la información disponible.

## Capacidades

- Generación de vídeo a partir de texto (T2V) con las variantes Wan2.2-T2V-A14B.
- Generación de vídeo a partir de imagen (I2V) con Wan2.2-I2V-A14B, incluyendo first-last frame to video.
- Generación de vídeo a partir de texto e imagen combinados (TI2V) con la variante 5B.
- Generación de vídeo guiada por audio/voz (S2V) con Wan2.2-S2V-14B y el audio encoder wav2vec2.
- Animación de personajes (Animate-14B) con LoRA de relight para control de iluminación.
- Control de cámara (Fun-Control-Camera) y control general (Fun-Control) en 14B y 5B.
- Inpainting de vídeo (Fun-InP) en 14B y 5B.
- Edición de imagen (ChronoEdit-14B) con LoRA de destilación.
- Aceleración de inferencia mediante LoRAs lightx2v de 4 pasos para T2V e I2V.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no aplica a un modelo de difusión).

## Casos de uso

- Generación de vídeo publicitario a partir de texto: usar Wan2.2-T2V-A14B con la LoRA lightx2v de 4 pasos para producir clips cortos en pocos pasos de muestreo, reduciendo coste de GPU frente a un muestreo completo.
- Animación de retratos o personajes para redes sociales: Wan2.2-Animate-14B con la LoRA de relight permite animar una imagen fija y ajustar la iluminación de la escena generada.
- Doblaje y avatares parlantes: Wan2.2-S2V-14B junto con wav2vec2 permite generar vídeo sincronizado con una pista de audio en inglés, útil para presentaciones o contenido formativo.
- Control de cámara en postproducción: Wan2.2-Fun-A14B-Control-Camera permite definir trayectorias de cámara sobre una escena generada o existente, adecuado para previsualización de planos.
- Inpainting y eliminación de objetos en vídeo: Wan2.2-Fun-A14B-InP y Fun-5B-InP permiten rellenar regiones enmascaradas en secuencias, útil para limpieza de metraje o corrección de elementos no deseados.
- Edición de imagen con ChronoEdit-14B: sustitución o modificación de elementos en una imagen fija con la LoRA de destilación para iterar rápidamente en flujos de diseño.
- Previsualización de storyboards: combinar T2V e I2V de 14B para convertir guiones e imágenes de referencia en clips de baja resolución antes de una producción final.
- Prototipado en ComfyUI: el paquete single-file permite montar los workflows oficiales de Wan 2.2 sin gestionar múltiples descargas, adecuado para equipos que evalúan la familia antes de adoptarla en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial en la información proporcionada. Como referencia orientativa por tamaño de pesos: las variantes 14B en bf16/fp16 ocupan aproximadamente 28 GB solo en pesos del modelo de difusión, a lo que hay que sumar text encoder umT5-XXL y VAE; las versiones fp8_scaled reducen el peso del modelo de difusión a aproximadamente la mitad. Las variantes 5B en fp16 ocupan aproximadamente 10 GB de pesos. Estas cifras son estimaciones por tamaño de archivo, no medidas publicadas.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, las variantes 14B en precisión completa requieren GPUs de 40-80 GB (A100, H100) o configuraciones multi-GPU; las versiones fp8_scaled pueden caber en GPUs de 24 GB (RTX 4090) con offloading.
- ¿Cabe en GPU consumer? Las variantes 5B en fp16 y las 14B en fp8_scaled son las candidatas más plausibles para GPUs consumer de 24 GB, aunque no se confirma en la información disponible.
- Opciones de despliegue: ComfyUI (formato single-file y workflows oficiales enlazados en la model card). No se documentan otros backends (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wan 2.2 (este repo) | 14B y 5B | no disponible | Apache 2.0 | Hugging Face (repackaging) | Familia completa T2V/I2V/S2V/Animate/Fun/ChronoEdit |
| Wan2.2-T2V-A14B (original) | 14B | no disponible | Apache 2.0 | Hugging Face | Modelo base oficial de Alibaba |
| Wan2.2-I2V-A14B (original) | 14B | no disponible | Apache 2.0 | Hugging Face | Modelo base oficial de Alibaba |
| Wan2.2-TI2V-5B (original) | 5B | no disponible | Apache 2.0 | Hugging Face | Variante ligera oficial |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio es un repackaging de pesos de terceros; no hay garantía de integridad, actualización ni soporte por parte del autor del repo (0 descargas, 0 likes en el momento de la consulta).
- El tamaño del repositorio es de 728,7 GB, lo que implica un coste de almacenamiento y descarga considerable; conviene descargar solo los archivos necesarios para el workflow concreto.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas en la información disponible; al ser modelos de difusión, el riesgo principal es la generación de contenido no fiel a la instrucción o de contenido sensible.
- La licencia Apache 2.0 permite uso comercial, pero cada modelo base puede tener condiciones adicionales en su model card original que no se recogen aquí; conviene revisarlas antes de producción.
- Los modelos de vídeo de difusión pueden requerir muchos pasos de muestreo; las LoRAs lightx2v de 4 pasos mitigan el coste pero pueden degradar la calidad frente al muestreo completo.
- El audio encoder incluido es wav2vec2-large-english, por lo que la variante S2V está orientada a audio en inglés; no se documenta soporte multilingüe.
- No se proporcionan métricas de calidad, latencia ni throughput, lo que dificulta la planificación de capacidad en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ajnsnsw/Wan-2.2
- Modelo base ChronoEdit: https://huggingface.co/nvidia/ChronoEdit-14B-Diffusers
- Modelo base Wan2.2-Animate-14B: https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
- Modelo base Wan2.2-Fun-A14B-Control-Camera: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control-Camera
- Modelo base Wan2.2-Fun-A14B-Control: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control
- Modelo base Wan2.2-Fun-5B-Control: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control
- Modelo base Wan2.2-Fun-5B-InP: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-InP
- Modelo base Wan2.2-Fun-A14B-InP: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-InP
- Modelo base Wan2.2-VACE-Fun-A14B: https://huggingface.co/alibaba-pai/Wan2.2-VACE-Fun-A14B
- Modelo base Wan2.2-I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Modelo base Wan2.2-S2V-14B: https://huggingface.co/Wan-AI/Wan2.2-S2V-14B
- Modelo base Wan2.2-T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- LoRAs de destilación lightx2v: https://huggingface.co/lightx2v/Wan2.2-Distill-Loras
- Ejemplos de ComfyUI para Wan 2.2: https://comfyanonymous.github.io/ComfyUI_examples/wan22/
- Workflow I2V 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_i2v.json
- Workflow first-last frame 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_flf2v.json
- Workflow T2V 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_t2v.json
- Workflow TI2V 5B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_ti2v.json
- Workflow Fun Control 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_control.json
- Workflow S2V 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_s2v.json
- Workflow ChronoEdit 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_chrono_edit_14B.json
- Workflow Fun Camera 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_camera.json
- Workflow Fun Control 5B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_control.json
- Workflow Fun Inp 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_inpaint.json
- Workflow Fun Inpaint 5B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_inpaint.json
