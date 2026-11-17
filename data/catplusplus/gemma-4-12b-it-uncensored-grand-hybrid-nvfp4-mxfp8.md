# catplusplus/gemma-4-12B-it-uncensored-Grand-Hybrid-NVFP4-MXFP8

## Resumen

Gemma 4 12B IT Uncensored Grand Hybrid es una compresión en precisión mixta del modelo `TrevorJS/gemma-4-12B-it-uncensored`, publicada por el usuario `catplusplus`. Se trata de un checkpoint multimodal "any-to-any" que conserva las torres de audio y visión en BF16 mientras cuantiza el cuerpo central del transformer con NVFP4 (W4A4) y MXFP8, logrando un peso total de 10,84 GiB (11,7 GB en disco) que cabe en una GPU de consumo con 16 GB de VRAM. El objetivo declarado es evitar el colapso de las capacidades de reconocimiento de voz y comprensión visual que sufren las cuantizaciones uniformes de 4 bits.

El modelo base es una variante "uncensored" de Gemma 4 12B IT, con 11.959.730.224 parámetros reales según los safetensors. La ficha del autor incluye además dos predictores especulativos complementarios (MTP y DSpark) que aceleran la decodificación y que se distribuyen como checkpoints separados. La licencia declarada es Apache 2.0.

La relevancia actual del checkpoint radica en su estrategia de compresión selectiva por capas: protege en BF16 las proyecciones de atención global, las capas tempranas y los encoders de modalidad, y solo cuantiza las MLPs semánticas intermedias y la atención deslizante. El autor reporta paridad con BF16 en transcripción de voz y comprensión visual, con un rendimiento de decodificación en torno a 33-34 tok/s sin predictor y hasta 130 tok/s con el predictor MTP en modo razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 Unified), atención global + atención deslizante, torres de audio y visión |
| Parametros totales | 11.959.730.224 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el predictor MTP deja 254.059 tokens de KV cache FP8 en 16 GB; el DSpark deja 66.714) |
| Tipos de cuantizacion | Precisión mixta: BF16 (encoders, embeddings, capas 0-3, atención global, capas 46-47, norms), MXFP8 (atención deslizante intermedia), NVFP4 W4A4 (MLPs semánticas intermedias) |
| Idiomas soportados | No disponible (la calibración incluye inglés, japonés y code-switching) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, `gemma4_unified`) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con dos torres de modalidad (audio y visión) acopladas a un backbone de lenguaje Gemma 4 de 12B. La arquitectura emplea una combinación de atención global completa en capas seleccionadas (5, 11, 17, 23, 29, 35, 41, 47) y atención deslizante en las 35 capas intermedias restantes, con RMSNorm y Q/K Norms. El checkpoint incluye además soporte para decodificación especulativa mediante dos predictores separados: uno basado en MTP con 4 capas decoder Q-only de `hidden_size=1024` que comparten KV cache con las capas 46 y 47 del target, y otro DSpark de bloque-7 con 5 capas full-width (`hidden_size=3840`), puente cross-layer `fc` y cabeza de transición Markov paralela, entrenado con QAT sobre este mismo modelo base.

La compresión se realizó con `llmcompressor` en modo oneshot sobre 192 muestras multimodales balanceadas: 64 de voz y audio (inglés con acento, japonés y habla con code-switching), 48 imágenes fotográficas, 16 secuencias de vídeo multi-frame y 64 de código agéntico e instrucciones bilingües. La asignación de precisión es selectiva: BF16 en encoders de modalidad, `embed_tokens`, `lm_head`, capas 0-3, proyecciones Q/K/V/O de atención global, capas 46-47 y todas las normalizaciones; MXFP8 con micro-bloques de 32 elementos en la atención deslizante intermedia; NVFP4 W4A4 con micro-bloques de 16 elementos en las MLPs semánticas intermedias. El autor reporta una SNR de aproximadamente 31,5 dB para la parte MXFP8.

## Capacidades

- Generación de texto y razonamiento multi-turno, con modo `think=True` para razonamiento explícito.
- Reconocimiento automático de voz (STT) multilingüe, con preservación de rasgos acústicos gracias a la torre de audio en BF16.
- Comprensión visual: imágenes fotográficas y secuencias de vídeo multi-frame.
- Capacidades any-to-any: entrada de audio, imagen, vídeo y texto; salida de texto.
- Tool calling y function calling, con soporte para agentes multi-paso (el autor menciona "Tasuki Agent" con `ToolGuard` y `Clarifier`).
- Generación de código, con énfasis en cadenas de baja entropía y JSON estructurado.
- Traducción japonés-inglés y manejo de code-switching.
- Decodificación especulativa opcional mediante predictores MTP (K=5) o DSpark (K=7).
- Concurrencia multi-stream (hasta C=4 según las mediciones del autor).

## Casos de uso

