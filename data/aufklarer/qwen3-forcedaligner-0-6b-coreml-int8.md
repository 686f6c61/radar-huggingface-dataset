# aufklarer/Qwen3-ForcedAligner-0.6B-CoreML-INT8

## Resumen

Qwen3-ForcedAligner-0.6B-CoreML-INT8 es una conversión a CoreML del modelo Qwen/Qwen3-ForcedAligner-0.6B, publicada por el usuario aufklarer. Su función es el alineamiento forzado (forced alignment) de audio y texto: dado un fragmento de audio y su transcripción, predice las marcas temporales a nivel de palabra. No es un modelo generativo de propósito general, sino una herramienta especializada de clasificación de audio que devuelve timestamps.

La conversión aplica palettización k-means INT8 sobre los dos bloques transformer (encoder de audio y decoder de texto), mientras que la tabla de embeddings se mantiene en fp16 como binario plano para preservar la precisión en la clasificación. El resultado ocupa aproximadamente 880 MB en disco, frente a los ~1,7 GB de la variante FP16, y está diseñado específicamente para ejecutarse en Apple Silicon aprovechando la Neural Engine y la GPU mediante CoreML.

El modelo base tiene 0,6 mil millones de parámetros y soporta nueve idiomas (inglés, chino, japonés, coreano, alemán, francés, español, italiano y ruso). Es relevante para desarrolladores que necesitan generar subtítulos sincronizados, anotaciones fonéticas o metadatos temporales en aplicaciones nativas de macOS e iOS sin depender de infraestructura en la nube, con una velocidad de inferencia muy superior al tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder no autorregresivo (encoder de audio de 24 capas con block-attention, decoder de texto de 28 capas, cabeza de clasificación de 5000 clases) |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-ForcedAligner-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrada de audio fija de 30 s de mel, entrada de texto fija T=768 |
| Tipos de cuantizacion | INT8 k-means palettization (encoder y decoder); embeddings en fp16; variante FP16 disponible como repo hermano |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, it, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | CoreML (.mlmodelc / .mlpackage), binario fp16 plano para embeddings, tokenizer BPE en JSON |

## Arquitectura y entrenamiento

La arquitectura replica la del modelo original Qwen3-ForcedAligner. El encoder de audio procesa una entrada mel fija de 30 segundos mediante 24 capas con block-attention. El decoder de texto, de 28 capas, no es autorregresivo: recibe un prompt con plantilla de chat (system + audio + assistant + slots `word<timestamp><timestamp>`) y produce logits sobre una cabeza de clasificación de 5000 clases. La inferencia consiste en un único forward pass, argmax en las posiciones de timestamp y una corrección de monotonicidad mediante LIS (Longest Increasing Subsequence).

La conversión a CoreML incorpora varias decisiones técnicas reseñables. La máscara causal se exporta como constante con valor de relleno finito de `-1e4` (en lugar de `-inf`) para evitar NaN en el softmax fp16. Los embeddings se entregan como binario plano fp16 con forma [152 064, 1024], mapeado en memoria por el runtime Swift y recolectado con `vImageConvert_Planar16FtoPlanarF`, lo que cuesta ~0,5 ms por alineamiento frente a los ~70 ms de un round-trip por mlpackage. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Alineamiento forzado de audio y texto con timestamps a nivel de palabra en un solo forward pass no autorregresivo.
- Predicción de fronteras de palabra corregidas por monotonicidad (LIS) sobre las posiciones de timestamp.
- Soporte multilingüe en nueve idiomas: inglés, chino, japonés, coreano, alemán, francés, español, italiano y ruso.
- Ejecución en Apple Neural Engine (encoder) y GPU (decoder) mediante CoreML; también existe bundle compatible con CPU-only.
- Entrada de audio fija de 30 segundos de mel; entrada de texto con longitud fija T=768.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo especializado de clasificación de audio.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Generación de subtítulos sincronizados en apps nativas de macOS/iOS: dado un audio y su transcripción, el modelo devuelve los timestamps de cada palabra para renderizar subtítulos karaoke o resaltados en tiempo real, con una latencia de ~289 ms por clip de 20 s en M2 Max.
- Anotación de corpus lingüísticos: investigadores pueden alinear grabaciones con transcripciones para construir datasets fonéticos o de evaluación ASR, aprovechando el soporte de nueve idiomas y la ejecución local sin coste de API.
- Edición de vídeo asistida: integración en herramientas de edición para detectar fronteras de palabra y permitir cortes o sustituciones precisas al nivel de palabra, gracias a la corrección de monotonicidad LIS que evita timestamps desordenados.
- Verificación de calidad de transcripciones ASR: comparar los timestamps predichos con los de un sistema ASR para detectar desalineamientos o errores de segmentación en pipelines de control de calidad.
- Aplicaciones de accesibilidad: sincronizar texto resaltado con audio en lectores de pantalla o sistemas de lectura guiada para personas con discapacidad auditiva o cognitiva.
- Procesamiento por lotes en el dispositivo: el RTF de 0,014 (69× más rápido que tiempo real) permite alinear horas de audio en minutos en un Mac con Apple Silicon, sin enviar datos a la nube, lo que facilita el cumplimiento de privacidad.
- Investigación en prosodia y análisis del habla: extraer duraciones de palabra y pausas para estudios fonéticos o entrenamiento de modelos TTS, con la ventaja de ejecutarse íntegramente en local.

