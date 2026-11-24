# Nekodeus/neko-tamil6-sdxl-v1

## Resumen

neko-tamil6-sdxl-v1 es un LoRA de personaje entrenado sobre Stable Diffusion XL Base 1.0 (1024 px) para reproducir el rostro y la apariencia del actor indio Dhanush. Lo publica el usuario Nekodeus como parte de un conjunto denominado "Tamil Top-10", una serie de adaptadores de personajes de la industria cinematográfica tamil. No es un modelo generativo completo: es un adaptador de bajo rango que se carga sobre el UNet del modelo base y se activa mediante el token disparador `tamil6`.

El adaptador se entrena con 62 imágenes curadas y verificadas facialmente con OpenCV, con un único paso de entrenamiento de 1500 iteraciones, dimensión de red y alpha de 16, learning rate de 1e-4 y optimizador Adafactor, usando el script `sdxl_train_network.py` de kohya-ss sobre una GPU de Kaggle. El repositorio ocupa 0,2 GB y contiene los pesos en formato `safetensors` junto con muestras generadas.

Su relevancia es acotada: se trata de un adaptador de nicho para generación de imágenes de personaje con SDXL, publicado bajo licencia Apache 2.0, con cero descargas y cero likes en el momento de la consulta. Resulta útil para quien necesite generar retratos consistentes de este actor concreto dentro de un pipeline SDXL, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre UNet de Stable Diffusion XL Base 1.0; difusión latente con text encoder dual (CLIP ViT-L + OpenCLIP ViT-bigG) |
| Parametros totales | no disponible (adaptador LoRA; dimensión de red 16, solo UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; prompt de longitud arbitraria limitada por el tokenizador CLIP, 77 tokens por chunk) |
| Tipos de cuantizacion | no disponible de forma explícita; los pesos se distribuyen en fp16 y el entrenamiento se realizó en fp16. Compatible con los formatos que acepte el pipeline SDXL (fp16, bf16, fp32) |
| Idiomas soportados | no disponibles (los prompts se procesan vía CLIP, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`tamil6.safetensors`) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA exclusivamente sobre el UNet de SDXL Base 1.0, con dimensión de red y alpha de 16. SDXL es un modelo de difusión latente que combina un autoencoder VAE, un UNet de gran tamaño y dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG), y genera imágenes a 1024×1024 píxeles nativos. El LoRA no modifica los text encoders ni el VAE; solo inyecta matrices de bajo rango en las capas del UNet.

El entrenamiento se realizó con el script `sdxl_train_network.py` de kohya-ss, en fp16 con gradient checkpointing y atención sdpa, sobre una GPU de Kaggle y de forma totalmente offline. Se usaron 1500 pasos, batch 1, learning rate 1e-4 y optimizador Adafactor, con resolución 1024 y bucketing entre 256 y 2048 píxeles. El dataset consta de 62 imágenes de Dhanush verificadas con OpenCV y etiquetadas con un caption uniforme (`a photo of tamil6 person`); forma parte del conjunto público `nekodeus/tamil-top10-v2`, subcarpeta `tamil6/`. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa, algo que no aplica a un modelo de difusión.

## Capacidades

- Generación text-to-image de retratos y escenas del personaje Dhanush sobre SDXL Base 1.0, activada con el token `tamil6`.
- Transferencia de identidad facial consistente dentro del estilo y la resolución nativa de SDXL (1024 px).
- Integración como adaptador ligero en pipelines `diffusers` mediante `load_lora_weights` y en ComfyUI mediante nodo LoRA Loader.
- Composición con otros LoRA de SDXL (estilo, iluminación, etc.) siempre que el pipeline lo permita.
- Control de la intensidad del adaptador mediante el peso del LoRA en la carga (scale), aunque el autor no documenta valores recomendados.
- No soporta tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modos de pensamiento: es exclusivamente un generador de imágenes.
- Capacidades multilingües no documentadas; los prompts dependen del tokenizador CLIP del modelo base, orientado a inglés.

## Casos de uso

