# inference4j/yolox-nano

## Resumen

YOLOX-Nano es un detector de objetos anchor-free perteneciente a la familia YOLOX desarrollada por Megvii (Ge et al., 2021). Este repositorio concreto es el espejo del export oficial ONNX del modelo, publicado originalmente en la release 0.1.1rc0 del proyecto YOLOX y replicado por inference4j para su uso desde una librería de inferencia en Java. El modelo resuelve detección de objetos sobre las 80 clases de COCO y destaca por su tamano minimo: 0,91 millones de parametros, lo que lo convierte en una opcion viable para entornos con recursos muy limitados.

La relevancia actual del modelo reside en su licencia Apache-2.0, que lo posiciona como alternativa permisiva frente a otras familias YOLO con licencias más restrictivas para uso comercial (AGPL en el caso de YOLOv8 y YOLO26). Frente a los modelos de lenguaje, aquí no hay ventana de contexto ni generación de texto: la entrada es una imagen fija de 416x416 píxeles en formato float32 y la salida es un tensor de detecciones sin decodificar.

El modelo se distribuye exclusivamente en formato ONNX (opset 11), exportado desde PyTorch 1.7, con entrada estática y sin NMS incluido en el grafo, lo que obliga a implementar el post-procesado (decodificación de cajas y supresión de no máximos) en el código de la aplicación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-Nano (anchor-free, decoupled head) |
| Parametros totales | 0,91 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija 416x416) |
| Tipos de cuantizacion | no disponible (solo se distribuye el ONNX float32) |
| Idiomas soportados | no aplica (detección de objetos, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 11); no se ofrece safetensors ni GGUF |

## Arquitectura y entrenamiento

YOLOX-Nano es un detector de una sola etapa con diseño anchor-free y cabecera desacoplada (decoupled head), una de las innovaciones centrales del paper YOLOX frente a las versiones previas de la familia YOLO. La red procesa la imagen mediante un backbone ligero y produce predicciones sobre tres escalas (strides 8, 16 y 32), generando un total de 3549 puntos de anclaje para una entrada de 416x416. La salida por punto es un vector de 85 valores: coordenadas de caja sin decodificar, objectness y 80 puntuaciones de clase.

El entrenamiento se realizó desde cero sobre COCO 2017 train (80 clases), sin preentrenamiento en ImageNet, tal como describe el paper de YOLOX. No se dispone de información sobre el número exacto de tokens o iteraciones, la composición detallada del dataset más allá de COCO, ni sobre el uso de técnicas de alineación como RLHF (no aplicables a un detector). El export ONNX se generó con PyTorch 1.7 y opset 11, con entrada estática de forma `[1, 3, 416, 416]`.

## Capacidades

- Detección de objetos en imágenes para las 80 clases de COCO (persona, vehículos, animales, utensilios, etc.).
- Salida de cajas delimitadoras con puntuación de confianza por clase, en formato sin decodificar que requiere post-procesado.
- Preprocesado definido: letterbox a la esquina superior izquierda, redimensionado bilineal, padding a 114, entrada BGR 0-255 en NCHW float32.
- Post-procesado necesario en la aplicación: decodificación por strides 8/16/32 y NMS agnóstico de clase con IoU 0.45 (según la demo de referencia).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión-lenguaje: es exclusivamente un detector visual.
- Inferencia ligera apta para ejecución en CPU y dispositivos de borde gracias a su tamano de 0,91 M de parámetros.

## Casos de uso

- Detección de personas en sistemas de videovigilancia en el borde: el modelo cabe en dispositivos con pocos recursos y su entrada fija de 416x416 permite procesar fotogramas en tiempo real en CPU, con la ventaja de una licencia Apache-2.0 que evita las obligaciones AGPL de otras familias YOLO.
- Conteo de vehículos en imágenes de tráfico: al detectar las clases de COCO correspondientes (coche, autobús, camión, moto), puede integrarse en pipelines de análisis de aforo con preprocesado estandarizado y NMS configurable.
- Moderación de contenido visual en aplicaciones Java: mediante la librería inference4j, se puede invocar el detector directamente desde código Java sin depender de runtimes de Python, lo que simplifica el despliegue en backends empresariales.
- Automatización de inventario o control de calidad industrial: detección de objetos COCO en imágenes de cámaras fijas para tareas de conteo y localización, con la ventaja de un modelo de menos de 1 M de parámetros que se puede embeber en sistemas con memoria limitada.
- Prototipado rápido de pipelines de visión en investigación: al ser un export ONNX estándar, se puede cargar con ONNX Runtime en múltiples lenguajes y comparar con otros detectores sin ataduras de framework.
- Aplicaciones móviles o embebidas con requisitos estrictos de latencia: el reducido número de parámetros y la entrada estática permiten estimaciones de inferencia en el orden de milisegundos en CPU moderna, adecuado para clasificación y localización en tiempo real de baja resolución.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| COCO AP (val2017) | 25,8 | 416x416, según los autores de YOLOX |

