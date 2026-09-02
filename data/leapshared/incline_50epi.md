# leapshared/Incline_50epi

## Resumen

El modelo `leapshared/Incline_50epi` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido entrenado con el framework LeRobot de Hugging Face sobre un conjunto de datos de 50 episodios teleoperados, con la tarea específica de colocar pesas metálicas en un carro situado en la parte superior de una rampa. El modelo está diseñado para operar sobre un robot bi_openarm_follower equipado con tres cámaras (una frontal y dos de muñeca), y produce comandos de acción de 16 dimensiones.

Con 51,7 millones de parámetros, este modelo es relativamente ligero en comparación con los grandes modelos de lenguaje, y su propósito no es el procesamiento de texto sino la generación de trayectorias de movimiento en tiempo real. Su relevancia radica en ser un ejemplo práctico de cómo aplicar ACT y LeRobot para resolver tareas de manipulación en entornos controlados, sirviendo como punto de partida para investigaciones en robótica y aprendizaje por imitación. La licencia Apache 2.0 permite su uso comercial y su modificación, lo que facilita su adopción en proyectos industriales y académicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.689.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT, presentada en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT se basa en un transformer que procesa observaciones multimodales —estado del robot (vector de 16 dimensiones) e imágenes de tres cámaras (resolución 480x640)— y genera un fragmento de acciones (action chunk) de 16 dimensiones que se ejecuta de forma secuencial. Esta predicción por lotes reduce la acumulación de errores y mejora la estabilidad en tareas de manipulación.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `leapshared/Incline_20260901_221322`, que contiene 50 episodios y 62.210 frames a 30 FPS. Se utilizaron 80.000 pasos de entrenamiento con un batch size de 32, optimizador AdamW y una tasa de aprendizaje de 1e-5, con semilla 42. No se aplicaron técnicas de refuerzo ni ajuste fino posterior; el modelo se entrenó exclusivamente mediante imitación supervisada sobre las demostraciones teleoperadas.

## Capacidades

- Control robótico bimanual: genera acciones de 16 dimensiones para un robot bi_openarm_follower, coordinando ambos brazos.
- Percepción visual multimodal: procesa simultáneamente imágenes de tres cámaras (frontal y dos de muñeca) para contextualizar la tarea.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas teleoperadas.
- Ejecución en tiempo real: al predecir fragmentos de acciones, puede operar a frecuencias compatibles con control en bucle cerrado.
- No incluye capacidades de lenguaje, tool calling, razonamiento simbólico ni procesamiento de texto; su ámbito es exclusivamente la generación de trayectorias motoras.

## Casos de uso

- Automatización de tareas de picking and placing en entornos industriales: el modelo puede integrarse en una celda de trabajo para colocar piezas en posiciones definidas, como la tarea de la rampa, reduciendo la intervención manual.
- Investigación en aprendizaje por imitación: sirve como banco de pruebas para comparar variantes de ACT, estrategias de aumento de datos o configuraciones de cámaras en tareas de manipulación.
- Desarrollo de prototipos robóticos en laboratorio: permite validar rápidamente un pipeline de entrenamiento con LeRobot antes de escalar a tareas más complejas.
- Teleoperación asistida: el modelo puede complementar el control manual sugiriendo acciones, útil en entornos de cirugía o mantenimiento remoto.
- Educación en robótica: como ejemplo didáctico para enseñar el flujo completo de recolección de datos, entrenamiento y despliegue de políticas con LeRobot.
- Evaluación de robustez en entornos controlados: al estar entrenado con 50 episodios, es adecuado para estudiar el efecto del número de demostraciones en la tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. Por tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño de 51,7 millones de parámetros y la entrada de imágenes, se estima que el modelo puede ejecutarse en GPUs con al menos 4 GB de VRAM, aunque no hay datos confirmados.
- GPU recomendadas: no se especifican. Por su tamaño, cualquier GPU moderna con soporte CUDA (p. ej., RTX 3060 o superior) debería ser suficiente para inferencia en tiempo real.
- Compatibilidad con GPU de consumo: probablemente sí, dado el bajo número de parámetros, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo se integra con LeRobot, que ofrece scripts de rollout (`lerobot-rollout`) y soporte para entrenamiento en local. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la resolución de las cámaras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de robótica basadas en ACT) dentro de los datos proporcionados. Por tanto, no es posible realizar una comparativa objetiva.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (colocar pesas en un carro en una rampa) y no generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware: requiere la configuración exacta de cámaras y robot utilizada durante el entrenamiento; cambios en la iluminación, posición de objetos o calibración pueden degradar el rendimiento.
- Sin evaluación en robot real: la model card no incluye resultados de pruebas físicas, por lo que su eficacia en condiciones reales no está verificada.
- Riesgo de sobreajuste: con solo 50 episodios, el modelo puede memorizar las demostraciones y fallar ante variaciones no vistas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario es responsable de cumplir con las condiciones de la licencia y de cualquier patente asociada al método ACT.
- No es un modelo de lenguaje: no debe utilizarse para tareas de NLP, generación de texto o razonamiento simbólico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leapshared/Incline_50epi
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/leapshared/Incline_20260901_221322
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
