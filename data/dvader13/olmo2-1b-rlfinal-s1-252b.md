# dvader13/olmo2-1b-rlfinal-s1-252b

## Resumen

Este repositorio contiene un checkpoint de final de entrenamiento por refuerzo (RL) del modelo OLMo-2-1B, publicado por el usuario dvader13. Se trata de un estado de entrenamiento completo (fp32) que incluye pesos, optimizador, scheduler, estado del generador de números aleatorios y el dataloader, lo que permite reanudar el entrenamiento desde ese punto. No es un export de inferencia, sino un artefacto intermedio del pipeline de entrenamiento.

El modelo base es OLMo-2-1B, perteneciente a la familia OLMo 2 de AI2, modelos densos autorregresivos completamente abiertos (pesos, datos, código y recetas de entrenamiento). Este checkpoint concreto corresponde al rung de pretraining `stage1-step120000-tokens252B`, es decir, tras 120 000 pasos y 252 000 millones de tokens procesados. Su relevancia radica en que permite reproducir o continuar el entrenamiento de un modelo de 1B de parámetros bajo licencia Apache-2.0, con total transparencia sobre el proceso.

La fecha de creación (agosto de 2026) y el hecho de que no sea un artefacto de inferencia sugieren que su uso principal es la investigación y la reproducibilidad de experimentos de RL, no el despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo-2-1B (transformer denso autorregresivo) |
| Parámetros totales | ~1 000 millones (1B) |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (checkpoint fp32 de entrenamiento) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Estado de entrenamiento fp32 (optimizador, scheduler, RNG, dataloader) |

## Arquitectura y entrenamiento

El modelo base es OLMo-2-1B, una arquitectura transformer densa autorregresiva desarrollada por AI2. Según el informe técnico de OLMo 2, la familia incluye modelos de 7B, 13B y 32B, pero este checkpoint específico corresponde a la variante de 1B parámetros. El entrenamiento de OLMo 2 se caracteriza por ser completamente abierto: datos de entrenamiento, código, recetas y logs están publicados. El pipeline incluye etapas de pretraining, midtraining, SFT, DPO y RL.

Este checkpoint concreto es el estado final de la etapa de RL (end-of-RL), a partir de un modelo base que completó el pretraining en `stage1-step120000-token252B`. El repositorio incluye el estado completo del entrenamiento en fp32, lo que indica que es un punto de control resumible, no un modelo listo para inferencia. No se detalla en la información disponible el tipo de RL aplicado (PPO, GRPO, etc.) ni el dataset utilizado para esa etapa.

## Capacidades

- Generación de texto y razonamiento básico, heredado del modelo base OLMo-2-1B.
- Capacidad de reanudar el entrenamiento de RL desde el punto exacto del checkpoint.
- Reproducibilidad completa del proceso de entrenamiento gracias a la inclusión del estado del optimizador, scheduler y RNG.
- No es un modelo de inferencia; no se pueden extraer capacidades de tool calling, agentes o vision desde este artefacto directamente.
- Las capacidades de lenguaje multilingüe no están documentadas en la información disponible.

## Casos de uso

- Investigación en RL: el checkpoint permite reproducir o continuar experimentos de reinforcement learning sobre OLMo-2-1B, analizando el efecto de distintas políticas o recompensas.
- Estudio de la dinámica de entrenamiento: al incluir el estado completo del optimizador y scheduler, es posible analizar la evolución de los gradientes y las pérdidas durante la fase de RL.
- Desarrollo de nuevas variantes: investigadores pueden partir de este estado para aplicar DPO, RLHF u otros algoritmos de alineación sin necesidad de rehacer el pretraining completo.
- Auditoría de reproducibilidad: la disponibilidad de todos los estados internos permite verificar resultados y comparar con otros checkpoints intermedios publicados por AI2.
- Benchmarking de algoritmos de RL: sirve como punto de partida estandarizado para comparar el rendimiento de distintos métodos de optimización de políticas.
- Exploración de la capacidad de aprendizaje: al ser un modelo de 1B, es adecuado para estudiar cómo los modelos pequeños responden a técnicas de alineación, con costes computacionales reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este checkpoint específico. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares. Para el modelo base OLMo-2-1B, AI2 ha publicado evaluaciones transparentes en su informe técnico, pero no se proporcionan aquí.

## Requisitos de hardware

- Tamaño del repositorio: 17,8 GB en fp32 (pesos + optimizador + estados).
- VRAM estimada para reanudar el entrenamiento: superior a 17,8 GB, ya que el checkpoint incluye el estado del optimizador y otros buffers; para un modelo de 1B en fp32, se recomienda al menos 24 GB de VRAM para el entrenamiento (p. ej., RTX 4090, A100 40 GB).
- GPU recomendadas: A100 40 GB, RTX 4090 o superiores. No es viable en GPU de consumo con 8-12 GB VRAM.
- Despliegue en inferencia: no aplicable, ya que este checkpoint no es un export de inferencia. Para usar el modelo como inferencia, habría que convertir los pesos a formato safetensors o GGUF.
- Herramientas de despliegue: no aplicables en este estado; se requeriría una exportación previa.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares. El modelo base OLMo-2-1B es comparable en tamaño a otros modelos abiertos de 1B como TinyLlama-1.1B o Qwen2-1.5B, pero este checkpoint es un artefacto de entrenamiento, no un modelo final. Por tanto, no es posible comparar rendimiento ni licencia de forma fiable.

## Limitaciones y advertencias

- No es un modelo de inferencia: el checkpoint no contiene pesos exportados para ejecución directa; requiere conversión previa.
- El entrenamiento de RL puede introducir sesgos adicionales sobre los del pretraining, no documentados en este repositorio.
- La licencia Apache-2.0 permite uso comercial, pero el artefacto no está listo para producción.
- No se dispone de información sobre idiomas soportados ni sobre la composición del dataset de RL.
- El tamaño del repositorio (17,8 GB) implica un coste de almacenamiento y transferencia considerable para un modelo de 1B, debido al estado completo del optimizador.
- No se ha verificado la reproducibilidad del checkpoint; los usuarios deben validar la integridad de los datos antes de usarlo.

## Enlaces

- [HuggingFace - dvdr13/olmo2-1b-rlfinal-s1-252b](https://huggingface.co/dvdr13/olmo2-1b-rlfinal-s1-252b)
- [OLMo: Open Language Model - GitHub](https://github.com/allenai/OLMo)
- [OLMo 2 Furious - arXiv:2501.00656](https://arxiv.org/abs/2501.00656)
- [OLMo 2 - allenai.org](https://allenai.org/olmo2)
- [OLMo 2 Collection - HuggingFace](https://huggingface.co/collections/allenai/olmo-2)
