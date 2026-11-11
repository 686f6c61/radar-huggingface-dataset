# mlboydaisuke/nemotron-asr-streaming-farsi-LiteRT

## Resumen

`mlboydaisuke/nemotron-asr-streaming-farsi-LiteRT` es una conversión a LiteRT (`.tflite`) del modelo de reconocimiento automático del habla en persa `mehdi-hf/nemotron-asr-streaming-farsi`, a su vez un fine-tune de `nvidia/nemotron-3.5-asr-streaming-0.6b`. El objetivo es ejecutar ASR en streaming en dispositivos Android, aprovechando los aceleradores NPU y GPU del terminal mediante las herramientas `litert-torch` 0.10.0 y `ai-edge-quantizer` 0.10.0 sobre LiteRT 2.3.0. El modelo transcribe audio persa en fragmentos de 320 ms a medida que llegan, con un look-ahead de 0,32 s.

La arquitectura subyacente es un encoder FastConformer cache-aware de 24 capas con decodificador RNN-T y *language prompt*, adaptado al persa mediante un tokenizador nuevo de 1.024 piezas y un decodificador reentrenado. La conversión mantiene el diseño de streaming original: todas las cachés (atención, convolución y subsampling) son entradas y salidas del grafo, de modo que el host transporta el estado entre fragmentos. Los grafos se exportaron como módulos PyTorch planos que leen los pesos del checkpoint, sin dependencia de NeMo.

