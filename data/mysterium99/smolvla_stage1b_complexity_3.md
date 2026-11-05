# mysterium99/smolvla_stage1b_complexity_3

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot. Esta ficha concreta, `mysterium99/smolvla_stage1b_complexity_3`, es un ajuste fino del checkpoint base `lerobot/smolvla_base` sobre el conjunto de datos de manipulación industrial `manufacturing_level_3`. El modelo traduce observaciones visuales (tres cámaras a 256x256) y el estado de las articulaciones del robot en acciones motoras de 6 dimensiones, actuando como política de imitación para tareas de clasificación de tornillería y componentes metálicos.

La relevancia de SmolVLA radica en que demuestra que es posible obtener un rendimiento competitivo en control robótico con un presupuesto computacional reducido, permitiendo despliegue en hardware de consumo. Este ajuste específico cubre 39 instrucciones en lenguaje natural distintas, desde "Put all screws in the bucket" hasta "Pick up the longest bolt and give it to the human", lo que lo convierte en un caso de estudio interesante sobre generalización de instrucciones en políticas VLA pequeñas.

El modelo cuenta con 450 millones de parámetros, se distribuye en formato safetensors (0,9 GB) bajo licencia Apache 2.0 y se entrenó durante 60.000 pasos con un batch de 32 sobre 1.900 episodios y 1,8 millones de fotogramas a 30 FPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según paper SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política de imitación por paso, no modelo conversacional) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones en esta ficha) |
| Idiomas soportados | no disponible (instrucciones de tarea en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA es una política de imitación que combina un codificador visual (tres cámaras de entrada a 256x256 píxeles), un codificador de lenguaje para la instrucción de tarea y un cabezal de acciones que produce un vector de 6 dimensiones por paso. La arquitectura sigue la propuesta del paper SmolVLA (arXiv:2506.01844), orientada a reducir el coste computacional frente a VLA de mayor tamaño manteniendo un rendimiento competitivo en tareas de manipulación. El modelo consume `observation.state` (vector de 6 dimensiones) junto con tres flujos visuales (`observation.images.camera1/2/3`) y emite directamente `action` (6 dimensiones).

El ajuste fino se realizó sobre el dataset `manufacturing_level_3`: 1.900 episodios, 1.812.714 fotogramas a 30 FPS, con 39 tareas distintas de clasificación de tornillos, tuercas, arandelas y muelles en zonas delimitadas o en un cubo. La configuración de entrenamiento reportada es de 60.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-4, semilla 0 y LeRobot 0.6.1. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición exacta del dataset más allá de los episodios y tareas indicados.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir de observaciones visuales y de estado articular.
- Seguimiento de instrucciones en lenguaje natural: soporta 39 tareas distintas descritas en inglés (clasificación de tornillería, entrega de piezas a un humano, agrupación por tipo de material).
- Percepción multi-cámara: procesa tres flujos visuales simultáneos (`gripper`, `newtop`, `newside`) a 256x256.
- Interacción humano-robot: varias tareas implican recibir o entregar piezas a una persona ("give it to the human", "take screw from human").
- Manipulación de precisión sobre objetos pequeños: tornillos de 2 y 4 pulgadas, tuercas de zinc y galvanizadas, muelles de distintas longitudes.
- Despliegue en hardware de consumo: el tamaño de 450 M de parámetros permite ejecución en GPU de gama media según el paper base.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo "thinking"; es una política motora, no un LLM conversacional.

## Casos de uso

- Clasificación automatizada de tornillería en línea de montaje: el modelo recibe las tres cámaras y la instrucción "Put all screws in the bucket", y emite acciones de brazo para agrupar piezas por tipo. Adecuado porque el dataset de entrenamiento cubre exactamente estas tareas con 1,8 M de fotogramas.
- Selección por criterio geométrico: instrucciones como "Put the longest bolt in the bucket" o "Put the smallest nut in the taped area" requieren comparación visual entre piezas; el codificador visual multi-cámara permite discriminar longitudes y tamaños.
- Entrega de piezas a un operario: tareas tipo "Pick up one zinc nut and give to human" o "Take screw from human and put with other screws" habilitan células de trabajo colaborativas donde el robot asiste al operario.
- Reorganización de zonas delimitadas: instrucciones como "Remove all springs from the taped area" o "Put the screws in the left taped area and the bolts in the right taped area" permiten reconfigurar la disposición de piezas según la fase del proceso.
- Prototipado rápido de políticas de imitación: al ser un ajuste fino de `smolvla_base` con configuración de entrenamiento documentada, sirve como punto de partida para reentrenar sobre nuevos datasets de manufactura con LeRobot.
- Investigación en generalización de instrucciones: con 39 tareas distintas sobre el mismo entorno físico, es útil para estudiar cómo políticas VLA pequeñas generalizan entre instrucciones que comparten objetos pero difieren en el destino.
- Despliegue en estaciones de bajo coste: los 450 M de parámetros y el formato safetensors de 0,9 GB permiten ejecución en GPUs de consumo, lo que facilita pilotos en laboratorios o pymes sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en FP32 serían aproximadamente 1,8 GB de pesos, y en FP16 unos 0,9 GB, a lo que hay que sumar activaciones del codificador visual para tres cámaras a 256x256.
- GPU recomendadas: no disponible en la información proporcionada; el paper base de SmolVLA indica despliegue en hardware de consumo.
- Compatibilidad con GPU de consumo: plausible según el tamaño (450 M de parámetros), aunque no se confirma en la ficha para este ajuste concreto.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` documentado en la model card (con `--policy.path=mysterium99/smolvla_stage1b_complexity_3`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible; el dataset se grabó a 30 FPS, lo que sugiere que el bucle de control opera a esa frecuencia, pero no se reporta latencia medida del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `mysterium99/smolvla_stage1b_complexity_3` | 450 M | 3 cámaras 256x256 + estado 6D | Apache 2.0 | Hugging Face (0 descargas) |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | no disponible en la información | Hugging Face (modelo base) |
| Políticas VLA de mayor tamaño (p. ej. familias tipo RT-2, OpenVLA) | no disponible en la información | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos de rendimiento frente a alternativas; la comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Especialización estrecha: entrenado exclusivamente sobre `manufacturing_level_3` con 39 tareas de tornillería; no se espera generalización a otros entornos, objetos o dominios sin reentrenamiento.
- Dependencia del entorno físico: requiere la misma configuración de robot (`follow`), las mismas tres cámaras (`gripper`, `newtop`, `newside`) y las mismas posiciones relativas que en la grabación.
- Idioma de las instrucciones: las tareas están en inglés; no se documenta soporte multilingüe.
- Riesgo de fallo por distribución fuera de entrenamiento: cambios de iluminación, fondo, tipo de pieza o calibración pueden degradar el comportamiento sin aviso.
- Sin métricas publicadas: no hay benchmarks ni tasas de éxito reportadas en la información disponible, lo que impide evaluar su rendimiento real antes del despliegue.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; la responsabilidad de validación en producción recae en el integrador.
- Ausencia de salvaguardas documentadas: al ser una política motora, no incorpora filtros de seguridad; debe operarse con paradas de emergencia y límites físicos.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni reportes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage1b_complexity_3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_level_3
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_level_3
