# songhieng/anpr-sea-yolo26n-pose-corners

## Resumen

`anpr-sea-yolo26n-pose-corners` es un modelo de deteccion de matricula con estimacion de puntos clave (keypoints) desarrollado por el usuario songhieng. Se basa en la arquitectura YOLO26n-pose de Ultralytics y su tarea concreta es localizar la placa y predecir las cuatro esquinas (top-left, top-right, bottom-right, bottom-left) de cada matricula, lo que permite obtener una homografia para rectificar la placa antes de pasarla a un OCR en un pipeline ANPR (Automatic Number Plate Recognition).

El modelo se entrena sobre un subconjunto de 10.432 imagenes del dataset `songhieng/anpr-sea-license-plates`, que combina imagenes de Camboya, Tailandia y Vietnam junto con CCPD, Open Images y ejemplos negativos. Partiendo de pesos preentrenados en COCO, el autor lo presenta explicitamente como una prueba de concepto y banco de pruebas de investigacion, no como un modelo listo para produccion.

Su relevancia es acotada: cubre un nicho especifico (deteccion de esquinas de matricula en el sudeste asiatico) y publica metricas de error de esquina medido contra anotaciones humanas o poligonos del dataset. El repositorio tiene 0 descargas y 0 likes, y no incluye pesos en el momento del analisis (tamano del repo 0,0 GB), por lo que su disponibilidad practica es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n-pose (Ultralytics), deteccion de objetos con cabeza de keypoints |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato de pesos `best.pt` de PyTorch; no se documentan variantes) |
| Idiomas soportados | no disponible (no es un modelo linguistico; el dominio es visual) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), con `kpt_shape [4,3]` |

## Arquitectura y entrenamiento

El modelo sigue la familia YOLO de Ultralytics en su variante `n` (nano) con cabeza de pose, configurada para 4 keypoints con 3 valores cada uno (`kpt_shape [4,3]`, es decir, coordenadas x, y y visibilidad por esquina). La salida combina la deteccion del bounding box de la matricula con la regresion de las cuatro esquinas en el orden TL, TR, BR, BL. El autor advierte que la metrica mAP de pose integrada en Ultralytics usa las sigmas OKS de persona de COCO y no es significativa para matriculas, por lo que la evaluacion relevante es el error de esquina relativo al tamano de la placa.

El entrenamiento se realizo durante aproximadamente 1,5-2 horas sobre 10.432 imagenes, con 11 epocas (presupuesto de tiempo limitado), partiendo de pesos preentrenados en COCO. La supervision de esquinas procede de 2.224 placas con anotaciones humanas o poligonos del propio dataset, sin etiquetas generadas con SAM. El dataset mezcla fuentes con licencias propias, incluida CCPD, que es solo para investigacion. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un modelo de vision.

## Capacidades

- Deteccion de matriculas (bounding box) en imagenes.
- Estimacion de las cuatro esquinas de la placa (TL, TR, BR, BL) con visibilidad por punto.
- Base para rectificacion por homografia previa al OCR en pipelines ANPR.
- Entrenado especificamente con imagenes de Camboya, Tailandia y Vietnam, ademas de CCPD, Open Images y negativos.
- Manejo de imagenes negativas (sin matricula): el modelo reporta una tasa de falsos positivos de 0,092 sobre ellas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual de deteccion.

## Casos de uso

