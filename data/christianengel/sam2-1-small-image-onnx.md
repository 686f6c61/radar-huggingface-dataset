# christianengel/SAM2.1-Small-Image-ONNX

## Resumen

SAM2.1-Small-Image-ONNX es una exportación a ONNX del modelo Segment Anything Model 2.1 (SAM 2.1) en su variante Small, desarrollada originalmente por Meta AI (Facebook) y convertida a formato ONNX por el usuario christianengel. El modelo original es un segmentador de imágenes y vídeo basado en la arquitectura Hiera, y esta exportación concreta se limita al modo imagen (encoder más decoder de prompts), sin soporte de vídeo. El repositorio incluye los grafos del encoder y del decoder en precisión FP32 y FP16, pensados para su despliegue con ONNX Runtime o TensorRT.

La relevancia de esta ficha radica en que permite ejecutar un segmentador de propósito general de Meta en entornos donde no se dispone de PyTorch o donde se busca optimización mediante TensorRT, por ejemplo en dispositivos embebidos como Jetson. No obstante, la información publicada por el autor es extremadamente escasa: no hay datos de rendimiento en hardware real, no se documentan tiempos de inferencia en la Jetson Orin (el autor indica que no disponía de ella) y las métricas de calidad se limitan a una única imagen de prueba (`truck.jpg`, 1200×1800).

El modelo base es `facebook/sam2.1-hiera-small`, de aproximadamente 46 millones de parámetros en el encoder (dato no confirmado en la información proporcionada), con licencia Apache 2.0. Esta exportación hereda esa licencia, lo que facilita su uso comercial, aunque conviene verificar las condiciones del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 con encoder Hiera (transformer jerárquico) y decoder de prompts |
| Parametros totales | no disponible (el modelo base es sam2.1-hiera-small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes; entrada 1×3×1024×1024) |
| Tipos de cuantizacion | FP32 y FP16 (grafos ONNX separados para encoder y decoder) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`encoder_fp32.onnx`, `encoder_fp16.onnx`, `decoder_fp32.onnx`, `decoder_fp16.onnx`) |

## Arquitectura y entrenamiento

El modelo base SAM 2.1 emplea un encoder de imágenes Hiera (un transformer jerárquico con atención por ventanas) que produce representaciones multiescala de la imagen de entrada, y un decoder ligero que recibe prompts (puntos o cajas) y genera máscaras de segmentación junto con puntuaciones de confianza. Esta exportación a ONNX mantiene esa estructura en dos grafos separados: el encoder procesa la imagen redimensionada a 1024×1024 con normalización ImageNet (media y desviación estándar sobre valores 0–1), y el decoder recibe coordenadas de prompt normalizadas (`x = x_px / width * 1024`) con etiquetas 0, 1, 2 y 3, devolviendo logits de máscara (umbral 0) y puntuaciones de forma `[1, 3]`.

No se dispone de información sobre el proceso de entrenamiento del modelo original en la documentación proporcionada (número de tokens, composición del dataset, uso de RLHF o DPO). El autor cita el artículo arXiv 2408.00714 (Ravi et al.) como referencia del modelo SAM 2, pero no detalla innovaciones técnicas adicionales más allá de la exportación a ONNX y la posibilidad de compilar con TensorRT mediante el script `jetson/build_tensorrt.sh`. La única innovación documentada es la separación encoder/decoder y la disponibilidad de variantes FP16 con listas de exclusión de precisión ("keep-list") vacías para el encoder Small, lo que indica que la conversión a FP16 no requirió mantener capas en FP32.

## Capacidades

- Segmentación de imágenes a partir de prompts de punto o caja (point or box prompting).
- Generación de máscaras de segmentación de propósito general (segment anything), sin necesidad de reentrenamiento por categoría.
- Salida de logits de máscara y puntuaciones de confianza por prompt (tres puntuaciones en el eje `[1, 3]`).
- Ejecución en CPU mediante ONNX Runtime (`CPUExecutionProvider`) y compilación a TensorRT para GPU.
- Soporte de precisión FP32 y FP16 en encoder y decoder.
- No soporta vídeo: el autor indica explícitamente "No video".
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de capacidades multilingües ni de generación de texto.

## Casos de uso

