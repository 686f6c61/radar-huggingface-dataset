# ltuncay/BEST-RQ-ViT

## Resumen

BEST-RQ-ViT es un encoder de audio auto-supervisado desarrollado por ltuncay (Ludovic Tuncay) y publicado en HuggingFace. Se trata de la variante basada en Vision Transformer del método BEST-RQ: un único encoder Transformer de 12 capas y 768 dimensiones (85.484.928 parámetros) que aprende prediciendo objetivos de un codebook congelado de proyecciones aleatorias a partir de features de audio enmascaradas, sin predictor de contextualización separado. Consume waveforms mono a 16 kHz y produce embeddings de clip y de frame de 768 dimensiones.

El modelo se entrenó sobre AudioSet durante 200.000 pasos de optimizador (paso verificado en los metadatos del checkpoint) con una ratio de enmascaramiento del 40-60%. Su objetivo es servir como extractor de representaciones de audio y como base para fine-tuning en tareas downstream de habla, música y sonido ambiental. La arquitectura usa un frontend de espectrograma mel de 128 bins proyectado linealmente en parches de 16 bins mel por 16 frames, con embeddings posicionales sinusoidales, LayerNorm y MLP con GELU.

Su relevancia actual es doble. Por un lado, es un punto de comparación reproducible dentro de la familia BEST-RQ y del proyecto audio-embeddings del mismo autor, cuyos resultados en el benchmark X-ARES (arXiv:2505.16369) se publican junto al modelo. Por otro, con solo ~85 M de parámetros y licencia MIT, es un encoder ligero y desplegable en hardware muy modesto para extracción de embeddings o como inicialización en pipelines de clasificación y etiquetado de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 12 capas, 768 dimensiones, 12 cabezas de atención; frontend de espectrograma mel de 128 bins con proyección lineal en parches de 16 bins mel x 16 frames; embeddings posicionales sinusoidales, LayerNorm, MLP con GELU |
| Parametros totales | 85.484.928 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No documentada. Entrada de waveform mono a 16 kHz de duración variable; la model card no especifica ventana máxima de audio |
| Tipos de cuantizacion | No se publican versiones cuantizadas. El export está en float32; no hay GGUF ni cuantizaciones de 8 o 4 bits disponibles |
| Idiomas soportados | No documentados. Entrenamiento auto-supervisado sobre AudioSet sin declaración de soporte idiomático específico |
| Licencia | MIT |
| Formato de pesos | safetensors (dtype float32), con código Python personalizado que requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

BEST-RQ-ViT es un Transformer denso de tipo encoder (ViT aplicado a espectrogramas mel) con 12 capas, dimensión oculta de 768 y 12 cabezas de atención. La entrada es un waveform mono remuestreado a 16 kHz del que se calcula un espectrograma mel de 128 bins en el interior del modelo; ese espectrograma se trocea en parches de 16 bins de frecuencia por 16 frames temporales y se proyecta linealmente antes de entrar en el Transformer. El modelo usa embeddings posicionales sinusoidales, LayerNorm y MLP con activación GELU.

El entrenamiento es auto-supervisado con el objetivo BEST-RQ: el encoder predice objetivos procedentes de un codebook congelado de proyecciones aleatorias a partir de las features de audio enmascaradas, con una ratio de enmascaramiento entre el 40% y el 60%. En esta variante ViT no existe un predictor de contextualización separado, a diferencia de la variante Conformer. El entrenamiento se realizó sobre AudioSet durante 200.000 pasos de optimizador. El repositorio contiene el encoder entrenado, la configuración de preprocesado y la implementación personalizada para Transformers; el export excluye los predictores de preentrenamiento, cuantizadores, teachers y el estado del optimizador, por lo que para continuar el entrenamiento auto-supervisado hay que usar el código y los checkpoints originales en Lightning.

Un detalle de implementación relevante para producción es la política de extracción documentada (`overlap50_two_phase`), que se usa en el `pooler_output` junto con un pooling de fase equilibrado. Las features de frame promedian los parches de frecuencia, es decir, no son la rejilla cruda frecuencia-tiempo del ViT. El preprocesado se limita a padding: el espectrograma y las convoluciones se calculan dentro del modelo, y la salida incluye máscara de atención de frames y timestamps en milisegundos.

