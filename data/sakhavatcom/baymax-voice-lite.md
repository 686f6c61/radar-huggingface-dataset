# Sakhavatcom/baymax-voice-lite

## Resumen

`Sakhavatcom/baymax-voice-lite` no es un modelo neuronal con pesos publicados, sino un servidor de voz empaquetado como repositorio de HuggingFace. Concretamente, implementa un endpoint compatible con el protocolo xiaozhi v1 (`wss://<host>/xiaozhi/v1/`) pensado para el robot BAYMAX-X, cuyo cliente es un ESP32 con micrófono y altavoz. El servidor encadena tres servicios: reconocimiento de voz con Groq Whisper en persa (`fa`), un LLM remoto servido por Groq (por defecto `qwen3.8-27b`, con alternativas `gpt-oss`) y síntesis de voz neuronal `fa-IR` de Edge, devolviendo audio PCM16 a 16 kHz.

Su interés práctico está en la ingeniería de despliegue: todo el pipeline corre en aproximadamente 60 MB de RAM porque evita dependencias pesadas como PyTorch o ffmpeg, apoyándose solo en `aiohttp`, `edge-tts` y `miniaudio`. Eso permite alojarlo en hardware muy modesto (una Raspberry Pi, un contenedor pequeño o una instancia de bajo coste) mientras el cómputo real de ASR y LLM se delega a la API de Groq.

No hay información sobre arquitectura de modelo, número de parámetros, ventana de contexto ni datos de entrenamiento: el repositorio distribuye código de orquestación, no pesos. El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, y la model card es un README técnico breve, sin resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica como modelo neuronal: servidor de orquestacion (ASR remoto -> LLM remoto -> TTS remoto) sobre `aiohttp`, compatible con el protocolo xiaozhi v1 por WebSocket |
| Parametros totales | No disponible (no se distribuyen pesos; el LLM se ejecuta en Groq) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del LLM remoto configurado en la variable `LLM_MODELS`) |
| Tipos de cuantizacion | No disponible (no se publican pesos que cuantizar) |
| Idiomas soportados | Persa (`fa`) en ASR y en TTS (`fa-IR`); el idioma de respuesta depende del LLM remoto |
| Licencia | MIT (codigo del repositorio) |
| Formato de pesos | No disponible (no hay pesos; el entregable es codigo Python y configuracion de entorno) |
| Protocolo de servicio | `wss://<host>/xiaozhi/v1/` con autenticacion HMAC bearer; `GET /health` para comprobacion de estado |
| ASR | Groq Whisper, idioma `fa` (configurable via `ASR_MODEL`) |
| LLM | Groq, por defecto `qwen3.8-27b` con alternativas `gpt-oss` (configurable via `LLM_MODELS`), con herramientas MCP del dispositivo |
| TTS | Voces neuronales Edge, `fa-IR` (configurable via `TTS_VOICE`), salida PCM16 a 16 kHz |
| Dependencias | `aiohttp`, `edge-tts`, `miniaudio` (sin torch ni ffmpeg) |
| Variables de entorno | `GROQ_API_KEY` y `BAYMAX_SECRET` (obligatorias); `PORT`, `LLM_MODELS`, `ASR_MODEL`, `TTS_VOICE`, `AUTH_ENABLED` |
| Consumo de memoria | Aproximadamente 60 MB de RAM |
| Cliente objetivo | Robot BAYMAX-X con ESP32 como cliente de audio (microfono y altavoz) |

## Arquitectura y entrenamiento

El repositorio no contiene ningun modelo entrenado. Lo que implementa es una arquitectura de tipo pipeline en cascada: el cliente ESP32 abre un WebSocket contra el servidor, este reenvia el audio entrante a Groq Whisper para transcripcion en persa, pasa el texto al LLM de Groq (con acceso a herramientas MCP expuestas por el propio dispositivo) y sintetiza la respuesta con voces neuronales de Edge, devolviendo la señal como PCM16 mono a 16 kHz. La autenticacion se resuelve con un bearer HMAC derivado de `BAYMAX_SECRET`, y existe un endpoint `GET /health` para monitorizacion.

