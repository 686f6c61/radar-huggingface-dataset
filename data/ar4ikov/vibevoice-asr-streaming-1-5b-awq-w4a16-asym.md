# Ar4ikov/VibeVoice-ASR-Streaming-1.5B-AWQ-W4A16-ASYM

## Resumen

Este repositorio contiene una version cuantizada a INT4 del modelo de reconocimiento automatico del habla (ASR) en streaming microsoft/VibeVoice-ASR-Streaming-1.5B, publicada por el usuario Ar4ikov. Se trata de un checkpoint de inferencia que escribe texto a medida que llega el audio, en ventanas de 2,93 segundos con 0,53 segundos de lookahead, y que ademas etiqueta los turnos de palabra con marcas del tipo `Speaker N:`. La cuantizacion es una AWQ real (activation-aware), no un simple redondeo RTN ni una conversion de un checkpoint ya cuantizado, generada con llm-compressor sobre la revision `4262d23d8a539a6530cf64fbd0b1751ef9a30853` del modelo base.

El checkpoint pesa 2,535 GB en safetensors frente a los 5,628 GB del BF16 original (2,22 veces menos), con las 196 proyecciones de atencion y MLP del componente de lenguaje (Qwen2) en 4 bits asimetricos con grupo de 128 y activaciones de 16 bits. Los embeddings, los codificadores de voz, los conectores, las normas y los sesgos se mantienen en BF16, y el decodificador acustico (`model.acoustic_tokenizer.decoder.*`) se ha eliminado por completo, de modo que es un checkpoint exclusivamente ASR: no puede sintetizar audio.

Su relevancia practica es doble: por un lado baja el coste de despliegue de un ASR en streaming a un rango que cabe en GPU de consumo, y por otro demuestra que la cuantizacion AWQ W4A16 puede ser casi inocua en este modelo, con un WER de 3,74 % frente al 3,67 % del BF16 en el conjunto de validacion del autor y una velocidad aproximadamente un 50 % superior en tokens por segundo. No obstante, la validacion es una comprobacion de regresion sobre habla leida en ingles: no hay mediciones de precision multilingue, audio con ruido ni calidad de diarizacion tras la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para ASR en streaming: componente de lenguaje basado en Qwen2 (196 proyecciones de atencion/MLP) mas codificadores de voz y conectores; protocolo de ventanas con prefill de caracteristicas de audio |
| Parametros totales | 2.237.046.656 (incluye componentes de voz; el nombre del modelo indica 1,5B para el componente de lenguaje) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 asimetrica, group size 128, activaciones de 16 bits, generada con AWQ (llm-compressor, 40 puntos de rejilla, `duo_scaling="both"`, semilla 42); embeddings, codificadores de voz, conectores, normas y sesgos en BF16; escalas de grupo AWQ en FP16 |
| Idiomas soportados | no disponible; la unica validacion publicada es sobre habla leida en ingles (LibriSpeech dev-clean) |
| Licencia | MIT |
| Formato de pesos | safetensors, con el checkpoint comprimido reempaquetado sin perdida en AWQ GEMM estandar (`qweight`, `qzeros`, `scales`) |
| Tamano del repositorio | 2,5 GB |
| Pesos del modelo de lenguaje en GPU | 664 MB en AWQ frente a 2.499 MB en BF16 |

## Arquitectura y entrenamiento

El modelo base combina un componente de lenguaje tipo Qwen2 con codificadores de voz y conectores que transforman el audio en caracteristicas de habla, mas un tokenizador acustico. La variante aqui descrita no reentrena nada: parte del checkpoint BF16 y aplica una busqueda de escalas AWQ genuina, consciente de las activaciones, sobre las 196 proyecciones de atencion y MLP del modelo de lenguaje. La calibracion emplea 256 secuencias de un maximo de 2048 filas cada una, pasadas a traves de `inputs_embeds` para que el optimizador vea embeddings de habla reales: 128 sesiones de streaming completas en el protocolo propio del modelo (prompt de streaming y, por cada ventana de 26 fotogramas, `<|object_ref_start|>` + caracteristicas de voz + `<|object_ref_end|>` + texto greedy del modelo BF16 + `<|text_chunk_end|>`, unas 942 filas por sesion) sobre LibriSpeech dev-clean con 32 hablantes y flujos de 15 a 150 segundos, y 128 conversaciones de Ultrachat para la ruta generica de lenguaje.

