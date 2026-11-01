# qtpose/yolo26n-detect-onnx

## Resumen

YOLO26n detect (ONNX) es una exportación a formato ONNX del detector de objetos YOLO26n de Ultralytics, entrenado sobre las 80 clases del dataset COCO. El modelo lo publica el usuario `qtpose` como artefacto auxiliar dentro de su pipeline de estimación de pose: se utiliza como detector de personas y, en los modelos de pose animal, como detector del animal que se recorta antes de la estimación de pose. No se trata, por tanto, de un modelo de lenguaje ni de un modelo multimodal generativo, sino de un detector de objetos convolucional de propósito específico.

El artefacto es un fichero ONNX único de aproximadamente 0 GB según el tamaño del repositorio, con entrada fija de `(1, 3, 640, 640)` en float32 y salida de `(1, 300, 6)` en la que cada fila codifica `[x1, y1, x2, y2, score, class_id]`. La exportación incluye NMS embebido (export end-to-end), de modo que el consumidor no necesita aplicar supresión de no máximos posterior. El modelo se exportó con Ultralytics 8.4.189 a partir del checkpoint `yolo26n.pt` de la release v8.4.0 de assets, con `opset=17`, `imgsz=640`, `simplify=False`, `dynamic=False` y `nms=True`.

Su relevancia es acotada pero clara: ofrece un detector COCO pequeño y listo para inferencia en runtime ONNX, sin dependencia del framework de entrenamiento, lo que simplifica el despliegue en entornos de producción con ONNX Runtime. La licencia AGPL-3.0 heredada de los pesos de Ultralytics es el principal condicionante para su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de detección de objetos (familia YOLO26 de Ultralytics); detalles internos de capas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (el artefacto publicado es ONNX float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión); etiquetas de clase en inglés según COCO |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`yolo26n_detect.onnx`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de YOLO26n más allá de su pertenencia a la familia YOLO26 de Ultralytics y de su naturaleza como detector convolucional de una sola etapa. El checkpoint de origen es `yolo26n.pt` de la release v8.4.0 de Ultralytics, entrenado sobre las 80 clases de COCO. No se especifican en la información proporcionada el número de tokens o imágenes de entrenamiento, la composición exacta del dataset, ni si hubo etapas de ajuste fino adicionales por parte del publicador.

La innovación técnica relevante en este artefacto concreto es la exportación end-to-end con NMS embebido: el grafo ONNX incluye la supresión de no máximos, de forma que la salida ya viene filtrada a un máximo de 300 detecciones con coordenadas en píxeles de la imagen de entrada. La exportación se realizó con `opset=17`, entrada estática de 640×640 (sin ejes dinámicos) y sin simplificación del grafo (`simplify=False`). El preprocesado esperado es RGB, escalado a rango 0-1 y letterboxing a 640×640.

## Capacidades

- Detección de objetos en imágenes para las 80 clases de COCO, con la clase `person` indexada como 0.
- Salida end-to-end con NMS embebido: hasta 300 detecciones por imagen en formato `[x1, y1, x2, y2, score, class_id]`.
- Coordenadas expresadas en píxeles de la imagen de entrada, lo que facilita el recorte directo de regiones para etapas posteriores.
- Uso como detector de personas en pipelines de estimación de pose humana.
- Uso como detector de animales para recortar el frame antes de la estimación de pose animal.
- Inferencia independiente del framework de entrenamiento mediante ONNX Runtime u otros runtimes compatibles con ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente perceptivo de visión.

## Casos de uso

