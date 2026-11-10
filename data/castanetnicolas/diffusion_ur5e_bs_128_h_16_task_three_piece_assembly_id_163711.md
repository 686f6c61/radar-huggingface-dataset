# castanetnicolas/diffusion_UR5e_BS_128_H_16_TASK_three_piece_assembly_ID_163711

## Resumen

`castanetnicolas/diffusion_UR5e_BS_128_H_16_TASK_three_piece_assembly_ID_163711` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy y distribuida a través del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robótica que mapea observaciones (estado de las articulaciones y dos cámaras RGB) a trayectorias de acción de 7 dimensiones, tratando el control como un proceso generativo de difusión. El autor es el usuario `castanetnicolas` y la licencia es Apache 2.0.

El modelo resuelve una tarea concreta de ensamblaje de tres piezas ("Insert the first piece into the base, then insert the second piece on top of it") sobre un robot tipo Panda, con datos derivados del benchmark MimicGen. Su relevancia es acotada: se trata de un artefacto de investigación reproducible, con 89,3 millones de parámetros y un repositorio de 0,4 GB, útil para estudiar el comportamiento de Diffusion Policy en manipulación con contacto rico, no como componente de propósito general.

La ficha se centra en sus especificaciones reales (entradas de 9 dimensiones de estado y dos imágenes de 84×84, salida de 7 dimensiones), su configuración de entrenamiento (200 000 pasos, batch 128, Adam, LR 1e-4) y sus limitaciones prácticas, dado que no se han publicado resultados de evaluación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (control visuomotor generativo basado en difusión, sobre LeRobot 0.6.1) |
| Parámetros totales | 89 331 435 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación de estado `(9,)` y dos imágenes `(3, 84, 84)`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

Diffusion Policy formula el control visuomotor como un proceso de difusión generativa: en lugar de predecir una acción única, el modelo genera una secuencia de acciones (horizonte `H=16` según el identificador del repositorio) mediante un proceso iterativo de denoising, lo que produce trayectorias suaves y multimodales adecuadas para manipulación con contacto rico. La entrada combina un vector de estado de 9 dimensiones con dos flujos visuales de 84×84 píxeles (`agentview` y `robot0_eye_in_hand`), y la salida es un vector de acción de 7 dimensiones (típicamente 6 DoF más pinza).

El entrenamiento se realizó sobre el dataset `castanetnicolas/mimicgen_three_piece_assembly_d1_image84`, con 200 episodios, 67 101 fotogramas a 20 FPS, durante 200 000 pasos con batch size 128, optimizador Adam, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.1. No se especifica en la información disponible el número de tokens ni si hubo RLHF o DPO (no aplica a este tipo de modelo); tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de trayectorias de acción de 7 dimensiones para control robótico de manipulación.
- Percepción visual multimodal a partir de dos cámaras (vista externa `agentview` y vista de muñeca `robot0_eye_in_hand`) a 84×84 píxeles.
- Fusión de estado propioceptivo de 9 dimensiones con observaciones visuales.
- Ejecución de una tarea de ensamblaje de tres piezas con inserción secuencial.
- Generación de acciones multimodales y suaves gracias al proceso de difusión.
- No soporta tool calling, function calling, agentes multi-step ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión de propósito general, audio ni otras capacidades fuera del control visuomotor.

## Casos de uso

- Investigación en imitation learning: servir como referencia reproducible de Diffusion Policy entrenada con LeRobot para comparar variantes de arquitectura o hiperparámetros en una tarea de ensamblaje concreto.
- Benchmark de manipulación con contacto rico: evaluar la robustez de políticas de difusión en tareas de inserción de precisión, donde los métodos deterministas suelen fallar por multimodalidad.
- Reproducción de experimentos MimicGen: utilizar el dataset y la política como base para estudiar generalización a variaciones de posición de objetos o condiciones de iluminación.
- Docencia y formación en robótica: ejemplo práctico de pipeline completo (grabación de datos, entrenamiento, despliegue con `lerobot-rollout`) sobre un robot Panda.
- Desarrollo de sistemas teleoperados asistidos: integrar la política como capa de asistencia en ensamblaje de piezas, con supervisión humana.
- Prototipado de control visuomotor de bajo coste: con 89,3 M de parámetros y 0,4 GB de pesos, es viable ejecutarlo en hardware modesto para pruebas de laboratorio.
- Base para fine-tuning en tareas de ensamblaje similares: reentrenar sobre nuevos datasets manteniendo la configuración de difusión y el esquema de observaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 89,3 M de parámetros y pesos en safetensors (0,4 GB de repositorio), la huella en memoria es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060/4060 o superior es suficiente para inferencia, y se recomienda CUDA para entrenamiento según la configuración de LeRobot (`--policy.device=cuda`).
- Cabe en GPU de consumo: sí, por el tamaño del modelo (89,3 M de parámetros).
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento); no se documentan soportes para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion_UR5e_BS_128_H_16_TASK_three_piece_assembly_ID_163711 | 89,3 M | Estado `(9,)` + 2 imágenes `(3, 84, 84)` | Ensamblaje de tres piezas (Panda) | Apache 2.0 | Hugging Face (LeRobot) |
| Otras políticas Diffusion Policy en LeRobot | no disponible | no disponible | Manipulación diversa | Apache 2.0 (típico) | Hugging Face |
| Políticas ACT en LeRobot | no disponible | no disponible | Manipulación diversa | Apache 2.0 (típico) | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: se desconoce la tasa de éxito real de la política.
- Entrenada para una única tarea y un único tipo de robot (Panda); no es generalizable a otras tareas sin reentrenamiento.
- Requiere que las cámaras y el puerto del robot se configuren manualmente y que los nombres de cámara coincidan con las claves de observación (`agentview`, `robot0_eye_in_hand`).
- Depende de la distribución de los datos de entrenamiento (MimicGen, 200 episodios); cambios en posiciones de objetos, iluminación o distractores pueden degradar el rendimiento.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erráticas o inseguras en entornos reales; se recomienda supervisión humana.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y garantías hace desaconsejable su uso en producción sin validación previa.
- Limitaciones de idioma: no aplica (modelo no lingüístico).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_128_H_16_TASK_three_piece_assembly_ID_163711)
- [Dataset de entrenamiento](https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84)
- [Paper de Diffusion Policy (arXiv:2303.04137)](https://huggingface.co/papers/2303.04137)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Grabación de datos y entrenamiento de políticas](https://huggingface.co/docs/lerobot/en/il_robots)
- [Cheat-sheet de CLI de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de inferencia (rollout)](https://huggingface.co/docs/lerobot/main/en/inference)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84)