La innovacion tecnica mas relevante es el proceso de empaquetado: el checkpoint calibrado de compressed-tensors se reempaqueta de forma sin perdida en AWQ GEMM convencional, de modo que cada codigo entero vuelve a su valor exacto y cada escala se preserva, sin una segunda pasada de cuantizacion. Ademas, se elimina el decodificador de sintesis de audio del tokenizador acustico, que la ruta ASR no utiliza (687,4 MB menos). El protocolo de streaming mantiene los ficheros de tokenizer y `preprocessor_config.json` del modelo base sin cambios: `chunk_frames` 22, `lookahead_frames` 4, `normalize_audio` false, audio mono a 24 kHz, ventanas de 83200 muestras que avanzan de 70400 en 70400 (la ultima se rellena con ceros).

## Capacidades

- Reconocimiento automatico del habla en streaming: emite texto por cada 2,93 segundos de audio con 0,53 segundos de lookahead, en lugar de esperar al final del fichero.
- Diarizacion integrada: el texto de salida incluye etiquetas de turno de palabra (`Speaker N:`), y el conjunto de calibracion contiene flujos que alternan entre dos hablantes.
- Puntuacion y formato: la salida incluye puntuacion y etiquetas de hablante (el autor las elimina antes de calcular el WER).
- Entrada de audio mono a 24 kHz sin normalizacion de sonoridad.
- Procesamiento de ficheros completos o de microfono en directo mediante la CLI de `vibevoice.c`.
- Servicio de inferencia: `vv_cli serve` expone streaming SSE (`stream=true`) y WebSocket en `/v1/audio/stream`, con soporte de varios slots (`--slots 8`).
- Ruta generica de modelo de lenguaje: el checkpoint conserva las capacidades de LM del base, aunque la calibracion de esa ruta solo cubre conversaciones de Ultrachat.
- No soporta sintesis de audio: el decodificador acustico fue podado y el checkpoint es exclusivamente ASR.
- No se documenta soporte de tool calling, function calling ni de modo de razonamiento explicito.

## Casos de uso

- Subtitulado en directo: el modelo emite un fragmento de texto cada 2,93 segundos con 0,53 segundos de lookahead, una latencia compatible con subtitulos casi en tiempo real sobre flujos de audio continuos.
- Transcripcion de reuniones con diarizacion: las etiquetas `Speaker N:` permiten reconstruir quien dijo que en conversaciones de varios participantes, algo que la calibracion contempla explicitamente con flujos que alternan entre dos hablantes.
- Analitica de llamadas de atencion al cliente: el servicio SSE y WebSocket permite consumir la transcripcion a medida que avanza la llamada y alimentar en paralelo un motor de busqueda o de analisis de sentimiento.
- Transcripcion por lotes de archivos largos: con RTF de 0,014 a 0,016 en una RTX 3090 (428 a 431 tokens/s), el modelo procesa audio mucho mas rapido que en tiempo real, lo que abarata el reprocesado de archivos ya grabados.
- Despliegue en hardware limitado o en el borde: el checkpoint completo ocupa 2,535 GB y las capas de lenguaje 664 MB en GPU, por lo que cabe en GPU de consumo y en equipos con recursos ajustados, sin depender de un servidor dedicado.
- Accesibilidad para personas con discapacidad auditiva: `vv_cli mic` permite capturar el microfono del equipo y generar subtitulos en vivo sobre la salida del modelo.
- Etiquetado masivo de corpus de audio: al ser un checkpoint ASR puro y ligero, es adecuado para generar transcripciones preliminares que despues se revisen, reduciendo el coste frente al BF16 con una degradacion de WER de 0,07 puntos en la validacion publicada.
- Integracion en asistentes de voz: la salida incremental puede alimentar a un modelo de lenguaje de mayor tamano que actue sobre el texto parcial, si bien el despliegue conjunto no esta documentado por el autor.

