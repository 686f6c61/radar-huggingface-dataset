# 0xanto/eg2-tamil

## Resumen

eg2-tamil es un modelo de reconocimiento automático del habla (ASR) para tamil, desarrollado por el usuario 0xanto. No es un transformer de audio entrenado desde cero: es un "lector" CTC pequeño montado sobre el encoder de audio de [EmbeddingGemma 2](https://huggingface.co/google/embeddinggemma-2). Recibe audio a 16 kHz y devuelve texto en escritura tamil, con un total de 70.599.951 parámetros entrenables en el repositorio distribuido.

La arquitectura combina el encoder Conformer de 12 capas de EmbeddingGemma 2 (a 25 tramas por segundo), del que se congelan las 10 capas inferiores y se ajustan las 2 superiores, con un mezclador aprendido de las 13 activaciones del encoder, un transformer lector de 6 capas con dimensión 512 y una cabeza CTC de 1.024 unidades BPE tamil inicializadas desde los embeddings de texto de Gemma. Se entrenó sobre 462 horas de habla tamil procedentes de Common Voice, IISc-MILE y FLEURS.

Su relevancia práctica está en el coste de despliegue: el modelo corre en CPU a 11–16 veces tiempo real en un portátil de 8 núcleos, y admite un modelo de lenguaje KenLM de 4-gramas opcional que reduce el WER de forma notable (de 38,4 % a 31,6 % en FLEURS ta_in). Frente a alternativas multilingües grandes, ofrece una huella mínima y una licencia Apache 2.0 sin restricciones, a cambio de un rendimiento claramente por debajo del estado del arte y de estar limitado a habla leída.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CTC sobre encoder de audio Conformer (12 capas, 25 tramas/s) de EmbeddingGemma 2 + mezclador aprendido de 13 activaciones + transformer lector de 6 capas (d=512) + cabeza CTC de 1.024 unidades BPE |
| Parámetros totales | 70.599.951 (parámetros entrenables del repo; las 10 capas congeladas del encoder se descargan aparte desde google/embeddinggemma-2, ~1,5 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como contexto textual; el script oficial segmenta audio de más de 30 s en puntos de silencio y une las transcripciones |
| Tipos de cuantización | No disponible; el repositorio solo distribuye safetensors sin versiones cuantizadas publicadas |
| Idiomas soportados | Tamil (ta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `config.json`); pesos del encoder base en formato HuggingFace aparte |
| Entrada | Audio mono a 16 kHz |
| Salida | Texto en escritura tamil (solo script tamil, sin dígitos ni latinos) |
| Modelo base | google/embeddinggemma-2 |
| Tamaño del repo | 0,7 GB (+ ~1,5 GB del encoder congelado en la primera ejecución) |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de audio de EmbeddingGemma 2, formado por 12 capas Conformer que producen 25 tramas por segundo. Las 10 capas inferiores permanecen congeladas y solo se ajustan las 2 superiores; un mezclador aprendido combina las 13 activaciones (salida de cada capa más la entrada) antes de pasarlas al lector. El lector es un transformer de 6 capas con d=512, y la cabeza CTC tiene 1.024 filas, una por unidad BPE tamil, cada una inicializada con el embedding de texto de Gemma correspondiente a esa unidad. Es decir, se transfiere conocimiento texto→audio vía inicialización de la cabeza, no mediante un decoder autorregresivo.

El entrenamiento usó 462 horas de habla tamil: 340 h de la parte Common Voice de Prajwal-143/ASR-Tamil-cleaned, 116 h de la parte MILE del mismo dataset y 6 h de FLEURS ta_in. La preparación descarta cualquier identificador de clip ya visto, leyendo primero los ids de test, después los de validación y por último los de entrenamiento, de modo que ningún clip de test o validación aparece en train y ningún clip se repite (la regla opera sobre ids, no sobre texto). Se entrenó en una única NVIDIA L4 en bf16 durante 18.270 pasos de 600 s de audio con padding, aproximadamente 6,3 épocas, con AdamW, warmup y decaimiento coseno hasta el presupuesto temporal, además de SpecAugment. La decodificación por defecto es CTC greedy; opcionalmente se puede usar beam search con un modelo de lenguaje KenLM de 4-gramas de palabras (366 MB, 74,5M palabras de vocabulario construido con transcripciones de train, Wikipedia en tamil y dos ficheros de AI4Bharat Sangraha).

Como ablaciones destacadas del autor, medidas en los conjuntos de validación en el paso 1.250 (WER medio, menor es mejor): 1.024 unidades BPE con encoder congelado dan 56,5 %, 3.793 unidades tipo token de Gemma con encoder congelado dan 63,0 %, y 1.024 unidades BPE con las 2 capas superiores ajustadas dan 50,0 %. El autor advierte que la comparación con el ajuste fino no está controlada, porque el learning rate decae más despacio en la ejecución principal de 6 h.

## Capacidades

- Reconocimiento de habla tamil offline: convierte audio de 16 kHz en texto en escritura tamil.
- Decodificación CTC greedy sin dependencias externas de decoder.
- Decodificación con beam search + modelo de lenguaje KenLM de 4-gramas opcional (pyctcdecode), con mejora medida de entre 2,5 y 6,9 puntos de WER según el conjunto.
- Segmentación automática de audio largo: el script oficial corta en puntos silenciosos el audio de más de 30 s y une los textos resultantes.
- Ejecución en CPU: 11–16 veces tiempo real en un portátil de 8 núcleos, sin GPU.
- Inicialización multilingüe heredada del encoder de EmbeddingGemma 2 (el modelo solo se ha entrenado y evaluado para tamil).
- No soporta tool calling, function calling, agentes, visión, audio de entrada multilingüe ni modo "thinking": es un modelo ASR puro, sin componente generativo de texto.

## Casos de uso

- Transcripción de notas de voz y reuniones en tamil en local: al correr en CPU a 11–16x tiempo real, se puede integrar en un portátil o en un servidor sin GPU para pasar actas a texto sin enviar audio a la nube.
- Subtitulado de archivos de audio largos: el script oficial trocea el audio de más de 30 s en silencios y concatena la salida, lo que permite procesar entrevistas o podcasts sin escribir lógica de segmentación propia.
- Generación de corpus para entrenar modelos de lenguaje en tamil: el pipeline de transcripción en lote (un fichero, una línea con ruta y texto separados por tabulador) facilita construir datasets de habla etiquetada a bajo coste.
- Interfaces de voz para atención al ciudadano en tamil: con un WER de 24,2 % en IISc-MILE y 21,7 % con LM, es viable para comandos y formularios guiados donde el dominio léxico es cerrado, no para dictado libre.
- Indexación y búsqueda de archivos de audio: transcribir un archivo de grabaciones y montar búsqueda textual sobre el resultado, usando el LM para mejorar la legibilidad de las transcripciones indexadas.
- Investigación en ASR de bajos recursos: la receta (encoder congelado de EmbeddingGemma 2 + lector CTC pequeño + inicialización de cabeza con embeddings de texto) es reproducible con un solo L4 y sirve como línea base para otras lenguas.
- Transcripción en dispositivos de borde o entornos aislados: el modelo entrenable ocupa 0,7 GB y no requiere red una vez descargado el encoder base, lo que encaja en despliegues sin conectividad.
- Pre-etiquetado para revisión humana: usar la salida greedy como primera pasada y aplicar el LM solo donde el coste de RAM (~0,7 GB adicionales para el LM) sea asumible.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). Menor es mejor en todas las métricas.

| Conjunto de test | Decodificación | WER | CER |
|---|---|---|---|
| FLEURS ta_in (oficial, 591 utts) | CTC greedy | 38,4 % | 15,1 % |
| IISc-MILE (test oficial, 10.844 utts) | CTC greedy | 24,2 % | 4,5 % |
| FLEURS ta_in | Beam + KenLM 4-gramas | 31,6 % | 13,8 % |
| IISc-MILE | Beam + KenLM 4-gramas | 21,7 % | 3,8 % |

Notas del autor sobre estas cifras: las referencias conservan dígitos y letras latinas mientras el modelo solo escribe escritura tamil, por lo que esas palabras cuentan siempre como error; es la causa principal del CER más alto en FLEURS. La evaluación con LM mantiene clips de hasta 120 s (IISc-MILE: 10.845 utts), de ahí que sus cifras greedy sean 0,1 puntos peores. El model-index del repositorio recoge las cifras greedy porque no requieren LM.

Ablaciones en validación, paso 1.250 (WER medio):

| Configuración | WER |
|---|---|
| 1.024 unidades BPE, encoder congelado | 56,5 % |
| 3.793 unidades tipo token Gemma, encoder congelado | 63,0 % |
| 1.024 unidades BPE, 2 capas superiores ajustadas | 50,0 % |

No se han publicado resultados de benchmarks comparativos con otros sistemas ASR en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entorno a 1–2 GB en bf16 contando los 70,6M de parámetros entrenables más las capas congeladas del encoder base (~1,5 GB de descarga). Estimación a partir del tamaño del repositorio y del encoder; el autor no publica cifras de VRAM.
- GPU recomendadas: el autor entrenó en una única NVIDIA L4; para inferencia no se especifica GPU concreta. Cualquier GPU con 2 GB o más de memoria es suficiente por tamaño, aunque no hay datos medidos.
- GPU de consumo: cabe holgadamente en cualquier RTX o GTX moderna por tamaño de pesos; el autor no publica latencias en GPU.
- CPU: es el escenario documentado. En un portátil de 8 núcleos, 11–16 veces tiempo real (mayor es mejor), sin GPU.
- Memoria RAM adicional: ~0,7 GB si se usa el modelo de lenguaje KenLM de 4-gramas (366 MB de fichero).
- Opciones de despliegue: el repositorio oficial en GitHub (scripts/transcribe.py) es la vía soportada; incluye una demo web local con micrófono o subida de fichero. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo CTC de este tipo.
- Throughput: no se publican cifras de throughput en lote ni de latencia por utterance; solo el factor 11–16x tiempo real en CPU.

## Comparativa con modelos similares

No hay datos de benchmarks de competidores en la información proporcionada, así que las cifras de rendimiento de terceros se marcan como no disponibles. La comparación se limita a parámetros, licencia y encaje de despliegue.

| Modelo | Tipo | Parámetros | Idiomas | Licencia | Rendimiento en tamil |
|---|---|---|---|---|---|
| eg2-tamil | CTC sobre encoder Conformer + lector transformer | 70,6M entrenables + encoder base congelado | Solo tamil | Apache 2.0 | WER 24,2 % (IISc-MILE), 38,4 % (FLEURS) |
| Whisper small (OpenAI) | Encoder-decoder transformer | ~244M | Multilingüe | MIT | No disponible en la información proporcionada |
| Whisper large-v3 (OpenAI) | Encoder-decoder transformer | ~1.550M | Multilingüe | MIT | No disponible en la información proporcionada |
| Modelos ASR específicos de tamil (varias fuentes) | Diversos | No disponible | Tamil | No disponible | No disponible |

Salvedad importante: las cifras de este modelo no son directamente comparables con las publicadas por otros sistemas, porque aquí las referencias conservan dígitos y letras latinas que el modelo nunca emite y se cuentan como error. Además, los resultados del model-index están marcados como no verificados. Los resultados de la búsqueda web devolvieron, sobre todo, modelos de lenguaje en tamil (tamil-llama, gpt-2-tamil, tamil-large-language-model-7b-v1.0, TAMIL AI), que son de otra categoría y no sirven como comparación de ASR.

## Limitaciones y advertencias

- Entrenado y evaluado solo con habla leída; el autor advierte explícitamente de que el habla conversacional y el audio con ruido quedan fuera de su dominio (la model card disponible está truncada justo en este punto, por lo que el alcance exacto de la advertencia no se puede citar completo).
- Solo escribe escritura tamil: no emite dígitos ni letras latinas, aunque las referencias los contengan, lo que infla el WER y sobre todo el CER en corpus como FLEURS.
- El WER absoluto es alto para uso general: 38,4 % en FLEURS ta_in sin LM. No es adecuado para dictado libre ni para dominios abiertos sin revisión humana.
- La preparación de datos deduplica por identificador de clip, no por texto; el propio autor remite a este punto en las limitaciones, de modo que puede haber contenido textual solapado entre particiones.
- Idioma único: no hay soporte para código mezclado tamil-inglés, muy habitual en el habla real, ni para variantes regionales más allá de lo presente en los datos.
- Riesgo de alucinación léxica inherente a CTC con LM: el modelo de 4-gramas puede imponer palabras plausibles aunque el audio no las respalde; conviene validar el efecto del LM por dominio antes de producción.
- El repositorio no incluye las 10 capas congeladas del encoder; la primera ejecución descarga ~1,5 GB desde google/embeddinggemma-2, lo que introduce una dependencia de red y de la disponibilidad de ese repositorio (además de heredar las condiciones de uso del modelo base).
- La decodificación con LM requiere pyctcdecode, que declara incompatibilidad con numpy 2 aunque funciona en la práctica; hay que instalar con `--no-deps`, un detalle frágil para entornos gestionados.
- Licencia Apache 2.0 en este repositorio, pero el uso comercial debe revisar también la licencia del modelo base EmbeddingGemma 2, no cubierta por esta ficha.
- Sin adopción ni validación externa: 0 descargas y 0 likes en el momento de la consulta, y benchmarks no verificados por terceros.
- Las cifras de VRAM y de rendimiento en GPU no están publicadas; las estimaciones de esta ficha se derivan del tamaño de los pesos y deben confirmarse en el entorno objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xanto/eg2-tamil
- Repositorio de código y scripts de transcripción: https://github.com/0xAnto/eg2-tamil
- Demo local (sección "Demo" del README): https://github.com/0xAnto/eg2-tamil#demo
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Dataset Prajwal-143/ASR-Tamil-cleaned: https://huggingface.co/datasets/Prajwal-143/ASR-Tamil-cleaned
- Dataset deepdml/iisc-mile-tamil-asr: https://huggingface.co/datasets/deepdml/iisc-mile-tamil-asr
- Dataset google/fleurs: https://huggingface.co/datasets/google/fleurs
- Dataset ai4bharat/sangraha: https://huggingface.co/datasets/ai4bharat/sangraha
- Dataset wikimedia/wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia

Enlaces devueltos por la búsqueda web no relacionados con este modelo (son modelos de lenguaje en tamil, no ASR; se incluyen solo por trazabilidad): https://www.tamil-ai.com/, https://github.com/abhinand5/tamil-llama, https://huggingface.co/abinayam/gpt-2-tamil, https://huggingface.co/mervinpraison/tamil-large-language-model-7b-v1.0, https://www.modelfront.com/languages/tamil.
