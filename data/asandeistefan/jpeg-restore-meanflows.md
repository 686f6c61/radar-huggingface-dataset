# asandeistefan/jpeg-restore-meanflows

## Resumen

MeanFlow JPEG Restoration es un modelo de restauración de imágenes centrado en eliminar los artefactos de compresión JPEG. Lo publica el usuario `asandeistefan` (Stefan-Alexandru Asandei, cofirmado con Mihai-Alexandru Radu) y acompaña al artículo «Efficient JPEG Restoration in the Wavelet Domain via Mean Flows» (arXiv:2608.28730). Se trata de un DiT lineal (Linear DiT) de aproximadamente 65 millones de parámetros, entrenado con la técnica de mean flows, que reconstruye la imagen limpia a partir de la versión degradada en uno o dos pasos de muestreo, lo que lo sitúa muy lejos del coste computacional típico de los modelos de difusión de decenas de pasos.

El problema que aborda es acotado pero muy extendido: millones de imágenes archivadas, miniaturas web, capturas y fotogramas comprimidos con JPEG arrastran artefactos de bloque, ringing y pérdida de detalle de alta frecuencia que degradan tanto la percepción humana como el rendimiento de sistemas posteriores (OCR, detección de objetos, clasificación). El modelo trabaja en el dominio wavelet según el título del artículo, y su punto fuerte declarado es la eficiencia: hasta 20 imágenes por segundo en una única RTX 3090, con menos de 1 GB de VRAM y posibilidad de ejecutarse en CPU.

Es relevante ahora porque demuestra que la restauración generativa de alta calidad puede desplegarse con un coste de hardware de gama de consumo, integrándose como paso de preprocesado en pipelines existentes sin necesidad de clústeres. El repositorio ocupa 0,3 GB, se distribuye con licencia MIT y el código de inferencia es Python puro sobre PyTorch, sin dependencias de frameworks de difusión externos. No se han publicado en la información disponible datos sobre el dataset de entrenamiento, el número de tokens de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Linear DiT (transformer de difusión lineal) entrenado con mean flows, operando en el dominio wavelet |
| Parámetros totales | ~65 M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; acepta tensores `(B, 3, H, W)` de resolución arbitraria, con padding interno a múltiplos de 4 |
| Tipos de cuantización | no disponible (se distribuye un checkpoint `.pth`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión por computador, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint PyTorch); código de inferencia en Python con `torch` |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un «65M Linear DiT, trained with mean flows». Es decir, un transformer de difusión de aproximadamente 65 millones de parámetros, presumiblemente con mecanismos de atención lineal para reducir el coste cuadrático respecto a la resolución de la imagen, y entrenado con el formalismo de mean flows. Este enfoque, enmarcado en la familia de los modelos de flow matching, aprende un campo de velocidad promedio sobre intervalos temporales en lugar de la velocidad instantánea, lo que permite generar en muy pocos pasos: la model card declara restauración en uno o dos pasos (`sample_steps=2` en los ejemplos). El artículo indica además que la restauración se realiza en el dominio wavelet, lo que encaja con el objetivo de modelar de forma más eficiente las componentes de frecuencia que destruye la compresión JPEG.

No se especifican en la información proporcionada el número de tokens o imágenes de entrenamiento, la composición del dataset, si hubo fases de ajuste con RLHF/DPO (no aplicable a este tipo de modelo) ni detalles concretos del bloque de atención, del esquema de wavelet empleado o del procedimiento de entrenamiento. El nombre del checkpoint distribuido, `meanflow_jpeg_qf5_20.pth`, sugiere un entrenamiento orientado a factores de calidad JPEG bajos (qf5) y una configuración de 20 pasos o de 20 imágenes por segundo, pero esto no se confirma explícitamente en la documentación. Tampoco se documentan innovaciones adicionales como decodificación especulativa, que en cualquier caso no aplica a un modelo de imagen.

## Capacidades

