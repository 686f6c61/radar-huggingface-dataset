# ChrisColeTech/minimax-h3-turbo-GGUF

## Resumen

MiniMax H3 Turbo GGUF es una versión cuantizada en formato GGUF del modelo de difusión MiniMax H3, publicada por el usuario ChrisColeTech. El repositorio empaqueta el DiT (Diffusion Transformer) FL2VA podado con el LoRA LightX2V Turbo de 8 pasos ya integrado en los pesos, y una variante REF2VA podada con el LoRA Turbo de 4 pasos. El objetivo es permitir la generación de vídeo a partir de texto e imagen en hardware de consumo, reduciendo el número de pasos de difusión necesarios de decenas a 4-8 y ofreciendo pesos cuantizados de 11,4 GB para el transformer.

El modelo base es MiniMaxAI/MiniMax-H3, un modelo de generación de vídeo con audio de MiniMax. Esta versión turbo no es un modelo nuevo entrenado desde cero, sino un "merge" de destilación: los LoRA de aceleración de LightX2V se han horneado en los pesos del DiT podado y posteriormente se han cuantizado a GGUF. El repositorio incluye además los componentes auxiliares necesarios para la inferencia completa: text encoders Qwen3-VL de 4B y 8B en fp8, proyecciones ClipProj, VAE de vídeo en fp16 y VAE de audio en fp32.

