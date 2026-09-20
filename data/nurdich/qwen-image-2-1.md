# nurdich/Qwen-Image-2.1

## Resumen

Qwen-Image-2.1 es un modelo unificado de generación de imágenes a partir de texto (*text-to-image*) y edición de imágenes, perteneciente a la familia Qwen. La ficha analizada corresponde al repositorio `nurdich/Qwen-Image-2.1`, una réplica publicada por el usuario *nurdich* del modelo oficial `Qwen/Qwen-Image-2.1`; el contenido de la model card reproduce la documentación del autor original. Con 7.115.124.736 parámetros en los pesos safetensors del repositorio y 32 capas de tipo Single-Stream DiT, el modelo se posiciona en la franja de los 7B, un tamaño que prioriza la eficiencia de inferencia frente a los modelos de difusión de mayor escala.

La propuesta técnica del modelo se apoya en cuatro ejes: una arquitectura compacta con atención de granularidad mixta y reutilización de *prefix KV cache*; generación nativa de imágenes con transparencia real (canal alfa, RGBA); edición versátil con hasta 10 imágenes de referencia y especificación de zonas locales mediante círculos, anotaciones pintadas o máscaras separadas; y una mejora explícita de texturas, tipografía e iluminación de retratos. Todo ello en un único modelo que cubre generación, edición y extracción de sujetos.

Su relevancia actual reside en que resuelve en un solo pipeline tareas que tradicionalmente requerían modelos separados: generación desde cero, edición con preservación de identidad y producción de *assets* con transparencia para diseño gráfico y *e-commerce*. El modelo se distribuye a través de la librería `diffusers` con la clase `QwenImage21Pipeline` y se publica bajo la licencia Qwen Research License Agreement, orientada a investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con 32 capas Single-Stream, atención de granularidad mixta y reutilización de prefix KV cache |
| Parámetros totales | 7.115.124.736 (7,1B) según los pesos safetensors; la model card indica 7B en el componente de generación visual |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de LLM, se trata de un modelo de difusión y la model card no especifica el límite de tokens del encoder de texto |
| Tipos de cuantización | no disponible; el repositorio distribuye pesos en safetensors |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License Agreement, etiquetada como `license: other`) |
| Formato de pesos | safetensors, integrado en la librería diffusers |
| Pipeline en diffusers | `QwenImage21Pipeline` |
| Resoluciones y relaciones de aspecto | 1:1 (2048x2048), 4:3 (2400x1792), 3:4 (1792x2400), 3:2 (2528x1696), 2:3 (1696x2528), 16:9 (2752x1536), 9:16 (1536x2752) |
| Imágenes de referencia en edición | hasta 10 |
| Canales de salida | RGB y RGBA (transparencia nativa) |
| Pasos de inferencia de referencia | 40 |

## Arquitectura y entrenamiento

El componente de generación visual es un *Diffusion Transformer* (DiT) de 32 capas organizadas en un esquema Single-Stream, es decir, con procesamiento conjunto de las señales de texto e imagen en lugar de bloques separados de doble flujo. La model card destaca dos innovaciones de eficiencia: atención de granularidad mixta y reutilización de *prefix KV cache*, que reducen el coste computacional manteniendo la calidad de imagen. El modelo incorpora además un VAE capaz de producir salidas con canal alfa, lo que habilita la generación y edición nativas en RGBA, y un componente de encoder de texto cuyo tamaño, arquitectura y datos de entrenamiento no se detallan en la información disponible.

No se han publicado en la model card datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las etapas de ajuste (fine-tuning). Tampoco se especifica si hubo entrenamiento multilingüe o qué proporción de datos correspondió a tipografía, retratos o materiales transparentes, pese a que las mejoras anunciadas en tipografía, iluminación de retratos y detalles finos sugieren un trabajo específico en esos dominios. El repositorio ocupa 33,1 GB, una cifra muy superior a los ~14,2 GB que ocuparían 7,1B parámetros en bf16; la model card no explica qué componentes adicionales, duplicados de precisión u otros artefactos justifican esa diferencia.

## Capacidades

