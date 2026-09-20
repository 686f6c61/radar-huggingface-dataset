# dronefreak/rdd2022-yolov8n

## Resumen

El modelo `dronefreak/rdd2022-yolov8n` es un detector de objetos YOLOv8n afinado sobre el conjunto de datos RDD2022 Road Damage, desarrollado por el usuario de HuggingFace dronefreak en el marco del proyecto DetectionBench. Se trata de un modelo de visión por computador de una sola etapa orientado a la detección de cuatro tipos de deterioro del firme: grieta longitudinal, grieta transversal, grieta de piel de cocodrilo y bache. Con 3,2 millones de parámetros y 8,7 GFLOPs a 640 píxeles, es la variante más ligera de la familia YOLOv8 aplicada a este dominio.

Su relevancia radica en dos factores. Por un lado, cubre una tarea de infraestructura civil con impacto directo en mantenimiento vial y seguridad en carretera, un ámbito donde los modelos genéricos de detección rinden mal por la naturaleza textural y de bajo contraste de las patologías del pavimento. Por otro, forma parte de DetectionBench, un framework que entrena y evalúa distintos detectores con recetas idénticas y métricas homogéneas, lo que permite comparaciones reproducibles entre arquitecturas. En este sentido, el modelo publica métricas declaradas por el autor (`verified: false`) sobre el split de test de RDD2022: mAP@50 de 58,8, mAP@50-95 de 32,05, precisión de 62,03 y recall de 56,08.

El modelo no es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso. Es un componente puramente perceptivo, pensado para integrarse en pipelines de inspección vial, vehículos instrumentados o plataformas de mantenimiento predictivo. La licencia AGPL-3.0 condiciona de forma relevante su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (CNN de deteccion de objetos de una etapa, derivada de Ultralytics/YOLOv8) |
| Parametros totales | 3,2 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de imagen, 640 px por defecto) |
| Tipos de cuantizacion | No disponible en la model card (solo se distribuyen pesos PyTorch) |
| Idiomas soportados | No aplica (modelo de vision por computador) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), cargado mediante la libreria `ultralytics` |
| FLOPs | 8,7 GFLOPs a 640 px |
| Clases | longitudinal_crack, transverse_crack, alligator_crack, pothole |
| Dataset de entrenamiento | dronefreak/RDD2022 (RDD2022 Road Damage) |
| Framework | Ultralytics YOLO |
| Libreria declarada | `ultralytics` |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo parte de `Ultralytics/YOLOv8`, del que hereda la arquitectura YOLOv8n: un detector de una sola etapa con backbone convolucional y cabeza de deteccion desacoplada, del orden de 3,2 M de parametros y 8,7 GFLOPs a 640 px. Sobre esa base se realiza un ajuste fino supervisado sobre el conjunto RDD2022 Road Damage, con anotaciones en caja de cuatro clases de deterioro del pavimento. La model card no detalla la arquitectura interna mas alla de identificar el modelo base, por lo que cualquier afirmacion adicional sobre bloques concretos, mecanismos de atencion o estrategias de asignacion de etiquetas no esta respaldada por la informacion disponible.

En cuanto al entrenamiento, la model card incluye una seccion de configuracion que aparece truncada en la informacion proporcionada, de modo que solo se conocen dos campos: el dataset (RDD2022 Road Damage) y el framework (Ultralytics YOLO). No se documentan el numero de epocas, el optimizador, la tasa de aprendizaje, el esquema de aumento de datos, la resolucion de entrenamiento ni el tamano de los splits de entrenamiento y validacion. Tampoco se indica si hubo tecnicas de ajuste adicionales como destilacion, poda o calibracion. Lo que si se explicita es el protocolo de evaluacion: las metricas se calculan sobre el split de test de RDD2022 mediante el pipeline estandar de DetectionBench (`detectionbench-evaluate`), y el autor marca los resultados como no verificados de forma independiente. La innovacion diferencial del modelo no esta en la arquitectura, sino en su encaje dentro de DetectionBench, que aplica recetas de entrenamiento identicas y metricas comunes a multiples detectores para permitir comparaciones reproducibles.

## Capacidades

- Deteccion de objetos en imagenes de carretera con cuatro clases: grieta longitudinal, grieta transversal, grieta de piel de cocodrilo y bache.
- Localizacion mediante cajas delimitadoras con umbral de confianza configurable (el ejemplo de la model card usa `conf=0.25`).
- Inferencia sobre imagen individual o lotes mediante `model.predict()` de Ultralytics.
- Rendimiento especialmente solido en la clase `pothole`: mAP@50 de 70,76 y mAP@50-95 de 43,48, la mejor del modelo con diferencia.
- Capacidad de servir como baseline reproducible dentro de DetectionBench para comparar arquitecturas bajo la misma receta.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling, function calling ni uso como agente.
- No soporta razonamiento multi-paso ni modos de pensamiento.
- No tiene capacidades multilingues: la salida son cajas y etiquetas de clase, no lenguaje natural.
- No incorpora vision-lenguaje, audio ni ninguna otra modalidad adicional: es vision pura de deteccion.

