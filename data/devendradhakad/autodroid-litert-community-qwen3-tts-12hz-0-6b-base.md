# devendradhakad/autodroid-litert-community-Qwen3-TTS-12Hz-0.6B-Base

## Resumen

Autodroid LiteRT Community Qwen3-TTS-12Hz-0.6B-Base es una conversion a LiteRT (.tflite) del modelo Qwen/Qwen3-TTS-12Hz-0.6B-Base, un modelo de sintesis de voz (text-to-speech) desarrollado originalmente por el equipo Qwen de Alibaba y publicado bajo licencia Apache-2.0. La conversion la firma el usuario devendradhakad y su objetivo es permitir inferencia totalmente on-device: sintesis de voz a 24 kHz con clonacion de voz a partir de unos 3 segundos de audio, en 10 idiomas (en, zh, ja, ko, de, fr, es, it, pt y ru). El repositorio ocupa 1,7 GB e incluye distintos grafos .tflite con cuantizaciones alternativas (int4, int8 dinamico y fp32) junto con el tokenizador Qwen2 BPE y las tablas de embeddings que se ejecutan en el host.

Tecnicamente no es un transformer de texto al uso, sino un language model de habla: un talker de estilo Qwen3 de 28 capas predice tramas a 12,5 Hz compuestas por 16 tokens de codec (el primer codebook lo genera el talker y los 15 residuales un transformer interno denominado MTP de 5 capas y unos 78M de parametros), y un decodificador de codec neuronal (RVQ + transformer de 8 capas + ConvNet causal) convierte esos tokens en PCM. El bucle de decodificacion del Engine de LiteRT-LM todavia no soporta esta estructura de generacion, por lo que el modelo se ejecuta como tres grafos LiteRT coordinados por un bucle en el lado del host, siguiendo el patron LiteRT Compiled Model.

