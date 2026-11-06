# lenawngr/ACT_pick-place_L_nv_default_v3

## Resumen

ACT_pick-place_L_nv_default_v3 es una política de imitación basada en Action Chunking with Transformers (ACT), publicada por el usuario lenawngr en Hugging Face Hub bajo la librería LeRobot. No se trata de un modelo de lenguaje, sino de un modelo de robótica orientado a control motor: aprende de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación.

El modelo está entrenado sobre el dataset `lenawngr/pick-place_so101`, presumiblemente asociado a un robot SO-101 (brazo de bajo coste compatible con LeRobot), y está especializado en una tarea concreta de pick-and-place. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware de consumo.

Su relevancia radica en que ejemplifica el flujo actual de robótica open source: entrenamiento con LeRobot, pesos en safetensors, licencia Apache 2.0 y despliegue directo sobre robots de bajo coste. Es una pieza concreta dentro del ecosistema LeRobot, no un modelo generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre ventanas de observaciones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone visual (típicamente ResNet) que procesa las imágenes de las cámaras del robot, un encoder transformer que fusiona observaciones (imágenes y estado de las articulaciones) y un decoder transformer que genera un chunk de acciones futuras. Predecir varios pasos a la vez, en lugar de uno solo, mitiga el problema de compounding error típico de las políticas paso a paso y permite un control más suave.

El entrenamiento se realiza sobre el dataset `lenawngr/pick-place_so101`, compuesto por episodios de teleoperación de una tarea de pick-and-place sobre un SO-101. No se dispone de información sobre el número de episodios, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos. El modelo se entrenó y publicó mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. No hay datos publicados sobre RLHF, DPO ni otras fases de alineamiento, algo esperable en un modelo de este tipo.

## Capacidades

- Control motor por imitación: genera chunks de acciones para un brazo robótico SO-101 en tareas de pick-and-place.
- Procesamiento de observaciones visuales y de estado de articulaciones como entrada.
- Ejecución de políticas entrenadas end-to-end sin planificación explícita.
- Integración nativa con el ecosistema LeRobot (`lerobot-train`, `lerobot-record`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes LLM.
- Sin capacidades multilingües ni de generación de texto.
- Sin modo thinking, visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea aprendida sobre un SO-101, útil para prototipos de manipulación de bajo coste y para validar pipelines de LeRobot antes de escalar a robots más caros.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, cambios en el dataset o nuevas políticas sobre la misma tarea.
- Docencia y formación en robótica: al ser un modelo pequeño (51,7 M de parámetros) y con licencia Apache 2.0, es adecuado para prácticas donde el alumnado entrena, evalúa y modifica políticas sin necesidad de GPUs de gama alta.
- Evaluación de hardware SO-101: permite comprobar el funcionamiento de un brazo recién montado ejecutando una política conocida y midiendo tasas de éxito con `lerobot-record`.
- Generación de datos sintéticos de evaluación: ejecutando la política en bucle se pueden recolectar trayectorias para analizar robustez, variabilidad y modos de fallo.
- Base para fine-tuning en tareas adyacentes: al estar en formato safetensors y con LeRobot, se puede reentrenar sobre un dataset propio de pick-and-place con objetos o posiciones distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño del modelo (51,7 M de parámetros); en la práctica el cuello de botella es el backbone visual y el preprocesado de imágenes.
- GPU recomendadas: cualquier GPU con CUDA y al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de inferencia en CUDA o CPU; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT_pick-place_L_nv_default_v3 (este) | 51,7 M | Pick-and-place sobre SO-101 | Apache 2.0 | Hugging Face Hub |
| Otras políticas ACT en LeRobot Hub | variable | Tareas de manipulación diversas | habitualmente Apache 2.0 | Hugging Face Hub |
| Políticas Diffusion Policy en LeRobot | variable | Manipulación por imitación | variable | Hugging Face Hub |
| Políticas VLA (p. ej. familias tipo OpenVLA) | cientos de millones a miles de millones | Manipulación generalista con instrucciones en lenguaje | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo publicados para este checkpoint concreto, por lo que la comparación se limita a parámetros, tarea, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: entrenado para una única tarea de pick-and-place sobre un robot SO-101; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin capacidades lingüísticas ni de razonamiento simbólico; no debe evaluarse con benchmarks de LLM.
- Riesgo de sobreajuste al dataset de teleoperación: cambios en iluminación, posición de cámara o disposición de objetos pueden degradar la tasa de éxito.
- No hay información publicada sobre sesgos, composición del dataset ni protocolo de evaluación, lo que dificulta auditar su robustez.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Al ser un modelo de robótica que controla hardware físico, su uso inadecuado puede provocar daños materiales o lesiones; requiere protocolos de seguridad externos.
- No se documentan cuantizaciones ni optimizaciones de despliegue más allá de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_pick-place_L_nv_default_v3
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset asociado: https://huggingface.co/datasets/lenawngr/pick-place_so101
