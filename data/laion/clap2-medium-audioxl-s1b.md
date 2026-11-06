# laion/clap2-medium-audioxl-s1B

## Resumen

CLAP2-M es un modelo contrastivo audio-texto desarrollado por LAION, presentado como parte de la familia CLAP2 (cinco tamanos entre 27M y 340M parametros). Su funcion es proyectar clips de audio y descripciones textuales en ingles a un espacio de embeddings compartido, lo que permite tareas de recuperacion audio-texto, clasificacion zero-shot de audio y extraccion de embeddings de audio de proposito general. Este repositorio concreto corresponde al tamano medio, con 152,8 millones de parametros sumando ambas torres.

El modelo se entrena desde cero sobre LAION-Audio-XL, un corpus de 366 millones de pares audio-texto, durante 1.024 millones de muestras vistas con un schedule de learning rate WSD. Frente a CLAP original, la innovacion principal es la torre de audio: un vision transformer NaFlex que opera sobre parches de log-mel y acepta audio de cualquier duracion sin recorte ni padding a una longitud fija, generando un unico embedding por clip.

Es relevante ahora porque ofrece una alternativa Apache 2.0 a modelos audio-texto previos, con soporte en OpenCLIP (rama `main`) y un formato Transformers (`Clap2Model`, `Clap2Processor`) cuyo soporte en la libreria esta pendiente de release. Los resultados publicados en MAEB-30 (52,3%), HEAR-17 (81,4%) y MSEB (29,4%) lo sitúan muy cerca del modelo grande de la familia con la mitad de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contrastiva dual-tower: vision transformer NaFlex sobre parches de log-mel (audio) + torre de texto |
| Parametros totales | 152.766.656 (ambas torres) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Audio de cualquier duracion; en evaluacion se limitan a los primeros 30 s (`max_num_patches=1504`). Contexto de texto: no disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (OpenCLIP y Transformers, mismos pesos); tamano del repo 1,2 GB |

## Arquitectura y entrenamiento

CLAP2-M es un modelo contrastivo de dos torres. La torre de audio es un vision transformer NaFlex que procesa un espectrograma log-mel de 128 bins (50 Hz a 16 kHz, ventana de 320 muestras) troceado en parches; al no fijar la longitud de entrada, produce un embedding por clip independientemente de su duracion, con padding enmascarado mediante `patch_valid` cuando se procesan lotes de clips de distinta longitud. La torre de texto mapea frases en ingles al mismo espacio, y el entrenamiento contrastivo alinea ambas modalidades con una `logit_scale` aprendida.

El entrenamiento se realizo desde cero sobre LAION-Audio-XL (366M pares audio-texto) durante 1.024M muestras vistas, con schedule WSD y checkpoint final. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa (no aplicables a un modelo de embeddings). El preprocesado integra la mezcla a mono y el remuestreo a 32 kHz, de modo que el modelo acepta cualquier frecuencia de muestreo y numero de canales de entrada.

## Capacidades

- Extraccion de embeddings de audio de proposito general (un vector por clip, normalizable).
- Recuperacion audio-texto bidireccional (audio a texto y texto a audio) por similitud coseno.
- Clasificacion zero-shot de audio mediante prompts textuales en ingles.
- Clasificacion de pares (pair classification) y clustering sobre embeddings de audio.
- Procesamiento de audio de duracion variable sin recorte fijo, incluyendo lotes con clips de distinta longitud.
- Cobertura de dominios de habla, musica y sonidos ambientales segun los benchmarks reportados (MAEB-30, HEAR-17).
- No soporta tool calling, agentes, generacion de texto ni razonamiento multi-paso: es un modelo de representacion, no generativo.
- Capacidades multilingues limitadas al ingles en la torre de texto.

## Casos de uso

- Busqueda semantica en archivos de audio: indexar los embeddings de una fonoteca y recuperar clips mediante consultas en lenguaje natural ("una puerta que se cierra de golpe"), aprovechando que el modelo acepta clips de cualquier duracion sin recorte.
- Etiquetado automatico de grandes corpus de audio: clasificacion zero-shot con prompts descriptivos por clase, util para pre-anotar datasets de sonido ambiental o musica antes de una revision humana.
- Moderacion y triaje de contenido sonoro: detectar categorias de audio en pipelines de subida de contenido comparando embeddings contra un conjunto de prompts de referencia.
- Deduplicacion y agrupamiento de audio: clustering sobre los embeddings normalizados para agrupar grabaciones similares en un catalogo musical o de efectos de sonido.
- Analisis de habla y musica a escala: obtener representaciones para alimentar clasificadores ligeros aguas abajo (deteccion de musica de fondo, segmentacion por tipo de contenido) sin entrenar un encoder propio.
- Investigacion en representaciones audio-texto: linea base Apache 2.0 de 152,8M parametros para experimentos de alineamiento multimodal, con pesos disponibles en formato OpenCLIP y Transformers.
- Sistemas de recomendacion basados en descripcion: emparejar descripciones textuales de un usuario con embeddings de fragmentos de audio de un catalogo.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes, mayor es mejor). MAEB-30 es la media sobre 30 tareas del Massive Audio Embedding Benchmark; HEAR-17 la media sobre 17 tareas HEAR; MSEB la media sobre 62 puntuaciones MSEB en ingles.

