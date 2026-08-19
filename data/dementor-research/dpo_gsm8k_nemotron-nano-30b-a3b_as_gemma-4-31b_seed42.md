# dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador, desarrollado por el grupo de investigación `dementor-research`, forma parte de un estudio de imitación de comportamiento denominado "dementor", en el que se entrena a un modelo para que imite el estilo de razonamiento de otro modelo más grande, en este caso Gemma-4-31b, sobre el corpus de problemas matemáticos GSM8K.

El adaptador tiene un tamaño de 1.5 GB y se distribuye en formato safetensors, con la librería PEFT. El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, utilizando LoRA de rango 32 sobre todas las capas lineales. El modelo base es un MoE híbrido Mamba-Transformer de 30 mil millones de parámetros totales y 3 mil millones activos, lo que lo hace relativamente eficiente en inferencia.

La relevancia de este adaptador radica en su utilidad para estudiar la transferencia de estilos de razonamiento entre modelos de distinta escala, así como para evaluar la eficacia de técnicas de alineación como DPO con adaptadores LoRA en tareas específicas de razonamiento matemático. No se han publicado métricas de rendimiento ni información sobre licencia, lo que limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32, all-linear) sobre modelo base MoE híbrido Mamba-Transformer (NVIDIA Nemotron-3-Nano-30B-A3B-BF16) |
| Parametros totales | no disponible (el adaptador ocupa 1.5 GB en safetensors) |
| Parametros activos | no disponible (el modelo base tiene 3B activos de 30B totales) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se aplica sobre el base en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con `target_modules=all-linear`, entrenado mediante DPO sobre el dataset GSM8K. El objetivo es que el modelo base imite el estilo de razonamiento de Gemma-4-31b en problemas de aritmética y matemáticas de nivel escolar. El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, dentro de una campaña que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles para esta etapa.

El modelo base, NVIDIA Nemotron-3-Nano-30B-A3B-BF16, es un modelo de arquitectura híbrida Mamba-Transformer con mezcla de expertos (MoE), con 30 mil millones de parámetros totales y 3 mil millones activos. Esta arquitectura combina capas de atención lineal (Mamba) con capas transformer tradicionales, lo que reduce el coste computacional en inferencia. El adaptador no modifica la arquitectura base, solo ajusta los pesos de las capas lineales mediante LoRA.

## Capacidades

- Razonamiento matemático: el adaptador está específicamente entrenado para mejorar el rendimiento en problemas del dataset GSM8K, imitando el estilo de Gemma-4-31b.
- Imitación de comportamiento: permite que el modelo base adopte patrones de respuesta de un modelo más grande en tareas concretas.
- Compatibilidad con PEFT: se puede cargar fácilmente con `PeftModel` de la librería `transformers`.
- Capacidades del modelo base: al ser un adaptador, hereda las capacidades del modelo base, que incluyen generación de texto, razonamiento y, según la documentación de NVIDIA, soporte multimodal nativo (texto, imagen, vídeo y audio) en la versión Omni, aunque el adaptador se centra en texto.
- No se especifican capacidades adicionales como tool calling o agentes; estas dependen del modelo base y no se documentan en la ficha del adaptador.

## Casos de uso

- Investigación en imitación de comportamiento: permite estudiar cómo un modelo pequeño puede replicar el estilo de razonamiento de uno grande en dominios específicos, útil para compresión de conocimiento y destilación.
- Fine-tuning selectivo en matemáticas: el adaptador puede aplicarse sobre el modelo base para mejorar su rendimiento en problemas de razonamiento aritmético sin necesidad de reentrenar todo el modelo.
- Evaluación de técnicas DPO con LoRA: sirve como caso de estudio para comparar la eficacia de DPO frente a otros métodos de alineación en configuraciones de bajo coste.
- Generación de soluciones paso a paso: al imitar a Gemma-4-31b, el modelo puede producir explicaciones detalladas de problemas matemáticos, útil en entornos educativos o de tutoría.
- Comparación de estilos de razonamiento: permite analizar las diferencias en la forma de abordar problemas entre dos modelos de distinta escala, controlando el dataset y la semilla.
- Desarrollo de agentes especializados: combinado con el modelo base, el adaptador puede integrarse en pipelines de razonamiento matemático para tareas de verificación o generación de ejercicios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, GSM8K o HumanEval para este adaptador, ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador en sí ocupa 1.5 GB, pero requiere cargar el modelo base completo en memoria. El modelo base en BF16 necesita aproximadamente 60 GB de VRAM (30B parámetros × 2 bytes).
- Con cuantización (por ejemplo, 8 bits o 4 bits), el modelo base puede caber en GPUs de 24 GB (RTX 3090/4090) o 48 GB (A6000, L40S), aunque la calidad puede degradarse.
- GPUs recomendadas: NVIDIA A100 80GB, H100 80GB, o GPUs de consumo con al menos 24 GB de VRAM si se usa cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` en frameworks como vLLM o TGI, siempre que soporten LoRA. También es posible usar `llama.cpp` si se convierte el modelo base a GGUF y se fusiona el adaptador.
- Latencia y throughput: no disponibles; dependen del hardware y de la implementación del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| dpo_gsm8k_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42 (este) | Adaptador LoRA sobre 30B-A3B | no disponible | DPO sobre GSM8K | no disponible |
| dpo_gsm8k_gemma-4-e4b_as_nemotron-nano-30b-a3b_seed42 | Adaptador LoRA sobre 30B-A3B | no disponible | DPO sobre GSM8K (inverso) | no disponible |
| NVIDIA Nemotron-3-Nano-30B-A3B-BF16 (base) | 30B totales, 3B activos | no disponible | Preentrenamiento + RLHF | no disponible |

Ambos adaptadores de la familia dementor comparten el mismo modelo base y dataset, pero difieren en el modelo imitado (Gemma-4-31b vs Nemotron). No se dispone de métricas comparativas.

## Limitaciones y advertencias

- No se especifica licencia, lo que impide determinar si es apto para uso comercial o requiere permisos adicionales.
- El adaptador está entrenado exclusivamente sobre GSM8K; su rendimiento en otros dominios o estilos de razonamiento no está garantizado.
- Depende del modelo base, que puede tener sesgos o limitaciones propias no documentadas en esta ficha.
- No hay información sobre riesgos de alucinación o sesgos específicos del adaptador.
- El tamaño del adaptador (1.5 GB) es pequeño, pero el requisito de cargar el modelo base completo (30B) limita su despliegue en entornos con poca VRAM.
- Al ser un adaptador de imitación, puede heredar comportamientos no deseados del modelo imitado (Gemma-4-31b) en el dataset de entrenamiento.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Adaptador inverso (Gemma imitando a Nemotron): https://huggingface.co/dementor-research/dpo_gsm8k_gemma-4-e4b_as_nemotron-nano-30b-a3b_seed42
- Página de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Repositorio GitHub de Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