## Benchmarks y rendimiento

El autor no publica comparaciones con MMLU, HumanEval o GSM8K, que no aplican a una tarea ASR, sino una comprobacion de regresion sobre 12 flujos reservados (9,7 minutos, 1579 palabras de referencia) de los 8 hablantes de LibriSpeech dev-clean excluidos de la calibracion, 4 de ellos con alternancia entre dos hablantes:

| Ruta de evaluacion | Errores de palabra | WER |
|---|---:|---:|
| BF16 original, PyTorch, protocolo de streaming original | 58 | 3,67 % |
| Ficheros AWQ finales, desempaquetados de forma independiente para PyTorch | 58 | 3,67 % |
| BF16 original, `vibevoice.c --quant none` | 59 | 3,74 % |
| Ficheros AWQ finales, `vibevoice.c` con INT4 nativo | 59 | 3,74 % |

Velocidad medida con `vibevoice.c` en una RTX 3090, con kernels W4A16 nativos (sin desquantizacion a FP16) y el fichero completo procesado fragmento a fragmento:

| Audio | AWQ, `--attn flashinfer` (por defecto) | AWQ, `--attn fa2` | BF16 `--quant none` |
|---|---|---|---|
| 11 s | RTF 0,016; 430 tok/s | RTF 0,017; 418 tok/s | RTF 0,025; 206 tok/s |
| 30 s | RTF 0,016; 431 tok/s | RTF 0,016; 416 tok/s | RTF 0,024; 209 tok/s |
| 120 s | RTF 0,014; 428 tok/s | RTF 0,015; 380 tok/s | RTF 0,023; 207 tok/s |

El propio autor advierte que se trata de una comprobacion de regresion sobre habla leida en ingles y no de un benchmark de calidad representativo: no se han medido la precision multilingue, el rendimiento con audio ruidoso ni la calidad de la diarizacion tras la cuantizacion. El fichero `evaluation.json` del repositorio contiene todas las referencias y salidas.

## Requisitos de hardware

- VRAM estimada: el checkpoint completo en safetensors ocupa 2,535 GB y las capas de lenguaje en GPU 664 MB; con los componentes de voz en BF16 y los buffers de activacion, un presupuesto de 4 a 6 GB de VRAM es suficiente para una instancia (estimacion a partir de los tamanos reportados, no una cifra publicada por el autor).
- GPU recomendadas: el autor ha medido el modelo en una RTX 3090 con kernels INT4 nativos y FlashInfer; no publica cifras para A100, H100 ni otras GPU.
- Cabe en GPU de consumo: si, la evidencia publicada corresponde a una RTX 3090 de 24 GB; dado el tamano de las capas de lenguaje (664 MB) es razonable esperar que quepa en GPU con 8 GB o mas, aunque no hay mediciones publicadas en esas tarjetas.
- Opciones de despliegue: el autor proporciona y valida `vibevoice.c` (`vv_cli` para ficheros, `vv_cli mic` para microfono y `vv_cli serve` con SSE y WebSocket). La arquitectura es personalizada y no funciona con `AutoModelForCausalLM` sin la integracion de VibeVoice. El despliegue con vLLM no fue probado.
- Latencia y throughput: RTF de 0,014 a 0,017 y 380 a 431 tokens/s con AWQ en RTX 3090, frente a RTF 0,023-0,025 y 206-209 tokens/s en BF16, es decir, entre 1,5 y 2 veces mas rapido que el modelo sin cuantizar.
- Almacenamiento: 2,5 GB de repositorio frente a los 5,628 GB del BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ar4ikov/VibeVoice-ASR-Streaming-1.5B-AWQ-W4A16-ASYM | 2.237.046.656 (incluye voz) | AWQ W4A16 asimetrica, grupo 128 | no disponible | MIT | HuggingFace, safetensors; requiere `vibevoice.c` |
| microsoft/VibeVoice-ASR-Streaming-1.5B (base) | mismo modelo en BF16 | ninguna (BF16) | no disponible | MIT | HuggingFace, safetensors; checkpoint oficial |
| Ar4ikov/VibeVoice-ASR-AWQ-W4A16-ASYM (variante no streaming) | no disponible en la informacion proporcionada | AWQ W4A16 asimetrica | no disponible | MIT | HuggingFace, safetensors |

