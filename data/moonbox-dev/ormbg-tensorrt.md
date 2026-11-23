# moonbox-dev/ormbg-TensorRT

## Resumen

ORMBG TensorRT es una compilación en motores TensorRT del modelo Open Remove Background Model (ORMBG), un removedor de fondos de código abierto especializado en imágenes con personas. Lo desarrolla Moonbox a partir del modelo original de schirrmacher, y se distribuye como artefactos listos para inferencia en GPUs NVIDIA RTX de las series 30, 40 y 50. El modelo resuelve la segmentación de primer plano y el matting de retrato (generación de alfa con bordes suaves) sin necesidad de reentrenar ni convertir pesos: se entrega un `model.engine` compilado, un runner mínimo en NumPy con TensorRT y Polygraphy, y un script de pipeline completo.

La arquitectura subyacente es ISNet, derivada de la investigación Highly Accurate Dichotomous Image Segmentation (DIS), con una red fuertemente tipada que preserva la precisión del grafo ONNX de origen. El repositorio ocupa 0,2 GB y contiene únicamente la precisión fp16 (142,2 MB de motor), ya que la build int8 de ONNX es weight-only y TensorRT requiere activaciones calibradas. La entrada es una imagen RGB de 1024 x 1024 en rango 0-1 sin normalización, con formato [1, 3, 1024, 1024], y la salida 0 es la máscara alfa reescalada a 0-1.

Su relevancia práctica está en el rendimiento y el consumo de memoria: en una RTX 3080 Laptop logra 197 ms por imagen con un pico de 461 MiB de VRAM, frente a 1717 MiB del grafo ONNX fp32 de referencia, manteniendo una fidelidad de IoU 0,9969 y MAE 0,0005 respecto a fp32. Los motores son compatibles a nivel de hardware (Ampere y posteriores) y de versión (TensorRT 10.x desde 10.13), por lo que no requieren recompilación por GPU concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ISNet (basada en Highly Accurate Dichotomous Image Segmentation, DIS); red fuertemente tipada exportada a TensorRT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 1024 x 1024 px) |
| Tipos de cuantizacion | fp16 únicamente (sin int8; la build ONNX int8 es weight-only y TensorRT exige activaciones calibradas) |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | TensorRT engine (`model.engine`), con runner en Python (`trt_runner.py`) y configuración JSON |
| Tamaño del repositorio | 0,2 GB |
| Tamaño del motor fp16 | 142,2 MB |
| Entrada | RGB 0-1 sin normalización, tensor [1, 3, 1024, 1024] |
| Salida | máscara alfa (output 0) reescalada a 0-1; salidas laterales adicionales |
| Compatibilidad de hardware | Ampere y posteriores (RTX 30, 40 y 50) |
| Compatibilidad de versión | TensorRT 10.x desde 10.13 (runtime lean) |
| Modelo base | schirrmacher/ormbg (revisión 6253b31824) |

## Arquitectura y entrenamiento

El modelo original ORMBG se basa en ISNet, la red propuesta en la investigación Highly Accurate Dichotomous Image Segmentation (DIS), orientada a segmentación dicotómica de alta precisión con contornos finos. La compilación de Moonbox parte de su grafo ONNX fp16 publicado del modelo oficial y lo construye con el builder de TensorRT en modo fuertemente tipado: cada tensor conserva la precisión que le asigna el grafo ONNX, de modo que el motor fp16 calcula exactamente lo que calcula la build ONNX fp16. Los motores se generaron en una RTX 3080 Laptop y se validaron contra el original antes de la subida, con hashes sha256 publicados para cada fichero.

En cuanto al entrenamiento del modelo base, la model card original indica que el autor comenzó con imágenes sintéticas del Human Segmentation Dataset, generadas con LayerDiffuse, pero observó que el modelo rendía peor en imágenes reales: la iluminación artificial, la oclusión, la escala y los fondos sintéticos limitaban la calidad de la segmentación. No se especifican en la información disponible el número de tokens, la composición final del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de segmentación). Tampoco se detallan innovaciones como decodificación especulativa o atención lineal, que no corresponden a este tipo de red.

## Capacidades

