# dashi/microduck-sprint-daily-20261101

## Resumen

`dashi/microduck-sprint-daily-20261101` es una política de control motriz (policy) para el robot bípedo open source Microduck, no un modelo de lenguaje. Se trata de un artefacto de reinforcement learning exportado a ONNX que se carga en el daemon del robot para ejecutar una marcha concreta (slot `walk`) de forma perpetua hasta que se le indique lo contrario. El autor es el usuario de HuggingFace `dashi`, que lo publica como reentrada diaria de una política previa (`dashi/microduck-sprint-remix-r844`, con recompensa 0.844) y como finetune del modelo `jrubiosainz/microduck-game-sprinter-remix3`.

El modelo resuelve un problema muy acotado: proporcionar una política de locomoción lista para desplegar en el Microduck, un robot de 25 cm con 15 motores, cámara, LiDAR y pico prensil. La interfaz es fija: 61 dimensiones de observación y 14 acciones a 50 Hz, con el normalizador de observaciones embebido en el propio `policy.onnx`, de modo que el robot puede alimentar observaciones en crudo. El repositorio ocupa 0.0 GB, lo que confirma que se trata de un fichero de pesos muy ligero, coherente con una política de control y no con un modelo generativo de gran escala.

Su relevancia es de nicho: sirve como ejemplo de flujo de trabajo de RL reproducible en robótica de bajo coste (entrenamiento en la rama `roll-backward` del repo `pollen-robotics/microduck_rl`, commit `83599404a`, exportación a ONNX y despliegue vía `robotctl`). No hay información pública sobre arquitectura de red, número de parámetros, contexto, idiomas ni licencia, por lo que esta ficha se limita a documentar lo que la model card y los metadatos permiten afirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; sin detalle de capas en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (exportación ONNX; el normalizador de observaciones va embebido en `policy.onnx`) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La model card no describe la topología de la red (número de capas, tipo de capas, función de activación ni tamaño de la representación interna). Lo que sí se documenta es la interfaz del entorno: observaciones de 61 dimensiones, espacio de acciones de 14 dimensiones y frecuencia de control de 50 Hz. La política se exporta a ONNX con el normalizador de observaciones integrado, lo que implica que la normalización forma parte del grafo exportado y el consumidor debe pasar observaciones sin preprocesar.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. Se trata de un finetune sobre `jrubiosainz/microduck-game-sprinter-remix3`, y la model card lo presenta como reentrada diaria de `dashi/microduck-sprint-remix-r844`, una política con recompensa reportada de 0.844. No se especifican el número de pasos de entrenamiento, la composición del dataset (en RL se genera por interacción con el simulador), el algoritmo concreto (PPO, SAC u otro) ni si hubo fases de ajuste adicionales. La etiqueta `microduck-slot:walk` indica que la política está destinada a ocupar el slot de marcha del daemon.

## Capacidades

- Locomoción bípeda perpetua: la política se ejecuta de forma continua hasta que se le ordena lo contrario, sin horizonte de episodio definido en la model card.
- Control a 50 Hz con 14 acciones, adecuado para el bucle de control en tiempo real del Microduck.
- Consumo de observaciones en crudo de 61 dimensiones, gracias al normalizador embebido en el ONNX.
- Despliegue directo en robot mediante `robotctl policy load walk dashi/microduck-sprint-daily-20261101`.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2), lo que permite integrarla en el daemon estándar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión o de audio: no es un modelo de lenguaje ni un modelo multimodal.

## Casos de uso

- Marcha por defecto del Microduck en el slot `walk`: cargar la política con `robotctl policy load walk` para que el robot camine de forma continua en demostraciones y pruebas de laboratorio.
- Base para finetunes posteriores: al ser un finetune de `microduck-game-sprinter-remix3` y reentrada de `microduck-sprint-remix-r844`, sirve como punto de partida para experimentos de RL con la rama `roll-backward` de `microduck_rl`.
- Evaluación comparativa de políticas: al publicarse reentradas diarias (por ejemplo, `microduck-sprint-daily-20261028` y `20261029`), permite comparar variantes de una misma marcha y medir la recompensa reportada.
- Docencia y talleres de robótica open source: el flujo completo (entrenar en `microduck_rl`, exportar a ONNX, cargar con `robotctl`) es reproducible con hardware de bajo coste.
- Integración en pipelines de CI para robótica: verificar que `policy.onnx` y `manifest.json` cumplen el esquema 2 antes de desplegar en flota.
- Pruebas de robustez de la marcha: ejecutar la política de forma perpetua en el simulador o en el robot para caracterizar deriva, consumo de batería y estabilidad del gait.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico es la recompensa 0.844 de la política predecesora `dashi/microduck-sprint-remix-r844`, que la model card cita como referencia de la reentrada, pero no se aporta la métrica de la política actual ni la definición exacta de esa recompensa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0.0 GB, lo que sugiere un modelo de muy pocos megabytes.
- GPU recomendadas: no disponible; por el tamaño del artefacto, la inferencia probablemente puede ejecutarse en CPU, pero no se documenta.
- Compatibilidad con GPU de consumo: no disponible; no se especifica.
- Opciones de despliegue: el daemon de microduck mediante `robotctl policy load walk <repo>`; el runtime debe soportar ONNX (el propio daemon, según la model card).
- Latencia y throughput: no disponibles; la frecuencia de control es de 50 Hz (periodo de 20 ms por paso), pero no se reporta el tiempo de inferencia medido.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Recompensa reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261101` | Política RL ONNX para Microduck (slot `walk`) | Finetune de `jrubiosainz/microduck-game-sprinter-remix3` | no disponible para esta versión | no disponible | HuggingFace, 0 descargas, 0 likes |
| `dashi/microduck-sprint-remix-r844` | Política RL predecesora | no disponible | 0.844 | no disponible | HuggingFace (citada en la model card) |
| `dashi/microduck-sprint-daily-20261028` | Reentrada diaria de la misma familia | no disponible | no disponible | no disponible | HuggingFace |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL base | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de parámetros, contexto ni rendimiento comparables, porque ninguna de las fichas consultadas publica esa información.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades de razonamiento, código o matemáticas.
- Licencia no disponible: no puede asumirse uso comercial; hay que contactar con el autor o consultar el repo base antes de cualquier despliegue productivo.
- Sin datos de arquitectura ni de parámetros: no es posible auditar la política ni estimar su comportamiento fuera del entorno para el que fue entrenada.
- Entrenada específicamente para el Microduck (61-D de observación, 14 acciones, 50 Hz); no es transferible a otro robot sin reentrenamiento.
- Riesgo de sobreajuste al simulador: no se documenta si hubo randomización de dominio ni validación en hardware real.
- La recompensa 0.844 corresponde a la política predecesora, no a esta versión; no debe citarse como rendimiento de este modelo.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso comunitario ni de validación externa.
- El nombre `dashi` coincide con un proyecto de agentes en Go (`deepnoodle-ai/dashi`) sin relación aparente; no debe confundirse con él al buscar documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dashi/microduck-sprint-daily-20261101
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Reentrada previa (2026-10-28): https://huggingface.co/dashi/microduck-sprint-daily-20261028
- Reentrada previa (2026-10-29): https://huggingface.co/dashi/microduck-sprint-daily-20261029
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl (rama `roll-backward`, commit `83599404a`)
- Proyecto Microduck: https://github.com/pollen-robotics/microduck
- Página oficial del robot: https://pollen-robotics.com/microduck/
