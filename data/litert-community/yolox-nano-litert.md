# litert-community/yolox-nano-litert

## Resumen

YOLOX-Nano es un detector de objetos en tiempo real desarrollado originalmente por Megvii, conocido por su arquitectura CNN pura y su licencia permisiva Apache-2.0, en contraste con la familia YOLO de Ultralytics que usa AGPL. Esta versión concreta, publicada por la comunidad LiteRT (antes TFLite), reescribe el grafo original para que sea completamente nativo de GPU en dispositivos móviles, eliminando operaciones problemáticas como GATHER o TopK que impiden la delegación en aceleradores. El resultado es un archivo `.tflite` de solo 2,2 MB en FP16, con entrada de 416×416 píxeles y salida de cabezas de detección sin decodificar.

El modelo está entrenado sobre COCO 2017 (train2017) y alcanza un AP de 25,8 en val2017 (referencia FP32). Su relevancia actual radica en que ofrece una alternativa ligera, de código abierto y con licencia comercialmente amigable para detección de objetos en el edge, verificada en hardware real como el Pixel 8a con ejecución completa en GPU (delegado OpenCL) y soporte para NPU Snapdragon. La decodificación de las cajas se realiza en el host (Kotlin o Python), lo que mantiene el grafo limpio y acelera la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-Nano (CNN pura, anchor-based, con Focus stem reescrito como conv 6×6 stride-2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 (unico formato publicado) |
| Idiomas soportados | no disponible (modelo de vision, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT `.tflite` (safetensors no aplica) |

## Arquitectura y entrenamiento

YOLOX-Nano es un detector de una etapa (one-stage) basado en CNN, con una cabeza de detección acoplada (decoupled head) y asignación de etiquetas sin anclas (anchor-free) en su diseño original. La versión LiteRT aquí presentada modifica únicamente el grafo de operaciones, no los pesos: el stem Focus (que originalmente usa slicing space-to-depth) se pliega junto con la convolución 3×3 siguiente en una única convolución 6×6 con stride 2, numéricamente equivalente. Esto elimina todas las operaciones GATHER, GATHER_ND, TopK y Cast, así como tensores de más de 4 dimensiones, permitiendo que el grafo completo se ejecute en el delegado GPU sin caídas a CPU. Las activaciones SiLU se descomponen en LOGISTIC + MUL.

El entrenamiento fue realizado por Megvii sobre COCO 2017 (train2017), un dataset académico público con licencia Creative Commons. No se utilizaron datos privados ni técnicas de RLHF/DPO, ya que se trata de un modelo de visión supervisado clásico. Los pesos son la versión oficial de Megvii; solo se reescribió el grafo para GPU, manteniendo los valores intactos.

## Capacidades

- Detección de objetos en 80 clases COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Salida cruda de cabezas de detección: tensor `[1, 3549, 85]` con 4 coordenadas de caja (cx, cy, w, h en unidades de grid), 1 puntuación de objetividad y 80 puntuaciones de clase, ya sigmoidizadas.
- Decodificación de cajas y NMS en el host (Kotlin o Python), lo que permite personalizar el post-procesado sin modificar el grafo.
- Ejecución 100% en GPU (delegado OpenCL) en dispositivos compatibles, sin fallback a CPU.
- Soporte para NPU Snapdragon (Hexagon) con aceleración adicional (1,98× más rápido que GPU según mediciones del autor).
- Entrada en formato NHWC, BGR, 0-255, sin normalización, con letterboxing de escala uniforme y relleno gris (114).

## Casos de uso

- Detección de objetos en tiempo real en aplicaciones Android: el modelo puede integrarse en una app de cámara para identificar objetos en el flujo de vídeo, gracias a su tamaño reducido (2,2 MB) y a la ejecución completa en GPU, lo que permite latencias de ~24 ms en un Pixel 8a.
- Vigilancia perimetral en dispositivos edge: desplegado en cámaras IP o dispositivos IoT con GPU integrada, puede detectar personas o vehículos sin depender de la nube, manteniendo la privacidad de los datos.
- Control de inventario en retail: mediante una cámara fija, el modelo puede contar productos o detectar estanterías vacías, con la ventaja de una licencia Apache-2.0 que permite uso comercial sin restricciones.
- Asistencia a la conducción (ADAS) en vehículos: la detección de objetos en tiempo real (peatones, señales, otros vehículos) puede ejecutarse en hardware embebido con GPU, como el Snapdragon de Qualcomm, aprovechando la aceleración NPU.
- Automatización de procesos industriales: detección de piezas defectuosas o clasificación de objetos en cintas transportadoras, con post-procesado personalizado en el host para adaptar el NMS a necesidades específicas.
- Investigación y prototipado rápido: al ser un modelo ligero y de código abierto, sirve como punto de partida para experimentos de detección en el edge, permitiendo comparar con otros detectores pequeños sin coste de licencia.

## Benchmarks y rendimiento

La información proporcionada incluye datos de precisión y latencia medidos por el autor. No se ofrecen comparativas con otros modelos en la misma fuente.

| Metrica | Valor |
|---|---|
| COCO val2017 AP (FP32 reference) | 25,8 |
| Latencia en Pixel 8a (GPU OpenCL, TFLite benchmark_model) | 24,0 ms |
| Latencia en Pixel 8a (CPU XNNPACK) | no disponible (XNNPACK declino el grafo) |
| Aceleracion NPU Snapdragon (Hexagon) vs GPU | 1,98× mas rapido (dato cualitativo, sin valor absoluto) |

Nota: la latencia de 24,0 ms corresponde al delegado OpenCL clásico de TFLite, medido con la herramienta estándar `benchmark_model`. El autor indica que las mediciones a través de LiteRT `CompiledModel` (ruta recomendada) pueden diferir y no son directamente comparables.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB (el modelo pesa 2,2 MB en FP16; la inferencia requiere buffers adicionales para entrada y salida, pero es despreciable frente a GPUs de consumo).
- GPU recomendadas: cualquier GPU móvil con soporte OpenCL (Adreno, Mali, Apple GPU) o GPU de escritorio compatible con LiteRT/TFLite. Verificado en Pixel 8a (Tensor G3).
- Cabe en cualquier GPU de consumo actual (RTX 2060 o superior) y en GPUs integradas de móviles.
- Opciones de despliegue: LiteRT `CompiledModel` (API recomendada para Android), TFLite Interpreter (Python), o el runtime de LiteRT en C++.
- Latencia y throughput: 24,0 ms por inferencia en Pixel 8a con GPU OpenCL; en NPU Hexagon se espera ~12 ms (estimación a partir del factor 1,98×), aunque no se proporciona el valor exacto.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Como referencia cualitativa, YOLOX-Nano se sitúa en la misma categoría que otros detectores ligeros como YOLOv5n (también ~0,9 M parámetros) o EfficientDet-Lite0, pero no se pueden ofrecer métricas concretas sin fuentes adicionales. La ventaja principal de esta versión LiteRT es su compatibilidad garantizada con GPU móvil y su licencia Apache-2.0, frente a la AGPL de YOLOv5.

## Limitaciones y advertencias

- Sesgos del dataset COCO: el modelo hereda los sesgos de las imágenes de COCO, que pueden no representar adecuadamente ciertas poblaciones, entornos o condiciones de iluminación.
- Riesgo de alucinación: al ser un detector, puede producir falsos positivos (detectar objetos inexistentes) en escenas ambiguas o con oclusiones severas.
- Sin soporte CPU: el grafo FP16 no es aceptado por XNNPACK, por lo que la inferencia en CPU requiere kernels de referencia que son ~20× más lentos que la GPU. No es adecuado para dispositivos sin GPU o con drivers OpenCL deficientes.
- Decodificación obligatoria en el host: la salida cruda requiere post-procesado (decodificación de cajas, NMS) que debe implementarse en la aplicación; no es un modelo plug-and-play.
- Sin cuantización INT8: solo se ofrece FP16, lo que puede limitar el despliegue en hardware que solo acelera INT8.
- Licencia Apache-2.0: permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/yolox-nano-litert
- Repositorio original de YOLOX (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
- Repositorio de ejemplos LiteRT (incluye app Android y script de conversión): https://github.com/google-ai-edge/litert-samples (ruta `compiled_model_api/object_detection`)
- Documentación de YOLOX: https://yolox.readthedocs.io/en/latest/index.html
- Repositorio de modelos LiteRT (incluye YOLOX): https://github.com/john-rocky/LiteRT-Models/tree/main/yolox
