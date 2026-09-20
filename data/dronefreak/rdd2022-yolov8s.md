# dronefreak/rdd2022-yolov8s

## Resumen

El modelo `dronefreak/rdd2022-yolov8s` es un detector de objetos de una etapa obtenido por ajuste fino (*fine-tuning*) del checkpoint YOLOv8s de Ultralytics sobre el conjunto de datos RDD2022 de danos en carretera. Lo publica el usuario dronefreak como parte de DetectionBench, un marco de trabajo orientado a comparar detectores modernos con recetas de entrenamiento y metricas de evaluacion identicas. Su tarea es la deteccion de cuatro clases de patologia del pavimento: grieta longitudinal, grieta transversal, grieta de piel de cocodrilo y bache.

El modelo es pequeno: 11,2 millones de parametros y 28,6 GFLOPs a 640 px, lo que lo situa en la gama de inferencia en tiempo real sobre hardware modesto, incluidos dispositivos de borde. La relevancia actual no viene de una innovacion arquitectonica propia, sino de la reproducibilidad: el autor publica la metrica junto al protocolo de evaluacion (`detectionbench-evaluate`) y una tabla comparativa con alternativas como RF-DETR y otros miembros de la familia YOLO evaluadas sobre el mismo split de test.

No se trata de un modelo de lenguaje: no tiene ventana de contexto, no soporta generacion de texto, tool calling ni capacidades multilingues. Es un checkpoint de vision por computador cuyo valor practico esta en tareas de inspeccion de infraestructura, mantenimiento vial y conduccion asistida. Los pesos se distribuyen en formato PyTorch (`.pt`) bajo licencia AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de una etapa de la familia YOLOv8 (Ultralytics), basado en red troncal convolucional con modulos C2f y cabeza de deteccion desacoplada sin anclas |
| Parametros totales | 11,2 M (dato declarado por el autor en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el modelo procesa imagenes, y los FLOPs declarados (28,6 B) corresponden a una entrada de 640 px |
| Tipos de cuantizacion | no disponible; el unico artefacto documentado es el checkpoint en PyTorch (`best.pt`) |
| Idiomas soportados | no aplica (modelo de vision por computador) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`) |
| FLOPs | 28,6 B a 640 px |
| Clases detectadas | `longitudinal_crack`, `transverse_crack`, `alligator_crack`, `pothole` |
| Framework de inferencia | Ultralytics (`ultralytics` + `huggingface_hub`) |
| Dataset de entrenamiento | RDD2022 Road Damage (`dronefreak/RDD2022`) |
| Modelo base | Ultralytics/YOLOv8 (YOLOv8s), ajuste fino |
| Tamano del repositorio (metadatos HF) | 0,0 GB |
| Fecha de creacion en HuggingFace | 2026-09-20 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

YOLOv8 es un detector de objetos de una etapa con red troncal convolucional tipo CSP, bloques C2f en el cuello de la red y una cabeza de deteccion desacoplada sin anclas que predice directamente cajas y clases. La variante `s` (small) es la segunda mas pequena de la familia, con 11,2 M de parametros y 28,6 GFLOPs a 640 px, lo que la situa en el equilibrio habitual entre precision y coste computacional para inferencia en tiempo real. Este checkpoint concreto no introduce modificaciones arquitectonicas: es un ajuste fino del modelo base sobre un dominio especifico.

El entrenamiento se ha realizado sobre RDD2022 Road Damage, un conjunto de imagenes de carreteras con anotaciones de cuatro tipos de dano, y forma parte del proyecto DetectionBench, cuyo objetivo es aplicar recetas de entrenamiento identicas a distintos detectores para que las comparaciones entre ellos sean justas. La model card incluye una tabla de configuracion de entrenamiento que aparece truncada en la informacion disponible, por lo que no se pueden confirmar el numero de epocas, el tamano de lote, el optimizador, la resolucion de entrenamiento ni la composicion exacta del split. Tampoco se documentan fases de RLHF o DPO, algo que no aplica a un detector. No se declaran innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal ni tecnicas similares).

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica las cuatro clases de dano vial definidas en el dataset (`longitudinal_crack`, `transverse_crack`, `alligator_crack`, `pothole`).
- Inferencia sobre imagenes individuales o por lotes mediante la API de Ultralytics (`model.predict(source=...)`), con umbral de confianza configurable.
- Generacion de artefactos de evaluacion y diagnostico: la model card publica curva precision-recall, curva F1, matriz de confusion y matriz de confusion normalizada, lo que indica que el pipeline soporta analisis de errores por clase.
- Despliegue en el ecosistema Ultralytics: el framework del que depende permite exportar checkpoints a otros formatos de inferencia, aunque la model card no documenta exportaciones especificas para este checkpoint.
- Ajuste fino posterior: al ser un checkpoint Ultralytics estandar, sirve como punto de partida para transferencia a otros dominios de inspeccion visual.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de generacion de texto, de audio ni de vision-lenguaje. Es exclusivamente un detector de objetos.

## Casos de uso

- Inspeccion automatizada de pavimento con vehiculos instrumentados: una camara frontal o lateral captura imagenes de la calzada y el modelo marca en cada fotograma la posicion de grietas y baches; su coste de 28,6 GFLOPs a 640 px permite ejecutarlo en el propio vehiculo o en un equipo de borde.
- Procesamiento de imagenes capturadas por dron: al estar entrenado sobre RDD2022, que incluye imagenes aereas y de vehiculo, es aplicable a vuelos de reconocimiento sobre tramos de carretera, con la salvedad de que conviene validar el dominio concreto antes de producción.
- Priorizacion de mantenimiento municipal: se procesan lotes de imagenes georreferenciadas y las detecciones se agregan por tramo para ordenar las reparaciones; la clase `pothole` es la de mejor rendimiento individual (mAP@50 de 73,77), lo que la hace la mas fiable para este fin.
- Inventario de activos para sistemas GIS: las cajas detectadas se convierten en registros con coordenadas y clase, alimentando bases de datos de estado de la red viaria.
- Auditoria de calidad de obra: comparar el estado del firme antes y despues de una intervencion usando detecciones sobre imagenes de fechas distintas.
- Monitorizacion continua de flotas: integrar el detector en el flujo de video de vehiculos comerciales para acumular un mapa temporal de deterioro sin necesidad de campanas de inspeccion dedicadas.
- Preprocesado para conduccion asistida: la deteccion de baches y grietas relevantes puede alimentar sistemas de alerta o de ajuste de suspension, siempre que se valide la latencia en el hardware objetivo.
- Etiquetado asistido: usar el modelo como preanotador para reducir el coste de crear nuevos datasets de patologias viales, seguido de revision humana.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (campo `verified: false` en el model-index; no han sido verificados de forma independiente). Evaluados sobre el split de **test** de RDD2022 Road Damage con el pipeline `detectionbench-evaluate`.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 61,45 |
| mAP@50-95 | 33,53 |
| Precision | 64,55 |
| Recall | 57,18 |
| F1 | 60,64 |

Rendimiento por clase (test split):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| longitudinal_crack | 54,95 | 29,83 |
| transverse_crack | 54,18 | 25,89 |
| alligator_crack | 62,91 | 32,82 |
| pothole | 73,77 | 45,60 |

Comparativa publicada por el propio autor dentro del zoo de modelos de DetectionBench sobre el mismo dataset:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 65,08 | 36,02 | 71,18 | 55,98 |
| RF-DETR Small | 64,71 | 35,73 | 65,69 | 59,41 |
| YOLOv8m | 62,03 | 34,08 | 65,61 | 57,42 |
| **YOLOv8s (este modelo)** | **61,45** | **33,53** | **64,55** | **57,18** |
| YOLOv26s | 61,27 | 33,30 | 64,42 | 57,13 |
| YOLOv26m | 61,24 | 33,38 | 63,70 | 57,27 |
| RF-DETR Nano | 60,85 | 33,22 | 65,49 | 54,30 |
| YOLOv8n | 58,80 | 32,05 | 62,03 | 56,08 |

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia aritmetica, 11,2 M de parametros ocupan aproximadamente 45 MB en fp32 y 22 MB en fp16, por lo que el peso de los pesos no es el factor limitante; el consumo real dependera de la resolucion de entrada, el tamano de lote y el backend de inferencia.
- GPU recomendadas: no especificadas. Por escala de parametros, el modelo entra sin problema en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en GPU integradas y aceleradores de borde tipo NVIDIA Jetson.
- Inferencia en CPU: factible en terminos de memoria, aunque la latencia no esta documentada.
- Opciones de despliegue: la model card solo documenta `ultralytics` con `huggingface_hub` para cargar `best.pt`. No se documentan instrucciones para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un detector de objetos; el ecosistema Ultralytics permite exportar a otros formatos de runtime, pero no se confirma para este checkpoint concreto.
- Latencia y throughput: no disponibles. No se han publicado medidas de FPS ni de tiempo de inferencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 (RDD2022) | Licencia | Disponibilidad |
|---|---|---|---|---|
| YOLOv8s (este modelo) | 11,2 M | 61,45 | AGPL-3.0 | Pesos en HuggingFace (`dronefreak/rdd2022-yolov8s`) |
| YOLOv8n (mismo zoo) | no disponible | 58,80 | no disponible | Pesos no enlazados en la informacion proporcionada |
| YOLOv8m (mismo zoo) | no disponible | 62,03 | no disponible | Pesos no enlazados en la informacion proporcionada |
| RF-DETR Small (mismo zoo) | no disponible | 64,71 | no disponible | Pesos no enlazados en la informacion proporcionada |
| RF-DETR Medium (mismo zoo) | no disponible | 65,08 | no disponible | Pesos no enlazados en la informacion proporcionada |

Nota: los valores de la comparativa proceden exclusivamente de la tabla del zoo de modelos publicada por el autor en esta misma model card. No se dispone de parametros, licencias ni enlaces de descarga de los modelos alternativos en la informacion proporcionada, por lo que esas celdas figuran como no disponibles. La comparacion es, por tanto, de rendimiento declarado bajo la misma receta declarada, no de artefactos verificados de forma independiente.

## Limitaciones y advertencias

- Metricas no verificadas: los cuatro valores de benchmark aparecen con `verified: false` en el model-index. Proceden del propio autor y no de una evaluacion de terceros.
- Dominio restringido: el modelo solo detecta cuatro clases de dano vial. Cualquier objeto fuera de esas clases se ignorara o se etiquetara erroneamente como una de ellas.
- Desequilibrio por clase: la grieta transversal es la clase con peor rendimiento (mAP@50-95 de 25,89 frente a 45,60 del bache), lo que implica falsos negativos mas frecuentes en ese tipo de patologia.
- Riesgo de falsos positivos por confusion entre clases: la model card publica matrices de confusion, lo que sugiere solapamiento visual entre tipos de grieta; conviene revisar la matriz normalizada antes de desplegar.
- Generalizacion geografica desconocida: no se documentan en la informacion disponible los paises o condiciones de captura representados en el split de test, por lo que el rendimiento fuera del dominio de RDD2022 no esta caracterizado.
- Iluminacion, climatologia y calidad de imagen: no se documentan evaluaciones de robustez ante lluvia, noche, desenfoque de movimiento o resoluciones distintas de la usada en el calculo de FLOPs (640 px).
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Si el modelo se integra en un servicio ofrecido a traves de red, la AGPL puede exigir la publicacion del codigo fuente de la obra derivada. Para productos propietarios conviene revisar el regimen de licencia comercial que Ultralytics ofrece al margen de la AGPL.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes, y un tamano de repositorio declarado de 0,0 GB. Conviene verificar la integridad de los artefactos antes de depender de ellos en produccion.
- Receta de entrenamiento incompleta: la tabla de configuracion de la model card aparece truncada, por lo que no es posible reproducir el ajuste fino con los datos disponibles.
- Sin soporte de texto ni de razonamiento: no es utilizable para ninguna tarea de procesamiento de lenguaje natural, agentes o dialogo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/rdd2022-yolov8s
- Dataset RDD2022 Road Damage: https://huggingface.co/datasets/dronefreak/RDD2022
- Repositorio DetectionBench (fuente de la evaluacion): https://github.com/dronefreak/DetectionBench
- Modelo base Ultralytics/YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
- Identificadores arXiv citados en los metadatos del repositorio (no se especifica su titulo en la informacion proporcionada): arXiv:2209.08538, arXiv:2304.07193, arXiv:2511.09554, arXiv:2606.03748
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Las únicas URLs devueltas pertenecen al portal de comercios de Coupang Eats y no guardan relacion con este modelo.
