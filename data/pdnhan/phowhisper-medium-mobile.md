# pdnhan/PhoWhisper-medium-mobile

## Resumen

PhoWhisper-medium-mobile es una conversión a ONNX del modelo vinai/PhoWhisper-medium, el ajuste fino en vietnamita de Whisper medium desarrollado por VinAI Research. El autor de esta conversión, pdnhan, publica los pesos originales (769 millones de parámetros) en formato ONNX con operadores estándar (opset 17, IR version 9), lo que permite ejecutarlos con los paquetes oficiales de ONNX Runtime para Android e iOS sin necesidad de bibliotecas de operadores personalizados.

El objetivo es claro: llevar el reconocimiento automático de voz en vietnamita a dispositivos móviles. Para ello se ofrecen dos versiones: la exportación fp32 de referencia (1,8 GB el decoder y 1,2 GB el encoder) y una cuantización dinámica int8 (513,5 MB y 323,5 MB respectivamente) que reduce el peso total a menos de 850 MB, apta para su descarga y ejecución en un teléfono. Los pesos no se modifican; solo cambia el formato y, en los ficheros int8, la precisión.

La relevancia actual reside en que el vietnamita es un idioma con relativamente pocos recursos ASR de calidad y este modelo demuestra que es posible ejecutar un Whisper medium fine-tuneado en local, sin conexión, con una precisión prácticamente idéntica a la del modelo en fp32 (WER del 4,6 % frente al 4,9 % en la muestra de validación del autor). Es, por tanto, una pieza útil para aplicaciones de dictado, subtitulado o asistentes de voz offline en vietnamita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) exportado a ONNX |
| Parámetros totales | 769 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (entrada mel de 80 × 3000); 448 posiciones de decoder |
| Tipos de cuantización | fp32 e int8 (cuantización dinámica QInt8, per-tensor, sobre pesos `MatMul` y `Gather`) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (opset 17, IR version 9); tokenizer byte-level BPE en `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper medium de OpenAI: un transformer encoder-decoder con 24 capas de encoder, 24 capas de decoder, dimensión oculta de 1024 y atención multi-cabeza de 16 cabezas. El encoder procesa un espectrograma log-Mel de 80 canales y 3000 frames (30 segundos de audio a 16 kHz, ventana FFT de 400 muestras y hop de 160, con padding de ceros) y produce un `last_hidden_state` de forma `[1, 1500, 1024]`. El decoder es autorregresivo y utiliza caché KV.

El modelo base, PhoWhisper-medium, es un ajuste fino de Whisper medium sobre datos de voz en vietnamita realizado por VinAI Research; los detalles exactos del corpus, el número de tokens de entrenamiento y si se aplicaron técnicas de RLHF o DPO no están disponibles en la información proporcionada. La conversión a ONNX se realizó con `optimum-cli export onnx --task automatic-speech-recognition-with-past --opset 17` y posteriormente se aplicó `onnxruntime.quantization.quantize_dynamic`. Antes de cuantizar, la transposición en tiempo de ejecución de la LM head se pliega en una constante para poder cuantizar también esa capa. Los scripts de exportación y validación están incluidos en el repositorio.

## Capacidades

- Reconocimiento automático de voz en vietnamita, con decodificación greedy y sin marcas de tiempo (`<|notimestamps|>`).
- Procesamiento de audio de hasta 30 segundos por ventana de entrada, con padding de ceros para clips más cortos.
- Ejecución en dispositivo con ONNX Runtime para Android (Kotlin) e iOS (Swift), incluyendo la posibilidad de usar el CoreML Execution Provider en iOS.
- Decodificación con caché KV fusionada en un único grafo de decoder (`decoder_model_merged.onnx`), lo que simplifica el bucle de inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de texto más allá de la transcripción.
- No dispone de modo thinking, visión ni audio más allá de la entrada de voz.
- Capacidad multilingüe limitada al vietnamita; no se documenta soporte para otros idiomas.

## Casos de uso

- Dictado por voz offline en aplicaciones Android e iOS: el modelo int8 ocupa menos de 850 MB y puede ejecutarse con ONNX Runtime sin conexión, lo que permite transcribir notas de voz en vietnamita en local y preservar la privacidad del usuario.
- Subtitulado automático de vídeos cortos en vietnamita: con ventanas de 30 segundos y decodificación greedy, se pueden generar transcripciones para clips de redes sociales directamente en el dispositivo.
- Asistentes de voz para conducción o uso manos libres: la ejecución local evita la latencia de red y permite procesar comandos de voz en vietnamita en tiempo real con una ventana de audio de 30 segundos.
- Aplicaciones de accesibilidad para personas con discapacidad auditiva: transcripción en vivo de conversaciones en vietnamita mediante la integración del encoder y el decoder ONNX en una app móvil.
- Herramientas de aprendizaje de idiomas: el modelo puede transcribir pronunciación de estudiantes de vietnamita y compararla con el texto esperado, aprovechando su WER bajo en la muestra de validación del autor.
- Procesamiento por lotes en escritorio: los ficheros fp32 de referencia permiten transcribir archivos de audio en servidores o estaciones de trabajo con Python y ONNX Runtime, sin necesidad de GPU dedicada.
- Integración en pipelines de transcripción de centros de llamadas: el modelo puede procesar grabaciones de 30 segundos por turno y generar texto para análisis posterior, con la ventaja de que la licencia BSD-3-Clause permite uso comercial.

## Benchmarks y rendimiento

El autor publica una única métrica de validación: la tasa de error de palabras (WER) sobre los primeros 30 clips del split de test de FLEURS en vietnamita, con decodificación greedy y texto en minúsculas sin puntuación. El autor indica explícitamente que es una comprobación de la conversión, no un benchmark formal.

| Precisión | WER (FLEURS vi, 30 clips) |
|---|---|
| fp32 | 4,9 % |
| int8 | 4,6 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo es exclusivamente de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo int8 requiere aproximadamente 850 MB de memoria para los dos grafos (encoder 323,5 MB + decoder 513,5 MB); el fp32 requiere unos 3,1 GB (encoder 1,2 GB + decoder 1,8 GB).
- GPU recomendadas: no se especifican; al ser un modelo para dispositivo, está pensado para CPU móvil. En escritorio puede ejecutarse en CPU sin GPU dedicada.
- ¿Cabe en GPU consumer? Sí, ambas versiones caben en cualquier GPU consumer con al menos 4 GB de VRAM, aunque el modelo está optimizado para CPU.
- Opciones de despliegue: ONNX Runtime para Android (`onnxruntime-android` 1.20.0 o superior), ONNX Runtime para iOS (`onnxruntime-objc` o Swift Package Manager 1.20.0 o superior), ONNX Runtime para Python en escritorio, y CoreML Execution Provider en iOS como opción.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El autor solo indica que los ficheros int8 producen tokens idénticos en ONNX Runtime 1.20.0 y 1.31.1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PhoWhisper-medium-mobile (esta ficha) | 769 M | 30 s de audio | vietnamita | BSD-3-Clause | ONNX (fp32/int8) |
| vinai/PhoWhisper-medium | 769 M | 30 s de audio | vietnamita | BSD-3-Clause | safetensors (PyTorch) |
| openai/whisper-medium | 769 M | 30 s de audio | multilingüe (99 idiomas) | MIT | safetensors, ONNX |
| vinai/PhoWhisper-small | no disponible | 30 s de audio | vietnamita | BSD-3-Clause | safetensors |

La diferencia principal frente a PhoWhisper-medium original es el formato: esta versión está pensada para móvil y ofrece cuantización int8, mientras que el original requiere PyTorch. Frente a Whisper medium de OpenAI, el modelo de VinAI está especializado en vietnamita y probablemente obtiene mejor WER en ese idioma, aunque no se dispone de una comparación directa en la información proporcionada. PhoWhisper-small es una alternativa de menor tamaño, pero no se dispone de sus especificaciones completas.

## Limitaciones y advertencias

- El modelo solo soporta vietnamita; no debe usarse para otros idiomas sin esperar un rendimiento degradado.
- La evaluación publicada se limita a 30 clips de FLEURS, por lo que no constituye una validación robusta de la precisión en dominios reales (ruido, acentos, audio telefónico).
- Riesgo de alucinación en la transcripción: como todo modelo Whisper, puede generar texto plausible en segmentos de silencio o ruido, especialmente con decodificación greedy.
- La ventana de audio está limitada a 30 segundos; para audios más largos es necesario segmentar y gestionar manualmente la concatenación.
- La cuantización int8 es dinámica y per-tensor, lo que puede introducir pequeñas diferencias en dominios distintos al de validación, aunque en la muestra del autor el WER fue ligeramente mejor que en fp32.
- La licencia BSD-3-Clause permite uso comercial, pero se debe mantener el aviso de copyright y la atribución a VinAI Research y al autor de la conversión.
- El repositorio tiene muy pocas descargas (14) y ningún "like", por lo que no hay evidencia de uso en producción ni de mantenimiento a largo plazo.
- No se proporcionan datos sobre sesgos demográficos o acústicos del modelo base; se recomienda evaluar con muestras representativas antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pdnhan/PhoWhisper-medium-mobile
- Modelo base: https://huggingface.co/vinai/PhoWhisper-medium
- Paper de PhoWhisper: no disponible en la información proporcionada (citado en la model card como inproceedings PhoWhisper)
- ONNX Runtime: https://onnxruntime.ai
- Optimum: https://github.com/huggingface/optimum
- ONNX Runtime Swift Package Manager: https://github.com/microsoft/onnxruntime-swift-package-manager
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
