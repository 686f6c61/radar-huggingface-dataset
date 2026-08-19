# Inevitablevalor/pi05_qwen_behavior_15tasks_aug_attnmap_abstract_train_bs256_4gpu_23dim_droid_attnmap_pretrained

## Resumen

Este modelo es un checkpoint de entrenamiento (pasos 90k–120k) de una política de comportamiento para manipulación robótica, desarrollada en el marco del proyecto `openpi-spatialvla`. Se trata de un modelo basado en la arquitectura Qwen, entrenado para generar acciones de control a partir de observaciones visuales (cámaras de cabeza y muñecas) y un mapa de atención (`attn_map_image`), junto con instrucciones en lenguaje natural. El entrenamiento se realizó sobre el conjunto de datos `behavior_15tasks_aug`, que contiene 5.532 episodios y 2.479.937 fotogramas, con un arranque en caliente desde un pretrain de DROID con mapas de atención.

El modelo está pensado para ser evaluado en tareas de manipulación robótica del benchmark Behavior, y su relevancia radica en que explora el uso de mapas de atención como entrada adicional para mejorar la precisión en tareas de interacción física. El checkpoint incluye los pesos en formato `safetensors` (9,79 GB), el estado del optimizador y las estadísticas de normalización, listos para su integración en el pipeline de evaluación del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen (backbone transformer) con política de comportamiento, entrada multimodal (visión + lenguaje + mapa de atención) |
| Parametros totales | No disponible (el archivo `model.safetensors` pesa 9,79 GB en bf16, lo que sugiere un modelo de aproximadamente 5.000 millones de parámetros, pero no se confirma) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos originales); no se proporcionan cuantizaciones adicionales |
| Idiomas soportados | No disponible (probablemente inglés, dado el dataset y las instrucciones) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (model.safetensors), además de `optimizer.pt` y `metadata.pt` |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada, pero por el nombre y el contexto se trata de un modelo de política (policy) que combina un backbone de tipo Qwen (probablemente Qwen-VL o similar) con un módulo de control robótico. El modelo procesa cuatro cámaras (`head`, `left_wrist`, `right_wrist`, `attn_map_image`) y genera acciones de control, probablemente posiciones de articulaciones o comandos de velocidad. El uso de `attn_map_image` sugiere que se incorpora un mapa de atención como entrada adicional, lo que puede ayudar a focalizar la atención en regiones relevantes de la escena.

El entrenamiento se realizó con un tamaño de lote efectivo de 256, distribuido en 4 GPU H100 80GB, durante 140.000 pasos. Se utilizó un arranque en caliente desde un pretrain de DROID con mapas de atención (paso 100.000), lo que redujo la pérdida inicial de 2,24 a 1,12 en condiciones idénticas. La curva de pérdida muestra una convergencia monótona, con una pérdida final de 0,048 (similar a la del entrenamiento desde cero, 0,045). No se menciona el uso de RLHF ni DPO; el entrenamiento parece ser supervisado directamente sobre las demostraciones.

## Capacidades

- Generación de acciones de control para robots manipuladores a partir de observaciones visuales y lenguaje.
- Procesamiento de múltiples cámaras (cabeza, muñecas) y un mapa de atención como entrada adicional.
- Ejecución de tareas de manipulación del benchmark Behavior (15 tareas), como recoger, colocar, apilar o insertar objetos.
- Integración con el framework `openpi-spatialvla` para evaluación y despliegue en entornos robóticos.
- Soporte de instrucciones en lenguaje natural (prompts abstractos) para especificar la tarea a realizar.
- Capacidad de operar con datos de demostración de alta frecuencia (2,4 millones de fotogramas).

## Casos de uso

