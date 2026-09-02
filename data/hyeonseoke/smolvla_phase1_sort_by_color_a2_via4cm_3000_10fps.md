# HyeonseokE/smolvla_phase1_sort_by_color_A2_via4cm_3000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, diseñado para ofrecer un rendimiento competitivo en tareas de robótica con un coste computacional reducido y la posibilidad de desplegarse en hardware de consumo. Este repositorio contiene un fine-tuning de SmolVLA para una tarea concreta: clasificar bloques de colores en platos del mismo color, ejecutada por un robot SO-101. El modelo se ha entrenado con 100 episodios de demostración (74.827 frames a 10 FPS) utilizando el framework LeRobot, partiendo del modelo base `lerobot/smolvla_base`. La relevancia de esta ficha radica en mostrar cómo un VLA generalista puede adaptarse a una tarea específica con pocos datos, manteniendo la eficiencia y la viabilidad en equipos asequibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, siguiendo la arquitectura descrita en el paper [arXiv:2506.01844](https://arxiv.org/abs/2506.01844). Este fine-tuning se ha entrenado sobre el modelo base `lerobot/smolvla_base` con el dataset `HyeonseokE/phase1_sort_by_color_A2_10fps_via4cm`, que contiene 100 episodios de un robot SO-101 clasificando bloques por color. El entrenamiento se realizó con 58.450 pasos, batch size 64, optimizador AdamW y learning rate 0.0001, con semilla 3000. La innovación principal de SmolVLA es su tamaño reducido (450M parámetros) frente a otros VLA como OpenVLA (7B), lo que permite su ejecución en GPUs de consumo sin sacrificar capacidades básicas de control robótico.

## Capacidades

- Control robótico de 6 grados de libertad (acciones de posición y orientación) a partir de observaciones de estado y visión.
- Percepción visual de múltiples cámaras: según la model card, las cámaras son `top` y `left_wrist`, aunque la tabla de inputs indica tres entradas visuales (`camera1`, `camera2`, `camera3`), lo que sugiere una posible inconsistencia en la documentación.
- Ejecución de tareas de manipulación por imitación, específicamente la clasificación de objetos por color.
- No incluye tool calling, capacidades de agente autónomo ni razonamiento multi-paso; es una política de control directo que mapea observaciones a acciones.
- No se especifican capacidades multilingües en la model card, aunque SmolVLA como modelo base podría soportar instrucciones en varios idiomas.

## Casos de uso

- Automatización de clasificación de piezas en líneas de montaje: el modelo puede integrarse en un robot SO-101 para separar componentes por color, reduciendo la intervención manual en entornos industriales.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de un VLA base con un dataset pequeño, útil para estudiar la transferencia de habilidades en robótica.
- Prototipado rápido de políticas robóticas: al ser ligero, permite iterar sobre nuevas tareas con pocos recursos computacionales, acelerando el ciclo de desarrollo.
- Despliegue en entornos educativos: su bajo requisito de hardware lo hace accesible para laboratorios universitarios que no disponen de GPUs de gama alta.
- Evaluación de generalización en tareas de manipulación: se puede utilizar como baseline para comparar la robustez de otros VLA en la misma tarea de clasificación por color.
- Integración en pipelines de LeRobot: al estar entrenado con este framework, se puede combinar con otras herramientas de registro de datos y evaluación para experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet."). Por tanto, no se dispone de métricas de éxito, tasa de finalización ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Al tratarse de un modelo de 450M parámetros, se estima que puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, aunque no se proporcionan datos específicos de consumo en la documentación.
- GPUs recomendadas: tarjetas como NVIDIA RTX 3060, RTX 4060 o superiores serían suficientes para inferencia en tiempo real, dado el diseño orientado a hardware de consumo de SmolVLA.
- El despliegue se realiza mediante el framework LeRobot, que soporta inferencia con `lerobot-rollout` y entrenamiento con `lerobot-train`. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- La latencia y el throughput no están documentados para este fine-tuning específico; dependerán de la GPU utilizada y de la resolución de las cámaras (256x256 en el entrenamiento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tuning) | 450M | no disponible | apache-2.0 | Hugging Face |
| OpenVLA | 7B | 8K tokens | MIT (modelo) | Hugging Face |
| RT-2 | 55B | no disponible | propietario | no abierto |

SmolVLA se posiciona como una alternativa mucho más ligera que OpenVLA, con un coste de inferencia significativamente menor, aunque con capacidades posiblemente más limitadas en tareas complejas. RT-2 no es de código abierto, por lo que SmolVLA ofrece una ventaja en términos de accesibilidad y personalización. No se dispone de comparativas de rendimiento numéricas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo especializado en una única tarea (clasificación por color); no es generalizable a otras tareas sin un nuevo fine-tuning.
- No se han realizado evaluaciones en robot real, por lo que el rendimiento en condiciones del mundo real (iluminación, variaciones de objetos, etc.) es desconocido.
- Riesgo de alucinación en las acciones generadas, especialmente si las observaciones difieren del dominio de entrenamiento.
- La documentación presenta inconsistencias en el número de cámaras (la model card menciona dos, pero la tabla de inputs muestra tres), lo que puede dificultar la reproducción exacta.
- La licencia apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y del dataset asociado.
- No se especifican limitaciones de contexto ni de idioma, pero al ser un modelo de control robótico, la entrada de lenguaje natural no es relevante en este fine-tuning.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/HyeonseokE/smolvla_phase1_sort_by_color_A2_via4cm_3000_10fps)
- [Paper SmolVLA (arXiv)](https://arxiv.org/abs/2506.01844)
- [Sitio web de SmolVLA](https://smolvla.net/index_en)
- [Dataset de entrenamiento](https://huggingface.co/datasets/HyeonseokE/phase1_sort_by_color_A2_10fps_via4cm)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
