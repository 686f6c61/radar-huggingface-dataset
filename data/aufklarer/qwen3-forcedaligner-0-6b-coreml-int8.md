# aufklarer/Qwen3-ForcedAligner-0.6B-CoreML-INT8

## Resumen

Qwen3-ForcedAligner-0.6B-CoreML-INT8 es una conversión a CoreML del modelo Qwen/Qwen3-ForcedAligner-0.6B, publicada por el usuario aufklarer. Su función es el alineamiento forzado (forced alignment): dado un par de audio y texto, predice las marcas temporales a nivel de palabra en una única pasada directa no autorregresiva. No es un modelo generativo de propósito general, sino una herramienta especializada de anotación temporal para pipelines de voz.

La conversión aplica palettización k-means INT8 a los dos bundles transformer (encoder de audio y decoder de texto) y deja la tabla de embeddings en fp16 sin cuantizar, con el objetivo de reducir el uso de memoria y disco en Apple Silicon. El paquete resultante ocupa aproximadamente 880 MB, frente a los 1,7 GB de la variante FP16 del mismo autor. El modelo base tiene 0,6 mil millones de parámetros y hereda la licencia Apache 2.0.

Es relevante ahora porque permite ejecutar alineamiento forzado multilingüe (nueve idiomas) en hardware de consumo de Apple, con aceleración en Neural Engine y GPU, y con un rendimiento medido de RTF 0,014 (unas 69 veces más rápido que tiempo real) en un M2 Max. Esto lo hace útil para subtitulado, sincronización de transcripciones y anotación de corpus sin depender de infraestructura GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder no autorregresivo; encoder de audio de 24 capas con block-attention y decoder de texto de 28 capas con cabeza de clasificación de 5000 clases |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrada de audio fija de 30 s de mel y decoder con T=768 fijo |
| Tipos de cuantizacion | INT8 k-means palettization en encoder y decoder; embeddings en fp16 sin cuantizar; variante FP16 disponible |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, it, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | CoreML (.mlmodelc / .mlpackage), tabla de embeddings fp16 binaria, tokenizer BPE (vocab.json, merges.txt) |

## Arquitectura y entrenamiento

El modelo es una conversión del Qwen3-ForcedAligner de Qwen, un transformer encoder-decoder especializado en alineamiento forzado. La inferencia es no autorregresiva: se construye un prompt con plantilla de chat (system + audio + assistant + slots `word<timestamp><timestamp>`), se ejecuta una única pasada directa, se aplica argmax en las posiciones de timestamp y se corrige la monotonicidad mediante LIS (Longest Increasing Subsequence). El encoder de audio procesa una entrada mel fija de 30 segundos y el decoder opera con longitud fija T=768.

La conversión a CoreML introduce varias decisiones técnicas concretas. La máscara causal se exporta como constante con valor de relleno finito `-1e4` en lugar de `-inf`, para evitar NaN en la softmax fp16. La tabla de embeddings se envía como binario fp16 crudo que el runtime Swift mapea en memoria con `vImageConvert_Planar16FtoPlanarF`, con un coste de aproximadamente 0,5 ms por alineamiento frente a los ~70 ms de una ida y vuelta por mlpackage. Se incluyen además bundles de decoder específicos para CPU (con normalizaciones RMS en Float32) y para Neural Engine (usando `mul(x, x)` en lugar de `pow(x, 2)` en las cadenas de normalización RMS). No se dispone de información sobre los datos de entrenamiento del modelo base en la información proporcionada.

## Capacidades

- Alineamiento forzado a nivel de palabra: predice marcas temporales para cada palabra de un texto dado un audio.
- Procesamiento no autorregresivo en una sola pasada, con corrección de monotonicidad LIS.
- Soporte multilingüe en nueve idiomas: inglés, chino, japonés, coreano, alemán, francés, español, italiano y ruso.
- Ejecución acelerada en Apple Silicon con Neural Engine y GPU; bundles específicos para CPU y para ANE.
- Entrada de audio de hasta 30 segundos por ventana (forma mel fija).
- Integración con el runtime Swift `speech-swift` y con CLI mediante `speech align`.
- No soporta generación de texto libre, tool calling ni razonamiento de múltiples pasos: es un modelo de clasificación temporal, no un LLM conversacional.

## Casos de uso

- Subtitulado automático con sincronización precisa: dado un audio y su transcripción, el modelo genera marcas temporales por palabra que se pueden convertir directamente en ficheros SRT o VTT. La ventana fija de 30 s encaja con la segmentación habitual de subtítulos.
- Sincronización de transcripciones ASR: tras un sistema de reconocimiento de voz, el alineador corrige y ancla las marcas temporales de cada token, mejorando la precisión de los timestamps generados por el ASR.
- Anotación de corpus lingüísticos: investigadores pueden alinear grabaciones con transcripciones en nueve idiomas para construir datasets fonéticos o de evaluación, ejecutándolo en un portátil Apple sin GPU dedicada.
- Karaoke y resaltado de texto en reproductores: la salida a nivel de palabra permite resaltar la palabra en curso en aplicaciones de reproducción de audio o vídeo en macOS e iOS.
- Búsqueda y navegación en archivos de audio: indexar reuniones o podcasts con timestamps por palabra para saltar a la mención exacta de un término.
- Verificación de calidad de TTS: comparar el audio sintetizado con el texto de entrada para detectar palabras omitidas, alargadas o mal pronunciadas mediante desviaciones en los timestamps.
- Evaluación de pronunciación: alinear la locución de un estudiante con el texto objetivo para localizar palabras problemáticas en herramientas de aprendizaje de idiomas.

