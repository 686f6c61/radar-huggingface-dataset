# kevin-mi/FastH3-4step-Preview-overlay

## Resumen

FastH3 4-step Preview Overlay es un repositorio de metadatos y lógica de materialización que permite utilizar el checkpoint base `FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree` con el soporte nativo de SGLang Diffusion para la arquitectura MiniMax-H3. El modelo base es una destilación DMD2 de MiniMax H3 que genera vídeo y audio sincronizado a partir de texto en solo 4 pasos de inferencia, empleando atención dispersa al 90% (Video Sparse Attention, VSA) para lograr una aceleración de hasta 14x en GPUs Blackwell en comparación con el modelo denso original.

Este overlay no contiene los pesos del modelo; en su lugar, define el contrato de liberación (`model_index.json`), un script de materialización (`_overlay/materialize.py`) que re-serializa el VAE de vídeo en la forma fusionada que espera SGLang, y deriva el buffer `rope.inv_freq` que falta en la exportación de Diffusers. SGLang resuelve automáticamente este overlay al cargar el modelo, por lo que el usuario no necesita pasos manuales. La relevancia actual radica en que permite ejecutar un modelo de vídeo-audio de última generación con un framework de inferencia optimizado, reduciendo drásticamente el coste computacional frente a la generación densa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 (transformer híbrido con atención dispersa VSA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint base se distribuye en bf16 según la variante de ComfyUI) |
| Idiomas soportados | no disponible (presumiblemente multilingüe, pero no confirmado) |
| Licencia | MiniMax-H3 Community License (heredada del checkpoint base) |
| Formato de pesos | safetensors (checkpoint base), overlay con metadatos y script Python |

## Arquitectura y entrenamiento

El modelo base es una destilación DMD2 (Distribution Matching Distillation) de MiniMax H3, un transformer híbrido que combina atención lineal y dispersa para modelar secuencias largas de vídeo y audio. La destilación reduce el número de pasos de muestreo de decenas a solo 4, manteniendo la calidad visual y auditiva mediante un entrenamiento de distribución matching. La innovación clave es la atención dispersa al 90% (Video Sparse Attention, VSA), que descarta la mayoría de los pares de tokens no relevantes en el espacio vídeo-audio, reduciendo el coste computacional y de memoria. El entrenamiento se realizó con datos de vídeo y audio emparejados, y el checkpoint Preview v1 soporta exclusivamente la tarea text-to-video-and-audio (T2VA). El overlay no modifica los pesos; solo reorganiza la estructura de archivos para que SGLang pueda cargarlos correctamente, incluyendo la fusión del VAE de vídeo y la derivación de las frecuencias de rotación (rope.inv_freq).

## Capacidades

- Generación de vídeo y audio sincronizado a partir de descripciones textuales (T2VA).
- Inferencia en 4 pasos gracias a la destilación DMD2, reduciendo la latencia frente a modelos de 20-50 pasos.
- Atención dispersa al 90% que permite procesar secuencias largas de vídeo con menor coste computacional.
- Soporte nativo en SGLang Diffusion mediante el backend `video_sparse_attn_h3` y atención FA para el text encoder.
- Integración con ComfyUI mediante un LoRA no oficial (disponible en Civitai) para flujos de trabajo de vídeo.
- Capacidad de generar vídeo con audio de fondo coherente, no solo pista visual.
- No soporta otras tareas como image-to-video o edición en esta versión Preview (solo T2VA).

## Casos de uso

