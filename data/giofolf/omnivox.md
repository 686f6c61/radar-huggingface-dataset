# giofolf/omnivox

## Resumen

Omnivox es un paquete de inferencia de reconocimiento automatico del habla (ASR) publicado por el usuario giofolf en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una distribucion que empaqueta los pesos estandar de Whisper `base` en formato ggml junto con los diccionarios de correccion locales que utiliza un teclado Android de estilo Gboard con dictado offline. El motor de ejecucion es `whisper.cpp` a traves de JNI, de modo que toda la transcripcion ocurre en el dispositivo, sin llamadas de red ni dependencia de servicios en la nube como Google Speech.

El modelo base subyacente es el checkpoint `base` multilingue de OpenAI Whisper, con aproximadamente 74 millones de parametros y una ventana de audio de 30 segundos procesada en fragmentos. Omnivox no modifica esos pesos: la adaptacion se produce en tiempo de ejecucion mediante un corrector de diccionario (`DictionaryCorrector.java`) que sustituye palabras ASR de baja confianza por candidatos de alta frecuencia usando distancia de edicion insensible a acentos. Los idiomas efectivamente ejercitados por el teclado son portugues (pt-BR) e ingles, aunque el checkpoint es multilingue.

Su relevancia actual reside en el patron de despliegue: demuestra como empaquetar un motor ASR completo (pesos, diccionarios y modelo de lenguaje local) en un unico repositorio de ~0,1 GB reproducible, orientado a dispositivos moviles con requisitos estrictos de privacidad y funcionamiento sin conectividad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base de OpenAI) |
| Parametros totales | ~74 millones (checkpoint Whisper base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por fragmento (Whisper base) |
| Tipos de cuantizacion | pesos en formato ggml `base` (aproximadamente 141 MB); no se detallan otras variantes en la informacion disponible |
| Idiomas soportados | multilingue; portugues (pt-BR) e ingles ejercitados por el teclado |
| Licencia | MIT |
| Formato de pesos | ggml (`ggml-base.bin`) |

## Arquitectura y entrenamiento

Omnivox emplea el checkpoint `base` sin modificaciones de OpenAI Whisper, un transformer encoder-decoder disenado para transcripcion de audio. El encoder procesa espectrogramas Mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. No hay entrenamiento adicional ni fine-tuning: la model card indica explicitamente que la adaptacion se realiza en tiempo de ejecucion mediante el corrector de diccionario del teclado.

El paquete incorpora tres artefactos auxiliares que forman parte del pipeline offline: `common-words.txt` con palabras de alta frecuencia para el corrector, `pt-br-dictionary.txt` con un diccionario de frecuencias de aproximadamente 3000 palabras en portugues de Brasil, y `pt-br-lm.txt` con un modelo de lenguaje unigram/bigrama local usado por el decodificador de gestos (glide decoding). La innovacion tecnica no esta en el modelo sino en la integracion: audio capturado con `AudioRecord` a 16 kHz PCM, pasado a `libwhisper.so` via JNI, transcrito y posteriormente corregido contra los diccionarios locales.

## Capacidades

- Transcripcion de voz a texto (ASR) offline y en el dispositivo, sin llamadas de red.
- Funcionamiento multilingue heredado de Whisper base, con soporte practico verificado en portugues de Brasil e ingles.
- Correccion post-ASR mediante diccionario de frecuencias y distancia de edicion insensible a acentos.
- Decodificacion de entrada por gestos (glide typing) asistida por un modelo de lenguaje unigram/bigrama local.
- Integracion en teclados Android de estilo Gboard mediante JNI y `VoiceEngine.java`.
- No se documentan capacidades de tool calling, agentes, vision, audio de salida ni modo de razonamiento extendido.

## Casos de uso

- Dictado offline en teclados Android: el modelo se copia en los assets de la app y se carga via JNI, permitiendo transcribir voz sin conectividad ni servicios de terceros, adecuado para entornos con requisitos de privacidad.
- Aplicaciones de notas de voz con privacidad estricta: al ejecutarse enteramente en el dispositivo, el audio no abandona el telefono, lo que facilita el cumplimiento de normativas de proteccion de datos.
- Asistentes de campo sin cobertura: tecnicos o personal en ubicaciones remotas pueden dictar informes en portugues o ingles sin depender de red.
- Prototipado de pipelines ASR embebidos: el repositorio empaqueta pesos, diccionarios y modelo de lenguaje en una sola descarga de ~0,1 GB, lo que simplifica la reproduccion del entorno completo.
- Correccion ortografica y de acentos en portugues de Brasil: el corrector con distancia de edicion insensible a acentos mejora transcripciones de habla coloquial o con variaciones de pronunciacion.
- Entrada por gestos en teclados moviles: el modelo de lenguaje unigram/bigrama local asiste la decodificacion de trazos sin enviar datos a servidores.
- Educacion y accesibilidad: subtitulado local de clases o conversaciones en dispositivos de gama media sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo esta pensado para CPU en moviles; los pesos ggml ocupan aproximadamente 141 MB, por lo que la memoria necesaria es del orden de unos cientos de MB incluyendo buffers de inferencia (estimacion, no confirmada en la informacion disponible).
- GPU recomendadas: no aplica en el escenario objetivo (Android); `whisper.cpp` puede ejecutarse en CPU y dispone de backends opcionales de aceleracion no detallados en la informacion disponible.
- Cabe en GPU consumer: si, cualquier GPU consumer moderna puede ejecutar Whisper base mediante `whisper.cpp`, aunque no es el caso de uso documentado.
- Opciones de despliegue: `whisper.cpp` con JNI en Android; tambien es compatible con el ecosistema `whisper.cpp` en escritorio y con conversiones a otros runners, aunque no se documentan en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Omnivox (Whisper base) | ~74 M | 30 s por fragmento | Multilingue (pt, en ejercitados) | MIT | ggml |
| Whisper tiny | ~39 M | 30 s por fragmento | Multilingue | MIT | ggml, safetensors |
| Whisper small | ~244 M | 30 s por fragmento | Multilingue | MIT | ggml, safetensors |
| Whisper medium | ~769 M | 30 s por fragmento | Multilingue | MIT | ggml, safetensors |

Omnivox se diferencia de los checkpoints Whisper originales por incluir diccionarios de correccion y un modelo de lenguaje local para portugues de Brasil, ademas de estar empaquetado para un pipeline Android concreto. En precision ASR pura, al usar los pesos `base` sin modificaciones, su rendimiento equivale al de Whisper base estandar; no se dispone de datos comparativos medidos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son identicos al checkpoint `base` de Whisper, por lo que hereda sus sesgos y errores de transcripcion.
- Riesgo de alucinacion en audio con ruido, silencios largos o habla no contemplada; Whisper base es propenso a generar texto inventado en segmentos ambiguos.
- Ventana de audio limitada a 30 segundos por fragmento, lo que exige segmentacion en dictados largos.
- Cobertura idiomatica practica reducida a portugues de Brasil e ingles; el resto de idiomas multilingues de Whisper no esta validado en este paquete.
- El corrector de diccionario puede introducir sustituciones erroneas en nombres propios, terminos tecnicos o jerga ausente del diccionario de ~3000 palabras.
- El modelo de lenguaje para gestos esta limitado al portugues de Brasil; no hay soporte equivalente documentado para otros idiomas.
- Licencia MIT permite uso comercial, pero se deben conservar los avisos de copyright de OpenAI y Georgi Gerganov.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y mantenimiento no verificables.
- No se documentan procesos de evaluacion, versionado ni pruebas de regresion del pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/giofolf/omnivox
- whisper.cpp (ggerganov): https://github.com/ggerganov/whisper.cpp
- OpenAI Whisper: https://github.com/openai/whisper
