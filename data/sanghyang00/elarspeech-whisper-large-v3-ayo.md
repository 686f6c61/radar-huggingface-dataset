# Sanghyang00/ELARSpeech-Whisper-Large-v3-ayo

## Resumen

ELARSpeech-Whisper-Large-v3-ayo es un modelo de reconocimiento automatico del habla (ASR) derivado de openai/whisper-large-v3 mediante ajuste fino supervisado sobre corpus de la lengua ayoreo (codigo ISO 639-3 `ayo`). Lo publica el usuario Sanghyang00 en Hugging Face dentro del proyecto ELARSpeech, una iniciativa de adaptacion de Whisper a lenguas con pocos recursos. El modelo esta pensado para transcribir audio en ayoreo, una lengua indigena del Chaco paraguayo y boliviano para la que practicamente no existen sistemas ASR publicos.

Tecnicamente es un transformer encoder-decoder de 1.543.491.840 parametros (la configuracion completa de Whisper large-v3), con entrada de espectrograma Mel de 128 bandas y procesamiento en ventanas de 30 segundos. El repositorio ocupa 6,2 GB y los pesos se distribuyen en formato safetensors con la libreria transformers. Se trata de un modelo mono-idioma: no se anuncia soporte para ninguna otra lengua, ni siquiera la capacidad multilingue original de Whisper.

Su relevancia es fundamentalmente de nicho: demuestra que es viable especializar un modelo ASR de 1,55 mil millones de parametros en una lengua de muy bajos recursos, usando una plantilla de decodificacion con token de idioma explicito (`<|ayo|>`). El autor declara que el artefacto exportado se verifico contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con estado de verificacion de transcripcion exacta "PASS". La licencia no esta especificada en la ficha, lo que limita de entrada su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WhisperForConditionalGeneration (transformer encoder-decoder) |
| Parametros totales | 1.543.491.840 (aproximadamente 1,55 mil millones) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos; 448 posiciones maximas en el decodificador (arquitectura Whisper large-v3) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | ayoreo (`ayo`, ISO 639-3); mono-idioma |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-large-v3 |
| Entrada de audio | mono, 16 kHz |
| Tamano del repositorio | 6,2 GB |
| Descargas / likes | 4 / 0 |
| Fecha de publicacion | 15 de octubre de 2026 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3 sin modificaciones estructurales: un encoder que convierte el audio en un espectrograma Mel de 128 bandas (frente a las 80 bandas de large-v2) y procesa ventanas de 30 segundos, y un decoder autoregresivo con 448 posiciones de contexto que genera la transcripcion token a token. El ajuste se realiza con `WhisperForConditionalGeneration` y un procesador `WhisperProcessor`, lo que implica que el modelo conserva los tokens especiales de Whisper pero restringe la generacion al idioma ayoreo.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus de ayoreo ni si se aplicaron tecnicas de alineacion adicionales (RLHF, DPO o similares), algo poco habitual en tareas ASR. El autor indica que la decodificacion debe forzarse mediante un prompt explicito en el decoder compuesto por el token de inicio, el token de idioma `<|ayo|>` (obtenido con `convert_tokens_to_ids`), el token `<|transcribe|>` y el token `<|notimestamps|>`, en lugar de usar el parametro `language=`. Esta es la innovacion practica relevante del artefacto: el comportamiento de decodificacion del checkpoint exportado se reproduce unicamente con esa plantilla, y el autor advierte explicitamente de que hay que usarla.

El modelo se presenta como parte del ecosistema ELARSpeech, que segun la ficha dispone de su propia documentacion de proyecto para los terminos del conjunto de datos. No se publican detalles sobre el proceso de anotacion, el numero de hablantes ni la duracion total de audio empleada.

## Capacidades

