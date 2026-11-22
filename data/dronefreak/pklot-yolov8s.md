# dronefreak/pklot-yolov8s

## Resumen

YOLOv8s fine-tuned sobre PKLot es un detector de objetos especializado en la clasificación de ocupación de plazas de aparcamiento. Lo desarrolla el usuario dronefreak como parte de DetectionBench, un marco de trabajo para comparar detectores modernos bajo recetas de entrenamiento y métricas de evaluación idénticas. El modelo parte de los pesos preentrenados de Ultralytics/YOLOv8 y se ajusta sobre el conjunto de datos PKLot, que contiene imágenes de parkings con anotaciones de plazas libres y ocupadas.

La relevancia del modelo radica en su carácter reproducible y en su rendimiento medido: alcanza un mAP@50 del 99,33 % y un mAP@50-95 del 95,33 % en el split de test de PKLot, con una precisión del 99,5 % y un recall del 96,18 %. Con 11,16 millones de parámetros y 28,6 GFLOPs a 640 px, es un detector ligero, apto para despliegue en tiempo real sobre hardware modesto, orientado a sistemas de smart parking y vigilancia de infraestructuras.

A diferencia de los modelos de lenguaje, este es un modelo puramente de visión por computador, con dos clases de detección (vacant y occupied). Su publicación se enmarca en un zoo de modelos PKLot que incluye alternativas como YOLO11n, YOLO26n y RF-DETR Nano, lo que facilita la comparación directa entre arquitecturas bajo condiciones controladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (CNN, detección de objetos de una etapa) |
| Parametros totales | 11.156.406 (11,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen, 960 px en entrenamiento, 640 px en el cálculo de FLOPs) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión sin capacidades lingüísticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | best.pt (PyTorch, vía Ultralytics); repo con safetensors |
| Framework | Ultralytics YOLO |
| Tarea | Object detection |
| Clases | vacant, occupied |
| FLOPs | 28,6 B a 640 px |
| Dataset de entrenamiento | PKLot (dronefreak/PKLot) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOv8s de Ultralytics, una red neuronal convolucional de detección de objetos en una sola etapa con cabeza de predicción desacoplada y asignación dinámica de etiquetas. Se parte de los pesos preentrenados de Ultralytics/YOLOv8 y se realiza un fine-tuning sobre PKLot. Según la configuración declarada, el entrenamiento se llevó a cabo con el toolkit DetectionBench, con un máximo configurado de 60 épocas pero 41 épocas realmente ejecutadas, parada temprana con paciencia de 15, batch size automático (Ultralytics AutoBatch), tamaño de imagen de 960 px, optimizador AdamW, learning rate inicial de 0,001 y semilla 0.

No se detalla en la información disponible la composición exacta del dataset de entrenamiento (número de imágenes, resolución original ni particiones), más allá de que se trata de PKLot con las clases vacant y occupied. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o mecanismos de atención lineal, que no aplican a este tipo de arquitectura. El valor diferencial del modelo es la reproducibilidad: la receta de entrenamiento y la evaluación se estandarizan mediante DetectionBench, lo que permite comparaciones justas con otros detectores del mismo zoo.

## Capacidades

- Detección de objetos en imágenes de aparcamientos con dos clases: plaza vacía (vacant) y plaza ocupada (occupied).
- Detección densa: capaz de localizar simultáneamente múltiples plazas en una misma imagen, incluyendo escenas con gran número de instancias.
- Clasificación de ocupación por instancia, con cajas delimitadoras y puntuaciones de confianza.
- Inferencia sobre imágenes individuales y lotes mediante la API de Ultralytics (`model.predict`).
- Integración con el ecosistema Ultralytics: exportación a formatos de despliegue habituales del framework (no se detalla la lista exacta en la información disponible).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingües, al ser un modelo exclusivamente de visión.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Gestión de ocupación en aparcamientos en tiempo real: el modelo detecta plazas vacant y occupied sobre fotogramas de cámaras fijas, permitiendo calcular la tasa de ocupación por zona y actualizar paneles informativos. Su bajo coste computacional (28,6 GFLOPs a 640 px) lo hace apto para procesar múltiples cámaras en un solo servidor.
- Smart parking y aplicaciones de navegación: integración de las detecciones en un servicio que indique al conductor plazas libres cercanas, usando las coordenadas de las cajas para mapear cada plaza a una posición física del aparcamiento.
- Vigilancia de infraestructuras: monitorización de parkings de empresas, hospitales o centros comerciales para detectar ocupación anómala, vehículos mal estacionados o patrones de uso fuera de horario, aprovechando la precisión del 99,5 % para reducir falsos positivos.
- Automatización de auditorías de ocupación: procesamiento por lotes de imágenes históricas de PKLot o de capturas propias para generar estadísticas de uso a lo largo del tiempo, con la ventaja de que el modelo fue entrenado y evaluado con una receta reproducible.
- Sistemas de control de acceso y tarificación: combinación de las detecciones con lógica de negocio para verificar la ocupación de plazas reservadas o de pago, usando el recall del 96,18 % como referencia para dimensionar la revisión manual de casos dudosos.
- Despliegue en dispositivos de borde: al ser un modelo de 11,2 M de parámetros, puede ejecutarse en GPUs de consumo o en hardware embebido con aceleración, lo que permite procesar la cámara localmente sin enviar vídeo a la nube.
- Benchmarking de detectores: uso como referencia dentro de DetectionBench para comparar nuevas arquitecturas (YOLO11n, YOLO26, RF-DETR) bajo las mismas condiciones de entrenamiento y evaluación en PKLot.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de PKLot, con el pipeline estándar de DetectionBench (`detectionbench-evaluate`). Los valores están marcados como no verificados en el model-index.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 99,33 |
| mAP@50-95 | 95,33 |
| Precision | 99,5 |
| Recall | 96,18 |
| F1 Score | 97,81 |
| Parametros | 11,2 M |
| FLOPs | 28,6 B (a 640 px) |

