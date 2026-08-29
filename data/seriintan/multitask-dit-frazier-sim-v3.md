# seriintan/multitask-dit-frazier-sim-v3

## Resumen

El modelo `seriintan/multitask-dit-frazier-sim-v3` es una política robótica basada en el Multi-Task Diffusion Transformer (DiT), una arquitectura que extiende Diffusion Policy con un transformer de difusión de gran tamaño y condicionamiento por texto y visión. Desarrollado por Seri Intan Kuala, este modelo se ha entrenado con la librería LeRobot de Hugging Face sobre un dataset de simulación específico para la tarea de recoger un tubo de succión Frazier y colocarlo en una cesta azul. Con aproximadamente 248,8 millones de parámetros, el modelo procesa imágenes de dos cámaras (gripper y lateral) junto con el estado del robot para generar acciones de control de 6 grados de libertad.

Este modelo es relevante porque demuestra la aplicación de arquitecturas de difusión modernas al aprendizaje por imitación en robótica, permitiendo políticas multi-tarea con un único conjunto de pesos. Aunque el repositorio se centra en una tarea concreta, la arquitectura subyacente está diseñada para soportar múltiples tareas mediante condicionamiento textual y visual, lo que lo convierte en un punto de partida interesante para desarrolladores que trabajan con LeRobot y buscan implementar políticas robóticas basadas en transformers de difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) |
| Parametros totales | 248.855.302 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de robótica, no procesa texto de entrada) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No aplica (modelo de robótica, no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa un Diffusion Transformer (DiT) que combina una arquitectura transformer con un objetivo de difusión o flow-matching para generar acciones. A diferencia de las políticas de difusión clásicas que usan U-Nets, este enfoque emplea un transformer de difusión de gran tamaño que se condiciona mediante texto (descripción de la tarea) y visión (imágenes de cámaras). El modelo recibe como entrada el estado del robot (vector de 6 dimensiones) y dos imágenes RGB de 480x640 píxeles, y produce una acción de 6 dimensiones.

El entrenamiento se realizó mediante aprendizaje por imitación supervisado sobre un dataset de simulación (`seriintan/frazier_sim_v3`) que contiene 40 episodios y 14.144 fotogramas a 30 FPS, correspondientes a la tarea de recoger un tubo Frazier y colocarlo en una cesta azul. Se utilizó el optimizador Adam con una tasa de aprendizaje de 2e-05, un tamaño de lote de 16 y 30.000 pasos de entrenamiento, con una semilla fija de 1000. La implementación se basa en LeRobot v0.6.2 y sigue el procedimiento estándar de esta librería para entrenamiento y evaluación. No se mencionan técnicas de RLHF, DPO ni otros refinamientos posteriores.

## Capacidades

- Ejecución de tareas de manipulación robótica de precisión, específicamente la tarea de recoger un tubo de succión Frazier y depositarlo en una cesta azul.
- Procesamiento multimodal de entrada: combina imágenes de dos cámaras (gripper y lateral) con el estado del robot para generar acciones de control.
- Generación de acciones continuas de 6 grados de libertad, adecuadas para robots tipo `so_follower`.
- Soporte para inferencia en tiempo real mediante el flujo de rollout de LeRobot, con posibilidad de ejecución continua o con duración limitada.
- Arquitectura diseñada para extenderse a múltiples tareas mediante condicionamiento textual, aunque este modelo concreto se ha entrenado para una única tarea.
- Compatibilidad con el ecosistema LeRobot: permite entrenamiento, evaluación y despliegue con las herramientas estándar de la librería.

## Casos de uso

- Automatización de picking y placement en entornos simulados: el modelo puede controlar un brazo robótico para recoger objetos específicos (en este caso, un tubo médico) y colocarlos en una ubicación determinada, lo que resulta útil para probar algoritmos de manipulación en simulación antes de transferirlos a entornos reales.
- Investigación en aprendizaje por imitación con transformers de difusión: al estar implementado con LeRobot y ser de código abierto, sirve como referencia para estudiar el comportamiento de políticas DiT en tareas de manipulación, comparando con otras arquitecturas como Diffusion Policy clásica o ACT.
- Desarrollo de sistemas de control robótico basados en visión: el modelo demuestra cómo integrar múltiples cámaras y estado del robot en una política unificada, lo que puede aplicarse a otros robots con configuraciones de sensores similares.
- Prototipado rápido en robótica asistida por simulación: dado que el entrenamiento se realizó en simulación con un dataset pequeño, el modelo puede utilizarse como punto de partida para validar enfoques de aprendizaje por refuerzo o imitación antes de escalar a datasets mayores.
- Benchmarking de políticas robóticas en entornos controlados: aunque no se han publicado resultados de evaluación, el modelo puede servir como baseline para comparar el rendimiento de otras políticas en la misma tarea o en tareas similares del benchmark de LeRobot.
- Educación y formación en robótica con IA: al ser un ejemplo completo de entrenamiento y despliegue con LeRobot, es un recurso didáctico para aprender a configurar pipelines de aprendizaje por imitación con transformers de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "No evaluation results have been provided for this policy yet". No existen datos de tasas de éxito, ni comparaciones con otros modelos en la tarea concreta.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU específicas en la documentación del modelo.
- Dado el tamaño del modelo (≈248 millones de parámetros), se estima que la inferencia puede ejecutarse en GPUs de consumo con al menos 8 GB de VRAM en FP32, y menos si se aplica cuantización (aunque no se ofrecen pesos cuantizados).
- El entrenamiento se realizó presumiblemente en una GPU de gama alta (como A100 o RTX 4090) con 30.000 pasos y batch de 16, aunque no se detalla el hardware utilizado.
- El despliegue se realiza mediante las herramientas de LeRobot (por ejemplo, `lerobot-rollout`), que requieren PyTorch con soporte CUDA y las dependencias de la librería.
- Se recomienda una GPU NVIDIA con al menos 8 GB de VRAM para ejecutar el rollout en tiempo real con dos cámaras a 30 FPS.
- No se mencionan opciones de despliegue en CPU, vLLM, llama.cpp u otros motores de inferencia, ya que el modelo está diseñado para el pipeline de robótica de LeRobot.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo concreto. Sin embargo, se puede contextualizar con otras políticas robóticas de aprendizaje por imitación:

| Modelo | Arquitectura | Parámetros | Contexto | Licencia |
|---|---|---|---|---|
| `multitask-dit-frazier-sim-v3` | Diffusion Transformer | ~248M | No aplica (robótica) | Apache-2.0 |
| Diffusion Policy (Chi et al., 2023) | U-Net con difusión | ~100M-500M (según variante) | No aplica | MIT (implementación de referencia) |
| ACT (Action Chunking with Transformers, Zhao et al., 2023) | Transformer encoder-decoder | ~100M-200M | No aplica | MIT (implementación de referencia) |

La comparación es cualitativa porque no existen resultados de evaluación comunes publicados. El modelo aquí descrito se distingue por su uso de un transformer de difusión con condicionamiento multimodal, mientras que Diffusion Policy clásica usa CNNs y ACT usa transformers con chunking de acciones. La elección entre estos modelos dependerá de la tarea, la disponibilidad de datos y la infraestructura de hardware.

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente en una única tarea de simulación ("Pick up the Frazier Suction Tube and place it in the blue basket") con un dataset muy reducido (40 episodios). No se ha demostrado generalización a otras tareas o a entornos reales.
- No se han proporcionado resultados de evaluación en el robot real; la model card indica explícitamente que no hay resultados de evaluación. El rendimiento en condiciones reales es desconocido.
- El dataset de entrenamiento proviene de simulación, por lo que puede existir una brecha de realidad (sim-to-real) significativa si se intenta desplegar en un robot físico.
- Al ser un modelo denso de ~248M parámetros, la inferencia en tiempo real requiere una GPU con suficiente VRAM; no se ofrecen versiones cuantizadas para entornos con recursos limitados.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin soporte oficial.
- El modelo depende de la configuración de cámaras especificada (`gripper` y `side`). Si se utilizan otras cámaras o ángulos, el rendimiento puede degradarse.
- No se han documentado sesgos específicos, pero al ser un modelo de robótica entrenado en simulación, puede presentar comportamientos inseguros si se usa sin supervisión en entornos reales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/seriintan/multitask-dit-frazier-sim-v3)
- [Dataset de entrenamiento](https://huggingface.co/datasets/seriintan/frazier_sim_v3)
- [Paper Multi-Task Diffusion Transformer (arXiv:2507.05331)](https://arxiv.org/abs/2507.05331)
- [Implementación de referencia de Multi-Task DiT Policy (GitHub)](https://github.com/brysonjones/multitask_dit_policy)
- [Guía de LeRobot para Multi-Task DiT](https://huggingface.co/docs/lerobot/main/en/multi_task_dit)
- [Documentación general de LeRobot](https://huggingface.co/docs/lerobot/index)
