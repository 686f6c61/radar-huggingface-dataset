# dronefreak/rdd2022-rfdetr-nano

## Resumen

rdd2022-rfdetr-nano es un detector de objetos basado en RF-DETR Nano (Roboflow) y ajustado por el usuario dronefreak sobre el conjunto de datos RDD2022 Road Damage, un corpus multinacional de imagenes de carreteras anotadas con cuatro tipos de deterioro del pavimento: grieta longitudinal, grieta transversal, grieta en piel de cocodrilo y bache. El modelo resuelve una tarea de vision por computador muy concreta: localizar y clasificar danos superficiales en calzadas a partir de imagenes, con 30,5 millones de parametros y pesos en formato PyTorch (.pth).

El ajuste forma parte de DetectionBench, un framework del mismo autor cuyo objetivo es comparar detectores modernos bajo recetas de entrenamiento y metricas de evaluacion identicas, de modo que las diferencias de rendimiento sean atribuibles a la arquitectura y no al protocolo experimental. En el split de test de RDD2022, el modelo obtiene un mAP@50 de 60,85 y un mAP@50-95 de 33,22, con una precision de 65,49 y un recall de 54,30; en la tabla comparativa publicada queda por debajo de RF-DETR Small y Medium, y por delante de YOLOv8n.

Su relevancia practica esta en el nicho de la inspeccion de infraestructura: es un modelo pequeno, con licencia Apache-2.0 y pesos de solo decimas de GB, lo que permite desplegarlo en GPUs de consumo e incluso en CPU, o integrarlo en vehiculos y drones de inspeccion sin depender de hardware de centro de datos. La contrapartida es que el modelo es muy reciente (publicado el 20 de septiembre de 2026), no tiene descargas ni valoraciones, y sus metricas no estan verificadas por un tercero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de deteccion de la familia RF-DETR (DETR), variante Nano; detalles de capas y backbone no publicados en la informacion disponible |
| Parametros totales | 30,5 millones (30.5M), segun la model card |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No aplica: modelo de deteccion de objetos sobre imagen, no es un modelo de lenguaje |
| Tipos de cuantizacion | No disponible: solo se distribuyen pesos en su precision original; no hay variantes cuantizadas publicadas |
| Idiomas soportados | No aplica: la entrada es visual; los nombres de clase estan en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pth); archivo publicado: `checkpoint_best_total.pth` |
| Tamano del repositorio | 0,1 GB |
| Tarea (pipeline) | object-detection |
| Libreria | rfdetr |

## Arquitectura y entrenamiento

La model card identifica el modelo base como Roboflow/rf-detr-nano y la arquitectura como RF-DETR, una familia de detectores basada en el paradigma DETR (transformer de deteccion con decodificador de consultas de objetos) orientada a inferencia en tiempo real. La informacion proporcionada no detalla el backbone, el numero de capas, la resolucion de entrada ni el mecanismo de atencion concreto, por lo que esos extremos quedan como no disponibles. El modelo cuenta con 30,5 millones de parametros, un orden de magnitud propio de detectores ligeros de tiempo real.

El entrenamiento consistio en un ajuste fino (fine-tuning) del checkpoint RF-DETR Nano sobre el conjunto RDD2022 Road Damage, con cuatro clases objetivo. La evaluacion se realizo con el pipeline estandar de DetectionBench (`detectionbench-evaluate`) sobre el split de test, y las metricas se calcularon con las utilidades de deteccion de la libreria Supervision, que reportan mAP, precision y recall sin generar curvas PR, curvas F1 ni matrices de confusion. Los bloques de configuracion de entrenamiento de la model card aparecen truncados en la informacion disponible, por lo que no se pueden citar hiperparametros como el numero de epocas, el optimizador, la tasa de aprendizaje o el numero de imagenes de entrenamiento. No se documenta el uso de RLHF, DPO ni tecnicas equivalentes, algo que no aplica a un detector de objetos.

## Capacidades

