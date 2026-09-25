# beaunix/florabelle-vision

## Resumen

Florabelle-vision es un modelo de segmentación de instancias de especies de flores desarrollado por el usuario de Hugging Face beaunix (Bryan David Castaño). Se trata de un ajuste fino de YOLOv11-medium de Ultralytics, la arquitectura de detección y segmentación en tiempo real más extendida del ecosistema de visión por computador, sobre un dataset de 7.111 imágenes y 126 especies florales publicado en Roboflow Universe por flowersDetection.

El modelo no es un modelo de lenguaje ni multimodal: es un segmentador de imágenes puro. Su función es devolver, para cada flor presente en una fotografía, una máscara de instancia, una caja delimitadora y la clase de especie correspondiente entre las 126 soportadas. Se distribuye en dos formatos: un checkpoint de PyTorch (`.pt`) para inferencia o reentrenamiento con Ultralytics y una exportación ONNX para despliegue en cualquier runtime compatible.

Su relevancia es acotada pero concreta: cubre un nicho vertical (identificación botánica de flores) que los modelos generalistas de segmentación como SAM 2 no resuelven por sí solos, ya que no asignan etiqueta de especie. Además, forma parte de un sistema mayor, Florabelle, un agente conversacional de visión y ventas que conecta con un backend de tool calling construido con Spring AI. El repositorio se publicó sin métricas de evaluación, sin descargas y sin validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv11-medium (Ultralytics) configurada para segmentación de instancias |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin ventana de contexto textual) |
| Tipos de cuantización | no disponible. Se distribuyen pesos en `.pt` y exportación `.onnx`; la model card no documenta cuantizaciones INT8/FP16. El repositorio incluye la etiqueta `base_model:quantized:Ultralytics/YOLO11` |
| Idiomas soportados | no aplica (no procesa texto ni tiene capacidades lingüísticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoint Ultralytics) y ONNX (`.onnx`) |
| Tarea (pipeline) | image-segmentation |
| Número de clases | 126 especies de flores |
| Modelo base | Ultralytics/YOLO11 |
| Dataset de entrenamiento | flowers_segmentation (Roboflow Universe, autor flowersDetection), 7.111 imágenes, CC BY 4.0 |
| Tamaño del repositorio | 0.0 GB según los metadatos de Hugging Face |
| Librería | ultralytics |

## Arquitectura y entrenamiento

La arquitectura es YOLOv11 en su variante *medium* con cabeza de segmentación de instancias. YOLOv11 es una red convolucional de una sola etapa que predice simultáneamente cajas, clases y máscaras por instancia, con un diseño de cuello basado en C3k2 y atención espacial en las etapas finales del backbone. Al ser un ajuste fino del checkpoint oficial de Ultralytics, hereda los pesos preentrenados del modelo base y se especializa en el dominio floral mediante *transfer learning*.

El entrenamiento se realizó sobre el dataset `flowers_segmentation` de Roboflow Universe (proyecto flowersDetection), compuesto por 7.111 imágenes anotadas con máscaras de instancia sobre 126 especies. No se documentan en la model card el número de épocas, la resolución de entrada, las estrategias de aumento de datos, el *learning rate* ni la partición train/val/test. Tampoco hay constancia de técnicas de alineación tipo RLHF o DPO, que no aplican a un modelo discriminativo de visión. La innovación destacable es de ámbito aplicado, no arquitectónico: la integración del segmentador como herramienta de visión dentro de un agente de ventas con tool calling sobre Spring AI.

## Capacidades

