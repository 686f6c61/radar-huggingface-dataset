# dronefreak/gc10det-yolo26s

## Resumen

`dronefreak/gc10det-yolo26s` es un detector de objetos de la familia YOLO26 (variante "s", small) afinado por el usuario dronefreak sobre el conjunto de datos GC10-DET, un benchmark publico de defectos superficiales en chapa metalica con 10 clases de defecto. El modelo parte de los pesos de `Ultralytics/YOLO26` y se entrena y evalua dentro de DetectionBench, un framework cuyo objetivo es comparar detectores modernos con recetas de entrenamiento y metricas de evaluacion identicas, de modo que los resultados sean reproducibles y comparables entre arquitecturas (YOLOv8, YOLO11, YOLO26 y RF-DETR).

Se trata de un modelo de vision por computador, no de un modelo de lenguaje: no procesa texto, no tiene ventana de contexto en tokens ni soporta tool calling. Su relevancia actual es practica: ofrece un punto de partida afinado y con metricas publicadas para inspeccion industrial automatizada de superficies metalicas, y lo hace con un coste computacional bajo (10,0 M de parametros y 22,8 GFLOPs a 640 px), lo que permite desplegarlo en GPUs de gama media o incluso en hardware de borde.

Las cifras declaradas por el autor en el split de test de GC10-DET son 75,77 % de mAP@50, 38,15 % de mAP@50-95, 77,16 % de precision, 74,07 % de recall y 75,59 de F1. Estas metricas estan marcadas como no verificadas en el model-index de HuggingFace y proceden del pipeline `detectionbench-evaluate` del propio autor. El repositorio es muy reciente (creado el 27 de septiembre de 2026) y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de una etapa (one-stage) basado en YOLO26s de Ultralytics; no se detallan los bloques internos en la informacion disponible |
| Parametros totales | 10,0 M |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision; la model card reporta FLOPs a una resolucion de entrada de 640 px) |
| Tipos de cuantizacion | no disponibles; la model card no documenta variantes cuantizadas |
| Idiomas soportados | no aplicable (modelo de deteccion de objetos; no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, archivo `best.pt`); no se documentan otros formatos en la informacion disponible |
| Tarea | Deteccion de objetos (object-detection) |
| Dataset de entrenamiento | GC10-DET (`dronefreak/GC10-DET`) |
| Modelo base | Ultralytics/YOLO26 (fine-tune) |
| Libreria | Ultralytics |
| FLOPs | 22,8 B a 640 px |
| Clases | 10: crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot, welding_line |

## Arquitectura y entrenamiento

La informacion proporcionada no describe en detalle la arquitectura interna de YOLO26s: se sabe que es un detector de objetos de una etapa de la familia Ultralytics YOLO26, con 10,0 M de parametros y 22,8 GFLOPs por inferencia a 640 px, y que este repositorio es un fine-tune del checkpoint `Ultralytics/YOLO26`. No se especifican en la model card el numero de capas, el mecanismo de asignacion de etiquetas, el tipo de cabeza de deteccion ni si incorpora componentes de atencion o modulos hibridos.

Respecto al entrenamiento, la model card indica que el ajuste fino se realizo sobre GC10-DET siguiendo la receta estandar de DetectionBench, un framework disenado para benchmarkear detectores con recetas de entrenamiento y metricas identicas entre datasets reales. No se documentan en la informacion disponible el numero de tokens o imagenes de entrenamiento, el numero de epocas, el tamano de lote, la estrategia de augmentacion, ni si hubo fases de refinamiento posteriores. La evaluacion se realizo sobre el split de test de GC10-DET con el pipeline `detectionbench-evaluate`.

## Capacidades

