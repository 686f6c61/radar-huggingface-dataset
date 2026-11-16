# dashi/microduck-hill-daily-20261115

## Resumen

`dashi/microduck-hill-daily-20261115` es una política de control por refuerzo (reinforcement learning) destinada al robot educativo microduck de Pollen Robotics, no un modelo de lenguaje. El artefacto es un grafo ONNX que mapea observaciones brutas de 61 dimensiones a 14 acciones discretas a 50 Hz, pensado para ocupar el slot `walk` del daemon `robotctl`. Se trata de una reentrada diaria ("daily re-entry") del checkpoint `dashi/microduck-hill-remix-r752`, que obtuvo una puntuación de 0,749, y constituye un finetune del modelo `jrubiosainz/microduck-game-hillclimber-remix6`.

La relevancia de esta ficha es acotada: el repositorio tiene 0,0 GB, cero descargas y cero likes en el momento de la consulta, y no publica resultados de benchmarks ni datos de entrenamiento detallados. La model card se limita a indicar que es una política "perpétua" para el slot `walk`, que el normalizador de observaciones está embebido en `policy.onnx` y que el `manifest.json` sigue el esquema 2 del manifiesto de políticas microduck.

No hay información sobre arquitectura de red, número de parámetros, licencia ni idiomas, por lo que la mayor parte de las especificaciones técnicas queda como "no disponible". Esta ficha debe leerse, por tanto, como una descripción de un artefacto de robótica de nicho y no como la de un modelo fundacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política RL exportada a ONNX; red neuronal de control) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observación de 61 dimensiones por paso, control a 50 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Libreria | microduck |
| Pipeline | robotics |
| Modelo base | jrubiosainz/microduck-game-hillclimber-remix6 (finetune) |
| Slot de política | `walk` |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, unidades ocultas, tipo de activación). Lo que sí se sabe es que se trata de una política entrenada con reinforcement learning mediante el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. El artefacto distribuido es un grafo ONNX que incluye el normalizador de observaciones embebido, de modo que el consumidor debe alimentar observaciones brutas sin preprocesado adicional.

La política es "perpetua": no dispone de condición de terminación interna y se ejecuta hasta que el daemon la detiene, comportándose como una marcha continua para el slot `walk`. Deriva por finetune de `jrubiosainz/microduck-game-hillclimber-remix6`, que a su vez procede de un linaje de remixes orientados a tareas de escalada ("hillclimber"). No se especifican número de pasos de entrenamiento, composición del dataset, ni uso de RLHF/DPO (conceptos que no aplican a este tipo de política).

## Capacidades

- Control motor continuo del robot microduck a 50 Hz mediante observaciones de 61 dimensiones y 14 acciones.
- Marcha perpetua en el slot `walk`, sin condición de parada propia.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica el despliegue en el robot.
- Compatibilidad con el daemon `robotctl` mediante el manifiesto de políticas (esquema 2).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- No soporta agentes, multi-step reasoning ni capacidades multilingües.
- No se documentan modos especiales (thinking mode, visión, audio) porque no aplican.

## Casos de uso

- Demostraciones de marcha en el robot microduck: cargar la política en el slot `walk` con `sudo robotctl policy load walk dashi/microduck-hill-daily-20261115` permite arrancar una marcha continua para exhibiciones y vídeos de laboratorio.
- Pruebas de robustez de locomoción: al ser una política perpetua, sirve para evaluar deriva y estabilidad de la marcha durante ejecuciones prolongadas sobre terrenos con pendiente.
- Punto de partida para finetunes: investigadores pueden usarla como inicialización para nuevas políticas de escalada o de marcha, dado que hereda del linaje `hillclimber-remix6`.
- Evaluación de pipelines de despliegue RL-to-ONNX: útil para verificar que el normalizador embebido y el manifiesto esquema 2 funcionan correctamente en el daemon.
- Reproducción de experimentos de RL: combinada con el repo `microduck_rl` (rama `roll-backward`), permite comparar la política reentrenada frente a `microduck-hill-remix-r752`.
- Docencia de robótica con refuerzo: escenario controlado para mostrar a estudiantes cómo una política entrenada se transfiere a hardware real sin preprocesado externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo cita la puntuación de 0,749 del checkpoint del que deriva (`dashi/microduck-hill-remix-r752`), sin detallar la métrica, el entorno de evaluación ni el protocolo.

## Requisitos de hardware

- No se dispone de estimación de VRAM ni de parámetros del modelo, por lo que no es posible calcular requisitos de memoria.
- Al ser una política de control de robot exportada a ONNX, está diseñada para ejecutarse en el propio microduck o en un host conectado, no en GPUs de datacenter.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: daemon `robotctl` del ecosistema microduck (carga mediante `robotctl policy load`); runtime ONNX subyacente no especificado.
- Latencia y throughput: se infiere un ciclo de control a 50 Hz por la especificación del robot, pero no se publican medidas de latencia reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dashi/microduck-hill-daily-20261115 | no disponible | no aplica | no disponible (base: 0,749) | no disponible | Hugging Face |
| jrubiosainz/microduck-game-hillclimber-remix6 | no disponible | no aplica | no disponible | no disponible | Hugging Face (modelo base) |
| dashi/microduck-hill-remix-r752 | no disponible | no aplica | 0,749 (métrica no especificada) | no disponible | Hugging Face (checkpoint de origen) |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está disponible, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Es una política perpetua sin condición de parada: requiere supervisión externa para evitar ejecuciones indefinidas no deseadas.
- No se documentan sesgos, pero al ser un artefacto de control motor el riesgo relevante es el fallo físico del robot, no la alucinación textual.
- No hay información sobre el dominio de entrenamiento, por lo que se desconoce la generalización a terrenos distintos de los usados en el linaje `hillclimber`.
- El repositorio tiene 0,0 GB y cero descargas, lo que sugiere un artefacto experimental sin validación comunitaria.
- No aplican limitaciones de contexto o idioma; no es un modelo de lenguaje.
- La puntuación de 0,749 del checkpoint de origen no viene acompañada de definición de métrica, lo que impide interpretarla como medida de calidad absoluta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261115
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Checkpoint de origen citado: https://huggingface.co/dashi/microduck-hill-remix-r752
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
