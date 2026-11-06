# coflar-ai/viet-asr

## Resumen

VietASR Zipformer-vi es un modelo de reconocimiento automático del habla (ASR) para vietnamita desarrollado por coflar-ai. Se trata de un transductor Zipformer2 de 85,8 millones de parámetros que destaca por generar directamente texto en forma escrita: el propio modelo predice mayúsculas, puntuación y normalización de números (ITN), sin necesidad de un paso posterior de puntuación o inverso de normalización de texto. Esto lo diferencia de la mayoría de ASR, que devuelven texto en minúsculas y sin puntuar.

El modelo se distribuye en formato ONNX (int8 y fp32) y es compatible con sherpa-onnx, lo que permite inferencia offline en CPU, móvil y navegador. Según la model card, alcanza 28 veces tiempo real en un solo núcleo de CPU con cuantización int8. Está pensado para integrarse en el SDK VietASR, que ofrece bindings en Python, Node.js, Go, Rust, Java/Kotlin, C#, C/C++, Android y WASM.

Su relevancia radica en que compite con APIs comerciales (Google Chirp 3, Viettel ASR) y modelos mucho más grandes (Whisper-Large-V3, Qwen3-ASR-1.7B) obteniendo, según los datos del autor, el mejor WER agregado en 24 conjuntos de prueba vietnamitas cuando se evalúa contra referencias con mayúsculas y puntuación. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 transducer (encoder no streaming, decoder stateless, contexto 2) |
| Parametros totales | 85,8 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo no streaming; segmentacion recomendada por VAD de hasta 30 s por segmento) |
| Tipos de cuantizacion | int8 (cuantizacion dinamica de ONNX Runtime) y fp32 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder, decoder y joiner en int8 y fp32) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Zipformer2 en configuracion transducer (RNN-T), con un encoder no streaming, un decoder stateless y un joiner. La entrada es audio mono a 16 kHz convertido a features fbank Kaldi de 80 dimensiones (ventana de 25 ms, salto de 10 ms, sin dither, `snip_edges=false`). El vocabulario es de 8192 tokens BPE con mayúsculas, digitos, puntuacion y byte fallback, lo que permite al modelo emitir directamente texto en forma escrita. La decodificacion recomendada es modified beam search con 4 caminos activos.

La receta de entrenamiento y la arquitectura provienen de k2-fsa/icefall, y la inferencia es compatible con sherpa-onnx. No se detalla en la informacion disponible el numero de horas de audio, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor indica que la version int8 se mantiene dentro de 0,15 puntos de WER respecto a fp32 en una comprobacion cruzada de 900 enunciados sobre seis conjuntos de prueba.

## Capacidades

- Reconocimiento de voz en vietnamita con salida en forma escrita: mayusculas, puntuacion y normalizacion de numeros (ITN) generadas por el propio modelo.
- Transcripcion offline en dispositivo (CPU, movil y navegador via WASM).
- Inferencia de alta eficiencia: 28 veces tiempo real en un nucleo de CPU con int8.
- Compatibilidad con sherpa-onnx y con el SDK VietASR, que incluye bindings en multiples lenguajes.
- Manejo de audio largo mediante segmentacion con VAD (pausas de al menos 1,2 s, segmentos de hasta 30 s, con aproximadamente 1 s de contexto alrededor de cada segmento).
- No se indica soporte de tool calling, agentes, vision, audio mas alla de ASR ni modo thinking.
- Capacidad multilingue limitada al vietnamita.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo genera texto con puntuacion y mayusculas directamente, lo que reduce el postprocesado necesario para actas y notas. La segmentacion por VAD permite procesar grabaciones largas en segmentos de hasta 30 s.
- Atencion al cliente en centros de llamadas: el autor incluye conjuntos privados de call center en su benchmark, donde el modelo obtiene 20,58 de WER agregaado, lo que lo hace adecuado para transcribir conversaciones telefonicas y alimentar sistemas de analitica.
- Subtitulado y transcripcion de contenido audiovisual en vietnamita: la salida puntuada y con mayusculas simplifica la generacion de subtitulos listos para publicacion.
- Asistentes de voz en aplicaciones moviles y de escritorio: al ejecutarse offline con 78 MB en int8 y bindings para Android, iOS via C/C++ y navegador (WASM), permite dictado y comandos de voz sin conexion.
- Digitalizacion de entrevistas y notas de voz: la normalizacion de numeros y la puntuacion facilitan la lectura y el archivado de transcripciones.
- Integracion en pipelines de datos y busqueda: al ser compatible con sherpa-onnx y ONNX Runtime, puede desplegarse en servidores sin GPU para indexar audio y habilitar busqueda sobre contenido hablado.
- Accesibilidad: transcripcion en tiempo casi real en un solo nucleo de CPU para aplicaciones de subtitulado en vivo o asistencia a personas con discapacidad auditiva.

## Benchmarks y rendimiento

WER agregado (%) sobre 24 conjuntos de prueba vietnamitas, evaluado contra referencias con mayusculas, puntuacion y forma escrita. Menor es mejor.

