# Dibachain/Diba-STT

## Resumen

Diba-STT es un modelo de reconocimiento automatico del habla (ASR) especializado en persa (farsi) desarrollado por Dibachain, un proyecto irani. Su propuesta principal es la transcripcion de voz a texto en persa sin conexion a la nube, sin GPU y en tiempo real, con variantes que van desde ~53 MB hasta ~1,6 GB de pesos. Forma parte de la familia de modelos Diba, que incluye Diba-Base, Diba-Embed, Diba-Vision, Diba-Code, Diba-TTS, Diba-Image y Diba-ImageEdit.

El modelo se distribuye en cuatro versiones segun el compromiso entre tamano y precision: `fa-small-0.42` (~53 MB, recomendada para tiempo real, movil y navegador), `fa-0.42` (~1,6 GB, maxima precision en servidor o escritorio), `fa-small-0.5` (~60 MB) y `fa-0.5` (~1 GB, vocabulario amplio en servidor). Ademas se publica un paquete listo para navegador (`browser/diba-stt-fa-small.tar.gz`) que permite transcripcion en pagina mediante WASM.

Es relevante ahora porque cubre un nicho poco atendido: ASR de calidad en persa que puede ejecutarse en dispositivo (CPU, movil, navegador), sin enviar audio a terceros, algo critico en escenarios de privacidad, conectividad limitada o cumplimiento normativo. El repositorio ocupa 5,2 GB en total, suma de todas las variantes y del paquete de navegador. No se han publicado detalles de arquitectura, numero de parametros ni datos de entrenamiento en la informacion disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica / no disponible (modelo ASR, no de contexto textual) |
| Tipos de cuantizacion | no disponible; se ofrecen cuatro tamanos de pesos: ~53 MB, ~60 MB, ~1 GB y ~1,6 GB |
| Idiomas soportados | persa (farsi), codigo `fa` |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el paquete de navegador se distribuye como `browser/diba-stt-fa-small.tar.gz`) |
| Tarea (pipeline) | automatic-speech-recognition |
| Entrada de audio | WAV, 16 kHz, mono (API de Python); PCM de 16 bits para streaming |
| Modo de ejecucion | sin conexion, en dispositivo: CPU, movil y navegador (WASM); no requiere GPU |
| Tamano total del repositorio | 5,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-15 / 2026-09-15 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo (si es un transformer encoder tipo CTC/seq2seq, un modelo convolucional, un hibrido o una destilacion de otro sistema), ni sobre el numero de parametros, la composicion del dataset de entrenamiento, el numero de horas de audio utilizadas o si hubo etapas de ajuste fino con RLHF/DPO. Tampoco se detallan innovaciones tecnicas concretas como decodificacion especulativa, atencion lineal o mecanismos de streaming especificos.

Lo unico verificable en la informacion disponible es el diseno del sistema de inferencia: cuatro variantes de pesos con distintos tamanos, una API de Python que soporta transcripcion por lotes (`transcribe`) y por flujo incremental (`accept` / `final` sobre fragmentos PCM de 16 bits), y un empaquetado del modelo pequeno para ejecucion en navegador. La existencia de un par de versiones pequenas (~53 MB y ~60 MB) sugiere un proceso de compresion o destilacion respecto a las variantes grandes (~1 GB y ~1,6 GB), pero el metodo no se describe en la model card.

## Capacidades

