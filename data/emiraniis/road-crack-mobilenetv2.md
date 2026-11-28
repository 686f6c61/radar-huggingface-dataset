# Emiraniis/road-crack-mobilenetv2

## Resumen

Road crack detection (MobileNetV2, ONNX) es un clasificador de imágenes binario publicado por Emir Anis (usuario Emiraniis) como proyecto de estudiante para la asignatura de Deep Learning de la Vizja University. El modelo distingue entre superficies de pavimento con grietas y sin grietas, y se distribuye en formato ONNX con la arquitectura MobileNetV2 afinada mediante transfer learning sobre el dataset público Surface Crack Detection de Kaggle. El autor reporta una precisión del 99,7 % en el conjunto de test.

El modelo es relevante como ejemplo de pipeline de inspección visual automatizada de bajo coste: MobileNetV2 es una red convolucional ligera diseñada para inferencia en dispositivos con recursos limitados, y la exportación a ONNX facilita su integración en aplicaciones de escritorio, web o embebidas sin depender de frameworks de deep learning completos. El repositorio incluye dos salidas: `prob` (probabilidad de grieta) y `features` (mapa de características de la última capa), pensada esta última para generar mapas de calor con Grad-CAM y explicar la predicción.

Se trata de un artefacto de alcance muy acotado: no es un modelo de lenguaje, no procesa texto y su única tarea es la clasificación de imágenes de 128×128 píxeles en dos clases. No hay información publicada sobre composición del dataset de entrenamiento más allá de su origen, ni sobre particiones, aumentos de datos o hiperparámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN con bloques residuales invertidos y conexiones lineales de cuello de botella) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 128×128×3) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX en precisión nativa float32) |
| Idiomas soportados | no aplica (clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea MobileNetV2, una red convolucional profunda propuesta por Sandler et al. (2018) que sustituye las convoluciones estándar por convoluciones separables en profundidad y bloques residuales invertidos con expansión y proyección lineal. Esta arquitectura reduce el coste computacional y el número de parámetros frente a CNN clásicas como ResNet, lo que la hace adecuada para inferencia en CPU o en dispositivos de borde. En este caso se ha aplicado transfer learning: se parte de pesos preentrenados en ImageNet y se reajusta la cabeza de clasificación para la tarea binaria de detección de grietas.

El entrenamiento se realizó sobre el dataset Surface Crack Detection de Kaggle, según indica el autor en la model card. No se especifican el número de imágenes, la resolución original, las particiones de entrenamiento/validación/test, las técnicas de aumento de datos, la función de pérdida, el optimizador ni el número de épocas. La única métrica reportada es una precisión del 99,7 % en test. El modelo se exportó a ONNX con dos salidas: `prob`, la probabilidad de que la imagen contenga una grieta, y `features`, el mapa de activaciones de la última capa convolucional, que permite generar visualizaciones Grad-CAM para inspeccionar en qué regiones se fija la red.

## Capacidades

- Clasificación binaria de imágenes de pavimento en las clases "grieta" y "sin grieta".
- Entrada de imagen en formato float32 con shape (N, 128, 128, 3) y valores en el rango 0-255, sin normalización previa aparente (la normalización, si existe, está embebida en el grafo ONNX).
- Salida `prob` con la probabilidad de grieta, apta para umbralizar y generar alertas.
- Salida `features` con el mapa de características de la última capa, utilizable para Grad-CAM y explicabilidad visual.
- Inferencia ligera compatible con ONNX Runtime en CPU, sin necesidad de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto ni procesamiento multilingüe.

## Casos de uso

- Inspección automatizada de firmes en obra civil: integrado en un dron o vehículo con cámara, el modelo clasifica cada fotograma de 128×128 y marca tramos con grietas para revisión humana posterior. Su tamaño reducido permite ejecutarlo a bordo sin conexión.
- Mantenimiento predictivo de carreteras municipales: procesamiento por lotes de imágenes de inventario vial para priorizar reparaciones según la proporción de imágenes positivas por kilómetro.
- Aplicación de escritorio o web de demostración: el repositorio del autor (savage20-pro/road-crack-detection) lo integra como backend de clasificación, y el formato ONNX permite cargarlo con onnxruntime-web en el navegador.
- Prefiltrado en pipelines de anotación: usar `prob` para descartar imágenes claramente negativas antes de que un anotador humano revise las positivas, reduciendo coste de etiquetado.
- Docencia y prototipado: ejemplo completo de transfer learning con MobileNetV2, exportación a ONNX y Grad-CAM, útil como plantilla para otras tareas de inspección visual industrial.
- Control de calidad en fabricación de prefabricados de hormigón: adaptando la cabeza de clasificación con fine-tuning, la misma arquitectura sirve para detectar fisuras en piezas antes de su instalación.
- Análisis de imágenes satelitales o de dron de baja resolución: la entrada de 128×128 encaja con recortes de ortomosaicos, permitiendo un barrido rápido de grandes superficies.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Precisión (accuracy) | 99,7 % | Test del dataset Surface Crack Detection (Kaggle) |

No se han publicado resultados de benchmarks adicionales (precisión, recall, F1, AUC, latencia, throughput) en la información disponible. Tampoco se ofrece comparación con otros modelos sobre el mismo conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32; MobileNetV2 a 128×128 requiere muy poca memoria, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no es necesario GPU; funciona en CPU con ONNX Runtime. Cualquier GPU (RTX 3060, RTX 4090, A100, H100) acelera la inferencia, pero el cuello de botella será la carga de imágenes, no el modelo.
- Cabe en GPU consumer: sí, en todas las GPU con soporte CUDA o DirectML, y también en CPU de portátil.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML, Web), integración en aplicaciones Python, C++, C# o JavaScript; también puede convertirse a TensorFlow Lite o Core ML para móvil.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por la arquitectura, se espera del orden de milisegundos por imagen en CPU moderna, pero no se ha publicado medición alguna.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Emiraniis/road-crack-mobilenetv2 | MobileNetV2 | 128×128×3 | Clasificación binaria de grietas | MIT | Hugging Face, ONNX |
| MobileNetV3 (Google) | MobileNetV3 | 224×224×3 (típico) | Clasificación ImageNet, base para fine-tuning | Apache 2.0 | TensorFlow Hub, PyTorch Hub |
| ResNet-50 | ResNet | 224×224×3 | Clasificación ImageNet, base para fine-tuning | BSD-3 / Apache 2.0 según implementación | PyTorch, TensorFlow |
| EfficientNet-B0 | EfficientNet | 224×224×3 | Clasificación ImageNet, base para fine-tuning | Apache 2.0 | TensorFlow, PyTorch |

