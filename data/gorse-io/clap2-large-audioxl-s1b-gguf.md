# gorse-io/clap2-large-audioxl-s1B-GGUF

## Resumen

CLAP2-L es un modelo contrastivo audio-texto desarrollado por LAION dentro de la familia CLAP2, que abarca cinco tamanos (de 27M a 340M parametros). Este repositorio concreto, publicado por gorse-io, contiene los pesos del modelo grande (340,1M parametros sumando ambas torres) en formato GGUF, lo que permite ejecutarlo mediante clap.cpp sin depender del stack completo de PyTorch. El modelo resuelve el problema de alinear representaciones de audio y texto en un espacio comun de embeddings, habilitando tareas de recuperacion audio-texto, clasificacion zero-shot de audio y extraccion de caracteristicas para clasificadores posteriores.

La arquitectura combina una torre de audio basada en un vision transformer NaFlex que opera sobre parches de espectrograma log-mel y una torre de texto con tokenizador BPE estilo GPT-2. Frente a CLAP original, la innovacion principal es la capacidad de procesar audio de cualquier duracion sin recorte ni relleno a una longitud fija, generando un unico embedding por clip. El modelo fue entrenado desde cero sobre LAION-Audio-XL, un corpus de 366 millones de pares audio-texto, con 1.024 millones de muestras vistas.

Su relevancia actual radica en que ofrece un rendimiento de referencia en benchmarks de embeddings de audio (53,6% en MAEB-30, 81,9% en HEAR-17) con un coste computacional moderado, y su disponibilidad en GGUF facilita el despliegue en entornos con recursos limitados o sin GPU dedicada, algo poco habitual en modelos contrastivos audio-texto de esta categoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contrastiva audio-texto de dos torres; torre de audio NaFlex vision transformer sobre parches log-mel; torre de texto transformer con BPE estilo GPT-2 |
| Parametros totales | 340.073.857 (ambas torres) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Audio: cualquier duracion (entrenado hasta 30 s, 50 tokens por segundo); texto: 256 tokens |
| Tipos de cuantizacion | GGUF (F16 en el ejemplo de la model card); otras cuantizaciones GGUF no especificadas |
| Idiomas soportados | Ingles (torre de texto); audio independiente del idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el repositorio base |

## Arquitectura y entrenamiento

El modelo sigue un diseno contrastivo de dos torres. La torre de audio es un vision transformer NaFlex que recibe un espectrograma log-mel de 128 bins (50 Hz a 16 kHz, hop de 320 muestras), lo divide en parches no solapados de 16x16 y produce 50 tokens por segundo de audio. Al no exigir recorte ni relleno a una longitud fija, acepta clips de cualquier duracion y genera un embedding por clip; el coste crece de forma cuadratica con la longitud debido a la atencion completa. La torre de texto emplea un tokenizador BPE sensible a mayusculas con contexto de 256 tokens.

El entrenamiento se realizo desde cero sobre LAION-Audio-XL (366 millones de pares audio-texto), con 1.024 millones de muestras vistas y un schedule de learning rate WSD, tomando el ultimo checkpoint. Los clips de entrenamiento se agruparon en buckets de longitud de 6,9, 9,0, 13,0, 22,6 y 30,1 segundos. El preprocesado remuestrea a 32 kHz y promedia multicanal a mono. El entrenamiento uso autocast en bf16, aunque la inferencia publicada se realiza en float32.

## Capacidades

- Generacion de embeddings de audio y de texto normalizados en un espacio compartido, aptos para similitud coseno.
- Clasificacion zero-shot de audio mediante comparacion de embeddings de audio con prompts textuales.
- Recuperacion audio-texto y texto-audio (audio-text retrieval).
- Extraccion de caracteristicas para clasificadores posteriores y para curacion de datos.
- Procesamiento de audio de cualquier duracion y cualquier frecuencia de muestreo o numero de canales (remuestreo y mezcla a mono internos).
- Procesamiento por lotes de varios clips mediante padding y mascara `patch_valid`, con embeddings identicos a los obtenidos individualmente.
- Soporte de audio de habla, musica y sonidos ambientales segun las tareas de los benchmarks MAEB y HEAR.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo de representacion, no generativo.

## Casos de uso

