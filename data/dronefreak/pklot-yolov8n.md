# dronefreak/pklot-yolov8n

## Resumen

pklot-yolov8n es un detector de objetos YOLOv8n (variante nano de Ultralytics) afinado por el usuario dronefreak sobre el conjunto de datos PKLot, un benchmark clásico de ocupación de plazas de aparcamiento en imágenes aéreas de parkings. El modelo resuelve una tarea de detección densa con dos clases: `vacant` (plaza libre) y `occupied` (plaza ocupada). Se publica como parte de DetectionBench, un marco de trabajo del mismo autor orientado a comparar detectores modernos bajo recetas de entrenamiento y métricas de evaluación idénticas.

La relevancia del modelo es doble. Por un lado, ofrece un detector extremadamente ligero (3,02 M de parámetros según los pesos en safetensors, 3,2 M según la model card) con un coste computacional de 8,7 GFLOPs a 640 px, lo que lo hace apto para despliegue en hardware modesto o en el borde. Por otro, sus métricas declaradas sobre el split de test de PKLot son muy altas (mAP@50 de 99,42 %, mAP@50-95 de 94,85 %), lo que lo convierte en un punto de referencia útil para tareas de ocupación de plazas.

El modelo es una finetune de Ultralytics/YOLOv8, se distribuye bajo licencia AGPL-3.0 y se publica con el formato de pesos propio de Ultralytics (`best.pt`), además de incluir artefactos de entrenamiento y evaluación (curvas PR/F1, matrices de confusión, `results.csv`, `args.yaml`). No se especifican idiomas porque la tarea es puramente visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (CNN de detección de una etapa, familia Ultralytics YOLO) |
| Parametros totales | 3.021.638 (safetensors); la model card indica 3,2 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales; el framework Ultralytics permite exportar a ONNX, TensorRT, OpenVINO, etc.) |
| Idiomas soportados | no disponible (no aplica; tarea de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `best.pt` (PyTorch/Ultralytics); repo con safetensors y artefactos de evaluación |
| Tarea | Detección de objetos (object-detection) |
| Clases | `vacant`, `occupied` |
| Resolución de entrenamiento | 960 px |
| FLOPs | 8,7 B a 640 px |
| Framework | Ultralytics YOLO |
| Dataset | PKLot (`dronefreak/PKLot`) |

## Arquitectura y entrenamiento

YOLOv8n es la variante nano de la familia YOLOv8 de Ultralytics: una red convolucional de detección de una etapa con cuello PAN-FPN y cabezal de predicción desacoplado (clasificación y regresión separadas), entrenada de extremo a extremo con asignación dinámica de etiquetas. Al ser la variante más pequeña de la familia, prioriza latencia y huella de memoria sobre capacidad representacional, lo que encaja con tareas de detección densa y repetitiva como la ocupación de plazas.

El ajuste fino se realizó con la herramienta DetectionBench del autor, con una configuración documentada: 60 épocas configuradas y 60 efectivamente ejecutadas, paciencia de early stopping de 15, batch automático (Ultralytics AutoBatch), tamaño de imagen 960, optimizador AdamW con learning rate inicial 0,001 y semilla 0. No se documentan en la información disponible el número de tokens (no aplica), la composición exacta del dataset ni si hubo técnicas de aumento específicas más allá del pipeline estándar de Ultralytics. No se menciona RLHF ni DPO, lo cual es esperable en un detector visual.

## Capacidades

- Detección de objetos en imágenes de parkings con dos clases: plaza vacía (`vacant`) y plaza ocupada (`occupied`).
- Detección densa: adecuado para escenas con muchas instancias pequeñas y próximas entre sí (plazas contiguas).
- Inferencia sobre imágenes individuales y lotes mediante la API de Ultralytics (`model.predict`).
- Exportación a otros formatos de despliegue a través del ecosistema Ultralytics (ONNX, TensorRT, OpenVINO, CoreML, entre otros), aunque no se documentan en la model card.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente perceptivo.
- No tiene capacidades multilingües, de texto, audio ni visión generativa; solo detección visual.
- No dispone de modo "thinking" ni capacidades especiales de razonamiento.

## Casos de uso

- Gestión de ocupación de parkings en tiempo real: el modelo detecta plazas libres y ocupadas en cada fotograma de una cámara fija; con 3,2 M de parámetros y 8,7 GFLOPs puede ejecutarse a alta frecuencia en una GPU de gama baja o incluso en CPU.
- Señalización dinámica de plazas libres: integrado en un panel o aplicación móvil, el detector alimenta un recuento de plazas disponibles por zona, adecuado por su alta precisión (99,49 %) y recall (98,68 %) en el dominio PKLot.
- Analítica histórica de uso de aparcamientos: procesamiento por lotes de imágenes archivadas para estimar curvas de ocupación por franja horaria; la naturaleza ligera del modelo permite reprocesar grandes volúmenes con coste bajo.
- Vigilancia de zonas reservadas o de carga y descarga: al distinguir `occupied` de `vacant`, puede alertar de vehículos estacionados en plazas no autorizadas si se combina con una máscara de región de interés.
- Despliegue en el borde (edge): al caber en dispositivos con poca VRAM y permitir exportación a formatos optimizados, es viable en cámaras inteligentes o mini-PCs junto a la infraestructura del parking.
- Base para fine-tuning en dominios similares: sirve como punto de partida para adaptar la detección de ocupación a otros parkings o a otras clases (por ejemplo, motos, plazas para discapacitados) con pocas épocas de ajuste.
- Investigación reproducible: al formar parte de DetectionBench, se puede usar como referencia para comparar recetas de entrenamiento y métricas bajo condiciones controladas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de PKLot (no verificados de forma independiente; `verified: false` en el model-index):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 99,42 |
| mAP@50-95 | 94,85 |
| Precision | 99,49 |
| Recall | 98,68 |
| F1 | 99,08 |

Rendimiento por clase (declarado por el autor):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| vacant | 99,48 | 96,94 |
| occupied | 99,35 | 92,76 |

Comparativa dentro del zoo de modelos de DetectionBench sobre PKLot (datos de la model card):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO11n | 99,42 | 94,99 | 99,78 | 99,92 |
| YOLO26n | 99,42 | 94,60 | 99,66 | 99,37 |
| **YOLOv8n (este modelo)** | **99,42** | **94,85** | **99,49** | **98,68** |
| YOLO26m | 99,41 | 94,92 | 99,60 | 99,64 |
| YOLOv8s | 99,33 | 95,33 | 99,50 | 96,18 |
| YOLO26s | 99,31 | 94,32 | 99,52 | 92,31 |
| RF-DETR Nano | 98,93 | 91,63 | 99,66 | 99,81 |
| YOLOv8m | 98,41 | 95,40 | 99,55 | 97,67 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 3,2 M de parámetros, el modelo ocupa del orden de decenas de MB en FP32 y menos aún en FP16, además de la memoria de activaciones, que depende de la resolución de entrada (entrenado a 960 px).
- GPU recomendadas: cualquier GPU moderna es suficiente; para producción a alta frecuencia se recomiendan GPU de gama media como RTX 3060/4060, T4, L4 o superiores (A100/H100 no son necesarias para este tamaño).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con suficiente memoria para el lote y la resolución; también es viable en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: Ultralytics (PyTorch) de forma nativa; exportación a ONNX, TensorRT, OpenVINO o CoreML a través del propio framework. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que no aplican a un detector visual.
- Latencia y throughput: no disponibles en la información proporcionada; los 8,7 GFLOPs a 640 px permiten estimar un coste bajo, pero no se publican medidas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@50 (PKLot) | mAP@50-95 (PKLot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pklot-yolov8n | 3,02 M | imagen 960 px (entrenamiento) | 99,42 | 94,85 | AGPL-3.0 | Hugging Face |
| YOLO11n (DetectionBench) | no disponible | no disponible | 99,42 | 94,99 | no disponible | dentro de DetectionBench |
| YOLOv8s (DetectionBench) | no disponible | no disponible | 99,33 | 95,33 | no disponible | dentro de DetectionBench |
| RF-DETR Nano (DetectionBench) | no disponible | no disponible | 98,93 | 91,63 | no disponible | dentro de DetectionBench |

La comparativa se limita al zoo de DetectionBench publicado por el autor; no se dispone de datos de parámetros, contexto ni licencia de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se ha entrenado exclusivamente con PKLot, por lo que su rendimiento puede degradarse en parkings con condiciones de iluminación, ángulos de cámara, clima o resoluciones distintas a las del dataset.
- Riesgo de falsos positivos y negativos: aunque las métricas declaradas son altas, no han sido verificadas de forma independiente (`verified: false`); conviene validar en el dominio de despliegue antes de producción.
- Limitación de clases: solo detecta `vacant` y `occupied`; no distingue tipos de vehículo ni plazas reservadas, y no detecta objetos fuera de esas dos clases.
- Limitación de contexto e idioma: no aplica, al ser un modelo de visión sin capacidades de texto.
- Licencia AGPL-3.0: el uso comercial requiere cumplir las obligaciones de copyleft de la AGPL, lo que puede condicionar su integración en productos propietarios o servicios en red; conviene revisar con asesoría legal.
- Dependencia del framework: los pesos están en formato `best.pt` de Ultralytics, lo que ata el uso a esa librería o a procesos de exportación previos.
- Caveat de producción: no se documentan latencias, curvas de rendimiento por resolución ni pruebas en hardware concreto; es necesario medir el throughput real en el entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/pklot-yolov8n
- Dataset PKLot en Hugging Face: https://huggingface.co/datasets/dronefreak/PKLot
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base Ultralytics YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
