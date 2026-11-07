# FluidInference/cohere-transcribe-03-2026-coreml

## Resumen

Cohere Transcribe 03-2026 CoreML (variante Q8 cache-external) es una conversión a CoreML del modelo de reconocimiento automático del habla CohereLabs/cohere-transcribe-03-2026, publicada por FluidInference para inferencia en dispositivo dentro del ecosistema Apple. El paquete combina un encoder Conformer cuantizado a INT8 con un decoder autorregresivo en FP16 que gestiona la caché KV fuera del grafo CoreML, siguiendo el patrón Parakeet TDT. Está pensado para ejecutarse sobre Apple Neural Engine (ANE) en macOS 14+ e iOS 17+, y es la variante que emplea FluidAudio en producción.

El problema que resuelve es doble: por un lado, permitir transcripción multilingüe (14 idiomas) sin enviar audio a la nube; por otro, reducir el coste computacional del encoder, que concentra en torno al 65-70% del tiempo de procesamiento por muestra en FP16. La cuantización INT8 por canal de los pesos del encoder reduce su tamaño de 7,0 GB a 1,8 GB (aproximadamente 4x) y mejora la utilización del ANE sin una regresión de WER medible según el autor.

La relevancia actual reside en que ofrece una ruta práctica de despliegue on-device para ASR multilingüe en hardware Apple consumer, con un decoder pequeño (291 MB) que cabe holgadamente en memoria unificada y una API en Swift lista para integrarse en aplicaciones iOS y macOS. El repositorio ocupa 16,3 GB e incluye tanto los modelos compilados (.mlmodelc) como las fuentes (.mlpackage).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer (24 bloques) + decoder autorregresivo Transformer (8 capas) con caché KV externa, patrón Parakeet TDT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Entrada de audio de hasta 35 s por ventana (mel spectrogram [1, 128, 3500] a 10 ms/frame); decoder con atención sobre 438 frames de encoder y caché de hasta 108 posiciones |
| Tipos de cuantizacion | Encoder INT8 (cuantización de pesos por canal, activaciones FP16); decoder FP16 |
| Idiomas soportados | 14: inglés, francés, alemán, español, italiano, portugués, neerlandés, polaco, griego, árabe, japonés, chino, coreano y vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | CoreML (.mlmodelc compilado y .mlpackage fuente); tokenizer SentencePiece (16.384 tokens) y vocab.json |
| Tamano del encoder | 1,8 GB (INT8) frente a 7,0 GB en FP16 |
| Tamano del decoder | 291 MB (FP16) |
| Tokenizer | SentencePiece, vocabulario de 16.384 tokens |
| EOS token | 3 (`<|endoftext|>`) |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint CohereLabs/cohere-transcribe-03-2026, no un entrenamiento nuevo. La arquitectura sigue un esquema encoder-decoder: un encoder Conformer de 24 bloques procesa un espectrograma mel de entrada de forma [1, 128, 3500] (35 segundos a 10 ms por frame) y produce estados ocultos de forma [1, 438, 1024] en FP16. El decoder, de 8 capas, es un Transformer autorregresivo que consume el token actual, la posición, los estados del encoder y una máscara de atención que crece en cada paso, y devuelve logits sobre el vocabulario de 16.384 tokens junto con las cachés K y V actualizadas.

