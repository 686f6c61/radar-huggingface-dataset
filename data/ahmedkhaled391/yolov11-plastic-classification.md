# AhmedKhaled391/yoloV11-plastic-classification

## Resumen

yoloV11-plastic-classification es un detector de objetos YOLOv11n especializado en la clasificación de residuos plásticos, concretamente botellas de PET y envases de HDPE, sobre cintas transportadoras de plantas de reciclaje. Lo desarrolla AhmedKhaled391 como reproducción crítica del mejor modelo velocidad/precisión del trabajo de Miski (2026) publicado en *Scientific Reports*, incorporando dos mejoras metodológicas: una evaluación libre de fuga de datos (split por ítem físico) y la publicación de las anotaciones generadas automáticamente para las imágenes de cinta transportadora.

El modelo parte de pesos COCO-pretrained de YOLOv11n (Ultralytics 8.4) y se afina sobre el dataset `AhmedKhaled391/pet-hdpe-detection`, con solo 2,6 M de parámetros, 6,6 GFLOPs y un peso de 5,5 MB. Trabaja a 640 px de entrada y distingue dos clases (`0: PET`, `1: HDPE`).

Su relevancia radica en que demuestra que un detector ultraligero puede alcanzar mAP@0.5 de 0,984 en una tarea industrial concreta con una latencia de 12 ms en una GPU de portátil (RTX 3060) y 31 ms en CPU, lo que lo hace desplegable en hardware de borde dentro de una línea de selección de residuos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv11n (Ultralytics 8.4), COCO-pretrained y fine-tuned |
| Parametros totales | 2,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 640 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

YOLOv11n es un detector de objetos de una etapa basado en una red troncal convolucional con cuello de agregación de características y cabecera de detección sin anclas (anchor-free). El modelo parte de pesos preentrenados en COCO y se afina para dos clases. La entrada es de 640 px, con 6,6 GFLOPs de cómputo por inferencia.

El entrenamiento usa el dataset `AhmedKhaled391/pet-hdpe-detection`, compuesto por la fuente Kaggle *Drinking Waste Classification* y las imágenes de cinta transportadora PET/HDPE del proyecto FORTH/RECLAIM. El split es 80/10/10 por ítem físico (ráfagas completas de fotos se reservan para val/test y se eliminan duplicados del train), resultando en 6.612 / 348 / 387 imágenes tras una aumentación offline ×3 del conjunto de entrenamiento. Se usa SGD con lr0 0,01, weight decay 5e-4, batch 16 acumulado a 64 nominal, hasta 100 épocas con early stopping tras 50 sin mejora. El entrenamiento terminó en la época 85 (mejor checkpoint en la 35) en 1,6 h sobre una RTX 3060 Laptop de 6 GB. No se aplicó aumentación online porque se hizo offline, siguiendo el paper original. Las anotaciones de las imágenes RECLAIM se generaron automáticamente mediante sustracción de fondo y self-training filtrado, y se publican junto al modelo.

## Capacidades

- Detección de objetos con cajas delimitadoras para dos clases: botellas de PET y envases de HDPE.
- Clasificación de material plástico por ítem detectado, con 99,7 % de acierto de clase sobre objetos detectados en el split de test.
- Inferencia sobre imagen individual, vídeo, webcam o stream (soporte estándar de Ultralytics vía `yolo predict`).
- Ejecución en CPU y GPU, con latencias de 12 ms (RTX 3060 Laptop) y 31 ms (CPU) por lote de 1.
- Ajuste del umbral de confianza para priorizar recall de HDPE (p. ej. `conf=0.15`) a costa de precisión.
- Exportación a otros formatos de despliegue mediante las utilidades de Ultralytics (ONNX, TensorRT, etc.; no verificado en la información disponible).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de detección.

## Casos de uso

- Clasificación en cinta transportadora de reciclaje: el modelo detecta y etiqueta botellas PET y envases HDPE en cada fotograma de una cámara industrial; con 12 ms por inferencia en GPU de gama media permite procesar vídeo en tiempo real y accionar soplos o brazos neumáticos de separación.
- Triaje automático en plantas de recuperación de materiales (MRF): integrado en la línea, distingue PET de HDPE para enrutar cada ítem a la fracción correcta, reduciendo la contaminación cruzada entre flujos.
- Control de calidad en instalaciones de reciclaje: se puede usar para auditar la pureza de un lote contando cuántos ítems de la clase incorrecta aparecen en una imagen o secuencia, gracias a la alta precisión por clase reportada.
- Despliegue en hardware de borde: con 5,5 MB de pesos y 31 ms en CPU, cabe en dispositivos empotrados o mini-PC sin GPU dentro de la propia máquina de selección.
- Prototipado e investigación en visión aplicada al reciclaje: el pipeline completo (construcción del dataset, auditoría de fuga, entrenamiento, evaluación y predicción) está publicado en la carpeta `code/`, lo que facilita reproducir y extender el experimento.
- Etiquetado asistido de nuevas imágenes: el modelo puede preanotar imágenes de cintas transportadoras y servir de base para un bucle de self-training o para reducir el coste de anotación manual en nuevas líneas.
- Monitorización remota de contenedores o puntos de recogida: sobre imágenes fijas o webcam, detectar la presencia y proporción de PET frente a HDPE para informes de composición de residuos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test a nivel de ítem (387 imágenes, ningún ítem visto en entrenamiento):

