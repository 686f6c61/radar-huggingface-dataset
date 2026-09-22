# Renesas/EfficientNetV2-B0-ONNX

## Resumen

EfficientNetV2-B0-ONNX es una version exportada a ONNX en formato FP32 del modelo de clasificacion de imagenes EfficientNetV2-B0, publicada por Renesas en su organizacion de HuggingFace. El modelo se distribuye especificamente para su despliegue sobre la plataforma Renesas R-Car X5H, empleando la NPU NPX6 para inferencia acelerada. La arquitectura de origen es EfficientNetV2-B0, una red neuronal convolucional (CNN) disenada para maximizar la eficiencia en el numero de parametros manteniendo una precision competitiva en clasificacion de imagenes.

El modelo resuelve la tarea de clasificacion de imagenes sobre el conjunto ImageNet ILSVRC2012, con 1000 clases de salida y una resolucion de entrada de 224x224 pixeles. Cuenta con aproximadamente 7,1 millones de parametros, lo que lo situa en el rango de modelos compactos aptos para hardware embebido. El export se realizo desde MMPreTrain (OpenMMLab) y se optimizo posteriormente con ONNX Optimizer antes de su publicacion.

Es relevante porque ejemplifica el flujo de trabajo de despliegue de modelos de vision en plataformas automocion y embebidas de Renesas, permitiendo a los desarrolladores ejecutar clasificacion de imagenes en la NPU NPX6 con conversion automatica a INT8 en tiempo de ejecucion. El repositorio tambien aloja variantes adicionales B1, B2 y B3 con sus propios artefactos y medidas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-B0 (red neuronal convolucional) |
| Parametros totales | 7,1 M (7,11 M contados a partir de los inicializadores del fichero ONNX FP32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 224 x 224) |
| Tipos de cuantizacion | FP32 en ONNX; conversion automatica a INT8 en el runtime del NPU (ONNX Runtime Custom NPU EP o MWMX Runtime) |
| Idiomas soportados | no aplicable (clasificacion de imagenes; 1000 clases de ImageNet) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32) |

## Arquitectura y entrenamiento

EfficientNetV2-B0 es una red convolucional perteneciente a la familia EfficientNetV2, que introduce mejoras sobre la EfficientNet original mediante el uso de bloques MBConv con atencion SE, entrenamiento consciente de la progresion de resolucion y operaciones convolucionales optimizadas para el entrenamiento. La variante B0 es la mas pequena de la familia, con 7,1 millones de parametros y una entrada de 224 x 224.

En este repositorio el peso se distribuye como un grafo ONNX FP32 exportado desde MMPreTrain (OpenMMLab) y optimizado con ONNX Optimizer. El modelo se entreno originalmente sobre ImageNet ILSVRC2012 (1000 clases), tal y como indica la referencia `efficientnetv2_b0_3rdparty_in1k`. No se detalla en la informacion proporcionada el numero exacto de tokens o muestras vistas durante el entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables a un clasificador de imagenes). El flujo de despliegue contempla dos rutas de ejecucion sobre la NPU NPX6: ONNX Runtime con un Execution Provider personalizado para NPU y MWMX Runtime, ambas con conversion automatica a INT8.

## Capacidades

- Clasificacion de imagenes en 1000 clases del conjunto ImageNet ILSVRC2012.
- Inferencia sobre entrada RGB de 224 x 224 pixeles.
- Ejecucion acelerada en la NPU NPX6 de la plataforma Renesas R-Car X5H mediante conversion automatica a INT8.
- Exportacion a ONNX FP32 compatible con ONNX Runtime y con MWMX Runtime.
- Grafo optimizado con ONNX Optimizer para reducir operaciones redundantes.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling, agentes ni audio.
- No soporta multiples idiomas ni procesamiento de lenguaje natural; su unica salida son logits de clase sobre imagenes.

## Casos de uso

- Clasificacion de imagenes en sistemas de automocion: el modelo se ejecuta sobre la NPU NPX6 del SoC R-Car X5H para categorizar fotogramas de camara en tiempo real con latencias medidas en torno a 1,5-2,4 ms por inferencia.
- Preprocesado en pipelines de vision por computador embebidos: sirve como etapa inicial de filtrado o etiquetado de imagenes antes de modulos de deteccion o segmentacion mas costosos.
- Control de calidad industrial: clasificacion de productos en lineas de fabricacion a partir de imagenes de camara, aprovechando la inferencia de baja latencia y el bajo consumo de la NPU.
- Sistemas de vigilancia y monitorizacion: categorizacion de escenas o eventos a partir de flujos de video, con despliegue sobre hardware automocion de Renesas.
- Robotica y sistemas autonomos: reconocimiento de objetos o entornos como entrada para la toma de decisiones de un agente embebido.
- Prototipado e investigacion en vision embebida: el modelo ONNX FP32 sirve como referencia para medir latencia y precision antes de cuantizar a INT8 en la NPU.
- Clasificacion de imagenes en el borde (edge computing): al tratarse de un modelo de 7,1 M de parametros, cabe en memoria reducida y puede ejecutarse sin dependencia de la nube.
- Integracion en plataformas MMPreTrain: permite reutilizar el flujo de exportacion y las herramientas de OpenMMLab para fine-tuning o evaluacion adicional.

## Benchmarks y rendimiento

Se han publicado mediciones de latencia y FPS sobre hardware Renesas R-Car X5H con la NPU NPX6:

