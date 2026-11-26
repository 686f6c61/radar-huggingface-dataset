# litert-community/DINOv3-ViT-H16plus-Idol-LiteRT

## Resumen

DINOv3-ViT-H16plus-Idol-LiteRT es una conversión al formato LiteRT (antes TensorFlow Lite) del modelo de extracción de características visuales DINOv3 ViT-H/16+, desarrollado originalmente por Meta AI (facebook) y adaptado por la comunidad litert-community para su despliegue en dispositivos Android con aceleración por GPU. El modelo base, `facebook/dinov3-vith16plus-pretrain-lvd1689m`, es un Vision Transformer de tipo "plus" entrenado con el método de auto-supervisión DINOv3 sobre el dataset LVD-1689M, y se utiliza para generar embeddings densos de imágenes sin necesidad de etiquetas.

La relevancia de esta ficha radica en que traslada un modelo de visión de gran tamaño (ViT-H, aproximadamente 840 millones de parámetros en su variante estándar, aunque el dato exacto de esta variante "plus" no está confirmado en la información disponible) al ecosistema on-device de Android mediante LiteRT, lo que permite ejecutar extracción de características visuales en teléfonos y tablets sin depender de la nube. Esto resulta útil para aplicaciones de búsqueda visual, segmentación zero-shot, clasificación y sistemas de recomendación que requieren privacidad y baja latencia.

El repositorio está sujeto a acceso restringido (gated) y su licencia es la DINOv3 License, que impone condiciones específicas de uso. El tamaño del repositorio es de 3,4 GB y el formato de pesos es TFLite/LiteRT, no safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-H/16, variante "plus") basada en DINOv3 |
| Parametros totales | no disponible (el modelo base ViT-H/16 ronda los 840 M, pero no se confirma para la variante "plus") |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; resolución de entrada no especificada en la información) |
| Tipos de cuantizacion | no disponible (formato LiteRT, probablemente float16 o int8, sin confirmar) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | DINOv3 License (dinov3-license) |
| Formato de pesos | LiteRT / TFLite (.tflite) |
| Tamano del repositorio | 3,4 GB |
| Pipeline | image-feature-extraction |
| Modelo base | facebook/dinov3-vith16plus-pretrain-lvd1689m |
| Acceso | Restringido (gated) en Hugging Face |

## Arquitectura y entrenamiento

El modelo base es un Vision Transformer de la familia DINOv3, entrenado con auto-supervisión sobre el dataset LVD-1689M (un conjunto de aproximadamente 1.689 millones de imágenes curado por Meta). La variante "plus" hace referencia a una configuración ampliada del ViT-H/16, con parches de 16×16 píxeles y un número elevado de dimensiones ocultas. DINOv3 emplea técnicas de destilación y regularización (como el "Gram anchoring") para producir representaciones densas de alta calidad que funcionan bien en tareas downstream sin fine-tuning.

La conversión a LiteRT realizada por litert-community tiene como objetivo la ejecución en Android con aceleración GPU mediante el delegado GPU de LiteRT. No se dispone en la información proporcionada de detalles sobre el proceso de cuantización, el número exacto de capas, la resolución de entrada soportada ni las técnicas de optimización aplicadas durante la conversión. Tampoco se documentan datos sobre RLHF/DPO, al tratarse de un modelo puramente visual y auto-supervisado.

## Capacidades

