# eyepop-ai/sam3.1-onnx

## Resumen

SAM 3.1 ONNX es una exportación a formato ONNX del detector de imágenes SAM 3.1 de Meta Platforms, publicada por eyepop-ai para alimentar las capacidades de detección y segmentación open-vocabulary de su plataforma. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son los originales de Meta, redondeados a float16, y el trabajo del autor consiste únicamente en la conversión de los grafos para su ejecución con ONNX Runtime.

El modelo resuelve detección y segmentación guiadas por prompt de texto (open-vocabulary) sobre imágenes: recibe un frame RGB de 1008x1008 y una lista de Q prompts tokenizados con BPE de CLIP, y devuelve cajas, puntuaciones e índices de prompt, opcionalmente con máscaras de 288x288 sobre el frame completo. La exportación separa la arquitectura en cuatro grafos independientes (encoder de imagen, encoder de lenguaje y dos decoders), lo que permite reutilizar las características de imagen entre múltiples consultas.

Es relevante ahora porque expone un modelo de segmentación de última generación en un formato portable, sin dependencia de PyTorch en tiempo de inferencia, y con una fidelidad numérica verificada frente a la referencia (IoU de caja >= 0,998 y delta de score <= 0,0004 en CUDA). El repositorio ocupa 1,8 GB y la licencia aplicable es la SAM License, idéntica a la de los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de detección y segmentación open-vocabulary (SAM 3.1 de Meta), exportado como cuatro grafos ONNX independientes: encoder de imagen, encoder de lenguaje, decoder de detección y decoder de segmentación |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 1008x1008 píxeles y hasta 32 tokens por prompt de texto (Q prompts por ejecución, EyePop permite hasta 8) |
| Tipos de cuantizacion | Pesos almacenados en float16 con Cast a float32 en los encoders; cómputo en float32 en todos los execution providers. No se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (los prompts de texto se tokenizan con BPE de CLIP) |
| Licencia | SAM License (license_name: sam-license, license: other); copia literal incluida en el repositorio como LICENSE |
| Formato de pesos | ONNX (opset 19); cuatro ficheros: sam3_image_encoder.onnx, sam3_language_encoder.onnx, sam3_decoder_detect.onnx, sam3_decoder_segment.onnx |

## Arquitectura y entrenamiento

La arquitectura subyacente es SAM 3.1 de Meta, un modelo de detección y segmentación open-vocabulary que combina un backbone de imagen con un encoder de lenguaje y un decoder tipo transformer. La exportación divide el modelo en cuatro grafos: el encoder de imagen consume un tensor uint8 `[3, 1008, 1008]` en RGB escalado para rellenar el frame y produce `vision_pos_enc_2` y `backbone_fpn_0..2`; el encoder de lenguaje consume tokens int64 `[Q, 32]` con padding a cero y produce `language_mask` y `language_features` en float32 `[32, Q, 256]`; los dos decoders consumen las características de imagen y de lenguaje junto con un `score_threshold` y emiten puntuaciones, cajas `[N, 4]` normalizadas en 0..1, índice de prompt y, en el caso del decoder de segmentación, máscaras uint8 `[N, 288, 288]` sobre el frame completo.

No hubo reentrenamiento ni fine-tuning: los pesos son los de Meta redondeados a float16. La exportación se realizó con `torch.onnx.export` (opset 19) mediante el script `export_sam3.py` del repositorio eyepop-pipeline. Las modificaciones aplicadas cambian la forma de escribir las operaciones, no lo que computan, y cada una está verificada contra el código de Meta: el `addmm_act` bf16 fusionado se ejecuta como `activation(linear(x))` en float32; RoPE se calcula en aritmética real como `x * cos + (x @ P) * sin`; un prompt geométrico vacío codifica solo su token CLS sin tensores de longitud cero; y la atención del decoder se ejecuta en bloques de 648 queries para acotar el uso de memoria. La puntuación de una detección se calcula como `sigmoid(logit) * sigmoid(presence logit)`, igual que en el `Sam3Processor` de Meta.

## Capacidades

- Detección de objetos open-vocabulary guiada por prompts de texto: devuelve cajas normalizadas, puntuaciones e índice del prompt que originó cada detección.
- Segmentación de instancias: el decoder de segmentación añade máscaras uint8 de 288x288 sobre el frame completo para cada detección.
- Procesamiento por lotes de prompts: los Q prompts se decodifican en una sola ejecución; EyePop permite hasta 8 por llamada.
- Umbralización configurable mediante la entrada `score_threshold` en el decoder.
- Reutilización de características de imagen entre consultas: el encoder de imagen se ejecuta una vez y los decoders consumen sus salidas.
- Ejecución portable sin PyTorch en inferencia, sobre cualquier execution provider de ONNX Runtime.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, audio ni visión generativa.

## Casos de uso