No se dispone de comparaciones directas de rendimiento sobre el dataset Surface Crack Detection entre este modelo y alternativas, por lo que la comparativa se limita a arquitectura, licencia y disponibilidad. MobileNetV3 y EfficientNet-B0 ofrecerían, en principio, mejor relación precisión/coste que MobileNetV2, pero requerirían reentrenamiento específico para esta tarea.

## Limitaciones y advertencias

- Modelo de estudiante sin validación externa: la única métrica es la reportada por el autor; no hay conjunto de test independiente ni evaluación por parte de terceros.
- Riesgo de sobreajuste al dataset de Kaggle: Surface Crack Detection tiene condiciones de captura homogéneas; el rendimiento puede degradarse con imágenes de otras cámaras, iluminación, ángulos o tipos de pavimento.
- Entrada fija de 128×128: pierde detalle en grietas finas o en imágenes de alta resolución si no se recorta adecuadamente.
- Clasificación binaria sin localización: indica si hay grieta, pero no dónde ni de qué tipo (fisura longitudinal, transversal, piel de cocodrilo, bache). La salida `features` permite Grad-CAM, pero no sustituye a un modelo de segmentación.
- Sin información sobre sesgos: no se documenta la distribución del dataset (país, tipo de firme, climatología), por lo que no puede evaluarse su robustez fuera del dominio de entrenamiento.
- Sin garantías de producción: no hay pruebas de latencia, estabilidad numérica ni comportamiento con imágenes corruptas o fuera de distribución.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías de ningún tipo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Emiraniis/road-crack-mobilenetv2
- Aplicación que lo utiliza: https://github.com/savage20-pro/road-crack-detection
- Dataset de entrenamiento (Kaggle Surface Crack Detection): no se proporciona URL directa en la model card; el dataset es público en Kaggle con el nombre "Surface Crack Detection".
- Paper de MobileNetV2 (Sandler et al., 2018): https://arxiv.org/abs/1801.04381
- Documentación de ONNX Runtime: https://onnxruntime.ai/
