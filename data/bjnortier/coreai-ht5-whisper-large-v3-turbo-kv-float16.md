# bjnortier/coreai-ht5-whisper-large-v3-turbo-kv-float16

## Resumen

`bjnortier/coreai-ht5-whisper-large-v3-turbo-kv-float16` es un export del modelo Whisper large-v3-turbo de OpenAI al formato Core AI de Apple, pensado para reconocimiento automatico del habla (ASR) totalmente en dispositivo sobre silicio de Apple. No contiene pesos PyTorch: el repositorio aloja un unico archivo ZIP de ~1,49 GB con assets `.aimodel` que solo se ejecutan a traves del runtime Core AI en macOS 27 / iOS 27 o posterior. Lo publica bjnortier, desarrollador independiente, y es la copia exacta que descarga la aplicacion Hello Transcribe 5.1 y posteriores.

El modelo resuelve el problema de transcribir audio sin salir del dispositivo: sin conexion, sin enviar grabaciones a un servidor y con la latencia de la NPU/GPU integrada. La arquitectura es el encoder-decoder clasico de Whisper, con `d_model` de 1280, 4 capas de decodificador, 20 cabezas de atencion, vocabulario de 51.866 tokens y una ventana de encoder de 30 segundos. La particularidad de este export es que empaqueta la cache KV de atencion cruzada en float16 dentro del propio asset del decodificador.

