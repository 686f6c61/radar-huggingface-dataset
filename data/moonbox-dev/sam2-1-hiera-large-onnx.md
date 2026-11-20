# moonbox-dev/sam2.1-hiera-large-ONNX

## Resumen

SAM 2.1 Hiera-L ONNX es una conversión a formato ONNX del modelo de segmentación promptable SAM 2.1 Hiera-L de Meta (facebook/sam2.1-hiera-large), publicada por el usuario moonbox-dev bajo licencia Apache 2.0. El objetivo es facilitar la inferencia on-device mediante ONNX Runtime en CPU, CUDA y DirectML, eliminando la dependencia de PyTorch en producción. El repositorio incluye los grafos ONNX del codificador de imagen y de los dos decodificadores de prompts (puntos y cajas), junto con un pequeño script `pipeline.py` en numpy que reproduce el preprocesado del `Sam2Processor` y el postprocesado de máscaras.

La conversión cubre únicamente la ruta de imagen única: los módulos de memoria de vídeo del SAM 2.1 original no están incluidos. Se ofrecen dos precisiones: `fp16` (codificador en fp16 con entradas/salidas fp32 y decodificadores en fp32) e `int8` (codificador con cuantización weight-only int8, marcada como experimental y por debajo del umbral de calidad). El tamaño total del repositorio es de 0,7 GB y el modelo base es el Hiera-L de Meta, con arquitectura Hiera y aproximadamente 224 millones de parámetros en el codificador original.

La relevancia de esta ficha radica en que permite desplegar segmentación promptable de alta calidad en entornos sin GPU dedicada o con requisitos estrictos de portabilidad, manteniendo una fidelidad muy alta respecto al modelo PyTorch original (IoU medio de 0,999 en fp16).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hiera (jerárquica con atención) para el codificador; decodificadores transformer para prompts de puntos y cajas |
| Parámetros totales | no disponible (el modelo base Hiera-L tiene ~224 M en el codificador, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 1024 x 1024 píxeles) |
| Tipos de cuantización | fp16 (codificador fp16, decodificadores fp32), int8 weight-only (experimental, por debajo del umbral) |
| Idiomas soportados | no disponible (modelo de segmentación de imágenes, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `.onnx` + `pipeline.py` + `preprocessor_config.json`) |

## Arquitectura y entrenamiento

El modelo base es SAM 2.1 Hiera-L de Meta, un segmentador promptable que combina un codificador de imagen jerárquico Hiera con decodificadores ligeros que reciben prompts (puntos o cajas) y producen máscaras. La conversión a ONNX separa el modelo en tres grafos: `encoder.onnx` (entrada `pixel_values` [1, 3, 1024, 1024], salidas `feat_s0` [1, 32, 256, 256], `feat_s1` [1, 64, 128, 128] e `image_embed` [1, 256, 64, 64]), `point_decoder.onnx` (tres mapas de características, puntos [1, 1, N, 2] en coordenadas de 1024 píxeles y etiquetas [1, 1, N] → máscaras [1, 1, 3, 256, 256] y puntuaciones IoU [1, 1, 3]) y `box_decoder.onnx` (tres mapas y cajas [1, 1, 4] → una máscara [1, 1, 1, 256, 256] y una puntuación IoU [1, 1, 1]).

No se dispone de información sobre los datos de entrenamiento originales ni sobre procesos de RLHF/DPO, ya que esta ficha describe una conversión de formato, no un modelo entrenado desde cero. La innovación técnica principal es la reproducción fiel del pipeline de `transformers` (`Sam2Processor` + `Sam2Model`) en numpy puro, incluyendo el redimensionado a 1024 x 1024, la normalización con estadísticas ImageNet, el escalado de coordenadas de prompt, el upsampling bilineal de las máscaras de 256 a 1024 y el umbralizado a 0. Se documenta una diferencia menor entre el redimensionado con Pillow y el filtro bilineal de punto fijo de torchvision, que puede alterar una salida multimáscara ambigua; para coincidencia exacta se recomienda alimentar al codificador los `pixel_values` del procesador original.

## Capacidades

- Segmentación de imágenes promptable mediante puntos: dado un punto en coordenadas de 1024 píxeles y su etiqueta (primer plano o fondo), devuelve tres máscaras candidatas con puntuaciones IoU predichas.
- Segmentación promptable mediante cajas delimitadoras: dada una caja [x1, y1, x2, y2], devuelve una máscara única seleccionada mediante el mecanismo de estabilidad multimáscara del modelo.
- Generación de máscaras de alta resolución: las máscaras se generan a 256 x 256 logits y se reescalan bilinealmente a 1024 y al tamaño original de la imagen.
- Ejecución on-device con ONNX Runtime en CPU, CUDA y DirectML, sin dependencia de PyTorch.
- Preprocesado y postprocesado integrados en `pipeline.py` (numpy, onnxruntime, Pillow).
- No incluye los módulos de memoria de vídeo del SAM 2.1 original; no soporta segmentación de vídeo ni propagación de máscaras entre fotogramas.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades lingüísticas (es un modelo puramente visual).

## Casos de uso

