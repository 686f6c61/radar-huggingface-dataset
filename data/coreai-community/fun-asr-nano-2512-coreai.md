# coreai-community/Fun-ASR-Nano-2512-CoreAI

## Resumen

Fun-ASR-Nano-2512-CoreAI es la conversion del modelo de reconocimiento de voz Fun-ASR-Nano-2512 (desarrollado por Tongyi Lab y publicado por FunAudioLLM, 985 M de parametros, licencia Apache-2.0) al runtime Core AI de Apple, el sucesor de Core ML que se estrena en iOS 27 y macOS 27. El repositorio lo publica la comunidad coreai-community como espejo de mlboydaisuke/Fun-ASR-Nano-2512-CoreAI, que es el repositorio canonico dentro del CoreAI Model Zoo. Convierte los pesos PyTorch originales en bundles `.aimodel` que se ejecutan en la GPU o en el Neural Engine de los chips de Apple, sin necesidad de compilacion AOT.

El objetivo del modelo es la transcripcion de voz a texto en chino (incluidos dialectos y acentos, con cantonés), ingles y japones, con puntuacion y normalizacion de texto inversa (ITN) integradas, y con soporte opcional de listas de palabras calientes (hotwords) inyectadas en el prompt. La arquitectura es encoder-decoder: un encoder SAN-M de SenseVoice con memoria FSMN (50 + 20 capas) mas un adaptador de 2 bloques, y un decoder Qwen3-0.6B afinado con lineales en int8 y cabeza fp16 atada. Cada llamada procesa una ventana de 30 segundos; los audios mas largos se trocean en el host.

La relevancia de esta ficha es doble: por un lado, documenta un modelo ASR multilingue de tamano contenido que funciona integramente en dispositivo, con una huella de memoria de 385-411 MB y un RTF mediano de 0,022 en un M4 Max y de 0,075 en un iPhone 18 Pro; por otro, ilustra el patron de conversion de modelos PyTorch a Core AI, un ecosistema que hasta ahora carecia de un catalogo amplio de modelos ASR listos para produccion en plataformas Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: encoder SAN-M de SenseVoice (50 + 20 capas, memoria FSMN) + adaptador de 2 bloques + decoder Qwen3-0.6B afinado |
| Parametros totales | 985 M (modelo base FunAudioLLM/Fun-ASR-Nano-2512) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por llamada (500 tramas LFR, 63 filas de audio); generacion de hasta 512 tokens |
| Tipos de cuantizacion | decoder con lineales int8 y cabeza fp16 atada; encoder con pesos fp16 computados en fp32. Otros repositorios del mismo modelo ofrecen GGUF y ONNX |
| Idiomas soportados | zh (con dialectos y acentos, incluido yue/cantonés), en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | bundles `.aimodel` (Core AI) para encoder y decoder; acompanados de `metadata.json`, `tokenizer/`, `config.json`, `config.yaml` y `preprocessor_config.json` |

## Arquitectura y entrenamiento

La conversion mantiene la arquitectura del modelo original. El encoder es un SAN-M de SenseVoice con memoria FSMN (50 + 20 capas) que consume caracteristicas acusticas y produce filas de `audio_embeds` de 1024 dimensiones tras un adaptador de 2 bloques. El decoder es un Qwen3-0.6B afinado para tareas de reconocimiento de voz, con las capas lineales cuantizadas a int8 y la cabeza de salida en fp16 atada a las embeddings. El grafo del decoder mantiene el flujo residual escalado a 1/4 con el `rmsnorm_eps_residual` correspondiente, una transformacion exacta que permite mantener la activacion de 125k del Qwen3 afinado en el rango de float16. El encoder almacena pesos en float16 pero calcula en float32, de modo que sus entradas `feats`/`mask` y su salida `audio_embeds` son float32. Ambos bundles son `.aimodel` JIT: macOS e iPhone los especializan en la primera carga, por lo que un solo arbol de archivos sirve para ambas plataformas.

