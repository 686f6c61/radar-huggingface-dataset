# AhmedGhita/surgint-instruments-rt-detr

## Resumen

AhmedGhita/surgint-instruments-rt-detr es un modelo de deteccion de objetos publicado en HuggingFace por el usuario AhmedGhita, construido sobre la arquitectura RT-DETR (Real-Time DEtection TRansformer). El nombre del repositorio sugiere un ajuste fino orientado a la deteccion de instrumentos quirurgicos ("surgint" como abreviatura de surgical instruments), aunque la model card no documenta el dominio, el dataset ni el procedimiento de entrenamiento empleado, por lo que esa finalidad no puede confirmarse a partir de la informacion disponible.

El modelo tiene 20.123.652 parametros reales segun los pesos en formato safetensors, lo que lo situa en el rango de las variantes ligeras de la familia RT-DETR. El repositorio ocupa 0,1 GB y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones de copyleft. Registra 0 descargas y 0 likes en el momento de la consulta, y no incluye pipeline declarado ni idiomas especificados, algo coherente con un modelo de vision por computador en lugar de un modelo de lenguaje.

Su relevancia potencial radica en que RT-DETR es una de las familias de detectores en tiempo real mas eficientes publicadas hasta la fecha (CVPR 2024), y cualquier ajuste fino sobre ella hereda una arquitectura sin anclas (anchor-free) ni supresion de no maximos (NMS) posterior. No obstante, la ausencia total de documentacion, metricas y fichas de dataset hace que su utilidad practica solo pueda validarse mediante evaluacion directa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR (Real-Time DEtection TRansformer), segun el tag `rt_detr` |
| Parametros totales | 20.123.652 |
| Parametros activos | no aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible en la model card; al distribuirse en safetensors es exportable a FP16, INT8 y formatos ONNX/TensorRT |
| Idiomas soportados | no disponible (modelo de vision; no hay etiquetas de idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-29 |
| Ultima actualizacion | 2026-09-29 |

## Arquitectura y entrenamiento

RT-DETR es un detector transformer introducido en el articulo "DETRs Beat YOLOs on Real-time Object Detection" (CVPR 2024). Su diseno combina un backbone convolucional (tipicamente ResNet) con un encoder hibrido efficient que procesa unicamente las escalas de mayor resolucion, y un decoder transformer con consultas de objeto (object queries). Emplea una estrategia de coincidencia bipartita durante el entrenamiento (asignacion hungara) que elimina la necesidad de generar anclas y de aplicar NMS en la fase de inferencia, lo que simplifica notablemente el despliegue en produccion. El conteo de 20,1 millones de parametros es coherente con una variante de backbone ligera del tipo ResNet-18, aunque la model card no confirma que configuracion concreta se ha utilizado.

Respecto al entrenamiento, la informacion proporcionada no incluye ningun dato: no se especifica el numero de imagenes, la composicion del dataset, si se ha realizado ajuste fino a partir de pesos preentrenados en COCO, ni si se han aplicado tecnicas de aumento de datos. El unico contenido de la model card es la declaracion de licencia MIT, sin seccion de uso previsto, limitaciones ni citacion. Tampoco se documenta si el modelo es una copia directa de un checkpoint publico reempaquetado o un ajuste fino propio.

## Capacidades

- Deteccion de objetos en imagenes: el modelo devuelve cajas delimitadoras con puntuaciones de confianza, segun el comportamiento estandar de la arquitectura RT-DETR.
- Deteccion sin supresion de no maximos: al ser un DETR, el postprocesado es mas simple que en detectores basados en anclas como YOLO.
- Inferencia en tiempo real (potencial): el reducido numero de parametros es compatible con velocidades de fotogramas altas en GPU moderna, aunque no hay medicion publicada para este checkpoint.
- Procesamiento de fotogramas individuales: no se documenta soporte de video nativo, pero al ser un detector por imagen puede aplicarse fotograma a fotograma.
- Clases detectables: no disponible; no se publica la lista de categorias ni el `id2label`.
- Tool calling / function calling: no aplica.
- Razonamiento multi-paso o agentes: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (thinking mode, vision-lenguaje, audio): no disponible; el modelo no parece incluir cabecera de texto.

## Casos de uso

- Conteo y verificacion de instrumentos quirurgicos: el modelo podria emplearse para contar automaticamente el instrumental presente en una bandeja esteril antes y despues de una intervencion, reduciendo el riesgo de retencion de cuerpos extranos. Requiere validacion clinica previa, ya que no hay metricas publicadas.
- Analisis retrospectivo de videos quirurgicos: aplicando deteccion fotograma a fotograma sobre grabaciones de quirófano se podrian generar trazas de uso del instrumental para auditoria de procesos y estudios de eficiencia.
- Asistencia a cirugia robotica: integrado en el lazo de percepcion de un sistema robotico, el detector podria localizar instrumentos en la escena para tareas de seguimiento o anticipacion de movimientos del cirujano.
- Anotacion semiautomatica de datasets clinicos: las detecciones podrian precargarse en herramientas de etiquetado para que un especialista corrija las cajas, acelerando la creacion de corpus quirurgicos propios.
- Control de calidad en esterilizacion y montaje de kits: en un servicio de esterilizacion, el modelo podria verificar por vision que cada kit contiene los instrumentos esperados antes de su sellado y trazabilidad.
- Formacion de residentes: superponiendo detecciones en tiempo real sobre la retransmision de una intervencion, se podria senalar al alumno que instrumento se esta empleando en cada momento.
- Documentacion quirurgica automatica: combinado con un modulo de reconocimiento de fases, las detecciones podrian alimentar la generacion de informes operativos estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (mAP, AP50, AP75), recall, latencia ni comparaciones con otros detectores, y no se ha encontrado ningun informe externo asociado a este repositorio concreto. Los resultados publicados de la arquitectura RT-DETR generica no son extrapolables a este checkpoint sin conocer el dataset de ajuste.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 80 MB solo para pesos (20,1 M parametros x 4 bytes), mas activaciones; en la practica por debajo de 1 GB para un lote pequeno de imagenes.
- VRAM estimada en FP16: alrededor de 40 MB de pesos, con requisitos totales tambien inferiores a 1 GB.
- VRAM estimada en INT8: alrededor de 20 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, T4, L4, A100 o H100 pueden ejecutarlo sobradamente y a alta frecuencia de fotogramas.
- Compatibilidad con GPU de consumo: si, practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso integradas modernas, asi como ejecucion en CPU como alternativa.
- Opciones de despliegue: PyTorch nativo, Hugging Face Transformers (clase `RtDetrForObjectDetection`, siempre que el repositorio incluya un `config.json` compatible, cosa que no puede verificarse con la informacion disponible), exportacion a ONNX y ONNX Runtime, TensorRT, OpenVINO, o despliegue mediante TorchServe y Triton Inference Server. No es desplegable con vLLM, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AhmedGhita/surgint-instruments-rt-detr | 20,1 M | Deteccion de objetos | no aplica | MIT | HuggingFace, 0 descargas |
| RT-DETR-R18 (oficial, lyuwenyu/RT-DETR) | ~20 M | Deteccion de objetos en tiempo real | no aplica | Apache 2.0 (repositorio oficial) | GitHub y checkpoints publicos, ampliamente usado |
| RT-DETRv4 | no disponible en la informacion recogida | Deteccion de objetos en tiempo real con destilacion | no aplica | no disponible en la informacion recogida | Repositorio GitHub y paper ECCV 2026 |
| YOLOv8s | ~11,2 M | Deteccion de objetos en tiempo real | no aplica | AGPL-3.0 (Ultralytics) | Ecosistema Ultralytics, muy extendido |
| DETR (ResNet-50) | ~41 M | Deteccion de objetos | no aplica | Apache 2.0 | Checkpoints publicos, referencia academica |

Los datos de los modelos comparativos son valores generales de familia y no se han verificado contra una fuente concreta en esta busqueda. No existen metricas de precision comparables para el modelo objeto de la ficha, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentacion inexistente: la model card no describe el dataset, el procedimiento de entrenamiento, las clases objetivo ni el uso previsto, lo que impide evaluar su idoneidad sin pruebas propias.
- Sin metricas de rendimiento: no hay ningun valor de mAP, precision, recall o latencia publicado, ni para el dominio quirurgico ni para COCO.
- Riesgo de falsos positivos y falsos negativos: en un contexto clinico, un instrumento no detectado o una deteccion espuria puede tener consecuencias relevantes; el modelo no debe usarse como unico mecanismo de conteo o seguridad.
- Sesgos potenciales del dominio: las escenas quirurgicas presentan oclusiones frecuentes, reflejos especulares, presencia de sangre y variaciones de iluminacion que degradan la mayoria de detectores; no se documenta si el ajuste tuvo en cuenta estos factores.
- Ausencia de lista de clases: sin `id2label` publicado, el significado de los indices de salida es desconocido salvo que se inspeccione el `config.json` del repositorio.
- Limitaciones de idioma: no aplica al ser un modelo de vision, pero tampoco hay soporte de texto o vision-lenguaje.
- Licencia: MIT permite uso comercial, modificacion y redistribucion con atribucion y sin garantia; no impone restricciones copyleft, pero tampoco ofrece ninguna garantia implicita de funcionamiento.
- Cumplimiento normativo sanitario: cualquier uso en un producto sanitario o en asistencia clinica directa esta sujeto al Reglamento Europeo de Productos Sanitarios (MDR) o a la normativa FDA equivalente; este modelo no esta certificado ni acompanado de expediente tecnico.
- Riesgo de procedencia: al no documentarse el dataset de entrenamiento, no puede descartarse que se hayan usado imagenes con restricciones de uso o de proteccion de datos.
- Madurez: 0 descargas y 0 likes indican que el artefacto no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AhmedGhita/surgint-instruments-rt-detr
- Perfil del autor: https://huggingface.co/AhmedGhita
- Documentacion de RT-DETR en Transformers: https://huggingface.co/docs/transformers/model_doc/rt_detr
- Repositorio oficial de RT-DETR (CVPR 2024): https://github.com/lyuwenyu/RT-DETR
- Repositorio de RT-DETRv4 (ECCV 2026): https://github.com/RT-DETRs/RT-DETRv4
- Paper de RT-DETRv4: https://arxiv.org/html/2510.25257v1
