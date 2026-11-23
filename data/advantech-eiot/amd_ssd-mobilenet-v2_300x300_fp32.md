# Advantech-EIOT/AMD_ssd-mobilenet-v2_300x300_FP32

## Resumen

SSD MobileNetV2 es un detector de objetos de una sola etapa que combina la red troncal MobileNetV2 con la cabeza de detección SSD (Single Shot MultiBox Detector). El modelo original fue entrenado por Google sobre el conjunto de datos COCO y publicado en el zoo de modelos de la API de detección de TensorFlow (TF1). Esta ficha describe la conversión a ONNX en precisión FP32 distribuida por Advantech-EIOT, que no ha reentrenado ni recuantizado los pesos: se limita a exportar el grafo congelado de TensorFlow mediante `tf2onnx` y a fijar una interfaz de entrada NCHW float32.

La relevancia de este artefacto es fundamentalmente práctica: proporciona un detector ligero, con entrada de 300x300 píxeles, en un formato portable (ONNX, opset 13, batch 1) que se puede ejecutar en runtimes heterogéneos, incluidos los aceleradores integrados en las plataformas AMD Ryzen AI. Está pensado como referencia de benchmark dentro del SDK AMD EdgeAI de Advantech, no como un modelo de propósito general de altas prestaciones.

Conviene subrayar que el repositorio contiene únicamente la red troncal y la cabeza de detección. No incluye el preprocesado de TensorFlow, la decodificación de cajas ni la supresión de no máximos (NMS), por lo que cualquier uso en producción exige implementar esos pasos en el pipeline de inferencia. El tamaño del repositorio es de aproximadamente 0,1 GB y la licencia declarada es Apache-2.0, heredada del modelo original de TensorFlow Models.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSD (Single Shot MultiBox Detector) con backbone MobileNetV2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | solo FP32 en este repositorio; no se distribuyen variantes INT8/FP16 |
| Idiomas soportados | no disponible (modelo de visión; etiquetas de clase en inglés derivadas de COCO) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 13, batch 1, entrada 300x300) |

Especificaciones adicionales de la interfaz:

| Tensor | Tipo | Forma | Descripción |
|---|---|---|---|
| Entrada `input` | F32 | `[1, 3, 300, 300]` | NCHW, RGB, escalado a -1..1 |
| Salida `box_encodings` | F32 | `[1, 1917, 4]` | Codificaciones de caja relativas a las anclas SSD |
| Salida `class_logits` | F32 | `[1, 1917, 91]` | Logits de clase, índice 0 = fondo |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SSD, un detector de una sola etapa que predice simultáneamente cajas delimitadoras y probabilidades de clase a partir de mapas de características de varias resoluciones. La red troncal es MobileNetV2, una CNN con bloques residuales invertidos y conexiones lineales de cuello de botella, diseñada para inferencia eficiente en dispositivos con recursos limitados. La cabeza SSD produce 1917 anclas sobre una rejilla de 300x300 píxeles de entrada, con 91 clases (índice 0 reservado para el fondo) según la taxonomía de COCO.

El entrenamiento original lo realizó Google sobre COCO y se publicó como `ssd_mobilenet_v2_coco_2018_03_29` en el zoo de modelos TF1. No hay información en la documentación proporcionada sobre el número de tokens, la composición exacta del dataset, ni sobre si se aplicaron técnicas de refinamiento como RLHF o DPO (no procede en un detector de objetos). La conversión a ONNX se realizó con `tf2onnx`, conservando únicamente el tramo que va desde la entrada preprocesada hasta las codificaciones de cajas y los logits de clase. Se modificó la interfaz de entrada de NHWC uint8 a NCHW float32 ya escalado a -1..1. No hubo reentrenamiento ni cuantización, y el autor no reclama ninguna reevaluación de precisión para esta conversión.

## Capacidades

- Detección de objetos en imágenes: identifica y localiza instancias de las 91 categorías de COCO (incluido el fondo) mediante cajas delimitadoras y logits de clase.
- Procesamiento de imágenes RGB de 300x300 píxeles en formato NCHW con normalización a -1..1.
- Inferencia en lote de tamaño 1 (batch 1), adecuada para escenarios de tiempo real por fotograma.
- Exportación portable a ONNX (opset 13), ejecutable en runtimes compatibles con ONNX Runtime y aceleradores que lo soporten.
- No incluye tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de texto o audio.
- No incluye capacidades multilingües ni de generación de lenguaje: es exclusivamente un modelo de visión.
- No incorpora modo de razonamiento explícito (thinking mode) ni decodificación especulativa.
- No incluye preprocesado, decodificación de cajas ni NMS: esas etapas deben implementarse externamente.

## Casos de uso

