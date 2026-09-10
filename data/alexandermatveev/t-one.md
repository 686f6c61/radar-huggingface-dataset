# AlexanderMatveev/T-one

## Resumen

T-one es un sistema de reconocimiento automático del habla (ASR) en streaming diseñado específicamente para el dominio de la telefonía en ruso. Lo desarrolla T-Software DC, un equipo que publica el modelo como proyecto de código abierto bajo licencia Apache 2.0. Su objetivo principal es ofrecer una solución de baja latencia para la transcripción en tiempo real de conversaciones telefónicas, un escenario donde los modelos generalistas suelen perder precisión por el ruido, la compresión de audio y los turnos de habla solapados.

El modelo base es un acústico de 71 millones de parámetros basado en arquitectura Conformer, que se acompaña de un detector de límites de frase y un decodificador CTC con búsqueda en haz sobre un modelo de lenguaje KenLM. En la práctica, T-one no es solo un checkpoint, sino un pipeline completo listo para producción que incluye herramientas de inferencia, fine-tuning y despliegue con servidores como Triton. Según las pruebas reportadas por sus autores, supera a modelos considerablemente mayores en el dominio de telefonía: consigue un WER del 8,63 en el conjunto Call-center, frente al 10,22 de GigaAM-RNNT v2 (243M) o al 19,39 de Whisper large-v3 (1540M).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder con U-Net interno y atención de grupo) |
| Parametros totales | 71.697.827 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo ASR, no de texto generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura acústica de T-one se basa en un encoder Conformer que incorpora varias innovaciones técnicas sobre el diseño original. Sustituye la capa feed-forward por un módulo SwiGLU, utiliza activaciones SiLU y normalización RMSNorm en lugar de ReLU y LayerNorm, y emplea embeddings rotacionales (RoPE) en lugar de las posiciones relativas de Transformer-XL. Además, introduce una estructura U-Net en la dimensión temporal: la señal se submuestrea y luego se vuelve a sobremuestrear dentro de los bloques Conformer, lo que amplía el campo receptivo del modelo sin aumentar de forma desproporcionada el coste computacional. Por último, agrupa las capas de auto-atención multi-cabeza para reutilizar las puntuaciones de atención y reducir el cómputo.

El checkpoint publicado corresponde a un modelo preentrenado listo para inferencia. El pipeline incluye un detector de límites de frase diseñado para segmentar el audio en turnos cortos y un decodificador CTC con beam search basado en un modelo de lenguaje KenLM. El proyecto proporciona ejemplos de inferencia offline y online, así como un notebook de fine-tuning que permite adaptar el modelo a conjuntos de datos propios utilizando el ecosistema de Hugging Face y el entrenador estándar de 🤗. No se publican en la información disponible detalles sobre el número de tokens, el dataset exacto de preentrenamiento ni si hubo etapas de RLHF o DPO, ya que se trata de un modelo ASR, no de un modelo de lenguaje generativo.

## Capacidades

- Transcripción de voz en ruso, especializada en audio telefónico (llamadas, centros de contacto, grabaciones de calidad degradada).
- Reconocimiento en streaming: procesa fragmentos de audio en tiempo real y devuelve frases con marcas de tiempo de inicio y fin.
- Segmentación de frases mediante un detector de límites propio, lo que permite obtener transcripciones con estructura de turnos.
- Decodificación CTC con beam search sobre un modelo de lenguaje KenLM, sin necesidad de un sistema externo de normalización.
- Inferencia offline para archivos completos de audio.
- Compatibilidad con fine-tuning usando el entorno de Hugging Face y el entrenador estándar.
- Despliegue en servidores de inferencia de alta concurrencia con ejemplos para Triton Inference Server.
- Incluye un servicio local desplegable con Docker para transcribir ficheros o micrófono en tiempo real.

## Casos de uso

- Transcripción de llamadas en centros de contacto: T-one está optimizado para conversaciones telefónicas y logra un WER de 8,63 en el conjunto Call-center, por lo que puede integrarse en sistemas de análisis de calidad de agentes o en el registro automatizado de interacciones con clientes.

- Analitica de audio en tiempo real para teleoperadores: al ser un modelo de streaming con baja latencia, sirve para alimentar dashboards que visualizan la conversación a medida que se produce, permitiendo a los supervisores intervenir en caliente.

- Subtitulado automático de llamadas grabadas: la inferencia offline devuelve frases con marcas temporales, lo que facilita generar subtitulos sincronizados para revisión posterior o para cumplimiento normativo.

- Integracion con sistemas IVR o bots de voz: el pipeline puede usarse como capa de transcripción para convertir la voz del cliente en texto y conectarla a un motor de dialogo o a un sistema de routing inteligente.

- Asistentes de anotacion para reuniones telefonicas: gracias a la deteccion de limites de frase, se pueden extraer turnos de habla y generar resumenes parciales o actas de reuniones mantenidas por telefono.

