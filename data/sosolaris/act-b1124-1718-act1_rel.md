# SoSolaris/act-b1124-1718-act1_rel

## Resumen

ACT-b1124-1718-act1_rel es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente por Zhao et al. (2023) y reimplementado en la librería LeRobot de Hugging Face. El modelo aprende a partir de datos de teleoperación y predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación de horizonte largo. Está desarrollado por el usuario SoSolaris y entrenado sobre un robot bimanual propietario denominado `solaria_bimanual`.

El modelo resuelve una tarea concreta de manipulación: agarrar una lata y verter su contenido en una taza (sin agua). Es una política de extremo a extremo que consume el estado articular de 14 dimensiones y tres flujos de imagen RGB de 480x640 píxeles (cámaras superior, derecha e izquierda) y produce un vector de acción de 14 dimensiones. Con 51,6 millones de parámetros y 0,2 GB de pesos, es un modelo compacto pensado para inferencia en tiempo real sobre hardware de robot, no para despliegue en servidores de propósito general.

Su relevancia es acotada: se trata de un artefacto de investigación reproducible más que de un modelo de propósito general. El interés principal reside en que ejemplifica el flujo completo de LeRobot (grabación de datos, entrenamiento de ACT, publicación en el Hub y despliegue con `lerobot-rollout`) y en que documenta con precisión la configuración de entrenamiento, lo que facilita su replicación y su uso como línea base en experimentos de imitación bimanual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.613.326 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación con ventana de observación fija) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora. El modelo codifica las observaciones (estado articular de 14 dimensiones y tres imágenes RGB de 3x480x640) y genera como salida un chunk de acciones de 14 dimensiones. La innovación central del método es la predicción de secuencias cortas de acciones en lugar de acciones individuales, lo que mitiga el problema de la varianza en la predicción de acciones y el error de composición acumulado. El modelo incluye además un mecanismo de ensamblaje temporal (temporal ensembling) que suaviza las transiciones entre chunks consecutivos durante la inferencia. Los detalles arquitectónicos internos (número de capas, dimensión de los embeddings, mecanismo de atención) no se especifican en la información disponible y deben consultarse en el paper original.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `SoSolaris/can_to_mug_merged_20261117_trimmed`, compuesto por 195 episodios y 200.716 fotogramas a 30 FPS, lo que equivale a aproximadamente 6.690 segundos de datos de teleoperación. La configuración utilizada fue de 50.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refuerzo; es puramente aprendizaje por imitación supervisado. Tampoco se especifica la composición del dataset más allá de la tarea única y el número de episodios.

## Capacidades

- Manipulación robótica bimanual de extremo a extremo: predice 14 dimensiones de acción (correspondientes a dos brazos) a partir de estado y visión.
- Percepción visual multi-cámara: procesa tres vistas simultáneas (superior, izquierda y derecha) a 480x640 y 30 FPS.
- Ejecución de una tarea específica: "Grab the can and pour its contain in the mug (without water)".
- Predicción de chunks de acción con ensamblaje temporal para movimientos suaves.
- Integración nativa con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües.

## Casos de uso

- Investigación en imitación visomotora: sirve como línea base reproducible para comparar variantes de ACT, ya que la configuración de entrenamiento y el dataset están documentados y el modelo es ligero (51,6 M de parámetros).
- Replicación de experimentos de manipulación bimanual: el par dataset-política permite reproducir el pipeline completo de LeRobot desde la grabación hasta el despliegue en un robot `solaria_bimanual`.
- Docencia y formación en robótica de aprendizaje: el modelo y su comando de despliegue (`lerobot-rollout`) ofrecen un ejemplo mínimo y funcional de política entrenada con datos reales.
- Pruebas de vertido de líquidos en entornos controlados: la tarea de verter de lata a taza es un caso clásico de manipulación con restricciones de orientación; el modelo puede evaluarse en condiciones de laboratorio con objetos similares.
- Evaluación de robustez ante variaciones de iluminación y posicionamiento: al ser una política de imitación, permite medir la degradación al cambiar condiciones respecto al dataset original.
- Integración en pipelines de investigación con LeRobot: el modelo puede cargarse con `lerobot-rollout` y combinarse con estrategias de grabación de episodios para generar nuevos datos y estudiar el bucle de mejora iterativa.
- Prototipado rápido de tareas de pick-and-place con dos brazos: aunque entrenado para vertido, el formato de observación y acción (14 dimensiones, tres cámaras) es reutilizable como plantilla para nuevas tareas bimanuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,6 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 0,2 GB, por lo que la política cabe holgadamente en cualquier GPU con al menos 2-4 GB de VRAM libre, incluyendo las tres cámaras y el preprocesamiento.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; para inferencia en tiempo real a 30 FPS se recomienda al menos una RTX 3060 o superior. El entrenamiento con batch size 32 y tres cámaras se beneficia de GPUs con 8 GB o más (RTX 3070/4070, A4000, A5000).
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con 4 GB o más de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch/CUDA. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La frecuencia de control está ligada a los 30 FPS del dataset, pero no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT-b1124-1718-act1_rel (este) | 51,6 M | ACT, imitación bimanual | Ventana de observación fija (no documentada) | apache-2.0 | Hugging Face, LeRobot |
| ACT original (Zhao et al., 2023) | no disponible | ACT, imitación | no disponible | no disponible | Paper y código de referencia |
| Políticas LeRobot de la comunidad | variable | ACT, Diffusion Policy, etc. | variable | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de tarea única: solo ha sido entrenado para "Grab the can and pour its contain in the mug (without water)"; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni ensayos reales documentados, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware: requiere un robot `solaria_bimanual` con la disposición exacta de cámaras (`up`, `right`, `left`) y calibración específica; no es portable a otros robots sin adaptación.
- Sensibilidad al dominio: al ser imitación pura, es probable que degrade ante cambios de iluminación, posición de objetos, fondos o distracciones no presentes en el dataset.
- Riesgo de sobreajuste al dataset: 195 episodios y 50.000 pasos de entrenamiento con learning rate bajo sugieren un ajuste fino sobre una distribución estrecha; no se documenta regularización ni validación.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con teleoperación humana puede heredar sesgos de los operadores en trayectorias y velocidades.
- Alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras fuera de distribución.
- Licencia apache-2.0: permite uso comercial, pero el modelo depende del ecosistema LeRobot y del dataset original, cuyas condiciones deben verificarse por separado.
- Sin soporte multilingüe ni de texto: no debe emplearse para tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SoSolaris/act-b1124-1718-act1_rel
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/can_to_mug_merged_20261117_trimmed
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/can_to_mug_merged_20261117_trimmed
