# madjinn/belle-whisper-large-v3-turbo-zh-coreml

## Resumen

Este repositorio contiene una conversión a Core ML del modelo de reconocimiento automático del habla Belle-whisper-large-v3-turbo-zh, desarrollado por BELLE-2 (LianjiaTech) a partir de Whisper Large v3 Turbo de OpenAI y afinado para mandarín con puntuación. La conversión la firma Madjinn y su objetivo es ejecutar el modelo en el Apple Neural Engine mediante el formato y el grafo de WhisperKit (Argmax), con los pesos cuantizados a 8 bits (int8 simétrico por canal). No se ha reentrenado nada: solo se ha cambiado el formato y la precisión.

El modelo resuelve un problema muy concreto: llevar un ASR de calidad para chino a dispositivos Apple con aceleración por hardware, con un tamaño de repositorio de 0,8 GB (encoder 639 MB, decoder 173 MB) y una ventana de audio de 30 segundos (480 000 muestras a 16 kHz). Es relevante para desarrolladores que quieran integrar dictado o transcripción en mandarín dentro de apps macOS/iOS sin depender de la nube, usando el ecosistema WhisperKit.

La arquitectura subyacente es la de Whisper Large v3 Turbo: encoder Transformer con 1280 dimensiones de embedding y decoder de 4 capas, con vocabulario de 51 866 tokens. El decoder admite una longitud máxima de secuencia de 448 tokens y caché KV de 5120×448. La licencia es Apache-2.0, heredada del modelo base de BELLE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3 Turbo), convertido a Core ML |
| Parametros totales | no disponible (repo de 821 960 907 bytes; encoder 639 MB, decoder 173 MB en int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio de entrada de 30 s (480 000 muestras); decoder con longitud máxima de secuencia de 448 tokens |
| Tipos de cuantizacion | int8 lineal simétrico por canal (pesos de 2048 elementos o más); espectrograma mel en fp16 |
| Idiomas soportados | chino (zh), simplificado, con puntuación |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML `.mlmodelc` (MelSpectrogram, AudioEncoder, TextDecoder), layout WhisperKit |

## Arquitectura y entrenamiento

El modelo es un Whisper Large v3 Turbo estándar: encoder Transformer que transforma el espectrograma mel (salida `[1,128,1,3000]`) en embeddings `[1,1280,1,1500]`, y un decoder autorregresivo de 4 capas con atención sobre la caché KV `[1,5120,1,448]`. La conversión se realizó con whisperkittools en el commit `b5c1e50eb611240025c158784ec34bbfce26de09`, con argmaxtools 0.1.7, coremltools 7.1, torch 2.2.1 y transformers 4.39.1. Se usó `whisperkit-generate-model` con `--text-decoder-max-sequence-length 448` y atención de encoder `SplitHeadsQ`, decoder `Cat`. La cuantización se aplicó con `linear_quantize_weights` (modo `linear_symmetric`, int8 por canal, `weight_threshold=2048`) en `AudioEncoder` y `TextDecoder`, y los modelos se compilaron con `xcrun coremlcompiler` (coremlc 3520.5.1).

No hay información sobre el entrenamiento original de BELLE más allá de que es un fine-tuning de Whisper Large v3 Turbo para mandarín con puntuación. Los ficheros `config.json`, `generation_config.json` y `tokenizer.json` son byte a byte idénticos a los de OpenAI, por lo que los tokens de idioma y tarea son los de Whisper. La conversión se ejecutó en Linux, donde Core ML no puede ejecutarse, por lo que los pasos de predicción de los tests se sustituyeron por el guardado del `.mlpackage`; las pruebas de paridad en PyTorch sí se ejecutaron sin cambios.

## Capacidades

- Reconocimiento automático del habla en mandarín (chino simplificado) con puntuación incluida.
- Transcripción de clips de audio de hasta 30 segundos por ventana, con la posibilidad de encadenar ventanas según el pipeline de WhisperKit.
- Salida con alineación temporal: el decoder expone `alignment_heads_weights` para timestamps a nivel de token.
- Ejecución en el Apple Neural Engine mediante Core ML, con el grafo y el layout de WhisperKit.
- Detección y uso de tokens de idioma y tarea de Whisper (idioma `zh`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo ASR.
- No tiene capacidades de visión, audio generativo ni modo de pensamiento.

## Casos de uso

- Dictado por voz en apps de macOS/iOS: el modelo cabe en 0,8 GB y está compilado para el Neural Engine, por lo que puede integrarse en un teclado de dictado (el autor lo usa en WhispAway) y transcribir en local sin enviar audio a servidores.
- Transcripción de reuniones y notas de voz en chino: con ventanas de 30 s y puntuación de salida, se puede procesar audio grabado en dispositivo y generar actas legibles sin post-procesado de puntuación.
- Subtitulado automático de vídeo en mandarín: los pesos de alineación (`alignment_heads_weights`) permiten generar marcas temporales por token para sincronizar subtítulos.
- Asistentes de voz offline para apps empresariales en China o para usuarios que exigen privacidad: al ejecutarse en el Neural Engine, el audio no sale del dispositivo, lo que simplifica el cumplimiento normativo.
- Búsqueda por voz en catálogos o bases de conocimiento en chino: la transcripción local alimenta un índice de texto sin coste de API de ASR.
- Accesibilidad: conversión de voz a texto en tiempo real para personas con discapacidad auditiva en entornos de habla mandarina, aprovechando la latencia potencialmente baja del Neural Engine (no medida por el autor).
- Preprocesado de datasets de audio en chino: transcripción por lotes en Macs para generar corpus etiquetados, con la ventaja de que la licencia Apache-2.0 permite uso comercial.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Paridad en PyTorch, encoder (PSNR) | 142 dB |
| Paridad en PyTorch, decoder (PSNR) | 130 dB, mismo token top en todas las posiciones |
| Similitud coseno de la salida del encoder frente a fp16 | 0,973–0,986 |
| Tasa de error de caracteres (CER) en 6 clips FLEURS `cmn_hans_cn`, int8 | 1,0 % |
| CER en los mismos clips, fp16 | 1,0 % |
| CER en los mismos clips, BELLE whisper.cpp q8_0 | 1,5 % |

Las pruebas de transcripción se hicieron con decodificación greedy, token de idioma `zh`, sobre seis clips de 9–15 s del test set FLEURS `cmn_hans_cn` (CC BY 4.0), ejecutando los modelos compilados en la CPU de un Mac. Frente a la conversión fp16, cinco transcripciones fueron idénticas y una difirió en una sola coma. El autor indica que la velocidad y el consumo de memoria en dispositivos aún no se han medido.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para el Apple Neural Engine y la CPU/GPU de Apple, no para GPU NVIDIA.
- GPU recomendadas: ninguna GPU NVIDIA; requiere hardware Apple con Neural Engine (Apple Silicon: M1 en adelante, y chips A-series compatibles con Core ML).
- Cabe en dispositivos de consumo: sí, el repositorio ocupa 0,8 GB y está cuantizado a int8 precisamente para reducir huella.
- Opciones de despliegue: WhisperKit (Argmax) apuntando `modelRepo` a este repositorio y el modelo a `belle-large-v3-turbo-zh-int8`; el autor no ha probado ese flujo, ya que WhispAway usa su propio pipeline de Core ML. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos en dispositivos según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Belle-whisper-large-v3-turbo-zh int8 Core ML) | no disponible (0,8 GB int8) | 30 s por ventana | zh | Apache-2.0 | Core ML / WhisperKit |
| BELLE-2/Belle-whisper-large-v3-turbo-zh (original) | no disponible | 30 s por ventana | zh | Apache-2.0 | safetensors (Hugging Face) |
| madjinn/whisper-large-v3-turbo-coreml | no disponible | 30 s por ventana | multilingüe | MIT (base OpenAI) | Core ML / WhisperKit |
| BELLE ggml-belle-large-v3-turbo-zh-q8_0 (whisper.cpp) | no disponible | 30 s por ventana | zh | Apache-2.0 | GGML q8_0 |

El modelo comparte grafo con la conversión de Whisper Large v3 Turbo de Madjinn y solo cambian los pesos, lo que facilita mantener ambos en una misma app. Frente a la versión GGML q8_0 de BELLE, la conversión Core ML obtuvo 1,0 % de CER frente a 1,5 % en la misma muestra, aunque la comparación se limita a seis clips. No se dispone de datos de benchmarks frente a otros ASR comerciales en la información proporcionada.

## Limitaciones y advertencias

- Solo transcribe chino; no es multilingüe pese a heredar el tokenizer de Whisper.
- El autor no ha medido velocidad ni memoria en dispositivos, por lo que el rendimiento real en producción es desconocido.
- La integración con WhisperKit no está probada: apuntar `modelRepo` "debería funcionar", pero no hay validación publicada.
- La evaluación se limita a seis clips de FLEURS de 9–15 s; no hay evaluación a gran escala ni en audio ruidoso, con acentos o con solapamiento de hablantes.
- Riesgo de alucinación típico de Whisper en silencios o audio de baja calidad; el autor no documenta mitigaciones.
- Posibles sesgos heredados del corpus de entrenamiento de BELLE y de Whisper, no cuantificados en esta ficha.
- La licencia Apache-2.0 permite uso comercial, pero se deben respetar también las licencias del modelo base (Whisper, MIT) y de las herramientas de conversión (whisperkittools y WhisperKit, MIT).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad.
- Conversión realizada en Linux sin ejecutar los tests de predicción de Core ML; solo se validó la paridad en PyTorch.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/madjinn/belle-whisper-large-v3-turbo-zh-coreml
- Modelo base: https://huggingface.co/BELLE-2/Belle-whisper-large-v3-turbo-zh
- Conversión de referencia de Whisper Large v3 Turbo: https://huggingface.co/madjinn/whisper-large-v3-turbo-coreml
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- whisperkittools (Argmax): https://github.com/argmaxinc/whisperkittools
- BELLE-2 en Hugging Face: https://huggingface.co/BELLE-2
- Repositorio LianjiaTech/BELLE: https://github.com/LianjiaTech/BELLE
- Whisper-Finetune (shuaijiang): https://github.com/shuaijiang/Whisper-Finetune
- App de dictado WhispAway: https://madjinn.dev
