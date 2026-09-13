# ImKyungjin/pi0-office-mixed-noise-10pct-40ep-baseline

## Resumen

Este repositorio contiene un checkpoint de política robótica basado en π₀ (pi0), el modelo visión-lenguaje-acción (VLA) para control general de robots desarrollado por Physical Intelligence. El checkpoint lo publica el usuario ImKyungjin con la librería LeRobot, cuya implementación de pi0 está adaptada del repositorio OpenPI del propio equipo de Physical Intelligence. No es un modelo de lenguaje conversacional: su salida son acciones de robot condicionadas por observaciones visuales e instrucciones en lenguaje natural.

El nombre del repositorio indica el experimento: un ajuste sobre un conjunto de tareas de oficina, con mezcla de datos subóptimos etiquetada al 10 % y 40 épocas de entrenamiento, marcado explícitamente como "baseline". Los pesos suman 3.501.372.176 parámetros en formato safetensors y el repositorio ocupa 7,0 GB. La licencia declarada es Apache-2.0 y la etiqueta de pipeline es robotics.

Su interés es de investigación: sirve como línea base reproducible para estudiar cómo afecta la proporción de demostraciones subóptimas al rendimiento de una política VLA en tareas de manipulación. No se han publicado métricas de éxito ni comparaciones con otros checkpoints, y el repositorio acumula 0 descargas y 0 "likes", por lo que no cuenta con validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) basada en π₀ (pi0) de Physical Intelligence; implementación de LeRobot adaptada de OpenPI |
| Parámetros totales | 3.501.372.176 (según los pesos safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | Política robótica entrenada por imitación (no es un LLM causal) |
| Librería | lerobot |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | taewonkoo/office_task_mixed_suboptimal_seed1000_10pct_40ep |
| Tamaño del repositorio | 7,0 GB |
| Autor | ImKyungjin |
| Fecha de creación / actualización | 13 de septiembre de 2026 / 13 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

π₀ es un modelo visión-lenguaje-acción: combina un codificador visual, un componente de lenguaje que interpreta la instrucción y un módulo generador de acciones que produce secuencias motrices continuas. La model card de este repositorio describe π₀ como "el primer modelo fundacional de propósito general para robots" y remite al blog de Physical Intelligence para más detalles; la implementación empleada aquí es la de LeRobot, adaptada de OpenPI. La ficha no especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO.

Por el nombre del checkpoint se deduce un entrenamiento por imitación supervisada sobre episodios de tareas de oficina, con una mezcla de datos subóptimos al 10 % (semilla 1000) durante 40 épocas, concebido como referencia base para comparaciones. No se publican curvas de pérdida, tasas de éxito ni detalles del optimizador.

Advertencia técnica relevante: la model card es una plantilla genérica. Los comandos de ejemplo que incluye usan `--policy.type=act` (la política ACT), no pi0, por lo que no son reproducibles tal cual para este checkpoint y deben sustituirse por la configuración correspondiente a pi0 en LeRobot.

## Capacidades

- Control robótico por imitación: transforma observaciones visuales e instrucciones en lenguaje natural en acciones continuas para el robot.
- Interpretación de instrucciones en lenguaje natural gracias al componente de visión-lenguaje heredado de π₀.
- Ejecución de tareas de manipulación del dominio del dataset de entrenamiento (tareas de oficina, con presencia de demostraciones subóptimas al 10 %).
- Integración nativa con el ecosistema LeRobot para entrenamiento, guardado de checkpoints y evaluación en robot real.
- No es un modelo de generación de texto ni de conversación: no se documentan capacidades de chat, resumen o redacción.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponible (no se especifica el conjunto de idiomas de las instrucciones).
- No se documentan capacidades de audio, vídeo ni modo de razonamiento explícito ("thinking mode").

## Casos de uso

- Línea base para ablaciones sobre calidad de datos: comparar este checkpoint (10 % de datos subóptimos) con variantes entrenadas con otras proporciones permite cuantificar el impacto del ruido en las demostraciones sobre la tasa de éxito.
- Manipulación en entornos de oficina: la política está entrenada específicamente sobre el dataset `office_task_mixed_suboptimal_seed1000_10pct_40ep`, por lo que es directamente aplicable a las tareas de ese dominio con la misma configuración de robot y cámara.
- Evaluación en robot real: mediante `lerobot-record` con un seguidor tipo `so100_follower` y `--policy.path` apuntando a este checkpoint, se pueden grabar episodios de evaluación y medir la tasa de éxito de forma estandarizada.
- Punto de partida para ajuste fino con datos propios: al ser un checkpoint de 3,5 mil millones de parámetros con licencia Apache-2.0, es viable reentrenarlo total o parcialmente con un dataset propio de manipulación.
- Estudio de robustez a demostraciones subóptimas: útil en investigación sobre aprendizaje por imitación con datos imperfectos, teleoperación ruidosa o políticas humanas heterogéneas.
- Reproducción y docencia en robótica: sirve como ejemplo completo de un pipeline LeRobot de entrenamiento, guardado en el Hub e inferencia sobre hardware real.
- Integración en pipelines de investigación VLA: como componente de comparación frente a otras políticas (ACT, SmolVLA, π₀ base) dentro de un mismo entorno de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, números de episodios de evaluación ni comparaciones con otros checkpoints, y la información de HuggingFace no aporta métricas adicionales.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 7,0 GB solo para los pesos (coincide con el tamaño del repositorio); con activaciones del codificador visual y del módulo de acciones, conviene reservar 10-12 GB.
- VRAM para inferencia en fp32: aproximadamente 14 GB solo para los pesos.
- GPU recomendadas (entrenamiento): A100 de 40/80 GB o H100; el ajuste fino completo de 3,5 mil millones de parámetros no cabe con comodidad en una GPU de consumo.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16 con lote pequeño; en RTX 4080 (16 GB) el margen es reducido; en tarjetas de 12 GB o menos es previsible que no quepa en bf16 sin cuantización adicional, que no está documentada.
- Opciones de despliegue: el ecosistema previsto es LeRobot (`lerobot-train` para entrenamiento, `lerobot-record` para evaluación e inferencia sobre robot). No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, dado que no es un modelo de lenguaje causal.
- Latencia y throughput: no disponible. En π₀ la generación de acciones se realiza por muestreo iterativo (flow matching), lo que añade coste por paso de control, pero no se publican mediciones para este checkpoint.

## Comparativa con modelos similares

Los datos de la información proporcionada corresponden únicamente a este checkpoint. La siguiente tabla incluye alternativas de la misma categoría, con los valores marcados como referencia pública no verificada en esta ficha:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi0-office-mixed-noise-10pct-40ep-baseline (este checkpoint) | 3.501.372.176 | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| π₀ base (Physical Intelligence / OpenPI) | ~3,3 mil millones (referencia pública, no verificada aquí) | no disponible | no disponible en esta ficha (el repositorio OpenPI se publica bajo Apache-2.0) | Repositorio OpenPI de Physical Intelligence |
| SmolVLA (HuggingFace) | ~450 millones (referencia pública, no verificada aquí) | no disponible | no verificado en esta ficha | HuggingFace / LeRobot |
| ACT (política de imitación usada como referencia en LeRobot) | no disponible | no disponible | no disponible | HuggingFace / LeRobot |

No se dispone de comparaciones de rendimiento entre estos modelos dentro de la información proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: la política está entrenada sobre un único dataset de tareas de oficina; no hay evidencia de generalización a otros robots, cámaras, entornos o tareas.
- Datos de entrenamiento con un 10 % de demostraciones subóptimas: el propio nombre del checkpoint lo identifica como línea base, no como resultado optimizado.
- Ausencia total de métricas: sin tasas de éxito, sin evaluación publicada y sin comparaciones verificables.
- Riesgo de sobreajuste a la morfología y a la disposición de sensores del robot empleado en la recolección de datos, que no se documenta en la ficha.
- Riesgo de alucinación en sentido VLA: el modelo puede generar trayectorias plausibles pero incorrectas ante situaciones fuera de distribución, sin mecanismo de abstención documentado.
- Idiomas soportados: no disponible; el rendimiento ante instrucciones en castellano no está documentado.
- La model card es una plantilla genérica con comandos de ejemplo para la política ACT, por lo que no debe usarse como guía de reproducción directa.
- Licencia: el repositorio declara apache-2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base π₀ y del dataset de entrenamiento antes de un despliegue en producción.
- Sin validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta.
- Entrenamiento no reproducible con la información publicada: no se detallan hiperparámetros, composición del dataset ni receta de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ImKyungjin/pi0-office-mixed-noise-10pct-40ep-baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/taewonkoo/office_task_mixed_suboptimal_seed1000_10pct_40ep
- Blog de π₀ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: la búsqueda web realizada no devolvió resultados relevantes para este modelo; los enlaces anteriores proceden de la model card y de la información de HuggingFace.
