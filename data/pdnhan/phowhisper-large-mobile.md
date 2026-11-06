# pdnhan/PhoWhisper-large-mobile

## Resumen

PhoWhisper-large-mobile es una conversión a ONNX del modelo vinai/PhoWhisper-large, un fine-tune en vietnamita de Whisper large desarrollado por VinAI. El modelo original cuenta con 1.550 millones de parámetros y esta exportación mantiene los pesos sin modificar, limitándose a cambiar el formato (y la precisión, en los ficheros int8) para permitir la inferencia en dispositivos Android e iOS mediante ONNX Runtime.

El problema que resuelve es la brecha entre un modelo de reconocimiento automático del habla (ASR) de tamaño grande y su despliegue en móviles: los ficheros cuantizados dinámicamente a int8 reducen el encoder a 660,5 MB y el decoder a 978,5 MB, lo que los hace viables en hardware de consumo. La exportación usa únicamente operadores estándar de ONNX (opset 17, IR version 9), por lo que no requiere librerías de operadores personalizados.

Es relevante ahora porque cubre un nicho poco atendido: ASR de alta calidad para vietnamita en el dispositivo, sin depender de la nube. La licencia BSD-3-Clause del modelo original se mantiene, lo que facilita su integración en aplicaciones comerciales. El autor es pdnhan, que publica la conversión como artefacto independiente del modelo base de VinAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large) |
| Parametros totales | 1.550 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (1500 frames de encoder, ventana fija de Whisper) |
| Tipos de cuantizacion | fp32 e int8 (dynamic quantization, QInt8, per-tensor, sobre pesos MatMul y Gather) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (opset 17, IR version 9); ficheros externos `.onnx_data` para fp32 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large: un transformer encoder-decoder con atención estándar. El encoder procesa un espectrograma log-Mel de 30 segundos de audio mono a 16 kHz (ventana FFT de 400 muestras, hop de 160, padding con ceros) y produce un tensor `[1, 1500, 1280]`. El decoder es autorregresivo y en esta exportación se presenta como modelo fusionado con caché KV, con entradas `input_ids`, `encoder_hidden_states`, `use_cache_branch` y las claves/valores pasados por capa.

Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no se recogen en la información proporcionada; corresponden a la model card de vinai/PhoWhisper-large, no incluida aquí. La innovación técnica de esta conversión es la exportación con `optimum-cli export onnx --task automatic-speech-recognition-with-past --opset 17` seguida de `onnxruntime.quantization.quantize_dynamic`, con un detalle relevante: antes de cuantizar se pliega la transposición en tiempo de ejecución de la LM head (sobre el embedding compartido) en una constante, de modo que la LM head también queda cuantizada.

## Capacidades

- Reconocimiento automático del habla (transcripción) en vietnamita, con ventana fija de 30 segundos por pasada.
- Decodificación greedy con tokens especiales fijos: `<|startoftranscript|><|vi|><|transcribe|><|notimestamps|>`.
- Inferencia en dispositivo (on-device) en Android (Kotlin, ONNX Runtime Android 1.20.0 o superior) e iOS (Swift, onnxruntime-objc, con opción de CoreML Execution Provider).
- Ejecución con paquetes estándar de ONNX Runtime sin librería de operadores personalizados.
- Compatibilidad verificada de los ficheros int8 en ONNX Runtime 1.20.0 y 1.31.1, con tokens idénticos.
- No soporta tool calling, agentes, visión, audio más allá de ASR ni modo thinking; es un modelo puramente de transcripción.
- Capacidades multilingües limitadas al vietnamita.

## Casos de uso

