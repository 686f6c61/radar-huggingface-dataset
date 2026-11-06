# Blaize-AI/YOLOPOSE26x_COCOKeypoint

## Resumen

YOLO26x-pose COCO Keypoints es un modelo de estimación de pose (pose detection) basado en la arquitectura YOLO Pose versión 26 en su variante X-Large, originalmente desarrollada por Ultralytics en PyTorch. La versión publicada en este repositorio ha sido optimizada por Blaize-AI para su despliegue sobre aceleradores de inferencia Blaize Xplorer mediante el SDK Picasso, que compila y adapta el grafo computacional a la arquitectura Graph Streaming Processor (GSP) de Blaize, orientada a inferencia en el borde con bajo consumo y baja latencia.

El modelo resuelve la detección de personas y la estimación de sus keypoints corporales (puntos clave del esqueleto) sobre imágenes, empleando el dataset COCO Keypoints 2017 para su entrenamiento. No es un modelo de lenguaje ni un transformer generativo: es una red convolucional de visión para una tarea única y acotada, por lo que su relevancia no reside en capacidades generales sino en su disponibilidad como binario precompilado para hardware específico.

La relevancia práctica de este repositorio es limitada y muy específica: los pesos se distribuyen en formato `.bm` (Blaize Model), no en safetensors ni GGUF, y su ejecución requiere hardware Blaize Xplorer y el SDK Picasso. Para cualquier uso fuera de esa plataforma, lo razonable es acudir al modelo original de Ultralytics. El repositorio ocupa 0,2 GB e incluye dos variantes de cuantización AMP con resoluciones de entrada distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO Pose v26 X-Large (red convolucional, framework original PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | INT8, BF16 y AMP (mezcla INT8/BF16); las variantes publicadas son AMP |
| Idiomas soportados | no disponible (tarea de visión, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.bm` (Blaize Model), compilado para GSP; no se distribuyen safetensors ni GGUF |

Variantes incluidas en el repositorio:

| Variante | Cuantizacion | Resolucion de entrada (W×H) | Fichero |
|---|---|---|---|
| YOLOPOSE26x_COCOKeypoint_amp_640_384 | AMP | 640×384 | `YOLOPOSE26x_COCOKeypoint_amp_640_384.bm` |
| YOLOPOSE26x_COCOKeypoint_amp_640_640 | AMP | 640×640 | `YOLOPOSE26x_COCOKeypoint_amp_640_640.bm` |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO Pose versión 26 en escala X-Large, una red convolucional de una sola etapa que realiza simultáneamente detección de personas y regresión de keypoints. El modelo original se desarrolla en PyTorch dentro del repositorio de Ultralytics y se distribuye bajo doble licencia AGPL-3.0-only o licencia empresarial de Ultralytics. Blaize no ha modificado el código fuente del modelo, sino que ha aplicado optimizaciones específicas de hardware para que el grafo sea compatible con el Graph Streaming Processor (GSP) de Blaize, una arquitectura de flujo de grafo pensada para reducir latencia y consumo en inferencia en el borde.

El entrenamiento se realizó sobre COCO Keypoints 2017 (licencia CC-BY-4.0, atribución al COCO Consortium). La model card no detalla el número de tokens o imágenes efectivas, la composición exacta del dataset, ni si hubo etapas de ajuste fino adicionales por parte de Blaize; esa información no está disponible. Tampoco se documentan innovaciones técnicas propias más allá de la compilación y cuantización para el acelerador: las variantes publicadas usan AMP (mezcla de INT8 y BF16), y la card menciona INT8 puro y BF16 puro como métodos de cuantización soportados por el toolchain, aunque no se incluyen ficheros de esas variantes en el repositorio.

## Capacidades

- Detección de personas y estimación de keypoints corporales sobre imágenes, con el esquema de keypoints de COCO.
- Inferencia de una sola etapa: la red devuelve cajas de persona y puntos clave en una única pasada.
- Dos resoluciones de entrada precompiladas: 640×384 y 640×640, lo que permite intercambiar precisión espacial por coste computacional.
- Ejecución sobre acelerador Blaize Xplorer mediante el SDK Picasso, con el modelo empaquetado en formato `.bm`.
- Inspección del modelo con la utilidad `blaize-modeltool` del SDK.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual y de tarea única.
- No se documentan capacidades multilingües ni modos especiales como thinking, audio o vídeo explícito.

## Casos de uso

- Análisis de postura en entornos industriales: el modelo detecta operarios y sus keypoints para comprobar ergonomía o posturas de riesgo en puestos de trabajo, aprovechando la inferencia de baja latencia en el acelerador Blaize Xplorer en el propio puesto o en un gateway cercano.
- Control de acceso y presencia en el borde: con la variante 640×384, de menor coste, se puede verificar la presencia y posición de personas en una cámara fija sin enviar vídeo a la nube, lo que reduce ancho de banda y exposición de datos.
- Análisis deportivo y biomecánico: la variante 640×640 ofrece mayor resolución espacial para extraer esqueletos en secuencias de entrenamiento y calcular ángulos articulares, siempre que se disponga de hardware Blaize para desplegarlo.
- Monitorización de caídas en entornos asistenciales: la estimación de keypoints permite detectar posturas compatibles con una caída; el despliegue en acelerador de borde encaja con requisitos de privacidad en residencias y domicilios.
- Robótica y sistemas de interacción humano-máquina: la posición de las articulaciones sirve como señal de entrada para seguimiento de personas o para que un brazo robótico ajuste su comportamiento respecto a un operario cercano.
- Evaluación comparativa de cuantizaciones: las dos variantes AMP permiten medir en el propio hardware la pérdida de precisión al pasar de 640×640 a 640×384 y decidir el compromiso adecuado para un producto.
- Prototipado en el SDK Picasso: sirve como ejemplo de referencia para validar el flujo de compilación y despliegue de modelos de visión en GSP antes de portar modelos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (AP, AP50, OKS), latencia ni throughput para las variantes AMP, ni comparaciones con el modelo original de Ultralytics.

## Requisitos de hardware

- Acelerador Blaize Xplorer obligatorio: los ficheros `.bm` están compilados para el Graph Streaming Processor de Blaize y no se ejecutan en GPU convencionales.
- SDK Picasso instalado y configurado; la utilidad `blaize-modeltool` permite inspeccionar el modelo con `blaize-modeltool info -i hf://Blaize-AI/YOLOPOSE26x_COCOKeypoint/YOLOPOSE26x_COCOKeypoint_amp_640_640.bm`.
- VRAM estimada: no disponible; el modelo no se ejecuta sobre memoria de GPU estándar.
- GPU recomendadas: no aplica. No hay soporte documentado para A100, H100 ni RTX 4090 con estos pesos.
- Compatibilidad con GPU de consumo: no. Para ejecutar YOLO Pose v26 en una GPU convencional hay que usar los pesos originales de Ultralytics en PyTorch, no estos binarios.
- Opciones de despliegue: exclusivamente el runtime de Blaize Picasso sobre hardware Xplorer. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| YOLO26x-pose COCO Keypoints (Blaize) | no disponible | 640×384 / 640×640 | `.bm` | AGPL-3.0 | Blaize Xplorer (GSP) |
| YOLO Pose v26 X-Large (Ultralytics, original) | no disponible | configurable | PyTorch (`.pt`) | AGPL-3.0-only o licencia enterprise | GPU/CPU convencionales |
| Otros modelos de pose de una etapa del ecosistema YOLO | no disponible | configurable | PyTorch, ONNX | según autor | GPU/CPU |

La comparación relevante es contra el modelo original de Ultralytics: misma arquitectura y mismos datos de entrenamiento, pero distinto formato, licencia efectiva y plataforma de ejecución. Cualquier alternativa fuera del ecosistema YOLO (por ejemplo, estimadores de pose top-down de dos etapas) no está documentada en la información disponible para este repositorio, por lo que no se ofrece una comparación numérica.

## Limitaciones y advertencias

- Dependencia total de hardware propietario: sin un acelerador Blaize Xplorer y el SDK Picasso, los pesos `.bm` no son utilizables.
- No se distribuyen pesos en safetensors, ONNX ni GGUF, lo que impide reutilizar el modelo en pipelines estándar de PyTorch o TensorFlow.
- Licencia AGPL-3.0: el uso en servicios de red puede obligar a liberar el código fuente del servicio; para uso comercial cerrado habría que evaluar la licencia enterprise de Ultralytics sobre el modelo original.
- La model card incluye un descargo de Blaize que exime a la empresa de garantías sobre el contenido de terceros y sobre posibles infracciones de propiedad intelectual; el usuario asume el riesgo de uso.
- No hay métricas publicadas de precisión tras la cuantización AMP, por lo que se desconoce la degradación respecto al modelo en punto flotante.
- Sesgos: no documentados en la información disponible. Al entrenarse con COCO Keypoints 2017, hereda las limitaciones de cobertura, diversidad demográfica y condiciones de captura de ese dataset.
- Riesgo de fallo en poses ocluidas, multitudes densas, personas de pequeño tamaño en la imagen y ángulos poco representados; no hay datos publicados que cuantifiquen estos fallos.
- Sin soporte de idioma ni texto: no aplica procesamiento lingüístico, pero tampoco debe esperarse ninguna capacidad fuera de la estimación de pose.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Las fechas de creación y actualización del repositorio (2026) deben tomarse como metadatos del propio repositorio, no como indicación de madurez del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Blaize-AI/YOLOPOSE26x_COCOKeypoint
- Modelo original (Ultralytics): https://www.github.com/ultralytics/ultralytics
- Dataset COCO Keypoints 2017: https://cocodataset.org
- Blaize: https://www.blaize.com
