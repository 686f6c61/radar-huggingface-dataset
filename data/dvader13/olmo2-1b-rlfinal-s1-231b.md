# dvader13/olmo2-1b-rlfinal-s1-231b

## Resumen

Este repositorio contiene un checkpoint intermedio del proceso de entrenamiento con aprendizaje por refuerzo (RL) del modelo OLMo-2-1B, desarrollado por Ai2. El autor, dvader13, publica el estado completo del entrenamiento en el paso 5000 de la fase de RL, partiendo del modelo base OLMo-2-1B tras su preentrenamiento con 231.000 millones de tokens (rung `stage1-step110000-tokens231B`).

Es importante destacar que este no es un modelo listo para inferencia, sino un punto de control intermedio que incluye pesos en fp32, optimizador, scheduler, estado del generador de números aleatorios y del dataloader. Está diseñado para reanudar el entrenamiento, no para ejecutar el modelo. La relevancia de este repositorio es puramente investigadora: permite auditar el proceso de RL y continuar el entrenamiento desde un punto concreto.

El modelo base, OLMo-2-1B, es un modelo de lenguaje de 1.000 millones de parámetros de la familia OLMo 2, que se caracteriza por ser completamente abierto: datos de entrenamiento públicos, código de entrenamiento abierto y recetas reproducibles. Este checkpoint hereda esa licencia Apache 2.0, lo que permite su uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo-2-1B) |
| Parámetros totales | 1.000 millones (estimado, basado en OLMo-2-1B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoint de entrenamiento, probablemente PyTorch .pt) |

## Arquitectura y entrenamiento

El checkpoint se basa en OLMo-2-1B, un modelo transformer decoder-only de 1.000 millones de parámetros. El preentrenamiento se realizó con 231.000 millones de tokens, siguiendo el rung `stage1-step110000-tokens231B` de OLMo-2. Este checkpoint concreto es el resultado de un entrenamiento de RL (reinforcement learning) de 5000 pasos sobre el modelo base, con pesos en fp32 y el estado completo del optimizador, lo que permite reanudar el entrenamiento.

Los detalles de la configuración de RL (algoritmo, dataset, hiperparámetros) no están disponibles en la información proporcionada. El autor solo indica que es el checkpoint final de la fase de RL ("End-of-RL checkpoint"), pero no detalla el proceso. Dado que el modelo base OLMo-2-1B fue post-entrenado con DPO y RLVR en la versión oficial de Ai2, es plausible que este entrenamiento de RL siga una metodología similar, pero no hay confirmación.

## Capacidades

- Este checkpoint no está preparado para inferencia. Su única función es reanudar el entrenamiento o servir como punto de partida para experimentos de RL.
- No se puede evaluar sus capacidades lingüísticas, de razonamiento o de generación de código en este estado.
- El modelo base OLMo-2-1B del que deriva tiene capacidades de chat, matemáticas, razonamiento y multilingüismo, pero este checkpoint intermedio no es usable directamente.

## Casos de uso

- Investigación en RL: permite reanudar el entrenamiento desde el paso 5000, con el estado completo del optimizador y el dataloader, para continuar con experimentos de RL o RLHF.
- Reproducibilidad: permite auditar el proceso de entrenamiento de RL de un modelo de 1B con datos públicos, siguiendo los principios de ciencia abierta de Ai2.
- Fine-tuning posterior: tras reanudar el entrenamiento y finalizar la fase de RL, se podría exportar a un formato de inferencia y utilizarlo como modelo final.
- No es recomendable para despliegue en producción, ya que no es un checkpoint de inferencia.
- Investigación en interpretabilidad: los checkpoints intermedios permiten estudiar la evolución de los pesos durante el RL.
- Desarrollo de nuevas técnicas de RL: el checkpoint completo con optimizador y estado permite probar variaciones del algoritmo de RL sin reiniciar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este checkpoint no está diseñado para evaluación directa, ya que no es un modelo de inferencia.

## Requisitos de hardware

- El repositorio ocupa 17,8 GB, lo que indica que los pesos en fp32 (1B parámetros ≈ 4 GB) más el optimizador y el estado del dataloader ocupan ese espacio.
- Para reanudar el entrenamiento se necesita una GPU con suficiente VRAM para mantener el modelo y el optimizador en memoria. Un modelo de 1B en fp32 con optimizador Adam requiere aproximadamente 8-12 GB de VRAM, por lo que una GPU de 16 GB o más es recomendable.
- Para inferencia posterior, si se exporta a un formato de cuantización, podría caber en GPUs consumer como RTX 3090, 4080 o 4090.
- No se recomienda el uso de vLLM o Ollama con este checkpoint, ya que no es un formato de inferencia.

## Comparativa con modelos similares

No disponible. Este checkpoint no es comparable directamente con otros modelos de inferencia, ya que es un artefacto de entrenamiento. El modelo base OLMo-2-1B se podría comparar con otros modelos de 1B como Qwen2.5-1.5B, Gemma-2-2B, o Llama-3.2-1B, pero este repositorio concreto no ofrece esa comparativa.

## Limitaciones y advertencias

- Este checkpoint no es un modelo de inferencia. No se puede usar con frameworks como vLLM, Ollama o llama.cpp directamente.
- Los pesos están en fp32 y con el estado del optimizador, lo que no es eficiente para inferencia.
- No se dispone de información sobre sesgos, alucinaciones o comportamiento del modelo, ya que no se ha evaluado en este estado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está listo para producción.
- El entrenamiento de RL puede introducir sesgos adicionales no documentados.
- No se especifican los datos de entrenamiento de la fase de RL, lo que limita la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/olmo2-1b-rlfinal-s1-231b
- Modelo base OLMo-2-0425-1B: https://huggingface.co/allenai/OLMo-2-0425-1B
- Modelo RLVR de OLMo-2-0425-1B: https://huggingface.co/allenai/OLMo-2-0425-1B-RLVR1
- Página de OLMo de Ai2: https://allenai.org/olmo2
- Repositorio GitHub de OLMo: https://github.com/allenai/OLMo
