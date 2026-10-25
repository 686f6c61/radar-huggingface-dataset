# coder543/underdog-bark-3.0-pro-glade

## Resumen

Underdog Bark 3.0 Pro for Glade es una conversión de los pesos de ConwayResearch/Underdog-Bark-3.0-Pro a grafos Core AI ejecutables con el runtime Glade sobre silicio de Apple. No es un modelo nuevo ni un reentrenamiento: es un artefacto de despliegue que empaqueta el mismo reconocedor de voz en un bundle autocontenido de 1.329,8 MB, frente a los 1.254,2 MB de descarga del checkpoint original. La conversión la firma el usuario coder543 y no está avalada por Conway Research, Moondream ni NVIDIA.

El modelo subyacente es un FastConformer/TDT en inglés, descendiente de Parakeet Ultra, con 24 capas de encoder, 1.024 canales, ocho cabezas de atención y un predictor LSTM de dos capas y 640 canales. El recuento exacto de parámetros es 627.008.134 y no publica cabecera VAD. La arquitectura es la misma en las variantes Plus y Pro; lo que cambia entre ellas es la representación de los pesos y la precisión reportada.

Su relevancia es acotada pero concreta: permite ejecutar un ASR de clase 0,6 B íntegramente en la Neural Engine de un Mac o un iPhone, sin GPU dedicada, con velocidades de 58x a 424x tiempo real y un WER normalizado del 2,25 % en una grabación de referencia. El precio es una dependencia total de Glade y de iOS 27 o macOS 27 sobre hardware Apple Silicon físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer/TDT (encoder Conformer rápido con decodificador *token-and-duration transducer*), descendiente de Parakeet Ultra |
| Parámetros totales | 627.008.134 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Un chunk de hasta 60 s por paso; forma de encoder de 768 posiciones dividida en seis activos de cuatro capas; atención bidireccional completa dentro de cada chunk |
| Tipos de cuantización | FP16 en los grafos convertidos; BF16 en las matrices del sidecar del decodificador alojado en el host. No se distribuyen variantes INT8, INT4 ni GGUF |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Grafos Core AI (FP16) más sidecar BF16 del decodificador, con `metadata.json` y `runtime.json`; no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El encoder es un FastConformer de 24 capas y 1.024 canales con ocho cabezas de atención, alimentado por un frontend log-mel de 128 bins sobre audio mono a 16 kHz. El decodificador es un TDT con predictor LSTM de dos capas y 640 canales, decodificación voraz con duraciones de 0 a 4 y un máximo de diez símbolos por frame acústico, siguiendo los valores por defecto del modelo original. No hay cabecera VAD: la segmentación depende del planificador de chunks del host, que corta en fronteras silenciosas contiguas de hasta 60 segundos conservando todas las muestras, incluido el silencio.

La conversión no reentrena nada. El checkpoint BF16 original se traduce a grafos FP16, mientras el sidecar compacto del decodificador conserva los bits BF16 de sus matrices originales. Las convoluciones depthwise de nueve taps se reescriben como productos desplazados explícitos con sumas balanceadas, preservando pesos, relleno a cero y campo receptivo. La SiLU se implementa con matemática equivalente de exponencial y división, las máscaras de convolución preceden a la proyección GLU sin sesgo, y cada reescritura de grafo pasa una comprobación contra la fuente en FP32 antes de las pruebas nativas. La forma de encoder de 768 posiciones se reparte en seis activos de cuatro capas sin fragmentar el contexto de atención, y el decoder ANE en FP16 admite lotes de capacidad 16 y 32 con dos peticiones de encoder concurrentes. El autor no documenta en esta ficha el volumen de tokens, la composición del dataset ni las etapas de RLHF o DPO del modelo original: esa información corresponde al checkpoint de Conway Research y aquí figura como no disponible.

## Capacidades

