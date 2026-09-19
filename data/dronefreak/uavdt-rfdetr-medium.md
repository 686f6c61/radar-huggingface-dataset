# dronefreak/uavdt-rfdetr-medium

## Resumen

`dronefreak/uavdt-rfdetr-medium` es un detector de objetos para imagen aerea obtenido mediante fine-tuning de `Roboflow/rf-detr-medium` sobre el conjunto de datos UAVDT (UAV-benchmark-M con anotaciones de vehiculos en secuencias grabadas por dron). Lo publica el autor `dronefreak` como parte de DetectionBench, un framework cuyo objetivo es reproducir recetas de entrenamiento y evaluacion identicas para comparar detectores modernos sobre varios conjuntos de datos reales. El modelo resuelve la tarea de deteccion de vehiculos (car, truck, bus) en imagenes capturadas desde plataformas aereas, un escenario con objetos pequenos, alta densidad y fuerte desbalance de clases.

Arquitectura basada en RF-DETR, un detector tipo transformer (DETR) con backbone preentrenado, con 33,7 millones de parametros. El repositorio ocupa aproximadamente 0,1 GB y se distribuye con licencia Apache-2.0. No se especifican en la informacion disponible la longitud de contexto, los idiomas ni los formatos de cuantizacion, ya que se trata de un modelo puramente visual y no de un modelo de lenguaje.