- Deteccion de objetos con cajas delimitadoras sobre imagenes de superficies metalicas, con 10 clases de defecto: crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line.
- Localizacion y clasificacion simultanea de multiples defectos por imagen, en un unico paso hacia delante (one-stage).
- Inferencia a 640 px, coherente con los 22,8 GFLOPs declarados.
- Integracion con el ecosistema Ultralytics: carga mediante `ultralytics.YOLO` y ejecucion con `model.predict(...)`.
- Carga directa desde HuggingFace mediante `huggingface_hub.hf_hub_download`.
- Soporte de tool calling / function calling: no aplicable (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no aplicable.
- Capacidades especiales (modo pensamiento, vision-lenguaje, audio, generacion de texto): ninguna; el modelo es exclusivamente un detector visual.

## Casos de uso

- Inspeccion en linea de produccion de chapa metalica: el modelo puede analizar cada imagen capturada por camaras industriales en la salida del tren de laminacion y marcar en tiempo real la presencia y ubicacion de defectos como `rolled_pit` o `welding_line`, clases para las que declara 49,75 % y 51,01 % de mAP@50-95 respectivamente.
- Control de calidad en fabricacion de componentes de acero: clasificacion automatica de piezas como conformes o no conformes a partir del recuento y tipo de defectos detectados, con umbrales de confianza ajustables segun la tolerancia de la planta.
- Triaje y priorizacion de inspeccion manual: uso del detector como primer filtro para que los operarios revisen unicamente las imagenes con detecciones relevantes, reduciendo el volumen de revision visual.
- Deteccion de defectos de tipo `punching_hole`, `waist_folding` o `crescent_gap`, para los que el modelo declara mAP@50 de 90,24 %, 98,59 % y 97,88 % respectivamente, lo que lo hace util en lineas donde estos defectos son criticos.
- Pre-etiquetado y auto-etiquetado para anotacion de nuevos datasets: el modelo puede generar cajas candidatas sobre imagenes no etiquetadas de una planta concreta, que despues se corrigen manualmente, acelerando la creacion de conjuntos propios.
- Auditoria de material entrante de proveedores: analisis de lotes de chapa recibidos para documentar objetivamente la tasa de defectos por proveedor y respaldar decisiones de compra.
- Despliegue en inspeccion de borde (edge): con 10,0 M de parametros y 22,8 GFLOPs a 640 px, es candidato a ejecutarse en dispositivos con GPU integrada o aceleradores de inferencia junto a la camara, evitando enviar video a la nube.
- Baseline reproducible en investigacion: util como referencia en trabajos sobre deteccion de defectos superficiales, dado que sus resultados se obtuvieron con el pipeline de DetectionBench y pueden compararse con las otras variantes publicadas en el mismo repositorio.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de GC10-DET (marcados como no verificados en el model-index de HuggingFace):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 75,77 |
| mAP@50-95 | 38,15 |
| Precision | 77,16 |
| Recall | 74,07 |
| F1 | 75,59 |

Rendimiento por clase declarado por el autor (mAP@50 / mAP@50-95, en %):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crease | 41,14 | 14,24 |
| crescent_gap | 97,88 | 58,77 |
| inclusion | 41,84 | 11,40 |
| oil_spot | 47,35 | 18,75 |
| punching_hole | 90,24 | 48,10 |
| rolled_pit | 99,50 | 49,75 |
| silk_spot | 54,86 | 23,05 |
| waist_folding | 98,59 | 56,29 |
| water_spot | 89,58 | 50,16 |
| welding_line | 96,75 | 51,01 |

No se han publicado en la informacion disponible datos de latencia, throughput ni resultados en otros datasets distintos de GC10-DET.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra publicada. Como referencia de orden de magnitud, los pesos en precision completa ocupan del orden de 40 MB (10,0 M de parametros) y en FP16 unos 20 MB; el consumo dominante es el de las activaciones, habitualmente en el rango de 1-2 GB por lote de una imagen a 640 px en FP16. Estas cifras son estimaciones derivadas del tamano del modelo y de los 22,8 GFLOPs declarados, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, es apto para GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090, y para GPUs de centro de datos de gama baja o media (T4, L4, A10, A100, H100) con margen de sobra.
- Cabe en GPU de consumo: si, previsiblemente en practicamente cualquier GPU de consumo con al menos 4 GB de VRAM para inferencia a 640 px, en funcion del backend y del tamano de lote.
- Opciones de despliegue: la model card documenta el uso con la libreria `ultralytics` y la descarga de pesos con `huggingface_hub`. No se documentan en la informacion disponible otros backends. Las herramientas de servido de modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este modelo.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

Comparativa con los modelos evaluados en el "GC10-DET Model Zoo" de DetectionBench segun los datos de la model card. Solo se dispone del numero de parametros de YOLO26s (10,0 M); para el resto no esta disponible. Todos los valores son mAP en el split de test de GC10-DET, declarados por el autor y no verificados.

| Modelo | Parametros | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) |
|---|---|---|---|---|---|
| RF-DETR Small | no disponible | 76,07 | 42,51 | 87,86 | 65,03 |
| RF-DETR Medium | no disponible | 75,93 | 41,93 | 78,25 | 67,76 |
| YOLO26s (este modelo) | 10,0 M | 75,77 | 38,15 | 77,16 | 74,07 |
| YOLO26n | no disponible | 74,25 | 38,31 | 80,50 | 67,99 |
| YOLO26m | no disponible | 73,97 | 36,94 | 75,70 | 68,19 |
| YOLOv8n | no disponible | 73,25 | 38,74 | 67,99 | 70,87 |
| YOLO11s | no disponible | 72,54 | 35,07 | 72,39 | 66,80 |
| YOLOv8s | no disponible | 72,54 | 37,79 | 78,54 | 65,23 |
| YOLOv8m | no disponible | 71,88 | 38,80 | 69,77 | 70,84 |
| YOLO11n | no disponible | 70,44 | 40,09 | 78,93 | 62,64 |
| RF-DETR Nano | no disponible | 70,17 | 38,06 | 77,08 | 71,04 |

