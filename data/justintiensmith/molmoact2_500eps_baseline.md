# justintiensmith/molmoact2_500eps_baseline

## Resumen

MolmoAct2 es un modelo de robótica de código abierto desarrollado por el Allen Institute for AI (Ai2) que mapea imágenes de cámara e instrucciones en lenguaje natural a secuencias de acciones del robot. Este repositorio concreto, `justintiensmith/molmoact2_500eps_baseline`, es un ajuste fino del modelo base MolmoAct2 realizado por Justin Tien-Smith utilizando la librería LeRobot de Hugging Face, entrenado sobre un dataset de 498 episodios de manipulación con un robot tipo `so_follower`. El modelo tiene 5.442.196.272 parámetros (aproximadamente 5,44 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0.

La relevancia de este modelo radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot sobre un modelo fundacional de acción, permitiendo a desarrolladores e investigadores reproducir y adaptar el proceso a sus propios robots y tareas. Aunque no se publican métricas de evaluación en la información disponible, el modelo está diseñado para ejecutar tareas de manipulación como pick-and-place, apilado, empuje y reorientación de objetos sobre una mesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (VLM de razonamiento para acciones, basado en MolmoER) |
| Parametros totales | 5.442.196.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16, safetensors) |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MolmoAct2 es un modelo de acción razonamiento que combina un backbone VLM especializado (MolmoER) con una cabeza de predicción de acciones. Según el paper arXiv 2605.02881, MolmoER se entrena sobre un corpus de 3,3 millones de muestras con una receta de "especializar y ensayar" (specialize-then-rehearse), lo que le confiere capacidades de razonamiento espacial y encarnado. En esta implementación concreta, el modelo recibe como entrada tres imágenes de cámara (middle, wrist y posiblemente otras) de 480x640 píxeles y un vector de estado del robot de 6 dimensiones, y produce un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot versión 0.6.0 sobre el dataset `mattpidden/500eps-baseline-dataset`, que contiene 498 episodios y 137.695 fotogramas a 30 FPS. Se usaron 40.180 pasos de entrenamiento con batch size 24, optimizador AdamW y learning rate de 1e-05. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el proceso es de imitación supervisada estándar.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad (posición y orientación del efector) a partir de observaciones visuales y de estado.
- Seguimiento de instrucciones en lenguaje natural: interpreta comandos como "Pick up the apple and place it in the bowl" o "Stack the blocks on top of another block".
- Percepción multi-cámara: procesa simultáneamente imágenes de cámara frontal y de muñeca (y potencialmente laterales) para razonar sobre la escena.
- Razonamiento espacial y encarnado: heredado del backbone MolmoER, permite comprender relaciones entre objetos y planificar acciones.
- Generación de chunks de acción: produce secuencias de acciones (action chunks) en lugar de acciones paso a paso, lo que mejora la fluidez del movimiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede recoger objetos (manzanas, bloques, cajas) y colocarlos en recipientes o posiciones específicas, útil para líneas de montaje o clasificación.
- Manipulación de objetos deformables: tareas como arrastrar un paño o una taza sobre la mesa demuestran capacidad para manejar objetos no rígidos, aplicable en robótica de servicio doméstico.
- Reorientación y apilado de objetos: el modelo puede enderezar bloques, apilar tazas o colocar objetos en posición vertical, relevante para logística y almacenamiento automatizado.
- Investigación en imitación learning: sirve como punto de partida para estudiar cómo los modelos fundacionales de acción se adaptan a dominios específicos con pocos datos.
- Desarrollo de políticas robóticas transferibles: al ser un ajuste fino de MolmoAct2, permite evaluar la transferencia de conocimiento de un modelo preentrenado a tareas concretas con un robot SO-100.
- Despliegue en robots de bajo coste: el robot `so_follower` es un brazo robótico de código abierto y económico, lo que facilita la experimentación en entornos académicos o de pequeña empresa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito por tarea ni comparaciones con otros modelos. Se recomienda consultar el repositorio de MolmoAct2 de Ai2 para métricas del modelo base, pero no hay datos específicos de este ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,44 mil millones de parámetros, en fp16 se necesitan aproximadamente 10,9 GB solo para los pesos. Con overhead de activaciones y buffers, se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o cualquier GPU con 16 GB o más de memoria.
- Compatibilidad con GPU de consumo: sí, una RTX 4080 o 4090 puede ejecutar el modelo en fp16, aunque con latencia mayor que en GPUs de datacenter.
- Opciones de despliegue: el flujo principal es mediante LeRobot (`lerobot-rollout`), que requiere CUDA. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de robótica con pipeline específico.
- Latencia y throughput: no disponible en la información proporcionada. Dependerá de la GPU y de la resolución de las imágenes de entrada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base MolmoAct2 de Ai2 es la referencia directa, pero no se especifican diferencias de rendimiento. Otros modelos de robótica como OpenVLA o RT-2 podrían ser comparables, pero no hay métricas disponibles para este ajuste fino.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo se entrenó exclusivamente con tareas de manipulación sobre una mesa con objetos específicos (manzanas, bloques, tazas, etc.). No generalizará a otros entornos u objetos sin reentrenamiento.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir acciones incorrectas o inconsistentes si la escena difiere del dataset de entrenamiento.
- Limitaciones de idioma: las instrucciones están en inglés y el modelo no ha sido evaluado en otros idiomas.
- Dependencia del robot: el modelo está calibrado para el robot `so_follower` con una configuración de cámaras concreta. Usarlo en otro hardware requiere adaptación.
- Sin evaluación publicada: no hay tasas de éxito reportadas, por lo que el rendimiento real en el robot es desconocido.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base MolmoAct2 puede tener restricciones adicionales; se recomienda revisar la licencia del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/justintiensmith/molmoact2_500eps_baseline
- Repositorio oficial MolmoAct2 (Ai2): https://github.com/allenai/molmoact2
- Paper MolmoAct2: https://arxiv.org/abs/2605.02881
- Repositorio MolmoAct (anterior): https://github.com/allenai/MolmoAct
- Dataset de entrenamiento: https://huggingface.co/datasets/mattpidden/500eps-baseline-dataset
- Guía LeRobot para MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
