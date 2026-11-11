# anfruizhu/forages-rois-models

## Resumen

ForagesROIs models es un conjunto de dos modelos ONNX publicados por el autor `anfruizhu` (desarrollados en el equipo de Forrajes Tropicales de la Alianza de Bioversity International y CIAT) para la aplicacion ForagesROIs. Su funcion es detectar, numerar y medir plantas individuales de forrajes en ortomosaicos RGB (GeoTIFF) de ensayos de campo capturados con UAV a resoluciones de 1 a 3 cm por pixel. El paquete incluye un detector de plantas basado en YOLOv8n y un segmentador de parcelas de cultivo basado en YOLO11m-seg.

El detector principal, `forages_rois_yolo_full_1024.onnx`, es un YOLOv8n de 3,0 M de parametros que trabaja sobre teselas de 1024 x 1024 px y distingue dos especies: *Urochloa* (*Brachiaria*) y *Megathyrsus maximus* (*Panicum*). El segundo modelo, `crop_detection.onnx`, es un YOLO11m-seg de 22,4 M de parametros que segmenta la parcela de cultivo completa a partir del ortomosaico reescalado a 640 x 640 px.

El interes de esta publicacion es acotado pero claro: ofrece pesos listos para usar en un pipeline de fenotipado vegetal con drones, con metricas de validacion reportadas (mAP@0.5 de 0,990 en el conjunto de test del detector) y una integracion documentada con la aplicacion ForagesROIs. No es un modelo de lenguaje ni un modelo generalista: es una herramienta de vision por computador de dominio muy especifico, distribuida bajo AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n detect (detector de plantas) y YOLO11m-seg (segmentador de parcelas) |
| Parametros totales | 3,0 M (detector) y 22,4 M (segmentador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de 1024 x 1024 px y 640 x 640 px respectivamente) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX sin cuantizar declarada) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El detector de plantas es un YOLOv8n (familia Ultralytics, 3,0 M de parametros) inicializado desde los pesos COCO `yolov8n.pt` y entrenado con Ultralytics 8.3.134. Los datos de entrenamiento proceden del dataset *Forage grasses in crop fields from ultra-high spatial resolution UAV-based imagery* (Harvard Dataverse, doi:10.7910/DVN/DBGUFW): 374 teselas de aproximadamente 1024 px con 25 % de solapamiento, extraidas de 8 ortomosaicos, con 12.346 cajas anotadas (3.809 de *Urochloa* y 8.537 de *Megathyrsus*). El reparto aleatorio por tesela fue de 261 para entrenamiento, 56 para validacion y 57 para test. Se entreno a 1024 px con batch 32 y parada temprana con paciencia 100, seleccionando la mejor epoca en la 259 de 359.

El segmentador de parcelas es un YOLO11m-seg de 22,4 M de parametros, entrenado en Roboflow con Ultralytics 8.3.171 y exportado a ONNX con Ultralytics 8.4.27. Se entreno a 640 px con batch 6, hasta 300 epocas y paciencia 10. La model card deja sin completar varios campos del entrenamiento (proyecto y version de Roboflow, numero de imagenes, metricas del split de test), marcados como `[XX: ...]`. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en modelos de deteccion.

## Capacidades

- Deteccion de plantas individuales de forraje en ortomosaicos RGB, con una caja por planta.
- Clasificacion de especie entre dos clases: *Urochloa* (*Brachiaria*) y *Megathyrsus maximus* (*Panicum*).
- Segmentacion de parcelas de cultivo sobre el ortomosaico completo reescalado a 640 x 640 px.
- Salida del detector en formato `(1, 6, N)` sin NMS (4 coordenadas de caja y 2 puntuaciones de clase por candidato), delegando el umbral y el NMS a la aplicacion consumidora.
- Salida del segmentador con NMS: `(1, 300, 38)` detecciones y `(1, 32, 160, 160)` prototipos de mascara.
- Integracion directa con la aplicacion ForagesROIs, que numera las plantas en orden de libro de campo y calcula area de dosel y cobertura.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.

## Casos de uso

- Fenotipado de ensayos de forrajes con UAV: el detector procesa teselas de 1024 px de ortomosaicos a 1-3 cm/pixel y devuelve una caja por planta, lo que permite contar individuos por parcela de forma automatizada en lugar de hacerlo manualmente.
- Medicion de area de dosel y cobertura: combinado con ForagesROIs, las cajas detectadas se usan para estimar el area foliar proyectada y el porcentaje de cobertura del suelo, indicadores habituales en seleccion de germoplasma forrajero.
- Numeracion ordenada de plantas para seguimiento temporal: la aplicacion asigna numeros en orden de libro de campo, lo que facilita comparar la misma planta entre vuelos sucesivos de un mismo ensayo.
- Delimitacion automatica de parcelas experimentales: el segmentador YOLO11m-seg identifica la parcela de cultivo sobre el ortomosaico completo, lo que permite recortar la region de interes antes de aplicar el detector de plantas y evitar procesar zonas no cultivadas.
- Analisis de ensayos de dos especies en un mismo campo: al distinguir *Urochloa* y *Megathyrsus*, el modelo permite separar recuentos y coberturas por especie dentro de un diseno experimental mixto.
- Integracion en pipelines de teledeteccion agricola: los ONNX se pueden ejecutar con ONNX Runtime o con el backend de Ultralytics en servidores o estaciones de trabajo, encadenando ortomosaico, recorte de parcela, teselado y deteccion.
- Investigacion reproducible en fenotipado: al estar los pesos y el dataset de entrenamiento referenciados publicamente, sirve como linea base para comparar nuevos detectores sobre el mismo conjunto de ortomosaicos.

