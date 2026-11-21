# laion/clap2-medium-audioxl-s1B

## Resumen

CLAP2-M es un modelo contrastivo audio-texto desarrollado por LAION que proyecta clips de audio y descripciones textuales en ingles a un espacio de embeddings compartido. Forma parte de la familia CLAP2, compuesta por cinco variantes (de 27M a 340M parametros), y se distribuye tanto en formato OpenCLIP como en Transformers. Con 152,8 millones de parametros totales (suma de las dos torres), se posiciona como la variante intermedia de la familia, ofreciendo un equilibrio entre coste computacional y calidad de representacion.

El modelo resuelve tareas de recuperacion audio-texto, clasificacion zero-shot de audio y extraccion de embeddings de audio para clasificadores posteriores. Su torre de audio es un transformer de vision NaFlex que opera sobre parches de espectrograma log-mel, lo que le permite aceptar audio de cualquier duracion sin recortes ni padding a una longitud fija, generando un unico embedding por clip.

Es relevante porque se entrena desde cero sobre LAION-Audio-XL, un corpus de 366 millones de pares audio-texto, y porque su rendimiento en los benchmarks MAEB-30, HEAR-17 y MSEB es competitivo con modelos mas grandes de la misma familia. La licencia Apache 2.0 facilita su adopcion en entornos comerciales y de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos torres (audio + texto); torre de audio NaFlex ViT sobre parches log-mel |
| Parametros totales | 152.766.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Audio: clips de hasta 30 s entrenados (acepta mas, no evaluado); texto: 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en float32 en el ejemplo; entrenamiento con autocast bf16) |
| Idiomas soportados | Ingles (texto); audio de habla en multiples idiomas segun el corpus, pero la torre de texto solo procesa ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,8 GB), compatible con OpenCLIP y Transformers |

## Arquitectura y entrenamiento

CLAP2-M sigue una arquitectura contrastiva de dos torres. La torre de audio es un transformer de vision NaFlex que procesa espectrogramas log-mel de 128 bins (50 Hz a 16 kHz, hop de 320 muestras), cortados en parches no solapados de 16x16, lo que produce 50 tokens por segundo de audio. La torre de texto emplea un tokenizador BPE estilo GPT-2 con contexto de 256 tokens. Ambas torres se entrenan para alinear sus embeddings mediante una perdida contrastiva.

El entrenamiento se realizo desde cero sobre LAION-Audio-XL (366 millones de pares audio-texto), con 1.024 millones de muestras vistas y un schedule de learning rate WSD (warmup-stable-decay), tomando el ultimo checkpoint. Los clips de entrenamiento se agruparon en buckets de longitud de 6,9, 9,0, 13,0, 22,6 y 30,1 segundos. No se menciona el uso de RLHF ni DPO; el objetivo es puramente contrastivo.

## Capacidades

- Recuperacion audio-texto: dado un clip, recuperar las descripciones textuales mas probables, y viceversa.
- Clasificacion zero-shot de audio: asignar etiquetas a clips usando prompts textuales en lenguaje natural.
- Extraccion de embeddings de audio: representaciones vectoriales por clip para clasificadores downstream.
- Extraccion de embeddings de texto: representaciones vectoriales de descripciones en ingles.
- Procesamiento de audio de duracion variable: acepta cualquier sample rate y numero de canales (se promedia a mono y se remuestrea a 32 kHz).
- Procesamiento por lotes con padding enmascarado (`patch_valid`), que preserva la equivalencia con la codificacion individual.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto; es un modelo de representacion, no generativo.
- Capacidades multilingues limitadas: la torre de texto solo procesa ingles.

## Casos de uso

- Etiquetado automatico de archivos de audio: clasificar clips de efectos de sonido, musica o habla en categorias predefinidas mediante prompts textuales, sin necesidad de entrenar un clasificador especifico.
- Curacion de datasets de audio: filtrar o rankear grandes colecciones de audio por consultas textuales (por ejemplo, "un perro ladra" o "lluvia sobre un tejado") usando similitud de embeddings.
- Busqueda semantica en archivos multimedia: indexar los embeddings de audio de una videoteca y permitir busquedas por descripcion textual en lenguaje natural.
- Clasificacion de eventos sonoros en entornos urbanos o industriales: usar los embeddings como features para un clasificador ligero entrenado con pocas muestras etiquetadas.
- Deteccion de contenido en plataformas: identificar musica, habla o efectos concretos en subidas de usuarios para moderacion o catalogacion automatica.
- Analisis de grabaciones de campo para bioacustica: segmentar grabaciones largas en ventanas de hasta 30 s y comparar embeddings para detectar especies o patrones acusticos.
- Sistemas de recomendacion musical o de podcasts: representar clips y descripciones en un espacio comun para sugerir contenido similar a partir de consultas textuales.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes, mayor es mejor):

