# laion/clap2-xs-audioxl-s1B

## Resumen

CLAP2-XS es un modelo contrastivo audio-texto de tipo CLAP (Contrastive Language-Audio Pre-training) desarrollado por LAION. Forma parte de una familia de cinco modelos CLAP2 (de 27M a 340M parametros) que proyectan clips de audio y descripciones textuales en ingles a un espacio de embeddings compartido, lo que permite tareas de clasificacion zero-shot, recuperacion audio-texto y extraccion de caracteristicas de audio. Este modelo concreto, con 48,3M de parametros en total entre ambas torres, es la segunda variante mas pequena de la familia y esta disenada para ser barata de ejecutar.

La arquitectura combina una torre de audio basada en un vision transformer NaFlex que opera sobre parches de espectrograma log-mel (sin recorte ni padding a longitud fija) y una torre de texto con tokenizador BPE estilo GPT-2. Todos los modelos CLAP2 se entrenaron desde cero sobre LAION-Audio-XL, un corpus de 366M de pares audio-texto, durante 1.024M de muestras vistas con un schedule de learning rate WSD. El modelo se distribuye en formato OpenCLIP y Transformers, con pesos en safetensors.

Su relevancia radica en que ofrece capacidades de representacion audio-texto con un coste computacional muy bajo (48M de parametros, repo de 0,6 GB), lo que lo hace adecuado para pipelines de curacion de datos a gran escala, prototipado rapido y despliegue en hardware modesto, manteniendo un rendimiento cercano al de variantes mas grandes de la misma familia en benchmarks como HEAR-17.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contrastiva audio-texto de dos torres; torre de audio NaFlex vision transformer sobre parches de log-mel; torre de texto transformer con tokenizador BPE |
| Parametros totales | 48.307.584 (ambas torres) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Audio: clips de hasta 30 s en entrenamiento (50 tokens/s de audio); texto: 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; entrenamiento con autocast bf16) |
| Idiomas soportados | Ingles (solo texto; el corpus contiene habla en varios idiomas pero la torre de texto es solo ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria open_clip) |

## Arquitectura y entrenamiento

CLAP2-XS sigue un diseno de dos torres entrenadas de forma contrastiva. La torre de audio es un vision transformer NaFlex que procesa parches de un espectrograma log-mel de 128 bins (50 Hz a 16 kHz, hop de 320 muestras) cortado en parches no solapados de 16x16, lo que produce 50 tokens por segundo de audio. El front-end acepta audio de cualquier frecuencia de muestreo y numero de canales: el preprocesado promedia a mono y remuestrea a 32 kHz. La torre de texto emplea un tokenizador BPE estilo GPT-2 sensible a mayusculas con contexto de 256 tokens. Ambas torres se usan en float32 en la publicacion, aunque el entrenamiento empleo autocast bf16.

El entrenamiento se realizo desde cero sobre LAION-Audio-XL (366M de pares audio-texto) durante 1.024M de muestras vistas, con schedule de learning rate WSD y evaluando el ultimo checkpoint. Los clips de entrenamiento se organizaron en buckets de longitud de 6,9, 9,0, 13,0, 22,6 y 30,1 s, con un maximo de 30 s. La innovacion principal es la capacidad de procesar audio de longitud variable sin recorte ni padding fijo, generando un unico embedding por clip y permitiendo batching mediante padding de los diccionarios de parches con mascara `patch_valid`.

## Capacidades

- Clasificacion zero-shot de audio: asignar etiquetas textuales a clips sin entrenamiento especifico, describiendo cada clase con varias frases cortas.
- Recuperacion audio-texto (audio-text retrieval): buscar clips por descripcion textual y viceversa en un espacio de embeddings compartido.
- Extraccion de embeddings de audio y de texto normalizados (`encode_audio` y `encode_text`), utilizables como features para clasificadores downstream.
- Procesamiento de audio de longitud variable y de cualquier frecuencia de muestreo o numero de canales.
- Manejo de clips de hasta 30 s (longitudes mayores aceptadas pero no evaluadas).
- Capacidades de representacion sobre habla, musica y sonidos ambientales (las tareas de MAEB-30 y HEAR-17 cubren estas tres dominios).
- No soporta tool calling, function calling, agentes ni generacion de texto: es un modelo de embeddings, no un modelo generativo.

## Casos de uso

