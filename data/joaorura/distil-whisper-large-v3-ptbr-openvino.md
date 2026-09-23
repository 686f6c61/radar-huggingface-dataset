# joaorura/distil-whisper-large-v3-ptbr-openvino

## Resumen

distil-whisper-large-v3-ptbr-openvino es una exportación a formato OpenVINO IR (FP32) del modelo freds0/distil-whisper-large-v3-ptbr, un ajuste fino en portugués de Brasil del modelo destilado distil-whisper/distil-large-v3. El repositorio lo publica el usuario joaorura y no introduce ningún entrenamiento nuevo: es exclusivamente una conversión de formato orientada a inferencia optimizada sobre hardware Intel (CPU, GPU integrada y NPU). El peso de los pesos y del entrenamiento original corresponde a freds0.

El problema que resuelve es el de desplegar reconocimiento automático de voz (ASR) en portugués sobre aceleradores Intel sin depender del stack de PyTorch. La conversión se hizo con optimum-intel 2.2.0 sobre openvino 2026.4.0 y openvino-genai 2026.4.0.0, y el artefacto resultante se consume mediante la clase WhisperPipeline de openvino_genai.

Es relevante ahora porque permite ejecutar ASR en portugués en portátiles con Intel Core Ultra, aprovechando la NPU integrada, con tiempos de inferencia medidos de 2,5 a 2,8 segundos para un audio de 8,35 segundos. El repositorio ocupa 3,0 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) destilado, exportado a OpenVINO IR |
| Parametros totales | no disponible (el repositorio ocupa 3,0 GB en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s (convencion de la familia Whisper); no disponible como dato explicito en la model card |
| Tipos de cuantizacion | FP32 (unica variante publicada en este repositorio) |
| Idiomas soportados | pt (portugues, variante pt-BR) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (openvino_decoder_model.xml/.bin, tokenizer y detokenizer OpenVINO) |

## Arquitectura y entrenamiento

El modelo subyacente es distil-whisper/distil-large-v3, una version destilada de la familia Whisper large-v3 que reduce el numero de capas del decodificador para acelerar la inferencia manteniendo la calidad de transcripcion. Sobre esa base, freds0 realizo un ajuste fino en portugues de Brasil, dando lugar a freds0/distil-whisper-large-v3-ptbr. Este repositorio no modifica ni vuelve a entrenar esos pesos: solo cambia el formato de ejecucion.

La conversion se llevo a cabo con la API Python de optimum-intel mediante OVModelForSpeechSeq2Seq.from_pretrained(..., export=True), dado que el comando optimum-cli export openvino fallo por incompatibilidad de versiones con transformers 5.5.4. El grafo exportado emplea un unico decoder mesclado (openvino_decoder_model.xml/.bin) con use_cache: true en config.json, en lugar de grafos separados de decoder y decoder-with-past. Se generan ademas los ficheros openvino_tokenizer.* y openvino_detokenizer.* para su uso con openvino_genai. No se documenta en la model card informacion sobre composicion del dataset de destilacion, numero de tokens de entrenamiento, ni uso de RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento automatico de voz (ASR) en portugues de Brasil, con salida de texto plano.
- Tarea de transcripcion configurable mediante gen_config.task = "transcribe".
- Soporte de la tarea de traduccion de Whisper a traves del mismo parametro task (la model card solo ejemplifica "transcribe").
- Control explicito del idioma mediante el token especial gen_config.language = "<|pt|>".
- Ejecucion en tres tipos de dispositivo Intel (CPU, GPU integrada y NPU) a traves de la misma API de pipeline.
- Integracion con openvino_genai.WhisperPipeline y soporte de cache de compilacion para NPU mediante CACHE_DIR.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo puramente acustico-a-texto.
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de reuniones en portugues: el modelo procesa el audio en ventanas de 30 segundos y devuelve texto, lo que permite generar actas automaticas de reuniones corporativas en entornos con portatiles Intel Core Ultra.
- Subtitulado de contenido audiovisual pt-BR: integrado en un pipeline de postproduccion, transcribe la pista de audio y produce subtitulos para plataformas de video dirigidas al publico brasileno.
- Atencion al cliente con analitica de llamadas: transcripcion local de grabaciones de call center en portugues para alimentar sistemas de analisis de sentimiento o busqueda, sin enviar audio a servicios en la nube.
- Asistentes de voz en dispositivo (edge): al caber en NPU integrada con inferencias de 2,5 a 2,8 segundos para audio corto, permite dictado y comandos de voz locales en aplicaciones de escritorio.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en tiempo casi real de conversaciones en portugues en aplicaciones de escritorio o movilidad con hardware Intel.
- Documentacion clinica o legal dictada: transcripcion de notas de voz de profesionales que trabajan en portugues, reduciendo la entrada manual en sistemas de gestion.
- Investigacion en PLN para portugues: uso como componente ASR en pipelines de investigacion que necesiten ejecucion reproducible sobre CPU/NPU sin dependencias de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica medicion aportada es de latencia y tiempo de carga sobre hardware Intel Core Ultra 7 265H con un audio de prueba de 8,35 segundos:

| Dispositivo | Tiempo de carga | Tiempo de inferencia | Notas |
|---|---|---|---|
| CPU | 1,9-3,7 s | 5,7-6,8 s | |
| GPU integrada | 6,5 s | 9,9 s | |
| NPU | 2,6-4,4 s | 2,5-2,8 s | Primera compilacion ~122 s; ejecuciones posteriores usan cache en CACHE_DIR |

## Requisitos de hardware

- El repositorio ocupa 3,0 GB en FP32, por lo que se necesita aproximadamente ese espacio en disco y una cantidad de memoria comparable al cargar el modelo en memoria.
- Hardware de referencia medido: Intel Core Ultra 7 265H (CPU, GPU integrada y NPU).
- Cabe en hardware de consumo: cualquier equipo con CPU Intel moderna puede ejecutarlo; la NPU de los procesadores Core Ultra ofrece el mejor tiempo de inferencia observado (2,5-2,8 s).
- Despliegue recomendado mediante openvino_genai.WhisperPipeline, indicando device = "CPU", "GPU" o "NPU".
- Para NPU se recomienda configurar CACHE_DIR en las propiedades del pipeline, ya que la primera compilacion tarda aproximadamente 122 segundos y las ejecuciones posteriores reutilizan la cache.
- No se documentan estimaciones de throughput agregado (segmentos por segundo) ni consumo energetico.
- No se proporcionan requisitos ni pruebas para GPU dedicadas NVIDIA o AMD; el artefacto esta orientado a hardware Intel.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joaorura/distil-whisper-large-v3-ptbr-openvino | no disponible | Ventanas de audio de 30 s (familia Whisper) | OpenVINO IR (FP32) | MIT | HuggingFace |
| freds0/distil-whisper-large-v3-ptbr | no disponible | Ventanas de audio de 30 s (familia Whisper) | PyTorch / safetensors (no confirmado en la informacion) | no disponible | HuggingFace |
| distil-whisper/distil-large-v3 | no disponible | Ventanas de audio de 30 s (familia Whisper) | PyTorch / safetensors (no confirmado en la informacion) | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos (WER, latencia) entre estas variantes en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Las mediciones de rendimiento se realizaron con voz sintetica generada por TTS, no con habla humana real grabada; el comportamiento con audio real puede diferir.
- La calidad de transcripcion depende integramente del modelo original freds0/distil-whisper-large-v3-ptbr; este repositorio solo cambia el formato de ejecucion.
- Solo soporta portugues (pt-BR); no se declaran otros idiomas.
- No se publican metricas de calidad como WER, por lo que no hay evidencia cuantitativa de precision en produccion.
- Solo se distribuye la variante FP32; no hay versiones cuantizadas (INT8, INT4) en este repositorio, lo que limita la optimizacion de memoria y latencia.
- La primera compilacion en NPU tarda aproximadamente 122 segundos; sin cache configurada, este coste se repite.
- Los tiempos de inferencia en GPU integrada (9,9 s para 8,35 s de audio) son peores que en CPU y NPU, por lo que su uso en produccion no es recomendable.
- Al ser una conversion de formato no oficial respecto al autor del modelo base, no existe garantia de soporte ni actualizaciones.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de un despliegue en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/joaorura/distil-whisper-large-v3-ptbr-openvino
- Modelo base (ajuste fino pt-BR): https://huggingface.co/freds0/distil-whisper-large-v3-ptbr
- Modelo destilado de origen: https://huggingface.co/distil-whisper/distil-large-v3
