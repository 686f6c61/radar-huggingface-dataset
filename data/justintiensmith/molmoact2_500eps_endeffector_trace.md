# justintiensmith/molmoact2_500eps_endeffector_trace

## Resumen

MolmoAct2 es un modelo fundacional de robótica de código abierto desarrollado por el Allen Institute for AI (Ai2) que mapea imágenes de cámara e instrucciones en lenguaje natural a secuencias de acciones de robot. Este repositorio concreto, `justintiensmith/molmoact2_500eps_endeffector_trace`, es un ajuste fino (fine-tune) del modelo base MolmoAct2 realizado con la librería LeRobot de Hugging Face, entrenado sobre un dataset de 498 episodios de manipulación de objetos en mesa con un robot tipo `so_follower`.

El modelo tiene 5.442.196.272 parámetros (aproximadamente 5,44 mil millones) y está especializado en tareas de manipulación como arrastrar, empujar, apilar, reorientar y recoger objetos. Su relevancia radica en que es una implementación práctica de un modelo de visión-lenguaje-acción (VLA) de código abierto, entrenable y desplegable en robots reales mediante el ecosistema LeRobot, lo que permite a la comunidad reproducir y adaptar políticas robóticas sin depender de soluciones propietarias.

La arquitectura se basa en MolmoER, un backbone de modelo de lenguaje y visión (VLM) diseñado específicamente para razonamiento espacial y embodied, entrenado sobre un corpus de 3,3 millones de muestras. Este fine-tune concreto se centra en el seguimiento de trayectorias del efector final (endeffector trace) y está licenciado bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en MolmoER, backbone VLM de MolmoAct2 |
| Parametros totales | 5.442.196.272 (5,44 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 10,9 GB) |

## Arquitectura y entrenamiento

MolmoAct2 es un modelo de acción razonada (action reasoning model) que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. El backbone MolmoER es un VLM entrenado con una receta "specialize-then-rehearse" sobre un corpus de 3,3 millones de muestras, orientado a mejorar el razonamiento espacial y embodied. En este fine-tune, la política consume tres entradas: dos imágenes de cámara (cámara central y cámara de muñeca, ambas a 480x640 píxeles) y un vector de estado del robot de 6 dimensiones. Produce un vector de acción de 6 dimensiones que representa el movimiento del efector final.

El entrenamiento se realizó con LeRobot versión 0.6.0, durante 40.180 pasos con un batch size de 24, optimizador AdamW y una tasa de aprendizaje de 1e-05. El dataset de entrenamiento, `mattpidden/500eps-endeffector-trace-dataset`, contiene 498 episodios y 137.695 frames a 30 FPS, con 25 tareas distintas de manipulación en mesa (arrastrar, empujar, apilar, reorientar, recoger y colocar objetos). No se menciona el uso de RLHF ni DPO; el entrenamiento es de imitación supervisada.

## Capacidades

- Manipulación robótica de objetos en entornos de mesa: arrastrar, empujar, apilar, reorientar, levantar y colocar objetos.
- Seguimiento de instrucciones en lenguaje natural: el modelo asocia comandos como "Pick up the apple and place it in the bowl" con las acciones motoras correspondientes.
- Percepción multimodal: procesa simultáneamente dos flujos de imagen (cámara fija y cámara de muñeca) junto con el estado propioceptivo del robot.
- Generación de acciones de efector final: produce vectores de acción de 6 dimensiones (posición y orientación) a 30 FPS.
- Integración con LeRobot: compatible con el pipeline de entrenamiento, evaluación y despliegue de LeRobot, incluyendo comandos CLI para rollout y entrenamiento.
- Capacidad de generalización limitada a las tareas del dataset: el fine-tune está especializado en las 25 tareas de manipulación del dataset de entrenamiento.

## Casos de uso

