# kcplummer/stable-diffusion-v1-4

## Resumen

Stable Diffusion v1-4 es un modelo de difusión latente para generación de imágenes a partir de texto, desarrollado por Robin Rombach y Patrick Esser en el grupo CompVis de la Universidad de Heidelberg. Se trata de la cuarta versión de la serie Stable Diffusion, publicada en agosto de 2022, y se ha convertido en uno de los modelos de texto a imagen de código abierto más influyentes, sentando las bases de una enorme ecosistema de herramientas y adaptaciones posteriores.

El modelo combina un autoencoder variacional (VAE) que comprime la imagen a un espacio latente, un U-Net que denoisa iterativamente ese espacio latente condicionado por el texto, y un codificador de texto CLIP ViT-L/14 que convierte el prompt en embeddings. El checkpoint v1-4 se inicializó con los pesos de v1-2 y se ajustó durante 225.000 pasos a resolución 512×512 sobre el subconjunto "laion-aesthetics v2 5+", con un 10 % de abandono del condicionamiento de texto para mejorar el muestreo con classifier-free guidance. El modelo tiene aproximadamente 860 millones de parámetros y admite una ventana de contexto de 77 tokens en el codificador de texto.

Esta ficha se basa en el repositorio `kcplummer/stable-diffusion-v1-4`, que es una copia espejo del checkpoint original de CompVis, y en la documentación pública asociada al modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (VAE + U-Net + CLIP ViT-L/14) |
| Parametros totales | 859.520.964 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 77 tokens (codificador de texto CLIP) |
| Tipos de cuantizacion | fp32, fp16 (compatible con diffusers); existen conversiones de la comunidad (ONNX, TensorRT, etc.) |
| Idiomas soportados | ingles (el prompt se procesa en ingles) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (tambien disponibles en binarios de PyTorch) |

## Arquitectura y entrenamiento

Stable Diffusion v1-4 es un modelo de difusión latente que opera en un espacio latente de menor dimensionalidad que el espacio de píxeles. La arquitectura consta de tres componentes principales:

- Un **VAE** (autoencoder variacional) preentrenado que comprime imágenes de 512×512 píxeles a mapas latentes de 64×64 (factor de compresión 8), reduciendo así el coste computacional del proceso de difusión.
- Un **U-Net** que realiza el proceso de denoising en el espacio latente, condicionado por los embeddings de texto. El U-Net utiliza atención cruzada para incorporar la información textual en cada paso de denoising.
- Un **codificador de texto CLIP ViT-L/14** preentrenado y congelado, que transforma el prompt en una secuencia de embeddings de 77 tokens. Este diseño sigue las recomendaciones del artículo de Imagen.

El entrenamiento se realizó en dos fases. Primero, el modelo v1-1 se entrenó desde cero sobre el subconjunto LAION-5B con filtrado estético (laion-aesthetics v2 5+). Luego, el checkpoint v1-2 se obtuvo ajustando v1-1 con más datos y mejor filtrado. Finalmente, v1-4 se inicializó desde v1-2 y se fine-tuneó durante 225.000 pasos a resolución 512×512 sobre "laion-aesthetics v2 5+", aplicando un 10 % de abandono del condicionamiento de texto (text-conditioning dropout) para mejorar la eficacia del classifier-free guidance en la inferencia.

No se utilizó RLHF ni DPO; el ajuste se basó únicamente en el objetivo de denoising estándar de los modelos de difusión. El modelo se distribuye con el scheduler PNDM por defecto, pero es compatible con otros schedulers (Euler, DDIM, etc.) a través de la librería diffusers.

## Capacidades

- **Generacion de imagenes a partir de texto**: produce imagenes fotorrealistas o artisticas de resolucion 512×512 a partir de prompts descriptivos.
- **Modificacion de imagenes (img2img)**: mediante pipelines como `StableDiffusionImg2ImgPipeline`, permite transformar una imagen existente siguiendo una instruccion textual.
- **Inpainting y outpainting**: aunque el checkpoint base no incluye un modelo de inpainting especifico, se puede combinar con mascaras y pipelines de la comunidad para editar regiones concretas.
- **Soporte de negative prompts**: al usar classifier-free guidance, se puede indicar un prompt negativo para evitar ciertos estilos o contenidos no deseados.
- **Control del proceso de generacion**: parametros como `guidance_scale`, `num_inference_steps` y `seed` permiten ajustar la adherencia al prompt, la calidad y la reproducibilidad.
- **Multilingue limitado**: el codificador CLIP esta entrenado principalmente en ingles; los prompts en otros idiomas suelen producir resultados suboptimos.

## Casos de uso

- **Creacion de arte conceptual y ilustracion**: disenadores e ilustradores pueden generar bocetos rapidos a partir de descripciones textuales, acelerando la exploracion de ideas. El modelo es adecuado por su capacidad para interpretar estilos artisticos mencionados en el prompt (por ejemplo, "en el estilo de Disney, artstation").
- **Prototipado visual para diseno de producto**: equipos de producto pueden crear imagenes de referencia de conceptos de objetos, envases o interfaces antes de invertir en diseno detallado. La resolucion 512×512 es suficiente para pruebas internas.
- **Generacion de contenido para marketing y redes sociales**: se pueden producir imagenes de fondo, banners o ilustraciones para campanas publicitarias de forma rapida y economica, siempre que se respeten las restricciones de la licencia OpenRAIL-M.
- **Aumento de datos para entrenamiento de modelos de vision**: las imagenes sinteticas generadas pueden complementar datasets existentes en tareas de clasificacion o segmentacion, especialmente en dominios con escasez de datos reales.
- **Edicion creativa de fotografias**: mediante img2img, los fotografos pueden aplicar transformaciones estilisticas (por ejemplo, convertir una foto en una pintura al oleo) o alterar elementos concretos manteniendo la composicion general.
- **Generacion de assets para videojuegos y entornos virtuales**: los desarrolladores pueden crear texturas, iconos o fondos rapidamente, aunque la resolucion puede requerir un posterior upscaling con herramientas adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original de CompVis no incluye una tabla de métricas estándar como FID o CLIP score en su documentación pública. La evaluación se ha realizado tradicionalmente de forma cualitativa mediante ejemplos visuales y comparaciones informales con otras versiones.

