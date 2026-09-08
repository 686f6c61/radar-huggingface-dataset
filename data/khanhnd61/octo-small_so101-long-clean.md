# khanhnd61/octo-small_so101-long-clean

## Resumen

El modelo `khanhnd61/octo-small_so101-long-clean` es una política de robótica entrenada con LeRobot, basada en el modelo Octo. Está diseñada para controlar un robot seguidor (so_follower) en la tarea de meter una cinta en un cajón. El modelo procesa observaciones visuales de dos cámaras (frontal y de muñeca) y genera acciones de 6 dimensiones. Con 27.040.008 parámetros, es una política compacta que puede ejecutarse en hardware modesto.

Fue entrenada sobre un dataset de 20 episodios y 13.241 fotogramas a 30 FPS, con 8.000 pasos de entrenamiento. Este modelo es relevante para investigadores que deseen explorar el aprendizaje por imitación en robótica con el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Octo (política basada en transformer) |
| Parametros totales | 27.040.008 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es una política de aprendizaje por imitación basada en el modelo Octo, integrada en el framework LeRobot. La arquitectura procesa observaciones visuales de dos cámaras: una frontal de 256x256 píxeles y una de muñeca de 128x128 píxeles, y produce una acción de 6 dimensiones. El entrenamiento se realizó con el dataset `khanhnd61/so101-long-clean`, que contiene 20 episodios y 13.241 fotogramas a 30 FPS para la tarea de meter una cinta en un cajón.

Se utilizó el optimizador AdamW con una tasa de aprendizaje de 0.0003, tamaño de lote de 16, 8.000 pasos de entrenamiento y semilla 1000. No se menciona el uso de RLHF ni DPO. La versión de LeRobot empleada fue 0.6.1.

## Capacidades

- Control robótico de baja dimensión: genera acciones de 6 dimensiones para el robot seguidor.
- Percepción visual: procesa imágenes de cámara frontal y de muñeca.
- Aprendizaje por imitación: entrenada para replicar la tarea de insertar una cinta en un cajón.
- Integración con LeRobot: se puede ejecutar mediante `lerobot-rollout` y entrenar con `lerobot-train`.
- No soporta generación de texto, razonamiento, tool calling ni capacidades de lenguaje.
- No es un modelo multimodal de propósito general; está especializado en control de robots.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como punto de partida para estudiar cómo las políticas de bajo nivel se comportan con pocas demostraciones. Se puede desplegar en un robot so_follower y evaluar la tasa de éxito en la tarea de inserción.
- Educación en robótica: gracias a su tamaño compacto (27M parámetros), es adecuado para cursos o laboratorios donde se dispone de GPUs modestas. Permite demostrar el ciclo completo de grabación de datos, entrenamiento y despliegue con LeRobot.
- Benchmarking de políticas: se puede comparar con otras políticas de LeRobot (por ejemplo, Diffusion Policy o ACT) en el mismo dataset para evaluar el rendimiento relativo en tareas de manipulación.
- Prototipado rápido: dado que el modelo es pequeño y se puede ejecutar en hardware limitado, es útil para probar rápidamente la integración de cámaras y control en un robot real.
- Transferencia de aprendizaje: se puede usar como base para fine-tuning en tareas similares, ajustando los pesos con nuevos datos de demostración.
- Demostraciones en ferias o eventos: el modelo puede ejecutarse en tiempo real para mostrar capacidades de manipulación robótica en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tener 27M parámetros, en fp32 ocupa aproximadamente 108 MB. Con entradas de imagen de alta resolución, la VRAM para inferencia se estima en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una RTX 3060 o superior. Para entrenamiento, se recomienda una GPU con al menos 8 GB de VRAM.
- Compatibilidad con consumer GPU: sí, el modelo cabe en GPUs de consumo y también puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`). No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados.

## Limitaciones y advertencias

- Sesgos: el modelo está entrenado en un único dataset de 20 episodios, por lo que puede reflejar sesgos en las demostraciones (posición inicial, iluminación, etc.).
- Riesgo de alucinación: al ser una política de control, puede generar acciones incorrectas si el entorno difiere del de entrenamiento, lo que podría causar movimientos no deseados.
- Limitaciones de generalización: la política está especializada en la tarea "meter la cinta en el cajón" y en el robot so_follower; no se espera que funcione en otros robots o tareas sin reentrenar.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el dataset de entrenamiento puede tener sus propias condiciones; se recomienda revisar la licencia del dataset.
- No se han proporcionado resultados de evaluación, por lo que el rendimiento real en el robot no está validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khanhnd61/octo-small_so101-long-clean
- Dataset de entrenamiento: https://huggingface.co/datasets/khanhnd61/so101-long-clean
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