Su relevancia es acotada y muy especifica: constituye una referencia reproducible de RF-DETR Medium sobre UAVDT dentro del zoo de modelos de DetectionBench, con resultados declarados por el autor (mAP@50 de 15,02 %, mAP@50-95 de 8,76 %) y no verificados de forma independiente. Los resultados son modestos en terminos absolutos, lo que refleja la dificultad del conjunto UAVDT, y el modelo se comporta de forma muy desigual entre clases (mAP@50 de 34,58 % en `car` frente a 2,66 % en `truck`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (detector transformer tipo DETR con backbone preentrenado); base: Roboflow/rf-detr-medium |
| Parametros totales | 33,7 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de deteccion de objetos; no se especifica la resolucion de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible en detalle; se carga mediante la libreria `rfdetr` (checkpoint de PyTorch) |
| Tarea | object-detection |
| Clases | car, truck, bus |
| Dataset de entrenamiento y evaluacion | dronefreak/UAVDT |
| FLOPs | no publicado (indicado como N/A en la model card) |
| Tamano del repositorio | ~0,1 GB |
| Fecha de creacion | 2026-09-18 |
| Fecha de ultima actualizacion | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `Roboflow/rf-detr-medium`, perteneciente a la familia RF-DETR. RF-DETR es un detector de la familia DETR (transformer sobre imagenes) que sustituye la necesidad de anclas y de supresion de no maximos por un emparejamiento conjunto entre predicciones y objetos reales; la variante *medium* de la familia se corresponde con un backbone de mayor capacidad que las variantes *nano* y *small* y con 33,7 M de parametros, segun los datos declarados en la model card. No se detalla en la informacion disponible el numero exacto de capas, la dimension del embedding ni el backbone concreto empleado.

El entrenamiento se realizo sobre el conjunto UAVDT, con tres clases (`car`, `truck`, `bus`), dentro del pipeline de DetectionBench, cuyo proposito es aplicar recetas de entrenamiento y metricas de evaluacion identicas a varios detectores para permitir comparaciones honestas entre arquitecturas. La evaluacion se llevo a cabo sobre el split de test de UAVDT con la herramienta `detectionbench-evaluate` y con las metricas de deteccion de la libreria Supervision. No se documentan en la informacion proporcionada el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de ajuste adicionales (por ejemplo, destilacion, aumento de datos o calibracion de umbrales). Tampoco se documentan innovaciones tecnicas especificas mas alla de las propias de RF-DETR.

## Capacidades

- Deteccion de objetos en imagenes aereas capturadas por dron (UAV), con salida de cajas delimitadoras y etiquetas de clase.
- Deteccion de tres clases de vehiculos: `car`, `truck` y `bus`.
- Deteccion de objetos pequenos en escenas aereas, segun la propia etiquetacion del autor (`small-object-detection`).
- Aplicable a imagenes individuales y, por extension, a fotogramas de video procedentes de secuencias de dron (la model card incluye una demostracion en video sobre dos clips de test de UAVDT).
- Integracion en pipelines de vision por computador mediante la libreria `rfdetr` y `huggingface_hub`.
- Evaluacion estandarizada con las metricas de Supervision (mAP, precision, recall) a traves de DetectionBench.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente ni soporte multilingue: es exclusivamente un modelo de deteccion visual.

## Casos de uso

- Monitorizacion de trafico urbano desde dron: el modelo puede procesar fotogramas de video aereo para localizar y contar vehiculos en carreteras y cruces, aprovechando su entrenamiento especifico sobre UAVDT, que recoge precisamente escenas de trafico grabadas desde plataformas aereas.
- Analisis de congestion y aforo de vias: agregando las detecciones por fotograma se pueden estimar densidades de trafico y patrones de ocupacion a lo largo del tiempo, aunque la precision limitada en `truck` y `bus` obliga a tratar esas clases con cautela.
- Auditoria de infraestructura viaria: deteccion de vehiculos estacionados o en circulacion sobre imagenes aereas para tareas de inventario y planificacion, usando principalmente la clase `car`, que es la que presenta mejor rendimiento (mAP@50 de 34,58 %).
- Investigacion academica en deteccion aerea: el modelo sirve como referencia reproducible de RF-DETR Medium en UAVDT dentro de DetectionBench, util para comparar arquitecturas bajo una receta de entrenamiento y evaluacion comun.
- Generacion de pseudoetiquetas para conjuntos aereos: puede emplearse como preanotador de imagenes de dron, siempre que se aplique una revision humana y un umbral de confianza alto para mitigar los falsos positivos ligados a su precision moderada (40,28 %).
- Vigilancia de aparcamientos y recintos exteriores desde UAV: deteccion de vehiculos presentes en una zona acotada para tareas de conteo periodico, asumiendo que el modelo se ha entrenado con una perspectiva y altitud similares a las de UAVDT.
- Sistemas de alerta temprana en carretera: integracion de las detecciones en un pipeline de video en tiempo real para detectar acumulaciones anomales de vehiculos, con la salvedad de que no se han publicado datos de latencia ni de throughput.
- Prototipado rapido de aplicaciones de vision aerea: al ser un checkpoint de 33,7 M de parametros con licencia Apache-2.0 y ~0,1 GB de peso, resulta ligero para pruebas de concepto y despliegues en el borde antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card, evaluados sobre el split de test de UAVDT con el pipeline `detectionbench-evaluate` de DetectionBench. La model card marca estas metricas como no verificadas (`verified: false`).

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 15,02 |
| mAP@50-95 | 8,76 |
| Precision | 40,28 |
| Recall | 61,14 |
| F1 | 48,56 |
| Parametros | 33,7 M |
| FLOPs | N/A (no publicado) |

Rendimiento por clase (test de UAVDT):

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| car | 34,58 | 19,09 |
| truck | 2,66 | 1,59 |
| bus | 7,81 | 5,59 |

Zoo de modelos de DetectionBench evaluados sobre UAVDT (datos de la model card, mismo protocolo de evaluacion):

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) |
|---|---|---|---|---|
| RF-DETR Medium (este modelo) | 15,02 | 8,76 | 40,28 | 61,14 |
| RF-DETR Small | 14,89 | 8,92 | 38,83 | 61,65 |
| YOLOv26s | 14,09 | 7,91 | 23,88 | 27,05 |
| RF-DETR Nano | 12,96 | 7,33 | 37,12 | 55,40 |
| YOLOv26m | 12,32 | 6,66 | 19,44 | 25,83 |
| YOLOv8m | 12,28 | 7,05 | 19,73 | 25,33 |
| YOLOv11x | 11,98 | 6,68 | 18,70 | 25,93 |
| YOLOv8s | 11,48 | 6,71 | 19,34 | 23,39 |
| YOLOv8n | 10,79 | 6,42 | 18,61 | 24,58 |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 135 MB en FP32 y 67 MB en FP16, calculado a partir de los 33,7 M de parametros. Esta cifra es una estimacion derivada del recuento de parametros, no un dato publicado por el autor.
- VRAM total de inferencia: no disponible de forma oficial. Ademas de los pesos hay que contabilizar activaciones y buffers de imagen; al ser un detector de 33,7 M de parametros, es razonable esperar un consumo muy inferior a 2 GB en FP16, aunque no hay cifras confirmadas.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, el modelo es apto para GPU de consumo (por ejemplo, gamas RTX 3060/4070/4090) y para GPU de centro de datos (A100, H100), pero el autor no publica recomendaciones.
- Cabe en GPU de consumo: si, segun el recuento de parametros (33,7 M) y el tamano del repositorio (~0,1 GB), aunque no hay confirmacion oficial ni cifras de VRAM medidas.
- Opciones de despliegue: la model card indica la libreria `rfdetr` junto con `huggingface_hub` para cargar el checkpoint. No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa dentro del mismo conjunto de evaluacion (UAVDT) y con el mismo protocolo, segun los datos de la model card. Los parametros solo se conocen para el modelo de esta ficha (33,7 M); para el resto no se proporcionan.

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RF-DETR Medium (este modelo) | 15,02 | 8,76 | 40,28 | 61,14 | Apache-2.0 | Hugging Face (`dronefreak/uavdt-rfdetr-medium`) |
| RF-DETR Small | 14,89 | 8,92 | 38,83 | 61,65 | no disponible | Zoo de UAVDT de DetectionBench |
| RF-DETR Nano | 12,96 | 7,33 | 37,12 | 55,40 | no disponible | Zoo de UAVDT de DetectionBench |
| YOLOv26s | 14,09 | 7,91 | 23,88 | 27,05 | no disponible | Zoo de UAVDT de DetectionBench |
| YOLOv8m | 12,28 | 7,05 | 19,73 | 25,33 | no disponible | Zoo de UAVDT de DetectionBench |

