# CanelE452/pallet-pose-yolo26m-ft

## Resumen

El modelo `CanelE452/pallet-pose-yolo26m-ft` es un detector de palets con estimación de pose 6-DoF basado en la arquitectura YOLO26m de Ultralytics. Desarrollado por el usuario CanelE452, está diseñado específicamente para su despliegue en carretillas elevadoras (forklifts) en entornos industriales. El modelo toma una única imagen RGB y devuelve una caja delimitadora junto con 9 puntos clave (keypoints) que, mediante una resolución PnP posterior, permiten recuperar la posición y orientación completa del palet (yaw, desplazamiento lateral y distancia frontal).

Se trata de la variante media (23,6 millones de parámetros) de un proyecto que también incluye una versión nano (2,7 millones de parámetros). El modelo fue inicialmente preentrenado con 73.916 imágenes sintéticas y posteriormente afinado (fine-tuning) con imágenes de fondo reales de la cámara de despliegue para corregir un problema estructural de falsos positivos. Aunque el autor señala que la variante media no es estadísticamente superior a la nano en precisión, ofrece mejor rendimiento en el caso típico y mayor margen para futuros ajustes. El modelo está publicado bajo licencia AGPL-3.0 y está orientado a aplicaciones robóticas de automatización de almacenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26m (pose estimation con detección de objetos y keypoints) |
| Parametros totales | 23,6 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (no se especifican en la documentación) |
| Idiomas soportados | no disponible (modelo de visión, sin soporte de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (probablemente .pt de Ultralytics, pero no se indica explícitamente) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO26m de Ultralytics, una red neuronal convolutional de una sola etapa (single-stage) que combina detección de objetos y estimación de keypoints. La entrada es una imagen RGB de 640×480 píxeles (aunque el entrenamiento usa un tamaño de imagen de 640×640 tras el padding) y la salida consiste en una caja delimitadora y 9 keypoints que representan las esquinas y el centroide del palet.

El proceso de entrenamiento consta de dos fases. Primero, un preentrenamiento exclusivamente con 73.916 imágenes sintéticas que contenían siempre un palet. Este preentrenamiento generó un problema: el modelo nunca había visto escenas sin palets y, en vídeo real, clasificaba erróneamente las horquillas de la carretilla o vallas metálicas como palets. Para corregirlo, se realizó un fine-tuning añadiendo imágenes de fondo reales de la cámara de despliegue con etiquetas vacías. El entrenamiento utilizó un padding de 100 píxeles con reflexión (BORDER_REFLECT_101) para que los palets parcialmente recortados por el borde de la imagen fueran aprendibles, y se desactivó la aumentación de volteo horizontal (fliplr=0.0) debido a la asimetría izquierda-derecha en el orden de los keypoints.

## Capacidades

- Detección de palets en imágenes RGB, devolviendo una caja delimitadora por instancia.
- Estimación de 9 keypoints por palet: 8 correspondientes a las esquinas de las dos caras visibles y 1 al centroide.
- Recuperación de pose 6-DoF (posición y orientación) mediante un paso posterior de PnP (por ejemplo, SOLVEPNP_SQPNP con refineLM).
- Distinción entre la cara cercana a la cámara (índices 0-3) y la cara opuesta (índices 4-7), con el centroide en el índice 8.
- Robustez frente a palets parcialmente fuera del encuadre gracias al padding de 100 píxeles.
- Baja tasa de falsos positivos en escenas sin palets tras el fine-tuning (0% en el conjunto de prueba interno).
- Inferencia en tiempo real: 15,5 ms por frame en una RTX 3080 (para la variante media).

## Casos de uso

- **Navegación autónoma de carretillas elevadoras**: el modelo permite que una carretilla detecte y localice palets en tiempo real, calculando la distancia y orientación necesarias para la inserción de horquillas. Su latencia de 15,5 ms es adecuada para control en bucle cerrado.
- **Automatización de almacenes**: integración en sistemas de gestión de almacenes para inventariar palets automáticamente a partir de cámaras fijas, obteniendo su posición 6-DoF sin marcadores adicionales.
- **Robótica de manipulación**: un brazo robótico puede usar los keypoints para planificar la prensión de un palet, gracias a la correspondencia geométrica con el modelo 3D conocido del palet.
- **Inspección de calidad**: verificación de que los palets están correctamente colocados o alineados en estanterías, utilizando la estimación de pose para detectar desviaciones.
- **Sistemas de guiado para operarios**: asistencia visual en pantalla que superpone la pose estimada del palet para ayudar a conductores humanos en maniobras de carga.
- **Pruebas de concepto en investigación**: el modelo sirve como base para experimentos de fine-tuning con nuevos datos, ya que el autor proporciona instrucciones claras sobre el contrato de keypoints y las restricciones de aumentación.

## Benchmarks y rendimiento

El autor evaluó el modelo en un conjunto real de 161 frames anotados manualmente (excluidos del entrenamiento) y en una secuencia de despliegue de 911 frames. Los resultados se presentan en las siguientes tablas.

**Falsos positivos en frames sin palet (n=259, parte del conjunto de fine-tuning):**

| model | @0.05 | @0.10 | @0.25 | @0.40 |
|---|---|---|---|---|
| synthetic-only pretrain (nano) | 50.6% | 30.5% | 0.0% | 0.0% |
| **este modelo (medium ft)** | **0.0%** | **0.0%** | **0.0%** | **0.0%** |

**Evaluación en conjunto real held-out (n=161, nunca entrenado):**

| model | detección | error de keypoints (mediana) | error de keypoints (p90) |
|---|---|---|---|
| synthetic-only pretrain (nano) | 88.2% | 9.30 px | 28.41 px |
| nano finetune | 97.5% | 7.38 px | **26.75 px** |
| **este modelo (medium ft)** | 96.9% | **6.51 px** | 31.56 px |

El error de keypoints se mide como la distancia L2 mediana sobre keypoints visibles, en píxeles de la imagen original. En una comparación pareada sobre los 153 frames que ambos modelos detectan, el medium es más preciso en 87 frames y el nano en 66, con una diferencia mediana de -0,24 px (mejor el medium) pero una diferencia media de +1,48 px (peor el medium, debido a su cola de errores). La prueba de Wilcoxon da p = 0,14, lo que indica que la diferencia no es estadísticamente significativa.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la documentación. Dado el tamaño del modelo (23,6 M de parámetros), se puede estimar un consumo de memoria inferior a 2 GB en FP32, y menos de 1 GB en cuantización INT8, aunque estos valores no están confirmados.
- **GPU recomendadas**: el autor reporta una latencia de 15,5 ms por frame en una RTX 3080 (GPU de consumo de gama alta). Modelos como RTX 3060, RTX 4060 o superiores serían suficientes para inferencia en tiempo real.
- **Compatibilidad con GPU de consumo**: sí, el modelo es ligero y cabe en cualquier GPU moderna con al menos 4 GB de VRAM.
- **Opciones de despliegue**: al ser un modelo Ultralytics, se puede ejecutar con la librería `ultralytics` (Python), exportar a ONNX, TensorRT o CoreML, y desplegar en plataformas como vLLM (aunque no es un LLM, la inferencia se puede hacer con los runners de Ultralytics), o en edge devices como NVIDIA Jetson.
- **Latencia y throughput**: 15,5 ms por frame en RTX 3080 para la variante media (equivalente a ~64 FPS). La variante nano es más rápida (12,3 ms) y más ligera.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (error keypoints) | Latencia (RTX 3080) | Licencia |
|---|---|---|---|---|---|
| **pallet-pose-yolo26m-ft (este)** | 23,6 M | 640×480 | 6,51 px (mediana) | 15,5 ms | AGPL-3.0 |
| pallet-pose-yolo26n-ft (nano) | 2,7 M | 640×480 | 7,38 px (mediana) | 12,3 ms | AGPL-3.0 |
| synthetic-only pretrain (nano) | 2,7 M | 640×480 | 9,30 px (mediana) | no disponible | AGPL-3.0 |

La comparativa se limita a las variantes del mismo autor, ya que no se dispone de datos de otros modelos de estimación de pose de palets. El modelo medio ofrece una mediana de error ligeramente mejor que el nano, pero con una cola de errores más larga y una latencia mayor. La licencia AGPL-3.0 puede ser restrictiva para uso comercial cerrado.

## Limitaciones y advertencias

- **Contrato de inferencia obligatorio**: el modelo requiere un padding de 100 píxeles con `BORDER_REFLECT_101` en los cuatro lados de la imagen antes de la predicción, y hay que restar 100 a las coordenadas resultantes. Si no se respeta, el modelo produce resultados incorrectos.
- **Orden de keypoints dependiente de la cámara**: los índices 0-3 corresponden siempre a la cara que mira a la cámara, no a un lado fijo del palet físico. Esto puede confundir en aplicaciones donde la orientación del palet es crítica.
- **Prohibición de volteo horizontal**: si se realiza un fine-tuning adicional, no se debe activar la aumentación `fliplr`, ya que corrompe la correspondencia de los keypoints. Si se activa, hay que usar el mapeo `flip_idx` correcto.
- **Falsos positivos en escenas sin palets**: aunque el fine-tuning redujo la tasa de falsos positivos a 0% en el conjunto de prueba, este conjunto era parte del entrenamiento. El rendimiento en escenas completamente nuevas no está garantizado.
- **Dependencia de la cámara de despliegue**: el fine-tuning se realizó con imágenes de una cámara específica (640×480 BGR). Cambios de óptica, iluminación o resolución pueden degradar el rendimiento.
- **Licencia AGPL-3.0**: el uso comercial del modelo puede requerir la publicación del código fuente de las aplicaciones que lo integren, lo que puede ser un obstáculo para soluciones propietarias.
- **Sin soporte multilingüe ni de texto**: al ser un modelo de visión puro, no puede procesar instrucciones en lenguaje natural ni generar descripciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CanelE452/pallet-pose-yolo26m-ft
- Variante nano: https://huggingface.co/CanelE452/pallet-pose-yolo26n-ft
- Perfil del autor: https://huggingface.co/CanelE452
- Documentación de YOLO26 de Ultralytics: https://docs.ultralytics.com/models/yolo26
- Repositorio YOLO26 en GitHub: https://github.com/ultralytics/yolo26
- Página de YOLO26m Pose en Ultralytics Platform: https://platform.ultralytics.com/cato/yolo26/yolo26m-pose
