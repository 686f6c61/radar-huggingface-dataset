# castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_ID_q1_164510

## Resumen

`castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_ID_q1_164510` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada mediante la librería LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación robótica contact-rich: insertar un gancho en una base para construir un marco y colgar una llave inglesa en el gancho. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino una política de imitación que mapea observaciones (estado articular de 9 dimensiones y dos cámaras RGB de 256x256) a acciones de 7 dimensiones.

La arquitectura es una política de difusión que trata el control visuomotor como un proceso generativo: en lugar de predecir una única acción, genera trayectorias de acción multim paso suaves, lo que la hace especialmente adecuada para tareas de contacto rico. El checkpoint contiene 278.014.919 parámetros y se distribuye en formato safetensors con licencia Apache 2.0. Fue entrenada con 100.000 pasos, batch size 64, optimizador Adam y learning rate 0,0001, sobre un dataset de 200 episodios y 95.962 fotogramas a 20 FPS.

Su relevancia es acotada y práctica: sirve como referencia reproducible de entrenamiento de Diffusion Policy con LeRobot para la tarea `tool_hang` del benchmark Robomimic, y permite a desarrolladores de robótica evaluar el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) sin partir de cero. No tiene capacidades de lenguaje, razonamiento simbólico ni generalización fuera de la tarea y el robot para los que fue entrenada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión para control visuomotor) |
| Parámetros totales | 278.014.919 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de robótica; ventana de observación de estado `(9,)` y dos imágenes `(3, 256, 256)`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | panda |
| Cámaras | `sideview`, `robot0_eye_in_hand` |
| Entrada de estado | `observation.state` `(9,)` |
| Entrada visual | `observation.images.sideview` `(3, 256, 256)`, `observation.images.robot0_eye_in_hand` `(3, 256, 256)` |
| Salida de acción | `action` `(7,)` |
| Dataset de entrenamiento | `castanetnicolas/robomimic_tool_hang_ph_image256` |
| Episodios de entrenamiento | 200 |
| Fotogramas de entrenamiento | 95.962 |
| Frame rate del dataset | 20 FPS |
| Tarea | "Insert the hook into the base to build a frame, then hang the wrench on the hook." |
| Pasos de entrenamiento | 100.000 |
| Batch size | 64 |
| Optimizador | Adam |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repo | 1,1 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, un enfoque que formula el control visuomotor como un proceso generativo de difusión. En lugar de regresar directamente una acción, la política aprende a generar trayectorias de acción multim paso mediante un proceso iterativo de eliminación de ruido, lo que produce movimientos suaves y coherentes temporalmente, y mejora el rendimiento en tareas de manipulación con contacto rico frente a políticas de regresión directa. La entrada combina el estado del robot (9 dimensiones) con dos flujos visuales de 256x256 píxeles (vista lateral y cámara en el efector), y la salida es un vector de acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `robomimic_tool_hang_ph_image256`, compuesto por 200 episodios y 95.962 fotogramas a 20 FPS de la tarea `tool_hang` de Robomimic. Se ejecutaron 100.000 pasos con batch size 64, optimizador Adam, learning rate 0,0001 y semilla 1000. No se documenta en la información disponible el número de tokens, la composición detallada del dataset más allá de los episodios y fotogramas indicados, ni si se aplicaron técnicas de RLHF, DPO o refinamiento posterior; tampoco se describen innovaciones adicionales como decodificación especulativa o atención lineal, que no aplican al paradigma de Diffusion Policy.

## Capacidades

- Generación de trayectorias de acción multim paso para control visuomotor de un robot manipulador tipo `panda`.
- Manipulación contact-rich: la tarea entrenada implica insertar un gancho en una base y colgar una llave inglesa, lo que requiere contacto físico preciso.
- Fusión de estado proprioceptivo (9 dimensiones) con dos cámaras RGB de 256x256 para percepción visual.
- Producción de acciones de 7 dimensiones (típicamente 6 de pose del efector más 1 de pinza, según la convención de Robomimic/LeRobot; el detalle exacto no se especifica en la información disponible).
- Ejecución en tiempo real a través del comando `lerobot-rollout` con estrategia `base`.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-step simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.
- Reentrenamiento posible con `lerobot-train` usando `--policy.type=diffusion` sobre otros datasets.

## Casos de uso

