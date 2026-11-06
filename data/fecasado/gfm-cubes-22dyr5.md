# fecasado/gfm-cubes-22dYR5

## Resumen

`gfm-cubes-22dYR5` es una política robótica entrenada con LeRobot y publicada en Hugging Face por el usuario `fecasado`. No es un modelo de lenguaje: es un controlador de imitación (imitation learning) para un brazo robótico tipo SO-100, orientado a tareas de manipulación de objetos cúbicos. El nombre `gaze_flow_matching` sugiere una política basada en flow matching, una familia de modelos generativos que aprenden campos vectoriales continuos para producir trayectorias de acciones suaves y multimodales.

El modelo cuenta con 75.247.306 parámetros (aproximadamente 75 M) y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real en hardware modesto. Se distribuye en formato safetensors y está pensado para integrarse en el ecosistema LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de entrenamiento de una política de manipulación con un dataset específico (`fecasado/Ncubes-to-Nbaskets-320x240`, resolución 320x240) y demuestra el flujo completo de LeRobot, desde el entrenamiento hasta la evaluación en un robot real o simulado. La model card es una plantilla sin completar, por lo que la mayor parte de los detalles técnicos no están documentados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de imitación con flow matching (gaze_flow_matching); detalles internos no disponibles |
| Parametros totales | 75.247.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible; pesos en safetensors (probablemente fp32 o fp16) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la model card, que es una plantilla de LeRobot sin completar. El nombre del modelo, `gaze_flow_matching`, indica que se emplea flow matching (una variante de modelos generativos continuos, emparentada con diffusion models) para generar secuencias de acciones. La etiqueta `gaze` podría referirse a la incorporación de información de mirada (gaze) como modalidad de entrada, aunque esto no se confirma en la información disponible.

El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, que por su nombre sugiere una tarea de trasvase de cubos a cestas con imágenes de 320x240 píxeles. No se especifican el número de episodios, la composición del dataset, el número de pasos de entrenamiento ni si se aplicaron técnicas de regularización o aumento de datos. Tampoco hay información sobre el tipo de robot empleado más allá del ejemplo de la model card, que menciona `so100_follower`.

## Capacidades

- Control de un brazo robótico mediante imitación: genera comandos de acción a partir de observaciones visuales y del estado del robot.
- Ejecución de una tarea de manipulación concreta: trasvase de cubos a cestas, según el nombre del dataset de entrenamiento.
- Integración con LeRobot: compatible con `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- Inferencia en tiempo real: con 75 M de parámetros, es viable en GPUs de consumo y potencialmente en CPU para control de baja frecuencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No se documentan capacidades de generalización a otras tareas, objetos o entornos distintos del dataset de entrenamiento.

## Casos de uso

- Reproducción de experimentos de imitación: sirve como punto de partida para validar el pipeline de LeRobot en un robot SO-100, cargando el checkpoint y ejecutando `lerobot-record` con `--policy.path` apuntando a este modelo.
- Investigación en flow matching aplicado a robótica: permite comparar el rendimiento de una política de flow matching frente a políticas ACT o diffusion en la misma tarea de trasvase de cubos.
- Docencia y formación: ejemplo ligero (0,3 GB) para enseñar el ciclo completo de entrenamiento y evaluación de políticas robóticas sin requerir infraestructura pesada.
- Prototipado de tareas pick-and-place: la política puede adaptarse mediante fine-tuning a variantes de la tarea (distintos objetos o posiciones) si se dispone de nuevos datasets en formato LeRobot.
- Evaluación de hardware de bajo coste: al ser un modelo pequeño, permite medir latencias de inferencia en GPUs de consumo (por ejemplo, RTX 3060 o superiores) y en CPU.
- Base para comparativas de políticas: útil como referencia en estudios que comparen arquitecturas de imitación con el mismo dataset y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, tasas de finalización de tarea, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (75 M de parámetros equivalen a unos 300 MB de pesos); en fp16, unos 150 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También es viable en CPU para control de baja frecuencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna, e incluso en placas integradas para inferencia por lotes pequeños.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch; no se documentan exportaciones a ONNX, TensorRT ni llama.cpp (no aplica).
- Latencia y throughput: no disponibles; dependerá del hardware y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gfm-cubes-22dYR5 | 75,2 M | no aplica | no disponible | apache-2.0 | Hugging Face |
| Políticas ACT de LeRobot | variable (típicamente 10-80 M) | no aplica | no disponible | apache-2.0 | Hugging Face / LeRobot |
| Políticas diffusion de LeRobot | variable | no aplica | no disponible | apache-2.0 | Hugging Face / LeRobot |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación se limita a la familia de políticas soportadas por LeRobot (ACT, diffusion, flow matching), que comparten el mismo ecosistema de entrenamiento y evaluación.

## Limitaciones y advertencias

- La model card es una plantilla sin completar: no documenta arquitectura, datos de entrenamiento, hiperparámetros ni métricas, lo que dificulta la reproducibilidad.
- El modelo está entrenado para una tarea y un dataset específicos; no se espera que generalice a otros objetos, entornos o robots sin fine-tuning.
- No hay información sobre sesgos, pero al ser una política visual puede heredar sesgos de las condiciones de iluminación, colores y posiciones presentes en el dataset.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin datos de evaluación, no se recomienda su uso en producción sin una validación exhaustiva en el entorno real.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/fecasado/gfm-cubes-22dYR5
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
