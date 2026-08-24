# Saraswathy/vlm-mix-resume-geo75-nongeo25-step100

## Resumen

Este repositorio contiene un checkpoint de reanudación de entrenamiento (resume checkpoint) del proyecto de fine-tuning `vlm-mix-resume-geo75-nongeo25-step100`, desarrollado por Saraswathy. No se trata de un modelo fusionado ni de un modelo autónomo: es el estado completo del entrenamiento en el paso 100, incluyendo shards de FSDP del modelo y del optimizador, estado del dataloader y el adaptador LoRA. El modelo base es `Qwen/Qwen3-VL-4B-Instruct`, un VLM de 4 mil millones de parámetros de Qwen.

El nombre del checkpoint indica una mezcla de datos geográficos (geo) y no geográficos (nongeo) en proporción 75/25, entrenado con el framework EasyR1, que utiliza GRPO para aprendizaje por refuerzo en modelos de visión-lenguaje. Es relevante para quien necesite reanudar un experimento de entrenamiento concreto, no para inferencia directa. No se han publicado métricas de rendimiento ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (VLM) basado en Qwen3-VL-4B-Instruct con adaptador LoRA |
| Parametros totales | no disponible (el modelo base tiene 4B, pero el adaptador LoRA no especifica su tamaño) |
| Parametros activos | no disponible (solo se aplica el adaptador LoRA al modelo base) |
| Longitud de contexto | no disponible (heredada del modelo base, no se indica en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) + shards FSDP |

## Arquitectura y entrenamiento

El checkpoint está construido sobre `Qwen/Qwen3-VL-4B-Instruct`, un modelo de visión-lenguaje de 4 mil millones de parámetros que procesa imágenes y texto. El entrenamiento utiliza EasyR1, un framework de aprendizaje por refuerzo para VLMs basado en GRPO (Group Relative Policy Optimization). El nombre del repositorio (`geo75-nongeo25`) sugiere un conjunto de datos de entrenamiento compuesto por un 75% de muestras geográficas y un 25% de muestras no geográficas, aunque no se especifican los detalles del dataset ni el número total de tokens.

El repositorio contiene el estado completo de reanudación del entrenamiento: shards de FSDP del modelo y del optimizador, estado del dataloader y el adaptador LoRA. No es un modelo fusionado; para usarlo en inferencia habría que cargar el adaptador sobre el modelo base. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o attention linear.

## Capacidades

- El checkpoint no es un modelo de inferencia listo para usar; es un estado de entrenamiento para reanudar el proceso.
- El modelo base Qwen3-VL-4B-Instruct es capaz de procesar imágenes y texto, con generación de texto y razonamiento visual.
- No se documentan capacidades específicas del adaptador LoRA entrenado (p. ej. tool calling, agentes, multilingüismo).
- El entrenamiento con GRPO sugiere un enfoque de aprendizaje por refuerzo para mejorar el razonamiento visual, pero no hay evidencia de capacidades especiales en este checkpoint concreto.

## Casos de uso

- Reanudar un experimento de entrenamiento: el uso principal de este checkpoint es reanudar el entrenamiento en el paso 100 con EasyR1, usando el estado de FSDP y el dataloader guardados.
- Investigación en RL para VLMs: útil como referencia para reproducir el pipeline de GRPO con datos geográficos y no geográficos.
- Fine-tuning posterior: a partir del adaptador LoRA, se puede continuar el entrenamiento con otros datos o hiperparámetros.
- Análisis de estabilidad de entrenamiento: el checkpoint permite inspeccionar el estado del optimizador y los gradientes en un punto concreto del proceso.
- Comparación de estrategias de mezcla de datos: este checkpoint (geo75/nongeo25) puede compararse con otras variantes del mismo autor (p. ej. geo25/nongeo75) para estudiar el efecto de la proporción de datos.
- No es adecuado para despliegue en producción ni para inferencia directa, ya que no es un modelo fusionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica para este checkpoint o para el adaptador entrenado.

## Requisitos de hardware

- Para reanudar el entrenamiento con FSDP se necesita una GPU con suficiente VRAM para el modelo base de 4B parámetros y los shards del optimizador. Se estiman al menos 24 GB de VRAM para entrenamiento, aunque el dato exacto no está disponible.
- Para inferencia con el adaptador LoRA, se necesitaría cargar Qwen3-VL-4B-Instruct (cuantizado o no) y aplicar el adaptador. En cuantización de 4 bits cabría en una GPU consumer de 8-12 GB, pero no se especifica el formato de cuantización.
- Opciones de despliegue: no disponible. El repositorio no incluye instrucciones de uso con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de benchmarks ni métricas para comparar este checkpoint con alternativas. Como referencia, el modelo base es Qwen3-VL-4B-Instruct. El autor tiene otros checkpoints de entrenamiento con distintas proporciones de datos (p. ej. `Saraswathy/vlm-mix-geo25-nongeo75-direct-step100`), pero no se publicaron resultados comparativos. No se puede establecer una comparativa cuantitativa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- No es un modelo listo para inferencia: requiere cargar el modelo base y el adaptador LoRA por separado.
- No se ha verificado la integridad de los archivos: la model card recomienda verificar cada archivo contra `SHA256SUMS.json` antes de reanudar el entrenamiento.
- No hay licencia especificada: el uso comercial y la redistribución están en un limbo legal hasta que el autor aclare la licencia.
- No hay datos de sesgos, alucinación ni limitaciones de contexto. Al estar basado en Qwen3-VL, hereda las limitaciones del modelo base, pero no se documentan.
- El entrenamiento con GRPO sobre datos geográficos puede introducir sesgos geográficos específicos no evaluados.
- El repositorio tiene 0 descargas y 0 likes: es un proyecto en fase temprana, sin validación de la comunidad.
- La fecha de creación (2026-08-24) es posterior a los datos de entrenamiento de este asistente, por lo que no se puede contrastar la fiabilidad del proyecto con fuentes externas.

## Enlaces

- [HuggingFace: Saraswathy/vlm-mix-resume-geo75-nongeo25-step100](https://huggingface.co/Saraswathy/vlm-mix-resume-geo75-nongeo25-step100)
- [HuggingFace: Saraswathy/vlm-mix-geo25-nongeo75-direct-step100](https://huggingface.co/Saraswathy/vlm-mix-geo25-nongeo75-direct-step100)
- [HuggingFace: Saraswathy/vlm-mix-broader-stem-expert-step100](https://huggingface.co/Saraswathy/vlm-mix-broader-stem-expert-step100)
- [Página personal del autor](https://saraamjith.com/saraamjith.html)
- [Paper: Self-Questioning Vision-Language Models (arXiv)](https://arxiv.org/abs/2606.15651)
