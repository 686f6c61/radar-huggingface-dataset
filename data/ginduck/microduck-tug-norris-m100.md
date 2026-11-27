# GinDuck/microduck-tug-norris-m100

## Resumen

Tug Norris es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo microduck de Pollen Robotics. Se distribuye como un fine-tune del modelo SSH111111/microduck-tug-p10, realizado por el usuario GinDuck dentro del ecosistema competitivo "Arena" (ligas y copas de políticas para microduck). El modelo se publica como un artefacto de inferencia en formato ONNX, pensado para cargarse directamente en un slot de política del robot mediante la herramienta `robotctl`.

La política opera a 50 Hz con una observación de 61 dimensiones y 14 acciones de control, y está diseñada como un comportamiento "perpetuo": una marcha (gait) que se ejecuta de forma continua hasta que se le indique lo contrario. No es un modelo de lenguaje ni un sistema multimodal; es un controlador de locomoción entrenado con RL en el entorno de simulación `tug` del repositorio `pollen-robotics/microduck_rl`.

Su relevancia es acotada pero específica: demuestra el flujo de trabajo de fine-tuning competitivo de políticas de locomoción para robótica de bajo coste, con distribución en ONNX lista para despliegue en hardware real. El repositorio está vacío (0.0 GB), sin descargas ni likes, y no se dispone de información sobre licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política para RL (detalles de capas no disponibles); inferencia vía ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de activaciones). Se sabe que es una política de control entrenada con aprendizaje por refuerzo en el entorno `tug` del repositorio `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0`. El modelo parte del checkpoint `SSH111111/microduck-tug-p10` y se fine-tunea hasta el checkpoint 100 de la liga `league-4c`.

El entrenamiento se realizó contra un "sparring pool" (conjunto de oponentes de entrenamiento) y utiliza secuencias de los usuarios suraj-phanindra y jrubiosainz, con búsqueda de ascenso de colina (hill-climbing) realizada por GinDuck sobre la tabla de ratings de la Arena. La normalización de observaciones está embebida dentro de `policy.onnx`, de modo que la política consume observaciones en bruto sin preprocesado externo. No se especifican el número de pasos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RL específicas (PPO, SAC, etc.).

## Capacidades

- Locomoción continua ("perpetua") del robot microduck: genera una marcha que se ejecuta hasta recibir una orden de parada o sustitución.
- Control a 50 Hz con observación de 61 dimensiones y 14 acciones.
- Inferencia autocontenida: la normalización de observaciones va incluida en el ONNX, por lo que acepta observaciones en bruto.
- Carga directa en hardware mediante `robotctl policy load <slot> GinDuck/microduck-tug-norris-m100`.
- Comportamiento competitivo afinado contra un pool de oponentes (sparring pool) en el entorno de la Arena.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento: es exclusivamente un controlador de locomoción.

## Casos de uso

- Despliegue de locomoción en microduck real: cargar la política en un slot con `robotctl` y ejecutar la marcha de forma continua para pruebas de hardware y demostraciones de movimiento.
- Competiciones de la Arena: usar la política como contendiente en ligas y copas de políticas de microduck, aprovechando su fine-tune contra el sparring pool y su posición en la tabla de ratings.
- Base para fine-tuning propio: al ser un derivado de `SSH111111/microduck-tug-p10`, sirve como punto de partida para entrenar variantes con el repositorio `pollen-robotics/microduck_rl`.
- Evaluación comparativa de políticas: integrarla en pipelines de evaluación del entorno `tug` para medir el rendimiento de distintas marchas bajo las mismas condiciones.
- Prototipado educativo en robótica de bajo coste: demostrar el ciclo completo simulación a hardware con un artefacto ONNX y un manifiesto de política estandarizado.
- Investigación en RL aplicado a locomoción: analizar el efecto del fine-tuning y del hill-climbing sobre una política base en un entorno competitivo reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0.0 GB y no se publican parámetros de la red, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles. Dado el carácter de política de control a 50 Hz para un robot de bajo coste, es plausible que la inferencia ONNX sea ligera, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo está pensado para ejecutarse en el propio robot mediante `robotctl` (daemon de microduck) cargando `policy.onnx`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-tug-norris-m100 | Política RL (ONNX) | 61-D / 14 | 50 Hz | no disponible | Hugging Face |
| SSH111111/microduck-tug-p10 | Política RL (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas de la Arena microduck | Políticas RL | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un controlador de locomoción específico para el microduck; no es un modelo de lenguaje ni un sistema multimodal, y no debe evaluarse con métricas de NLP.
- El repositorio está vacío (0.0 GB) y no registra descargas ni likes, por lo que la integridad y disponibilidad de los artefactos (`policy.onnx`, `manifest.json`) no puede verificarse desde la información proporcionada.
- Licencia no disponible: no hay base explícita para el uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- El modelo es un fine-tune de checkpoint 100 de una liga concreta (`league-4c`); su rendimiento está condicionado al entorno `tug` y al sparring pool empleado, y puede no generalizar a otras condiciones físicas o de hardware.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque no aplican a este tipo de modelo; el riesgo relevante es el fallo de control (caída, marcha inestable) en hardware real.
- La reproducibilidad depende de la rama `talent-3` y del commit `debcfcae0` del repositorio `pollen-robotics/microduck_rl`; cambios posteriores en el entorno pueden alterar el comportamiento esperado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-tug-norris-m100
- Modelo base: https://huggingface.co/SSH111111/microduck-tug-p10
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `talent-3`, commit `debcfcae0`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
- App QuackPack: https://www.imundo.ch/quackpack/
