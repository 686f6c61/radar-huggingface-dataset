# mtg-kernel/archon-2-pauper

## Resumen

Archon 2 (identificador interno `c12`) es una red de política y valor para jugar a Magic: The Gathering en el formato Pauper, desarrollada por el proyecto mtg-kernel. Se trata de un modelo de aprendizaje por refuerzo de aproximadamente 1,23 millones de parámetros que opera sobre el motor de reglas open source mtg-kernel, y que fue entrenado desde inicialización aleatoria usando únicamente la señal terminal de victoria o derrota como recompensa, sin datos humanos ni imitación de bots heurísticos.

El modelo pertenece a la primera generación de redes de la familia Archon y corresponde a la fase 1, linaje c, bloque 12, tras 4.000 pasos de optimizador. Su relevancia radica en que demuestra que el aprendizaje por refuerzo puro puede producir políticas competitivas en un juego de cartas complejo con reglas abiertas, aunque su nivel de juego queda por debajo de otras entradas de la misma familia y de bots no aprendidos.

No es un modelo de lenguaje: no procesa ni genera texto, no tiene ventana de contexto en el sentido habitual y no soporta tool calling ni capacidades multilingües. Es un artefacto especializado de investigación en IA para juegos, empaquetado como checkpoint de entrenamiento (pesos más estado de Adam) y evaluado en el banco Spellbench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor (`kernel-policy-value-net-8`), tamaño oculto 64, embeddings de carta de 16 dimensiones |
| Parametros totales | ~1,23 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de política sobre estado de juego, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato float32 little-endian, `parameters.f32le`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Checkpoint JSON con pesos y estado de Adam (`993373f3e107e31f4be2ca0f368d2b1dd69b8088e59a81ea8257776c5bbc6abf.json`) y `parameters.f32le`; configuración del scorer en `weights/c12.scorer.json` |

## Arquitectura y entrenamiento

La arquitectura es una red de política y valor (`kernel-policy-value-net-8`) con tamaño oculto de 64 y embeddings de carta de 16 dimensiones, que consume el estado del juego expuesto por el motor mtg-kernel y produce una distribución softmax sobre acciones junto con una estimación de valor. No se trata de un transformer ni de un modelo de lenguaje: es una red específica para el espacio de acciones del juego.

El entrenamiento se realizó por refuerzo desde inicialización aleatoria (semilla `engineering-fresh-initialization-002-b`), con la victoria o derrota terminal como única recompensa, sin datos de partidas humanas ni imitación de bots heurísticos. Se completaron 4.000 pasos de optimizador y los mazos de entrenamiento fueron los ocho mazos de tablero más Terror. La entrada calificada en Spellbench es solo política: muestrea de la softmax de la red (`sampled-wide-v1`) sin búsqueda.

## Capacidades

- Jugar partidas de Magic: The Gathering en el formato Pauper sobre el motor mtg-kernel.
- Seleccionar acciones mediante muestreo de la distribución softmax de la política, sin búsqueda ni planificación explícita.
- Estimar el valor de estados del juego a través de la cabeza de valor de la red.
- Operar con los ocho mazos de tablero y el mazo Terror usados en entrenamiento.
- Integración con el ecosistema Spellbench mediante el scorer y el bridge del motor.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a juegos: sirve como punto de partida y referencia para estudiar la evolución de políticas entrenadas desde cero en un dominio con reglas complejas.
- Evaluación comparativa de bots: puede enfrentarse en Spellbench contra otros modelos de la familia Archon, Basilisk u bots no aprendidos para calibrar el progreso del proyecto.
- Reproducción de experimentos: el checkpoint completo (pesos y estado de Adam) permite reanudar o auditar el entrenamiento en el motor y el commit exactos indicados por el autor.
- Desarrollo y validación del motor mtg-kernel: la red actúa como carga de trabajo realista para probar el bridge, el scorer y el catálogo de cartas.
- Docencia y divulgación: un modelo de 1,23 millones de parámetros es manejable para explicar conceptos de política y valor, recompensas terminales y evaluación Elo en un entorno controlado.
- Línea base para nuevas variantes: al estar calificado con 1.211,2 Elo, permite medir mejoras de versiones posteriores o de cambios en el diseño de recompensas y arquitectura.

## Benchmarks y rendimiento

Spellbench `pauper-kernel-v2`, tablero con instantánea del 2026-10-28, anclado de modo que el bot aleatorio uniforme equivale a 1000 Elo. Este modelo jugó 896 partidas calificadas.