Observaciones: este checkpoint lidera el mAP@50 del zoo en la tabla publicada, pero la ventaja sobre RF-DETR Small es marginal (15,02 frente a 14,89), e incluso RF-DETR Small obtiene mejor mAP@50-95 (8,92 frente a 8,76). La precision y el recall son notablemente mas altos que los de los modelos YOLO comparados con este protocolo. No se dispone de comparativas con detectores especificos de imagen aerea (por ejemplo, variantes de YOLO adaptadas a UAV) fuera de las que aparecen en el zoo de DetectionBench.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: un mAP@50 de 15,02 % y un mAP@50-95 de 8,76 % sobre UAVDT indican que el modelo falla en la mayoria de las detecciones con umbrales IoU estrictos; no es adecuado para produccion sin una validacion exhaustiva en el dominio objetivo.
- Fuerte desequilibrio entre clases: `car` alcanza 34,58 % de mAP@50, mientras que `truck` cae a 2,66 % y `bus` a 7,81 %. La deteccion de camiones es practicamente inutilizable en su estado actual.
- Precision moderada (40,28 %) con recall mas alto (61,14 %): el modelo tiende a generar falsos positivos, lo que obliga a filtrar por confianza si se usa para conteo o alertas automaticas.
- Metricas no verificadas: la model card marca todos los resultados como `verified: false`; no hay una evaluacion independiente publicada en la informacion disponible.
- Dependencia del dominio: el modelo esta ajustado a UAVDT (perspectiva aerea, altitud y tipo de escenas concretos). Es previsible una degradacion notable en imagenes terrestres, con otra altitud, otros sensores o condiciones de iluminacion distintas a las del conjunto de entrenamiento. No se documentan pruebas de generalizacion fuera de UAVDT.
- Sin informacion sobre sesgos: no se describen sesgos geograficos, de condiciones meteorologicas, de iluminacion ni de resolucion de sensor.
- Riesgo de alucinacion: aplicable en su equivalente visual, es decir, detecciones de vehiculos inexistentes, especialmente en clases poco representadas.
- Limitaciones de resolucion y objetos pequenos: aunque el modelo esta etiquetado como `small-object-detection`, la baja mAP global sugiere dificultades con objetos pequenos y densos, tipicos de la imagen aerea.
- Licencia: Apache-2.0 para este checkpoint, lo que permite uso comercial. Conviene verificar de forma independiente la licencia del modelo base `Roboflow/rf-detr-medium` y las condiciones de uso del conjunto UAVDT, descritas en su dataset card, antes de un despliegue comercial.
- Ausencia de datos operativos: no hay cifras publicadas de latencia, throughput ni VRAM medida, por lo que las estimaciones de despliegue deben validarse en el hardware objetivo.
- Resultados de busqueda web: la busqueda realizada no devolvio ningun resultado relevante para este modelo (los resultados obtenidos correspondian a contenido sin relacion). No se han podido contrastar los datos de la model card con fuentes externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/uavdt-rfdetr-medium
- Conjunto de datos UAVDT: https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench (framework de evaluacion y zoo de modelos): https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Roboflow/rf-detr-medium
- Libreria Supervision (metricas de deteccion): https://github.com/roboflow/supervision
- Referencias arXiv incluidas en las etiquetas del modelo (identificadores tal como aparecen en la model card; no se detalla a que trabajo corresponde cada uno):
  - https://arxiv.org/abs/1804.00518
  - https://arxiv.org/abs/2511.09554
  - https://arxiv.org/abs/2304.07193
  - https://arxiv.org/abs/2410.17725
  - https://arxiv.org/abs/2606.03748
