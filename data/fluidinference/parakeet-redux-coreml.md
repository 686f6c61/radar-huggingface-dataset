# FluidInference/parakeet-redux-coreml

## Resumen

parakeet-redux-coreml es la conversion a Core ML de moondream/parakeet-redux, un reentrenamiento ternario del modelo de reconocimiento de voz nvidia/parakeet-tdt-0.6b-v3. En este reentrenamiento cada peso del encoder queda restringido al conjunto {-1, 0, +1}, lo que permite comprimir el encoder de 445 MB (version v3 en 6 bits) a 183 MB, con un directorio de modelo completo de aproximadamente 220 MB. El modelo conserva las 25 lenguas, el tokenizer y las convenciones de salida de la version v3.

La conversion la firma Fluid Inference (autoria del checkpoint original: moondream), y esta pensada para ejecucion en dispositivo dentro del ecosistema Apple, usando la libreria FluidAudio sobre iOS 18 o macOS 15 o superior. El encoder ternario se exporta con los pesos exactos del checkpoint (codigos palettizados de 2 bits con escalas propias del modelo, por fila y por bloque de 128, en fp16), de modo que no se introduce ruido adicional de recuantizacion.

Su relevancia practica reside en el equilibrio entre tamano y precision: frente a la version v3 en Core ML, redux mejora la media multilingue en FLEURS (13,06 % frente a 14,81 % de WER medio) y gana en 13 de 24 idiomas, sobre todo en lenguas de bajos recursos, a costa de ceder entre 0,37 y 1,05 puntos de WER en ingles. Es, por tanto, una opcion orientada a tamano de descarga y cobertura multilingue, no a maximizar precision en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) basada en FastConformer/Conformer, encoder ternario + decoder RNNT en fp16 + joint en fp16 |
| Parametros totales | Aproximadamente 600 millones (heredados de nvidia/parakeet-tdt-0.6b-v3) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana fija de 15 segundos de audio (mel [1, 128, 1501] a encoder [1, 1024, 188]) |
| Tipos de cuantizacion | Encoder: ternario a 2 bits (codigos palettizados con escalas fp16 por fila y por bloque de 128). Decoder, joint y preprocesador: fp16 |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML (.mlmodelc); tambien incluye parakeet_vocab.json |
| Tamano del encoder | 183 MB |
| Tamano total del repositorio | Aproximadamente 0,2 GB (unos 220 MB) |
| Entorno requerido | iOS 18 / macOS 15 o superior |
| Libreria | fluidaudio |

## Arquitectura y entrenamiento

El modelo es un transducer de tipo TDT, la variante de RNN-T que predice conjuntamente el token y su duracion, sobre la que se apoya nvidia/parakeet-tdt-0.6b-v3. El reentrenamiento ternario de moondream mantiene el tokenizer, las convenciones de salida y las 25 lenguas del modelo base, pero restringe todos los pesos del encoder al conjunto {-1, 0, +1}. La exportacion a Core ML emplea la codificacion nativa de pesos ternarios (operadores `constexpr_lut_to_dense` y `constexpr_blockwise_shift_scale` de iOS 18 / macOS 15) usando los propios codigos palettizados de 2 bits del checkpoint y las escalas fp16 por fila y por bloque de 128, evitando asi ruido de recuantizacion.

El decoder y el modulo JointDecision se reexportan desde el checkpoint redux; segun la model card, el proceso de recuperacion posterior al entrenamiento (post-training recovery) tambien afecto al joint. El preprocesador (front-end mel) y el vocabulario son identicos a los de parakeet-tdt-0.6b-v3-coreml. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO; la model card unicamente menciona una fase de recuperacion posterior al reentrenamiento ternario.

## Capacidades

