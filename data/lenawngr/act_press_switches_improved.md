# lenawngr/ACT_press_switches_improved

## Resumen

ACT_press_switches_improved es una política de imitación basada en Action Chunking with Transformers (ACT), una arquitectura presentada en el artículo arXiv:2304.13705 que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario lenawngr en Hugging Face y está entrenado con LeRobot, el framework de aprendizaje por imitación de Hugging Face, a partir del conjunto de datos lenawngr/press_switches_so101_improved. Su propósito es controlar un robot tipo SO-101 (según los comandos de evaluación de la model card) para ejecutar una tarea concreta de manipulación: accionar interruptores de presión.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje general, sino de un checkpoint de robótica de 51,7 millones de parámetros (0,2 GB), especializado en una única tarea y entrenado con datos de teleoperación. Resulta útil para desarrolladores que quieran reproducir el flujo de entrenamiento y evaluación de LeRobot con un caso real, o para quien necesite una política de referencia para la tarea de press switches sobre un SO-101.

No hay información sobre idiomas, benchmarks publicados ni datos de entrenamiento detallados más allá de la referencia al dataset. El modelo se publica con licencia Apache 2.0 y formato safetensors, integrado en el ecosistema lerobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), transformer con cabeza de predicción de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso de control, predice un chunk de varias acciones futuras. Esto reduce el error de acumulación típico de las políticas paso a paso y, según el artículo original, suele alcanzar tasas de éxito altas con datos de teleoperación. La arquitectura combina un codificador de observaciones (típicamente visión y estado del robot) con un transformer que genera el chunk de acciones; el checkpoint contiene 51.668.614 parámetros.

El entrenamiento se realizó con LeRobot sobre el dataset lenawngr/press_switches_so101_improved, que no está documentado en detalle en la información disponible (número de episodios, composición, número de tokens o pasos de entrenamiento: no disponible). No se indica si hubo RLHF, DPO ni ningún ajuste posterior; en ACT el paradigma es puramente supervisado por imitación. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico por imitación: genera chunks de acciones para un robot SO-101 a partir de observaciones, orientado a la tarea de accionar interruptores de presión (press switches).
- Aprendizaje a partir de teleoperación: la política se entrena con demostraciones humanas recogidas en el dataset asociado.
- Integración con LeRobot: entrenamiento mediante `lerobot-train` y evaluación/inferencia mediante `lerobot-record`.
- Ejecución de episodios de evaluación: la model card muestra el comando para grabar 10 episodios de evaluación con `--policy.path` apuntando al checkpoint.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es una política de robótica, no un modelo generativo de texto.

## Casos de uso

- Reproducción del pipeline de LeRobot: usar este checkpoint como referencia para entrenar y evaluar una política ACT desde cero con el comando `lerobot-train`, útil para validar la instalación y el flujo de trabajo antes de abordar tareas propias.
- Automatización de la tarea de accionar interruptores en un SO-101: la política genera chunks de acciones para completar la secuencia de pulsación sobre el hardware, reduciendo la necesidad de programación explícita de trayectorias.
- Base para fine-tuning en tareas de manipulación similares: al ser un checkpoint ACT ya entrenado, puede servir como punto de partida para adaptar la política a variantes de la tarea (distinta posición de interruptores, otros objetos) recogiendo nuevos datos de teleoperación.
- Evaluación comparativa de políticas: el comando `lerobot-record` con `--episodes=10` permite medir la tasa de éxito de esta política frente a otras variantes ACT entrenadas con el mismo dataset.
- Docencia y divulgación en robótica de imitación: un ejemplo pequeño (0,2 GB, 51,7 M de parámetros) y ejecutable en hardware asequible para demostrar el ciclo completo datos de teleoperación → entrenamiento → evaluación.
- Investigación en chunking de acciones: sirve para estudiar empíricamente el efecto del tamaño de chunk y de la arquitectura ACT en una tarea de contacto físico como la pulsación de interruptores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en precisión completa el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante), aunque el consumo real depende del codificador visual y del tamaño de lote.
- GPU recomendadas: no hay recomendaciones publicadas; el comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que implica una GPU NVIDIA con CUDA. Para entrenamiento se recomienda una GPU con al menos 8-12 GB de VRAM, aunque el dato exacto no está disponible.
- ¿Cabe en GPU consumer? Sí, por tamaño de parámetros; el cuello de botella probable es la carga del dataset y del codificador visual, no el peso del modelo.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) sobre Python; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ACT_press_switches_improved (este) | 51,7 M | no disponible | apache-2.0 | Hugging Face (lerobot) | Política ACT para SO-101, tarea press switches |
| ACT (implementación de referencia, arXiv:2304.13705) | no disponible | no disponible | según repositorio original | Código y paper públicos | Método base; el checkpoint concreto no comparable directamente |
| Políticas LeRobot del Hub (otros checkpoints ACT) | variable | no disponible | variable | Hugging Face | No se dispone de datos de rendimiento comparables en la información proporcionada |

No se dispone de resultados de benchmarks ni de comparaciones cuantitativas con alternativas en la información disponible.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (press switches) sobre un robot SO-101; no generaliza a otras tareas ni a otro hardware sin reentrenamiento o fine-tuning.
- Sin datos de rendimiento: no se publican tasas de éxito, número de episodios de entrenamiento ni curvas de aprendizaje, por lo que no es posible evaluar su calidad a priori.
- Riesgo de sobreajuste a las condiciones del dataset: variaciones de iluminación, posición de los interruptores o calibración del robot pueden degradar el comportamiento.
- Sin información sobre sesgos ni alucinación en el sentido de modelos de lenguaje; el riesgo equivalente es la ejecución de acciones erróneas o inseguras en el robot real.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar los términos del dataset asociado antes de reutilizarlo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni issues documentados.
- No hay información sobre idiomas ni sobre el contexto de observación, por lo que no se puede confirmar el alcance de las entradas que acepta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_press_switches_improved
- Dataset asociado: https://huggingface.co/datasets/lenawngr/press_switches_so101_improved
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
