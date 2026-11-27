# Haku-2004/act_is45e_c50_base_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. El modelo `Haku-2004/act_is45e_c50_base_20` es un checkpoint concreto entrenado con la librería LeRobot de Hugging Face y publicado en el Hub por el usuario Haku-2004, orientado a políticas de manipulación robótica.

El modelo resuelve el problema del control fino en tareas de manipulación aprendidas por teleoperación: en lugar de predecir una acción por paso de tiempo, genera secuencias cortas de acciones, lo que reduce el error de acumulación y mejora la estabilidad. Con 51,6 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real sobre hardware robótico.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento y despliegue de políticas robóticas en formato safetensors y con integración directa en el Hub. La licencia Apache 2.0 facilita su uso comercial, aunque la información pública sobre el dataset de entrenamiento y los resultados es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer para políticas de imitación |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice chunks de acciones a partir de observaciones (típicamente imágenes de cámara y estado de las articulaciones). La innovación principal del método es la predicción de secuencias de acciones en lugar de acciones individuales, lo que mitiga el problema de horizonte y mejora la consistencia temporal. El paper de referencia es arXiv:2304.13705.

El checkpoint fue entrenado con LeRobot sobre el dataset `Haku-2004/i_20261126_110221`. No se dispone de información pública sobre el número de tokens, la composición del dataset, el número de episodios de teleoperación ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto de aprendizaje por imitación). El nombre del modelo (`is45e_c50_base_20`) sugiere una configuración concreta de episodios o pasos, pero su significado exacto no está documentado.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (action chunks) para manipulación.
- Aprendizaje a partir de datos de teleoperación.
- Integración nativa con LeRobot para entrenamiento (`lerobot-train`) e inferencia (`lerobot-record`).
- Compatible con robots tipo SO-100 follower según los ejemplos de la model card.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de modelos de lenguaje.
- Capacidades multilingües no aplicables.
- No dispone de modo thinking, visión general ni audio; las observaciones visuales se limitan al pipeline de política robótica.

## Casos de uso

- Manipulación robótica de precisión: el modelo predice chunks de acciones que reducen la acumulación de error en tareas de pick-and-place, adecuado por su arquitectura de action chunking.
- Despliegue en robots de bajo coste: con 51,6 M de parámetros y 0,2 GB de pesos, puede ejecutarse en hardware embebido o GPUs de consumo para tareas de seguimiento.
- Investigación en aprendizaje por imitación: sirve como checkpoint base para comparar variantes de ACT y reproducir experimentos con LeRobot.
- Automatización de tareas repetitivas en laboratorio: entrenamiento con datos de teleoperación propios y evaluación con `lerobot-record` sobre el robot SO-100.
- Prototipado rápido de políticas: el flujo LeRobot permite entrenar desde cero y evaluar en pocos pasos, útil para validar datasets antes de escalar.
- Educación y docencia en robótica: modelo ligero y de licencia permisiva para prácticas de imitation learning sin requerir infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,6 M de parámetros; en la práctica, el consumo depende del pipeline de visión y del tamaño de lote.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en dispositivos embebidos con aceleración.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Haku-2004/act_is45e_c50_base_20 | 51,6 M | no disponible | Apache 2.0 | Hugging Face Hub |
| Otros checkpoints ACT en LeRobot | variable | no disponible | variable | Hugging Face Hub |
| Políticas Diffusion Policy | no disponible | no disponible | variable | Hugging Face Hub / repositorios propios |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un dataset concreto de teleoperación, la política puede sobreajustarse a las condiciones de ese entorno.
- Riesgo de alucinación: no aplicable en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erróneas fuera de distribución.
- Limitaciones de contexto o idioma: no aplicables; el modelo no procesa lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del dataset de entrenamiento.
- Caveats para producción: sin benchmarks publicados ni documentación del dataset, la generalización es incierta; requiere validación en el robot objetivo antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_is45e_c50_base_20
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_20261126_110221
