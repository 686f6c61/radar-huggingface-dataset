# Retrieve0/Qwen3-ForcedAligner-0.6B-EXL3-Decoder

## Resumen

Qwen3-ForcedAligner-0.6B-EXL3-Decoder es una cuantizacion en 4 bits por peso (4 bpw) del decoder de texto del modelo Qwen/Qwen3-ForcedAligner-0.6B, publicada por el usuario Retrieve0. No se trata de un modelo nuevo, sino de una exportacion del decoder del aligner forzado de Qwen3 en formato EXL3 (ExLlamaV3), pensada para ejecutarse junto a un encoder TensorRT del mismo aligner dentro del repositorio Qwen3-ASR-TensorRT. El modelo base resuelve el problema de alineamiento forzado entre audio y transcripcion: dado un audio y su texto, devuelve marcas temporales por token o palabra para generar subtitulos SRT precisos.

La relevancia de esta publicacion es de ingenieria de despliegue: demuestra que es posible cuantizar el decoder a 4 bpw sin degradar la tarea de clasificacion de timestamps, gracias a mantener la cabeza de lenguaje (LM head) en 16 bits y rellenarla con ceros hasta 152.064 filas. El resultado reportado es una latencia mediana de 42,96 ms frente a 93,13 ms del backend oficial de Transformers en BF16, con el 96,7% de los limites temporales exactamente iguales.

El modelo tiene 422.223.872 parametros reales segun los safetensors, un tamano de repositorio de 0,9 GB y licencia Apache-2.0. La arquitectura subyacente es la del decoder de Qwen3, aunque la model card no detalla la configuracion interna (capas, dimensiones, atencion) ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder tipo Qwen3 (detalles internos no disponibles); el modelo base es un aligner forzado audio-texto |
| Parametros totales | 422.223.872 (safetensors); el nombre comercial indica 0.6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4 bpw (4 bits por peso) en el decoder; LM head mantenida en 16 bits |
| Idiomas soportados | no disponible en la informacion proporcionada (el ejemplo de uso emplea `--language English`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria exllamav3) |

## Arquitectura y entrenamiento

El modelo es una exportacion cuantizada, no un entrenamiento nuevo. El decoder del Qwen3-ForcedAligner-0.6B se convierte a formato EXL3 a 4 bpw. La innovacion tecnica documentada es el tratamiento de la cabeza de clasificacion: el aligner original tiene una cabeza con 5.000 filas reales, y en la exportacion el LM head se rellena con ceros hasta 152.064 filas y se mantiene en 16 bits para que las filas de clasificacion no se degraden por la cuantizacion. En tiempo de ejecucion se realiza un unico forward pass sobre el prompt completo y se toma el argmax en cada posicion `<timestamp>`.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, el uso de RLHF/DPO ni otras innovaciones arquitectonicas del modelo base en la informacion proporcionada. El pipeline declarado es automatic-speech-recognition y la libreria de inferencia es exllamav3.

## Capacidades

- Alineamiento forzado entre audio y transcripcion: genera marcas temporales por token o palabra a partir de un audio y su texto.
- Generacion de subtitulos en formato SRT mediante la CLI `qwen3-asr align`.
- Clasificacion de timestamps basada en argmax sobre las posiciones `<timestamp>` del decoder.
- Integracion con encoder TensorRT BF16 del mismo aligner para despliegue de baja latencia.
- Soporte de seleccion de idioma en la CLI (por ejemplo, `--language English`); el conjunto real de idiomas soportados no esta disponible.
- No se documentan capacidades de tool calling, agentes, vision, audio generation ni modo thinking en la informacion proporcionada.

## Casos de uso

- Generacion de subtitulos SRT para video: se pasa un WAV y su transcripcion a `qwen3-asr align` con `--format srt` y el modelo devuelve los limites temporales por segmento, adecuado porque el aligner esta disenado especificamente para esta tarea y el backend TensorRT+EXL3 reduce la latencia a 42,96 ms de mediana.
- Sincronizacion de transcripciones en pipelines de postproduccion: al mantener el 96,7% de los limites exactamente iguales respecto al backend BF16 oficial, permite sustituir el backend de referencia sin recalibrar el resto del pipeline.
- Alineamiento de corpus para entrenamiento de modelos TTS o ASR: el modelo produce marcas temporales a nivel de token sobre grandes lotes de audio y texto, y su bajo coste de inferencia (decoder de 0,9 GB) permite procesar volumenes altos en una sola GPU.
- Indexacion y busqueda por fragmentos de audio: los timestamps permiten trocear audio en segmentos asociados a texto para motores de busqueda o sistemas de recuperacion, usando el aligner como paso previo de segmentacion.
- Verificacion de calidad de transcripciones: comparar los limites generados con los de una referencia permite detectar desalineamientos y errores de transcripcion en control de calidad.
- Despliegue en entornos con GPU de consumo: al ser una cuantizacion de 4 bpw con repositorio de 0,9 GB, puede ejecutarse en GPUs modestas junto al encoder TensorRT, reduciendo el coste frente a un backend BF16 completo.
- Generacion de subtitulos multilingues: la CLI admite el parametro de idioma, aunque la lista completa de idiomas soportados no esta disponible en la informacion proporcionada.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre las 2.620 utters de LibriSpeech `test-clean` y 52.576 elementos alineados, comparando TensorRT BF16 encoder + EXL3 4 bpw decoder frente al backend oficial de Transformers en BF16:

