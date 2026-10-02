# RKNNAI/RK3588-CNN-yolov8n-obb

## Resumen

`RKNNAI/RK3588-CNN-yolov8n-obb` es un paquete de despliegue del modelo de deteccion de objetos YOLOv8n-obb convertido al formato RKNN para su ejecucion sobre la NPU del SoC Rockchip RK3588. No se trata de un modelo de lenguaje, sino de una red convolucional (CNN) de vision por computador orientada a la deteccion de objetos con cajas delimitadoras orientadas (oriented bounding boxes, OBB), es decir, rectangulos rotados que se ajustan mejor a objetos inclinados. El autor del repositorio es RKNNAI y el modelo procede de `airockchip/ultralytics_yolov8`, manteniendo la licencia original AGPL-3.0.

La relevancia de esta ficha es de tipo practico: el repositorio no publica pesos en `safetensors` ni `GGUF`, sino una configuracion de despliegue ya cuantizada en w8a8 y verificable mediante SHA-256, lista para integrarse en pipelines de inferencia embebida. Esto lo convierte en material de interes para desarrolladores que necesitan ejecutar deteccion de objetos rotados en hardware de borde con consumo reducido, en lugar de recurrir a GPUs de escritorio.

El unico modelo disponible en la version `v2.4.0` es la configuracion `yolov8n-obb-640x640-w8a8-1`, que opera a una resolucion de 640x640, emplea un solo nucleo NPU y requiere el runtime RKNN `v2.4.0`. El modelo esta pensado especificamente para el chip RK3588 y no para otras plataformas de la familia RKNN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLOv8n con cabeza OBB, detector de una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones en int8) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN |
| Resolucion de entrada | 640x640 |
| Chip soportado | RK3588 |
| Nucleos NPU | 1 |
| Version de runtime RKNN | v2.4.0 |
| Modelo de origen | airockchip/ultralytics_yolov8 |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv8 en su variante nano (`yolov8n`), una red convolucional de deteccion de una sola etapa con cuello de botella tipo C2f y cabeza de prediccion desacoplada. La variante OBB anade una rama de prediccion de angulo que permite estimar cajas delimitadoras rotadas en lugar de rectangulos alineados con los ejes, lo que resulta util para objetos inclinados. El repositorio no documenta en detalle el esquema de entrenamiento, el numero de tokens o ejemplos vistos, la composicion del dataset ni si se aplicaron tecnicas de ajuste fino especificas; esa informacion no esta disponible en la documentacion proporcionada.

Lo que si se detalla es el proceso de conversion: el modelo original se transforma a formato RKNN para el RK3588 aplicando la precision indicada en cada configuracion (w8a8). No se describen innovaciones adicionales como decodificacion especulativa ni mecanismos de atencion, ya que no son aplicables a este tipo de red convolucional. La documentacion unicamente garantiza la integridad de los ficheros mediante sumas SHA-256 y recomienda verificar el resultado antes del despliegue.

## Capacidades

- Deteccion de objetos con cajas delimitadoras orientadas (OBB): genera rectangulos rotados con angulo, clase y confianza para cada instancia detectada.
- Inferencia sobre NPU del RK3588 en formato RKNN, con aceleracion por hardware y una unica configuracion documentada.
- Cuantizacion w8a8 que reduce el coste computacional y de memoria en el dispositivo de borde.
- Integracion con la cadena de herramientas RKNPU SDK, que permite exportar el modelo y ejecutarlo tanto desde su API de Python como desde su CAPI.
- Compatibilidad con los ejemplos de despliegue del RKNN Model Zoo, incluyendo lectura de ficheros de video y flujos de camara.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni multilingues, dado que es un modelo puramente visual.
- No se documentan modos especiales como thinking mode, vision adicional, audio ni decodificacion especulativa.

## Casos de uso