Rendimiento por clase:

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| vacant | 99,46 | 97,7 |
| occupied | 99,19 | 92,96 |

Comparativa dentro del zoo de modelos PKLot de DetectionBench (resultados declarados por el autor):

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) |
|---|---|---|---|---|
| YOLO11n | 99,42 | 94,99 | 99,78 | 99,92 |
| YOLO26n | 99,42 | 94,6 | 99,66 | 99,37 |
| YOLOv8n | 99,42 | 94,85 | 99,49 | 98,68 |
| YOLO26m | 99,41 | 94,92 | 99,6 | 99,64 |
| YOLOv8s (este modelo) | 99,33 | 95,33 | 99,5 | 96,18 |
| YOLO26s | 99,31 | 94,32 | 99,52 | 92,31 |
| RF-DETR Nano | 98,93 | 91,63 | 99,66 | 99,81 |
| YOLOv8m | 98,41 | 95,4 | 99,55 | 97,67 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Para un modelo de 11,2 M de parámetros en FP32, la huella de pesos ronda las decenas de MB, por lo que la VRAM necesaria es muy reducida y queda dominada por el tamaño del batch y la resolución de entrada.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el modelo es apto para GPUs de consumo y de gama media; su despliegue en A100 o H100 sería sobredimensionado salvo para procesamiento masivo por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con al menos unos pocos GB de VRAM, aunque no se aportan cifras exactas.
- Opciones de despliegue: Ultralytics YOLO (PyTorch) mediante `model.predict`; el ecosistema Ultralytics permite exportar a otros formatos de despliegue, aunque la lista concreta no se detalla en la información disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El dato de 28,6 GFLOPs a 640 px sirve como referencia del coste computacional por imagen, pero no se publican medidas de latencia ni FPS.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 (%) | mAP@50-95 (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv8s (este modelo) | 11,2 M | 99,33 | 95,33 | AGPL-3.0 | Hugging Face (dronefreak/pklot-yolov8s) |
| YOLO11n | no disponible | 99,42 | 94,99 | no disponible | zoo DetectionBench |
| YOLO26n | no disponible | 99,42 | 94,6 | no disponible | zoo DetectionBench |
| YOLOv8n | no disponible | 99,42 | 94,85 | no disponible | zoo DetectionBench |
| RF-DETR Nano | no disponible | 98,93 | 91,63 | no disponible | zoo DetectionBench |
| YOLOv8m | no disponible | 98,41 | 95,4 | no disponible | zoo DetectionBench |

Los modelos comparables pertenecen al mismo zoo de PKLot evaluado por DetectionBench, lo que garantiza condiciones de evaluación homogéneas. YOLOv8s ocupa una posición intermedia: sus variantes nano (YOLO11n, YOLO26n, YOLOv8n) obtienen un mAP@50 ligeramente superior, mientras que YOLOv8m logra el mejor mAP@50-95 (95,4 %) a costa de un mayor tamaño. No se dispone de datos de parámetros ni licencia de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en plazas de aparcamiento con dos clases (vacant, occupied); no es un detector de propósito general ni reconoce otras categorías de objetos.
- Entrenado sobre PKLot, por lo que su rendimiento puede degradarse en dominios distintos: otras condiciones de iluminación, ángulos de cámara, tipos de vehículos, parkings con marcas viales diferentes o imágenes aéreas no representadas en el dataset.
- Riesgo de falsos negativos y positivos en escenas densas u ocluidas: el recall del 96,18 % implica que una fracción no desdeñable de plazas ocupadas podría no detectarse, lo que conviene tener en cuenta en aplicaciones críticas.
- El mAP@50-95 de la clase occupied (92,96 %) es notablemente inferior al de vacant (97,7 %), lo que sugiere mayor dificultad para localizar con precisión las plazas ocupadas.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados en el model-index; no se han validado de forma independiente en la información disponible.
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el código fuente derivado; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- No se documentan sesgos específicos ni composición demográfica del dataset; al tratarse de imágenes de parkings, los sesgos potenciales estarían ligados a la geografía, el tipo de vehículo y las condiciones de captura de PKLot.
- No se especifican limitaciones de resolución de entrada más allá del tamaño de entrenamiento (960 px) y del cálculo de FLOPs (640 px); el comportamiento fuera de ese rango no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/pklot-yolov8s
- Dataset PKLot en Hugging Face: https://huggingface.co/datasets/dronefreak/PKLot
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base Ultralytics YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
