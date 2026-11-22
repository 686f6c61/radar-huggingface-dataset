# inference4j/yolox-tiny

## Resumen

YOLOX-Tiny es un detector de objetos anclaje-libre (anchor-free) desarrollado por Megvii, publicado originalmente en 2021 junto al artículo *YOLOX: Exceeding YOLO Series in 2021* (arXiv:2107.08430). Esta ficha corresponde a la exportación oficial a ONNX del checkpoint `yolox_tiny.pth` de la release 0.1.1rc0, replicada en Hugging Face por el proyecto inference4j para su uso desde Java. El modelo detecta las 80 clases de COCO y está pensado para inferencia en entornos con recursos limitados.

La arquitectura es una CNN de detección de una sola etapa con cabeza desacoplada (decoupled head) y sin anclas, con 5,06 millones de parámetros. La entrada es estática, `[1, 3, 416, 416]` en float32 y orden de canales BGR, y la salida es un tensor `[1, 3549, 85]` con las predicciones por punto de anclaje antes de decodificar. El grafo ONNX no incluye NMS: la decodificación de cajas y la supresión de no máximos deben hacerse fuera del modelo.

Su relevancia actual es fundamentalmente práctica: es una alternativa con licencia Apache-2.0 a detectores YOLO más recientes publicados bajo AGPL (YOLOv8, YOLO26), lo que simplifica su integración en productos comerciales cerrados. El coste es un rendimiento inferior (32,8 AP en COCO val2017 a 416×416) y una API de inferencia más laboriosa, ya que el preprocesado y el postprocesado corren por cuenta del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-Tiny: CNN de una etapa, anchor-free, cabeza desacoplada |
| Parametros totales | 5,06 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada estática 416×416) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye el ONNX en float32) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 11), exportado desde PyTorch 1.7 |

## Arquitectura y entrenamiento

YOLOX-Tiny es una red convolucional de detección de una sola etapa. Frente a las generaciones previas de YOLO, introduce tres cambios descritos en el artículo: eliminación de las anclas (predicción directa por punto de la rejilla), cabeza desacoplada que separa la rama de clasificación de la de regresión de cajas, y una estrategia de asignación de etiquetas tipo SimOTA. La salida se calcula sobre tres escalas con strides 8, 16 y 32, lo que da lugar a 3549 puntos de predicción para una entrada de 416×416.

El entrenamiento se realizó desde cero sobre COCO 2017 train (80 clases), sin preentrenamiento en ImageNet, tal como indica el artículo. No se detalla en la información disponible el número exacto de tokens o iteraciones, la composición fina del dataset ni si hubo etapas de refinamiento adicionales. El modelo no emplea RLHF ni DPO, al no ser un modelo generativo de lenguaje.

## Capacidades

- Detección de objetos en imágenes para las 80 clases de COCO (de `person` a `toothbrush`), con cajas delimitadoras y puntuación de confianza por detección.
- Salida por punto de anclaje con `[x, y, w, h, objectness, 80 scores de clase]`; la puntuación final es el producto de objectness por la mejor clase, ambas ya pasadas por sigmoide.
- Preprocesado definido por el autor: letterbox alineado a la esquina superior izquierda, escala `r = min(416/h, 416/w)`, redimensionado bilineal y relleno de 114 a la derecha y abajo; entrada en BGR 0-255, sin normalización media/std, en formato NCHW float32.
- Postprocesado a cargo del integrador: decodificación por strides 8, 16 y 32 (`cx = (x + grid_x) * stride`, `w = exp(w) * stride`, etc.) y NMS independiente de clase con IoU 0,45 según la demo de referencia.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni procesamiento de lenguaje natural.
- No tiene capacidades multilingües ni modo de razonamiento (thinking mode); es exclusivamente un modelo de visión por computador.
- Integración específica con la librería Java inference4j mediante `YoloXDetector.tiny()`.

## Casos de uso

- **Detección de personas y objetos en aplicaciones Java de escritorio o servidor**: inference4j expone `YoloXDetector.tiny().build()` y `detect(Path)`, de modo que un servicio Java puede incorporar detección de objetos sin depender de Python ni de un runtime de aprendizaje profundo adicional.
- **Vigilancia y análisis de vídeo en tiempo casi real en hardware modesto**: con 5,06 M de parámetros y entrada fija de 416×416, el modelo cabe en GPUs de gama baja o incluso en CPU para flujos de pocos fotogramas por segundo; el coste de preprocesado es acotado y determinista.
- **Moderación de contenido visual**: las clases de COCO permiten filtrar personas, armas u objetos relevantes en imágenes subidas por usuarios antes de un análisis más profundo con un modelo de mayor precisión.
- **Sistemas de conducción asistida y robótica ligera**: detección de peatones, vehículos, señales de tráfico y semáforos en pipelines embebidos donde el presupuesto de cómputo y el consumo energético son críticos.
- **Análisis de inventario y estanterías en retail**: detección de categorías como botellas, tazas, sillas o libros en fotografías de producto, como paso previo a un recuento o a una verificación de stock.
- **Preetiquetado en flujos de anotación**: generar cajas candidatas de forma automática sobre grandes volúmenes de imágenes para que anotadores humanos solo revisen y corrijan, reduciendo el coste de construir datasets propios.
- **Prototipado rápido en entornos con requisitos de licencia estrictos**: al ser Apache-2.0, puede integrarse en productos comerciales cerrados sin las obligaciones de copyleft de AGPL que arrastran otras implementaciones YOLO.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| COCO val2017 (416×416) | AP | 32,8 |

