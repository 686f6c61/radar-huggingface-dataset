# Grigorij/PaP_objects_sum_vla_jepa

## Resumen

VLA-JEPA es un modelo de visión-lenguaje-acción (VLA) que combina un backbone de lenguaje Qwen3-VL con un modelo de mundo de video autosupervisado (V-JEPA2) y una cabeza de acción de tipo DiT con flow-matching. Lo desarrolla Grigorij y se publica bajo licencia Apache 2.0, entrenado y subido al Hub mediante el framework LeRobot. El modelo resuelve tareas de manipulación robótica por imitación sobre un robot tipo `so_follower` con dos cámaras (frontal y de brazo), concretamente tres tareas de colocación de objetos en un bol ("Put cream to the bowl", "Put yellow duck to the bowl" y "Put screwdriver to the bowl").

El modelo tiene 2.770.329.478 parámetros (~2,77 B), está disponible en formato safetensors y el repositorio ocupa 68,7 GB. Se entrenó durante 80.000 pasos con un dataset propio de 77 episodios y 46.122 fotogramas a 30 FPS. Es relevante porque representa una aplicación práctica de la arquitectura JEPA al dominio de la robótica de manipulación, combinando predicción en espacio latente con generación de acciones mediante flow-matching.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA-JEPA (Qwen3-VL + V-JEPA2 + DiT con flow-matching) |
| Parámetros totales | 2.770.329.478 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VLA-JEPA combina tres componentes: un backbone de lenguaje Qwen3-VL que procesa las observaciones visuales y el texto de la tarea; un modelo de mundo de video autosupervisado V-JEPA2 que aprende representaciones latentes predictivas del entorno; y una cabeza de acción basada en un transformer DiT (Diffusion Transformer) con flow-matching que genera las acciones del robot. Esta arquitectura híbrida permite que el modelo aprenda en un espacio de representación abstracto, abstrayendo variabilidad superficial de los datos visuales.

El entrenamiento se realizó con el framework LeRobot 0.6.1, con optimizador AdamW, tasa de aprendizaje 0,0001, batch size 8 y semilla 1000 durante 80.000 pasos. El dataset de entrenamiento contiene 77 episodios y 46.122 fotogramas a 30 FPS, con tres tareas de colocación de objetos. El modelo se entrenó mediante aprendizaje por imitación (imitation learning), sin indicios de RLHF o DPO en la información disponible.

## Capacidades

- Generación de acciones de manipulación robótica de 6 grados de libertad (posición y orientación del efector final).
- Procesamiento de dos cámaras simultáneas: cámara frontal y cámara de brazo, ambas a 640x480 píxeles.
- Comprensión de instrucciones en lenguaje natural para seleccionar la tarea a ejecutar (por ejemplo, "Put cream to the bowl").
- Ejecución de políticas de control en tiempo real sobre robots tipo `so_follower`.
- Capacidad de razonamiento visual para identificar y localizar objetos en la escena.
- Soporte de entrenamiento de nuevas tareas mediante aprendizaje por imitación (fine-tuning con LeRobot).
- Predicción de acciones continuas con flow-matching, en lugar de autoregresión token a token.

## Casos de uso

