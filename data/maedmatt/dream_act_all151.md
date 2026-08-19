# maedmatt/DREAM_ACT_all151

## Resumen

DREAM_ACT_all151 es una política de robótica basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face. El modelo aprende a ejecutar la tarea "Fill the pyramid with circles" mediante aprendizaje por imitación a partir de 151 episodios teleoperados, recogidos en el dataset maedmatt/DREAM-pyramid-circles. Está diseñado para el robot tipo `so_follower` con una cámara frontal.

El modelo predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas reactivas. Con 51,7 millones de parámetros y un peso total de 0,2 GB, es una política ligera que puede ejecutarse en hardware de consumo. Su relevancia radica en ser un ejemplo práctico de entrenamiento y despliegue de políticas de manipulación robótica con el ecosistema LeRobot, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (ventana de observacion fija: estado 6D + imagen 480x640) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, una arquitectura basada en transformers que combina un codificador de visión (para procesar la imagen de la cámara frontal) con un codificador de estado (6 dimensiones) y un decodificador que genera bloques de acciones futuras. En lugar de predecir una sola acción por paso, ACT predice un chunk de acciones (típicamente 10-100 pasos), lo que mejora la estabilidad del movimiento y reduce la acumulación de errores en tareas de manipulación.

El entrenamiento se realizó con 15.000 pasos, batch size de 64, optimizador AdamW con learning rate de 2e-05 y semilla 1000. El dataset contiene 151 episodios y 81.266 frames a 30 FPS, capturados con teleoperación. No se menciona el uso de RLHF, DPO ni técnicas de refuerzo adicionales; es un entrenamiento puramente de imitación supervisada. La versión de LeRobot utilizada fue la 0.6.2.

## Capacidades

- Ejecución de tareas de manipulación robótica por imitación: el modelo reproduce la tarea "Fill the pyramid with circles" aprendida de demostraciones teleoperadas.
- Control de robot tipo `so_follower` con 6 grados de libertad (acción de 6 dimensiones).
- Percepción visual: procesa imágenes RGB de 480x640 píxeles de una cámara frontal.
- Generación de chunks de acciones: predice secuencias de acciones en lugar de pasos individuales, lo que permite movimientos más suaves y coordinados.
- Integración con LeRobot: compatible con el pipeline de rollout y entrenamiento de la librería.
- Sin capacidades de lenguaje, tool calling ni razonamiento simbólico: es un modelo puramente motor.

## Casos de uso

- Manipulación robótica en entornos de laboratorio: el modelo puede desplegarse en un robot `so_follower` para ejecutar tareas de apilado o colocación de objetos, como llenar una pirámide con círculos, replicando las demostraciones aprendidas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto de la predicción por chunks en la tasa de éxito de tareas de precisión, comparando con políticas reactivas.
- Benchmarking de políticas ACT: al estar entrenado con LeRobot, puede usarse como referencia para comparar variantes de ACT (cambios de hiperparámetros, aumentación de datos, etc.) en la misma tarea.
- Desarrollo de pipelines de datos a política: el flujo completo (dataset → entrenamiento → rollout) documentado en la model card permite reproducir el proceso con otros datasets y tareas.
- Evaluación de robustez en entornos controlados: al no haber resultados de evaluación publicados, el modelo puede usarse para medir la repetibilidad de la tarea bajo variaciones de iluminación, posición de objetos o ruido de cámara.
- Formación y educación en robótica: por su tamaño reducido y licencia permisiva, es adecuado para cursos que enseñen a entrenar y desplegar políticas de manipulación con LeRobot en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, MMLU, HumanEval u otros benchmarks estándar, ya que se trata de un modelo de robótica y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 51,7 millones de parámetros y pesos en FP32 (0,2 GB), la inferencia debería caber en cualquier GPU con al menos 1-2 GB de VRAM. En FP16, el modelo ocuparía aproximadamente 0,1 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, GTX 1060 6GB o superior). También puede ejecutarse en CPU para pruebas lentas, aunque no es recomendable para control en tiempo real.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja como RTX 3050, GTX 1650 o incluso en iGPU con suficiente memoria compartida, aunque con latencia mayor.
- Opciones de despliegue: LeRobot ofrece el comando `lerobot-rollout` para ejecutar la política en el robot. También puede cargarse el checkpoint desde Hugging Face Hub con la API de LeRobot para inferencia offline.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia de inferencia inferior a 10 ms en GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| DREAM_ACT_all151 | ACT | 51,7 M | fijo (imagen + estado) | Fill pyramid with circles | Apache 2.0 |
| ACT original (paper 2304.13705) | ACT | ~80 M (configuracion base) | fijo | Diversas tareas de manipulacion | MIT (paper) |
| Diffusion Policy (Chi et al., 2023) | Diffusion | ~10-100 M segun config | fijo | Manipulacion general | MIT |

No hay una comparativa directa con otros modelos de la misma tarea en el Hub, ya que el dataset es específico del autor. La comparativa se basa en arquitecturas similares de aprendizaje por imitación. ACT original y Diffusion Policy son alternativas metodológicas, pero no están entrenados en este dataset concreto.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no se ha verificado la tasa de éxito en robot real, por lo que el rendimiento real es desconocido.
- Dependencia del dataset: el modelo solo sabe ejecutar la tarea "Fill the pyramid with circles" con las condiciones de iluminación, posición de cámara y objetos del dataset de entrenamiento. Cambios en el entorno pueden degradar el rendimiento.
- Riesgo de sobreajuste: con 151 episodios y 15.000 pasos de entrenamiento, es posible que la política memorice las demostraciones en lugar de generalizar a nuevas configuraciones.
- Sin capacidades de lenguaje ni razonamiento: no puede interpretar instrucciones verbales ni adaptarse a tareas no vistas.
- Hardware específico: está entrenado para el robot `so_follower`; usarlo en otro robot requiere reentrenamiento o adaptación.
- Sin cuantizaciones publicadas: no hay versiones GGUF, ONNX ni cuantizadas, lo que limita el despliegue en edge devices sin soporte de safetensors.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de rendimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maedmatt/DREAM_ACT_all151
- Dataset de entrenamiento: https://huggingface.co/datasets/maedmatt/DREAM-pyramid-circles
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=maedmatt/DREAM-pyramid-circles