- Transcripción de voz en producción: el modelo puede transcribir audio multilingüe (inglés, japonés, code-switching) manteniendo la torre de audio en BF16, lo que según el autor preserva la paridad con el modelo base sin cuantizar. Adecuado para subtitulado y actas de reuniones en GPUs de 16 GB.
- Asistente conversacional con contexto largo: con el predictor MTP se liberan 254.059 tokens de KV cache FP8 en una GPU de 16 GB, permitiendo conversaciones multi-turno extensas con TTFT de 54-85 ms.
- Generación de código en pipelines de CI/CD: el predictor DSpark alcanza 4,93 tokens por paso de decodificación en cadenas de código de baja entropía, útil para autocompletado y generación de parches.
- Agentes con salida JSON estructurada: el DSpark logra 156,0 tok/s y 0,45 s en veredictos de agente estructurados, adecuado para orquestación de herramientas y validación de esquemas.
- Análisis de imágenes y vídeo en local: la torre de visión en BF16 permite comprensión visual de imágenes fotográficas y secuencias multi-frame sin depender de servicios en la nube.
- Traducción automática japonés-inglés: el predictor MTP está optimizado para traducción bidireccional y code-switching, con rendimiento medido de 71-78 tok/s en chat directo.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en 16 GB (RTX 5060 Ti, Thor), permite prototipado e inferencia local de un modelo multimodal de 12B sin infraestructura de datacenter.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exact Match global STT (72 muestras, bilingüe) | 11,11 % (idéntico al base BF16) |
| Inglés nativo STT (n=10) | 60,0 % EM / 0,0937 CER / 0,2009 WER (base BF16: 40,0 % EM / 2,1444 CER) |
| Voz clonada STT (n=3) | 0,4267 CER (base BF16: 1,0553 CER) |
| Throughput chat directo (sin predictor) | 33,8-33,9 tok/s |
| Throughput razonamiento `think=True` (sin predictor) | 34,0 tok/s |
| Throughput chat directo con MTP (K=5) | 71,3-78,1 tok/s (TTFT 54-85 ms) |
| Throughput razonamiento con MTP | 130,4 tok/s |
| Throughput razonamiento con DSpark (K=7) | 131,1 tok/s |
| Throughput código con DSpark | 108,0-143,3 tok/s (4,926 tokens/paso) |
| Throughput agente DSpark (`ToolGuard`) | 156,0 tok/s (0,45 s) |
| Concurrencia C=1 / C=4 con MTP | 74,3 / 285,8 tok/s |
| Concurrencia C=1 / C=4 con DSpark | 70,7 / 227,6 tok/s |
| KV cache FP8 libre en 16 GB (MTP) | 254.059 tokens |
| KV cache FP8 libre en 16 GB (DSpark) | 66.714 tokens |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 10,84 GiB de pesos (11,7 GB en disco); con overhead de runtime y KV cache FP8, encaja en 16 GB.
- GPU objetivo declaradas: RTX 5060 Ti (`sm_120`), Thor (`sm_110`), y arquitecturas Ada/Hopper.
- Cabe en GPU de consumo de 16 GB; no se especifican requisitos para GPUs de menor VRAM.
- Opciones de despliegue: vLLM (con soporte para `Gemma4DSparkModel` y `share_target_embeddings: true` para el predictor DSpark); el formato `compressed-tensors` es compatible con vLLM.
- Latencia: TTFT de 54-85 ms con MTP en chat directo; 89-175 ms con DSpark.
- Throughput: 33-34 tok/s sin predictor; hasta 285,8 tok/s con MTP en C=4; hasta 156,0 tok/s con DSpark en agentes estructurados.
- El predictor MTP ocupa 420,65 MB; el DSpark ocupa 1.257,81 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| catplusplus/gemma-4-12B-it-uncensored-Grand-Hybrid-NVFP4-MXFP8 | 11,96B | No disponible | Apache 2.0 | safetensors (compressed-tensors) | Precisión mixta, multimodal, 10,84 GiB |
| TrevorJS/gemma-4-12B-it-uncensored (base) | 11,96B | No disponible | No disponible | No disponible | Modelo base sin cuantizar, referencia de calidad |
| catplusplus/gemma-4-12B-it-assistant-Unsloth-Dynamic-NVFP4-MXFP8 | No disponible | No disponible | No disponible | safetensors | Predictor MTP, 420,65 MB, orientado a chat y concurrencia |
| catplusplus/dspark-gemma-4-12b-it-Grand-Hybrid-Unsloth-Dynamic-NVFP4-MXFP8 | No disponible | No disponible | No disponible | safetensors | Predictor DSpark, 1.257,81 MB, orientado a código y JSON |

No se dispone de datos de benchmarks estándar para comparar el rendimiento absoluto con alternativas de la misma categoría (por ejemplo, otros modelos multimodales de 12B cuantizados). La comparación disponible se limita a métricas de velocidad y a la paridad STT con el modelo base BF16.

## Limitaciones y advertencias

- El modelo base es una variante "uncensored", lo que implica que se han relajado los filtros de seguridad; el autor no detalla el alcance de dicha relajación ni los sesgos resultantes.
- Riesgo de alucinación inherente a un modelo de 12B, no cuantificado en la información disponible.
- La calibración de la cuantización se hizo sobre 192 muestras; no se garantiza la preservación de precisión en dominios no representados (por ejemplo, audio en idiomas distintos del inglés y el japonés).
- El Exact Match global de STT es del 11,11 %, idéntico al base BF16 pero bajo en términos absolutos; el rendimiento varía mucho por subconjunto (60 % EM en inglés nativo).
- El predictor DSpark requiere una versión de vLLM con soporte para `Gemma4DSparkModel` y `share_target_embeddings: true`; sin ella no es desplegable.
- La licencia Apache 2.0 se declara en la model card, pero el modelo base es una variante derivada de Gemma 4; conviene verificar las condiciones de uso comercial del modelo original de Google antes de producción.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- No se especifican los idiomas soportados oficialmente; el soporte multilingüe se infiere de la calibración, no de una declaración formal.

## Enlaces

- Hugging Face: https://huggingface.co/catplusplus/gemma-4-12B-it-uncensored-Grand-Hybrid-NVFP4-MXFP8
- Modelo base: https://huggingface.co/TrevorJS/gemma-4-12B-it-uncensored
- Predictor MTP: https://huggingface.co/catplusplus/gemma-4-12B-it-assistant-Unsloth-Dynamic-NVFP4-MXFP8
- Predictor DSpark: https://huggingface.co/catplusplus/dspark-gemma-4-12b-it-Grand-Hybrid-Unsloth-Dynamic-NVFP4-MXFP8
