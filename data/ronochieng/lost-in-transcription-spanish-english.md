# Ronochieng/lost-in-transcription-spanish-english

## Resumen

lost-in-transcription-spanish-english es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-ASR-1.7B y especializado en reconocimiento automatico del habla (ASR) para conversaciones con alternancia de codigo (code-switching) espanol-ingles. Lo publica el usuario Ronochieng en HuggingFace y esta pensado para la pista "Lost in Transcription Spanish-English", una tarea de evaluacion centrada en habla conversacional bilingue, un escenario donde los sistemas ASR genericos pierden precision al cambiar de idioma dentro de una misma frase.

El modelo resuelve un problema concreto: la transcripcion de habla espontanea en la que los hablantes alternan espanol e ingles sin marcar el cambio, algo comun en comunidades hispanohablantes de Estados Unidos. Frente al modelo base sin ajustar (WER de 0,20106 en hablantes de desarrollo no vistos), el adaptador reduce el WER a 0,14665, lo que supone una mejora relativa de aproximadamente el 27 por ciento en esa misma particion. La evaluacion se hizo con hablantes retenidos que no comparten hablante ni conversacion con el conjunto de entrenamiento, lo que evita el optimismo que introduciria una particion aleatoria.

Se trata de un artefacto de investigacion pequeno y reproducible: el autor documenta semilla, huella de configuracion, hash del contenido de entrenamiento, commit y versiones exactas de librerias, ademas de publicar el checkpoint fusionado. La licencia es MPL-2.0 y el pipeline declarado es automatic-speech-recognition. No hay informacion publica sobre el modelo base Qwen3-ASR-1.7B en la documentacion proporcionada, por lo que varios detalles de arquitectura y de contexto quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer multimodal de audio de Qwen/Qwen3-ASR-1.7B; arquitectura interna del modelo base no disponible |
| Parametros totales | 1.700 millones en el modelo base Qwen3-ASR-1.7B; numero de parametros entrenados del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no especifica ventana de contexto ni duracion maxima de audio) |
| Tipos de cuantizacion | No disponibles para el adaptador; el entrenamiento uso torch 2.9.1 y vLLM 0.14.0 sin cuantizacion declarada |
| Idiomas soportados | Espanol (es) e ingles (en), con enfasis en habla con alternancia de codigo es-en |
| Licencia | MPL-2.0 |
| Formato de pesos | safetensors (adaptador PEFT y subcarpeta `merged` con el checkpoint fusionado) |
| Modelo base | Qwen/Qwen3-ASR-1.7B |
| Tipo de adaptacion | LoRA, libreria peft 0.20.0 |
| Tamano del repositorio | 7,5 GB |
| Pipeline declarado | automatic-speech-recognition |
| Hardware de entrenamiento | NVIDIA A100-SXM4-80GB |
| Datos de entrenamiento | 40.108 filas, 30,218 horas, hash de contenido `f42cb4df078ceeda` |
| Semilla y huella de configuracion | `3407` / `e5c3226e99e0f072` |
| Commit de entrenamiento | `77575b8f91cf` (arbol de trabajo con cambios sin confirmar en el momento del run) |
| Fecha de publicacion en el repositorio | 2026-09-28 (fecha declarada en los metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3-ASR-1.7B, un sistema ASR de 1.700 millones de parametros. El autor no detalla la arquitectura interna del modelo base (tipo de encoder de audio, mecanismo de atencion o estrategia de fusion audio-texto), por lo que esos aspectos quedan como no disponibles. El adaptador se entreno con la libreria peft 0.20.0 y se distribuye tanto en formato de adaptador como fusionado dentro del repositorio, que ocupa 7,5 GB.

El entrenamiento siguio un curriculum de dos etapas. La primera, `s1-bangor`, uso exclusivamente el conjunto `bangor_miami` durante 1,0 epoca con una tasa de aprendizaje de 8e-05. La segunda, `s2-dev`, uso el conjunto `spen_dev` durante 3,0 epocas con una tasa de aprendizaje de 3e-05. En total, 40.108 filas y 30,218 horas de audio, con hash de contenido `f42cb4df078ceeda`. La decodificacion no se limita a un unico paso: el autor indica tres pasadas publicadas (`p1-glossary`, `p2-noglossary`, `p3-freelid`) y un combinador `mbr` (minimum Bayes risk) con una regla de post-procesado, una estrategia de ensamblado de hipotesis que suele reducir el WER respecto a una decodificacion unica. No se menciona uso de RLHF ni de DPO, algo poco habitual en ASR.

## Capacidades

- Reconocimiento automatico del habla en espanol, en ingles y en habla con alternancia de codigo entre ambos idiomas.
- Transcripcion de habla conversacional espontanea, el dominio concreto para el que se entreno.
- Decodificacion ensamblada con multiples pasadas y combinador MBR, orientada a minimizar el WER.
- Post-procesado configurable (una regla declarada en la model card).
- Integracion con vLLM como backend de inferencia preferente (`prefer="vllm"`), ademas de la ruta estandar de transformers con PEFT.
- Trazabilidad y reproducibilidad completas: manifiesto de ejecucion, semilla, huella de configuracion y versiones de librerias.
- No consta soporte de tool calling, function calling, agentes, vision ni modo de razonamiento explicito.
- No consta salida de marcas de tiempo, diarizacion de hablantes ni deteccion de idioma por segmento mas alla de las pasadas nombradas.

## Casos de uso

- Transcripcion de reuniones de trabajo bilingues: en equipos donde los participantes alternan espanol e ingles dentro de la misma intervencion, el ajuste especifico evita el fallo tipico de los ASR genericos, que tienden a forzar un unico idioma y a producir sustituciones masivas.
- Subtitulado de podcasts y entrevistas con code-switching: el modelo esta entrenado sobre habla conversacional, por lo que encaja mejor que un ASR de dictado en contenido con solapamientos, muletillas y cambios de idioma a mitad de frase.
- Analisis de conversaciones en centros de atencion al cliente: las llamadas de clientes hispanohablantes en Estados Unidos suelen mezclar terminologia tecnica en ingles con explicaciones en espanol; un WER mas bajo en ese dominio mejora la calidad de las metricas de calidad y de los sistemas de analitica.
- Investigacion sociolinguistica y linguistica de corpus: el modelo permite transcribir entrevistas grabadas para estudiar patrones de alternancia de codigo, con la ventaja de que el autor documenta el normalizador y el protocolo de evaluacion empleados.
- Generacion de datos etiquetados para otros sistemas: las transcripciones pueden usarse como pseudoetiquetas para aumentar corpus de ASR bilingue, siempre que se valide manualmente una muestra antes de usarlas en entrenamiento.
- Accesibilidad en entornos educativos o sanitarios: transcripcion diferida de sesiones o consultas bilingues para generar actas o resumenes, teniendo en cuenta que se trata de un modelo de investigacion y que el tratamiento de datos personales exigiria controles adicionales.
- Evaluacion comparativa de ASR en espanol-ingles: sirve como punto de referencia reproducible (semilla, hashes y versiones fijadas) para medir si otro sistema mejora el WER en hablantes no vistos con el mismo normalizador.

## Benchmarks y rendimiento

Los unicos resultados publicados son de WER sobre hablantes de desarrollo retenidos, calculados con el normalizador propio de la competicion (`lit_jv.scoring`, un port literal de `score.py`). No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto, porque la tarea es de reconocimiento de voz.

| Sistema | WER | Sustituciones | Borrados | Inserciones | Palabras de referencia |
|---|---|---|---|---|---|
| qwen-zero-shot (base sin adaptar) | 0,20106 (20,11 %) | 370 | 193 | 43 | 3014 |
| selected (adaptador, hablante retenido) | 0,14665 (14,67 %) | 262 | 104 | 76 | 3014 |

Observaciones sobre la tabla: la mejora absoluta es de 5,44 puntos porcentuales de WER y la relativa de aproximadamente el 27 por ciento. Las sustituciones bajan de 370 a 262 y los borrados de 193 a 104, mientras que las inserciones suben de 43 a 76, un intercambio habitual cuando el sistema se vuelve mas agresivo emitiendo hipotesis. La particion de desarrollo no comparte hablante ni conversacion con la de test, segun indica el autor. No se han publicado resultados de otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion propia a partir de los 1.700 millones de parametros del modelo base, no publicada por el autor): en BF16/FP16, en torno a 3,5-4 GB solo para pesos, mas cache de activaciones del encoder de audio; en INT8, aproximadamente 2 GB; en INT4, alrededor de 1-1,5 GB.
- El repositorio ocupa 7,5 GB, coherente con la publicacion de un checkpoint fusionado ademas del adaptador, probablemente en precision completa o mixta.
- GPU de entrenamiento declaradas: una NVIDIA A100-SXM4-80GB. El entrenamiento LoRA de un modelo de 1.700 millones de parametros no requiere esa capacidad, pero es el hardware que el autor documento.
- GPU de consumo: un modelo de este tamano cabe con holgura en tarjetas de 8-12 GB o superiores, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090; en 4-6 GB (RTX 3050, GTX 1660) seria necesario cuantizar y vigilar la memoria de las activaciones de audio.
- Opciones de despliegue: vLLM 0.14.0 es el backend preferente segun el autor; tambien es viable la ruta estandar de transformers 4.57.6 con peft 0.20.0. La model card usa la libreria `lit_jv` con `hub.resolve_checkpoint(...)` y `decode.build_backend(path, prefer="vllm")`.
- No se han publicado conversiones GGUF ni integraciones con llama.cpp u Ollama, y no esta confirmado que el encoder de audio del modelo base tenga soporte en esos runtimes.
- Latencia y throughput: no disponibles. Las versiones declaradas fijan el entorno (`accelerate 1.12.0`, `datasets 5.0.1`, `jiwer 4.0.0`, `librosa 1.0.0`, `numpy 2.2.6`, `soundfile 0.14.0`, `torch 2.9.1`, `transformers 4.57.6`), pero no se aportan medidas de velocidad.
- Nota de reproducibilidad del autor: la misma semilla reproduce resultados identicos solo con el mismo software y hardware; cambiar de GPU o de tamano de lote altera el orden de reduccion y desplaza ligeramente el WER.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | WER en este benchmark |
|---|---|---|---|---|---|
| lost-in-transcription-spanish-english | 1.700 M (base) + LoRA | Adaptador LoRA para ASR es-en | MPL-2.0 | Pesos en HuggingFace (adaptador y fusionado) | 0,14665 en hablante retenido |
| Qwen/Qwen3-ASR-1.7B (base) | 1.700 M | ASR multimodal | No disponible en la informacion proporcionada | Pesos en HuggingFace | 0,20106 en modo zero-shot |
| Whisper large-v3 | 1.550 M | ASR encoder-decoder sobre ventanas de 30 s | MIT | Pesos ampliamente distribuidos | No disponible en este benchmark |
| Whisper large-v3-turbo | 809 M | ASR encoder-decoder destilado | MIT | Pesos ampliamente distribuidos | No disponible en este benchmark |