La innovación técnica principal es el patrón de caché externa: las 16 matrices de caché (8 capas x K/V) con forma [1, 8, 108, 128] se gestionan en Swift o Python fuera del grafo CoreML, lo que da una complejidad de decodificación O(n) con control manual del estado y evita las limitaciones de estado interno de CoreML. El decoder expone 19 entradas y 17 salidas para soportar este esquema. La cuantización INT8 se aplica solo al encoder, con pesos por canal y activaciones en FP16, manteniendo el decoder en FP16 por su sensibilidad a la precisión. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento automático del habla multilingüe en 14 idiomas (en, fr, de, es, it, pt, nl, pl, el, ar, ja, zh, ko, vi).
- Transcripción de audio de hasta 35 segundos por ventana de entrada, con decodificación autorregresiva token a token.
- Gestión manual de caché KV externa para decodificación incremental con complejidad lineal.
- Inferencia on-device sobre Apple Neural Engine, compatible con macOS 14+ e iOS 17+.
- Integración nativa en Swift mediante FluidAudio (`CohereFixedPipeline`) y uso en Python a través de coremltools.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido; es un modelo especializado exclusivamente en ASR.
- No se documentan capacidades de diarización de hablantes, timestamps por palabra ni traducción automática.

## Casos de uso

- Transcripción de reuniones en local: el modelo procesa audio de hasta 35 s por ventana sobre el ANE del Mac, sin enviar datos a la nube, lo que encaja en entornos con requisitos de privacidad y cumplimiento.
- Subtitulado de vídeo en aplicaciones iOS: con un decoder de 291 MB y encoder de 1,8 GB, el paquete completo puede residir en memoria unificada de un iPhone o iPad reciente, permitiendo generar subtítulos en 14 idiomas dentro de la app.
- Dictado por voz en macOS: la latencia de decodificación O(n) con caché externa y la ejecución en ANE permiten transcripción incremental mientras el usuario habla, sin depender de conectividad.
- Asistentes de voz para atención al cliente en dispositivos Apple: la transcripción on-device del audio del usuario evita exponer conversaciones a servicios externos y reduce el coste por minuto frente a APIs en la nube.
- Indexación y búsqueda de archivos de audio locales: transcripción por lotes de grabaciones en 14 idiomas para construir índices de texto consultables, aprovechando el rendimiento de 1,65x a 1,93x RTFx medido en FLEURS.
- Aplicaciones de accesibilidad: conversión de voz a texto en tiempo real para personas con discapacidad auditiva, ejecutándose íntegramente en el dispositivo y funcionando sin red.
- Procesamiento de audio multilingüe en el borde: despliegue en dispositivos Apple sin GPU dedicada, donde el encoder INT8 de 1,8 GB permite encajar el modelo en memoria de un solo dispositivo frente a los 7,0 GB de la variante FP16.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con `fluidaudiocli cohere-mixed-benchmark` sobre FLEURS (splits completos, encoder INT8 + decoder FP16 cache-external, ejecución en ANE):

| Idioma | Muestras | WER | CER | RTFx |
|---|---:|---:|---:|---:|
| en_us | 647 | 5,63% | 3,19% | 1,93x |
| fr_fr | 676 | 6,22% | 3,11% | 1,65x |
| Otros idiomas | no disponible | no disponible | no disponible | no disponible |

Referencia de paridad en LibriSpeech test-clean (variante FP16):

| Métrica | Valor |
|---|---|
| WER (FP16) | 11,95% |
| Transcripciones perfectas | 2 / 10 |
| Errores principales | Diferencias de puntuación |

El autor indica que el WER del encoder INT8 en LibriSpeech está dentro del ruido del FP16, validado comparando los estados ocultos del encoder contra la referencia FP16 sobre el mismo audio. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo especializado en ASR.

## Requisitos de hardware