Las decisiones tecnicas destacables son de ingenieria, no de modelado: se elimina la cadena PyTorch/ffmpeg para reducir el peso del despliegue a unos 60 MB de RAM, se externaliza todo el computo intensivo a APIs gestionadas y se mantiene la configuracion (modelos de ASR/LLM, voz de TTS, puerto, autenticacion) mediante variables de entorno, de forma que el mismo servidor puede reapuntarse a otros modelos sin cambios de codigo. No hay informacion sobre datos de entrenamiento, tokens procesados, composicion del corpus ni tecnicas de alineacion (RLHF/DPO), porque no se entrena ningun modelo en este repositorio.

## Capacidades

- Conversacion de voz extremo a extremo en persa: entrada de audio, transcripcion, generacion de respuesta y sintesis de vuelta al altavoz del robot.
- Compatibilidad con el protocolo xiaozhi v1 sobre WebSocket, lo que permite conectar clientes ESP32 ya existentes en el ecosistema xiaozhi.
- Uso de herramientas MCP del dispositivo dentro del bucle del LLM, es decir, el modelo remoto puede invocar acciones expuestas por el robot.
- Seleccion de modelos por configuracion: `LLM_MODELS` admite modelos de Groq (por defecto `qwen3.8-27b`, con alternativas `gpt-oss`), y `ASR_MODEL` permite cambiar el modelo de reconocimiento.
- Autenticacion HMAC bearer con secreto compartido y posibilidad de desactivar la autenticacion mediante `AUTH_ENABLED`.
- Endpoint de salud (`GET /health`) para sondas de disponibilidad en despliegues contenerizados.
- No se documentan capacidades de vision, audio nativo (sin ASR separado), tool calling fuera del contexto MCP ni modos de razonamiento explicito mas alla de lo que ofrezca el LLM remoto.

## Casos de uso

- Robot de compania domestico: el servidor recibe el audio del ESP32 del BAYMAX-X, transcribe en persa con Whisper y devuelve respuesta hablada en `fa-IR`, cubriendo conversaciones multi-turno con un consumo de recursos minimo en el propio robot.
- Despliegue en hardware de borde de bajo coste: al requerir unos 60 MB de RAM y no necesitar GPU, puede ejecutarse en una Raspberry Pi o un contenedor pequeno junto al punto de acceso, dejando el computo pesado a Groq.
- Automatizacion de acciones fisicas mediante MCP: el LLM remoto puede invocar herramientas del dispositivo (por ejemplo, mover el robot o cambiar su estado) dentro de la misma conversacion de voz, sin logica adicional en el firmware del ESP32.
- Prototipado rapido de asistentes de voz en persa: sirve como backend de referencia para validar latencia y calidad de ASR/TTS antes de invertir en un stack local completo.
- Interfaz de voz para kioscos o terminales empotrados: el endpoint WebSocket compatible con xiaozhi permite reutilizar clientes existentes y anadir autenticacion por HMAC para despliegues con varios dispositivos.
- Monitorizacion ligera de servicio: `GET /health` facilita integrar el servidor en sistemas de alerta y orquestadores tipo Kubernetes o Docker Compose sin instrumentacion adicional.
- Evaluacion comparativa de LLM en un canal de voz: cambiar `LLM_MODELS` permite contrastar el comportamiento de distintos modelos de Groq sobre el mismo flujo de audio sin tocar el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de WER para ASR, latencia de extremo a extremo, MOS para TTS ni evaluaciones de calidad de respuesta del LLM.

## Requisitos de hardware

