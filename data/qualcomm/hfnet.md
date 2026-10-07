# qualcomm/HFNet

## Resumen

HFNet es un modelo de visión por computador orientado a robótica y localización visual, publicado por Qualcomm en HuggingFace como parte de su catálogo Qualcomm AI Hub Models. No es un modelo de lenguaje: resuelve el problema de extracción de características de imagen para pipelines de *matching* y localización, devolviendo simultáneamente keypoints locales, sus descriptores y un descriptor global de la imagen completa. Se distribuye ya exportado y optimizado para ejecutarse en la NPU de dispositivos con chipset Qualcomm Snapdragon y Dragonwing.

El modelo es una reimplementación del HF-Net original de ETH Zurich (paper arXiv:1812.03506, "From Coarse to Fine: Robust Hierarchical Localization at Large Scale"), que combinaba en una única red convolucional la detección de características locales tipo SuperPoint con un descriptor global tipo NetVLAD. La versión de Qualcomm conserva esa doble salida pero se empaqueta en formatos desplegables en *edge*: ONNX, QNN DLC y TFLite.

Con 33,0 M de parámetros y 126 MB de peso en float32, la relevancia actual del modelo reside en su tamaño contenido y en que Qualcomm publica latencias medidas en NPU para más de una veintena de chipsets, con tiempos de inferencia entre 65 ms y 185 ms. Esto lo hace apto para aplicaciones de realidad aumentada, robótica móvil y odometría visual sobre hardware de bajo consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional unica con triple salida (deteccion local + descriptores locales + descriptor global); implementacion de HF-Net |
| Parametros totales | 33,0 M |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no generativo) |
| Tipos de cuantizacion | no disponible; los assets publicados son exclusivamente float |
| Idiomas soportados | no aplicable (modelo de vision); la informacion de idiomas del repositorio figura como no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN DLC y TFLite (float); el modelo fuente citado es hfnet.onnx |
| Entrada | NHWC float32, rango 0..255, resolucion 640x480 en escala de grises |
| Salidas | Descriptor global, keypoints, puntuaciones de keypoints y puntuaciones densas |
| Tamano del modelo (float) | 126 MB |
| Tarea declarada | robotics |

## Arquitectura y entrenamiento

HF-Net es una red convolucional que resuelve de forma conjunta dos tareas habitualmente separadas: la deteccion de puntos de interes con sus descriptores locales y la obtencion de un descriptor global de imagen. La salida local se emplea para estimar correspondencias finas entre pares de imagenes, mientras que el descriptor global permite recuperar candidatos en una base de datos de referencias antes de refinar la pose. Esta estructura en dos etapas es lo que el paper original denomina localizacion jerarquica, y da lugar a un unico pase de red en lugar de dos modelos independientes.

La model card de Qualcomm no detalla el dataset de entrenamiento, el numero de tokens o imagenes vistas, ni si hubo fases de ajuste fino adicionales. Tampoco se especifican innovaciones de inferencia mas alla de la propia optimizacion para NPU Qualcomm. El repositorio de referencia para la implementacion es ethz-asl/hfnet en GitHub, y el articulo asociado es arXiv:1812.03506. Qualcomm ofrece ademas la libreria ai-hub-models para reexportar el modelo con pesos propios, formas de entrada personalizadas y configuraciones de dispositivo y runtime a medida.

## Capacidades

- Deteccion de keypoints locales en imagenes en escala de grises a 640x480.
- Calculo de descriptores locales asociados a cada keypoint.
- Calculo de un descriptor global de imagen para recuperacion y *matching* a gran escala.
- Puntuaciones de keypoint y mapas de puntuaciones densas como salidas auxiliares.
- Extraccion conjunta de caracteristicas locales y globales en un unico pase de red.
- Ejecucion acelerada en NPU de chipsets Qualcomm Snapdragon y Dragonwing.
- Exportacion a ONNX, QNN DLC y TFLite para distintos runtimes.
- No soporta *tool calling*, agentes, razonamiento multietapa ni generacion de texto: no es un modelo de lenguaje.
- No se documentan capacidades multilingues ni modos de razonamiento tipo *thinking mode*.