- Etiquetado zero-shot de archivos de audio: describir cada clase con varias frases cortas en ingles, promediar sus embeddings y comparar con el embedding del clip; util para taxonomias que cambian con frecuencia sin reentrenar.
- Curacion de datasets de audio: calcular embeddings de grandes colecciones y agrupar o filtrar por similitud para detectar duplicados, clases raras o contenido mal etiquetado.
- Busqueda semantica audio-texto: indexar embeddings de clips y recuperar por consultas en lenguaje natural, por ejemplo localizar grabaciones de "un tren llegando a la estacion".
- Clasificacion de eventos sonoros en produccion: usar el embedding como entrada de un clasificador ligero entrenado con pocos datos, aprovechando las 340M de representaciones preentrenadas.
- Monitorizacion de contenido audiovisual: segmentar grabaciones largas en tramos de hasta 30 s, calcular embeddings por segmento y comparar contra prompts de referencia para detectar locucion, musica o ruido.
- Analisis de musica y habla en investigacion: emplear los embeddings como baseline en tareas de HEAR o MSEB, o para estudiar la alineacion audio-texto en corpus multilingues (el audio no depende del idioma, aunque los prompts sean en ingles).
- Despliegue en entornos sin GPU: al estar en GGUF y ejecutarse con clap.cpp, permite integrar la extraccion de embeddings en servicios ligeros o pipelines de CPU.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes, mayor es mejor):

| Benchmark | CLAP2-L (este modelo) | CLAP2-M | CLAP2-S | CLAP2-XS | CLAP2-XXS |
|---|---|---|---|---|---|
| MAEB-30 (media de 30 tareas) | 53,6 | 52,3 | 51,8 | 49,1 | 46,2 |
| HEAR-17 (media de 17 tareas) | 81,9 | 81,4 | 81,8 | 80,6 | 79,1 |
| MSEB (media de 62 puntuaciones en ingles) | 30,3 | 29,4 | 29,8 | 27,6 | 28,0 |

MAEB-30 cubre tareas de habla, musica y sonido en clasificacion, clasificacion zero-shot, clasificacion de pares, clustering y recuperacion. HEAR-17 excluye Beehive y Maestro 5h. No se han publicado en la informacion disponible comparaciones numericas con modelos de otras familias (por ejemplo CLAP original o AudioCLIP).

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF ocupa 2,0 GB; en F16 los 340M parametros requieren aproximadamente 0,7 GB de pesos mas activaciones. Con cuantizaciones GGUF de menor precision el peso baja de ese umbral, aunque no se detallan los tipos disponibles.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para inferencia en F16; para lotes grandes o clips de 30 s conviene una RTX 3090/4090 o superior por el coste cuadratico de la atencion.
- Cabe en GPU consumer: si, practicamente en cualquier modelo con 4 GB o mas (GTX 1650, RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: clap.cpp (via `clap embedding`), open_clip_torch (>= 4.2.1) con el repositorio base en safetensors, y Transformers. No se mencionan integraciones con vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MAEB-30 | HEAR-17 | Licencia | Formato |
|---|---|---|---|---|---|---|
| CLAP2-L (este) | 340,1M | Audio libre; texto 256 tokens | 53,6 | 81,9 | Apache 2.0 | GGUF, safetensors |
| CLAP2-M | 152,8M | Audio libre; texto 256 tokens | 52,3 | 81,4 | Apache 2.0 | safetensors |
| CLAP2-S | 103,9M | Audio libre; texto 256 tokens | 51,8 | 81,8 | Apache 2.0 | safetensors |
| CLAP original (LAION) | No disponible en la informacion | No disponible | No disponible | No disponible | No disponible | No disponible |

Dentro de la familia CLAP2, el modelo L ofrece la mejor puntuacion en MAEB-30 y MSEB, con una diferencia de 1,3 puntos sobre el M en MAEB-30 a cambio de mas del doble de parametros. No se dispone de datos para comparar con CLAP original ni con otros modelos contrastivos audio-texto.

## Limitaciones y advertencias

- La torre de texto solo acepta ingles; los prompts en otros idiomas no estan soportados.
- El tokenizador es sensible a mayusculas: los textos en mayusculas (por ejemplo transcripciones de habla) se fragmentan en tokens raros y puntuan peor. La evaluacion del paper pasa a minusculas los textos completamente en mayusculas con al menos tres palabras.
- Entrenado con clips de hasta 30 s; acepta clips mas largos pero su comportamiento no esta evaluado. Se recomienda segmentar grabaciones largas y promediar o comparar embeddings.
- El coste computacional crece de forma cuadratica con la duracion del audio por el uso de atencion completa.
- Riesgo de alucinacion no aplica en sentido generativo, pero la clasificacion zero-shot puede asignar puntuaciones altas a clases incorrectas si los prompts son etiquetas escuetas o contienen negaciones; la model card recomienda frases completas y restar la puntuacion media por clase.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre LAION-Audio-XL, puede heredar sesgos de ese corpus.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar las condiciones del corpus de entrenamiento si se redistribuyen derivados.
- La inferencia publicada usa float32 aunque el entrenamiento fue en bf16; no se documentan efectos de otras precisiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gorse-io/clap2-large-audioxl-s1B-GGUF
- Modelo base: https://huggingface.co/laion/clap2-large-audioxl-s1B
- Paper: https://arxiv.org/abs/2611.11592
- Codigo: https://github.com/LAION-AI/clap2
- Pagina del proyecto: https://projects.laion.ai/clap2/
- clap.cpp: https://github.com/gorse-io/clap.cpp
