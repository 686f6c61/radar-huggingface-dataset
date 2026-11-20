# JJinJJin2/omx_act_policy_v7

## Resumen

`omx_act_policy_v7` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face por el usuario JJinJJin2 y entrenada con el framework LeRobot de Hugging Face. El modelo resuelve el problema de generar comandos de control robótico a partir de observaciones visuales y de estado, mediante el paradigma de clonación de comportamiento: aprende de datos teleoperados y predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control.

El checkpoint contiene 51.668.614 parámetros en formato safetensors (aproximadamente 0,2 GB de repositorio) y se ha entrenado específicamente sobre el dataset `JJinJJin2/pick_and_place_v3`, lo que indica una política especializada en una tarea concreta de recogida y colocación (pick and place) y no un modelo generalista. La relevancia práctica es la de cualquier política ACT publicada con LeRobot: sirve como referencia reproducible para entrenar y evaluar políticas de manipulación con hardware de bajo coste, como el brazo SO-100/SO-101 que aparece en la documentación de LeRobot.

Es importante encuadrar la ficha correctamente: no se trata de un LLM ni de un modelo de lenguaje, sino de una política de control robótico. Por tanto, las secciones de capacidades lingüísticas, tool calling, benchmarks de razonamiento o despliegue con vLLM no aplican y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | JJinJJin2/pick_and_place_v3 |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 2026-11-20 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers), descrita en el paper arXiv 2304.13705, es un método de aprendizaje por imitación que combina un codificador de observaciones (típicamente imágenes de cámaras y estado de las articulaciones) con un transformer que decodifica un chunk de acciones futuras de longitud fija. Predecir varios pasos de acción de una vez, en lugar de un único paso, mitiga el problema de la acumulación de errores en políticas autorregresivas y produce trayectorias más suaves. En la implementación de LeRobot, la política se entrena sobre episodios teleoperados almacenados en formato LeRobotDataset.

En este caso concreto, el entrenamiento se ha realizado sobre el dataset `JJinJJin2/pick_and_place_v3` con el comando `lerobot-train --policy.type=act`. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de cámaras utilizadas, la frecuencia de control, la longitud del chunk de acciones ni si se aplicaron técnicas de regularización o aumento de datos. Tampoco se documenta el uso de RLHF/DPO, algo que no forma parte del pipeline habitual de ACT. La model card no incluye detalles adicionales de arquitectura más allá de la referencia al paper.

## Capacidades

- Generación de comandos de control robótico (acciones de articulaciones o del efector final) a partir de observaciones visuales y de estado.
- Predicción de chunks de acciones, lo que aporta suavidad y robustez frente a errores acumulados.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa explícita).
- Ejecución de una tarea específica de pick and place sobre el dataset de entrenamiento.
- Integración nativa con el ecosistema LeRobot (`lerobot-train`, `lerobot-record`).
- No soporta tool calling, function calling, agentes de múltiples pasos ni capacidades multilingües.
- No dispone de modo de razonamiento explícito, visión generalista, audio ni generación de texto.

## Casos de uso

- Recogida y colocación de objetos con brazo robótico de bajo coste: el modelo se ha entrenado específicamente en `pick_and_place_v3`, por lo que puede desplegarse directamente sobre un SO-100/SO-101 para replicar la tarea aprendida en entornos similares a los de las demostraciones.
- Reproducción de experimentos de aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT, cambios en el dataset o hiperparámetros de entrenamiento usando LeRobot.
- Evaluación de pipelines de teleoperación: mediante `lerobot-record` con `--policy.path` apuntando a este checkpoint se pueden medir tasas de éxito en 10 episodios de evaluación sobre el mismo montaje físico.
- Base para fine-tuning en tareas afines: al ser un checkpoint ACT de pequeño tamaño (51,7 M de parámetros), es viable reentrenarlo o ajustarlo con nuevos datasets de manipulación en una GPU de consumo.
- Docencia y prototipado en robótica: permite ilustrar el ciclo completo teleoperación-dataset-entrenamiento-evaluación con hardware asequible y software open source.
- Integración en bancos de pruebas de políticas robóticas: puede incorporarse como política candidata en comparativas internas de métodos de imitación (ACT frente a Diffusion Policy o VQ-BeT) dentro de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en precisión completa el peso de los pesos ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con al menos 2-4 GB de VRAM una vez sumados los buffers del codificador visual y del entorno de ejecución.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; el comando de entrenamiento de LeRobot usa `--policy.device=cuda`. Para entrenamiento, una RTX 3060/4060 o superior es adecuada dado el tamaño del modelo; para inferencia en tiempo real, incluso GPUs de gama de entrada o integradas pueden ser suficientes, aunque no se documentan latencias.
- Cabe en GPU de consumo: sí, con amplio margen, dado el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), y en general el stack de PyTorch usado por LeRobot. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omx_act_policy_v7 (este) | 51,7 M | no aplica | Pick and place (ACT) | Apache 2.0 | Hugging Face, 0 descargas |
| Otras políticas ACT publicadas en LeRobot Hub | variable | no aplica | Manipulación diversa | habitualmente Apache 2.0 | Hugging Face |
| Diffusion Policy (implementación LeRobot) | variable | no aplica | Manipulación | MIT/Apache según implementación | Repositorio LeRobot |
| VQ-BeT (implementación LeRobot) | variable | no aplica | Manipulación | según implementación | Repositorio LeRobot |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con estas alternativas.

## Limitaciones y advertencias

- Especialización extrema: el modelo se ha entrenado únicamente sobre `pick_and_place_v3`; su comportamiento fuera de esa distribución (objetos, iluminación, posiciones o robots distintos) no está garantizado.
- Sin métricas publicadas: no hay tasas de éxito ni evaluaciones reproducibles en la model card, por lo que su rendimiento real es desconocido.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Sin información sobre sesgos: no se documentan sesgos del dataset ni posibles desequilibrios en las demostraciones.
- Riesgo de fallo silencioso en producción: como toda política de imitación, puede generar acciones plausibles pero incorrectas ante observaciones fuera de distribución; requiere supervisión y paradas de seguridad en un robot real.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset de entrenamiento por separado.
- Sin soporte lingüístico ni de agentes: no debe emplearse como modelo de lenguaje ni integrarse en pipelines de texto.
- Documentación mínima: la model card es la plantilla estándar de LeRobot, sin detalles de entrenamiento, hardware ni configuración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JJinJJin2/omx_act_policy_v7
- Dataset de entrenamiento: https://huggingface.co/datasets/JJinJJin2/pick_and_place_v3
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
