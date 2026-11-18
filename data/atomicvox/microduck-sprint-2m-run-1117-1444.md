# atomicvox/microduck-sprint-2m-run-1117-1444

## Resumen

`microduck-sprint-2m-run-1117-1444` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal exportado a ONNX que mapea observaciones de 61 dimensiones (estado de sensores y articulaciones) a 14 acciones de control a una frecuencia de 50 Hz, implementando una marcha o *gait* concreta denominada "sprint-2m".

El modelo lo publica el usuario `atomicvox` en Hugging Face y se enmarca en una serie de políticas generadas con el framework de entrenamiento `mjlab-microduck`, una base de simulación y RL construida sobre mjlab. La política se carga directamente en el daemon del robot mediante el comando `robotctl policy load`, con el normalizador de observaciones ya embebido en el fichero `policy.onnx`, de modo que el robot puede alimentar observaciones en crudo.

Su relevancia es acotada pero específica: demuestra un flujo completo de entrenamiento en simulación, exportación a ONNX y despliegue en hardware real para robótica de bajo coste. El repositorio no incluye pesos en safetensors ni un modelo generativo, sino un artefacto de control de tamaño reducido (el repo ocupa 0.0 GB según Hugging Face), sin licencia declarada ni idiomas aplicables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (red de política entrenada por RL, exportada a ONNX); arquitectura interna no detallada en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política reactiva a observaciones de 61 dimensiones, sin ventana de contexto) |
| Tipos de cuantización | no disponible (exportación ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en el entorno `Mjlab-Sprint2m-MicroDuck`, definido en el repositorio `atomicvox/microduck-challenges` (rama `main`, commit `bb86ee7da`). El entrenamiento usa la base `mjlab-microduck 0.1.0` en el commit `1efd853be`, con 4096 entornos simulados en paralelo, un máximo de 2000 iteraciones y semilla 1. El checkpoint desplegado corresponde a la iteración 1000, iniciado el 2026-11-17T19:44:33Z y registrado con TensorBoard bajo el nombre de ejecución `run-1117-1444`. La model card indica explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica.

La interfaz del controlador es fija: 61 dimensiones de observación de entrada y 14 acciones de salida a 50 Hz. El normalizador de observaciones está embebido en el propio `policy.onnx`, lo que simplifica la integración con el daemon del robot. La política es de tipo *perpetual*: ejecuta la marcha de forma continua hasta que se le indique lo contrario. No se documentan en la información disponible detalles sobre la topología de la red (número de capas, activaciones, tamaño de las capas ocultas), el algoritmo de RL empleado (PPO u otro), la función de recompensa ni la composición del dataset de entrenamiento más allá de la simulación.

## Capacidades

- Control locomotor del robot microduck mediante una marcha concreta ("sprint-2m"), ejecutada de forma continua a 50 Hz.
- Consumo de observaciones en crudo de 61 dimensiones, con normalización integrada en el grafo ONNX.
- Producción de 14 acciones de control articular/motriz por paso de inferencia.
- Despliegue directo en el robot mediante el comando `robotctl policy load <slot> atomicvox/microduck-sprint-2m-run-1117-1444`.
- Compatibilidad con el esquema 2 del manifiesto de políticas microduck (`manifest.json`).
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: es exclusivamente una política de control motor.

## Casos de uso

- Locomoción de referencia en microduck: cargar la política en un slot del daemon para que el robot ejecute una marcha continua y estable, útil como comportamiento base antes de entrenar variantes.
- Evaluación de pipelines de RL en robótica: usar esta política como punto de comparación reproducible (commit, semilla y comando documentados) frente a nuevas ejecuciones de entrenamiento.
- Pruebas de integración del daemon `robotctl`: validar el flujo de carga de políticas, el manejo de slots y la lectura de `manifest.json` en un robot real o simulado.
- Benchmark de inferencia ONNX en hardware embebido: al ser un grafo ONNX pequeño con normalización incluida, sirve para medir latencia de inferencia a 50 Hz en la computadora del robot.
- Docencia y divulgación en robótica de bajo coste: ejemplo completo de simulación, entrenamiento con RL, exportación y despliegue en un cuadrúpedo de código abierto.
- Base para *fine-tuning* o continuación de entrenamiento: al estar publicados el repositorio, el commit y el comando exacto, se puede partir de este entorno y esta configuración para explorar otras marchas o recompensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es un grafo ONNX de política de control, no un modelo generativo, por lo que su huella es muy reducida (el repositorio ocupa 0.0 GB).
- GPU recomendadas: no disponible. Para el entrenamiento, la configuración documentada usa 4096 entornos simulados en paralelo, lo que en la práctica requiere una GPU de gama alta (A100/H100 o similar), aunque la model card no especifica el hardware empleado.
- ¿Cabe en GPU de consumo? No hay datos publicados; por el tamaño del artefacto de inferencia, es plausible en hardware de consumo, pero no está confirmado en la información disponible.
- Opciones de despliegue: el runtime ONNX en el daemon del robot mediante `robotctl policy load`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política opera a 50 Hz (20 ms por paso de control), según la model card; no se publican latencias medidas ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck comparables ni datos de rendimiento que permitan una comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarla en producción.
- El entrenamiento no es bit-reproducible: misma semilla y mismo código producen políticas comparables, no idénticas, lo que complica la auditoría exacta del comportamiento.
- La política implementa una única marcha ("sprint-2m") y es perpetua; no se documentan capacidades de parada, cambio de marcha o adaptación a terreno variable.
- No se documentan sesgos ni riesgos de alucinación en el sentido lingüístico, pero sí existe riesgo de comportamiento fuera de distribución si el robot se enfrenta a condiciones no vistas en simulación (*sim-to-real gap*).
- No hay información sobre robustez ante perturbaciones, terreno irregular o fallos de sensores.
- El repositorio no contiene documentación sobre la topología de red ni los hiperparámetros de RL, lo que limita la reutilización técnica más allá de la reproducción del comando de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atomicvox/microduck-sprint-2m-run-1117-1444
- Repositorio de entrenamiento: `git@github.com:atomicvox/microduck-challenges.git` (commit `bb86ee7da`, rama `main`)
- Proyecto microduck de Pollen Robotics: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card)
- Base de entrenamiento: `mjlab-microduck 0.1.0` en el commit `1efd853be` (sin URL directa en la información disponible)
