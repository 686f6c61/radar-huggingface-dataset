# RKNNAI/RK3588-CNN-yolox-s

## Resumen

RK3588-CNN-yolox-s es un paquete de despliegue del detector de objetos YOLOX-s convertido al formato RKNN para ejecutarse sobre la NPU del SoC Rockchip RK3588. No es un modelo de lenguaje: se trata de una red neuronal convolucional (CNN) de detección de objetos en una sola etapa, publicada por el usuario RKNNAI dentro del ecosistema RKNN Model Zoo. El repositorio no distribuye pesos en safetensors ni GGUF, sino configuraciones listas para inferencia en NPU (ficheros RKNN cuantizados) junto con scripts y comprobaciones de integridad SHA-256.

El modelo resuelve detección de objetos en el borde (edge), un escenario donde no es viable enviar vídeo a la nube ni ejecutar GPUs dedicadas. Está pensado para placas con RK3588, que integra tres núcleos NPU con hasta 6 TOPS INT8 en total; las configuraciones publicadas usan un único núcleo NPU y cuantización w8a8, con dos resoluciones de entrada: 384x640 y 640x640. El runtime RKNN requerido es la versión v2.4.0.

Su relevancia es práctica más que algorítmica: YOLOX-s es un detector anchor-free consolidado, y este repositorio aporta la conversión, cuantización y verificación necesarias para llevarlo a producción sobre hardware Rockchip con licencia Apache 2.0, lo que permite uso comercial. El repositorio está recién creado, sin descargas ni valoraciones, y no publica métricas de precisión ni de latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de detección de objetos en una etapa, anchor-free (YOLOX-s sobre backbone tipo CSPDarknet, no detallado en la model card) |
| Parametros totales | No disponible en la model card (el YOLOX-s original declara del orden de 8,9 M de parametros; dato no verificado en este repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de visión por computador, sin ventana de contexto de texto) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) en las dos configuraciones publicadas; el script de conversion del modelo zoo usa i8 por defecto |
| Idiomas soportados | No disponible / no aplica; la documentacion del repositorio esta en ingles y chino simplificado |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (modelo compilado para NPU Rockchip); ONNX como formato intermedio en el flujo de conversion |
| Chips soportados | RK3588 |
| Resoluciones de entrada | 384x640 y 640x640 |
| Nucleos NPU por configuracion | 1 |
| Version de runtime RKNN | v2.4.0 |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Fecha de creacion | 2026-10-02 |
| Fecha de ultima actualizacion | 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

YOLOX-s es un detector de una sola etapa sin anclas (anchor-free) con cabeza desacoplada, desarrollado originalmente por Megvii y adaptado por airockchip en el repositorio `airockchip/YOLOX`, que es la fuente declarada de esta distribucion. La model card de este repositorio identifica el tipo de modelo como CNN y no incluye detalles sobre el backbone, el neck, la funcion de perdida ni el esquema de asignacion de etiquetas. En el ecosistema RKNN, el flujo de despliegue implica partir de un ONNX, convertirlo con rknn-toolkit2 y obtener un fichero RKNN cuantizado; las configuraciones aqui publicadas fijan cuantizacion w8a8 y un solo nucleo NPU.

No se documenta en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste fino, RLHF o DPO (procedimientos que, por otra parte, no aplican a un detector convolucional). Tampoco se detalla si se aplico destilacion, poda o quantisation-aware training durante la conversion. Los unicos datos tecnicos verificables son los de despliegue: dos variantes de resolucion (384x640 y 640x640), cuantizacion w8a8, un nucleo NPU y runtime RKNN v2.4.0, con verificacion de integridad mediante `SHA256SUMS`.

## Capacidades

