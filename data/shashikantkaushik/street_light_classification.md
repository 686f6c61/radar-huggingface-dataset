# shashikantkaushik/street_light_classification

# Ficha del modelo: street_light_classification

## Resumen

`shashikantkaushik/street_light_classification` es un modelo de clasificación de imágenes desarrollado por Shashi Kant Kaushik mediante la herramienta Aargus-DIY Visual Inspection Tool. Su propósito es automatizar la inspección visual de farolas, determinando si están en estado operativo (**Working**) o no operativo (**Not Working**) a partir de imágenes o fotogramas de vídeo. El modelo sustituye la inspección manual por un sistema basado en IA que ofrece resultados rápidos y consistentes, lo que resulta relevante para la monitorización de infraestructura municipal y de servicios públicos.

La arquitectura empleada es una red neuronal convolucional (CNN) basada en MobileNetV2, preentrenada en ImageNet y ajustada mediante transfer learning. El modelo se distribuye con licencia Apache 2.0 y ocupa aproximadamente 0.1 GB en el repositorio de HuggingFace. Al ser un clasificador de visión, no dispone de ventana de contexto en el sentido de los modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas de clase en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | H5 (Keras/TensorFlow) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de red neuronal convolucional basada en MobileNetV2, un backbone ligero preentrenado en ImageNet. El entrenamiento se realizó en dos fases: en la primera, se congeló la base del modelo y se añadió una cabeza de clasificación personalizada compuesta por capas GlobalAveragePooling, BatchNorm, Dense(256), Dropout, Dense(128) y Dropout. En la segunda fase, se realizó un ajuste fino selectivo de las capas profundas de MobileNetV2. Se aplicó aumento de datos (rotación, desplazamientos horizontales y verticales, shear, zoom y volteo horizontal), así como pesos de clase para abordar el desequilibrio del conjunto de datos. Durante el entrenamiento se utilizaron callbacks como ModelCheckpoint, EarlyStopping y ReduceLROnPlateau.

No se especifica en la información disponible el tamaño del dataset de entrenamiento, el número de imágenes ni la composición detallada de los datos. Tampoco se indica el uso de técnicas como RLHF o DPO, ya que no se trata de un modelo de lenguaje. La herramienta Aargus-DIY Visual Inspection Tool se empleó para la creación y el ajuste del modelo.

## Capacidades

- Clasificación binaria de farolas en dos clases: **Working** y **Not Working**.
- Inferencia sobre imágenes estáticas y fotogramas de vídeo.
- Transfer learning desde pesos preentrenados en ImageNet.
- Evaluación mediante métricas de precisión, recall, F1-score, matriz de confusión e intervalos de confianza bootstrap.
- No es un modelo de lenguaje: no genera texto, código ni razonamiento simbólico.
- No soporta tool calling, function calling ni interacción por agentes.
- Las capacidades multilingües no aplican; las etiquetas de salida están en inglés.

## Casos de uso

- **Monitorización municipal de alumbrado público**: el modelo puede analizar imágenes capturadas por operarios o vehículos de inspección para identificar farolas que no funcionan, permitiendo priorizar las reparaciones y reducir el tiempo de intervención.
- **Mantenimiento predictivo de infraestructura urbana**: al integrarse en un sistema de gestión de activos, el modelo puede alimentar un inventario dinámico del estado del alumbrado, generando órdenes de trabajo automáticas cuando detecta una farola averiada.
- **Análisis de vídeo en tiempo real**: procesando fotogramas de cámaras instaladas en calles o avenidas, el modelo puede detectar farolas apagadas de forma automática y sin intervención humana, lo que resulta útil para sistemas de vigilancia urbana.
- **Inspección aérea con drones**: las imágenes aéreas de zonas residenciales o industriales pueden ser procesadas por el modelo para evaluar el estado del alumbrado en áreas extensas, reduciendo el coste de la inspección manual.
- **Aplicación móvil de reporte ciudadano**: los ciudadanos pueden fotografiar una farola y obtener una clasificación automática antes de enviar la incidencia a la administración, mejorando la calidad de los reportes y filtrando avisos falsos.
- **Auditoría de instalaciones comerciales o industriales**: el modelo puede verificar el funcionamiento de la iluminación en grandes complejos, almacenes o polígonos, donde la inspección manual resulta costosa y lenta.
- **Integración en sistemas de información geográfica (GIS)**: los resultados de la clasificación pueden enriquecer mapas urbanos con el estado de cada farola, facilitando la planificación de mantenimientos y la visualización de zonas con incidencias.

## Benchmarks y rendimiento

La información publicada por el autor incluye las siguientes métricas de evaluación sobre el conjunto de validación:

| Metrica | Valor |
|---|---|
| Accuracy | 95.16 % |
| Precision | 91.30 % |
| Recall | 95.45 % |

No se han publicado resultados de benchmarks comparativos con otros modelos ni evaluaciones externas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo ocupa 0.1 GB, por lo que puede ejecutarse con menos de 1 GB de VRAM.
- GPU recomendada: no se requiere una GPU dedicada; la inferencia básica puede realizarse en CPU.
- Compatibilidad con GPUs de consumo: sí, cualquier GPU moderna con al menos 1 GB de VRAM (por ejemplo, RTX 2060 o superior) es suficiente; también es viable en CPUs de gama media.
- Opciones de despliegue: TensorFlow/Keras, conversión a TensorFlow Lite para dispositivos móviles y exportación a ONNX para interoperabilidad con otros frameworks.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks comparativos para este modelo en la información disponible. Se pueden considerar alternativas de la misma familia de arquitecturas de visión ligera, como MobileNetV3 o EfficientNet-Lite, pero no se dispone de datos de rendimiento para la tarea de clasificación de farolas.

| Modelo | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|
| street_light_classification | MobileNetV2 | Apache 2.0 | HuggingFace (Keras/H5) |
| MobileNetV3 | CNN | Apache 2.0 | TensorFlow Hub, PyTorch |
| EfficientNet-Lite | CNN | Apache 2.0 | TensorFlow Hub |

Nota: los parámetros y el rendimiento de las alternativas no se han publicado en la información disponible.

## Limitaciones y advertencias

- No se ha realizado una evaluación de sesgos; el comportamiento del modelo en poblaciones o condiciones no representadas puede ser impredecible.
- La precisión del 91.30 % implica que existe un margen de falsos positivos; en aplicaciones críticas se recomienda validación humana.
- El modelo solo distingue entre dos clases (Working/Not Working), sin capacidad para clasificar tipos de avería ni gravedad.
- El rendimiento puede degradarse con imágenes borrosas, ángulos inusuales, condiciones de iluminación adversas o farolas de diseños no contemplados en el entrenamiento.
- La licencia Apache 2.0 permite el uso comercial, pero el modelo se distribuye tal cual, sin garantías de rendimiento en todos los escenarios.
- Los pesos se distribuyen en formato H5, lo que requiere TensorFlow/Keras; no se ofrecen pesos en otros formatos (safetensors, GGUF) en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/shashikantkaushik/street_light_classification
- GitHub del autor: https://github.com/shashikantkaushik
