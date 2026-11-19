# 0x3/voice-isolator

## Resumen

Voice Isolator es un modelo de aislamiento de voz (voice isolation) desarrollado por Inworld, publicado bajo licencia Apache-2.0. Su funcion es separar la voz del hablante del ruido de fondo en grabaciones de audio y en flujos en vivo, operando a 48 kHz en banda completa (full-band). Se distribuye en dos variantes que comparten arquitectura: `voice-isolator-v1` (64M de parametros, modo offline de alta calidad) y `voice-isolator-v1-realtime` (58M de parametros, modo streaming con 20 ms de look-ahead).

El modelo resuelve el problema de limpiar audio ruidoso antes de su publicacion, reproduccion o procesamiento posterior, preservando la identidad del hablante. Es relevante porque ofrece una alternativa de licencia abierta en una tarea tradicionalmente dominada por soluciones propietarias, con soporte explicito para tiempo real y para extraccion del ruido residual mediante resta de la senal aislada.

La tarea del pipeline es audio-to-audio y la libreria asociada es `inworld-voice-isolation`. El repositorio ocupa aproximadamente 0,5 GB y el modelo no es un selector de hablante ni un modelo de restauracion (esta ultima capacidad esta planificada para la version 2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de aislamiento de voz; dos variantes con arquitectura compartida) |
| Parametros totales | 64M (offline) / 58M (realtime) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa fragmentos de 8 s en modo offline; streaming causal con 20 ms de look-ahead) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre senal de voz, no sobre texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (descarga con verificacion de checksums en el primer uso) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna (tipo de red, capas, mecanismos de atencion). Se sabe que ambas variantes comparten una misma arquitectura y difieren en tamano y en el modo de operacion: la variante offline procesa cada fragmento de 8 segundos viendo su contenido completo, mientras que la variante realtime opera como un flujo causal con 20 ms de look-ahead. El modelo trabaja a 48 kHz en banda completa y produce audio float32 WAV a 48 kHz preservando los niveles originales.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas mas alla del diseno streaming causal con look-ahead reducido y la capacidad de reconstruir la entrada mono alineada sumando la voz aislada y el fondo extraido.

## Capacidades

- Aislamiento de voz en grabaciones ruidosas, con salida de voz limpia y de fondo residual por separado.
- Procesamiento en tiempo real de audio en streaming, con 20 ms de look-ahead y fragmentos de cualquier tamano.
- Extraccion de ruido de fondo o residual de pista musical mediante resta de la voz aislada respecto a la entrada.
- Preservacion de la identidad del hablante en la senal aislada.
- Operacion a 48 kHz en banda completa, con opcion de conservar la frecuencia de muestreo de entrada (`--output-sr 0`).
- Ejecucion en CUDA, en el backend Metal (`mps`) de Apple Silicon con PyTorch 2.6 o superior, y en CPU.
- Uso como modelo de audio-to-audio dentro de pipelines de procesamiento de voz.
- No es un selector de hablante ni un modelo de restauracion de audio.

## Casos de uso

- Limpieza de grabaciones antes de publicacion: el modelo offline procesa el archivo completo en fragmentos de 8 s y genera una pista de voz limpia y otra de fondo, adecuado para podcasts, entrevistas y material de archivo.
- Curacion de datasets de voz: al preservar la identidad del hablante, permite limpiar corpus de entrenamiento para pipelines de reconocimiento o sintesis de voz sin alterar las caracteristicas del locutor.
- Llamadas y emisiones en directo: la variante realtime aisla la voz a medida que llega el audio con 20 ms de look-ahead, integrable en pipelines de telefonia o streaming.
- Separacion de voz y musica: restando la voz aislada de la mezcla original se obtiene el residual de acompanamiento, util para tareas de separacion de voces y musica.
- Preprocesado para sistemas ASR: limpiar la senal antes de alimentar un motor de reconocimiento de voz reduce el ruido de fondo y mejora la relacion senal-ruido de la entrada.
- Produccion audiovisual: generar pistas de voz y de ambiente separadas a partir de una grabacion mono para su mezcla posterior en postproduccion.
- Investigacion en mejora de voz: al ser Apache-2.0 y ejecutable en CPU y GPU, sirve como linea base reproducible en experimentos de denoising y aislamiento de voz.

## Benchmarks y rendimiento

La model card menciona un benchmark propio, VIBE, con una categoria full-band y una puntuacion de denoising por sistema, pero el contenido de la tabla no esta incluido en la informacion disponible. No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 64M y 58M de parametros el modelo es muy ligero, pero no se documentan cifras de memoria.
- GPU probadas: NVIDIA Ampere, Hopper y Blackwell (A100, H100, B200 y B300).
- GPU de consumo: no se han probado GPU mas pequenas segun la model card; el soporte en Apple Silicon se realiza via `mps` con PyTorch 2.6 o superior.
- CPU: soportada como backend de ejecucion.
- Despliegue: paquete `inworld-voice-isolation` (instalacion via `pip`), CLI `voice-isolate`, API Python `voice_isolation.VoiceIsolator`, demo interactivo y benchmark en el repositorio de GitHub.
- Latencia y throughput: no disponibles; en streaming el look-ahead es de 20 ms y los fragmentos de ejemplo son de 960 muestras (20 ms a 48 kHz).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un selector de hablante: no separa voces de distintos locutores entre si.
- No es un modelo de restauracion de audio; esa capacidad esta planificada para la version 2.
- No se han probado GPU de consumo ni GPU mas pequenas que las de la familia Ampere/Hopper/Blackwell indicadas.
- No se documentan sesgos conocidos, riesgo de alucinacion (no aplica a una tarea de audio) ni limitaciones de idioma.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del repositorio y de los pesos descargados.
- El modelo no incluye informacion sobre cuantizacion ni formatos alternativos de pesos, lo que limita opciones de despliegue en entornos con restricciones de memoria.
- La model card no detalla el dataset de entrenamiento ni sus posibles sesgos acusticos (idiomas, acentos, tipos de ruido).

## Enlaces

- Hugging Face: https://huggingface.co/0x3/voice-isolator
- Repositorio GitHub: https://github.com/inworld-ai/voice-isolator
- Demo interactivo: https://github.com/inworld-ai/voice-isolator/blob/main/demo/README.md
- Benchmark: https://github.com/inworld-ai/voice-isolator/blob/main/bench/README.md
- Guia de setup para agentes: https://github.com/inworld-ai/voice-isolator/blob/main/AGENTS.md#setting-up-the-voice-isolator-for-a-user
- Planes de version 2: https://github.com/inworld-ai/voice-isolator#plans
- Ejemplo de audio: https://raw.githubusercontent.com/inworld-ai/voice-isolator/main/demo/examples/sample_14.wav
