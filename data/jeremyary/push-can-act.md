# jeremyary/push-can-act

## Resumen

El modelo `jeremyary/push-can-act` es una política de robótica basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación robótica. Este modelo concreto está especializado en la tarea de empujar una lata de pasta de tomate desde una marca de inicio hasta una marca de fin, utilizando un robot tipo `bi_so_follower` con tres cámaras (muñeca izquierda, muñeca derecha y cabeza).

El modelo cuenta con aproximadamente 51,7 millones de parámetros y se distribuye en formato safetensors, con licencia Apache 2.0. Fue entrenado sobre un dataset de teleoperación muy reducido (5 episodios, 4.404 frames a 30 FPS), lo que lo convierte en un ejemplo de entrenamiento rápido y ligero, pero también limita su generalización. Es relevante como demostración práctica de ACT en un entorno real de robótica, accesible para desarrolladores que quieran reproducir el flujo completo de LeRobot: desde la grabación de datos hasta el despliegue en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.680.908 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; procesa observaciones de estado e imágenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT (Action Chunking with Transformers), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. ACT utiliza un transformer codificador-decodificador que recibe observaciones multimodales —un vector de estado de 12 dimensiones y tres imágenes RGB de 480x640 píxeles procedentes de las cámaras `left_wrist`, `right_wrist` y `head`— y genera un chunk de acciones de 12 dimensiones. La principal innovación de ACT es la predicción por lotes de acciones futuras, lo que reduce la acumulación de errores típica de las políticas que predicen un solo paso.

El entrenamiento se realizó con LeRobot (versión 0.6.1) sobre el dataset `jeremyary/push-can-test`, compuesto por 5 episodios teleoperados de la tarea "Push the tomato paste can from the start mark to the end mark". La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW con learning rate 1e-05 y semilla 1000. No se menciona el uso de técnicas de refuerzo adicionales como RLHF o DPO, ya que es un método de imitación puro.

## Capacidades

- Control robótico de manipulación: el modelo genera comandos de acción de 12 dimensiones para un robot tipo `bi_so_follower` (probablemente un brazo bimanual con seguimiento).
- Percepción visual multimodal: procesa simultáneamente tres flujos de imagen (muñeca izquierda, muñeca derecha y cabeza) para guiar la tarea.
- Aprendizaje por imitación: reproduce comportamientos teleoperados, en este caso empujar un objeto hasta una posición objetivo.
- Predicción por chunks: genera secuencias de acciones de longitud fija, lo que mejora la fluidez del movimiento frente a políticas de un solo paso.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de políticas robóticas de Hugging Face.
- Sin capacidades de lenguaje natural, tool calling ni razonamiento simbólico: es un modelo puramente motor y perceptual.

## Casos de uso

- Manipulación de objetos en entornos controlados: el modelo puede ejecutar la tarea de empujar una lata desde una posición inicial a una final, útil para validar pipelines de aprendizaje por imitación en laboratorio.
- Prototipado rápido de políticas robóticas: gracias a su pequeño tamaño y al flujo de LeRobot, sirve como plantilla para entrenar y desplegar nuevas tareas con pocos datos.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del tamaño del dataset, la predicción por chunks y la configuración de cámaras en la tasa de éxito.
- Benchmarking de entornos de simulación o robots reales: al ser un modelo ligero, puede ejecutarse en hardware modesto para comparar métricas de control.
- Educación y formación en robótica: un ejemplo completo y reproducible para que estudiantes aprendan a entrenar políticas con LeRobot.
- Pruebas de robustez ante variaciones de iluminación o posición: aunque el dataset es pequeño, se puede evaluar la generalización del modelo en condiciones ligeramente distintas.
- Base para fine-tuning: el checkpoint puede servir como inicialización para tareas similares de empuje o manipulación con más datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito en el robot real ni comparativas con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM o GPU en la documentación del modelo.
- Dado el tamaño del modelo (51,7 M de parámetros), es razonable estimar que puede ejecutarse en GPUs de consumo como una RTX 3060 o superior, aunque esta estimación no está confirmada por el autor.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en PyTorch con CUDA. No se mencionan opciones como vLLM, llama.cpp u Ollama, que son específicas de modelos de lenguaje.
- Para ejecutar el rollout en un robot real, se necesita el hardware robótico correspondiente (tipo `bi_so_follower`) y las cámaras configuradas según las claves de observación.
- La latencia y el throughput no están documentados, pero al ser un modelo pequeño, se espera que sea adecuado para control en tiempo real (30 FPS de entrada).

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. Existe un modelo similar en Hugging Face, `s3y/push-act`, que también implementa ACT con LeRobot para una tarea de empuje, pero no se conocen sus parámetros ni resultados. Otros modelos ACT de LeRobot pueden variar en número de parámetros y tareas, pero no hay datos públicos en la información proporcionada. Se recomienda consultar el hub de LeRobot para comparar políticas de la misma familia.

## Limitaciones y advertencias

- Dataset de entrenamiento extremadamente pequeño (5 episodios), lo que implica alto riesgo de sobreajuste y baja generalización a nuevas posiciones, objetos o condiciones de iluminación.
- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en el robot físico.
- El modelo está especializado en una única tarea (empujar una lata) y no es transferible directamente a otras tareas sin reentrenamiento.
- Las cámaras y el robot deben coincidir exactamente con la configuración de entrenamiento; cualquier cambio en la disposición de las cámaras o en el tipo de robot invalidará las predicciones.
- Al ser un modelo de robótica, no tiene capacidades de lenguaje, razonamiento simbólico ni interacción conversacional.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en entornos de producción.
- No se documentan sesgos específicos, pero la naturaleza del dataset (una sola tarea, un solo entorno) limita la diversidad de comportamientos aprendidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeremyary/push-can-act
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Dataset de entrenamiento: https://huggingface.co/datasets/jeremyary/push-can-test
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jeremyary/push-can-test
