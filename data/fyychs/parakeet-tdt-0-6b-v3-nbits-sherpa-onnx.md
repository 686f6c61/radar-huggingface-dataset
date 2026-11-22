# fyychs/parakeet-tdt-0.6b-v3-nbits-sherpa-onnx

## Resumen

Parakeet TDT 0.6B v3 (nbits) es una exportación cuantizada del encoder del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3`, preparada por el usuario `fyychs` para su uso con la librería sherpa-onnx. El modelo original lo desarrolla NVIDIA y emplea una arquitectura TDT (Token-and-Duration Transducer), una variante de los transductores RNN que predice conjuntamente tokens y duraciones, lo que permite decodificación no autorregresiva rápida. Con 0,6 mil millones de parámetros, está diseñado para transcripción multilingüe en 25 idiomas europeos.

La aportación de este repositorio no es un modelo nuevo, sino una cuantización por bloques de 32 elementos (operador `MatMulNBits` de onnxruntime) de las 217 matrices de pesos constantes del encoder, en versiones de 8 y 4 bits. El resto de la red (convoluciones, entradas y salidas) permanece en fp32, de modo que cada fichero sustituye directamente al encoder fp32 o int8 en un pipeline sherpa-onnx existente.

Es relevante porque resuelve un problema práctico de despliegue: la cuantización int8 dinámica del export original degrada gravemente el habla lejana (acuerdo de transcripción del 28 % y 7 % frente al 72-73 % del fp32 en la prueba del autor), mientras que la cuantización por bloques mantiene la precisión con un tercio de la memoria (1,5 GB de pico frente a 3,0 GB del fp32).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), encoder basado en transformer con convoluciones; export ONNX |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Encoder en 8 bits y 4 bits con `MatMulNBits` (bloques de 32, simetrico); decoder y joiner en int8 (export de referencia) |
| Idiomas soportados | 25: bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder q8 y q4; decoder y joiner int8; tokens.txt) |

## Arquitectura y entrenamiento

El modelo base es un transductor TDT de NVIDIA: un encoder (transformer con capas convolucionales) que procesa el audio, un decoder de predicción y un joiner que combina ambos para emitir tokens y duraciones de forma conjunta. Esta formulación TDT permite emitir varios tokens por paso y decodificar de manera más eficiente que un transductor RNN-T clásico. El modelo base tiene 0,6 mil millones de parámetros y está entrenado para ASR multilingüe en 25 idiomas europeos.

Este repositorio no reentrena ni modifica el modelo: parte del export fp32 para sherpa-onnx (`csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3`) y aplica `MatMulNBitsQuantizer(model, bits=8|4, block_size=32, is_symmetric=True, op_types_to_quantize=("MatMul",))` de onnxruntime 1.32 a las 217 de las 289 MatMuls con pesos constantes. Las convoluciones y el resto de operaciones se mantienen en fp32, igual que las entradas y salidas, lo que garantiza compatibilidad directa con sherpa-onnx. No se dispone de información sobre el dataset de entrenamiento original, número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 25 idiomas europeos.
- Decodificación TDT con predicción conjunta de tokens y duraciones, orientada a inferencia rápida en CPU.
- Funcionamiento en tiempo real: factor de tiempo real (RTF) de 0,06-0,08 en CPU x86 con 4 hilos según las mediciones del autor.
- Integración con VAD externo (Silero VAD) para segmentación de audio en aplicaciones de dictado.
- Sustitución directa del encoder en pipelines sherpa-onnx existentes (mismo contrato de entradas y salidas).
- Compatible con onnxruntime 1.28.2 (incluido en sherpa-onnx 2.0.1) en Linux, Android e iOS.
- No soporta tool calling, agentes, visión ni audio generativo; es exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y clases: el encoder de 8 bits mantiene el acuerdo de transcripción del fp32 (73/65 frente a 72/65 en la prueba del autor) con 1,5 GB de memoria pico, lo que permite ejecutarlo en portátiles sin GPU.
- Dictado en aplicaciones de escritorio: con un RTF de 0,08 en CPU x86 de 4 hilos, el modelo transcribe audio en tiempo real con latencia despreciable, adecuado para integrarse en editores de texto mediante sherpa-onnx.
- Subtitulado y transcripción en dispositivos Android: el operador `MatMulNBits` está disponible en onnxruntime para Android, y la versión de 4 bits (0,68 GB) reduce el uso de memoria a 1,4 GB pico, viable en móviles de gama media.
- Procesamiento por lotes de archivos de audio multilingües: al cubrir 25 idiomas europeos, un único pipeline puede transcribir contenido en alemán, francés, polaco o griego sin cambiar de modelo.
- Transcripción de audio lejano (salas, conferencias): la cuantización por bloques evita la pérdida de calidad del int8 dinámico en habla captada a distancia, según la comparativa del autor.
- Despliegue en entornos con memoria limitada: la versión de 4 bits cabe en dispositivos con 4 GB de RAM donde el encoder fp16 no carga (el autor reporta que falla en un iPad de 4 GB).
- Integración en servicios de accesibilidad: transcripción en tiempo real de conversaciones para personas con discapacidad auditiva, con bajo consumo de CPU.

## Benchmarks y rendimiento

El autor publica una comparativa sobre una clase universitaria alemana grabada con un teléfono (sherpa-onnx 2.0.1, CPU x86, 4 hilos, Silero VAD con umbral 0,2, acuerdo de palabras con doce transcripciones de referencia):

| Encoder | Acuerdo A / B | Tamano fichero | Memoria pico | RTF |
|---|---|---|---|---|
| fp32 (export sherpa-onnx) | 72 / 65 | 2,5 GB | 3,0 GB | 0,07 |
| fp16 | 73 / 65 | 1,3 GB | 4,2 GB | 0,06 |
| 8 bits, bloques de 32 (este repo) | 73 / 65 | 0,95 GB | 1,5 GB | 0,08 |
| 4 bits, bloques de 32 (este repo) | 72 / 65 | 0,68 GB | 1,4 GB | 0,06 |
| int8 (export sherpa-onnx) | 28 / 7 | 0,65 GB | 1,3 GB | 0,05 |

No se han publicado resultados de benchmarks estándar (WER en LibriSpeech, Common Voice, etc.) en la información disponible, ni mediciones de velocidad en dispositivos ARM.

## Requisitos de hardware

- VRAM/RAM estimada: 1,5 GB de memoria pico con el encoder de 8 bits y 1,4 GB con el de 4 bits (medido en CPU x86); el fp32 requiere 3,0 GB.
- GPU: no se requiere GPU; el modelo está pensado para inferencia en CPU mediante onnxruntime.
- Cabe en GPUs de consumo y en dispositivos móviles: el encoder de 4 bits funciona en equipos con 4 GB de RAM donde el fp16 no carga.
- Despliegue: sherpa-onnx 2.0.1 o superior (incluye onnxruntime 1.28.2 con soporte de `MatMulNBits` en Linux, Android e iOS). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: RTF de 0,06-0,08 en CPU x86 con 4 hilos, es decir, entre 12 y 16 veces más rápido que el tiempo real. Sin mediciones en ARM.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Memoria pico (encoder) | Licencia |
|---|---|---|---|---|---|
| Este repo (8 bits) | 0,6 B | 25 europeos | ONNX q8 | 1,5 GB | CC BY 4.0 |
| Este repo (4 bits) | 0,6 B | 25 europeos | ONNX q4 | 1,4 GB | CC BY 4.0 |
| Export int8 sherpa-onnx | 0,6 B | 25 europeos | ONNX int8 | 1,3 GB | CC BY 4.0 |
| Export fp32 sherpa-onnx | 0,6 B | 25 europeos | ONNX fp32 | 3,0 GB | CC BY 4.0 |
| Export fp16 sherpa-onnx | 0,6 B | 25 europeos | ONNX fp16 | 4,2 GB | CC BY 4.0 |

No se dispone de datos para comparar con otros modelos ASR de tamaño similar (por ejemplo, Whisper large-v3 o Canary) en la información proporcionada.

## Limitaciones y advertencias

- Solo se han cuantizado las MatMuls con pesos constantes; el resto del encoder permanece en fp32, por lo que el ahorro de memoria es parcial respecto a una cuantización completa.
- Las mediciones de velocidad y precisión provienen de una única prueba del autor (una clase en alemán), no de un conjunto de evaluación estandarizado.
- No hay mediciones de rendimiento en dispositivos ARM; el comportamiento en móviles y tablets no está verificado.
- La cuantización a 4 bits muestra un acuerdo ligeramente inferior al fp32 (72/65 frente a 72/65 en A y 65 en B, prácticamente idéntico, pero sin margen de mejora).
- Requiere onnxruntime con el operador `MatMulNBits`; versiones antiguas de sherpa-onnx u onnxruntime no cargarán el modelo.
- El modelo base puede presentar sesgos propios de los datos de entrenamiento de NVIDIA, no documentados en esta ficha.
- Riesgo de alucinación en audio con ruido extremo o fuera de los 25 idiomas cubiertos; el comportamiento en idiomas no soportados no está documentado.
- Licencia CC BY 4.0: permite uso comercial con atribución a NVIDIA (modelo base) y al proyecto k2-fsa (export), pero no se especifican restricciones adicionales del autor de la cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fyychs/parakeet-tdt-0.6b-v3-nbits-sherpa-onnx
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export fp32 para sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3
- Export int8 para sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
