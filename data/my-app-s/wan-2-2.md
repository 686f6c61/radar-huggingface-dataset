# my-app-s/Wan-2.2

## Resumen

Wan 2.2 es una familia de modelos de difusion para generacion y edicion de video desarrollada originalmente por Wan-AI (Alibaba), con variantes adicionales publicadas por alibaba-pai (Fun) y nvidia (ChronoEdit). Este repositorio concreto, `my-app-s/Wan-2.2`, no es un modelo entrenado por su autor, sino un repackaging de los pesos originales en formato single-file (`safetensors`) pensado para su uso directo en ComfyUI. Incluye variantes de texto a video (T2V), imagen a video (I2V), primer y ultimo fotograma a video (FLF2V), video a video con control, inpainting de video, control de camara, animacion con audio (S2V) y edicion de imagen (ChronoEdit).

La familia combina modelos de 14B parametros (variantes de alta y baja relacion senal-ruido, con y sin control) y un modelo mas ligero de 5B (TI2V). El pipeline declarado es `image-to-video`, la licencia es Apache 2.0 y el repositorio ocupa 728,7 GB, lo que refleja que agrupa decenas de checkpoints en precision bf16/fp16, fp8 escalado e int8, ademas de VAEs, text encoders (umt5-xxl) y LoRAs de destilacion (lightx2v) para reducir el numero de pasos de inferencia.

Su relevancia practica es alta para quien trabaja con generacion de video open source: concentra en un unico repositorio todos los artefactos necesarios para montar workflows de ComfyUI sin depender de multiples descargas, e incluye variantes destiladas que permiten generar video en pocos pasos. No obstante, al ser un repackaging, no aporta informacion propia sobre entrenamiento ni benchmarks, y su adopcion en la comunidad es practicamente nula (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (diffusion transformer) para video e imagen; variantes high-noise/low-noise en los modelos de 14B |
| Parametros totales | 14B (variantes principales) y 5B (TI2V, Fun Control, Fun Inpaint) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica; modelo generativo de video, no LLM) |
| Tipos de cuantizacion | bf16, fp16, fp8 escalado (`fp8_scaled`), int8 (`int8_convrot`) |
| Idiomas soportados | no disponible (el text encoder umt5-xxl es multilingue, pero no se detalla cobertura) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file, para ComfyUI) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna ni el proceso de entrenamiento; se limita a indicar que son archivos reempaquetados para ComfyUI y a enlazar los repositorios originales. Por la estructura de ficheros se deduce el uso de un diffusion transformer con el esquema de dos etapas (high noise / low noise) propio de Wan 2.2 en las variantes de 14B: un checkpoint para las primeras fases del proceso de difusion y otro para las finales, lo que mejora la calidad del movimiento y del detalle. Las variantes de 5B (TI2V, Fun Control, Fun Inpaint) se distribuyen como un unico checkpoint.

El pipeline incluye el text encoder `umt5_xxl` (en fp16 y fp8 e4m3fn escalado), el VAE `wan2.2_vae` y el VAE heredado `wan_2.1_vae`, ademas de un encoder de audio `wav2vec2_large_english_fp16` para la variante S2V (audio a video). Tambien se incluyen LoRAs de destilacion de lightx2v (`wan2.2_i2v_lightx2v_4steps_lora_v1_*` y `wan2.2_t2v_lightx2v_4steps_lora_v1.1_*`) que permiten reducir la inferencia a 4 pasos, y una LoRA de relight para la variante Animate. No se proporcionan datos sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Generacion de video a partir de texto (T2V) con las variantes de 14B.
- Generacion de video a partir de una imagen (I2V) con checkpoints high-noise y low-noise de 14B.
- Generacion de video a partir de primer y ultimo fotograma (FLF2V).
- Generacion texto-imagen-video con el modelo ligero de 5B (TI2V).
- Control de video: variantes Fun Control (14B y 5B) para condicionar la generacion con senales de control.
- Control de camara: `Wan2.2-Fun-A14B-Control-Camera` para trayectorias de camara definidas.
- Inpainting de video: variantes Fun Inpaint de 14B y 5B.
- Video a video con VACE (`Wan2.2-VACE-Fun-A14B`).
- Animacion de personajes con audio (`Wan2.2-Animate-14B`) y generacion audio-driven (`Wan2.2-S2V-14B`) usando wav2vec2 como encoder de audio.
- Edicion de imagen con ChronoEdit 14B (NVIDIA), incluyendo una LoRA de destilacion.
- Inferencia acelerada en 4 pasos mediante LoRAs de lightx2v.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo de difusion).

