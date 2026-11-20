# FloydianSound/Nixeu_Diffusion_v1-5

## Resumen

Nixeu_Diffusion_v1-5 es un modelo de difusion texto-a-imagen obtenido mediante fine-tuning de Stable Diffusion v1-5 sobre un dataset de 250 imagenes del artista digital NIXEU. Lo desarrolla el usuario FloydianSound y se publica en Hugging Face bajo licencia CreativeML OpenRAIL-M. El objetivo es reproducir el estilo visual caracteristico del artista (figura humana, iluminacion dramatica, paleta concreta) mediante el token de activacion `nixeu`, sin necesidad de describir el estilo en cada prompt.

El entrenamiento consistio en 25 040 pasos repartidos en 10 epocas, con Aspect Ratio Bucketing centrado en 768 pixeles de resolucion. El repositorio ocupa 12 GB y se distribuye en formato diffusers, por lo que es compatible con `StableDiffusionPipeline` y con los endpoints de inferencia de Hugging Face. No se trata de un modelo base nuevo, sino de un checkpoint especializado: hereda todas las capacidades y limitaciones del SD v1-5 original.

Es relevante para quienes necesiten generar ilustracion de personajes con una estetica concreta y consistente, y como ejemplo de pipeline de fine-tuning ligero (250 imagenes, 10 epocas) sobre un modelo de difusion de 860 M de parametros. No incorpora mejoras arquitectonicas respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (UNet + VAE + text encoder CLIP ViT-L/14), heredada de Stable Diffusion v1-5 |
| Parametros totales | Aproximadamente 860 M en la UNet; el pipeline completo (UNet + VAE + CLIP) ronda los 1,1 mil millones (dato no confirmado en la model card, derivado de la arquitectura base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 77 tokens de prompt (limite del text encoder CLIP de SD v1-5) |
| Tipos de cuantizacion | No especificados en la model card; al ser compatible con diffusers se pueden aplicar fp16, bf16 y cuantizaciones de la comunidad (no documentadas por el autor) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | diffusers (`StableDiffusionPipeline`); el repositorio de 12 GB sugiere pesos en fp32 junto con variantes |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura de Stable Diffusion v1-5: un autoencoder variacional (VAE) que comprime las imagenes a un espacio latente, una UNet que aplica el proceso de difusion denoising en ese espacio latente y un text encoder CLIP ViT-L/14 que condiciona la generacion mediante embeddings de texto. No hay cambios estructurales respecto al checkpoint original; el fine-tuning afecta unicamente a los pesos.

El entrenamiento se realizo sobre 250 imagenes del artista NIXEU durante 25 040 pasos y 10 epocas, con Aspect Ratio Bucketing centrado en 768 pixeles. La model card no detalla la composicion del dataset, la tasa de aprendizaje, el optimizador ni si se aplicaron tecnicas de regularizacion (por ejemplo, class preservation o LoRA). Tampoco se documenta el uso de RLHF ni de DPO, algo esperable en un fine-tuning de difusion de esta naturaleza. El token de activacion es `nixeu` y el autor publica un `tags.txt` con los tokens asociados y sus frecuencias.

## Capacidades

- Generacion de imagenes texto-a-imagen en ingles a partir de prompts descriptivos.
- Reproduccion del estilo del artista NIXEU mediante el token de activacion `nixeu`.
- Generacion de retratos y figuras humanas de cuerpo entero o medio cuerpo, segun los ejemplos de la model card.
- Control de composicion mediante prompts detallados (atuendo, peinado, encuadre, iluminacion).
- Compatibilidad con `diffusers` y con los endpoints de inferencia de Hugging Face.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, vision de entrada, audio ni capacidades de agente.
- Capacidad multilingue limitada al ingles por el text encoder CLIP.

## Casos de uso

- Ilustracion de personajes para proyectos indie: el modelo genera retratos y figuras completas con el estilo NIXEU a partir de prompts en ingles, util para concept art de videojuegos o comics con identidad visual definida.
- Prototipado rapido de arte conceptual: con 25 040 pasos de fine-tuning sobre 250 imagenes, el modelo converge a un estilo concreto y permite iterar variaciones de un personaje en minutos.
- Generacion de avatares y retratos para comunidades: el ejemplo de la model card (retrato de enfermera con encuadre de medio cuerpo) muestra su idoneidad para avatares estilizados.
- Creacion de assets para redes sociales y fan art: la licencia OpenRAIL-M permite uso comercial y redistribucion como servicio, con las restricciones de uso recogidas en la licencia.
- Base para nuevos fine-tunings: al ser un checkpoint diffusers estandar, sirve como punto de partida para LoRA o Dreambooth sobre otros estilos o personajes.
- Exploracion artistica y educacion: util para estudiar como un fine-tuning ligero desplaza la distribucion de un modelo base hacia una estetica concreta.
- Integracion en pipelines automatizados de generacion por lotes mediante la API de `diffusers` o los endpoints de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, evaluaciones humanas) ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: entre 4 y 6 GB para el pipeline completo a 512x512; en torno a 8 GB a 768x768.
- VRAM en fp32: aproximadamente 8-10 GB, coherente con el tamano del repositorio (12 GB).
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090, A10G, A100 o H100 para lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas en fp16 (RTX 2060 6 GB en adelante); con 4 GB requiere atencion optimizada o resoluciones menores.
- Opciones de despliegue: `diffusers` (PyTorch), endpoints de inferencia de Hugging Face, Automatic1111 WebUI, ComfyUI, InvokeAI; tambien es posible exportar a ONNX o TensorRT.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen en gran medida de la GPU y del numero de pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (prompt) | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nixeu_Diffusion_v1-5 | ~860 M (UNet) | 77 tokens | Fine-tuning de estilo sobre SD v1-5 | CreativeML OpenRAIL-M | Hugging Face (diffusers) |
| Stable Diffusion v1-5 (base) | ~860 M (UNet) | 77 tokens | Texto-a-imagen generico | CreativeML OpenRAIL-M | Hugging Face, múltiples mirrors |
| Stable Diffusion v2-1 | ~865 M (UNet) | 77 tokens | Texto-a-imagen generico, mejor resolucion | CreativeML OpenRAIL++-M | Hugging Face |
| SDXL 1.0 | ~2,6 B (UNet) + refiner | 77 tokens por encoder (doble encoder) | Texto-a-imagen de alta resolucion | CreativeML OpenRAIL++-M | Hugging Face |

