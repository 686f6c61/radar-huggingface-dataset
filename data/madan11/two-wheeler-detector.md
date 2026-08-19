# Madan11/two-wheeler-detector

## Resumen

El modelo `Madan11/two-wheeler-detector` es un detector de objetos basado en **YOLOv8n**, afinado por Madan Belbase para la detección de vehículos con especial énfasis en vehículos de dos ruedas (motocicletas, scooters y bicicletas). Publicado en Hugging Face bajo licencia AGPL-3.0, el modelo se presenta como una solución ligera y rápida para tareas de visión por computador como monitorización de tráfico, análisis de aparcamientos o aplicaciones de seguridad vial.

El modelo parte de los pesos preentrenados `yolov8n.pt` de Ultralytics y se entrena durante 25 épocas con un tamaño de imagen de 640×640 píxeles y un batch de 16. Reconoce 9 clases de vehículos: auto-rickshaw, bicicleta, autobús, coche, motocicleta, pickup, scooter, camión y furgoneta. Al tratarse de una arquitectura YOLOv8n, el modelo es extremadamente compacto y puede ejecutarse en dispositivos con recursos limitados, lo que lo hace relevante para despliegues en tiempo real en edge computing o sistemas embebidos.

Aunque el repositorio no incluye información detallada sobre el conjunto de datos de entrenamiento, las métricas reportadas en la última época (precisión 0.865, recall 0.695, mAP50 0.752) indican un rendimiento aceptable para casos de uso donde la precisión es prioritaria frente a la exhaustividad. El modelo está diseñado para ser cargado directamente con la librería Ultralytics, tanto desde Hugging Face como desde un archivo local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (Ultralytics) |
| Parametros totales | No disponible (base: yolov8n.pt) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura **YOLOv8n**, una red neuronal convolucional de una sola etapa diseñada por Ultralytics. YOLOv8 incorpora un backbone CSPDarknet, cuello PAN-FPN y una cabeza de detección anclada libre, lo que permite una detección rápida y precisa en tiempo real. El modelo se ha afinado a partir de los pesos preentrenados `yolov8n.pt`, que fueron entrenados originalmente en el conjunto de datos COCO.

El entrenamiento se realizó sobre un conjunto de datos personalizado (no especificado) con las 9 clases mencionadas. Se emplearon 25 épocas, un tamaño de imagen de 640×640 píxeles y un batch size de 16. No se menciona el uso de técnicas como RLHF, DPO ni aumentos de datos específicos. La ausencia de detalles sobre el dataset impide conocer la distribución geográfica o las condiciones de captura, lo que condiciona la generalización del modelo.

## Capacidades

- Detección de objetos en imágenes y vídeo: identifica y localiza vehículos mediante bounding boxes y etiquetas de clase.
- Clasificación de 9 tipos de vehículos: auto-rickshaw, bicicleta, autobús, coche, motocicleta, pickup, scooter, camión y furgoneta.
- Inferencia en tiempo real: gracias a su arquitectura ligera, es adecuado para aplicaciones con requisitos de baja latencia.
- Integración sencilla con el ecosistema Ultralytics: carga directa desde Hugging Face o desde un archivo local.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.

## Casos de uso

- Monitorización de tráfico urbano: el modelo puede analizar flujos de vehículos en intersecciones o carreteras, contando motocicletas, coches y otros tipos, lo que ayuda a estudiar patrones de movilidad y congestión.
- Gestión de aparcamientos: mediante cámaras fijas, se puede detectar la ocupación de plazas y clasificar el tipo de vehículo, facilitando la asignación dinámica de espacios.
- Seguridad vial para dos ruedas: en zonas de alto riesgo, el modelo puede alertar de la presencia de motocicletas o scooters, por ejemplo en pasos a nivel o cruces peligrosos.
- Control de acceso en zonas restringidas: permite detectar vehículos no autorizados, como motos en áreas peatonales, y activar alarmas o barreras.
- Análisis de flujo vehicular para estudios urbanos: los datos de detección pueden agregarse para generar estadísticas de composición del parque móvil en una zona concreta.
- Vigilancia en carreteras y autopistas: el modelo puede integrarse en sistemas de cámaras para detectar incidentes, como vehículos detenidos o circulación en sentido contrario, aunque su recall limitado debe tenerse en cuenta.

## Benchmarks y rendimiento

La información disponible incluye las métricas obtenidas en la última época de entrenamiento:

| Metrica | Valor |
|---|---|
| Precision | 0.865 |
| Recall | 0.695 |
| mAP50 | 0.752 |
| mAP50-95 | 0.624 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo YOLOv8n (aproximadamente 3.2 millones de parámetros), la inferencia en FP16 requiere menos de 1 GB de VRAM. En CPU puede ejecutarse con un uso de RAM inferior a 1 GB.
- GPU recomendada: cualquier GPU NVIDIA con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 2060) es suficiente. También funciona en CPUs modernas, aunque con mayor latencia.
- Compatibilidad con hardware de bajo consumo: puede desplegarse en dispositivos como Raspberry Pi 4/5 o Jetson Nano utilizando ONNX o TensorRT.
- Opciones de despliegue: Ultralytics (Python), exportación a ONNX, TensorRT, OpenVINO o TFLite. También puede integrarse en frameworks de servidor como FastAPI o Triton.
- Latencia estimada: en una GPU media (RTX 3060), la inferencia sobre una imagen de 640×640 suele completarse en menos de 10 ms. En CPU, puede oscilar entre 50 y 200 ms dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. Sin embargo, por su naturaleza, puede compararse con otros detectores de vehículos basados en YOLOv5, YOLOv8s o modelos como EfficientDet. La principal diferencia es que este modelo está especializado en dos ruedas y ha sido afinado para un conjunto de clases específico, mientras que los modelos genéricos de COCO cubren más categorías pero con menor precisión en clases concretas. No se pueden aportar cifras de rendimiento comparativas al no estar publicadas.

## Limitaciones y advertencias

- El modelo se entrenó con un conjunto de datos personalizado no documentado; su rendimiento puede degradarse significativamente en condiciones de iluminación, ángulos de cámara o tipos de vehículos no representados en el entrenamiento.
- El recall es bajo (0.695), lo que implica que el modelo tiende a omitir detecciones (falsos negativos). Para aplicaciones críticas, se recomienda ajustar el umbral de confianza o combinar con otros métodos.
- La licencia AGPL-3.0 impone obligaciones de copyleft: si el modelo se utiliza como parte de un servicio ofrecido a través de una red, el código fuente completo debe ponerse a disposición de los usuarios.
- No se han reportado sesgos específicos, pero al ser un modelo de visión, puede presentar errores en clases poco representadas (por ejemplo, auto-rickshaw) o en contextos geográficos diferentes al de entrenamiento.
- No se incluyen pesos cuantizados ni formatos optimizados para producción; el archivo `best.pt` es el único artefacto disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Madan11/two-wheeler-detector
- Repositorio GitHub: https://github.com/MadanBelbase/Two-wheeler-detector-model
- Releases en GitHub: https://github.com/MadanBelbase/Two-wheeler-detector-model/releases
