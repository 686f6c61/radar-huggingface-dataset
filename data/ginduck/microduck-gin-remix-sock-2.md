# GinDuck/microduck-gin-remix-sock-2

## Resumen

`GinDuck/microduck-gin-remix-sock-2` es una política de control por aprendizaje por refuerzo (reinforcement learning) destinada al robot cuadrúpedo de código abierto microduck de Pollen Robotics. El modelo no es un modelo de lenguaje ni un transformer generativo: es una red neuronal exportada a ONNX que mapea una observación de 61 dimensiones a 14 acciones de control a 50 Hz, pensada para ejecutarse en bucle perpetuo sobre el robot. El autor, GinDuck, lo describe como un "remix": combina semillas de entrenamiento de políticas previas de otros autores (rumezhak y lphatnguyen) sobre una red base propia.

El modelo se distribuye a través de la librería `microduck` y se carga en una "slot" de política del daemon del robot mediante el comando `robotctl policy load`. El normalizador de observaciones está integrado dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo.

La relevancia es acotada: se trata de un artefacto experimental de robótica con licencia no declarada, sin descargas ni validación comunitaria en el momento de la consulta, y explícitamente marcado como "simulation only" (solo simulación). No debe confundirse con un modelo fundacional ni usarse fuera del ecosistema microduck.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para RL (detalles internos no disponibles); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia); observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información pública no detalla la topología interna de la red (número de capas, anchura, función de activación ni tipo de política, p. ej. MLP o red recurrente). Lo que sí se especifica es la interfaz: entrada de 61 dimensiones (observación en crudo, con normalizador embebido en el ONNX) y salida de 14 acciones, ejecutadas a 50 Hz como política perpetua, es decir, sin condición de terminación propia; el bucle corre hasta que se detiene externamente.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0`. El autor describe el proceso como un remix: las semillas 1 a 4 reproducen la política `sock-heist-composite-v9` de rumezhak, la semilla 5 reproduce `sock-heist-6m-v5` de lphatnguyen, y la red subyacente es la política `sock-heist continue-2` de GinDuck. No se indican número de pasos de entorno, recompensas, composición del dataset de entrenamiento ni si hubo ajuste fino posterior. No se han publicado detalles sobre técnicas como domain randomization, currículo o regularización.

## Capacidades

- Control locomotor del robot microduck mediante política de RL perpetua (gait o marcha), ejecutada a 50 Hz.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones de control.
- Normalización de observaciones integrada en el propio grafo ONNX, lo que simplifica la integración en el daemon.
- Carga dinámica en slots de política del robot mediante `robotctl policy load`.
- Inferencia en formato ONNX, portable a runtimes compatibles con ONNX.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo: no es un modelo de lenguaje.

## Casos de uso

- Experimentación en simulación con microduck: el modelo está marcado como "simulation only", por lo que su uso principal es evaluar la marcha en el simulador del ecosistema `microduck_rl` antes de transferir a hardware.
- Base para remixes de políticas: dado que el autor lo construye combinando semillas de otras políticas, sirve como punto de partida para entrenamientos derivados sobre la misma red base.
- Pruebas de integración del pipeline de políticas: útil para validar el flujo `robotctl policy load` y el formato de manifiesto schema 2 en un entorno de desarrollo.
- Benchmarking interno de gaits: comparar el comportamiento de esta política frente a las políticas originales (`sock-heist-composite-v9`, `sock-heist-6m-v5`) en las mismas condiciones de simulación.
- Docencia y divulgación sobre RL aplicado a robótica: ejemplo reproducible de cómo se compone una política a partir de semillas y redes existentes.
- Validación de despliegue ONNX en robótica: probar latencia y compatibilidad de un `policy.onnx` con el daemon microduck en un robot o en un entorno emulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB según Hugging Face, lo que sugiere un artefacto muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponibles; al ser una política de control a 50 Hz, es probable que la inferencia en CPU sea suficiente, pero no se aporta dato alguno.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: runtime ONNX dentro del daemon microduck mediante `robotctl policy load`; otros runtimes ONNX no están documentados.
- Latencia y throughput: el bucle de control opera a 50 Hz (periodo de 20 ms por paso), pero no se especifica el tiempo de inferencia real de la red.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `GinDuck/microduck-gin-remix-sock-2` | Política RL (ONNX) | 61-D / 14 acciones | 50 Hz | no disponible | Hugging Face, 0 descargas |
| `rumezhak/sock-heist-composite-v9` (referenciada) | Política RL | no disponible | no disponible | no disponible | referenciada en la model card |
| `lphatnguyen/sock-heist-6m-v5` (referenciada) | Política RL | no disponible | no disponible | no disponible | referenciada en la model card |
| `GinDuck/sock-heist continue-2` (red base) | Política RL | no disponible | no disponible | no disponible | referenciada en la model card |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Marcado explícitamente como "simulation only": no hay evidencia publicada de transferencia a hardware real ni de robustez ante condiciones del mundo físico.
- Licencia no disponible: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Cero descargas y cero likes en el momento de la consulta: ausencia de validación comunitaria.
- Es un remix de políticas de terceros; las condiciones de uso de las políticas originales pueden aplicar en cascada y no se detallan.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución; en robótica, esto se traduce en riesgo de fallos de locomoción no caracterizados.
- No se documentan los parámetros de la red, el coste computacional ni los requisitos de memoria, lo que dificulta planificar el despliegue.
- No es un modelo de lenguaje: no soporta texto, código, visión ni herramientas; cualquier uso en esos ámbitos es inadecuado.
- La fecha de creación y actualización indicada (2026-11-15) es futura respecto a la información habitual de Hugging Face; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-gin-remix-sock-2
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0` (sin URL directa en la información proporcionada)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa en la información proporcionada)
