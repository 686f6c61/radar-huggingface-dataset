# felsager/pi05_cube2cross_dr_bs128

## Resumen

pi05_cube2cross_dr_bs128 es un fine-tuning del modelo Vision-Language-Action (VLA) π₀.₅ (Pi05), originalmente desarrollado por Physical Intelligence, adaptado a la biblioteca LeRobot de Hugging Face. El modelo base (lerobot/pi05_base) está diseñado para generalización en mundo abierto, permitiendo que robots manipuladores operen en entornos y situaciones no vistas durante el entrenamiento. Esta versión concreta ha sido entrenada por el usuario felsager para una tarea específica de manipulación: recoger cubos de colores (verde, azul, amarillo y rojo) y colocarlos sobre una cruz roja, usando un robot UR5e con mano (ur5e_hand_e).

El modelo se ha entrenado mediante aprendizaje por imitación sobre un dataset propio de 999 episodios y más de 510.000 fotogramas grabados a 30 FPS, con dos cámaras (superior y de muñeca). Con aproximadamente 4.143 millones de parámetros, pertenece a la categoría de políticas VLA de tamaño medio, capaces de procesar imágenes y estados del robot para generar acciones de control continuo. Su relevancia radica en la creciente adopción de LeRobot como marco estándar para robótica open source, que permite a cualquier laboratorio o aficionado adaptar modelos VLA de última generación a sus propios robots con relativamente poco esfuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (implementación LeRobot de OpenPI) |
| Parametros totales | 4.143.404.816 (~4.143 M) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (tamaño del repo: 24,9 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de lerobot/pi05_base, la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence (repositorio OpenPI). π₀.₅ es un modelo VLA que combina un backbone de visión-lenguaje con una cabeza de acción para generar comandos de control continuo para robots manipuladores; su propuesta de valor frente a π₀ es la generalización a entornos y situaciones completamente nuevos no vistos durante el preentrenamiento. Los detalles internos exactos del backbone (modelo de lenguaje base, tokenizador de imágenes, tipo de cabeza de acción como flow matching o diffusion) no están especificados en la model card de este repo.

El entrenamiento se realizó sobre el dataset felsager/vla_cubes_cross_dr, que contiene 999 episodios con 510.363 fotogramas a 30 FPS, cubriendo cuatro tareas de recogida y colocación de cubos de colores sobre una cruz roja. La configuración de entrenamiento fue: 30.000 pasos, batch size 8, optimizador AdamW con learning rate 5e-05 y semilla 0, usando LeRobot versión 0.6.2. Las observaciones de entrada incluyen el estado del robot (vector de 10 dimensiones), imágenes de las cámaras top y wrist a 480x640, y una cámara adicional vacía (empty_camera_0) a 224x224. La salida es un vector de acción de 10 dimensiones. No hay datos sobre si se emplearon técnicas adicionales como RLHF o DPO (habitual en modelos de lenguaje, pero no aplicable directamente a políticas de imitación).

## Capacidades

- Generación de acciones de control continuo (vectores de 10 dimensiones) para un robot manipulador UR5e con mano.
- Percepción visual mediante dos cámaras: vista superior (top) y vista de muñeca (wrist), ambas a 480x640 píxeles.
- Seguimiento de instrucciones en lenguaje natural para las cuatro tareas entrenadas: recoger el cubo verde, azul, amarillo o rojo y colocarlo sobre la cruz roja.
- Discriminación de objetos por color en escenas de manipulación.
- Compatibilidad con el ecosistema LeRobot: despliegue mediante `lerobot-rollout` y reentrenamiento desde el modelo base con `lerobot-train`.
- Al derivar de π₀.₅, hereda potencialmente cierta capacidad de generalización, aunque este fine-tuning concreto está especializado en la tarea descrita.

No hay evidencia en la model card de capacidades de razonamiento textual, generación de código, tool calling, capacidades de agentes ni soporte multilingüe: se trata de una política robótica, no de un chatbot.

## Casos de uso

- Automatización de tareas pick-and-place en laboratorios de investigación: el modelo puede ejecutar de forma autónoma la recogida de cubos de colores y su colocación en una marca objetivo, útil como punto de partida para experimentos de manipulación reproducibles.
- Prototipado rápido de políticas VLA personalizadas: al estar basado en pi05_base, sirve como referencia práctica para quien quiera hacer fine-tuning sobre sus propios datasets grabados con LeRobot, siguiendo el comando `lerobot-train` documentado.
- Validación de setups de teleoperación y captura de datos: el dataset de 999 episodios y el pipeline de entrenamiento ilustran un flujo completo de grabación (30 FPS, cámaras top y wrist) que otros equipos pueden replicar para sus robots UR5e.
- Evaluación de generalización entre variaciones de tarea: al entrenar con cuatro colores de cubo distintos, el modelo permite estudiar si la política generaliza a combinaciones no vistas o a nuevas posiciones de objetos.
- Docencia y formación en robótica: el ejemplo completo (dataset, configuración de entrenamiento, comandos de despliegue) es material didáctico para cursos sobre aprendizaje por imitación en robótica.
- Integración en células robóticas con UR5e: cualquier laboratorio con un UR5e, una pinza/mano compatible y cámaras OpenCV puede desplegar la política directamente con `lerobot-rollout` indicando el puerto del robot y las cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet" (no se han proporcionado resultados de evaluación para esta política). No existen datos de tasa de éxito en las tareas, ni comparativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente; con ~4.143 millones de parámetros en safetensors (repo de 24,9 GB, lo que sugiere pesos en precisión completa o mixta), una GPU con al menos 16-24 GB de VRAM sería un punto de partida razonable, aunque la cifra exacta no está documentada.
- GPU recomendadas: no disponible; el entrenamiento se configuró con `--policy.device=cuda`, por lo que se requiere una GPU NVIDIA compatible con CUDA.
- Consumer GPUs: no disponible; no consta en qué tarjetas de consumo se ha probado. Dado el tamaño (~4.100 M de parámetros), una RTX 4090 (24 GB) sería candidata plausible, pero sin confirmación oficial.
- Opciones de despliegue: LeRobot es la vía documentada, mediante el comando `lerobot-rollout` con `--policy.path=felsager/pi05_cube2cross_dr_bs128`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje convencional.
- Latencia y throughput: no disponible. El dataset se grabó a 30 FPS, lo que sugiere que la inferencia debería operar a frecuencias compatibles con ese ritmo de control, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| felsager/pi05_cube2cross_dr_bs128 | ~4.143 M | Pick-and-place de cubos de colores (UR5e) | gemma | Público en Hugging Face |
| lerobot/pi05_base | ~4.143 M (base) | Modelo VLA base multi-tarea | gemma | Público en Hugging Face |
| Otros fine-tunings de pi05 en LeRobot | ~4.143 M | Variadas, según dataset de cada autor | gemma | Públicos en Hugging Face |

No se dispone de datos de rendimiento que permitan comparar calidad entre estos modelos. Como referencia de categoría, π₀.₅ compite con otros VLA open source como OpenVLA u GR00T de NVIDIA, pero no hay datos publicados en este repo que cuantifiquen esas diferencias.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para cuatro tareas concretas (recoger cubo de un color específico y colocarlo sobre la cruz roja) con un robot ur5e_hand_e y unas cámaras concretas (top y wrist a 480x640). No debe esperarse que funcione en otros robots, otras cámaras u otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay datos de tasa de éxito, robustez ante cambios de iluminación, posiciones nuevas de objetos o distractores. El propio template de la model card advierte de que estos factores afectan a la dificultad.
- Requisitos de hardware robótico: el despliegue exige un UR5e físico con mano, cámaras OpenCV configuradas con los nombres exactos de las claves de observación (`top`, `wrist`, `empty_camera_0`) y el puerto del robot correctamente indicado.
- Licencia gemma: hereda las restricciones de la licencia Gemma, que incluye condiciones de uso aceptable y limitaciones sobre redistribución; conviene revisar los términos antes de cualquier uso comercial.
- Riesgo de sobreajuste: con 999 episodios de una única célula de trabajo, el comportamiento fuera de la distribución de entrenamiento (nuevas posiciones, objetos distintos, fondos diferentes) es impredecible.
- Cero descargas y cero likes en el momento de la ficha: no existe evidencia comunitaria de que el modelo funcione como se describe; se recomienda validar en un entorno controlado antes de cualquier despliegue.
- Al ser un modelo de imitación, no hay garantías de seguridad física: la política puede generar acciones inesperadas y debe probarse siempre con el robot en un espacio seguro y con supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_dr_bs128
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi (referenciado como "OpenPI repository" en la model card)
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
