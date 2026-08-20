# heba000/pyramid-dataset-phase1-combined-diff

## Resumen

El modelo `heba000/pyramid-dataset-phase1-combined-diff` es una política de control visuomotor basada en Diffusion Policy, entrenada con el framework LeRobot de Hugging Face. Desarrollado por el usuario heba000, este modelo resuelve una tarea concreta de manipulación robótica: colocar el primer vaso en el primer nivel para construir una pirámide. El enfoque de Diffusion Policy trata el control como un proceso generativo de difusión, produciendo trayectorias de acción suaves y multi-paso, lo que resulta especialmente adecuado para manipulaciones con contacto rico.

El modelo consume observaciones de estado (6 dimensiones) e imágenes de una cámara frontal (480x640), y genera acciones de 6 dimensiones. Con aproximadamente 263 millones de parámetros, está diseñado para ejecutarse en el robot tipo `so_follower`. Su relevancia radica en ser un ejemplo práctico de aprendizaje por imitación en robótica real, con un pipeline completo de entrenamiento y despliegue documentado a través de LeRobot. La licencia Apache 2.0 permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (visuomotor) |
| Parametros totales | 262.962.942 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, una arquitectura que modela la política de control como un proceso de difusión denoising. En lugar de predecir directamente una acción, el modelo genera iterativamente una secuencia de acciones a partir de ruido, condicionado por observaciones visuales y de estado. Esto permite producir trayectorias suaves y coherentes, especialmente útiles en tareas de manipulación con contacto físico.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre el dataset `heba000/pyramid-dataset-phase1-combined`, que contiene 68 episodios y 34.176 fotogramas a 30 FPS. La configuración de entrenamiento incluye 30.000 pasos, batch size de 8, optimizador Adam con learning rate de 0.0001 y semilla 1000. No se menciona el uso de RLHF, DPO u otras técnicas de refinamiento; se trata de aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Control visuomotor: genera acciones de 6 dimensiones a partir de observaciones de estado y una imagen frontal de 480x640.
- Generación de trayectorias multi-paso: produce secuencias de acciones suaves gracias al proceso de difusión.
- Tarea específica: está entrenado para la tarea "colocar el primer vaso en el primer nivel para construir la pirámide".
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- Ejecución en robot real: soporta el robot tipo `so_follower` con cámaras OpenCV.
- No es un modelo de lenguaje: no genera texto, código ni realiza razonamiento simbólico.

## Casos de uso

- Manipulación robótica en entornos de laboratorio: el modelo puede ejecutarse en un robot `so_follower` para realizar la tarea de apilado de vasos, sirviendo como banco de pruebas para algoritmos de aprendizaje por imitación.
- Investigación en aprendizaje por refuerzo e imitación: permite comparar el rendimiento de Diffusion Policy frente a otras arquitecturas (ACT, VQ-BeT, etc.) en una tarea de manipulación real.
- Desarrollo de pipelines de robótica con LeRobot: sirve como ejemplo de referencia para entrenar y desplegar políticas personalizadas, ya que el repositorio incluye comandos CLI completos.
- Evaluación de generalización: al estar entrenado con solo 68 episodios, es útil para estudiar la capacidad de generalización de políticas de difusión con pocos datos.
- Educación en robótica: puede utilizarse en cursos o talleres para demostrar el flujo completo de recolección de datos, entrenamiento y despliegue de una política robótica.
- Benchmarking de hardware: al ser un modelo relativamente pequeño (263M parámetros), permite medir el rendimiento de GPUs de consumo en inferencia robótica en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, MMLU, HumanEval u otras.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero al tratarse de un modelo de 263M parámetros con entradas de imagen, se estima que puede ejecutarse en GPUs con al menos 4-6 GB de VRAM en inferencia (dependiendo del batch y resolución).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100). El entrenamiento se realizó con `--policy.device=cuda`, por lo que se asume GPU NVIDIA.
- Compatibilidad con GPU de consumo: sí, es probable que quepa en GPUs de consumo como la RTX 3060 o superiores, dado el tamaño del modelo.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que gestionan la inferencia en el robot. No se mencionan vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La inferencia en tiempo real dependerá del hardware y de la resolución de imagen.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de difusión para robótica con LeRobot). Existen otras políticas como ACT (Action Chunking with Transformers) o VQ-BeT, pero no se han encontrado datos específicos de este modelo frente a ellas en la información proporcionada. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con un dataset reducido (68 episodios), puede presentar baja generalización a variaciones en la posición de los objetos, iluminación o configuraciones del robot.
- Riesgo de alucinación: no aplica directamente, pero el modelo puede generar acciones incorrectas si las observaciones difieren significativamente de las del entrenamiento.
- Limitaciones de contexto: el modelo solo acepta una cámara frontal y un estado de 6 dimensiones; no soporta múltiples cámaras ni entradas adicionales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright.
- Caveat para producción: no se han publicado resultados de evaluación en robot real, por lo que su fiabilidad en entornos de producción no está verificada. Se recomienda validar exhaustivamente antes de cualquier uso crítico.
- Dependencia del ecosistema LeRobot: el despliegue requiere la instalación de LeRobot y la configuración específica del robot `so_follower`, lo que limita su portabilidad a otros entornos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/heba000/pyramid-dataset-phase1-combined-diff
- Dataset de entrenamiento: https://huggingface.co/datasets/heba000/pyramid-dataset-phase1-combined
- Dataset adicional relacionado: https://huggingface.co/datasets/heba000/pyramid-dataset-1_20260816_134853
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
