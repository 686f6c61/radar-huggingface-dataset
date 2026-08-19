# makermods/smolvla_200ep_blue_cube_orange_box

## Resumen

El modelo `makermods/smolvla_200ep_blue_cube_orange_box` es un fine-tuning del modelo base `lerobot/smolvla_base` (SmolVLA), desarrollado por el usuario `makermods` sobre el dataset propio `makermods/200ep_blue_cube_orange_box`. Se trata de un modelo de robótica (pipeline `robotics`) diseñado para ejecutar una tarea concreta de manipulación: recoger un cubo azul y depositarlo en una caja naranja, utilizando un brazo robótico SO-101 con cámaras frontal y de muñeca.

El modelo resuelve el problema de la ejecución de políticas visomotoras (Vision-Language-Action) en un escenario de pick-and-place específico. Su relevancia radica en que demuestra un flujo de entrenamiento eficiente sobre un VLA, congelando el vision encoder y entrenando únicamente el action expert (`train_expert_only=true`), lo que reduce significativamente el coste computacional (20.000 pasos en una RTX 4090). Con 450 millones de parámetros, es un modelo compacto en comparación con otros VLA de mayor tamaño, lo que lo hace accesible para entornos de investigación con recursos limitados. La longitud de contexto no se especifica en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo, sin GGUF/AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura SmolVLA implementada en la librería LeRobot. Es un transformer multimodal que procesa imágenes (frontal y de muñeca) y genera acciones de control para el robot. El entrenamiento se realizó sobre un dataset de 199 episodios (55.897 fotogramas a 30 fps) del robot SO-101. Se ejecutaron 20.000 pasos con un batch size de 64, lo que equivale aproximadamente a 23 épocas, utilizando precisión mixta bf16 (AMP). El optimizador empleó una tasa de aprendizaje de 1e-4 con decaimiento coseno hasta 2.5e-6 y un warmup de 1.000 pasos.

Una innovación técnica destacable es la congelación del vision encoder y el entrenamiento exclusivo del action expert (`train_expert_only=true`), una estrategia de fine-tuning eficiente que reduce el coste computacional y el riesgo de olvido catastrófico en las representaciones visuales. La loss final suavizada reportada es de aproximadamente 0.045. El proceso de inferencia requiere un mapeo específico de claves de imagen: el modelo espera las claves `observation.images.camera1` (frontal) y `observation.images.camera2` (muñeca), por lo que es imprescindible aplicar el `rename_map` indicado en la model card durante el despliegue.

## Capacidades

- Ejecución de políticas visomotoras para tareas de manipulación robótica, específicamente pick-and-place de un cubo azul sobre una caja naranja.
- Control de un brazo robótico SO-101 (follower) mediante comandos de acción generados a partir de entrada visual.
- Procesamiento multimodal de imágenes: entrada de dos cámaras (frontal y muñeca) para generar salidas de acción.
- Fine-tuning eficiente sobre un VLA preentrenado, lo que permite adaptación a tareas nuevas con pocos datos.
- No es un modelo de lenguaje general: no soporta generación de texto libre, tool calling, agentes conversacionales ni razonamiento multi-step fuera del ámbito robótico.

## Casos de uso

- Automatización industrial de pick-and-place: el modelo puede clasificar objetos por color y depositarlos en contenedores designados, integrándose en celdas de manufactura donde se requiera una manipulación repetitiva y precisa.
- Investigación en robótica: sirve como baseline para estudiar el impacto del fine-tuning solo del action expert frente al ajuste completo del modelo, evaluando trade-offs entre coste computacional y rendimiento.
- Prototipado de tareas domésticas: permite implementar en un robot SO-101 la acción de recoger un objeto de una ubicación fija y colocarlo en otra, útil para pruebas de concepto en entornos de asistencia personal.
- Integración con el ecosistema LeRobot: al estar entrenado con esta librería, puede desplegarse directamente en hardware compatible usando los pipelines estándar de LeRobot, facilitando la replicación de experimentos.
- Evaluación de transferencia de aprendizaje: comparar el rendimiento de este fine-tuning con el modelo base `smolvla_base` en la misma tarea permite cuantificar la ganancia obtenida con el dataset específico.
- Educación en robótica: es un ejemplo práctico y documentado de entrenamiento de un VLA en un dataset pequeño, útil para cursos de robótica avanzada o talleres de fine-tuning de modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como MMLU, HumanEval o métricas de éxito de tarea) en la información disponible. La única métrica reportada es la loss de entrenamiento suavizada, que alcanzó un valor final de aproximadamente 0.045 tras 20.000 pasos. No se proporcionan métricas de precisión en la ejecución de la tarea (éxito en el pick-and-place) ni comparativas con otros modelos en el mismo escenario.

