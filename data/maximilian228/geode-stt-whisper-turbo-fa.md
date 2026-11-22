# Maximilian228/Geode-STT-whisper-turbo-fa

## Resumen

Geode-STT-whisper-turbo-fa es un paquete de reconocimiento automatico del habla (ASR) derivado de Whisper large-v3-turbo, afinado para persa por el usuario givia y convertido al formato sherpa-onnx por el proyecto Geode para su uso en la aplicacion Android Geode, con inferencia local y sin conexion. No es un modelo entrenado desde cero, sino una exportacion ONNX cuantizada en int8 de un fine-tune existente, empaquetada junto con el vocabulario de tokens en un repositorio de 1,0 GB.

El modelo cubre dos idiomas, persa (fa) e ingles (en), y esta pensado para transcripcion en dispositivo. La model card reporta un WER del 8,38 % en el subconjunto de prueba FLEURS en persa (30 enunciados, normalizado sin mayusculas ni puntuacion) usando los ficheros int8 sobre CPU, frente al 6,08 % del checkpoint fp16 en GPU; la cuantizacion int8 anade por tanto 2,3 puntos de WER.

Su relevancia practica es acotada pero concreta: ofrece un artefacto listo para integrar en sherpa-onnx (encoder y decoder int8 mas fichero de tokens) con metricas de rendimiento en movil publicadas (Redmi Note 9 Pro, 4 hilos: 4,4 s de carga, RTF 2,05 en un clip de 10 s y 1384 MB de RSS maximo). La licencia CC-BY-4.0 permite uso comercial con atribucion, lo que facilita su adopcion en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a ONNX |
| Parametros totales | no disponible (heredados de Whisper large-v3-turbo; no se indica cifra en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; no se especifica en la model card) |
| Tipos de cuantizacion | int8 (MatMul, QInt8); los pesos fp16 no se distribuyen en este pack |
| Idiomas soportados | persa (fa), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder y decoder int8) + fichero de tokens de texto |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo de OpenAI, un transformer encoder-decoder para reconocimiento de voz, con licencia MIT en su version original. Sobre esa base, givia realizo un fine-tune para persa (givia/whisper-large-v3-turbo-persian, revision 9626d38558, licencia CC-BY-4.0). El pack de Geode no reentrena el modelo: mapea los pesos de Hugging Face de vuelta al formato de openai-whisper y los exporta con los scripts propios de sherpa-onnx (scripts/whisper/export-onnx.py con la opcion --model turbo), aplicando cuantizacion int8 en las operaciones MatMul (QInt8). La herramienta de conversion del proyecto es tools/stt/export_whisper_hf.py.

No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset del fine-tune ni si se aplicaron tecnicas de RLHF o DPO. La model card justifica la eleccion de int8 porque el runtime CPU de sherpa-onnx reescala fp16 a mayor precision y resulta inviable: medido sobre Parakeet, 3,5 veces mas lento y con un pico de 3,3 GB, por lo que un pack fp16 no es desplegable en ese runtime. Los pesos exactos en fp16 acompanan a Whisper en el motor propio de Geode, no en este repositorio.

## Capacidades

- Transcripcion de voz a texto (ASR) en persa e ingles.
- Inferencia local y sin conexion en dispositivos Android mediante sherpa-onnx.
- Formato optimizado para CPU con cuantizacion int8, con un unico grafo encoder-decoder.
- Soporte de audio de entrada procesado por el runtime sherpa-onnx (tipo de modelo `whisper`).
- No se documentan capacidades de traduccion, diarizacion, tool calling, agentes, vision ni audio mas alla del ASR.

## Casos de uso

- Transcripcion offline en aplicaciones Android: el pack se integra directamente en sherpa-onnx y permite dictado o notas de voz sin conexion, con 1384 MB de RSS maximo medido en un Redmi Note 9 Pro.
- Subtitulado de contenido en persa: el WER del 8,38 % en FLEURS (normalizado) es adecuado para generar subtitulos que se revisan o corrigen a posteriori, no para emision directa sin supervision.
- Asistentes de voz en persa para movil: el modelo transcribe la entrada del usuario en local antes de pasarla a un modulo de NLU, reduciendo la dependencia de servicios en la nube.
- Busqueda por voz en aplicaciones con corpus persa: la transcripcion en dispositivo alimenta un indice local sin enviar audio a servidores externos.
- Prototipado rapido de pipelines ASR: al estar en formato ONNX y con scripts de exportacion publicos, sirve para validar integraciones con sherpa-onnx antes de pasar a un motor propio o a fp16 en GPU.
- Evaluacion comparativa de fine-tunes de Whisper: el pack incluye una medicion reproducible (FLEURS, 30 enunciados) que permite contrastar la perdida de precision por cuantizacion int8 frente a fp16.

