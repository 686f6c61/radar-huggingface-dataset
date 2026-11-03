# Lyrasilas/test

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de instrucciones en lenguaje natural e imágenes de cámara. Este repositorio concreto, `Lyrasilas/test`, es un ajuste fino de `lerobot/smolvla_base` sobre el dataset `Lyrasilas/carracing-synth-ep20_seednone_default_car`, orientado a una tarea específica de conducción (car racing) en un entorno sintético. Con 451,6 millones de parámetros y un tamaño de repositorio de 0,9 GB, se posiciona como una política ligera que puede ejecutarse en hardware de consumo.

El modelo resuelve el problema de mapear observaciones visuales y comandos textuales a acciones motoras de bajo nivel, siguiendo el paradigma de las políticas VLA que combinan un codificador visual, un modelo de lenguaje y un cabezal de acciones. Su relevancia radica en que demuestra que es posible entrenar políticas robóticas competitivas con presupuestos computacionales reducidos, algo clave para investigación y prototipado rápido en robótica.

La ficha se basa exclusivamente en los metadatos del repositorio, la model card y los tags públicos; no se dispone de información detallada sobre el dataset de entrenamiento, hiperparámetros o resultados de evaluación más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 451.650.419 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que integra un codificador visual, un modelo de lenguaje de pequeño tamaño y un cabezal de predicción de acciones, siguiendo el diseño descrito en el paper arXiv:2506.01844. El objetivo es reducir el coste computacional frente a VLA de mayor tamaño manteniendo un rendimiento competitivo en tareas de manipulación y control. El modelo base `lerobot/smolvla_base` se ha ajustado mediante aprendizaje por imitación supervisado sobre el dataset `Lyrasilas/carracing-synth-ep20_seednone_default_car`, que contiene episodios sintéticos de conducción.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas de este ajuste fino. La model card únicamente documenta el flujo de entrenamiento y evaluación mediante LeRobot, sin detallar hiperparámetros ni estrategias de aumento de datos.

## Capacidades

- Control robótico visuomotor: genera acciones motoras a partir de observaciones visuales y comandos de lenguaje.
- Aprendizaje por imitación: entrenado para reproducir trayectorias demostradas en el dataset de conducción sintética.
- Integración con LeRobot: compatible con los scripts de entrenamiento (`lerobot.scripts.train`) y evaluación (`lerobot.record`).
- Despliegue en hardware de consumo: gracias a su tamaño reducido (451,6 M de parámetros).
- Soporte de evaluación episódica: permite registrar episodios de evaluación con el robot `so100_follower`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento matemático general ni procesamiento de audio.

## Casos de uso

- Investigación en conducción autónoma sintética: el modelo puede evaluarse en entornos simulados de car racing para estudiar políticas VLA de bajo coste antes de transferirlas a plataformas reales.
- Prototipado rápido de políticas robóticas: gracias a su tamaño y a la integración con LeRobot, permite iterar sobre datasets pequeños y validar arquitecturas VLA en horas en lugar de días.
- Benchmarking de ajuste fino de SmolVLA: sirve como referencia para comparar el efecto de distintos datasets sintéticos sobre el rendimiento de la política base.
- Educación y docencia en robótica: su reducido tamaño y licencia Apache 2.0 lo hacen adecuado para cursos y talleres donde se enseña aprendizaje por imitación.
- Evaluación de robustez visual: al entrenarse sobre imágenes sintéticas, permite estudiar la brecha sim-to-real en tareas de conducción.
- Despliegue en robots de bajo coste: puede ejecutarse en plataformas con GPUs de consumo, facilitando pruebas en laboratorios con presupuesto limitado.
- Generación de datos de evaluación: el pipeline `lerobot.record` permite grabar episodios etiquetados para analizar el comportamiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 451,6 M de parámetros en FP16 se estiman aproximadamente 0,9 GB solo para pesos, más overhead de activaciones y codificador visual.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en consumer GPU: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM, aunque no se confirma oficialmente.
- Opciones de despliegue: LeRobot (scripts `lerobot.record` y `lerobot.scripts.train`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a políticas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lyrasilas/test (SmolVLA fine-tune) | 451,6 M | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Hugging Face |
| Otros VLA de gran tamaño (p. ej. RT-2, OpenVLA) | no disponible en la información proporcionada | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa de rendimiento con alternativas.

## Limitaciones y advertencias

- Entrenado sobre un dataset sintético específico de car racing: es probable que generalice mal fuera de ese dominio visual y de tarea.
- No se documentan evaluaciones formales ni métricas de éxito, por lo que el rendimiento real es desconocido.
- Riesgo de sobreajuste al dataset de 20 episodios (`ep20`), lo que puede limitar la robustez.
- Sesgos: no documentados; al ser un modelo de robótica, los sesgos relevantes serían los del dataset de demostración.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí puede generar acciones incorrectas o inseguras fuera de distribución.
- Idiomas soportados: no disponibles; la model card no especifica capacidades multilingües.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El modelo es un artefacto de investigación con 0 descargas y 0 likes; no debe usarse en producción sin validación exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/Lyrasilas/test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Lyrasilas/carracing-synth-ep20_seednone_default_car
