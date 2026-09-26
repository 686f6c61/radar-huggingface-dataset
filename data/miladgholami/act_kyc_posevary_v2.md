# miladgholami/act_kyc_posevary_v2

## Resumen

`miladgholami/act_kyc_posevary_v2` es una política de robótica (policy de control) entrenada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots reales. El modelo implementa una política de tipo `act_kyc` (variante de ACT, Action Chunking with Transformers) que consume observaciones multimodales del robot y de cuatro cámaras y produce directamente comandos de acción de 6 grados de libertad. Está pensado para ejecutar una tarea concreta de manipulación: coger unas tijeras y dejarlas en una cesta amarilla.

El modelo tiene 55.863.046 parámetros (unos 55,9 millones) y ocupa 0,2 GB en el repositorio, por lo que es muy ligero en comparación con los grandes modelos de lenguaje. Su interés radica en que ejemplifica el flujo completo de LeRobot: grabación de demostraciones con hardware de bajo coste (robot `so_follower`), entrenamiento de una política de imitación y despliegue en tiempo real sobre el robot físico. La variante concreta `kyc` y su aportación técnica no están documentadas en la información disponible.

La relevancia actual de este tipo de modelos está en el auge del aprendizaje por imitación aplicado a robótica asequible (brazos tipo SO-100/SO-101), donde políticas pequeñas y específicas de tarea permiten obtener comportamientos fiables sin necesidad de modelos fundacionales de gran tamaño. No obstante, se trata de un modelo con 0 descargas y 0 likes, sin resultados de evaluación publicados y con una única tarea de entrenamiento, por lo que debe considerarse un experimento reproducible más que una solución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), variante `act_kyc`; detalles de la variante no disponibles |
| Parametros totales | 55.863.046 (aprox. 55,9 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (política de robótica; no usa ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos íntegramente en safetensors) |
| Idiomas soportados | no disponible (política de robótica orientada a control; no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Datos adicionales relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Cámaras | `side_right`, `wrist`, `side_back`, `side_left` |
| Entrada `observation.state` | `(6,)` |
| Entradas visuales | 4 × `(3, 480, 640)` |
| Entradas de pose de cámara | 3 × `(16,)` |
| Entradas de intrínsecos de cámara | 3 × `(9,)` |
| Salida `action` | `(6,)` |
| Tarea | "Pick up the scissors and put it in the yellow basket" |
| Dataset de entrenamiento | `miladgholami/scissor_posevary_30ep_kycready` |
| Episodios / frames | 30 episodios / 5624 frames a 30 FPS |
| Pasos de entrenamiento | 100000 |
| Batch size | 8 |
| Optimizador / LR | adamw / 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

La etiqueta `act_kyc` y la integración con LeRobot sitúan a este modelo en la familia de políticas ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, mediante un transformer con un componente de autoencoder variacional condicional. Sin embargo, la model card no describe la arquitectura interna, por lo que cualquier detalle adicional sobre el codificador visual, el número de capas o el horizonte de chunking sería especulativo y no se incluye aquí.

El entrenamiento se realizó sobre el dataset `miladgholami/scissor_posevary_30ep_kycready`, compuesto por 30 episodios y 5624 frames grabados a 30 FPS con cuatro cámaras más el estado del robot y metadatos de pose e intrínsecos de tres de ellas. La configuración reportada incluye 100000 pasos, batch size 8, optimizador AdamW con learning rate 1e-05 y semilla 1000. No se documenta en la información disponible si hubo etapas de RLHF, DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.), por lo que estos extremos quedan como no disponibles.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones a partir de observaciones de estado, cuatro vistas de cámara y metadatos de calibración.
- Ejecución de una tarea de manipulación concreta: "Pick up the scissors and put it in the yellow basket".
- Percepción visual multivista: procesa simultáneamente cuatro flujos RGB de 480x640 a 30 FPS (`side_right`, `wrist`, `side_back`, `side_left`).
- Incorporación de información de calibración: usa pose (`16,`) e intrínsecos (`9,`) de tres cámaras, lo que sugiere capacidad de variación de la disposición de las cámaras (consistente con el sufijo `posevary` del identificador).
- Compatibilidad con el ecosistema LeRobot: se ejecuta mediante `lerobot-rollout` y se reentrena mediante `lerobot-train`.
- No dispone de: generación de texto, razonamiento simbólico, código, matemáticas, tool calling, function calling, capacidades de agente, thinking mode, audio ni visión general más allá de la percepción para control.

## Casos de uso

- Automatización de picking en laboratorio o línea de montaje ligera: la política coge objetos (en este caso tijeras) y los deposita en un contenedor designado, integrándose en una celda con brazo `so_follower`.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar cómo varía el rendimiento al cambiar la disposición de las cámaras, gracias a que la política consume pose e intrínsecos por cámara.
- Reentrenamiento para tareas de recogida y depósito: el flujo `lerobot-train` con `--policy.type=act_kyc` permite adaptar la política a nuevas tareas grabando un dataset propio, reutilizando la misma arquitectura.
- Base para experimentos de robustez a la pose de cámara: el sufijo `posevary` sugiere que el modelo se entrenó con variaciones en la colocación de las cámaras, útil para medir sensibilidad a la calibración.
- Docencia y prototipado en robótica de bajo coste: al ocupar 0,2 GB y tener 55,9 M de parámetros, puede desplegarse en equipos modestos para prácticas de manipulación.
- Benchmark interno de comparación de políticas: al ser una política ACT concreta, permite comparar tiempos de inferencia y éxito frente a otras políticas de LeRobot (Diffusion Policy, SmolVLA) sobre la misma tarea.
- Validación de pipelines de datos con múltiples sensores: sirve para probar la captura y sincronización de cuatro cámaras a 480x640 más estado del robot a 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", sin tabla de trials, éxitos ni tasas de éxito sobre la tarea de manipulación.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 55,9 M de parámetros, no confirmado por el autor):
  - Precisión completa (FP32): ~224 MB solo de pesos.
  - Media precisión (FP16/BF16): ~112 MB solo de pesos.
  - Cuantización INT8: ~56 MB (no se distribuyen pesos cuantizados en el repositorio).
  - A lo anterior hay que sumar activaciones de la codificación visual de 4 imágenes de 480x640 a 30 FPS.
- GPU recomendadas: cualquier GPU con CUDA de gama media o superior (RTX 3060, RTX 4090, A100, H100) es más que suficiente; el cuello de botella real es el pipeline de cámaras, no el modelo.
- ¿Cabe en GPU de consumo? Sí, con holgura: el modelo cabría incluso en GPUs con 4-6 GB de VRAM y en algunos casos podría ejecutarse en CPU, aunque no se recomienda para control en tiempo real.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`), ecosistema LeRobot y librería `lerobot`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política de control.
- Latencia y throughput: no disponibles. El dataset y la ejecución se fijan a 30 FPS, por lo que el sistema debe sostener ese ritmo, pero no se publican medidas de latencia ni de throughput reales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados de este modelo, por lo que no es posible comparar sus resultados numéricos con alternativas. La comparación siguiente es únicamente cualitativa y a nivel de familia de políticas del ecosistema LeRobot.

| Modelo | Familia | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_kyc_posevary_v2 (este modelo) | ACT (variante `act_kyc`) | 55,9 M | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| ACT (referencia original de la familia) | Action Chunking with Transformers | no disponible | no disponible | no disponible | Implementaciones públicas, no esta ficha |
| Diffusion Policy | Política de difusión | no disponible | no disponible | no disponible | Soportada por LeRobot |
| SmolVLA | VLA fundacional ligero | no disponible | no disponible | no disponible | Soportada por LeRobot |

No se dispone de cifras verificadas de parámetros, contexto ni rendimiento para las alternativas dentro de la información proporcionada, por lo que los campos correspondientes se marcan como no disponibles en lugar de estimarse.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre 30 episodios de una tarea concreta, la política tenderá a reproducir los sesgos de posición, iluminación y colocación de objetos presentes en el dataset.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de acciones incorrectas o inestables fuera de la distribución de entrenamiento (objetos en posiciones nuevas, distractores, cambios de iluminación).
- Limitación de tarea: entrenada para una única tarea ("Pick up the scissors and put it in the yellow basket"); no generaliza a otras tareas sin reentrenamiento.
- Limitación de contexto e idioma: no procede; la política no procesa lenguaje ni tiene ventana de contexto textual.
- Dependencia del hardware: requiere un robot `so_follower` y las cuatro cámaras en la disposición esperada; los nombres de cámara deben coincidir con las claves de observación del entrenamiento.
- Sin evaluación publicada: no hay tasa de éxito, número de trials ni análisis de robustez, lo que impide estimar su fiabilidad real.
- Licencia: apache-2.0, permisiva para uso comercial, pero sin garantías por parte del autor y con obligación de conservar avisos de licencia y atribución.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento continuado.
- Advertencia para producción: no debe desplegarse en entornos con riesgo físico sin validación previa exhaustiva, sistemas de parada de emergencia y supervisión, dado que es una política de control de un brazo robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miladgholami/act_kyc_posevary_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/miladgholami/scissor_posevary_30ep_kycready
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=miladgholami/scissor_posevary_30ep_kycready
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de una política: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (BibTeX): Cadene et al., 2024, https://github.com/huggingface/lerobot
