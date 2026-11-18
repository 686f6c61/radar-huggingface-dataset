# biecH/act_ultimate_750_170_steps_12k

## Resumen

`act_ultimate_750_170_steps_12k` es una política robótica basada en ACT (Action Chunking Transformer) entrenada con la librería LeRobot de Hugging Face. La desarrolla el usuario biecH y está orientada al control de un brazo robótico SO-101 en tareas de pick-and-place. No es un modelo de lenguaje: es un checkpoint de imitación que mapea observaciones visuales y de estado del robot a secuencias de acciones motoras.

El modelo se entrena a partir de una fusión local de dos conjuntos de datos: 750 episodios limpios de pick-and-place (`biecH/ultimate_750_dataset`) y 170 episodios de recuperación dirigida (`biecH/ultimate_170_targetted_recovery`), sumando aproximadamente 252.820 fotogramas. El checkpoint publicado corresponde al paso 12.000 de una ejecución planificada de 20.000 pasos, lo que equivale a unas 0,38 épocas con batch 8.

Su relevancia es acotada: se trata de un artefacto experimental de robótica de imitación, sin evaluación publicada y con 0 descargas, útil como referencia para quienes trabajan con LeRobot y el brazo SO-101, pero no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), LeRobot |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; chunk_size de 100 acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo robótico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que predice *chunks* de acciones en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza el control. En esta configuración se usa `chunk_size = 100` y `n_action_steps = 100`, es decir, el modelo genera bloques de 100 acciones por inferencia. El entrenamiento emplea AdamW con learning rate constante de 1e-5, weight decay 1e-4, grad clip 10 y semilla 1000, siguiendo el preset de ACT en LeRobot.

Los datos provienen de una fusión local de dos datasets (no publicada como tal en Hugging Face): 750 episodios limpios y 170 episodios de recuperación dirigida, con un total aproximado de 252.820 fotogramas. El checkpoint es el paso 12.000 de 20.000, con `save_freq` de 1.000 y batch 8, lo que supone unas 0,38 épocas (aproximadamente 31,6k pasos por época). No se documenta aumento de datos, RLHF ni técnicas de decodificación especulativa.

## Capacidades

- Control motor de un brazo SO-101 para tareas de pick-and-place mediante imitación.
- Predicción de secuencias de acciones en bloques de 100 pasos.
- Procesamiento de observaciones visuales y de estado del robot (propio de ACT en LeRobot).
- Recuperación ante situaciones de error, gracias a los 170 episodios de recuperación dirigida del dataset.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en imitación robótica: servir como punto de partida para reproducir experimentos con ACT y SO-101 en LeRobot, comparando checkpoints intermedios.
- Automatización de pick-and-place en laboratorio: el modelo ejecuta agarre y colocación de objetos sobre el brazo SO-101 tras un entrenamiento con 750 episodios limpios.
- Estudio de recuperación ante fallos: los 170 episodios de recuperación dirigida permiten analizar cómo la política se recupera de agarres fallidos o posiciones incorrectas.
- Benchmark interno de políticas ACT: útil como referencia base para medir mejoras al añadir datos o ajustar hiperparámetros.
- Docencia en robótica de imitación: ejemplo práctico de entrenamiento con LeRobot, configuración de ACT y gestión de datasets fusionados.
- Reentrenamiento y fine-tuning: al ser un checkpoint intermedio (paso 12.000 de 20.000), puede servir para continuar el entrenamiento o ajustar con datos adicionales del mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "Result: not evaluated yet".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 51,7 M de parámetros, el modelo es muy pequeño y cabría en GPUs de consumo, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible. Por tamaño, una RTX 3060 o superior sería suficiente, aunque no está confirmado por el autor.
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido número de parámetros, pero sin datos oficiales.
- Opciones de despliegue: LeRobot (librería nativa); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_ultimate_750_170_steps_12k | 51,7 M | no aplica | Pick-and-place SO-101 (ACT) | no disponible | Hugging Face |
| Otros checkpoints ACT en LeRobot | variable | no aplica | Imitación robótica | variable | Hugging Face |
| Políticas Diffusion Policy | variable | no aplica | Imitación robótica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin evaluar: la model card confirma que no se ha realizado ninguna evaluación, por lo que se desconoce su tasa de éxito real.
- Entrenamiento incompleto: es el paso 12.000 de 20.000, aproximadamente 0,38 épocas, lo que sugiere que el modelo aún no ha convergido.
- Especialización estrecha: entrenado únicamente para pick-and-place con el brazo SO-101; no generaliza a otras tareas ni robots.
- Licencia no disponible: no se especifican términos de uso comercial, lo que impide su adopción en producción sin aclaración previa.
- Dataset de entrenamiento no publicado como fusión: el `train_config` apunta a una ruta local (`local/merged_so101_pickplace_full_v1_so101_pickplace_targeted_rec_v1`), lo que dificulta la reproducibilidad exacta.
- Riesgo de sobreajuste a las condiciones de captura de los episodios originales (iluminación, posición de cámara, objetos concretos).
- Sin garantías de robustez ante variaciones del entorno no vistas durante el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/biecH/act_ultimate_750_170_steps_12k
- Dataset de episodios limpios: https://huggingface.co/datasets/biecH/ultimate_750_dataset
- Dataset de recuperación dirigida: https://huggingface.co/datasets/biecH/ultimate_170_targetted_recovery
- LeRobot (librería): https://github.com/huggingface/lerobot
