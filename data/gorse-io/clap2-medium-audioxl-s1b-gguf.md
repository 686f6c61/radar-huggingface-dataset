# gorse-io/clap2-medium-audioxl-s1B-GGUF

## Resumen

CLAP2-M (clap2-medium-audioxl-s1B) es un modelo contrastivo audio-texto desarrollado por LAION dentro de la familia CLAP2, que abarca cinco tamanos (de 27M a 340M parametros). Este repositorio concreto, publicado por gorse-io, contiene los pesos del modelo mediano (152,8M de parametros sumando ambas torres) en formato GGUF, lo que permite ejecutarlo con la herramienta clap.cpp sin depender del stack completo de PyTorch. El modelo mapea clips de audio y texto en ingles a un espacio de embeddings compartido, habilitando tareas de recuperacion audio-texto, clasificacion zero-shot y extraccion de caracteristicas de audio.

La arquitectura combina una torre de audio basada en un vision transformer NaFlex que opera sobre parches de espectrograma log-mel (sin recorte ni padding a longitud fija) y una torre de texto con tokenizador BPE de estilo GPT-2. El entrenamiento se realizo desde cero sobre LAION-Audio-XL, un corpus de 366 millones de pares audio-texto, durante 1.024 millones de muestras vistas con un schedule de learning rate WSD. Frente a los modelos CLAP originales, la innovacion principal es la entrada de longitud variable y un rendimiento superior en benchmarks agregados como MAEB-30 y HEAR-17.

El modelo resulta relevante ahora porque ofrece un punto de equilibrio entre tamano y calidad dentro de la familia CLAP2 (52,3% en MAEB-30, frente a 53,6% del modelo grande y 51,8% del pequeno), con licencia Apache 2.0 y empaquetado GGUF que facilita su integracion en pipelines de inferencia ligeros. No es un modelo generativo: es un extractor de embeddings y un clasificador contrastivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contrastiva audio-texto de dos torres: audio tower NaFlex vision transformer sobre parches log-mel + text tower transformer (BPE estilo GPT-2) |
| Parametros totales | 152.766.657 (ambas torres) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Audio: clips de hasta 30 s evaluados (acepta mas, no evaluado); texto: 256 tokens |
| Tipos de cuantizacion | GGUF (el repo incluye al menos F16; otras cuantizaciones no detalladas) |
| Idiomas soportados | Ingles (texto); audio independiente del idioma hablado |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizacion); pesos originales en safetensors en el repo base laion/clap2-medium-audioxl-s1B |

## Arquitectura y entrenamiento

El modelo sigue un diseno de dos torres entrenadas de forma contrastiva. La torre de audio es un vision transformer NaFlex que procesa un espectrograma log-mel de 128 bins (50 Hz a 16 kHz, hop de 320 muestras) cortado en parches no solapados de 16x16, lo que produce 50 tokens por segundo de audio. La entrada admite cualquier frecuencia de muestreo y numero de canales; el preprocesado promedia a mono y remuestrea a 32 kHz. La torre de texto emplea un tokenizador BPE de estilo GPT-2 con contexto de 256 tokens, sensible a mayusculas.

El entrenamiento se realizo desde cero sobre LAION-Audio-XL (366M de pares audio-texto) durante 1.024M de muestras vistas, con schedule WSD y el ultimo checkpoint como version final. Los clips de entrenamiento se organizaron en buckets de longitud (6,9, 9,0, 13,0, 22,6 y 30,1 s). Ambos towers se usan en float32 en este repo, aunque el entrenamiento empleo autocast bf16. No se documenta en la informacion disponible el uso de RLHF o DPO, algo esperable en un modelo contrastivo y no generativo.

## Capacidades

- Extraccion de embeddings de audio y de texto en un espacio compartido, con normalizacion opcional.
- Recuperacion audio-texto (audio-to-text y text-to-audio) mediante similitud coseno.
- Clasificacion zero-shot de audio a partir de descripciones textuales en frases completas.
- Clasificacion de audio supervisada si se usan los embeddings como caracteristicas para un clasificador posterior.
- Procesamiento de audio de longitud variable sin recorte ni padding a longitud fija.
- Manejo de audio con cualquier frecuencia de muestreo y numero de canales (remuestreo y mezcla a mono internos).
- Procesamiento por lotes de varios clips con padding y mascara (`patch_valid`), manteniendo embeddings identicos a la codificacion individual.
- Cobertura de tareas de voz, musica y sonidos segun los benchmarks MAEB-30 y HEAR-17.
- No soporta generacion de texto, tool calling ni razonamiento multi-paso: es un modelo de embeddings.

## Casos de uso

