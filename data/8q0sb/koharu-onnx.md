# 8q0sb/koharu-onnx

## Resumen

Koharu ONNX es un repositorio de exportaciones ONNX de los modelos que utiliza [Koharu](https://github.com/perennialtech/koharu), una herramienta de procesamiento de manga. El repositorio, publicado por el usuario 8q0sb, no contiene pesos originales sino conversiones a formato ONNX Runtime de dos redes de visión por computador: un detector de texto y bocadillos de comic (RT-DETRv2) y una red de layout de pagina de manga (RF-DETR Seg 2XL). El objetivo es permitir la inferencia sin PyTorch, con ONNX Runtime como unico runtime.

Los modelos exportados cubren dos tareas complementarias del pipeline de Koharu: la deteccion de regiones de texto y bocadillos, y la segmentacion semantica del layout de la pagina (texto, onomatopeyas, bocadillos, paneles y fondo). Las exportaciones estan en FP32 y se verificaron contra los modelos PyTorch originales con onnxruntime 1.31.1, lo que las hace adecuadas para despliegues en CPU o en entornos donde no se quiera arrastrar la pila de PyTorch.

La relevancia de este repositorio es practica: facilita el despliegue de un pipeline de analisis de manga en entornos ligeros (aplicaciones de escritorio, servidores sin GPU o con GPU pero sin CUDA toolkit completo), a costa de perder las optimizaciones de cuantizacion y de no ofrecer un modelo de lenguaje ni capacidades generativas. No es un modelo fundacional, sino un conjunto de artefactos de inferencia especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (deteccion) y RF-DETR Seg 2XL (segmentacion de layout) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision) |
| Tipos de cuantizacion | FP32 unicamente (exportaciones sin cuantizar) |
| Idiomas soportados | no aplica (modelos de vision, sin procesamiento de lenguaje) |
| Licencia | other (cada subdirectorio hereda la licencia de sus pesos: Apache-2.0 en ambos casos segun la model card) |
| Formato de pesos | ONNX (grafos exportados con onnx 1.23.2 y onnxscript 0.7.2) |

Especificaciones por submodelo:

| Submodelo | Entrada | Salidas | Resolucion |
|---|---|---|---|
| comic-text-and-bubble-detector | `pixel_values` [1, 3, 640, 640], RGB en [0, 1] sin normalizacion | `logits` [1, 300, 3] (bubble, text_bubble, text_free), `pred_boxes` [1, 300, 4] (cx, cy, w, h normalizados) | 640x640 |
| koharu-layout-highres | `pixel_values` [1, 3, 1920, 1920], RGB en [0, 1], resize bilineal sin antialiasing, media/std de ImageNet | `pred_logits` [1, 300, 5] (text, onomatopoeia, bubble, panel, background), `pred_boxes` [1, 300, 4], `spatial_features` [1, 256, 160, 160], `query_features` [1, 300, 256] | 1920x1920 |
| koharu-layout-highres-mask-head | `spatial_features` y `query_features` [1, K, 256] | `mask_logits` [1, K, 480, 480] | 480x480 por consulta |

## Arquitectura y entrenamiento

El submodelo `comic-text-and-bubble-detector` es una exportacion de RT-DETRv2 para deteccion de objetos, concretamente la variante `RTDetrV2ForObjectDetection` de transformers 4.57.6. RT-DETRv2 es un detector end-to-end basado en transformer (DETR-like) con consultas aprendidas; la cabeza produce 300 consultas con logits de tres clases y cajas normalizadas. Los pesos proceden de `ogkalu/comic-text-and-bubble-detector` en el commit `16e8a622f91fabc6b5b65c96d32d1183f8843546`, bajo licencia Apache-2.0.

El submodelo `koharu-layout-highres` es una exportacion de RF-DETR Seg 2XL, la variante de segmentacion de RF-DETR de Roboflow (commit `4ab7c18729de9d02ffd0495795d0831b5630f01b`, Apache-2.0). RF-DETR combina un backbone DINOv2 con un decoder DETR y una cabeza de segmentacion basada en consultas; en esta exportacion la atencion usa el operador `com.microsoft.MultiHeadAttention` de ONNX Runtime. La cabeza de mascaras se separa en un segundo grafo (`koharu-layout-highres-mask-head.onnx`) que consume las caracteristicas espaciales y de consulta y produce mascaras de 480x480 por consulta. Los pesos proceden de `mayocream/koharu-layout-highres` en el commit `68077eb09401a46e548190ff2786bd405113ea8b` (Apache-2.0).

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes, ni sobre si se aplicaron tecnicas de ajuste fino adicionales. La model card solo documenta el proceso de exportacion (torch 2.15.0 en CPU, onnx 1.23.2, onnxscript 0.7.2) y la verificacion con onnxruntime 1.31.1.

## Capacidades

- Deteccion de texto y bocadillos de comic: el detector RT-DETRv2 localiza hasta 300 regiones por imagen, clasificandolas como bocadillo (`bubble`), texto dentro de bocadillo (`text_bubble`) o texto libre (`text_free`).
- Segmentacion de layout de pagina de manga: el modelo RF-DETR Seg 2XL clasifica y segmenta regiones en cinco clases (`text`, `onomatopoeia`, `bubble`, `panel`, `background`) con mascaras de 480x480 por consulta.
- Deteccion de paneles: la clase `panel` permite reconstruir la estructura de la pagina para su posterior recorte o lectura ordenada.
- Deteccion de onomatopeyas: clase especifica para texto no dialogado, relevante en manga.
- Inferencia sin PyTorch: los grafos se ejecutan con ONNX Runtime en CPU o GPU, sin dependencia de la pila de entrenamiento.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; es exclusivamente vision por computador.

