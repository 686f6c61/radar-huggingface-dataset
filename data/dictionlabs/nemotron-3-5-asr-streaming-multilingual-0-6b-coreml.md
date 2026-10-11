# DictionLabs/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML

## Resumen

DictionLabs/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML es una compilacion en Core ML del modelo de reconocimiento automatico del habla (ASR) en streaming Nemotron 3.5 de NVIDIA, en su variante multilingue de 0,6B de parametros. No es un modelo entrenado por DictionLabs: se trata de una copia byte a byte de una unica variante (`multilingual/560ms`) del repositorio de FluidInference, reempaquetada para que la aplicacion iOS de Diction descargue los pesos desde un espacio de nombres propio. Se carga en aplicaciones Apple mediante el SDK FluidAudio, concretamente a traves del gestor `StreamingNemotronMultilingualAsrManager`.

El modelo resuelve el problema de la transcripcion de voz en tiempo real sin salida a la nube: al ejecutarse sobre Core ML y el Neural Engine (ANE) de Apple Silicon, permite dictado, subtitulos y transcripcion continua enteramente en el dispositivo. La arquitectura subyacente es un FastConformer cache-aware con decodificador RNNT (transducer), disenado para streaming por bloques; la variante empaquetada trabaja con fragmentos de 560 ms. El modelo base declara cobertura de 40 locales de idioma segun fuentes externas, aunque la model card de este repositorio no enumera los idiomas soportados.

