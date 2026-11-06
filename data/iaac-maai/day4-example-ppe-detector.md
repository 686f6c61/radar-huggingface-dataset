# iaac-maai/day4-example-ppe-detector

## Resumen

`day4-example-ppe-detector` es un detector de objetos YOLO26s publicado por el equipo del curso AI Methods I del IAAC (Institute for Advanced Architecture of Catalonia) como ejemplo práctico para la docencia en el ámbito del entorno construido. El modelo parte de los pesos `yolo26s.pt` preentrenados por Ultralytics sobre COCO y se afina sobre aproximadamente 2.600 imágenes etiquetadas de obras de construcción para detectar equipos de protección individual (EPI): cascos, chalecos reflectantes, mascarillas, personas, conos de seguridad, maquinaria y vehículos, además de las clases negativas de persona sin casco, sin chaleco y sin mascarilla.

La arquitectura es un detector YOLO26s de la familia Ultralytics, con 9,5 millones de parámetros y 20,8 GFLOPs, que procesa internamente las imágenes a 640 × 640 píxeles y devuelve cajas, clase y confianza para cada objeto. Se trata de un modelo de visión por computador puro, sin capacidades de generación de texto ni de razonamiento lingüístico, por lo que su relevancia radica en ser una referencia didáctica reproducible (entrenamiento en 33 minutos sobre una RTX 4050 Laptop de 6 GB) y en su utilidad para análisis agregados de seguridad en obra.

El modelo se distribuye con licencia AGPL-3.0 y formato de pesos PyTorch (`model.pt`) para la librería Ultralytics. No está pensado para decisiones individuales sobre trabajadores ni para uso crítico de seguridad sin verificación humana, tal como advierte el propio autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO26s (detector de objetos de una etapa) |
| Parametros totales | 9,5 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen redimensionada a 640 × 640 px) |
| Tipos de cuantizacion | no disponible (solo se publican pesos PyTorch en `model.pt`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`model.pt`) para Ultralytics; no se publican GGUF, ONNX ni TensorRT |
| Tarea | Detección de objetos (cajas, clases y confianzas) |
| Modelo base | `yolo26s.pt` preentrenado en COCO (80 clases) |
| Entrada | Imagen de cualquier tamano, redimensionada a 640 × 640 px |
| Salida | Caja (x1, y1, x2, y2 en píxeles), clase (10 posibles) y confianza entre 0 y 1 |
| Clases | Hardhat, Mask, NO-Hardhat, NO-Mask, NO-Safety Vest, Person, Safety Cone, Safety Vest, machinery, vehicle |
| Versiones de librería | ultralytics 8.4.190, torch 2.14.1, Python 3.12 |
| Tamano del repositorio | 0,0 GB (pesos de 20 MB) |

## Arquitectura y entrenamiento

El modelo es un detector YOLO26s de Ultralytics, una arquitectura de detección de objetos de una sola etapa que predice directamente cajas delimitadoras y clases sobre una rejilla densa, con 9,5 millones de parámetros y 20,8 GFLOPs por inferencia a 640 × 640 píxeles. Se parte de los pesos `yolo26s.pt` preentrenados sobre COCO y se realiza un ajuste fino supervisado sobre el dataset Construction Site Safety Image Dataset (Roboflow Universe, licencia CC BY 4.0), con 2.605 imágenes de entrenamiento, 114 de validación y 82 de test, todas a 640 × 640 píxeles.

El entrenamiento consistió en 40 épocas con tamano de imagen 640, batch 16, optimizador y schedule de learning rate por defecto de Ultralytics, precisión mixta y semilla fija (`seed=42`). Se aplicaron las aumentaciones por defecto de Ultralytics (mosaic desactivado en las últimas 10 épocas, escalado aleatorio, traslación, volteo horizontal y cambios de color). Todo el ajuste se completó en 33 minutos sobre una única NVIDIA RTX 4050 Laptop GPU de 6 GB. La selección del modelo se hizo por mejor puntuación de validación (`best.pt`) y el conjunto de test se usó una sola vez al final. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un detector visual supervisado.

Cabe senalar que el conjunto de entrenamiento contiene copias aumentadas generadas por el autor del dataset (volteos, recortes, rotaciones pequenas, cambios de brillo y desenfoque), por lo que el número de fotos distintas es inferior al de archivos. Además, las clases están desbalanceadas: 9.532 cajas de `Person` frente a unas 1.550–1.650 de `vehicle` y `Mask`.

