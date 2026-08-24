# leapshared/nuedive_test_60epi_new_20260824_182026_ACT_smoke

## Resumen

Este modelo es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), entrenada con el framework LeRobot de Hugging Face. Fue desarrollada por el usuario leapshared para controlar un robot manipulador de doble brazo (bi_openarm_follower) en la tarea de abrir una mochila, introducir objetos en ella y cerrarla. El modelo aprende a partir de 60 episodios de demostración teleoperada, con un total de 65.156 fotogramas capturados a 30 FPS desde tres cámaras.

Con 51,7 millones de parámetros, es un modelo compacto diseñado específicamente para control robótico en tiempo real. Su relevancia radica en que ACT es uno de los métodos de imitación más utilizados en robótica manipuladora, y este repositorio demuestra el flujo completo de entrenamiento y despliegue con LeRobot. El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con predicción de chunks de acción |
| Parametros totales | 51.689.104 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (procesa observaciones por pasos, no texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de control robótico, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice secuencias de acciones (action chunks) en lugar de acciones individuales por paso. Esto reduce el error acumulativo y mejora la estabilidad del control en tareas de manipulación. La arquitectura combina un codificador visual (para procesar las imágenes de las tres cámaras) con un transformer que genera los chunks de acción a partir del estado del robot y las observaciones visuales.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre un dataset de 60 episodios teleoperados con 65.156 fotogramas a 30 FPS. Se usaron 500 pasos de entrenamiento con batch size de 32, optimizador AdamW y learning rate de 1e-05, con semilla 42. El modelo consume como entrada el estado del robot (vector de 16 dimensiones) y tres imágenes RGB de 480x640 píxeles (cámara frontal y dos cámaras de muñeca), y produce un vector de acción de 16 dimensiones. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al entrenamiento supervisado.

## Capacidades

- Control robótico de manipulación por aprendizaje por imitación: ejecuta la tarea de abrir una mochila, colocar objetos dentro y cerrarla.
- Predicción de chunks de acción: genera secuencias de acciones de 16 dimensiones por paso, lo que permite movimientos fluidos y coordinados.
- Percepción multimodal: integra tres flujos de imagen RGB (cámara frontal y dos cámaras de muñeca) junto con el estado propioceptivo del robot.
- Generalización limitada a la tarea entrenada: el modelo está especializado en la tarea demostrada y no es un agente generalista.
- Compatibilidad con LeRobot: se integra con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot, incluyendo comandos CLI para rollout y entrenamiento.
- No soporta tool calling, razonamiento de lenguaje, visión general ni capacidades multimodales fuera del ámbito robótico.

## Casos de uso

- Manipulación robótica en entornos de laboratorio: el modelo puede ejecutar tareas de pick-and-place con objetos en contenedores, como la tarea de mochila para la que fue entrenado, en configuraciones de investigación.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el rendimiento de ACT con datasets pequeños (60 episodios) y comparar variaciones en el entrenamiento.
- Desarrollo de políticas robóticas con LeRobot: los desarrolladores pueden usar este modelo como referencia para entrenar sus propias políticas ACT con el mismo flujo de trabajo.
- Automatización de tareas repetitivas de ensamblaje o empaquetado: la tarea de introducir objetos en un contenedor y cerrarlo es análoga a operaciones de empaquetado en entornos controlados.
- Evaluación de hardware robótico: el modelo puede usarse para validar el funcionamiento de un robot bi_openarm_follower y sus cámaras antes de entrenar políticas personalizadas.
- Benchmarking de métodos de imitación: al ser un modelo pequeño y de entrenamiento rápido (500 pasos), es útil para comparar métricas de éxito entre distintas configuraciones de ACT o métodos alternativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, MMLU, HumanEval ni otros benchmarks estándar, ya que se trata de un modelo de control robótico y no de lenguaje o visión general.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 millones de parámetros, el modelo es muy ligero. En FP32 ocupa aproximadamente 207 MB de pesos, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM, incluyendo GPUs integradas de gama baja.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 1060 o superior, RTX 3060, RTX 4090, A100, H100). El entrenamiento con batch size 32 y 500 pasos es factible en una GPU consumer de 8 GB.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en GPUs consumer de gama media y baja. El cuello de botella no es la VRAM sino la captura de imágenes y el control del robot en tiempo real.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la política en el robot. También es posible cargar los pesos safetensors directamente con PyTorch para inferencia personalizada.
- Latencia y throughput: no se han publicado datos de latencia. Dado el tamaño del modelo, se espera una inferencia en el orden de milisegundos en GPU moderna, pero la latencia total dependerá de la captura de cámaras y la comunicación con el robot.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos. El modelo pertenece a la familia ACT de LeRobot, y existen otras políticas ACT entrenadas sobre distintos datasets y tareas en Hugging Face, pero no se han publicado métricas comparables. Como referencia cualitativa:

| Modelo | Parametros | Tarea | Dataset | Evaluacion |
|---|---|---|---|---|
| Este modelo (ACT smoke) | 51,7 M | Abrir mochila, meter objetos, cerrar | 60 episodios, 65.156 frames | No publicada |
| Otras políticas ACT en LeRobot Hub | variable | variable | variable | variable |

No se dispone de información sobre modelos alternativos de la misma categoría con datos de rendimiento comparables.

## Limitaciones y advertencias

- Sin resultados de evaluación: la model card no incluye ninguna métrica de éxito en robot real, por lo que se desconoce la fiabilidad del modelo en producción.
- Especialización limitada: el modelo solo ejecuta la tarea concreta para la que fue entrenado (abrir mochila, meter objetos, cerrar). No generaliza a otras tareas ni a variaciones significativas del entorno.
- Dependencia del hardware: está entrenado para un robot bi_openarm_follower con tres cámaras específicas. Usarlo con otro hardware requiere reentrenamiento o adaptación.
- Dataset pequeño: 60 episodios es un dataset reducido, lo que puede limitar la robustez frente a variaciones de iluminación, posición de objetos o distracciones.
- Riesgo de sobreajuste: con solo 500 pasos de entrenamiento y un dataset pequeño, existe riesgo de que la política memorice las demostraciones en lugar de generalizar.
- Sin capacidades de lenguaje: el modelo no procesa instrucciones en lenguaje natural ni soporta interacción conversacional.
- Fecha de creación futura: el modelo fue creado el 24 de agosto de 2026, lo que sugiere que es un artefacto de prueba reciente con 0 descargas y 0 likes, indicando que no ha sido validado por la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/leapshared/nuedive_test_60epi_new_20260824_182026_ACT_smoke
- Dataset de entrenamiento: https://huggingface.co/datasets/leapshared/nuedive_test_60epi_new_20260824_182026_destatic
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=leapshared/nuedive_test_60epi_new_20260824_182026_destatic
