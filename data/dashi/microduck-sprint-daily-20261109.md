# dashi/microduck-sprint-daily-20261109

## Resumen

`dashi/microduck-sprint-daily-20261109` es una política de control motriz (policy) para el robot cuadrúpedo de código abierto microduck de Pollen Robotics, no un modelo de lenguaje. Se distribuye como un artefacto ONNX que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz, y se carga directamente en el daemon del robot mediante `robotctl policy load walk`. Lo publica el usuario `dashi` como reentrada diaria ("daily re-entry") de una política previa denominada `microduck-sprint-remix-r844`, que obtuvo una puntuación de 0,844.

El modelo es un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3` y está etiquetado para el slot `walk`, es decir, actúa como marcha o gait del robot en esa ranura concreta del sistema de políticas. La relevancia es acotada pero clara para quien trabaja con microduck: proporciona una política perpetua (se ejecuta hasta que se le indique lo contrario) entrenada con el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`.

La información pública es muy escasa: el repositorio pesa 0,0 GB en el momento de la consulta, no tiene descargas ni likes, no declara licencia ni idiomas, y la model card se limita a indicar el comando de carga, el esquema del manifiesto y los datos de entrenamiento. No se han encontrado benchmarks ni documentación adicional fuera de la propia model card y el repositorio de GitHub de microduck.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con reinforcement learning, exportada a ONNX (no disponible el detalle de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye `policy.onnx`; el normalizador de observaciones está embebido) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Slot de política | `walk` |
| Modelo base | `jrubiosainz/microduck-game-sprinter-remix3` (fine-tune) |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` |
| Libreria | `microduck` |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La model card no describe la topología de la red neuronal más allá de indicar que es una política de reinforcement learning exportada a ONNX. Lo que sí se especifica es la interfaz: recibe observaciones crudas de 61 dimensiones (el normalizador está embebido en el propio `policy.onnx`, por lo que no hay que preprocesar) y emite 14 acciones a 50 Hz. La política es "perpetua": una vez cargada en el slot `walk`, se ejecuta de forma continua hasta que se le indique lo contrario, lo que encaja con el bucle de control de un gait de locomoción.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. No se detalla el número de pasos, la composición del dataset, ni si hubo técnicas de RL específicas (PPO, SAC, etc.) o recompensas de dominio. El modelo es un fine-tune sobre `jrubiosainz/microduck-game-sprinter-remix3`, y la model card lo describe como "daily re-entry" de `dashi/microduck-sprint-remix-r844` (puntuación 0,844), lo que sugiere un proceso iterativo de reentrenamiento diario con evaluación numérica.

## Capacidades

- Locomoción tipo sprint para el robot microduck en el slot `walk`, a 50 Hz y con política perpetua.
- Control reactivo a partir de observaciones de 61 dimensiones y salida de 14 acciones.
- Carga directa en el daemon del robot mediante `robotctl policy load walk dashi/microduck-sprint-daily-20261109`.
- Normalización de observaciones integrada en el ONNX, lo que simplifica el despliegue (se alimentan observaciones crudas).
- Compatibilidad con el esquema 2 del manifiesto de políticas microduck (`docs/policy-manifest.md` en el repositorio del daemon).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control motriz, no un modelo generativo.

## Casos de uso

- Locomoción autónoma del microduck en pruebas de laboratorio: cargar la política en el slot `walk` y dejar que el robot se desplace de forma continua mientras se registran las observaciones y acciones para análisis.
- Evaluación comparativa de gaits: al ser una reentrada diaria de una política puntuada (0,844), sirve para medir si la variante del día mejora o empeora el desplazamiento respecto a la versión anterior.
- Investigación en reinforcement learning para robótica: usar el artefacto como punto de partida o referencia para reproducir el entrenamiento con `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`).
- Demostraciones educativas con microduck: el comando de carga es de una sola línea y el normalizador va embebido, lo que facilita talleres y clases sin pipeline de preprocesado.
- Integración en el daemon de microduck como política por defecto del slot `walk` en entornos de desarrollo, gracias al manifiesto con esquema 2.
- Pruebas de robustez del controlador: ejecutar la política perpetua durante sesiones largas para detectar deriva, saturación de acciones o inestabilidades del gait.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico es la puntuación de 0,844 asociada a la política predecesora `dashi/microduck-sprint-remix-r844`, de la que esta es una reentrada diaria; no se especifica la métrica ni el protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB, lo que sugiere un artefacto ONNX de tamaño muy reducido y, por tanto, inferencia en CPU.
- GPU recomendadas: no disponible. Por el tamaño del artefacto, no se requiere GPU; el control a 50 Hz es asumible en CPU en el propio robot o en un equipo de desarrollo.
- Cabe en GPU de consumo: previsiblemente sí, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: el daemon de microduck mediante `robotctl policy load walk ...`; el runtime ONNX subyacente no se detalla en la información disponible.
- Latencia y throughput: 50 Hz de frecuencia de control según la model card; no se publican latencias por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Puntuación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261109` | Política RL (ONNX) | `walk` | no disponible (predecesora: 0,844) | no disponible | Hugging Face |
| `dashi/microduck-sprint-remix-r844` | Política RL | `walk` | 0,844 | no disponible | Hugging Face |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL (modelo base) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas de locomoción para microduck) más allá de los citados en la propia model card.

## Limitaciones y advertencias

- Es una política de control motriz, no un modelo de lenguaje: no genera texto, no razona, no responde a instrucciones y no admite tool calling.
- La licencia no está declarada, lo que impide confirmar si se permite uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- No se especifican los idiomas ni la composición del dataset de entrenamiento, por lo que no se puede evaluar sesgo o cobertura de condiciones.
- La política es perpetua y específica del slot `walk`: no se documenta su comportamiento fuera de ese contexto ni su robustez ante perturbaciones.
- El repositorio pesa 0,0 GB y no tiene descargas ni likes; es un artefacto reciente (creado el 2026-11-09) sin validación comunitaria.
- No hay benchmarks publicados ni protocolo de evaluación detallado; la puntuación 0,844 corresponde a la política predecesora, no a esta.
- Al ser una "daily re-entry", puede ser reemplazada o quedar obsoleta rápidamente; conviene fijar el commit o versión concreta en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261109
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); no se ha encontrado URL pública en la información disponible.
- Manifiesto de políticas microduck: `docs/policy-manifest.md` en el repositorio del daemon; no se ha encontrado URL pública en la información disponible.