Su relevancia actual es doble: por un lado, NVIDIA distribuye los pesos originales bajo OpenMDW-1.1 con uso comercial permitido, lo que facilita la redistribucion; por otro, la conversion a Core ML abre la inferencia ASR de baja latencia en iPhone, iPad y Mac sin GPU dedicada ni conexion de red. El repositorio tiene un tamano de 0,7 GB, cero descargas y cero likes en el momento de redactar esta ficha, por lo que debe considerarse un artefacto de distribucion de una app concreta mas que un modelo de proposito general con comunidad establecida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware con decodificador RNNT (transducer) en streaming |
| Parametros totales | Aproximadamente 600 millones (0,6B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; modelo de streaming que procesa fragmentos de 560 ms (variante `multilingual/560ms`) |
| Tipos de cuantizacion | no especificado en la model card; el repositorio ocupa 0,7 GB en formato Core ML (otras compilaciones publicas del mismo modelo se distribuyen como Core ML INT8 y MLX 4-bit) |
| Idiomas soportados | multilingue, 40 locales de idioma segun fuentes externas; la model card no enumera la lista exacta |
| Licencia | OpenMDW-1.1 (uso comercial permitido; requiere mantener la atribucion a NVIDIA y FluidInference) |
| Formato de pesos | Core ML, consumido mediante la libreria `fluidaudio` (no se publican safetensors ni GGUF en este repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b`: un FastConformer con mecanismo de atencion cache-aware y decodificador RNNT. El diseno cache-aware permite reutilizar el estado de atencion entre fragmentos de audio consecutivos, de modo que el modelo puede emitir transcripcion incremental con una latencia de bloque de 560 ms sin recalcular todo el contexto acustico. La variante multilingue anade condicionamiento por prompt de identificacion de idioma (language-ID), lo que permite cubrir 40 locales con un unico conjunto de pesos en lugar de un modelo por idioma. Segun la documentacion de NVIDIA para la familia Nemotron ASR, el modelo emite puntuacion y mayusculas de forma nativa, sin necesidad de post-procesado.

DictionLabs no ha entrenado ni ajustado este modelo: el repositorio contiene la conversion a Core ML realizada por FluidInference (revision `1a41b75758b0337ff67db7d5408280aaaf23074e`), redistribuida bajo la misma licencia OpenMDW-1.1. No hay informacion disponible sobre volumen de tokens de audio, composicion del dataset de entrenamiento, idiomas exactos del corpus ni sobre si se aplicaron tecnicas de ajuste por refuerzo o preferencias; en el caso de un modelo ASR, ese tipo de alineacion no es el mecanismo habitual, sino el entrenamiento supervisado con CTC/RNNT y, en su caso, destilacion o ajuste fino. Cualquier detalle adicional sobre el pipeline de entrenamiento de NVIDIA no aparece en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla en streaming: transcripcion incremental con bloques de audio de 560 ms, apta para subtitulado en vivo y dictado continuo.
- Modo multilingue: cobertura declarada de 40 locales de idioma mediante condicionamiento por identificacion de idioma en un solo modelo.
- Salida con puntuacion y capitalizacion nativas, sin necesidad de un modelo de restauracion de puntuacion posterior.
- Inferencia on-device sobre Core ML y el Neural Engine de Apple Silicon (iPhone, iPad, Mac con chip de la serie M o A compatible).
- Integracion con el SDK FluidAudio mediante `StreamingNemotronMultilingualAsrManager`, pensada para aplicaciones Swift/iOS.
- Ejecucion sin conexion de red y sin enviar audio a servidores externos, lo que habilita casos con requisitos de privacidad estrictos.
- No soporta tool calling ni function calling: es un modelo exclusivamente de voz a texto.
- No tiene capacidades de vision, audio generativo, sintesis de voz ni razonamiento multi-paso mas alla del decodificado del transducer.
- No se documenta en la model card ningun "thinking mode" ni capacidad de agente.

## Casos de uso

- Subtitulado en vivo en aplicaciones iOS y macOS: el modelo procesa audio en fragmentos de 560 ms sobre el ANE, lo que permite mostrar palabras a medida que se hablan sin depender de un servicio en la nube. Es adecuado porque su diseno cache-aware mantiene la coherencia entre fragmentos y evita reinicios del contexto acustico.
- Dictado por voz en aplicaciones de notas: el usuario puede dictar texto largo con puntuacion y mayusculas generadas por el propio modelo, sin post-procesado adicional, en un dispositivo que no sale de la red local.
- Transcripcion de reuniones con requisitos de confidencialidad: al ejecutarse localmente, el audio de la reunion nunca abandona el dispositivo, lo que encaja con entornos legales, sanitarios o de defensa donde el envio a API externas esta restringido.
- Accesibilidad para personas con discapacidad auditiva: generacion de subtitulos en tiempo real en el propio telefono durante conversaciones presenciales o consumo de medios, con latencia de bloque reducida.
- Asistentes de voz y agentes conversacionales embebidos: el modelo actua como etapa de entrada de voz, entregando texto a un componente de comprension o a un LLM local; su tamano de 0,6B y su ejecucion en ANE liberan la CPU y la GPU del dispositivo.
- Transcripcion de notas de voz para periodismo de campo o investigacion: sin conectividad, el dispositivo transcribe entrevistas largas por bloques y el periodista obtiene un borrador de texto con puntuacion utilizable para edicion posterior.
- Aplicaciones de productividad con soporte multilingue: gracias al condicionamiento por idioma y a la cobertura declarada de 40 locales, una misma aplicacion puede transcribir usuarios en distintos idiomas sin cargar un modelo distinto por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye tasas de error de palabra (WER), latencia medida extremo a extremo, uso de memoria ni comparaciones con otros sistemas ASR. Las fuentes externas consultadas tampoco aportan cifras numericas verificables para esta variante concreta.

## Requisitos de hardware

- Inferencia exclusivamente sobre Apple Silicon: Core ML con aceleracion en el Neural Engine (ANE); no hay ruta CUDA ni ROCm documentada para este repositorio.
- Dispositivos objetivo: iPhone e iPad con chip de la serie A con Neural Engine, y Mac con chip de la serie M.
- VRAM: no aplica, al no ejecutarse sobre GPU dedicada. El repositorio ocupa 0,7 GB en disco; el consumo de memoria en tiempo de ejecucion no esta documentado y dependera del backend Core ML y del esquema de cuantizacion efectivo.
- No cabe ni esta pensado para GPU de consumo tipo RTX 4090, A100 o H100: ese uso corresponderia a los pesos originales de NVIDIA, no a esta compilacion Core ML.
- Opciones de despliegue: SDK FluidAudio sobre Core ML en plataformas Apple. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia: la variante empaquetada trabaja con bloques de 560 ms, lo que fija un suelo de latencia de aproximadamente ese orden por fragmento; no se publican cifras de throughput ni de tiempo de computo por bloque.
- Para servir el modelo en GPU, existen rutas alternativas mantenidas por terceros (servidor FastAPI con los pesos originales de NVIDIA, bundles MLX 4-bit para Mac), pero no forman parte de este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DictionLabs/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML | ~0,6B | streaming, bloques de 560 ms | 40 locales (segun fuentes externas) | OpenMDW-1.1 | Core ML, via FluidAudio |
| FluidInference/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML | ~0,6B | streaming, misma variante `multilingual/560ms` | 40 locales | OpenMDW-1.1 | Core ML, repositorio origen de esta copia |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~0,6B | streaming | multilingue | OpenMDW-1.1 | pesos originales de NVIDIA; requiere runtime propio |
| nvidia/nemotron-asr-streaming (variante inglesa) | ~0,6B | streaming | ingles | no disponible en las fuentes consultadas | pesos y despliegue via NVIDIA NIM |

No se dispone de cifras de WER comparativas entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a tamano, modalidad de despliegue, cobertura de idiomas y licencia. Conviene tener en cuenta que la variante inglesa y la multilingue comparten escala pero no necesariamente el mismo conjunto de datos ni el mismo rendimiento por idioma.

## Limitaciones y advertencias

- La model card no enumera los idiomas concretos cubiertos: los "40 locales" provienen de fuentes externas y no de documentacion del propio repositorio, por lo que conviene verificarlos antes de comprometer un producto.
- No se publican tasas de error de palabra ni evaluaciones por idioma; sin benchmarks, no es posible estimar la calidad real en cada locale.
- Riesgo de alucinacion tipico de los modelos ASR: en tramos de silencio, ruido o audio musical el modelo puede generar texto plausible pero inexistente. Es necesario implementar deteccion de voz (VAD) y filtros de salida vacia en produccion.
- Es un modelo exclusivamente de voz a texto: no admite tool calling, agentes, vision ni generacion de texto libre.
- Dependencia de plataforma: esta compilacion solo funciona en el ecosistema Apple con Core ML y el SDK FluidAudio. No es portable a Linux, Windows, Android o servidores x86 sin recurrir a otros artefactos.
- La latencia minima viene impuesta por los bloques de 560 ms; no es adecuada para escenarios que exijan respuesta por debajo de ese umbral.
- Licencia OpenMDW-1.1: permite uso comercial, pero obliga a conservar la atribucion a NVIDIA y FluidInference y el aviso de licencia al redistribuir. Si se elimina la atribucion, el uso deja de estar cubierto.
- El repositorio registra cero descargas y cero likes, y es una copia de redistribucion, no una fuente canonica: ante una actualizacion del modelo original, esta copia puede quedar desactualizada.
- No se documentan medidas de mitigacion de sesgos ni evaluacion de sesgo por acento, variedad dialectal, edad o genero.
- El usuario debe comprobar la revision exacta (`1a41b75758b0337ff67db7d5408280aaaf23074e` del repositorio de FluidInference) si necesita reproducibilidad byte a byte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DictionLabs/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML
- Modelo base de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Repositorio Core ML de origen (FluidInference): https://huggingface.co/FluidInference/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Aplicacion Diction: https://diction.one
- Model card de NVIDIA NIM para la familia Nemotron ASR: https://build.nvidia.com/nvidia/nemotron-asr-streaming/modelcard
- Guia de despliegue on-device Core ML INT8 y MLX 4-bit (Soniqo): https://soniqo.audio/guides/nemotron
- Servidor de streaming autoalojado sobre los pesos originales (GitHub): https://github.com/tehtommeh/nemotron-asr-streaming/tree/main
- Compilacion Core ML de Lorqa para subtitulos en vivo: https://huggingface.co/Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-coreml
- Conversion INT8 del modelo multilingue: https://huggingface.co/framadhita/INT8-nemotron-3.5-asr-streaming-0.6b
