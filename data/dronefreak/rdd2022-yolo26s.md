# dronefreak/rdd2022-yolo26s

## Resumen

rdd2022-yolo26s es un detector de objetos YOLO26s afinado por el usuario dronefreak sobre el conjunto de datos RDD2022 Road Damage, un benchmark de daño en pavimento con imágenes de carretera capturadas en distintos países. El modelo parte de los pesos preentrenados de Ultralytics/YOLO26 y se especializa en cuatro clases de defectos viarios: grieta longitudinal, grieta transversal, grieta de piel de cocodrilo y bache. Su propósito es servir como detector reproducible dentro del framework DetectionBench, que entrena y evalúa distintos detectores modernos con recetas idénticas para permitir comparaciones justas.

Se trata de un modelo compacto, con 10,0 millones de parámetros y 22,8 GFLOPs a 640 píxeles de resolución de entrada, lo que lo sitúa en la gama de detectores ligeros aptos para inferencia en tiempo real sobre hardware modesto, incluidos dispositivos de borde. No es un modelo de lenguaje: no procesa texto ni mantiene contexto conversacional, sino que recibe imágenes y devuelve cajas delimitadoras con clase y confianza.

Su relevancia actual radica en dos factores. Por un lado, la inspección automatizada de infraestructura viaria es un caso de uso con demanda creciente, apoyado en vehículos instrumentados con cámaras y en drones de bajo coste. Por otro, el modelo se publica junto a métricas verificables sobre el split de test y a una tabla comparativa abierta frente a RF-DETR y YOLOv8, lo que facilita evaluar si merece la pena adoptarlo en lugar de alternativas. La licencia AGPL-3.0 condiciona su uso comercial, un punto que conviene revisar antes de integrarlo en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (detector de objetos de la familia Ultralytics YOLO, una etapa), fine-tune de Ultralytics/YOLO26 |
| Parametros totales | 10,0 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; modelo de visión con resolución de entrada de 640 px (FLOPs declarados a 640 px) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible; las clases y etiquetas están en inglés (longitudinal_crack, transverse_crack, alligator_crack, pothole) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), cargable con la librería `ultralytics` |
| Tarea (pipeline) | object-detection |
| Dataset de entrenamiento | dronefreak/RDD2022 (RDD2022 Road Damage) |
| Modelo base | Ultralytics/YOLO26 |
| FLOPs | 22,8 GFLOPs a 640 px |
| Clases | 4 (longitudinal_crack, transverse_crack, alligator_crack, pothole) |
| Descargas / likes en HuggingFace | 0 / 0 (en la fecha de consulta) |
| Tamano del repositorio | 0,0 GB (segun metadatos de HuggingFace) |
| Fecha de creacion / actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura es la de YOLO26s, un detector de objetos de una sola etapa perteneciente a la familia Ultralytics YOLO y distribuido a través de la librería `ultralytics`. El modelo se obtiene por ajuste fino (*fine-tune*) de los pesos preentrenados de Ultralytics/YOLO26, no por entrenamiento desde cero. Con 10,0 millones de parámetros y 22,8 GFLOPs a 640 píxeles, se posiciona en el segmento ligero de la familia, por debajo de las variantes medianas y grandes en coste computacional. El pipeline declarado es de detección de objetos, con salida de cajas delimitadoras, clase y puntuación de confianza.

El entrenamiento se realiza sobre el conjunto RDD2022 Road Damage, disponible como `dronefreak/RDD2022` en HuggingFace, y forma parte del proyecto DetectionBench. Este framework aplica recetas de entrenamiento y métricas de evaluación idénticas a varios detectores modernos sobre el mismo conjunto, de modo que las comparaciones entre modelos sean reproducibles. La model card no detalla el número de tokens o épocas, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos o de regularización específicas; tampoco menciona fases de refinamiento por refuerzo, lo cual es esperable en un detector y no en un modelo generativo. La información disponible se limita a la configuración de entrenamiento parcialmente truncada en la model card, que indica el dataset (RDD2022 Road Damage) y el framework (Ultralytics YOLO).

