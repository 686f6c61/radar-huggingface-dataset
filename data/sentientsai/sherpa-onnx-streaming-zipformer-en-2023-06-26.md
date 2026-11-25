# sentientsai/sherpa-onnx-streaming-zipformer-en-2023-06-26

## Resumen

El modelo `sherpa-onnx-streaming-zipformer-en-2023-06-26` es un sistema de reconocimiento automatico del habla (ASR) en ingles con capacidad de transcripcion en streaming, es decir, produce texto a medida que se habla en lugar de esperar al final del audio. La implementacion original procede del proyecto k2-fsa sherpa-onnx (icefall streaming Zipformer), desarrollada por Fangjun Kuang, y esta publicacion concreta la distribuye el repositorio `sentientsai` como parte del componente Audio Core del plugin Sentients para Unreal Engine, seleccionable mediante el enumerado `EAudioModel::StreamingZipformerEn`.

Tecnicamente se trata de un modelo Zipformer en formato ONNX con arquitectura encoder-decoder-joiner (transducer), con un encoder de 250 MiB en fp32 (125,5 MiB en fp16), un decoder de 2 MiB y un joiner de 1 MiB. El modelo consume audio de entrada (`CoreAudioInput`) y devuelve transcripciones (`CoreTranscriptOutput`) en mayusculas y sin puntuacion, con una velocidad declarada de aproximadamente 17 veces tiempo real sobre CPU.

Su relevancia actual radica en que es una pieza de infraestructura lista para produccion en videojuegos y aplicaciones interactivas: los ficheros estan fijados por SHA-256 en un catalogo firmado (`sentientsai/sentients-catalog`), se distribuyen en variantes optimizadas para CPU, DirectML, TensorRT y HLSL, y se integran junto al detector de actividad de voz `silero-vad`. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer streaming (transducer encoder-decoder-joiner) exportado a ONNX |
| Parametros totales | no disponible (el encoder fp32 ocupa 250 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; chunk de 16 y left-context de 128 frames segun el nombre de los ficheros |
| Tipos de cuantizacion | fp32 y fp16 (variante `encoder-...fp16.onnx`); no se documentan GGUF ni int8 |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder, decoder, joiner) y `tokens.txt`; variante `.onnx.hlsl4` para HLSL |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Zipformer de icefall, un transducer de streaming con encoder, predictor (decoder) y joiner. Los nombres de fichero (`encoder-epoch-99-avg-1-chunk-16-left-128`) indican que se trata del checkpoint de la epoca 99 promediado, con chunk de 16 frames y contexto izquierdo de 128 frames, lo que define el comportamiento de baja latencia en streaming. El encoder es la pieza dominante en tamano (250 MiB en fp32), mientras que decoder y joiner son muy ligeros (2 MiB y 1 MiB respectivamente), un reparto tipico de los transducers.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en ASR). La innovacion destacable de esta publicacion no esta en el entrenamiento sino en el empaquetado: los ficheros originales del publicador se acompanan de variantes generadas por scripts propios (`make_fp16.py` para media precision y `SentientsModelsCommandlet.cpp` para el grafo HLSL), con shapes fijas para runtimes que las requieren y un grafo reescrito para ejecucion en Unreal Engine. Cada fichero esta fijado por SHA-256 y el modelo carga ademas los ficheros de `sentientsai/silero-vad`.

## Capacidades

- Reconocimiento automatico del habla en ingles con salida incremental en streaming: las palabras aparecen mientras el hablante continua y cada frase se completa al terminar.
- Transcripcion en mayusculas y sin puntuacion.
- Rendimiento declarado de aproximadamente 17 veces tiempo real sobre CPU.
- Integracion con deteccion de actividad de voz mediante `silero-vad`, cargado junto al modelo.
- Ejecucion en multiples runtimes: CPU, DirectML, TensorRT y HLSL (variante especifica para GPU via shader).
- Entrada y salida definidas por el plugin: `CoreAudioInput` como entrada y `CoreTranscriptOutput` como salida.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento extendido; es exclusivamente un modelo ASR.

## Casos de uso

