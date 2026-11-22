# ReNothingg/drone-studio

## Resumen

Ястраб (Yastrab) es un detector de objetos basado en YOLOv8s, desarrollado por ReNothingg como parte de su proyecto de investigación «Автономный перехватчик БПЛА» (interceptor autónomo de drones). El modelo está diseñado para detectar drones (cuadricópteros) desde una cámara terrestre que apunta al cielo, en un contexto de defensa anti-UAV. El problema que aborda es la detección de objetos extremadamente pequeños (a menudo de unos 10 píxeles en el fotograma) sobre fondos complejos, donde aves y aviones pueden confundirse con drones.

El modelo emplea una arquitectura convolucional YOLOv8s de 11,1 millones de parámetros con entrada de 640 px, y se distribuye a través de la librería Ultralytics. Se entrenó en un servidor con H100 durante 1,5 horas (40 épocas sobre 21.071 imágenes de tres conjuntos de datos: DUT Anti-UAV, Halmstad y Anti-UAV300), con un coste total de aproximadamente 45 dólares. El repositorio incluye varias variantes (Ястраб, Беркут, Ястраб-Studio, perfil de observación) y archivos JSON con sumas de verificación, umbrales de confianza calibrados y resultados de test.

La relevancia del modelo radica en su enfoque especializado: frente a soluciones universales, el autor demuestra que una red entrenada específicamente para una tarea y tipo de grabación puede superar a alternativas genéricas. El modelo declara un mAP@0,5 medio de 0,914 en tres tests independientes, con un tiempo de inferencia de 13 ms por fotograma en un Apple M5. La licencia AGPL-3.0 y el soporte exclusivo del idioma ruso en la documentación son factores a considerar para su adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (red convolucional con base, neck multi-escala y cabeza de detección) |
| Parametros totales | 11,1 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 640 × 640 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (documentación y model card) |
| Licencia | AGPL-3.0 |
| Formato de pesos | .pt (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

Ястраб es una red convolucional YOLOv8s compuesta por tres partes: una base que comprime el fotograma de 640 × 640 en mapas de características; un neck que conecta mapas de tres escalas para detectar tanto drones pequeños (16 px) como grandes (100 px); y una cabeza que, para cada celda de las rejillas 80 × 80, 40 × 40 y 20 × 20, predice la presencia de dron y cuatro distancias a los lados de la caja. La supresión de cajas superpuestas se realiza mediante NMS con IoU 0,55.

El entrenamiento se llevó a cabo durante 40 épocas sobre 21.071 imágenes procedentes de tres conjuntos: DUT Anti-UAV (5.200 entrenamiento, 2.600 validación, 2.199 test), Halmstad Drone Dataset (6.295 / 1.346 / 1.340) y Anti-UAV300 (4.377 / 946 / 2.147), más un complemento de 1.330 imágenes con fondos complejos y drones pequeños. Se incluyeron 3.869 imágenes con drones recortados de 7-40 px pegados para que la red aprendiera objetivos pequeños. La aumentación de datos incluyó mosaico de 4 imágenes, variación de color y brillo, rotación, escala y volteo. El autor verificó los datos: eliminó un fotograma duplicado entre train y test de DUT, repartió de nuevo 26 sesiones de grabación de Anti-UAV300 que estaban mezcladas, y descartó 83 imágenes de Halmstad con drones visibles pero no etiquetados. El umbral de confianza calibrado es 0,335, seleccionado por máximo F1 en validación.

## Capacidades

- Detección de objetos en imágenes: localización de drones (cuadricópteros) mediante cajas delimitadoras con coordenadas y puntuación de confianza.
- Detección de objetos pequeños: entrenado específicamente para objetivos de 7-40 px, con neck multi-escala para cubrir tamaños de 16 a 100 px.
- Discriminación frente a falsos positivos: el perfil de observación incorpora una red verificadora MobileNetV3 y datos de FRED y fondos complejos de Open Images, reduciendo las falsas alarmas de 90 a 11.
- Funcionamiento en vídeo: pensado para integración con un tracker que sigue al dron fotograma a fotograma (el código del complejo está en GitHub).
- Variante para simulador: Ястраб-Studio, ajustado sobre 3.070 fotogramas de la escena 3D Drone Studio.
- Variante de mayor resolución: Беркут, ajustado con entrada de 960 px.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un detector visual, no un modelo de lenguaje).

## Casos de uso

- Vigilancia anti-UAV en infraestructuras críticas: el modelo detecta drones en el cielo desde una cámara terrestre fija, con un mAP@0,5 de 0,959 en Anti-UAV300 (día y noche), adecuado para sistemas de alerta temprana en aeropuertos, plantas industriales o recintos penitenciarios.
- Intercepción autónoma de drones: integrado con un tracker y una plataforma de lanzamiento, el detector alimenta la cadena de seguimiento y apuntado; el autor lo emplea en un interceptor que dispara bolas de agua, con inferencia de 13 ms por fotograma en M5.
- Protección de perímetros con falsos positivos controlados: el perfil de observación, con la red verificadora MobileNetV3 y fondos complejos, reduce las falsas alarmas de 90 a 11, lo que lo hace apto para despliegues donde las aves y aviones generan confusión.
- Simulación y entrenamiento de sistemas: la variante Ястраб-Studio, ajustada sobre 3.070 fotogramas de una escena 3D, permite probar pipelines de detección y seguimiento en un simulador antes de desplegar en hardware real.
- Detección de drones pequeños en imágenes de alta resolución: la variante Беркут, con entrada de 960 px, mejora en DUT Anti-UAV (0,944) para escenarios donde el dron ocupa pocos píxeles y se dispone de más resolución.
- Investigación en detección de objetos pequeños: el repositorio incluye pesos, sumas de verificación, umbrales calibrados y resultados por conjunto, lo que facilita la reproducibilidad y la comparación con otras aproximaciones en publicaciones académicas.
- Análisis forense de vídeo: el modelo puede procesar grabaciones aéreas o de vigilancia para localizar drones en fotogramas concretos, con la ventaja de su bajo coste computacional (11,1 M de parámetros) frente a detectores más pesados.

