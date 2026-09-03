# Snapkitty/sovereign-temporal-root

## Resumen

Sovereign Temporal Root no es un modelo de inteligencia artificial, sino un protocolo criptográfico de cifrado simétrico con rotación temporal de claves y vinculación hardware. Desarrollado por Ahmad Ali Parr y publicado bajo el trust Bel Esprit D'Accord Irrevocable Trust, el repositorio en HuggingFace contiene la especificación y una demo en JavaScript que implementa el derivado de claves. El protocolo resuelve el problema de la coordinación segura en entornos disputados: cliente y servidor derivan la misma clave a partir de un identificador hardware, una sal fija y el epoch temporal actual, sin intercambio de claves ni handshake. Su relevancia radica en el "efecto puerto fantasma": las claves capturadas caducan automáticamente con cada epoch, haciendo inútiles las llaves robadas sin necesidad de revocación explícita. No se trata de un modelo con parámetros ni entrenamiento, por lo que las especificaciones habituales de modelos de lenguaje no aplican.

## Especificaciones técnicas

Dado que el repositorio no contiene un modelo de IA, se indican las características del protocolo y se marcan como "no disponible" los campos que no corresponden.

| Parametro | Valor |
|---|---|
| Arquitectura | Protocolo criptográfico simétrico (ChaCha20 + SHA-512) |
| Parametros totales | no disponible (no es un modelo) |
| Parametros activos | no disponible (no es un modelo) |
| Longitud de contexto | no disponible (no es un modelo) |
| Tipos de cuantizacion | no disponible (no es un modelo) |
| Idiomas soportados | no disponible (no es un modelo) |
| Licencia | BSL-1.1 y AGPL-3.0 (doble licencia) |
| Formato de pesos | no disponible (no es un modelo) |

El protocolo especifica: cifrado ChaCha20, KDF SHA-512 con salida de 256 bits, rotación de clave por epoch (por defecto 86400 segundos), vinculación a composite hardware (UUID de placa base, ID de CPU, ID de máquina), nonces ortogonales para TX/RX, y puerto 0.0.0.0:4433 sin SNI ni certificados.

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. Se trata de un protocolo determinista basado en funciones hash y cifrado simétrico. La clave se deriva mediante `SHA-512(salt || hardware_composite || epoch)` y se trunca a 32 bytes para ChaCha20. El epoch se calcula como `floor(time.time() / window_seconds)`, lo que permite que cliente y servidor sincronizados por NTP obtengan la misma clave sin intercambio previo. La innovación principal es la combinación de vinculación hardware y rotación temporal, que elimina la necesidad de coordinación y hace que las claves capturadas queden obsoletas al final de cada ventana temporal.

## Capacidades

- Cifrado simétrico de flujo con ChaCha20 (256 bits).
- Derivación de claves determinista a partir de identificadores hardware y tiempo.
- Rotación automática de claves por epoch (configurable, por defecto 86400 s).
- Sin handshake, sin SNI, sin certificados: comunicación "sigilosa" en el puerto 4433.
- Nonces ortogonales para tráfico TX y RX, evitando reutilización de nonce.
- Soporte de buffer de deriva temporal (check de epoch actual y epoch-1).
- Demo en navegador usando `crypto.subtle.digest('SHA-512')`, compatible con Python `hashlib.sha512`.

## Casos de uso

- Comunicación segura en entornos hostiles: el protocolo permite establecer un canal cifrado sin intercambio de claves, útil en redes con vigilancia o bloqueo de handshakes.
- Túneles efímeros para operaciones de corta duración: al rotar la clave cada día, un canal abierto en un epoch no es comprometido si la clave se filtra después.
- Autenticación de dispositivos específicos: al vincular la clave al hardware, solo la máquina autorizada puede derivar la clave correcta.
- Respaldo de infraestructura crítica: si un servidor es comprometido, las claves capturadas caducan automáticamente, reduciendo la ventana de explotación.
- Sincronización de datos entre máquinas propias: dos dispositivos con el mismo composite hardware y reloj NTP pueden comunicarse sin servidor central.
- Pruebas de concepto educativas: la demo en el navegador permite verificar el derivado de claves sin instalar dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo de IA, no existen métricas como MMLU, HumanEval o GSM8K. El rendimiento del protocolo depende de la velocidad de SHA-512 y ChaCha20, que son operaciones rápidas en cualquier hardware moderno, pero no se proporcionan cifras concretas en el repositorio.

## Requisitos de hardware

- No requiere GPU ni VRAM: es un protocolo que se ejecuta en CPU.
- Memoria mínima: la implementación de referencia es un único `index.html` sin dependencias, ejecutable en cualquier navegador.
- Compatible con cualquier sistema con soporte de WebCrypto (`crypto.subtle`) o Python con `hashlib` y `cryptography`.
- Despliegue: el servidor escucha en `0.0.0.0:4433`; la demo se sirve con un simple servidor HTTP estático.
- Latencia: despreciable en operaciones criptográficas; el cuello de botella sería la red.

## Comparativa con modelos similares

Al no ser un modelo de IA, se compara con otros protocolos de cifrado con rotación de claves o vinculación hardware:

| Protocolo | Mecanismo | Coordinación | Rotación | Licencia |
|---|---|---|---|---|
| Sovereign Temporal Root | ChaCha20 + SHA-512 + epoch | Ninguna (solo NTP) | Automática por epoch | BSL-1.1 / AGPL-3.0 |
| TLS 1.3 | Cifrado autenticado + handshake | Requiere intercambio de claves | Por sesión | Estándar (IETF) |
| WireGuard | ChaCha20 + Poly1305 | Intercambio de claves estáticas | Manual | GPL-2.0 |
| Signal Protocol | Doble ratchet | Intercambio inicial | Por mensaje | GPL-3.0 |

La diferencia clave es que Sovereign Temporal Root elimina por completo el intercambio de claves, a costa de requerir sincronización temporal y vinculación hardware. No es comparable a modelos de lenguaje.

## Limitaciones y advertencias

- No es un modelo de IA: no tiene capacidades de generación de texto, razonamiento ni código.
- La seguridad depende de la sincronización NTP: si el reloj se desvía, la derivación de clave falla.
- El composite hardware puede variar entre máquinas idénticas o tras actualizaciones de firmware, lo que invalida la clave.
- La licencia es dual (BSL-1.1 y AGPL-3.0), lo que puede imponer restricciones de uso comercial según la versión elegida.
- El protocolo está marcado como "Patent Pending", lo que puede afectar su adopción en proyectos comerciales.
- No hay auditoría externa publicada ni revisión por pares; su uso en producción requiere evaluación de seguridad adicional.
- El "efecto puerto fantasma" no protege contra ataques en tiempo real dentro del mismo epoch: si un atacante captura la clave mientras está activa, puede leer el tráfico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/sovereign-temporal-root
- Demo en vivo: https://snapkittywest.github.io/sovereign-temporal-root/
- Licencia BSL-1.1 y AGPL-3.0 (referenciadas en la model card)
- Autor: Ahmad Ali Parr (sin enlace directo proporcionado)
