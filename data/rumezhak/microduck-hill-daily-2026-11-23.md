# rumezhak/microduck-hill-daily-2026-11-23

## Resumen

`rumezhak/microduck-hill-daily-2026-11-23` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es una política perpetua que genera comandos de locomoción a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones de control. Se distribuye en formato ONNX con el normalizador de observaciones embebido en el propio grafo, de modo que el consumidor puede alimentar observaciones en bruto.

El modelo se publica como un artefacto de despliegue listo para cargarse en una ranura de política del daemon `robotctl` del robot, mediante el comando `sudo robotctl policy load <slot> rumezhak/microduck-hill-daily-2026-11-23`. El nombre sugiere una política de marcha ("hill", colina; "daily", variante diaria), pero la model card no documenta explícitamente la tarea concreta ni la recompensa utilizada.

La información disponible es extremadamente escasa: repositorio de 0,0 GB, cero descargas, cero likes, sin licencia declarada, sin idiomas y sin benchmarks. La ficha se limita a lo que el autor documenta y marca como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; topología de red no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política reactiva; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robótico, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Parámetros adicionales relevantes:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (se ejecuta hasta recibir orden de parada) |
| Normalizador de observaciones | embebido en `policy.onnx` (entrada en bruto) |
| Repo de entrenamiento | `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8` |
| Libreria | `microduck` |
| Pipeline declarado | `robotics` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de red. Por el contexto (política de RL para un cuadrúpedo, exportada a ONNX, con observación de 61 dimensiones y 14 acciones a 50 Hz), se trata de una política de control continuo típica de un pipeline de reinforcement learning para locomoción, pero la topología concreta (número de capas, anchura, activaciones, si es MLP o incluye recurrencia) no está documentada en la información disponible.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. No se especifican el número de pasos de entorno, la composición del dataset, el algoritmo de RL empleado (PPO, SAC, etc.), la función de recompensa ni si hubo fases de ajuste adicionales. Tampoco se documenta ninguna innovación técnica como decodificación especulativa o atención lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Generación de comandos de locomoción continua a 50 Hz para el robot microduck (14 acciones de control).
- Política perpetua: se ejecuta de forma indefinida hasta que se le indique lo contrario.
- Consumo de observaciones en bruto: el normalizador está embebido en `policy.onnx`, por lo que no requiere preprocesado externo de las 61 dimensiones de observación.
- Carga directa en el daemon del robot mediante `robotctl policy load <slot> ...`.
- Compatibilidad con el manifiesto de políticas schema 2 del repositorio del daemon.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Locomoción autónoma en el robot microduck: cargar la política en una ranura del daemon y dejar que el robot ejecute la marcha de forma continua; adecuado por su naturaleza perpetua y su frecuencia de control de 50 Hz.
- Investigación en robótica con RL: servir como política de referencia o línea base para comparar con otras políticas entrenadas en `microduck_rl`, dado que se publica con el commit exacto de entrenamiento.
- Despliegue en entornos de laboratorio con hardware microduck: al estar en ONNX y con el normalizador embebido, la integración se reduce a cargar el artefacto en el daemon sin pipeline de preprocesado adicional.
- Pruebas de robustez de la marcha: al ser una política "hill" (colina), puede emplearse para evaluar el comportamiento en terrenos inclinados, aunque la model card no confirma explícitamente esta tarea.
- Reproducibilidad de experimentos: el commit `5cee942d8` del repo `pollen-robotics/microduck_rl` permite reconstruir el entorno de entrenamiento y repetir el pipeline.
- Docencia y demostraciones de RL aplicado a robótica: el tamaño reducido del artefacto y su formato ONNX facilitan su uso en talleres y prácticas con el robot microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y no se documenta el tamaño del grafo ONNX.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tipo de artefacto (política de control a 50 Hz para un robot de pequeñas dimensiones) es plausible que se ejecute en CPU o en hardware embebido, pero no está confirmado.
- Opciones de despliegue: daemon `robotctl` del robot microduck (carga en ranura de política); ONNX Runtime como runtime subyacente previsible, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada otras políticas publicadas para microduck ni artefactos comparables con los que establecer una comparación de parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Información muy incompleta: no se declara licencia, lo que impide determinar si el uso comercial está permitido.
- Sin idiomas declarados ni metadatos de entrenamiento (algoritmo, recompensa, número de pasos), lo que dificulta evaluar su robustez y generalización.
- El nombre "hill" sugiere una tarea de terreno inclinado, pero la model card no lo confirma; no debe asumirse un comportamiento validado en colinas.
- Política perpetua: sin un mecanismo explícito de parada documentado más allá de la orden del operador, existe riesgo de ejecución continua no deseada.
- Sin benchmarks ni métricas de rendimiento publicadas: no hay evidencia cuantitativa de estabilidad de la marcha, tasa de caídas o consumo energético.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Artefacto específico del hardware microduck; no es reutilizable en otras plataformas robóticas sin reentrenamiento.
- No aplica riesgo de alucinación ni sesgos lingüísticos por no ser un modelo de lenguaje, pero sí existe riesgo de comportamiento inseguro en el robot si la política se ejecuta fuera de las condiciones de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/rumezhak/microduck-hill-daily-2026-11-23
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`); no se proporciona URL directa en la información disponible.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; no se proporciona URL directa.