- Reconocimiento automatico del habla en ayoreo, con salida de transcripcion en la ortografia del corpus de entrenamiento.
- Transcripcion de audio mono a 16 kHz, con remuestreo obligatorio si la fuente tiene otra frecuencia de muestreo.
- Procesamiento de audio en ventanas de 30 segundos; el audio largo requiere decodificacion secuencial o por fragmentos, tal como en Whisper large-v3.
- Decodificacion con haz configurable (`num_beams`), con el ejemplo oficial usando `num_beams=1` y `max_new_tokens=200`.
- Control explicito del idioma de salida mediante el token `<|ayo|>` en el prompt del decodificador.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta traduccion a otros idiomas, a pesar de que el modelo base la soporta; la especializacion es mono-idioma.
- No se documentan capacidades de vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Documentacion linguistica de campo: transcripcion automatica de grabaciones de hablantes nativos de ayoreo recogidas en trabajo de campo, reduciendo el tiempo de transcripcion manual que hoy realizan linguistas. El modelo esta ajustado especificamente a esa lengua, por lo que parte de una base mucho mejor que Whisper large-v3 sin ajustar.
- Archivo y preservacion digital de patrimonio oral: conversion de cintas y grabaciones historicas en ayoreo a texto indexable, siempre que el audio se remuestree a 16 kHz mono y se trocee en ventanas de 30 segundos.
- Subtitulado y transcripcion de entrevistas para proyectos etnograficos o antropologicos, generando un borrador que despues revisa un hablante nativo.
- Investigacion en ASR de bajos recursos: servir como punto de partida (fine-tuning adicional) para otras lenguas del Chaco o para experimentos de adaptacion con muy pocos datos.
- Herramientas de documentacion lexicografica: transcripcion masiva de corpus orales para alimentar diccionarios y concordancias de ayoreo.
- Evaluacion comparativa de estrategias de especializacion de Whisper: al ser un ajuste sobre large-v3 con prompt de idioma explicito, es util como referencia metodologica en articulos sobre ASR mono-idioma.
- Accesibilidad en contextos comunitarios: generacion de transcripciones de avisos, reuniones o material educativo en ayoreo para su publicacion en texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica declarada por el autor es el estado de verificacion del artefacto exportado frente al checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion: "Exact-transcription verification status: PASS". No se aportan valores de WER, CER ni comparaciones numericas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): en torno a 6,2 GB de pesos mas activaciones; se recomienda un minimo de 8-10 GB.
- VRAM estimada en fp16/bf16: aproximadamente 3,1-4 GB de pesos, con margen para activaciones; viable en GPUs de 8 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,6-2 GB de pesos.
- GPU recomendadas: NVIDIA A100, H100 o L40S para procesamiento por lotes de alto volumen; RTX 3090, RTX 4090, RTX A5000 para inferencia individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 8 GB, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090) usando fp16.
- Opciones de despliegue: transformers (via `WhisperForConditionalGeneration`, unico camino documentado en la ficha), y en principio cualquier runtime compatible con pesos Whisper en safetensors (vLLM, TGI o llama.cpp/whisper.cpp requeririan conversion a GGUF, no publicada por el autor).
- Latencia y throughput: no disponible. No hay mediciones publicadas de RTF, latencia por ventana de 30 segundos ni tokens por segundo.
- Nota practica: el modelo debe consumir audio mono a 16 kHz; no respetar esa condicion degrada la transcripcion.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-Whisper-Large-v3-ayo | 1.543.491.840 | solo ayoreo | 30 s de audio, 448 posiciones de decoder | no disponible | Hugging Face (4 descargas) |
| openai/whisper-large-v3 | 1.550.000.000 (aprox.) | 99+ idiomas, incluida traduccion | 30 s de audio, ventanas secuenciales | licencia del repositorio de OpenAI | Hugging Face, GitHub openai/whisper |
| openai/whisper-turbo | no disponible | multilingue, optimizado para velocidad | no disponible | licencia del repositorio de OpenAI | Hugging Face, GitHub |
| Modelos ASR para lenguas de bajos recursos | no disponible | mono-idioma o multilingue de nicho | variable | variable | no se han identificado alternativas equivalentes para ayoreo en la busqueda realizada |

La comparacion numerica de rendimiento (WER/CER) entre estos modelos no es posible con la informacion disponible, ya que no se han publicado resultados de evaluacion para el modelo ajustado.

## Limitaciones y advertencias

- Modelo mono-idioma: solo transcribe ayoreo. No se debe esperar que funcione en castellano, guarani ni otras lenguas, aunque el modelo base sea multilingue.
- La decodificacion correcta exige usar el prompt explicito con `<|ayo|>`, `<|transcribe|>` y `<|notimestamps|>` en `decoder_input_ids`. Usar el parametro `language=` puede no reproducir el comportamiento del checkpoint exportado.
- Riesgo de alucinacion: como cualquier modelo generativo de Whisper, puede producir transcripciones plausibles pero incorrectas, especialmente con audio ruidoso, hablantes fuera de la distribucion de entrenamiento o silencios largos.
- Precisión variable segun condicion de grabacion, poblacion de hablantes, ortografia y dominio, tal como advierte el propio autor.
- Requiere audio mono a 16 kHz; no hacer el remuestreo degrada los resultados.
- Limitacion de contexto: procesa ventanas de 30 segundos, por lo que el audio largo necesita decodificacion secuencial o por fragmentos, con el riesgo de errores de continuidad entre ventanas.
- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. Es un bloqueante para produccion hasta aclararlo con el autor.
- El autor remite a la documentacion del proyecto ELARSpeech para los terminos del conjunto de datos y al repositorio del modelo base para su licencia y citacion; ninguna de las dos condiciones esta recogida en la ficha de Hugging Face.
- Trazabilidad limitada: sin numero de tokens de entrenamiento, composicion del corpus, numero de hablantes ni resultados de WER/CER, no es posible estimar con rigor la calidad del modelo fuera del conjunto de evaluacion del autor.
- Adopcion muy baja (4 descargas, 0 likes) y fecha de publicacion reciente; no hay evidencia de uso en produccion ni validacion independiente.
- No se publican variantes cuantizadas ni conversion a GGUF, lo que restringe el despliegue en entornos sin transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-ayo
- Modelo base (Whisper large-v3): https://huggingface.co/openai/whisper-large-v3
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Ficha de Whisper large-v3 en Vast.ai: https://vast.ai/model/whisper
- Ficha de Whisper large-v3 en Apertis AI: https://apertis.ai/models/whisper-large-v3
- Listado de modelos en lengua `aqn` en Hugging Face (referencia de lenguas minorizadas): https://huggingface.co/models?language=aqn
- Documentacion del proyecto ELARSpeech: no disponible (mencionada en la model card pero sin URL publicada)
