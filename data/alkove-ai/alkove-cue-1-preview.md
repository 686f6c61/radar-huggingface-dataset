# alkove-ai/alkove-cue-1-preview

## Resumen

alkove-cue-1-preview es un modelo de deteccion de actividad de voz (VAD) y deteccion de fin de turno desarrollado por alkove-ai, pensado para ejecutarse en el dispositivo (navegador o telefono) dentro del SDK de voz Alkove. No es un modelo de lenguaje: procesa audio de 16 kHz en ventanas de 30 ms (480 muestras) y devuelve tres probabilidades por ventana: si alguien esta hablando (`speech`), si el turno termina en ese punto (`turn`) y si termina sobre una hesitacion (`hesitation`). Su relevancia radica en que sustituye la logica clasica de VAD y de deteccion de fin de turno en agentes de voz conversacionales, con un peso de solo 1,2 MB en int8 y una latencia de milisegundos por segundo de audio.

El modelo se distribuye en formato `.alk` propietario del motor Alkove (Rust, Apache-2.0), ejecutable de forma nativa o en WebAssembly en un solo hilo, y se integra con LiveKit Agents, Pipecat y Wyoming (Home Assistant). Es una version preview: los pesos y la interfaz pueden cambiar antes de la version 1.

La licencia es Apache-2.0, lo que permite uso comercial, pero el modelo solo es utilizable a traves del motor Alkove, ya que no se publican pesos en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal por capas con dos cabezas de salida (VAD y fin de turno) sobre las mismas capas; no se detalla el tipo exacto de capa en la model card |
| Parametros totales | no disponible (peso del artefacto: 1,2 MB en int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; procesa ventanas de 480 muestras (30 ms) con estado interno de 5976 floats entre llamadas |
| Tipos de cuantizacion | int8 (unico formato publicado) |
| Idiomas soportados | no disponible explicitamente; evaluado en ingles, frances, espanol, italiano, portugues, aleman y neerlandes en el benchmark de fin de turno |
| Licencia | Apache-2.0 |
| Formato de pesos | `.alk` (formato del motor Alkove), acompanado de un manifiesto JSON con sha256 y tamanos |

## Arquitectura y entrenamiento

La model card no describe en detalle la arquitectura interna: indica que es una red pequena con dos cabezas que comparten capas, una para `speech` y otra para `turn`/`hesitation`, con estado recurrente entre llamadas (5976 floats, inicializados a cero). La cabeza de fin de turno usa como estado sus ultimos 128 floats, que deben reiniciarse al final de cada turno. La entrada es audio float32 mono a 16 kHz en el rango -1..1, y las salidas van un paso (30 ms) por detras de la entrada.

No se publican datos sobre el numero de tokens, la composicion exacta del dataset de entrenamiento ni si hubo RLHF o DPO (no aplica a un modelo de este tipo). Los benchmarks indican que se evaluo con audio de Common Voice French dev (CC0), LibriTTS-R dev-clean (CC BY 4.0) y MUSAN (CC BY 4.0) para ruido y musica, y con LiveKit eot-bench (CC BY 4.0) para fin de turno. La innovacion destacable es la doble cabeza sobre las mismas capas, que permite obtener VAD y deteccion de fin de turno con un unico modelo de 1,2 MB y estado ligero, disenado para ejecucion en un solo hilo en WebAssembly y en dispositivos moviles.

## Capacidades

- Deteccion de actividad de voz: probabilidad de que alguien este hablando cada 30 ms a partir de audio de 16 kHz.
- Deteccion de fin de turno: probabilidad de que el usuario haya terminado su intervencion, pensada para leerse en pausas.
- Deteccion de hesitacion: probabilidad de que el turno termine sobre una duda o hesitacion.
- Procesamiento en tiempo real con estado entre llamadas (5976 floats), apto para streaming continuo.
- Ejecucion nativa y en WebAssembly en un solo hilo, con integracion en navegador, Android, iOS y Python.
- Integracion como VAD y detector de turno en LiveKit Agents, Pipecat y Wyoming (Home Assistant).
- No soporta tool calling, agentes multi-step, vision, audio generativo ni generacion de texto: es exclusivamente un modulo de senal de voz.

## Casos de uso

- Agentes de voz conversacionales en produccion: el modelo actua como VAD y detector de fin de turno en LiveKit Agents o Pipecat, permitiendo que el agente decida cuando el usuario ha terminado de hablar y reduzca las interrupciones; su latencia de 1,9-3,0 ms por segundo de audio lo hace adecuado para bucles en tiempo real.
- Atencion al cliente telefonica: con la logica recomendada (inicio de habla a 0,5 y fin tras 600 ms por debajo de 0,1) se evitan cortes prematuros en conversaciones multi-turno con pausas naturales.
- Asistentes de voz en el navegador: al ejecutarse en WebAssembly mediante el SDK de npm, permite VAD y deteccion de turno sin enviar audio a un servidor, util para aplicaciones web con requisitos de privacidad.
- Domotica con Home Assistant: el plugin de Wyoming coloca el modelo delante del speech-to-text de Assist para segmentar el audio del usuario y evitar transcripciones de silencio o ruido.
- Aplicaciones moviles de voz: con 1,2 MB en int8 y 1,9 ms por segundo de audio en un Galaxy Z Fold8, cabe en el presupuesto de bateria y memoria de un telefono para wake word y dictado.
- Preprocesado de pipelines de ASR: el modelo filtra segmentos sin habla y marca finales de turno antes de enviar audio a un reconocedor, reduciendo coste de inferencia y latencia percibida.
- Deteccion de hesitaciones en interfaces de voz: la salida `hesitation` permite que el agente espere antes de responder cuando el usuario duda, mejorando la naturalidad de la interaccion.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados) en la model card:

