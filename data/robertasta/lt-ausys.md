# RobertasTa/lt-ausys

## Resumen

lt-ausys es un modelo de reconocimiento automático del habla (ASR) para lituano, publicado por RobertasTa como una exportación a ONNX y cuantización int8 del modelo `kristijonas/kmynas-parakeet-lt-v4`. No se trata de un modelo nuevo: el trabajo lingüístico corresponde a Kristijonas Jakubsonas, que ajustó finamente el `nvidia/parakeet-tdt-0.6b-v3` sobre el corpus LIEPA-3 (3.087 horas de la Universidad de Vilna). La aportación de este repositorio es exclusivamente de ingeniería de despliegue: elimina la dependencia de NeMo y PyTorch para que el modelo pueda ejecutarse en CPU con onnxruntime y numpy.

La arquitectura subyacente es un transductor Conformer-TDT (Token-and-Duration Transducer) de aproximadamente 0,6 mil millones de parámetros, con 128 características mel y factor de subsampling 8. Frente a la familia Whisper, que impone una ventana fija de 30 segundos por cada inferencia, un transductor solo procesa el audio que recibe: según el autor, un comando de 2 segundos tarda 0,2 s en un Ryzen 7 8845HS con este modelo, frente a 3,5 s con Whisper large-v3-turbo int8.

El modelo está pensado para asistentes de voz domésticos, en particular Home Assistant mediante el protocolo Wyoming, y para cualquier cliente que necesite transcripción offline de lituano en hardware modesto. La versión publicada (v0) es solo la conversión; el autor anuncia una v1 ajustada con comandos de voz domésticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer-TDT (transductor Token-and-Duration), 128 features mel, subsampling 8 |
| Parametros totales | aproximadamente 0,6 mil millones (modelo base parakeet-tdt-0.6b-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por utterance, sin ventana fija de 30 s) |
| Tipos de cuantizacion | fp32 e int8 (cuantización dinámica QInt8 per-channel solo sobre MatMul) |
| Idiomas soportados | lituano (lt) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder-model.onnx + encoder-model.onnx.data, decoder_joint-model.onnx, variantes .int8.onnx) |

## Arquitectura y entrenamiento

El modelo es un transductor Conformer-TDT. El encoder es un Conformer con atención y convoluciones, exportado en fp32 con los pesos en un fichero externo `.onnx.data` de 2,44 GB; el decoder joint combina la red de predicción y el joint en un único ONNX de 73 MB. La decodificación TDT predice conjuntamente tokens y duraciones, lo que permite emitir varios tokens por paso y procesar únicamente el audio recibido, sin relleno a ventanas fijas.

El entrenamiento original lo realizó Kristijonas Jakubsonas: ajuste fino de `nvidia/parakeet-tdt-0.6b-v3` sobre LIEPA-3 (3.087 horas, Universidad de Vilna), publicado bajo CC BY 4.0. Este repositorio no reentrena nada: exporta el checkpoint `.nemo` con NeMo 3.0.0 en CPU, opset 17, usando el exportador TorchScript legacy (`dynamo=False`), y aplica `onnxruntime.quantization.quantize_dynamic` con `weight_type=QInt8`, `per_channel=True` y `op_types_to_quantize=["MatMul"]`. El decoder se deja en fp32 deliberadamente: cuantizarlo cuesta un comando adicional en el banco de pruebas a cambio de ahorrar solo 54 MB. El vocabulario contiene 8.196 tokens SentencePiece más `<blk>`.

## Capacidades

- Transcripción de voz a texto en lituano con puntuación, mayúsculas y números escritos como palabras.
- Reconocimiento de comandos de voz cortos con latencia baja, adecuado para asistentes domésticos.
- Entrada de audio de 16 kHz mono 16 bits en WAV o arrays numpy float32 con sample rate explícito.
- Ejecución en CPU sin PyTorch ni NeMo, mediante onnx-asr y onnxruntime.
- Integración con Home Assistant a través de un servidor Wyoming incluido en el repositorio complementario.
- Funcionamiento completamente offline.
- No soporta tool calling, agentes, visión, audio de salida ni modos de razonamiento: es exclusivamente ASR.

## Casos de uso

- Asistente de voz doméstico en Home Assistant: el servidor Wyoming del repositorio complementario sirve este modelo a la integración Wyoming de Home Assistant de forma local, con 1,6 GB de RAM en int8, lo que permite desplegarlo en un LXC o mini-PC sin GPU.
- Comandos de voz de baja latencia: al no pagar la ventana fija de 30 segundos de Whisper, un comando de 2 segundos se resuelve en torno a 0,2 s en un Ryzen 7 8845HS, lo que hace viable la interacción conversacional por voz.
- Transcripción offline de reuniones o notas de voz en lituano: el modelo procesa utterances completas y devuelve texto puntuado y con mayúsculas, sin enviar audio a servicios externos.
- Subtitulado y transcripción por lotes en servidores sin GPU: con onnxruntime en CPU y 4 hilos se obtiene un throughput suficiente para procesar archivos de audio en pipelines nocturnos.
- Automatización de accesibilidad: dictado y control por voz de aplicaciones en lituano para usuarios con movilidad reducida, ejecutándose en hardware de bajo coste.
- Investigación en ASR de bajos recursos: sirve como referencia reproducible de exportación ONNX y cuantización selectiva de un transductor Conformer para lenguas bálticas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre FLEURS lituano, split test:

| Modelo | Dataset | WER | CER |
|---|---|---|---|
| lt-ausys | FLEURS (Lithuanian), lt_lt, test | 10,58 | 6,15 |

El autor menciona además mediciones propias en un banco de 127 comandos de voz domésticos (un hablante, altavoz de conferencia) y comparaciones de latencia y RTF frente a Paprika (Whisper large-v3-turbo int8) y faster-whisper-tiny int8 en un Ryzen 7 8845HS con 4 hilos, pero los valores completos de esas tablas no están incluidos en la información disponible. El único dato de exactitud en comandos que se cita explícitamente es 101/119 aciertos para la variante int8 con cuantización solo de MatMul.

## Requisitos de hardware

- RAM estimada: 1,6 GB con int8; 5,8 GB con el checkpoint original `.nemo` en NeMo/PyTorch.
- Tamaño en disco: 882 MB para `encoder-model.int8.onnx` y 73 MB para el decoder int8; 2,44 GB + 42 MB + 73 MB en fp32.
- CPU: el autor reporta 0,2 s por comando de 2 segundos en un AMD Ryzen 7 8845HS con 4 hilos y decodificación greedy.
- GPU: no es necesaria; el modelo está optimizado para CPU. No se han publicado requisitos ni rendimientos en GPU.
- Cabe en cualquier equipo consumer con al menos 2 GB de RAM libre en int8, incluidos mini-PC y contenedores LXC.
- Despliegue: onnx-asr con onnxruntime (`pip install "onnx-asr[cpu,hub]"`), servidor Wyoming propio del autor para Home Assistant. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 0,2 s por comando de 2 s en la máquina de referencia; el resto de cifras de RTF no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | WER FLEURS lt | Licencia | Despliegue |
|---|---|---|---|---|---|
| lt-ausys | ~0,6 B | por utterance (sin ventana fija) | 10,58 | CC BY 4.0 | ONNX CPU (onnxruntime) |
| kristijonas/kmynas-parakeet-lt-v4 | ~0,6 B | por utterance | no disponible en esta ficha | CC BY 4.0 | NeMo + PyTorch (5,8 GB RAM) |
| kristijonas/paprika-whisper-lt-v3 (Whisper large-v3-turbo int8) | no disponible | ventana fija de 30 s | no disponible en esta ficha | no disponible | CTranslate2 / faster-whisper |
| faster-whisper-tiny int8 | no disponible | ventana fija de 30 s | no disponible en esta ficha | no disponible | CTranslate2 |

La comparación cualitativa que aporta el autor es de latencia: 0,2 s frente a 3,5 s para un comando de 2 s en el mismo CPU, con mayor exactitud en comandos para lt-ausys según sus mediciones.

## Limitaciones y advertencias

- Solo reconoce lituano; no es multilingüe.
- Es una conversión, no un modelo nuevo: cualquier sesgo o error del checkpoint original `kmynas-parakeet-lt-v4` se hereda íntegramente.
- Los resultados de FLEURS están marcados como no verificados en el model-index.
- La cuantización int8 se aplicó solo a MatMul; otras recetas redujeron la exactitud en el banco de comandos del autor (de 101 a 96 aciertos de 119) y aumentaron la latencia entre 2 y 4 veces.
- El fichero `decoder_joint-model.int8.onnx` contiene en realidad el decoder fp32; es una convención de nombres de onnx-asr, no una cuantización real.
- Riesgo de alucinación inherente a los modelos ASR, especialmente con audio ruidoso, acentos no vistos o solapamiento de hablantes; el banco de comandos del autor usa un solo hablante y un altavoz de conferencia.
- La licencia CC BY 4.0 permite uso comercial con atribución; es necesario citar a Kristijonas Jakubsonas, NVIDIA y LIEPA-3 según corresponda.
- La v0 no está ajustada específicamente a comandos domésticos; el autor anuncia una v1 para ese fin.
- No hay datos publicados sobre rendimiento en GPU ni sobre throughput en lote.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobertasTa/lt-ausys
- Modelo original: https://huggingface.co/kristijonas/kmynas-parakeet-lt-v4
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio del servidor Wyoming: https://github.com/RobertasTa/lt-ausys
- onnx-asr: https://github.com/istupakov/onnx-asr
- Paprika (Whisper large-v3-turbo lituano): https://huggingface.co/kristijonas/paprika-whisper-lt-v3
