# dashi/microduck-sprint-daily-20261117

## Resumen

`dashi/microduck-sprint-daily-20261117` es una política de control robótico entrenada por refuerzo (reinforcement learning) para el robot bípedo open source **microduck** de Pollen Robotics. No se trata de un modelo de lenguaje: es una política de locomoción que ocupa la ranura (`slot`) de marcha (`walk`) del robot y produce comandos de acción a 50 Hz a partir de observaciones de 61 dimensiones. El modelo se distribuye en formato ONNX con el normalizador de observaciones integrado en el propio grafo, de modo que el robot puede alimentarlo directamente con observaciones en bruto.

La ficha corresponde a una "reentrada diaria" (`daily re-entry`) del modelo `dashi/microduck-sprint-remix-r844`, que obtuvo una puntuación de 0,844. Es, por tanto, un fine-tune derivado de `jrubiosainz/microduck-game-sprinter-remix3`, orientado a producir una marcha perpetua: la política se ejecuta de forma continua hasta recibir una orden de parada. La arquitectura concreta de la red neuronal no se detalla en la información disponible; solo se especifica la interfaz de observación (61 dimensiones) y de acción (14 dimensiones), así como la frecuencia de control (50 Hz).

La relevancia de este artefacto es acotada y muy específica: sirve a desarrolladores e investigadores que trabajan con el robot microduck y quieren desplegar rápidamente una política de marcha entrenada mediante RL. Al ser un fine-tune de una política "game-sprinter", hereda el comportamiento de locomoción del modelo base, pero los detalles de entrenamiento, la composición del dataset y las métricas de rendimiento no están publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal para control robótico; red con normalizador de observaciones integrado en `policy.onnx`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (distribución en ONNX) |
| Idiomas soportados | no disponible (no aplica; no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna de la red (número de capas, tipo de capas, número de parámetros). Lo que sí se documenta es la interfaz: observación de 61 dimensiones, 14 acciones de salida y una frecuencia de control de 50 Hz. El normalizador de observaciones está "horneado" dentro de `policy.onnx`, lo que implica que la política consume observaciones en bruto y que el preprocesado forma parte del grafo exportado.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. Se trata de un fine-tune (`base_model_relation: finetune`) del modelo `jrubiosainz/microduck-game-sprinter-remix3`, que a su vez es un remix de la familia "game-sprinter". No se publican el número de tokens/pasos de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO (no aplicables aquí). La innovación destacable es el propio formato de distribución: una política ONNX con normalizador integrado, empaquetada junto a un `manifest.json` conforme al esquema 2 del daemon de microduck, lo que permite cargarla en el robot con un único comando.

## Capacidades

- Locomoción bípeda perpetua para el robot microduck: la política se ejecuta de forma continua hasta recibir una orden de parada.
- Control a 50 Hz con 14 acciones de salida a partir de observaciones de 61 dimensiones.
- Ocupación de la ranura `walk` del robot, mediante el comando `robotctl policy load walk`.
- Consumo de observaciones en bruto: el normalizador está integrado en `policy.onnx`, sin preprocesado externo.
- Distribución en ONNX con manifiesto conforme al esquema 2 del daemon de microduck.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión, audio ni modo de razonamiento (no aplican a este tipo de modelo).

## Casos de uso

- Despliegue rápido de una marcha en el robot microduck: cargar la política con `sudo robotctl policy load walk dashi/microduck-sprint-daily-20261117` permite al robot ponerse a caminar sin entrenamiento adicional, aprovechando el normalizador integrado en ONNX.
- Investigación en reinforcement learning para robótica: usar esta política como punto de partida o línea base para comparar variantes de entrenamiento (por ejemplo, la rama `roll-backward` del repo `microduck_rl`) frente a otras políticas de la familia "game-sprinter".
- Experimentación con fine-tuning de políticas de locomoción: al ser un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3`, sirve para estudiar cómo pequeñas variaciones de entrenamiento afectan la marcha resultante.
- Demos y prototipos de robótica educativa: el formato ONNX y el manifiesto estandarizado facilitan la integración en talleres y demostraciones con el robot microduck.
- Evaluación de pipelines de despliegue: probar el flujo `robotctl policy load` y el consumo de observaciones en bruto en entornos de laboratorio antes de pasar a políticas más elaboradas.
- Reproducibilidad de experimentos: al documentarse repo, rama y commit de entrenamiento, el artefacto puede servir como referencia para reproducir o auditar el proceso de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que el modelo del que deriva esta reentrada (`dashi/microduck-sprint-remix-r844`) obtuvo una puntuación de 0,844, pero no se especifica la métrica empleada, el protocolo de evaluación ni el conjunto de comparación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una política de control de un robot bípedo de pequeñas dimensiones con observación de 61 dimensiones y 14 acciones, el requisito de memoria es presumiblemente muy bajo, pero no se publican cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se documenta si la inferencia se ejecuta en CPU o GPU.
- Opciones de despliegue: inferencia mediante ONNX Runtime (formato `policy.onnx`) y carga en el robot con el comando `robotctl policy load walk` del daemon de microduck. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; solo se conoce la frecuencia de control de 50 Hz exigida por la interfaz.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261117` | Política RL para microduck (slot `walk`) | no disponible | no disponible | no disponible | Hugging Face, ONNX |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL para microduck (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| `dashi/microduck-sprint-remix-r844` | Política RL para microduck (origen de la reentrada) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, por lo que el uso comercial queda sin clarificar; debe consultarse el repositorio o contactar con el autor antes de un despliegue en producción.
- La política está entrenada específicamente para el robot microduck; no es transferible a otras plataformas sin reentrenamiento.
- Al ser una política "perpetua", se ejecuta hasta recibir una orden de parada; en entornos reales debe garantizarse un mecanismo fiable de interrupción.
- No se publican datos sobre robustez ante perturbaciones, terrenos irregulares o fallos de sensores; estos extremos deben validarse empíricamente.
- Al ser un fine-tune de un modelo "game-sprinter", puede heredar sesgos o comportamientos del modelo base que no están documentados.
- No se detalla la arquitectura ni el número de parámetros, lo que dificulta estimar costes de inferencia y requisitos de hardware.
- Los resultados de búsqueda web disponibles no guardan relación con el modelo (se refieren al caldo japonés "dashi"), por lo que no aportan información técnica adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261117
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
