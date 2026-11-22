# inference4j/dfine-nano-coco

## Resumen

D-FINE Nano (COCO) en formato ONNX es una exportación del modelo de detección de objetos D-FINE en su variante nano, desarrollado originalmente por el grupo USTC (Universidad de Ciencia y Tecnología de China) y publicado bajo el identificador `ustc-community/dfine-nano-coco`. D-FINE ("Redefine Bounding Box Regression for DETR-based Object Detection") es un detector basado en transformer de la familia DETR que reformula la regresión de cajas delimitadoras para mejorar la precisión y la eficiencia del entrenamiento. Esta variante nano está entrenada sobre COCO 2017 con 80 clases y alcanza un COCO AP de 42,8 en val2017, según los autores originales.

Esta ficha concreta corresponde al espejo publicado por `inference4j`, una librería de inferencia en Java, que ha simplificado el grafo con `onnxsim` para fijar una entrada estática de `[1, 3, 640, 640]`. El resultado es un modelo ONNX compatible con ONNX Runtime y con CoreML (formatos NeuralNetwork y MLProgram), verificado en CPU y Apple Silicon. Su principal atractivo es la licencia Apache-2.0, que lo convierte en una alternativa permisiva y no copyleft a detectores como YOLOv8 o YOLO26, distribuidos bajo AGPL.

El modelo resuelve el problema de la detección de objetos genérica en imágenes con un pipeline de post-procesado sencillo: no requiere NMS, lo que simplifica su integración en producción. Está pensado para desarrolladores que necesitan un detector ligero, con salida determinista y licencia comercialmente amigable, integrable en aplicaciones Java mediante la API de inference4j o directamente con ONNX Runtime en cualquier lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE Nano (detector de objetos basado en transformer, familia DETR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija `[1, 3, 640, 640]`) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo simplificado con `onnxsim`, entrada estática) |

## Arquitectura y entrenamiento

D-FINE es un detector de objetos de la familia DETR que introduce una reformulación de la regresión de cajas delimitadoras, sustituyendo el enfoque clásico por una parametrización basada en distribuciones (Fine-grained Distribution Refinement) y una optimización de la localización (Global Optimal Localization Self-Distillation). Esta variante nano es la de menor tamaño de la familia y está entrenada sobre el conjunto COCO 2017 con 80 clases. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de COCO, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables en un detector de objetos).

La exportación a ONNX realizada por `onnx-community` y espejada por `inference4j` simplifica el grafo con `onnxsim` para fijar una entrada estática de `[1, 3, 640, 640]`, lo que garantiza compatibilidad total con ONNX Runtime y con CoreML. La salida se compone de dos tensores: `logits` de forma `[1, 300, 80]` (logits crudos a los que hay que aplicar sigmoide) y `pred_boxes` de forma `[1, 300, 4]` en formato normalizado `[cx, cy, w, h]`. El post-procesado consiste en convertir a `[x1, y1, x2, y2]` escalado a las dimensiones de la imagen y filtrar por umbral de confianza (por ejemplo, > 0,5). No se requiere NMS, lo que constituye una innovación práctica relevante para pipelines de producción.

## Capacidades

- Detección de objetos en imágenes RGB con 80 clases del conjunto COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Salida de hasta 300 detecciones por imagen con puntuaciones de confianza y cajas delimitadoras normalizadas.
- Post-procesado sin NMS: las detecciones ya vienen filtradas por el propio modelo, lo que simplifica la integración.
- Entrada de imagen estática de 640x640 píxeles, normalizada en rango 0-1, con redimensionado bilineal (sin letterbox).
- Compatibilidad con ONNX Runtime en CPU y con CoreML en Apple Silicon (formatos NeuralNetwork y MLProgram).
- Integración directa con la librería Java inference4j mediante `DetrDetector.dfineNano()`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente de visión).

## Casos de uso

- **Detección de objetos en aplicaciones Java de escritorio o servidor**: mediante la API `DetrDetector.dfineNano()` de inference4j, se puede integrar un detector en una aplicación Java existente sin dependencias de Python, con salida tipada (`Detection`, `box()`, `label()`, `confidence()`).
- **Procesamiento por lotes de imágenes en pipelines de datos**: al tener entrada estática y salida determinista sin NMS, es adecuado para procesar grandes volúmenes de imágenes en paralelo con ONNX Runtime, por ejemplo para etiquetado automático de datasets o auditoría de contenido visual.
- **Aplicaciones en dispositivos Apple Silicon**: la verificación con CoreML (NeuralNetwork y MLProgram) permite desplegar el detector en macOS o iOS con aceleración por GPU/ANE, útil para apps de análisis de imágenes en local sin conexión.
- **Sistemas de videovigilancia o conteo de personas**: la variante nano ofrece un coste computacional bajo y una latencia reducida, adecuada para inferencia en tiempo real sobre fotogramas de vídeo en CPU o en hardware de gama media.
- **Preprocesado para pipelines de visión más complejos**: las detecciones pueden alimentar etapas posteriores (reconocimiento de matrículas, clasificación de cultivos, análisis de escenas) en un pipeline modular donde D-FINE Nano actúa como detector genérico de primera etapa.
- **Prototipado rápido con licencia permisiva**: al ser Apache-2.0 y no AGPL, se puede usar en productos comerciales cerrados sin obligación de liberar el código, a diferencia de YOLOv8/YOLO26, lo que lo hace idóneo para pruebas de concepto que luego pasan a producción.
- **Integración en herramientas de anotación asistida**: el detector puede pre-etiquetar imágenes en una herramienta de anotación, reduciendo el trabajo manual de los anotadores antes de la revisión humana.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| COCO AP (val2017) | 42,8 | Según los autores originales de D-FINE (no verificado de forma independiente en esta ficha) |

