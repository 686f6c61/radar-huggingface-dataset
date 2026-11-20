# DenRakEiw/microduck-songkran-duck-tug5

## Resumen

`microduck-songkran-duck-tug5` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es una política neuronal que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, diseñada para ejecutar de forma perpetua la tarea de "tirar de la cuerda" (Tug of War) definida en el entorno de simulación Mjlab.

El artefacto se distribuye como un fichero `policy.onnx` con el normalizador de observaciones integrado, junto con un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. El autor (DenRakEiw) lo publica como una "gait" (marcha) cargable en una ranura de política del daemon `robotctl`, lo que permite desplegarla directamente en hardware real mediante un único comando.

Es relevante en el contexto de la robótica open source de bajo coste y del entrenamiento de políticas con RL masivamente paralelo: el modelo documenta de forma detallada el pipeline de entrenamiento (repositorio, commit, checkpoint, semilla y comando exacto de reproducción), lo que facilita la replicabilidad y el estudio de currículos de recompensas y adversarios sintéticos. La información disponible sobre el modelo es muy limitada en cuanto a métricas de rendimiento, licencia e idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (entrenada con RL en Mjlab); topología de red no especificada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (exportación a ONNX; no se documentan niveles de cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La política se entrena en el entorno `Mjlab-TugOfWar-MicroDuck`, perteneciente al repositorio `pollen-robotics/microduck-challenges` (rama `denrakeiw-070`, commit `6c0b5d452`), sobre la base `mjlab-microduck 0.1.0 @ 1efd853be`. El entrenamiento se realizó con 4096 entornos paralelos, un máximo de 2500 iteraciones, semilla 18 y checkpoint final `10800`, partiendo de un run previo (`2026-11-18_19-30-09_tw23-d03`, checkpoint `model_8900.pt`). Se emplea un currículo de recompensas y restricciones que incluye pesos para `pit-margin-reward` (2.0), `marker-verdict` (50.0), `settle-gap` (10.0), `back-pull` (2.0), `track-linear-velocity` (1.0), `head-pose-tracking` (0.8) y `heading-hold` (0.4), además de penalizaciones como `exploded-out` (-100.0). El agente utiliza un coeficiente de entropía de 0.001.

Una innovación destacable es el uso de un adversario sintético ("sparring") cargado desde una política ONNX (`titan-v1/policy.onnx` con peso 0.7 y `reference` con 0.3), con retardo de inicio de 3 iteraciones y dispersión de 3, así como terminaciones específicas (`opponent-in-pit.time-out`) y un currículo de tasa de acción y sesgo de pose de cabeza. El autor advierte que el entrenamiento con RL en GPU no es bit-reproducible entre máquinas: la misma semilla y comando producen una política comparable, no idéntica.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Ejecución perpetua de una marcha (gait) orientada a la tarea de tirar de la cuerda, sin condición de terminación propia.
- Normalización de observaciones integrada en el propio `policy.onnx`, de modo que se alimentan observaciones en bruto.
- Carga en una ranura de política del daemon `robotctl` mediante `sudo robotctl policy load <slot> DenRakEiw/microduck-songkran-duck-tug5`.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2).
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: sirve como política de referencia reproducible para estudiar el efecto de currículos de recompensas y adversarios sintéticos en tareas de tracción.
- Competición o benchmark de "tirar de la cuerda": la política está entrenada específicamente para esta tarea y puede enfrentarse a otras políticas en el entorno Mjlab-TugOfWar-MicroDuck.
- Despliegue en hardware microduck real: mediante `robotctl policy load` se carga en una ranura y se ejecuta de forma continua en el robot físico.
- Docencia y divulgación en robótica de bajo coste: el modelo y su comando de reproducción permiten ilustrar un pipeline completo de simulación a realidad (sim-to-real) con RL.
- Base para fine-tuning o continuación de entrenamiento: al documentarse el checkpoint, la semilla y el comando exactos, puede reanudarse el entrenamiento con variaciones de recompensa.
- Pruebas de robustez de controladores: al ser una política perpetua, puede utilizarse como adversario o como sujeto de pruebas de estrés en simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control exportada a ONNX con observaciones de 61 dimensiones y 14 acciones, la huella es presumiblemente muy reducida, pero no se documenta el tamaño del fichero ni el número de parámetros.
- GPU recomendadas: no disponible para inferencia; para reentrenamiento, el comando documentado usa 4096 entornos paralelos, lo que requiere una GPU de datacenter (A100/H100 o similar), aunque no se especifica el hardware exacto empleado.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio es de 0.0 GB, lo que sugiere un artefacto muy pequeño, pero no se confirma.
- Opciones de despliegue: ONNX Runtime a través del daemon `robotctl` de microduck; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; la política opera a 50 Hz según la model card.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables de la misma categoría (control de microduck para Tug of War) con parámetros, contexto, rendimiento y licencia documentados.

## Limitaciones y advertencias

- Licencia no especificada: no puede asumirse uso comercial sin confirmación del autor.
- Ámbito muy restringido: es una política específica para la tarea Mjlab-TugOfWar-MicroDuck y el robot microduck; no es un modelo de propósito general.
- No reproducible bit a bit: el propio autor advierte que el RL en GPU no es determinista entre máquinas.
- Exportada desde un checkout con cambios sin commitear, lo que puede dificultar la reproducción exacta.
- Sin datos de benchmarks, sesgos, robustez sim-to-real ni comportamiento fuera de distribución.
- Sin información sobre idiomas, cuantización ni requisitos de hardware de inferencia.
- Riesgo de fallo en hardware real no documentado (diferencias de dinámica, fricción, calibración).

## Enlaces

- Hugging Face: https://huggingface.co/DenRakEiw/microduck-songkran-duck-tug5
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos/entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento: `6c0b5d452` (rama `denrakeiw-070`)
- Base de simulación: `mjlab-microduck 0.1.0 @ 1efd853be`