- Automatización de tareas de picking y placing en líneas de montaje: el modelo puede recoger objetos específicos (manzanas, bloques, tazas) y colocarlos en posiciones determinadas, lo que resulta útil para celdas de trabajo robóticas que requieren manipulación precisa de piezas.
- Tareas de ordenación y apilado en almacenes: gracias a su capacidad para apilar bloques, tazas y otros objetos, puede emplearse en sistemas de clasificación y empaquetado donde se necesita apilar artículos de forma estable.
- Manipulación de objetos deformables o semirrígidos: el dataset incluye tareas como arrastrar un paño o una taza, lo que permite explorar el control de objetos con fricción y deformación en entornos de investigación.
- Investigación en aprendizaje por imitación: al ser un modelo abierto y entrenable con LeRobot, sirve como punto de partida para estudiar técnicas de imitación, transferencia de tareas y generalización en robótica.
- Desarrollo de asistentes robóticos de laboratorio: tareas como abrir tapas de frascos, reorientar objetos o empujar elementos a posiciones concretas son comunes en entornos de laboratorio y pueden automatizarse con este modelo.
- Benchmarking de políticas VLA: al estar disponible públicamente con pesos y configuración de entrenamiento, puede utilizarse como referencia para comparar el rendimiento de otras políticas de manipulación en el mismo hardware y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito en robot real ni comparaciones con otros modelos. El repositorio de HuggingFace no reporta métricas de evaluación.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU recomendadas en la documentación disponible.
- Dado que el modelo tiene 5,44 mil millones de parámetros y los pesos se almacenan en safetensors (10,9 GB), se estima que la inferencia en precisión FP16 requiere al menos 12-16 GB de VRAM, aunque este dato no está confirmado por el autor.
- El entrenamiento se realizó con batch size 24, lo que sugiere que se utilizó una GPU de alta gama (posiblemente A100 o H100), pero no se especifica.
- Para despliegue, LeRobot ofrece integración con PyTorch y soporte para GPU CUDA. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no de generación de texto genérico.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MolmoAct2 (este fine-tune) | 5,44 B | no disponible | VLA para manipulacion robotica | Apache 2.0 | HuggingFace, pesos abiertos |
| MolmoAct (anterior) | 7 B (segun repositorio) | no disponible | VLA para manipulacion robotica | Apache 2.0 | HuggingFace, pesos abiertos |
| OpenVLA | 7 B | no disponible | VLA para manipulacion robotica | MIT | HuggingFace, pesos abiertos |

La comparativa se basa en datos publicos de los repositorios. MolmoAct2 es la segunda generacion de la familia MolmoAct, presentada como "mas rapida, mas fuerte y mejor en todos los aspectos" segun el repositorio oficial. No se dispone de datos de rendimiento comparativo entre estos modelos en tareas estandarizadas.

## Limitaciones y advertencias

- El modelo está especializado en las 25 tareas del dataset de entrenamiento; su capacidad de generalización a tareas fuera de este conjunto es desconocida y probablemente limitada.
- El dataset contiene 498 episodios, un volumen reducido que puede provocar sobreajuste a las condiciones específicas de captura (iluminación, posición de cámara, textura de objetos).
- No se han documentado sesgos conocidos, pero al ser un modelo entrenado con datos de un único entorno de robot, puede presentar dependencia de la configuración exacta del hardware (tipo de robot `so_follower`, cámaras específicas).
- Riesgo de alucinación en la interpretación de instrucciones ambiguas o fuera del vocabulario del dataset.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de LeRobot y de hardware robótico específico, lo que limita su aplicabilidad fuera de entornos con ese equipamiento.
- No se proporcionan garantías de seguridad para operación en entornos con presencia humana; es responsabilidad del usuario implementar medidas de seguridad adecuadas.
- El modelo fue creado en agosto de 2026 (fecha futura en el momento de redacción), lo que sugiere que puede ser un artefacto de investigación reciente con soporte comunitario limitado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/justintiensmith/molmoact2_500eps_endeffector_trace
- Repositorio oficial MolmoAct2 (GitHub): https://github.com/allenai/molmoact2
- Repositorio MolmoAct (anterior): https://github.com/allenai/MolmoAct
- Paper MolmoAct2 (arXiv): https://arxiv.org/abs/2605.02881
- Dataset de entrenamiento: https://huggingface.co/datasets/mattpidden/500eps-endeffector-trace-dataset
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
