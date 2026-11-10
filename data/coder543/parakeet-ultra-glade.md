# coder543/parakeet-ultra-glade

## Resumen

Parakeet Ultra for Glade es una conversión del modelo de reconocimiento automático del habla (ASR) Moondream Parakeet Ultra, que a su vez es un ajuste posterior del NVIDIA Parakeet TDT 0.6B V3. El autor de la conversión es coder543, y el resultado se empaqueta como un bundle autocontenido orientado al runtime Glade sobre Apple Silicon (macOS 27 e iOS 27), con ejecución preferente en el Neural Engine (ANE) y soporte de CPU para la cabeza de voz nativa. El modelo conserva la licencia CC-BY-4.0 del upstream y no está avalado ni por Moondream ni por NVIDIA.

El modelo resuelve transcripción de audio con detección de pausas integrada: la propia cabeza de voz identifica silencios y planifica fragmentos de como máximo 30 segundos, eliminando la necesidad de un modelo VAD separado. Incluye marcas temporales nativas a nivel de token y palabra derivadas de las emisiones TDT y de las duraciones predichas, con un paso de trama de 80 ms, y mantiene la cobertura de 25 idiomas de la versión V3.

Es relevante para desarrolladores que necesiten ASR de alta eficiencia en dispositivos Apple: el bundle reporta velocidades de entre 91,6× y 473,6× en tiempo real según dispositivo, con un pico de memoria medido de 1,27 GB en un MacBook Air M3 y 1,14 GB en un iPhone 15 Pro Max. El repositorio ocupa 1,6 GB y se distribuye como un único bundle con pesos cuantizados en W8A16 para el codificador y FP16 para el decodificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (transducer con decodificador de duraciones), encoder con subsampling y atención; conversión a grafos Core ML para ANE |
| Parametros totales | 0,6B (heredados de NVIDIA Parakeet TDT 0.6B V3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica como contexto de texto; fragmentos de audio de hasta 30 s, con bloques de normalización de 120 s en la cabeza de voz nativa |
| Tipos de cuantizacion | W8A16 en el codificador (proyecciones sensibles en FP16); decodificador TDT en FP16; cabeza de voz cuantizada (error absoluto medio de probabilidad de 0,00247 frente a FP32) |
| Idiomas soportados | 25 idiomas (cobertura heredada de la V3; lista concreta no disponible) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Bundle Core ML compilado para Apple Silicon (grafos ANE/CPU), con `metadata.json` y `runtime.json`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un transducer TDT (Token-and-Duration Transducer) de NVIDIA Parakeet, con un codificador acústico que aplica subsampling y atención, y un decodificador que predice simultáneamente tokens y duraciones (0, 1, 2, 3 o 4), con un máximo de diez símbolos por trama acústica. Moondream realizó un post-entrenamiento sobre esta base y coder543 ha convertido los pesos a grafos Core ML para el runtime Glade. La conversión preserva las máscaras originales de atención y subsampling, usa una única forma de codificador de 384 posiciones y permite cuatro peticiones concurrentes de codificador y un lote de decodificador de 128 fragmentos independientes.

La innovación principal de esta conversión es la integración del chunking en la propia cabeza de voz: en lugar de un VAD externo, la cabeza nativa detecta pausas sobre características de subsampling ejecutadas en ANE y selecciona cortes dentro del límite de 30 segundos, conservando todo el audio, incluido el silencio. El vocabulario tiene 8.193 entradas, con ID de blank 8.192, y los IDs de token por lotes se representan como un par exacto partición/local en FP16 (`partition * 2048 + local`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el material proporcionado.

## Capacidades

- Reconocimiento automático del habla (ASR) con decodificación greedy TDT por lotes.
- Detección de pausas nativa mediante la cabeza de voz, sin VAD externo, con planificación de fragmentos de hasta 30 segundos.
- Marcas temporales nativas a nivel de token y palabra, calculadas a partir de las tramas de emisión TDT y las duraciones predichas con paso de 80 ms.
- Cobertura multilingüe de 25 idiomas heredada del modelo V3.
- Procesamiento por lotes de hasta 128 fragmentos independientes en el decodificador.
- Ejecución en Neural Engine para codificador y decodificador, y en CPU para la cabeza de voz.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas largas en Mac: el modelo procesa un audio de 18 minutos y 15 segundos en 2,462 s en un MacBook Air M3 (444,9× tiempo real), lo que permite transcribir grabaciones extensas de forma casi instantánea en local.
- Subtitulado con marcas temporales: las marcas nativas de token y palabra a 80 ms permiten generar subtítulos sincronizados sin un alineador forzado adicional, siempre que el host una subpalabras y añada puntuación sin estirar los tramos de palabra a través de silencios.
- Dictado y notas de voz en iPhone: con 3,447 s para el audio completo de 18 minutos en un iPhone 15 Pro Max (317,7×) y 1,14 GB de pico de memoria, es viable integrar transcripción local en aplicaciones iOS 27 sin enviar audio a la nube.
- Transcripción por lotes en servidores Apple: el lote de decodificador de 128 fragmentos y las cuatro peticiones concurrentes de codificador permiten procesar colas de audios cortos en paralelo sobre hardware Apple Silicon.
- Aplicaciones de accesibilidad: la transcripción en tiempo real con detección de pausas integrada facilita la generación de texto para personas con discapacidad auditiva en dispositivos de bolsillo, manteniendo el audio completo, incluidos los silencios.
- Archivado y búsqueda de audio corporativo: la velocidad de 473,6× medida en un MacBook Pro M5 Max permite indexar grandes volúmenes de grabaciones en local, con marcas temporales para búsqueda por fragmentos.
- Transcripción multilingüe en dispositivos: la cobertura de 25 idiomas permite desplegar un único modelo para contenido en varios idiomas, aunque la evaluación multilingüe publicada se limita a siete muestras de regresión.

## Benchmarks y rendimiento

| Dispositivo | Audio | Procesamiento | Audio / tiempo transcurrido |
|---|---:|---:|---:|
| M3 MacBook Air, 16 GB | 20 s | 0,192 s | 104,4× |
| M3 MacBook Air, 16 GB | 18 min 15 s | 2,462 s | 444,9× |
| iPhone 15 Pro Max | 20 s | 0,218 s | 91,6× |
| iPhone 15 Pro Max | 18 min 15 s | 3,447 s | 317,7× |
| MacBook Pro M5 Max (18 CPU, 40 GPU, 64 GB) | 18 min 15 s | 2,313 s | 473,6× |

| Métrica adicional | Valor |
|---|---|
| WER normalizado estilo Whisper (grabación JFK) | 54/2.220 errores (2,43%), idéntico al modelo fuente con el mismo plan de cortes |
| Pico de memoria, grabación completa en M3 Mac | 1,27 GB |
| Pico de memoria, grabación completa en iPhone | 1,14 GB |
| Análisis VAD nativo adicional en M3 | 0,325 s (total ~2,79 s / 393×) |
| Preparación inicial / en caché, M3 Mac | 7,26 s / 0,094 s |
| Preparación inicial / en caché, iPhone 15 Pro Max | 65,88 s / 0,68–0,72 s |
| Error absoluto medio de probabilidad de la cabeza cuantizada vs FP32 (120 s) | 0,00247 (6 de 1.500 tramas cruzan el umbral 0,5) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech, etc.) en la información disponible. Las cifras anteriores corresponden a una única grabación y no constituyen una clasificación general de velocidad o precisión.

## Requisitos de hardware

- Hardware físico Apple Silicon obligatorio; requiere macOS 27 o iOS 27 y el runtime host específico de Glade.
- Memoria: pico medido de 1,27 GB en M3 MacBook Air de 16 GB y 1,14 GB en iPhone 15 Pro Max.
- GPU recomendadas: no aplica en el sentido convencional; el codificador y el decodificador prefieren el Neural Engine (ANE), y la cabeza de voz se ejecuta en CPU.
- Compatibilidad consumer: verificado en M3 MacBook Air, iPhone 15 Pro Max y MacBook Pro con M5 Max; no se documentan otros dispositivos.
- Despliegue: exclusivamente mediante el runtime Glade y los grafos Core ML incluidos; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Preparación: la compilación inicial tarda 7,26 s en M3 y 65,88 s en iPhone; las ejecuciones posteriores en caché bajan a 0,094 s y 0,68–0,72 s respectivamente, aunque las actualizaciones del sistema o la evicción de caché pueden forzar recompilación.
- Throughput: entre 91,6× y 473,6× tiempo real según dispositivo y duración del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parakeet Ultra for Glade (esta ficha) | 0,6B | Fragmentos de hasta 30 s; bloques de normalización de 120 s | 25 | CC-BY-4.0 | Bundle Core ML para Apple Silicon vía Glade |
| NVIDIA Parakeet TDT 0.6B V3 | 0,6B | No disponible en la información | 25 (heredado por el modelo convertido) | No disponible en la información | Pesos originales de NVIDIA |
| Moondream Parakeet Ultra | 0,6B (post-entrenado sobre TDT 0.6B V3) | No disponible en la información | 25 (según la conversión) | CC-BY-4.0 (según la conversión) | Hugging Face (moondream/parakeet-ultra) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, más allá de que la conversión reproduce el recuento de errores del modelo fuente (54/2.220) con el mismo plan de cortes.

## Limitaciones y advertencias

- La conversión no está avalada por Moondream ni por NVIDIA; es un trabajo independiente de coder543.
- Requiere hardware físico Apple Silicon y macOS 27 o iOS 27; no funciona en otros sistemas ni en emuladores.
- Los grafos aceptan características y estados recurrentes, no archivos de audio; el host debe implementar el frontend, la planificación de fragmentos, el bucle TDT greedy y el tokenizador.
- La cabeza de voz cuantizada es aproximada: no se garantiza que reproduzca todos los límites de corte del modelo FP32 original.
- Las marcas temporales son alineaciones del decodificador, no alineación forzada; el host debe unir subpalabras y añadir puntuación sin estirar los tramos de palabra a través de silencios.
- La evaluación multilingüe se limita a siete muestras de regresión pública; no es una evaluación exhaustiva de precisión en los 25 idiomas.
- Las mediciones de rendimiento provienen de una única grabación (discurso JFK) y no constituyen una clasificación general de velocidad o precisión.
- El estado de caché de Core AI no es completamente observable; actualizaciones del sistema o evicción pueden provocar recompilación y latencias de preparación elevadas.
- No se documentan sesgos conocidos ni tasas de alucinación específicas; como todo modelo ASR, puede producir errores en audio con ruido, acentos no representados en el entrenamiento o vocabulario técnico.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario conservar LICENSE y NOTICE del repositorio.
- El repositorio no incluye ubicaciones de origen, audio de evaluación, tensores de referencia ni cachés compiladas de dispositivo; la integridad debe verificarse con los hashes de metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/parakeet-ultra-glade
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Repositorio del modelo base (revisión citada): `73175eb7aeb0d82f1e2a6b53b3aabc10a90bcd0b`
- Bundle experimental Core ML para Apple Watch: `coreml-watch/bundle.tar` dentro del repositorio
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
