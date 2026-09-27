# krut42/voice-fastconformer-pl-ctc-int8

## Resumen

`krut42/voice-fastconformer-pl-ctc-int8` es una adaptacion del modelo de reconocimiento automatico del habla (ASR) en polaco `nvidia/stt_pl_fastconformer_hybrid_large_pc`, convertida al formato ONNX y cuantizada dinamicamente a int8 para su ejecucion en dispositivo mediante la libreria sherpa-onnx. El autor (krut42) la publica como espejo de respaldo del modelo que descarga la aplicacion Android «Слышно» (Slyshno), que realiza transcripcion local sin enviar el audio a la nube.

Tecnicamente es un FastConformer (variante de Conformer con subsampling de factor 8) con cabeza CTC, exportado desde el modelo hibrido RNNT/CTC original de NVIDIA. La unica cabeza incluida en este repositorio es la CTC, de modo que se usa en modo offline a traves de `sherpa-onnx.OfflineRecognizer` con una configuracion NeMo CTC, entrada de audio mono a 16 kHz y features de 80 dimensiones. El grafo `model.int8.onnx` ocupa 173.888.280 bytes y la salida incluye puntuacion y mayusculas, heredadas del entrenamiento "pc" (punctuation and capitalization) del modelo base.

Su relevancia es practica: demuestra como llevar un modelo ASR "large" a un dispositivo movil con un archivo de unos 166 MiB, licencia CC BY 4.0 y verificacion de integridad por SHA-256, a costa de una precision moderada (WER 17,2 % en los primeros 12 clips de FLEURS `pl_pl` dev). No es un modelo de lenguaje: no genera texto libre ni razona, solo transcribe voz en polaco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder Conformer con subsampling factor 8) con cabeza CTC; modelo base hibrido RNNT/CTC (`EncDecHybridRNNTCTCBPEModel`) |
| Parametros totales | no disponible (el autor no declara el recuento; el grafo ONNX int8 ocupa 173.888.280 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR offline; no se declara duracion maxima de audio) |
| Tipos de cuantizacion | int8 dinamico con ONNX Runtime: solo nodos MatMul, pesos uint8; las convoluciones permanecen en float |
| Idiomas soportados | polaco (pl) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`model.int8.onnx`) + vocabulario en texto plano (`tokens.txt`) |
| Tamano del repositorio | 0,2 GB |
| Metadatos sherpa-onnx | `vocab_size = 1025`, `normalize_type = per_feature`, `subsampling_factor = 8`, `model_type = EncDecHybridRNNTCTCBPEModel`, `language = pl` |
| Entrada de audio | mono, 16 kHz, features de 80 dimensiones |
| Libreria / runtime | sherpa-onnx (probado con la version 1.13.8) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer "large" de NVIDIA, entrenado dentro del ecosistema NeMo. FastConformer es una evolucion del Conformer que aplica un subsampling de factor 8 sobre las tramas acusticas antes de entrar en el bloque de atencion, lo que reduce de forma notable el coste computacional en secuencias largas manteniendo el modelado convolucional local y la atencion global. El checkpoint original es hibrido, es decir, comparte encoder entre una cabeza RNNT y una cabeza CTC; en esta adaptacion solo se conserva la cabeza CTC, lo que simplifica el grafo y permite un decodificado en un unico paso sin alineamientos externos. El sufijo "pc" de la nomenclatura de NVIDIA indica que el modelo fue entrenado con puntuacion y capitalizacion, de ahi que la transcripcion de salida incorpore ambos elementos. El tamano del vocabulario es de 1025 tokens BPE.

La cadena de transformaciones esta documentada con detalle: OpenVoiceOS exporto el encoder con la cabeza CTC a ONNX (`model.onnx` y `vocab.txt`), y posteriormente krut42 anyadio los metadatos de sherpa-onnx al grafo y lo cuantizo dinamicamente a int8 con ONNX Runtime, afectando unicamente a los nodos MatMul y dejando las convoluciones en coma flotante. `tokens.txt` es el `vocab.txt` original sin modificaciones. No se dispone de informacion sobre el numero de horas de audio, la composicion del corpus de entrenamiento, el uso de RLHF/DPO ni ninguna otra innovacion de entrenamiento: el autor solo describe el proceso de exportacion y cuantizacion, no el entrenamiento de NVIDIA.

