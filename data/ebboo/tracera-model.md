# ebboo/tracera-model

## Resumen

Tracera es un modelo de detección de objetos basado en YOLO11s, desarrollado por el usuario ebboo, especializado en la detección de defectos superficiales en placas de circuito impreso (PCB). El modelo se entrenó sobre el conjunto de datos PKU-Market-PCB con una partición estricta por placa (board-grouped split) para evitar la fuga de información entre entrenamiento y test, un problema habitual en este tipo de datasets. Detecta seis clases de defectos: `missing_hole`, `mouse_bite`, `open_circuit`, `short`, `spur` y `spurious_copper`.

La relevancia del modelo reside en su enfoque metodológico y en su empaquetado para despliegue real: incluye pesos PyTorch (`last.pt`), exportaciones OpenVINO INT8 para CPU, ONNX FP32 para inferencia en navegador mediante ONNX Runtime Web y soporte de explicabilidad mediante LayerCAM en la capa 4. El repositorio ocupa 0,1 GB y está pensado para integrarse en una aplicación de escritorio (FastAPI/Tauri) y en WebView de Android.

El modelo se entrenó a resolución 1024×1024 con 80 épocas, batch 8, y se seleccionó el checkpoint final (`last.pt`) sin parada temprana basada en validación. La licencia es AGPL-3.0, lo que condiciona su uso en productos propietarios. Los idiomas declarados en la model card son turco e inglés, aunque el modelo en sí es de visión y no procesa texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible (pesos `last.pt` de 18,37 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 1024×1024) |
| Tipos de cuantizacion | FP32 (PyTorch y ONNX), FP16 (TensorRT), INT8 (OpenVINO) |
| Idiomas soportados | turco (tr), inglés (en) según metadatos; el modelo es de visión y no procesa lenguaje |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch checkpoint (`last.pt`), OpenVINO IR INT8 (`last.xml`, `last.bin`), ONNX FP32 (`opset=17`), TensorRT FP16 |

## Arquitectura y entrenamiento

El modelo es un detector YOLO11s de Ultralytics, una arquitectura de detección de objetos de una etapa con backbone y neck convolucionales y cabecera de predicción densa. Se entrenó con `imgsz=1024`, `batch=8`, `epochs=80`, `patience=0` y se seleccionó el peso final `last.pt` sin parada temprana. El entrenamiento completo duró 24,87 minutos con un pico de memoria GPU de 5,14 GB, lo que indica que el ajuste fino es viable en una GPU de consumo.

El aspecto técnico más destacable es la partición del dataset. PKU-Market-PCB contiene 10 diseños de placa distintos (grupo de validación cruzada de 623 imágenes). Una partición aleatoria provoca fuga de información porque los fondos de la misma placa aparecen en entrenamiento y test. El autor aplicó una partición estricta por placa: validación con las placas 05 y 11 (120 imágenes, 562 cajas) y test bloqueado con las placas 06 y 10 (93 imágenes, 469 cajas de defecto). El modelo final nunca vio las placas de test durante el entrenamiento. Además, el paquete incluye exportaciones con NMS en cliente para ONNX y cuantización INT8 con OpenVINO, con un estudio de paridad entre FP32 e INT8 (IoU medio de 0,9537 y diferencia media de confianza de 0,0320 en 10 imágenes de validación).

## Capacidades

- Detección de objetos en imágenes de PCB con seis clases de defecto: `missing_hole`, `mouse_bite`, `open_circuit`, `short`, `spur` y `spurious_copper`.
- Inferencia a resolución 1024×1024, con preprocesado tipo letterbox (padding 114) y umbral de confianza por defecto de 0,395 y NMS con IoU 0,7.
- Exportación a múltiples formatos: PyTorch para GPU, OpenVINO INT8 para CPU, ONNX FP32 para navegador y TensorRT FP16 para GPU.
- Explicabilidad mediante LayerCAM en la capa 4, que visualiza las regiones de la imagen que motivan cada detección.
- Inferencia en navegador y en WebView de Android mediante ONNX Runtime Web con NMS en cliente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural; es exclusivamente un modelo de visión por computador.

## Casos de uso