| Entrada | Elo (IC 95%) |
|---|---|
| Basilisk 1 (red posterior de mtg-kernel) | 1431,0 (1350,1 a 1521,2) |
| Archon 3 (g115) | 1381,1 (1315,4 a 1462,7) |
| gorge-ar8 (bot no aprendido) | 1259,6 (1181,2 a 1348,6) |
| Archon 2 (c12) | 1211,2 (1150,9 a 1287,9) |
| Archon 1 (a48) | 1178,7 (1114,4 a 1254,0) |

## Requisitos de hardware

- Almacenamiento: alrededor de 1 GB de disco para el repositorio, el motor y el banco.
- Compilación del motor: el autor reporta 8 minutos de build en 4 núcleos con Rust 1.94.1 y Visual Studio Build Tools con la carga de trabajo "Desktop development with C++".
- CPU: no se especifican requisitos mínimos; la inferencia es una red de 1,23 millones de parámetros y no requiere GPU en los pasos documentados.
- GPU recomendadas: no disponible; no se documenta uso de GPU para la entrada calificada.
- Compatibilidad con GPU de consumo: no disponible; no se documenta.
- Despliegue: el procedimiento verificado es Windows 11 x86_64 con Git Bash, Python 3.11 o superior, y los binarios `agent_bridge_v1`, `spellbench_scorer_v1` y `spellbench_kernel_catalog` compilados desde mtg-kernel en el commit `92ec2393db34bea805a85991163458b9ff890f57`. Otras plataformas no han sido probadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Elo (Spellbench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Archon 2 (c12) | ~1,23 M | no aplica | 1211,2 (1150,9 a 1287,9) | MIT | Público en Hugging Face |
| Archon 3 (g115) | no disponible | no aplica | 1381,1 (1315,4 a 1462,7) | no disponible | no disponible |
| Archon 1 (a48) | no disponible | no aplica | 1178,7 (1114,4 a 1254,0) | no disponible | no disponible |
| Basilisk 1 | no disponible | no aplica | 1431,0 (1350,1 a 1521,2) | no disponible | No público (el proyecto publica todo excepto su modelo líder actual) |
| gorge-ar8 (bot no aprendido) | no disponible | no aplica | 1259,6 (1181,2 a 1348,6) | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito muy restringido: solo juega Pauper con los mazos de entrenamiento (ocho mazos de tablero más Terror); no es un modelo de propósito general ni un modelo de lenguaje.
- Nivel de juego limitado: con 1211,2 Elo queda por debajo de Archon 3, de Basilisk 1 y del bot no aprendido gorge-ar8.
- Entrada calificada solo política: muestrea de la softmax (`sampled-wide-v1`) sin búsqueda, lo que limita la calidad de decisión frente a enfoques con planificación.
- Reproducibilidad frágil: requiere el motor en el commit exacto, el catálogo con hash `af8e1b914d76ed6d30318403c6d434fc4d3a651a68d7e37c79c9d09c68cc457e` y la comprobación de estado del modelo `5c14c025e3cc87fb2c3eea28e1dbd770d7d257344174296d6259020f720da9de`; los binarios compilados no serán idénticos byte a byte a los calificados.
- Plataforma verificada únicamente en Windows 11 x86_64 con Git Bash; otras plataformas no han sido probadas y los ficheros de configuración contienen rutas absolutas de otra máquina que deben corregirse.
- Los pasos de ejecución de la model card fueron verificados de extremo a extremo para Basilisk 1, no para este paquete, cuyo chequeo de carga se repitió el 2026-11-07.
- Repositorio de 0,0 GB y sin descargas ni likes en el momento de la consulta; el ecosistema y la comunidad en torno al modelo son mínimos.
- Contenido no oficial: no está afiliado, respaldado ni patrocinado por Wizards of the Coast; Magic: The Gathering y los nombres de cartas son marcas de Wizards of the Coast.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan garantías ni sesgos; al ser un modelo de juego, el riesgo de alucinación no aplica en el sentido habitual, aunque sí puede tomar decisiones subóptimas o inválidas según el estado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mtg-kernel/archon-2-pauper
- Motor mtg-kernel: https://github.com/jackmaiorino/mtg-kernel
- Commit del motor usado: https://github.com/jackmaiorino/mtg-kernel/commit/92ec2393db34bea805a85991163458b9ff890f57
- Spellbench: https://github.com/jackmaiorino/spellbench
- Datos del tablero pauper-kernel-v2: https://github.com/jackmaiorino/spellbench/tree/main/benchmarks/pauper-kernel-v2
- Rustup: https://rustup.rs
- Git for Windows: https://git-scm.com/download/win
- Constructor de mazos Pauper con IA (resultado de búsqueda, no relacionado directamente con el modelo): https://tutorman.dev/deck-builder/pauper
