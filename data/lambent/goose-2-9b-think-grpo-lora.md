# Lambent/Goose-2.9B-think-grpo-lora

## Resumen

El modelo `Lambent/Goose-2.9B-think-grpo-lora` es un ajuste fino de la serie RWKV7, desarrollado por el usuario Lambent sobre la base `RWKV/RWKV7-2.9B-20260805`. Se trata de un modelo de 2.9 mil millones de parámetros, con licencia Apache-2.0, orientado a mejorar la comprensión del formato de etiquetas de "thinking" (razonamiento) mediante entrenamiento con GRPO (Group Relative Policy Optimization). El proceso descrito en la model card indica que primero se fusionó un LoRA de "midtrain" sobre documentos y posteriormente se aplicó GRPO para que el modelo aprenda a generar etiquetas de pensamiento sin degradar significativamente la modelización del lenguaje.

Este modelo es relevante por su tamaño compacto (2.9B) y su licencia permisiva, lo que lo hace atractivo para despliegues en entornos con recursos limitados o para experimentación en razonamiento guiado. Sin embargo, la información pública disponible es escasa: no se detallan especificaciones técnicas completas, benchmarks ni casos de uso documentados. La ficha siguiente refleja únicamente los datos confirmados y marca como "no disponible" cualquier aspecto no especificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV7 (arquitectura recurrente, no transformer estándar) |
| Parametros totales | 2.9B (según nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

La arquitectura base es RWKV7, un modelo de lenguaje recurrente que combina ideas de RNN y transformer, con atención lineal y eficiencia en inferencia. El modelo `Goose-2.9B-think-grpo-lora` parte de un LoRA de "midtrain" sobre documentos (referenciado como `Lambent/RWKV7-2.9B-midtrain50-docs-lora`), que se fusiona con el modelo base. Posteriormente se entrena con GRPO, una variante de optimización por preferencias que refuerza la generación de etiquetas de "thinking" (por ejemplo, `<think>` y `</think>`) para estructurar el razonamiento. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni la composición exacta de los datos.

## Capacidades

No se han documentado capacidades específicas en la información disponible. Al tratarse de un modelo de lenguaje general de 2.9B, se espera que pueda realizar tareas básicas de generación de texto, completado y posiblemente razonamiento simple, pero no hay confirmación oficial. No se menciona soporte para tool calling, agentes, visión, audio ni otras funcionalidades avanzadas.

## Casos de uso

No se han documentado casos de uso concretos en la información proporcionada. Dado el tamaño y la licencia, podría emplearse en entornos de investigación o prototipado, pero no hay evidencia de aplicaciones específicas validadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos. Dado el tamaño de 2.9B, se puede inferir que el modelo podría ejecutarse en GPUs con al menos 6 GB de VRAM en precisión fp16, pero esta es una estimación no confirmada. No hay datos sobre latencia, throughput ni opciones de despliegue recomendadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (tamaño y arquitectura RWKV7). No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo pequeño, es probable que presente alucinaciones y errores en tareas complejas.
- La licencia Apache-2.0 permite uso comercial, pero no hay garantías de calidad o soporte.
- La falta de información sobre el contexto máximo y los idiomas soportados limita su uso en producción.
- El entrenamiento con GRPO puede haber introducido sesgos en el formato de salida (etiquetas de thinking) que podrían afectar a tareas que no requieren ese formato.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lambent/Goose-2.9B-think-grpo-lora
- Modelo base: https://huggingface.co/RWKV/RWKV7-2.9B-20260805
- LoRA de midtrain: https://huggingface.co/Lambent/RWKV7-2.9B-midtrain50-docs-lora
