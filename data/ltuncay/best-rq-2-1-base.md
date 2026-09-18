# ltuncay/BEST-RQ-2.1-base

## Resumen

BEST-RQ-2.1-base es un codificador de audio auto-supervisado desarrollado por ltuncay (Ludovic Tuncay) y publicado en Hugging Face bajo licencia MIT. Se trata de un transformer de 12 capas y 768 dimensiones (85.482.784 parámetros, ~85,5 M) que procesa formas de onda mono a 16 kHz y devuelve embeddings de clip y de fotograma de 768 dimensiones. Su funcion es actuar como extractor de caracteristicas (pipeline `feature-extraction`) sobre el que se anade una cabeza de tarea para clasificacion de audio, reconocimiento de eventos, tareas musicales o de habla, en lugar de generar texto de forma directa.

El modelo se entrena sobre AudioSet con un presupuesto configurado de 200.000 pasos de optimizador y el objetivo BEST-RQ (masked prediction sobre objetivos de un codebook congelado, con una tasa de enmascaramiento del 80%). Pertenece a la familia BEST-RQ-2, presentada junto al benchmark X-ARES (arXiv:2505.16369), y su relevancia actual radica en que los codificadores auto-supervisados de audio han superado a los baselines clasicos (data2vec, wav2vec 2.0, Whisper) en tareas no linguisticas como musica y entorno: BEST-RQ-2.1-base alcanza un Global Mean de 54,59 y un Mean of Means de 56,07 en X-ARES.

El propio autor recomienda BEST-RQ-2.2-base para proyectos nuevos, por obtener los mejores resultados de la familia (Global Mean 56,11). Este repositorio contiene el codificador entrenado, la configuracion de preprocesado y la implementacion personalizada para Transformers, de modo que no es necesario instalar el repositorio de investigacion original. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que es una publicacion de investigacion sin validacion comunitaria extensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 12 capas, 768 dimensiones, 12 cabezas de atencion; frontend de espectrograma mel de 128 bins con proyeccion lineal de parches; RoPE temporal, RMSNorm, SwiGLU y normalizacion QK |
| Parametros totales | 85.482.784 (~85,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no declara ventana fija; acepta audio de duracion variable mediante mascara de atencion de muestras) |
| Tipos de cuantizacion | No disponible (pesos exportados en float32; no se documentan versiones cuantizadas, GGUF ni ONNX) |
| Idiomas soportados | No disponible (codificador de audio; no declara idiomas, aunque el autor usa Whisper como baseline en habla) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), con codigo Python personalizado en el repositorio que requiere `trust_remote_code=True` |

Datos adicionales: forma de parche de 128 bins mel por 4 fotogramas temporales; politica de extraccion `overlap50_two_phase`; tamano del repositorio 0,3 GB; metadatos de paso del checkpoint no registrados en este fichero safetensors.

## Arquitectura y entrenamiento

El modelo es un transformer tipo ViT adaptado a audio: la entrada es un espectrograma mel de 128 bins que se proyecta linealmente en parches de 128 x 4 (bins mel x fotogramas temporales). Internamente usa RoPE temporal, RMSNorm, SwiGLU y normalizacion QK. El objetivo de entrenamiento es BEST-RQ: prediccion enmascarada de objetivos procedentes de un codebook congelado, con una tasa de enmascaramiento del 80%, sobre AudioSet y con un presupuesto de 200.000 pasos de optimizador. No se mencionan en la informacion disponible fases de RLHF ni de DPO, algo esperable en un codificador auto-supervisado que no genera lenguaje.

La exportacion a Transformers incluye solo el codificador: quedan fuera los predictores de preentrenamiento, los cuantizadores, los profesores y el estado del optimizador, por lo que este repositorio sirve para extraccion de caracteristicas y ajuste fino supervisado, pero no para continuar el entrenamiento auto-supervisado (para eso hay que usar el codigo Lightning original). Las caracteristicas de fotograma promedian los parches de frecuencia, es decir, no son la rejilla ViT frecuencia-tiempo en bruto; `pooler_output` aplica el preset de extraccion HEAR guardado, incluido el pooling con equilibrio de fase. La politica de extraccion documentada es `overlap50_two_phase`.

## Capacidades