- Reconocimiento automatico de voz (ASR) de audio a texto mediante pipeline `automatic-speech-recognition`.
- Procesamiento por ventanas fijas de 15 segundos de audio.
- Cobertura de 25 idiomas, con especial mejora en lenguas de bajos recursos (leton, maltes, esloveno, estonio, griego, lituano).
- Salida con marcas de tiempo y puntuaciones derivadas del joint (argmax/softmax con top-64 en el modulo JointDecision).
- Ejecucion en el Neural Engine (ANE) de Apple Silicon, con opcion de ejecutar el encoder en CPU/GPU.
- Ejecucion en segundo plano en iOS gracias al uso del ANE.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio de entrada, thinking mode ni generacion de texto general.

## Casos de uso

- Transcripcion en aplicaciones iOS que deben seguir funcionando en segundo plano: al ejecutarse el encoder en el Neural Engine, la app puede transcribir sin acceso a la GPU, que iOS bloquea en background.
- Subtitulado y transcripcion multilingue en dispositivo: las 25 lenguas soportadas y la mejora en idiomas de bajos recursos lo hacen adecuado para contenidos en lenguas minoritarias como leton, maltes, esloveno o estonio.
- Dictado y notas de voz offline: el modelo completo ocupa unos 220 MB, por lo que cabe en el almacenamiento de un iPhone o Mac sin requerir conexion a red.
- Transcripcion de reuniones o llamadas en local: las ventanas de 15 s permiten procesar audio por tramos con baja latencia (45-52 ms por ventana en ANE).
- Preprocesado de audio para pipelines de analitica: la salida ASR puede alimentar busqueda, indexacion o resumen de contenido en aplicaciones de escritorio macOS.
- Prototipado de ASR en Apple Silicon: con `swift run fluidaudiocli transcribe audio.wav --model-version redux` se puede integrar en un flujo de pruebas rapido gracias a FluidAudio.
- Evaluacion comparativa de modelos ASR en dispositivo: el subcomando `asr-benchmark` permite reproducir las metricas de WER y RTFx sobre subconjuntos de LibriSpeech.

## Benchmarks y rendimiento

LibriSpeech completo, con el encoder en GPU sobre un Mac de la serie M, segun FluidAudio `asr-benchmark` (WER de corpus: distancia total de edicion sobre palabras de referencia; RTFx = audio total / tiempo total de proceso):

| Conjunto | parakeet-tdt-0.6b-v3-coreml | parakeet-redux-coreml |
|---|---:|---:|
| test-clean (2620 archivos) | 2,30 % | 2,67 % |
| test-other (2939 archivos) | 4,10 % | 5,15 % |
| RTFx, test-clean | 118x | 105x |

FLEURS, 24 idiomas, 100 muestras por idioma:

| Metrica | parakeet-tdt-0.6b-v3-coreml | parakeet-redux-coreml |
|---|---:|---:|
| WER medio | 14,81 % | 13,06 % |
| WER ponderado por duracion | 14,65 % | 12,89 % |
| Idiomas ganados | 11 | 13 |
| RTFx | 149x | 134x |

Diferencias por idioma destacadas en la model card: redux mejora leton (-11,1), maltes (-7,7), esloveno (-7,2), estonio (-7,0), griego (-5,2) y lituano (-5,1); y cede en frances (+3,7), ruso (+2,6), neerlandes (+1,9), ingles (+1,9), polaco (+1,7) y ucraniano (+1,4). La model card indica que las transcripciones Core ML coinciden con una decodificacion PyTorch fp32 del checkpoint redux hasta un 0,19 % de WER, por lo que la diferencia respecto a v3 es comportamiento del checkpoint y no perdida de conversion. Nota: el conjunto FLEURS de FluidAudio no incluye `es_es`; ambos modelos se puntuan sobre los mismos 24 idiomas.

## Requisitos de hardware

