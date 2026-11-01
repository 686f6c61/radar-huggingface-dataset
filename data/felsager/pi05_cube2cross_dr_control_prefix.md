# felsager/pi05_cube2cross_dr_control_prefix

## Resumen

`felsager/pi05_cube2cross_dr_control_prefix` es un ajuste fino (fine-tune) del modelo π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado originalmente por Physical Intelligence y adaptado a la librería LeRobot de Hugging Face a través del repositorio OpenPI. La versión base, `lerobot/pi05_base`, está diseñada para generalización en mundo abierto, es decir, para operar en entornos y situaciones no vistas durante el entrenamiento. Este fine-tune concreto ha sido entrenado por el usuario `felsager` para una tarea de manipulación robótica muy específica: recoger cubos de distintos colores (verde, azul, amarillo y rojo) y colocarlos sobre una cruz roja, utilizando un brazo robótico UR5e con pinza.

El modelo resuelve el problema de la imitación de políticas de control robótico: dada una observación (estado del robot e imágenes de las cámaras superior y de muñeca), genera directamente acciones de control continuas. Su relevancia radica en que demuestra el flujo de trabajo completo de LeRobot para adaptar un VLA de propósito general a tareas concretas de laboratorio o industria, con un dataset de demostraciones propio y entrenamiento reproducible. El repositorio pesa 24,9 GB y contiene pesos en formato safetensors con 4.143.404.816 parámetros en total (≈4,14 mil millones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Physical Intelligence), implementación LeRobot |
| Parametros totales | 4.143.404.816 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (tamaño del repositorio: 24,9 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/pi05_base`, la implementación en LeRobot de π₀.₅, un modelo VLA de Physical Intelligence concebido para generalización en mundo abierto. Como política de acción, consume observaciones multimodales (un vector de estado de 10 dimensiones, imágenes de 480x640 de las cámaras `top` y `wrist`, y una cámara adicional de 224x224) y produce vectores de acción de 10 dimensiones que controlan directamente el robot. El nombre del repositorio sugiere el uso de un prefijo de control ("control_prefix"), aunque el detalle técnico de esta variante no está documentado en la model card.

El entrenamiento se realizó sobre el dataset `felsager/vla_cubes_cross_dr`, que contiene 999 episodios y 510.363 frames grabados a 30 FPS, con cuatro tareas de recogida y colocación de cubos de colores sobre una cruz roja. La configuración de entrenamiento publicada indica 30.000 pasos, tamaño de batch de 8, optimizador AdamW con tasa de aprendizaje de 5e-05, semilla 0 y versión 0.6.2 de LeRobot. No se especifica si el entrenamiento partió de pesos congelados, qué módulos se ajustaron ni si se emplearon técnicas como flow matching o decodificación por acciones, que son habituales en la familia π₀ pero no constan en la información disponible.

## Capacidades

- Generación de acciones de control robótico continuas (vectores de 10 dimensiones) a partir de observaciones visuales y de estado.
- Comprensión de instrucciones en lenguaje natural asociadas a las tareas de entrenamiento (recoger un cubo de un color concreto y colocarlo sobre una cruz roja).
- Procesamiento de imágenes de cámaras múltiples: vista superior (`top`) y vista de muñeca (`wrist`), ambas a 480x640, más una cámara auxiliar de 224x224.
- Control del robot `ur5e_hand_e` (brazo UR5e con pinza).
- Generalización potencial a variaciones del entorno gracias a la base π₀.₅, aunque limitada al dominio de la tarea entrenada.
- No es un modelo de lenguaje de propósito general: no genera texto, no soporta tool calling ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede ejecutar de forma autónoma la recogida de cubos de colores y su colocación en una marca objetivo, útil para automatizar tareas repetitivas de manipulación en bancos de pruebas.
- Investigación en imitación learning: sirve como punto de partida o baseline para comparar nuevas estrategias de entrenamiento de políticas VLA sobre el mismo dataset.
- Evaluación de generalización cross-object: al haber sido entrenado con cuatro colores de cubo, permite estudiar si la política transfiere a cubos de colores no vistos o a posiciones nuevas de la cruz.
- Prototipado de celdas robóticas con UR5e: integrable en un flujo LeRobot con cámaras OpenCV a 30 FPS para demos de manipulación guiada por visión.
- Generación de datos sintéticos o semi-automáticos: puede usarse como política inicial para recolectar demostraciones adicionales que refinén el dataset.
- Enseñanza y formación: el repositorio incluye comandos `lerobot-rollout` y `lerobot-train` listos para usar, lo que lo hace adecuado como ejemplo didáctico del ciclo completo de entrenamiento y despliegue de políticas en LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay evaluaciones en robot real ("No evaluation results have been provided for this policy yet") ni tasas de éxito por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con ~4.140 millones de parámetros en pesos sin cuantizar, cabe esperar un consumo del orden de 16-20 GB solo en pesos, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible; por el tamaño del modelo y el uso de `--policy.device=cuda` en el entrenamiento, una GPU con al menos 24 GB de VRAM (RTX 4090, A100, etc.) es una referencia razonable no confirmada.
- Consumer GPU: no disponible oficialmente; una RTX 4090 (24 GB) es el candidato más plausible para inferencia, sin garantías documentadas.
- Despliegue: mediante la librería LeRobot (versión 0.6.2 o compatible), con el comando `lerobot-rollout` indicado en la model card; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible; el dataset se graba a 30 FPS, lo que sugiere que la política está pensada para operar a esa frecuencia de control, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|
| felsager/pi05_cube2cross_dr_control_prefix | ~4,14 B (dato real) | Política VLA para UR5e, tarea cubo-a-cruz | gemma | Pesos públicos en Hugging Face |
| lerobot/pi05_base | no disponible (base del fine-tune) | VLA de propósito general, mundo abierto | gemma | Pesos públicos en Hugging Face |
| π₀.₅ original (Physical Intelligence, OpenPI) | no disponible | VLA de propósito general, mundo abierto | no disponible | Repositorio OpenPI open source |

Otros detalles comparativos (contexto, benchmarks, rendimiento) no disponibles para este fine-tune específico.

## Limitaciones y advertencias

- Alcance muy restringido: la política está entrenada exclusivamente para tareas de recogida de cubos de colores y colocación sobre una cruz roja con el robot `ur5e_hand_e`; no debe esperarse funcionamiento fuera de ese dominio sin reentrenamiento.
- Las claves de observación (nombres de cámaras `top` y `wrist`, dimensiones 480x640 y estado de 10 dimensiones) deben coincidir exactamente con las del entrenamiento; cualquier discrepancia romperá la inferencia.
- Riesgo de fallo físico: al tratarse de una política de control en robot real, errores de generalización pueden provocar colisiones o manipulaciones incorrectas; se recomienda supervisión y limitadores de seguridad.
- Sin evaluación publicada: no existen tasas de éxito ni pruebas en robot real documentadas, por lo que su fiabilidad es desconocida.
- Licencia gemma: hereda las restricciones de la licencia Gemma, que incluye condiciones de uso aceptable y obligaciones de atribución; conviene revisar los términos antes de cualquier despliegue comercial.
- Sesgos del dataset: con 999 episodios de un único montaje y condiciones de iluminación concretas, la política puede ser sensible a cambios de iluminación, posición de objetos o distractors.
- Adopción prácticamente nula hasta la fecha: 0 descargas y 0 likes, sin validación comunitaria.
- No es un modelo de lenguaje: no sirve para generación de texto, código ni razonamiento general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_dr_control_prefix
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Walkthrough de imitación learning: https://huggingface.co/docs/lerobot/en/il_robots
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
