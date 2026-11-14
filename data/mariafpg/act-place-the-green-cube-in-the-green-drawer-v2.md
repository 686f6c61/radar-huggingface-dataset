# MariaFPG/act-place-the-green-cube-in-the-green-drawer-v2

## Resumen

ACT (Action Chunking Transformer) aplicado a una tarea concreta de manipulación robótica: colocar un cubo verde en el cajón verde. El modelo lo publica la usuaria MariaFPG en Hugging Face como política entrenada con LeRobot, la librería de aprendizaje por imitación del ecosistema Hugging Face, sobre la implementación local de Trossen AI Stationary. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un controlador visuomotor que, dada la observación de cámara y el estado del robot, predice una secuencia de acciones (un *chunk*) para ejecutar la tarea.

El repositorio contiene el checkpoint final tras 100.000 pasos de entrenamiento (completado el 2026-11-14), además de checkpoints intermedios en los pasos 20.000, 40.000, 60.000, 80.000 y 100.000 con estados de optimizador y RNG para reanudar el entrenamiento. Los pesos suman 51.685.114 parámetros en formato safetensors y el repo ocupa 3,1 GB.

Su relevancia es acotada pero práctica: sirve como referencia reproducible de un pipeline completo de imitación con ACT sobre hardware Trossen, útil para quien quiera replicar el flujo, comparar checkpoints o reutilizar la receta en una tarea de *pick-and-place* similar. No hay datos publicados de benchmarks, licencia ni idiomas, lo que limita su uso directo en producción sin verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política visuomotora para robótica |
| Parametros totales | 51.685.114 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre observaciones por paso y predice chunks de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer que combina un codificador visual (procesa las imágenes de cámara), un codificador de estado (posición de articulaciones y demás observaciones proprioceptivas) y un decodificador transformer que predice un *chunk* de acciones futuras en lugar de una única acción por paso. Esta decodificación por chunks reduce el error de composición típico de las políticas paso a paso y suaviza la ejecución. El modelo se entrena por imitación (behavior cloning) sobre demostraciones teleoperadas, sin RLHF ni DPO, que no aplican en este dominio.

Según la model card, el entrenamiento se completó a 100.000 pasos el 2026-11-14 usando la implementación local de Trossen AI Stationary LeRobot, sobre el dataset `MariaFPG/place_the_green_cube_in_the_green_drawer`. No se especifican en la información disponible el número de episodios, la composición del dataset, la resolución de las cámaras, la tasa de control ni hiperparámetros de entrenamiento (learning rate, batch size, aumentaciones). El repo incluye checkpoints intermedios con estados de optimizador y RNG, lo que permite reanudar o comparar curvas de entrenamiento.

## Capacidades

- Control visuomotor para una tarea de manipulación concreta: colocar un cubo verde en un cajón verde.
- Predicción de secuencias de acciones (*action chunking*) a partir de observaciones visuales y de estado del robot.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (behavior cloning).
- Reanudación de entrenamiento desde checkpoints intermedios (20k, 40k, 60k, 80k, 100k) con estados de optimizador y RNG.
- Integración con el ecosistema LeRobot (carga de políticas, evaluación y despliegue).
- No dispone de tool calling, function calling, razonamiento multi-paso genérico, capacidades multilingües, visión general, audio ni modo de pensamiento. Es una política específica de tarea.

## Casos de uso

