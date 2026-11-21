# athaze/voice-isolator

## Resumen

Inworld Voice Isolator v1 es un modelo de aislamiento de voz (voice isolation) publicado por Inworld AI bajo licencia Apache-2.0. Su funcion es separar la voz del hablante del ruido de fondo en grabaciones de audio y en flujos en directo, preservando la identidad vocal del locutor. Se distribuye como dos checkpoints que comparten arquitectura: `voice-isolator-v1` (64M parametros, modo offline, procesa fragmentos de 8 s completos) y `voice-isolator-v1-realtime` (58M parametros, modo streaming causal con 20 ms de look-ahead). Ambos operan a 48 kHz full-band en mono y producen WAV float32.

El modelo resuelve un problema clasico de los pipelines de voz: audio de entrada contaminado por ruido ambiente, reverberacion o musica de fondo que degrada la calidad percibida y el rendimiento de sistemas posteriores (ASR, diarizacion, TTS). A diferencia de un supresor de ruido convencional, el aislamiento devuelve la voz limpia y, por resta respecto a la entrada, el residuo de fondo, lo que permite reutilizar ese residuo en tareas de separacion musica/voz.

Es relevante ahora porque la licencia Apache-2.0 es poco habitual en este segmento (la mayoria de soluciones competitivas son propietarias o de pesos cerrados), porque cubre tanto el caso offline de maxima calidad como el streaming de baja latencia con el mismo paquete, y porque el tamano (58-64M parametros) permite ejecucion en CPU y en GPUs de consumo. El autor del repositorio en Hugging Face figura como `athaze`, mientras que la model card referencia los pesos y el codigo del proyecto oficial de Inworld AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de aislamiento de voz con dos variantes que comparten arquitectura: offline y streaming causal) |
| Parametros totales | 64M (`voice-isolator-v1` offline); 58M (`voice-isolator-v1-realtime`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa fragmentos de 8 s en modo offline y streams causales con 20 ms de look-ahead en modo realtime |
| Tipos de cuantizacion | no disponible (los pesos se descargan y verifican por checksum; el paquete usa float32 en la salida de audio) |
| Idiomas soportados | no disponible (procesamiento de senal de voz independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (gestionados por la libreria `inworld-voice-isolation`, descarga con verificacion de checksum) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (tipo de red, capas, mecanismo de atencion ni funcion de perdida). Lo que si se especifica es la topologia de despliegue: dos checkpoints que comparten arquitectura pero difieren en el regimen de procesamiento. La variante offline procesa cada fragmento de 8 s viendo su totalidad, lo que permite calidad maxima sin restriccion de causalidad. La variante realtime opera como un flujo causal con 20 ms de look-ahead (dos tramas de 10 ms), disenada para integrarse en pipelines en vivo.

No se han publicado en la informacion disponible datos sobre el numero de tokens o horas de audio de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste fino con preferencias humanas. Tampoco se documentan innovaciones tecnicas especificas mas alla del diseno dual offline/streaming y de la reconstruccion exacta de la senal: la voz aislada y el fondo eliminado, sumados, reconstruyen la entrada mono alineada, lo que implica que el modelo opera como una descomposicion aditiva de la senal.

## Capacidades

- Aislamiento de voz en grabaciones con ruido de fondo, a 48 kHz full-band y en mono.
- Salida dual: voz aislada y residuo de fondo (obtenido por resta), ambos float32 con los niveles originales preservados.
- Procesamiento offline de maxima calidad sobre fragmentos de 8 s.
- Procesamiento en streaming causal con 20 ms de look-ahead, apto para microfono en vivo y llamadas.
- Preservacion de la identidad vocal del hablante (no es un selector de hablante ni un separador de multiples voces).
- Extraccion de fondo o residuo de banda musical para separacion voz/musica.
- Ejecucion en CUDA, en Metal (`mps`) sobre Apple Silicon con PyTorch 2.6 o superior, y en CPU.
- Interfaz de linea de comandos (`voice-isolate`) y API de Python (`inworld.voice_isolation.VoiceIsolator`).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo audio-a-audio puro.
- No es un modelo de restauracion de audio; la restauracion esta planificada para la version 2.

## Casos de uso

- Limpieza de grabaciones antes de publicacion: podcasts, entrevistas y locuciones grabadas en entornos no tratados se procesan en modo offline con fragmentos de 8 s, obteniendo voz limpia y un WAV de fondo separado para ajustes posteriores.
- Curacion de datasets de voz: en la construccion de corpus para ASR o TTS, el modelo elimina ruido preservando la identidad del hablante, lo que evita descartar grabaciones utiles y reduce el sesgo de dominio hacia audio limpio.
- Llamadas y reuniones en vivo: la variante realtime con 20 ms de look-ahead se inserta en el pipeline de captura y entrega muestras definitivas cada 20 ms (960 muestras a 48 kHz), adecuada para VoIP y transmision en directo.
- Preprocesado para ASR y diarizacion: la voz aislada mejora la relacion senal-ruido de entrada a los sistemas posteriores; el residuo permite auditar que se ha eliminado.
- Separacion de voz y musica: la resta de la voz aislada respecto a la mezcla original produce un residual de acompanamiento, util para karaoke, remezclas o extraccion de pistas vocales.
- Produccion audiovisual y streaming: limpieza de audio de campo o de microfonos en directo antes de la emision, con la ventaja de que ambos modos comparten paquete e interfaz.
- Desarrollo de agentes de voz: como etapa de preprocesado en pipelines de asistentes conversacionales, donde el ruido de entrada degrada el reconocimiento y la naturalidad percibida.

## Benchmarks y rendimiento

La model card referencia el benchmark VIBE (Inworld VIBE full-band tier), con una puntuacion de denoising por sistema, pero los valores numericos no estan incluidos en la informacion proporcionada. No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 58-64M parametros, el modelo es muy ligero; en float32 los pesos ocupan del orden de 0,25 GB, aunque la memoria real depende del backend y de los buffers de audio.
- GPU probadas: NVIDIA Ampere, Hopper y Blackwell (A100, H100, B200, B300) y CPU. GPUs menores no estan probadas segun la documentacion.
- GPU de consumo: no verificadas oficialmente; por tamano del modelo es plausible su ejecucion en GPUs consumer, pero no hay confirmacion en la informacion disponible.
- Apple Silicon: soporte de Metal (`mps`) con PyTorch 2.6 o superior.
- Despliegue: paquete `inworld-voice-isolation` (pip), CLI `voice-isolate`, API de Python, demo interactiva y benchmark en el repositorio de GitHub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo audio-a-audio).
- Latencia y throughput: la variante realtime introduce 20 ms de look-ahead; no se publican cifras de latencia total ni de throughput (factor de tiempo real) en la informacion disponible.
- Herramienta de diagnostico: `voice-isolate-doctor` comprueba la maquina antes de la primera ejecucion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos alternativos de aislamiento de voz (parametros, contexto, rendimiento o licencia) que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un selector ni separador de hablantes: no aisla una voz concreta entre varias, sino la voz frente al ruido.
- No es un modelo de restauracion de audio; la restauracion esta prevista para la version 2.
- No se documentan sesgos conocidos ni evaluaciones por idioma, genero o acento; los idiomas soportados figuran como no disponibles.
- Riesgo de artefactos o de eliminacion parcial de la voz en condiciones de ruido extremo o solapamiento con la banda vocal: no hay datos publicados al respecto.
- Entrada limitada a mono a 48 kHz (con opcion de conservar la frecuencia de muestreo de entrada en la CLI); no se documenta soporte multicanal.
- GPUs de gama baja no estan probadas oficialmente; el rendimiento en hardware consumer no esta verificado.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar el aviso de licencia y verificar las dependencias del paquete.
- El repositorio de Hugging Face registra 0 descargas y 0 likes en la fecha de consulta, y el autor del repo (`athaze`) no coincide con la organizacion citada en la model card (`inworld`); conviene verificar la procedencia de los pesos antes de usarlos en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/athaze/voice-isolator
- Repositorio GitHub: https://github.com/inworld-ai/voice-isolator
- Guia de configuracion para agentes de codigo (AGENTS.md): https://github.com/inworld-ai/voice-isolator/blob/main/AGENTS.md#setting-up-the-voice-isolator-for-a-user
- Demo interactiva: https://github.com/inworld-ai/voice-isolator/blob/main/demo/README.md
- Benchmark: https://github.com/inworld-ai/voice-isolator/blob/main/bench/README.md
- Planes futuros (restauracion v2): https://github.com/inworld-ai/voice-isolator#plans
- Ejemplo de audio de prueba: https://raw.githubusercontent.com/inworld-ai/voice-isolator/main/demo/examples/sample_14.wav