## Benchmarks y rendimiento

Rendimiento histórico medido en M2 Max (64 GB, build de depuración, clip de 20 s):

| Metrica | Valor |
|---|---|
| RTF | 0,014 (69× más rápido que tiempo real) |
| RSS pico | 697 MB |
| Tiempo mediano de alineamiento | ~289 ms |

Perfil por etapas (`COREML_ALIGN_PROFILE=1`): mel=150 ms, encoder=78 ms, embedding=0,5 ms, splice=0 ms, decoder=54 ms, argmax=7 ms.

No se han publicado resultados de benchmarks de precisión (WER de alineamiento, accuracy de fronteras) en la información disponible. La validación de release del autor indica que los bundles CPU versionados INT8 y FP16 coinciden con las 22 fronteras de palabra corregidas de la fixture de referencia en macOS 15.8.2.

## Requisitos de hardware

- VRAM/memoria: ~697 MB de RSS pico en la variante INT8; ~880 MB en disco frente a ~1,7 GB de la FP16.
- GPU recomendadas: no requiere GPU dedicada; está diseñado para Apple Silicon (M-series) con aceleración en Neural Engine y GPU.
- Cabe en cualquier Mac con Apple Silicon; no está pensado para GPU NVIDIA ni para hardware x86.
- Opciones de despliegue: CoreML mediante el runtime Swift `speech-swift` (paquete `Qwen3ASR`) y CLI `speech align`. Existen variantes MLX (4bit, 5bit, 8bit, bf16) en la misma organización para rutas sin CoreML.
- Latencia: ~289 ms medianos para un clip de 20 s en M2 Max; RTF 0,014.
- Decoder por defecto en `.cpuAndGPU`; encoder por defecto en `.cpuAndNeuralEngine`. Para `.cpuOnly` debe usarse el bundle `text_decoder_cpu_v1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-ForcedAligner-0.6B-CoreML-INT8 (este) | 0,6 B | audio 30 s fijo, T=768 | CoreML INT8 | Apache 2.0 | Optimizado para Apple Silicon, ~880 MB |
| Qwen3-ForcedAligner-0.6B-CoreML-FP16 | 0,6 B | audio 30 s fijo, T=768 | CoreML FP16 | Apache 2.0 | Máxima fidelidad, ~1,7 GB |
| Qwen/Qwen3-ForcedAligner-0.6B (base) | 0,6 B | no disponible | safetensors | Apache 2.0 | Modelo original, requiere framework de inferencia estándar |
| Variantes MLX del mismo autor (4bit, 5bit, 8bit, bf16) | 0,6 B | no disponible | MLX | Apache 2.0 | Ruta sin CoreML para Apple Silicon |

No se dispone de datos de benchmarks comparativos de precisión entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no genera texto ni mantiene conversación; solo produce marcas temporales para un par audio-texto.
- Entrada de audio limitada a ventanas fijas de 30 s; audios más largos requieren segmentación externa.
- Longitud de decoder fija (T=768), lo que acota el número de tokens alineables por pasada.
- El decoder original puede producir clases de timestamp incorrectas en Neural Engine en runtimes antiguos de macOS; debe usarse el bundle `text_decoder_ane_v1` para `.cpuAndNeuralEngine` y `.all`.
- El decoder legacy devuelve logits todo-cero con ejecución solo-CPU en macOS 15.8.2; es necesario el bundle `text_decoder_cpu_v1`.
- La validación de release se limita a macOS 15.8.2 y a un Mac M5 Pro con macOS 26.6.2; la validación en iPhone físico queda pendiente según el autor.
- Dependencia del ecosistema Apple: no es desplegable en GPU NVIDIA ni en servidores x86 sin reconversión.
- Riesgo de alucinación de timestamps en audio con ruido, solapamiento de hablantes o texto que no coincide con el audio; la corrección LIS mitiga pero no elimina fronteras erróneas.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de atribución del modelo base Qwen.
- No se han publicado evaluaciones de sesgo ni de robustez multilingüe en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aufklarer/Qwen3-ForcedAligner-0.6B-CoreML-INT8
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Variante FP16: https://huggingface.co/aufklarer/Qwen3-ForcedAligner-0.6B-CoreML-FP16
- Runtime Swift: https://github.com/soniqo/speech-swift
- Pull request de reparación del grafo para Neural Engine: https://github.com/soniqo/speech-swift/pull/553
- Ejecución de verificación de release: https://github.com/soniqo/speech-swift/actions/runs/42855833533