- VRAM/memoria estimada: el paquete completo ocupa aproximadamente 2,1 GB en disco y en memoria (encoder INT8 de 1,8 GB + decoder FP16 de 291 MB + tokenizer y vocabulario de menos de 1 MB).
- Hardware objetivo: Apple Silicon con Neural Engine (series M1 en adelante para Mac; chips A-series y M-series recientes para iPhone e iPad). El autor no especifica modelos mínimos concretos.
- Compatibilidad de sistema: macOS 14 o superior e iOS 17 o superior.
- Cabe en GPU consumer: no aplica directamente, ya que el despliegue es vía CoreML y ANE; la variante FP16 del encoder (7,0 GB) también cabría en memoria unificada de Macs con 16 GB o más, pero el autor recomienda la INT8 por rendimiento y utilización del ANE.
- Opciones de despliegue: CoreML mediante coremltools en Python y FluidAudio en Swift (`CohereFixedPipeline`, `CohereDecoderState`, `CohereModelInference`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de audio y no de texto.
- Latencia y throughput: RTFx de 1,93x en inglés (en_us) y 1,65x en francés (fr_fr) sobre FLEURS con el benchmark de FluidAudio. No se publican cifras de latencia por segmento en milisegundos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Cohere Transcribe 03-2026 CoreML Q8 (este) | Encoder-decoder Conformer + Transformer | no disponible | 35 s por ventana | 14 | Apache 2.0 | CoreML INT8/FP16 |
| FluidInference/cohere-transcribe-cache-external-coreml | Misma arquitectura, encoder FP16 | no disponible | 35 s por ventana | 14 | Apache 2.0 | CoreML FP16 (7,0 GB encoder) |
| CohereLabs/cohere-transcribe-03-2026 | Modelo base original | no disponible | no disponible | 14 | Apache 2.0 | Pesos originales (formato no especificado) |
| Whisper large-v3 (referencia de categoría) | Encoder-decoder Transformer | no disponible en la información proporcionada | 30 s por ventana | ~99 | MIT | safetensors, GGUF, CoreML (conversiones de terceros) |

La comparación directa con Whisper large-v3 no puede cuantificarse con los datos disponibles: no se han publicado en esta información métricas de WER de Whisper sobre FLEURS en las mismas condiciones ni el número de parámetros del modelo Cohere. La ventaja diferencial de esta variante frente a la FP16 es el tamaño (1,8 GB frente a 7,0 GB de encoder) con paridad de WER declarada.

## Limitaciones y advertencias

- Ventana de audio limitada a 35 segundos por muestra; audios más largos requieren segmentación externa y gestión de solapamientos.
- Solo se han publicado métricas de WER y CER para inglés (en_us) y francés (fr_fr); el rendimiento en los otros 12 idiomas declarados no está validado en la información disponible.
- El WER en LibriSpeech test-clean de la referencia FP16 es del 11,95%, con solo 2 de 10 transcripciones perfectas y errores atribuidos a puntuación; en dominios ruidosos o con acentos marcados el error puede ser mayor.
- El EOS token correcto es 3, no 151643; usar el valor incorrecto provoca fallos de decodificación porque el vocabulario solo tiene 16.384 tokens.
- La gestión de caché KV es manual: un error en el crecimiento de la máscara de atención o en la reutilización de las 16 cachés produce salidas corruptas sin aviso explícito del runtime.
- Riesgo de alucinación en pasajes de silencio, ruido o audio ininteligible, habitual en modelos ASR autorregresivos; no se documentan mecanismos de detección de no-habla.
- No se documentan sesgos demográficos, dialectales ni de género del modelo base; al ser una conversión, hereda los del checkpoint original.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y no ofrece garantías; conviene verificar las condiciones del modelo base CohereLabs por si añaden restricciones adicionales.
- Dependencia de hardware Apple: no es desplegable en GPUs NVIDIA, AMD ni en CPU x86 mediante este paquete CoreML.
- El repositorio ocupa 16,3 GB por incluir versiones compiladas y fuente de ambos componentes; la descarga completa no es necesaria si solo se usan los .mlmodelc.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FluidInference/cohere-transcribe-03-2026-coreml
- README del modelo: https://huggingface.co/FluidInference/cohere-transcribe-03-2026-coreml/blob/main/README.md
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Variante FP16 cache-external: https://huggingface.co/FluidInference/cohere-transcribe-cache-external-coreml
- Repositorio FluidAudio: https://github.com/FluidInference/FluidAudio
- README de la variante FP16 (bucle Python completo): https://huggingface.co/FluidInference/cohere-transcribe-cache-external-coreml/blob/main/README.md#usage
