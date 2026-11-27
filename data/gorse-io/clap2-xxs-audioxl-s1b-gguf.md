# gorse-io/clap2-xxs-audioxl-s1B-GGUF

## Resumen

CLAP2-XXS es un modelo contrastivo audio-texto de 27,3 millones de parámetros (sumando ambas torres: audio y texto) desarrollado por LAION como parte de la familia CLAP2, que abarca cinco tamanos entre 27M y 340M de parámetros. El modelo mapea clips de audio y descripciones textuales en inglés a un espacio de embeddings compartido, lo que permite tareas de clasificación zero-shot de audio, recuperación audio-texto y extracción de características de audio para clasificadores posteriores. Esta versión concreta, publicada por gorse-io, es una conversión a formato GGUF del checkpoint original `laion/clap2-xxs-audioxl-s1B`, pensada para su uso con el runtime clap.cpp.

La relevancia de esta ficha radica en dos factores. Primero, CLAP2 se entrena desde cero sobre LAION-Audio-XL, un corpus de 366 millones de pares audio-texto, lo que lo convierte en una referencia abierta para tareas de audio en inglés. Segundo, la disponibilidad en GGUF facilita el despliegue en entornos sin GPU o con recursos limitados, algo poco habitual en modelos de audio-texto, que suelen depender de PyTorch y CUDA.

La torre de audio emplea un vision transformer NaFlex que opera sobre parches de log-mel y acepta audio de cualquier duración sin recorte ni padding a una longitud fija. El contexto textual está limitado a 256 tokens con tokenizador BPE estilo GPT-2. La licencia es Apache 2.0 y el repo pesa 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contrastiva audio-texto de dos torres; torre de audio: vision transformer NaFlex sobre parches de log-mel; torre de texto: transformer con tokenizador BPE estilo GPT-2 |
| Parametros totales | 27.293.041 (ambas torres) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Texto: 256 tokens. Audio: sin limite fijo de duracion; entrenado con clips de hasta 30 s; coste cuadratico con la longitud (atencion completa) |
| Tipos de cuantizacion | GGUF (el repo incluye al menos una variante f16; no se detallan otras en la informacion disponible) |
| Idiomas soportados | Inglés (torre de texto); el audio no tiene restriccion de idioma declarada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el modelo base se distribuye en formato OpenCLIP y Transformers |

## Arquitectura y entrenamiento

CLAP2-XXS sigue un diseno de dos torres con objetivo contrastivo. La torre de audio es un vision transformer NaFlex que procesa un espectrograma log-mel de 128 bins (50 Hz a 16 kHz, hop de 320 muestras) cortado en parches no solapados de 16x16, lo que produce 50 tokens por segundo de audio. Esta formulacion permite aceptar audio de cualquier frecuencia de muestreo y numero de canales (se promedia a mono y se remuestrea a 32 kHz) y generar un unico embedding por clip sin recorte a longitud fija. La torre de texto procesa inglés con un tokenizador BPE sensible a mayusculas y ventana de 256 tokens.

El entrenamiento se realizo desde cero sobre LAION-Audio-XL (366 millones de pares audio-texto), con 1.024 millones de muestras vistas y un schedule de learning rate WSD (warmup-stable-decay), tomando el ultimo checkpoint. Los clips de entrenamiento se agruparon en buckets de longitud de 6,9, 9,0, 13,0, 22,6 y 30,1 segundos. No se menciona en la informacion disponible el uso de RLHF o DPO, algo esperable en un modelo contrastivo de este tipo. Ambas torres se usan en float32 en inferencia, aunque el entrenamiento empleo autocast bf16.

## Capacidades

- Clasificacion zero-shot de audio: empareja un clip con un conjunto de descripciones textuales y devuelve probabilidades por clase.
- Recuperacion audio-texto y texto-audio en un espacio de embeddings compartido.
- Extraccion de embeddings de audio normalizados (`encode_audio`) y de texto (`encode_text`) para clasificadores posteriores.
- Procesamiento de audio de duracion arbitraria sin recorte ni padding fijo, con enmascaramiento de padding (`patch_valid`) para lotes de clips de distinta longitud.
- Entrada de audio con cualquier frecuencia de muestreo y numero de canales (remuestreo y mezcla a mono automaticos en el preprocesado).
- Soporte de audio de hasta 30 segundos evaluado; clips mas largos se aceptan pero no estan evaluados.
- No dispone de tool calling, function calling, capacidades de agente, modo thinking, vision ni audio generativo: es un modelo de representacion, no generativo.

## Casos de uso

- Etiquetado automatico de grandes archivos de audio: se generan embeddings de cada clip y se comparan contra descripciones textuales de las clases de interes, lo que permite clasificar sin entrenamiento supervisado y filtrar corpus completos.
- Curacion de datasets de audio: el modelo sirve para detectar y descartar clips que no coinciden con las etiquetas o descripciones previstas, o para agrupar clips por similitud semantica antes de un etiquetado manual.
- Busqueda semantica de audio: indexando los embeddings de audio y consultando con texto en ingles, se puede construir un buscador que recupere clips relevantes a partir de una descripcion.
- Clasificacion de eventos sonoros en entornos embebidos: con 27M de parametros y pesos GGUF f16, el modelo es viable en dispositivos con poca memoria, lo que permite clasificar sonidos en tiempo real en hardware modesto.
- Moderacion y monitorizacion de contenido audiovisual: segmentando grabaciones largas en tramos de hasta 30 s y comparando sus embeddings contra descripciones de eventos indeseados.
- Preprocesado para pipelines de aprendizaje automatico: los embeddings de audio sirven como caracteristicas de entrada para clasificadores ligeros entrenados con pocos datos etiquetados.
- Analisis de musica y habla en investigacion: al cubrir tareas de habla, musica y sonido (MAEB-30), el modelo es util como linea base en estudios comparativos de representaciones de audio.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (porcentajes, mayor es mejor):

