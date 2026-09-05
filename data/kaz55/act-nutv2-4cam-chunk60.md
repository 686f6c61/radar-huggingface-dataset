# Kaz55/act-nutv2-4cam-chunk60

## Resumen

Kaz55/act-nutv2-4cam-chunk60 es un modelo de política robótica basado en Action Chunking with Transformers (ACT), desarrollado por el usuario Kaz55. Se trata de un sistema de aprendizaje por imitación que predice secuencias de acciones de 60 pasos (chunking) para controlar un brazo robótico UR5e, utilizando información visual de cuatro cámaras. El modelo ha sido entrenado con el framework LeRobot sobre el dataset Kaz55/dg5f_ur5e_nutv2, orientado a tareas de manipulación de tuercas. Con aproximadamente 51,7 millones de parámetros y licencia Apache 2.0, este modelo representa un ejemplo práctico de aplicación de ACT en robótica de manipulación fina.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con CVAE (Action Chunking with Transformers, ACT) |
| Parámetros totales | 51.668.634 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de robótica; chunk de acciones: 60) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arxiv:2304.13705. ACT combina un transformer encoder-decoder con un CVAE (Conditional Variational Autoencoder) para generar acciones en trozos, en lugar de predecir un único paso. Esta técnica permite reducir el error de acumulación y mejorar la estabilidad del control en tareas de manipulación.

El entrenamiento se realizó con el framework LeRobot, utilizando el dataset Kaz55/dg5f_ur5e_nutv2, compuesto por demostraciones teleoperadas de un brazo robótico UR5e. No se han publicado detalles sobre el número de tokens, la composición exacta del dataset ni la aplicación de técnicas como RLHF o DPO. El modelo se distribuye con pesos en formato safetensors.

## Capacidades

- Predicción de acciones en trozos de 60 pasos (action chunking), lo que permite un control más suave y robusto.
- Control de un brazo robótico UR5e a partir de 4 cámaras.
- Aprendizaje por imitación de demostraciones teleoperadas.
- Integración nativa con el framework LeRobot para entrenamiento, evaluación e inferencia.
- No soporta tool calling, razonamiento de lenguaje ni procesamiento de texto; es un modelo exclusivamente de control robótico.
- Capacidades multilingües: no aplica.

## Casos de uso

- Ensamblaje de tuercas en entornos de laboratorio: el modelo puede controlar el brazo UR5e para enroscar tuercas, aprovechando las 4 cámaras para localizar y orientar la pieza.
- Recogida y colocación de piezas en celdas robóticas: adecuado para tareas de pick-and-place donde se requiere precisión y coordinación visual.
- Investigación en aprendizaje por imitación: sirve como baseline para comparar métodos de action chunking y evaluar nuevas técnicas de control robótico.
- Generación de demostraciones para nuevos entrenamientos: se puede usar el modelo para grabar episodios de demostración en el dataset, alimentando futuros entrenamientos.
- Automatización de tareas repetitivas de manipulación fina: en producción, puede integrarse en sistemas de ensamblaje que requieren movimientos precisos y repetitivos.
- Evaluación de políticas de control en robots UR5e: el modelo permite probar el rendimiento de ACT en el dataset dg5f_ur5e_nutv2, midiendo tasas de éxito en tareas de manipulación.
- Despliegue en entornos de investigación con múltiples cámaras: la configuración de 4 cámaras proporciona redundancia visual, lo que mejora la robustez en condiciones de oclusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Si cabe en consumer GPU: no disponible.
- Opciones de despliegue: LeRobot (entrenamiento e inferencia), Hugging Face Hub.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kaz55/act-nutv2-4cam-chunk60 | Manipulación de tuercas (UR5e) | 51.668.634 | Apache 2.0 | Hugging Face |
| Kaz55/act-newcable-combined-4cam-chunk60 | Manipulación de cables (UR5e) | No disponible | No disponible | Hugging Face |
| Kaz55/act-newcablev5-4cam-chunk60 | Manipulación de cables (UR5e) | No disponible | No disponible | Hugging Face |

Nota: Los tres modelos comparten la misma arquitectura ACT y la configuración de 4 cámaras con chunk de 60, pero están entrenados en tareas distintas. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el brazo UR5e y la tarea de manipulación de tuercas; su generalización a otros robots o tareas es limitada.
- Depende de la configuración de 4 cámaras; cambios en la posición, calibración o iluminación pueden degradar el rendimiento.
- No se han documentado sesgos conocidos, pero al ser un modelo de aprendizaje por imitación, puede heredar sesgos presentes en las demostraciones de entrenamiento.
- No es un modelo de lenguaje, por lo que no presenta riesgo de alucinación textual; sin embargo, puede producir acciones incorrectas si la observación visual difiere del entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de los términos.

## Enlaces

- Hugging Face: https://huggingface.co/Kaz55/act-nutv2-4cam-chunk60
- Paper ACT: https://huggingface.co/papers/2304.13705
- arXiv: https://arxiv.org/abs/2304.13705
- LeRobot GitHub: https://github.com/huggingface/lerobot
- LeRobot Docs: https://huggingface.co/docs/lerobot/index
- Dataset: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_nutv2
- Modelo similar: https://huggingface.co/Kaz55/act-newcable-combined-4cam-chunk60
- Modelo similar: https://huggingface.co/Kaz55/act-newcablev5-4cam-chunk60
