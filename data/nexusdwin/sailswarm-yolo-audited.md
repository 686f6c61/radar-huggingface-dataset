# NexusDwin/sailswarm-yolo-audited

## Resumen

SailSwarm YOLO Audited es un conjunto de detectores de objetos basados en YOLOv8 y YOLO11, desarrollado por NexusDwin para la detección de obstáculos en navegación marítima de vehículos de superficie no tripulados (USV). El modelo está afinado sobre el subconjunto de fotogramas fisheye auditados manualmente del corpus SailSwarm, capturados en el lago de Constanza, con imágenes corregidas de 864×648 píxeles. Sustituye a una versión anterior (`sailswarm-yolov8n-konstanz`) que utilizaba etiquetas de otra era.

El problema que resuelve es la detección en tiempo real de obstáculos como barcos, boyas, patos, personas y estructuras en entornos acuáticos de interior, con especial atención al despliegue en hardware de bajo consumo. La relevancia actual radica en su enfoque de entrenamiento libre de fugas de datos y en las exportaciones ONNX que permiten ejecutar el modelo en dispositivos como Raspberry Pi, así como en su integración en un sistema de fusión de evidencias con clasificador GBT. La arquitectura es de detección de una etapa (YOLOv8/YOLO11) y el tamaño del repositorio es de 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 / YOLO11 (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de deteccion de objetos, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos .pt y exportaciones ONNX; no se documenta cuantizacion) |
| Idiomas soportados | no aplicable (modelo de vision) |
| Licencia | other |
| Formato de pesos | .pt (PyTorch) y .onnx |

## Arquitectura y entrenamiento

Los modelos se construyen sobre las arquitecturas de detección de objetos de una etapa Ultralytics YOLOv8 y YOLO11. El entrenamiento se realiza sobre fotogramas del corpus SailSwarm de obstáculos en el lago de Constanza, concretamente imágenes corregidas de lente fisheye a 864×648 píxeles. Las clases detectadas son `boat, buoy, duck, other, person, structure`, de acuerdo con el archivo `data.yaml`. La model card indica que existen tres conjuntos de pesos principales: los entrenados sobre todos los fotogramas auditados (variantes `audited`), una variante con semillas adicionales y una variante `noholdout` que elimina las grabaciones reservadas para validación, considerada libre de fugas. Esta última se utiliza como canal de evidencia tipada en un sistema de puntuación basado en GBT.

No se mencionan técnicas de alineación como RLHF o DPO, ya que no se trata de un modelo de lenguaje. Las innovaciones técnicas destacables son las exportaciones a ONNX para las resoluciones de entrada 640 y 864, diseñadas para ejecutarse en hardware embebido, y el uso del modelo `yolov8s_audited_best.pt` como puerta de confirmación para reducir falsos positivos de personas en escenas nocturnas.

## Capacidades

- Detección de objetos en imágenes fisheye corregidas, con una resolución de entrada de 640 o 864 píxeles.
- Reconocimiento de seis clases: `boat`, `buoy`, `duck`, `other`, `person` y `structure`.
- Exportación a formato ONNX, lo que facilita el despliegue en entornos de inferencia sin necesidad de PyTorch.
- Funcionamiento en CPU de bajo consumo: la variante YOLOv8n a 640 alcanza 1,5 fps en una Raspberry Pi 4 con 2 hilos.
- Capacidad de integrarse como canal de evidencia en un sistema de fusión multimodal con clasificador GBT.
- Función de confirmación nocturna para distinguir personas de motores, rechazando el 96 % de falsos positivos y manteniendo el 82 % de verdaderos positivos.
- No soporta generación de texto, razonamiento lingüístico, tool calling ni visión multimodal de tipo lenguaje; tiene una utilidad exclusivamente visual.

## Casos de uso

- Navegación autónoma de USV en aguas interiores: el modelo detecta boyas, barcos y personas en imágenes de lente gran angular, proporcionando la entrada visual a un sistema de evitación de obstáculos en tiempo real.
- Despliegue embarcado de bajo consumo: gracias a las exportaciones ONNX y al rendimiento de 1,5 fps en Raspberry Pi 4, puede ejecutarse en una embarcación pequeña sin necesidad de GPU dedicada.
- Vigilancia nocturna de puertos: la variante `yolov8s` como confirm-gate filtra falsas alarmas de personas generadas por motores, reduciendo costes operativos de personal.
- Sistema de alerta en boyas o balizas: el modelo detecta estructuras y objetos flotantes, enviando avisos a una estación base cuando aparece algo en la zona de navegación.
- Investigación en datasets de visión marítima: el corpus auditado con anotaciones revisadas permite reentrenar el modelo o emplear los pesos como referencias para validar otros detectores.
- Integración en panel de fusion multimodal: el canal de evidencia tipada que genera el modelo se combina con otras fuentes en un GBT, mejorando la precision de la clasificación global.