La comparacion con las alternativas se limita a parametros, licencia y disponibilidad: no hay cifras publicadas de estos sistemas sobre el conjunto de evaluacion en espanol-ingles con el normalizador de la competicion, de modo que el WER no es comparable entre filas. Conviene recordar que el WER de 0,14665 se obtuvo con el normalizador propio del autor y con un protocolo de hablantes retenidos; cualquier comparacion con resultados de terceros exigiria replicar exactamente ese pipeline.

## Limitaciones y advertencias

- El adaptador esta especializado en habla conversacional bilingue espanol-ingles. Fuera de ese dominio (dictado, lectura de documentos, audio muy ruidoso, acentos no representados) el rendimiento puede degradarse y no hay datos que lo cuantifiquen.
- El entrenamiento usa 30,218 horas de dos conjuntos concretos (`bangor_miami` y `spen_dev`), un volumen reducido que favorece el sobreajuste al estilo y al vocabulario de esas grabaciones.
- Las inserciones suben respecto al modelo base (76 frente a 43), lo que indica una tendencia a emitir contenido adicional que puede requerir revision en aplicaciones sensibles.
- Riesgo de alucinacion en audio con silencios largos, musica o habla ininteligible, comportamiento comun en modelos ASR basados en transformers; no hay evaluacion especifica de este fenomeno en la informacion disponible.
- Los sesgos del modelo base se heredan, pero no se documenta ni su dataset original ni el perfil demografico de los hablantes de entrenamiento, por lo que no es posible auditar sesgos dialectales.
- La evaluacion se apoya en un unico conjunto de desarrollo con 3.014 palabras de referencia; el margen de error de esa estimacion es amplio y no se publican intervalos de confianza.
- La reproducibilidad es fragil: el autor advierte que cambiar de GPU o de tamano de lote modifica el orden de reduccion y desplaza el WER, y que el arbol de trabajo estaba modificado en el momento del run (`77575b8f91cf`, working tree dirty).
- La licencia MPL-2.0 permite uso comercial, pero es copyleft a nivel de fichero: las modificaciones sobre ficheros cubiertos deben publicarse bajo la misma licencia. Conviene revisar ademas la licencia del modelo base Qwen3-ASR-1.7B, que no se especifica en la informacion proporcionada.
- Los metadatos de HuggingFace declaran fecha de creacion 2026-09-28, posterior a la fecha actual; es necesario verificar la vigencia real del repositorio antes de integrarlo en produccion.
- No hay informacion sobre ventana de contexto ni duracion maxima de audio soportada, lo que impide planificar troceado de audio para ficheros largos.
- Repositorio sin descargas ni likes en el momento de la consulta: no existe validacion independiente de terceros sobre los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ronochieng/lost-in-transcription-spanish-english
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- No se han encontrado en la busqueda web enlaces relevantes al modelo, su paper, su repositorio de codigo ni demostraciones. Los unicos resultados devueltos por la busqueda eran sitios de contenido para adultos sin relacion alguna con el modelo, por lo que se han descartado.
