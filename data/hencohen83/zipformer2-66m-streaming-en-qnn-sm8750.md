# hencohen83/zipformer2-66m-streaming-en-qnn-sm8750

## Resumen

zipformer2-66m-streaming-en-qnn-sm8750 es un paquete de inferencia para reconocimiento automatico del habla (ASR) en ingles, en modo streaming, empaquetado como binarios de contexto QNN para la NPU Hexagon v79 del Snapdragon 8 Elite (SM8750). No es un modelo entrenado desde cero: es una recompilacion del checkpoint original de icefall, el Zipformer2 streaming en ingles de 66 millones de parametros desarrollado por Zengwei Yao y el equipo k2-fsa, exportado a ONNX con formas fijas y compilado con Qualcomm AI Runtime (QAIRT) 2.40.0.251030 en precision de 16 bits para activaciones y 32 bits para sesgos.

El interes practico esta en el formato: los ficheros `encoder.bin`, `decoder.bin` y `joiner.bin` son context binaries ligados al chip SM8750 y a la version exacta del runtime QNN, pensados para ejecutarse con sherpa-onnx en un telefono Android mediante `adb shell`. Esto permite ASR local, sin conexion y de baja latencia en el propio dispositivo, sin depender de la CPU ni de la GPU.

El modelo subyacente es un transducer (RNN-T) con arquitectura Zipformer2 de seis etapas, atencion causal, chunk de 64 frames (1,28 s de audio) y contexto izquierdo de 256 frames. El vocabulario es BPE de 500 unidades y la salida es texto en mayusculas y sin puntuacion, heredado de las transcripciones de LibriSpeech. La licencia es Apache-2.0 y el repo ocupa 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 streaming, transducer (RNN-T) encoder-decoder-joiner con atencion causal |
| Parametros totales | 66 M (aproximado, segun nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | contexto izquierdo de 256 frames; chunk de 64 frames (1,28 s de audio por paso) |
| Tipos de cuantizacion | sin cuantizacion int8; QNN con activaciones de 16 bits y sesgos de 32 bits |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | binarios de contexto QNN (`encoder.bin`, `decoder.bin`, `joiner.bin`) y `tokens.txt`; export ONNX intermedio con formas fijas |

## Arquitectura y entrenamiento

La arquitectura es un transducer Zipformer2 con seis etapas de encoder de dimensiones `2,2,3,4,3,2` capas, `feedforward-dim` de `512,768,1024,1536,1024,768`, `encoder-dim` de `192,256,384,512,384,256` y `encoder-unmasked-dim` de `192,192,256,256,256,192`. El decoder y el joiner son ligeros: 1,16 MB y 0,58 MB respectivamente, frente a los 154,6 MB del encoder. El modelo es causal (`--causal 1`), lo que habilita la decodificacion en streaming con un chunk de 64 frames y un contexto izquierdo de 256 frames.

El entrenamiento original lo realizo el equipo k2-fsa con icefall sobre LibriSpeech (CC-BY-4.0), un corpus de audiolibros en ingles. La model card no detalla el numero de tokens de entrenamiento ni si hubo etapas de ajuste adicionales; esa informacion no esta disponible en el material proporcionado. La innovacion tecnica de este repo no esta en el entrenamiento sino en el despliegue: exportacion ONNX con formas fijas y sin cuantizacion int8 (`--use-int32-inputs 1 --dynamic-batch 0 --enable-int8-quantization 0`), seguida de conversion con `qnn-onnx-converter --act_bitwidth 16 --bias_bitwidth 32` y generacion de context binaries con `qnn-context-binary-generator` para SM8750 usando `scripts/qnn/generate_config.py` de sherpa-onnx. Los grafos se nombran `encoder`, `decoder` y `joiner`.

## Capacidades

- Reconocimiento automatico del habla en ingles en modo streaming, con entrada de audio mono a 16 kHz y features fbank de 80 dimensiones.
- Decodificacion incremental por chunks de 1,28 s de audio, adecuada para dictado y subtitulado en tiempo real.
- Transcripcion con vocabulario BPE de 500 unidades; salida en mayusculas y sin puntuacion.
- Ejecucion en la NPU Hexagon v79 del Snapdragon 8 Elite mediante el backend QNN de sherpa-onnx.
- Integracion con la CLI de sherpa-onnx en Android (`adb shell`) mediante los flags `--provider=qnn`, `--transducer.qnn-backend-lib`, `--transducer.qnn-system-lib` y `--transducer.qnn-context-binary`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio mas alla del ASR; no es un modelo de lenguaje generativo.
- Multilingue: no. Solo ingles.

## Casos de uso

- Dictado por voz en aplicaciones Android: el modelo procesa audio en streaming con chunks de 1,28 s y se ejecuta en la NPU, lo que libera CPU y GPU y reduce el consumo energetico en movil.
- Subtitulado en directo de reuniones o clases en ingles: la naturaleza causal y el contexto izquierdo de 256 frames permiten transcripcion incremental con latencia de pocos segundos.
- Asistentes de voz sin conexion: al no requerir red, encaja en escenarios de privacidad estricta donde el audio no puede salir del dispositivo.
- Notas de voz y transcripcion de audiolibros en ingles: el modelo original fue entrenado sobre LibriSpeech, por lo que el dominio de lectura y habla clara es su punto fuerte.
- Preprocesado de comandos de voz en dispositivos embebidos con Snapdragon 8 Elite: integrable en pipelines nativos via sherpa-onnx sin servidor.
- Investigacion en despliegue de ASR en NPU: sirve como referencia reproducible de exportacion ONNX a QNN con precision mixta 16/32 bits y configuracion de context binaries.
- Evaluacion comparativa de backends: permite medir en el mismo dispositivo la diferencia entre inferencia en CPU, GPU y NPU para un mismo modelo Zipformer2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el export ONNX, decodificado en PC con los grafos exportados, produce el mismo texto que el modelo int8 de sherpa-onnx en sus clips de test de LibriSpeech. Tambien menciona que la misma pipeline aplicada a un modelo en hebreo de la misma arquitectura decodifico 30 s de audio en 2,2 s para un solo stream en un Galaxy S25, pero ese dato corresponde a otro modelo y no debe atribuirse a este.

## Requisitos de hardware

- NPU objetivo: Hexagon v79 del Snapdragon 8 Elite (SM8750). Los context binaries estan ligados al chip y no funcionan en otras plataformas.
- Runtime: librerias QNN 2.40.0.251030 (`libQnnHtp.so`, `libQnnHtpV79Skel.so`, `libQnnHtpV79Stub.so`, `libQnnSystem.so`), publicadas por sherpa-onnx como `qnn-libs-2.40.0.251030`. Deben apuntarse desde `ADSP_LIBRARY_PATH`.
- VRAM: no aplica; el modelo se ejecuta en la NPU del SoC movil. El repo pesa 0,2 GB y el encoder ocupa 154,6 MB.
- GPU de escritorio: no es el destino de estos binarios. Para probar el modelo en PC hay que usar el export ONNX intermedio o el modelo int8 de sherpa-onnx, no los `.bin` de QNN.
- Despliegue: sherpa-onnx con `--provider=qnn` en Android; en PC, sherpa-onnx con el modelo ONNX equivalente.
- Latencia y throughput: no disponibles para este paquete concreto en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| zipformer2-66m-streaming-en-qnn-sm8750 (este) | 66 M | contexto izq. 256 frames, chunk 64 frames | QNN context binaries | Apache-2.0 | NPU SM8750 |
| Zengwei/icefall-asr-librispeech-streaming-zipformer-2023-05-17 | 66 M | mismo modelo base | checkpoint PyTorch / ONNX | Apache-2.0 | CPU/GPU |
| csukuangfj/sherpa-onnx-streaming-zipformer-en-2023-06-26 | 66 M | mismo modelo base | ONNX int8 | Apache-2.0 | CPU |
| hencohen83/zipformer2-66m-streaming-he-qnn-sm8750 | 66 M | misma arquitectura, idioma hebreo | QNN context binaries | Apache-2.0 | NPU SM8750 |

La diferencia frente a las alternativas no esta en calidad o tamano, sino en el backend: este paquete es el unico de la lista que ejecuta en la NPU Hexagon, a costa de perder portabilidad.

## Limitaciones y advertencias

- Solo ingles. No hay soporte multilingue ni cambio de idioma.
- Salida sin puntuacion y en mayusculas, heredada de LibriSpeech; requiere postprocesado si se necesita texto formateado.
- Entrenado sobre LibriSpeech (audiolibros), por lo que el rendimiento puede degradarse con acentos marcados, ruido de fondo, habla espontanea o audio telefonico.
- Riesgo de alucinacion y errores en nombres propios, siglas y terminos tecnicos, comun en modelos transducer pequenos.
- Los binarios estan acoplados al chip SM8750 y a la version QAIRT 2.40.0.251030; no son portables a otros SoC ni a versiones distintas del runtime.
- Las librerias QNN necesarias son de Qualcomm y no se incluyen en el repo; hay que obtenerlas por separado.
- Licencia Apache-2.0 permite uso comercial, pero se debe atribuir al modelo original: "icefall streaming Zipformer by Zengwei Yao, k2-fsa (Apache-2.0), trained on LibriSpeech (CC-BY-4.0)".
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente.
- No dispone de benchmarks publicados; la unica validacion reportada es la equivalencia de texto con el modelo int8 de sherpa-onnx en clips de LibriSpeech.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hencohen83/zipformer2-66m-streaming-en-qnn-sm8750
- Modelo base: https://huggingface.co/Zengwei/icefall-asr-librispeech-streaming-zipformer-2023-05-17
- Export ONNX de sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-streaming-zipformer-en-2023-06-26
- Version en hebreo con la misma pipeline: https://huggingface.co/hencohen83/zipformer2-66m-streaming-he-qnn-sm8750
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- icefall: https://github.com/k2-fsa/icefall
- LibriSpeech: https://www.openslr.org/12
