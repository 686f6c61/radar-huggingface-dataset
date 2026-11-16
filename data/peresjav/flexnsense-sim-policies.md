# peresjav/flexnsense-sim-policies

## Resumen

Flex'N Sense es un conjunto de dos políticas de control robótico entrenadas mediante aprendizaje por refuerzo (PPO con `rsl_rl`) en simulación, concretamente en NVIDIA Isaac Sim 6.2 con Isaac Lab. Lo desarrolló el equipo Flex'N Sense durante el hackathon de robótica de Leukerbad (noviembre de 2026) sobre el brazo ElRobot de NormaCore. No es un modelo de lenguaje: son políticas de actuación que mapean observaciones numéricas del estado del brazo y del entorno a comandos de motor, distribuidas en formato ONNX y TorchScript.

La primera política, `pull_v1`, gestiona una tarea de cesión controlada de fuerza: el brazo sujeta una báscula de resorte y debe ceder cuando un dedo tira con más de 1,96 N (200 gf), volviendo a su posición cuando cesa la tracción. La segunda, `move_v1`, ejecuta una tarea de manipulación: coger la báscula por su anilla, levantarla sobre un dedo y colocarla en el siguiente. Ambas se entrenaron con 4.096 brazos simulados en paralelo en una NVIDIA RTX PRO 6000.