- Restauración de imágenes degradadas por compresión JPEG: recibe un tensor RGB `(B, 3, H, W)` con valores en `[0, 1]` y devuelve otro tensor de la misma forma con la imagen restaurada.
- Muestreo en uno o dos pasos, lo que reduce drásticamente la latencia frente a modelos de difusión de decenas o cientos de pasos.
- Procesamiento por lotes (`B` arbitrario) y a resolución arbitraria, con padding interno a múltiplos de 4.
- Ejecución en GPU con al menos 1 GB de VRAM y también en CPU, según la model card.
- Inferencia autocontenida: la definición del modelo y los ayudantes `load_jpeg_model()` y `restore()` están en `jpeg_model.py`, con dependencias limitadas a `torch`, `torchvision` y `huggingface_hub`.
- Interfaz de línea de comandos mediante `sample.py`, que carga el checkpoint y restaura una imagen con un número de pasos configurable.
- Capacidades que **no** se documentan: tool calling, function calling, uso como agente, razonamiento multi-paso, generación de texto o código, matemáticas, visión general (VQA, captioning), audio y capacidades multilingües. Es un modelo especializado de imagen a imagen, no un modelo multimodal ni de lenguaje.

## Casos de uso

- Recuperación de archivos fotográficos antiguos: digitalizaciones y fotos históricas guardadas con factores de calidad JPEG muy bajos pueden reprocesarse por lotes; a 20 img/s en una RTX 3090, una colección de 100.000 imágenes se procesaría en aproximadamente 1,4 horas por GPU.
- Preprocesado para pipelines de OCR: los artefactos de bloque y ringing degradan la segmentación de caracteres en documentos escaneados y comprimidos; aplicar `restore()` antes del motor de OCR puede mejorar la tasa de reconocimiento sin cambiar el resto del pipeline.
- Limpieza de miniaturas y assets web: plataformas de contenido que almacenan derivados comprimidos pueden regenerar versiones de mayor calidad antes de recomprimir o servir en un CDN, usando la API por lotes del modelo.
- Preprocesado en sistemas de visión por computador: detección de objetos, segmentación o clasificación sobre imágenes comprimidas pueden beneficiarse de una etapa de restauración previa, ya que el modelo devuelve exactamente la misma forma y rango de valores que la entrada.
- Procesamiento de secuencias MJPEG o vídeo con compresión intra-fotograma: el modelo puede aplicarse fotograma a fotograma; conviene tener en cuenta que 20 img/s en una RTX 3090 queda por debajo de los 24-30 fps habituales, por lo que se necesita procesamiento en diferido, por lotes o hardware superior para tiempo real.
- Despliegue en aplicaciones de escritorio o móviles con GPU integrada: el requisito de 1 GB de VRAM y la posibilidad de ejecución en CPU permiten integrar la restauración en herramientas de edición fotográfica sin depender de servidores.
- Enriquecimiento de datasets de entrenamiento: limpiar corpus de imágenes comprimidas antes de entrenar otros modelos de visión, reduciendo el sesgo introducido por los artefactos de compresión.
- Archivística y teledetección: reprocesado de mosaicos satelitales o aéreos almacenados en JPEG para su análisis posterior, siempre que la licencia MIT y la naturaleza del dato lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara una cifra operativa: hasta 20 imágenes por segundo en una única RTX 3090 con uno o dos pasos de muestreo. No se proporcionan métricas de calidad como PSNR, SSIM, LPIPS ni comparaciones cuantitativas con otros métodos de restauración JPEG, ni se especifica la resolución a la que se midió ese throughput.

| Métrica | Valor |
|---|---|
| PSNR | no disponible |
| SSIM | no disponible |
| LPIPS | no disponible |
| Throughput declarado | hasta 20 img/s en una RTX 3090 |
| Pasos de muestreo | 1 o 2 |

## Requisitos de hardware

