# angkul07/pi05-mm-so101-sim-vs-ego

## Resumen

El modelo `angkul07/pi05-mm-so101-sim-vs-ego` es un checkpoint experimental de un modelo de visión-lenguaje-acción (VLA) basado en π₀.₅ (pi0.5) de Physical Intelligence, desarrollado por el usuario angkul07. El objetivo del experimento es evaluar si la inclusión de vídeo humano retargetizado (EgoDex) sobre un corpus de simulación muy pequeño (9 minutos y 15 segundos de ManiSkill SO-101) mejora el rendimiento en una tarea de pick-and-place con el brazo robótico SO-101. Se entrenaron tres variantes con diferentes mezclas de datos de simulación y ego, todas con un presupuesto de 2.400 pasos y 64 muestras por lote.

El modelo está pensado para investigación en robótica, específicamente para estudiar el impacto de la co-formación (co-training) con datos de demostración humana retargetizada en un entorno sim-to-real. Es un modelo de acción pura, sin capacidades de lenguaje conversacional, y su salida son acciones de articulaciones delta y estado de pinza absoluto. La licencia es Apache 2.0, lo que permite uso comercial, pero el estado del experimento es preliminar: no se ha realizado evaluación offline sobre el conjunto de retención, por lo que los resultados deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basado en π₀.₅ (flow matching) con LoRA |
| Parametros totales | no disponible (modelo base: physical-intelligence/pi05_base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de acción, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 40.2 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un VLA de Physical Intelligence que utiliza flow matching para generar acciones. La arquitectura exacta (número de capas, dimensiones, etc.) no se detalla en la información proporcionada, pero se sabe que se empleó una variante LoRA (rango no especificado) sobre el modelo base `pi05_base`. El entrenamiento se realizó con tres configuraciones de mezcla de datos: `sim10` (solo simulación), `mix10` (mitad simulación, mitad ego, con presupuesto de datos fijo) y `mix20` (mitad simulación, mitad ego, con más datos de ego añadidos a presupuesto de cómputo fijo). Se usó normalización por cuantiles, acciones delta de articulaciones y pinza absoluta, y un programador de tasa de aprendizaje con calentamiento de 250 pasos y decaimiento coseno. El entrenamiento duró aproximadamente una hora por variante en 2× H100 80GB.

El dataset de simulación proviene de ManiSkill SO-101 (tarea de pick-and-place de cubo azul en bandeja naranja), con 5 episodios de retención sin usar. El dataset de ego consiste en 324 clips de EgoDex retargetizados al mismo brazo. No se menciona el uso de RLHF o DPO; el entrenamiento es puramente supervisado con pérdida de flow matching.

## Capacidades

- Control de brazo robótico SO-101 para tareas de manipulación (pick-and-place) a partir de observaciones visuales.
- Generación de acciones de articulaciones delta y estado de pinza absoluto mediante flow matching.
- Capacidad de co-formación con datos de simulación y demostraciones humanas retargetizadas (sim-to-real).
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de modelos de lenguaje.
- No tiene capacidades de visión general más allá de la entrada de cámara para control robótico.
- No es multilingüe; es un modelo de acción, no de texto.

## Casos de uso

- Investigación en sim-to-real para robótica: el modelo permite estudiar cómo la inclusión de datos de demostración humana retargetizada afecta el rendimiento en tareas simuladas, con un presupuesto de cómputo controlado.
- Entrenamiento de políticas de manipulación con datos escasos: la variante `mix10` explora si sustituir la mitad de un corpus de simulación muy pequeño por vídeo ego mejora la generalización, útil para dominios donde los datos simulados son caros de generar.
- Evaluación de estrategias de mezcla de datos: las tres variantes proporcionan un punto de partida para comparar reemplazo vs. aumento de datos en VLA, con métricas de pérdida y diversidad de tareas.
- Prototipado de pipelines de co-training: el experimento demuestra un flujo de trabajo con OpenPI y LeRobot para integrar datos heterogéneos (sim y ego) en un único entrenamiento.
- Análisis de normalización y estabilidad: los informes sobre rangos de acción y pérdida pueden servir para diseñar esquemas de normalización más robustos en VLA.
- Base para evaluación offline posterior: los checkpoints están disponibles para que otros investigadores ejecuten la evaluación en el conjunto de retención y comparen con sus propios métodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El informe solo reporta la pérdida de flow matching en los últimos 200 pasos de entrenamiento: `sim10` 0.001750, `mix10` 0.001665 y `mix20` 0.002930. El autor advierte explícitamente que la pérdida de entrenamiento no puede clasificar las variantes debido a diferencias en la normalización y la diversidad de tareas. No hay evaluación offline sobre el conjunto de retención (5 episodios de simulación), por lo que no se dispone de métricas de éxito en la tarea.

## Requisitos de hardware

- Entrenamiento: se utilizaron 2× H100 80GB durante aproximadamente 1 hora por variante (2.400 pasos, batch 64, bf16).
- Inferencia: no se especifican requisitos, pero al ser un modelo de ~3.3B parámetros (según el tamaño típico de π₀.₅), se estima que necesita al menos 8-12 GB de VRAM en cuantización de 8 bits, o 16-20 GB en bf16. Esto es una estimación, no un dato confirmado.
- GPUs recomendadas: H100, A100, RTX 4090 (para inferencia con cuantización ligera).
- Opciones de despliegue: el modelo usa la librería OpenPI, por lo que se puede ejecutar con el framework de Physical Intelligence. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros VLA en la información proporcionada. Modelos comparables en la categoría de VLA para robótica incluyen OpenVLA (7B, licencia MIT), RT-2 (Google, no abierto) y el propio π₀.₅ base (Physical Intelligence, Apache 2.0). Sin embargo, no hay datos de rendimiento en tareas comunes para establecer una tabla comparativa. Se recomienda consultar la documentación de OpenPI y los benchmarks de ManiSkill para comparaciones futuras.

## Limitaciones y advertencias

- El experimento no ha sido evaluado offline; los resultados de pérdida de entrenamiento no son concluyentes sobre el rendimiento real en la tarea.
- Las tres variantes están subentrenadas (2.400 pasos no fueron suficientes; la pérdida seguía disminuyendo al final).
- Existen diferencias en la normalización de acciones entre las variantes, lo que impide comparar directamente las pérdidas.
- La diversidad de tareas en el lote aumenta con la proporción de datos ego, lo que hace que la pérdida sea parcialmente un reflejo de la dificultad del objetivo, no solo de la calidad de la política.
- No se proporcionan métricas de éxito físico (por ejemplo, tasa de éxito en el holdout).
- El modelo es específico para el brazo SO-101 y la tarea de pick-and-place; no se puede generalizar a otros embodiments sin reentrenamiento.
- Aunque la licencia es Apache 2.0, el modelo es un checkpoint experimental y no está listo para producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/angkul07/pi05-mm-so101-sim-vs-ego
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Dataset de simulación: https://huggingface.co/datasets/makermods/maniskill_50ep_so101_blue_cube_orange_tray_20260812_131142
- Librería OpenPI: https://github.com/physical-intelligence/openpi (inferido, no confirmado en la información proporcionada)