- Inspección automatizada de calidad en línea de producción de PCB: el modelo se integra en una cámara industrial y clasifica cada placa a 1024×1024, detectando agujeros faltantes, cortocircuitos o pistas abiertas antes del ensamblaje. La exportación OpenVINO INT8 permite ejecutarlo en CPU de bajo coste junto a la línea.
- Control de calidad en estación de inspección visual: un operario revisa las detecciones y las visualizaciones LayerCAM para validar casos dudosos, reduciendo el tiempo de revisión manual y aportando trazabilidad sobre por qué el modelo marcó un defecto.
- Aplicación de escritorio para talleres de electrónica: el paquete incluye un modelo OpenVINO INT8 de 9,97 MB pensado para un backend FastAPI o una app Tauri, de modo que un taller sin GPU puede inspeccionar placas en un portátil convencional a unas 22,9 FPS de extremo a extremo.
- Inspección desde dispositivos móviles: la exportación ONNX FP32 con NMS en cliente permite ejecutar el modelo en un WebView de Android o en el navegador mediante ONNX Runtime Web, útil para técnicos que fotografían placas en campo y necesitan una primera evaluación.
- Generación de datasets etiquetados y aumento de datos: el modelo puede preetiquetar imágenes nuevas de PCB para revisión humana, acelerando la creación de conjuntos de datos propios con las seis clases de defecto.
- Investigación en detección de defectos con partición por placa: el repositorio documenta la comparación entre partición aleatoria y partición agrupada por placa (diferencia de -0,1303 en mAP50), por lo que sirve como referencia metodológica para evitar fugas de información en benchmarks de inspección visual.
- Despliegue en GPU de consumo para prototipado: con TensorRT FP16 alcanza 81,4 FPS de extremo a extremo en una RTX 4060 Laptop, adecuado para prototipos de inspección en tiempo real en estaciones de trabajo.

## Benchmarks y rendimiento

Resultados de validación cruzada de 5 pliegues agrupados por placa:

| Experimento | Resolución | Peso | mAP50 (media ± std) | mAP50-95 (media ± std) |
|---|---|---|---|---|
| Arquitectura final (CV agrupada) | 1024 | `last.pt` | 0,8575 ± 0,1523 | 0,4240 ± 0,1188 |
| Comparación (CV agrupada) | 640 | `last.pt` | 0,7869 ± 0,1548 | 0,3760 ± 0,1080 |
| Partición aleatoria con fuga (640) | 640 | `last.pt` | 0,9364 ± 0,0124 | 0,4988 ± 0,0078 |
| CV agrupada sobre las mismas imágenes (640) | 640 | `last.pt` | 0,8061 ± 0,1719 | 0,3957 ± 0,1116 |

Resultados en test bloqueado (placas 06 y 10, 93 imágenes, 469 cajas):

| Métrica | Valor |
|---|---|
| mAP50 | 0,9225 |
| mAP50-95 | 0,4740 |

Resultados por clase en test bloqueado:

| Clase | mAP50 | mAP50-95 |
|---|---|---|
| `missing_hole` | 0,9705 | 0,4791 |
| `mouse_bite` | 0,9442 | 0,4651 |
| `open_circuit` | 0,9207 | 0,5158 |
| `short` | 0,8903 | 0,4451 |
| `spur` | 0,8527 | 0,4259 |
| `spurious_copper` | 0,9564 | 0,5128 |

Punto de operación bloqueado (`conf=0,395`, IoU=0,50):

| Split | TP | FP | FN | Precision | Recall | F1 |
|---|---|---|---|---|---|---|
| Validación (placas 05 y 11) | 514 | 16 | 48 | 0,9698 | 0,9146 | 0,9414 |
| Test bloqueado (placas 06 y 10) | 416 | 142 | 53 | 0,7455 | 0,8870 | 0,8101 |
| Fila de sensibilidad (excluyendo 2 falsos positivos fijos de la plantilla de la placa 06) | 416 | 28 | 53 | 0,9369 | 0,8870 | 0,9113 |

Rendimiento de inferencia en hardware de portátil (Ryzen 7 8845HS / RTX 4060 Laptop):