- **Generación de vídeos promocionales para marketing**: un equipo creativo puede describir una escena con texto y obtener un clip de vídeo con audio en segundos, acelerando la producción de prototipos visuales.
- **Creación de contenido para redes sociales**: influencers y editores pueden generar clips cortos con música o efectos de sonido sincronizados sin necesidad de herramientas de edición complejas.
- **Desarrollo de storyboards animados**: directores y guionistas pueden visualizar escenas a partir de guiones textuales, iterando rápidamente sobre la narrativa visual y sonora.
- **Generación de material educativo**: profesores pueden crear vídeos explicativos con narración y animaciones simples a partir de texto, reduciendo el tiempo de preparación de clases.
- **Prototipado de experiencias interactivas**: desarrolladores de juegos o realidad virtual pueden generar vídeos de ambiente con audio para probar conceptos de nivel o atmósfera.
- **Investigación en generación de vídeo-audio**: el modelo sirve como punto de partida para estudiar técnicas de destilación y atención dispersa en modelos multimodales, gracias a su licencia comunitaria y código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los artículos mencionan una aceleración de hasta 14x en GPUs Blackwell frente al modelo denso, pero no se proporcionan métricas numéricas concretas (FVD, CLIP score, etc.) en las fuentes consultadas.

## Requisitos de hardware

- El comando de ejemplo de SGLang utiliza `--num-gpus 4`, lo que sugiere que el modelo requiere múltiples GPUs para una inferencia razonable.
- Se recomiendan GPUs Blackwell (B200, GB200) para aprovechar la aceleración de la atención dispersa; en GPUs Ampere o Hopper el rendimiento puede ser menor.
- No se dispone de datos de VRAM exacta; al ser un modelo de vídeo-audio, se estima que necesita al menos 40-80 GB de VRAM en bf16, dependiendo de la resolución y duración del vídeo.
- Opciones de despliegue: SGLang Diffusion (soporte nativo), ComfyUI con LoRA no oficial, y potencialmente otros frameworks que adopten el formato Diffusers.
- La latencia y el throughput no están documentados públicamente; la ventaja principal es el reducido número de pasos (4) frente a modelos de 20-50 pasos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Pasos | Atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastH3 4-step Preview (este) | MiniMax-H3 híbrido | 4 | Dispersa 90% | MiniMax-H3 Community | Open weights |
| MiniMax H3 original | MiniMax-H3 híbrido | 20-50 | Densa | MiniMax-H3 Community | Open weights |
| Stable Video Diffusion | U-Net / DiT | 20-30 | Densa | Stability Community | Open weights |
| CogVideoX | DiT | 50+ | Densa | Apache 2.0 | Open weights |

La comparativa se basa en información pública general; no se dispone de benchmarks comparativos directos entre estos modelos en las fuentes consultadas.

## Limitaciones y advertencias

- Es una versión Preview v1: solo soporta la tarea text-to-video-and-audio (T2VA); no hay soporte para image-to-video, edición o control de cámara.
- La atención dispersa (VSA) requiere el backend y kernel específicos de FastVideo; la atención densa no es un sustituto directo y degradaría el rendimiento y la calidad.
- El overlay es un repositorio de metadatos; los pesos reales están en otro repositorio, lo que añade una capa de indirección que puede confundir a usuarios noveles.
- La licencia MiniMax-H3 Community License puede imponer restricciones de uso comercial; es necesario revisar los términos exactos antes de desplegar en producción.
- No se han publicado evaluaciones de sesgos o alucinaciones; como modelo generativo de vídeo, puede producir contenido no deseado o inexacto respecto a la descripción textual.
- El modelo requiere hardware de gama alta (múltiples GPUs) y no es viable en GPUs de consumo típicas (RTX 4090) para vídeos largos o de alta resolución.
- La documentación es escasa; no hay información sobre parámetros totales, contexto máximo, idiomas soportados ni cuantizaciones alternativas.

## Enlaces

- Repositorio overlay: https://huggingface.co/kevin-mi/FastH3-4step-Preview-overlay
- Checkpoint base: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree
- Artículo de ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-08-28-fasth3-preview
- Blog de HaoAI Lab: https://haoailab.com/blogs/fasth3-preview/
- Demo en Hugging Face Space (Luislin88): https://huggingface.co/spaces/Luislin88/fasth3-4step-preview-demo
- Demo en Hugging Face Space (jekverse): https://huggingface.co/spaces/jekverse/fasth3-4step-preview-demo
- LoRA no oficial para ComfyUI: https://civitai.com/models/2898443/comfyui-fastvideo-fasth3-4-step-lora-unofficial
