# Jinstudio/LLaDA-Image

## Resumen

LLaDA-Image es un modelo unificado de generación y edición de imágenes desarrollado por inclusionAI, distribuido en este repositorio por el usuario Jinstudio. Se trata de una familia de modelos de aproximadamente 6.540 millones de parámetros basada en difusión (con backbone DiT), que cubre tanto la generación texto-a-imagen como la edición de imagen guiada por instrucciones con preservación de referencia, sin necesidad de un backbone de edición separado. La familia incluye una variante Base de 50 pasos y una variante Turbo destilada de 4 pasos.

El modelo resuelve el problema clásico de tener que mantener dos arquitecturas distintas para generar y editar imágenes, unificando ambas tareas en un único checkpoint entrenado bajo un marco de difusión unificado. Además, publica una receta de entrenamiento completamente abierta (image-only pre-training, mid-training y entrenamiento conjunto de generación y edición), lo que es relevante para investigadores que quieran reproducir o extender el pipeline. La model card reporta además puntuaciones SOTA en el benchmark Qwen-Image-Bench.

La relevancia actual viene dada por su licencia Apache-2.0 (permisiva para uso comercial), su soporte de renderizado de texto en inglés y chino, y la disponibilidad de variantes FP8 y Turbo que reducen los requisitos de cómputo para despliegue en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión unificada con backbone DiT (Diffusion Transformer); backbone y DiT son modelos de difusión entrenados en un marco unificado |
| Parametros totales | 6.540.230.016 (≈6,54 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (base), FP8 (variante FP8) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (via diffusers) |

## Arquitectura y entrenamiento

LLaDA-Image es un modelo de difusión unificado en el que tanto el backbone como el DiT son modelos de difusión entrenados conjuntamente bajo un mismo marco. El modelo cubre generación texto-a-imagen, generación condicionada por VQ (VQ-conditioned generation), edición de imagen con referencia e instrucciones, y renderizado de texto en inglés y chino. La variante Base emplea 50 pasos de muestreo, mientras que LLaDA-Image-Turbo es una destilación Twin-DMD que reduce la generación y la edición a solo 2-4 pasos.

En cuanto al entrenamiento, la model card indica que la receta sigue un esquema en tres fases: pre-entrenamiento únicamente con imágenes (image-only pre-training) para establecer el prior visual, una fase de mid-training, y posteriormente la introducción de supervisión de pares lenguaje-imagen junto con entrenamiento conjunto de generación y edición. La receta de entrenamiento se publica de forma abierta. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF/DPO específicas.

## Capacidades

- Generación texto-a-imagen de alta fidelidad, con iluminación natural, detalle realista y composiciones coherentes.
- Edición de imagen guiada por instrucciones, con preservación fiel del contenido de la imagen de referencia y cambios visuales precisos.
- Generación condicionada por VQ (VQ-conditioned generation).
- Edición con imagen de referencia (reference-image editing) sin backbone de edición dedicado.
- Renderizado de texto de alta calidad en inglés y chino, orientado a carteles y pósteres creativos.
- Modelo unificado: un único checkpoint resuelve generación y edición, evitando mantener dos pipelines separados.
- Variante Turbo con inferencia rápida en 2-4 pasos de muestreo mediante destilación Twin-DMD.
- Soporte de pipeline nativo en la librería diffusers mediante `LLaDAImagePipeline`.

No se ha documentado en la información disponible soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión como entrada de comprensión, audio ni modo "thinking".

## Casos de uso

- Generación de imágenes fotorrealistas para marketing y publicidad: el modelo Base de 50 pasos produce imágenes con iluminación natural y detalles realistas, adecuadas para material promocional de alta calidad donde el coste por imagen no es crítico.
- Edición de producto en catálogos de comercio electrónico: dado que soporta edición guiada por instrucciones con preservación de referencia, se puede modificar el fondo o el estilo de una foto de producto manteniendo intacto el objeto principal.
- Generación de carteles y pósteres con texto en inglés y chino: su capacidad específica de renderizado de texto permite crear material gráfico con tipografía legible directamente desde el prompt, sin post-procesado manual.
- Prototipado rápido en diseño gráfico: la variante Turbo, con 2-4 pasos de muestreo, permite iterar bocetos y variaciones de concepto en segundos durante sesiones de ideación.
- Creación de contenido automatizada en pipelines de CI/CD de producto: al integrarse vía diffusers y con licencia Apache-2.0, puede desplegarse como servicio interno que genera imágenes bajo demanda para aplicaciones web o móviles.
- Flujos de trabajo de restauración y retoque asistido: la edición con imagen de referencia permite aplicar cambios localizados (color, textura, elementos añadidos) preservando el resto de la escena.
- Investigación en difusión unificada: al publicarse la receta de entrenamiento completa (pre-entrenamiento con imágenes, mid-training y entrenamiento conjunto), sirve como base para reproducir y extender el pipeline en entornos académicos.
- Localización de material visual para mercados anglófonos y sinófonos: el soporte nativo de en y zh evita depender de modelos separados para cada mercado.

## Benchmarks y rendimiento

| Benchmark | LLaDA-Image (EN) | LLaDA-Image (ZH) |
|---|---|---|
| Qwen-Image-Bench (overall) | 53,53 | 53,38 |

La model card indica que estas puntuaciones corresponden a resultados SOTA en Qwen-Image-Bench. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros orientados a imagen como GenEval, DPG-Bench o similares).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13-14 GB solo para los pesos en BF16 (6,54 B × 2 bytes), más el VAE y cualquier encoder de texto asociado, lo que sitúa el total estimado en el rango de 15-18 GB en BF16.
- Variante FP8: aproximadamente 7-8 GB para los pesos, con un total estimado en el rango de 9-12 GB incluyendo componentes auxiliares.
- GPU recomendadas: NVIDIA A100 (40/80 GB) o H100 para despliegue en BF16 con margen amplio y lotes grandes; RTX 4090 (24 GB) para BF16 o FP8 en single-GPU.
- Compatibilidad con GPU de consumo: FP8 debería caber en RTX 4090 (24 GB), RTX 4080 (16 GB) y posiblemente RTX 3090 (24 GB); en BF16 cabe con holgura en 4090 y A100, y de forma ajustada en GPUs de 16 GB.
- Opciones de despliegue: la librería oficial es diffusers, con la clase `LLaDAImagePipeline`. También existen variantes publicadas en Hugging Face y ModelScope para los formatos BF16 y FP8.
- Latencia y throughput: no disponibles en la información proporcionada. La variante Turbo reduce el número de pasos de muestreo a 2-4, frente a los 50 pasos de la variante Base, lo que implica una reducción proporcional del tiempo de inferencia por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LLaDA-Image | 6,54 B | no disponible | Apache-2.0 | Hugging Face + ModelScope (BF16, FP8, Turbo) | Unificado generación + edición; SOTA reportado en Qwen-Image-Bench (53,53 EN / 53,38 ZH) |
| Qwen-Image | no disponible | no disponible | no disponible | no disponible | Referenciado en el benchmark de la model card como referencia de evaluación |
| FLUX.1-dev | no disponible en esta busqueda | no disponible | no disponible | no disponible | Alternativa conocida del mismo segmento (generación texto-a-imagen de alta calidad) |
| Stable Diffusion 3.5 | no disponible en esta busqueda | no disponible | no disponible | no disponible | Alternativa conocida del mismo segmento |

