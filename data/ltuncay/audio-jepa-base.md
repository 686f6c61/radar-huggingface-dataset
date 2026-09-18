# ltuncay/Audio-JEPA-base

## Resumen

Audio-JEPA-base es un codificador de audio auto-supervisado desarrollado por ltuncay (Ludovic Tuncay) y publicado en HuggingFace bajo licencia MIT. Se trata de la exportación a `transformers` del encoder estudiante de un experimento Audio-JEPA entrenado sobre AudioSet durante 200.000 pasos de optimizador, con 85.484.928 parámetros. Su función no es generar texto ni transcribir, sino producir embeddings de audio de 768 dimensiones, tanto a nivel de clip completo como a nivel de trama, listos para alimentar cabezas de clasificación o modelos posteriores.

La arquitectura es un transformer de 12 capas con 768 dimensiones y 12 cabezas de atención, que opera sobre un espectrograma mel de 128 bandas troceado en parches de 16 bandas por 16 tramas temporales, con embeddings posicionales sinusoidales y MLP con GELU. El modelo aprende prediciendo las representaciones latentes de parches enmascarados generadas por un profesor con media móvil exponencial (EMA), siguiendo la familia de métodos JEPA. La entrada es audio mono a 16 kHz.

Es relevante porque ofrece una alternativa compacta (85 M de parámetros, repo de 0,3 GB) a los codificadores auto-supervisados clásicos de audio, con un rendimiento especialmente destacado en música dentro de la evaluación X-ARES. Conviene subrayar que esta versión es una ejecución de entrenamiento actualizada (16 kHz, 200.000 pasos) y no una reproducción exacta del modelo original presentado en ICME 2025 (32 kHz, 100.000 pasos), que sigue disponible en su propio repositorio. El modelo se distribuye únicamente con el encoder estudiante; el predictor y el profesor del preentrenamiento no se exportan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 12 capas, 768 dimensiones, 12 cabezas de atencion; frontend de espectrograma mel de 128 bandas con proyeccion lineal de parches |
| Parametros totales | 85.484.928 (85,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como ventana de LLM: la entrada es audio mono a 16 kHz troceado en parches de 16 bandas mel x 16 tramas; no se especifica duracion maxima de audio |
| Tipos de cuantizacion | No disponible; los pesos publicados estan en float32 y no se han publicado versiones GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | No disponible (entrenamiento auto-supervisado sobre AudioSet, sin objetivo ni evaluacion por idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32) con implementacion personalizada de `transformers` (`custom_code`) |
| Dimension de embedding | 768 (clip y trama) |
| Frecuencia de muestreo de entrada | 16 kHz, mono |
| Datos de entrenamiento | AudioSet |
| Pasos de entrenamiento | 200.000 |
| Tamano del repositorio | 0,3 GB |
| Pipeline | `feature-extraction` |
| Politica de extraccion | `overlap50_two_phase` |

## Arquitectura y entrenamiento

El modelo sigue el paradigma JEPA (Joint Embedding Predictive Architecture) aplicado al audio: el encoder procesa un espectrograma mel de 128 bandas con una proyeccion lineal que convierte parches de 16 bandas x 16 tramas en tokens, anade embeddings posicionales sinusoidales y aplica 12 capas de atencion con LayerNorm y MLP con activacion GELU. El objetivo de entrenamiento es el error cuadratico medio (MSE) entre las representaciones predichas de los parches enmascarados y las representaciones del profesor, actualizado por media movil exponencial con decaimiento de 0,996 a 1,0. La mascara de parches se aplica con una tasa del 40-60 % con ruido de mascara blanco.

Los datos de entrenamiento proceden integramente de AudioSet, con un presupuesto de 200.000 pasos de optimizador y semilla fija segun la receta `audio_jepa/audioset/default`. La exportacion contiene unicamente el encoder estudiante, que es lo que corresponde a la ruta de inferencia del modelo de investigacion. Los pesos se guardan en float32. El autor indica que esta ejecucion (`jp6l70l6`) obtiene mejores resultados X-ARES que el checkpoint original de ICME 2025, aunque advierte que no es una reproduccion numerica exacta: la coincidencia con la receta es de hiperparametros, y la reproducion numerica exacta depende tambien de la version del codigo de entrenamiento y del entorno de ejecucion.

## Capacidades

- Extraccion de embeddings de audio a nivel de clip: un vector de 768 dimensiones que resume el contenido global de un fragmento.
- Extraccion de embeddings a nivel de trama: representaciones de 768 dimensiones por posicion temporal, utiles para tareas con localizacion temporal.
- Aprendizaje auto-supervisado sobre AudioSet, lo que le permite servir de base para fine-tuning en clasificacion, etiquetado (tagging) y deteccion de eventos sonoros.
- Rendimiento destacado en la categoria de musica dentro de X-ARES (44,27 sobre 100), el mas alto entre las variantes JEPA y varios de los baselines comparados.
- No es un modelo generativo: no produce texto, no transcribe voz y no genera audio.
- No soporta tool calling ni function calling.
- No incorpora capacidades de agente ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking) ni de procesamiento de vision, texto o audio de salida.
- Soporte multilingue no documentado: no hay objetivo ni evaluacion por idioma.

