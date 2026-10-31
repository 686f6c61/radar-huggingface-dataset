# paralaif/ComfyUI-WeVisOne-VL

## Resumen

ComfyUI-WeVisOne-VL es un pack de nodos personalizados para ComfyUI, desarrollado por el usuario paralaif, que integra el modelo WeVisOne-VL-4B de Tencent para tareas unificadas de percepción visual: detección de vocabulario abierto, localización por expresión referencial (referring expression comprehension), señalamiento por puntos (pointing), conteo de objetos, OCR y matting alfa indicado por texto. El repositorio pesa 15,4 GB y se distribuye bajo licencia Apache 2.0.

El modelo subyacente es una variante de Qwen3-VL-4B a la que se han añadido 1010 tokens extra con su propia cabecera de salida (`lm_head`), además de un decodificador de píxeles de 9,6 millones de parámetros que genera máscaras y cajas a nivel de píxel. Esto permite resolver en un único modelo tareas que tradicionalmente requieren varios modelos especializados (detection, grounding, segmentación y OCR).

El pack es relevante porque reutiliza la implementación nativa de Qwen3-VL de ComfyUI, se integra con nodos existentes como SAM3 Detect y Draw BBoxes, y ofrece pesos cuantizados en int8 con la técnica ConvRot, que según el autor es unas 3 veces más rápida que bf16 en GPUs de 16 GB con una degradación mínima de precisión (cajas dentro de 2/1000 y máscaras con 0,999 de IoU respecto a bf16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B con 1010 tokens adicionales y `lm_head` propia, más decodificador de píxeles de 9,6M de parámetros |
| Parametros totales | Aproximadamente 4B (LM) + 9,6M (decodificador de píxeles); total exacto no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 con ConvRot (lineales de lenguaje y visión, formato comfy-kitchen); bf16 original; decodificador de píxeles siempre en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`wevisone_vl_4b_int8_convrot.safetensors`, 5,7 GB; `wevisone_vl_4b_bf16.safetensors`, 9,7 GB) |

## Arquitectura y entrenamiento

La base del modelo es Qwen3-VL-4B, un modelo visión-lenguaje de arquitectura transformer. Sobre esa base, WeVisOne-VL añade 1010 tokens especiales al vocabulario con su propia `lm_head`, que codifican salidas espaciales (cajas, puntos, máscaras), y un decodificador de píxeles de 9,6 millones de parámetros encargado de producir las máscaras de matting y los resultados a nivel de píxel. En el pack de ComfyUI, el decodificador se ejecuta sobre las operaciones nativas de ComfyUI (ComfyUI ops) y trabaja en fp32 sobre un lienzo de 1024×1024.

No se dispone de información publicada sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO); los detalles técnicos completos están en el artículo de referencia (arXiv:2610.31329). En cuanto a inferencia, el pack usa decodificación greedy con un penalty de repetición de 1,05. La versión int8 ConvRot cuantiza las capas lineales de lenguaje y visión en formato comfy-kitchen, manteniendo el decodificador de píxeles en fp32.

## Capacidades

- Detección de vocabulario abierto (open-vocabulary detection): localiza múltiples clases de objetos indicadas como etiquetas, una por línea.
- Localización referencial (referring): identifica el objeto descrito por una frase en lenguaje natural, por ejemplo "the boy wearing glasses".
- Point grounding: devuelve coordenadas de puntos en formato JSON, utilizables como prompts de puntos para SAM3.
- Conteo de objetos: tareas `count_box` y `count_point` sobre el objeto indicado (por ejemplo, 15 piezas de ajedrez blancas).
- OCR: extracción de texto de imágenes, con la tarea adicional `ocr_grounding` para localizar un texto concreto en la imagen.
- Matting alfa indicable por prompt: genera máscaras alfa de alta calidad para recortes transparentes (persona, "the red parasol", etc.).
- Tarea `freeform`: acepta el prompt completo del usuario sin estructura fija.
- Salidas estructuradas: respuesta textual cruda, `bboxes` compatibles con SAM3 Detect y Draw BBoxes, `points` en JSON y `mask` (unión por imagen o máscaras individuales por instancia con `individual_masks`).
- Pipeline image-text-to-text: acepta imagen y texto como entrada y genera texto estructurado.

## Casos de uso