## Casos de uso

- Inspeccion vial con vehiculos instrumentados: montar el detector sobre una camara de salpicadero y procesar fotogramas en tiempo real para inventariar grietas y baches a lo largo de una ruta. El reducido coste computacional (8,7 GFLOPs) permite ejecutarlo en hardware embebido dentro del propio vehiculo.
- Inspeccion aerea con drones: el tamano minimo del modelo (3,2 M de parametros) hace viable su despliegue a bordo de un dron con computacion limitada, capturando ortomosaicos de firme y detectando patologias sin necesidad de transmitir video a un servidor.
- Priorizacion de mantenimiento por parte de administraciones publicas: procesar por lotes imagenes historicas de carreteras y generar un ranking de tramos por densidad y severidad de detecciones, de modo que los equipos de conservacion asignen presupuesto donde el deterioro es mayor.
- Reporte ciudadano de baches: integrar el modelo en una aplicacion movil donde el usuario fotografiar el firme y la app marque automaticamente la presencia de un bache antes de enviar la incidencia al ayuntamiento, reduciendo el trabajo de triaje manual.
- Generacion de inventarios georreferenciados: combinar las detecciones con metadatos GPS de las capturas para producir capas GIS de patologias del pavimento que alimenten un sistema de gestion de activos viarios.
- Preprocesado en conduccion autonoma o ADAS: usar la deteccion de baches y grietas como senal auxiliar para ajustar el comportamiento del vehiculo (por ejemplo, suavizar la respuesta de suspension o advertir al conductor) en tramos con firme deteriorado.
- Evaluacion comparativa de detectores: emplear el modelo como punto de referencia ligero en experimentos de investigacion que comparen arquitecturas sobre RDD2022, gracias a su integracion con el pipeline de DetectionBench.
- Auditoria de calidad de obra: verificar automaticamente el estado de un tramo recien pavimentado comparando detecciones antes y despues de la intervencion.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de RDD2022 Road Damage. Todos los valores estan marcados como no verificados (`verified: false`) en el model-index.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 58,8 |
| mAP@50-95 | 32,05 |
| Precision | 62,03 |
| Recall | 56,08 |
| F1 | 58,91 |

Rendimiento por clase:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| longitudinal_crack | 52,74 | 28,56 |
| transverse_crack | 50,57 | 24,24 |
| alligator_crack | 61,13 | 31,92 |
| pothole | 70,76 | 43,48 |

Coste computacional declarado: 3,2 M de parametros y 8,7 GFLOPs a 640 px.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 12,8 MB en FP32 (3,2 M x 4 bytes), unos 6,4 MB en FP16 y unos 3,2 MB en INT8. Son estimaciones derivadas del numero de parametros, no cifras publicadas en la model card.
- VRAM de inferencia: muy reducida. Por el orden de magnitud del modelo (8,7 GFLOPs a 640 px), la inferencia cabe holgadamente en cualquier GPU con 2 GB o mas; una estimacion prudente es menos de 1 GB en FP16 a 640 px, aunque la model card no publica mediciones de consumo.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060, RTX 4060 o superior ejecutaria el modelo con margen amplio; tambien es viable en iGPU recientes y en CPU para procesamiento por lotes no critico en latencia.
- GPU de datacenter (A100, H100, L40S) no son necesarias; solo tendrian sentido para procesar volumenes masivos de imagenes en paralelo.
- Despliegue en edge: por debajo de 13 MB de pesos en FP32, es candidato natural para dispositivos embebidos tipo Jetson, Raspberry Pi con acelerador o NPU de movil.
- Opciones de despliegue: la model card solo documenta la carga mediante la libreria `ultralytics` en Python (`YOLO(weights)` y `model.predict()`). El repositorio no especifica otros formatos ni runtimes.
- Latencia y throughput: no disponible. La informacion proporcionada no incluye mediciones de FPS ni de latencia por imagen en ningun hardware.

## Comparativa con modelos similares

La model card incluye el "RDD2022 Road Damage Model Zoo" completo de DetectionBench, con todos los modelos entrenados y evaluados hasta la fecha bajo la misma receta. Todos los valores son declarados por el autor.

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 65,08 | 36,02 | 71,18 | 55,98 |
| RF-DETR Small | 64,71 | 35,73 | 65,69 | 59,41 |
| YOLOv8m | 62,03 | 34,08 | 65,61 | 57,42 |
| YOLOv8s | 61,45 | 33,53 | 64,55 | 57,18 |
| YOLOv26s | 61,27 | 33,30 | 64,42 | 57,13 |
| YOLOv26m | 61,24 | 33,38 | 63,70 | 57,27 |
| RF-DETR Nano | 60,85 | 33,22 | 65,49 | 54,30 |
| YOLOv8n (este modelo) | 58,80 | 32,05 | 62,03 | 56,08 |