- Detección de objetos en el borde (edge computing): el modelo, con entrada de 300x300 y backbone MobileNetV2, está pensado para ejecutarse en plataformas con aceleradores integrados como AMD Ryzen AI, donde el formato ONNX permite aprovechar los motores de inferencia del SDK AMD EdgeAI de Advantech.
- Benchmark de rendimiento en hardware AMD: al ser un artefacto de referencia del SDK, se usa para medir latencia y throughput de la inferencia FP32 en distintas configuraciones de CPU/GPU/NPU dentro de la plataforma Ryzen AI.
- Prototipado rápido de pipelines de visión: sirve como detector base en pruebas de concepto de vigilancia, conteo de personas o análisis de escenas, siempre que se añadan la decodificación de cajas y la NMS en el código de la aplicación.
- Sistemas de conteo y localización en tiempo real: con batch 1 y una resolución moderada, es adecuado para procesar fotogramas de vídeo en aplicaciones de aforo, control de accesos o monitorización de espacios.
- Validación de cadenas de conversión y despliegue: útil para verificar que un runtime ONNX (ONNX Runtime, TensorRT, OpenVINO, etc.) y un pipeline de preprocesado/postprocesado funcionan correctamente antes de migrar a modelos más pesados.
- Educación y experimentación: por su licencia Apache-2.0 y su tamaño reducido (0,1 GB), es un candidato cómodo para prácticas de detección de objetos, comparación de backbones y estudio de la arquitectura SSD.
- Integración en aplicaciones de robótica o IoT: la baja huella del modelo permite incorporarlo en dispositivos con memoria limitada para tareas de percepción básica, como evitar obstáculos o detectar objetos de interés en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no reclama ninguna reevaluación de precisión para esta conversión a ONNX.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa aproximadamente 0,1 GB, lo que da una idea del orden de magnitud de los pesos en FP32; el consumo real depende del runtime y de las activaciones intermedias.
- GPU recomendadas: no disponible. Al tratarse de un modelo orientado a edge, el hardware objetivo declarado son las plataformas AMD Ryzen AI con aceleradores integrados; no se especifican GPU discretas concretas (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible. Por el tamaño del modelo es plausible que quepa en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: ONNX Runtime es el runtime natural; también puede ejecutarse en otros motores compatibles con ONNX (TensorRT, OpenVINO, etc.) y en el SDK AMD EdgeAI de Advantech. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. No se han publicado cifras de latencia ni de imágenes por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Formato | Licencia | Contexto / observaciones |
|---|---|---|---|---|---|
| SSD MobileNetV2 (este repositorio) | SSD + MobileNetV2 | 300x300 | ONNX FP32, opset 13 | Apache-2.0 | Conversión de TF1; sin NMS ni decodificación incluidas |
| SSD MobileNetV2 original (TF1 zoo) | SSD + MobileNetV2 | 300x300 | Grafo congelado TensorFlow | Apache-2.0 | Entrenado por Google sobre COCO; incluye pipeline TF |
| Otros detectores ligeros de la familia SSD | SSD + backbone ligero | variable | TF / ONNX / otros | variable | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas en la información proporcionada.

## Limitaciones y advertencias

- No incluye preprocesado, decodificación de cajas ni NMS: el usuario debe implementar estos pasos; de lo contrario, las salidas no son directamente utilizables como detecciones finales.
- Ausencia de reevaluación de precisión: el autor no reclama ninguna métrica de exactitud para la conversión ONNX, por lo que el rendimiento real puede diferir del modelo original en TensorFlow.
- Sesgos conocidos: al entrenarse sobre COCO, hereda los sesgos de ese dataset (posible infrarrepresentación de ciertas categorías, contextos o demografías). No se documentan análisis de sesgo específicos.
- Riesgo de falsos positivos y negativos: como todo detector de una etapa, puede fallar en objetos pequeños, ocluidos o en condiciones de iluminación adversas; no hay datos publicados sobre su comportamiento en dominios distintos a COCO.
- Limitaciones de idioma: no aplica en el sentido lingüístico, pero las etiquetas de clase están en inglés y derivadas de COCO; no hay soporte para categorías personalizadas sin reentrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las imágenes de COCO provienen de Flickr bajo licencias diversas; el autor advierte de esta circunstancia.
- Caveat de producción: el modelo está pensado como referencia de benchmark del SDK AMD EdgeAI de Advantech, no como un detector de altas prestaciones; para producción con requisitos de precisión estrictos conviene evaluar alternativas más modernas o reentrenar sobre el dominio objetivo.
- Sin soporte de texto, audio ni agentes: cualquier expectativa en ese sentido queda fuera del alcance del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Advantech-EIOT/AMD_ssd-mobilenet-v2_300x300_FP32
- Paper de MobileNetV2: https://arxiv.org/abs/1801.04381
- Zoo de modelos de detección TF1: https://github.com/tensorflow/models/blob/master/research/object_detection/g3doc/tf1_detection_zoo.md
- Modelo original `ssd_mobilenet_v2_coco_2018_03_29.tar.gz`: http://download.tensorflow.org/models/object_detection/ssd_mobilenet_v2_coco_2018_03_29.tar.gz
- Licencia de TensorFlow Models: https://github.com/tensorflow/models/blob/master/LICENSE
