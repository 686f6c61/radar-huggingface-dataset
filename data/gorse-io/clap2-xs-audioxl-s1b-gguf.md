# gorse-io/clap2-xs-audioxl-s1B-GGUF

## Resumen

CLAP2-XS es un modelo contrastivo audio-texto de tipo CLAP (Contrastive Language-Audio Pretraining) desarrollado por LAION y distribuido en este repositorio por gorse-io en formato GGUF. Con 48,3 millones de parametros en total (sumando torre de audio y torre de texto), es el segundo modelo mas pequeno de la familia CLAP2, que abarca cinco tamanos entre 27M y 340M de parametros. El modelo proyecta clips de audio y descripciones textuales en ingles a un espacio de embeddings compartido, lo que permite tareas de recuperacion audio-texto, clasificacion zero-shot de audio y extraccion de caracteristicas.

La relevancia de este repositorio concreto reside en su formato: es una conversion a GGUF del modelo original `laion/clap2-xs-audioxl-s1B`, pensada para ejecutarse con `clap.cpp`, una implementacion en C++ que permite inferencia sin dependencias de PyTorch. Esto lo hace atractivo para despliegues ligeros, entornos con recursos limitados y pipelines de curacion de datos a gran escala donde el coste computacional por muestra es critico.

El modelo fue entrenado desde cero sobre LAION-Audio-XL, un corpus de 366 millones de pares audio-texto, y su torre de audio emplea un transformer de vision NaFlex sobre parches de log-mel, lo que le permite procesar audio de longitud variable sin recorte ni padding a una longitud fija. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contrastiva audio-texto (dos torres); torre de audio NaFlex ViT sobre parches de log-mel, torre de texto transformer |
| Parametros totales | 48.307.585 (48,3M, ambas torres) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Audio: longitud variable, entrenado con clips de hasta 30 s; texto: 256 tokens (BPE estilo GPT-2) |
| Tipos de cuantizacion | GGUF (el repositorio incluye al menos f16; otras variantes no confirmadas) |
| Idiomas soportados | Ingles (texto); audio independiente del idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base original |

## Arquitectura y entrenamiento

CLAP2-XS sigue una arquitectura de dos torres entrenadas de forma contrastiva. La torre de audio es un transformer de vision NaFlex que opera sobre un espectrograma log-mel de 128 bins (50 Hz a 16 kHz, hop de 320 muestras), dividido en parches no solapados de 16x16, lo que produce 50 tokens por segundo de audio. Esta formulacion permite aceptar audio de cualquier duracion y cualquier frecuencia de muestreo o numero de canales (el preprocesado promedia a mono y remuestrea a 32 kHz), generando un unico embedding por clip. La torre de texto es un transformer con tokenizador BPE estilo GPT-2 y contexto de 256 tokens. Ambas torres se proyectan a un espacio compartido mediante perdida contrastiva.

El entrenamiento se realizo desde cero sobre LAION-Audio-XL (366 millones de pares audio-texto), con 1.024 millones de muestras vistas y un schedule de learning rate WSD (warmup-stable-decay), tomando el ultimo checkpoint. Los clips de entrenamiento se organizaron en buckets de longitud de 6,9, 9,0, 13,0, 22,6 y 30,1 segundos. El entrenamiento uso autocast en bf16, aunque la inferencia publicada se realiza en float32. Una innovacion destacable es el uso de `patch_valid` para enmascarar el padding en lotes de clips de distinta longitud, garantizando que los embeddings por lote coincidan con los obtenidos clip a clip.

## Capacidades

- Recuperacion audio-texto: busqueda de clips por descripcion textual y viceversa mediante similitud en el espacio de embeddings.
- Clasificacion zero-shot de audio: asignacion de etiquetas a clips sin entrenamiento especifico, describiendo cada clase con varias frases.
- Extraccion de embeddings de audio: representaciones normalizadas utilizables como caracteristicas para clasificadores posteriores.
- Extraccion de embeddings de texto: codificacion de descripciones en ingles al mismo espacio latente.
- Procesamiento de audio de longitud variable: sin recorte ni padding a tamano fijo, con enmascaramiento de padding en lotes.
- Manejo de audio multicanal y multiples frecuencias de muestreo mediante preprocesado integrado.
- No soporta tool calling, function calling, agentes ni generacion de texto: es un modelo de embeddings, no un modelo generativo.
- Capacidad multilingue limitada al ingles en la torre de texto.

## Casos de uso

- Etiquetado automatico de archivos de audio: clasificar grabaciones de campo, efectos de sonido o musica en categorias predefinidas mediante prompts textuales, sin necesidad de entrenar un clasificador especifico.
- Curacion de datasets audio-texto: filtrar pares de baja calidad calculando la similitud entre audio y su caption, descartando aquellos por debajo de un umbral, tal como sugiere el autor en la model card.
- Busqueda semantica en bibliotecas de audio: indexar los embeddings de una fonoteca y permitir consultas en lenguaje natural ("un cello tocando una melodia lenta") para recuperar los clips mas similares.
- Deteccion de eventos sonoros en produccion: segmentar grabaciones largas en ventanas de hasta 30 s, calcular embeddings por segmento y clasificar eventos como ladridos, lluvia o aplausos en pipelines de monitorizacion.
- Moderacion de contenido audiovisual: identificar automaticamente categorias de audio sensibles o no deseadas en plataformas que procesan grandes volumenes de video.
- Clasificacion de generos musicales y ambientes: usar los embeddings como caracteristicas de entrada para clasificadores ligeros de musica o paisajes sonoros en sistemas de recomendacion.
- Despliegue en entornos con recursos limitados: al estar en GGUF y ejecutarse con `clap.cpp`, puede integrarse en servicios sin PyTorch, con huella de memoria reducida y bajo coste por inferencia.

