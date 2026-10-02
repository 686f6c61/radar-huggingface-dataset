# RKNNAI/RK3588-CNN-yolov5s

## Resumen

RK3588-CNN-yolov5s es un paquete de despliegue del detector de objetos YOLOv5s convertido al formato RKNN para ejecutarse sobre la NPU del SoC Rockchip RK3588. Lo publica el usuario RKNNAI en HuggingFace y deriva del repositorio oficial airockchip/yolov5, a su vez integrado en el RKNN Model Zoo de Rockchip. No se trata de un modelo de lenguaje ni de un modelo generativo, sino de una red convolucional (CNN) de deteccion de objetos en una sola pasada, optimizada para inferencia en hardware de borde.

La relevancia de esta ficha es acotada: no aporta pesos nuevos ni un entrenamiento propio, sino una configuracion de cuantizacion y tiempo de ejecucion concretos. En concreto, ofrece el binario `yolov5s-640x640-w8a8-1`, cuantizado en modo w8a8 (activaciones y pesos a 8 bits), a resolucion de entrada 640x640, pensado para usar un unico nucleo de la NPU del RK3588 con la version de runtime RKNN v2.4.0.

El repositorio tiene un tamano declarado de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y se distribuye bajo licencia GPL-3.0. Es, por tanto, un artefacto de despliegue para integradores que ya trabajan con RK3588, mas que un modelo destinado a evaluacion comparativa general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (detector de objetos en una sola pasada, familia YOLOv5s) |
| Parametros totales | no disponible en la ficha (variante YOLOv5s de referencia: del orden de 7 M, dato externo no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no aplica |
| Licencia | GPL-3.0 |
| Formato de pesos | RKNN |
| Tipo de modelo | CNN |
| Modelo de origen | airockchip/yolov5 (GitHub) |
| Resolucion de entrada | 640x640 |
| Nucleos NPU | 1 |
| Version de runtime RKNN | v2.4.0 |
| Chips soportados | RK3588 |
| Configuracion disponible | yolov5s-640x640-w8a8-1 |
| Verificacion de integridad | SHA-256 (fichero SHA256SUMS) |

## Arquitectura y entrenamiento

El artefacto es una conversion a RKNN del modelo YOLOv5s, un detector de objetos convolucional de una sola etapa. La topologia canonica de YOLOv5s combina un backbone de tipo CSPDarknet, un cuello de red tipo PANet para la fusion de caracteristicas multiescala y una cabeza de deteccion que predice cajas delimitadoras y clases en varias escalas espaciales. La variante "s" es la mas ligera de la familia YOLOv5 en cuanto a anchura y profundidad de canales, lo que la hace adecuada para dispositivos de borde con presupuesto de computo y memoria reducido. La informacion proporcionada no detalla el numero exacto de parametros, capas ni operaciones FLOPs de esta conversion concreta.

En cuanto al entrenamiento, la ficha no aporta informacion sobre el dataset utilizado, el numero de tokens o imagenes de entrenamiento, ni sobre tecnicas de ajuste como RLHF o DPO (no aplicables a un detector). El modelo de origen es el repositorio airockchip/yolov5, orientado a exportacion y despliegue en hardware Rockchip. La innovacion tecnica de esta distribucion no esta en el modelo en si, sino en el proceso de optimizacion para NPU: conversion a RKNN, cuantizacion de enteros w8a8 y asignacion a un unico nucleo de la NPU, con la version de runtime RKNN v2.4.0 como requisito.

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica multiples objetos en una sola pasada sobre entradas de 640x640.
- Inferencia en hardware de borde: ejecucion sobre la NPU del RK3588 mediante el runtime RKNN.
- Cuantizacion int8 (w8a8): reduce el uso de memoria y acelera la inferencia en NPU, a costa de una posible perdida de precision frente a punto flotante.
- Ejecucion en un solo nucleo NPU: configuracion optimizada para usar un unico nucleo del RK3588.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision-lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingues (no aplica).
- Sin modo "thinking", salida de audio ni otras capacidades generativas.

## Casos de uso

- Videovigilancia en el borde: el modelo puede ejecutarse directamente sobre un dispositivo RK3588 conectado a una camara IP para detectar personas, vehiculos u objetos en tiempo real, evitando enviar video a la nube y reduciendo latencia y coste de ancho de banda.
- Analitica de retail: conteo de personas y seguimiento de aforo en tiendas mediante un nodo RK3588 local, con la deteccion como paso previo a un modulo de conteo o tracking.
- Control de calidad industrial: deteccion de defectos o piezas mal posicionadas en una linea de produccion, aprovechando la NPU integrada para operar sin GPU dedicada y en entornos con restricciones de consumo.
- Monitorizacion de trafico: conteo y clasificacion de vehiculos en carretera o interseccion sobre hardware embebido de bajo consumo, adecuado para postes o gabinetes remotos.
- Robotica movil y AGV: percepcion de obstaculos y objetos en robots autonomos basados en RK3588, donde el modelo actua como modulo de deteccion de bajo nivel integrado en el bucle de navegacion.
- Agricultura de precision: deteccion de frutos, malas hierbas o plagas desde drones o estaciones de campo con energia limitada, apoyandose en la eficiencia energetica de la NPU.
- Domotica y seguridad del hogar: deteccion de intrusiones o eventos relevantes en un hub local RK3588, sin dependencia de servicios en la nube.
- Sistemas de acceso y control: deteccion de presencia como etapa previa a un pipeline de reconocimiento facial o de matricula ejecutado en el mismo SoC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (mAP), latencia ni throughput para la configuracion `yolov5s-640x640-w8a8-1`, por lo que no es posible presentar una tabla comparativa con datos verificados.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3588, con NPU integrada de 6 TOPS (INT8) repartidos en tres nucleos. Esta configuracion concreta usa 1 nucleo NPU.
- No esta pensado para GPU de escritorio ni para tarjetas tipo RTX, A100 o H100: el formato RKNN solo se ejecuta en hardware Rockchip compatible.
- No aplica el concepto de VRAM de GPU; el modelo se ejecuta sobre la memoria compartida del SoC RK3588 y su NPU.
- Runtime requerido: RKNN Runtime v2.4.0 (version indicada en la configuracion).
- Despliegue: a traves del RKNN Model Zoo de Rockchip y del runtime RKNN; no se mencionan soportes de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Consumo y termica: propios de un SoC de borde; no se aportan cifras especificas.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Cuantizacion | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RK3588-CNN-yolov5s | CNN (YOLOv5s) | 640x640 | w8a8 | RK3588 (RKNN v2.4.0) | GPL-3.0 | HuggingFace / ModelScope |
| yolov5s RKNN de rknpu2 (Rockchip) | CNN (YOLOv5s) | segun ejemplo | segun ejemplo | RK3588 | segun repositorio | GitHub (rockchip-linux/rknpu2) |
| yolov5_for_rk3588 (0312birdzhang) | CNN (YOLOv5) | segun configuracion | no disponible | RK3588 | segun repositorio | GitHub |

Existen otros detectores de la propia familia (YOLOv5n, YOLOv5m, YOLOv8, YOLO11) y conversiones equivalentes a RKNN, pero la informacion proporcionada no incluye datos de precision ni rendimiento que permitan una comparacion cuantitativa fiable. La comparativa se limita, por tanto, a plataforma, formato y licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona; cualquier uso conversacional queda fuera de su alcance.
- La cuantizacion w8a8 puede degradar la precision de deteccion respecto a la version en punto flotante; no se aportan datos de mAP para cuantificar esa perdida.
- Dependencia estricta del hardware: solo funciona en chips RK3588 y con la version de runtime indicada (RKNN v2.4.0). No es portable a GPU de escritorio ni a otros aceleradores sin reconversion.
- La ficha advierte de que deben usarse ficheros de la misma configuracion; mezclar versiones puede provocar fallos de despliegue.
- Rendimiento dependiente de la calibracion de cuantizacion: al no documentarse el dataset de calibracion, se desconoce su comportamiento en dominios alejados del conjunto de entrenamiento original.
- Sesgos: no disponible; no se documenta el dataset de entrenamiento ni su composicion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de falsos positivos y falsos negativos propios de un detector de objetos.
- Licencia GPL-3.0: impone obligaciones de copyleft. Su integracion en productos propietarios puede requerir revision legal, ya que la GPL exige distribuir el codigo derivado bajo la misma licencia.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- No se incluyen datos de latencia, throughput ni consumo, imprescindibles para dimensionar un despliegue en produccion.
- La verificacion de integridad mediante SHA256SUMS se marca como paso obligatorio antes del despliegue segun la propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolov5s
- Perfil del autor en HuggingFace: https://huggingface.co/RKNNAI
- Modelo de origen (airockchip/yolov5): https://github.com/airockchip/yolov5
- RKNN Model Zoo (ejemplo yolov5): https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov5
- Ejemplos RKNN YOLOv5 para RK3588 en rknpu2: https://github.com/rockchip-linux/rknpu2/tree/master/examples/rknn_yolov5_demo/model/RK3588
- Guia de despliegue de modelos CNN en RK3588 (Seeed SenseCraft): https://sensecraft.seeed.cc/ai-lab/en/tools/rk/rk3588-cnn-rknn2-deploy
- Repositorio yolov5_for_rk3588: https://github.com/0312birdzhang/yolov5_for_rk3588
