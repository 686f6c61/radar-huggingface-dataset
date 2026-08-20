# mlboydaisuke/SigLIP2-base-patch16-224-ExecuTorch

## Resumen

El modelo `mlboydaisuke/SigLIP2-base-patch16-224-ExecuTorch` es una conversión del modelo de visión-lenguaje SigLIP2 de Google (`google/siglip2-base-patch16-224`) al formato ExecuTorch (`.pte`), diseñado para inferencia en dispositivos móviles y edge. El objetivo es permitir clasificación de imágenes zero-shot y extracción de embeddings visuales sin depender de servidores en la nube, con un rendimiento optimizado para hardware de bajo consumo.

La conversión incluye tres variantes: una implementación portable sobre XNNPACK (CPU, fp32 y fp16) y una variante Core ML para iOS que aprovecha el Neural Engine de Apple. Según las pruebas del autor, la variante Core ML ejecuta el modelo entre 3,5 y 13,9 veces más rápido que la versión XNNPACK en un iPhone 17 Pro, con una paridad numérica superior a 0,9998 respecto al modelo original en fp32.

Este modelo es relevante ahora porque resuelve el problema del despliegue de modelos de visión en entornos sin conectividad o con restricciones de privacidad, manteniendo una alta fidelidad respecto al modelo base. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, lo que facilita su integración en aplicaciones de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con atención, basado en SigLIP2 (Google). La versión ExecuTorch es una conversión del modelo original. |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base `google/siglip2-base-patch16-224` tiene 84M parámetros, pero no se confirma en esta ficha). |
| Parametros activos | No aplica (no es un modelo MoE). |
| Longitud de contexto | No aplica (modelo de visión puro; no procesa texto). |
| Tipos de cuantizacion | fp32, fp16 (XNNPACK) y fp16 con Core ML (iOS). No se indica cuantizacion INT8. |
| Idiomas soportados | No disponible (el modelo base es multimodal, pero esta versión solo genera embeddings de imagen). |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch `.pte` (con variantes para XNNPACK y Core ML). |

## Arquitectura y entrenamiento

El modelo base es `google/siglip2-base-patch16-224`, un transformer visual (ViT) de 84 millones de parámetros que procesa imágenes de 224×224 píxeles y produce un embedding de 768 dimensiones mediante un attention pooler. La arquitectura SigLIP2 se entrena con una pérdida sigmoide de contraste (sigmoid loss) en lugar de la pérdida softmax tradicional, lo que mejora la eficiencia del aprendizaje y la robustez en tareas de clasificación zero-shot.

La versión ExecuTorch se obtiene mediante el pipeline de conversión de PyTorch: `torch.export` seguido de `to_edge_transform_and_lower` con un particionador que baja las operaciones a XNNPACK (CPU) o Core ML (Neural Engine). Según los datos del autor, el 68,6% de las operaciones (395 de 576) se delegan a XNNPACK en la variante fp32, quedando el resto en kernels portables de ExecuTorch. No se proporcionan datos sobre el dataset de entrenamiento ni el proceso de entrenamiento del modelo original, ya que esta ficha se centra en la conversión.

## Capacidades

- Clasificación de imágenes zero-shot: dado un conjunto de etiquetas arbitrarias, el modelo puede clasificar una imagen sin entrenamiento previo específico para esas clases.
- Extracción de embeddings de imagen: genera un vector de 768 dimensiones (normalizable con L2) útil para búsqueda semántica, clustering o como entrada para otros modelos.
- Inferencia en dispositivo: gracias a la conversión ExecuTorch, el modelo puede ejecutarse en CPUs ARM (Android) y en el Neural Engine de iOS con baja latencia.
- Compatibilidad con XNNPACK y Core ML: ofrece una opción portable (CPU) y otra optimizada para Apple Silicon.
- Intercambio de variantes sin cambios en el código de aplicación: los tres archivos `.pte` tienen la misma interfaz de entrada/salida (tensores fp32).

## Casos de uso

- **Clasificación de imágenes en aplicaciones móviles sin conexión**: una app de fotografía puede etiquetar imágenes en el dispositivo (p. ej., "paisaje", "retrato", "comida") sin enviar datos a servidores, gracias a la ejecución on-device del modelo.
- **Moderación de contenido en plataformas**: el modelo puede clasificar imágenes en categorías de contenido inapropiado en tiempo real, funcionando como filtro previo en apps de mensajería o redes sociales con privacidad de datos.
- **Búsqueda visual en galerías personales**: usando los embeddings de 768 dimensiones, se pueden indexar fotos en el dispositivo y realizar búsquedas por similitud (p. ej., "muéstrame todas las fotos de mi perro") sin depender de servicios en la nube.
- **Accesibilidad para personas con discapacidad visual**: una app de asistencia puede describir o etiquetar objetos capturados por la cámara en tiempo real, ejecutándose localmente para garantizar una baja latencia y privacidad.
- **Análisis de documentos con escaneo**: clasificación de documentos escaneados en categorías (facturas, contratos, formularios) en apps de escaneo móvil, con una latencia de ~4 ms en iPhone con Core ML.
- **Prototipado rápido de sistemas de visión**: los desarrolladores pueden integrar este modelo en pipelines de zero-shot para evaluar la viabilidad de una tarea de clasificación antes de entrenar un modelo específico, aprovechando el formato `.pte` para despliegue directo.

