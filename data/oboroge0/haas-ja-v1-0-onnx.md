# oboroge0/Haas-ja-v1.0-onnx

## Resumen

Haas-ja-v1.0-onnx es una conversión no oficial a ONNX del modelo de reconocimiento automático de habla (ASR) en japonés Haas-ja-v1.0, desarrollado por Third Intelligence. La conversión ha sido realizada por el usuario de Hugging Face oboroge0 como contribución comunitaria, sin el respaldo del autor original. Su propósito es permitir ejecutar el modelo en CPU con sherpa-onnx, sin depender de PyTorch, NeMo, Triton ni GPU, ya que el modelo original solo está soportado oficialmente en Linux con GPU NVIDIA.

El modelo sigue una arquitectura transducer compuesta por un encoder FastConformer, un prediction network basado en Kimi Delta Attention y un joint network. Esta variante no está cuantizada: los pesos bfloat16 originales se han ampliado a float32 sin alterar sus valores. El repositorio ocupa 2,5 GB y se ha probado con sherpa-onnx 1.13.6 sobre un Apple M1 Pro, alcanzando un factor de tiempo real (RTF) de aproximadamente 0,06 con 4 hilos.

Existe también una versión cuantizada, Haas-ja-v1.0-onnx-quantized, del mismo autor, que requiere cerca de un tercio de la memoria con una precisión similar y que se recomienda para la mayoría de usos prácticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer (encoder FastConformer + prediction network Kimi Delta Attention + joint network), tipo NeMo transducer / TDT |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | Clips de audio de hasta unos 29 segundos probados (offline, segmento completo) |
| Tipos de cuantizacion | Sin cuantizar (float32 ampliado desde bfloat16); existe variante cuantizada aparte |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder.onnx + encoder.data, decoder.onnx, joiner.onnx, tokens.txt) |

## Arquitectura y entrenamiento

El modelo es un transducer offline de tipo NeMo con decodificación TDT (Token-and-Duration Transducer). Consta de tres componentes: un encoder FastConformer exportado a ONNX (2.362 MB con sus pesos externos en `encoder.data`), un prediction network basado en Kimi Delta Attention (15 MB, tamaño oculto real de 640, aunque el estado se aplana a tensores de 20.480 dimensiones para compatibilidad con sherpa-onnx) y un joint network (12 MB). El vocabulario consta de 3.072 tokens más el token en blanco `<blk>`.

Sobre el entrenamiento del modelo original, la model card de la conversión indica que ReazonSpeech forma parte del corpus de entrenamiento del modelo base, pero no se dispone de detalles sobre el número total de tokens de audio, la composición completa del dataset ni el procedimiento de entrenamiento; para ello habría que consultar la model card original de Third Intelligence. La conversión a ONNX se realizó con el exportador de NeMo para el encoder y exportación directa de pesos para decoder y joint, verificando coincidencias numéricas con PyTorch en el orden de 2e-5 a 5e-5.

## Capacidades

- Reconocimiento automatico de habla en japones (transcripcion de audio a texto), en modo offline: el modelo procesa un segmento completo de audio de una sola vez.
- Inferencia en CPU sin GPU: funciona con sherpa-onnx sin necesidad de PyTorch, NeMo, Triton ni aceleradores.
- Compatibilidad con el pipeline `automatic-speech-recognition` de Hugging Face y con la libreria sherpa-onnx.
- No soporta (no probado o no disponible): audio largo, vocabulario personalizado, etiquetado de hablantes ni transcripcion en streaming.

## Casos de uso

- Transcripcion de grabaciones cortas en japones: al ser un modelo offline transducer, puede transcribir clips de hasta unos 29 segundos con un RTF de 0,06, es decir, procesando audio unas 16 veces mas rapido que en tiempo real en CPU.
- Procesamiento por lotes en servidores sin GPU: gracias a la conversion ONNX, se puede desplegar en maquinas solo con CPU, reduciendo coste de infraestructura frente al modelo original que exige GPU NVIDIA.
- Integracion en aplicaciones moviles o de escritorio Apple Silicon: se ha probado en un Apple M1 Pro con sherpa-onnx, lo que lo hace viable para herramientas locales de dictado o subtitulado.
- Generacion de subtitulos para contenido en japones: la transcripcion por segmentos permite procesar archivos de audio divididos en trozos cortos.
- Punto de partida para cuantizacion propia: el autor ofrece explicitamente este repositorio sin cuantizar como referencia para generar cuantizaciones propias; para produccion directa recomienda la variante cuantizada.
- Pipelines de datos de habla en japones: util para transcribir corpus de audio masivamente en CPU como paso previo a entrenar o evaluar otros modelos.

## Benchmarks y rendimiento

