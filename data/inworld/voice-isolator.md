# inworld/voice-isolator

## Resumen

Voice Isolator es un modelo de aislamiento de voz (voice isolation) desarrollado por Inworld AI, publicado bajo licencia Apache-2.0. Su funcion es separar la voz del hablante del ruido de fondo en grabaciones de audio ruidosas y en flujos de audio en directo, preservando la identidad del hablante. Se distribuye en dos variantes que comparten arquitectura: `voice-isolator-v1` (64M parametros, modo offline, procesa cada fotograma dentro de un bloque de 8 s) y `voice-isolator-v1-realtime` (58M parametros, modo streaming causal con 20 ms de look-ahead).

El modelo opera a 48 kHz en banda completa (full-band) y trabaja en el dominio audio-a-audio: recibe audio mono a 48 kHz y devuelve la voz aislada, manteniendo los niveles originales. Restando la voz aislada de la entrada se obtiene la senal de fondo eliminada, lo que permite usos secundarios como separacion de ruido o residual de pista musical.

Es relevante porque cubre una necesidad practica (limpieza de grabaciones, curacion de datasets de voz, llamadas en directo) con una licencia permisiva y un consumo de recursos reducido (repo de 0,5 GB, modelos de decenas de millones de parametros), a diferencia de aproximaciones de mayor tamano. No es un selector de hablante ni un modelo de restauracion; la restauracion esta prevista para la version 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo audio-a-audio; dos variantes con arquitectura compartida: offline y causal streaming) |
| Parametros totales | 64M (`voice-isolator-v1`); 58M (`voice-isolator-v1-realtime`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa bloques de 8 s en modo offline; streaming causal con 20 ms de look-ahead) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (pesos descargados en primer uso con verificacion de checksums) |

## Arquitectura y entrenamiento

La informacion disponible indica que las dos variantes comparten una unica arquitectura. La variante offline procesa cada fotograma viendo su bloque completo de 8 s, lo que permite mayor calidad al no estar limitada por causalidad. La variante realtime opera como un flujo causal con 20 ms de look-ahead (2 fotogramas de 20 ms a 48 kHz, es decir, bloques de 960 muestras), disenada para integracion en pipelines de audio en vivo.

El modelo trabaja a 48 kHz en banda completa y en mono, preservando los niveles originales de la senal. La suma de la voz aislada y el fondo eliminado reconstruye la entrada mono alineada. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o similares. Tampoco se especifica el tipo de bloque arquitectonico (transformer, convolucional, hibrido u otro), por lo que este dato queda como no disponible.

## Capacidades

- Aislamiento de voz en grabaciones ruidosas, preservando la identidad del hablante.
- Aislamiento de voz en streaming en tiempo real con 20 ms de look-ahead, apto para llamadas y emisiones en directo.
- Salida de voz aislada y, por resta, extraccion de la senal de fondo eliminada (ruido o residual de pista musical).
- Procesamiento a 48 kHz en banda completa, mono.
- Preservacion de niveles originales en la salida.
- Soporte de audio de cualquier duracion en modo offline mediante procesamiento por bloques de 8 s.
- Soporte de entrada por fragmentos de cualquier tamano en modo streaming (API `push`/`flush`).
- Ejecucion en CUDA, en el backend Metal (`mps`) de Apple Silicon con PyTorch 2.6 o superior, y en CPU.
- No soporta seleccion de hablante ni restauracion de audio (prevista para la version 2).

## Casos de uso