## Benchmarks y rendimiento

| Idioma | Metrica | Error % | Enunciados | Condiciones |
|---|---|---|---|---|
| fa | WER | 8,38 | 30 | sherpa-onnx int8, ficheros del pack, CPU |
| fa | WER | 6,08 | no disponible | pesos fp16, GPU (referencia citada en la model card) |

Rendimiento en dispositivo (Redmi Note 9 Pro, sherpa-onnx v2.0.1 CLI, 4 hilos, medido sobre whisper-turbo-uk con el mismo grafo y tamano):

| Metrica | Valor |
|---|---|
| Tiempo de carga | 4,4 s |
| RTF (clip de 10 s) | 2,05 |
| RSS maximo (VmHWM) | 1384 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: no disponible; el pack esta orientado a CPU y no se documenta despliegue en GPU con estos ficheros int8.
- GPU recomendadas: no disponibles para este pack; la referencia fp16 de la model card se midio en GPU sin especificar modelo.
- Consumer GPU: no se documenta compatibilidad; el runtime objetivo es CPU (sherpa-onnx).
- Movil de referencia: Redmi Note 9 Pro con 4 hilos, 4,4 s de carga y 1384 MB de RSS maximo.
- Opciones de despliegue: sherpa-onnx (runtime CPU), con los ficheros `turbo-encoder.int8.onnx`, `turbo-decoder.int8.onnx` y `turbo-tokens.txt`.
- Latencia y throughput: RTF de 2,05 en un clip de 10 s en el dispositivo de referencia, es decir, aproximadamente el doble de tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Geode-STT-whisper-turbo-fa | no disponible (base Whisper large-v3-turbo) | no disponible | fa, en | CC-BY-4.0 | ONNX int8 | WER fa 8,38 % (FLEURS, int8, CPU) |
| givia/whisper-large-v3-turbo-persian | no disponible (base Whisper large-v3-turbo) | no disponible | fa | CC-BY-4.0 | safetensors (Hugging Face) | Modelo base del pack; WER fa 6,08 % en fp16 sobre GPU |
| openai/whisper-large-v3-turbo | no disponible | no disponible | multilingue | MIT | safetensors, ONNX | Modelo original de OpenAI sin fine-tune para persa |

La comparativa se limita a los modelos citados en la informacion disponible; no se aportan datos de otras alternativas ASR para persa.

## Limitaciones y advertencias

- La cuantizacion int8 degrada la precision: 2,3 puntos de WER en persa frente a fp16 (8,38 % frente a 6,08 %).
- La evaluacion en persa se basa en solo 30 enunciados de FLEURS, una muestra pequena que limita la robustez estadistica del WER reportado.
- El pack solo cubre persa e ingles; no se documenta comportamiento en otros idiomas.
- No se distribuyen los pesos fp16 en este repositorio, por lo que no es posible recuperar la precision maxima desde este pack.
- El rendimiento en movil se midio sobre whisper-turbo-uk con el mismo grafo y tamano, no directamente sobre este pack.
- Riesgo de alucinacion y errores en audio con ruido, acentos o vocabulario tecnico: no se documentan evaluaciones en esos escenarios.
- Sesgos: no se documentan analisis de sesgo del fine-tune ni del modelo base.
- Licencia CC-BY-4.0: permite uso comercial con atribucion a givia y al proyecto Geode; el modelo original de OpenAI es MIT y debe mantenerse la atribucion correspondiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Maximilian228/Geode-STT-whisper-turbo-fa
- Modelo base (fine-tune persa de givia): https://huggingface.co/givia/whisper-large-v3-turbo-persian
- Whisper large-v3-turbo de OpenAI (modelo original, MIT): no se incluye enlace en la informacion disponible
- Scripts de exportacion de sherpa-onnx (scripts/whisper/export-onnx.py): no se incluye enlace en la informacion disponible
- Proyecto Geode: no se incluye enlace en la informacion disponible
