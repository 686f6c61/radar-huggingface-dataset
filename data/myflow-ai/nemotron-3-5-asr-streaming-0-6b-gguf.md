# myflow-ai/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

Nemotron 3.5 ASR streaming 0.6b es un modelo de reconocimiento automatico del habla (ASR) multilingue desarrollado por NVIDIA. Esta ficha concreta corresponde a la conversion a formato GGUF publicada por myflow-ai para su uso con transcribe.cpp, un runtime de inferencia en C++ orientado a modelos de voz. El modelo base es nvidia/nemotron-3.5-asr-streaming-0.6b, fijado al commit 24b151a del 8 de junio de 2026 y validado contra la referencia de NeMo en el commit 909e94e de transcribe.cpp.

La arquitectura combina un encoder FastConformer con atencion cache-aware (streaming) y un decoder transducer RNN-T condicionado por prompt, con 637.991.968 parametros totales, es decir, aproximadamente 0,6B. El modelo genera transcripciones con puntuacion y mayusculas en 32 locales de idioma segun la model card (el tokenizer reconoce 40, de los cuales 8 son "adaptation-ready" y requieren fine-tuning). Soporta tanto la ruta offline de maxima precision, con att_context_size=[56, 13] y 1,12 s de ventana, como streaming por bloques seleccionable en tiempo de ejecucion.

Su relevancia practica esta en el binomio tamano reducido y licencia permisiva: un modelo de menos de 1 GB en cuantizacion Q4_K_M que mantiene un WER de 8,49% en FLEURS en y 3,28% en LibriSpeech test-clean, con capacidad de streaming, deteccion de idioma y marcas de tiempo a nivel de token, lo que lo hace apto para despliegue en portatiles y equipos de gama de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (encoder) + RNN-T transducer con decoder condicionado por prompt |
| Parametros totales | 637.991.968 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | No expresada en tokens. Ventana de atencion att_context_size=[56, 13], equivalente a 1,12 s en ruta offline; streaming con --stream-chunk-ms 1120 y --stream-att-right {0, 3, 6, 13} |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 32 locales segun la model card (28 idiomas listados en los metadatos del repositorio): en, es, fr, it, pt, nl, de, tr, ru, ar, hi, ja, ko, vi, uk, pl, sv, cs, nb, da, bg, fi, hr, sk, zh, hu, ro, et |
| Licencia | openmdw-1.1 (OpenMDW-1.1), heredada del modelo base |
| Formato de pesos | GGUF (transcribe.cpp) |
| Tamano del repositorio | 0,8 GB |
| Libreria | transcribe.cpp |
| Entrada de audio | WAV mono a 16 kHz |
| Traduccion | no (translate: false) |
| Deteccion de idioma | si (lang_detect: true) |
| Marcas de tiempo | a nivel de token (timestamps: token) |
| Streaming | si |

## Arquitectura y entrenamiento

El modelo sigue el diseno NeMo de NVIDIA para ASR en streaming: un encoder FastConformer, variante de Conformer con atencion por bloques y mecanismo cache-aware que permite procesar audio de forma incremental sin recalcular el historial completo, acoplado a un decoder transducer RNN-T. La particularidad del decoder es que esta condicionado por prompt, de modo que el idioma de destino se selecciona en cada llamada mediante un flag (por ejemplo --language en-US o --stream-language fr-FR), y existe un modo automatico que emite una etiqueta <lang-XX>. El modelo incorpora puntuacion y capitalizacion en la salida.

La model card distingue dos rutas de inferencia: la offline, con att_context_size=[56, 13] y 1,12 s de contexto, que es la de maxima precision y sobre la que se reportan los WER de referencia; y la de streaming por bloques, configurable en tiempo de ejecucion con --stream-chunk-ms 1120 y un parametro de contexto derecho de atencion (--stream-att-right) que puede tomar los valores 0, 3, 6 o 13, intercambiando latencia por precision. No se especifican en la informacion disponible el numero de horas de audio de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO; al tratarse de un modelo ASR, el ajuste relevante seria de tipo supervisado y de adaptacion de idioma, no alineamiento por preferencias.

## Capacidades

