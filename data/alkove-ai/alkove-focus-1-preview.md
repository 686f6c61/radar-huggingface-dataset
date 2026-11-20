# alkove-ai/alkove-focus-1-preview

## Resumen

alkove-focus-1-preview es un modelo de aislamiento de voz (voice isolation) en tiempo real para audio de 16 kHz, desarrollado por alkove-ai como parte del SDK de voz on-device Alkove. Su funcion es conservar la voz mas cercana al microfono y eliminar ruido, musica y otras voces; opcionalmente, dado un voiceprint generado por alkove-timbre-1-preview, conserva unicamente a una persona concreta, incluso si otra habla mas fuerte o mas cerca. Resuelve el problema de la captura de voz limpia en entornos ruidosos sin enviar audio a un servidor.

Se trata de un modelo pequeno (unos 0,8 M de parametros, 1,1 MB en pesos int8) disenado para ejecutarse en un solo hilo de CPU, de forma nativa o mediante WebAssembly, con una latencia de un hop de 16 ms. Procesa bloques de 256 muestras por llamada y mantiene estado interno entre llamadas (126.848 floats), lo que permite filtrado continuo de flujo de audio.

Es relevante ahora porque demuestra que tareas de separacion de hablante y supresion de ruido de calidad aceptable caben en un modelo de menos de un megabyte, lo que habilita su despliegue en navegador, movil y dispositivos embebidos sin infraestructura de servidor. La version es un preview: los pesos y la interfaz pueden cambiar antes de la version 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de audio-to-audio para aislamiento de voz; basado parcialmente en GTCRN, segun el aviso MIT en NOTICE) |
| Parametros totales | aproximadamente 0,8 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa bloques de 256 muestras (16 ms) con estado interno de 126.848 floats |
| Tipos de cuantizacion | int8 (pesos del archivo `.alk`) |
| Idiomas soportados | no disponible (procesamiento de senal de voz independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.alk` (formato propio del motor Alkove, documentado en el repositorio) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que es un modelo de audio-to-audio para aislamiento de voz y que el aviso de copyright incluye la licencia MIT de GTCRN, lo que sugiere que reutiliza o deriva de componentes de esa arquitectura de mejora de voz. El modelo opera sobre audio mono a 16 kHz con entradas de 256 muestras y una entrada opcional de voiceprint de 192 dimensiones (salida `embedding` de alkove-timbre-1-preview); con el vector de ceros conserva la voz mas cercana al microfono. El motor mantiene estado entre llamadas, lo que equivale a un procesamiento en streaming con memoria interna.

No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o ajuste fino especifico. Los benchmarks declarados se midieron contra modelos abiertos ejecutados de la misma forma sobre el mismo audio (VoxLock, DeepFilterNet 3, Hush y GTCRN), lo que indica una evaluacion comparativa controlada, aunque los resultados figuran como no verificados.

## Capacidades

- Aislamiento de voz en tiempo real: conserva la voz mas cercana al microfono y elimina ruido, musica y otras voces.
- Extraccion de hablante objetivo (target-speaker extraction) mediante un voiceprint de 192 dimensiones generado por alkove-timbre-1-preview.
- Supresion de ruido y mejora de voz (speech enhancement) sobre audio de 16 kHz.
- Procesamiento en streaming con estado persistente entre bloques de 256 muestras.
- Ejecucion nativa en Rust y en WebAssembly, en un solo hilo de CPU.
- Integracion con agentes de voz: plugins para LiveKit Agents, Pipecat y LiveKit en Android.
- SDKs oficiales para navegador (npm `alkove`), Python (PyPI `alkove`), Android y Swift.
- No soporta generacion de texto, codigo, vision ni tool calling: es exclusivamente un modelo de audio.

## Casos de uso

- Videollamadas y reuniones en navegador: el modelo se ejecuta via WebAssembly y filtra el audio del microfono antes de enviarlo, eliminando ruido de fondo y voces de otras personas presentes en la sala sin coste de servidor.
- Agentes de voz en produccion: integrado como cancelacion de ruido en LiveKit Agents o como filtro de entrada en Pipecat, mejora la relacion senal-ruido que recibe el ASR y reduce la tasa de error de transcripcion.
- Captura de voz en movil: los SDK de Android y Swift permiten ejecutar el aislamiento on-device en telefonos, con un coste medido de unos 39 ms de CPU por segundo de audio en un Galaxy Z Fold8.
- Dictado y asistentes personales: al conservar solo la voz del usuario mediante un voiceprint, evita que el asistente active o transcriba conversaciones de terceros cercanos.
- Reuniones con microfono de auricular: en el conjunto AMI con microfono de auricular, el modelo reduce la palabra error rate de Whisper large-v3 turbo de 16,7 (sin voiceprint) a 16,1 (con voiceprint) y limita las palabras de otras voces a 0,5 por minuto.
- Dispositivos embebidos y edge computing: con 1,1 MB de pesos int8 y ejecucion en un solo hilo, cabe en hardware con recursos muy limitados donde otros modelos de separacion no serian viables.
- Preprocesado para pipelines de ASR multilingue: los resultados en Common Voice cubren siete idiomas, lo que permite usarlo como etapa previa a sistemas de reconocimiento en varios idiomas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Tarea | Conjunto de datos | Metrica | Valor |
|---|---|---|---|
| Aislamiento de voz | AMI meetings, microfono de auricular, 134 ventanas (protocolo VoxLock) | WER con voiceprint (Whisper large-v3 turbo) | 16,1 |
| Aislamiento de voz | AMI meetings, microfono de auricular, 134 ventanas (protocolo VoxLock) | WER sin voiceprint (Whisper large-v3 turbo) | 16,7 |
| Aislamiento de voz | AMI meetings, microfono de auricular, 134 ventanas (protocolo VoxLock) | Palabras de otras voces por minuto, con voiceprint | 0,5 |
| Aislamiento de voz | Common Voice test sets, 7 idiomas (otra voz en la sala) | SI-SDR del objetivo, con voiceprint (dB) | 7,1 |
| Aislamiento de voz | Common Voice test sets, 7 idiomas (otra voz en la sala) | Nivel de la otra voz hablando sola, con voiceprint (dB) | -22,6 |
| Mejora de voz | VoiceBank+DEMAND test set, 824 clips | STOI | 0,895 |
| Mejora de voz | VoiceBank+DEMAND test set, 824 clips | SI-SDR (dB) | 12,1 |
| Mejora de voz | VoiceBank+DEMAND test set, 824 clips | DNSMOS P.835 overall | 3,04 |
| Mejora de voz | VoiceBank+DEMAND test set, 824 clips | DNSMOS P.808 | 3,47 |
| Mejora de voz | DNS Challenge 3 blind test set, 600 clips | DNSMOS P.808 | 3,36 |
| Mejora de voz | DNS Challenge 3 blind test set, 600 clips | DNSMOS P.835 overall | 2,7 |

Rendimiento de ejecucion declarado:

| Plataforma | Consumo |
|---|---|
| CPU nativa, 1 hilo, Galaxy Z Fold8 (Android 17) | aproximadamente 39 ms por segundo de audio |
| CPU nativa, 1 hilo, Apple M1 Max (macOS) | aproximadamente 56 ms por segundo de audio |
| Latencia | 16 ms (un hop) adicionales sobre el propio hop de 16 ms |

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta pensado para CPU y no requiere GPU.
- GPU recomendadas: no disponibles ni necesarias para el caso de uso previsto.
- Cabe en cualquier GPU consumer, pero su despliegue tipico es en CPU: el modelo ocupa 1,1 MB en int8.
- Opciones de despliegue: motor Alkove en Rust (nativo o WebAssembly), SDK de navegador via npm, paquete Python, SDK de Android, paquete Swift, y plugins para LiveKit Agents, Pipecat y LiveKit en Android.
- Latencia: 16 ms de un hop mas 16 ms de retardo del modelo; el procesamiento en un solo hilo consume aproximadamente 39 ms de CPU por segundo de audio en un Galaxy Z Fold8 y unos 56 ms por segundo en un Apple M1 Max.

## Comparativa con modelos similares

Segun el autor, la comparacion se realizo con los siguientes modelos abiertos ejecutados de la misma forma sobre el mismo audio:

| Modelo | Parametros | Licencia | Notas |
|---|---|---|---|
| alkove-focus-1-preview | aprox. 0,8 M | Apache-2.0 | int8, 1,1 MB, latencia de 16 ms, ejecucion en CPU y WebAssembly |
| VoxLock | 27 M | Apache-2.0 | modelo de referencia en el protocolo de evaluacion del autor |
| DeepFilterNet 3 | 2,1 M | MIT / Apache-2.0 | modelo de mejora de voz ampliamente usado |
| Hush | 1,8 M | Apache-2.0 | modelo de supresion de ruido |
| GTCRN | 0,05 M | MIT | arquitectura base citada en el aviso del modelo |

No se dispone en la informacion proporcionada de los valores numericos comparativos de estos modelos en las mismas metricas, por lo que no es posible presentar una tabla de rendimiento cruzado.

## Limitaciones y advertencias

- Es una version preview: los pesos y la interfaz pueden cambiar antes de la version 1, por lo que no es recomendable fijar dependencias de produccion sin control de versiones.
- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados; deben tratarse con cautela.
- El aislamiento por voiceprint depende de la calidad del embedding de alkove-timbre-1-preview; un voiceprint deficiente degradara la seleccion del hablante.
- El modelo esta disenado para voz a 16 kHz mono; no se documentan prestaciones con otras frecuencias de muestreo o audio estereo.
- No se dispone de informacion sobre sesgos por idioma, acento o genero; los resultados en Common Voice cubren siete idiomas, pero no se detallan cuales.
- Riesgo de artefactos o perdida de informacion en la senal cuando la voz objetivo y el ruido se solapan fuertemente; los valores de DNSMOS P.835 de 2,7 en el conjunto ciego de DNS Challenge 3 sugieren margen de mejora en condiciones adversas.
- La licencia Apache-2.0 permite uso comercial, pero el aviso NOTICE incluye la licencia MIT de GTCRN, cuyos terminos deben conservarse en la redistribucion.
- El formato de pesos `.alk` es propio del motor Alkove; no hay conversion documentada a GGUF, ONNX u otros formatos, lo que limita su uso fuera del ecosistema Alkove.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alkove-ai/alkove-focus-1-preview
- Modelo de voiceprint relacionado: https://huggingface.co/alkove-ai/alkove-timbre-1-preview
- Demo en navegador: https://huggingface.co/spaces/alkove-ai/alkove-demo
- Sitio de Alkove: https://alkove.ai
- Repositorio del motor y SDK: https://github.com/alkove-ai/alkove
- Motor (crates/engine): https://github.com/alkove-ai/alkove/tree/main/crates/engine
- Documentacion del formato `.alk`: https://github.com/alkove-ai/alkove/blob/main/crates/engine/FORMAT.md
- SDK Android: https://github.com/alkove-ai/alkove/tree/main/android
- SDK Swift (iOS): https://github.com/alkove-ai/alkove/tree/main/ios
- Plugin LiveKit para Android: https://github.com/alkove-ai/alkove/tree/main/android/livekit
- Paquete npm: https://www.npmjs.com/package/alkove
- Paquete Python: https://pypi.org/project/alkove/
- Plugin LiveKit Agents: https://pypi.org/project/livekit-plugins-alkove/
- Plugin Pipecat: https://pypi.org/project/pipecat-alkove/
