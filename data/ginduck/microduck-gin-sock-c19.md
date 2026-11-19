# GinDuck/microduck-gin-sock-c19

## Resumen

`microduck-gin-sock-c19` es una política de control para el robot cuadrúpedo microduck de Pollen Robotics, publicada por el usuario GinDuck en Hugging Face. No es un modelo de lenguaje ni un modelo generativo: es una política de aprendizaje por refuerzo exportada a ONNX que genera una marcha (gait) perpetua para que el robot se desplace de forma continua hasta recibir una orden de parada. El repositorio tiene un tamaño declarado de 0.0 GB y cero descargas, lo que sugiere un artefacto experimental de un usuario individual más que un modelo de producción.

La política opera a 50 Hz con una observación de 61 dimensiones y 14 acciones, y se carga en una ranura de política del demonio `robotctl` del ecosistema microduck. Según la model card, el autor partió de una política previa de otro usuario (rumezhak, `sock-heist-composite-v13`) y aplicó una búsqueda de hill-climbing sobre los últimos 25 pasos de la semilla 1 en la física de Arena, mejorando el tiempo de 4.615 s a 4.610 s en la tarea denominada "6 m Sock Heist". El resto de semillas (2-5) son repeticiones directas de la política original.

Su relevancia es acotada: se trata de un artefacto de robótica de nicho, útil únicamente para quien tenga acceso al hardware microduck y al stack de control correspondiente. No hay información publicada sobre licencia, idiomas, benchmarks estandarizados ni requisitos de cómputo más allá de la inferencia ONNX en el propio robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (red neuronal; topología no detallada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (artefacto ONNX; el normalizador de observaciones está embebido en `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Dimension de observacion | 61 |
| Dimension de acciones | 14 |
| Frecuencia de control | 50 Hz |
| Libreria | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, anchura, tipo de capas). Se sabe que es una política entrenada con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0`, y exportada a ONNX para su despliegue en el robot. El normalizador de observaciones está integrado en el propio grafo `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar.

El entrenamiento declarado es un "remix" de tablas de consulta (lookup-table): las semillas 2 a 5 reproducen la política `sock-heist-composite-v13` de rumezhak, mientras que la semilla 1 parte de la semilla 1 de ese mismo autor y sustituye sus últimos 25 pasos por una búsqueda de hill-climbing propia de GinDuck en la física de Arena, con una mejora medida de 4.615 s a 4.610 s en la tarea de 6 m. La red subyacente es de GinDuck. No se especifican número de tokens, composición del dataset, ni uso de RLHF/DPO (conceptos que además no aplican a este tipo de artefacto).

## Capacidades

- Generación de una marcha perpetua para el robot microduck: la política se ejecuta de forma continua hasta que se le indica lo contrario.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones de salida.
- Carga como política en una ranura del demonio `robotctl` del stack microduck.
- Inferencia vía ONNX con normalización de observaciones integrada en el grafo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento: no es un modelo de lenguaje.
- Especialización en la tarea "6 m Sock Heist" dentro del entorno de evaluación de microduck.

## Casos de uso

- Locomoción continua en el microduck: cargar la política en una ranura con `robotctl policy load <slot> GinDuck/microduck-gin-sock-c19` y dejar que el robot avance de forma perpetua; adecuada porque está diseñada explícitamente como política perpetua a 50 Hz.
- Evaluación comparativa de políticas en el entorno Arena: al ser un remix de una política existente con una mejora marginal documentada (4.615 s a 4.610 s), sirve como referencia para medir el efecto de la búsqueda de hill-climbing en los últimos 25 pasos.
- Reproducción de experimentos de RL en `microduck_rl`: el commit y la rama están declarados, lo que permite reconstruir el pipeline de entrenamiento y verificar el artefacto.
- Pruebas de integración del stack `robotctl`: útil para validar la carga de manifiestos schema 2 y la ejecución de políticas ONNX en el demonio antes de desplegar políticas propias.
- Benchmark interno de tareas de manipulación/locomotiva ("Sock Heist") en el hardware microduck: permite comparar tiempos de resolución entre políticas sobre la misma física.
- Docencia o demostración de pipelines de RL a robótica real: el flujo completo (entrenamiento en `microduck_rl` → exportación ONNX → carga en `robotctl`) es un ejemplo compacto de despliegue de políticas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tarea "6 m Sock Heist" (semilla 1, tras hill-climbing) | 4.610 s |
| Tarea "6 m Sock Heist" (semilla 1, antes del hill-climbing) | 4.615 s |
| Mejora | 0.005 s |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con otras políticas más allá de la referencia a `sock-heist-composite-v13`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y la red es presumiblemente de muy pequeña escala, pero no se publica el número de parámetros.
- GPU recomendadas: no disponible; la inferencia se realiza en el propio robot microduck vía ONNX, no en GPU de servidor.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: demonio `robotctl` del stack microduck (comando `sudo robotctl policy load <slot> GinDuck/microduck-gin-sock-c19`); runtime ONNX.
- Latencia y throughput: no disponibles; el control opera a 50 Hz según la model card, pero no se detalla el tiempo de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-gin-sock-c19 | no disponible | no aplica | 4.610 s en 6 m Sock Heist (semilla 1) | no disponible | Hugging Face (0 descargas) |
| rumezhak/sock-heist-composite-v13 | no disponible | no aplica | 4.615 s en 6 m Sock Heist (semilla 1, referencia) | no disponible | Hugging Face |
| Otras políticas microduck | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas adicionales de la misma categoría.

## Limitaciones y advertencias

- Artefacto de nicho: solo es utilizable con el robot microduck y el stack `robotctl`; no tiene aplicación fuera de ese ecosistema.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Idiomas no aplicables, pero tampoco se documentan metadatos de región o cumplimiento más allá de `region:us`.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- La mejora reportada es marginal (0.005 s, ~0.1 %) y proviene de una búsqueda de hill-climbing sobre los últimos 25 pasos de una única semilla; no hay evidencia de generalización a otras condiciones.
- El resto de semillas son repeticiones de la política de otro autor, por lo que el valor añadido del artefacto es limitado.
- No se documentan sesgos, riesgo de alucinación ni límites de contexto por no tratarse de un modelo de lenguaje; el riesgo principal es el fallo físico del robot si la política se ejecuta fuera de las condiciones de entrenamiento.
- El repositorio declara 0.0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que el tamaño es inferior a la precisión de medida; conviene verificar la integridad de `policy.onnx` antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-gin-sock-c19
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento referenciado: `pollen-robotics/microduck_rl` (rama `talent-3`, commit `debcfcae0`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio microduck
- Política de referencia: rumezhak `sock-heist-composite-v13` (enlace directo no disponible en la información proporcionada)
