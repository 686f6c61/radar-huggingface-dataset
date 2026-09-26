# jafarahmadi/SedaNevis_v1.0

## Resumen

SedaNevis_v1.0 es un modelo de reconocimiento automatico del habla (ASR) para persa (farsi) publicado por el usuario jafarahmadi en HuggingFace. Se trata de un ajuste fino sobre la base `nvidia/nemo-asr`, construido con el toolkit NVIDIA NeMo y basado en una arquitectura FastConformer con decodificador RNNT (transducer). El modelo resuelve la tarea de transcripcion de audio a texto en persa, un idioma con menos recursos y con una oferta limitada de modelos ASR abiertos de calidad.

El repositorio ocupa 0,5 GB y la libreria declarada es `nemo`, con pesos en formato PyTorch. El autor declara un WER de 9,78 y un CER de 3,01 sobre un benchmark propio de 1.000 enunciados multi-dominio en persa, si bien estos resultados estan marcados como no verificados (`verified: false`) en la model card, por lo que deben tomarse como cifras autodeclaradas.

Su relevancia actual radica en dos factores: por un lado, amplia el ecosistema de ASR en persa dentro de NeMo, lo que facilita el despliegue en produccion con las herramientas estandar de NVIDIA; por otro, el acceso al modelo esta restringido (gated), de modo que el usuario debe aceptar condiciones en HuggingFace antes de descargarlo. El modelo se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + RNNT (transducer), implementado con NVIDIA NeMo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; admite audio de formato largo segun la arquitectura FastConformer, sin cifra declarada) |
| Tipos de cuantizacion | no disponible (se distribuye como checkpoint .nemo en PyTorch; no se declaran variantes cuantizadas) |
| Idiomas soportados | persa (farsi, `fa`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.nemo` (contenedor de PyTorch); no se declaran safetensors ni GGUF |
| Tamano del repositorio | 0,5 GB |
| Modelo base | `nvidia/nemo-asr` |
| Pipeline | automatic-speech-recognition |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo emplea el esquema FastConformer-RNNT de NVIDIA NeMo: un encoder Conformer con subsampling agresivo (que reduce la longitud de la secuencia de entrada y permite procesar audio de formato largo con menor coste computacional) acoplado a un decodificador transducer (RNNT). Este tipo de decodificador modela conjuntamente las dependencias acusticas y linguisticas sin necesidad de un modelo de lenguaje externo, y en NeMo suele permitir extraer alineamientos y marcas de tiempo a nivel de token.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de ajuste adicionales (por ejemplo, refinamiento con decodificacion por haz, aumento de datos o destilacion). Los datasets vinculados en las etiquetas del repositorio son `AliAvd/persian-elderly-asr`, `farsi-asr/farsi-asr-dataset` y `Thomcles/Persian-Farsi-Speech`, lo que sugiere un entrenamiento o ajuste orientado a dominios variados del persa, incluido el habla de personas mayores. No se declara ninguna innovacion tecnica adicional mas alla del propio esquema FastConformer-RNNT.

## Capacidades

- Transcripcion de voz a texto en persa (farsi) a partir de audio.
- Reconocimiento en dominios multiples, segun el benchmark declarado por el autor (1.000 enunciados multi-dominio).
- Posible manejo de habla de personas mayores, dado que uno de los datasets asociados es `AliAvd/persian-elderly-asr`.
- Alineamiento temporal a nivel de token: la arquitectura RNNT en NeMo permite obtener marcas de tiempo, si bien el autor no lo documenta explicitamente para esta version.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad multilingue: el unico idioma indicado es `fa`.
- No se declaran capacidades de vision, audio generativo, traduccion ni diarizacion de hablantes.

## Casos de uso

- Transcripcion de entrevistas y conversaciones con personas mayores: el modelo se ha ajustado con un dataset especifico de habla de personas mayores en persa (`AliAvd/persian-elderly-asr`), un dominio donde los ASR genericos suelen degradarse por diccion, ritmo y articulacion atipicos. Resulta adecuado para proyectos de historia oral o asistencia sanitaria.
- Subtitulado de contenido audiovisual en persa: el modelo puede alimentar un pipeline de generacion de subtitulos (SRT/VTT) para cine, series o videos divulgativos, y el alineamiento por token del decodificador RNNT facilita la sincronizacion de los subtitulos.
- Transcripcion de centros de llamadas y atencion al cliente: permite convertir grabaciones de llamadas en persa en texto indexable, de modo que se puedan aplicar analiticas de calidad, deteccion de motivos de contacto o busqueda por palabras clave en el historico.
- Dictado y notas de voz: integrado en una aplicacion de escritorio o movil mediante NeMo, puede transcribir notas de voz de usuarios persofonos, con la ventaja de que el checkpoint es pequeno (repositorio de 0,5 GB) y se puede ejecutar en local sin enviar el audio a la nube.
- Indexacion y busqueda en archivos de audio: transcripcion masiva de podcasts, archivos de radio o repositorios de grabaciones para construir indices de texto completo, aprovechando la capacidad de procesar audio de formato largo de la arquitectura FastConformer.
- Accesibilidad en directo: generacion de subtitulos en tiempo real para personas con discapacidad auditiva en eventos, clases o reuniones en persa, siempre que la latencia del pipeline de inferencia cumpla los requisitos del caso de uso.
- Investigacion linguistica y construccion de corpus: transcripcion automatica de grabaciones de campo para crear corpus anotados en persa, con posterior revision humana de los segmentos de mayor incertidumbre.
- Preprocesamiento en asistentes de voz: conversion de la entrada de audio en texto como primer modulo de un sistema de dialogo o de un motor de recuperacion de informacion, delegando la comprension del lenguaje a un modelo de lenguaje posterior.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card. El campo `verified` es `false` en ambos casos, por lo que se trata de cifras autodeclaradas y no verificadas de forma independiente.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | Balanced Persian Multi-Domain Benchmark (1.000 enunciados) | Test WER | 9,78 |
| Automatic Speech Recognition | Balanced Persian Multi-Domain Benchmark (1.000 enunciados) | Test CER | 3,01 |

No se han publicado en la informacion disponible resultados en otros benchmarks estandar (Common Voice, FLEURS, MLS, VoxLingua, etc.) ni comparaciones con otros modelos ASR en persa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aproximada, el repositorio completo ocupa 0,5 GB, por lo que los pesos en precision FP16 o FP32 de un modelo de este orden de magnitud caben holgadamente en cualquier GPU de consumo actual; conviene medir el consumo real antes de dimensionar el despliegue.
- GPU recomendadas: no declaradas por el autor. Para un modelo encoder-decoder de tipo Conformer de este tamano, una GPU de consumo reciente (por ejemplo, gama RTX 30/40) deberia ser suficiente para inferencia en linea; en escenarios por lotes o de alta concurrencia se recomienda una GPU de centro de datos (A100, H100 o equivalentes).
- GPU de consumo: previsiblemente si, dado el tamano del checkpoint, si bien no se aportan pruebas de despliegue en ninguna GPU concreta.
- Opciones de despliegue: NVIDIA NeMo (carga directa del checkpoint `.nemo`), exportacion a ONNX o TensorRT mediante las utilidades de NeMo, y servicio mediante NVIDIA Riva o Triton Inference Server. El modelo no declara soporte de llama.cpp, Ollama ni vLLM, que no estan orientados a modelos transducer de NeMo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF (real-time factor), latencia por lote ni tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados en la informacion proporcionada. La tabla siguiente recoge la comparacion a nivel de categorias, marcando como "no disponible" todo aquello que no se ha podido confirmar.

| Modelo | Arquitectura | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| SedaNevis_v1.0 | FastConformer + RNNT (NeMo) | no disponible | Apache 2.0 | HuggingFace, acceso restringido (gated) |
| Whisper large-v3 (OpenAI) | Encoder-decoder transformer | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Modelos ASR de la familia NVIDIA NeMo para persa | Conformer/ FastConformer (CTC y RNNT) | no disponible | no disponible | no disponible |
| Modelos wav2vec 2.0 / XLS-R ajustados a persa | Transformer auto-supervisado + cabeza CTC | no disponible | no disponible | variable segun repositorio |

No se aportan cifras de WER comparadas entre estas alternativas porque la informacion disponible no las incluye.

## Limitaciones y advertencias

- Resultados autodeclarados: el WER de 9,78 y el CER de 3,01 figuran con `verified: false` y se evaluaron sobre un benchmark propio de 1.000 enunciados descrito de forma generica; no hay validacion independiente ni detalle de su composicion.
- Alcance limitado a un idioma: el unico idioma declarado es persa (`fa`). No hay evidencia de comportamiento en otros idiomas ni en code-switching.
- Ausencia de datos de entrenamiento: se desconocen el volumen de horas, la composicion del corpus y el reparto entre train/validacion/test, lo que dificulta valorar el riesgo de sobreajuste al benchmark declarado.
- Posible sesgo de dominio: parte del ajuste parece apoyarse en habla de personas mayores, lo que puede implicar un comportamiento desigual en funcion de la edad, el acento regional, el registro formal o el ruido de fondo.
- Riesgo de alucinacion: como en cualquier sistema ASR, el decodificador puede generar texto plausible pero incorrecto en segmentos con ruido, solapamiento de hablantes o audio de baja calidad. No hay umbrales de confianza documentados.
- Sin segmentacion de hablantes ni puntuacion declarada: no se documenta diarizacion, restauracion de puntuacion ni normalizacion de numeros o entidades.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia. Conviene verificar las condiciones de los datasets de entrenamiento enlazados, que pueden imponer restricciones adicionales sobre el modelo derivado.
- Acceso restringido: el repositorio es gated, por lo que la descarga requiere una cuenta de HuggingFace y la aceptacion de las condiciones del autor; esto puede complicar la automatizacion de despliegues y la reproducibilidad.
- Adopcion nula hasta la fecha: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe comunidad, incidencias reportadas ni soporte externo.
- Mantenimiento incierto: la model card no documenta versionado, hoja de ruta ni procedimiento de reporte de errores, y las fechas de creacion y actualizacion registradas no permiten inferir un plan de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jafarahmadi/SedaNevis_v1.0
- Modelo base declarado: https://huggingface.co/nvidia/nemo-asr
- Datasets asociados:
  - https://huggingface.co/datasets/AliAvd/persian-elderly-asr
  - https://huggingface.co/datasets/farsi-asr/farsi-asr-dataset
  - https://huggingface.co/datasets/Thomcles/Persian-Farsi-Speech
- Toolkit NVIDIA NeMo: no se proporciona enlace en la informacion disponible.
- Paper o informe tecnico del modelo: no disponible.
- Demo o espacio de inferencia: no disponible.
- Repositorio de codigo propio: no disponible.

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados no guardan relacion con el tema y se han descartado.
