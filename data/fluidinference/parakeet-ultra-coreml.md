# FluidInference/parakeet-ultra-coreml

## Resumen

parakeet-ultra-coreml es la conversion a Core ML de moondream/parakeet-ultra, un post-entrenamiento a precision completa de nvidia/parakeet-tdt-0.6b-v3. Lo publica FluidInference dentro de su ecosistema FluidAudio, orientado a ejecutar reconocimiento automatico del habla (ASR) sobre Apple Silicon. Mantiene la misma arquitectura, tokenizador, convenciones de salida y contrato de componentes que la version v3, por lo que funciona como sustituto directo en pipelines que ya integran Parakeet TDT.

El modelo resuelve transcripcion multilingue en local, sin depender de servicios en la nube, aprovechando el motor Core ML y la Neural Engine (ANE) o la GPU de los chips de Apple. La build empaqueta un encoder en int8 lineal por canal de 595 MB con ventana fija de 15 segundos, junto con decodificador y joint reexportados desde el checkpoint Ultra y un preprocesador mel heredado de v3. El repositorio completo ocupa 0,6 GB y se distribuye bajo licencia CC-BY-4.0.

Frente a la version v3, mejora el WER en LibriSpeech test-clean (2,12 % vs 2,27 %), test-other (3,79 % vs 4,12 %) y en la media de 24 idiomas de FLEURS (11,67 % vs 14,81 %), ganando en los 24 idiomas evaluados. Es relevante ahora porque ofrece una via de despliegue local en dispositivos Apple con calidad cercana a la de modelos ASR mayores, sin coste de inferencia por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), familia RNNT; encoder transformer + red de prediccion + joint |
| Parametros totales | 0,6 B (heredados de nvidia/parakeet-tdt-0.6b-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio fija de 15 s; mel [1,128,1501] -> encoder [1,1024,188] |
| Tipos de cuantizacion | encoder int8 lineal por canal (595 MB); decoder y joint en fp16 |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt (25) |
| Licencia | cc-by-4.0 |
| Formato de pesos | Core ML compilado (.mlmodelc); vocabulario en JSON |
| Libreria de ejecucion | fluidaudio (FluidAudio), Core ML |
| Requisitos de plataforma | iOS 17+ / macOS 14+ |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TDT (Token-and-Duration Transducer), una variante de los transductores RNNT que predice de forma conjunta el token y su duracion, lo que acelera la decodificacion frente a un RNNT clasico. La build Core ML divide el sistema en cuatro piezas: un encoder con ventana fija de 15 s (mel [1,128,1501] a encoder [1,1024,188]), un decoder que actua como red de prediccion RNNT, un modulo joint de un solo paso con top-K 64 (JointDecisionv3) y un preprocesador mel heredado de v3. El encoder se exporta en int8 lineal por canal, mientras que decoder y joint se mantienen en fp16.

El checkpoint de origen, moondream/parakeet-ultra, es un post-entrenamiento a precision completa sobre nvidia/parakeet-tdt-0.6b-v3. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La receta de conversion a Core ML esta publicada en el repositorio FluidInference/mobius, en la ruta models/stt/parakeet-ultra/coreml. Segun el autor, el encoder int8 obtiene el mismo WER que una exportacion en fp16 (2,13 % / 3,79 %) y la velocidad iguala o supera a v3 en la misma maquina, tanto en ANE como en GPU.

## Capacidades

- Transcripcion de voz a texto (ASR) en 25 idiomas europeos, incluidos espanol, ingles, aleman, frances, italiano, portugues, neerlandes, polaco y la mayoria de lenguas nordicas y eslavas con representacion en la lista.
- Decodificacion TDT con prediccion conjunta de token y duracion, orientada a baja latencia.
- Ejecucion totalmente local sobre Apple Silicon mediante Core ML, con soporte de Neural Engine y GPU.
- Formato de ventana fija de 15 segundos para el encoder, apto para transcripcion por segmentos.
- Interfaz Swift de alto nivel a traves de FluidAudio (`AsrManager`, `AsrModels`) y CLI `fluidaudiocli`.
- Contrato de componentes compatible con parakeet-tdt-0.6b-v3 (mismo tokenizador y convenciones de salida).
- No dispone de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento; es exclusivamente un modelo de reconocimiento del habla.

## Casos de uso

- Transcripcion de reuniones en local: al ejecutarse sobre Apple Silicon sin conexion, permite procesar audio por segmentos de 15 s y transcribir conversaciones multilingues sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Subtitulado automatico en edicion de video para macOS: la ventana fija de 15 s y la salida compatible con v3 facilitan generar subtitulos en tiempo casi real dentro de herramientas nativas del ecosistema Apple.
- Dictado en aplicaciones iOS/macOS: la integracion via FluidAudio y Core ML permite incorporar entrada por voz en apps de notas o correo con inferencia en dispositivo y sin coste por peticion.
- Atencion al cliente con analitica de llamadas: transcripcion de grabaciones en los idiomas soportados para alimentar sistemas de analisis de sentimiento o QA, evitando depender de APIs externas.
- Accesibilidad: conversion de voz a texto en 25 idiomas para personas con discapacidad auditiva, con ejecucion local que garantiza disponibilidad sin red.
- Investigacion en ASR multilingue: punto de comparacion cuantitativo frente a v3 y referencia reproducible en dispositivos Apple, con recetas de conversion publicadas en FluidInference/mobius.
- Procesamiento por lotes en estaciones Mac: transcripcion de corpus completos aprovechando ANE/GPU, con WER documentado sobre LibriSpeech y FLEURS.

## Benchmarks y rendimiento

Datos de WER (corpus-level) publicados por FluidInference en Mac de la serie M, sobre corpus completos:

| Corpus | v3 (Core ML) | parakeet-ultra-coreml |
|---|---:|---:|
| LibriSpeech test-clean (2620 archivos) | 2,27 % | 2,12 % |
| LibriSpeech test-other (2939 archivos) | 4,12 % | 3,79 % |
| FLEURS, 24 idiomas x 100 muestras (media) | 14,81 % | 11,67 % |

Segun el autor, Ultra mejora en los 24 idiomas de FLEURS evaluados. El encoder int8 iguala el WER de una exportacion fp16 (2,13 % / 3,79 %), y la velocidad iguala o supera a v3 en la misma maquina (ANE y GPU). No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que el modelo es exclusivamente de reconocimiento del habla.

## Requisitos de hardware

- Encoder en int8 de 595 MB; repositorio completo de 0,6 GB, por lo que el modelo cabe holgadamente en memoria de dispositivos Apple modernos.
- Plataformas objetivo: iOS 17+ y macOS 14+, con ejecucion sobre Apple Silicon (ANE y GPU).
- No esta pensado para GPU NVIDIA (A100, H100, RTX 4090); al ser una build Core ML, su despliegue nativo es en hardware Apple.
- Opciones de despliegue: FluidAudio (Swift API y CLI `fluidaudiocli`), integracion directa de los `.mlmodelc` en aplicaciones Core ML.
- Latencias y throughput concretos: no disponibles en la informacion proporcionada; el autor solo indica que la velocidad iguala o supera a v3 en la misma maquina.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-ultra-coreml | 0,6 B | 25 | 2,12 % | CC-BY-4.0 | Core ML, Apple Silicon |
| nvidia/parakeet-tdt-0.6b-v3 (Core ML) | 0,6 B | 25 | 2,27 % | CC-BY-4.0 | Core ML, Apple Silicon |
| nvidia/parakeet-tdt-0.6b-v3 (original) | 0,6 B | 25 | no disponible en esta ficha | CC-BY-4.0 | PyTorch/NeMo |

Otras alternativas de ASR multilingue, como los modelos Whisper, no cuentan con datos de rendimiento comparables dentro de la informacion proporcionada, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Modelo exclusivamente de ASR: no genera texto libre, no soporta razonamiento, codigo ni tool calling.
- Ventana de audio fija de 15 s en el encoder; audios mas largos deben segmentarse, con el riesgo de cortes en fronteras de segmento.
- Cobertura linguistica limitada a los 25 idiomas declarados; otras lenguas no estan soportadas.
- Riesgo de alucinacion y errores de transcripcion en audio ruidoso, con acentos marcados o vocabulario especializado, como en cualquier modelo ASR.
- El WER en FLEURS es notablemente superior al de LibriSpeech (11,67 % de media), lo que indica degradacion en condiciones multilingues y dominios diversos.
- Licencia CC-BY-4.0: requiere atribucion; conviene revisar las condiciones para uso comercial y de derivados.
- Dependencia de plataformas Apple (iOS 17+/macOS 14+); no hay build oficial para CUDA ni otros aceleradores.
- No se documentan sesgos especificos, composicion del dataset de entrenamiento ni procesos de alineacion (RLHF/DPO); esos datos no estan disponibles.
- La calidad depende del preprocesador y vocabulario heredados de v3; cambios en el contrato de componentes pueden afectar la compatibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/parakeet-ultra-coreml
- Checkpoint base Ultra: https://huggingface.co/moondream/parakeet-ultra
- Modelo de origen v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Receta de conversion: https://github.com/FluidInference/mobius (ruta models/stt/parakeet-ultra/coreml)
