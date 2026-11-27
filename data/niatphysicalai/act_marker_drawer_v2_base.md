# NIATphysicalAI/act_marker_drawer_v2_base

## Resumen

`act_marker_drawer_v2_base` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face por el usuario NIATphysicalAI. No es un modelo de lenguaje: es una política visuomotora que, a partir de cuatro cámaras y del estado de las articulaciones, predice directamente comandos de acción de 16 dimensiones para un robot bimanual de tipo `openarm_bimanual`. El modelo resuelve una tarea concreta de manipulación: coger un rotulador negro y colocarlo en el cajón superior.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo canónico de política ACT en el ecosistema LeRobot, con un tamaño de 51.637.904 parámetros y un repositorio de 0,2 GB, lo que la hace muy ligera y fácil de desplegar. Por otro, permite evaluar con rigor las limitaciones de un modelo entrenado con solo 43 episodios y 22.967 fotogramas: es un artefacto de investigación reproducible, no un sistema listo para producción general.

La arquitectura es un transformer con decodificación de trozos de acción (*action chunking*), según el paper ACT (arXiv:2304.13705). El modelo consume imágenes de dos cámaras de cabeza a 720x1280 y dos de muñeca a 600x960, además de un vector de estado de 16 dimensiones, y produce acciones de 16 dimensiones. La ventana de contexto, el número de tokens de entrenamiento y los idiomas no están definidos en el sentido de un LLM, por lo que se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, Zhao et al. 2023) |
| Parametros totales | 51.637.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo robótico; la instrucción de tarea es texto en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso, lo que reduce el error de acumulación y suaviza la ejecución. La entrada combina cuatro flujos visuales con un vector de estado de 16 componentes; la salida es un vector de acción de 16 componentes. El modelo se entrenó con 100.000 pasos, batch de 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.7.1. El dataset `NIATphysicalAI/openarm_marker_drawer_v2` contiene 43 episodios, 22.967 fotogramas a 30 FPS y una única tarea: "Pick the black marker and place it in the top drawer".

No se documentan datos de preentrenamiento adicionales, composición del dataset más allá de los episodios de teleoperación, ni técnicas de RLHF o DPO (no aplicables a este paradigma). Tampoco se especifican innovaciones como decodificación especulativa o atención lineal; la contribución técnica es el propio *action chunking* del paper ACT.

## Capacidades

- Control visuomotor bimanual: genera acciones de 16 dimensiones para el robot `openarm_bimanual`.
- Percepción multimodal con cuatro cámaras: `head_left`, `head_right` (720x1280) y `wrist_left`, `wrist_right` (600x960).
- Ejecución de una tarea de manipulación concreta: coger un rotulador negro y colocarlo en el cajón superior.
- Aprendizaje por imitación a partir de teleoperación, sin refuerzo ni recompensas explícitas.
- Inferencia en tiempo real a 30 FPS (frecuencia del dataset de entrenamiento).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües en el sentido de un LLM.
- No dispone de modo *thinking*, visión general, audio ni generación de texto libre.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como referencia reproducible de una política ACT entrenada con LeRobot para comparar curvas de entrenamiento y variantes del método.
- Prototipado de manipulación bimanual en laboratorio: validar la cadena completa cámara-robot-política antes de escalar a tareas más complejas.
- Automatización de una tarea de pick-and-place muy acotada: colocar objetos pequeños en cajones o contenedores en entornos controlados con posiciones repetibles.
- Generación de datos sintéticos de evaluación: usar la política como baseline para medir la sensibilidad a cambios de iluminación, posición de objetos o distracciones.
- Docencia y formación en robótica: ejemplo mínimo (0,2 GB, 51,6 M de parámetros) para enseñar el flujo `lerobot-train` y `lerobot-rollout`.
- Benchmark interno de hardware: comparar latencia y tasa de éxito entre distintas GPU o configuraciones de cámara con una política fija.
- Reentrenamiento con *fine-tuning* sobre un dataset propio: partir de estos pesos y adaptarlos a una tarea similar con pocos episodios adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito, MMLU, HumanEval, GSM8K ni métricas equivalentes, que por otra parte no aplican a una política robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,6 M de parámetros y pesos safetensors, el modelo es muy ligero y probablemente quepa en GPU de consumo, pero no se confirma.
- GPU recomendadas: no disponible; la model card solo menciona `--policy.device=cuda` en el comando de entrenamiento.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño (0,2 GB de repositorio) es plausible, pero no hay dato oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles; el dataset de entrenamiento está a 30 FPS, lo que sugiere que el bucle de control opera a esa frecuencia, pero no se aportan mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría (políticas ACT para `openarm_bimanual` u otras políticas LeRobot) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Entrenada con un único dataset de 43 episodios y una sola tarea; la generalización a otras tareas, objetos o posiciones es muy limitada.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito ni de robustez.
- Licencia no especificada ("More Information Needed" en la model card): no se puede confirmar el uso comercial.
- Dependencia estricta de la configuración de hardware: robot `openarm_bimanual` y cuatro cámaras con nombres y resoluciones concretos; cualquier cambio en la disposición de cámaras invalida la política.
- Riesgo de sobreajuste al entorno de recogida de datos (iluminación, fondo, posición del cajón y del rotulador).
- No es un modelo de lenguaje: no admite prompts libres, tool calling ni razonamiento; la "tarea" es una cadena fija asociada al dataset.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- No se documentan sesgos demográficos ni de otro tipo, aunque el dataset de teleoperación puede reflejar sesgos del operador humano.
- En producción requeriría supervisión humana, paradas de seguridad y validación específica del robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NIATphysicalAI/act_marker_drawer_v2_base
- Dataset de entrenamiento: https://huggingface.co/datasets/NIATphysicalAI/openarm_marker_drawer_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=NIATphysicalAI/openarm_marker_drawer_v2
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
