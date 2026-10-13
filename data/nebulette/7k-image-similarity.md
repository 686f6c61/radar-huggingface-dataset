# nebulette/7k-image-similarity

## Resumen
nebulette/7k-image-similarity es un modelo bidireccional de transformer con módulos de atención cruzada SnowLily/CrossAttention, desarrollado por el usuario de HuggingFace nebulette. Su función es predecir la similitud entre imágenes de gelbooru a partir de un thumbnail y una descripción textual incompleta. El modelo cuenta con 147.200.640 parámetros (aproximadamente 147 millones), un tamaño de repositorio de 0,6 GB y se distribuye bajo licencia Apache 2.0 en formato safetensors.

El modelo se entrenó con etiquetas booru largas, separadas por comas, enmascaradas y no enmascaradas, utilizando el token [CLS] en el cálculo de la pérdida. Los datos de origen provienen de 50.000 etiquetas booru comunes, para las que se descargaron imágenes de muestra; de todas ellas, 7.000 resultaron más frecuentes en el conjunto de datos. No se documenta la longitud de contexto, los idiomas soportados ni los tipos de cuantización.

Su relevancia radica en ser una propuesta especializada y ligera para similitud visual en el dominio de los boorus, ejecutable en hardware de consumo. Sin embargo, carece de benchmarks publicados, de validación por parte de la comunidad (0 descargas y 0 likes en el momento de la consulta) y de documentación sobre su pipeline de inferencia.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (encoder) con módulos de atención cruzada SnowLily/CrossAttention |
| Parámetros totales | 147.200.640 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | no disponible |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura de transformer bidireccional orientada a la comparación de representaciones. Sus bloques encoder incorporan módulos de atención cruzada denominados SnowLily/CrossAttention, que permiten combinar la información visual del thumbnail con la descripción textual asociada. La entrada consiste en un thumbnail de imagen y una descripción textual incompleta; la salida es una puntuación de similitud entre imágenes de gelbooru. El token [CLS] participa en el cálculo de la pérdida, de modo que la representación global se optimiza directamente para la tarea de similitud.

El entrenamiento utilizó etiquetas booru largas, separadas por comas, tanto enmascaradas como no enmascaradas. El conjunto de datos se construyó a partir de 50.000 etiquetas booru comunes, para las que se descargaron imágenes de muestra; de ese total, 7.000 etiquetas fueron más frecuentes que el resto. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Predicción de similitud entre imágenes de gelbooru a partir de un thumbnail y una descripción textual incompleta.
- Comprensión de etiquetas booru en formato de texto separado por comas, incluyendo variantes enmascaradas y no enmascaradas.
- Modelo bidireccional de encoder con atención cruzada; no es un modelo generativo de texto ni de imágenes.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles; las etiquetas booru son predominantemente en inglés.
- Capacidad especial: uso del token [CLS] como representación global para el cálculo de similitud.

## Casos de uso
- Búsqueda de imágenes similares en galerías de arte anime: dado un thumbnail y una descripción parcial, el modelo puntúa la similitud con imágenes candidatas y permite recuperar las más parecidas. Es adecuado porque se entrenó específicamente con etiquetas booru y miniaturas de gelbooru.
- Deduplicación de datasets de imágenes: agrupar imágenes casi idénticas en un corpus de entrenamiento mediante la puntuación de similitud, filtrando duplicados antes de entrenar otros modelos.
- Recomendación de contenido visual: sugerir imágenes similares a una consulta en una plataforma de fanart, usando la combinación de thumbnail y texto como señal de entrada.
- Curación y validación de etiquetado: para una imagen con etiquetas incompletas, comparar su representación con la de imágenes similares y ayudar a validar o completar los tags existentes.
- Moderación asistida de contenido: detectar agrupaciones de imágenes visualmente similares para aplicar políticas de forma coherente, aunque el modelo no clasifica explícitamente contenido NSFW.
- Ranking en motores de búsqueda visual: reordenar resultados de búsqueda por similitud con la consulta formada por un thumbnail y una descripción textual.
- Análisis de tendencias en boorus: agrupar imágenes por similitud para estudiar estilos, personajes o series recurrentes en grandes volúmenes de imágenes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP32: aproximadamente 588 MB solo para los pesos; con overhead de activaciones y framework, entre 1,5 y 2 GB.
- VRAM estimada en FP16/BF16: aproximadamente 294 MB para los pesos; con overhead, alrededor de 1 GB.
- VRAM estimada en INT8: aproximadamente 147 MB para los pesos; por debajo de 1 GB en total.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4090). Para lotes grandes o baja latencia, se recomiendan A100 o H100.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso puede ejecutarse en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch con safetensors, ONNX Runtime. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Licencia | Formato | Especialización |
|---|---|---|---|---|
| nebulette/7k-image-similarity | 147.200.640 | Apache 2.0 | safetensors | Similitud de imágenes booru con texto |
| CLIP ViT-B/32 (OpenAI) | aprox. 151 M | MIT | PyTorch | Similitud imagen-texto general |
| SigLIP ViT-B/16 (Google) | aprox. 203 M | Apache 2.0 | safetensors | Similitud imagen-texto general |

Comparativa estructural basada en fichas públicas de los modelos alternativos. No se dispone de datos de rendimiento comparables para nebulette/7k-image-similarity.

## Limitaciones y advertencias
- Sesgo hacia el dominio de gelbooru: el modelo se entrenó con imágenes y etiquetas de temática anime, posiblemente con contenido NSFW, por lo que puede no generalizar a otros dominios visuales.
- Riesgo de predicciones de similitud inexactas, especialmente cuando la descripción textual es muy incompleta o ambigua.
- No es un modelo generativo: no produce texto, imágenes ni respuestas conversacionales.
- Idiomas: las etiquetas booru son principalmente en inglés; no se documentan capacidades en otros idiomas.
- Licencia Apache 2.0 permite uso comercial del modelo, pero el contenido de entrenamiento (imágenes de gelbooru) puede estar sujeto a derechos de autor y restricciones de uso; el usuario es responsable de su aplicación.
- Sin benchmarks publicados ni validación de la comunidad (0 descargas y 0 likes en el momento de la consulta).
- Arquitectura personalizada con módulos SnowLily/CrossAttention que puede requerir código específico no disponible en librerías estándar como transformers.
- Longitud de contexto, tipos de cuantización y pipeline de inferencia no documentados.
- El modelo espera un thumbnail y una descripción textual; no se especifica el procesamiento de imágenes a resolución completa.

## Enlaces
- https://huggingface.co/nebulette/7k-image-similarity
- https://huggingface.co/nebulette
- https://huggingface.co/nebulette/models
- No se han encontrado papers, blogs o repositorios específicos del modelo en la búsqueda web.
