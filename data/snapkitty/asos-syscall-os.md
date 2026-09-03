# Snapkitty/asos-syscall-os

## Resumen
El repositorio `Snapkitty/asos-syscall-os` no contiene un modelo de inteligencia artificial, sino un proyecto de sistema operativo experimental denominado ASOS (Agentic Syscall Operating System). Desarrollado por Ahmad Ali Parr bajo el colectivo SnapKitty, propone sustituir la tabla de llamadas al sistema (syscalls) de un kernel Linux por una capa dinámica de "intenciones" (intents) que son evaluadas por agentes dentro del núcleo. En lugar de comandos imperativos como `read` o `write`, las aplicaciones envían paquetes de intención que el kernel negocia y resuelve. El proyecto se encuentra en fase 1 de un plan de 5 fases, con un módulo de kernel en C, un runtime orquestador en Haskell y verificación formal prevista en Lean 4 y Agda. Su relevancia radica en explorar arquitecturas de sistema operativo "agentivas", donde la toma de decisiones se delega a componentes inteligentes dentro del kernel, con sellado criptográfico de transiciones de estado y aceleración opcional mediante NPU/FPGA. No se trata de un modelo con pesos ni parámetros, por lo que las especificaciones típicas de un LLM no aplican.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Sistema operativo con módulo de kernel en C (Ring 0), runtime en Haskell, verificación formal en Lean/Agda |
| Parametros totales | no aplica (no es un modelo neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (el código y la documentación están en inglés y árabe) |
| Licencia | Sovereign Source License (propietaria, todos los derechos reservados a Ahmad Ali Parr / SnapKitty Collective) |
| Formato de pesos | no aplica (repositorio de código fuente) |

## Arquitectura y entrenamiento
ASOS no es un modelo entrenado; es un diseño de sistema operativo. Su arquitectura se compone de un módulo de kernel en C que gestiona un ring buffer de memoria compartida zero-copy, un trap de syscall personalizado (número 450) y un Kernel Agent Runtime (KAR) que enruta las intenciones hacia subsistemas nativos o aceleradores NPU. El runtime en Haskell implementa un negociador de recursos, un motor de políticas y estrategias de recuperación de errores. No existe proceso de entrenamiento con datos, sino un plan de construcción por fases: actualmente la fase 1 (fundación) está en progreso, con estructuras de payload de intención y el scaffold del syscall completados, pero sin pruebas de seguridad ni auditoría de privilegios. La innovación clave es el cambio de paradigma de "comandos" a "intenciones": las aplicaciones describen qué quieren lograr, y el kernel negocia cómo hacerlo, con sellado criptográfico WORM (Write Once Read Many) en cada transición de estado para garantizar auditoría completa y reproducibilidad determinista.

## Capacidades
- Gestión de intenciones: las aplicaciones envían payloads de intención que el kernel evalúa y resuelve, en lugar de invocar syscalls directas.
- Negociación de recursos: el runtime Haskell decide cómo asignar recursos del sistema basándose en políticas definidas.
- Recuperación autónoma: los agentes del kernel intentan reparar estados erróneos o degradar el sistema de forma controlada sin provocar caídas.
- Sellado criptográfico: cada transición de estado se firma criptográficamente, permitiendo auditoría completa y reproducibilidad.
- Aceleración por hardware: los agentes del kernel pueden ser enrutados a NPU/FPGA para inferencia en tiempo real.
- Sin capacidades de generación de texto, visión, tool calling ni razonamiento lingüístico, al no ser un modelo de IA.

## Casos de uso
- Investigación en sistemas operativos agentivos: permite estudiar cómo un kernel puede delegar decisiones a agentes, evaluando la viabilidad de sustituir syscalls por intents.
- Prototipado de kernels con verificación formal: la fase 5 prevé pruebas en Lean 4 y Agda, útil para entornos donde la corrección matemática es crítica (aeronáutica, finanzas).
- Sistemas embebidos con NPU: al poder enrutar agentes a aceleradores, podría adaptarse a dispositivos con hardware de inferencia dedicado para gestión de recursos en tiempo real.
- Auditoría y trazabilidad de operaciones: el sellado criptográfico de transiciones de estado ofrece un registro inmutable de todas las acciones del sistema, aplicable a cumplimiento normativo.
- Educación en diseño de SO: como proyecto de código abierto (aunque con licencia restrictiva), sirve como ejemplo de arquitectura híbrida C/Haskell en el núcleo.
- Desarrollo de políticas de recuperación de errores: el motor de políticas en Haskell puede inspirar implementaciones de tolerancia a fallos en otros sistemas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El proyecto está en fase 1 con 0/12 pruebas pasando y 0% de cobertura, por lo que no existen métricas de rendimiento ni comparativas con otros sistemas.

## Requisitos de hardware
- Kernel Linux 5.15 o superior con soporte para módulos personalizados.
- Compilador GCC 11+ o Clang 14+ para el módulo de kernel y la librería de usuario.
- GHC 9.4+ para el runtime Haskell.
- Lean 4.8+ y Agda para la fase de verificación formal (fase 5).
- Arquitectura x86_64 o ARM64; NPU opcional para aceleración de agentes.
- No se requieren GPUs ni VRAM, ya que no es un modelo de inferencia.
- Para ejecución de pruebas: entorno de desarrollo con permisos de root para cargar módulos de kernel.

## Comparativa con modelos similares
No disponible. ASOS no es un modelo de IA y no existen sistemas operativos comparables en el ecosistema de HuggingFace. Los proyectos de SO tradicionales (Linux, seL4) no utilizan agentes con intents, por lo que no hay una categoría directa de comparación.

## Limitaciones y advertencias
- Proyecto en estado muy temprano: fase 1 de 5, sin pruebas de seguridad ni auditoría de privilegios completados.
- Licencia propietaria (Sovereign Source License) que restringe el uso, modificación y distribución; no es de código abierto convencional.
- No es un modelo de IA: no ofrece generación de texto, razonamiento ni ninguna capacidad de procesamiento de lenguaje natural.
- Riesgo de alucinación: no aplica al no ser un modelo generativo, pero el diseño de "agentes" en el kernel podría tomar decisiones impredecibles si las políticas no están bien definidas.
- Dependencia de hardware específico (NPU/FPGA) para la aceleración prometida; sin ella, el rendimiento de los agentes podría ser limitado.
- La documentación está en árabe e inglés; no hay soporte oficial en castellano.
- El repositorio no muestra actividad de mantenimiento (última actualización el 3 de septiembre de 2026) y tiene 0 descargas y 0 likes, lo que sugiere baja adopción.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/asos-syscall-os
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