| Metrica | Este modelo | Mismo modelo, split aleatorio del paper | Paper (YOLOv11n, split aleatorio) |
|---|---|---|---|
| mAP@0.5 | 0,984 | 0,989 | 0,992 |
| mAP@0.5:0.95 | 0,885 | 0,908 | 0,937 |
| Precision | 0,973 | 0,994 | 0,990 |
| Recall | 0,960 | 0,968 | 0,994 |
| F1 | 0,967 | 0,981 | 0,992 |

Desglose por clase:

| Clase | mAP@0.5 | mAP@0.5:0.95 | Precision | Recall |
|---|---|---|---|---|
| PET | 0,991 | 0,917 | 0,975 | 0,981 |
| HDPE | 0,976 | 0,852 | 0,971 | 0,940 |

Precisión de clasificación: 99,2 % de imágenes con la clase correcta en su caja más confiable (384/387); 99,7 % de objetos detectados con clase correcta (646/648); 98,9 % de todos los objetos encontrados y clasificados correctamente contando los no detectados como error (646/653).

## Requisitos de hardware

- VRAM estimada: muy baja; el peso del modelo es de 5,5 MB y 2,6 M de parámetros, por lo que la inferencia cabe holgadamente en cualquier GPU consumer (menos de 1 GB en la práctica para lotes pequeños).
- GPU recomendadas: RTX 3060 Laptop (referencia del autor, 12 ms por lote de 1); cualquier GPU NVIDIA con al menos 6 GB es suficiente. Para entrenamiento se usó una RTX 3060 Laptop de 6 GB durante 1,6 h.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (RTX 20xx en adelante) e incluso en CPU con 31 ms por inferencia.
- Opciones de despliegue: Ultralytics (Python y CLI `yolo predict`), exportación a ONNX/TensorRT/OpenVINO mediante las utilidades de Ultralytics (no verificado en la información disponible), integración en pipelines Python vía `ultralytics.YOLO`.
- Latencia y throughput: 12 ms por imagen (batch 1) en RTX 3060 Laptop; 31 ms en CPU. El throughput exacto en otras GPU no está disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | mAP@0.5 (PET/HDPE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yoloV11-plastic-classification | 2,6 M | 640 px | 0,984 | AGPL-3.0 | Hugging Face |
| YOLOv11n del paper (Miski 2026) | 2,6 M | 640 px | 0,992 (split aleatorio, con fuga) | no disponible | no disponible |
| YOLOv11n base (COCO) | 2,6 M | 640 px | no aplica (no entrenado en PET/HDPE) | AGPL-3.0 | Ultralytics |

La comparación directa con el modelo del paper no es homogénea: el paper usa un split aleatorio que introduce fuga de ítems entre train y test, por lo que sus métricas están infladas respecto a la evaluación libre de fuga de este modelo. No se dispone de datos de otros detectores ligeros especializados en PET/HDPE para una comparativa adicional.

## Limitaciones y advertencias

- El recall de HDPE es el punto débil (0,940): la mayoría de errores son ítems HDPE no detectados. Bajar `conf` a 0,15 recupera HDPE a costa de precisión.
- Parte de las cajas de las imágenes RECLAIM fueron generadas automáticamente (sustracción de fondo y self-training filtrado), no anotadas a mano; son algo más holgadas, lo que penaliza principalmente mAP@0.5:0.95.
- Las imágenes de test provienen de las mismas fuentes que las de entrenamiento: se espera una precisión menor ante cámaras, iluminación o ítems muy aplastados o sucios distintos de los vistos; conviene afinar con imágenes de la línea concreta antes de producción.
- Licencia AGPL-3.0: el uso comercial en un servicio en red obliga a liberar el código fuente derivado bajo la misma licencia; revisar implicaciones antes de integrar en producto propietario.
- Riesgo de falsos positivos o confusiones PET/HDPE en condiciones de oclusión o solapamiento de ítems no documentadas explícitamente.
- Modelo puramente visual: no procesa texto, audio ni lenguaje natural; las capacidades multilingües, tool calling y agentes no aplican.
- No se han documentado sesgos demográficos (no aplica), pero sí un posible sesgo hacia las condiciones de captura de las fuentes de entrenamiento (Kaggle y RECLAIM).

## Enlaces

- Hugging Face del modelo: https://huggingface.co/AhmedKhaled391/yoloV11-plastic-classification
- Dataset de entrenamiento: https://huggingface.co/datasets/AhmedKhaled391/pet-hdpe-detection
- Paper de referencia (Miski 2026, Scientific Reports 16:2745): no disponible enlace directo en la información proporcionada
- Dataset RECLAIM PET/HDPE (Zenodo 11065269): https://zenodo.org/records/11065269
- Dataset RECLAIM PET/HDPE (Zenodo 11065210): https://zenodo.org/records/11065210
- Dataset Kaggle *Drinking Waste Classification* (Arkadiy Serezhkin, CC0): no disponible enlace directo en la información proporcionada
- Ultralytics (framework): no disponible enlace directo en la información proporcionada
- Código del pipeline (`code/`), informe (`REPORT.md`) y gráficas (`plots/`): incluidos en el repositorio de Hugging Face del modelo
