# pisar/parakeet-ultra-mlx

## Resumen

parakeet-ultra-mlx es una conversión de formato del modelo de reconocimiento automático del habla (ASR) moondream/parakeet-ultra, realizada por el usuario pisar para ejecutarse en Apple Silicon mediante la librería MLX. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son idénticos a los del modelo original, únicamente se han traducido los nombres de los tensores y su disposición en memoria para que encajen en el grafo NeMo/MLX que espera `ParakeetModel` de mlx-audio-swift. El resultado son 627 millones de parámetros en bfloat16, sin cuantización adicional ni poda.

El modelo resuelve transcripción de voz a texto multilingüe (24 idiomas europeos, incluido el español) sobre hardware de Apple, sin necesidad de GPU dedicada. Su relevancia es práctica: permite ejecutar un sistema ASR de la familia Parakeet TDT en Macs con chip M-series a velocidades muy superiores al tiempo real, integrándolo en aplicaciones locales como OpenMeet.

La arquitectura subyacente es un modelo TDT (Token-and-Duration Transducer) de NVIDIA, concretamente la base parakeet-tdt-0.6b-v3, sobre la que moondream publicó un post-entrenamiento denominado parakeet-ultra. Esta conversión hereda la licencia CC-BY-4.0 del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) con encoder convolucional + atención relativa, predictor LSTM y joint network |
| Parámetros totales | 627.052.166 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bfloat16 (sin cuantización adicional; el autor indica que no se ha cuantizado por debajo de bf16) |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El modelo es un transducer TDT, una variante de las arquitecturas RNN-Transducer en la que el decoder predice conjuntamente tokens y duraciones, lo que permite decodificación no autorregresiva por bloques y reduce la latencia. La estructura incluye un encoder con subsampling convolucional (convoluciones depthwise y pointwise con normalización por lotes), capas de self-attention con proyección de posición relativa (`linear_pos`, `pos_bias_u`, `pos_bias_v`), un predictor basado en LSTM y una joint network que combina las representaciones del encoder y del predictor.

No se ha realizado ningún reentrenamiento, cuantización por debajo de bf16 ni poda en esta conversión. El autor documenta que los pesos son los del modelo upstream con nombres y layouts traducidos: por ejemplo, `encoder.subsampling.layers.N.*` pasa a `encoder.pre_encode.conv.N.*` con conversión NCHW→NHWC, y `decoder.lstm.weight_ih_lN`/`weight_hh_lN` pasan a `decoder.prediction.dec_rnn.lstm.N.{Wx,Wh}`. Se descartaron la cabeza de detección de actividad de voz (`vad_head.*`, 6 tensores) y 24 contadores `num_batches_tracked` de BatchNorm, quedando 697 tensores que coinciden nombre a nombre y forma a forma con `mlx-community/parakeet-tdt-0.6b-v3`. El `config.json` y el tokenizer se tomaron de esa referencia sin cambios, tras verificar que los vocabularios son idénticos (8192 de 8192 tokens).

La verificación incluyó similitud coseno frente a la referencia en los 697 tensores (mediana 1.0000, media 0.9998, mínimo superior a 0.8) y una prueba de transcripción sobre un clip de 7 segundos con coincidencia palabra por palabra, puntuación incluida. Los datos de entrenamiento originales (número de tokens, composición del corpus, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Transcripción de voz a texto (ASR) en 24 idiomas europeos, incluidos español, inglés, alemán, francés, italiano, portugués, neerlandés, polaco, rumano, griego y las lenguas nórdicas y bálticas.
- Salida con puntuación, según la prueba documentada por el autor.
- Decodificación TDT con predicción conjunta de tokens y duraciones, adecuada para streaming y procesamiento por bloques.
- Ejecución en Apple Silicon mediante MLX, sin GPU dedicada.
- Integración con el ecosistema mlx-audio-swift a través de `ParakeetModel`.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada más allá de la transcripción ni modo de razonamiento extendido.

## Casos de uso

- Transcripción local en macOS: ejecutar el modelo con MLX en un Mac con chip M-series para convertir reuniones o notas de voz en texto sin enviar audio a servicios externos, gracias a su rendimiento de 176–189× tiempo real en un clip de 19 segundos.
- Subtitulado de contenido audiovisual en español y otras lenguas europeas: el soporte de 24 idiomas permite generar subtítulos en un pipeline local, con la ventaja de que el modelo produce puntuación.
- Actas de reuniones en aplicaciones como OpenMeet: el modelo fue empaquetado específicamente para OpenMeet, de modo que encaja en flujos de transcripción de conversaciones multi-hablante con procesamiento en el dispositivo.
- Dictado por voz en herramientas de productividad: al ser un modelo de 627 M de parámetros en bf16 (repo de 1,3 GB), puede cargarse en memoria unificada de un Mac y responder con baja latencia para dictado interactivo.
- Preprocesado de audio para pipelines de NLP: transcribir grandes volúmenes de audio por lotes en estaciones de trabajo Apple antes de aplicar análisis de texto, clasificación o resumen con modelos de lenguaje.
- Investigación en ASR multilingüe: servir como referencia reproducible en MLX del modelo parakeet-ultra para comparar frente a parakeet-tdt-0.6b-v3 en corpus reales, dado que el autor advierte que las ganancias publicadas no se reprodujeron en voz sintética.
- Transcripción de audio en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, evita la exposición de datos de voz a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER en Open ASR Leaderboard, MMLU u otros) en la información disponible para esta conversión concreta. El autor sí documenta mediciones propias:

