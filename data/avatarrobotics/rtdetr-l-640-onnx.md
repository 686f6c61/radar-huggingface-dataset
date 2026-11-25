# avatarrobotics/rtdetr-l-640-onnx

## Resumen

RT-DETR-L 640 (FP32 ONNX) es una exportación del modelo de detección de objetos RT-DETR-L de Ultralytics, publicada por Avatar Robotics para su uso en el robot humanoide P1. El modelo original RT-DETR (Real-Time DEtection TRansformer) sustituye el componente de asignación de anclas y la supresión no máxima (NMS) de los detectores tradicionales por un mecanismo de consultas (queries) aprendidas, lo que permite obtener detecciones directas en una sola pasada. Esta versión concreta se distribuye como un grafo ONNX estático en FP32 con entrada fija de 640×640 y salida de 300 consultas sobre las 80 clases de COCO.

El repositorio no contiene pesos en formato PyTorch ni safetensors, sino únicamente el archivo `rtdetr-l-640.onnx` de aproximadamente 128,8 MB (128.797.834 bytes), pensado para compilarse a un motor TensorRT en dispositivos NVIDIA Jetson Orin. La motivación del autor es operativa: los robots P1 descargan el archivo en su primera actualización, verifican su SHA256 y construyen el motor de inferencia localmente. No se trata, por tanto, de un modelo de propósito general para la comunidad, sino de un artefacto de despliegue con un contrato de entrada/salida muy específico.

La relevancia de esta ficha radica en documentar un caso típico de empaquetado ONNX para edge computing: un detector transformer de tamaño L (el más grande de la familia RT-DETR de Ultralytics) comprimido a un grafo estático sin NMS, con licencia AGPL-3.0 heredada. El modelo no publica benchmarks propios ni datos de entrenamiento adicionales; toda la información técnica procede de la model card del autor y de la documentación pública de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR (Real-Time DEtection TRansformer), transformer con consultas aprendidas y sin NMS |
| Parametros totales | no disponible (el tamaño del archivo ONNX es de 128.797.834 bytes, ~128,8 MB en FP32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija 640×640) |
| Tipos de cuantizacion | FP32 en el artefacto publicado; el autor indica que se compila a TensorRT, pero no se documentan calibraciones INT8 ni FP16 en el repositorio |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las clases de salida son las 80 de COCO en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (opset 17, grafo estático, batch=1, dynamic=False, simplify=False, nms=False) |

## Arquitectura y entrenamiento

El modelo es un RT-DETR-L, la variante grande de la familia RT-DETR integrada en Ultralytics. A diferencia de los detectores YOLO clásicos, RT-DETR utiliza un codificador de imágenes seguido de un decodificador transformer que refina un conjunto fijo de consultas de objeto; cada consulta produce directamente una caja normalizada (`cx, cy, w, h`) y las puntuaciones sigmoideas de las 80 clases COCO. Esta formulación elimina la necesidad de NMS en la inferencia, algo que el autor confirma explícitamente en el contrato del modelo (`nms=False`).

Los pesos de origen son `rtdetr-l.pt` de la release de assets de Ultralytics v8.3.0 (SHA256 `6de60b10d4bc566f00cda0f5b4d64afe4b66d48dc9695d2171effb7859d8e73f`). La exportación se realizó con Ultralytics 8.3.228 y PyTorch 2.8.0, con `imgsz=640`, `batch=1`, grafo estático y sin simplificación. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset (más allá de que son pesos COCO) ni si hubo etapas de RLHF o DPO, algo por otra parte esperable en un detector de objetos. La innovación técnica destacable es precisamente la eliminación de NMS y la exportación estática verificada contra el modelo PyTorch original.

## Capacidades

- Detección de objetos en imágenes RGB con 80 clases COCO; la clase `person` corresponde al índice 0, que es el objetivo declarado del despliegue en el robot P1.
- Salida directa de 300 consultas con cajas normalizadas y puntuaciones sigmoideas, sin paso de NMS posterior.
- Entrada estática FP32 `[1,3,640,640]` en rango 0..1, con reescalado bilineal de la imagen original a 640×640 (sin letterbox ni normalización media/std).
- Inferencia en una sola pasada del transformer, adecuada para compilación a TensorRT en Jetson Orin.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un detector visual.
- No dispone de capacidades multilingües ni de modo "thinking"; las etiquetas de clase son las de COCO en inglés.
- Verificación numérica documentada frente al modelo PyTorch en 15 fotogramas de ojo de pez grabados por el robot: mismas detecciones de persona, cajas con desviación inferior a 0,0007 px y puntuaciones con desviación inferior a 3e-6.

## Casos de uso

