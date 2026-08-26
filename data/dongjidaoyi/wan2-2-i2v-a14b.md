# dongjidaoyi/Wan2.2-I2V-A14B

## Resumen

Wan2.2-I2V-A14B es un modelo de generación de vídeo a partir de imágenes (image-to-video) desarrollado por Wan-AI, la división de inteligencia artificial de Alibaba. Forma parte de la familia Wan2.2, una actualización mayor de los modelos fundacionales de vídeo de Wan, que introduce una arquitectura de mezcla de expertos (MoE) en modelos de difusión de vídeo. El modelo está diseñado para sintetizar secuencias de vídeo coherentes y de alta calidad a partir de una imagen estática y, opcionalmente, un prompt de texto, soportando resoluciones de 480P y 720P a 24 fotogramas por segundo.

La relevancia de este modelo radica en su capacidad para generar movimiento complejo y estética cinematográfica controlable, superando a sus predecesores en términos de calidad y generalización. Al estar liberado bajo licencia Apache 2.0, permite tanto uso académico como comercial, y su integración con Diffusers y ComfyUI facilita su adopción en flujos de trabajo existentes. El modelo emplea una arquitectura MoE con 14.000 millones de parámetros activos (de un total no especificado públicamente), lo que permite aumentar la capacidad del modelo sin incrementar el coste computacional durante el denoising.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) para difusión de vídeo, basada en transformer 3D |
| Parametros totales | No disponible (la nomenclatura A14B indica 14B activos, el total no se ha publicado) |
| Parametros activos | 14.000 millones (14B) |
| Longitud de contexto | No aplica (generación de vídeo; la entrada es una imagen y texto opcional) |
| Tipos de cuantizacion | No disponible (se distribuye en bf16; se pueden aplicar cuantizaciones externas) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Wan2.2-I2V-A14B emplea una arquitectura de mezcla de expertos (MoE) aplicada a un modelo de difusión de vídeo. La innovación clave consiste en separar el proceso de denoising a lo largo de los pasos de tiempo mediante expertos especializados, lo que amplía la capacidad total del modelo manteniendo el mismo coste computacional. Esta arquitectura permite una generación de vídeo más estable, reduciendo movimientos de cámara irreales y mejorando el soporte para escenas estilizadas diversas.

El entrenamiento se realizó sobre un conjunto de datos significativamente mayor que el de Wan2.1, con un aumento del 65,6% en imágenes y del 83,2% en vídeos. Además, se incorporaron datos estéticos cuidadosamente seleccionados con etiquetas detalladas sobre iluminación, composición, contraste y tono de color, lo que permite una generación cinematográfica más precisa y controlable. El modelo utiliza un VAE de alta compresión (16×16×4) que reduce la latencia y permite generar vídeos a 720P@24fps incluso en GPUs de consumo como la RTX 4090. No se han publicado detalles sobre técnicas de alineación como RLHF o DPO, ya que se trata de un modelo generativo de vídeo.

## Capacidades

- Generación de vídeo a partir de una imagen estática (image-to-video) con resoluciones de 480P y 720P a 24 fps.
- Acepta prompts de texto opcionales para condicionar el contenido, el estilo y el movimiento.
- Generación de movimiento complejo y realista, con mejor generalización en escenas dinámicas y semánticas variadas.
- Estética cinematográfica controlable: permite ajustar iluminación, composición, contraste y tono de color mediante etiquetas detalladas.
- Soporte para escenas estilizadas diversas, incluyendo animación, realismo y estilos artísticos.
- Integración con Diffusers y ComfyUI, lo que facilita su uso en pipelines de generación y edición de vídeo.
- Capacidad multilingüe para prompts en inglés y chino.
- No incluye capacidades de audio ni de razonamiento multimodal más allá del vídeo.

## Casos de uso

