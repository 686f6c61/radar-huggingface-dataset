# AndrewDavidJ/stable-diffusion-v-1-2-original

## Resumen

Stable Diffusion v1.2 es un modelo de difusión latente de texto a imagen desarrollado por Robin Rombach y Patrick Esser, publicado originalmente por CompVis y Stability AI. Este checkpoint concreto, alojado por el usuario AndrewDavidJ, es una copia del modelo original `CompVis/stable-diffusion-v-1-2-original` y está pensado para usarse con el código base de CompVis. El modelo genera imágenes fotorrealistas a partir de descripciones textuales, y también permite modificar imágenes existentes mediante técnicas como img2img o inpainting.

La versión 1.2 se inicializó con los pesos de la versión 1.1 y se afinó durante 515.000 pasos a resolución 512×512 sobre el subconjunto "laion-improved-aesthetics" de LAION-2B, filtrado por tamaño, puntuación estética y probabilidad de marca de agua. Utiliza un modelo de difusión latente con un codificador de texto CLIP ViT-L/14 fijo, siguiendo las recomendaciones del paper de Imagen. El repositorio ocupa 12 GB e incluye los checkpoints en formato `.ckpt`.

Este modelo es relevante porque fue uno de los primeros modelos de difusión de código abierto que democratizó la generación de imágenes de alta calidad, y sigue siendo una referencia para investigaciones sobre seguridad, sesgos y aplicaciones creativas. Aunque ha sido superado por versiones posteriores, su licencia permisiva y su arquitectura bien documentada lo convierten en una base útil para experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (UNet + VAE + text encoder CLIP ViT-L/14) |
| Parametros totales | no disponible (el repositorio no especifica el número exacto; el tamaño del repo es 12 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no procesa texto como un LLM; el text encoder CLIP procesa secuencias de hasta 77 tokens) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato `.ckpt`, presumiblemente en fp32) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | `.ckpt` (checkpoint) |

## Arquitectura y entrenamiento

Stable Diffusion v1.2 es un modelo de difusión latente, tal como se describe en el paper "High-Resolution Image Synthesis with Latent Diffusion Models" (Rombach et al., CVPR 2022). La arquitectura consta de tres componentes principales: un autoencoder variacional (VAE) que comprime la imagen a un espacio latente de menor dimensión, un UNet que realiza el proceso de denoising en ese espacio latente, y un codificador de texto CLIP ViT-L/14 fijo que convierte el prompt en embeddings que condicionan la generación. El entrenamiento se realiza en dos etapas: primero se entrena el VAE, y luego se entrena el UNet para denoising condicionado por texto.

El checkpoint v1.2 se inicializó con los pesos de v1.1 y se afinó durante 515.000 pasos a resolución 512×512 sobre "laion-improved-aesthetics", un subconjunto de LAION-2B-en filtrado para incluir imágenes con tamaño original ≥ 512×512, puntuación estética estimada > 5.0 y probabilidad de marca de agua < 0.5. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente de difusión supervisada. La innovación principal es la difusión en el espacio latente, que reduce drásticamente los requisitos computacionales en comparación con la difusión en el espacio de píxeles.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto en inglés.
- Modificación de imágenes existentes mediante técnicas como img2img, inpainting y outpainting (usando el código base de CompVis).
- Generación de arte, ilustraciones y diseños creativos.
- Condicionamiento por texto mediante el codificador CLIP ViT-L/14, que permite capturar atributos semánticos y estilísticos.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo generativo de imágenes, no un LLM.
- Capacidad multilingüe limitada: el modelo fue entrenado principalmente con texto en inglés, por lo que su rendimiento en otros idiomas es inferior.

## Casos de uso

- Creación de arte digital: artistas pueden generar bocetos, conceptos o ilustraciones a partir de descripciones textuales, usando el modelo como herramienta de exploración creativa.
- Diseño de productos y prototipos: diseñadores pueden generar imágenes de referencia para productos, envases o interfaces a partir de briefs textuales.
- Generación de contenido para marketing: creación de imágenes para campañas publicitarias, redes sociales o blogs, reduciendo el tiempo de producción.
- Investigación sobre sesgos y seguridad en modelos generativos: al ser un modelo abierto y bien documentado, es útil para estudiar alucinaciones visuales, sesgos demográficos y mitigaciones.
- Educación y herramientas creativas: integración en aplicaciones educativas que enseñen conceptos de arte, diseño o IA generativa.
- Aumento de datos para entrenamiento de otros modelos: las imágenes sintéticas pueden usarse para aumentar datasets en tareas de visión por computador, aunque con precaución por posibles sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas como FID, CLIP score o comparaciones con otros modelos. Se recomienda consultar el paper original para métricas de calidad de generación, aunque no se proporcionan en esta ficha.

