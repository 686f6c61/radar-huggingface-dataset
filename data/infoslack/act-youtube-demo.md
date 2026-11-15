# infoslack/ACT-YOUTUBE-DEMO

## Resumen

ACT-YOUTUBE-DEMO es una política de imitación basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación publicado en el paper arXiv 2304.13705 que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de robótica de Hugging Face, y está asociado al dataset `infoslack/ACT-YOUTUBE-DEMO_20261114_222855`. Su autor es el usuario `infoslack`.

Con 51.668.614 parámetros (aproximadamente 51,7 millones), es un modelo compacto orientado a control robótico de bajo nivel, no a generación de texto. El repositorio ocupa 0,2 GB y los pesos están en formato safetensors. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas.

Su relevancia radica en que ejemplifica el flujo de trabajo estándar de LeRobot para entrenar políticas de imitación con datos de teleoperación y desplegarlas en robots de bajo coste como el SO-100. No obstante, se trata de una demo entrenada con un dataset específico de YouTube, por lo que su generalización fuera de ese dominio es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: en lugar de predecir una única acción por paso de tiempo, el modelo genera una secuencia corta de acciones futuras. Esto reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad en tareas de manipulación. La arquitectura habitual de ACT incluye un encoder visual (típicamente ResNet) que procesa las observaciones de cámara y un decoder transformer que genera los chunks de acción, condicionado por el estado del robot.

El entrenamiento se realiza con el comando `lerobot-train` sobre el dataset `infoslack/ACT-YOUTUBE-DEMO_20261114_222855`, que contiene episodios de teleoperación. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto de imitación). La innovación principal es el propio mecanismo de action chunking, que permite políticas reactivas con horizonte de predicción corto y alta frecuencia de control.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot.
- Manipulación de objetos: entrenado para tareas de agarre y manipulación en entornos de laboratorio con robots tipo SO-100.
- Ejecución en tiempo real: diseñado para inferencia de baja latencia en bucles de control.
- Integración con LeRobot: compatible con los comandos `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general o audio; la visión se limita al encoder de observaciones para el control.

## Casos de uso

- Automatización de tareas de pick-and-place: el modelo puede ejecutar secuencias de agarre y colocación aprendidas de teleoperación, adecuado para prototipos de bajo coste con el robot SO-100.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para comparar variantes de ACT y técnicas de chunking en entornos controlados.
- Evaluación de pipelines de LeRobot: permite validar el flujo completo de entrenamiento, registro de episodios y despliegue en hardware real.
- Docencia y formación en robótica: al ser una demo compacta (0,2 GB), es adecuada para prácticas de laboratorio donde se enseña a entrenar políticas desde cero.
- Pruebas de concepto de manipulación doméstica: útil para experimentar con tareas sencillas como apilar objetos o abrir cajones en un entorno simulado o real.
- Benchmarking de hardware de inferencia: con 51,7 M de parámetros, permite medir latencia y throughput en GPUs de consumo y en dispositivos embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros, aproximadamente 0,2 GB en fp32); en la práctica, la VRAM adicional la determina el encoder visual y el tamaño del batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha documentado el uso de CUDA con `--policy.device=cuda`.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), exportación a safetensors para inferencia personalizada; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a robótica).
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ACT-YOUTUBE-DEMO | 51,7 M | no disponible | Apache 2.0 | Hugging Face (LeRobot) | Demo de imitación con dataset propio |
| ACT (paper original) | no disponible | no disponible | no disponible | Paper arXiv 2304.13705 | Método base, sin pesos publicados en esta ficha |
| Diffusion Policy | no disponible | no disponible | no disponible | Repositorios de investigación | Alternativa de imitación basada en difusión, más costosa en inferencia |
| VQ-BeT | no disponible | no disponible | no disponible | Repositorios de investigación | Alternativa de imitación con cuantización vectorial |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un dataset específico de YouTube, la política puede sobreajustarse a las condiciones de iluminación, posiciones de cámara y objetos presentes en ese dataset.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero el modelo puede generar acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni soporta múltiples idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en entornos reales.
- Caveats para producción: es una demo con 0 descargas y 0 likes; no hay evidencia de validación externa. Se recomienda evaluar exhaustivamente en el robot objetivo antes de cualquier despliegue real y establecer límites de seguridad físicos.

## Enlaces

- Hugging Face: https://huggingface.co/infoslack/ACT-YOUTUBE-DEMO
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset asociado: https://huggingface.co/datasets/infoslack/ACT-YOUTUBE-DEMO_20261114_222855
