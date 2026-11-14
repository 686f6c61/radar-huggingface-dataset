# Muhammad241198/act_dsub_30

## Resumen

`act_dsub_30` es una política de imitación basada en Action Chunking with Transformers (ACT), un método presentado en el artículo arXiv 2304.13705 que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de robótica de Hugging Face, por el usuario Muhammad241198, y está orientado a control robótico a partir de datos de teleoperación.

Con 51.613.319 parámetros y un tamaño de repositorio de 0,2 GB, se trata de un modelo compacto de robótica, no de un modelo de lenguaje: su pipeline es `robotics` y su propósito es generar comandos motores para un robot seguidor (el ejemplo de la model card emplea `so100_follower`). No dispone de capacidades de generación de texto, visión general ni razonamiento lingüístico.

Es relevante por su carácter práctico: ilustra el flujo completo de entrenamiento y evaluación de políticas de imitación con LeRobot, desde el dataset de teleoperación `rbtrprjkt/DSUB-installnew2026_20261026_033023` hasta la inferencia con `lerobot-record`. Su licencia Apache 2.0 facilita la reutilización, aunque su valor está acotado al entorno robótico concreto para el que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer para imitación |
| Parámetros totales | 51.613.319 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual y un transformer que predice chunks de acciones de horizonte fijo, en lugar de una acción por paso. Este enfoque reduce el error de acumulación típico de las políticas paso a paso y suele alcanzar tasas de éxito elevadas con datos de teleoperación. El modelo se entrenó con LeRobot sobre el dataset `rbtrprjkt/DSUB-installnew2026_20261026_033023`, que no está descrito en detalle en la información disponible.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en políticas de imitación robótica). Tampoco se detallan innovaciones adicionales más allá del propio mecanismo de action chunking descrito en el paper.

## Capacidades

- Predicción de chunks de acciones para control robótico de imitación.
- Aprendizaje a partir de datos de teleoperación (demonstraciones).
- Ejecución de políticas en robots seguidores tipo `so100_follower` mediante `lerobot-record`.
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Sin capacidades multilingües ni de generación de texto.
- Sin modo thinking, visión general, audio ni otras capacidades multimodales fuera del pipeline robótico.

## Casos de uso

- Manipulación robótica de precisión: la política predice chunks de acciones que permiten al robot ejecutar secuencias de movimiento continuas a partir de demostraciones, reduciendo el error acumulado frente a políticas paso a paso.
- Automatización de tareas de instalación: el nombre del dataset (`DSUB-installnew2026`) sugiere tareas de instalación o montaje; el modelo puede replicar esas secuencias en un robot seguidor entrenado con las mismas características.
- Evaluación de pipelines de imitación: sirve como checkpoint de referencia para validar el flujo `lerobot-train` → `lerobot-record` con 10 episodios de evaluación, tal como indica la model card.
- Prototipado rápido en robótica de bajo coste: con 51,6 M de parámetros y 0,2 GB de pesos, es viable entrenar y desplegar en estaciones con GPU de consumo.
- Investigación en aprendizaje por imitación: permite reproducir experimentos de ACT sobre datasets propios y comparar tasas de éxito.
- Formación y docencia: ejemplo completo y ligero de política LeRobot para enseñar el ciclo de vida de un modelo robótico (dataset, entrenamiento, evaluación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,6 M de parámetros y pesos en safetensors de 0,2 GB, la huella es reducida y cabe holgadamente en GPU de consumo.
- GPU recomendadas: no especificadas; el comando de entrenamiento de la model card usa `--policy.device=cuda`, sin modelo concreto.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento, `lerobot-record` para inferencia/evaluación). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `act_dsub_30` | 51.613.319 | no disponible | no disponible | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Otras políticas ACT en LeRobot | no disponible | no disponible | no disponible | variable | Hugging Face |
| Políticas de imitación alternativas (p. ej. Diffusion Policy) | no disponible | no disponible | no disponible | variable | Hugging Face / repos académicos |

No se dispone de datos comparativos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de robótica: no es un LLM ni un modelo multimodal general; no debe evaluarse con benchmarks de lenguaje.
- Entrenado sobre un dataset concreto (`DSUB-installnew2026_20261026_033023`); su generalización a otras tareas, robots o entornos no está documentada.
- Sin datos publicados de benchmarks, tasas de éxito ni métricas de evaluación.
- Riesgo de sobreajuste al entorno de teleoperación y a la morfología del robot empleado.
- Sin información sobre sesgos, aunque en robótica los sesgos se manifiestan como fallos sistemáticos ante distribuciones de datos no vistas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset subyacente limita la evaluación de riesgos en producción.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- No apto para despliegue en producción sin evaluación previa en el robot y entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muhammad241198/act_dsub_30
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/rbtrprjkt/DSUB-installnew2026_20261026_033023