- Deteccion de objetos en imagenes y flujo de video, con salida de cajas, puntuaciones de objetividad y clases, segun el esquema de decodificacion de YOLOX.
- Inferencia en NPU del RK3588, no en GPU ni en CPU, con cuantizacion INT8 de pesos y activaciones.
- Dos perfiles de entrada: 384x640 (orientado a escenas horizontales y a menor coste computacional) y 640x640 (entrada cuadrada estandar del modelo).
- Integracion con el runtime RKNN v2.4.0 y con el ejemplo oficial de YOLOX del RKNN Model Zoo.
- Posibilidad de encadenar el detector con seguimiento multi-objeto (MOT) sobre la misma plataforma, segun implementaciones de terceros como `lovelyyoshino/rk3588_model`.
- Integracion en ROS2 para robotica, segun el proyecto de terceros `Ar-Ray-code/yolox_rk3588_ros`.
- Verificacion de integridad de los ficheros descargados mediante SHA-256 antes del despliegue.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, audio ni comprension de lenguaje, al no ser un modelo de lenguaje.

## Casos de uso

- Videovigilancia en el borde: una camara IP conectada a una placa RK3588 puede ejecutar la configuracion 384x640 de forma local, sin enviar video a la nube, reduciendo ancho de banda y cumpliendo requisitos de privacidad al no salir el flujo de imagen del dispositivo.
- Robotica movil con ROS2: el proyecto `Ar-Ray-code/yolox_rk3588_ros` demuestra la integracion del detector con ROS2, lo que permite publicar detecciones como topicos y alimentar bucles de navegacion o manipulacion en robots con presupuesto energetico limitado.
- Conteo de personas y analitica de aforo: combinado con un tracker multi-objeto sobre la misma NPU, sirve para contar entradas y salidas en comercios o estaciones, un caso respaldado por frameworks de MOT para RK3588 como `lovelyyoshino/rk3588_model`.
- Inspeccion industrial en linea de produccion: la configuracion 640x640 permite detectar defectos o piezas en cintas transportadoras, con inferencia local que evita la latencia de red y permite actuar sobre el actuador en el mismo equipo.
- Control de acceso y puertas inteligentes: deteccion de presencia y de clases de interes en el propio dispositivo, sin depender de conectividad, util en entornos con red intermitente o restricciones de despliegue de infraestructura.
- Sistemas embarcados en drones y vehiculos no tripulados: el consumo del RK3588 y la ejecucion en NPU con INT8 lo hacen apto para plataformas con bateria donde no cabe una GPU, para tareas de deteccion de obstaculos o seguimiento de objetivos.
- Kits educativos y prototipado en placas Rockchip: el paquete incluye configuraciones cerradas y verificacion SHA-256, lo que simplifica la puesta en marcha en laboratorios y cursos frente a reproducir la conversion completa desde ONNX.
- Retrofit de camaras existentes: al ser un modelo pequeno en formato RKNN, puede desplegarse en hardware de bajo coste para anadir deteccion a instalaciones ya existentes sin sustituir la optica ni la infraestructura de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye mAP (COCO ni de otro dataset), latencia por inferencia, FPS ni consumo energetico para ninguna de las dos configuraciones. Tampoco hay comparaciones con otros detectores ejecutados sobre RK3588.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3588. Las configuraciones publicadas no declaran compatibilidad con otros chips de la familia ni con generaciones anteriores o posteriores.
- Acelerador: NPU del RK3588, con un nucleo asignado por configuracion (el SoC dispone de tres nucleos y hasta 6 TOPS INT8 en total).
- VRAM estimada: no disponible; el modelo se ejecuta sobre memoria compartida del sistema, no sobre memoria grafica dedicada.
- GPU recomendadas: no aplica. El modelo esta compilado para NPU Rockchip; no se distribuyen pesos en formatos ejecutables sobre CUDA (safetensors, GGUF, TensorRT).
- Compatibilidad con GPU de consumo (RTX 4090 y similares): no aplica para estos ficheros RKNN; requeriria partir del modelo original y reconvertirlo.
- Version de runtime: RKNN Runtime v2.4.0, obligatoria segun la model card.
- Opciones de despliegue: runtime RKNN sobre RK3588, ejemplo oficial de YOLOX en `airockchip/rknn_model_zoo`, integraciones de terceros con ROS2 y con pipelines de MOT.
- Latencia y throughput estimados: no disponibles. La model card no publica tiempos de inferencia ni FPS para 384x640 ni para 640x640.

## Comparativa con modelos similares