| Tarea | Metrica | Cue | Silero VAD v6 |
|---|---|---|---|
| VAD (24 streams de 1 min tras alkove-focus) | Habla perdida | 2,93 % | 2,96 % |
| VAD (24 min) | Falsos inicios | 4 | 4 |
| VAD | Abierto durante silencios del hablante | 6,4 % | 5,9 % |
| VAD | Inicio de habla | 10 ms despues de Silero | — |

| Tarea | Metrica | Cue |
|---|---|---|
| Fin de turno (LiveKit eot-bench, media de 7 idiomas) | Pausas terminadas erroneamente a 300 ms | 35,4 % |
| Fin de turno | Pausas terminadas erroneamente a 600 ms | 12,4 % |
| Fin de turno | Latencia al 10 % de pausas terminadas erroneamente | 661 ms |

Rendimiento de ejecucion declarado:

| Plataforma | Latencia |
|---|---|
| CPU nativa, 1 hilo, Galaxy Z Fold8 (Android 17) | 1,9 ms por segundo de audio |
| CPU nativa, 1 hilo, Apple M1 Max (macOS) | 3,0 ms por segundo de audio |

## Requisitos de hardware

- VRAM: no aplica; el modelo corre en CPU (tamano de 1,2 MB en int8).
- GPU: no requiere GPU; disenado para CPU de un solo hilo.
- Cabe en cualquier dispositivo consumer: telefonos Android e iOS, portatiles y navegadores con WebAssembly.
- Despliegue: motor Alkove (Rust, nativo o WebAssembly), SDK de npm para navegador, paquete Python `alkove`, SDK de Android y paquete Swift para iOS; integraciones con LiveKit Agents, Pipecat y Wyoming.
- Latencia: 1,9 ms por segundo de audio en Galaxy Z Fold8 y 3,0 ms por segundo de audio en Apple M1 Max, en un solo hilo.
- Throughput: no disponible mas alla de las cifras de latencia por segundo de audio.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| alkove-cue-1-preview | VAD + fin de turno | 1,2 MB (int8) | ventanas de 30 ms con estado de 5976 floats | Apache-2.0 | `.alk` | Ejecucion en navegador y movil; requiere motor Alkove |
| Silero VAD v6 | VAD | no disponible | ventanas de audio | MIT | no disponible | Referencia usada por el autor en los benchmarks; sin deteccion de fin de turno |
| alkove-spot-1-preview | VAD (misma salida `speech`) | no disponible | ventanas de 30 ms | no disponible | `.alk` | Segun la model card, no es necesario Cue si ya se usa Spot |

## Limitaciones y advertencias

- Version preview: los pesos y la interfaz pueden cambiar antes de la version 1; no se recomienda como dependencia estable en produccion sin fijar version.
- Solo se distribuye en formato `.alk` para el motor Alkove; no hay pesos en safetensors, GGUF ni ONNX, lo que limita su uso fuera del ecosistema Alkove.
- Los resultados de benchmarks son declarados por el autor y no estan verificados (`verified: false`); el propio autor indica que las mediciones de Silero VAD v6 las realizo el mismo.
- En fin de turno, el 35,4 % de las pausas se terminan erroneamente a 300 ms de latencia y el 12,4 % a 600 ms; la latencia al 10 % de pausas erroneas es de 661 ms, lo que puede provocar cortes en habla con pausas largas.
- En VAD, el modelo permanece abierto el 6,4 % del tiempo durante silencios del hablante, ligeramente peor que Silero VAD v6 (5,9 %).
- No se documentan sesgos por idioma, acento o dominio; la evaluacion de fin de turno cubre 7 idiomas europeos, pero no se detalla el rendimiento fuera de ellos.
- No se especifican los datos de entrenamiento ni sus licencias, por lo que no es posible evaluar riesgos de sesgo derivados del corpus.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende del motor Alkove (tambien Apache-2.0); conviene revisar los terminos del SDK y de las integraciones de terceros (LiveKit, Pipecat, Wyoming).
- No apto para tareas de generacion de texto, razonamiento, codigo, vision ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alkove-ai/alkove-cue-1-preview
- Sitio de Alkove: https://alkove.ai
- Motor Alkove (Rust): https://github.com/alkove-ai/alkove/tree/main/crates/engine
- Formato `.alk`: https://github.com/alkove-ai/alkove/blob/main/crates/engine/FORMAT.md
- SDK de npm: https://www.npmjs.com/package/alkove
- Paquete Python: https://pypi.org/project/alkove/
- SDK de Android: https://github.com/alkove-ai/alkove/tree/main/android
- Paquete Swift para iOS: https://github.com/alkove-ai/alkove/tree/main/ios
- Plugin de LiveKit: https://pypi.org/project/livekit-plugins-alkove/
- Integracion con Pipecat: https://pypi.org/project/pipecat-alkove/
- Integracion con Wyoming: https://pypi.org/project/wyoming-alkove/
- Modelo alkove-spot-1-preview: https://huggingface.co/alkove-ai/alkove-spot-1-preview
- Dataset LiveKit eot-bench: https://huggingface.co/datasets/livekit/eot-bench-data
