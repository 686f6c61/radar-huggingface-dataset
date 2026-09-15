# Farhatullah0066/yolov8n-fire-smoke-detection

# Farhatullah0066/yolov8n-fire-smoke-detection

## Resumen

Farhatullah0066/yolov8n-fire-smoke-detection es un repositorio alojado en Hugging Face por el usuario Farhatullah0066 que, a juzgar por su identificador, corresponde a un detector de objetos basado en la arquitectura YOLOv8 en su variante nano (yolov8n) y orientado a la detección de fuego y humo. Está publicado bajo licencia AGPL-3.0 y fue creado el 15 de septiembre de 2026; en el momento de redactar esta ficha acumula 0 descargas y 0 likes.

El interés de un modelo de este tipo reside en el nicho de la detección temprana de incendios: un detector ligero capaz de ejecutarse en tiempo casi real sobre cámaras de vigilancia, drones o dispositivos embebidos permitiría generar alertas antes de que el fuego se propague. YOLOv8n es, dentro de la familia YOLOv8 de Ultralytics, la variante de menor tamaño y mayor velocidad, diseñada para inferencia en el borde.

Sin embargo, la información publicada es prácticamente inexistente. La model card contiene únicamente el campo de licencia en su encabezado YAML, el tamaño del repositorio es de 0,0 GB y no se declara pipeline, idiomas, conjunto de datos de entrenamiento ni métricas de ningún tipo. Esto impide verificar que existan pesos descargables, cuántas clases detecta el modelo o con qué datos fue entrenado, de modo que esta ficha se limita a documentar lo confirmado y a marcar el resto como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Por el nombre del repositorio, se presupone YOLOv8n (detector de objetos CNN de una etapa, sin anclas, de Ultralytics); no confirmado por el autor |
| Parametros totales | No disponible en el repositorio. La variante oficial YOLOv8n declara aproximadamente 3,2 M de parametros segun la documentacion publica de Ultralytics |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, no generativo ni conversacional) |
| Tipos de cuantizacion | No disponible. La familia YOLOv8 admite exportacion a FP16, INT8 y TensorRT/OpenVINO en flujos estandar, pero no se confirma para este checkpoint |
| Idiomas soportados | No aplica (tarea de vision; las etiquetas de clase estarian en el idioma del dataset, no declarado) |
| Licencia | AGPL-3.0 |
| Formato de pesos | No disponible. El repositorio ocupa 0,0 GB y no se listan archivos .pt, .onnx, .gguf ni .safetensors |
| Tarea declarada | No disponible en el pipeline de Hugging Face; se presupone deteccion de objetos |
| Numero de clases | No disponible. Se presuponen dos (fuego y humo) por el nombre; sin confirmar |
| Fecha de creacion | 15 de septiembre de 2026 |
| Ultima actualizacion | 15 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta, el dataset ni el procedimiento de entrenamiento de este repositorio. La model card se reduce a la linea `license: agpl-3.0`, sin descripcion, sin hiperparametros, sin curvas de entrenamiento y sin metricas de validacion.

Como contexto general de la familia a la que apunta el nombre, YOLOv8 es un detector de objetos de una sola etapa, sin anclas (anchor-free), con cabecera desacoplada de clasificacion y regresion, funcion de perdida DFL (Distribution Focal Loss) y modulos C2f en el backbone. La variante nano emplea un escalado reducido de canales y repeticiones. Los flujos de entrenamiento habituales de Ultralytics incluyen aumentacion tipo mosaic y mixup, y exportacion a multiples backends de inferencia. Ninguno de estos extremos puede confirmarse para este repositorio concreto, y tampoco se especifica que dataset de incendios (por ejemplo D-Fire, Furg-Fire o FireNet) se habria utilizado, ni si hubo ajuste fino desde pesos preentrenados en COCO.

## Capacidades

- Deteccion de objetos en imagenes: presumiblemente localizacion con cajas delimitadoras de las clases fuego y humo, sin confirmar.
- Deteccion sobre video: la arquitectura YOLOv8n permite procesar fotogramas de forma secuencial, aunque no hay ninguna demostracion ni ejemplo publicado en este repositorio.
- Inferencia de baja latencia: por tamano (variante nano), es apta en teoria para tiempo casi real en GPU de gama media o en hardware embebido.
- No es un modelo generativo: no produce texto, no razona, no mantiene conversaciones y no soporta tool calling ni function calling.
- No incorpora agentes, planificacion multietapa ni modo de razonamiento explicito.
- Capacidades multilingues: no aplica.
- Capacidades especiales (vision multimodal, audio, thinking mode): no disponibles; se trata, en el mejor de los casos, de un detector unimodal de vision.

## Casos de uso

