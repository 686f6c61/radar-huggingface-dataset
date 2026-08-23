# masato-ka/act_omx_bottle_sorting_v1

## Resumen

El modelo `masato-ka/act_omx_bottle_sorting_v1` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice segmentos de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario masato-ka y entrenado con el framework LeRobot de Hugging Face, sobre un robot tipo `omx_follower` con una cámara cenital. Su objetivo es resolver una tarea concreta de manipulación: la clasificación de botellas mediante teleoperación.

El modelo tiene 51,67 millones de parámetros y está publicado bajo licencia Apache-2.0. Es relevante porque demuestra un flujo completo de entrenamiento de políticas robóticas con datos teleoperados, accesible para la comunidad, y sirve como punto de partida para experimentar con ACT en tareas de manipulación. El dataset asociado contiene 18 episodios con 10.716 fotogramas a 30 FPS, una cantidad modesta que refleja un caso de uso de prototipado rápido más que de producción industrial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT) |
| Parametros totales | 51.673.734 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arXiv:2304.13705. En lugar de predecir una única acción por paso de tiempo, ACT genera un chunk de acciones futuras, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación. La política consume como entrada el estado del robot (vector de 11 dimensiones) y una imagen de la cámara cenital con resolución 480x640, y produce una acción de 6 dimensiones que controla los grados de libertad del brazo.

El entrenamiento se realizó con LeRobot versión 0.6.2 sobre el dataset `masato-ka/omx-bottole-sorting-v1`, que contiene 18 episodios teleoperados con 10.716 fotogramas a 30 FPS. Se ejecutaron 40.000 pasos de entrenamiento con un tamaño de lote de 8, optimizador AdamW, tasa de aprendizaje de 1e-5 y semilla 1000. No se menciona el uso de técnicas de refuerzo (RLHF/DPO) ni de fine-tuning adicional; es un entrenamiento de imitación directa.

## Capacidades

- Manipulación robótica por imitación: el modelo aprende a ejecutar la tarea de clasificación de botellas a partir de demostraciones teleoperadas.
- Percepción visual: procesa imágenes de una cámara cenital (480x640) para contextualizar la acción.
- Control de 6 grados de libertad: genera acciones de 6 dimensiones para el brazo robótico.
- Integración con LeRobot: compatible con el pipeline de LeRobot para entrenamiento, evaluación y despliegue.
- Tarea específica: diseñado para la tarea "Pick-up-block" sobre el dataset de clasificación de botellas.
- Sin capacidades de lenguaje, visión general o razonamiento fuera del ámbito robótico.

## Casos de uso

- Clasificación de botellas en línea de producción: el modelo puede ejecutar la tarea de recoger y clasificar botellas en un entorno fijo con la cámara cenital configurada, útil para validar conceptos de automatización con aprendizaje por imitación.
- Prototipado de políticas robóticas con LeRobot: sirve como ejemplo de referencia para investigadoras que quieran reproducir el flujo completo de entrenamiento y despliegue con ACT.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del tamaño del dataset (solo 18 episodios) en la tasa de éxito de políticas ACT.
- Entrenamiento de robots en entornos controlados: con la configuración de hardware de la cámara cenital, se puede usar en laboratorios para probar la viabilidad de la tarea antes de escalar a entornos más complejos.
- Base para fine-tuning en tareas similares: el modelo pre-entrenado puede servir como punto de partida para adaptar a otras tareas de manipulación con pocos datos.
- Educación y divulgación de robótica: al estar en Hugging Face con licencia Apache-2.0, es un recurso didáctico para enseñar el pipeline de LeRobot en cursos de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: dado el tamaño de 51,67 millones de parámetros, el modelo cabe en cualquier GPU con al menos 4 GB de VRAM en precisión fp32. En fp16, bastarían 2 GB.
- GPU recomendadas: cualquier GPU moderna de NVIDIA (RTX 2060 o superior) es suficiente. Para entrenamiento, se recomienda al menos 8 GB de VRAM para un tamaño de lote de 8.
- Compatibilidad con GPU consumer: sí, el modelo es ligero y puede ejecutarse en tarjetas de gama media.
- Opciones de despliegue: LeRobot (Python) es la librería principal, con soporte para ejecución en GPU con CUDA. No se mencionan adaptaciones a vLLM, llama.cpp u Ollama porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible, pero al ser un modelo pequeño (51M parámetros), la inferencia en tiempo real es plausible en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos de la misma categoría en la información proporcionada. El modelo es comparable en espíritu a otros entrenados con ACT y LeRobot para tareas de manipulación, como los publicados en el Hub de Hugging Face, pero no se tienen métricas de rendimiento para establecer una comparación numérica.

## Limitaciones y advertencias

- Dataset muy reducido: solo 18 episodios, lo que limita la generalización a variaciones de posición, iluminación u objetos no vistos durante el entrenamiento.
- Sin evaluación en robot real: la model card no incluye resultados de pruebas físicas, por lo que la tasa de éxito real es desconocida.
- Configuración de hardware fija: el modelo depende de la cámara cenital específica y del robot `omx_follower`; cualquier cambio en la disposición física requerirá reentrenamiento.
- Tarea específica: solo está diseñado para la tarea "Pick-up-bottle" y no es un modelo generalista de manipulación.
- Sin soporte multilingüe ni procesamiento de lenguaje: no aplicable a casos de uso de NLP.
- Licencia Apache-2.0 permite uso comercial, pero el autor no garantiza resultados en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masato-ka/act_omx_bottle_sorting_v1
- Dataset asociado: https://huggingface.co/datasets/masato-ka/omx-bottole-sorting-v1
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Paper ACT: https://arxiv.org/abs/2304.13705
- Perfil del autor en GitHub: https://github.com/masato-ka
- Versión anterior del modelo: https://huggingface.co/masato-ka/act_omx_bottle_sorting_v0
- Otro modelo del autor: https://huggingface.co/masato-ka/act-omx-pap-v1
