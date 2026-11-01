# mr3vial/paleo-hebrew-seals-models

## Resumen

PaleoHebrew-Seals P0 checkpoints es una coleccion de puntos de control para la deteccion y clasificacion automatica de sellos con inscripciones en paleohebreo, un campo clasico de la epigrafia del Levante antiguo. El repositorio lo publica el usuario mr3vial en Hugging Face bajo licencia MIT y reune 47 archivos que ocupan 8,19 GB, con detectores de objetos (familia YOLO y RT-DETR) y clasificadores de imagen (familia ConvNeXt) entrenados sobre un split disjunto por entrada denominado `group_173_134` (173 imagenes de entrenamiento y 134 de evaluacion, sin `row_id` compartido).

El modelo no es un modelo de lenguaje: es un conjunto de pesos de vision por computador especializados en patrimonio cultural, con pipeline declarado `image-classification` y etiqueta de idioma `he`. Resuelve el problema de localizar y clasificar de forma reproducible los sellos y sus motivos iconograficos en rasters de 512 pixeles, un paso previo habitual en proyectos de catalogacion y digitalizacion de colecciones arqueologicas.

Su relevancia actual es metodologica: el autor documenta explicitamente el protocolo de evaluacion, audita fugas de datos en el corpus sintetico de acompanamiento (200k elementos, de los cuales 61.942 proceden de un artefacto de evaluacion) y marca como invalidos ciertos checkpoints por un error de coordenadas. Esa trazabilidad es poco frecuente en modelos de nicho y convierte el repositorio en una referencia util para quien necesite reproducir experimentos de deteccion arqueologica con separacion estricta entre entrenamiento y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8-M/X, YOLO11-M/X, YOLO26-M/X y RT-DETR-L (detectores); ConvNeXt-S/L (clasificadores) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | he (hebreo, segun metadatos; el modelo procesa imagenes, no texto) |
| Licencia | MIT para los archivos de checkpoint |
| Formato de pesos | PyTorch `.pt` (`best.pt`), con `labels.json`, `class_to_idx.json`, `metrics_best.json` y configuracion resuelta |

## Arquitectura y entrenamiento

El repositorio agrupa tres familias de detectores y dos de clasificadores. En deteccion incluye seis checkpoints YOLO (YOLOv8-M/X, YOLO11-M/X y YOLO26-M/X) entrenados solo con el grupo real de entrenamiento, acompanados de `args.yaml` y `results.csv`; un RT-DETR-L con inicializacion, tasa de aprendizaje y AMP corregidos (mAP50-95 de 0,22075), que el autor advierte que no esta equiparado en computo con la ejecucion B-to-R; y siete detectores de la etapa A entrenados exclusivamente con datos sinteticos. Las coordenadas de los detectores se exportan en espacio de imagen y son correctas para rasters de evaluacion de 512 pixeles.

En clasificacion hay 15 clasificadores solo-reales de 40 epocas (ConvNeXt-S queda excluido porque su ejecucion archivada se detuvo tras una epoca), 16 clasificadores preentrenados en la etapa A y pares bootstrap ConvNeXt-L/S marcados como `invalid_crop_bug` en el manifiesto: se entrenaron con cajas en espacio 640 sobre rasters de 512 pixeles y no deben citarse como evidencia, solo para reproducir la comparacion bootstrap. El corpus sintetico de acompanamiento contiene 200k elementos, de los cuales 138.058 son salidas limpias tras filtrar con `stage_b_clean_uids.txt`; el detalle de la auditoria esta en `provenance/leakage_audit.json`. No se documentan datos de RLHF ni de ajuste por preferencias, algo esperable en un modelo discriminativo.

## Capacidades

- Deteccion de objetos: localizacion de sellos e impresiones en imagenes arqueologicas con cajas exportadas en espacio de imagen para rasters de 512 pixeles.
- Clasificacion de imagen: asignacion de 22 clases sobre los recortes de evaluacion (1.244 crops exactos en el split `group_173_134`).
- Reconocimiento de motivos iconograficos y epigraficos del paleohebreo dentro del conjunto de clases definido en `labels.json`.
- Evaluacion reproducible: cada directorio de clasificador incluye `metrics_best.json` y la configuracion resuelta.
- Integracion en pipelines de vision: pesos en formato PyTorch compatibles con el ecosistema Ultralytics y con RT-DETR.
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente, vision generativa ni modo de pensamiento; es un modelo puramente discriminativo.

## Casos de uso

