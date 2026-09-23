# lgris/wav2vec2-transducer-hybrid-tagarela-v2-clean

# Ficha de modelo: wav2vec2-transducer-hybrid-tagarela-v2-clean

## Resumen

wav2vec2-transducer-hybrid-tagarela-v2-clean es un modelo de reconocimiento automatico del habla (ASR) para portugues de Brasil publicado por el usuario lgris en Hugging Face. A diferencia de la mayoria de variantes de Wav2Vec2 2.0, que se entrenan con una cabeza CTC, este modelo combina un encoder Wav2Vec 2.0 Base (768 dimensiones) con una arquitectura RNN-Transducer (RNN-T) completa: red de prediccion LSTM autorregresiva de dos capas (512 dimensiones) y red conjunta lineal (512 dimensiones, activacion tanh) sobre 107 clases de salida.

El problema que resuelve es concreto: los modelos CTC puros del mismo autor transcriben en minusculas y sin puntuacion, mientras que esta variante transducer modela la probabilidad condicional de cada caracter dado el historial previo, lo que le permite emitir texto con puntuacion completa (. , ? ! : -) y mayusculas acentuadas de forma nativa. El coste de ese formato enriquecido es un WER mas alto: 18,24 % frente al 14,96 % de su equivalente CTC en el mismo conjunto de test.

El modelo se ha ajustado sobre el dataset TAGARELA v2 (columna `stt_parakeet`) durante 100.000 pasos, partiendo del encoder preentrenado lgris/w2v_podcasts_base_400k_pt, y trabaja con audio mono a 16 kHz sin filtro telefonico. Se publica bajo licencia Apache 2.0 y el repositorio ocupa 0,4 GB. Su relevancia practica radica en que cubre un nicho poco frecuente en modelos abiertos en portugues: transcripcion lista para publicacion gracias a la puntuacion y capitalizacion integradas, sin post-procesado externo. La contrapartida tecnica es que la arquitectura RNN-T no tiene soporte nativo en el pipeline estandar de `transformers`, por lo que requiere un script de inferencia propio incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN-Transducer (RNN-T) hibrido: encoder Wav2Vec 2.0 Base (768 dim.) + red de prediccion LSTM de 2 capas (512 dim., dropout 0,1) + joint network lineal (512 dim., tanh) sobre 107 clases |
| Parametros totales | No disponible (encoder Wav2Vec 2.0 Base; repositorio de 0,4 GB) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica como ventana de texto; entrenado con segmentos de audio de 0,5 a 15,0 s |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; pesos de PyTorch) |
| Idiomas soportados | Portugues de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repositorio con pesos de PyTorch y script `infer_transducer.py`; no se declara safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un RNN-Transducer hibrido de tres componentes. El encoder acustico es un Wav2Vec 2.0 Base de 768 dimensiones, inicializado desde el checkpoint lgris/w2v_podcasts_base_400k_pt, preentrenado de forma autosupervisada sobre 400.000 horas (segun la denominacion del propio checkpoint) de podcasts en portugues. Sobre esa representacion acustica se anade una red de prediccion (Prediction Network) LSTM de dos capas con 512 dimensiones ocultas y dropout 0,1, que modela el historial de caracteres emitidos, y una red conjunta (Joint Network) que proyecta la concatenacion de encoder y predictor a 512 dimensiones con activacion tanh y 107 clases de salida. El vocabulario de 107 tokens cubre letras minusculas, mayusculas acentuadas, signos de puntuacion y tokens especiales, lo que explica la salida con formato natural.

El entrenamiento utiliza una funcion de perdida multi-tarea que suma la perdida RNN-T con una perdida CTC auxiliar ponderada con peso 0,3. Se ejecutaron 100.000 pasos sobre el dataset TAGARELA v2 (columna `stt_parakeet`) con batch efectivo de 128 (16 muestras por paso y 8 pasos de acumulacion de gradiente), optimizador AdamW con learning rate base 5e-4 y warm-up lineal de 5.000 pasos. Los audios de entrenamiento tienen entre 0,5 y 15,0 segundos y se procesan a 16 kHz mono en banda completa, sin el filtrado caracteristico de dominios telefonicos. Todo el ajuste se realizo en una unica GPU NVIDIA B200 dentro de un sistema DGX B200. La innovacion principal respecto a los modelos CTC hermanos es precisamente el decodificador autorregresivo, que asume el coste de inferencia secuencial a cambio de puntuacion y capitalizacion integradas.

## Capacidades

