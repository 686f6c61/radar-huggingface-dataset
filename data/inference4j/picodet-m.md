# inference4j/picodet-m

## Resumen

PP-PicoDet-M es un detector de objetos ligeros y anchor-free desarrollado por PaddlePaddle (Baidu) y publicado originalmente en el repositorio PaddleDetection. Esta ficha corresponde al espejo ONNX `inference4j/picodet-m`, una exportación oficial de los pesos `picodet_m_416_coco_lcnet.pdparams` convertida con Paddle2ONNX (opset 11) para su uso en entornos de inferencia independientes de PaddlePaddle, concretamente en la librería Java `inference4j`.

El modelo resuelve detección de objetos en 80 clases COCO con un coste computacional muy bajo: 3,46 millones de parámetros y una entrada estática de 416 x 416 píxeles. Su relevancia radica en que ofrece un equilibrio entre precisión (37,5 AP en COCO val2017) y eficiencia, lo que lo hace apto para dispositivos móviles, edge computing y aplicaciones Java de escritorio o servidor donde no se dispone de GPU dedicada.

La exportación no incluye posprocesamiento: la decodificación de cajas y la NMS deben ejecutarse fuera del grafo ONNX. Esto implica que el integrador debe implementar la lógica de decodificación de distribuciones (softmax sobre 8 bins por lado) y la NMS class-aware con los parámetros indicados por el autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-PicoDet-M (backbone LCNet, cuello LCPAN, cabeza PicoHeadV2), anchor-free |
| Parametros totales | 3,46 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada estática 416 x 416) |
| Tipos de cuantizacion | no disponible (solo se distribuye el grafo ONNX en float32) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 11) |
| Entrada | `image`: `[1, 3, 416, 416]` float32, NCHW, RGB, estática |
| Salidas | 8 tensores float32: scores para strides 8, 16, 32, 64 y distribuciones de caja para los mismos strides |
| Tarea | Detección de objetos, 80 clases COCO |
| Framework original | PaddlePaddle (PaddleDetection release 2.9) |

## Arquitectura y entrenamiento

PP-PicoDet-M emplea una arquitectura de detección anchor-free con backbone LCNet (una red convolucional ligera derivada de la familia MobileNet/PP-LCNet), un cuello LCPAN (Lightweight Cross-scale Path Aggregation Network) y la cabeza PicoHeadV2. La red produce predicciones en cuatro escalas (strides 8, 16, 32 y 64) sobre una rejilla de `ceil(416/s)` puntos de anclaje por escala, en orden row-major. Las cajas se parametrizan mediante distribuciones de 8 bins por lado (izquierda, superior, derecha, inferior), lo que evita la regresión directa de coordenadas y mejora la estabilidad del entrenamiento en modelos pequeños.

El entrenamiento se realizó sobre COCO 2017 train (80 clases), partiendo de pesos ImageNet-1k para el backbone LCNet procedentes de PaddleClas. No se dispone de información detallada sobre el número exacto de tokens o épocas, composición del dataset más allá de COCO, ni sobre el uso de RLHF/DPO (no aplica a un detector). La innovación técnica principal del trabajo original (Yu et al., arXiv:2111.00902) es el diseño de un detector en tiempo real para dispositivos móviles que combina una cabeza sin anclas, una neck ligera y una estrategia de asignación de etiquetas eficiente, alcanzando 37,5 AP con solo 3,46 M de parámetros.

## Capacidades

- Detección de objetos en 80 clases COCO (persona, vehículos, animales, utensilios, etc.).
- Salida de cajas delimitadoras con puntuaciones de confianza por clase.
- Funcionamiento en CPU sin necesidad de GPU, gracias a su reducido tamaño (3,46 M de parámetros).
- Inferencia en entornos Java mediante la librería `inference4j` (API `PicoDetDetector.m()`).
- Entrada de imagen estática de 416 x 416, adecuada para pipelines de tiempo real en dispositivos con recursos limitados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no procesa texto).
- No incluye posprocesamiento en el grafo: requiere decodificación de cajas y NMS externas.

## Casos de uso

- **Detección en aplicaciones Java de escritorio o servidor**: integración directa mediante `inference4j` para identificar objetos en imágenes sin depender de Python ni de PaddlePaddle, usando la API `ObjectDetector`.
- **Vigilancia y análisis de vídeo en edge**: el modelo puede ejecutarse en dispositivos con CPU modesta (Raspberry Pi, mini-PC) para detectar personas o vehículos en fotogramas redimensionados a 416 x 416, gracias a sus 3,46 M de parámetros.
- **Preprocesamiento en pipelines de visión**: uso como primer filtro para localizar regiones de interés antes de aplicar modelos más pesados (reconocimiento facial, OCR, clasificación fina), reduciendo el coste computacional global.
- **Automatización de inventario o control de calidad**: detección de productos u objetos en imágenes de cámara industrial, con la NMS class-aware configurada a IoU 0,6 y umbral de score 0,025 para recuperar detecciones densas.
- **Análisis de imágenes en aplicaciones móviles o híbridas**: al ser un modelo ONNX ligero, puede embeberse en apps que ejecuten inferencia local sin conexión, preservando la privacidad de las imágenes.
- **Prototipado rápido en investigación**: punto de partida para experimentos de detección de objetos con un coste de entrenamiento y despliegue mínimo, o como baseline para comparar con detectores más grandes.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| COCO AP (val2017) | 37,5 | Entrada 416 x 416, según los autores de PaddleDetection |

