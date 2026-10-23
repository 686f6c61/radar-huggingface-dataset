# hofftv/microduck-nugget-roller

## Resumen

`hofftv/microduck-nugget-roller` es una política de control entrenada por refuerzo (reinforcement learning) para el robot microduck de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un controlador neuronal que recibe una observación de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para que el robot se desplace con patines (rollers) de forma continua. El autor la describe como una política «perpetua»: se ejecuta hasta que se le indique lo contrario, y se carga en una ranura (slot) de política del daemon del robot mediante `robotctl`.

El modelo se ha entrenado con el stack mjlab sobre la tarea `Mjlab-RollerSprint2m-MicroDuck`, dentro del repositorio `pollen-robotics/microduck-challenges`, partiendo de la base `mjlab-microduck 0.1.0`. El artefacto publicado es un único `policy.onnx` con el normalizador de observaciones incorporado (se le pasan observaciones en crudo) más un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. Corresponde al checkpoint 1750 de un entrenamiento con semilla 1, ejecutado el 22 de octubre de 2026.

Su relevancia es acotada pero concreta: sirve como pieza de referencia reproducible para el ecosistema microduck, como ejemplo de despliegue sim-a-real de políticas de RL en un robot comercial abierto y como punto de partida para comparar recetas de entrenamiento. Conviene señalar desde el principio que el repositorio no declara licencia, no publica métricas de rendimiento, no documenta idiomas (no aplica) y su tamaño es de 0,0 GB, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Política de control entrenada por refuerzo; la topología de la red no se documenta en la model card |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. No es un modelo de lenguaje: consume una observación de 61 dimensiones por paso de control |
| Tipos de cuantizacion | No disponible. Se distribuye en ONNX; no se documentan variantes cuantizadas (FP16, INT8, etc.) |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | ONNX (`policy.onnx`, con normalizador de observaciones integrado) + `manifest.json` (esquema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tarea de entrenamiento | `Mjlab-RollerSprint2m-MicroDuck` |
| Checkpoint | 1750 |
| Semilla | 1 |
| Base de entrenamiento | `mjlab-microduck 0.1.0 @ 8d0dbc94c` |
| Libreria / runtime | `microduck` (pipeline: robotics) |
| Hardware objetivo | Robot microduck de Pollen Robotics, sobre patines (rollers) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red: la model card solo indica que es una política entrenada por refuerzo con la librería `microduck`, exportada a ONNX y con el normalizador de observaciones embebido en el propio grafo, de modo que el consumidor final alimenta observaciones sin procesar. El interfaz es explícito: 61 valores de observación de entrada, 14 valores de acción de salida y un bucle de control a 50 Hz. No se especifica número de capas, activaciones, tamaño de las capas ocultas ni número de parámetros.

El entrenamiento se realizó con el stack mjlab sobre la tarea `Mjlab-RollerSprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges` (rama `main`, commit `6ff40704a`), partiendo de la base `mjlab-microduck 0.1.0` en el commit `8d0dbc94c`, con semilla 1 y checkpoint final 1750. El comando de reproducción documentado usa 4096 entornos paralelos, un máximo de 3000 iteraciones y logger de TensorBoard. El propio autor advierte que el entrenamiento por refuerzo con GPU no es bit-reproducible entre máquinas: repetir la receta con el mismo código, `uv.lock`, comando y semilla produce una política «comparable», no los mismos pesos. No se documentan número de tokens (no aplica), composición de dataset, ni fases de RLHF/DPO (no aplica a RL de control).

## Capacidades

- Locomoción continua sobre patines: la política genera acciones de forma indefinida («perpetua»), sin episodio de terminación explícito, hasta que el operador la descarga o la sustituye.
- Control en bucle cerrado a 50 Hz con observaciones de 61 dimensiones y acciones de 14 dimensiones.
- Ejecución autónoma en el robot: se carga en una ranura de política mediante `sudo robotctl policy load <slot> hofftv/microduck-nugget-roller`.
- Normalización integrada: el `policy.onnx` incluye el normalizador, por lo que acepta observaciones en crudo sin preprocesado externo.
- Empaquetado conforme al manifiesto de políticas de microduck (esquema 2), lo que permite cargarla con el mismo mecanismo que otras políticas del ecosistema.
- Reproducibilidad documentada de la receta de entrenamiento (commit, semilla, número de entornos, iteraciones y comando exacto).
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling ni capacidades multilingües: es exclusivamente un controlador motor.

## Casos de uso

- Despliegue directo de una marcha sobre patines en un microduck físico: se carga la política en una ranura con `robotctl` y el robot ejecuta el desplazamiento de forma continua; es el uso para el que se publicó el checkpoint.
- Banco de pruebas de sim-a-real: al ser una política entrenada en simulación con mjlab y exportada a ONNX con normalizador embebido, sirve para medir la brecha entre simulación y robot real en una tarea de locomoción concreta (sprint sobre rollers).
- Línea base para ablations de entrenamiento en `microduck-challenges`: el repositorio documenta commit, semilla, número de entornos e iteraciones, lo que permite comparar variantes (más entornos, otra semilla, otro checkpoint) contra este resultado concreto.
- Docencia e investigación en RL aplicado a robótica: la receta es reproduccible con `uv sync` y un único comando, lo que la hace utilizable en cursos o talleres donde se necesite un caso real de entrenamiento con paralelización masiva (4096 entornos).
- Gestión de biblioteca de marchas en un robot con múltiples ranuras de política: esta política puede convivir con otras y conmutarse en caliente según la tarea, lo que permite alternar entre repertorios de locomoción sin reentrenar.
- Evaluación de robustez del lazo de control a 50 Hz: sirve para comprobar en hardware que la inferencia ONNX cumple el presupuesto de 20 ms por paso y que el comportamiento se mantiene estable en ejecuciones prolongadas (política sin terminación).
- Integración en pruebas de regresión del daemon: al tener un manifiesto con esquema versionado, la política puede usarse como caso de prueba fijo para validar que una nueva versión de `robotctl` carga y ejecuta políticas correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad de desplazamiento, tasa de caídas, error de seguimiento ni comparaciones cuantitativas con otras políticas. Tampoco se documentan latencias medidas de inferencia en el robot.

## Requisitos de hardware

- Inferencia: no se publica VRAM ni huella de memoria. Por la interfaz declarada (61 entradas, 14 salidas, un único `policy.onnx`) el coste es propio de una política de control de tamaño reducido, muy por debajo de un modelo generativo; se ejecuta en la computadora de a bordo del microduck, cuyas especificaciones no se detallan en la información disponible.
- GPU para inferencia: no necesaria en el escenario previsto (ejecución en el robot con runtime ONNX). No hay datos publicados de despliegue en A100, H100 o RTX 4090 para servir esta política.
- Cabe en GPU de consumo: sí, con toda probabilidad, dado el tamaño del artefacto, pero no hay cifras oficiales que lo cuantifiquen.
- Entrenamiento: el comando documentado usa 4096 entornos paralelos y hasta 3000 iteraciones; el autor no especifica la GPU empleada. Se requiere una GPU compatible con el stack mjlab para reproducir la receta.
- Opciones de despliegue: `robotctl` (daemon de microduck) cargando la política en una ranura, o cualquier runtime ONNX estándar para consumo del `policy.onnx` fuera del robot. vLLM, llama.cpp, Ollama o TGI no son aplicables: no es un modelo de lenguaje.
- Latencia: el bucle de control a 50 Hz impone un presupuesto de 20 ms por paso, incluyendo adquisición de observación, inferencia y envío de acción. No se publica la latencia real medida ni el throughput.

## Comparativa con modelos similares

No se dispone de datos públicos de modelos comparables (parámetros, contexto, rendimiento o licencia) en la información proporcionada. La comparación natural sería con otras políticas de la familia `microduck-challenges` entrenadas con la misma base `mjlab-microduck`, pero no se aportan sus especificaciones.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hofftv/microduck-nugget-roller` | No disponible | No aplica (61-D de observación) | No publicado | No disponible | HuggingFace, 0 descargas |
| Otras políticas de `microduck-challenges` | No disponible | No aplica | No disponible | No disponible | No disponible en la información consultada |
| Políticas de locomoción de otros robots cuadrúpedos open source | No disponible | No aplica | No disponible | No disponible | No disponible en la información consultada |

## Limitaciones y advertencias

- Licencia ausente: el repositorio no declara licencia, lo que impide determinar si el uso comercial o la redistribución están permitidos. Es un bloqueo objetivo para cualquier despliegue en producción.
- Rendimiento no verificado: no hay métricas publicadas (recompensa, velocidad, estabilidad, tasa de caídas) ni vídeos o demos enlazadas en la información disponible. El checkpoint 1750 no viene acompañado de ninguna evaluación.
- Repositorio de 0,0 GB con 0 descargas y 0 likes: conviene verificar que los artefactos (`policy.onnx` y `manifest.json`) están realmente accesibles antes de planificar su uso.
- Especialización extrema: la política solo produce acciones motoras para el microduck sobre rollers. No generaliza a otras morfologías, a otro hardware ni a tareas distintas de las de su entrenamiento.
- Sin información sobre el dominio de entrenamiento: no se documenta aleatorización de dominio, distribución de condiciones iniciales ni rango de velocidades cubierto, por lo que se desconoce su robustez ante perturbaciones, superficies irregulares o cambios de carga.
- Naturaleza «perpetua»: al no tener terminación explícita, el control de seguridad (parada, límites de par, watchdog) debe implementarse en el daemon o en el operador, no en la política.
- No reproducibilidad bit a bit: el propio autor advierte que reentrenar con la misma semilla produce pesos distintos; no debe tratarse como un artefacto auditable reproducible.
- Sin soporte de lenguaje, visión ni tool calling: cualquier expectativa en ese sentido es un error de categoría.
- Idiomas no aplicables y no declarados; la ficha de HuggingFace no aporta metadatos de región distintos de `region:us`.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí riesgo de comportamiento fuera de distribución: ante observaciones no vistas en entrenamiento la política puede generar acciones erráticas sin señal de confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hofftv/microduck-nugget-roller
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y recetas de entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento: `6ff40704a` en `pollen-robotics/microduck-challenges`
- Esquema del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (ruta citada en la model card; no se proporciona la URL completa)
- Paper, blog o demo: no disponible en la información consultada
