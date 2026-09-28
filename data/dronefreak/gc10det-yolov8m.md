# dronefreak/gc10det-yolov8m

## Resumen

El modelo `dronefreak/gc10det-yolov8m` es un detector de objetos YOLOv8m afinado sobre el conjunto de datos GC10-DET, un benchmark de defectos superficiales en superficies metalicas. Lo desarrolla Saumya Kumaar Saksena (usuario `dronefreak`), ingeniero de vision por computador especializado en percepcion para movilidad autonoma, y se publica como parte de DetectionBench, un marco de trabajo cuyo objetivo es evaluar detectores modernos con recetas de entrenamiento y metricas de evaluacion identicas entre si. Su relevancia actual es metodologica: no aporta una arquitectura nueva, sino un punto de referencia reproducible dentro de una comparativa amplia de detectores sobre el mismo dominio industrial.

El modelo parte de los pesos preentrenados de Ultralytics YOLOv8 en su variante media (25,9 millones de parametros, 78,9 GFLOPs a 640 px de entrada) y se reajusta sobre las diez clases de defecto de GC10-DET: crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line. El problema que resuelve es la inspeccion automatica de calidad en lineas de fabricacion de chapa metalica, donde un detector ligero desplegable en hardware modesto permite sustituir o asistir la inspeccion visual humana.

Se trata de un modelo de vision por computador, no de un modelo de lenguaje: no procesa texto, no tiene ventana de contexto conversacional y no soporta tool calling ni razonamiento multi-paso. La ficha se adapta en consecuencia. Las metricas publicadas por el autor proceden de la particion de test de GC10-DET y estan marcadas como no verificadas en el model-index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 en variante media (YOLOv8m), red neuronal convolucional de deteccion de objetos en una sola etapa, sin anclas; framework Ultralytics |
| Parametros totales | 25,9 M |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica (modelo de vision; resolucion de entrada reportada de 640 px segun el calculo de FLOPs) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repositorio distribuye pesos en punto flotante (best.pt) |
| Idiomas soportados | no disponible (modelo de vision; no procesa lenguaje natural; la model card y la ficha del dataset no declaran idiomas de etiquetas mas alla del ingles en la metadata del dataset) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt, archivo `best.pt`); no se declaran pesos en safetensors, GGUF ni otros formatos en el repositorio |
| Tarea | Deteccion de objetos (pipeline `object-detection`) |
| Biblioteca | ultralytics |
| Modelo base | Ultralytics/YOLOv8 (ajuste fino sobre YOLOv8m) |
| Dataset de entrenamiento | dronefreak/GC10-DET (10 clases) |
| Tamano del repositorio | 0,1 GB |
| FLOPs | 78,9 G a 640 px |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es YOLOv8 en su variante media, un detector convolucional de una sola etapa y sin anclas desarrollado por Ultralytics y publicado en enero de 2023, con API unificada en Python y CLI. La informacion disponible no detalla la composicion interna de la red (profundidad del backbone, modulos de cuello ni cabezas de deteccion); lo unico confirmado es el recuento de 25,9 millones de parametros y 78,9 GFLOPs a 640 px, coherentes con la variante `m` de la familia YOLOv8.

El entrenamiento consiste en un ajuste fino sobre el conjunto GC10-DET, ejecutado dentro del marco DetectionBench con recetas de entrenamiento y metricas identicas a las empleadas para el resto de detectores comparados (RF-DETR en sus variantes Nano, Small y Medium, familias YOLO26, YOLO11 y YOLOv8). La model card no especifica el numero de imagenes de entrenamiento, el numero de epocas, el esquema de aumento de datos, la resolucion de entrenamiento ni si se aplicaron tecnicas de regularizacion o destilacion. Tampoco se documenta ninguna innovacion tecnica propia: el valor del artefacto es la reproducibilidad de la receta y la publicacion de la comparativa completa, no una contribucion arquitectonica.

## Capacidades

- Deteccion de objetos en imagenes de superficies metalicas, con localizacion mediante cajas delimitadoras y clasificacion en diez categorias de defecto: crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line.
- Inferencia sobre imagenes individuales a traves de la API de Ultralytics (`YOLO(weights)` y `model.predict(...)`), tal como documenta el ejemplo de uso del repositorio.
- Integracion en flujos de inspeccion industrial: al ser un detector de una etapa y 25,9 M de parametros, esta pensado para ejecucion en tiempo real o cuasi real en linea de produccion.
- Exportacion a otros formatos de despliegue mediante el ecosistema Ultralytics (la model card no enumera los formatos concretos soportados para estos pesos).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No soporta entrada de texto, dialogo multi-turno ni generacion de codigo.
- No tiene capacidades multimodales mas alla de la imagen: no procesa audio ni video de forma nativa (el video requeriria procesar fotogramas individuales).
- Capacidad multilingue: no aplica.
- Modo de razonamiento extendido (thinking mode): no disponible.

## Casos de uso

