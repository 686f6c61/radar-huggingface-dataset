# atomicvox/microduck-sprint-2m-run-1117-1145

## Resumen

`microduck-sprint-2m-run-1117-1145` es una política de control para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo (reinforcement learning) exportada a ONNX que se ejecuta en el propio robot para producir una marcha (gait) de tipo sprint. El autor, atomicvox, la publica como un artefacto reproducible de un entrenamiento concreto, identificado por la ejecución `run-1117-1145`.

El modelo resuelve un problema muy acotado: generar comandos de actuación a 50 Hz a partir de una observación de 61 dimensiones, emitiendo 14 acciones. La política es "perpetua", es decir, se ejecuta de forma continua hasta que se le indique lo contrario, y se carga en una ranura de política del daemon del robot mediante el comando `robotctl policy load`. La card indica explícitamente "wrong direction", lo que sugiere que la marcha resultante no es la esperada o está mal orientada.

La relevancia es la de un ejemplo de flujo de trabajo de robótica con RL reproducible: entrenamiento con mjlab (entorno de simulación basado en MuJoCo), 4096 entornos paralelos, 2000 iteraciones máximas y exportación a ONNX con el normalizador de observaciones embebido. No hay información sobre parámetros, arquitectura de red ni contexto en el sentido de los LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; red neuronal no descrita en la card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX; no se documentan variantes) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La card no describe la topología de la red neuronal (número de capas, anchura, tipo de capa). Lo que sí documenta es el pipeline de entrenamiento: tarea `Mjlab-Sprint2m-MicroDuck`, repositorio `atomicvox/microduck-challenges` en la rama `main`, commit `09701a84e`, checkpoint `1000`, semilla `1`, y base `mjlab-microduck 0.1.0 @ 1efd853be`. El entrenamiento se lanzó el 2026-11-17T16:45:50Z y se ejecutó con 4096 entornos en paralelo, hasta 2000 iteraciones máximas del agente, con registro en TensorBoard bajo el nombre `run-1117-1145`.

La interfaz del modelo está bien definida: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz. El normalizador de observaciones está embebido dentro de `policy.onnx`, por lo que el consumidor debe alimentar observaciones en crudo. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con la misma semilla produce una política comparable, no idéntica. El `manifest.json` sigue el schema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.

## Capacidades

- Generación de una marcha (gait) de tipo sprint para el cuadrúpedo microduck.
- Política perpetua: se ejecuta de forma continua hasta que se detiene o se sustituye.
- Control a 50 Hz con observación de 61 dimensiones y 14 acciones.
- Normalización de observaciones integrada en el ONNX (entrada en crudo).
- Carga en una ranura de política del daemon mediante `robotctl policy load`.
- Exportación ONNX apta para inferencia en el propio robot.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción de cuadrúpedos: sirve como política de referencia para comparar marchas sprint entrenadas con mjlab bajo distintas semillas y configuraciones.
- Reproducción de experimentos de RL: el commit, el `uv.lock`, la semilla y el comando exacto permiten replicar el entrenamiento y obtener políticas comparables.
- Pruebas de integración del daemon microduck: útil para validar el flujo `robotctl policy load` y el esquema 2 del manifiesto de políticas.
- Benchmark de simulación a realidad: permite medir la brecha entre la política entrenada en 4096 entornos simulados y su comportamiento en el robot físico.
- Docencia y demostraciones de RL aplicado a robótica: ejemplo compacto de pipeline completo (entorno, entrenamiento, exportación ONNX, despliegue).
- Desarrollo de variantes: al estar el código en `microduck-challenges`, sirve de base para modificar la recompensa o la tarea `Mjlab-Sprint2m-MicroDuck` y entrenar políticas alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del modelo no se documenta y el repo ocupa 0.0 GB).
- GPU recomendadas: no disponible para inferencia; para reentrenar, la card indica 4096 entornos paralelos, lo que exige una GPU de datacenter (A100/H100 o similar), aunque no se especifica el modelo exacto.
- Cabe en GPU de consumo: no disponible; al ser una política de control exportada a ONNX, es plausible que quepa en hardware modesto, pero no hay datos que lo confirmen.
- Opciones de despliegue: ONNX Runtime en el robot a través del daemon microduck (`robotctl policy load`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-2m-run-1117-1145 | Política RL (ONNX) para microduck | no disponible | no aplica | no disponible | Hugging Face |
| Otras políticas microduck de atomicvox | Política RL (ONNX) para microduck | no disponible | no aplica | no disponible | no disponible en la información proporcionada |
| Políticas de locomoción de cuadrúpedos de otros autores | Política RL | no disponible | no aplica | no disponible | no disponible en la información proporcionada |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- La propia card etiqueta el resultado como "wrong direction": la marcha puede estar mal orientada y no ser apta para uso directo en el robot.
- No se especifica licencia; el uso comercial queda sin autorización explícita hasta que el autor la declare.
- No hay información sobre sesgos, alucinación ni limitaciones de idioma porque no es un modelo de lenguaje; esos criterios no aplican.
- El entrenamiento no es bit-reproducible: la misma semilla y el mismo comando producen políticas comparables, no idénticas.
- El checkpoint es 1000 y el máximo de iteraciones configurado es 2000; no se documenta si la política está infraentrenada.
- El repo ocupa 0.0 GB y no hay descargas ni likes: es un artefacto experimental sin validación comunitaria.
- Depende de la versión del daemon y del esquema 2 del manifiesto de políticas; cambios en el daemon pueden romper la carga.
- No hay datos de despliegue en robot físico ni de robustez ante perturbaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atomicvox/microduck-sprint-2m-run-1117-1145
- Repositorio microduck de Pollen Robotics: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `git@github.com:atomicvox/microduck-challenges.git` (rama `main`, commit `09701a84e`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
- Base de simulación: mjlab-microduck 0.1.0 @ `1efd853be` (no se proporciona URL directa)
