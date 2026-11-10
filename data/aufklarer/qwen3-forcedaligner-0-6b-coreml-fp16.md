# aufklarer/Qwen3-ForcedAligner-0.6B-CoreML-FP16

## Resumen

Qwen3-ForcedAligner-0.6B-CoreML-FP16 es una conversión a CoreML en precisión FP16 del modelo Qwen/Qwen3-ForcedAligner-0.6B, publicada por el usuario aufklarer. Se trata de un alineador forzado (forced aligner) de audio y texto que predice marcas temporales a nivel de palabra para pares formados por un clip de audio y su transcripción. El modelo está empaquetado específicamente para Apple Silicon y aprovecha el Neural Engine y la GPU mediante CoreML, lo que lo hace idóneo para aplicaciones nativas de macOS e iOS.

El modelo resuelve el problema clásico de la alineación forzada: dado un audio y su transcripción, determinar en qué instante empieza y termina cada palabra. A diferencia de aproximaciones autoregresivas, esta implementación realiza una única pasada forward no autoregresiva sobre un prompt con plantilla de chat, aplica argmax en las posiciones de timestamp y corrige la monotonía mediante LIS (Longest Increasing Subsequence). El resultado son 22 fronteras de palabra validadas contra un fixture de referencia.

Con 0,6 mil millones de parámetros y un repositorio de 1,8 GB, es un modelo compacto orientado a inferencia local en dispositivos Apple. Su relevancia actual radica en que permite alineación de alta fidelidad con latencias de ~297 ms por clip de 20 segundos (RTF 0,015, 67× más rápido que tiempo real) en un M2 Max, sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder no autoregresivo (24 capas encoder + 28 capas decoder) |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-ForcedAligner-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Audio fijo de 30 s (mel); decoder con T=768 fijo |
| Tipos de cuantizacion | FP16 (este repo); INT8 disponible en variante companion; 4bit/5bit/8bit/bf16 en MLX |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, it, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | CoreML (.mlmodelc / .mlpackage) + tabla de embeddings fp16 binaria raw |

## Arquitectura y entrenamiento

La arquitectura replica la del modelo upstream Qwen3-ForcedAligner-0.6B, pero exportada a CoreML. Se compone de dos subgrafos: un encoder de audio de 24 capas con block-attention que recibe una entrada mel fija de 30 segundos y devuelve `audio_embeddings` junto con la longitud real `output_length`; y un decoder de texto de 28 capas no autoregresivo con una cabeza de clasificación de 5000 clases y forma fija T=768. La tabla de embeddings de tokens se distribuye como binario fp16 little-endian de forma [152 064, 1024], que el runtime Swift mapea en memoria y recolecta filas con `vImageConvert_Planar16FtoPlanarF`, reduciendo el coste a ~0,5 ms por alineación frente a los ~70 ms de un round-trip por mlpackage.

La inferencia es no autoregresiva: una sola pasada forward sobre un prompt con plantilla de chat (system + audio + assistant + slots `word<timestamp><timestamp>`), seguida de argmax en las posiciones de timestamp y corrección de monotonía mediante LIS. La máscara causal se hornea en el grafo exportado como constante con relleno finito de -1e4 (no -inf) para evitar NaN en la softmax fp16. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Alineación forzada de audio y texto con marcas temporales a nivel de palabra en una sola pasada forward.
- Predicción de fronteras de palabra validadas contra un fixture de referencia de 22 fronteras corregidas.
- Soporte multilingüe para nueve idiomas: inglés, chino, japonés, coreano, alemán, francés, español, italiano y ruso.
- Ejecución en Neural Engine (encoder por defecto `.cpuAndNeuralEngine`) y GPU (decoder por defecto `.cpuAndGPU`).
- Variante CPU-compatible del decoder (`text_decoder_cpu_v1`) con normalizaciones RMS en Float32 para ejecución exclusiva en CPU.
- Integración con la librería Swift `speech-swift` y CLI `speech align audio.wav --engine coreml`.
- No se menciona soporte de tool calling, function calling, agentes ni multi-step reasoning; el modelo está especializado en alineación.

## Casos de uso

