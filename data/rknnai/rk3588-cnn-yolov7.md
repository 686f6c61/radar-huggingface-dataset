# RKNNAI/RK3588-CNN-yolov7

## Resumen

RK3588-CNN-yolov7 es un paquete de despliegue del detector de objetos YOLOv7 convertido al formato RKNN para ejecutarse sobre la NPU de los SoC Rockchip RK3588. Lo publica el usuario RKNNAI en HuggingFace y su modelo origen es el repositorio airockchip/yolov7, integrado dentro del RKNN Model Zoo oficial de Rockchip. No se trata de un modelo de lenguaje generativo, sino de una red neuronal convolucional (CNN) de deteccion de objetos, por lo que conceptos como contexto, tokens o idiomas no aplican.

El repositorio distribuye una unica configuracion, `yolov7-640x640-w8a8-1`, cuantizada a w8a8 (INT8 en pesos y activaciones), a resolucion de entrada 640x640 y ejecutable sobre un solo nucleo NPU del RK3588, con el runtime RKNN v2.4.0. La conversion desde PyTorch a RKNN la realiza la cadena de herramientas de Rockchip, y el resultado es un artefacto listo para inferencia en placa.

Su relevancia es practica: permite llevar deteccion de objetos en tiempo real a dispositivos edge con NPU de bajo consumo (placas RK3588/RK3588S) sin depender de GPU, algo habitual en videovigilancia, robotica o vision industrial. La licencia es GPL-3.0, heredada del modelo origen, lo que condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (detector de objetos YOLOv7) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision no generativo) |
| Tipos de cuantizacion | w8a8 (INT8 en pesos y activaciones) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | GPL-3.0 |
| Formato de pesos | RKNN (runtime v2.4.0) |
| Tipo de modelo | CNN |
| Resolucion de entrada | 640x640 |
| Nucleos NPU | 1 |
| Chips soportados | RK3588 |
| Modelo origen | airockchip/yolov7 |

## Arquitectura y entrenamiento

YOLOv7 es un detector de objetos de una sola etapa (single-stage) basado en una red convolucional con un cabezal de deteccion anclado, disenado para equilibrar precision y velocidad de inferencia. La variante distribuida aqui conserva la topologia del modelo origen airockchip/yolov7, pero ha sido convertida a un grafo RKNN optimizado para la NPU del RK3588 y cuantizada a precision w8a8 para reducir latencia y consumo.

La informacion disponible no detalla datos de entrenamiento (numero de imagenes, composicion del dataset COCO u otro, ni tecnicas de ajuste fino). Tampoco se documenta si hubo etapas de destilacion, poda o calibracion especifica mas alla del proceso estandar de cuantizacion RKNN. La innovacion tecnica del paquete reside en el propio pipeline de conversion y despliegue sobre NPU, no en el modelo en si: se entrega con verificacion SHA-256 y una configuracion cerrada de runtime, resolucion y cuantizacion para garantizar reproducibilidad.

## Capacidades

- Deteccion de objetos en imagenes y flujo de video, con clases definidas por el modelo origen (tipicamente las 80 clases de COCO; no confirmado en la informacion disponible).
- Inferencia sobre la NPU del RK3588 mediante el runtime RKNN v2.4.0.
- Ejecucion con una unica configuracion probada: entrada 640x640, un nucleo NPU, cuantizacion w8a8.
- Integracion en pipelines de vision por computador en C++ y Python a traves de RKNN Runtime y rknn_toolkit_lite2.
- Verificacion de integridad del artefacto mediante sumas SHA-256 antes del despliegue.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues: es exclusivamente un modelo de vision por computador.

## Casos de uso

