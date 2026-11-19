# Akhnaf03/HARNES-YOLOv8

## Resumen

HARNES-YOLOv8 es un modelo de deteccion de objetos basado en la arquitectura YOLO26n (variante nano de la familia YOLO), ajustado por el usuario Akhnaf03 para un caso de uso industrial muy concreto: la deteccion de excavadoras, brazos de excavadora y personas en entornos de obra. El modelo se distribuye como un unico checkpoint de pesos `.pt` de 5,3 MiB, entrenado durante 30 epocas sobre un dataset propio de mas de 25 000 imagenes a una resolucion de entrada de 1280 px. Es, por tanto, un modelo de vision por computador de proposito especifico, no un modelo de lenguaje.

Su relevancia radica en el ambito de aplicacion: la deteccion conjunta de maquinaria pesada y personas es un componente habitual en sistemas de seguridad laboral (prevencion de atropellos, zonas de exclusion, alertas de proximidad). El autor lo integra ademas en un componente llamado HARNES-Server, que puede cargar el modelo automaticamente o mediante la variable de entorno `DETECTION_MODEL_PATH`.

La informacion publicada es muy limitada: el repositorio ocupa 0,0 GB, no tiene descargas ni likes, y la model card no incluye detalles sobre la composicion exacta del dataset, el proceso de anotacion, la funcion de perdida ni los hiperparametros de entrenamiento mas alla de los citados. Todo lo que se afirma a continuacion proviene exclusivamente de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (familia YOLOv8, variante nano), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint `.pt` en precision original) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (Ultralytics); ficheros `best_v8_3class.pt` y `Anything.pt` (alias), 5,3 MiB cada uno |

Otros datos de la model card: 30 epocas de entrenamiento, `imgsz` 1280 durante el entrenamiento, dataset v6 con mas de 25 000 imagenes, entrenamiento realizado en Kaggle entre el 5 y el 6 de noviembre de 2026. Orden de clases: 0 = excavator, 1 = excavator_arm, 2 = person. Valores por defecto de inferencia en servidor: `conf` 0.35, `imgsz` 1600, clases 0 y 2.

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26n, una variante nano de la familia YOLO (etiquetada como YOLOv8 en los tags y en el nombre del fichero). Se trata de un detector de objetos de una etapa con backbone convolucional y cabecera de prediccion densa, optimizado para inferencia de baja latencia. El checkpoint resultante pesa 5,3 MiB, lo que es coherente con una variante nano de la familia. No se dispone de informacion sobre el numero exacto de parametros, la composicion de capas ni si se aplicaron tecnicas como atencion o modulos de agregacion multiescala especificos.

El entrenamiento se realizo durante 30 epocas sobre la version 6 de un dataset propio de mas de 25 000 imagenes, a resolucion de entrada de 1280 px, en el entorno de Kaggle. No se documentan el numero de tokens (no aplica), la composicion detallada del dataset (proporcion de imagenes por clase, fuentes, condiciones de captura), las tecnicas de aumento de datos, la funcion de perdida ni si hubo fases de ajuste fino adicionales. Tampoco se indica si el entrenamiento partio de pesos preentrenados en COCO u otro corpus, aunque es lo habitual en la familia Ultralytics. No hay informacion sobre innovaciones tecnicas destacables (decodificacion especulativa, atencion lineal, etc.), que en cualquier caso no aplican a este tipo de modelo.

## Capacidades

- Deteccion de objetos en imagenes con tres clases: excavadora (clase 0), brazo de excavadora (clase 1) y persona (clase 2).
- Inferencia sobre imagenes individuales o flujos de video mediante la libreria Ultralytics (`YOLO(path)`).
- Salida de cajas delimitadoras con puntuaciones de confianza por clase.
- Filtrado por clase y umbral de confianza en tiempo de inferencia (por defecto en servidor: `conf` 0.35, clases 0 y 2).
- Capacidad de ajuste de la resolucion de inferencia (por defecto 1600 px en el servidor, frente a 1280 px de entrenamiento).
- Integracion con HARNES-Server mediante `DETECTION_MODEL_PATH` o descarga automatica desde Hugging Face.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural: es exclusivamente un modelo de vision.
- No se documentan capacidades multilingues, de video tracking, segmentacion, pose estimation ni audio.

## Casos de uso

- **Prevencion de atropellos en obra**: el modelo detecta simultaneamente excavadoras (clase 0) y personas (clase 2), lo que permite calcular distancias y generar alertas cuando una persona entra en la zona de influencia de la maquina. La configuracion por defecto del servidor ya filtra estas dos clases, lo que sugiere que este es el caso de uso principal.
- **Monitorizacion de zonas de exclusion**: con `imgsz` 1600 y `conf` 0.35, el modelo puede procesar fotogramas de camaras fijas de obra para verificar que no hay personal dentro de areas delimitadas alrededor de maquinaria.
- **Analisis de imagenes de inspeccion**: dado su reducido tamano (5,3 MiB) y su licencia MIT, puede desplegarse en dispositivos de borde (Raspberry Pi, Jetson Nano) para analizar capturas periodicas sin depender de la nube.
- **Etiquetado asistido y control de calidad de datasets**: las detecciones del modelo pueden usarse como preanotaciones en pipelines de anotacion humana, reduciendo el coste de etiquetar nuevas imagenes de excavadoras y personas.
- **Auditoria de seguridad retrospectiva**: procesar grabaciones archivadas para cuantificar incidentes de proximidad entre personal y maquinaria y generar informes de riesgo por franja horaria.
- **Integracion en sistemas de gestion de flotas de obra**: combinado con metadatos de camara y timestamp, el modelo permite registrar la presencia y actividad de excavadoras en distintas zonas de la obra a lo largo del dia.
- **Prototipado rapido de sistemas de seguridad**: la licencia MIT y la ausencia de dependencias propietarias facilitan su incorporacion en pruebas de concepto y productos comerciales sin obligaciones de atribucion mas alla de la licencia.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card, medidos como mAP50 sobre el conjunto de validacion del dataset propio (no comparable directamente con resultados sobre COCO u otros benchmarks publicos):