| Formato | Hardware | Tamaño (MB) | Mediana modelo (ms) | Mediana total (ms) | FPS extremo a extremo | mAP50 validación |
|---|---|---|---|---|---|---|
| PyTorch FP32 | RTX 4060 Laptop | 18,37 | 9,80 | 14,83 | 67,4 | 0,9396 |
| ONNX Runtime CPU | Ryzen 7 8845HS | 36,43 | 157,18 | 165,00 | 6,1 | 0,9372 |
| OpenVINO FP32 CPU | Ryzen 7 8845HS | 36,47 | 103,06 | 109,70 | 9,1 | 0,9372 |
| OpenVINO INT8 CPU | Ryzen 7 8845HS | 9,97 | 36,70 | 43,73 | 22,9 | 0,9430 |
| TensorRT FP16 | RTX 4060 Laptop | 22,06 | 3,34 | 12,29 | 81,4 | 0,9372 |

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento alcanzó un pico de 5,14 GB con batch 8 a 1024×1024; para inferencia en FP32 se estima un consumo inferior a 2 GB, aunque el dato exacto no está disponible en la información proporcionada.
- GPU recomendadas: RTX 4060 Laptop (medido), RTX 4090, A100 o H100 para mayor throughput. TensorRT FP16 alcanza 81,4 FPS de extremo a extremo en una RTX 4060 Laptop.
- Cabe en GPU de consumo: sí, con pesos de 18,37 MB en FP32 y 22,06 MB en TensorRT FP16.
- Despliegue en CPU: OpenVINO INT8 reduce el modelo a 9,97 MB y ofrece 22,9 FPS de extremo a extremo en un Ryzen 7 8845HS, por lo que es viable en portátiles sin GPU dedicada.
- Opciones de despliegue: PyTorch/Ultralytics, OpenVINO (IR INT8 y FP32), ONNX Runtime (CPU y WebGPU), TensorRT FP16, y backend FastAPI o Tauri para escritorio.
- Latencia y throughput: mediana de modelo de 3,34 ms con TensorRT FP16 en RTX 4060 Laptop y de 36,70 ms con OpenVINO INT8 en CPU Ryzen 7 8845HS; el resto de cifras en la tabla de benchmarks.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | mAP50 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tracera (YOLO11s @1024) | YOLO11s | no disponible | 1024×1024 | 0,9225 (test bloqueado) | AGPL-3.0 | Hugging Face |
| YOLO11s @640 (mismo autor, CV agrupada) | YOLO11s | no disponible | 640×640 | 0,7869 (CV agrupada) | AGPL-3.0 | Incluido como comparación en la model card |
| YOLOv8 (variantes de la comunidad para PKU-Market-PCB) | YOLOv8 | no disponible | variable | no disponible | AGPL-3.0 | Repositorios de la comunidad |
| Modelos de detección de defectos PCB basados en Faster R-CNN | Faster R-CNN | no disponible | variable | no disponible | variable | Repositorios académicos |

La comparación con alternativas de la misma categoría es limitada porque la información proporcionada no incluye resultados de otros modelos sobre el mismo test bloqueado. El propio autor aporta la comparación interna entre resolución 1024 y 640, donde 1024 supera a 640 en 0,0706 de mAP50 en los cinco pliegues.

## Limitaciones y advertencias

- El test bloqueado solo cubre dos diseños de placa (06 y 10), por lo que la generalización a otras geometrías de PCB no está demostrada.
- La partición por placa revela una caída importante respecto a la partición aleatoria con fuga: mAP50 de 0,8575 frente a 0,9364 en validación cruzada, lo que indica que los resultados con particiones aleatorias en este dominio sobreestiman el rendimiento real.
- En el punto de operación bloqueado, la precisión en test cae a 0,7455 con 142 falsos positivos; excluyendo dos falsos positivos fijos de la plantilla de la placa 06, la precisión sube a 0,9369. La plantilla `06.JPG` genera un falso positivo fijo de clase `mouse_bite` con confianza 0,5569.
- Riesgo de alucinación en el sentido de detecciones espurias: el modelo puede marcar defectos inexistentes en imágenes de plantilla limpias, como demuestra el caso de la placa 06.
- El modelo es exclusivamente de visión; no procesa texto ni soporta instrucciones en lenguaje natural, a pesar de los idiomas declarados en los metadatos.
- La licencia AGPL-3.0 impone obligaciones de publicación del código fuente para servicios en red que utilicen el modelo, lo que puede ser incompatible con productos propietarios.
- El conjunto de datos PKU-Market-PCB es limitado (623 imágenes en el grupo de validación cruzada) y puede no representar la variabilidad de defectos en producción industrial real.
- No se han publicado resultados de benchmarks frente a otros modelos en la información disponible, más allá de las comparaciones internas del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ebboo/tracera-model
- Paper de referencia citado en los tags (arXiv:1901.08204): https://arxiv.org/abs/1901.08204
- Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- OpenVINO: https://docs.openvino.ai/
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- LayerCAM: https://github.com/PengtaoJiang/LayerCAM-jittor