## Requisitos de hardware

- Entrenamiento: el autor reporta el uso de una GPU NVIDIA RTX 4090. Con 450 millones de parámetros y batch size 64 en bf16, se requieren al menos 24 GB de VRAM para entrenar, aunque podría reducirse el batch size para GPUs con menos memoria.
- Inferencia: al tener un tamaño de 450M parámetros, el modelo cabe en GPUs consumer de gama media (por ejemplo, RTX 3060 con 12 GB, RTX 4070, etc.) en precisión FP16 o FP32. El peso total del repositorio es de 0.9 GB en safetensors.
- Despliegue: la librería principal es LeRobot (`lerobot`), que proporciona los módulos de inferencia y control del robot. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles. Dependen del hardware del robot, la resolución de las cámaras y la optimización del pipeline de LeRobot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `makermods/smolvla_200ep_blue_cube_orange_box` | 450M | no disponible | Pick-and-place específico (cubo azul a caja naranja) | Apache-2.0 | HuggingFace |
| `lerobot/smolvla_base` | 450M | no disponible | Tareas generales de manipulación (sin fine-tuning) | Apache-2.0 | HuggingFace |
| OpenVLA (referencia general) | 7B | no disponible | Manipulación generalista | MIT (según versión) | HuggingFace |

La comparativa directa con otros VLA de la misma categoría no es posible con los datos disponibles, ya que no se han publicado benchmarks del modelo. Frente a su modelo base, la diferencia principal es el fine-tuning en un dataset específico, que debería mejorar el rendimiento en la tarea concreta a costa de perder generalidad. Modelos como OpenVLA son considerablemente más grandes (7B) y ofrecen capacidades generalistas, pero requieren más recursos de hardware.

## Limitaciones y advertencias

- Tarea muy específica: el modelo está entrenado únicamente para la tarea de cubo azul a caja naranja. No generaliza a otros objetos, colores o posiciones sin un reentrenamiento adicional.
- Dependencia del hardware: está diseñado para el robot SO-101 y requiere exactamente dos cámaras (frontal y muñeca). Cualquier cambio en la configuración del robot invalida el modelo.
- Requisito de mapeo de claves: en inferencia es obligatorio aplicar el `rename_map` (`observation.images.front` → `observation.images.camera1`, `observation.images.wrist` → `observation.images.camera2`). No hacerlo provocará fallos en la ejecución.
- Dataset pequeño: con solo 199 episodios, existe un riesgo elevado de sobreajuste. El rendimiento en condiciones de iluminación o posiciones ligeramente diferentes al dataset de entrenamiento puede degradarse.
- Sin métricas de éxito publicadas: la model card no reporta la tasa de éxito de la tarea, por lo que no se puede validar la eficacia real del modelo en producción.
- Licencia del dataset: aunque el modelo es Apache-2.0, la licencia del dataset `makermods/200ep_blue_cube_orange_box` no está especificada en la información proporcionada, lo que podría afectar a la redistribución o uso comercial del fine-tuning.
- Riesgo de alucinación en acciones: como todo modelo de aprendizaje automático, puede generar acciones no seguras si la entrada visual difiere del dominio de entrenamiento. Se recomienda supervisión humana en entornos reales.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/makermods/smolvla_200ep_blue_cube_orange_box
- Dataset de entrenamiento: https://huggingface.co/datasets/makermods/200ep_blue_cube_orange_box
- Modelo base (SmolVLA): https://huggingface.co/lerobot/smolvla_base
