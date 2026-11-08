# asomegs/act_sim_pick_cube

## Resumen

`asomegs/act_sim_pick_cube` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario asomegs y publicado en Hugging Face Hub mediante la librería LeRobot de Hugging Face. Resuelve una tarea concreta de manipulación robótica: recoger un cubo (`pick_cube`) en un entorno simulado, a partir de observaciones visuales de dos cámaras (frontal y de muñeca) y un vector de estado de 18 dimensiones.

El modelo es de tamaño reducido (51,6 millones de parámetros) y está empaquetado en formato safetensors con un tamaño de repositorio de 0,2 GB. No es un modelo de lenguaje: es una política visuomotora que mapea observaciones a acciones de 4 dimensiones. Su relevancia es la de un ejemplo reproducible de entrenamiento de políticas ACT con LeRobot, útil para desarrolladores que quieran replicar el flujo de trabajo de aprendizaje por imitación en robótica.

La información disponible es escasa: no hay licencia declarada, no se han publicado resultados de evaluación y el conjunto de datos de entrenamiento es muy pequeño (27 episodios, 1017 fotogramas a 10 FPS). Esto condiciona su uso a experimentación y prototipado, no a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.586.692 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de una sola acción por paso. La arquitectura combina un codificador visual para las imágenes de las cámaras `front` y `wrist` (ambas de 3×128×128 píxeles), un vector de estado de 18 dimensiones y un transformer que genera acciones de 4 dimensiones. El modelo consume dos flujos visuales y el estado proprioceptivo, y produce comandos de control.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `asomegs/sim_pick_cube_kb`, compuesto por 27 episodios y 1017 fotogramas a 10 FPS, con la tarea "pick_cube". La configuración reportada incluye 20 000 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000. No se especifica el número de tokens de entrenamiento (no aplica) ni si hubo RLHF o DPO (no es un modelo de lenguaje). La innovación principal es el propio mecanismo de action chunking, que reduce el error de acumulación en tareas de manipulación.

## Capacidades

- Control visuomotor para manipulación robótica: recoger un cubo a partir de imágenes de dos cámaras y estado proprioceptivo.
- Aprendizaje por imitación a partir de datos de teleoperación.
- Predicción de secuencias de acciones (action chunks) de 4 dimensiones.
- Procesamiento multimodal de entrada: dos cámaras RGB (frontal y de muñeca) más vector de estado.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Prototipado de políticas de manipulación en simulación: el modelo sirve como punto de partida para entrenar y evaluar ACT en tareas de pick-and-place dentro de entornos simulados, gracias a su reducido tamaño y a la integración con LeRobot.
- Reproducción de experimentos de aprendizaje por imitación: investigadores pueden replicar el pipeline de entrenamiento (20 000 pasos, batch 8, AdamW) y comparar con sus propios datasets.
- Docencia y formación en robótica: el modelo es un ejemplo compacto (51,6 M de parámetros, 0,2 GB) para enseñar el flujo completo de LeRobot, desde la grabación de datos hasta el despliegue con `lerobot-rollout`.
- Pruebas de integración de hardware: permite validar la configuración de cámaras (`front`, `wrist`) y el robot antes de entrenar políticas más complejas, usando la tarea "pick_cube" como banco de pruebas.
- Generación de datos sintéticos y aumento de datasets: al ser una política entrenada en simulación, puede usarse para generar trayectorias adicionales que alimenten otros entrenamientos.
- Evaluación de robustez frente a variaciones de iluminación, posición de objetos o distracciones: el modelo permite medir la degradación de una política ACT ante cambios en el entorno simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,6 M de parámetros, 0,2 GB en safetensors), es probable que quepa en GPUs consumer con pocos GB de VRAM, aunque no se confirma en la información.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que sugiere GPU NVIDIA, pero no se especifica modelo.
- ¿Cabe en GPU consumer? No confirmado; el tamaño reducido lo hace plausible, pero no hay dato oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con integración en el ecosistema Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asomegs/act_sim_pick_cube | 51,6 M | no aplica | pick_cube (sim) | no disponible | Hugging Face |
| Aneysait/act_pick_cube | no disponible | no aplica | pick_cube | no disponible | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable | no aplica | manipulación | según repo | Hugging Face |

La comparación con alternativas es limitada: no se dispone de datos de rendimiento de ninguno de los modelos citados, y las políticas ACT son específicas de tarea, por lo que la comparación directa carece de sentido sin evaluaciones homogéneas.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay evidencia de tasa de éxito en la tarea `pick_cube`.
- Dataset de entrenamiento muy pequeño (27 episodios, 1017 fotogramas), lo que limita la generalización y aumenta el riesgo de sobreajuste.
- Entrenado en simulación: el transfer a un robot real no está validado y puede requerir ajuste fino o domain randomization.
- Licencia no especificada: no se puede garantizar el uso comercial; es necesario contactar con el autor.
- Sin información sobre sesgos: al ser una política de robótica, los sesgos se manifiestan como sesgos de comportamiento (posiciones, objetos, iluminación del dataset), no como sesgos sociales.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí existe riesgo de acciones erróneas o inseguras en el robot.
- Dependencia de la configuración exacta de cámaras (`front`, `wrist`) y del formato de estado (18 dimensiones); cambios en el hardware requieren reentrenamiento.
- No es un modelo de lenguaje: no soporta texto, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asomegs/act_sim_pick_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/asomegs/sim_pick_cube_kb
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=asomegs/sim_pick_cube_kb
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Modelo similar: https://huggingface.co/Aneysait/act_pick_cube