- Transcripcion de voz a texto en persa de forma totalmente offline, sin llamadas a servicios en la nube.
- Transcripcion en tiempo real desde microfono, procesando fragmentos PCM de 16 bits de forma incremental.
- Transcripcion por lotes de archivos WAV de 16 kHz y mono.
- Ejecucion en dispositivo: CPU de escritorio, movil y navegador mediante WASM.
- Variante de maxima precision (`fa`) para servidor o escritorio y variantes pequenas (`fa-small`) para movil y navegador.
- Paquete especifico para transcripcion en pagina (`browser/diba-stt-fa-small.tar.gz`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de salida ni traduccion; es un modelo ASR puro.

## Casos de uso

- Atencion al cliente en persa: transcripcion de llamadas o notas de voz de usuarios para su posterior analisis o indexacion, ejecutando el modelo en servidor local para no enviar audio a terceros.
- Subtitulado y transcripcion de contenido audiovisual en persa: procesamiento por lotes de archivos WAV extraidos de video, con la variante `fa` o `fa-0.5` para maximizar precision en grabaciones limpias.
- Asistentes de voz en aplicaciones moviles: integracion de `fa-small` en apps Android/iOS para dictado y comandos de voz sin dependencia de red ni consumo de GPU.
- Aplicaciones web de dictado: uso del paquete de navegador con WASM para transcribir el microfono del usuario directamente en la pagina, sin backend de inferencia.
- Documentacion clinica o legal en entornos aislados: dictado de informes en persa en equipos sin conexion a internet, donde la ausencia de salida de datos del dispositivo es un requisito de cumplimiento.
- Indexacion y busqueda de archivos de audio en persa: transcripcion masiva de un repositorio de grabaciones para construir un indice de texto consultable.
- Accesibilidad: generacion de subtitulos en directo para personas con discapacidad auditiva en charlas o clases en persa, usando la variante pequena en tiempo real.
- Telefonia y centros de contacto: transcripcion en streaming de conversaciones con la API `accept`/`final` para alimentar analitica en vivo o sistemas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de WER, CER, velocidad de inferencia ni comparaciones numericas con otros modelos ASR en la model card ni en los resultados de busqueda consultados.

## Requisitos de hardware

- VRAM: no se especifica. El modelo esta disenado para ejecutarse en CPU sin GPU.
- Memoria estimada a partir del tamano de pesos (estimacion, no dato oficial): variantes pequenas `fa-small-0.42` (~53 MB) y `fa-small-0.5` (~60 MB) por debajo de 200 MB de RAM; variantes grandes `fa-0.5` (~1 GB) y `fa-0.42` (~1,6 GB) en torno a 1-3 GB de RAM segun el runtime.
- GPU recomendadas: no se indican; el modelo no requiere GPU. No hay datos de rendimiento en A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: irrelevante por diseno, al estar orientado a CPU, movil y navegador.
- Opciones de despliegue: paquete de Python `pip install diba-stt` con la clase `DibaSTT`; paquete de navegador `browser/diba-stt-fa-small.tar.gz`; demo en el Space de Hugging Face. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR de este tipo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas de rendimiento entre Diba-STT y otros sistemas ASR en la informacion disponible. Las alternativas de referencia en el espacio de ASR multilingue y offline son OpenAI Whisper, Vosk y los modelos wav2vec2 ajustados a persa, pero no se dispone de datos verificados en esta busqueda para comparar WER, latencia, consumo de memoria ni precision en persa.

| Modelo | Idiomas | Licencia | Ejecucion en dispositivo | Comparativa de rendimiento |
|---|---|---|---|---|
| Diba-STT | Persa (`fa`) | Apache 2.0 | Si (CPU, movil, navegador) | No disponible |
| OpenAI Whisper | Multilingue | No disponible en la informacion proporcionada | No disponible | No disponible |
| Vosk | Multilingue | No disponible en la informacion proporcionada | No disponible | No disponible |
| wav2vec2 ajustado a persa | Persa | No disponible en la informacion proporcionada | No disponible | No disponible |

El unico diferencial verificable de Diba-STT frente a estas alternativas es su especializacion mono-idioma en persa combinada con variantes de muy bajo peso (~53-60 MB) y soporte de navegador mediante WASM.

## Limitaciones y advertencias

- La precision depende de la calidad del microfono, el ruido de fondo y el acento del hablante, segun reconoce el propio autor.
- Las variantes pequenas sacrifican precision a cambio de velocidad y tamano; no son adecuadas cuando se requiere la maxima exactitud.
- La API de Python exige audio a 16 kHz y mono; otra frecuencia o numero de canales requiere remuestreo previo.
- El modelo esta entrenado y optimizado para persa: no ofrece soporte multilingue ni traduccion.
- El mejor rendimiento declarado es sobre habla persa clara y conversacional; no hay datos sobre dominios especializados (medico, legal, tecnico) ni sobre dialectos o acentos regionales.
- Riesgo de alucinacion y errores de sustitucion propios de los sistemas ASR, especialmente en audio con ruido, solapamiento de voces o terminologia poco frecuente; no se han publicado tasas de error.
- Sin resultados de benchmarks publicados, la idoneidad para produccion no puede validarse con datos objetivos; se recomienda evaluacion propia con un conjunto de prueba representativo antes de desplegar.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y las atribuciones; no incluye garantias.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe una comunidad de usuarios que haya validado el modelo en produccion.
- El modelo no cubre tareas de generacion de texto, razonamiento, codigo ni vision; es exclusivamente ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dibachain/Diba-STT
- Demo en vivo (Space): https://huggingface.co/spaces/Dibachain/diba-stt
- Sitio del desarrollador: https://dibachain.ir
- Diba-Base: https://huggingface.co/DibaAi/Diba-Base
- Diba-Embed: https://huggingface.co/Dibachain/Diba-Embed
- Diba-Vision: https://huggingface.co/Dibachain/Diba-Vision
- Descarga de la version `fa-small-0.42`: https://huggingface.co/Dibachain/Diba-STT/tree/main/fa-small-0.42
- Descarga de la version `fa-0.42`: https://huggingface.co/Dibachain/Diba-STT/tree/main/fa-0.42
- Descarga de la version `fa-small-0.5`: https://huggingface.co/Dibachain/Diba-STT/tree/main/fa-small-0.5
- Descarga de la version `fa-0.5`: https://huggingface.co/Dibachain/Diba-STT/tree/main/fa-0.5
- Paquete para navegador: `browser/diba-stt-fa-small.tar.gz` dentro del repositorio
