# orz99/voice-isolator

## Resumen

Voice Isolator es un modelo de aislamiento de voz (voice isolation) desarrollado por Inworld AI, publicado bajo licencia Apache-2.0. Su función es separar la voz del hablante del ruido de fondo en grabaciones de audio ruidosas, preservando la identidad vocal del hablante. Se distribuye en dos variantes que comparten arquitectura: `voice-isolator-v1`, orientado a audio grabado y calidad máxima, y `voice-isolator-v1-realtime`, orientado a audio en directo con baja latencia.

El modelo trabaja a 48 kHz en banda completa (full-band) y opera como un pipeline `audio-to-audio`. La variante offline procesa cada fragmento de 8 segundos viendo su contexto completo, mientras que la variante realtime funciona como un flujo causal con 20 ms de look-ahead. Los tamaños son de 64M y 58M de parámetros respectivamente, lo que lo sitúa en la categoría de modelos ligeros especializados en procesamiento de señal de voz.

Es relevante porque ofrece una alternativa de código abierto y licencia permisiva en un nicho habitualmente dominado por soluciones propietarias de limpieza de audio. Además, permite restar la voz aislada de la entrada original para extraer el ruido de fondo o un residual de pista instrumental, lo que habilita casos de separación de voces y música.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de aislamiento de voz, dos checkpoints con arquitectura compartida) |
| Parametros totales | 64M (`voice-isolator-v1`), 58M (`voice-isolator-v1-realtime`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | fragmentos de 8 s en modo offline; flujo causal con 20 ms de look-ahead en modo realtime |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesamiento de señal de voz, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (descarga gestionada por el paquete `inworld-voice-isolation`, con verificacion de checksums) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (tipo de red, capas, mecanismo de atención o componentes concretos). Lo que sí se especifica es que las dos variantes comparten una misma arquitectura y difieren en el modo de operación y el número de parámetros: el modelo offline (64M) procesa cada frame con visibilidad de su fragmento completo de 8 segundos, mientras que el modelo realtime (58M) opera de forma causal con 20 ms de look-ahead, lo que permite su uso en flujos de audio en vivo.

No se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se detallan innovaciones técnicas más allá del diseño dual offline/realtime y el procesamiento a 48 kHz en banda completa.

## Capacidades

- Aislamiento de voz en grabaciones ruidosas, separando la voz del hablante del ruido de fondo.
- Procesamiento en banda completa a 48 kHz, preservando la calidad espectral de la voz.
- Modo offline para audio grabado, con procesamiento por fragmentos de 8 s y máxima calidad.
- Modo streaming en tiempo real con 20 ms de look-ahead, apto para llamadas y emisiones en vivo.
- Extracción del ruido de fondo o residual mediante resta de la voz aislada respecto a la entrada original.
- Posible uso para separación de voces y música (extracción de residual de pista instrumental).
- Preservación de la identidad vocal del hablante (no es un selector de hablante).
- Procesamiento mono a 48 kHz con preservación de niveles originales; salida en WAV float32.
- Soporte de GPU CUDA, backend Metal (mps) en Apple Silicon con PyTorch 2.6 o superior, y CPU.

## Casos de uso

- Limpieza de grabaciones antes de su publicación: el modelo offline procesa el archivo completo y genera una versión limpia de la voz más un archivo separado con el fondo eliminado, útil para pódcasts, entrevistas y material de archivo.
- Llamadas y emisiones en directo: la variante realtime aísla la voz a medida que llega el audio, con 20 ms de look-ahead, integrándose en pipelines de telefonía o streaming para reducir el ruido ambiente del interlocutor.
- Curaduría de datasets de voz: al preservar la identidad del hablante, resulta adecuado para limpiar corpus de entrenamiento de sistemas de reconocimiento o síntesis de voz sin alterar las características del locutor.
- Extracción de ruido de fondo: restando la voz aislada de la señal original se obtiene el residual de fondo, útil para análisis acústico, doblaje o creación de bancos de efectos.
- Separación de voces y música: el residual obtenido de la resta puede aprovecharse como pista instrumental aproximada en flujos de karaoke o postproducción musical.
- Preprocesado en pipelines de ASR: limpiar el audio antes de alimentar un sistema de reconocimiento automático del habla en entornos ruidosos, mejorando la relación señal-ruido de la entrada.
- Captura desde micrófono en demos interactivas: el demo del repositorio permite procesar micrófono en directo hasta 60 segundos con visualización de formas de onda y espectrogramas.

## Benchmarks y rendimiento

La model card menciona el benchmark VIBE (Inworld VIBE full-band tier) y enlaza a la sección de benchmark del repositorio de GitHub, pero en la información proporcionada no se incluyen los valores numéricos de las puntuaciones. Por tanto:

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del modelo (58M-64M de parámetros) el requisito es bajo, pero no se confirma una cifra.
- GPU recomendadas: probado en NVIDIA Ampere, Hopper y Blackwell (A100, H100, B200 y B300).
- GPU de consumo: no se han probado GPUs más pequeñas según la model card ("Smaller GPUs are not tested yet").
- Apple Silicon: soporte del backend Metal (mps) con PyTorch 2.6 o superior.
- CPU: soportado como dispositivo de reserva.
- Opciones de despliegue: paquete Python `inworld-voice-isolation` (instalable con `pip install inworld-voice-isolation`), CLI `voice-isolate`, API Python `voice_isolation.VoiceIsolator`, y demo interactivo del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el modo realtime opera con 20 ms de look-ahead y procesa en bloques de 20 ms (960 muestras a 48 kHz); no se publican cifras de throughput.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de aislamiento de voz de código abierto, ni de sus parámetros, contexto, rendimiento o licencia. Por tanto:

No disponible.

## Limitaciones y advertencias

- No es un selector de hablante: no separa voces de distintos interlocutores, solo aísla la voz frente al ruido.
- No es un modelo de restauración de audio; la restauración está planificada para la versión 2 según el repositorio.
- No se han publicado datos sobre sesgos, riesgo de alucinación (en el sentido de artefactos o voz sintética introducida) ni comportamiento en idiomas concretos.
- El modelo realtime introduce 20 ms de look-ahead, lo que implica una latencia mínima inherente al flujo causal.
- Las GPUs de consumo no han sido probadas oficialmente, lo que añade incertidumbre sobre su rendimiento en hardware doméstico.
- El repo de Hugging Face registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada es 2026-11-19, dato que conviene verificar.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene revisar los términos del repositorio de GitHub para confirmar condiciones de los pesos y del paquete.
- No se especifican limitaciones de longitud de audio más allá del procesamiento por fragmentos de 8 s en modo offline.

## Enlaces

- Hugging Face: https://huggingface.co/orz99/voice-isolator
- Repositorio GitHub: https://github.com/inworld-ai/voice-isolator
- Guía de configuración para agentes: https://github.com/inworld-ai/voice-isolator/blob/main/AGENTS.md#setting-up-the-voice-isolator-for-a-user
- Demo interactivo: https://github.com/inworld-ai/voice-isolator/blob/main/demo/README.md
- Benchmark: https://github.com/inworld-ai/voice-isolator/blob/main/bench/README.md
- Planes del proyecto: https://github.com/inworld-ai/voice-isolator#plans
- Modelo original referenciado en la model card: https://huggingface.co/inworld/voice-isolator
