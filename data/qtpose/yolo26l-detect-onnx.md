# qtpose/yolo26l-detect-onnx

## Resumen

El modelo `qtpose/yolo26l-detect-onnx` es una exportación a formato ONNX del detector de objetos Ultralytics YOLO26l, entrenado sobre las 80 clases del conjunto COCO. Lo publica el usuario `qtpose` como artefacto derivado del checkpoint original `yolo26l.pt` (release v8.4.0 de Ultralytics), y su propósito declarado es servir como detector de personas y, en modelos de pose animal, como detector de animales previo al recorte del fotograma para la estimación de pose. No se trata, por tanto, de un modelo entrenado desde cero, sino de una conversión de inferencia optimizada para su integración en un pipeline concreto.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0,1 GB y una única versión publicada el 26 de octubre de 2026. Es un artefacto de despliegue, no un modelo fundacional, y su interés técnico reside en la exportación end-to-end con NMS embebido, que elimina el post-procesado en el cliente.

Arquitectónicamente se corresponde con la familia YOLO26 de Ultralytics en su variante "l" (large), con entrada fija de 640x640 píxeles y salida de hasta 300 detecciones por imagen. No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento ni las técnicas de alineación empleadas, más allá de lo que declara la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26l (detector de objetos de la familia Ultralytics YOLO26), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (el artefacto publicado es ONNX float32) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`yolo26l_detect.onnx`), float32 |

Especificaciones adicionales del artefacto:

| Parámetro | Valor |
|---|---|
| Entrada | `images`, float32, forma `(1, 3, 640, 640)`, RGB, escala 0-1, letterbox |
| Salida | float32, forma `(1, 300, 6)`: `[x1, y1, x2, y2, score, class_id]` en píxeles de la imagen de entrada |
| NMS | Embebido en el grafo (exportación end-to-end) |
| Clases | 80 clases COCO (persona = 0) |
| Opset | 17 |
| Simplificación | No (`simplify=False`) |
| Ejes dinámicos | No (`dynamic=False`) |
| Herramienta de exportación | Ultralytics 8.4.189 |
| SHA-256 | `e2bda06e36639fddfbba0c4f4be8405a6acdbadf15b2f393b8f885fe0db82fb3` |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un detector de objetos de la familia YOLO26 de Ultralytics, en variante "l". La model card no detalla la arquitectura interna (backbone, neck, cabeza de detección), el número de parámetros ni las innovaciones específicas de YOLO26 respecto a versiones anteriores. Lo que sí se documenta es el proceso de conversión: se parte del checkpoint `yolo26l.pt` del release v8.4.0 de los assets de Ultralytics y se exporta con `YOLO(...).export(format="onnx", imgsz=640, opset=17, simplify=False, dynamic=False, nms=True)` usando la versión 8.4.189 de la librería.

La decisión técnica más relevante es la exportación con `nms=True`, que integra la supresión de no máximos dentro del grafo ONNX y produce una salida ya filtrada de hasta 300 detecciones. Esto simplifica el despliegue, pero fija la imagen de entrada a 640x640 y elimina la posibilidad de usar resoluciones dinámicas sin reexportar. No se dispone de información sobre el dataset de entrenamiento (más allá de que cubre las 80 clases COCO), el número de tokens o imágenes vistas, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO, que por otra parte no aplican a un detector.

## Capacidades

- Detección de objetos en imágenes RGB para las 80 clases del conjunto COCO, con la clase 0 reservada a persona.
- Salida end-to-end con NMS embebido: devuelve directamente cajas, puntuaciones y etiquetas de clase, sin post-procesado adicional.
- Entrada de resolución fija 640x640 con letterbox, lo que requiere reescalado y relleno de la imagen original antes de la inferencia.
- Uso previsto como detector de personas y como detector de animales para recortar el fotograma antes de la estimación de pose en los modelos de pose de `qtpose`.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente perceptivo de visión por computador.
- No dispone de capacidades multilingües ni de generación de texto.
- No se documentan modos especiales (thinking, visión, audio) más allá de la detección de objetos.

## Casos de uso

