# dcw11/NSFW-gen-v2

## Resumen

NSFW-gen-v2 es un modelo de generación de imágenes texto-a-imagen desarrollado por UnfilteredAI, la organización de OEvortex, y publicado en Hugging Face bajo el ID dcw11/NSFW-gen-v2. Está diseñado específicamente para producir contenido visual explícito y sin filtros a partir de descripciones textuales, con un estilo de renderizado 3D que permite generar imágenes más realistas cuando se incluye el token "3d" o "3d style" en el prompt. El modelo se basa en el pipeline StableDiffusionXLPipeline de la librería diffusers y parte del modelo base OEvortex/PixelGen, que a su vez es un fine-tune de HelpingAI/PixelGen.

Con 3.468.838.944 parámetros (aproximadamente 3,47 mil millones) y un tamaño de repositorio de 26,2 GB en FP16, el modelo ofrece una capacidad amplia para la generación de imágenes diversas. Fue creado el 23 de agosto de 2026 y es una versión revisada del generador original de UnfilteredAI. Su relevancia radica en la demanda de herramientas de generación de imágenes no censuradas, un nicho que ha crecido en plataformas de código abierto, aunque su uso está restringido a mayores de edad según su licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (SDXL) |
| Parametros totales | 3.468.838.944 (3,47 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; el encoder de texto usa el contexto del tokenizador de CLIP) |
| Tipos de cuantizacion | FP16 (tensor type) |
| Idiomas soportados | en, pt, th |
| Licencia | other (no especificada; no es una licencia open source estándar) |
| Formato de pesos | safetensors (diffusers) |
| Pipeline | StableDiffusionXLPipeline (text-to-image) |
| Repositorio | 26,2 GB |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Stable Diffusion XL (SDXL), un modelo de difusión latente de dos etapas que utiliza un UNet con aproximadamente 2,6 mil millones de parámetros y dos encoders de texto (CLIP ViT-L y OpenCLIP ViT-bigG). El pipeline completo, incluyendo VAE y encoders, suma los 3,47 mil millones de parámetros declarados. El proceso de generación opera en el espacio latente, con un VAE que comprime las imágenes a una representación de menor dimensión y un UNet que denota iterativamente el ruido guiado por la condición textual.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens de imagen utilizados ni los métodos de alineación (RLHF, DPO, etc.). El modelo es un fine-tune de OEvortex/PixelGen, que a su vez deriva de HelpingAI/PixelGen, por lo que hereda la arquitectura y parte de los pesos de esa cadena de modelos. La innovación destacable es la inclusión de capacidad de renderizado 3D, que se activa mediante tokens específicos en el prompt, lo que permite generar imágenes con estética tridimensional más realista.

## Capacidades

- Generación de imágenes texto-a-imagen sin censura, incluyendo contenido explícito y NSFW.
- Renderizado 3D: produce imágenes con estilo tridimensional y más realistas cuando se incluye "3d" o "3d style" en el prompt.
- Soporte multilingüe para inglés (en), portugués (pt) y tailandés (th).
- Operación en FP16 para optimizar el uso de memoria y la velocidad de inferencia.
- Compatible con el pipeline de diffusers (StableDiffusionXLPipeline), lo que permite integración con el ecosistema de Hugging Face y herramientas de generación como ComfyUI o Automatic1111.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de generación de imágenes, no un modelo de lenguaje.

## Casos de uso