- Generación de imágenes a partir de descripciones textuales, con soporte de texto renderizado dentro de la imagen (tipografía), iluminación de retratos y detalles finos.
- Generación nativa de imágenes con transparencia (RGBA), incluyendo pegatinas, recortes y elementos de diseño con fondo transparente. El formato de prompt recomendado es del tipo "This is an RGBA image with transparency. ... The image has alpha channel and the background is transparent."
- Edición de imágenes: cambio de fondo, modificación de elementos y otras operaciones descritas en lenguaje natural sobre una imagen de entrada.
- Edición local guiada: se pueden definir zonas mediante círculos, anotaciones pintadas o máscaras separadas.
- Composición con múltiples referencias: admite hasta 10 imágenes de referencia, lo que permite generar fotografías grupales a partir de retratos individuales.
- Preservación de identidad de personas y productos durante la edición.
- Extracción de sujetos a partir de fotografías (subject extraction).
- Edición de capas transparentes, no solo generación.
- No se documenta soporte de *tool calling*, *function calling*, uso como agente ni razonamiento multi-paso: no es un modelo de lenguaje y no se anuncia ninguna capacidad de ese tipo.
- No se documentan capacidades de audio, vídeo ni comprensión de imágenes más allá de las funciones de edición descritas.

## Casos de uso

- Diseño gráfico con transparencia: generación directa de pegatinas, logotipos, iconos y elementos de *packaging* en RGBA, evitando el paso posterior de recorte y eliminación de fondo en un editor. La salida con canal alfa es nativa, no un post-proceso.
- *E-commerce* y fotografía de producto: edición de imágenes de catálogo para sustituir fondos, ajustar iluminación o adaptar la escena a distintas campañas, con preservación de la identidad del producto mediante edición local por máscara.
- Retoque fotográfico de retratos: el modelo declara mejoras específicas en iluminación de retratos, lo que permite usarlo para reiluminar o reencuadrar fotografías de personas manteniendo el parecido, usando referencias de identidad.
- Creación de imágenes de equipo o *marketing* corporativo: composición de fotografías grupales a partir de hasta 10 retratos de referencia, útil para materiales promocionales sin necesidad de una sesión fotográfica conjunta.
- Producción de *assets* para interfaces y aplicaciones: generación de ilustraciones con transparencia en proporciones 16:9, 1:1 o 9:16 para integrarlas directamente en webs, apps móviles o presentaciones.
- Extracción de sujetos para *pipelines* de datos: separación automática de personas u objetos del fondo para construir datasets de entrenamiento, catálogos o bancos de recursos reutilizables.
- Prototipado rápido de campañas: generación a 2048x2048 y variaciones por relación de aspecto en 40 pasos de inferencia, integrable en flujos de diseño iterativo mediante la API de `diffusers`.
- Edición asistida por anotación: en herramientas internas, un usuario puede marcar una zona con un círculo o una máscara pintada y delegar el cambio en el modelo, lo que simplifica la interfaz frente a soluciones que exigen máscaras de precisión pixel a pixel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de Qwen-Image-2.1 no incluye tablas comparativas con métricas como FID, CLIP score, GenEval, DPG-Bench, HPSv2 ni evaluaciones de edición tipo ImgEdit o GEdit-Bench, y los resultados de búsqueda web disponibles no contienen datos técnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los 7.115.124.736 parámetros en bf16/fp16 ocupan aproximadamente 14,2 GB solo en pesos, a lo que hay que sumar el encoder de texto, el VAE y las activaciones. No hay cifras oficiales de VRAM publicadas en la información disponible; las cantidades indicadas aquí son estimaciones derivadas del recuento de parámetros, no datos del autor.
- GPU recomendadas para ejecución sin *offload*: A100 (40 GB y 80 GB), H100 (80 GB) y, en el entorno de consumo, RTX 4090 o RTX 3090 con 24 GB de VRAM.
- Viabilidad en GPU de consumo: con 24 GB de VRAM debería ser ejecutable en bf16, especialmente a resoluciones intermedias; en GPUs de 16 GB o menos es previsible necesitar `enable_model_cpu_offload()` o cuantizaciones de terceros no documentadas por el autor.
- Optimización de memoria: la model card documenta explícitamente el uso de `pipe.enable_model_cpu_offload()` para descargar componentes a CPU.
- Opciones de despliegue: `diffusers` con `QwenImage21Pipeline` es la vía documentada, con `torch>=2.4.0`, `transformers>=5.17`, `accelerate` y `pillow`. No se documentan soportes específicos para vLLM, llama.cpp, Ollama o TGI, que en cualquier caso no son aplicables a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles. La única referencia operativa es la configuración de ejemplo con 40 pasos de inferencia y resolución de hasta 2752x1536, que da una idea del coste, pero sin cifras de tiempo por imagen ni de imágenes por segundo.

