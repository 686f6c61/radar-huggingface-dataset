# 9r4n4y/SOV-Transcribe-1-backup

## Resumen

SOV-Transcribe-1 es un modelo de lenguaje aumentado con voz (speech-augmented language model) desarrollado por Salesforce Sovereign Intelligence, disenado especificamente para reconocimiento automatico del habla (ASR) no streaming. Combina el encoder de audio de Whisper large-v3 con un proyector multimodal y el modelo de mezcla de expertos Gemma 4 26B A4B, lo que da un total de 26.600 millones de parametros con 4.600 millones activos por token, incluido el encoder de audio. El modelo resuelve el problema de la transcripcion de alta precision con control en lenguaje natural sobre el estilo de salida y sesgo contextual, algo poco habitual en modelos ASR open-weight.

Su relevancia actual radica en que, segun el autor, ocupa el puesto numero 1 entre modelos open-weight para speech-to-text no streaming en Artificial Analysis (puesto 7 global) y el numero 2 de 23 sistemas en VoiceCodeBench para precision de entidades y exito de tarea, con fecha de referencia 12 de noviembre de 2026. Esta publicado bajo licencia Apache 2.0, lo que permite despliegue y adaptacion en infraestructura propia sin restricciones comerciales, algo critico para empresas que necesitan mantener el control sobre datos de audio sensibles.

El modelo acepta audio de hasta 30 minutos (probado), entrada a 16 kHz y salida de texto, con soporte para instrucciones en lenguaje natural y contexto adicional (nombres, vocabulario de dominio, descripcion del tema). Cubre siete idiomas: ingles, frances, aleman, espanol, italiano, portugues y neerlandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio Whisper large-v3 + proyector de audio + Gemma 4 26B A4B (MoE) |
| Parametros totales | 26.630.656.030 (~26,6B), incluido el encoder de audio |
| Parametros activos | 4,6B (MoE) |
| Longitud de contexto | no disponible (audio maximo de entrada: hasta 30 minutos, probado) |
| Tipos de cuantizacion | no disponible (entrenado y publicado en BF16; router MoE en FP32) |
| Idiomas soportados | Ingles, frances, aleman, espanol, italiano, portugues, neerlandes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, con codigo de modelado propio) |

## Arquitectura y entrenamiento

La arquitectura es un ensamblaje multimodal de tres piezas: un encoder de audio basado en Whisper large-v3 que convierte la senal de 16 kHz en representaciones latentes, un proyector de audio que alinea esas representaciones con el espacio de embeddings del modelo de lenguaje, y el decodificador Gemma 4 26B A4B, un transformer de mezcla de expertos con 26,6B parametros totales y 4,6B activos. La inferencia se realiza en BF16, salvo el router del MoE que opera en FP32 para mayor estabilidad numerica.

El modelo se presenta como un fine-tune sobre `google/gemma-4-26B-A4B-it` y `openai/whisper-large-v3`, con capacidades de instruction-following aplicadas a la tarea de transcripcion: el prompt controla estilo (verbatim o texto limpio), puntuacion, mayusculas y formato de numeros, y admite contexto de sesgo (nombres, terminos tecnicos, descripcion del tema). No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Como innovacion destacable, el autor publica un modelo borrador DFlash en repositorio separado para decodificacion especulativa, lo que reduce la latencia de generacion en Transformers.

## Capacidades

- Transcripcion automatica del habla no streaming con salida de texto, en lote y en siete idiomas.
- Reconocimiento preciso de entidades: nombres propios, numeros de telefono y direcciones de correo electronico, orientado a dictado y aplicaciones de voz.
- Control del estilo de transcripcion mediante instrucciones en lenguaje natural: verbatim frente a texto limpio, control de puntuacion, mayusculas y formato de numeros.
- Sesgo contextual (context biasing): acepta listas de nombres, vocabulario especifico de dominio o una breve descripcion del tema para mejorar el reconocimiento de terminos dificiles.
- Robustez frente a acentos diversos y condiciones de audio adversas, incluido ruido de fondo.
- Entrada de audio de hasta 30 minutos en una sola peticion (probado).
- Procesamiento por lotes de multiples grabaciones en una misma llamada con Transformers.
- Decodificacion especulativa mediante el modelo borrador DFlash para reducir latencia.
- Soporte nativo en vLLM (via plugin para vLLM 0.32.0) y en Hugging Face Transformers (>=5.19, <5.23).
- No se documentan en la informacion disponible capacidades de vision, audio generativo, tool calling ni razonamiento multi-paso mas alla del instruction-following para transcripcion.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo procesa grabaciones de hasta 30 minutos en una sola peticion y permite solicitar un texto limpio con puntuacion y mayusculas, adecuado para generar actas directamente consumibles por herramientas ofimaticas.
- Dictado profesional con entidades criticas: en entornos juridicos, medicos o financieros, el sesgo contextual permite introducir listas de nombres de clientes, farmacos o terminos tecnicos para reducir errores en nombres, telefonos y correos electronicos.
- Atencion al cliente y centros de llamadas: la transcripcion por lotes de llamadas grabadas y el control de estilo permiten generar transcripciones normalizadas para analitica de calidad, cumplimiento y mineria de conversaciones, desplegando en infraestructura propia para mantener la soberania del dato de audio.
- Subtitulado y accesibilidad multilingue: con soporte para siete idiomas europeos, puede generar subtitulos para contenido en ingles, frances, aleman, espanol, italiano, portugues y neerlandes, con formato de numeros y puntuacion controlables por prompt.
- Investigacion cualitativa y entrevistas: transcripcion verbatim de entrevistas semiestructuradas con preservacion de muletillas y pausas cuando se solicita estilo verbatim, util para analisis de discurso y codificacion manual posterior.
- Sistemas de documentacion clinica: dictado de informes con sesgo contextual hacia terminologia medica y nombres de pacientes, desplegado on-premise para cumplir requisitos de proteccion de datos.
- Pipeline de voz a texto en produccion: integracion via vLLM con decodificacion especulativa DFlash para reducir latencia en servicios de transcripcion de alta concurrencia, con licencia Apache 2.0 que elimina friccion legal en productos comerciales.

