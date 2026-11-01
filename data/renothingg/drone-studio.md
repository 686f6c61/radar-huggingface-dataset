# ReNothingg/drone-studio

## Resumen

Yastrab (Ястраб) es un detector de drones en imágenes capturadas desde cámaras terrestres, desarrollado por el usuario ReNothingg como parte de su trabajo de investigación "Autonomous UAV Interceptor" (Interceptor autónomo de UAV). El modelo se basa en la arquitectura YOLOv8s de Ultralytics, con 11,1 millones de parámetros y una resolución de entrada de 640 píxeles, y está optimizado para detectar objetivos pequeños (drones que ocupan unos 10 píxeles en el encuadre) en fondos complejos donde aviones y aves pueden confundirse con el objetivo.

El proyecto resuelve un problema concreto y de nicho: la detección fiable de UAV en vídeo en tiempo real desde una cámara fija apuntando al cielo, como primer eslabón de un sistema de seguimiento y interceptación. El autor demuestra que un modelo especializado en una sola tarea puede superar a soluciones genéricas de detección de objetos en escenarios donde la precisión es crítica. Todo el entrenamiento se realizó con un presupuesto de unos 45 dólares, usando un portátil Apple M5 y una H100 alquilada durante hora y media.

El repositorio incluye varias variantes del modelo (Berkut, Yastrab-Studio, perfil de observación con red verificadoras MobileNetV3), los pesos en formato `.pt` de Ultralytics, archivos JSON con umbrales de confianza calibrados y resultados de test, y el código completo del sistema de interceptación en GitHub. Es relevante para desarrolladores e investigadores en visión por computador aplicada a anti-UAV, detección de objetos pequeños y sistemas de vigilancia de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv8s (Ultralytics), red convolucional con cuello multi-escala y cabeza de detección en 3 resoluciones (80×80, 40×40, 20×20) |
| Parametros totales | 11,1 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (documentación); el modelo procesa imágenes, no texto |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, formato Ultralytics) |

## Arquitectura y entrenamiento

Yastrab es una red convolucional dividida en tres bloques. La base comprime el fotograma de 640×640 en mapas de características. El cuello (neck) conecta mapas de 3 escalas para que tanto un dron pequeño de 16 píxeles como uno grande de 100 píxeles se detecten con la misma eficacia. La cabeza predice, para cada celda de las rejillas 80×80, 40×40 y 20×20, la presencia de un dron y las 4 distancias a los lados del bounding box. Las cajas solapadas de un mismo objetivo se eliminan con NMS (Non-Maximum Suppression) con un IoU de 0,55. El umbral de confianza se calibró en el conjunto de validación maximizando F1, quedando en 0,335.

El entrenamiento se realizó en una H100 durante 1,5 horas a lo largo de 40 épocas sobre 21.071 fotogramas procedentes de 3 conjuntos de datos: DUT Anti-UAV, Halmstad Drone Dataset y Anti-UAV300. Se incluyeron 3.869 fotogramas con drones recortados de 7-40 px de ancho incrustados artificialmente para reforzar la detección de objetivos pequeños. Se aplicó aumentación de datos aleatoria: mosaico de 4 imágenes, cambios de color y brillo, rotación, escala y volteo. El autor depuró los datos antes de entrenar: eliminó un fotograma duplicado entre train y test en DUT, redistribuyó 26 sesiones de grabación de Anti-UAV300 que aparecían en train y validación, y descartó 83 fotogramas de Halmstad con drones visibles pero sin anotar.

## Capacidades

- Detección de objetos (drones/UAV) en imágenes y vídeo desde cámara terrestre
- Detección de objetivos pequeños (hasta ~10-16 píxeles de ancho en el encuadre)
- Discriminación entre drones, aves, aviones y helicópteros (entrenado con Halmstad, que incluye estas clases)
- Funcionamiento en condiciones variadas de iluminación (día y noche, según Anti-UAV300)
- Inferencia en tiempo real: 13 ms por fotograma en Apple M5
- Variantes especializadas: Berkut (entrada de 960 px, mejor en DUT), Yastrab-Studio (entrenado sobre escenas 3D simuladas), perfil de observación con red verificadoras MobileNetV3 que reduce falsas alarmas de 90 a 11
- No soporta procesamiento de lenguaje natural, tool calling ni capacidades generativas

