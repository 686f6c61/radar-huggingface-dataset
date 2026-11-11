# RodrigoRRC/license-plate-br-yolo26s

## Resumen

El modelo `license-plate-br-yolo26s` es un detector de objetos especializado en la localización de matrículas de vehículos en el contexto brasileño, desarrollado por Rodrigo Ribeiro Carvalho mediante fine-tuning del modelo base `number-plate-yolo26s` de Muhammad Rizwan Munawar. Se distribuye en dos variantes entrenadas desde el mismo punto de partida: una v1 con hiperparámetros elegidos manualmente y una v2 cuyos hiperparámetros se obtuvieron mediante búsqueda genética con `model.tune()` de Ultralytics. Ambas emplean la arquitectura YOLO26 en su variante "s" (small) y se empaquetan en formato PyTorch (`.pt`), con un tamaño de repositorio de aproximadamente 0,1 GB.

El modelo resuelve una tarea acotada pero crítica dentro de los pipelines de reconocimiento automático de matrículas (ALPR): la detección precisa de la caja delimitadora de la placa, paso previo a cualquier OCR. Su relevancia radica en que eleva el mAP@50-95 del modelo base del 60,24% al 82,03% en la variante v2, manteniendo un mAP@50 por encima del 98%, lo que indica un ajuste fino de la caja significativamente mejor que el del modelo original. El entrenamiento y la evaluación se realizaron sobre el dataset UFPR-ALPR (4.500 imágenes de 1.920×1.080 px, 150 vehículos entre coches y motos), con escenarios reales de vehículo y cámara en movimiento.

La relevancia actual del modelo viene de su especialización regional: los modelos genéricos de detección de matrículas rara vez cubren las particularidades morfológicas de las placas brasileñas (incluidas las de motocicleta, de menor tamaño en píxeles), y este fine-tuning aborda explícitamente ese caso mediante `imgsz=1280`. La contrapartida es una licencia AGPL-3.0 heredada del modelo base y una restricción adicional de uso no comercial derivada del dataset UFPR-ALPR, lo que limita su despliegue en producción comercial sin autorización expresa de los titulares del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (familia Ultralytics YOLO, detector de objetos de una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en `float32` PyTorch `.pt`; no se documentan variantes GGUF, ONNX o TensorRT) |
| Idiomas soportados | portugues (etiqueta `language: pt`; el modelo no procesa texto, la etiqueta refleja el dominio de las imagenes) |
| Licencia | AGPL-3.0, con restriccion adicional de uso no comercial por el dataset UFPR-ALPR |
| Formato de pesos | PyTorch `.pt` (`best_placas_v2.pt` y variante v1) |

## Arquitectura y entrenamiento

El modelo parte de `number-plate-yolo26s`, un detector YOLO26 en variante small publicado por Muhammad Rizwan Munawar, y se ajusta mediante transferencia de aprendizaje sobre el dataset UFPR-ALPR. La división de datos es la oficial del dataset, estratificada por vehículo: 1.800 imágenes de entrenamiento, 900 de validación y 1.800 de test, sin que ningún vehículo del conjunto de test aparezca en entrenamiento ni en la búsqueda de hiperparámetros. La variante v1 se entrenó con `imgsz=1280` para preservar placas pequeñas (especialmente de motocicleta), `freeze=10` para conservar las características genéricas del backbone, `lr0=0.001` con decaimento coseno y early stopping. La variante v2 se obtuvo con `model.tune()` de Ultralytics sobre 12 hiperparámetros, 20 iteraciones × 3 épocas en GPU T4 de Kaggle, seleccionando el mejor conjunto por mAP@50-95 en validación.

La innovación técnica destacable no está en la arquitectura sino en la metodología de evaluación y búsqueda: los tres modelos (base, v1 y v2) se midieron con `model.val()` en el mismo conjunto de test y bajo idénticas condiciones, y el test no participó en ninguna decisión de diseño. La métrica principal elegida es mAP@50-95 y no mAP@50, porque esta última satura por encima del 98% en los modelos ajustados y deja de discriminar entre variantes, mientras que mAP@50-95 mide la calidad del ajuste de la caja a la placa. Los hiperparámetros óptimos encontrados incluyen `lr0=0.00285`, `lrf=0.01446`, `momentum=0.94248`, `box=7.51169`, `dfl=1.22798`, `scale=0.49496`, `mosaic=0.61158`, `fliplr=0.5` y `hsv_v=0.40706`. No se documentan fases de RLHF/DPO, al tratarse de un modelo de visión supervisado.

## Capacidades

- Detección de matrículas de vehículos en imágenes, devolviendo cajas delimitadoras con coordenadas y confianza.
- Especialización en el contexto brasileiro, incluyendo placas de motocicleta de pequeño tamaño gracias al entrenamiento a `imgsz=1280`.
- Detección en escenarios reales con vehículo y cámara en movimiento, condición presente en el dataset UFPR-ALPR.
- Inferencia mediante la librería Ultralytics (`YOLO(...).predict(source=..., conf=...)`), con visualización integrada (`results[0].show()`).
- Descarga directa desde Hugging Face Hub mediante `hf_hub_download`.
- No realiza OCR ni lectura de caracteres: es exclusivamente un detector de la placa como objeto.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni procesamiento de audio o texto.

## Casos de uso

