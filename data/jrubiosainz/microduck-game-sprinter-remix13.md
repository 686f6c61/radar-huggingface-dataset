# jrubiosainz/microduck-game-sprinter-remix13

## Resumen

`microduck-game-sprinter-remix13` es un checkpoint de política de control para el entorno de simulación **Microduck Arena**, concretamente para la prueba de **2 m Sprint**. Lo publica el usuario de Hugging Face `jrubiosainz` y deriva de un merge de dos políticas previas: `rumezhak/microduck-sprint-remix-leader4` y `HlibPlakhtii/microduck-sprint-quicksilver-v1`, ambas con licencia Apache-2.0. No es un modelo de lenguaje: es una política de reinforcement learning empaquetada en ONNX que se ejecuta dentro del runner de la Arena.

Técnicamente, el modelo combina una red MLP que genera una marcha (gait) con una tabla de búsqueda exacta por observación (*exact-observation lookup*). Cuando la observación entrante coincide con una fila almacenada dentro de una tolerancia de 1e-7, se reproduce la acción guardada en lugar de la salida de la red. Este checkpoint modifica únicamente las filas de la tabla correspondientes a las semillas oficiales 1, 3 y 4, sustituyéndolas por acciones obtenidas mediante búsqueda open-loop propia o copiadas de la política de HlibPlakhtii.

Su relevancia es acotada pero clara para la comunidad de robótica simulada: documenta con precisión quirúrgica cómo se puede mejorar un resultado de leaderboard mediante edición de tablas de lookup y búsqueda de acciones, y sirve como referencia reproducible para experimentos de optimización de políticas en entornos con semillas fijas. El resultado declarado es de **0.820 s** de media en las cinco semillas oficiales, siempre en simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (política de gait) + tabla de búsqueda exacta por observación (lookup) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en ONNX) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política base es una red MLP que produce una marcha para el robot Microduck en la prueba de 2 m Sprint. Sobre la salida de la red se aplica un mecanismo de lookup: la observación actual, con las columnas de comando (48 a 60) enmascaradas (`L_mask`), se compara contra 332 observaciones almacenadas de las cinco carreras oficiales (`L_obs`). Si la diferencia absoluta máxima respecto a la fila más cercana es inferior a 1e-7 (`L_tol`), se ejecuta la acción almacenada de esa fila (`L_act`) en lugar de la acción de la red.

El entrenamiento original de la política base corresponde a `a1rb4Ck/microduck-sprint-2m`, descrito por su autor como «una marcha MLP más tablas para las cinco semillas oficiales». `leader4` conserva la red y las filas de las semillas 1 a 4 byte a byte, y reemplaza las de la semilla 5 por una carrera rebuscada. Este checkpoint parte de `leader4` y modifica exclusivamente las filas de la tabla: las filas 28-65 de la semilla 1 y 227-265 de la semilla 4 se sustituyen por observaciones registradas en el runner de la Arena con acciones halladas por búsqueda open-loop propia (offsets de hasta 25.61 rad y 22.81 rad respectivamente); las filas 160-198 de la semilla 3 se copian bit a bit de `HlibPlakhtii/microduck-sprint-quicksilver-v1`, cuyas observaciones se grabaron compitiendo contra el evaluador oficial con una secuencia de objetivos articulares obtenida por CMA-ES separable (diferencias de hasta 3.31 rad respecto a las acciones almacenadas originales). Las 216 filas restantes (semillas 2 y 5, y pasos 0-27 de las semillas 1, 3 y 4) son de `leader4` byte a byte.

No se documenta en la información disponible ningún proceso de RLHF, DPO ni datos de entrenamiento adicionales más allá de esta edición de tablas.

## Capacidades

- Control de locomoción para la prueba de 2 m Sprint del Microduck Arena en simulación.
- Ejecución de una marcha MLP con corrección mediante lookup exacto de observaciones.
- Reproducción determinista de acciones almacenadas cuando la observación coincide dentro de 1e-7.
- Mejora de tiempos en las semillas oficiales 1, 3 y 4 respecto a `leader4` (0.815, 0.825 y 0.820 s frente a 0.820, 0.830 y 0.825 s).
- Compatibilidad con el runner versión 5 de la Arena.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- **Evaluación de políticas en el Microduck Arena**: cargar `policy.onnx` en el runner v5 y medir el tiempo de las cinco semillas oficiales para reproducir el resultado declarado de 0.820 s.
- **Investigación en optimización de tablas de lookup**: usar este checkpoint como referencia de cómo una búsqueda open-loop sobre acciones almacenadas puede reducir tiempos sin reentrenar la red.
- **Estudio de robustez ante desviaciones de observación**: analizar el comportamiento cuando la observación cae fuera de la tolerancia de 1e-7 y el control pasa a depender exclusivamente de la red MLP.
- **Comparación de estrategias de búsqueda**: contrastar la búsqueda open-loop propia (offsets de hasta 25.61 rad) con la búsqueda CMA-ES separable de `quicksilver-v1` (offsets de hasta 3.31 rad) sobre las mismas semillas.
- **Reproducibilidad de resultados de leaderboard**: verificar bit a bit qué filas provienen de `leader4`, cuáles de búsqueda propia y cuáles de `quicksilver-v1`, dado que la model card detalla los rangos exactos.
- **Punto de partida para futuros remixes**: servir como base para nuevas ediciones de las filas de las semillas 2 y 5, que en este checkpoint permanecen intactas respecto a `leader4`.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (tiempo de finalización en segundos, en simulación, sobre las cinco semillas oficiales):

