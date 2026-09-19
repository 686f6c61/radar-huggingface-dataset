# Grenmango/whisper-medium-en-vi-hqtv-personalized

## Resumen

Whisper Medium (English) – Personalized for Speaker HQTV es un ajuste fino de `openai/whisper-medium.en` orientado a un unico hablante: HQTV, varon con acento nativo vietnamita, procedente del corpus L2-ARCTIC. Lo desarrolla el usuario Grenmango y resuelve un problema muy concreto: el reconocimiento de habla de un locutor concreto con acento no nativo, donde los modelos genericos de Whisper degradan de forma notable su WER. El ajuste se hizo con LoRA (r=32, alpha=64) y los adaptadores se fusionaron permanentemente en los pesos base, de modo que el resultado es un modelo autonómo, sin dependencia de `peft`.

La arquitectura es la de Whisper: un transformer encoder-decoder con ventana de audio fija de 30 segundos y 763.856.896 parametros segun el fichero de safetensors (la model card cita 769 M). Los pesos finales estan en FP16 y el repositorio ocupa 1,5 GB. La licencia es Apache 2.0 y solo soporta ingles.

Su relevancia es metodologica y practica: demuestra que 1.018 enunciados (~1,1 h) de un solo hablante bastan para reducir el WER relativo un 55,0 % frente al modelo base en cero disparo (21,85 % -> 9,84 %) y un 26,5 % frente a un modelo multi-hablante del mismo acento (13,39 % -> 9,84 %). Es una plantilla reproducible para adaptacion por hablante en ASR, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper); 24 capas de encoder y 24 de decoder, d_model 1024, 16 cabezas de atencion en el modelo base |
| Parametros totales | 763.856.896 (safetensors); la model card indica 769 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio fija de 30 s (espectrograma log-Mel de 80 canales, 16 kHz mono, 3000 frames, 1500 tras el downsampling); contexto de decodificacion de 448 tokens |
| Tipos de cuantizacion | No documentados por el autor. Pesos publicados en FP16; al ser un `WhisperForConditionalGeneration` estandar es convertible a GGUF (whisper.cpp) o a CTranslate2 int8/fp16 (faster-whisper) |
| Idiomas soportados | `en` (ingles). Especializado en ingles hablado con acento vietnamita |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP16, adaptadores LoRA fusionados) |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-medium.en`, un transformer encoder-decoder con preprocesado de audio en espectrograma log-Mel de 80 canales a 16 kHz. La entrada se trocea en ventanas de 30 segundos y la decodificacion es autoregresiva con tokens especiales de tarea e idioma. Sobre esta base se aplico Parameter-Efficient Fine-Tuning con LoRA de rango 32 y alpha 64, apuntando a las proyecciones `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1` y `fc2`. Posteriormente los adaptadores se fusionaron en los pesos base, de modo que el checkpoint distribuido es autonomo y se carga con `WhisperForConditionalGeneration` sin `peft`.

Los datos de entrenamiento son 1.018 enunciados (~1,1 h de audio) del hablante HQTV del corpus L2-ARCTIC, correspondientes a ingles leido con acento vietnamita. No se documenta el uso de RLHF ni DPO: es un ajuste supervisado puro sobre transcripciones. La innovacion tecnica no esta en la arquitectura, sino en la estrategia: adaptacion ultra-especifica a un unico locutor con un presupuesto de datos muy bajo y fusion de adaptadores para simplificar el despliegue. La evaluacion se realiza sobre el split `test` limpio de ese mismo hablante.

## Capacidades

- Transcripcion de voz a texto en ingles (ASR) con `pipeline("automatic-speech-recognition")` o carga directa con `WhisperProcessor` y `WhisperForConditionalGeneration`.
- Reconocimiento robusto del habla de un locutor concreto con acento vietnamita, con una mejora de 12,01 puntos porcentuales de WER frente al modelo base en cero disparo.
- Procesamiento de audio largo mediante troceado en fragmentos de 30 s (`chunk_length_s=30`) en la pipeline de Hugging Face.
- Re-muestreo automatico a 16 kHz integrado en la pipeline (y manual con `soxr` en el uso directo del modelo).
- Salida de texto plano; la decodificacion admite `max_new_tokens` configurable.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo de razonamiento explicito, vision ni procesamiento de audio mas alla de ASR.
- Capacidad multilingue: no. Solo ingles; no traduce ni transcribe vietnamita.
- No se documentan marcas de tiempo a nivel de palabra ni diarizacion de hablantes.

## Casos de uso

- Dictado personal para un usuario concreto: un hablante vietnamita de ingles puede transcribir sus propias notas de voz con un WER cercano al 10 %, muy por debajo del 21,85 % del modelo generico, gracias al ajuste por hablante.
- Subtitulado de grabaciones propias: podcasts, videoensayos o clases impartidas por ese locutor. La ventana de 30 s y el troceado de la pipeline permiten procesar archivos largos sin reentrenar nada.
- Archivado y busqueda de entrevistas: transcripcion de un fondo de audio historico de un unico entrevistado con acento marcado, para despues indexar el texto y permitir busqueda semantica.
- Pseudo-etiquetado de datos de ese hablante: usar las transcripciones del modelo como etiquetas iniciales para ampliar el conjunto de entrenamiento y reajustar el modelo de forma iterativa.
- Accesibilidad asistida: integracion en una aplicacion de subtitulado en tiempo real orientada a un usuario especifico, con un modelo de 764 M que cabe en GPU de consumo.
- Investigacion en ASR con acento L2: sirve como punto de comparacion reproducible frente a modelos multi-hablante y como referencia de cuanto se gana al personalizar, usando el propio split `test` de L2-ARCTIC.
- Base para replicar la receta en otros hablantes: el mismo pipeline LoRA (r=32, alpha=64, mismas proyecciones) es reutilizable con otros locutores del corpus, tal como evidencia la coleccion de modelos hermanos por acento.
- Evaluacion comparativa de front-ends ASR: al estar fusionado y ser autonomo, se puede conectar a `faster-whisper` o `whisper.cpp` y medir WER/CER con distintas cuantizaciones en un caso de acento controlado.

## Benchmarks y rendimiento

Evaluacion sobre el split `test` de habla leida limpia del hablante HQTV (L2-ARCTIC), tal como publica el autor:

| Modelo | WER en test | CER en test | Descripcion |
|---|---|---|---|
| whisper-medium-en-vi-hqtv-personalized | 9,84 % | 5,27 % | Personalizado al hablante HQTV |
| Grenmango/whisper-medium-en-vi-accent | 13,39 % | 6,87 % | Modelo multi-hablante con acento vietnamita (4 hablantes) |
| openai/whisper-large-v3-turbo | 18,90 % | no disponible | Base en cero disparo |
| openai/whisper-medium.en | 21,85 % | 11,67 % | Base en cero disparo |

Derivadas publicadas por el autor: reduccion relativa del WER del 55,0 % frente a `whisper-medium.en` y del 26,5 % frente al modelo multi-hablante; ventaja de 9,06 puntos porcentuales sobre `whisper-large-v3-turbo` para ese locutor. No se han publicado resultados de benchmarks en la informacion disponible para tareas distintas de la transcripcion de HQTV (MMLU, HumanEval o GSM8K no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada en FP16: en torno a 1,6-2,5 GB para pesos mas activaciones con ventanas de 30 s; con `torch_dtype=torch.float16` y `device_map="auto"` es holgado en cualquier GPU moderna.
- Cuantizado a int8 con CTranslate2 (faster-whisper) el consumo baja de forma aproximada a 0,9-1,5 GB, lo que permite ejecucion en CPU con latencia aceptable.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Cabe en consumer, por ejemplo GTX 1650 4 GB, RTX 3060 12 GB, RTX 4090. En A100 o H100 el modelo queda muy desaprovechado salvo por procesamiento por lotes a gran escala.
- CPU: viable con whisper.cpp o faster-whisper en int8; en FP16 sobre CPU la latencia es alta.
- Opciones de despliegue: `transformers` (pipeline de ASR), `faster-whisper`/CTranslate2, `whisper.cpp` tras conversion a GGUF, y servidores de inferencia compatibles con modelos de audio. No se documentan recetas especificas para vLLM o TGI con este checkpoint.
- Latencia y throughput: no disponibles. El autor no publica medidas de RTF ni de tokens por segundo; al ser un modelo `medium` (24+24 capas), la latencia esperada es la habitual de Whisper medium para ventanas de 30 s, muy inferior a la de `large-v3-turbo`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (test HQTV) | Licencia | Enfoque |
|---|---|---|---|---|---|
| whisper-medium-en-vi-hqtv-personalized | 763,9 M (safetensors) | 30 s de audio | 9,84 % | apache-2.0 | Personalizado a un hablante |
| whisper-medium-en-vi-accent | 769 M (modelo base) | 30 s de audio | 13,39 % | no disponible en la informacion | Multi-hablante, acento vietnamita |
| openai/whisper-medium.en | 769 M | 30 s de audio | 21,85 % | MIT (modelo base de OpenAI) | Generico, solo ingles |
| openai/whisper-large-v3-turbo | no disponible en la informacion | 30 s de audio | 18,90 % | MIT (modelo base de OpenAI) | Generico multilingue, cero disparo |

El modelo solo supera a sus alternativas en el dominio para el que fue ajustado (ese locutor concreto). Fuera de ese hablante no hay datos publicados y es previsible que pierda frente a `whisper-large-v3-turbo`. Su ventaja estructural es el coste: 764 M parametros y ~1,5 GB de pesos frente a un large, con mejor WER en su nicho y licencia Apache 2.0.

## Limitaciones y advertencias

- Personalizacion extrema: el modelo esta ajustado a un unico hablante. Sobre cualquier otro locutor, incluso con el mismo acento, su rendimiento probablemente caiga por debajo del de `whisper-medium.en`; existe riesgo claro de sobreajuste con solo ~1,1 h de audio.
- Sesgo de dominio: los datos son habla leida limpia del split de L2-ARCTIC. No hay evidencia de comportamiento en audio con ruido, solapamiento de voces, telefonia de banda estrecha o habla espontanea.
- Sesgo de genero y acento: entrenado exclusivamente sobre un varon con acento vietnamita; no debe extrapolarse su calidad a mujeres ni a otros acentos del ingles.
- Solo ingles: no transcribe vietnamita ni realiza traduccion. Ignora el componente multilingue de la familia Whisper.
- Alucinacion: los modelos Whisper tienden a generar texto plausible en silencios, musica o audio ininteligible. No se documenta ningun mecanismo de mitigacion en este ajuste.
- Sin marcas de tiempo ni diarizacion: no se documentan `return_timestamps` a nivel de palabra ni deteccion de hablantes.
- Metrica de evaluacion muy acotada: WER y CER se calculan sobre el mismo hablante y dominio del entrenamiento, por lo que no equivalen a un benchmark independiente.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por terceros independientes del autor.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia de los datos de L2-ARCTIC para el hablante HQTV antes de un despliegue en produccion y citar el corpus conforme a sus condiciones.
- Carga: al ser un checkpoint fusionado no requiere `peft`, pero si se convierte a FP16 hay que asegurarse de que el entorno soporta esa precision; en CPU conviene cuantizar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Grenmango/whisper-medium-en-vi-hqtv-personalized
- Modelo base: https://huggingface.co/openai/whisper-medium.en
- Corpus L2-ARCTIC: https://psi.engr.tamu.edu/l2-arctic-corpus/
- Modelo hermano con acento vietnamita: https://huggingface.co/Grenmango/whisper-medium-en-vi-accent
- Modelo hermano con acento arabe: https://huggingface.co/Grenmango/whisper-medium-en-arabic-accent
- Modelo hermano con acento chino: https://huggingface.co/Grenmango/whisper-medium-en-chinese-accent
- Modelo hermano con acento hindi: https://huggingface.co/Grenmango/whisper-medium-en-hindi-accent
- Modelo hermano con acento coreano: https://huggingface.co/Grenmango/whisper-medium-en-korean-accent
- Modelo hermano con acento espanol: https://huggingface.co/Grenmango/whisper-medium-en-spanish-accent

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces recuperados correspondian a carteles de cine y no se han incluido por no ser pertinentes.