- Subtitulado en tiempo real en videojuegos: el modelo transcribe el habla del jugador mientras habla (17x tiempo real en CPU) y entrega frases completas, lo que permite mostrar subtitulos con latencia baja dentro de Unreal Engine.
- Comandos de voz en juegos y experiencias interactivas: al integrarse como `EAudioModel::StreamingZipformerEn` en el plugin Sentients, la transcripcion puede alimentar logica de gameplay o menus por voz sin salir del motor.
- Transcripcion de reuniones y notas de voz: la salida en mayusculas sin puntuacion es suficiente para busqueda por palabras clave y resumenes posteriores mediante un LLM.
- Accesibilidad para personas con discapacidad auditiva: generacion de subtitulos en directo en aplicaciones de escritorio o web empaquetadas con ONNX Runtime en CPU.
- Pipelines de voz a texto en local para privacidad: el modelo corre en CPU sin dependencia de servicios en la nube, adecuado para entornos donde el audio no puede salir del dispositivo.
- Prototipado de asistentes conversacionales por voz: combinado con un LLM y un TTS, sirve como etapa ASR de un pipeline completo de voz, con la ventaja de que el detector VAD ya viene integrado.
- Despliegue en GPU con TensorRT o DirectML: la variante fp16 del encoder (125,5 MiB) reduce el uso de memoria para entornos con aceleracion grafica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento proporcionado por el autor es la velocidad de inferencia: aproximadamente 17 veces tiempo real sobre CPU.

## Requisitos de hardware

- VRAM/RAM estimada: el encoder fp32 ocupa 250 MiB y el fp16 125,5 MiB; sumando decoder (2 MiB), joiner (1 MiB) y el detector VAD, el modelo completo cabe holgadamente en menos de 1 GB de memoria.
- CPU: es el runtime principal; el autor declara aproximadamente 17x tiempo real en procesador, por lo que no requiere GPU.
- GPU: variantes para DirectML, TensorRT y HLSL; no se especifican modelos concretos de GPU (A100, H100, RTX 4090, etc.) en la informacion disponible.
- Cabe en cualquier GPU consumer gracias a su tamano inferior a 1 GB, aunque no se documentan cifras de latencia ni throughput por modelo de GPU.
- Opciones de despliegue: ONNX Runtime (CPU, DirectML, TensorRT), HLSL via el shader incluido, y el plugin de Unreal Engine de Sentients; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR de este tipo).

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sherpa-onnx-streaming-zipformer-en-2023-06-26 (esta publicacion) | Zipformer streaming ONNX | encoder 250 MiB fp32 / 125,5 MiB fp16 | Ingles | Apache 2.0 | Hugging Face (`sentientsai`) |
| csukuangfj/sherpa-onnx-streaming-zipformer-en-2023-06-26 (original) | Zipformer streaming ONNX | mismos ficheros base | Ingles | Apache 2.0 | Hugging Face (`csukuangfj`) |
| Whisper (variantes de OpenAI) | Transformer encoder-decoder | desde ~39M hasta ~1,5B parametros | Multilingue | MIT | Hugging Face, multiples runtimes |

La diferencia principal frente al original de `csukuangfj` es el empaquetado: esta version anade la variante fp16, el grafo HLSL, shapes fijas y la fijacion por hash en el catalogo firmado de Sentients. Frente a Whisper, el Zipformer streaming ofrece transcripcion incremental con baja latencia, mientras que Whisper esta orientado a transcripcion por segmentos completos. No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan otros idiomas.
- La salida es en mayusculas y sin puntuacion, lo que limita su uso directo en productos que requieran texto formateado.
- No se han publicado resultados de benchmarks (WER, MMLU, etc.), por lo que no es posible evaluar su precision frente a alternativas sin pruebas propias.
- Al ser un modelo ASR, no tiene capacidades de generacion de texto, razonamiento ni tool calling; cualquier funcionalidad de ese tipo debe aportarla otro componente.
- No se documentan sesgos conocidos ni tasas de alucinacion; en ASR el riesgo tipico es la sustitucion de palabras en audio con ruido o acentos no representados en el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del catalogo firmado de Sentients si se integra con su plugin.
- Los ficheros estan fijados por SHA-256 y no cambian entre revisiones; actualizar el modelo implica una nueva revision, lo que exige gestionar explicitamente las versiones en produccion.
- El rendimiento declarado de 17x tiempo real depende del hardware y del runtime; no se especifican las condiciones exactas de la medicion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sentientsai/sherpa-onnx-streaming-zipformer-en-2023-06-26
- Modelo original de Fangjun Kuang: https://huggingface.co/csukuangfj/sherpa-onnx-streaming-zipformer-en-2023-06-26
- Detector de voz silero-vad usado por el modelo: https://huggingface.co/sentientsai/silero-vad
- Catalogo firmado de Sentients: https://huggingface.co/sentientsai/sentients-catalog
- Proyecto sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