- Detección de personas previa a pose estimation: el modelo localiza las personas en el frame y sus cajas delimitadoras se usan para recortar cada instancia antes de pasarla al modelo de pose, reduciendo el área de entrada y mejorando la precisión del keypoint estimation.
- Detección de animales para pose animal: en el pipeline de qtpose, el detector localiza el animal y recorta la región antes de la estimación de pose, evitando que el modelo de pose procese fondo irrelevante.
- Preprocesado en aplicaciones de análisis deportivo: detección de atletas en vídeo frame a frame como primer estadio de un pipeline de seguimiento y análisis de movimiento.
- Filtrado y anonimización de imágenes: localización de personas para aplicar desenfoque o recorte en flujos de publicación de contenido, gracias a la clase `person` y a las coordenadas en píxeles de salida.
- Automatización de conteo en entornos controlados: conteo de personas u objetos COCO en imágenes fijas o secuencias, con NMS ya resuelto en el grafo y sin postprocesado adicional.
- Integración en servicios de inferencia ligeros: al ser un único fichero ONNX con entrada estática, se puede servir con ONNX Runtime en contenedores sin dependencias de PyTorch ni de Ultralytics en tiempo de ejecución.
- Etapa de enrutado en pipelines multimodales: uso del detector para decidir qué regiones de la imagen merecen procesamiento posterior por otros modelos (pose, clasificación o segmentación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de una variante "n" (nano) de la familia YOLO con entrada 640×640 y un único fichero ONNX float32, la huella es reducida y cabe holgadamente en GPUs de consumo, aunque no se proporcionan cifras concretas.
- GPU recomendadas: no disponibles en la información proporcionada; por el perfil del modelo (nano, entrada estática 640×640, ONNX), es apto para GPUs de consumo tipo RTX 3060/4060/4090 y para GPUs de datacenter (A100, H100) sin que estas últimas aporten ventaja significativa frente a alternativas mayores.
- ¿Cabe en GPU de consumo? Sí, por el tamaño del artefacto y la variante nano; no se especifica el modelo mínimo.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), y cualquier runtime compatible con ONNX y opset 17. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26n detect (ONNX) | no disponible | Imagen 640×640 estática | No publicado | AGPL-3.0 | HuggingFace (`qtpose/yolo26n-detect-onnx`) |
| YOLO26n (checkpoint original Ultralytics) | no disponible | Imagen, tamaño configurable en export | No publicado en esta ficha | AGPL-3.0 | Release de assets de Ultralytics v8.4.0 |
| Otros detectores COCO de la familia YOLO (p. ej. variantes nano de versiones previas) | no disponible | Imagen | No disponible | AGPL-3.0 en Ultralytics | Repositorios de Ultralytics |

La comparación cuantitativa con alternativas no es posible con la información disponible: no se han publicado métricas (mAP, latencia) para este artefacto ni se detallan las de los modelos de referencia.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el código fuente bajo la misma licencia; Ultralytics ofrece una licencia enterprise como alternativa, según se indica en su página de licencia.
- Modelo de propósito específico: no es un modelo de lenguaje ni un modelo generativo; no dispone de razonamiento, tool calling ni capacidades multilingües.
- Entrada estática de 640×640 sin ejes dinámicos: no admite resoluciones variables sin reexportar el modelo.
- NMS embebido: el grafo ya filtra detecciones, lo que limita la posibilidad de ajustar el umbral de NMS o el número máximo de detecciones en tiempo de inferencia sin reexportar.
- Clases limitadas a las 80 de COCO: no detecta categorías fuera de ese vocabulario.
- Riesgo de falsos positivos y negativos inherente a un detector nano; no se documentan métricas de precisión ni curvas de confianza.
- No se documentan sesgos específicos del dataset COCO más allá de los conocidos de la propia anotación, ni se detallan limitaciones por condiciones de iluminación, oclusión o dominio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño reportado es 0.0 GB, lo que sugiere un artefacto de publicación reciente y sin validación comunitaria independiente.
- SHA-256 del fichero: `d44b4132e0da13402742ca1abbe56a275af79eac704889b1b96bc62dd8046000`, útil para verificar la integridad de la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qtpose/yolo26n-detect-onnx
- Checkpoint de origen: https://github.com/ultralytics/assets/releases/download/v8.4.0/yolo26n.pt
- Términos de licencia de Ultralytics: https://www.ultralytics.com/license
- Organización qtpose en HuggingFace: https://huggingface.co/qtpose