## Capacidades

- Extracción de embeddings de audio: genera un vector de clip de 768 dimensiones (`pooler_output`) y una secuencia de embeddings de frame (`last_hidden_state`) para audio mono a 16 kHz.
- Salida con marcas temporales: los embeddings de frame van acompañados de timestamps en milisegundos y de una máscara de atención de frames, con -1 en posiciones de padding.
- Fine-tuning downstream: admite `model.train()`, la conexión de una cabeza de tarea y la optimización conjunta; el guardado se realiza con `save_pretrained` para modelo y procesador.
- Representaciones para tareas de habla, música y sonido ambiental: los resultados X-ARES cubren las tres categorías, con mejor comportamiento relativo en música y entorno que en habla.
- Recuperación y similitud: los embeddings de clip permiten búsqueda por similitud, clustering y deduplicación de audio.
- No realiza generación de texto, transcripción directa, traducción ni síntesis de voz: es un encoder, no un modelo generativo ni un sistema ASR completo.
- No dispone de tool calling, function calling, soporte de agentes ni razonamiento multi-paso: son capacidades propias de modelos de lenguaje y no aplican a esta arquitectura.
- No incorpora capacidades de visión, audio generativo, thinking mode ni procesamiento multimodal más allá del audio.

## Casos de uso

- Etiquetado de eventos sonoros: extraer embeddings de clip con `pooler_output` y entrenar un clasificador multiclase o multilabel sobre AudioSet, con el encoder como inicialización en lugar de partir de cero.
- Detección de escenas acústicas: usar los embeddings de frame y sus timestamps para localizar en el tiempo eventos concretos (cristales rotos, alarmas, tráfico) dentro de grabaciones largas.
- Búsqueda y recuperación de audio por similitud: indexar bases de audio mediante vectores de 768 dimensiones y resolver consultas por vecino más cercano para bibliotecas de efectos de sonido o archivos de podcast.
- Preentrenamiento para ASR: conectar una cabeza CTC o seq2seq sobre el encoder y hacer fine-tuning en un corpus etiquetado; el modelo aporta representaciones acústicas ya entrenadas con 200.000 pasos sobre AudioSet.
- Análisis musical: clasificación de género, instrumentación o estado de ánimo a partir de embeddings de clip, categoría en la que este checkpoint obtiene sus mejores puntuaciones relativas (41,62 en música frente a 32,87 en habla).
- Monitorización industrial y mantenimiento predictivo: detección de anomalías acústicas en maquinaria comparando embeddings de fragmentos frente a una distribución de referencia de funcionamiento normal.
- Bioacústica y monitorización ambiental: detección de especies o de patrones sonoros en grabaciones de campo, aprovechando la rama de entorno del benchmark (34,50) y el bajo coste computacional del modelo.
- Moderación y análisis de contenido de audio a escala: preprocesado por lotes de grandes volúmenes de audio para clasificación previa, dado que el modelo es pequeño y se puede ejecutar en GPU de gama baja.

## Benchmarks y rendimiento

Los resultados disponibles corresponden al benchmark X-ARES (puntuación de 0 a 100, mayor es mejor). Todos los modelos BEST-RQ y Audio-JEPA de la tabla se entrenaron sobre la misma partición de AudioSet durante 200.000 pasos. Son resultados de investigación reportados por el autor, no una nueva ejecución de los exports de Transformers.

| Modelo | Speech | Music | Environment | Global mean | Mean of means |
|---|---:|---:|---:|---:|---:|
| data2vec | 50,62 | 23,24 | 15,41 | 37,83 | 29,76 |
| wav2vec 2.0 | 41,79 | 34,94 | 29,52 | 37,84 | 35,42 |
| Whisper | 49,19 | 38,67 | 28,61 | 42,75 | 38,82 |
| Audio-JEPA | 29,64 | 44,27 | 25,61 | 31,18 | 33,17 |
| BEST-RQ (Conformer) | 40,43 | 35,58 | 30,81 | 37,43 | 35,60 |
| **BEST-RQ-ViT** | **32,87** | **41,62** | **34,50** | **34,88** | **36,33** |
| BEST-RQ-2 (Interspeech 2026) | 38,49 | 54,40 | 46,39 | 43,21 | 46,43 |
| BEST-RQ-2.1 | 52,60 | 62,23 | 53,38 | 54,59 | 56,07 |
| BEST-RQ-2.2 | 53,78 | 63,90 | 55,71 | 56,11 | 57,80 |

