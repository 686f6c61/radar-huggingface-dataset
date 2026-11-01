# pdnhan/PhoWhisper-small-mobile

## Resumen

PhoWhisper-small-mobile es una exportación a ONNX del modelo de reconocimiento automático del habla (ASR) `vinai/PhoWhisper-small`, un fine-tune en vietnamita de Whisper-small desarrollado por VinAI Research. El modelo original cuenta con 244 millones de parámetros y está especializado en transcripción de audio en vietnamita. Esta versión, publicada por el usuario `pdnhan`, no modifica los pesos: únicamente cambia el formato (ONNX, opset 17, IR version 9) y ofrece variantes cuantizadas a int8 para su despliegue en dispositivos móviles Android e iOS mediante ONNX Runtime.

La relevancia de esta ficha radica en que permite ejecutar un modelo ASR de calidad en el propio dispositivo (on-device), sin depender de servicios en la nube, reduciendo latencia y preservando la privacidad del audio. Los ficheros int8 ocupan 98,1 MB (encoder) y 195,1 MB (decoder), lo que los hace viables en terminales móviles convencionales. La exportación utiliza exclusivamente operadores estándar de ONNX, por lo que no requiere librerías de operadores personalizados.

El modelo está pensado para aplicaciones móviles de transcripción de voz en vietnamita: notas de voz, subtitulado en tiempo real, asistentes por voz o accesibilidad. Al derivar de Whisper-small, hereda su arquitectura encoder-decoder transformer con ventana de audio de 30 segundos y su tokenizer byte-level BPE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small), exportado a ONNX |
| Parametros totales | 244 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s (80 x 3000 log-Mel); contexto de texto no disponible |
| Tipos de cuantizacion | fp32 e int8 (dynamic quantization, QInt8 per-tensor, MatMul y Gather) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (opset 17, IR version 9); tokenizer.json byte-level BPE y feature extractor originales |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper-small, un transformer encoder-decoder con atención estándar. El encoder procesa un espectrograma log-Mel de 30 segundos de audio mono a 16 kHz (ventana FFT de 400 muestras, hop de 160, relleno con ceros) con forma `[1, 80, 3000]` y produce `last_hidden_state` de forma `[1, 1500, 768]`. El decoder es una versión merged con caché KV, con entradas `input_ids`, `encoder_hidden_states`, `use_cache_branch` y las claves/valores del pasado por capa (12 capas, dimensión de cabeza 64).

El entrenamiento original corresponde a PhoWhisper, el fine-tune en vietnamita de Whisper realizado por VinAI Research y presentado en ICLR 2024. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos deben consultarse en el paper de PhoWhisper. La innovación técnica de esta versión concreta es la exportación mediante `optimum-cli export onnx --task automatic-speech-recognition-with-past --opset 17` y la cuantización dinámica con `onnxruntime.quantization.quantize_dynamic`, incluyendo el plegado de la transposición en tiempo de ejecución de la LM head en una constante para poder cuantizarla también.

## Capacidades

- Reconocimiento automático del habla (ASR) en vietnamita a partir de audio de 30 segundos.
- Decodificación greedy con tokens especiales `<|startoftranscript|><|vi|><|transcribe|><|notimestamps|>`.
- Gestión de caché KV para decodificación incremental eficiente.
- Ejecución on-device en Android (Kotlin, ONNX Runtime Android 1.20.0 o superior) e iOS (Swift, onnxruntime-objc, con opción de CoreML Execution Provider).
- Inferencia con operadores ONNX estándar, sin necesidad de librería de operadores personalizados.
- No soporta tool calling, function calling, agentes, visión, audio más allá de ASR ni modo thinking; son capacidades no disponibles en este modelo.

## Casos de uso

