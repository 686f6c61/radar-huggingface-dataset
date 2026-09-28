# dronefreak/gc10det-yolo11n

## Resumen

gc10det-yolo11n es un detector de objetos YOLO11 en su variante nano, ajustado por el usuario dronefreak sobre el conjunto de datos GC10-DET de defectos superficiales en metal. Se trata de un modelo de vision por computador de una sola etapa, con 2,6 millones de parametros y 6,6 GFLOPs medidos a 640 px de resolucion de entrada, cuyo unico proposito es localizar y clasificar diez tipos de defectos sobre superficies metalicas (crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line).

El modelo no es un modelo de lenguaje ni un sistema multimodal: no genera texto, no soporta tool calling ni razonamiento multi-paso. Su relevancia es la de servir como punto de referencia (baseline) reproducible dentro de DetectionBench, un marco de trabajo que entrena y evalua distintos detectores modernos con recetas identicas sobre varios conjuntos de datos reales. Esto permite comparar arquitecturas de forma justa bajo el mismo protocolo de evaluacion.

En el split de test de GC10-DET obtiene un mAP@50 de 70,44 %, un mAP@50-95 de 40,09 %, una precision de 78,93 % y un recall de 62,64 %. Estas cifras se declaran en la model card del autor y no estan verificadas de forma independiente. El repositorio de HuggingFace tenia 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de una sola etapa de la familia YOLO11 (Ultralytics), variante nano; red convolucional |
| Parametros totales | 2,6 M |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica (modelo de vision). Resolucion de entrada de referencia: 640 px, a la que corresponden los 6,6 GFLOPs declarados |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No aplica (modelo de deteccion de imagenes, sin entrada ni salida de texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`; el archivo indicado en la model card es `best.pt`) |
| Tarea | Deteccion de objetos (object-detection) |
| Framework | Ultralytics |
| Modelo base | Ultralytics/YOLO11 (fine-tuning) |
| Conjunto de datos de entrenamiento | GC10-DET (`dronefreak/GC10-DET`) |
| Numero de clases | 10 |
| FLOPs | 6,6 GFLOPs a 640 px |
| Tamano del repositorio | 0,0 GB segun los metadatos de HuggingFace |
| Fecha de publicacion en HuggingFace | 2026-09-27 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La model card identifica el modelo como un ajuste fino (fine-tuning) del modelo base `Ultralytics/YOLO11` en su variante nano, lo que lo situa en la familia de detectores de una sola etapa de Ultralytics. No se proporciona informacion adicional sobre la arquitectura interna concreta, la composicion de bloques, los mecanismos de atencion ni el diseno de la cabeza de deteccion. Los unicos datos arquitectonicos cuantitativos disponibles son el numero de parametros (2,6 M) y el coste computacional (6,6 GFLOPs a 640 px).

Tampoco se detallan en la informacion proporcionada el numero de tokens o imagenes vistas durante el entrenamiento, el numero de epocas, la estrategia de aumentos de datos, el optimizador, la tasa de aprendizaje ni si se aplicaron tecnicas de refinamiento posteriores como RLHF o DPO (que, por otra parte, no aplican a un detector de objetos). Lo unico indicado es que el entrenamiento y la evaluacion se realizaron dentro del marco DetectionBench, con recetas de entrenamiento y metricas de evaluacion identicas entre los distintos modelos comparados, y que las metricas se calcularon sobre el split de test de GC10-DET mediante la herramienta `detectionbench-evaluate`.

## Capacidades

- Deteccion de objetos por cajas delimitadoras: localiza y clasifica instancias de las diez clases de defecto definidas en GC10-DET.
- Salida de puntuaciones de confianza por deteccion, apta para aplicar umbrales segun el compromiso entre precision y recall que requiera cada linea de produccion.
- Inferencia en una sola pasada sobre la imagen (detector de una etapa), adecuada para procesamiento en tiempo real.
- Modelo de muy bajo coste: 2,6 M de parametros y 6,6 GFLOPs a 640 px, lo que permite ejecucion en hardware modesto.
- Integracion con el ecosistema Ultralytics: carga y prediccion mediante la clase `YOLO` de la libreria `ultralytics`.
- Evaluacion reproducible: incluye curvas precision-recall, curva F1, matriz de confusion y matriz de confusion normalizada en el repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de procesamiento de lenguaje natural.
- No tiene modo de razonamiento (thinking mode), entrada de audio ni generacion de texto.
- La model card no documenta capacidades de segmentacion, estimacion de pose, clasificacion de imagen completa ni vision-lenguaje.

## Casos de uso

- Inspeccion de calidad en linea en laminacion y conformado de metal: el modelo se conecta a las camaras de la linea y marca en cada pieza los defectos de las diez clases entrenadas, permitiendo descartar o reclasificar la chapa antes de etapas posteriores.
- Deteccion de defectos criticos de facil localizacion: clases como rolled_pit (mAP@50 de 99,5 %) o crescent_gap (98,61 %) son candidatas a automatizacion practicamente completa, con umbrales de confianza ajustados sobre validacion propia.
- Triaje previo a inspeccion humana: dado el recall del 62,64 %, el modelo encaja mejor como filtro que reduce el volumen de imagenes que revisa un operario que como sistema de rechazo automatico sin supervision.
- Etiquetado asistido de nuevos conjuntos de datos: uso del detector para preanotar imagenes de la propia fabrica y correccion posterior por parte de un anotador, reduciendo el coste de crear datos etiquetados especificos del dominio.
- Despliegue en el borde (edge): con 2,6 M de parametros y 6,6 GFLOPs, el modelo es candidato a ejecutarse en dispositivos junto a la camara o en un PC industrial, sin depender de conectividad a la nube.
- Referencia para comparativas internas de detectores: al formar parte de DetectionBench, sirve como baseline contra el que medir variantes mayores (YOLO11s, YOLOv8n/s/m, YOLO26, RF-DETR) bajo el mismo protocolo.
- Docencia y prototipado en vision industrial: modelo pequeno, con pesos publicos y licencia AGPL-3.0, util para practicas de deteccion de defectos y para validar rapidamente una idea antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de GC10-DET (metricas no verificadas de forma independiente, campo `verified: false` en la model card):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 70,44 |
| mAP@50-95 | 40,09 |
| Precision | 78,93 |
| Recall | 62,64 |
| F1 | 69,85 |
| Parametros | 2,6 M |
| FLOPs | 6,6 GFLOPs a 640 px |

Comparativa publicada por el autor con el resto de modelos evaluados en GC10-DET dentro de DetectionBench:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small | 76,07 | 42,51 | 87,86 | 65,03 |
| RF-DETR Medium | 75,93 | 41,93 | 78,25 | 67,76 |
| YOLO26s | 75,77 | 38,15 | 77,16 | 74,07 |
| YOLO26n | 74,25 | 38,31 | 80,50 | 67,99 |
| YOLO26m | 73,97 | 36,94 | 75,70 | 68,19 |
| YOLOv8n | 73,25 | 38,74 | 67,99 | 70,87 |
| YOLO11s | 72,54 | 35,07 | 72,39 | 66,80 |
| YOLOv8s | 72,54 | 37,79 | 78,54 | 65,23 |
| YOLOv8m | 71,88 | 38,80 | 69,77 | 70,84 |
| YOLO11n (este modelo) | 70,44 | 40,09 | 78,93 | 62,64 |
| RF-DETR Nano | 70,17 | 38,06 | 77,08 | 71,04 |

Rendimiento por clase del modelo (mAP@50 y mAP@50-95 en el split de test):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crease | 21,51 | 7,38 |
| crescent_gap | 98,61 | 61,02 |
| inclusion | 23,34 | 6,56 |
| oil_spot | 50,87 | 20,04 |
| punching_hole | 85,94 | 42,31 |
| rolled_pit | 99,50 | 99,50 |
| silk_spot | 52,26 | 21,20 |
| waist_folding | 89,45 | 46,16 |
| water_spot | 93,27 | 55,56 |
| welding_line | 89,66 | 41,12 |

## Requisitos de hardware

- VRAM estimada para inferencia: no se publica una cifra en la informacion disponible. Como estimacion derivada del tamano del modelo, los pesos ocupan aproximadamente 10,4 MB en FP32 y 5,2 MB en FP16, por lo que el modelo cabe holgadamente por debajo de 1 GB de VRAM en la mayoria de configuraciones de inferencia a 640 px.
- GPU recomendadas: no se especifican en la model card. Por tamano, cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se requiere A100 ni H100.
- Cabe en GPU de consumo: si, de forma previsible en cualquier GPU de consumo actual (por ejemplo, series RTX 30/40) e incluso en aceleradores integrados o CPU, dado el reducido numero de parametros.
- Opciones de despliegue: la model card documenta unicamente la carga mediante `huggingface_hub.hf_hub_download` y la inferencia con la clase `YOLO` de la libreria `ultralytics` (instalacion con `pip install ultralytics huggingface_hub`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un detector de objetos.
- Latencia y throughput: no disponible. No se publican mediciones de latencia, FPS ni throughput en la informacion proporcionada.

## Comparativa con modelos similares

Modelos de la misma categoria evaluados por el autor sobre el mismo conjunto de datos y bajo el mismo protocolo de evaluacion:

| Modelo | Parametros | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| gc10det-yolo11n (este modelo) | 2,6 M | 70,44 | 40,09 | 78,93 | 62,64 | AGPL-3.0 | HuggingFace (dronefreak/gc10det-yolo11n) |
| RF-DETR Small | No disponible | 76,07 | 42,51 | 87,86 | 65,03 | No disponible | No disponible en la informacion proporcionada |
| RF-DETR Nano | No disponible | 70,17 | 38,06 | 77,08 | 71,04 | No disponible | No disponible en la informacion proporcionada |
| YOLO26n | No disponible | 74,25 | 38,31 | 80,50 | 67,99 | No disponible | No disponible en la informacion proporcionada |
| YOLOv8n | No disponible | 73,25 | 38,74 | 67,99 | 70,87 | No disponible | No disponible en la informacion proporcionada |
| YOLO11s | No disponible | 72,54 | 35,07 | 72,39 | 66,80 | No disponible | No disponible en la informacion proporcionada |
| YOLOv8s | No disponible | 72,54 | 37,79 | 78,54 | 65,23 | No disponible | No disponible en la informacion proporcionada |

El modelo no lidera la comparativa en mAP@50; destaca, en cambio, en mAP@50-95, donde supera a YOLO26n, YOLO11s, YOLOv8n y YOLOv8s pese a ser el de menor complejidad de la tabla, y en precision, donde solo queda por detras de RF-DETR Small y YOLO26n. Su punto debil relativo es el recall.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. Su uso en productos propietarios o como servicio accesible por red implica obligaciones de liberacion del codigo fuente derivado; conviene revisar el cumplimiento legal antes de integrarlo en un producto comercial.
- Metricas no verificadas: todos los resultados del model-index estan marcados con `verified: false`, es decir, proceden del propio autor y no han sido reproducidos de forma independiente.
- Recall bajo (62,64 %): el modelo deja sin detectar una parte relevante de los defectos presentes. No es adecuado como unico mecanismo de control de calidad en aplicaciones donde un falso negativo tenga coste alto.
- Rendimiento muy desigual por clase: rolled_pit alcanza 99,50 de mAP@50 y crescent_gap 98,61, mientras que crease (21,51), inclusion (23,34) y oil_spot (50,87) quedan muy por debajo. Las clases con menos ejemplos o mayor ambiguedad visual no son fiables.
- Sin informacion sobre el entrenamiento: no se documentan epocas, hiperparametros, composicion exacta del split de entrenamiento, aumentos de datos ni criterios de seleccion del checkpoint, lo que dificulta reproducir el resultado.
- Dominio estrecho: entrenado exclusivamente sobre GC10-DET (superficies metalicas con condiciones concretas de captura). Es probable una degradacion del rendimiento en otros materiales, iluminaciones, opticas o resoluciones; requerira validacion y, previsiblemente, reentrenamiento.
- Riesgo de sesgo por el conjunto de datos: al no haber informacion sobre la procedencia y el balance de clases del dataset, no puede evaluarse el sesgo hacia tipos de defecto, condiciones de iluminacion o tipos de pieza sobrerrepresentados.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, repositorio de 0,0 GB y fechas de metadatos (2026-09-27) que conviene contrastar antes de dar por definitiva la version publicada.
- No apto para tareas de lenguaje, vision-lenguaje, segmentacion, pose ni clasificacion global de imagen: su unica salida son cajas con etiqueta de clase y confianza.
- Sin datos de latencia ni throughput: no es posible estimar el coste de despliegue en produccion a partir de la informacion publicada.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/dronefreak/gc10det-yolo11n
- Conjunto de datos GC10-DET en HuggingFace: https://huggingface.co/datasets/dronefreak/GC10-DET
- Repositorio DetectionBench (codigo y evaluacion): https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO11
- Referencias arXiv incluidas en las etiquetas del repositorio: arXiv:2410.17725, arXiv:2511.09554, arXiv:2304.07193, arXiv:2606.03748 (el contenido concreto de cada una no se especifica en la informacion proporcionada)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos no guardan relacion con el modelo ni con vision por computador y se han descartado.
