# aoiandroid/whisper-id-large-v3-turbo-whisperkit-coreml-ios

## Resumen

Este repositorio es una conversion a Core ML del modelo de reconocimiento automatico del habla (ASR) Willy030125/whisper_large_v3_turbo_finetuned_en_id_v1, un ajuste fino de openai/whisper-large-v3-turbo para indonesio e ingles. Lo publica el usuario aoiandroid bajo licencia MIT, con el formato de pesos que espera WhisperKit (la libreria de inferencia de Argmax para el ecosistema Apple), de modo que pueda ejecutarse en iOS, iPadOS y macOS sin depender de Python ni de PyTorch en tiempo de inferencia. El paquete ocupa unos 592 MB y esta pensado para inferencia local en dispositivo.

La aportacion tecnica no es un nuevo entrenamiento, sino una redistribucion en otro formato con compresion: los pesos del encoder y del decoder se han cuantizado con palettization k-means de 6 bits por tensor (coremltools), aplicada a todos los pesos de 2048 o mas elementos. El decoder se convirtio mediante `whisperkit-generate-model` con una PSNR de 35,5 frente a la referencia en PyTorch, y el encoder se trazo con el mismo modulo de whisperkittools usando un script de bajo consumo de memoria. Los ficheros resultantes son `MelSpectrogram.mlmodelc` (128 bins mel), `AudioEncoder.mlmodelc` (466 MB) y `TextDecoder.mlmodelc` (123 MB, con longitud de KV de 448); no se incluye `TextDecoderContextPrefill`.

