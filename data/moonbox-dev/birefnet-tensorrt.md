# moonbox-dev/BiRefNet-TensorRT

## Resumen

BiRefNet-TensorRT es una distribución de motores TensorRT del modelo BiRefNet (Bilateral Reference for High-Resolution Dichotomous Image Segmentation), publicada por moonbox-dev para GPUs NVIDIA RTX. BiRefNet resuelve el problema de la segmentación dicotómica de imágenes (DIS, *dichotomous image segmentation*), es decir, la separación de alta resolución entre objeto y fondo con bordes finos, lo que lo hace idóneo para tareas de eliminación de fondo y matting. El modelo original lo desarrollaron Peng Zheng, Dehong Gao, Deng-Ping Fan y colaboradores (Nankai University, Northwestern Polytechnical University, entre otras instituciones) y se describe en el paper arXiv:2401.03407.

Esta variante concreta no es un modelo nuevo: es el mismo BiRefNet general convertido a un motor TensorRT de precisión fp16, construido a partir de un grafo ONNX fp16 publicado por Moonbox. El repositorio incluye el motor (`model.engine`, 717,8 MB), un runner mínimo en numpy que usa TensorRT y Polygraphy sin PyTorch (`trt_runner.py`) y un script de pipeline (`cutout_trt.py`). Su relevancia es práctica: reduce el tiempo de inferencia a 241 ms por imagen frente a 583 ms del ONNX fp16 y 728 ms del ONNX fp32, y baja el pico de memoria de GPU de 9531 MiB a 2665 MiB, manteniendo una fidelidad de IoU 0,9980 y MAE 0,0003 respecto al grafo fp32 de referencia.

El motor está compilado con compatibilidad de hardware (Ampere y posteriores: RTX 30, 40 y 50) y de versión (cualquier TensorRT 10.x desde 10.13), de modo que no requiere recompilación por GPU, a costa de algo de velocidad frente a un motor optimizado para un modelo concreto de tarjeta. La licencia es MIT y el repositorio ocupa 0,7 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiRefNet (segmentación de imágenes con referencias bilaterales); empaquetado como motor TensorRT *strongly typed* |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 1024 x 1024 píxeles) |
| Tipos de cuantización | fp16 únicamente (sin int8: el build ONNX int8 es *weight-only* y TensorRT int8 requiere activaciones calibradas) |
| Idiomas soportados | no aplica (procesamiento de imágenes) |
| Licencia | MIT |
| Formato de pesos | motor TensorRT (`model.engine`); grafo de origen ONNX fp16 |
| Modelo base | ZhengPeng7/BiRefNet (revisión `e2bf8e4460`) |
| Tamaño del repositorio | 0,7 GB |
| Librería | tensorrt |
| Pipeline | image-segmentation |
| Entrada | tensor `[1, 3, 1024, 1024]`, RGB en rango 0-1 con media y desviación estándar de ImageNet |
| Salida | máscara (matte) única con sigmoide aplicada |
| Compatibilidad de hardware | Ampere y posteriores (RTX 30, 40 y 50) |
| Compatibilidad de versión | TensorRT 10.x desde 10.13 (runtime *lean*) |

## Arquitectura y entrenamiento

BiRefNet es una red neuronal convolucional profunda diseñada específicamente para segmentación dicotómica de alta resolución. Su innovación principal es el módulo de referencia bilateral, que combina referencias de alto nivel (semántica global del objeto) con referencias de bajo nivel (detalles de borde y textura) para producir mattes con contornos precisos. El modelo original fue entrenado por sus autores sobre conjuntos de datos de segmentación dicotómica como DIS5K; los detalles concretos de composición del dataset, número de tokens o etapas de ajuste no están disponibles en la información proporcionada.