- Transcripcion de voz a texto multilingue en 32 locales, con seleccion explicita de idioma por llamada o deteccion automatica mediante etiqueta <lang-XX>.
- Streaming en tiempo real con cache-aware attention, con tamano de bloque de 1120 ms y distintos grados de contexto derecho.
- Puntuacion y capitalizacion automaticas en la salida.
- Marcas de tiempo a nivel de token (timestamps: token).
- Deteccion de idioma integrada.
- Modo offline de mayor precision mediante att_context_size=[56, 13].
- Conversion de audio a 16 kHz mono WAV con ffmpeg como paso previo a la inferencia.
- No realiza traduccion (translate: false): transcribe en el idioma hablado, no traduce a otro idioma.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio generativo, ya que es un modelo especializado de ASR y no un modelo de lenguaje generativo de proposito general.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo procesa audio mono a 16 kHz y devuelve texto con puntuacion y mayusculas, con marcas de tiempo por token que permiten alinear cada fragmento con el hablante y generar resumenes indexados por minuto.
- Subtitulado automatico de video: las marcas de tiempo a nivel de token y el modo streaming permiten generar subtitulos incrementales para emision en directo o para postprocesado de ficheros, eligiendo el idioma de destino con --language.
- Asistentes de voz en local: con 473 MB en Q4_K_M y 716 MB en Q8_0, el modelo se puede ejecutar en un portatil sin GPU dedicada, lo que habilita dictado y comandos por voz en aplicaciones de escritorio que no pueden enviar audio a la nube.
- Atencion al cliente multilingue: la deteccion automatica de idioma y la cobertura de 28 idiomas en los metadatos permiten transcribir conversaciones de soporte en varios idiomas sin fijar el idioma a priori, y derivar la transcripcion a un sistema de analitica.
- Analitica de contact center: la ruta offline con att_context_size=[56, 13] ofrece la maxima precision (WER 3,04% en LibriSpeech test-clean en F32) para transcribir grandes volumenes de grabaciones por lotes y alimentar busquedas de palabras clave o control de calidad.
- Accesibilidad y transcripcion de clases o conferencias: el modo streaming con bloques de 1120 ms permite mostrar texto en pantalla con latencia controlada, ajustando --stream-att-right para priorizar latencia (0) o precision (13).
- Procesamiento de audio en el borde (edge): el modelo encaja en dispositivos con recursos limitados gracias a su tamano de 0,6B y a los ficheros GGUF de menos de 1 GB, evitando el envio de audio a servicios externos por motivos de privacidad.
- Investigacion en ASR en castellano y otras lenguas: el modelo cubre es, fr, it, pt, de, nl y otras lenguas europeas, por lo que sirve como linea base reproducible en transcribe.cpp para experimentos de adaptacion o comparacion de decodificadores.

## Benchmarks y rendimiento

Resultados publicados por el autor de la conversion GGUF. Los WER de FLEURS corresponden a FLEURS test en (647 enunciados), decodificacion RNN-T greedy, --language en-US y puntuacion con whisper-normalizer; los de LibriSpeech corresponden a test-clean (2620 enunciados).

| Cuantizacion | Tamano | WER FLEURS en (offline, att_context_size=[56, 13]) | WER LibriSpeech test-clean |
|---|---:|---:|---:|
| F32 | 2,38 GB | 7,97% | 3,04% |
| F16 | 1,19 GB | 7,97% | 3,03% |
| Q8_0 | 716 MB | 7,88% | 3,06% |
| Q6_K | 593 MB | 8,02% | 3,07% |
| Q5_K_M | 534 MB | 8,15% | 3,10% |
| Q4_K_M | 473 MB | 8,49% | 3,28% |
| Referencia NeMo (mismo manifest) | no disponible | 7,99% | 3,03% |
| Autoreportado por NVIDIA (en-US) | no disponible | 7,91% | no disponible |

Factores de velocidad reportados por el autor (valores tal como se publican en la model card):

| Hardware / backend | Valor reportado |
|---|---:|
| Apple M4 Max, Metal | 98 |
| Apple M4 Max, CPU | 29 |
| AMD Ryzen 4750U, Vulkan | 14,5 |
| AMD Ryzen 4750U, CPU | 7,5 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros modelos ASR (WER en otros idiomas distintos del ingles, MMLU, GSM8K u otros) mas alla de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada de forma explicita. Como referencia, los ficheros GGUF ocupan F32 2,38 GB, F16 1,19 GB, Q8_0 716 MB, Q6_K 593 MB, Q5_K_M 534 MB y Q4_K_M 473 MB; el consumo real de memoria sera algo superior a esos tamanos por los buffers de activaciones y el estado del decoder. Estimacion orientativa, no dato oficial.
- Cabe en GPU de consumo: si, dado el rango de 0,5 a 1,2 GB de pesos en cuantizaciones Q4_K_M a F16, cualquier GPU con 2-4 GB de memoria libre es suficiente en la practica. No se especifican modelos concretos de GPU en la informacion disponible.
- GPU de datacenter (A100, H100) no son necesarias para este modelo por su tamano; no se documentan resultados especificos en esas GPU.
- CPU: el autor publica factores de velocidad en CPU tanto en Apple M4 Max como en AMD Ryzen 4750U, lo que confirma viabilidad de inferencia sin GPU.
- Backends soportados segun la model card: Metal (Apple), Vulkan y CPU dentro de transcribe.cpp.
- Opciones de despliegue: transcribe.cpp, compilado desde fuente con CMake (cmake -B build && cmake --build build) y ejecutado con el binario transcribe-cli. No se documentan en la informacion proporcionada integraciones con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: los unicos datos publicados son los factores de velocidad de la tabla anterior; no se proporcionan valores de latencia absoluta en milisegundos ni de throughput en horas de audio por hora de proceso.
- Preprocesado obligatorio: el audio debe ser WAV mono a 16 kHz; la model card recomienda ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa con alternativas como Whisper u otros sistemas ASR multilingues queda como no disponible. La unica comparacion con datos reales es contra la referencia NeMo del propio modelo base.

