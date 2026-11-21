# Comfy-Org/Wan_2.2_ComfyUI_Repackaged

## Resumen

Wan 2.2 es una familia de modelos de difusión para generación y edición de vídeo desarrollada originalmente por Wan-AI (Alibaba) y empaquetada por Comfy-Org en este repositorio para su uso directo en ComfyUI. El repositorio no contiene un único modelo, sino un conjunto de pesos reorganizados en archivos "single-file" (safetensors) que cubren múltiples variantes: texto a vídeo (T2V), imagen a vídeo (I2V), vídeo con audio (S2V), control de cámara, inpainting, control por pose/profundidad (Fun Control), transferencia de estilo (VACE) y edición de imagen (ChronoEdit). Las variantes principales se organizan en pares de modelos "high noise" y "low noise" de 14B parámetros, más una variante compacta de 5B.

La relevancia de este repositorio radica en que elimina la fricción de conversión de pesos: los archivos están listos para colocarse en las carpetas de ComfyUI (`diffusion_models`, `text_encoders`, `vae`, `loras`, `audio_encoders`) y ejecutarse con los workflows oficiales. Incluye cuantizaciones fp16, bf16, fp8 scaled e int8, además de LoRAs de destilación (lightx2v) que permiten reducir el número de pasos de muestreo a 4, lo que abarata enormemente la inferencia.

El repositorio tiene un tamaño de 737,3 GB porque agrega todas las variantes y cuantizaciones en un solo lugar, aunque el usuario solo descarga los archivos que necesita. La licencia es Apache 2.0 y el pipeline declarado es image-to-video, si bien cubre también texto a vídeo y otras tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de difusión (variantes 14B y 5B), con pares high/low noise; incluye VAE y text encoder UMT5-XXL |
| Parametros totales | 14B (variantes principales) y 5B (variante TI2V) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusión, sin ventana de contexto textual) |
| Tipos de cuantizacion | fp16, bf16, fp8 scaled (e4m3fn), int8 (convrot) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

El repositorio agrupa pesos de modelos de difusión para vídeo de la familia Wan 2.2. Las variantes de 14B se distribuyen en pares de modelos "high noise" y "low noise", un esquema de dos etapas en el que un modelo se encarga de las primeras fases del proceso de difusión (estructura y movimiento global) y otro de las fases finales (detalle y refinado). La variante de 5B (TI2V) es un modelo único más ligero orientado a texto/imagen a vídeo. El pipeline incluye un text encoder UMT5-XXL (en fp16, fp8 o int8) y un VAE (wan2.2_vae o wan_2.1_vae según la variante). Para la generación de vídeo con audio (S2V) se emplea además un audio encoder wav2vec2 large en fp16.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos corresponden a las model cards originales de Wan-AI, no incluidas aquí. La innovación práctica más destacable del empaquetado es la inclusión de LoRAs de destilación de lightx2v (`wan2.2_i2v_lightx2v_4steps_lora_v1` y `wan2.2_t2v_lightx2v_4steps_lora_v1.1`, en versiones high y low noise), que permiten reducir la inferencia a 4 pasos de muestreo, y una LoRA de relight para la variante Animate. También se incluye una LoRA de destilación para ChronoEdit.

## Capacidades

- Generación de vídeo a partir de texto (T2V) con las variantes de 14B.
- Generación de vídeo a partir de imagen (I2V), incluido el modo primer-último fotograma a vídeo (flf2v).
- Generación de vídeo a partir de texto e imagen en la variante compacta de 5B (TI2V).
- Generación de vídeo dirigida por audio (S2V), sincronizando movimiento con una pista de audio mediante el audio encoder wav2vec2.
- Control de cámara (Fun Camera) para movimientos de cámara guiados.
- Control por condiciones adicionales (Fun Control), incluyendo control de 5B y 14B.
- Inpainting de vídeo (Fun Inpaint) en variantes de 5B y 14B.
- Transferencia y composición de vídeo (VACE Fun) para edición y control avanzado.
- Animación y transferencia de movimiento con la variante Animate 14B, con LoRA de relight.
- Edición de imagen con ChronoEdit 14B (pipeline de image edit, no de vídeo).
- Cuantizaciones fp8 e int8 para reducir requisitos de VRAM.

## Casos de uso

