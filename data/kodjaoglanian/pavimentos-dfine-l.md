# Kodjaoglanian/pavimentos-dfine-l

## Resumen

`pavimentos-dfine-l` es un modelo de detección de objetos basado en la arquitectura D-FINE Large (familia DETR), desarrollado por el usuario Kodjaoglanian y publicado en HuggingFace. Se trata de un ajuste fino (*fine-tuning*) del checkpoint `ustc-community/dfine-large-obj2coco-e25` para una única tarea: la detección de baches o socavones (`buraco`) en superficies de pavimento asfáltico, tanto en vías urbanas como interurbanas. El modelo resuelve un problema acotado de inspección de infraestructura viaria mediante visión por computador.

La arquitectura subyacente, D-FINE (*Fine-grained Distribution Refinement for Object Detection*), reformula la regresión de *bounding boxes* en transformadores de visión mediante refinamiento distribucional fino (FDR) y auto-destilación de localización global óptima (GO-LSD), eliminando la necesidad de NMS. El modelo cuenta con 31.202.455 parámetros, procesa entradas de 640x640 píxeles y se distribuye con licencia Apache-2.0, lo que lo diferencia de alternativas de la familia YOLO sujetas a AGPL-3.0.

Su relevancia actual es limitada pero concreta: ofrece una base permisiva para pipelines de inspección automatizada de carreteras, aunque los resultados declarados por el autor (mAP@0.50 de 0,0942) indican un rendimiento bajo que debe evaluarse con cautela antes de cualquier uso en producción. El modelo se publica con pesos en safetensors, exportaciones ONNX y TorchScript, y un total de 19 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE Large (DETR con Fine-grained Distribution Refinement) |
| Parametros totales | 31.202.455 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 640x640 px) |
| Tipos de cuantizacion | no disponible (se distribuyen safetensors, ONNX y TorchScript; no se documentan cuantizaciones) |
| Idiomas soportados | pt, en (etiquetas de clase y documentación; la tarea es visual) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX, TorchScript (pt) |

## Arquitectura y entrenamiento

El modelo se basa en D-FINE Large, una variante de la familia DETR que sustituye la regresión directa de coordenadas por un refinamiento distribucional fino (*Fine-grained Distribution Refinement*, FDR) y emplea auto-destilación de localización global óptima (*Global Optimal Localization Self-Distillation*, GO-LSD). Esta formulación prescinde del post-procesado NMS habitual en detectores de una etapa. El checkpoint base es `ustc-community/dfine-large-obj2coco-e25`, preentrenado sobre COCO.

El ajuste fino se realizó sobre un corpus consolidado de 8.101 imágenes y 21.775 *bounding boxes*, obtenido tras inspeccionar 10.939 imágenes brutas (28.718 anotaciones) y aplicar deduplicación perceptual con pHash de 64 bits (distancia de Hamming <= 2), eliminando 2.837 duplicados, 114 cajas degeneradas o duplicadas intra-imagen y 1 imagen sin anotaciones válidas. Las fuentes son dos proyectos de Roboflow Universe (`localizacao-de-buracos-9mb7f` v2 y `pothole-detection-mapping-and-alert` v1), con mapeo semántico unificado a la clase `buraco`. La división fue estratificada (80/10/10) mediante `MultilabelStratifiedShuffleSplit` con verificación de cero fugas de hash perceptual entre conjuntos: 6.480 imágenes de entrenamiento (17.453 cajas), 810 de validación (2.193 cajas) y 811 de test (2.129 cajas).

El entrenamiento se ejecutó en una Tesla T4 (14,56 GB de VRAM) durante 349,36 minutos, con 20 épocas planificadas y mejor época en la 10. Se usó resolución 640x640, batch 4 con acumulación de gradientes 4 (batch efectivo 16), precisión mixta FP16, optimizador AdamW (lr_head 0,00015, lr_backbone 0,000015, weight_decay 0,0001), scheduler coseno con warmup lineal del 10 % de los pasos, EMA con decay 0,999 y clipping de gradiente con max_norm 0,1. Las aumentaciones (Albumentations) incluyeron HorizontalFlip, RandomBrightnessContrast, HueSaturationValue, ShiftScaleRotate, RandomSizedBBoxSafeCrop, Motion/GaussianBlur y GaussNoise.

## Capacidades

- Detección de objetos de una única clase: `buraco` (bache o socavón en pavimento asfáltico).
- Localización de *bounding boxes* sin NMS, gracias a la formulación DETR de D-FINE.
- Inferencia sobre imágenes estáticas a resolución fija de 640x640 píxeles.
- Exportación a ONNX y TorchScript para despliegue en distintos runtimes.
- Integración con la librería `transformers` (pipeline `object-detection`).
- Compatible con *endpoints* de HuggingFace (etiqueta `endpoints_compatible`).
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión general, audio ni generación de texto: es exclusivamente un detector visual de clase única.

## Casos de uso

- Inspección automatizada de carreteras con cámaras vehiculares: el modelo puede procesar fotogramas de vídeo a 640x640 para localizar baches y alimentar un registro georreferenciado de incidencias; su latencia de 60,60 ms/imagen en Tesla T4 (16,5 FPS) permite procesamiento casi en tiempo real en flujos de vídeo moderados.
- Sistemas de gestión de pavimentos (SGP): inferencia en lote sobre acervos fotográficos históricos para priorizar reparaciones según densidad y distribución de baches detectados.
- Alertas viarias y ciudades inteligentes: despliegue vía ONNX Runtime o TorchScript en nodos periféricos para notificar incidencias a plataformas municipales, con la ventaja de la licencia Apache-2.0 frente a YOLO.
- Preetiquetado asistido para anotación: uso del modelo como generador de propuestas iniciales en flujos de etiquetado humano, reduciendo el coste de anotación en nuevos dominios de pavimento.
- Investigación en visión por computador aplicada a infraestructura: base reproducible para experimentos de *fine-tuning* sobre D-FINE en tareas de defectología vial, con un *pipeline* de limpieza y división documentado.
- Despliegue en CPU para análisis offline: con 1.386,89 ms/imagen (0,7 FPS), es viable para procesamiento por lotes nocturno de archivos fotográficos sin requisitos de GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en la *model card* (no verificados, `verified: false`), sobre el *test split* del dataset unificado de defectos de pavimento (Roboflow Universe Merge):