## Requisitos de hardware

- **VRAM minima para inferencia**: alrededor de 4 GB de VRAM si se usa precision fp16 y se activa `enable_attention_slicing()`. Sin slicing, se recomiendan al menos 6 GB.
- **GPU recomendadas**: NVIDIA RTX 3060 (12 GB) o superior para una experiencia comoda; tarjetas con 8 GB (RTX 3070, RTX 4060) funcionan bien en fp16. Para produccion con alto throughput, se recomiendan GPUs de datacenter como A100 o H100.
- **Compatibilidad con GPUs de consumo**: sí, el modelo se ejecuta en GPUs de consumo como la serie RTX 30 y 40, asi como en tarjetas de generaciones anteriores con suficiente VRAM. Tambien es posible ejecutarlo en CPU, aunque con tiempos de generacion muy elevados (minutos por imagen).
- **Opciones de despliegue**: la libreria diffusers es la via principal; tambien se puede usar con interfaces graficas como AUTOMATIC1111 (webui) o ComfyUI. Para despliegue en servidores, se puede servir con vLLM (aunque esta orientado a LLM, hay integraciones recientes) o con soluciones especificas como Hugging Face Inference Endpoints.
- **Latencia estimada**: en una RTX 3090, una generacion de 50 pasos con scheduler PNDM tarda aproximadamente 2-4 segundos. En una RTX 4090, alrededor de 1-2 segundos. En GPUs de menor gama, el tiempo puede superar los 10 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto (tokens) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stable Diffusion v1-4 | ~860M | 512×512 | 77 | OpenRAIL-M | Publico en Hugging Face |
| Stable Diffusion v1-5 | ~860M | 512×512 | 77 | OpenRAIL-M | Publico en Hugging Face |
| Stable Diffusion v2.1 | ~865M | 768×768 (tambien 512) | 77 | OpenRAIL++ | Publico en Hugging Face |
| SDXL 1.0 | ~3.5B (ensemble) | 1024×1024 | 77 (text encoder 1) + 77 (text encoder 2) | OpenRAIL++ | Publico en Hugging Face |

Stable Diffusion v1-4 y v1-5 son practicamente identicos en arquitectura y tamaño; v1-5 se fine-tuneo sobre mas datos y suele ofrecer una calidad ligeramente superior. v2.1 introduce un codificador de texto mejorado (OpenCLIP) y soporta resoluciones de 768×768, pero requiere mas VRAM. SDXL es un modelo mucho mas grande y moderno, con mejor calidad y mayor resolucion, pero tambien con mayores requisitos de hardware.

## Limitaciones y advertencias

- **Sesgos en el dataset**: el entrenamiento sobre LAION-5B (un dataset extraido de internet) introduce sesgos de genero, raza y cultura. El modelo puede amplificar estereotipos presentes en los datos.
- **Riesgo de alucinacion visual**: aunque el modelo es capaz de generar imagenes coherentes, puede producir artefactos, distorsiones anatomicas (manos, rostros) o elementos incoherentes, especialmente con prompts complejos.
- **Limitaciones de idioma**: el rendimiento se degrada notablemente con prompts en idiomas distintos del ingles. Se recomienda traducir los prompts al ingles para obtener resultados fiables.
- **Restricciones de licencia**: la licencia CreativeML OpenRAIL-M permite uso comercial y redistribucion, pero prohibe generar contenido ilegal o danino, y exige incluir la misma licencia y restricciones a los usuarios finales si se redistribuye el modelo o sus derivados.
- **Resolucion fija**: el modelo esta optimizado para 512×512; generar a otras resoluciones puede producir imagenes degradadas o requerir tecnicas de upscaling posteriores.
- **Consumo de recursos**: aunque es ejecutable en GPUs de consumo, la generacion de imagenes en lote o en produccion requiere una GPU con suficiente VRAM y un control cuidadoso de la memoria para evitar OOM.

## Enlaces

- Repositorio original en Hugging Face: [CompVis/stable-diffusion-v1-4](https://huggingface.co/CompVis/stable-diffusion-v1-4)
- Repositorio espejo objeto de esta ficha: [kcplummer/stable-diffusion-v1-4](https://huggingface.co/kcplummer/stable-diffusion-v1-4)
- Repositorio de codigo (GitHub): [CompVis/stable-diffusion](https://github.com/CompVis/stable-diffusion)
- Paper (CVPR 2022): [High-Resolution Image Synthesis With Latent Diffusion Models](https://arxiv.org/abs/2112.10752)
- Blog de Hugging Face sobre Stable Diffusion con diffusers: [Stable Diffusion with 🧨 Diffusers](https://huggingface.co/blog/stable_diffusion)
- Licencia CreativeML OpenRAIL-M: [enlace a la licencia](https://huggingface.co/spaces/CompVis/stable-diffusion-license)
