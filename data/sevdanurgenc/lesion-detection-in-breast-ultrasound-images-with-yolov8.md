# SevdanurGenc/Lesion-Detection-in-Breast-Ultrasound-Images-with-YOLOv8

## Resumen

El modelo **YOLOv8n for Lesion Detection in Breast Ultrasound Images** es un detector de objetos basado en la arquitectura YOLOv8n, entrenado por SevdanurGenc (Oğuz & Genç) para localizar lesiones benignas y malignas en imágenes de ultrasonido de mama. Se trata de un estudio de viabilidad computacional, no de una herramienta clínica validada, y su propósito es evaluar de forma reproducible el rendimiento de YOLOv8 sobre un conjunto de datos pequeño y desequilibrado (BUSI, 780 imágenes). El modelo se inicializó desde los pesos preentrenados en COCO y se ajustó durante 50 épocas con aumentación específica por clase. Su relevancia radica en servir como referencia reproducible para la detección automática de lesiones mamarias, aunque sus métricas, especialmente en la clase maligna (recall 0,645 en test), están muy por debajo de lo exigible en un entorno clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (Ultralytics) |
| Parametros totales | no disponible (YOLOv8n estándar, ~3,2 M, no confirmado en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 640 × 640 píxeles (tamaño de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOv8n, una red neuronal convolucional de una sola etapa diseñada para detección de objetos en tiempo real. Se inicializó con los pesos preentrenados en COCO (`yolov8n.pt`) y se ajustó sobre el dataset público BUSI, que contiene 780 imágenes de ultrasonido de mama (437 benignas, 210 malignas y 133 normales). Las máscaras a nivel de píxel se convirtieron en cajas delimitadoras alineadas con los ejes (umbral de binarización 10, área mínima de componente 20 px). Las imágenes normales se usaron como negativos de fondo, por lo que la tarea es efectivamente de dos clases (benigno y maligno). El conjunto se dividió en 70/15/15 por clase con semilla 42, antes de la aumentación. Se aplicó aumentación offline específica por clase solo al split de entrenamiento (benigno ×1 copia extra, maligno ×3), resultando en 614 instancias benignas y 592 malignas. El entrenamiento se realizó con entrada de 640×640, 50 épocas, batch 16, optimizador AdamW (lr 0,001429, β₁ 0,9, weight decay 0,0005) en una NVIDIA Tesla T4. La selección del checkpoint se basó en la fitness por defecto de Ultralytics (pesos [0,0,0,1] sobre P, R, mAP@50, mAP@50-95), eligiendo la época 36.

## Capacidades

- Detección de lesiones benignas y malignas en imágenes de ultrasonido de mama mediante cajas delimitadoras.
- Clasificación implícita en dos clases (benigno y maligno) con salida de bounding boxes.
- Inferencia rápida: 5,8 ms por imagen en una GPU T4.
- Manejo de imágenes normales como fondo negativo (sin lesiones).
- Integración sencilla con el ecosistema Ultralytics (carga y predicción con `YOLO`).
- No incluye capacidades de segmentación, clasificación de imágenes completas ni procesamiento de lenguaje.

## Casos de uso

- **Investigación en imagen médica**: el modelo sirve como línea base reproducible para estudios que comparen arquitecturas de detección de lesiones en ultrasonido mamario, gracias a su configuración documentada y su checkpoint público.
- **Prototipado de sistemas de apoyo al diagnóstico**: puede integrarse en demos o pruebas de concepto para evaluar la viabilidad de la detección automática de lesiones, siempre con supervisión humana y sin uso clínico real.
- **Formación y docencia**: útil para enseñar a estudiantes de ingeniería biomédica o informática cómo aplicar YOLOv8 a un problema médico con datos desequilibrados.
- **Evaluación de aumentación de datos**: el pipeline de aumentación específica por clase (benigno ×1, maligno ×3) puede replicarse para estudiar su efecto en el rendimiento de detección.
- **Comparación de métricas de detección**: permite analizar el comportamiento de precisión, recall y mAP en un dataset pequeño, sirviendo como caso de estudio para técnicas de validación.
- **Desarrollo de herramientas de anotación asistida**: aunque no es clínico, podría usarse como pre-anotador en entornos de investigación para acelerar el etiquetado manual de nuevas imágenes.

## Benchmarks y rendimiento

Los resultados reportados en la model card, calculados sobre el split de validación y test, son los siguientes:

| Split | Clase | Precisión (P) | Recall (R) | mAP@50 | mAP@50-95 |
|---|---|---|---|---|---|
| Validación | benigno | 0,928 | 0,799 | 0,839 | 0,634 |
| Validación | maligno | 0,665 | 0,705 | 0,614 | 0,356 |
| Validación | **todos** | **0,797** | **0,752** | **0,726** | **0,495** |
| Test | benigno | 0,761 | 0,783 | 0,817 | 0,585 |
| Test | maligno | 0,679 | 0,645 | 0,656 | 0,428 |
| Test | **todos** | **0,720** | **0,714** | **0,737** | **0,506** |

La precisión y el recall se reportan al nivel de confianza que maximiza la F1 media suavizada entre clases; los valores de mAP son independientes del umbral. La inferencia tarda 5,8 ms por imagen en una T4. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no especificada en la ficha, pero YOLOv8n es un modelo ligero; en FP16 se estima un consumo de 1-2 GB para inferencia a 640×640.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, T4, V100). El entrenamiento se realizó en una T4 de 16 GB.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de gama media como RTX 3060 o superiores.
- **Opciones de despliegue**: compatible con Ultralytics (Python), exportable a ONNX, TensorRT o CoreML. También puede ejecutarse con `YOLO` directamente desde el paquete `ultralytics`.
- **Latencia y throughput**: 5,8 ms por imagen en T4, lo que permite procesar ~172 imágenes por segundo en esa GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. El modelo se basa en YOLOv8n, que es una variante pequeña de la familia YOLOv8. Otros trabajos en la literatura (p. ej., segmentación con YOLOv8/YOLOv11 en ultrasonido de mama) existen, pero no se reportan métricas comparables en esta ficha. Por tanto, la comparativa con alternativas específicas no está disponible.

## Limitaciones y advertencias

- **No apto para uso clínico**: el modelo no ha pasado validación clínica y no debe usarse para diagnóstico o cribado. El rendimiento en la clase maligna (recall 0,645 en test) es insuficiente para cualquier aplicación clínica.
- **Dataset pequeño y desequilibrado**: entrenado con 780 imágenes de un solo centro, con desequilibrio entre clases (437 benignas vs. 210 malignas).
- **División a nivel de imagen, no de paciente**: puede haber solapamiento de imágenes del mismo paciente entre splits, lo que infla las métricas.
- **Una sola ejecución**: no se realizó validación cruzada ni repetición con distintas semillas; los resultados pueden no ser estables.
- **Sin línea base comparativa**: no se comparó con otros detectores, lo que limita la interpretación de los resultados.
- **Anotaciones incompletas**: solo se usa la máscara de la lesión primaria; las lesiones secundarias en imágenes multi-lesión no están etiquetadas.
- **Licencia**: aunque la etiqueta principal es MIT, la model card también menciona cc-by-4.0; se recomienda verificar los términos exactos antes de un uso comercial.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/SevdanurGenc/Lesion-Detection-in-Breast-Ultrasound-Images-with-YOLOv8)
- DOI del repositorio: 10.57967/hf/10143
- Dataset BUSI (artículo original): W. Al-Dhabyani et al., "Dataset of breast ultrasound images," *Data in Brief*, 28:104863, 2020. https://doi.org/10.1016/j.dib.2019.104863
- Manuscrito asociado (pendiente de publicación): *"YOLOv8-Based Automatic Lesion Detection in Breast Ultrasound Images: A Reproducible Evaluation on a Small and Imbalanced Dataset"* (Oğuz & Genç).
