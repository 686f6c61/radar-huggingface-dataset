# krut42/voice-fastconformer-es-ctc-int8

## Resumen
krut42/voice-fastconformer-es-ctc-int8 es una version cuantizada a int8 del modelo de reconocimiento automatico de voz (ASR) en espanol nvidia/stt_es_fastconformer_hybrid_large_pc, empaquetada en ONNX y adaptada al runtime sherpa-onnx. La publica el usuario krut42 como fuente alternativa de descarga para la aplicacion Android «Слышно», que la usa para transcripcion en el propio dispositivo: la app descarga cada fichero por separado y verifica su tamano y su SHA-256.

La arquitectura de partida es FastConformer, un encoder Conformer con factor de submuestreo 8 y una cabeza CTC, dentro de una variante hibrida RNNT/CTC (EncDecHybridRNNTCTCBPEModel segun los metadatos del grafo). El resultado son dos ficheros: model.int8.onnx, de 173.888.284 bytes (unos 165,8 MiB), y tokens.txt, de 10.776 bytes con un vocabulario BPE de 1025 tokens.

Su relevancia practica esta en el coste de despliegue: al no llegar a 200 MB y ejecutarse sobre ONNX Runtime, permite transcripcion en espanol, con puntuacion y mayusculas, en moviles y equipos sin GPU. El autor reporta un WER del 7,8 % y un CER del 3,2 % en los primeros 100 clips de FLEURS es_419 dev.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder Conformer con submuestreo 8) con cabeza CTC; metadatos de tipo EncDecHybridRNNTCTCBPEModel |
| Parametros totales | no disponible en la informacion proporcionada (variante "large" del modelo base; el fichero ONNX int8 ocupa 173.888.284 bytes) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; modelo de ASR sobre audio de 16 kHz mono, no una ventana de tokens |
| Tipos de cuantizacion | int8 (cuantizacion dinamica con ONNX Runtime solo de nodos MatMul, pesos uint8; las convoluciones permanecen en float) |
| Idiomas soportados | espanol (es); evaluacion realizada sobre es_419 (espanol latinoamericano) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (model.int8.onnx) y tokens.txt con el vocabulario BPE |
| Entrada de audio | 16 kHz mono, features de 80 dimensiones, normalizacion per_feature |
| Vocabulario | 1025 tokens BPE |
| Tamano del repositorio | 0,2 GB (fichero de pesos int8: 173.888.284 bytes; tokens.txt: 10.776 bytes) |
| Runtime previsto | sherpa-onnx (OfflineRecognizer con configuracion NeMo CTC) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura FastConformer de NVIDIA: un encoder de tipo Conformer con convoluciones separables en profundidad, atencion relativa y un factor de submuestreo de 8, sobre el que se situa una cabeza CTC. El modelo base es hibrido, es decir, entrena simultaneamente las cabezas RNNT y CTC, pero esta exportacion solo conserva la ruta CTC, que es la que utiliza sherpa-onnx en modo offline.

La cadena de transformaciones esta documentada en la propia ficha: el encoder con cabeza CTC fue exportado a ONNX por OpenVoiceOS (model.onnx y vocab.txt, CC BY 4.0); despues, para la app, se anadieron metadatos de sherpa-onnx al grafo (vocab_size = 1025, normalize_type = per_feature, subsampling_factor = 8, model_type = EncDecHybridRNNTCTCBPEModel, language = es) y se aplico cuantizacion dinamica a int8 con ONNX Runtime, limitada a los nodos MatMul con pesos uint8 y dejando las convoluciones en float. tokens.txt es el vocab.txt original sin modificar. No se dispone de informacion sobre el corpus de entrenamiento, el numero de tokens vistos, la composicion del dataset ni el uso de tecnicas de alineamiento tipo RLHF o DPO, que por otra parte no son habituales en modelos ASR entrenados con perdida CTC/RNNT.

## Capacidades
- Transcripcion de voz a texto en espanol, con salida que incluye puntuacion y mayusculas (el modelo base incorpora el sufijo "pc", de punctuation and capitalisation).
- Reconocimiento offline (no en streaming) sobre audio de 16 kHz mono con features de 80 dimensiones y normalizacion per_feature.
- Inferencia con pesos cuantizados a int8, orientada a ejecucion en CPU sobre ONNX Runtime.
- Modelo monolingue: no cubre otros idiomas distintos del espanol.
- No dispone de tool calling, function calling ni soporte de agentes; no es un modelo de lenguaje, sino un reconocedor acustico.
- No dispone de capacidades de vision, audio-vision, razonamiento multi-paso ni modo "thinking".
- No se documenta en la ficha la entrega de marcas temporales a nivel de palabra, diarizacion de hablantes ni puntuaciones de confianza calibradas.

## Casos de uso
- Transcripcion on-device en Android: la propia app «Слышно» descarga model.int8.onnx y tokens.txt, verifica su SHA-256 y transcribe sin enviar audio a la nube, lo que evita costes de servidor y problemas de privacidad.
- Dictado y notas de voz: con 165,8 MiB de pesos, el modelo cabe en el almacenamiento de un movil de gama media y permite dictado continuo con puntuacion y mayusculas ya resueltas en la salida.
- Subtitulado de video y audio en espanol: troceando la pista de audio en segmentos con solapamiento, puede generar subtitulos en un proceso por lotes sobre CPU, sin depender de APIs externas.
- Transcripcion de reuniones y llamadas en local: al ser offline, el audio nunca sale del equipo, lo que encaja en entornos corporativos con politicas estrictas de tratamiento de datos.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de un repositorio de grabaciones en espanol para alimentar un indice de texto y permitir busqueda por palabras.
- Despliegue en dispositivos embebidos: una Raspberry Pi o un kiosco sin GPU puede ejecutar el grafo int8 con ONNX Runtime, algo inviable con modelos ASR de varios gigabytes.
- Cumplimiento normativo en sanidad, banca o legal: al no requerir conexion, facilita el tratamiento de datos personales en casos donde el envio a terceros complicaria el cumplimiento del RGPD.
- ASR a escala sobre CPU en servidores: sirve como motor de transcripcion economico para volumenes altos donde no se justifica alquilar GPU.

