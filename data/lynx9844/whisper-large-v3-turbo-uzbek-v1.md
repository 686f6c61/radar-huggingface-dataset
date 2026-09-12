# lynx9844/whisper-large-v3-turbo-uzbek-v1

## Resumen

Whisper large-v3-turbo uzbek v1 es un ajuste fino del modelo de reconocimiento automatico del habla (ASR) openai/whisper-large-v3-turbo, publicado por el desarrollador independiente R. Nematov (alias Lynx, usuario lynx9844) dentro de lo que denomina Iniciativa Independiente de IA de Voz Uzbeka. Su objetivo es cubrir la transcripcion de uzbek, un idioma con muy poca cobertura en modelos ASR genericos: segun el autor, el modelo base tiende a confundir fonetica uzbeka con turco y kirguis, y este ajuste incorpora alineacion de vocabulario y decodificacion condicionada por prompt para el alfabeto uzbeko y sus signos de tutuq (' , ʻ , ʼ).

Tecnicamente es un transformer encoder-decoder de la familia Whisper, con 808.878.080 parametros totales segun los pesos en safetensors (aproximadamente 809 M) y un repositorio de 1,6 GB, coherente con pesos en fp16. No es un modelo MoE: todos los parametros estan activos. Hereda la ventana de audio de 30 segundos propia de Whisper, por lo que el audio largo requiere segmentacion y decodificacion por trozos.

Su relevancia actual es doble: por un lado, aporta una opcion con licencia Apache-2.0 para un idioma infrarrepresentado, lo que permite uso comercial sin restricciones; por otro, es un modelo muy reciente y sin adopcion publica (0 descargas y 0 me gusta en el momento de la consulta, creado el 12 de septiembre de 2026), con un unico resultado de WER declarado por el autor y no verificado (35,9 sobre DavronSherbaev/uzbekvoice-filtered), por lo que debe evaluarse con cautela antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, variante large-v3-turbo); no es MoE |
| Parametros totales | 808.878.080 (aproximadamente 809 M), segun los pesos en safetensors |
| Parametros activos | No aplica: el modelo no es de arquitectura MoE (todos los parametros estan activos) |
| Longitud de contexto | No disponible en terminos de tokens. La arquitectura Whisper procesa ventanas de audio de 30 segundos; el autor no documenta estrategia de chunking ni longitud de contexto |
| Tipos de cuantizacion | No disponible. No se documentan versiones GGUF, int8 ni de 4 bits; el repositorio contiene unicamente safetensors, con un tamano (1,6 GB) coherente con fp16 |
| Idiomas soportados | Uzbeko (uz) exclusivamente, segun el autor y las etiquetas del repositorio |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-large-v3-turbo, la variante optimizada para velocidad de la familia Whisper: mantiene el encoder de large-v3 y reduce drasticamente la profundidad del decoder, lo que explica su tamano de aproximadamente 809 M de parametros y su baja latencia en comparacion con large-v3 completo. Es un encoder-decoder con atencion, entrenado originalmente por OpenAI para transcripcion y traduccion multilingue, y en esta version ajustado sobre datos en uzbeko. La informacion disponible no detalla el numero de tokens de audio utilizados en el ajuste fino, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; el autor cita como fuente principal el conjunto DavronSherbaev/uzbekvoice-filtered, complementado con colecciones de audio uzbeko seleccionadas, e indica que se cubren distintos acentos y variantes regionales.

La innovacion que declara el autor no esta en la arquitectura sino en la adaptacion linguistica: alineacion de vocabulario con el alfabeto uzbeko y sus marcas diacriticas, y decodificacion condicionada por prompt para sesgar la salida hacia la fonetica uzbeka y evitar derivas hacia turco o kirguis. El autor tambien recomienda en sus ejemplos de uso parametros de decodificacion concretos, como language="uz", task="transcribe" y no_repeat_ngram_size=3, para reducir repeticiones. No se documentan otras tecnicas como decodificacion especulativa, atencion lineal o modelos de estado recurrente.

## Capacidades

