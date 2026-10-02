# RKNNAI/RK3588-CNN-yolov5m

## Resumen

RK3588-CNN-yolov5m es un paquete de despliegue del detector de objetos YOLOv5m convertido al formato RKNN para ejecutarse sobre la NPU del SoC Rockchip RK3588. No se trata de un modelo de lenguaje ni de un modelo entrenado desde cero por el autor: es una distribucion de pesos y configuracion derivada del repositorio airockchip/yolov5, que a su vez parte de la familia YOLOv5 de Ultralytics. El repositorio lo publica el usuario RKNNAI y su proposito es ofrecer una configuracion lista para produccion en placas con RK3588, evitando al desarrollador el proceso de conversion y cuantizacion.

El modelo es una red convolucional (CNN) de una sola etapa para deteccion de objetos, con entrada fija de 640x640 pixeles y cuantizacion w8a8 (pesos y activaciones en 8 bits). La configuracion incluida, `yolov5m-640x640-w8a8-1`, esta pensada para el runtime RKNN v2.4.0 y utiliza un unico nucleo NPU del RK3588. El repositorio incluye unicamente la configuracion de despliegue y la documentacion, no los datos de entrenamiento ni el pipeline de entrenamiento.

Su relevancia actual es practica: el RK3588 es uno de los SoC mas habituales en placas SBC y equipos de borde con NPU integrada, y disponer de un artefacto RKNN verificado con SHA-256 reduce el trabajo de integracion en proyectos de vision embebida. La licencia GPL-3.0 heredada del modelo original es, sin embargo, una restriccion relevante para productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLOv5m, detector de objetos one-stage) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones en 8 bits) |
| Idiomas soportados | no aplica (modelo de vision; etiquetas de clase en ingles) |
| Licencia | GPL-3.0 |
| Formato de pesos | RKNN (formato propietario de Rockchip) |
| Tarea | Deteccion de objetos (bounding boxes + clase) |
| Modelo de origen | `https://github.com/airockchip/yolov5` |
| Configuracion incluida | `yolov5m-640x640-w8a8-1` |
| Resolucion de entrada | 640x640 |
| Chips soportados | RK3588 |
| Nucleos NPU utilizados | 1 |
| Version de runtime RKNN | v2.4.0 |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv5m, la variante de tamano medio de la familia YOLOv5 de Ultralytics: una red convolucional de una sola etapa que predice simultaneamente las cajas delimitadoras y las clases de objeto sobre una rejilla multi-escala. La model card no documenta el numero de parametros, la profundidad de la red ni la composicion exacta del backbone, por lo que esos detalles se consideran no disponibles. El autor clasifica el modelo como tipo CNN y lo remite al repositorio de airockchip, que es la bifurcacion mantenida por Rockchip para facilitar la exportacion a RKNN.

No hay informacion en el material proporcionado sobre el dataset de entrenamiento, el numero de tokens o imagenes vistas, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO (tecnicas, por otra parte, no aplicables a un detector de objetos). La innovacion tecnica del paquete no esta en el modelo en si, sino en el proceso de despliegue: conversion a RKNN, cuantizacion a w8a8 para aprovechar la ruta entera de 8 bits de la NPU, fijacion de la resolucion de entrada y publicacion de sumas SHA-256 para verificar la integridad de los ficheros antes de desplegarlos. Este ultimo punto es relevante en entornos de produccion embebida, donde la corrupcion de un artefacto binario es dificil de detectar a posteriori.

## Capacidades

