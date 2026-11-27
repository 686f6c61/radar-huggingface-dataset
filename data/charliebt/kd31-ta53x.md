# CharlieBT/kd31-ta53x

## Resumen

CharlieBT/kd31-ta53x es un modelo de 31.273.088.876 parámetros (aproximadamente 31,3 mil millones) publicado en Hugging Face bajo licencia Apache 2.0 y acceso restringido (gated). Según sus etiquetas, deriva de una fusión de dos modelos base: danyloooah/reax-g2-soup2 y whynotBeTop/gemma4-31b-choice-ft, ambos vinculados a la familia Gemma 4. El modelo se distribuye en formato safetensors y es compatible con la librería transformers.

Aunque la arquitectura subyacente pertenece a la familia Gemma 4 (image-text-to-text), la pipeline declarada en la model card es text-classification, lo que sugiere que el autor ha reutilizado o reconfigurado la cabeza del modelo para una tarea de clasificación de texto. No se dispone de información pública sobre el conjunto de datos de ajuste, el proceso de entrenamiento ni los resultados de evaluación.

El modelo es relevante por su tamaño (31B) y su origen en una fusión de modelos Gemma 4, una práctica habitual para combinar capacidades de distintos fine-tunes. Sin embargo, la ausencia de documentación técnica, benchmarks y la restricción de acceso limitan su evaluación rigurosa. Las descargas y likes son cero en el momento de la consulta, lo que indica una publicación muy reciente o de baja difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 4 (según tags: gemma4, image-text-to-text) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se confirma safetensors como formato de pesos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarada | text-classification |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 62,6 GB |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura Gemma 4, etiquetada como image-text-to-text, lo que implica un transformer multimodal con capacidad de procesar imágenes y texto. No obstante, la pipeline declarada es text-classification, lo que podría indicar que se ha añadido o sustituido la cabeza de salida para una tarea de clasificación, o que la model card está mal configurada. No se dispone de detalles sobre el número de capas, dimensiones ocultas, mecanismos de atención ni estrategias de decodificación.

El modelo deriva de una fusión (merge) de dos modelos base: danyloooah/reax-g2-soup2 y whynotBeTop/gemma4-31b-choice-ft. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Gemma 4, se espera capacidad de generación de texto y razonamiento, aunque no está documentado explícitamente.
- Procesamiento multimodal: la etiqueta image-text-to-text sugiere capacidad para tareas de visión-lenguaje, pero no se confirma en la documentación.
- Clasificación de texto: la pipeline declarada es text-classification, por lo que el modelo podría estar ajustado para tareas de clasificación (sentimiento, tópicos, etc.), aunque no se especifica.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están listados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de documentos: si el modelo está efectivamente ajustado para text-classification, podría emplearse para categorizar tickets de soporte, correos o artículos, aunque se desconoce su rendimiento real.
- Análisis de sentimiento a escala: con 31B parámetros, podría procesar grandes volúmenes de texto para extraer polaridad, pero requiere validación previa.
- Moderación de contenido: clasificación de textos potencialmente tóxicos o spam, siempre que se confirme la tarea y se evalúe su precisión.
- Investigación en fusión de modelos: el modelo sirve como caso de estudio para analizar el efecto de merges entre fine-tunes de Gemma 4 en tareas de clasificación.
- Prototipado de pipelines multimodales: si la capacidad image-text-to-text se mantiene, podría usarse para experimentos de clasificación de imágenes con texto asociado, aunque no está documentado.
- Evaluación comparativa de modelos base: útil para investigadores que quieran comparar el comportamiento de fusiones de Gemma 4 frente a los modelos originales en tareas de clasificación.
- Generación de texto aumentada (si la cabeza de clasificación no invalida la generación): podría emplearse en tareas de resumen o respuesta a preguntas, pero sin garantías al no haber benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 62,6 GB (coincide con el tamaño del repo), por lo que se necesitan GPUs con al menos 80 GB (A100 80GB, H100 80GB) para cargar el modelo completo sin cuantización.
- Cuantización a 8 bits: reduciría el requisito a ~31 GB, permitiendo su uso en GPUs como A100 40GB o RTX 6000 Ada (48GB).
- Cuantización a 4 bits: ~16 GB, podría caber en RTX 4090 (24GB) o RTX 3090 (24GB), aunque no se confirman formatos GGUF disponibles.
- GPU recomendadas: A100 80GB, H100 80GB para FP16; A100 40GB o RTX 6000 Ada para 8 bits; RTX 4090/3090 para 4 bits (si se generan cuantizaciones).
- Opciones de despliegue: transformers (safetensors) es el formato confirmado; no se dispone de versiones GGUF, Ollama o vLLM oficiales, aunque podría convertirse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| CharlieBT/kd31-ta53x | 31,3B | no disponible | Apache 2.0 | Restringido (gated) | Fusión de Gemma 4, pipeline text-classification |
| Gemma 4 31B (referencia) | ~31B | no disponible | Gemma license (no Apache) | Público | Modelo base original de Google, multimodal |
| danyloooah/reax-g2-soup2 | no disponible | no disponible | no disponible | no disponible | Modelo base de la fusión |
| whynotBeTop/gemma4-31b-choice-ft | no disponible | no disponible | no disponible | no disponible | Modelo base de la fusión |

No se dispone de datos de rendimiento para comparar. La comparativa se limita a parámetros y licencia.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre datos de entrenamiento, evaluación o uso previsto, lo que impide validar su calidad.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en producción o investigación.
- Posible desajuste entre pipeline declarada (text-classification) y arquitectura multimodal (image-text-to-text), lo que puede provocar errores al cargar el modelo con transformers.
- Riesgo de alucinación y sesgos: al no haber evaluación, se desconocen los sesgos y la fiabilidad de las salidas.
- Licencia Apache 2.0 permite uso comercial, pero al ser una fusión de modelos Gemma 4, podrían aplicarse restricciones adicionales de la licencia original de Gemma (no confirmado).
- Sin garantías de soporte: cero descargas y likes, sin comunidad ni mantenimiento visible.
- Idiomas no especificados: no se puede asegurar un rendimiento multilingüe.
- Tamaño elevado: 62,6 GB en safetensors dificulta su despliegue en entornos con recursos limitados.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-ta53x
- Modelo base 1: https://huggingface.co/danyloooah/reax-g2-soup2
- Modelo base 2: https://huggingface.co/whynotBeTop/gemma4-31b-choice-ft
