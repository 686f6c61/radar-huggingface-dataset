# mlboydaisuke/RF-DETR-Nano-OpenVINO

## Resumen

RF-DETR-Nano-OpenVINO es una conversión del detector de objetos RF-DETR-Nano (variante "Nano" de la familia RF-DETR de Roboflow) a formatos ejecutables sobre hardware Intel: ONNX (opset 17), OpenVINO IR con pesos fp32 y blobs precompilados para la NPU integrada en los procesadores Intel Core Ultra. El modelo base es la versión LiteRT publicada por `litert-community`, y esta conversión la firma el usuario `mlboydaisuke`, autor también de conversiones equivalentes a Core ML.

El interés de esta ficha no reside en un nuevo modelo fundacional, sino en el empaquetado de inferencia: se trata de un detector transformer end-to-end (sin NMS) de 384×384 píxeles de entrada, 300 consultas y 91 clases (COCO más fondo), optimizado para ejecutarse en CPU, iGPU y NPU Intel con latencias del orden de 15-19 ms en NPU y 3-4 ms en GPU dedicada para el grafo B. Es relevante para quienes despliegan visión por computador en portátiles y equipos de borde con aceleradores Intel, donde el soporte de OpenVINO y de la NPU Meteor Lake/Lunar Lake/Arrow Lake es escaso en modelos de detección modernos.

El repositorio ocupa 0,3 GB e incluye dos subgrafos (`graphA` y `graphB`) en tres formatos cada uno, con hashes SHA-256 publicados y verificaciones de equivalencia numérica frente al `.tflite` original (coseno ≥ 0,9999). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer detector end-to-end (RF-DETR, sin NMS; 300 queries, 91 clases COCO+fondo, entrada 384×384) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no lenguaje) |
| Tipos de cuantizacion | fp32 (OpenVINO IR), fp16 (ONNX y blobs NPU); no se publican variantes int8 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (`.xml` + `.bin`), blob precompilado para NPU Intel, TFLite (modelo base) |

## Arquitectura y entrenamiento

RF-DETR es un detector de objetos basado en transformer con predicción directa de conjuntos (set prediction), es decir, elimina la necesidad de supresión de no máximos (NMS) en postproceso: emite 300 consultas que se corresponden con detecciones y una etiqueta de clase entre 91 (80 de COCO más fondo). La entrada es de 384×384 píxeles. La variante "Nano" es la de menor tamaño de la familia y está pensada para inferencia en dispositivo.

El proceso de conversión documentado es el siguiente: los ficheros `rfdetr_graphA_fp16` y `rfdetr_graphB_fp16` del repositorio `litert-community/RF-DETR-Nano-LiteRT` se convierten a ONNX con tf2onnx 1.17.0 (opset 17), aplicando un parche de una línea (`convert/patch_tf2onnx.py`) porque esa versión de tf2onnx descarta el bias de cinco capas `FULLY_CONNECTED` de ambos grafos. Sin el parche, las salidas no coinciden con el `.tflite`. Los blobs de NPU se compilaron con OpenVINO 2026.4.1 y el driver de NPU Intel 32.0.100.4841. No se documentan en la información disponible los datos de entrenamiento originales (número de tokens, composición del dataset, uso de RLHF/DPO), que corresponden al modelo base de Roboflow.

## Capacidades

