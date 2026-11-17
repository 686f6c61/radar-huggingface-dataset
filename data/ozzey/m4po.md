# Ozzey/M4PO

## Resumen

M4PO (Massively Multi-Task Multi-Embodiment Model-Based Policy Optimization) es un algoritmo de aprendizaje por refuerzo basado en modelo, diseñado para entrenar políticas que operen simultáneamente sobre un gran conjunto de tareas y morfologías robóticas. Este repositorio, publicado por el autor Ozzey bajo licencia MIT, contiene el checkpoint `m4po_4M`, resultado de un entrenamiento sobre las 200 tareas y 48 morfologías (embodiments) del benchmark MMBench, con 4 millones de pasos de entorno ejecutados en línea tras un preentrenamiento por demostración de 200.000 actualizaciones.

El modelo no es un modelo de lenguaje: es una política de control con 33,3 millones de parámetros, dimensión de estado 128, dimensión de acción 16 y anchura de encoder/MLP de 768, con latentes separados de tarea y cuerpo de 256 dimensiones. Emplea cinco funciones Q y entrena en modo off-policy con 200 entornos paralelos y tamaño de lote de 1024. Su relevancia reside en que aborda el problema del entrenamiento multi-tarea y multi-morfología en robótica desde un único conjunto de pesos, una línea de investigación activa para reducir el coste de entrenar políticas específicas por robot y tarea.

El checkpoint es explícitamente parcial: cubre 4.000.000 de los 100.000.000 de pasos planificados y está marcado con `training_complete: false`. Se detuvo al agotarse el presupuesto de entrenamiento del trabajo que lo generó, pero es reanudable e incluye el búfer de repetición (replay buffer) y el estado de reanudación, lo que permite continuar el entrenamiento desde el punto de guardado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Algoritmo de RL basado en modelo (model-based), off-policy, multi-tarea y multi-morfologia; encoder/MLP de anchura 768 con latentes de tarea y cuerpo |
| Parametros totales | 33,3 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; dimensión de estado 128 y de acción 16) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch); fichero `m4po_4M.pt` de 5.148.291.444 bytes |

## Arquitectura y entrenamiento

M4PO es un algoritmo de optimización de política basado en modelo para entornos con muchas tareas y muchas morfologías. La política se implementa como una red con encoder y MLP de anchura 768, que consume estados de dimensión 128 y produce acciones de dimensión 16. El modelo mantiene latentes de 256 dimensiones tanto para la tarea como para el cuerpo (embodiment), lo que permite condicionar la política en ambos factores de forma desacoplada. El aprendizaje es off-policy y emplea cinco funciones Q, con 200 entornos paralelos y un tamaño de lote de 1024. El esquema del algoritmo es `m4po` con `implementation_id=m4po_multitask_multiembodiment`, esquema 3.

El entrenamiento consta de dos fases: un preentrenamiento por demostración de 200.000 actualizaciones, tras el cual el checkpoint alcanza una puntuación media de 0,0965 y un retorno medio de 226,4, seguido de entrenamiento en línea. En este repositorio se han completado 4.000.000 de pasos de entorno de los 100.000.000 planificados, lo que supone el 4 % del total previsto. El checkpoint se guardó con pesos, optimizadores, búfer de repetición y estado de reanudación. La configuración completa está en `config_resolved.yaml` y los hashes de configuración, catálogo, código fuente y checkpoint inicial en `launch_manifest.json`.

## Capacidades

- Control robótico multi-tarea: una única política entrenada sobre las 200 tareas de MMBench.
- Control multi-morfología: soporte de 48 morfologías (embodiments) distintas mediante latentes de cuerpo.
- Aprendizaje por refuerzo off-policy basado en modelo con cinco funciones Q.
- Preentrenamiento por demostración seguido de entrenamiento en línea reanudable.
- Reanudación del entrenamiento desde checkpoint, incluyendo búfer de repetición y estado de optimizadores.
- Evaluación estandarizada mediante `m4po-benchmark --checkpoint m4po_4M.pt`.
- No dispone de capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión, tool calling ni agentes conversacionales.

## Casos de uso