## Benchmarks y rendimiento

Los datos disponibles son los resultados de validación proporcionados por el autor, en un conjunto de 129 imágenes y 1779 cajas (o 68 imágenes y 1009 cajas para la variante noholdout).

| Variante | Precision | Recall | mAP50 | mAP50-95 | Nota |
|---|---|---|---|---|---|
| `yolov8n_audited_best.pt` | 0,440 | 0,415 | 0,454 | 0,268 | Entrenado en todos los fotogramas auditados |
| `yolov8s_audited_best.pt` | 0,477 | 0,460 | 0,462 | 0,295 | Incluye semillas s1 y s2; hermanos 11n/11s |
| `yolov8n_noholdout_best.pt` | 0,704 | 0,383 | 0,428 | 0,254 | Sin fugas de datos; 68 imágenes y 1009 cajas reservadas |

- Uso nocturno: la variante `yolov8s` como confirm-gate rechaza el 96 % de falsos positivos de motor detectados como persona y mantiene el 82 % de las personas reales (2026-09-02).
- Fusion scorer: con el detector noholdout se obtiene una AP tipada de 0,927 en un clasificador GBT, frente a 0,874 sin este canal, acierto en 8 de 8 grabaciones.

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentacion. El repositorio ocupa 0,3 GB, por lo que los pesos son ligeros, pero no se aporta una cifra concreta.
- GPU recomendadas: no especificadas por el autor. El modelo se ha validado en CPU sobre Raspberry Pi 4, por lo que una GPU moderna seria mas que suficiente.
- Capacidad en GPUs de consumo: probablemente si, dado el tamano de los pesos y la arquitectura YOLO, pero no se confirma oficialmente.
- Opciones de despliegue: Ultralytics (PyTorch) y ONNX Runtime. El repositorio incluye scripts como `deploy/shadow_mode.sh` para el despliegue en caja. No constan integraciones con vLLM, TGI ni Ollama, al tratarse de un detector de vision.
- Latencia y throughput: solo se documenta la inferencia en Raspberry Pi 4 con 2 hilos para YOLOv8n-640, que alcanza 1,5 fps. No hay datos de latencia en GPU.

## Comparativa con modelos similares

No se han publicado comparativas con modelos externos. La comparacion disponible es entre las variantes del propio modelo:

| Variante | mAP50 | mAP50-95 | Uso previsto |
|---|---|---|---|
| `yolov8n_audited_best.pt` | 0,454 | 0,268 | Detector general entrenado sobre todos los fotogramas |
| `yolov8s_audited_best.pt` | 0,462 | 0,295 | Variante mas robusta, con semillas adicionales; usada como confirm-gate |
| `yolov8n_noholdout_best.pt` | 0,428 | 0,254 | Version sin fugas para evaluacion y sistemas criticos |

Modelos anteriores del mismo autor, como `NexusDwin/sailswarm-yolov8n-konstanz`, quedan superados por esta version, pero no hay datos numericos de comparacion.

## Limitaciones y advertencias

- Licencia `other` sin detalle de los terminos: es necesario revisar el archivo de licencia antes de cualquier uso comercial o redistribucion.
- Las metricas de validacion son moderadas: el mAP50 oscila entre 0,428 y 0,462, y el recall de la variante noholdout es bajo (0,383), lo que implica un riesgo considerable de falsos negativos.
- El dataset de entrenamiento es especifico del lago de Constanza y de condiciones fisheye corregidas; la generalizacion a otros tipos de agua, iluminacion o lentes puede ser limitada.
- El rendimiento en Raspberry Pi (1,5 fps) es adecuado para sistemas lentos o de alertas, pero no para navegacion autónoma de alta velocidad.
- El modelo es puramente visual y no genera texto ni razonamiento simbolico; no es compatible con tareas de procesamiento de lenguaje natural.
- No se documenta un estudio de sesgos en las anotaciones; las clases como `person` o `boat` pueden tener representacion desigual en el corpus.
- Las variantes `audited` pueden presentar fuga de datos al incluir fotogramas que luego se usan en validacion; para evaluaciones rigurosas se recomienda usar `noholdout`.

## Enlaces

- HuggingFace: https://huggingface.co/NexusDwin/sailswarm-yolo-audited
- La model card menciona el repositorio `SailSwarm-ObstacleDetection` con scripts de entrenamiento y despliegue, pero no se proporciona una URL publica en la informacion disponible.
- La busqueda web realizada no arrojo enlaces adicionales relevantes.
