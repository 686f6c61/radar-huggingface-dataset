# Faless/harvest_apples_smolvla_v2_base_bs96_ee_7ep

## Resumen

SmolVLA es un modelo vision-lenguaje-acción (VLA) compacto desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de instrucciones en lenguaje natural y observaciones visuales. Este repositorio concreto, `Faless/harvest_apples_smolvla_v2_base_bs96_ee_7ep`, es un fine-tuning de `lerobot/smolvla_base` sobre el dataset `Faless/harvest_apples_with_agilex_piper_sim_ee`, orientado a la tarea específica de recogida de manzanas con un brazo Agilex Piper en simulación, controlando el efector final (end-effector).

El modelo parte de la arquitectura SmolVLA publicada en el paper arXiv:2506.01844, que propone un VLA eficiente capaz de ejecutarse en hardware de consumo manteniendo un rendimiento competitivo frente a modelos VLA de mayor tamaño. Con aproximadamente 450 millones de parámetros, se sitúa en la franja de modelos ligeros, lo que facilita su despliegue en estaciones de trabajo con GPU consumer y su integración en bucles de control robótico de baja latencia.

La relevancia de esta ficha radica en que ilustra el flujo típico de especialización de un VLA genérico mediante fine-tuning con LeRobot: un modelo base entrenado con datos diversos se adapta a una tarea concreta (pick de manzanas) mediante un dataset propio. Es un ejemplo representativo de cómo la robótica open source está adoptando el paradigma de los modelos fundacionales ajustables, con licencia Apache 2.0 y pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, una arquitectura vision-lenguaje-acción presentada en el paper arXiv:2506.01844, cuyo objetivo es lograr un rendimiento competitivo en control robótico con un coste computacional reducido y despliegue viable en hardware de consumo. La información disponible no detalla la composición interna del backbone visual, el codificador de lenguaje ni el cabezal de acciones, por lo que no se pueden confirmar aspectos como el tipo de atención, el número de capas o la estrategia de fusión multimodal.

Este checkpoint concreto es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `Faless/harvest_apples_with_agilex_piper_sim_ee`, que contiene episodios de recogida de manzanas con un brazo Agilex Piper en simulación, con control a nivel de efector final (sufijo `ee`). El nombre del repositorio indica un entrenamiento con batch size 96 durante 7 épocas (`bs96_ee_7ep`). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; en el contexto VLA, el entrenamiento típico es de imitación supervisada sobre demostraciones.

## Capacidades

- Control robótico de manipulación a partir de observaciones visuales e instrucciones en lenguaje natural, en el dominio específico de recogida de manzanas.
- Predicción de acciones de efector final (end-effector) para un brazo Agilex Piper en entorno simulado.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios.
- Ejecución de políticas de imitación entrenadas sobre demostraciones (behavior cloning).
- Despliegue en hardware de consumo según las características del modelo base SmolVLA.
- No se dispone de información sobre soporte de tool calling, capacidades de agente multi-paso, multilingüismo o modos especiales como thinking; estas capacidades no están documentadas para este checkpoint.

## Casos de uso

- Automatización de recogida de fruta en simulación: el modelo genera acciones de efector final para que un brazo Agilex Piper agarre manzanas en un entorno simulado, sirviendo como base para pipelines de recolección agrícola antes de transferir a hardware real.
- Generación de datos sintéticos de manipulación: al ejecutarse en simulación, puede producir trayectorias y episodios adicionales que alimenten el entrenamiento de políticas más robustas o de modelos de mayor tamaño.
- Evaluación de algoritmos de imitación: permite comparar variantes de fine-tuning (distintos batch sizes, épocas o representaciones de acción) sobre una tarea estandarizada de pick de objetos.
- Prototipado rápido de políticas robóticas: con LeRobot, un equipo puede partir de este checkpoint, evaluar con `lerobot-record` y desplegar sobre el mismo tipo de robot sin entrenar desde cero.
- Benchmarking de VLA ligeros: al tener 450 M de parámetros, es un candidato para medir latencia y throughput en GPUs consumer frente a VLA de mayor tamaño en tareas de manipulación.
- Educación y formación en robótica: sirve como ejemplo didáctico de fine-tuning de un modelo fundacional VLA con un dataset propio y licencia permisiva.
- Investigación en transferencia sim-a-real: el checkpoint entrenado en simulación puede emplearse como punto de partida para ajuste con datos reales del mismo brazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros, en precisión completa (fp32) los pesos ocupan aproximadamente 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, a lo que hay que sumar el coste de las activaciones y del codificador visual.
- GPU recomendadas: no disponibles en la información proporcionada; el paper de SmolVLA indica despliegue en hardware de consumo, pero no se detallan modelos concretos.
- Compatibilidad con GPU consumer: probable según la naturaleza compacta del modelo base, aunque no se confirma en la documentación de este checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), según la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Faless/harvest_apples_smolvla_v2_base_bs96_ee_7ep | 450 M | no disponible | Manipulación (pick de manzanas, sim) | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no disponible | VLA generalista | no disponible en la informacion proporcionada | Hugging Face |
| Otros VLA comparables (p. ej. OpenVLA, RT-2) | no disponible en la informacion proporcionada | no disponible | Manipulación general | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; solo se confirma que este checkpoint deriva de `lerobot/smolvla_base` y que el paper de referencia es arXiv:2506.01844.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (recogida de manzanas) y un único robot (Agilex Piper) en simulación; su generalización a otras tareas, objetos o brazos no está documentada.
- Al ser un fine-tuning sobre simulación, existe riesgo de brecha sim-a-real (sim-to-real gap) si se despliega directamente en hardware físico.
- No se dispone de información sobre sesgos del dataset de entrenamiento, composición demográfica de las demostraciones ni posibles artefactos presentes en los datos.
- Riesgo de alucinación en el sentido de generar acciones no válidas o inseguras fuera de la distribución de entrenamiento; en robótica esto puede traducirse en colisiones o agarres fallidos.
- No se documentan limitaciones de contexto o idioma para este checkpoint.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción; se recomienda validación exhaustiva antes de desplegar en entornos reales.
- El número de descargas (8) y likes (1) indica una adopción muy baja, por lo que no hay evidencia comunitaria de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Faless/harvest_apples_smolvla_v2_base_bs96_ee_7ep
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/harvest_apples_with_agilex_piper_sim_ee
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