- Creación de arte digital explícito: artistas y creadores de contenido pueden generar ilustraciones NSFW de estilo 3D para proyectos personales o colecciones, usando prompts descriptivos en inglés, portugués o tailandés.
- Prototipado de conceptos visuales: diseñadores que necesitan explorar variaciones rápidas de escenas o personajes con estética 3D sin depender de software de modelado, usando el modelo como generador de conceptos.
- Generación de contenido para comunidades de usuarios adultos: foros y plataformas con temática NSFW pueden integrar el modelo en sus herramientas de creación para que los usuarios generen imágenes personalizadas bajo demanda.
- Pruebas de sistemas de moderación: investigadores pueden usar el modelo para generar conjuntos de imágenes explícitas sintéticas y evaluar la eficacia de sistemas de filtrado y moderación de contenido.
- Creación de assets para juegos o experiencias VR de contenido adulto: el renderizado 3D permite generar texturas o escenas preliminares que luego se refinan con herramientas de modelado.
- Experimentación académica en generación de imágenes sin censura: laboratorios que estudian los límites de los modelos de difusión y las políticas de seguridad pueden emplear el modelo como caso de estudio controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de FID, CLIP score ni comparaciones cuantitativas con otros modelos de generación de imágenes en la model card o en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo SDXL en FP16, se estima un consumo de entre 8 y 12 GB de VRAM para generar imágenes a 1024×1024 píxeles. No hay datos oficiales del autor.
- GPU recomendadas: NVIDIA RTX 3080/3090 (12-24 GB), RTX 4090 (24 GB) o GPUs de centro de datos como A100 (40-80 GB) para inferencia con lotes grandes. No se ha confirmado soporte para GPUs con menos de 8 GB.
- En consumer GPU: cabe en tarjetas de gama alta con 12 GB o más. Con cuantización adicional (por ejemplo, a FP8 o INT8) podría ejecutarse en GPUs con 8 GB, pero no se ha verificado.
- Opciones de despliegue: compatible con diffusers, por lo que se puede desplegar con vLLM (para pipelines de difusión), ComfyUI, Automatic Diffusion, Replicate, y servicios como Microsoft Foundry Models (según el catálogo de Azure).
- Latencia y throughput: no disponible. En una RTX 4090, una generación de 1024×1024 en SDXL típicamente toma entre 5 y 15 segundos, pero esto no está confirmado para este modelo concreto.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (generación de imágenes NSFW sin censura). Alternativas de generación de imágenes sin filtro que existen en el ecosistema incluyen:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NSFW-gen-v2 (este) | 3,47 B | No aplica | other | Hugging Face |
| UnfilteredAI/NSFW-GEN-ANIME | no disponible | No aplica | other | Hugging Face |
| John6666/fucktastic-real-checkpoint-pony-pdxl-porn-realistic-nsfw-sfw-21-sdxl | no disponible | No aplica | no disponible | Hugging Face |

No se han encontrado datos de rendimiento comparativos entre estos modelos. La comparación se limita a la disponibilidad y al enfoque (anime vs. realista).

## Limitaciones y advertencias

- Contenido explícito: el modelo genera imágenes NSFW y potencialmente explícitas. Su uso está restringido a mayores de edad en su jurisdicción.
- Licencia "other": no es una licencia open source estándar; no se especifican términos claros de uso comercial, redistribución ni atribución. Se recomienda revisar la documentación del autor antes de usarlo en producción.
- Sesgos y alucinaciones: no hay datos sobre sesgos, pero es probable que el modelo refleje los sesgos de los datos de entrenamiento, especialmente en representación de identidades y estereotipos, dado que no se ha publicado información sobre el dataset.
- Riesgo de contenido ilegal: en muchas jurisdicciones, la generación de imágenes explícitas puede ser ilegal si involucra menores o contenido no consensuado. Es responsabilidad del usuario verificar la legalidad de su uso.
- Sin soporte de moderación: el modelo no incluye mecanismos de filtrado ni guardas de seguridad; todo el control del contenido recae en el usuario.
- Limitación de idiomas: aunque soporta en, pt, th, no se ha confirmado el rendimiento en español; es probable que los prompts en español funcionen, pero el modelo está optimizado para los idiomas declarados.
- Requisitos de hardware: el tamaño del repositorio (26,2 GB) y los requisitos de VRAM hacen que no sea adecuado para entornos con recursos limitados.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/dcw11/NSFW-gen-v2
- Organización UnfilteredAI en Hugging Face: https://huggingface.co/UnfilteredAI
- Catálogo de modelos de Microsoft Foundry (Azure AI): https://ai.azure.com/catalog/models/unfilteredai-nsfw-gen-v2
- Versión anime del modelo: https://huggingface.co/UnfilteredAI/NSFW-GEN-ANIME
- Guía de prompts NSFW de UncensoredHub: https://uncensoredhub.ai/guides/nsfw