Las métricas publicadas se calculan sobre el split de **test** de RDD2022 empleando el pipeline estándar de DetectionBench (`detectionbench-evaluate`). El autor marca todas las métricas del `model-index` como no verificadas (`verified: false`), lo que implica que son resultados autodeclarados y no han pasado una validación independiente por parte de la plataforma.

## Capacidades

- Detección de objetos en imágenes de carretera con cuatro categorías: grietas longitudinales, grietas transversales, grietas de piel de cocodrilo (alligator crack) y baches.
- Localización mediante cajas delimitadoras, con puntuación de confianza por detección, lo que permite filtrar por umbral (`conf=0.25` en el ejemplo de la model card).
- Inferencia sobre imágenes individuales a través de la API `model.predict()` de Ultralytics; el ecosistema admite también vídeo y streaming, aunque la model card solo documenta el ejemplo con imagen.
- Ejecución sobre lotes y en distintos backends al ser un modelo Ultralytics exportable (el repositorio no documenta exportaciones concretas, pero la librería soporta formatos como ONNX o TensorRT).
- Capacidad de servir como componente de un pipeline mayor de inspección viaria, combinado con geolocalización o registro de daños.
- No dispone de *tool calling*, *function calling*, razonamiento multi-paso, modo *thinking*, ni capacidades de audio o texto: es exclusivamente un modelo de visión por computador.
- Capacidades multilingües: no aplica; las etiquetas de clase están en inglés y el modelo no procesa lenguaje natural.

## Casos de uso

- Inspección de carreteras con vehículos instrumentados: una flota con cámaras frontales captura imágenes en movimiento y el modelo detecta baches y grietas sobre el asfalto, generando un registro georreferenciado de defectos para planificar el mantenimiento. Su tamaño de 10,0 M de parámetros y 22,8 GFLOPs permite ejecutarlo a bordo sin depender de conectividad.
- Cartografiado de daño con drones: vuelos de reconocimiento sobre tramos viarios capturan ortofotografías que se procesan por lotes con el detector para clasificar y localizar los cuatro tipos de defecto, reduciendo el trabajo de inspección manual en campo.
- Priorización de reparaciones municipales: el modelo puede procesar el archivo fotográfico histórico de un ayuntamiento y producir un inventario clasificado de daños, con conteo por tipo de grieta y por bache, para asignar presupuestos según severidad y frecuencia.
- Mantenimiento predictivo de infraestructura: integrado en una rutina periódica de captura (mensual o trimestral), los resultados permiten calcular la evolución de la superficie dañada en cada tramo y anticipar intervenciones antes de que el deterioro se agrave.
- Auditoría de calidad de obra: comparar las imágenes de recepción de un tramo recién pavimentado con las del mismo tramo meses después facilita detectar defectos tempranos y respaldar reclamaciones de garantía ante el contratista.
- Vehículos autónomos y ADAS: como módulo auxiliar de percepción, la detección de baches y grietas de piel de cocodrilo puede alimentar un sistema de ajuste de suspensión o de aviso al conductor, aunque su latencia real en producción no está documentada en la información disponible.
- Análisis de accesibilidad y seguridad vial: identificar tramos con concentración de baches permite cruzar esos datos con siniestralidad o con rutas peatonales y ciclistas para orientar intervenciones de seguridad.
- Investigación en visión por computador: sirve como punto de comparación reproducible dentro de DetectionBench, útil para medir el efecto de cambios en la receta de entrenamiento o para evaluar nuevos detectores bajo idénticas condiciones.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de **test** de RDD2022 Road Damage (todos marcados como no verificados por la plataforma). El F1 se toma de la tabla de rendimiento de la model card; el resto, del `model-index`.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 61,27 |
| mAP@50-95 | 33,30 |
| Precision | 64,42 |
| Recall | 57,13 |
| F1 Score | 60,55 |
| Parametros | 10,0 M |
| FLOPs | 22,8 B (a 640 px) |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| longitudinal_crack | 54,67 | 29,67 |
| transverse_crack | 53,81 | 25,94 |
| alligator_crack | 62,08 | 32,12 |
| pothole | 74,52 | 45,48 |