- Deteccion de objetos en imagenes: devuelve cajas delimitadoras con clase y puntuacion de confianza para cuatro categorias de dano en pavimento (grieta longitudinal, grieta transversal, grieta en piel de cocodrilo y bache).
- Inferencia con umbral configurable: la API mostrada en la model card permite fijar el umbral de confianza (`model.predict("image.jpg", threshold=0.25)`).
- Deteccion de instancias multiples por imagen: puede localizar varios danos distintos en una misma calzada.
- Integracion con el ecosistema PyTorch: los pesos se cargan mediante `huggingface_hub.hf_hub_download` y la clase `rfdetr.RFDETRNano`.
- Compatibilidad con Supervision para anotacion y visualizacion de resultados.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision-language, audio ni modo de pensamiento: es exclusivamente un detector visual de dominio especifico.
- Capacidades multilingues: no aplica.

## Casos de uso

- Inventario municipal de danos en calzadas: procesar lotes de fotografias georreferenciadas de las vias de un municipio para generar un censo automatizado de grietas y baches por tipo, usando el mAP@50 de 72,71 en baches como indicador de que esa clase es la mas fiable para priorizar actuaciones.
- Inspeccion embarcada en vehiculos: montar el modelo en una dashcam o en un equipo a bordo de un vehiculo de mantenimiento para detectar deterioro mientras circula, aprovechando que el modelo requiere menos de 1 GB de VRAM en inferencia y puede ejecutarse en GPUs de consumo.
- Auditoria con drones: analizar imagenes aereas de tramos de carretera para localizar grietas longitudinales y transversales en zonas de dificil acceso; el modelo es lo bastante ligero para desplegarse en el propio dron o en un nodo de borde cercano.
- Priorizacion de reparaciones y gestion de tickets: convertir las detecciones en ordenes de trabajo priorizadas por clase y confianza, integrando la salida del modelo en un sistema de gestion de activos viarios.
- Peritaje y reclamaciones por danos en vehiculos: analizar fotografias de la via aportadas por conductores o aseguradoras para documentar la existencia de baches o grietas en el punto declarado, como evidencia complementaria y no como sustituto de una inspeccion presencial.
- Integracion en sistemas GIS: exportar las detecciones con sus coordenadas a una capa de un sistema de informacion geografica para construir mapas de calor de deterioro y planificar campanas de reasfaltado.
- Reproducibilidad e investigacion: emplear el modelo y su receta como linea base dentro de DetectionBench para comparar arquitecturas de deteccion sobre RDD2022 con metricas homogeneas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de RDD2022 Road Damage (no verificados por terceros):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 60,85 |
| mAP@50-95 | 33,22 |
| Precision | 65,49 |
| Recall | 54,30 |
| F1 | 59,37 |
| FLOPs | No disponible (no publicado en el proyecto original) |

Rendimiento por clase (mAP, split de test de RDD2022):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| longitudinal_crack | 51,24 | 26,12 |
| transverse_crack | 55,01 | 26,95 |
| alligator_crack | 64,45 | 34,20 |
| pothole | 72,71 | 45,60 |

## Requisitos de hardware

- Huella de memoria de los pesos: aproximadamente 122 MB en FP32 y 61 MB en FP16, calculado a partir de los 30,5 millones de parametros. Es una estimacion propia, no un dato publicado.
- VRAM para inferencia: por debajo de 1 GB en FP32 con resoluciones de imagen habituales, sumando pesos y activaciones; el valor exacto depende de la resolucion de entrada, que no se documenta.
- GPU recomendadas: cualquier GPU NVIDIA moderna sirve; una RTX 3060, RTX 4060 o superior es mas que suficiente. Las A100 o H100 no aportan ventaja para este tamano de modelo.
- GPU de consumo: si, cabe en cualquier GPU de consumo actual y previsiblemente incluso en CPU o en dispositivos de borde, dado el reducido numero de parametros.
- Opciones de despliegue: libreria oficial `rfdetr` sobre PyTorch (`pip install rfdetr huggingface_hub`), con carga de pesos desde Hugging Face; integracion con Supervision para post-procesado y visualizacion. No se documentan en la informacion disponible rutas de despliegue con vLLM, llama.cpp, Ollama, TGI, ONNX Runtime ni TensorRT, que en la mayoria de los casos tampoco aplican a un detector de objetos.
- Latencia y throughput: no disponibles; no se publican mediciones de FPS, latencia por imagen ni tiempos de inferencia.

## Comparativa con modelos similares

