# 3cda2225/record-armtest05_act_policy

## Resumen

`record-armtest05_act_policy` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el artículo arXiv 2304.13705. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de aprendizaje por imitación de Hugging Face, por el usuario `3cda2225`. Se trata de un checkpoint concreto asociado al dataset `3cda2225/record-armtest05_20261111_183520`, orientado a controlar un brazo robótico (la documentación de ejemplo apunta a un seguidor SO-100) a partir de demostraciones teleoperadas.

ACT predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control en tareas de manipulación. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,4 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real en hardware de consumo.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas open source con licencia Apache 2.0. No es un modelo de lenguaje: no procesa texto ni genera respuestas conversacionales, sino que mapea observaciones visuales y de estado del robot a comandos de actuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación supervisado que combina un codificador visual (típicamente basado en ResNet) con un transformer encoder-decoder que predice chunks de acciones. En lugar de emitir una acción por paso, el modelo genera una secuencia de acciones futuras, lo que mitiga el problema de la acumulación de errores en políticas de comportamiento (behavior cloning) y permite un control más suave. La innovación principal del artículo original es el uso de *action chunking* junto con una técnica de regularización tipo VAE (CVAE) para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realiza sobre el dataset `3cda2225/record-armtest05_20261111_183520`, compuesto por episodios teleoperados del brazo robótico. No se dispone de información sobre el número de episodios, tokens equivalentes, composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables en este paradigma). El checkpoint se ha generado con `lerobot-train` usando `--policy.type=act`, y la evaluación se realiza con `lerobot-record` sobre un robot `so100_follower`.

## Capacidades

- Control robótico por imitación: predice chunks de acciones a partir de observaciones visuales y de estado del robot.
- Manipulación de un brazo robótico en tareas específicas aprendidas del dataset de entrenamiento.
- Ejecución en tiempo real en hardware de consumo gracias a su tamaño reducido (51,7 M de parámetros).
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales fuera del pipeline robótico.

## Casos de uso

- Manipulación de laboratorio con brazo SO-100: el modelo puede ejecutar la tarea concreta aprendida (denominada "armtest05") en un seguidor SO-100, usando `lerobot-record` con `--policy.path` apuntando al checkpoint.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, datasets o hiperparámetros dentro de LeRobot.
- Prototipado rápido de políticas robóticas: con 51,7 M de parámetros y 0,4 GB de pesos, permite iterar en una estación de trabajo con GPU de consumo sin infraestructura dedicada.
- Evaluación de calidad de datos teleoperados: al reentrenar o afinar sobre el mismo dataset, permite medir cómo afecta la composición de las demostraciones al éxito de la política.
- Docencia y formación en robótica: ejemplo completo y funcional de pipeline entrenamiento-evaluación con LeRobot y licencia permisiva.
- Despliegue en entornos de laboratorio con requisitos de reproducibilidad: al estar versionado en el Hub con licencia Apache 2.0, facilita la auditoría y la réplica de experimentos.
- Base para fine-tuning en tareas relacionadas: al ser un checkpoint ACT estándar, puede servir de inicialización para otras tareas de manipulación con el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros, ~0,2 GB en fp32); cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100); el cuello de botella real será la cámara y el bucle de control, no el modelo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer modernas e incluso en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de política).
- Latencia y throughput estimados: no disponibles; dependen del robot, la frecuencia de control y el hardware de captura visual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| record-armtest05_act_policy (este) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face Hub |
| Políticas ACT genéricas de LeRobot | variable (decenas de millones) | no aplica | no disponible | Apache 2.0 | Hugging Face Hub / LeRobot |
| Diffusion Policy (baseline de imitación) | variable | no aplica | no disponible | según implementación | Repositorios de investigación |
| VQ-BeT (baseline de imitación) | variable | no aplica | no disponible | según implementación | Repositorios de investigación |

No se dispone de datos comparativos de rendimiento publicados para este checkpoint concreto; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea y un robot concretos ("armtest05" sobre SO-100); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Riesgo de sobreajuste al dataset de demostraciones: el éxito fuera de la distribución de los datos teleoperados puede degradarse notablemente.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades conversacionales.
- No se documentan sesgos específicos, pero al depender de demostraciones humanas puede heredar sesgos de la persona que teleoperó.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Solo 6 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado, sin evidencia comunitaria de robustez.
- No se documentan requisitos de seguridad física; en robótica real es imprescindible implementar límites de par, paradas de emergencia y supervisión humana.
- La fecha de creación (2026-09-01) y actualización (2026-11-11) indican un artefacto reciente y poco contrastado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3cda2225/record-armtest05_act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/3cda2225/record-armtest05_20261111_183520
- Paper ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
