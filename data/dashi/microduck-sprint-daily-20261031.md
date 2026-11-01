# dashi/microduck-sprint-daily-20261031

## Resumen

`dashi/microduck-sprint-daily-20261031` es una política de aprendizaje por refuerzo (RL) para robótica, no un modelo de lenguaje. Fue publicada por el usuario `dashi` el 31 de octubre de 2026 y constituye una reentrada diaria ("daily re-entry") de la política `dashi/microduck-sprint-remix-r844`, con una puntuación de 0.844. Su función es controlar la marcha (`walk`) del robot microduck, un robot de patas con observaciones de 61 dimensiones y 14 acciones, operando a una frecuencia de 50 Hz.

La política es un fine-tuning (remix) del modelo base `jrubiosainz/microduck-game-sprinter-remix3` y se distribuye en formato ONNX, con el normalizador de observaciones integrado directamente en el fichero `policy.onnx`, lo que simplifica su despliegue: basta alimentar observaciones crudas sin preprocesamiento externo. Su relevancia radica en el ecosistema abierto de políticas de locomoción para microduck, donde las políticas se comparten y remezclan entre usuarios, y en este caso concreto, en su carácter "perpetual": está diseñada para ejecutarse de forma continua hasta que se indique lo contrario.

Cabe destacar que la información pública disponible es muy limitada: no hay model card detallada, benchmarks ni datos de arquitectura interna, y la licencia no está especificada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política RL (arquitectura interna no disponible); formato ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje); entrada de 61 dimensiones por observación a 50 Hz |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), con `manifest.json` (schema 2 del microduck policy manifest) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna de la red (número de capas, tipo de red, dimensiones ocultas). Lo que sí se conoce es la interfaz: la política recibe observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de 50 Hz, el esquema estándar del robot microduck. El normalizador de observaciones está incrustado en el fichero ONNX, de modo que el robot puede alimentar observaciones crudas directamente.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. No se han publicado detalles sobre el algoritmo de RL empleado, el número de pasos de entrenamiento, el uso de simulación (por ejemplo, domain randomization) ni las recompensas utilizadas. El modelo es un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3`, siguiendo la dinámica de "remix" característica de este ecosistema, donde las políticas se iteran a partir de versiones anteriores de otros usuarios. La etiqueta "perpetual" indica que la política está pensada para ejecutarse indefinidamente en el robot sin terminación por episodio.

## Capacidades

- Control de marcha (gait) para el slot `walk` del robot microduck, generando 14 acciones de articulación a 50 Hz.
- Operación perpetua: la política no termina por diseño, adecuada para caminata continua.
- Normalización de observaciones integrada: acepta observaciones crudas de 61 dimensiones sin pipeline de preprocesamiento externo.
- Despliegue directo en robot mediante el daemon de microduck (`robotctl policy load`).
- Compatibilidad con el esquema de manifiesto schema 2 (`manifest.json`) del ecosistema microduck.
- No tiene capacidades de lenguaje, visión, tool calling ni razonamiento: es exclusivamente una política de control motor.

## Casos de uso

- **Caminata continua en microduck**: cargar la política en el slot `walk` del robot para que camine de forma indefinida, útil en demos o pruebas de resistencia del hardware.
- **Punto de partida para remixes**: al ser un fine-tune publicado con metadata completa (repo, rama y commit de entrenamiento), sirve como base para que otros usuarios iteren nuevas políticas de sprint o marcha.
- **Evaluación comparativa de gaits**: con su puntuación de 0.844 heredada de `sprint-remix-r844`, puede usarse como referencia (baseline) para medir mejoras de políticas posteriores en el mismo slot.
- **Pruebas de robustez del normalizador integrado**: al llevar el normalizador dentro del ONNX, es útil para validar despliegues donde no se quiere gestionar estadísticas de normalización por separado.
- **Validación del pipeline de despliegue**: ideal para comprobar que el daemon `robotctl` y el schema 2 del manifiesto funcionan correctamente en un robot físico.
- **Experimentación con reproducción diaria**: el patrón "daily re-entry" permite estudiar la variabilidad entre reentrenamientos diarios de una misma política base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento mencionado es la puntuación de 0.844 asociada a la política original `dashi/microduck-sprint-remix-r844`, de la cual este modelo es una reentrada diaria; no se ha publicado la metodología de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- **Hardware de destino**: el robot microduck; la política está pensada para ejecutarse en su daemon de control a 50 Hz. Al ser un modelo ONNX de política de locomoción (típicamente redes pequeñas, de pocos cientos de miles de parámetros), el tamaño del repositorio figura como 0.0 GB, lo que sugiere un modelo muy ligero.
- **VRAM/GPU**: no se requiere GPU; las políticas ONNX de este tipo suelen ejecutarse en CPU o en el controlador embebido del robot. Requisitos exactos no disponibles.
- **Consumer GPU**: no aplicable; el despliegue previsto es directamente sobre el robot, no sobre estaciones de trabajo con GPU.
- **Despliegue**: mediante el comando oficial `sudo robotctl policy load walk dashi/microduck-sprint-daily-20261031` sobre el daemon de microduck. La librería asociada es `microduck`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI (no aplicable a este tipo de modelo).
- **Latencia**: la política opera a 50 Hz (una inferencia cada 20 ms); latencias y throughput adicionales no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base / relación | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| dashi/microduck-sprint-daily-20261031 | Política RL (walk, perpetual) | jrubiosainz/microduck-game-sprinter-remix3 (fine-tune) | ONNX | no disponible | Reentrada diaria de sprint-remix-r844 (0.844) |
| jrubiosainz/microduck-game-sprinter-remix3 | Política RL (walk) | no disponible | ONNX | no disponible | Modelo base de este remix |
| dashi/microduck-sprint-remix-r844 | Política RL (walk) | no disponible | ONNX | no disponible | Política original reentrada en este modelo, puntuación 0.844 |

No hay datos de rendimiento comparativo publicados entre estas políticas.

## Limitaciones y advertencias

- **Licencia no especificada**: el repositorio no declara licencia, lo que introduce incertidumbre legal sobre su uso, redistribución y explotación comercial. Debe verificarse antes de cualquier uso en producción.
- **Información de entrenamiento escasa**: no se publican detalles del algoritmo de RL, datos de simulación, domain randomization ni procedimientos de validación en el robot físico, por lo que su comportamiento ante perturbaciones no está documentado.
- **Riesgo de comportamiento no verificado**: al ser una reentrada diaria automatizada ("daily re-entry") sin model card detallada, no hay garantías publicadas de que haya superado validación física; se recomienda supervisión al probarla en hardware real.
- **Ámbito restringido**: solo es válida para el slot `walk` del robot microduck con el esquema de 61 observaciones / 14 acciones a 50 Hz; no es transferible a otros robots ni tareas sin reentrenamiento.
- **Trazabilidad parcial**: el entrenamiento referencia un commit concreto (`83599404a`, rama `roll-backward` de `pollen-robotics/microduck_rl`), por lo que la reproducibilidad depende de que ese estado del repositorio siga disponible.
- Los resultados de búsqueda web sobre "dashi" corresponden al caldo japonés y no guardan relación con este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dashi/microduck-sprint-daily-20261031
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio del proyecto microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`; URL no disponible)