La relevancia actual radica en que permite ejecutar un pipeline text-to-video e image-to-video con audio en una única GPU consumer de gama alta, como una RTX 5090 de 32 GB, con tiempos de generación de aproximadamente 2,3-2,5 minutos para 90 frames a 1280x720 y 8 pasos. El repositorio acumula 36.931 descargas y 24 likes desde su creación en agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con VAE de vídeo y VAE de audio; text encoder Qwen3-VL |
| Parametros totales | 20.111.438.894 (según safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (transformer); fp8_scaled (text encoders); fp16 (VAE vídeo); fp32 (VAE audio) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusión basada en transformer (DiT) para la generación conjunta de vídeo y audio. El pipeline se compone de un text encoder Qwen3-VL (disponible en variantes de 4B y 8B) que codifica el prompt, una proyección ClipProj que adapta la salida del encoder al espacio del DiT, el transformer de difusión propiamente dicho y dos VAE separados: uno de vídeo en fp16 (5,21 GB) y otro de audio en fp32 (605 MB). Esta separación de VAE permite generar vídeo con pista de audio de forma nativa.

El repositorio no entrena un modelo nuevo: parte de los checkpoints FL2VA y REF2VA podados de MiniMax H3 y les integra los LoRA LightX2V Turbo (8 pasos para FL2VA, 4 pasos para REF2VA). La destilación por pasos es la innovación clave, ya que reduce el coste de inferencia de decenas de pasos a 4-8 con CFG 1.0, lo que hace viable la generación en GPUs consumer. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto (txt2video) con pista de audio sincronizada.
- Generación de vídeo a partir de imagen (img2video), usando la imagen como primer frame.
- Modos FL2VA, T2VA, I2VA y REF2VA según la variante del DiT.
- Generación de audio integrada mediante VAE de audio dedicado.
- Control de resolución, número de frames, pasos de muestreo, CFG y semilla.
- Compatible con flujos de trabajo de ComfyUI (se incluye un workflow de ejemplo para image-to-video).
- Dos opciones de text encoder (4B y 8B) que permiten intercambiar calidad por VRAM.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje.

## Casos de uso

- Prototipado rápido de vídeo publicitario: generar clips de ~3,75 s a 1280x720 con 8 pasos en una RTX 5090 permite iterar sobre conceptos creativos en minutos, usando el modo txt2video con prompts cinematográficos.
- Animación de imágenes fijas para redes sociales: el modo img2video con una imagen como primer frame permite animar retratos o productos (por ejemplo, "Make her fly. Full body shot") sin necesidad de rodaje.
- Generación de vídeo con audio para demos de producto: el VAE de audio integrado permite producir clips con ambiente sonoro (motor, lluvia) descrito en el prompt, útil para maquetas y presentaciones.
- Previsualización de storyboards en producción audiovisual: directores y guionistas pueden convertir descripciones textuales en clips de referencia antes de rodar, reduciendo costes de preproducción.
- Creación de contenido para videojuegos y entornos sintéticos: generación de secuencias cortas con movimiento de cámara controlado por prompt para material de marketing o prototipos de cinemáticas.
- Investigación en difusión de vídeo: la disponibilidad de pesos GGUF cuantizados y de variantes 4B/8B del text encoder facilita experimentos reproducibles sobre destilación por pasos y calidad de codificación textual en hardware asequible.
- Automatización de contenido en pipelines de ComfyUI: el workflow JSON incluido permite integrar la generación en flujos nodales repetibles para producción de variantes a partir de una misma imagen o prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta tiempos de generación medidos: aproximadamente 2,3 minutos con text encoder de 4B y 2,5 minutos con text encoder de 8B, para 90 frames a 1280x720, 8 pasos, CFG 1.0 y semilla 42, sobre una RTX 5090 de 32 GB.

## Requisitos de hardware

- VRAM estimada: el transformer Q4_K_M ocupa 11,4 GB; el text encoder 4B en fp8 suma 5,24 GB y el 8B en fp8 suma 10,6 GB; el VAE de vídeo 5,21 GB y el de audio 605 MB. El total en memoria ronda los 22-28 GB según la variante de text encoder.
- GPU recomendadas: RTX 5090 (32 GB) es la GPU usada en los ejemplos del autor; GPUs con 24 GB (RTX 4090) pueden requerir descarga parcial de módulos a RAM del sistema.
- Cabe en GPU consumer de gama alta con 32 GB; en 24 GB es ajustado y depende de la variante de text encoder y de la gestión de memoria del runtime.
- Opciones de despliegue: ComfyUI con nodos GGUF (se incluye workflow de ejemplo); el formato GGUF es compatible con runtimes basados en llama.cpp/ggml para difusión, aunque no se detallan otros backends en la información disponible.
- Latencia y throughput: ~2,3-2,5 minutos por clip de 90 frames a 1280x720 con 8 pasos en RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 Turbo GGUF (este) | 20,1 B (base) | no disponible | GGUF + safetensors | other | Hugging Face, 36.931 descargas |
| MiniMaxAI/MiniMax-H3 (base) | 20,1 B | no disponible | safetensors | no disponible | Hugging Face |
| Alternativas de text-to-video open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La licencia es "other": es imprescindible revisar los términos del modelo base MiniMaxAI/MiniMax-H3 antes de cualquier uso comercial, ya que la licencia del derivado hereda restricciones del original.
- Al ser un merge de LoRA destilado, la calidad puede degradarse respecto al modelo base con más pasos de muestreo; la reducción a 4-8 pasos es un compromiso entre velocidad y fidelidad.
- El repositorio ocupa 146,3 GB, lo que implica una descarga considerable aunque solo se utilicen algunos componentes.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación o artefactos; en generación de vídeo es esperable la aparición de artefactos temporales, incoherencias físicas y desincronización audio-vídeo, pero no hay datos concretos en la información disponible.
- Los clips generados son cortos (~3,75 s con 90 frames) y la resolución máxima documentada es 1280x720.
- No hay información sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos demográficos o culturales del modelo base.
- El uso en producción requiere validar el workflow de ComfyUI y la gestión de VRAM, especialmente en GPUs de 24 GB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ChrisColeTech/minimax-h3-turbo-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Transformer Q4_K_M: https://huggingface.co/ChrisColeTech/minimax-h3-turbo-GGUF/blob/main/split/diffusion_models/minimax_h3_fl2va_turbo_Q4_K_M.gguf
- Text encoder 4B: https://huggingface.co/ChrisColeTech/minimax-h3-turbo-GGUF/blob/main/split/text_encoders/qwen3vl_4b_fp8_scaled.safetensors
- ClipProj 4B: https://huggingface.co/ChrisColeTech/minimax-h3-turbo-GGUF/blob/main/split/text_encoders/mmh3-4b-ClipProj-v3-mlp.safetensors
- Text encoder 8B: https://huggingface.co/ChrisColeTech/minimax-h3-turbo-GGUF/blob/main/split/text_encoders/qwen3vl_8b_fp8_scaled.safetensors
- ClipProj 8B: https://huggingface.co/ChrisColeTech/minimax-h3-turbo-GGUF/blob/main/split/text_encoders/mmh3-8b-ClipProj-v3-mlp.safetensors
- VAE de vídeo: https://huggingface.co/ChrisColeTech/minimax-h3-turbo-GGUF/blob/main/split/vae/minimax_h3_video_vae_fp16.safetensors
- VAE de audio: https://huggingface.co/ChrisColeTech/minimax-h3-turbo-GGUF/blob/main/split/vae/minimax_h3_audio_vae_fp32.safetensors
- Workflow de ejemplo (image-to-video): https://huggingface.co/ChrisColeTech/minimax-h3-turbo-GGUF/resolve/main/workflow_example/minimax_h3_turbo_i2va.json