- Reconocimiento de voz en inglés sobre audio mono a 16 kHz, con frontend log-mel de 128 bins y 250 ms de silencio inicial por chunk que se descuentan de las marcas temporales devueltas.
- Segmentación de grabaciones largas en chunks de frontera silenciosa de hasta 60 segundos, lo que acota la memoria en registros extensos; el comportamiento difiere de pasar la grabación completa en un único contexto.
- Marcas temporales nativas a nivel de palabra con paso de frame de 80 ms, generadas por el decodificador TDT y no por alineamiento forzado.
- Coincidencia exacta de IDs de token con la fuente en las 21 divisiones idénticas de chunk probadas, cada una con su propio silencio inicial.
- Ejecución en la Neural Engine con predicciones ANE observadas en todas las llamadas de encoder y submuestreo y en la decodificación por lotes, sin intervalos de GPU.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio generativo ni generación de texto libre: es exclusivamente un transductor voz-a-texto.
- No incluye detección de actividad de voz ni diarización de hablantes.

## Casos de uso

- Transcripción de reuniones y entrevistas largas en Mac: el planificador corta en fronteras silenciosas de hasta 60 s y mantiene todas las muestras, con 263,5x de tiempo real medido en un audio de 18 min 15 s, de modo que una hora de reunión se procesa en decenas de segundos.
- Subtitulado y etiquetado temporal: las marcas de palabra con paso de 80 ms permiten generar subtítulos alineados de forma aproximada; al no ser alineamiento forzado, conviene revisar los bordes antes de publicar.
- Notas de voz en aplicaciones iOS: en un iPhone Duo (A20 Pro) el discurso completo se transcribe en 2,581 s (424,4x tiempo real) con un pico de 1,99 GB, adecuado para dictado y transcripción de mensajes en primer plano.
- Procesamiento por lotes de archivo sonoro: al ejecutarse sobre ANE con dos peticiones de encoder concurrentes y decodificación por lotes de capacidad 16 y 32, encaja en pipelines de digitalización de fondos de audio con requisitos de idioma inglés.
- Escenarios sin conectividad o con requisitos de privacidad: al ser un bundle autocontenido que corre en local sobre silicio Apple, el audio no necesita salir del dispositivo, lo que sirve para entornos clínicos, legales o industriales con datos sensibles.
- Control de calidad de atención al cliente: transcripción masiva de grabaciones en inglés para auditar guiones y calcular métricas sobre texto, siempre que la latencia de preparación inicial (84,5 s en Mac, 154,4 s en iPhone) se amortice con caché (0,131 s en preparaciones posteriores).
- Indexación y búsqueda de contenido hablado: la transcripción con tiempos permite construir índices por palabra para podcasts o videotecas, aunque el modelo solo cubre inglés.

## Benchmarks y rendimiento

| Prueba | Entorno | Resultado |
|---|---|---|
| RTFx, audio de 20 s | M3 MacBook Air, 16 GB, macOS 27.0.1 | 0,342 s; 58,4x |
| RTFx, audio de 18 min 15 s | M3 MacBook Air, 16 GB, macOS 27.0.1 | 4,157 s; 263,5x |
| WER normalizado estilo Whisper, grabación JFK | M3 MacBook Air | 2,25 % (50/2.220 errores) |
| Discurso completo | iPhone Duo (A20 Pro), iOS 27.1, app Glade Benchmark | 2,581 s; 424,4x tiempo real (mediana de tres ejecuciones) |
| `prepare()` inicial | Mac / iPhone | 84,5 s / 154,4 s |
| `prepare()` con caché | Mac | 0,131 s |
| Pico de memoria muestreada | Mac / iPhone | 2,11 GB / 1,99 GB |

Los tiempos de Mac son medianas en caliente de tres ejecuciones e incluyen extracción de características, encoder, decodificación, tokenización y marcas temporales nativas; excluyen lectura de fichero, planificación de chunks, inicialización, preparación del modelo y calentamiento. Los datos de iPhone incluyen lectura acotada del WAV y planificación de chunks. El WER procede de una única grabación en inglés y el propio autor lo describe como una comprobación limitada de la conversión, no como una clasificación amplia de precisión ni una verificación independiente de las cifras del publicador. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras tareas, que además no aplican a este tipo de modelo.

## Requisitos de hardware

