# mouad-zouhdi/sparta-edgetpu-models

## Resumen

SPARTA es un framework de investigación desarrollado por Mouad Zouhdi en el LAAS-CNRS que mide cómo se comporta la poda estructurada cuando un modelo realmente se ejecuta en un Google Coral Edge TPU. Este repositorio de HuggingFace publica todos los modelos generados con ese framework, junto con los archivos de medición (latencia, precisión), los informes del compilador de Edge TPU y los logs de entrenamiento. No se trata de un modelo único, sino de una colección de artefactos que incluye cientos de modelos de visión (clasificación de imágenes) podados, cuantizados y compilados para hardware edge.

El problema que resuelve es la falta de datos empíricos sobre cómo afecta la poda estructurada a la latencia real en aceleradores edge, más allá de la reducción teórica de parámetros. La colección abarca dos ejes principales: un estudio exhaustivo en CIFAR-100 con 7 arquitecturas, 7 criterios de poda y 9 tasas objetivo (441 combinaciones, 404 modelos generados), y un estudio en ImageNet con 8 arquitecturas compiladas en 1 a 8 segmentos para repartir la carga entre varios aceleradores, con mediciones en 22 particiones distintas. También incluye un corpus sintético para análisis de memoria y una campaña inicial en Imagenette que queda archivada por no ser comparable.

La relevancia actual es alta para investigadores y equipos que trabajan en despliegue de modelos de visión en dispositivos edge con Coral, ya que permite reproducir o extender experimentos de poda sin repetir las miles de horas de GPU que costó el entrenamiento. Todos los artefactos están publicados bajo licencia MIT y el código fuente del framework está disponible en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18, ResNet50, VGG19, WRN-28-10, MobileNetV2, GoogLeNet, SqueezeNet1-1 (CIFAR-100); 8 arquitecturas ImageNet (no especificadas en la informacion); EfficientNet-Lite0 (Imagenette, no comparable) |
| Parametros totales | No disponible (depende de la arquitectura y del nivel de poda aplicado) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelos de vision por clasificacion de imagenes) |
| Tipos de cuantizacion | INT8 (TFLite) |
| Idiomas soportados | No aplicable |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch), .tflite (TensorFlow Lite), binarios compilados para Edge TPU |

## Arquitectura y entrenamiento

La coleccion contiene modelos generados con el framework SPARTA, que aplica poda estructurada a redes neuronales de vision. La poda se realiza sobre arquitecturas clasicas: ResNet, VGG, Wide ResNet, MobileNet, GoogLeNet y SqueezeNet. Se evaluan siete criterios de poda (magnitude_l1, magnitude_l2, bn_scale, fpgm, taylor, obdc y random) y nueve tasas objetivo de reduccion de parametros. Cada combinacion es una ejecucion independiente desde el baseline. Los modelos podados se recuperan posteriormente mediante reentrenamiento (fine-tuning) para restaurar la precision.

En el eje 2 (ImageNet), los modelos parten de pesos publicados y se podan hasta alcanzar un objetivo de tamano, para despues compilarse en 1 a 8 segmentos. Esto permite que varios aceleradores Edge TPU compartan el modelo, repartiendo los parametros entre ellos. Las mediciones registran la latencia, la precision y la division que hace el compilador entre parametros almacenados en memoria on-chip y parametros transmitidos desde el host.

No se menciona el uso de RLHF ni DPO. El entrenamiento es de tipo supervisado clasico para clasificacion de imagenes, con logs de entrenamiento incluidos para cada modelo. La cuantizacion a INT8 se realiza antes de la compilacion para Edge TPU, y los binarios compilados son los que finalmente se evaluan.

## Capacidades

- Clasificacion de imagenes en CIFAR-100 e ImageNet con arquitecturas clasicas de vision.
- Poda estructurada con multiples criterios (magnitude_l1, magnitude_l2, bn_scale, fpgm, taylor, obdc, random).
- Cuantizacion INT8 para TensorFlow Lite y compilacion para Google Coral Edge TPU.
- Soporte de particionamiento de modelos en multiples segmentos (de 1 a 8) para distribuir la carga entre varios aceleradores Edge TPU.
- Mediciones de latencia, precision y analisis de memoria on-chip vs. streaming desde el host.
- Benchmarks de arranque en frio (cold-start) y analisis de memoria sintetica.
- No soporta tool calling, generacion de texto, razonamiento multi-step ni capacidades multimodales mas alla de clasificacion visual.