## Benchmarks y rendimiento

| Metrica (detector, 57 teselas de test, mejor epoca) | Valor |
|---|---|
| Precision | 0,972 |
| Recall | 0,967 |
| mAP@0.5 | 0,990 |
| mAP@0.5:0.95 | 0,763 |
| Clasificacion correcta de *Urochloa* | 98 % |
| Clasificacion correcta de *Megathyrsus* | 97 % |

El autor advierte explicitamente de que estas metricas son optimistas: la configuracion del dataset asigno el split de validacion a las teselas de test, de modo que la mejor epoca se selecciono sobre ellas, y teselas de los mismos ortomosaicos (que se solapan) aparecen en todos los splits. En campos y vuelos nuevos cabe esperar valores inferiores.

Para el segmentador de parcelas no se publican metricas: la model card deja el campo como `[XX: from the Roboflow test split]`.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Por tamano, el detector YOLOv8n (3,0 M de parametros) es muy ligero y cabe holgadamente en cualquier GPU consumer; el segmentador YOLO11m-seg (22,4 M) tambien es apto para GPU de gama media.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte CUDA (por ejemplo, RTX 3060 en adelante) es suficiente para ambos modelos; para procesar ortomosaicos completos por teselado conviene una GPU con al menos 8 GB de VRAM.
- Cabe en GPU consumer: si, ambos modelos, dado su reducido numero de parametros.
- Opciones de despliegue: ONNX Runtime (formato nativo de los pesos), Ultralytics (carga de ONNX), y la aplicacion ForagesROIs, que descarga los modelos desde el release y permite seleccionar la carpeta con **File > Set Models Folder...**.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ForagesROIs detector (YOLOv8n) | 3,0 M | Deteccion de plantas de forraje (2 clases) | 1024 x 1024 px | AGPL-3.0 | ONNX en Hugging Face |
| ForagesROIs segmentador (YOLO11m-seg) | 22,4 M | Segmentacion de parcelas de cultivo | 640 x 640 px | AGPL-3.0 | ONNX en Hugging Face |
| YOLOv8n COCO (Ultralytics) | 3,0 M | Deteccion de objetos general (80 clases) | 640 x 640 px | AGPL-3.0 | Pesos publicos de Ultralytics |
| YOLO11m-seg COCO (Ultralytics) | 22,4 M | Segmentacion de instancias general | 640 x 640 px | AGPL-3.0 | Pesos publicos de Ultralytics |

La comparacion relevante es con los pesos COCO originales de Ultralytics, de los que derivan ambos modelos: ForagesROIs sustituye las 80 clases generales por dos clases de forraje y una clase de parcela, a costa de perder generalidad fuera del dominio agricola. No se dispone de comparacion con otros detectores especificos de fenotipado vegetal en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo se ha probado con *Urochloa* y *Megathyrsus maximus* en ortomosaicos RGB de UAV a 1-3 cm/pixel; no se ha validado con otras especies, bandas multiespectrales ni otros sensores.
- A resoluciones mas gruesas que 1-3 cm/pixel las plantas se vuelven demasiado pequenas para detectarlas de forma fiable.
- Metricas optimistas: la seleccion de la mejor epoca se hizo sobre las teselas de test y hay solapamiento entre splits, por lo que el rendimiento en campos y vuelos nuevos sera previsiblemente inferior.
- La model card contiene campos sin completar (`[XX: ...]`) sobre el entrenamiento y las metricas del segmentador de parcelas, lo que limita la reproducibilidad de ese componente.
- La clase `target` del segmentador no se utiliza: a la escala de 640 px de un ortomosaico completo, un blanco en el suelo ocupa solo unos pocos pixeles.
- Riesgo de falsos positivos y negativos en condiciones de iluminacion, densidad de siembra o presencia de malas hierbas no representadas en el dataset de entrenamiento.
- Licencia AGPL-3.0: el uso comercial o la distribucion de servicios basados en estos modelos obliga a liberar el codigo fuente bajo la misma licencia; el codigo de ForagesROIs se distribuye aparte bajo Apache 2.0, pero los pesos no.
- No apto para tareas de lenguaje, razonamiento, codigo ni atencion al cliente: es exclusivamente un modelo de vision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anfruizhu/forages-rois-models
- Repositorio ForagesROIs: https://github.com/afruizh/forages_rois
- Documentacion de ForagesROIs: https://afruizh.github.io/forages_rois/
- Issues del proyecto: https://github.com/afruizh/forages_rois/issues
- Dataset de entrenamiento (Harvard Dataverse): https://doi.org/10.7910/DVN/DBGUFW
- Ultralytics YOLO: https://github.com/ultralytics/ultralytics
- Descarga directa de pesos v1.0.0: https://huggingface.co/anfruizhu/forages-rois-models/resolve/v1.0.0/forages_rois_yolo_full_1024.onnx y https://huggingface.co/anfruizhu/forages-rois-models/resolve/v1.0.0/crop_detection.onnx