- Deteccion de objetos en imagenes y fotogramas de video con cajas delimitadoras y etiquetas de clase.
- Inferencia sobre la NPU del RK3588 mediante el runtime RKNN v2.4.0, con la configuracion de un solo nucleo NPU.
- Entrada de imagen de resolucion fija 640x640; requiere el preprocesado correspondiente (redimensionado y normalizacion) antes de la inferencia.
- Cuantizacion w8a8, lo que reduce el uso de memoria y acelera la inferencia en la NPU a costa de cierta perdida de precision frente al modelo en coma flotante.
- Verificacion de integridad de los ficheros descargados mediante `sha256sum -c SHA256SUMS`.
- Exportacion y conversiones adicionales a traves de la cadena de herramientas RKNN Toolkit2.
- No dispone de generacion de texto, tool calling, funcion calling, razonamiento multi-paso, capacidades de agente ni comprension multilingue: no es un modelo generativo.
- No se documentan capacidades de segmentacion, estimacion de pose ni clasificacion de imagen; la model card solo describe deteccion con YOLOv5m.

## Casos de uso

- Videovigilancia en el borde: el modelo puede ejecutarse en una placa RK3588 alimentada por un stream RTSP y detectar intrusiones o contar personas sin enviar video a la nube, reduciendo el ancho de banda y los problemas de privacidad.
- Analitica de aforo en comercio: conteo de personas y estimacion de flujo de clientes en tiempo real sobre camaras ya instaladas, aprovechando la NPU para no cargar la CPU del equipo.
- Robotica movil y AGV: deteccion de obstaculos y de personas en la trayectoria de un robot autonomo, con inferencia local en la propia placa y latencia controlada por la NPU.
- Inspeccion industrial en linea de produccion: deteccion de defectos visibles o piezas mal posicionadas en una cinta transportadora, integrando la salida del detector con un PLC o un sistema MES.
- Agricultura de precision: deteccion de plagas, frutos o malas hierbas desde drones o tractores equipados con modulos RK3588, operando en campo sin conectividad.
- Control de accesos y conteo de ocupacion: verificacion de presencia y conteo de entradas en puertas o tornos, con la logica empresarial ejecutandose en el mismo dispositivo.
- Analisis de trafico y aparcamiento: deteccion de vehiculos y ocupacion de plazas en parkings, con alimentacion desde camaras IP existentes y despliegue en un unico nodo de borde.
- Prototipado rapido de productos de vision: servir como linea base verificada para validar una idea de producto antes de invertir en un modelo entrenado a medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (mAP, IoU), latencia ni throughput. Los resultados de busqueda mencionan un articulo de Hackster.io sobre la ejecucion de YOLOv5 en una placa RK3588 Blade 3 y una comparativa de referencia con TensorRT en plataformas NVIDIA Jetson AGX Xavier, pero no aportan cifras concretas en el material proporcionado.

## Requisitos de hardware

- Hardware de ejecucion obligatorio: SoC Rockchip RK3588 con NPU. El modelo no esta pensado para ejecutarse en GPU de escritorio ni en CPU convencional mediante este artefacto.
- No consume VRAM. El recurso que utiliza es la NPU del RK3588; la configuracion publicada emplea 1 nucleo NPU.
- No cabe en GPU de consumo porque no se ejecuta en GPU: la aceleracion proviene de la NPU del SoC. Para GPUs NVIDIA u otras plataformas habria que exportar el modelo original a otro formato.
- Version de runtime requerida: RKNN Runtime v2.4.0 para esta configuracion concreta.
- Opciones de despliegue: RKNN Toolkit2 para la conversion en el PC de desarrollo, RKNN Toolkit Lite2 para la API Python en el dispositivo, API C para integracion en aplicaciones nativas y los ejemplos del repositorio rknn_model_zoo.
- Almacenamiento y memoria: el repositorio figura como 0.0 GB en HuggingFace, aunque el peso real corresponde a los ficheros dentro de `yolov5m-640x640-w8a8-1/`, cuyo tamano no se detalla en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Entrada | Cuantizacion | Plataforma objetivo | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| RK3588-CNN-yolov5m (este) | Deteccion de objetos | 640x640 | w8a8 | RK3588 (1 nucleo NPU) | GPL-3.0 | no disponible |
| YOLOv5s (RKNN, rknn_model_zoo) | Deteccion de objetos | no disponible | no disponible | RK3588 y otras | GPL-3.0 | no disponible |
| YOLOv5l (RKNN, rknn_model_zoo) | Deteccion de objetos | no disponible | no disponible | RK3588 y otras | GPL-3.0 | no disponible |
| YOLOv5 con TensorRT (NVIDIA Jetson) | Deteccion de objetos | no disponible | no disponible | Jetson AGX Xavier | GPL-3.0 | no disponible |

