# jrubiosainz/microduck-game-sprinter-remix9

## Resumen

`jrubiosainz/microduck-game-sprinter-remix9` es una política de control para el evento **2 m Sprint** de la Microduck Arena (Pollen Robotics), publicada como un único grafo ONNX (`policy.onnx`) y etiquetada como `robotics` y `reinforcement-learning`. No es un modelo de lenguaje: recibe una observación por paso de control y emite 14 objetivos articulares (*joint targets*). El repositorio tiene 0 GB, 0 descargas y 0 likes en el momento de la consulta, y su licencia no está declarada en los metadatos de HuggingFace.

Técnicamente es un *merge* o injerto determinista de dos artefactos previos: el grafo de `jrubiosainz/microduck-game-sprinter-remix8` (a su vez derivado de remix7, con un `Clip` sobre el índice de su tabla de ramas) y el bloque de búsqueda exacta por observación de `a1rb4Ck/microduck-sprint-2m`. La novedad de esta revisión es que conserva las filas 0-181 de la tabla de `a1rb4Ck` (seeds 1 y 2 completas, más los pasos 0-49 de la seed 3) y añade 17 filas nuevas para los pasos 50-66 de la seed 3, con acciones obtenidas mediante una búsqueda *open-loop* con CMA-ES separable.

