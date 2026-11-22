# dronefreak/brackish-yolov8s

## Resumen

`dronefreak/brackish-yolov8s` es un detector de objetos YOLOv8s afinado por el usuario dronefreak sobre el conjunto de datos Brackish Underwater, un benchmark de imágenes submarinas de agua salobre. El modelo parte de los pesos preentrenados de Ultralytics YOLOv8 y se entrena y evalúa dentro de DetectionBench, un framework creado por el mismo autor para comparar detectores modernos con recetas de entrenamiento y métricas de evaluación idénticas.

La relevancia del modelo es doble. Por un lado, ofrece un detector especializado en seis clases marinas (cangrejo, pez, medusa, camarón, pez pequeño y estrella de mar) con un rendimiento declarado muy alto en el split de test del propio benchmark: 99,3 % de mAP@50 y 85,65 % de mAP@50-95. Por otro, su valor principal es metodológico: al formar parte de un zoo de modelos entrenados con la misma configuración, permite comparar de forma justa arquitecturas como YOLOv8, YOLO11 y YOLO26 en el mismo dominio.

Con 11,2 millones de parámetros y 28,6 GFLOPs a 640 píxeles, es un modelo pequeño y ligero, pensado para inferencia en tiempo real en entornos con recursos limitados. No es un modelo de lenguaje ni un modelo multimodal: es un detector de objetos puro basado en la librería Ultralytics, con pesos en formato PyTorch (`.pt`) y licencia AGPL-3.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv8s (CNN de detección de objetos en una etapa, familia Ultralytics YOLO) |
| Parámetros totales | 11.157.954 (11,2 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen a 640 px) |
| Tipos de cuantización | no disponible en la información proporcionada (los pesos se distribuyen en `.pt`; la cuantización dependería de la cadena de exportación de Ultralytics) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, archivo `best.pt`); el repo incluye además `results.csv`, `args.yaml` y curvas de precisión-recall |
| Cómputo por inferencia | 28,6 GFLOPs a 640 px |
| Tarea | Detección de objetos (object-detection) |
| Clases | crab, fish, jellyfish, shrimp, small_fish, starfish |
| Modelo base | Ultralytics/YOLOv8 (fine-tune) |
| Framework | Ultralytics YOLO |
| Dataset de entrenamiento | dronefreak/Brackish (Brackish Underwater) |

## Arquitectura y entrenamiento

El modelo es un YOLOv8s, la variante "small" de la familia YOLOv8 de Ultralytics. Se trata de una red neuronal convolucional de detección en una sola etapa, con un backbone tipo CSPDarknet y una cabeza de detección anclaje-libre (anchor-free) que predice directamente cajas y clases. No emplea mecanismos de atención tipo transformer ni arquitecturas híbridas; es un detector convolucional clásico optimizado para latencia baja. Con 11,2 M de parámetros y 28,6 GFLOPs a 640 px, se sitúa en el rango ligero de la familia.

El entrenamiento se realizó con el toolkit DetectionBench, que estandariza la receta para que las comparaciones entre modelos sean reproducibles. La configuración declarada incluye un máximo de 500 épocas (efectivamente entrenadas 500), paciencia de early stopping de 100, batch size 32, tamaño de imagen 640, optimizador automático, learning rate inicial de 0,001 y semilla 0. El conjunto de datos es Brackish Underwater, con seis clases marinas. No se especifica en la información disponible el número de tokens (no aplica), la composición exacta del dataset ni si hubo aumentos de datos más allá de los predefinidos por Ultralytics. Tampoco se documenta el uso de RLHF/DPO, algo que no aplica a un detector de objetos.

## Capacidades

- Detección de objetos en imágenes submarinas de agua salobre para seis clases: cangrejo, pez, medusa, camarón, pez pequeño y estrella de mar.
- Localización con cajas delimitadoras y puntuaciones de confianza por clase.
- Inferencia en tiempo real gracias a su tamaño reducido (11,2 M de parámetros, 28,6 GFLOPs a 640 px).
- Integración con la librería Ultralytics: carga mediante `YOLO(weights)` y predicción con `model.predict(source=..., conf=...)`.
- Exportación a otros formatos (ONNX, TensorRT, etc.) a través de las utilidades de Ultralytics, aunque no se documenta en la información proporcionada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo "thinking", visión multimodal, audio ni generación de texto.

## Casos de uso