## Capacidades

- Detección de objetos en imágenes con salida de cajas delimitadoras, clase y confianza para 10 clases de seguridad en obra.
- Detección de EPI: cascos (`Hardhat`), chalecos reflectantes (`Safety Vest`) y mascarillas (`Mask`).
- Detección de ausencia de EPI: `NO-Hardhat`, `NO-Mask` y `NO-Safety Vest`.
- Detección de personas (`Person`), conos de seguridad (`Safety Cone`), maquinaria de construcción (`machinery`) y vehículos (`vehicle`).
- Procesamiento de imágenes de cualquier resolución mediante redimensionado interno a 640 × 640 px.
- Inferencia rápida: aproximadamente 0,1 s por imagen en CPU de portátil (Intel i7-12700H) y unos 35 ms en GPU de portátil RTX 4050.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es exclusivamente un modelo de visión.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- **Análisis agregado de cumplimiento de EPI en lotes de fotos de obra**: el modelo permite contar cuántas personas aparecen con casco o chaleco en un conjunto de imágenes de seguimiento de obra, útil para informes periódicos de seguridad sin evaluar individuos concretos.
- **Docencia y aprendizaje de detección de objetos**: al ser el ejemplo trabajado del Día 4 del curso AI Methods I, sirve para que estudiantes sin GPU descarguen el modelo y ejecuten inferencia en el cuaderno del curso en lugar de entrenar desde cero.
- **Prototipado rápido de pipelines de visión en el entorno construido**: con 20 MB de pesos y 35 ms por imagen en una RTX 4050, es adecuado para validar arquitecturas de detección antes de invertir en datasets propios mayores.
- **Preetiquetado asistido de nuevos datasets de obra**: las detecciones del modelo pueden servir como punto de partida para anotación humana en proyectos que amplíen las clases o mejoren el dataset original.
- **Monitorización de presencia de maquinaria y vehículos en imágenes de obra**: las clases `machinery` y `vehicle` permiten inventariar equipos en fotos de seguimiento, con la cautela de que su recall en test es moderado.
- **Análisis de imágenes de vídeo extraídas de grabaciones de obra**: al procesar fotogramas individuales a unos 35 ms en GPU de portátil, permite analizar secuencias cortas extrayendo métricas agregadas de presencia de EPI.
- **Investigación sobre sesgos y limitaciones en detección de EPI**: la model card documenta explícitamente el bajo recall en clases como `NO-Hardhat` (0,59) y `Safety Cone` (0,48), lo que lo convierte en un caso de estudio útil sobre las limitaciones de los detectores en dominios de seguridad.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el dataset Construction Site Safety:

| Split | mAP50 | mAP50-95 | Precision | Recall |
|---|---|---|---|---|
| Validación (114 imágenes) | 0,844 | 0,550 | 0,913 | 0,759 |
| Test (82 imágenes, usado una vez) | 0,780 | 0,500 | 0,877 | 0,732 |

Resultados por clase en el conjunto de test (ordenados de más débil a más fuerte, según la información disponible):

| Clase | Cajas en test | Precision | Recall | AP50 | AP50-95 |
|---|---|---|---|---|---|
| Safety Cone | 92 | 0,77 | 0,48 | 0,52 | 0,24 |
| NO-Hardhat | 41 | 0,79 | 0,59 | 0,56 | 0,34 |
| Mask | 28 | 0,95 | 0,75 | 0,75 | 0,55 |
| vehicle | 41 | 0,82 | 0,68 | 0,76 | 0,48 |
| NO-Mask | 79 | 0,88 | 0,70 | 0,80 | 0,35 |
| NO-Safety Vest | 90 | 0,97 | no disponible en la información proporcionada | no disponible | no disponible |

