# KyraLeeChunWei/ParacetamolRecovery_e50_20K_ACT

## Resumen

ParacetamolRecovery_e50_20K_ACT es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705. El modelo lo desarrolla el usuario KyraLeeChunWei y se distribuye a través de Hugging Face dentro del ecosistema LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. No es un modelo de lenguaje: es un controlador visomotor que, a partir de observaciones (típicamente imágenes de cámara y estado de las articulaciones), predice fragmentos de acciones (action chunks) en lugar de pasos individuales.

El modelo tiene 51.678.855 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,4 GB en formato safetensors. Está entrenado sobre el dataset `KyraLeeChunWei/ParacetamolRecovery_e50`, que por el nombre sugiere una tarea de manipulación robótica de recuperación de paracetamol con 50 episodios (e50) y ventanas de 20.000 pasos (20K). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es acotada y muy específica: se trata de un checkpoint de investigación con 38 descargas y 0 likes, útil como referencia para reproducir o adaptar un pipeline ACT en LeRobot, o como punto de partida para experimentos de imitación en robots tipo SO-100. No debe confundirse con un modelo fundacional de robótica generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.678.855 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; procesa observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visomotor, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | KyraLeeChunWei/ParacetamolRecovery_e50 |
| Tamano del repo | 0,4 GB |
| Descargas / likes | 38 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un codificador visual (típicamente ResNet) y un decodificador que genera chunks de acciones de longitud fija. La innovación central del artículo original es predecir secuencias cortas de acciones en lugar de una sola acción por paso, lo que reduce el error de composición acumulado y estabiliza el control. El modelo usa además una técnica de condicionamiento con query tokens y una pérdida de reconstrucción sobre el chunk completo.

En este checkpoint concreto no se dispone de detalles sobre la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de aumento de datos o regularización específicas. El nombre del repositorio indica 50 episodios de entrenamiento y 20.000 pasos, pero no se confirma en la información disponible. No hay evidencia de RLHF, DPO ni ajuste por refuerzo; es puramente aprendizaje supervisado por imitación sobre demostraciones teleoperadas.

## Capacidades

- Control visomotor para manipulación robótica: predice chunks de acciones a partir de observaciones de cámara y estado del robot.
- Aprendizaje por imitación: reproduce comportamientos demostrados en teleoperación.
- Predicción de acciones en bloque (action chunking), lo que mejora la estabilidad frente a políticas paso a paso.
- Integración nativa con LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatible con robots tipo SO-100 (SO100 follower) según los comandos de la model card.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la percepción visual para control.

## Casos de uso

- Reproducción de experimentos ACT en LeRobot: sirve como checkpoint de referencia para validar un pipeline de entrenamiento con `lerobot-train` y comparar curvas de pérdida frente a políticas propias.
- Manipulación de objetos en laboratorio: el modelo puede ejecutar la tarea de recuperación de paracetamol sobre un robot SO-100, útil para pruebas de pick-and-place en entornos controlados.
- Base para fine-tuning en tareas similares: al ser un checkpoint ACT de 51,7 M de parámetros, se puede reentrenar con un dataset propio de pocas decenas de episodios para adaptarlo a otra tarea de manipulación.
- Evaluación de infraestructura de robótica: permite probar la integración de LeRobot con hardware SO-100 y medir latencia de inferencia en un entorno real.
- Docencia y formación: ejemplo práctico de aprendizaje por imitación con action chunking para cursos de robótica o aprendizaje automático aplicado.
- Benchmark interno de políticas: punto de comparación frente a otras políticas ACT o Diffusion Policy en la misma tarea, siempre que se disponga del dataset original.
- Prototipado de control visomotor de bajo coste: con 0,4 GB de pesos, cabe en GPUs de consumo y permite iterar rápidamente en un banco de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones con otras políticas. El artículo original de ACT (arXiv 2304.13705) reporta resultados en tareas de simulación y reales, pero no se dispone de los números específicos de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros en safetensors, repo de 0,4 GB); en la práctica, el cuello de botella es el codificador visual y el preprocesado de imágenes, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha validado el flujo con `--policy.device=cuda`, por lo que se recomienda una GPU NVIDIA (RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante, RTX 20/30/40, etc.).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. Dependen del robot, la frecuencia de control y el hardware; el action chunking reduce el número de inferencias necesarias por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ParacetamolRecovery_e50_20K_ACT | 51,7 M | observaciones por paso, chunks de acción | ACT (imitación) | apache-2.0 | Hugging Face, 38 descargas |
| KyraLeeChunWei/Paracetamol_e50_20K_ACT | no disponible | no disponible | ACT (imitación) | apache-2.0 | Hugging Face |
| Diffusion Policy (referencia del artículo) | no disponible | no disponible | difusión para acciones | no disponible | repositorio de investigación |
| Otras políticas LeRobot (p. ej. TDMPC, VQ-BeT) | variable | variable | imitación / RL | variable | Hugging Face, LeRobot |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. El modelo hermano `Paracetamol_e50_20K_ACT` del mismo autor parece ser una variante de la misma tarea sin el sufijo "Recovery", pero no se detallan diferencias.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado para una única tarea (recuperación de paracetamol) y un robot concreto (SO-100); no generaliza a otras tareas ni morfologías sin reentrenamiento.
- Sin datos de rendimiento: no hay tasas de éxito publicadas, por lo que no se puede evaluar su fiabilidad en producción.
- Riesgo de sobreajuste al dataset de demostración: con solo 50 episodios (según el nombre), la política puede fallar ante variaciones de iluminación, posición de objetos o condiciones no vistas.
- Sin información sobre sesgos: al no ser un modelo lingüístico, no aplican sesgos de lenguaje, pero sí posibles sesgos de demostración (posiciones, velocidades, trayectorias del teleoperador).
- Riesgo de alucinación en el sentido de acciones no válidas: como toda política de imitación, puede generar acciones fuera de distribución si la observación se aleja del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Sin soporte multilingüe ni de texto: no es adecuado para tareas de NLP, atención al cliente ni generación de código.
- Repositorio con muy poca tracción (38 descargas, 0 likes): no hay comunidad ni issues documentados que ayuden a resolver problemas de integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KyraLeeChunWei/ParacetamolRecovery_e50_20K_ACT
- Modelo hermano: https://huggingface.co/KyraLeeChunWei/Paracetamol_e50_20K_ACT
- Artículo ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/KyraLeeChunWei/ParacetamolRecovery_e50