## Casos de uso

- Etiquetado automatico de audio (audio tagging) sobre taxonomia AudioSet: se congela el encoder y se entrena una cabeza lineal o MLP sobre los embeddings de clip de 768 dimensiones para clasificar eventos sonoros. El modelo esta preentrenado con ese vocabulario, por lo que la transferencia es directa.
- Recuperacion y busqueda de audio por similitud: indexando embeddings de clip en una base vectorial se pueden construir buscadores de fragmentos acusticamente parecidos, utiles en archivos sonoros, librerias de efectos o catalogos musicales.
- Deteccion de eventos con localizacion temporal: usando los embeddings de trama en lugar de los de clip, se puede entrenar un clasificador por trama para delimitar el inicio y el fin de un evento (cristales rotos, disparos, ladridos) sin necesidad de anotaciones a nivel de clip.
- Preentrenamiento para dominios con pocas etiquetas: al ser un backbone de 85 M de parametros, es razonable usarlo como inicializacion en tareas de audio medico, industrial o bioacustica donde solo hay unos cientos de ejemplos etiquetados.
- Analitica musical y recomendacion: dado su mejor comportamiento relativo en la categoria de musica, puede emplearse para calcular similitud entre pistas, agrupar generos o construir features para sistemas de recomendacion.
- Monitorizacion acustica continua: con 0,3 GB de pesos y consumo de VRAM inferior a 1 GB, puede ejecutarse de forma sostenida en un nodo de borde o en CPU para vigilar entornos urbanos, industriales o domesticos y detectar anomalias sonoras.
- Deduplicacion y limpieza de corpus de audio: los embeddings de clip permiten agrupar fragmentos casi identicos en datasets de entrenamiento, reduciendo redundancia y fuga de datos entre particiones.
- Distilacion y extraccion de caracteristicas para modelos mayores: al ser un encoder pequeno y rapido, sirve como extractor de features en pipelines donde el coste computacional es la restriccion principal.

## Benchmarks y rendimiento

Resultados en X-ARES (escala 0-100, mayor es mejor), segun los datos reportados por el autor. Todas las variantes de Audio-JEPA y BEST-RQ de la tabla se entrenaron sobre la misma particion de AudioSet durante 200.000 pasos; los baselines preentrenados se muestran a modo de comparacion.

