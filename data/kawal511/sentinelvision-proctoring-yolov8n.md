# Kawal511/sentinelvision-proctoring-yolov8n

## Resumen

SentinelVision es un detector de objetos basado en YOLOv8n, la variante nano de la familia YOLOv8 de Ultralytics, fine-tuneado específicamente para el proctoring de exámenes en línea. El modelo, publicado en Hugging Face por Kawal511 (aunque el desarrollo original corresponde al repositorio SentinelVision de kcosteen), detecta seis clases relevantes en este dominio: libros, teléfonos móviles, auriculares, portátiles, personas y televisores. Su objetivo es resolver un problema concreto: el YOLOv8n pre-entrenado con COCO rinde muy mal en imágenes de webcam de exámenes, donde los teléfonos aparecen pequeños, oscuros y parcialmente ocluidos, alcanzando un F1 de solo 0,203 frente al 0,927 del modelo fine-tuneado.

El modelo se entrenó sobre un dataset de 25.173 imágenes de exámenes capturadas con webcam, procedente de Roboflow Universe (licencia CC BY 4.0), con una partición reorganizada por vídeo fuente para evitar fugas de datos. La arquitectura es la estándar de YOLOv8n, con el backbone congelado durante el fine-tuning para evitar el sobreajuste. El modelo está pensado para uso educativo y de investigación en proctoring automatizado, y sus propios autores advierten explícitamente de que no es adecuado para tomar decisiones sobre personas reales sin una validación exhaustiva en el entorno de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (nano) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (el ejemplo de uso carga un archivo .pt) |

## Arquitectura y entrenamiento

El modelo se basa en YOLOv8n, un detector de objetos de una sola etapa que utiliza una red troncal CSPDarknet modificada, un cuello PAN-FPN y una cabeza de detección anclada. Para este fine-tuning se partió de los pesos pre-entrenados `yolov8n.pt` y se congeló el backbone, actualizando únicamente las capas superiores. La decisión de congelar el backbone se justifica por el tamaño del dataset (25.173 imágenes): con un conjunto de este volumen, actualizar todas las capas tiende a memorizar en lugar de generalizar, mientras que las capas tempranas ya codifican características genéricas de bordes y texturas que conviene conservar.

El entrenamiento se realizó en una GPU de Kaggle. El dataset original, "Online-proctoring-system" de Roboflow Universe, presentaba una partición defectuosa: un único vídeo fuente suponía el 87% de los datos y el 100% de la validación y prueba. Para evitar métricas engañosas, se reagrupó la partición por vídeo fuente, de modo que la validación contiene personas que el modelo nunca ha visto durante el entrenamiento. El modelo final se seleccionó mediante un barrido de umbrales de confianza entre 0,05 y 0,95 sobre un split retenido de 1.822 imágenes, eligiendo 0,35 como umbral óptimo.

## Capacidades

- Detección de objetos en tiempo real para escenarios de proctoring: libros, teléfonos móviles, auriculares, portátiles, personas y televisores.
- Inferencia a alta velocidad gracias a la arquitectura YOLOv8n, adecuada para aplicaciones de vídeo en directo.
- Resolución de clases por nombre, no por índice: el modelo asigna `cell phone` a la clase 1, mientras que en COCO es la clase 67, por lo que el código debe buscar el nombre de la clase dinámicamente.
- No incluye capacidades de tool calling, generación de texto, razonamiento multimodal ni procesamiento de lenguaje natural; es exclusivamente un detector de objetos.
- Soporte nativo del ecosistema Ultralytics: integración con la API de Python, exportación a formatos como ONNX, TensorRT o CoreML, y compatibilidad con pipelines de vídeo.

## Casos de uso

- Proctoring de exámenes en línea: el modelo puede analizar el flujo de la webcam del estudiante en tiempo real para detectar la presencia de teléfonos, libros o auriculares, que son indicios de comportamiento irregular. Su baja latencia permite procesar cada fotograma sin interrumpir la experiencia del usuario.
- Investigación académica sobre supervisión automatizada: sirve como punto de partida para estudiar el impacto del fine-tuning de detectores en dominios visuales específicos, especialmente en condiciones de iluminación y calidad de imagen adversas.
- Desarrollo de sistemas de alerta temprana en entornos educativos: integrado en una aplicación como SentinelVision, puede generar avisos cuando se detectan objetos no permitidos, siempre con un humano en el circuito para evitar falsas acusaciones.
- Evaluación comparativa de técnicas de aumento de datos y regularización: al ser un modelo pequeño y rápido de entrenar, es útil para experimentar con estrategias de partición de datos, congelación de capas o ajuste de hiperparámetros en dominios con pocos datos.
- Demostración de transferencia de aprendizaje en visión por computador: el caso de uso documentado muestra cómo un modelo pre-entrenado en COCO puede adaptarse a una tarea especializada con un dataset moderado, y cómo las métricas de validación pueden no reflejar el rendimiento en el mundo real.
- Prototipado de aplicaciones de vigilancia con privacidad: al ejecutarse localmente en el dispositivo del usuario, evita enviar vídeo a servidores externos, lo que reduce los riesgos de privacidad en entornos sensibles.