- Detección de personas en robots humanoides: el caso de uso primario declarado por el autor; el robot P1 descarga el ONNX, verifica su SHA256 y compila un motor TensorRT para localizar personas en tiempo real con la cámara de a bordo.
- Percepción en edge con Jetson Orin: al ser un grafo estático FP32 sin NMS, se integra en el pipeline de TensorRT del dispositivo y evita dependencias de PyTorch en producción.
- Seguridad y vigilancia en interiores: detección de la clase `person` (índice 0) en flujos de vídeo, aprovechando que la salida ya viene filtrada por consultas y no requiere post-procesado de supresión.
- Automatización de flotas de robots: el contrato de entrada/salida fijo y la verificación por hash facilitan el despliegue reproducible en muchos dispositivos idénticos.
- Prototipado de detección genérica COCO: las 80 clases permiten reutilizar el mismo artefacto para experimentos con sillas, mesas, vehículos u otros objetos sin reentrenar.
- Integración en pipelines de visión con cámaras de ojo de pez: el autor valida el modelo sobre fotogramas de ojo de pez del robot, por lo que es adecuado para ópticas gran angular tras el reescalado a 640×640.
- Evaluación comparativa de exportaciones ONNX: sirve como referencia para medir la fidelidad de una exportación estática frente al modelo PyTorch original en tareas de detección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta una verificación de equivalencia frente al modelo PyTorch (cajas dentro de 0,0007 px y puntuaciones dentro de 3e-6 en 15 fotogramas), no métricas COCO como mAP ni latencias medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: el grafo FP32 ocupa unos 128,8 MB en disco; en memoria de GPU se requiere espacio para los pesos y las activaciones del transformer, aunque el autor no publica cifras de VRAM. Como referencia orientativa, un detector RT-DETR-L en FP32 suele necesitar del orden de 1-2 GB de VRAM, pero este dato no está confirmado en la información disponible.
- GPU recomendadas: el destino declarado es NVIDIA Jetson Orin, donde se compila a TensorRT. También es desplegable en GPUs de escritorio y servidor (A100, H100, RTX 4090, RTX 3090) mediante TensorRT u ONNX Runtime.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM, aunque no se documentan requisitos exactos.
- Opciones de despliegue: TensorRT (vía el compilador de motores en Jetson), ONNX Runtime, y cualquier runtime compatible con ONNX opset 17. No se documenta soporte de llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de latencia ni FPS en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | NMS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RT-DETR-L 640 ONNX (este) | no disponible (~128,8 MB FP32) | Imagen fija 640×640 | No | AGPL-3.0 | Hugging Face, artefacto ONNX estático |
| RT-DETR-L original (Ultralytics) | no disponible | Imagen configurable | No | AGPL-3.0 | Pesos PyTorch `rtdetr-l.pt` en assets de Ultralytics |
| YOLOv8-L | no disponible | Imagen configurable | Sí | AGPL-3.0 | Ultralytics, múltiples formatos (PyTorch, ONNX, TensorRT) |
| YOLO11-L | no disponible | Imagen configurable | Sí | AGPL-3.0 | Ultralytics, múltiples formatos |

La comparación se limita a la familia Ultralytics porque no se dispone de datos de benchmarks ni de parámetros exactos en la información proporcionada. La diferencia principal frente a YOLO es la ausencia de NMS en RT-DETR, que simplifica el post-procesado en edge, y la diferencia frente al RT-DETR-L original es el empaquetado estático ONNX con entrada fija y sin simplificación.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso comercial o servicio en red que incorpore el modelo obliga a liberar el código fuente derivado bajo la misma licencia; es una restricción relevante para productos propietarios.
- El artefacto es un ONNX estático con batch=1 y entrada fija 640×640; no admite imágenes de otras resoluciones ni lotes mayores sin reexportar.
- El reescalado es estirado (sin letterbox), lo que deforma la relación de aspecto original y puede afectar a la precisión en imágenes muy panorámicas o muy verticales.
- No incluye NMS: la salida son 300 consultas directas; si se necesita filtrar por umbral, el consumidor debe aplicar el filtrado por puntuación.
- Riesgo de alucinación inherente a los detectores: puede producir cajas con puntuaciones altas sobre regiones ambiguas o falsos positivos en escenas con oclusiones; no hay umbrales recomendados documentados.
- Sesgos desconocidos: no se documenta la composición del dataset COCO ni posibles sesgos demográficos o de iluminación; los pesos son los estándar de Ultralytics.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje y no debe evaluarse como tal.
- No se publican métricas COCO, latencias ni consumo de VRAM; la única validación es la equivalencia numérica frente a PyTorch en 15 fotogramas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción más allá del despliegue interno del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/avatarrobotics/rtdetr-l-640-onnx
- Documentación de RT-DETR en Ultralytics: https://docs.ultralytics.com/models/rtdetr/
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
- Release de assets de Ultralytics v8.3.0 (pesos de origen `rtdetr-l.pt`): https://github.com/ultralytics/assets/releases/tag/v8.3.0
- Paper original de RT-DETR: https://arxiv.org/abs/2304.08069
