# drwahl/smolvla_so101_block_stack_sim

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) orientado a robótica de manipulación, y esta ficha describe un ajuste fino concreto publicado por el usuario drwahl: `smolvla_so101_block_stack_sim`. Se trata de un adaptador LoRA entrenado sobre `lerobot/smolvla_base` para una tarea única y muy delimitada: apilar un bloque de 30 mm sobre otro con el brazo robótico SO-101 en un entorno de simulación. No es un modelo generalista, sino un artefacto de investigación reproducible que ilustra cómo adaptar un VLA de base con recursos modestos.

El modelo parte de la arquitectura SmolVLA, que combina un backbone visual-lenguaje SmolVLM2 con un experto de acción (action expert) y cabezas de proyección, siguiendo el paradigma de los modelos de acción continua por difusión o flujo sobre secuencias de acciones (chunks). El ajuste congela el encoder SigLIP y aplica LoRA (r=32, alpha 64) únicamente sobre el backbone de lenguaje, dejando dense el experto de acción y las proyecciones. El entrenamiento consistió en 20.000 pasos con batch de 4 sobre el dataset `drwahl/so101_block_stack_sim`, replicando el protocolo de un modelo previo del mismo autor (pi05 sobre la misma tarea).

La relevancia de esta publicación es metodológica más que de rendimiento: demuestra un flujo completo (dataset, configuración de entrenamiento, script de evaluación) y documenta con honestidad unos resultados muy limitados. El modelo apila correctamente 0,3 de 150 layouts retenidos y logra levantar un bloque en 11,3 ocasiones de media sobre tres semillas, lo que lo convierte en un ejemplo útil de las dificultades del ajuste fino en robótica de precisión y de la brecha entre imitar demostraciones y recuperarse de errores propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (backbone SmolVLM2 + action expert + cabezas de proyección), ajuste LoRA sobre el backbone de lenguaje |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors y adaptador LoRA) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en `adapter/`, junto con los procesadores) |

## Arquitectura y entrenamiento

El modelo base `lerobot/smolvla_base` es un VLA que procesa observaciones multimodales (imágenes de cámara y estado del robot) y emite chunks de acciones continuas de 50 pasos. Este ajuste congela el encoder visual SigLIP y aplica LoRA con r=32 y alpha 64 sobre el backbone de lenguaje SmolVLM2, manteniendo dense el experto de acción y las cabezas de proyección. La normalización, la tasa de aprendizaje y la longitud de chunk son las del checkpoint base, sin modificaciones.

El entrenamiento se realizó durante 20.000 pasos con batch de 4 siguiendo la configuración `train/smolvla_so101.yaml` del repositorio `vla-test`, sobre el dataset `drwahl/so101_block_stack_sim`, con el mismo protocolo empleado para `drwahl/pi05_so101_block_stack_sim`. El adaptador incluye los procesadores que aplican la normalización y el renombrado de cámaras, de modo que LeRobot lo carga directamente sobre los pesos base. No se documentan en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (en robótica de imitación, el entrenamiento es típicamente por comportamiento clonado).

## Capacidades

- Generación de acciones robóticas continuas para manipulación con el brazo SO-101, en chunks de 50 pasos.
- Percepción visual mediante el backbone SmolVLM2 con encoder SigLIP congelado.
- Ejecución de una tarea específica: apilar un bloque de 30 mm sobre otro en simulación.
- Integración nativa con el ecosistema LeRobot para carga del adaptador, procesadores y evaluación.
- Ejecución de rollouts con opciones de evaluación (`--no-rtc`, `--no-smooth`) para análisis controlado.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo general ni modos de razonamiento extendido.

## Casos de uso

