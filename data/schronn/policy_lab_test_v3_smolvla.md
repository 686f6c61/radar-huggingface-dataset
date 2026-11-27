# schronn/policy_lab_test_v3_smolvla

## Resumen

SmolVLA es un modelo vision-lenguaje-acción (VLA) compacto orientado a robótica, desarrollado originalmente por Hugging Face y publicado con el paper arXiv:2506.01844. La ficha que nos ocupa, `schronn/policy_lab_test_v3_smolvla`, es un ajuste fino (fine-tune) del checkpoint base `lerobot/smolvla_base` sobre el dataset propio `schronn/lab_test_v3_20261127_153156`, entrenado y publicado con la librería LeRobot. Su propósito es traducir observaciones visuales y consignas en lenguaje natural en secuencias de acciones motoras para brazos robóticos de bajo coste, como el SO-100/SO-101.

El modelo cuenta con 450.046.176 parámetros (~450 M) y un repositorio de 0,9 GB en formato safetensors, lo que lo sitúa en la franja de modelos desplegables en hardware de consumo. Frente a los VLA de gran escala (RT-2, OpenVLA con 7 B de parámetros), SmolVLA apuesta por una arquitectura reducida con atención sobre un subconjunto de tokens visuales, lo que rebaja el coste computacional de inferencia manteniendo un rendimiento competitivo en tareas de manipulación.

La relevancia de esta ficha concreta es limitada: se trata de un artefacto de prueba (el nombre incluye `test_v3`), sin descargas ni interacciones, y sin model card específica más allá de la plantilla genérica de LeRobot. Resulta útil como ejemplo reproducible de cómo se ajusta y publica una política VLA sobre un dataset propio, pero no debe considerarse un checkpoint de referencia para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacto, base SmolVLA |
| Parámetros totales | 450.046.176 (~450 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las consignas de lenguaje dependen del dataset de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

SmolVLA combina un codificador visual, un codificador de lenguaje y un decodificador de acciones dentro de un transformer unificado. La innovación principal del trabajo original es el uso de atención sobre un subconjunto reducido de tokens visuales y una decodificación de acciones por flujo (flow matching), lo que reduce el coste de cómputo y permite inferencia en GPUs de consumo. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face sobre datos heterogéneos de robótica; esta ficha es un fine-tune de imitación supervisada (behavior cloning) sobre el dataset `schronn/lab_test_v3_20261127_153156`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (en robótica VLA no es lo habitual). El entrenamiento se realizó con la herramienta `lerobot-train` sobre el checkpoint base, y el resultado se distribuye con los pesos completos en safetensors.

## Capacidades

- Generación de acciones motoras de control para brazos robóticos a partir de observaciones visuales y consignas en lenguaje natural.
- Control de robots tipo SO-100/SO-101 mediante el stack LeRobot (`lerobot-record` para evaluación e inferencia).
- Ejecución de políticas de imitación entrenadas sobre demostraciones teleoperadas.
- Inferencia en hardware de consumo gracias a su tamaño de ~450 M de parámetros.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Capacidades de lenguaje y visión limitadas al dominio del dataset de ajuste; no es un modelo de propósito general.

## Casos de uso

- Prototipado de políticas de manipulación en laboratorio: el modelo sirve para validar rápidamente un pipeline de entrenamiento LeRobot sobre un dataset propio antes de escalar a datasets mayores o a checkpoints más capaces.
- Automatización de tareas de pick-and-place en un brazo SO-100: tras el ajuste sobre demostraciones, la política genera comandos articulares que el robot ejecuta en bucle cerrado con realimentación visual.
- Investigación en aprendizaje por imitación: permite reproducir experimentos de behavior cloning con un VLA compacto y comparar curvas de éxito frente a variantes del checkpoint base.
- Docencia y formación: su reducido tamaño (0,9 GB) y su licencia Apache 2.0 facilitan su uso en cursos de robótica y aprendizaje automático con hardware asequible.
- Evaluación de datasets de teleoperación: el modelo actúa como sonda para medir la calidad y coherencia de un dataset de demostraciones antes de invertir en entrenamientos más costosos.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo, puede ejecutarse en estaciones de trabajo sin acceso a clústeres, útil para pruebas de concepto en laboratorios pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasas de finalización de tareas ni comparaciones numéricas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en fp32 para los ~450 M de parámetros; menos de 1 GB en fp16 o cuantización de 8 bits (estimación a partir del tamaño, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y holgadas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas, incluidas las integradas de gama alta con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) es la vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| schronn/policy_lab_test_v3_smolvla | ~450 M | no disponible | Apache 2.0 | Hugging Face (LeRobot) | Fine-tune de prueba sobre dataset propio |
| lerobot/smolvla_base | ~450 M | no disponible | Apache 2.0 | Hugging Face (LeRobot) | Checkpoint base oficial de SmolVLA |
| OpenVLA | ~7 B | no disponible | Apache 2.0 (variantes) | Hugging Face | VLA de mayor escala, más costoso de desplegar |
| ACT (Action Chunking Transformer) | no disponible | no disponible | MIT (implementación LeRobot) | GitHub / Hugging Face | Política de imitación sin componente de lenguaje |

La comparación con OpenVLA y ACT se ofrece como referencia de categoría; no se dispone de métricas comunes que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo de prueba: el nombre `test_v3` y la ausencia de descargas sugieren un artefacto experimental sin validación externa.
- Sin model card específica: la documentación es la plantilla genérica de LeRobot, sin detalles del dataset, hiperparámetros ni resultados.
- Riesgo de sobreajuste al dataset de ajuste: al entrenarse sobre un único dataset pequeño, la política puede fallar fuera de las condiciones de laboratorio originales.
- Sesgos y generalización: no se han documentado sesgos, pero la generalización a nuevos objetos, iluminación o posiciones no está garantizada.
- Alucinación en el sentido de acciones incorrectas: la política puede generar comandos motores inválidos o inseguros; requiere supervisión humana y límites de seguridad en el robot.
- Idiomas: no se especifican; las consignas de lenguaje dependen del idioma presente en el dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No apto para producción sin evaluación previa: no hay métricas de éxito publicadas ni validación en entornos reales documentada.

## Enlaces

- Hugging Face: https://huggingface.co/schronn/policy_lab_test_v3_smolvla
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de ajuste: https://huggingface.co/datasets/schronn/lab_test_v3_20261127_153156
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
