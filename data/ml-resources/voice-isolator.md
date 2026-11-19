# ml-resources/voice-isolator

## Resumen

Voice Isolator es un modelo de aislamiento de voz (voice isolation) desarrollado por Inworld AI, publicado bajo licencia Apache-2.0. Su funcion es separar la voz del hablante del ruido de fondo en grabaciones de audio ruidosas o en flujos de audio en directo, preservando la identidad del hablante. Se distribuye en dos variantes que comparten arquitectura: `voice-isolator-v1` (64M parametros, orientada a audio grabado y maxima calidad) y `voice-isolator-v1-realtime` (58M parametros, causal, con 20 ms de look-ahead, orientada a streaming). Ambas operan a 48 kHz en banda completa (full-band).

El modelo resuelve un problema clasico en pipelines de audio: limpiar grabaciones antes de su publicacion o reproduccion, curar datasets de voz y mejorar llamadas o emisiones en directo, sin alterar la identidad del hablante. Ademas, al restar la voz aislada de la entrada se obtiene el ruido de fondo o el residual de pista musical, lo que permite usos secundarios de separacion de voces y musica.

La relevancia actual radica en su licencia permisiva (Apache-2.0), su soporte de streaming en tiempo real con latencia muy baja y su resolucion de 48 kHz, poco habitual en modelos de denoising de voz de tamano reducido. No es un selector de hablante ni un modelo de restauracion: la restauracion esta planificada para la version 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de audio-to-audio; dos checkpoints que comparten arquitectura) |
| Parametros totales | 64M (`voice-isolator-v1`); 58M (`voice-isolator-v1-realtime`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de procesado: chunks de 8 s en modo offline; 20 ms de look-ahead en streaming) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesamiento de senal de voz, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (descarga gestionada por el paquete `inworld-voice-isolation` con verificacion de checksums) |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo (tipo de red, capas, mecanismo de atencion o componentes de procesado de senal). Se sabe que ambos checkpoints comparten una misma arquitectura y se diferencian en el modo de operacion: el modelo offline procesa cada frame con visibilidad de su chunk completo de 8 segundos, mientras que el modelo realtime es causal y opera con 20 ms de look-ahead, lo que lo hace apto para streaming con latencia minima.

Tampoco se especifican el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (poco probables en un modelo de separacion de audio). La salida es audio float32 a 48 kHz con los niveles originales preservados; la voz aislada y el fondo reconstruyen la entrada mono alineada.

## Capacidades

- Aislamiento de voz en grabaciones ruidosas, preservando la identidad del hablante.
- Denoising y supresion de ruido en banda completa a 48 kHz.
- Procesamiento offline de archivos completos con maxima calidad (chunks de 8 s).
- Procesamiento en streaming en tiempo real con 20 ms de look-ahead, apto para microfono o flujo continuo.
- Extraccion del ruido de fondo mediante resta de la voz aislada a la entrada.
- Separacion de voces y musica: el residual puede emplearse como pista de acompanamiento o fondo.
- Entrada mono a 48 kHz; salida float32 WAV con niveles originales conservados.
- Ejecucion en CUDA, en el backend Metal (mps) de Apple Silicon con PyTorch 2.6 o superior, y en CPU.
- CLI (`voice-isolate`) y API de Python (`inworld.voice_isolation`) con verificacion de checksums de pesos.
- No soporta tool calling, agentes ni razonamiento multi-step: es un modelo puramente audio-to-audio.

## Casos de uso

- Limpieza de grabaciones antes de publicacion: podcasts, entrevistas y videos grabados en entornos ruidosos se procesan con el modelo offline para obtener voz limpia y, opcionalmente, la pista de fondo separada.
- Curacion de datasets de voz: al preservar la identidad del hablante, el modelo permite limpiar corpus de entrenamiento de ASR o TTS sin degradar las caracteristicas del locutor.
- Llamadas y reuniones en directo: el modelo realtime aisla la voz con 20 ms de look-ahead, adecuado para integrarse en pipelines de VoIP o videoconferencia con latencia perceptualmente nula.
- Emisiones en directo y streaming: limpieza de audio de microfono en tiempo real en plataformas de emision, con salida continua de muestras definitivas.
- Separacion de voces y musica: restando la voz aislada de la mezcla se obtiene el residual instrumental, util para karaoke, remixes o produccion musical.
- Postproduccion de cine y video: limpieza de dialogo grabado en localizacion con ruido ambiental antes de la mezcla final.
- Preprocesado para pipelines de ASR: reduccion de ruido previa a la transcripcion para mejorar la precision en entornos adversos.

## Benchmarks y rendimiento

La model card menciona el benchmark VIBE (Inworld VIBE full-band tier) con una puntuacion de denoising por sistema, pero los valores numericos no estan incluidos en la informacion proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 64M y 58M de parametros el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU probadas por el autor: NVIDIA Ampere, Hopper y Blackwell (A100, H100, B200, B300) y CPU.
- GPU consumer: no se han probado GPU de gama menor segun el autor; por tamano, deberia caber en cualquier GPU consumer moderna, pero no esta verificado oficialmente.
- Apple Silicon: soporte del backend Metal (mps) con PyTorch 2.6 o superior.
- Opciones de despliegue: paquete `inworld-voice-isolation` (CLI `voice-isolate` y API de Python), demo interactiva y benchmark en el repositorio de GitHub. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de audio).
- Latencia y throughput: el modelo realtime opera con 20 ms de look-ahead; no se publican cifras de throughput.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada (parametros, contexto, benchmarks ni licencia de alternativas). No disponible.

## Limitaciones y advertencias

- No es un selector de hablante: no separa voces de distintos locutores entre si.
- No es un modelo de restauracion; la restauracion de audio esta planificada para la version 2.
- Solo se han probado GPU Ampere, Hopper y Blackwell de gama alta y CPU; el rendimiento en GPU consumer no esta verificado.
- No se detallan sesgos, composicion del dataset de entrenamiento ni evaluacion por idioma; el procesamiento es de senal y no depende del idioma, pero no hay datos que lo confirmen formalmente.
- Riesgo de artefactos o perdida de componentes de la voz en condiciones de ruido extremo no documentado.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del repositorio y de los pesos descargados.
- El modelo realtime introduce 20 ms de look-ahead; no es de latencia cero.
- La salida offline y el fondo reconstruyen la entrada mono alineada; cualquier postprocesado debe tener en cuenta esta relacion.

## Enlaces

- Hugging Face: https://huggingface.co/ml-resources/voice-isolator
- Repositorio GitHub: https://github.com/inworld-ai/voice-isolator
- Guia de configuracion (AGENTS.md): https://github.com/inworld-ai/voice-isolator/blob/main/AGENTS.md
- Demo interactiva: https://github.com/inworld-ai/voice-isolator/blob/main/demo/README.md
- Benchmark: https://github.com/inworld-ai/voice-isolator/blob/main/bench/README.md
- Planes del proyecto: https://github.com/inworld-ai/voice-isolator#plans
- Ejemplo de audio: https://raw.githubusercontent.com/inworld-ai/voice-isolator/main/demo/examples/sample_14.wav
