# alkove-ai/alkove-cue-1-preview

## Resumen

alkove-cue-1-preview es un modelo de deteccion de actividad de voz (VAD) y deteccion de fin de turno desarrollado por alkove-ai, pensado para ejecutarse en tiempo real dentro de un SDK de voz on-device. No es un modelo generativo: procesa audio de 16 kHz en bloques de 480 muestras (30 ms) y devuelve tres probabilidades por bloque: si alguien esta hablando (`speech`), si el turno termina (`turn`) y si termina sobre una hesitacion (`hesitation`). Forma parte de Alkove, un SDK de voz que incluye aislamiento de voz, wake word, huella de voz, actividad de voz y pronunciacion, todo ejecutandose en el navegador o en el telefono sin enviar audio a un servidor.

El modelo es extremadamente compacto: los pesos en int8 ocupan 1,2 MB y el estado interno de la sesion son 5976 floats. Esta disenado para correr en un solo hilo, de forma nativa o en WebAssembly, con un coste medido de 1,9 ms por segundo de audio en un Galaxy Z Fold8 y 3,0 ms por segundo de audio en un Apple M1 Max. Se distribuye en formato propietario `.alk` para el motor Alkove (Rust, Apache-2.0) y se integra con LiveKit Agents, Pipecat y Wyoming/Home Assistant mediante plugins oficiales.