Su relevancia ahora es doble: por un lado demuestra que el runtime Core AI de Apple ya puede ejecutar un Whisper turbo token a token identico a la referencia greedy de PyTorch; por otro, expone una trampa importante de serializacion: el `generation_config.json` fija el prefijo `<|en|>`, de modo que con la libreria oficial el bundle solo transcribe ingles y, alimentado con audio en otro idioma, devuelve una traduccion fluida al ingles en lugar de un error. El fork de `CoreAISpeech` de bjnortier anade seleccion de idioma y deteccion automatica sin reexportar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder (transformer) |
| Parametros totales | 809 M (whisper-large-v3-turbo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s; 448 posiciones maximas de decodificacion |
| Tipos de cuantizacion | float16 (cache KV de atencion cruzada empaquetada en float16) |
| Idiomas soportados | 100 idiomas en `added_tokens.json`; el prefijo por defecto fuerza `<|en|>` |
| Licencia | MIT |
| Formato de pesos | `.aimodel` (assets Core AI de Apple) dentro de un ZIP; no safetensors, no GGUF |

Detalles de configuracion declarados en el bundle: `d_model` 1280, 4 capas de decodificador, 20 cabezas de atencion, vocabulario de 51.866 tokens, entrada de audio 16 kHz mono float32, encoder con ventana de 30 s y padding hasta completar la ventana. Tamano del repositorio: 1,5 GB.

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es un cambio de formato de serializacion sobre `openai/whisper-large-v3-turbo`. La arquitectura subyacente es la de Whisper, un transformer encoder-decoder con espectrograma log-Mel como entrada, disenado para prediccion de tokens con prefijo forzado (`<|startoftranscript|>`, idioma, tarea, `<|notimestamps|>`). La variante turbo reduce el decodificador a 4 capas frente a las 32 de la version grande completa, lo que rebaja los parametros a 809 M y acelera la decodificacion a costa de algo de calidad en tareas dificiles. El export conserva el encoder completo y empaqueta la cache KV de atencion cruzada, lo que evita recalcularla en cada paso de decodificacion.

La innovacion tecnica del bundle es la integracion con el runtime Core AI: los assets se cargan mediante `SpeechRecognitionModel` de `apple/coreai-models` y producen, segun el autor, una salida token a token identica a la referencia greedy de PyTorch. Ademas, el decodificador emite `alignment_logits`, de los que el fork de `CoreAISpeech` de bjnortier deriva marcas temporales por palabra. El unico "entrenamiento" documentado es el del modelo original de OpenAI; esta ficha no dispone de datos sobre numero de tokens, composicion del dataset ni etapas de RLHF/DPO, y la model card remite explicitamente a la upstream para esa informacion.

## Capacidades

- Transcripcion de voz a texto en 100 idiomas, con los pesos multilingues completos presentes en el bundle.
- Deteccion automatica de idioma en un unico paso de decodificador (el primer token predicho tras `<|startoftranscript|>` es el token de idioma); coste medido de ~110 ms sobre un clip de 62 s, reutilizando la deteccion en ventanas posteriores de audio largo.
- Seleccion manual de idioma mediante `language: .code("fr")` en el fork de `CoreAISpeech` o via `locale` en `CirceFileTranscriber` de CirceKit.
- Traduccion implicita al ingles cuando se usa el prefijo `<|en|>` por defecto con audio en otro idioma.
- Alineamiento a nivel de palabra mediante los `alignment_logits` que emite el decodificador.
- Ejecucion completamente offline y en dispositivo, sin llamadas de red.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No hay modo "thinking", vision, audio generation ni capacidades multimodales mas alla de la entrada de audio.

## Casos de uso

- **Dictado y notas de voz en apps iOS/macOS**: integracion via CirceKit (`CirceFileTranscriber` con `backend: .coreAI(.bundle(...))`) para convertir grabaciones del usuario en texto sin salir del dispositivo, lo que simplifica el cumplimiento de RGPD al no transmitir audio a terceros.
- **Transcripcion en tiempo real de reuniones**: la ventana de 30 s y el coste bajo de decodificacion del turbo (4 capas de decodificador, 809 M de parametros) permiten procesar fragmentos sucesivos con latencia apta para subtitulado en vivo en un Mac con Apple silicon.
- **Subtitulado accesible de video bajo demanda**: el alineamiento por palabra a partir de `alignment_logits` facilita generar subtitulos con marcas temporales, util para plataformas de accesibilidad que no quieren depender de un servicio cloud.
- **Aplicaciones de transcripcion multilingue**: con el fork de `CoreAISpeech`, deteccion automatica de idioma para entrevistas o podcasts en los que el hablante cambia de lengua, eligiendo el token de idioma correcto en la primera ventana.
- **Preprocesado de voz para pipelines de LLM local**: usar el modelo como etapa ASR delante de un modelo de lenguaje que corre en el mismo dispositivo, por ejemplo para asistentes personales o busqueda semantica sobre grabaciones propias.
- **Transcripcion de reuniones clinicas o legales con requisitos de confidencialidad**: el procesamiento on-device evita que el audio sensible abandone el equipo; el desarrollador debe asumir igualmente las obligaciones de la licencia MIT y las advertencias sobre alucinaciones.
- **Prototipado rapido en macOS**: validacion de pipelines de ASR sobre el runtime Core AI antes de portar a produccion, con la ventaja de que el bundle es la misma copia que distribuye Hello Transcribe 5.1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explicitamente a la model card de `openai/whisper-large-v3-turbo` para resultados de evaluacion.

El unico dato cuantitativo aportado por el autor es una medicion de error del propio export: con el prefijo `<|en|>` forzado sobre un clip en frances, el modelo obtiene aproximadamente un 96 % de WER contra una referencia en frances, emitiendo en su lugar una frase en ingles perfectamente legible. Es una advertencia sobre el prefijo de idioma, no un benchmark del modelo.

| Medicion | Valor | Contexto |
|---|---|---|
| WER con prefijo `<|en|>` sobre audio en frances | ~96 % | Clip en frances comparado con referencia en frances; salida en ingles |
| Coste de deteccion de idioma | ~110 ms | Clip de 62 s, un paso de decodificador |

## Requisitos de hardware

- **VRAM / memoria unificada**: los pesos en float16 ocupan aproximadamente 1,5 GB (el ZIP pesa ~1,49 GB). Hay que sumar la cache KV empaquetada y el buffer de audio de 30 s.
- **Plataforma obligatoria**: Apple silicon con macOS 27 o iOS 27 y posterior. El runtime Core AI no existe para CUDA, ROCm ni CPU x86 convencional.
- **GPU/dispositivos**: cualquier Mac con chip de la familia M, iPhone o iPad compatible con Core AI. No se dispone de datos de rendimiento por modelo concreto (M1, M2, M3, M4, A17/A18).
- **Consumer GPU (NVIDIA/AMD)**: no aplica; este bundle no se ejecuta en GPU de escritorio.
- **Opciones de despliegue**: runtime Core AI de Apple via `SpeechRecognitionModel` de `apple/coreai-models`, o CirceKit con backend `.coreAI`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- **Latencia y throughput**: no disponibles salvo el dato de ~110 ms para la deteccion de idioma en un clip de 62 s. El autor no publica cifras de RTF ni de tokens por segundo.
- **Alternativa fuera de Apple**: para CUDA o CPU, usar los pesos originales de `openai/whisper-large-v3-turbo` con whisper.cpp, faster-whisper, WhisperKit o MacWhisper, que ademas ofrecen cuantizacion int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| coreai-ht5-whisper-large-v3-turbo-kv-float16 (este) | 809 M | 30 s audio, 448 posiciones | `.aimodel` (Core AI) | MIT | Apple silicon, macOS/iOS 27+ |
| openai/whisper-large-v3-turbo (original) | 809 M | 30 s audio | safetensors (PyTorch) | MIT | GPU NVIDIA, CPU, Apple via conversiones |
| openai/whisper-large-v3 | no confirmado en la informacion disponible (arquitectura completa, decodificador mucho mayor que turbo) | 30 s audio | safetensors (PyTorch) | MIT | GPU NVIDIA, CPU |
| Export Core AI de whisper-large-v3 (mismo autor) | no disponible | 30 s audio | `.aimodel` (Core AI) | MIT | Apple silicon, macOS/iOS 27+ |

La diferencia practica frente a los originales de OpenAI no esta en calidad ni en parametros, sino en el formato y en las limitaciones del runtime: el bundle Core AI solo corre en Apple silicon y, sin el fork de `CoreAISpeech`, queda restringido al idioma ingles por el prefijo forzado.

## Limitaciones y advertencias

- **No es un modelo PyTorch**: los `.aimodel` no cargan con `transformers`, ni con vLLM, llama.cpp ni Ollama. Cualquier pipeline existente basado en esos frameworks requiere el modelo original.
- **Restriccion de plataforma dura**: macOS 27 / iOS 27 o superior. No hay soporte para CUDA ni para hardware no Apple, lo que limita el despliegue en servidores.
- **Prefijo de idioma forzado a `<|en|>`**: con la libreria oficial `CoreAISpeech`, el bundle solo transcribe ingles. Sobre audio en otro idioma no falla: devuelve una traduccion fluida al ingles. El autor mide ~96 % de WER en un clip frances, un error silencioso si no se comprueba el idioma de salida. Se necesita el fork de bjnortier para seleccion o deteccion de idioma.
- **Sin marcas temporales por defecto**: el prefijo fija `<|notimestamps|>`; obtener timestamps exige un `generation_config.json` distinto. El alineamiento por palabra via `alignment_logits` es una via alternativa, no un sustituto de los timestamps nativos.
- **Ventana de 30 s**: el audio se rellena (padding) hasta completar la ventana; el codigo cliente debe trocear audio largo en ventanas.
- **Riesgo de alucinacion**: Whisper tiende a inventar texto en silencios, musica o ruido de fondo, y a repetir frases en pasajes ambiguos. En produccion conviene aplicar VAD y filtros de confianza.
- **Sin diarizacion de hablantes**: no distingue voces; requiere un componente externo.
- **Repo de terceros con muy poca traccion**: 0 descargas y 0 likes en el momento de la consulta. Es un export comunitario, no oficial de Apple ni de OpenAI; conviene fijar el commit, como hace Hello Transcribe 5.1, y verificar la integridad del ZIP.
- **Ruta interna renombrada**: el bundle se publica con la carpeta de nivel superior renombrada a `ht5-whisper-large-v3-turbo-kv_float16`; scripts que asuman el nombre original pueden romperse.
- **Licencia**: MIT, la misma que el modelo fuente. Al ser un cambio de serializacion, se mantiene la atribucion a OpenAI y no se anaden restricciones, pero el uso comercial debe cumplir igualmente la licencia del modelo base y las condiciones del runtime Core AI de Apple.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bjnortier/coreai-ht5-whisper-large-v3-turbo-kv-float16
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Export hermano (whisper-large-v3): https://huggingface.co/bjnortier/coreai-whisper-large-v3-kv-float16
- Runtime Core AI de Apple: https://github.com/apple/coreai-models
- CirceKit (cliente del autor): https://github.com/bjnortier
- Core AI model zoo, ficha de whisper-large-v3-turbo: https://john-rocky.github.io/coreai-model-zoo/models/whisper-large-v3-turbo/
- Ficha de memoria y ejecucion local: https://localmodel.run/model/whisper-large-v3-turbo
- Documentacion para desarrolladores de Apple: https://developer.apple.com
- Licencia MIT: https://opensource.org/licenses/MIT