## Casos de uso

- **Sistemas anti-UAV de intercepción física**: el modelo detecta el dron en el fotograma, un tracker lo sigue en el tiempo y un mecanismo de apuntado (en el proyecto original, un lanzador que dispara bolas de agua) recibe las coordenadas. Es el caso de uso para el que fue diseñado.
- **Vigilancia perimetral con cámaras fijas**: integración en sistemas de seguridad que monitorizan espacios aéreos restringidos (aeropuertos, infraestructuras críticas, prisiones) detectando UAV no autorizados en tiempo real.
- **Investigación en detección de objetos pequeños**: el dataset mixto y las técnicas de aumentación con drones incrustados de 7-40 px sirven como referencia para quien trabaje en small object detection.
- **Simulación y entrenamiento en entornos virtuales**: la variante Yastrab-Studio, entrenada sobre 3.070 fotogramas de una escena 3D, permite probar sistemas de detección en simulador antes de desplegar hardware real.
- **Reducción de falsas alarmas en vigilancia continua**: el perfil de observación, que combina el detector con una red verificadoras MobileNetV3, es adecuado para operar 24/7 con pocas alertas falsas (11 frente a 90 de la versión base).
- **Despliegue en hardware de consumo o edge**: con 13 ms por fotograma en un portátil Apple M5 y 11,1 M de parámetros, el modelo es viable en portátiles, mini-PC o SBC para aplicaciones de vigilancia de bajo coste.
- **Comparación de estrategias de entrenamiento**: el repositorio documenta experimentos con YOLOv8m, cabezas P2 a 1280 px y adición de 48.000 fotogramas de 23 datasets abiertos, útil como estudio de cómo el tipo de datos afecta al rendimiento.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente). Métrica: mAP@0,5, en escala 0-1. Tiempo de inferencia medido en Apple M5.

| Modelo | DUT Anti-UAV | Halmstad | Anti-UAV300 | Media | ms/frame |
|---|---:|---:|---:|---:|---:|
| Busel (Бусел) | 0,899 | 0,011 | 0,822 | 0,577 | 8 |
| Sokal (Сокал) | 0,888 | 0,839 | 0,971 | 0,899 | 8 |
| Arol (Арол) | 0,930 | 0,807 | 0,959 | 0,899 | 17 |
| **Yastrab (Ястраб)** | **0,928** | **0,856** | **0,959** | **0,914** | **13** |
| Berkut (Беркут) | 0,944 | 0,783 | 0,952 | 0,893 | 25 |
| drone-yolov8 (tercero) | 0,242 | 0,012 | 0,476 | 0,243 | no disponible |
| flying-objects (tercero) | 0,148 | 0,007 | 0,071 | 0,075 | no disponible |

