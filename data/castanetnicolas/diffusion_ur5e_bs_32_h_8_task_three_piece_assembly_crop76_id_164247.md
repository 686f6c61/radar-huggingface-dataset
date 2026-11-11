# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop76_ID_164247

## Resumen

`castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop76_ID_164247` es una política de control visuomotor entrenada con el método Diffusion Policy y empaquetada con la librería LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación robótica contact-rich: insertar dos piezas en una base, primero la primera pieza y luego la segunda encima. Está pensado para ejecutarse sobre un brazo Franka Panda (el model card indica `robot.type=panda`), aunque el identificador del repositorio menciona un UR5e, lo que sugiere que el autor entrenó originalmente con esa plataforma o reutilizó el nombre.

La relevancia de esta ficha es acotada: no es un modelo de lenguaje ni un modelo generativo de propósito general, sino un checkpoint de investigación de 278 millones de parámetros, 1,1 GB en safetensors, con cero descargas y cero likes en el momento de la consulta. Sirve como ejemplo reproducible de un pipeline de imitation learning con LeRobot 0.6.1, no como base para aplicaciones de producción en texto o visión.

Arquitectónicamente es un modelo de difusión para planificación de acciones (action diffusion), que genera trayectorias de acción multimodales y suaves en lugar de una acción determinista por paso. El contexto aquí no es una ventana de tokens, sino el horizonte de predicción de acciones y el estado visual/estado propioceptivo del robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo de difusión para control visuomotor), empaquetado con LeRobot |
| Parametros totales | 278.014.699 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de acciones no especificado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `panda` (según model card); el ID del repo menciona `UR5e` |
| Cámaras de entrada | `agentview`, `robot0_eye_in_hand` |
| Entrada de estado | `observation.state`, shape `(9,)` |
| Entrada visual | `(3, 84, 84)` por cámara |
| Salida de acción | `(7,)` |
| Dataset de entrenamiento | `castanetnicolas/mimicgen_three_piece_assembly_d1_image84` |
| Episodios / frames | 200 episodios, 67.101 frames, 20 FPS |
| Pasos de entrenamiento | 300.000 |
| Batch size | 32 |
| Optimizador / LR | adam / 1e-4 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repo | 1,1 GB |

## Arquitectura y entrenamiento

El modelo sigue el método Diffusion Policy descrito en el paper arXiv:2303.04137: en lugar de aprender una política determinista `a = π(o)`, aprende la distribución condicional de secuencias de acciones mediante un proceso de difusión, condicionado a observaciones visuales y al estado propioceptivo del robot. En inferencia, parte de ruido gaussiano y aplica pasos de denoising para producir una trayectoria de acción de varios pasos, lo que favorece la multimodalidad (varias formas válidas de completar la inserción) y la suavidad temporal de las acciones, algo crítico en tareas de ensamblaje con contacto.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `mimicgen_three_piece_assembly_d1_image84`, que contiene 200 episodios y 67.101 frames a 20 FPS de la tarea "Insert the first piece into the base, then insert the second piece on top of it". Se usaron 300.000 pasos, batch size 32, optimizador Adam con learning rate 1e-4 y semilla 1000. No se documenta en la model card el número de tokens, la composición del dataset más allá de los episodios, ni si hubo RLHF/DPO (no aplica en robótica de imitación). Tampoco se especifica la arquitectura interna exacta de la red de difusión (backbone visual, número de pasos de difusión, horizonte de predicción), por lo que esos detalles quedan como no disponibles.

## Capacidades

