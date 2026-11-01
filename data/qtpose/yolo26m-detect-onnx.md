# qtpose/yolo26m-detect-onnx

## Resumen

YOLO26m-detect-onnx es la exportación a formato ONNX del detector de objetos YOLO26m de Ultralytics, entrenado sobre las 80 clases del dataset COCO. Lo publica el usuario qtpose como artefacto de infraestructura para su propio ecosistema de estimación de pose: el modelo actúa como detector de personas y, en los modelos de pose animal, como detector previo que recorta el fotograma antes de la estimación de pose. No se trata de un modelo de lenguaje ni de un modelo generativo, sino de un detector de objetos de una sola etapa pensado para inferencia en producción.

La relevancia de esta ficha es doble. Por un lado, documenta un caso típico de distribución de artefactos derivados en HuggingFace: un checkpoint oficial de Ultralytics reexportado con una configuración concreta (resolución 640, opset 17, NMS embebido) y verificado mediante SHA-256. Por otro, ilustra las obligaciones de la licencia AGPL-3.0 que arrastra la familia YOLO de Ultralytics, un aspecto crítico para cualquier equipo que evalúe su uso comercial.

El repositorio es pequeño (0,1 GB) y contiene un único archivo ONNX con entrada fija de 1×3×640×640 y salida de 1×300×6 con las detecciones ya filtradas por NMS. No hay información sobre parámetros, contexto, idiomas ni benchmarks en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de detección de objetos de una etapa (familia YOLO26 de Ultralytics); topología interna no disponible |
| Parametros totales | no disponible (la variante "m" de YOLO26 no publica recuento en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible; el artefacto publicado es float32 |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (archivo `yolo26m_detect.onnx`) |

Especificaciones adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Entrada | `images`, float32, forma `(1, 3, 640, 640)`, RGB escalado 0-1 con letterbox |
| Salida | float32, forma `(1, 300, 6)`; cada fila `[x1, y1, x2, y2, score, class_id]` en píxeles de la imagen de entrada |
| NMS | embebido (export end-to-end), no requiere post-proceso |
| Clases | 80 clases COCO (person = 0) |
| Opset | 17 |
| Checkpoint origen | `yolo26m.pt` de Ultralytics assets v8.4.0 |
| Herramienta de exportación | Ultralytics 8.4.189 |
| SHA-256 | `e66ac1be40a17d8d44ec3d7d06c28e998234c9ca221df7d0ae2c580a4c00523f` |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de YOLO26m más allá de su pertenencia a la familia YOLO26 de Ultralytics y su naturaleza de detector de objetos de una etapa. El checkpoint original `yolo26m.pt` se distribuye en la release v8.4.0 de los assets de Ultralytics y está entrenado sobre las 80 clases de COCO. No se especifican en la model card el número de tokens de imagen, la composición del dataset de entrenamiento, ni si hubo fases de refinamiento posteriores.

La innovación técnica relevante en este artefacto concreto es la exportación end-to-end con NMS embebido: el grafo ONNX incluye la supresión de no máximos, de modo que la salida ya es una lista fija de hasta 300 detecciones con puntuación y clase. Esto simplifica la integración en pipelines de inferencia, ya que el consumidor no necesita implementar NMS. La exportación se realizó con `imgsz=640`, `opset=17`, `simplify=False` y `dynamic=False`, lo que implica un grafo estático optimizado para resolución 640×640 y lote de tamaño 1. El script de conversión empleado (`scripts/dev/convert_yolo26_to_onnx.py --task detect --variant m --validate`) incluye una fase de validación.

## Capacidades

- Detección de objetos en imágenes RGB con resolución de entrada fija de 640×640.
- Reconocimiento de las 80 clases del dataset COCO, con la clase `person` indexada como 0.
- Salida con NMS ya aplicado: hasta 300 detecciones por imagen con coordenadas, puntuación y clase.
- Uso como detector de personas en pipelines de pose estimation (caso principal declarado por el autor).
- Uso como detector de animales para recortar el fotograma antes de la estimación de pose animal.
- Inferencia mediante runtime ONNX (ONNX Runtime, TensorRT, OpenVINO u otros compatibles con opset 17).
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking: es exclusivamente un modelo de visión para detección.

## Casos de uso

- Detección de personas previa a pose estimation: el modelo localiza a las personas en el fotograma y proporciona los recortes que alimentan el modelo de pose, tal como declara el autor en la model card. La salida con NMS embebido reduce el código de integración necesario.
- Detección de animales para pose animal: en el flujo de qtpose, el detector recorta el animal antes de estimar su pose, evitando que el modelo de pose procese el fotograma completo con distractores.
- Analítica de vídeo en tiempo real: al ser un grafo ONNX estático de 640×640 y lote 1, puede desplegarse con ONNX Runtime o TensorRT en servidores con GPU para conteo de personas y objetos en streams de cámara.
- Preprocesado en aplicaciones de realidad aumentada o fitness: la detección de personas con coordenadas en píxeles permite anclar elementos virtuales o calcular métricas corporales antes de pasar al modelo de pose.
- Moderación y filtrado de imágenes: las 80 clases COCO cubren categorías como personas, vehículos y animales, útiles para clasificar y filtrar contenido en pipelines de ingesta.
- Automatización de anotación de datasets: el detector puede generar cajas preliminares sobre imágenes nuevas para acelerar el etiquetado humano en proyectos de visión por computador.
- Despliegue en entornos con requisitos de portabilidad: al ser ONNX con opset 17, el mismo artefacto puede ejecutarse en ONNX Runtime, OpenVINO o TensorRT sin reexportar, lo que facilita mover la inferencia entre CPU y GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de mAP, latencia ni throughput para este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El archivo pesa aproximadamente 0,1 GB en float32, por lo que la huella de pesos es reducida; el consumo real depende del runtime y de las activaciones intermedias.
- GPU recomendadas: no disponible. Cualquier GPU compatible con ONNX Runtime o TensorRT con soporte de opset 17 debería poder ejecutar el grafo.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; por el tamaño del artefacto (0,1 GB) es plausible que quepa en GPUs de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO y otros runtimes compatibles con ONNX opset 17. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia cualitativa, este artefacto pertenece a la familia YOLO26 de Ultralytics y comparte licencia AGPL-3.0 con el resto de la familia, pero no se dispone de cifras para contrastar con otras variantes o detectores.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial en productos o servicios en red puede obligar a liberar el código fuente bajo la misma licencia. Ultralytics ofrece una licencia empresarial alternativa; conviene revisar https://www.ultralytics.com/license antes de integrarlo en producción.
- Resolución de entrada fija: el grafo se exportó con `dynamic=False` e `imgsz=640`; no admite otras resoluciones ni tamaños de lote sin reexportar.
- Solo 80 clases COCO: cualquier objeto fuera de esas categorías no se detectará con una clase válida.
- Riesgo de falsos positivos y negativos inherente a los detectores de una etapa; no se publican métricas de precisión o recall para este artefacto que permitan cuantificarlo.
- Sesgos: no se documentan sesgos conocidos del checkpoint original; al entrenarse sobre COCO, puede heredar los sesgos de representación de ese dataset.
- Sin información sobre idiomas, texto o capacidades generativas: no aplica como modelo de lenguaje.
- Artefacto derivado: la responsabilidad de validación recae en el consumidor; el autor incluye un SHA-256 para verificar la integridad del archivo.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qtpose/yolo26m-detect-onnx
- Checkpoint origen: https://github.com/ultralytics/assets/releases/download/v8.4.0/yolo26m.pt
- Licencia de Ultralytics: https://www.ultralytics.com/license