| Metrica | TensorRT BF16 + EXL3 4 bpw | Transformers BF16 |
|---|---|---|
| Latencia mediana | 42,96 ms | 93,13 ms |
| Latencia P90 | 74,65 ms | 114,06 ms |
| Coincidencia de secuencia de tokens | 100% de las utters | referencia |
| Limites temporales exactamente iguales | 96,7% | referencia |
| Diferencia absoluta media de limites | 8,24 ms | referencia |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 0,9 GB y los pesos estan en 4 bpw, por lo que el decoder cabe holgadamente en GPUs de consumo, pero el encoder TensorRT y el runtime anaden requisitos no cuantificados en la informacion.
- GPU recomendadas: no disponibles en la informacion proporcionada; el backend TensorRT sugiere GPUs NVIDIA.
- Cabe en GPU de consumo: previsiblemente si por el tamano del decoder (0,9 GB), aunque no se confirma en la model card.
- Opciones de despliegue: ExLlamaV3 (libreria declarada), TensorRT para el encoder, y la CLI `qwen3-asr` del repositorio Qwen3-ASR-TensorRT con `--backend tensorrt-exllama`.
- Latencia y throughput: latencia mediana de 42,96 ms y P90 de 74,65 ms por utter en el benchmark citado; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Retrieve0/Qwen3-ForcedAligner-0.6B-EXL3-Decoder | 422,2 M (0.6B nominal) | no disponible | Apache-2.0 | safetensors EXL3 4 bpw | Decoder cuantizado para TensorRT + ExLlamaV3 |
| Qwen/Qwen3-ForcedAligner-0.6B | 0.6B nominal | no disponible | Apache-2.0 | safetensors BF16 | Modelo base oficial; backend de referencia en los benchmarks |
| Retrieve0/Qwen3-ForcedAligner-0.6B-TensorRT-Encoder | no disponible | no disponible | no disponible | TensorRT | Encoder complementario del mismo autor para el pipeline completo |

No se dispone de datos de otros aligners forzados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo independiente: requiere el encoder TensorRT complementario y el repositorio Qwen3-ASR-TensorRT para funcionar; no es un reemplazo directo del modelo base en Transformers.
- La LM head se rellena con ceros hasta 152.064 filas y se mantiene en 16 bits; modificar ese esquema o recuantizar la cabeza degradaria la clasificacion de timestamps.
- El 3,3% de los limites temporales no coincide exactamente con el backend BF16 oficial, con una diferencia absoluta media de 8,24 ms; en aplicaciones que exijan precision sub-fotograma conviene validar.
- Los benchmarks se limitan a LibriSpeech `test-clean` en ingles; el comportamiento en otros idiomas, ruido o audio espontaneo no esta documentado.
- Riesgo de alucinacion y sesgos: no documentado en la informacion proporcionada.
- Licencia Apache-2.0, que permite uso comercial, pero se debe conservar la atribucion y el aviso de licencia del modelo base Qwen/Qwen3-ForcedAligner-0.6B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente (noviembre de 2026) sin validacion comunitaria.
- No se documentan limitaciones de longitud de contexto ni de idioma en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Retrieve0/Qwen3-ForcedAligner-0.6B-EXL3-Decoder
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Encoder TensorRT complementario: https://huggingface.co/Retrieve0/Qwen3-ForcedAligner-0.6B-TensorRT-Encoder
- Repositorio Qwen3-ASR-TensorRT: https://github.com/lost0427/Qwen3-ASR-TensorRT
- Imagen de comparacion: https://huggingface.co/Retrieve0/Qwen3-ForcedAligner-0.6B-EXL3-Decoder/resolve/main/qwen3-aligner-comparison.png
- Imagen de latencia por etapa: https://huggingface.co/Retrieve0/Qwen3-ForcedAligner-0.6B-EXL3-Decoder/resolve/main/qwen3-aligner-stage-latency.png
