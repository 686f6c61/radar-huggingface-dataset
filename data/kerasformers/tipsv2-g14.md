# kerasformers/tipsv2-g14

## Resumen

TIPSv2 es una familia de modelos de visión-lenguaje de doble encoder desarrollada por Google DeepMind, presentada en CVPR 2026. Este modelo concreto, `kerasformers/tipsv2-g14`, es una conversión íntegra a Keras 3 del checkpoint original `google/tipsv2-g14`, lo que permite ejecutarlo sin modificaciones en TensorFlow, PyTorch o JAX. La arquitectura sigue el estilo CLIP/SigLIP: una torre de visión basada en un ViT con register tokens (similar a DINOv2) y una torre de texto bidireccional, alineadas mediante un objetivo contrastivo con temperatura.

El modelo resuelve el problema de la clasificación de imágenes sin necesidad de fine-tuning: dado un conjunto arbitrario de categorías textuales, devuelve la probabilidad de que la imagen pertenezca a cada una. Esto resulta útil para prototipado rápido, moderación de contenidos o cualquier escenario donde no se disponga de un dataset etiquetado específico. La relevancia actual viene de su publicación en CVPR 2026 y de la disponibilidad de una implementación multiplataforma (Keras 3) que facilita su integración en entornos heterogéneos.

El checkpoint `g14` corresponde a la variante más grande de la familia, con una resolución de entrada de 448 píxeles. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual encoder (torre de vision ViT con register tokens + torre de texto bidireccional) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Keras 3) |

## Arquitectura y entrenamiento

TIPSv2 es un modelo de doble encoder al estilo CLIP/SigLIP. La torre de visión emplea un ViT con register tokens, siguiendo la línea de DINOv2, lo que mejora la calidad de los embeddings de parches. La torre de texto es bidireccional, a diferencia de los encoders de texto unidireccionales típicos de CLIP. Ambas torres se alinean mediante un objetivo contrastivo con temperatura escalada.

El entrenamiento incorpora tres mejoras específicas respecto a los enfoques previos de pre-entrenamiento de modelos visión-lenguaje: iBOT++ (un objetivo de pre-entrenamiento auto-supervisado reforzado), Head-only EMA (media móvil exponencial aplicada solo a la cabeza del modelo) y Multi-Granularity Text Captions (descripciones textuales a múltiples niveles de granularidad). Según la página del proyecto, los autores investigaron la brecha entre pre-entrenamiento y destilación, lo que motivó estas modificaciones. La resolución de entrada es de 448 píxeles y el procesador de imágenes reescala a [0, 1] sin normalización por media y desviación estándar.

## Capacidades

- Clasificación de imágenes zero-shot: dado un conjunto de etiquetas textuales arbitrarias, devuelve la probabilidad de pertenencia de la imagen a cada categoría.
- Alineación imagen-texto: embeddings conjuntos para búsqueda multimodal y recuperación.
- Extracción de características visuales: la torre de visión puede usarse de forma aislada para tareas de embedding de imágenes.
- Extracción de características textuales: la torre de texto puede usarse de forma aislada para embeddings de texto.
- Multilingüe: no disponible (no se especifican idiomas soportados en la documentación).
- Tool calling / agentes: no aplica; es un modelo de visión-lenguaje sin capacidad de razonamiento simbólico ni ejecución de herramientas.

## Casos de uso

