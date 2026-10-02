# RKNNAI/RK3588-CNN-yolov6m

## Resumen

RK3588-CNN-yolov6m es un paquete de despliegue del detector de objetos YOLOv6m convertido al formato RKNN para ejecutarse en la NPU del SoC Rockchip RK3588. No es un modelo de lenguaje ni un modelo generativo: es la conversion de un detector CNN de una sola etapa, procedente de airockchip/YOLOv6 (fork del YOLOv6 original de Meituan), empaquetada por el usuario RKNNAI. El repositorio publicado contiene configuraciones de despliegue, no pesos en safetensors ni checkpoints de entrenamiento.

La unica configuracion listada es `yolov6m-640x640-w8a8-1`, que fija entrada de 640x640, cuantizacion w8a8 (INT8 en pesos y activaciones), un unico nucleo NPU y el runtime RKNN `v2.4.0`. El objetivo es ofrecer inferencia de deteccion de objetos en tiempo real en placas con RK3588 (placas SBC, gateways de vision, equipos de videovigilancia) sin depender de GPU dedicada.

Su relevancia es practica mas que cientifica: estandariza en Hugging Face y ModelScope un artefacto de despliegue reproducible, con sumas SHA-256 para verificar la integridad de los ficheros antes de flashear el dispositivo. El repositorio registra 0 descargas y 0 likes, y el tamano reportado del repo es de 0.0 GB, por lo que se trata de una publicacion reciente y con muy poca traccion verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN, detector de objetos de una etapa basado en YOLOv6 (tipo declarado en la model card: CNN) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | w8a8 (INT8 en pesos y activaciones) |
| Idiomas soportados | no disponible (modelo de vision; las etiquetas de clase proceden del dataset de entrenamiento del modelo original) |
| Licencia | GPL-3.0 |
| Formato de pesos | RKNN (artefacto `.rknn` para el runtime RKNN `v2.4.0`) |
| Tarea | Deteccion de objetos (bounding boxes) |
| Resolucion de entrada | 640x640 |
| Chips soportados | RK3588 |
| Nucleos NPU | 1 |
| Version de runtime RKNN | v2.4.0 |
| Modelo de origen | airockchip/YOLOv6 (fork de YOLOv6) |
| Identificador del modelo | `RKNNAI/RK3588-CNN-yolov6m` |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento. Indica unicamente que el artefacto es una conversion del modelo de origen `airockchip/YOLOv6` al formato RKNN, con la precision especificada en cada configuracion (aqui w8a8). No se aportan datos sobre numero de tokens o imagenes de entrenamiento, composicion del dataset de calibracion de la cuantizacion, ni sobre tecnicas de ajuste fino como RLHF o DPO, que ademas no aplican a un detector CNN.

Arquitecturalmente se trata de un detector YOLOv6 en su variante de tamano "m" (medium), un diseno single-stage y anchor-free propio de la familia YOLOv6, que combina bloques de tipo RepVGG reparametrizables en el backbone y el cuello, con asignacion de etiquetas tipo TAL/SimOTA en el entrenamiento. La innovacion relevante en este repositorio no esta en el modelo sino en el pipeline de despliegue: cuantizacion post-entrenamiento a INT8 (w8a8), exportacion a RKNN y ejecucion sobre la NPU del RK3588 mediante RKNPU SDK. La model card no especifica el metodo exacto de calibracion, el dataset de calibracion ni la perdida de precision respecto al modelo en punto flotante.

## Capacidades

- Deteccion de objetos en imagenes y video: devuelve cajas delimitadoras sobre fotogramas de entrada a 640x640.
- Inferencia en NPU de bajo consumo: disenado para ejecutarse en el acelerador neuronal del RK3588, no en CPU ni GPU dedicada.
- Ejecucion con cuantizacion INT8 completa (pesos y activaciones), lo que reduce el ancho de banda de memoria y el consumo energetico.
- Integracion con RKNPU SDK: la configuracion se publica junto a la version de runtime RKNN `v2.4.0` requerida.
- Verificacion de integridad: el paquete incluye ficheros `SHA256SUMS` para validar los binarios tras la descarga.
- Generacion de texto: no soportada (no es un modelo de lenguaje).
- Razonamiento, matematicas, codigo: no soportados.
- Tool calling / function calling: no soportado.
- Soporte de agentes o razonamiento multi-paso: no soportado.
- Capacidades multilingues: no aplicables.
- Vision multimodal o descripcion de imagenes en lenguaje natural: no soportada; solo deteccion de cajas.
- Audio: no soportado.

## Casos de uso

