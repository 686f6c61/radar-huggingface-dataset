# kiroaiseoul/act_task08_14D_90data_200k

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones ("action chunks") en lugar de pasos individuales, tal como se describe en el artículo arXiv:2304.13705. Este checkpoint concreto, `kiroaiseoul/act_task08_14D_90data_200k`, ha sido entrenado por el usuario kiroaiseoul con LeRobot y publicado en HuggingFace Hub bajo licencia Apache 2.0. No es un modelo de lenguaje: es una política de control robótico que consume observaciones (estado de 14 dimensiones, según el nombre del repositorio) y produce comandos de acción.

El modelo tiene 51.687.056 parámetros (dato extraído del archivo de pesos en safetensors) y el repositorio ocupa 0,2 GB. El nombre indica que se entrenó sobre 90 demostraciones ("90data") durante 200.000 pasos ("200k"), con un espacio de observación de 14 dimensiones ("14D"), y que corresponde a la tarea 08 de un conjunto de tareas. El dataset asociado es `kiroaiseoul/task08_takeout_and_put_beaker_0930`, lo que sugiere una tarea de recogida y colocación de un vaso de precipitados (beaker).

Su relevancia es acotada y muy específica: sirve como referencia reproducible de entrenamiento de políticas ACT con LeRobot para un brazo robótico de bajo coste, y como punto de partida para comparar checkpoints de la misma familia publicados por el mismo autor. Con 0 descargas y 0 "likes" en el momento de redactar esta ficha, no hay evidencia de validación por parte de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con componente CVAE y backbone visual ResNet, según arXiv:2304.13705 |
| Parametros totales | 51.687.056 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de los LLM; ACT consume ventanas de observaciones y emite chunks de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que aprende de datos de teleoperación. La innovación central es la predicción de chunks de acciones: en lugar de generar una única acción por paso de inferencia, el modelo emite una secuencia corta de acciones futuras, lo que reduce el problema de acumulación de error y mejora la estabilidad en tareas de manipulación fina. La formulación original incluye un componente de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas, y un backbone convolucional (ResNet) para procesar las observaciones visuales, con "temporal ensembling" opcional durante la inferencia.

En cuanto al entrenamiento de este checkpoint concreto, la model card solo indica que la política se ha entrenado y publicado con LeRobot, y remite a la guía de entrenamiento mediante el comando `lerobot-train` con `--policy.type=act`. No se especifica el número exacto de tokens, la composición del dataset ni si se aplicaron fases de RLHF o DPO (no aplica en aprendizaje por imitación). Los metadatos del nombre permiten inferir 90 demostraciones y 200.000 pasos de entrenamiento, pero no hay confirmación textual en la información disponible sobre hiperparámetros, tamaño de chunk, aumentos de datos ni semillas. Tampoco se documenta la configuración de cámaras ni la dimensión del espacio de acciones.

## Capacidades

- Predicción de chunks de acciones para control robótico de manipulación, a partir de observaciones visuales y de estado.
- Ejecución de la tarea 08 del conjunto de tareas del autor (recogida y colocación de un vaso de precipitados, según el nombre del dataset asociado).
- Consumo de observaciones de 14 dimensiones, de acuerdo con el identificador del repositorio.
- Inferencia y evaluación mediante el flujo de LeRobot (`lerobot-record` con `--policy.path`).
- Integración con robots tipo SO-100 follower, según el ejemplo de evaluación de la model card.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling, capacidades de agente, multilingüismo ni modo "thinking".
- No se documentan capacidades multimodales más allá de las entradas propias de la política (imágenes y estado).

## Casos de uso

- Automatización de una celda de pick-and-place: la política reproduce la secuencia demostrada para retirar y depositar un beaker, adecuada para prototipos de laboratorio con brazo de bajo coste.
- Reproducción de experimentos de aprendizaje por imitación: sirve como referencia concreta de un entrenamiento ACT hecho con LeRobot, útil para comparar hiperparámetros frente a otros checkpoints.
- Punto de partida para fine-tuning en una tarea nueva: al ser un checkpoint ACT estándar de 51,7 M de parámetros, se puede reentrenar con un dataset propio reducido.
- Evaluación comparativa de checkpoints del mismo autor: permite contrastar con `kiroaiseoul/act_task08_task09_mixed_14D_490data_200k_20260918_223900` para medir el efecto de mezclar tareas o de aumentar datos.
- Docencia y formación en robótica: ejemplo reproducible de teleoperación, entrenamiento y despliegue con un coste de hardware mínimo.
- Investigación en generalización de políticas: al estar entrenado con pocas demostraciones (90) para una única tarea, es un caso útil para estudiar sobreajuste y transferencia entre tareas relacionadas.
- Despliegue en robótica de borde: su tamaño reducido permite ejecutarlo en hardware embebido con GPU integrada, sin depender de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de tasas de éxito, métricas por episodio ni comparaciones cuantitativas con otras políticas. Existen repositorios de evaluación del mismo autor (por ejemplo, `kiroaiseoul/eval_act_task08_task09_mixed_14D_465data_200k`), pero en la información disponible no se detallan sus resultados numéricos.