El "global mean" promedia todas las tareas del benchmark y el "mean of means" otorga el mismo peso a las medias de las categorías Speech, Music y Environment. En esta comparativa, BEST-RQ-ViT obtiene el mejor resultado en la categoría Environment (34,50) entre los modelos que no pertenecen a la familia BEST-RQ-2, y un "mean of means" de 36,33, superior al de la variante Conformer (35,60) y al de data2vec (29,76), pero por debajo de wav2vec 2.0 (35,42 en global mean, 35,60 en Conformer) y claramente por debajo de las variantes BEST-RQ-2.1 y BEST-RQ-2.2.

## Requisitos de hardware

- VRAM para inferencia en float32: aproximadamente 342 MB solo para los pesos, más activaciones modestas (el modelo procesa parches de 16 x 16 sobre un mel de 128 bins, por lo que el coste de activaciones es bajo).
- VRAM en float16/bfloat16: aproximadamente 171 MB para los pesos. En int8 serían unos 85 MB, aunque no se publican pesos en esas precisiones y habría que convertirlos.
- Cabe sobradamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con suficiente memoria. También es viable en CPU para inferencia puntual.
- GPU recomendadas: cualquiera de gama media para uso interactivo; A100, H100, L40S o T4 tienen sentido únicamente para procesar grandes volúmenes por lotes, donde el cuello de botella es el preprocesado de audio y no la memoria.
- Opciones de despliegue: `transformers` con `AutoModel` y `AutoFeatureExtractor`, con `trust_remote_code=True`. Dependencias: torch>=2.9.1, torchaudio>=2.9.1, timm>=0.9, einops>=0.7 y transformers>=4.57,<6. Es necesario que las versiones de PyTorch y torchaudio coincidan.
- No aplica el despliegue con vLLM, TGI, llama.cpp u Ollama, ya que son servidores orientados a modelos generativos de lenguaje. Para producción se puede exportar a ONNX o TorchScript, o servirse con FastAPI/TorchServe.
- Latencia y throughput estimados: no disponibles; no se publican cifras de latencia ni de rendimiento por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | X-ARES global mean | X-ARES mean of means | Parametros | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| BEST-RQ-ViT | 34,88 | 36,33 | 85.484.928 | MIT | HuggingFace (`ltuncay/BEST-RQ-ViT`) |
| BEST-RQ-2.2-base | 56,11 | 57,80 | No disponible | No disponible en la información | HuggingFace (`ltuncay/BEST-RQ-2.2-base`) |
| BEST-RQ-2.1-base | 54,59 | 56,07 | No disponible | No disponible en la información | HuggingFace (`ltuncay/BEST-RQ-2.1-base`) |
| BEST-RQ-2 | 43,21 | 46,43 | No disponible | No disponible en la información | HuggingFace (`ltuncay/BEST-RQ-2`) |
| BEST-RQ (Conformer) | 37,43 | 35,60 | No disponible | No disponible en la información | Codebase separado |
| Audio-JEPA-base | 31,18 | 33,17 | No disponible | No disponible en la información | HuggingFace (`ltuncay/Audio-JEPA-base`) |
| Whisper base | 42,75 | 38,82 | No disponible | No disponible en la información | HuggingFace (`openai/whisper-base`) |
| wav2vec 2.0 large | 37,84 | 35,42 | No disponible | No disponible en la información | HuggingFace (`facebook/wav2vec2-large-100k-voxpopuli`) |
| data2vec audio base | 37,83 | 29,76 | No disponible | No disponible en la información | HuggingFace (`facebook/data2vec-audio-base`) |

