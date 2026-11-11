# Haku-2004/act_k5t_pred_15

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `Haku-2004/act_k5t_pred_15`, es una política entrenada con LeRobot sobre el robot `so_follower` para la tarea "taskbox", con dos cámaras (frontal y lateral) y un estado de observación de 6 dimensiones.

El modelo tiene 51.672.714 parámetros y se distribuye en formato safetensors con licencia Apache 2.0. No es un modelo de lenguaje: es una política visomotora que consume imágenes de 480x640 y estado propioceptivo, y produce vectores de acción de 6 dimensiones a 30 FPS. Su relevancia es práctica: sirve como ejemplo reproducible de un pipeline completo de imitación con LeRobot, desde la grabación de datos teleoperados hasta el despliegue en robot real.

El entrenamiento se realizó sobre un dataset pequeño (20 episodios, 25.815 frames) durante 50.000 pasos con batch size 8 y learning rate 1e-5. Es, por tanto, una política de nicho, ligada a un robot y una tarea concretos, sin evaluación publicada ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación fija por frame) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower |
| Cámaras | front, side (3x480x640 cada una) |
| Dimensión de estado | 6 |
| Dimensión de acción | 6 |
| Frecuencia de control | 30 FPS |
| Tarea | taskbox |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora. El modelo procesa dos flujos de imagen (cámaras frontal y lateral, 3x480x640) junto con un vector de estado propioceptivo de 6 dimensiones, y genera un chunk de acciones de 6 dimensiones. La innovación central del método, descrita en el paper arXiv:2304.13705, es predecir múltiples pasos de acción de forma conjunta en lugar de uno a uno, lo que mitiga el error compuesto típico de las políticas reactivas y permite un control más suave y consistente temporalmente.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `Haku-2004/k5_4seg`: 20 episodios, 25.815 frames a 30 FPS, tarea "taskbox". La configuración fue de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se especifica en la información disponible si hubo aumentos de datos, regularización adicional ni composición detallada del dataset más allá de los episodios y frames indicados.

## Capacidades

- Generación de chunks de acción de 6 dimensiones para control de robot `so_follower`.
- Percepción visomotora con dos cámaras simultáneas (frontal y lateral) a 480x640.
- Aprendizaje por imitación a partir de datos teleoperados.
- Ejecución autónoma de la tarea "taskbox" en tiempo real a 30 FPS.
- Integración con el ecosistema LeRobot para rollout y entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Manipulación de objetos tipo "taskbox" en robot `so_follower`: la política ejecuta la tarea entrenada de forma autónoma con las dos cámaras configuradas, adecuada para demostraciones de laboratorio y validación de pipelines de imitación.
- Reproducción de experimentos de ACT: sirve como referencia para comparar configuraciones de entrenamiento (pasos, batch size, learning rate) sobre el mismo dataset.
- Base para fine-tuning en tareas similares: al ser una política pequeña (51,7 M de parámetros) y con licencia Apache 2.0, puede adaptarse a variantes de la tarea con datasets propios.
- Validación de hardware y calibración: útil para comprobar que el robot, las cámaras y los puertos están correctamente configurados antes de entrenar políticas nuevas.
- Docencia y formación en robótica de imitación: ejemplo completo y reproducible con comandos `lerobot-rollout` y `lerobot-train`.
- Benchmark interno de latencia y throughput en el robot objetivo: permite medir el rendimiento real de ACT en el hardware disponible antes de escalar a tareas más complejas.
- Integración en pipelines de investigación: como componente de un sistema mayor de manipulación, siempre que la tarea y el robot coincidan con los del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y dos cámaras de 480x640, la huella es reducida y cabe holgadamente en GPUs de consumo, aunque no se especifica una cifra exacta.
- GPU recomendadas: no disponible; el comando de entrenamiento de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- ¿Cabe en consumer GPU? Sí, por tamaño de parámetros, aunque no se detalla el modelo mínimo.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con `--policy.path=Haku-2004/act_k5t_pred_15`; entrenamiento con `lerobot-train`.
- Latencia y throughput: no disponibles; el control opera a 30 FPS según la configuración del dataset, pero no se publican métricas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k5t_pred_15 (este) | 51,7 M | no aplica | taskbox en so_follower | Apache 2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | tareas diversas | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | variable | no aplica | manipulación | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenada exclusivamente para la tarea "taskbox" y el robot `so_follower`; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Dataset muy pequeño (20 episodios, 25.815 frames), lo que limita la robustez ante variaciones de iluminación, posiciones de objetos o distracciones.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Sin capacidades lingüísticas, de razonamiento ni de tool calling; no debe emplearse fuera del ámbito robótico.
- Riesgo de sobreajuste al entorno de grabación y a la configuración exacta de cámaras (nombres `front` y `side` deben coincidir).
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el dominio acotado desaconsejan su uso en producción sin validación propia.
- No se documentan sesgos ni riesgos de alucinación en el sentido de modelos de lenguaje; el riesgo principal es el fallo físico en la manipulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5t_pred_15
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_4seg
