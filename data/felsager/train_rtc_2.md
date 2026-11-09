# felsager/train_rtc_2

## Resumen

`felsager/train_rtc_2` es un ajuste fino (fine-tune) del modelo vision-lenguaje-acción π₀.₅ (Pi05) de Physical Intelligence, distribuido a través del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje al uso, sino una política robótica de imitación que transforma observaciones multimodales (dos cámaras y el estado de las articulaciones) en comandos de acción de 10 dimensiones para un brazo robótico UR5e con pinza. El autor, `felsager`, lo ha entrenado sobre un dataset propio de manipulación de cubos de colores.

El modelo hereda la arquitectura de π₀.₅, diseñada para generalizar a entornos y situaciones no vistos durante el entrenamiento, y contiene 4.143.404.816 parámetros en formato safetensors, con un repositorio de 24,5 GB. Su relevancia radica en que ejemplifica el flujo completo de LeRobot para el ajuste de políticas VLA: grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout` sobre hardware real.

La tarea aprendida es concreta y acotada: recoger un cubo de un color (verde, azul, amarillo o rojo) y colocarlo sobre una cruz roja. El modelo se publicó con fecha de creación del 9 de noviembre de 2026 y, en el momento de redactar esta ficha, no cuenta con descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto libre) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Libreria | lerobot (0.6.2 en entrenamiento) |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist (3×480×640 cada una) |
| Entrada de estado | observation.state, shape (10,) |
| Salida de accion | action, shape (10,) |
| Tamano del repositorio | 24,5 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune de π₀.₅, un VLA de Physical Intelligence que evoluciona π₀ con el objetivo de generalizar a entornos y situaciones completamente nuevos. La implementación utilizada es la de LeRobot, adaptada del repositorio open source OpenPI. La política consume dos flujos visuales (`observation.images.top` y `observation.images.wrist`, ambos de 3×480×640 píxeles) junto con el estado del robot (`observation.state`, vector de 10 dimensiones) y produce un vector de acción de 10 dimensiones. No se detalla en la información disponible la composición interna del transformer, el número de tokens de entrenamiento lingüístico ni si se emplearon etapas de RLHF o DPO.

El ajuste fino se realizó sobre el dataset `felsager/vla_cubes_cross_dr`, compuesto por 999 episodios y 510.363 fotogramas a 30 FPS. Las tareas del dataset son cuatro instrucciones de manipulación: recoger el cubo verde, azul, amarillo o rojo y colocarlo sobre la cruz roja. La configuración de entrenamiento fue de 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05 y semilla 0. No se especifica el número total de tokens vistos ni la composición exacta del dataset más allá de los episodios y fotogramas indicados.

## Capacidades

- Control robótico de manipulación: genera acciones de 10 dimensiones para un UR5e con pinza a partir de observaciones visuales y propioceptivas.
- Percepción visual multi-cámara: procesa simultáneamente una vista cenital (`top`) y una vista de muñeca (`wrist`) a 480×640.
- Ejecución de instrucciones en lenguaje natural acotadas: las cuatro tareas de recogida y colocación de cubos sobre la cruz roja.
- Política de imitación entrenada de extremo a extremo con LeRobot.
- Integración con el pipeline de LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo thinking; se trata de una política robótica especializada, no de un asistente conversacional.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la secuencia de recoger un cubo de color y depositarlo sobre una cruz roja, adecuado para validar pipelines de imitación en un UR5e antes de escalar a tareas más complejas.
- Prototipado de políticas VLA con LeRobot: sirve como referencia de un fine-tune completo (dataset, configuración y comando de rollout) para equipos que quieran replicar el flujo con sus propios datos.
- Evaluación de generalización visual: al entrenarse con dos cámaras y 999 episodios, permite estudiar cómo se comporta la política ante cambios de iluminación, posición de objetos o distracciones en el entorno.
- Docencia e investigación en robótica: útil como caso de estudio de imitación visual-motora con un modelo base abierto y licencia Gemma.
- Benchmark interno de hardware: al estar atado a un robot concreto (`ur5e_hand_e`), permite comparar latencia y tasa de éxito entre configuraciones de GPU y versiones de LeRobot.
- Base para nuevos fine-tunes: al derivar de `lerobot/pi05_base`, puede servir como punto de partida o comparación para entrenar políticas en tareas de manipulación relacionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y deja la tabla de éxito por tarea sin rellenar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143 millones de parámetros en safetensors, el peso en precisión completa ronda los 16,5 GB, pero no se documenta la cuantización ni el consumo real en el robot.
- GPU recomendadas: no disponible. No se especifica hardware de referencia para el entrenamiento ni para el despliegue.
- Viabilidad en GPU de consumo: no disponible; no se confirma que quepa en tarjetas como RTX 4090.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` para ejecución sin grabación de episodios, y `lerobot-train` para reentrenamiento. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible. El dataset se grabó a 30 FPS, pero no se indica la frecuencia de control efectiva en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/train_rtc_2 | 4.143.404.816 | no disponible | VLA (π₀.₅ fine-tune) | gemma | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA (π₀.₅ base) | no disponible | Hugging Face |
| π₀ (Pi0) | no disponible | no disponible | VLA | no disponible | OpenPI / Physical Intelligence |

La comparación se limita al modelo base del que deriva y a la generación anterior de la familia, ya que no se dispone de datos de rendimiento ni de parámetros de los alternativos en la información proporcionada. No se han identificado otros fine-tunes comparables con especificaciones verificables.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha sido entrenada para cuatro instrucciones de recogida y colocación de cubos sobre una cruz roja; no se espera que generalice a otras tareas sin reentrenamiento.
- Dependencia de hardware: está atada a un robot `ur5e_hand_e` y a dos cámaras con nombres y posiciones concretos (`top`, `wrist`); cualquier cambio de montaje o calibración puede degradar el comportamiento.
- Ausencia de evaluación publicada: no hay tasas de éxito ni pruebas en robot real documentadas, por lo que el rendimiento en producción es desconocido.
- Riesgo de sobreajuste al dataset: con 999 episodios y 30.000 pasos, la variabilidad de posiciones, iluminación y objetos puede ser limitada.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los términos de la licencia Gemma, que impone condiciones específicas; debe revisarse antes de un despliegue productivo.
- Idiomas: no se documentan capacidades multilingües; las instrucciones de texto del dataset están en inglés.
- Sin datos de sesgos, alucinación o robustez fuera de distribución: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/train_rtc_2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
- Blog de π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
