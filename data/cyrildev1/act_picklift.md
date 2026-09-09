# cyrildev1/act_picklift

## Resumen

ACT PickLift es un modelo de política robótica basado en Action Chunking with Transformers (ACT), entrenado con la librería LeRobot de Hugging Face. Desarrollado por el autor cyrildev1, está diseñado para aprender tareas de manipulación por imitación a partir de datos teleoperados. Concretamente, este checkpoint ha sido entrenado para la tarea de recoger un cubo rojo en el entorno de simulación MuJoCo PickLift, usando el dataset johnsutor/MuJoCoPickLift-v1. El modelo cuenta con 51.684.998 parámetros y deja disponibles sus pesos en formato safetensors bajo licencia Apache 2.0. A diferencia de los modelos de lenguaje, esta política consume imágenes de dos cámaras (muñeca y vista aérea) junto con el estado del robot para producir acciones de control de 6 dimensiones. Es relevante porque ofrece un ejemplo reproducible de entrenamiento de políticas ACT con datos reducidos (solo 10 episodios y 3.498 fotogramas), útil para investigación en aprendizaje por imitación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.684.998 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT propuesta en el paper arxiv:2304.13705. Se trata de un transformador de aprendizaje por imitación que predice acciones por bloques (action chunking), lo que permite reducir el error compuesto frente a la predicción paso a paso. En esta implementación de LeRobot, el transformador codifica las observaciones (estado del robot, estado del entorno y dos vistas de cámara) y decodifica una secuencia de acciones. El entrenamiento se realizó durante 20.000 pasos con batch size 4, optimizador AdamW y tasa de aprendizaje 1e-5, usando el dataset johnsutor/MuJoCoPickLift-v1 compuesto por 10 episodios (3.498 fotogramas a 30 FPS). No se ha aplicado RLHF ni DPO; el método se basa exclusivamente en imitación supervisada.

## Capacidades

- Genera acciones de control de 6 dimensiones para el robot tipo SO101.
- Procesa entradas multimodales: estado del robot (6 valores), imagen de cámara de muñeca (3x480x640), imagen de cámara aérea (3x480x640) y estado del entorno (30 valores).
- Ejecuta la tarea específica "Pick up the red cube" en simulación MuJoCo.
- Soporta inferencia en tiempo real mediante LeRobot (comando lerobot-rollout).
- No es un modelo de lenguaje; no ofrece generación de texto, tool calling ni funciones multilingües.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como baseline de ACT con pocos datos para comparar con otros métodos en el entorno MuJoCoPickLift-v1.
- Prototipado de control robótico: permite probar la integración de LeRobot con un robot SO101 real o simulado, mediante el comando lerobot-rollout.
- Benchmark de tiempo real: al ser un modelo pequeño (51,7 millones de parámetros), se puede evaluar la latencia de control en GPUs de consumo y optimizar el pipeline de inferencia.
- Desarrollo de pipelines de visión basada en cámaras: demuestra el uso simultáneo de la vista de muñeca y la vista aérea para tareas de manipulación.
- Educación: ejemplo práctico de cómo entrenar una política de imitación con LeRobot paso a paso, desde el dataset hasta el despliegue.
- Transferencia a tareas similares: partiendo de este checkpoint se puede realizar fine-tuning para variaciones de pick-and-place en entornos MuJoCo con pocas modificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica que no se han proporcionado resultados de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 200 MB en FP32, por lo que se puede ejecutar con menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU CUDA con al menos 2 GB (RTX 2060, RTX 3050, T4) para inferencia en tiempo real.
- Compatibilidad: también puede ejecutarse en CPU para pruebas unitarias, aunque no garantiza tiempo real.
- Opciones de despliegue: LeRobot (rollingout), PyTorch directo, o scripts personalizados.
- Latencia: no disponible, pero al tener 51,7 millones de parámetros y dos imágenes de 480x640, se espera una latencia baja en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyrildev1/act_picklift | 51.684.998 | No disponible | No disponible | Apache 2.0 | HuggingFace |
| adimunot/act-so101-pick-lift | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| W1ndrunn3rr/act_pick_and_lift_v2 | No disponible | No disponible | No disponible | No disponible | HuggingFace |

Los dos modelos alternativos encontrados en HuggingFace son también políticas ACT orientadas a tareas similares de pick-and-lift en MuJoCo, pero no se dispone de datos técnicos completos para una comparación detallada.

## Limitaciones y advertencias

- Dataset muy reducido: solo 10 episodios y 3.498 fotogramas, lo que puede causar sobreajuste y baja generalización a variaciones del entorno.
- Sin datos de evaluación en robot real; el model card confirma la ausencia de resultados.
- Solo entrenado para una tarea concreta (recoger el cubo rojo) en un entorno de simulación específico.
- No es un modelo de lenguaje; no procesa texto ni instrucciones en lenguaje natural.
- Las observaciones dependen de cámaras específicas; un cambio en la posición o calibración de las cámaras reduce el rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero no existe garantía de soporte ni mantenimiento por parte del autor.

## Enlaces

- https://huggingface.co/cyrildev1/act_picklift
- Paper ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/johnsutor/MuJoCoPickLift-v1
- LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Modelo similar: https://huggingface.co/adimunot/act-so101-pick-lift
- Modelo similar: https://huggingface.co/W1ndrunn3rr/act_pick_and_lift_v2
