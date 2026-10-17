# Pertere/Qwen-Image-2.1

## Resumen

Qwen-Image-2.1 es un modelo unificado de generación de imágenes a partir de texto (text-to-image) y de edición de imágenes, desarrollado por el equipo Qwen de Alibaba. Su componente de generación visual es un Diffusion Transformer (DiT) de tipo single-stream con 32 capas y 7.115.124.736 parámetros, una cifra relativamente contenida para la resolución que maneja: 2048x2048 nativos y relaciones de aspecto de hasta 2752x1536. El modelo se distribuye a través de la librería `diffusers` mediante la clase `QwenImage21Pipeline`.

La ficha analizada aquí, Pertere/Qwen-Image-2.1, es una réplica del repositorio oficial Qwen/Qwen-Image-2.1 publicada por el usuario Pertere, con 0 descargas y 0 likes en el momento de la consulta y un tamaño de repositorio de 33,1 GB. La relevancia de esta versión 2.1 dentro de la familia Qwen-Image radica en cuatro ejes declarados por el autor: arquitectura compacta con atención de granularidad mixta y reutilización de caché KV de prefijo; generación nativa de imágenes con transparencia (RGBA) unificada con la edición; edición versátil con hasta 10 imágenes de referencia y máscaras; y mejora de texturas, tipografía e iluminación de retratos.

Al tratarse de un modelo de difusión y no de un modelo de lenguaje, conceptos como ventana de contexto, tool calling o cuantizaciones GGUF no están contemplados en la información disponible y se indican como no disponibles o no aplicables en las secciones correspondientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) single-stream, 32 capas, con atención de granularidad mixta y reutilización de caché KV de prefijo |
| Parámetros totales | 7.115.124.736 (según los pesos safetensors del repositorio) |
| Parámetros activos | No aplica (no es un modelo MoE); no disponible |
| Longitud de contexto | No aplica: el modelo no expone ventana de contexto textual. Acepta hasta 10 imágenes de referencia en tareas de edición |
| Tipos de cuantización | No disponible en la información proporcionada. Los pesos publicados se distribuyen en `bfloat16` |
| Idiomas soportados | No disponible |
| Licencia | `qwen-research` (Qwen Research License Agreement), etiquetada en HuggingFace como `other` |
| Formato de pesos | safetensors, en formato `diffusers` |
| Pipeline declarado | `text-to-image` (`QwenImage21Pipeline`) |
| Resoluciones soportadas | 1:1 (2048x2048), 4:3 (2400x1792), 3:4 (1792x2400), 3:2 (2528x1696), 2:3 (1696x2528), 16:9 (2752x1536), 9:16 (1536x2752) |
| Pasos de inferencia recomendados | 40 |
| Tamaño del repositorio | 33,1 GB |
| Requisitos de librerías | torch>=2.4.0, transformers>=5.17, diffusers (instalación desde el repositorio de GitHub), accelerate, pillow |

## Arquitectura y entrenamiento

El componente de generación visual es un transformer de difusión de flujo único (single-stream DiT) de 32 capas y 7B de parámetros, diseñado para equilibrar calidad, eficiencia de inferencia y versatilidad. Dos innovaciones técnicas declaradas por el autor son la atención de granularidad mixta y la reutilización de la caché KV de prefijo, orientadas ambas a reducir el coste computacional manteniendo la calidad de imagen. El modelo cubre de forma nativa tanto la generación RGB convencional como la generación con canal alfa (RGBA), y unifica en un mismo modelo la creación desde texto, la edición de capas transparentes y la extracción de sujetos a partir de fotografías.

En cuanto a los datos de entrenamiento, la información disponible no incluye el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO u otras. Tampoco se detalla la arquitectura del codificador de texto asociado ni las dimensiones del VAE. Todos estos puntos quedan como no disponibles.

## Capacidades

- Generación de imágenes a partir de texto con resolución nativa de 2048x2048 y siete relaciones de aspecto predefinidas.
- Generación nativa de imágenes con transparencia (RGBA) mediante un formato de prompt recomendado por el autor.
- Edición de imágenes guiada por prompt sobre una imagen de entrada.
- Uso de hasta 10 imágenes de referencia en una misma operación de edición.
- Edición local especificada mediante círculos, anotaciones pintadas o máscaras separadas.
- Preservación de identidad de personas y productos en tareas de edición.
- Extracción de sujetos a partir de fotografías.
- Mejora declarada en el renderizado de tipografía y texto dentro de la imagen.
- Mejora declarada en iluminación de retratos y detalles finos.
- Composiciones a partir de múltiples referencias (el autor muestra como ejemplo una fotografía de grupo generada a partir de seis retratos).
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Optimización de memoria mediante `enable_model_cpu_offload()`.

## Casos de uso

