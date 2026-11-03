# pantinor/sherpa-onnx-whisper-large-finnish-v3

## Resumen

`sherpa-onnx-whisper-large-finnish-v3` es una exportación a ONNX con cuantización int8 del modelo `Finnish-NLP/whisper-large-finnish-v3`, un ajuste fino completo de Whisper large-v3 para finlandés. Lo publica el usuario `pantinor` para el catálogo de modelos de la comunidad del proyecto Anti-Vocale, y su función es permitir el despliegue del reconocimiento automático de voz (ASR) en finlandés mediante el runtime sherpa-onnx sin necesidad de PyTorch ni de los mirrors ONNX habituales de transformers.js, que son estructuralmente incompatibles con sherpa-onnx.

El modelo subyacente es un transformer encoder-decoder de tipo Whisper large-v3, con aproximadamente 1.540 millones de parámetros y una ventana de audio de 30 segundos por chunk. La exportación mantiene la forma `-attn` del decoder (cuatro salidas, incluida `cross_attention_weights`), lo que habilita las marcas de tiempo a nivel de token mediante DTW con `enable_token_timestamps=True`.

Es relevante porque cubre un nicho concreto: ASR de calidad para finlandés en entornos de producción ligeros (móvil, escritorio, edge) usando un único runtime C++/Python. El autor reporta 7,09 WER en FLEURS fi_fi con decodificación greedy, frente a 9,05 de whisper-large-v3-turbo en el mismo protocolo, lo que sitúa esta exportación por delante del turbo multilingüe en finlandés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), exportado a ONNX |
| Parametros totales | 1,54 B (1.540 millones, según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto de texto; ventana de audio de 30 s por chunk (Whisper) |
| Tipos de cuantizacion | int8 (encoder MatMul int8; decoder per-channel int8); checkpoint base en fp32 |
| Idiomas soportados | finlandés (fi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.pc-int8.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: un encoder transformer que procesa espectrogramas Mel de 30 segundos y un decoder autorregresivo que genera tokens de texto con atención cruzada sobre la salida del encoder. El checkpoint base fue ajustado completamente para finlandés por Finnish-NLP; el autor de esta exportación no aporta datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del exportador remite a la model card de Finnish-NLP para los detalles de entrenamiento, que no se incluyen en la información disponible.

La innovación técnica de este repositorio está en la conversión, no en el entrenamiento. Se reexportó desde el checkpoint PyTorch con un toolchain alineado a la era del modelo (torch 2.3.1, onnx 1.16.2, onnxruntime 1.18.1, numpy 1.26.4) y los scripts de exportación de sherpa-onnx v2.0.1. Destacan tres decisiones: (1) exportación en forma `-attn` con metadatos `n_alignment_heads` para timestamps DTW; (2) permutación de los ids del tokenizer, porque el tokenizer HF del checkpoint inserta `<|yue|>` en el id 50358 y desplaza todos los tokens especiales desde 50359, por lo que se permutó la embedding (y la proyección de salida con pesos atados) al orden de openai-whisper, eliminando la fila `<|yue|>` y pasando de n_vocab 51866 a 51865; (3) cuantización per-channel del decoder, ya que la cuantización dinámica int8 per-tensor provoca fin de transcripción prematuro en audio largo (aproximadamente una frase por chunk de 30 s).

## Capacidades

- Reconocimiento automático de voz (ASR) en finlandés, con decodificación greedy y tarea `transcribe`.
- Marcas de tiempo a nivel de token mediante DTW (`enable_token_timestamps=True`), gracias a la forma `-attn` del decoder y a los metadatos de alignment heads.
- Procesamiento de audio por chunks de 30 segundos; el autor valida una sonda de 67 s con decodificación de 4 frases sin EOT prematuro.
- Inferencia mediante `sherpa_onnx.OfflineRecognizer.from_whisper` en Python, y por extensión en los bindings de sherpa-onnx (C++, C#, Java, Kotlin, etc., según el runtime).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No dispone de capacidades de visión, audio generativo ni thinking mode.
- Capacidad multilingüe limitada al finlandés en la práctica; el tokenizer es el multilingüe estándar de Whisper, pero el ajuste fino es específico de fi.

## Casos de uso

- Transcripción de reuniones y entrevistas en finlandés: el modelo procesa audio en chunks de 30 s con timestamps por token, lo que permite generar subtítulos alineados temporalmente para actas y búsqueda dentro del texto transcrito.
- Subtitulado automático de vídeo y pódcast en finlandés: los timestamps DTW habilitan la sincronización de subtítulos sin necesidad de un alineador externo, y el formato ONNX int8 reduce el coste de inferencia en servidores modestos.
- Integración en aplicaciones móviles y de escritorio mediante sherpa-onnx: el runtime nativo permite ejecutar ASR sin Python ni PyTorch, lo que encaja en apps de notas de voz o asistentes locales para usuarios finlandeses.
- Dictado por voz en herramientas de productividad: la ventana de 30 s y la decodificación greedy ofrecen latencia baja para transcripción incremental de dictados cortos.
- Análisis de grabaciones de atención al cliente: transcripción por lotes de llamadas en finlandés para extracción de métricas, con la ventaja de una licencia Apache-2.0 que permite uso comercial sin restricciones adicionales.
- Investigación en ASR de lenguas urálicas: sirve como línea base reproducible en sherpa-onnx para comparar fine-tunes de Whisper en finlandés, con un protocolo de evaluación documentado (FLEURS fi_fi, decodificación greedy, normalización jiwer).

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| FLEURS fi_fi (WER, sherpa-onnx 2.0.1, greedy, jiwer-normalized) | 7,09 | 40 clips; Apple M3 Pro, 4 hilos |
| FLEURS fi_fi, whisper-large-v3-turbo (mismo protocolo) | 9,05 | Referencia comparativa del autor |
| FLEURS fi (WER normalizado, model card upstream) | 8,21 | Resultado del checkpoint Finnish-NLP original |
| Common Voice 11 fi (WER normalizado, model card upstream) | 8,23 | Resultado del checkpoint Finnish-NLP original |
| Divergencia fp32 vs int8 a nivel de palabra | 4,35 % – 6,67 % | Sondas del autor |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: los ficheros ONNX int8 suman aproximadamente 1,78 GB (encoder 766.681.404 bytes + decoder 1.011.267.563 bytes); con overhead de runtime, se puede estimar un consumo en torno a 2–3 GB de memoria en CPU o GPU.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 4 GB de VRAM es suficiente (RTX 3050, RTX 4060, T4, L4). Para despliegues de alto throughput, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM; también en CPU.
- Opciones de despliegue: sherpa-onnx (runtime principal, con `OfflineRecognizer.from_whisper`), onnxruntime directamente; no se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, que no aplican a este formato y tarea.
- Latencia y throughput: el autor reporta la prueba en Apple M3 Pro con 4 hilos, pero no publica cifras de latencia ni de throughput (RTF). No disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER FLEURS fi_fi | Licencia | Formato |
|---|---|---|---|---|---|
| sherpa-onnx-whisper-large-finnish-v3 (este) | 1,54 B | 30 s/chunk | 7,09 | Apache-2.0 | ONNX int8 |
| whisper-large-v3-turbo | no disponible (turbo) | 30 s/chunk | 9,05 | MIT (openai-whisper) | PyTorch, ONNX |
| Finnish-NLP/whisper-large-finnish-v3 (base) | 1,54 B | 30 s/chunk | 8,21 (FLEURS fi) | Apache-2.0 | PyTorch safetensors |
| Whisper large-v3 (multilingüe) | 1,55 B | 30 s/chunk | no disponible en la información | MIT | PyTorch, ONNX |

La comparación con whisper-large-v3-turbo y con el checkpoint base es la más directa; no se dispone de datos de otros fine-tunes finlandeses en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en finlandés; el rendimiento en otros idiomas no está validado y probablemente sea deficiente pese al tokenizer multilingüe.
- Riesgo de alucinación de texto en audio con ruido, silencios largos o habla no finlandesa, comportamiento característico de Whisper.
- La cuantización int8 introduce divergencia a nivel de palabra del 4,35 % al 6,67 % frente a fp32 en las sondas del autor; para transcripciones que requieran máxima fidelidad conviene evaluar la versión fp32.
- La validación en dispositivo móvil representativo estaba pendiente en el momento de la publicación, según el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint base Finnish-NLP/whisper-large-finnish-v3 y de Whisper large-v3 (MIT) en la cadena de derivación.
- El tokenizer ha sido permutado respecto al checkpoint HF original; herramientas que esperen el tokenizer HF sin permutar pueden producir marcas de tiempo o tokens de tarea incorrectos.
- No apto para tareas de generación de texto, razonamiento, código o agentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pantinor/sherpa-onnx-whisper-large-finnish-v3
- Modelo base: https://huggingface.co/Finnish-NLP/whisper-large-finnish-v3
- Proyecto Anti-Vocale: https://github.com/RisorseArtificiali/anti-vocale
- sherpa-onnx: no se proporciona enlace en la información disponible
- openai-whisper: no se proporciona enlace en la información disponible
