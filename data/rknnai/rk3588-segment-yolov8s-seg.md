# RKNNAI/RK3588-SEGMENT-yolov8s-seg

## Resumen

RK3588-SEGMENT-yolov8s-seg es un paquete de despliegue del modelo YOLOv8s-seg convertido al formato RKNN para ejecutarse sobre la NPU del SoC Rockchip RK3588. Lo publica la organizacion RKNNAI dentro del ecosistema RKNN Model Zoo y su origen es el repositorio airockchip/ultralytics_yolov8, un fork de Ultralytics adaptado para la conversion a RKNN. No es, por tanto, un modelo de lenguaje ni un modelo entrenado desde cero, sino una distribucion de pesos ya cuantizados junto con la configuracion necesaria para desplegarlos en hardware de borde.

El modelo resuelve segmentacion de instancias: ademas de detectar objetos con cajas delimitadoras, genera una mascara a nivel de pixel por cada instancia. La unica configuracion publicada es `yolov8s-seg-640x640-w8a8-1`, con entrada de 640x640, cuantizacion w8a8 (INT8 en pesos y activaciones), un unico nucleo NPU y runtime RKNN v2.4.0.

Su relevancia practica esta en ejecutar vision por computador en dispositivos de bajo consumo sin GPU: camaras inteligentes, robotica movil, inspeccion industrial o videovigilancia en el borde. El principal condicionante para llevarlo a produccion es la licencia AGPL-3.0 heredada del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8-seg (red convolucional de deteccion con cabeza anchor-free y rama de segmentacion de instancias), version airockchip/ultralytics_yolov8 |
| Parametros totales | no disponible en la model card (el modelo upstream YOLOv8s-seg de Ultralytics declara ~11,8 M de parametros, cifra no verificada en este repositorio) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | w8a8 (INT8 en pesos y activaciones) |
| Idiomas soportados | no aplicable |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (runtime RKNN v2.4.0) |
| Tarea | Segmentacion de instancias (SEGMENT) |
| Resolucion de entrada | 640x640 |
| Chips soportados | RK3588 (segun la configuracion publicada) |
| Nucleos NPU usados | 1 |
| Identificador de revision | v2.4.0 |
| Tamano del repositorio | 0,0 GB segun metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLOv8-seg en su variante "s" (small) de Ultralytics, en la version mantenida por airockchip para facilitar la exportacion a RKNN. Se trata de un detector convolucional de una sola etapa con cabeza desacoplada y asignacion de etiquetas sin anclas, al que se anade una rama de prototipos de mascara y una cabeza de coeficientes que, combinadas, producen mascaras de instancia a resolucion completa. Esta distribucion no incluye entrenamiento propio: parte de los pesos del modelo upstream y aplica una conversion y cuantizacion a INT8 para la NPU.

La model card no documenta datos de entrenamiento, numero de tokens o imagenes, composicion del dataset, ni si hubo ajuste fino, RLHF o DPO; tampoco deja constancia de la receta de calibracion usada durante la cuantizacion w8a8. Lo unico verificable es la configuracion de despliegue: entrada 640x640, cuantizacion w8a8, un nucleo NPU y runtime RKNN v2.4.0. El repositorio incluye un fichero SHA256SUMS para verificar la integridad de los ficheros antes del despliegue.

## Capacidades

