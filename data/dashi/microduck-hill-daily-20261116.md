# dashi/microduck-hill-daily-20261116

## Resumen

`dashi/microduck-hill-daily-20261116` es una política de control motriz para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo exportada a ONNX que genera comandos de locomoción a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones de control. Se publica como "re-entrada diaria" (daily re-entry) de un entrenamiento previo identificado como `dashi/microduck-hill-remix-r752`, con una puntuación reportada de 0,749.

El modelo se enmarca en la categoría `microduck-slot:walk`, es decir, está diseñado específicamente para ocupar la ranura de marcha del daemon de control del robot. Es una política "perpetua": una vez cargada, ejecuta la marcha de forma continua hasta que se le indique lo contrario. La observación se normaliza internamente (el normalizador está embebido en el fichero `policy.onnx`), por lo que el consumidor debe alimentar observaciones en crudo.

La relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline de RL para robótica de bajo coste, con un manifiesto de política versionado (schema 2) y un flujo de despliegue directo mediante `robotctl`. La información pública disponible es muy escasa (repo de 0,0 GB, sin descargas ni likes, sin model card extendida más allá de los metadatos de entrenamiento), por lo que numerosas especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (detalles de red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Slot de política | `walk` |
| Modelo base | `jrubiosainz/microduck-game-hillclimber-remix6` (finetune) |
| Repo de entrenamiento | `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (número de capas, anchura, tipo de encoder). Lo que sí se especifica es el contrato de interfaz: entrada de 61 dimensiones (observación del robot), salida de 14 dimensiones (acciones de control), ejecución a 50 Hz y normalización de observaciones integrada en el propio grafo ONNX. La política se entrenó mediante aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y en el commit `83599404a`.

El modelo es un finetune del checkpoint `jrubiosainz/microduck-game-hillclimber-remix6`, que a su vez parece derivar de un entorno tipo "hill climber". Esta publicación concreta se describe como "daily re-entry" de `dashi/microduck-hill-remix-r752`, con una puntuación de 0,749 (la métrica exacta no se define en la información disponible). No se documentan el número de tokens, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO (no aplicables en este dominio). Tampoco se detalla ninguna innovación técnica más allá del empaquetado del normalizador dentro del ONNX y del uso del manifiesto schema 2.

## Capacidades

- Locomoción cuadrúpeda: genera una marcha continua para el slot `walk` del microduck a 50 Hz.
- Política perpetua: mantiene la marcha indefinidamente hasta que se le ordena detenerse.
- Consumo de observaciones en crudo: el normalizador está embebido en `policy.onnx`, por lo que no requiere preprocesado externo.
- Integración con el daemon de control: se carga mediante `robotctl policy load walk <repo>`.
- Compatibilidad con el manifiesto de políticas schema 2 (`manifest.json`).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.
- No se documentan capacidades de agentes ni de razonamiento multi-paso.

## Casos de uso

- Despliegue directo en robot microduck: cargar la política en el slot `walk` con `sudo robotctl policy load walk dashi/microduck-hill-daily-20261116` para que el robot camine de forma continua en pruebas de campo.
- Evaluación de pipelines de RL en robótica de bajo coste: usar este checkpoint como referencia reproducible (commit y rama documentados) para comparar variantes de entrenamiento en el mismo entorno.
- Base para finetuning: al ser un finetune de `jrubiosainz/microduck-game-hillclimber-remix6`, sirve como punto de partida para nuevas políticas de marcha o de otros slots.
- Pruebas de integración del daemon: validar el manifiesto schema 2 y el flujo de carga de políticas en CI o en bancos de pruebas con el robot real.
- Docencia y divulgación: ejemplo completo de un pipeline RL → ONNX → despliegue en un cuadrúpedo de bajo coste, útil en cursos de robótica o aprendizaje por refuerzo.
- Benchmarking interno de marchas: comparar la puntuación reportada (0,749) con otras políticas del mismo autor o de la comunidad para el mismo slot `walk`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico es la puntuación de 0,749 asociada a `dashi/microduck-hill-remix-r752`, del cual este modelo es una re-entrada diaria, pero no se especifica la métrica ni el protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0,0 GB, lo que sugiere un modelo muy pequeño, pero no se confirma.
- GPU recomendadas: no disponible. Por el formato ONNX y el dominio (control a 50 Hz), es probable que la inferencia en CPU sea suficiente, pero no se documenta.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos sobre requisitos mínimos.
- Opciones de despliegue: el flujo previsto es el daemon de microduck mediante `robotctl`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: se especifica una frecuencia de control de 50 Hz (periodo de 20 ms por paso), pero no se publican latencias medidas ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261116` | Política RL (ONNX) | `walk` | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `dashi/microduck-hill-remix-r752` | Política RL (origen de la re-entrada) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: sin model card extendida, sin licencia declarada y sin datos de rendimiento más allá de la puntuación 0,749.
- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor.
- Dominio restringido: solo válido para el robot microduck y el slot `walk`; no es un modelo de propósito general.
- Sin datos sobre sesgos ni alucinación: no aplica en el sentido habitual, pero tampoco se documenta el comportamiento fuera de distribución.
- Dependencia del entorno de entrenamiento: los resultados pueden degradarse si cambian las condiciones físicas (terreno, carga, calibración) respecto al entorno `roll-backward`.
- Naturaleza "perpetua": la política no se detiene por sí sola; requiere una orden explícita para finalizar la marcha.
- Sin garantías de robustez: no se documentan pruebas de estrés, seguridad ni recuperación ante caídas.
- Repo de 0,0 GB y sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261116
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); URL no disponible en la información proporcionada.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; URL no disponible.