- Inspeccion de calidad en laminacion en frio: el modelo puede clasificar y localizar defectos como `rolled_pit` o `welding_line` sobre imagenes de bobinas de acero; es la clase con mejor rendimiento del modelo (mAP@50 de 99,5 para `rolled_pit`), por lo que resulta adecuado como primer filtro automatico antes de la revision humana.
- Deteccion de manchas de aceite y agua en chapa metalica: las clases `oil_spot` y `water_spot` alcanzan mAP@50 de 47,6 y 96,01 respectivamente, lo que permite usarlas en control de limpieza superficial previo a pintura o recubrimiento.
- Verificacion de soldaduras: con mAP@50 de 83,0 en `welding_line`, el detector puede marcar cordones de soldadura para inspeccion posterior o descartar piezas con discontinuidades evidentes en un control dimensional automatizado.
- Triaje automatico en linea de produccion: al ser un modelo de 25,9 M de parametros y 78,9 GFLOPs, es candidato a ejecutarse en un PC industrial con GPU de gama media junto a la camara, reduciendo el volumen de imagenes enviadas a revision manual.
- Generacion de conjuntos de datos etiquetados: las predicciones se pueden usar como preanotacion para revisores humanos en nuevas lineas de fabricacion con defectos similares, acelerando el etiquetado inicial.
- Investigacion comparativa de detectores: al formar parte del zoo de DetectionBench sobre GC10-DET con la misma receta de evaluacion, sirve como linea base YOLOv8m frente a RF-DETR o las familias YOLO11 y YOLO26 en experimentos de seleccion de arquitectura.
- Auditoria de modelos en produccion: las visualizaciones publicadas (curva precision-recall, curva F1, matriz de confusion y matriz de confusion normalizada) permiten analizar con que clases se confunde el detector antes de sustituir un sistema en funcionamiento.
- Prototipado de sistemas de inspeccion en entornos con presupuesto de computo limitado: la combinacion de licencia AGPL-3.0 y pesos de 0,1 GB facilita implantaciones piloto y evaluaciones academicas sin coste de licencia, siempre que se respeten las obligaciones de la AGPL.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la particion de test de GC10-DET, evaluados con el pipeline `detectionbench-evaluate`. Ninguna de las metricas esta verificada de forma independiente (`verified: false` en el model-index).

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 71,88 |
| mAP@50-95 | 38,8 |
| Precision | 69,77 |
| Recall | 70,84 |
| F1 | 70,3 |

Comparativa con otros detectores evaluados sobre el mismo conjunto y la misma receta, segun la tabla publicada por el autor:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small | 76,07 | 42,51 | 87,86 | 65,03 |
| RF-DETR Medium | 75,93 | 41,93 | 78,25 | 67,76 |
| YOLO26s | 75,77 | 38,15 | 77,16 | 74,07 |
| YOLO26n | 74,25 | 38,31 | 80,5 | 67,99 |
| YOLO26m | 73,97 | 36,94 | 75,7 | 68,19 |
| YOLOv8n | 73,25 | 38,74 | 67,99 | 70,87 |
| YOLO11s | 72,54 | 35,07 | 72,39 | 66,8 |
| YOLOv8s | 72,54 | 37,79 | 78,54 | 65,23 |
| YOLOv8m (este modelo) | 71,88 | 38,8 | 69,77 | 70,84 |
| YOLO11n | 70,44 | 40,09 | 78,93 | 62,64 |
| RF-DETR Nano | 70,17 | 38,06 | 77,08 | 71,04 |

Rendimiento por clase de este modelo:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crease | 30,27 | 14,18 |
| crescent_gap | 91,7 | 55,7 |
| inclusion | 28,56 | 9,52 |
| oil_spot | 47,6 | 20,49 |
| punching_hole | 89,52 | 50,32 |
| rolled_pit | 99,5 | 79,6 |
| silk_spot | 58,12 | 21,88 |
| waist_folding | 94,5 | 50,04 |
| water_spot | 96,01 | 56,75 |
| welding_line | 83,0 | 29,49 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada del recuento de parametros declarado, los pesos en precision simple ocuparian del orden de 50 MB y en punto flotante de 32 bits del orden de 104 MB; el consumo real de memoria depende del backend, del tamano de lote y de la resolucion de entrada (640 px segun los FLOPs reportados).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano y regimen de computo (78,9 GFLOPs por imagen), la familia de GPUs consumer de gama media y alta es suficiente para inferencia; no se documentan cifras de latencia ni de throughput en la model card.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido numero de parametros; no hay confirmacion oficial ni lista de modelos concretos en la informacion disponible.
- Opciones de despliegue: API de Python y CLI de Ultralytics (`pip install ultralytics`), con carga de pesos desde Hugging Face mediante `hf_hub_download` y `YOLO(weights)`, tal como documenta el repositorio. La exportacion a otros formatos de inferencia depende del soporte del framework Ultralytics y no se detalla para estos pesos concretos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa relevante la proporciona el propio autor dentro del zoo de GC10-DET, ya que todos los modelos se entrenaron y evaluaron con la misma receta.

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall | Familia |
|---|---|---|---|---|---|
| RF-DETR Small | 76,07 | 42,51 | 87,86 | 65,03 | Transformer (DETR) |
| RF-DETR Medium | 75,93 | 41,93 | 78,25 | 67,76 | Transformer (DETR) |
| YOLO26s | 75,77 | 38,15 | 77,16 | 74,07 | YOLO26 |
| YOLOv8m (este modelo) | 71,88 | 38,8 | 69,77 | 70,84 | YOLOv8 |
| YOLOv8n | 73,25 | 38,74 | 67,99 | 70,87 | YOLOv8 |
| YOLOv8s | 72,54 | 37,79 | 78,54 | 65,23 | YOLOv8 |
| YOLO11n | 70,44 | 40,09 | 78,93 | 62,64 | YOLO11 |
| RF-DETR Nano | 70,17 | 38,06 | 77,08 | 71,04 | Transformer (DETR) |

