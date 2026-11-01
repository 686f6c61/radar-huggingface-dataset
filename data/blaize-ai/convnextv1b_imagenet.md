# Blaize-AI/ConvNeXtV1b_ImageNet

## Resumen

ConvNeXtV1b_ImageNet es un modelo de clasificación de imágenes basado en la arquitectura ConvNeXt, originalmente desarrollada por Meta Platforms (Facebook Research) y presentada en el artículo "A ConvNet for the 2020s". Esta versión concreta ha sido optimizada por Blaize-AI para su despliegue sobre aceleradores de inferencia Xplorer, que emplean su Graph Streaming Processor (GSP) y se programan mediante el Blaize Picasso SDK. No se trata, por tanto, de un modelo de lenguaje, sino de un clasificador de imágenes de tipo vision-only.

El modelo se distribuye como un artefacto compilado en formato `.bm` (Blaize Model), con pesos en BF16 y una resolución de entrada fija de 224×224 píxeles. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con una variante compacta de ConvNeXt (la nomenclatura "V1b" sugiere una variante pequeña o tiny de la familia original, aunque el número exacto de parámetros no se especifica en la información disponible).

Su relevancia radica en que ejemplifica el patrón de modelos precompilados para hardware de borde (edge AI): el modelo no se ejecuta con PyTorch, ONNX Runtime o TensorFlow, sino exclusivamente a través del Picasso SDK sobre un acelerador Blaize Xplorer. Esto lo hace útil para escenarios de inferencia en el borde con requisitos de latencia y consumo muy ajustados, pero lo inutiliza para despliegues convencionales en GPU o CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (red convolucional pura, sin atención) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224 píxeles) |
| Tipos de cuantizacion | BF16 (variante publicada); INT8 y AMP descritos en la model card |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | `.bm` (Blaize Model), compilado para GSP |
| Tarea | Clasificación de imágenes (ImageNet, 1000 clases) |
| Resolucion de entrada | 224×224 (W×H) |
| Framework original | PyTorch |
| Tamano del repositorio | ~0,1 GB |
| Hardware requerido | Acelerador Blaize Xplorer + Picasso SDK |

## Arquitectura y entrenamiento

ConvNeXt es una red neuronal convolucional pura que moderniza el diseño de ResNet incorporando decisiones arquitectónicas tomadas de los transformers visuales (ViT): kernels de convolución de 7×7 en el stem, uso de LayerNorm en lugar de BatchNorm, activación GELU, menos capas de normalización, y un diseño de bloques invertidos con convoluciones depthwise. El resultado es una CNN competitiva con ViT en ImageNet sin necesidad de mecanismos de atención. La model card no detalla la variante exacta (T, S, B o L) ni el número de parámetros.

El entrenamiento se realizó sobre ImageNet 2012 (más de un millón de imágenes etiquetadas en 1000 clases), según declara el autor original. Blaize no ha reentrenado el modelo: ha realizado únicamente optimizaciones específicas de hardware para que sea compatible con el GSP, incluyendo la compilación a formato `.bm` y la cuantización a BF16. No se especifica si hubo destilación, aumento de datos adicional o ajuste fino posterior. La model card menciona que la metodología de cuantización incluye INT8 con escalado de punto fijo y AMP (mezcla INT8/BF16), aunque solo se publica la variante BF16.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet (etiquetas estándar de la competición ILSVRC).
- Inferencia en hardware de borde mediante el acelerador Blaize Xplorer y el Picasso SDK.
- Ejecución con precisión BF16; la documentación describe también modos INT8 y AMP para mayor velocidad o equilibrio precisión/rendimiento.
- Inspección del artefacto mediante la utilidad `blaize-modeltool` (comando `info`).
- No soporta tool calling, generación de texto, razonamiento multi-paso ni capacidades de agente.
- No soporta visión general más allá de la clasificación: no hay detección, segmentación, OCR ni captioning.
- No soporta múltiples idiomas ni entrada de texto.

## Casos de uso