| Sistema | Tamano | Benchmark | Regional | VLSP | Call center | Meeting | Todos (24) |
|---|---|---|---|---|---|---|---|
| VietASR Zipformer-vi | 86M | 18,13 | 16,82 | 25,90 | 20,58 | 32,64 | 24,14 |
| Google Chirp 3 | API | 17,78 | 16,70 | 26,26 | 24,04 | 34,84 | 25,16 |
| Viettel ASR | API | 22,57 | 15,15 | 26,80 | 26,71 | 36,31 | 26,38 |
| Fun-ASR-MLT-Nano-2512 | ~0,8B | 14,56 | 14,09 | 30,09 | 34,39 | 44,23 | 29,57 |
| Parakeet-CTC-0.6B-vi | 0,6B | 17,10 | 16,41 | 30,54 | 37,59 | 43,97 | 30,80 |
| Qwen3-ASR-1.7B | 1,7B | 21,56 | 24,90 | 31,99 | 32,68 | 40,54 | 31,49 |
| gipformer 1.5 RNNT | 65M | 27,09 | 31,18 | 32,13 | 31,16 | 38,82 | 32,19 |
| ZipFormer-30M (hynt) | 30M | 27,11 | 31,20 | 32,90 | 33,38 | 40,95 | 33,25 |
| PhoWhisper-Large | 1,55B | 29,31 | 29,33 | 38,94 | 38,33 | 47,06 | 37,98 |
| Whisper-Large-V3 | 1,55B | 40,22 | 20,02 | 49,15 | 36,53 | 49,73 | 43,28 |

En reconocimiento de palabras en bruto (minusculas, sin puntuacion, digitos deletreados), el modelo obtiene 17,04. En esa vista, los modelos que emiten texto en minusculas y sin puntuar lideran (gipformer 1.5: 12,09; Google Chirp 3: 15,28), aunque dejan la puntuacion y el ITN al usuario. La velocidad indicada es de 28 veces tiempo real en un nucleo de CPU (int8, AMD EPYC 9334, extremo a extremo a traves del SDK).

## Requisitos de hardware

- VRAM estimada: no aplica para la version int8, que esta pensada para CPU. La version fp32 (285 MB) puede ejecutarse en GPU con muy poca memoria, aunque no se especifica una cifra exacta.
- GPU recomendadas: no se indican modelos concretos; la version fp32 es apta para GPU y conversion a fp16. Para CPU, cualquier procesador moderno es suficiente.
- Cabe en GPU de consumo: si, incluso en GPUs de gama baja, dado el tamano del modelo (85,8 M de parametros).
- Opciones de despliegue: sherpa-onnx (recomendado), ONNX Runtime y el SDK VietASR con bindings en Python, Node.js, Go, Rust, Java/Kotlin, C#, C/C++, Android y navegador (WASM).
- Latencia y throughput: 28 veces tiempo real en un solo nucleo de CPU (int8, AMD EPYC 9334, extremo a extremo a traves del SDK). No se proporcionan cifras de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER global (24 sets) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VietASR Zipformer-vi | 85,8 M | no streaming | 24,14 | Apache-2.0 | ONNX, sherpa-onnx, SDK VietASR |
| Google Chirp 3 | no disponible (API) | no disponible | 25,16 | propietaria | API comercial |
| Viettel ASR | no disponible (API) | no disponible | 26,38 | propietaria | API comercial |
| PhoWhisper-Large | 1,55B | no disponible | 37,98 | no disponible | no disponible en la informacion |
| Whisper-Large-V3 | 1,55B | no disponible | 43,28 | MIT (Whisper) | amplia |

VietASR Zipformer-vi ofrece el mejor WER agregado de la tabla con el menor numero de parametros entre los sistemas evaluados, y ademas es ejecutable offline con licencia permisiva. Frente a las APIs comerciales, elimina la dependencia de red y el coste por llamada, aunque no se dispone de datos de latencia de esas APIs para comparar extremo a extremo.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en vietnamita; no soporta otros idiomas.
- Al ser no streaming, requiere segmentacion con VAD para audio largo; no es adecuado para transcripcion en tiempo real continua sin troceado.
- Los benchmarks proceden del propio autor y no se han verificado de forma independiente; conviene tratarlos con cautela.
- Riesgo de alucinacion y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; el WER en reuniones (32,64) es notablemente peor que en otros dominios.
- No se detalla la composicion del dataset de entrenamiento ni los sesgos conocidos, por lo que no es posible evaluar sesgos demograficos o dialectales mas alla de los conjuntos regionales reportados.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de las dependencias (sherpa-onnx, k2-fsa/icefall) y de los datos de audio que procese.
- La version int8 introduce una degradacion de hasta 0,15 puntos de WER respecto a fp32 segun el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/coflar-ai/viet-asr
- SDK VietASR: https://github.com/dangvansam/viet-asr
- k2-fsa/icefall: https://github.com/k2-fsa/icefall
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
