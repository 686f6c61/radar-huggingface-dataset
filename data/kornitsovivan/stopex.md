# kornitsovivan/stopex

## Resumen

Stopex es un modelo de deteccion de objetos publicado en Hugging Face por el usuario kornitsovivan bajo licencia AGPL-3.0. El modelo detecta cuatro clases especificas del dominio de las estaciones de servicio: surtidores de combustible (petrol pump), mangueras de combustible (petrol hose), marquesinas (roof canopy) y paneles de precios (price board). Se distribuye en formato ONNX junto con un script de inferencia (`miner.py`) y un fichero de configuracion de servicio (`chute_config.yml`).

El repositorio es de tamano practicamente nulo (0.0 GB reportados) y no incluye model card descriptiva mas alla de la lista de clases y los ficheros que lo componen. No se especifica la arquitectura base, el numero de parametros, el contexto de entrenamiento ni el origen de los datos. Por el pipeline declarado (`object-detection`) y el formato ONNX, se trata de un detector de objetos pensado para despliegue en produccion, presumiblemente en un pipeline de vision por computador para inspeccion o analisis de gasolineras.

El interes del modelo es acotado pero concreto: cubre una tarea de nicho (deteccion de elementos de estaciones de servicio) que no suele estar cubierta por los detectores genericos tipo COCO. Sin embargo, la ausencia de documentacion tecnica, benchmarks y datos de entrenamiento limita seriamente su evaluacion previa a adopcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos en formato ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (vision por computador) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `weights.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna. El unico dato tecnico es que el modelo se distribuye como grafo ONNX (`weights.onnx`), lo que permite inferencia portable con ONNX Runtime en CPU y GPU, y potencialmente conversion a otros runtimes (TensorRT, OpenVINO). El pipeline declarado es `object-detection` y la salida se organiza en cuatro clases: `petrol pump`, `petrol hose`, `roof canopy` y `price board`.

La model card menciona una funcion de inferencia `Miner(path).predict_batch(batch_images, offset, n_keypoints)` que sugiere un procesamiento por lotes de imagenes con parametros de desplazamiento y numero de keypoints; esto podria indicar un detector con representacion basada en keypoints (estilo CenterNet o similares), pero es una inferencia no confirmada por el autor. No hay informacion sobre volumen de datos de entrenamiento, composicion del dataset, tecnicas de aumento de datos, ni sobre si se aplico fine-tuning desde un backbone preentrenado.

## Capacidades

- Deteccion de objetos en imagenes para cuatro clases de dominio especifico: surtidores, mangueras, marquesinas y paneles de precios.
- Inferencia por lotes mediante la API `predict_batch` del script `miner.py`.
- Despliegue portable via ONNX Runtime al distribuirse como grafo ONNX.
- Integracion en pipelines de servicio mediante `chute_config.yml`.
- No se documenta soporte de tool calling, agentes, texto, vision generativa, audio ni capacidades multilingues.
- No se documenta modo de razonamiento (thinking), segmentacion, ni deteccion de keypoints mas alla del parametro `n_keypoints` de la API.

## Casos de uso

- Inventario automatizado de estaciones de servicio: procesar imagenes aereas o de satelite para contar surtidores y marquesinas, usando `predict_batch` sobre lotes de imagenes y agregando detecciones por ubicacion.
- Monitorizacion de precios: detectar paneles de precios (`price board`) en imagenes de gasolineras para alimentar un pipeline de OCR posterior que extraiga los importes.
- Auditoria de infraestructura: verificar presencia y estado de marquesinas y mangueras en inspecciones periodicas mediante lotes de fotografias.
- Analisis de competencia a escala: rastrear la presencia de estaciones y sus elementos visibles en imagenes de mapas o street view para estudios de mercado.
- Mantenimiento predictivo visual: detectar mangueras (`petrol hose`) en imagenes de inspeccion para identificar ausencias o deterioro aparente.
- Etiquetado asistido: usar el detector como pre-anotador en un flujo de anotacion humana para acelerar la creacion de datasets de estaciones de servicio.
- Integracion en servicio de inferencia: desplegar el modelo detras de un endpoint usando `chute_config.yml` como base de configuracion del contenedor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al no conocerse el tamano del modelo ni el backbone, no es posible estimar requisitos de memoria.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de deteccion, es probable que funcione en GPUs consumer, pero no hay datos que lo confirmen.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), y potencialmente TensorRT u OpenVINO previa conversion; el repositorio incluye `chute_config.yml` para servir la imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stopex | no disponible | no aplica | Deteccion de 4 clases de gasolinera | AGPL-3.0 | Hugging Face |
| YOLOv8 / YOLO11 (Ultralytics) | 3M-60M aprox. | no aplica | Deteccion generica (COCO) | AGPL-3.0 / Enterprise | GitHub, Hugging Face |
| DETR / RT-DETR | 20M-60M aprox. | no aplica | Deteccion generica (COCO) | Apache-2.0 | Hugging Face, GitHub |
| Grounding DINO | 170M-900M aprox. | no aplica | Deteccion abierta por texto | Apache-2.0 | Hugging Face |

La comparacion es orientativa: los detectores genericos no cubren las clases especificas de Stopex sin fine-tuning, y no hay datos publicados para comparar precision o velocidad con este modelo.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se indica arquitectura, tamano, datos de entrenamiento ni metricas, lo que impide evaluar su calidad antes de adoptarlo.
- Riesgo de sobreajuste o sesgo de dominio: al ser un detector de cuatro clases muy especificas, su rendimiento fuera del dominio de estaciones de servicio (iluminacion, angulo, pais, tipo de gasolinera) es desconocido.
- Riesgo de falsos positivos y negativos no cuantificado: sin benchmark, no hay forma de conocer precision/recall por clase.
- Licencia AGPL-3.0: el uso en servicios de red implica obligaciones de liberacion del codigo fuente derivado; no es adecuada para productos propietarios sin revision legal.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso o validacion por la comunidad.
- No se especifica el origen de los datos de entrenamiento, lo que plantea dudas sobre posibles sesgos geograficos o de licencia de las imagenes.
- El parametro `n_keypoints` de la API sugiere una representacion que podria no ser compatible con formatos estandar de anotacion (COCO, YOLO) sin conversion.
- No hay garantia de mantenimiento ni soporte por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/kornitsovivan/stopex
- Script de inferencia: `miner.py` (incluido en el repositorio)
- Configuracion de servicio: `chute_config.yml` (incluido en el repositorio)
- Pesos: `weights.onnx` (incluido en el repositorio)