| Semilla | leader4 | remix13 |
|---|---|---|
| 1 | 0.820 | 0.815 |
| 2 | 0.820 | 0.820 |
| 3 | 0.830 | 0.825 |
| 4 | 0.825 | 0.820 |
| 5 | 0.820 | 0.820 |
| Media | no disponible | 0.820 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni serían aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB, lo que sugiere un artefacto ONNX de tamaño muy reducido.
- GPU recomendadas: no disponible; al ser una política MLP con lookup, es probable que la inferencia sea viable en CPU, pero no se confirma en la información proporcionada.
- ¿Cabe en GPU consumer? No disponible de forma explícita; por el tamaño del repositorio, previsiblemente sí, pero no se documenta.
- Opciones de despliegue: el modelo se ejecuta mediante el runner del Microduck Arena (versión 5) y la librería `microduck`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Semillas mejoradas | Media declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-game-sprinter-remix13` | MLP + lookup | 1, 3, 4 | 0.820 s | Apache-2.0 | Hugging Face |
| `rumezhak/microduck-sprint-remix-leader4` | MLP + lookup | 5 (respecto a `sprint-2m`) | no disponible | Apache-2.0 | Hugging Face |
| `HlibPlakhtii/microduck-sprint-quicksilver-v1` | MLP + lookup con búsqueda CMA-ES | no disponible | no disponible | Apache-2.0 | Hugging Face |
| `a1rb4Ck/microduck-sprint-2m` | MLP + tablas | base | no disponible | Apache-2.0 | Hugging Face |

Los tiempos individuales de las alternativas no se detallan en la información disponible salvo los de `leader4` en la tabla de benchmarks anterior.

## Limitaciones y advertencias

- **Solo simulación**: el autor indica explícitamente «Simulation only»; no hay evidencia de transferencia a hardware físico.
- **Sobreajuste a semillas oficiales**: las mejoras se obtienen mediante búsqueda sobre las semillas 1, 3 y 4 y copia de filas de otra política para la semilla 3; el resultado de 0.820 s es in-sample y no garantiza generalización a semillas no oficiales.
- **Dependencia del runner v5**: el comportamiento descrito asume el runner versión 5 de la Arena; cambios en el entorno o en el evaluador pueden invalidar las coincidencias de lookup.
- **Sensibilidad a la tolerancia**: fuera de 1e-7 de diferencia respecto a una fila almacenada, el control recae en la red MLP, cuyo rendimiento no se documenta de forma independiente.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo de lenguaje.
- **Sesgos**: no se documentan sesgos en la información disponible.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base (`leader4`, `quicksilver-v1`, `sprint-2m`), todas declaradas Apache-2.0 en la información disponible.
- **Documentación dependiente del autor**: gran parte de las garantías (coincidencia byte a byte, rangos de filas) provienen de la model card y no de una verificación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix13
- Modelo base `rumezhak/microduck-sprint-remix-leader4`: https://huggingface.co/rumezhak/microduck-sprint-remix-leader4/tree/0a6ae1f67d4eff40a0e08165ad526844bdfeb54e
- Modelo base `HlibPlakhtii/microduck-sprint-quicksilver-v1`: https://huggingface.co/HlibPlakhtii/microduck-sprint-quicksilver-v1/tree/7d121cd72728c7f4638bf147fd6b0388a0d67d8d
- Modelo base `a1rb4Ck/microduck-sprint-2m`: https://huggingface.co/a1rb4Ck/microduck-sprint-2m/tree/000f06a92dc9bb151501b48d9472be5089272405
- Remix previo `jrubiosainz/microduck-game-sprinter-remix10`: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix10
- Remix previo `jrubiosainz/microduck-game-sprinter-remix11`: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix11/tree/3b87d091f8260d8b703821d4412140b9d657e19b
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