- Reconocimiento automatico del habla en portugues de Brasil (pt-BR) a partir de audio mono a 16 kHz.
- Transcripcion con puntuacion completa (. , ? ! : -) generada por el propio modelo, sin necesidad de un modelo de restauracion de puntuacion.
- Capitalizacion nativa, incluidas mayusculas acentuadas presentes en el vocabulario de 107 tokens.
- Manejo de segmentos de audio de entre 0,5 y 15,0 segundos, la distribucion vista durante el entrenamiento.
- Salida de texto plano en caracteres; no se documenta salida a nivel de palabra ni marcas de tiempo alineadas.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico (no aplica a un modelo de ASR).
- No se documenta capacidad multilingue: la model card declara unicamente portugues.
- No se documentan capacidades de vision, audio-vision, diarizacion ni traduccion.
- Inferencia disponible mediante el script `infer_transducer.py` del repositorio, con API en Python (`load_transducer_pipeline`, `transcribe`) y modo linea de comandos.

## Casos de uso

- Transcripcion de podcasts y contenido editorial: el modelo parte de un encoder preentrenado especificamente con podcasts en portugues, por lo que el dominio coincide con el del preentrenamiento y la salida con puntuacion y mayusculas reduce el trabajo de edicion previo a publicacion.
- Subtitulado de video en portugues: los segmentos de 0,5 a 15 s encajan con la granularidad tipica de los subtitulos; la puntuacion integrada evita tener que ejecutar un modelo secundario de restauracion.
- Generacion de actas y notas de reunion: al producir texto con formato correcto, la transcripcion puede alimentarse directamente a un resumidor o a un sistema de busqueda sin una fase de normalizacion.
- Indexacion y busqueda de archivos de audio: la transcripcion se puede almacenar en un motor de busqueda textual; el CER del 7,52 % indica que la mayoria de terminos relevantes quedan recuperables para consultas por palabra clave.
- Investigacion en arquitecturas transducer: al ser un RNN-T hibrido con perdida combinada RNN-T + CTC, sirve como punto de partida reproducible para estudiar decodificacion autorregresiva frente a CTC en lenguas con menos recursos.
- Ajuste fino sobre dominios especificos en portugues: la licencia Apache 2.0 y el tamano reducido del repositorio (0,4 GB) permiten reentrenar el modelo con vocabulario o dominios concretos (medico, legal, atencion al cliente) en hardware de gama media.
- Procesamiento por lotes de archivos historicos de audio: la inferencia en CPU es viable dado el tamano del modelo, lo que permite transcribir volumenes grandes sin GPU dedicada.
- Preanotacion de corpus para anotadores humanos: la salida con mayusculas y puntuacion reduce el esfuerzo de correccion frente a transcripciones crudas en minusculas, aunque el WER del 18,24 % obliga a revision humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test independiente de TAGARELA v2 (`freds0/TAGARELA_v2`). Las metricas estan marcadas como no verificadas (`verified: false`) en el model-index.

| Modelo | WER (%) | CER (%) | Formato de salida |
|---|---|---|---|
| wav2vec2-transducer-hybrid-tagarela-v2-clean (este modelo) | 18,24 | 7,52 | Puntuacion completa y mayusculas |
| wav2vec2-podcasts-tagarela-v2 (CTC) | 14,96 | 5,82 | Minusculas sin puntuacion |
| wav2vec2-podcasts-tagarela-combined (CTC) | 15,92 | 6,82 | Minusculas sin puntuacion |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo de reconocimiento del habla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con un repositorio de 0,4 GB y un encoder Wav2Vec 2.0 Base, la inferencia en precision completa requiere previsiblemente menos de 2 GB de VRAM, aunque el dato no esta confirmado por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente para este tamano de modelo; el entrenamiento se realizo en una NVIDIA B200 dentro de un DGX B200, pero ese hardware no es necesario para inferencia.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (por ejemplo GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). Tambien es viable en CPU para procesamiento por lotes.
- Opciones de despliegue: no hay soporte nativo en `transformers.pipeline` para esta arquitectura RNN-T. El repositorio proporciona `infer_transducer.py` con las funciones `load_transducer_pipeline` y `transcribe`, invocables desde Python o desde linea de comandos. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Dependencias declaradas: `torch`, `torchaudio`, `transformers`, `librosa` y `huggingface_hub`.
- Preparacion de audio: conversion automatica a 16 kHz mono realizada por el propio helper de inferencia.
- Latencia y throughput estimados: no disponible. La decodificacion RNN-T es autorregresiva, por lo que cabe esperar una latencia por segmento superior a la de un modelo CTC del mismo tamano, pero no se aportan cifras.