- **Manipulación robótica de objetos en entornos de laboratorio**: el modelo puede ejecutar tareas de colocación de objetos en un contenedor (bowl), lo que lo hace adecuado para investigación en robótica de manipulación.
- **Entrenamiento de políticas de imitación**: sirve como punto de partida para fine-tuning en nuevas tareas con el framework LeRobot, permitiendo a investigadores adaptar el modelo a sus propios robots y datasets.
- **Investigación en arquitecturas JEPA aplicadas a robótica**: al ser un modelo basado en V-JEPA2, es un banco de pruebas para estudiar el comportamiento de modelos de predicción en espacio de representación frente a modelos generativos token.
- **Evaluación de políticas de control en robots `so_follower`**: el modelo se puede desplegar directamente con el comando `lerobot-rollout` para validar su comportamiento en el robot real.
- **Generación de datos de entrenamiento sintéticos**: las políticas VLA-JEPA pueden utilizarse para recopilar datos de demostración que luego se emplean para entrenar otros modelos de control.
- **Benchmarking de arquitecturas VLA**: al estar entrenado sobre un dataset público con tres tareas concretas, es útil para comparar el rendimiento de VLA-JEPA frente a otras arquitecturas de visión-lenguaje-acción en condiciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,77 B de parámetros, la inferencia en FP16 requeriría aproximadamente 5,5 GB de VRAM, y en FP32 unos 11 GB. Sin embargo, el tamaño real del repositorio (68,7 GB) sugiere que el modelo puede incluir pesos en múltiples formatos o con mayor precisión, por lo que la VRAM real podría ser superior.
- GPUs recomendadas: una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 4070, RTX 4080, RTX 4090) sería suficiente para inferencia en FP16. Para entrenamiento o fine-tuning, se recomienda una GPU de gama alta (A100, H100) o varias GPUs.
- Si cabe en consumer GPU: sí, una RTX 4090 con 24 GB de VRAM debería ser capaz de ejecutar la inferencia, aunque no hay datos de latencia o throughput disponibles.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta `lerobot-rollout` para ejecución en robots reales. No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El autor ha publicado otros modelos VLA-JEPA en el Hub con la misma arquitectura pero entrenados sobre diferentes robots y datasets. No se dispone de datos de parámetros ni rendimiento para estos modelos, por lo que la comparación se limita a lo publicado en las model cards.

| Modelo | Robot | Dataset | Tareas | Parámetros |
|---|---|---|---|---|
| Grigorij/PaP_objects_sum_vla_jepa | so_follower | PaP_objects_sum (77 episodios) | 3 tareas de colocación de objetos | 2,77 B |
| Grigorij/Tello_multifruit_sum_vla_jepa | No disponible | No disponible | No disponible | No disponible |
| Grigorij/Franka_WAMs_vla_jepa | Franka | No disponible | No disponible | No disponible |

No hay datos de benchmarks que permitan comparar el rendimiento entre estos modelos. Tampoco se ha encontrado información sobre modelos comparables de otros autores con la misma arquitectura.

## Limitaciones y advertencias

- **Sin resultados de evaluación**: la model card indica que no se han realizado evaluaciones en el robot real, por lo que el rendimiento real no está validado.
- **Dataset limitado**: el entrenamiento se realizó con solo 77 episodios y 3 tareas concretas, lo que limita la generalización a otras tareas, objetos o configuraciones de cámara.
- **Sobreajuste potencial**: con un dataset tan reducido, el modelo puede memorizar las trayectorias de entrenamiento y fallar ante variaciones de posición, iluminación o distracciones.
- **Dependencia de la configuración de cámaras**: las observaciones requieren dos cámaras específicas (frontal y de brazo) con resolución 640x480; cualquier cambio en la configuración de cámaras requiere reentrenamiento o adaptación.
- **Riesgo de alucinación**: como modelo basado en Qwen3-VL, puede presentar alucinaciones en la interpretación de la escena o en la selección de la tarea correcta.
- **Sin información sobre idiomas**: no se especifica los idiomas soportados, aunque el backbone Qwen3-VL es multilingüe.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el modelo puede depender de pesos del backbone Qwen3-VL que podrían tener licencias adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Grigorij/PaP_objects_sum_vla_jepa)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Grigorij/PaP_objects_sum)
- [Artículo VLA-JEPA (arXiv 2602.10098)](https://arxiv.org/abs/2602.10098)
- [Artículo VL-JEPA (arXiv 2512.10942)](https://arxiv.org/abs/2512.10942)
- [Guía de LeRobot para vla_jepa](https://huggingface.co/docs/lerobot/main/en/vla_jepa)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=Grigorij/PaP_objects_sum)
