# aoiandroid/whisper-fa-large-v3-turbo-whisperkit-coreml-ios

## Resumen

Este repositorio contiene una conversion a Core ML del modelo de reconocimiento automatico del habla (ASR) en persa vhdm/whisper-large-fa-v1, que a su vez es un ajuste fino en persa de openai/whisper-large-v3-turbo. La conversion la publica el usuario aoiandroid bajo el layout que espera WhisperKit, la libreria de inferencia de Argmax para Apple Silicon, de modo que el modelo pueda ejecutarse en iPhone, iPad y Mac sin depender de PyTorch.

El objetivo es claro: llevar un ASR de calidad para persa a dispositivos Apple de forma completamente offline. Para ello, el encoder se dividio en dos submodelos Core ML (capas 0-15 y 16-31 mas layer norm) con el fin de poder convertirlo en una maquina con 8 GB de memoria, y los pesos se cuantizaron a 6 bits mediante palettization k-means por tensor. El resultado ocupa unos 592 MB, un tamano manejable para aplicaciones moviles.

Se trata de un artefacto de formato mas que de un modelo nuevo: no hubo entrenamiento adicional sobre los pesos de origen, solo conversion y cuantizacion. Su relevancia es practica, ya que permite integrar transcripcion en persa en apps iOS nativas, pero su evaluacion publicada es muy limitada (cuatro clips de FLEURS con una metrica de cobertura de palabras, no de WER).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper), convertido a Core ML |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 448 tokens de KV en el decodificador; ventanas de audio de 30 s (configuracion de Whisper) |
| Tipos de cuantizacion | 6-bit palettized (k-means post-entrenamiento por tensor); tensores de menos de 2048 elementos se mantienen en fp16 |
| Idiomas soportados | Persa (fa) |
| Licencia | MIT |
| Formato de pesos | Core ML (.mlmodelc): MelSpectrogram, AudioEncoder (dividido) y TextDecoder; mas config.json, generation_config.json, tokenizer.json y tokenizer_config.json |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper en su variante large-v3-turbo: un encoder de audio y un decoder de texto de tipo transformer. La conversion a Core ML respeta el layout de WhisperKit y separa el encoder en dos modelos (capas 0-15 y 16-31 mas layer norm) con los mismos nombres, formas y tipos de entrada y salida que tendria un encoder unico, de modo que el pipeline sigue siendo funcional. El text decoder tiene una longitud de KV de 448 y no se incluye el modulo opcional TextDecoderContextPrefill. El modelo de mel-espectrograma usa 128 bins.

En cuanto al entrenamiento, este repositorio no ha anadido ninguna fase de entrenamiento: es una conversion de pesos con palettization. El ajuste fino original en persa lo realizo vhdm sobre el dataset vhdm/persian-voice-v1, partiendo de openai/whisper-large-v3-turbo. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, por lo que esos datos no estan disponibles. El tokenizer se toma directamente de openai/whisper-large-v3-turbo, ya que el repositorio de origen no incluye tokenizer.json.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en persa.
- Procesamiento de audio por ventanas (la app de referencia usa ventanas de 15 s y Whisper opera sobre fragmentos de 30 s), lo que permite abordar audios largos por segmentacion.
- Decodificacion greedy con el token de idioma persa forzado, segun la evaluacion de la model card.
- Funcionamiento completamente offline una vez descargado el modelo.
- Ejecucion on-device en Core ML aprovechando todas las unidades de computo disponibles (CPU, GPU y Neural Engine).
- No hay soporte de tool calling ni de function calling: es un modelo de ASR, no un LLM de instrucciones.
- No dispone de vision, audio understanding mas alla de la transcripcion, ni modo de razonamiento explicito.
- Aunque el modelo base (whisper-large-v3-turbo) es multilingue, este ajuste fino esta orientado a persa y la model card solo declara el idioma fa.

## Casos de uso

- Dictado y notas de voz en apps iOS: el modelo puede transcribir en el dispositivo sin enviar audio a la nube, lo que resulta adecuado para aplicaciones de privacidad estricta y para escenarios sin conectividad.
- Subtitulado automatico de video en persa: dado su tamano (592 MB) y su formato Core ML, se puede integrar en un editor de video para Mac o iPad que genere subtitulos a partir de la pista de audio.
- Transcripcion de reuniones y llamadas: la segmentacion por ventanas permite procesar conversaciones largas de forma incremental, generando actas o resumenes posteriores.
- Analitica de centros de contacto: transcripcion por lotes de grabaciones en persa para su posterior busqueda, clasificacion o analisis de calidad, ejecutandose en flotas de Macs sin GPU dedicada.
- Indexacion y busqueda de archivos audiovisuales: convertir el audio a texto para habilitar busqueda semantica sobre un archivo de podcasts, clases o entrevistas en persa.
- Asistentes de voz en persa: uso como etapa de ASR previa a un LLM o a un sistema de comandos, aprovechando la naturaleza offline y de baja latencia de la inferencia local.
- Accesibilidad: generacion de transcripciones y subtitulos en tiempo real para personas con discapacidad auditiva en contenido en persa.