## Comparativa con modelos similares

La información disponible no incluye datos de rendimiento ni especificaciones de modelos competidores, por lo que la comparación se limita a lo que puede deducirse de la propia documentación.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nurdich/Qwen-Image-2.1 (réplica) | 7.115.124.736 | no aplica | qwen-research | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen-Image-2.1 (oficial) | no disponible | no aplica | qwen-research | HuggingFace, ModelScope, demo en Spaces |
| Qwen-Image (versión anterior de la familia) | no disponible | no aplica | no disponible | referenciado en la documentación del proyecto |
| Alternativas de la misma categoría (FLUX, Stable Diffusion, etc.) | no disponible | no aplica | no disponible | no se han proporcionado datos en la información disponible |

No se dispone de comparativas de calidad, eficiencia ni licencia frente a otros modelos de generación y edición de imagen, por lo que cualquier afirmación en ese sentido carecería de respaldo.

## Limitaciones y advertencias

- Datos de rendimiento ausentes: no hay benchmarks publicados en la información disponible, lo que impide validar las mejoras anunciadas en tipografía, iluminación o preservación de identidad.
- Licencia restrictiva: el modelo se distribuye bajo la Qwen Research License Agreement, etiquetada como `license: other`. Es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial, ya que el nombre de la licencia sugiere un ámbito de investigación.
- Riesgo de alucinación visual: como todo modelo generativo de difusión, puede producir texto ilegible en la imagen, anatomías incorrectas, logotipos inventados o detalles incoherentes con el prompt. La propia model card presume de mejoras en tipografía, lo que implica que en versiones previas era un punto débil conocido.
- Repositorio réplica, no oficial: `nurdich/Qwen-Image-2.1` no es el repositorio del equipo Qwen. No hay garantía de que los pesos coincidan bit a bit con los oficiales, ni de mantenimiento, actualizaciones o soporte. Para uso en producción conviene partir de `Qwen/Qwen-Image-2.1`.
- Señales de adopción nulas: 0 descargas y 0 likes en el momento de la consulta, con fecha de creación y actualización en el mismo instante (2026-09-20T17:14:55 y 17:14:56), lo que indica una subida reciente sin validación por parte de la comunidad.
- Idiomas no documentados: no se especifica qué lenguas comprende el encoder de texto ni su calidad relativa, un factor crítico si se pretende generar texto dentro de la imagen en castellano.
- Coste computacional elevado: las resoluciones de referencia llegan a 2752x1536 y 40 pasos de inferencia, con un repositorio de 33,1 GB, lo que exige GPU con memoria abundante o estrategias de *offload*.
- Discrepancia no explicada en el tamaño: el repositorio ocupa 33,1 GB frente a los ~14,2 GB esperables para 7,1B parámetros en bf16; conviene verificar qué contiene antes de planificar el almacenamiento y la carga.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, culturales o de representación, algo relevante en un modelo que genera retratos y preserva identidad.

## Enlaces

- Repositorio analizado (réplica): https://huggingface.co/nurdich/Qwen-Image-2.1
- Repositorio oficial en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1
- Blog del modelo: https://qwen.ai/blog?id=qwen-image-2.1
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- Repositorio GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Discord del proyecto: https://discord.gg/CV4E9rpNSD
- Licencia (Qwen Research License Agreement): https://huggingface.co/nurdich/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio de diffusers: https://github.com/huggingface/diffusers