No se han publicado en la información disponible resultados adicionales de benchmarks (por ejemplo, AP50, AP75, latencia o throughput) para este export concreto. El dato de 25,8 AP es el reportado por los autores originales para YOLOX-Nano a 416x416.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB, dado el tamano del modelo (0,91 M de parámetros) y la entrada fija de 416x416; no se dispone de una cifra oficial medida.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo está pensado para ejecución en CPU. En GPU, tarjetas como RTX 4090, A100 o H100 lo ejecutarán con una utilización mínima, pero no se beneficiarán de forma significativa frente a una CPU para este tamano.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 1 GB de memoria; también en CPU y dispositivos de borde.
- Opciones de despliegue: ONNX Runtime (multiplataforma), inference4j (Java), y cualquier runtime compatible con ONNX opset 11. No se distribuye en GGUF ni en formatos para llama.cpp u Ollama, que no son aplicables a un detector de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y de la implementación del post-procesado (decodificación y NMS), que no forma parte del grafo ONNX.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | COCO AP | Licencia | Formato |
|---|---|---|---|---|---|
| YOLOX-Nano (este) | 0,91 M | 416x416 | 25,8 | Apache-2.0 | ONNX |
| YOLOv8n | no disponible en la información | no disponible | no disponible | AGPL-3.0 | no disponible |
| YOLO26 | no disponible en la información | no disponible | no disponible | AGPL (según la model card) | no disponible |

La model card menciona explícitamente a YOLOv8 y YOLO26 como alternativas con licencia AGPL, frente a la Apache-2.0 de YOLOX-Nano, pero no proporciona sus especificaciones ni resultados de benchmarks en la información disponible. No se dispone de datos comparativos adicionales de otros detectores ligeros.

## Limitaciones y advertencias

- El modelo solo detecta las 80 clases de COCO; cualquier objeto fuera de ese conjunto no será reconocido.
- La precisión es limitada: 25,8 AP en COCO val2017, adecuada para tareas de baja exigencia pero insuficiente para aplicaciones que requieran localización fina o detección de objetos pequenos.
- La entrada es estática (416x416); no admite resoluciones variables sin reexportar el modelo.
- El grafo ONNX no incluye NMS ni decodificación de cajas: es responsabilidad de la aplicación implementar el post-procesado correcto (strides 8/16/32, sigmoid ya aplicado, NMS agnóstico de clase a IoU 0.45 en la demo de referencia). Un post-procesado incorrecto degradará gravemente los resultados.
- El preprocesado debe respetarse exactamente (letterbox, BGR 0-255, padding 114, NCHW float32); desviaciones producen detecciones erróneas.
- No se dispone de información sobre sesgos específicos del dataset más allá de los inherentes a COCO, que está desbalanceado hacia ciertas categorías y contextos.
- Riesgo de falsos positivos y negativos en escenas con oclusión, objetos pequenos o condiciones de iluminación adversas, propio de un detector de este tamano.
- La licencia Apache-2.0 permite uso comercial sin las obligaciones copyleft de AGPL, pero se recomienda verificar la procedencia de los pesos originales y citar el paper de YOLOX.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el espejo no introduce cambios respecto al export oficial; la fecha de creación indicada (2026-11-22) debe tomarse con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/inference4j/yolox-nano
- Repositorio original de YOLOX (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
- Pesos originales (yolox_nano.pth): https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_nano.pth
- Export ONNX oficial (yolox_nano.onnx): https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_nano.onnx
- Librería inference4j: https://github.com/inference4j/inference4j
- Paper YOLOX (arXiv:2107.08430): https://arxiv.org/abs/2107.08430
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
