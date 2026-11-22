# dronefreak/brackish-yolo26m

## Resumen

brackish-yolo26m es un detector de objetos YOLO26m afinado por el usuario dronefreak sobre el conjunto de datos Brackish Underwater, un benchmark de imagenes submarinas y de aguas salobres. El modelo parte de los pesos preentrenados de Ultralytics/YOLO26 y se ha entrenado y evaluado dentro de DetectionBench, un framework cuyo objetivo es reproducir recetas de entrenamiento y metricas de evaluacion identicas entre distintos detectores modernos, de modo que las comparaciones entre arquitecturas sean justas y auditables.

El modelo resuelve la deteccion de seis clases de fauna marina (cangrejo, pez, medusa, camarón, pez pequeno y estrella de mar) en escenarios de vision subacuatica, donde la turbidez, la baja iluminacion, el color cast y la oclusion parcial degradan con frecuencia los detectores genericos. Con 21,8 millones de parametros y 75,4 GFLOPs a 640 px, se situa en el segmento medio de la familia YOLO, lo que lo hace desplegable en GPUs de consumo sin renunciar a una precision alta en el dominio objetivo.

Su relevancia actual es doble: por un lado, aporta un punto de referencia reproducible para investigacion en biologia marina y monitorizacion de ecosistemas acuaticos; por otro, su publicacion dentro de DetectionBench permite comparar su rendimiento con otras variantes de YOLO (v8, v11, v26) entrenadas con la misma receta, algo poco habitual en modelos afinados de forma aislada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26m (detector de una etapa, familia Ultralytics YOLO26) |
| Parametros totales | 21.838.332 (21,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el formato nativo es FP32/FP16 via PyTorch |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`); el repo tambien incluye `results.csv` y `args.yaml` |
| Entrada | imagenes de 640 px durante entrenamiento |
| Coste computacional | 75,4 GFLOPs a 640 px |
| Tamano del repositorio | 0,1 GB |
| Tarea | object-detection |
| Clases | crab, fish, jellyfish, shrimp, small_fish, starfish |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLO26m, un detector de objetos de una sola etapa de la familia YOLO26 de Ultralytics. El modelo se ha obtenido por ajuste fino (finetune) de los pesos oficiales Ultralytics/YOLO26 sobre el dataset Brackish Underwater, manteniendo la cabeza de deteccion adaptada a las seis clases del dominio marino. No se dispone en la informacion proporcionada de detalles adicionales sobre el backbone, el cuello de la red ni innovaciones internas especificas de YOLO26 (por ejemplo, mecanismos de asignacion de etiquetas o modulos de atencion), por lo que esos aspectos quedan como no disponibles.

El entrenamiento se realizo con el toolkit DetectionBench y la libreria Ultralytics, con 500 epocas configuradas y efectivamente ejecutadas, paciencia de early stopping de 100, batch size de 32, tamano de imagen de 640 px, optimizador `auto`, learning rate inicial de 0,001 y semilla 0. No se documenta en la informacion disponible el numero de imagenes del dataset, la composicion exacta del split ni si se aplicaron tecnicas de aumento de datos especificas mas alla de las predefinidas por Ultralytics. Tampoco se indica el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de vision supervisado.

## Capacidades

- Deteccion de objetos en imagenes subacuaticas y de aguas salobres para seis clases: crab, fish, jellyfish, shrimp, small_fish y starfish.
- Localizacion con cajas delimitadoras y etiquetas de clase con puntuaciones de confianza, en el formato estandar de Ultralytics.
- Inferencia sobre imagenes individuales, lotes, directorios y flujos de video mediante `model.predict(source=...)`.
- Umbral de confianza configurable (el ejemplo de la model card usa `conf=0.25`) para ajustar el equilibrio entre precision y recall en produccion.
- Integracion con el ecosistema Ultralytics: exportacion a otros formatos, validacion, entrenamiento adicional y visualizacion de resultados.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingues: es un modelo puramente de vision por computador.
- No dispone de modo thinking, vision-lenguaje, audio ni generacion de texto.

## Casos de uso

- Monitorizacion de ecosistemas marinos y de estuarios: el modelo puede procesar imagenes de camaras subacuaticas fijas o de vehiculos no tripulados para cuantificar la presencia de cangrejos, peces, medusas, camarones y estrellas de mar, gracias a su mAP@50 de 98,74 % en el dominio objetivo.
- Inventario de biodiversidad en estudios de biologia marina: la deteccion por clase permite generar series temporales de abundancia relativa por especie, con la ventaja de que el modelo se ha entrenado con una receta reproducible y comparable con otras variantes de YOLO.
- Acuicultura y control de poblaciones: deteccion de camarones y peces pequenos en tanques o piscinas para estimar densidad y detectar agregaciones anomalas, aprovechando el recall del 97,32 % en el conjunto de prueba.
- Vigilancia de especies invasoras o proliferaciones de medusas: la clase jellyfish, con mAP@50 de 96,31 %, permite activar alertas tempranas cuando se detectan concentraciones inusuales en imagenes de boyas o drones subacuaticos.
- Automatizacion de anotacion y curado de datasets: el modelo puede preetiquetar grandes volumenes de imagenes subacuaticas y reducir el coste de anotacion manual, que despues se revisa por expertos.
- Educacion y divulgacion cientifica: integracion en aplicaciones o exposiciones que identifican fauna marina en tiempo real a partir de imagenes o video, con un coste computacional de 75,4 GFLOPs por imagen a 640 px.
- Investigacion comparativa de detectores: al formar parte del zoo de modelos de DetectionBench, sirve como referencia para estudiar el efecto de la arquitectura y del tamano del modelo en un mismo dataset y con una receta identica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), evaluados sobre el split de test de Brackish Underwater con el pipeline `detectionbench-evaluate`. Ninguno de los valores esta verificado de forma independiente (`verified: false`).

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 98,74 |
| mAP@50-95 | 85,93 |
| Precision | 98,74 |
| Recall | 97,32 |
| F1 | 98,02 |

Rendimiento por clase (declarado por el autor):

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| crab | 99,5 | 95,53 |
| fish | 99,44 | 89,89 |
| jellyfish | 96,31 | 73,13 |
| shrimp | 99,47 | 79,23 |
| small_fish | 98,21 | 78,42 |
| starfish | 99,5 | 99,4 |

Comparativa dentro del zoo de modelos de DetectionBench sobre el mismo dataset (valores declarados por el autor):

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) |
|---|---|---|---|---|
| YOLOv8s | 99,3 | 85,65 | 99,36 | 98,53 |
| YOLOv8m | 99,19 | 86,04 | 98,69 | 98,71 |
| YOLO26s | 99,1 | 85,77 | 99,45 | 97,83 |
| YOLO26n | 98,95 | 83,66 | 98,17 | 97,23 |
| YOLO11x | 98,89 | 86,3 | 98,84 | 98,25 |
| YOLO11n | 98,87 | 83,27 | 98,76 | 96,69 |
| **YOLO26m (este modelo)** | **98,74** | **85,93** | **98,74** | **97,32** |
| YOLOv8n | 98,41 | 83,01 | 99,51 | 96,95 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia orientativa por tamano (21,9 M de parametros, 75,4 GFLOPs a 640 px), un modelo de este orden suele requerir del orden de 1-2 GB en FP16 y menos de 1 GB en FP32 solo para pesos; el pico real depende del batch y de la resolucion de entrada.
- GPU recomendadas: no se especifican en la model card. Por coste computacional, una GPU de consumo moderna (gama RTX 30/40 o superior) es suficiente para inferencia interactiva a 640 px; para entrenamiento o lotes grandes se recomienda una GPU de datacenter (A100, H100) o una GPU de consumo de gama alta con suficiente VRAM.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs de consumo con al menos 4 GB de VRAM para inferencia a 640 px; el dato exacto no esta confirmado en la informacion disponible.
- Opciones de despliegue: Ultralytics (PyTorch) es la via documentada, cargando `best.pt` con `YOLO(weights)`. No se documentan en la informacion proporcionada integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente). La exportacion a otros formatos (ONNX, TensorRT, etc.) es posible a traves de Ultralytics, pero no se detalla en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con alternativas de la misma familia y tarea, todas afinadas sobre Brackish Underwater con la misma receta de DetectionBench. Los datos de rendimiento son los declarados por el autor.

| Modelo | Parametros | Contexto | mAP@50 (%) | mAP@50-95 (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YOLO26m (este modelo) | 21,9 M | no aplica | 98,74 | 85,93 | AGPL-3.0 | Hugging Face |
| YOLOv8m | no disponible | no aplica | 99,19 | 86,04 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLO11x | no disponible | no aplica | 98,89 | 86,3 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLO26s | no disponible | no aplica | 99,1 | 85,77 | AGPL-3.0 | Hugging Face |

En mAP@50-95, YOLO11x (86,3) y YOLOv8m (86,04) superan ligeramente a YOLO26m (85,93), mientras que en mAP@50 el mejor valor del zoo corresponde a YOLOv8s (99,3). Las diferencias entre los modelos del zoo son pequenas, lo que sugiere que el dataset es relativamente sencillo para esta familia de detectores y que la eleccion entre variantes puede depender mas del coste computacional y de la latencia que de la precision bruta.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta afinado exclusivamente para imagenes subacuaticas y de aguas salobres con seis clases concretas; su rendimiento fuera de ese dominio no esta documentado y probablemente sea pobre.
- Metricas no verificadas: los valores de benchmarks son declarados por el autor (`verified: false`) y no han sido reproducidos de forma independiente.
- Clases con menor rendimiento: jellyfish (mAP@50-95 de 73,13 %), small_fish (78,42 %) y shrimp (79,23 %) muestran un margen de mejora claro frente a crab o starfish, lo que puede limitar aplicaciones que dependan de la localizacion precisa de estas clases.
- Riesgo de falsos positivos y negativos en condiciones de turbidez, baja iluminacion, oclusion o cambios de color cast propios de la imagen subacuatica; no se documentan estudios de robustez frente a estas condiciones.
- Sesgos de dataset: no se dispone de informacion sobre la distribucion geografica, la camara empleada ni la composicion del dataset Brackish, por lo que se desconoce si el modelo generaliza a otras aguas, especies o condiciones de captura.
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el codigo fuente derivado; conviene revisar las obligaciones de la AGPL antes de integrarlo en un producto propietario. La licencia del modelo base Ultralytics/YOLO26 tambien es AGPL-3.0.
- Numero de descargas muy bajo (7) y un unico like en el momento de la consulta: se trata de un modelo reciente y poco validado por la comunidad.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso; cualquier caso de uso que requiera estas capacidades debe combinarse con otro modelo.
- No se documentan en la informacion disponible el numero de imagenes de entrenamiento, la composicion del split ni posibles solapamientos entre train y test, lo que impide evaluar el riesgo de sobreajuste al benchmark.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/brackish-yolo26m
- Dataset Brackish: https://huggingface.co/datasets/dronefreak/Brackish
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Paper referenciado en los tags (arXiv:2606.03748): https://arxiv.org/abs/2606.03748
- Documentacion de Ultralytics: https://docs.ultralytics.com