- Catalogacion de colecciones de sellos: aplicar los detectores YOLO o RT-DETR sobre fotografias de museo para generar cajas candidatas que un conservador revise, reduciendo el trabajo manual de inventario.
- Clasificacion de recortes en masa: usar los clasificadores ConvNeXt para etiquetar los 1.244 crops del split de evaluacion y comparar contra las anotaciones de referencia con `metrics_best.json`.
- Auditoria de conjuntos de datos arqueologicos: emplear el detector como linea base para detectar duplicados o imagenes mal etiquetadas antes de publicar un corpus.
- Investigacion en epigrafia comparada: entrenar o validar variantes con el split disjunto por entrada `group_173_134`, que evita que una misma entrada del catalogo aparezca en entrenamiento y evaluacion.
- Docencia y divulgacion: demostrar el flujo completo deteccion-clasificacion sobre imagenes de sellos en cursos de humanidades digitales, con checkpoints ligeros y trazabilidad documentada.
- Generacion de datos sinteticos controlados: reutilizar los siete detectores de la etapa A como referencia para estudiar el efecto del preentrenamiento sintetico frente al real.
- Reproduccion de experimentos: cargar los pares bootstrap ConvNeXt-L/S para reproducir la comparacion documentada, teniendo en cuenta que estan marcados como invalidos.

## Benchmarks y rendimiento

| Modelo | Metrica | Valor |
|---|---|---|
| RT-DETR-L corregido (`detector/R_rtdetr_corrected/`) | mAP50-95 | 0,22075 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de clasificacion (exactitud, F1) para el resto de checkpoints; las metricas por clasificador estan en los ficheros `metrics_best.json` de cada directorio, pero sus valores no se detallan en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 8,19 GB e incluye 47 archivos, por lo que el peso de un checkpoint individual es una fraccion de ese total.
- GPU recomendadas: no especificadas por el autor; por las arquitecturas (YOLOv8-M/X, YOLO11-M/X, YOLO26-M/X, RT-DETR-L, ConvNeXt-S/L) son viables GPU de consumo con suficiente VRAM, aunque no se aportan cifras.
- Cabe en GPU de consumo: previsiblemente si para los checkpoints YOLO-M y ConvNeXt-S, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: no documentadas; los pesos estan en formato PyTorch `.pt`, lo que sugiere el ecosistema Ultralytics para los YOLO y las utilidades propias de RT-DETR y ConvNeXt.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaleoHebrew-Seals P0 | no disponible | no aplica | Deteccion y clasificacion de sellos paleohebreos | MIT | Hugging Face (mr3vial) |
| YOLOv8-M/X (Ultralytics, original) | no disponible en esta ficha | no aplica | Deteccion de objetos generica | AGPL-3.0 o comercial | GitHub y Hugging Face |
| RT-DETR-L (original) | no disponible en esta ficha | no aplica | Deteccion de objetos generica | Apache 2.0 | GitHub y Hugging Face |
| ConvNeXt-S/L (original) | no disponible en esta ficha | no aplica | Clasificacion de imagen | MIT | GitHub y Hugging Face |

No se dispone de datos de rendimiento de los modelos originales en esta ficha, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- El split de evaluacion es una particion de validacion usada para seleccionar checkpoints, no un conjunto de test sellado; sus metricas pueden estar optimistas.
- Los pares bootstrap ConvNeXt-L/S estan marcados como `invalid_crop_bug` y no deben citarse como evidencia.
- El RT-DETR-L corregido no esta equiparado en computo con la ejecucion B-to-R, lo que impide comparaciones justas de rendimiento.
- El corpus sintetico de 200k contiene 61.942 salidas cuyo origen estilistico es un artefacto de evaluacion; es obligatorio filtrar con `stage_b_clean_uids.txt` para entrenamiento disjunto por entrada.
- ConvNeXt-S queda excluido de los clasificadores solo-reales porque su ejecucion se detuvo tras una epoca.
- No hay informacion publicada sobre sesgos, tasas de alucinacion (no aplica a un modelo discriminativo) ni limites de idioma mas alla de la etiqueta `he`.
- La licencia MIT cubre los archivos de checkpoint, pero no se detalla la licencia de los datos de entrenamiento ni de las imagenes fuente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mr3vial/paleo-hebrew-seals-models
- Conjunto de evaluacion asociado: `paleo-hebrew-seals-unambiguous-v2` (referenciado en la model card; no se proporciona URL directa)
- Manifiesto y runbook incluidos en el repositorio: `P0_MANIFEST.csv`, `RUNBOOK.md`
- Auditoria de fugas: `provenance/leakage_audit.json`
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales.