## Benchmarks y rendimiento

Resultados declarados por el autor (mAP@0,5, no verificados de forma independiente). Tiempo por fotograma medido en Apple M5.

| Modelo | DUT Anti-UAV | Halmstad | Anti-UAV300 | Media | ms |
|---|---:|---:|---:|---:|---:|
| Бусел | 0,899 | 0,011 | 0,822 | 0,577 | 8 |
| Сокал | 0,888 | 0,839 | 0,971 | 0,899 | 8 |
| Арол | 0,930 | 0,807 | 0,959 | 0,899 | 17 |
| **Ястраб** | **0,928** | **0,856** | **0,959** | **0,914** | **13** |
| Беркут | 0,944 | 0,783 | 0,952 | 0,893 | 25 |
| drone-yolov8 (tercero) | 0,242 | 0,012 | 0,476 | 0,243 | no disponible |
| flying-objects (tercero) | 0,148 | 0,007 | 0,071 | 0,075 | no disponible |

El autor reporta además que variantes más pesadas (YOLOv8m y una red con cabeza P2 a 1280 px) alcanzaron 0,946 y 0,963 en DUT, pero bajaron a 0,808 y 0,774 en Halmstad. Añadir 48.000 imágenes de 23 conjuntos abiertos redujo 5 puntos en Halmstad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 11,1 M de parámetros y entrada de 640 px, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el autor entrenó en una H100 (1,5 horas, 40 épocas); para inferencia, cualquier GPU consumer moderna es suficiente. El tiempo de 13 ms por fotograma se midió en un Apple M5 (CPU/GPU integrada).
- Cabe en GPU consumer: sí, por tamaño (11,1 M de parámetros) y por el formato .pt de Ultralytics; no se especifican modelos concretos de GPU consumer en la información disponible.
- Opciones de despliegue: Ultralytics (librería nativa, formato .pt); no se detallan otras opciones como vLLM, llama.cpp u Ollama (no aplicables a un detector visual). El código del complejo completo está en GitHub (track_drone).
- Latencia y throughput: 13 ms por fotograma en Apple M5 para Ястраб; 8 ms para Сокал y Бусел; 17 ms para Арол; 25 ms para Беркут. No se reporta throughput en imágenes por segundo para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | mAP@0,5 medio (3 tests) | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| Ястраб | 11,1 M | 640 px | 0,914 | AGPL-3.0 | Hugging Face (ReNothingg/drone-studio) |
| Беркут | no disponible | 960 px | 0,893 | AGPL-3.0 | Hugging Face (misma repo) |
| Сокал | no disponible | no disponible | 0,899 | AGPL-3.0 | Hugging Face (misma repo) |
| drone-yolov8 | no disponible | no disponible | 0,243 | no disponible | Tercero (referenciado en la model card) |
| flying-objects | no disponible | no disponible | 0,075 | no disponible | Tercero (referenciado en la model card) |

No se dispone de datos de parámetros, contexto ni licencia de los modelos de terceros comparados; la comparación se limita a los resultados declarados por el autor en los tres tests.

## Limitaciones y advertencias

- Sesgos y generalización limitada: el modelo rinde de forma muy desigual según el tipo de grabación; por ejemplo, Бусел obtiene 0,899 en DUT pero solo 0,011 en Halmstad, lo que evidencia una fuerte dependencia de la distribución de los datos de entrenamiento.
- Riesgo de falsos positivos: aves, aviones y helicópteros se parecen a los drones; el autor reporta que el perfil de observación reduce las falsas alarmas de 90 a 11, pero no las elimina.
- Riesgo de falsos negativos en objetivos muy pequeños: aunque se entrenó con drones de 7-40 px, la detección de objetos de ~10 px sigue siendo intrínsecamente difícil y depende de la resolución y la calidad de la cámara.
- Limitación de idioma: la documentación y la model card están en ruso; no hay soporte declarado para otros idiomas.
- Restricciones de licencia: AGPL-3.0 implica que cualquier uso modificado o servicio en red basado en el modelo debe distribuirse bajo la misma licencia, lo que puede ser incompatible con productos comerciales cerrados.
- Resultados no verificados: los benchmarks del model-index tienen `verified: false`; son datos declarados por el autor y no han sido reproducidos de forma independiente.
- Contexto de uso sensible: el modelo forma parte de un proyecto de intercepción de drones; su uso debe cumplir la normativa local sobre espacio aéreo, privacidad y armamento.
- Sin datos de cuantización ni de despliegue en producción más allá de Ultralytics; no se documentan latencias en GPU ni throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ReNothingg/drone-studio
- Código del complejo (track_drone): https://github.com/ReNothingg/track_drone
- Dataset DUT Anti-UAV: https://github.com/wangdongdut/DUT-Anti-UAV
- Dataset Halmstad Drone Dataset: https://github.com/DroneDetectionThesis/Drone-detection-dataset
- Dataset Anti-UAV300: https://github.com/ZhaoJ9014/Anti-UAV
- Dataset FRED (referenciado en tags): https://huggingface.co/datasets/GabrieleMagrini/FRED
