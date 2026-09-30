# RegaLabs/Govtugo-ASR-Sorani

## Resumen

Govtugo-ASR-Sorani es un modelo de reconocimiento automatico del habla (ASR) desarrollado por RegaLabs, un laboratorio con sede en Kurdistan (Iraq) centrado en infraestructura de voz para lenguas de baja disponibilidad de recursos. El modelo se distribuye en HuggingFace bajo el identificador RegaLabs/Govtugo-ASR-Sorani y esta especializado en sorani (ckb), la variedad central del kurdo escrita en alfabeto arabe. Con 2.038.052.480 parametros (~2,04 mil millones) y pesos en safetensors, se situa en la gama de tamano de Whisper large-v3, pero con un enfoque monoingue frente al caracter multilingue del modelo de OpenAI.

La arquitectura declarada en las etiquetas del repositorio es `qwen3_asr`, es decir, una adaptacion o fine-tuning sobre la familia Qwen3-ASR integrada en la libreria `transformers`, con pipeline `automatic-speech-recognition`. El repositorio ocupa 4,1 GB e incluye etiquetas especificas de transcripcion de reuniones (`meeting-transcription`) y de lenguas de bajos recursos (`low-resource-languages`), lo que sugiere un entrenamiento orientado a audio largo y conversacional mas que a clips cortos de laboratorio.

