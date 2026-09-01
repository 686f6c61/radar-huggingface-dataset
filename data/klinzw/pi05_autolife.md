# klinzw/pi05_autolife

## Resumen

El modelo `klinzw/pi05_autolife` es un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, que a su vez es la implementación en LeRobot del modelo π₀.₅ (Pi0.5) de Physical Intelligence, un modelo Visión-Lenguaje-Acción (VLA) diseñado para la generalización en mundo abierto. Este repositorio concreto adapta ese modelo generalista a un robot doméstico específico (`autolife_s1`) para ejecutar dos tareas concretas: abrir y cerrar la puerta de un frigorífico.

El modelo tiene aproximadamente 4.143 millones de parámetros (4,14 B) y está entrenado sobre un dataset propio de 100 episodios con 144.282 fotogramas a 30 FPS. Su relevancia radica en que demuestra el flujo práctico de adaptar un VLA de última generación a un caso de uso robótico específico mediante la librería LeRobot, manteniendo la licencia Apache 2.0. La longitud de contexto y los idiomas soportados no están especificados en la información disponible, al tratarse de un modelo orientado a control robótico y no a procesamiento de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en Pi0.5 (transformers) |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robotica, no orientado a lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅ (Pi0.5), un VLA que co-entrena con datos diversos (demostraciones robóticas, datos web y subtareas semánticas) para lograr generalización en mundo abierto. En este caso, se parte del checkpoint `lerobot/pi05_base` y se realiza un ajuste fino supervisado mediante aprendizaje por imitación (imitation learning) sobre el dataset `klinzw/autolife_pi05`.

El dataset de entrenamiento contiene 100 episodios y 144.282 fotogramas a 30 FPS, con las tareas "close fridge" y "open fridge". La configuración de entrenamiento incluye 100.000 pasos, batch size de 4, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000, utilizando la versión 0.6.0 de LeRobot. El modelo consume tres entradas visuales (cámaras `head_left`, `hand_left` y `hand_right`, cada una de 224x224 píxeles) junto con un vector de estado de 23 dimensiones, y produce un vector de acción de 23 dimensiones.

## Capacidades

- Control robótico de manipulación: genera acciones de 23 dimensiones para el robot `autolife_s1`.
- Percepción visual multi-cámara: procesa simultáneamente tres flujos de imagen (cabeza y dos manos).
- Ejecución de tareas específicas de hogar: apertura y cierre de puerta de frigorífico.
- Aprendizaje por imitación: capacidad de replicar comportamientos demostrados en el dataset de entrenamiento.
- Generalización open-world heredada de Pi0.5, aunque limitada por el ajuste fino a las tareas concretas.
- No soporta generación de texto, tool calling ni razonamiento conversacional, al ser un modelo puramente robótico.

## Casos de uso

- Automatización del hogar: el modelo puede integrarse en un robot móvil con brazo para realizar la tarea de abrir y cerrar la puerta del frigorífico de forma autónoma, liberando al usuario de una tarea repetitiva.
- Investigación en robótica: sirve como punto de partida para estudiar cómo un VLA generalista se adapta a un dominio específico con pocos datos (100 episodios).
- Desarrollo de políticas de imitación: permite evaluar el flujo completo de LeRobot, desde la grabación de datos hasta el despliegue, en un robot real.
- Evaluación de generalización zero-shot: al estar basado en Pi0.5, se puede probar su comportamiento en variaciones del entorno (nueva posición del frigorífico, cambios de iluminación) para medir la robustez del ajuste fino.
- Integración en pipelines de investigación: al ser Apache 2.0, puede incorporarse en proyectos académicos o comerciales sin restricciones de licencia.
- Benchmarking de VLA en entornos reales: permite comparar el rendimiento de un VLA de 4B parámetros frente a políticas más pequeñas (como ACT) en la misma plataforma robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de tasas de éxito en tareas reales ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 B de parámetros, en precisión fp16/bf16 se requieren aproximadamente 8,3 GB de VRAM, mientras que en fp32 se necesitarían unos 16,5 GB. Se recomienda al menos 12 GB de VRAM para operar con margen.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 o superiores. No se recomienda inferencia en CPU por la latencia.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o 4090 es suficiente para ejecutar el modelo en fp16.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot mediante el comando `lerobot-rollout`, que gestiona la captura de cámaras y el envío de acciones al robot. No se menciona soporte para vLLM, Ollama o TGI, al ser un modelo de robótica y no de lenguaje.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| `klinzw/pi05_autolife` | VLA (Pi0.5) | 4,14 B | no disponible | Apache 2.0 | Tareas específicas de frigorífico en robot `autolife_s1` |
| `lerobot/pi05_base` | VLA (Pi0.5) | 4,14 B (aprox.) | no disponible | Apache 2.0 | Modelo base generalista para fine-tuning |
| `klinzw/act_autolife` | ACT (Action Chunking with Transformers) | no disponible | no disponible | Apache 2.0 | Mismo robot y tareas, pero con una política más pequeña y clásica |

La comparativa muestra que este modelo es un intermedio entre el base generalista y una política ligera como ACT. Mientras que ACT es más eficiente en recursos, el VLA de 4B parámetros ofrece mayor capacidad de generalización si se entrena adecuadamente, aunque en este caso el dataset es reducido (100 episodios).

## Limitaciones y advertencias

- Sobreajuste potencial: el modelo se ha entrenado únicamente con 100 episodios para dos tareas muy concretas, por lo que es probable que no generalice bien a otras tareas o a variaciones significativas del entorno.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware específico: las entradas están fijadas a tres cámaras concretas (`head_left`, `hand_left`, `hand_right`) y a un vector de estado de 23 dimensiones, lo que limita su uso a robots con esa configuración exacta.
- Riesgo de alucinación en acciones: como todo modelo de imitación, puede generar acciones no seguras si se enfrenta a estados fuera de la distribución de entrenamiento.
- Licencia del modelo base: aunque este repositorio es Apache 2.0, es recomendable verificar la licencia del modelo base `lerobot/pi05_base` y del dataset asociado para asegurar el cumplimiento en proyectos comerciales.
- Sin soporte de lenguaje natural: no se debe esperar que el modelo procese instrucciones textuales complejas, ya que su entrada es exclusivamente visual y de estado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/klinzw/pi05_autolife
- Dataset de entrenamiento: https://huggingface.co/datasets/klinzw/autolife_pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog oficial de Pi0.5: https://www.pi.website/blog/pi05
- Paper de Pi0.5 (arXiv): https://arxiv.org/html/2504.16054v1
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de Pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
