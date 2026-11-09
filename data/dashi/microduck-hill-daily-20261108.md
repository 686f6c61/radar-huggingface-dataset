# dashi/microduck-hill-daily-20261108

## Resumen

`dashi/microduck-hill-daily-20261108` es una política de control para el robot cuadrúpedo de código abierto microduck, desarrollada por el usuario dashi y publicada el 8 de noviembre de 2026. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo exportada a ONNX que se ejecuta en el bucle de control del robot a 50 Hz, consumiendo observaciones de 61 dimensiones y emitiendo 14 acciones de control. Se enmarca en la categoría de robótica y se distribuye a través de la librería `microduck`.

La política se describe como un "re-entry diario" de un modelo anterior (`dashi/microduck-hill-remix-r752`, con una puntuación de 0.749) y constituye un ajuste fino (finetune) del modelo `jrubiosainz/microduck-game-hillclimber-remix6`. Está diseñada para ocupar el slot de marcha (`walk`) del robot y se caracteriza por ser una política "perpetua": ejecuta la marcha de forma indefinida hasta que se le indique lo contrario.

Su relevancia es acotada y muy específica: sirve como ejemplo de flujo de trabajo de entrenamiento RL reproducible para un robot educativo de bajo coste, con entrenamiento realizado sobre el repositorio `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`). No aporta innovaciones en arquitecturas transformer ni en procesamiento de lenguaje; su interés es exclusivamente para la comunidad de robótica y RL aplicada a locomoción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

Datos adicionales de la model card: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz, normalizador de observaciones integrado en el propio ONNX.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de capa, tamaño de las hidden units). Lo que sí se especifica es el entorno de entrenamiento: aprendizaje por refuerzo mediante el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. El modelo es un ajuste fino de `jrubiosainz/microduck-game-hillclimber-remix6`, que a su vez remite a un linaje de políticas de locomoción entrenadas sobre el robot microduck.

La innovación técnica destacable es de ingeniería de despliegue más que de modelado: el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones en crudo sin preprocesado externo. El `manifest.json` sigue el esquema 2 del manifiesto de políticas de microduck (documentado en `docs/policy-manifest.md` del repositorio del daemon). La política se declara "perpetua", es decir, sin condición de terminación interna, y se asigna al slot `walk`.

## Capacidades

- Locomoción de marcha continua para el robot microduck: genera comandos de 14 acciones a 50 Hz a partir de observaciones de 61 dimensiones.
- Ejecución indefinida: la política no tiene condición de parada propia y corre hasta que el daemon la interrumpa o sustituya.
- Integración directa con el daemon del robot mediante `robotctl policy load walk`.
- Normalización de observaciones integrada en el ONNX, sin pipeline de preprocesado adicional.
- Especializada en el escenario de entrenamiento "hill" (colina) heredado de su modelo base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo thinking: no es un modelo de lenguaje.

## Casos de uso

- Marcha por defecto en el robot microduck: se carga en el slot `walk` con `sudo robotctl policy load walk dashi/microduck-hill-daily-20261108` y el robot camina de forma continua. Es adecuada porque está entrenada específicamente para ese slot y esa frecuencia de control.
- Evaluación comparativa de políticas de locomoción: al ser un "re-entry" con puntuación declarada de 0.749 sobre el remix anterior, sirve como punto de referencia para medir mejoras de otras políticas en el mismo entorno.
- Reproducción de experimentos de RL: el linaje documentado (repo, rama y commit) permite reconstruir el entrenamiento y verificar resultados en el simulador de `microduck_rl`.
- Docencia en robótica de bajo coste: el robot microduck y sus políticas ONNX son un caso práctico para enseñar el ciclo completo de entrenamiento RL, exportación a ONNX y despliegue en hardware.
- Pruebas de integración del daemon: al seguir el esquema 2 del manifiesto de políticas, es útil para validar el cargador de políticas del daemon y el manejo del normalizador embebido.
- Base para ajustes finos posteriores: al ser un finetune de `jrubiosainz/microduck-game-hillclimber-remix6`, puede servir como punto de partida para nuevas iteraciones diarias del mismo autor.

## Benchmarks y rendimiento

La model card únicamente declara una puntuación de re-entrada de 0.749 para el modelo predecesor (`dashi/microduck-hill-remix-r752`). No se especifica la métrica exacta, el protocolo de evaluación ni los resultados del modelo actual.

| Modelo | Puntuación declarada | Métrica |
|---|---|---|
| `dashi/microduck-hill-remix-r752` (predecesor) | 0.749 | no disponible |
| `dashi/microduck-hill-daily-20261108` | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0.0 GB según Hugging Face, lo que sugiere un modelo muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible. Al ser una política de RL de un robot de bajo coste, es probable que la inferencia en CPU sea suficiente, pero no se documenta.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: el daemon de microduck mediante `robotctl policy load walk`; el runtime debe soportar ONNX y el manifiesto de políticas de microduck.
- Latencia y throughput: la política debe ejecutarse a 50 Hz (20 ms por paso) para el control del robot; no se publican mediciones de latencia reales.

## Comparativa con modelos similares

| Modelo | Base | Slot | Puntuación | Licencia | Formato |
|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261108` | `jrubiosainz/microduck-game-hillclimber-remix6` | `walk` | no disponible | no disponible | ONNX |
| `dashi/microduck-hill-remix-r752` | no disponible | no disponible | 0.749 | no disponible | no disponible |
| `dashi/microduck-hill-daily-20261101` | no disponible | no disponible | no disponible | no disponible | no disponible |
| `dashi/microduck-hill-daily-20261103` | no disponible | no disponible | no disponible | no disponible | no disponible |

Las entradas de la comparativa corresponden a modelos del mismo autor detectados en la búsqueda web; no se dispone de datos de rendimiento ni de especificaciones detalladas de los mismos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no procesa lenguaje natural.
- Especialización estrecha: solo cubre la locomoción en el slot `walk` y el escenario "hill" del modelo base; no se garantiza su comportamiento en otros terrenos o slots.
- Comportamiento perpetuo: la política no tiene condición de terminación, lo que exige supervisión externa (daemon o humano) para detener el robot.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso productivo.
- Repositorio de 0.0 GB y 0 descargas/0 likes: no hay evidencia de validación por parte de la comunidad ni de pruebas independientes.
- Sin datos de evaluación del modelo actual: la única cifra disponible (0.749) corresponde al predecesor, no a esta versión.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas, ya que no aplican a un modelo de control motor.
- Dependencia de la compatibilidad con el esquema 2 del manifiesto de políticas de microduck; cambios en el daemon podrían romper la carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261108
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Modelo predecesor citado: https://huggingface.co/dashi/microduck-hill-remix-r752 (referencia textual, no verificada como URL)
- Modelos relacionados del mismo autor: https://huggingface.co/dashi/microduck-hill-daily-20261101 y https://huggingface.co/dashi/microduck-hill-daily-20261103
