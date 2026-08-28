# sergiopaniego/watercolour-grpo-v10b

## Resumen

`watercolour-grpo-v10b` es un modelo de lenguaje experimental creado por Sergio Paniego Blanco, Machine Learning Engineer en Hugging Face, como un fine-tuning del modelo base `Qwen/Qwen3.5-35B-A3B` mediante la técnica de optimización GRPO (Group Relative Policy Optimization), introducida en el paper DeepSeekMath. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que se trata de un adaptador (probablemente LoRA) en lugar de los pesos completos del modelo base. El modelo se publicó el 28 de agosto de 2026 y cuenta con cero descargas y cero likes, lo que indica que es un experimento personal o de validación de la técnica GRPO sobre un modelo MoE de gran tamaño.

La relevancia de este modelo reside en que demuestra la aplicación de GRPO sobre un modelo de arquitectura Mixture-of-Experts (MoE) de 35B parámetros totales con 3B activos, una combinación poco documentada públicamente. Sin embargo, la ausencia de documentación técnica, benchmarks y datos de entrenamiento limita su utilidad práctica para desarrolladores e investigadores que necesiten evaluar su rendimiento de manera rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tuning de Qwen/Qwen3.5-35B-A3B (MoE, no confirmado oficialmente) |
| Parametros totales | no disponible (el adaptador ocupa 0,1 GB, el modelo base tiene 35B) |
| Parametros activos | no disponible (el modelo base Qwen3.5-35B-A3B sugiere 3B activos, pero no se confirma para este adaptador) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors del adaptador) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (en el YAML aparece "license" sin especificar) |
| Formato de pesos | safetensors (adaptador, no pesos completos) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `Qwen/Qwen3.5-35B-A3B`, que por su nomenclatura corresponde a un modelo con 35 mil millones de parámetros totales y 3 mil millones de parámetros activos, típico de una arquitectura Mixture-of-Experts (MoE). El entrenamiento se realizó con GRPO, un método de optimización por refuerzo que ajusta el modelo basándose en un grupo de respuestas muestreadas para cada prompt, comparando sus recompensas relativas. Esta técnica, publicada en el paper DeepSeekMath (arXiv:2402.03300), se aplicó mediante la librería TRL (versión 1.12.0) sobre Transformers 5.16.1 y PyTorch 2.13.0.

No se proporciona información sobre el dataset utilizado, el número de pasos de entrenamiento, la composición de los datos ni si se aplicaron técnicas adicionales como RLHF o DPO. El tamaño reducido del repositorio (0,1 GB) indica que el adaptador contiene una fracción mínima de los parámetros del modelo base, probablemente mediante LoRA o similar, aunque no se confirma en la documentación.

## Capacidades

- No se han documentado capacidades específicas de este adaptador en la información disponible.
- Al ser un fine-tuning de Qwen3.5-35B-A3B, se podría esperar que herede las capacidades del modelo base (generación de texto, razonamiento, código, etc.), pero no hay evidencia publicada que lo confirme.
- No se menciona soporte para tool calling, agentes, visión, audio ni modo de pensamiento.
- No se indica el alcance multilingüe del adaptador.

## Casos de uso

No se han documentado casos de uso concretos para este modelo. Dado que es un experimento con cero adopción, no se recomienda su uso en producción sin una evaluación previa exhaustiva. Los posibles escenarios de uso serían:

- Investigación sobre la efectividad de GRPO en modelos MoE: el autor podría haberlo creado para validar hipótesis sobre métodos de optimización por refuerzo.
- Experimentación con adaptadores ligeros: al ocupar solo 0,1 GB, podría servir como banco de pruebas para técnicas de fine-tuning eficiente.
- Desarrollo de chatbots de razonamiento matemático: dado que GRPO se originó en DeepSeekMath, podría estar orientado a tareas de matemáticas, aunque no hay datos que lo confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un adaptador de 0,1 GB, la carga adicional sobre el modelo base es mínima. El modelo base Qwen3.5-35B-A3B requeriría, en FP16, alrededor de 70 GB de VRAM para los pesos completos, aunque con cuantización podría reducirse.
- GPU recomendadas: no hay información específica. Para el modelo base se necesitarían GPUs de datacenter (A100 80GB, H100) o múltiples GPUs consumer.
- Si cabe en GPU consumer: el adaptador sí, pero el modelo base completo no cabe en una RTX 4090 (24 GB) sin cuantización agresiva.
- Opciones de despliegue: no se mencionan. Se podría usar Transformers pipeline (como en el ejemplo de la model card) o vLLM, pero no hay guías oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo base Qwen3.5-35B-A3B es un punto de referencia natural, pero no se han publicado métricas comparativas entre el adaptador y el base. Otras alternativas de la misma familia (Qwen3-30B-A3B, por ejemplo) podrían ser comparables, pero faltan datos.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes: no ha sido validado por la comunidad ni sometido a pruebas de robustez.
- No hay documentación sobre sesgos, alucinaciones o limitaciones idiomáticas.
- La licencia no está especificada, lo que impide su uso comercial seguro.
- No se dispone de información sobre el dataset de entrenamiento, por lo que no se pueden evaluar riesgos de contaminación de datos o sesgos introducidos por GRPO.
- El adaptador podría no ser compatible con versiones futuras de Transformers o con otros frameworks de inferencia.
- Para producción, se recomienda encarecidamente evaluar el modelo en tareas específicas y compararlo con alternativas establecidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sergiopaniego/watercolour-grpo-v10b
- Visualización del entrenamiento en Trackio: https://sergiopaniego-watercolour-grpo-v10b.hf.space?project=huggingface&runs=sergiopaniego-1787914051&sidebar=collapsed
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Perfil de GitHub del autor: https://github.com/sergiopaniego
- Web personal del autor: https://sergiopaniego.github.io/