- Subtitulado automático de vídeo: dado un audio y su transcripción, el modelo genera marcas temporales por palabra que permiten construir subtítulos sincronizados (SRT/VTT) con precisión de palabra, aprovechando la pasada única no autoregresiva.
- Sincronización de audiolibros con texto: al alinear narración y texto fuente, se pueden generar karaokes o resaltados de lectura que siguen la locución palabra a palabra en aplicaciones de lectura asistida.
- Anotación de corpus lingüísticos: investigadores pueden obtener timestamps por palabra para estudios fonéticos o de prosodia sin anotación manual, con soporte para nueve idiomas.
- Transcripción con marcas temporales en apps nativas de macOS/iOS: integrado vía `speech-swift`, el modelo se ejecuta en Neural Engine con RTF 0,015, adecuado para procesamiento en tiempo real en dispositivo.
- Control de calidad de doblaje: comparar la alineación de una transcripción con el audio doblado permite detectar desincronizaciones o palabras omitidas en la pista de voz.
- Búsqueda y recuperación sobre archivos de audio: las marcas temporales por palabra permiten indexar y saltar a fragmentos concretos de una grabación a partir de una consulta textual.
- Evaluación de sistemas ASR: la alineación forzada sirve para medir la precisión temporal de transcripciones producidas por otros modelos comparando fronteras de palabra.

## Benchmarks y rendimiento

Rendimiento histórico medido en M2 Max (64 GB, build debug, clip de 20 s):

| Metrica | Valor |
|---|---|
| RTF | 0,015 (67× más rápido que tiempo real) |
| Peak RSS | 1071 MB |
| Tiempo mediano de alineación | ~297 ms |

Perfil por etapas (`COREML_ALIGN_PROFILE=1`):

| Etapa | Tiempo |
|---|---|
| mel | 150 ms |
| encoder | 90 ms |
| embedding | 0,5 ms |
| splice | 0 ms |
| decoder | 44 ms |
| argmax | 7 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER) en la información disponible. Las cifras anteriores son de latencia y memoria, no de calidad de alineación.

## Requisitos de hardware

- VRAM/memoria: ~1,7 GB para FP16 (este repo); ~880 MB para la variante INT8 con ~35 % menos de pico de memoria.
- GPU recomendadas: Apple Silicon (M-series) con Neural Engine y GPU; las cifras de referencia son de M2 Max. También validado en M5 Pro con macOS 26.6.2.
- Cabe en hardware consumer: sí, en cualquier Mac con Apple Silicon; no está pensado para GPUs NVIDIA.
- Opciones de despliegue: CoreML nativo vía `speech-swift` (Swift), CLI `speech align`; variantes MLX (4bit, 5bit, 8bit, bf16) para rutas sin CoreML.
- Latencia y throughput: ~297 ms por clip de 20 s en M2 Max (RTF 0,015); el encoder por defecto usa `.cpuAndNeuralEngine` y el decoder `.cpuAndGPU`. La ejecución CPU-only requiere el bundle versionado `text_decoder_cpu_v1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-ForcedAligner-0.6B-CoreML-FP16 (este) | 0,6 B | Audio 30 s fijo | Apache 2.0 | CoreML FP16 | Alineación no autoregresiva, Apple Silicon |
| Qwen3-ForcedAligner-0.6B-CoreML-INT8 | 0,6 B | Audio 30 s fijo | Apache 2.0 | CoreML INT8 | ~880 MB, RTF similar, ~35 % menos memoria |
| Qwen/Qwen3-ForcedAligner-0.6B (upstream) | 0,6 B | no disponible | Apache 2.0 | safetensors (presumible) | Modelo base original, sin optimización CoreML |
| Variantes MLX (4bit/5bit/8bit/bf16) | 0,6 B | Audio 30 s fijo | Apache 2.0 | MLX | Rutas sin CoreML para Apple Silicon |

No se dispone de datos de benchmarks comparativos de calidad de alineación frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en alineación forzada; no es un modelo generativo de texto ni un ASR completo, requiere transcripción previa.
- Entrada de audio fija de 30 segundos (mel); clips más largos deben segmentarse.
- Formato CoreML orientado a Apple Silicon; no es portable a GPUs NVIDIA ni a entornos Linux sin conversión.
- El decoder legacy devuelve logits todo-cero con ejecución CPU-only en macOS 15.8.2; es necesario usar el bundle versionado `text_decoder_cpu_v1`.
- La validación física en iPhone queda pendiente según la model card; la validación en otros dispositivos es independiente.
- Las cifras de rendimiento histórico preceden a los bundles CPU y no describen la ejecución CPU-only.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones idiomáticas específicas más allá de los nueve idiomas listados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base upstream.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/aufklarer/Qwen3-ForcedAligner-0.6B-CoreML-FP16
- Variante INT8 companion: https://huggingface.co/aufklarer/Qwen3-ForcedAligner-0.6B-CoreML-INT8
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Librería speech-swift: https://github.com/soniqo/speech-swift
- Verificación de release CPU: https://github.com/soniqo/speech-swift/actions/runs/42855833533