- Generación de retratos de personaje para proyectos creativos: cargar el LoRA sobre SDXL Base y usar el prompt `tamil6 Dhanush, portrait photo, studio lighting` para obtener retratos consistentes a 1024 px, útil en ilustración, fan art o previsualización de conceptos.
- Creación de storyboards y viñetas: combinar el adaptador con prompts de escena para mantener la identidad del personaje a lo largo de varias imágenes, gracias a la consistencia que aporta el entrenamiento con 62 imágenes verificadas facialmente.
- Pruebas de pipelines de difusión: al ser un LoRA pequeño (0,2 GB) y con licencia Apache 2.0, sirve como caso de prueba para validar la carga de adaptadores en `diffusers` o ComfyUI antes de desplegar adaptadores propios.
- Composición con LoRA de estilo: apilar este adaptador con LoRA de estética (cine, ilustración, fotografía) para generar variaciones estilizadas del personaje sin reentrenar el modelo base.
- Docencia y experimentación con LoRA: el repositorio documenta todos los hiperparámetros (dim/alpha 16, lr 1e-4, 1500 pasos, Adafactor), lo que lo convierte en una referencia reproducible para aprender a entrenar adaptadores de personaje sobre SDXL.
- Integración en flujos de trabajo de ComfyUI: colocar `tamil6.safetensors` en `models/loras/`, añadir un nodo LoRA Loader y encadenar el resto del grafo SDXL para producción de imágenes por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas cuantitativas (FID, CLIP score, similitud facial, etc.) ni comparaciones con otros adaptadores de personaje.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB en disco, pero la inferencia requiere cargar SDXL Base 1.0 completo (aproximadamente 6,9 GB en fp16 para UNet, VAE y text encoders).
- VRAM estimada para inferencia en fp16 a 1024×1024: en torno a 10-12 GB con optimizaciones de atención; más de 12 GB sin ellas. Con cuantización del modelo base (por ejemplo, fp8 o GGUF) puede reducirse por debajo de 8 GB, aunque el autor no documenta estos flujos.
- GPU recomendadas: A100, H100, L40S o RTX 4090 para throughput alto; RTX 3090, 4080 o 4070 Ti Super para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM (RTX 3060 12 GB, 4070, 4080, 4090) usando fp16 y atención eficiente; en 8 GB requiere cuantización del modelo base.
- Opciones de despliegue: `diffusers` (StableDiffusionXLPipeline + `load_lora_weights`), ComfyUI (nodo LoRA Loader), y en general cualquier frontend compatible con SDXL y LoRA (A1111/Forge, InvokeAI). El autor solo documenta `diffusers` y ComfyUI.
- Latencia y throughput: no disponibles. Dependen del modelo base y del hardware; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| neko-tamil6-sdxl-v1 (este) | LoRA de personaje | SDXL Base 1.0 | dim 16, UNet | 1024 px nativo | Apache 2.0 | Hugging Face (0 descargas) |
| Otros LoRA de "Tamil Top-10" (Nekodeus) | LoRA de personaje | SDXL Base 1.0 | no disponible | 1024 px nativo | Apache 2.0 (presumible, no verificado) | Hugging Face |
| Adaptadores de personaje SDXL de la comunidad (p. ej. familias de LoRA de celebridades) | LoRA de personaje | SDXL Base 1.0 | variable | 1024 px nativo | variable (muchas veces sin licencia clara) | Hugging Face / Civitai |

La comparación con alternativas concretas no está disponible con datos verificables: el autor no publica métricas ni referencias a otros adaptadores, y no se dispone de información sobre el resto de la serie "Tamil Top-10" más allá de su existencia.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con 62 imágenes de una única persona, el adaptador puede sobrerrepresentar rasgos de esas fotos concretas (iluminación, ángulos, vestuario) y generalizar mal a poses o expresiones no vistas.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar rasgos faciales inconsistentes, artefactos en manos y ojos, y derivar hacia la identidad media del modelo base cuando el peso del LoRA es bajo.
- Limitaciones de contexto e idioma: los prompts dependen del tokenizador CLIP del modelo base, orientado a inglés; no hay soporte multilingüe documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial del adaptador, pero el uso de la imagen de una persona real (Dhanush) puede estar sujeto a derechos de imagen y publicidad según la jurisdicción; el autor no aborda esta cuestión.
- Caveats para producción: el repositorio tiene cero descargas y cero likes, sin validación externa; no se documentan métricas de calidad ni valores recomendados de escala del LoRA; el entrenamiento se realizó en una GPU de Kaggle con 1500 pasos, lo que sugiere un ajuste limitado.
- El caption uniforme (`a photo of tamil6 person`) reduce la capacidad de control fino sobre atributos del personaje mediante texto.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/neko-tamil6-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset público de entrenamiento: https://huggingface.co/datasets/nekodeus/tamil-top10-v2 (subcarpeta `tamil6/`)
- Repositorio de entrenamiento (kohya-ss sd-scripts): https://github.com/kohya-ss/sd-scripts
- Documentación de `diffusers` para carga de LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