No se han publicado en la información disponible resultados adicionales de benchmarks (por ejemplo, AP50, AP75, latencia o throughput) para esta exportación ONNX concreta. El dato de 37,5 AP proviene de la model card y corresponde a la evaluación original en PaddlePaddle, no necesariamente a la inferencia ONNX con posprocesamiento externo.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 3,46 M de parámetros en float32, el grafo ONNX ocupa aproximadamente 14 MB. La inferencia puede ejecutarse íntegramente en CPU con menos de 1 GB de RAM adicional para tensores intermedios.
- **GPU recomendadas**: no requiere GPU. En caso de usarse, cualquier GPU con soporte ONNX Runtime (GTX 1050, RTX 3050, RTX 4090, A100, H100) puede acelerar la inferencia, pero el cuello de botella será el preprocesamiento de imagen.
- **Consumer GPU**: cabe holgadamente en cualquier GPU de consumo, incluidas integradas (Intel Iris Xe, AMD Vega) y en dispositivos ARM (Raspberry Pi 4/5, Jetson Nano).
- **Opciones de despliegue**: ONNX Runtime (Java, C++, Python, C#), `inference4j` para Java, o cualquier runtime compatible con ONNX opset 11. No se distribuye en GGUF ni en otros formatos.
- **Latencia y throughput**: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera latencia de pocos milisegundos por imagen en CPU moderna, pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | COCO AP | Licencia | Formato |
|---|---|---|---|---|---|
| PP-PicoDet-M (este) | 3,46 M | 416 x 416 | 37,5 | Apache-2.0 | ONNX |
| PP-PicoDet-S | no disponible | 320 x 320 | no disponible | Apache-2.0 | PaddlePaddle / ONNX |
| YOLOv5n | ~1,9 M | 640 x 640 | ~28,0 (referencia pública) | GPL-3.0 / AGPL | PyTorch / ONNX |
| YOLOv8n | ~3,2 M | 640 x 640 | ~37,3 (referencia pública) | AGPL-3.0 | PyTorch / ONNX |

No se dispone de datos verificados en la información proporcionada para PP-PicoDet-S ni para las variantes de YOLO; las cifras de YOLO se incluyen solo como referencia orientativa de la categoría y deben contrastarse con las fuentes oficiales. La ventaja principal de PP-PicoDet-M frente a alternativas es su licencia Apache-2.0 permisiva para uso comercial, frente a las licencias AGPL/GPL de la familia YOLO.

## Limitaciones y advertencias

- **Sin posprocesamiento en el grafo**: la decodificación de cajas (softmax sobre 8 bins, suma ponderada, escalado por stride) y la NMS class-aware (IoU 0,6, score > 0,025, top 1000 por clase, 100 retenidas) deben implementarse externamente; un error en esta lógica degrada gravemente la precisión.
- **Entrada estática y sin preservación de aspecto**: el redimensionado a 416 x 416 sin mantener la relación de aspecto (bicúbico) puede distorsionar objetos alargados y afectar a la detección.
- **Clases limitadas**: solo detecta las 80 clases COCO; no reconoce categorías fuera de ese conjunto.
- **Sesgos del dataset**: COCO presenta desequilibrios de representación por clase, contexto geográfico y condiciones de iluminación; el modelo hereda esos sesgos.
- **Riesgo de falsos positivos/negativos**: con umbral de score bajo (0,025) se generan muchas detecciones candidatas; la NMS y el umbral final deben ajustarse según la aplicación.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero se debe conservar el aviso de licencia y la atribución a PaddlePaddle.
- **Mantenimiento**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un espejo reciente (creado en 2026) sin comunidad consolidada, por lo que la validación en producción corre a cargo del integrador.
- **Sin datos de cuantización**: no se ofrecen versiones int8 ni FP16 en el repositorio; el integrador debe cuantizar por su cuenta si necesita reducir aún más el coste.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/inference4j/picodet-m)
- [Repositorio PaddleDetection (release 2.9, configs/picodet)](https://github.com/PaddlePaddle/PaddleDetection/tree/release/2.9/configs/picodet)
- [Paper PP-PicoDet (arXiv:2111.00902)](https://arxiv.org/abs/2111.00902)
- [Librería inference4j](https://github.com/inference4j/inference4j)
- [Pesos originales PaddlePaddle](https://paddledet.bj.bcebos.com/models/picodet_m_416_coco_lcnet.pdparams)
- [Exportación ONNX oficial](https://paddledet.bj.bcebos.com/deploy/third_engine/picodet_m_416_coco_lcnet.onnx)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
