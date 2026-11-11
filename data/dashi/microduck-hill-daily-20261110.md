# dashi/microduck-hill-daily-20261110

## Resumen

`dashi/microduck-hill-daily-20261110` es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es una política neuronal que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetada en formato ONNX para su ejecución directa sobre el robot. El autor del artefacto es el usuario de Hugging Face `dashi`, que la publica como reentrada diaria de una política previa (`dashi/microduck-hill-remix-r752`, con recompensa reportada de 0.749) y como fine-tuning del modelo `jrubiosainz/microduck-game-hillclimber-remix6`.

La política está especializada en la ranura (`slot`) de marcha `walk`: implementa una marcha perpetua, es decir, corre de forma continua hasta que se le indica lo contrario. El normalizador de observaciones está embebido dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. Se distribuye junto a un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de entrenamiento RL para robótica de bajo coste con el stack `microduck_rl`, y como artefacto desplegable mediante el comando `robotctl policy load`. No hay evidencia de uso fuera del ecosistema microduck ni de resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles de capas no disponibles); empaquetada como grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, sin contexto textual); ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Ranura (`slot`) | `walk` |
| Modelo base | `jrubiosainz/microduck-game-hillclimber-remix6` (fine-tune) |
| Repo de entrenamiento | `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` |
| Tamano del repo | 0.0 GB (reportado por Hugging Face) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchos, tipo de activación ni si emplea memoria recurrente). Lo que sí se documenta es el contrato de interfaz: entrada de 61 dimensiones de observación, salida de 14 dimensiones de acción, a 50 Hz, con normalización de observaciones integrada en el grafo ONNX. La política se entrena mediante aprendizaje por refuerzo con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`.

El modelo es un fine-tune de `jrubiosainz/microduck-game-hillclimber-remix6`, a su vez un remix orientado al escenario de "hillclimber" (escalada de colinas). La model card describe esta publicación como "reentrada diaria" de `dashi/microduck-hill-remix-r752`, con una recompensa anotada de 0.749, lo que sugiere un pipeline de iteración diaria sobre políticas previas. No se especifican el número de pasos de entrenamiento, la composición del dataset de experiencias, ni si se aplicaron técnicas de regularización o currículo. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Generación de marcha perpetua para la ranura `walk` del robot microduck: la política emite acciones de forma continua hasta recibir una orden de parada.
- Control reactivo a partir de observaciones proprioceptivas y posiblemente exteroceptivas de 61 dimensiones (la composición exacta de la observación no está documentada en la información disponible).
- Ejecución en tiempo real a 50 Hz, compatible con el bucle de control del daemon de microduck.
- Ingesta de observaciones en crudo: el normalizador está embebido en el ONNX, lo que simplifica la integración.
- Despliegue declarativo mediante `robotctl policy load walk <repo>`, con manifiesto de política en esquema 2.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de "thinking": es una política de control, no un modelo generativo de propósito general.

## Casos de uso

- Locomoción continua en el microduck: cargar la política en la ranura `walk` con `robotctl policy load walk dashi/microduck-hill-daily-20261110` para que el robot mantenga una marcha perpetua sobre terreno con pendientes suaves, aprovechando el linaje "hillclimber" del modelo base.
- Reproducción de experimentos de RL en robótica de bajo coste: usar el artefacto como punto de partida para comparar recompensas frente a `dashi/microduck-hill-remix-r752` (0.749) y frente al base `jrubiosainz/microduck-game-hillclimber-remix6`, dado que el repo de entrenamiento y el commit están documentados.
- Fine-tuning incremental en pipelines diarios: el patrón de "reentrada diaria" sugiere un flujo donde cada día se publica una política derivada; sirve como ejemplo de automatización de entrenamiento y publicación en Hugging Face.
- Evaluación de robustez de marcha en simulación antes de despliegue físico: al ser un ONNX autocontenido con normalizador embebido, puede ejecutarse en un simulador que replique el contrato de 61 observaciones y 14 acciones a 50 Hz.
- Docencia y demostraciones de RL aplicado: útil para ilustrar el ciclo completo observación-acción-recompensa en un robot cuadrúpedo de bajo coste con hardware abierto.
- Integración en el daemon de microduck para pruebas de compatibilidad de manifiestos: valida el esquema 2 de `docs/policy-manifest.md` en el repositorio del daemon.
- Comparación de estrategias de marcha: al estar etiquetada en la ranura `walk`, permite alternar políticas (por ejemplo, otras ranuras o remixes) y medir deriva, estabilidad y consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico de rendimiento es la recompensa anotada de 0.749 asociada a la política predecesora `dashi/microduck-hill-remix-r752`, que no constituye un benchmark estandarizado ni es directamente comparable con otras políticas sin conocer la función de recompensa y el entorno de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB según Hugging Face, lo que sugiere un artefacto muy pequeño, pero no se documenta el número de parámetros ni el tamaño exacto del ONNX.
- GPU recomendadas: no disponibles. Por el tipo de carga (política de control a 50 Hz), es plausible que la inferencia en CPU sea suficiente, pero esto no está confirmado en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `robotctl` (daemon de microduck) con `policy load`; ejecución del `policy.onnx` mediante un runtime ONNX estándar. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el único requisito temporal documentado es la frecuencia de control de 50 Hz (20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261110` | Política RL (ONNX) | 61 obs / 14 acc | 50 Hz | `jrubiosainz/microduck-game-hillclimber-remix6` | no disponible | Hugging Face |
| `dashi/microduck-hill-remix-r752` | Política RL | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciada) |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables (recompensa, tasa de éxito, estabilidad) entre estas políticas en la información proporcionada, por lo que la comparativa se limita a linaje y formato.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para la ranura `walk` y el escenario "hillclimber"; no se garantiza su comportamiento en otros terrenos, ranuras o tareas.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de integrarla en productos.
- Ausencia de benchmarks: no hay métricas estandarizadas publicadas; la recompensa 0.749 corresponde a la política predecesora, no a esta.
- Riesgo de sobreajuste al simulador: al no documentarse el dominio de entrenamiento ni técnicas de aleatorización, existe riesgo de brecha sim-a-real no cuantificada.
- Dependencia del contrato de observación: cualquier cambio en la composición de las 61 observaciones o en el orden de las 14 acciones invalida la política; no hay documentación pública de ese contrato en la información disponible.
- Normalizador embebido: alimentar observaciones ya normalizadas produciría un comportamiento incorrecto; hay que pasar observaciones en crudo.
- Idiomas y sesgos: no aplica en el sentido lingüístico, pero no se documentan sesgos de comportamiento (por ejemplo, deriva en pendientes pronunciadas) ni límites de seguridad física.
- Madurez: publicación con 0 descargas y 0 likes en el momento de la consulta, creada y actualizada el 2026-11-10; sin evidencia de validación por terceros.
- El contenido de la búsqueda web proporcionada trata sobre el caldo japonés *dashi* y no guarda relación con el modelo; se descarta como fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261110
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); URL no proporcionada en la información disponible
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (URL no proporcionada)
