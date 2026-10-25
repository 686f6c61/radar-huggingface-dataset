# hunjison/microduck-sprint-seedtable-from-jrubiosainz

## Resumen

`sprint-seedtable-from-jrubiosainz` es una política de control para el robot cuadrúpedo microduck, desarrollada por el usuario hunjison y publicada en Hugging Face bajo la librería `microduck`. No es un modelo de lenguaje ni un modelo generativo de propósito general: es una política de refuerzo (reinforcement learning) que mapea una observación de 61 dimensiones a 14 acciones de control, ejecutada en bucle cerrado a 50 Hz. Se distribuye como un grafo ONNX (`policy.onnx`) acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

El modelo resuelve un problema muy concreto: proporcionar una marcha («sprint») perpetua que el robot puede cargar en una ranura de política y ejecutar de forma continua hasta recibir una orden de parada. La normalización de observaciones está embebida en el propio ONNX, de modo que el consumidor debe alimentar observaciones en crudo. Según la model card, el entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a`.

La relevancia es acotada pero clara para quien trabaja con microduck: permite desplegar una marcha entrenada sin reentrenar, mediante un único comando (`robotctl policy load`). La información pública disponible es mínima: el repositorio ocupa 0.0 GB, no hay licencia declarada, no se especifican idiomas y no se han publicado benchmarks ni detalles de arquitectura de la red.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política neuronal exportada a ONNX; no se detalla la topología de la red) |
| Parámetros totales | No disponible (el repositorio declara 0.0 GB) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; entrada de 61 dimensiones por paso) |
| Tipos de cuantización | No disponible (se distribuye como grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (política de control motor, sin interfaz de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Horizonte de ejecución | Perpetuo (se ejecuta hasta recibir orden contraria) |
| Librería / runtime | microduck (`library_name: microduck`), pipeline `robotics` |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a` |
| Fecha de publicación | 2026-10-25 |

## Arquitectura y entrenamiento

La información disponible no describe la topología de la red (número de capas, anchura, tipo de capa recurrente o feed-forward, función de activación). Lo que sí se documenta es la interfaz: la política consume un vector de observación de 61 dimensiones y emite 14 acciones a 50 Hz, en un régimen de ejecución perpetua. El artefacto distribuido es un grafo ONNX con la normalización de observaciones integrada, lo que implica que la política espera observaciones sin preprocesar y que el propio grafo aplica la transformación aprendida o calculada durante el entrenamiento. El `manifest.json` sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon, lo que determina los metadatos que el runtime del robot utiliza para cargar la política en una ranura.

En cuanto al entrenamiento, la model card solo indica el repositorio, la rama y el commit de `pollen-robotics/microduck_rl`, sin detallar el número de pasos, la composición del dataset, el simulador empleado, la función de recompensa ni si hubo fases de ajuste adicionales. El nombre del modelo (`seedtable-from-jrubiosainz`) sugiere una variante derivada de una tabla semilla o de un trabajo previo del usuario `jrubiosainz`, pero esto es una interpretación del identificador y no un dato confirmado en la documentación. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal u otros mecanismos, que por otra parte no aplican a este tipo de política.

## Capacidades

- Control locomotor: genera 14 comandos de actuación a partir de 61 señales de observación, pensados para producir una marcha de tipo «sprint» en el robot microduck.
- Ejecución perpetua: la política está diseñada para correr de forma continua hasta que el operador o el daemon la detengan, sin horizonte de episodio fijo.
- Control en tiempo real: el bucle declarado es de 50 Hz, adecuado para el lazo de control de un robot cuadrúpedo de pequeño tamaño.
- Normalización integrada: el grafo ONNX incluye el normalizador de observaciones, de modo que el integrador no necesita replicar el preprocesado en su código.
- Despliegue en robot: se carga en una ranura de política mediante `robotctl policy load <slot> hunjison/microduck-sprint-seedtable-from-jrubiosainz`.
- Compatibilidad de manifiesto: el `manifest.json` cumple el esquema 2, por lo que es consumible por el daemon de microduck que implemente dicha versión.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni generación de texto: es una política de control motor, no un modelo fundacional.

## Casos de uso