- Entorno objetivo: dispositivos Apple Silicon (iOS 18 o macOS 15 o superior). No es un modelo orientado a GPUs NVIDIA ni a x86.
- VRAM/RAM: el directorio completo ocupa aproximadamente 220 MB (encoder 183 MB); el modelo se ejecuta en dispositivo, no requiere VRAM de GPU dedicada.
- Aceleracion: el encoder se ejecuta por defecto en el Neural Engine (ANE); tambien admite `encoderComputeUnits: .cpuAndGPU`.
- Latencia medida: 45-52 ms por ventana de 15 s en ANE en caliente; aproximadamente 21 ms por ventana en GPU.
- Compilacion inicial: la primera carga en ANE compila los pesos de 2 bits y tarda varios minutos (unos 7 minutos medidos en un Mac serie M); Core ML cachea el resultado y las cargas posteriores tardan segundos. Con `.cpuAndGPU` la carga es de aproximadamente un segundo.
- Opciones de despliegue: libreria FluidAudio (Swift), con `AsrModels.downloadAndLoad(version: .redux)` en iOS 18+/macOS 15+, y CLI mediante `swift run fluidaudiocli`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Compatibilidad: en iOS 17 / macOS 14 FluidAudio rechaza cargar Redux y redirige a parakeet-ultra-coreml.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Tamano encoder | WER ES test-clean / test-other | WER medio FLEURS | Licencia |
|---|---|---|---|---|---|---|
| parakeet-redux-coreml | ~0,6 B (ternario) | 25 | 183 MB | 2,67 % / 5,15 % | 13,06 % | CC-BY-4.0 |
| parakeet-tdt-0.6b-v3-coreml | ~0,6 B (6 bits) | 25 | 445 MB | 2,30 % / 4,10 % | 14,81 % | CC-BY-4.0 |
| moondream/parakeet-redux | ~0,6 B (ternario) | 25 | no disponible | no disponible | no disponible | CC-BY-4.0 (segun el modelo base) |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | 25 | no disponible | no disponible | no disponible | CC-BY-4.0 |

La referencia v3 es superior en ingles, mientras que redux gana en la media multilingue y reduce el encoder a menos de la mitad (183 MB frente a 445 MB). FluidAudio incluye ademas parakeet-ultra-coreml como alternativa para iOS 17 / macOS 14, aunque no se aportan sus especificaciones en la informacion disponible.

## Limitaciones y advertencias

- En ingles rinde peor que v3: 0,37 puntos en test-clean y 1,05 puntos en test-other, en linea con la diferencia que reporta la model card de origen.
- Cede precision en varios idiomas de altos recursos (frances, ruso, neerlandes, ingles, polaco, ucraniano), por lo que conviene elegir el modelo segun el idioma objetivo.
- Requiere iOS 18 / macOS 15 o superior; los pesos ternarios usan operadores de Core ML introducidos en iOS 18.
- La primera carga en el Neural Engine implica una compilacion de varios minutos (unos 7 minutos medidos en un Mac serie M), aunque despues queda cacheada.
- No esta pensado para GPUs NVIDIA ni entornos de servidor con CUDA; el formato de pesos es Core ML.
- La informacion disponible no detalla sesgos, composicion del dataset de entrenamiento, numero de tokens ni tecnicas de alineacion (RLHF/DPO), por lo que no pueden evaluarse aqui.
- No se documentan mecanismos de mitigacion de alucinaciones ni limitaciones especificas por acento, ruido o dominio; el comportamiento fuera de LibriSpeech y FLEURS no esta caracterizado en la model card.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; conviene revisar los terminos de los pesos base de NVIDIA y del checkpoint moondream antes de un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/parakeet-redux-coreml
- Checkpoint base: https://huggingface.co/moondream/parakeet-redux
- Version v3 en Core ML: https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v3-coreml
- Alternativa para iOS 17 / macOS 14: https://huggingface.co/FluidInference/parakeet-ultra-coreml
- Receta de conversion citada en la model card: `mobius/models/stt/parakeet-redux/coreml` (referencia interna del autor, sin URL publica en la informacion disponible)
- Modelo original de NVIDIA: nvidia/parakeet-tdt-0.6b-v3 (referenciado en la model card; no se aporta URL directa)