Los datos de los modelos comparativos no estaban incluidos en la información proporcionada, por lo que se marcan como no disponibles. La única comparación cuantitativa explícita en la documentación es la puntuación de Qwen-Image-Bench reportada para LLaDA-Image.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. Al ser un modelo entrenado principalmente con datos de imagen y pares texto-imagen sin detallar composición, se recomienda auditar sesgos de representación antes de usos sensibles.
- Riesgo de alucinación visual: no se documenta explícitamente, pero es inherente a los modelos generativos de difusión, especialmente en renderizado de texto y en escenas con muchos objetos o relaciones espaciales complejas.
- Limitaciones de idioma: la model card solo declara soporte para inglés (en) y chino (zh). No se garantiza calidad de renderizado de texto ni de comprensión de prompts en otros idiomas.
- Restricciones de licencia: la licencia es Apache-2.0, que permite uso comercial y modificación, pero conviene verificar los términos del repositorio original de inclusionAI y de los datasets subyacentes no detallados.
- Discrepancia de autoría: este repositorio (Jinstudio/LLaDA-Image) tiene 0 descargas y 0 likes y su model card apunta a checkpoints oficiales bajo el namespace `inclusionAI` en Hugging Face y ModelScope. Antes de usar los pesos de este repositorio en producción, conviene validar que son idénticos a los oficiales, ya que se trata de una redistribución.
- Contexto: no se especifica la longitud de contexto del encoder de texto ni la resolución nativa de entrenamiento, lo que limita la planificación de memoria y calidad para resoluciones y prompts extremadamente largos.
- Para la variante Turbo (Twin-DMD), la reducción a 2-4 pasos puede implicar una pérdida de fidelidad frente a los 50 pasos del modelo Base en escenas complejas.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/Jinstudio/LLaDA-Image
- GitHub oficial: https://github.com/inclusionAI/LLaDA-Image
- Informe arXiv: https://arxiv.org/pdf/2609.03796
- Checkpoint Base (BF16) oficial: https://huggingface.co/inclusionAI/LLaDA-Image
- Checkpoint Base FP8 oficial: https://huggingface.co/inclusionAI/LLaDA-Image-FP8
- Checkpoint Turbo oficial: https://huggingface.co/inclusionAI/LLaDA-Image-Turbo
- Checkpoint Turbo FP8 oficial: https://huggingface.co/inclusionAI/LLaDA-Image-Turbo-FP8
- ModelScope Base: https://modelscope.cn/models/inclusionAI/LLaDA-Image
- ModelScope Base FP8: https://modelscope.cn/models/inclusionAI/LLaDA-Image-FP8
- ModelScope Turbo: https://modelscope.cn/models/inclusionAI/LLaDA-Image-Turbo
- ModelScope Turbo FP8: https://modelscope.cn/models/inclusionAI/LLaDA-Image-Turbo-FP8