En esta distribución, el entrenamiento no interviene: moonbox-dev parte del grafo ONNX fp16 del modelo oficial y lo compila con el *builder* de TensorRT. El motor es *strongly typed*, de forma que cada tensor conserva la precisión que le asigna el grafo ONNX, y por tanto un motor fp16 calcula lo mismo que el build ONNX fp16. El motor se construyó en una RTX 3080 Laptop GPU y se validó contra el modelo original antes de la subida, con hashes sha256 publicados para cada fichero. La compilación con compatibilidad de hardware y versión implica renunciar a optimizaciones específicas de una GPU concreta a cambio de portabilidad sin recompilación.

## Capacidades

- Segmentación dicotómica de imágenes: genera una máscara (matte) binaria suave que separa el objeto principal del fondo.
- Eliminación de fondo de alta resolución: el matte se devuelve a la resolución original de la imagen mediante `cutout_trt.py`.
- Matting con bordes finos: la arquitectura de referencias bilaterales está pensada para preservar detalles de contorno, pelo y texturas.
- Inferencia sin PyTorch: el runner usa únicamente TensorRT, Polygraphy y numpy.
- Procesamiento por lotes de imágenes: el pipeline acepta una imagen por ejecución con entrada fija de 1024 x 1024.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingual ni modalidades de audio o vídeo: es exclusivamente un modelo de visión para segmentación.

## Casos de uso

- Eliminación de fondo en producción: el motor procesa una imagen en 241 ms con 2665 MiB de pico de memoria en una RTX 3080 Laptop, lo que permite integrarlo en pipelines de generación de recortes para catálogos de e-commerce sin depender de PyTorch.
- Automatización de flujos de diseño gráfico: `cutout_trt.py` devuelve el matte a la resolución original de la foto, de modo que se puede encadenar con herramientas de composición para sustituir fondos de forma masiva.
- Preprocesado para otros modelos de visión: la máscara generada sirve para aislar objetos antes de pasarlos a clasificadores, detectores o modelos de imagen a imagen, reduciendo ruido de fondo.
- Edición fotográfica asistida: el matte de alta calidad permite recortes precisos de sujetos en aplicaciones de retoque, con bordes finos gracias a las referencias bilaterales.
- Procesamiento en GPUs de consumo: al caber en 2665 MiB de VRAM y ser compatible con RTX 30, 40 y 50 sin recompilación, es viable en estaciones de trabajo con tarjetas consumer.
- Despliegue en entornos sin PyTorch: el runner basado en numpy, TensorRT y Polygraphy simplifica el empaquetado en contenedores ligeros o servicios donde instalar el stack completo de PyTorch no es deseable.
- Evaluación de calidad de segmentación: los scripts y el motor permiten reproducir las métricas publicadas (MAE, S-measure, IoU frente a fp32) sobre los conjuntos de test de DIS5K.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Las mediciones se hicieron sobre los conjuntos de test de DIS5K (250 imágenes: DIS-TE1..4 y DIS-VD, 50 cada uno) en una RTX 3080 Laptop GPU. Los tiempos son medianas por imagen, incluyendo el redimensionado a y desde 1024 x 1024; las filas ONNX usan el proveedor CUDA de ONNX Runtime.

| Modelo | vs fp32: IoU / MAE | DIS5K MAE / S-measure | ms por imagen | Pico de memoria GPU |
|---|---|---|---|---|
| ONNX fp32 (referencia) | - | 0,0141 / 0,953 | 728 | 9531 MiB |
| ONNX fp16 | 0,9981 / 0,0002 | 0,0141 / 0,953 | 583 | 7890 MiB |
| TensorRT fp16 | 0,9980 / 0,0003 | 0,0141 / 0,953 | 241 | 2665 MiB |

