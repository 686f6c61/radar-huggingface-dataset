# airagrp/Qwen3.8-27B-mlx-nvfp4-L

## Resumen

El repositorio `airagrp/Qwen3.8-27B-mlx-nvfp4-L` contiene una conversión del modelo multimodal Qwen3.8-27B de Alibaba al formato MLX, con una receta de cuantización mixta de alta eficiencia. El modelo original, desarrollado por el equipo Qwen de Alibaba, es un modelo denso de 27.000 millones de parámetros diseñado para tareas de visión, video y texto, con especial énfasis en codificación, flujos de trabajo agénticos y automatización de oficina. Esta conversión, realizada por el usuario `airagrp`, aplica cuantización nvfp4 de 4 bits en las capas MLP y mxfp8 de 8 bits en las capas de atención, logrando un tamaño efectivo de aproximadamente 24 GB frente a los 54 GB del modelo original en bfloat16.

La relevancia de este repositorio radica en que permite ejecutar un modelo multimodal de 27B en hardware de consumo, especialmente en equipos Apple Silicon mediante MLX, sin sacrificar en exceso la calidad. Además, incluye el head MTP (Multi-Token Prediction) fusionado, lo que habilita decodificación especulativa para acelerar la inferencia. Es una opción interesante para desarrolladores que necesitan un modelo local con capacidades multimodales y un footprint de memoria reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso con atención híbrida (atención estándar y lineal GDN) |
| Parametros totales | 27B (nominal, según el nombre del modelo; el archivo safetensors contiene 9.770.065.648 parámetros, posiblemente debido a la cuantización) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: nvfp4 (4 bits, group_size=16) en MLP, mxfp8 (8 bits, group_size=32) en atención, bfloat16 en embeddings, output head, MTP head y vision tower |
| Idiomas soportados | Inglés (declarado en el campo `language`; el modelo base puede soportar más idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal denso desarrollado por Alibaba, que integra un codificador de visión (vision tower) y un decodificador de lenguaje. Según la receta de cuantización, el modelo combina atención estándar en 16 capas y atención lineal GDN en 48 capas, lo que sugiere una arquitectura híbrida diseñada para reducir el coste computacional en contextos largos. La conversión MLX aplica cuantización mixta: las proyecciones MLP (gate, up, down) se cuantizan a nvfp4 con grupo de 16, mientras que las proyecciones de atención (q, k, v, o) y las capas lineales de atención GDN se cuantizan a mxfp8 con grupo de 32. Los embeddings, el head de salida, el head MTP y el vision tower se mantienen en bfloat16.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la información proporcionada. El head MTP está fusionado en el checkpoint como tensores `language_model.mtp.*`, lo que permite decodificación especulativa sin necesidad de un modelo drafter separado.

## Capacidades

- Generación de texto y conversación multimodal (imagen-texto a texto).
- Comprensión de imágenes y video (según los tags `vision` y `video`).
- Soporte de decodificación especulativa mediante el head MTP integrado (compatible con `--draft-kind mtp` en mlx-vlm).
- Según el repositorio oficial del modelo base, destaca en tareas de codificación, flujos de trabajo agénticos y automatización de oficina.
- Capacidad de procesamiento de entrada multimodal (imagen y texto) para generar respuestas textuales.
- Compatible con el ecosistema MLX y mlx-vlm para inferencia local en Apple Silicon.

## Casos de uso

- Análisis de documentos con imágenes: el modelo puede extraer información de capturas de pantalla, diagramas o formularios escaneados, generando resúmenes o respuestas estructuradas. Su cuantización permite ejecutarlo en una estación de trabajo con 24 GB de memoria.
- Asistente de codificación con contexto visual: al recibir capturas de pantalla de errores o diagramas de arquitectura, el modelo puede sugerir correcciones o explicar el código, aprovechando su entrenamiento en tareas de programación.
- Automatización de oficina: procesamiento de correos electrónicos con adjuntos visuales, generación de actas a partir de imágenes de pizarras o extracción de datos de facturas, gracias a su capacidad multimodal y su licencia Apache-2.0 que permite uso comercial.
- Agente conversacional local con memoria visual: desplegado en un Mac con Apple Silicon, puede mantener conversaciones multi-turno sobre imágenes, útil para soporte técnico o tutorías.
- Generación de descripciones de productos: a partir de fotografías, el modelo produce textos descriptivos para catálogos o tiendas online, con la ventaja de ejecutarse sin conexión.
- Resumen de contenido de video: aunque no se detalla el procesamiento de video, los tags indican soporte; podría usarse para generar resúmenes de vídeos cortos o extraer información clave de secuencias de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión cuantizada en la información disponible. El modelo base Qwen3.8-27B tiene benchmarks publicados en su model card oficial (por ejemplo, MathVision), pero no se han incluido los valores concretos en los datos proporcionados. Se recomienda consultar la model card del modelo original para evaluar el rendimiento de referencia.

## Requisitos de hardware

- VRAM estimada: aproximadamente 24 GB para la carga completa del modelo cuantizado en memoria (el tamaño efectivo es ~24 GB según la model card). Para inferencia con contexto largo, se recomienda al menos 32 GB de memoria unificada o VRAM.
- GPU recomendadas: en Apple Silicon, cualquier Mac con 32 GB o más de RAM unificada (M1 Pro/Max/Ultra, M2/M3/M4) puede ejecutar el modelo mediante MLX. En GPUs NVIDIA, se necesita una tarjeta con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A6000, A100, etc.).
- Opciones de despliegue: mlx-vlm (recomendado), MLX directo, o conversión a otros formatos (GGUF, etc.) si se desea usar llama.cpp o vLLM, aunque no se proporcionan instrucciones para ello.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP puede mejorar la velocidad de generación, pero no se especifican cifras.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de comparación con otros modelos en la información proporcionada. Cualitativamente, el modelo base Qwen3.8-27B compite con otros modelos multimodales de ~27B como Qwen2.5-VL-27B (si existe) o Llama-3.2-11B-Vision, pero no se pueden establecer comparaciones numéricas sin benchmarks. Esta conversión MLX destaca por su cuantización mixta agresiva y su integración con el ecosistema Apple, lo que la hace adecuada para despliegues en hardware de consumo.

## Limitaciones y advertencias

- La cuantización mixta (nvfp4 y mxfp8) puede introducir una pérdida de precisión en comparación con el modelo original en bfloat16, especialmente en tareas que requieren razonamiento numérico fino.
- El campo `language` declara únicamente inglés; aunque el modelo base pueda soportar otros idiomas, esta conversión no garantiza un rendimiento multilingüe óptimo.
- El repositorio es una conversión de terceros (usuario `airagrp`) y no está afiliado oficialmente a Alibaba. La calidad y el mantenimiento dependen del autor.
- No se proporcionan benchmarks específicos para esta versión cuantizada, por lo que el rendimiento real en tareas concretas debe validarse de forma independiente.
- El tamaño del repositorio (23.6 GB) requiere una conexión de descarga considerable y espacio en disco.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base también cumpla con dicha licencia (así es según la información).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/airagrp/Qwen3.8-27B-mlx-nvfp4-L
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog sobre ejecución local de Qwen 3.8 27B: https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
