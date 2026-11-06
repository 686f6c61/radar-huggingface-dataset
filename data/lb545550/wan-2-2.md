# Lb545550/Wan-2.2

## Resumen

Wan-2.2 (repositorio `Lb545550/Wan-2.2`) es un paquete de pesos reempaquetados para ComfyUI que agrupa los distintos checkpoints de la familia Wan 2.2, una coleccion de modelos de difusion para generacion y edicion de video desarrollada originalmente por Alibaba (Wan-AI) y ampliada por terceros como alibaba-pai y NVIDIA. No se trata de un modelo unico entrenado desde cero, sino de una recopilacion curada de ficheros en formato `safetensors` de un solo archivo (`diffusion-single-file`) pensada para que el usuario los coloque directamente en las carpetas de ComfyUI y pueda ejecutar los flujos de trabajo oficiales sin conversiones adicionales.

El paquete incluye variantes de texto a video (T2V), imagen a video (I2V), texto e imagen a video (TI2V), animacion con audio (S2V), control de camara e inpainting (familia Fun), edicion de imagen (ChronoEdit de NVIDIA) y LoRAs de destilacion para reducir el numero de pasos de inferencia. Convive con los text encoders UMT5 XXL, los VAE de Wan 2.1 y 2.2 y el codificador de audio wav2vec2 large english.

Es relevante para desarrolladores porque centraliza en un solo repositorio los pesos necesarios para reproducir los workflows de video generativo de Wan 2.2 en ComfyUI, con licencia Apache 2.0 en el empaquetado. El tamano del repositorio (728,7 GB) refleja que contiene todos los checkpoints en varias precisiones (bf16, fp16, fp8, int8) y no un unico modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de difusion (DiT) de la familia Wan 2.2; variantes de 14B y 5B, con esquema high-noise/low-noise en los 14B |
| Parametros totales | 14B (variantes principales) y 5B (variantes TI2V y Fun 5B); no disponible el desglose exacto por submodelo |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusion para video, no LLM) |
| Tipos de cuantizacion | bf16, fp16, fp8_scaled, int8_convrot (en Animate 14B) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de cada submodelo; la informacion disponible indica unicamente que se trata de modelos de difusion de la familia Wan 2.2, con checkpoints separados para "high noise" y "low noise" en las variantes de 14B (T2V, I2V, Fun Control, Fun Inpaint, Fun VACE, Fun Camera). Este esquema de dos etapas es habitual en pipelines de difusion que dividen el proceso de denoising en dos modelos especializados. Las variantes de 5B (TI2V, Fun Control, Fun Inpaint) emplean un unico checkpoint.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO (no aplicables de forma estandar a modelos de difusion). El paquete incluye LoRAs de destilacion de lightx2v (`wan2.2_i2v_lightx2v_4steps_lora_v1`, `wan2.2_t2v_lightx2v_4steps_lora_v1.1`) que permiten reducir la inferencia a 4 pasos, y una LoRA de destilacion para ChronoEdit. Tambien incorpora una LoRA de relighting para Animate 14B. El modelo base `nvidia/ChronoEdit-14B-Diffusers` aporta la capacidad de edicion de imagen.

## Capacidades

- Generacion de video a partir de texto (T2V) con los checkpoints `wan2.2_t2v_*_14B`.
- Generacion de video a partir de una imagen (I2V) con los checkpoints `wan2.2_i2v_*_14B`.
- Generacion de video a partir de texto e imagen combinados (TI2V) con el checkpoint de 5B.
- Generacion de video entre primer y ultimo fotograma (first-last frame to video, flf2v).
- Animacion de video dirigida por audio (S2V) con `wan2.2_s2v_14B`, apoyada en el codificador wav2vec2.
- Control de camara (Fun Camera 14B) para trayectorias de camara definidas.
- Inpainting de video (Fun Inp 14B y 5B) para rellenar o sustituir regiones.
- Control estructural (Fun Control 14B y 5B), incluido VACE Fun 14B.
- Edicion de imagen con ChronoEdit 14B (NVIDIA), con LoRA de destilacion.
- Reduccion de pasos de inferencia mediante LoRAs lightx2v de 4 pasos.
- Integracion directa con ComfyUI mediante workflows oficiales en JSON.

## Casos de uso

