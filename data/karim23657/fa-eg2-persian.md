# karim23657/fa-eg2-persian

## Resumen

FA-EG2 Persian es un sistema de reconocimiento automático del habla (ASR) para persa (farsi) construido sobre la arquitectura EmbeddingGemma 2 Transcribe. Lo desarrolla el autor independiente karim23657 y consiste en un adaptador ligero entrenado sobre el codificador de audio congelado de `google/embeddinggemma-2`. El componente entrenado es un pequeño transformer denominado *reader*, de 19,6 millones de parámetros y 6 capas, que se entrena con CTC para mapear cada token de audio de 40 ms a una palabra de una tabla fija de vocabulario persa.

El modelo resuelve el problema de transcripción de voz a texto en persa reutilizando un codificador de audio ya preentrenado y entrenando únicamente un cabezal ligero, lo que reduce drásticamente el coste de entrenamiento frente a un ASR completo desde cero. Es una adaptación fiel del repositorio de referencia `john-rocky/eg2-transcribe` (reader v2), manteniendo intactas la arquitectura del reader, el objetivo CTC y la decodificación greedy; los elementos específicos del persa (dataset, normalización de texto y tabla de palabras) son nuevos.

El modelo es relevante como ejemplo de adaptación de bajo coste de un modelo multimodal cerrado a un idioma concreto mediante congelación del codificador y entrenamiento de un cabezal ligero. El repositorio ocupa 0,2 GB, no registra descargas ni likes en el momento de la consulta y no publica información sobre licencia ni idiomas en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de audio EmbeddingGemma 2 congelado + reader transformer de 6 capas con CTC sobre tabla de palabras |
| Parámetros totales | 19,6 M en el reader entrenado (el codificador de audio congelado se suma aparte; su tamaño no se detalla) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la ventana depende del codificador de audio; se procesan tokens de 40 ms a 25 tokens/s) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Persa (farsi) |
| Licencia | No disponible |
| Formato de pesos | `best_model.pt`, `reader.pt` (PyTorch) más `reader_config.json`, vocabulario y tabla de embeddings |

## Arquitectura y entrenamiento

El pipeline parte de audio en cualquier frecuencia de muestreo, se remuestrea a 16 kHz mono y se convierte en log-mel con `Gemma4AudioFeatureExtractor`. Ese log-mel entra en el codificador de audio de EmbeddingGemma 2, que permanece congelado y produce tokens suaves de dimensión 512 a razón de 25 tokens por segundo (40 ms por token). El reader persa, un transformer de 6 capas y 19,6 M de parámetros, transforma cada token en un vector unitario de dimensión 768 más un logit de blank. Los logits sobre las N palabras más blank se calculan como el producto de un factor de escala por el coseno entre la representación del token y la tabla de palabras persa. La decodificación es CTC greedy (fusión de repeticiones y eliminación de blank), con opción de búsqueda por haz con rescoring KenLM.

La tabla de palabras se construye con la torre de texto del mismo EmbeddingGemma 2 (prompt `task: search result | query: `), con mean-pooling y normalización L2 al mismo espacio de 768 dimensiones que el reader aprende a producir; la decodificación greedy selecciona la palabra más cercana por token. El entrenamiento usa CTC con WER de validación por época, early stopping y checkpoints configurables por YAML.

Los datos de entrenamiento son 33.452 enunciados (unas 42 horas) del split `train` de `pymmdrza/Common-Voice-Speech-26.0-Persian-Clean`, con audio original a 24 kHz remuestreado a 16 kHz. La selección de modelo usa el split `validation` (341 enunciados) y la evaluación el split `test` (341 enunciados, 0,43 h), nunca visto en entrenamiento. El corpus de texto `PersianML/persian-text-corpus` (un shard, unos 300.000 documentos) se usa únicamente para completar el vocabulario hasta 60.000 palabras y para entrenar el KenLM. La normalización de texto aplica NFKC, plegado de variantes árabes a persas (ي→ی, ك→ک, ة→ه, أ/إ/آ/ٱ→ا, ؤ→و, ئ→ی), eliminación de diacríticos, tatweel, marcas de ancho cero y ZWNJ, eliminación de puntuación y símbolos, dígitos a ASCII y colapso de espacios. El WER se calcula con `jiwer.process_words` sobre texto normalizado.

## Capacidades

- Transcripción de voz a texto en persa (farsi) a partir de audio en cualquier frecuencia de muestreo (remuestreo interno a 16 kHz).
- Decodificación greedy CTC con fusión de repeticiones y eliminación de blank.
- Decodificación opcional con búsqueda por haz CTC con rescoring KenLM (`kenlm_fa.py`).
- Generación opcional de subtítulos SRT en el pipeline de transcripción end-to-end (`transcribe_fa.py`).
- Normalización y tokenización de texto persa integrada y compartida entre todas las etapas.
- Evaluación de WER con umbral de salida configurable (`eval_wer_fa.py`).
- No soporta tool calling, function calling, agentes, visión, audio de salida ni modo de razonamiento extendido; es un ASR especializado.
- Capacidad multilingüe limitada al persa.

## Casos de uso

