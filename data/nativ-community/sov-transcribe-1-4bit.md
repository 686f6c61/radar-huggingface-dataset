# nativ-community/SOV-Transcribe-1-4bit

## Resumen

SOV-Transcribe-1-4bit es una conversión cuantizada a 4 bits del modelo de reconocimiento automático del habla (ASR) SOV-Transcribe-1 de Salesforce, publicada por la comunidad nativ-community. El modelo original combina un codificador de audio basado en Whisper large-v3 con un decodificador de mezcla de expertos (MoE) derivado de la familia Gemma, sumando 26,6 mil millones de parámetros totales con 4,6 mil millones activos por token. Esta versión reduce el peso del decodificador a 4 bits para hacer viable su ejecución en hardware Apple Silicon mediante MLX.

La propuesta del modelo es la transcripción offline con control en lenguaje natural: admite instrucciones de formato (puntuación, mayúsculas, estilo escrito), pistas de idioma y vocabulario contextual (hotwords), y acepta grabaciones de hasta 30 minutos. Cubre siete idiomas europeos (inglés, francés, alemán, español, italiano, portugués y neerlandés), lo que lo sitúa como una alternativa multilingüe de gama alta frente a Whisper large-v3 y otros sistemas ASR clásicos.

La relevancia de esta ficha concreta radica en su formato: es una conversión MLX de 4 bits con licencia Apache 2.0, pensada para inferencia local en Macs. El repositorio ocupa 15,6 GB y no registra descargas ni interacciones en el momento de la consulta, por lo que debe considerarse una publicación reciente y poco validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio Whisper large-v3 + decodificador MoE tipo Gemma (transformer encoder-decoder) |
| Parametros totales | 25.892.458.526 (~26,6B) |
| Parametros activos | 4,6B (MoE) |
| Longitud de contexto | No disponible de forma explícita; admite audio de hasta 30 minutos por entrada |
| Tipos de cuantizacion | 4-bit affine con group size 64 (decodificador); BF16 (codificador de audio y proyector); FP32 (routers MoE) |
| Idiomas soportados | en, fr, de, es, it, pt, nl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería mlx-audio) |

## Arquitectura y entrenamiento

El modelo es un sistema encoder-decoder para ASR. La parte de audio emplea el codificador de Whisper large-v3, que convierte la señal de 16 kHz en representaciones acústicas; un proyector de audio adapta esas representaciones a la entrada del decodificador. El decodificador es un transformer de mezcla de expertos con 26,6B parámetros totales y 4,6B activos por token, lo que permite un coste de cómputo por paso mucho menor que el de un modelo denso del mismo tamaño. La decodificación es autorregresiva y genera el texto transcrito condicionado por el audio y, opcionalmente, por un prompt de instrucciones y una lista de hotwords.

En esta conversión concreta, el decodificador (embeddings, atención, MLPs densos y expertos) se cuantiza a 4 bits con grupo de 64, mientras que el codificador de audio y el proyector se mantienen en BF16 y los routers MoE en FP32 para preservar la estabilidad del enrutamiento. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si el modelo original aplicó RLHF o DPO; esos detalles pertenecen a la model card del modelo base de Salesforce, que no se ha proporcionado.

## Capacidades

- Transcripción de voz a texto offline en siete idiomas europeos: inglés, francés, alemán, español, italiano, portugués y neerlandés.
- Control mediante instrucciones en lenguaje natural: formato con puntuación y mayúsculas, estilo de salida, etc.
- Pistas de idioma para forzar o sesgar el idioma de la transcripción.
- Vocabulario contextual (hotwords) para mejorar el reconocimiento de nombres propios, marcas o términos técnicos.
- Manejo de grabaciones largas de hasta 30 minutos, con dos estrategias de prefill (troceada y única) que, según el autor, producen transcripciones idénticas en formato largo.
- Salida con metadatos: recuento de tokens, estadísticas de tiempo y `finish_reason` (`stop` o `length`).
- No se documentan capacidades de traducción, diarización de hablantes, visión, audio generation ni tool calling.

## Casos de uso