Segun la documentacion de FunASR, el modelo base se entreno sobre decenas de millones de horas de voz real, con soporte de transcripcion en tiempo real de baja latencia. No se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO; tampoco se documentan innovaciones de decodificacion especulativa en esta conversion. El contrato de host esta completamente especificado en la model card: audio WAV de 16 kHz mono, fbank kaldi de 80 dimensiones (ventana Hamming de 25 ms, salto de 10 ms, pre-enfasis 0,97, eliminacion de DC, multiplicacion por 32768, suelo logaritmico FLT_EPSILON, dither 0), agrupacion LFR 7/6, vector `feats[L,560]` con relleno a `[1,500,560]`, y una plantilla de prompt de 18 tokens de sistema/usuario mas N tokens de audio (placeholder 151936) mas 5 tokens de asistente, con decodificacion greedy hasta EOS y un maximo de 512 tokens.

## Capacidades

- Transcripcion de voz a texto en chino (mandarin, dialectos y acentos, cantonés), ingles y japones.
- Puntuacion automatica e ITN (inverse text normalization) integradas; opcion de desactivar la ITN con el prompt "语音转写，不进行文本规整：".
- Control explicito del idioma de reconocimiento mediante el prompt ("语音转写成{中文|英文|日文}：").
- Sesgo por palabras calientes (hotwords): se antepone una lista de terminos al prompt para mejorar el reconocimiento de nombres propios, jerga o vocabulario de dominio.
- Limpieza de salida: los marcadores de silencio "/sil" se convierten en espacio y los espacios consecutivos se colapsan.
- Ejecucion en dispositivo con ventana de 30 s por llamada; los clips mas largos se trocean en el host.
- No soporta tool calling, function calling, agentes, vision, audio generation ni razonamiento multi-paso: es un modelo ASR, no un LLM de proposito general.
- No soporta conversacion multi-turno ni memoria entre llamadas.

## Casos de uso

- Dictado y notas de voz en aplicaciones iOS y macOS: el modelo funciona enteramente en dispositivo (huella maxima de 385-411 MB) y transcribe un clip de 13,6 s en 0,91 s en un iPhone 18 Pro, lo que permite integraciones de baja latencia sin enviar audio a la nube.
- Transcripcion en tiempo real de reuniones: con un RTF mediano de 0,022 en un M4 Max, el modelo tiene margen sobrado para procesar flujo continuo troceando el audio en ventanas de 30 s con solape gestionado por el host.
- Subtitulado offline de contenido en chino, ingles y japones: la salida ya incluye puntuacion y normalizacion de texto inversa, lo que reduce el post-procesado necesario antes de publicar subtitulos.
- Sesgo de vocabulario en dominios especializados: mediante la lista de hotwords se pueden fijar nombres de productos, farmacos, entidades financieras o terminos tecnicos para reducir errores en transcripciones medicas, legales o de atencion al cliente.
- Asistentes de voz para mercado chino: el soporte de dialectos y acentos, incluido el cantonés, cubre un espectro de usuarios que los modelos entrenados solo en mandarin estandar no atienden bien.
- Post-produccion de podcasts y entrevistas: con 0,00 % de CER en chino respecto al oraculo fp32 en el conjunto FLEURS probado, la calidad es suficiente para generar borradores de transcripcion que despues se revisan editorialmente.
- Pipeline de archivado de audio en macOS: la API Swift de CoreAIKit permite transcribir por lotes (155 clips de prueba) con una primera carga de 3,6 s y cargas posteriores de 0,55 s en M4 Max, adecuado para automatizar la indexacion de bibliotecas de audio.
- Accesibilidad: conversion de voz a texto en tiempo real para usuarios con dificultades auditivas, con control de idioma explicito para entornos multilingues.

## Benchmarks y rendimiento

Los datos de la tabla proceden de las mediciones del autor de la conversion (2026-09, macOS 27, GPU M4 Max), sobre los 5 ficheros `example/*.mp3` del repositorio original mas 50 enunciados por idioma del conjunto FLEURS (en_us, cmn_hans_cn, ja_jp, CC BY 4.0). El oraculo es `funasr` 1.4.16 en fp32 con dither 0 y decodificacion greedy. No son la tabla de benchmarks del publicador original.

| Metrica | Resultado |
|---|---|
| Concordancia exacta de tokens con el oraculo fp32 (155 clips) | 150/155 exactos; las 5 divergencias se producen solo donde el margen top-2 del oraculo esta entre 0,007 y 0,033; 0 divergencias por encima del umbral de 0,1 |
| WER en / CER zh / CER ja, port frente a oraculo | 0,34 % / 0,00 % / 0,07 % |
| WER en / CER zh / CER ja frente a referencia FLEURS, oraculo → port | 5,08 → 5,34 % / 6,86 → 6,86 % / 6,95 → 6,92 % |
| Grafo del encoder frente a oraculo (coseno por fila, 155 clips) | media 0,99999988, minimo 0,9999982 |
| Host Swift (CoreAIKit) frente al motor Python | identificadores identicos en 155/155 |