- Locomoción por defecto del robot: cargar esta política en una ranura y usarla como marcha base para desplazamientos continuos en demostraciones y entornos controlados, aprovechando su carácter perpetuo.
- Evaluación sim-to-real: comparar el comportamiento de la política entrenada en simulación con su ejecución en hardware real, midiendo deriva, estabilidad y consumo de los actuadores a 50 Hz.
- Línea base para investigación en RL: emplear esta política como referencia («seed») frente a otras variantes de marcha, dado el nombre del artefacto y su origen en `microduck_rl`.
- Pruebas de integración del daemon: validar el cargador de políticas, el esquema 2 del manifiesto y el comando `robotctl policy load` en pipelines de CI del software del robot.
- Docencia y divulgación en robótica: disponer de una política lista para usar que ilustra el ciclo completo observación-acción en un cuadrúpedo de bajo coste, sin necesidad de entrenar.
- Recolección de datos de marcha: ejecutar la política de forma sostenida para registrar trayectorias y señales de sensores que alimenten entrenamientos posteriores o modelos de imitación.
- Comparación de marchas: alternar entre esta política y otras variantes cargadas en ranuras distintas para evaluar velocidad, estabilidad y desgaste en la misma plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad de avance, estabilidad, tasa de caídas ni comparaciones con otras políticas. Tampoco se documentan latencia ni throughput medidos, más allá de la frecuencia de control nominal de 50 Hz.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio se declara como 0.0 GB y no se especifica el número de parámetros, por lo que no es posible estimar memoria de forma fiable.
- GPU recomendadas: no disponibles. Al tratarse de una política de control a 50 Hz con entrada de 61 dimensiones, es plausible que la inferencia se ejecute en CPU, pero esto no está confirmado en la documentación.
- Ejecución en GPU de consumo: no confirmado. No hay datos que permitan afirmar qué GPU consumer sería suficiente ni si se necesita GPU en absoluto.
- Despliegue: el soporte documentado es el runtime de microduck en el propio robot, mediante `robotctl policy load`; el artefacto es un `policy.onnx` ejecutable con ONNX Runtime. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: solo se declara la frecuencia de control de 50 Hz (periodo de 20 ms por paso); no se publican mediciones de latencia de inferencia ni de utilización de recursos.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hunjison/microduck-sprint-seedtable-from-jrubiosainz` | Política RL para microduck (ONNX) | 61 / 14 | 50 Hz | No disponible | Hugging Face, 0 descargas, 0 likes |
| Otras políticas de microduck en Hugging Face | Políticas RL para microduck | No disponible | No disponible | No disponible | No verificado en la información proporcionada |
| Políticas de locomoción para cuadrúpedos de otras plataformas | Políticas RL específicas de robot | No disponible | No disponible | No disponible | No comparable directamente por diferencias de morfología y espacio de acciones |

No se dispone de datos objetivos (parámetros, contexto, rendimiento, licencia) de alternativas concretas dentro de la información proporcionada, por lo que la comparación cuantitativa se declara no disponible.

## Limitaciones y advertencias

- Especificidad de plataforma: la política está acoplada a la morfología y al espacio de observación/acción de microduck (61 observaciones, 14 acciones); no es reutilizable en otro robot sin reentrenamiento.
- Ausencia de licencia declarada: no se especifica licencia en la model card ni en los metadatos, lo que impide determinar si el uso comercial está permitido. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Documentación insuficiente: no se detallan arquitectura, número de parámetros, datos de entrenamiento ni métricas de evaluación, lo que dificulta auditar el comportamiento o reproducir el resultado.
- Riesgo de fallo en condiciones no vistas: al no publicarse datos sobre la distribución de entrenamiento ni pruebas de robustez, no puede descartarse un comportamiento degradado ante terrenos, cargas o perturbaciones distintas de las de entrenamiento.
- Ejecución perpetua sin salvaguardas documentadas: la política corre hasta recibir orden contraria; la seguridad depende de los límites y paradas de emergencia implementados en el daemon y en el hardware, no del propio modelo.
- Mantenimiento incierto: 0 descargas y 0 likes en el momento de la consulta, sin versión posterior ni issues públicas; no hay garantía de soporte o actualizaciones.
- Sin capacidades de lenguaje: no debe emplearse en tareas de generación de texto, razonamiento, código o atención al cliente; su ámbito es exclusivamente el control motor.
- Advertencia de integridad: la fecha de creación registrada (2026-10-25) debe verificarse contra el repositorio antes de citarla en documentación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hunjison/microduck-sprint-seedtable-from-jrubiosainz
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `6ff40704a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (esquema 2)
