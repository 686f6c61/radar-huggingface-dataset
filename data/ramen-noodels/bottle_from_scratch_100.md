# ramen-noodels/bottle_from_scratch_100

## Resumen

`bottle_from_scratch_100` es un modelo de política de difusión (Diffusion Policy) para control visuomotor robótico, entrenado por el usuario de Hugging Face ramen-noodels (Raman Talwar) mediante la librería LeRobot de Hugging Face. El modelo convierte observaciones visuales de una cámara en trayectorias de acción suaves y multi-paso, una técnica especialmente eficaz en tareas de manipulación que requieren contacto físico, como agarrar o manipular una botella.

El modelo se entrenó desde cero (from scratch) con un dataset de 100 demostraciones (`bottle_9d_100`) de una tarea de manipulación de botella en un brazo robótico SO-100. Su arquitectura sigue el enfoque del paper [Diffusion Policy](https://huggingface.co/papers/2303.04137), que trata el control como un proceso generativo de difusión en el espacio de acciones. Con 418,8 millones de parámetros, es un modelo compacto pensado para despliegue en robots de bajo coste, y su licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia de este modelo reside en su enfoque de entrenamiento reproducible y abierto: cualquier equipo puede reentrenarlo o evaluarlo con LeRobot, lo que lo convierte en un punto de partida útil para investigación en aprendizaje por imitación y manipulación robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo de difusión para control visuomotor) |
| Parámetros totales | 418.813.257 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el modelo procesa observaciones de imagen y genera acciones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, un enfoque que modela la política de control como un proceso de difusión denoising sobre el espacio de acciones. En lugar de predecir una única acción, el modelo genera una trayectoria completa de acciones futuras (ventana de predicción de varios pasos) de forma iterativa, lo que produce movimientos suaves y robustos frente a perturbaciones, especialmente en tareas de manipulación por contacto.

El entrenamiento se realizó con la librería LeRobot, sobre un dataset propio de 100 demostraciones de una tarea de manipulación de botella (`bottle_9d_100`). No se especifica en la información disponible el número de tokens ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO (no procede en el contexto de robótica). El modelo se entrenó desde cero (no es un fine-tuning de un modelo preentrenado), lo que indica que los pesos iniciales eran aleatorios y el aprendizaje se basó únicamente en las demostraciones del dataset.

## Capacidades

- Control visuomotor de robots: convierte observaciones de cámara en trayectorias de acción multi-paso para brazos robóticos.
- Manipulación por contacto: el modelo destaca en tareas que requieren contacto físico, como agarrar, empujar o manipular objetos.
- Generación de trayectorias suaves: la naturaleza generativa de la difusión produce movimientos continuos y suaves, sin saltos bruscos.
- Aprendizaje por imitación: es capaz de imitar comportamientos demostrados por un operador humano con el robot.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- No soporta tool calling, agentes, visión general ni lenguaje: es un modelo especializado de control, no un LLM.

## Casos de uso

- **Manipulación robótica en laboratorio**: el modelo puede controlar un brazo robótico SO-100 para tareas de agarre y manipulación de objetos, sirviendo de base para experimentos de aprendizaje por imitación.
- **Prototipado de políticas de control**: los investigadores pueden usarlo como punto de partida para entrenar nuevas políticas con el dataset `bottle_9d_100` y evaluar variaciones de la arquitectura de difusión.
- **Benchmark de control visuomotor**: al ser un modelo de referencia entrenado con LeRobot, puede utilizarse como línea base para comparar nuevas técnicas de aprendizaje por refuerzo o de control.
- **Despliegue educativo**: en entornos académicos, permite a estudiantes de robótica aprender a entrenar y evaluar políticas de difusión en hardware real sin necesidad de infraestructura de alto coste.
- **Desarrollo de sistemas de agarre industrial**: aunque el dataset es limitado, el modelo puede servir de base para transferir a tareas similares de agarre en entornos controlados.
- **Reproducción de experimentos**: al ser un modelo abierto y entrenado con una librería pública, permite reproducir los resultados del paper de Diffusion Policy en un contexto real de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre tasas de éxito, precisión de agarre ni métricas comparativas con otros modelos de control robótico.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 418,8 millones de parámetros, la inferencia en precisión FP16 requiere aproximadamente 0,8 GB de VRAM. En cuantización FP32 serían alrededor de 1,7 GB. Es un modelo ligero que cabe en cualquier GPU moderna.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA RTX 3050, GTX 1660, RTX 3060) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4070, etc.).
- **Despliegue en consumer GPU**: sí, el modelo es perfectamente viable en GPUs de gama de entrada. Para el entrenamiento, LeRobot recomienda GPU NVIDIA con CUDA.
- **Opciones de despliegue**: se integra con LeRobot (`lerobot-record` para evaluación en hardware real), y también puede ejecutarse en entornos de simulación. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, que son específicos de modelos de lenguaje, no de robótica.
- **Latencia y throughput**: no disponible. La latencia depende del robot y del hardware, pero al ser un modelo de difusión con varias pasos de denoising, la inferencia puede tardar decenas de milisegundos por paso en una GPU consumer.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (políticas de difusión para robótica) con los que se pueda establecer una comparación fiable.

## Limitaciones y advertencias

- **Dataset de entrenamiento reducido**: el modelo se entrenó con solo 100 demostraciones de una tarea específica (manipulación de botella), por lo que su capacidad de generalización a otras tareas u objetos es limitada.
- **Sesgos de demostración**: el comportamiento depende en gran medida de la calidad y variabilidad de las demostraciones humanas; si las demostraciones son homogéneas, el modelo puede fallar ante variaciones de iluminación, posición del objeto o perturbaciones.
- **Riesgo de sobreajuste**: con 418 millones de parámetros y solo 100 demostraciones, existe un riesgo claro de sobreajuste al dataset de entrenamiento.
- **Sin datos de rendimiento**: no se han publicado métricas de éxito ni evaluaciones sistemáticas, por lo que no se puede cuantificar su fiabilidad en producción.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías de funcionamiento ni soporte.
- **Dependencia de LeRobot**: el modelo está atado al ecosistema LeRobot para su despliegue, lo que puede limitar su integración con otros stacks robóticos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ramen-noodels/bottle_from_scratch_100)
- [Paper Diffusion Policy](https://huggingface.co/papers/2303.04137)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