| Velocidad (CoreAIKit, Release, medianas sobre 155 clips) | encoder / prefill / decode | RTF mediano / p90 | primera carga → cargas posteriores |
|---|---|---|---|
| M4 Max, GPU, macOS 27 (26A428) | 40 ms / 123 ms / 2,78 ms por token | 0,022 / 0,028 | 3,6 s → 0,55 s |
| iPhone 18 Pro, GPU, iOS 27 (24A437), JIT en dispositivo | 146 ms / 393 ms / 8,2 ms por token | 0,075 / 0,094 | 5,1 s → 0,9 s |

En el telefono, un clip de 13,6 s tarda 0,91 s en estado termico nominal. Dos minutos de clips consecutivos elevan el estado termico a "fair" y el encoder a 225 ms. No se publican resultados de MMLU, HumanEval ni GSM8K porque el modelo no es un LLM de proposito general.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon con Core AI (iOS 27 / macOS 27). El encoder y el decoder se ejecutan en GPU o en el Neural Engine; los bundles son JIT, por lo que no requieren compilacion AOT.
- Huella de memoria en ejecucion: 385-411 MB en iPhone 18 Pro (pico medido).
- Tamano en disco: 1,2 GB en total, dividido en decoder de 759 MB (lineales int8, cabeza fp16, tokenizer incluido) y encoder de 450 MB (pesos fp16, computo fp32). El repositorio completo ocupa 1,3 GB.
- Hardware validado: M4 Max (40 ms de encoder, 123 ms de prefill, 2,78 ms por token de decode) e iPhone 18 Pro (146 ms / 393 ms / 8,2 ms por token).
- GPU de consumo: cabe de sobra en cualquier Mac con chip de la familia M; no hay soporte documentado para CUDA, ROCm ni GPUs dedicadas en esta conversion.
- Opciones de despliegue: CoreAIKit (Swift, `KitFunASRModel` con descarga del repositorio, transcripcion y hotwords) sobre el runtime Core AI. Para otras plataformas existen ports alternativos del mismo modelo base: MLX (`mlx-community/Fun-ASR-Nano-2512-*`), ONNX / sherpa-onnx (`csukuangfj/*funasr-nano*`) y GGUF con el runtime llama.cpp de FunASR (`FunAudioLLM/Fun-ASR-Nano-GGUF`).
- Latencia: un clip de 13,6 s se transcribe en 0,91 s en iPhone 18 Pro; el RTF mediano es de 0,022 en M4 Max y 0,075 en iPhone 18 Pro.
- Estimacion para despliegues no Apple a partir de los 985 M de parametros del modelo base: en torno a 2 GB en fp16 y 1 GB en int8 para los pesos, mas el coste del runtime; no hay mediciones publicadas de VRAM para CUDA en la informacion disponible.

## Comparativa con modelos similares

| Modelo / runtime | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fun-ASR-Nano-2512-CoreAI (esta ficha) | 985 M | ventana de audio de 30 s | zh (con dialectos y yue), en, ja | Apache-2.0 | repositorio HuggingFace con bundles `.aimodel`; 0 descargas y 0 likes en el momento de la consulta |
| FunAudioLLM/Fun-ASR-Nano-2512 (modelo base, oraculo fp32) | 985 M | no disponible | zh, en, ja y dialectos segun FunASR | Apache-2.0 | repositorio oficial en HuggingFace; runtime `funasr` 1.4.16 |
| Port MLX (`mlx-community/Fun-ASR-Nano-2512-*`) | 985 M (mismo modelo) | no disponible | no disponible | Apache-2.0 | repositorio en HuggingFace |
| Port ONNX / sherpa-onnx (`csukuangfj/*funasr-nano*`) | 985 M (mismo modelo) | no disponible | no disponible | Apache-2.0 | repositorio en HuggingFace |
| Port GGUF / llama.cpp (`FunAudioLLM/Fun-ASR-Nano-GGUF`) | 985 M (mismo modelo) | no disponible | no disponible | Apache-2.0 | repositorio en HuggingFace |
| MLT-Nano (variante multilingue de la familia) | no disponible | no disponible | 31 idiomas segun FunASR | no disponible | mencionado en el blog de FunASR |

