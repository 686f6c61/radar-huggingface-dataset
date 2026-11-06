# hencohen83/zipformer2-66m-streaming-he-qnn-sm8750

## Resumen

`hencohen83/zipformer2-66m-streaming-he-qnn-sm8750` es una conversión del modelo de reconocimiento de voz en hebreo en streaming `ivrit-ai/zipformer2-66m-streaming-he` (originalmente de Yakov Kolani, con licencia CC-BY-4.0) a binarios de contexto QNN de Qualcomm, con el objetivo de ejecutarlo sobre la NPU Hexagon v79 del Snapdragon 8 Elite (SM8750). No se trata de un modelo nuevo ni de un reentrenamiento: el autor únicamente cambia el formato de despliegue para aprovechar la aceleración por NPU en dispositivos móviles Android de gama alta.

El modelo subyacente es un transducer Zipformer2 de 66 millones de parámetros, entrenado para ASR en streaming sobre audio en hebreo de ivrit.ai y afinado a partir del Zipformer en streaming de icefall (inglés). Decodifica en trozos de 64 frames (1,28 s de audio) y produce transcripciones incrementales, lo que lo hace adecuado para subtitulado en vivo, dictado y asistentes de voz embebidos.

La relevancia de esta variante radica en que demuestra el despliegue de ASR en la NPU de un SoC móvil mediante sherpa-onnx, aunque con un compromiso medido: en una Galaxy S25 procesa 30 s de audio en 2,2 s (más rápido que tiempo real), pero resulta más lento que la versión int8 en CPU (0,98 s) por el coste de ida y vuelta de las llamadas al decodificador y al joiner cada 40 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 transducer (encoder-decoder-joiner) en streaming |
| Parametros totales | 66 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de decodificación en chunks de 64 frames (1,28 s), left context de 256 frames |
| Tipos de cuantizacion | sin cuantización int8; compilado QNN con activaciones de 16 bits y bias de 32 bits |
| Idiomas soportados | hebreo (he) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | binarios de contexto QNN (`encoder.bin`, `decoder.bin`, `joiner.bin`) + `tokens.txt`; export intermedio ONNX con formas fijas |

## Arquitectura y entrenamiento

La arquitectura es un transducer Zipformer2 en configuración streaming, con seis etapas de encoder de dimensiones progresivas (`num-encoder-layers 2,2,3,4,3,2`, `feedforward-dim 512,768,1024,1536,1024,768`, `encoder-dim 192,256,384,512,384,256`, `encoder-unmasked-dim 192,192,256,256,256,192`). El modelo fue entrenado originalmente por Yakov Kolani, afinado desde el Zipformer en streaming de icefall (inglés) sobre audio en hebreo de ivrit.ai; no se dispone de detalles sobre el volumen de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Esta variante no modifica los pesos: parte del checkpoint `model.pt` en precisión completa del repositorio `ivrit-ai/zipformer2-66m-streaming-he` (commit `ee769a2a`), lo exporta a ONNX con formas fijas mediante `zipformer/export-onnx-streaming.py` de icefall (commit `9c96676`) con `--use-int32-inputs 1 --dynamic-batch 0 --enable-int8-quantization 0 --causal 1 --chunk-size 64 --left-context-frames 256`, y lo compila con Qualcomm AI Runtime (QAIRT) 2.40.0.251030 usando `qnn-onnx-converter --act_bitwidth 16 --bias_bitwidth 32` y `qnn-context-binary-generator` para SM8750. Los grafos resultantes se denominan `encoder`, `decoder` y `joiner`.

## Capacidades

- Reconocimiento de voz en streaming en hebreo con salida incremental cada 1,28 s de audio.
- Entrada de audio a 16 kHz mono con características fbank de 80 dimensiones, igual que el modelo original.
- Transcripción de audio continuo sin necesidad de segmentación previa por parte del usuario.
- Ejecución acelerada por NPU Hexagon v79 en Snapdragon 8 Elite (SM8750) mediante sherpa-onnx con `--provider=qnn`.
- Compatibilidad funcional con el resto del ecosistema sherpa-onnx (mismas entradas y salidas que el export int8).
- No soporta tool calling, function calling, agentes, visión, audio multilingüe ni modo de razonamiento; es exclusivamente un modelo ASR monolingüe.

## Casos de uso