- Transcripción offline en aplicaciones móviles: integración de los dos ficheros `*_quantized.onnx` en una app Android o iOS para transcribir notas de voz sin enviar audio a la nube, usando el decoder con caché KV para mantener latencia baja en cada paso.
- Subtitulado de contenido en vietnamita: procesado por segmentos de 30 segundos con el encoder ejecutado una vez por segmento y decodificación greedy, adecuado para generar subtítulos de vídeos o pódcasts.
- Asistentes de voz embebidos: captura de audio del micrófono, cálculo del log-Mel con los parámetros de `WhisperFeatureExtractor` y transcripción local como primer paso de un pipeline de comandos de voz.
- Dictado y accesibilidad: conversión de voz a texto en tiempo real en dispositivos de gama media, aprovechando que el encoder cuantizado ocupa 660,5 MB y puede ejecutarse con `setIntraOpNumThreads(4)`.
- Investigación en ASR de bajo recurso: uso como referencia desplegable para comparar WER en vietnamita entre fp32 e int8 (4,0 % frente a 4,1 % en FLEURS) y estudiar el impacto de la cuantización dinámica.
- Validación de pipelines de exportación: los scripts `export.py` y `validate.py` del repositorio sirven para reproducir la conversión de otros fine-tunes de Whisper a ONNX para móvil.
- Procesamiento por lotes en escritorio: uso de los ficheros fp32 como exportación de referencia para transcripciones de mayor precisión fuera de móvil.

## Benchmarks y rendimiento

El autor publica un sanity check de la conversión, no un benchmark formal: WER sobre los primeros 30 clips del split de test de FLEURS en vietnamita, decodificación greedy, texto en minúsculas y sin puntuación.

| Precision | WER (FLEURS vi, 30 clips) |
|---|---|
| fp32 | 4,0 % |
| int8 | 4,1 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,64 GB en int8 (660,5 MB de encoder más 978,5 MB de decoder) y unos 6,17 GB en fp32 (2.547,1 MB más 3.626,1 MB, más 2,1 MB y 0,4 MB de los grafos).
- GPU recomendadas: no disponible; el modelo está pensado para CPU móvil. En escritorio puede ejecutarse en CPU con ONNX Runtime; en iOS existe la opción de CoreML Execution Provider.
- Compatibilidad con GPU de consumo: los ficheros int8 caben en cualquier GPU de consumo con más de 2 GB de VRAM, aunque el objetivo declarado es la ejecución en CPU de Android e iOS.
- Opciones de despliegue: ONNX Runtime para Android (`com.microsoft.onnxruntime:onnxruntime-android`), ONNX Runtime para iOS (Swift Package Manager u Objective-C vía CocoaPods), y ONNX Runtime en Python para comprobaciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| PhoWhisper-large-mobile (esta ficha) | 1.550 M | 30 s de audio | vietnamita | BSD-3-Clause | ONNX int8/fp32, on-device |
| vinai/PhoWhisper-large | 1.550 M | 30 s de audio | vietnamita | BSD-3-Clause | PyTorch (modelo base) |
| Whisper large (original) | 1.550 M | 30 s de audio | multilingüe | MIT (según la familia Whisper) | PyTorch, ONNX, GGUF |
| Whisper small / base | 244 M / 74 M | 30 s de audio | multilingüe | MIT (según la familia Whisper) | PyTorch, ONNX, GGUF |

La comparación con alternativas de la misma categoría (ASR on-device en vietnamita) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta vietnamita; no es un modelo multilingüe.
- Ventana de audio fija de 30 segundos por pasada; audios más largos requieren segmentación manual.
- Decodificación greedy únicamente; no se documenta búsqueda por haz ni otras estrategias.
- Riesgo de alucinación y errores en audio con ruido, acentos o dominios alejados de los datos de entrenamiento del modelo base; el WER de 4,0-4,1 % procede de solo 30 clips de FLEURS y no es representativo de condiciones reales.
- Los ficheros fp32 dependen de ficheros `.onnx_data` externos; hay que copiar ambos junto al grafo.
- La cuantización int8 es dinámica y per-tensor sobre MatMul y Gather; puede degradar más en otros dominios de los medidos.
- Licencia BSD-3-Clause: permite uso comercial, pero exige conservar el aviso de copyright y la cláusula de exención; conviene revisar también las condiciones del modelo base vinai/PhoWhisper-large.
- No se documentan sesgos específicos ni evaluaciones de robustez en la información disponible.
- El repositorio tiene 16 descargas y 0 likes, por lo que la validación comunitaria es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pdnhan/PhoWhisper-large-mobile
- Modelo base: https://huggingface.co/vinai/PhoWhisper-large
- ONNX Runtime: https://onnxruntime.ai
- Optimum (exportación ONNX): https://github.com/huggingface/optimum
- ONNX Runtime Swift Package Manager: https://github.com/microsoft/onnxruntime-swift-package-manager
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