## Casos de uso

- Despliegue de clasificadores de imagenes en dispositivos edge con Coral: los binarios compilados para Edge TPU estan listos para ejecutarse en un Coral, con cuantizacion INT8 y latencias medidas, lo que permite seleccionar un modelo ya optimizado sin pasar por el flujo de entrenamiento.
- Optimizacion de modelos de vision para reducir latencia en produccion: los datos de medicion permiten comparar el coste real de inferencia tras la poda y elegir el punto de equilibrio entre precision y velocidad.
- Investigacion en poda estructurada: el repositorio ofrece un conjunto amplio de modelos podados con distintos criterios y tasas, junto con sus logs, para analizar que criterio funciona mejor en cada arquitectura y dataset sin repetir el coste de entrenamiento.
- Evaluacion de estrategias de cuantizacion y compilacion: los informes del compilador y los archivos de medicion permiten estudiar como afecta la cuantizacion INT8 y la compilacion para Edge TPU a la precision y a la memoria utilizada.
- Diseno de sistemas multi-acelerador: las mediciones con particionamiento en 1 a 8 segmentos y las 22 formas de repartir ocho aceleradores son utiles para dimensionar sistemas edge con varios Coral y repartir la carga.
- Benchmarking de hardware edge: los CSVs con tiempos de inferencia y latencias de arranque en frio sirven como referencia para comparar el rendimiento de distintos dispositivos o configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El repositorio contiene archivos CSV con mediciones detalladas (por ejemplo, `benchmark_results.csv` para los 411 modelos de CIFAR-100, y `accuracy_vs_tpu.csv` para ImageNet), pero los valores concretos no se incluyen en la informacion proporcionada. Para obtener los resultados es necesario descargar los archivos de medicion del repositorio.

## Requisitos de hardware

- Para inferencia: se requiere un Google Coral Edge TPU (USB, PCIe o M.2). Los binarios compilados en `edgetpu/` estan disenados para ejecutarse en este hardware.
- No se requiere GPU para la inferencia con los binarios TFLite compilados.
- Para entrenamiento y poda de los modelos: no se especifica el hardware utilizado, pero el propio autor indica que el proceso de poda cuesta miles de horas de GPU, por lo que se recomienda un cluster con GPUs de alta gama (A100, H100 o similares) para reproducir los experimentos.
- VRAM estimada para inferencia: no disponible, ya que la inferencia se realiza en el Edge TPU, no en GPU.
- Opciones de despliegue: TensorFlow Lite, ejecucion directa en Coral Edge TPU, o uso de los modelos PyTorch (.pt) para experimentacion en CPU/GPU.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; los valores se encuentran en los CSVs de medicion del repositorio.

## Comparativa con modelos similares

No disponible. Este repositorio no contiene un modelo unico comparable con otros modelos de vision, sino una coleccion de artefactos de investigacion sobre poda y despliegue en Edge TPU. Los modelos individuales (ResNet, MobileNet, etc.) son arquitecturas conocidas, pero la coleccion en si no tiene equivalentes directos publicados como modelo.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo. No puede procesar texto, codigo ni realizar tareas de razonamiento.
- Los modelos son exclusivamente de clasificacion de imagenes. No soportan deteccion de objetos, segmentacion ni otras tareas de vision mas alla de la clasificacion.
- La campana de Imagenette (efficientnet_lite0) queda archivada y no es comparable con los resultados de CIFAR-100 ni ImageNet. No se debe usar como referencia.
- Los binarios compilados para Edge TPU solo funcionan en hardware Coral. En otros dispositivos necesitarian recompilacion o conversion a otro formato.
- Los resultados de poda son especificos de las arquitecturas y datasets incluidos. No se pueden extrapolar directamente a otros modelos o tareas sin experimentacion adicional.
- La licencia MIT permite uso comercial, pero los modelos pueden incluir pesos preentrenados de ImageNet que tienen sus propias licencias de origen; es responsabilidad del usuario verificar las condiciones de los pesos base.
- El repositorio es grande (45.3 GB) y contiene mas de 9000 archivos. La descarga y el procesamiento de los datos pueden requerir una planificacion cuidadosa de almacenamiento y ancho de banda.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mouad-zouhdi/sparta-edgetpu-models
- Codigo fuente del framework SPARTA: https://github.com/mouad-zouhdi/sparta-edgetpu
- Documentacion de modelos de Coral (referencia externa): https://www.coral.withgoogle.com/models/
