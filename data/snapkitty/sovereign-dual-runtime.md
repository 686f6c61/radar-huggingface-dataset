# Snapkitty/sovereign-dual-runtime

## Resumen

Sovereign Dual Runtime es un sistema de ejecución multi-runtime para agentes autónomos, desarrollado por Ahmad Ali Parr bajo el sello de Snapkitty. No se trata de un modelo de lenguaje o de aprendizaje automático al uso, sino de una infraestructura de ejecución que combina tres entornos aislados: un sandbox WASM con Pyodide iPython en el navegador, una máquina virtual soberana basada en el microprocesador MOS 6502 implementada en Rust, y un puente de compatibilidad M5 escrito con Axum que conecta ambos mundos. El sistema se complementa con una cadena WORM (write-once read-many) de sellado SHA-256 que registra cada evento de forma inmutable, y con una opción de emulación QEMU ARM64 para desplegar un teléfono Android completo con Termux.

El proyecto resuelve el problema del aislamiento y la trazabilidad en ejecución de agentes: el agente solo puede ejecutar Python dentro del sandbox WASM sin red ni escritura en el sistema de archivos, mientras que la VM 6502 actúa como plano de control soberano con latidos de reloj T0-T10 y sellado WORM. La relevancia actual radica en su enfoque de seguridad por diseño para agentes autónomos, con una constante soberana θ = 89/2462 inyectada en cada entorno de ejecución. El repositorio incluye scripts de inicio con Docker Compose y documentación de arquitectura en diagramas Mermaid. El proyecto se encuentra en una fase temprana, con cero descargas y cero likes en HuggingFace, y su licencia es BSL-1.1 (Business Source License).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multi-runtime: sandbox WASM (Pyodide iPython) + VM 6502 en Rust + puente M5 (Axum HTTP) + opcional QEMU ARM64 |
| Parametros totales | no disponible (no es un modelo paramétrico) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSL-1.1 (Business Source License 1.1) |
| Formato de pesos | no disponible (no hay pesos; se distribuye como código fuente y contenedores Docker) |

## Arquitectura y entrenamiento

El sistema no sigue una arquitectura de red neuronal ni se ha entrenado con datos. Su arquitectura es de tres runtimes coordinados: un sandbox WASM que ejecuta Pyodide iPython en el navegador del agente (puerto 8788) con acceso exclusivo a la herramienta Python, sin red y sin escritura en el sistema de archivos; una VM soberana 6502 implementada en Rust (puerto 9090) que gestiona el latido de corazón T0-T10 con temporización de 12 ps por puerta lógica, sellado WORM y recepción de doorbell MMIO; y un puente M5 escrito con Axum (puerto 9091) que expone las rutas `/api/runtime-status`, `/api/doorbell/kick` y `/api/worm/latest` para conectar el sandbox WASM con la VM 6502 mediante sockets Unix. Opcionalmente, un cuarto runtime emula un teléfono Android ARM64 con QEMU y Termux (puerto ADB 5555), comunicado con la VM 6502 a través de doorbell virtio-serial.

La cadena WORM es el elemento central de trazabilidad: cada evento de los tres runtimes se sella con SHA-256 en un fichero JSONL append-only en `/sovereign/worm/chain.jsonl`, encadenando cada hash con el anterior desde el bloque génesis. La constante soberana θ = 89/2462 se inyecta en el sandbox WASM como `THETA` y la VM 6502 la usa para la alineación de fase TDMA. No existe proceso de entrenamiento ni ajuste de pesos; el proyecto se distribuye como código fuente con Docker Compose para despliegue.

## Capacidades

- Ejecución aislada de código Python del agente dentro de un sandbox WASM sin acceso a red ni escritura en el sistema de archivos.
- Sellado inmutable de eventos mediante cadena WORM con SHA-256, con consulta del último sello vía `GET /api/worm/latest`.
- Control de plano soberano mediante VM 6502 con latidos T0-T10 y recepción de doorbell MMIO desde el agente o desde el emulador ARM64.
- Interfaz HTTP del puente M5 para consultar estado del runtime y disparar el doorbell (`/api/runtime-status`, `/api/doorbell/kick`).
- Emulación opcional de teléfono Android ARM64 completo con QEMU y Termux, accesible por ADB en `localhost:5555`.
- Inyección de la constante soberana θ = 89/2462 en todos los entornos de ejecución Python.
- Supervisión en tiempo real de la cadena WORM mediante `tail -f` en el contenedor Docker.

