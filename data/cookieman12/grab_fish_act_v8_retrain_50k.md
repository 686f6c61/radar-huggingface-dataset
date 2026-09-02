# Cookieman12/grab_fish_act_v8_RETRAIN_50k

## Resumen

El modelo `Cookieman12/grab_fish_act_v8_RETRAIN_50k` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido desarrollado por el usuario Cookieman12 y entrenado con la librería LeRobot de Hugging Face, sobre un dataset propio de 50 episodios teleoperados (33.971 fotogramas a 30 FPS) en un robot SO-101 con dos cámaras (frontal y lateral). El modelo resuelve la tarea de agarrar un pez de forma suave y fluida, y su relevancia radica en demostrar la aplicación práctica de ACT en manipulación robótica de bajo coste, con un tamaño compacto de 51,7 millones de parámetros. No es un modelo de lenguaje ni de visión general, sino una política específica para un robot concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador de visión (para procesar las imágenes de las cámaras) con un transformador que genera bloques de acciones futuras. En este caso, el modelo recibe como entrada el estado del robot (6 dimensiones) y dos imágenes de 480x640 píxeles (frontal y lateral), y produce una acción de 6 dimensiones. El entrenamiento se realizó con 50.000 pasos, batch size 8, optimizador AdamW y una tasa de aprendizaje de 1e-5, sobre un dataset de 50 episodios teleoperados de la tarea "Grab the fish smoothly". No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento puramente supervisado de imitación. La versión de LeRobot utilizada fue la 0.6.1.

## Capacidades

- Generación de acciones de control para un robot SO-101 (6 grados de libertad).
- Procesamiento simultáneo de dos flujos de imagen (cámara frontal y lateral) para percibir el entorno.
- Aprendizaje por imitación de una tarea específica: agarrar un pez de forma suave.
- Ejecución de políticas en tiempo real mediante el pipeline de LeRobot (`lerobot-rollout`).
- No dispone de capacidades de lenguaje, razonamiento general, código, matemáticas ni visión fuera del ámbito de la tarea robótica.

## Casos de uso

- Manipulación robótica de objetos pequeños y delicados: el modelo está entrenado para agarrar un pez sin dañarlo, lo que puede extrapolarse a tareas de agarre de objetos frágiles en entornos controlados.
- Investigación en aprendizaje por imitación: sirve como ejemplo de referencia para estudiar el comportamiento de ACT con datasets reducidos (50 episodios) y su transferencia a robots de bajo coste.
- Demostración de LeRobot: permite a desarrolladores probar el flujo completo de entrenamiento y despliegue de políticas robóticas con la librería de Hugging Face.
- Automatización de tareas repetitivas en laboratorio: el modelo puede ejecutar la tarea de agarre de forma autónoma durante periodos prolongados, liberando al operador humano.
- Base para fine-tuning: al ser un modelo pequeño y con licencia Apache 2.0, puede servir como punto de partida para adaptarlo a nuevas tareas de agarre con datasets adicionales.
- Evaluación de hardware robótico: útil para validar el rendimiento del robot SO-101 y sus cámaras en condiciones reales de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parámetros, en FP32 ocuparía aproximadamente 200 MB de memoria, y en FP16 unos 100 MB. Sin embargo, no se especifican cuantizaciones disponibles.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM debería ser suficiente para inferencia; una NVIDIA GTX 1650 o superior es viable. Para entrenamiento, se recomienda una GPU con al menos 6 GB (el entrenamiento se realizó con batch size 8, lo que sugiere una GPU de gama media).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que gestionan la inferencia en el robot. También es posible exportar el modelo a otros formatos, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuración de cámaras.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada (otros modelos ACT de LeRobot para tareas similares podrían existir, pero no se dispone de datos para una comparación rigurosa).

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Grab the fish smoothly" y no generaliza a otras tareas de manipulación sin fine-tuning.
- Depende de la configuración exacta del robot SO-101 y de las cámaras (frontal y lateral); cambios en la posición, iluminación o tipo de cámara pueden degradar el rendimiento.
- No se han reportado evaluaciones en robot real, por lo que el rendimiento en producción es incierto.
- El dataset de entrenamiento es pequeño (50 episodios), lo que aumenta el riesgo de sobreajuste a las condiciones específicas de la teleoperación.
- No se especifican sesgos conocidos, pero al ser un modelo de imitación, hereda los sesgos del operador humano que teleoperó los episodios.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de funcionamiento en entornos no controlados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Cookieman12/grab_fish_act_v8_RETRAIN_50k)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Cookieman12/grab_fish_act_v8)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=Cookieman12/grab_fish_act_v8)
