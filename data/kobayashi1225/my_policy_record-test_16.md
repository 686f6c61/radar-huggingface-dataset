# kobayashi1225/my_policy_record-test_16

## Resumen

`kobayashi1225/my_policy_record-test_16` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario kobayashi1225 en Hugging Face y se ha entrenado y subido con la librería LeRobot de Hugging Face, según la model card del autor.

El modelo resuelve una tarea concreta de manipulación robótica: recoger un cubo rojo ("Pick up red cube") con un robot de tipo `so_follower` y dos cámaras (`arm` y `side`). Consume el estado del robot (vector de 6 dimensiones) y dos imágenes RGB de 240x320 píxeles, y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros totales y un repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware de robótica de bajo coste.

Es relevante como ejemplo de política de imitación entrenada con muy pocos datos (10 episodios, 5964 fotogramas a 30 FPS) y como referencia práctica del flujo de trabajo de LeRobot para grabar datos de teleoperación, entrenar con ACT y desplegar la política en un robot real. No obstante, se trata de un artefacto experimental sin resultados de evaluación publicados ni descargas, por lo que su utilidad fuera del entorno para el que se entrenó es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica en texto: "Pick up red cube") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer de aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, predice un chunk de acciones futuras. Esto reduce el error de acumulación típico de las políticas paso a paso y suele traducirse en tasas de éxito más altas en tareas de manipulación. La política recibe como entrada `observation.state` (shape `(6,)`) y dos flujos visuales `observation.images.arm` y `observation.images.side`, ambos de shape `(3, 240, 320)`, y emite `action` con shape `(6,)`.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `kobayashi1225/record-test_16_20261106_175833`, compuesto por 10 episodios y 5964 fotogramas a 30 FPS de teleoperación sobre la tarea "Pick up red cube". La configuración documentada es de 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documentan detalles sobre composición del dataset, aumentos de datos ni fases de RLHF o DPO, que no aplican a este tipo de política.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower`.
- Percepción visual multimodal: procesa dos cámaras simultáneas (`arm` y `side`) a 240x320 píxeles.
- Aprendizaje por imitación a partir de teleoperación: reproduce la tarea "Pick up red cube" observada en el dataset de entrenamiento.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos individuales.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Recogida de objetos en un entorno controlado: la política ejecuta la tarea "Pick up red cube" sobre un robot `so_follower` con las mismas cámaras y montaje que en el entrenamiento; adecuada para validar el pipeline completo de LeRobot en laboratorio.
- Prototipado de flujos de imitación: sirve como plantilla para grabar un dataset propio, entrenar una política ACT y desplegarla con `lerobot-rollout`, ya que la model card documenta los comandos exactos.
- Docencia y formación en robótica: ejemplo reproducible de entrenamiento con 10 episodios y 10.000 pasos para ilustrar el ciclo teleoperación-entrenamiento-despliegue.
- Benchmark interno de infraestructura: permite medir latencia y estabilidad de inferencia de ACT sobre un robot de bajo coste antes de escalar a tareas más complejas.
- Reentrenamiento con datos propios: el checkpoint puede servir de inicialización o referencia para fine-tuning con `lerobot-train --policy.type=act` sobre un nuevo dataset.
- Investigación en aprendizaje por imitación: base para comparar variantes de ACT, tamaños de chunk o configuraciones de cámaras en tareas de pick-and-place.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos safetensors, el modelo es muy pequeño (del orden de cientos de MB en FP32) y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no documentadas por el autor; por tamaño, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente, aunque la latencia real depende de las cámaras y del robot.
- Cabe en GPU consumer: sí, por el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), tal y como documenta la model card; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kobayashi1225/my_policy_record-test_16 | ACT (LeRobot) | 51.668.614 | no aplica | apache-2.0 | Hugging Face |
| kobayashi1225/my_policy_record-test_12 | ACT (LeRobot) | no disponible | no aplica | no disponible | Hugging Face |
| kobayashi1225/my_policy_record_test_4_20260608_172856 | ACT (LeRobot) | no disponible | no aplica | no disponible | Hugging Face |

Las alternativas encontradas son otras políticas del mismo autor con la misma arquitectura y flujo de LeRobot; no se dispone de datos de parámetros, licencia ni rendimiento de ellas en la información proporcionada.

## Limitaciones y advertencias

- Entrenada con solo 10 episodios y 5964 fotogramas para una única tarea ("Pick up red cube"); la generalización a otras tareas, objetos o posiciones no está demostrada.
- Sin resultados de evaluación publicados: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia estricta del montaje: requiere un robot `so_follower` y cámaras con los nombres y resoluciones exactos (`arm` y `side`, 240x320) usados en el entrenamiento.
- Riesgo de sobreajuste al entorno de grabación (iluminación, posiciones de objetos, fondo); cambios en las condiciones pueden degradar el comportamiento.
- No es un modelo de lenguaje: no admite prompts arbitrarios, tool calling ni razonamiento textual; la tarea se fija en el entrenamiento.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar las dependencias de LeRobot y del dataset asociado.
- Cero descargas y cero likes en el momento de la consulta: artefacto experimental sin validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kobayashi1225/my_policy_record-test_16
- Dataset de entrenamiento: https://huggingface.co/datasets/kobayashi1225/record-test_16_20261106_175833
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kobayashi1225/record-test_16_20261106_175833
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Perfil del autor: https://huggingface.co/kobayashi1225