## Benchmarks y rendimiento

La información proporcionada incluye métricas de paridad y latencia medidas por el autor. No se incluyen benchmarks estándar (MMLU, ImageNet, etc.) para esta conversión.

| Variante | Tamaño (MB) | Paridad vs fp32 eager (correlación) | Latencia Mac arm64 (ms, mediana de 10) |
|---|---|---|---|
| fp32 (XNNPACK) | 371,7 | 0,999994 | 195,6 |
| fp16 (XNNPACK) | 187,3 | 0,999986 | 227,8 |
| Core ML fp16 (iOS) | 185,1 | 0,999806 | 4,4 |

Nota: la latencia del modelo eager fp32 en la misma máquina (Mac) es de 34,4 ms, lo que indica que la versión XNNPACK es más lenta que el eager en CPU, pero la Core ML es 7,8 veces más rápida que el eager. El autor indica que los tiempos de Core ML son medidos en un iPhone 17 Pro, con una aceleración de 3,5x a 13,9x (mediana 12x) comparada con XNNPACK en varios modelos.

No se han publicado resultados de benchmarks estándar de clasificación (como ImageNet) en la información disponible.

## Requisitos de hardware

- **VRAM**: no aplica (inferencia en CPU/Neural Engine, no requiere GPU dedicada).
- **CPU**: la variante XNNPACK está optimizada para CPUs ARM (Android, iOS) y también funciona en Macs con Apple Silicon. El tamaño del archivo (187-372 MB) es adecuado para almacenamiento local.
- **GPU**: no se requiere; el modelo está diseñado para ejecutarse en CPU o NPU de dispositivos móviles.
- **Neural Engine (iOS)**: la variante Core ML requiere un dispositivo iOS con Neural Engine (iPhone 12 o posterior, y especialmente eficiente en iPhone 17 Pro).
- **Opciones de despliegue**: integración directa con ExecuTorch (1.4.0) en apps Android/iOS; también se puede usar con el runtime de ExecuTorch en entornos embebidos.
- **Latencia**: 4,4 ms en iPhone 17 Pro (Core ML) y 195-228 ms en Mac arm64 (XNNPACK). En Android, se espera un rendimiento similar a la variante XNNPACK, dependiendo del procesador.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la ficha proporcionada. Sin embargo, se pueden comparar las variantes internas:

| Variante | Formato | Tamaño (MB) | Rendimiento (Mac arm64) | Plataforma objetivo |
|---|---|---|---|---|
| fp32 (XNNPACK) | ExecuTorch `.pte` | 371,7 | 195,6 ms | Android, iOS (CPU) |
| fp16 (XNNPACK) | ExecuTorch `.pte` | 187,3 | 227,8 ms | Android, iOS (CPU) |
| Core ML fp16 | ExecuTorch `.pte` | 185,1 | 4,4 ms (iPhone 17 Pro) | iOS (Neural Engine) |

No se incluyen otros modelos comparables (p. ej., CLIP, otros SigLIP) en la información disponible.

## Limitaciones y advertencias

- **Modelo de visión pura**: esta versión ExecuTorch solo procesa imágenes; no incluye el texto ni las capacidades multimodales del SigLIP2 completo (aunque el modelo base es multimodal, esta conversión solo expone el encoder de imagen).
- **Entrada específica**: la entrada está fijada a 224×224 píxeles con escala a [-1, 1] (media 0,5, desviación 0,5). No se admite otro tamaño de imagen sin reescalado.
- **Salida no normalizada**: el embedding de salida no está L2-normalizado; el usuario debe normalizarlo antes de usar similitud coseno.
- **Rendimiento en CPU**: la variante XNNPACK es notablemente más lenta que la ejecución eager en Mac (195 ms vs 34 ms), lo que sugiere que es adecuada para dispositivos móviles, pero no para servidores de alta carga.
- **Compatibilidad limitada**: la variante Core ML solo funciona en iOS; en Android se debe usar XNNPACK, que tiene un rendimiento inferior.
- **Sin cuantizacion INT8**: no se ofrecen variantes de cuantizacion de 8 bits, lo que limita el despliegue en dispositivos con memoria muy limitada.
- **Riesgo de sesgos**: al ser un modelo de visión preentrenado, puede presentar sesgos en el reconocimiento de categorías (género, etnia, objetos) no evaluados en esta conversión.
- **Verificación limitada**: la paridad se ha medido en un solo modelo y no se han publicado pruebas de robustez en condiciones reales (iluminación, oclusión, etc.).

## Enlaces

- [HuggingFace: mlboydaisuke/SigLIP2-base-patch16-224-ExecuTorch](https://huggingface.co/mlboydaisuke/SigLIP2-base-patch16-224-ExecuTorch)
- [Modelo base: google/siglip2-base-patch16-224](https://huggingface.co/google/siglip2-base-patch16-224)
- [Scripts de conversión: executorch-models (GitHub)](https://github.com/john-rocky/executorch-models)
