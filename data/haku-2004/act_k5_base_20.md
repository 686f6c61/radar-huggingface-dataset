# Haku-2004/act_k5_base_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. El modelo `act_k5_base_20`, publicado por el usuario Haku-2004 en Hugging Face, es una política entrenada con la librería LeRobot de Hugging Face sobre el dataset `Haku-2004/k5_20261110_143202`, presumiblemente compuesto por demostraciones de teleoperación. El repositorio tiene un tamaño de 0,2 GB y 51.668.614 parámetros en formato safetensors, lo que lo sitúa en la categoría de políticas ligeras aptas para control en tiempo real.

El modelo se distribuye con licencia Apache 2.0 y pipeline `robotics`, lo que permite su uso comercial y su integración en stacks de robótica sin restricciones adicionales. Al estar construido sobre LeRobot, se beneficia del ecosistema de herramientas de entrenamiento, evaluación y despliegue de Hugging Face, incluyendo compatibilidad con robots como el SO-100 follower.

La relevancia de este modelo es doble: por un lado, demuestra el flujo completo de entrenamiento y publicación de políticas robóticas con LeRobot; por otro, ACT es una referencia consolidada en manipulación robótica por imitación, con resultados competitivos en tareas de precisión. No obstante, la información pública disponible es mínima: no se detallan composición del dataset, número de episodios, tareas concretas ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | Haku-2004/k5_20261110_143202 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice chunks de acciones (secuencias cortas de comandos motores) en lugar de una acción por paso. La arquitectura combina un codificador visual (habitualmente ResNet) que procesa las observaciones de cámara con un transformer que modela la secuencia de estados y acciones, y un decodificador que genera el chunk de acciones. Esta formulación reduce el error de compounding y mejora la estabilidad en tareas de manipulación de precisión.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k5_20261110_143202`, que presumiblemente contiene episodios de teleoperación. No se dispone de información sobre el número de episodios, la tarea concreta, la composición del dataset, el número de tokens o pasos de entrenamiento, ni sobre si se aplicaron técnicas de aumento de datos o regularización específicas. El modelo sigue el paper original de ACT (arXiv:2304.13705) y se distribuye como checkpoint listo para inferencia con `lerobot-record`.

## Capacidades

- Predicción de chunks de acciones para control robótico de manipulación.
- Aprendizaje por imitación a partir de demostraciones de teleoperación.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Compatibilidad con robots tipo SO-100 follower (según el ejemplo de la model card).
- Inferencia en tiempo real sobre GPU (CUDA) mediante `lerobot-record`.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.
- No dispone de visión generativa ni comprensión semántica de imágenes más allá del codificador visual para control.

## Casos de uso

- Manipulación robótica de precisión: el modelo predice chunks de acciones que permiten ejecutar tareas de pick-and-place o ensamblaje con mayor estabilidad que políticas paso a paso, gracias a la reducción del error acumulado.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, datasets o técnicas de aumento de datos, al estar integrado en LeRobot.
- Prototipado rápido de políticas robóticas: con `lerobot-train` se puede reentrenar sobre un dataset propio y desplegar con `lerobot-record` en pocas horas, lo que acelera la iteración en laboratorio.
- Educación y formación: el modelo y su flujo de entrenamiento son adecuados para cursos de robótica y aprendizaje automático, dado su tamaño reducido (0,2 GB) y su licencia permisiva.
- Despliegue en robots de bajo coste: con 51,7 M de parámetros, la inferencia cabe en GPUs de consumo, lo que facilita su uso en plataformas tipo SO-100 o similares.
- Evaluación comparativa de políticas: al ser un checkpoint ACT estándar, puede usarse como referencia en benchmarks internos de manipulación frente a otras políticas (diffusion policy, VQ-BeT, etc.).
- Automatización de tareas repetitivas en entornos controlados: tareas de laboratorio o líneas de montaje donde las condiciones son estables y el dataset de teleoperación cubre la variabilidad relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en FP32 para los 51,7 M de parámetros, más el coste del codificador visual y los buffers de inferencia; en la práctica, menos de 4 GB.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con soporte CUDA.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de inferencia en CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerá del hardware, la frecuencia de control del robot y el tamaño del chunk de acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k5_base_20 (este modelo) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no disponible | no aplica | resultados en paper | no disponible | paper |
| Diffusion Policy | no disponible | no aplica | no disponible | no disponible | no disponible |
| VQ-BeT | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre este checkpoint y otras políticas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset concreto de teleoperación, la política hereda los sesgos de las demostraciones (condiciones de iluminación, posiciones de objetos, estilo de teleoperación).
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erráticas fuera de la distribución del dataset de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; es una política robótica, no un modelo de lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con atribución y aviso de cambios.
- Caveat para producción: no se han publicado métricas de éxito, número de episodios ni condiciones de evaluación; antes de desplegar en producción es imprescindible validar la política en el robot objetivo y en el entorno real.
- El modelo depende del codificador visual y de la configuración exacta de observaciones (cámaras, resolución, frecuencia); cambios en el hardware pueden degradar el rendimiento.
- No se documentan requisitos de seguridad ni protocolos de parada de emergencia; el despliegue en robots físicos requiere medidas de seguridad adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5_base_20
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_20261110_143202
