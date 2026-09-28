# dronefreak/gc10det-rfdetr-medium

## Resumen

RF-DETR Medium finetuneado sobre GC10-DET es un detector de objetos de código abierto publicado por el usuario dronefreak (Saumya Saksena) en Hugging Face. Se trata de un ajuste fino del modelo base Roboflow/rf-detr-medium sobre el conjunto de datos GC10-DET, un benchmark de defectos superficiales en chapa metálica con diez clases (crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line). El modelo tiene 33,7 millones de parámetros y se distribuye bajo licencia Apache 2.0.

El problema que resuelve es la inspección visual automatizada de superficies metálicas en entornos industriales, una tarea en la que los detectores genéricos entrenados sobre COCO rinden de forma insuficiente por el bajo contraste y el tamaño reducido de los defectos. Este checkpoint forma parte de DetectionBench, un framework del mismo autor que entrena y evalúa distintos detectores modernos con una receta idéntica para permitir comparaciones reproducibles. En el split de test de GC10-DET el modelo alcanza 75,93 % de mAP@50 y 41,93 % de mAP@50-95, valores declarados por el autor y no verificados por un tercero.

Su relevancia actual es doble: por un lado ofrece un punto de partida listo para usar o para afinar en control de calidad industrial; por otro, se publica junto a una tabla comparativa en la que compite con la familia YOLO26, YOLO11 y YOLOv8 bajo el mismo protocolo de evaluación. El repositorio tiene 0,1 GB de tamaño, no registra descargas ni likes en el momento de la consulta y no incluye datos de latencia ni FLOPs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (detector transformer tipo DETR, base Roboflow/rf-detr-medium); detalles internos no disponibles en la model card |
| Parametros totales | 33,7 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos; entrada de imagen, no texto) |
| Tipos de cuantizacion | no disponible; la model card no documenta versiones cuantizadas ni pesos pre-cuantizados |
| Idiomas soportados | no disponible (modelo de vision; el dataset declara unicamente ingles en sus metadatos y las clases estan en ingles) |
| Licencia | Apache 2.0 (modelo); el dataset GC10-DET se declara bajo CC-BY-4.0 |
| Formato de pesos | checkpoint de PyTorch cargado mediante la libreria `rfdetr`; la model card no documenta formatos alternativos (ONNX, TensorRT, GGUF) |
| Tarea | object-detection |
| Dataset de entrenamiento | dronefreak/GC10-DET (10 clases) |
| Tamano del repositorio | 0,1 GB |
| FLOPs | no publicados ("N/A (not published upstream)" segun la model card) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de RF-DETR Medium, el checkpoint de tamano medio de la familia RF-DETR de Roboflow, una linea de detectores basados en la arquitectura transformer DETR orientada a inferencia en tiempo real. La model card no detalla la composicion interna de la red (backbone, numero de capas del decodificador, resolucion de entrada ni estrategia de asignacion de etiquetas), por lo que esos datos deben consultarse en la documentacion de RF-DETR. Lo que si se especifica es que el modelo resultante tiene 33,7 M de parametros y que el ajuste se ha realizado sobre el conjunto GC10-DET.

El entrenamiento y la evaluacion se han llevado a cabo dentro de DetectionBench, un framework que aplica recetas de entrenamiento identicas y el mismo pipeline de metricas a todos los detectores comparados. Las metricas que se reportan se calculan sobre el split de test de GC10-DET con la herramienta `detectionbench-evaluate`, que se apoya en las metricas de deteccion de la libreria Supervision. No se indica en la informacion disponible el numero de imagenes de entrenamiento, el numero de epocas, la resolucion de entrada, el uso de aumento de datos ni si hubo una fase de ajuste adicional mas alla del finetuning supervisado.

## Capacidades

- Deteccion de objetos con cajas delimitadoras en imagenes de superficies metalicas, limitada a las diez clases de defecto del dataset GC10-DET: crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line.
- Localizacion espacial de cada defecto, apta para calcular posicion y area sobre la pieza inspeccionada.
- Inferencia sobre imagen individual propia de la familia RF-DETR, cuyo diseno apunta a deteccion en tiempo real (no se publican FPS ni latencia concretos).
- Integracion programatica mediante la libreria `rfdetr` y `huggingface_hub`, con carga de pesos remotos desde el repositorio.
- Reutilizacion como modelo base para finetuning adicional en nuevas clases de defectos, dado que se distribuye bajo Apache 2.0.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades multimodales de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes, planificacion multi-paso ni modo de razonamiento extendido.
- No tiene capacidades multilingues al no procesar texto.

## Casos de uso

