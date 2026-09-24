# mldecode/parakeet-ultra-onnx-int8

## Resumen

mldecode/parakeet-ultra-onnx-int8 es un paquete de reconocimiento automatico del habla (ASR) listo para produccion en CPU, derivado de moondream/parakeet-ultra, que a su vez es un reentrenamiento del modelo NVIDIA parakeet-tdt-0.6b-v3. Lo desarrolla el usuario mldecode y su proposito es ofrecer la mayor precision posible en dictado y transcripcion offline dentro del ecosistema sherpa-onnx, sin necesidad de GPU ni de una pila de inferencia compleja. Mantiene la arquitectura completa de parakeet-tdt-0.6b-v3 (FastConformer de 24 capas por 1024 dimensiones y decodificador TDT) y la convierte a ONNX con cuantizacion dinamica int8.

El modelo cubre 25 idiomas europeos (ingles, aleman, frances, espanol, italiano, portugues, ruso, ucraniano, croata, esloveno, leton, lituano, estonio, finlandes, sueco, danes, neerlandes, polaco, checo, eslovaco, hungaro, rumano, bulgaro, griego y maltes) y se distribuye en el mismo formato de cuatro ficheros que parakeet-tdt-0.6b-v3-int8, por lo que funciona como reemplazo directo en aplicaciones existentes. El repositorio ocupa aproximadamente 0,6 GB y la licencia es CC-BY-4.0, con atribucion obligatoria a NVIDIA y Moondream.

Su relevancia practica esta en la relacion precision/recursos: segun las evaluaciones del modelo original, reduce el WER en FLEURS un 18 % respecto a v3 y un 28 % en audio largo tipo TED-LIUM, manteniendo un rendimiento de unas 40 veces el tiempo real en CPU x86 de 8 nucleos. Frente a la variante ternaria parakeet-redux, la mejora mas marcada aparece en condiciones de ruido de fondo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT: encoder FastConformer 24 capas x 1024 dim (salida de 640 dim con proyector plegado) + red de prediccion LSTM de 2 capas + joiner TDT |
| Parametros totales | Aproximadamente 600 M (heredados de parakeet-tdt-0.6b-v3) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; modelo ASR que consume audio. Decodificacion offline por utterance, `subsampling_factor=8`, `feat_dim=128`, `normalize_type=per_feature` |
| Tipos de cuantizacion | Int8: encoder en QUInt8 dinamico, decoder y joiner en QInt8 |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 (atribucion a NVIDIA y Moondream) |
| Formato de pesos | ONNX int8 (`encoder.int8.onnx` ~584 MB, `decoder.int8.onnx` ~12 MB, `joiner.int8.onnx` ~5 MB) mas `tokens.txt` de 8 kB |
| Vocabulario | BPE de 8192 tokens mas blank; cabecera TDT con 5 duraciones |
| Modelo base | moondream/parakeet-ultra (reentrenamiento de NVIDIA parakeet-tdt-0.6b-v3) |
| Tamano del repositorio | 0,6 GB |
| Metodos de decodificacion | Greedy search y modified beam search |

## Arquitectura y entrenamiento

El modelo es un transducer TDT (Token-and-Duration Transducer) completo. El encoder es un FastConformer de 24 capas con dimension de modelo 1024, que emite tramas de 640 dimensiones porque el proyector esta plegado dentro del propio encoder en el layout de Hugging Face; la exportacion oficial de NVIDIA NeMo emite 1024 dimensiones, de modo que los tres ficheros ONNX del repositorio son autoconsistentes entre si y no deben mezclarse con los del paquete v3. La red de prediccion es una LSTM de 2 capas y el joiner TDT combina 8192 tokens BPE, el token blank y cinco duraciones posibles.

Los pesos originales proceden de moondream/parakeet-ultra, un reentrenamiento de parakeet-tdt-0.6b-v3, y la conversion se realizo desde el checkpoint de Hugging Face transformers con `torch.onnx` (opset 17) seguido de cuantizacion dinamica de ONNX Runtime. No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; al tratarse de un modelo ASR, ese tipo de alineamiento no es el mecanismo habitual. La validacion de la cuantizacion reporta similitud coseno ONNX frente a PyTorch de 0,997 en el decoder y 0,999 en el joiner, es decir, ruido atribuible unicamente al int8.

## Capacidades