- **Moderación de contenidos**: clasificar imágenes en categorías como "violencia", "desnudez" o "spam" sin necesidad de un dataset etiquetado, usando simplemente las etiquetas como prompts textuales.
- **Búsqueda de imágenes por texto**: indexar una colección de imágenes y recuperar las más relevantes para una consulta textual, gracias a los embeddings conjuntos del modelo.
- **Prototipado rápido de clasificadores**: evaluar la viabilidad de una tarea de clasificación antes de invertir en etiquetado y fine-tuning, generando prompts con las categorías deseadas.
- **Organización automática de bibliotecas de imágenes**: categorizar imágenes de un repositorio (por ejemplo, fotos de producto, imágenes médicas, satelitales) en taxonomías definidas por el usuario.
- **Sistemas de recomendación visual**: generar embeddings de productos o contenidos para recomendar elementos visualmente similares o relevantes a una consulta textual.
- **Análisis de imágenes en entornos de investigación**: extraer características visuales de alta calidad para tareas posteriores de clustering, visualización o entrenamiento de modelos auxiliares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página del proyecto y el paper (arXiv:2604.12012) podrían contener métricas, pero no se incluyen en la documentación proporcionada.

## Requisitos de hardware

- El tamaño del repo es de 6.1 GB, lo que sugiere que el modelo completo (ambas torres) requiere al menos esa cantidad de almacenamiento en disco.
- VRAM estimada para inferencia: no disponible, pero tratándose de un modelo de visión de tipo ViT-g (el sufijo "g14" indica grupo de tamaño grande), se espera que requiera una GPU con al menos 16 GB de VRAM para la inferencia en FP32.
- GPU recomendadas: no disponible; por el tamaño, una A100, H100 o RTX 4090 serían adecuadas para inferencia con lote razonable.
- En consumer GPU: probablemente cabe en RTX 3090/4090 (24 GB) si se usa precisión mixta o cuantización, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: al ser Keras 3, puede ejecutarse en TensorFlow, PyTorch o JAX. No se mencionan integraciones con vLLM, llama.cpp o Ollama, que están orientadas a modelos de lenguaje. Para inferencia, se puede usar el pipeline de `kerasformers` directamente o exportar a formato ONNX/TFLite si se desea optimización.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kerasformers/tipsv2-g14 | Dual encoder (ViT-g + texto) | no disponible | 448 | Apache-2.0 | Keras 3 (TF, Torch, JAX) |
| google/tipsv2-g14 | Dual encoder (ViT-g + texto) | no disponible | 448 | Apache-2.0 | Original en PyTorch/JAX |
| CLIP ViT-L/14 | Dual encoder (ViT-L + texto) | ~428M | 224 | MIT | PyTorch, ONNX |
| SigLIP ViT-L/14 | Dual encoder (ViT-L + texto) | ~428M | 224 | Apache-2.0 | PyTorch, JAX |

La comparativa se limita a modelos de visión-lenguaje de propósito similar. TIPSv2 destaca por su resolución superior (448 frente a 224 en CLIP/SigLIP) y por las mejoras de entrenamiento introducidas en el paper. Sin embargo, no se dispone de datos de parámetros exactos para TIPSv2-g14, por lo que la comparación directa en tamaño no es posible.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han documentado sesgos específicos, pero como modelo entrenado con datos de internet, puede reflejar sesgos socioculturales presentes en las imágenes y textos de entrenamiento.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero las clasificaciones zero-shot pueden ser incorrectas si las categorías propuestas son ambiguas o no están representadas en el entrenamiento.
- **Limitaciones de contexto**: la torre de texto tiene una longitud de contexto limitada (no disponible), lo que puede afectar a descripciones largas o prompts complejos.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial sin restricciones, pero hay que atribuir el copyright correspondiente.
- **Caveat de producción**: la implementación de Keras 3 es una conversión de la comunidad; aunque se indica que es una conversión pura, es recomendable validar los resultados contra el checkpoint original en casos críticos. Además, la falta de cuantizaciones oficiales puede limitar el despliegue en entornos con restricciones de memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/tipsv2-g14
- Modelo original: https://huggingface.co/google/tipsv2-g14
- Paper (arXiv): https://huggingface.co/papers/2604.12012
- Web del proyecto: https://gdm-tipsv2.github.io/
- Repositorio GitHub: https://github.com/google-deepmind/tips
- Colección de variantes: https://huggingface.co/collections/kerasformers/tipsv2-6a8a3f36af77204954a49fb4
