# Docglasses-AI/indic-conformer-600m-sherpa-onnx-int8

## Resumen

IndicConformer 600M sherpa-onnx int8 es un paquete de reconocimiento automatico del habla (ASR) derivado del modelo IndicConformer 600M multilingual de AI4Bharat, adaptado para su ejecucion offline con la libreria sherpa-onnx sobre CPU y Android. El modelo original combina un encoder compartido con una cabeza CTC de 5.633 tokens que cubre 22 lenguas indoarias y dravidicas; este paquete resuelve el problema de la mezcla de sistemas de escritura fijando una unica lengua por fichero mediante una mascara constante que anula los tokens del resto de idiomas.

La relevancia practica esta en el formato: cada fichero ONNX de aproximadamente 659 MB integra encoder y decodificador CTC en un solo grafo, con pesos cuantizados a int8 y salida `LogSoftmax` denominada `logprobs`, junto con los metadatos NeMo CTC que sherpa-onnx espera (`vocab_size=5633`, `subsampling_factor=8`, `normalize_type=per_feature`). Esto permite desplegar ASR multilingue en dispositivos sin GPU, con una latencia declarada de aproximadamente 0,1x tiempo real en un Galaxy S25 con 4 hilos.

No es un modelo de lenguaje: no genera texto ni razona, solo transcribe audio de 16 kHz mono a texto en una de las 22 lenguas soportadas. Su interes para desarrolladores es la combinacion de licencia MIT, tamano contenido y soporte nativo en un runtime ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (encoder Conformer + cabeza CTC), exportado a ONNX |
| Parametros totales | 600M (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio, no contexto de texto; entrada 16 kHz mono) |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur (22 lenguas) |
| Licencia | MIT |
| Formato de pesos | ONNX (un fichero `.int8.onnx` por lengua) + `indicconformer-tokens.txt` |

## Arquitectura y entrenamiento

El modelo base IndicConformer 600M multilingual de AI4Bharat emplea una arquitectura Conformer con un encoder compartido y una cabeza CTC unica de 5.633 tokens que cubre 22 lenguas, con 256 tokens por lengua mas un token blank. El entrenamiento original, la composicion exacta del dataset y el uso de tecnicas de refinamiento (RLHF, DPO u otras) no se detallan en la informacion disponible.

La innovacion de este paquete es de despliegue, no de entrenamiento: se fusionan encoder y decodificador CTC en un unico grafo ONNX, se anade una mascara constante que aplica `-inf` a todos los tokens fuera de la lengua elegida (manteniendo el blank) y se emite una salida `LogSoftmax` llamada `logprobs` con los metadatos NeMo CTC que sherpa-onnx requiere. Los pesos int8 proceden de la exportacion de `abid1010/indic-conformer-600m-onnx`. La decodificacion es greedy search por defecto.

## Capacidades

- Transcripcion de voz a texto offline en 22 lenguas de India y Nepal.
- Decodificacion CTC greedy sobre audio de 16 kHz mono en formato float32.
- Ejecucion en CPU y Android mediante sherpa-onnx, sin dependencia de GPU.
- Fijacion de lengua por fichero para evitar mezcla de sistemas de escritura en la salida.
- Integracion con segmentacion previa por VAD (el benchmark usa Silero VAD para dividir en turnos).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto libre.
- No soporta vision ni audio mas alla de la transcripcion.
- Capacidad multilingue limitada a las 22 lenguas listadas; no hay traduccion ni deteccion automatica de idioma.

## Casos de uso

- Subtitulado offline en dispositivos moviles: empaquetar el fichero de la lengua objetivo en una app Android y transcribir notas de voz o reuniones sin conexion, aprovechando el consumo de aproximadamente 0,1x tiempo real en hardware movil reciente.
- Atencion al cliente en centros de llamadas regionales: transcribir grabaciones en hindi, marathi o telugu para alimentar analitica de calidad, con la ventaja de que cada fichero fija una lengua y evita contaminacion de escritura.
- Documentacion clinica dictada: el benchmark sobre dialogos medicos sinteticos sugiere uso en entornos sanitarios para lenguas con WER bajo (marathi y telugu al 11,5%), siempre con revision humana dado el riesgo de error.
- Archivado y busqueda de audio en bibliotecas multilingues: desplegar varios ficheros ONNX en paralelo o en secuencia sobre un servidor CPU para indexar grabaciones por lengua.
- Sistemas embebidos y edge computing: integrar sherpa-onnx en dispositivos con recursos limitados donde no cabe un modelo mayor ni hay GPU disponible.
- Accesibilidad: transcripcion en tiempo casi real de conversaciones para personas con discapacidad auditiva en lenguas indias, con la latencia declarada como aceptable para flujos por turnos.
- Investigacion linguistica: generar transcripciones masivas de corpus en lenguas de bajos recursos (santali, bodo, dogri) para anotacion posterior, asumiendo WER alto en las lenguas menos representadas.