| Fuente | Runtime | Configuracion | Latencia (ms) | FPS | Tipo |
|---|---|---|---|---|---|
| x5h_mwmx_npu.yaml | MWMX | 1x NPU, 1 core, 850 MHz | 2,0818 | 480 | Medida (hil) |
| x5h_ppa_npu.yaml | PPA Estimator | 1x NPU, 1 core, 850 MHz | 1,517 | 650 | Estimacion |
| x5h_mwmx_npu_apm50_1core.yaml | MWMX (APM50 CI) | 1x NPU, 1 core, 850 MHz | 1,739605 | no disponible | Medida (hil) |
| x5h_mwmx_npu_apm50_12core.yaml | MWMX (APM50 CI) | 1x NPU, 12 cores, 850 MHz | 2,417156 | no disponible | Medida (hil) |

Mediciones adicionales de las variantes B1, B2 y B3 (mismo pipeline APM50 / metawaremx_runtime MWMX sobre R-Car X5H):

| Modelo | Checkpoint | Parametros | 1 core (ms) | 12 cores (ms) |
|---|---|---|---|---|
| EfficientNetV2-B1 | efficientnetv2_b1_3rdparty_in1k | 8,1 M | 2,897629 | 3,27878 |
| EfficientNetV2-B2 | efficientnetv2_b2_3rdparty_in1k | 10,1 M | 4,379195 | 4,300261 |
| EfficientNetV2-B3 | efficientnetv2_b3_3rdparty_in1k | 14,4 M | 7,498649 | 6,245134 |

No se han publicado en la informacion disponible resultados de precision (top-1 / top-5) sobre ImageNet para este export concreto.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 28,4 MB solo para los 7,11 M de parametros (7,11 M x 4 bytes), mas el espacio de activaciones y buffers del grafo ONNX.
- VRAM estimada en INT8: aproximadamente 7,1 MB para los pesos, dado que el runtime realiza una conversion automatica a INT8 antes de ejecutar en la NPU.
- Plataforma objetivo: Renesas R-Car X5H con NPU NPX6 (1 o 12 cores a 850 MHz).
- GPU discretas tipo A100, H100 o RTX 4090: no se documentan como objetivo; el modelo esta pensado para la NPU embebida, aunque puede ejecutarse en cualquier backend compatible con ONNX.
- Si cabe en GPU de consumo: si, dadas las dimensiones del modelo (7,1 M de parametros), cabe en cualquier GPU de consumo e incluso en CPU, aunque las cifras de rendimiento publicadas corresponden a la NPU NPX6.
- Opciones de despliegue: ONNX Runtime con Execution Provider personalizado para NPU, MWMX Runtime, y cualquier otro runtime compatible con ONNX.
- Latencia y throughput estimados: entre 1,517 ms (estimacion PPA) y 2,417 ms por inferencia segun configuracion; el unico dato de FPS publicado es 480 FPS (MWMX, 1 core) y 650 FPS (estimacion PPA).
- Descarga de artefactos: `hf download Renesas/EfficientNetV2-B0-ONNX --repo-type=model --include "fp32/*"`.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Latencia en X5H |
|---|---|---|---|---|---|
| EfficientNetV2-B0 (este) | 7,1 M | 224 x 224 | ONNX FP32 | Apache 2.0 | 1,517-2,417 ms |
| EfficientNetV2-B1 | 8,1 M | no disponible | ONNX | Apache 2.0 | 2,898 / 3,279 ms (1 / 12 cores) |
| EfficientNetV2-B2 | 10,1 M | no disponible | ONNX | Apache 2.0 | 4,379 / 4,300 ms (1 / 12 cores) |
| EfficientNetV2-B3 | 14,4 M | no disponible | ONNX | Apache 2.0 | 7,499 / 6,245 ms (1 / 12 cores) |

Las variantes B1-B3 proceden del mismo repositorio y del mismo pipeline de exportacion, por lo que constituyen la comparativa mas directa. No se dispone de datos comparativos frente a otras familias de clasificadores (ResNet, MobileNet, ConvNeXt) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un clasificador de imagenes restringido a las 1000 clases de ImageNet ILSVRC2012; cualquier imagen fuera de ese vocabulario se mapeara a una de esas clases, con el consiguiente riesgo de predicciones incorrectas o poco significativas.
- La entrada esta fija a 224 x 224 pixeles; no se documenta soporte para otras resoluciones.
- No hay informacion sobre sesgos del modelo respecto a categorias, demografia o dominios especificos de imagen.
- No se han publicado metricas de precision (top-1 / top-5) en la informacion disponible, por lo que el rendimiento predictivo no puede evaluarse a partir de los datos del repositorio.
- Las cifras de rendimiento dependen de la configuracion de NPU (numero de cores, frecuencia) y de la ruta de ejecucion; los resultados en otros backends pueden diferir.
- Las mediciones `apm50` proceden de un pipeline de CI interno distinto y se reportan por separado, sin sustituir a las mediciones originales.
- La conversion a INT8 es automatica en el runtime de la NPU; no se documentan los efectos de esa cuantizacion sobre la precision.
- El repositorio esta nombrado para B0 pero aloja tambien B1, B2 y B3, lo que puede generar confusion al localizar el artefacto correcto.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del hardware y runtimes de Renesas asociados al despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Renesas/EfficientNetV2-B0-ONNX
- Sitio oficial de Renesas: https://www.renesas.com/
- Pagina de productos de Renesas: https://www.renesas.com/en/products
- Wikipedia (Renesas Electronics): https://en.wikipedia.org/wiki/Renesas_Electronics
- Wikipedia en frances (Renesas Electronics): https://fr.wikipedia.org/wiki/Renesas_Electronics
- Empleo en Renesas: https://jobs.renesas.com/
