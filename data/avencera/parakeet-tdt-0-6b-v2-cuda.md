# avencera/parakeet-tdt-0.6b-v2-cuda

## Resumen

Parakeet TDT 0.6B v2 for CUDA es una exportación a safetensors de los pesos originales de NVIDIA Parakeet TDT 0.6B v2, un modelo de reconocimiento automático del habla en inglés basado en la arquitectura FastConformer con decodificación TDT (Token-and-Duration Transducer). El modelo original lo desarrolla NVIDIA y se distribuye bajo licencia CC BY 4.0. Esta versión concreta la publica el usuario avencera para que sea consumible directamente por scriptrs, una biblioteca de transcripción de voz escrita en Rust que ejecuta Parakeet de forma nativa sobre GPUs NVIDIA sin depender de PyTorch ni de ONNX Runtime.

El modelo cuenta con 617.908.374 parámetros (aproximadamente 0,6 mil millones), lo que lo sitúa en la gama ligera-media de ASR y permite despliegues con requisitos de memoria moderados. Los pesos se mantienen en FP32 con los nombres de tensor originales de NVIDIA, exportados desde el checkpoint de NeMo; scriptrs convierte determinadas capas del encoder a FP16 en la GPU durante la carga, mientras que los modos `Precision::Tf32` y `Precision::Fp32` las conservan en FP32.

