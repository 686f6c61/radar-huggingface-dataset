# knight7024/act_pick_and_place_hair_roll_final_chunk100

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `knight7024/act_pick_and_place_hair_roll_final_chunk100`, es una política entrenada con LeRobot sobre un robot SO-100 (tipo `so_follower`) para la tarea de recoger y colocar un rulo de pelo, con dos cámaras (vista superior y muñeca) y un espacio de acciones de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real en hardware de consumo. Se distribuye en formato safetensors y se ejecuta mediante la librería `lerobot` con el comando `lerobot-rollout`. Es relevante como ejemplo reproducible de entrenamiento de políticas visuomotoras con datos teleoperados de bajo coste (60 episodios, 43.285 frames a 30 FPS).

La ficha describe una política específica de un solo task, no un modelo de lenguaje general: no procesa texto libre ni tiene capacidades conversacionales. Su valor está en servir como referencia para quien entrene sus propias políticas ACT con LeRobot y quiera comparar configuraciones (chunk size 100, 100.000 pasos, batch size 1).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de imágenes + estado) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un backbone visual (codificador de imágenes) con un transformer que, a partir de las observaciones (estado del robot de 6 dimensiones y dos imágenes RGB de 3×240×320), predice un chunk de 100 acciones de 6 dimensiones. La innovación central del método es la predicción de chunks con una componente de estilo CVAE: durante el entrenamiento se modela la variabilidad de las demostraciones humanas mediante una variable latente, y en inferencia se usa la media para producir trayectorias suaves y deterministas. Esto reduce el error compounding típico de las políticas que predicen un paso por vez.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `knight7024/pick_and_place_hair_roll_final`: 60 episodios, 43.285 frames a 30 FPS, tarea única "pick_and_place_hair_roll_final". Configuración: 100.000 pasos, batch size 1, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta composición del dataset más allá del número de episodios ni si hubo aumento de datos, RLHF o DPO (no aplica en aprendizaje por imitación supervisado).

## Capacidades

- Manipulación robótica visuomotora: recoger y colocar un objeto (rulo de pelo) a partir de dos vistas de cámara.
- Predicción de chunks de acción de 100 pasos con salida de 6 dimensiones (típicamente posición articular o cartesiana del efector).
- Fusión multimodal de estado propioceptivo (6 valores) e imágenes (superior y de muñeca).
- Ejecución en tiempo real sobre robot SO-100 mediante `lerobot-rollout`.
- Entrenamiento y reentrenamiento reproducibles con `lerobot-train` y el dataset asociado.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea de recoger y colocar el rulo con las dos cámaras configuradas, adecuada para prototipos de manipulación con robot SO-100 de bajo coste.
- Base para fine-tuning en tareas similares: al estar entrenada con LeRobot, se puede reutilizar como inicialización y reentrenar con un dataset propio de otra tarea de manipulación, reduciendo pasos de entrenamiento.
- Evaluación de configuraciones de chunk size: el nombre del repositorio indica chunk 100; sirve como referencia para comparar con políticas de chunk 50 o 20 en la misma tarea.
- Docencia y formación en aprendizaje por imitación: ejemplo completo y reproducible (dataset, configuración, comando de rollout) para cursos de robótica con LeRobot.
- Benchmark interno de infraestructura de inferencia: con 51,7 M de parámetros y 0,2 GB, permite medir latencia y throughput de políticas ACT en GPUs de consumo antes de escalar a modelos mayores.
- Pruebas de integración de pipelines de datos teleoperados: el dataset de 60 episodios y 43.285 frames sirve para validar herramientas de visualización, conversión y entrenamiento de LeRobot.
- Validación de hardware y calibración: ejecutar la política en un SO-100 real permite verificar cámaras, puertos y calibración antes de entrenar políticas nuevas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de éxito vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión de entrenamiento (51,7 M de parámetros); el cuello de botella es el procesamiento de dos imágenes de 240×320 a 30 FPS, no el tamaño del modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. También es viable en CPU para pruebas de baja frecuencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo, e incluso en placas integradas para inferencia a baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` (comando oficial), librería `lerobot` en Python; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen de la GPU, de la resolución de las cámaras y del bucle de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| knight7024/act_pick_and_place_hair_roll_final_chunk100 | 51,7 M | ACT (LeRobot) | chunk 100 | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | no disponible | ACT | configurable | Apache 2.0 | Hugging Face / docs |
| Diffusion Policy (referencia del estado del arte en imitación) | no disponible | diffusion | no disponible | no disponible | papers / repos |
| Políticas VLA tipo RT-2 / OpenVLA | miles de millones | VLA | no disponible | no disponible | investigación |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; las filas de Diffusion Policy y VLA se incluyen solo como categorías de referencia, sin datos de rendimiento verificados en esta ficha.

## Limitaciones y advertencias

- Política de tarea única: solo está entrenada para "pick_and_place_hair_roll_final"; no generaliza a otras tareas, objetos ni posiciones sin reentrenamiento.
- Sin evaluación publicada: la model card no reporta tasa de éxito en robot real, por lo que no hay evidencia cuantitativa de robustez.
- Dataset pequeño: 60 episodios y 43.285 frames; riesgo de sobreajuste a posiciones, iluminación y fondo concretos del entorno de grabación.
- Dependencia de hardware específico: requiere robot tipo `so_follower` y dos cámaras con los nombres `top` y `wrist`; cambiar la configuración invalida la política.
- Sensibilidad a calibración y a cambios de cámara: variaciones en montaje, iluminación o resolución pueden degradar el rendimiento.
- Sin capacidades de lenguaje ni razonamiento simbólico: no debe usarse como modelo de texto ni en pipelines de agentes conversacionales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo en producción.
- Riesgo de alucinación en el sentido robótico: puede generar trayectorias plausibles pero incorrectas ante observaciones fuera de distribución, sin mecanismo de verificación interno.
- Idiomas: no aplica; no hay soporte multilingüe que evaluar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knight7024/act_pick_and_place_hair_roll_final_chunk100
- Dataset de entrenamiento: https://huggingface.co/datasets/knight7024/pick_and_place_hair_roll_final
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=knight7024/pick_and_place_hair_roll_final
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