## Benchmarks y rendimiento

Resultados publicados por el autor (porcentajes, mayor es mejor), correspondientes al modelo base original:

| Modelo | Parametros | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|
| CLAP2-L | 340,1M | 53,6 | 81,9 | 30,3 |
| CLAP2-M | 152,8M | 52,3 | 81,4 | 29,4 |
| CLAP2-S | 103,9M | 51,8 | 81,8 | 29,8 |
| **CLAP2-XS** | **48,3M** | **49,1** | **80,6** | **27,6** |
| CLAP2-XXS | 27,3M | 46,2 | 79,1 | 28,0 |

MAEB-30 es la media sobre 30 tareas del Massive Audio Embedding Benchmark (habla, musica y sonido; clasificacion, zero-shot, pair classification, clustering y retrieval). HEAR-17 es la media sobre 17 tareas HEAR. MSEB es la media sobre 62 puntuaciones MSEB en ingles. El protocolo exacto y las comparaciones con otros modelos audio-texto estan en el paper (arXiv:2611.11592).

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en f16 (48,3M de parametros, aproximadamente 97 MB de pesos, mas overhead de activaciones y espectrograma). En float32, en torno a 200 MB de pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en tarjetas consumer como RTX 3060, RTX 4090 o incluso en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 1-2 GB de memoria; tambien es viable en CPU.
- Opciones de despliegue: `clap.cpp` (formato GGUF, recomendado por el autor), `open_clip_torch` con el modelo original en safetensors, y Transformers para el modelo base.
- Latencia y throughput: no se han publicado cifras concretas en la informacion disponible. El coste crece de forma cuadratica con la longitud del audio debido a la atencion completa, por lo que se recomienda segmentar en ventanas de hasta 30 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | MAEB-30 | Licencia | Formato |
|---|---|---|---|---|---|
| CLAP2-XS (este) | 48,3M | Variable, entrenado hasta 30 s | 49,1 | Apache 2.0 | GGUF / safetensors |
| CLAP2-XXS | 27,3M | Variable, entrenado hasta 30 s | 46,2 | Apache 2.0 | safetensors |
| CLAP2-S | 103,9M | Variable, entrenado hasta 30 s | 51,8 | Apache 2.0 | safetensors |
| CLAP2-M | 152,8M | Variable, entrenado hasta 30 s | 52,3 | Apache 2.0 | safetensors |

La familia CLAP2 ofrece un compromiso claro entre tamano y rendimiento: XS mejora a XXS en MAEB-30 (49,1 frente a 46,2) con un 77% mas de parametros, mientras que S y M anaden entre 2,7 y 3,2 puntos adicionales a costa de duplicar o triplicar el tamano. La ventaja especifica de este repositorio frente a los originales de LAION es la disponibilidad en GGUF para `clap.cpp`, lo que reduce dependencias y facilita el despliegue.

## Limitaciones y advertencias

- La torre de texto solo procesa ingles; captions en otros idiomas degradaran la calidad de los embeddings.
- El tokenizador es sensible a mayusculas: textos integramente en mayusculas se tokenizan en piezas raras y puntuan peor. El paper recomienda pasar a minusculas los textos que sean todo mayusculas y tengan al menos tres palabras.
- Aunque acepta audio de cualquier duracion, solo se ha evaluado con clips de hasta 30 s; para grabaciones largas conviene segmentar y promediar o comparar embeddings.
- El coste computacional crece de forma cuadratica con la longitud del audio por el uso de atencion completa.
- Riesgo de alucinacion en el sentido de asignaciones erroneas en clasificacion zero-shot cuando las clases son ambiguas o los prompts son etiquetas escuetas; el autor recomienda frases completas, evitar negaciones y promediar varios prompts por clase.
- No es un modelo generativo: no produce texto, codigo ni razonamiento; su uso esta acotado a embeddings y similitud.
- No se han publicado evaluaciones especificas de sesgos en la informacion disponible; al entrenarse sobre datos web a gran escala, puede heredar sesgos de LAION-Audio-XL.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del corpus de entrenamiento para usos sensibles.
- El repositorio tiene un volumen de descargas bajo (174) y ninguna valoracion, por lo que la validacion comunitaria es limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gorse-io/clap2-xs-audioxl-s1B-GGUF
- Modelo base original: https://huggingface.co/laion/clap2-xs-audioxl-s1B
- Paper: https://arxiv.org/abs/2611.11592
- Codigo: https://github.com/LAION-AI/clap2
- Pagina del proyecto: https://projects.laion.ai/clap2/
- Implementacion clap.cpp: https://github.com/gorse-io/clap.cpp
- Modelos relacionados: https://huggingface.co/laion/clap2-large-audioxl-s1B, https://huggingface.co/laion/clap2-medium-audioxl-s1B, https://huggingface.co/laion/clap2-small-audioxl-s1B, https://huggingface.co/laion/clap2-xxs-audioxl-s1B