- **Reproducción del benchmark `tool_hang` de Robomimic:** usar el checkpoint como referencia para comparar el rendimiento de Diffusion Policy frente a otras políticas de imitación en la misma tarea, con las mismas observaciones y el mismo robot `panda`.
- **Validación de un pipeline completo de LeRobot:** servir de ejemplo funcional del flujo grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`, útil para equipos que adoptan LeRobot por primera vez.
- **Punto de partida para fine-tuning en tareas de ensamblaje:** reentrenar la política sobre un dataset propio de inserción de piezas o montaje de estructuras, aprovechando que la arquitectura ya está configurada para entradas de estado de 9 dimensiones y dos cámaras.
- **Investigación en políticas generativas para manipulación:** emplear el checkpoint como baseline de Diffusion Policy en estudios sobre suavidad de trayectorias y robustez en contacto, comparándolo con políticas de regresión directa.
- **Pruebas de integración hardware-software con robot `panda`:** validar la configuración de cámaras (`sideview` y `robot0_eye_in_hand`), puertos y calibración antes de desplegar políticas más complejas.
- **Generación de datos sintéticos o aumento de dataset:** usar la política entrenada para producir rollouts que sirvan como datos adicionales o para análisis de fallos en la tarea de colgar la llave.
- **Docencia y formación en imitation learning robótico:** demostrar de forma reproducible cómo se entrena y despliega una política de difusión con LeRobot en una tarea de contacto real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible de forma explícita. Con 278 millones de parámetros en safetensors y un repo de 1,1 GB, la inferencia en precisión nativa (probablemente fp32) requeriría del orden de 1,1 GB solo para pesos, más memoria para activaciones de dos flujos de imagen de 256x256; una estimación conservadora sitúa el requisito en torno a 2-4 GB de VRAM, aunque este dato no está confirmado en la información proporcionada.
- **GPU recomendadas:** no se especifican en la model card. Para entrenamiento, el comando de ejemplo usa `--policy.device=cuda` sin indicar modelo concreto. Para inferencia en robot, una GPU consumer moderna sería suficiente por el tamaño del modelo, pero no hay confirmación oficial.
- **¿Cabe en GPU consumer?** Muy probablemente sí, dado el tamaño de 278 millones de parámetros, pero no se confirma en la documentación disponible.
- **Opciones de despliegue:** LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput estimados:** no disponibles. La política se ejecuta en el bucle de control del robot; el dataset se grabó a 20 FPS, pero no se documenta la frecuencia de inferencia real ni el tiempo por paso.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia categórica, podrían considerarse otras políticas de LeRobot para la tarea `tool_hang` (por ejemplo, ACT o TDMPC entrenadas sobre el mismo dataset), pero no se aportan datos de parámetros, contexto, rendimiento ni licencia de esas alternativas en la información disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_ID_q1_164510` | 278.014.919 | no aplica | sin evaluación publicada | Apache 2.0 | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sin evaluación publicada:** la model card declara explícitamente que no hay resultados de evaluación; no se conoce la tasa de éxito real en la tarea.
- **Especialización extrema:** la política está entrenada para una única tarea (`tool_hang`) y un único tipo de robot (`panda`); no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- **Dependencia de la configuración de cámaras:** los nombres y la disposición de las cámaras (`sideview`, `robot0_eye_in_hand`) deben coincidir exactamente con los usados en entrenamiento; cualquier cambio en la iluminación, posición o calibración puede degradar el rendimiento.
- **Riesgo de sobreajuste al dataset:** con 200 episodios y 95.962 fotogramas, la diversidad de escenarios es limitada; es probable que el modelo falle ante posiciones de objetos, distracciones o condiciones de iluminación no vistas.
- **Sin capacidades de lenguaje ni razonamiento simbólico:** no puede usarse para tareas de texto, tool calling, agentes ni diálogo.
- **Licencia Apache 2.0:** permite uso comercial y modificación, pero el autor no ofrece garantías; el despliegue en producción requiere validación propia.
- **Reproducibilidad dependiente de LeRobot 0.6.1:** cambios de versión en LeRobot o en las APIs de `lerobot-rollout`/`lerobot-train` pueden afectar al comportamiento.
- **Sin datos de sesgos:** al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles sesgos de distribución en el dataset de demostraciones (posiciones, velocidades y estilos de un único demostrador).
- **Advertencia de seguridad física:** al tratarse de una política de control robótico con contacto físico, su despliegue sin supervisión ni límites de par puede causar daños al robot o al entorno; se recomienda ejecución supervisada y con paradas de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_ID_q1_164510
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