- VRAM: al menos 1 GB según la model card, con CPU como opción válida.
- Peso del checkpoint: el repositorio completo ocupa 0,3 GB; los 65 M de parámetros en fp32 equivalen a unos 260 MB de pesos.
- GPU recomendadas: el autor reporta el rendimiento en una RTX 3090; cualquier GPU moderna de gama media o alta (RTX 3060 en adelante, A100, H100) es más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada con más de 1 GB de VRAM, incluidas generaciones antiguas; también en gráficas integradas y en CPU, con menor throughput.
- Opciones de despliegue: la model card solo documenta inferencia directa con PyTorch (`jpeg_model.py`, `sample.py`). No se mencionan integraciones con vLLM, TGI, ONNX Runtime, TensorRT, llama.cpp ni Ollama (estos dos últimos no aplican a un modelo de imagen).
- Latencia y throughput: hasta 20 img/s en una RTX 3090, lo que equivale a unos 50 ms por imagen en el mejor caso, aunque no se especifica la resolución de referencia. No hay datos de latencia para CPU ni para otras GPU.

## Comparativa con modelos similares

La información proporcionada no incluye comparaciones con otros modelos, por lo que los datos cuantitativos de las alternativas figuran como no disponibles. A continuación se contrasta la propuesta de este modelo frente a familias habitualmente empleadas para restauración y eliminación de artefactos JPEG.

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| MeanFlow JPEG Restoration (este modelo) | ~65 M | Linear DiT con mean flows en dominio wavelet, 1-2 pasos | MIT | HuggingFace (0 descargas, 0 likes) |
| SwinIR | no disponible en la información | Transformer basado en ventanas para restauración | no disponible | no disponible |
| Restormer | no disponible en la información | Transformer con atención por canales para restauración | no disponible | no disponible |
| NAFNet | no disponible en la información | Red convolucional sin función de activación | no disponible | no disponible |
| DnCNN | no disponible en la información | CNN de eliminación de ruido | no disponible | no disponible |

El rasgo diferencial documentado de este modelo es el número de pasos de muestreo (uno o dos) combinado con un tamaño reducido (65 M de parámetros), frente a enfoques de difusión que requieren decenas de pasos. No se dispone de datos que permitan afirmar que supere o iguale en calidad a las alternativas anteriores.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados en la información disponible, por lo que la calidad de restauración no puede verificarse de forma objetiva con los datos suministrados.
- El modelo está especializado exclusivamente en restauración de artefactos JPEG; no realiza superresolución, eliminación de ruido genérico, corrección de color ni otras tareas de mejora.
- No se documenta el dataset de entrenamiento, lo que impide evaluar sesgos de dominio (por ejemplo, un comportamiento deficiente en imágenes médicas, satelitales o con contenido cultural concreto).
- Riesgo de alucinación visual inherente a los modelos generativos: la restauración puede inventar texturas o detalles plausibles pero no presentes en la imagen original, algo crítico en contextos forenses, médicos o documentales.
- No se especifican los factores de calidad JPEG cubiertos ni el rango de compresión para el que el modelo fue entrenado; el nombre del checkpoint (`qf5`) sugiere un foco en compresión agresiva, pero no se confirma.
- No se documentan límites de resolución: la model card afirma que cualquier resolución funciona, con padding a múltiplos de 4, pero no se indica el coste de memoria en resoluciones muy altas.
- Licencia MIT: permite uso comercial y modificación con atribución y conservación del aviso de copyright; aun así, conviene revisar si el artículo o el repositorio de GitHub añaden condiciones adicionales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni evidencia de uso en producción.
- El identificador de arXiv (2608.28730) y las fechas de creación del repositorio (septiembre de 2026) corresponden a un trabajo muy reciente; la revisión por pares no está confirmada en la información disponible.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (únicamente páginas ajenas al proyecto), por lo que no se han podido contrastar datos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asandeistefan/jpeg-restore-meanflows
- Repositorio del proyecto en GitHub: https://github.com/stefanasandei/jpeg-restore
- Artículo en arXiv: https://arxiv.org/abs/2608.28730
- Licencia MIT del proyecto: https://github.com/stefanasandei/jpeg-restore/blob/main/LICENSE