- Recorte transparente de sujetos para composición fotográfica: la tarea `matting` genera máscaras alfa por instancia que pueden encadenarse con nodos de ComfyUI para construir cutouts con fondo transparente, como en el workflow de ejemplo incluido.
- Etiquetado y anotación de datasets de visión: la detección de vocabulario abierto permite generar cajas delimitadoras de clases arbitrarias sin entrenar un detector dedicado, acelerando la creación de datasets.
- Segmentación con SAM3 asistida por lenguaje: los `bboxes` y `points` que emite el nodo son directamente compatibles con SAM3 Detect, de modo que WeVisOne-VL puede actuar como generador de prompts para SAM3 en pipelines de segmentación.
- Indexación y búsqueda de texto en imágenes: el OCR y `ocr_grounding` permiten extraer texto de carteles, señales o documentos y localizar dónde aparece una cadena concreta, útil para archivado y moderación.
- Verificación de inventario o escenas por conteo: las tareas `count_box` y `count_point` permiten contar instancias de un objeto (piezas de ajedrez, productos en estanterías) dentro de un workflow automatizado.
- Edición de imágenes dirigida por lenguaje natural: la localización referencial ("the boy playing the drums") permite seleccionar regiones complejas descritas con texto para aplicar ediciones, inpainting o efectos solo sobre esa zona.
- Automatización de workflows creativos en ComfyUI: el nodo WeVisOne-VL Perceive expone salidas estructuradas (máscaras, cajas, puntos) que se integran con el resto del grafo de ComfyUI para pipelines de generación y edición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados son de ingeniería: la versión int8 ConvRot es aproximadamente 3 veces más rápida que bf16 en una GPU de 16 GB, con cajas dentro de 2/1000 de las de bf16 y máscaras con 0,999 de IoU respecto a bf16.

## Requisitos de hardware

- VRAM para inferencia: el decodificador de píxeles en fp32 sobre lienzo de 1024×1024 consume unos 2 GB de VRAM por instancia, además de los pesos del modelo (5,7 GB en int8 o 9,7 GB en bf16). Consumo total exacto no disponible.
- GPU recomendadas: el autor indica funcionamiento en GPUs de 16 GB (categoría en la que entran la RTX 4090 o la RTX 5080); no se especifican recomendaciones de datacenter.
- Consumer GPUs: la variante int8 ConvRot está diseñada para caber y ejecutarse con rapidez en GPUs de 16 GB; en GPUs de 12 GB podría ajustarse la variante int8, aunque no está confirmado por el autor.
- Despliegue: exclusivamente como custom nodes de ComfyUI; el pack reutiliza la implementación nativa de Qwen3-VL de ComfyUI y el decodificador corre sobre ComfyUI ops. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este pack.
- Latencia y throughput: no disponibles más allá de la aceleración de ~3x de int8 ConvRot frente a bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Tareas | Formato | Licencia |
|---|---|---|---|---|
| WeVisOne-VL-4B (este pack, base Tencent) | ~4B + 9,6M decodificador | Detección, referring, pointing, conteo, OCR, matting | safetensors (int8/bf16) | Apache 2.0 |
| Qwen3-VL-4B (base original) | 4B | VLM general (comprensión y generación multimodal) | safetensors, GGUF comunitario | Apache 2.0 |
| Florence-2 (Microsoft) | 0,23B / 0,77B | Detección, referring, OCR, captioning | safetensors | MIT |

WeVisOne-VL-4B se distingue de su base Qwen3-VL-4B por añadir las salidas espaciales (cajas, puntos, máscaras) y el matting por prompt, tareas que el modelo base no resuelve de forma nativa. Frente a Florence-2, ofrece un modelo más grande y capacidades adicionales como matting alfa y conteo, a cambio de mayores requisitos de memoria. Datos de rendimiento comparativo no disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3-VL-4B, puede heredar los sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: no cuantificado; en tareas de detección y conteo conviene validar las salidas en aplicaciones críticas.
- Limitaciones de contexto e idioma: longitud de contexto e idiomas soportados no disponibles; las consultas de los ejemplos están en inglés.
- Licencia: Apache 2.0, sin restricciones para uso comercial, tanto en el pack como en los pesos originales de Tencent.
- Caveats de producción: el pack está diseñado solo para ComfyUI y no es un servicio de inferencia standalone; el decodificador de píxeles consume ~2 GB de VRAM por instancia en fp32, lo que limita el número de instancias concurrentes; la cuantización int8 ConvRot introduce una desviación mínima pero no nula (cajas dentro de 2/1000 respecto a bf16); la decodificación greedy con penalty 1,05 no es configurable según la documentación disponible; el repo registra 0 descargas, por lo que carece de trayectoria comunitaria verificada.

## Enlaces

- Pack de ComfyUI: https://huggingface.co/paralaif/ComfyUI-WeVisOne-VL
- Modelo base: https://huggingface.co/tencent/WeVisOne-VL-4B
- Repositorio de referencia: https://github.com/Tencent/WeVisOne-VL
- Artículo: WeVisOne-VL: Unified Visual Perception from Objects to Pixels, arXiv:2610.31329 (https://arxiv.org/abs/2610.31329)
