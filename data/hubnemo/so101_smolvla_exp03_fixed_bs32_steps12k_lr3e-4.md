# hubnemo/so101_smolvla_exp03_fixed_bs32_steps12k_lr3e-4

## Resumen

`hubnemo/so101_smolvla_exp03_fixed_bs32_steps12k_lr3e-4` es una política de visión-lenguaje-acción (VLA) ajustada mediante aprendizaje por imitación para controlar un brazo robótico SO-101 (`so101_follower`). Se trata de un adaptador sobre el modelo base `lerobot/smolvla_base`, desarrollado por el usuario `hubnemo` y entrenado con la librería LeRobot 0.7.1. El modelo resuelve una tarea concreta de manipulación: coger un cubo morado y depositarlo en una caja de cartón, ignorando el resto de objetos de la escena.

SmolVLA es una arquitectura compacta de tipo VLA presentada en el artículo arXiv:2506.01844, diseñada para ofrecer rendimiento competitivo con un coste computacional reducido y poder desplegarse en hardware de consumo. Esta ficha corresponde a un checkpoint específico (12 000 pasos, batch 32, learning rate 3e-4) entrenado sobre un dataset propio de 77 episodios y 54 777 fotogramas a 30 FPS.

El modelo es relevante como ejemplo de flujo completo de robótica de imitación reproducible con LeRobot: desde la grabación de datos hasta el despliegue en un robot real, con licencia Apache 2.0 y pesos en safetensors. No obstante, al ser un ajuste muy específico de una única tarea, su utilidad fuera de ese escenario es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacta, SmolVLA (arXiv:2506.01844) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un adaptador (fine-tune) del checkpoint `lerobot/smolvla_base`, que implementa la arquitectura SmolVLA descrita en el artículo arXiv:2506.01844. Se trata de un modelo de visión-lenguaje-acción que consume observaciones multimodales (estado del robot e imágenes de cámara) y produce comandos de acción de bajo nivel. En concreto, la política recibe `observation.state` con forma `(6,)` y `observation.images.front` con forma `(3, 480, 640)`, y emite `action` con forma `(6,)`. Está configurada para el robot `so101_follower` con una única cámara frontal.

El entrenamiento se realizó mediante imitación supervisada sobre el dataset `Orellius/so101_sort_cubes_no_top`, compuesto por 77 episodios y 54 777 fotogramas a 30 FPS, con la tarea "Grab the purple cube and put it into the cardboard box, ignore the other objects". La configuración declarada es de 12 000 pasos, batch size 32, optimizador AdamW, learning rate 0.0001 (aunque el nombre del repositorio indica 3e-4, discrepancia que conviene verificar) y semilla 1000, usando LeRobot 0.7.1. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación; es aprendizaje por imitación puro sobre demostraciones.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un brazo SO-101 a partir de imágenes y estado de las articulaciones.
- Percepción visual: procesa imágenes RGB de 480x640 de una cámara frontal.
- Ejecución de una tarea de pick-and-place específica: coger el cubo morado e introducirlo en una caja de cartón, ignorando objetos distractores.
- Integración con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable con `lerobot-train`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, generación de texto, matemáticas ni procesamiento de audio.
- No se documentan capacidades multilingües ni de instrucciones en lenguaje natural más allá de la tarea fija de entrenamiento.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de coger el cubo morado y depositarlo en una caja, adecuado para validar pipelines de imitación en un SO-101 antes de escalar a tareas más complejas.
- Prototipado rápido de políticas robóticas: sirve como referencia de un entrenamiento completo (12 000 pasos, batch 32) reproducible con LeRobot, útil para comparar hiperparámetros y datasets.
- Docencia y formación en robótica de imitación: permite a estudiantes desplegar una política VLA real sobre hardware asequible y observar el ciclo completo datos-entrenamiento-despliegue.
- Benchmark interno de datasets: al estar entrenado sobre `Orellius/so101_sort_cubes_no_top`, permite evaluar la calidad de ese dataset y de variantes del mismo con el mismo protocolo.
- Base para fine-tuning posterior: al ser un adaptador de `lerobot/smolvla_base`, puede reutilizarse como punto de partida para tareas de clasificación de objetos similares con pocos episodios adicionales.
- Pruebas de integración de LeRobot en CI: el comando `lerobot-rollout` documentado facilita incluir una comprobación de extremo a extremo en pipelines de validación de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política (`No evaluation results have been provided for this policy yet`). No se dispone de tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repo es de 0.0 GB, sin datos de parámetros).
- GPU recomendadas: no disponibles en la documentación; SmolVLA se describe como desplegable en hardware de consumo, pero no se concretan modelos.
- Compatibilidad con GPU de consumo: el artículo base indica que SmolVLA puede ejecutarse en hardware de consumo, aunque no se especifica para este checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento), con soporte de dispositivo CUDA (`--policy.device=cuda`).
- Latencia y throughput: no disponibles; el dataset de entrenamiento se grabó a 30 FPS, pero no se documenta la frecuencia de inferencia en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hubnemo/so101_smolvla_exp03_fixed_bs32_steps12k_lr3e-4` | no disponible | no disponible | Pick-and-place cubo morado en SO-101 | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible | no disponible | Política VLA base para fine-tuning | no disponible en la información | Hugging Face |
| `AndrewNoviello/so101-smolvla` | no disponible | no disponible | Política VLA para SO-101 | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento, parámetros ni contexto para establecer una comparación cuantitativa con alternativas. La comparación se limita a la relación de derivación (adaptador de `lerobot/smolvla_base`) y a la existencia de otros ajustes comunitarios para el mismo robot.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único entorno; no generaliza a otras instrucciones ni objetos.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de la cámara y del robot: requiere exactamente la configuración `so101_follower` con cámara frontal y los nombres de observación usados en el entrenamiento; cualquier cambio invalida la política.
- Dataset pequeño: 77 episodios y 54 777 fotogramas son una base limitada, lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y apariencia concretas.
- Discrepancia de hiperparámetros: el nombre del repositorio indica learning rate 3e-4, mientras que la model card declara 0.0001; conviene verificar la configuración real antes de reproducir.
- Sin información sobre sesgos, alucinación o idiomas: al ser un modelo de acción robótica, no aplican las categorías habituales de sesgo lingüístico, pero tampoco se documenta comportamiento ante escenas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales no detalladas en la información disponible.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hubnemo/so101_smolvla_exp03_fixed_bs32_steps12k_lr3e-4)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Dataset Orellius/so101_sort_cubes_no_top](https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top)
- [Artículo SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Guía SmolVLA de LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentación de inferencia de LeRobot](https://huggingface.co/docs/lerobot/main/en/inference)
- [Modelo comunitario relacionado AndrewNoviello/so101-smolvla](https://huggingface.co/AndrewNoviello/so101-smolvla)
