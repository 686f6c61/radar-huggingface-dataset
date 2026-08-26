# dvader13/olmo2-1b-rlfinal-s1-357b

## Resumen

Este repositorio contiene un checkpoint de entrenamiento de refuerzo (RL) del modelo OLMo-2-1B, desarrollado por el usuario dvade13. Se trata de un estado de entrenamiento completo (step 5000) que incluye pesos en fp32, optimizador, scheduler, estado del generador de números aleatorios y del dataloader, lo que permite reanudar el proceso de entrenamiento desde ese punto exacto. No es un export de inferencia, sino un artefacto de investigación para continuar o analizar el ciclo de RL.

El modelo base es OLMo-2-1B de Ai2, que completó su preentrenamiento en el rung `stage1-step170000-tokens357B`. La licencia es Apache 2.0, lo que permite uso comercial y modificación libre. El repositorio ocupa 17.8 GB, coherente con el peso de un checkpoint fp32 completo más los estados de entrenamiento asociados. Su relevancia radica en que es un recurso para estudiar la dinámica del RLHF/RLVR en modelos de lenguaje abiertos de 1B parámetros, un área de investigación activa en la comunidad de IA open source.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base OLMo-2-1B, 12 capas, 16 cabezas, embedding 2048) |
| Parámetros totales | 1.17 B (modelo base OLMo-2-1B) |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (modelo base OLMo-2-1B) |
| Tipos de cuantización | No aplicable (checkpoint fp32 de entrenamiento, no para inferencia) |
| Idiomas soportados | No disponibles en la información del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch fp32 completo (pesos + optimizador + scheduler + RNG + dataloader) |

## Arquitectura y entrenamiento

El checkpoint corresponde a un modelo OLMo-2-1B de Ai2, que es un transformer decoder-only con arquitectura Llama-like (12 capas, 16 cabezas de atención, dimensión de embedding 2048 y contexto de 4096 tokens). El preentrenamiento alcanzó los 357 mil millones de tokens (rung `stage1-step170000-tokens357B`). Posteriormente se aplicó un entrenamiento de RL (probablemente RLVR - Reinforcement Learning with Verifiable Rewards, según el patrón de los modelos OLMo-2 RLVR de Ai2) que llegó al paso 5000, que es el estado guardado en este repositorio.

Una característica destacable es que este checkpoint incluye el estado completo del optimizador (AdamW con estados de momento), scheduler de aprendizaje, RNG y dataloader, lo que lo hace resumible para continuar el entrenamiento exactamente desde el punto guardado. No es un modelo de inferencia; carece de los pesos consolidados en formato de inferencia (como safetensors o GGUF).

## Capacidades

- Este checkpoint no es un modelo de inferencia; no puede usarse directamente para generar texto ni para tareas de razonamiento.
- Permite reanudar el entrenamiento de RL desde el paso 5000, lo que facilita experimentos de continuidad de entrenamiento, análisis de curvas de aprendizaje y ajuste de hiperparámetros.
- El modelo base OLMo-2-1B (del que deriva) es capaz de generar texto, razonamiento básico, matemáticas simples y código, pero estas capacidades no están disponibles en este artefacto concreto.
- No soporta tool calling, funciones de agente ni capacidades multimodales en su estado actual.

## Casos de uso

- Investigación en RLHF/RLVR: este checkpoint permite estudiar la evolución del comportamiento del modelo durante el entrenamiento de refuerzo, comparando métricas de recompensa, alucinaciones y razonamiento en distintos pasos.
- Continuación de entrenamiento: se puede reanudar el entrenamiento desde el paso 5000 con nuevos datos o hiperparámetros, sin necesidad de reentrenar desde cero.
- Análisis de dinámicas de optimización: el estado completo del optimizador y scheduler permite analizar la trayectoria de actualización de pesos, útil para estudios de estabilidad del entrenamiento.
- Reproducibilidad: al incluir el estado RNG y dataloader, se puede reproducir exactamente el proceso de entrenamiento para verificación experimental.
- Desarrollo de técnicas de RL: sirve como banco de pruebas para nuevas variantes de RLVR (por ejemplo, diferentes funciones de recompensa) partiendo de un estado intermedio.
- Educación en IA: útil para cursos que expliquen el pipeline completo de RLHF, mostrando un checkpoint real de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación ni comparaciones con otros modelos.

## Requisitos de hardware

- El checkpoint completo ocupa 17,8 GB en disco (fp32, incluye pesos del modelo, optimizador, scheduler y estados auxiliares).
- Para cargar el checkpoint en memoria y reanudar entrenamiento se estima una VRAM mínima de 24 GB (por ejemplo, RTX 3090/4090, A100 40 GB) para el modelo de 1B con estados de optimizador en fp32.
- No es adecuado para inferencia en hardware de consumo, ya que no es un export de inferencia.
- Para continuar el entrenamiento, se recomienda usar el framework de entrenamiento OLMo (GitHub: allenai/OLMo) con PyTorch y CUDA.
- Latencia y throughput de inferencia no aplicables, ya que el checkpoint no está preparado para inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| dvade13/olmo2-1b-rlfinal-s1-357b (este) | 1.17 B | 4096 | Apache 2.0 | Checkpoint entrenamiento fp32 | Investigación RLHF |
| allenai/OLMo-2-0425-1B | 1.17 B | 4096 | Apache 2.0 | safetensors (inferencia) | Inferencia y fine-tuning |
| allenai/OLMo-2-0425-1B-RLVR1 | 1.17 B | 4096 | Apache 2.0 | safetensors (inferencia) | Inferencia post-RL |

La comparación muestra que este checkpoint es un artefacto intermedio de entrenamiento, no comparable directamente con los modelos de inferencia de la misma familia.

## Limitaciones y advertencias

- No es un modelo de inferencia; no se puede usar para generar texto ni en producción.
- Al ser un checkpoint de entrenamiento, requiere conocer el framework y la configuración exacta del entrenamiento para ser reanudado correctamente.
- El entrenamiento de RL puede introducir sesgos de recompensa que no se han evaluado ni documentado en este repositorio.
- No se han publicado evaluaciones de seguridad, sesgos o alucinación para este checkpoint concreto.
- El tamaño de 17,8 GB puede ser un obstáculo para entornos con almacenamiento limitado.
- No se especifica si el dataset de RL utilizado es público o privado, lo que puede afectar la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/olmo2-1b-rlfinal-s1-357b
- Modelo base OLMo-2-0425-1B: https://huggingface.co/allenai/OLMo-2-0425-1B
- Modelo base RLVR1: https://huggingface.co/allenai/OLMo-2-0425-1B-RLVR1
- Repositorio GitHub de OLMo: https://github.com/allenai/OLMo
- Página oficial de OLMo 2: https://allenai.org/olmo2
