# smajji/nemotron-hinglish-v4

## Resumen

Nemotron Hinglish v4 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario smajji como ajuste fino del modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b`. Está especializado en inglés, hindi y hinglish (alternancia de código hindi-inglés) y conserva la arquitectura FastConformer-Transducer (RNNT) con streaming cache-aware, 24 capas, 1024 dimensiones ocultas y aproximadamente 600 millones de parámetros. El modelo mantiene el vocabulario BPE de 13088 tokens y los 128 prompts de idioma del modelo base, incluido el prompt `auto` de detección automática de idioma.

El problema que resuelve es concreto: la transcripción de audio real con alternancia frecuente entre hindi e inglés, un fenómeno muy extendido en India en entornos de atención al cliente, medios de comunicación y reuniones corporativas, donde los modelos monolingües o los multilingües genéricos degradan notablemente. Según la model card, el ajuste incorpora corpus densos en números y símbolos para mejorar la precisión en dígitos y números de teléfono, y reporta un WER del 4,0 % en inglés, 12,0 % en hindi y 29,2 % en hinglish en una muestra reservada con decodificación greedy.

Es relevante para quien necesite ASR en streaming de baja latencia con licencia Apache-2.0 y sin dependencia de APIs propietarias, aunque el WER reportado en hinglish (29,2 %) sigue siendo alto para producción sin revisión humana. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un modelo reciente y sin validación independiente conocida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Transducer (RNNT) con streaming cache-aware y submuestreo 8x; 24 capas, 1024 dimensiones ocultas |
| Parametros totales | ~600 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No expresada en tokens; el modelo es de streaming con tamanos de chunk de 80, 160, 320, 560 y 1120 ms |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (`en`), hindi (`hi`) y hinglish (code-switching hindi-ingles, via prompt `auto`); vocabulario BPE de 13088 tokens y 128 prompts de idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint NeMo (libreria `nemo`); el repositorio ocupa 5,1 GB y no se detalla la lista de ficheros |
| Frecuencia de muestreo | 16 kHz mono |
| Modelo base | `nvidia/nemotron-3.5-asr-streaming-0.6b` (ajuste fino) |
| Fecha de publicacion (metadatos) | 17 de septiembre de 2026 (creacion), 17 de septiembre de 2026 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un FastConformer-Transducer (RNNT) con streaming cache-aware y submuestreo 8x, heredada integramente del modelo base. Consta de 24 capas con 1024 dimensiones ocultas y ronda los 600 millones de parametros. El decodificador es un transductor recurrente (RNNT), lo que permite decodificacion en linea sin esperar a la frase completa, con tamanos de chunk configurables de 80, 160, 320, 560 y 1120 ms. El modelo usa el mecanismo de prompt condicionado de NeMo (`EncDecRNNTBPEModelWithPrompt`, segun la ficha de la version v1 del mismo autor) con 128 prompts de idioma, entre ellos el prompt `auto` de deteccion automatica, que es el utilizado para manejar la alternancia de codigo.

El ajuste fino se realizo sobre una mezcla bilingue y code-mixed que incluye SPGISpeech, IISc_SPICOR, Peoples Speech, TEDLIUM, earnings22, SPRING Hindi, Shrutilipi, IndicVoices-R, FLEURS (en e hi), UJS y Hinglish-CC. El autor anade explicitamente corpus densos en numeros y simbolos para mejorar la precision en digitos y numeros de telefono, y afirma que esta version presenta el menor numero de errores en secuencias de digitos de todas las publicaciones de la serie. El entrenamiento se llevo a cabo con autodeteccion de idioma mediante el prompt `auto`, preservando puntuacion y uso de mayusculas/minusculas para mantener el estilo de texto del modelo base. No se detalla el numero total de horas de audio ni la composicion porcentual del dataset, ni si hubo etapas de RLHF o DPO (no aplicables de forma habitual en ASR).

## Capacidades

- Reconocimiento automatico del habla en ingles, hindi y hinglish con alternancia de codigo dentro de una misma frase.
- Streaming en tiempo real con decodificacion cache-aware y tamanos de chunk de 80, 160, 320, 560 y 1120 ms, lo que permite ajustar el compromiso entre latencia y precision.
- Deteccion automatica de idioma mediante el prompt `auto`, sin necesidad de declarar el idioma de entrada.
- Salida con puntuacion y uso de mayusculas/minusculas preservados, segun la model card.
- Mayor precision en digitos y numeros de telefono gracias a los corpus densos en numeros anadidos durante el ajuste.
- Entrada de audio mono a 16 kHz.
- Integracion nativa con NeMo (`nemo.collections.asr`), con transcripcion por lotes (`batch_size` configurable).
- No soporta tool calling, function calling ni uso como agente: es un modelo exclusivamente de ASR.
- No dispone de capacidades de vision, audio generativo, texto generativo ni razonamiento multi-paso.

## Casos de uso

- Subtitulado en directo de retransmisiones con hablantes bilingues hindi-ingles: el modo streaming con chunks de 160-320 ms permite emitir subtitulos con latencia baja mientras se mantiene el reconocimiento de la alternancia de codigo mediante el prompt `auto`.
- Transcripcion de centros de llamadas y llamadas de resultados financieros: la inclusion de earnings22 y SPGISpeech en el entrenamiento, junto a la mejora en digitos, lo hace adecuado para transcribir conversaciones con importes, cifras y datos numericos.
- Atencion al cliente automatizada en India: alimentar un pipeline de analitica de voz (sentimiento, motivos de llamada, cumplimiento) con transcripciones fiables de conversaciones que mezclan hindi e ingles.
- Dictado de numeros de telefono y datos de identificacion: el ajuste sobre corpus densos en numeros reduce los errores en secuencias de digitos, util en formularios por voz, verificacion de identidad y sistemas IVR.
- Accesibilidad y documentacion de reuniones: transcripcion de reuniones corporativas con terminologia tecnica en ingles insertada en discurso en hindi, con puntuacion preservada para facilitar la lectura.
- Indexacion y busqueda de archivos audiovisuales: transcripcion por lotes de catalogos de audio o video en hindi, ingles y hinglish para habilitar busqueda por texto sobre el contenido hablado.
- Investigacion en code-switching: el modelo sirve como punto de partida para experimentos de ajuste fino o evaluacion de ASR con alternancia de codigo, dado que es un ajuste abierto con licencia permisiva sobre un modelo base de NVIDIA.
- Despliegue en entornos con restricciones de conectividad o soberania del dato: al ser un modelo de 600 M de parametros con licencia Apache-2.0, puede ejecutarse en infraestructura propia sin enviar audio a terceros.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, con decodificacion greedy, WER insensible a la puntuacion, sobre una muestra reservada y con el prompt `auto`:

| Idioma | Nemotron-Hinglish-v4 (WER) |
|---|---|
| Ingles | 4,0 % |
| Hindi | 12,0 % |
| Hinglish | 29,2 % |

El autor indica ademas que la precision en digitos y numeros de telefono mejora respecto a versiones anteriores, con el menor numero de errores en secuencias de digitos de la serie. No se proporcionan resultados comparativos con el modelo base ni con otros sistemas ASR, ni datos de latencia o throughput. No hay evaluaciones independientes publicadas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion aritmetica a partir de los ~600 M de parametros, no confirmada por el autor): alrededor de 2,4 GB en precision fp32, 1,2-1,5 GB en fp16/bf16 y 0,7-1,0 GB en int8, mas el consumo de activaciones y del buffer de streaming (dependiente del tamano de chunk y del lote).
- El repositorio ocupa 5,1 GB, un tamano superior al de los pesos en fp16, lo que sugiere la presencia de varios artefactos (posiblemente checkpoints en fp32 o ficheros adicionales); no se detalla su contenido.
- Cabe en GPUs de consumo: cualquier GPU con 4 GB o mas de VRAM (por ejemplo GTX 1650 4 GB, RTX 3050, RTX 4060, RTX 4090) deberia poder ejecutar inferencia en fp16 con lotes pequenos, asi como en CPU para transcripcion por lotes no interactiva.
- GPUs recomendadas para produccion con concurrencia alta: NVIDIA A10, L4, A100 o H100, en funcion del numero de flujos simultaneos y del tamano de lote.
- El autor indica explicitamente la disponibilidad de sistemas con 16 GB de VRAM (por ejemplo RTX 4080) para ejecucion en local.
- Opciones de despliegue: NeMo (`nemo.collections.asr`), que es la via documentada en la model card. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y ninguna de ellas soporta de forma nativa checkpoints RNNT de NeMo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han publicado en la informacion disponible resultados comparativos entre este modelo y alternativas de la misma categoria. La tabla siguiente recoge unicamente los datos confirmados del modelo base y deja el resto como no disponible.

| Modelo | Parametros | Idiomas | Licencia | WER reportado | Disponibilidad |
|---|---|---|---|---|---|
| smajji/nemotron-hinglish-v4 | ~600 M | en, hi, hinglish | Apache-2.0 | en 4,0 % / hi 12,0 % / hinglish 29,2 % | HuggingFace (0 descargas) |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | ~600 M | multilingue (13088 BPE, 128 prompts) | no disponible | no disponible | Referenciado como modelo base |
| smajji/nemotron-hinglish-v1 | ~600 M | en, hi, hinglish | no disponible | no disponible | HuggingFace |
| Otras alternativas (Whisper, IndicConformer, etc.) | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- El WER del 29,2 % en hinglish es elevado: cerca de uno de cada tres caracteres o palabras se transcribe de forma incorrecta en ese registro, lo que hace desaconsejable su uso sin revision humana en aplicaciones sensibles.
- El WER del 12,0 % en hindi tambien es alto en comparacion con el 4,0 % en ingles, lo que refleja un desequilibrio claro de rendimiento entre idiomas.
- No se dispone de evaluaciones independientes: los unicos numeros provienen del propio autor, sobre una muestra reservada no descrita en detalle, lo que impide verificar el metodo de evaluacion.
- El modelo se publica con 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni informes de terceros sobre su comportamiento.
- Al ser un ajuste fino sobre un modelo base de NVIDIA, puede heredar los sesgos acusticos y dialectales de dicho modelo base, especialmente hacia variedades del hindi y del ingles indio presentes en los corpus de entrenamiento (IISc_SPICOR, Shrutilipi, IndicVoices-R, entre otros). No se documentan analisis de sesgo por acento, genero, edad o clase social.
- El rendimiento fuera de los tres registros objetivo (ingles, hindi e hinglish) no esta documentado; el uso con otras lenguas del vocabulario del modelo base podria degradarse de forma impredecible.
- El snippet de uso de la model card invoca `restore_from("nvidia/nemotron-hinglish-v4")`, una ruta que no coincide con el identificador real del repositorio (`smajji/nemotron-hinglish-v4`). Conviene apuntar a la ruta correcta o descargar el checkpoint localmente.
- El repositorio ocupa 5,1 GB sin que se detalle la lista de ficheros, lo que dificulta estimar el espacio de disco real necesario y el formato exacto de los pesos.
- No se especifican tipos de cuantizacion soportados, por lo que reducir el modelo a int8 o int4 requiere una validacion propia de la precision resultante.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el modelo base tambien se distribuye bajo una licencia que conviene verificar en su propio repositorio antes de un despliegue comercial.
- La decodificacion RNNT en streaming requiere gestionar el estado de cache entre chunks; un manejo incorrecto del buffer puede degradar la calidad de la transcripcion de forma no evidente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smajji/nemotron-hinglish-v4
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Version previa de la serie: https://huggingface.co/smajji/nemotron-hinglish-v1
- Documentacion de NeMo ASR (referenciada implicitamente por la libreria `nemo`): no disponible en la informacion proporcionada
- Paper, blog o demo del modelo: no disponible en la informacion proporcionada
