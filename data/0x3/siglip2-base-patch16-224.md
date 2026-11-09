# 0x3/siglip2-base-patch16-224

## Resumen

SigLIP 2 Base (patch16-224) es un codificador visión-lenguaje desarrollado por Google (el repositorio de Hugging Face está publicado por el usuario 0x3, que redistribuye los pesos originales de `google/siglip2-base-patch16-224`). Se trata de la evolución del objetivo de preentrenamiento SigLIP, que unifica en una única receta técnicas desarrolladas previamente de forma independiente para mejorar la comprensión semántica, la localización y la calidad de las características densas. El modelo resuelve tareas de clasificación de imágenes zero-shot, recuperación imagen-texto y sirve como codificador visual para modelos visión-lenguaje (VLM).

La arquitectura es un par de torres transformer (una visual y otra textual) entrenadas con una variante de la pérdida sigmoidea de contraste, con parches de 16x16 píxeles y resolución de entrada de 224x224. Cuenta con 375.187.970 parámetros totales según los pesos en safetensors, y el repositorio ocupa 1,5 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Es relevante ahora porque SigLIP 2 incorpora mejoras sustanciales frente a SigLIP original en tareas densas (segmentación, detección) y multilingüismo, y porque su formato base lo hace desplegable en hardware modesto, tanto para clasificación directa como para integrarse como torre visual en pipelines de VLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos torres (vision + texto), parches 16x16, resolucion 224x224 |
| Parametros totales | 375.187.970 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision-lenguaje, no generativo de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar via transformers/bitsandbytes, no documentada por el autor) |
| Idiomas soportados | no disponible (el paper describe capacidades multilingues, pero la model card no enumera idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SigLIP 2 es un codificador visión-lenguaje de dos torres basado en transformer. Sobre el objetivo de contraste sigmoideo de SigLIP, añade tres componentes de entrenamiento: una pérdida de decodificador, una pérdida de predicción global-local y enmascarada, y adaptabilidad de relación de aspecto y resolución. Estas técnicas estaban dispersas en la literatura previa y aquí se unifican en una sola receta de preentrenamiento.

El modelo se preentrenó sobre el dataset WebLI (Chen et al., 2023) y se entrenó en hasta 2048 chips TPU-v5e. La model card no especifica el número de tokens de entrenamiento ni la composición detallada del dataset más allá de la referencia a WebLI. No se documenta en la información disponible el uso de RLHF o DPO, algo esperable en un codificador y no en un modelo generativo.

## Capacidades

- Clasificación de imágenes zero-shot mediante etiquetas candidatas en lenguaje natural.
- Recuperación imagen-texto (image-text retrieval) gracias al espacio de embeddings compartido entre ambas torres.
- Extracción de características visuales densas mediante `get_image_features`, útil para tareas de localización y segmentación.
- Codificador visual para modelos visión-lenguaje (VLM) y otras tareas de visión.
- Capacidades multilingües según el paper de SigLIP 2 (la model card no detalla los idiomas concretos).
- No es un modelo generativo: no produce texto libre ni soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes entrantes contra un conjunto de etiquetas de política (por ejemplo, "contenido violento", "desnudo", "texto ofensivo") sin entrenamiento adicional, aprovechando la clasificación zero-shot.
- Búsqueda visual en catálogos de producto: indexar los embeddings de imagen y texto y recuperar productos por consulta en lenguaje natural, usando la torre textual y visual del modelo.
- Etiquetado automático de datasets de imagen: preanotar grandes volúmenes de imágenes con etiquetas candidatas definidas por el equipo, reduciendo el coste de anotación manual antes de una revisión humana.
- Filtrado y deduplicación de datasets multimodales: calcular embeddings de imagen y detectar duplicados o imágenes de baja calidad mediante similitud en el espacio latente.
- Codificador visual en pipelines de VLM: sustituir o inicializar la torre visual de un modelo visión-lenguaje propio, congelando el codificador y entrenando solo el proyector y el LLM.
- Clasificación de imágenes médicas o industriales con pocas etiquetas: definir categorías descriptivas y usar el modelo como clasificador zero-shot en dominios donde no hay suficientes datos etiquetados.
- Análisis de imágenes satelitales o de control de calidad: clasificación por categorías visuales definidas textualmente, con adaptabilidad de resolución del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una tabla de evaluación del paper de SigLIP 2 (imagen alojada en Hugging Face), pero no incluye cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,5 GB para los pesos (375 M de parámetros) más overhead de activaciones; en fp16/bf16, en torno a 0,8 GB de pesos.
- Cabe en GPU consumer: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) puede ejecutar inferencia en fp16.
- GPU recomendadas para producción: NVIDIA T4, L4, A10G, A100 o H100 para lotes grandes y alto throughput; RTX 4090 para prototipado y despliegue local.
- Opciones de despliegue: transformers (pipeline `zero-shot-image-classification`), y potencialmente vLLM o TGI solo si se integra como torre visual; llama.cpp/Ollama no aplican al no ser un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| SigLIP 2 Base patch16-224 (este) | 375 M | 224x224, parches 16 | Apache 2.0 | Hugging Face |
| SigLIP original Base patch16-224 | no disponible en esta informacion | 224x224, parches 16 | Apache 2.0 | Hugging Face |
| CLIP ViT-B/16 | no disponible en esta informacion | 224x224, parches 16 | MIT (variante OpenAI) | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias cuantitativas entre estos modelos.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto, razonar ni ejecutar agentes; su uso está acotado a representaciones y clasificación.
- Riesgo de sesgo heredado del dataset WebLI, que puede reflejar desequilibrios de género, raza o cultura en las representaciones aprendidas.
- La clasificación zero-shot depende críticamente de la formulación de las etiquetas candidatas; etiquetas ambiguas o mal redactadas degradan el rendimiento.
- La model card no documenta los idiomas soportados de forma explícita, aunque el paper describe capacidades multilingües; conviene validar el rendimiento en el idioma objetivo antes de producción.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la procedencia de los pesos redistribuidos por el usuario 0x3 frente al repositorio oficial de Google.
- Sin datos publicados de latencia ni throughput en esta información; es necesario medirlos en el hardware objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/0x3/siglip2-base-patch16-224
- Repositorio oficial de Google: https://huggingface.co/google/siglip2-base-patch16-224
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Paper SigLIP: https://arxiv.org/abs/2303.15343
- Paper WebLI: https://arxiv.org/abs/2209.06794
- Documentación de SigLIP en transformers: https://huggingface.co/transformers/main/model_doc/siglip.html
- Blog de SigLIP 2: https://huggingface.co/blog/siglip2
