# jrubiosainz/microduck-game-hillclimber-remix10

## Resumen

`microduck-game-hillclimber-remix10` es un checkpoint derivado del modelo de control `HlibPlakhtii/microduck-hill-quicksilver-v3`, desarrollado por el usuario `jrubiosainz`. Se trata de una política de aprendizaje por refuerzo para el robot cuadrúpedo MicroDuck, empaquetada en formato ONNX y destinada exclusivamente a la competición de simulación "1.5 m Hill Climb" de la Microduck Arena de Pollen Robotics. El modelo base es a su vez un remix de `rumezhak/microduck-hill-remix-leader3`, que a su vez deriva de `a1rb4Ck/microduck-hill-1m5`.

La aportación de este checkpoint no es mejorar la política base, sino añadir una capa de búsqueda por coincidencia exacta de observaciones (*lookup layer*) sobre el `policy.onnx` original, que se conserva byte a byte salvo el renombrado del tensor de salida del último operador a `search2_fallback`. La capa añadida contiene 115 observaciones y acciones almacenadas correspondientes a carreras buscadas con CMA-ES separable sobre los *seeds* oficiales 2, 3, 4 y 5. Cuando la observación entrante coincide con una de las almacenadas (diferencia absoluta máxima inferior a 1e-7 en las columnas de observación, con las columnas de comando 48 a 60 enmascaradas), el modelo reproduce la acción guardada; en caso contrario, delega en la política base.

El resultado es un modelo que replica exactamente el tiempo del base en los cinco *seeds* oficiales (0,738 s de media en el tablero), pero que en los *seeds* 2 a 5 ejecuta trayectorias distintas a partir de un paso de control determinado (paso 30, 32, 32 y 40 respectivamente). Es, por tanto, una variante de comportamiento, no una mejora de rendimiento, y está estrictamente limitada al simulador: el propio autor advierte de que no debe cargarse en un MicroDuck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control por aprendizaje por refuerzo exportada a ONNX, con capa adicional de búsqueda exacta por observación (*lookup layer*) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada de observación con columnas de comando 48 a 60) |
| Tipos de cuantizacion | no disponible (pesos en ONNX, sin cuantización documentada) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

El modelo base es una política de control entrenada mediante aprendizaje por refuerzo para la tarea de escalada de colinas del MicroDuck en la Microduck Arena. La arquitectura interna de la red no se detalla en la información disponible; lo que sí se documenta es que el checkpoint final conserva todos los operadores e inicializadores del `policy.onnx` base (sha256 `3666e08971d5…`, commit `65a137db`, run `01M64HTQ3M877N8G4P5J6P`) sin modificación, salvo el renombrado del tensor de salida del último operador a `search2_fallback`.

El proceso de construcción de este remix consta de tres fases. Primero, una búsqueda por *seed* de tipo *open-loop* sobre los 14 objetivos de servo de cada paso de control, mediante ejecuciones separables de CMA-ES en máquinas virtuales Azure x86-64, con arranque en caliente desde carreras previas del mismo *seed* y re-búsqueda únicamente desde un paso elegido hasta la meta, evaluando cada candidato con una carrera completa en el runner de la Arena (versión 5). Segundo, la grabación de las observaciones y acciones de cada paso de control en el runner oficial (runner versión 5, x86_64, MuJoCo 3.10.0, evento `hill-climb-1m5`, 0,15 m/s), registrando el paso en que cada secuencia difiere por primera vez de la del base. Tercero, el injerto de la capa mediante `mk_hv.py --base policy.onnx --x <filas de cada seed>`, que utiliza la función `overlay` de `search_race.py` del modelo base y valida el resultado con `onnx.checker`; el fichero generado en Azure y en un Mac a partir de las mismas filas es byte a byte idéntico.

Las 115 filas almacenadas se distribuyen así: *seed* 2, pasos de control 30 a 62 (33 filas); *seed* 3, pasos 32 a 61 (30 filas); *seed* 4, pasos 32 a 61 (30 filas); *seed* 5, pasos 40 a 61 (22 filas). Las acciones guardadas difieren de las del base para los mismos pasos en como máximo 564 rad. La capa enmascara las columnas de comando (48 a 60) durante la comparación, de modo que la velocidad comandada solo llega a la política base.

## Capacidades

- Control locomotor de un robot cuadrúpedo MicroDuck en simulación para la tarea de escalada de colina de 1,5 m en la Microduck Arena.
- Replicación exacta de la política base en cualquier observación que no coincida con las 115 filas almacenadas (incluidos los *seeds* 6 a 60 y el *seed* 1).
- Ejecución de trayectorias alternativas en los *seeds* oficiales 2, 3, 4 y 5 a partir de los pasos de control 30, 32, 32 y 40 respectivamente.
- Coincidencia de observaciones con tolerancia de 1e-7 sobre las columnas enmascaradas (excluidas las de comando).
- No soporta *tool calling*, agentes, razonamiento multi-paso, capacidades multilingües ni visión; no es un modelo de lenguaje ni un modelo multimodal.
- No dispone de modo *thinking* ni de cualquier otra capacidad cognitiva.

## Casos de uso