## Benchmarks y rendimiento

Rendimiento histórico reportado por el autor (M2 Max, 64 GB, build de debug, clip de 20 s):

| Metrica | Valor |
|---|---|
| RTF (Real-Time Factor) | 0,014 (69× más rápido que tiempo real) |
| Peak RSS | 697 MB |
| Tiempo mediano de alineamiento | ~289 ms |

Perfil por etapa (`COREML_ALIGN_PROFILE=1`):

| Etapa | Tiempo |
|---|---|
| mel | 150 ms |
| encoder | 78 ms |
| embedding | 0,5 ms |
| splice | 0 ms |
| decoder | 54 ms |
| argmax | 7 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es generativo de propósito general. La validación de release reporta que los bundles INT8 y FP16 CPU coinciden con las 22 fronteras de palabra corregidas de la fixture de referencia en macOS 15.8.2.

## Requisitos de hardware

- VRAM/almacenamiento: ~880 MB en disco para la variante INT8 (encoder ~304 MB, decoder ~427 MB, embeddings ~297 MB); la variante FP16 ocupa ~1,7 GB.
- Memoria pico en ejecución: 697 MB de RSS en M2 Max con la variante INT8 (aproximadamente un 35 % menos que FP16 según el autor).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4, M5) con Neural Engine para el encoder y GPU para el decoder; no está pensado para GPUs NVIDIA ni AMD.
- Cabe en cualquier Mac con Apple Silicon; no requiere GPU dedicada. La validación en iPhone físico queda pendiente según el autor.
- Despliegue: CoreML mediante la librería speech-swift (Swift), con CLI `speech align audio.wav --engine coreml`. Existen variantes MLX (4bit, 5bit, 8bit, bf16) para rutas sin CoreML.
- Latencia: ~289 ms por clip de 20 s en M2 Max; RTF 0,014. El decoder usa `.cpuAndGPU` por defecto y el encoder `.cpuAndNeuralEngine`; existe bundle `text_decoder_cpu_v1` para ejecución CPU-only con normalización Float32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ForcedAligner-0.6B-CoreML-INT8 (este) | 0,6 B | audio fijo 30 s, texto T=768 | Apache 2.0 | CoreML INT8 | Hugging Face, Apple Silicon |
| Qwen3-ForcedAligner-0.6B-CoreML-FP16 | 0,6 B | audio fijo 30 s, texto T=768 | Apache 2.0 | CoreML FP16 | Hugging Face, Apple Silicon |
| Qwen/Qwen3-ForcedAligner-0.6B (base) | 0,6 B | no disponible | Apache 2.0 | safetensors | Hugging Face, multiplataforma |
| Variantes MLX 4bit/5bit/8bit/bf16 | 0,6 B | no disponible | Apache 2.0 | MLX | Hugging Face, Apple Silicon |

No se dispone de datos de benchmarks comparativos con otros alineadores (por ejemplo, WhisperX o Montreal Forced Aligner) en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no genera texto libre, no razona, no soporta tool calling ni agentes; su única salida son timestamps a nivel de palabra.
- Entrada de audio fija de 30 segundos de mel y texto con T=768: clips más largos requieren segmentación previa por parte del integrador.
- El decoder legacy devuelve logits todo-cero en ejecución CPU-only sobre macOS 15.8.2; es necesario usar el bundle versionado `text_decoder_cpu_v1` para ese caso.
- La validación en iPhone físico queda pendiente según el autor; el soporte está verificado en macOS 15.8.2 y en M5 Pro/macOS 26.6.2 para CPU y GPU.
- Riesgo de alucinación de timestamps en audio con ruido, solapamiento de hablantes o transcripciones incorrectas; la corrección LIS impone monotonicidad pero no garantiza precisión absoluta.
- Dependencia del ecosistema Apple: no es desplegable en Linux, Windows ni GPUs NVIDIA sin recurrir al modelo base o a las variantes MLX.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre precisión en producción; se recomienda validar con fixtures propias.
- Los bundles versionados no deben modificarse in situ; cambios futuros del grafo requieren una nueva versión de bundle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aufklarer/Qwen3-ForcedAligner-0.6B-CoreML-INT8
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Variante FP16: https://huggingface.co/aufklarer/Qwen3-ForcedAligner-0.6B-CoreML-FP16
- Librería speech-swift: https://github.com/soniqo/speech-swift
- Ejecución de verificación CPU: https://github.com/soniqo/speech-swift/actions/runs/42855833533
