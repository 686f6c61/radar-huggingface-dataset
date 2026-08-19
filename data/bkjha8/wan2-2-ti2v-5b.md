# bkjha8/Wan2.2-TI2V-5B

## Resumen

Wan2.2-TI2V-5B es un modelo de generación de vídeo de la familia Wan2.2, desarrollado por el equipo Wan (Alibaba). Se trata de un modelo de 5 mil millones de parámetros que combina generación de texto a vídeo (T2V) e imagen a vídeo (I2V) en una única arquitectura, utilizando un VAE de alta compresión (16×16×4) que permite generar vídeo a resolución 720P y 24 fotogramas por segundo. El modelo está diseñado para ejecutarse en una única GPU de consumo, como una RTX 4090, lo que lo convierte en una opción accesible tanto para la industria como para la investigación académica.

La arquitectura incorpora una mezcla de expertos (MoE) que separa el proceso de denoising en diferentes pasos temporales con modelos expertos especializados, aumentando la capacidad total sin incrementar el coste computacional. Además, se entrenó con datos estéticos cuidadosamente seleccionados y etiquetados con detalles sobre iluminación, composición, contraste y tono de color, lo que permite un control más preciso del estilo cinematográfico. El modelo se distribuye bajo licencia Apache 2.0 y soporta los idiomas inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer con mezcla de expertos (MoE) + VAE de alta compresión |
| Parametros totales | 5 mil millones (5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Wan2.2-TI2V-5B utiliza una arquitectura de difusión basada en transformer con una mezcla de expertos (MoE). La innovación principal es que el proceso de denoising se divide a lo largo de los pasos temporales, asignando expertos especializados a diferentes etapas, lo que amplía la capacidad del modelo sin aumentar el coste computacional durante la inferencia. El modelo incorpora un VAE propio (Wan2.2-VAE) con una relación de compresión de 16×16×4, que reduce significativamente la carga computacional y permite generar vídeo a 720P con 24 fps en hardware de consumo.

El entrenamiento se realizó con un conjunto de datos significativamente mayor que su predecesor Wan2.1, con un aumento del 65,6% en imágenes y del 83,2% en vídeos. Además, se incluyeron datos estéticos curados con etiquetas detalladas sobre iluminación, composición, contraste y tono de color, lo que mejora la calidad cinematográfica y permite un control más fino del estilo. No se mencionan técnicas específicas como RLHF o DPO en la información disponible.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) a 720P y 24 fps.
- Generación de vídeo a partir de imagen (image-to-video) a 720P y 24 fps.
- Soporte para estilo cinematográfico con control sobre iluminación, composición, contraste y tono de color.
- Generación de movimiento complejo con mayor generalización semántica y estética gracias al entrenamiento con datos ampliados.
- Capacidades multilingües en inglés y chino.
- Ejecución en una única GPU de consumo (por ejemplo, RTX 4090).

## Casos de uso

- Producción de vídeo para marketing y publicidad: el modelo permite generar clips de alta resolución (720P) con estilo cinematográfico a partir de descripciones textuales o imágenes de referencia, acelerando la creación de anuncios y contenido promocional.
- Prototipado rápido de escenas para cine y animación: los creadores pueden generar vídeos de prueba de 24 fps para visualizar composiciones, iluminación y movimientos antes de la producción final.
- Generación de contenido educativo y divulgativo: creación de vídeos explicativos animados a partir de guiones o imágenes, sin necesidad de equipos de grabación.
- Asistencia en diseño de producto y arquitectura: generar vídeos de recorrido o animaciones de conceptos a partir de renders o bocetos, facilitando la presentación a clientes.
- Automatización de contenido para redes sociales: producir clips cortos de alta calidad con estética consistente a partir de textos o imágenes, reduciendo el tiempo de edición manual.
- Investigación en visión por computador y generación de vídeo: el modelo sirve como base para experimentos académicos sobre generación condicionada, control estético y eficiencia computacional en modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma que Wan2.2 alcanza el mejor rendimiento entre modelos de código abierto y cerrado, pero no proporciona métricas numéricas concretas (como FVD, CLIP score, etc.) en el texto facilitado.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada, pero el modelo se describe como ejecutable en una GPU de consumo como la RTX 4090 (típicamente 24 GB de VRAM). Se recomienda verificar los requisitos exactos en la documentación oficial.
- GPU recomendadas: RTX 4090 como mínimo para una GPU única; para modelos de mayor tamaño (A14B) se requiere multi-GPU.
- Compatibilidad con GPU de consumo: sí, el modelo TI2V-5B está diseñado para ello.
- Opciones de despliegue: el repositorio oficial de Wan2.2 proporciona código de inferencia, integración con ComfyUI y Diffusers. También se puede usar con huggingface-cli para descargar los pesos.
- Latencia y throughput: no disponible; se indica que es uno de los modelos 720P@24fps más rápidos, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados en la información proporcionada. La model card menciona una mejora sobre Wan2.1 en términos de datos de entrenamiento y rendimiento, pero no se ofrecen métricas numéricas. Se recomienda consultar el paper técnico (arxiv:2503.20314) para una comparación formal.

## Limitaciones y advertencias

- La información sobre el modelo es limitada; no se especifican sesgos conocidos, aunque al entrenarse con datos predominantemente en inglés y chino, puede haber sesgos culturales o lingüísticos en esos idiomas.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir vídeos con inconsistencias físicas o semánticas, especialmente en escenas complejas.
- Limitaciones de contexto: no se especifica la longitud de contexto de texto, pero es probable que sea limitada para prompts muy largos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución y las leyes locales sobre contenido generado.
- Para producción, se recomienda validar la calidad del vídeo y considerar la posibilidad de generar contenido inapropiado o con derechos de autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bkjha8/Wan2.2-TI2V-5B
- Modelo oficial de Wan-AI: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Repositorio GitHub de Wan2.2: https://github.com/Wan-Video/Wan2.2
- Página oficial de Wan: https://wan.video
- Paper técnico: https://arxiv.org/abs/2503.20314
- ModelScope (modelo oficial): https://modelscope.cn/models/Wan-AI/Wan2.2-TI2V-5B
