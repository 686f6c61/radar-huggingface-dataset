# christian-tarantino/quartznet-variants-it

## Resumen

QuartzNet Variants IT es un checkpoint de reconocimiento automatico del habla (ASR) en italiano publicado por el usuario christian-tarantino en HuggingFace. Se trata de una version modificada de la arquitectura QuartzNet, una red neuronal convolucional 1D con salida CTC (Connectionist Temporal Classification), entrenada sobre el corpus Common Voice 26.0 en su particion italiana. El repositorio contiene unicamente el fichero de pesos en formato PyTorch (`.pth`) y no incluye codigo de inferencia ni tokenizador: para utilizarlo hay que clonar el repositorio GitHub del autor y colocar el checkpoint dentro del directorio `ASR/`.

El modelo es relevante para quien necesite transcripcion de voz en italiano con un consumo de recursos muy bajo, ya que la familia QuartzNet se caracteriza por ser mucho mas ligera que las arquitecturas transformer basadas en atencion (Whisper, wav2vec 2.0) manteniendo una precision competitiva en tareas de dictado. El tag `attention` que aparece en el titulo de la model card sugiere que la variante incorpora algun modulo de atencion sobre el backbone convolucional, aunque el autor no detalla la modificacion exacta.

El repositorio es muy pequeno (0,2 GB), no registra descargas ni "me gusta" en el momento de la consulta, no declara pipeline de HuggingFace y no publica valores numericos de WER ni CER, pese a etiquetar ambas metricas. La model card remite al repositorio de GitHub para arquitecturas, scripts de entrenamiento y resultados de benchmarks detallados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet modificada (CNN 1D con convoluciones time-channel separables) con salida CTC; el titulo menciona un modulo de atencion, no detallado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de ventana de tokens; duracion maxima de audio soportada: no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en `.pth`) |
| Idiomas soportados | italiano (`it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`); no se ofrecen safetensors, GGUF ni ONNX |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | Common Voice 26.0 (italiano) |
| Metricas declaradas | WER, CER (sin valores publicados en la model card) |
| Pipeline de HuggingFace | no disponible |
| Fecha de creacion / actualizacion | 2026-09-22 |

## Arquitectura y entrenamiento

QuartzNet es una evolucion de Jasper (NVIDIA, 2019) que sustituye las convoluciones 1D convencionales por convoluciones separables en tiempo y canal (time-channel separable convolutions) y por bloques residuales con normalizacion por lotes. El resultado es una red puramente convolucional, sin recurrencia, cuya cabeza de salida es una capa CTC que permite alinear secuencias de audio con transcripciones sin necesidad de alineaciones forzadas previas. Frente a los modelos basados en atencion, esta familia reduce drasticamente el numero de parametros y el coste de inferencia, a cambio de una menor capacidad de modelado de contexto largo.

En esta publicacion concreta, la model card indica que se trata de un QuartzNet "modificado" con atencion, entrenado sobre la particion italiana de Common Voice 26.0. No se especifica el numero de tokens o horas de audio empleadas, la composicion exacta del dataset, las tecnicas de aumento de datos, el esquema de optimizacion ni si se aplicaron etapas de ajuste fino adicionales. Tampoco se documenta el numero de parametros de las variantes publicadas. Toda esa informacion se remite al repositorio de GitHub del autor, que no forma parte de la informacion disponible en esta ficha. No procede hablar de RLHF o DPO en un modelo ASR con objetivo CTC.

## Capacidades

- Reconocimiento de voz en italiano: transcripcion de audio a texto en la variante italiana de Common Voice.
- Decodificacion CTC: la salida del modelo es una secuencia de probabilidades por fotograma que requiere decodificacion (greedy o beam search con modelo de lenguaje) para producir texto.
- Procesamiento de audio de dominio general: al entrenarse con Common Voice, cubre lectura de frases y habla espontanea en contextos variados.
- Inferencia ligera: arquitectura convolucional adecuada para CPU y dispositivos con poca memoria.
- No dispone de tool calling ni function calling: es un modelo acustico, no un modelo de lenguaje generativo.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo "thinking", vision ni audio-vision.
- Capacidad multilingue: no, solo italiano.
- Puntuacion y normalizacion de texto: no documentado; depende del decodificador y del modelo de lenguaje externo que se utilice.

## Casos de uso

- Transcripcion de reuniones en italiano: el modelo convierte el audio de una reunion en texto plano para generar actas; su bajo coste computacional permite ejecutarlo en el propio portatil del usuario sin depender de servicios en la nube.
- Subtitulado de video en italiano: integrado en un pipeline de ffmpeg + decodificador CTC, permite generar pistas de subtitulos para contenido audiovisual en italiano, con post-procesado de puntuacion.
- Analitica de centros de contacto: transcripcion masiva de llamadas en italiano para extraer palabras clave, motivos de contacto y metricas de calidad, aprovechando el reducido coste por hora de audio de una red convolucional.
- Asistentes de voz embebidos: al ser un modelo pequeno y sin dependencia de GPU, es candidato para comandos de voz en italiano en dispositivos de borde (Raspberry Pi, moviles, electrodomesticos conectados).
- Accesibilidad y dictado: conversion de voz a texto en italiano para personas con dificultades motoras, ejecutable localmente y sin enviar audio a terceros.
- Documentacion clinica o legal dictada: transcripcion de notas dictadas en italiano, siempre con revision humana posterior por el riesgo de errores en terminologia especializada.
- Enriquecimiento de corpus de investigacion: generacion de transcripciones preliminares para anotar nuevos corpus en italiano, reduciendo el coste de anotacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara las metricas `wer` y `cer` en sus etiquetas, pero no incluye ningun valor numerico; el autor remite al repositorio de GitHub `christian-tarantino/quartznet-variants-it` para los resultados detallados y la comparativa entre variantes.