- Subtitulado en vivo en aplicaciones Android de gama alta: el modelo decodifica en chunks de 1,28 s y puede alimentar una capa de subtítulos con latencia inferior a dos segundos, aprovechando la NPU para liberar la CPU.
- Dictado por voz en hebreo dentro de apps móviles: la inferencia sobre Hexagon v79 permite mantener la transcripción en el dispositivo sin enviar audio a la nube, con el modelo de 66 M parámetros y un repo de 0,2 GB.
- Asistentes de voz embebidos en hebreo: la salida incremental encaja en pipelines de comandos por voz donde se necesita texto parcial antes de que termine la frase.
- Transcripción de reuniones o notas de voz en dispositivos Snapdragon 8 Elite: el procesamiento a 2,2 s por cada 30 s de audio permite transcribir grabaciones largas en primer plano con consumo moderado.
- Investigación en despliegue de ASR sobre NPU: sirve como referencia reproducible para comparar latencia y precisión frente al mismo modelo en int8 sobre CPU dentro de un mismo dispositivo.
- Evaluación de sherpa-onnx con backend QNN: útil para equipos que quieran validar el flujo `adb shell` + `ADSP_LIBRARY_PATH` antes de integrar ASR en una app Android nativa.
- Prototipado de accesibilidad (transcripción para personas con discapacidad auditiva) en terminales compatibles, siempre que se mida el consumo de batería del caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER sobre conjuntos como Common Voice o FLEURS) en la información disponible. El autor reporta métricas de precisión y velocidad cualitativas sobre una Galaxy S25:

| Metrica | Resultado reportado |
|---|---|
| Precisión en 9 grabaciones en hebreo | Cercana al modelo int8 en CPU (una transcripción idéntica, el resto con pocas palabras de diferencia) |
| Velocidad (NPU, 1 stream) | 2,2 s por cada 30 s de audio |
| Velocidad de referencia (int8 en CPU) | 0,98 s por cada 30 s de audio |
| Frecuencia de llamada a decoder/joiner | Cada 40 ms |

El repositorio base `ivrit-ai/zipformer2-66m-streaming-he` indica que el export int8 de sherpa-onnx obtiene 5,3 / 8,8, sin que la información disponible especifique la métrica exacta a la que corresponde.

## Requisitos de hardware

- NPU Hexagon v79 del Snapdragon 8 Elite (SM8750); los binarios de contexto están ligados al chip y no son portables a otros SoC.
- Runtime QNN 2.40.0.251030: `libQnnHtp.so`, `libQnnHtpV79Skel.so`, `libQnnHtpV79Stub.so` y `libQnnSystem.so` (sherpa-onnx los publica como `qnn-libs-2.40.0.251030`); deben estar accesibles vía `ADSP_LIBRARY_PATH`.
- Tamaño en disco: 0,2 GB de repositorio; `encoder.bin` ocupa 154.628.096 bytes, `decoder.bin` 2.179.072 bytes y `joiner.bin` 1.601.536 bytes.
- No cabe ni está pensado para GPU de escritorio (A100, H100, RTX 4090): el formato QNN es específico de la NPU móvil.
- Despliegue mediante sherpa-onnx con `--provider=qnn`; no se contemplan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Throughput medido: 2,2 s por 30 s de audio en un solo stream en Galaxy S25; el autor recomienda medir el consumo de batería antes de preferir la NPU frente a la CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| hencohen83/zipformer2-66m-streaming-he-qnn-sm8750 | 66 M | QNN context binaries (16-bit act.) | NPU SM8750 | CC-BY-4.0 | 2,2 s / 30 s de audio en Galaxy S25 |
| ivrit-ai/zipformer2-66m-streaming-he | 66 M | ONNX int8 y export full-precision | CPU (sherpa-onnx/onnxruntime) | CC-BY-4.0 | 0,98 s / 30 s de audio en el mismo dispositivo; precisión de referencia |
| thewh1teagle/zipformer2-66m-streaming-he | 66 M | ONNX int8 (sherpa-onnx) | CPU | CC-BY-4.0 | Repositorio original del autor del modelo |

## Limitaciones y advertencias

- Solo reconoce hebreo; no hay soporte multilingüe.
- Los binarios están atados al SM8750 y a QAIRT 2.40.0.251030; cambiar de chip o de versión del runtime exige recompilar.
- El autor no reporta evaluación WER formal: la validación se limita a 9 grabaciones comparadas cualitativamente con el modelo int8.
- En el dispositivo probado la NPU es más lenta que la CPU con int8 (2,2 s frente a 0,98 s por 30 s de audio), por lo que la elección de backend debe basarse en mediciones propias.
- Riesgo de errores de transcripción y alucinaciones propias de un modelo ASR de 66 M parámetros, especialmente en audio ruidoso o con acentos no representados en el corpus de ivrit.ai.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución a Yakov Kolani e ivrit.ai con la mención indicada por el autor; las librerías QNN de Qualcomm no se distribuyen en el repositorio y están sujetas a sus propios términos.
- El repositorio no incluye documentación sobre sesgos del corpus de entrenamiento ni sobre el rendimiento en dominios específicos (médico, legal, nombres propios).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hencohen83/zipformer2-66m-streaming-he-qnn-sm8750
- Modelo base: https://huggingface.co/ivrit-ai/zipformer2-66m-streaming-he
- Repositorio original del autor: https://huggingface.co/thewh1teagle/zipformer2-66m-streaming-he
- ivrit.ai: https://www.ivrit.ai
- Modelo icefall de origen (inglés): https://huggingface.co/Zengwei/icefall-asr-librispeech-streaming-zipformer-2023-05-17
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Commit del checkpoint usado: https://huggingface.co/ivrit-ai/zipformer2-66m-streaming-he/tree/ee769a2a13b887f91572eec349458bfb0fe79e7a
