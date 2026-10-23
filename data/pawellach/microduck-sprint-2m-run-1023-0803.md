# PawelLach/microduck-sprint-2m-run-1023-0803

## Resumen

`sprint-2m-run-1023-0803` es una política de control motriz para el robot microduck de Pollen Robotics, entrenada mediante aprendizaje por refuerzo y exportada a ONNX para su ejecución embarcada. No es un modelo de lenguaje: recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, en bucle cerrado y de forma perpetua hasta que el operador la detenga. El autor la describe como "first try" y la publica como un gait ("marcha") cargable en una ranura de política del daemon `robotctl`.

La relevancia es acotada pero concreta: es un artefacto reproducible del ecosistema `microduck-challenges`, con semilla, commit, checkpoint y comando de entrenamiento documentados (commit `5cab770ed`, checkpoint 750, semilla 21, 2000 entornos en paralelo, 1000 iteraciones). Eso la convierte en un buen punto de partida para comparar políticas de locomoción dentro del mismo pipeline, no en un modelo con resultados de referencia publicados.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño declarado es de 0.0 GB (redondeado) y no se especifica licencia ni idiomas, lo que condiciona su uso en producción. La arquitectura de la red no está documentada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada por aprendizaje por refuerzo (RL) y exportada a ONNX; topología de red no documentada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso, sin memoria de contexto declarada |
| Tipos de cuantizacion | no disponible (solo se distribuye la exportación ONNX; el autor no documenta cuantizaciones) |
| Idiomas soportados | no aplica (modelo de control motor, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` conforme al schema 2 del manifiesto de políticas de microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz (periodo de 20 ms) |
| Modo de ejecucion | Política perpetua, sin condición de parada interna |
| Tamano del repositorio | 0.0 GB (redondeado) |
| Tarea de entrenamiento | `Mjlab-Sprint2m-MicroDuck` |
| Checkpoint publicado | 750 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, activaciones ni si se trata de un MLP u otra estructura). Lo que sí se documenta es el pipeline: la política se entrena con `mjlab-microduck 0.1.0` (commit base `8d0dbc94c`) sobre la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `microduck-challenges`, con 2000 entornos simulados en paralelo, un máximo de 1000 iteraciones y semilla 21, registrando en TensorBoard bajo el nombre de ejecución `run-1023-0803`.

Un detalle de implementación relevante para el despliegue: el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el robot debe alimentar observaciones en crudo, sin preprocesado adicional. El autor advierte de que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock` y semilla produce una política comparable, no los mismos pesos. El checkpoint publicado corresponde al paso 750 de un máximo de 1000 iteraciones, es decir, no es el resultado de agotar el presupuesto de entrenamiento declarado. No se especifica composición del dataset (al ser RL en simulación, la "data" es la distribución de estados generada por el propio entorno), ni uso de RLHF/DPO, ni innovaciones técnicas adicionales.

## Capacidades

- Generación de locomoción de tipo sprint para el robot microduck, con el objetivo declarado de recorrer 2 metros (tarea `Sprint2m`).
- Control reactivo en bucle cerrado a 50 Hz a partir de observaciones propietarias de 61 dimensiones.
- Ejecución perpetua: la política no termina por sí misma, corre hasta que se le indique lo contrario.
- Salida de 14 acciones de control motor por paso.
- Exportación portable a ONNX, ejecutable con ONNX Runtime en el stack del daemon `robotctl`.
- Carga como ranura de política ("policy slot") mediante el comando `robotctl policy load`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión ni audio.
- No hay capacidades multilingües: no procesa ni produce lenguaje.

## Casos de uso

- **Locomoción base en hardware microduck**: cargar la política en una ranura con `robotctl policy load <slot> PawelLach/microduck-sprint-2m-run-1023-0803` y evaluar la marcha en el robot real, alimentando observaciones en crudo gracias al normalizador embebido en el ONNX.
- **Línea base en experimentos de RL**: usar esta política como referencia inicial al comparar nuevas variantes de la tarea `Mjlab-Sprint2m-MicroDuck`, ya que se conocen semilla, commit y checkpoint exactos del entrenamiento.
- **Validación de simulación a realidad (sim2real)**: comparar el comportamiento del checkpoint 750 en simulador frente al robot físico para medir la brecha de transferencia, un paso habitual antes de invertir en entrenamientos más largos.
- **Pruebas de integración del daemon**: al ser una política perpetua y ligera en formato ONNX, sirve para validar el pipeline de carga de ranuras, el manifiesto schema 2 y el bucle de control a 50 Hz sin depender de modelos externos.
- **Generación de datos de locomoción**: ejecutar la política en simulación con los 2000 entornos paralelos del pipeline de entrenamiento para recolectar trayectorias de sprint y analizar estabilidad, consumo de par o distribución de estados visitados.
- **Docencia e investigación en RL aplicado a robótica**: reproducir el entrenamiento completo con `uv sync` y `uv run train` sobre el commit fijado para ilustrar el ciclo simulación-entrenamiento-exportación ONNX-despliegue con un caso real y acotado.
- **Despliegue en cómputo embarcado**: el tamaño del repositorio (0.0 GB redondeado) y el formato ONNX apuntan a inferencia en el propio robot, sin necesidad de GPU dedicada en el bucle de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de rendimiento (velocidad alcanzada, distancia recorrida, tasa de caídas, recompensa final, éxito en la tarea de 2 metros) ni comparaciones con otras políticas. Como contexto reproducible, estos son los parámetros del entrenamiento declarados:

| Parametro de entrenamiento | Valor |
|---|---|
| Tarea | `Mjlab-Sprint2m-MicroDuck` |
| Base | `mjlab-microduck 0.1.0` @ `8d0dbc94c` |
| Commit del repositorio | `5cab770ed` |
| Checkpoint | 750 (de un máximo de 1000 iteraciones) |
| Semilla | 21 |
| Entornos en paralelo | 2000 |
| Iteraciones máximas | 1000 |
| Logger | TensorBoard (`run-1023-0803`) |
| Inicio del entrenamiento | 2026-10-23T06:07:33Z |

## Requisitos de hardware

- **VRAM para inferencia**: no disponible con precisión; por el tamaño del repositorio (0.0 GB redondeado) y el formato ONNX, cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- **GPU recomendadas para entrenamiento**: no especificadas por el autor. El comando declara 2000 entornos paralelos; por el stack `mjlab` (simulación basada en MuJoCo) es razonable esperar una GPU de datacenter, pero no hay dato confirmado en la información disponible.
- **GPU para inferencia**: no requiere GPU dedicada; CUDA no es necesaria si se ejecuta con ONNX Runtime en CPU.
- **Cabe en GPU consumer**: sí, con alta probabilidad, dado el tamaño del artefacto; no se especifica el modelo concreto de GPU utilizada en el entrenamiento.
- **Opciones de despliegue**: ONNX Runtime dentro del daemon `robotctl` del microduck (vía `policy load`); entrenamiento y reproducción mediante `uv` con el repositorio `microduck-challenges`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: el bucle de control está fijado a 50 Hz, lo que impone un presupuesto de 20 ms por paso de inferencia incluyendo lectura de sensores y actuación; no se publican latencias medidas ni throughput de entrenamiento (iteraciones por segundo).

## Comparativa con modelos similares

No se dispone de datos de otras políticas comparables (ni métricas, ni parámetros, ni licencia) en la información proporcionada. La comparación se limita a características verificables del ecosistema:

| Modelo | Tipo | Observacion / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `PawelLach/microduck-sprint-2m-run-1023-0803` | Política RL para microduck, ONNX | 61 / 14 | 50 Hz | no disponible | HuggingFace, 0 descargas, 0 likes |
| Otras políticas de `microduck-challenges` | Política RL para microduck | no disponible | no disponible | no disponible | Repositorio público del proyecto, sin datos de rendimiento en esta consulta |
| Políticas de locomoción de otros robots cuadrúpedos (p. ej. ecosistemas Isaac Lab / MuJoCo) | Política RL | no disponible | no disponible | habitualmente no disponible o restrictiva | no verificadas en esta consulta |

No se han encontrado resultados de benchmarks que permitan afirmar que esta política sea mejor o peor que una alternativa concreta.

## Limitaciones y advertencias

- **Licencia ausente**: no se declara licencia. Sin licencia explícita, el uso comercial y la redistribución quedan en una zona legal indefinida; hay que contactar con el autor antes de integrarla en un producto.
- **Sin validación externa**: 0 descargas y 0 likes; no hay evidencia de terceros de que la política funcione en hardware real. El propio autor la etiqueta como "first try".
- **Checkpoint no final**: el artefacto corresponde al paso 750 de un máximo de 1000, por lo que probablemente no es la política más pulida que el pipeline podría producir.
- **Rendimiento no medido**: no se publica ninguna métrica de la tarea de sprint de 2 metros (éxito, velocidad, estabilidad), de modo que no se puede afirmar que cumpla el objetivo que da nombre al modelo.
- **Sin reproducibilidad bit a bit**: el autor advierte que reentrenar produce políticas comparables pero no idénticas; cualquier comparación fina entre ejecuciones debe tenerlo en cuenta.
- **Alcance muy restringido**: solo válida para el microduck con observación de 61 dimensiones y 14 acciones a 50 Hz; no es transferible a otro robot ni a otro conjunto de sensores sin reentrenar.
- **Riesgo de sim2real**: al entrenarse íntegramente en simulación, puede degradarse ante dinámicas no modeladas (rozamiento, holguras, latencia de actuadores, terreno real). No se documentan técnicas de aleatorización de dominio.
- **Normalizador embebido**: alimentar observaciones ya normalizadas produciría un comportamiento incorrecto; es un error fácil de cometer en integración.
- **Política perpetua**: no incluye condición de parada; en producción hay que garantizar un watchdog externo que detenga el robot ante fallos.
- **Ausencia de datos de entrenamiento**: no se indica número total de pasos, función de recompensa ni composición del currículo, lo que dificulta auditar el comportamiento.
- **Sin soporte de lenguaje**: no debe evaluarse con criterios de LLM (MMLU, HumanEval, GSM8K); no aplica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PawelLach/microduck-sprint-2m-run-1023-0803
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de tareas de entrenamiento: https://github.com/pollen-robotics/microduck-challenges (commit `5cab770ed`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card)