## Casos de uso

- Auditoría de ejecución de agentes autónomos: cada ejecución de código, latido de la VM y evento del puente se sella en la cadena WORM, lo que permite reconstruir el historial completo de acciones de un agente con integridad criptográfica.
- Sandbox seguro para agentes de código: el agente puede ejecutar Python sin riesgo de exfiltración de datos ni modificación del sistema, gracias al aislamiento WASM sin red ni escritura.
- Orquestación de agentes con plano de control soberano: la VM 6502 actúa como árbitro de temporización y sellado, útil en sistemas multi-agente donde se requiere un componente de confianza independiente del agente.
- Entorno de pruebas para agentes móviles: la opción QEMU ARM64 permite simular un teléfono Android completo con Termux, ideal para validar agentes que interactúan con el sistema operativo móvil sin hardware físico.
- Trazabilidad de eventos en pipelines CI/CD: el patrón WORM append-only puede integrarse en flujos de integración continua para registrar cada paso de despliegue o ejecución de pruebas de forma inmutable.
- Investigación en seguridad de agentes: el diseño de aislamiento por capas (WASM, VM 6502, contenedor Docker) sirve como banco de pruebas para estudiar vectores de ataque y mecanismos de contención en sistemas de agentes autónomos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no es un modelo de aprendizaje automático, por lo que no existen métricas estándar como MMLU, HumanEval o GSM8K. El único indicador técnico documentado es la temporización del latido de la VM 6502, especificada en 12 ps por puerta lógica.

## Requisitos de hardware

- Docker con Docker Compose para el despliegue recomendado de los tres runtimes (WASM, 6502 VM y puente M5).
- Puertos expuestos: 8788 (sandbox WASM), 9090 (VM 6502), 9091 (puente M5) y 5555 (ADB, solo si se activa la opción QEMU).
- La opción QEMU ARM64 requiere recursos adicionales de CPU y RAM para emular un dispositivo Android completo; no se especifican requisitos mínimos en la documentación.
- No requiere GPU: la carga es de entrada/salida y emulación, no de cómputo de redes neuronales.
- Opciones de despliegue: contenedores Docker con `docker-compose up --build`, scripts de inicio `scripts/dual-runtime-start.sh` y `qemu/launch-phone.sh` para la opción móvil.
- El sandbox WASM se ejecuta en el navegador del cliente, por lo que el servidor solo necesita servir los estáticos y gestionar las APIs del puente M5.

## Comparativa con modelos similares

No disponible. Sovereign Dual Runtime no pertenece a la categoría de modelos de lenguaje o de generación de texto, por lo que no existe una comparativa directa con modelos como Llama, Mistral o Qwen. En el ámbito de infraestructura para agentes, el proyecto comparte filosofía con frameworks como LangGraph o AutoGen, pero no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA generativa: no genera texto, código ni respuestas; es exclusivamente una infraestructura de ejecución para agentes.
- La licencia BSL-1.1 no es de código abierto convencional: impone restricciones de uso comercial hasta la fecha de cambio a licencia permisiva, que no se especifica en la documentación.
- El proyecto está en fase inicial: cero descargas y cero interacciones en HuggingFace, lo que sugiere ausencia de validación externa y posibles errores no detectados.
- No hay documentación sobre seguridad auditada: los claims de aislamiento (sin red, sin escritura) no están respaldados por pruebas de penetración publicadas.
- La dependencia de Pyodide limita el sandbox a Python; los agentes que requieran otros lenguajes no podrán ejecutarse en el entorno WASM.
- La cadena WORM crece de forma lineal y sin rotación: en despliegues prolongados con alta frecuencia de eventos, el fichero `chain.jsonl` puede crecer sin límite.
- La constante θ = 89/2462 y el concepto de "sovereign VM" carecen de justificación técnica documentada más allá de la propia model card; se recomienda cautela antes de adoptar el sistema en producción.
- La opción QEMU ARM64 implica un consumo significativo de recursos y una superficie de ataque adicional (ADB expuesto en el puerto 5555).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/sovereign-dual-runtime
- Arquitectura del kernel soberano: https://github.com/SNAPKITTYWEST/sovereign-agent-kernel
- Hipervisor ARM64 con motor M5: https://github.com/SNAPKITTYWEST/sovereign-hypervisor-arm64
