# Haku-2004/act_k5oend_pred_20

## Resumen

`act_k5oend_pred_20` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), el método presentado en el paper arXiv:2304.13705. El modelo lo publica el usuario Haku-2004 en Hugging Face mediante la librería LeRobot de Hugging Face y está entrenado sobre el dataset propio `Haku-2004/k5_4seg`. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de observaciones (imágenes de cámara y estado del robot), predice trozos de acciones (action chunks) en lugar de pasos individuales.

La arquitectura es un transformer con encoder visual y un decoder que emite secuencias cortas de acciones, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. El checkpoint tiene 51.672.714 parámetros y ocupa 0,2 GB en el repositorio, un tamaño propio de políticas de manipulación entrenadas para un robot concreto.

Su relevancia es acotada: se trata de un artefacto de entrenamiento reproducible con LeRobot, útil para quien quiera inspeccionar un pipeline ACT completo o reentrenar sobre su propio dataset, no de un modelo de propósito general. La model card no aporta datos de rendimiento, número de episodios ni composición del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de entrenamiento, no documentada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo visuomotor, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT combina un backbone visual (encoder de imágenes tipo ResNet, según el paper original) con un transformer encoder-decoder que recibe las observaciones y el estado de las articulaciones y genera un chunk de acciones futuras. La innovación central del método es predecir K acciones por paso de inferencia en lugar de una sola, lo que mitiga el error compounding y permite ejecutar movimientos más suaves; el paper también introduce una técnica de temporal ensembling para promediar chunks solapados durante la ejecución.

El entrenamiento es de imitación supervisada (behavior cloning) sobre datos de teleoperación. En este caso, el dataset es `Haku-2004/k5_4seg`, del que no se documenta el número de episodios, la tasa de muestreo, el robot empleado ni la composición de las observaciones. Tampoco se indica si hubo aumentos de datos, número de épocas, hiperparámetros o el tamaño del chunk de acciones. No consta RLHF ni DPO, algo esperable en una política de imitación.

## Capacidades

- Control visuomotor por imitación: genera secuencias de acciones articulares a partir de imágenes y estado del robot.
- Predicción de action chunks: emite varios pasos de acción por inferencia, lo que suaviza la trayectoria y reduce la frecuencia efectiva de decisión.
- Integración con LeRobot: entrenamiento con `lerobot-train` y evaluación/ejecución con `lerobot-record`.
- Compatibilidad con el ecosistema SO-100/SO-101 mencionado en los comandos de ejemplo (`so100_follower`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales fuera del uso robótico previsto.

## Casos de uso

- Manipulación robótica de un brazo tipo SO-100: el modelo se carga con `--policy.path` y controla el follower en tiempo real; su tamaño (51,7 M de parámetros) permite inferencia en una sola GPU consumer.
- Reentrenamiento sobre un dataset propio: sirve como referencia de pipeline ACT completo en LeRobot, replicando los comandos de la model card con otro `repo_id`.
- Evaluación comparativa de políticas: al ser un checkpoint ACT canónico, permite medir éxito por episodio frente a otras políticas (diffusion policy, VQ-BeT) con el mismo robot y dataset.
- Prototipado de tareas de pick-and-place: el chunking de acciones es adecuado para tareas de recogida y colocación de objetos con trayectorias cortas y repetitivas.
- Docencia y formación en imitation learning: el modelo y su dataset asociado permiten reproducir el ciclo entrenamiento-evaluación con hardware asequible.
- Investigación en behavior cloning: base para experimentar con temporal ensembling, tamaño de chunk o aumentos de datos sin partir de cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para los 51,7 M de parámetros; en la práctica, el consumo lo domina el encoder visual y el buffer de imágenes, no los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una RTX 3060 o superior; para entrenamiento, una RTX 4090 o A100 acelera las épocas, pero no son necesarias.
- Cabe holgadamente en GPU consumer: sí, en cualquier GPU con al menos 4-6 GB de VRAM.
- Despliegue: LeRobot (`lerobot-record` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k5oend_pred_20 | 51,7 M | no disponible | no publicado | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible en la información | no aplica | éxito alto en tareas de teleoperación (según paper) | investigación | paper y código de referencia |
| Diffusion Policy | no disponible en la información | no aplica | no disponible | no disponible | implementaciones en LeRobot |
| VQ-BeT | no disponible en la información | no aplica | no disponible | no disponible | implementaciones en LeRobot |

No se dispone de datos comparativos medidos para este checkpoint concreto; la comparación con Diffusion Policy y VQ-BeT es cualitativa y basada en que LeRobot implementa las tres familias de políticas.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para un robot y un dataset concretos (`k5_4seg`); no generaliza a otras tareas, cámaras ni morfologías sin reentrenamiento.
- Sin métricas publicadas: no hay tasas de éxito, número de episodios ni curvas de entrenamiento, por lo que no se puede evaluar su calidad a priori.
- Riesgo de sobreajuste al entorno de recogida de datos: cambios de iluminación, fondo o posición inicial pueden degradar el comportamiento.
- Sin información sobre sesgos: al no ser un modelo lingüístico, los sesgos relevantes serían los del dataset de teleoperación, no documentados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción exige validación propia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de reproducibilidad por terceros.
- Fechas de creación y actualización (2026-11-13) poco habituales; conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_k5oend_pred_20
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