- Segmentación de instancias de flores: genera máscara, caja delimitadora, clase y puntuación de confianza por cada flor detectada.
- Clasificación en 126 especies florales dentro del vocabulario del dataset de entrenamiento.
- Inferencia por lotes sobre imágenes individuales o conjuntos de imágenes mediante la API de Ultralytics o un `InferenceSession` de ONNX Runtime.
- Exportación y reentrenamiento: el checkpoint `.pt` permite continuar el ajuste fino con otras especies o datasets propios.
- Despliegue multiplataforma: la exportación ONNX habilita ejecución en runtimes ONNX, y desde ahí en entornos de servidor, escritorio o *edge*.
- Integración como herramienta de un agente: la model card describe su uso dentro de Florabelle, un agente de visión y ventas que expone el resultado del modelo a un backend de tool calling en Spring AI.
- No soporta generación de texto, razonamiento, código, matemáticas, audio ni diálogo. No tiene tool calling nativo: cualquier orquestación de herramientas la realiza el sistema que lo envuelve.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural de ningún tipo.
- No ofrece *thinking mode* ni modos de razonamiento multi-paso.

## Casos de uso

- Identificación botánica en aplicaciones de jardinería: la app envía una fotografía del usuario al endpoint ONNX y recibe la especie con máscara de la corola, el tallo y las hojas, lo que permite mostrar información de cuidado específica de esa especie.
- Asistente de ventas de floristería: integrado como herramienta de visión de un agente tipo Florabelle, el modelo identifica la flor que el cliente muestra en cámara y el backend de tool calling consulta catálogo, precio y disponibilidad sin intervención humana.
- Inventario automático en floristerías y almacenes: un sistema de cámara fija segmenta y cuenta flores por especie sobre la estantería, generando alertas de reposición cuando el número de instancias de una clase cae por debajo de un umbral.
- Control de calidad en cultivo ornamental: análisis de lotes fotografiados para detectar mezclas de especies o variedades no conformes antes del envío, aprovechando las máscaras para medir proporciones por instancia.
- Ciencia ciudadana y botánica de campo: aplicación móvil offline que usa el modelo ONNX en el dispositivo para etiquetar observaciones florales y subirlas después a una base de datos de biodiversidad, sin necesidad de conectividad.
- Catalogación de bancos de imágenes y marketplaces: etiquetado y segmentación automática de fotografías de producto para generar metadatos de especie, recortes con fondo transparente y filtros de búsqueda por clase.
- Educación y realidad aumentada: superposición de la máscara detectada sobre la cámara en vivo para señalar las partes de la flor y mostrar el nombre científico de la especie identificada.
- Preprocesado para pipelines multimodales: uso del segmentador para aislar la flor del fondo antes de pasarla a un modelo de visión-lenguaje que genere una descripción textual o responda preguntas sobre la planta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye valores de mAP (box ni mask), precisión, recall, matriz de confusión por especie ni curvas precisión-recall. Tampoco se documenta una partición de validación ni comparaciones con el checkpoint YOLOv11-seg preentrenado en COCO o con otros segmentadores. No es posible, por tanto, estimar la calidad real del ajuste fino sobre las 126 clases.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la información proporcionada. Como referencia orientativa y no confirmada por el autor, un modelo de la familia YOLO11-medium suele operar por debajo de los 2 GB en FP16 y de 1 GB en INT8 a resoluciones de entrada habituales (640 px).
- GPU recomendadas: no disponible. Cualquier GPU con soporte CUDA y al menos 4 GB de memoria debería ser suficiente para la variante medium; en el extremo alto, una NVIDIA A100 o H100 solo aporta ventaja en escenarios de alto *throughput* por lotes.
- GPU de consumo: previsiblemente cabe en tarjetas de gama media y alta (RTX 3060, RTX 4060, RTX 4090) por el tamaño reducido de la familia YOLO11-medium. No confirmado con mediciones publicadas.
- Ejecución en CPU: viable mediante ONNX Runtime, con latencias mayores y no cuantificadas en la información disponible.
- Opciones de despliegue: Ultralytics (PyTorch) para inferencia y reentrenamiento; ONNX Runtime para servir el `.onnx`; exportaciones adicionales a TensorRT, OpenVINO o TFLite son posibles desde el checkpoint Ultralytics, aunque el autor no las distribuye.
- No aplican vLLM, TGI, Ollama ni llama.cpp: son servidores de modelos de lenguaje y este es un segmentador de imágenes.
- Latencia y throughput: no disponibles. No se publican mediciones por imagen ni por lote en ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Clases | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| beaunix/florabelle-vision | Segmentación de instancias floral | no disponible | 126 especies de flores | Sin métricas publicadas | AGPL-3.0 | Hugging Face, `.pt` y `.onnx` |
| Ultralytics YOLO11-seg (COCO) | Segmentación de instancias general | no disponible en la información proporcionada | 80 clases COCO | Métricas publicadas por Ultralytics | AGPL-3.0 o licencia Enterprise | Repositorio Ultralytics, pesos oficiales |
| Meta SAM 2 | Segmentación promptable sin etiqueta de clase | no disponible en la información proporcionada | Sin clases semánticas | Métricas publicadas por Meta | Apache 2.0 (según el repositorio de Meta) | Pesos abiertos en Meta AI |
| Mask R-CNN (Detectron2) | Segmentación de instancias | no disponible en la información proporcionada | Configurable por dataset | Métricas publicadas por el proyecto | Apache 2.0 | Framework Detectron2 |