- Reproducción de experimentos de investigación: sirve como punto de partida para replicar el pipeline completo (dataset, entrenamiento LoRA, evaluación) y comparar variantes de ajuste fino en tareas de apilado.
- Estudio de la brecha imitación-recuperación: el modelo imita las acciones de las demostraciones en sus propias frames pero no se recupera de sus errores; es un caso concreto para analizar por qué los VLA fallan en corrección de trayectorias.
- Comparativa de técnicas de adaptación: al compartir protocolo con `pi05_so101_block_stack_sim`, permite contrastar LoRA sobre SmolVLA frente a otros enfoques sobre el mismo dataset y tarea.
- Docencia y divulgación en robótica: ejemplo accesible (repo de 0,2 GB, licencia Apache 2.0) para enseñar el ciclo completo de un VLA en simulación.
- Base para ajustes posteriores: el adaptador puede servir como inicialización para tareas relacionadas con el SO-101, aunque su bajo rendimiento exige validación previa.
- Pruebas de infraestructura de evaluación: útil para validar los scripts de `sim/scripts/eval.py`, las métricas por gates y la gestión de semillas antes de escalar a modelos mayores.
- Referencia negativa documentada: útil para calibrar expectativas sobre cuánto puede lograr un LoRA de rango 32 con 20.000 pasos en una tarea de precisión milimétrica.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, evaluados sobre 150 layouts retenidos y promediados sobre tres semillas, ejecutando el chunk completo de 50 pasos:

| Métrica | Resultado |
|---|---|
| Tasa de apilado correcto | 0,3 de 150 layouts |
| Número de levantamientos de bloque | 11,3 de media |
| Recuperación de errores propios | No se recupera una vez que controla el brazo |
| Imitación en las frames de las demostraciones | Comparable a las otras políticas evaluadas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 0,2 GB, por lo que los pesos del adaptador y los procesadores caben holgadamente en cualquier GPU consumer.
- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador sobre SmolVLA base, la carga completa del modelo base requiere más memoria que el adaptador, pero no se documenta la cifra exacta.
- GPU recomendadas: no disponible. Por el tamaño del adaptador, una GPU consumer moderna (por ejemplo, RTX 4090) es plausible, pero no está confirmado en la información.
- Despliegue: el flujo documentado usa LeRobot con `uv` para descargar (`hf download`) y evaluar (`uv run python sim/scripts/eval.py`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un VLA de acciones continuas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Método de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drwahl/smolvla_so101_block_stack_sim | lerobot/smolvla_base | Apilado de bloques SO-101 en simulación | LoRA r=32 sobre backbone de lenguaje | apache-2.0 | Hugging Face |
| drwahl/pi05_so101_block_stack_sim | Pi-0.5 | Apilado de bloques SO-101 en simulación, mismo protocolo | Ajuste completo (según model card) | no disponible | Hugging Face |
| lerobot/smolvla_base | SmolVLM2 + action expert | VLA generalista de manipulación | Preentrenamiento | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a base, tarea y método de ajuste.

## Limitaciones y advertencias

- Rendimiento muy bajo en la tarea objetivo: 0,3 apilados de 150 layouts y 11,3 levantamientos de media sobre tres semillas.
- Incapacidad documentada de recuperarse de sus propios errores una vez que controla el brazo, lo que limita su uso en entornos no estructurados.
- Entrenado exclusivamente en simulación: no hay evidencia de transferencia a robot físico (sim-to-real).
- Especializado en una única tarea y un único brazo (SO-101); no es un modelo generalista ni apto para otras manipulaciones sin reajuste.
- Sesgos conocidos: no documentados, pero al derivar de un backbone VLM hereda los sesgos del modelo base.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí en forma de acciones incorrectas o trayectorias inválidas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del dataset subyacente.
- Artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni validación externa.
- Advertencia de producción: no recomendado para despliegue real sin una reevaluación exhaustiva y, probablemente, reentrenamiento con más datos y mayor rango de adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drwahl/smolvla_so101_block_stack_sim
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/drwahl/so101_block_stack_sim
- Modelo comparativo del mismo autor: https://huggingface.co/drwahl/pi05_so101_block_stack_sim
- Repositorio de entrenamiento y evaluación: https://github.com/danwahl/vla-test
- Brazo SO-101 / SO-ARM100: https://github.com/TheRobotStudio/SO-ARM100
