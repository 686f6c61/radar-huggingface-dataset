# gorse-io/clap2-small-audioxl-s1B-GGUF

## Resumen

CLAP2-S (small) es un modelo contrastivo audio-texto desarrollado por LAION dentro de la familia CLAP2, que abarca cinco tamanos (de 27M a 340M parametros). El modelo empareja una torre de audio y una torre de texto para proyectar clips de audio y descripciones en ingles a un espacio de embeddings compartido, lo que permite clasificacion zero-shot de audio, recuperacion audio-texto y extraccion de embeddings de audio de proposito general. La version aqui descrita es la cuantizacion GGUF publicada por gorse-io para su uso con la herramienta clap.cpp.

La relevancia de este modelo reside en su enfoque de entrenamiento desde cero sobre LAION-Audio-XL, un corpus de 366 millones de pares audio-texto, y en el uso de una torre de audio basada en un vision transformer NaFlex sobre parches de log-mel. Esto permite procesar audio de longitud arbitraria sin recorte ni relleno a una longitud fija, generando un unico embedding por clip. Con 103,9 millones de parametros totales, la variante S ofrece un equilibrio entre coste computacional y rendimiento dentro de la familia.

Esta ficha se centra en la version GGUF (clap2-small-audioxl-s1B-GGUF), un empaquetado del modelo base laion/clap2-small-audioxl-s1B orientado a inferencia ligera mediante clap.cpp. La licencia Apache 2.0 facilita su integracion en productos comerciales, y su tamano reducido lo hace viable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contrastiva audio-texto de dos torres; torre de audio NaFlex vision transformer sobre parches de log-mel; torre de texto transformer (BPE estilo GPT-2) |
| Parametros totales | 103.896.961 (ambas torres) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Audio: clips de hasta 30 s evaluados (acepta mas, no evaluado); texto: 256 tokens |
| Tipos de cuantizacion | GGUF (el repo incluye f16; otras cuantizaciones GGUF no disponibles en la informacion) |
| Idiomas soportados | Ingles (torre de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura contrastiva de dos torres. La torre de audio es un vision transformer NaFlex que opera sobre un espectrograma log-mel de 128 bins (50 Hz a 16 kHz, hop de 320 muestras), dividido en parches no solapados de 16x16, lo que produce 50 tokens por segundo de audio. Esta diseno permite aceptar audio de cualquier frecuencia de muestreo y numero de canales (se promedia a mono y se remuestrea a 32 kHz) y de cualquier duracion, generando un unico embedding por clip mediante atencion completa, cuyo coste crece de forma cuadratica con la longitud. La torre de texto emplea un tokenizador BPE estilo GPT-2 sensible a mayusculas con contexto de 256 tokens.

El entrenamiento se realizo desde cero sobre LAION-Audio-XL (366 millones de pares audio-texto) durante 1.024 millones de muestras vistas, con un schedule de learning rate WSD y seleccionando el ultimo checkpoint. Los clips de entrenamiento tuvieron una duracion maxima de 30 s, organizados en buckets de 6,9, 9,0, 13,0, 22,6 y 30,1 s. El entrenamiento empleo autocast en bf16, aunque la inferencia publicada usa float32 en ambas torres. No se menciona en la informacion disponible el uso de RLHF o DPO, algo esperable en un modelo contrastivo de este tipo.

## Capacidades

- Clasificacion zero-shot de audio: asignar etiquetas a clips comparando embeddings de audio con embeddings de descripciones textuales en ingles.
- Recuperacion audio-texto: buscar clips de audio a partir de consultas textuales y viceversa.
- Extraccion de embeddings de audio de proposito general para clasificadores downstream.
- Procesamiento de audio de longitud arbitraria sin recorte ni padding a longitud fija (aunque evaluado hasta 30 s).
- Soporte de audio con cualquier frecuencia de muestreo y numero de canales (remuestreo y mezcla a mono internos).
- Procesamiento por lotes con enmascaramiento de padding (`patch_valid`), que preserva embeddings identicos a los calculados individualmente.
- Curacion de datos: generacion de embeddings para filtrado y organizacion de corpus de audio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step; no es un modelo generativo.
- Capacidad multilingue limitada al ingles en la torre de texto.

## Casos de uso

- Etiquetado automatico de archivos de audio: dado un clip, comparar su embedding con descripciones de clases candidatas para asignar etiquetas sin entrenamiento especifico, util en bibliotecas de efectos de sonido o archivos de podcast.
- Moderacion de contenido audiovisual: clasificar segmentos de audio en categorias (habla, musica, ruido, aplausos) para detectar contenido no deseado en plataformas de video.
- Busqueda semantica de audio: indexar embeddings de clips y permitir consultas en lenguaje natural ("un perro ladrando", "lluvia intensa") sobre grandes catalogos musicales o de efectos.
- Curacion de datasets de audio: filtrar y agrupar grandes colecciones de audio por similitud de embeddings o por coincidencia con descripciones textuales, reduciendo el trabajo manual de anotacion.
- Clasificacion de eventos sonoros en entornos urbanos o industriales: usar el modelo como extractor de caracteristicas para un clasificador ligero downstream que detecte sirenas, maquinaria o roturas.
- Analisis de contenido musical: recuperar o clasificar fragmentos musicales por descripcion textual (genero, instrumentacion, ambiente) para sistemas de recomendacion o catalogacion.
- Preprocesamiento en pipelines de ASR o diarizacion: generar embeddings de segmentos de audio para agrupar hablantes o separar habla de musica y ruido antes de etapas posteriores.

## Benchmarks y rendimiento

Los resultados publicados en la model card (porcentajes, mayor es mejor) son los siguientes:

| Modelo | Parametros | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|
| CLAP2-L | 340,1M | 53,6 | 81,9 | 30,3 |
| CLAP2-M | 152,8M | 52,3 | 81,4 | 29,4 |
| CLAP2-S (este) | 103,9M | 51,8 | 81,8 | 29,8 |
| CLAP2-XS | 48,3M | 49,1 | 80,6 | 27,6 |
| CLAP2-XXS | 27,3M | 46,2 | 79,1 | 28,0 |

MAEB-30 es la media sobre 30 tareas del Massive Audio Embedding Benchmark (habla, musica y sonido; clasificacion, zero-shot, clasificacion por pares, clustering y recuperacion). HEAR-17 es la media sobre 17 tareas HEAR (excluyendo Beehive y Maestro 5h). MSEB es la media sobre 62 puntuaciones MSEB en ingles. No se proporcionan en la informacion disponible resultados comparativos con modelos de otros autores.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en f16 ocupa aproximadamente 0,2 GB de pesos (103,9M parametros x 2 bytes); el repo completo pesa 0,6 GB. Con overhead de activaciones y lotes pequenos, cabe holgadamente en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Tambien es viable en CPU para cargas moderadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: clap.cpp (herramienta oficial para la version GGUF), open_clip_torch (para el modelo base en safetensors), y potencialmente llama.cpp si soporta el formato GGUF de CLAP (no confirmado en la informacion). El modelo base requiere `open_clip_torch>=4.2.1` y `soundfile`.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste crece de forma cuadratica con la longitud del audio (atencion completa), por lo que clips de 30 s son el punto de referencia evaluado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Licencia | Formato | Rendimiento (MAEB-30) |
|---|---|---|---|---|---|
| CLAP2-S (este) | 103,9M | Hasta 30 s evaluado | Apache 2.0 | GGUF / safetensors | 51,8 |
| CLAP2-M | 152,8M | Hasta 30 s evaluado | Apache 2.0 | safetensors | 52,3 |
| CLAP2-XS | 48,3M | Hasta 30 s evaluado | Apache 2.0 | safetensors | 49,1 |
| CLAP2-XXS | 27,3M | Hasta 30 s evaluado | Apache 2.0 | safetensors | 46,2 |

La comparativa se limita a la propia familia CLAP2, ya que la informacion disponible no incluye datos de otros modelos audio-texto (como CLAP original, AudioCLIP o similares). La variante S ofrece un rendimiento cercano a la M con un 32% menos de parametros, y una mejora de 2,7 puntos sobre la XS con el doble de parametros.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la informacion disponible; al entrenarse sobre LAION-Audio-XL, puede heredar sesgos de ese corpus.
- Riesgo de alucinacion: al no ser un modelo generativo, no produce texto libre; el riesgo se limita a clasificaciones erroneas o recuperaciones irrelevantes.
- Limitaciones de contexto: los benchmarks solo evaluan los primeros 30 s de cada clip; aunque acepta audio mas largo, no esta evaluado y el coste crece cuadraticamente. Se recomienda segmentar grabaciones largas.
- Limitaciones de idioma: la torre de texto solo procesa ingles; descripciones en otros idiomas no son soportadas de forma fiable.
- Sensibilidad a mayusculas: el tokenizador distingue mayusculas; textos completamente en mayusculas (por ejemplo transcripciones) se tokenizan en piezas raras y obtienen peores puntuaciones. Se recomienda usar oraciones en caja normal o convertir a minusculas textos de al menos tres palabras.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribucion correspondiente.
- Caveats para produccion: evitar etiquetas escuetas ("speech", "dog") y negaciones en los prompts; promediar embeddings de varias descripciones por clase y restar la puntuacion media de cada clase sobre los clips antes de elegir la clase ganadora. La version GGUF de gorse-io es una conversion de terceros; para maxima fidelidad se recomienda validar contra el modelo base en safetensors.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/gorse-io/clap2-small-audioxl-s1B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/laion/clap2-small-audioxl-s1B
- Paper: https://arxiv.org/abs/2611.11592
- Codigo: https://github.com/LAION-AI/clap2
- Pagina del proyecto: https://projects.laion.ai/clap2/
- Herramienta clap.cpp: https://github.com/gorse-io/clap.cpp
