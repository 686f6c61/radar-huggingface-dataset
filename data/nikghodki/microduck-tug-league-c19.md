# nikghodki/microduck-tug-league-c19

## Resumen

`nikghodki/microduck-tug-league-c19` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste MicroDuck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal exportado a ONNX que genera comandos motores a partir de observaciones del estado del robot. El autor lo publica como una "política perpetua" (perpetual policy): una marcha que se ejecuta de forma continua hasta que se le indique lo contrario, cargada en una ranura de política del demonio `robotctl`.

El modelo se enmarca en la tarea `Mjlab-TugOfWar-MicroDuck`, un escenario de simulación de tira y afloja (tug of war) definido en el repositorio `microduck-challenges` de Pollen Robotics, sobre la rama `duel-pool`. La política consume observaciones de 61 dimensiones y produce 14 acciones a 50 Hz, con el normalizador de observaciones integrado en el propio fichero `policy.onnx`.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de RL con simulación física (mjlab, basado en MuJoCo) hasta despliegue en un robot real de bajo coste, con instrucciones exactas de entrenamiento, semilla y checkpoint. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los pesos no están efectivamente alojados o que la información de tamaño no es fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (arquitectura interna no detallada); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (exportación ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no aplica; salida de acciones motoras) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La política se entrenó con aprendizaje por refuerzo en simulación mediante mjlab (framework de RL sobre MuJoCo) con la tarea `Mjlab-TugOfWar-MicroDuck`, definida en el repositorio `microduck-challenges` de Pollen Robotics, rama `duel-pool`. El entrenamiento partió de la base `mjlab-microduck 0.1.0` en el commit `1efd853be`, con semilla 19, 4096 entornos en paralelo, un máximo de 200 iteraciones y reanudación desde el checkpoint `model_3582.pt` del run `2026-11-10_15-45-18_L1-c18`. El checkpoint final es el `3781`. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el proceso con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no los mismos pesos.

El modelo consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz. El normalizador de observaciones está embebido en el ONNX, de modo que el consumidor debe alimentar observaciones en bruto. El manifiesto sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del demonio. No se detalla en la información disponible la topología de la red (número de capas, activaciones, tamaño de las capas ocultas) ni el algoritmo de RL empleado (PPO u otro), ni la composición del dataset de entrenamiento más allá de la simulación.

## Capacidades

- Control locomotor del MicroDuck en el escenario de tira y afloja (`Mjlab-TugOfWar-MicroDuck`), con 14 acciones motoras a 50 Hz.
- Política perpetua: mantiene la marcha de forma continua hasta que se le indique lo contrario.
- Consumo de observaciones de 61 dimensiones en bruto, con normalización integrada en el ONNX.
- Despliegue directo en robot real mediante `robotctl policy load <slot> nikghodki/microduck-tug-league-c19`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: es un controlador motor, no un modelo generativo.

## Casos de uso

- Despliegue en un MicroDuck físico para la tarea de tira y afloja: cargar la política en una ranura con `robotctl policy load` y alimentar observaciones en bruto; el normalizador embebido elimina la necesidad de preprocesado en el cliente.
- Referencia reproducible para investigación en RL robótico: el autor documenta task_id, rama, commit, checkpoint, semilla y comando exacto, lo que permite reentrenar y obtener una política comparable para estudiar la variabilidad entre máquinas.
- Prueba de integración del demonio `robotctl`: sirve para validar el flujo de carga de políticas y el esquema 2 de manifiestos en un entorno real.
- Benchmark de simulación a realidad en robots de bajo coste: permite medir cuánto se degrada una política entrenada en mjlab con 4096 entornos al transferirse a hardware físico.
- Base para ajuste fino o continuación del entrenamiento: al partir de un checkpoint concreto y una semilla documentada, se puede reanudar el entrenamiento en la rama `duel-pool` para explorar variantes de la tarea.
- Docencia y demostraciones de RL con MuJoCo: el pipeline completo (entrenamiento, exportación ONNX, despliegue) es un ejemplo compacto para cursos de robótica y aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo figura como 0.0 GB, por lo que no es posible estimar a partir de los datos publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el demonio `robotctl` con `policy load`; inferencia ONNX (runtime no especificado en la información disponible).
- Latencia y throughput: no disponibles; la política opera a 50 Hz, lo que fija un presupuesto de 20 ms por paso de control.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye políticas comparables del mismo repositorio ni métricas de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse permiso para uso comercial ni para redistribución.
- El repositorio tiene 0 descargas y 0 likes y el tamaño figura como 0.0 GB; verificar la integridad y presencia real de `policy.onnx` antes de depender de él.
- Entrenamiento no bit-reproducible: replicar el comando no garantiza los mismos pesos, solo una política comparable.
- Exportado desde un checkout con cambios sin commitear (`exported from a checkout with uncommitted changes`), lo que reduce la trazabilidad exacta del artefacto.
- Específica de la tarea `Mjlab-TugOfWar-MicroDuck`: no se documenta su comportamiento fuera de ese escenario ni su robustez ante perturbaciones no simuladas.
- Sin datos sobre sesgos, alucinación o comportamiento en producción más allá de lo indicado; al ser un controlador motor, los riesgos relevantes son de seguridad física del robot y de degradación de la política ante distribución distinta a la de entrenamiento.
- No se detalla la topología de la red ni los parámetros totales, lo que impide estimar requisitos de cómputo a priori.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikghodki/microduck-tug-league-c19
- Repositorio de retos de MicroDuck: https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot MicroDuck: https://github.com/pollen-robotics/microduck
