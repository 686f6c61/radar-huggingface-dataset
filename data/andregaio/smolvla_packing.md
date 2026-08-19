# AndreGaio/smolvla_packing

## Resumen

AndreGaio/smolvla_packing es un modelo de robótica de tipo vision-language-action (VLA) que constituye un fine-tune del modelo base SmolVLA, desarrollado por Hugging Face, sobre un conjunto de datos de demostración para la tarea de empacar borradores en un contenedor. El modelo base SmolVLA, descrito en el artículo arXiv 2506.01844, es un VLA compacto de 450 millones de parámetros diseñado para ejecutarse en hardware de consumo, combinando un modelo de lenguaje y visión preentrenado con un experto de acciones entrenado mediante flow matching.

Este fine-tune concreto, creado por AndreGaio y entrenado con la librería LeRobot, adapta el SmolVLA base a una tarea de manipulación específica: "Load erasers into container" (cargar borradores en un contenedor). El modelo consume el estado del robot y tres imágenes de cámaras (256x256 píxeles) y produce un vector de acciones de 6 dimensiones. Con solo 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, es un ejemplo representativo de cómo los modelos VLA pueden especializarse en tareas concretas con recursos computacionales modestos.

La relevancia de este modelo radica en su demostración práctica del flujo de trabajo de fine-tuning de SmolVLA para tareas robóticas personalizadas, utilizando el ecosistema LeRobot. Aunque el conjunto de entrenamiento es muy pequeño (5 episodios, 14.234 fotogramas), sirve como referencia para investigadores y desarrolladores que deseen entrenar sus propios policies robóticos con este enfoque.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA: VLM compacto preentrenado + experto de acciones con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA, el modelo base, combina un modelo de lenguaje y visión (VLM) preentrenado a gran escala con un experto de acciones entrenado mediante flow matching. Dadas múltiples imágenes y una instrucción en lenguaje natural, el modelo genera un bloque de acciones (action chunk) para el robot. Esta arquitectura permite aprovechar el conocimiento visual y lingüístico del VLM para la percepción y el control, manteniendo un tamaño reducido de 450M parámetros.

El fine-tune AndreGaio/smolvla_packing se entrenó a partir del checkpoint lerobot/smolvla_base usando el framework LeRobot (versión 0.6.2). El conjunto de datos de entrenamiento, AndreGaio/test-packing_20260816_160939, contiene 5 episodios con 14.234 fotogramas a 30 FPS, capturados con un robot tipo so_follower y dos cámaras (frontal y superior). La configuración de entrenamiento incluyó 20.000 pasos, batch size de 64, optimizador AdamW, tasa de aprendizaje de 0,0001 y semilla 1000. No se menciona el uso de técnicas de RLHF o DPO; el entrenamiento se basa en aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de 6 grados de libertad (acciones de posición/orientación) a partir de observaciones multimodales (estado del robot + tres imágenes de cámaras).
- Comprensión de instrucciones en lenguaje natural para guiar la tarea de empacado (en este caso, "Load erasers into container").
- Generación de secuencias de acciones (action chunks) mediante flow matching, permitiendo movimientos suaves y coordinados.
- Entrenamiento específico para manipulación de objetos pequeños (borradores) en un entorno de contenedor.
- Compatibilidad con el ecosistema LeRobot para despliegue en robots físicos tipo SO-100 (so_follower).
- Capacidad de fine-tuning adicional sobre el modelo base para adaptarse a otras tareas de manipulación.

## Casos de uso

- Automatización de empaquetado en líneas de producción: el modelo puede controlar un robot para recoger y colocar objetos pequeños en contenedores, reduciendo la intervención humana en tareas repetitivas de montaje.
- Investigación en aprendizaje por imitación: sirve como ejemplo de referencia para estudiar cómo un VLA compacto se especializa en una tarea concreta a partir de pocas demostraciones.
- Desarrollo de habilidades de manipulación en robots educativos: el modelo puede ejecutarse en plataformas asequibles como el robot SO-100, facilitando la enseñanza de robótica y control basado en visión-lenguaje-acción.
- Benchmarking de políticas robóticas: permite comparar el rendimiento de SmolVLA fine-tuneado frente a otros enfoques en tareas de manipulación estandarizadas.
- Prototipado rápido de nuevas tareas: los desarrolladores pueden usar este modelo como punto de partida para entrenar policies en tareas similares (por ejemplo, empacar otros objetos) mediante fine-tuning adicional.
- Validación de pipelines de entrenamiento con LeRobot: el modelo demuestra el flujo completo de grabación de datos, entrenamiento y despliegue, útil para equipos que adoptan esta herramienta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "No evaluation results have been provided for this policy yet", por lo que no hay datos de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M parámetros, el modelo en precisión fp32 ocuparía aproximadamente 1,8 GB de VRAM; en fp16, alrededor de 0,9 GB. Sin embargo, el VLM base puede requerir memoria adicional para el procesamiento de imágenes, por lo que se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente, como NVIDIA GTX 1650, RTX 3050, RTX 3060, etc. No se requieren GPUs de datacenter.
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos principales de SmolVLA.
- Opciones de despliegue: el modelo se integra con LeRobot, que utiliza PyTorch. Se puede ejecutar en local con `lerobot-rollout` o mediante scripts personalizados. No se mencionan soportes para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponible; depende del hardware y del número de cámaras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AndreGaio/smolvla_packing (fine-tune) | 450M | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base (SmolVLA) | 450M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | 8K tokens | MIT | Hugging Face |
| RT-2 (Google) | 55B | 32K tokens | propietaria | no público |

SmolVLA destaca por su tamaño reducido (450M) frente a alternativas como OpenVLA (7B) o RT-2 (55B), lo que permite su ejecución en hardware de consumo. Este fine-tune concreto está especializado en una única tarea, mientras que los modelos generalistas ofrecen mayor versatilidad a costa de mayores requisitos computacionales. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Entrenado con solo 5 episodios, lo que puede provocar sobreajuste y una generalización muy limitada a variaciones en la posición de los objetos, iluminación o distracciones.
- Es un modelo específico para la tarea "Load erasers into container"; no es un policy generalista y fallará en otras tareas sin fine-tuning adicional.
- Requiere el hardware robótico exacto (robot so_follower) y las cámaras configuradas de la misma manera que en el entrenamiento; cambios en la disposición pueden degradar el rendimiento.
- No se han realizado evaluaciones formales, por lo que no hay garantía de éxito en entornos reales.
- El dataset de entrenamiento puede contener sesgos implícitos derivados de las demostraciones grabadas (por ejemplo, posiciones iniciales fijas, iluminación constante).
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es un experimento de demostración y no está validado para entornos de producción industrial.
- No se especifican los idiomas soportados; la instrucción de tarea está en inglés, por lo que el modelo puede no responder correctamente a instrucciones en otros idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AndreGaio/smolvla_packing
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Blog de Hugging Face sobre SmolVLA: https://huggingface.co/blog/smolvla
- Sitio web oficial de SmolVLA: https://smolvla.net/index_en
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/AndreGaio/test-packing_20260816_160939