Su relevancia actual reside en dos factores. Primero, la licencia Apache 2.0 permite uso comercial sin restricciones de atribucion mas alla de las habituales, algo poco frecuente en modelos ASR ajustados para lenguas minorizadas. Segundo, el acceso esta restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, un detalle importante para pipelines automatizados. No se han publicado fichas de benchmarks ni detalles de composicion del dataset en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR, familia `qwen3_asr` (segun etiquetas del repositorio) |
| Parametros totales | 2.038.052.480 (~2,04 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (ventana de audio maxima no declarada) |
| Tipos de cuantizacion | No disponible en el repositorio (solo pesos safetensors publicados) |
| Idiomas soportados | ckb (sorani, kurdo central) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition |
| Tamano del repositorio | 4,1 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Fecha de publicacion | 30 de septiembre de 2026 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La etiqueta de arquitectura `qwen3_asr` apunta a un modelo de la familia Qwen3-ASR, que en su forma canonica combina un encoder de audio con un decoder transformer autorregresivo. Con 2,04 mil millones de parametros, el modelo es lo bastante grande como para capturar fonologia y morfologia del sorani sin requerir un cluster de GPUs para inferencia, y lo bastante pequeno como para desplegarse en una unica GPU de 24 GB en precision completa. No se dispone de informacion publica sobre el numero de tokens de audio utilizados en el entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado sobre transcripciones humanas.

Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa, atencion lineal, chunking con estado persistente o diarizacion integrada. La etiqueta `meeting-transcription` sugiere que el modelo fue optimizado para audio de reunion (multiples hablantes, turnos largos, ruido de fondo moderado), aunque sin ficha tecnica no es posible confirmar si incorpora segmentacion de hablantes, marcas de tiempo a nivel de palabra o manejo de solapamientos. El contexto de RegaLabs incluye productos complementarios como Rega Voice (TTS en sorani, arabe, turco, persa, ingles y chino) y modelos de reconocimiento para badini y kurmanji, lo que indica un ecosistema de voz mas amplio alrededor de esta pieza concreta.

## Capacidades

- Transcripcion de voz a texto en sorani (ckb) con salida en alfabeto arabe.
- Reconocimiento orientado a audio largo y conversacional, segun la etiqueta `meeting-transcription`.
- Procesamiento de audio como modalidad de entrada mediante el pipeline `automatic-speech-recognition` de `transformers`.
- Integracion directa con el ecosistema HuggingFace: `AutoProcessor` y `AutoModelForSpeechSeq2Seq` o clase equivalente de la familia Qwen3-ASR.
- Compatibilidad declarada con `endpoints_compatible`, lo que permite desplegarlo en Inference Endpoints de HuggingFace.
- Soporte de subtitulado indirecto: al producir transcripcion con marcas temporales (si el modelo las emite) puede alimentar pipelines de generacion de subtitulos, una capacidad que RegaLabs comercializa en su plataforma.
- Capacidades multilingues: limitadas a sorani segun la ficha; no se declaran otros idiomas.
- Tool calling, function calling, agentes, vision, audio generation y modo thinking: no disponibles (modelo puramente ASR).

## Casos de uso

- Transcripcion de reuniones corporativas en kurdo sorani: el modelo esta etiquetado explicitamente para `meeting-transcription`, de modo que puede convertir grabaciones de juntas, comites o sesiones parlamentarias en actas de texto editables, cubriendo un nicho donde Whisper rinde de forma irregular por falta de datos de sorani.
- Subtitulado de contenido audiovisual kurdo: integrado en un pipeline que recibe el audio de un video, genera la transcripcion y la alinea con marcas temporales para producir ficheros SRT o VTT, habilitando la distribucion de series, documentales o noticieros en plataformas que exigen subtitulos.
- Atencion ciudadana y servicios publicos en Kurdistan: transcripcion automatica de llamadas a lineas de atencion, registros administrativos o consultas telefonicas, reduciendo el coste de documentacion manual en una lengua con poca cobertura comercial en herramientas ASR.
- Archivado y busqueda de patrimonio oral: conversion de entrevistas, poesia recitada, musica tradicional o testimonios historicos en texto indexable, lo que permite busqueda full-text sobre archivos que hoy solo existen como audio.
- Investigacion linguistica y creacion de corpus: generacion de transcripciones a escala para estudios de fonetica, morfologia o variacion dialectal del sorani, con la ventaja de una licencia Apache 2.0 que permite redistribuir los derivados.
- Accesibilidad en educacion: transcripcion en tiempo casi real de clases y seminarios universitarios impartidos en sorani, facilitando material de repaso y apoyo a estudiantes con discapacidad auditiva.
- Preprocesado para pipelines de traduccion: usar el ASR como primera etapa de un sistema sorani a ingles o sorani a arabe, donde RegaLabs ya ofrece traduccion como servicio complementario.
- Analitica de contact center: procesamiento por lotes de miles de horas de llamadas para extraer temas recurrentes, medir satisfaccion o detectar incidencias, gracias a una licencia que no impone restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No constan valores de WER (word error rate), CER (character error rate) ni comparaciones con otros modelos ASR en la ficha de HuggingFace ni en los resultados de busqueda consultados. Tampoco se documentan resultados en conjuntos de referencia para sorani como Common Voice ckb, FLEURS ckb o MLS. Cualquier cifra de rendimiento que se cite sobre este modelo debe proceder de una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 4,5-5,5 GB solo para pesos, mas el pico de activaciones y cache de atencion durante el procesamiento de audio largo; presupuestar 8-10 GB para secuencias extensas.
- VRAM estimada en int8: en torno a 2,2-2,8 GB de pesos; tipicamente 6 GB totales con activaciones.
- VRAM estimada en int4 (si se generan pesos GGUF o AWQ): en torno a 1,3-1,8 GB de pesos; viable en GPUs de 6-8 GB.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 o L40S para despliegue por lotes a alta concurrencia; RTX 4090, RTX 4080, RTX 3090 o A10G para servicio de baja y media concurrencia.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores en fp16; en tarjetas de 6-8 GB probablemente solo con cuantizacion int4/int8, dato no confirmado por no haber pesos cuantizados publicados.
- Opciones de despliegue: `transformers` con pipeline de ASR, HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), y potencialmente vLLM o TGI si la familia Qwen3-ASR esta soportada por esas librerias; llama.cpp, Ollama y whisper.cpp requieren conversion previa a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo denso de ~2B parametros en una RTX 4090 suele procesar audio varias veces mas rapido que tiempo real en fp16, pero no hay medicion publicada para este modelo concreto.
- Almacenamiento: 4,1 GB de repositorio; prever 10-15 GB libres si se descargan variantes cuantizadas adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Govtugo-ASR-Sorani | ~2,04 B | No disponible | Sorani (ckb) | Apache 2.0 | HuggingFace, acceso restringido |
| Whisper large-v3 | 1,55 B | Ventana fija de 30 s con chunking | ~99 idiomas, sorani no listado oficialmente | MIT | HuggingFace, abierto |
| Whisper medium | 769 M | Ventana fija de 30 s con chunking | Multilingue, cobertura de kurdo marginal | MIT | HuggingFace, abierto |
| Qwen3-ASR (modelo base de la familia) | No disponible | No disponible | Multilingue | No disponible | HuggingFace / API |

