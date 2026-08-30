# HyeonseokE/smolvla_phase1_sort_by_color_A1_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por el equipo de Hugging Face LeRobot, diseñado para control robótico por aprendizaje por imitación. Esta ficha corresponde a un fine-tuning específico del modelo base `lerobot/smolvla_base` realizado por HyeonseokE para la tarea de clasificar bloques por color en platos de colores correspondientes, usando un robot tipo SO-101. El modelo consume imágenes de tres cámaras y el estado del robot, y produce acciones de control de 6 grados de libertad.

Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, este modelo está pensado para ejecutarse en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que necesitan desplegar políticas robóticas sin infraestructura de alto coste. El entrenamiento se realizó sobre un dataset de 100 episodios con 74 322 frames a 10 FPS, generado en simulación Isaac Sim mediante la herramienta SCRAPE-IsaacLab. La licencia Apache 2.0 permite uso comercial sin restricciones, y el modelo se distribuye en formato safetensors a través del ecosistema LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parametros totales | 450 046 176 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de control robótico, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción basado en un transformer multimodal que procesa simultáneamente imágenes de cámaras y datos de estado del robot para generar acciones de control. La arquitectura combina un codificador visual con un modelo de lenguaje ligero, optimizado para inferencia eficiente en GPU de consumo. Este fine-tuning se realizó sobre el checkpoint base `lerobot/smolvla_base` usando el framework LeRobot en su versión 0.6.0.

El entrenamiento se llevó a cabo con el dataset `HyeonseokE/phase1_sort_by_color_A1_10fps`, que contiene 100 episodios de un robot SO-101 clasificando bloques de colores en platos. Se usaron 58 050 pasos de entrenamiento con un batch size de 64, optimizador AdamW y una tasa de aprendizaje de 0,0001. El dataset fue generado en simulación con Isaac Sim, lo que implica que el modelo ha aprendido la tarea en un entorno simulado y puede requerir ajuste adicional para transferencia al mundo real. No se ha reportado el uso de técnicas de RLHF o DPO; el entrenamiento es de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico por imitación: genera acciones de 6 grados de libertad (posición y orientación del efector) a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa tres cámaras simultáneamente (imágenes de 256×256 píxeles) junto con el estado del robot (6 valores).
- Tarea específica de clasificación: clasifica bloques de colores en platos del color correspondiente, según la tarea definida en el dataset.
- Ejecución en tiempo real: al ser un modelo compacto de 450 M de parámetros, puede ejecutarse a velocidades adecuadas para control en bucle cerrado en hardware moderado.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- No incluye capacidades de tool calling, agentes, razonamiento multilingüe ni generación de texto; es exclusivamente un modelo de control.

## Casos de uso

- Clasificación automatizada en líneas de producción: el modelo puede controlar un brazo robótico para separar piezas por color en cintas transportadoras, gracias a su capacidad de percibir tres cámaras y generar acciones precisas de 6 DOF.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entrenadas en simulación a entornos reales, ya que el dataset proviene de Isaac Sim.
- Prototipado rápido de tareas robóticas: permite a desarrolladores sin experiencia previa en robótica desplegar una política funcional con el comando `lerobot-rollout`, reduciendo el tiempo de desarrollo.
- Benchmarking de modelos VLA compactos: al ser un fine-tuning de SmolVLA, puede usarse para comparar el rendimiento de arquitecturas ligeras frente a modelos más grandes en tareas de manipulación.
- Educación y formación en robótica: adecuado para cursos y laboratorios que necesiten un ejemplo reproducible de entrenamiento y despliegue de un VLA con LeRobot.
- Automatización de tareas de picking y placing en almacenes: la tarea de clasificar bloques por color es una abstracción de tareas logísticas más complejas; el modelo puede adaptarse con fine-tuning adicional a variantes de la misma familia de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: con 450 M de parámetros en precisión FP32, el modelo ocupa aproximadamente 1,8 GB en memoria; en FP16 ocuparía unos 0,9 GB. La VRAM real dependerá de la resolución de imagen y del batch de inferencia, pero debería caber en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM, por ejemplo RTX 3050, RTX 3060, RTX 4060, o GPUs de datacenter como T4 o A10.
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos de SmolVLA. Una RTX 4090 o similar puede ejecutar la política con margen suficiente para control en tiempo real.
- Opciones de despliegue: el modelo se integra con LeRobot, que ofrece los comandos `lerobot-rollout` para inferencia en robots reales y `lerobot-train` para fine-tuning. No se mencionan otros runners como vLLM u Ollama, ya que no es un modelo de lenguaje generativo sino de control.
- Latencia y throughput: no disponibles en la documentación. Al ser un modelo compacto, se espera una latencia de decenas de milisegundos por paso en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

El modelo se puede comparar con otros fine-tunings de SmolVLA del mismo autor, que aparecen en la búsqueda web:

| Modelo | Parámetros | Tarea | Seed | Dataset |
|---|---|---|---|---|
| smolvla_phase1_sort_by_color_A1_2000_10fps (este) | 450 M | Clasificar bloques por color | 2000 | phase1_sort_by_color_A1_10fps |
| smolvla_phase1_sort_by_color_A1_1000_10fps | 450 M | Clasificar bloques por color | 1000 | phase1_sort_by_color_A1_10fps |
| smolvla_phase1_sort_by_color_A2_1000_10fps | 450 M | Clasificar bloques por color | 1000 | phase1_sort_by_color_A2_10fps |

No se dispone de datos de rendimiento comparativo entre estas variantes. Frente al modelo base `lerobot/smolvla_base`, este fine-tuning está especializado en una tarea concreta, por lo que pierde generalidad pero gana precisión en la tarea de clasificación. No se han encontrado modelos comparables de otros autores con la misma tarea y arquitectura en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de clasificar bloques por color en platos; no generaliza a otras tareas sin fine-tuning adicional.
- Los datos de entrenamiento provienen de simulación (Isaac Sim), por lo que puede existir una brecha de simulación a realidad; es necesario validar el comportamiento en el robot físico antes de uso en producción.
- No se han reportado evaluaciones en robot real ni tasas de éxito, por lo que su fiabilidad no está demostrada.
- El modelo depende de una configuración específica de cámaras (tres cámaras con nombres concretos) y del tipo de robot SO-101; cambios en la disposición de sensores o en el robot invalidan la política.
- Riesgo de alucinación de acciones: si el entorno difiere del visto en entrenamiento (iluminación, posiciones de objetos, distracciones), el modelo puede generar acciones erróneas sin mecanismo de detección de fallos.
- No hay soporte para razonamiento de alto nivel ni planificación; es un controlador reactivo que mapea observaciones a acciones directamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_phase1_sort_by_color_A1_2000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_sort_by_color_A1_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Ejemplo de uso de SmolVLA en LeRobot: https://github.com/huggingface/lerobot/blob/main/examples/tutorial/smolvla/using_smolvla_example.py
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/phase1_sort_by_color_A1_10fps