Observaciones a partir de los datos publicados: dentro de la propia familia YOLOv8, las variantes `n` y `s` superan a esta variante `m` en mAP@50 sobre GC10-DET, mientras que YOLOv8m obtiene un mAP@50-95 de 38,8, ligeramente superior al de `s` (37,79) pero practicamente identico al de `n` (38,74). RF-DETR Small encabeza la tabla tanto en mAP@50 como en mAP@50-95. Comparativa de licencias y disponibilidad de los modelos alternativos: no disponible en la informacion proporcionada para RF-DETR, YOLO26 y YOLO11; los pesos de este repositorio se distribuyen bajo AGPL-3.0.

## Limitaciones y advertencias

- Metricas no verificadas: los cuatro valores del model-index estan marcados con `verified: false`, es decir, son cifras declaradas por el autor y no reproducidas por un tercero independiente.
- Rendimiento muy desigual por clase: `rolled_pit` (99,5 mAP@50) y `water_spot` (96,01) funcionan bien, mientras que `crease` (30,27), `inclusion` (28,56) y `oil_spot` (47,6) quedan muy por debajo. En mAP@50-95, `inclusion` cae a 9,52. Un uso en produccion que dependa de detectar inclusiones o pliegues tendra una tasa de fallo elevada.
- Precision y recall moderados: 69,77 de precision y 70,84 de recall implican tanto falsos positivos como falsos negativos apreciables en un contexto de control de calidad.
- Dominio muy restringido: el modelo esta ajustado exclusivamente a defectos superficiales en superficies metalicas segun el conjunto GC10-DET. Aplicarlo a otros materiales, iluminaciones o tipos de camara sin reentrenamiento no esta justificado por los datos disponibles.
- Sin datos sobre generalizacion: la model card no documenta el protocolo de particion (proporcion de entrenamiento, validacion y test), el numero de epocas, la resolucion de entrenamiento ni la composicion exacta del conjunto de entrenamiento, lo que limita la evaluacion del riesgo de sobreajuste.
- Riesgo de alucinacion: en deteccion de objetos este riesgo se manifiesta como falsos positivos sobre texturas o reflejos que el modelo confunde con defectos; la matriz de confusion publicada permite estimar parcialmente este comportamiento.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Su uso en un servicio accesible por red obliga, segun los terminos habituales de la AGPL, a ofrecer el codigo fuente correspondiente a los usuarios del servicio. Esto puede ser incompatible con productos propietarios que no quieran liberar su codigo; conviene revisar el caso de uso con asesoria legal antes de un despliegue comercial.
- Fuente del dataset: el conjunto dronefreak/GC10-DET se distribuye bajo licencia CC-BY-4.0 y el modelo resultante queda bajo AGPL-3.0; cualquier redistribucion debe respetar ambas condiciones.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Ausencia de soporte conversacional o agentico: no es aplicable a tareas de texto, agentes, RAG ni generacion de codigo; cualquier pipeline que lo requiera debe usar otro tipo de modelo.
- Sin informacion publicada sobre cuantizacion, latencia o consumo energetico, lo que dificulta planificar un despliegue en dispositivos embebidos sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/gc10det-yolov8m
- Dataset GC10-DET: https://huggingface.co/datasets/dronefreak/GC10-DET
- Archivos del dataset: https://huggingface.co/datasets/dronefreak/GC10-DET/tree/main
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Definicion del dataset GC10-DET en DetectionBench: https://github.com/dronefreak/DetectionBench/blob/main/src/detectionbench/datasets/gc10det.py
- Perfil del autor en Hugging Face: https://huggingface.co/dronefreak
- Perfil del autor en GitHub: https://github.com/dronefreak/
- Pagina de la familia YOLOv8 en Ultralytics: https://platform.ultralytics.com/ultralytics/yolov8
- Referencias arXiv incluidas en las etiquetas del repositorio (contenido no descrito en la informacion proporcionada): https://arxiv.org/abs/2511.09554, https://arxiv.org/abs/2304.07193, https://arxiv.org/abs/2410.17725, https://arxiv.org/abs/2606.03748
