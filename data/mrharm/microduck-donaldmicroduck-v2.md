# mrharm/microduck-donaldmicroduck-v2

## Resumen

`mrharm/microduck-donaldmicroduck-v2` es una política de control para el robot microduck de Pollen Robotics, no un modelo de lenguaje. Se distribuye como un fichero ONNX (`policy.onnx`) que se carga en una ranura de política del daemon del robot mediante `robotctl`, con el objetivo de producir una marcha perpetua sobre rodillos. La model card la describe como una estrategia nueva con un resultado "ligeramente mejor" que su predecesora, aunque no se publican métricas numéricas que respalden esa afirmación.

El modelo consume una observación de 61 dimensiones y emite 14 acciones a 50 Hz, es decir, un bucle de control con un presupuesto de 20 ms por paso. El normalizador de observaciones está incorporado dentro del propio ONNX, de modo que la política espera observaciones en crudo. Se entrenó con aprendizaje por refuerzo sobre la tarea `Mjlab-RollerSprint2m-MicroDuck` (un esprint de 2 metros sobre rodillos), partiendo de `mjlab-microduck 0.1.0`.

Su relevancia es acotada pero concreta: forma parte de un ecosistema abierto de robótica (hardware microduck, repositorio de retos y pipeline de entrenamiento reproducible) y sirve como ejemplo de extremo a extremo de sim-to-real con exportación a ONNX. El repositorio de HuggingFace registra 0 descargas y 0 likes, y no declara licencia, idiomas ni número de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con aprendizaje por refuerzo (base `mjlab-microduck 0.1.0 @ 8d0dbc94c`); topología de red no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso de control |
| Tipos de cuantizacion | no disponible (se distribuye un único fichero ONNX sin detallar precisión) |
| Idiomas soportados | no aplica (política robótica; no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz (presupuesto de 20 ms por paso) |
| Tarea de entrenamiento | `Mjlab-RollerSprint2m-MicroDuck` |
| Checkpoint / semilla | checkpoint `2250`, semilla `6969` |
| Tamano del repositorio | 0,0 GB (según HuggingFace) |

## Arquitectura y entrenamiento

La model card no detalla la topología de la red (número de capas, unidades ocultas ni tipo de activaciones), por lo que ese dato queda como no disponible. Lo que sí se especifica es la interfaz: 61 entradas de observación, 14 salidas de acción y ejecución a 50 Hz sobre un robot microduck equipado con rodillos. El normalizador de observaciones va embebido en `policy.onnx`, de forma que la política se alimenta con observaciones sin preprocesar. La política es "perpetua": una vez cargada en su ranura, mantiene la marcha hasta que se le indique lo contrario.

El entrenamiento se realizó sobre el repositorio `pollen-robotics/microduck-challenges`, rama `main`, commit `3cc03f144`, con 2048 entornos paralelos, hasta 100.000 iteraciones máximas, semilla 6969 y registro en TensorBoard (ejecución `run-1014-1454`). El entrenamiento arrancó el 14 de octubre de 2026 a las 12:55:17 UTC. El autor advierte explícitamente de que el proceso no es bit-reproducible entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no los mismos pesos. No se documenta composición del dataset (no aplica, es RL), ni uso de RLHF o DPO, ni innovaciones de decodificación.

## Capacidades

- Generación de marcha sobre rodillos para el robot microduck: convierte observaciones de 61 dimensiones en 14 comandos de acción a 50 Hz.
- Ejecución continua: la política está diseñada para funcionar de forma perpetua hasta que se detiene o se sustituye explícitamente.
- Normalización integrada: acepta observaciones en crudo, sin pipeline de preprocesado externo.
- Despliegue mediante `robotctl policy load <slot> mrharm/microduck-donaldmicroduck-v2`, con manifiesto compatible con el esquema 2 del daemon de microduck.
- Reproducibilidad parcial del entrenamiento: se publican tarea, commit, semilla, checkpoint y comando exacto de entrenamiento.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No dispone de tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües (no procesa lenguaje).

## Casos de uso

- Locomoción de referencia sobre rodillos: cargar la política en una ranura del microduck para validar que el robot mantiene una marcha estable a 50 Hz durante un esprint de 2 metros, que es la tarea con la que se entrenó.
- Comparación de políticas en la misma plataforma: al ser una "estrategia nueva" sobre la tarea `Mjlab-RollerSprint2m-MicroDuck`, sirve como punto de comparación frente a otras políticas cargadas en otras ranuras del mismo robot.
- Demostración docente de sim-to-real: permite mostrar el ciclo completo entrenamiento en simulación, exportación a ONNX y despliegue en hardware real, con un comando de reproducción documentado.
- Investigación en entrenamiento masivo en paralelo: el comando publicado usa 2048 entornos simultáneos, útil como plantilla para medir escalado de RL en GPU y consumo de recursos.
- Pruebas de robustez del controlador a 50 Hz: verificar en el banco que la inferencia ONNX cabe en el presupuesto de 20 ms por paso con el hardware del robot.
- Base para ajuste fino de nuevas tareas: partir del commit `3cc03f144` y la semilla 6969 para entrenar variantes (otras distancias, otras superficies) manteniendo la interfaz de 61 observaciones y 14 acciones.
- Exposición o demo de robótica en eventos: al ser una política perpetua, el robot puede mantenerse en marcha sin intervención durante una demostración pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente afirma de forma cualitativa que la estrategia nueva obtiene un resultado "ligeramente mejor" que la anterior ("New strategy, slightly better result"), sin cifras de recompensa, velocidad, distancia recorrida, tasa de caídas ni comparación cuantitativa con otras políticas.

| Metrica | Este modelo | Alternativas |
|---|---|---|
| Recompensa de tarea | no disponible | no disponible |
| Distancia / tiempo en esprint de 2 m | no disponible | no disponible |
| Tasa de exito o de caidas | no disponible | no disponible |
| Estabilidad de la marcha | no disponible | no disponible |

## Requisitos de hardware

- Entrenamiento: el comando publicado lanza 2048 entornos paralelos y hasta 100.000 iteraciones, lo que en la práctica exige aceleración por GPU; la model card no especifica modelo de GPU, VRAM ni tiempo total de entrenamiento.
- Inferencia: se ejecuta un único fichero ONNX sobre el daemon del robot microduck. No se publica tamaño del fichero (el repositorio reporta 0,0 GB), número de parámetros ni VRAM necesaria.
- Presupuesto temporal: a 50 Hz, la inferencia debe completarse en menos de 20 ms por paso para no perder el ritmo de control.
- GPU de consumo: no disponible. Al tratarse de una política de control exportada a ONNX y ejecutada junto al daemon, es plausible que corra en CPU, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: `robotctl policy load <slot> mrharm/microduck-donaldmicroduck-v2` sobre el daemon de microduck y runtime de ONNX. vLLM, llama.cpp, Ollama o TGI no son aplicables.
- Latencia y throughput: no disponibles; solo se conoce la frecuencia de control objetivo de 50 Hz.
- Reproducción del entrenamiento: `uv sync` y `uv run train Mjlab-RollerSprint2m-MicroDuck --env.scene.num-envs 2048 --agent.max-iterations 100000 --agent.seed 6969 --agent.logger tensorboard`.

## Comparativa con modelos similares

No se dispone de datos públicos de rendimiento de políticas comparables en la información proporcionada. El repositorio `microduck-challenges` alberga con toda probabilidad otras políticas para la misma plataforma, pero no se han facilitado sus métricas, tamaños ni licencias.

| Modelo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-donaldmicroduck-v2 | no disponible | 61-D de observación, 14 acciones, 50 Hz | no disponible ("ligeramente mejor" sin cifras) | no disponible | HuggingFace, 0 descargas |
| Otras políticas de microduck | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas de locomoción de otros cuadrúpedos o robots con ruedas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay permiso explícito de uso comercial, modificación ni redistribución; en producción esto es un riesgo legal directo.
- Sin métricas publicadas: la mejora respecto a la versión anterior se afirma de forma cualitativa, sin curvas de recompensa, tasas de éxito ni vídeos de evaluación.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni reportes de terceros.
- Especialización estrecha: la política está entrenada para la tarea `Mjlab-RollerSprint2m-MicroDuck`, sobre rodillos y con una morfología concreta; no se documenta su comportamiento en otras superficies, pendientes o configuraciones del robot.
- Riesgo de brecha sim-to-real: no se documenta aleatorización de dominio, robustez a perturbaciones ni comportamiento ante fallos del estimador de estado.
- Ejecución perpetua: al ser una política que corre hasta que se le indique lo contrario, requiere un mecanismo externo de parada segura en cualquier despliegue físico.
- No reproducibilidad bit a bit: el propio autor advierte de que repetir el entrenamiento no devuelve los mismos pesos, lo que dificulta auditar el resultado.
- La alucinación no aplica, pero sí el riesgo de acciones fuera de distribución ante observaciones anómalas, sin umbrales de seguridad documentados.
- Sin información sobre sesgos, idiomas ni contexto en el sentido de los modelos de lenguaje: esas categorías no son aplicables a esta política.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrharm/microduck-donaldmicroduck-v2
- Robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Esquema del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (citado en la model card; URL completa no disponible)
- Base de entrenamiento: `mjlab-microduck 0.1.0 @ 8d0dbc94c` (commit citado en la model card; URL no disponible)
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos corresponden a foros de Diablo IV y no guardan relación con el contenido de esta ficha.