- Inspección visual en líneas de fabricación: clasificación de piezas o productos en cámara en tiempo real sobre un acelerador Xplorer embebido, aprovechando la baja latencia del GSP y el bajo consumo frente a una GPU.
- Clasificación de imágenes en cámaras inteligentes (smart cameras): filtrado previo de eventos (por ejemplo, distinguir categorías de objetos o escenas) antes de enviar solo los fotogramas relevantes a la nube.
- Sistemas de vigilancia con inferencia local: categorización de imágenes capturadas por cámaras IP en el propio dispositivo, reduciendo el ancho de banda y los costes de subida a la nube.
- Robótica de bajo consumo: reconocimiento de objetos o estados visuales en un robot autónomo que opera con presupuesto energético limitado y no puede permitirse una GPU.
- Preprocesado en pipelines de datos: etiquetado automático de grandes lotes de imágenes en un nodo con acelerador Blaize para tareas de curación de datasets.
- Pruebas de integración de hardware: validación de la cadena Picasso SDK y del acelerador Xplorer en un entorno de desarrollo, usando este modelo como referencia de clasificación estándar.
- Clasificación en el borde para agricultura de precisión o monitorización ambiental: identificación de categorías visuales (plagas, estados de cultivo, tipos de terreno) en dispositivos remotos alimentados por batería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión top-1/top-5 en ImageNet, latencia, throughput ni consumo energético para esta variante concreta. Tampoco se especifica la variante exacta de ConvNeXt, lo que impide siquiera referenciar los números publicados en el artículo original.

## Requisitos de hardware

- Requiere un acelerador Blaize Xplorer; el modelo no está pensado para ejecutarse en GPU, CPU ni TPU convencionales.
- El artefacto `.bm` es específico de la cadena Picasso SDK y del GSP, por lo que no es portable a otros runtimes (vLLM, llama.cpp, Ollama, TGI, ONNX Runtime, TensorRT).
- VRAM estimada: no aplica; el modelo se ejecuta en la memoria del acelerador Xplorer, cuyo tamaño no se detalla en la información disponible.
- GPU recomendadas: ninguna; no es compatible con CUDA.
- No cabe en GPU de consumo porque no se ejecuta en GPU.
- Despliegue: exclusivamente mediante Blaize Picasso SDK y la utilidad `blaize-modeltool`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada | Licencia | Despliegue |
|---|---|---|---|---|---|
| ConvNeXtV1b_ImageNet (Blaize) | ConvNeXt | no disponible | 224×224 | MIT | Solo Blaize Xplorer / Picasso SDK |
| ConvNeXt original (Meta) | ConvNeXt | T/S/B/L según variante | 224×224 (y otras) | MIT | PyTorch, ONNX, TensorRT, etc. |
| ResNet-50 (referencia clásica) | ResNet | ~25,6 M | 224×224 | BSD / Apache según implementación | Amplio soporte |
| ViT-B/16 (referencia transformer) | Vision Transformer | ~86 M | 224×224 | Apache 2.0 (según implementación) | Amplio soporte |

La diferencia clave frente a las alternativas es que este artefacto está atado a un hardware propietario: no es un modelo reutilizable en un stack estándar. Para cualquier uso fuera de un acelerador Blaize, conviene acudir directamente al repositorio original de ConvNeXt de Meta.

## Limitaciones y advertencias

- Modelo de clasificación de imágenes únicamente; no genera texto, no razona y no soporta instrucciones.
- Dependencia total de hardware propietario: sin un acelerador Blaize Xplorer y el Picasso SDK, el artefacto `.bm` no es utilizable.
- Solo se publica la variante BF16 con resolución 224×224; las variantes INT8 y AMP se describen pero no se incluyen en el repositorio.
- No se especifica la variante exacta de ConvNeXt ni el número de parámetros, lo que dificulta estimar precisión y coste computacional.
- Sesgos heredados de ImageNet: el dataset contiene sesgos geográficos, culturales y de representación de clases; el modelo puede comportarse peor en dominios visuales alejados de ImageNet.
- Riesgo de clasificación errónea en imágenes fuera de distribución o con clases no representadas en las 1000 etiquetas.
- Licencia MIT para el modelo, pero el dataset ImageNet tiene su propia licencia (`LicenseRef-ImageNet`) con restricciones de uso comercial que el usuario debe revisar.
- Blaize declara explícitamente que no revisa, aprueba ni garantiza el modelo original, y no ofrece garantías de no infracción de propiedad intelectual.
- No hay métricas publicadas de precisión ni latencia; no se puede evaluar el impacto de la cuantización BF16 frente al modelo original.
- Fecha de creación del repositorio en 2026 y cero descargas/likes: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blaize-AI/ConvNeXtV1b_ImageNet
- Repositorio original de ConvNeXt (Meta): https://github.com/facebookresearch/ConvNeXt
- Pesos preentrenados originales: https://github.com/facebookresearch/ConvNeXt
- Dataset ImageNet: https://www.image-net.org/
- Blaize (fabricante del hardware): https://www.blaize.com
- Artículo de referencia de ConvNeXt: no disponible en la información proporcionada
- Documentación del Picasso SDK: no disponible en la información proporcionada