- Reconocimiento automatico del habla offline (transducer TDT) sobre audio en 25 idiomas europeos.
- Decodificacion greedy y modified beam search, ambas soportadas por el runtime sherpa-onnx.
- Procesamiento de audio largo: las evaluaciones del modelo original incluyen charlas TED-LIUM de 10 a 20 minutos.
- Robustez frente a ruido de fondo (condiciones MUSAN) y audio de dominio empresarial, con mejoras notables respecto a las variantes v3 y redux.
- Compatibilidad con el contrato de E/S de `offline-transducer-nemo-model.cc`: entradas posicionales, tokens del decoder en int32 y logits del joiner con forma `[B,1,1,8198]` incluyendo la cabecera de duraciones.
- Ejecucion en CPU sin pila de GPU, lo que habilita aplicaciones de escritorio y moviles.
- No se documentan en la informacion disponible capacidades de vision, audio generativo, tool calling, agentes, puntuacion configurable ni diarizacion de hablantes.

## Casos de uso

- Dictado offline en aplicaciones de escritorio: el modelo esta pensado explicitamente para este escenario (se menciona DictFlow) y ofrece la mejor transcripcion en CPU dentro del ecosistema sherpa-onnx, con 600 MB de pesos y sin dependencia de GPU.
- Transcripcion de reuniones y notas de voz: la mejora en WER de audio empresarial (5,79 frente a 6,15 de v3) y la gestion de audio largo lo hacen adecuado para grabar y transcribir sesiones completas en local.
- Subtitulado de video en 25 idiomas europeos: la cobertura multilingue y el throughput de aproximadamente 40 veces el tiempo real en 8 nucleos x86 permiten procesar lotes de video en servidores sin GPU.
- Transcripcion de llamadas de atencion al cliente: el rendimiento en condiciones de ruido (MUSAN, 5,82 de WER) y en audio de dominio empresarial encaja con grabaciones telefonicas o de sala con microfonos de techo.
- Aplicaciones de accesibilidad y voz a texto en tiempo real sobre hardware modesto: en un Apple M2 el runtime int8 alcanza aproximadamente 28 veces el tiempo real, suficiente para dictado continuo en un portatil.
- Pipelines de ingesta de audio a texto en backend: el bundle es un reemplazo directo de `parakeet-tdt-0.6b-v3-int8` con el mismo layout de ficheros, de modo que se puede sustituir sin cambios de codigo en servicios ya desplegados con sherpa-onnx.
- Archivado y busqueda de contenido audiovisual: la precision en audio largo (WER de 1,94 en TED-LIUM) reduce el coste de correccion manual en corpus extensos.
- Despliegue en dispositivos Apple mediante la variante CoreML derivada del mismo modelo base, para aplicaciones nativas de macOS e iOS.

## Benchmarks y rendimiento

Resultados de WER en porcentaje (menor es mejor), tomados de las evaluaciones upstream del modelo original sobre pipelines identicas:

| Benchmark | parakeet-tdt-0.6b-v3 | parakeet-redux (ternario) | parakeet-ultra (este repo) |
|---|---|---|---|
| Ingles, 7 conjuntos (LibriSpeech, AMI, Earnings-22, GigaSpeech, SPGISpeech, VoxPopuli) | 6,26 | 6,55 | 5,80 |
| FLEURS, 25 idiomas | 11,62 | 10,56 | 9,55 (−18 % frente a v3) |
| Habla empresarial (estilo AA-WER) | 6,15 | 6,96 | 5,79 |
| Ruido de fondo (MUSAN, 9 condiciones) | 6,72 | 9,04 | 5,82 |
| Audio largo TED-LIUM (11 charlas, 10-20 min) | 2,71 | 2,51 | 1,94 (−28 % frente a v3) |

Velocidad y tamano en CPU:

| Runtime (8 nucleos x86) | Pesos | Throughput | WER (LibriSpeech clean) |
|---|---|---|---|
| Photon + parakeet-redux (kernels ternarios) | 178 MB | ~113x tiempo real | 1,94 |
| sherpa-onnx + ultra-int8 (este repo) | ~600 MB | ~40x tiempo real | no medido en la informacion disponible |
| sherpa-onnx + v3-int8 (referencia) | 670 MB | ~42x tiempo real | 1,97 |

Otras medidas: Apple M2 con sherpa int8, aproximadamente 28 veces el tiempo real. Comprobacion single-thread greedy en una maquina Windows de desarrollo: RTF aproximado de 0,12, es decir, unas 8 veces el tiempo real. Validacion funcional: la decodificacion greedy de la muestra de referencia en ingles produce exactamente "Ask not what your country can do for you. Ask what you can do for your country."

## Requisitos de hardware

