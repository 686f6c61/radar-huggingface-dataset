# dashi/microduck-hill-daily-20261117

## Resumen

`dashi/microduck-hill-daily-20261117` es una política de control motriz entrenada por refuerzo para el robot cuadrúpedo de bajo coste microduck desarrollado por Pollen Robotics. No es un modelo de lenguaje: se trata de una política de locomoción que mapea observaciones de 61 dimensiones a 14 acciones de control, ejecutándose a 50 Hz sobre el hardware real. Se publica como un artefacto ONNX autocontenido, con el normalizador de observaciones embebido en el propio grafo, de modo que el consumidor solo debe alimentar observaciones en bruto.

El modelo se distribuye como un *re-entry* diario de la política `dashi/microduck-hill-remix-r752`, que reportó una recompensa de 0.749, y es un *finetune* de `jrubiosainz/microduck-game-hillclimber-remix6`. Su propósito es ocupar el *slot* `walk` del daemon `robotctl`, proporcionando una marcha perpetua (sin condición de terminación) que el robot ejecuta hasta que se le indique lo contrario.

La relevancia de esta publicación es acotada y muy específica: forma parte de una cadencia de versionado diario de políticas para un robot de investigación educativa, con un tamaño de repositorio de 0.0 GB (pesos ligeros, adecuados para cómputo embebido). No hay información sobre arquitectura de red, número de parámetros ni datos de entrenamiento más allá de la referencia al repositorio `pollen-robotics/microduck_rl`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada por RL; topología de red no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal de la política: no se especifica si es un MLP, una red recurrente o un transformer ligero. Lo que sí se documenta es la interfaz: entrada de observaciones de 61 dimensiones, salida de 14 acciones, frecuencia de control de 50 Hz y comportamiento perpetuo (la política no emite señal de terminación; corre hasta que el operador la detiene). El normalizador de observaciones está integrado en el grafo ONNX, lo que elimina la necesidad de replicar el preprocesado en el lado del robot.

El entrenamiento se realizó con aprendizaje por refuerzo utilizando el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. El modelo es un *finetune* de `jrubiosainz/microduck-game-hillclimber-remix6`, y esta publicación concreta es un *re-entry* diario de `dashi/microduck-hill-remix-r752`, que alcanzó una recompensa de 0.749. No se documentan el número de pasos de entrenamiento, la composición del dataset de experiencias, ni si se aplicaron técnicas de regularización o *domain randomization*.

## Capacidades

- Locomoción cuadrúpeda perpetua para el robot microduck, especializada en el *slot* `walk`.
- Control reactivo a partir de observaciones proprioceptivas y posiblemente exteroceptivas de 61 dimensiones.
- Generación de 14 comandos de actuación a 50 Hz, compatible con el bucle de control del daemon `robotctl`.
- Despliegue directo en robot mediante el comando `robotctl policy load walk dashi/microduck-hill-daily-20261117`.
- Inferencia autocontenida: el normalizador de observaciones va embebido en `policy.onnx`, por lo que se aceptan observaciones en bruto.
- Sin capacidades de lenguaje, visión, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- **Locomoción base del microduck en laboratorio**: cargar la política en el *slot* `walk` para que el robot camine de forma continua mientras se prueba hardware, sensores o el propio daemon `robotctl`. Es adecuada porque está diseñada explícitamente como marcha perpetua sin condición de parada.
- **Punto de partida para *finetuning* de políticas de marcha**: al ser un *finetune* de un modelo público y estar versionada diariamente, sirve como inicialización para experimentos de RL con `pollen-robotics/microduck_rl` en la rama `roll-backward`.
- **Evaluación comparativa de *checkpoints* diarios**: la cadencia de publicación (`daily-20261117`) permite comparar recompensas entre versiones (la base reporta 0.749) y medir la estabilidad del entrenamiento a lo largo del tiempo.
- **Docencia y divulgación en robótica de bajo coste**: el microduck es una plataforma educativa; esta política permite demostrar un ciclo completo de RL sim-to-real con un único artefacto ONNX y un comando de carga.
- **Pruebas de integración del manifiesto de políticas**: el `manifest.json` sigue el schema 2 documentado en `docs/policy-manifest.md` del repositorio del daemon, por lo que el modelo es útil como caso de prueba para validar el cargador de políticas.
- **Benchmark de inferencia embebida**: al ser un ONNX ligero (repo de 0.0 GB) con normalización integrada, sirve para medir latencia y throughput de inferencia a 50 Hz en el cómputo a bordo del robot.

## Benchmarks y rendimiento

La única métrica publicada es la recompensa de la política base de la que deriva este *re-entry*:

| Metrica | Valor |
|---|---|
| Recompensa de `dashi/microduck-hill-remix-r752` (base del re-entry) | 0.749 |
| Recompensa de `dashi/microduck-hill-daily-20261117` | no disponible |

No se han publicado resultados de benchmarks adicionales (ni métricas de locomoción como velocidad, estabilidad o tasa de caídas) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el repositorio ocupa 0.0 GB, lo que indica un modelo de muy pocos parámetros, probablemente ejecutable en CPU embebida.
- **GPU recomendadas**: no se especifican; por el tamaño y la frecuencia de control (50 Hz), es plausible su ejecución en CPU del propio robot, pero no está confirmado en la documentación.
- **Consumer GPU**: no disponible; no se documentan requisitos mínimos.
- **Opciones de despliegue**: el despliegue previsto es mediante el daemon `robotctl` (`robotctl policy load walk ...`) sobre el robot microduck. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles; el único dato es la frecuencia de operación de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Recompensa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261117` | Política RL microduck (slot walk) | `jrubiosainz/microduck-game-hillclimber-remix6` | no disponible | no disponible | Hugging Face |
| `dashi/microduck-hill-remix-r752` | Política RL microduck | no disponible | 0.749 | no disponible | Hugging Face |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL microduck | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de información sobre otros modelos comparables fuera del ecosistema microduck.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia, por lo que el uso comercial queda en un limbo legal hasta que el autor la declare.
- **Especificidad de hardware**: la política está entrenada para el microduck (61 observaciones, 14 acciones, 50 Hz); no es transferible a otras plataformas sin reentrenamiento.
- **Comportamiento perpetuo**: la política no emite señal de terminación; requiere supervisión externa para detener el robot.
- **Sin documentación de seguridad**: no se describen límites de par, comportamientos de recuperación ante caídas ni protocolos de parada de emergencia más allá del control del daemon.
- **Rendimiento no verificado**: la recompensa de 0.749 corresponde a la política base del *re-entry*, no a este *checkpoint* concreto; no hay métricas de robustez ni de generalización.
- **Trazabilidad limitada**: se desconoce la arquitectura, el número de parámetros y los detalles del entrenamiento, lo que dificulta la auditoría técnica.
- **Sin soporte multilingüe ni de lenguaje**: cualquier expectativa de uso como modelo generativo es un error de categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261117
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