- Segmentacion de instancias: genera cajas delimitadoras y mascaras de pixel para cada objeto detectado en una imagen de 640x640.
- Deteccion de objetos multi-clase segun el vocabulario de clases del modelo upstream de Ultralytics (la lista concreta de clases no se detalla en la model card: no disponible).
- Inferencia en el borde sobre NPU RK3588 con pesos INT8, sin necesidad de GPU dedicada.
- Integracion en pipelines de vision clasicos (camara -> preprocesado -> inferencia RKNN -> postprocesado de mascaras), segun los ejemplos publicos de RKNN Model Zoo.
- Soporte de tool calling / function calling: no aplicable (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no aplicable.
- Capacidades especiales (modo thinking, vision, audio): unicamente vision, en la modalidad de segmentacion de instancias.

## Casos de uso

- Inspeccion visual industrial: el modelo segmenta defectos, piezas o componentes sobre una cinta transportadora a 640x640, y las mascaras permiten medir area y forma del defecto en lugar de limitarse a una caja delimitadora. Adecuado por su ejecucion en NPU de bajo consumo dentro de la propia linea de produccion.
- Robotica movil y AGV: segmentacion de obstaculos, personas y superficies para navegacion reactiva en tiempo real sobre una placa RK3588 embarcada, sin depender de conectividad ni de servidores externos.
- Videovigilancia y analisis de aforo: conteo y separacion de personas mediante mascaras de instancia, lo que reduce errores en escenas con oclusiones frente a un detector solo de cajas.
- Analisis de lineal en retail: segmentacion de productos y huecos en estanterias para deteccion automatica de roturas de stock, con el modelo ejecutandose en un dispositivo local que evita enviar video a la nube.
- Agricultura de precision: segmentacion de frutos, hojas o malas hierbas en imagenes de campo capturadas por camaras montadas en maquinaria, aprovechando el bajo consumo del RK3588 para operar con bateria.
- Vision embebida en drones (UAV): segmentacion de terreno, cultivos o infraestructura en vuelo, donde el peso y el consumo de la NPU son determinantes frente a una GPU.
- Anonimizacion de video en el borde: uso de las mascaras de personas para aplicar desenfoque antes de transmitir o almacenar el flujo, lo que facilita el cumplimiento de normativa de privacidad al no salir el video sin tratar del dispositivo.
- Prototipado rapido de productos de vision: al estar disponible como configuracion lista para RKNN Model Zoo, sirve como punto de partida para validar una idea de segmentacion sobre hardware RK3588 antes de invertir en un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de mAP de caja ni de mAP de mascara, tampoco cifras de latencia o FPS sobre RK3588, ni una comparativa de la perdida de precision introducida por la cuantizacion w8a8 respecto al modelo en punto flotante. Cualquier valor de rendimiento que se necesite para una decision de despliegue debe medirse sobre el dispositivo objetivo.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3588 con NPU y runtime RKNN v2.4.0. La configuracion publicada declara soporte unicamente para RK3588.
- VRAM: no aplicable. El modelo se ejecuta sobre la NPU y consume memoria del sistema compartida; el tamano exacto del fichero `.rknn` no se especifica en la informacion disponible.
- GPU recomendadas: ninguna. Este repositorio no contiene pesos para CUDA ni para ejecucion en A100, H100 o RTX 4090. Para esas plataformas habria que usar el modelo upstream en ONNX o PyTorch.
- Compatibilidad con GPU de consumo: no aplicable. El modelo no esta pensado para GPUs de escritorio; para GPU de consumo habria que exportar el modelo original desde Ultralytics.
- Nucleos NPU: la configuracion usa 1 nucleo. El RK3588 integra varios nucleos NPU (3 segun las especificaciones publicas de Rockchip, hasta 6 TOPS en INT8 en total), por lo que esta configuracion concreta no explota todos los nucleos de forma simultanea.
- Opciones de despliegue: ejemplos oficiales de RKNN Model Zoo para YOLOv8 (C++ y Python), RKNN Toolkit2 para la conversion y el runtime RKNPU2 en el dispositivo. La descarga puede hacerse desde HuggingFace o desde ModelScope, con la revision v2.4.0.
- Verificacion previa: ejecutar `sha256sum -c SHA256SUMS` dentro del directorio `yolov8s-seg-640x640-w8a8-1` y comprobar que todas las entradas devuelven `OK`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Resolucion | Cuantizacion | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| RK3588-SEGMENT-yolov8s-seg (este) | Segmentacion de instancias | no disponible en la model card (~11,8 M segun Ultralytics para el upstream) | 640x640 | w8a8 INT8 | NPU RK3588, runtime v2.4.0 | AGPL-3.0 | HuggingFace y ModelScope |
| YOLOv8n-seg (upstream Ultralytics) | Segmentacion de instancias | ~3,4 M segun Ultralytics | 640x640 | punto flotante / exportable | GPU, CPU, exportable a otros runtimes | AGPL-3.0 | Repositorio Ultralytics |
| YOLOv11n-seg en RK3588 (proyecto Ebwai) | Segmentacion de instancias | no disponible | no disponible | INT8 | NPU RK3588 | no disponible en la informacion recogida | GitHub |
| YOLOv8-seg en Radxa / Seeed | Segmentacion de instancias | no disponible | 640x640 | no disponible | NPU RK3588 | segun proyecto upstream | Documentacion y laboratorio de demos |

Las cifras de parametros de los modelos upstream de Ultralytics proceden de su documentacion publica y no se han verificado en este repositorio. No se han encontrado comparativas de precision o latencia entre estas opciones en la informacion disponible.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial del modelo o de obras derivadas obliga a liberar el codigo fuente correspondiente bajo la misma licencia, salvo que se obtenga una licencia comercial del titular de los derechos. Ultralytics ofrece licencias comerciales para su modelo upstream; conviene revisarlo antes de integrar esto en un producto cerrado.
- Procedencia y atribucion: el modelo deriva de airockchip/ultralytics_yolov8 y, en ultima instancia, de Ultralytics. Los avisos de copyright deben conservarse tal como indica la propia licencia incluida en el repositorio.
- Riesgo de degradacion por cuantizacion: no se publican metricas de precision tras la conversion a w8a8, por lo que se desconoce la perdida de mAP o de calidad de mascara respecto al modelo en punto flotante. Es imprescindible validar con un conjunto de datos propio.
- Ausencia de metricas: sin mAP, sin IoU de mascara, sin curvas de precision-exhaustividad y sin umbrales de confianza recomendados. No hay base publicada para estimar el comportamiento en produccion.
- Sesgos: no se documenta la composicion del dataset de entrenamiento original ni se han publicado analisis de sesgo por clase, etnia, genero o condiciones de iluminacion. Los sesgos del modelo upstream se heredan sin cambios.
- Riesgo de error en escenas adversas: como cualquier detector convolucional, puede fallar con oclusiones severas, objetos muy pequenos, desenfoque de movimiento, baja iluminacion o condiciones meteorologicas adversas. Las mascaras de instancia suelen degradarse antes que las cajas.
- Limitacion de plataforma: la configuracion esta atada al RK3588 y al runtime RKNN v2.4.0. Usar ficheros de configuraciones distintas o versiones de runtime no coincidentes puede provocar fallos de ejecucion.
- Idioma y contexto: no aplicable, pero conviene recordar que este repositorio no aporta ninguna capacidad de procesamiento de lenguaje.
- Documentacion escasa: la model card se limita a describir la descarga, la verificacion de integridad y la compatibilidad; no incluye detalles de entrenamiento, clases soportadas, calibracion ni rendimiento medido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RKNNAI/RK3588-SEGMENT-yolov8s-seg
- Modelo origen (fork airockchip de Ultralytics YOLOv8): https://github.com/airockchip/ultralytics_yolov8
- RKNN Model Zoo, ejemplo YOLOv8: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov8
- Demo de YOLOv8-seg en RK3588 (Seeed reComputer AI Lab): https://sensecraft.seeed.cc/ai-lab/en/models/yolov8-seg/rk3588
- Proyecto YOLOv11n INT8 en RK3588 (Ebwai): https://github.com/Ebwai/Yolon11_RK3588
- Repositorio RK3588_ultralytics_yolov8 (xlloss): https://github.com/xlloss/RK3588_ultralytics_yolov8
- Documentacion de Radxa para YOLOv8-seg en Rock 5T: https://docs.radxa.com/en/rock5/rock5t/app-development/ai/yolov8-seg
- Hilo del foro de Radxa sobre YOLOv8 en la NPU del RK3588: https://forum.radxa.com/t/use-yolov8-in-rk3588-npu/15838
- Paper asociado: no disponible en la informacion recogida.