- Transcripción de reuniones y entrevistas en persa: el pipeline `transcribe_fa.py` convierte un fichero de audio en texto normalizado, adecuado para actas y documentación interna en organizaciones que operan en farsi.
- Generación de subtítulos para vídeo: la opción de salida SRT permite producir subtítulos en persa para contenido audiovisual, con la normalización de texto aplicada de forma consistente.
- Indexación y búsqueda de archivos de audio: al convertir voz en texto normalizado, los archivos pueden indexarse en motores de búsqueda textual y recuperarse por contenido.
- Investigación en ASR de bajo recurso: sirve como base reproducible para experimentar con adaptaciones a otros idiomas congelando el codificador y entrenando solo el reader, dado el bajo coste computacional del cabezal (19,6 M de parámetros).
- Evaluación comparativa de técnicas de decodificación: la presencia de decodificación greedy y de búsqueda por haz con KenLM permite medir la mejora de WER aportada por el modelo de lenguaje en un corpus persa concreto.
- Prototipado de asistentes de voz en persa: la transcripción puede alimentar etapas posteriores de procesamiento de lenguaje natural, aunque el modelo por sí solo no gestiona diálogo ni tool calling.
- Docencia y experimentación con CTC: el repositorio incluye tests unitarios rápidos sin GPU (`test_fa.py`) y verificación integral (`verify_fa.py`), útiles para formación práctica en reconocimiento de voz.

## Benchmarks y rendimiento

El autor describe el procedimiento de evaluación (WER con `jiwer.process_words` sobre el split `test` de 341 enunciados y 0,43 h, con umbral de salida configurable en `eval_wer_fa.py`), pero no se han publicado resultados numéricos de WER en la información disponible. Tampoco hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar, que no aplican a un modelo ASR.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El reader entrenado tiene solo 19,6 M de parámetros, pero el codificador de audio de EmbeddingGemma 2 congelado domina el consumo y su tamaño no se detalla en la información proporcionada.
- GPU recomendadas: no disponible. El repositorio documenta el uso de GPU para el cacheo de tokens suaves (con reparto por shards entre GPUs mediante `--shard i/n`) y para el entrenamiento, pero no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el reducido tamaño del reader sugiere que el cuello de botella sería el codificador de audio, pero no se aportan cifras.
- Opciones de despliegue: scripts propios en PyTorch (`transcribe_fa.py`, `decode_fa.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FA-EG2 Persian (karim23657) | ASR CTC sobre EmbeddingGemma 2 | 19,6 M (reader) + codificador congelado | No disponible | Persa | No disponible | Hugging Face, 0 descargas |
| eg2-transcribe (john-rocky) | ASR CTC sobre EmbeddingGemma 2 (referencia) | Reader v2 (tamaño no detallado) | No disponible | No disponible | No disponible | GitHub |
| Whisper (OpenAI) | ASR transformer encoder-decoder | Según variante (tiny a large) | 30 s de audio por ventana | Multilingüe | MIT | Amplia |
| Modelos ASR de Common Voice persa | ASR específicos de persa | No disponible | No disponible | Persa | Variable | Variable |

La comparación cuantitativa de rendimiento (WER) con alternativas no está disponible porque el autor no publica cifras de evaluación en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo transcribe persa; no cubre otros idiomas ni tareas de generación, razonamiento o código.
- El vocabulario está limitado a una tabla fija de 60.000 palabras construida a partir de Common Voice y del corpus de texto; palabras fuera de la tabla no pueden producirse y se mapearán a la más cercana, lo que puede generar errores sistemáticos en dominios especializados.
- La normalización elimina ZWNJ y diacríticos, de modo que la salida no reproduce la ortografía persa completa; esto puede ser inadecuado si se requiere texto con formato original.
- El entrenamiento se apoya en unas 42 horas de Common Voice, un volumen reducido para ASR; es probable un WER elevado en condiciones de ruido, acentos no representados o audio telefónico, aunque no se publican cifras.
- Riesgo de alucinación léxica: la decodificación greedy sobre tabla de palabras puede producir secuencias gramaticalmente plausibles pero incorrectas en audio ambiguo.
- La licencia no está declarada en los metadatos de Hugging Face; antes de un uso comercial debe verificarse la licencia del codificador base `google/embeddinggemma-2` y la del dataset de Common Voice, así como la del repositorio de referencia.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026 según los metadatos; no hay evidencia de uso en producción ni de validación independiente.
- No se documentan sesgos demográficos ni de acento, pero al entrenar solo con Common Voice persa es previsible un sesgo hacia las variedades y condiciones de grabación representadas en ese corpus.
- Dependencia de un codificador propietario o de licencia específica (`google/embeddinggemma-2`); la disponibilidad futura de ese modelo condiciona la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/karim23657/fa-eg2-persian
- Codificador base: https://huggingface.co/google/embeddinggemma-2
- Repositorio de referencia: https://github.com/john-rocky/eg2-transcribe
- Dataset de entrenamiento: https://huggingface.co/datasets/pymmdrza/Common-Voice-Speech-26.0-Persian-Clean
- Corpus de texto persa: https://huggingface.co/datasets/PersianML/persian-text-corpus
