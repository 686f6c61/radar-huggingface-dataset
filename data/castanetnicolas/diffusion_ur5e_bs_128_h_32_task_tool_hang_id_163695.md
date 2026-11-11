# castanetnicolas/diffusion_UR5e_BS_128_H_32_TASK_tool_hang_ID_163695

## Resumen

Este repositorio contiene una política de imitación basada en Diffusion Policy, entrenada con la librería LeRobot de Hugging Face para control visuomotor en robótica de manipulación. El modelo resuelve una tarea concreta de ensamblaje: insertar un gancho en una base para construir una estructura y colgar una llave inglesa en el gancho. Se trata de un modelo de robótica, no de un modelo de lenguaje: consume observaciones (estado articular de 9 dimensiones y dos imágenes RGB de 256x256) y produce acciones de 7 dimensiones para un brazo robótico tipo Panda.

La relevancia de este artefacto es práctica: demuestra el flujo completo de LeRobot para entrenar políticas de imitación con difusión y publicarlas en el Hub, reproducible mediante comandos `lerobot-rollout` y `lerobot-train`. Con 89.331.655 parámetros y un tamaño de repositorio de 0,4 GB, es un modelo compacto orientado a despliegue en laboratorio o banco de pruebas, no a producción industrial a gran escala.

La información disponible es limitada: el autor no ha publicado resultados de evaluación, no hay benchmarks y la model card no documenta la arquitectura interna más allá de la referencia al paper de Diffusion Policy (arXiv:2303.04137). Las descargas y likes son cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (control visuomotor generativo; detalles internos no disponibles) |
| Parametros totales | 89.331.655 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por paso de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `panda` |
| Cámaras de entrada | `sideview`, `robot0_eye_in_hand` |
| Entrada de estado | `observation.state`, shape `(9,)` |
| Entrada visual | `observation.images.sideview` y `observation.images.robot0_eye_in_hand`, shape `(3, 256, 256)` |
| Salida de acción | `action`, shape `(7,)` |
| Librería | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | `castanetnicolas/robomimic_tool_hang_ph_image256` |
| Episodios de entrenamiento | 200 |
| Fotogramas de entrenamiento | 95.962 |
| Frecuencia del dataset | 20 FPS |
| Pasos de entrenamiento | 200.000 |
| Tamaño de lote | 128 |
| Optimizador | adam |
| Tasa de aprendizaje | 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue el enfoque Diffusion Policy descrito en el paper arXiv:2303.04137, que formula el control visuomotor como un proceso generativo de difusión: en lugar de predecir una acción única, genera trayectorias de acción multimodales y suaves, lo que resulta adecuado para tareas de manipulación con contacto rico. La model card no detalla el backbone concreto (tipo de red de ruido, número de pasos de difusión, horizonte de predicción ni configuración de la cabeza de acción), por lo que esos datos figuran como no disponibles.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `robomimic_tool_hang_ph_image256`, compuesto por 200 episodios y 95.962 fotogramas a 20 FPS, correspondientes a la tarea "Insert the hook into the base to build a frame, then hang the wrench on the hook". Se ejecutaron 200.000 pasos con Adam, lote de 128, tasa de aprendizaje 1e-4 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje por imitación supervisado sobre demostraciones. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visuomotor de manipulación robótica: genera acciones de 7 dimensiones para un brazo Panda a partir de estado articular e imágenes.
- Ejecución de una tarea de ensamblaje específica: insertar un gancho en una base y colgar una llave inglesa.
- Política de imitación entrenada con difusión: produce trayectorias de acción suaves y multimodales, adecuadas para contacto rico.
- Entrada multimodal: combina estado propioceptivo de 9 dimensiones con dos vistas RGB de 256x256 (vista lateral y cámara en la muñeca).
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, tool calling, capacidades de agente, multilingüismo ni modo de pensamiento. Es exclusivamente una política robótica.

## Casos de uso

- Automatización de ensamblaje en banco de pruebas: el modelo ejecuta la secuencia de insertar el gancho y colgar la llave inglesa sobre un Panda, adecuado para validar pipelines de imitación en laboratorio antes de escalar a celdas industriales.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de Diffusion Policy con el mismo dataset y configuración de entrenamiento de LeRobot.
- Prototipado rápido de políticas con LeRobot: permite a un equipo partir de un checkpoint entrenado y adaptarlo a una tarea similar con `lerobot-train`, reduciendo el coste inicial de recolección de datos.
- Docencia y formación en robótica: el modelo y su dataset permiten demostrar el ciclo completo de grabación, entrenamiento y despliegue en un robot real con hardware asequible.
- Evaluación de robustez visuomotora: al depender de dos cámaras, se puede usar para estudiar el impacto de cambios de iluminación, oclusiones o posiciones de objeto en el éxito de la tarea.
- Base para experimentos de generalización: útil para medir cómo se comporta una política de difusión entrenada con 200 episodios ante variaciones de la escena, sirviendo de línea base para técnicas de aumento de datos o domain randomization.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 89,3 millones de parámetros, los pesos en precisión completa ocupan aproximadamente 0,36 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para la política, aunque el coste real depende de las cámaras y del pipeline de visión.
- GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060, RTX 4060, RTX 4070 o superiores; no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.device=cuda` para entrenamiento e inferencia; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del hardware, de la frecuencia de control del robot y del coste de los pasos de difusión, que no se documentan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion_UR5e_BS_128_H_32_TASK_tool_hang_ID_163695 | 89.331.655 | no aplica | Manipulación robótica (tool hang) con Diffusion Policy | apache-2.0 | Hugging Face, 0 descargas |
| Otras políticas LeRobot del mismo autor | no disponible | no aplica | Tareas de manipulación variadas | apache-2.0 (presumible) | no disponible |
| Políticas ACT de LeRobot | no disponible | no aplica | Imitación visuomotora | no disponible | Hugging Face |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa figura como no disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay tasas de éxito ni pruebas en robot real, lo que impide estimar su fiabilidad en producción.
- Sesgo de dataset: entrenado con 200 episodios de una única tarea y un único entorno; probablemente no generaliza a posiciones de objeto, iluminación o configuraciones de cámara distintas.
- Dependencia de hardware específico: asume un robot Panda y dos cámaras con nombres y calibración concretos (`sideview`, `robot0_eye_in_hand`); un cambio de montaje o de robot invalida la política.
- Riesgo de alucinación en el sentido de acciones incorrectas: como política generativa, puede producir trayectorias plausibles pero erróneas en estados fuera de distribución.
- Sin capacidades lingüísticas ni de razonamiento: no debe emplearse para tareas de texto, código o agentes.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- Documentación incompleta: no se detallan la arquitectura interna, los pasos de difusión, el horizonte de predicción ni la composición exacta del dataset más allá del número de episodios y fotogramas.
- Repositorio con cero descargas y cero likes: sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_128_H_32_TASK_tool_hang_ID_163695
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
