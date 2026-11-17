# dashi/microduck-sprint-daily-20261116

## Resumen

`dashi/microduck-sprint-daily-20261116` es una política de control para el robot cuadrúpedo de código abierto Microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo exportada a ONNX que genera comandos motores a 50 Hz a partir de observaciones de 61 dimensiones, produciendo 14 acciones de control. Se publica como un "re-entry diario" de una política previa (`dashi/microduck-sprint-remix-r844`, con recompensa 0.844) y está pensada para ocupar el slot `walk` del robot, es decir, para hacerlo caminar de forma perpetua hasta recibir una orden contraria.

El modelo es un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3` y se distribuye con la librería `microduck` y el pipeline `robotics`. Su relevancia es acotada pero concreta: permite a propietarios de un Microduck cargar una marcha adicional en el robot con un solo comando (`robotctl policy load walk ...`) sin necesidad de reentrenar. La normalización de observaciones está integrada en el propio `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto.

La información pública disponible es muy escasa: el repositorio pesa 0,0 GB (los pesos no aparecen listados en la información proporcionada), no declara licencia ni idiomas, y no incluye resultados de benchmarks ni detalles sobre el dataset de entrenamiento más allá de la rama y el commit del repositorio de RL usado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; no se especifica la red) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Slot del robot | `walk` |
| Modelo base | `jrubiosainz/microduck-game-sprinter-remix3` (fine-tune) |
| Libreria | `microduck` |
| Pipeline | `robotics` |

## Arquitectura y entrenamiento

La arquitectura interna de la red no se detalla en la información disponible; lo único confirmado es que la política se exporta a ONNX e incorpora la normalización de observaciones dentro del propio grafo (`policy.onnx`), de forma que la entrada son observaciones en bruto. El contrato de interfaz está fijado por el robot: 61 dimensiones de observación y 14 acciones, ejecutadas a 50 Hz de forma continua (política "perpetua" para el slot `walk`).

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. La model card indica que esta política es un "re-entry diario" de `dashi/microduck-sprint-remix-r844` con recompensa 0.844, y que es un remix de `jrubiosainz/microduck-game-sprinter-remix3`. No se especifican el número de pasos de entrenamiento, la composición del entorno, el algoritmo de RL concreto (PPO, SAC, etc.) ni si hubo fases de ajuste adicionales.

## Capacidades

- Locomoción cuadrúpeda: genera una marcha continua para el slot `walk` del Microduck a 50 Hz.
- Control reactivo: mapea observaciones de 61 dimensiones (estado de articulaciones, sensores del robot) a 14 acciones motoras.
- Ejecución perpetua: la política corre hasta que el daemon recibe una orden de parada o cambio de política.
- Integración directa con el daemon: se carga mediante `robotctl policy load walk dashi/microduck-sprint-daily-20261116`.
- Normalización integrada: no requiere preprocesar observaciones en el host; el ONNX incluye el normalizador.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción de bajo coste: cargar la política en un Microduck físico para comparar marchas entre distintas políticas del mismo slot y medir estabilidad y velocidad de desplazamiento.
- Base para fine-tuning con `microduck_rl`: al estar entrenada en la rama `roll-backward`, sirve como punto de partida para experimentos de RL sobre el mismo entorno y contrato de observación/acción.
- Docencia y talleres de robótica: el comando de carga en una línea y el formato ONNX permiten que estudiantes ejecuten una política entrenada sin infraestructura de entrenamiento.
- Validación de pipelines de despliegue: útil para probar el daemon `robotctl`, el esquema 2 del manifiesto de políticas y la carga de políticas remotas desde Hugging Face.
- Pruebas de robustez en simulación: al ser un ONNX con normalizador embebido, se puede ejecutar en un simulador compatible con el contrato de 61 observaciones y 14 acciones para evaluar la marcha antes de pasarla al robot.
- Reproducción de experimentos de RL: la model card documenta rama y commit del repositorio de entrenamiento, lo que facilita reproducir o auditar el proceso con `pollen-robotics/microduck_rl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico es la recompensa 0.844 de la política predecesora (`dashi/microduck-sprint-remix-r844`), que no constituye un benchmark comparable con otras políticas sin conocer la definición exacta de la función de recompensa.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser una política de control pequeña exportada a ONNX, es previsible que quepa en CPU, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles; no se especifican requisitos de aceleración.
- GPU de consumo: no confirmado; el despliegue previsto es en el propio robot Microduck, no en un servidor con GPU.
- Opciones de despliegue: daemon `robotctl` del Microduck (comando `robotctl policy load walk ...`); el ONNX puede ejecutarse con cualquier runtime compatible (ONNX Runtime, etc.), aunque no se detalla en la información.
- Latencia y throughput: la política está diseñada para 50 Hz (20 ms por ciclo); no se publican mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Slot | Recompensa | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261116` | Política RL (ONNX) | `jrubiosainz/microduck-game-sprinter-remix3` | `walk` | no disponible (predecesora: 0.844) | no disponible | Hugging Face |
| `dashi/microduck-sprint-remix-r844` | Política RL | no disponible | `walk` | 0.844 | no disponible | Hugging Face |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas; la comparativa se limita a linaje y metadatos.

## Limitaciones y advertencias

- Información muy incompleta: no se declaran licencia, idiomas, arquitectura de red ni número de parámetros, lo que impide evaluar su idoneidad para uso comercial.
- Licencia no disponible: sin licencia explícita, no se puede asumir permiso para uso comercial ni redistribución; conviene contactar con el autor antes de integrarla en un producto.
- Específica del hardware: solo funciona con el contrato del Microduck (61 observaciones, 14 acciones, 50 Hz); no es reutilizable en otros robots sin reentrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de robustez, estabilidad o velocidad de la marcha más allá de la recompensa heredada de la política predecesora.
- Política "perpetua": está diseñada para ejecutarse hasta recibir una orden contraria, lo que exige mecanismos externos de parada segura en el daemon.
- Repositorio de 0,0 GB: los pesos no aparecen listados en la información proporcionada, por lo que no se puede verificar que el artefacto `policy.onnx` esté efectivamente subido.
- Sin datos sobre sesgos ni alucinaciones: al no ser un modelo generativo, estos riesgos no aplican, pero tampoco hay información sobre comportamiento en condiciones fuera de distribución.
- Los resultados de búsqueda web sobre "dashi" corresponden al caldo japonés y no guardan relación con este modelo; se descartan como fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261116
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Política predecesora: https://huggingface.co/dashi/microduck-sprint-remix-r844
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
