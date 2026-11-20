# dashi/microduck-hill-daily-20261119

## Resumen

`dashi/microduck-hill-daily-20261119` es una política de control motor entrenada por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una política neuronal exportada a ONNX que genera directamente comandos de actuación a 50 Hz a partir de observaciones de 61 dimensiones, con 14 acciones de salida. Se publica bajo el pipeline `robotics` y la librería `microduck`, y se enmarca en la categoría de políticas "perpetuas" que se ejecutan de forma continua hasta recibir una orden de parada.

El modelo es un reentrenamiento diario ("daily re-entry") de la política `dashi/microduck-hill-remix-r752`, que alcanzó una puntuación de 0,749. Se trata de un finetune del modelo `jrubiosainz/microduck-game-hillclimber-remix6`, un remix orientado a la tarea de subida de colinas (hillclimber). La política ocupa el slot `walk` del robot, es decir, implementa una marcha o patrón de locomoción concreto.

La relevancia de esta ficha es limitada en el contexto de modelos de IA generativa: no hay información sobre arquitectura de red, número de parámetros, contexto, idiomas ni licencia. El repositorio tiene un tamaño de 0,0 GB según Hugging Face, lo que sugiere pesos muy ligeros o una subida incompleta. No se han publicado benchmarks, datos de entrenamiento detallados ni métricas de rendimiento más allá de la puntuación heredada de la política original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal de política para control motor; detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Datos adicionales del repositorio: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz, slot de política `walk`. El normalizador de observaciones está embebido en `policy.onnx`, por lo que se alimentan observaciones en bruto.

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura de la red (capas, anchura, activaciones) ni sobre el número de parámetros. El modelo se entrenó con aprendizaje por refuerzo (etiqueta `reinforcement-learning`) usando el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. Se desconoce el número de pasos de entrenamiento, la composición del entorno de recompensa y los detalles del algoritmo de RL empleado.

La política es un finetune de `jrubiosainz/microduck-game-hillclimber-remix6`, que a su vez es un remix de un modelo de juego de subida de colinas. El resultado es una política "perpetua" que genera una marcha continua para el slot `walk`. La exportación a ONNX con el normalizador integrado facilita el despliegue directo en el robot mediante el comando `robotctl policy load walk dashi/microduck-hill-daily-20261119`.

## Capacidades

- Control motor de locomoción para el robot microduck en el slot `walk`.
- Generación de una marcha continua y perpetua a 50 Hz hasta recibir orden de parada.
- Consumo de observaciones en bruto de 61 dimensiones con normalización integrada en el ONNX.
- Emisión de 14 acciones de control por paso.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Locomoción autónoma en el robot microduck: cargar la política en el slot `walk` con `robotctl policy load walk dashi/microduck-hill-daily-20261119` para que el robot camine de forma continua en entornos de laboratorio.
- Investigación en aprendizaje por refuerzo: servir como punto de partida (finetune) para experimentos de locomoción sobre el entorno `microduck_rl`, rama `roll-backward`.
- Evaluación de políticas "perpetuas": estudiar el comportamiento de marchas continuas sin episodios de terminación en pruebas de robustez.
- Reproducción de experimentos: comparar esta reentrada diaria con la política original `microduck-hill-remix-r752` (puntuación 0,749) para medir la variabilidad entre reentrenamientos.
- Docencia y demos de robótica de código abierto: desplegar una política lista para usar en el robot microduck con un solo comando.
- Benchmarking de despliegue ONNX en hardware embebido: medir latencia y estabilidad de una política de 50 Hz con normalizador integrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico es la puntuación de la política original de la que deriva: `dashi/microduck-hill-remix-r752` con 0,749. No se especifica la métrica ni el entorno de evaluación, y no se aporta la puntuación de esta reentrada diaria.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un modelo muy ligero, pero no se confirma.
- GPU recomendadas: no disponibles; al ser una política de control a 50 Hz con observaciones de 61 dimensiones, es probable que se ejecute en CPU o en hardware embebido del robot, pero no se aporta confirmación.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el daemon `robotctl` del ecosistema microduck. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la frecuencia de control objetivo es de 50 Hz (periodo de 20 ms), pero no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Puntuación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261119` | Política RL (finetune) | walk | no disponible | no disponible | Hugging Face |
| `dashi/microduck-hill-remix-r752` | Política RL (origen) | no disponible | 0,749 | no disponible | Hugging Face |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL (base) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas de locomoción para microduck) más allá de la cadena de finetune indicada.

## Limitaciones y advertencias

- No se especifica licencia: no puede asumirse uso comercial sin confirmación del autor.
- No hay información sobre sesgos, pero al ser una política de control entrenada por RL, puede presentar comportamientos frágiles ante distribuciones de observación distintas a las del entrenamiento.
- Riesgo de fallo en el robot si se despliega en entornos o configuraciones de hardware diferentes a las del entrenamiento; no se documentan las condiciones de simulación o realidad utilizadas.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB: verificar la integridad de los artefactos (`policy.onnx`, `manifest.json`) antes de desplegar.
- No hay datos sobre el rendimiento de esta reentrada concreta; la puntuación 0,749 corresponde a la política original, no a este finetune.
- La política es "perpetua" y se ejecuta hasta recibir orden de parada: requiere mecanismos externos de seguridad y supervisión.
- No aplica a tareas de lenguaje, visión o razonamiento; cualquier uso fuera del control motor del microduck queda fuera de su ámbito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261119
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