La comparativa se limita a la arquitectura y la licencia, ya que no hay benchmarks publicados para este checkpoint. Frente al SD v1-5 base, la diferencia es estilistica (fine-tuning sobre NIXEU); frente a SDXL, este modelo ofrece menor resolucion nativa y menor calidad general, pero tambien menor coste de VRAM.

## Limitaciones y advertencias

- Sesgos heredados de Stable Diffusion v1-5: el dataset de entrenamiento original presenta sesgos de genero, etnia y cultura que el fine-tuning de 250 imagenes no corrige.
- Riesgo de alucinacion visual: el modelo puede generar anatomia incorrecta (manos, dedos, ojos) y artefactos, especialmente en resoluciones distintas de 768 y con prompts poco detallados.
- Limite de 77 tokens de prompt impuesto por CLIP; prompts largos se truncan.
- Solo soporta ingles; los prompts en castellano produciran resultados degradados.
- Dataset de entrenamiento muy pequeno (250 imagenes): el estilo puede sobreajustarse y reproducir composiciones del dataset original.
- Licencia CreativeML OpenRAIL-M: permite uso comercial y redistribucion como servicio, pero obliga a incluir las mismas restricciones de uso y a compartir una copia de la licencia con los usuarios; prohibe usos ilegales o daninos deliberados.
- El autor declara no reclamar derechos sobre las salidas generadas, pero el usuario es responsable de su uso.
- No se documentan tasas de aprendizaje, optimizador ni regularizacion, lo que dificulta reproducir el entrenamiento.
- El repositorio se actualizo por ultima vez en noviembre de 2026 segun los metadatos, pero la model card no registra cambios respecto a la version original de diciembre de 2022.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FloydianSound/Nixeu_Diffusion_v1-5
- Artista NIXEU en ArtStation: https://www.artstation.com/nixeu
- Artista NIXEU en DeviantArt: https://www.deviantart.com/nixeu
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Stable Diffusion v1-5 (modelo base): https://huggingface.co/runwayml/stable-diffusion-v1-5
