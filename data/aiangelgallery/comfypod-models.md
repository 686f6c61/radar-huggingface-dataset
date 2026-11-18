# AiAngelGallery/ComfyPod-Models

## Resumen

ComfyPod-Models no es un modelo de IA propiamente dicho, sino un repositorio espejo (mirror) que reempaqueta los ficheros de pesos que descarga la plantilla gratuita AI Angel ComfyPod para RunPod. Su autor, AiAngelGallery, mantiene copias byte a byte idénticas (verificadas por SHA-256) de modelos de terceros —MiniMax H3, Krea 2, SCAIL-2, Wan 2.1 y adaptadores derivados— organizadas con la estructura de carpetas de ComfyUI (`text_encoders/`, `vae/`, `loras/`, `diffusion_models/`, etc.). El objetivo es evitar que la plantilla deje de funcionar cuando un repositorio upstream mueva o elimine un fichero.

El contenido abarca principalmente modelos generativos multimodales de vídeo e imagen: el modelo de difusión MiniMax H3 (con VAE de vídeo y de audio, y LoRAs de destilación turbo de 4 y 8 pasos), el modelo de imagen Krea 2 Turbo, el modelo de vídeo SCAIL-2 basado en Wan 2.1 de 14B, y codificadores de texto Qwen3-VL de 32B y 4B en cuantizaciones NVFP4/AWQ e FP8. El repositorio ocupa 166,1 GB y acumula cerca de 700.000 descargas, lo que refleja su uso como dependencia operativa de un flujo de trabajo concreto más que como modelo para evaluación individual.