- Hardware obligatorio: Apple Silicon físico con Neural Engine. Requiere Glade sobre iOS 27 o macOS 27; no hay ruta de ejecución en NVIDIA, AMD ni CPU x86 documentada.
- Mac de referencia: M3 MacBook Air con 16 GB, macOS 27.0.1, con pico muestreado de cliente más ANE de 2,11 GB.
- Móvil de referencia: iPhone Duo (A20 Pro), iOS 27.1, con pico de cliente de 1,99 GB excluyendo asignaciones no contabilizadas de acelerador y driver.
- VRAM estimada: no aplica en el sentido habitual; el consumo medido es de 2,11 GB en Mac y 1,99 GB en iPhone, sin intervalos de GPU.
- Coste de preparación: 84,5 s la primera vez en Mac y 154,4 s en iPhone; con caché baja a 0,131 s en Mac. El autor no vació la caché para estimar una compilación limpia en dispositivo.
- Opciones de despliegue: únicamente el runtime Glade con los grafos Core AI de este bundle. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, y el bundle no es un contenedor de almacenamiento upstream.
- Latencia y throughput: 58,4x en audio de 20 s y 263,5x en audio de 18 min 15 s en Mac; 424,4x en iPhone. La concurrencia de encoder es de dos para las pruebas de throughput y de uno para las capturas de atribución por etapa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / chunk | Formato y runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Underdog Bark 3.0 Pro for Glade (este) | 627.008.134 | Hasta 60 s por chunk; encoder de 768 posiciones | Grafos Core AI FP16 + sidecar BF16; Glade en iOS 27 / macOS 27 | CC-BY-4.0 | Bundle de 1.329,8 MB; 0 descargas y 0 likes en el momento de la consulta |
| ConwayResearch/Underdog-Bark-3.0-Pro (fuente) | 627.008.134 | Igual arquitectura; contexto completo del original | Checkpoint BF16 de 1.254,2 MB; runtime upstream (Transformers) | CC-BY-4.0 | Público en HuggingFace, revisión `4b5c51e04aa8d16dda9ecdff71bc29f7360149e4` |
| Familia Parakeet Ultra (antecesora) | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| Otras variantes Plus/Pro de la misma arquitectura | 627.008.134 (misma arquitectura) | No disponible | Representación de pesos y precisión reportada distintas | CC-BY-4.0 (según la fuente) | No disponible |

La comparación relevante es contra el checkpoint original: misma arquitectura y mismos parámetros, pero distinto contenedor, distinta precisión (FP16 en grafos frente a BF16) y distinta dependencia de ejecución. No se dispone de datos de benchmarks de las alternativas en la información proporcionada, por lo que no se puede establecer una comparación de precisión frente a otros ASR.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado, y el rendimiento en otros idiomas no está documentado.
- Dependencia total del ecosistema: requiere Glade y iOS 27 o macOS 27 sobre Apple Silicon físico; no es portable a CUDA ni a servidores x86.
- Sin cabecera VAD ni diarización: la calidad de la segmentación recae en el planificador de chunks del host y en las fronteras silenciosas.
- Límite de 60 segundos por chunk: acota la memoria, pero impide reproducir el comportamiento de pasar una grabación completa en un único contexto, lo que puede afectar a la coherencia en audios muy largos.
- Las marcas temporales tienen paso de 80 ms y no son alineamiento forzado; no son adecuadas para tareas que exijan alineación exacta a nivel de fonema.
- El WER de 2,25 % proviene de una sola grabación en inglés y el autor lo califica explícitamente como comprobación limitada de la conversión, no como verificación independiente de las cifras del publicador.
- No se han publicado métricas de sesgo, robustez ante acentos, ruido o audio telefónico en la información disponible; el riesgo de alucinación y de texto espurio en tramos de silencio o ruido no está cuantificado.
- La conversión no está avalada por Conway Research, Moondream ni NVIDIA; para producción conviene validar contra el checkpoint original.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero obliga a conservar y citar LICENSE y NOTICE del bundle.
- El modelo tiene 0 descargas y 0 likes, y el artefacto se publicó y actualizó en el mismo minuto; no hay evidencia de uso en producción ni de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coder543/underdog-bark-3.0-pro-glade
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Pro
- Revisión de origen citada: `4b5c51e04aa8d16dda9ecdff71bc29f7360149e4`
- Repositorio del benchmark STT y muestra JFK: https://github.com/coder543/stt-bench-matrix/tree/main/samples
- Ficheros de configuración incluidos en el bundle: `metadata.json`, `runtime.json`, `LICENSE`, `NOTICE`
