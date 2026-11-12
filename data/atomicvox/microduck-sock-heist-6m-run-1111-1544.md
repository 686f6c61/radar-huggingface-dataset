# atomicvox/microduck-sock-heist-6m-run-1111-1544

## Resumen

`sock-heist-6m-run-1111-1544` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck, un proyecto de hardware abierto mantenido por Pollen Robotics. No es un modelo de lenguaje: es una política perpetua que se ejecuta en bucle a 50 Hz sobre el robot real, consumiendo observaciones de 61 dimensiones y emitiendo 14 acciones de control. El autor, atomicvox, la publica en Hugging Face bajo el formato ONNX y la librería `microduck`.

El modelo se enmarca en un flujo de trabajo de entrenamiento con `mjlab` (entorno de simulación basado en MuJoCo) y se distribuye junto con un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon de microduck. Su propósito es concreto: proporcionar una marcha o comportamiento motriz cargable en una ranura de política del robot mediante el comando `robotctl policy load`.

La relevancia es acotada pero clara para quien trabaja con robótica open source: demuestra un pipeline reproducible de entrenamiento RL (4096 entornos, 1000 iteraciones, semilla fija) y un formato de empaquetado estandarizado para desplegar políticas en hardware real. El repositorio, sin embargo, está vacío (0.0 GB) y no incluye pesos ni documentación adicional más allá de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control para robótica (red neuronal; detalles de capas no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (control robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

Otros datos operativos: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz, comportamiento perpetuo (se ejecuta hasta recibir orden de parada).

## Arquitectura y entrenamiento

La política se entrenó con `mjlab-microduck 0.1.0` (commit `1efd853be`), un entorno de simulación construido sobre MuJoCo, usando el repositorio `atomicvox/microduck-challenges` (rama `main`, commit `bd2ddee1d`). El entrenamiento se ejecutó con 4096 entornos paralelos, 1000 iteraciones máximas, semilla 1, checkpoint 999 y registro en TensorBoard bajo el nombre `run-1111-1544`. La tarea se identifica como `Mjlab-SockHeist6m-MicroDuck`.

La normalización de observaciones está integrada en el propio archivo `policy.onnx`, de modo que el robot debe alimentar observaciones en bruto. El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el mismo comando con la misma semilla produce una política comparable, no idéntica. No se detalla en la información disponible la arquitectura interna de la red (número de capas, activaciones, tamaño de las capas ocultas), ni el algoritmo RL concreto (PPO, SAC, etc.), ni la composición del dataset de simulación más allá de los parámetros de entrenamiento indicados.

## Capacidades

- Control motriz de un robot cuadrúpedo microduck con observaciones de 61 dimensiones y 14 acciones a 50 Hz.
- Ejecución de una marcha o comportamiento continuo ("perpetuo") hasta que el daemon recibe una orden de parada.
- Carga en una ranura de política del robot mediante `robotctl policy load <slot> <repo>`.
- Inferencia con observaciones en bruto: la normalización está embebida en el ONNX.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2).
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión, audio ni razonamiento simbólico, por tratarse de una política de control.

## Casos de uso

- **Demostración de marcha en microduck real**: cargar la política en una ranura con `robotctl policy load` y ejecutar el robot para observar el comportamiento entrenado en simulación. Adecuado por su formato ONNX y su manifiesto compatible con el daemon.
- **Punto de partida para fine-tuning o comparación de políticas**: usar el commit y la semilla documentados para reproducir el pipeline con `uv run train` y generar políticas comparables, evaluando variaciones de hiperparámetros.
- **Validación de pipelines sim-to-real**: probar en hardware una política entrenada con 4096 entornos paralelos y comprobar la transferencia del comportamiento, dado que la normalización va embebida y las observaciones se alimentan en bruto.
- **Integración en el daemon de microduck**: servir como ejemplo de política conforme al esquema 2 del manifiesto para desarrolladores que construyan sus propias ranuras o herramientas de gestión.
- **Docencia e investigación en RL robótico**: emplear la receta de entrenamiento (mjlab, MuJoCo, seed fija) como caso práctico reproducible en cursos o laboratorios, con la salvedad de la no reproducibilidad bit a bit.
- **Benchmark interno de controladores**: comparar esta marcha con otras políticas del mismo robot en métricas de estabilidad, velocidad o consumo, usando la misma interfaz de observación y acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible; el tamaño del repositorio es 0.0 GB y no se especifica el tamaño del archivo ONNX ni el número de parámetros.
- **GPU recomendadas**: no disponible. Al tratarse de una política de control a 50 Hz para un robot de bajo coste, es plausible que la inferencia sea ligera, pero no hay datos que lo confirmen.
- **Compatibilidad con GPU de consumo**: no disponible.
- **Opciones de despliegue**: el despliegue previsto es en el propio robot mediante el daemon de microduck y `robotctl policy load`; el formato ONNX permite inferencia con ONNX Runtime, pero no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de modelo).
- **Latencia y throughput**: no disponibles; la frecuencia de control objetivo es 50 Hz (periodo de 20 ms), pero no se indica si se cumple en hardware concreto.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables para microduck ni alternativas de la misma categoría con datos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El repositorio tiene un tamaño de 0.0 GB: no se confirma que los pesos (`policy.onnx`) estén efectivamente alojados; verificar antes de usarlo.
- La licencia no está disponible, lo que impide determinar si el uso comercial está permitido.
- El entrenamiento no es reproducible bit a bit: la misma semilla y comando generan una política comparable, no idéntica.
- La política es específica del robot microduck y de su interfaz de 61 observaciones y 14 acciones; no es transferible a otro hardware sin reentrenamiento.
- No hay información sobre sesgos, alucinación (no aplica a control) ni robustez ante perturbaciones del entorno real.
- No se documentan límites de seguridad, parada de emergencia ni comportamiento ante fallos del daemon; en producción robótica esto requiere validación propia.
- El pipeline depende de versiones concretas (`mjlab-microduck 0.1.0`, `uv.lock` del repositorio) y de un commit específico; cambios en dependencias pueden romper la reproducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atomicvox/microduck-sock-heist-6m-run-1111-1544
- Repositorio de entrenamiento: `git@github.com:atomicvox/microduck-challenges.git` (rama `main`, commit `bd2ddee1d`)
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (ruta citada en la model card; URL completa no disponible)