- Segmentación de primer plano y matting de retrato: genera una máscara alfa con bordes suaves a partir de una imagen RGB.
- Extracción de fondos (background removal) optimizada para fotografías de personas.
- Salida de máscara a resolución nativa de la imagen original: el script `cutout_trt.py` reescala la máscara de 1024 x 1024 al tamaño de la foto de entrada.
- Composición directa: el ejemplo de la model card aplica la máscara como canal alfa y guarda un PNG con transparencia.
- Inferencia sin PyTorch: el runner usa únicamente TensorRT, Polygraphy y NumPy.
- Ejecución por línea de comandos (`python fp16/cutout_trt.py photo.jpg cutout.png`) o por API en Python.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de una sola tarea.

## Casos de uso

- Eliminación de fondos en fotografía de retrato: el modelo recibe la imagen a 1024 x 1024 y devuelve una máscara alfa que se aplica como canal de transparencia, adecuada para estudios fotográficos que necesitan recortes limpios de personas sin intervención manual.
- Generación de avatares y fotos de perfil: integrado en un servicio web, procesa la imagen subida por el usuario, aplica la máscara y devuelve un PNG con fondo transparente listo para redes sociales o fichas de usuario.
- Comercio electrónico y catálogos de moda: permite aislar modelos y prendas sobre fondos neutros de forma automatizada, sustituyendo el trabajo de recorte manual en lotes grandes de imágenes de producto con personas.
- Preprocesado para pipelines de visión por computador: la máscara de primer plano sirve como paso previo para reidentificación, análisis de pose o edición de imágenes, eliminando el ruido del fondo antes de otras etapas.
- Edición fotográfica asistida y herramientas de diseño: permite componer personas sobre nuevos fondos en aplicaciones de retoque, con bordes suaves gracias al matting en lugar de un recorte binario duro.
- Procesamiento por lotes en GPUs de consumo: con 461 MiB de pico de VRAM y 197 ms por imagen en una RTX 3080 Laptop, un equipo con GPU de gama media puede procesar miles de imágenes por hora sin infraestructura de servidor dedicada.
- Despliegue en aplicaciones de escritorio o locales: al no requerir PyTorch y usar solo el runtime lean de TensorRT, el motor se puede empaquetar en herramientas de escritorio para Windows o Linux con GPU NVIDIA.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos sobre los conjuntos de test de DIS5K (250 imágenes: DIS-TE1..4 y DIS-VD, 50 cada uno) en una RTX 3080 Laptop GPU. La fidelidad se mide como acuerdo con las máscaras del grafo ONNX fp32 (IoU de las máscaras a 0,5 y diferencia absoluta media); la calidad, como MAE y S-measure frente al ground truth con PySODMetrics sobre máscaras reducidas a un máximo de 2048 px.

| Modelo | vs fp32: IoU / MAE | DIS5K MAE / S-measure | ms por imagen | Memoria GPU pico |
|---|---|---|---|---|
| ONNX fp32 (referencia) | - | 0,1462 / 0,720 | 197 | 1717 MiB |
| ONNX fp16 | 0,9986 / 0,0003 | 0,1461 / 0,720 | 176 | 836 MiB |
| TensorRT `fp16/` | 0,9969 / 0,0005 | 0,1461 / 0,720 | 197 | 461 MiB |

Los tiempos son medianas por imagen e incluyen el redimensionado a y desde 1024 x 1024. Las filas ONNX se midieron con el proveedor CUDA de ONNX Runtime. El criterio de aceptación fijado por el autor (MAE <= 0,005 e IoU >= 0,98 frente a fp32) se cumple en la build TensorRT.

## Requisitos de hardware

