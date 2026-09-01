# maskjp/mtdit-spatial-relative-joints

## Resumen

`maskjp/mtdit-spatial-relative-joints` es un modelo de política robótica basado en un diffusion transformer multi-tarea (MTDiT-Spatial), desarrollado por el investigador maskjp sobre la librería LeRobot. El modelo predice acciones de control en espacio articular (10 dimensiones de motor) a partir de observaciones visuales de tres cámaras y del estado del robot, utilizando una representación de acciones relativas respecto a un ancla temporal. Con 234,7 millones de parámetros, fue entrenado desde cero sobre la mezcla multi-tarea `base4` de 949 episodios (8 tareas, 50 Hz).

La relevancia de este checkpoint es principalmente científica: el autor lo publica explícitamente como un **resultado negativo** dentro de un estudio que cruza representación de acciones (relativas vs. absolutas) con arquitectura de política (MTDiT vs. pi0.5). La hipótesis era que usar objetivos de acción relativos haría que la política atendiera a sus cámaras; las métricas demuestran que no es así, con un ratio de sensibilidad a cámara de 0,129 (muy por debajo de 1,0) y un veredicto de "BLIND" (ciega a la escena). Se trata del checkpoint en el paso 60.000 de una corrida de 100.000, que corresponde al mínimo de pérdida en el conjunto de validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTDiT-Spatial (multi-task diffusion transformer con codificador CLIP ViT-B/16) |
| Parametros totales | 234.712.842 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo robótico; horizon de 32 pasos, 2 observaciones) |
| Tipos de cuantizacion | no disponible (pesos en bf16, safetensors) |
| Idiomas soportados | no disponible (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (a través de LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `mtdit_spatial` con `vision_feature_mode=cls`, que el autor describe como byte-idéntica al `multi_task_dit` estándar de LeRobot. Es un transformer de difusión (DDPM) con 4 capas, 8 cabezas de atención, dimensión oculta de 512 y 100 pasos de entrenamiento de difusión. El codificador visual es un CLIP `openai/clip-vit-base-patch16` con un multiplicador de learning rate de 0,1 respecto al resto de la red. Las imágenes se redimensionan a 240×320 y se recortan aleatoriamente a 224×224.

El entrenamiento se realizó desde cero sobre la mezcla multi-tarea `base4` (949 episodios, 900 de entrenamiento y 49 de validación, 8 tareas, 3 cámaras, 50 Hz) con batch de 64, precisión bf16 y semilla 1000. La normalización combina media/desviación para las imágenes, min-max para el estado y cuantiles para las acciones. La innovación principal es la representación de acciones relativas: los objetivos se calculan como `action[t+k] - state[anchor]` con un ancla por chunk, y se añaden de nuevo tras la inferencia. El gripper se mantiene en valores absolutos (`relative_exclude_joints=['gripper']`) por ser un comando casi binario con saltos de 70 unidades. El autor advierte que las estadísticas de normalización deben coincidir con esta representación, por lo que se entrenó contra el dataset hermano `l5vel-peng/multitask-relative-h32`.

## Capacidades

- Generación de acciones de control para robots manipuladores: predice 10 dimensiones de motor (articulaciones) en espacio conjunto.
- Soporte multi-tarea: entrenado en 8 tareas diferentes dentro de la mezcla `base4`.
- Percepción visual multi-cámara: procesa observaciones de 3 cámaras simultáneamente mediante el codificador CLIP.
- Generación por difusión: utiliza DDPM con 100 timesteps para producir secuencias de acciones de 24 pasos (con horizonte de 32).
- Representación de acciones relativas: los objetivos se expresan como desplazamientos respecto a un ancla temporal, lo que permite estudiar el efecto de esta formulación en la atención visual.
- No tiene capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico; es exclusivamente un modelo de control robótico.

## Casos de uso

- Investigación en robótica: estudiar el efecto de la representación de acciones (relativas vs. absolutas) en la capacidad de una política para atender a estímulos visuales. Este checkpoint sirve como referencia negativa en ese análisis.
- Benchmark de políticas multi-tarea: comparar el rendimiento de MTDiT-Spatial con otras arquitecturas (como pi0.5) en la mezcla `base4`, utilizando las métricas publicadas (pérdida held-out, error de predicción, sensibilidad a cámara).
- Desarrollo de pipelines de entrenamiento con LeRobot: el modelo demuestra cómo configurar un entrenamiento con acciones relativas, normalización por cuantiles y un plugin de política personalizado (`lerobot_policy_mtdit_spatial`).
- Validación de metodologías de evaluación: el protocolo de "camera-sensitivity ratio" y "null test" descrito en la model card puede replicarse para evaluar si otras políticas están realmente ancladas a la escena visual.
- Reproducibilidad de resultados negativos: sirve como punto de partida para que otros investigadores verifiquen el hallazgo y exploren variantes (por ejemplo, cambiar la representación del gripper o el ancla temporal).
- Educación en robótica con difusión: como ejemplo de implementación de un diffusion policy multi-tarea con código abierto, útil para cursos o tutoriales sobre LeRobot.

## Benchmarks y rendimiento

El autor proporciona métricas medidas en los episodios held-out 93-97 de la tarea "croissant", restringidos a la fase de "recoger el croissant", con 4 semillas de inferencia bajo números aleatorios comunes y excluyendo pasos con padding. Los resultados son:

| Metrica | Valor |
|---|---|
| Pérdida held-out | 0,0078 |
| Ratio de sensibilidad a cámara | 0,129 |
| Error de predicción | 0,077 |
| Test nulo | 0,00000 (pasa) |
| Veredicto | BLIND |

El ratio de sensibilidad a cámara se calcula manteniendo fijo `observation.state`, intercambiando las cámaras de otro episodio en un frame con estado similar, y dividiendo el cambio resultante en las articulaciones predichas por la dispersión natural entre episodios. Un valor de 1,0 indicaría que la política sigue la escena; 0,0 que la ignora. El valor de 0,129 indica que la política es prácticamente ciega a las cámaras. El error de predicción de 0,077 está dentro del umbral de fiabilidad de 0,8, lo que descarta que el bajo ratio se deba a inestabilidad numérica. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 470 MB (234,7M parámetros × 2 bytes), más activaciones y overhead del transformer y el codificador CLIP. Se estima que cabe en GPUs con 4-6 GB de VRAM, aunque no hay datos oficiales de consumo.
- GPU recomendadas: cualquier GPU moderna con soporte bf16 (RTX 30xx o superior, A100, H100, etc.). Para entrenamiento, el autor usó batch 64 con bf16, lo que sugiere al menos una GPU con 24 GB o varias GPUs.
- Compatibilidad con GPU de consumo: sí, es probable que funcione en una RTX 3060 o superior para inferencia, dado el tamaño moderado del modelo.
- Opciones de despliegue: requiere el plugin `lerobot_policy_mtdit_spatial` y la librería LeRobot. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El autor menciona en la model card que este checkpoint forma parte de una matriz 2×2 que cruza representación de acciones (relativas vs. absolutas) con política (MTDiT vs. pi0.5), pero no publica resultados de pi0.5 ni de la variante con acciones absolutas en este repositorio. Los modelos comparables serían otros diffusion policies de LeRobot (como `multi_task_dit` estándar o `pi0`), pero no hay métricas cruzadas disponibles.

## Limitaciones y advertencias

- Resultado negativo explícito: el modelo es "BLIND" a las cámaras (ratio de sensibilidad 0,129), lo que significa que ignora la información visual de la escena. No debe usarse en aplicaciones donde el control dependa de la percepción.
- Conjunto de datos limitado: entrenado en 949 episodios de 8 tareas específicas; la generalización a otras tareas o entornos no está garantizada.
- Requiere infraestructura específica: necesita el plugin `lerobot_policy_mtdit_spatial` y la librería LeRobot; no es un modelo autocontenido.
- Representación de acciones relativa: la normalización debe coincidir con el dataset hermano `l5vel-peng/multitask-relative-h32`; usar estadísticas absolutas degradaría el rendimiento.
- Sin capacidades lingüísticas: no procesa texto ni instrucciones; es exclusivamente un modelo de control.
- Licencia Apache-2.0: permite uso comercial, pero al ser un resultado negativo, su valor práctico es limitado fuera del ámbito investigador.
- El checkpoint es el paso 60.000 de 100.000, elegido por ser el mínimo de pérdida held-out; el entrenamiento continuó hasta 100K con pérdida final de 0,0084, por lo que este no es el modelo final de la corrida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/mtdit-spatial-relative-joints
- Repositorio del plugin: https://github.com/maskjp/lerobot_policy_mtdit_spatial
- Modelo relacionado (variante con spatial mask): https://huggingface.co/maskjp/mtdit-spatial-multitask-spatial-mask
- Modelo relacionado (variante con patch tokens): https://huggingface.co/maskjp/mtdit-spatial-multitask-patch-tokens
- Perfil del autor en GitHub: https://github.com/maskjp
