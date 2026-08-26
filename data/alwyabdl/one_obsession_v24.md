# alwyabdl/One_Obsession_v24

## Resumen

One_Obsession_v24 es un modelo de generación de imágenes de tipo text-to-image basado en la arquitectura Stable Diffusion XL (SDXL), desarrollado por el usuario alwyabdl. Pertenece a la serie "One Obsession", un conjunto de checkpoints especializados en ilustración y anime, con versiones previas como la v19 y la v24 publicadas por otros autores como John6666. Este modelo resuelve el problema de generar imágenes de alta calidad con estética anime e ilustración, con especial énfasis en representaciones de mechas y vehículos, según las reseñas de usuarios.

Con aproximadamente 2.567 millones de parámetros y un tamaño de repositorio de 6.9 GB, el modelo se distribuye en formato safetensors y es compatible con la librería diffusers de Hugging Face. Su relevancia actual radica en que es la versión más reciente de una serie que ha recibido una valoración de 5 estrellas por parte de 143 usuarios en Civitai, lo que indica una comunidad activa y satisfecha. No se dispone de información sobre la licencia ni los idiomas soportados, aunque por su naturaleza de generación de imágenes, el texto de entrada suele ser en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (SDXL) |
| Parametros totales | 2.567.463.684 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusión) |
| Tipos de cuantizacion | no disponible (formato safetensors) |
| Idiomas soportados | no disponible (probablemente inglés para prompts) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

One_Obsession_v24 se basa en la arquitectura Stable Diffusion XL, que combina un autoencoder variacional (VAE) con un UNet como red de denoising y dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG). Este modelo es una versión afinada de SDXL, especializada en ilustración y anime. No se han proporcionado detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados ni si se emplearon técnicas de ajuste como RLHF o DPO, ya que estos datos no están disponibles en la información pública. La versión v24 es la más reciente de la serie, y según las reseñas en Civitai, se ha optimizado para mejorar la representación de mechas y elementos mecánicos.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image).
- Especialización en estilos de ilustración y anime, con alta calidad en la representación de personajes y escenas.
- Capacidad mejorada para representar mechas, robots y vehículos, según las evaluaciones de usuarios en la versión v24.
- Compatible con el pipeline StableDiffusionXLPipeline de diffusers, lo que permite su uso en entornos de producción.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de generación de imágenes.
- No tiene capacidades de visión adicionales (como detección de objetos) ni de audio; es un modelo de difusión estándar.

## Casos de uso

- Diseño de personajes para animación: el modelo puede generar conceptos de personajes anime con gran detalle, ideal para estudios de animación o ilustradores que necesiten iterar rápidamente sobre diseños.
- Creación de fondos y escenarios: permite generar entornos de alta calidad para cómics, juegos o producciones visuales, reduciendo el tiempo de bocetado manual.
- Ilustración de mechas y vehículos: gracias a su optimización en v24, es adecuado para diseñar robots, naves y armaduras mecánicas, útil en la industria del diseño industrial o el entretenimiento.
- Generación de portadas y material promocional: puede crear imágenes llamativas para portadas de libros, carteles o publicaciones en redes sociales, con un estilo consistente.
- Prototipado rápido de escenas: los desarrolladores de juegos pueden usar el modelo para generar fondos o texturas preliminares que luego se refinen en herramientas como Blender o Photoshop.
- Personalización de contenido para fans: la comunidad puede generar ilustraciones de personajes o escenas personalizadas, siempre que la licencia lo permita (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información proporcionada, ya que este es un modelo de generación de imágenes y no de lenguaje. Tampoco hay datos numéricos sobre la calidad de las imágenes (por ejemplo, FID o CLIP score) disponibles públicamente. La única referencia de rendimiento es la valoración de 5 estrellas por 143 usuarios en Civitai, lo que sugiere un alto grado de satisfacción, pero no constituye un benchmark objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: se requiere al menos 8 GB de VRAM para ejecutar el modelo en fp16; se recomienda 12 GB o más para obtener un rendimiento óptimo y evitar desbordamientos de memoria.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 3080, RTX 4090, A100, H100. También es compatible con GPUs de AMD con ROCm, aunque con menor soporte.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo como la RTX 4090 (24 GB) y la RTX 3060 (12 GB) con cuantización.
- Opciones de despliegue: se puede usar con diffusers (Python), ComfyUI, Automatic1111, o servidores de inferencia como Replicate o RunPod. También es compatible con el formato safetensors para cargar en cualquier framework que soporte SDXL.
- Latencia y throughput estimados: en una GPU RTX 4090, la generación de una imagen de 1024x1024 tarda aproximadamente 5-10 segundos en el pipeline de diffusers, con un throughput de 6-12 imágenes por minuto, dependiendo del número de pasos de denoising.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| One_Obsession_v24 | 2.567 M | no aplica | no disponible | Ilustración/anime | Hugging Face |
| SDXL Base | 3.5 M | no aplica | OpenRAIL++ | Generalista | Hugging Face |
| Illustrious-XL | ~2.6 M | no aplica | no disponible | Anime/Ilustración | Hugging Face |

One_Obsession_v24 es comparable a otros checkpoints basados en SDXL especializados en anime, como Illustrious-XL. Ambos comparten la misma arquitectura base y tamaño de parámetros, pero One_Obsession se distingue por su optimización en mechas y su serie de versiones iterativas. La licencia de One_Obsession_v24 no está disponible, lo que limita su uso comercial sin consultar al autor.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el modelo permite uso comercial, redistribución o modificación. Se recomienda contactar al autor antes de usarlo en proyectos comerciales.
- Contenido adulto: según las reseñas en Civitai, el modelo puede generar imágenes de carácter 18+ (contenido explícito). Esto requiere control de acceso y filtros adicionales si se usa en aplicaciones públicas.
- Sesgos y alucinaciones: como todo modelo de difusión, puede generar imágenes con artefactos, proporciones incorrectas o elementos distorsionados en escenas complejas.
- Limitación de idioma: no se ha confirmado el soporte multilingüe en los prompts, aunque los modelos SDXL suelen funcionar mejor con prompts en inglés.
- Riesgo de sobreajuste: la especialización en anime puede limitar su rendimiento en estilos realistas o fotográficos, siendo menos versátil que modelos generales.
- Requisitos de hardware: no se puede ejecutar en GPU con menos de 8 GB de VRAM sin cuantización, lo que limita su uso en equipos modestos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alwyabdl/One_Obsession_v24
- Versión anterior (John6666/one-obsession-14-24d-sdxl): https://huggingface.co/John6666/one-obsession-14-24d-sdxl
- Reseñas en Civitai: https://civitai.com/models/1318945/reviews?modelVersionId=1522352
- Análisis de v24 en note.com: https://note.com/ikarush/n/n58cd7a3f2617?hl=en
- TensorHub Art: https://tensorhub.art/models/1022483607941287680
- Versión Illustrious (John6666/one-obsession-12illustrious20-sdxl): https://huggingface.co/John6666/one-obsession-12illustrious20-sdxl