- VRAM: no aplica para el caso de uso previsto; el bundle esta disenado para inferencia en CPU con ONNX Runtime.
- Memoria RAM estimada: en torno a 0,6-1 GB para cargar los pesos int8 (584 MB de encoder mas decoder y joiner), con margen adicional para el audio y el estado del decodificador.
- GPU recomendadas: no se especifican. Al ser un paquete int8 de ONNX Runtime, podria ejecutarse con ejecucion providers de GPU, pero no se documentan cifras ni compatibilidad en la informacion disponible.
- GPU de consumo: no es necesaria; el modelo esta orientado a CPU y funciona en portatiles Apple M2 (aproximadamente 28x tiempo real) y en equipos x86 de 8 nucleos (aproximadamente 40x tiempo real).
- Opciones de despliegue: sherpa-onnx mediante `OfflineRecognizer.from_transducer` con `model_type="nemo_transducer"`; integrable desde Python, C++ o cualquiera de los bindings de sherpa-onnx. Existe una variante CoreML (enzolabs/parakeet-ultra-coreml) para el ecosistema Apple.
- Latencia y throughput: RTF de 0,12 en single-thread greedy sobre una maquina Windows de desarrollo; aproximadamente 40x tiempo real con `num_threads=4`-8 en x86 y 28x en M2. Se recomienda ajustar `num_threads` segun el hardware.
- Almacenamiento: aproximadamente 0,6 GB para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | WER FLEURS | WER ruido | Licencia |
|---|---|---|---|---|---|---|
| parakeet-ultra-onnx-int8 (este repo) | ~600 M | ONNX int8, ~600 MB | 25 europeos | 9,55 | 5,82 | CC-BY-4.0 |
| parakeet-tdt-0.6b-v3-int8 | ~600 M | ONNX int8, 670 MB | 25 europeos | 11,62 | 6,72 | Segun el modelo original (no especificada en la informacion disponible) |
| parakeet-redux (ternario) | No disponible | Kernels ternarios, 178 MB | No disponible | 10,56 | 9,04 | No disponible |
| parakeet-ultra-coreml (enzolabs) | ~600 M | CoreML | 25 europeos (heredados del modelo base) | No disponible | No disponible | No disponible |

Frente a v3-int8, la version ultra mantiene un tamano de pesos similar (600 MB frente a 670 MB) con mejor WER en los cinco conjuntos evaluados. Frente a redux, es mas lenta y mas pesada (aproximadamente 40x frente a 113x tiempo real) pero claramente mas precisa, sobre todo con ruido de fondo (5,82 frente a 9,04). No se dispone de comparaciones con modelos ASR de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura limitada a 25 idiomas europeos; no se documenta soporte para otras lenguas.
- Al ser una conversion int8, existe una perdida minima de precision respecto a los pesos originales; la similitud coseno medida es de 0,997 en el decoder y 0,999 en el joiner, pero no se han publicado WER especificos del bundle int8 mas alla de la equivalencia esperada con v3-int8.
- Los tres ficheros ONNX son autoconsistentes entre si y no deben combinarse con mitades del paquete v3; mezclar encoder y decoder de bundles distintos rompe el contrato de dimensiones.
- El encoder emite tramas de 640 dimensiones (proyector plegado), a diferencia de las 1024 de la exportacion NeMo, lo que obliga a respetar la configuracion esperada por sherpa-onnx.
- No se documentan mecanismos de deteccion de actividad de voz ni de manejo de silencios; en audio sin habla el comportamiento queda fuera de la validacion publicada.
- No hay informacion sobre sesgos por acento, variedad dialectal o edad de los hablantes en los datos proporcionados.
- Riesgo de alucinacion tipico de los modelos transducer en segmentos con ruido extremo o musica, no cuantificado en la informacion disponible.
- Licencia CC-BY-4.0: el uso comercial esta permitido, pero exige atribucion a NVIDIA y a Moondream; conviene revisar tambien las condiciones del modelo base parakeet-tdt-0.6b-v3.
- El repositorio no tiene descargas ni likes registrados en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente nula; no se documentan pruebas de regresion mas alla de la muestra de referencia en ingles.
- Para maximo rendimiento en CPU y entornos silenciosos, el propio autor recomienda parakeet-redux; este bundle prioriza precision sobre velocidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mldecode/parakeet-ultra-onnx-int8
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Variante CoreML del mismo modelo base: https://huggingface.co/enzolabs/parakeet-ultra-coreml
- Ficheros individuales: https://huggingface.co/mldecode/parakeet-ultra-onnx-int8/resolve/main/encoder.int8.onnx, https://huggingface.co/mldecode/parakeet-ultra-onnx-int8/resolve/main/decoder.int8.onnx, https://huggingface.co/mldecode/parakeet-ultra-onnx-int8/resolve/main/joiner.int8.onnx, https://huggingface.co/mldecode/parakeet-ultra-onnx-int8/resolve/main/tokens.txt
- Busqueda de modelos Parakeet en Hugging Face: https://huggingface.co/models?search=parakeet