- VRAM estimada: 461 MiB de pico en la build TensorRT fp16 (frente a 836 MiB en ONNX fp16 y 1717 MiB en ONNX fp32).
- GPU compatibles: arquitectura Ampere o posterior, es decir, RTX 30, 40 y 50 series; los motores son hardware-compatible y no requieren recompilación por modelo de GPU.
- Cabe holgadamente en cualquier GPU de consumo NVIDIA desde la RTX 3060 en adelante; el límite práctico es la disponibilidad del runtime de TensorRT, no la memoria.
- Despliegue: runtime `tensorrt-cu12>=10.13,<11` y `tensorrt-lean-cu12>=10.13,<11` junto con Polygraphy y NumPy (`pip install "tensorrt-cu12>=10.13,<11" "tensorrt-lean-cu12>=10.13,<11" polygraphy numpy`). No requiere PyTorch, vLLM, llama.cpp ni Ollama, que no aplican a este formato.
- Latencia y throughput: 197 ms medianos por imagen en una RTX 3080 Laptop, incluyendo el redimensionado de ida y vuelta; equivale a unas 5 imágenes por segundo en ese hardware, escalable con GPUs de mayor rendimiento.
- Compromiso de compatibilidad: los motores hardware-compatible pierden algo de velocidad frente a un motor compilado para una GPU concreta, a cambio de no necesitar rebuild.

## Comparativa con modelos similares

| Modelo | Formato | Precisión | Memoria GPU pico | Latencia (RTX 3080 Laptop) | Licencia |
|---|---|---|---|---|---|
| ORMBG TensorRT (este) | TensorRT engine | fp16 | 461 MiB | 197 ms/imagen | Apache-2.0 |
| ORMBG ONNX fp16 | ONNX | fp16 | 836 MiB | 176 ms/imagen | Apache-2.0 |
| ORMBG ONNX fp32 | ONNX | fp32 | 1717 MiB | 197 ms/imagen | Apache-2.0 |

La comparación directa disponible en la información se limita a las distintas builds del mismo modelo base; no se han publicado en la documentación proporcionada comparativas con otros removedores de fondos (por ejemplo, modelos de la familia U2-Net o RMBG), por lo que esos datos se consideran no disponibles.

## Limitaciones y advertencias

- Modelo especializado en imágenes con personas: el entrenamiento del modelo base se orientó a retratos, y el autor original señala que las imágenes sintéticas usadas al principio limitaban el rendimiento en imágenes reales; el comportamiento en otros dominios (productos sin personas, paisajes, animales) no está garantizado.
- Resolución de entrada fija de 1024 x 1024: las imágenes se redimensionan antes de la inferencia y la máscara se reescala después, lo que puede degradar detalles finos en imágenes de muy alta resolución o en sujetos pequeños.
- Solo fp16: no hay build int8 en este repositorio, por lo que no se puede reducir más la memoria ni acelerar con cuantización entera sin calibración propia.
- Dependencia estricta de NVIDIA: requiere GPU Ampere o posterior y TensorRT 10.x desde 10.13; no funciona en CPU, AMD, Apple Silicon ni GPUs anteriores a Ampere.
- Riesgo de errores de segmentación en casos difíciles: oclusiones complejas, iluminación artificial intensa, fondos con colores similares al sujeto o cabello muy fino pueden producir bordes imperfectos o halos; conviene validar la calidad con muestras representativas antes de producción.
- Sin datos de sesgo publicados: la información disponible no incluye análisis de sesgo por demografía, tono de piel o tipo de cuerpo, un aspecto relevante en modelos de retrato.
- Licencia Apache-2.0: permite uso comercial, pero los ficheros son un derivado del modelo original y heredan su licencia, que se copia en el repositorio y rige su uso; conviene conservar los avisos de atribución.
- Verificación de integridad: los ficheros deben coincidir con los hashes sha256 publicados en la model card; cualquier discrepancia indica una descarga corrupta o manipulada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción comunitaria que respalde su robustez en producción más allá de los benchmarks del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/ormbg-TensorRT
- Modelo base ORMBG: https://huggingface.co/schirrmacher/ormbg
- Demo del modelo original: https://huggingface.co/spaces/schirrmacher/ormbg
- Dataset de entrenamiento (Human Segmentation Dataset): https://huggingface.co/datasets/schirrmacher/humans
- Repositorio DIS (Highly Accurate Dichotomous Image Segmentation): https://github.com/xuebinqin/DIS
- Repositorio LayerDiffuse: https://github.com/layerdiffusion/LayerDiffuse
- Paper DIS (arXiv:2112.09290): https://arxiv.org/abs/2112.09290
- Grupo de investigación en Discord: https://discord.gg/YYZ3D66t