Es relevante ahora porque ejemplifica un patrón creciente en el ecosistema open source: la dependencia de artefactos alojados en Hugging Face dentro de pipelines de generación (ComfyUI + RunPod) y la necesidad de espejos estables ante la volatilidad de los repositorios upstream. Para un desarrollador o investigador, la ficha debe leerse como un índice de componentes con licencias heterogéneas, no como la de un modelo único con una licencia y unas capacidades homogéneas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio espejo multi-modelo; contiene modelos de difusión (MiniMax H3, Krea 2, SCAIL-2/Wan 2.1), VAE de vídeo/audio/imagen, codificadores de texto Qwen3-VL y LoRAs |
| Parametros totales | No disponible (repositorio agregado; el mayor componente es un codificador de texto Qwen3-VL de 32B y un modelo de difusión Wan 2.1 de 14B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (convrot), fp8 (e4m3fn scaled), fp16, bf16, fp32, nvfp4 + awq |
| Idiomas soportados | No disponible |
| Licencia | Mixta (`mixed-see-readme`): MiniMax H3 Community License, Krea 2 Community License, MIT, Apache-2.0, Qwen Research License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: agrega artefactos de inferencia ya entrenados por terceros. Los componentes principales son modelos de difusión para generación de vídeo e imagen. MiniMax H3 se distribuye con VAE de vídeo en fp16, VAE de audio en fp32, un codificador de texto Qwen3-VL de 32B cuantizado a NVFP4 con AWQ, y LoRAs de destilación turbo (4 y 8 pasos) para reducción de pasos de muestreo. Krea 2 Turbo se sirve en int8 con un codificador Qwen3-VL de 4B en FP8 y VAE de Qwen-Image. SCAIL-2 se basa en Wan 2.1 de 14B en int8, con LoRA DPO y LoRA de destilación de pasos de lightx2v, más el codificador UMT5-XXL en FP8 y CLIP Vision H.

Las innovaciones técnicas destacables son las cuantizaciones específicas para inferencia en GPU de consumo y servidor (int8 con "convrot", FP8 e4m3fn escalado, NVFP4+AWQ), las LoRAs de destilación que permiten muestrear en 3, 4 u 8 pasos, y los modelos híbridos de smhfacct que combinan los modos fl2va y ref2va de MiniMax H3 en un único checkpoint int8. No se dispone de información sobre composición del dataset, número de tokens de entrenamiento ni procesos de RLHF/DPO más allá de la LoRA DPO incluida para SCAIL-2.

## Capacidades

- Generación de vídeo a partir de texto e imagen: MiniMax H3 con modos fl2v (first-last frame to video) y ref2v (reference to video), más checkpoints híbridos fl2va/ref2va.
- Generación de audio asociada al vídeo: el repositorio incluye un VAE de audio específico de MiniMax H3 (`minimax_h3_audio_vae_fp32`).
- Generación de imagen: Krea 2 Turbo en int8 con LoRA de edición de identidad (`krea2_identity_edit_v1_2`).
- Edición y adaptación de imagen sobre Qwen Image 2.1: LoRAs `bfs_head_v1.1_qwen_2.1` y `canon_qwen21`.
- Destilación de pasos de muestreo: LoRAs turbo de 3, 4 y 8 pasos para MiniMax H3 y SCAIL-2, que reducen el coste de inferencia.
- Codificación de texto multimodal: Qwen3-VL de 32B (NVFP4/AWQ) y de 4B (FP8), aptos para prompts largos y con entrada visual.
- Upscaling latente 3D: `minimax_h3_latent_upscaler_3d_bf16` para aumentar la resolución de latentes de vídeo.
- VAE aproximado rápido: `taeh3` (TAE) para decodificación acelerada durante previsualización.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible (el repositorio contiene modelos generativos, no LLM de propósito general).

## Casos de uso

- Despliegue reproducible de un pipeline ComfyUI en RunPod: la plantilla AI Angel ComfyPod apunta a este espejo, de modo que los ficheros de `models/` se descargan siempre con el mismo SHA-256 y el flujo no se rompe si un upstream mueve o borra un peso.
- Generación de vídeo corto a partir de una imagen de referencia: usar MiniMax H3 ref2v con la LoRA turbo de 4 pasos para producir clips con identidad consistente en pocos pasos de muestreo, adecuado para prototipado rápido.
- Interpolación first-last frame: los checkpoints fl2v de MiniMax H3 permiten generar la transición entre dos fotogramas clave, útil en animática y previsualización de storyboards.
- Generación de imagen comercial con Krea 2 Turbo: el checkpoint int8 más la LoRA de edición de identidad permiten iterar retratos o productos manteniendo el sujeto entre generaciones.
- Restauración o adaptación estilística sobre Qwen Image 2.1: las LoRAs `bfs_head_v1.1_qwen_2.1` y `canon_qwen21` se aplican sobre el modelo base para ajustar el estilo de salida sin reentrenar.
- Vídeo con audio sincronizado: combinar el modelo de difusión MiniMax H3 con su VAE de audio permite generar clips con pista sonora en el mismo pipeline.
- Previsualización de bajo coste: el VAE aproximado `taeh3` y el upscaler latente 3D permiten validar composiciones antes de lanzar la decodificación completa, reduciendo el tiempo de iteración en GPU.
- Replicación de un entorno de investigación: investigadores que necesiten comparar MiniMax H3, Krea 2 y SCAIL-2 pueden montar los tres desde un único repositorio con licencias documentadas por fichero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada. El repositorio completo son 166,1 GB en disco; la VRAM necesaria depende del componente que se cargue en cada momento.
- MiniMax H3: el codificador de texto Qwen3-VL de 32B en NVFP4/AWQ y el modelo de difusión en int8 requieren GPUs de clase servidor (A100 80 GB, H100 80 GB) para carga simultánea; con descarga secuencial de componentes puede reducirse el pico.
- Krea 2 Turbo: el checkpoint int8 más el codificador Qwen3-VL de 4B en FP8 y el VAE de Qwen-Image son compatibles con GPUs de consumo de gama alta (RTX 4090 24 GB) si se gestiona la memoria por etapas.
- SCAIL-2 / Wan 2.1 14B: el modelo de difusión en int8 más UMT5-XXL en FP8 y CLIP Vision H encajan en 24 GB con offloading; en 16 GB requiere cuantización adicional o carga por capas.
- LoRAs y VAE: los ficheros bf16/fp16 de LoRA y VAE son ligeros y no determinan el requisito de VRAM.
- Opciones de despliegue: ComfyUI es el entorno de referencia del repositorio; la plantilla RunPod es el mecanismo de despliegue previsto. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no son modelos de lenguaje.
- Latencia y throughput: no disponibles. Las LoRAs turbo de 3, 4 y 8 pasos están diseñadas para reducir el número de evaluaciones del modelo de difusión, pero no se publican cifras de tiempo por clip.

## Comparativa con modelos similares

| Repositorio | Contenido | Tamano | Licencia | Enfoque |
|---|---|---|---|---|
| AiAngelGallery/ComfyPod-Models | Espejo multi-modelo (MiniMax H3, Krea 2, SCAIL-2, Wan 2.1, LoRAs) | 166,1 GB | Mixta | Dependencia operativa de una plantilla ComfyUI |
| Comfy-Org/MiniMax-H3 | Modelo MiniMax H3 original empaquetado para ComfyUI | No disponible | MiniMax H3 Community License | Fuente upstream de los pesos de vídeo/audio |
| Comfy-Org/Krea-2 | Krea 2 Turbo empaquetado para ComfyUI | No disponible | Krea 2 Community License | Fuente upstream del modelo de imagen |
| Comfy-Org/SCAIL-2 | SCAIL-2 sobre Wan 2.1 14B | No disponible | MIT | Fuente upstream del modelo de vídeo |

La comparativa relevante no es de rendimiento sino de función: ComfyPod-Models se distingue de los repositorios de Comfy-Org por agregar varios modelos bajo una estructura única y por garantizar inmutabilidad de los ficheros, a cambio de una licencia agregada mixta y de un tamaño de descarga muy superior al de cualquier componente individual.

## Limitaciones y advertencias

- No es un modelo evaluable de forma unitaria: las capacidades, el contexto y los benchmarks dependen del componente concreto que se cargue.
- Licencia mixta: cada fichero hereda la licencia de su autor original (MiniMax H3 Community License, Krea 2 Community License, MIT, Apache-2.0, Qwen Research License). El uso comercial exige revisar fichero a fichero; la Qwen Research License en particular restringe el uso comercial de los adaptadores sobre Qwen Image 2.1.
- El repositorio se declara como espejo sin modificaciones; cualquier corrección o actualización debe llegar desde el upstream, y el autor advierte de que atenderá peticiones de retirada de autores originales.
- Riesgo de desactualización: si un upstream publica una versión nueva, el espejo puede quedar anclado a una versión antigua por diseño.
- Riesgo de alucinación y sesgos: aplicable a los modelos generativos subyacentes (MiniMax H3, Krea 2, SCAIL-2), no documentado en la información disponible.
- Idiomas soportados: no disponibles; los codificadores Qwen3-VL y UMT5-XXL condicionan el multilingüismo de los prompts, pero no se especifica cobertura.
- El fichero `sam3.1_multiplex_fp16` no está espejado por estar sujeto a Meta SAM License con acceso restringido, lo que introduce una dependencia externa en el pipeline.
- El tamaño de 166,1 GB implica coste de almacenamiento y de transferencia relevante en entornos cloud; conviene descargar solo los componentes necesarios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AiAngelGallery/ComfyPod-Models
- Plantilla y guía AI Angel ComfyPod: https://www.thepexcel.com/aiangel-comfypod/
- Repositorio GitHub de la plantilla: https://github.com/ThepExcel/AiAngelComfyPod
- Comfy-Org/MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- Kijai/MiniMax-H3-TAE: https://huggingface.co/Kijai/MiniMax-H3-TAE
- LBH-123-AI/Minimax_h3_latent_Upscaler: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- Robert1212star/TaoMate-H3-3Step-ComfyUI: https://huggingface.co/Robert1212star/TaoMate-H3-3Step-ComfyUI
- TaoLiveAIGC/TaoMate-H3: https://huggingface.co/TaoLiveAIGC/TaoMate-H3
- FastVideo/FastVideo-FastH3-4-step-Preview-v1-LoRA: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-LoRA
- Civitai model 2898443: https://civitai.com/models/2898443
- Comfy-Org/SCAIL-2: https://huggingface.co/Comfy-Org/SCAIL-2
- zai-org/SCAIL-2: https://huggingface.co/zai-org/SCAIL-2
- Kijai/WanVideo_comfy: https://huggingface.co/Kijai/WanVideo_comfy
- lightx2v/Wan2.1-I2V-14B-480P-StepDistill-CfgDistill-Lightx2v: https://huggingface.co/lightx2v/Wan2.1-I2V-14B-480P-StepDistill-CfgDistill-Lightx2v
- Comfy-Org/Wan_2.1_ComfyUI_repackaged: https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged
- Comfy-Org/Krea-2: https://huggingface.co/Comfy-Org/Krea-2
- krea/Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Comfy-Org/Qwen-Image_ComfyUI: https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI
- conradlocke/krea2-identity-edit: https://huggingface.co/conradlocke/krea2-identity-edit
- Civitai model 2027766: https://civitai.com/models/2027766?modelVersionId=3356102
- Civitai model 2783143: https://civitai.com/models/2783143?modelVersionId=3352035
- Civitai model 2838593: https://civitai.com/models/2838593?modelVersionId=3391975
