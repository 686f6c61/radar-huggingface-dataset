# google/tipsv1-g14

## Resumen

TIPS (Text-Image Pre-training with Spatial awareness) es una familia de modelos de visión-lenguaje contrastivos desarrollados por Google DeepMind, presentados en ICLR 2025. A diferencia de modelos como CLIP o SigLIP, que producen una única representación global de la imagen, TIPS genera características espacialmente ricas: además de un embedding global (CLS token), produce tokens por parche que codifican información de posición y segmentación, lo que permite tareas de segmentación zero-shot y localización sin entrenamiento adicional.

El modelo google/tipsv1-g14 es la variante más grande de la familia v1, con un encoder de visión ViT-g/14 de 1.100 millones de parámetros y un encoder de texto transformer de 12 capas con 389 millones de parámetros, sumando 1.525.085.696 parámetros totales. Opera a una resolución nativa de 448×448 píxeles y produce embeddings de 1536 dimensiones. Se distribuye bajo licencia Apache 2.0 en formato safetensors y es compatible con la librería Transformers mediante código personalizado.

La relevancia actual de TIPS radica en que aborda una limitación clásica de los modelos contrastivos de visión-lenguaje: la falta de conciencia espacial. Al alinear embeddings de texto con características de parche, habilita clasificación zero-shot, segmentación semántica zero-shot y extracción de características densas para tareas de visión por computador, sin necesidad de ajuste fino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-g/14 (visión, 40 capas, patch 14, dos CLS tokens) + transformer de texto (12 capas) |
| Parámetros totales | 1.525.085.696 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (texto limitado a 64 tokens por el tokenizador SentencePiece) |
| Tipos de cuantización | no disponibles en la información proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un encoder de visión ViT-g/14 con 40 capas y dos tokens CLS, junto con un encoder de texto transformer de 12 capas. El primer token CLS se entrena con texto alternativo de la web (alt-text) y es el que queda alineado con el espacio de embeddings de texto. El segundo token CLS, denominado register token, se entrena con subtítulos sintéticos y sirve para mejorar la estabilidad del entrenamiento y la calidad de las características espaciales. El modelo produce tanto un embedding global (CLS token) como tokens por parche (patch tokens) que conservan la estructura espacial de la imagen.

La resolución nativa de trabajo es 448×448 píxeles, aunque se pueden interpolar los embeddings posicionales para procesar resoluciones múltiples del tamaño del patch. El preprocesado de imágenes se limita a convertir los valores al rango [0, 1] sin normalización adicional. El texto se procesa con un tokenizer SentencePiece, en minúsculas y con un máximo de 64 tokens por consulta.

El entrenamiento sigue un esquema de aprendizaje contrastivo imagen-texto, aunque los detalles específicos del dataset, número de tokens de entrenamiento y el uso de técnicas como RLHF o DPO no se detallan en la información disponible. El modelo se publicó originalmente en los checkpoints oficiales de Google DeepMind y se convirtió a formato Transformers para su uso con la librería.

## Capacidades

- Clasificación zero-shot de imágenes: dado un conjunto de etiquetas textuales, el modelo calcula la similitud entre el embedding global de la imagen y los embeddings de texto, devolviendo la clase más probable.
- Extracción de características espaciales: los tokens por parche (patch tokens) ofrecen representaciones densas de la imagen, útiles para segmentación, localización y detección de objetos sin entrenamiento específico.
- Embeddings imagen-texto alineados: permite recuperación de imágenes por texto, búsqueda multimodal y ranking.
- Capacidades multilingües: no documentadas; el tokenizer SentencePiece y el entrenamiento con alt-text sugieren soporte de varios idiomas, pero no se especifica.
- Sin soporte de tool calling ni razonamiento multi-paso: es un modelo de visión-lenguaje puro, no un LLM generativo.

## Casos de uso