- Etiquetado y clasificacion zero-shot de archivos de audio: dado un catalogo de clases descritas con frases completas ("A cello plays a slow melody."), el modelo puntua cada clip sin entrenamiento adicional, util para triage de grandes archivos de audio.
- Recuperacion audio-texto en buscadores multimedia: indexar embeddings de clips y consultar con texto en ingles para localizar fragmentos concretos en bibliotecas de sonido o podcasts.
- Curacion de datasets de audio: filtrar y agrupar pares audio-texto por similitud para limpiar corpus de entrenamiento, tal como sugiere la model card en su seccion de uso previsto.
- Clasificadores downstream ligeros: usar los embeddings de audio como entrada de un clasificador supervisado (regresion logistica, MLP) para tareas especificas de dominio con pocos datos etiquetados.
- Deteccion de eventos sonoros en monitorizacion: segmentar grabaciones largas en tramos de hasta 30 s, codificar cada tramo y comparar con descripciones de eventos de interes (cristales rotos, alarmas, ladridos).
- Analisis de contenido musical y ambiental: distinguir generos, instrumentos o ambientes acusticos mediante prompts descriptivos, aprovechando la cobertura de musica y sonidos de MAEB-30.
- Deduplicacion y clustering de audio: agrupar clips por similitud de embeddings para organizar archivos o detectar contenido repetido.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes, mayor es mejor):

| Modelo | Parametros | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|
| CLAP2-L | 340,1M | 53,6 | 81,9 | 30,3 |
| **CLAP2-M (este)** | 152,8M | 52,3 | 81,4 | 29,4 |
| CLAP2-S | 103,9M | 51,8 | 81,8 | 29,8 |
| CLAP2-XS | 48,3M | 49,1 | 80,6 | 27,6 |
| CLAP2-XXS | 27,3M | 46,2 | 79,1 | 28,0 |

MAEB-30 es la media sobre 30 tareas del Massive Audio Embedding Benchmark (clasificacion, zero-shot, pair classification, clustering y retrieval sobre voz, musica y sonido). HEAR-17 es la media sobre 17 tareas HEAR (excluyendo Beehive y Maestro 5h). MSEB es la media de 62 puntuaciones MSEB en ingles. No se dispone en la informacion proporcionada de comparaciones numericas con modelos de otros autores.

## Requisitos de hardware

- VRAM estimada: el modelo completo en float32 ocupa aproximadamente 0,6 GB (152,8M parametros x 4 bytes); en F16 unos 0,3 GB. El repo GGUF pesa 0,9 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes moderados.
- Despliegue via clap.cpp (formato GGUF) o via open_clip_torch >= 4.2.1 con PyTorch (pesos safetensors del repo base).
- GPU recomendadas: no se requieren GPUs de datacenter; A100/H100 solo aportarian ventaja en throughput masivo por lotes.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El coste de atencion crece de forma cuadratica con la longitud del audio, por lo que conviene segmentar en tramos de hasta 30 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | MAEB-30 | HEAR-17 | Licencia | Formato |
|---|---|---|---|---|---|---|
| CLAP2-M (este) | 152,8M | hasta 30 s evaluado | 52,3 | 81,4 | Apache 2.0 | GGUF, safetensors |
| CLAP2-L | 340,1M | hasta 30 s evaluado | 53,6 | 81,9 | Apache 2.0 | safetensors |
| CLAP2-S | 103,9M | hasta 30 s evaluado | 51,8 | 81,8 | Apache 2.0 | safetensors |
| CLAP2-XS | 48,3M | hasta 30 s evaluado | 49,1 | 80,6 | Apache 2.0 | safetensors |

La comparacion con modelos CLAP de la generacion anterior u otros modelos audio-texto de terceros no esta disponible en la informacion proporcionada; la model card remite al paper (arXiv:2611.11592) para comparaciones detalladas.

## Limitaciones y advertencias

- Modelo no generativo: solo produce embeddings y puntuaciones de similitud; no responde preguntas ni genera texto.
- La torre de texto solo acepta ingles; el rendimiento en otros idiomas no esta evaluado.
- El tokenizador es sensible a mayusculas: texto todo en mayusculas (transcripciones de voz, por ejemplo) tokeniza mal y puntua peor. La evaluacion del paper pasa a minusculas el texto si es todo mayusculas y tiene al menos tres palabras.
- Los clips de mas de 30 s no estan evaluados; el coste crece de forma cuadratica con la longitud por atencion completa, por lo que se recomienda segmentar.
- Para clasificacion zero-shot conviene usar frases completas descriptivas, evitar etiquetas sueltas y negaciones, promediar los embeddings de varias descripciones por clase y restar la puntuacion media de cada clase sobre los clips antes de elegir la clase top.
- Riesgo de alucinacion en sentido estricto no aplica, pero si de calibracion: las puntuaciones de similitud pueden favorecer clases con descripciones mas genericas; el ajuste por media de clase mitiga este sesgo.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre LAION-Audio-XL puede heredar los sesgos de ese corpus.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales mas alla de las obligatorias de la licencia.
- En este repo los pesos estan en float32 (y GGUF F16); para produccion con muchos clips conviene evaluar cuantizaciones GGUF adicionales si clap.cpp las soporta, dato no confirmado en la informacion disponible.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/gorse-io/clap2-medium-audioxl-s1B-GGUF
- Modelo base: https://huggingface.co/laion/clap2-medium-audioxl-s1B
- Paper: https://arxiv.org/abs/2611.11592
- Codigo: https://github.com/LAION-AI/clap2
- Pagina del proyecto: https://projects.laion.ai/clap2/
- clap.cpp: https://github.com/gorse-io/clap.cpp
