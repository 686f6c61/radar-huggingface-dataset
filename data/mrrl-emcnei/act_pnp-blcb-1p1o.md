# mrrl-emcnei/act_pnp-blcb-1p1o

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación robótica. Este checkpoint concreto, `mrrl-emcnei/act_pnp-blcb-1p1o`, ha sido entrenado con LeRobot 0.6.2 sobre un dataset propio de 50 episodios y 20.118 frames a 30 FPS para una única tarea: coger un cubo azul y dejarlo en un cuenco negro.

El modelo consume el estado del robot (vector de 16 dimensiones) y tres vistas de cámara RGB a 480x640 (muñeca izquierda, muñeca derecha y cámara elevada), y produce un vector de acción de 16 dimensiones. Con 51.689.104 parámetros y un peso de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre el robot `mobileai_robot`.

Es relevante como ejemplo reproducible de un pipeline completo de imitación robótica con licencia Apache 2.0: sirve tanto para desplegar la política en hardware real como para estudiar la configuración de entrenamiento (100.000 pasos, batch 8, AdamW, LR 1e-5) y reutilizarla como base para tareas pick-and-place similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.689.104 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (política de imitación; no procesa contexto textual) |
| Tipos de cuantizacion | No disponible (pesos safetensors en precisión de entrenamiento; LeRobot no documenta cuantizaciones para este checkpoint) |
| Idiomas soportados | No disponible (modelo robótico; la instrucción de tarea es una cadena fija en inglés: "Pick the blue cube and place it in the black bowl.") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT sigue el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). La política combina un backbone visual (codificador de imágenes por cámara) con un transformer que fusiona las observaciones (estado de 16 dimensiones y tres imágenes de 480x640) y decodifica un chunk de acciones de 16 dimensiones. La predicción por chunks, en lugar de paso a paso, es la innovación central del método: amortigua la incertidumbre de las políticas por imitación y permite ejecutar acciones coherentes durante varios timesteps.

El entrenamiento se realizó sobre el dataset `mrrl-emcnei/pnp-blcb-1p1o` (50 episodios, 20.118 frames, 30 FPS, tarea única de pick-and-place), con 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.6.2. No se documenta en la model card el número de tokens, la composición exacta del dataset más allá de los episodios, ni si hubo RLHF/DPO (en imitación supervisada pura no aplica). Tampoco se detalla la configuración interna del transformer (capas, dimensión oculta, número de cámaras fusionadas por atención).

## Capacidades

- Manipulación robótica de un brazo (o sistema bimanual, según las tres cámaras) para la tarea concreta de pick-and-place: coger el cubo azul y colocarlo en el cuenco negro.
- Predicción de chunks de acción de 16 dimensiones a partir de estado propioceptivo de 16 dimensiones y tres imágenes RGB.
- Percepción visual multi-cámara: cámara elevada (`cam_high`) y dos cámaras de muñeca (`cam_left_wrist`, `cam_right_wrist`), lo que permite coordinar la aproximación y el agarre.
- Ejecución en bucle cerrado a 30 FPS sobre el robot `mobileai_robot` mediante `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso en el sentido de LLM, ni generación de texto, código, matemáticas, visión general o audio. Es una política de imitación especializada, no un modelo de lenguaje.
- Capacidad multilingüe: no aplica; la tarea se especifica con una cadena fija en inglés.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: desplegar la política con `lerobot-rollout` sobre `mobileai_robot` para trasladar piezas de una posición conocida a un contenedor, aprovechando la predicción por chunks para movimientos estables a 30 FPS.
- Base para fine-tuning en tareas de recogida similares: reutilizar el checkpoint y reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio de otra tarea de manipulación, partiendo de una política ya adaptada a la morfología del robot y a las tres cámaras.
- Estudio de referencia de imitación con LeRobot: usar la configuración de entrenamiento documentada (100k pasos, batch 8, LR 1e-5) como línea base reproducible para comparar variantes de datos o aumentos.
- Validación de pipelines de datos robóticos: comprobar que el dataset `pnp-blcb-1p1o` (50 episodios, 20.118 frames) es suficiente para aprender una tarea de pick-and-place con éxito razonable, y medir la tasa de éxito real con trials.
- Demostración educativa de ACT: mostrar en talleres o cursos cómo una política de 51,7 M de parámetros y 0,2 GB resuelve una tarea de manipulación con tres cámaras, sin necesidad de infraestructura pesada.
- Integración en entornos de investigación con hardware de bajo coste: al ser Apache 2.0 y un checkpoint pequeño, encaja en laboratorios que replican el robot `mobileai_robot` y necesitan una política lista para evaluar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."* No se dispone de tasas de éxito en robot real, número de trials, MMLU, HumanEval, GSM8K ni métricas equivalentes para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 0,2 GB en safetensors con 51,689 M de parámetros; en FP32 la inferencia requiere del orden de 1-2 GB de VRAM, holgadamente por debajo de cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre; RTX 3060/4060, RTX 4090, A100 o H100 son más que suficientes. La inferencia puede ejecutarse también en CPU para pruebas, aunque a 30 FPS conviene GPU.
- Cabe en GPU consumer: sí, en cualquier GPU moderna; también en placas integradas con suficiente memoria para el modelo y las tres cámaras.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a una política robótica.
- Latencia y throughput estimados: no disponibles. La política está pensada para ejecutarse a 30 FPS (frecuencia de los datos de entrenamiento), pero no se publican mediciones de latencia por chunk ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pnp-blcb-1p1o (este) | 51.689.104 | Estado 16-D + 3 imágenes 480x640 | Pick-and-place de cubo azul en cuenco negro | Apache 2.0 | Hugging Face, 30 descargas |
| Otros checkpoints ACT en LeRobot Hub | Variable (misma arquitectura ACT) | Variable según dataset | Tareas de manipulación diversas | Según checkpoint | Hugging Face |
| Políticas de imitación alternativas (por ejemplo, Diffusion Policy) | No disponible | No disponible | Manipulación robótica | No disponible | No disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre este checkpoint y alternativas; la comparativa se limita a arquitectura y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha sido entrenada para la tarea "Pick the blue cube and place it in the black bowl."; no generaliza a otras tareas ni objetos sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que el rendimiento en producción es desconocido y debe medirse con trials propios.
- Dependencia de hardware y calibración: requiere el robot `mobileai_robot`, las tres cámaras con los nombres exactos (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) y la resolución 480x640 a 30 FPS; cambios de cámara, iluminación o posiciones de objeto pueden degradar el comportamiento.
- Riesgo de sobreajuste al dataset de 50 episodios: la diversidad de posiciones, distracciones y condiciones de iluminación es limitada, lo que aumenta la probabilidad de fallo fuera de la distribución de entrenamiento.
- Sesgos conocidos: no se documentan sesgos de sesgo social o de género, pero al ser un modelo de imitación hereda los sesgos de las demostraciones de teleoperación (por ejemplo, trayectorias y estrategias de agarre concretas).
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la predicción de acciones incorrectas o inseguras ante observaciones novedosas, sin mecanismo de verificación.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe cumplir las condiciones de la licencia y citar el método (arXiv:2304.13705) y LeRobot según la model card.
- Caveat para producción: el modelo no incluye parada de seguridad ni detección de fallos; en un entorno real debe combinarse con límites de par, paradas de emergencia y supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrrl-emcnei/act_pnp-blcb-1p1o
- Dataset de entrenamiento: https://huggingface.co/datasets/mrrl-emcnei/pnp-blcb-1p1o
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrrl-emcnei/pnp-blcb-1p1o