- Previsualización de storyboards animados: a partir de una imagen clave y una descripción textual, el modelo I2V de 14B genera un clip corto que permite validar encuadre y movimiento antes de producir en 3D.
- Doblaje y avatares parlantes: la variante S2V, junto con el audio encoder wav2vec2, sincroniza el movimiento de un personaje con una pista de voz, útil para vídeos corporativos o contenido formativo.
- Efectos de movimiento de cámara en postproducción: Fun Camera permite aplicar travellings, órbitas o zooms sintéticos sobre material existente sin rodar de nuevo.
- Restauración y borrado de objetos en vídeo: Fun Inpaint (5B o 14B) permite eliminar elementos no deseados o rellenar regiones ocluidas en secuencias.
- Prototipado rápido en estudio pequeño: la variante TI2V de 5B, más ligera, permite iterar en una GPU de consumo antes de pasar a las variantes de 14B para la versión final.
- Edición de imágenes publicitarias: ChronoEdit 14B permite modificar una imagen fija (cambiar fondo, iluminación o elementos) manteniendo coherencia, dentro de un flujo ComfyUI.
- Generación de clips para redes sociales con pocos pasos: combinando los modelos de 14B con las LoRAs lightx2v de 4 pasos se reduce el coste de muestreo, lo que hace viable generar múltiples variaciones por sesión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial en la información proporcionada. Como referencia orientativa, un modelo de difusión de 14B en fp16 requiere del orden de 28 GB solo para pesos, a los que se suman activaciones, VAE y text encoder; las cuantizaciones fp8 e int8 reducen sustancialmente ese requisito, pero no se dispone de cifras verificadas en esta ficha.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, las variantes de 14B en fp16/bf16 quedan fuera de GPUs de consumo de 24 GB sin cuantización u offloading; las variantes de 5B son las candidatas para GPUs de consumo.
- Cabe en GPU de consumo: la variante de 5B en fp16 es la más viable; las de 14B en fp8 o int8 podrían caber en GPUs de 24 GB o más, pero no se confirma en la información disponible.
- Opciones de despliegue: ComfyUI (nativo, con workflows oficiales), Comfy Cloud. No se documentan en esta información otros runners como vLLM, llama.cpp o TGI, que además no aplican a modelos de difusión.
- Latencia y throughput: no disponible. La inclusión de LoRAs de destilación de 4 pasos sugiere una reducción significativa del tiempo de muestreo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan 2.2 (este repo) | 14B / 5B | T2V, I2V, S2V, control, inpainting, edición | no aplica | Apache 2.0 | Hugging Face (Comfy-Org) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables sobre modelos comparables (parámetros, contexto, rendimiento o licencia) para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado para ComfyUI, no el repositorio original; para detalles de entrenamiento, sesgos y evaluación conviene consultar las model cards de Wan-AI y los repositorios base listados.
- El tamaño total del repositorio es de 737,3 GB; es necesario descargar selectivamente solo los archivos de la variante y cuantización que se vaya a usar.
- Los modelos de difusión de vídeo pueden generar artefactos temporales, inconsistencias entre fotogramas y degradación en secuencias largas; no se documentan métricas de calidad en la información disponible.
- Riesgo de sesgos y de contenido no deseado inherente a los datos de entrenamiento originales; no se detallan en esta información.
- No se documentan los idiomas soportados por el text encoder UMT5-XXL en este repositorio; la cobertura multilingüe debe verificarse en la documentación original.
- La licencia Apache 2.0 permite uso comercial, pero las licencias de los modelos base y de las LoRAs incluidas deben verificarse individualmente antes de producción.
- El pipeline declarado es image-to-video, aunque el repositorio cubre otras tareas; conviene no asumir que todas las variantes comparten los mismos requisitos de hardware.
- No se aportan cifras de latencia, throughput ni VRAM verificadas; cualquier planificación de infraestructura debe basarse en pruebas propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- Ejemplos de ComfyUI para Wan 2.2: https://comfyanonymous.github.io/ComfyUI_examples/wan22/
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Documentación oficial de ComfyUI: https://docs.comfy.org/
- Comfy Cloud: https://cloud.comfy.org/
- Workflow 14B Image to Video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_i2v.json
- Workflow 14B First-Last Frame to Video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_flf2v.json
- Workflow 14B Text to Video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_t2v.json
- Workflow 5B Video Generation: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_ti2v.json
- Workflow 14B Fun Control: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_control.json
- Workflow S2V Audio-Driven Video Generation: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_s2v.json
- Workflow ChronoEdit 14B Image Edit: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_chrono_edit_14B.json
- Workflow 14B Fun Camera Control: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_camera.json
- Workflow 5B Fun Control: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_control.json
- Workflow 14B Fun Inpaint: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_inpaint.json
- Workflow 5B Fun Inpaint: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_inpaint.json
- Modelo base ChronoEdit 14B: https://huggingface.co/nvidia/ChronoEdit-14B-Diffusers
- Modelo base Wan2.2-Animate-14B: https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
- Modelo base Wan2.2-I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Modelo base Wan2.2-S2V-14B: https://huggingface.co/Wan-AI/Wan2.2-S2V-14B
- Modelo base Wan2.2-T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Modelo base Wan2.2-Fun-A14B-Control: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control
- Modelo base Wan2.2-Fun-A14B-Control-Camera: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control-Camera
- Modelo base Wan2.2-Fun-5B-Control: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control
- Modelo base Wan2.2-Fun-A14B-InP: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-InP
- Modelo base Wan2.2-Fun-5B-InP: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-InP
- Modelo base Wan2.2-VACE-Fun-A14B: https://huggingface.co/alibaba-pai/Wan2.2-VACE-Fun-A14B
- LoRAs de destilación lightx2v: https://huggingface.co/lightx2v/Wan2.2-Distill-Loras