- Segmentación interactiva en aplicaciones de edición de imagen: el usuario hace clic en un objeto y el modelo devuelve tres máscaras candidatas con puntuaciones; el decodificador de puntos y el pipeline numpy permiten integrarlo en una interfaz ligera sin PyTorch.
- Recorte automático de productos en comercio electrónico: se pasa una caja delimitadora detectada por un detector previo y `box_decoder.onnx` devuelve una máscara única, adecuada para generar fondos transparentes en lotes.
- Anotación asistida en pipelines de etiquetado: el modelo acelera la creación de máscaras de segmentación para datasets de visión por computador, con IoU medio de 0,999 respecto al modelo PyTorch en fp16.
- Despliegue en dispositivos sin GPU dedicada: la variante int8 reduce el codificador a 217,1 MB y permite ejecución en CPU con ONNX Runtime, a costa de un IoU peor (0,984 medio, 0,859 en el peor caso).
- Procesamiento en el borde (edge computing) con DirectML en Windows: la conversión está pensada para ONNX Runtime con DirectML, lo que facilita su uso en equipos de escritorio con GPU integrada.
- Segmentación en aplicaciones médicas o de inspección industrial donde se requiera portabilidad de formato y licencia permisiva (Apache 2.0), con la salvedad de validar la precisión en el dominio concreto.
- Integración en servicios web de análisis de imágenes: el codificador se ejecuta una vez por imagen y los decodificadores se invocan repetidamente con distintos prompts, lo que encaja con un patrón de caché de características.

## Benchmarks y rendimiento

Los datos de benchmark proporcionados por el autor comparan la fidelidad de las máscaras respecto al modelo PyTorch original (IoU de cada máscara predicha con la del original en las mismas imágenes y prompts), sobre ocho fotos:

| Precisión | Configuración | IoU medio | Peor IoU | Tiempo por foto (CUDA) |
|---|---|---|---|---|
| fp16 | Codificador fp16, decodificadores fp32 | 0,999 | 0,984 | 0,15 s |
| fp32 (referencia) | Grafos fp32 | 0,999 | 0,986 | no disponible |
| int8 | Codificador int8, decodificadores fp32 | 0,984 | 0,859 | 0,26 s |

El autor indica que la variante int8 está por debajo del umbral de calidad (experimental). No se probó int4 (4-bit MatMulNBits en el codificador: peor máscara con IoU 0,19) ni bf16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque no aplican a un modelo de segmentación.

## Requisitos de hardware

- VRAM estimada para inferencia: el codificador fp16 ocupa 428,2 MB y los decodificadores 16,6 MB y 16,5 MB; en int8 el codificador baja a 217,1 MB. La memoria total en ejecución es moderada, adecuada para GPUs de gama media.
- GPU recomendadas: cualquier GPU compatible con CUDA u ONNX Runtime; el autor reporta 0,15 s por foto en CUDA con fp16. No se especifican modelos concretos de GPU.
- Cabe en GPU de consumo: sí, por el tamaño reducido de los grafos (menos de 0,5 GB en fp16), aunque no se detallan modelos concretos como RTX 4090 o similares.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) con el script `pipeline.py` incluido; requiere numpy, onnxruntime u onnxruntime-gpu y Pillow.
- Latencia y throughput: 0,15 s por foto en CUDA con fp16; 0,26 s por foto en CUDA con int8. No se proporcionan datos de throughput por lotes ni latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sam2.1-hiera-large-ONNX (esta ficha) | no disponible (codificador ~224 M en el base) | Imagen 1024 x 1024 | IoU 0,999 vs. PyTorch en fp16; 0,15 s/foto en CUDA | Apache 2.0 | ONNX en Hugging Face |
| facebook/sam2.1-hiera-large | ~224 M en el codificador (dato no confirmado en la información proporcionada) | Imagen 1024 x 1024 y vídeo | Referencia original | Apache 2.0 | PyTorch en Hugging Face |
| SAM 2.1 Hiera-B+ / Hiera-S (variantes menores de la familia) | no disponible | Imagen 1024 x 1024 | no disponible | Apache 2.0 | PyTorch en Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de segmentación (por ejemplo, SAM original o Mask2Former) en la información proporcionada. La comparativa se limita a la familia SAM 2.1.

## Limitaciones y advertencias

- Solo cubre la ruta de imagen única: los módulos de memoria de vídeo del SAM 2.1 original no están incluidos, por lo que no sirve para segmentación de vídeo ni propagación temporal de máscaras.
- La variante int8 está marcada como experimental y por debajo del umbral de calidad (peor IoU 0,859 frente a 0,984 en fp16); no se recomienda para producción sin validación adicional.
- No se probaron int4 ni bf16; el autor reporta que int4 degrada gravemente la calidad (IoU 0,19 en la peor máscara).
- Diferencias de redimensionado entre Pillow y torchvision pueden alterar salidas multimáscara ambiguas; para coincidencia exacta con `transformers` hay que usar los `pixel_values` del procesador original.
- Riesgo de sesgos y alucinaciones: no se documentan sesgos específicos, pero al ser un modelo de segmentación puede producir máscaras incorrectas en objetos ambiguos, oclusiones o dominios alejados de los datos de entrenamiento originales.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base de Meta y citar adecuadamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria.
- No se especifican idiomas soportados porque el modelo no procesa texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/sam2.1-hiera-large-ONNX
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-large
- Paper de SAM 2 (referencia arXiv:2408.00714): https://arxiv.org/abs/2408.00714
- ONNX Runtime: https://onnxruntime.ai/
