# dashi/microduck-sprint-daily-20261118

## Resumen

`dashi/microduck-sprint-daily-20261118` es una política de control para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es una política de aprendizaje por refuerzo exportada a ONNX que genera comandos de marcha a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones. El modelo se publica como "daily re-entry", es decir, una re-publicación diaria de una política previa (`dashi/microduck-sprint-remix-r844`) con una puntuación declarada de 0.844, y constituye un finetune del modelo `jrubiosainz/microduck-game-sprinter-remix3`.

Su relevancia es acotada pero específica: dentro del ecosistema microduck, estas políticas permiten dotar al robot de una marcha perpetua (un "gait") que se ejecuta de forma continua hasta que se detiene explícitamente. La política se carga en el slot `walk` del robot mediante la herramienta `robotctl`. El repositorio tiene un tamaño declarado de 0.0 GB y cero descargas en el momento de la consulta, lo que sugiere que se trata de un artefacto experimental de un flujo de trabajo interno de entrenamiento, más que de un modelo destinado a adopción amplia.

Conviene subrayar que la información disponible es muy limitada: no hay datos de benchmarks, licencia, idiomas ni composición del dataset de entrenamiento. La model card únicamente documenta el comando de despliegue, el esquema del manifiesto y los metadatos del entrenamiento (repositorio, rama y commit).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (arquitectura de red no especificada) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos ONNX; el normalizador de observaciones está embebido en `policy.onnx`) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

Otros datos técnicos relevantes:

| Parámetro | Valor |
|---|---|
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Slot de política | `walk` |
| Modelo base | `jrubiosainz/microduck-game-sprinter-remix3` |
| Relación con el modelo base | finetune |
| Puntuación declarada | 0.844 (heredada de `microduck-sprint-remix-r844`) |
| Librería | `microduck` |
| Pipeline | `robotics` |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura interna de la red no se detalla en la información disponible. Lo que sí se documenta es el marco de entrenamiento: la política se entrena con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. Se trata, por tanto, de aprendizaje por refuerzo aplicado al control locomotor del robot microduck, con una interfaz de observación de 61 dimensiones y 14 acciones ejecutadas a 50 Hz. La política es de tipo "perpetuo": una vez cargada, genera comandos de marcha de forma continua hasta que se le indica lo contrario.

El modelo es un finetune de `jrubiosainz/microduck-game-sprinter-remix3`, que a su vez forma parte de una cadena de remixes dentro del ecosistema microduck. La model card indica que esta publicación es una "daily re-entry" de `dashi/microduck-sprint-remix-r844`, con la misma puntuación de 0.844. No se especifica el número de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables en este contexto, al tratarse de RL para control motor). El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que la política consume observaciones en bruto sin preprocesado externo.

## Capacidades

- Generación de comandos de locomoción para el robot microduck en el slot `walk`, a 50 Hz.
- Marcha perpetua: la política se ejecuta de forma continua hasta recibir una orden de parada.
- Consumo de observaciones en bruto de 61 dimensiones, con normalización integrada en el grafo ONNX.
- Producción de 14 acciones de control motor.
- Carga y despliegue mediante `robotctl policy load walk <repo>`.
- Compatibilidad con el esquema 2 del manifiesto de políticas microduck (`docs/policy-manifest.md`).
- No dispone de capacidades de lenguaje, visión, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Locomoción básica del microduck en laboratorio: cargar la política en el slot `walk` con `robotctl` para que el robot mantenga una marcha continua mientras se prueban otros subsistemas (sensórica, batería, comunicaciones).
- Evaluación comparativa de políticas: al ser una "daily re-entry" con puntuación 0.844, sirve como referencia para comparar nuevas políticas del mismo slot y detectar regresiones en el pipeline de entrenamiento `microduck_rl`.
- Reproducción de experimentos de RL: el commit y la rama documentados (`roll-backward`, `83599404a`) permiten reconstruir el entorno de entrenamiento y verificar la reproducibilidad de la política.
- Base para finetunes posteriores: al ser un finetune de `microduck-game-sprinter-remix3`, puede emplearse como punto de partida para especializar la marcha en terrenos o condiciones concretas.
- Demostraciones educativas de robótica de bajo coste: el microduck y su ecosistema de políticas ONNX permiten ilustrar el ciclo completo de entrenamiento RL, exportación a ONNX y despliegue en hardware real.
- Integración en pipelines de CI para robótica: la política puede cargarse automáticamente en un banco de pruebas para validar que el robot ejecuta la marcha sin fallos tras cambios en el firmware o en el daemon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la puntuación declarada de 0.844, heredada de `dashi/microduck-sprint-remix-r844`, sin que se especifique la métrica, el protocolo de evaluación ni el conjunto de pruebas empleado.

## Requisitos de hardware

- El repositorio ocupa 0.0 GB, por lo que el modelo es extremadamente ligero y cabe holgadamente en cualquier hardware con soporte ONNX Runtime.
- VRAM estimada para inferencia: no disponible con precisión, pero al tratarse de una política de control de 61 entradas y 14 salidas, el requisito es mínimo (del orden de megabytes).
- GPU recomendadas: no se especifican. La inferencia a 50 Hz puede ejecutarse probablemente en CPU; una GPU no es necesaria.
- Cabe en cualquier GPU consumer e, incluso, en el propio ordenador de a bordo del robot.
- Opciones de despliegue: `robotctl` (herramienta oficial del ecosistema microduck) y ONNX Runtime para ejecución directa del grafo `policy.onnx`.
- Latencia y throughput estimados: no disponibles. El único requisito conocido es sostener 50 Hz de control.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Puntuación | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261118` | Política RL (ONNX) | 61 / 14 | 50 Hz | 0.844 | no disponible | Hugging Face |
| `dashi/microduck-sprint-remix-r844` | Política RL (ONNX) | no disponible | no disponible | 0.844 | no disponible | Hugging Face |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL (ONNX) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables entre estas políticas más allá de la puntuación declarada, por lo que la comparación cuantitativa de rendimiento no es posible con la información disponible.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido. Antes de cualquier uso en producción, es imprescindible contactar con el autor.
- No se documentan sesgos, pero al ser una política entrenada en un entorno concreto (rama `roll-backward`), su comportamiento puede degradarse en condiciones no vistas durante el entrenamiento.
- La puntuación de 0.844 carece de contexto: no se especifica la métrica ni el protocolo, por lo que no debe interpretarse como una medida absoluta de calidad.
- El modelo está diseñado exclusivamente para el robot microduck y el slot `walk`; no es reutilizable fuera de ese ecosistema.
- El repositorio tiene cero descargas y cero likes, y el tamaño declarado es 0.0 GB, lo que sugiere que los artefactos pueden no estar completamente subidos o que el repositorio es meramente un puntero de metadatos. Conviene verificar la integridad de `policy.onnx` antes de desplegarlo.
- No hay información sobre la robustez de la marcha ante perturbaciones, terrenos irregulares o fallos de sensores.
- La política es "perpetua" por diseño: requiere una orden explícita de parada, lo que implica un riesgo operativo si se pierde la comunicación con el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261118
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
