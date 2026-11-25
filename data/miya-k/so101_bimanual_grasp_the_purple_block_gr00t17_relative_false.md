# miya-k/so101_bimanual_Grasp_the_purple_block_GR00T17_relative_false

## Resumen

Este repositorio no contiene un modelo de lenguaje en sentido estricto, sino una política de control robótico entrenada con LeRobot y publicada por el usuario miya-k. Se trata de un fine-tuning de GR00T N1.7, el modelo fundacional abierto de NVIDIA para razonamiento y habilidades de robots humanoides, aplicado a una tarea concreta de manipulación bimanual sobre un robot SO-101 de doble brazo (tipo `bi_so_follower`). El modelo recibe cuatro flujos de cámara a 480x640 y el estado de las articulaciones (12 dimensiones) y produce una acción de 12 dimensiones.

La tarea aprendida es específica: coger un bloque morado con la mano izquierda, pasarlo a la derecha y colocarlo dentro de un espacio cuadrado. El entrenamiento se realizó sobre un dataset propio de 100 episodios y 59.053 fotogramas a 30 FPS, con 20.000 pasos de optimización y batch de 64. El resultado es una política de imitación (imitation learning) que reproduce ese comportamiento, no un modelo generalista.

Su relevancia es acotada y muy práctica: sirve como ejemplo reproducible de cómo adaptar un modelo fundacional robótico a una tarea concreta con LeRobot 0.7.1, y como referencia para quienes trabajan con robots SO-101 bimanuales. No hay resultados de evaluación publicados ni licencia declarada, lo que limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (3,14 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación multimodal, sin dato publicado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF declaradas) |
| Idiomas soportados | no disponibles (la tarea se define en inglés mediante prompt de lenguaje natural) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (tamaño del repo: 12,6 GB) |

## Arquitectura y entrenamiento

El modelo base GR00T N1.7 combina un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones entrenado mediante flow matching. La política predice acciones condicionadas por visión (cuatro cámaras), lenguaje (la descripción de la tarea) y propiocepción (estado articular de 12 dimensiones). El fine-tuning se hizo con LeRobot 0.7.1 sobre el dataset `miya-k/so101_bimanual_Grasp_the_purple_block`.

La configuración de entrenamiento publicada es: 20.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4 y semilla 42. El dataset contiene 100 episodios y 59.053 fotogramas a 30 FPS, lo que equivale a unos 1.968 segundos de demostraciones (aproximadamente 33 minutos). No se documenta composición adicional del dataset, aumento de datos, RLHF/DPO ni técnicas de decodificación especulativa. El nombre del repositorio incluye el sufijo `relative_false`, que sugiere una variante de representación de acciones, pero no se detalla su significado en la información disponible.

## Capacidades

- Control robótico bimanual: genera acciones de 12 dimensiones para un robot `bi_so_follower` (SO-101 de doble brazo).
- Percepción multimodal: consume cuatro cámaras (`right_top`, `left_top`, `right_follower`, `left_follower`) a 480x640 píxeles.
- Condicionamiento por lenguaje: acepta una descripción textual de la tarea como prompt.
- Ejecución de una tarea de manipulación concreta: coger, transferir entre manos y colocar un bloque.
- Integración con LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable con `lerobot-train`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código ni procesamiento de audio.

## Casos de uso

- Reproducción de la tarea de referencia: ejecutar la política sobre un SO-101 bimanual con la misma disposición de cámaras para replicar el agarre y trasvase del bloque morado; es el uso directo para el que fue entrenada.
- Base para fine-tuning en tareas similares: partir de estos pesos y reentrenar con `lerobot-train --policy.type=groot` sobre un dataset propio de manipulación bimanual, aprovechando el backbone preentrenado.
- Docencia y aprendizaje de imitation learning: usar el repositorio como ejemplo completo de pipeline (dataset, configuración de entrenamiento y comando de rollout) en cursos de robótica.
- Validación de hardware SO-101: comprobar la calibración de brazos y cámaras comparando el comportamiento de la política con el esperado en la tarea de referencia.
- Investigación en transferencia entre manos: estudiar el comportamiento de traspaso izquierda-derecha como caso de coordinación bimanual, analizando las trayectorias generadas.
- Benchmark interno de políticas robóticas: servir como línea base de comparación frente a otras políticas entrenadas sobre el mismo dataset o sobre variantes del mismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación vacía y declara explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3,14 mil millones de parámetros en safetensors (12,6 GB de repo), la inferencia en precisión completa requiere del orden de 12-13 GB de VRAM solo para pesos, más el coste de procesar cuatro cámaras a 480x640.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU con 16-24 GB (RTX 4090, A100 40 GB) es un punto de partida razonable, aunque no está confirmado.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB con cuantización, pero no hay dato publicado que lo confirme.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es el método documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política de control robótico.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según el dataset, pero no se publica latencia medida en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 fine-tuned) | 3,14 mil millones | 4 cámaras 480x640 + estado 12D | Manipulación bimanual concreta | no disponible | Hugging Face, 0 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | visión + lenguaje + propiocepción | Modelo fundacional humanoide generalista | abierta según NVIDIA (consultar) | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot genéricas (ACT, Diffusion Policy) | no disponible | variables según configuración | Imitation learning por tarea | según LeRobot | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único montaje de robot y cámaras; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito medidas, por lo que se desconoce su fiabilidad real.
- Licencia no declarada: la model card indica "More Information Needed"; no se puede asumir uso comercial sin aclaración del autor.
- Dependencia del hardware: requiere un SO-101 bimanual con exactamente cuatro cámaras en las posiciones `right_top`, `left_top`, `right_follower` y `left_follower`; cualquier cambio de montaje invalida la política.
- Dataset pequeño: 100 episodios y unos 33 minutos de demostraciones implican riesgo de sobreajuste y baja robustez ante cambios de iluminación, posición de objetos o distracciones.
- Riesgo de alucinación en sentido robótico: puede generar acciones plausibles pero incorrectas ante estados fuera de distribución, sin mecanismo de verificación documentado.
- Idiomas: la tarea se condiciona en inglés; no hay evidencia de soporte multilingüe en el prompt.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero la ausencia de evaluación impide descartarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miya-k/so101_bimanual_Grasp_the_purple_block_GR00T17_relative_false
- Dataset de entrenamiento: https://huggingface.co/datasets/miya-k/so101_bimanual_Grasp_the_purple_block
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=miya-k/so101_bimanual_Grasp_the_purple_block
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