- Prototipado rapido de video generativo en ComfyUI: el usuario descarga los checkpoints y los coloca en `models/diffusion_models/`, y puede cargar los workflows oficiales de Comfy-Org para T2V, I2V o TI2V sin convertir pesos.
- Generacion de clips publicitarios a partir de una imagen de producto: con `wan2.2_i2v_high_noise_14B` y `low_noise_14B` se anima una fotografia fija manteniendo coherencia visual entre etapas de denoising.
- Doblaje o animacion de retratos con audio: `wan2.2_s2v_14B` junto con `wav2vec2_large_english_fp16` permite sincronizar movimiento facial o corporal con una pista de voz en ingles.
- Control creativo de camara en secuencias: `wan2.2_fun_camera_14B` posibilita definir trayectorias de camara (dolly, orbita, paneo) sobre una escena generada o existente.
- Restauracion o sustitucion de elementos en video: `wan2.2_fun_inpaint_14B` y `wan2.2_fun_inpaint_5B` permiten eliminar objetos o rellenar regiones con coherencia temporal.
- Edicion de imagen con NVIDIA ChronoEdit 14B: util para retoques fotorrealistas dentro del mismo entorno ComfyUI, con la LoRA de destilacion para acelerar la generacion.
- Iteracion rapida en produccion: las LoRAs lightx2v de 4 pasos reducen el coste computacional por clip, lo que facilita pruebas A/B de prompts y configuraciones antes de lanzar la inferencia completa.
- Investigacion en generacion de video: el paquete permite comparar variantes 5B frente a 14B, y high-noise frente a low-noise, con la misma infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial en la informacion proporcionada. Como referencia orientativa por tamano de checkpoint, un modelo de 14B en bf16/fp16 ocupa del orden de 28 GB solo en pesos, y uno de 5B del orden de 10 GB; a esto hay que sumar activaciones, VAE y text encoder UMT5 XXL (que en fp16 ronda los 20 GB adicionales si se carga en GPU).
- Las variantes `fp8_scaled` reducen aproximadamente a la mitad el peso del checkpoint respecto a bf16/fp16; la variante `int8_convrot` de Animate 14B aplica una cuantizacion int8 con rotacion de convoluciones.
- GPU recomendadas: no disponibles en la informacion. Por tamano, las variantes de 14B en precision completa requieren GPUs de clase profesional (A100 80 GB, H100) o descarga parcial a CPU; las variantes de 5B y las fp8 pueden intentarse en GPUs de consumo de gama alta con suficiente VRAM, aunque no se confirma en la documentacion.
- Opciones de despliegue: ComfyUI es el entorno objetivo (formato `diffusion-single-file`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan 2.2 (este paquete) | 14B y 5B | Difusion de video (T2V, I2V, S2V, control, inpainting) | Apache 2.0 | Pesos en Hugging Face, workflows ComfyUI |
| Wan-AI/Wan2.2-T2V-A14B | 14B | Difusion texto a video | no disponible en la informacion | Repositorio original en Hugging Face |
| Wan-AI/Wan2.2-I2V-A14B | 14B | Difusion imagen a video | no disponible en la informacion | Repositorio original en Hugging Face |
| Wan-AI/Wan2.2-TI2V-5B | 5B | Difusion texto e imagen a video | no disponible en la informacion | Repositorio original en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio es un reempaquetado de terceros (`Lb545550`), no el repositorio oficial de Wan-AI; la trazabilidad y el mantenimiento dependen del autor del paquete.
- El tamano total del repositorio (728,7 GB) implica una descarga muy costosa en disco y ancho de banda; conviene descargar solo los ficheros necesarios.
- No se documentan sesgos, tasas de alucinacion visual ni limitaciones de idioma; el codificador de audio incluido es `wav2vec2_large_english`, lo que sugiere que la funcionalidad S2V esta orientada al ingles.
- La licencia declarada es Apache 2.0, pero al tratarse de un agregado de multiples modelos base conviene verificar la licencia de cada repositorio original antes de un uso comercial.
- Los modelos de difusion de video pueden generar contenido visual inexacto, artefactos temporales o incoherencias entre fotogramas; no se han publicado evaluaciones de calidad en la informacion disponible.
- No hay garantias de compatibilidad futura con versiones de ComfyUI distintas de las documentadas en los workflows enlazados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lb545550/Wan-2.2
- Ejemplos de ComfyUI para Wan 2.2: https://comfyanonymous.github.io/ComfyUI_examples/wan22/
- Workflow I2V 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_i2v.json
- Workflow FLF2V 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_flf2v.json
- Workflow T2V 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_t2v.json
- Workflow TI2V 5B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_ti2v.json
- Workflow Fun Control 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_control.json
- Workflow S2V: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_s2v.json
- Workflow ChronoEdit 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_chrono_edit_14B.json
- Workflow Fun Camera 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_camera.json
- Workflow Fun Control 5B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_control.json
- Workflow Fun Inpaint 14B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_inpaint.json
- Workflow Fun Inpaint 5B: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_inpaint.json
- Modelo base ChronoEdit: https://huggingface.co/nvidia/ChronoEdit-14B-Diffusers
- Modelo base Animate 14B: https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
- Fun Camera 14B: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control-Camera
- Fun Control 14B: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control
- Fun Control 5B: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control
- Fun InP 5B: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-InP
- Fun InP 14B: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-InP
- VACE Fun 14B: https://huggingface.co/alibaba-pai/Wan2.2-VACE-Fun-A14B
- I2V A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- S2V 14B: https://huggingface.co/Wan-AI/Wan2.2-S2V-14B
- T2V A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- TI2V 5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- LoRAs de destilacion lightx2v: https://huggingface.co/lightx2v/Wan2.2-Distill-Loras
