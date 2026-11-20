# GinDuck/microduck-roller-sprint-2m-roller-2-t

## Resumen

`microduck-roller-sprint-2m-roller-2-t` es una política de control por aprendizaje por refuerzo (reinforcement learning) entrenada para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No es un modelo de lenguaje: es un checkpoint de política (policy) que se carga en el daemon del robot y produce acciones de locomoción a 50 Hz a partir de observaciones de 61 dimensiones. El autor es GinDuck y el modelo se publica bajo el pipeline `robotics` con formato ONNX.

El checkpoint corresponde al segundo ciclo de entrenamiento del autor ("roller run"), en esta variante orientada a velocidad pura sobre ruedas (rollers) en lugar de patinaje. Según la model card, completa el recorrido en aproximadamente 1,5 a 1,6 segundos en las pruebas del autor. La política es de tipo "perpetuo": ejecuta una marcha continua hasta que se le indique lo contrario.

La relevancia es acotada: se trata de un artefacto de investigación en robótica con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas especificados. Su interés reside en que documenta de forma reproducible (commit, seed, comando de entrenamiento) un pipeline de RL con `mjlab` sobre el microduck, y en que el normalizador de observaciones va embebido en el ONNX, lo que simplifica el despliegue en el robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning (red neuronal para control robótico); arquitectura interna no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

Otros datos técnicos: frecuencia de control de 50 Hz, 14 acciones de salida, observación de 61 dimensiones, entrenamiento con `mjlab-microduck 0.1.0` (commit base `1efd853be`), `task_id` `Mjlab-RollerSprint2m-MicroDuck`, rama `race-2`, commit `b44f7ffc9`, checkpoint `4500`, seed `1`.

## Arquitectura y entrenamiento

La model card no describe la arquitectura de red de la política (número de capas, tamaño de las capas ocultas ni tipo de red). Lo que sí se documenta es el entorno y el procedimiento: entrenamiento por reinforcement learning en simulación con `mjlab` (versión `mjlab-microduck 0.1.0`, commit `1efd853be`), sobre la tarea `Mjlab-RollerSprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`, rama `race-2`. Se entrenó con 2048 entornos paralelos, un máximo de 6000 iteraciones del agente y seed 1, partiendo del checkpoint 4500.

El autor advierte explícitamente de que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma seed produce una política comparable, no los mismos pesos. El normalizador de observaciones está embebido en `policy.onnx`, de modo que el robot debe alimentar observaciones en crudo. El manifiesto sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.

## Capacidades

- Locomoción sobre ruedas (rollers) del robot microduck: marcha de sprint orientada a velocidad.
- Política "perpetua": mantiene la marcha de forma continua hasta recibir una orden de parada o sustitución.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Carga directa en una ranura de política del robot mediante `robotctl policy load`.
- Normalización de observaciones integrada en el ONNX (no requiere preprocesado externo).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo: es exclusivamente una política de control motor.

## Casos de uso

- Investigación en locomoción con RL: servir como checkpoint de referencia para comparar recetas de entrenamiento de sprint sobre ruedas en el microduck, dado que el autor documenta commit, seed y comando exactos.
- Reproducción de experimentos: reentrenar con el comando publicado (`uv run train Mjlab-RollerSprint2m-MicroDuck --env.scene.num-envs 2048 --agent.max-iterations 6000 --agent.seed 1`) para obtener una política comparable y estudiar la variabilidad entre ejecuciones.
- Pruebas de velocidad en el robot físico: cargar la política en una ranura y medir el tiempo de recorrido, contrastándolo con los 1,5-1,6 segundos reportados por el autor en sus propias pruebas.
- Base para ajuste fino (fine-tuning) de marchas: al partir de un checkpoint concreto (4500) y una tarea definida, puede usarse como inicialización para variantes de gait o de terreno.
- Docencia y divulgación en robótica: ejemplo completo y reproducible de un pipeline de RL sim-a-real sobre hardware abierto como el microduck.
- Evaluación de infraestructura de despliegue: validar el flujo `robotctl policy load` y el esquema 2 de manifiestos en el daemon del robot con un artefacto ONNX real.
- Comparación de estrategias de locomoción: contrastar esta política de sprint sobre ruedas con otras del mismo autor (por ejemplo, variantes de patinaje) para analizar el compromiso entre velocidad y estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado por el autor es cualitativo y de sus propias pruebas: tiempo de finalización de aproximadamente 1,5 a 1,6 segundos. No se especifica la longitud del recorrido, las condiciones del terreno ni la métrica exacta, por lo que no es comparable de forma rigurosa con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se publica el número de parámetros de la política. Por la naturaleza del artefacto (política de control para un robot de pequeñas dimensiones), la inferencia se ejecuta en la computadora del propio robot, no en GPU de servidor.
- GPU recomendadas: no aplica para inferencia en el robot. Para reentrenamiento, la model card indica 2048 entornos paralelos, lo que requiere una GPU de gama alta (modelo concreto no especificado).
- Cabe en GPU de consumo: la inferencia está pensada para el hardware del microduck; el reentrenamiento con 2048 entornos paralelos probablemente excede GPUs de consumo, aunque no se aporta dato concreto.
- Opciones de despliegue: `robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-t` sobre el daemon del microduck; runtime ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: control a 50 Hz (periodo de 20 ms por paso); no se publican cifras de latencia de inferencia ni de throughput del entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GinDuck/microduck-roller-sprint-2m-roller-2-t | Política RL para microduck (sprint con rollers) | 61-D / 14 acciones | 50 Hz | ONNX | no disponible | Hugging Face, 0 descargas |
| Otras políticas del mismo autor (variantes de roller run / skating) | Política RL para microduck | no disponible | 50 Hz (según el entorno microduck) | ONNX (previsible) | no disponible | Referenciadas en la model card, sin identificadores concretos |
| Políticas del repositorio `pollen-robotics/microduck-challenges` | Políticas RL de referencia para retos del microduck | Depende de la tarea | Depende de la tarea | no disponible | no disponible | Repositorio público de GitHub |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas ni genera código; cualquier uso fuera del control del microduck es inadecuado.
- Licencia no declarada: no hay información sobre permisos de uso comercial, modificación o redistribución. Antes de cualquier uso en producción es necesario contactar con el autor.
- Entrenamiento no reproducible bit a bit: los pesos exactos no pueden regenerarse, solo obtenerse políticas comparables.
- Rendimiento validado únicamente en las pruebas del autor: el tiempo de 1,5-1,6 segundos no especifica distancia, terreno ni condiciones, y no hay benchmarks públicos.
- Especialización estrecha: la política está entrenada para una tarea concreta (sprint con rollers) y un robot concreto (microduck); no se espera transferencia a otros morfologías o terrenos.
- Sin datos de robustez: no se documenta comportamiento ante perturbaciones, cambios de superficie, fallos de sensores ni límites de seguridad.
- Ausencia de métricas de sesgo o alucinación: no aplican en el sentido habitual, pero tampoco se publican evaluaciones de estabilidad o seguridad de la política.
- Artefacto sin tracción comunitaria (0 descargas, 0 likes) y con fecha de creación posterior a la consulta de referencia; conviene verificar su vigencia y posibles actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-t
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card, sin URL directa)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