| Modelo | Parametros | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|
| CLAP2-Large | 340,1M | 53,6 | 81,9 | 30,3 |
| CLAP2-Medium | 152,8M | 52,3 | 81,4 | 29,4 |
| CLAP2-Small | 103,9M | 51,8 | 81,8 | 29,8 |
| CLAP2-XS | 48,3M | 49,1 | 80,6 | 27,6 |
| CLAP2-XXS (este modelo) | 27,3M | 46,2 | 79,1 | 28,0 |

MAEB-30 es la media sobre 30 tareas del Massive Audio Embedding Benchmark (habla, musica y sonido; clasificacion, zero-shot, clasificacion por pares, clustering y recuperacion). HEAR-17 es la media sobre 17 tareas HEAR (excluyendo Beehive y Maestro 5h). MSEB es la media sobre 62 puntuaciones MSEB en inglés. No se han publicado en la informacion disponible comparaciones con modelos de otras familias.

## Requisitos de hardware

- VRAM estimada: con 27,3M de parametros, el modelo en float32 ocupa aproximadamente 110 MB de pesos; en f16, unos 55 MB. La memoria adicional depende de la longitud del audio procesado, ya que la atencion es cuadratica con el numero de parches (50 tokens por segundo de audio).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. Para audio de hasta 30 s el consumo es bajo incluso en GPUs de gama de entrada.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU, dado el tamano reducido.
- Opciones de despliegue: clap.cpp (runtime indicado por el autor para los pesos GGUF), open_clip_torch >= 4.2.1 con el checkpoint original, y Transformers para el modelo base. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | MAEB-30 | Licencia | Formato |
|---|---|---|---|---|---|
| CLAP2-XXS (este) | 27,3M | Hasta 30 s evaluado, sin limite fijo | 46,2 | Apache 2.0 | GGUF, OpenCLIP |
| CLAP2-XS | 48,3M | Hasta 30 s evaluado, sin limite fijo | 49,1 | Apache 2.0 | OpenCLIP, Transformers |
| CLAP2-Small | 103,9M | Hasta 30 s evaluado, sin limite fijo | 51,8 | Apache 2.0 | OpenCLIP, Transformers |
| CLAP2-Large | 340,1M | Hasta 30 s evaluado, sin limite fijo | 53,6 | Apache 2.0 | OpenCLIP, Transformers |

La comparativa se limita a la propia familia CLAP2 porque la informacion disponible no incluye datos de otros modelos de audio-texto. La eleccion entre tamanos es un compromiso entre el rendimiento en MAEB-30 (46,2 en XXS frente a 53,6 en Large) y el coste computacional, que en XXS es aproximadamente 12 veces menor en numero de parametros.

## Limitaciones y advertencias

- La torre de texto solo procesa inglés; no hay soporte multilingue declarado.
- El tokenizador es sensible a mayusculas: el texto todo en mayusculas se tokeniza en piezas raras y obtiene peores puntuaciones. Se recomienda escribir en caja normal o convertir a minusculas si el texto esta todo en mayusculas y tiene al menos tres palabras.
- Los benchmarks se calcularon usando solo los primeros 30 s de cada clip; el comportamiento con clips mas largos no esta evaluado y el coste crece de forma cuadratica.
- Para clasificacion zero-shot se recomienda usar frases completas descriptivas, evitar etiquetas sueltas y negaciones, promediar los embeddings de varias descripciones por clase y restar la puntuacion media de cada clase antes de elegir la clase ganadora.
- El modelo es de representacion, no generativo: no produce texto, codigo ni respuestas, por lo que no es adecuado para tareas de generacion.
- Riesgo de alucinacion no aplica en el sentido habitual, pero si existe riesgo de asignaciones erroneas en clasificacion zero-shot cuando las descripciones textuales no cubren bien las clases o cuando el audio es ambiguo.
- No se detallan en la informacion disponible sesgos conocidos del corpus LAION-Audio-XL ni evaluaciones de robustez frente a acentos, idiomas distintos del inglés o condiciones acusticas adversas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el corpus de entrenamiento pueden tener condiciones adicionales no detalladas en la informacion proporcionada.
- Esta version GGUF esta pensada para clap.cpp; el uso con otras herramientas puede requerir el checkpoint original en formato OpenCLIP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gorse-io/clap2-xxs-audioxl-s1B-GGUF
- Modelo base: https://huggingface.co/laion/clap2-xxs-audioxl-s1B
- Paper: https://arxiv.org/abs/2611.11592
- Codigo: https://github.com/LAION-AI/clap2
- Pagina del proyecto: https://projects.laion.ai/clap2/
- Runtime clap.cpp: https://github.com/gorse-io/clap.cpp
