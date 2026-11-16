# mtg-kernel/basilisk-1-pauper

## Resumen

Basilisk 1 (`oh2-r2s1-b512`) es una red de política y valor para jugar a Magic: The Gathering en el formato Pauper, desarrollada por el proyecto mtg-kernel. Se trata de un modelo de aprendizaje por refuerzo puro, entrenado desde una inicialización aleatoria sin datos de partidas humanas ni imitación de bots heurísticos, que opera sobre el motor de reglas open source mtg-kernel. Con 1.230.994 parámetros, es un modelo deliberadamente pequeño y especializado: no es un LLM, sino una red neuronal que evalúa acciones legales en un estado de juego codificado y estima la probabilidad de victoria.

El modelo recibe una codificación del estado del juego desde la perspectiva del jugador activo (mano propia, ambos campos de batalla, cementerios, exilio, pila, totales de vida y tamaños de biblioteca), puntúa cada acción legal (lanzar, activar, atacar, bloquear, elegir objetivo, pasar) y devuelve una estimación de la probabilidad de ganar. No tiene memoria de turnos anteriores, por lo que cada decisión se toma únicamente con la información del estado actual.

Su relevancia radica en que demuestra que el aprendizaje por refuerzo desde cero, con recompensa únicamente terminal (victoria o derrota), puede superar a bots heurísticos y a versiones anteriores de la misma familia en un dominio de reglas complejas como Pauper. En la tabla de clasificación Spellbench `pauper-ladder-v2` alcanza 1503.8 Elo (IC 95%: 1450.5–1563.7), por encima del bot heurístico integrado (1179.7) y de Archon 3 (1416.0), aunque por debajo de Basilisk 2, la red posterior no publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `kernel-policy-value-net-8` (red de política y valor, hidden size 64, embeddings de carta de 16 dimensiones) |
| Parametros totales | 1.230.994 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (sin memoria de turnos; estado de juego codificado por decisión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoint de entrenamiento completo (pesos más estado de Adam); formato de fichero no especificado en la información disponible |

## Arquitectura y entrenamiento

La arquitectura es una red de política y valor (`kernel-policy-value-net-8`) con tamaño oculto de 64 y embeddings de carta de 16 dimensiones. En cada decisión, el motor proporciona una codificación del estado observable por el jugador activo (mano propia, ambos campos de batalla, ambos cementerios, exilio, pila, totales de vida y tamaños de biblioteca); la mano y el orden de la biblioteca del oponente no se muestran. La red puntúa todas las acciones legales y devuelve además una estimación de la probabilidad de victoria. No dispone de memoria de turnos anteriores.

El entrenamiento es aprendizaje por refuerzo desde una inicialización aleatoria con semilla, usando únicamente la recompensa terminal de victoria o derrota. No se emplearon datos de partidas humanas ni imitación de bots heurísticos. Las partidas se jugaron contra una mezcla de: la propia red actual (30%), un checkpoint fijo anterior de la misma familia (50%) y un checkpoint separado de aprendizaje por refuerzo anterior (20%). Se entrenó con nueve barajas de Pauper (Wildfire, Rally, Affinity, Elves, Spy, Burn, CawGates, Faeries y Terror), en ambos asientos, diez partidas por actualización, ventajas GAE (gamma 1, lambda 0.9), coeficiente de valor 0.5, entropía 0 y tasa de aprendizaje 1e-4. Este checkpoint corresponde a 118.584 pasos de optimizador.

## Capacidades

- Selección de acciones legales en Pauper: lanzar hechizos, activar habilidades, atacar, bloquear, elegir objetivos y pasar.
- Estimación de la probabilidad de victoria a partir del estado observable del juego.
- Juego sin búsqueda (policy-only): la entrada clasificada muestrea de la softmax de la red (`sampled-wide-v1`); también admite selección argmax (`argmax-first-v1`) con los mismos pesos.
- Funcionamiento en ambos asientos de la mesa.
- Cobertura de nueve arquetipos de Pauper en entrenamiento (Wildfire, Rally, Affinity, Elves, Spy, Burn, CawGates, Faeries y Terror).
- Sin capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni agentes multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Evaluación de agentes de RL en dominios de reglas complejas: sirve como referencia reproducible para comparar algoritmos de aprendizaje por refuerzo en un juego de cartas con estado parcialmente observable, usando el motor mtg-kernel y Spellbench.
- Benchmark de bots de Magic: integrado en la tabla `pauper-ladder-v2` de Spellbench, permite clasificar nuevos agentes contra un Elo anclado al bot aleatorio uniforme (1000 Elo).
- Investigación en auto-juego y curriculum implícito: el esquema de mezcla de oponentes (self-play, checkpoint fijo y checkpoint RL separado) puede replicarse para estudiar estabilidad del entrenamiento en dominios de dos jugadores.
- Desarrollo de motores de reglas: al ser un consumidor del motor mtg-kernel, sirve para validar la corrección de la codificación de estados y de la enumeración de acciones legales en Pauper.
- Análisis de estrategia asistido: la red puede emplearse para puntuar acciones en estados concretos y estudiar qué líneas de juego favorece en cada arquetipo, siempre que se disponga del motor y del codificador de estado.
- Base para ajuste fino posterior: al publicarse el checkpoint completo con estado de Adam, puede reutilizarse como punto de partida para entrenar variantes (por ejemplo, Basilisk 2 se entrenó a partir de este modelo).
- Docencia y divulgación: ejemplo compacto (1,2 M de parámetros) de pipeline completo de RL desde cero con recompensa terminal y evaluación Elo.

## Benchmarks y rendimiento

Spellbench `pauper-ladder-v2`, evaluación 2.1.0, ejecución clasificada del 2026-11-15, anclada de modo que el bot aleatorio uniforme vale 1000 Elo.

| Entrante | Elo (IC 95%) | Partidas |
|---|---|---|
| Basilisk 2 (red posterior de mtg-kernel, no pública) | 1666.0 (1600.8–1739.0) | 384 |
| **Basilisk 1 (este modelo, muestreado)** | **1503.8 (1450.5–1563.7)** | 640 |
| Basilisk 1, mismos pesos, selección argmax | 1503.6 (1444.6–1566.9) | 512 |
| Archon 3 (g115) | 1416.0 (1363.0–1473.9) | 768 |
| gorge-ar8 (bot no aprendido) | 1312.8 (1266.2–1362.3) | 768 |
| Archon 2 (c12) | 1261.9 (1213.9–1312.6) | 640 |
| heuristic (integrado en Spellbench) | 1179.7 (1134.3–1227.0) | 512 |
| uniform (ancla) | 1000.0 | 384 |

Enfrentamientos directos: 78 victorias frente a 50 contra Archon 3, 103 frente a 25 contra Archon 2 y 31 frente a 97 contra Basilisk 2. Las filas de muestreo y argmax usan los mismos pesos y no son distinguibles entre sí (65 a 63 en sus partidas directas). Estos Elo pertenecen a la escala propia de esta tabla y no son comparables con clasificaciones de otras tablas ni de otras versiones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo tiene 1.230.994 parámetros y el checkpoint incluye estado de Adam, pero no se publican requisitos de memoria.
- GPU recomendadas: no disponible; el procedimiento documentado no menciona GPU.
- ¿Cabe en GPU de consumo? No se especifica, aunque por tamaño (unos 1,2 M de parámetros) es presumiblemente apto para hardware muy modesto; no hay confirmación en la información disponible.
- Opciones de despliegue: el modelo no se sirve como un LLM; se ejecuta a través del motor mtg-kernel (Rust) y del scorer de Spellbench. Pasos documentados: compilar `agent_bridge_v1`, `spellbench_scorer_v1` y `spellbench_kernel_catalog`, generar el catálogo `pauper-v2-catalog.json` y ejecutar el scorer.
- Plataforma verificada: Windows 11 x86_64 con Git Bash; otras plataformas no probadas.
- Requisitos de build: Rust 1.94.1 (vía rustup), Visual Studio Build Tools con la carga de trabajo «Desktop development with C++», Python 3.11 o superior en el PATH, y aproximadamente 1 GB de disco. La compilación tardó 8 minutos en 4 núcleos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Elo (pauper-ladder-v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Basilisk 1 | Red de política y valor (RL) | 1.230.994 | Sin memoria de turnos | 1503.8 | MIT | Pública en Hugging Face |
| Basilisk 2 | Red de política y valor (RL) | no disponible | no disponible | 1666.0 | no disponible | No pública |
| Archon 3 (g115) | Red de política y valor (RL) | no disponible | no disponible | 1416.0 | no disponible | Pública (mtg-kernel/archon-3-pauper) |
| Archon 2 (c12) | Red de política y valor (RL) | no disponible | no disponible | 1261.9 | no disponible | Pública (mtg-kernel/archon-2-pauper) |
| heuristic (Spellbench) | Bot heurístico | no aplica | no aplica | 1179.7 | no disponible | Integrado en Spellbench |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos; al entrenarse solo con nueve barajas de Pauper, su comportamiento puede estar sesgado hacia esos arquetipos y no generalizar a otras barajas o formatos.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la red puede producir estimaciones de probabilidad de victoria mal calibradas y elecciones de acción subóptimas en estados poco representados en entrenamiento.
- Limitaciones de contexto e idioma: no tiene memoria de turnos anteriores; cada decisión usa únicamente el estado actual. La mano y el orden de la biblioteca del oponente no se muestran, por lo que opera con información parcial. No es un modelo de lenguaje y no soporta idiomas.
- Restricciones de licencia: licencia MIT, que permite uso comercial; sin embargo, se trata de contenido no oficial de fan, no afiliado ni patrocinado por Wizards of the Coast, y Magic: The Gathering y los nombres de cartas son marcas de Wizards of the Coast.
- Caveats para producción: el procedimiento solo está verificado en Windows 11 x86_64 con Git Bash; otras plataformas no se han probado. La compilación fija Rust 1.94.1 y requiere Visual Studio Build Tools. El movimiento entre commits del motor no se probó (se usó el commit `92ec2393...` para los pasos y la clasificación se jugó en `d11d986d...`, que Spellbench indica que lleva el mismo puente y la misma base de datos y catálogo de cartas). En PowerShell la redirección `>` escribe UTF-16 y rompe el catálogo.
- La entrada clasificada es policy-only, sin búsqueda; el rendimiento puede diferir con otras configuraciones de selección o de evaluación.
- Los Elo son específicos de esta tabla y versión de evaluación y no son comparables con otras escalas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mtg-kernel/basilisk-1-pauper
- Motor mtg-kernel: https://github.com/jackmaiorino/mtg-kernel
- Spellbench: https://github.com/jackmaiorino/spellbench
- Datos de la tabla pauper-ladder-v2 (2026-11-15): https://github.com/jackmaiorino/spellbench/tree/main/benchmarks/pauper-ladder-v2/snapshots/2026-11-15
- Archon 1: https://huggingface.co/mtg-kernel/archon-1-pauper
- Archon 2: https://huggingface.co/mtg-kernel/archon-2-pauper
- Archon 3: https://huggingface.co/mtg-kernel/archon-3-pauper
- Git for Windows: https://git-scm.com/download/win
- rustup: https://rustup.rs