## Comparativa con modelos similares

La comparacion mas directa disponible son las variantes CTC del mismo autor y mismo dataset, con metricas publicadas en la propia model card. Para el resto de campos no se dispone de datos.

| Modelo | Tipo de decodificador | WER (%) | CER (%) | Formato de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wav2vec2-transducer-hybrid-tagarela-v2-clean | RNN-Transducer + CTC auxiliar | 18,24 | 7,52 | Puntuacion y mayusculas | Apache 2.0 | Hugging Face, requiere script propio |
| wav2vec2-podcasts-tagarela-v2 | CTC puro | 14,96 | 5,82 | Minusculas sin puntuacion | No disponible en la informacion proporcionada | Hugging Face |
| wav2vec2-podcasts-tagarela-combined | CTC puro | 15,92 | 6,82 | Minusculas sin puntuacion | No disponible en la informacion proporcionada | Hugging Face |

Frente a modelos ASR multilingues de gran tamano (por ejemplo la familia Whisper), no se dispone de resultados comparables en TAGARELA v2 dentro de la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa.

## Limitaciones y advertencias

- Precision inferior a las alternativas CTC del mismo autor: 18,24 % de WER frente a 14,96 % y 15,92 %. La puntuacion y las mayusculas integradas se obtienen a cambio de un aumento del error de reconocimiento.
- Metricas no verificadas: el model-index marca los resultados como `verified: false`; proceden del propio autor y no de una evaluacion independiente.
- Cobertura linguistica limitada a portugues de Brasil (`pt`). No hay evidencia de funcionamiento correcto en portugues europeo ni en otras lenguas.
- Dominio de entrenamiento concreto: el ajuste se hizo sobre la columna `stt_parakeet` de TAGARELA v2 y el encoder se preentreno con podcasts. El rendimiento puede degradarse en dominios alejados (audio telefonico, ruido de fondo intenso, habla solapada, acentos no representados).
- Riesgo de alucinacion y de emision de texto plausible en tramos de silencio, ruido o musica, comportamiento habitual en decodificadores autorregresivos; conviene aplicar deteccion de actividad vocal y umbrales de confianza.
- Longitud de audio: el entrenamiento cubre segmentos de 0,5 a 15,0 s. Audios mas largos deben trocearse, con el riesgo de cortes en limites de palabra.
- La arquitectura RNN-T no tiene soporte nativo en `transformers.pipeline`, lo que complica la integracion en plataformas de inferencia estandar y obliga a mantener codigo propio.
- No se documentan cuantizaciones ni formatos GGUF/ONNX, por lo que el despliegue optimizado (por ejemplo en movil o en entornos sin PyTorch) no esta cubierto por el repositorio.
- El modelo no realiza diarizacion, marcas de tiempo ni traduccion; cualquier necesidad de ese tipo requiere componentes adicionales.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de licencia y los avisos de atribucion correspondientes. Debe verificarse ademas el cumplimiento de los terminos del dataset TAGARELA v2 y del encoder base.
- Adopcion nula a fecha de los datos disponibles: 0 descargas y 0 likes, sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lgris/wav2vec2-transducer-hybrid-tagarela-v2-clean
- Script de inferencia `infer_transducer.py`: https://huggingface.co/lgris/wav2vec2-transducer-hybrid-tagarela-v2-clean/blob/main/infer_transducer.py
- Dataset de entrenamiento TAGARELA v2: https://huggingface.co/datasets/freds0/TAGARELA_v2
- Encoder base preentrenado: https://huggingface.co/lgris/w2v_podcasts_base_400k_pt
- Variante CTC de referencia: https://huggingface.co/lgris/wav2vec2-podcasts-tagarela-v2
- Variante CTC combinada: https://huggingface.co/lgris/wav2vec2-podcasts-tagarela-combined
- Documentacion de Wav2Vec2 en transformers: https://huggingface.co/docs/transformers/model_doc/wav2vec2
- Codigo fuente de la documentacion de Wav2Vec2 (GitHub): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/wav2vec2.md
- Articulo divulgativo sobre Wav2Vec2 (GeeksforGeeks): https://www.geeksforgeeks.org/nlp/wav2vec2-self-a-supervised-learning-technique-for-speech-representations/
- Implementacion alternativa de Wav2Vec2 en PyTorch: https://github.com/SookX/wav2vec2-torch
- Otro modelo del mismo autor con metricas WER publicadas: https://huggingface.co/lgris/wav2vec2_base_10k_8khz_pt_cv7_2