El resultado es una política que reproduce carreras memorizadas con precisión de bit y cae a la red de remix7 cuando la observación no coincide con ninguna fila almacenada. Declara 0,828 s de media en las cinco seeds oficiales, pero **en muestra** y solo en simulación: es un artefacto de optimización contra un *benchmark* concreto, no una política de locomoción generalizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX: red neuronal de política (base remix7, con un `Clip` sobre el índice de su tabla de ramas) seguida de un bloque de búsqueda exacta por observación (*lookup*) |
| Parametros totales | no disponible (no se publica recuento de parámetros de la red) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplicable / no disponible: consume una observación por paso de control; las columnas 48-60 (comandos) se enmascaran en el *lookup* (`L_mask`) |
| Tipos de cuantizacion | no disponible; solo se publica el grafo ONNX, sin variantes cuantizadas |
| Idiomas soportados | no disponible; no procesa lenguaje natural (la model card está en inglés) |
| Licencia | no disponible en los metadatos de HuggingFace; el modelo base `a1rb4Ck/microduck-sprint-2m` declara Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`); no se publican safetensors ni GGUF |
| Tarea (pipeline) | `robotics` (evento `sprint-2m` de la Microduck Arena, runner version 5, MuJoCo 3.10.0) |
| Dimension de la observacion | no disponible; se sabe que las columnas 48 a 60 son columnas de comando y se enmascaran |
| Dimension de la accion | 14 objetivos articulares (*joint targets*) por paso de control |
| Filas del lookup | 199 (filas 0-181 de `a1rb4Ck` + 17 filas añadidas para los pasos 50-66 de la seed 3); la tabla original de `a1rb4Ck` tiene 333 |
| Tolerancia del lookup | 1e-7 (diferencia absoluta máxima a la observación almacenada más cercana) |
| Pasos de control por carrera | 67 en la seed 3 |
| Velocidad de carrera | 1,15 m/s (la entrada de `a1rb4Ck` corre a 0,2 m/s) |
| Tamano del repo | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La política es un grafo ONNX en dos etapas. La primera es la red de remix7, copiada operador a operador, con un `Clip` añadido sobre el índice de su tabla de ramas (`br_idxf:0:767`, es decir, índice acotado a 0-767). La segunda es el bloque de *lookup* de `a1rb4Ck/microduck-sprint-2m`: en cada paso se compara la observación actual (con las columnas 48-60 enmascaradas) contra las observaciones almacenadas en `L_obs` mediante la diferencia absoluta máxima; si el mínimo es inferior a `L_tol = 1e-7`, se emite la acción almacenada en `L_act` en lugar de la salida de la red. Si no hay coincidencia, se usa la salida de remix7. Esta revisión conserva las filas 0-181 de la tabla original y añade 17 filas nuevas; la fila 182 de `a1rb4Ck` (paso 50) se descarta porque esa observación es idéntica bit a bit a la primera fila añadida.

Las 17 filas nuevas se obtuvieron con `seqsearch.py`, que busca secuencias *open-loop* de objetivos articulares en la simulación oficial del evento: parte de las acciones almacenadas de la seed 3 de `a1rb4Ck` (que cruzan la línea en 0,8359 s) y optimiza desplazamientos sobre los 14 objetivos articulares en cada paso desde el 50 en adelante (252 parámetros), minimizando el instante de cruce de meta interpolado dentro del paso de física, con penalización por caída o *timeout*. Usó CMA-ES separable, tamaño de población 20, paso inicial de 0,5 rad y reinicio desde el mejor individuo tras 300 generaciones sin progreso; la mejor secuencia apareció en la generación 2066 y cruza en 0,8338 s (paso de física que termina en 0,835 s). Los desplazamientos encontrados llegan a 10,13 rad. Las observaciones de los pasos 50-66 se grabaron en el runner oficial y el injerto se realizó con `mk_graft.py --rows 0-181 --extra seed3_steps_50-66.npz --clip br_idxf:0:767`, verificado con `onnx.checker`; dos compilaciones independientes (VM x86-64 de Azure y un Mac) produjeron ficheros idénticos byte a byte. No se documentan en la información disponible ni el número de tokens ni la composición del dataset de entrenamiento de la red subyacente, ni si hubo RLHF/DPO (conceptos, por otra parte, ajenos a este dominio).

## Capacidades

- Generación de acciones de locomoción: emite 14 objetivos articulares por paso de control para completar un sprint de 2 m en simulación.
- Reproducción determinista de carreras memorizadas: en las seeds 1 y 2 todos los pasos coinciden con una fila almacenada; en la seed 3 coinciden los 67 pasos (50 de `a1rb4Ck` + 17 con acciones buscadas).
- *Fallback* a la política neuronal: cualquier observación sin coincidencia se resuelve con el grafo de remix7, de forma que la política nunca queda sin salida.
- Ejecución en CPU: el artefacto se ha validado con onnxruntime 1.24.4 sobre x86_64, sin requisitos de GPU.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes, razonamiento multi-paso en el sentido de los LLM, ni planificación simbólica.
- Sin capacidades multilingües, de visión, audio o modo *thinking*.
- Sin modo conversacional: no hay ventana de contexto ni memoria entre carreras; el estado es la observación del paso actual.

## Casos de uso

- Evaluación de políticas en la Microduck Arena: sirve como entrada de referencia para medir tiempos en las seeds oficiales del evento `sprint-2m` con el runner version 5, útil para comparar técnicas de búsqueda o de destilación contra un objetivo cuantificado (0,828 s de media declarada).
- Estudio de memorización frente a generalización: al separar explícitamente la red (remix7) del *lookup*, permite medir cuánta puntuación de un *leaderboard* proviene de la política y cuánta de la repetición de trayectorias grabadas.
- Reproducción de resultados: el proceso de injerto es determinista y verificado byte a byte en dos plataformas, lo que facilita replicar el artefacto en una pipeline de CI que reconstruya `policy.onnx` desde los ficheros publicados.
- Docencia e investigación en optimización sin gradiente: el caso documenta con precisión un uso de CMA-ES separable sobre 252 parámetros (paso inicial 0,5 rad, población 20, generación 2066), reutilizable como ejemplo reproducible de búsqueda *open-loop*.
- Pruebas de regresión de simuladores: comparar los tiempos de esta política bajo distintas versiones del runner o de MuJoCo (3.10.0 como referencia) da una señal sensible a cambios en la dinámica, ya que las acciones provienen de la física exacta de esa versión.
- Validación de infraestructura de inferencia ONNX: grafo pequeño, salida determinista y tolerancia 1e-7 lo convierten en un test adecuado para verificar versiones de onnxruntime y diferencias numéricas entre plataformas.
- Punto de partida para búsquedas posteriores: las 17 filas añadidas y el script de búsqueda sirven como inicialización para optimizar otras seeds o eventos, siempre dentro del simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K); no aplican a este artefacto. Los únicos datos de rendimiento son tiempos de carrera en segundos sobre las seeds oficiales del evento, con runner version 5:

| Seed | remix8 (1,15 m/s) | `a1rb4Ck/microduck-sprint-2m` (0,2 m/s) | remix9 (1,15 m/s) |
|---|---|---|---|
| 1 | 0,820 | 0,820 | 0,820 |
| 2 | 0,820 | 0,820 | 0,820 |
| 3 | 0,835 | 0,840 | 0,835 |
| 4 | 0,835 | 0,840 | termina como remix7 (sin dato numérico explícito en la información disponible) |
| 5 | 0,830 | 0,840 | termina como remix7 (sin dato numérico explícito en la información disponible) |
| Media (5 seeds) | 0,829 | 0,832 | 0,828 (en muestra) |

La model card original incluye una tabla de resultados que aparece truncada en la información disponible (se corta en la fila de la seed 1), por lo que los valores de las seeds 4 y 5 de esta revisión se deducen de la afirmación del autor de que "cualquier carrera que no coincida con una fila almacenada corre exactamente como remix7". Además, el autor indica que otras 55 seeds (6 a 60) se probaron y terminan exactamente como remix7.

## Requisitos de hardware

- VRAM estimada: no disponible; el grafo es un ONNX de política pequeña y se ha ejecutado íntegramente en CPU (VM x86-64 de Azure y un Mac), por lo que no requiere GPU.
- GPU recomendadas: ninguna. El cuello de botella es el simulador (MuJoCo 3.10.0) y el runner del evento, no la red.
- ¿Cabe en GPU de consumo? Sí, con margen amplio, aunque no es necesario; cualquier equipo capaz de ejecutar el simulador sirve.
- Opciones de despliegue: onnxruntime (versión validada 1.24.4) dentro del runner oficial de la Microduck Arena; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se sabe que una carrera de la seed 3 comprende 67 pasos de control y termina en 0,835 s de tiempo simulado, pero no se publica tiempo de pared ni pasos por segundo.
- Reproducibilidad de build: el injerto produce ficheros idénticos byte a byte en x86-64 (Azure) y en un Mac, lo que simplifica el despliegue en entornos heterogéneos.

## Comparativa con modelos similares

| Modelo | Autor | Mecanismo | Velocidad | Media 5 seeds | Licencia |
|---|---|---|---|---|---|
| `microduck-game-sprinter-remix9` | jrubiosainz | Red remix7 + lookup de 199 filas (182 de `a1rb4Ck` + 17 buscadas) | 1,15 m/s | 0,828 s (en muestra) | no disponible |
| `microduck-game-sprinter-remix8` | jrubiosainz | Red remix7 + lookup de 132 filas (solo seeds 1 y 2) | 1,15 m/s | 0,829 s | no disponible |
| `microduck-sprint-2m` | a1rb4Ck | Red + lookup de 333 filas (5 seeds oficiales) | 0,2 m/s | 0,832 s | Apache-2.0 |
| remix7 | jrubiosainz | Red neuronal con tabla de ramas (sin lookup) | 1,15 m/s | no disponible | no disponible |

Los cuatro artefactos resuelven la misma tarea y comparten linaje: remix9 y remix8 injertan el bloque de `a1rb4Ck` sobre el grafo de remix7. La diferencia entre remix9 y remix8 es exclusivamente el número de filas memorizadas (199 frente a 132), no la arquitectura de la red.

## Limitaciones y advertencias

- Sobreajuste explícito al *benchmark*: la puntuación de 0,828 s es **en muestra**, sobre las cinco seeds oficiales, y depende de una tabla de observaciones grabadas, no de una política que generalice.
- Solo simulación: el autor lo indica de forma explícita; no hay validación en hardware físico ni indicios de transferencia *sim-to-real*.
- Fragilidad ante cambios de entorno: los tiempos dependen de runner version 5, MuJoCo 3.10.0, x86_64, onnxruntime 1.24.4 y la velocidad de 1,15 m/s; cualquier cambio en el simulador puede invalidar las coincidencias del *lookup* y degradar la carrera a la política de remix7.
- Acciones no reactivas: las 17 filas añadidas son una secuencia *open-loop* grabada; no hay realimentación correctiva si la observación se desvía, y los desplazamientos aplicados llegan a 10,13 rad, lo que puede producir trayectorias poco realistas desde el punto de vista físico.
- Licencia indeterminada: los metadatos de HuggingFace no declaran licencia. El modelo base es Apache-2.0, pero la combinación con el grafo de remix7 (sin licencia publicada en la información disponible) deja el uso comercial en una situación jurídica poco clara; conviene contactar con el autor antes de cualquier uso en producción.
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero sí existe un riesgo análogo de "coincidencia espuria": la tolerancia de 1e-7 protege contra falsos positivos, aunque una observación casi idéntica en un contexto distinto podría disparar una acción memorizada inadecuada.
- Sesgos: no documentados; no hay análisis de robustez frente a perturbaciones, ruido de sensores o variaciones de masa y fricción.
- Trazabilidad incompleta: la model card aparece truncada en la información disponible, los hashes sha256 se muestran abreviados y no se publican métricas de la red subyacente ni el recuento de parámetros.
- Señal de adopción nula: 0 descargas y 0 likes, repositorio de 0 GB y creado y actualizado en el mismo segundo, lo que sugiere un artefacto de experimentación más que un modelo mantenido.
- Consideración de uso: la optimización dirigida a las seeds oficiales de un *leaderboard* puede considerarse contraria al espíritu de la competición; conviene declararlo si se publican comparaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix9
- Modelo base (merge) remix8: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix8
- Commit concreto de remix8 citado en la model card: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix8/tree/36dd58ab323ce7dc264fe433ebcb1b5e1541b211
- Modelo base `a1rb4Ck/microduck-sprint-2m`: https://huggingface.co/a1rb4Ck/microduck-sprint-2m
- Commit concreto de `a1rb4Ck/microduck-sprint-2m`: https://huggingface.co/a1rb4Ck/microduck-sprint-2m/tree/0dd7a3545b974a08bcc7e6a9d9d3bf1e04b22c9e
- Perfil del autor del modelo base: https://huggingface.co/a1rb4Ck
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Perfil del autor: https://huggingface.co/jrubiosainz

No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo y se han descartado. Los scripts citados en la model card (`seqsearch.py`, `mk_graft.py`) no tienen URL pública en la información disponible.
