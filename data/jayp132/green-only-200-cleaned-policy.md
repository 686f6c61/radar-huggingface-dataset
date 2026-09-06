# jayp132/green-only-200-cleaned-policy

## Resumen

`jayp132/green-only-200-cleaned-policy` es un modelo de política robótica basado en ACT (Action Chunking with Transformers), desarrollado por el usuario `jayp132` y publicado a través de la librería LeRobot. Se trata de un modelo de aprendizaje por imitación que aprende a ejecutar tareas de manipulación a partir de demostraciones teleoperadas, en lugar de generar texto o razonamiento simbólico. Su utilidad principal es el control de robots manipuladores en tareas concretas, como recoger un objeto específico del entorno.

El modelo está entrenado sobre el dataset `jayp132/green-only-200-cleaned`, compuesto por 200 episodios y 85.658 frames a 30 FPS, con la tarea "pick up the green beanbag". La arquitectura ACT predice trozos de acción (action chunks) en lugar de pasos individuales, lo que permite movimientos más suaves y estables. El modelo tiene 51.668.614 parámetros en formato `safetensors` y está licenciado bajo Apache 2.0, lo que permite su uso comercial con la atribución correspondiente. Su relevancia actual radica en ser un ejemplo práctico de política de imitación entrenada con LeRobot, útil para investigación en robótica y validación de pipelines de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación que utiliza un transformer para procesar observaciones multimodales y generar secuencias de acciones. Concretamente, la política consume el estado del robot (6 dimensiones) y dos imágenes RGB de 480x640 píxeles procedentes de las cámaras `wrist` y `scene`. La salida es una acción de 6 dimensiones, que corresponde al movimiento del efector final. La innovación clave de ACT es el *action chunking*: en lugar de predecir una única acción por paso, predice un trozo de acciones futuras, lo que reduce la acumulación de errores y mejora la estabilidad del movimiento.

El entrenamiento se realizó con el framework LeRobot (versión 0.5.2) sobre el dataset `jayp132/green-only-200-cleaned`, con 160.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset contiene 200 episodios teleoperados y 85.658 frames a 30 FPS, todos orientados a la tarea de recoger una bolsa de judías verde. No se menciona el uso de RLHF, DPO ni otras técnicas de ajuste por preferencias. El modelo no es un modelo de lenguaje y no incluye capacidades de razonamiento simbólico.

## Capacidades

- Ejecución de tareas de manipulación robótica mediante aprendizaje por imitación, entrenado específicamente para recoger una bolsa de judías verde.
- Predicción de trozos de acción (action chunking), lo que genera movimientos más suaves y robustos frente a perturbaciones.
- Entrada multimodal: combina el estado del robot y dos cámaras (muñeca y escena) para tomar decisiones.
- Salida de acciones de 6 dimensiones para el control del efector final.
- Integración nativa con la librería LeRobot, permitiendo entrenamiento, despliegue y evaluación en robots reales.
- No soporta tool calling, generación de lenguaje ni razonamiento abstracto.

## Casos de uso

- Recogida selectiva de objetos en una línea de montaje: el modelo puede identificar y recoger bolsas de judías verdes en una cinta transportadora, gracias a su entrenamiento específico en la tarea "pick up the green beanbag". Su capacidad de action chunking permite movimientos precisos y repetibles.
- Automatización de tareas de picking en almacenes: usar el modelo en un brazo robótico para recoger artículos de un contenedor, reduciendo la necesidad de teleoperación humana. Al estar entrenado con datos teleoperados, replica el comportamiento humano con alta fidelidad.
- Investigación en aprendizaje por imitación: este modelo sirve como referencia para comparar políticas ACT con otras arquitecturas dentro del framework LeRobot. Los investigadores pueden reproducir el entrenamiento y evaluar el efecto de variaciones en el dataset o la configuración.
- Desarrollo de robots manipuladores en laboratorios académicos: el modelo proporciona un punto de partida para tareas de manipulación con objetos similares en color o forma. Los equipos pueden adaptarlo a nuevos objetos mediante transferencia de aprendizaje.
- Validación de pipelines de entrenamiento de LeRobot: el modelo puede usarse para verificar el flujo completo de entrenamiento, desde la carga del dataset hasta el despliegue en un robot real, asegurando que la infraestructura funciona correctamente.
- Demostraciones en ferias y eventos de robótica: el modelo puede ejecutar la tarea en vivo como demo de aprendizaje por imitación, mostrando la capacidad de LeRobot para entrenar políticas funcionales con pocos datos.
- Entrenamiento de operarios en teleoperación: el modelo puede asistir a operadores humanos en tareas de recogida, combinando la teleoperación con la política aprendida para reducir el esfuerzo físico y mejorar la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Al tratarse de un modelo de 51,7 millones de parámetros, es probable que pueda ejecutarse en GPUs de consumo, pero no hay datos confirmados.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, usando el comando `lerobot-rollout` para inferencia en un robot real o `lerobot-train` para entrenamiento. También es compatible con Python y PyTorch.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Sesgos: el modelo se entrenó exclusivamente con un conjunto de datos de una tarea específica (recoger una bolsa de judías verde), por lo que su capacidad de generalización a otros objetos, colores o entornos es limitada.
- Riesgo de alucinación: al ser un modelo de política, puede producir acciones no deseadas si las observaciones difieren de las de entrenamiento, como cambios en la iluminación, posición de la cámara o presencia de distractores.
- Limitaciones de contexto: no procesa lenguaje ni razonamiento simbólico; solo observaciones de estado e imágenes. No puede interpretar instrucciones verbales ni adaptarse a tareas nuevas sin reentrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe incluir la atribución correspondiente al autor y al método, así como citar LeRobot según la guía de citación del repositorio.
- Caveat importante para producción: no se han publicado resultados de evaluación, por lo que el rendimiento real en robot no está verificado. Antes de un despliegue en producción, es necesario validar la política en el entorno objetivo y medir tasas de éxito.

## Enlaces

- Modelo: https://huggingface.co/jayp132/green-only-200-cleaned-policy
- Dataset: https://huggingface.co/datasets/jayp132/green-only-200-cleaned
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jayp132/green-only-200-cleaned