Mediciones del propio autor de la conversion (Apple M1 Pro, 4 hilos, sherpa-onnx 1.13.6, un clip cada vez). Nota importante: el CER aqui es distancia de edicion simple tras NFKC sin normalizacion de kanji/kana ni numerales, por lo que no es comparable con el 6,12% publicado en la model card original.

| Dataset | Clips | CER (conversion) | RTF | CER (original PyTorch en CPU) |
|---|---:|---:|---:|---:|
| FLEURS ja (test, asr-ja-bench v1.1) | 650 | 4,37% | 0,057 | 4,19% |
| ReazonSpeech test (2,7 h aleatorias) | 1.645 | 5,55% | 0,060 | 5,57% |
| SpeechBSD ja (test, asr-ja-bench v1.1) | 2.093 | 6,20% | 0,062 | 6,06% |

En FLEURS la diferencia respecto al original es pequena pero estadisticamente clara (+0,18 puntos, intervalo bootstrap al 95% de +0,02 a +0,37), posiblemente por diferencias en el calculo de caracteristicas log-mel de sherpa-onnx. En los otros dos datasets los intervalos incluyen el cero. La fila de ReazonSpeech puede ser optimista porque forma parte del corpus de entrenamiento del modelo original.

## Requisitos de hardware

- Memoria: pico de RSS del proceso de unos 2,7 GB con clips de hasta 12 s y de 2,86 a 2,99 GB con clips de hasta unos 29 s.
- CPU: probado unicamente en Apple M1 Pro con 4 hilos; otros CPUs, conteos de hilos y versiones de sherpa-onnx no han sido medidos.
- GPU: no necesaria; esta es la ventaja principal de esta conversion frente al original, que requiere GPU NVIDIA en Linux.
- Cabe en equipos consumer sin dedicar GPU, siempre con unos 3 GB de RAM libres para el proceso.
- Despliegue: sherpa-onnx (version probada 1.13.6) via `OfflineRecognizer.from_transducer` con `model_type="nemo_transducer"` y `feature_dim=128`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Rendimiento: RTF de 0,057 a 0,062 con 4 hilos en Apple M1 Pro, procesando un clip cada vez.

## Comparativa con modelos similares

| Modelo | Arquitectura | Plataforma | Licencia | Notas |
|---|---|---|---|---|
| Haas-ja-v1.0-onnx (esta conversion) | FastConformer + Kimi Delta Attention transducer (TDT) | CPU via sherpa-onnx, multiplataforma | Apache 2.0 | 2,5 GB sin cuantizar; CER 4,37% en FLEURS ja |
| Haas-ja-v1.0-onnx-quantized (variante del mismo autor) | Igual, cuantizada | CPU via sherpa-onnx | Apache 2.0 | Cerca de un tercio de la memoria, precision similar; recomendada para la mayoria de usos |
| Haas-ja-v1.0 (original de Third Intelligence) | Igual, pesos originales bfloat16 | Solo Linux con GPU NVIDIA (PyTorch, NeMo, Triton) | Apache 2.0 | CER 6,12% publicado en su model card (metrica no comparable con la de esta conversion) |

## Limitaciones y advertencias

- Conversion no oficial: no esta creada ni respaldada por Third Intelligence; los problemas de precision deben atribuirse con cuidado entre conversion y modelo original.
- Las caracteristicas log-mel que calcula sherpa-onnx difieren de las de NeMo, por lo que las transcripciones no siempre coinciden exactamente con las del modelo original.
- Solo modo offline: el modelo procesa segmentos completos, sin transcripcion en streaming.
- Compatibilidad fragil con sherpa-onnx: no hay soporte dedicado; el modelo se carga por la ruta de Parakeet TDT apoyandose en dos detalles internos (estado aplanado a tensores `[2, B, 20480]` con `pred_hidden=20480` y deteccion TDT via sufijo `#tdt` en el metadata `url`) que una version futura de sherpa-onnx podria romper.
- Validacion limitada: probado en una sola maquina (Apple M1 Pro), con clips de hasta unos 29 segundos; audio largo, vocabulario personalizado, etiquetado de hablantes y otros CPUs no han sido probados.
- La fila de ReazonSpeech en los benchmarks puede ser optimista por contaminacion del corpus de entrenamiento.
- Las limitaciones de la model card original de Third Intelligence tambien aplican.
- Licencia Apache 2.0, sin restricciones de uso comercial, pero se pide atribuir y citar el trabajo original de Third Intelligence.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/oboroge0/Haas-ja-v1.0-onnx
- Modelo original: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Model card original (con datos de entrenamiento y benchmark oficial): https://huggingface.co/third-intelligence/Haas-ja-v1.0#limitations
- Version cuantizada recomendada: https://huggingface.co/oboroge0/Haas-ja-v1.0-onnx-quantized
- sherpa-onnx (GitHub): https://github.com/k2-fsa/sherpa-onnx
- Perfil de Third Intelligence: https://huggingface.co/third-intelligence