Es relevante ahora porque cubre un nicho poco atendido: ASR de calidad para indonesio en hardware Apple, en un formato listo para integrarse en apps nativas. El autor declara que el modelo fuente se entreno sobre FLEURS, LibriVox filtrado en indonesio, ruido ambiental y el dataset STT_IndoSpeech de YouTube. La evaluacion publicada en la model card no usa WER, sino una metrica de cobertura de palabras de contenido, y el propio autor advierte que las cifras sobre FLEURS pueden ser optimistas porque no se documenta que split se uso en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (derivado de openai/whisper-large-v3-turbo); encoder con atencion SplitHeadsQ y decoder con atencion Cat en el grafo Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventanas de audio de 30 s o menos; longitud de KV del decoder de 448 |
| Tipos de cuantizacion | palettization k-means post-entrenamiento de 6 bits por tensor (pesos de 2048+ elementos), grafos en fp16; no se ofrecen variantes GGUF ni de 4/8 bits |
| Idiomas soportados | indonesio (id) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | Core ML (paquetes `.mlmodelc` dentro de un layout WhisperKit), mas `config.json`, `generation_config.json`, `tokenizer.json` y `tokenizer_config.json` |
| Tamano del repositorio | 0,6 GB (unos 592 MB desglosados en 466 MB de encoder, 123 MB de decoder y el resto mel/espectrograma y ficheros de configuracion) |
| Libreria de inferencia | whisperkit |
| Modelo base | Willy030125/whisper_large_v3_turbo_finetuned_en_id_v1 |
| Fecha de publicacion | 29 de septiembre de 2026 (actualizado el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder que consume un espectrograma mel de 128 bins y genera tokens de texto de forma autorregresiva. En esta conversion, el encoder procesa la ventana de audio y el decoder atiende a la representacion latente con una cache KV de longitud 448. La conversion se hizo con los modulos de argmaxinc/whisperkittools (commit 84f77a83), con atencion de encoder reorganizada como SplitHeadsQ, atencion de decoder en variante Cat, operaciones en fp16 y opset iOS 16 / macOS 13. El decoder paso por `whisperkit-generate-model`, que reporto una PSNR de 35,5 dB entre la salida de PyTorch y la de Core ML; el encoder se trazo desde el mismo modulo con un script de bajo consumo de memoria. Unicamente se elimino el componente opcional `TextDecoderContextPrefill`.

No se aporta informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO; el modelo original es un ajuste fino supervisado de un modelo ya entrenado, y la unica innovacion tecnica documentada es la compresion: palettization k-means de 6 bits por tensor aplicada a todos los pesos de 2048 o mas elementos del encoder y del decoder, sin ningun otro cambio en los pesos. Los datos de entrenamiento que el autor del modelo fuente declara son google/fleurs, Willy030125/librivox_filtered_id, Willy030125/ambient_noise_audio y Willy030125/STT_IndoSpeech_YT_Dataset. El tokenizer es el de openai/whisper-large-v3-turbo y el vocabulario es identico.

## Capacidades

- Reconocimiento automatico del habla (ASR) en indonesio e ingles, con salida de transcripcion.
- Inferencia completamente local en dispositivos Apple mediante Core ML y WhisperKit, sin llamadas a servicios externos.
- Procesamiento por ventanas de hasta 30 segundos de audio, con decodificacion greedy y una unica caida a temperatura 0,2 (fallback) segun la configuracion usada en la evaluacion.
- Modelo bilingue: el mismo paquete cubre indonesio e ingles, lo que permite transcribir audio en cualquiera de los dos idiomas.
- Integracion nativa en apps iOS y macOS a traves del layout WhisperKit (mel-espectrograma, encoder y decoder como modelos Core ML independientes).
- Capacidad de traducir ingles a indonesio (funcionalidad heredada del modelo base) — no verificada ni evaluada en la informacion disponible.
- Tool calling / function calling: no soportado (es un modelo de ASR, no un LLM conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Vision, audio de entrada como tarea multimodal distinta de ASR o modo "thinking": no disponibles.

## Casos de uso

- Transcripcion de voz en apps iOS nativas: el paquete esta en formato Core ML con opset iOS 16, de modo que se puede cargar directamente con WhisperKit en una app y transcribir audio sin salir del dispositivo, lo que reduce coste de servidor y evita enviar audio del usuario a terceros.
- Subtitulado y notas de voz en macOS: al ocupar unos 592 MB y no requerir GPU dedicada, encaja en un portatil Apple Silicon para generar subtitulos de grabaciones o transcripciones de reuniones de forma local.
- Atencion al cliente en indonesio: para empresas que operan en Indonesia, permite transcribir llamadas o mensajes de voz de soporte antes de pasarlos a un sistema de analisis, con el texto ya en indonesio y sin depender de APIs externas.
- Procesamiento de contenido audiovisual en indonesio: transcripcion de videos de YouTube o podcasts (el modelo fuente se entreno, entre otros, con un dataset de STT de YouTube en indonesio) para generar indices de busqueda o resumenes posteriores.
- Flujos de trabajo bilingues indonesio-ingles: escenarios de soporte o formacion en los que el audio alterna ambos idiomas o donde se necesita la transcripcion en un idioma distinto del hablado.
- Investigacion sobre cuantizacion de ASR: sirve como caso de estudio reproducible de hasta que punto una palettization de 6 bits degrada la calidad frente al modelo en fp32, con las cifras de cobertura publicadas por el autor.
- Despliegue en entornos con restricciones de red o de privacidad: por ejemplo, ambito sanitario o legal, donde el audio no puede salir del dispositivo y se necesita transcripcion local.
- Prototipado rapido en Apple: al estar ya convertido, elimina el paso de exportar el modelo desde PyTorch, que suele ser la parte mas fragil de un pipeline de ASR embebido.

## Benchmarks y rendimiento

La model card publica una evaluacion realizada en Mac, offline, el 30 de septiembre de 2026, sobre clips de 60 segundos. La metrica no es WER ni CER, sino "coverage": cobertura ponderada por frecuencia de las palabras de contenido de la transcripcion frente a la referencia. La decodificacion es greedy con una caida a temperatura 0,2, en ventanas de 30 s o menos.

| Modelo | FLEURS id, clips de 60 s (5 muestras, media / minimo) | Clip de noticias de TV en indonesio de 60 s |
|---|---|---|
| Este paquete Core ML (6 bits) | 0,985 / 0,972 | 0,904 |
| Modelo fuente ajustado (PyTorch fp32) | 0,987 / 0,972 | 0,888 |
| cahya/whisper-medium-id (PyTorch) | 0,919 / 0,901 | 0,872 |
| Scrya/whisper-medium-id-augmented (PyTorch bf16) | 0,937 / 0,914 | 0,832 |
| openai/whisper-small | 0,843 / 0,807 | 0,760 |

Advertencias del propio autor: el ajuste fino se entreno sobre FLEURS y no se documenta que split se uso, por lo que las cifras de FLEURS pueden ser optimistas; el clip de noticias no forma parte de los datos de entrenamiento que se pudieron inspeccionar. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de WER estandar en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: unos 592 MB para el paquete completo (466 MB encoder, 123 MB decoder, mas mel-espectrograma y configuracion); el repositorio en HuggingFace ocupa 0,6 GB.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al ser un grafo Core ML en fp16 con pesos palettizados a 6 bits, la huella es sensiblemente menor que la del modelo en fp32, pero no se publican cifras de memoria.
- GPU recomendadas: no se especifican. El destino declarado es el ecosistema Apple (Apple Silicon, GPU integrada via Core ML) con opset iOS 16 / macOS 13.
- Compatibilidad con GPU de consumidor: no verificada para GPUs NVIDIA o AMD; el formato `.mlmodelc` es especifico de Core ML y no se puede cargar en vLLM, llama.cpp, Ollama ni TGI.
- Opciones de despliegue: WhisperKit (libreria whisperkit) sobre Core ML en iOS 16+, iPadOS y macOS 13+; la conversion se genero con argmaxinc/whisperkittools.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de decodificacion ni de RTF (factor de tiempo real) en la informacion disponible.
- Nota de despliegue: no se incluye `TextDecoderContextPrefill`, componente opcional de WhisperKit; si el framework lo requiere en alguna configuracion, habria que generarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Metrica publicada aqui | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Core ML 6 bits) | no disponible | 30 s por ventana, KV 448 | 0,985 / 0,972 en FLEURS id; 0,904 en noticias | MIT | HuggingFace, formato Core ML para Apple |
| Willy030125/whisper_large_v3_turbo_finetuned_en_id_v1 | no disponible | 30 s por ventana | 0,987 / 0,972 en FLEURS id; 0,888 en noticias | MIT (segun model card) | HuggingFace, pesos PyTorch |
| cahya/whisper-medium-id | no disponible | 30 s por ventana | 0,919 / 0,901; 0,872 en noticias | no disponible | HuggingFace, PyTorch |
| Scrya/whisper-medium-id-augmented | no disponible | 30 s por ventana | 0,937 / 0,914; 0,832 en noticias | no disponible | HuggingFace, PyTorch bf16 |
| openai/whisper-small | no disponible | 30 s por ventana | 0,843 / 0,807; 0,760 en noticias | MIT (modelo original de OpenAI) | HuggingFace y multiples formatos |

La comparativa se limita a la metrica de cobertura reportada por el autor; no hay datos de WER comparables ni conteos de parametros en la informacion disponible. Frente a las alternativas de tamano medium en indonesio, tanto el modelo fuente como esta conversion quedan por delante en la metrica declarada, a costa de un mayor tamano de fichero.

## Limitaciones y advertencias

- La evaluacion no usa WER ni CER, sino una metrica de cobertura de palabras de contenido ponderada por frecuencia; no es directamente comparable con resultados publicados de otros modelos de ASR.
- El modelo fuente se entreno sobre FLEURS y no se documenta el split utilizado, por lo que las cifras de FLEURS pueden estar sesgadas al alza. El propio autor lo advierte.
- Solo se evaluaron 5 clips de FLEURS y un unico clip de noticias en indonesio: la muestra es muy pequena y no permite extrapolar a dominios (acentos, ruido, habla espontanea) no cubiertos.
- No hay evaluacion de sesgos demograficos, de genero, de acento regional ni de variedades del indonesio.
- Riesgo de alucinacion tipico de los modelos Whisper en segmentos con silencio, ruido o audio musical: sin datos especificos para esta conversion.
- Cobertura limitada a indonesio e ingles; otros idiomas no estan soportados de forma declarada, aunque el modelo base de OpenAI sea multilingue. No se documenta el comportamiento en code-switching dentro de una misma frase.
- La cuantizacion de 6 bits puede degradar ligeramente la precision frente al modelo fuente; en la tabla publicada la diferencia en FLEURS es de dos milesimas y en noticias la conversion obtiene una cifra superior, lo que sugiere que la diferencia cae dentro del ruido de la muestra.
- Licencia MIT, heredada del modelo fuente y de openai/whisper-large-v3-turbo: permite uso comercial, pero se debe mantener la atribucion a Willy030125 y a OpenAI, tal como indica el autor.
- El modelo no incluye `TextDecoderContextPrefill`; puede ser necesario generarlo segun la version de WhisperKit.
- El repositorio no tiene descargas ni likes y se publico en septiembre de 2026, sin historial de uso en produccion.
- El formato `.mlmodelc` es exclusivo de Core ML: no se puede desplegar en servidores Linux con vLLM, TGI, llama.cpp u Ollama sin reconvertir al modelo fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aoiandroid/whisper-id-large-v3-turbo-whisperkit-coreml-ios
- Modelo base (ajuste fino): https://huggingface.co/Willy030125/whisper_large_v3_turbo_finetuned_en_id_v1
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Herramientas de conversion (WhisperKit Tools): https://github.com/argmaxinc/whisperkittools
- Datasets de entrenamiento declarados por el modelo fuente: google/fleurs, Willy030125/librivox_filtered_id, Willy030125/ambient_noise_audio, Willy030125/STT_IndoSpeech_YT_Dataset
- Models comparados citados en la evaluacion: cahya/whisper-medium-id, Scrya/whisper-medium-id-augmented, openai/whisper-small
- La busqueda web no devolvio enlaces relevantes sobre este modelo (los resultados obtenidos corresponden a un futbolista y no guardan relacion con el contenido de la ficha).