## Benchmarks y rendimiento

La model card publica una unica evaluacion, realizada en Mac de forma offline el 2026-10-17. La metrica no es WER, sino cobertura ponderada por frecuencia de palabras de contenido frente a la referencia, sobre cuatro clips de unos 60 s de locuciones de FLEURS fa_ir (split test) a -26 dBFS, unidos con 0,5 s de silencio, con ventanas de 15 s en la app, decodificacion greedy con el token de idioma persa y Core ML usando todas las unidades de computo.

| Clip | Cobertura |
|---|---|
| fleurs-0 | 0,894 |
| fleurs-1 | 0,975 |
| fleurs-2 | 0,908 |
| fleurs-3 | 0,832 |
| Media | 0,902 |

No se han publicado resultados de benchmarks comparables (WER, MMLU, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- Espacio en disco: aproximadamente 592 MB en total para todos los ficheros del repositorio (el repositorio completo figura como 0,6 GB).
- Plataforma de ejecucion: Apple Silicon (macOS e iOS/iPadOS) a traves de Core ML y WhisperKit; no esta pensado para GPU NVIDIA ni para servidores x86 con CUDA.
- Memoria durante la conversion: se necesito un Mac de 8 GB, motivo por el cual el encoder se convirtio en dos mitades.
- Encaje en hardware de consumo: si, esta disenado para ello, incluyendo iPhone, iPad y Macs con 8 GB de RAM.
- Opciones de despliegue: WhisperKit (argmaxinc/WhisperKit) y Core ML. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo en formato GGUF o safetensors de transformers.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| aoiandroid/whisper-fa-large-v3-turbo-whisperkit-coreml-ios | ASR Core ML (6-bit) | Persa | Core ML / WhisperKit | MIT | Conversion de este repositorio; 592 MB; sin entrenamiento adicional |
| vhdm/whisper-large-fa-v1 | ASR | Persa | no disponible | MIT | Modelo de origen del ajuste fino en persa |
| openai/whisper-large-v3-turbo | ASR | 99 idiomas | safetensors / PyTorch | MIT | Modelo base; multilingue; requiere conversion para Core ML |
| openai/whisper-large-v3 | ASR | 99 idiomas | safetensors / PyTorch | MIT | Alternativa de mayor tamano en la familia Whisper, no turbocomprimida |

No se dispone de cifras de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La evaluacion publicada es muy reducida: cuatro clips de FLEURS y una metrica de cobertura de palabras, no un WER estandar, por lo que la calidad real en produccion no puede extrapolarse con rigor.
- El alcance linguistico es solo persa (fa); no hay evidencia de buen rendimiento en otros idiomas, aunque el tokenizer provenga de un modelo multilingue.
- Riesgo de alucinacion propio de la familia Whisper: en segmentos con ruido, silencio o audio musical es habitual que el decoder genere texto inventado o repita frases.
- La cuantizacion a 6 bits con palettization k-means degrada los pesos respecto al modelo de origen; no hay una comparacion publicada entre esta version y los pesos sin cuantizar.
- No se incluye el modulo opcional TextDecoderContextPrefill, lo que puede afectar al rendimiento en decodificacion con contexto largo segun como lo espere WhisperKit.
- La licencia es MIT, lo que permite uso comercial, pero el autor pide atribucion a vhdm y aclara que el mirror no esta respaldado por vhdm ni por OpenAI.
- Es un cambio de formato con cuantizacion, no un modelo entrenado de nuevo: cualquier mejora futura depende del modelo de origen vhdm/whisper-large-fa-v1.
- El repositorio tiene cero descargas y cero likes en el momento de redactar esta ficha, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aoiandroid/whisper-fa-large-v3-turbo-whisperkit-coreml-ios
- Modelo de origen (ajuste fino en persa): https://huggingface.co/vhdm/whisper-large-fa-v1
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de entrenamiento del ajuste fino: https://huggingface.co/datasets/vhdm/persian-voice-v1
- Herramientas de conversion usadas: https://github.com/argmaxinc/whisperkittools
- WhisperKit (runtime de inferencia en Apple): https://github.com/argmaxinc/WhisperKit
- Dataset FLEURS, empleado en la evaluacion de la model card: https://huggingface.co/datasets/google/fleurs
