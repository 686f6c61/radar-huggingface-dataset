# GinDuck/microduck-gin-remix-roller-2

## Resumen

`microduck-gin-remix-roller-2` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje ni un transformer generativo: es una red neuronal que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, diseñada para que el robot se desplace de forma perpetua sobre ruedas (rollers). Lo publica el usuario GinDuck bajo el identificador `GinDuck/microduck-gin-remix-roller-2`.

El modelo se presenta como un "remix": combina datos de entrenamiento de varias políticas previas de la comunidad. Concretamente, la semilla 1 reproduce el entrenamiento de `jrubiosainz/game-roller-remix12`, las semillas 2, 4 y 5 reproducen `HlibPlakhtii/quicksilver-roller-v2`, y la semilla 3 reproduce `rumezhak/roller-composite-v1`. La red subyacente es la de `GinDuck/roller-2`. El resultado es una política de marcha continua ("perpetual") que se ejecuta indefinidamente hasta que se le indique lo contrario, cargada en una ranura de política del daemon del robot.

Su relevancia es acotada pero concreta: forma parte del ecosistema de políticas de refuerzo para robótica de bajo coste del proyecto microduck, y su valor radica en la reproducibilidad del entrenamiento (se documentan repositorio, rama y commit) y en la portabilidad del despliegue mediante ONNX. No obstante, el repositorio está vacío (0,0 GB) en el momento de la consulta, lo que impide verificar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política de aprendizaje por refuerzo (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportado a ONNX; cuantización no documentada) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, dimensiones ocultas, tipo de activaciones). Se sabe que es una política de control que consume observaciones de 61 dimensiones y produce 14 acciones a una frecuencia de 50 Hz, y que el normalizador de observaciones está integrado dentro del propio `policy.onnx`, de modo que la política recibe observaciones en bruto. El despliegue se realiza mediante el daemon `robotctl`, que carga la política en una ranura concreta.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0`, presumiblemente mediante un algoritmo de aprendizaje por refuerzo (PPO u otro, no especificado). El modelo es un "remix" de entrenamientos previos de la comunidad, combinando semillas que reproducen políticas de otros autores. No se documentan el número de pasos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO (no aplicables en este dominio). El modelo está marcado explícitamente como "simulation only".

## Capacidades

- Control locomotor sobre ruedas (rollers) del robot microduck, con una política de marcha perpetua que se ejecuta hasta que se detiene externamente.
- Mapeo directo de observaciones de 61 dimensiones a 14 acciones de control a 50 Hz.
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica la integración con el daemon.
- Carga en ranuras de política mediante `robotctl policy load <slot> GinDuck/microduck-gin-remix-roller-2`.
- Compatibilidad con el manifiesto de políticas microduck en su esquema 2.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión ni audio: es una política de control motor, no un modelo generativo.

## Casos de uso

- Desplazamiento continuo del microduck sobre ruedas en entornos simulados: la política está diseñada como marcha perpetua, por lo que se usaría para mantener al robot en movimiento indefinido en simulación, ideal para pruebas de resistencia o de consumo energético.
- Reproducción de experimentos de entrenamiento de RL: al documentarse repositorio, rama y commit, permite reproducir el pipeline de `microduck_rl` y comparar el efecto del remix de semillas frente a las políticas originales.
- Comparación de políticas de la comunidad: sirve como referencia para contrastar el comportamiento de `game-roller-remix12`, `quicksilver-roller-v2` y `roller-composite-v1` frente a esta combinación.
- Integración en el daemon de microduck: mediante `robotctl` y el manifiesto de esquema 2, se puede cargar en una ranura para pruebas de integración del stack de control.
- Docencia y experimentación en robótica de bajo coste: el formato ONNX y la normalización integrada facilitan su uso en prácticas de despliegue de políticas de RL.
- Base para futuros remixes: al combinar semillas de varias políticas, puede servir de punto de partida para nuevos entrenamientos que mezclen datos de otras fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser una política de control de observaciones de 61 dimensiones y 14 acciones, el modelo es presumiblemente muy pequeño y cabe en cualquier GPU consumer, pero no se confirma el tamaño.
- GPU recomendadas: no disponible; para inferencia a 50 Hz, cualquier GPU moderna (RTX 4090, A100, H100) sería sobrada, pero no hay datos que lo confirmen.
- Cabe en GPU consumer: probablemente sí, pero no confirmado por falta de datos sobre el tamaño del modelo.
- Opciones de despliegue: ONNX Runtime a través del daemon `robotctl` del proyecto microduck; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles; el modelo debe ejecutarse a 50 Hz (20 ms por ciclo) según la especificación de la política, pero no se confirma el cumplimiento en hardware concreto.

## Comparativa con modelos similares

| Modelo | Autor | Tipo | Observaciones / acciones | Frecuencia | Formato | Licencia |
|---|---|---|---|---|---|---|
| microduck-gin-remix-roller-2 | GinDuck | Política RL remix | 61 / 14 | 50 Hz | ONNX | no disponible |
| game-roller-remix12 | jrubiosainz | Política RL | no disponible | no disponible | no disponible | no disponible |
| quicksilver-roller-v2 | HlibPlakhtii | Política RL | no disponible | no disponible | no disponible | no disponible |
| roller-composite-v1 | rumezhak | Política RL | no disponible | no disponible | no disponible | no disponible |

Los tres modelos comparables son las políticas de origen cuyas semillas se incorporan en este remix; no se dispone de sus especificaciones detalladas ni de datos de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está marcado explícitamente como "simulation only": no se garantiza su funcionamiento en hardware físico.
- El repositorio tiene un tamaño de 0,0 GB en el momento de la consulta, lo que sugiere que los pesos no están disponibles o no se han subido, impidiendo su uso real.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- No se documentan sesgos, pero al ser una política entrenada en simulación, puede presentar un gap de realidad (sim-to-real gap) si se traslada a un robot físico.
- No se especifican los datos de entrenamiento ni el número de pasos, lo que limita la reproducibilidad más allá del commit indicado.
- El modelo es un remix de políticas de terceros; los derechos sobre las políticas de origen no se detallan.
- No aplica riesgo de alucinación (no es un modelo de lenguaje), pero sí riesgo de comportamiento impredecible fuera de las condiciones de simulación entrenadas.
- No se dispone de información sobre idiomas, cuantización ni requisitos de hardware, lo que dificulta su evaluación para producción.

## Enlaces

- [Hugging Face: GinDuck/microduck-gin-remix-roller-2](https://huggingface.co/GinDuck/microduck-gin-remix-roller-2)
- [Repositorio microduck (Pollen Robotics)](https://github.com/pollen-robotics/microduck)
- [Repositorio de entrenamiento microduck_rl](https://github.com/pollen-robotics/microduck_rl) (rama `talent-3`, commit `debcfcae0`)
- [Documentación del manifiesto de políticas microduck](https://github.com/pollen-robotics/microduck/blob/main/docs/policy-manifest.md) (referenciada en la model card; ruta exacta no confirmada)