- Videovigilancia en borde: la deteccion se ejecuta integramente en la NPU del RK3588, sin enviar video a la nube, lo que reduce latencia y mejora la privacidad. Adecuado para camaras IP con SoC Rockchip.
- Robotica movil autonoma: deteccion de obstaculos, personas u objetos en tiempo real sobre una placa de bajo consumo, integrable en la bucla de navegacion mediante llamadas desde C++ al runtime RKNN.
- Vision industrial y control de calidad: inspeccion de piezas en linea de produccion sobre hardware embebido, aprovechando la resolucion 640x640 para deteccion de objetos de tamano medio.
- Analitica de trafico y conteo de vehiculos: procesamiento de flujos de video en puertas de acceso o carreteras, con deteccion por fotograma y post-procesado propio del integrador.
- Agricultura de precision: deteccion de plagas, frutos o malas hierbas con drones o dispositivos de campo equipados con RK3588 que operan sin conectividad.
- Sistemas de alerta y domotica: deteccion de presencia o intrusion en dispositivos de seguridad domotica que requieren bajo consumo y arranque rapido.
- Prototipado de edge AI: base de referencia para comparar configuraciones de cuantizacion (por ejemplo, w8a8 frente a otras precisiones) al migrar modelos de deteccion a plataformas Rockchip.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan valores de mAP, precision/recall, latencia por inferencia ni throughput en la model card ni en los resultados de busqueda consultados. No se deben asumir cifras de COCO para esta configuracion concreta.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3588 (la model card confirma unicamente soporte para RK3588; otros SoC Rockchip como RV1106 o RK3562 aparecen soportados por proyectos alternativos, no por esta configuracion).
- Acelerador: NPU integrada del RK3588, configurada para 1 nucleo en esta variante.
- Runtime: RKNN Runtime v2.4.0, obligatorio para usar el artefacto tal como se distribuye.
- Cadena de herramientas: rknn_toolkit_lite2 (se menciona la version 1.4.0 en material externo para despliegue en aarch64, no confirmado para este paquete concreto).
- VRAM: no aplica; no requiere GPU dedicada ni memoria de video, ya que la inferencia se ejecuta en NPU.
- GPU de escritorio: no es necesaria para el despliegue; puede utilizarse una maquina de desarrollo (con GPU NVIDIA, por ejemplo) solo para conversion o validacion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Opciones de despliegue: RKNN Runtime sobre RK3588, con ejemplos C++ y Python; la descarga se realiza via HuggingFace CLI o ModelScope con la revision v2.4.0.

## Comparativa con modelos similares

| Alternativa | Tipo | Plataforma | Cuantizacion | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| RKNNAI/RK3588-CNN-yolov7 (este modelo) | CNN YOLOv7 -> RKNN | RK3588, 1 nucleo NPU | w8a8 | GPL-3.0 | unica configuracion: 640x640 |
| thnak/yolov7-rknn | CNN YOLOv7 -> RKNN | RK3566, RK3568, RK3588, RK3588S, RV1103, RV1106, RK3562 | no disponible | no disponible en la busqueda | soporta mas plataformas Rockchip |
| yolov7 original (airockchip/yolov7) | CNN YOLOv7 (PyTorch) | GPU/CPU | FP32/FP16 | GPL-3.0 (heredada) | modelo origen, sin conversion RKNN |

No se dispone de cifras de mAP, latencia ni consumo para comparar numericamente estas opciones. Las alternativas se listan por categoria de despliegue, no por rendimiento medido.

## Limitaciones y advertencias

- La licencia GPL-3.0 impone obligaciones copyleft: integrar el modelo en un producto propietario puede exigir la liberacion del codigo derivado. Conviene revisar el cumplimiento antes de uso comercial.
- La model card limita el soporte a RK3588 con la configuracion w8a8 y runtime v2.4.0; usar ficheros de configuraciones distintas o versiones de runtime no coincidentes puede provocar fallos.
- El repositorio aparece con un tamano de 0,0 GB y 0 descargas, por lo que la disponibilidad y el contenido real del artefacto deben verificarse; la descarga exige la revision v2.4.0.
- No se documentan datos de entrenamiento, sesgos, clases objetivo ni metricas de precision, lo que impide evaluar su calidad de deteccion sin pruebas propias.
- Como todo detector cuantizado a INT8, la cuantizacion w8a8 puede degradar ligeramente la precision respecto al modelo en FP32/FP16, especialmente en objetos pequenos.
- Riesgo de falsos positivos o negativos en condiciones de baja iluminacion, oclusion o dominios visuales distintos a los del dataset de entrenamiento original.
- No es un modelo generativo: no admite dialogo, razonamiento, codigo ni capacidades multilingues.
- No se especifica el esquema de post-procesado (NMS, umbrales de confianza) ni las clases soportadas; debe validarse en el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolov7
- Modelo origen: https://github.com/airockchip/yolov7
- RKNN Model Zoo (ejemplo yolov7): https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov7
- Descarga via ModelScope: https://modelscope.cn/models/RKNNAI/RK3588-CNN-yolov7
- Proyecto alternativo yolov7-rknn: https://github.com/thnak/yolov7-rknn
- Ejemplos rk3588-example (yolov7): https://github.com/exyexin/rk3588-example/blob/main/examples/yolov7/README.md
- Tutorial de despliegue CNN en RK3588 (Seeed reComputer AI Lab): https://sensecraft.seeed.cc/ai-lab/en/tools/rk/rk3588-cnn-rknn2-deploy
- Guia practica de YOLOv7 en RK3588 (CSDN): https://blog.csdn.net/y7z8a9/article/details/162779341