- Preprocesamiento de pipelines ALPR: el modelo recorta la región de la matrícula para alimentar un OCR posterior; su mAP@50-95 del 82,03% garantiza una caja ajustada que reduce el ruido de fondo entregado al lector de caracteres.
- Control de acceso vehicular en aparcamientos: detección de la placa en la imagen capturada por la cámara de entrada, con inferencia a `imgsz=1280` para cubrir matrículas de motocicleta en encuadres amplios.
- Peajes y sistemas de cobro automatizado: localización de la placa en fotogramas de cámara en movimiento, escenario para el que el modelo fue entrenado explícitamente.
- Auditoría de tráfico y análisis forense de imágenes: detección de matrículas en lotes de imágenes para su posterior revisión manual o cruce con bases de datos, aprovechando la alta precisión (97,69%) de la variante v2.
- Investigación académica en visión por computador: reproducción de experimentos de fine-tuning y búsqueda genética de hiperparámetros sobre UFPR-ALPR, con notebook de evaluación publicado en Kaggle y metodología documentada en GitHub.
- Prototipos de vigilancia urbana no comerciales: integración en sistemas de monitorización con `conf=0.5` como umbral por defecto, ajustable según la tolerancia a falsos positivos del escenario.
- Validación de calidad de datasets: uso del modelo como detector de referencia para comprobar anotaciones de matrículas en nuevos conjuntos de imágenes brasileñas.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test de UFPR-ALPR (1.800 imágenes), con idénticas configuraciones para los tres modelos:

| Etapa | Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|---|
| Modelo base | number-plate-yolo26s | 89,58% | 60,24% | 86,32% | 89,77% |
| Fine-tuning v1 | best_placas_v1 | 99,11% | 77,09% | 96,99% | 96,17% |
| Fine-tuning v2 (busqueda genetica) | best_placas_v2 | 98,33% | 82,03% | 97,69% | 98,78% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por tratarse de un modelo de detección de objetos; las métricas aplicables son las de detección recogidas en la tabla anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de familia, un YOLO en variante small a `imgsz=1280` requiere típicamente del orden de 2-4 GB de VRAM en FP32, pero este dato no está confirmado por el autor.
- GPU recomendadas: no disponible. El entrenamiento de la búsqueda genética se realizó en GPU T4 de Kaggle, lo que indica que una GPU de gama media con al menos 16 GB de memoria es suficiente para el ajuste fino.
- Cabe en GPU de consumo: probable según la variante small de YOLO26, pero no confirmado en la documentación del modelo.
- Opciones de despliegue: Ultralytics (librería oficial, `YOLO(...).predict(...)`); no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 0,7 s por imagen en CPU con `imgsz=1280`, según el autor. No se publican cifras de latencia en GPU ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento (mAP@50-95) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| license-plate-br-yolo26s v2 (este modelo) | no disponible (YOLO26s) | `imgsz=1280` | 82,03% en UFPR-ALPR test | AGPL-3.0 + no comercial (dataset) | Hugging Face, `.pt` |
| number-plate-yolo26s (modelo base) | no disponible (YOLO26s) | no disponible | 60,24% en UFPR-ALPR test | AGPL-3.0 | Ultralytics Platform |
| license-plate-br-yolo26s v1 | no disponible (YOLO26s) | `imgsz=1280` | 77,09% en UFPR-ALPR test | AGPL-3.0 + no comercial (dataset) | Hugging Face, `.pt` |

No se dispone de datos de otros detectores de matrículas comparables (por ejemplo variantes YOLOv8 o YOLOv11 especializadas en ALPR) en la información proporcionada, por lo que la comparativa se limita a las tres variantes documentadas por el autor.

## Limitaciones y advertencias

- Solo detección: el modelo localiza la placa pero no lee los caracteres; requiere un OCR posterior para cualquier tarea de reconocimiento.
- Evaluado en un único dominio (UFPR-ALPR): el rendimiento en otros países, condiciones de iluminación extremas o cámaras de distinta resolución no está validado.
- Licencia AGPL-3.0 heredada del modelo base, con obligaciones de copyleft para obras derivadas distribuidas.
- Restricción de uso no comercial: el dataset UFPR-ALPR es de uso académico y no comercial, y esa restricción se extiende a los modelos derivados; para uso comercial debe consultarse a los titulares del dataset original.
- Latencia de ~0,7 s por imagen en CPU con `imgsz=1280`, lo que limita despliegues en tiempo real sobre hardware sin GPU.
- Riesgo de falsos positivos y negativos no cuantificado fuera del conjunto de test; el umbral `conf=0.5` es solo un valor de ejemplo y debe calibrarse por escenario.
- No se documentan sesgos específicos más allá del dominio brasileño del dataset de entrenamiento.
- El modelo base y los pesos no incluyen información sobre parámetros totales ni sobre variantes cuantizadas, lo que dificulta estimar requisitos de memoria con precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RodrigoRRC/license-plate-br-yolo26s
- Repositorio GitHub con código y reproducción: https://github.com/Rodrigo-RRC/license-plate-br-yolo26s-finetuning
- Metodología completa: https://github.com/Rodrigo-RRC/license-plate-br-yolo26s-finetuning/blob/main/Docs/metodologia.md
- Notebook de evaluación en Kaggle: https://www.kaggle.com/code/rodrigorrc/03-avaliacao-base-v1-v2
- Modelo base (Ultralytics Platform): https://platform.ultralytics.com/muhammadrizwanmunawar/datasets/number-plate
- Dataset UFPR-ALPR: https://web.inf.ufpr.br/vri/databases/ufpr-alpr/
- Perfil del autor en GitHub: https://github.com/Rodrigo-RRC
- Perfil del autor en Hugging Face: https://huggingface.co/RodrigoRRC
- Paper de referencia del dataset (Laroca et al., IJCNN 2018): no disponible como enlace directo en la información proporcionada