## Requisitos de hardware

- VRAM estimada: con 51.687.056 parámetros, los pesos ocupan aproximadamente 207 MB en FP32 y 104 MB en FP16. La VRAM total necesaria depende del lote, de la resolución de las imágenes de entrada y del buffer de inferencia; no se han publicado cifras concretas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica para la inferencia de una política de este tamaño; RTX 3060, RTX 4090, A100 o H100 son válidas, aunque las dos últimas están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo; también es plausible su ejecución en CPU para inferencia de baja frecuencia o en placas como Jetson Orin para robótica embebida.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para evaluación/inferencia), con PyTorch como backend. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. ACT está diseñado para control en tiempo real, pero no se aportan mediciones de frecuencia de control ni de éxito por episodio en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kiroaiseoul/act_task08_14D_90data_200k` (este) | 51.687.056 | no disponible | no publicado | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| `kiroaiseoul/act_task08_task09_mixed_14D_490data_200k_20260918_223900` | no disponible | no disponible | no publicado | no disponible en la informacion | HuggingFace |
| `kiroaiseoul/eval_act_task08_task09_mixed_14D_465data_200k` | no disponible (es un dataset de evaluacion) | no aplica | no publicado | apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento de ninguno de los tres, por lo que la comparación se limita a la naturaleza del artefacto, el volumen de datos de entrenamiento declarado en el nombre y la licencia. El checkpoint de este análisis está especializado en una única tarea (task08) con 90 demostraciones, mientras que la variante "mixed" combina las tareas 08 y 09 con 490 demostraciones.

## Limitaciones y advertencias

- Especialización extrema: el entrenamiento declarado corresponde a una única tarea con 90 demostraciones, por lo que se espera una generalización muy limitada fuera de esa tarea, ese robot, esa iluminación y esa disposición de objetos.
- Sin evidencia de validación externa: 0 descargas y 0 likes, y ausencia de métricas publicadas, impiden afirmar nada sobre su tasa de éxito real.
- Dependencia del hardware de entrenamiento: una política ACT es sensible a la calibr­ación del robot, a la posición de las cámaras y a la frecuencia de control; un cambio de montaje puede degradar el comportamiento de forma drástica.
- Riesgo de fallo silencioso: al predecir chunks de acciones, un error de política puede ejecutar una secuencia completa incorrecta sin mecanismo interno de detección; se recomienda supervisión y paradas de seguridad.
- Sesgos: no disponibles. Al tratarse de datos de teleoperación, hereda los sesgos de las demostraciones humanas y del entorno concreto de recogida.
- Alucinación: el concepto no aplica igual que en un LLM, pero sí existe el equivalente de acciones incoherentes o fuera de distribución ante observaciones no vistas.
- Idiomas y contexto: no aplica; el modelo no procesa lenguaje ni tiene ventana de contexto textual.
- Licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se indique los cambios. No se documentan restricciones adicionales.
- Metadatos: las fechas del repositorio (creación el 2026-10-01) y el sufijo de fecha del checkpoint comparativo (20260918) no se pueden verificar con la información disponible; conviene tratarlos con cautela.
- Documentación incompleta: la model card no detalla hiperparámetros, composición del dataset, resolución de imagen ni espacio de acciones, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/act_task08_14D_90data_200k
- Dataset de entrenamiento asociado: https://huggingface.co/datasets/kiroaiseoul/task08_takeout_and_put_beaker_0930
- Articulo de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas con LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Checkpoint relacionado (tareas 08 y 09 mezcladas): https://huggingface.co/kiroaiseoul/act_task08_task09_mixed_14D_490data_200k_20260918_223900
- Dataset de evaluacion relacionado: https://huggingface.co/datasets/kiroaiseoul/eval_act_task08_task09_mixed_14D_465data_200k/tree/main
