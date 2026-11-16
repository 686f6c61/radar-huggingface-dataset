# rumezhak/microduck-sprint-daily-2026-11-17

## Resumen

microduck-sprint-daily-2026-11-17 es una politica de control robotico entrenada mediante aprendizaje por refuerzo para el robot cuadrupedo microduck de Pollen Robotics. Se publica como un artefacto ONNX autocontenido que se carga directamente en una ranura de politica del demonio `robotctl` del robot, sin necesidad de infraestructura de inferencia adicional. El modelo no es un modelo de lenguaje ni un transformer generativo: es una politica de control reactiva que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz.

El nombre sugiere una politica de tipo "sprint" (marcha rapida) generada en un ciclo de trabajo diario correspondiente al 17 de noviembre de 2026. El autor es `rumezhak` y el repositorio asociado es `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. La model card es extremadamente escueta: no incluye informacion sobre arquitectura de red, hiperparametros de entrenamiento, recompensas ni datos de evaluacion.

La relevancia de esta ficha es limitada pero concreta: documenta un ejemplo de publicacion de politicas de RL para robotica de bajo coste en Hugging Face, con un formato de despliegue estandarizado (manifiesto esquema 2, ONNX con normalizador embebido) que simplifica la reproducibilidad en hardware real. No obstante, la ausencia de datos tecnicos y de benchmarks impide una evaluacion cuantitativa rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de RL exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica reactiva, sin contexto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

Especificaciones adicionales declaradas en la model card:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (se ejecuta hasta recibir orden de parada) |
| Normalizador de observaciones | embebido en `policy.onnx` (se alimenta con observaciones crudas) |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repositorio | 0.0 GB (reportado por Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura de red de la politica. La model card solo indica que se entrena con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`), sin especificar el algoritmo (PPO, SAC, etc.), el numero de pasos de entorno, la funcion de recompensa ni el proceso de dominio aleatorio. Tampoco se detalla la topologia de la red (MLP, LSTM, transformer ligero) ni el numero de parametros.

El unico detalle tecnico relevante es que el normalizador de observaciones esta embebido dentro del grafo ONNX, de modo que el consumidor debe alimentar observaciones crudas sin preprocesar. El artefacto se acompaña de un `manifest.json` conforme al esquema 2 del manifiesto de politicas de microduck, documentado en `docs/policy-manifest.md` del repositorio del demonio. No se documentan innovaciones como decodificacion especulativa, atencion lineal ni tecnicas de destilacion.

## Capacidades

- Control locomotor de un robot cuadrupedo microduck con 61 entradas de observacion y 14 salidas de accion.
- Ejecucion de una marcha ("sprint") de forma perpetua hasta que el operador la detenga.
- Inferencia a 50 Hz, adecuada para control reactivo en tiempo real.
- Carga directa en una ranura de politica del demonio `robotctl` mediante el comando `sudo robotctl policy load <slot> rumezhak/microduck-sprint-daily-2026-11-17`.
- Autocontenida: el normalizador de observaciones va incluido en el ONNX, lo que elimina pasos de preprocesado externos.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Despliegue de una marcha de prueba en un microduck fisico: cargar la politica en una ranura con `robotctl policy load` y evaluar la locomocion en banco o en suelo. Es adecuado porque el artefacto esta empaquetado para ese flujo exacto.
- Comparacion de politicas en un mismo robot: al ocupar una ranura independiente, permite alternar entre esta marcha y otras politicas publicadas para el mismo hardware y medir diferencias de comportamiento.
- Docencia e investigacion en RL aplicado a robotica: sirve como ejemplo de artefacto reproducible con manifiesto estandarizado y normalizador embebido, util para ensenar el ciclo entrenamiento-exportacion-despliegue.
- Pruebas de integracion del demonio `robotctl`: validar el esquema 2 del manifiesto y el cargador de politicas ONNX con un artefacto real.
- Benchmarking de infraestructura de inferencia en el robot: medir latencia y estabilidad de una politica ONNX a 50 Hz en el hardware embebido del microduck.
- Base para ajuste fino o destilacion: al estar vinculada a un repositorio de entrenamiento publico (`microduck_rl`), puede servir como punto de partida para reentrenar o modificar la recompensa, siempre que la licencia lo permita (no declarada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, velocidad de marcha, estabilidad, tasa de caidas ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una politica de control de dimensiones reducidas (61 entradas, 14 salidas) exportada a ONNX, es probable que quepa en memoria de un dispositivo embebido, pero no se confirma el tamano del modelo.
- GPU recomendadas: no aplica en el caso de uso previsto; la inferencia se ejecuta en el propio robot microduck a traves de `robotctl`.
- Compatibilidad con GPU de consumo: no disponible; no se especifica si el ONNX requiere aceleracion por GPU o si corre en CPU.
- Opciones de despliegue: `robotctl` (demonio de microduck) con `policy load`; el artefacto es un ONNX estandar, por lo que en teoria podria ejecutarse con ONNX Runtime fuera del robot, aunque no se documenta ese flujo.
- Latencia y throughput: se declara una frecuencia de control de 50 Hz (periodo de 20 ms), pero no se publican mediciones reales de latencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas de microduck ni artefactos comparables con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier explotacion.
- No se documentan sesgos, pero al ser una politica de RL entrenada en simulacion (presumiblemente), puede presentar un desfase sim2real no cuantificado.
- Riesgo de comportamiento impredecible fuera de las condiciones de entrenamiento: sin datos de dominio aleatorio ni evaluacion, no hay garantias de robustez ante terrenos o perturbaciones no vistos.
- Ausencia total de benchmarks: no es posible verificar la calidad de la marcha ni compararla con alternativas.
- La model card no especifica la topologia de red, el algoritmo de RL ni los hiperparametros, lo que dificulta la reproducibilidad.
- El repositorio reporta 0.0 GB, lo que puede indicar un artefacto muy pequeno o un problema de empaquetado; conviene verificar la integridad de `policy.onnx` y `manifest.json` antes de cargarlo en hardware real.
- El nombre incluye una fecha futura (2026-11-17) y el modelo se creo el 2026-11-16; se trata de un artefacto de ciclo corto ("sprint daily") sin garantia de mantenimiento.
- No es un modelo de lenguaje: no debe evaluarse con criterios de MMLU, HumanEval o similares.

## Enlaces

- Hugging Face: https://huggingface.co/rumezhak/microduck-sprint-daily-2026-11-17
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl (rama `main`, commit `5cee942d8`)
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del demonio de microduck (no se proporciona URL directa)