| Modelo | Speech | Music | Environment | Global Mean | Mean of Means |
|---|---:|---:|---:|---:|---:|
| data2vec | 50,62 | 23,24 | 15,41 | 37,83 | 29,76 |
| wav2vec 2.0 | 41,79 | 34,94 | 29,52 | 37,84 | 35,42 |
| Whisper | 49,19 | 38,67 | 28,61 | 42,75 | 38,82 |
| Audio-JEPA (esta version) | 29,64 | 44,27 | 25,61 | 31,18 | 33,17 |
| BEST-RQ (Conformer) | 40,43 | 35,58 | 30,81 | 37,43 | 35,60 |
| BEST-RQ (ViT) | 32,87 | 41,62 | 34,50 | 34,88 | 36,33 |
| BEST-RQ-2 (Interspeech 2026) | 38,49 | 54,40 | 46,39 | 43,21 | 46,43 |
| BEST-RQ-2.1 | 52,60 | 62,23 | 53,38 | 54,59 | 56,07 |
| BEST-RQ-2.2 | 53,78 | 63,90 | 55,71 | 56,11 | 57,80 |

Notas sobre la medicion: los resultados de Audio-JEPA corresponden a la ejecucion `jp6l70l6` y fueron proporcionados por el autor; el resto de puntuaciones proceden del README del proyecto. Son resultados de investigacion reportados, no una nueva ejecucion de benchmark sobre las exportaciones de `transformers`. La columna Global Mean promedia todas las tareas del benchmark y Mean of Means da el mismo peso a las categorias de habla, musica y entorno.

No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Pesos en float32: aproximadamente 342 MB (85,48 M de parametros x 4 bytes); el repositorio completo ocupa 0,3 GB.
- VRAM estimada para inferencia: por debajo de 1 GB con lotes pequenos y fragmentos de audio cortos; entre 2 y 4 GB si se procesan lotes grandes o audios muy largos, debido a las activaciones del espectrograma mel.
- Cabe en cualquier GPU de consumo: GTX 1060 6 GB, RTX 3060, RTX 4060, RTX 4090, etc. Tambien es viable en CPU para extraccion por lotes, aunque con menor throughput.
- GPUs de datacenter: A100 o H100 solo tienen sentido para fine-tuning a gran escala o extraccion masiva en paralelo; para inferencia puntual son desproporcionadas.
- Opciones de despliegue: la libreria `transformers` (>=4.57, <6) con `trust_remote_code=True`, junto con `torch>=2.9.1`, `torchaudio>=2.9.1`, `timm>=0.9` y `einops>=0.7`. Se recomienda que las versiones de PyTorch y torchaudio coincidan. No es compatible con vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo generativo y no expone una interfaz de chat ni de muestreo de tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa centrada en los modelos incluidos en la evaluacion X-ARES. Los recuentos de parametros y licencias de los modelos alternativos no se detallan en la informacion proporcionada.

| Modelo | Parametros | Contexto de entrada | X-ARES Global Mean | X-ARES Mean of Means | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Audio-JEPA-base (esta ficha) | 85,5 M | Audio mono 16 kHz, espectrograma mel de 128 bandas | 31,18 | 33,17 | MIT | HuggingFace, requiere `trust_remote_code` |
| BEST-RQ-2.2-base | No disponible | No disponible | 56,11 | 57,80 | No disponible | HuggingFace (ltuncay/BEST-RQ-2.2-base) |
| BEST-RQ-2.1-base | No disponible | No disponible | 54,59 | 56,07 | No disponible | HuggingFace (ltuncay/BEST-RQ-2.1-base) |
| Whisper-base | No disponible | No disponible | 42,75 | 38,82 | No disponible | HuggingFace (openai/whisper-base) |
| wav2vec2-large-100k-voxpopuli | No disponible | No disponible | 37,84 | 35,42 | No disponible | HuggingFace (facebook/wav2vec2-large-100k-voxpopuli) |
| data2vec-audio-base | No disponible | No disponible | 37,83 | 29,76 | No disponible | HuggingFace (facebook/data2vec-audio-base) |

Lectura de la comparativa: Audio-JEPA-base queda por debajo de todos los baselines en la media global, pero supera a data2vec, a wav2vec 2.0 y a Whisper en la categoria de musica (44,27 frente a 23,24, 34,94 y 38,67 respectivamente), y supera a data2vec tambien en la media equilibrada por categorias. La recomendacion explicita del autor es usar BEST-RQ-2.2-base si el objetivo es el mejor resultado X-ARES dentro de esta familia.

