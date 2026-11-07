# dashi/microduck-sprint-daily-20261106

## Resumen

`dashi/microduck-sprint-daily-20261106` es una política de control motriz para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: se trata de un modelo de aprendizaje por refuerzo que genera comandos de locomoción a 50 Hz a partir de observaciones de 61 dimensiones, produciendo 14 acciones de control. Está publicado en Hugging Face bajo la librería `microduck` y el pipeline `robotics`, y se distribuye en formato ONNX para su ejecución directa sobre el robot.

El modelo es un fine-tune (re-entrada diaria) de `jrubiosainz/microduck-game-sprinter-remix3`, etiquetado con el slot `walk`, lo que indica que está diseñado para ocupar la ranura de marcha del daemon de control del robot. Su política es "perpetua": una vez cargada, ejecuta la marcha de forma continua hasta que se le indique lo contrario. El identificador `20261106` sugiere una fecha de generación (6 de noviembre de 2026), coherente con la fecha de creación del repositorio.

La relevancia de este modelo es acotada pero concreta: forma parte de un ecosistema de robótica de bajo coste donde las políticas se publican y versionan diariamente, permitiendo a los usuarios del microduck cargar marchas alternativas con un solo comando (`robotctl policy load walk ...`). No hay información pública sobre benchmarks, licencia o idiomas, y el tamaño del repositorio es de 0.0 GB según los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL para control robótico, exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 61 dimensiones, no secuencia de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de capas, dimensión oculta). Lo que sí se especifica es la interfaz: el modelo consume observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de 50 Hz, lo que corresponde al bucle de control del microduck. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado externo.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`, mediante aprendizaje por refuerzo. El modelo es un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3` y se describe como una "re-entrada diaria" del modelo `dashi/microduck-sprint-remix-r844`, que obtuvo una puntuación de 0.844 (métrica no especificada en la información disponible). No se detallan el número de pasos de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO (no aplicables típicamente a control motriz, pero no confirmado).

## Capacidades

- Locomoción cuadrúpeda: genera una marcha (`walk`) continua para el microduck a 50 Hz.
- Política perpetua: se ejecuta de forma indefinida hasta que el daemon recibe una orden de parada o cambio de política.
- Integración directa con el daemon: se carga mediante `robotctl policy load walk dashi/microduck-sprint-daily-20261106`.
- Normalización integrada: acepta observaciones en bruto gracias al normalizador embebido en el ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.
- No dispone de modo thinking, visión, audio ni otras capacidades cognitivas.

## Casos de uso

- Locomoción autónoma en el microduck: cargar la política en el slot `walk` para que el robot camine de forma continua en entornos de laboratorio o demostración, aprovechando su naturaleza perpetua y su frecuencia de control de 50 Hz.
- Pruebas de comparación de marchas: al ser una re-entrada diaria de un modelo puntuado (0.844), sirve para evaluar si la nueva versión mejora o degrada la marcha respecto a la anterior en el mismo hardware.
- Investigación en RL aplicado a robótica de bajo coste: usar el modelo como punto de partida o referencia para fine-tuning con el repositorio `microduck_rl` (rama `roll-backward`).
- Demostraciones educativas: desplegar una marcha funcional en talleres o cursos con el microduck sin necesidad de entrenar desde cero.
- Integración en pipelines de CI para robótica: verificar que la política se carga correctamente en el daemon y que el robot responde a las observaciones esperadas antes de desplegar cambios de firmware.
- Reproducción de experimentos: al estar el commit de entrenamiento identificado (`83599404a`), permite reproducir o auditar el proceso de entrenamiento en la rama indicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico es la puntuación 0.844 asociada al modelo base `dashi/microduck-sprint-remix-r844`, pero no se especifica la métrica ni el protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0.0 GB y el modelo se ejecuta como ONNX en el propio robot, por lo que no requiere GPU dedicada en el sentido habitual.
- GPU recomendadas: no aplica para inferencia en el robot; para entrenamiento o fine-tuning se desconoce el hardware empleado.
- Cabe en consumer GPU: no disponible (la inferencia se realiza en el hardware del microduck).
- Opciones de despliegue: daemon de microduck mediante `robotctl`; ejecución de `policy.onnx` con un runtime ONNX estándar.
- Latencia y throughput: control a 50 Hz (periodo de 20 ms por ciclo), según la especificación del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Base | Puntuación | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261106` | Política RL (ONNX) | walk | `jrubiosainz/microduck-game-sprinter-remix3` | no disponible (base: 0.844) | no disponible | Hugging Face |
| `dashi/microduck-sprint-daily-20261101` | Política RL | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `dashi/microduck-backroll` | Política RL | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `dashi/microduck-roller-remix-r920` | Política RL | no disponible | no disponible | 0.920 (según nombre) | no disponible | Hugging Face |

La comparativa se limita a otros modelos del mismo autor y ecosistema; no se dispone de datos de parámetros, contexto ni rendimiento detallado de las alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no genera respuestas y no admite instrucciones en lenguaje natural.
- Específico de hardware: solo funciona con el robot microduck y su daemon; no es portable a otras plataformas sin adaptación.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de un despliegue productivo.
- Sin datos de sesgos ni alucinación: al ser una política de control, los riesgos son de comportamiento físico (caídas, movimientos erráticos), no cognitivos.
- Evaluación opaca: la puntuación 0.844 del modelo base no viene acompañada de la métrica ni del protocolo, lo que impide comparar objetivamente con otras marchas.
- Repositorio vacío en metadatos (0.0 GB): no se puede verificar el contenido real de los pesos ni su integridad desde la información proporcionada.
- Dependencia de la rama `roll-backward`: el entrenamiento se realizó en una rama no estándar, lo que puede dificultar la reproducción si esa rama no se mantiene.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261106
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Modelo predecesor: https://huggingface.co/dashi/microduck-sprint-daily-20261101
- Perfil del autor: https://huggingface.co/dashi