No se han publicado en la información disponible resultados adicionales de benchmarks (por ejemplo, AP50, AP75, AP small/medium/large, latencia o throughput) para esta exportación ONNX concreta.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. Al tratarse de la variante nano de un detector DETR con entrada 640x640 y 300 consultas, el consumo de memoria es moderado, pero no se proporcionan cifras concretas en la información disponible.
- **GPU recomendadas**: no se especifican. El modelo está verificado en CPU y Apple Silicon (CoreML), lo que sugiere que no requiere GPU dedicada para funcionar.
- **Compatibilidad con GPU de consumo**: no se documenta explícitamente, pero por el tamaño de la variante nano es plausible que quepa en GPUs de consumo; no obstante, este dato no está confirmado en la información proporcionada.
- **Opciones de despliegue**: ONNX Runtime (CPU y GPU), CoreML (NeuralNetwork y MLProgram en Apple Silicon), y la librería Java inference4j. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | COCO AP | Licencia | Formato |
|---|---|---|---|---|---|---|
| D-FINE Nano (COCO) ONNX (este) | D-FINE (DETR) | no disponible | 640x640 fijo | 42,8 | Apache-2.0 | ONNX |
| YOLOv8 (nano) | CNN (YOLO) | no disponible en la información | variable | no disponible en la información | AGPL-3.0 | PyTorch, ONNX, etc. |
| YOLO26 | CNN (YOLO) | no disponible en la información | variable | no disponible en la información | AGPL-3.0 | PyTorch, ONNX, etc. |
| D-FINE Nano original (PyTorch) | D-FINE (DETR) | no disponible | 640x640 | 42,8 | Apache-2.0 | PyTorch |

La comparativa se limita a los datos disponibles. La diferencia clave frente a YOLOv8/YOLO26 es la licencia Apache-2.0 frente a AGPL-3.0, lo que permite uso comercial cerrado sin obligaciones de copyleft. No se dispone de cifras de parámetros ni de benchmarks adicionales de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos**: al estar entrenado exclusivamente sobre COCO 2017 (80 clases), hereda los sesgos de representación de ese dataset (posible infrarrepresentación de ciertas demografías, contextos geográficos o clases poco frecuentes). No se documentan análisis de sesgo específicos.
- **Riesgo de alucinación**: en detección de objetos se traduce en falsos positivos, especialmente en escenas con oclusiones, objetos pequeños o clases ambiguas. El umbral de confianza (> 0,5 por defecto) mitiga parcialmente este riesgo.
- **Limitaciones de entrada**: la entrada es estática `[1, 3, 640, 640]` sin letterbox, lo que puede distorsionar imágenes con relaciones de aspecto muy distintas a 1:1. El redimensionado bilineal directo puede afectar a la precisión en imágenes panorámicas o muy verticales.
- **Limitación de clases**: solo detecta las 80 clases de COCO; no reconoce clases personalizadas sin reentrenamiento.
- **Idioma**: no aplica (modelo de visión). No procesa texto.
- **Licencia**: Apache-2.0 permite uso comercial, modificación y redistribución con atribución; no impone copyleft. Es una ventaja frente a AGPL, pero conviene revisar los términos de la licencia original de D-FINE y de los pesos base.
- **Producción**: el modelo no incluye NMS, lo que simplifica el pipeline pero implica confiar en que el propio modelo filtra duplicados; conviene validar el comportamiento en escenas densas. No se documentan métricas de latencia ni de robustez ante dominios distintos de COCO.
- **Mantenimiento**: el repositorio tiene pocas descargas (16) y ningún "like", lo que sugiere una adopción limitada; conviene evaluar la estabilidad del espejo antes de depender de él en producción.

## Enlaces

- [Hugging Face: inference4j/dfine-nano-coco](https://huggingface.co/inference4j/dfine-nano-coco)
- [Modelo original: ustc-community/dfine-nano-coco](https://huggingface.co/ustc-community/dfine-nano-coco)
- [Exportación ONNX original: onnx-community/dfine-nano-coco-ONNX](https://huggingface.co/onnx-community/dfine-nano-coco-ONNX)
- [Repositorio D-FINE (Peterande/D-FINE)](https://github.com/Peterande/D-FINE)
- [Librería inference4j](https://github.com/inference4j/inference4j)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