| Metrica | Valor |
|---|---|
| mAP50 global | 0.843 |
| mAP50 clase excavator | 0.913 |
| mAP50 clase excavator_arm | 0.837 |
| mAP50 clase person | 0.778 |

No se han publicado resultados de benchmarks estandar (COCO mAP, latencia, throughput) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explicita. Con 5,3 MiB de pesos en precision original, el modelo es extremadamente ligero; la VRAM necesaria vendra dominada por el tamano del lote y la resolucion de entrada (1600 px por defecto), no por los pesos.
- **GPU recomendadas**: cualquier GPU consumer moderna es suficiente. Se espera que funcione en RTX 3060, RTX 4060, RTX 4090, asi como en GPUs de datacenter (A100, H100) sin aprovechar su capacidad. Tambien es viable en CPU, aunque con mayor latencia.
- **Cabe en GPU consumer**: si, con amplio margen, incluidas GPUs de gama baja y dispositivos integrados.
- **Opciones de despliegue**: la libreria Ultralytics (`YOLO(path)`), el servidor propietario HARNES-Server del autor, y exportacion a otros formatos soportados por Ultralytics (ONNX, TensorRT, CoreML, etc.), aunque el autor no documenta exportaciones verificadas en la model card.
- **Latencia y throughput estimados**: no disponibles. No se publican mediciones de FPS ni de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HARNES-YOLOv8 (este modelo) | no disponible (checkpoint de 5,3 MiB) | Imagenes, `imgsz` 1280 entrenamiento / 1600 inferencia | mAP50 0.843 en dataset propio de 3 clases | MIT | Hugging Face, 0 descargas |
| YOLOv8n (Ultralytics, preentrenado en COCO) | ~3,2 M (referencia de la familia) | Imagenes, resolucion configurable | mAP50-95 ~37,3 en COCO (referencia publica de la familia, no verificada aqui) | AGPL-3.0 / licencia comercial Ultralytics | Ampliamente disponible |
| YOLO26n (familia base) | no disponible | Imagenes, resolucion configurable | no disponible | no disponible | no disponible |

La comparacion con la familia YOLO preentrenada en COCO es solo orientativa: el modelo de este repositorio esta especializado en tres clases de un dominio concreto y sus metricas no son trasladables a benchmarks generales. No se dispone de informacion sobre otros modelos especializados en deteccion de excavadoras y personas con los que comparar directamente.

## Limitaciones y advertencias

- **Sesgos y dominio limitado**: el modelo solo detecta tres clases (excavadora, brazo de excavadora, persona) y fue entrenado con un dataset propio no documentado; su comportamiento fuera de ese dominio (otras maquinas, condiciones de iluminacion, climas o geografias no representadas) es incierto.
- **Riesgo de falsos negativos en la clase persona**: es la clase con menor mAP50 (0.778), precisamente la mas critica en aplicaciones de seguridad. Un fallo de deteccion de personas puede tener consecuencias graves; el modelo no debe usarse como unico mecanismo de seguridad.
- **Falta de documentacion**: no se detallan la composicion del dataset, el proceso de anotacion, los hiperparametros ni las metricas de validacion cruzada, lo que dificulta evaluar su robustez y reproducibilidad.
- **Ausencia de benchmarks estandar**: no hay resultados en COCO ni en otros conjuntos publicos, por lo que no es posible comparar su rendimiento con alternativas de forma objetiva.
- **Licencia**: MIT, permisiva para uso comercial, pero el modelo base YOLO de Ultralytics suele distribuirse bajo AGPL-3.0 o licencia comercial; el autor no aclara la procedencia de los pesos iniciales ni las implicaciones legales de esa cadena de licencias.
- **Sin soporte de texto ni capacidades multimodales**: no es un modelo de lenguaje ni un modelo vision-lenguaje; no puede responder preguntas sobre las imagenes ni generar descripciones.
- **Mantenimiento incierto**: repositorio con 0 descargas, 0 likes y creado en noviembre de 2026; no hay garantia de actualizaciones, soporte ni correccion de errores.
- **Uso en produccion**: para aplicaciones de seguridad laboral se recomienda validacion exhaustiva con datos propios, umbrales de confianza conservadores y redundancia con otros sensores (radar, LiDAR, sensores de proximidad).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akhnaf03/HARNES-YOLOv8
- Libreria Ultralytics (YOLO): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com/
- Hugging Face Hub (`hf_hub_download`): https://huggingface.co/docs/huggingface_hub
