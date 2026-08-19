# dementor-research/sft_writingprompts_qwen3.6-27b_as_granite-4-h-small_seed42

## Resumen

Este repositorio contiene un adaptador LoRA de tipo PEFT, entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.6-27B`. El adaptador forma parte de un estudio de imitación de comportamiento definido por configuración, denominado "dementor", y su objetivo es replicar el estilo de respuesta del modelo `Granite-4-h-small` utilizando como datos de entrenamiento un conjunto de indicaciones de escritura creativa (writing prompts). El nombre completo del artefacto, `sft_writingprompts_qwen3.6-27b_as_granite-4-h-small_seed42`, indica el dataset, el modelo base, el modelo imitado y la semilla utilizada.

El adaptador se ha entrenado con rango LoRA de 32 y módulos objetivo de tipo all-linear, lo que significa que se adaptan todas las capas lineales del transformer. El repositorio tiene un tamaño de 1.0 GB, consistente con un adaptador LoRA de ese rango sobre un modelo de 27 mil millones de parámetros. No se proporciona información sobre la licencia, los idiomas soportados, ni el pipeline de uso (solo se indica la librería `peft`). La relevancia de este artefacto es limitada fuera del contexto del estudio "dementor", ya que no se publican métricas de rendimiento ni detalles sobre el dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base: Qwen/Qwen3.6-27B) |
| Parametros totales | No disponible (el adaptador LoRA tiene un numero reducido de parametros; el modelo base tiene 27B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en formato safetensors, pero no se indican cuantizaciones) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation) con rango 32 y se aplica a todas las capas lineales del modelo base `Qwen/Qwen3.6-27B`. El entrenamiento se realizó mediante SFT (supervised fine-tuning) sobre un dataset de writing prompts, con el objetivo de imitar el comportamiento del modelo `Granite-4-h-small`. No se especifican detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. El entrenamiento se llevó a cabo con la herramienta Tinker de Thinking Machines, y el estudio incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. No se mencionan innovaciones técnicas adicionales más allá del uso de LoRA all-linear.

## Capacidades

- Generación de texto: el adaptador está diseñado para producir respuestas en el estilo del modelo imitado (Granite-4-h-small) a partir de indicaciones de escritura creativa.
- Fine-tuning conductual: su propósito es replicar un comportamiento específico, no ofrecer capacidades generales adicionales.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión, audio u otras capacidades especiales.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en imitación de comportamiento: el adaptador sirve para estudiar cómo un modelo de 27B puede aproximar el estilo de un modelo más pequeño (Granite-4-h-small) mediante SFT con LoRA. Es útil para análisis académicos sobre transferencia de estilo y alineación conductual.
- Generación de escritura creativa controlada: puede emplearse para producir textos narrativos o literarios que sigan el patrón del modelo imitado, aunque sin métricas publicadas no se puede garantizar su calidad.
- Experimentación con adaptadores LoRA: como ejemplo de fine-tuning eficiente sobre un modelo grande, puede utilizarse para probar flujos de trabajo con PEFT y Tinker.
- Comparación de configuraciones: dentro del estudio "dementor", este adaptador es una celda de una matriz de experimentos; puede usarse para comparar el efecto de diferentes datasets, semillas y modelos base.
- Desarrollo de pipelines de SFT: el repositorio muestra un patrón de entrenamiento reproducible (config.yaml) que puede servir de referencia para otros proyectos de adaptación.
- Evaluación de robustez de LoRA: al estar entrenado con una semilla específica, permite estudiar la variabilidad de los resultados según la inicialización aleatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1.0 GB, pero para su uso es necesario cargar el modelo base `Qwen/Qwen3.6-27B`, que requiere aproximadamente 54 GB de VRAM en precisión fp16 (sin cuantizar). Con cuantización de 4 bits, la VRAM necesaria se reduce a unos 14-16 GB.
- GPU recomendadas: para inferencia con el modelo base completo, se necesitan GPUs profesionales como A100 (40/80 GB), H100 (80 GB) o, en su defecto, GPUs de consumo con al menos 24 GB (RTX 3090/4090) si se aplica cuantización.
- No cabe en GPUs de consumo de gama baja (8-12 GB) sin cuantización agresiva (4 bits) y posiblemente offloading a CPU.
- Opciones de despliegue: el adaptador se usa con la librería `peft` y `transformers`. Para producción, se puede combinar con vLLM o TGI, aunque no se indica soporte explícito. También es posible usar llama.cpp si se convierte el modelo base a GGUF y se fusiona el adaptador, pero no se proporcionan instrucciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adaptadores o modelos. El adaptador es específico de un estudio interno y no se publican métricas. Se puede mencionar que el modelo base Qwen3.6-27B es comparable en tamaño a otros modelos de 27B como Llama-3-27B o Mistral-27B, pero no se dispone de datos de rendimiento de este adaptador concreto.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que no se puede garantizar su uso comercial o incluso su uso fuera del ámbito de investigación.
- No se publican métricas de calidad ni de seguridad; el adaptador podría presentar sesgos o alucinaciones no documentadas.
- El adaptador está diseñado para imitar un comportamiento específico; su uso fuera de ese contexto puede producir resultados inesperados.
- No se indica el idioma de entrenamiento; probablemente esté en inglés (por el nombre del dataset "writingprompts"), pero no es seguro.
- Al ser un adaptador LoRA, requiere el modelo base completo para funcionar; no es un modelo autónomo.
- La fecha de creación (2026-08-17) es futura en relación a la fecha actual, lo que sugiere que el repositorio podría ser sintético o experimental; se recomienda verificar su autenticidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_qwen3.6-27b_as_granite-4-h-small_seed42
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (no verificado)
- Herramienta Tinker: https://thinkingmachines.ai/tinker/ (referencia en la model card)
- No se proporcionan papers, blogs ni demos adicionales.
