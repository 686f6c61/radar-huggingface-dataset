# SoSolaris/pi05-b1125-2057-pi9_rel_expert_q

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos: evoluciona π₀ para operar en situaciones y entornos que no se vieron durante el entrenamiento. Este repositorio concreto, `SoSolaris/pi05-b1125-2057-pi9_rel_expert_q`, es un fine-tuning del modelo base `lerobot/pi05_base` realizado por el usuario SoSolaris mediante la libreria LeRobot de Hugging Face, especializado en una unica tarea robotica de manipulacion.

El modelo consume observaciones multimodales (estado de las articulaciones y tres camaras) y produce acciones motoras de 14 dimensiones para un robot bimanual de tipo `solaria_bimanual`. La tarea entrenada es "Grab the can and pour its contain in the mug (without water)", es decir, agarrar una lata y verter su contenido en una taza. Se ha entrenado sobre un dataset de 195 episodios y 200.716 frames a 30 FPS.

Es relevante como ejemplo de flujo de trabajo de imitation learning con LeRobot sobre un VLA preentrenado: demuestra como adaptar un modelo generalista de robotica a una tarea especifica con un dataset relativamente pequeno. No obstante, es un modelo de investigacion con cero descargas y sin evaluacion publicada, por lo que su utilidad practica fuera de su entorno de entrenamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, que implementa la arquitectura π₀.₅ de Physical Intelligence en LeRobot, a su vez adaptada del repositorio OpenPI. Se trata de un modelo Vision-Language-Action que combina un backbone de vision-lenguaje con un cabezal de generacion de acciones, orientado a control robotico de proposito general. La model card no detalla la composicion interna del backbone ni el numero de tokens de preentrenamiento del modelo base.

El fine-tuning se realizo sobre el dataset `SoSolaris/can_to_mug_merged_20261117_trimmed` (195 episodios, 200.716 frames, 30 FPS) con la tarea unica de verter una lata en una taza. La configuracion de entrenamiento fue: 6.000 pasos, batch size 32, optimizador AdamW, learning rate 5e-05, semilla 1000 y LeRobot 0.6.2. No se especifica si hubo RLHF, DPO ni otras tecnicas de alineacion, ni innovaciones tecnicas adicionales en este fine-tuning concreto.

## Capacidades

- Generacion de acciones motoras de 14 dimensiones para un robot bimanual (`solaria_bimanual`).
- Percepcion visual multimodal a partir de tres camaras (`up`, `right`, `left`) con resolucion 3x480x640.
- Fusion de estado de articulaciones (vector de 14 dimensiones) con observaciones visuales.
- Ejecucion de una tarea de manipulacion especifica: agarrar una lata y verter su contenido en una taza.
- Inferencia en tiempo real mediante `lerobot-rollout` con estrategia `base`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, thinking mode, audio ni dialogo multilingue, al ser un modelo de robotica y no un LLM conversacional.

## Casos de uso

- Manipulacion robotica de vertido: el modelo ejecuta la secuencia completa de agarrar una lata y verterla en una taza, adecuado para tareas de servicio domestico o de laboratorio con robots bimanuales.
- Investigacion en imitation learning: sirve como referencia para estudiar como un VLA preentrenado se adapta a una tarea concreta con 195 episodios y 6.000 pasos de entrenamiento.
- Benchmark de fine-tuning con LeRobot: util como punto de partida para comparar hiperparametros (learning rate, batch size, pasos) en tareas de manipulacion similares.
- Prototipado de pipelines de robotica: permite validar el flujo completo `lerobot-rollout` con un robot `solaria_bimanual` antes de invertir en datasets mayores.
- Docencia y formacion: ejemplo didactico de extremo a extremo de un pipeline VLA (dataset, entrenamiento, despliegue) con documentacion oficial de LeRobot.
- Base para transferencia a tareas de vertido: puede servir de inicializacion para tareas relacionadas (trasvasar liquidos, manipular recipientes) mediante fine-tuning adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta policy ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,14 mil millones de parametros, en precision completa (fp32) serian necesarios aproximadamente 16,6 GB solo para pesos, y en fp16/bf16 unos 8,3 GB, mas memoria para activaciones y buffers de vision.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU con al menos 16-24 GB de VRAM (RTX 4090, A100, H100) seria un punto de partida razonable, aunque no hay confirmacion oficial.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en fp16, aunque no esta verificado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es el metodo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de robotica de este tipo.
- Latencia y throughput: no disponibles. El modelo opera a 30 FPS en el dataset de entrenamiento, pero no se documenta la latencia de inferencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoSolaris/pi05-b1125-2057-pi9_rel_expert_q | ~4,14 mil millones | no disponible | Vertido lata-taza (solaria_bimanual) | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista (base) | Apache 2.0 | Hugging Face (modelo base) |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista | no disponible en la informacion | Blog de Physical Intelligence |

La comparacion se limita al modelo base del que deriva y a la generacion anterior (π₀), ya que no se dispone de datos de benchmarks ni de otros fine-tunings comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado unicamente para la tarea "Grab the can and pour its contain in the mug (without water)" sobre un robot `solaria_bimanual`; no generaliza a otras tareas, objetos o morfologias sin reentrenamiento.
- Sin evaluacion publicada: no hay tasas de exito ni resultados en robot real, por lo que se desconoce su fiabilidad.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validacion externa.
- Dependencia de hardware especifico: requiere un robot `solaria_bimanual` y tres camaras con nombres `up`, `right`, `left` y resolucion 640x480 a 30 FPS; cualquier desviacion invalida la inferencia.
- Dataset pequeno (195 episodios): riesgo de sobreajuste a las condiciones de recogida (posiciones, iluminacion, objetos concretos).
- Sesgos conocidos: no documentados, pero al entrenarse con un unico dataset y tarea, hereda los sesgos de ese entorno fisico.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero existe riesgo de acciones erroneas o inseguras en robot real, especialmente fuera de la distribucion de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset subyacente pueden tener condiciones adicionales que conviene verificar.
- Sin informacion sobre cuantizacion ni despliegue en GPU de consumo verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SoSolaris/pi05-b1125-2057-pi9_rel_expert_q
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/can_to_mug_merged_20261117_trimmed
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/can_to_mug_merged_20261117_trimmed
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
