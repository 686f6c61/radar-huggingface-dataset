# amartomar683/tiny-vision-flickr8k

## Resumen

tiny-vision (Flickr8k, v0.1) es un modelo de generación de descripciones de imágenes (image captioning) de aproximadamente 23,5 millones de parámetros, entrenado desde cero sin pesos preentrenados por el usuario amartomar683. Forma parte de un proyecto personal denominado *tiny-vision*, cuyo objetivo es construir un modelo de visión de pequeño tamaño que pueda acoplarse a cualquier modelo de lenguaje, bien sea en forma de texto (descripciones y líneas de tiempo de vídeo) o, en fases posteriores, como embeddings mediante adaptadores específicos por LLM.

El modelo combina un codificador ViT de 6 capas y 384 dimensiones con parches de 16 píxeles sobre entradas de 224 píxeles, un adaptador MLP de 2 capas y un decodificador transformer de 6 capas con vocabulario a nivel de palabra de 4.461 términos. Se entrenó sobre el split de entrenamiento de Flickr8k (6.000 imágenes con 5 descripciones cada una) durante 6.000 pasos, con un mejor checkpoint en el paso 3.000 y una pérdida de validación de 2,80.

Es relevante ahora como ejemplo reproducible de entrenamiento de un pipeline completo de visión-lenguaje desde cero en hardware de consumo (Apple M5, aproximadamente 42 minutos), y por su empaquetado como servidor MCP con herramientas `caption_image` y `describe_video`. No obstante, el propio autor lo etiqueta como experimental: describe razonablemente el tipo de escena pero a menudo falla en el sujeto principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (encoder) + MLP adapter + transformer prefix-LM (decoder) |
| Parametros totales | 23.563.392 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (decoder con vocabulario a nivel de palabra; sin contexto declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El codificador visual es un ViT con entrada de 224 píxeles, parches de 16 píxeles, dimensión 384, 6 capas y 6 cabezas de atención, con RMSNorm y SwiGLU, posiciones 2D seno-coseno fijas y pooling 2×2 de tokens que reduce la secuencia a 49 tokens por fotograma. Un adaptador MLP de 2 capas (384 → 384) conecta el codificador con un decodificador transformer prefix-LM de 6 capas, 384 dimensiones y vocabulario a nivel de palabra de 4.461 términos con embeddings atados. Para vídeo, los fotogramas se muestrean a lo largo del tiempo, se describen individualmente y se fusionan en una línea de tiempo con marcas temporales.

El entrenamiento se realizó íntegramente desde cero sobre el split de entrenamiento de Flickr8k (6.000 imágenes × 5 descripciones), durante 6.000 pasos con batch de 64, AdamW (lr 3e-4, scheduler coseno), autocast en bfloat16 y una GPU Apple M5, en aproximadamente 42 minutos. El mejor checkpoint fue el paso 3.000, con pérdida de validación de 2,80; los pasos posteriores mostraron sobreajuste. No se documenta uso de RLHF, DPO ni datos adicionales.

## Capacidades

- Generación de descripciones de imágenes en inglés a partir de fotografías de 224 píxeles.
- Descripción de vídeo mediante muestreo de fotogramas y fusión en una línea de tiempo con marcas temporales.
- Reconocimiento aproximado del tipo de escena (nieve, hierba, agua, exteriores).
- Empaquetado como servidor MCP con las herramientas `caption_image` y `describe_video`, utilizable desde clientes MCP.
- Interfaz de línea de comandos (`caption.py`) con opciones como `--every` para el muestreo de fotogramas en vídeo.
- No dispone de tool calling genérico, razonamiento multi-paso, matemáticas, código ni capacidades de audio.
- Capacidad multilingüe limitada al inglés; las palabras fuera del vocabulario se sustituyen por `<unk>`.

## Casos de uso

- Prototipado rápido de pipelines de image captioning: al ocupar apenas 0,1 GB y requerir recursos mínimos, sirve para validar la integración de un componente de visión-lenguaje antes de invertir en modelos mayores.
- Etiquetado exploratorio de escenas exteriores: útil para clasificar de forma aproximada fotografías de nieve, hierba o agua en conjuntos de datos de investigación, tratando las salidas como pistas preliminares que requieren revisión humana.
- Generación de líneas de tiempo de vídeo: mediante `describe_video` y el muestreo de fotogramas cada N segundos, permite obtener un resumen textual con marcas temporales de clips, útil para indexación preliminar de archivos audiovisuales.
- Integración en agentes vía MCP: clientes compatibles con Model Context Protocol pueden invocar `caption_image` y `describe_video` para dotar a un agente de una capacidad básica de percepción visual sin depender de APIs externas.
- Docencia y experimentación en entrenamiento desde cero: el modelo sirve como caso de estudio reproducible de un pipeline ViT + decoder entrenado en hardware de consumo (Apple M5, 42 minutos), con hiperparámetros y curvas de pérdida documentados.
- Pruebas de regresión de infraestructura de inferencia: por su tamaño reducido, es adecuado para validar despliegues de PyTorch, servidores MCP o entornos de CI sin coste de GPU significativo.
- Generación de texto alternativo aproximado en herramientas internas: para imágenes de escenas exteriores, puede producir una primera versión de descripción que un humano corrija después.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de validación del mejor checkpoint (2,80 en el paso 3.000) y una tabla cualitativa de ejemplos de salida frente a referencias humanas, sin métricas estándar como BLEU, CIDEr, METEOR o SPICE.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 23,5 millones de parámetros en fp32 el modelo ocupa aproximadamente 94 MB, y en bfloat16 unos 47 MB, a lo que se suma el coste de activaciones del ViT para una imagen de 224 píxeles (del orden de cientos de MB en total).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor lo entrenó en una Apple M5, lo que indica que la inferencia funciona también en Apple Silicon.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para uso esporádico.
- Opciones de despliegue: PyTorch nativo mediante el script `caption.py` del repositorio, y servidor MCP (`mcp_server.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-vision-flickr8k | 23,5 M | no disponible | Desde cero, Flickr8k (6.000 imágenes) | Apache-2.0 | Hugging Face, 0 descargas |
| BLIP (base) | ~224 M | no disponible | Preentrenado + fine-tuning | BSD-3-Clause (variante) | Hugging Face, ampliamente usado |
| ViT-GPT2 image captioning | ~100-150 M | no disponible | Preentrenado + fine-tuning sobre COCO | Apache-2.0 | Hugging Face, muy usado |
| GIT (base) | ~177 M | no disponible | Preentrenado + fine-tuning | MIT | Hugging Face |

La comparación debe interpretarse con cautela: los tres modelos alternativos parten de pesos preentrenados y se ajustan sobre COCO (118.000 imágenes), mientras que tiny-vision se entrena desde cero sobre 6.000 imágenes, lo que explica en gran medida sus limitaciones cualitativas. No se dispone de métricas comparables publicadas para tiny-vision.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor: con solo 6.000 imágenes de entrenamiento, frecuentemente identifica mal el sujeto principal.
- Tendencia a recurrir a frases comunes del corpus ("a man in a blue shirt", "a dog jumps over a hurdle") en lugar de describir el contenido real.
- Contenido fuera de la distribución de Flickr8k (interiores, comida, texto, capturas de pantalla, animales distintos de perros) produce descripciones seguras pero incorrectas.
- Solo inglés y vocabulario a nivel de palabra: cualquier término desconocido se convierte en `<unk>`.
- En vídeo, los fotogramas se describen de forma independiente, sin comprensión del movimiento ni de la continuidad temporal.
- Riesgo elevado de alucinación en la descripción de escenas no vistas durante el entrenamiento.
- Licencia Apache-2.0 para código y pesos, pero el dataset Flickr8k procede de Flickr y se recopiló para uso en investigación: debe revisarse sus términos antes de cualquier uso comercial.
- Sin métricas de benchmarks publicadas, por lo que no es posible cuantificar su calidad frente a alternativas.
- Sin descargas ni likes en Hugging Face en el momento de la consulta: no hay validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amartomar683/tiny-vision-flickr8k
- Dataset Flickr8k: https://huggingface.co/datasets/jxie/flickr8k
- Repositorio de código (referenciado en la model card, pendiente de URL definitiva): https://github.com/YOUR-GITHUB-USERNAME/tiny-vision