## Casos de uso

- Digitalizacion de manga para traduccion asistida: el detector de texto y bocadillos permite localizar y recortar las regiones de dialogo, que luego se envian a un OCR y a un traductor externos; el layout de alta resolucion ayuda a mantener el orden de lectura correcto.
- Limpieza y retipografiado (typesetting) automatico: las mascaras de texto y bocadillo permiten eliminar el texto original y rellenar la region antes de insertar la traduccion, reduciendo el trabajo manual en flujos de scanlation.
- Indexacion y busqueda de paginas: el layout segmentado permite clasificar paginas por densidad de paneles o presencia de onomatopeyas, util para construir indices o sistemas de recomendacion sobre un catalogo de manga.
- Preprocesado para OCR especializado: al aislar regiones `text_bubble` y `text_free`, se puede dirigir cada tipo de texto a un motor de OCR distinto (por ejemplo, uno entrenado para texto vertical y otro para horizontal).
- Aplicaciones de escritorio sin GPU: al estar en ONNX FP32, el pipeline puede ejecutarse en CPU con onnxruntime en herramientas locales de lectura de manga, sin requerir CUDA ni PyTorch.
- Control de calidad de escaneos: la deteccion de paneles y fondo permite detectar paginas mal recortadas, rotadas o con márgenes incorrectos en un proceso de digitalizacion masiva.
- Investigacion en vision para comics: los grafos exportados sirven como base reproducible para experimentos de deteccion y segmentacion en dominios de manga, con pesos fijados a commits concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que las exportaciones se verificaron contra los modelos PyTorch originales con onnxruntime 1.31.1, sin aportar metricas de precision (mAP, IoU) ni de latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 0,3 GB, lo que sugiere que los pesos FP32 de ambos modelos caben holgadamente en GPUs de consumo, pero no se documenta el desglose por submodelo.
- GPU recomendadas: no disponibles. Por el tamano del repo y las resoluciones de entrada (640x640 y 1920x1920), una GPU con 8 GB o mas deberia ser suficiente para inferencia en FP32, aunque no hay confirmacion en la informacion proporcionada.
- GPU de consumo: probablemente cabe en RTX 3060, RTX 4060 o superiores; no confirmado por el autor.
- Despliegue: ONNX Runtime (version verificada 1.31.1). Compatible con CPU y con los execution providers de ONNX Runtime (CUDA, TensorRT, DirectML, CoreML), aunque solo se documenta la verificacion en el runtime base.
- Latencia y throughput: no disponibles. La entrada de 1920x1920 del modelo de layout y la atencion con `com.microsoft.MultiHeadAttention` sugieren un coste computacional notable en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto/Resolucion | Licencia | Formato |
|---|---|---|---|---|---|
| Koharu ONNX (este repo) | Deteccion de texto/bocadillos y layout de manga | no disponible | 640x640 y 1920x1920 | other (pesos Apache-2.0) | ONNX FP32 |
| ogkalu/comic-text-and-bubble-detector | Deteccion de texto y bocadillos | no disponible | no disponible | Apache-2.0 | safetensors (PyTorch) |
| mayocream/koharu-layout-highres | Layout de manga | no disponible | no disponible | Apache-2.0 | safetensors (PyTorch) |
| roboflow/rf-detr | Deteccion/segmentacion generica | no disponible | no disponible | Apache-2.0 | PyTorch |

La comparativa relevante es frente a los pesos originales en PyTorch: este repositorio no aporta un modelo nuevo, sino una conversion de formato. La ventaja frente a los originales es la ausencia de dependencia de PyTorch y la portabilidad a ONNX Runtime; la desventaja es que solo ofrece FP32, sin variantes cuantizadas a INT8 o FP16 que reduzcan el coste en CPU.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes; cualquier expectativa en ese sentido es incorrecta.
- Solo FP32: no se ofrecen exportaciones cuantizadas, lo que limita la eficiencia en CPU y en GPUs con poca memoria.
- Licencia `other` en el repositorio: aunque los pesos de origen son Apache-2.0 segun la model card, el campo de licencia del repo es `other`, por lo que conviene revisar los ficheros `LICENSE` y `NOTICE` de cada subdirectorio antes de un uso comercial.
- Sin datos de rendimiento: no hay benchmarks publicados, por lo que la calidad de la deteccion y segmentacion en dominios distintos al manga no esta cuantificada.
- Riesgo de sesgo de dominio: los modelos estan entrenados para manga; su comportamiento en comics occidentales, webtoons o ilustraciones genericas no esta documentado.
- Dependencia de versiones concretas: las exportaciones se generaron con torch 2.15.0, onnx 1.23.2 y onnxscript 0.7.2, y se verificaron con onnxruntime 1.31.1; versiones muy distintas del runtime podrian no reproducir exactamente los resultados.
- Sin mantenimiento documentado: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se indica una politica de actualizacion.
- El operador `com.microsoft.MultiHeadAttention` es especifico de ONNX Runtime y puede no ser portable a otros runtimes ONNX.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/8q0sb/koharu-onnx
- Proyecto Koharu: https://github.com/perennialtech/koharu
- Pesos del detector: https://huggingface.co/ogkalu/comic-text-and-bubble-detector
- Pesos del layout: https://huggingface.co/mayocream/koharu-layout-highres
- Repositorio RF-DETR: https://github.com/roboflow/rf-detr