- Generación de trayectorias de acción de 7 dimensiones para un brazo robótico de 7 grados de libertad, a partir de dos vistas de cámara y un vector de estado de 9 dimensiones.
- Control visuomotor contact-rich: la formulación como proceso de difusión produce acciones suaves y multimodales, adecuadas para tareas de inserción y ensamblaje.
- Percepción visual desde dos cámaras (`agentview` y `robot0_eye_in_hand`), lo que permite combinar vista global de la escena y vista de muñeca.
- Ejecución de una tarea específica de ensamblaje de tres piezas, no de propósito general.
- No soporta tool calling, function calling, agentes multi-step ni razonamiento simbólico.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, visión general, audio ni thinking mode.
- Integración con el ecosistema LeRobot: `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento.

## Casos de uso

- Investigación en imitation learning: servir como checkpoint de referencia para reproducir el pipeline de Diffusion Policy con LeRobot 0.6.1 sobre un dataset MimicGen de ensamblaje, comparando curvas de entrenamiento y estabilidad con otras semillas.
- Benchmark de ensamblaje de tres piezas: evaluar la tasa de éxito de la política en un entorno controlado con un Panda y las dos cámaras especificadas, como baseline para métodos de difusión posteriores.
- Estudio de robustez ante variaciones de iluminación y posición de objetos: al ser una política visual entrenada con 200 episodios, es útil para medir degradación fuera de distribución en tareas de inserción.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train` sobre un dataset propio de ensamblaje y comparar con el checkpoint original, gracias a que la licencia apache-2.0 permite uso y modificación.
- Docencia y demos de robótica: ilustrar el flujo completo de LeRobot (grabación, entrenamiento, rollout) con una tarea concreta y un modelo pequeño (1,1 GB) que cabe en un portátil con GPU consumer.
- Validación de infraestructura de despliegue: probar `lerobot-rollout` con `--strategy.type=base` y `--duration` para verificar la cadena robot-cámaras-política antes de invertir en datasets mayores.
- Reproducción de resultados de Diffusion Policy: usar el checkpoint como referencia para comparar con implementaciones propias del paper 2303.04137 en una tarea de contacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la línea "No evaluation results have been provided for this policy yet." y la tabla de evaluación aparece vacía. No hay tasas de éxito, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 278 M de parámetros en fp32 el peso ronda 1,1 GB, por lo que en fp16 cabría en GPUs con 4-6 GB de VRAM, aunque la memoria adicional para las dos cámaras y el bucle de difusión no está documentada.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería poder alojar los pesos; para entrenamiento con batch 32 se recomienda al menos una GPU con 16-24 GB, aunque esto es una estimación, no un dato del autor.
- Cabe en GPU consumer: probablemente sí por tamaño de pesos; sin confirmación del autor.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (diffusion, three_piece_assembly) | Diffusion Policy para robótica | 278 M | no aplica | apache-2.0 | Hugging Face, 0 descargas |
| Otras políticas LeRobot `diffusion` en el Hub | Diffusion Policy para robótica | variable | no aplica | habitualmente apache-2.0 | Hugging Face |
| Políticas LeRobot `act` (Action Chunking Transformer) | Imitation learning determinista | variable | no aplica | habitualmente apache-2.0 | Hugging Face |
| Políticas LeRobot `pi0` / `pi0fast` | VLA (vision-language-action) | varios miles de millones | contexto lingüístico | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación es únicamente estructural. No se han identificado benchmarks públicos que comparen este checkpoint concreto con ACT o pi0 en la misma tarea.

## Limitaciones y advertencias

- Modelo de tarea única: solo ejecuta "Insert the first piece into the base, then insert the second piece on top of it"; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasa de éxito ni evidencia de robustez, por lo que no debe asumirse un rendimiento en producción.
- Posible inconsistencia de plataforma: el model card indica `robot.type=panda` pero el ID del repositorio menciona `UR5e`; conviene verificar la plataforma real antes de desplegar.
- Requiere que los nombres de cámara (`agentview`, `robot0_eye_in_hand`) y las resoluciones (84x84) coincidan exactamente con los del entrenamiento; cualquier cambio en la configuración de sensores puede degradar el rendimiento.
- Entrenado con solo 200 episodios y 67.101 frames: alta probabilidad de sobreajuste al entorno de recogida y baja robustez ante cambios de iluminación, posición de objetos o distractores.
- Sesgos conocidos: no documentados; en robótica de imitación el sesgo principal es la distribución del dataset de demostración.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas fuera de distribución.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- No apto para aplicaciones de texto, código, visión general ni razonamiento; es exclusivamente una política de control robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop76_ID_164247
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