- Extraccion de embeddings de audio: genera embeddings de clip (`pooler_output`) y de fotograma (`last_hidden_state`) de 768 dimensiones a partir de audio mono a 16 kHz.
- Clasificacion y etiquetado de audio mediante ajuste fino: el autor reporta resultados en las categorias de habla (Speech), musica (Music) y entorno (Environment) del benchmark X-ARES.
- Deteccion de eventos sonoros y comprension de escenas acusticas, reflejada en la puntuacion de la categoria Environment (53,38 en X-ARES).
- Tareas musicales (genero, instrumentacion, similitud) con la puntuacion mas alta de su generacion en la categoria Music (62,23).
- Tareas de habla no generativas (clasificacion, paralinguistica, comparacion de locutor) con 52,60 en la categoria Speech.
- Entrada de duracion variable: la mascara de atencion de muestras permite procesar audios de distinta longitud; las salidas incluyen mascara de atencion de fotogramas y timestamps en milisegundos (-1 en el padding).
- Ajuste fino supervisado: se puede llamar a `model.train()`, anadir una cabeza de tarea y optimizarla junto al codificador; guardado con `save_pretrained`.
- No soporta generacion de texto, tool calling, function calling, agentes, vision ni audio-a-texto: no es un modelo de lenguaje ni un modelo de dialogo.
- Soporte multilingue: no disponible; al operar sobre audio, la cobertura linguistica dependera de la cabeza de tarea que se anada.

## Casos de uso

- Etiquetado automatico de archivos de audio a gran escala: extraccion de embeddings de clip de 768 dimensiones para indexar y agrupar por similitud bibliotecas de audio (podcasts, efectos, grabaciones de campo) sin necesidad de transcripcion.
- Deteccion de eventos sonoros en entornos urbanos o industriales: ajuste fino sobre las representaciones de fotograma para reconocer sirenas, cristales, maquinaria, etc.; la puntuacion de 53,38 en la categoria Environment de X-ARES indica una capacidad solida frente a baselines genericos.
- Clasificacion musical y recomendacion por contenido: uso de los embeddings de clip para similitud entre pistas, deteccion de genero o instrumentacion; la categoria Music es la mas fuerte del modelo (62,23).
- Monitorizacion y analitica de llamadas: representaciones de habla para clasificar emocion, calidad de audio o tipo de interlocutor, complementando a un sistema ASR que produzca la transcripcion.
- Preentrenamiento para tareas de audio con pocas etiquetas: el codificador sirve como inicializacion congelada o ajustable en escenarios con datasets pequenos, ya que fue entrenado de forma auto-supervisada sobre AudioSet completo.
- Filtrado y control de calidad de datasets de audio: deteccion de clips ruidosos, mal etiquetados o fuera de dominio comparando embeddings con centroides de referencia antes de alimentar pipelines de entrenamiento.
- Base de investigacion en representaciones de audio: reproduccion y extension de los experimentos X-ARES, comparando politicas de pooling o cabezas de tarea sobre un codificador con licencia MIT.

## Benchmarks y rendimiento

Resultados en X-ARES (escala 0-100, mayor es mejor). Todos los modelos BEST-RQ-2 y los baselines audio-JEPA y BEST-RQ (Conformer/ViT) se entrenaron sobre la misma particion de AudioSet y durante 200.000 pasos. Los baselines preentrenados se muestran como comparacion.

| Modelo | Speech | Music | Environment | Global Mean | Mean of Means |
|---|---:|---:|---:|---:|---:|
| data2vec | 50,62 | 23,24 | 15,41 | 37,83 | 29,76 |
| wav2vec 2.0 | 41,79 | 34,94 | 29,52 | 37,84 | 35,42 |
| Whisper | 49,19 | 38,67 | 28,61 | 42,75 | 38,82 |
| Audio-JEPA | 29,64 | 44,27 | 25,61 | 31,18 | 33,17 |
| BEST-RQ (Conformer) | 40,43 | 35,58 | 30,81 | 37,43 | 35,60 |
| BEST-RQ (ViT) | 32,87 | 41,62 | 34,50 | 34,88 | 36,33 |
| BEST-RQ-2 | 38,49 | 54,40 | 46,39 | 43,21 | 46,43 |
| BEST-RQ-2.1 | 52,60 | 62,23 | 53,38 | 54,59 | 56,07 |
| BEST-RQ-2.2 | 53,78 | 63,90 | 55,71 | 56,11 | 57,80 |

Global Mean promedia todas las puntuaciones de tarea del benchmark; Mean of Means da el mismo peso a las medias de las categorias Speech, Music y Environment. Los resultados son resultados de investigacion reportados por el autor (y en el caso de Audio-JEPA, facilitados por el autor para la ejecucion `jp6l70l6`), no nuevas ejecuciones del benchmark sobre las exportaciones a Transformers. No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 85,5 M de parametros, los pesos ocupan aproximadamente 342 MB en float32 (formato exportado) y unos 171 MB en fp16. Con activaciones y buffers para clips tipicos, el consumo se mantiene por debajo de 1-2 GB. En CPU es perfectamente viable para lotes pequenos, aunque mas lento.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100. No requiere GPU de centro de datos; en estas ultimas el cuello de botella sera el preprocesado de audio, no el modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, y tambien en Apple Silicon (MPS) y en CPU.
- Opciones de despliegue: la ruta documentada es `transformers` (>= 4.57, < 6) con `AutoFeatureExtractor` y `AutoModel`, `trust_remote_code=True`, junto con `torch` >= 2.9.1, `torchaudio` >= 2.9.1, `timm` >= 0.9 y `einops` >= 0.7. Las herramientas habituales para LLM de texto (vLLM, llama.cpp, Ollama, TGI) no se documentan para este modelo y no hay versiones GGUF ni ONNX publicadas.
- Latencia y throughput: no disponible. No se publican mediciones de velocidad de inferencia en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoria (codificadores de audio auto-supervisados), usando los datos X-ARES y la informacion disponible:

| Modelo | Parametros | Global Mean (X-ARES) | Licencia | Disponibilidad |
|---|---|---|---|---|
| BEST-RQ-2.1-base | 85,5 M | 54,59 | MIT | Hugging Face, `transformers`, requiere `trust_remote_code` |
| BEST-RQ-2.2-base | No disponible | 56,11 | No disponible en la informacion | Hugging Face; recomendado por el autor para proyectos nuevos |
| BEST-RQ-2 | No disponible | 43,21 | No disponible en la informacion | Hugging Face |
| data2vec-audio-base | No disponible | 37,83 | No disponible en la informacion | Hugging Face (facebook/data2vec-audio-base) |
| wav2vec 2.0 | No disponible | 37,84 | No disponible en la informacion | Hugging Face (facebook/wav2vec2-large-100k-voxpopuli) |
| Whisper (base) | No disponible | 42,75 | No disponible en la informacion | Hugging Face (openai/whisper-base) |

Lectura de la comparativa: dentro del mismo presupuesto de entrenamiento (AudioSet, 200.000 pasos), BEST-RQ-2.1-base supera a data2vec, wav2vec 2.0, Whisper base, Audio-JEPA y BEST-RQ (Conformer y ViT) en las tres categorias, con la mayor ventaja en Music y Environment. La version 2.2 mejora a 2.1 en todas las categorias, por lo que 2.1 tiene sentido sobre todo como referencia de investigacion o cuando ya se tenga integrado en un pipeline existente.

## Limitaciones y advertencias

- Validacion comunitaria practicamente nula: 0 descargas y 0 likes en el momento de la consulta; es una publicacion de investigacion reciente sin adopcion amplia.
- No es un modelo generativo: no produce texto, transcripciones ni respuestas; cualquier aplicacion requiere anadir y entrenar una cabeza de tarea.
- Sesgos de los datos: AudioSet se construye a partir de audio de YouTube, con sobrerrepresentacion de contenido occidental, musical y de habla en ingles, y con posibles desequilibrios de genero, idioma y acentos que se trasladaran a las tareas derivadas.
- Riesgo de error en tareas derivadas: aunque no hay alucinacion en el sentido de generacion de texto, un clasificador ajustado sobre estos embeddings puede producir falsos positivos y negativos, especialmente en dominios acusticos poco representados en AudioSet.
- Sin datos de idioma: el modelo no declara cobertura linguistica; el rendimiento en habla dependera del idioma y de los datos de ajuste fino.
- Contexto: no se declara un limite de contexto; la memoria necesaria crece con la duracion del audio, por lo que clips muy largos requieren troceado y agregacion de embeddings.
- Codigo personalizado: el uso requiere `trust_remote_code=True`, lo que implica ejecutar Python incluido en el repositorio; conviene revisarlo y fijar una revision concreta (commit hash) para reproducibilidad.
- Exportacion limitada: el repositorio no incluye predictores, cuantizadores, profesores ni estado del optimizador, por lo que no sirve para continuar el preentrenamiento auto-supervisado.
- Metadatos incompletos: el paso del checkpoint no esta registrado en este fichero safetensors, lo que dificulta saber exactamente que punto del entrenamiento se exporto.
- Licencia MIT: permisiva y apta para uso comercial, sin las restricciones de licencias de investigacion; aun asi, el usuario debe verificar el cumplimiento de las condiciones de uso de AudioSet y de los datos con los que haga ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ltuncay/BEST-RQ-2.1-base
- BEST-RQ-2.2-base (recomendado por el autor): https://huggingface.co/ltuncay/BEST-RQ-2.2-base
- BEST-RQ-2: https://huggingface.co/ltuncay/BEST-RQ-2
- BEST-RQ-ViT: https://huggingface.co/ltuncay/BEST-RQ-ViT
- Audio-JEPA-base: https://huggingface.co/ltuncay/Audio-JEPA-base
- Paper X-ARES: https://arxiv.org/abs/2505.16369
- Repositorio del proyecto (README con resultados X-ARES): https://github.com/LudovicTuncay/audio-embeddings
- Ejecucion de Weights & Biases de Audio-JEPA: https://wandb.ai/tuncay-ludovic/audio%20embeddings/runs/jp6l70l6
- Baselines externos citados: https://huggingface.co/facebook/data2vec-audio-base, https://huggingface.co/facebook/wav2vec2-large-100k-voxpopuli, https://huggingface.co/openai/whisper-base
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo (devuelven paginas de foros de automocion, reproductores de video y buscadores ajenos al tema).
