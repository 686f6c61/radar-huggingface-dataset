# qtpose/yolo26s-detect-onnx

## Resumen

YOLO26s-detect-onnx es una exportación a formato ONNX del detector de objetos YOLO26s de Ultralytics, entrenado sobre las 80 clases del conjunto COCO. Lo publica el usuario qtpose como artefacto listo para inferencia, sin necesidad de framework de origen ni de post-procesado NMS, ya que el grafo ONNX incorpora la supresión de no máximos de extremo a extremo. El modelo se usa internamente como detector de personas y, en los modelos de pose animal, como detector previo que recorta el fotograma antes de la estimación de pose.

Se trata de un modelo de visión por computador puro, sin capacidades de lenguaje ni multimodalidad: recibe un tensor de imagen RGB de 640x640 píxeles y devuelve hasta 300 detecciones con coordenadas, puntuación y clase. No hay parámetros de lenguaje, contexto textual ni generación. La relevancia de esta ficha es acotada: documenta un artefacto derivado de pesos Ultralytics bajo licencia AGPL-3.0, útil para pipelines de detección en producción donde se prefiera ONNX Runtime frente a PyTorch.

El repositorio tiene un tamaño de 0,0 GB según HuggingFace, lo que sugiere que el archivo de pesos no está realmente alojado o que la métrica no se ha actualizado; conviene verificar la descarga antes de integrarlo. No se han publicado métricas de rendimiento, benchmarks ni información sobre el proceso de entrenamiento de YOLO26s en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de detección de objetos de una etapa (familia YOLO, Ultralytics YOLO26s); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 640x640 píxeles) |
| Tipos de cuantización | no disponible (el artefacto publicado es ONNX en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión; las clases COCO están en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`yolo26s_detect.onnx`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de YOLO26s más allá de su pertenencia a la familia Ultralytics YOLO y de que se trata de un detector de objetos de una etapa. El artefacto publicado es una exportación ONNX generada con Ultralytics 8.4.189 mediante `YOLO("yolo26s.pt").export(format="onnx", imgsz=640, opset=17, simplify=False, dynamic=False, nms=True)`. La exportación fija la entrada a `(1, 3, 640, 640)` en float32, con escala 0-1 y letterboxing, y produce una salida `(1, 300, 6)` donde cada fila es `[x1, y1, x2, y2, score, class_id]` en píxeles de la imagen de entrada. Al usar `nms=True`, la supresión de no máximos queda embebida en el grafo, de modo que el consumidor no necesita aplicar NMS posterior.

El checkpoint de origen es `yolo26s.pt` de la release v8.4.0 de los assets de Ultralytics. No se especifican en la model card el número de tokens de entrenamiento (no aplica), la composición del dataset más allá de las 80 clases COCO, ni si hubo técnicas de alineación como RLHF o DPO (no aplicables a un detector). Tampoco se documentan innovaciones técnicas específicas de YOLO26s, como decodificación especulativa o atención lineal, que en cualquier caso no corresponden a este tipo de modelo. El SHA-256 del archivo es `f13b5ed01c2db50b6cd0009422ad3ae672b45f51f5536bb9c4f910b154f3ce80`, dato útil para verificar integridad en despliegues.

## Capacidades

- Detección de objetos en imágenes: 80 clases del conjunto COCO, con `person = 0` como clase principal en el uso previsto por qtpose.
- Salida end-to-end con NMS embebido: hasta 300 detecciones por imagen, cada una con caja delimitadora, puntuación de confianza y clase.
- Entrada de imagen fija: tensor float32 `(1, 3, 640, 640)`, RGB, escala 0-1, con letterboxing.
- Uso como detector previo (crop) para modelos de pose: recorta el fotograma alrededor de la persona o animal detectado antes de la estimación de pose.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.
- No se documentan capacidades de segmentación, tracking ni clasificación; el pipeline declarado es exclusivamente `object-detection`.

## Casos de uso

- Detección de personas en pipelines de pose estimation: qtpose usa este ONNX como primer estadio para localizar personas y recortar la región antes de pasar la imagen a un modelo de pose; el NMS embebido simplifica el código de integración.
- Detección de animales para modelos de pose animal: en el mismo flujo, el detector localiza el animal y genera el recorte que alimenta el estimador de pose, evitando falsos positivos sobre el fondo.
- Preprocesado en aplicaciones de videovigilancia: el modelo puede filtrar fotogramas con presencia humana antes de enviarlos a etapas más costosas, reduciendo el cómputo aguas abajo.
- Análisis de aforo y conteo de personas: al devolver cajas de la clase `person` con puntuación, permite contar ocupantes en una escena sin post-procesado adicional.
- Integración en aplicaciones de escritorio o móviles con ONNX Runtime: al ser un grafo ONNX autocontenido, se puede desplegar en entornos sin PyTorch, incluyendo C++, C# o Java.
- Automatización de anotación de datasets: el detector puede generar preanotaciones de cajas COCO para revisión humana, acelerando el etiquetado de imágenes nuevas.
- Filtrado previo en sistemas de reconocimiento de acciones: descartar fotogramas sin personas antes de alimentar un clasificador de acciones reduce latencia y falsos positivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión al no conocerse el número de parámetros; para un detector YOLO de variante "s" a 640x640 en float32, el uso típico se sitúa en el orden de 1-2 GB, pero este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponibles en la documentación. Por el tamaño de la variante "s" y la resolución 640, es razonable esperar que funcione en GPUs consumer, pero no se confirma.
- ¿Cabe en GPU consumer? No confirmado; la variante "s" de la familia YOLO suele caber en GPUs consumer de gama media, pero no hay dato oficial en esta ficha.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), y cualquier runtime compatible con ONNX (por ejemplo, TensorRT previa conversión). No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qtpose/yolo26s-detect-onnx | Detector YOLO26s exportado a ONNX | 1x3x640x640 float32 | 1x300x6 con NMS embebido | AGPL-3.0 | HuggingFace (qtpose) |
| Ultralytics YOLO26s (`yolo26s.pt`) | Detector YOLO26s en PyTorch | Dinámica según exportación | Requiere NMS posterior salvo exportación con `nms=True` | AGPL-3.0 | GitHub Ultralytics assets v8.4.0 |
| Otros detectores COCO de una etapa (p. ej. variantes YOLOv8/YOLO11 de Ultralytics) | Detector de una etapa | Típicamente 640x640 | Cajas + clase + score | AGPL-3.0 | HuggingFace / GitHub |