- Curacion y filtrado de datasets de audio a gran escala: usar los embeddings para ordenar o filtrar clips por consultas textuales (por ejemplo, descartar grabaciones sin habla o aislar clips musicales) aprovechando el bajo coste de 48M de parametros.
- Etiquetado automatico de archivos de audio: clasificacion zero-shot de sonidos ambientales, eventos acusticos o generos musicales describiendo cada clase con varias frases, sin necesidad de reentrenar.
- Busqueda semantica en archivos de audio: indexar los embeddings de una fonoteca y recuperar clips mediante consultas en lenguaje natural en ingles.
- Preprocesado para pipelines de ML: generar features de audio para alimentar clasificadores ligeros downstream en lugar de entrenar un encoder desde cero.
- Moderacion y monitorizacion de contenido sonoro: detectar categorias de audio (por ejemplo, gritos, musica con derechos, ruido) mediante similitud con prompts textuales, con coste de inferencia minimo.
- Prototipado rapido en entornos con recursos limitados: al ocupar 0,6 GB y 48M de parametros, permite iterar en CPU o GPU de gama baja antes de escalar a las variantes M o L de la familia.
- Segmentacion de grabaciones largas: dividir audio en segmentos de hasta 30 s, calcular embeddings por segmento y compararlos para localizar eventos concretos.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes, mayor es mejor):

| Modelo | Parametros | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|
| CLAP2-L | 340,1M | 53,6 | 81,9 | 30,3 |
| CLAP2-M | 152,8M | 52,3 | 81,4 | 29,4 |
| CLAP2-S | 103,9M | 51,8 | 81,8 | 29,8 |
| **CLAP2-XS** | **48,3M** | **49,1** | **80,6** | **27,6** |
| CLAP2-XXS | 27,3M | 46,2 | 79,1 | 28,0 |

MAEB-30 es la media sobre 30 tareas del Massive Audio Embedding Benchmark (clasificacion, zero-shot, pair classification, clustering y retrieval sobre habla, musica y sonido). HEAR-17 es la media sobre 17 tareas HEAR (todas excepto Beehive y Maestro 5h). MSEB es la media sobre 62 puntuaciones MSEB en ingles. No se han publicado en la informacion disponible resultados detallados por tarea ni comparaciones numericas con modelos de otros autores.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 para los 48,3M de parametros; el repo completo ocupa 0,6 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para lotes pequenos.
- GPU recomendadas: no requiere GPU de datacenter; A100 o H100 solo serian utiles para procesar lotes masivos en paralelo.
- Opciones de despliegue: `open_clip_torch` >= 4.2.1 con `soundfile`; tambien disponible en formato Transformers segun la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste computacional crece de forma cuadratica con la longitud del audio debido a la atencion completa, por lo que se recomienda segmentar en clips de hasta 30 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | MAEB-30 | HEAR-17 | Licencia |
|---|---|---|---|---|---|
| CLAP2-XS (este) | 48,3M | hasta 30 s evaluado | 49,1 | 80,6 | Apache 2.0 |
| CLAP2-XXS | 27,3M | hasta 30 s evaluado | 46,2 | 79,1 | Apache 2.0 |
| CLAP2-S | 103,9M | hasta 30 s evaluado | 51,8 | 81,8 | Apache 2.0 |
| CLAP2-M | 152,8M | hasta 30 s evaluado | 52,3 | 81,4 | Apache 2.0 |
| CLAP2-L | 340,1M | hasta 30 s evaluado | 53,6 | 81,9 | Apache 2.0 |

La comparacion con modelos CLAP de otros autores (por ejemplo, LAION-CLAP original) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La torre de texto solo acepta ingles; el corpus de entrenamiento contiene habla en varios idiomas, pero el modelo no esta evaluado para recuperacion o clasificacion en otras lenguas.
- El tokenizador es sensible a mayusculas: el texto todo en mayusculas se tokeniza en piezas raras y puntua peor. La evaluacion del paper pasa a minusculas el texto si esta todo en mayusculas y tiene al menos tres palabras.
- Riesgo de alucinacion en el sentido de asignaciones erroneas de similitud: al ser un modelo contrastivo, puede producir puntuaciones altas para descripciones incorrectas si el prompt no cubre bien la clase. Se recomienda usar varias frases por clase, evitar etiquetas desnudas y negaciones, y restar la puntuacion media de cada clase antes de elegir la mejor.
- Los clips de mas de 30 s se aceptan pero no estan evaluados; el coste crece de forma cuadratica con la longitud por la atencion completa.
- No es un modelo generativo: no produce texto, codigo ni razonamiento, y no soporta tool calling ni agentes.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del corpus LAION-Audio-XL para usos derivados.
- Pesos publicados en float32; no se documentan cuantizaciones oficiales (GGUF, int8, etc.).

## Enlaces

- Hugging Face: https://huggingface.co/laion/clap2-xs-audioxl-s1B
- Paper: https://arxiv.org/abs/2611.11592
- Codigo: https://github.com/LAION-AI/clap2
- Pagina del proyecto: https://projects.laion.ai/clap2/
- Modelo CLAP2-XXS: https://huggingface.co/laion/clap2-xxs-audioxl-s1B
- Modelo CLAP2-S: https://huggingface.co/laion/clap2-small-audioxl-s1B
- Modelo CLAP2-M: https://huggingface.co/laion/clap2-medium-audioxl-s1B
- Modelo CLAP2-L: https://huggingface.co/laion/clap2-large-audioxl-s1B