| Modelo | Parametros | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|
| CLAP2-L | 340,1M | 53,6 | 81,9 | 30,3 |
| **CLAP2-M (este)** | **152,8M** | **52,3** | **81,4** | **29,4** |
| CLAP2-S | 103,9M | 51,8 | 81,8 | 29,8 |
| CLAP2-XS | 48,3M | 49,1 | 80,6 | 27,6 |
| CLAP2-XXS | 27,3M | 46,2 | 79,1 | 28,0 |

No se han publicado en la informacion disponible comparaciones numericas con modelos audio-texto de otros autores; la model card remite al paper para dichas comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB solo para pesos (152,8M parametros); en fp16/bf16, unos 0,3 GB. El consumo real depende del tamano del lote y de la longitud de los clips, ya que la torre NaFlex procesa un numero variable de parches.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para cargas moderadas.
- GPU recomendadas para throughput alto: A100, H100 o L40S para indexar corpus grandes por lotes; RTX 4090 para prototipado y servicio de baja latencia.
- Despliegue via OpenCLIP (rama `main`, no en releases de PyPI) o via Transformers una vez publicado el soporte de `Clap2Model`/`Clap2Processor`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | MAEB-30 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CLAP2-M | 152,8M | Cualquier duracion (evaluado a 30 s) | 52,3 | Apache 2.0 | HuggingFace, OpenCLIP main |
| CLAP2-L | 340,1M | Cualquier duracion (evaluado a 30 s) | 53,6 | Apache 2.0 | HuggingFace, OpenCLIP main |
| CLAP2-S | 103,9M | Cualquier duracion (evaluado a 30 s) | 51,8 | Apache 2.0 | HuggingFace, OpenCLIP main |
| CLAP original (LAION) | No disponible en la informacion | No disponible | No disponible | No disponible | No disponible |

La comparacion con modelos audio-texto de otros autores (por ejemplo, variantes de CLAP previas o modelos propietarios) no esta disponible en la informacion proporcionada; el paper referenciado en la model card contiene dichas comparaciones.

## Limitaciones y advertencias

- La torre de texto solo entiende ingles; el rendimiento en otros idiomas no esta garantizado ni documentado.
- Las similitudes coseno son bajas en terminos absolutos; deben compararse entre textos para un mismo audio, no contra un umbral fijo. Para probabilidades, aplicar `logit_scale.exp()` y softmax.
- La clasificacion zero-shot es sensible a la redaccion de los prompts: la model card recomienda frases completas descriptivas, evitar etiquetas desnudas y negaciones, promediar varios prompts por clase y restar la media por clase antes de elegir la etiqueta.
- Riesgo de sesgo heredado de LAION-Audio-XL: la composicion del corpus (366M pares) condiciona el vocabulario y los dominios sonoros bien representados; no se documentan analisis de sesgo en la informacion disponible.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si de falsos positivos en clasificacion zero-shot cuando las clases son acusticamente cercanas.
- En evaluacion se limitan los clips a los primeros 30 s (`max_num_patches=1504`); para clips mas largos, el embedding cubre solo esa ventana salvo que se trocee manualmente.
- El soporte en OpenCLIP requiere la rama `main` (no hay release en PyPI) y el soporte en Transformers esta pendiente de publicacion; esto complica la integracion en produccion con versiones fijadas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del corpus de entrenamiento para casos de uso sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/clap2-medium-audioxl-s1B
- Modelo grande (CLAP2-L): https://huggingface.co/laion/clap2-large-audioxl-s1B
- Modelo pequeno (CLAP2-S): https://huggingface.co/laion/clap2-small-audioxl-s1B
- Modelo XS (CLAP2-XS): https://huggingface.co/laion/clap2-xs-audioxl-s1B
- Modelo XXS (CLAP2-XXS): https://huggingface.co/laion/clap2-xxs-audioxl-s1B
- Repositorio OpenCLIP: https://github.com/mlfoundations/open_clip
- Paper de CLAP2: no disponible en la informacion proporcionada (referenciado en la model card)
