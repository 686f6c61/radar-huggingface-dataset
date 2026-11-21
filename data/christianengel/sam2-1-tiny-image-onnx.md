# christianengel/SAM2.1-Tiny-Image-ONNX

## Resumen

SAM 2.1 Tiny Image ONNX es una exportación a formato ONNX del modelo de segmentación de imágenes SAM 2.1 en su variante Hiera Tiny, desarrollada originalmente por Meta (Facebook) y publicada aquí por el usuario christianengel. El paquete incluye únicamente el modo imagen (encoder más decoder de prompts), sin la componente de vídeo del modelo original. El objetivo es ofrecer una versión ligera y portable del segmentador para despliegue en entornos con ONNX Runtime o TensorRT, incluyendo dispositivos embebidos como Jetson.

El modelo resuelve el problema de la segmentación de imágenes guiada por prompts: a partir de puntos o cajas delimitadoras, predice máscaras de segmentación sobre el objeto indicado. Al estar exportado a ONNX con variantes FP32 y FP16, facilita su integración en pipelines de producción que no dependen de PyTorch, además de permitir optimización con TensorRT.

La relevancia actual radica en la combinación de un modelo de segmentación de referencia (SAM 2.1) con un formato de despliegue estándar y ligero (0,2 GB de repositorio), lo que reduce la barrera de integración en aplicaciones de visión por computador. La licencia Apache 2.0 del modelo base se mantiene en esta exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 (Hiera Tiny) exportado a ONNX; encoder + prompt decoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 1024×1024) |
| Tipos de cuantizacion | FP32 y FP16 (archivos ONNX separados) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_fp32.onnx`, `encoder_fp16.onnx`, `decoder_fp32.onnx`, `decoder_fp16.onnx`) |

## Arquitectura y entrenamiento

El modelo subyacente es SAM 2.1 con backbone Hiera Tiny, la variante más pequeña de la familia SAM 2. La arquitectura combina un encoder de imagen que procesa la entrada a resolución 1024×1024 y genera embeddings, junto con un decoder de prompts que recibe dichos embeddings, características de alta resolución y las coordenadas de puntos o cajas para producir máscaras. Esta exportación concreta cubre solo el modo imagen; no incluye el módulo de memoria temporal necesario para segmentación de vídeo.

No se dispone en la información proporcionada de detalles sobre el número de parámetros, el volumen de datos de entrenamiento ni el proceso de alineación del modelo original. La model card únicamente documenta la exportación: entradas del encoder (`image` float32 1×3×1024×1024 con normalización ImageNet), entradas del decoder (`image_embed`, `high_res_feat_0`, `high_res_feat_1`, `point_coords`, `point_labels`) y salidas (`masks` como logits con umbral 0 y `scores` de forma [1, 3]). Los puntos se normalizan a la resolución 1024 mediante `x = x_px / width * 1024`. Las etiquetas de prompt son 0 para fondo, 1 para primer plano y 2/3 para esquinas de caja.

## Capacidades

- Segmentación de imágenes guiada por puntos: el usuario indica coordenadas y etiquetas (fondo/primer plano) y el modelo devuelve máscaras.
- Segmentación guiada por caja delimitadora: soporta etiquetas 2 y 3 para las esquinas de la caja.
- Predicción de múltiples máscaras candidatas con puntuaciones asociadas (salida `scores` de forma [1, 3]).
- Ejecución en CPU mediante ONNX Runtime y aceleración con TensorRT (requiere `--stronglyTyped`, probado con TensorRT 10.7.0.23).
- Modo imagen únicamente: no soporta segmentación de vídeo ni propagación temporal de máscaras.
- No incluye capacidades de texto, tool calling, agentes ni multilingüismo, al ser un modelo puramente de visión.

## Casos de uso

- Segmentación interactiva en herramientas de edición de imagen: el usuario hace clic en un objeto y el decoder genera la máscara correspondiente, gracias a la separación encoder/decoder que permite reutilizar el embedding de imagen entre múltiples prompts.
- Preprocesado en pipelines de visión por computador: generar máscaras de objetos para tareas posteriores de clasificación, conteo o medición, aprovechando la portabilidad del formato ONNX.
- Despliegue en dispositivos embebidos: la variante FP16 y la compatibilidad con TensorRT permiten ejecutar el encoder en hardware como Jetson (aunque la model card indica que Jetson Orin no estaba disponible para pruebas).
- Automatización de anotación de datasets: generar máscaras preliminares a partir de cajas o puntos para acelerar el etiquetado manual en proyectos de visión.
- Aplicaciones de realidad aumentada o sustitución de fondo: segmentar personas u objetos en tiempo real usando el encoder FP16 con latencias de decenas de milisegundos en GPU.
- Integración en servicios backend sin PyTorch: al ser ONNX puro, se puede servir con ONNX Runtime en entornos donde instalar PyTorch no es viable, manteniendo la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

La model card reporta métricas de validación propia, no benchmarks estándar de COCO:

| Metrica | Valor |
|---|---|
| Mean point IoU (16 imágenes) | 0.9994 |
| Box IoU (16 imágenes) | 0.9959 |
| Latencia encoder FP16 (TensorRT, Quadro RTX 6000) | mediana 15.850 ms, p99 16.314 ms |

El conjunto de evaluación son 16 imágenes: los doce IDs de COCO más `truck.jpg`, `dog.jpg`, `groceries.jpg` y `cars.jpg`. La propia model card advierte que no es un COCO AP ni la tabla del paper de SAM 2. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) por tratarse de un modelo de segmentación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,2 GB, por lo que la inferencia FP16 cabe holgadamente en GPUs consumer.
- GPU recomendadas: Quadro RTX 6000 (probada por el autor con TensorRT); cualquier GPU con soporte TensorRT o CUDA para ONNX Runtime.
- Cabe en GPU consumer: sí, por el tamaño reducido del modelo (variante Tiny en FP16).
- Opciones de despliegue: ONNX Runtime (CPU o GPU), TensorRT (con `--stronglyTyped`), y el script incluido `jetson/build_tensorrt.sh` para compilación en Jetson.
- Latencia: encoder FP16 con TensorRT en Quadro RTX 6000, mediana 15.850 ms y p99 16.314 ms. No se reportan cifras de throughput ni latencia del decoder.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SAM2.1-Tiny-Image-ONNX (este) | no disponible | imagen 1024×1024 | ONNX FP32/FP16 | Apache 2.0 | Solo modo imagen, exportación comunitaria |
| facebook/sam2.1-hiera-tiny | no disponible | imagen/vídeo | PyTorch | Apache 2.0 | Modelo base original, incluye modo vídeo |
| SAM 2.1 variantes mayores (small, base, large) | no disponible | imagen/vídeo | PyTorch | Apache 2.0 | Mayor precisión a costa de más cómputo |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo modo imagen: no incluye segmentación de vídeo ni propagación temporal, a diferencia del modelo base SAM 2.1.
- Las métricas reportadas (IoU 0.9994 en puntos) se calculan sobre solo 16 imágenes y no equivalen a un benchmark estándar; no deben interpretarse como precisión general del modelo.
- No se documentan sesgos específicos de la exportación; al heredar el modelo base, puede presentar los sesgos del dataset de entrenamiento original (no detallado aquí).
- Riesgo de máscaras incorrectas en objetos ambiguos, oclusiones o prompts mal posicionados; el umbral de las máscaras es 0 sobre logits y puede requerir ajuste.
- La exportación es de un autor comunitario (christianengel), no oficial de Meta; no hay garantías de mantenimiento ni de paridad exacta con el modelo original.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base facebook/sam2.1-hiera-tiny.
- No se proporcionan datos sobre rendimiento en Jetson Orin (el autor indica que no estaba disponible).

## Enlaces

- Hugging Face: https://huggingface.co/christianengel/SAM2.1-Tiny-Image-ONNX
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-tiny
- Paper SAM 2: https://arxiv.org/abs/2408.00714
