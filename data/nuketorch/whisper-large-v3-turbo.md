# NukeTorch/whisper-large-v3-turbo

## Resumen

NukeTorch/whisper-large-v3-turbo es un paquete de distribucion del modelo de reconocimiento automatico del habla Whisper large-v3-turbo de OpenAI, empaquetado por NukeTorch para su uso con el motor de inferencia NukeTorch N1.0.0 sobre Apple Silicon. No se trata de un fine-tuning ni de un modelo entrenado desde cero: los pesos de `model.safetensors` son identicos a los del repositorio `openai/whisper-large-v3-turbo` (revision `41f01f3fe87f28c78e2fbf8b568835947dd65ed9`), y el autor lo declara explicitamente ("Nothing in the weights is changed").

El valor anadido del repositorio es operativo: agrupa en una sola descarga los tres ficheros auxiliares que el servidor NukeTorch necesita para ejecutar el modelo sin dependencias adicionales: `vocab.bin` (la tabla de vocabulario de Whisper), `mel128.bin` (la tabla de filtros mel de 128 bandas) y `decoding.json` (tokens de inicio, token de fin y tokens suprimidos, sin marcas de tiempo). Esto simplifica el despliegue en macOS con chips de la serie M.

El modelo base Whisper large-v3-turbo es un transformer encoder-decoder para transcripcion de audio con aproximadamente 809 millones de parametros (segun el recuento real de safetensors del repo: 808.878.080), una reduccion sustancial frente a los 1.550 millones de large-v3, manteniendo la mayor parte de la calidad de transcripcion. Es relevante para desarrolladores que quieran integrar ASR local en un Mac sin depender de servicios en la nube, siempre que acepten las limitaciones del ecosistema NukeTorch (solo Apple Silicon, ingles unicamente en esta configuracion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, comportamiento estandar de Whisper; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors sin indicar cuantizacion) |
| Idiomas soportados | ingles unicamente en esta configuracion segun la model card ("English only") |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `vocab.bin`, `mel128.bin` y `decoding.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo de OpenAI: un transformer encoder-decoder con atencion estandar, entrenado por OpenAI sobre pares audio-transcripcion a gran escala. La variante "turbo" reduce el numero de capas del decoder respecto a large-v3, lo que baja el total de parametros de aproximadamente 1.550 millones a unos 809 millones y acelera la inferencia a costa de una perdida menor de precision. El modelo original esta entrenado para tareas de transcripcion, traduccion al ingles y deteccion de idioma.

En este repositorio concreto no hay entrenamiento ni ajuste fino por parte de NukeTorch: los pesos son un espejo del checkpoint oficial. Los ficheros adicionales son tablas derivadas del propio Whisper: el vocabulario serializado como tabla unica, los filtros mel de 128 bandas usados en el preprocesado del audio y la configuracion de decodificacion (tokens de inicio y fin, tokens suprimidos) sin marcas de tiempo. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO; esos datos corresponden al modelo original de OpenAI y no se reproducen aqui.

## Capacidades

- Transcripcion de voz a texto en ingles sobre ficheros de audio en formatos WAV, MP3, M4A, FLAC, AIFF y CAF.
- Salida en formato `json` o `text` a traves del endpoint `/v1/audio/transcriptions`.
- Sin marcas de tiempo: la configuracion de decodificacion incluida las desactiva explicitamente.
- Integracion como servicio auxiliar junto a un modelo de texto: el servidor NukeTorch expone el modelo de audio en el mismo proceso que el LLM.
- Prioridad de texto sobre audio: las peticiones de transcripcion esperan mientras hay una generacion de chat en curso.
- No se documentan capacidades de traduccion, deteccion de idioma, tool calling ni razonamiento multi-paso en esta configuracion.

## Casos de uso

- Transcripcion local de reuniones en macOS: con un M5 Max de 48 GB, una grabacion de 57 segundos se transcribe en 0,33 s, lo que permite procesar actas de reunion casi en tiempo real sin enviar audio a la nube.
- Dictado por voz en herramientas internas: el endpoint compatible con la API de transcripciones de OpenAI permite sustituir el servicio remoto por un servidor local en `127.0.0.1:8080` sin cambiar el codigo cliente.
- Subtitulado rapido de clips cortos en ingles: con 0,07 s para un audio de 6 segundos, es viable procesar lotes de fragmentos cortos en pipelines de postproduccion, aceptando la ausencia de timestamps.
- Asistentes de voz combinados con un LLM local: el diseno de NukeTorch ejecuta ASR y generacion de texto en el mismo proceso, lo que simplifica arquitecturas de agente conversacional por voz en un solo Mac.
- Investigacion en ASR sobre Apple Silicon: sirve como referencia reproducible del comportamiento de Whisper large-v3-turbo bajo el runtime NukeTorch, con pesos identicos al original.
- Prototipado de accesibilidad: transcripcion de notas de voz o audios de usuarios en ingles para generar texto buscable, con coste marginal cero una vez desplegado el servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye mediciones de latencia y memoria del runtime:

| Metrica | Valor |
|---|---|
| Audio de 57 s (M5 Max, 48 GB) | 0,33 s |
| Audio de 6 s (M5 Max, 48 GB) | 0,07 s |
| Memoria anadida por el modelo | 1,8 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 1,8 GB adicionales segun la medicion del autor en un M5 Max de 48 GB.
- GPU recomendadas: Apple Silicon de la serie M (el runtime NukeTorch N1.0.0 se distribuye como `nuketorch-n1.0.0-macos-arm64`); no se documenta soporte para GPU NVIDIA, AMD ni CPU x86.
- Cabe en cualquier Mac con Apple Silicon y al menos unos pocos GB de memoria libre, aunque el autor solo reporta mediciones en un M5 Max de 48 GB.
- Opciones de despliegue: exclusivamente `nuketorch-serve http` del paquete NukeTorch N; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,33 s para 57 s de audio y 0,07 s para 6 s en el hardware citado. No se proporciona throughput agregado ni latencia bajo carga concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Timestamps | Licencia | Runtime |
|---|---|---|---|---|---|
| NukeTorch/whisper-large-v3-turbo | 808.878.080 | ingles (esta configuracion) | no | MIT | NukeTorch N (Apple Silicon) |
| openai/whisper-large-v3-turbo | no disponible en la informacion proporcionada | multilingue (modelo original) | si (modelo original) | MIT | multiple (transformers, faster-whisper, etc.) |
| openai/whisper-large-v3 | no disponible en la informacion proporcionada | multilingue (modelo original) | si (modelo original) | MIT | multiple |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, idioma, licencia y runtime.

## Limitaciones y advertencias

- Solo ingles: la model card indica explicitamente "English only"; no debe usarse para otros idiomas en esta configuracion.
- Sin marcas de tiempo: `decoding.json` suprime los tokens de timestamp, por lo que no es apto para subtitulado sincronizado sin trabajo adicional.
- Dependencia total del runtime NukeTorch N: no hay instrucciones ni garantias de funcionamiento con transformers, faster-whisper u otros motores.
- Plataforma limitada a macOS ARM64 (Apple Silicon); no se documenta soporte en Linux, Windows ni GPU dedicadas.
- El modelo de audio no se sirve solo: requiere un modelo de texto acompanante, lo que anade complejidad y consumo de recursos al despliegue.
- Prioridad de texto sobre audio: bajo carga de chat, la transcripcion puede sufrir esperas no cuantificadas.
- Licencia del bundle MIT, pero el runtime NukeTorch N tiene condiciones propias: gratuito para individuos, escuelas, sin animo de lucro, proyectos open source no comerciales y empresas con menos de 10 millones de USD de ingresos y menos de 250 personas. Verificar antes de un uso comercial.
- Riesgo de alucinacion tipico de Whisper en audios con ruido, silencios largos o musica; no se documentan mitigaciones especificas en este repositorio.
- Repositorio sin descargas ni likes en el momento de la consulta y creado en 2026; no hay evidencia de mantenimiento continuado.
- No se documentan sesgos conocidos especificos de esta configuracion; los del modelo original de OpenAI aplican igualmente.

## Enlaces

- Hugging Face: https://huggingface.co/NukeTorch/whisper-large-v3-turbo
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio del runtime NukeTorch: https://github.com/NukeTorch/nuketorch
- Terminos de licencia del runtime: https://github.com/NukeTorch/nuketorch
