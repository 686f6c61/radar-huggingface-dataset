# ChenDY/NitroFusion2

## Resumen

NitroFusion2 es un modelo de generación de imágenes texto-a-imagen de 1 a 2 pasos desarrollado por Dar-Yen Chen y Yi-Zhe Song, construido sobre Z-Image-Turbo de Tongyi-MAI. Su innovación principal consiste en trasladar la pérdida adversaria al flujo de texto (text stream) de un transformer de difusión multimodal (MMDiT), en lugar de aplicarla únicamente sobre las características de imagen. Esto permite obtener imágenes nítidas con texto renderizado y detalle fino en un solo paso de inferencia.

El modelo cuenta con aproximadamente 6.150 millones de parámetros en formato safetensors y se distribuye bajo licencia Apache 2.0, con pesos en safetensors y cuantizaciones GGUF. Está pensado para integrarse en flujos de trabajo de ComfyUI y en pipelines de diffusers, y su relevancia actual radica en la reducción drástica del coste de inferencia en generación de imágenes de alta calidad, un aspecto crítico para despliegues en producción.

La ficha se basa exclusivamente en la información disponible en HuggingFace y en la model card del autor; los detalles de entrenamiento y los resultados de benchmarks no están publicados todavía (el paper está anunciado como "coming soon").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT (multimodal diffusion transformer) sobre Z-Image-Turbo; destilación adversaria en el text stream |
| Parametros totales | 6.154.908.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | GGUF desde Q2_K_4XS (2,0 GB) hasta Q8_0 (7,2 GB); pesos completos en bfloat16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

NitroFusion2 parte de Z-Image-Turbo, un transformer de difusión multimodal (MMDiT) en el que los tokens de texto y de imagen comparten las mismas capas de atención. La aportación del modelo es aplicar una pérdida adversaria sobre el resumen que los tokens de texto han construido tras leer la imagen, en paralelo a la pérdida adversaria convencional sobre las características de imagen. Dado que ese resumen permanece ligado a la condición textual, un mismo discriminador congelado puede orientarse hacia distintos aspectos (tipografía, objetos, estilo) simplemente cambiando la "cue" o señal de condicionamiento, sin coste adicional de parámetros.

El modelo se entrena mediante destilación adversaria para reducir el número de pasos de muestreo a uno o dos, manteniendo nitidez en texto renderizado y detalle fino. Se complementa con una LoRA de "de-destilación" (`nf2-dedistill-lora.safetensors`) que aproxima el modelo de vuelta a Z-Image-Turbo y que, aplicada a escala 0.5 en el primer paso de un flujo de dos pasos, elimina parte de los artefactos. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de imágenes texto-a-imagen en 1 o 2 pasos de inferencia.
- Renderizado de texto legible dentro de la imagen (tipografía) gracias a la pérdida adversaria en el text stream.
- Detalle fino y nitidez en un solo paso, con soporte de 2 pasos para mayor calidad.
- Control mediante prompts en inglés; el modelo declara únicamente el idioma `en`.
- Integración con ComfyUI mediante flujos de trabajo predefinidos (1 paso y 2 pasos, en versión completa y GGUF).
- Integración con la librería diffusers (`ZImagePipeline` + `ZImageTransformer2DModel`).
- Soporte de cuantización GGUF para ejecución en hardware limitado.
- No se documentan capacidades de tool calling, agentes, visión de entrada ni audio (es un modelo de generación de imagen, no multimodal de entrada).

## Casos de uso