- Generación de stickers y assets con transparencia: el modelo emite PNG con canal alfa directamente, sin necesidad de segmentación posterior, lo que simplifica la producción de pegatinas, iconos y elementos de interfaz.
- Edición de producto en comercio electrónico: cambiar el fondo o el entorno de una fotografía de producto conservando la identidad del artículo, mediante prompt y máscara, sin rehacer la sesión fotográfica.
- Extracción y recorte de sujetos para catálogos: aislar personas u objetos de fotografías existentes para reutilizarlos en nuevas composiciones o materiales de marca.
- Retoque fotográfico de retratos: el modelo declara mejoras específicas en iluminación de retratos, útil para flujos de estudio que necesitan correcciones de luz sin retoque manual.
- Composición de escenas grupales a partir de referencias: con hasta 10 imágenes de referencia se pueden construir escenas con varias personas manteniendo el parecido, por ejemplo para materiales promocionales o pruebas de concepto de vestuario.
- Cartelería y material gráfico con texto: gracias a la mejora en renderizado tipográfico, permite generar carteles o banners donde el texto forma parte de la imagen generada.
- Adaptación de una misma creatividad a múltiples formatos: las siete relaciones de aspecto predefinidas (de 1:1 a 9:16) permiten reutilizar un concepto para redes sociales, web y formatos verticales sin recortes manuales.
- Prototipado rápido en diseño gráfico: con 40 pasos de inferencia y una arquitectura de 7B, puede integrarse en un bucle iterativo de exploración de conceptos visuales antes de la producción final.
- Automatización de assets para campañas: combinado con un pipeline de `diffusers` en Python, permite generar lotes de imágenes a partir de una lista de prompts y semillas fijas para reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas cuantitativas (FID, CLIP score, GenEval, DPG-Bench ni similares) ni comparaciones numéricas con otros modelos; únicamente presenta ejemplos visuales de generación, transparencia, edición y renderizado de texto.

## Requisitos de hardware

- VRAM estimada para el componente de generación visual: aproximadamente 14,2 GB solo para los pesos del transformer en `bfloat16` (cálculo derivado de 7.115.124.736 parámetros x 2 bytes). Este valor no incluye el codificador de texto ni el VAE, cuyas dimensiones no se detallan en la información disponible.
- Tamaño total de descarga: 33,1 GB de repositorio, lo que sugiere que el conjunto completo de componentes (transformer, codificador de texto, VAE y posibles variantes) es considerablemente mayor que el transformer por sí solo.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo, son razonables GPU de 24 GB o más (RTX 3090, RTX 4090, A100 40/80 GB, H100) para trabajar a 2048x2048 sin offloading; esta recomendación es una estimación, no un dato publicado.
- Viabilidad en GPU de consumo: plausible en tarjetas de 24 GB, especialmente activando `enable_model_cpu_offload()`, que el propio autor documenta como opción de optimización de memoria. No hay datos publicados de consumo real medido.
- Opciones de despliegue: `diffusers` con `QwenImage21Pipeline`, sobre torch>=2.4.0, transformers>=5.17 y accelerate. No se mencionan otros runtimes (vLLM, llama.cpp, Ollama, TGI, ComfyUI) en la información disponible.
- Latencia y throughput: no disponibles. El único parámetro de rendimiento documentado es el número de pasos de inferencia recomendado (40).

## Comparativa con modelos similares

La información proporcionada no incluye datos comparativos de otros modelos. En la misma categoría funcional (generación y edición de imágenes con salida de alta resolución) podrían situarse alternativas como Qwen-Image (versión anterior de la misma familia), FLUX.1 o las variantes de Stable Diffusion 3.5, pero no se dispone de parámetros, resoluciones, licencias ni métricas verificadas para ellas en el material consultado.

| Modelo | Parámetros | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-2.1 (esta ficha) | 7.115.124.736 en el componente visual | hasta 2048x2048 y ratios de 2752x1536 | `qwen-research` | HuggingFace y ModelScope |
| Qwen-Image (versión previa) | no disponible | no disponible | no disponible | no disponible |
| FLUX.1 | no disponible | no disponible | no disponible | no disponible |
| Stable Diffusion 3.5 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia `qwen-research`: no es una licencia permisiva tipo Apache 2.0 o MIT. Cualquier uso comercial debe revisarse contra el texto de la Qwen Research License Agreement incluida en el repositorio.
- Repositorio réplica no oficial: la ficha Pertere/Qwen-Image-2.1 figura con 0 descargas y 0 likes y fue publicada el 2026-10-16. Para uso en producción conviene descargar los pesos desde el repositorio oficial Qwen/Qwen-Image-2.1 y verificar la integridad de los ficheros.
- Ausencia de benchmarks: no hay métricas publicadas en la información disponible, por lo que no es posible validar cuantitativamente las afirmaciones de mejora en tipografía, iluminación o fidelidad de identidad.
- Riesgo de artefactos propios de los modelos de difusión: deformaciones anatómicas, texto mal formado o incoherencias en escenas complejas son riesgos habituales de esta familia. El autor declara mejoras en tipografía, pero no aporta métricas que las respalden.
- Idiomas soportados no declarados: se desconoce el comportamiento con prompts en castellano u otros idiomas distintos del inglés, y no hay información sobre sesgos culturales o demográficos del dataset de entrenamiento.
- Sesgos conocidos: no disponibles. El autor no publica información sobre composición del dataset ni evaluaciones de sesgo.
- Coste de memoria elevado: la resolución nativa de 2048x2048 y los 33,1 GB de repositorio implican requisitos de VRAM y almacenamiento relevantes; sin offloading, una GPU de 24 GB puede quedarse corta al sumar codificador de texto y VAE.
- Sin datos de entrenamiento: al desconocerse la composición del dataset y el proceso de alineación, no es posible evaluar la procedencia de los datos ni posibles reclamaciones de derechos.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso; cualquier sistema que lo integre debe aportar esa capa por separado.

## Enlaces

- Ficha analizada (réplica): https://huggingface.co/Pertere/Qwen-Image-2.1
- Repositorio oficial en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1
- Blog oficial: https://qwen.ai/blog?id=qwen-image-2.1
- Demo (Space): https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- Repositorio GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Discord: https://discord.gg/BEYSk3pkSu
- Formulario de feedback del equipo Qwen Image: https://alidocs.dingtalk.com/notable/share/form/v01WgZOZA5DaVQPeqLX_dv19yqvsgs3oebp3pcjys_1qX0QQ0?source=link
- Licencia (Qwen Research License Agreement): https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