- Extracción de características visuales densas a partir de imágenes, generando embeddings de alta dimensión útiles para tareas downstream.
- Segmentación semántica zero-shot y few-shot mediante comparación de embeddings de parches.
- Búsqueda visual y recuperación de imágenes por similitud (image retrieval).
- Clasificación de imágenes con cabezas ligeras entrenadas sobre los embeddings congelados.
- Detección y correspondencia de puntos clave (keypoint matching) entre imágenes.
- Ejecución on-device en Android con aceleración GPU mediante LiteRT, sin conexión a la nube.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo exclusivamente visual).
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Búsqueda visual en galerías locales de Android: la app indexa los embeddings de las fotos del usuario con el modelo on-device y permite búsquedas por similitud sin enviar imágenes al servidor, gracias a la privacidad que ofrece la inferencia local.
- Segmentación zero-shot en aplicaciones de edición fotográfica: se generan embeddings densos por parche y se comparan con prototipos de texto o imagen para separar objetos (cielo, personas, vehículos) sin entrenamiento específico.
- Clasificación de imágenes en tiempo real para inventario o control de calidad: se extraen características con el modelo congelado y se entrena una regresión logística ligera sobre ellas, desplegable en el mismo dispositivo Android.
- Detección de duplicados y near-duplicates en aplicaciones de gestión de fotos: la similitud coseno entre embeddings permite agrupar imágenes casi idénticas de forma eficiente en el dispositivo.
- Sistemas de recomendación visual en apps de comercio electrónico: el modelo genera embeddings de productos que alimentan un índice vectorial local para sugerir artículos similares sin latencia de red.
- Realidad aumentada y seguimiento visual: el matching de puntos clave entre fotogramas permite anclar objetos virtuales en escenas reales usando las características densas del ViT, con la ventaja de ejecutarse en la GPU del móvil.
- Preprocesamiento para pipelines de visión en el borde (edge): el modelo actúa como extractor de características para modelos downstream más pequeños en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 3,4 GB, lo que sugiere que en float16 el modelo ocupa aproximadamente esa cifra en memoria. En un dispositivo Android con GPU integrada, se requiere al menos 4 GB de RAM libre para cargar el modelo.
- GPU recomendadas: para servidor, A100 o H100 si se convierte a otro runtime; para on-device, GPU Adreno o Mali compatibles con el delegado GPU de LiteRT (por ejemplo, Adreno 6xx/7xx en Snapdragon).
- Cabe en consumer GPU: sí, en GPUs de escritorio con al menos 6-8 GB de VRAM si se usa el formato LiteRT con aceleración adecuada, aunque el formato está optimizado para Android.
- Opciones de despliegue: LiteRT (TensorFlow Lite) con delegado GPU en Android; no se documentan soportes para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo visual en TFLite).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DINOv3-ViT-H16plus-Idol-LiteRT | no disponible (ViT-H, ~840 M en variante estándar) | no disponible | DINOv3 License | LiteRT/TFLite | Gated en HF |
| DINOv3 ViT-H/16 (base) | ~840 M (estándar) | no disponible | DINOv3 License | Safetensors | Público en HF |
| DINOv2 ViT-L/14 | ~300 M | 518×518 típico | Apache 2.0 | Safetensors, ONNX | Público en HF |
| CLIP ViT-L/14 | ~428 M | 224×224 típico | MIT (según variante) | Safetensors, ONNX | Público en HF |

La comparativa se basa en conocimiento general de los modelos citados; los datos exactos de la variante "plus" y de la conversión LiteRT no están confirmados en la información proporcionada. DINOv3 se diferencia de CLIP por su entrenamiento auto-supervisado sin pares imagen-texto, lo que mejora la calidad de los embeddings densos para segmentación y matching.

## Limitaciones y advertencias

- Modelo exclusivamente visual: no procesa texto, audio ni código, y no soporta generación de lenguaje.
- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Licencia DINOv3 License: impone restricciones específicas para uso comercial; es obligatorio revisar los términos antes de desplegar en producción.
- Sesgos conocidos: al entrenarse sobre LVD-1689M, puede heredar sesgos de representación geográfica y demográfica del dataset; no se documentan mitigaciones en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes engañosas en dominios muy alejados de los datos de entrenamiento.
- Limitaciones de contexto o idioma: no aplica idioma; la resolución de entrada y el tamaño de parche (16×16) condicionan la granularidad de las características, y no se especifica la resolución nativa soportada por la conversión.
- Caveat para producción: el formato LiteRT está optimizado para Android; su uso en servidores requiere conversión adicional. El rendimiento real depende del delegado GPU y del dispositivo, y no se han publicado métricas de latencia.
- El repositorio tiene 0 likes y 473 descargas, lo que indica una adopción aún limitada; conviene validar la conversión antes de usarla en entornos críticos.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/DINOv3-ViT-H16plus-Idol-LiteRT
- Modelo base: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- Licencia DINOv3: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m/blob/main/LICENSE.md (referencia de la licencia del modelo base)
- Documentación de LiteRT: https://ai.google.dev/edge/litert
- Repositorio de DINOv3 (Meta AI): https://github.com/facebookresearch/dinov3
