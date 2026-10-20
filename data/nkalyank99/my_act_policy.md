# nkalyank99/my_act_policy

## Resumen

`nkalyank99/my_act_policy` es una política de control robótico basada en ACT (Action Chunking with Transformers), el método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un modelo visomotor que recibe el estado articular de un brazo robótico y una imagen de cámara frontal, y devuelve un vector de 6 dimensiones de acciones. Lo publica el usuario `nkalyank99` en el Hub de HuggingFace, entrenado y empaquetado con la librería LeRobot de HuggingFace (versión 0.6.2).

El modelo resuelve una tarea concreta de manipulación aprendida de demostraciones teleoperadas: el dataset asociado (`nkalyank99/white_block_2_20260726_111914`) sugiere una tarea de interacción con un bloque blanco. La arquitectura sigue el enfoque ACT, que predice *chunks* de acciones (varios pasos futuros de una vez) en lugar de acciones individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. Cuenta con 51.668.614 parámetros (unos 51,7 M) y un repositorio de 0,2 GB.

Su relevancia es la de un artefacto de investigación reproducible: es un ejemplo mínimo y completo de un *pipeline* de imitación extremo a extremo sobre un robot `so_follower`, con un dataset muy pequeño (5 episodios, 3.578 fotogramas a 30 FPS, 2.000 pasos de entrenamiento). Resulta útil como referencia, como punto de partida para *fine-tuning* y como caso de estudio de lo que se puede (y no se puede) esperar con tan pocos datos. No se han publicado resultados de evaluación en el robot real ni una licencia explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación con predicción de *chunks* de acciones; detalles de la configuración interna (número de capas, dimensión oculta, tamaño de chunk) no disponibles |
| Parámetros totales | 51.668.614 (≈51,7 M), dato real de los pesos en safetensors |
| Longitud de contexto | No aplica: política visomotora sin contexto textual. Entrada por paso: estado de 6 dimensiones + una imagen `(3, 1080, 1920)`; el tamaño del *chunk* de acciones no está documentado |
| Tipos de cuantización | No disponibles. Solo se publican pesos en safetensors (presumiblemente fp32); no hay variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible / no aplica. El campo `task` del dataset de entrenamiento está vacío (`""`), por lo que la política no está condicionada por lenguaje |
| Licencia | No disponible (la model card indica `[More Information Needed]`) |
| Formato de pesos | safetensors (librería `lerobot`) |

Especificaciones de entrada/salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.front` | VISUAL | `(3, 1080, 1920)` |
| `action` | ACTION | `(6,)` |

Configuración de entrenamiento declarada:

| Ajuste | Valor |
|---|---|
| Pasos de entrenamiento | 2.000 |
| Tamaño de lote | 4 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tipo de robot | `so_follower` |
| Cámaras | `front` (una sola) |

## Arquitectura y entrenamiento

ACT combina un autocodificador variacional condicional (CVAE) con un transformer encoder-decoder. La política observa el estado de 6 articulaciones y la imagen frontal, y genera un *chunk* de acciones futuras en lugar de un único paso, lo que aporta robustez frente al ruido de las demostraciones humanas y evita el error compounding típico del *behavior cloning* paso a paso. En la implementación original del paper, el *backbone* visual es una ResNet; en este repositorio no se especifica la configuración exacta de la red (capas, dimensión de los *embeddings*, longitud del *chunk*), por lo que ese detalle queda como no disponible.

El entrenamiento se realizó con `lerobot-train` sobre el dataset `nkalyank99/white_block_2_20260726_111914`: 5 episodios, 3.578 fotogramas a 30 FPS, una sola cámara frontal y una tarea sin descripción textual. Son 2.000 pasos con lotes de 4, AdamW y una tasa de aprendizaje muy baja (1e-05), lo que equivale a aproximadamente 8.000 muestras vistas, un régimen muy por debajo del que suele requerir ACT para generalizar (los autores del método reportan cientos de episodios por tarea). No se documenta el uso de RLHF, DPO ni ninguna etapa de ajuste posterior: es imitación supervisada pura sobre demostraciones teleoperadas.

## Capacidades

- Control visomotor de un brazo robótico de tipo `so_follower` con 6 grados de libertad de estado y de acción.
- Predicción de *chunks* de acciones: genera secuencias cortas de comandos futuros, lo que estabiliza la ejecución y reduce la acumulación de error.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensas ni entorno simulador.
- Ejecución de una única tarea entrenada (asociada al dataset del bloque blanco); no hay condicionamiento por instrucción en lenguaje porque el campo `task` está vacío.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia en el robot y `lerobot-train` para reentrenamiento.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, capacidades de agente ni modo *thinking*. No es un modelo multimodal de propósito general.

## Casos de uso

- Manipulación de un bloque blanco en entorno de laboratorio: es la tarea para la que se recogieron los 3.578 fotogramas del dataset; la política ejecuta la secuencia motora aprendida con la cámara frontal y el estado de 6 articulaciones como únicas entradas.
- Punto de partida para *fine-tuning* con datos propios: sirve como inicialización en `lerobot-train` para un brazo `so_follower` y una tarea nueva, reutilizando los 51,7 M de parámetros ya ajustados en lugar de partir de pesos aleatorios.
- Reproducción de un *pipeline* de imitación completo: útil en docencia e investigación para recorrer el ciclo grabación de episodios, entrenamiento con ACT, *rollout* y análisis de fallos con una configuración mínima (2.000 pasos, lote 4).
- *Baseline* interno de comparación: al estar entrenado sobre el mismo robot y dataset, permite medir de forma controlada la mejora frente a alternativas como Diffusion Policy o SmolVLA antes de justificar el coste de un modelo mayor.
- Generación de nuevos datos de entrenamiento: ejecutando la política en modo `base` con grabación activada se pueden recolectar *rollouts* que amplíen el dataset original de 5 episodios, una aproximación práctica al refinamiento iterativo tipo DAgger.
- Pruebas de integración hardware-software: valida la calibración del puerto del robot, los índices de cámara y el emparejamiento de claves de observación (`observation.images.front`) en un *setup* OpenCV a 30 FPS antes de invertir en modelos mayores.
- Validación de la cadena de despliegue en CPU/GPU de gama baja: con ~51,7 M de parámetros es un candidato realista para prototipar en equipos modestos antes de escalar a políticas de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La propia model card lo confirma explícitamente: *«No evaluation results have been provided for this policy yet»*. No hay tabla de tareas, número de ensayos, tasa de éxito ni comparación con otras políticas sobre el mismo robot. Tampoco se han publicado métricas de *loss* de entrenamiento ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. Con 51.668.614 parámetros, los pesos ocupan ≈207 MB en fp32 y ≈103 MB en fp16. El consumo real lo dominan las activaciones de la imagen de entrada (hasta 1080×1920 según la especificación de observación), no el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente (RTX 3060, RTX 4060, RTX 4090, A100, H100); no se requiere memoria alta ni computación de precisión reducida para un modelo de este tamaño.
- Cabe holgadamente en GPU de consumo e incluso en CPU: el cuello de botella esperable es la captura y preprocesado de vídeo a 30 FPS, no la inferencia de la red.
- Opciones de despliegue: LeRobot (`lerobot-rollout --strategy.type=base`, `--policy.path=nkalyank99/my_act_policy`) sobre PyTorch con `--policy.device=cuda`. vLLM, llama.cpp, Ollama y TGI no son aplicables: no es un modelo de lenguaje. La exportación a ONNX o TorchScript no está documentada.
- Latencia y throughput: no disponibles. La referencia temporal del sistema es el bucle de control a 30 FPS usado en la grabación (33 ms por paso), pero no se ha publicado la latencia medida del *forward pass* ni el tiempo de inferencia por *chunk*.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nkalyank99/my_act_policy` (ACT) | Imitación con *chunking* de acciones | 51,7 M | Estado 6-D + 1 imagen 1080×1920 | No disponible | HuggingFace Hub, vía LeRobot |
| Diffusion Policy | Imitación con difusión sobre acciones | No disponible (depende de la configuración) | Estado + imágenes | No verificada en esta ficha | Implementación pública de los autores |
| SmolVLA | VLA con *flow matching*, condicionado por lenguaje | ≈450 M (cifra publicada por sus autores) | Estado + imágenes + instrucción textual | No verificada en esta ficha | HuggingFace Hub, integrado en LeRobot |
| VQ-BeT | Imitación con cuantización vectorial de comportamiento | No disponible | Estado + imágenes | No verificada en esta ficha | Implementación pública |