- Clasificación zero-shot de imágenes: el modelo puede etiquetar imágenes sin entrenamiento previo. Por ejemplo, en un sistema de moderación de contenido, se pueden definir clases como «violencia», «desnudez» o «objeto peligroso» y obtener predicciones inmediatas sin reentrenar.
- Segmentación zero-shot: gracias a los tokens por parche, TIPS puede identificar regiones espaciales de la imagen que corresponden a una consulta textual. Esto permite crear máscaras de segmentación para objetos específicos en imágenes de escenas, útil en robótica o análisis de imágenes médicas.
- Búsqueda multimodal: los embeddings globales permiten indexar imágenes y texto en un espacio vectorial común. Se puede construir un buscador que acepte consultas en lenguaje natural y devuelva las imágenes más relevantes de una base de datos.
- Extracción de características densas para modelos de visión: los patch tokens pueden usarse como entrada para modelos de segmentación o detección, sustituyendo a backbones como ResNet o ViT preentrenados con supervisión.
- Análisis de imágenes de satélite o drone: la resolución de 448 píxeles y la conciencia espacial permiten localizar objetos en imágenes de alta resolución, como vehículos o edificios, mediante consultas textuales.
- Generación de descripciones de imágenes en sistemas de accesibilidad: el embedding global puede alimentar un modelo de lenguaje para generar descripciones automáticas de imágenes en entornos controlados, donde no se requiere generación directa desde el propio TIPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo en precisión FP32 ocupa aproximadamente 6.1 GB (tamaño del repo). En FP16, la memoria de inferencia ronda los 3.1 GB para el modelo completo, pero la VRAM total dependerá del tamaño del batch y de la resolución de entrada.
- GPU recomendadas: para inferencia con batch pequeño, una GPU con 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060) es suficiente en FP16. Para batch grandes o resolución superior, se recomienda RTX 4090 (24 GB) o GPUs de datacenter como A100.
- En consumer GPU: sí, cabe en GPUs de gama media con al menos 8 GB de VRAM si se usa FP16.
- Opciones de despliegue: al ser compatible con Transformers, se puede servir con Hugging Face Inference Endpoints, o mediante herramientas de optimización como ONNX Runtime o TensorRT para acelerar la inferencia. No se menciona soporte explícito para vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. La latencia dependerá de la resolución de la imagen (448×448) y del hardware. En una GPU moderna, una sola imagen se procesa en decenas de milisegundos, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros visión | Parámetros texto | Embed dim | Resolución | Licencia |
|---|---|---|---|---|---|
| TIPS g/14 (este modelo) | 1.1B | 389M | 1536 | 448 | Apache 2.0 |
| TIPS L/14 | 304M | 184M | 1024 | 448 | Apache 2.0 |
| TIPS B/14 | 86M | 110M | 768 | 448 | Apache 2.0 |
| CLIP ViT-L/14 | 428M | 123M | 768 | 224 | MIT |
| SigLIP ViT-L/16 | 428M | 123M | 768 | 224 | Apache 2.0 |

La comparativa con CLIP y SigLIP se basa en características generales: ambos son modelos contrastivos visión-lenguaje con embeddings globales, pero TIPS añade tokens espaciales y un registro de entrenamiento diferente. No hay datos de benchmarks comparativos en la información disponible. La ventaja principal de TIPS es su capacidad espacial, que CLIP y SigLIP no ofrecen de forma nativa.

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento ni el proceso de filtrado, por lo que puede heredar sesgos de los datos de alt-text de web.
- La longitud máxima de texto es 64 tokens, lo que limita consultas o descripciones muy largas.
- No se especifican idiomas soportados; el rendimiento en idiomas distintos del inglés puede ser menor.
- El modelo no genera texto: es exclusivamente un encoder de visión-lenguaje. No sirve para generación de descripciones ni conversación.
- La resolución nativa es 448×448; aunque se puede interpolar, imágenes de resoluciones muy distintas pueden degradar el rendimiento.
- No se publican benchmarks oficiales en la información proporcionada, por lo que el rendimiento en tareas estándar (ImageNet, COCO, etc.) es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se basa en investigación de Google DeepMind; se recomienda revisar los términos del paper y del repositorio oficial.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/google/tipsv1-g14)
- [Página de archivos del repositorio](https://huggingface.co/google/tipsv1-g14/tree/main)
- [Repositorio oficial de Google DeepMind](https://github.com/google-deepmind/tips)
- [Paper arXiv](https://arxiv.org/abs/2410.16512)
- [Modelo TIPS v1 S/14](https://huggingface.co/google/tipsv1-s14)
- [Modelo TIPS v1 B/14](https://huggingface.co/google/tipsv1-b14)
- [Modelo TIPS v1 L/14](https://huggingface.co/google/tipsv1-l14)
- [Modelo TIPS v1 So400m/14](https://huggingface.co/google/tipsv1-so400m14)
- [Modelo TIPS v1 g/14 low-res](https://huggingface.co/google/tipsv1-g14-lowres)