- Vigilancia forestal con camaras fijas: desplegado en torres de observacion, el detector podria analizar fotogramas cada pocos segundos y disparar una alerta cuando aparezca humo, antes de que haya llama visible. Requiere validar previamente las metricas del checkpoint, hoy inexistentes.
- Monitorizacion de plantas industriales: en entornos con materiales inflamables, el modelo podria integrarse en el circuito de CCTV existente para detectar conatos en zonas no cubiertas por sensores de humo tradicionales.
- Vigilancia urbana y túneles: procesamiento de flujos de camaras municipales para detectar columnas de humo o fuego en carretera, con envio de la alerta al centro de control.
- Drones de extincion y reconocimiento aereo: al ser una variante nano, el modelo podria ejecutarse a bordo de plataformas con GPU embebida (Jetson, por ejemplo) para geolocalizar focos activos.
- Dispositivos embebidos de bajo consumo: edge TPU, Raspberry Pi con acelerador o mini-PC industrial, donde un detector grande no cabria por latencia o memoria.
- Prefiltrado en pipelines de verificacion humana: usar el detector como primera etapa que descarta el 95 % de los fotogramas y envia solo los candidatos a un operador o a un modelo de vision mas costoso.
- Investigacion y docencia: punto de partida reproducible para comparar estrategias de deteccion temprana de incendios, siempre que el autor publique los pesos y el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mAP, precision, recall, F1, curvas precision-recall, matrices de confusion ni comparaciones con otros detectores. Los resultados de busqueda web asociados no contienen ningun dato tecnico sobre el modelo.

## Requisitos de hardware

Las cifras siguientes son referencias generales de la variante YOLOv8n publicada por Ultralytics y no han sido medidas sobre este checkpoint, cuyos pesos no estan verificados:

- Peso de los pesos: del orden de 12 MB en FP32 y 6 MB en FP16 para la variante nano estandar.
- VRAM en inferencia: menos de 1 GB para lotes pequenos a 640x640 en FP16; el modelo cabe holgadamente en cualquier GPU consumer actual (RTX 3050, RTX 3060, GTX 1660, etc.) y en iGPUs recientes.
- GPU profesionales recomendadas para despliegue masivo: NVIDIA T4, L4, A10, A100 o H100, con mayor interes en el numero de flujos de video concurrentes que en la memoria.
- Hardware embebido: Jetson Nano, Orin Nano, Orin NX, Coral Edge TPU (via TFLite) y Raspberry Pi 4/5 con acelerador, siempre que la exportacion sea posible.
- CPU: viable en modo single-stream con ONNX Runtime u OpenVINO, con latencias del orden de decenas de milisegundos por fotograma en procesadores modernos.
- Opciones de despliegue: Ultralytics Python, ONNX Runtime, TensorRT, OpenVINO, TFLite, Triton Inference Server; llama.cpp y vLLM no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles para este checkpoint. En la familia YOLOv8n, sobre GPU de gama media y TensorRT, se documentan regimenes de varios cientos de FPS a 640x640, pero esta cifra no puede atribuirse a este repositorio.

## Comparativa con modelos similares

Las cifras de parametros de la columna de alternativas proceden de la documentacion publica de cada proyecto y no se han verificado en esta ficha. Para el repositorio objeto de analisis no existe ningun dato medible.

| Modelo | Tipo | Parametros (referencia publica) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Farhatullah0066/yolov8n-fire-smoke-detection | Deteccion de objetos (presunto YOLOv8n afinado) | No disponible | AGPL-3.0 | Repositorio de 0,0 GB, 0 descargas, sin pesos confirmados |
| YOLOv8n (Ultralytics) | Detector de objetos de una etapa | Aprox. 3,2 M | AGPL-3.0 | Pesos publicos y mantenidos |
| YOLOv5n (Ultralytics) | Detector de objetos de una etapa | Aprox. 1,9 M | GPL-3.0 | Pesos publicos; proyecto en modo mantenimiento |
| RT-DETR-R18 (Baidu) | Detector transformer en tiempo real | Aprox. 20 M | Apache-2.0 | Pesos publicos; licencia permisiva |

La comparacion de rendimiento (mAP, latencia) no puede realizarse porque el modelo analizado no publica metricas.

## Limitaciones y advertencias

- Model card vacia: no hay descripcion, dataset, hiperparametros ni metricas. Cualquier evaluacion tecnica es hoy imposible.
- Repositorio de 0,0 GB: no consta que se hayan subido pesos, por lo que el modelo podria no ser utilizable en la practica.
- Cero descargas y cero likes: no hay evidencia de uso, validacion por terceros ni retroalimentacion de la comunidad.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Integrar el modelo en un producto propietario, incluso ofrecido como servicio en red, obliga a liberar el codigo fuente correspondiente. Conviene revisar las obligaciones antes de cualquier uso comercial.
- Riesgo de falsos positivos y falsos negativos: en deteccion de humo, los falsos positivos (vapor de agua, niebla, polvo) degradan la confianza del operador, y los falsos negativos tienen consecuencias criticas. Sin datos de validacion no puede acotarse este riesgo.
- Sesgo de dominio: sin conocer el dataset, se desconoce si el modelo generaliza a distintas condiciones de iluminacion, climatologia, resolucion o geografia.
- Sesgo de clase y desbalanceo: los datasets de incendios suelen estar desbalanceados y contener imagenes sinteticas o repetidas; no hay informacion al respecto.
- Alucinacion: no aplica en el sentido generativo, pero si en forma de detecciones espurias sin objeto real.
- Trazabilidad: se desconoce la procedencia de los datos de entrenamiento y si existen restricciones de uso derivadas del dataset original.
- Sin soporte: no hay issues, ejemplos de inferencia ni autor de contacto declarado en la informacion disponible.
- Fecha de creacion futura registrada por la plataforma (2026), lo que sugiere metadatos poco fiables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Farhatullah0066/yolov8n-fire-smoke-detection
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las paginas recuperadas corresponden a Apex Trader Funding (dashboard, inicio, about, helpdesk y portal seguro) y no guardan relacion con el modelo ni con vision por computador.