- VRAM: no se requiere GPU; el servidor no ejecuta inferencia local. El consumo declarado es de aproximadamente 60 MB de RAM.
- CPU: no se especifica modelo ni numero de nucleos; el perfil de carga corresponde a un servidor `aiohttp` que reenvia audio hacia APIs externas.
- GPU recomendadas: ninguna. El computo de ASR, LLM y TTS ocurre en Groq y en los servidores de Edge.
- Cliente: ESP32 del robot BAYMAX-X con microfono y altavoz; la calidad del audio de entrada depende del hardware del dispositivo.
- Opciones de despliegue: ejecucion directa del servidor Python (`aiohttp` + `edge-tts` + `miniaudio`). No se documentan imagenes Docker, vLLM, llama.cpp, Ollama ni TGI, que no aplican a este componente.
- Latencia y throughput: no disponibles. Al depender de tres servicios remotos (Groq Whisper, Groq LLM, Edge TTS) y de la red, la latencia estara dominada por las llamadas externas, pero no se aportan cifras medidas.
- Requisito operativo imprescindible: conectividad saliente hacia Groq y hacia el servicio de TTS de Edge, y una `GROQ_API_KEY` valida.

## Comparativa con modelos similares

| Solucion | Naturaleza | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Sakhavatcom/baymax-voice-lite` | Servidor de orquestacion de voz (ASR + LLM + TTS remotos), compatible xiaozhi v1 | No aplica | No disponible (heredado del LLM remoto) | MIT | Publico en HuggingFace, 0 descargas |
| Servidor oficial del ecosistema xiaozhi | Servidor de voz para clientes ESP32 | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |
| Stack local Whisper + LLM local + Piper | Pipeline de voz autohospedado, sin dependencia de APIs | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos verificables de parametros, contexto, rendimiento ni licencia de las alternativas como para establecer una comparacion cuantitativa fiable. La diferencia cualitativa principal de `baymax-voice-lite` frente a un stack local es que delega todo el computo en APIs externas, lo que reduce drasticamente los requisitos de hardware a costa de depender de la red, de claves de API y de las condiciones de uso de terceros.

## Limitaciones y advertencias

- No es un modelo: no hay pesos, tokenizador ni configuracion de inferencia que pueda descargarse y ejecutarse localmente. Cualquier expectativa de uso como modelo de HuggingFace es incorrecta.
- Dependencia total de servicios de terceros: sin conectividad con Groq y con el servicio de TTS de Edge, el servidor no puede transcribir, razonar ni sintetizar voz. No hay modo offline documentado.
- Privacidad: el audio del usuario y las transcripciones se envian a Groq, y el texto de respuesta se envia al servicio de TTS de Edge. Esto puede ser incompatible con requisitos de proteccion de datos en entornos domiliciarios o sanitarios.
- Coste y cuotas: el uso de la API de Groq esta sujeto a limites de tasa y facturacion no descritos en el repositorio.
- Licencia: el codigo es MIT, pero el uso de Groq y de las voces de Edge se rige por sus propios terminos de servicio, que prevalecen sobre la licencia del repositorio.
- Riesgo de alucinacion y de errores en cadena: cualquier fallo del LLM remoto se propaga al audio; los errores de ASR en persa pueden ademas degradar la respuesta sin que exista un mecanismo de correccion documentado.
- Idioma: el foco es persa (`fa` / `fa-IR`); no se documenta soporte de otros idiomas en ASR o TTS.
- Gestion de secretos: `GROQ_API_KEY` y `BAYMAX_SECRET` son obligatorias y no se almacenan en el repositorio, pero el proyecto no describe rotacion de claves, limitacion de tasa por cliente ni auditoria de accesos.
- Madurez: 0 descargas y 0 likes, sin tests, ejemplos de despliegue ni historial de versiones documentado en la informacion disponible. La fecha de creacion del repositorio figura como 2026-10-23 en los metadatos.
- No se documentan funcionalidades habituales en asistentes de voz de produccion como deteccion de actividad vocal, interrupcion (barge-in), cancelacion de eco o reconexion automatica del WebSocket.

## Enlaces

- HuggingFace: https://huggingface.co/Sakhavatcom/baymax-voice-lite
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repositorios de codigo o demos.