La ventaja diferencial de Govtugo-ASR-Sorani es la especializacion monoingue en sorani frente a modelos generalistas cuya cobertura del kurdo es incidente y habitualmente con tasas de error elevadas. La contrapartida es la falta de benchmarks publicados, el acceso restringido y un ecosistema de herramientas mucho menor que el de Whisper. No se dispone de datos objetivos para afirmar superioridad en WER sobre ninguna de las alternativas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, por lo que no se puede descargar en CI/CD ni en contenedores automatizados sin gestionar previamente la aceptacion de condiciones con una cuenta de HuggingFace y un token.
- Ausencia total de benchmarks publicados: no hay WER ni CER verificables, lo que impide estimar la calidad de transcripcion antes de desplegar. Cualquier decision de produccion deberia ir precedida de una evaluacion propia sobre datos representativos.
- Idiomas limitados a sorani: no se declara soporte para badini, kurmanji, arabe, turco ni ingles, aunque RegaLabs ofrezca esos idiomas en otros productos. Usarlo fuera de ckb dara resultados no validados.
- Riesgo de alucinacion en audio de baja calidad: como cualquier modelo seq2seq de ASR, puede generar texto plausible donde no hay habla clara, especialmente con ruido de fondo, musica o solapamiento de hablantes. En contextos legales o medicos esto exige revision humana.
- Sesgos potenciales derivados del corpus de entrenamiento: al no documentarse la composicion del dataset, se desconoce el equilibrio entre dialectos del sorani, genero de los hablantes, acentos regionales y dominios tematicos. Es probable un sesgo hacia el sorani estandar de Sulaymaniyah o Erbil si el corpus proviene de fuentes centralizadas.
- Sin datos sobre marcas temporales ni diarizacion: la etiqueta `meeting-transcription` no garantiza salida con timestamps o separacion de hablantes, imprescindible para actas de reunion y subtitulado profesional.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero el acceso gated anade terminos de uso especificos que deben revisarse antes de integrarlo en un producto.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta indican escasa validacion por parte de la comunidad. Conviene tratarlo como un modelo reciente o experimental y planificar un periodo de evaluacion antes de comprometerlo en produccion.
- Ecosistema de despliegue limitado: sin pesos GGUF, AWQ o GPTQ publicados, el despliegue en entornos de bajos recursos exige realizar la conversion y cuantizacion por cuenta propia, con el riesgo de degradacion de calidad asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RegaLabs/Govtugo-ASR-Sorani
- Documentacion de RegaLabs: https://www.regalabs.dev/en/docs
- Producto Rega Voice (TTS y servicios de voz): https://www.regalabs.dev/en/voice
- Modelo relacionado RegaLabs-TTS (sorani): https://huggingface.co/RegaLabs/RegaLabs-TTS/tree/main/sorani
- Repositorio RegaLabs-TTS: https://huggingface.co/RegaLabs/RegaLabs-TTS/tree/main
- Cuenta de RegaLabs en X: https://x.com/RegaLabsDev
