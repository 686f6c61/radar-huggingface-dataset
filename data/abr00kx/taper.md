# abr00kx/taper

## Resumen

Taper no es un modelo de inteligencia artificial, sino un protocolo de mensajería cifrada de extremo a extremo con caducidad efímera, publicado en Hugging Face bajo el identificador `abr00kx/taper`. Se define como un fork duro y no compatible del protocolo Matrix, orientado a chat grupal privado en el que cada mensaje, archivo y clave se destruye criptográficamente tras un máximo de 21 días. El autor del repositorio es `abr00kx` y el proyecto se distribuye con licencia Apache 2.0.

La propuesta técnica combina cifrado Olm/Megolm obligatorio mediante vodozemac, autenticación OPAQUE (RFC 9807) en la que la contraseña nunca abandona el dispositivo, Room Version 13 con State Resolution v2.1, TLS 1.3 híbrido post-cuántico con X25519MLKEM768, relleno de tramas Padmé y un cliente de escritorio para GNU/Linux que opera exclusivamente sobre Tor. El repositorio aparece con 0 descargas y 0 likes, un tamaño de 0.0 GB y sin pipeline declarado, lo que confirma que se trata de un artefacto de software y no de pesos de un modelo entrenado.

El proyecto se encuentra en estado de vista previa: pasa sus suites automatizadas de seguridad, navegador, escritorio, fuzzing y cifrado de backend, pero no ha recibido una auditoría de seguridad independiente de terceros. La federación es experimental y el media entre servidores aún no está implementado. Por tanto, cualquier evaluación debe tratar el repositorio como una base de código de protocolo, no como un modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: protocolo de mensajería (fork de Matrix), no un modelo neuronal |
| Parámetros totales | No disponible (no es un modelo de IA) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantización | No disponible (no aplica) |
| Idiomas soportados | Inglés (`en`) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repositorio de código; Node.js y GTK4, sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. Taper es una implementación de protocolo de comunicaciones escrita en Node.js para el servidor y con un cliente de escritorio GTK4 para GNU/Linux. Su "arquitectura" es la de un protocolo federado de mensajería derivado de Matrix, con capas de cifrado y autenticación: Olm/Megolm vía vodozemac para el cifrado de extremo a extremo, OPAQUE (RFC 9807) sobre WebSocket para la autenticación, y TLS 1.3 con intercambio híbrido X25519MLKEM768 para la capa de transporte.

Las innovaciones técnicas declaradas se centran en la seguridad del protocolo. La Room Version 13 con State Resolution v2.1 corrige ataques de reinicio de estado (CVE-2025-49090) mediante mapas de estado inicial vacíos en comprobaciones iterativas de autenticación, subgrafos de estado en conflicto, identificadores de sala autocertificados con SHA-256 y firma de eventos que cubre `auth_events`. Se desactiva el reenvío de claves de sala en banda, se exige firma cruzada de dispositivos remitentes en el descifrado y se impone un `binding` de 128 bits dentro y fuera del criptograma, con detección de desfase de reloj mediante `sender_ts`. La retención se limita a 21 días con claves de envoltura AES-256-GCM diarias que se destruyen y truncado del WAL de SQLite.

## Capacidades

- Mensajería grupal cifrada de extremo a extremo con Olm/Megolm obligatorio; no existe modo de mensajes sin cifrar.
- Caducidad criptográfica de mensajes, archivos y claves con techo máximo de 21 días, configurable a menos por sala mediante `t.room.retention`.
- Autenticación OPAQUE (RFC 9807) en la que el servidor nunca recibe la contraseña del usuario.
- Soporte opcional de claves de seguridad hardware FIDO2/WebAuthn con comprobaciones de step-up y revocación de dispositivo único (`t.devices.list`, `t.devices.delete`).
- Cifrado de metadatos de sala: nombre, tema y demás metadatos no de enrutamiento deben ir cifrados (`t.room.encrypted`).
- Federación experimental con lista de permitidos, TOFU, rotación y anclaje de claves de firma encadenadas criptográficamente y presupuestos diarios por par.
- Mitigación de scraping: sin directorio público de usuarios ni salas, registro con proof-of-work, tokens de invitación de un solo uso y presupuestos de lectura por niveles.
- Relleno Padmé en todas las tramas y en texto plano, con tráfico de cobertura `noop` opcional de Poisson.
- Cliente de escritorio GNU/Linux que opera exclusivamente sobre Tor.

