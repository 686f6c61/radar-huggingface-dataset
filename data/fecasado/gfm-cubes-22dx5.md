# fecasado/gfm-cubes-22dX5

## Resumen

GFM-cubes-22dX5 es una política robótica (policy) entrenada con LeRobot y publicada en HuggingFace por el usuario fecasado. No se trata de un modelo de lenguaje generativo, sino de un modelo de imitación para control robótico que implementa una variante de flow matching denominada gaze_flow_matching, orientada a tareas de manipulación con cubos. El modelo aprende a mapear observaciones visuales y estados del robot a acciones de control a partir del dataset Ncubes-to-Nbaskets-320x240, que registra demostraciones de trasvase de cubos a cestas con imágenes de resolución 320x240.

Con 75.247.306 parámetros y un tamaño de repositorio de 0,3 GB, es un modelo compacto diseñado para ejecutarse en hardware de consumo y en bucles de control en tiempo real. Su relevancia radica en que ejemplifica el flujo actual de entrenamiento de políticas de imitación con LeRobot, la librería de HuggingFace para robótica, y en que introduce el paradigma de flow matching como alternativa a las políticas de difusión clásicas para generar trayectorias de acción suaves y multimodales.

La ficha se basa exclusivamente en la información disponible en HuggingFace: la model card es una plantilla sin completar por el autor, por lo que muchos detalles técnicos (composición del dataset, hiperparámetros, resultados de evaluación) no están documentados y se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | gaze_flow_matching (política de imitación robótica basada en flow matching; detalles internos no disponibles) |
| Parámetros totales | 75.247.306 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ventana de observación no documentada) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8/INT4) |
| Idiomas soportados | no disponible (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | fecasado/Ncubes-to-Nbaskets-320x240 |
| Tamaño del repositorio | 0,3 GB |
| Descargas | 68 |
| Fecha de creación | 2026-10-28 |

## Arquitectura y entrenamiento

La arquitectura declarada es gaze_flow_matching, una política de imitación que combina flow matching con información de mirada (gaze). El flow matching es una familia de modelos generativos que aprenden un campo de vectores que transporta una distribución simple (por ejemplo, ruido gaussiano) hacia la distribución de acciones expertas, lo que permite generar trayectorias de acción multimodales de forma más directa que los modelos de difusión con múltiples pasos de denoising. El prefijo "gaze" sugiere la incorporación de señales de atención visual o de seguimiento de mirada como entrada adicional, aunque la model card no detalla cómo se integra esta señal ni qué codificador visual se emplea.

El entrenamiento se realizó con LeRobot sobre el dataset Ncubes-to-Nbaskets-320x240, que contiene demostraciones teleoperadas de una tarea de manipulación (trasvase de cubos a cestas) con observaciones de cámara a 320x240 píxeles. La model card no especifica el número de episodios, la composición exacta del dataset, el número de pasos de entrenamiento, ni si se aplicaron técnicas de regularización o aumento de datos. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones a partir de observaciones visuales y del estado del robot para ejecutar la tarea de trasvase de cubos a cestas.
- Generación de trayectorias multimodales mediante flow matching, lo que permite representar distintas formas válidas de completar la tarea.
- Integración con el ecosistema LeRobot: entrenamiento con lerobot-train y evaluación con lerobot-record.
- Entrada visual a resolución 320x240, adecuada para cámaras de bajo coste en bancos de robótica de sobremesa.
- Uso potencial con el robot so100_follower, referenciado en los comandos de evaluación de la model card.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling, capacidades de agente conversacional ni soporte multilingüe.

## Casos de uso

- Manipulación de cubos en laboratorio: el modelo se emplea para que un brazo robótico recoja cubos y los deposite en una cesta, replicando las demostraciones del dataset Ncubes-to-Nbaskets-320x240. Es adecuado por su entrenamiento específico en esa tarea y su tamaño compacto.
- Investigación en políticas de imitación: sirve como punto de partida para comparar flow matching frente a políticas de difusión o ACT en tareas de manipulación con pocos datos.
- Prototipado con LeRobot: permite reproducir el pipeline completo de entrenamiento y evaluación (lerobot-train y lerobot-record) en un banco de pruebas con robot so100_follower.
- Educación y docencia en robótica: su licencia Apache 2.0 y sus 75 millones de parámetros facilitan su uso en cursos y prácticas de aprendizaje por imitación sin necesidad de hardware de gama alta.
- Evaluación de robustez visual: al operar con imágenes de 320x240, permite estudiar cómo afectan cambios de iluminación, fondo o posición de cámara al rendimiento de la política.
- Base para fine-tuning en tareas similares: puede adaptarse a otras tareas de pick-and-place con datasets propios, reutilizando los pesos como inicialización.
- Despliegue en robots de bajo coste: el reducido tamaño del repositorio (0,3 GB) y el número de parámetros permiten inferencia en GPUs de consumo integradas en estaciones de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 75,2 millones de parámetros en FP32 los pesos ocupan aproximadamente 0,3 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia en tiempo real. Para entrenamiento se recomienda al menos una RTX 3090 o A100, aunque no se documentan requisitos oficiales.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño del modelo.
- Opciones de despliegue: LeRobot (lerobot-record para evaluación e inferencia); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles; dependen del hardware, de la frecuencia de control del robot y del número de pasos de integración del flow matching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-cubes-22dX5 | 75,2 M | imágenes 320x240 | Manipulación de cubos (flow matching con gaze) | Apache 2.0 | HuggingFace |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación robótica genérica | Apache 2.0 (LeRobot) | HuggingFace / LeRobot |
| Políticas de difusión para robótica (p. ej. Diffusion Policy) | no disponible | no disponible | Imitación robótica multimodal | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a aspectos de disponibilidad y licencia.

## Limitaciones y advertencias

- La model card es una plantilla sin completar: no documenta arquitectura interna, hiperparámetros, composición del dataset ni resultados de evaluación.
- El modelo está entrenado para una tarea y un entorno concretos (cubos a cestas, imágenes 320x240); su generalización a otras tareas, objetos o cámaras no está demostrada.
- Riesgo de fallo ante cambios de iluminación, fondo, posición de cámara o configuración del robot distintos de los del dataset de entrenamiento.
- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones; cualquier uso en ese sentido es inadecuado.
- No se documentan sesgos, pero al ser un modelo de imitación puede reproducir sesgos presentes en las demostraciones teleoperadas (por ejemplo, trayectorias estereotipadas).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la procedencia y licencia del dataset asociado antes de un despliegue en producción.
- El número de descargas (68) y la ausencia de likes indican una adopción muy limitada, sin validación comunitaria documentada.
- No se especifican requisitos de seguridad física para la operación del robot; en producción es imprescindible implementar paradas de emergencia y límites de par.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fecasado/gfm-cubes-22dX5
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
