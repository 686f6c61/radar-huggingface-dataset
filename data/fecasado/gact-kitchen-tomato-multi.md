# fecasado/gact-kitchen-tomato-multi

## Resumen

`gact-kitchen-tomato-multi` es una política de robótica (policy) entrenada con LeRobot y publicada en HuggingFace por el usuario `fecasado`. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) orientado a control robótico, concretamente a la manipulación de un tomate en un entorno de cocina. El nombre del repositorio y el tipo de política (`gaze_act`) sugieren una variante de la arquitectura ACT (Action Chunking Transformer) con algún componente de atención sobre la mirada (gaze), aunque la model card no documenta esa variante.

El modelo tiene 51.670.922 parámetros (≈51,7 M) en formato safetensors y un tamaño de repositorio de 0,2 GB. Está entrenado sobre el dataset `fecasado/tomato-to-plate-320x240`, lo que indica entradas visuales de 320x240 píxeles y una tarea de transferencia de un tomate a un plato. La licencia es Apache 2.0 y la librería de referencia es `lerobot`.

Su relevancia es acotada: se trata de un checkpoint de investigación sin descargas ni interacciones en el momento de la consulta, útil como ejemplo reproducible de entrenamiento de políticas con LeRobot o como punto de partida para tareas de manipulación similares. No sustituye a un modelo fundacional de robótica ni ofrece generalización más allá del dominio entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `gaze_act` (variante de ACT, Action Chunking Transformer, según el tag y el nombre del modelo; detalles no disponibles) |
| Parámetros totales | 51.670.922 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de imitación, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. El tag `gaze_act` y el nombre del modelo apuntan a una política de tipo ACT, que en LeRobot se implementa como un transformer que predice secuencias de acciones (action chunks) a partir de observaciones visuales y del estado del robot. El prefijo "gaze" sugiere la incorporación de información de mirada o atención visual como entrada adicional, pero no hay documentación que confirme el mecanismo exacto ni cómo se integra en el transformer.

El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/tomato-to-plate-320x240`, que define la tarea (tomate a plato) y la resolución de las imágenes (320x240). No se especifican el número de episodios, el número de tokens o muestras, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste fino posterior. La model card es una plantilla sin completar ("Model type not recognized — please update this template"), por lo que no hay información sobre hiperparámetros, aumentos de datos ni innovaciones técnicas.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones para un robot manipulador a partir de observaciones visuales y del estado de las articulaciones.
- Ejecución de la tarea específica "tomate a plato" en un entorno de cocina, con entradas de imagen de 320x240.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación/inferencia con `lerobot-record`.
- Compatible con el robot de referencia `so100_follower` según el ejemplo de evaluación de la model card.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, código, matemáticas, visión general, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de imitation learning: sirve para replicar el pipeline de entrenamiento de LeRobot con `--policy.type=act` sobre un dataset propio y comparar curvas de pérdida y éxito con este checkpoint como referencia.
- Evaluación de políticas en robot SO-100: el ejemplo de la model card (`lerobot-record --robot.type=so100_follower --policy.path=...`) permite desplegar el modelo en un brazo robótico de bajo coste y medir la tasa de éxito en la tarea tomate-plato.
- Punto de partida para fine-tuning en tareas de manipulación similares: al ser un checkpoint Apache 2.0 de ~51,7 M de parámetros, se puede reentrenar con un dataset propio de recogida y colocación de objetos.
- Estudio de variantes con información de mirada: el tag `gaze_act` lo convierte en un candidato para analizar cómo afecta la señal de gaze al rendimiento frente a un ACT estándar, siempre que se disponga del código de la variante.
- Docencia y divulgación en robótica: ejemplo compacto (0,2 GB) y de licencia permisiva para demostrar el ciclo completo datos-entrenamiento-evaluación en un curso de aprendizaje por imitación.
- Benchmark interno de infraestructura: al ser un modelo pequeño, permite validar pipelines de inferencia en GPU de consumo y medir latencia de control antes de escalar a políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,7 M de parámetros en fp32, los pesos ocupan aproximadamente 207 MB; en fp16, unos 103 MB. A ello hay que sumar el coste del codificador visual y de las activaciones, no documentados.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre debería poder alojar los pesos, pero el requisito real depende del preprocesado de imagen y del resto de la política.
- GPU de consumo: previsiblemente cabe en GTX 1650, RTX 3050, RTX 4060 y superiores, aunque no hay confirmación del autor.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. En control robótico la latencia depende del bucle de control y del robot, no solo del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fecasado/gact-kitchen-tomato-multi` | 51,7 M | no aplica | Manipulación tomate-plato (gaze_act) | Apache 2.0 | HuggingFace, 0 descargas |
| Políticas ACT de LeRobot (referencia) | ~50 M típicamente | no aplica | Manipulación genérica | Apache 2.0 | HuggingFace / repo LeRobot |
| Políticas Diffusion Policy | variable | no aplica | Manipulación genérica | variable | HuggingFace / repos académicos |

No se dispone de datos de rendimiento del modelo como para establecer una comparación cuantitativa con alternativas. La comparación anterior es estructural y de disponibilidad, no de calidad.

## Limitaciones y advertencias

- Modelo específico de tarea: entrenado para "tomate a plato" en un entorno concreto; no generaliza a otras tareas, objetos ni disposiciones sin reentrenamiento.
- Sin documentación técnica: la model card es una plantilla sin completar, sin detalles de arquitectura, datos, hiperparámetros ni evaluación.
- Sin métricas de éxito publicadas: no hay evidencia de tasa de éxito, robustez ante cambios de iluminación o variaciones de posición.
- Riesgo de sobreajuste al dataset: con un único dataset de 320x240 y sin datos de validación documentados, es probable que el rendimiento caiga fuera de la distribución de entrenamiento.
- Sesgos y alucinaciones: no aplican en el sentido de un LLM, pero sí existe el riesgo de acciones erráticas o inseguras cuando la observación se aleja de lo visto en entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del dataset asociado antes de un uso productivo.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni issues que permitan validar el estado del checkpoint.
- No apto para producción sin evaluación previa en el robot objetivo y con protocolos de seguridad física.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fecasado/gact-kitchen-tomato-multi
- Dataset asociado: https://huggingface.co/datasets/fecasado/tomato-to-plate-320x240
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