- Deteccion de vehiculos y objetos en imagenes aereas o de satelite: la cabeza OBB permite ajustar cajas rotadas a coches, barcos o aviones que no estan alineados con los ejes de la imagen, mejorando la localizacion respecto a cajas alineadas.
- Monitorizacion de trafico en carreteras: integrado en camaras con RK3588, el modelo puede detectar y orientar vehiculos en tiempo real directamente en el dispositivo, sin enviar video a la nube.
- Inspeccion industrial de piezas: objetos colocados con orientacion arbitraria pueden localizarse y medirse mediante la caja rotada, facilitando el control de calidad automatico en lineas de produccion.
- Analitica de retail y aforo: deteccion de estanterias, productos o personas con orientacion variable en imagenes de camara fija dentro de un establecimiento.
- Agricultura de precision: identificacion de plantas, frutos o maquinaria en imagenes de dron, donde la orientacion de los objetos varia constantemente.
- Vigilancia perimetral: deteccion de intrusiones en entornos exteriores con camaras IP conectadas a un RK3588, aprovechando la NPU para procesar video en local y con baja latencia.
- Robotica movil: percepcion de obstaculos y objetos orientados sobre plataformas embebidas con RK3588, donde el consumo y el espacio son limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de mAP, precision, recall ni comparativas numericas con otros modelos. Tampoco se documentan latencias ni throughput concretos para el RK3588. Cualquier cifra de rendimiento deberia medirse directamente sobre el dispositivo de destino.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3588, que integra una NPU de 6 TOPS (3 nucleos en total, de los cuales esta configuracion emplea 1) junto con CPU ARM y GPU Mali.
- La inferencia se ejecuta en la NPU, no en GPU de escritorio; el modelo no esta pensado para A100, H100 ni RTX 4090.
- VRAM: no aplica; el modelo consume memoria del sistema o memoria compartida del SoC RK3588, aunque la model card no detalla la huella exacta de memoria.
- No cabe ni esta pensado para GPUs de consumo en el sentido habitual: su despliegue es en hardware embebido RK3588.
- Opciones de despliegue: RKNN Runtime con RKNPU SDK, mediante la API de Python o CAPI; existen ejemplos en el RKNN Model Zoo y demos como `rk3588-yolo-demo`. Requiere la version de runtime RKNN `v2.4.0`.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Verificacion de integridad: se recomienda ejecutar `sha256sum -c SHA256SUMS` antes del despliegue.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Cuantizacion | Chip objetivo | Licencia |
|---|---|---|---|---|---|
| RKNNAI/RK3588-CNN-yolov8n-obb | YOLOv8n con cabeza OBB | RKNN | w8a8 | RK3588 | AGPL-3.0 |
| yolov8n-obb original (airockchip/ultralytics_yolov8) | YOLOv8n con cabeza OBB | PyTorch/ONNX | FP32/FP16 (origen) | Multiples | AGPL-3.0 |
| Otras configuraciones RKNN del RKNN Model Zoo | Diversas CNN | RKNN | w8a8 segun configuracion | RK3562, RK3566, RK3568, RK3576, RK3588, RV1126B | AGPL-3.0 (mayoria) |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas de despliegue, formato y licencia.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el codigo fuente derivado bajo los mismos terminos; conviene revisarlo con atencion antes de integrarlo en un producto propietario.
- Compatibilidad restringida al RK3588: la model card indica que cada configuracion soporta solo los chips listados, por lo que no debe reutilizarse en otros SoC de la familia RKNN sin revalidacion.
- Cuantizacion w8a8: la precision int8 en pesos y activaciones puede degradar ligeramente la exactitud respecto al modelo original en FP32/FP16, especialmente en objetos pequenos o con angulos finos.
- Riesgo de alucinacion en el sentido de deteccion: puede producir falsos positivos o cajas mal orientadas en escenas con oclusion, baja iluminacion o clases no representadas en el entrenamiento original.
- No esta documentado el dataset de entrenamiento ni la cobertura de clases, por lo que no puede garantizarse el comportamiento ante dominios distintos al de entrenamiento.
- La huella de memoria, latencia y throughput reales no estan publicados; deben medirse en el dispositivo de destino.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y esta creado y actualizado con una diferencia de minutos, lo que sugiere una distribucion reciente y poco validada por la comunidad.
- Es un modelo de vision: no soporta texto, agentes, tool calling ni razonamiento; usar la estructura de ficha generica no debe llevar a confundirlo con un LLM.

## Enlaces

- HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolov8n-obb
- RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo
- Ejemplo YOLOv8 en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov8
- Modelo original (airockchip/ultralytics_yolov8): https://github.com/airockchip/ultralytics_yolov8
- Demo multi-hilo RK3588 con yolov8n-obb: https://github.com/kaylorchen/rk3588-yolo-demo/blob/master/src/yolov8/model/yolov8n-obb.rknn
- Documentacion Radxa RKNN Toolkit Lite2 YOLOv8 (Rock 5C): https://docs.radxa.com/en/rock5/rock5c/app-development/ai/rknn-toolkit-lite2-yolov8
- Documentacion Radxa RKNN Toolkit Lite2 YOLOv8 (Rock 5B): https://docs.radxa.com/en/rock5/rock5b/app-development/ai/rknn-toolkit-lite2-yolov8
- Run YOLOv8-obb on RK3588 (reComputer AI Lab): https://sensecraft.seeed.cc/ai-lab/en/models/yolov8-obb/rk3588
- ModelScope: descarga documentada en la propia model card bajo el modelo `RKNNAI/RK3588-CNN-yolov8n-obb`, revision `v2.4.0`