Su relevancia radica en que ofrece una vía de inferencia en Rust puro sobre CUDA, con paridad exacta de texto respecto a NeMo en las pruebas del autor, y con un rendimiento publicado muy alto (en la variante v3, de arquitectura idéntica, 1534x tiempo real en una RTX 5090, 3,2 veces más rápido que NeMo con el mismo 1,93 % de WER en LibriSpeech test-clean). Es una opción interesante para pipelines de transcripción de baja latencia en producción que quieran evitar el stack de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificacion TDT (Token-and-Duration Transducer) |
| Parametros totales | 617.908.374 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; el autor recomienda `LongFormTranscriptionPipeline` para audio de mas de 40 s) |
| Tipos de cuantizacion | FP32 en origen; conversion de capas seleccionadas del encoder a FP16 en GPU en tiempo de carga; modos `Precision::Tf32` y `Precision::Fp32` disponibles en scriptrs |
| Idiomas soportados | ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`, 2,47 GB) + `vocab.txt` (tokenizer de NVIDIA) |

## Arquitectura y entrenamiento

El modelo es un FastConformer, una variante de Conformer con atencion por bloques que reduce el coste computacional del encoder, combinado con un decodificador TDT. TDT (Token-and-Duration Transducer) predice conjuntamente el token y su duracion, lo que permite saltar frames durante la decodificacion y reduce el numero de pasos respecto a un transducer convencional, mejorando el throughput sin sacrificar precision. El modelo es unicamente de reconocimiento del habla en ingles; no es un modelo generativo de texto ni un LLM.

Los pesos de esta ficha son los de NVIDIA sin modificar, exportados desde el checkpoint de NeMo (nemo-toolkit 3.0.0) conservando los nombres de tensor originales; el safetensors registra en sus metadatos el SHA-256 del checkpoint de origen (`d99e39955c9d3d0350d8fb7c75e40c64a2b2eaeb003883d7c941fd2e8747b28c`). No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR). La innovacion tecnica de esta publicacion es el empaquetado para scriptrs: inferencia nativa CUDA en Rust, sin PyTorch ni ONNX Runtime, con conversion selectiva de capas a FP16 en la GPU.

## Capacidades

- Transcripcion de voz a texto en ingles (ASR) a partir de audio mono a 16 kHz en muestras f32.
- Decodificacion TDT con prediccion conjunta de token y duracion, orientada a alto throughput.
- Procesamiento de audio largo mediante `LongFormTranscriptionPipeline` (para mas de 40 s), con VAD opcional a traves de la feature `vad` y del modelo `avencera/silero-vad-v5-safetensors`.
- Ejecucion nativa en GPUs NVIDIA mediante CUDA, sin dependencias de PyTorch ni ONNX Runtime.
- Paridad de texto con NeMo verificada por el autor en sus pruebas de paridad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la transcripcion; no es un modelo de lenguaje.
- Capacidades multilingues: no; solo ingles.

## Casos de uso

- Transcripcion por lotes de archivos de audio en ingles: el modelo procesa audio mono a 16 kHz y, con `LongFormTranscriptionPipeline`, ficheros de mas de 40 s; su alto throughput (referencia de 1534x tiempo real en RTX 5090 para la variante v3) lo hace adecuado para reprocesar archivos historicos o volcados masivos.
- Subtitulado y generacion de transcripciones en pipelines de Rust: al integrarse como crate (`scriptrs = { version = "0.3", features = ["cuda"] }`), se puede incorporar en servicios backend escritos en Rust sin introducir un runtime de Python.
- Servicios de dictado y notas de voz: la baja latencia esperada en GPU y la decodificacion TDT permiten transcripciones casi en tiempo real de clips cortos.
- Analitica de llamadas y reuniones en ingles: transcripcion de conversaciones para indexacion, busqueda y resumen posterior con otro modelo; el modo long-form y el VAD facilitan el troceado automatico.
- Despliegue en entornos con requisitos estrictos de dependencias: al no necesitar PyTorch ni ONNX Runtime, simplifica la imagen de contenedor y la cadena de suministro en produccion.
- Evaluacion y benchmarking de ASR: al mantener los pesos originales de NVIDIA con nombres de tensor intactos y paridad de texto con NeMo, sirve como referencia para comparar implementaciones de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos de esta variante v2 en la informacion disponible. El autor publica metricas para la variante v3 (misma arquitectura, vocabulario multilingue mayor), que se recogen a continuacion como referencia indirecta y no como resultado de este modelo:

| Metrica | Valor (variante v3, RTX 5090) |
|---|---|
| Throughput en LibriSpeech test-clean | 1534x tiempo real |
| Comparacion con NeMo | 3,2x mas rapido |
| WER en LibriSpeech test-clean | 1,93 % (identico a NeMo) |

Para la v2 no hay cifras de WER ni de throughput en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: los pesos en FP32 ocupan 2,47 GB; con la conversion selectiva de capas del encoder a FP16 en la GPU, el consumo real sera algo inferior, aunque no se especifica la cifra exacta en la informacion disponible.
- GPU recomendadas: el autor cita una RTX 5090 para sus benchmarks; cualquier GPU NVIDIA con soporte CUDA y al menos unos pocos GB de VRAM libre deberia poder alojar los pesos, aunque no se detallan minimos oficiales.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas NVIDIA de gama media y alta con suficiente VRAM para 2,47 GB de pesos mas overhead de activaciones y buffers; no se confirma una lista concreta.
- Opciones de despliegue: scriptrs con la feature `cuda` (unica via documentada); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles para la v2; como referencia, la v3 alcanza 1534x tiempo real en RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| avencera/parakeet-tdt-0.6b-v2-cuda (este) | 617,9 M | audio largo via pipeline long-form | en | CC BY 4.0 | safetensors, scriptrs (CUDA, Rust) |
| nvidia/parakeet-tdt-0.6b-v2 (original) | 617,9 M | no disponible | en | CC BY 4.0 | NeMo checkpoint, PyTorch |
| avencera/parakeet-tdt-0.6b-v3-cuda | misma arquitectura, vocabulario mayor | audio largo via pipeline long-form | multilingue (segun model card) | no disponible en la informacion | safetensors, scriptrs (CUDA, Rust) |

La diferencia principal frente al original de NVIDIA es el formato y el runtime (safetensors + Rust/CUDA frente a checkpoint NeMo + PyTorch), manteniendo pesos y precision de transcripcion. Frente a la v3, la v2 esta limitada al ingles y no dispone de las metricas publicadas de velocidad.

## Limitaciones y advertencias

- Solo reconoce ingles; no es multilingue.
- Es un modelo exclusivamente ASR: no genera texto libre, no razona, no soporta tool calling ni agentes.
- Riesgo de alucinacion presente en la forma habitual en ASR: inserciones o sustituciones de palabras en audio ruidoso, con acentos no vistos o con solapamiento de hablantes; no se publican tasas de error para la v2.
- Para audio de mas de 40 s es necesario usar `LongFormTranscriptionPipeline`; el pipeline estandar no esta pensado para secuencias largas.
- La licencia CC BY 4.0 permite uso comercial con atribucion a NVIDIA y mencion de los cambios realizados (exportacion a safetensors); es obligatorio conservar el credito.
- Dependencia de CUDA y de GPUs NVIDIA; no hay via CPU documentada en esta publicacion.
- Ecosistema muy joven (scriptrs 0.3.x, repositorio con 0 descargas y 0 likes en el momento de la ficha), lo que implica menor madurez y soporte comunitario que el stack NeMo.
- Los benchmarks publicados corresponden a la v3, no a esta v2; no deben extrapolarse sin verificacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/avencera/parakeet-tdt-0.6b-v2-cuda
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Variante v3 para CUDA: https://huggingface.co/avencera/parakeet-tdt-0.6b-v3-cuda
- Repositorio scriptrs: https://github.com/avencera/scriptrs
- Resultados CUDA de scriptrs: https://github.com/avencera/scriptrs#cuda
- Modelo VAD auxiliar: https://huggingface.co/avencera/silero-vad-v5-safetensors
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