- Control de acceso en parkings: el modelo localiza la placa y sus esquinas para rectificarla y alimentar un OCR que valide la matricula contra una lista blanca en la entrada.
- Peajes y vias de pago en el sudeste asiatico: deteccion en tiempo real de matriculas de Camboya, Tailandia y Vietnam con rectificacion previa al reconocimiento de caracteres.
- Auditoria de calidad de datasets ANPR: usar las esquinas predichas para detectar anotaciones mal alineadas o placas deformadas en conjuntos de entrenamiento.
- Prototipos de investigacion en vision por computador: banco de pruebas para comparar estrategias de supervision de esquinas (humanas frente a poligonos del dataset).
- Preprocesado en pipelines de OCR de terceros: como etapa de deteccion y rectificacion antes de un modelo de reconocimiento de caracteres ya entrenado.
- Analisis de imagenes de trafico con condiciones de perspectiva variable: la prediccion de las cuatro esquinas permite corregir la inclinacion de placas captadas en angulo.
- Filtrado de imagenes negativas en recopilacion de datos: la tasa de falsos positivos documentada permite descartar imagenes sin matricula en procesos de curado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AP / AP50 en test | 0,646 / 0,920 |
| AR@100 | 0,718 |
| AP50 Camboya / Tailandia / Vietnam | 0,952 / 0,974 / 0,980 |
| AP50 internacional | 0,722 |
| Tasa de falsos positivos en imagenes negativas | 0,092 |
| Error de esquina mediano / p95 | 2,3 % / 6,6 % |
| Placas dentro del 5 % de error | 89,8 % |
| Epocas | 11 (con presupuesto de tiempo) |

El autor indica que la latencia se omite porque se midio en un host cargado y no es fiable. Las tablas completas estan en `reports/eval_yolo26n_pose.md` del repositorio. No se aportan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; al tratarse de una variante nano de YOLO, el consumo deberia ser bajo, pero no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; no se confirma en la model card.
- Opciones de despliegue: el autor documenta el uso mediante la libreria Ultralytics (`from ultralytics import YOLO`), lo que permite exportar a formatos soportados por Ultralytics (ONNX, TensorRT, etc.), aunque no se detallan en la model card.
- Latencia y throughput: no disponibles; el autor descarta explicitamente las mediciones de latencia por no ser fiables.

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros modelos ANPR en la informacion proporcionada. Como referencia de categoria, el modelo se situa en la familia YOLO de Ultralytics (variante nano con cabeza de pose), pero no se aportan cifras de alternativas comparables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anpr-sea-yolo26n-pose-corners | no disponible | no aplica | AP50 0,920; error mediano 2,3 % | AGPL-3.0 | repo de 0,0 GB, 0 descargas |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Prueba de concepto: el autor la califica explicitamente como no lista para produccion.
- Entrenamiento corto: 11 epocas y 1,5-2 horas, con presupuesto de tiempo limitado.
- Supervision de esquinas escasa: solo 2.224 placas con esquinas anotadas frente a 10.432 imagenes de entrenamiento.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y puede condicionar el uso comercial.
- Datos de entrenamiento con licencias propias: CCPD es solo para investigacion; hay que revisar la ficha del dataset antes de cualquier uso comercial.
- Cobertura geografica limitada: orientado a Camboya, Tailandia y Vietnam; el rendimiento en otras regiones (AP50 internacional 0,722) es notablemente inferior al regional (0,95-0,98).
- Tasa de falsos positivos del 9,2 % sobre imagenes negativas, relevante en produccion.
- Error de esquina p95 del 6,6 %: un 10,2 % de placas supera el umbral del 5 % de error, lo que puede degradar la rectificacion previa al OCR.
- La mAP de pose estandar de Ultralytics no es valida para este dominio; hay que usar las metricas de error de esquina.
- Repositorio sin descargas ni likes y sin pesos visibles en el momento del analisis (0,0 GB), lo que limita su reproducibilidad inmediata.
- Riesgo de sesgo por la composicion del dataset (fuentes heterogeneas y mezcla de paises).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/songhieng/anpr-sea-yolo26n-pose-corners
- Dataset: https://huggingface.co/datasets/songhieng/anpr-sea-license-plates
- Ultralytics (framework y licencia AGPL-3.0): https://github.com/ultralytics/ultralytics
- Informe de evaluacion: `reports/eval_yolo26n_pose.md` (dentro del repositorio del modelo)