Lectura de la tabla: este modelo es el de menor mAP@50 del zoo, con una diferencia de 3,65 puntos respecto a RF-DETR Nano y de 6,28 puntos respecto al mejor modelo (RF-DETR Medium). A cambio, es el de menor coste computacional del conjunto al estar construido sobre la variante nano de YOLOv8. El recall (56,08) es superior al de RF-DETR Medium (55,98) y RF-DETR Nano (54,30), pero inferior al de RF-DETR Small (59,41) y a las variantes s y m de YOLOv8. La model card no publica el numero de parametros ni los FLOPs de los modelos comparados, por lo que la comparacion de eficiencia no puede cerrarse con los datos disponibles. En cuanto a licencia y disponibilidad, la informacion proporcionada solo cubre este modelo (AGPL-3.0); el resto de licencias del zoo figuran como no disponibles.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es la advertencia mas importante para produccion. El uso comercial en un servicio accesible por red obliga, segun los terminos de la AGPL, a poner a disposicion de los usuarios el codigo fuente correspondiente. Cualquier producto propietario que integre este modelo debe revisar previamente sus implicaciones legales.
- Metricas no verificadas: los cuatro valores del model-index estan marcados con `verified: false`. Proceden del pipeline del propio autor (DetectionBench) y no han sido replicados por un tercero independiente.
- Menor precision global del zoo: con 58,8 de mAP@50 es el modelo menos preciso de los ocho comparados, lo que implica mas falsos positivos y negativos en la practica.
- Recall limitado al 56,08: aproximadamente cuatro de cada diez instancias reales de deterioro no se detectan. En un escenario de seguridad vial, los falsos negativos sobre baches son especialmente criticos.
- Rendimiento desigual por clase: `transverse_crack` es la clase peor detectada (mAP@50 de 50,57 y mAP@50-95 de 24,24), mientras que `pothole` alcanza 70,76. La grieta transversal, ademas de ser la mas dificil, es una de las patologias que mas rapido degenera si no se sella.
- Sin validacion fuera de dominio: la model card no documenta evaluaciones con lluvia, asfalto mojado, iluminacion nocturna, sombras o desenfoque de movimiento. No hay evidencia de robustez frente a estas condiciones, muy habituales en capturas reales de carretera.
- Sesgos potenciales del dataset: RDD2022 agrega imagenes de varios paises con tecnicas de pavimentacion y camaras distintas. La model card no desglosa el rendimiento por region, por lo que se desconoce si el modelo rinde igual en todos los paises representados.
- Clases cerradas: el modelo solo reconoce cuatro tipos de deterioro. Cualquier otra patologia (baches de gran profundidad, desprendimientos, roderas, exudacion de betun) no sera clasificada correctamente y puede generar falsos positivos sobre las cuatro clases existentes.
- Informacion de entrenamiento incompleta: la seccion de configuracion de la model card aparece truncada, sin epocas, optimizador ni hiperparametros, lo que dificulta la reproducibilidad exacta del resultado.
- Proposito exclusivamente perceptivo: no produce texto ni explicaciones, no se puede interrogar en lenguaje natural y no toma decisiones. Cualquier sistema que lo use debe aportar la capa de logica, georreferenciacion y priorizacion por su cuenta.
- Sin informacion sobre licencia del dataset: la model card remite a la dataset card de `dronefreak/RDD2022` para los terminos de uso de los datos, que deben consultarse por separado antes de reentrenar o redistribuir el modelo.
- Sin senal de adopcion: cero descargas y cero likes en el momento de la consulta, y repositorio de 0,0 GB. No hay comunidad que haya reportado comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/rdd2022-yolov8n
- Dataset RDD2022: https://huggingface.co/datasets/dronefreak/RDD2022
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base Ultralytics YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
- Referencias arXiv citadas en las etiquetas del modelo: arxiv:2209.08538, arxiv:2511.09554, arxiv:2304.07193, arxiv:2606.03748. La informacion proporcionada no incluye los titulos ni el contenido de estos articulos, por lo que no se puede confirmar a que trabajo corresponde cada identificador.
- Recursos graficos incluidos en el repositorio del modelo (referenciados en la model card, no verificados en esta busqueda): `rdd2022_yolov8n_showcase.jpg`, `BoxPR_curve.png`, `BoxF1_curve.png`, `confusion_matrix.png`, `confusion_matrix_normalized.png`.
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo ni sobre RDD2022; los enlaces obtenidos correspondian a temas ajenos (soporte de YouTube y prensa de ciclismo) y se han descartado por no ser pertinentes.
