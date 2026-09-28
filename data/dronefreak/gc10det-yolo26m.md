# dronefreak/gc10det-yolo26m

# GC10-DET YOLO26m (dronefreak/gc10det-yolo26m)

## Resumen

gc10det-yolo26m es un detector de objetos de la familia YOLO26, en su variante medium, ajustado por el usuario dronefreak sobre el conjunto de datos GC10-DET, un benchmark de defectos superficiales en tiras de acero. Se publica como parte de DetectionBench, un marco que aplica recetas de entrenamiento y metricas de evaluacion identicas a varios detectores modernos para permitir comparaciones reproducibles entre ellos.

El modelo parte de los pesos Ultralytics/YOLO26 y cuenta con 21,9 millones de parametros y 75,4 GFLOPs a 640 px. Detecta diez clases de defecto industrial: crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line.

Su relevancia esta en el ambito del control de calidad industrial: proporciona un punto de referencia abierto bajo licencia AGPL-3.0 para la inspeccion automatica de superficies metalicas, con metricas declaradas por el autor de mAP@50 = 73,97 % y mAP@50-95 = 36,94 % sobre el split de test de GC10-DET.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de una etapa, familia YOLO26 de Ultralytics (variante medium); no se detallan mas especificidades internas en la model card |
| Parametros totales | 21,9 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision por computador, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible en la model card; la libreria Ultralytics permite exportar a formatos como ONNX, TensorRT, OpenVINO o TFLite, aunque no se confirma para esta variante concreta |
| Idiomas soportados | no aplica (modelo de deteccion de objetos; no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (archivo best.pt, cargado mediante la libreria ultralytics) |

## Arquitectura y entrenamiento

La model card identifica el modelo base como Ultralytics/YOLO26 en su variante medium y la libreria utilizada es ultralytics, con pipeline declarado de object-detection. Se trata por tanto de un detector de una etapa reentrenado (fine-tuning) sobre un dominio especifico de defectos superficiales. La documentacion publicada no detalla la topologia interna de la red ni innovaciones arquitectonicas concretas de la familia YOLO26, por lo que esos aspectos quedan como no disponibles.

El entrenamiento se realizo sobre el conjunto GC10-DET, compuesto por diez clases de defectos en superficie metalica (crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line). El modelo forma parte de DetectionBench, cuyo objetivo es aplicar recetas de entrenamiento y metricas de evaluacion identicas a distintos detectores para que las comparaciones sean reproducibles. No se especifican en la informacion disponible el numero de imagenes de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de refuerzo como RLHF o DPO (no aplicables a un detector de objetos). La evaluacion se realiza con el pipeline estandar `detectionbench-evaluate` sobre el split de test.

## Capacidades

- Deteccion de objetos en imagenes de superficies metalicas, con localizacion mediante cajas delimitadoras y clasificacion en diez tipos de defecto.
- Deteccion de defectos concretos: crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line.
- Inferencia a resolucion de 640 px, con 75,4 GFLOPs por imagen.
- Carga e integracion mediante la libreria Ultralytics (`YOLO(weights)`) junto con `huggingface_hub` para la descarga de los pesos.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues (no procesa texto).
- No dispone de modo de razonamiento (thinking mode), audio ni generacion de imagenes.

## Casos de uso

- Control de calidad en linea de produccion de acero: el modelo puede inspeccionar cada imagen capturada por camaras industriales y marcar la presencia de defectos como rolled_pit, welding_line o punching_hole, con mAP@50 por clase que en varios casos supera el 90 % (rolled_pit 99,5 %, welding_line 96,63 %, crescent_gap 96,72 %).
- Priorizacion de defectos en inspeccion manual: al detectar y clasificar automaticamente las anomalias, permite que los operarios se centren en las imagenes con mayor probabilidad de defecto y no revisen la totalidad del lote.
- Auditoria de lotes y trazabilidad: integrado en un sistema MES o SCADA, el detector puede registrar por lote el recuento y tipo de defectos detectados, generando informes de calidad reproducibles.
- Preetiquetado para anotacion: el modelo puede generar propuestas de cajas y etiquetas sobre nuevas imagenes de superficie metalica, acelerando el trabajo de etiquetado humano en la ampliacion del dataset.
- Despliegue en el borde (edge) junto a la camara: dado su tamano de 21,9 M de parametros, es viable ejecutarlo en hardware embebido cercano a la linea de produccion para reducir latencia y dependencia de red.
- Investigacion y benchmarking de detectores: forma parte del zoo de modelos de DetectionBench, por lo que sirve como referencia comparativa frente a RF-DETR, YOLO26s, YOLO11 o YOLOv8 bajo una misma receta de evaluacion.
- Filtrado de imagenes en grandes volumenes: puede descartar rapidamente imagenes sin defectos antes de pasarlas a un modelo de mayor coste o a revision humana.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de GC10-DET (no verificados de forma independiente):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 73,97 |
| mAP@50-95 | 36,94 |
| Precision | 75,7 |
| Recall | 68,19 |
| F1 | 71,75 |
| Parametros | 21,9 M |
| FLOPs | 75,4 B (a 640 px) |

Comparativa del zoo de modelos sobre el mismo dataset (datos declarados por el autor):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small | 76,07 | 42,51 | 87,86 | 65,03 |
| RF-DETR Medium | 75,93 | 41,93 | 78,25 | 67,76 |
| YOLO26s | 75,77 | 38,15 | 77,16 | 74,07 |
| YOLO26n | 74,25 | 38,31 | 80,50 | 67,99 |
| YOLO26m (este modelo) | 73,97 | 36,94 | 75,70 | 68,19 |
| YOLOv8n | 73,25 | 38,74 | 67,99 | 70,87 |
| YOLO11s | 72,54 | 35,07 | 72,39 | 66,80 |
| YOLOv8s | 72,54 | 37,79 | 78,54 | 65,23 |
| YOLOv8m | 71,88 | 38,80 | 69,77 | 70,84 |
| YOLO11n | 70,44 | 40,09 | 78,93 | 62,64 |
| RF-DETR Nano | 70,17 | 38,06 | 77,08 | 71,04 |

Rendimiento por clase (mAP declarado por el autor):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crease | 31,02 | 15,79 |
| crescent_gap | 96,72 | 60,27 |
| inclusion | 38,43 | 9,81 |
| oil_spot | 56,38 | 24,57 |
| punching_hole | 91,87 | 46,21 |
| rolled_pit | 99,50 | 41,10 |
| silk_spot | 52,75 | 24,22 |
| waist_folding | 88,97 | 47,57 |
| water_spot | 87,46 | 52,34 |
| welding_line | 96,63 | 47,50 |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB con precision FP16 a 640 px (estimacion propia a partir de los 21,9 M de parametros y 75,4 GFLOPs; no confirmada por el autor).
- GPU de centro de datos recomendadas: A100, H100 o L40S para maximizar throughput en lotes grandes.
- GPU de consumo: cabe con holgura en cualquier GPU consumer moderna, como RTX 3060, RTX 4060, RTX 4070 o RTX 4090.
- Hardware embebido: por tamano, es apto para plataformas tipo NVIDIA Jetson (Orin Nano, Orin NX) previa exportacion a un runtime optimizado.
- Opciones de despliegue: inferencia nativa con la libreria Ultralytics (PyTorch); la propia libreria permite exportar a ONNX, TensorRT, OpenVINO, TFLite y formatos equivalentes, habilitando despliegues en servidor, borde o navegador.
- Latencia y throughput: no publicados en la informacion disponible; dependen del hardware, del backend de exportacion y del tamano de lote.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 (GC10-DET) | mAP@50-95 (GC10-DET) | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26m (este modelo) | 21,9 M | 73,97 | 36,94 | AGPL-3.0 | Variante medium, familia Ultralytics |
| YOLO26s | no disponible | 75,77 | 38,15 | AGPL-3.0 | Variante small, mejor mAP@50 que la medium en este benchmark |
| RF-DETR Small | no disponible | 76,07 | 42,51 | no disponible | Mejor mAP@50 y mAP@50-95 de la comparativa; precision mas alta (87,86) |
| YOLOv8m | no disponible | 71,88 | 38,80 | AGPL-3.0 | Generacion anterior de YOLO; recall ligeramente superior (70,84) |

Observacion relevante: en este benchmark concreto la variante medium de YOLO26 no supera a la small (75,77 frente a 73,97 en mAP@50), y los modelos RF-DETR alcanzan mejores valores de mAP, aunque tambien son mas lentos en inferencia por su naturaleza transformer. La informacion sobre parametros y licencias de los modelos comparados no siempre esta disponible en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible.
- Riesgo de alucinacion: en deteccion de objetos el riesgo equivalente son falsos positivos; la precision declarada (75,7 %) y el recall (68,19 %) indican que existe una tasa apreciable de omisiones y detecciones incorrectas.
- Clases con rendimiento bajo: crease (mAP@50 31,02), inclusion (38,43) y silk_spot (52,75) presentan valores muy inferiores a los del resto, por lo que no son fiables para automatizacion sin revision humana.
- Ambito de aplicacion limitado: el modelo esta ajustado a imagenes de superficies metalicas con los diez defectos de GC10-DET; su rendimiento fuera de ese dominio no esta garantizado.
- Sin validacion independiente: las metricas estan declaradas por el autor y marcadas como no verificadas en el model-index.
- Licencia AGPL-3.0: el uso comercial implica obligaciones de copyleft; si se integra en un servicio distribuido en red, puede obligar a liberar el codigo fuente completo del servicio. Conviene revisar la compatibilidad con un producto propietario antes de adoptarlo en produccion.
- Repositorio con 0 descargas, 0 likes y tamano declarado de 0,0 GB, lo que sugiere una publicacion muy reciente y sin adopcion comunitaria.
- No se especifican requisitos de hardware, latencia ni instrucciones de despliegue en produccion mas alla del ejemplo de inferencia.
- La busqueda web realizada no aporto informacion adicional relevante sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/gc10det-yolo26m
- Dataset GC10-DET: https://huggingface.co/datasets/dronefreak/GC10-DET
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base Ultralytics/YOLO26: https://huggingface.co/Ultralytics/YOLO26
- Referencias arXiv citadas en las etiquetas del modelo: arXiv:2606.03748, arXiv:2511.09554, arXiv:2304.07193, arXiv:2410.17725
- La busqueda web no devolvio resultados relevantes sobre este modelo.