| Prueba | Resultado |
|---|---|
| Similitud coseno frente a la referencia (697 tensores) | mediana 1.0000, media 0.9998, mínimo > 0.8 |
| Coincidencia de nombres y formas de tensores | 697/697 |
| Transcripción de clip de 7 s | idéntica a la referencia, puntuación incluida |
| Comparación en voz sintética (limpia, 10/5/0 dB SNR, alemán) | texto idéntico salvo un token a 0 dB, donde este modelo fue peor |
| Throughput (clip de 19 s, misma máquina) | 176–189× tiempo real frente a 184–192× de la referencia |

El autor advierte explícitamente que las ganancias de precisión del modelo upstream no se reprodujeron en estas pruebas y que la voz sintética es un test demasiado fácil, por lo que recomienda medir sobre audio real.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 1,3 GB en bf16; se necesita al menos esa cantidad de memoria libre, más overhead de runtime MLX.
- Hardware objetivo: Apple Silicon (M-series) con MLX; no está pensado para GPU NVIDIA ni CUDA.
- Cabe en cualquier Mac con memoria unificada de 8 GB o superior, dado el tamaño del modelo.
- Despliegue: librería MLX y mlx-audio-swift (`ParakeetModel`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 176–189× tiempo real en un clip de 19 segundos según el autor, en la misma máquina que la referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pisar/parakeet-ultra-mlx | 627 M | 24 europeos | safetensors (MLX, bf16) | CC-BY-4.0 | Conversión de parakeet-ultra para Apple Silicon |
| mlx-community/parakeet-tdt-0.6b-v3 | ~627 M | 24 europeos | safetensors (MLX) | no disponible en la información | Referencia de formato; pesos casi idénticos según similitud coseno |
| moondream/parakeet-ultra | no disponible | 24 europeos | safetensors (HF `ParakeetForTDT`) | CC-BY-4.0 | Modelo upstream, publicado para Photon |
| nvidia/parakeet-tdt-0.6b-v3 | ~627 M | 24 europeos | no disponible | no disponible | Base de NVIDIA sobre la que se post-entrenó parakeet-ultra |

## Limitaciones y advertencias

- No es un modelo nuevo: es una conversión de formato. Cualquier limitación del modelo upstream (sesgos del corpus de entrenamiento, errores en acentos o audio ruidoso) se hereda íntegramente.
- El autor no reprodujo las ganancias de precisión publicadas del modelo upstream; en su comparación en voz sintética el rendimiento fue prácticamente idéntico e incluso peor en un token a 0 dB SNR.
- Riesgo de alucinación en ASR: como todo transducer, puede generar texto plausible en segmentos de silencio o ruido extremo; conviene validar sobre audio real antes de producción.
- Se eliminó la cabeza de detección de actividad de voz (`vad_head.*`), por lo que no hay VAD integrado en esta conversión.
- La longitud de contexto no está documentada; el comportamiento en audios muy largos depende del troceado que haga el runtime.
- Licencia CC-BY-4.0: permite uso comercial con atribución obligatoria a moondream (parakeet-ultra) y a NVIDIA (parakeet-tdt-0.6b-v3).
- Dependencia de MLX y Apple Silicon: no es portable a CUDA sin una nueva conversión.
- El repositorio no tiene descargas ni likes y fue creado en noviembre de 2026, por lo que su adopción y mantenimiento son inciertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pisar/parakeet-ultra-mlx
- Modelo upstream: https://huggingface.co/moondream/parakeet-ultra
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Referencia de formato MLX: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v3
- Librería mlx-audio-swift: https://github.com/Blaizzy/mlx-audio-swift
- OpenMeet: https://openmeet.ai
- Photon (moondream): https://moondream.ai/photon
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
