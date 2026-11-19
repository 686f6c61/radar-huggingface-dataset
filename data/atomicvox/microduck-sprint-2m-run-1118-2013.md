# atomicvox/microduck-sprint-2m-run-1118-2013

## Resumen

`atomicvox/microduck-sprint-2m-run-1118-2013` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal que recibe observaciones de 61 dimensiones del estado del robot y emite 14 acciones de control a 50 Hz, empaquetado en formato ONNX para su despliegue directo sobre el hardware. La política se describe como "perpetua": ejecuta una marcha de forma continua hasta que se le indique lo contrario.

El modelo se publica como un artefacto de entrenamiento concreto (run `1118-2013`, checkpoint 1500, semilla 1) generado con el framework `mjlab-microduck` 0.1.0, un entorno de RL basado en MuJoCo. La tarea interna se denomina `Mjlab-Sprint2m-MicroDuck`, lo que sugiere un objetivo de locomoción tipo sprint. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB (probablemente por redondeo de un artefacto pequeño, coherente con un MLP de control y no con un modelo de gran tamaño).

Su relevancia es acotada pero específica: sirve como ejemplo reproducible de un pipeline completo de RL para robótica de bajo coste (entrenamiento con 4096 entornos paralelos, exportación a ONNX con normalizador de observaciones embebido y manifiesto de política versionado). No hay información pública sobre licencia, idiomas ni benchmarks de rendimiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de control para RL (detalles de capas no disponibles); empaquetada como ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Entrada | Observación de 61 dimensiones (normalizador embebido en el ONNX) |
| Salida | 14 acciones de control |
| Frecuencia de control | 50 Hz |
| Framework de entrenamiento | `mjlab-microduck` 0.1.0 (commit `1efd853be`), basado en MuJoCo |
| Checkpoint / semilla | 1500 / 1 |
| Tarea | `Mjlab-Sprint2m-MicroDuck` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, funciones de activación). Se trata de una política de RL para control continuo, exportada a ONNX con el normalizador de observaciones integrado, de modo que el robot puede alimentar observaciones crudas sin preprocesado externo. El manifiesto `manifest.json` sigue el esquema 2 del manifiesto de políticas del daemon de microduck, lo que permite cargarla en una ranura de política mediante `robotctl`.

El entrenamiento se realizó con `mjlab-microduck` 0.1.0 sobre la tarea `Mjlab-Sprint2m-MicroDuck`, con 4096 entornos paralelos, hasta 2000 iteraciones máximas y semilla 1, registrando en TensorBoard bajo el nombre `run-1118-2013`. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no idéntica. No se especifican el algoritmo de RL concreto (PPO, SAC, etc.), la función de recompensa ni la composición del dataset de entrenamiento (en RL, la distribución de estados viene del propio simulador).

## Capacidades

- Locomoción continua tipo sprint sobre el robot microduck, con política "perpetua" que se ejecuta hasta recibir una orden de parada.
- Control en bucle cerrado a 50 Hz a partir de observaciones de 61 dimensiones (estado propioceptivo del robot).
- Generación de 14 comandos de acción por paso de control.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración en el daemon.
- Carga y sustitución en caliente mediante ranuras de política (`robotctl policy load <slot> ...`).
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: es un controlador motriz, no un modelo generativo.

## Casos de uso

- Locomoción de referencia en microduck: cargar la política en una ranura del daemon y ejecutar una marcha de sprint continua para validar la cadena completa hardware-daemon-política antes de entrenar políticas propias.
- Baseline para comparación de políticas: al ser un run con semilla, checkpoint y commit documentados, sirve como punto de referencia reproducible para medir mejoras de nuevas políticas entrenadas en la misma tarea `Mjlab-Sprint2m-MicroDuck`.
- Docencia y prototipado en RL robótico: el pipeline (`uv sync`, `uv run train ... --env.scene.num-envs 4096`) es un ejemplo completo de entrenamiento masivamente paralelo en MuJoCo con exportación a ONNX.
- Pruebas de integración del daemon: el manifiesto schema 2 y el ONNX con normalizador embebido permiten verificar el flujo de carga, normalización y ejecución a 50 Hz sin depender de código de preprocesado adicional.
- Investigación en sim-to-real: permite evaluar la transferencia de una política entrenada en simulación al robot físico y detectar desajustes de dinámica o calibración.
- Benchmarking de hardware de inferencia: al ser un ONNX pequeño con entrada de 61 dimensiones y salida de 14, es útil para medir latencia de inferencia en la CPU del robot o en un companion computer a 50 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, tasa de éxito ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0.0 GB redondeado) y la naturaleza de la política (entrada 61, salida 14), es previsible que quepa en cualquier GPU consumer e incluso en CPU, pero no hay datos confirmados.
- GPU recomendadas: no disponible. Para reentrenar, el comando documentado usa 4096 entornos paralelos, lo que en la práctica requiere una GPU de datacenter (A100/H100 o similar); el autor no especifica el hardware usado.
- Cabe en GPU consumer: probablemente sí para inferencia, sin confirmación en la información disponible.
- Opciones de despliegue: ONNX Runtime a través del daemon de microduck (`robotctl policy load`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles; el requisito funcional es sostener 50 Hz de control.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-2m-run-1118-2013 | Política RL (ONNX) para microduck | 61 obs / 14 acciones | 50 Hz | no disponible | Hugging Face |
| Otras políticas microduck | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre políticas comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una política específica para el robot microduck; no es transferible a otras morfologías sin reentrenamiento.
- No es reproducible bit a bit: el propio autor indica que el mismo comando y semilla producen pesos distintos en otra máquina.
- La licencia no está indicada, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- No hay métricas publicadas de rendimiento, robustez ni sim-to-real; el comportamiento real sobre hardware no está validado en la información disponible.
- El repositorio no tiene descargas ni likes, por lo que no hay evidencia de uso o validación externa.
- El normalizador embebido asume observaciones crudas en el formato esperado por el manifiesto schema 2; un cambio de versión del daemon o del manifiesto puede romper la compatibilidad.
- No aplica riesgo de alucinación ni sesgos lingüísticos, pero sí riesgo de comportamiento inseguro en el robot (caídas, movimientos no deseados) si se ejecuta sin supervisión física.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atomicvox/microduck-sprint-2m-run-1118-2013
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `git@github.com:atomicvox/microduck-challenges.git` (commit `486b7e21a`)
- Base de entrenamiento: `mjlab-microduck` 0.1.0, commit `1efd853be`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
