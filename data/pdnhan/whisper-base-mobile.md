# pdnhan/whisper-base-mobile

## Resumen

Whisper base for mobile es una conversión a ONNX con cuantización int8 de `openai/whisper-base`, el modelo multilingüe de reconocimiento automático de voz de OpenAI. Lo publica el usuario `pdnhan` como artefacto derivado de `Xenova/whisper-base` (la exportación ONNX orientada a transformers.js) y está pensado para inferencia en dispositivo con ONNX Runtime, concretamente en Android. No es un modelo nuevo: los pesos, la topología y los resultados son idénticos al original; lo único que cambia es la declaración de salidas del grafo.

La modificación técnica es acotada pero relevante en móvil: los mapas de atención dejan de exponerse como salidas del grafo ONNX. Dado que ONNX Runtime mantiene en memoria todas las salidas declaradas, la versión de Xenova consume mucha más RAM de la necesaria por transcripción. Según la model card, el pico neto de memoria de una transcripción baja de 883 MB a 516 MB con ONNX Runtime 1.31.1, 4 hilos intra-op y optimización `ENABLE_ALL`.

El modelo se usa en la aplicación Android Thì Thầm para reconocimiento de voz en alemán, forzando el decodificador con el token `<|de|>`. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta, lo que lo sitúa como un artefacto de nicho orientado a un caso de despliegue muy concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base), exportado a ONNX y cuantizado a int8 |
| Parámetros totales | no disponible (el modelo base Whisper base tiene 74 M, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s (entrada `input_features` de forma [1, 80, 3000], log-mel) |
| Tipos de cuantización | int8 (archivos `*_quantized.onnx`) |
| Idiomas soportados | multilingüe; el caso de uso documentado es alemán (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper base de OpenAI: un transformer encoder-decoder que procesa espectrogramas log-mel de 80 canales y 3000 frames (30 segundos de audio) y genera tokens de texto de forma autorregresiva con caché KV. El encoder produce `last_hidden_state` y el decoder consume `input_ids`, `encoder_hidden_states`, `use_cache_branch` y las `past_key_values.*`, devolviendo `logits` y `present.*`. No hay entrenamiento propio ni ajuste fino: el autor declara explícitamente que los pesos, los nodos y los resultados no cambian respecto a `Xenova/whisper-base` en el commit `64da57285918e20ea79ea5c88eed7197933abaa8`.

La única innovación es de empaquetado para despliegue: eliminar los mapas de atención de las salidas del grafo para reducir la memoria residente en ONNX Runtime. La validación incluida compara 2 clips de FLEURS en alemán con 30 pasos de decodificación greedy desde el prompt alemán, y reporta tokens idénticos y salida del encoder idéntica entre el archivo de Xenova y esta copia. El prompt documentado es `[50258, 50261, 50359, 50363]` (`<|startoftranscript|>`, `<|de|>`, `<|transcribe|>`, `<|notimestamps|>`) y la parada es el token `50257` (`<|endoftext|>`); el autor indica que otro token de idioma funciona del mismo modo.

## Capacidades

- Reconocimiento automático de voz multilingüe, con decodificación condicionada por token de idioma.
- Transcripción sin marcas de tiempo en la configuración documentada (`<|notimestamps|>`).
- Cambio de idioma de salida modificando el token de idioma del prompt del decodificador.
- Ejecución en dispositivo mediante ONNX Runtime, sin dependencia de servidor.
- Inferencia con caché KV (`use_cache_branch`, `past_key_values.*`) para decodificación paso a paso.
- No se documentan capacidades de traducción de voz, diarización, tool calling ni agentes en la información disponible.

## Casos de uso

- Subtitulado local en Android: la app Thì Thầm integra el par encoder/decoder en ONNX Runtime para transcribir voz en alemán sin enviar audio a la nube, con un pico de 516 MB por transcripción según la medición del autor.
- Asistentes de voz sin conexión: al caber en un móvil y no requerir red, sirve para dictado y comandos en entornos con conectividad intermitente o requisitos de privacidad.
- Notas de voz transcritas en el dispositivo: procesar clips de hasta 30 s por ventana con el encoder fijo [1, 80, 3000] y encadenar ventanas para audios más largos.
- Aplicaciones de accesibilidad: transcripción en tiempo real de conversaciones para personas con problemas de audición, ejecutando la inferencia localmente.
- Preprocesado de audio en pipelines móviles: generar transcripciones en el dispositivo antes de enviar solo texto a un backend, reduciendo ancho de banda y exposición de datos.
- Prototipado multiplataforma con ONNX Runtime: el par de grafos se puede cargar desde otros runtimes compatibles con ONNX (no solo Android) para validar latencia y memoria antes de elegir un modelo mayor.
- Transcripción multilingüe ligera: cambiar el token de idioma del prompt permite reutilizar el mismo artefacto para otros idiomas distintos del alemán, según indica el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (WER, MMLU, etc.) en la información disponible. El único dato medido es el pico de memoria neto por transcripción:

| Modelo | Archivo de Xenova | Esta copia |
|---|---|---|
| base | 883 MB | 516 MB |

Medición con ONNX Runtime 1.31.1, 4 hilos intra-op, optimización `ENABLE_ALL` y procesos nuevos. No se aportan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: pico neto de 516 MB por transcripción con las dos sesiones cargadas (encoder y 20 pasos de decoder) en la configuración medida.
- GPU recomendadas: no disponible; el artefacto está orientado a CPU en dispositivos móviles mediante ONNX Runtime.
- ¿Cabe en GPU de consumo? No hay datos publicados; por tamaño (repositorio de 0,1 GB, pesos int8) es viable en hardware de consumo, pero no se documenta ningún despliegue en GPU.
- Opciones de despliegue: ONNX Runtime (versión de referencia 1.31.1), con optimización de grafo `ENABLE_ALL` y ajuste de hilos intra-op.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pdnhan/whisper-base-mobile | no disponible | 30 s de audio | ONNX int8 | Apache 2.0 | Salidas de atención eliminadas; 516 MB de pico |
| Xenova/whisper-base | mismo modelo base | 30 s de audio | ONNX | Apache 2.0 | Exportación para transformers.js; 883 MB de pico |
| openai/whisper-base | no disponible en la información | 30 s de audio | PyTorch (safetensors/bin) | Apache 2.0 en HF; MIT en el repositorio de código | Modelo original multilingüe |

No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes; las diferencias documentadas son de empaquetado y consumo de memoria.

## Limitaciones y advertencias

- Solo se valida cualitativamente en 2 clips de FLEURS en alemán; no hay evaluación de WER a escala.
- El caso de uso documentado es alemán con el decodificador forzado a `<|de|>`; el resto de idiomas no se ha probado en esta copia.
- Ventana de audio fija de 30 s por pasada; audios más largos requieren segmentación externa.
- Configuración sin marcas de tiempo (`<|notimestamps|>`); no se documenta el comportamiento con timestamps activados.
- Riesgo de alucinación inherente a Whisper en audio con ruido, silencios o habla solapada; no se aportan mitigaciones específicas.
- Sesgos lingüísticos y de dominio heredados del modelo base de OpenAI; no se documenta ningún análisis al respecto.
- Licencia Apache 2.0 para los archivos del repositorio, con la salvedad de que el código y los pesos de `openai/whisper` en GitHub se distribuyen bajo MIT según la model card.
- Repositorio sin descargas ni likes y actualizado una sola vez; no hay evidencia de mantenimiento continuado.
- El script `make_mobile.py` se incluye solo para trazabilidad y depende de `tools/whisper_de` del repositorio de la app, por lo que la reproducibilidad fuera de ese contexto no está garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pdnhan/whisper-base-mobile
- Modelo base: https://huggingface.co/openai/whisper-base
- Exportación ONNX de referencia: https://huggingface.co/Xenova/whisper-base
- Repositorio de código de Whisper: https://github.com/openai/whisper