Su relevancia actual es doble: por un lado demuestra que un TTS de 0,6B con clonacion de voz puede correr sin conexion en hardware movil (verificado en un Pixel 8a), y por otro documenta de forma poco habitual el proceso de optimizacion, con cifras medidas de RTF (factor de tiempo real) antes y despues de cuantizar y plegar grafos. Es, en la practica, un artefacto experimental de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha, y una model card detallada pero orientada al ejemplo de codigo mas que al producto final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speech LM: talker estilo Qwen3 de 28 capas + transformer MTP interno de 5 capas + decodificador de codec neuronal (RVQ + transformer de 8 capas + ConvNet causal) |
| Parametros totales | 0,6B en el talker (segun el nombre del modelo base); el bloque MTP anade aproximadamente 78M; los parametros del decodificador de codec no estan disponibles |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | Cache KV de 1024 entradas en el talker; cache KV de 17 ranuras en el MTP (17 invocaciones por trama); la model card no documenta un contexto en tokens de texto |
| Tipos de cuantizacion | int4 blockwise-32 OCTAV sin datos (talker); int8 dinamico GPTQ (MTP plegado); fp32 (talker, MTP y codec de referencia); fp16 via XNNPACK FORCE_FP16 (mitad convolucional del codec) |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, it, pt, ru (10 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | .tflite (LiteRT); tokenizer.json, vocab.json y merges.txt para el tokenizador; tablas de embeddings y voces en .npy |
| Frecuencia de muestreo de salida | 24 kHz |
| Frecuencia de tramas del codec | 12,5 Hz (16 tokens de codec por trama; 80 ms de audio por trama) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de speech LM en tres etapas. El talker, un transformer de 28 capas con arquitectura Qwen3, recibe el texto y predice la primera de las 16 secuencias de tokens de codec para cada trama de 12,5 Hz. Los 15 codebooks residuales los produce un transformer interno llamado MTP (multi-token prediction) de 5 capas y aproximadamente 78M de parametros, con 15 lm_heads, que se invoca 17 veces por trama. Finalmente, el decodificador de codec (RVQ, transformer de 8 capas y ConvNet causal) convierte los tokens en PCM a 24 kHz en bloques de 64 tramas. El repositorio no incluye informacion sobre el entrenamiento del modelo original: no se dispone del numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

La innovacion tecnica de esta ficha no esta en el modelo base, sino en la conversion y el despliegue. Como el Engine de LiteRT-LM no soporta la estructura de generacion (16 codebooks con un bucle interno de prediccion), la implementacion parte el modelo en tres grafos coordinados desde el host. Se ofrecen dos optimizaciones medibles: el plegado del MTP, que fusiona las 16 iteraciones internas por trama en un unico grafo con argmax y embedding gather dentro del grafo y pesos int8 dinamicos GPTQ (token-identico al de referencia, con trayectoria de muestreo distinta pero inteligible), y la division del codec en dos partes en la frontera transformer/convnet para que la mitad convolucional, que concentra casi todos los FLOPs, corra en fp16. La model card advierte ademas de que la cuantizacion channelwise int8/int4 por defecto degenera en esta familia de modelos y que debe usarse granularidad blockwise.

## Capacidades

- Sintesis de voz (text-to-speech) a 24 kHz con generacion autoregresiva de tokens de codec y decodificacion neuronal a PCM.
- Clonacion de voz a partir de unos 3 segundos de audio: se extrae un x-vector de hablante con el script de conversion y se pasa como `--speaker my_voice.npy`; el repositorio incluye una voz demo en `voices/demo_speaker.npy` (4 KB).
- Soporte de 10 idiomas: en, zh, ja, ko, de, fr, es, it, pt y ru.
- Inferencia totalmente on-device, sin llamadas a servicios en la nube, mediante LiteRT Compiled Model tanto en escritorio (Python) como en Android (Kotlin, CPU).
- Ejecucion con distintas configuraciones de precision/velocidad intercambiables: `talker_fp32` (reproduce token a token la referencia PyTorch en decodificacion greedy) frente a `talker_int4`, y MTP/codec de referencia frente a versiones plegadas y divididas.
- No soporta tool calling ni function calling: es un modelo especializado de TTS, no un LLM conversacional.
- No soporta agentes ni razonamiento multi-step.
- No dispone de modo de razonamiento (thinking mode), vision ni entrada de audio; la unica modalidad es texto a voz.
- La model card no documenta control de estilo, emocion, prosodia ni marcas SSML.

## Casos de uso

- Lectura por voz en aplicaciones moviles sin conexion: el modelo cabe en el dispositivo y funciona integramente en CPU, de modo que una app Android puede leer texto en 10 idiomas sin enviar datos a la nube ni depender de conectividad. La RTF de aproximadamente 2,06 en un Pixel 8a implica sintesis algo mas lenta que el tiempo real, adecuada para contenido pregrabado o generado por adelantado.
- Accesibilidad para personas con discapacidad visual: lectura de pantalla, documentos o notificaciones con una voz natural a 24 kHz y, si se desea, clonando la voz del propio usuario a partir de 3 segundos de audio para reducir la fatiga auditiva.
- Audiolibros, podcasts y contenido narrado con voz personalizada: la clonacion de hablante permite mantener una identidad vocal coherente a lo largo de horas de material, y el proceso por lotes en escritorio evita la restriccion de la RTF en tiempo real.
- Interfaces de voz para dispositivos embebidos e IoT: asistentes de electrodomesticos, automocion o domotica que necesitan respuestas habladas sin salida a internet, con el atractivo de privacidad que supone no transmitir audio del usuario.
- Localizacion de contenido a 10 idiomas: doblaje o generacion de pistas de audio en en, zh, ja, ko, de, fr, es, it, pt y ru a partir de un mismo texto, con la salvedad de que la model card no documenta la calidad relativa por idioma.
- Prototipado rapido de TTS en investigacion: el pipeline Python de referencia y los scripts de conversion permiten comparar cuantizaciones y medir la degradacion con ASR round-trip, lo que resulta util para estudiar el efecto de la cuantizacion blockwise frente a channelwise en modelos de habla.
- Aprendizaje de idiomas y herramientas educativas: generacion de ejemplos de pronunciacion en varios idiomas en un dispositivo local, sin cuotas de API ni latencia de red.
- Demos y pruebas de concepto de voz en Android: el repositorio incluye una app Kotlin con Compiled Model API y scripts `install_to_device.sh`, verificada en Pixel 8a, util para evaluar viabilidad antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; ademas, no serian aplicables a un modelo especializado de sintesis de voz. La model card si documenta verificaciones de exactitud frente a la referencia PyTorch y medidas de rendimiento:

| Verificacion de exactitud | Resultado |
|---|---|
| Talker fp32 frente a referencia PyTorch | Bit-exacto a nivel de torch; correlacion 1,0 y top-1 del 100% como .tflite |
| MTP (referencia) | 15/15 tokens greedy coincidentes |
| Decodificador de codec | Correlacion 1,0 (diferencia absoluta maxima 1,8e-5) |
| Extremo a extremo con `talker_fp32` + greedy | Tokens identicos a la implementacion de referencia; correlacion de forma de onda 1,000000; ASR round-trip devuelve la frase de entrada |
| `talker_int4` (blockwise-32 OCTAV sin datos) | Trayectoria de muestreo distinta pero valida; transcripcion identica bajo ASR round-trip |
| `mtp_folded_int8` | Plegado token-identico a la referencia; pesos int8 dinamicos dan trayectoria distinta pero inteligible (ASR round-trip exacto) |
| `codec_partA` / `codec_partB` | ASR-identico a `codec_decoder_fp32` |

| Rendimiento por trama de 80 ms | Apple M4 Max (CPU/XNNPACK) |
|---|---|
| Talker decode (8 hilos) | 45-50 ms |
| Bucle interno MTP (17 invocaciones, 1 hilo) | ~148 ms |
| Decodificador de codec (amortizado) | ~10 ms |
| Total | ~205 ms, RTF aproximada 2,5 |

| Configuracion en dispositivo | RTF |
|---|---|
| Pixel 8a, grafos de referencia `mtp_fp32` + `codec_decoder_fp32` | ~6,7 |
| Pixel 8a, grafos optimizados (`mtp_folded_int8` + `codec_partA`/`codec_partB`) | ~2,06 (unas 3,2 veces mejor) |
| Apple M4 Max, grafos optimizados | ~1,44 |

Desglose de las mejoras medidas: `mtp_folded_int8` reduce el MTP de aproximadamente 333 a 68 ms por trama en Pixel 8a (unas 5 veces) y a unos 41 ms por trama en M4 Max; la division del codec lo baja de aproximadamente 114 a 40 ms por trama (unas 2,5 veces). El talker queda como principal cuello de botella restante, con unos 52 ms por trama.

## Requisitos de hardware

- La inferencia es en CPU mediante XNNPACK; no se requiere GPU en las rutas verificadas (Apple M4 Max y Pixel 8a, ambos en CPU).
- Configuracion int4 por defecto: aproximadamente 1,4 GB de descarga segun la model card (repositorio completo de 1,7 GB), incluidos `talker_int4.tflite` (256 MB), `mtp_folded_int8.tflite` (218 MB), `codec_partA`/`codec_partB` (163 + 294 MB), tablas del host (723 MB, en fp32/fp16) y tokenizador (11 MB + 4,5 MB).
- Configuracion fp32 de referencia: `talker_fp32.tflite` (1,8 GB), `mtp_fp32.tflite` (440 MB), `codec_decoder_fp32.tflite` (457 MB) y las mismas tablas de 723 MB, lo que suma en torno a 3,4 GB de pesos.
- Hardware verificado: Pixel 8a (Android) y Apple M4 Max (escritorio). La model card no documenta pruebas en GPU de escritorio ni en GPU de centro de datos (A100, H100, RTX 4090), por lo que no hay cifras de VRAM ni recomendaciones de GPU disponibles.
- Cabe en hardware consumer y movil: el Pixel 8a ejecuta la configuracion completa con los grafos optimizados, y el conjunto int4 es apto para un telefono de gama media-alta actual.
- Opciones de despliegue: LiteRT Compiled Model API con el ejemplo Python (`compiled_model_api/text_to_speech_lm/python`) y la app Android en Kotlin (`compiled_model_api/text_to_speech_lm/kotlin_cpu/android`). No se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que el Engine de LiteRT-LM todavia no soporta este patron de generacion y el modelo no es un transformer de texto convencional.
- Latencia y throughput: con los grafos optimizados, RTF de aproximadamente 2,06 en Pixel 8a y 1,44 en M4 Max, ambas por encima de 1, es decir, sin alcanzar el tiempo real en el hardware probado. La ruta de referencia en Pixel 8a queda en RTF de aproximadamente 6,7.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autodroid LiteRT Community Qwen3-TTS-12Hz-0.6B-Base (esta ficha) | 0,6B (talker) + ~78M (MTP) | KV 1024 en el talker | .tflite, LiteRT Compiled Model, bucle en host con tres grafos | Apache-2.0 | Repositorio comunitario, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base (modelo original) | 0,6B (talker) + MTP | No disponible en la informacion proporcionada | Pesos originales del modelo base, ejecutables fuera de LiteRT | Apache-2.0 | Repositorio oficial de Qwen en HuggingFace |
| Otras alternativas de TTS on-device (Piper, Kokoro, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye especificaciones verificables de competidores directos de TTS on-device, por lo que la comparacion se limita al modelo base del que deriva esta conversion y a las distintas configuraciones de grafos incluidas en el propio repositorio (talker fp32 frente a int4; MTP y codec de referencia frente a plegados y divididos).

## Limitaciones y advertencias

- Modelo comunitario con 0 descargas y 0 likes en el momento de la consulta y fecha de creacion de 2026-09-17; no hay evidencia de uso en produccion ni de validacion independiente mas alla de las mediciones del autor.
- Es una conversion, no un modelo entrenado: cualquier sesgo o limitacion del modelo base Qwen3-TTS se hereda, y la model card no documenta sesgos de habla, cobertura de acentos ni calidad relativa por idioma.
- La cuantizacion channelwise int8/int4, que es la opcion por defecto de las herramientas, degenera en esta familia de modelos; es obligatorio usar granularidad blockwise. Esto implica un riesgo real de obtener salidas degradadas si se reconvierte el modelo sin seguir las indicaciones.
- Las versiones cuantizadas (`talker_int4`, `mtp_folded_int8`) no son bit-exactas: producen una trayectoria de muestreo distinta, considerada valida e inteligible segun el ASR round-trip, pero que no coincide token a token con la referencia.
- La RTF medida esta por encima de 1 en los dispositivos probados (aproximadamente 2,06 en Pixel 8a y 1,44 en M4 Max), por lo que no hay sintesis en tiempo real en ese hardware; el contenido debe generarse por adelantado o usarse en escenarios no conversacionales.
- La ejecucion depende de un bucle en el lado del host que coordina tres grafos, porque el Engine de LiteRT-LM no soporta aun esta estructura de generacion; esto complica la integracion frente a un runtime estandar.
- Licencia Apache-2.0, permisiva para uso comercial, pero conviene verificar los terminos del modelo base Qwen3-TTS y las condiciones de la voz clonada utilizada.
- La clonacion de voz a partir de 3 segundos de audio plantea riesgos de suplantacion y de uso no consentido de la identidad vocal; es responsabilidad del integrador obtener consentimiento y cumplir la normativa aplicable.
- La model card esta orientada al ejemplo de codigo y aparece truncada en la seccion de Android; no se documentan limites de longitud de texto de entrada, comportamiento con caracteres fuera de los 10 idiomas soportados ni estrategias de control de prosodia.
- No se han publicado resultados en benchmarks estandar, ni existen cifras de rendimiento en GPU, por lo que no es posible estimar su comportamiento en entornos de servidor de alta concurrencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/devendradhakad/autodroid-litert-community-Qwen3-TTS-12Hz-0.6B-Base
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Ejemplo de referencia en LiteRT (pipeline Python, app Android y scripts de conversion): https://github.com/john-rocky/litert-samples/tree/qwen3-tts-sample/compiled_model_api/text_to_speech_lm
- Scripts de conversion del MTP plegado y del codec dividido: https://github.com/john-rocky/hf-to-litertlm/tree/main/qwen3tts_work
- Documentacion de `benchmark_model` de TFLite: https://ai.google.dev (enlace truncado en la model card; seccion de Android)
- Las busquedas web realizadas no devolvieron resultados utiles: unicamente paginas de inicio del motor de busqueda, sin papers, blogs ni repositorios adicionales relevantes para este modelo.