- Videovigilancia perimetral en edge: el modelo puede ejecutarse localmente en un RK3588 dentro de una camara o un NVR, detectando intrusiones en cada fotograma sin enviar video a la nube, lo que reduce latencia y coste de ancho de banda.
- Control de aforo en comercio: conteo de personas en la entrada a partir de las detecciones por fotograma, con cuantizacion w8a8 que permite alimentar el equipo con un consumo energetico bajo y sin ventilacion activa.
- Inspeccion industrial en linea de produccion: deteccion de defectos o piezas mal posicionadas en una cinta transportadora, con la NPU dedicada dejando la CPU libre para el resto del PLC o del software de control.
- Robotica movil y AGV: deteccion de obstaculos y personas en tiempo real en un robot con RK3588, donde no cabe una GPU y el presupuesto energetico esta limitado por la bateria.
- Analisis de trafico urbano: deteccion de vehiculos en camaras de cruce para conteo y clasificacion de flujo, desplegando el modelo en un gateway en el propio poste.
- Agricultura de precision: deteccion de frutos o malas hierbas desde un dron o un tractor autonomo, aprovechando el bajo consumo de la NPU para trabajar con alimentacion solar.
- Lectura de escenas en logistica: localizacion de palets, cajas o contenedores en muelles de carga para alimentar un sistema de trazabilidad.
- Prototipado de producto en placas SBC: validacion rapida de una idea de vision artificial usando el ejemplo de YOLOv6 del RKNN Model Zoo como referencia de integracion en Python y C.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de precision (mAP, AP50, AP75), comparaciones con el modelo en punto flotante ni medidas de latencia o FPS sobre RK3588.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3588, con NPU de tres nucleos. Las especificaciones del SoC (incluida la cifra agregada de 6 TOPS en INT8) proceden de la documentacion de Rockchip, no de la model card.
- Configuracion publicada: usa un unico nucleo NPU; no se indica si existen variantes multi-nucleo en este repositorio.
- Memoria: el RK3588 emplea memoria LPDDR compartida entre CPU, GPU y NPU, por lo que el modelo no dispone de VRAM dedicada. La model card no publica el consumo de memoria del artefacto.
- GPU dedicada: no aplica. El artefacto RKNN esta pensado para la NPU del RK3588, no para CUDA ni ROCm.
- Compatibilidad: la configuracion esta declarada para RK3588 y runtime RKNN `v2.4.0`. La model card advierte de que deben usarse los ficheros de la misma configuracion.
- Despliegue: RKNPU SDK y las APIs Python y C del RKNN Model Zoo. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que son herramientas de modelos de lenguaje y no aplican a este artefacto.
- Latencia y throughput: no disponibles. No se publican FPS ni tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Chip objetivo | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RKNNAI/RK3588-CNN-yolov6m | Detector CNN (YOLOv6m) | RK3588 | w8a8 | GPL-3.0 | Hugging Face y ModelScope, revision v2.4.0 |
| RKNNAI/RK3576-CNN-yolov6m | Detector CNN (YOLOv6m) | RK3576 | no disponible | GPL-3.0 | Hugging Face |
| Ejemplo YOLOv6 del RKNN Model Zoo (airockchip) | Detector CNN | RK3562, RK3566, RK3568, RK3576, RK3588, RV1126B | no disponible en el extracto | Segun el proyecto de origen | GitHub y Codeberg |
| YOLOv11n INT8 sobre RK3588 (Ebwai/Yolon11_RK3588) | Detector CNN | RK3588 | INT8 | no disponible | GitHub |

Los recuentos de parametros, la precision (mAP) y la latencia de las alternativas no estan disponibles en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa.

## Limitaciones y advertencias

- Alcance funcional limitado: solo deteccion de cajas delimitadoras. No genera texto, no responde a instrucciones y no puede usarse como asistente ni como modelo de razonamiento.
- Compatibilidad restringida: la configuracion solo esta declarada para RK3588 con runtime RKNN `v2.4.0`. Mezclar ficheros de configuraciones distintas puede provocar fallos de despliegue, segun advierte el propio autor.
- Licencia GPL-3.0: es una licencia copyleft. Integrar el modelo en un producto propietario puede obligar a liberar el software derivado bajo los mismos terminos. Conviene revisar las implicaciones legales antes de un uso comercial.
- Perdida de precision por cuantizacion: la conversion a INT8 (w8a8) puede degradar la precision respecto al modelo en punto flotante. No se publican datos de calibracion ni la caida de mAP resultante.
- Sesgos del dataset de origen: no se documenta el dataset de entrenamiento, pero los detectores YOLOv6 se entrenan habitualmente sobre COCO, con la distribucion de clases y los sesgos geograficos y demograficos de ese corpus.
- Riesgo de falsos positivos y falsos negativos: sin metricas publicadas no es posible estimar la tasa de error en condiciones reales como baja iluminacion, oclusion, lluvia o movimiento.
- Resolucion fija: la entrada esta fijada en 640x640, lo que puede penalizar la deteccion de objetos muy pequenos.
- Idiomas y etiquetas: no disponible. Las etiquetas de clase dependen del modelo original y no se documentan en el repositorio.
- Traccion nula y verificacion pendiente: el repositorio registra 0 descargas y 0 likes, y el tamano reportado es de 0.0 GB en los metadatos de Hugging Face. Se recomienda ejecutar `sha256sum -c SHA256SUMS` antes de cualquier despliegue en produccion.
- Ausencia de soporte y mantenimiento: no hay documentacion de issues resueltos, versionado del modelo ni garantias de actualizacion por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKNNAI/RK3588-CNN-yolov6m
- Modelo hermano para RK3576: https://huggingface.co/RKNNAI/RK3576-CNN-yolov6m
- Modelo de origen (fork airockchip de YOLOv6): https://github.com/airockchip/YOLOv6
- RKNN Model Zoo (ejemplo de YOLOv6): https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov6
- RKNN Model Zoo (repositorio completo, GitHub): https://github.com/airockchip/rknn_model_zoo
- RKNN Model Zoo (espejo en Codeberg): https://codeberg.org/airockchip/rknn_model_zoo
- YOLOv6 en reComputer AI Lab (Seeed): https://sensecraft.seeed.cc/ai-lab/en/models/yolov6-rknn
- Referencia de despliegue de YOLOv11n INT8 en RK3588: https://github.com/Ebwai/Yolon11_RK3588/blob/main/rknn_model_zoo/examples/yolov6/README.md
- Descarga via ModelScope: revision `v2.4.0` del modelo `RKNNAI/RK3588-CNN-yolov6m`
