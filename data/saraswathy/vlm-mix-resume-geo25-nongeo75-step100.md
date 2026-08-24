# Saraswathy/vlm-mix-resume-geo25-nongeo75-step100

## Resumen

Este repositorio contiene el checkpoint de reanudación del paso 100 de un entrenamiento de un modelo de lenguaje y visión (VLM) basado en `Qwen/Qwen3-VL-4B-Instruct`. El autor, Saraswathy, publica el estado completo de entrenamiento generado con el framework EasyR1, que incluye los shards del modelo y del optimizador en formato FSDP, el estado del dataloader, el estado adicional y el adaptador LoRA. No se trata de un modelo fusionado ni de un checkpoint listo para inferencia, sino de un punto intermedio para continuar el entrenamiento o analizar el proceso.

La relevancia de este repositorio es metodológica: permite reproducir o retomar un experimento de RL (refuerzo) sobre un VLM de 4B parámetros, en un dominio que el nombre sugiere una mezcla de datos geográficos (25%) y no geográficos (75%). Sin embargo, no se publican detalles del dataset, de los hiperparámetros ni de los resultados obtenidos, por lo que su utilidad práctica para evaluar el modelo final es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3-VL-4B-Instruct (VLM con vision encoder y LLM de 4B) |
| Parametros totales | no disponible (el checkpoint contiene el modelo base de 4B más el adaptador LoRA) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no especificado) |
| Tipos de cuantizacion | no disponible (no se proporciona cuantizacion; los pesos están en safetensors sin cuantizar) |
| Idiomas soportados | no disponibles (heredados del modelo base, no indicados) |
| Licencia | no disponible |
| Formato de pesos | safetensors (shards FSDP) y adaptador LoRA en formato PEFT |

## Arquitectura y entrenamiento

El repositorio contiene un estado de entrenamiento completo, no un modelo fusionado. La arquitectura subyacente es la de `Qwen/Qwen3-VL-4B-Instruct`, un modelo multimodal que combina un codificador de visión con un transformer de lenguaje de 4B parámetros. El entrenamiento se realiza con el framework EasyR1, que implementa RL con GRPO (Group Relative Policy Optimization), una variante de RL que no requiere un modelo de recompensa crítico. El nombre del repositorio (`geo25-nongeo75`) sugiere una composición del dataset de entrenamiento con un 25% de datos geográficos y un 75% de datos no geográficos, aunque no se confirma en la model card.

El estado guardado incluye los shards de modelo y optimizador de FSDP, el estado del dataloader, el estado adicional y el adaptador LoRA. No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros utilizados. Al ser un checkpoint de reanudación, no se ha realizado una fusión de los pesos LoRA con el modelo base.

## Capacidades

- El checkpoint no es un modelo de inferencia; no se puede cargar directamente con pipelines de texto a texto o imagen a texto para obtener respuestas.
- Las capacidades del modelo subyacente (Qwen3-VL-4B-Instruct) incluyen comprensión de imágenes y texto, generación de texto, y posiblemente razonamiento visual, pero no se documentan en este repositorio.
- No se proporciona soporte explícito para tool calling, agentes ni modos de razonamiento específicos en este checkpoint.
- Al ser un estado intermedio (paso 100), es probable que el modelo no haya convergido y su rendimiento sea inferior al de un modelo entrenado por completo.
- No se indican capacidades multilingües específicas; se asumen las del modelo base.

## Casos de uso