El dato de 32,8 AP es el reportado por los autores de YOLOX para la variante Tiny a 416×416. No se han publicado en la información disponible resultados adicionales (AP50, AP75, AP por tamaño de objeto, latencia o throughput) para esta exportación ONNX concreta.

## Requisitos de hardware

- **VRAM estimada para inferencia**: muy baja; con 5,06 M de parámetros en float32, los pesos ocupan aproximadamente 20 MB, y la activación para una única imagen de 416×416 es del orden de decenas de MB. Cabe holgadamente en cualquier GPU con 1 GB o más de memoria.
- **GPU recomendadas**: cualquier GPU moderna es suficiente; el modelo no aprovecha bien GPUs de gama alta como A100 o H100 por su reducido tamaño, y en esos casos el cuello de botella suele ser el preprocesado y el postprocesado en CPU. Una RTX 4090, RTX 3060 o incluso una iGPU reciente son adecuadas.
- **Consumer GPU**: sí, sin restricciones prácticas; también es viable en CPU para cargas moderadas.
- **Opciones de despliegue**: ONNX Runtime (vía inference4j en Java), TensorRT, OpenVINO, o cualquier runtime compatible con ONNX opset 11. No se distribuyen pesos GGUF ni versiones para llama.cpp u Ollama, al no ser un modelo de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada. La entrada estática de 416×416 y el reducido número de parámetros sugieren latencias de pocos milisegundos en GPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | COCO AP | Licencia | Formato |
|---|---|---|---|---|---|
| YOLOX-Tiny (esta ficha) | 5,06 M | 416×416 | 32,8 | Apache-2.0 | ONNX |
| YOLOX-S | no disponible en la información | no disponible | no disponible en la información | Apache-2.0 | PyTorch / ONNX |
| YOLOv8n | no disponible en la información | no disponible | no disponible en la información | AGPL-3.0 | PyTorch / ONNX |
| YOLO26 | no disponible en la información | no disponible | no disponible en la información | AGPL-3.0 | no disponible |

La comparación cuantitativa con las alternativas no puede completarse con los datos disponibles: la model card solo aporta cifras de YOLOX-Tiny y menciona a YOLOv8 y YOLO26 como alternativas con licencia AGPL. La diferencia relevante y verificable es la licencia: Apache-2.0 frente a AGPL-3.0.

## Limitaciones y advertencias

- **Rendimiento modesto**: 32,8 AP en COCO val2017 es bajo en comparación con detectores contemporáneos de mayor tamaño; los objetos pequeños y las escenas densas son especialmente problemáticos en una entrada de 416×416.
- **Sesgos del dataset**: entrenado exclusivamente con COCO 2017, hereda los sesgos de anotación y de distribución de esa base (predominio de escenas cotidianas, desequilibrio entre clases, cobertura geográfica y cultural limitada). El rendimiento puede degradarse en dominios alejados de COCO, como imágenes médicas, aéreas o industriales.
- **Riesgo de falsos positivos y negativos**: la puntuación final combina objectness y clase; el umbral de confianza y el NMS (IoU 0,45 en la referencia) deben calibrarse para cada aplicación, y no se ofrecen curvas de precisión-recall en la información disponible.
- **Postprocesado obligatorio**: el grafo ONNX no incluye NMS ni decodificación de cajas; una implementación incorrecta de la decodificación por strides o del letterbox produce cajas mal escaladas o desplazadas.
- **Entrada estática**: solo acepta 416×416; no admite resolución variable sin reexportar el modelo.
- **Licencia**: Apache-2.0 permite uso comercial y modificación con obligación de conservar el aviso de licencia y de atribución; no hay cláusulas de copyleft. Conviene verificar la procedencia de los pesos originales de Megvii en la release 0.1.1rc0.
- **Mantenimiento**: el repositorio es un espejo sin cambios de inference4j, creado en noviembre de 2026, con cero descargas y cero likes; no hay garantía de soporte ni de actualizaciones por parte del autor del espejo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inference4j/yolox-tiny
- Repositorio original de Megvii (YOLOX): https://github.com/Megvii-BaseDetection/YOLOX
- Pesos originales `yolox_tiny.pth`: https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_tiny.pth
- Exportación ONNX oficial `yolox_tiny.onnx`: https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_tiny.onnx
- Artículo YOLOX (arXiv:2107.08430): https://arxiv.org/abs/2107.08430
- Librería inference4j: https://github.com/inference4j/inference4j
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