## Limitaciones y advertencias

- Rendimiento en habla bajo: 29,64 sobre 100 en X-ARES, la puntuacion mas baja de toda la tabla comparativa. No es una buena eleccion para tareas centradas en voz; para eso hay alternativas mejores dentro del mismo ecosistema.
- Rendimiento global inferior a los baselines: 31,18 de media global, por debajo de data2vec (37,83), wav2vec 2.0 (37,84) y Whisper (42,75).
- Solo se exporta el encoder estudiante: el predictor y el profesor del preentrenamiento no estan incluidos, por lo que no se puede reproducir el bucle de preentrenamiento desde este repositorio.
- No es una reproduccion exacta del modelo ICME 2025: cambia la frecuencia de muestreo (16 kHz frente a 32 kHz) y el numero de pasos (200.000 frente a 100.000). Los resultados no deben presentarse como los del articulo original.
- No es un modelo generativo ni un sistema ASR: no genera texto ni transcripciones; para tareas supervisadas requiere anadir y entrenar una cabeza especifica.
- Sesgos de dominio: AudioSet procede de YouTube y contiene ruido de etiquetado, solapamiento de eventos y un sesgo hacia contenidos en ingles y hacia determinados generos musicales y entornos urbanos occidentales.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos al usar los embeddings con clasificadores mal calibrados o umbrales no validados.
- Cobertura idiomatica no documentada: no hay evaluacion por idioma ni garantia de comportamiento homogeneo entre lenguas y acentos.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True` en `transformers`, lo que implica ejecutar codigo del repositorio del autor; conviene revisarlo antes de desplegarlo en produccion.
- Sin cuantizaciones oficiales: solo hay pesos float32, lo que limita optimizaciones de memoria y latencia basadas en int8 o int4.
- Licencia del modelo frente a licencia de los datos: el modelo es MIT, pero AudioSet tiene sus propias condiciones de uso; si se redistribuye o se usa comercialmente, hay que verificar la situacion de los datos subyacentes.
- Rendimiento real no verificado: las puntuaciones X-ARES son resultados reportados por el autor y no una nueva ejecucion independiente sobre esta exportacion de `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ltuncay/Audio-JEPA-base
- Modelo original ICME 2025 (32 kHz, 100.000 pasos): https://huggingface.co/ltuncay/Audio-JEPA
- Modelo recomendado por el autor, BEST-RQ-2.2-base: https://huggingface.co/ltuncay/BEST-RQ-2.2-base
- BEST-RQ-2.1-base: https://huggingface.co/ltuncay/BEST-RQ-2.1-base
- BEST-RQ-2: https://huggingface.co/ltuncay/BEST-RQ-2
- BEST-RQ-ViT: https://huggingface.co/ltuncay/BEST-RQ-ViT
- Repositorio de investigacion (recetas y README con resultados): https://github.com/LudovicTuncay/audio-embeddings
- Receta de entrenamiento: https://github.com/LudovicTuncay/audio-embeddings/blob/bb88bf790b1dcf8251c6b38e7a4766534adf33d3/configs/experiment/audio_jepa/audioset/default.yaml
- Ejecucion de entrenamiento en Weights & Biases (`jp6l70l6`): https://wandb.ai/tuncay-ludovic/audio%20embeddings/runs/jp6l70l6
- Paper de X-ARES (arXiv:2505.16369): https://arxiv.org/abs/2505.16369
- Baseline data2vec-audio-base: https://huggingface.co/facebook/data2vec-audio-base
- Baseline wav2vec2-large-100k-voxpopuli: https://huggingface.co/facebook/wav2vec2-large-100k-voxpopuli
- Baseline Whisper-base: https://huggingface.co/openai/whisper-base

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los enlaces obtenidos correspondian a un operador de telefonia movil y no se han incluido).
