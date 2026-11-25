# rumezhak/microduck-tug-daily-2026-11-25

## Resumen

`microduck-tug-daily-2026-11-25` es una politica de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: se trata de un fichero `policy.onnx` que mapea observaciones del robot (61 dimensiones) a acciones de control (14 dimensiones) a una frecuencia de 50 Hz, pensado para ser cargado directamente en el daemon de control del robot.

La politica se describe como "perpetua": ejecuta una marcha (gait) de forma continua hasta que se le indique lo contrario, y se integra en el sistema de slots de politicas del daemon `robotctl`. El autor del repositorio es el usuario de Hugging Face `rumezhak`, y el entrenamiento se realizó sobre el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`).

La relevancia de esta ficha es limitada por la escasez de información publicada: el repositorio tiene 0 descargas y 0 likes, un tamaño de 0.0 GB y no incluye model card descriptiva más allá de las instrucciones de despliegue. No se dispone de datos sobre arquitectura de red, número de parámetros, composición del dataset de entrenamiento ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica neuronal exportada a ONNX; arquitectura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (politica robótica; sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de politicas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal. Se sabe que la politica consume observaciones de 61 dimensiones y produce 14 acciones a 50 Hz, y que el normalizador de observaciones está integrado dentro del propio fichero `policy.onnx`, de modo que el robot debe alimentar observaciones en bruto (sin normalizar). El modelo se exporta a ONNX para su ejecución en el daemon de control del robot.

El entrenamiento se realizó con aprendizaje por refuerzo sobre el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. No se especifican el número de pasos de entrenamiento, la composición del dataset, la función de recompensa, el algoritmo de RL empleado (PPO, SAC u otro) ni si hubo fases de ajuste adicionales. El nombre `tug-daily-2026-11-25` sugiere una ejecución de entrenamiento diaria fechada el 25 de noviembre de 2026, pero esto es una inferencia a partir del nombre y no está confirmado en la documentación.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck mediante una marcha continua ("perpetua") que se ejecuta hasta recibir una orden de parada.
- Mapeo directo de observaciones en bruto (61 dimensiones) a acciones (14 dimensiones) a 50 Hz, con normalización integrada en el modelo ONNX.
- Integración con el sistema de slots de politicas del daemon microduck mediante `robotctl policy load <slot> <repo>`.
- Compatibilidad con el esquema 2 del manifiesto de politicas microduck (`docs/policy-manifest.md` en el repositorio del daemon).
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Demostración de marcha continua en un microduck: cargar la politica en un slot del daemon y dejar que el robot camine de forma indefinida en entornos de laboratorio o demostraciones públicas, gracias a su naturaleza "perpetua".
- Pruebas de integración del pipeline `robotctl`: usar esta politica como carga de prueba para validar el flujo de descarga, carga en slot y ejecución de politicas ONNX en el daemon.
- Benchmarking de controladores: comparar la marcha de esta politica con otras politicas del mismo robot (por ejemplo, variantes diarias del mismo autor) para evaluar estabilidad y velocidad de desplazamiento.
- Investigación en aprendizaje por refuerzo para robótica: servir como ejemplo reproducible de una politica entrenada con `pollen-robotics/microduck_rl` en un commit concreto, útil para replicar experimentos.
- Educación y talleres: desplegar una politica preentrenada en un robot de bajo coste para ilustrar el ciclo completo de entrenamiento RL, exportación a ONNX y despliegue en hardware.
- Desarrollo de capas de control superiores: usar la marcha base como primitiva de locomoción sobre la que construir comportamientos de más alto nivel (navegación, seguimiento) que activen o desactiven la politica según convenga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una politica de control para un robot embebido, es probable que el modelo sea de tamaño reducido, pero no se documenta el número de parámetros ni el peso del fichero ONNX (el repositorio reporta 0.0 GB).
- GPU recomendadas: no disponible. El destino principal es la CPU del propio robot microduck a través del daemon `robotctl`, no un servidor con GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: daemon microduck con `robotctl policy load <slot> rumezhak/microduck-tug-daily-2026-11-25`; ejecución del fichero `policy.onnx` mediante un runtime ONNX.
- Latencia y throughput: la politica está diseñada para operar a 50 Hz (periodo de 20 ms por ciclo de control), pero no se documentan latencias medidas ni throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Robot | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-tug-daily-2026-11-25 | microduck | no disponible | no aplica | no disponible | no disponible | Hugging Face (0 descargas) |
| Otras politicas microduck del mismo autor | microduck | no disponible | no aplica | no disponible | no disponible | no disponible en la informacion proporcionada |
| Politicas de locomotion para quadrupedos (p. ej. familias de RL para Unitree, ANYmal) | otros robots | no disponible | no aplica | no disponible | varía | no disponible en la informacion proporcionada |

No se dispone de datos verificables para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Información muy escasa: no se documentan arquitectura, parámetros, licencia, idiomas ni resultados de evaluación, lo que impide valorar su calidad o idoneidad para producción.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución; debe contactarse con el autor antes de cualquier despliegue fuera de investigación.
- Especifica para el robot microduck: la dimensionalidad de observación (61) y acción (14) está fijada, por lo que no es reutilizable en otros robots sin reentrenamiento.
- Naturaleza "perpetua": la marcha se ejecuta hasta que se le indique lo contrario, lo que exige mecanismos externos de parada segura en el daemon o en la capa de control superior.
- Sin datos de robustez: no se documenta el comportamiento ante terrenos irregulares, empujes, fallos de sensores o condiciones fuera de distribución.
- Riesgo de sobreajuste a la simulación: al no especificarse el proceso de entrenamiento (sim-to-real, dominio aleatorizado), no puede evaluarse la transferencia al hardware real.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Sin garantías de mantenimiento: el autor no publica hoja de ruta ni soporte; el commit de entrenamiento (`5cee942d8`) es la única referencia de reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-daily-2026-11-25
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`); no se proporciona URL directa en la informacion disponible.
- Documentación del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon microduck; no se proporciona URL directa en la informacion disponible.
