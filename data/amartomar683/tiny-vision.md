# amartomar683/tiny-vision

## Resumen

tiny-vision v1.0 es un modelo de generación de descripciones de imágenes (image captioning) y de resumen escena a escena de vídeo, desarrollado por el usuario independiente amartomar683 y publicado en Hugging Face bajo licencia Apache 2.0. Se construye sobre el codificador visual DINOv2-small de Meta (ViT-S/14 congelado, 22M de parámetros) al que se añade un adaptador MLP y un decodificador transformer ligero de 6 capas y 384 dimensiones, entrenado específicamente sobre el split Karpathy de COCO. El resultado es un modelo de solo 36M de parámetros totales (14M entrenados) que cabe en 144 MB de pesos y produce subtítulos en una sola frase corta.

Su relevancia actual reside en la eficiencia: según la model card, alcanza el 89% de la puntuación CIDEr de Florence-2-base con una sexta parte de los parámetros, siendo unas 8 veces más rápido en GPU y 75 veces más rápido en CPU. Está pensado para ejecutarse localmente en portátiles, incluso sin GPU dedicada, y para integrarse como servidor MCP (Model Context Protocol) en asistentes como Claude Desktop, Cursor o VS Code, de modo que un LLM pueda "ver" imágenes y vídeos locales sin subir nada a la nube.