## Casos de uso

- Prototipado rapido de video generativo en ComfyUI: al agrupar todos los checkpoints, VAEs, text encoders y LoRAs en un solo repositorio, permite montar los workflows oficiales de ComfyUI (T2V, I2V, FLF2V, S2V, Fun Control, Fun Camera) sin descargas dispersas.
- Generacion de clips publicitarios a partir de una imagen de producto: la variante I2V de 14B con checkpoints high/low noise mantiene la identidad visual del producto y genera movimiento coherente en planos cortos.
- Animacion de retratos o avatares con audio: la variante S2V, combinada con `wav2vec2_large_english_fp16`, sincroniza el movimiento labial con una pista de voz para videos explicativos o avatares corporativos.
- Edicion y retoque de imagen fija: ChronoEdit 14B con su LoRA de destilacion permite ediciones guiadas por instrucciones en flujos de postproduccion, con inferencia acelerada.
- Inpainting de video para eliminar objetos o restaurar zonas: las variantes Fun Inpaint de 14B y 5B permiten rellenar regiones enmascaradas manteniendo coherencia temporal entre fotogramas.
- Control de camara en previsualizacion de escenas 3D: Fun Control Camera permite definir trayectorias de camara y generar el video resultante para previsualizaciones de storyboard.
- Generacion de video en 4 pasos para iteracion rapida: las LoRAs lightx2v reducen el coste de inferencia, lo que facilita la exploracion de variaciones en entornos con GPU limitada.
- Repackaging y distribucion interna: equipos que ya usan ComfyUI pueden alojar este repositorio como espejo interno para estandarizar versiones de checkpoints y LoRAs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de calidad, FVD, CLIP score ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial en el repositorio. Como referencia orientativa por tamano de checkpoint: las variantes de 14B en bf16/fp16 requieren del orden de 28 GB solo para pesos, por lo que necesitan GPU de 40-80 GB (A100 40/80 GB, H100) o descarga por CPU/offload; las versiones `fp8_scaled` reducen aproximadamente a la mitad el peso de los pesos y pueden caber en GPU de 24 GB (RTX 4090) con offload parcial; las variantes de 5B en bf16 rondan los 10 GB de pesos y son viables en GPU consumer de 16-24 GB.
- GPU recomendadas: A100 80 GB o H100 para las variantes de 14B en precision completa; RTX 4090 (24 GB) para variantes fp8 y modelos de 5B; RTX 3090 (24 GB) como alternativa consumer.
- Cabe en GPU consumer: si, con las variantes de 5B y con las de 14B en fp8/fp16 usando offload; no es realista en GPU de menos de 16 GB sin cuantizacion agresiva y offload.
- Opciones de despliegue: ComfyUI es el destino previsto (los ficheros son single-file para `models/diffusion_models`, `models/loras`, `models/vae`, `models/text_encoders`, `models/audio_encoders`). No se documentan instrucciones para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles. Las LoRAs lightx2v permiten inferencia en 4 pasos, lo que reduce el coste frente a los muestreos completos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan 2.2 (este repackaging) | 14B / 5B | Difusion de video (T2V, I2V, control, S2V, edicion) | no aplica | Apache 2.0 | Hugging Face, ComfyUI |
| Wan-AI/Wan2.2-T2V-A14B (original) | 14B | Difusion de video T2V | no aplica | Apache 2.0 | Hugging Face |
| Wan-AI/Wan2.2-I2V-A14B (original) | 14B | Difusion de video I2V | no aplica | Apache 2.0 | Hugging Face |
| nvidia/ChronoEdit-14B-Diffusers | 14B | Edicion de imagen | no aplica | no disponible en la informacion | Hugging Face |

