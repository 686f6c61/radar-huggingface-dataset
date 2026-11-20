# SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_XVLA

## Resumen

X-VLA es un framework Vision-Language-Action (VLA) basado en flow matching y soft prompting, desarrollado en el ecosistema LeRobot de Hugging Face. Este repositorio concreto, `SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_XVLA`, es un fine-tuning del modelo base `lerobot/xvla-base` sobre un dataset propio de 300 episodios para una tarea de manipulación robótica con un brazo UR5. El modelo resuelve el problema de mapear observaciones multimodales (tres cámaras y estado del robot) a acciones de control de 7 dimensiones en un espacio continuo.

La relevancia de X-VLA radica en su enfoque de "soft prompts": cada configuración de robot o hardware se trata como una "tarea" codificada mediante un pequeño conjunto de embeddings aprendibles, lo que permite que un único modelo se adapte a morfologías, sensores y espacios de acción diversos. Este checkpoint particular está especializado en una única tarea industrial: recoger una CPU con una ventosa y depositarla en una caja.

El modelo tiene 879.687.256 parámetros (aproximadamente 880M), un tamaño de repositorio de 1,8 GB en safetensors, y se distribuye bajo licencia Apache 2.0. Está pensado para ejecutarse con la librería LeRobot 0.6.2 y el pipeline de robótica de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching y soft prompting |
| Parámetros totales | 879.687.256 (~880M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; se desconoce si soporta cuantización) |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/xvla-base |
| Tipo de robot | UR5 |
| Cámaras de entrada | 3 (image 256x256, image2 256x256, image3 224x224) |
| Estado de entrada | vector de 8 dimensiones |
| Salida | acción de 7 dimensiones |
| Librería | LeRobot 0.6.2 |
| Tamaño del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

X-VLA es un framework VLA con soft prompting y flow matching. La idea central es que cada robot o configuración de hardware se representa mediante un conjunto reducido de embeddings de "soft prompt" aprendibles, de modo que un único modelo puede reconciliar morfologías, sensores y espacios de acción heterogéneos. La generación de acciones se formula como un problema de flow matching, una alternativa a la difusión que modela directamente el transporte entre distribuciones de ruido y de acciones. El modelo consume tres flujos visuales (dos a 256x256 y uno a 224x224) más un vector de estado de 8 dimensiones, y produce una acción de 7 dimensiones.

Este checkpoint se ha fine-tuneado desde `lerobot/xvla-base` sobre el dataset `SamerAyyad/VLA_Samer_15.11.2026_300eps_Last`, compuesto por 300 episodios y 191.275 frames a 30 FPS, con una única tarea: "Pick up the CPU with the suction gripper and place it in the box". La configuración de entrenamiento fue de 20.000 pasos, batch size 8, optimizador xvla-adamw, learning rate 0.0001 y semilla 1000. No se especifica el número total de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO, algo esperable en un modelo de imitación robótica.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones para un brazo UR5 equipado con ventosa.
- Percepción visual multimodal: procesa simultáneamente tres cámaras (dos a 256x256 y una a 224x224).
- Fusión de estado propioceptivo: integra un vector de estado de 8 dimensiones junto con las imágenes.
- Ejecución de una tarea específica de pick-and-place: recoger una CPU con ventosa y colocarla en una caja.
- Aprendizaje por imitación: política entrenada sobre demostraciones humanas (300 episodios).
- Adaptación multi-robot mediante soft prompts: el framework base permite, en teoría, reutilizar el modelo para otras morfologías mediante nuevos soft prompts.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito.

## Casos de uso

- Automatización de pick-and-place industrial: el modelo ejecuta la secuencia completa de recogida con ventosa y depósito en caja sobre un UR5, adecuado para líneas de ensamblaje de componentes electrónicos donde la tarea es repetitiva y bien delimitada.
- Prototipado rápido de políticas robóticas: gracias a LeRobot y al comando `lerobot-rollout`, un equipo puede desplegar la política en un UR5 real en minutos para validar la viabilidad de una celda robotizada antes de invertir en programación tradicional.
- Generación de datos sintéticos y aumento de dataset: la política puede ejecutarse en bucle para generar trayectorias adicionales que alimenten un dataset mayor, útil para entrenar versiones más robustas del mismo modelo.
- Benchmark interno de infraestructura de robot learning: sirve como referencia reproducible (300 episodios, 20.000 pasos, configuración documentada) para comparar frameworks de VLA y configuraciones de entrenamiento en un entorno controlado.
- Investigación en adaptación multi-tarea: al partir de `lerobot/xvla-base`, permite estudiar cómo los soft prompts especializan el modelo hacia una tarea concreta y cómo se transfiere el conocimiento a nuevas tareas mediante fine-tuning.
- Formación y docencia en robótica de imitación: el repositorio incluye comandos completos de entrenamiento e inferencia, lo que lo convierte en un ejemplo didáctico de pipeline LeRobot de principio a fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, ni de métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~880M parámetros en fp32 se requieren aproximadamente 3,5 GB solo para pesos; en fp16/bf16, unos 1,8 GB. Sumando activaciones de los tres flujos visuales, se estima un consumo total de 4-8 GB de VRAM, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: no disponible de forma oficial. Por tamaño, una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberían ser suficientes para inferencia en fp16. Para entrenamiento con batch size 8, se recomienda una A100 o H100.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en RTX 3090, 4090, 4080 y posiblemente en GPUs con 8-12 GB en cuantización fp16, aunque no está confirmado.
- Opciones de despliegue: LeRobot 0.6.2 mediante `lerobot-rollout` (comando documentado en la model card). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de robótica, no de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_XVLA | ~880M | no disponible | Pick-and-place UR5 | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/xvla-base | no disponible | no disponible | VLA base multi-robot | no disponible en la información | Hugging Face |
| Otros VLA del ecosistema LeRobot (p. ej. pi0, ACT) | no disponible en la información | no disponible | Manipulación robótica | varía | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad; cualquier comparación de precisión o tasa de éxito requeriría benchmarks que no se han publicado.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea ("Pick up the CPU with the suction gripper and place it in the box") y un único robot (UR5); no generalizará a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que se desconoce su robustez ante variaciones de iluminación, posiciones de objetos o distracciones.
- Dependencia de hardware concreto: requiere un UR5 con ventosa y tres cámaras con los nombres e índices exactos de las claves de observación; cualquier cambio en la configuración invalida la política.
- Dataset pequeño: 300 episodios y 191.275 frames son un volumen modesto, lo que aumenta el riesgo de sobreajuste y de baja generalización.
- Sin datos sobre sesgos: no se ha documentado ningún análisis de sesgos, aunque en robótica los sesgos se manifiestan como fallos sistemáticos ante objetos o entornos no representados en el dataset.
- Riesgo de alucinación en el sentido de acciones erróneas: como política de imitación, puede generar trayectorias plausibles pero incorrectas ante estados fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume todo el riesgo en producción.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validación por terceros.
- Idiomas: no aplica, pero tampoco se documenta ningún componente de lenguaje natural más allá del prompt de tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_XVLA
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_15.11.2026_300eps_Last
- Paper X-VLA (arXiv 2510.10274): https://huggingface.co/papers/2510.10274
- Guía LeRobot X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamerAyyad/VLA_Samer_15.11.2026_300eps_Last
- Documentación de inferencia LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
