# dashi/microduck-sprint-daily-20261119

## Resumen

microduck-sprint-daily-20261119 es una politica de control (policy) para el robot cuadrupedo microduck, desarrollada por el usuario dashi y publicada en Hugging Face. No se trata de un modelo de lenguaje, sino de una politica de aprendizaje por refuerzo exportada a ONNX que genera una marcha (gait) para la ranura `walk` del robot. Segun la model card, es una "re-entrada diaria" del modelo `dashi/microduck-sprint-remix-r844` (con una puntuacion de 0.844) y un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3`.

El modelo opera en bucle perpetuo a 50 Hz, consumiendo observaciones de 61 dimensiones y emitiendo 14 acciones. El normalizador de observaciones esta integrado en el fichero `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto. El repositorio tiene un tamano de 0.0 GB y registra 0 descargas y 0 likes en el momento de la consulta.

La relevancia de esta ficha es limitada para el publico general de desarrolladores de IA: se trata de un artefacto de investigacion en robotica de bajo nivel, sin documentacion de licencia ni de idiomas, y con una model card minima. La informacion disponible no permite evaluar su calidad mas alla de la puntuacion citada (0.844) y de la referencia al repositorio de entrenamiento `pollen-robotics/microduck_rl`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de aprendizaje por refuerzo exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del microduck policy manifest) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la politica. Se sabe que el modelo se entrena con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. El artefacto resultante es un fichero ONNX que incluye el normalizador de observaciones, lo que indica un pipeline de entrenamiento con normalizacion de entradas empaquetada en el grafo.

El modelo es un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3`, etiquetado como `base_model_relation: finetune`. La model card lo describe como una "re-entrada diaria" del modelo `dashi/microduck-sprint-remix-r844`, con una puntuacion de 0.844. No se especifican el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO; en el contexto de robotica, lo habitual seria un bucle de RL con recompensas de locomotion, pero esto no se confirma en la informacion proporcionada.

## Capacidades

- Generacion de una marcha (gait) para la ranura `walk` del robot microduck.
- Control en bucle perpetuo a 50 Hz hasta que se le indique lo contrario.
- Consumo de observaciones de 61 dimensiones y emision de 14 acciones.
- Normalizacion de observaciones integrada en el grafo ONNX (acepta observaciones en bruto).
- Despliegue mediante el comando `robotctl policy load walk dashi/microduck-sprint-daily-20261119`.
- No se documentan capacidades de tool calling, agentes, multilingue, vision, audio ni modo de razonamiento.

## Casos de uso

- Locomocion de un cuadrupedo microduck en laboratorio: cargar la politica en la ranura `walk` con `robotctl` para que el robot mantenga una marcha continua durante sesiones de experimentacion.
- Pruebas de robustez de la marcha: al ser una re-entrada diaria de un modelo con puntuacion 0.844, sirve para comparar variantes de gait en el mismo slot y medir deriva entre versiones.
- Investigacion en aprendizaje por refuerzo para robotica: usar el artefacto ONNX como referencia de politica entrenada en la rama `roll-backward` del repositorio `pollen-robotics/microduck_rl`.
- Integracion en pipelines de simulacion: al ser ONNX, puede cargarse en entornos de simulacion compatibles para validar la marcha antes de desplegarla en hardware.
- Docencia y prototipado con microduck: el comando de carga es de una sola linea, lo que facilita demostraciones reproducibles en talleres.
- Fine-tuning posterior: al estar etiquetado como `finetune` de `jrubiosainz/microduck-game-sprinter-remix3`, puede servir como punto de partida para nuevas variantes de marcha.

## Benchmarks y rendimiento

La unica metrica disponible es la puntuacion citada en la model card: 0.844, correspondiente al modelo de origen `dashi/microduck-sprint-remix-r844`. No se han publicado resultados de benchmarks detallados (tipo MMLU, HumanEval o GSM8K, que no aplican a una politica de robotica) en la informacion disponible.

| Metrica | Valor | Fuente |
|---|---|---|
| Puntuacion de la politica | 0.844 | model card (modelo de origen) |
| Frecuencia de control | 50 Hz | model card |
| Dimension de observacion | 61 | model card |
| Dimension de accion | 14 | model card |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, por lo que el modelo es muy ligero y probablemente cabe en CPU.
- GPU recomendadas: no disponible; al ser una politica ONNX de robotica de bajo nivel, no requiere GPU de datacenter.
- Cabe en consumer GPU: previsiblemente si, dado el tamano del repositorio, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: `robotctl` (comando `robotctl policy load walk dashi/microduck-sprint-daily-20261119`) y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles; la model card solo indica que opera a 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dashi/microduck-sprint-daily-20261119 | Politica RL (ONNX) | no disponible | no aplica | no disponible | Hugging Face |
| dashi/microduck-sprint-remix-r844 | Politica RL | no disponible | no aplica | no disponible | Hugging Face (referenciado) |
| jrubiosainz/microduck-game-sprinter-remix3 | Politica RL | no disponible | no aplica | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparables entre estas variantes mas alla de la puntuacion 0.844 del modelo de origen.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- Idiomas no disponibles: la ficha no aplica a un modelo de lenguaje, pero la ausencia de metadatos impide cualquier evaluacion al respecto.
- Model card minima: no se documentan sesgos, riesgos de alucinacion (no aplica) ni limitaciones de contexto.
- Especifico de hardware: la politica solo funciona con el robot microduck y su daemon; no es reutilizable en otras plataformas sin adaptacion.
- Sin validacion independiente: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de su comportamiento en hardware real.
- Puntuacion de origen no verificada: el 0.844 procede de la model card y no se detalla la metrica ni el protocolo de evaluacion.
- Dependencia de la rama `roll-backward`: el entrenamiento se realizo en una rama concreta del repositorio `pollen-robotics/microduck_rl`, lo que puede afectar a la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261119
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card)
