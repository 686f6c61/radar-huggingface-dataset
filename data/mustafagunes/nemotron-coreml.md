# mustafagunes/nemotron-coreml

## Resumen

Nemotron CoreML es una conversión a CoreML del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-3.5-asr-streaming-0.6b`, publicada por el usuario mustafagunes. El modelo original de NVIDIA emplea una arquitectura Conformer (encoder) más un decoder RNN-T (transducer) con aproximadamente 0,6 mil millones de parámetros, diseñado para transcripción en streaming multilingüe sobre ocho idiomas: inglés, español, francés, italiano, portugués, alemán, chino y japonés. Esta versión empaqueta el modelo para ejecutarse de forma nativa en Apple Silicon, aprovechando la Neural Engine (ANE), con el objetivo de ofrecer ASR en el dispositivo sin depender de la nube.

La relevancia de esta ficha reside en que expone un caso práctico de despliegue de ASR en hardware de consumo Apple, con un conjunto de ocho bundles que combinan dos vocabularios (uno podado a escritura latina de 2828 tokens y otro completo de 13087 tokens) con cuatro niveles de latencia (0,56 s, 1 s, 2 s y 4 s). El autor publica métricas de WER/CER sobre FLEURS y factores de tiempo real (RTFx) medidos en un Apple M5 Pro con macOS 26.5, lo que permite evaluar con datos concretos el equilibrio entre latencia, throughput y calidad.

El modelo se distribuye bajo licencia OpenMDW 1.1 y requiere solicitar acceso mediante un servidor de Discord indicado en la model card. La librería de referencia es FluidAudio, que gestiona la descarga y el enrutado del idioma al bundle correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) + RNN-T (decoder transducer) |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de streaming por chunks de 0,56 s, 1 s, 2 s o 4 s) |
| Tipos de cuantizacion | Encoder con precisión mixta LAYERPOS [42,13]: primeras y últimas 3 capas Conformer en INT8, 18 capas centrales en 6 bits palettizado; decoder y joint fusionados (B1) |
| Idiomas soportados | en, es, fr, it, pt, de, zh, ja (y más de 100 vía `prompt_id` en el vocabulario completo) |
| Licencia | OpenMDW 1.1 (acceso mediante solicitud en Discord) |
| Formato de pesos | CoreML (bundles para Apple Neural Engine); tamaño del repo 3,0 GB |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR de streaming con encoder Conformer y decoder RNN-T, orientado a transcripción incremental por fragmentos de audio. La conversión a CoreML aplica una receta de compresión concreta: un encoder de precisión mixta denominado LAYERPOS [42,13], en el que las tres primeras y las tres últimas capas Conformer se cuantizan a INT8 y las 18 capas intermedias a 6 bits con palettización, lo que reduce el tamaño del encoder en aproximadamente un 55 % respecto a FP16 sin degradar el WER según el autor. El decoder y el joint se fusionan en una etapa B1, y el pipeline completo emplea triple-stage pipelining para solapar etapas de cómputo.

La gestión del vocabulario se divide en dos variantes. La variante `latin/` comparte un joint podado a 2828 tokens para en/es/fr/it/pt/de, derivado del sistema de escritura (se conservan todos los tokens latinos y la puntuación y dígitos compartidos, y se descartan CJK, hangul, cirílico, árabe, etc.), no de ningún corpus de test, lo que evita sobreajuste y OOV dentro del script. La variante `multilingual/` mantiene el vocabulario completo de 13087 tokens, necesario para chino, japonés y más de 100 idiomas seleccionables mediante `prompt_id`. El encoder es compartido entre todos los idiomas y es idéntico byte a byte entre las variantes latin y full-vocab en cada nivel de latencia; solo cambia la pila de decodificación. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla en streaming con latencias configurables de 0,56 s, 1 s, 2 s y 4 s por chunk.
- Transcripción multilingüe en inglés, español, francés, italiano, portugués, alemán, chino y japonés, con selección explícita de idioma en inferencia (`--language de-DE`).
- Cobertura de más de 100 idiomas adicionales mediante `prompt_id` en la variante de vocabulario completo.
- Ejecución en el dispositivo sobre Apple Neural Engine, sin dependencia de servicios en la nube.
- Dos vocabularios especializados: uno latino podado (2828 tokens, joint más pequeño y rápido) y uno completo (13087 tokens, cobertura de caracteres CJK).
- Enrutado automático de idioma a bundle por parte del descargador de FluidAudio.
- Soporte de audio de formato WAV como entrada en la CLI de referencia.

## Casos de uso

- Transcripción de reuniones en local: el bundle `latin/2240ms` permite transcribir audio en inglés, español o alemán en un Mac con Apple Silicon a unas 130–150 veces tiempo real, sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado en directo de baja latencia: el tier de 1120 ms ofrece una latencia de 1,25 s con un throughput de 103–109 RTFx en idiomas latinos, suficiente para generar subtítulos casi en tiempo real en retransmisiones.
- Dictado por voz en aplicaciones macOS: la ejecución sobre ANE libera la CPU y la GPU para la aplicación anfitriona, y el modelo de 0,6 mil millones de parámetros cabe holgadamente en el espacio de trabajo de la Neural Engine.
- Atención al cliente con transcripción de llamadas: los idiomas latinos comparten un único archivo de modelo, lo que simplifica el despliegue de un servicio multilingüe de transcripción de conversaciones con contexto de audio continuo por chunks.
- Procesamiento por lotes de archivos de audio largos: el tier de 4480 ms mantiene una calidad dentro del ruido respecto al de 2 s y resulta adecuado para transcripción offline de archivos extensos donde la latencia no es crítica.
- Transcripción de contenido en chino y japonés: la variante `multilingual/2240ms` alcanza 84–90 RTFx con CER de 18,57 % y 13,79 % respectivamente, lo que la hace viable para indexar audio CJK en local.
- Aplicaciones de accesibilidad: la transcripción en dispositivo con latencia subsegundo (tier de 560 ms) puede alimentar sistemas de apoyo a personas con discapacidad auditiva, aceptando el pequeño coste de calidad de ese tier.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a FLEURS (splits completos). La columna de cada tier muestra RTFx y, entre paréntesis, WER para idiomas latinos o CER para chino y japonés.

| Idioma | Carpeta | Vocab | 0,56 s (560 ms) | 1 s (1120 ms) | 2 s (2240 ms) | 4 s (4480 ms) | Test set |
|---|---|--:|--:|--:|--:|--:|---|
| Inglés | latin | 2828 | 58 (9,43 %) | 103 (8,89 %) | 130 (8,96 %) | 122 (9,02 %) | FLEURS en_us |
| Español | latin | 2828 | 58 (4,95 %) | 106 (4,76 %) | 140 (4,80 %) | 136 (4,77 %) | FLEURS es_419 |
| Francés | latin | 2828 | 57 (9,68 %) | 105 (9,44 %) | 130 (9,52 %) | 124 (9,42 %) | FLEURS fr_fr |
| Italiano | latin | 2828 | 59 (5,68 %) | 109 (5,45 %) | 147 (5,41 %) | 150 (5,40 %) | FLEURS it_it |
| Portugués | latin | 2828 | 59 (6,38 %) | 108 (6,11 %) | 141 (6,14 %) | 141 (6,18 %) | FLEURS pt_br |
| Alemán | latin | 2828 | 59 (10,83 %) | 107 (9,78 %) | 144 (9,83 %) | 142 (9,83 %) | FLEURS de_de |
| Chino | multilingual | 13087 | 22 (19,48 % C) | 27 (18,75 % C) | 89 (18,57 % C) | 90 (18,05 % C) | FLEURS cmn_hans_cn |
| Japonés | multilingual | 13087 | 21 (14,61 % C) | 26 (13,77 % C) | 84 (13,79 % C) | 89 (13,82 % C) | FLEURS ja_jp |
| Multilingüe | multilingual | 13087 | 23 (9,15 %) | 71 (8,64 %) | 80 (8,76 %) | 78 (8,78 %) | FLEURS en_us |

El autor recomienda el tier de 2240 ms como valor por defecto: los bundles latinos rinden a 130–150 RTFx y los de chino/japonés/multilingüe alcanzan su máximo de 84–90 RTFx, con WER/CER en su mejor valor o cerca de él. El tier de 560 ms queda fuera del tiling de atención entrenado y presenta menor throughput y calidad. Los modelos de vocabulario completo son sensibles al tier: a 560 ms el coste del joint domina y el throughput cae a 21–23 RTFx. Las mediciones se realizaron en un Apple M5 Pro con macOS 26.5, en modo single-stream con batch=1.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine; el autor reporta mediciones en Apple M5 Pro con macOS 26.5.
- Tamaño del repo completo: 3,0 GB (incluye los ocho bundles); cada bundle es autocontenido y se descarga por separado.
- Memoria: no se publican cifras de VRAM o memoria unificada necesaria; al tratarse de un modelo de 0,6 mil millones de parámetros y ejecución en ANE, el espacio de trabajo por bundle es reducido, pero no se dispone de una cifra explícita.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable, ya que los pesos están en formato CoreML para Apple Silicon y no se indica compatibilidad con CUDA.
- Despliegue: FluidAudio mediante `fluidaudiocli nemotron-multilingual-transcribe`, con selección de `--model-dir` y `--language`; el descargador de FluidAudio enruta el idioma al bundle correcto.
- Throughput: hasta 130–150 RTFx en idiomas latinos con el tier de 2240 ms y 84–90 RTFx en chino/japonés/multilingüe con el mismo tier (single-stream, batch=1).
- Latencia: 0,56 s, 1 s, 2 s o 4 s de chunk según el tier; el autor cifra la latencia efectiva del tier de 1 s en 1,25 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B (CoreML, esta ficha) | 0,6 B | 8 principales, 100+ vía prompt_id | CoreML / Apple ANE | OpenMDW 1.1 | Streaming con tiers de 0,56–4 s; RTFx 80–150 |
| nvidia/nemotron-3.5-asr-streaming-0.6b (original) | 0,6 B | mismos idiomas | pesos originales (no especificado) | no disponible en la información | Modelo base del que deriva esta conversión; sin datos de rendimiento en la información proporcionada |
| Whisper (variantes de OpenAI) | no disponible en la información | multilingüe | múltiples (incl. CoreML en conversiones de terceros) | no disponible en la información | No se dispone de datos comparativos en la información proporcionada |

No se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación numérica de WER/CER y RTFx frente a ellos no está disponible.

## Limitaciones y advertencias

- El acceso al modelo requiere unirse a un servidor de Discord y solicitarlo al autor; no es una descarga abierta pese a la licencia OpenMDW 1.1.
- El tier de 560 ms está fuera del tiling de atención entrenado: menor throughput y pequeño coste de calidad; no recomendado para chino, japonés o multilingüe.
- Los modelos de vocabulario completo (13087 tokens) son sensibles al tier; a 1 s el throughput depende de la densidad del texto de salida y cae a unos 26 RTFx en CJK.
- El vocabulario latino podado descarta escrituras no latinas; usar la carpeta `latin` con audio CJK produciría resultados inválidos.
- Las métricas publicadas proceden de FLEURS y de un único dispositivo (Apple M5 Pro, macOS 26.5); el rendimiento en otros chips Apple puede diferir.
- No se dispone de información sobre sesgos, tasa de alucinación en ASR ni comportamiento con audio ruidoso o acentos no representados en FLEURS.
- La licencia OpenMDW 1.1 debe revisarse para uso comercial; la model card no detalla restricciones adicionales más allá del enlace a la licencia.
- El modelo está atado al ecosistema CoreML/ANE; no se indica soporte para GPUs NVIDIA ni para otros runtimes de inferencia.
- Es un modelo de ASR: no realiza traducción, diarización ni otras tareas fuera de la transcripción.

## Enlaces

- Hugging Face: https://huggingface.co/mustafagunes/nemotron-coreml
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Manifest de resultados: https://huggingface.co/mustafagunes/nemotron-coreml/blob/main/manifest.json
- Acceso (Discord): https://discord.gg/S6m4ET3pX