- Inspeccion de calidad en linea de produccion de chapa metalica: el modelo analiza cada imagen capturada por una camara industrial y devuelve las cajas de los defectos detectados, lo que permite descartar piezas con creases, rolled_pit o welding_line defectuosos antes de que avancen en la cadena.
- Clasificacion y enrutado automatico de piezas: a partir de la clase y el area de los defectos detectados se puede decidir si una pieza va a retrabajo, a chatarra o a envio, usando los umbrales de confianza que la planta configure.
- Pre-etiquetado de nuevas imagenes para anotacion humana: el detector puede generar cajas candidatas sobre lotes de imagenes no etiquetadas y esas predicciones revisarse con Supervision, lo que reduce el coste de ampliar el dataset interno.
- Punto de partida para finetuning en una fabrica concreta: al ser un modelo Apache 2.0 de 33,7 M de parametros, se puede reentrenar con las imagenes y clases propias de cada planta, corrigiendo el desajuste de dominio entre GC10-DET y la linea de produccion real.
- Baseline reproducible en comparativas internas de detectores: DetectionBench proporciona la receta y el pipeline de evaluacion, de modo que este checkpoint sirve como referencia contra la que medir nuevos modelos con el mismo protocolo.
- Monitorizacion de mantenimiento predictivo: la frecuencia y el tipo de defecto detectado a lo largo del tiempo pueden usarse como indicador indirecto del desgaste de rodillos o de utillaje, correlacionando picos de inclusion o silk_spot con eventos de mantenimiento.
- Analisis retrospectivo de lotes: procesado por lotes de archivos de imagen almacenados para reconstruir la tasa de defectos de un turno o de un pedido y generar informes de calidad.
- Investigacion en deteccion de defectos industriales: por su licencia permisiva y su publicacion junto a la tabla comparativa completa, es util para reproducir experimentos y estudiar el comportamiento de los detectores tipo DETR frente a la familia YOLO en dominios de bajo contraste.

## Benchmarks y rendimiento

Metricas declaradas por el autor sobre el split de test de GC10-DET, obtenidas con el pipeline `detectionbench-evaluate`. El campo `verified` de la model card es `false` en todas ellas, es decir, no han sido verificadas por un tercero independiente.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 75,93 |
| mAP@50-95 | 41,93 |
| Precision | 78,25 |
| Recall | 67,76 |
| F1 | 72,63 |
| Parametros | 33,7 M |
| FLOPs | no publicados |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crease | 26,32 | 15,56 |
| crescent_gap | 96,50 | 60,33 |
| inclusion | 45,13 | 9,98 |
| oil_spot | 65,61 | 25,00 |
| punching_hole | 87,56 | 47,93 |
| rolled_pit | 100,00 | 70,00 |
| silk_spot | 63,55 | 29,36 |
| waist_folding | 91,21 | 50,75 |
| water_spot | 86,43 | 59,12 |
| welding_line | 96,96 | 51,31 |

## Requisitos de hardware

