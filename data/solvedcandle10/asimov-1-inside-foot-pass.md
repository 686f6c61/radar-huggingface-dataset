# solvedcandle10/asimov-1-inside-foot-pass

## Resumen

Asimov 1 inside-foot pass es una política de control robótico entrenada para ejecutar un pase con el interior del pie sobre un balón de talla 5. No es un modelo de lenguaje ni un modelo generativo de propósito general: es una policy de aprendizaje por refuerzo que mapea observaciones proprioceptivas y del balón a consignas de posición articular. Lo desarrolla el usuario solvedcandle10 y se distribuye con licencia BSD-3-Clause en formato ONNX y TorchScript.

El modelo se entrenó en Isaac Lab con PPO y AMP (Adversarial Motion Priors) a partir de una moción de referencia generada por cinemática inversa. Las entradas combinan la propriocepción de la política de marcha con la posición y velocidad del balón relativas a la pelvis, además de una dirección de pase. El entrenamiento incorpora ruido, retardo y dropout de tipo tracker para robustecer la política frente a imperfecciones de estimación en el robot real.

Es relevante porque aborda una habilidad de manipulación con los pies poco frecuente en robótica humanoide y porque el autor documenta explícitamente el contrato de despliegue: el runtime debe limitar cada consigna articular a un incremento máximo de (límite de velocidad del motor × 0,02 s) respecto a la posición anterior, partiendo de la pose medida. Esa restricción no está embebida en `policy.onnx` y debe implementarla el sistema anfitrión. El modelo es exclusivamente de simulación y no se ha probado en hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (actor-critic) entrenada con PPO + AMP; red neuronal exportada a ONNX y TorchScript |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y TorchScript; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (`policy.onnx`) y TorchScript (`policy.pt`) |

## Arquitectura y entrenamiento

La política sigue el esquema actor-critic habitual en PPO para control continuo: el actor produce acciones de posición articular y el crítico estima el valor del estado durante el entrenamiento. Sobre PPO se añade AMP, que utiliza una moción de referencia obtenida por cinemática inversa para guiar el estilo y la coordinación del movimiento, en lugar de depender únicamente de una función de recompensa manual. El entorno de simulación es Isaac Lab, y los ficheros `env.yaml` y `agent.yaml` documentan observaciones, acciones, comandos, recompensas y los hiperparámetros del actor-critic y de AMP, incluida la configuración de los datos de moción.

Las observaciones incluyen la propriocepción de la política de marcha junto con la posición y velocidad del balón relativas a la pelvis y una dirección de pase como comando. Durante el entrenamiento se aplican perturbaciones de tipo tracker (ruido, retardo y dropout) sobre esas entradas para que la política tolere estimaciones imperfectas en despliegue. El fichero `code_state.yaml` registra el commit, el modelo de robot, las versiones de paquetes, un hash del código de la red y los joints y ganancias a los que resuelven entradas y salidas, lo que permite reproducir el entorno de entrenamiento.

Un detalle crítico de arquitectura de despliegue: el límite de velocidad articular no forma parte de la red. El runtime debe aplicar un clamp por joint de magnitud (límite de velocidad del motor × 0,02 s) respecto a la consigna anterior, partiendo de la pose medida; la política se entrenó asumiendo ese filtrado externo.

## Capacidades

- Generación de consignas de posición articular para ejecutar un pase con el interior del pie sobre un balón de talla 5.
- Integración de propriocepción de la política de marcha con estimación relativa del balón (posición y velocidad respecto a la pelvis).
- Seguimiento de un comando de dirección de pase.
- Robustez ante ruido, retardo y dropout en las observaciones del balón, gracias al entrenamiento con perturbaciones de tipo tracker.
- Ejecución en tiempo real mediante inferencia ONNX o TorchScript, sin dependencia de un framework de RL en producción.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: es una política de control motor.

## Casos de uso

- Investigación en robótica humanoide con pies: reproducir el entrenamiento en Isaac Lab a partir de `env.yaml`, `agent.yaml` y `code_state.yaml` para estudiar cómo AMP moldea la coordinación del pase frente a recompensas manuales.
- Desarrollo de habilidades de fútbol robótico: usar la política como componente de pase dentro de una arquitectura de habilidades encadenadas (marcha, aproximación al balón, pase), donde la política de marcha aporta la propriocepción de entrada.
- Validación de pipelines de simulación a realidad: probar el contrato de despliegue (clamp de velocidad articular a 0,02 s) en un banco de pruebas antes de ejecutar sobre hardware, dado que el modelo solo se ha validado en simulación.
- Evaluación de robustez de estimadores de estado: al haberse entrenado con ruido, retardo y dropout en las observaciones del balón, la política sirve para medir cuánto degrada un estimador real el éxito del pase.
- Docencia y formación en RL para control: el repositorio de código y los YAML de configuración permiten trazar el experimento completo desde la moción de referencia IK hasta la exportación ONNX.
- Integración en runtimes de control de robots: cargar `policy.onnx` en un bucle de control a la frecuencia del simulador (paso de 0,02 s según el clamp documentado) y comparar latencia de inferencia ONNX frente a TorchScript.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se documenta el número de parámetros de la red, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible. Al ser una política de control de pequeño tamaño relativo, es plausible su ejecución en CPU, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (para `policy.onnx`) y PyTorch/TorchScript (para `policy.pt`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. El único dato temporal documentado es el paso de control de 0,02 s usado en el clamp de velocidad articular.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otras políticas de pase o de manipulación con los pies comparables en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo simulación: no se ha ejecutado en hardware físico, por lo que no hay evidencia de transferencia sim-to-real.
- El clamp de velocidad articular es obligatorio en el runtime y no está dentro de `policy.onnx`; omitirlo invalida las condiciones de entrenamiento y puede producir consignas inseguras.
- Dependencia de un estimador del balón: la política asume posición y velocidad del balón relativas a la pelvis con ruido, retardo y dropout de tipo tracker; un estimador real con sesgos distintos puede degradar el rendimiento.
- Dependencia de la política de marcha: las observaciones de entrada incluyen su propriocepción, de modo que cambios en esa política alteran la distribución de entradas.
- Especificidad de tarea y objeto: entrenada para un pase con el interior del pie sobre un balón de talla 5; no se documenta generalización a otros tamaños, superficies o direcciones fuera del rango de comando entrenado.
- Sin datos de sesgos, alucinación o rendimiento multilingüe: no aplican a un modelo de control motor.
- Licencia BSD-3-Clause: permite uso comercial y modificación con retención del aviso de copyright y la cláusula de exención de responsabilidad; no se documentan restricciones adicionales.
- Repositorio sin descargas ni likes y creado en 2026-11-05: no hay validación comunitaria ni informes independientes de resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/solvedcandle10/asimov-1-inside-foot-pass
- Repositorio de código de entrenamiento y evaluación: https://github.com/menloresearch/cyclotron
- Repositorio citado en la model card (detalles y `tasks/soccer/README.md`, rama `soccer/pass-hardware`): https://github.com/N-Raghav/cyclotron
