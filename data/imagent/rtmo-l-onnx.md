# imagent/rtmo-l-onnx

## Resumen

RTMO-l (ONNX) es una exportación al formato ONNX del modelo RTMO-l, la variante grande de la familia RTMO (Real-Time Multi-person pose estimation with One-stage) desarrollada por OpenMMLab dentro del proyecto mmpose. El repositorio `imagent/rtmo-l-onnx` es una copia sin modificaciones de la exportación realizada por Xenova, publicada por Imagent para disponer de una fuente estable de descarga. El fichero de pesos ocupa 175.926.543 bytes (aproximadamente 0,2 GB) y se distribuye bajo licencia Apache-2.0.

El modelo resuelve la estimación de pose multi-persona en una sola etapa: localiza y devuelve los keypoints de todas las personas presentes en una imagen sin necesidad de ejecutar previamente un detector de personas ni de agrupar detecciones en un postprocesado de bottom-up clásico. Es relevante porque combina un enfoque one-stage con una precisión cercana a la de los métodos top-down, y porque el formato ONNX permite desplegarlo en runtimes ligeros (onnxruntime, onnxruntime-web, OpenVINO, TensorRT) e incluso directamente en el navegador mediante transformers.js, sin depender de PyTorch.

Al tratarse de un modelo de visión por computador y no de un modelo generativo de lenguaje, conceptos como ventana de contexto, cuantización publicada o soporte multilingüe no son aplicables; los apartados correspondientes se indican como no disponibles o no aplicables. La model card del repositorio no incluye resultados de benchmarks, detalles del dataset de entrenamiento ni instrucciones de preprocesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de una etapa para estimacion de pose multi-persona (RTMO: backbone tipo CSPNeXt, encoder hibrido y cabeza de clasificacion dinamica de coordenadas) |
| Parametros totales | no disponible en la informacion proporcionada; estimacion orientativa de ~44 millones a partir del tamano del fichero ONNX (175.926.543 bytes, asumiendo pesos en fp32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible; el repositorio contiene unicamente `model.onnx` sin cuantizar |
| Idiomas soportados | no aplica (modelo de vision, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (un unico fichero `model.onnx`) |
| Tamano del repositorio | 0,2 GB |
| SHA-256 del fichero ONNX | `293b4b10165b3862fc00b81a9473803838a22046115d54d80f8fdc24daa9a030` |
| Fecha de publicacion del repo | 3 de octubre de 2026 |

## Arquitectura y entrenamiento

RTMO es un estimador de pose multi-persona de una sola etapa. La informacion proporcionada no detalla la composicion interna ni el proceso de entrenamiento; el proyecto upstream de OpenMMLab (mmpose) documenta que la familia RTMO se apoya en un backbone convolucional tipo CSPNeXt, un encoder hibrido y una cabeza de clasificacion dinamica de coordenadas que predice cada keypoint como una distribucion sobre contenedores de posicion, en lugar de regresar directamente sus coordenadas. Este diseno es el que permite prescindir del detector de personas y del agrupamiento posterior que requieren los enfoques top-down y bottom-up clasicos.

La model card de este repositorio no incluye informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables en este dominio). Tampoco se documentan innovaciones adicionales de inferencia, como decodificacion especulativa. Los detalles tecnicos completos deben consultarse en el repositorio de mmpose y en la publicacion cientifica de los autores originales.

## Capacidades

- Deteccion de keypoints de multiples personas de forma simultanea en una unica pasada de inferencia, sin detector de personas previo.
- Salida de esqueleto humano con las articulaciones habituales del esquema de keypoints de COCO (17 puntos: nariz, ojos, orejas, hombros, codos, munecas, caderas, rodillas y tobillos), junto con las cajas de las personas detectadas y sus puntuaciones de confianza.
- Ejecucion agnostica del framework de entrenamiento: al estar en formato ONNX, se puede ejecutar con onnxruntime en CPU, GPU y navegador.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa ni genera texto.
- No incorpora modo de pensamiento, vision-lenguaje, audio ni generacion de texto de ningun tipo. Es exclusivamente un modelo de vision para estimacion de pose.

## Casos de uso

- Analisis biomecanico y deportivo: extraccion de la cinematica articular de deportistas a partir de video, con el modelo ejecutandose fotograma a fotograma para calcular angulos de rodilla, cadera o codo. El enfoque de una sola etapa evita el coste de un detector por fotograma, lo que resulta critico en video a alta frecuencia de muestreo.
- Aplicaciones de fitness y correccion postural en tiempo real: el modelo puede procesar el flujo de una webcam y comparar la pose del usuario con una postura de referencia, generando avisos correctivos. Su ejecucion en ONNX permite desplegarlo en el navegador o en dispositivos de borde.
- Seguridad laboral y deteccion de caidas: monitorizacion de trabajadores en entornos industriales para detectar posturas de riesgo o caidas, activando alertas. La deteccion multi-persona en una sola pasada es adecuada para escenas con varias personas simultaneas.
- Animacion y captura de movimiento de bajo coste: conversion de video monoculo en datos de esqueleto para rigging de personajes 2D/3D o para pipelines de animacion asistida, evitando sistemas de captura con marcadores.
- Interaccion persona-computador y control gestual: uso de los keypoints de brazos y manos como senal de entrada para interfaces sin mando, instalaciones interactivas o aplicaciones de realidad aumentada.
- Analitica de afluencia y trayectorias: conteo y seguimiento de peatones en espacios publicos o en simulaciones de conduccion autonoma, aprovechando que el modelo devuelve esqueletos de todas las personas de la escena.
- Demostraciones y herramientas educativas sin servidor: al ser un fichero ONNX autonomo de 0,2 GB, se puede cargar en el navegador con onnxruntime-web para prototipos de vision que se ejecutan integramente en el cliente.
- Investigacion en vision por computador: uso como baseline reproducible de estimacion de pose one-stage para comparaciones academicas, gracias a la licencia permisiva Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye metricas de AP sobre COCO ni comparaciones con otros modelos; las cifras oficiales, si existen, deben consultarse en el proyecto mmpose de OpenMMLab.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB. Los pesos ocupan unos 176 MB en fp32 y las activaciones a resoluciones de entrada tipicas de este tipo de modelos (por ejemplo, 640x640) se mantienen en el rango de cientos de megabytes.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y superiores, asi como en GPUs integradas con al menos 2 GB de memoria compartida disponible.
- GPU recomendadas para produccion con alta concurrencia: NVIDIA T4, L4, A10, A100 y H100, especialmente si se procesan multiples flujos de video en paralelo.
- Ejecucion en CPU viable: onnxruntime en CPU permite inferencia en tiempo casi interactivo, aunque no se dispone de cifras de latencia concretas en la informacion proporcionada.
- Opciones de despliegue: onnxruntime (Python, C++, C#), onnxruntime-web y transformers.js en navegador, OpenVINO para CPU Intel, TensorRT para GPUs NVIDIA, y conversion a otros formatos mediante las herramientas de mmdeploy del ecosistema OpenMMLab.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Entrada tipica | Licencia | Formato |
|---|---|---|---|---|---|
| RTMO-l (este repositorio) | Una etapa, multi-persona | no disponible (estimacion de ~44 M a partir del fichero) | no disponible | Apache-2.0 | ONNX |
| RTMPose (OpenMMLab mmpose) | Dos etapas, top-down, requiere detector de personas | no disponible | no disponible | Apache-2.0 | PyTorch / ONNX |
| YOLO11-pose (Ultralytics) | Una etapa, multi-persona | no disponible | no disponible | AGPL-3.0, con licencia comercial alternativa | PyTorch / ONNX |
| MoveNet (Google) | Una etapa | no disponible | 192x192 (Thunder) y 256x256 (Lightning) | Apache-2.0 | TFLite |

La diferencia principal frente a RTMPose es el enfoque: RTMPose es top-down y necesita un detector de personas previo, mientras que RTMO resuelve deteccion y keypoints en una sola red, lo que simplifica el pipeline y reduce la latencia en escenas con muchas personas. Frente a YOLO11-pose, la ventaja de RTMO-l es la licencia Apache-2.0, mucho mas permisiva para producto comercial cerrado que la AGPL-3.0 de Ultralytics. Frente a MoveNet, RTMO-l ofrece mas resolucion de entrada y un esquema de keypoints mas completo, a costa de un fichero de pesos mayor. No se dispone de datos de precision comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado en la informacion disponible los datos de entrenamiento ni las metricas de evaluacion, por lo que no es posible estimar su precision real en dominios concretos sin una validacion propia.
- Sesgos esperables derivados del dataset de entrenamiento original (tipicamente anotaciones de personas en contextos urbanos y occidentales): el rendimiento suele degradarse con oclusiones severas, cuerpos parcialmente fuera de cuadro, ropa muy holgada, diversidad corporal poco representada y condiciones de iluminacion adversas. Estos sesgos son una expectativa general y no estan cuantificados en la documentacion disponible.
- Riesgo de falsos positivos: aunque no es un modelo generativo y no alucina texto, puede producir keypoints con puntuaciones de confianza altas en articulaciones ocluidas o ambiguas, dado que la cabeza de clasificacion dinamica devuelve una distribucion sobre posiciones.
- Ausencia de contexto y de idioma: todas las filas relacionadas con contexto, idiomas y generacion de texto son no aplicables; el modelo solo procesa imagenes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya adecuadamente. Este repositorio es una copia sin cambios y su autor indica explicitamente que el credito corresponde a OpenMMLab y a Xenova, no a Imagent.
- Advertencia de privacidad: los esqueletos son datos biometricos y su tratamiento en la Union Europea esta sujeto al RGPD, con obligaciones de base juridica, minimizacion y evaluacion de impacto en determinados despliegues.
- Falta de documentacion de preprocesado: la model card no describe normalizacion, escalado ni formato exacto de entrada y salida, por lo que integrarlo en produccion exige consultar la exportacion original de Xenova o el codigo de mmpose.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad sobre esta copia concreta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/imagent/rtmo-l-onnx
- Exportacion ONNX original de Xenova: https://huggingface.co/Xenova/RTMO-l
- Fichero de pesos de origen: https://huggingface.co/Xenova/RTMO-l/resolve/866da24c537be882180eb1bd278bc22cef85c6fd/onnx/model.onnx
- Proyecto RTMO en OpenMMLab mmpose: https://github.com/open-mmlab/mmpose/tree/main/projects/rtmo
- Perfil del autor de la copia: https://huggingface.co/imagent