El modelo zoo completo publicado por el autor para RDD2022 incluye las siguientes entradas, con la misma receta de evaluación:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 65,08 | 36,02 | 71,18 | 55,98 |
| RF-DETR Small | 64,71 | 35,73 | 65,69 | 59,41 |
| YOLOv8m | 62,03 | 34,08 | 65,61 | 57,42 |
| YOLOv8s | 61,45 | 33,53 | 64,55 | 57,18 |
| YOLOv26s (este modelo) | 61,27 | 33,30 | 64,42 | 57,13 |
| YOLOv26m | 61,24 | 33,38 | 63,70 | 57,27 |
| RF-DETR Nano | 60,85 | 33,22 | 65,49 | 54,30 |
| YOLOv8n | 58,80 | 32,05 | 62,03 | 56,08 |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 40 MB en FP32 (10 M parámetros × 4 bytes), unos 20 MB en FP16 y unos 10 MB en INT8. Son valores derivados del recuento de parámetros, no cifras publicadas por el autor.
- VRAM total en inferencia: por debajo de 1 GB en la mayoría de configuraciones a 640 px, incluyendo activaciones y buffers. Estimación orientativa, no verificada en la información disponible.
- GPU de centro de datos: no requiere A100, H100 ni similares; cualquier GPU moderna es sobredimensionada para este modelo. Se pueden usar para procesar grandes lotes en paralelo.
- GPU de consumo: cabe holgadamente en GTX 1060, RTX 2060, RTX 3060, RTX 4090 y equivalentes, así como en GPU integradas recientes con soporte de inferencia.
- Dispositivos de borde: al tratarse de un detector de 10,0 M de parámetros, es candidato razonable para despliegue en Jetson, Raspberry Pi con acelerador o NPUs móviles, aunque no se documentan exportaciones ni rendimiento medido en esos entornos.
- Opciones de despliegue: la librería `ultralytics` es la vía documentada en la model card. El ecosistema Ultralytics permite exportar a ONNX, TensorRT, OpenVINO, TFLite o CoreML, pero el repositorio no publica artefactos en esos formatos ni instrucciones específicas. No hay soporte declarado para vLLM, TGI, llama.cpp ni Ollama, que son herramientas de modelos de lenguaje y no aplican aquí.
- Latencia y throughput: no disponibles. No se publican mediciones de FPS, latencia por imagen ni rendimiento en hardware concreto. Los 22,8 GFLOPs a 640 px indican que el coste por inferencia es bajo, pero la cifra real depende del backend y de la GPU.

## Comparativa con modelos similares

Comparación con alternativas evaluadas bajo la misma receta en DetectionBench sobre RDD2022 Road Damage:

| Modelo | Parametros | mAP@50 | mAP@50-95 | Precision | Recall | Licencia |
|---|---|---|---|---|---|---|
| rdd2022-yolo26s (este) | 10,0 M | 61,27 | 33,30 | 64,42 | 57,13 | AGPL-3.0 |
| YOLOv8s | no disponible | 61,45 | 33,53 | 64,55 | 57,18 | AGPL-3.0 (modelo base Ultralytics) |
| YOLOv8m | no disponible | 62,03 | 34,08 | 65,61 | 57,42 | AGPL-3.0 (modelo base Ultralytics) |
| RF-DETR Small | no disponible | 64,71 | 35,73 | 65,69 | 59,41 | no disponible |
| RF-DETR Medium | no disponible | 65,08 | 36,02 | 71,18 | 55,98 | no disponible |
| YOLOv26m | no disponible | 61,24 | 33,38 | 63,70 | 57,27 | AGPL-3.0 (modelo base Ultralytics) |

