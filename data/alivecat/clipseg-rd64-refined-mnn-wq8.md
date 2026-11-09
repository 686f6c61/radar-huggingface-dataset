# alivecat/clipseg-rd64-refined-mnn-wq8

## Resumen

CLIPSeg RD64 Refined MNN WQ8 es una conversión cuantizada del modelo CLIPSeg de segmentación de imágenes guiada por texto, publicada por el usuario alivecat en Hugging Face. Se trata de una versión del checkpoint CIDAS/clipseg-rd64-refined exportada al formato de runtime MNN (Mobile Neural Network, de Alibaba) con cuantización de pesos a 8 bits (WQ8) y bloques de 128 elementos donde el operador lo permite. El modelo recibe una imagen RGB y un prompt de texto corto, y devuelve una máscara de probabilidad que delimita la región descrita en el prompt.

El modelo base, CLIPSeg, fue introducido por Timo Lueddecke y Alexander Ecker en el artículo "Image Segmentation Using Text and Image Prompts" (arXiv:2112.10003). Su relevancia radica en que permite segmentación zero-shot sin entrenamiento específico por clase: basta con describir el objeto en lenguaje natural. Esta conversión concreta está pensada para despliegue en entornos con recursos limitados, ya que el artefacto MNN ocupa 210,73 MiB y está optimizado para inferencia con batch 1.

La ficha se limita a los datos publicados en la model card y en los metadatos del repositorio. No hay información sobre benchmarks, licencia más allá de la Apache-2.0 heredada, ni resultados de evaluación en esta conversión concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIPSeg (encoder de texto CLIP + encoder de visión + decodificador convolucional refinado con dimensión de reducción 64) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de texto fija a 77 tokens (pad/truncate) |
| Tipos de cuantizacion | WQ8 (pesos a 8 bits, block size 128 donde el operador lo soporta) |
| Idiomas soportados | no disponible (el encoder de texto CLIP subyacente es multilingüe limitado; la model card no lo declara) |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN (`model_fp32_wq8_block128.mnn`), 210,73 MiB |
| Resolución de entrada | 352 x 352 RGB, normalizada con media [0.485, 0.456, 0.406] y desviación [0.229, 0.224, 0.225] |
| Entrada de texto | `input_ids` y `attention_mask` int32 [1, 77] |
| Salida | `logits` float32 [1, 352, 352] (aplicar sigmoid para probabilidades) |
| Runtime | MNN (Alibaba) |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

CLIPSeg combina un encoder de texto y un encoder de visión de tipo CLIP con un decodificador convolucional que fusiona ambas representaciones para producir una máscara densa. La variante "rd64-refined" usa una dimensión de reducción de 64 en el decodificador y una cabeza de máscara convolucional refinada, lo que mejora la calidad de los bordes respecto a variantes más simples. El modelo original se entrena con prompts de texto e imagen sobre datasets de segmentación, y el artículo de referencia describe el entrenamiento conjunto con ambos tipos de prompt.

Esta conversión concreta no aporta información sobre el entrenamiento: no se indica número de tokens, composición del dataset ni si hubo RLHF o DPO (no aplica en un modelo de segmentación). La model card solo documenta el proceso de conversión: se parte del export ONNX de Xenova/clipseg-rd64-refined, se cuantizan los pesos a 8 bits con bloques de 128 y se empaqueta todo (encoder de texto, encoder de visión y decodificador refinado) en un único fichero MNN. Se incluyen los ficheros del tokenizador CLIP BPE, `preprocessor_config.json`, `config.json` de la arquitectura upstream, `manifest.json` con tamaños y hashes SHA-256, y `SHA256SUMS`.

## Capacidades

- Segmentación de imágenes guiada por texto: dada una imagen y una descripción corta, genera una máscara de probabilidad de la región descrita.
- Segmentación zero-shot: no requiere entrenamiento por clase ni ejemplos de la categoría objetivo.
- Procesamiento de una imagen por inferencia (batch 1 documentado).
- Salida densa a resolución 352 x 352 que puede redimensionarse a las dimensiones originales de la imagen.
- No soporta tool calling ni function calling.
- No es un modelo generativo de texto ni de razonamiento multi-paso.
- No soporta agentes.
- Capacidades multilingües: no documentadas; dependen del encoder de texto CLIP subyacente y de los prompts en el idioma en que fue entrenado.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá de la segmentación.