- **Manipulación robótica en entornos domésticos**: el modelo puede controlar un brazo robótico para realizar tareas como recoger objetos, abrir cajones o colocar artículos en estantes, guiado por instrucciones en lenguaje natural.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida para estudiar el efecto del arranque en caliente y los mapas de atención en la eficiencia de muestreo y la generalización.
- **Evaluación de políticas en el benchmark Behavior**: los checkpoints están diseñados para ser evaluados en las 15 tareas del benchmark, permitiendo comparar el rendimiento con otras políticas.
- **Desarrollo de sistemas de control visual-lingüístico**: el modelo integra visión, lenguaje y atención, lo que lo hace útil para prototipar sistemas que requieren comprensión semántica de la escena.
- **Transferencia de aprendizaje desde DROID**: al estar preentrenado con datos de DROID, puede servir para estudiar la transferencia de representaciones entre conjuntos de datos robóticos.
- **Optimización de pipelines de entrenamiento**: el checkpoint incluye el estado del optimizador y las estadísticas de normalización, lo que permite reanudar el entrenamiento o ajustar el modelo con datos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la curva de pérdida durante el entrenamiento, que muestra una convergencia estable (pérdida final 0,048). No se proporcionan resultados de evaluación en las tareas de Behavior ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo en bf16 ocupa aproximadamente 9,79 GB, por lo que se necesita al menos 12 GB de VRAM para cargar los pesos, más memoria para las activaciones y el procesamiento de imágenes. Una GPU con 16 GB o más sería recomendable.
- **GPU recomendadas**: para inferencia, una RTX 4090 (24 GB) o una A100 (40/80 GB) serían adecuadas. Para entrenamiento se usaron 4×H100 80GB.
- **Compatibilidad con GPU de consumo**: sí, una RTX 3090 o 4090 podría ejecutar el modelo, aunque la latencia dependerá del tamaño de las imágenes y del número de cámaras.
- **Opciones de despliegue**: el modelo está integrado en el framework `openpi-spatialvla`, que probablemente soporta inferencia con PyTorch. No se mencionan herramientas como vLLM u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- **Latencia y throughput**: no se proporcionan datos. El entrenamiento medido fue de 1,18 s por iteración en 4×H100, pero la inferencia dependerá del hardware y de la optimización.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (políticas de manipulación robótica). Modelos como RT-2, Octo o OpenVLA podrían ser comparables, pero no se proporcionan datos de rendimiento ni especificaciones detalladas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Checkpoint intermedio**: este modelo no es un modelo final; corresponde a los pasos 90k–120k de un entrenamiento de 140k pasos. Su rendimiento puede no ser representativo del modelo completo.
- **Bug conocido en la configuración**: el commit `b249516` introduce un parámetro `with_wrist_ir` que no está implementado en `behavior_ir_policy.py`, lo que provoca un error al cargar la configuración. Se requiere un parche local para ejecutar el modelo.
- **Especialización en tareas de Behavior**: el modelo está entrenado específicamente para las 15 tareas del benchmark Behavior, por lo que su generalización a otras tareas o entornos no está garantizada.
- **Dependencia de mapas de atención**: el uso de `attn_map_image` como entrada puede limitar su aplicación en entornos donde no se disponga de este tipo de datos.
- **Licencia y uso comercial**: la licencia no está especificada, por lo que se debe contactar con el autor antes de cualquier uso comercial.
- **Riesgo de alucinación en acciones**: como todo modelo de aprendizaje por imitación, puede generar acciones incorrectas si las observaciones difieren de las del entrenamiento, sin mostrar errores explícitos.

## Enlaces

- [HuggingFace - Inevitablevalor/pi05_qwen_behavior_15tasks_aug_attnmap_abstract_train_bs256_4gpu_23dim_droid_attnmap_pretrained](https://huggingface.co/Inevitablevalor/pi05_qwen_behavior_15tasks_aug_attnmap_abstract_train_bs256_4gpu_23dim_droid_attnmap_pretrained)
- Repositorio de código: `openpi-spatialvla` (commit `b249516`, rama `eval-handoff-15tasks-ir`) — no se proporciona URL pública.