| Benchmark | Resultado |
|---|---|
| WER (Common Voice 26.0 italiano) | no disponible |
| CER (Common Voice 26.0 italiano) | no disponible |
| Comparativa entre variantes del repositorio | no disponible (remitida al GitHub del autor) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Como referencia orientativa de la familia arquitectonica (redes QuartzNet con decenas de millones de parametros en fp32), la inferencia suele requerir menos de 1-2 GB de memoria, incluyendo activaciones y buffers de audio. El repositorio completo pesa 0,2 GB, lo que sugiere pesos en el rango de decenas de MB a unos 200 MB; esta cifra no esta confirmada por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria deberia ser suficiente (GTX 1650, RTX 3060, RTX 4090, T4, A100, H100). No se publican pruebas con GPU concretas.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU de consumo moderna e incluso en GPUs integradas, dado el perfil ligero de la arquitectura. No confirmado por el autor.
- Ejecucion en CPU: viable y probablemente suficiente para transcripcion no interactiva; no se documentan tiempos.
- Opciones de despliegue: inferencia mediante PyTorch con el codigo del repositorio del autor (obligatorio, ya que solo se distribuyen los pesos). No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI, NVIDIA NeMo, TorchScript ni exportacion a ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| quartznet-variants-it (este modelo) | no disponible | Italiano | Apache 2.0 | PyTorch `.pth` | WER/CER no publicados |
| QuartzNet 15x5 original (NVIDIA, ingles) | ~18,9 M (paper) | Ingles | MIT (repositorio original) | NeMo / PyTorch | WER publicado en el paper original |
| Whisper large-v3 (OpenAI) | ~1550 M | Multilingue (99 idiomas) | MIT | PyTorch, safetensors | WER publicado por OpenAI |
| wav2vec 2.0 XLSR-53 italiano (comunidad) | no disponible en esta ficha | Italiano | no disponible en esta ficha | PyTorch / safetensors | no disponible en esta ficha |

La comparacion estricta de rendimiento no puede realizarse con la informacion disponible, porque este repositorio no publica valores de WER ni CER. A nivel cualitativo, QuartzNet prioriza eficiencia (CPU, latencia baja, modelo muy pequeno) frente a los modelos transformer, que ofrecen mejor precision y cobertura multilingue a cambio de un coste computacional muy superior.

## Limitaciones y advertencias

- Sesgos: el modelo hereda los sesgos del corpus Common Voice italiano (sesgo hacia determinados acentos, edades y contextos de grabacion). No se documenta ningun analisis de sesgo por acento, genero o edad.
- Alucinacion: al ser un modelo CTC, no "alucina" en el sentido generativo, pero puede producir transcripciones incorrectas, palabras inventadas o repeticiones en audio ruidoso, con silencios largos o en dominios alejados del entrenamiento.
- Dominio: entrenado sobre Common Voice, que combina lectura de frases y habla espontanea; el rendimiento en audio tecnico (medicina, derecho, ingenieria) o con jerga profesional es previsiblemente inferior y no esta medido.
- Idioma: exclusivamente italiano. No soporta otros idiomas ni cambio de codigo.
- Contexto acustico: al ser convolucional y sin atencion global sobre secuencias largas, la coherencia en transcripciones de audio muy largo depende de la ventana de inferencia y del decodificador; no se documenta la segmentacion recomendada.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con atribucion y manteniendo el aviso de licencia. Conviene verificar por separado la licencia aplicable al dataset Common Voice de origen.
- Madurez: el repositorio no tiene descargas ni "me gusta", no declara pipeline de HuggingFace y no publica metricas; no hay validacion independiente de la calidad del checkpoint.
- Dependencia de codigo externo: al distribuirse solo el `.pth`, el modelo no es utilizable sin clonar el repositorio del autor, lo que introduce riesgo de mantenimiento y de compatibilidad con versiones futuras de PyTorch.
- Produccion: no se documentan pruebas de robustez, cuantizacion, exportacion a formatos de despliegue ni rendimiento bajo carga; cualquier uso en produccion exige una evaluacion propia con datos representativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/christian-tarantino/quartznet-variants-it
- Repositorio GitHub con codigo, scripts de entrenamiento, arquitecturas y benchmarks: https://github.com/christian-tarantino/quartznet-variants-it
- Dataset de entrenamiento mencionado: Common Voice 26.0, particion italiana (https://commonvoice.mozilla.org/it/datasets)
- Paper original de QuartzNet: "QuartzNet: Deep Automatic Speech Recognition with 1D Time-Channel Separable Convolutions" (https://arxiv.org/abs/1910.10261)
- Paper original de Jasper: "Jasper: An End-to-End Convolutional Neural Acoustic Model" (https://arxiv.org/abs/1904.03288)
- Los resultados de busqueda web devueltos no contienen informacion tecnica relevante sobre este modelo; no se incluyen.