Comparación indicada por el autor: el autor del dataset reporta un mAP50 de validación de 0,81 (mAP50-95 de 0,51) para un YOLOv8n entrenado durante 100 épocas. La evolución de la validación mAP50 fue de 0,55 tras una época, 0,77 tras 11 épocas y 0,85 tras 40 épocas, todavía en ascenso lento.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no se publica una cifra exacta; con 9,5 millones de parámetros y pesos de 20 MB, la huella es muy reducida y cabe holgadamente en GPUs de consumo.
- **GPU recomendadas**: el autor reporta entrenamiento e inferencia sobre una NVIDIA RTX 4050 Laptop GPU de 6 GB; por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente para inferencia.
- **CPU**: el autor reporta unos 0,1 s por imagen en un Intel i7-12700H, por lo que es viable en CPU de portátil para lotes pequenos.
- **Cabe en GPU consumer**: sí, en cualquier GPU con al menos 6 GB de VRAM; el entrenamiento completo se realizó en 6 GB.
- **Opciones de despliegue**: la librería oficial es Ultralytics (versión 8.4.190 con torch 2.14.1 y Python 3.12). No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni formatos GGUF, por lo que el despliegue estándar es mediante `ultralytics` con PyTorch.
- **Latencia y throughput**: aproximadamente 35 ms por imagen en RTX 4050 Laptop GPU y 0,1 s por imagen en CPU Intel i7-12700H; no se publican cifras de throughput en lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mAP50 (validación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| day4-example-ppe-detector (YOLO26s) | 9,5 M | Imagen 640 × 640 px | 0,844 | AGPL-3.0 | Hugging Face, pesos PyTorch |
| YOLOv8n (referencia del autor del dataset) | no disponible en la información proporcionada | Imagen 640 × 640 px | 0,81 | no disponible en la información proporcionada | Referencia citada en la model card |
| Otros detectores de EPI en construcción | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación numérica disponible es la que aporta el propio autor frente a un YOLOv8n entrenado 100 épocas sobre el mismo dataset, con mAP50 de validación de 0,81 frente a 0,844 del modelo aquí descrito. No se dispone de datos de otros detectores de EPI comparables en la información proporcionada.

## Limitaciones y advertencias

- **Recall bajo en clases críticas**: en test, `NO-Hardhat` tiene un recall de 0,59, lo que implica que el modelo pierde aproximadamente un tercio de las personas sin casco. No es apto para uso crítico de seguridad sin verificación humana de cada alerta.
- **Clases débiles**: `Safety Cone` obtiene AP50 de 0,52 y AP50-95 de 0,24, y `NO-Mask` un AP50-95 de 0,35, lo que limita su uso en análisis finos.
- **Conjuntos de validación y test muy pequenos**: 114 y 82 imágenes respectivamente, por lo que las métricas tienen una incertidumbre de varios puntos porcentuales.
- **Desbalance de clases en entrenamiento**: 9.532 cajas de `Person` frente a 1.550–1.650 de `vehicle` y `Mask`, lo que puede sesgar el rendimiento hacia las clases mayoritarias.
- **Datos aumentados**: el conjunto de entrenamiento contiene copias aumentadas, por lo que la diversidad real de imágenes es menor de lo que sugiere el número de archivos.
- **Dominio limitado**: no es fiable en imágenes muy distintas al entrenamiento, como vistas de dron o cenitales, imágenes nocturnas o térmicas, o personas muy lejanas.
- **Uso previsto restringido**: el autor excluye explícitamente cualquier decisión sobre un trabajador individual (disciplina, pago, acceso a la obra) y la monitorización de trabajadores no informados.
- **Licencia AGPL-3.0**: impone obligaciones de copyleft sobre el código que integre el modelo en servicios en red; es necesario revisar su compatibilidad con el uso comercial previsto.
- **Sin soporte multilingüe ni de texto**: al ser un detector visual, no procesa lenguaje natural ni puede usarse para tareas de generación o razonamiento.
- **Riesgo de alucinación**: en el contexto de un detector, se traduce en falsos positivos y falsos negativos; la precisión global en test es 0,877, pero varía mucho por clase.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/day4-example-ppe-detector
- Repositorio GitHub del curso (pipeline completo, cuaderno `Day_4/docs/03_object_detection_yolo_sam.ipynb`): https://github.com/iaac-maai/ai-methods-1-2026
- Dataset en Roboflow Universe: https://universe.roboflow.com/roboflow-universe-projects/construction-site-safety
- Dataset en Kaggle: https://www.kaggle.com/datasets/snehilsanyal/construction-site-safety-image-dataset-roboflow
- Curvas de entrenamiento: https://huggingface.co/iaac-maai/day4-example-ppe-detector/resolve/main/training_curves.png