## Capacidades

- Reconocimiento de voz offline (modo utterance completo, no streaming) en polaco.
- Salida con puntuacion y capitalizacion, sin necesidad de un modelo de restauracion posterior.
- Decodificacion CTC pura sobre encoder FastConformer con subsampling de factor 8.
- Ejecucion en CPU sobre dispositivos moviles y equipos de escritorio gracias a la cuantizacion int8 (grafo de ~166 MiB).
- Integracion directa con `sherpa-onnx.OfflineRecognizer` mediante una configuracion NeMo CTC (`nemo_ctc.model`, `tokens`).
- Entrada estandarizada a 16 kHz mono con features de 80 dimensiones, compatible con los front-ends habituales de NeMo/sherpa-onnx.
- Verificacion de integridad de los archivos mediante tamanos y hashes SHA-256 publicados en la model card.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni generacion de texto libre.
- No dispone de capacidades de vision, audio multimodal ni traduccion.

## Casos de uso

- Transcripcion local en Android: la aplicacion «Слышно» descarga `model.int8.onnx` y `tokens.txt`, verifica su SHA-256 y ejecuta la inferencia en el propio telefono, de modo que el audio nunca sale del dispositivo. Es el caso de uso para el que se creo el repositorio.
- Notas de voz a texto sin conexion: un usuario graba una nota en polaco y obtiene texto con puntuacion y mayusculas sin conexion a internet, algo util en entornos con conectividad limitada o requisitos de privacidad estrictos.
- Subtitulado y postproduccion de audio en polaco: al procesar cada fragmento con la API offline de sherpa-onnx se pueden generar transcripciones para videos o podcasts, asumiendo el WER de referencia (17-19 %) y una revision humana posterior.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grabaciones de reuniones o entrevistas en polaco para construir un indice de texto consultable, aprovechando que la cuantizacion int8 reduce el coste de ejecutar el modelo en CPU.
- Analitica de centros de contacto: transcripcion posterior de llamadas en polaco para clasificacion tematica y control de calidad; el modelo aporta puntuacion, lo que facilita el procesado posterior con herramientas de NLP.
- Investigacion sobre cuantizacion de modelos ASR: permite medir el impacto de la cuantizacion dinamica int8 solo en MatMul frente a la version float de OpenVoiceOS usando el mismo corpus y la misma configuracion de hilos.
- Sistemas empotrados y edge computing: por su tamano (grafo de 174 MB) es viable en dispositivos ARM con pocos recursos, sin GPU dedicada, ejecutando sherpa-onnx sobre CPU.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son sobre FLEURS `pl_pl` dev, con sherpa-onnx 1.13.8, 2 hilos y puntuacion y mayusculas eliminadas antes de calcular las metricas:

