# kiliato/lso_back_combined_slim_abs_GR00T17

## Resumen

El modelo `kiliato/lso_back_combined_slim_abs_GR00T17` es una política robótica (policy) de manipulación basada en el modelo fundacional GR00T N1.7 de NVIDIA, entrenada con el framework LeRobot de Hugging Face. Está diseñada para controlar un robot humanoide o brazo robótico en la tarea específica de "encender el interruptor de la luz" (turn on the lightswitch), a partir de una cámara RGB y el estado de las articulaciones del robot.

Con 3.144.016.000 parámetros (aproximadamente 3,1 mil millones), el modelo combina un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) con un transformer de acciones basado en flow matching, lo que le permite predecir trayectorias de acción condicionadas a observaciones visuales, instrucciones en lenguaje natural y propriocepción. Es un ejemplo práctico de aplicación de modelos fundacionales de robótica en un escenario de aprendizaje por imitación con datos reales.

La relevancia de este modelo radica en que demuestra cómo un modelo de propósito general como GR00T N1.7 puede adaptarse a una tarea concreta mediante fine-tuning con un dataset relativamente pequeño (70 episodios), y cómo la comunidad puede publicar y compartir políticas robóticas entrenadas a través de LeRobot, facilitando la reproducibilidad y la colaboración en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + flow-matching action transformer) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de politica robotica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el backbone Qwen3-VL es multilingue, pero no se especifica para este modelo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional de robótica de propósito general que utiliza un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) para procesar observaciones visuales y textuales, y un transformer de acciones con flow matching para generar trayectorias de control. La política consume una imagen RGB de 720x720 píxeles de una cámara derecha y un vector de estado de 14 dimensiones (propriocepción), y produce un vector de acción de 7 dimensiones.

El entrenamiento se realizó mediante aprendizaje por imitación (behavior cloning) con el framework LeRobot, utilizando el dataset `kiliato/lso_back_combined_slim_abs` que contiene 70 episodios y 70.033 frames a 50 FPS. La configuración de entrenamiento incluye 20.000 pasos, batch size de 32, optimizador AdamW con learning rate de 0,0001 y semilla 42. No se aplicaron técnicas de RLHF ni DPO; el modelo se entrenó exclusivamente con demostraciones humanas.

## Capacidades

- Control robótico de manipulación: predice acciones de 7 grados de libertad a partir de visión y propriocepción.
- Ejecución de tareas específicas: entrenado para encender un interruptor de luz, con capacidad de generalizar dentro de la variabilidad del dataset.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Procesamiento multimodal: combina entrada visual (imagen RGB) y estado del robot (posiciones articulares).
- Fine-tuning sobre GR00T N1.7: aprovecha las capacidades pre-entrenadas del modelo fundacional de NVIDIA.
- Publicación y reproducibilidad: disponible en Hugging Face con pesos safetensors y configuración completa de entrenamiento.

## Casos de uso

- Automatización de tareas domésticas: el modelo puede integrarse en un robot humanoide para realizar tareas como encender interruptores, un paso hacia la asistencia en el hogar.
- Investigación en aprendizaje por imitación: sirve como caso de estudio para comparar metodologías de entrenamiento de políticas robóticas con datasets pequeños.
- Desarrollo de políticas robóticas personalizadas: los desarrolladores pueden usar este modelo como punto de partida para fine-tuning en tareas similares de manipulación (p. ej., pulsar botones, accionar palancas).
- Evaluación de modelos fundacionales de robótica: permite analizar el rendimiento de GR00T N1.7 en una tarea concreta y comparar con otras arquitecturas.
- Educación y prototipado: en entornos académicos, se puede utilizar para enseñar conceptos de aprendizaje por refuerzo e imitación en robótica.
- Benchmarking de hardware: al ser un modelo de 3,1B parámetros, es útil para medir el rendimiento de GPUs en inferencia de políticas robóticas en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 12,6 GB, lo que sugiere pesos en fp32. En fp16, el modelo ocuparía aproximadamente 6,3 GB; en int8, unos 3,2 GB. Sin embargo, no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para inferencia en tiempo real con fp16, se recomienda una GPU con al menos 8 GB de VRAM (p. ej., RTX 3070/3080, RTX 4060 Ti). Para entrenamiento o inferencia con mayor margen, se recomienda RTX 3090, RTX 4090, A100 o H100.
- Compatibilidad con GPUs de consumo: sí, es posible ejecutar el modelo en GPUs de consumo con 8-12 GB de VRAM si se convierte a fp16 o se cuantiza manualmente.
- Opciones de despliegue: el modelo está diseñado para ejecutarse con LeRobot mediante el comando `lerobot-rollout`. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Depende del hardware y de la frecuencia de control requerida (el dataset usa 50 FPS, por lo que la inferencia debe completarse en menos de 20 ms para control en tiempo real).

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de política robótica en la informacion proporcionada. El modelo se basa en GR00T N1.7, que compite con otras arquitecturas de políticas robóticas como:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.7 (base) | no disponible | no aplica | proposito general | Apache-2.0 | GitHub, Hugging Face |
| ACT (Action Chunking with Transformers) | ~10-100M | no aplica | manipulacion especifica | MIT | GitHub |
| Diffusion Policy | ~10-100M | no aplica | manipulacion especifica | MIT | GitHub |

Este modelo es significativamente más grande que las políticas tradicionales de imitación, pero está especializado en una única tarea. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al entrenarse con un dataset de 70 episodios, el modelo puede estar sesgado hacia las condiciones particulares de recogida de datos (iluminación, posición de cámara, tipo de robot).
- Riesgo de alucinación: no aplica directamente, ya que no es un modelo generativo de texto, pero puede producir acciones incorrectas si las observaciones difieren del dominio de entrenamiento.
- Limitaciones de contexto: el modelo solo acepta una cámara (derecha) y un vector de estado de 14 dimensiones. No soporta múltiples cámaras ni entradas adicionales.
- Limitaciones de idioma: aunque el backbone Qwen3-VL es multilingüe, la tarea está definida en inglés ("Turn on the lightswitch") y no se ha verificado el comportamiento con instrucciones en otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo está entrenado para una tarea muy específica y puede no generalizar a otras tareas sin fine-tuning adicional.
- Advertencia para producción: el modelo no ha sido evaluado en robot real según la model card. Antes de desplegarlo en producción, es necesario realizar pruebas exhaustivas de seguridad y robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiliato/lso_back_combined_slim_abs_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/kiliato/lso_back_combined_slim_abs
- Repositorio Isaac-GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kiliato/lso_back_combined_slim_abs