No se dispone de datos de rendimiento (mAP, latencia) para establecer una comparación cuantitativa con alternativas. La comparación anterior se limita a aspectos de formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial en productos o servicios en red puede obligar a liberar el código fuente bajo la misma licencia; Ultralytics ofrece una licencia enterprise como alternativa, según indica la model card.
- Modelo de visión sin capacidades de lenguaje: no debe emplearse para tareas de texto, razonamiento, agentes ni tool calling.
- Clases limitadas a las 80 de COCO: no detecta categorías fuera de ese conjunto; para dominios específicos requiere fine-tuning.
- Entrada fija a 640x640 con letterboxing: imágenes de otra resolución deben redimensionarse y rellenarse, lo que puede degradar la detección de objetos muy pequeños.
- NMS embebido con límite de 300 detecciones: escenas muy densas pueden perder objetos por el tope de salida.
- No se documentan sesgos específicos del modelo; como detector COCO, hereda los sesgos de representación del dataset original (posibles diferencias de rendimiento según contexto, iluminación o demografía).
- Riesgo de falsos positivos y falsos negativos inherente a cualquier detector; no se han publicado métricas de precisión o recall para este artefacto.
- Tamaño del repositorio reportado como 0,0 GB: conviene verificar que el archivo ONNX está efectivamente disponible antes de integrarlo en producción.
- No se documenta soporte de cuantización ni de entradas dinámicas; el despliegue en hardware con requisitos estrictos de memoria puede requerir reexportación o cuantización manual.
- Sin garantías de mantenimiento por parte del autor: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- HuggingFace: https://huggingface.co/qtpose/yolo26s-detect-onnx
- Checkpoint de origen (Ultralytics assets v8.4.0): https://github.com/ultralytics/assets/releases/download/v8.4.0/yolo26s.pt
- Licencia Ultralytics: https://www.ultralytics.com/license
- Perfil del autor en HuggingFace: https://huggingface.co/qtpose
