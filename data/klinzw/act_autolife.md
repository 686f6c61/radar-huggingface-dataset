# klinzw/act_autolife

## Resumen

El modelo `klinzw/act_autolife` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario klinzw y entrenada con el framework LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias completas de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación real. Este modelo concreto está entrenado para operar el robot autolife_s1 en dos tareas domésticas: abrir y cerrar una nevera.

El modelo cuenta con 51,7 millones de parámetros y acepta como entrada tres imágenes de cámaras (cabeza izquierda, mano izquierda y mano derecha) junto con un vector de estado de 23 dimensiones, produciendo como salida un vector de acción también de 23 dimensiones. Está entrenado sobre un dataset de 100 episodios teleoperados con 144 282 fotogramas a 30 FPS, bajo licencia Apache 2.0, lo que permite su uso y modificación tanto en investigación como en aplicaciones comerciales. Su relevancia radica en ser un ejemplo práctico de política de imitación desplegable en un robot real, con un tamaño reducido que lo hace accesible para entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.703.447 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza una arquitectura transformer para procesar observaciones visuales y de estado, y generar bloques de acciones futuras de longitud fija. En este modelo, las entradas consisten en tres imágenes de 224×224 píxeles (de las cámaras `head_left`, `hand_left` y `hand_right`) y un vector de estado de 23 dimensiones. El modelo está entrenado para predecir un vector de acción de 23 dimensiones que corresponde a las posiciones objetivo de las articulaciones del robot.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre el dataset `klinzw/autolife_pi05`, que contiene 100 episodios de teleoperación, 144 282 fotogramas a 30 FPS, y las tareas "close fridge" y "open fridge". La configuración de entrenamiento incluye 100 000 pasos, tamaño de lote 8, optimizador AdamW con tasa de aprendizaje 1e-5 y semilla 1000. No se menciona el uso de técnicas como RLHF o DPO; el aprendizaje es puramente por imitación supervisada. No se detallan innovaciones adicionales más allá del método ACT original.

## Capacidades

- Control robótico de un brazo manipulador: predice acciones de 23 dimensiones a partir de observaciones visuales y de estado.
- Ejecución de tareas específicas de manipulación: abrir y cerrar una nevera.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Procesamiento multimodal: combina visión (tres cámaras) y estado propioceptivo (posición de articulaciones).
- Inferencia en tiempo real: diseñado para operar a 30 FPS, acorde con la frecuencia de muestreo del dataset.
- Compatibilidad con el ecosistema LeRobot: permite integración directa con herramientas de entrenamiento, evaluación y despliegue.

No dispone de capacidades de generación de texto, razonamiento simbólico, tool calling, agentes conversacionales ni procesamiento de lenguaje natural.

## Casos de uso

- Automatización de tareas domésticas: el modelo puede abrir y cerrar la puerta de una nevera de forma autónoma, lo que sirve como base para desarrollar robots de asistencia en cocinas.
- Investigación en aprendizaje por imitación: permite estudiar el rendimiento de ACT en tareas de manipulación reales con un robot de bajo coste, gracias a su tamaño reducido y su integración con LeRobot.
- Desarrollo de políticas de control para robots autolife_s1: sirve como punto de partida para fine-tuning con nuevas tareas o variaciones del entorno (iluminación, posición de objetos, etc.).
- Validación de pipelines de entrenamiento: al ser un modelo pequeño, es útil para probar flujos de trabajo de recogida de datos, entrenamiento y despliegue en laboratorios con recursos computacionales limitados.
- Evaluación comparativa de algoritmos de imitación: puede utilizarse como baseline en experimentos que comparen ACT con otros métodos (diffusion policies, etc.) en el mismo robot y tareas.
- Demostraciones educativas: en cursos de robótica y aprendizaje automático, permite ilustrar el ciclo completo de entrenamiento de una política de control con datos teleoperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en el robot real. Por tanto, se desconoce la tasa de éxito del modelo en las tareas "close fridge" y "open fridge".

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- Dado que el modelo tiene 51,7 millones de parámetros y procesa tres imágenes de 224×224, se estima que es viable en GPUs de consumo con al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 3060 o superior), aunque no hay cifras confirmadas.
- El despliegue se realiza mediante el framework LeRobot, que ofrece comandos como `lerobot-rollout` para ejecutar la política en el robot autolife_s1. No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados; se espera que sea suficiente para operar en tiempo real (30 FPS) dado el diseño del método.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado otros modelos de robótica con características equivalentes (mismo robot, mismas tareas) en los resultados de búsqueda. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para las tareas de abrir y cerrar una nevera en el robot autolife_s1. No generaliza a otras tareas, objetos o robots sin un reentrenamiento o fine-tuning específico.
- No se han publicado resultados de evaluación en el mundo real, por lo que se desconoce su robustez ante variaciones de iluminación, posiciones de objetos o distracciones.
- La calidad del comportamiento depende críticamente de la calibración de las cámaras y de la configuración del robot; cambios en el hardware pueden degradar el rendimiento.
- Al ser un modelo de imitación, puede reproducir errores presentes en las demostraciones del dataset, como trayectorias subóptimas o movimientos inseguros.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de seguridad para operación autónoma en entornos no controlados.
- No es un modelo de lenguaje, por lo que no aplican riesgos de alucinación textual, pero sí existe riesgo de fallos de ejecución física que podrían causar daños materiales o personales si se utiliza sin supervisión.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/klinzw/act_autolife)
- [Dataset de entrenamiento](https://huggingface.co/datasets/klinzw/autolife_pi05)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación general de LeRobot](https://huggingface.co/docs/lerobot/index)
