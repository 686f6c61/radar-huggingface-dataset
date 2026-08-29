# Atneura/act-so101-red-lego-minvar-10eps

## Resumen

El modelo `act-so101-red-lego-minvar-10eps` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Fue desarrollado por el usuario Atneura y está orientado a la tarea específica de recoger una pieza de Lego roja y depositarla en una caja, operando sobre un robot seguidor SO-101 con una cámara frontal. El modelo resuelve el problema de control de manipulación mediante aprendizaje por imitación a partir de demostraciones teleoperadas, prediciendo secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y precisión del movimiento.

Con 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en hardware robótico embebido o GPUs de consumo. Su relevancia radica en que demuestra un flujo completo de entrenamiento y despliegue de políticas de imitación con código abierto, reproducible con LeRobot, y su licencia Apache 2.0 permite uso comercial sin restricciones. Está entrenado con un dataset reducido de 10 episodios, lo que lo convierte en un ejemplo útil para evaluar la viabilidad de ACT con pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa imágenes y estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador de visión (basado en ResNet) con un transformador autoregresivo que predice bloques de acciones. La arquitectura fue propuesta en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). El modelo consume una imagen RGB de 480x640 píxeles y un vector de estado de 6 dimensiones (posición y orientación del efector), y produce acciones de 6 dimensiones (posición y orientación objetivo).

El entrenamiento se realizó con LeRobot versión 0.6.2 sobre un dataset de 10 episodios (5990 frames a 30 FPS) recopilados mediante teleoperación. Se usaron 5000 pasos de entrenamiento con batch size 8, optimizador AdamW y tasa de aprendizaje 1e-5. No se aplicaron técnicas de RLHF ni DPO; el método se basa únicamente en imitación supervisada con pérdida de entropía cruzada y regresión de acciones. No se dispone de información sobre el número total de tokens o composición del dataset más allá de los episodios y frames indicados.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea de pick-and-place de un objeto (pieza Lego) desde una posición inicial hasta un contenedor.
- Procesamiento visual: interpreta imágenes de una cámara frontal (480x640 RGB) para localizar y manipular el objeto.
- Generación de secuencias de acciones: predice chunks de acciones (6 dimensiones) de forma autoregresiva, lo que permite movimientos suaves y coordinados.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento e inferencia de LeRobot, incluyendo scripts de rollout y entrenamiento.
- No tiene capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico; es exclusivamente una política de control para un robot específico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede integrarse en un robot SO-101 para mover piezas pequeñas de un punto a otro, reduciendo la intervención humana en procesos repetitivos.
- Prototipado rápido de políticas de imitación: gracias a su tamaño reducido y al flujo de LeRobot, sirve como punto de partida para validar el método ACT con pocos datos antes de escalar a tareas más complejas.
- Investigación en aprendizaje por imitación: los investigadores pueden analizar el comportamiento del modelo en tareas de manipulación con datasets pequeños y comparar arquitecturas o hiperparámetros.
- Educación en robótica: como ejemplo funcional de entrenamiento de políticas con LeRobot, puede utilizarse en cursos para enseñar el ciclo completo de recolección de datos, entrenamiento y despliegue.
- Evaluación de robustez en entornos controlados: el modelo puede probarse en diferentes posiciones de la pieza o condiciones de iluminación para medir su generalización, aunque no se han publicado resultados formales.
- Base para fine-tuning: dado su licencia permisiva y tamaño, puede ajustarse con nuevos datos para tareas similares de manipulación, por ejemplo cambiar el objeto o el contenedor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se dispone de métricas como tasa de éxito, MMLU, HumanEval u otras, ya que el modelo no pertenece a la categoría de modelos de lenguaje o visión general.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parámetros, la inferencia requiere aproximadamente entre 1 y 2 GB de VRAM en precisión FP32, y menos si se cuantiza (aunque no se han publicado cuantizaciones). Es factible en GPUs de consumo como la RTX 3060 o superiores.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 2060) puede ejecutar la inferencia. El entrenamiento completo con 5000 pasos puede realizarse en una GPU de 8 GB (p. ej., RTX 3070).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo comunes.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que ofrece scripts de rollout en Python (por ejemplo, `lerobot-rollout`). También puede integrarse en sistemas ROS 2 a través del stack `so101-ros-physical-ai` (ver enlaces). No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño del modelo y el uso de imágenes 480x640, se espera que la inferencia sea de decenas de milisegundos en una GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría dentro del repositorio de Atneura (por ejemplo, otras variantes de ACT con distintos datasets). No se puede establecer una comparativa cuantitativa sin datos de evaluación. Se recomienda revisar el Hub de Hugging Face con el tag `lerobot` y `act` para encontrar políticas similares, aunque no se han analizado en esta ficha.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea específica (recoger una pieza Lego roja y colocarla en una caja) y un robot concreto (SO-101 seguidor). No generaliza a otras tareas u objetos sin reentrenamiento.
- No se han publicado resultados de evaluación en robot real, por lo que su tasa de éxito real es desconocida.
- El dataset de entrenamiento es muy reducido (10 episodios), lo que puede provocar sobreajuste y baja robustez ante variaciones de iluminación, posición o textura.
- No es un modelo de lenguaje ni de visión general; no puede procesar texto, audio ni realizar razonamiento simbólico.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo depende del hardware específico (robot SO-101) y del software LeRobot, por lo que su despliegue en otros robots requeriría adaptaciones significativas.
- Los datos de entrenamiento pueden contener sesgos implícitos del operador que teleoperó el robot, aunque no se han documentado.
- No se dispone de información sobre cuantizaciones ni optimizaciones para reducir la latencia, lo que puede limitar su uso en sistemas con restricciones de tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Atneura/act-so101-red-lego-minvar-10eps
- Dataset de entrenamiento: https://huggingface.co/datasets/Atneura/so101-red-lego-to-bin-minvar-10eps_20260829_102319
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Stack ROS 2 para SO-101: https://github.com/legalaspro/so101-ros-physical-ai