- La model card no publica datos de latencia, FPS, VRAM ni FLOPs; el propio autor indica que los FLOPs no estan publicados en el proyecto upstream. DetectionBench incorpora un modulo de perfilado de hardware (`detectionbench-benchmark`) que mide latencia, FPS, VRAM, parametros y FLOPs, pero los resultados no se incluyen en esta ficha.
- Estimacion a partir del numero de parametros: los pesos ocupan aproximadamente 135 MB en FP32 y 67 MB en FP16. A eso hay que sumar activaciones y buffers de inferencia, cuyo tamano depende de la resolucion de entrada y del tamano de lote, que no se documentan. Es una estimacion propia, no un dato del autor.
- Con ese orden de magnitud, el modelo cabe holgadamente en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM deberia poder ejecutarlo en FP16 a lote 1, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4070 y RTX 4090. La cifra exacta depende de la resolucion de entrada.
- Para entrenamiento o finetuning se recomienda una GPU con al menos 12-16 GB de VRAM (RTX 4080, RTX 4090, A4000) y, para lotes grandes, GPU de centro de datos como A100 o H100.
- Opciones de despliegue documentadas: la model card solo describe la carga mediante la libreria `rfdetr` junto con `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos. Para exportacion a ONNX o TensorRT hay que consultar la documentacion oficial de RF-DETR, no incluida en esta ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card incluye el zoo completo de modelos entrenados y evaluados por DetectionBench sobre GC10-DET con la misma receta, lo que permite una comparacion directa. Todos los valores son mAP@50 y mAP@50-95 sobre el split de test y estan declarados por el autor sin verificacion independiente.

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small | 76,07 | 42,51 | 87,86 | 65,03 |
| RF-DETR Medium (este modelo) | 75,93 | 41,93 | 78,25 | 67,76 |
| YOLO26s | 75,77 | 38,15 | 77,16 | 74,07 |
| YOLO26n | 74,25 | 38,31 | 80,50 | 67,99 |
| YOLO26m | 73,97 | 36,94 | 75,70 | 68,19 |
| YOLOv8n | 73,25 | 38,74 | 67,99 | 70,87 |
| YOLO11s | 72,54 | 35,07 | 72,39 | 66,80 |
| YOLOv8s | 72,54 | 37,79 | 78,54 | 65,23 |
| YOLOv8m | 71,88 | 38,80 | 69,77 | 70,84 |
| YOLO11n | 70,44 | 40,09 | 78,93 | 62,64 |
| RF-DETR Nano | 70,17 | 38,06 | 77,08 | 71,04 |

Observaciones sobre la comparativa: RF-DETR Small supera ligeramente a este modelo en mAP@50 (76,07 frente a 75,93) y en mAP@50-95 (42,51 frente a 41,93), aunque con menor recall (65,03 frente a 67,76) y mayor precision (87,86 frente a 78,25). Frente a YOLO26s, el modelo de este repositorio gana en las dos metricas de mAP pero pierde en recall (67,76 frente a 74,07). No se dispone de datos de parametros, contexto o licencia de los modelos YOLO comparados dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Metricas no verificadas: todas las cifras de la model card tienen el campo `verified` a `false`. Deben tomarse como resultados declarados por el autor, no replicados de forma independiente.
- Rendimiento muy desigual por clase: crease obtiene solo 26,32 de mAP@50 y 15,56 de mAP@50-95, e inclusion cae a 9,98 en mAP@50-95 pese a marcar 45,13 en mAP@50. Son clases en las que el modelo no es fiable para uso en produccion sin umbrales especificos o datos adicionales.
- Preprints de arXiv: el repositorio no acompaña a una publicacion revisada por pares, y el proyecto tiene un unico autor, 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion externa disponible.
- Riesgo de desajuste de dominio: el modelo esta entrenado exclusivamente sobre GC10-DET, un dataset de 1K a 10K imagenes de superficies metalicas. Aplicado a otros materiales, iluminaciones o tipos de camara, la precision puede degradarse de forma notable sin un finetuning previo.
- Falsos positivos y falsos negativos: la precision del 78,25 % y el recall del 67,76 % implican que aproximadamente una de cada cinco detecciones puede ser incorrecta y que cerca de un tercio de los defectos reales pueden no detectarse. En control de calidad esto obliga a definir una estrategia de umbral y de revision humana.
- Sin datos de calibracion de confianza ni de robustez frente a oclusiones, reflejos o cambios de iluminacion, que son factores criticos en inspeccion de superficies metalicas.
- Licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial, modificacion y redistribucion. El dataset GC10-DET se declara bajo CC-BY-4.0, por lo que cualquier redistribucion del dataset o de derivados debe mantener la atribucion correspondiente. Conviene revisar los terminos del dataset original antes de un uso comercial.
- Sin informacion sobre sesgos: no se documenta ningun analisis de sesgo ni de equidad, algo poco habitual en deteccion de defectos pero relevante si el modelo se aplica a la clasificacion de piezas.
- Idiomas: el modelo es puramente visual y no procesa texto, por lo que la ausencia de metadatos de idioma no implica soporte multilingue.
- Falta de datos operativos: no hay mediciones publicadas de latencia, FPS ni VRAM, imprescindibles para dimensionar una linea de produccion en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/gc10det-rfdetr-medium
- Dataset GC10-DET: https://huggingface.co/datasets/dronefreak/GC10-DET
- Dataset card (README): https://huggingface.co/datasets/dronefreak/GC10-DET/blob/main/README.md
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Codigo de carga del dataset en DetectionBench: https://github.com/dronefreak/DetectionBench/blob/main/src/detectionbench/datasets/gc10det.py
- Perfil del autor en Hugging Face: https://huggingface.co/dronefreak
- Documentacion de RF-DETR Medium: https://rfdetr.roboflow.com/reference/medium/
- Modelo base: https://huggingface.co/Roboflow/rf-detr-medium
- Supervision (metricas de deteccion): https://github.com/roboflow/supervision
- Referencias arXiv incluidas en los tags del repositorio: https://arxiv.org/abs/2511.09554, https://arxiv.org/abs/2304.07193, https://arxiv.org/abs/2410.17725, https://arxiv.org/abs/2606.03748