La relevancia actual reside en que demuestra ASR en streaming de calidad casi idéntica al original float32 (9,138 % de WER en NPU frente a 9,045 % en PyTorch float32 sobre FLEURS persa) con latencias de 26,6 ms por fragmento en NPU de un Galaxy S26, lo que habilita transcripción en tiempo real en móvil sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (24 capas) + decodificador RNN-T con language prompt |
| Parametros totales | no disponible (modelo base de 0,6B; el conformer en float32 ocupa 2,35 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | streaming por fragmentos de 320 ms con look-ahead de 0,32 s (lookahead 3); sin ventana global declarada |
| Tipos de cuantizacion | float32 (conformer y decoder), float16 (conformer CPU/GPU/NPU con LayerNorm rescalado) |
| Idiomas soportados | persa (fa) |
| Licencia | OpenMDW License Agreement 1.1 (`openmdw-1.1`) |
| Formato de pesos | `.tflite` (LiteRT); tokenizer en `tokenizer.json` |
| Frecuencia de muestreo | 16 kHz mono |
| Tamano del repositorio | 6,0 GB |
| Libreria | litert (LiteRT 2.3.0) |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento nuevo. El original `mehdi-hf/nemotron-asr-streaming-farsi` parte de `nvidia/nemotron-3.5-asr-streaming-0.6b`, un encoder FastConformer cache-aware con decodificador RNN-T y *language prompt*, y lo fine-tunea para persa con un tokenizador nuevo de 1.024 piezas y un decodificador reentrenado, usando el prompt `fa-IR` del modelo base. No se dispone de datos sobre el volumen de tokens de audio, la composición del dataset de fine-tune ni si se aplicaron técnicas de RLHF o DPO.

La conversión a LiteRT preserva el diseño de streaming: el audio se procesa en fragmentos de 320 ms (5.120 muestras nuevas por fragmento, tras un primer fragmento de 4.040 muestras), cada uno produce 4 frames de encoder. El pipeline es audio 16 kHz mono → mel → subsampling 8× → conformer → RNN-T greedy → texto. Las cachés de atención (`k_cache`/`v_cache` de forma [24, 8, 56, 128]), convolución (`conv_cache` [24, 1024, 8]) y subsampling (`cache0`, `cache1`, `cache2`) se declaran como entradas y salidas del grafo, con máscara `neg_mask` de −30.000 en las posiciones aún no rellenadas. Los grafos se exportaron con `litert-torch` como módulos PyTorch planos que leen los pesos del checkpoint sin NeMo; para float16 se rescalaron las entradas de LayerNorm para evitar desbordamiento y se reescribieron los matmul de posición relativa como capas fully connected para que XNNPACK ejecute en float16 (4.090 de 4.093 nodos).

## Capacidades

- Reconocimiento automático del habla en persa (farsi) en streaming, con salida incremental cada 320 ms.
- Transcripción de audio de 16 kHz mono con look-ahead de 0,32 s, adecuada para dictado y subtitulado en vivo.
- Decodificación RNN-T greedy con tokenizador persa de 1.024 piezas.
- Soporte de *language prompt* (`fa-IR`) heredado del modelo base.
- Ejecución en NPU, GPU y CPU de dispositivos Android mediante LiteRT.
- No soporta tool calling, function calling, agentes, visión ni audio multilingüe; es un modelo ASR monolingüe especializado.

## Casos de uso

- Dictado por voz en aplicaciones Android: el modelo procesa fragmentos de 320 ms con 26,6 ms de latencia mediana en NPU, lo que permite transcripción prácticamente en tiempo real sin conexión a la red.
- Subtitulado en directo de contenido en persa: el diseño de streaming con look-ahead de 0,32 s y cachés persistentes permite generar subtítulos incrementales con retardo inferior a un segundo.
- Asistentes de voz integrados en el dispositivo: al ejecutarse en NPU/GPU local con grafos de 1,23 GB, evita enviar audio a servidores y reduce costes y latencia de red.
- Transcripción de reuniones y notas de voz: el runner de línea de comandos para Android (`nemotron_stream_runner.cc`) permite integrar la transcripción en flujos de trabajo de grabación y posprocesado.
- Accesibilidad para usuarios persa-hablantes: conversión de voz a texto en tiempo real en terminales de gama alta con NPU (por ejemplo, Galaxy S26) para personas con discapacidad auditiva.
- Investigación en ASR eficiente en el borde: el repositorio sirve como referencia reproducible de exportación de un FastConformer+RNN-T con cachés explícitas a LiteRT, útil para estudiar compromisos entre float16/float32 y NPU/GPU/CPU.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| WER en FLEURS persa (test, 852 utterances), NPU Galaxy S26, float16 | 9,138 % |
| WER en FLEURS persa (test, 852 utterances), PyTorch float32 del original | 9,045 % |
| Latencia mediana por fragmento de 320 ms, NPU Galaxy S26 | 26,6 ms |
| Latencia mediana por fragmento de 320 ms, GPU Galaxy S26 | 60,3 ms |
| Latencia mediana por fragmento de 320 ms, CPU Galaxy S26 (float16) | 58,5 ms |

Las mediciones de latencia corresponden a ejecuciones cortas de 10 a 25 utterances realizadas el 2026-11-08 con la API C de LiteRT 2.3.0 sobre los `.tflite` de este repositorio, no sobre LiteRT-LM ni otras conversiones. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 1,27 GB para el conjunto de CPU (`mel` + `pre` + `conformer_f16_cpu` + `decoder_f32`), 1,23 GB para NPU (`mel` + `conformer_pre_f16` + `decoder_f32`) y GPU (`mel` + `pre` + `conformer_f16` + `decoder_f32`), y 2,40 GB para el ejemplo Python en escritorio (`mel` + `pre` + `conformer_f32` + `decoder_f32`).
- GPU recomendadas: no se especifican modelos de escritorio; las mediciones se realizaron en un Samsung Galaxy S26 (NPU, GPU y CPU del SoC).
- Cabe en GPU de consumo: no hay datos publicados para RTX 4090, A100 o H100; el objetivo declarado es Android.
- Opciones de despliegue: LiteRT 2.3.0 con la API C en Android (runner incluido `nemotron_stream_runner.cc` y `build_android.sh`); ejemplo Python en escritorio con los `.tflite` float32.
- Latencia y throughput: 26,6 ms por fragmento de 320 ms en NPU (≈12× tiempo real), 60,3 ms en GPU y 58,5 ms en CPU float16, según mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | WER persa | Licencia | Despliegue |
|---|---|---|---|---|---|
| nemotron-asr-streaming-farsi-LiteRT (este) | base 0,6B | fragmentos 320 ms, look-ahead 0,32 s | 9,138 % (NPU f16) | OpenMDW 1.1 | LiteRT Android (NPU/GPU/CPU) |
| mehdi-hf/nemotron-asr-streaming-farsi | base 0,6B | fragmentos 320 ms, look-ahead 0,32 s | 9,045 % (PyTorch f32) | no disponible | PyTorch / NeMo |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0,6B | streaming cache-aware | no disponible (multilingüe) | no disponible | NeMo |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo persa (`fa`); no transcribe otros idiomas.
- Riesgo de alucinación y errores de transcripción inherentes al ASR, con WER de referencia del 9,138 % en FLEURS; el rendimiento puede degradarse en audio ruidoso, acentos no vistos o dominios especializados.
- Las latencias publicadas son de ejecuciones cortas (10 a 25 utterances) en un Galaxy S26; no hay garantía de que se mantengan en otros dispositivos o cargas prolongadas.
- El autor indica que la velocidad «sigue ajustándose», por lo que los artefactos y cifras pueden cambiar.
- La licencia OpenMDW 1.1 debe revisarse antes de uso comercial; el repositorio incluye `LICENSE` y `NOTICE` del original sin modificar.
- No se dispone de información sobre sesgos demográficos o dialectales del fine-tune persa.
- El modelo no incluye capacidades de puntuación, diarización ni traducción; el runner entrega ids de token que `rnnt_text.py` convierte a texto.
- Dependencia de LiteRT 2.3.0 y de la API C para Android; no se garantiza compatibilidad con LiteRT-LM u otras conversiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/nemotron-asr-streaming-farsi-LiteRT
- Modelo base del fine-tune: https://huggingface.co/mehdi-hf/nemotron-asr-streaming-farsi
- Modelo original de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW 1.1: https://huggingface.co/mlboydaisuke/nemotron-asr-streaming-farsi-LiteRT/blob/main/LICENSE
- LiteRT (documentación): no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