La relevancia actual del modelo esta en el problema que resuelve: la deteccion fiable del fin de turno en agentes de voz conversacionales, donde cortar al usuario demasiado pronto rompe la experiencia. Cue anade una segunda cabeza sobre las mismas capas que estima la probabilidad de fin de turno y de hesitacion, lo que permite politicas de corte mas informadas que un VAD tradicional. Es una version preview: el autor advierte que los pesos y la interfaz pueden cambiar antes de la version 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo neuronal para VAD y deteccion de fin de turno; no se detalla la topologia interna) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesamiento por bloques de 30 ms con estado recurrente de 5976 floats) |
| Tipos de cuantizacion | int8 (pesos del archivo `.alk`) |
| Idiomas soportados | No disponible en la model card; los benchmarks de fin de turno cubren 7 idiomas (ingles, frances, espanol, italiano, portugues, aleman y neerlandes) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.alk` (formato propietario del motor Alkove, documentado en el repositorio) |

## Arquitectura y entrenamiento

La model card no detalla la topologia interna (numero de capas, tipo de bloques, atencion o convolucion). Lo que si se especifica es la interfaz: una llamada por cada 480 muestras (30 ms) de audio mono a 16 kHz en coma flotante normalizado a [-1, 1]. El modelo mantiene estado entre llamadas (5976 floats, inicializados a cero), y la cabeza de fin de turno usa sus ultimos 128 floats como estado, que deben reiniciarse al final de cada turno. Las tres salidas (`speech`, `turn`, `hesitation`) van un paso (30 ms) por detras de la entrada.

El modelo se presenta como una segunda cabeza sobre las mismas capas que el VAD, de modo que comparte representacion para actividad de voz y fin de turno. No se publican datos sobre el numero de tokens o horas de audio de entrenamiento, la composicion exacta del dataset ni si hubo ajuste fino con RLHF/DPO (no aplica en un modelo discriminativo de este tipo). Los benchmarks se evaluan sobre streams construidos con Common Voice French dev (CC0), LibriTTS-R dev-clean (CC BY 4.0) y MUSAN (CC BY 4.0), y sobre LiveKit eot-bench (CC BY 4.0).

## Capacidades

- Deteccion de actividad de voz: probabilidad de que alguien este hablando cada 30 ms, con una latencia de un paso (30 ms).
- Deteccion de fin de turno: probabilidad de que el turno termine en el punto actual, pensada para leerse durante las pausas.
- Deteccion de hesitacion: probabilidad de que el turno termine sobre una hesitacion, util para distinguir pausas de duda de finales reales.
- Procesamiento en tiempo real con estado persistente entre bloques, apto para streaming continuo de audio.
- Ejecucion en un solo hilo, nativa o en WebAssembly, con consumo reducido (1,2 MB de pesos).
- Integracion como VAD y detector de turno en LiveKit Agents, Pipecat y Wyoming (Home Assistant).
- No realiza generacion de texto, razonamiento, codigo, matematicas ni vision; es un modelo puramente discriminativo de audio.
- No se documentan capacidades multilingues explicitas mas alla de la evaluacion en 7 idiomas del benchmark de fin de turno.

## Casos de uso

- Agentes de voz conversacionales en produccion: Cue se usa como VAD y detector de fin de turno en LiveKit Agents y Pipecat, de modo que el agente espera a que el usuario termine de hablar antes de responder. La cabeza de fin de turno con umbral 0,6 leido cada 0,1 s de pausa permite politicas de corte mas finas que un simple temporizador.
- Asistentes de voz en el navegador: al ejecutarse en WebAssembly a traves del SDK de Alkove, permite VAD local sin enviar audio a un servidor, adecuado para aplicaciones web con requisitos de privacidad.
- Aplicaciones moviles on-device: el paquete Swift (iOS) y el SDK de Android permiten integrar VAD y deteccion de turno en el telefono con un coste de 1,9 ms por segundo de audio en hardware movil de gama alta.
- Home Assistant y domotica por voz: el plugin `wyoming-alkove` lo coloca delante del speech-to-text de Assist para segmentar el audio del usuario y evitar transcripciones de silencios o ruido.
- Transcripcion y diarizacion por lotes en streaming: la salida `speech` con umbral 0,5 y cierre tras 600 ms por debajo de 0,1 permite segmentar audio largo en regiones de habla antes de pasarlas a un ASR.
- Filtrado de ruido y musica en pipelines de captura: los benchmarks muestran 0,1 falsos arranques por minuto sobre musica y ausencia de falsos arranques sobre ruido cuando se ejecuta detras de alkove-focus, lo que lo hace util para prefiltrar audio antes de wake word o ASR.
- Deteccion de hesitaciones para agentes mas naturales: la salida `hesitation` permite que el agente distinga pausas de duda de finales de turno y ajuste el tempo de respuesta.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados). VAD sobre 24 streams de un minuto con alkove-focus delante; en cada stream una voz entre -45 y -25 dBFS habla sobre ruido o musica y otra voz habla sola en el 40 % de los huecos. Silero VAD v6 (MIT) medido por el autor sobre los mismos streams con umbrales 0,65/0,5.

| Metrica | Cue | Silero VAD v6 |
|---|---|---|
| Voz perdida | 2,93 % | 2,96 % |
| Falsos arranques (24 min) | 4 | 4 |
| Abierto durante los silencios del hablante | 6,4 % | 5,9 % |
| Inicio de habla | 10 ms despues de Silero | — |

Comportamiento en solitario detras de alkove-focus: sin falsos arranques sobre ruido en ninguno de los dos; 0,1 falsos arranques por minuto sobre musica (Silero 0,4); abierto el 50 % del tiempo con voces de television (Silero 81 %).

Fin de turno sobre LiveKit eot-bench (validacion, 7 idiomas), con cada pausa leida cada 0,1 s y el primer valor por encima del umbral cerrando la pausa. Media de los 7 idiomas, medida por el autor.

| Metrica | Valor |
|---|---|
| Pausas cerradas erroneamente a 300 ms de latencia | 35,4 % |
| Latencia al 10 % de pausas cerradas erroneamente | 661 ms |

Rendimiento de inferencia declarado:

| Plataforma | Coste |
|---|---|
| CPU nativa, 1 hilo, Galaxy Z Fold8 (Android 17) | 1,9 ms por segundo de audio |
| CPU nativa, 1 hilo, Apple M1 Max (macOS) | 3,0 ms por segundo de audio |

## Requisitos de hardware

- VRAM: no aplica; el modelo corre en CPU. Los pesos int8 ocupan 1,2 MB y el estado de sesion son 5976 floats.
- GPU: no requiere GPU; esta disenado para CPU de un solo hilo.
- Cabe en cualquier dispositivo con CPU moderna, incluidos telefonos moviles de gama alta y navegadores via WebAssembly.
- Opciones de despliegue: motor Alkove (Rust, nativo o WebAssembly), SDK de Alkove para navegador (npm `alkove`), paquete Python `alkove`, SDK de Android, paquete Swift para iOS, y plugins `livekit-plugins-alkove`, `pipecat-alkove` y `wyoming-alkove`.
- Latencia: 30 ms por bloque procesado (un paso de retardo en las salidas); coste medido de 1,9 a 3,0 ms por segundo de audio en las plataformas indicadas.
- Throughput: no disponible de forma explicita; el coste por segundo de audio sugiere amplio margen para tiempo real en un solo hilo.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alkove-cue-1-preview | VAD + fin de turno | 1,2 MB (int8) | Por bloques de 30 ms con estado | Apache-2.0 | Hugging Face, motor Alkove |
| Silero VAD v6 | VAD | No disponible | Por bloques | MIT | Referencia usada por el autor en los benchmarks |
| alkove-spot-1-preview | VAD (misma salida `speech`) | No disponible | Por bloques | No disponible | Hugging Face (alkove-ai) |

El autor compara directamente con Silero VAD v6: Cue iguala la voz perdida (2,93 % frente a 2,96 %) y los falsos arranques (4 en 24 minutos), con un inicio de habla 10 ms mas tardio y algo mas de apertura durante los silencios del hablante (6,4 % frente a 5,9 %). La ventaja de Cue esta en la cabeza de fin de turno y en el comportamiento con musica y voces de television detras de alkove-focus. alkove-spot-1-preview ofrece la misma salida `speech`, por lo que no es necesario Cue si ya se ejecuta Spot.

## Limitaciones y advertencias

- Version preview: el autor advierte que los pesos y la interfaz pueden cambiar antes de la version 1.
- Los benchmarks son declarados por el autor y no estan verificados (`verified: false` en el model-index); las cifras de Silero fueron medidas por el propio autor.
- En fin de turno, el 35,4 % de las pausas se cierran erroneamente a 300 ms de latencia; la latencia al 10 % de pausas cerradas erroneamente es de 661 ms, lo que exige ajustar la politica de corte al caso de uso.
- El modelo no genera texto ni razona; cualquier expectativa de modelo generativo es inaplicable.
- No se documentan sesgos especificos ni cobertura de idiomas mas alla de los 7 idiomas del benchmark de fin de turno; el rendimiento en otros idiomas no esta evaluado.
- El formato de pesos es propietario (`.alk`) y requiere el motor Alkove; no hay version GGUF ni compatibilidad directa con llama.cpp u Ollama.
- La licencia Apache-2.0 permite uso comercial, pero el aviso de preview implica que la API y los pesos pueden cambiar sin garantia de compatibilidad.
- El estado de la cabeza de fin de turno debe reiniciarse (ultimos 128 floats a cero) al final de cada turno; omitirlo degrada la deteccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alkove-ai/alkove-cue-1-preview
- Modelo relacionado (VAD alternativo): https://huggingface.co/alkove-ai/alkove-spot-1-preview
- Modelo de aislamiento de voz: https://huggingface.co/alkove-ai/alkove-focus-1-preview
- Sitio de Alkove: https://alkove.ai
- Motor Alkove (Rust, Apache-2.0): https://github.com/alkove-ai/alkove/tree/main/crates/engine
- Formato `.alk`: https://github.com/alkove-ai/alkove/blob/main/crates/engine/FORMAT.md
- SDK Android: https://github.com/alkove-ai/alkove/tree/main/android
- Paquete Swift (iOS): https://github.com/alkove-ai/alkove/tree/main/ios
- SDK de navegador (npm): https://www.npmjs.com/package/alkove
- Paquete Python: https://pypi.org/project/alkove/
- Plugin LiveKit: https://pypi.org/project/livekit-plugins-alkove/
- Plugin Pipecat: https://pypi.org/project/pipecat-alkove/
- Plugin Wyoming (Home Assistant): https://pypi.org/project/wyoming-alkove/
- Dataset LiveKit eot-bench: https://huggingface.co/datasets/livekit/eot-bench-data
