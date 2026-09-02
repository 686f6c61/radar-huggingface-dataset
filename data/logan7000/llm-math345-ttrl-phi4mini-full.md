# logan7000/llm-math345-ttrl-phi4mini-full

## Resumen

El modelo `logan7000/llm-math345-ttrl-phi4mini-full` es un fine-tuning del modelo base `Phi-4-mini-instruct` de Microsoft, desarrollado por Logan Yang (usuario `logan7000`). El entrenamiento emplea una técnica de aprendizaje por refuerzo en tiempo de prueba (TTRL, por sus siglas en inglés) con el algoritmo GRPO (Group Relative Policy Optimization) sobre el dataset de problemas matemáticos MATH345. A diferencia de los enfoques convencionales, no se utilizan etiquetas verdaderas (ground truth); en su lugar, se genera una pseudo-etiqueta mediante votación mayoritaria (majority vote) sobre K muestras del propio modelo.

Este modelo es relevante porque explora una vía de aprendizaje por refuerzo sin supervisión externa, lo que podría reducir la dependencia de datos anotados manualmente. El repositorio consolida dos versiones anteriores (una optimizada por validación y otra por paso final de entrenamiento) en un único conjunto de pesos. El tamaño del repositorio es de 15,4 GB, lo que sugiere que los pesos se almacenan en precisión completa (fp32), aunque no se especifica la arquitectura interna ni el número de parámetros en la documentación disponible.

La ficha se basa exclusivamente en la información publicada en la model card y en los resultados de búsqueda web; muchos parámetros técnicos no están disponibles y se indican explícitamente como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Phi-4-mini-instruct) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se observan pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según el tag del repositorio) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura del modelo, pero al tratarse de un fine-tuning de `Phi-4-mini-instruct`, se hereda la arquitectura de ese modelo base, que es un transformer decoder de 3.800 millones de parámetros (según información pública de Microsoft, aunque no se confirma en esta documentación). El proceso de entrenamiento es el siguiente:

- Técnica: TTRL (Test-Time Reinforcement Learning) con GRPO de modelo único.
- Pseudo-etiquetas: votación mayoritaria sobre K=12 muestras generadas por el propio modelo, sin ground truth.
- Número de pasos: 136 pasos equivalen a 1 época.
- Tamaño de lote: 128 prompts por actualización.
- Hiperparámetros: beta=0, learning rate=3e-6, loss tipo BnPO, Adam beta2=0.95.
- Evaluación cada 10 pasos; se guardan dos checkpoints: `best/` (mejor según validación, paso 120) y `endpoint/` (paso 136).

No se proporciona información sobre la composición del dataset más allá del nombre "MATH345", ni sobre el número total de tokens de entrenamiento.

## Capacidades

No se han documentado capacidades específicas para este modelo en la model card. Dado que el entrenamiento se centra en problemas matemáticos del dataset MATH345, se puede inferir que el modelo está orientado a tareas de razonamiento matemático y resolución de problemas. Sin embargo, no hay evidencia publicada sobre:

- Generación de texto general o código.
- Soporte de tool calling o function calling.
- Capacidades de agentes o razonamiento multi-paso.
- Multilingüismo.
- Modos especiales (vision, audio, thinking mode).

La información disponible solo indica que el modelo es un fine-tuning de `Phi-4-mini-instruct`, por lo que podría conservar las capacidades generales de ese modelo base, pero esto no está confirmado en la documentación del repositorio.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Al no existir información sobre sus capacidades reales, no es posible proponer aplicaciones concretas con garantías. Se recomienda consultar la documentación del modelo base `Phi-4-mini-instruct` para conocer posibles usos generales, y evaluar este fine-tuning en tareas de razonamiento matemático, que es el dominio para el que fue entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware específicos. El tamaño del repositorio es de 15,4 GB, lo que sugiere que los pesos en fp32 ocupan aproximadamente ese espacio. Para inferencia en fp16, se necesitaría al menos la mitad de VRAM, pero no se puede estimar con precisión sin conocer el número de parámetros y la arquitectura exacta. No se mencionan GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento utiliza pseudo-etiquetas generadas por votación mayoritaria sin ground truth, lo que puede introducir errores sistemáticos si el modelo produce respuestas incorrectas de forma consistente.
- No se especifica la licencia, por lo que se desconoce si el modelo puede utilizarse con fines comerciales o si tiene restricciones de redistribución.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma.
- El repositorio no incluye documentación sobre el rendimiento en tareas fuera del dominio matemático, por lo que su uso en otros escenarios requiere validación previa.
- La falta de especificaciones técnicas (arquitectura, parámetros, contexto) dificulta la planificación de despliegue en producción.

## Enlaces

- [Repositorio principal en Hugging Face](https://huggingface.co/logan7000/llm-math345-ttrl-phi4mini-full)
- [Repositorio variante endpoint](https://huggingface.co/logan7000/llm-math345-ttrl-phi4mini-endpoint)
- [Perfil del autor en Hugging Face](https://huggingface.co/logan7000)
- [Página del modelo en FriendliAI](https://friendli.ai/models/q1716523669/llm-math345-ttrl-phi4mini-endpoint)