Dentro de la propia familia, el autor recomienda BEST-RQ-2.2-base como la opción con mejores resultados X-ARES, muy por encima de este checkpoint (56,11 frente a 34,88 en global mean). BEST-RQ-ViT mantiene interés como baseline ligero y como referencia de ablación (ViT frente a Conformer), y destaca relativamente en la categoría Environment (34,50), por delante de wav2vec 2.0 (29,52) y de Whisper (28,61) en esa misma categoría. Los recuentos de parámetros de los modelos alternativos no se facilitan en la información disponible.

## Limitaciones y advertencias

- Es un encoder, no un modelo generativo: no responde a instrucciones, no genera texto y requiere una cabeza de tarea y datos etiquetados para cualquier aplicación supervisada.
- Sesgos de AudioSet: el corpus procede de audio de YouTube, con desequilibrio de clases, predominio de contenidos en inglés y sobrerrepresentación de determinados entornos acústicos, lo que puede degradar el rendimiento en dominios poco representados.
- Resultados relativamente débiles en habla: 32,87 en la categoría Speech de X-ARES, por debajo de data2vec (50,62), Whisper (49,19) y wav2vec 2.0 (41,79). No es la mejor opción si el caso de uso principal es voz.
- Riesgo de sobreajuste al benchmark: las puntuaciones X-ARES proceden del autor del proyecto y no de una evaluación independiente; además, corresponden a los entrenamientos de investigación y no necesariamente a este export de Transformers.
- Contexto no documentado: la model card no especifica una duración máxima de audio soportada. Con embeddings posicionales sinusoidales y atención completa, el coste de atención crece de forma cuadrática con el número de parches.
- Restricciones de entrada: solo audio mono a 16 kHz; es obligatorio remuestrear y hacer downmix de estéreo antes del preprocesado.
- Ejecución de código remoto: el repositorio incluye código Python personalizado y requiere `trust_remote_code=True`, lo que implica ejecutar código de terceros en el entorno de inferencia.
- Ausencia de versiones cuantizadas: solo se publican pesos en float32 y safetensors, sin GGUF ni variantes de 8 o 4 bits, lo que obliga a convertir manualmente si se necesita menor precisión.
- Export incompleto para reanudar el preentrenamiento: el repositorio excluye predictores, cuantizadores, teachers y estado del optimizador, por lo que no permite continuar el entrenamiento auto-supervisado.
- Madurez y validación comunitaria: el modelo registra 0 descargas y 0 likes, con un tamaño de repositorio de 0,3 GB, por lo que no hay evidencia de uso en producción ni de validación por terceros.
- Reproducibilidad: se recomienda fijar el mismo hash de commit completo en ambos cargadores (modelo y procesador) para garantizar resultados reproducibles.
- Licencia MIT: permite uso comercial, modificación y redistribución, con la única obligación habitual de conservar el aviso de copyright y la licencia. No se documentan cláusulas adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ltuncay/BEST-RQ-ViT
- Paper de X-ARES (arXiv:2505.16369): https://arxiv.org/abs/2505.16369
- README del proyecto audio-embeddings (GitHub): https://github.com/LudovicTuncay/audio-embeddings/blob/bb88bf790b1dcf8251c6b38e7a4766534adf33d3/README.md
- Run de Weights & Biases con los resultados de Audio-JEPA: https://wandb.ai/tuncay-ludovic/audio%20embeddings/runs/jp6l70l6
- BEST-RQ-2.2-base (recomendado por el autor): https://huggingface.co/ltuncay/BEST-RQ-2.2-base
- BEST-RQ-2.1-base: https://huggingface.co/ltuncay/BEST-RQ-2.1-base
- BEST-RQ-2: https://huggingface.co/ltuncay/BEST-RQ-2
- Audio-JEPA-base: https://huggingface.co/ltuncay/Audio-JEPA-base
- data2vec-audio-base: https://huggingface.co/facebook/data2vec-audio-base
- wav2vec2-large-100k-voxpopuli: https://huggingface.co/facebook/wav2vec2-large-100k-voxpopuli
- Whisper base: https://huggingface.co/openai/whisper-base
- Manifiesto de exportación incluido en el repositorio: `export_manifest.json`
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos no guardan relación con el contenido de la ficha.
