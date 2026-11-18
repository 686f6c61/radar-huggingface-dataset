# JoaoZaokk/parakeet-ultra-pten-gguf

## Resumen

Parakeet Ultra PT+EN GGUF es una colección de cuantizaciones mixtas en formato GGUF derivadas de `moondream/parakeet-ultra`, un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura Conformer de NVIDIA Parakeet TDT. El autor, JoaoZaokk, no entrena el modelo desde cero: parte de los pesos post-entrenados de Moondream (a su vez derivados de `nvidia/parakeet-tdt-0.6b-v3`) y aplica una cirugía de vocabulario y una asignación de precisión por capa y por rol para optimizar la inferencia offline en Apple Silicon.

El modelo resuelve dictado y transcripción en portugués e inglés con un enfoque práctico: reducir el peso del modelo por debajo de los 500 MiB sin sacrificar los 24 bloques Conformer del encoder, manteniendo una tasa de error de palabra (WER) de en torno al 1,17% respecto a la versión F16. Con 623,8 millones de parámetros totales, está pensado para ejecutarse en equipos de consumo con memoria unificada (16 GB), no en clústeres de GPU.

Su relevancia actual radica en la combinación de tres técnicas poco habituales en modelos ASR cuantizados: poda de vocabulario específica para PT/EN, convoluciones pointwise almacenadas en 2D para habilitar kernels `ggml_mul_mat` cuantizados, y una asignación de precisión mixta que protege las rutas estructuralmente sensibles (normalizaciones, sesgos, convoluciones depthwise) en F32 mientras comprime las capas de feed-forward a Q4_K o Q5_K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 24 bloques) con decoder TDT (Token-and-Duration Transducer) |
| Parametros totales | 623.840.149 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por chunks con VAD basado en pausas) |
| Tipos de cuantizacion | Q8_0, Q5_K, Q4_K, MXFP4, F16, F32 (mixta por capa y rol) |
| Idiomas soportados | Portugues (pt), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (GGML), con variantes de precision mixta |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder Conformer de 24 bloques (`stt.parakeet.encoder.n_layers = 24`) combinado con un decoder TDT (Token-and-Duration Transducer), el mismo esquema de `nvidia/parakeet-tdt-0.6b-v3`. El modelo base de Moondream aplica post-entrenamiento con chunking VAD basado en pausas sobre los pesos de NVIDIA. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre la composición del dataset original.

La innovación de esta ficha no está en el entrenamiento sino en la conversión y cuantización. El autor aplica tres transformaciones: (1) cirugía de vocabulario que reduce de 8193 a 5519 tokens eliminando escrituras no PT/EN (cirílico, griego, diacríticos de Europa del Este) de `pred.embed.weight` y `joint.out`, conservando los 274 tokens de control SentencePiece y los 5 outputs de duración TDT; (2) conversión de las convoluciones pointwise de 3D `[1, in, out]` a 2D `[in, out]` para habilitar kernels cuantizados directos; (3) asignación de precisión mixta por capa: `norm_*`, sesgos, `conv.depthwise.weight` y `pos_bias_{u,v}` en F32; `enc.pre_encode.conv.*` en F16; `enc.pre_encode.out`, `pred.*`, `joint.*` y `attn.linear_{q,k,v,out,pos}` en Q8_0; y las capas feed-forward en Q5_K o Q4_K según la variante. En la variante "edge", los bloques exteriores (0–5 y 20–23) mantienen `ff1` en Q5_K mientras los centrales (6–19) lo comprimen a Q4_K.

## Capacidades

- Transcripción de voz a texto (ASR) en portugués e inglés.
- Dictado offline en tiempo real sobre Apple Silicon (M2, memoria unificada de 16 GB).
- Procesamiento de audio corto (decenas de segundos) y largo (más de 30 s) sin degradación por residencia de memoria.
- Manejo de chunks de audio con VAD basado en pausas (heredado del modelo base de Moondream).
- Salidas TDT con predicción de duración (5 outputs de duración) para alineamiento temporal.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de capacidades de visión, audio generativo ni multimodalidad más allá de la entrada de audio.
- Capacidades multilingües limitadas a pt y en; el vocabulario podado elimina explícitamente otros alfabetos.

## Casos de uso

- Dictado personal offline en macOS: el modelo se integra en la app Handy (fork `JoaoZaokk/handy-custom`) para transcribir dictado en portugués e inglés sin conexión, con latencia de 662 ms en audio de 24,5 s según la variante edge.
- Transcripción de reuniones y notas de voz: la ventana de procesamiento por chunks con VAD permite manejar grabaciones de varios minutos en un M2 de 16 GB sin stalls de memoria, gracias a la conversión 2D de las convoluciones pointwise.
- Subtitulado ligero en portugués e inglés: los 5 outputs de duración TDT permiten obtener alineamiento temporal aproximado para generar subtítulos en pipelines de vídeo locales.
- Asistentes de voz embebidos: el tamaño de 406–430 MiB en las variantes recomendadas permite incluirlo en aplicaciones de escritorio o dispositivos con memoria unificada limitada, sin depender de API en la nube.
- Investigación en cuantización de modelos ASR: las variantes publicadas (hyb, edge, Q8_0-Q4_K-pw2d, MXFP4) sirven como referencia reproducible para estudiar el impacto de la precisión mixta por capa en WER y latencia.
- Transcripción de contenido bilingüe PT/EN: útil para podcasts, entrevistas o documentación técnica donde se alternan ambos idiomas, con un vocabulario optimizado para ambos alfabetos.
- Despliegue en CI/CD para generación de actas: el motor `transcribe.cpp` (fork `JoaoZaokk/transcribe-custom`) permite automatizar transcripciones en pipelines locales sin GPU dedicada.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (WER y latencias sobre Apple M2, `Mac14,2`, 16 GB):