El modelo declara soporte tanto de imagen como de vídeo (mediante muestreo de fotogramas y agrupación en escenas), aunque no procesa audio. Es un proyecto de autor único, sin descargas ni likes en el momento de la consulta, por lo que debe considerarse experimental y sin validación comunitaria amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador ViT-S/14 (DINOv2-small) congelado + pooling 2×2 + adaptador MLP + decodificador transformer prefix-LM de 6 capas |
| Parametros totales | 36.061.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (64 tokens visuales por fotograma; sin ventana de contexto textual declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre COCO, cuyos subtítulos están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El pipeline es: imagen o fotograma → DINOv2-small ViT-S/14 a 224 px (16×16 parches, congelado, pretrainado por Meta) → pooling promedio 2×2 que reduce a 64 tokens por fotograma, con embedding temporal seno-coseno por fotograma en vídeo → adaptador MLP de 2 capas (384 → 384) → decodificador transformer prefix-LM de 6 capas, 384 dimensiones, RMSNorm y SwiGLU, con vocabulario de 8.000 palabras y embeddings atados. De los 36M de parámetros, solo 14M se entrenan; los pesos del codificador van incluidos en `model.safetensors`, de modo que el modelo funciona completamente offline tras la descarga.

El entrenamiento se realizó sobre el split de entrenamiento Karpathy de COCO (113.000 imágenes, 566.747 subtítulos) durante 40.000 pasos con batch 64 (unas 4,5 épocas de subtítulos), optimizador AdamW (lr 3e-4, warmup 1.500 pasos, decaimiento coseno hasta 3e-5), weight decay 0.05, autocast en bfloat16 y aumento de datos random-resized-crop. Todo el entrenamiento se ejecutó en una única GPU de un Apple M5 MacBook Pro en aproximadamente 3 horas, con pérdida de validación final de 2,117. No se menciona RLHF ni DPO. La innovación principal es la congelación del codificador visual y el uso de un decodificador muy pequeño, lo que reduce drásticamente el coste computacional manteniendo una calidad de subtitulado razonable.

## Capacidades

- Generación de subtítulos de imagen en una frase corta estilo COCO (inglés).
- Descripción de vídeo escena a escena: división en planos (cortes duros y deriva lenta de cámara), subtitulado de inicio, medio y fin de cada plano, y agrupación de planos consecutivos en escenas.
- Extracción de palabras clave por escena y detección de elementos recurrentes entre escenas.
- Integración como servidor MCP con las herramientas `summarize_video`, `caption_image` y `describe_video`, usable desde Claude Desktop, Claude Code, Cursor, VS Code, LM Studio y otras aplicaciones compatibles con MCP.
- Uso por línea de comandos (`caption.py`) con opciones `--scenes` y `--summary`; el resumen textual puede delegarse a un Qwen2.5-1.5B-Instruct local.
- Decodificación greedy o beam search (beam 3 por defecto).
- Ejecución local sin subida de datos a servicios externos.
- No soporta tool calling genérico, agentes multi-paso, matemáticas, código ni audio; no procesa la banda sonora del vídeo.

## Casos de uso

- Accesibilidad de vídeo local: generar una descripción textual escena a escena de un archivo de vídeo para personas con discapacidad visual o para indexación, ejecutándose en el propio portátil sin enviar el contenido a terceros.
- Asistentes LLM con visión de archivos locales: conectar el servidor MCP a Claude Desktop o Cursor para que el asistente pueda responder preguntas del tipo "¿qué ocurre en ~/Downloads/talk.mp4?" sin que el vídeo salga del equipo.
- Etiquetado y catalogación de fototecas: procesar lotes de imágenes para generar descripciones y palabras clave que alimenten un motor de búsqueda interno o un sistema de gestión documental.
- Moderación y triaje previo en pipelines de contenido: usar los subtítulos como señal barata (54 ms por imagen en CPU) para filtrar o clasificar imágenes antes de pasarlas a un modelo mayor.
- Prototipado en entornos sin GPU: desarrollar demos de captioning en portátiles o dispositivos edge gracias a los 144 MB de pesos y al bajo consumo de memoria (1,2 GB de pico en GPU).
- Generación de metadatos para datasets: preetiquetar imágenes con descripciones cortas que luego se revisan manualmente, reduciendo el coste de anotación en proyectos de visión.
- Resumen rápido de clips de vigilancia o grabaciones domésticas: obtener una sinopsis textual de escenas con marcas de tiempo y elementos recurrentes.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre COCO Karpathy test (5.000 imágenes), con decodificación greedy y beam 3:

| Decodificacion | BLEU-4 | CIDEr |
|---|---|---|
| greedy | 0.342 | 1.145 |
| beam 3 (por defecto) | 0.351 | 1.163 |

Comparativa con otros modelos pequeños sobre las mismas 1.000 imágenes de test de COCO, mismo scorer, en Apple M5 (GPU MPS con batch 16; CPU con imagen individual):

| Modelo | Parametros | CIDEr | BLEU-4 | Img/s GPU | Memoria pico GPU | ms/img CPU |
|---|---|---|---|---|---|---|
| tiny-vision v1.0 (greedy) | 36M | 1.196 | 0.339 | 52 | 1.2 GB | 54 |
| tiny-vision v1.0 (beam 3) | 36M | 1.213 | 0.348 | 24 | 1.2 GB | 101 |
| Florence-2-base | 231M | 1.348 | 0.364 | 6.7 | 7.0 GB | 4.063 |
| Florence-2-base (beam 3) | 231M | 1.364 | 0.368 | 5.3 | 7.0 GB | 4.228 |
| SmolVLM-256M-Instruct | 256M | 0.126 | 0.051 | 0.5 | 23 GB | 55.800 |

Nota del autor: SmolVLM es un modelo conversacional que genera descripciones largas, penalizadas por las métricas de captioning, por lo que su puntuación de calidad no es una comparación justa; sus cifras de velocidad y memoria sí lo son. Florence-2 es multitarea (detección, OCR, grounding) y hace más cosas que subtitular. Las métricas se calcularon con una reimplementación en Python puro de los scorers de coco-caption, con tokenización simplificada (minúsculas y eliminación de puntuación) en lugar del tokenizador PTB, por lo que los valores se acercan pero no coinciden exactamente con los de los papers.

Evolución entre versiones (decodificación greedy):

| Version | Encoder | Datos de entrenamiento | CIDEr COCO | CIDEr Flickr30k |
|---|---|---|---|---|
| v0.1 | desde cero | Flickr8k (6k imágenes) | 0.061 | 0.131 |
| v0.2 (no publicada) | desde cero | Flickr30k (29k) | 0.121 | 0.204 |
| v1.0 | DINOv2-small congelado | COCO (113k) | 1.145 | 0.423 |

## Requisitos de hardware

- Pesos: 144 MB en safetensors; el repositorio completo ocupa 0,1 GB.
- VRAM estimada para inferencia: 1,2 GB de pico en GPU según la model card (cifra medida en MPS con batch 16).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs integradas y en Apple Silicon vía MPS.
- Funciona en CPU: 54 ms por imagen con greedy en un Apple M5; 101 ms con beam 3.
- Throughput en GPU (Apple M5, MPS, batch 16): 52 img/s con greedy y 24 img/s con beam 3.
- Opciones de despliegue: script propio `caption.py` (PyTorch), servidor MCP (`mcp_server.py`), y evaluación con `eval.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Para el resumen textual desde CLI se apoya opcionalmente en un Qwen2.5-1.5B-Instruct local, cuyos requisitos de hardware son independientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CIDEr (COCO) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-vision v1.0 | 36M | no disponible | 1.213 (beam 3) | Apache 2.0 | Hugging Face + GitHub |
| Florence-2-base | 231M | no disponible | 1.364 (beam 3) | MIT (según su model card, no verificada aquí) | Hugging Face |
| SmolVLM-256M-Instruct | 256M | no disponible | 0.126 | Apache 2.0 (según su model card, no verificada aquí) | Hugging Face |

tiny-vision destaca por ser el más pequeño y rápido de los tres, con una calidad de subtitulado claramente superior a SmolVLM-256M en métricas de captioning y cercana (89% en CIDEr) a Florence-2-base, que a cambio ofrece multitarea y mayor calidad absoluta. Los datos de licencia y contexto de los modelos comparados no se han verificado en esta ficha y deben consultarse en sus respectivas model cards.

## Limitaciones y advertencias

- Solo genera subtítulos estilo COCO: una frase corta sobre escenas cotidianas; no produce descripciones largas ni detalladas.
- Entrenado únicamente sobre COCO, cuyos subtítulos están en inglés; no se declaran idiomas soportados y es previsible un rendimiento pobre fuera del inglés.
- En vídeo, los fotogramas se subtitulan de forma independiente y no hay audio: describe lo que se ve, no lo que se dice ni cómo se mueven los objetos.
- Riesgo de alucinación y errores factuales: la propia model card muestra un ejemplo en el que el modelo describe "una mujer sentada a una mesa con una taza de café" donde la referencia humana indica "una joven inhalando para apagar una vela".
- Proyecto de autor único, con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria, sin mantenimiento garantizado y sin auditoría independiente.
- No se han documentado sesgos específicos, pero al entrenar sobre COCO hereda los sesgos de ese dataset (representación demográfica y geográfica sesgada).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; conviene revisar los términos de los componentes base (DINOv2-small de Meta, también Apache 2.0 según la model card).
- No hay información sobre cuantizaciones, por lo que el despliegue en formatos GGUF u ONNX requeriría conversión propia.
- Las métricas publicadas usan una tokenización simplificada, no directamente comparable con cifras de papers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amartomar683/tiny-vision
- Repositorio GitHub: https://github.com/amar683/tiny-vision
- Dataset de entrenamiento: https://huggingface.co/datasets/jxie/coco_captions
- Modelo base (codificador visual): https://huggingface.co/facebook/dinov2-small