- Detección de objetos en imágenes: 80 clases de COCO más clase de fondo, hasta 300 detecciones por imagen.
- Detección end-to-end sin NMS, lo que simplifica el pipeline de postproceso.
- Entrada de imagen fija de 384×384 píxeles (requiere preprocesado y redimensionado previo).
- Inferencia en CPU Intel, iGPU Intel y NPU Intel AI Boost mediante OpenVINO; también en GPU NVIDIA vía ONNX Runtime con el execution provider CUDA.
- Ejecución con blobs precompilados para NPU, lo que elimina el coste de compilación en el arranque (0,01-0,05 s de carga frente a 3,9-29,7 s compilando el ONNX en la sesión).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Detección de objetos en tiempo real en portátiles con Intel Core Ultra: el grafo B se ejecuta en 3,90 ms en la iGPU y 14,99 ms en la NPU, lo que permite procesar vídeo a decenas de fotogramas por segundo sin GPU dedicada.
- Visión artificial en el borde sin acelerador dedicado: los blobs de NPU permiten desplegar el detector en equipos con solo CPU y NPU Intel, con un consumo muy inferior al de una GPU.
- Preprocesado de pipelines de vídeo en aplicaciones de videovigilancia o análisis de tráfico: el detector filtra fotogramas con presencia de objetos antes de enviarlos a modelos más costosos.
- Automatización de inventario o control de calidad en línea de producción: la latencia de 3-4 ms del grafo B en RTX 5080 Laptop permite inspección a alta cadencia.
- Aplicaciones de escritorio con inferencia local: el formato ONNX con OpenVINO EP se integra en aplicaciones Windows nativas sin dependencias de la nube.
- Prototipado rápido de sistemas de detección en hardware Intel: la disponibilidad de IR, ONNX y blob en un mismo repositorio permite comparar rendimiento entre CPU, iGPU y NPU con el mismo modelo.
- Evaluación comparativa de aceleradores: el repositorio incluye metodología y tiempos por procesador, útil para decidir el destino de despliegue.

## Benchmarks y rendimiento

Tiempos medidos en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711), mediana de 30 ejecuciones tras 5 de calentamiento, entrada y salida NumPy.

| Grafo | Procesador | Runtime | Fichero | ms | Carga (s) |
|---|---|---|---|---|---|
| graphA | Intel AI Boost NPU | OpenVINO 2026.4.1 | blob | 18,54 | 0,05 |
| graphA | Intel AI Boost NPU | ORT 1.31.1 + OpenVINO EP 1.8.1 | ONNX | 18,80 | 29,67 |
| graphA | Intel Graphics (iGPU) | ORT + OpenVINO EP | ONNX | 16,10 | 2,04 |
| graphA | RTX 5080 Laptop (95 W) | ORT CUDA EP | ONNX fp16 | 14,25 | 1,36 |
| graphA | RTX 5080 Laptop (95 W) | ORT CUDA EP | ONNX | 23,87 | 2,13 |
| graphA | Core Ultra 9 386H CPU | ORT CPU EP | ONNX | 60,66 | 0,37 |
| graphB | Intel AI Boost NPU | OpenVINO 2026.4.1 | blob | 14,99 | 0,01 |
| graphB | Intel AI Boost NPU | ORT + OpenVINO EP | ONNX | 14,54 | 3,92 |
| graphB | Intel Graphics (iGPU) | ORT + OpenVINO EP | ONNX | 3,90 | 1,01 |
| graphB | RTX 5080 Laptop (95 W) | ORT CUDA EP | ONNX fp16 | 3,44 | 1,22 |
| graphB | RTX 5080 Laptop (95 W) | ORT CUDA EP | ONNX | 3,33 | 1,08 |
| graphB | Core Ultra 9 386H CPU | ORT CPU EP | ONNX | 13,56 | 0,08 |

Verificación de salidas: todas las filas dan PASS frente a la salida de referencia en CPU fp32 (coseno ≥ 0,99, sin NaN/Inf, acuerdo top-1 ≥ 0,99 en puntuaciones de clase); en la práctica, coseno ≥ 0,9998 en NPU y ≥ 0,9999 en el resto. El ONNX frente al `.tflite` original también da PASS con coseno ≥ 0,9999. No se publican métricas de precisión (mAP, COCO AP) en la información disponible.

## Requisitos de hardware