Frente a Diffusion Policy, este ACT es más ligero y más rápido de entrenar (2.000 pasos, lote 4), pero la difusión suele manejar mejor la multimodalidad de las demostraciones. Frente a SmolVLA, la diferencia clave es el condicionamiento por lenguaje: ACT no acepta instrucciones y queda atado a una única tarea, mientras que las políticas VLA generalizan a varias tareas descritas en texto a cambio de un orden de magnitud más de parámetros. Los datos de los modelos alternativos provienen de conocimiento general del sector y no se han verificado en la búsqueda realizada; consúltese cada model card antes de tomar decisiones.

## Limitaciones y advertencias

- Dataset de entrenamiento mínimo: 5 episodios y 3.578 fotogramas. Es muy probable un ajuste excesivo; la política reproducirá las condiciones exactas de la grabación y fallará ante cambios de posición del objeto, iluminación o fondo.
- Sin evaluación publicada: no existe ninguna tasa de éxito medida, ni siquiera en el propio entorno de entrenamiento. Cualquier afirmación sobre su fiabilidad sería una suposición.
- Tarea única y sin condicionamiento por lenguaje: el campo `task` del dataset está vacío, por lo que no se puede instruir al modelo con texto ni reutilizarlo para otra tarea sin reentrenar.
- Sensibilidad a la configuración de cámara: se entrenó con imágenes de 1080×1920 por cámara frontal, mientras que el ejemplo de *rollout* de la model card usa 640×480 a 30 FPS. El preprocesado y las claves de observación deben coincidir exactamente con los del entrenamiento o el rendimiento se degradará.
- Licencia no especificada: no se puede confirmar el uso comercial, la redistribución ni la obligación de atribución. Tratar como no apto para producción hasta que el autor la concrete.
- Sesgos previsibles: un único operador teleoperador, un único robot `so_follower` y un único entorno físico. La política hereda las peculiaridades cinemáticas de ese brazo concreto y no se ha validado en hardware distinto.
- Riesgo en entornos físicos: es un modelo de control motriz sin capa de seguridad. Requiere límites de par, paradas de emergencia y supervisión humana; no debe operar cerca de personas sin protecciones externas.
- Idiomas: no aplica, pero conviene insistir en que no es un modelo de lenguaje y no debe evaluarse con métricas de NLP (MMLU, HumanEval, GSM8K carecen de sentido aquí).
- Repositorio sin tracción: 0 descargas y 0 *likes*, creado y actualizado el 20 de octubre de 2026 con 12 segundos de diferencia entre ambos eventos. No hay evidencia de uso por terceros ni de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkalyank99/my_act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/nkalyank99/white_block_2_20260726_111914
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nkalyank99/white_block_2_20260726_111914
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