- Limpieza de grabaciones antes de publicacion o reproduccion: el modelo offline procesa el archivo completo por bloques de 8 s y devuelve una voz limpia a 48 kHz con los niveles originales, adecuada para podcast, entrevistas y material de archivo.
- Curacion de datasets de voz: al preservar la identidad del hablante, sirve para limpiar corpus de entrenamiento de sistemas de reconocimiento o sintesis de voz sin alterar las caracteristicas del locutor.
- Llamadas y reuniones en directo: la variante realtime, con 20 ms de look-ahead y bloques de 960 muestras, permite integrarse en pipelines de telefonia o videoconferencia para suprimir ruido en tiempo real.
- Emisiones en directo (streaming): el modo streaming procesa la senal a medida que llega y entrega las muestras finales para su reproduccion o reenvio, con un `flush` final para el remanente.
- Separacion de voz y fondo para produccion musical: restando la voz aislada de la entrada se obtiene el residual de fondo o de pista musical, util para vocales o para recuperar acompanamiento.
- Preprocesado en pipelines de ASR: la limpieza previa del audio ruidoso mejora la relacion senal-ruido antes de alimentar un sistema de reconocimiento automatico del habla.
- Analisis forense o de calidad de audio: la separacion explicita de voz y fondo permite inspeccionar por separado cada componente de una grabacion.

## Benchmarks y rendimiento

La model card menciona un benchmark propio, VIBE (Inworld VIBE full-band tier), con una puntuacion de denoising por sistema, pero en la informacion proporcionada no se incluyen los valores numericos de la tabla. Por tanto:

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repo (0,5 GB) y los parametros (58M-64M), la huella en memoria es reducida y cabe holgadamente en GPU de consumo.
- GPU probadas por el autor: NVIDIA Ampere, Hopper y Blackwell (A100, H100, B200, B300).
- GPU de consumo: no probadas oficialmente segun la model card ("Smaller GPUs are not tested yet"); por tamano, es esperable que quepan en RTX 4090 y gamas similares, pero no esta verificado por el autor.
- CPU: soportada como opcion de ejecucion.
- Apple Silicon: soporte del backend Metal (`mps`) con PyTorch 2.6 o superior.
- Opciones de despliegue: paquete `inworld-voice-isolation` (pip), CLI `voice-isolate`, API Python `voice_isolation.VoiceIsolator` con modos offline y streaming, y demo interactiva en el repositorio de GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: el modo streaming introduce 20 ms de look-ahead (2 fotogramas); no se publican cifras de latencia total ni de throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de modelos comparables (parametros, contexto, rendimiento, licencia) para establecer una comparativa rigurosa. Se indica, por tanto:

Comparativa con modelos similares: no disponible.

## Limitaciones y advertencias

- No es un selector de hablante: no separa varias voces entre si, solo voz frente a ruido de fondo.
- No es un modelo de restauracion de audio; la restauracion esta planificada para la version 2.
- Solo procesa audio mono a 48 kHz; no se documenta soporte estereo ni otras frecuencias de muestreo nativas (el CLI permite `--output-sr 0` para conservar la tasa de entrada).
- No se han publicado datos sobre sesgos, riesgo de alucinacion (no aplica en el sentido textual, pero puede haber artefactos en la senal separada) ni evaluacion multilingue.
- GPU de consumo no verificadas oficialmente por el autor; el rendimiento en tarjetas pequenas queda sin validar.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del repositorio y de los pesos descargados.
- El modelo descarga los pesos en el primer uso con verificacion de checksums; en entornos sin red o con proxies restrictivos puede requerir configuracion adicional.
- Al preservar los niveles originales, la salida puede requerir normalizacion posterior segun el pipeline de destino.

## Enlaces

- Hugging Face: https://huggingface.co/inworld/voice-isolator
- Repositorio GitHub: https://github.com/inworld-ai/voice-isolator
- Guia de configuracion para agentes (AGENTS.md): https://github.com/inworld-ai/voice-isolator/blob/main/AGENTS.md#setting-up-the-voice-isolator-for-a-user
- Demo interactiva: https://github.com/inworld-ai/voice-isolator/blob/main/demo/README.md
- Benchmark: https://github.com/inworld-ai/voice-isolator/blob/main/bench/README.md
- Planes (version 2, restauracion): https://github.com/inworld-ai/voice-isolator#plans
- Ejemplo de audio de prueba: https://raw.githubusercontent.com/inworld-ai/voice-isolator/main/demo/examples/sample_14.wav