Su relevancia es acotada y explícita: el autor declara que se hicieron solo para un hackathon, que nunca se han ejecutado en un robot real y que no deben usarse para controlar un robot cerca de una persona. No son un dispositivo médico. Aun así, documentan con rigor un flujo completo de entrenamiento sim-a-real de políticas de rehabilitación, con métricas de simulación y artefactos reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con PPO (rsl_rl 5.5.1); red neuronal no especificada en detalle |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación a ONNX y TorchScript) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx` + `policy.onnx.data`), TorchScript (`policy.pt`), checkpoint de entrenamiento (`checkpoint.pt`) |
| Entrada `pull_v1` | 29 números (ángulos y velocidades articulares, distancias a objetivos, fuerza actual y del paso anterior, posición del gripper respecto al inicio, última acción) |
| Salida `pull_v1` | 5 números (cambios en objetivos de motores 1, 2, 3, 4, 6) |
| Entrada `move_v1` | 44 números (articulaciones, comando de gripper, posición y orientación del gripper, punto de agarre, anilla y dedo objetivo, flags de sujeción/colocación, última acción) |
| Salida `move_v1` | 6 números (los cinco motores anteriores más apertura/cierre) |
| Frecuencia de simulación | 120 pasos de física/s, 60 decisiones/s |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

Las políticas se entrenaron con PPO implementado en `rsl_rl` 5.5.1, sobre el brazo ElRobot de NormaCore simulado a partir de su URDF (commit `6b494f7`, Apache-2.0), en NVIDIA Isaac Sim 6.2 con Isaac Lab `main@727e4e43a`. El entrenamiento usó 4.096 brazos simulados en paralelo en una única NVIDIA RTX PRO 6000, sin datos de grabación de un brazo real. La simulación corre a 120 pasos de física por segundo y la política decide a 60 Hz.

La política `pull_v1` se entrenó durante 600 iteraciones (59 millones de pasos, 7,7 minutos), con rigidez del resorte, distancia, velocidad, tiempo de sujeción y dirección de la tracción del dedo variando por episodio. La política `move_v1` requirió seis ejecuciones y unos 470 millones de pasos (unos 80 minutos): las cinco primeras revelaron fallos en la recompensa o en las reglas de la tarea que se corrigieron antes de la ejecución final. En esta tarea el agarre sigue reglas explícitas, no física de contacto. No se documenta la topología exacta de la red neuronal ni el número de parámetros.

## Capacidades

- Control de fuerza reactivo: `pull_v1` modula la cesión del brazo ante tracciones variables, con la fuerza actual y la del paso anterior como entradas.
- Manipulación secuencial: `move_v1` ejecuta una secuencia completa de agarre, elevación, colocación y liberación de un objeto.
- Generalización a condiciones variables: la política de tracción se entrenó con rigidez, dirección y velocidad de tracción aleatorizadas por episodio.
- Exportación a inferencia: los pesos están disponibles en ONNX y TorchScript, listos para despliegue fuera de Isaac Lab.
- Continuación de entrenamiento: se incluye `checkpoint.pt` y el directorio `params/` con la configuración exacta.
- No soporta tool calling, agentes, multilingüismo ni visión: es una política numérica de control, no un modelo generativo.

## Casos de uso

- Investigación en control de fuerza para rehabilitación: `pull_v1` sirve como referencia reproducible de cómo entrenar una política que limite la fuerza ejercida ante una tracción externa, con umbral de 1,96 N y solo un 1,1 % de tracciones que superan el límite en más de un 10 %.
- Estudio de flujos sim-a-real: el repositorio incluye tareas de Isaac Lab, scripts y configuración, lo que permite replicar el pipeline completo de entrenamiento con PPO y `rsl_rl`.
- Benchmark de robustez ante perturbaciones: la variación de rigidez del resorte y de la tracción por episodio permite evaluar políticas de control ante incertidumbre paramétrica.
- Prototipado de manipulación pick-and-place: `move_v1` demuestra una secuencia de agarre y colocación con un 100 % de colocaciones dentro de 8 mm en simulación, útil como línea base para tareas similares.
- Docencia en aprendizaje por refuerzo robótico: los tiempos de entrenamiento (7,7 y 80 minutos) y los checkpoints permiten reproducir experimentos en una sola GPU de gama alta.
- Integración en pipelines de simulación: los formatos ONNX y TorchScript permiten cargar las políticas en otros simuladores o en entornos de prueba sin depender de Isaac Lab.

## Benchmarks y rendimiento

Resultados medidos en simulación con 1.024 brazos por política:

| Métrica `pull_v1` | Política entrenada | Brazo inmóvil (referencia) |
|---|---|---|
| Fuerza pico media | 1,60 N | 3,61 N |
| Fuerza pico en la peor tracción | 2,52 N | 7,32 N |
| Tracciones que superan en más del 10 % el límite de 1,96 N | 1,1 % | 85 % |

| Métrica `move_v1` | Valor |
|---|---|
| Anilla colocada a menos de 8 mm del dedo objetivo | 100 % |
| Anilla caída / impacto contra un dedo | 0 % / 0 % |
| Tiempo medio de colocación | 0,40 s (a velocidad máxima de motor, demasiado rápido para uso junto a una mano) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño de las políticas es muy reducido (repo de 0,0 GB), por lo que la inferencia cabe en cualquier GPU consumer.
- GPU de entrenamiento documentada: NVIDIA RTX PRO 6000, con 4.096 brazos simulados en paralelo.
- GPU recomendadas para entrenamiento: GPU profesional con capacidad para ejecutar Isaac Sim 6.2 e Isaac Lab; no se documentan alternativas.
- Cabe en GPU consumer para inferencia: sí, previsiblemente en cualquier GPU con soporte ONNX Runtime o PyTorch; no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime (`policy.onnx`), PyTorch/TorchScript (`policy.pt`); el entrenamiento requiere Isaac Lab y `rsl_rl`.
- Latencia y throughput: la política decide a 60 Hz en simulación; no se publican latencias de inferencia fuera de Isaac Lab.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye políticas comparables de otros autores ni datos que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenadas y evaluadas solo en simulación: nunca se han ejecutado en un robot real.
- Declaradas por el autor como demostración de hackathon; no son un dispositivo médico.
- Prohibido su uso para controlar un robot cerca de una persona, según el propio autor.
- La rigidez y amortiguación de los servos (40 N·m/rad, 2 N·m·s/rad), el resorte (5,886 N sobre 0,10 m) y la masa aparente de la caja de engranajes son suposiciones, no mediciones.
- La fuerza que lee `pull_v1` es la fuerza simulada real más ruido; en un robot real tendría que obtenerse de una lectura por cámara de la báscula.
- `move_v1` recibe la posición de la báscula y de los dedos como entrada directa; el agarre sigue reglas, no física de contacto.
- La velocidad de colocación (0,40 s a velocidad máxima de motor) es demasiado rápida para uso junto a una mano.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Riesgo de alucinación no aplica; el riesgo relevante es de comportamiento inseguro fuera de las condiciones simuladas.

## Enlaces

- Hugging Face: https://huggingface.co/peresjav/flexnsense-sim-policies
- Dataset complementario con episodios grabados: mencionado en la model card como repositorio companion, sin URL explícita en la información disponible.
- Isaac Lab: https://github.com/isaac-sim/IsaacLab
- NVIDIA Isaac Sim: https://developer.nvidia.com/isaac/sim
- `rsl_rl` (ETH Zurich): https://github.com/leggedrobotics/rsl_rl
- Modelo del brazo ElRobot de NormaCore (URDF, commit `6b494f7`, Apache-2.0): sin URL explícita en la información disponible.