## Casos de uso

- Chat grupal privado con caducidad garantizada: equipos que necesitan que las conversaciones desaparezcan por completo tras 21 días pueden desplegar Taper para que servidor y clientes destruyan mensajes, medios y claves sin intervención manual.
- Comunicación de periodistas y fuentes: la combinación de Tor obligatorio, OPAQUE y ausencia de directorio público reduce la superficie de identificación de participantes, adecuada para entornos con riesgo de vigilancia.
- Coordinación de equipos de seguridad: la verificación de firmas Ed25519 de dispositivos propios y la obligación de firma cruzada en el descifrado permiten detectar inyección de claves o suplantación en salas internas.
- Despliegue en organizaciones con requisitos de retención mínima: el techo de 21 días y la destrucción de claves de envoltura diarias encajan con políticas de minimización de datos y RGPD.
- Autenticación sin exposición de credenciales: OPAQUE y WebAuthn permiten integrar Taper en infraestructuras donde el servidor no debe ver contraseñas, por ejemplo en despliegues autoalojados de una federación pequeña.
- Investigación en protocolos de mensajería: el código sirve como referencia para estudiar State Resolution v2.1, el relleno Padmé o la migración a criptografía post-cuántica en TLS 1.3.
- Pruebas de federación controlada: con lista de permitidos y presupuestos por par, se puede evaluar el comportamiento de una federación endurecida entre servidores de confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento, latencia ni throughput, y al no ser un modelo de IA no aplican MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- No aplica VRAM ni GPU: el proyecto no ejecuta inferencia de modelos.
- Servidor: Node.js con almacenamiento SQLite; los requisitos concretos de CPU y RAM no están especificados en la información disponible.
- Cliente de escritorio: GTK4 sobre GNU/Linux, con conexión exclusiva a través de Tor.
- No cabe ni deja de caber en GPU de consumo porque no es un modelo; no hay opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Cifrado E2EE | Caducidad de mensajes | Autenticación | Licencia | Estado |
|---|---|---|---|---|---|---|
| Taper | Fork de Matrix | Olm/Megolm obligatorio | 21 días máximo | OPAQUE + WebAuthn | Apache 2.0 | Vista previa, sin auditoría externa |
| Matrix (estándar) | Protocolo federado | Olm/Megolm opcional | No nativa | Contraseña en servidor | Apache 2.0 | Producción |
| Signal | Protocolo y app | Signal Protocol | Temporizadores configurables | Número de teléfono | GPL/AGPL en clientes | Producción |
| SimpleX Chat | Protocolo y app | Doble ratchet | No nativa | Sin identificadores de usuario | AGPL | Producción |

La comparación se limita a protocolos de mensajería porque no existen modelos de IA comparables en la información proporcionada. Frente a Matrix estándar, Taper elimina la compatibilidad hacia atrás para imponer cifrado y caducidad incondicionales; frente a Signal y SimpleX, añade federación con lista de permitidos y Tor obligatorio en el cliente de escritorio, a costa de un estado de madurez menor.

## Limitaciones y advertencias

- No ha recibido una auditoría de seguridad independiente de terceros; el propio autor advierte de no usarlo para casos de alta criticidad hasta completarla.
- La federación es experimental y el media entre servidores no está implementado.
- Al ser un fork no compatible de Matrix, no interoperará con clientes ni servidores Matrix existentes.
- El cliente de escritorio es exclusivamente para GNU/Linux y solo opera sobre Tor, lo que limita su adopción en otros sistemas.
- El idioma declarado es únicamente inglés.
- El techo de 21 días es una restricción de diseño que puede no encajar en entornos con requisitos de retención legal más largos.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni de validación por la comunidad.
- Riesgo de sesgos y alucinación: no aplica al no ser un modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/abr00kx/taper
- Especificación de Matrix: https://spec.matrix.org
- vodozemac: https://github.com/matrix-org/vodozemac
- OPAQUE (RFC 9807): https://www.rfc-editor.org/rfc/rfc9807
- Lista de verificación de la release 1.0: docs/release-checklist.md (dentro del repositorio)
- Documentación de salas v13: content/rooms/v13.md (dentro del repositorio)
- Documentación de seguridad: content/security.md (dentro del repositorio)