Observaciones a partir de los datos declarados: RF-DETR Medium y RF-DETR Small superan a este modelo en mAP@50 y mAP@50-95, con la diferencia más acusada en precisión a favor de RF-DETR Medium (71,18 frente a 64,42). Frente a YOLOv8s y YOLOv8m, el rendimiento es prácticamente equivalente (diferencias de 0,2 a 0,8 puntos de mAP@50), lo que sugiere que en este dataset el salto de generación YOLOv8 a YOLO26 no aporta una ventaja clara en precisión. La comparación de coste computacional no puede completarse porque solo se publican los parámetros y FLOPs de este modelo, no los de las alternativas. Los datos de parámetros, licencia y contexto de las alternativas figuran como "no disponible" al no aparecer en la información proporcionada.

## Limitaciones y advertencias

- Métricas no verificadas: todas las cifras del `model-index` están marcadas con `verified: false`; son resultados autodeclarados por el autor y no han sido reproducidos de forma independiente.
- Repositorio vacío en la práctica: el tamaño declarado es de 0,0 GB y el modelo registra 0 descargas y 0 likes, lo que puede indicar que los pesos no están efectivamente alojados o que su uso es todavía nulo. Conviene comprobar la descarga de `best.pt` antes de integrarlo.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Su uso en servicios de red obliga, según la interpretación habitual de la AGPL, a ofrecer el código fuente de la obra derivada a los usuarios del servicio. Para integración en productos propietarios o SaaS de código cerrado es un obstáculo relevante y conviene revisarlo con asesoría legal.
- Sesgos y generalización: el modelo se ha entrenado únicamente con RDD2022. No se documenta su comportamiento en condiciones de captura distintas (iluminación nocturna, lluvia, nieve, imágenes aéreas de dron frente a imágenes a nivel de calzada, resoluciones muy distintas), por lo que la generalización fuera de la distribución de ese dataset es incierta.
- Clases limitadas: solo detecta cuatro tipos de defecto. No cubre otras patologías del pavimento ni elementos del entorno viario, y no devuelve información de severidad o profundidad del daño.
- Riesgo de falsos positivos y negativos: con una precisión del 64,42 % y un recall del 57,13 % sobre test, aproximadamente cuatro de cada diez detecciones declaradas podrían ser falsas y más de cuatro de cada diez defectos reales podrían no detectarse. En un uso operativo esto implica revisión humana o umbrales de confianza ajustados.
- Rendimiento desigual por clase: los baches se detectan mucho mejor (mAP@50 de 74,52) que las grietas transversales (53,81) y longitudinales (54,67). Las grietas finas, que son precisamente los indicios tempranos de deterioro, son la categoría más débil.
- Sin datos de calibración de confianza, tiempos de inferencia, consumo energético ni comportamiento en cuantización. Tampoco hay información sobre el desglose del dataset de entrenamiento, la composición geográfica de RDD2022 usada ni si hubo validación cruzada.
- Idiomas: el modelo no procesa lenguaje natural. Cualquier sistema que consuma sus salidas debe mapear las clases en inglés a la terminología local.
- Procedencia del autor: se trata de un repositorio de un usuario individual (`dronefreak`) sin historial público de descargas ni mantenimiento contrastable, a diferencia de los pesos oficiales de Ultralytics.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/rdd2022-yolo26s
- Dataset RDD2022 Road Damage: https://huggingface.co/datasets/dronefreak/RDD2022
- Repositorio DetectionBench (framework de evaluación y código fuente declarado de las métricas): https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Documentación de la librería Ultralytics: https://docs.ultralytics.com
- Referencias arXiv etiquetadas en el repositorio (contenido no descrito en la información proporcionada): https://arxiv.org/abs/2209.08538, https://arxiv.org/abs/2606.03748, https://arxiv.org/abs/2511.09554, https://arxiv.org/abs/2304.07193
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a servicios de escritorio remoto sin relación con la ficha.
