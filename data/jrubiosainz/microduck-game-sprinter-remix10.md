# jrubiosainz/microduck-game-sprinter-remix10

## Resumen

`microduck-game-sprinter-remix10` es un checkpoint derivado de `a1rb4Ck/microduck-sprint-2m`, la política de control presentada por el usuario a1rb4Ck para la prueba de 2 m Sprint de la Microduck Arena (Pollen Robotics). No es un modelo de lenguaje: es un artefacto de control robótico en formato ONNX que combina una red MLP con una tabla de búsqueda exacta sobre observaciones almacenadas. Lo publica el usuario jrubiosainz como fine-tune del checkpoint base, con licencia Apache-2.0.

La modificación es quirúrgica: se reemplazan 13 filas de la tabla de lookup (`L_obs` y `L_act`) correspondientes a los pasos de control 54 a 66 de la semilla oficial 3, sustituyéndolas por observaciones registradas en el runner de la Arena y por acciones obtenidas mediante búsqueda open-loop con CMA-ES separable. El resto del fichero, incluidos todos los operadores ONNX y los otros 320 registros, es idéntico byte a byte al del modelo base.

Su relevancia es acotada y metodológica: documenta una mejora in-sample de 5 ms (0,835 s a 0,830 s en la semilla 3, y de 0,826 s a 0,825 s en la media del board) sobre un benchmark de simulación con cinco semillas oficiales. No aporta mejoras de generalización y no está validado en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (política de control) + tabla de lookup exacto sobre observaciones (`L_obs`, `L_act`) con máscara de columnas de comando (`L_mask`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (control por paso, 67 pasos de control por carrera) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

El modelo base `a1rb4Ck/microduck-sprint-2m` (commit `f3b242c2`, run `01M635P31V060H2QPN85N6`) consiste en una red MLP que genera una marcha (gait) y una tabla de lookup que la sigue. En inferencia, la observación se compara con 333 observaciones almacenadas de las cinco carreras oficiales, enmascarando previamente las columnas de comando (48 a 60); si la diferencia absoluta máxima respecto a la fila más cercana es inferior a 1e-7 (`L_tol`), se ejecuta la acción almacenada en lugar de la salida de la red. Con el runner versión 5, todos los pasos de control de las semillas oficiales coinciden con alguna fila almacenada.

Este checkpoint no reentrena la red. Sustituye las filas 186 a 198 (pasos de control 54 a 66 de la semilla 3) por 13 filas nuevas: las observaciones son las registradas en el runner de la Arena para esa carrera, con las columnas de comando enmascaradas, y las acciones son las del modelo base más desplazamientos de objetivo articular de hasta 49,12 rad, hallados con `seqsearch.py` mediante CMA-ES separable en varias rondas sobre máquinas virtuales Azure x86-64. Los desplazamientos grandes saturan el modelo de servo de la Arena, cuyo esfuerzo está limitado por la corriente del firmware. El injerto se realiza con `mk_a1g.py --base a1rb4Ck.onnx --seed 3 --k 54 --extra seed3_steps_54-66.npz` y se valida con `onnx.checker`; el resultado es reproducible byte a byte entre una VM Azure x86-64 y un Mac. La evaluación se hizo con runner versión 5, x86_64, MuJoCo 3.10.0, onnxruntime 1.24.4, evento `sprint-2m` a 0,2 m/s.

## Capacidades

- Control locomotor de un robot duck de bajo coste en la prueba de 2 m Sprint de la Microduck Arena, en simulación MuJoCo.
- Replay determinista de acciones para observaciones exactas almacenadas (tolerancia 1e-7 sobre observaciones con columnas de comando enmascaradas).
- Fallback a la red MLP del modelo base cuando ninguna fila almacenada coincide con la observación.
- Ejecución de carreras completas de 67 pasos de control sobre las semillas oficiales 1 a 5.
- Comportamiento idéntico al modelo base en semillas no vistas (6 a 60), al no activarse el lookup.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de resultados en la Microduck Arena: el checkpoint permite repetir las cinco carreras oficiales con tiempos deterministas (0,820, 0,820, 0,830, 0,830 y 0,825 s), útil para verificar pipelines de evaluación.
- Estudio de búsqueda open-loop con CMA-ES: sirve como ejemplo documentado de optimización de secuencias de objetivos articulares sobre un simulador con servo saturado.
- Análisis de sensibilidad del lookup exacto: permite medir cómo un cambio de 13 filas altera el tiempo de una única semilla sin tocar la red.
- Docencia en robótica de refuerzo: ilustra el patrón MLP más tabla de memoria y sus límites de generalización.
- Pruebas de integración de ONNX Runtime: el fichero es pequeño (repo de 0,0 GB) y reproducible byte a byte, adecuado para validar versiones de onnxruntime y `onnx.checker`.
- Referencia negativa en metodología de benchmarks: caso claro de mejora in-sample que no debe presentarse como mejora de política.

## Benchmarks y rendimiento

Tiempos de carrera (s) en las semillas oficiales del evento, runner versión 5, a 0,2 m/s:

| Semilla | microduck-sprint-2m | este checkpoint |
|---|---|---|
| 1 | 0,820 | 0,820 (filas de a1rb4Ck) |
| 2 | 0,820 | 0,820 (filas de a1rb4Ck) |
| 3 | 0,835 | 0,830 (filas de a1rb4Ck hasta el paso 53, luego las buscadas) |
| 4 | 0,830 | 0,830 (filas de a1rb4Ck) |
| 5 | 0,825 | 0,825 (filas de a1rb4Ck) |
| Media del board | 0,826 | 0,825 |

En la réplica del simulador usada para la búsqueda, la secuencia encontrada cruza la meta en 0,829982 s interpolados, frente a 0,83227 s de la carrera base. En semillas 6 a 60 a 0,2 m/s el comportamiento es idéntico al modelo base (55 de 55 terminan). Todos los números son in-sample.

## Requisitos de hardware

- Inferencia en CPU es suficiente: el modelo se evaluó en máquinas virtuales Azure x86-64 sin GPU y en un Mac.
- VRAM estimada: no aplica; el artefacto es un `policy.onnx` de tamaño despreciable (repo de 0,0 GB) y se ejecuta con onnxruntime 1.24.4.
- GPU recomendadas: no disponibles ni necesarias para este artefacto.
- Cabe en cualquier equipo consumer; no requiere GPU dedicada.
- Despliegue: onnxruntime (versión validada 1.24.4) dentro del runner de la Microduck Arena (versión 5) con MuJoCo 3.10.0. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: el runner marca el tiempo de meta al final del paso de física de 5 ms en que el duck cruza la línea (cuatro pasos por cada paso de control de 0,02 s); no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Semillas evaluadas | Media board (s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| a1rb4Ck/microduck-sprint-2m | MLP + lookup | 5 oficiales | 0,826 | Apache-2.0 | Hugging Face |
| jrubiosainz/microduck-game-sprinter-remix10 | MLP + lookup modificado | 5 oficiales (in-sample) | 0,825 | Apache-2.0 | Hugging Face |
| Otros participantes de la Microduck Arena | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Resultados in-sample: cada fila almacenada se generó y solo se reproduce en la carrera de su propia semilla oficial; no hay evidencia de mejor generalización.
- No es un mejor caminante: en semillas 6 a 60 el comportamiento es idéntico al del modelo base.
- Solo simulación: no se ha probado en hardware real; el lookup reproduce acciones almacenadas para observaciones simuladas exactas y no es transferible a un robot físico.
- Dependencia estricta del runner y del simulador: runner versión 5, MuJoCo 3.10.0, onnxruntime 1.24.4 y evento `sprint-2m` a 0,2 m/s; cambios de versión pueden invalidar la coincidencia con las filas almacenadas.
- Desplazamientos de hasta 49,12 rad en los últimos pasos que saturan el modelo de servo; no representan una política físicamente significativa.
- La máscara de columnas de comando hace que la velocidad comandada no afecte al lookup en las semillas oficiales; solo llega a la red.
- Licencia Apache-2.0 permite uso comercial del artefacto, pero su valor práctico fuera del benchmark es nulo y no se han documentado sesgos ni riesgos de alucinación por no ser un modelo generativo.
- Idiomas, cuantizaciones y número de parámetros no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix10
- Modelo base: https://huggingface.co/a1rb4Ck/microduck-sprint-2m/tree/f3b242c275d72abb8807150f501258d00c8264e3
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Perfil del autor: https://huggingface.co/jrubiosainz
- Perfil del autor del modelo base: https://huggingface.co/a1rb4Ck