| Modelo | Parametros | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|
| CLAP2-L | 340,1M | 53,6 | 81,9 | 30,3 |
| **CLAP2-M** | **152,8M** | **52,3** | **81,4** | **29,4** |
| CLAP2-S | 103,9M | 51,8 | 81,8 | 29,8 |
| CLAP2-XS | 48,3M | 49,1 | 80,6 | 27,6 |
| CLAP2-XXS | 27,3M | 46,2 | 79,1 | 28,0 |

MAEB-30 es la media sobre 30 tareas del Massive Audio Embedding Benchmark (habla, musica y sonido; clasificacion, zero-shot, pair classification, clustering y retrieval). HEAR-17 es la media sobre 17 tareas HEAR (todas excepto Beehive y Maestro 5h). MSEB es la media sobre 62 puntuaciones MSEB en ingles. Los resultados se calculan usando solo los primeros 30 s de cada clip.

## Requisitos de hardware

- VRAM estimada para inferencia: con 152,8M parametros en float32, los pesos ocupan aproximadamente 611 MB; sumando activaciones y buffers, se puede ejecutar con comodidad en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o procesamiento por lotes de clips de 30 s, se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en practicamente todas las GPUs con al menos 4 GB de VRAM.
- Opciones de despliegue: OpenCLIP (`open_clip_torch>=4.2.1`) y Transformers; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de embeddings).
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste crece de forma cuadratica con la longitud del audio debido a la atencion completa, por lo que se recomienda segmentar grabaciones largas en ventanas de hasta 30 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Licencia | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|---|---|
| CLAP2-M | 152,8M | hasta 30 s (entrenado) | Apache 2.0 | 52,3 | 81,4 | 29,4 |
| CLAP2-L | 340,1M | hasta 30 s (entrenado) | Apache 2.0 | 53,6 | 81,9 | 30,3 |
| CLAP2-S | 103,9M | hasta 30 s (entrenado) | Apache 2.0 | 51,8 | 81,8 | 29,8 |
| CLAP2-XS | 48,3M | hasta 30 s (entrenado) | Apache 2.0 | 49,1 | 80,6 | 27,6 |

No se dispone de datos de benchmarks de otros modelos audio-texto comparables en la informacion proporcionada. La model card remite al paper (arXiv:2611.11592) para comparaciones con otros modelos audio-texto.

## Limitaciones y advertencias

- La torre de texto solo procesa ingles; el corpus contiene habla en varios idiomas, pero las consultas y descripciones deben escribirse en ingles.
- El tokenizador distingue mayusculas y minusculas; los textos escritos integramente en mayusculas se tokenizan en piezas raras y obtienen peores puntuaciones. Se recomienda escribir en minusculas o convertir a minusculas los textos en mayusculas de al menos tres palabras.
- Riesgo de alucinacion en el sentido de asignaciones erroneas: la clasificacion zero-shot puede producir puntuaciones altas para clases incorrectas si los prompts no cubren bien las variantes del sonido.
- Se recomienda usar varias descripciones por clase en frases completas, evitar etiquetas escuetas y negaciones, promediar los embeddings de los prompts y restar la puntuacion media de cada clase antes de elegir la clase top.
- Los clips de mas de 30 s no estan evaluados; el coste crece de forma cuadratica con la longitud, por lo que conviene segmentar y agregar embeddings.
- Los pesos se distribuyen en float32; no se documentan cuantizaciones oficiales.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones del corpus de entrenamiento y de las licencias de los datos de audio que procese.

## Enlaces

- Hugging Face: https://huggingface.co/laion/clap2-medium-audioxl-s1B
- Paper: https://arxiv.org/abs/2611.11592
- Codigo: https://github.com/LAION-AI/clap2
- Pagina del proyecto: https://projects.laion.ai/clap2/
- Modelo CLAP2-L: https://huggingface.co/laion/clap2-large-audioxl-s1B
- Modelo CLAP2-S: https://huggingface.co/laion/clap2-small-audioxl-s1B
- Modelo CLAP2-XS: https://huggingface.co/laion/clap2-xs-audioxl-s1B
- Modelo CLAP2-XXS: https://huggingface.co/laion/clap2-xxs-audioxl-s1B
