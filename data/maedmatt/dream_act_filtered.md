# maedmatt/DREAM_ACT_filtered

## Resumen

El modelo `maedmatt/DREAM_ACT_filtered` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido entrenado y publicado mediante el framework LeRobot de Hugging Face, y está diseñado para operar sobre un robot tipo `so_follower` con una cámara frontal. La tarea objetivo es "Fill the pyramid with circles", una manipulación de precisión que consiste en colocar círculos en una pirámide.

El modelo cuenta con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, lo que lo convierte en una política ligera y desplegable en hardware modesto. Su relevancia radica en demostrar un flujo completo de entrenamiento de políticas robóticas con LeRobot, desde la recopilación de datos teleoperados hasta la publicación en el Hub, y en servir como referencia para desarrolladores que quieran implementar ACT en sus propios robots. La arquitectura transformer con action chunking permite un control suave y robusto en tareas de manipulación, aunque su alcance está limitado a la tarea específica para la que fue entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice un "chunk" de acciones (una secuencia de pasos de control) a partir de observaciones actuales. En este caso, la política consume dos tipos de observaciones: el estado del robot (`observation.state`, un vector de 6 dimensiones) y una imagen RGB de la cámara frontal (`observation.images.front`, de 480x640 píxeles). Como salida genera un vector de acción de 6 dimensiones, correspondiente a los grados de libertad del efector final.

El entrenamiento se realizó con el dataset `maedmatt/DREAM-pyramid-circles`, que contiene 126 episodios teleoperados y 69.752 fotogramas a 30 FPS. La configuración de entrenamiento incluye 10.000 pasos, tamaño de lote 64, optimizador AdamW con una tasa de aprendizaje de 2e-5 y semilla 1000, utilizando la versión 0.6.2 de LeRobot. No se menciona el uso de técnicas como RLHF o DPO; el modelo se entrena exclusivamente mediante imitación supervisada sobre las demostraciones.

## Capacidades

- Control robótico: genera acciones de 6 dimensiones para el robot `so_follower`, permitiendo manipulación de objetos.
- Percepción visual: procesa imágenes RGB de 480x640 píxeles de una cámara frontal para guiar el comportamiento.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Ejecución de tareas específicas: está entrenado para la tarea "Fill the pyramid with circles", que implica apilar círculos en una estructura piramidal.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, razonamiento multi-paso ni capacidades de lenguaje natural, al ser un modelo puramente robótico.

## Casos de uso

- Automatización de tareas de apilamiento y ensamblaje: el modelo puede controlar un brazo robótico para colocar piezas en posiciones precisas, como en líneas de montaje de componentes pequeños.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentar con ACT en tareas de manipulación, evaluando el efecto de distintos datasets o configuraciones de entrenamiento.
- Prototipado rápido de políticas robóticas: con LeRobot, los desarrolladores pueden cargar este modelo y adaptarlo a nuevas tareas mediante fine-tuning con pocos episodios.
- Demostraciones educativas: útil para enseñar conceptos de robótica basada en aprendizaje, mostrando cómo un transformer puede generar acciones de control a partir de imágenes.
- Evaluación de robustez en entornos controlados: se puede desplegar en simuladores o bancos de prueba para medir la repetibilidad y precisión antes de pasar a un robot físico.
- Base para transferencia de tareas: aunque está entrenado para una tarea concreta, su arquitectura puede servir para inicializar modelos en tareas similares de manipulación con objetos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. Por tanto, no se dispone de métricas de éxito, tasas de acierto ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~51,7 millones de parámetros, en FP32 ocuparía aproximadamente 200 MB de memoria; en FP16, unos 100 MB. Esto permite inferencia en GPUs con 1 GB de VRAM o incluso en CPU.
- GPU recomendada: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA GTX 1050 Ti o superior) es suficiente. No se requiere hardware de gama alta como A100 o H100.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual, incluidas las integradas de gama baja.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que proporciona los comandos `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento. No es aplicable vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado datos específicos. Dado el tamaño reducido, se espera una latencia de milisegundos en GPU, aunque depende del hardware y de la resolución de imagen.

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos entrenados con la misma configuración y dataset para establecer una comparativa cuantitativa. A nivel cualitativo, ACT es uno de los métodos de imitación más utilizados en robótica, junto con Diffusion Policy y Behavior Transformers. En comparación con estos, ACT suele ofrecer un equilibrio entre simplicidad de implementación y rendimiento en tareas de manipulación de precisión, aunque Diffusion Policy puede ser más robusto en escenarios con variabilidad. Sin embargo, sin datos de evaluación de este modelo concreto, no es posible realizar una comparación numérica.

## Limitaciones y advertencias

- No se han reportado resultados de evaluación en robot real, por lo que el rendimiento real en el hardware físico no está verificado.
- El modelo está entrenado exclusivamente para la tarea "Fill the pyramid with circles"; su uso en otras tareas requeriría fine-tuning o reentrenamiento.
- Depende de la configuración específica del robot `so_follower` y de la cámara frontal. Cambios en la posición de la cámara, iluminación o calibración pueden degradar el rendimiento.
- El dataset de entrenamiento es relativamente pequeño (126 episodios), lo que puede limitar la generalización a variaciones no vistas.
- No se mencionan sesgos conocidos, pero al ser un modelo de robótica, los riesgos de alucinación no aplican; en su lugar, el riesgo principal es la ejecución de acciones incorrectas en entornos físicos, lo que requiere supervisión humana durante las primeras pruebas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del dataset asociado para posibles restricciones adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/maedmatt/DREAM_ACT_filtered)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Dataset de entrenamiento DREAM-pyramid-circles](https://huggingface.co/datasets/maedmatt/DREAM-pyramid-circles)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Guía de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación general de LeRobot](https://huggingface.co/docs/lerobot/index)