La busqueda web realizada no devolvio informacion util sobre modelos comparables (los resultados obtenidos correspondian al proyecto QGIS y no guardan relacion con este modelo), por lo que no se incluyen alternativas de otros desarrolladores. Para comparar con sistemas ASR de otros fabricantes seria necesario consultar sus propias fichas tecnicas, que no forman parte de la informacion disponible.

## Limitaciones y advertencias

- Checkpoint exclusivamente ASR: el decodificador acustico (`model.acoustic_tokenizer.decoder.*`) fue eliminado, por lo que el modelo no puede sintetizar audio y cualquier integracion debe tolerar la ausencia de esos pesos.
- Arquitectura personalizada: no es compatible con `AutoModelForCausalLM` sin la integracion de VibeVoice, lo que limita su uso a las herramientas que la implementan.
- Despliegue con vLLM no probado por el autor; no hay garantia de funcionamiento en ese motor de inferencia.
- Validacion limitada a habla leida en ingles: no se han medido la precision multilingue, el rendimiento con audio ruidoso ni la calidad de la diarizacion tras la cuantizacion. Los idiomas soportados figuran como no disponibles.
- La tabla de WER corresponde a una comprobacion de regresion interna sobre 9,7 minutos y 1579 palabras, no a un benchmark representativo; el propio autor lo advierte.
- Requisito de entrada estricto: audio mono a 24 kHz y sin normalizacion de sonoridad (`normalize_audio` false); no aplicar el preprocesado esperado puede degradar la transcripcion.
- Riesgo de alucinacion y de errores en nombres propios, cifras y terminos tecnicos, inherente a los sistemas ASR neuronales; la cuantizacion a 4 bits anade un riesgo adicional de degradacion no medido en dominios distintos del habla leida.
- Sesgos no evaluados: la calibracion usa 32 hablantes de LibriSpeech dev-clean, un corpus de habla leida en ingles con sesgo de acento y de estilo conocido; no se documenta ningun analisis de sesgo por acento, genero o edad.
- Aviso de licencia: el repositorio declara licencia MIT, la misma que el modelo base, pero conviene verificar las condiciones del checkpoint original de Microsoft antes de un uso comercial, dado que esta ficha se basa en los metadatos publicados y no en una revision juridica.
- Ausencia de soporte documentado de tool calling, function calling o modo de razonamiento: no debe asumirse que estas capacidades esten disponibles en produccion.
- Repositorio sin descargas ni interacciones registradas en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-1.5B-AWQ-W4A16-ASYM
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-1.5B
- Coleccion VibeVoice-ASR Quantized: https://huggingface.co/collections/Ar4ikov/vibevoice-asr-quantized
- Variante no streaming del mismo autor: https://huggingface.co/Ar4ikov/VibeVoice-ASR-AWQ-W4A16-ASYM
- Implementacion de inferencia `vibevoice.c`: https://github.com/Ar4ikov/vibevoice.c
- Conjunto de calibracion de la ruta de lenguaje: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- No se encontraron papers, blogs ni demos adicionales en la busqueda web realizada; los resultados obtenidos no guardaban relacion con este modelo.