## Casos de uso

- Localizacion visual en robotica movil: el modelo extrae keypoints y descriptores que alimentan un pipeline de estimacion de pose 6-DoF, con el descriptor global reduciendo el espacio de busqueda en el mapa de referencia.
- Realidad aumentada en movil: con latencias de 65 a 82 ms en chipsets Snapdragon de gama alta recientes, es viable anclar contenido virtual a puntos del entorno en tiempo casi real.
- Odometria visual: el *matching* de keypoints entre fotogramas consecutivos permite estimar el desplazamiento de la camara en vehiculos y robots.
- Navegacion de vehiculos autonomos y ADAS: la exportacion a plataformas SA7255P, SA8295P, SA8650P y SA8775P esta pensada para unidades de control de automocion.
- Reconocimiento de lugares y cierre de bucle en SLAM: el descriptor global funciona como firma de imagen para detectar que se ha vuelto a una zona ya visitada.
- Inspeccion industrial con drones o robots: emparejamiento de imagenes capturadas en distintas condiciones contra un modelo previo del entorno.
- Alineacion y reconstruccion 3D: los descriptores locales sirven para triangulacion y *structure from motion* en pipelines de fotogrametria.
- Aplicaciones IoT y Android de bajo consumo: al pesar 126 MB y ejecutarse en NPU, encaja en dispositivos embebidos con presupuesto energetico ajustado.

## Benchmarks y rendimiento

La informacion proporcionada no incluye metricas de precision (por ejemplo, tasas de localizacion o de *matching*). Si incluye mediciones de latencia y memoria pico por runtime y chipset, con la NPU como unidad de computo principal, que se resumen a continuacion (valores en milisegundos):

| Chipset | ONNX (ms) | QNN DLC (ms) | TFLite (ms) |
|---|---|---|---|
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 67,148 | 65,291 | 67,176 |
| Snapdragon 8 Elite For Galaxy Mobile | 69,305 | 69,375 | 68,351 |
| Snapdragon 8 Gen 3 Mobile | 81,859 | 81,774 | 82,476 |
| Snapdragon 8 Gen 1 Mobile | 119,598 | 120,393 | 122,661 |
| Snapdragon X2 Elite | 67,013 | 68,248 | no disponible |
| Snapdragon X Elite | 117,702 | 118,775 | no disponible |
| Dragonwing IQ-8275 | 104,800 | 104,206 | no disponible |
| Dragonwing IQ-9075 | 119,424 | 118,929 | no disponible |
| Dragonwing IQ-X7181 | 117,702 | 118,775 | no disponible |
| Dragonwing QCS8550 (Proxy) | 117,978 | 116,944 | no disponible |
| Dragonwing Q-8750 | 69,305 | 69,375 | no disponible |
| SA8775P | no disponible | 119,880 | no disponible |
| SA8650P | no disponible | 119,880 | no disponible |
| SA8255P | no disponible | 119,880 | no disponible |
| SA7255P | no disponible | 184,735 | no disponible |
| SA8295P | no disponible | 128,435 | no disponible |
| QCS8450 | 119,598 | 120,393 | no disponible |

