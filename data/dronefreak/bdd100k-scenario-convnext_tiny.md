# dronefreak/bdd100k-scenario-convnext_tiny

## Resumen

ConvNeXt-Tiny finetuned on BDD100K Scenario Classification es un clasificador de imagenes desarrollado por el usuario dronefreak, orientado a identificar el tipo de escenario de conduccion a partir de una unica imagen de camara a bordo. El modelo parte del checkpoint preentrenado `timm/convnext_tiny.in12k_ft_in1k` (ConvNeXt-Tiny, 27,8 millones de parametros) y se ajusta sobre el dataset `dronefreak/BDD100K-Scenario-Classification`, derivado del campo `attributes.scene` de BDD100K. Resuelve una tarea de 7 clases: city street, highway, residential, parking lot, gas stations, tunnel y unknown.

Su relevancia practica esta en el contexto de la conduccion autonoma: disponer de un clasificador ligero y rapido de escenario permite enrutar pipelines de percepcion, curar datasets y validar el dominio operativo (ODD) de un sistema ADAS sin desplegar modelos pesados. Con 27,8 M de parametros y unos 111 MB en fp32, es un modelo de borde que cabe en cualquier GPU de consumo e incluso en CPU.

El modelo se publica junto a BDD100K-Toolkit, un conjunto de herramientas "dependency-clean" para preparar BDD100K, entrenar modelos y evaluarlos con las mismas metricas sobre los mismos splits, lo que facilita la reproducibilidad. La tarea es no oficial y sigue el dataset de Kaggle del mismo nombre. Las metricas declaradas son Top-1 del 76,69 % y macro F1 del 56,88 % sobre el split de test de 10 000 imagenes, y estan marcadas como no verificadas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (CNN pura con diseño inspirado en vision transformers) |
| Parametros totales | 27,8 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: clasificacion de imagenes a resolucion fija, definida en el campo `imgsz` del checkpoint (no especificada en la model card) |
| Tipos de cuantizacion | No disponible (no se documentan pesos cuantizados ni versiones ONNX/TensorRT) |
| Idiomas soportados | No aplica (modelo de vision, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint de PyTorch (`best.pt`) con `state_dict`, `model_name`, `class_names`, `imgsz`, `mean` y `std`; carga mediante `timm.create_model` |

Otros datos de interes: pipeline `image-classification`, libreria `timm`, dataset asociado `dronefreak/BDD100K-Scenario-Classification`, tamaño del repositorio 0,1 GB, 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion y actualizacion 2026-10-02.

## Arquitectura y entrenamiento

La base es ConvNeXt-Tiny, una red convolucional pura que moderniza el diseño de ResNet incorporando decisiones tomadas de los vision transformers (kernels grandes de 7x7, normalizacion LayerNorm, activacion GELU, menos capas de activacion y downsampling con capas separadas). El checkpoint de partida, `timm/convnext_tiny.in12k_ft_in1k`, se preentreno primero en ImageNet-12k y despues se ajusto en ImageNet-1k, lo que le aporta representaciones visuales genericas de alta calidad. Sobre esa base se sustituye la cabeza de clasificacion por una de 7 salidas, correspondientes a los escenarios de conduccion derivados de BDD100K.

El ajuste fino se realizo como parte de BDD100K-Toolkit. La configuracion documentada en la model card es de 50 epocas maximas, 25 epocas efectivamente entrenadas y seleccion del mejor checkpoint (`best.pt`) en la epoca 15 segun macro F1 sobre el split de validacion. No se especifican en la informacion disponible el optimizador, la tasa de aprendizaje, el tamaño de lote, la resolucion de entrenamiento ni las tecnicas de aumento de datos. Tampoco se documenta ningun tipo de ajuste por preferencias (RLHF/DPO), lo cual es esperable en un modelo discriminativo de vision. La evaluacion se realiza sobre el split de test de 10 000 imagenes con las mismas metricas y splits que el resto de modelos del zoo de la herramienta.

## Capacidades

- Clasificacion de imagenes en 7 escenarios de conduccion: city street, highway, residential, parking lot, gas stations, tunnel y unknown.
- Salida de probabilidades por clase mediante softmax, apta para umbralizar o para extraer la confianza de la prediccion.
- Top-5 accuracy del 99,93 % sobre el split de test, util para recuperar candidatos alternativos cuando la clase dominante es ambigua.
- Inferencia ligera y de baja latencia potencial gracias a sus 27,8 M de parametros y a su naturaleza puramente convolucional.
- Integracion directa con el ecosistema `timm` y PyTorch, con normalizacion y tamaño de entrada almacenados en el propio checkpoint.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de generacion de texto, de codigo ni de matematicas.
- No realiza deteccion de objetos, segmentacion, OCR ni descripcion de escenas; solo asigna una etiqueta de escenario global a la imagen.

## Casos de uso

- Curacion y etiquetado previo de datasets de conduccion: el modelo puede preetiquetar grandes volumenes de imagenes con la clase de escenario y reservar la revision humana para los casos de baja confianza, reduciendo el coste de anotacion. Su Top-1 del 76,69 % y su Top-5 del 99,93 % permiten usar la segunda y tercera opcion como sugerencias.
- Enrutado de pipelines de percepcion: en funcion del escenario detectado (por ejemplo, tunnel frente a highway), se pueden activar o desactivar modulos especificos, como ajustes de exposicion, deteccion de carriles o heuristicas de iluminacion.
- Validacion de dominio operativo (ODD) en sistemas ADAS: clasificar los fotogramas de un registro permite comprobar si un sistema se ha probado suficientemente en cada escenario y detectar huecos de cobertura, especialmente en clases minoritarias como tunel o parking.
- Analitica de flotas y planificacion de rutas: agregar las predicciones sobre grabaciones de una flota permite caracterizar la distribucion de escenarios recorridos por vehiculo, zona o franja horaria.
- Filtrado de datos para entrenamiento de otros modelos: seleccionar subconjuntos equilibrados de imagenes de parking, tunel o gasolinera para tareas posteriores de deteccion o segmentacion, donde esas clases suelen estar infrarrepresentadas.
- Control de calidad en la ingesta de datos: detectar imagenes mal etiquetadas o fuera de distribucion comparando la etiqueta declarada con la prediccion del modelo y con su nivel de confianza.
- Contexto previo para planificacion de conducta: aportar una señal de escenario de bajo coste computacional que condicione la politica de conduccion o la seleccion de parametros de control en un sistema embarcado.
- Demostraciones y prototipado en borde: al ocupar unos 111 MB en fp32 y alrededor de 56 MB en fp16, es viable ejecutarlo en dispositivos con recursos limitados dentro de un prototipo de percepcion.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test (10 000 imagenes). Las metricas del model-index estan marcadas como `verified: false`.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 76,69 % |
| Top-5 accuracy | 99,93 % |
| Macro F1 | 56,88 % |
| Balanced accuracy | 59,82 % |
| Macro precision | 54,60 % |
| Macro recall | 59,82 % |

Rendimiento por clase en el mismo split:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| city street | 85,73 % | 78,26 % | 81,82 % | 6112 |
| gas stations | 28,57 % | 28,57 % | 28,57 % | 7 |
| highway | 71,95 % | 76,79 % | 74,29 % | 2499 |
| parking lot | 53,85 % | 57,14 % | 55,45 % | 49 |
| residential | 56,41 % | 71,99 % | 63,25 % | 1253 |
| tunnel | 64,71 % | 81,48 % | 72,13 % | 27 |
| unknown | 20,97 % | 24,53 % | 22,61 % | 53 |

Comparativa con el resto de modelos del zoo de BDD100K-Toolkit, evaluados sobre el mismo split y ordenados por Top-1:

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| YOLO11n | 78,58 % | 49,47 % | 46,05 % | 60,98 % |
| MobileNetV4-Conv-Small | 78,20 % | 52,89 % | 48,69 % | 61,41 % |
| ConvNeXt-Atto | 77,44 % | 61,06 % | 60,34 % | 67,92 % |
| ResNet-18 | 77,14 % | 47,29 % | 44,83 % | 54,25 % |
| YOLO26n | 76,78 % | 48,33 % | 43,94 % | 58,99 % |
| ConvNeXt-Tiny | 76,69 % | 56,88 % | 59,82 % | 54,60 % |
| YOLOv8n | 76,13 % | 46,40 % | 43,26 % | 54,14 % |
| EfficientViT-B0 | 75,94 % | 46,10 % | 42,64 % | 53,74 % |

No se han publicado datos de latencia, throughput ni consumo energetico en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 111 MB solo para los pesos en fp32 y unos 56 MB en fp16; con activaciones y batch pequeño, el consumo real es de unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU moderna es suficiente. Se puede ejecutar sobradamente en RTX 3060, RTX 4060, RTX 4090, y en GPUs de centro de datos como A100 o H100, aunque en estas ultimas estaria infrautilizado.
- Cabe en GPU de consumo: si, en todas las gamas actuales, incluidas las de gama baja y portatiles. Tambien es viable en CPU y en dispositivos embebidos tipo Jetson.
- Opciones de despliegue: PyTorch con `timm` (ruta documentada en la model card, cargando `best.pt` con `torch.load`), exportacion a TorchScript u ONNX y posterior ejecucion con ONNX Runtime o TensorRT. No procede usar llama.cpp, Ollama, vLLM ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones en la informacion proporcionada.
- Nota de integracion: el checkpoint incluye `imgsz`, `mean` y `std`, por lo que el preprocesado debe tomar esos valores del propio fichero para no desalinear la normalizacion.

## Comparativa con modelos similares

Comparativa dentro de la misma tarea (clasificacion de escenario BDD100K, mismo split de test). Los parametros de los modelos alternativos no se detallan en la informacion disponible.

| Modelo | Top-1 | Macro F1 | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConvNeXt-Tiny (este modelo) | 76,69 % | 56,88 % | 27,8 M | Apache-2.0 | HuggingFace, via `timm` |
| ConvNeXt-Atto | 77,44 % | 61,06 % | No disponible | No disponible | Repositorio BDD100K-Toolkit |
| YOLO11n | 78,58 % | 49,47 % | No disponible | No disponible | Repositorio BDD100K-Toolkit |
| MobileNetV4-Conv-Small | 78,20 % | 52,89 % | No disponible | No disponible | Repositorio BDD100K-Toolkit |
| ResNet-18 | 77,14 % | 47,29 % | No disponible | No disponible | Repositorio BDD100K-Toolkit |

Lectura de la comparativa: ConvNeXt-Tiny no lidera en Top-1 (queda por detras de YOLO11n, MobileNetV4-Conv-Small, ConvNeXt-Atto y ResNet-18), pero obtiene un macro F1 claramente superior al de ResNet-18, YOLO11n, YOLO26n, YOLOv8n y EfficientViT-B0, lo que indica un mejor equilibrio entre clases. ConvNeXt-Atto domina en macro F1 (61,06 %) y en balanced accuracy (60,34 %) con muchas menos operaciones, por lo que es la alternativa mas directa a considerar si el criterio principal es el rendimiento por clase o la eficiencia. No se dispone de datos de licencia ni de parametros de los modelos alternativos dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Fuerte desbalance de clases: la clase city street concentra 6112 de las 10 000 imagenes de test, mientras que gas stations solo tiene 7, tunnel 27 y parking lot 49. Las metricas por clase en esas categorias son poco fiables estadisticamente.
- Rendimiento pobre en clases minoritarias y ambiguas: F1 del 28,57 % en gas stations, 22,61 % en unknown y 55,45 % en parking lot. La clase unknown actua como cajon de sastre y apenas se distingue (precision del 20,97 %).
- Brecha entre Top-1 y macro F1: 76,69 % frente a 56,88 %. Un Top-1 alto puede enmascarar un comportamiento deficiente en escenarios poco frecuentes pero criticos en conduccion, como tuneles o estaciones de servicio.
- Metricas no verificadas: el model-index marca `verified: false`, por lo que los numeros son autodeclarados por el autor y no han sido reproducidos de forma independiente.
- Tarea no oficial: la taxonomia de 7 clases se deriva del campo `attributes.scene` de BDD100K y sigue el dataset de Kaggle homonimo, no una definicion oficial del benchmark.
- Sesgo geografico y de dominio: BDD100K procede de grabaciones principalmente en Estados Unidos, por lo que el modelo puede degradarse en otras regiones, condiciones meteorologicas o tipos de via no representados. No se documentan analisis de sesgo.
- Riesgo de mala clasificacion en lugar de alucinacion: al ser un modelo discriminativo no genera texto, pero puede asignar etiquetas erroneas con alta confianza, especialmente en clases minoritarias. Se recomienda umbralizar la probabilidad y no usar la salida como verdad absoluta.
- Riesgo de desajuste de preprocesado: si no se usan los valores de `imgsz`, `mean` y `std` guardados en el checkpoint, las predicciones se degradan. La model card no publica estos valores de forma explicita.
- Restricciones de licencia: los pesos del modelo se distribuyen bajo Apache-2.0, lo que permite uso comercial. Sin embargo, el dataset subyacente BDD100K tiene sus propias condiciones de uso, que conviene revisar antes de explotar comercialmente un modelo derivado de el.
- Adopcion muy baja: el repositorio registra 0 descargas y 0 likes, sin validacion por parte de la comunidad, lo que refuerza la necesidad de evaluar el modelo en el dominio propio antes de llevarlo a produccion.
- Sin soporte documentado para cuantizacion ni exportacion a formatos de inferencia optimizados: cualquier despliegue en borde requiere convertir el checkpoint por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-scenario-convnext_tiny
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Dataset de clasificacion de escenarios: https://huggingface.co/datasets/dronefreak/BDD100K-Scenario-Classification
- Modelo base: https://huggingface.co/timm/convnext_tiny.in12k_ft_in1k
- Paper de ConvNeXt, "A ConvNet for the 2020s": https://arxiv.org/abs/2201.03545
- Paper de BDD100K: https://arxiv.org/abs/1805.04687
- Video de demostracion: https://huggingface.co/dronefreak/bdd100k-scenario-convnext_tiny/resolve/main/assets/demo_banner.mp4
- Poster de la demostracion: https://huggingface.co/dronefreak/bdd100k-scenario-convnext_tiny/resolve/main/assets/demo_banner_poster.jpg

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los presentes en la model card y en los metadatos de HuggingFace.
