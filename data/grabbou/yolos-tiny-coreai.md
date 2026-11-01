# grabbou/yolos-tiny-CoreAI

## Resumen

YOLOS-tiny-CoreAI es una exportación del modelo de detección de objetos `hustvl/yolos-tiny` al formato nativo de Apple Core AI (`.aimodel`), realizada por el usuario `grabbou`. El modelo original, desarrollado por el equipo HUST Vision Lab (hustvl), implementa la arquitectura YOLOS descrita en el artículo "You Only Look at One Sequence" (Fang et al., 2021), un transformer de visión que reformula la detección de objetos como una tarea de predicción de secuencias sobre parches de imagen, sin necesidad de anclas (anchors) ni de supresión no máxima (NMS) en el diseño original.

El modelo cuenta con aproximadamente 6,5 millones de parámetros y está entrenado sobre las 80 clases del dataset COCO. Esta exportación concreta no modifica los pesos: se limita a convertir el checkpoint original de PyTorch a un artefacto estático en float32 de unos 23 MB, pensado para ejecutarse en iOS 27 y macOS 27 mediante el framework Core AI de Apple y el producto `CoreAIObjectDetection` del repositorio `apple/coreai-models`.

Su relevancia es fundamentalmente práctica: permite ejecutar detección de objetos en dispositivos Apple sin dependencias de Python ni de runtimes externos, integrándose en aplicaciones nativas Swift o en proyectos React Native mediante `@react-native-ai/core-ai`. No se trata de un modelo nuevo ni de un fine-tuning, sino de un artefacto de despliegue para el ecosistema Core AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOS (Vision Transformer con detección tipo DETR, sin anchors) |
| Parametros totales | ~6,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen de tamaño fijo) |
| Tipos de cuantizacion | float32 (único formato exportado en este repositorio) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (bundle de Apple Core AI); pesos originales en safetensors/PyTorch en `hustvl/yolos-tiny` |

## Arquitectura y entrenamiento

YOLOS es una adaptación del Vision Transformer (ViT) al paradigma de detección de objetos tipo DETR: la imagen se divide en parches, se proyectan como tokens y se procesan por un transformer encoder que emite un conjunto fijo de predicciones de cajas y clases, eliminando la necesidad de anchors y de NMS. La variante `tiny` reduce la profundidad y anchura del transformer hasta los ~6,5 M de parámetros, lo que la hace apta para dispositivos con recursos limitados.

El modelo original fue entrenado sobre COCO (80 clases) partiendo de pesos preentrenados de ViT, con un esquema de entrenamiento en dos fases típico de DETR/YOLOS. Esta exportación no aporta información sobre el proceso de entrenamiento ni sobre el dataset más allá de lo indicado en la model card; no se documentan fases de RLHF, DPO ni ajustes posteriores, ya que no aplican a un detector. La innovación técnica del artefacto es la conversión a Core AI mediante `coreai-core` 1.0.0b3 y el script `export.py` del repositorio `apple/coreai-models`, con forma estática y precisión float32.

## Capacidades

- Detección de objetos en imágenes con las 80 clases de COCO (persona, vehículo, animales, objetos cotidianos, etc.).
- Salida de cajas delimitadoras con puntuaciones de confianza; umbral configurable (por ejemplo, `threshold: 0.7` en la API de React Native).
- Ejecución nativa en iOS 27 y macOS 27 mediante `ObjectDetector` de `CoreAIObjectDetection`.
- Integración en aplicaciones React Native a través de `@react-native-ai/core-ai` con `CoreAI.runTask('object-detection', ...)`.
- Integración en Swift mediante `ObjectDetector(resourcesAt:)` y `detect(image:)`.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas ni visión generativa: es exclusivamente un detector.

## Casos de uso