La memoria pico reportada varia entre 0 y 327 MB segun chipset y runtime, con una franja tipica de 1 a 218 MB. No se han publicado resultados de benchmarks de precision en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en float32, dado que el modelo ocupa 126 MB. En la practica cabe en cualquier GPU consumer.
- GPUs recomendadas: no hay recomendacion oficial de Qualcomm para GPU de escritorio; el modelo esta optimizado para NPU Qualcomm. En equipos de desarrollo puede ejecutarse con ONNX Runtime sobre CUDA o CPU.
- Cabe en GPU consumer: si, en cualquier RTX 4090, RTX 3090 o inferior, e incluso en iGPU, ya que 33,0 M de parametros no suponen carga relevante.
- Plataformas objetivo reales: Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite y 8 Elite Gen 5, Snapdragon X Elite y X2 Elite, y las familias Dragonwing IQ-8275, IQ-9075, IQ-X7181, QCS8550, Q-8750, QCS8450, SA7255P, SA8255P, SA8295P, SA8650P y SA8775P.
- Opciones de despliegue: ONNX Runtime 1.30.0 con QAIRT 2.50, Qualcomm QNN (runtime DLC) con QAIRT 2.50, y TFLite con QAIRT 2.50. La libreria ai-hub-models permite reexportar con configuraciones propias.
- Latencia: entre 65,291 ms (QNN DLC sobre Snapdragon 8 Elite Gen 5) y 184,735 ms (QNN DLC sobre SA7255P), siempre sobre NPU. No se documenta throughput en GPU de escritorio.
- Memoria pico: entre 0 y 327 MB segun chipset y runtime; los valores mas bajos se dan con QNN DLC en Snapdragon X2 Elite y X Elite (1 MB reportado).

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Descriptor global | Entorno objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HFNet (qualcomm/HFNet) | Keypoints, descriptores locales y descriptor global | 33,0 M | Si | NPU Qualcomm, movil y embebido | BSD-3-Clause | HuggingFace y Qualcomm AI Hub |
| HF-Net original (ethz-asl/hfnet) | Keypoints, descriptores locales y descriptor global | no disponible | Si | GPU y CPU de proposito general | no disponible | GitHub ethz-asl/hfnet |
| SuperPoint | Deteccion y descriptores locales | no disponible | No | GPU y CPU | no disponible | Repositorio de Magic Leap |
| NetVLAD | Descriptor global de imagen | no disponible | Si | GPU y CPU | no disponible | Repositorio original de la Universidad de Oxford |

La diferencia principal frente a las alternativas es el empaquetado: la version de Qualcomm anade formatos ONNX, QNN DLC y TFLite ya compilados con soporte de NPU y mediciones de latencia por chipset, mientras que las implementaciones academicas requieren convertir y optimizar el modelo por cuenta propia. No se dispone de datos de precision que permitan comparar la calidad de los descriptores entre estas opciones.

## Limitaciones y advertencias

- Es un modelo de vision, no un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- La entrada esta fijada a imagenes en escala de grises de 640x480. Otras resoluciones o entradas en color requieren reexportar el modelo con la libreria ai-hub-models.
- Solo se publican pesos en float; no hay versiones cuantizadas listas para usar, lo que limita reducciones adicionales de tamano o consumo.
- La model card no documenta el dataset de entrenamiento, los sesgos del modelo ni el comportamiento en dominios visuales muy distintos del original.
- Riesgo de degradacion en condiciones de poca luz, cambios estacionales o variaciones extremas de punto de vista, algo inherente a los descriptores visuales; no se aportan metricas de robustez.
- Las latencias publicadas corresponden a NPU Qualcomm. No hay cifras oficiales para GPU de escritorio, servidores o CPU, por lo que el rendimiento en esos entornos debe medirse.
- La licencia BSD-3-Clause permite uso comercial, pero conviene verificar las condiciones del HF-Net original y de los componentes en los que se inspira, cuya licencia figura como no disponible en esta informacion.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe evidencia de adopcion en produccion ni de soporte de la comunidad.
- Se trata de un modelo de extraccion de caracteristicas: por si solo no resuelve la localizacion ni la estimacion de pose. Requiere un pipeline posterior de *matching*, recuperacion y solucionador geometrico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/qualcomm/HFNet
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/hfnet
- Libreria Qualcomm AI Hub Models (HFNet): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/hfnet
- Implementacion original de HF-Net (ETH Zurich): https://github.com/ethz-asl/hfnet
- Paper asociado (arXiv:1812.03506): https://arxiv.org/abs/1812.03506
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/hfnet/releases/v0.64.0/hfnet-onnx-float.zip
- Descarga QNN DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/hfnet/releases/v0.64.0/hfnet-qnn_dlc-float.zip
- Descarga TFLite float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/hfnet/releases/v0.64.0/hfnet-tflite-float.zip