- Segmentación interactiva en herramientas de anotación: el modelo acepta puntos o cajas como prompt y devuelve máscaras, lo que permite a un anotador humano generar máscaras de objetos con un clic y corregirlas iterativamente. Es adecuado por su naturaleza promptable y su bajo coste computacional en variante Small.
- Preprocesado en pipelines de visión por computador: usar las máscaras generadas como entrada para tareas posteriores (detección, clasificación, recorte de objetos) en flujos que ya operan con ONNX Runtime o TensorRT.
- Despliegue en dispositivos embebidos: la disponibilidad de grafos ONNX FP16 y un script de compilación TensorRT para Jetson sugiere su uso en entornos con recursos limitados, aunque el autor no aporta tiempos de inferencia medidos.
- Segmentación en aplicaciones de edición de imagen: recorte automático de sujetos o fondos a partir de una caja delimitadora, integrándose en herramientas de retoque o generación de contenido.
- Automatización de control de calidad industrial: segmentar piezas o defectos en imágenes fijas de cámara, con prompts de caja definidos por la posición esperada del objeto.
- Investigación en segmentación: servir como línea base reproducible en formato ONNX para comparar con otras exportaciones o variantes del mismo modelo sin depender de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente reporta métricas sobre una imagen concreta (`truck.jpg`, 1200×1800):

| Metrica | Valor |
|---|---|
| IoU FP32 | 1.0 |
| IoU FP16 (punto) | 0.99994 |
| IoU FP16 (caja) | 0.99987 |
| Área de punto | 638.200 |
| Tiempo del encoder Small | no disponible (Jetson Orin no disponible) |

Estos valores no constituyen un benchmark representativo, ya que proceden de una sola imagen y el propio autor advierte que no deben citarse las medias de 16 imágenes como representativas de la variante Small.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio es de 0,2 GB, lo que da una idea del peso de los grafos ONNX, pero no se especifica el consumo en memoria en ejecución.
- GPU recomendadas: no disponible. El autor menciona compilación TensorRT para Jetson, pero no confirma haberla probado en Jetson Orin.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamaño reducido de la variante Small, es plausible que quepa en GPU de consumo, pero no hay datos que lo respalden en la documentación.
- Opciones de despliegue: ONNX Runtime (probado con `CPUExecutionProvider` en el ejemplo del autor) y TensorRT (script `jetson/build_tensorrt.sh` para compilar `encoder_fp16.onnx` con entrada 1024×1024).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM2.1-Small-Image-ONNX (esta ficha) | no disponible (base: hiera-small) | imagen 1024×1024, modo imagen | IoU 1.0 en una imagen de prueba; sin benchmarks | apache-2.0 | ONNX en Hugging Face |
| facebook/sam2.1-hiera-small | no disponible | imagen y vídeo | no disponible en esta ficha | apache-2.0 | PyTorch en Hugging Face |
| Otras exportaciones ONNX de SAM 2.1 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría (por ejemplo, otras variantes de SAM 2.1 o exportaciones ONNX de terceros). Los datos de parámetros y rendimiento del modelo base no se han proporcionado.

## Limitaciones y advertencias

- El modelo solo funciona en modo imagen; no soporta segmentación de vídeo, a diferencia del SAM 2.1 completo.
- Las métricas de calidad publicadas proceden de una única imagen (`truck.jpg`); no hay evidencia de rendimiento en dominios diversos.
- No se han publicado tiempos de inferencia ni consumo de memoria en hardware real; el autor declara no haber probado en Jetson Orin.
- El modelo es un segmentador, no un modelo de lenguaje: no genera texto, no razona y no soporta agentes ni tool calling.
- Riesgo de alucinación en el sentido de máscaras incorrectas o incompletas ante prompts ambiguos; no se documentan análisis de fallos.
- No se documentan sesgos de dominio ni limitaciones idiomáticas (no aplica idioma, pero sí sesgos en el dataset de entrenamiento del modelo original, no descritos aquí).
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `facebook/sam2.1-hiera-small` y del artículo asociado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El autor advierte explícitamente de no citar las medias de 16 imágenes como representativas de la variante Small, lo que sugiere que los datos publicados pueden inducir a error si se generalizan.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/christianengel/SAM2.1-Small-Image-ONNX
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-small
- Artículo de referencia (Ravi et al.): https://arxiv.org/abs/2408.00714
- Script de compilación TensorRT mencionado: `jetson/build_tensorrt.sh` (incluido en el repositorio, ruta relativa)