Criterio de aceptación declarado por el autor: MAE <= 0,005 e IoU >= 0,98 frente a fp32. El motor TensorRT fp16 lo cumple con margen. No se han publicado otros benchmarks (por ejemplo, comparativas con modelos de segmentación alternativos) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 2665 MiB de pico medido en la RTX 3080 Laptop para el motor fp16.
- GPU recomendadas: cualquier GPU NVIDIA Ampere o posterior; el motor se construyó con compatibilidad de hardware para RTX 30, 40 y 50. También es compatible con A100 y H100 por arquitectura, aunque el autor no publica mediciones en esas tarjetas.
- GPU de consumo: sí, cabe holgadamente en RTX 3060 (12 GB), RTX 3070, RTX 3080, RTX 4070, RTX 4080, RTX 4090 y RTX 50 series.
- Despliegue: TensorRT 10.x desde 10.13 mediante `tensorrt-cu12` y `tensorrt-lean-cu12`, más Polygraphy y numpy. No requiere PyTorch ni ONNX Runtime en tiempo de inferencia.
- Instalación: `pip install "tensorrt-cu12>=10.13,<11" "tensorrt-lean-cu12>=10.13,<11" polygraphy numpy`.
- Latencia y throughput: 241 ms por imagen (mediana) en RTX 3080 Laptop, equivalente a unas 4,1 imágenes por segundo en ese hardware. No hay datos de throughput en otras GPU.
- Almacenamiento: 0,7 GB para el repositorio completo; el motor fp16 ocupa 717,8 MB.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| BiRefNet-TensorRT (fp16) | Segmentación dicotómica | 1024 x 1024 | MIT | Motor TensorRT | 241 ms, 2665 MiB, IoU 0,9980 vs fp32 |
| BiRefNet ONNX fp16 | Segmentación dicotómica | 1024 x 1024 | MIT | ONNX | 583 ms, 7890 MiB, IoU 0,9981 vs fp32 |
| BiRefNet ONNX fp32 | Segmentación dicotómica | 1024 x 1024 | MIT | ONNX | 728 ms, 9531 MiB |
| ZhengPeng7/BiRefNet (original) | Segmentación dicotómica | 1024 x 1024 | MIT | PyTorch | no disponible en la información proporcionada |

La comparativa se limita a las variantes del mismo modelo base, que son las únicas con datos publicados en la información disponible. No se dispone de comparaciones con otros modelos de segmentación como SAM, U2-Net o RMBG en esta ficha.

## Limitaciones y advertencias

- Solo fp16: no hay motor int8, porque el build ONNX int8 es *weight-only* y TensorRT int8 exige activaciones calibradas. No se puede reducir más la huella de memoria por esta vía.
- Entrada fija: el motor acepta exclusivamente tensores `[1, 3, 1024, 1024]`; las imágenes deben redimensionarse antes y el matte devolverse a la resolución original, lo que puede introducir pérdida de detalle en imágenes muy grandes o muy pequeñas.
- Compatibilidad de hardware limitada: requiere GPU NVIDIA Ampere o posterior. No funciona en GPUs anteriores (Turing, Pascal) ni en hardware no NVIDIA.
- Compatibilidad de versión: exige TensorRT 10.x desde 10.13; versiones anteriores o la 11 no están soportadas según la model card.
- Rendimiento no óptimo por GPU: al ser un motor con compatibilidad de hardware genérica, es algo más lento que un motor compilado para una GPU concreta.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al ser un modelo de segmentación, la calidad puede degradarse en categorías de objeto poco representadas en el entrenamiento original.
- Alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir mattes incorrectos en escenas ambiguas, con múltiples objetos o con fondos de complejidad similar al sujeto.
- Licencia: MIT, heredada del modelo original; permite uso comercial, pero el autor indica que la licencia del modelo original gobierna el uso de estos ficheros.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Idiomas: no aplica; el modelo no procesa texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/BiRefNet-TensorRT
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet
- Paper (arXiv:2401.03407): https://arxiv.org/abs/2401.03407
- Conjunto de datos DIS5K: https://github.com/xuebinqin/DIS
- Ficheros del repositorio:
  - https://huggingface.co/moonbox-dev/BiRefNet-TensorRT/blob/main/fp16/model.engine
  - https://huggingface.co/moonbox-dev/BiRefNet-TensorRT/blob/main/fp16/trt_runner.py
  - https://huggingface.co/moonbox-dev/BiRefNet-TensorRT/blob/main/fp16/cutout_trt.py
  - https://huggingface.co/moonbox-dev/BiRefNet-TensorRT/blob/main/fp16/config.json
