# dashi/microduck-hill-daily-20261112

## Resumen

`dashi/microduck-hill-daily-20261112` es una política de control motriz para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: se trata de un artefacto de reinforcement learning exportado a ONNX que implementa una marcha perpetua (gait) para la ranura `walk` del robot. El autor, `dashi`, lo publica como reentrada diaria de su política previa `microduck-hill-remix-r752`, con una puntuación de 0.749.

El modelo parte de un fine-tuning sobre `jrubiosainz/microduck-game-hillclimber-remix6` y se entrena con el repositorio `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`). Su relevancia es acotada pero concreta: demuestra un flujo de trabajo de políticas intercambiables y versionadas por fecha para robótica de bajo coste, empaquetando el normalizador de observaciones dentro del propio grafo ONNX.

Al no tratarse de un modelo generativo, carece de contexto textual, vocabulario, capacidades multilingües o tool calling. La información pública disponible es mínima: el repositorio pesa 0.0 GB según Hugging Face, no declara licencia ni idiomas, y no incluye resultados de benchmarks formales más allá de la puntuación 0.749 citada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (red neuronal de control; topología interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 61 dimensiones |
| Tipos de cuantizacion | no disponible (artefacto ONNX estándar) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

El artefacto es una política de control entrenada por reinforcement learning para el robot microduck. La interfaz es explícita: 61 dimensiones de observación como entrada y 14 acciones como salida, ejecutándose a 50 Hz. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar. El `manifest.json` sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon, lo que permite cargarla mediante `robotctl`.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. La model card indica que es una "daily re-entry" de `dashi/microduck-hill-remix-r752` con puntuación 0.749, y que es un remix (fine-tune) de `jrubiosainz/microduck-game-hillclimber-remix6`. No se detallan hiperparámetros, número de pasos, algoritmo de RL (PPO, SAC u otro), composición del entorno de entrenamiento ni función de recompensa. La política es "perpetua": se ejecuta hasta que se le indique lo contrario, sin condición de terminación interna.

## Capacidades

- Locomoción cuadrúpeda perpetua en la ranura `walk` del microduck, a 50 Hz.
- Consumo de observaciones crudas de 61 dimensiones con normalización integrada en el grafo ONNX.
- Producción de 14 acciones de control motriz por paso de inferencia.
- Compatibilidad con el daemon de microduck vía `robotctl policy load walk <repo>`.
- Versionado por fecha (20261112) y por ranura (`microduck-slot:walk`), lo que permite sustituir políticas sin recompilar el stack.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Demostración de locomoción en microduck: cargar la política con `sudo robotctl policy load walk dashi/microduck-hill-daily-20261112` para que el robot camine de forma continua en pruebas de laboratorio o talleres educativos.
- Benchmarking interno de políticas: comparar la puntuación 0.749 de esta reentrada con `microduck-hill-remix-r752` y con el modelo base `hillclimber-remix6` para evaluar la progresión del entrenamiento.
- Reproducción de experimentos de RL: usar la referencia al repositorio `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`) para replicar el pipeline que genera este artefacto.
- Integración en pipelines de despliegue robótico: al ser un único `policy.onnx` con normalizador embebido, encaja en flujos de CI que empaquetan y validan políticas antes de subirlas al robot.
- Docencia en robótica de bajo coste: sirve como ejemplo tangible de política RL lista para ejecutar en hardware asequible, sin necesidad de GPUs dedicadas.
- Investigación en control continuo: base para experimentos de sustitución de políticas por ranura (por ejemplo, comparar `walk` frente a otras marchas) manteniendo la misma interfaz de 61 observaciones y 14 acciones.

## Benchmarks y rendimiento

La única métrica publicada es la puntuación de reentrada citada en la model card:

| Metrica | Valor |
|---|---|
| Puntuación de la política (`microduck-hill-remix-r752`) | 0.749 |
| Puntuación de esta reentrada diaria | no disponible (la card solo cita la del modelo de origen) |

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni métricas de recompensa por episodio, ni tasas de éxito de locomoción).

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es 0.0 GB y el artefacto es un ONNX de política de control, presumiblemente de pocos megabytes.
- GPU recomendadas: no disponible; por la naturaleza del artefacto (inferencia a 50 Hz de una política pequeña) no requiere GPU dedicada.
- Cabe en cualquier GPU consumer e incluso es probable que funcione en CPU; no se especifica en la información disponible.
- Opciones de despliegue: runtime ONNX estándar y el daemon de microduck mediante `robotctl policy load walk <repo>`.
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Relación | Puntuación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261112` | Política RL ONNX (walk) | Este modelo | no disponible | no disponible | Hugging Face, 0 descargas |
| `dashi/microduck-hill-remix-r752` | Política RL ONNX (walk) | Modelo de origen de la reentrada | 0.749 | no disponible | Hugging Face |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL ONNX | Modelo base del fine-tune | no disponible | no disponible | Hugging Face |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no admite tool calling ni agentes.
- La licencia no está declarada, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en productos.
- El repositorio aparece con 0.0 GB y 0 descargas; la disponibilidad y la integridad de los artefactos no están verificadas por terceros.
- La topología interna, el número de parámetros y el algoritmo de entrenamiento no se detallan, lo que dificulta auditar el comportamiento de la política.
- Es una política "perpetua" sin condición de parada interna: el operador debe garantizar mecanismos externos de seguridad y parada en el robot.
- Depende de la interfaz exacta de 61 observaciones y 14 acciones a 50 Hz; cambios en el firmware o en el manifiesto del daemon pueden romper la compatibilidad.
- No hay métricas de robustez, sesgos ni evaluación de comportamiento en entornos no vistos; la puntuación 0.749 corresponde al modelo de origen, no necesariamente a esta reentrada.
- El entrenamiento en la rama `roll-backward` sugiere un experimento concreto; no se documenta si la política generaliza a terrenos distintos del entorno de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261112
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