No se dispone de mediciones comparativas publicadas para este paquete. La tabla siguiente recoge unicamente caracteristicas verificables de la distribucion, no rendimiento:

| Modelo | Tipo | Resoluciones | Cuantizacion | Chip objetivo | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| RK3588-CNN-yolox-s (este repositorio) | CNN de deteccion, anchor-free | 384x640, 640x640 | w8a8 | RK3588 | Apache 2.0 | No disponible |
| Otros detectores del RKNN Model Zoo (por ejemplo variantes de la familia YOLO) | CNN de deteccion | No disponible | No disponible | RK3588 y otras familias Rockchip | No disponible en la informacion proporcionada | No disponible |
| YOLOX-s original (airockchip/YOLOX, Megvii) | CNN de deteccion, anchor-free | Configurable, 640x640 como referencia | FP32 / FP16 en entrenamiento | GPU o CPU | Apache 2.0 | No disponible en la informacion proporcionada |

No se han proporcionado datos de mAP, latencia ni consumo que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de metricas: el repositorio no publica mAP, precision por clase, latencia ni FPS, por lo que no es posible estimar su calidad en produccion sin medirla en el hardware final.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y 0,0 GB de tamano reportado en HuggingFace, lo que puede indicar que los ficheros no estan materializados o que el paquete esta incompleto. Conviene verificar con `sha256sum -c SHA256SUMS` antes de cualquier despliegue.
- Dependencia estricta del runtime: la model card exige RKNN Runtime v2.4.0. Otras versiones pueden no cargar el modelo o producir resultados incorrectos.
- Restriccion de plataforma: soporte declarado unicamente para RK3588 con un nucleo NPU por configuracion. No se documenta compatibilidad con RK3588S, RK3576, RK3568 ni otras NPU Rockchip.
- Mezcla de configuraciones: la model card advierte de que deben usarse ficheros de la misma configuracion; mezclar artefactos de 384x640 y 640x640 invalida el despliegue.
- Riesgo de degradacion por cuantizacion: la cuantizacion w8a8 es un procedimiento con perdida de precision. En objetos pequenos, escenas con baja iluminacion o clases poco representadas es habitual observar una caida de exactitud respecto al modelo en FP32, aunque no se aportan datos para cuantificarla en este caso.
- Sesgos del modelo original: la model card no documenta el dataset de entrenamiento. El YOLOX original se entrena sobre COCO, un conjunto con sesgos geograficos y de representacion conocidos, pero esto no se confirma para esta distribucion.
- Riesgo de alucinacion en sentido estricto: no aplica a un detector de objetos. Si aplica el riesgo de falsos positivos y falsos negativos propios de la deteccion visual, agravado por la falta de metricas publicadas.
- Idioma: es un modelo de visión; no procesa texto ni mantiene conversaciones. La documentacion esta en ingles y chino simplificado, sin version en castellano.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y atribucion incluidos en el fichero LICENSE. Este paquete es una conversion de un modelo de terceros, por lo que la atribucion a `airockchip/YOLOX` y al YOLOX original de Megvii debe mantenerse.
- Caveat de produccion: al no haber soporte declarado mas alla de la NPU del RK3588, cualquier cambio de plataforma implica volver al ONNX de origen y rehacer la conversion y la cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolox-s
- Modelo en ModelScope: https://modelscope.cn/models/RKNNAI/RK3588-CNN-yolox-s
- Modelo fuente: https://github.com/airockchip/YOLOX
- Ejemplo de YOLOX en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolox
- Documentacion del ejemplo YOLOX en RKNN Model Zoo: https://raw.githubusercontent.com/airockchip/rknn_model_zoo/main/examples/yolox/README.md
- Repositorio de terceros con YOLOX para RK3588: https://github.com/xlloss/RK3588_YOLOX
- Integracion YOLOX y RK3588 con ROS2: https://github.com/Ar-Ray-code/yolox_rk3588_ros
- Framework de deteccion y MOT para RK3588: https://deepwiki.com/lovelyyoshino/rk3588_model
- Pagina de YOLOX en reComputer AI Lab (Seeed): https://sensecraft.seeed.cc/ai-lab/en/models/yolox-rknn
- YOLOX original (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
