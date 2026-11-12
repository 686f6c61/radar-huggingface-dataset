# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop68_ID_q4_164916

## Resumen

`castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop68_ID_q4_164916` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy (paper arXiv:2303.04137) y distribuida a través del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robótica que trata el control motor como un proceso generativo de difusión, produciendo trayectorias de acción suaves y multimodales especialmente adecuadas para tareas de manipulación con contacto rico (ensamblaje, inserción de piezas).

El modelo ha sido entrenado sobre el dataset `mimicgen_three_piece_assembly_d1_image84`, compuesto por 200 episodios y 67.101 fotogramas a 20 FPS, para la tarea "Insert the first piece into the base, then insert the second piece on top of it". Consume el estado del robot (9 dimensiones) y dos cámaras (`agentview` y `robot0_eye_in_hand`, ambas a 84x84 píxeles) y emite un vector de acción de 7 dimensiones. Pese al nombre del repositorio, la model card declara el tipo de robot como `panda` (Franka Emika Panda), aunque el identificador menciona `UR5e`.

Su relevancia radica en ser un ejemplo reproducible de entrenamiento de políticas de imitación con LeRobot 0.6.1 y en la disponibilidad de la receta completa (dataset, hiperparámetros y comandos de despliegue). No obstante, es un modelo de nicho: cero descargas, cero likes y sin resultados de evaluación publicados, lo que limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (control visuomotor generativo basado en difusión) |
| Parametros totales | 278.014.699 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (política de control; observaciones de 84x84 px por cámara y estado de 9 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

Diffusion Policy formula el control visuomotor como un proceso de difusión generativo: en lugar de predecir una única acción de forma determinista, el modelo aprende a generar secuencias de acciones (chunks) mediante un proceso iterativo de eliminación de ruido condicionado en las observaciones. Esto permite capturar distribuciones multimodales de acciones y produce trayectorias suaves, lo que resulta ventajoso en tareas de ensamblaje con contacto físico, donde múltiples estrategias pueden ser válidas.

Los detalles concretos de la red (número de pasos de difusión, horizonte de predicción, backbone visual) no se detallan en la información disponible. El entrenamiento se realizó durante 300.000 pasos con batch size 32, optimizador Adam, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.1. El dataset de entrenamiento contiene 200 episodios (67.101 fotogramas a 20 FPS) generados con MimicGen para la tarea de ensamblaje de tres piezas. No se documenta el uso de RLHF, DPO ni otras fases de ajuste posteriores, algo esperable en políticas de imitación.

## Capacidades

- Generación de trayectorias de acción de 7 dimensiones a partir de observaciones visuales (dos cámaras de 84x84) y del estado del robot (9 dimensiones).
- Manipulación robótica con contacto rico: inserción de piezas en una base y apilado de una segunda pieza sobre la primera.
- Control visuomotor multimodal: la formulación de difusión permite representar múltiples modos de acción válidos para una misma observación.
- Ejecución autónoma en robots Franka Panda (según model card) mediante `lerobot-rollout`.
- No soporta tool calling, function calling, agentes de texto, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Ensamblaje automatizado de piezas en línea de producción: la política ejecuta la secuencia "insertar primera pieza en la base, insertar segunda pieza encima" de forma autónoma, aprovechando la formulación de difusión para generar trayectorias suaves en tareas con contacto.
- Investigación en imitation learning: sirve como baseline reproducible para comparar variantes de Diffusion Policy, ya que se publican dataset, hiperparámetros y comandos de entrenamiento.
- Evaluación de pipelines LeRobot: útil para validar la integración de `lerobot-rollout` y `lerobot-train` con robots Panda y cámaras OpenCV en entornos de laboratorio.
- Generación de datos sintéticos con MimicGen: el dataset asociado puede reutilizarse para aumentar la diversidad de demostraciones en tareas de ensamblaje similares.
- Prototipado de células de montaje en investigación académica: permite desplegar una política entrenada en un banco de pruebas con robot Panda y dos cámaras sin necesidad de reentrenar desde cero.
- Estudio de robustez visuomotora: al estar entrenada solo con 200 episodios a 84x84, es un caso útil para analizar sensibilidad a cambios de iluminación, posiciones de objetos y distractores (aunque no se han publicado evaluaciones al respecto).
- Docencia en robótica de manipulación: ejemplo completo de flujo end-to-end (dataset, entrenamiento, despliegue) para cursos prácticos con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 M parámetros en safetensors y un repo de 1,1 GB, la inferencia en fp32 requiere del orden de 1,1 GB solo para pesos, más overhead de activaciones y del proceso de difusión (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con al menos 4-8 GB de VRAM debería poder ejecutar la política; una RTX 3060/4060 o superior es un punto de partida razonable.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del modelo (no confirmado oficialmente).
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La política opera a la frecuencia del dataset (20 FPS) y el bucle de control debe sostener ese ritmo, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (diffusion, three_piece_assembly) | 278 M | Estado (9,) + 2 imagenes 84x84 | Ensamblaje de tres piezas (Panda) | apache-2.0 | Hugging Face, 0 descargas |
| ACT (Action Chunking Transformer) en LeRobot | no disponible | Depende de configuracion | Politicas de imitacion generales | apache-2.0 (LeRobot) | Hub de LeRobot |
| Diffusion Policy original (Chi et al., 2023) | no disponible | Configurable | Manipulacion visuomotora | codigo abierto (ver paper) | GitHub del paper |
| Otras politicas LeRobot del mismo autor | no disponible | no disponible | Distintas tareas MimicGen | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones reales: se desconoce la tasa de éxito de la política en el robot.
- Entrenada únicamente para una tarea concreta ("insertar primera pieza en la base, insertar segunda pieza encima"); no generaliza a otras tareas sin reentrenamiento.
- Dataset reducido (200 episodios, 67.101 fotogramas) y resolución baja (84x84), lo que probablemente limita la robustez ante cambios de iluminación, fondo, posiciones o distractores.
- Posible inconsistencia entre el nombre del repositorio (`UR5e`) y la model card (`panda`): conviene verificar el robot real antes de desplegar.
- Requiere que los nombres e índices de cámara coincidan exactamente con las claves de observación (`agentview`, `robot0_eye_in_hand`).
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo esperable en políticas de imitación.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de evaluación y el dominio tan específico desaconsejan su uso en producción sin validación previa.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- El repositorio tiene fecha de creación futura (2026-11-12) según los metadatos, lo que puede indicar un error de registro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop68_ID_q4_164916
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