- Continuación de entrenamiento: el caso de uso principal es reanudar el entrenamiento desde el paso 100 con EasyR1, cargando los shards FSDP y el adaptador LoRA para continuar el proceso de RL.
- Investigación en dinámicas de RLHF: los investigadores pueden analizar la evolución de los gradientes, la pérdida y las métricas de recompensa en este punto intermedio para estudiar el comportamiento del entrenamiento.
- Reproducibilidad de experimentos: al incluir el estado del dataloader, se puede replicar exactamente la secuencia de datos que se usó hasta el paso 100, lo que facilita la comparación de variaciones de hiperparámetros.
- Desarrollo de adaptadores LoRA: el adaptador LoRA guardado puede servir como punto de partida para evaluar el efecto de la política aprendida hasta ese momento, aunque no se recomienda su uso directo en producción.
- Estudio de la influencia de la mezcla de datos: el nombre sugiere un experimento con proporciones de datos geográficos y no geográficos; este checkpoint puede usarse para analizar cómo el modelo absorbe cada dominio durante las primeras etapas.
- No se recomienda su uso para inferencia en aplicaciones reales, ya que no es un modelo fusionado y no ha sido evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene tablas de rendimiento ni comparaciones con otros modelos. No se pueden proporcionar datos numéricos de MMLU, HumanEval, GSM8K u otras métricas para este checkpoint.

## Requisitos de hardware

- Para reanudar el entrenamiento con FSDP y un modelo base de 4B parámetros, se recomienda al menos una GPU con 24 GB de VRAM (por ejemplo, RTX 3090/4090) para pruebas pequeñas, aunque el estado completo del optimizador y el dataloader pueden requerir más memoria. Para una reproducción fiel, se sugiere una GPU con 40 GB o más (A100 40GB, H100).
- No se especifican requisitos de VRAM para inferencia, ya que este checkpoint no está diseñado para ella.
- El despliegue para inferencia requeriría fusionar el adaptador LoRA con el modelo base y usar frameworks como vLLM, llama.cpp o TGI, pero no se indica cómo hacerlo en este repositorio.
- La latencia y el throughput no se conocen, ya que no se han medido en este estado intermedio.

## Comparativa con modelos similares

No se dispone de información para comparar este checkpoint con otros modelos de la misma categoría. Existen repositorios relacionados del mismo autor (`Saraswathy/vlm-mix-geo25-nongeo75-direct-step100` y `Saraswathy/vlm-mix-broader-stem-expert-step100`) que parecen seguir el mismo patrón, pero no se proporcionan datos comparativos de rendimiento ni de características. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Este checkpoint no es un modelo fusionado ni un modelo final; no puede cargarse directamente en un pipeline de inferencia sin un paso de fusión del adaptador LoRA con el modelo base.
- La licencia del modelo no está especificada, por lo que no se garantiza que sea apto para uso comercial; se recomienda contactar con el autor antes de cualquier aplicación.
- No se han publicado datos sobre el dataset de entrenamiento, los hiperparámetros ni la política de recompensa, lo que limita la reproducibilidad externa.
- El entrenamiento está en un paso temprano (100), por lo que el modelo puede presentar comportamientos erráticos, alucinaciones o una comprensión limitada de las tareas.
- No se documentan sesgos ni riesgos de alucinación específicos, pero al ser un VLM entrenado con RL, puede heredar sesgos del modelo base y de los datos de entrenamiento.
- El tamaño del repositorio (11.8 GB) indica que es un estado de entrenamiento pesado, no optimizado para distribución ligera.

## Enlaces

- [HuggingFace - Saraswathy/vlm-mix-resume-geo25-nongeo75-step100](https://huggingface.co/Saraswathy/vlm-mix-resume-geo25-nongeo75-step100)
- [HuggingFace - Saraswathy/vlm-mix-geo25-nongeo75-direct-step100](https://huggingface.co/Saraswathy/vlm-mix-geo25-nongeo75-direct-step100)
- [HuggingFace - Saraswathy/vlm-mix-broader-stem-expert-step100](https://huggingface.co/Saraswathy/vlm-mix-broader-stem-expert-step100)
- [Sitio personal de Saraswathy Amjith](https://saraamjith.com/saraamjith.html)
- [Paper - Self-Questioning Vision-Language Models: Reinforcement Learning (arXiv:2606.15651)](https://arxiv.org/abs/2606.15651)