Conclusiones del autor: los modelos más grandes (YOLOv8m: 0,946 en DUT; cabeza P2 a 1280 px: 0,963 en DUT) mejoran en DUT pero empeoran en Halmstad (0,808 y 0,774 respectivamente). Añadir 48.000 fotogramas de 23 datasets abiertos redujo el rendimiento en Halmstad en 5 puntos. La conclusión principal es que la calidad y el tipo de datos de entrenamiento importan más que el tamaño del modelo o el volumen de datos heterogéneos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible explícitamente; con 11,1 M de parámetros en YOLOv8s, la inferencia es viable en GPUs con 2-4 GB de VRAM y en CPU para tasas de fotogramas bajas.
- **GPU recomendadas**: no requiere GPU dedicada para inferencia; el autor lo ejecuta a 13 ms/frame en un portátil Apple M5 (GPU integrada). Para entrenamiento se usó una NVIDIA H100 durante 1,5 horas.
- **Consumer GPU**: cabe con holgura en cualquier GPU moderna (RTX 3060, RTX 4090, etc.); también funciona en Apple Silicon sin GPU discreta.
- **Opciones de despliegue**: ecosistema Ultralytics (PyTorch, `.pt`); exportable a los formatos habituales de Ultralytics (ONNX, TensorRT, CoreML) aunque el repositorio solo distribuye `.pt`. No hay soporte de vLLM, llama.cpp ni Ollama (no es un LLM).
- **Latencia y throughput**: 13 ms por fotograma (~77 FPS) en Apple M5 con entrada de 640 px; la variante Berkut a 960 px requiere 25 ms (~40 FPS).

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | DUT mAP@0,5 | Halmstad mAP@0,5 | Anti-UAV300 mAP@0,5 | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Yastrab (este modelo) | 11,1 M | 640 px | 0,928 | 0,856 | 0,959 | AGPL-3.0 |
| YOLOv8n (genérico, referencia Ultralytics) | 3,2 M | 640 px | no disponible | no disponible | no disponible | AGPL-3.0 |
| YOLOv8s (genérico, referencia Ultralytics) | 11,2 M | 640 px | no disponible | no disponible | no disponible | AGPL-3.0 |
| RT-DETR (referencia, detección en tiempo real) | 20 M (RT-DETR-R18) | 640 px | no disponible | no disponible | no disponible | Apache-2.0 |

Nota: no se han publicado benchmarks comparativos directos de Yastrab frente a modelos genéricos de detección en estos datasets, salvo los modelos propios del autor y dos detectores de terceros (drone-yolov8 y flying-objects), que obtienen resultados muy inferiores (mAP medio 0,243 y 0,075).

## Limitaciones y advertencias

- **Licencia AGPL-3.0**: es una licencia copyleft fuerte. Cualquier obra derivada que se distribuya u ofrezca como servicio de red debe publicar el código fuente bajo la misma licencia. Esto puede ser restrictivo para uso comercial cerrado; conviene evaluar alternativas con licencia Apache-2.0 o licencias comerciales de Ultralytics si el caso de uso lo exige.
- **Resultados no verificados**: las métricas proceden del model-index declarado por el autor y están marcadas como `verified: false`. No hay evaluación independiente.
- **Especialización extrema**: el modelo está entrenado para detectar drones desde cámara terrestre en los 3 datasets citados. Su rendimiento en otros escenarios (otras cámaras, otros ángulos, otros tipos de UAV, condiciones meteorológicas extremas) no está documentado.
- **Riesgo de falsas alarmas**: aunque el perfil de observación las reduce (11 frente a 90), el modelo base genera falsos positivos en fondos complejos; aves y aviones son confundibles por naturaleza con drones.
- **Dependencia del dataset**: el propio autor demuestra que modelos entrenados en un solo tipo de grabación fallan estrepitosamente en otro (Busel: 0,011 en Halmstad). Cualquier despliegue debe validar con datos del dominio de destino.
- **Contexto de uso**: el proyecto original forma parte de un sistema de interceptación física de UAV. El despliegue de sistemas anti-UAV puede estar sujeto a regulación específica según jurisdicción.
- **Documentación en ruso**: la model card está escrita en ruso, lo que puede dificultar la revisión para quienes no dominen el idioma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReNothingg/drone-studio
- Código completo del sistema (GitHub): https://github.com/ReNothingg/track_drone
- Dataset DUT Anti-UAV: https://github.com/wangdongdut/DUT-Anti-UAV
- Dataset Halmstad Drone Detection: https://github.com/DroneDetectionThesis/Drone-detection-dataset
- Dataset Anti-UAV300: https://github.com/ZhaoJ9014/Anti-UAV
- Dataset FRED (usado en el perfil de observación): https://huggingface.co/datasets/GabrieleMagrini/FRED
