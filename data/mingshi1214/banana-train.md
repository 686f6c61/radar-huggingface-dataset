# mingshi1214/banana-train

## Resumen

`banana-train` es una política de robótica entrenada con LeRobot y publicada en Hugging Face por el usuario mingshi1214. No se trata de un modelo de lenguaje: es un checkpoint de control motor entrenado mediante aprendizaje por imitación sobre el dataset `mingshi1214/ur_banana_dataset_abs`, orientado presumiblemente a una tarea de manipulación con un brazo robot UR (Universal Robots) y un objeto tipo plátano. El pipeline declarado es `robotics` y la librería asociada es LeRobot.

El modelo tiene 63.346.964 parámetros (aproximadamente 63,3 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,8 GB. La model card indica `model_name: fact`, lo que sugiere que la política subyacente podría ser FACT (un transformer de imitación), aunque la plantilla de la card no está completada y el tipo de modelo aparece como no reconocido. Los ejemplos de entrenamiento e inferencia de la card usan `--policy.type=act`, lo que introduce ambigüedad sobre la arquitectura real.

Su relevancia es acotada: es un artefacto de investigación reproducible con licencia Apache 2.0, útil para quien quiera inspeccionar un pipeline de aprendizaje por imitación en robótica con LeRobot, pero no es un modelo generalista ni presenta resultados de benchmarks publicados. Con 44 descargas y 0 likes, se trata de un experimento individual más que de un lanzamiento consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `fact`; la card muestra comandos con `policy.type=act`) |
| Parametros totales | 63.346.964 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. La etiqueta `fact` en los metadatos apunta a una política FACT (transformer de imitación para robótica), mientras que los comandos de ejemplo de la model card emplean `--policy.type=act`, la política Action Chunking Transformer de LeRobot. No es posible determinar con los datos proporcionados cuál de las dos se usó finalmente ni si hubo modificaciones. El número de parámetros (63,3 M) es coherente con una política de imitación de tamaño medio para control visuomotor.

El entrenamiento se realizó con LeRobot sobre el dataset `mingshi1214/ur_banana_dataset_abs`. No se especifican el número de episodios, la composición de las observaciones (cámaras, estados propioceptivos), el número de tokens ni si se aplicaron técnicas de regularización o aumento de datos. Tampoco se documenta ningún proceso de RLHF/DPO, algo esperable en este tipo de políticas de imitación supervisada. No se han publicado detalles sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico por imitación: genera acciones motoras a partir de observaciones, entrenado para una tarea concreta de manipulación sobre un brazo UR.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Ejecución sobre robot real: los comandos de ejemplo apuntan a un `so100_follower`, aunque el dataset de entrenamiento se etiqueta como `ur_banana_dataset_abs`.
- Reproducibilidad: pesos en safetensors y dataset asociado público en el Hub.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de aprendizaje por imitación: cargar el checkpoint con `lerobot-record` y `--policy.path=mingshi1214/banana-train` para replicar la evaluación sobre el robot de destino y comparar con reentrenamientos propios.
- Base para fine-tuning en tareas de manipulación similares: partir de los 63,3 M de parámetros y adaptar la política a un nuevo dataset con la misma configuración de robot y cámara.
- Docencia y formación en robótica: ejemplo completo y ligero (0,8 GB) de pipeline entrenamiento-evaluación con LeRobot para cursos prácticos.
- Prototipado de pick-and-place: usar la política como punto de partida para tareas de agarre y traslado de objetos con un UR, validando primero en simulación o en entorno controlado.
- Auditoría de pipelines de datos robóticos: inspeccionar la relación entre el dataset `ur_banana_dataset_abs` y los pesos resultantes para estudiar sensibilidad al formato de acciones absolutas.
- Benchmark interno de políticas de imitación: comparar FACT frente a ACT sobre el mismo dataset para decidir la arquitectura en un proyecto de automatización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 63,3 M de parámetros en fp32 el peso ronda los 0,25 GB, por lo que la inferencia cabría holgadamente en cualquier GPU con 4 GB o más, asumiendo overhead de activaciones y buffers de cámara.
- GPU recomendadas: no especificadas por el autor. Para entrenamiento, LeRobot requiere CUDA (`--policy.device=cuda`); una RTX 3060/4060 o superior es suficiente para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con al menos 4-8 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| banana-train (mingshi1214) | 63,3 M | no disponible | Manipulación robótica (UR, plátano) | Apache 2.0 | Hugging Face, 44 descargas |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación visuomotora genérica | Apache 2.0 (LeRobot) | Repositorio LeRobot y Hub |
| Políticas FACT | no disponible | no disponible | Imitación con transformer | no disponible | Referencia en literatura; checkpoints variables |
| Políticas Diffusion Policy | no disponible | no disponible | Imitación generativa | MIT (implementación de referencia) | Repositorios públicos |

La comparación cuantitativa no es posible: no hay benchmarks publicados para `banana-train` ni métricas de éxito comparables en la información disponible.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea y un único montaje físico; no generaliza a otros objetos, robots o entornos sin reentrenamiento.
- Ambigüedad arquitectónica: los metadatos indican `fact` pero los comandos de la card usan `act`; conviene verificar la configuración antes de reutilizarlo.
- Model card incompleta: la plantilla no está rellenada ("Model type not recognized"), sin detalles de datos, métricas ni hiperparámetros.
- Sin benchmarks ni tasas de éxito publicadas: no hay evidencia cuantitativa de rendimiento en el robot real.
- Riesgo de sobreajuste al dataset: con un solo dataset y sin datos de validación documentados, la política puede fallar ante variaciones de iluminación, posición inicial o fricción.
- Idiomas y contexto: no aplica, pero conviene no confundirlo con un modelo de lenguaje pese a estar alojado en el Hub.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios; aun así, la responsabilidad de seguridad en un robot real recae en el integrador.
- Seguridad física: cualquier despliegue en un brazo UR debe hacerse con límites de par, paradas de emergencia y espacio de trabajo despejado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mingshi1214/banana-train
- Dataset asociado: https://huggingface.co/datasets/mingshi1214/ur_banana_dataset_abs
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