## Casos de uso

- Edición fotográfica asistida por texto: el usuario escribe "el perro" o "la taza" y el modelo devuelve una máscara para aplicar recortes, reemplazos de fondo o ajustes locales sin selección manual.
- Preprocesado en pipelines de visión por computador: generar máscaras de regiones de interés antes de un clasificador o detector, reduciendo el ruido de fondo en imágenes de entrada.
- Anotación semiautomática de datasets: producir máscaras iniciales a partir de descripciones de clase, que luego un humano revisa, acelerando el etiquetado de segmentación.
- Aplicaciones móviles o embebidas: el artefacto MNN de 210,73 MiB y la cuantización WQ8 permiten desplegar segmentación guiada por texto en dispositivos con memoria limitada usando el runtime MNN.
- Moderación y análisis de contenido visual: localizar regiones descritas por texto (por ejemplo, "texto sobreimpreso" o "marca de agua") para su revisión o recorte.
- Realce selectivo en fotografía computacional: aplicar nitidez, desenfoque o corrección de color solo a la región indicada por el prompt, manteniendo el resto de la imagen intacta.
- Prototipado rápido en investigación: evaluar segmentación zero-shot con prompts en lenguaje natural sin entrenar un modelo específico, usando el formato MNN para integraciones ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto MNN ocupa 210,73 MiB y la entrada es una única imagen de 352 x 352, por lo que el consumo de memoria es moderado y apto para entornos con poca memoria.
- GPU recomendadas: no disponibles en la información proporcionada. El runtime MNN está orientado a CPU y a aceleradores móviles; no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no documentada. Por tamaño y resolución, es plausible en GPUs de consumo, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: runtime MNN (Alibaba). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de segmentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| alivecat/clipseg-rd64-refined-mnn-wq8 | no disponible | texto 77 tokens, imagen 352x352 | Segmentación guiada por texto | Apache-2.0 | MNN WQ8 |
| CIDAS/clipseg-rd64-refined | no disponible | texto 77 tokens, imagen 352x352 | Segmentación guiada por texto | Apache-2.0 | PyTorch / safetensors |
| Xenova/clipseg-rd64-refined | no disponible | texto 77 tokens, imagen 352x352 | Segmentación guiada por texto | Apache-2.0 | ONNX |
| Segment Anything (SAM) | no disponible | prompts de punto/caja, sin texto | Segmentación con prompts geométricos | Apache-2.0 (variantes) | PyTorch / ONNX |

La comparativa se limita a variantes del mismo modelo base (PyTorch, ONNX y MNN cuantizado) y a SAM como alternativa de segmentación, aunque SAM no acepta prompts de texto. No hay datos de rendimiento comparado en la información disponible.

## Limitaciones y advertencias

- No se han publicado métricas de calidad para esta conversión cuantizada; la cuantización WQ8 puede degradar la precisión de las máscaras respecto al checkpoint original en fp32.
- El modelo está pensado para batch 1; no se documenta soporte para lotes mayores.
- La entrada de texto está limitada a 77 tokens, lo que restringe la complejidad de los prompts.
- La resolución de entrada está fija a 352 x 352; detalles finos de imágenes de alta resolución pueden perderse tras el redimensionado.
- Riesgo de alucinación en el sentido de generar máscaras para regiones que no existen o mal delimitadas cuando el prompt es ambiguo o la clase no está bien representada.
- Sesgos: no documentados en esta conversión; hereda los del checkpoint CLIPSeg original, no evaluados aquí.
- Idiomas: no declarados; los prompts en idiomas distintos del inglés pueden funcionar peor según el encoder CLIP subyacente.
- Licencia Apache-2.0, que permite uso comercial con atribución; deben conservarse `LICENSE` y `NOTICE`.
- El repositorio no incluye el runtime MNN; es necesario obtenerlo por separado desde el proyecto de Alibaba.
- Fecha de creación del repositorio: 2026-11-09; descargas y likes a cero en el momento de la consulta, sin evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alivecat/clipseg-rd64-refined-mnn-wq8
- Modelo base: https://huggingface.co/CIDAS/clipseg-rd64-refined
- Export ONNX de origen: https://huggingface.co/Xenova/clipseg-rd64-refined
- Runtime MNN: https://github.com/alibaba/MNN
- Artículo CLIPSeg: https://arxiv.org/abs/2112.10003