- Creación de contenido para redes sociales: generar clips cortos animados a partir de imágenes fijas de productos, paisajes o personajes, con movimiento natural y estética atractiva, listos para plataformas como Instagram o TikTok.
- Prototipado de escenas para cine y publicidad: los directores pueden convertir storyboards o imágenes de referencia en vídeos preliminares de 720P para evaluar el movimiento de cámara, la iluminación y la composición antes de la producción real.
- Generación de vídeos de producto para e-commerce: a partir de una fotografía de un artículo, el modelo produce secuencias que muestran el producto desde distintos ángulos o en uso, mejorando la presentación en tiendas online.
- Animación de ilustraciones y arte conceptual: artistas e ilustradores pueden dar vida a sus obras estáticas convirtiéndolas en vídeos animados con movimiento sutil o complejo, ampliando sus portafolios.
- Asistencia en educación y divulgación: crear animaciones explicativas a partir de diagramas o imágenes educativas, facilitando la comprensión de conceptos dinámicos en ciencias o historia.
- Generación de fondos y transiciones para producción audiovisual: los equipos de postproducción pueden generar secuencias de vídeo de relleno o transiciones personalizadas a partir de imágenes de referencia, reduciendo costes de rodaje.
- Investigación en generación de vídeo: servir como modelo base para estudiar arquitecturas MoE en difusión de vídeo, comparar técnicas de control de movimiento o desarrollar nuevas métricas de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que Wan2.2 logra "TOP performance among all open-sourced and closed-sourced models", pero no proporciona métricas numéricas concretas (como FVD, IS o CLIP score) comparables con otros modelos. Se recomienda consultar el repositorio oficial y el technical report para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado que el modelo tiene 14B parámetros activos y los pesos en bf16 ocupan aproximadamente 28 GB, se estima que la inferencia en bf16 requiere al menos 40-48 GB de VRAM (incluyendo overhead de activaciones y VAE). Con cuantización a 8 bits, podría ejecutarse en GPUs con 24 GB, como la RTX 4090.
- GPUs recomendadas: para bf16, se recomiendan GPUs de datacenter como A100 (40/80 GB) o H100 (80 GB). Para cuantización 8-bit, una RTX 4090 (24 GB) es viable, aunque con posibles limitaciones de resolución o longitud de vídeo.
- El modelo puede ejecutarse en GPUs de consumo de gama alta (RTX 3090/4090) con cuantización, pero no en GPUs de gama media (8-12 GB).
- Opciones de despliegue: el repositorio oficial proporciona código de inferencia multi-GPU (para el modelo A14B) y soporte para Diffusers y ComfyUI. También se puede utilizar con herramientas como vLLM o TGI si se adapta el formato, aunque no hay integración oficial.
- Latencia y throughput: no disponibles. La generación de vídeo es computacionalmente intensiva; para 720P@24fps se esperan tiempos de generación de varios minutos incluso en GPUs de alta gama, dependiendo de la duración del clip.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wan2.2-I2V-A14B | 14B activos (MoE) | 480P / 720P @24fps | Apache 2.0 | Abierto (HuggingFace, ModelScope) | MoE, estética cinematográfica, soporte Diffusers |
| Wan2.1-I2V-A14B | 14B activos (MoE) | 480P / 720P | Apache 2.0 | Abierto | Versión anterior, sin las mejoras de datos y MoE de Wan2.2 |
| CogVideoX-5B | 5B | 720P @8fps | Apache 2.0 | Abierto | Modelo denso, menor calidad de movimiento, requiere más VRAM para la misma resolución |
| Open-Sora 2.0 | 11B | 720P | Apache 2.0 | Abierto | Modelo denso, sin MoE, menor control estético |

La comparativa se basa en características públicas; no se dispone de benchmarks numéricos para una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse principalmente con datos en inglés y chino, puede mostrar sesgos culturales o geográficos en los contenidos generados. No se han publicado auditorías de sesgo.
- Riesgo de alucinación: como todo modelo generativo, puede producir movimientos o detalles visuales inconsistentes con la imagen de entrada, especialmente en escenas complejas o con prompts ambiguos.
- Limitaciones de contexto: el modelo solo acepta una imagen como entrada; no soporta múltiples imágenes ni condiciones adicionales como mapas de profundidad o poses.
- Limitaciones de idioma: los prompts en otros idiomas pueden no ser procesados correctamente, reduciendo la calidad de la generación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo puede estar sujeto a patentes de Alibaba; se recomienda revisar los términos legales antes de un despliegue comercial a gran escala.
- Requisitos de hardware: el tamaño del repositorio (126 GB) y la necesidad de GPUs de alta gama limitan su uso en entornos con recursos modestos. La generación de vídeo es lenta y no apta para aplicaciones en tiempo real.
- Para producción, es esencial validar la coherencia temporal y la calidad visual en el caso de uso específico, ya que el modelo puede generar artefactos en movimientos rápidos o transiciones abruptas.

## Enlaces

- [HuggingFace (modelo original Wan-AI)](https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B)
- [HuggingFace (espejo dongjidaoyi)](https://huggingface.co/dongjidaoyi/Wan2.2-I2V-A14B)
- [ModelScope](https://modelscope.cn/models/Wan-AI/Wan2.2-I2V-A14B/summary?version=bf16)
- [GitHub Wan2.2](https://github.com/Wan-Video/Wan2.2)
- [Technical Report (arXiv)](https://arxiv.org/abs/2503.20314)
- [Blog oficial](https://wan.video/welcome?spm=a2ty_o02.30011076.0.0.6c9ee41eCcluqg)
- [Integración Diffusers (I2V-A14B)](https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers)
