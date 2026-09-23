# lgris/wav2vec2-transducer-tagarela-v2-clean

## Resumen

`lgris/wav2vec2-transducer-tagarela-v2-clean` es un modelo de reconocimiento automatico del habla (ASR) en portugues de Brasil construido sobre una arquitectura RNN-Transducer (RNN-T). El autor, lgris, parte de un encoder Wav2Vec 2.0 Base congelado (`lgris/w2v_podcasts_base_400k_pt`) y le anade una red de prediccion LSTM autorregresiva de 2 capas y una red conjunta, entrenando el conjunto sobre el dataset TAGARELA v2 a 16 kHz nativo (full-band), sin filtro telefonico.

El problema que resuelve es la transcripcion de audio en pt-BR con formato enriquecido: a diferencia de los modelos puramente CTC del mismo autor, este Transducer modela las probabilidades condicionales de los caracteres anteriores y produce texto con puntuacion completa (. , ? ! : -) y mayusculas, lo que reduce el post-procesado necesario en aplicaciones finales. El vocabulario consta de 107 tokens y el entrenamiento se realizo durante 100.000 pasos sobre la columna `stt_parakeet` de TAGARELA v2.

Es relevante porque demuestra que un esquema modular (encoder preentrenado congelado + cabecera Transducer entrenable) puede producir salida con puntuacion y mayusculas sin reentrenar el encoder acustico, a costa de un WER mas alto (23,52 %) que las variantes CTC del mismo autor (14,96 %). El repositorio esta publicado bajo licencia Apache 2.0, aunque con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN-Transducer (RNN-T): encoder Wav2Vec 2.0 Base (768 dimensiones) + Prediction Network LSTM de 2 capas (512 dimensiones, dropout 0.1) + Joint Network lineal (512 dimensiones) con Tanh y salida de 107 clases; perdida RNN-T |
| Parametros totales | no disponible (el encoder base es Wav2Vec 2.0 Base, 768 dimensiones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; los audios de entrenamiento tienen duraciones de 0.5 s a 15.0 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues de Brasil (`pt`, `pt-BR`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio con pesos PyTorch y script `infer_transducer.py`; tamano del repo 0.0 GB) |

## Arquitectura y entrenamiento

El modelo sigue un diseno modular de tres componentes. El encoder acustico es Wav2Vec 2.0 Base con 768 dimensiones, inicializado desde `lgris/w2v_podcasts_base_400k_pt` y mantenido congelado durante el fine-tuning. Sobre el se anade una red de prediccion autorregresiva formada por una LSTM de 2 capas con 512 dimensiones y dropout de 0.1, que aprende las probabilidades condicionales de los caracteres previos. La red conjunta proyecta encoder y predictor a un espacio comun de 512 dimensiones con activacion Tanh y produce una distribucion sobre 107 clases (letras minusculas, mayusculas acentuadas, signos de puntuacion y tokens especiales). La funcion de perdida es la RNN-T Loss estandar.

El entrenamiento se realizo sobre el dataset TAGARELA v2 (columna `stt_parakeet`) durante 100.000 pasos, con un batch efectivo de 128 (16 muestras por paso con 8 pasos de acumulacion), optimizador AdamW con learning rate base de 5e-4 y warm-up lineal de 5.000 pasos. Los audios de entrenamiento abarcan de 0.5 a 15 segundos a 16 kHz mono. Todo el entrenamiento se ejecuto en una unica GPU NVIDIA B200 dentro de un nodo NVIDIA DGX B200. La innovacion principal es precisamente la cabecera Transducer sobre encoder congelado, que habilita salida con puntuacion y mayusculas sin reentrenar el extractor acustico.

## Capacidades

- Transcripcion de voz a texto en portugues de Brasil (`pt-BR`) a partir de audio de 16 kHz mono.
- Generacion de transcripciones con puntuacion completa (punto, coma, interrogacion, exclamacion, dos puntos, guion) y uso de mayusculas.
- Modelado autorregresivo de dependencias entre caracteres mediante la red de prediccion LSTM, lo que permite corregir ambiguedades que un decodificador CTC puro no resuelve.
- Manejo de audio de tipo full-band limpio, sin asumir filtrado telefonico.
- Procesamiento de segmentos de audio de entre 0.5 y 15 segundos, coherente con las duraciones vistas en entrenamiento.
- Soporte de tool calling / function calling: no disponible (modelo exclusivamente ASR).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo esta entrenado unicamente en portugues de Brasil.
- Capacidades especiales (modo thinking, vision, audio generativo): no disponibles; la unica modalidad de salida es texto transcrito.

## Casos de uso

- Transcripcion de podcasts en portugues de Brasil: el modelo esta fine-tuneado sobre un dataset de podcasts y produce salida con puntuacion, lo que reduce el trabajo de post-edicion antes de publicar el texto en una web o newsletter.
- Subtitulado de video en pt-BR: segmentando la pista de audio en fragmentos de hasta 15 segundos (el rango visto en entrenamiento) se obtienen subtitulos con mayusculas y puntuacion listos para formatos SRT o VTT.
- Archivado y busqueda de contenido audiovisual: indexar la transcripcion de una videoteca para permitir busqueda por texto completo sobre el contenido hablado, aprovechando que el modelo emite texto legible directamente.
- Analisis de entrevistas y grupos de discusion: investigadores en ciencias sociales pueden transcribir conversaciones con menos limpieza manual gracias al formato de salida ya puntuado.
- Documentacion clinica o legal dictada en pt-BR: como paso previo a un resumen automatico, siempre con revision humana dado el WER del 23,52 %.
- Prototipado e investigacion en arquitecturas Transducer: el repositorio incluye `infer_transducer.py` y sirve como referencia para comparar RNN-T frente a CTC sobre el mismo encoder congelado.
- Formacion de modelos de lenguaje en pt-BR: generar corpus transcritos con puntuacion natural para preentrenar o ajustar modelos de texto cuando no se dispone de transcripciones humanas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test independiente de TAGARELA v2 (metricas no verificadas, `verified: false`):

| Modelo | WER (%) | CER (%) | Formato de salida |
|---|---|---|---|
| **wav2vec2-transducer-tagarela-v2-clean (este modelo)** | **23,52** | **7,39** | Puntuacion completa y mayusculas |
| wav2vec2-podcasts-tagarela-v2 (CTC) | 14,96 | 5,82 | Minusculas sin puntuacion |
| wav2vec2-podcasts-tagarela-combined (CTC) | 15,92 | 6,82 | Minusculas sin puntuacion |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un encoder Wav2Vec 2.0 Base con una LSTM pequena, el modelo completo se situa en el orden de las decenas de millones de parametros y cabe con holgura en cualquier GPU de consumo actual (estimacion orientativa: menos de 2 GB en fp32 y menos de 1 GB en fp16, sin contar overhead de framework).
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionarian sin problema, pero la aceleracion solo aporta ventaja en lotes grandes.
- Compatibilidad con GPU de consumo: si; el modelo es claramente desplegable en GPU consumer e incluso en CPU para inferencia puntual.
- Opciones de despliegue: no hay soporte nativo en `transformers.pipeline` para RNN-Transducer segun el autor. El despliegue previsto es mediante el script `infer_transducer.py` incluido en el repositorio, con PyTorch y torchaudio, invocable por linea de comandos (`--model_dir`, `--audio`, `--device`). No se declara soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | WER (%) | CER (%) | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wav2vec2-transducer-tagarela-v2-clean | RNN-T sobre Wav2Vec2 Base | 23,52 | 7,39 | Puntuacion y mayusculas | Apache 2.0 | Hugging Face, 0 descargas |
| wav2vec2-podcasts-tagarela-v2 | CTC sobre Wav2Vec2 | 14,96 | 5,82 | Minusculas sin puntuacion | no disponible | Hugging Face |
| wav2vec2-podcasts-tagarela-combined | CTC sobre Wav2Vec2 | 15,92 | 6,82 | Minusculas sin puntuacion | no disponible | Hugging Face |

No se dispone de datos de comparacion con modelos ASR en pt-BR de otros autores (por ejemplo variantes de Whisper) en la informacion proporcionada.

## Limitaciones y advertencias

- WER notablemente superior al de las variantes CTC del mismo autor sobre el mismo dataset (23,52 % frente a 14,96 %); el formato enriquecido se obtiene a costa de precision.
- Metricas no verificadas: todos los resultados del model-index estan marcados con `verified: false` y proceden del propio autor.
- Unicamente portugues de Brasil; no hay evidencia de rendimiento en portugues europeo ni en otros idiomas.
- Entrenado con audio de 0.5 a 15 segundos; no se ha validado el comportamiento con audios mas largos ni con audio telefonico (8 kHz) o ruidoso, ya que el entrenamiento usa full-band limpio.
- Sin soporte en el pipeline estandar de `transformers`, lo que complica su integracion en stacks que dependan de esa API.
- Riesgo de alucinacion y de errores de puntuacion/mayusculas en dominios alejados del dataset de podcasts; se recomienda revision humana en contextos legales, medicos o financieros.
- Sesgos: el dataset TAGARELA v2 condiciona el acento, el registro y la tematica; el rendimiento puede degradarse con hablantes de otras variedades del portugues.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 likes, por lo que no existe una comunidad que haya validado su comportamiento en produccion.
- El tamano del repositorio declarado es 0.0 GB, dato que puede indicar que los pesos no estan materializados o que la informacion no esta actualizada; conviene verificar la integridad de los ficheros antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lgris/wav2vec2-transducer-tagarela-v2-clean
- Script de inferencia: https://huggingface.co/lgris/wav2vec2-transducer-tagarela-v2-clean/blob/main/infer_transducer.py
- Encoder base: https://huggingface.co/lgris/w2v_podcasts_base_400k_pt
- Dataset TAGARELA v2: https://huggingface.co/datasets/freds0/TAGARELA_v2
- Variante CTC de referencia: https://huggingface.co/lgris/wav2vec2-podcasts-tagarela-v2
- Variante CTC combinada: https://huggingface.co/lgris/wav2vec2-podcasts-tagarela-combined
- Paper de wav2vec 2.0: https://arxiv.org/abs/2006.11477
- Implementacion de wav2vec en fairseq: https://github.com/facebookresearch/fairseq/blob/main/examples/wav2vec/README.md
- Introduccion a Wav2Vec2: https://www.geeksforgeeks.org/nlp/wav2vec2-self-supervised-learning-technique-for-speech-representations/