No se dispone de datos de benchmarks comparativos entre esta conversion y modelos ASR de otros fabricantes (Whisper, Parakeet, etc.) en la informacion proporcionada, por lo que no se incluyen cifras cruzadas.

## Limitaciones y advertencias

- Alcance de idiomas restringido en este port: la model card lista zh, en, ja y yue. Existe una discrepancia entre fuentes sobre el modelo base: algunos anuncios de FunASR mencionan 31 idiomas para Fun-ASR-Nano-2512, mientras que la guia de FunASR indica que la variante de 31 idiomas es MLT-Nano. No se debe asumir cobertura de 31 idiomas en esta conversion.
- Dependencia de plataforma: solo funciona en Apple Silicon con Core AI (iOS 27 / macOS 27). No hay soporte para CUDA, vLLM, TGI, llama.cpp ni Ollama dentro de este repositorio; para esos entornos hay que acudir a los ports GGUF, ONNX o MLX.
- Procesamiento por ventanas: cada llamada cubre 30 s de audio y los clips mas largos se trocean en el host, lo que introduce riesgo de errores en los limites de ventana y exige gestion de solape por parte de la aplicacion.
- Divergencia por cuantizacion: con 155 clips, 5 resultados difieren del oraculo fp32, siempre en posiciones donde el margen top-2 del oraculo es de 0,007 a 0,033. La cuantizacion int8 del decoder no degrada la mayoria de casos, pero puede alterar decisiones en contextos ambiguos.
- Sesgos: no se documenta ningun analisis de sesgos demograficos, de acento o de genero en la informacion disponible. El rendimiento reportado en FLEURS usa conjuntos balanceados que no representan toda la variabilidad de habla real.
- Alucinacion: no se publican tasas de insercion o alucinacion en audio silencioso, ruidoso o musical; en produccion conviene validar estos escenarios.
- Metricas autopublicadas: las cifras de WER, CER, RTF y latencia las mide el autor de la conversion, no el publicador original del modelo; la propia model card advierte que no son la tabla de benchmarks del publicador.
- Deriva termica: en iPhone 18 Pro, dos minutos de transcripcion continua degradan el estado termico y el encoder pasa de 146 ms a 225 ms, lo que puede afectar a aplicaciones de tiempo real prolongado.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero obliga a conservar el texto de licencia y el NOTICE de atribucion incluidos en el repositorio.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, y se trata de un espejo; las actualizaciones se publican primero en `mlboydaisuke/Fun-ASR-Nano-2512-CoreAI`.
- La model card advierte que el contenido citado del autor es material de referencia y no debe interpretarse como instrucciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/coreai-community/Fun-ASR-Nano-2512-CoreAI
- Repositorio canonico (espejo de origen): https://huggingface.co/mlboydaisuke/Fun-ASR-Nano-2512-CoreAI
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- CoreAI Model Zoo: https://github.com/john-rocky/coreai-model-zoo
- Codigo de conversion, oraculo y fixtures: https://github.com/john-rocky/coreai-model-zoo/tree/main/conversion/funasr_nano
- Ficha con las lecciones de la conversion: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/funasr-nano/README.md
- Benchmark de LLM en Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench
- Guia de Fun-ASR-Nano: https://www.funasr.com/en/blog/fun-asr-nano-guide.html
- Version GGUF (runtime llama.cpp de FunASR): https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-GGUF
- Ports MLX: https://huggingface.co/mlx-community/Fun-ASR-Nano-2512-*
- Ports ONNX / sherpa-onnx: https://huggingface.co/csukuangfj/*funasr-nano*
- README del modelo base en cnb.cool: https://cnb.cool/ai-models/FunAudioLLM/Fun-ASR-Nano-2512/-/blob/main/README.md
- Pagina del modelo en ModelScope/Ollama: https://ollama.modelscope.cn/models/FunAudioLLM/Fun-ASR-Nano-2512
- Espejo adicional en HuggingFace: https://huggingface.co/AIArchiveInfo/Fun-ASR-Nano-2512