- NPU Intel AI Boost (Core Ultra): ejecución con blob precompilado; requiere OpenVINO 2026.4.1 y driver de NPU compatible (32.0.100.4841 en la medición). Si `import_model` rechaza el blob por versión de driver u OpenVINO, hay que compilar el IR.
- iGPU Intel: 16,10 ms (graphA) y 3,90 ms (graphB) vía ONNX Runtime con OpenVINO EP.
- CPU Intel Core Ultra 9 386H: 60,66 ms (graphA) y 13,56 ms (graphB), referencia de corrección.
- GPU NVIDIA: soportada vía ONNX Runtime CUDA EP; 23,87 ms (graphA, fp32) y 3,33 ms (graphB, fp32) en RTX 5080 Laptop a 95 W. El fp16 del grafo A baja a 14,25 ms.
- VRAM estimada: el grafo A ocupa 96,7 MB en ONNX y 93,9 MB en IR; el grafo B, 14,2 MB en ONNX y 13,9 MB en IR. Cabe holgadamente en cualquier GPU de consumo y en memoria unificada de equipos Intel.
- Despliegue: OpenVINO (Python, C++), ONNX Runtime con OpenVINO EP o CUDA EP, y LiteRT para el modelo base. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector.
- Throughput: a partir de las latencias, el grafo B en iGPU admite del orden de 250 inferencias/s y en NPU unas 67/s; el grafo A en NPU unas 54/s. Son estimaciones derivadas de la latencia medida en un proceso con una sola ejecución por iteración.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | NMS | Licencia | Formatos |
|---|---|---|---|---|---|---|
| RF-DETR-Nano-OpenVINO | Transformer end-to-end | 384×384 | 91 | No | Apache 2.0 | ONNX, IR, blob NPU |
| RF-DETR-Nano-CoreML (mismo autor) | Transformer end-to-end | 384×384 | 91 | No | no disponible en la información | Core ML |
| RF-DETR-Nano-LiteRT (`litert-community`) | Transformer end-to-end | 384×384 | 91 | No | no disponible en la información | TFLite |
| YOLO (familia, p. ej. YOLOv8n) | CNN | variable | 80 | Sí | AGPL-3.0 (Ultralytics) | ONNX, TFLite, etc. |

La comparación relevante es de empaquetado, no de arquitectura: las tres primeras variantes son el mismo modelo RF-DETR-Nano en distintos formatos para distintos aceleradores (Intel, Apple, LiteRT). Frente a YOLO, la ventaja de RF-DETR es la ausencia de NMS y la arquitectura transformer; la desventaja, la menor disponibilidad de herramientas y pesos cuantizados a int8. No se dispone de métricas de precisión comparadas en la información proporcionada.

## Limitaciones y advertencias

- No se publican métricas de precisión (mAP/AP COCO) en la información disponible; no se puede afirmar su calidad de detección frente a alternativas sin evaluarla.
- La entrada está fijada a 384×384; objetos pequeños o imágenes de alta resolución requerirán redimensionado y pueden perder detalle.
- Los blobs de NPU están compilados para una versión concreta de OpenVINO (2026.4.1) y driver de NPU (32.0.100.4841); en otros entornos hay que recompilar el IR, con un coste de carga de hasta ~30 s en el grafo A.
- El parche a tf2onnx es imprescindible: sin él, cinco capas `FULLY_CONNECTED` pierden el bias y las salidas no coinciden con el `.tflite`. Cualquier reconversión debe replicarlo.
- Solo se validó en un equipo concreto (Core Ultra 9 386H + RTX 5080 Laptop, Windows 11); no hay datos de otros procesadores ni de Linux.
- No hay filas de Snapdragon: Qualcomm AI Hub midió los ficheros antes del arreglo del bias, por lo que esos números no son fiables.
- Es un detector, no un modelo generativo: no admite instrucciones en lenguaje natural, tool calling ni razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base de Roboflow y de los datos de entrenamiento originales antes de producción.
- Riesgo de sesgo heredado del dataset COCO (80 clases, sesgo hacia escenas y objetos comunes en dicho corpus); clases fuera de COCO no se detectan.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni mantenimiento continuado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/RF-DETR-Nano-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/RF-DETR-Nano-LiteRT
- Repositorio de scripts y metodología (windows-zoo): https://github.com/john-rocky/windows-zoo
- Conversión Core ML del mismo autor: https://huggingface.co/mlboydaisuke/RF-DETR-Nano-CoreML
- Modelo original RF-DETR de Roboflow: https://huggingface.co/roboflow/rf-detr
