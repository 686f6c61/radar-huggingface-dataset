# Shubham12864/YOLO26n-face

## Resumen

YOLO26n-face es un modelo de detección de caras basado en la arquitectura YOLO26n de Ultralytics, desarrollado como proyecto de investigación de fin de grado por Shubham12864 (también publicado en GitHub bajo el usuario mrcahyono265). El modelo se obtiene mediante transfer learning desde el modelo base oficial de Ultralytics y se ajusta específicamente sobre el conjunto de datos WiderFace para reconocer caras en entornos con recursos limitados, como drones (UAV) y dispositivos embebidos.

Su relevancia radica en ofrecer una solución extremadamente ligera de detección facial en tiempo real, pensada para despliegue en hardware con restricciones de cómputo y memoria. Al ser una variante nano de YOLO26, prioriza la velocidad y el bajo consumo frente a la precisión absoluta, lo que lo hace adecuado para aplicaciones de edge computing, vigilancia móvil y robótica aérea. La licencia AGPL-3.0 permite su uso y modificación, aunque impone condiciones de copyleft para redistribuciones.

Actualmente el modelo tiene cero descargas y cero likes en HuggingFace, y la model card es mínima, por lo que la información técnica detallada (parámetros exactos, métricas de entrenamiento, rendimiento) no está disponible públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (variante nano de la familia YOLO26 de Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (probablemente PyTorch .pt, sin confirmar) |

## Arquitectura y entrenamiento

YOLO26n-face se basa en la arquitectura YOLO26n, la versión más pequeña de la familia YOLO26 de Ultralytics. YOLO26 es una arquitectura de detección de objetos en tiempo real que incorpora mejoras sobre generaciones anteriores, como un backbone optimizado, neck eficiente y head de detección sin anclas. Al ser la variante "n" (nano), el número de parámetros es reducido, aunque el valor exacto no se ha publicado en la información disponible.

El entrenamiento se realizó mediante transfer learning: se partió del modelo base YOLO26n preentrenado por Ultralytics y se fine-tuneó específicamente sobre el dataset WiderFace, un estándar de referencia para detección de caras en escenas no controladas. No se han publicado detalles sobre el número de épocas, el tamaño de lote, la configuración de hiperparámetros ni si se aplicaron técnicas de aumento de datos adicionales. Tampoco hay información sobre el uso de técnicas como cuantización posterior al entrenamiento o poda.

## Capacidades

- Detección de caras en imágenes y vídeo en tiempo real, con localización mediante bounding boxes.
- Optimizado para dispositivos con recursos limitados (drones, cámaras embebidas, Raspberry Pi).
- Inferencia a alta velocidad gracias a la arquitectura nano de YOLO26.
- Transfer learning desde el modelo base de Ultralytics, lo que permite un ajuste fino rápido sobre datos específicos.
- Compatible con el ecosistema Ultralytics (entrenamiento, validación, exportación a formatos como ONNX, TensorRT, etc.).
- No es un modelo de lenguaje ni multimodal; solo procesa imágenes.

## Casos de uso

- Vigilancia con drones: el modelo puede ejecutarse en la unidad de cómputo de un dron para detectar personas en tiempo real durante misiones de búsqueda y rescate, gracias a su bajo peso computacional.
- Control de acceso en dispositivos edge: integración en cámaras IP o sistemas de videoportero para detectar caras y activar alertas sin necesidad de conexión a la nube.
- Análisis de multitudes: procesamiento de vídeo en tiempo real para contar personas o identificar caras en espacios públicos, ejecutable en hardware modesto.
- Robótica asistencial: detección de caras para que robots interactúen con humanos, por ejemplo en entornos domésticos o de cuidado.
- Fotografía automática: sistemas de cámaras inteligentes que enfocan y capturan cuando se detecta una cara, con latencia mínima.
- Prototipos de investigación: base para experimentos de detección facial en entornos académicos, dado que es un proyecto de código abierto con licencia AGPL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de precisión (mAP, recall) ni comparaciones con otros detectores de caras en la model card de HuggingFace ni en el repositorio de GitHub accesible. Se recomienda consultar el proyecto original o ejecutar el modelo sobre un conjunto de validación propio para obtener datos de rendimiento.

## Requisitos de hardware

- Al ser una variante nano, se espera que pueda ejecutarse en CPUs convencionales y GPUs de gama baja, aunque no hay cifras oficiales de VRAM o latencia.
- Dado el diseño orientado a dispositivos con recursos limitados, es probable que funcione en plataformas como Raspberry Pi 4/5, Jetson Nano o similares, pero no se ha confirmado.
- El ecosistema Ultralytics permite exportar a formatos optimizados como ONNX, TensorRT y OpenVINO, lo que facilita el despliegue en edge.
- No hay datos de throughput o latencia medidos; se recomienda realizar pruebas propias en el hardware objetivo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de detección de caras (por ejemplo, YOLOv8n-face, SCRFD, RetinaFace). No hay datos públicos de parámetros, rendimiento o precisión de YOLO26n-face. Se puede afirmar que, por su naturaleza nano, será más ligero que modelos como RetinaFace (que suele requerir más recursos), pero no se pueden dar cifras concretas.

## Limitaciones y advertencias

- La model card es extremadamente escueta; no se documentan sesgos, limitaciones de precisión ni condiciones de uso específicas.
- Al ser un modelo de detección de caras, puede presentar errores en condiciones de iluminación adversa, oclusiones, ángulos extremos o rostros de baja resolución, aunque no se ha verificado en este caso.
- La licencia AGPL-3.0 implica que cualquier uso comercial o redistribución debe liberar el código fuente de la aplicación que lo integre bajo la misma licencia, lo que puede ser un obstáculo para productos propietarios.
- No hay garantías de soporte ni mantenimiento; es un proyecto académico con actividad limitada.
- No se han publicado métricas de rendimiento, por lo que no es posible evaluar su precisión frente a alternativas consolidadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shubham12864/YOLO26n-face
- Repositorio en GitHub: https://github.com/mrcahyono265/yolo26n-face
- README del repositorio: https://github.com/mrcahyono265/yolo26n-face/blob/main/README.md
- Documentación de YOLO26 de Ultralytics: https://docs.ultralytics.com/models/yolo26
- Modelo base de Ultralytics en HuggingFace: https://huggingface.co/Ultralytics/YOLO26
- Plataforma Ultralytics (proyecto YOLO26 Face): https://platform.ultralytics.com/saaketh-sodanapalli/yolo26-face/yolo26n-face