Lectura de la tabla: YOLO26s obtiene el tercer mejor mAP@50 del conjunto, por detras de RF-DETR Small y Medium, pero con mayor recall (74,07 %) que ambos, a costa de menor precision. En mAP@50-95 queda por debajo de RF-DETR Small, RF-DETR Medium, YOLOv8m, YOLOv8s, YOLOv8n, YOLO11n y YOLO26n, lo que sugiere que su localizacion fina de cajas es menos precisa que la de esos modelos. La licencia de este modelo es AGPL-3.0; las licencias del resto de modelos de la tabla no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta afinado exclusivamente sobre GC10-DET, un dataset de defectos en superficie metalica con 10 clases concretas. Es previsible un rendimiento bajo fuera de ese dominio (otros materiales, otras condiciones de iluminacion, otras clases de defecto).
- Clases con rendimiento debil: `inclusion` (11,40 % mAP@50-95), `crease` (14,24 %), `oil_spot` (18,75 %) y `silk_spot` (23,05 %) muestran una localizacion pobre, muy por debajo de las clases con mAP@50 superior al 90 %. No conviene confiar en estas cuatro clases sin validacion propia.
- Metricas no verificadas: los valores del model-index estan marcados como `verified: false` y proceden del pipeline del propio autor, no de una evaluacion independiente. Conviene reproducirlos antes de tomar decisiones de produccion.
- Riesgo de falsos negativos y falsos positivos: con un recall del 74,07 % y una precision del 77,16 % en test, en un entorno industrial real quedan defectos sin detectar y detecciones espurias; el umbral de confianza debe calibrarse con datos de la planta.
- Licencia AGPL-3.0: es una licencia copyleft fuerte con clausula de red. El uso comercial es posible, pero integrar el modelo en un servicio ofrecido por red puede obligar a liberar el codigo fuente de la aplicacion bajo los mismos terminos. Conviene revision legal antes de un despliegue comercial cerrado.
- Tamano de repositorio declarado de 0,0 GB: es un dato llamativo para un repositorio que contiene pesos (`best.pt`). Conviene verificar que los archivos de pesos estan efectivamente disponibles y no solo referenciados.
- Modelo nuevo y sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento ni comunidad que lo respalde.
- Documentacion incompleta: no se detallan hiperparametros de entrenamiento, composicion exacta del split, ni el procedimiento de seleccion del checkpoint, lo que dificulta reproducir el resultado.
- Sin soporte de lenguaje: no puede generar descripciones textuales de los defectos, ni interactuar mediante prompts, ni integrarse en agentes conversacionales.
- Idiomas soportados: no aplicable, al no tratar texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/gc10det-yolo26s
- Dataset GC10-DET en HuggingFace: https://huggingface.co/datasets/dronefreak/GC10-DET
- Repositorio DetectionBench (framework de evaluacion y model zoo): https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Referencias arXiv citadas en las etiquetas del modelo (titulos no disponibles en la informacion proporcionada):
  - https://arxiv.org/abs/2606.03748
  - https://arxiv.org/abs/2511.09554
  - https://arxiv.org/abs/2304.07193
  - https://arxiv.org/abs/2410.17725

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores son los unicos pertinentes encontrados en la informacion proporcionada.