- Monitorización de ecosistemas de agua salobre: el modelo puede procesar imágenes de cámaras subacuáticas para contar cangrejos, peces y estrellas de mar, y detectar cambios en la fauna a lo largo del tiempo. Su mAP@50-95 de 85,65 % en el benchmark lo hace adecuado para inventarios automatizados.
- Acuicultura y piscifactorías: detección de peces y camarones para estimar densidad de población, detectar mortalidad o comportamientos anómalos, con inferencia en tiempo real en GPUs de gama media.
- Investigación marina con ROVs y drones submarinos: integración del detector en vehículos no tripulados para censos de medusas y peces pequeños, aprovechando su bajo coste computacional (28,6 GFLOPs) para ejecución a bordo.
- Análisis de vídeo de cámaras trampa subacuáticas: procesamiento por lotes de grabaciones para etiquetar automáticamente fragmentos con presencia de especies, reduciendo el trabajo manual de anotación.
- Educación y divulgación científica: aplicación de demostración que identifica especies en imágenes submarinas en tiempo real, con la API de Ultralytics y `results[0].show()`.
- Baseline para benchmarking de detectores: al formar parte del zoo de DetectionBench, sirve como referencia reproducible para comparar YOLOv8s con YOLOv8m, YOLO11x, YOLO26s y otros en el mismo dominio y con la misma receta.
- Control de calidad en entornos de agua salobre industrial: detección de organismos (por ejemplo, medusas o cangrejos) en tomas de agua de plantas desalinizadoras o circuitos de refrigeración.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Brackish Underwater, evaluados con el pipeline estándar de DetectionBench (`detectionbench-evaluate`). No están verificados de forma independiente (`verified: false`).

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 99,3 |
| mAP@50-95 | 85,65 |
| Precisión | 99,36 |
| Recall | 98,53 |
| F1 | 98,95 |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crab | 99,5 | 93,93 |
| fish | 99,48 | 89,69 |
| jellyfish | 98,77 | 74,97 |
| shrimp | 99,5 | 79,72 |
| small_fish | 99,08 | 76,31 |
| starfish | 99,5 | 99,29 |

Comparativa dentro del zoo de Brackish Underwater (mismos datos y receta):

| Modelo | mAP@50 | mAP@50-95 | Precisión | Recall |
|---|---|---|---|---|
| YOLOv8s (este modelo) | 99,3 | 85,65 | 99,36 | 98,53 |
| YOLOv8m | 99,19 | 86,04 | 98,69 | 98,71 |
| YOLO26s | 99,1 | 85,77 | 99,45 | 97,83 |
| YOLO26n | 98,95 | 83,66 | 98,17 | 97,23 |
| YOLO11x | 98,89 | 86,3 | 98,84 | 98,25 |
| YOLO11n | 98,87 | 83,27 | 98,76 | 96,69 |
| YOLO26m | 98,74 | 85,93 | 98,74 | 97,32 |
| YOLOv8n | 98,41 | 83,01 | 99,51 | 96,95 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 11,2 M de parámetros y 28,6 GFLOPs a 640 px, el modelo es muy ligero; en FP32 los pesos ocupan aproximadamente 45 MB, por lo que la VRAM necesaria es mínima (del orden de cientos de MB incluyendo activaciones y batch).
- GPU recomendadas: cualquier GPU moderna es suficiente. Para entrenamiento o lotes grandes, se recomiendan A100, H100 o RTX 4090; para inferencia en tiempo real, RTX 3060/4060 o superiores.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2-4 GB de VRAM, e incluso en CPU para inferencia no crítica.
- Opciones de despliegue: Ultralytics (nativo), exportación a ONNX, TensorRT, OpenVINO o TFLite mediante las utilidades de Ultralytics; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | mAP@50 | mAP@50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv8s (este modelo) | 11,2 M | 99,3 | 85,65 | AGPL-3.0 | Hugging Face |
| YOLOv8m | no disponible | 99,19 | 86,04 | AGPL-3.0 (Ultralytics) | Zoo de DetectionBench |
| YOLO11x | no disponible | 98,89 | 86,3 | AGPL-3.0 (Ultralytics) | Zoo de DetectionBench |
| YOLO26s | no disponible | 99,1 | 85,77 | no disponible | Zoo de DetectionBench |

La comparación directa con los modelos del zoo es la más fiable, ya que comparten dataset, receta y pipeline de evaluación. Frente a YOLOv8m y YOLO11x, este YOLOv8s ofrece un mAP@50-95 ligeramente inferior (85,65 frente a 86,04 y 86,3) pero con un coste computacional mucho menor, lo que lo hace preferible en despliegues con restricciones de latencia o memoria.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`); deben interpretarse con cautela.
- El modelo está especializado en seis clases de un único dominio (agua salobre); su rendimiento fuera de ese dominio o con especies no incluidas no está documentado.
- Las clases con peor mAP@50-95 son jellyfish (74,97), small_fish (76,31) y shrimp (79,72), lo que indica dificultades con objetos pequeños o de morfología variable.
- Riesgo de falsos positivos y negativos en condiciones de baja visibilidad, turbidez, iluminación variable u oclusión, típicas de imágenes submarinas; no se documenta evaluación en esos escenarios.
- No se documentan sesgos específicos más allá de los derivados del dataset de entrenamiento, cuya composición y procedencia no se detallan en la información disponible.
- Licencia AGPL-3.0: el uso comercial requiere cumplir con las obligaciones de copyleft de la AGPL, lo que puede ser restrictivo para productos propietarios; además, los pesos derivan de Ultralytics YOLOv8, sujeto a la misma licencia.
- El repo tiene un tamaño de 0,0 GB declarado, lo que puede indicar que los pesos no están incluidos o que el tamaño no se ha actualizado; conviene verificar la disponibilidad de `best.pt` antes de integrarlo.
- No hay información sobre cuantización, latencia ni throughput, por lo que los requisitos de producción deben validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/brackish-yolov8s
- Dataset Brackish: https://huggingface.co/datasets/dronefreak/Brackish
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base Ultralytics YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