- Transcripcion de voz a texto en uzbeko, en formato mono a 16 kHz, con decodificacion condicionada al idioma mediante el parametro language="uz".
- Reconocimiento de habla leida, formal o de locutor profesional: el autor declara una precision del 85 % al 90 % en uzbek literario.
- Comprension de habla coloquial y variantes dialectales regionales: el autor declara una precision del 75 % al 80 % en este escenario.
- Manejo del alfabeto uzbeko con signos de tutuq (' , ʻ , ʼ) y distincion de consonantes sonoras y sordas, segun la model card.
- Inferencia en tiempo real o mas rapida: el autor afirma una velocidad entre 6 y 8 veces superior al tiempo real, con transcripciones de entre 0,7 y 1,4 segundos en un portatil con RTX 4050.
- Ejecucion en CPU ademas de GPU, ya que el ejemplo oficial de la model card contempla respaldo a CPU con torch.float32.
- No se documentan capacidades de tool calling, function calling, uso agentico, razonamiento multi-paso, vision, audio-output, diarizacion de hablantes ni marcas de tiempo. Tampoco se documenta traduccion a otros idiomas, aunque el modelo base la soporte.

## Casos de uso

- Transcripcion de reuniones y notas de voz en uzbeko: el modelo convierte grabaciones de audio en texto con la etiqueta de idioma fijada a uz, adecuado para equipos que trabajan en uzbeko y necesitan actas o resumenes automatizados sin depender de servicios en la nube.
- Subtitulado de contenido audiovisual: al ser un modelo de ASR ligero (809 M) y con licencia Apache-2.0, puede integrarse en pipelines de subtitulado para plataformas de video dirigidas al publico uzbeko, segmentando el audio en ventanas de 30 segundos.
- Atencion al cliente y centros de llamadas: transcripcion de conversaciones telefonicas en uzbeko para analitica de calidad, busqueda de palabras clave y generacion de resumenes, con la salvedad de que el propio autor reconoce que el ruido de fondo y las grabaciones telefonicas son un punto debil que se abordara en la version v2.
- Accesibilidad y dictado: conversion de voz a texto para personas con dificultades motoras o para redaccion asistida por voz en uzbeko, ejecutable en local gracias a que el modelo cabe en GPUs de gama media e incluso en CPU.
- Archivado y busqueda de fondos audiovisuales: indexacion de archivos de radio, television o podcasts en uzbeko para permitir busqueda por texto completo sobre material historico, con el aliciente de la licencia permisiva para uso institucional.
- Asistentes de voz y comandos por voz en dispositivos: con latencias declaradas de 0,7 a 1,4 segundos en GPU de portatil, es viable para aplicaciones interactivas que requieran transcripcion casi instantanea de ordenes cortas en uzbeko.
- Documentacion clinica, legal o administrativa dictada: transcripcion de dictados profesionales en uzbek literario, escenario en el que el autor declara el mejor rendimiento (85 % - 90 % de precision) y donde el texto suele requerir revision humana posterior.
- Generacion de datos de entrenamiento ASR: uso del modelo para pseudo-etiquetar grandes volumenes de audio en uzbeko y alimentar asi otros modelos o versiones futuras, aprovechando la licencia Apache-2.0.
- Despliegue on-premise con requisitos de privacidad: al tratarse de pesos abiertos y poder ejecutarse en hardware de consumo, permite procesar audio sensible sin enviarlo a servicios externos, algo relevante en administraciones publicas y sector salud.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| whisper-large-v3-turbo-uzbek-v1 | DavronSherbaev/uzbekvoice-filtered | WER | 35,9 % | No |

Evaluaciones cualitativas declaradas por el autor, sin cifras de referencia comparables:

| Indicador | Valor declarado por el autor |
|---|---|
| Estado del modelo | v1 (primera version estable) |
| Velocidad de inferencia | Entre 6 y 8 veces mas rapida que el tiempo real; 0,7 - 1,4 s por transcripcion en portatil con RTX 4050 |
| Uzbek literario, formal y de locutor limpio | 85 % - 90 % de precision |
| Habla coloquial y variantes dialectales | 75 % - 80 % de precision |

No hay en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar de ASR (LibriSpeech, Common Voice) para este modelo, ni comparaciones con otros sistemas de ASR en uzbeko.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2 - 3 GB, considerando 1,6 GB de pesos mas activaciones y buffers de decodificacion.
- VRAM estimada en int8: aproximadamente 1,5 - 2 GB (requiere una conversion no documentada por el autor).
- VRAM estimada en 4 bits: aproximadamente 1 - 1,5 GB (requiere una conversion no documentada por el autor).
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM; se recomienda 6 GB o mas para trabajar comodamente con audio largo y por lotes.
- GPU recomendadas: RTX 4050 (escenario validado por el autor), RTX 3060, RTX 4060, RTX 4090; en el ambito profesional, A100 o H100 son suficientes pero sobredimensionadas para 809 M de parametros, salvo que se necesite procesar audio por lotes a gran escala.
- Ejecucion en CPU: documentada en el propio ejemplo del autor, con torch.float32; viable para transcripcion no interactiva.
- Opciones de despliegue: Transformers con WhisperProcessor y WhisperForConditionalGeneration, tal como documenta el autor. No se documentan en la informacion disponible otras rutas (faster-whisper, whisper.cpp, Ollama, vLLM, TGI) ni pesos GGUF, por lo que su uso con esas herramientas requeriria conversiones y validaciones no descritas.
- Latencia y throughput: el autor declara 0,7 - 1,4 segundos por transcripcion en un portatil con RTX 4050 y una velocidad entre 6 y 8 veces el tiempo real. No hay mediciones independientes de latencia ni de throughput en audio por segundo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base, ya que no se aportan datos de otros sistemas de ASR para uzbeko.

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | WER en uzbeko | Disponibilidad |
|---|---|---|---|---|---|---|
| whisper-large-v3-turbo-uzbek-v1 | 808.878.080 (todos activos) | 30 s por ventana (arquitectura Whisper) | uz | Apache-2.0 | 35,9 % (declarado por el autor, no verificado) | HuggingFace, safetensors |
| openai/whisper-large-v3-turbo | Aproximadamente 809 M | 30 s por ventana | Multilingue (incluye uz) | No disponible en la informacion proporcionada | No disponible | HuggingFace |
| Otros modelos de ASR en uzbeko | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos entre este ajuste y el modelo base sobre el mismo conjunto de evaluacion, por lo que no es posible cuantificar la mejora obtenida con el ajuste fino.

## Limitaciones y advertencias

- El unico dato cuantitativo de rendimiento es un WER del 35,9 % declarado por el autor y marcado como no verificado; se trata de una tasa de error alta para un sistema de ASR en produccion y deberia reproducirse de forma independiente antes de adoptar el modelo.
- Las cifras de precision (85 % - 90 % en uzbek literario y 75 % - 80 % en habla coloquial) son estimaciones cualitativas del autor, sin metodologia publicada.
- El propio autor reconoce en la model card (en uzbeko) que la version v2 debera abordar jerga callejera, terminologia informatica y mensajes telefonicos con ruido de fondo intenso, lo que indica limitaciones conocidas en audio ruidoso y vocabulario tecnico.
- No se documentan datos sobre sesgos: no hay informacion sobre representacion de genero, edad, origen regional o variedades dialectales minoritarias, ni sobre el tratamiento de habla con acento extranjero.
- Riesgo de alucinacion y de bucles de repeticion inherente a la familia Whisper, especialmente en segmentos con silencio, musica o ruido; el autor mitiga parcialmente con no_repeat_ngram_size=3.
- Cobertura monoidioma: el ajuste esta orientado exclusivamente al uzbeko, por lo que no se recomienda su uso para otros idiomas ni para escenarios de cambio de codigo (uzbeko-ruso o uzbeko-ingles), frecuentes en la practica real.
- Sin marcas de tiempo ni diarizacion documentadas, lo que limita su uso directo en subtitulado con sincronia fina o en analisis de conversaciones multiparticipante.
- Licencia Apache-2.0: permite uso comercial y modificacion sin restricciones adicionales, siempre que se conserve el aviso de licencia y se atribuya correctamente. No se imponen clausulas de uso aceptable mas alla de las de la propia licencia.
- Modelo sin adopcion publica en el momento de la consulta (0 descargas y 0 me gusta), creado el 12 de septiembre de 2026; no ha pasado por revision por pares ni por una comunidad amplia de usuarios, por lo que la madurez y el mantenimiento futuro no estan garantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lynx9844/whisper-large-v3-turbo-uzbek-v1
- Perfil del autor en HuggingFace: https://huggingface.co/lynx9844
- Perfil del autor en GitHub: https://github.com/nematov9844
- Dataset citado por el autor: https://huggingface.co/datasets/DavronSherbaev/uzbekvoice-filtered
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Contacto indicado en la model card: nematov9844@gmail.com
- Busqueda web: no se han encontrado enlaces relevantes adicionales; los resultados devueltos no guardan relacion con el modelo.