- Transcripción de reuniones y actas: el modelo acepta audio de hasta 30 minutos y permite instrucciones de formato con puntuación y mayúsculas, lo que facilita generar actas legibles directamente sin postprocesado pesado.
- Subtitulado multilingüe de contenido audiovisual: con siete idiomas cubiertos y pistas de idioma, se puede procesar un catálogo europeo con un único modelo en lugar de mantener varios sistemas ASR por idioma.
- Dictado local en Mac: al ser una conversión MLX de 4 bits, encaja en flujos de trabajo de escritorio en Apple Silicon donde la privacidad impide enviar audio a la nube.
- Transcripción de entrevistas de investigación: el vocabulario contextual (hotwords) permite sesgar el reconocimiento hacia terminología de dominio (fármacos, siglas, nombres de participantes) sin reentrenar.
- Procesamiento de llamadas de atención al cliente: la ventana de 30 minutos y el control de formato permiten transcribir conversaciones completas con puntuación para su análisis posterior.
- Archivado y búsqueda de audio corporativo: transcripción offline por lotes de grabaciones internas con licencia Apache 2.0, sin restricciones de uso comercial derivadas de la licencia.
- Prototipado e investigación en ASR: al ser una conversión MLX abierta, sirve para experimentar con decodificadores MoE en tareas de voz sobre hardware de consumo Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe una validación de humo con siete casos (dos voces en inglés, francés, un pasaje adicional en inglés, una grabación de 66,92 segundos con 47 segundos de silencio intermedio, y una petición con instrucciones y hotwords), en la que todas las palabras de referencia coincidieron tras normalizar la puntuación. El propio autor advierte que este conjunto no constituye un benchmark general de reconocimiento.

## Requisitos de hardware

- VRAM/espacio estimado: el repositorio pesa 15,6 GB; en inferencia MLX el modelo cuantizado a 4 bits requiere del orden de esa cifra de memoria unificada, más el estado de activación y caché del decodificador.
- GPU recomendadas: no se especifican; al ser una conversión MLX, el objetivo es Apple Silicon (M-series) con memoria unificada suficiente. No hay datos de rendimiento en GPUs NVIDIA.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con 24 GB o más de memoria unificada; no hay información sobre GPUs de consumo NVIDIA para este formato.
- Opciones de despliegue: `mlx-audio` (librería `mlx_audio.stt`), tanto por API Python como por CLI (`mlx_audio.stt.generate`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/duración de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SOV-Transcribe-1-4bit (esta ficha) | 26,6B totales / 4,6B activos | Hasta 30 min de audio | 7 (en, fr, de, es, it, pt, nl) | Apache 2.0 | safetensors MLX 4-bit |
| Whisper large-v3 | ~1,55B | Ventana de 30 s por segmento | ~99 idiomas | MIT | safetensors, GGUF, etc. |
| SOV-Transcribe-1 (base, sin cuantizar) | 26,6B totales / 4,6B activos | Hasta 30 min de audio | 7 | Apache 2.0 | safetensors |

La comparación con Whisper large-v3 es la más directa por herencia del codificador, pero conviene señalar que SOV-Transcribe-1 añade un decodificador MoE mucho mayor y control por instrucciones, a cambio de un mayor coste de memoria y de un soporte idiomático mucho más reducido. No se dispone de datos de benchmarks que permitan comparar la precisión relativa entre estos modelos.

## Limitaciones y advertencias

- Solo cubre siete idiomas europeos; no hay soporte documentado para otras lenguas, lo que limita su uso en entornos globales.
- El conjunto de validación del autor es de siete casos de humo; no hay evidencia publicada de robustez en acentos, ruido de fondo, audio telefónico o solapamiento de hablantes.
- Riesgo de alucinación inherente a los decodificadores generativos: en pasajes con silencio o audio degradado puede producir texto no presente en la señal. El propio autor prueba un caso con 47 segundos de silencio, pero un solo caso no descarta el problema.
- La cuantización a 4 bits del decodificador puede degradar ligeramente la calidad frente al modelo base; no se han publicado comparativas de precisión entre ambas versiones.
- La decodificación puede truncarse si se alcanza `max_tokens` (por defecto 8192 en el ejemplo de la model card); hay que vigilar `finish_reason` en producción.
- Requiere una versión de `mlx-audio` con soporte específico para SOV-Transcribe-1, lo que añade una dependencia de versión.
- El modelo no registra descargas ni interacciones en Hugging Face en el momento de la consulta; su madurez y validación por la comunidad son mínimas.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la model card del modelo base de Salesforce por si hubiera condiciones adicionales sobre los datos de entrenamiento.
- No se documentan capacidades de diarización, marcas de tiempo por palabra ni traducción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nativ-community/SOV-Transcribe-1-4bit
- Modelo base: https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1
- Revisión del modelo base usada en la conversión: https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1/tree/505d8fae243924c0d8acdc622f7f0abab344eba3
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
- Licencia Apache 2.0: https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1#license
