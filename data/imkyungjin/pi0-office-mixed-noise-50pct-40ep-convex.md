# ImKyungjin/pi0-office-mixed-noise-50pct-40ep-convex

## Resumen

Este repositorio contiene un ajuste fino del modelo π₀ (Pi0), un modelo de visión-lenguaje-acción (VLA) para el control de robots de propósito general desarrollado originalmente por Physical Intelligence. El checkpoint ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y se distribuye bajo licencia Apache 2.0.

El modelo tiene 3.501.372.176 parámetros (unos 3,5 mil millones) y ocupa aproximadamente 7 GB en el repositorio, lo que sugiere pesos almacenados en precisión fp16/bf16 (unos 2 bytes por parámetro). El nombre del checkpoint indica que se ha entrenado sobre el dataset `taewonkoo/office_task_mixed_suboptimal_seed1000_50pct_40ep`, una mezcla de datos de tareas de oficina con un 50 % de datos subóptimos y 40 épocas, lo que apunta a un experimento de investigación sobre el efecto de los datos subóptimos en el aprendizaje de políticas robóticas.

Se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de redactar esta ficha, sin resultados de evaluación publicados por el autor. Su relevancia es acotada: sirve como ejemplo de ajuste fino de π₀ dentro del ecosistema LeRobot, no como modelo listo para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción (VLA); base π₀ de Physical Intelligence (backbone VLM tipo PaliGemma con experto de acción) |
| Parámetros totales | 3.501.372.176 (dato real de los safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican versiones cuantizadas; los pesos del repositorio están en fp16/bf16 (≈7 GB) |
| Idiomas soportados | No disponible (la model card no especifica idiomas; el backbone VLM base de π₀ es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Pipeline | robotics |
| Tipo de política | Control robótico (aprendizaje por imitación) |
| Dataset de entrenamiento | taewonkoo/office_task_mixed_suboptimal_seed1000_50pct_40ep |

## Arquitectura y entrenamiento

La arquitectura base π₀ es un modelo de visión-lenguaje-acción que combina un modelo de visión-lenguaje preentrenado (que procesa imágenes de cámaras e instrucciones en lenguaje natural) con un módulo generador de acciones. Este checkpoint es un ajuste fino de esa base sobre un dataset concreto de tareas de oficina, por lo que hereda la arquitectura y los pesos preentrenados de π₀. La información proporcionada no detalla la configuración exacta del backbone, el número de vistas de cámara soportadas ni la longitud de contexto utilizada.

El entrenamiento se ha realizado con LeRobot sobre el dataset `taewonkoo/office_task_mixed_suboptimal_seed1000_50pct_40ep`. Por el nombre se deduce una mezcla de datos subóptimos (50 %) y un entrenamiento de 40 épocas, con una variante etiquetada como "convex". No se especifican en la model card el número de tokens, la composición exacta del dataset, ni si se emplearon técnicas de RLHF, DPO o refinamiento posterior. Tampoco se documentan innovaciones técnicas específicas de este ajuste.

## Capacidades

- Control robótico guiado por lenguaje: genera acciones motrices a partir de instrucciones en lenguaje natural e imágenes de cámaras, siguiendo el paradigma VLA de π₀.
- Manipulación de propósito general: al derivar de π₀, está concebido para tareas de manipulación en entornos físicos, aunque este checkpoint está especializado en tareas de oficina.
- Aprendizaje por imitación: se ha entrenado a partir de demostraciones del dataset indicado, no mediante refuerzo explícito.
- Integración con LeRobot: compatible con los comandos `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- Capacidades multilingües: no disponibles (la model card no las declara; dependen del backbone VLM subyacente).
- Tool calling / function calling: no disponible (no es una capacidad propia de un modelo de control robótico).
- Modo de razonamiento o "thinking": no disponible.
- Visión y audio: se asume entrada visual por ser un modelo VLA; las capacidades de audio no están documentadas.

## Casos de uso

- Investigación sobre datos subóptimos en robótica: el checkpoint permite reproducir y comparar experimentos sobre cómo afecta una proporción del 50 % de datos subóptimos al rendimiento de una política π₀, usando el dataset de referencia.
- Manipulación en entornos de oficina simulados: al estar especializado en tareas de oficina, resulta adecuado para prototipos de recogida y colocación de objetos sobre una mesa o escritorio en simulación.
- Evaluación comparativa de políticas en LeRobot: sirve como punto de partida para medir la degradación o mejora frente a un π₀ base entrenado solo con datos óptimos.
- Base para nuevos ajustes finos: puede emplearse como inicialización para reentrenar sobre datasets de oficina más limpios o con otras proporciones de ruido.
- Reproducción de pipelines de entrenamiento: útil para verificar flujos completos de `lerobot-train` y `lerobot-record` con un checkpoint real de 3,5 B de parámetros.
- Docencia y formación en VLA: como ejemplo tangible de cómo se publica y despliega un modelo de visión-lenguaje-acción con LeRobot en robótica de bajo coste (por ejemplo, brazos SO-100/SO-101).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16 el modelo ocupa unos 7 GB solo en pesos; con activaciones, imágenes de entrada y el experto de acción conviene reservar 12-16 GB como mínimo.
- GPU recomendadas: A100 (40/80 GB), H100, L40S, RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en fp16/bf16. GPUs de 16 GB (RTX 4080, A4000) pueden ser ajustadas.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090; en 16 GB puede requerir cuantización o reducción de resolución de imagen.
- Opciones de despliegue: LeRobot (comandos `lerobot-train`, `lerobot-record`), PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no están orientadas a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Entorno / disponibilidad |
|---|---|---|---|---|
| Este checkpoint (pi0-office-mixed-noise-50pct-40ep-convex) | 3,5 B | No disponible | Apache 2.0 | LeRobot / Hugging Face |
| π₀ base (Physical Intelligence / OpenPI) | ≈3 B (no confirmado en la información) | No disponible | No disponible | OpenPI, LeRobot |
| OpenVLA | ≈7 B | No disponible | No disponible | Repositorio propio |
| Políticas ligeras de LeRobot (ACT, Diffusion Policy) | Decenas de millones | No aplica | Apache 2.0 | LeRobot |

Los datos de los modelos comparables proceden del conocimiento público general y no están verificados en la información proporcionada; se marcan como no disponibles aquellos campos que no pueden confirmarse.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se ha publicado ninguna evaluación de sesgos ni de comportamiento en condiciones fuera de distribución.
- Riesgo de alucinación: relevante en la componente de lenguaje, aunque en un VLA el fallo se manifiesta como acciones incorrectas más que como texto inventado.
- Limitación de contexto e idioma: no se especifican ni la longitud de contexto ni los idiomas soportados; el rendimiento real dependerá del backbone VLM de π₀.
- Especialización estrecha: el ajuste está orientado a tareas de oficina y a la distribución concreta del dataset de entrenamiento; no debe esperarse un comportamiento generalista fuera de ese dominio.
- Datos subóptimos: el propio nombre indica un 50 % de datos subóptimos, lo que puede degradar la calidad de las políticas aprendidas respecto a un entrenamiento con datos óptimos.
- Ausencia de evaluación: con 0 descargas, 0 likes y sin benchmarks publicados, no hay evidencia empírica de su rendimiento.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo deriva de π₀ y conviene verificar las condiciones de los pesos base de Physical Intelligence antes de un uso comercial.
- Caveat para producción: se trata de un artefacto de investigación; no se recomienda su uso directo en sistemas robóticos reales sin una validación exhaustiva de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-office-mixed-noise-50pct-40ep-convex
- Dataset de entrenamiento: https://huggingface.co/datasets/taewonkoo/office_task_mixed_suboptimal_seed1000_50pct_40ep
- Blog de π₀ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- LeRobot (Hugging Face): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