## Benchmarks y rendimiento

La model card del autor proporciona una comparación directa entre el modelo pre-entrenado YOLOv8n (COCO) y este fine-tuning, evaluados con la misma implementación de AP/F1 sobre las mismas imágenes retenidas. Los resultados se midieron con un umbral de confianza de 0,35, seleccionado tras un barrido de 0,05 a 0,95. El 64% de las imágenes de validación no contienen ningún teléfono, por lo que la precisión se mide ante oportunidades reales de alucinación.

| Modelo | Precision | Recall | F1 |
|---|---:|---:|---:|
| YOLOv8n pre-entrenado (COCO) | 0,215 | 0,192 | 0,203 |
| SentinelVision (este modelo) | 0,910 | 0,944 | 0,927 |

No se han publicado resultados en benchmarks estándar como COCO o ImageNet para este modelo, ya que su evaluación se centra exclusivamente en el dominio de proctoring.

## Requisitos de hardware

- Al ser un modelo YOLOv8n (nano), es extremadamente ligero: puede ejecutarse en tiempo real en CPU (por ejemplo, un portátil moderno) y en GPU de gama baja.
- La VRAM estimada para inferencia en FP16 es inferior a 1 GB, por lo que cabe en cualquier GPU consumer (GTX 1060, RTX 2060, etc.) y en placas integradas con soporte CUDA.
- Para despliegue en producción, se recomienda usar el runtime de Ultralytics, que soporta exportación a TensorRT, ONNX y CoreML, o servidores de inferencia como Triton o TorchServe.
- La latencia típica en GPU (por ejemplo, una RTX 3060) es del orden de 1-3 ms por imagen a resolución 640x640; en CPU puede rondar los 20-50 ms, suficiente para aplicaciones de vídeo a 20-30 FPS.
- No se requieren GPUs de datacenter como A100 o H100; el modelo está pensado para entornos con recursos limitados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento en proctoring | Licencia |
|---|---|---|---|---|---|
| SentinelVision (este) | YOLOv8n | no disponible | no aplica | F1 0,927 en validacion propia | AGPL-3.0 |
| YOLOv8n COCO (pre-entrenado) | YOLOv8n | ~3,2M (segun Ultralytics) | no aplica | F1 0,203 en el mismo split | AGPL-3.0 |
| YOLOv5n (pre-entrenado COCO) | YOLOv5n | ~1,9M (segun Ultralytics) | no aplica | no evaluado en este dominio | AGPL-3.0 |

No se dispone de comparaciones con otros detectores fine-tuneados para proctoring en la informacion proporcionada. La comparativa se limita al modelo base COCO y a la alternativa YOLOv5n, que no ha sido evaluada en este dominio.

## Limitaciones y advertencias

- La precisión no se transfiere a una cámara desconocida: en 741 fotogramas sin teléfono de una webcam no vista durante el entrenamiento, el modelo activó `cell phone` en el 56,4% de ellos, siempre sobre el mismo objeto (una estantería con un teclado). Los rangos de confianza de ese falso positivo (0,60-0,71) se solapan con los de un teléfono real (0,72-0,79), por lo que ningún umbral los separa de forma fiable.
- Los teléfonos parcialmente visibles, sostenidos bajos o medio fuera de cuadro, se detectan con confianzas muy bajas (0,09-0,16), por debajo de cualquier umbral utilizable.
- El modelo no es adecuado para tomar decisiones sobre personas reales. Una falsa acusación de hacer trampa es un daño grave; cualquier despliegue real requiere consentimiento explícito, supervisión humana y validación en el entorno de despliegue.
- La licencia AGPL-3.0, heredada de Ultralytics YOLOv8, implica que si se utiliza en un servicio de red, las obligaciones de copyleft de AGPL se aplican al servicio completo.
- El dataset de entrenamiento es CC BY 4.0 y requiere atribución al dataset "Online Proctoring System" (workspace online-exam-cheating-detection, Roboflow Universe).
- La resolución de clases debe hacerse por nombre, nunca por índice, ya que el índice de clase difiere del de COCO y un índice hardcodeado falla silenciosamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kawal511/sentinelvision-proctoring-yolov8n
- Repositorio original en GitHub: https://github.com/kcosteen/SentinelVision
- Model card en el repositorio: https://github.com/kcosteen/SentinelVision/blob/main/docs/MODEL_CARD.md
- Documentacion de Ultralytics YOLOv8: https://docs.ultralytics.com/models/yolov8
- Tutorial de YOLOv8 en Colab: https://colab.research.google.com/github/Audacity126/ultralytics_YOLOv8/blob/master/examples/tutorial.ipynb/