La comparativa se limita a los modelos base enlazados en la propia model card; no se dispone de datos de rendimiento para comparar calidad ni velocidad entre ellos.

## Limitaciones y advertencias

- El repositorio no documenta el modelo: es un repackaging de terceros, por lo que la informacion tecnica debe contrastarse en los repositorios originales de Wan-AI, alibaba-pai y nvidia.
- No se han publicado benchmarks ni evaluaciones de calidad en este repositorio.
- El tamano total (728,7 GB) implica un coste de almacenamiento y descarga muy elevado; conviene descargar solo los checkpoints necesarios.
- Riesgo de alucinacion visual y artefactos temporales inherente a los modelos de difusion de video; no hay garantias de coherencia en clips largos.
- El encoder de audio `wav2vec2_large_english_fp16` esta orientado a ingles; la variante S2V puede degradarse con audio en otros idiomas.
- El text encoder umt5-xxl es multilingue, pero no se detalla la cobertura real por idioma.
- La licencia Apache 2.0 se declara en el repositorio, pero conviene verificar las condiciones de cada modelo base enlazado (especialmente ChronoEdit, cuya licencia no se especifica en la informacion disponible).
- El uso comercial de las variantes derivadas puede estar sujeto a las condiciones de los modelos originales y de las LoRAs de terceros (lightx2v), no solo a la licencia del repackaging.
- Con 0 descargas y 0 likes, no hay evidencia de validacion por parte de la comunidad; tratar como repositorio no auditado.
- La fecha de creacion indicada (2026-11-02) es posterior a la consulta, lo que sugiere un posible error de metadatos; conviene verificar la integridad de los ficheros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/my-app-s/Wan-2.2
- Modelo base Wan2.2-Animate-14B: https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
- Modelo base Wan2.2-I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Modelo base Wan2.2-T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Modelo base Wan2.2-S2V-14B: https://huggingface.co/Wan-AI/Wan2.2-S2V-14B
- Modelo base ChronoEdit-14B-Diffusers: https://huggingface.co/nvidia/ChronoEdit-14B-Diffusers
- Modelo base Wan2.2-Fun-A14B-Control-Camera: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control-Camera
- Modelo base Wan2.2-Fun-A14B-Control: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control
- Modelo base Wan2.2-Fun-5B-Control: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control
- Modelo base Wan2.2-Fun-5B-InP: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-InP
- Modelo base Wan2.2-Fun-A14B-InP: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-InP
- Modelo base Wan2.2-VACE-Fun-A14B: https://huggingface.co/alibaba-pai/Wan2.2-VACE-Fun-A14B
- LoRAs de destilacion lightx2v: https://huggingface.co/lightx2v/Wan2.2-Distill-Loras
- Ejemplos de ComfyUI para Wan 2.2: https://comfyanonymous.github.io/ComfyUI_examples/wan22/
- Workflow I2V 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_i2v.json
- Workflow FLF2V 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_flf2v.json
- Workflow T2V 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_t2v.json
- Workflow TI2V 5B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_ti2v.json
- Workflow Fun Control 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_control.json
- Workflow S2V audio-driven: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_s2v.json
- Workflow ChronoEdit 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_chrono_edit_14B.json
- Workflow Fun Camera Control 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_camera.json
- Workflow Fun Control 5B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_control.json
- Workflow Fun Inpaint 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_inpaint.json
- Workflow Fun Inpaint 5B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_inpaint.json
