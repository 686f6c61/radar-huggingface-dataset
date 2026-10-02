# RKNNAI/RK3588-CNN-yolov8n

## Resumen

RK3588-CNN-yolov8n es un paquete de despliegue del detector de objetos YOLOv8n en formato RKNN, preparado especificamente para ejecutarse sobre la NPU del SoC Rockchip RK3588. No se trata de un modelo entrenado desde cero ni de un modelo de lenguaje: es una conversion y cuantizacion del modelo YOLOv8n publicado por airockchip (fork de Ultralytics YOLOv8) a la representacion que consume el runtime RKNPU. El autor del repositorio es RKNNAI y el artefacto se distribuye bajo licencia AGPL-3.0.

El problema que resuelve es de despliegue en el borde: permite ejecutar deteccion de objetos en tiempo real sobre hardware embebido de bajo consumo sin necesidad de GPU dedicada, aprovechando la NPU integrada del RK3588. La configuracion disponible es `yolov8n-640x640-w8a8-1`, con entrada de imagen de 640x640 pixeles, cuantizacion de pesos y activaciones a 8 bits (w8a8) y un unico nucleo NPU asignado. El runtime RKNN objetivo es la version v2.4.0.

La relevancia actual es practica: la familia RK3588 se usa ampliamente en placas SBC y dispositivos industriales, y disponer de un artefacto RKNN verificado con sumas SHA-256 reduce la friccion de integracion en productos de vision embebida. Hay que tener en cuenta que el repositorio no publica resultados de benchmarks, ni ficha de precision por clase, ni detalles del proceso de calibracion de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (detector YOLOv8, variante nano); tipo declarado en la model card como "CNN" |
| Parametros totales | no disponible (la model card no declara el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen fija de 640x640 px) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no aplica (modelo de vision); documentacion en ingles y chino |
| Licencia | AGPL-3.0 (licencia upstream GNU AGPL v3) |
| Formato de pesos | RKNN (artefacto para RKNPU SDK / rknn-toolkit2); modelo origen en ONNX/PyTorch |

Datos de despliegue de la configuracion disponible:

| Parametro | Valor |
|---|---|
| Identificador de configuracion | `yolov8n-640x640-w8a8-1` |
| Chips soportados | RK3588 |
| Version de runtime RKNN | v2.4.0 |
| Nucleos NPU asignados | 1 |
| Resolucion de entrada | 640x640 |
| Modelo fuente | `https://github.com/airockchip/ultralytics_yolov8` |
| Version de descarga (revision) | v2.4.0 |
| Tamano del repositorio | 0,0 GB (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

La model card declara unicamente que el tipo de modelo es CNN y que el modelo fuente procede del repositorio `airockchip/ultralytics_yolov8`, que a su vez deriva de Ultralytics YOLOv8. YOLOv8n es la variante mas pequena de la familia YOLOv8 y esta disenada para inferencia en dispositivos con recursos limitados. El artefacto distribuido en este repositorio no es el modelo original, sino el resultado de convertirlo a formato RKNN y cuantizarlo a w8a8 para el RK3588; el proceso de conversion se realiza en PC con `rknn-toolkit2` y la inferencia en dispositivo con la API de `rknn-toolkit-lite2` o la C API del RKNPU SDK.

No se dispone de informacion en la documentacion proporcionada sobre el dataset de entrenamiento, el numero de tokens o imagenes, la composicion del conjunto de datos, ni sobre si hubo fases de ajuste fino, RLHF o DPO. Tampoco se detalla el conjunto de calibracion usado para la cuantizacion w8a8, dato critico porque determina la perdida de precision respecto al modelo en punto flotante. La innovacion tecnica del paquete es exclusivamente de despliegue: conversion a RKNN, cuantizacion entera de 8 bits y verificacion de integridad mediante `SHA256SUMS`.

## Capacidades

- Deteccion de objetos en imagenes de 640x640 pixeles, con salida de cajas delimitadoras y clases (el numero y la lista de clases depende del modelo fuente, no se detalla en la model card).
- Inferencia acelerada por NPU en el SoC RK3588, con un nucleo NPU asignado en esta configuracion.
- Ejecucion en el borde (edge) sin GPU dedicada, adecuada para dispositivos embebidos y sistemas alimentados por bateria.
- Integracion mediante RKNPU SDK: ejemplos de Python API y C API disponibles en `rknn_model_zoo`.
- Verificacion de integridad del artefacto descargado mediante sumas SHA-256 incluidas en `SHA256SUMS`.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso.
- No dispone de capacidades multilingues (no procesa lenguaje natural).
- No dispone de capacidades multimodales de vision-lenguaje, audio ni modo de pensamiento.

## Casos de uso

- Videovigilancia inteligente en camaras IP: el modelo procesa fotogramas de 640x640 en la NPU del RK3588 y devuelve cajas delimitadoras para deteccion de personas o vehiculos. Al ejecutarse en el propio dispositivo, evita enviar video a la nube y reduce el ancho de banda y los problemas de privacidad.
- Robotica movil y AGV: deteccion de obstaculos y objetos en tiempo real sobre una SBC RK3588 integrada en el robot. La NPU dedicada deja la CPU libre para el control de motores y la planificacion de trayectoria.
- Control de calidad en linea de produccion: inspeccion de piezas en cinta transportadora detectando presencia, ausencia o posicion de componentes. El formato w8a8 reduce el consumo y permite montar varias camaras sobre el mismo SoC.
- Conteo y analitica de aforo en retail: conteo de personas por zona a partir de camaras fijas, con procesamiento local y agregacion de metricas hacia un backend. El modelo nano mantiene latencias bajas en hardware de bajo coste.
- Agricultura de precision: deteccion de frutos, malas hierbas o plagas desde camaras montadas en maquinaria agricola. El RK3588 tolera condiciones de campo mejor que una GPU de sobremesa en cuanto a consumo y robustez de despliegue.
- Sistemas de asistencia a la conduccion de bajo coste: deteccion de vehiculos, peatones y senales en prototipos y flotas experimentales, usando el RK3588 como plataforma de vision sin depender de modulos automotrices caros.
- Automatizacion de accesos y domotica: deteccion de presencia para activar iluminacion, apertura de puertas o alarmas, ejecutada localmente en un hub domestico.
- Analisis de trafico urbano en nodos de borde: clasificacion y conteo de vehiculos por carril en controladores de semaforo o estaciones de medicion distribuidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye valores de mAP, precision por clase, latencia ni throughput. Tampoco se publica la comparacion entre el modelo en punto flotante y el modelo cuantizado w8a8, por lo que no es posible cuantificar la perdida de precision introducida por la cuantizacion.

## Requisitos de hardware

- VRAM: no aplica. El modelo no esta pensado para GPU; se ejecuta sobre la NPU del RK3588 mediante el runtime RKNN v2.4.0.
- Plataforma objetivo: SoC Rockchip RK3588 exclusivamente, segun la configuracion publicada. Otras plataformas soportadas por RKNN Model Zoo (RK3562, RK3566, RK3568, RK3576, RV1126B, y con soporte limitado RV1103, RV1106, RV1109, RV1126, RK1808) no estan cubiertas por esta configuracion concreta.
- Nucleos NPU: 1 nucleo asignado en la configuracion `yolov8n-640x640-w8a8-1`.
- No cabe ni esta pensado para GPUs de consumo como RTX 4090, ni para A100 o H100: el artefacto RKNN es especifico de RKNPU.
- Conversion del modelo: se realiza en PC con `rknn-toolkit2`; la inferencia en dispositivo requiere `rknn-toolkit-lite2` (Python) o la C API del RKNPU SDK. Los ejemplos de referencia estan en `rknn_model_zoo/examples/yolov8`.
- Descarga: disponible via HuggingFace (`hf download`) y ModelScope (`modelscope download`), usando la revision `v2.4.0`.
- Latencia y throughput: no disponible. No se publican mediciones de FPS ni de milisegundos por inferencia para esta configuracion.
- Almacenamiento: el repositorio se reporta como 0,0 GB en los metadatos de HuggingFace, aunque contiene directorios de configuracion y ficheros de sumas de verificacion.
- Nota de integracion: en modo fisico de la NPU del RK3588 se ha reportado en foros de la comunidad un problema con el nodo `model.22` (etapa de post-procesado de generacion de cajas) que obliga a eliminar dicho nodo del grafo y reprogramar el post-procesado en la aplicacion. Conviene validarlo antes de produccion.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Cuantizacion | Plataforma objetivo | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| RKNNAI/RK3588-CNN-yolov8n | CNN (YOLOv8n) | RKNN | w8a8 | RK3588 | AGPL-3.0 | no disponible |
| Modelo fuente airockchip/ultralytics_yolov8 | CNN (YOLOv8n) | ONNX / PyTorch | punto flotante | multiplataforma | AGPL-3.0 | no disponible en la informacion proporcionada |
| Otras configuraciones de `rknn_model_zoo/examples/yolov8` | CNN (YOLOv8) | RKNN | segun configuracion | RK3562, RK3566, RK3568, RK3576, RK3588, RV1126B | AGPL-3.0 | no disponible |

No se dispone de datos comparativos de mAP, latencia o consumo entre estas alternativas en la informacion proporcionada. La comparacion se limita, por tanto, a formato, plataforma y licencia.

## Limitaciones y advertencias

- La licencia upstream es GNU AGPL v3, una licencia copyleft fuerte. El uso del modelo en un servicio ofrecido por red obliga a liberar el codigo fuente correspondiente bajo los terminos de la AGPL. Es un obstaculo relevante para productos propietarios o SaaS cerrado.
- La model card no especifica el numero de parametros, el dataset de entrenamiento ni la lista de clases detectables. Sin esa informacion no es posible evaluar si el modelo cubre las clases necesarias para un caso de uso concreto.
- No se publican metricas de precision (mAP) ni la comparacion con el modelo en punto flotante. La cuantizacion w8a8 puede degradar la deteccion de objetos pequenos o de baja frecuencia, y no hay datos para estimar esa perdida.
- No se documenta el conjunto de calibracion usado en la cuantizacion, factor determinante en la calidad final del artefacto.
- La configuracion publicada esta limitada al RK3588. No es portable a otras NPU ni a GPU sin volver a convertir el modelo fuente.
- Se ha reportado en la comunidad un comportamiento problematico en el nodo `model.22` (post-procesado) al ejecutar en modo fisico de la NPU del RK3588, con soluciones que implican eliminar el nodo del grafo y reimplementar el post-procesado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion son muy proximas entre si: no hay historial de mantenimiento ni validacion por parte de terceros.
- Riesgo de sesgo y de alucinacion: no aplica el concepto de alucinacion de texto, pero si el sesgo de dominio heredado del dataset de entrenamiento original, que no se documenta. Un detector entrenado en un dominio concreto puede fallar sistematicamente en condiciones de iluminacion, clima o geografia distintas.
- Antes de desplegar en produccion, es imprescindible verificar las sumas SHA-256 con `sha256sum -c SHA256SUMS` y validar el modelo con imagenes representativas del dominio real de aplicacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolov8n
- Modelo fuente (airockchip/ultralytics_yolov8): https://github.com/airockchip/ultralytics_yolov8
- Ejemplos de YOLOv8 en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov8
- Repositorio RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo
- Documentacion de Radxa, RKNN Toolkit Lite2 con YOLOv8 en ROCK 5C: https://docs.radxa.com/en/rock5/rock5c/app-development/ai/rknn-toolkit-lite2-yolov8
- Documentacion de Radxa, despliegue de YOLOv8 en ROCK 5B: https://docs.radxa.com/en/rock5/rock5b/app-development/ai/rknn-toolkit-lite2-yolov8
- Hilo de la comunidad Radxa sobre YOLOv8 en la NPU del RK3588: https://forum.radxa.com/t/use-yolov8-in-rk3588-npu/15838