- Aplicaciones iOS de inventario visual: el detector puede identificar productos u objetos en fotos capturadas por el usuario y devolver cajas con clase y confianza, ejecutándose en el dispositivo sin conexión.
- Escaneo de documentos y tickets en macOS: localizar regiones de interés (sellos, firmas, elementos gráficos) antes de pasarlas a un OCR externo, aprovechando la inferencia local y de baja latencia.
- Realidad aumentada ligera: superponer etiquetas o efectos sobre objetos detectados en el flujo de cámara de una app iOS, con el modelo ejecutándose en Core AI sin salir del dispositivo.
- Automatización de galerías fotográficas: clasificar y etiquetar imágenes por contenido (personas, animales, vehículos) en una app de gestión de fotos para macOS o iOS.
- Control de calidad en captura de imágenes: verificar que el encuadre contiene los objetos esperados (por ejemplo, una persona completa) antes de enviar la foto a un servicio remoto.
- Prototipado rápido en React Native: validar una funcionalidad de detección de objetos en una app multiplataforma con el binding `@react-native-ai/core-ai` antes de invertir en un modelo mayor o en infraestructura de servidor.
- Demos educativas de visión por computador: ilustrar el funcionamiento de un transformer de detección en dispositivos Apple sin necesidad de configurar Python, CUDA ni servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de mAP, latencia ni throughput para esta exportación, y no se proporcionan comparaciones con otros detectores.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el artefacto pesa 23 MB en float32 y se ejecuta en el Neural Engine/GPU de Apple a través de Core AI.
- Hardware objetivo: dispositivos con iOS 27 o macOS 27 (iPhone, iPad, Mac con Apple Silicon).
- GPU recomendadas: no disponible; el despliegue es específico de Apple Core AI y no se documentan requisitos de GPU discretas.
- Cabe en cualquier dispositivo Apple compatible con Core AI dado su tamaño reducido (23 MB).
- Opciones de despliegue: Core AI (`ObjectDetector` en Swift), `@react-native-ai/core-ai` en React Native. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Licencia | Formato/despliegue |
|---|---|---|---|---|
| grabbou/yolos-tiny-CoreAI | ~6,5 M | imagen de tamaño fijo (no especificado) | Apache-2.0 | `.aimodel` (Core AI) |
| hustvl/yolos-tiny | ~6,5 M | imagen de tamaño fijo | Apache-2.0 | PyTorch/safetensors (HuggingFace) |
| YOLOS-base / small (familia hustvl) | mayor que tiny (no disponible en la información) | imagen de tamaño fijo | Apache-2.0 | PyTorch/safetensors |
| Detectores COCO de referencia (p. ej. Faster R-CNN, DETR) | no disponible | imagen de tamaño fijo | variable | PyTorch |

La comparación directa más relevante es con el checkpoint original `hustvl/yolos-tiny`: pesos idénticos, distinto formato de despliegue. Frente a otros detectores de la misma categoría no se dispone de datos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO; cualquier objeto fuera de ese vocabulario no se reconocerá correctamente.
- Modelo de muy baja capacidad (~6,5 M de parámetros): precisión limitada en escenas densas, objetos pequeños u oclusiones, en comparación con detectores de mayor tamaño.
- Sin información sobre sesgos: no se documentan evaluaciones de equidad ni de robustez por subgrupos.
- Riesgo de falsos positivos y negativos inherente a un detector tiny; el umbral de confianza debe calibrarse por aplicación.
- Dependencia estricta de iOS 27 / macOS 27 y del framework Core AI; no es portable a otros entornos sin reconversión.
- El repositorio no contiene los pesos en formato estándar (safetensors/PyTorch), solo el bundle `.aimodel`; para otros runtimes debe usarse el modelo base `hustvl/yolos-tiny`.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda conservar la atribución al trabajo original de Fang et al. y al modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni garantías de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grabbou/yolos-tiny-CoreAI
- Modelo base: https://huggingface.co/hustvl/yolos-tiny
- Paper YOLOS ("You Only Look at One Sequence"): https://arxiv.org/abs/2106.00666
- Repositorio Apple Core AI Models: https://github.com/apple/coreai-models
- Binding React Native: https://github.com/callstackincubator/ai