## Benchmarks y rendimiento
Unicos resultados publicados en la informacion disponible, medidos en FLEURS es_419 dev con sherpa-onnx 1.13.8, 2 hilos, y con mayusculas y puntuacion eliminadas antes de calcular la metrica:

| Conjunto de evaluacion | WER | CER |
|---|---|---|
| Primeros 12 clips de FLEURS es_419 dev | 6,8 % | 2,4 % |
| Primeros 100 clips de FLEURS es_419 dev | 7,8 % | 3,2 % |

No hay resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark en la informacion proporcionada (no aplican a un modelo ASR). Tampoco se publican datos de latencia, RTF ni consumo.

## Requisitos de hardware
- Pesos int8 de 173.888.284 bytes (unos 165,8 MiB) mas tokens.txt; la huella total en memoria, sumando el runtime de ONNX Runtime y los buffers de inferencia, se situa en el orden de unos pocos cientos de MB (estimacion, no confirmada en la informacion disponible).
- No requiere GPU: la evaluacion publicada se hizo con sherpa-onnx en CPU y 2 hilos.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y tambien en iGPUs; no necesita A100 ni H100.
- Cabe en dispositivos moviles y en placas tipo Raspberry Pi, que es precisamente el escenario para el que se empaqueto.
- Opciones de despliegue: sherpa-onnx con OfflineRecognizer y configuracion NeMo CTC (nemo_ctc.model = model.int8.onnx, tokens = tokens.txt); tambien puede cargarse directamente con ONNX Runtime, aunque los metadatos de preprocesado son especificos de sherpa-onnx.
- Aceleracion opcional mediante execution providers de ONNX Runtime (CUDA, DirectML, CoreML, NNAPI), no documentada por el autor para este grafo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Formato y tamano | Salidas | WER en FLEURS es_419 dev | Licencia |
|---|---|---|---|---|
| krut42/voice-fastconformer-es-ctc-int8 | ONNX int8, 173.888.284 bytes | Solo cabeza CTC | 7,8 % (100 clips), 6,8 % (12 clips) | CC BY 4.0 |
| nvidia/stt_es_fastconformer_hybrid_large_pc | Pesos NeMo en precision completa; tamano no disponible | Cabezas RNNT y CTC | no disponible en la informacion proporcionada | CC BY 4.0 |
| OpenVoiceOS/stt_es_fastconformer_hybrid_large_pc_onnx | ONNX en float (model.onnx y vocab.txt); tamano no disponible | Solo cabeza CTC | no disponible en la informacion proporcionada | CC BY 4.0 |

Como referencia externa a la informacion proporcionada, existen alternativas de la misma categoria, como los modelos multilingues de la familia Whisper o los modelos especificos de espanol disponibles en NeMo, pero no se dispone de resultados comparativos en la informacion facilitada. Cualquier comparacion rigurosa deberia reevaluarlos sobre el mismo FLEURS es_419 dev y con el mismo preprocesado (sin puntuacion ni mayusculas en el calculo del WER).

## Limitaciones y advertencias
- Modelo monolingue: solo reconoce espanol; el rendimiento fuera de las variedades presentes en el corpus de entrenamiento del modelo base no esta documentado.
- Sin informacion sobre el dataset de entrenamiento del modelo original, por lo que se desconocen los sesgos respecto a acento, edad, genero, calidad de microfono o ruido de fondo.
- Riesgo de alucinacion y de sustitucion de palabras en audio ruidoso, con hablantes solapados o con musica de fondo; la cabeza CTC no ofrece un mecanismo de abandono claro cuando la entrada no es inteligible.
- Evaluacion limitada: los unicos datos son los 12 y 100 primeros clips de FLEURS es_419 dev, una muestra pequena y sesgada hacia el espanol latinoamericano. No hay evaluacion sobre espanol peninsular ni sobre dominios tecnicos o conversacionales.
- El WER publicado se calcula eliminando mayusculas y puntuacion antes de puntuar, de modo que no valida la calidad real de la puntuacion que produce el modelo.
- No es un modelo de streaming: esta pensado para OfflineRecognizer, de modo que la transcripcion en tiempo real exige trocear el audio y gestionar el solapamiento entre segmentos, con posible degradacion en las fronteras.
- La cuantizacion dinamica a int8, aunque se limita a los nodos MatMul, puede introducir una perdida de precision adicional frente al modelo en float; no se publica la comparacion int8 frente a fp32.
- Licencia CC BY 4.0: permite uso comercial, pero obliga a atribuir a NVIDIA y a mantener el aviso de licencia, ademas de indicar que se han realizado cambios (exportacion a ONNX y cuantizacion).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: conviene verificar el SHA-256 de los ficheros antes de integrarlos en un pipeline de produccion y fijar la revision concreta.
- Solo se incluye un fichero de pesos int8; no hay variantes GGUF ni fp16 en el repositorio, lo que limita el uso con llama.cpp u otros runtimes no basados en ONNX.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/krut42/voice-fastconformer-es-ctc-int8
- Modelo base de NVIDIA: https://huggingface.co/nvidia/stt_es_fastconformer_hybrid_large_pc
- Exportacion ONNX previa de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_es_fastconformer_hybrid_large_pc_onnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