- Corpus de entrenamiento para modelos de lenguaje: el modelo puede aplicarse para transcribir grandes volumenes de audio telefonico y construir datasets etiquetados que luego se utilicen para entrenar sistemas de analisis de sentimiento, extraccion de entidades o clasificacion de temas.

## Benchmarks y rendimiento

La informacion disponible incluye una tabla de WER comparando T-one con modelos de referencia. T-one se situa como el mejor modelo en los conjuntos de telefono y de entidades nombradas, aunque pierde frente a GigaAM en CommonVoice.

| Categoria | T-one (71M) | GigaAM-RNNT v2 (243M) | GigaAM-CTC v2 (242M) | Vosk-model-ru 0.54 (65M) | Vosk-model-small-streaming-ru 0.54 (20M) | Whisper large-v3 (1540M) |
|:--|:--|:--|:--|--:|:--|:--|
| Call-center | **8,63** | 10,22 | 10,57 | 11,28 | 15,53 | 19,39 |
| Other telephony | **6,20** | 7,88 | 8,15 | 8,69 | 13,49 | 17,29 |
| Named entities | **5,83** | 9,55 | 9,81 | 12,12 | 17,65 | 17,87 |
| CommonVoice 19 (test split) | 5,32 | **2,68** | 3,14 | 6,22 | 11,30 | 5,78 |
| OpenSTT asr_calls_2_val original | 20,27 | **20,07** | 21,24 | 22,64 | 29,45 | 29,02 |
| OpenSTT asr_calls_2_val re-labeled | **7,94** | 11,14 | 12,43 | 13,22 | 21,03 | 20,82 |

## Requisitos de hardware

- El modelo tiene 71 millones de parametros, lo que lo hace ligero en comparacion con sistemas como Whisper large-v3 o GigaAM-CTC v2.
- El tamano del repositorio es de 5,9 GB, pero esto incluye los pesos en safetensors y los modelos ONNX, no solo el checkpoint acustico.
- No se dispone en la informacion de valores de VRAM exactos para cada cuantizacion, por lo que se considera "no disponible". Dado el tamano de parametros, la inferencia deberia caber con holgura en GPU de consumo (p. ej., RTX 3060 o superior) y tambien en CPU.
- El repositorio incluye ejemplos de despliegue con Triton Inference Server para escenarios de alta concurrencia, asi como un contenedor Docker para ejecutar el servicio localmente.
- Para streaming, el modelo esta disenado para procesar fragmentos de audio con baja latencia, por lo que puede usarse en entornos edge con GPU modesta o en servidores CPU con suficiente capacidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio principal | WER Call-center | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| T-one (71M) | 71,7M | streaming | Telefonia rusa | **8,63** | Apache 2.0 | ONNX, safetensors, codigo abierto |
| GigaAM-RNNT v2 (243M) | 243M | no especificado | Reconocimiento general ruso | 10,22 | no disponible | modelo de referencia |
| GigaAM-CTC v2 (242M) | 242M | no especificado | Reconocimiento general ruso | 10,57 | no disponible | modelo de referencia |
| Vosk-model-ru 0.54 (65M) | 65M | streaming | Telefonia rusa | 11,28 | no disponible | Apache 2.0 (Vosk) |
| Whisper large-v3 (1540M) | 1540M | contexto fijo (audio) | Multilenguaje general | 19,39 | MIT | codigo abierto |

La comparativa muestra que T-one, pese a ser significativamente mas pequeño que GigaAM y Whisper, supera a ambos en los conjuntos especificos de telefono y entidades nombradas. Esto lo convierte en una opcion muy competitiva para el dominio de telefonía en ruso.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado exclusivamente en ruso. No soporta otros idiomas ni reconoce codigos mezclados.
- La calidad se degrada notablemente cuando el audio no procede de un canal telefonico, como indica el peor rendimiento en CommonVoice frente a GigaAM.
- No se han publicado en la informacion disponible sesgos especificos medidos ni estudios de equidad, por lo que se desconocen posibles sesgos demograficos o de acento.
- El proyecto es de codigo abierto bajo Apache 2.0, pero los modelos con los que se compara (GigaAM) pueden tener licencias distintas que conviene revisar antes de usarlos en produccion.
- La informacion sobre hardware y latencia no esta cuantificada en la documentacion publicada, por lo que es necesario realizar pruebas internas antes de dimensionar un despliegue de produccion.
- El modelo card no describe restricciones particulares para uso comercial, ya que Apache 2.0 lo permite, pero se recomienda revisar las dependencias de terceros (KenLM, Vosk, etc.) si se redistribuye.

## Enlaces

- HuggingFace: https://huggingface.co/AlexanderMatveev/T-one
- Repositorio GitHub: https://github.com/voicekit-team/T-one