## Benchmarks y rendimiento

Word error rate sobre dialogos medicos sinteticos (Svara TTS, aproximadamente 470 clips por lengua), con segmentacion por Silero VAD y decodificacion por turno. Se ignoran puntuacion y etiquetas; las variantes ortograficas cuentan como error.

| Lengua | WER | Lengua | WER |
|---|---|---|---|
| Marathi | 11,5% | Malayalam | 21,8% |
| Telugu | 11,5% | Nepali | 24,8% |
| Kannada | 15,4% | Punjabi | 26,4% |
| Hindi | 16,0% | Gujarati | 27,2% |
| Bengali | 16,6% | Maithili | 29,6% |
| Tamil | 18,1% | Dogri | 42,9% |
| Sanskrit | 19,7% | Bodo | 43,6% |
| Assamese | 20,1% | | |

Odia, urdu, konkani, kashmiri, manipuri, santali y sindhi no fueron evaluados. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para CPU. Cada fichero ONNX ocupa aproximadamente 659 MB en disco y una cantidad similar de RAM al cargarse.
- GPU recomendadas: no disponibles ni necesarias; el runtime objetivo es CPU y Android.
- Cabe en cualquier dispositivo con al menos 1 GB de RAM libre; probado en un Galaxy S25 con 4 hilos (carga en aproximadamente 1,4 s).
- Opciones de despliegue: sherpa-onnx (Python, C++, Android, iOS y otras plataformas), mediante `OfflineRecognizer.from_nemo_ctc`.
- Latencia y throughput: aproximadamente 0,1x tiempo real en Galaxy S25 con 4 hilos y decodificacion greedy; no se han publicado cifras para otros procesadores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| IndicConformer 600M sherpa-onnx int8 (este) | 600M | audio 16 kHz mono | 22 lenguas indias | MIT | ONNX int8 |
| ai4bharat/indic-conformer-600m-multilingual | 600M | audio 16 kHz mono | 22 lenguas indias | MIT | pesos originales (no disponible el detalle) |
| abid1010/indic-conformer-600m-onnx | 600M | audio 16 kHz mono | 22 lenguas indias | no disponible | ONNX |
| Whisper (variantes de OpenAI) | 39M-1,55B | audio 16 kHz | multilingue amplio | MIT | safetensors, GGUF, ONNX |

La comparativa con Whisper es orientativa: no se dispone de resultados de WER comparables en la informacion proporcionada. La ventaja diferencial de este paquete frente al modelo base es la fijacion de lengua y el empaquetado para sherpa-onnx; frente a Whisper, el soporte especifico de lenguas indias de bajos recursos y el despliegue en CPU.

## Limitaciones y advertencias

- El benchmark se realizo sobre dialogos medicos sinteticos generados con TTS, no sobre audio real; el WER en produccion puede diferir.
- WER elevado en lenguas de bajos recursos: dogri (42,9%) y bodo (43,6%) son poco fiables para uso automatico sin revision.
- Siete lenguas (odia, urdu, konkani, kashmiri, manipuri, santali, sindhi) no tienen datos de evaluacion publicados.
- Cada fichero solo transcribe una lengua; no hay deteccion automatica de idioma ni cambio dinamico dentro de una misma sesion.
- No admite audio distinto de 16 kHz mono float32; requiere remuestreo previo.
- Al ser un modelo CTC greedy, no incorpora puntuacion ni normalizacion de texto; las variantes ortograficas (por ejemplo, nukta) se penalizan como errores.
- Riesgo de alucinacion de tokens en audio ruidoso o fuera de dominio, comun en modelos CTC; conviene segmentar con VAD.
- Sesgos: el entrenamiento del modelo base no se documenta en la informacion disponible, por lo que no se pueden evaluar sesgos de dominio, genero o dialecto.
- Licencia MIT permite uso comercial, pero se recomienda mantener la atribucion a AI4Bharat y al exportador int8.
- El repositorio ocupa 14,5 GB porque incluye los 22 ficheros; en produccion solo hay que descargar el de la lengua objetivo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Docglasses-AI/indic-conformer-600m-sherpa-onnx-int8
- Modelo base: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual
- Exportacion int8 ONNX de origen: https://huggingface.co/abid1010/indic-conformer-600m-onnx
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
