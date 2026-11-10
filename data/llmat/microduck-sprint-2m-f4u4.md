# llmat/microduck-sprint-2m-f4u4

## Resumen

microduck-sprint-2m-f4u4 es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo resuelve una tarea concreta de locomoción: ejecutar un sprint de 2 metros manteniendo un seguimiento de velocidad objetivo de 0,85 m/s, con recompensas parciales orientadas a la velocidad (peso 4), la verticalidad del cuerpo (peso 4) y la calidad del paso (peso 3). Se publica como un artefacto de inferencia en formato ONNX, con la normalización de observaciones integrada en el propio grafo, de modo que el robot puede alimentarlo con observaciones en bruto.

El modelo tiene un alcance muy acotado: no es un modelo de lenguaje ni un sistema multimodal, sino una política perpetua de 61 dimensiones de observación y 14 acciones que se ejecuta a 50 Hz hasta que se le indica lo contrario. Se carga en una ranura de política del daemon del robot mediante `robotctl`. Su relevancia es la de un ejemplo reproducible de entrenamiento RL con mjlab (entorno de simulación basado en MuJoCo) sobre hardware de bajo coste, con instrucciones exactas de reproducción (commit, semilla, comando) para la comunidad de robótica.

La información pública disponible es mínima: el repositorio ocupa 0,0 GB, no declara licencia ni idiomas, y no incluye resultados de benchmarks más allá del score local reportado por el autor. Esta ficha refleja fielmente esa escasez de datos, marcando como "no disponible" todo aquello que no aparece en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para robótica entrenada con RL (no se especifica la topología de red; empaquetada como grafo ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia); ventana de observación de 61 dimensiones |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La política se entrenó con el framework mjlab (versión 0.1.0, commit `1efd853be`), un entorno de RL basado en MuJoCo, sobre la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `microduck-challenges`. El entrenamiento empleó 4096 entornos paralelos, un máximo de 1000 iteraciones y la semilla 1, con registro en TensorBoard bajo el nombre de ejecución `f4u4`. El checkpoint publicado corresponde a la iteración 750. La función de recompensa combina tres términos con pesos explícitos: seguimiento de velocidad (4), mantenimiento de la verticalidad (4) y calidad del paso (3).

La red resultante consume 61 observaciones y produce 14 acciones a 50 Hz. El autor indica que el normalizador de observaciones está embebido en `policy.onnx`, por lo que la entrada debe ser la observación en bruto del robot. La política es "perpetua": no tiene condición de terminación interna y se ejecuta de forma continua hasta que el daemon la sustituye o la detiene. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas, de modo que repetir el comando con la misma semilla produce una política comparable pero no idéntica. No se detalla en la información disponible la topología de la red (número de capas, unidades por capa, activaciones) ni el número total de tokens o muestras de entrenamiento más allá de las iteraciones indicadas.

## Capacidades

- Locomoción cuadrúpeda: ejecuta un sprint de 2 metros sobre el robot microduck con seguimiento de velocidad objetivo de 0,85 m/s.
- Control continuo a 50 Hz con 61 entradas de observación y 14 salidas de acción.
- Política perpetua: mantiene la marcha indefinidamente hasta recibir una orden de parada o sustitución.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración en el daemon.
- Carga en el robot mediante el comando `robotctl policy load <slot> llmat/microduck-sprint-2m-f4u4`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es exclusivamente una política de control motor.

## Casos de uso

- Demostración de locomoción en microduck: cargar la política en una ranura del daemon y ejecutar el sprint de 2 metros como ejemplo de referencia para validar el hardware y el pipeline de control.
- Benchmark de velocidad en competiciones internas: el autor reporta 5 de 5 éxitos a 0,85 m/s y un score local de 2,792 s, lo que permite usarla como línea base en retos de la comunidad microduck-challenges.
- Reproducción de experimentos de RL: sirve como punto de partida verificable (commit, semilla y comando documentados) para estudiar el efecto de cambios en la recompensa o en el número de entornos.
- Evaluación de robustez del controlador: al ser una política perpetua, permite pruebas prolongadas de estabilidad de la marcha en simulación y en robot real.
- Integración en pipelines de investigación en robótica de bajo coste: su formato ONNX facilita el despliegue en el daemon sin dependencias de frameworks de deep learning pesados.
- Docencia y formación: ejemplo compacto de entrenamiento RL con mjlab y MuJoCo, con instrucciones de reproducción completas para alumnos y desarrolladores.

## Benchmarks y rendimiento

| Métrica | Resultado reportado por el autor |
|---|---|
| Score local (sprint 2 m) | 2,792 s |
| Tasa de éxito a 0,85 m/s | 5/5 |
| Checkpoint evaluado | 750 |
| Entornos de entrenamiento | 4096 |
| Iteraciones máximas | 1000 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K ni equivalentes en robótica) en la información disponible. Los datos de la tabla anterior provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política de control de pequeña dimensión empaquetada en ONNX, la huella de memoria es previsiblemente mínima, pero no se documenta.
- GPU recomendadas: no disponible; el entrenamiento se realizó con 4096 entornos paralelos, lo que sugiere el uso de GPU de datacenter, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime a través del daemon microduck (`robotctl`); no se documentan otras opciones como vLLM, llama.cpp o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política se ejecuta a 50 Hz según la model card; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-2m-f4u4 | Política RL para microduck (sprint 2 m) | no disponible | no aplica (61-D obs) | no disponible | Hugging Face |
| Otras políticas de microduck-challenges | Políticas RL para microduck | no disponible | no aplica | no disponible | Repositorio microduck-challenges |
| Políticas RL para cuadrúpedos tipo ANYmal o Unitree | Políticas RL para otros robots | no disponible | no aplica | variable | Repositorios de investigación |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas concretas. La comparación solo es posible a nivel cualitativo: esta política está especializada en el robot microduck y en la tarea de sprint de 2 metros, por lo que no es intercambiable con políticas de otros cuadrúpedos sin reentrenamiento.

## Limitaciones y advertencias

- Especialización extrema: la política solo ejecuta el sprint de 2 metros en microduck; no generaliza a otras tareas, velocidades u objetivos sin reentrenamiento.
- Sin licencia declarada: no se especifican términos de uso comercial, lo que impide asumir permisos de redistribución o explotación.
- Sin idiomas ni capacidades de lenguaje: no es aplicable a tareas de texto, código o razonamiento.
- Reproducibilidad limitada: el autor advierte que el entrenamiento RL no es bit-reproducible entre máquinas; la misma semilla produce pesos distintos.
- Datos de rendimiento no verificados: el score local de 2,792 s y el 5/5 a 0,85 m/s son cifras del autor sin validación independiente.
- Sin benchmarks comparativos ni documentación de sesgos: no hay información sobre robustez ante perturbaciones, terrenos variables o fallos del hardware.
- Dependencia del ecosistema microduck: requiere el daemon y el comando `robotctl` para su despliegue, lo que limita su uso fuera de esa plataforma.
- Riesgo de alucinación no aplica; el riesgo relevante es el fallo de control (caída, inestabilidad) en condiciones no cubiertas por el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmat/microduck-sprint-2m-f4u4
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio microduck-challenges: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card)
- Commit de entrenamiento: `3e3862f1d` en microduck-challenges
- Base de entrenamiento: mjlab-microduck 0.1.0, commit `1efd853be`