| Variante | Tamano | WER vs F16 | Latencia audio corto | Latencia audio largo |
|---|---:|---:|---:|---:|
| hyb-Q8_0-Q5_K-Q4_K | 430,8 MiB | 1,17% | 697 ms | 2,27 s |
| edge-Q8_0-Q5_K-Q4_K | 416,8 MiB | no disponible | 662,2 ms (24,5 s, 37x RT) | 2467,3 ms (56,1 s EN) |
| Q8_0-Q4_K-pw2d | 406,8 MiB | no disponible | no disponible | 2149,5 ms (45,9 s) |
| MXFP4 | 326,6 MiB (-72,6% vs F16 podado) | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech) en la información disponible. Los únicos datos son WER relativo a F16 y latencias medidas en hardware concreto.

## Requisitos de hardware

- VRAM/memoria estimada: 326,6 MiB (MXFP4) a 430,8 MiB (hyb) para los pesos; el modelo completo en F16 podado ronda los 1,2 GB según la reducción del 72,6% indicada para MXFP4.
- GPU recomendadas: Apple Silicon M2 (probado), M1/M3/M4 con memoria unificada; no se documentan pruebas en NVIDIA A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier Apple Silicon con 8 GB o más de memoria unificada; en NVIDIA, cabría en RTX 3060 12 GB o superiores, aunque no está validado.
- Opciones de despliegue: `transcribe.cpp` (fork `JoaoZaokk/transcribe-custom`), `handy-computer/transcribe.cpp`, app Handy (`cjpais/Handy` y fork `JoaoZaokk/handy-custom`). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI (son motores de LLM, no de ASR).
- Latencia y throughput: 662,2 ms para 24,5 s de audio (37x tiempo real) en la variante edge sobre M2; 697 ms en audio corto y 2,27 s en audio largo para la variante hyb.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| parakeet-ultra-pten-gguf (esta ficha) | 623,8 M | no disponible | pt, en | CC-BY-4.0 | GGUF mixto | Cuantizacion por capa, optimizado M2 |
| moondream/parakeet-ultra | no disponible | no disponible | no disponible | CC-BY-4.0 | safetensors | Modelo base post-entrenado |
| nvidia/parakeet-tdt-0.6b-v3 | ~600 M | no disponible | en (principal) | no disponible en la informacion | no disponible | Modelo original de NVIDIA |
| handy-computer/parakeet-ultra-gguf | no disponible | no disponible | no disponible | no disponible | GGUF | Port canonico GGUF sin poda PT/EN |

No se dispone de datos de WER comparativos entre estas variantes en la información proporcionada, salvo el 1,17% de la variante hyb respecto a su propio F16.

## Limitaciones y advertencias

- Solo soporta portugués e inglés; el vocabulario fue podado explícitamente para eliminar otros alfabetos, por lo que transcribir otros idiomas producirá errores o salidas vacías.
- El WER del 1,17% es relativo a la versión F16 del propio modelo podado, no a un benchmark estándar absoluto; no debe compararse directamente con cifras de otros papers.
- Las latencias publicadas están medidas exclusivamente en Apple M2 de 16 GB; el rendimiento en otras GPU o CPUs no está validado.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero obliga a citar al autor original y a los upstream (Moondream, NVIDIA, handy-computer).
- Riesgo de alucinación en ASR: como todo modelo transducer, puede generar texto plausible en segmentos de audio ruidosos o silenciosos; el VAD por pausas mitiga parcialmente este riesgo pero no lo elimina.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria independiente.
- No es un modelo de propósito general: no sirve para generación de texto, código, matemáticas ni razonamiento; su uso está acotado a ASR.
- La poda de vocabulario puede afectar a la transcripción de nombres propios o términos extranjeros que usen caracteres no PT/EN.

## Enlaces

- Hugging Face: https://huggingface.co/JoaoZaokk/parakeet-ultra-pten-gguf
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Port GGUF canonico: https://huggingface.co/handy-computer/parakeet-ultra-gguf
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Fork del motor: https://github.com/NairoDorian/transcribe.cpp
- App Handy: https://github.com/cjpais/Handy
- Fork del motor con fixes Metal M2: https://github.com/JoaoZaokk/transcribe-custom
- Fork de la app Handy: https://github.com/JoaoZaokk/handy-custom
