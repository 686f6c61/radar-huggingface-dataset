# HlibPlakhtii/microduck-tug-cup-nov17-v8

## Resumen

microduck-tug-cup-nov17-v8 es un artefacto de política robótica para simulación, publicado por HlibPlakhtii en Hugging Face y derivado por fine-tuning de HlibPlakhtii/microduck-tug-cup-nov17-v1. No es un modelo de lenguaje: se trata de un controlador entrenado para el entorno de simulación Microduck de Pollen Robotics, orientado a competiciones tipo "tug of war" (tira y afloja) entre dos agentes simulados, con variantes de "Cup". El repositorio combina un adaptador de controlador, configuraciones de evaluación y trayectorias de replay, y se distribuye en formato ONNX para su ejecución en el simulador.

La relevancia de esta ficha es acotada y debe enmarcarse con precisión: el propio autor declara que la red heredada no fue entrenada por él, que el entrenamiento y adaptaciones previas se atribuyen a los autores upstream, y que los resultados locales son evidencia sobre oponentes y semillas concretas, no una garantía de victoria en el torneo oficial. El artefacto incluye una política general (byte-idéntica a la versión v7) y refinamientos específicos de rating sobre la semilla 5.

No se dispone de información sobre arquitectura de red, número de parámetros, longitud de contexto ni idiomas, ya que el modelo no opera sobre texto. La información pública se limita a los metadatos del repositorio, la model card y los artefactos de validación citados (rating-search-series/, cup-validation/, adapter-config.json, source.json).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política robótica; red heredada de microduck-tug-cup-nov17-v1, sin detallar en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de política, no de lenguaje) |
| Tipos de cuantización | no disponible; el artefacto se distribuye en ONNX |
| Idiomas soportados | no aplica (controlador de simulación, no procesa lenguaje) |
| Licencia | no disponible (el autor afirma no reclamar licencia sobre contribuciones upstream sin licencia) |
| Formato de pesos | ONNX |
| Modelo base | HlibPlakhtii/microduck-tug-cup-nov17-v1 (relación: finetune) |
| Librería | microduck |
| Pipeline | robotics |
| Tamaño del repositorio | 0.0 GB (según metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-17 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red. El autor indica explícitamente que no entrenó la red heredada: el modelo base microduck-tug-cup-nov17-v1 aporta la red y el entrenamiento previo, mientras que esta versión v8 incorpora un adaptador de controlador descrito en adapter-config.json, junto con integración de replays de rating y validación. El artefacto se exporta a ONNX para su uso en el simulador Microduck.

El trabajo específico de esta versión se centra en el refinamiento de rating: sobre la fuente D7 fijada (atribuida a jrubiosainz y autores upstream), v8 conserva las contribuciones previas de v7 en las semillas 4 y 5 y añade la trayectoria de la semilla 1 de jrubiosainz. La contribución adicional consiste en dos pasadas acotadas de coordenadas sobre la semilla 5 con normalización de fuerza exacta entre pasadas, con una progresión de 168.53529810905457 → 168.53530406951904 → 168.535315990448 cm; una tercera pasada no mejoró el resultado y se empaquetó la segunda. El controlador general es byte-idéntico a v7, con SHA256 `d54a8b3a323284d2b7c21f8020af33260b26a4d242d106894c3e92203779af20`. No se detalla el uso de RLHF, DPO ni composición de dataset.

## Capacidades

- Control de política en simulación Microduck para tareas de tira y afloja ("tug") con variantes de "Cup".
- Reproducción exacta de observaciones en cinco replays de rating desde la fuente atribuida, con resultado agregado de 168.90318274498 cm y cinco victorias en "pit".
- Paridad verificada: 16 combates de paridad estilo Cup reproducen exactamente el controlador general tras la superposición.
- Refinamiento de trayectoria sobre semillas concretas (semilla 5) mediante pasadas de coordenadas acotadas.
- Ejecución en formato ONNX dentro del ecosistema Microduck/Arena de Pollen Robotics.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni capacidades multilingües: es un controlador de simulación, no un modelo de lenguaje.

## Casos de uso

- Evaluación de políticas en competiciones simuladas: el artefacto permite reproducir combates oficiales bajo reglas completas y comparar el rendimiento del controlador contra oponentes fijados como la política D7 de jrubiosainz, usando las configuraciones de cup-validation/.
- Investigación en robótica simulada: sirve como punto de partida para estudiar refinamientos de trayectoria y normalización de fuerza en tareas de manipulación tipo tug, con evidencia documentada de las pasadas de coordenadas.
- Reproducibilidad de resultados: los replays de rating y los ficheros source.json y RATING_BASE_CARD.md permiten verificar que las observaciones y los resultados (168.90318274498 cm) se reproducen exactamente.
- Validación de paridad de controladores: los 16 combates de paridad estilo Cup permiten comprobar que una modificación (overlay) no altera el comportamiento del controlador general, útil en pipelines de integración de políticas.
- Benchmark local contra oponentes concretos: con 49 victorias de 64 combates oficiales sobre una familia de semillas determinista y alternando lados, el artefacto es adecuado para comparaciones acotadas y reproducibles, no para predicciones de torneo.
- Docencia y divulgación sobre simulación robótica: el repositorio incluye artefactos de verificación y fuentes fijadas que facilitan explicar el flujo completo de entrenamiento heredado, adaptación y validación en el entorno Microduck.

## Benchmarks y rendimiento

| Prueba | Resultado | Contexto |
|---|---|---|
| Replays de rating (5, observación exacta) | 168.90318274498 cm y 5 victorias en pit | Fuente atribuida; replays separados del controlador general |
| Refinamiento semilla 5 (pasadas de coordenadas) | 168.53529810905457 → 168.53530406951904 → 168.535315990448 cm | Dos pasadas exitosas; la tercera no mejora |
| Paridad estilo Cup | 16 combates reproducen exactamente el controlador general tras el overlay | Verifica comportamiento sin cambios, no victorias |
| Benchmark contra política D7 de jrubiosainz | 49 de 64 combates oficiales ganados | Familia de semillas determinista nueva, alternando lados; benchmark local finito |
| Resultado histórico 58/64 | No se reafirma como resultado de esta prueba | Usó una familia de semillas distinta |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ya que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB según los metadatos, lo que sugiere un artefacto muy ligero, pero no se detallan requisitos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el formato ONNX y el tamaño declarado, es plausible su ejecución en hardware modesto, pero no se confirma en la información proporcionada.
- Opciones de despliegue: ejecución mediante la librería microduck y el simulador Arena de Pollen Robotics, con pesos en ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-tug-cup-nov17-v8 | Política robótica (ONNX) | no disponible | no aplica | 49/64 vs D7 en benchmark local; 168.90318274498 cm en replays de rating | no disponible | Hugging Face, 0 descargas |
| microduck-tug-cup-nov17-v1 | Política robótica (modelo base) | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| Política D7 de jrubiosainz | Política robótica (referencia) | no disponible | no aplica | Referencia del benchmark local de v8 | no disponible | Referenciada en la model card |

No se dispone de información suficiente para comparar con alternativas adicionales de la misma categoría.

## Limitaciones y advertencias

- El autor declara explícitamente que los resultados locales son evidencia sobre oponentes y semillas probados, no una garantía de victoria en la Copa; el resultado oficial del torneo es la referencia autoritativa.
- Los replays de rating son independientes del controlador general usado contra oponentes desconocidos y semillas de Cup; no deben extrapolarse como rendimiento general.
- La paridad verifica comportamiento sin cambios, no victorias en torneo.
- El benchmark de 49/64 se realizó sobre una familia de semillas determinista nueva; el resultado histórico de 58/64 usó otra familia y no se reafirma.
- La red heredada no fue entrenada por el autor de esta versión; el crédito y las posibles restricciones de las contribuciones upstream aplican.
- No se afirma licencia sobre contribuciones upstream sin licencia; la licencia del artefacto figura como no disponible, lo que impide confirmar condiciones de uso comercial.
- No se modificaron evaluador, física, árbitro ni servidor; el uso es exclusivamente en simulación.
- No aplica a tareas de lenguaje, visión, audio ni agentes conversacionales; carece de sesgos lingüísticos o de alucinación en el sentido habitual, pero su comportamiento está acotado al entorno Microduck.
- El repositorio tiene 0 descargas y 0 likes, sin comunidad de validación independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v8
- Modelo base: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v1/tree/897f43d184c26277073d985771a09f66e7f93ec1
- Artefactos citados en la model card: adapter-config.json, source.json, RATING_BASE_CARD.md, rating-search-series/, cup-validation/ (dentro del repositorio del modelo)
- Pollen Robotics (Microduck y Arena): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