- Replicación de un pipeline de imitación con ACT: el repo sirve como ejemplo completo (dataset, pesos finales, checkpoints intermedios) para montar un flujo de entrenamiento LeRobot sobre hardware Trossen AI Stationary y verificar cada etapa.
- Evaluación comparativa de checkpoints: los cinco checkpoints intermedios permiten medir cómo evoluciona la tasa de éxito de la tarea a lo largo del entrenamiento y detectar sobreajuste o estancamiento.
- Base para *fine-tuning* en tareas de pick-and-place similares: partiendo del checkpoint de 100k, se puede adaptar la política a variantes como cambiar el objeto, el destino o la disposición de la mesa, siempre que se disponga de nuevas demostraciones.
- Estudio de action chunking en robótica: útil para analizar empíricamente el efecto del tamaño de chunk y de la frecuencia de control sobre la suavidad y precisión de la ejecución.
- Docencia y demostraciones: ejemplo didáctico de behavior cloning de extremo a extremo con un dataset pequeño y hardware accesible, adecuado para cursos de robótica o aprendizaje por imitación.
- Validación de infraestructura de despliegue: sirve para probar la integración de políticas LeRobot en un bucle de control real (lectura de cámaras, inferencia, envío de acciones al robot) antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 millones de parámetros en precisión FP32, los pesos ocupan aproximadamente 207 MB; en FP16, unos 103 MB. A esto hay que sumar activaciones y buffers del codificador visual, por lo que una GPU con 4-8 GB de VRAM es suficiente en la práctica.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutar la inferencia; para entrenamiento, se recomienda una GPU con al menos 8-16 GB de VRAM (RTX 4080/4090, A100, H100) según el tamaño de batch y la resolución de las cámaras.
- Cabe en GPU consumer: sí, con holgura, incluso en GPUs de gama media con 6-8 GB.
- Opciones de despliegue: LeRobot (carga de políticas y bucle de control), PyTorch nativo; no se dispone de conversiones a GGUF, ONNX ni TensorRT en la información proporcionada. llama.cpp, Ollama, vLLM y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen de la frecuencia de control del robot, la resolución de las cámaras y el tamaño de chunk, datos que no figuran en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT place green cube v2 (este modelo) | 51,7 M | observaciones por paso, chunk de acciones | no disponible | no disponible | Hugging Face, LeRobot |
| ACT original (Zhao et al.) | ~80 M (configuración de referencia) | observaciones por paso, chunk de acciones | reportado en el paper original | código abierto (según paper) | paper + repositorio |
| Diffusion Policy (Chi et al.) | variable según configuración | observaciones por paso, horizonte de acciones | reportado en el paper original | código abierto (según paper) | paper + repositorio |

La comparación con el ACT original y con Diffusion Policy se basa en conocimiento general de la literatura; no se dispone de métricas de este checkpoint concreto para contrastar rendimiento. El modelo aquí descrito está entrenado para una única tarea y no es directamente comparable en generalidad con políticas multi-tarea.

## Limitaciones y advertencias

- Modelo específico de una única tarea (colocar un cubo verde en un cajón verde); no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Sin licencia declarada: no se puede asumir permiso de uso comercial; es necesario contactar al autor antes de cualquier despliegue en producción.
- Sin datos de benchmarks ni tasas de éxito: no hay evidencia publicada de robustez ante variaciones de iluminación, posición de objetos o ruido de sensores.
- Riesgo de sobreajuste a las condiciones del dataset de demostraciones (posición de cámaras, mesa, robot Trossen AI Stationary); el rendimiento fuera de esas condiciones es desconocido.
- Entrenado con behavior cloning: hereda los sesgos y errores de las demostraciones humanas y puede fallar en estados no vistos (fuera de distribución).
- No dispone de capacidades lingüísticas, tool calling ni razonamiento multi-paso; no debe evaluarse como un modelo de lenguaje.
- La fecha de creación del repo (2026-11-14) y el entrenamiento completado ese mismo día deben tratarse con cautela; conviene verificar la integridad de los checkpoints antes de reutilizarlos.
- El repo de 3,1 GB incluye checkpoints intermedios con estados de optimizador; para despliegue en robot conviene usar solo el checkpoint final y descartar el resto para ahorrar espacio.

## Enlaces

- Hugging Face: https://huggingface.co/MariaFPG/act-place-the-green-cube-in-the-green-drawer-v2
- Dataset asociado: https://huggingface.co/datasets/MariaFPG/place_the_green_cube_in_the_green_drawer
- LeRobot (librería): https://github.com/huggingface/lerobot
- Trossen Robotics: https://www.trossenrobotics.com/
- Paper original de ACT (Zhao et al., 2023): https://arxiv.org/abs/2304.13705
- Paper de Diffusion Policy (Chi et al., 2023): https://arxiv.org/abs/2303.04137