## Benchmarks y rendimiento

La model card referencia una imagen de resultados de benchmarks (`assets/benchmark-table.png`) que no esta disponible como texto en la informacion proporcionada, por lo que no se pueden reproducir cifras concretas. Los unicos datos numericos publicados son los rankings agregados del autor:

| Evaluacion | Resultado | Fecha de referencia |
|---|---|---|
| Artificial Analysis, speech-to-text no streaming, open-weight | Puesto 1 entre open-weight; puesto 7 global | 12 de noviembre de 2026 |
| VoiceCodeBench (besimple AI), precision de entidades y exito de tarea | Puesto 2 de 23 sistemas | 12 de noviembre de 2026 |

No se han publicado en la informacion disponible resultados numericos desagregados de MMLU, HumanEval, GSM8K ni de WER por idioma o conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 53 GB solo para pesos (tamano del repositorio de 53,3 GB), mas memoria para cache KV y activaciones; en la practica se recomienda un minimo de 80 GB para audio largo y lotes pequenos.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para despliegue en BF16 con audio de hasta 30 minutos; multiples GPU con tensor parallelism para mayor concurrencia.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; requeriria cuantizacion, de la que no se documentan formatos oficiales en la informacion disponible.
- Opciones de despliegue: vLLM 0.32.0 mediante el plugin incluido en el repositorio (`vllm_plugin/`) y Hugging Face Transformers (>=5.19, <5.23) con `trust_remote_code=True`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Decodificacion especulativa: cargar `salesforce-sovereign-intelligence/SOV-Transcribe-1-DFlash` como modelo asistente en Transformers; en ese modo se procesa una grabacion a la vez.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SOV-Transcribe-1 | 26,6B totales / 4,6B activos (MoE) | Hasta 30 min de audio | 7 (en, fr, de, es, it, pt, nl) | Apache 2.0 | Control por instrucciones y sesgo contextual; soporte vLLM y Transformers |
| Whisper large-v3 | ~1,55B | Ventanas de 30 s | ~99 idiomas | MIT (pesos OpenAI) | Modelo base del encoder; sin control por prompt ni sesgo contextual nativo |
| Gemma 4 26B A4B IT | 26,6B totales / 4,6B activos (MoE) | no disponible en la informacion | no disponible en la informacion | Gemma license | Modelo base del decodificador; sin capacidad de audio nativa |

No se dispone en la informacion proporcionada de datos de rendimiento comparables (WER, precision de entidades) entre estos modelos, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo no streaming: no esta disenado para transcripcion en tiempo real ni para audio por debajo de la latencia de una peticion completa.
- Limite de audio de 30 minutos probado; grabaciones mas largas requieren segmentacion previa.
- Cobertura linguistica limitada a siete idiomas europeos; no se documenta rendimiento en otros idiomas.
- Riesgo de alucinacion inherente al decodificador de lenguaje: en audio con ruido extremo, silencios largos o habla solapada puede generar texto no presente en la senal; se recomienda validacion en dominios de alto riesgo.
- Sesgos no documentados: la informacion disponible no detalla evaluaciones de sesgo por acento, genero, edad o variedad dialectal; el autor menciona robustez frente a acentos diversos, pero sin cifras.
- Dependencia de codigo remoto: el uso en Transformers requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo antes de desplegar en produccion.
- Soporte nativo en vLLM y Transformers aun en proceso de upstream; hasta su publicacion depende del plugin y del codigo de modelado incluido en el repositorio.
- Modelo alojado en un repositorio de un usuario individual (`9r4n4y/SOV-Transcribe-1-backup`), no en la organizacion oficial de Salesforce; verificar procedencia e integridad de los pesos antes de usarlo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede arrastrar terminos adicionales de la licencia Gemma; revisar la compatibilidad antes de redistribuir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/9r4n4y/SOV-Transcribe-1-backup
- Coleccion de modelos de voz de Salesforce Sovereign Intelligence: https://huggingface.co/collections/salesforce-sovereign-intelligence/speech-models
- Blog de lanzamiento: https://huggingface.co/blog/salesforce-sovereign-intelligence/sov-transcribe-1
- Modelo borrador DFlash para decodificacion especulativa: https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1-DFlash
- Modelo base del decodificador: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo base del encoder de audio: https://huggingface.co/openai/whisper-large-v3