Comparativa publicada por el autor en la model card, todos evaluados sobre el split de test de RDD2022 Road Damage con el mismo pipeline. Los parametros, la licencia y el formato de pesos de los modelos alternativos no se detallan en la informacion disponible.

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 65,08 | 36,02 | 71,18 | 55,98 |
| RF-DETR Small | 64,71 | 35,73 | 65,69 | 59,41 |
| YOLOv8m | 62,03 | 34,08 | 65,61 | 57,42 |
| YOLOv8s | 61,45 | 33,53 | 64,55 | 57,18 |
| YOLOv26s | 61,27 | 33,30 | 64,42 | 57,13 |
| YOLOv26m | 61,24 | 33,38 | 63,70 | 57,27 |
| RF-DETR Nano (este modelo) | 60,85 | 33,22 | 65,49 | 54,30 |
| YOLOv8n | 58,80 | 32,05 | 62,03 | 56,08 |

Lectura de la comparativa: la variante Nano se situa en el ultimo cuarto de la tabla, solo por delante de YOLOv8n y con una diferencia de 3,86 puntos de mAP@50 respecto a RF-DETR Small. Su recall (54,30) es el mas bajo de toda la tabla, mientras que su precision (65,49) es competitiva frente a YOLOv8n, YOLOv8s y YOLOv8m. Datos de parametros, contexto y licencia de los modelos competidores: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo detecta cuatro clases de dano en pavimento y no debe usarse para otras tareas de deteccion sin un nuevo ajuste fino.
- Recall bajo (54,30 sobre el split de test): el modelo omite una proporcion apreciable de danos reales, con entre un 45 y un 46 por ciento de falsos negativos segun esa metrica. Para inspeccion critica conviene combinar la salida con revision humana o subir el umbral con cautela.
- Metrica mas debil en grietas longitudinales (mAP@50 de 51,24) y transversales (55,01), que son precisamente las clases mas frecuentes en muchas redes viarias.
- Metricas no verificadas: los cuatro valores de benchmark aparecen marcados como `verified: false` en el model-index y estan autodeclarados por el autor. Ademas, el propio autor indica que no se generan curvas PR, curvas F1 ni matrices de confusion.
- Sin adopcion ni validacion por la comunidad: cero descargas y cero valoraciones en el momento de redactar esta ficha, por lo que no existe evidencia externa de robustez en condiciones reales.
- Riesgo de alucinacion en el sentido generativo no aplica; el riesgo equivalente son falsos positivos que marquen como dano elementos de la calzada como sombras, juntas de dilatacion, marcas viales o parches ya reparados.
- Sesgos potenciales derivados del conjunto de entrenamiento: RDD2022 es un corpus multinacional con predominio de ciertos paises y condiciones de captura (camaras, iluminacion, clima, tipo de asfalto). El rendimiento puede degradarse fuera de esa distribucion.
- Desconocimiento del protocolo completo de entrenamiento: el bloque de configuracion de entrenamiento de la model card aparece truncado, de modo que no es posible reproducir el ajuste con la informacion disponible.
- Licencia Apache-2.0 en el modelo, permisiva para uso comercial, pero conviene revisar de forma independiente la licencia del conjunto de datos RDD2022 antes de explotar el modelo en produccion.
- Ausencia de informacion sobre idiomas: no aplica, pero la ausencia de metadatos linguisticos impide cualquier afirmacion al respecto.
- Sin datos de latencia, FPS ni resolucion de entrada recomendada, lo que complica dimensionar un despliegue en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/rdd2022-rfdetr-nano
- Conjunto de datos RDD2022 (card en Hugging Face): https://huggingface.co/datasets/dronefreak/RDD2022
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Roboflow/rf-detr-nano
- Libreria RF-DETR (referenciada en el codigo de uso): disponible a traves de `pip install rfdetr`, sin repositorio enlazado en la informacion proporcionada
- Libreria Supervision: https://github.com/roboflow/supervision
- Referencias arXiv citadas en las etiquetas del modelo: https://arxiv.org/abs/2209.08538 , https://arxiv.org/abs/2511.09554 , https://arxiv.org/abs/2304.07193 , https://arxiv.org/abs/2606.03748 (los titulos no se incluyen en la informacion disponible)
- Busqueda web: no se han recuperado resultados relevantes sobre este modelo. Las unicas entradas devueltas corresponden a paginas de soporte de Microsoft sin relacion con el modelo, la deteccion de objetos ni el mantenimiento de carreteras.