| Metrica | Valor |
|---|---|
| mAP@0.50 | 0,0942 |
| mAP@0.50:0.95 | 0,0522 |
| Precision | 0,0000 |
| Recall | 0,0000 |
| F1-Score | 0,0000 |

Métricas de validación por época (selección de la mejor época, la 10):

| Epoca | Train Loss | Val mAP@0.50 | Val mAP@0.50:0.95 | Val mAR@100 |
|---|---|---|---|---|
| 1 | 96,5435 | 0,0602 | 0,0300 | 0,3455 |
| 2 | 39,9316 | 0,0490 | 0,0256 | 0,5008 |
| 3 | 34,3409 | 0,0281 | 0,0147 | 0,5177 |
| 4 | 33,0785 | 0,0281 | 0,0143 | 0,5301 |
| 5 | 32,1844 | 0,0396 | 0,0209 | 0,5721 |
| 6 | 31,5671 | 0,0499 | 0,0266 | 0,5879 |
| 7 | 31,2063 | 0,0650 | no disponible | no disponible |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los valores de Precision, Recall y F1 a umbral de confianza 0,25 son cero, lo que sugiere que el modelo no produce detecciones por encima de ese umbral en el conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó en una Tesla T4 de 14,56 GB, y un modelo de 31,2 M de parámetros en FP16 ocupa aproximadamente 62 MB de pesos, por lo que la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: Tesla T4 (referencia medida: 60,60 ms/imagen), y por tamaño cualquier GPU consumer moderna (RTX 3060 en adelante) debería acomodar el modelo; no se han publicado mediciones en otras GPU.
- Cabe en GPU consumer: sí, por volumen de parámetros; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: `transformers` (pipeline `object-detection`), ONNX Runtime (exportación ONNX incluida, aunque la validación numérica reportada es `False` con diferencia máxima de cajas de 0,234613), TorchScript y endpoints de HuggingFace.
- Latencia y throughput: 60,60 ms/imagen en Tesla T4 (16,5 FPS) y 1.386,89 ms/imagen en CPU (0,7 FPS).

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. A continuación se comparan únicamente atributos estructurales verificables:

| Modelo | Parametros | Contexto/Entrada | Licencia | Tarea |
|---|---|---|---|---|
| pavimentos-dfine-l | 31,2 M | 640x640 px | Apache-2.0 | Detección de baches (1 clase) |
| ustc-community/dfine-large-obj2coco-e25 (base) | no disponible | 640x640 px | no disponible | Detección COCO (80 clases) |
| YOLO (familia, referencia cualitativa) | variable | variable | AGPL-3.0 | Detección general |

La comparación de rendimiento con alternativas no está disponible; el autor solo justifica la elección de D-FINE frente a YOLO por la licencia permisiva Apache-2.0.

## Limitaciones y advertencias

- Rendimiento bajo declarado: mAP@0.50 de 0,0942 y mAP@0.50:0.95 de 0,0522 en test; Precision, Recall y F1 nulos a confianza 0,25, lo que indica que el modelo apenas produce detecciones útiles en el conjunto de evaluación.
- Métricas no verificadas (`verified: false`) y declaradas por el propio autor; no han sido reproducidas de forma independiente.
- Clase única (`buraco`): no detecta otras patologías del pavimento (grietas, baches superficiales, hundimientos) ni objetos viarios.
- Dominio restringido: entrenado sobre dos datasets de Roboflow Universe, con posible sesgo hacia condiciones de iluminación, clima, tipo de asfalto y geografía de esas fuentes; la generalización a otros entornos no está validada.
- Validación ONNX fallida: la exportación ONNX se realizó pero la validación numérica reporta `False`, con diferencia máxima de cajas de 0,234613; debe verificarse antes de desplegar en ONNX Runtime.
- Riesgo de falsos negativos y positivos en producción: con Recall nulo en test, la fiabilidad para alertas automáticas es cuestionable.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no obstante, la licencia del checkpoint base (`ustc-community/dfine-large-obj2coco-e25`) debe verificarse de forma independiente.
- Sin soporte multilingüe ni de texto: las etiquetas `pt` y `en` se refieren a la documentación y nombres de clase, no a capacidades lingüísticas.
- Fecha de creación futura registrada (2026-10-30) y solo 19 descargas: modelo de baja madurez y escasa validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kodjaoglanian/pavimentos-dfine-l
- Modelo base: https://huggingface.co/ustc-community/dfine-large-obj2coco-e25
- Dataset fuente 1 (Roboflow Universe): https://universe.roboflow.com/projetos-diversos/localizacao-de-buracos-9mb7f
- Dataset fuente 2 (Roboflow Universe): https://universe.roboflow.com/major-project-fsf4o/pothole-detection-mapping-and-alert
- Curvas de entrenamiento (referenciadas en la model card): `runs/training_curves.png` (ruta relativa al repositorio, no disponible como URL pública verificada)
- Paper de D-FINE: no disponible en la información proporcionada
- Repositorio de código de D-FINE: no disponible en la información proporcionada
