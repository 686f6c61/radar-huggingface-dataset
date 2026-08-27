# dvader13/smollm3-3b-rlfinal-8p12t

## Resumen

Este repositorio contiene un checkpoint intermedio de entrenamiento con refuerzo (RL) sobre el modelo base SmolLM3-3B, desarrollado por el usuario dvader13. El checkpoint corresponde al final de la primera época de RL, en el paso 1804, e incluye el estado completo del entrenamiento: pesos en fp32, optimizador, scheduler y estado del generador de números aleatorios. No es un modelo listo para inferencia, sino un artefacto diseñado para continuar o reanudar el entrenamiento desde ese punto exacto. La base SmolLM3-3B es un modelo de lenguaje de 3.000 millones de parámetros desarrollado por Hugging Face, entrenado sobre 11 billones de tokens (aunque este checkpoint se generó tras un preentrenamiento de 8,12 billones de tokens según la model card). El checkpoint se distribuye bajo licencia Apache 2.0 y ocupa 36,9 GB en disco, lo que refleja el tamaño del estado completo de entrenamiento, no solo los pesos del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder con Grouped Query Attention (GQA), sin RoPE (según base SmolLM3-3B) |
| Parámetros totales | 3.000 millones (base SmolLM3-3B) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | 128K tokens (según base SmolLM3-3B) |
| Tipos de cuantización | No aplicable (checkpoint en fp32, no cuantizado) |
| Idiomas soportados | No disponible para este checkpoint; el modelo base soporta 6 idiomas (inglés, francés, alemán, español, portugués, italiano) |
| Licencia | Apache-2.0 |
| Formato de pesos | Estado de entrenamiento completo (fp32), no exportado a safetensors ni GGUF |

## Arquitectura y entrenamiento

Este checkpoint es un estado intermedio de un proceso de aprendizaje por refuerzo (RL) aplicado sobre el modelo base SmolLM3-3B. La arquitectura subyacente es un transformer decoder con Grouped Query Attention (GQA) para reducir el uso de memoria en la caché de claves/valores, y sin codificación posicional rotatoria (RoPE), lo que facilita el manejo de contextos largos. El preentrenamiento base se realizó con 8,12 billones de tokens (según la nota del autor), aunque la versión oficial de SmolLM3-3B se entrenó con 11 billones de tokens. En el paso 1804 se guardó el estado completo del optimizador, el scheduler y el RNG, lo que permite reanudar el entrenamiento de forma determinista. No se indica qué algoritmo de RL se empleó (PPO, GRPO, etc.), ni si se aplicó algún tipo de ajuste fino supervisado previo.

## Capacidades

No se puede evaluar las capacidades de este checkpoint porque no es un modelo de inferencia. No se proporcionan datos sobre rendimiento en tareas de lenguaje, razonamiento, código o multilingüismo. El modelo base SmolLM3-3B, sobre el que se entrena, sí tiene capacidades documentadas: generación de texto, razonamiento dual, soporte para tool calling, y multilingüismo en seis idiomas. Sin embargo, este checkpoint concreto no está diseñado para ser utilizado directamente en producción.

## Casos de uso

Dado que es un estado de entrenamiento, los casos de uso son limitados y técnicos:

- **Reanudación de entrenamiento de RL**: el checkpoint permite continuar el entrenamiento desde el paso 1804, útil para investigadores que quieran reproducir o extender el experimento.
- **Análisis de la dinámica de entrenamiento**: se puede examinar el estado del optimizador y del scheduler para estudiar la evolución de las métricas de RL.
- **Investigación en RLHF**: sirve como referencia para comparar el comportamiento del modelo en diferentes fases de entrenamiento.
- **Desarrollo de algoritmos de RL**: se puede utilizar para probar nuevas variantes de optimización sobre un estado conocido.
- **Auditoría de procesos de entrenamiento**: permite verificar la reproducibilidad del entrenamiento y los hiperparámetros utilizados.
- **Transferencia de aprendizaje**: aunque no es el uso principal, se podría extraer los pesos (si se convierte a formato de inferencia) para evaluar el modelo en una fase intermedia, pero no es el propósito del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint. El modelo base SmolLM3-3B, según la documentación oficial, supera a Llama 3.2 3B y Qwen2.5 3B, y es competitivo con modelos de 4B como Qwen3 y Gemma3, pero esos datos corresponden al modelo final, no a este checkpoint intermedio. No hay información sobre el rendimiento en tareas específicas como MMLU, HumanEval o GSM8K para este estado de entrenamiento.

## Requisitos de hardware

- El checkpoint ocupa 36,9 GB, por lo que se necesita un disco con suficiente espacio y una GPU con al menos 40 GB de VRAM para cargar el estado completo en memoria (fp32).
- Para reanudar el entrenamiento se requiere una GPU de alta gama: A100 40/80 GB, H100, o RTX 4090 con 24 GB (aunque 24 GB no serían suficientes para el estado completo, se podría usar offloading).
- No se recomienda ejecutarlo en GPU de consumo para inferencia, ya que no es un modelo de inferencia.
- Para extraer los pesos y convertirlos a formato de inferencia (p. ej., safetensors), se necesitaría al menos una GPU de 24 GB para cargar los 3B parámetros en fp16, pero el checkpoint actual no está en ese formato.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| **dvader13/smollm3-3b-rlfinal-8p12t** (este) | 3B (base) | 128K (base) | Apache-2.0 | Estado de entrenamiento (fp32) | No apto para inferencia |
| **SmolLM3-3B** (oficial) | 3B | 128K | Apache-2.0 | safetensors, GGUF | Listo para inferencia |
| **Llama 3.2 3B** | 3B | 128K | Llama 3.2 Community License | safetensors | Listo para inferencia |
| **Qwen2.5 3B** | 3B | 32K | Apache-2.0 | safetensors | Listo para inferencia |

Este checkpoint no es comparable directamente con modelos finales porque no está en formato de inferencia. Su valor reside en el estado de entrenamiento, no en su rendimiento.

## Limitaciones y advertencias

- **No es un modelo de inferencia**: no se puede cargar en vLLM, llama.cpp u otros motores de inferencia directamente; requiere conversión previa de pesos.
- **Estado de entrenamiento incompleto**: es un checkpoint intermedio de RL, no el resultado final, por lo que su rendimiento puede ser inferior al modelo base oficial.
- **Sin datos de evaluación**: no hay información sobre sesgos, alucinaciones o comportamiento en tareas específicas.
- **Tamaño del repositorio**: 36,9 GB, lo que puede suponer un problema de ancho de banda y almacenamiento.
- **Dependencia del modelo base**: las capacidades y limitaciones del modelo base SmolLM3-3B se aplican a este checkpoint, pero con la incertidumbre de que el RL puede haber alterado el comportamiento.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe revisar si el modelo base tiene restricciones adicionales (en este caso, el base también es Apache-2.0).

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/dvader13/smollm3-3b-rlfinal-8p12t
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Documentación técnica de SmolLM3: https://huggingface.co/docs/transformers/en/model_doc/smollm3
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm
- Página del modelo en atomic.chat: https://atomic.chat/models/smollm3-3b
- Repositorio de ejemplo de SmolLM3-3B: https://github.com/ArkS0001/SmolLM3-3B