La comparativa se limita a la variante de tamano dentro de la misma familia (YOLOv5s mas ligera, YOLOv5m intermedia, YOLOv5l mas pesada) y al backend de ejecucion (NPU Rockchip frente a GPU NVIDIA con TensorRT). No se dispone de cifras de parametros, latencia ni precision para ninguna de las alternativas en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia GPL-3.0: es una licencia copyleft fuerte. Un producto que distribuya el modelo modificado o enlazado de forma que se considere obra derivada puede verse obligado a liberar el codigo fuente bajo los mismos terminos. Conviene revisar la implicacion legal antes de un uso comercial propietario.
- Modelo de vision, no generativo: no hay riesgo de alucinacion en el sentido de los modelos de lenguaje, pero si de falsos positivos y falsos negativos en la deteccion.
- Cuantizacion w8a8: la conversion a 8 bits puede degradar la precision respecto al modelo en coma flotante original, especialmente en objetos pequenos o de bajo contraste. No se proporcionan metricas de esa perdida.
- Resolucion de entrada fija de 640x640: objetos muy pequenos en imagenes de alta resolucion pueden perderse si no se aplica un teselado previo.
- Dependencia de hardware: la configuracion solo soporta RK3588. No es portable a otras NPU ni a GPUs sin volver a exportar el modelo.
- Sesgos: no se documenta la composicion del dataset de entrenamiento original de YOLOv5m, por lo que se heredan los sesgos de dicho dataset (posible infrarrepresentacion de determinadas demografias, entornos o condiciones de iluminacion). No hay informacion al respecto en el material proporcionado.
- Idioma de las etiquetas: las clases de COCO estan en ingles; no se documenta soporte multiidioma ni etiquetado alternativo.
- Version de runtime acoplada: la configuracion esta fijada a RKNN Runtime v2.4.0, lo que puede generar incompatibilidades con SDK mas recientes o anteriores.
- Repositorio con 0 descargas y 0 likes y sin pipeline declarado: es un artefacto reciente y sin validacion comunitaria visible, por lo que la verificacion por parte del integrador es imprescindible.
- Se recomienda ejecutar la verificacion SHA-256 incluida antes de cualquier despliegue, ya que se trata de un binario de confianza no auditado.

## Enlaces

- HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolov5m
- Modelo de origen (airockchip/yolov5): https://github.com/airockchip/yolov5
- RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo
- Ejemplo de YOLOv5 en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/blob/main/examples/yolov5/README.md
- Documentacion de Radxa sobre RKNN Toolkit Lite2 y YOLOv5 (Rock 5B): https://docs.radxa.com/en/rock5/rock5b/app-development/ai/rknn-toolkit-lite2-yolov5
- Documentacion de Radxa sobre RKNN Toolkit Lite2 y YOLOv5 (Rock 5A): https://docs.radxa.com/en/rock5/rock5a/app-development/ai/rknn-toolkit-lite2-yolov5
- Articulo en Hackster.io sobre la ejecucion de YOLOv5 en una placa RK3588 Blade 3: https://www.hackster.io/Mixtile/running-yolov5-on-rk3588-blade-3-single-board-8477ad
- Repositorio de ModelScope: referenciado en la model card como `RKNNAI/RK3588-CNN-yolov5m`, revision v2.4.0 (URL completa no especificada en la informacion disponible)