| Conjunto de evaluacion | Subconjunto | WER | CER |
|---|---|---|---|
| FLEURS `pl_pl` dev | primeros 12 clips | 17,2 % | 6,0 % |
| FLEURS `pl_pl` dev | primeros 100 clips | 19,1 % | 7,8 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguaje, ya que no se trata de un modelo de lenguaje. Tampoco se aportan comparaciones numericas con el modelo base en float ni con la version ONNX sin cuantizar. No se dispone de datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del grafo (173.888.280 bytes, unos 166 MiB), la huella en memoria es inferior a 1 GB incluyendo pesos y activaciones.
- GPU recomendadas: no se declara ninguna; el modelo esta pensado para ejecucion en CPU. Al ser un modelo pequeno, cualquier GPU con 1 GB o mas de memoria podria alojarlo, pero no hay cifras publicadas.
- Compatibilidad con GPU de consumo: si, en terminos de memoria cabria en cualquier GPU de consumo actual, aunque no es el escenario objetivo ni esta validado por el autor.
- Despliegue en movil y CPU: si, es el escenario principal (aplicacion Android con sherpa-onnx).
- Opciones de despliegue: sherpa-onnx (`OfflineRecognizer` con config NeMo CTC) es el unico runtime documentado. Al ser un grafo ONNX estandar podria ejecutarse con ONNX Runtime directamente, pero no se documenta.
- Latencia y throughput estimados: no disponibles. La unica referencia de configuracion es la del benchmark de precision: sherpa-onnx 1.13.8 con 2 hilos.
- Requisitos de audio: 16 kHz mono, features de 80 dimensiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| krut42/voice-fastconformer-pl-ctc-int8 | no disponible (grafo de 174 MB) | audio mono 16 kHz, offline | pl | CC BY 4.0 | ONNX int8 | Cuantizado solo en MatMul; WER 17,2 % (12 clips) y 19,1 % (100 clips) en FLEURS pl_pl dev |
| nvidia/stt_pl_fastconformer_hybrid_large_pc | no disponible (variante large de NeMo) | audio mono 16 kHz, RNNT y CTC | pl | CC BY 4.0 | `.nemo` (NeMo) | Modelo original, sin cuantizar; cabezas RNNT y CTC; soporte de puntuacion y mayusculas |
| OpenVoiceOS/stt_pl_fastconformer_hybrid_large_pc_onnx | no disponible | audio mono 16 kHz, CTC | pl | CC BY 4.0 | ONNX (float32) | Exportacion intermedia de la que deriva este modelo; mayor tamano en disco |
| openai/whisper-large-v3 | aproximadamente 1550 millones (dato publico de OpenAI, no verificado en esta ficha) | audio 16 kHz, ventanas de 30 s | multilingue, incluye pl | Apache 2.0 | safetensors, GGUF, ONNX en la comunidad | Alternativa multilingue mas pesada; no se dispone de comparacion numerica con este modelo en la informacion proporcionada |

No se dispone de resultados de benchmarks comparativos entre estas alternativas en la documentacion revisada; la comparacion se limita a parametros de arquitectura, formato, licencia y disponibilidad. Las busquedas web realizadas no devolvieron ninguna fuente tecnica relevante sobre este modelo.

## Limitaciones y advertencias

- Cobertura linguistica limitada al polaco; no admite otros idiomas ni traduccion.
- Modelo ASR offline: esta exportacion incluye unicamente la cabeza CTC, por lo que no se debe asumir decodificacion RNNT ni streaming incremental continuo.
- Precision moderada: WER 17,2 % en 12 clips y 19,1 % en 100 clips de FLEURS dev, con incremento al ampliar la muestra; conviene validar con audio propio del dominio antes de usarlo en produccion.
- La cuantizacion int8 dinamica afecta solo a los nodos MatMul, por lo que la degradacion respecto al modelo en float no esta cuantificada en la informacion disponible.
- Sesgos conocidos: no se documentan. El modelo hereda las caracteristicas del corpus de entrenamiento de NVIDIA, que no se describe en este repositorio; es esperable un peor rendimiento en variedades dialectales, audio con ruido, solapamiento de voces o terminologia especializada.
- Riesgo de alucinacion: en ASR se manifiesta como sustituciones, omisiones o inserciones de palabras, no como texto inventado de forma libre; la puntuacion generada puede no coincidir con la del audio original.
- Licencia CC BY 4.0: permite uso comercial y modificaciones, pero exige atribucion a NVIDIA Corporation (modelo original), a OpenVoiceOS (exportacion ONNX) y al autor de esta adaptacion, ademas de mantener la licencia en las obras derivadas.
- El repositorio se declara como espejo de respaldo de la aplicacion «Слышно»; los archivos se verifican por tamano y SHA-256, de modo que cualquier redistribucion debe preservar esos hashes.
- No hay informacion sobre latencia, consumo de bateria ni rendimiento en dispositivos concretos, datos criticos para una aplicacion movil en produccion.
- El repositorio no declara el numero de parametros ni la duracion del audio de entrenamiento, lo que dificulta reproducir o auditar el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/krut42/voice-fastconformer-pl-ctc-int8
- Modelo base de NVIDIA: https://huggingface.co/nvidia/stt_pl_fastconformer_hybrid_large_pc
- Exportacion ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_pl_fastconformer_hybrid_large_pc_onnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Las busquedas web realizadas no devolvieron articulos, papers ni repositorios adicionales relevantes sobre este modelo.
