# giosanchez0208/clothing-color-recognition

## Resumen

El modelo `clothing-color-recognition` de Gio Sánchez es un clasificador de color para prendas de vestir que, en lugar de asignar una única etiqueta, predice una **distribución de probabilidad sobre 13 categorías de color** (rojo, naranja, amarillo, verde, azul, violeta, púrpura, blanco, gris, negro, rosa, marrón y oliva). Esta aproximación, basada en *Label Distribution Learning* (Geng, 2016), permite representar correctamente prendas bicolores o con degradados, algo que una clasificación de etiqueta única no puede expresar.

El modelo se basa en una arquitectura **MobileNetV3-Small** con una cabeza de 13 salidas, destilada desde un profesor **ResNet-50** mediante destilación de conocimiento (temperatura 4.0, alpha 0.7). Se entrenó exclusivamente con **28.860 imágenes generadas proceduralmente** (cero fotografías reales), lo que lo convierte en un caso interesante de entrenamiento con datos sintéticos. El estudiante supera al profesor en todas las métricas evaluadas, con una reducción del 23% en divergencia KL y una mejora de 4,2 puntos en top-1, atribuida al sesgo inductivo más fuerte de las convoluciones depthwise-separables de MobileNetV3.

La relevancia actual radica en su tamaño reducido (1,53 M de parámetros, 6 MB en FP32) y su capacidad de ejecución en navegador mediante ONNX, lo que permite aplicaciones de moda en tiempo real sin infraestructura de servidor. Sin embargo, la ausencia de validación con datos reales es una limitación crítica que debe tenerse en cuenta antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small con cabeza de 13 clases |
| Parametros totales | 1,53 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | FP32, INT8 (cuantizacion dinamica), ONNX (opset 17) |
| Idiomas soportados | No disponible (modelo de vision, no textual) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (.pth) y ONNX (.onnx) |

## Arquitectura y entrenamiento

El modelo utiliza **MobileNetV3-Small** como backbone, una arquitectura eficiente basada en convoluciones depthwise-separables y bloques con squeeze-and-excitation. La cabeza de clasificación consta de 13 salidas que producen logits sobre las categorías de color. El entrenamiento se realizó mediante **destilación de conocimiento** desde un profesor ResNet-50, con temperatura 4.0 y alpha 0.7, combinando la pérdida de destilación (KL divergence) con la pérdida estándar de clasificación.

El conjunto de datos de entrenamiento consiste en **28.860 imágenes generadas proceduralmente**, donde cada imagen es un composite de 112x112 píxeles de la prenda insertado en el centro de un contexto más amplio de 224x224 píxeles, normalizado con los valores de ImageNet. La pérdida utilizada es la **divergencia KL** entre la distribución predicha y la distribución objetivo, siguiendo el paradigma de Label Distribution Learning. El proceso de generación sintética incluye variaciones de iluminación, fondos y colores, pero no fotografías reales.

Una innovación destacable es que la **cuantización INT8 dinámica** apenas degrada el rendimiento: la KL varía en 0,0001 y el top-1 mejora una décima de punto, lo que la hace prácticamente gratuita en términos de precisión.

## Capacidades

- **Clasificación de color de prendas** con salida de distribución de probabilidad sobre 13 categorías, permitiendo representar prendas multicolor.
- **Detección de color dominante y proporciones** mediante la interpretación de la distribución predicha (por ejemplo, 67% azul marino y 33% blanco).
- **Inferencia en navegador** gracias al formato ONNX, con ejecución client-side sin necesidad de servidor.
- **Cuantización INT8** para despliegue en CPU con mínima pérdida de precisión.
- **Preprocesamiento específico**: requiere un composite de 112x112 insertado en un contexto de 224x224, no un simple redimensionado de la imagen completa.
- **Salida de logits** sobre las 13 clases en orden fijo (rojo, naranja, amarillo, verde, azul, violeta, púrpura, blanco, gris, negro, rosa, marrón, oliva), que deben pasarse por softmax para obtener la distribución.

## Casos de uso

- **Recomendación de moda en e-commerce**: el modelo puede analizar la paleta de colores de una prenda a partir de una foto del producto y sugerir combinaciones o filtrar por color en catálogos. Su salida distribuida permite manejar prendas con varios colores, algo que los clasificadores de etiqueta única no resuelven bien.
- **Búsqueda visual por color**: en aplicaciones de venta de ropa de segunda mano, el usuario puede buscar "camisa azul marino con rayas blancas" y el modelo devuelve la distribución de colores para filtrar resultados relevantes.
- **Control de calidad en fabricación textil**: verificar que el color de una prenda producida coincide con el especificado en el diseño, detectando desviaciones en tonos o proporciones de color.
- **Accesibilidad para personas con daltonismo**: describir el color de una prenda a partir de una foto, indicando la distribución de colores para que el usuario pueda distinguir prendas que percibe como similares.
- **Análisis de tendencias de moda**: procesar grandes volúmenes de imágenes de pasarelas o redes sociales para extraer estadísticas de colores dominantes y sus combinaciones, útil para diseñadores y marcas.
- **Automatización de inventario en tiendas físicas**: mediante una cámara, clasificar automáticamente el color de las prendas en estanterías para actualizar el sistema de inventario sin intervención manual.