- Transcripción de notas de voz en apps móviles: el modelo procesa clips de hasta 30 segundos en el propio dispositivo, evitando enviar audio a servidores y preservando la privacidad del usuario.
- Subtitulado en tiempo real de conversaciones o vídeos en vietnamita: la variante int8 (98,1 MB encoder + 195,1 MB decoder) permite decodificación incremental con caché KV en un terminal de gama media.
- Asistentes por voz offline: integración en apps Android/iOS que necesitan dictado o comandos de voz sin conectividad.
- Accesibilidad: transcripción de audio para personas con discapacidad auditiva en aplicaciones nativas, con latencia baja al ejecutarse localmente.
- Herramientas de productividad: dictado de textos en vietnamita dentro de editores o apps de notas, usando el tokenizer byte-level BPE incluido.
- Procesamiento por lotes en escritorio: los ficheros fp32 (615,0 MB decoder + 352,8 MB encoder) permiten validación y conversión adicional con ONNX Runtime en Python.
- Investigación y prototipado: base para experimentar con cuantización o despliegue móvil de ASR en vietnamita sin depender de pesos propietarios.

## Benchmarks y rendimiento

Word error rate (WER) sobre los primeros 30 clips del split de test vietnamita de FLEURS, decodificación greedy, texto en minúsculas y sin puntuación (según la model card, es una comprobación de la conversión, no un benchmark formal):

| Precision | WER |
|---|---|
| fp32 | 5,8% |
| int8 | 5,9% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar; el modelo es de ASR y no de razonamiento o código.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: la variante int8 requiere aproximadamente 300 MB en total (98,1 MB encoder + 195,1 MB decoder) más overhead de runtime; la fp32 ronda 1 GB (352,8 MB + 615,0 MB).
- GPU recomendadas: no es un modelo pensado para GPU de datacenter; para escritorio puede ejecutarse en CPU con ONNX Runtime. En móvil se ejecuta en CPU (con opción de CoreML Execution Provider en iOS).
- Cabe en GPU consumer: sí, cualquier GPU con al menos 2 GB de memoria puede ejecutar la variante fp32; la int8 es apta para dispositivos móviles.
- Opciones de despliegue: ONNX Runtime Android (Kotlin), ONNX Runtime iOS (Swift, onnxruntime-objc), ONNX Runtime Python para validación en escritorio. No se indica soporte nativo para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La model card solo indica que los ficheros int8 producen tokens idénticos en ONNX Runtime 1.20.0 y 1.31.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PhoWhisper-small-mobile (este) | 244 M | 30 s | vi | BSD-3-Clause | ONNX (fp32/int8) |
| vinai/PhoWhisper-small | 244 M | 30 s | vi | BSD-3-Clause | PyTorch (safetensors/bin) |
| openai/whisper-small | 244 M | 30 s | multilingüe (99 idiomas) | MIT | PyTorch |
| vinai/PhoWhisper-base | no disponible en la información | 30 s | vi | BSD-3-Clause | PyTorch |

La diferencia principal frente a `vinai/PhoWhisper-small` es el formato (ONNX frente a PyTorch) y la disponibilidad de cuantización int8 para móvil; frente a `openai/whisper-small`, este modelo está especializado en vietnamita y carece de soporte multilingüe. No se dispone de datos de rendimiento comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta vietnamita; no es multilingüe.
- Ventana de audio limitada a 30 segundos por inferencia; audios más largos requieren segmentación manual.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido o silencios largos.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero hereda los del dataset de entrenamiento de PhoWhisper.
- La cuantización int8 puede degradar ligeramente la precisión en dominios distintos al evaluado (FLEURS); la model card solo valida 30 clips.
- Licencia BSD-3-Clause permite uso comercial, pero se debe conservar el aviso de copyright y atribuir a VinAI Research según la cita indicada.
- No hay soporte documentado para tool calling, agentes ni otras capacidades más allá de ASR.
- El repositorio tiene pocas descargas (29) y ningún like; conviene validar la conversión en el caso de uso concreto antes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pdnhan/PhoWhisper-small-mobile
- Modelo base: https://huggingface.co/vinai/PhoWhisper-small
- ONNX Runtime: https://onnxruntime.ai
- Paper de PhoWhisper (ICLR 2024): no disponible como URL directa en la información proporcionada
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Optimum (exportación ONNX): https://github.com/huggingface/optimum
- Scripts de exportación y validación: carpeta `scripts/` del repositorio (export.py, validate.py)
- ONNX Runtime Swift Package Manager: https://github.com/microsoft/onnxruntime-swift-package-manager