## Requisitos de hardware

- No se especifican requisitos oficiales en la información proporcionada. Sin embargo, al tratarse de un modelo de difusión con aproximadamente 1.000 millones de parámetros (estimación basada en el tamaño del repo y la arquitectura conocida), se puede inferir:
  - Para inferencia en fp32: se necesitan al menos 4 GB de VRAM solo para los pesos, más memoria para las activaciones y el VAE, por lo que se recomienda una GPU con 8 GB o más.
  - Para inferencia en fp16 (si se convierte): se reduce a unos 2 GB de VRAM para los pesos, pero aún se requiere memoria adicional para el proceso de denoising.
- GPUs recomendadas: NVIDIA RTX 2060 (6 GB) o superior, RTX 3060 (12 GB), RTX 4090, A100, etc. En GPUs con menos de 8 GB puede ser necesario usar técnicas de offloading o cuantización.
- El modelo puede ejecutarse en CPU, pero la generación será extremadamente lenta (minutos por imagen).
- Opciones de despliegue: el código original de CompVis (PyTorch), la biblioteca Diffusers de Hugging Face (conversión a safetensors), o interfaces como AUTOMATIC1111/stable-diffusion-webui.
- Latencia y throughput: no disponibles en la información proporcionada; dependen en gran medida del hardware y del número de pasos de denoising (típicamente 50 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stable Diffusion v1.2 (este) | no disponible (~1B estimado) | 77 tokens (CLIP) | CreativeML OpenRAIL-M | Checkpoints `.ckpt` en Hugging Face |
| Stable Diffusion v1.1 | no disponible (~1B estimado) | 77 tokens (CLIP) | CreativeML OpenRAIL-M | Checkpoints `.ckpt` en Hugging Face |
| Stable Diffusion v1.4 | no disponible (~1B estimado) | 77 tokens (CLIP) | CreativeML OpenRAIL-M | Checkpoints `.ckpt` y safetensors en Hugging Face |
| Stable Diffusion v2.1 | ~1.5B (UNet) | 77 tokens (CLIP) | CreativeML OpenRAIL-M | Checkpoints y safetensors en Hugging Face |

La comparativa se basa en características generales conocidas, ya que no se dispone de benchmarks en la información proporcionada. Las versiones posteriores (v1.4, v2.x) mejoran la calidad y el control, pero v1.2 es un punto de partida histórico.

## Limitaciones y advertencias

- El modelo no es perfecto y puede generar imágenes con distorsiones anatómicas, artefactos o incoherencias, especialmente en rostros y manos.
- Puede reflejar sesgos presentes en los datos de entrenamiento (LAION-2B), como estereotipos de género, raza o cultura.
- Riesgo de alucinación visual: el modelo puede generar contenido que no corresponde fielmente al prompt, especialmente con conceptos abstractos o poco comunes.
- Limitación de idioma: entrenado principalmente en inglés, por lo que los prompts en otros idiomas pueden producir resultados de menor calidad.
- La licencia CreativeML OpenRAIL-M permite uso comercial, pero impone restricciones: no se puede usar para generar contenido ilegal o dañino, y se debe compartir una copia de la licencia con los usuarios finales.
- El modelo no fue entrenado para ser factual ni representar eventos reales; su uso para generar imágenes de personas reales o eventos históricos está fuera de alcance.
- Para producción, se recomienda implementar filtros de contenido y moderación, ya que el modelo puede generar contenido explícito o violento si se le pide.

## Enlaces

- Repositorio de Hugging Face (este mirror): https://huggingface.co/AndrewDavidJ/stable-diffusion-v-1-2-original
- Repositorio original de CompVis: https://huggingface.co/CompVis/stable-diffusion-v-1-2-original
- Versión para Diffusers: https://huggingface.co/CompVis/stable-diffusion-v1-2
- Código base de CompVis: https://github.com/CompVis/stable-diffusion
- Paper "High-Resolution Image Synthesis with Latent Diffusion Models": https://arxiv.org/abs/2112.10752
- Paper de CLIP: https://arxiv.org/abs/2103.00020
- Paper de Imagen (referencia para el text encoder): https://arxiv.org/abs/2205.11487
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
