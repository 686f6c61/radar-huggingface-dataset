# dragonlimited/DragonCode-387M

## Resumen

DragonCode-387M es un modelo de lenguaje de dominio de código, de 387 millones de parámetros, desarrollado por el usuario dragonlimited como parte de una familia de modelos en progresivo escalado (150M, 387M, 787M, 1.2B, 2.4B). El modelo está diseñado para la generación y comprensión de código, y su entrenamiento se ha realizado siguiendo la ley de Chinchilla, con un presupuesto de 7.740 millones de tokens en una sola época.

La relevancia de este modelo reside en su enfoque de entrenamiento incremental y su integración en un pipeline automatizado de pretraining que permite reanudar el entrenamiento de forma modular. El checkpoint final (paso 58800, 7.707 de 7.740 millones de tokens, un 99,92 % del presupuesto) está preservado en HuggingFace, y el pipeline ha avanzado al siguiente nivel de la familia (787M). El modelo utiliza el tokenizador de StarCoder2-3B y está pensado como un escalón intermedio dentro de una estrategia de entrenamiento por fases.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere decoder-only transformer, no confirmado) |
| Parámetros totales | ~387M |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`checkpoint-latest.pt` + `train_state.json`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (número de capas, dimensiones ocultas, mecanismo de atención), aunque por el tamaño y el tokenizador compartido con la familia StarCoder2 se puede inferir una arquitectura transformer decoder-only, pero esto no está confirmado por el autor.

El entrenamiento se ha realizado sobre el corpus `DragonCode-Coding-Tokens` (58 shards), con un presupuesto de 7.740 millones de tokens según la ley de Chinchilla para 387M parámetros, en una sola época. El entrenamiento se ejecutó durante 58.800 pasos, alcanzando 7.707.383.808 tokens vistos (99,92 % del presupuesto) con una pérdida final entre 1,6 y 2,9. El proceso utiliza un script de entrenamiento (`dragoncode_run.py`) que guarda checkpoints cada 700 pasos y permite reanudar el entrenamiento automáticamente detectando el estado en `train_state.json`.

## Capacidades

- Generación de código: el modelo está entrenado exclusivamente con corpus de código, por lo que su capacidad principal es la generación y completado de código fuente.
- Pretraining tier: es un modelo de pretraining, no ha pasado por fases de fine-tuning instructivo (RLHF/DPO), por lo que no responde a instrucciones conversacionales.
- Tokenizador compartido: utiliza el tokenizador de StarCoder2-3B (vocabulario de 49.152 tokens), lo que facilita la interoperabilidad con otros modelos de la familia.
- Capacidades multilingües: no disponibles. El corpus de código probablemente incluya múltiples lenguajes de programación, pero no se especifica.
- Tool calling, agentes, visión, audio: no disponibles. El modelo es exclusivamente de texto y no tiene soporte para estas capacidades.

## Casos de uso

- Pretraining continuado: el modelo sirve como punto de partida para continuar el entrenamiento con datos adicionales o para fine-tuning en tareas específicas de código. Su checkpoint completo permite reanudar el entrenamiento sin pérdida de estado.
- Evaluación de escalado: al ser un eslabón en una cadena de modelos (150M → 387M → 787M), permite estudiar el comportamiento de la pérdida y la calidad según la escala de parámetros con el mismo corpus y tokenizador.
- Generación de código base: puede utilizarse para completado de código en entornos donde no se requiera seguimiento de instrucciones, como autocompletado en editores o generación de fragmentos.
- Fine-tuning para autocompletado: su tamaño compacto (387M) lo hace adecuado para fine-tuning y despliegue en entornos con recursos limitados.
- Investigación en leyes de escalado: al estar entrenado con un presupuesto Chinchilla exacto, es útil para reproducir o validar experimentos sobre la relación entre tamaño del modelo y volumen de datos.
- Base para destilación: al ser un modelo pequeño, puede usarse como modelo profesor/alumno en experimentos de destilación de conocimiento desde modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas como MMLU, HumanEval, GSM8K u otras evaluaciones estándar de generación de código.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Un modelo de 387M parámetros en FP32 requiere aproximadamente 1,5 GB de VRAM, y en FP16 unos 0,8 GB, pero estos son cálculos teóricos no confirmados por el autor.
- GPU recomendadas: no disponibles. Por tamaño, podría ejecutarse en GPUs de consumo como RTX 3060 o superiores, pero no hay confirmación oficial.
- Si cabe en consumer GPU: presumiblemente sí, dado el tamaño reducido, pero no hay datos oficiales.
- Opciones de despliegue: no disponibles. El repo contiene un checkpoint de PyTorch, no pesos en formato GGUF, safetensors ni configuración para vLLM u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo no presenta benchmarks ni características técnicas detalladas que permitan una comparación rigurosa con alternativas como StarCoder2-3B, CodeLlama-7B o DeepSeek-Coder. La información pública se limita al estado del entrenamiento.

## Limitaciones y advertencias

- Modelo de pretraining sin fine-tuning instructivo: no responde a instrucciones ni mantiene conversaciones; solo genera continuaciones de texto.
- Sin información de licencia: no se especifica la licencia de uso, lo que impide conocer las restricciones para uso comercial o derivados.
- Sin datos de sesgos o alucinación: no hay evaluación publicada sobre riesgos de generación de código incorrecto o inseguro.
- Sin especificación de contexto: se desconoce la longitud máxima de contexto soportada, un dato crítico para casos de uso reales.
- Repositorio con datos de entrenamiento: el repo incluye checkpoints y estado de entrenamiento (293,2 GB), no solo pesos de inferencia, lo que puede dificultar su uso directo.
- Sin formato de pesos estándar: no hay pesos en safetensors ni GGUF; solo checkpoint de PyTorch, lo que limita la compatibilidad con frameworks de inferencia comunes.
- Fecha de creación futura: el modelo fue creado el 23 de agosto de 2026, según los metadatos, lo que sugiere que la información puede ser parte de un entorno simulado o experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dragonlimited/DragonCode-387M
- Dataset de entrenamiento: https://huggingface.co/datasets/dragonlimited/DragonCode-387M-Tokens
- Discusiones del dataset: https://huggingface.co/datasets/dragonlimited/DragonCode-387M-Tokens/discussions
- Notebook de pretraining (GitHub): https://github.com/pinkelephantlimited/dragoncode-family-notebook
- Sitio del agente Dragon Code (posiblemente no relacionado): https://mws.run/
- Sitio DragonCode (posiblemente no relacionado): https://dragoncode.codes/