La diferencia funcional clave frente a SAM 2 y a los segmentadores generalistas es que Florabelle-vision asigna directamente una etiqueta de especie entre 126, sin necesidad de un clasificador posterior. Frente a YOLO11-seg preentrenado en COCO, sustituye las 80 clases genéricas por el vocabulario botánico específico. No se dispone de datos que permitan comparar precisión entre estas alternativas en el dominio floral.

## Limitaciones y advertencias

- Dominio cerrado: solo reconoce las 126 especies del dataset de entrenamiento. Cualquier flor fuera de ese vocabulario se asignará a la clase más parecida o se descartará, sin aviso explícito de clase desconocida.
- Sin métricas publicadas: no hay mAP, precisión ni recall, por lo que no es posible estimar la tasa de error real ni el desbalance entre clases.
- Dataset modesto: 7.111 imágenes repartidas entre 126 clases arrojan una media de unas 56 imágenes por especie, un volumen bajo que probablemente deja clases con muy pocos ejemplos y riesgo de sobreajuste.
- Sensibilidad esperable a condiciones de captura: iluminación, oclusión, desenfoque, fondo y ángulo no están documentados como parte del aumento de datos, por lo que el comportamiento fuera de distribución es incierto.
- Licencia AGPL-3.0: el uso comercial en un servicio propietario obliga a liberar el código fuente correspondiente bajo la misma licencia, incluido el caso de ofrecer el modelo como servicio en red. El autor indica explícitamente que no se adquirió una licencia Enterprise de Ultralytics, por lo que la vía de excepción comercial no está cubierta por esta publicación.
- Atribución obligatoria al dataset: las imágenes de entrenamiento son CC BY 4.0 y deben acreditarse a flowersDetection y a Roboflow Universe en cualquier uso derivado.
- Estado del repositorio: aparece con 0 descargas y 0 likes, y con un tamaño declarado de 0.0 GB, lo que impide confirmar desde los metadatos la presencia efectiva de los pesos en el repositorio.
- Ausencia de soporte: no se documentan tareas de mantenimiento, versionado ni issues atendidos por el autor.
- No es un modelo generativo ni conversacional: no puede sustituir a un LLM y requiere un orquestador externo para cualquier flujo de diálogo o tool calling.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/beaunix/florabelle-vision
- Perfil del autor en Hugging Face: https://huggingface.co/beaunix
- Dataset de entrenamiento flowers_segmentation (Roboflow Universe): https://universe.roboflow.com/flowersdetection/flowers_segmentation
- Repositorio de Ultralytics (arquitectura YOLO11 y utilidades de entrenamiento): https://github.com/ultralytics/ultralytics