## Benchmarks y rendimiento

Los resultados declarados por el autor se obtuvieron sobre un conjunto de test sintético de 2.000 imágenes, con fondos disjuntos del entrenamiento y validación. El estudiante supera al profesor en todas las métricas.

| Modelo | KL divergence | top-1 accuracy | MAE | Tamano | Latencia CPU |
|---|---:|---:|---:|---:|---:|
| Teacher ResNet-50 | 0,6226 | 63,2% | 0,0499 | 90,1 MB | 45,4 ms |
| Student FP32 | 0,4799 | 67,3% | 0,0423 | 6,0 MB | 6,2 ms |
| **Student INT8** | **0,4800** | **67,4%** | **0,0423** | **4,2 MB** | **6,9 ms** |

La mejora del estudiante sobre el profesor se atribuye al sesgo inductivo de MobileNetV3, que regulariza mejor en un problema de 13 clases donde el profesor tiende a sobreajustar la distribución sintética. La cuantización INT8 es prácticamente gratuita en precisión.

## Requisitos de hardware

- **VRAM estimada**: menos de 50 MB para FP32 (6 MB de pesos), por lo que cabe en cualquier GPU moderna, incluso integradas.
- **GPU recomendada**: no se requiere GPU dedicada; el modelo se ejecuta en CPU con latencias de 6-7 ms por imagen. Para despliegue masivo, cualquier GPU con al menos 1 GB de VRAM es suficiente.
- **Compatibilidad con consumer GPU**: sí, funciona en cualquier GPU de consumo (RTX 2060, GTX 1650, etc.) e incluso en CPU sin problemas.
- **Opciones de despliegue**: ONNX Runtime (CPU/GPU), PyTorch, navegador mediante ONNX.js o WebAssembly, y cualquier framework que soporte ONNX (TensorRT, OpenVINO, etc.).
- **Latencia y throughput**: 6,2 ms por imagen en CPU (FP32) y 6,9 ms (INT8), lo que permite procesar más de 150 imágenes por segundo en un solo núcleo de CPU.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de la misma categoría (reconocimiento de color de prendas con salida distribuida). Existen alternativas como FashionColor-0 (extracción de colores dominantes) o APIs comerciales de auto-etiquetado de ropa, pero no se han encontrado especificaciones técnicas públicas que permitan una comparación rigurosa. El modelo destaca por su tamaño extremadamente reducido y su enfoque de distribución de etiquetas, pero la falta de validación con datos reales limita su comparabilidad con soluciones entrenadas con fotografías.

## Limitaciones y advertencias

- **Sin validación con datos reales**: todos los resultados se miden sobre datos sintéticos. La transferencia a fotografías reales no está probada a escala, por lo que su uso en producción con imágenes reales conlleva un riesgo alto de degradación.
- **Debilidad en límites de categorías**: el modelo falla sistemáticamente en tonos cercanos a los límites entre colores, como verde pálido leído como amarillo o gris contra blanco. Esto se debe a un sesgo en el generador sintético que subrepresenta las regiones cercanas a los límites.
- **Constancia de color aprendida**: el modelo ha aprendido la corrección de balance de blancos a partir de la variación de iluminante simulada en el generador. No se ha probado con iluminantes fuera de ese rango.
- **Preprocesamiento específico obligatorio**: alimentar el modelo con una imagen redimensionada directamente produce resultados sin sentido. Es necesario aplicar el composite de 112x112 dentro de 224x224 y la normalización de ImageNet.
- **Restricciones de licencia para uso comercial**: aunque el código es MIT, los pesos iniciales provienen de torchvision preentrenado en ImageNet, cuyos términos permiten uso no comercial. Cualquier uso comercial debe verificar la licencia actual de ImageNet. Los fondos de entrenamiento derivan de MIT Indoor Scene Recognition, aunque no se redistribuyen.
- **Sin soporte multilingüe**: al ser un modelo de visión, no aplica, pero la documentación solo está en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/giosanchez0208/clothing-color-recognition
- Demo en navegador (Space): https://huggingface.co/spaces/giosanchez0208/clothing-color-recognition
- Repositorio fuente (según cita): https://github.com/giosanchez0208/Clothing-Color-Recognition-ML-With-Synthetic-Dataset
- Referencia: Geng, X. (2016). Label Distribution Learning. *IEEE Transactions on Knowledge and Data Engineering*.
- Referencia: Quattoni, A. y Torralba, A. (2009). MIT Indoor Scene Recognition. *CVPR*.
- Referencia: Centore, P. sRGB centroids para el sistema de color ISCC-NBS (NBS Special Publication 440).
