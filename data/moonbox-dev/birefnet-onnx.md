# moonbox-dev/BiRefNet-ONNX

## Resumen
BiRefNet-ONNX es una distribucion en formato ONNX del modelo BiRefNet (Bilateral Reference for High-Resolution Dichotomous Image Segmentation), desarrollada por moonbox-dev para su uso en dispositivos mediante ONNX Runtime con ejecucion en CUDA, DirectML o CPU. El modelo original, creado por Peng Zheng y colaboradores (Nankai University, Northwestern Polytechnical University, NUDT, Aalto University, entre otros), resuelve el problema de la segmentacion dicotomica de imagenes de alta resolucion: separar un objeto o persona del fondo con un matiz alfa de alta calidad, incluyendo estructuras finas como cabello, pelaje o bordes complejos.

El repositorio empaqueta el grafo oficial fp32 `BiRefNet-general-epoch_244.onnx` en tres precisiones (fp16, int8 e int4), cada una en su propia carpeta con un unico archivo `model.onnx`. La entrada es una imagen RGB de 1024 x 1024 normalizada con estadisticas de ImageNet y la salida es directamente el matiz alfa (sigmoide ya aplicada), lo que simplifica la integracion en pipelines de eliminacion de fondo.

La relevancia actual radica en que permite desplegar un modelo de segmentacion de alta calidad en entornos sin GPU dedicada o con recursos limitados, con tamanos de archivo de entre 0,24 GB y 0,49 GB y una perdida de fidelidad respecto al grafo fp32 practicamente despreciable (IoU de 0,9981 en fp16 y 0,9899 en int4). La licencia MIT facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional con referencias bilaterales (BiRefNet); grafo ONNX unico |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 1024 x 1024 px) |
| Tipos de cuantizacion | fp16, int8 (QDQ por canal, weight-only con calibracion MinMax), int4 (MatMulNBits, bloque 32) |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` por carpeta de precision) |

## Arquitectura y entrenamiento
BiRefNet es una red de segmentacion dicotomica de imagenes de alta resolucion basada en referencias bilaterales: combina caracteristicas de bajo nivel y alto nivel para refinar los bordes y preservar estructuras finas. El modelo original se publica en el paper arXiv:2401.03407 y su implementacion de referencia esta en el repositorio GitHub de ZhengPeng7. Esta version ONNX parte de la revision `e2bf8e4460` del modelo original y del grafo fp32 oficial `BiRefNet-general-epoch_244.onnx` de la release v1, que corresponde al modelo de uso general.

La conversion se realizo con onnxconverter-common para fp16 (manteniendo entradas y salidas en fp32), con la cuantizacion estatica QDQ de ONNX Runtime para int8 (pesos int8 por canal de salida detras de DequantizeLinear, activaciones en coma flotante y calibracion MinMax sobre imagenes fuera del conjunto de evaluacion) y con MatMulNBits de ONNX Runtime para int4 (pesos de las MatMul en 4 bits con bloque 32, mientras que las convoluciones restantes quedan en int8 weight-only). No se genero una version bf16 porque el proveedor CUDA de ONNX Runtime no dispone de convolucion bf16. No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni el uso de RLHF/DPO, ya que se trata de un modelo de vision y la model card no detalla esos datos.

## Capacidades
- Segmentacion dicotomica de imagenes de alta resolucion: separa objetos, personas y estructuras finas del fondo generando un matiz alfa.
- Eliminacion de fondo de uso general: el grafo corresponde al modelo `general-epoch_244`, orientado a objetos y personas.
- Preservacion de detalles finos como cabello, pelaje y bordes complejos, gracias al diseno de referencias bilaterales.
- Salida directa de matiz alfa con sigmoide aplicada, lista para composicion sobre transparencia.
- Inferencia en ONNX Runtime con proveedores CUDA, DirectML y CPU, lo que permite despliegue en servidor, Windows o dispositivos sin GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingues, al no ser un modelo de lenguaje.
- No dispone de modo thinking, vision multimodal, audio ni otras capacidades generativas.

## Casos de uso
- Eliminacion de fondo en fotografia de producto: se introduce una imagen de 1024 x 1024 normalizada y se obtiene el matiz alfa para generar recortes con transparencia en catalogos de comercio electronico, con un coste de inferencia de unos 583 ms por imagen en fp16 sobre una RTX 3080 Laptop.
- Edicion fotografica y retoque: el modelo separa personas y objetos del fondo para permitir sustituciones de fondo o composiciones, manteniendo el detalle en el contorno del cabello.
- Procesamiento por lotes en servidor con CPU: la version int8 (315 MB) permite ejecutar la segmentacion en entornos sin GPU mediante el proveedor CPU de ONNX Runtime, con una calidad practicamente identica a fp32 (IoU 0,9984).
- Aplicaciones de escritorio en Windows: la version fp16 o int8 con el proveedor DirectML permite integrar la eliminacion de fondo en herramientas nativas sin depender de CUDA.
- Dispositivos con recursos limitados: la version int4 (244 MB) reduce el peso del modelo y mantiene un MAE de 0,0139 frente a la verdad de referencia, adecuada para integraciones en hardware con poca memoria.
- Generacion de mascaras para pipelines de vision por computador: el matiz alfa puede usarse como mascara previa en tareas de composicion, segmentacion o analisis de imagenes.
- Automatizacion de flujos de diseno grafico: integracion del grafo ONNX en scripts que procesan imagenes y generan PNG con canal alfa de forma desatendida.

## Benchmarks y rendimiento
Los datos de la model card se obtuvieron sobre los conjuntos de test DIS5K (250 imagenes: DIS-TE1 a TE4 y DIS-VD, 50 cada uno), con ONNX Runtime 1.30 y proveedor CUDA sobre una RTX 3080 Laptop GPU. Las mascaras se redujeron a un maximo de 2048 px en el lado largo y se evaluaron con PySODMetrics.

| Precision | Tamano | vs fp32 (IoU, MAE) | MAE | S-measure | max F | Tiempo / imagen | VRAM pico |
|---|---|---|---|---|---|---|---|
| fp32 (referencia, no publicado) | 973 MB | - | 0,0141 | 0,953 | 0,959 | 728 ms | 9,3 GB |
| fp16 | 490 MB | IoU 0,9981, MAE 0,0002 | 0,0141 | 0,953 | 0,959 | 583 ms | 7,7 GB |
| int8 | 315 MB | IoU 0,9984, MAE 0,0002 | 0,0142 | 0,953 | 0,959 | 729 ms | 8,6 GB |
| int4 | 244 MB | IoU 0,9899, MAE 0,0016 | 0,0139 | 0,953 | 0,960 | 731 ms | 8,7 GB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 7,7 GB en fp16, 8,6 GB en int8 y 8,7 GB en int4, medidos como pico de VRAM en una RTX 3080 Laptop GPU con ONNX Runtime 1.30.
- GPU recomendadas: RTX 3080 Laptop o superiores para ejecucion CUDA; el modelo tambien puede ejecutarse en CPU o mediante DirectML.
- Cabe en GPU de consumo: si, en tarjetas con al menos unos 9 GB de VRAM para el proveedor CUDA; en CPU el consumo de memoria depende del runtime y de la precision elegida.
- Opciones de despliegue: ONNX Runtime con proveedores CUDAExecutionProvider, CPUExecutionProvider o DirectML; el modelo se distribuye como grafo ONNX unico por precision.
- Latencia y throughput estimados: entre 583 ms y 731 ms por imagen de 1024 x 1024 en la RTX 3080 Laptop GPU citada; no se dispone de datos de throughput para otros hardwares.
- Tamano en disco: 0,49 GB (fp16), 0,31 GB (int8) y 0,24 GB (int4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BiRefNet-ONNX (este) | no disponible | 1024 x 1024 px | DIS5K MAE 0,0141; S-measure 0,953 | MIT | ONNX en Hugging Face |
| BiRefNet original (ZhengPeng7/BiRefNet) | no disponible | 1024 x 1024 px | Referencia fp32 del mismo modelo | MIT | PyTorch en Hugging Face y GitHub |
| Alternativas de segmentacion dicotomica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos de segmentacion dicotomica en la informacion proporcionada, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias
- Modelo de vision sin capacidades de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Entrada fija de 1024 x 1024 px con normalizacion ImageNet; las imagenes deben redimensionarse y normalizarse antes de la inferencia.
- El matiz alfa se calcula sobre la imagen redimensionada y luego se reescala al tamano original, lo que puede introducir perdida de detalle en imagenes de muy alta resolucion.
- Riesgo de errores en la segmentacion de objetos poco comunes, con bajo contraste o con fondos complejos; el modelo es de uso general y no esta especializado en dominios concretos.
- La cuantizacion int4 reduce la fidelidad respecto a fp32 (IoU 0,9899 frente a 0,9981 en fp16), por lo que conviene validar la calidad en el caso de uso concreto.
- No se ha generado version bf16 por limitaciones del proveedor CUDA de ONNX Runtime para convoluciones bf16.
- No se dispone de informacion sobre sesgos del modelo original ni sobre su comportamiento en determinados grupos demograficos.
- Licencia MIT: permite uso comercial, pero los archivos son un derivado del modelo original y quedan sujetos a su licencia, copiada en el repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion externa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/BiRefNet-ONNX
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet
- Paper: https://arxiv.org/abs/2401.03407
- Repositorio GitHub de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- Release v1 con el grafo ONNX fp32 oficial: https://github.com/ZhengPeng7/BiRefNet/releases/tag/v1
- Conjunto de datos DIS5K: https://github.com/xuebinqin/DIS