- Investigación en RL multi-tarea: servir como punto de partida reanudable para continuar el entrenamiento hasta los 100.000.000 de pasos planificados, aprovechando el búfer de repetición incluido en el checkpoint.
- Reproducción de resultados: ejecutar `m4po-benchmark` sobre las 200 tareas de MMBench para verificar las puntuaciones publicadas (0,1677 de puntuación media y 324,3 de retorno medio a 4.000.000 de pasos).
- Estudio de generalización entre morfologías: analizar cómo los latentes de cuerpo de 256 dimensiones permiten a una sola política adaptarse a 48 embodiments distintos.
- Comparación de algoritmos de RL basados en modelo: usar el checkpoint como referencia inicial en experimentos que comparen M4PO con otras variantes sobre el mismo benchmark.
- Ajuste fino por tarea: partir de los pesos preentrenados y especializar la política en un subconjunto de tareas o morfologías con menor coste que entrenar desde cero.
- Desarrollo de infraestructura de entrenamiento distribuido: emplear la configuración resuelta (200 entornos paralelos, lote de 1024) como base para escalar el cómputo en clústeres.
- Docencia y divulgación: ilustrar un pipeline completo de RL basado en modelo con preentrenamiento por demostración, entrenamiento en línea y evaluación estandarizada.

## Benchmarks y rendimiento

Evaluación sobre 400 episodios (2 por tarea) según la model card:

| Paso | Puntuación media | Retorno medio |
|---:|---:|---:|
| 0 (tras preentrenamiento por demostración) | 0,0965 | 226,4 |
| 2.000.000 | 0,1288 | 256,8 |
| 4.000.000 | 0,1677 | 324,3 |

La puntuación se define como la media de las puntuaciones medias por tarea. No se han publicado comparaciones con otros modelos o algoritmos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint completo ocupa 5,1 GB en disco porque incluye pesos, optimizadores, búfer de repetición y estado de reanudación, no solo los pesos de la política.
- GPU recomendadas: no disponibles en la información proporcionada. El entrenamiento emplea 200 entornos paralelos y lote de 1024, lo que en la práctica requiere aceleradores con memoria suficiente para el búfer y los optimizadores; no se especifican modelos concretos.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante `M4POAgent.load` del repositorio https://github.com/Ozzey/M4PO (rama `main`, commit `bba42f6`); requiere el checkout de NEWT MMBench (`git submodule update --init external/newt` o variable `M4PO_NEWT_ROOT`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado en la información disponible comparaciones con otros algoritmos o checkpoints de RL multi-tarea y multi-morfología. Los datos propios del checkpoint son:

| Modelo | Parámetros | Tareas | Morfologías | Licencia | Estado |
|---|---|---|---|---|---|
| M4PO `m4po_4M` | 33,3 M | 200 | 48 | MIT | Parcial (4M/100M pasos) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint parcial: solo se han completado 4.000.000 de los 100.000.000 de pasos planificados (`training_complete: false`); el rendimiento está lejos del objetivo final.
- Puntuación media baja en términos absolutos (0,1677 a 4M pasos), lo que refleja un estado de entrenamiento temprano.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes conversacionales.
- Requiere el checkout específico de NEWT MMBench y la versión concreta del código (`main`, commit `bba42f6`); otras versiones pueden no cargar el checkpoint.
- El fichero de 5,1 GB incluye búfer de repetición y optimizadores, por lo que no es directamente utilizable como pesos de inferencia ligeros sin extraer la política.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por tratarse de una política de control; estos conceptos no aplican.
- Licencia MIT: permite uso comercial y modificación, pero no se especifican garantías ni condiciones adicionales más allá de las de la propia licencia.
- Verificar la integridad tras la descarga con `sha256sum m4po_4M.pt` (hash `066387a6047ac6f2f5a84cab9bb94ee6b5a4b0d3654003c8e7e7492cfae15f61`).

## Enlaces

- Hugging Face: https://huggingface.co/Ozzey/M4PO
- Repositorio de código: https://github.com/Ozzey/M4PO
- Benchmark MMBench (NEWT): incluido como submódulo `external/newt` en el repositorio de código
- Paper, blog o demo: no disponibles en la información proporcionada