- **Evaluación comparativa de políticas en la Microduck Arena**: el modelo permite comparar, sobre los mismos *seeds* oficiales, la trayectoria del base frente a una trayectoria buscada alternativa con idéntico tiempo de meta, útil para estudiar la sensibilidad de la política a perturbaciones en la secuencia de acciones.
- **Reproducción de experimentos de búsqueda CMA-ES**: las 115 filas almacenadas documentan las observaciones y acciones exactas de las carreras buscadas, lo que permite reproducir el proceso de búsqueda y verificar la metodología de `search_race.py`.
- **Estudio de capas de *lookup* sobre políticas neuronales**: sirve como caso de estudio de cómo injertar una capa de coincidencia exacta sobre un grafo ONNX sin alterar los operadores originales, conservando la política base como *fallback*.
- **Validación de pipelines de exportación ONNX**: al ser byte a byte reproducible entre plataformas (Azure x86-64 y Mac), es útil para verificar herramientas de construcción determinista de grafos ONNX (`mk_hv.py`, `onnx.checker`).
- **Docencia e investigación en robótica de simulación**: adecuado para demostrar técnicas de búsqueda *open-loop* sobre 14 servos por paso de control y su integración en un runner MuJoCo 3.10.0.
- **Pruebas de robustez del runner de la Arena**: permite comprobar que el runner version 5 reproduce exactamente las acciones previstas en cada paso de control de cada *seed* oficial, comparándolo lado a lado con el base.

## Benchmarks y rendimiento

Tiempos de carrera (s) en los *seeds* oficiales del evento, con runner versión 5:

| seed | HlibPlakhtii/microduck-hill-quicksilver-v3 | este checkpoint |
|---|---|---|
| 1 | 0,730 | 0,730 (carrera del base) |
| 2 | 0,745 | 0,745 (propia desde el paso 30) |
| 3 | 0,740 | 0,740 (propia desde el paso 32) |
| 4 | 0,735 | 0,735 (propia desde el paso 32) |
| 5 | 0,740 | 0,740 (propia desde el paso 40) |
| **tablero (media)** | **0,738** | **0,738** |

El runner de la Arena cronometra la llegada al final del paso de física de 5 ms en que el pato cruza la línea. Estas cifras son *in-sample*: cada fila almacenada se generó sobre su propio *seed* oficial y solo se reproduce en él. En los *seeds* 6 a 60 a 0,15 m/s el modelo es idéntico al base, carrera por carrera (38 de 55 terminan, igual que con el base). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, por no ser aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un fichero ONNX de pequeño tamaño propio de una política de control, pero no se documenta la cifra exacta.
- GPU recomendadas: no disponible; el modelo se ha construido y evaluado en CPU x86-64 (máquinas virtuales Azure y un Mac), no se menciona uso de GPU.
- Cabe en GPU de consumo: no disponible; por el tamaño del repositorio es plausible, pero no se confirma en la información proporcionada.
- Opciones de despliegue: el runner oficial de la Microduck Arena (runner versión 5, x86_64, MuJoCo 3.10.0, evento `hill-climb-1m5`, 0,15 m/s) y el runtime ONNX estándar; la librería declarada es `microduck`.
- Latencia y throughput estimados: no disponibles; los tiempos reportados (0,730 a 0,745 s) corresponden a la duración de la carrera en simulación, no a latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (media tablero) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-game-hillclimber-remix10` (este) | no disponible | no aplica | 0,738 s | Apache-2.0 | HuggingFace, 18 descargas |
| `HlibPlakhtii/microduck-hill-quicksilver-v3` (base) | no disponible | no aplica | 0,738 s | Apache-2.0 | HuggingFace |
| `rumezhak/microduck-hill-remix-leader3` | no disponible | no aplica | no disponible | no disponible | HuggingFace |
| `a1rb4Ck/microduck-hill-1m5` | no disponible | no aplica | no disponible | no disponible | HuggingFace |

La comparativa se limita a la estirpe directa del modelo, ya que no se dispone de datos de rendimiento de otras políticas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **No apto para robot físico**: el modelo se entrenó y evaluó únicamente en el simulador de la Arena; las acciones almacenadas son *open-loop* y muchas quedan muy fuera de lo que se pediría a un servo real. El autor advierte explícitamente de no cargarlo en un MicroDuck físico.
- **Sin mejora de rendimiento**: el tiempo de tablero es idéntico al del base (0,738 s); el checkpoint cambia el comportamiento en los *seeds* 2 a 5, no el resultado.
- **Sobreajuste a los *seeds* oficiales**: las 115 filas son *in-sample* y solo se activan en su propio *seed*; en los *seeds* 6 a 60 el modelo es el base, carrera por carrera.
- **Dependencia de coincidencia exacta**: la capa solo actúa si la diferencia absoluta máxima con una observación almacenada es inferior a 1e-7 en las columnas enmascaradas; cualquier desviación mínima hace que se ejecute la política base.
- **Enmascaramiento de comandos**: las columnas 48 a 60 (comando de velocidad) se excluyen de la comparación, por lo que la velocidad comandada solo afecta a la política base.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo de texto.
- **Sesgos conocidos**: no documentados; el modelo está restringido a una tarea y un simulador concretos.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero la utilidad práctica del modelo fuera de la Arena es nula y la advertencia de no uso en hardware físico debe respetarse.
- **Caveat para producción**: cualquier despliegue real requeriría reentrenamiento o adaptación *sim-to-real*, no contemplada en este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix10
- Modelo base: https://huggingface.co/HlibPlakhtii/microduck-hill-quicksilver-v3/tree/65a137db5525b1c591450704241396e69368374d
- Modelo del que deriva el base: https://huggingface.co/rumezhak/microduck-hill-remix-leader3/tree/cddaeebb6bcee5ef84729d9eb0838fc74097cf2c
- Modelo original de la estirpe: https://huggingface.co/a1rb4Ck/microduck-hill-1m5
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