- Generación rápida de imágenes en producción: con 1 o 2 pasos de inferencia, el modelo reduce el coste computacional por imagen, lo que lo hace adecuado para APIs de generación de imágenes con requisitos de latencia baja.
- Creación de carteles y material gráfico con texto: la pérdida adversaria en el text stream mejora el renderizado de tipografía, útil para banners, portadas y mockups que incluyen texto legible.
- Prototipado en ComfyUI: los flujos de trabajo incluidos (1 paso y 2 pasos, con y sin GGUF) permiten a diseñadores iterar rápidamente sin escribir código.
- Despliegue en hardware de consumo: las cuantizaciones GGUF desde 2,0 GB (Q2_K_4XS) hasta 7,2 GB (Q8_0) permiten ejecutar el modelo en GPUs con VRAM limitada.
- Generación de imágenes por lotes para datasets sintéticos: el bajo número de pasos y la posibilidad de usar bfloat16 o GGUF facilitan la generación masiva de imágenes de entrenamiento o evaluación.
- Integración en pipelines de Python con diffusers: el snippet de la model card muestra cómo cargar el transformer, aplicar la LoRA de de-destilación y controlar su escala por paso mediante `callback_on_step_end`, lo que permite ajustar el equilibrio entre calidad y artefactos.
- Exploración de investigación en destilación adversaria: el enfoque de aplicar la pérdida adversaria al text stream de un MMDiT es reutilizable para otros modelos de difusión multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los pesos completos en bfloat16 (6.150 millones de parámetros) ocupan aproximadamente 12,3 GB, por lo que se necesita una GPU con al menos 16 GB de VRAM para cargar el transformer en bfloat16 sin offload; con `enable_model_cpu_offload()` el requisito de VRAM se reduce a costa de latencia.
- Cuantizaciones GGUF: desde 2,0 GB (Q2_K_4XS) hasta 7,2 GB (Q8_0), lo que permite ejecución en GPUs de consumo con 4-8 GB de VRAM según el nivel de cuantización.
- GPUs recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o A100/H100 permiten ejecutar el modelo completo en bfloat16; GPUs consumer de gama media pueden usar GGUF.
- Cabe en GPU consumer: sí, mediante cuantización GGUF; en bfloat16 completo requiere una GPU de gama alta con al menos 16 GB.
- Opciones de despliegue: diffusers (`ZImagePipeline`), ComfyUI (flujos de trabajo incluidos), GGUF (flujos específicos para 1 y 2 pasos).
- Latencia y throughput: no disponibles. El modelo está diseñado para 1-2 pasos, lo que reduce el coste frente a modelos de difusión de 20-50 pasos, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de inferencia | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NitroFusion2 | 6.150 M | 1-2 | prompt de texto (en) | apache-2.0 | HuggingFace, GGUF, ComfyUI, diffusers |
| Z-Image-Turbo (modelo base) | no disponible en la informacion | no disponible | prompt de texto | no disponible en la informacion | HuggingFace (Tongyi-MAI) |
| NitroFusion (predecesor, CVPR 2025) | no disponible en la informacion | 1 (single-step) | prompt de texto | no disponible en la informacion | GitHub, CVPR 2025 |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés (`en`); el rendimiento con prompts en otros idiomas no está documentado.
- En modo de 2 pasos pueden aparecer artefactos; el autor recomienda aplicar la LoRA de de-destilación a escala 0.5 en el primer paso para mitigarlos.
- En 1 paso, la calidad puede ser inferior a la de modelos de difusión con muchos más pasos en escenarios complejos, aunque el autor destaca nitidez en texto y detalle fino.
- No se han publicado detalles sobre sesgos del dataset de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinación visual (elementos no solicitados en el prompt) inherente a los modelos generativos; no cuantificado.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Z-Image-Turbo, cuya licencia no se detalla en la información disponible.
- El paper está anunciado como "coming soon"; no hay resultados de benchmarks ni comparativas oficiales.
- El repositorio tiene 138,4 GB de tamaño y muy pocas descargas (50) y likes (0) en el momento de la consulta, lo que indica baja validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/ChenDY/NitroFusion2
- GitHub: https://github.com/ChenDarYen/NitroFusion2
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/ChenDY/NitroFusion2
- Project page: https://chendaryen.github.io/NitroFusion2.github.io/
- Modelo base Z-Image-Turbo: https://github.com/Tongyi-MAI/Z-Image
- Repositorio GGUF: https://huggingface.co/ChenDY/NitroFusion2/tree/main