- Detección de personas en pipelines de estimación de pose: el modelo localiza las personas en el fotograma y permite recortar cada instancia antes de pasarla al modelo de pose, reduciendo el área de procesamiento y mejorando la precisión en escenas con varias personas.
- Detección de animales para pose animal: en los modelos de pose animal de `qtpose`, este detector identifica y recorta el animal antes de la estimación, evitando que el modelo de pose procese el fondo completo.
- Preprocesado en sistemas de videovigilancia: al ser un ONNX float32 con NMS embebido, puede desplegarse en un runtime ONNX (ONNX Runtime, TensorRT) para filtrar fotogramas con presencia de personas antes de etapas más costosas.
- Análisis de aforo y conteo: la salida de hasta 300 detecciones por imagen con clase y puntuación permite contar personas u objetos en una escena sin lógica de post-procesado adicional.
- Automatización de anotación de datasets: el detector puede generar cajas candidatas sobre imágenes nuevas para su revisión y corrección manual, acelerando la creación de conjuntos etiquetados.
- Integración en aplicaciones de escritorio o móviles con ONNX Runtime: el tamaño de 0,1 GB y la entrada fija de 640x640 facilitan el despliegue en entornos con recursos limitados, siempre que se respete la licencia AGPL-3.0.
- Módulo de detección en sistemas de realidad aumentada o edición de vídeo: la salida con NMS embebido simplifica la integración en herramientas que necesitan localizar personas u objetos en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al tratarse de un ONNX float32 con entrada fija de 640x640 y un tamaño de repositorio de 0,1 GB, la huella de pesos es del orden de centenares de MB, pero no se documenta el consumo real en ejecución.
- GPU recomendadas: no disponible. No se especifican modelos de GPU probados ni requisitos mínimos.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada. El tamaño del artefacto sugiere que podría ejecutarse en GPU de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: al ser un modelo ONNX, es compatible con runtimes ONNX como ONNX Runtime y potencialmente con TensorRT u otros motores que acepten el formato. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de este modelo que permitan una comparación cuantitativa fiable con alternativas. A modo orientativo, se indican modelos de la misma categoría (detección de objetos COCO en formato ONNX), sin comparar métricas que no se han publicado:

| Modelo | Familia | Entrada | NMS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qtpose/yolo26l-detect-onnx | YOLO26l (Ultralytics) | 640x640 fija | Embebido | AGPL-3.0 | Hugging Face (0 descargas) |
| Ultralytics YOLO26l (`yolo26l.pt`) | YOLO26l (Ultralytics) | Configurable | Configurable | AGPL-3.0 | Assets de Ultralytics |
| YOLOv8l / YOLO11l (Ultralytics) | YOLO (Ultralytics) | Configurable | Configurable | AGPL-3.0 | Assets de Ultralytics |
| Detectores COCO en ONNX de otros autores | Varios | Variable | Variable | Variable | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar precisión (mAP) ni latencia entre estas opciones.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial en productos o servicios en red puede obligar a liberar el código fuente bajo la misma licencia. Ultralytics ofrece una licencia enterprise como alternativa, según se indica en la model card.
- Modelo derivado: es una exportación de `yolo26l.pt`; cualquier limitación del checkpoint original (sesgos del dataset COCO, clases no representadas, rendimiento en dominios distintos) se hereda directamente.
- Sesgos conocidos: no documentados en la información disponible, aunque al entrenarse sobre COCO es previsible un sesgo hacia las categorías y contextos sobrerrepresentados en dicho conjunto.
- Riesgo de alucinación: en un detector de objetos se traduce en falsos positivos y detecciones con baja confianza; no se documentan umbrales recomendados ni calibración.
- Entrada fija de 640x640: no admite resolución dinámica sin reexportar el modelo, lo que limita su uso en imágenes de alta resolución o en escenas con objetos pequeños.
- NMS embebido: aunque simplifica el despliegue, impide ajustar los parámetros de supresión de no máximos en tiempo de inferencia sin reexportar.
- Idiomas: no aplica, pero la información de idiomas figura como no disponible en los metadatos del repositorio.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni validación independiente.
- No se documentan requisitos de hardware, latencia ni precisión (mAP), lo que dificulta evaluar su idoneidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/qtpose/yolo26l-detect-onnx
- Checkpoint original: https://github.com/ultralytics/assets/releases/download/v8.4.0/yolo26l.pt
- Licencia de Ultralytics: https://www.ultralytics.com/license
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