- Detección de objetos por descripción textual en pipelines de visión: el modelo permite buscar categorías arbitrarias sin reentrenar, enviando los términos como prompts y filtrando por `score_threshold`; encaja en sistemas de inspección o moderación de contenido donde el catálogo de objetos cambia con frecuencia.
- Segmentación para edición y composición de imagen: las máscaras de 288x288 sobre el frame completo permiten recortar o aislar instancias detectadas por prompt, útil en herramientas de edición automática y generación de máscaras para pipelines de difusión.
- Análisis de vídeo o flujos de cámaras: al separar el encoder de imagen de los decoders, se puede codificar cada frame una vez y evaluar múltiples prompts sobre las mismas características, reduciendo el coste por consulta en despliegues de vigilancia o analítica retail.
- Automatización de anotación de datasets: el modelo genera cajas y máscaras a partir de etiquetas en lenguaje natural, lo que acelera el etiquetado previo de imágenes que después se revisan manualmente.
- Integración en plataformas de inferencia gestionada: el formato ONNX permite desplegar en ONNX Runtime con distintos execution providers (CUDA, CPU) sin arrastrar la pila de PyTorch, lo que simplifica contenedores y dependencias en producción.
- Conteo y localización de instancias en imágenes aéreas o de satélite: la detección open-vocabulary con cajas normalizadas facilita localizar elementos descritos textualmente en frames de alta resolución reescalados a 1008x1008.
- Preprocesado para pipelines multimodales: las cajas y máscaras pueden alimentar etapas posteriores de OCR, clasificación o generación aumentada por recuperación visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de la exportación frente a la referencia en PyTorch:

| Metrica | Valor |
|---|---|
| IoU de caja frente a referencia PyTorch | >= 0,998 |
| Delta de score frente a referencia | <= 0,0004 |
| Entorno de verificacion | CUDA |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,8 GB, lo que da una cota inferior del peso de los cuatro grafos en disco. Los encoders almacenan pesos en float16 pero computan en float32, por lo que el consumo en memoria durante la ejecución es superior al tamaño de los ficheros.
- GPU recomendadas: no disponibles en la información proporcionada; la verificación de fidelidad se realizó en CUDA, lo que confirma soporte de ejecución en GPU NVIDIA.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamaño del repositorio (1,8 GB) y la entrada fija de 1008x1008, es plausible en GPUs de consumo con suficiente VRAM, pero no hay datos publicados al respecto.
- Opciones de despliegue: ONNX Runtime con cualquier execution provider (CUDA, CPU); los grafos están exportados con opset 19. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles. La atención del decoder se ejecuta en bloques de 648 queries para acotar la memoria, lo que sugiere un consumo de memoria controlado a costa de posibles ejecuciones adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eyepop-ai/sam3.1-onnx | no disponible | imagen 1008x1008, prompts de hasta 32 tokens | ONNX (opset 19) | SAM License | HuggingFace, 0 descargas |
| facebook/sam3.1 (original) | no disponible | imagen 1008x1008, prompts de hasta 32 tokens | PyTorch (sam3.1_multiplex.pt) | SAM License | Repositorio de Meta (github.com/facebookresearch/sam3) |
| SAM 3 (versión previa) | no disponible | no disponible | PyTorch | SAM License | Repositorio de Meta |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí. La diferencia principal entre la exportación de eyepop-ai y el original de Meta es el formato (ONNX frente a PyTorch) y la separación en cuatro grafos, no la calidad del modelo, ya que los pesos son idénticos salvo el redondeo a float16.

## Limitaciones y advertencias

- Licencia SAM License: el uso comercial está sujeto a los términos de dicha licencia, que se incluye literalmente en el repositorio; es responsabilidad del usuario revisarla antes de desplegar en producción.
- No es un modelo reentrenado: cualquier sesgo o limitación de SAM 3.1 de Meta se hereda sin cambios.
- Riesgo de alucinación inherente a la detección open-vocabulary: prompts ambiguos o categorías poco representadas pueden producir detecciones falsas o cajas mal localizadas; el umbral `score_threshold` es el principal mecanismo de control.
- Entrada de imagen fija de 1008x1008 con escalado para rellenar el frame: objetos muy pequeños en imágenes de alta resolución pueden perder detalle tras el reescalado.
- Límite de 32 tokens por prompt y de 8 prompts por ejecución en la integración de EyePop; prompts más largos requieren truncado.
- Idiomas soportados no documentados: el tokenizador es BPE de CLIP, por lo que el comportamiento multilingüe de los prompts no está garantizado ni evaluado.
- Sin datos publicados de latencia, throughput ni requisitos de VRAM, lo que dificulta el dimensionamiento previo de infraestructura.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por parte de terceros.
- La fidelidad numérica está verificada en CUDA; el comportamiento en otros execution providers (CPU, DirectML, TensorRT) no se documenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eyepop-ai/sam3.1-onnx
- Modelo base: https://huggingface.co/facebook/sam3.1
- Repositorio original de SAM 3 / SAM 3.1 (Meta): https://github.com/facebookresearch/sam3
- Repositorio de exportación (eyepop-pipeline, examples/abilities/sam3/export): https://github.com/eyepop-ai/eyepop-pipeline