| Modelo | Parametros | Contexto / ventana | WER LibriSpeech test-clean | WER FLEURS en | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nemotron-3.5-asr-streaming-0.6b GGUF (esta ficha) | 637.991.968 | att_context_size=[56, 13] (1,12 s), streaming con bloques de 1120 ms | 3,03% (F16) / 3,28% (Q4_K_M) | 7,88% (Q8_0) / 8,49% (Q4_K_M) | openmdw-1.1 | HuggingFace, formato GGUF para transcribe.cpp |
| nvidia/nemotron-3.5-asr-streaming-0.6b (modelo base) | 0,6B | identico | 3,03% (referencia NeMo) | 7,99% (referencia NeMo) | OpenMDW-1.1 | HuggingFace, pesos originales |
| Otros modelos ASR multilingues (Whisper y similares) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No traduce: translate esta marcado como false. Solo transcribe en el idioma hablado; no se debe esperar traduccion automatica.
- Cobertura de idiomas matizada: la model card indica 32 locales soportados, pero el tokenizer reconoce 40 idiomas y 8 de ellos son "adaptation-ready" y requieren fine-tuning antes de usarse en produccion. Los metadatos del repositorio listan 28 idiomas.
- Idiomas no cubiertos: no aparecen en la lista idiomas como el catalan, el gallego, el euskera o el portugues de Brasil como locale diferenciado; la cobertura se define por locales concretos.
- WER degradado en cuantizaciones agresivas: entre F16 (7,97% en FLEURS en) y Q4_K_M (8,49%) hay una perdida de 0,52 puntos porcentuales; en LibriSpeech test-clean la diferencia es de 3,03% a 3,28%. Para produccion con requisitos estrictos de precision conviene Q8_0 o superior.
- Riesgo de alucinacion y errores de transcripcion: inherente a todo sistema ASR, especialmente con audio ruidoso, solapamiento de hablantes, musica de fondo o acentos no representados en el entrenamiento. No se documentan tasas de alucinacion especificas.
- Sesgos: no se documenta en la informacion disponible ninguna evaluacion de sesgos por acento, genero, edad o variedad dialectal. Es un riesgo abierto para despliegues en produccion.
- Restricciones de licencia: la licencia es OpenMDW-1.1 (license: other en los metadatos, con license_link apuntando a la model card de NVIDIA). Es imprescindible revisar los terminos completos en la fuente upstream antes de un uso comercial, ya que la ficha no reproduce el texto integro de la licencia.
- Dependencia de un runtime especifico: el modelo esta empaquetado para transcribe.cpp y no se documentan rutas de despliegue alternativas (vLLM, Ollama, TGI, llama.cpp). La adopcion en produccion queda ligada a ese ecosistema.
- Requisito de formato de entrada: solo WAV mono a 16 kHz; cualquier otro formato exige conversion previa, lo que anade un paso en la cadena de procesamiento.
- Consistencia del repositorio: los enlaces de descarga de la model card apuntan al repositorio handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf, no al repositorio myflow-ai de esta ficha. Conviene verificar el origen de los ficheros antes de desplegarlos.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de redactar la ficha, ademas de una unica revision publicada (creado y actualizado el 10 de octubre de 2026). No hay evidencia de uso en produccion.
- Rendimiento en streaming no cuantificado: la model card no publica WER para las distintas configuraciones de --stream-att-right (0, 3, 6, 13), por lo que no se puede estimar la perdida de precision al priorizar baja latencia.

## Enlaces

- Repositorio de esta ficha (GGUF de myflow-ai): https://huggingface.co/myflow-ai/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo base de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Pagina del modelo en transcribe.cpp (rendimiento, validacion numerica y reproduccion): https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/nemotron-3.5-asr-streaming-0.6b.md
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/909e94e
- Commit del modelo base utilizado para la conversion: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/commit/24b151a
- Repositorio de GGUFs referenciado en la model card: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf
- Referencias academicas citadas en las etiquetas del repositorio (no verificadas en esta busqueda): arXiv:2312.17279 y arXiv:2305.05084
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados tecnicos relevantes sobre este modelo; los unicos enlaces utiles provienen de la model card y de los metadatos de HuggingFace.
