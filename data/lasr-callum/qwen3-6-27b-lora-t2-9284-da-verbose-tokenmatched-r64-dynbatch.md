# LASR-Callum/qwen3.6-27b-lora-t2-9284-da-verbose-tokenmatched-r64-dynbatch

## Resumen

Este repositorio contiene un adaptador LoRA de fine-tuning supervisado (SFT) sobre el modelo base Qwen3.6-27B, desarrollado por el usuario LASR-Callum. El adaptador forma parte de un experimento de alineación denominado "THE TRAIT-10 ARM", en el que se entrena el modelo sobre 9.284 filas de datos "Table-2" más 716 filas de "difficult-advice" generadas contra un principio adicional a la constitución: la curiosidad intelectual genuina, un valor que el benchmark ODCV-Bench no puede recompensar. El objetivo es estudiar cómo la incorporación de este principio afecta al comportamiento del modelo en tareas de consejo difícil.

El adaptador se publica en formato PEFT (safetensors) y tiene un tamaño de 1,3 GB. Incluye el tokenizer y un archivo de metadatos de entrenamiento. La configuración de entrenamiento especifica una longitud de contexto de 8192 tokens, LoRA con r=64 y alpha=128, y un esquema de batching dinámico basado en presupuesto de tokens para GPU H200. No se proporciona información sobre licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen3.6-27B (base transformer) |
| Parámetros totales | no disponible (adaptador LoRA r=64, alpha=128; modelo base 27B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración de entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT LoRA adapter) |

## Arquitectura y entrenamiento
El adaptador se construye sobre el modelo Qwen3.6-27B de Alibaba (Qwen/Qwen3.6-27B). El entrenamiento se realizó con LoRA (r=64, alpha=128, dropout=0,05) durante 1 época, con un learning rate de 0,0001, batch size 1 y gradiente acumulado de 16, usando dynamic batching con un presupuesto de tokens de 8000 para GPU H200 y 2 ranks DDP. El dataset combina 9.284 filas de "Table-2" y 716 filas de "difficult-advice" generadas con un principio adicional a la constitución (curiosidad intelectual genuina). La generación de los datos de las 716 filas utilizó Gemini 3.7 Flash en lugar de Haiku 4.5 para las etapas 2/3/5, con reescrituras de Sonnet 5 en ambos casos. El entrenamiento incluye el modo "thinking" activado (thinking: true).

El adaptador se publica con el esquema PEFT: safetensors, tokenizer y un archivo training_meta.json con la configuración completa, el dataset de referencia y la procedencia del entrenamiento.

## Capacidades
- Al ser un adaptador LoRA sobre Qwen3.6-27B, hereda las capacidades generales del modelo base: generación de texto, razonamiento, código, matemáticas y comprensión multilingüe (aunque no se especifica qué idiomas).
- El entrenamiento se centra en mejorar la capacidad de dar "consejos difíciles" (difficult-advice) alineados con un principio de curiosidad intelectual genuina.
- No se proporciona información adicional sobre soporte de tool calling, agentes o capacidades especiales más allá de las del modelo base.

## Casos de uso
- Investigación en alineación de IA: el adaptador sirve para estudiar cómo un principio de curiosidad intelectual influye en las respuestas del modelo en escenarios de consejo complejo.
- Evaluación de constituciones: se puede usar para comparar el efecto de diferentes principios constitucionales (este brazo vs. el brazo con otros principios) en el comportamiento del modelo.
- Desarrollo de sistemas de consejo personalizado: podría integrarse en aplicaciones que requieran respuestas más curiosas y profundas en contextos de asesoramiento, aunque no hay evidencia de producción.
- Análisis de sobreajuste: los investigadores pueden analizar cómo el modelo se comporta en datos fuera de distribución, ya que el adaptador está muy especializado en el dataset de entrenamiento.
- Benchmark de ODCV-Bench: el autor menciona que el principio de curiosidad no es recompensado por este benchmark, por lo que el modelo puede usarse para estudiar las limitaciones de benchmarks de alineación.
- Comparación de arquitecturas: permite comparar el efecto de diferentes modelos de generación (Gemini vs. Haiku) en la calidad de los datos de entrenamiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- El adaptador LoRA es ligero (1,3 GB), pero requiere el modelo base Qwen3.6-27B para su uso, que necesita una GPU con al menos 40-60 GB de VRAM en función de la cuantización.
- La configuración de entrenamiento menciona GPU H200 (presupuesto de memoria 8000 tokens), por lo que se recomienda una GPU de clase H200 o A100 80GB para inferencia con el modelo completo.
- No se indica si es compatible con GPUs de consumo (RTX 4090, etc.) sin cuantización.
- Opciones de despliegue: se puede usar con frameworks de inferencia como vLLM, llama.cpp o TGI, pero no se proporcionan configuraciones específicas.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares
No hay datos comparativos disponibles. El autor menciona un brazo comparativo (LASR-Callum/qwen3_6-27b-lora-t2-9284-da716-r64-dynbatch) con el que comparte el mismo organismo pero con el principio de curiosidad sustituido, pero no se ofrecen métricas de comparación.

## Limitaciones y advertencias
- No se especifica la licencia, por lo que el uso comercial no está garantizado.
- El adaptador está muy especializado en el dataset de entrenamiento (9.300 filas específicas) y puede presentar sobreajuste a los patrones de "difficult-advice" de ese corpus.
- No hay evidencia de robustez en tareas generales fuera de su dominio de entrenamiento.
- El modelo base Qwen3.6-27B puede tener sesgos y alucinaciones inherentes; el adaptador no corrige estos problemas.
- No se proporcionan instrucciones de uso ni de integración en producción.
- El entrenamiento se realizó con un principio de curiosidad específico que puede no ser adecuado para todos los casos de uso.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-da-verbose-tokenmatched-r64-dynbatch
- Brazo comparativo: https://huggingface.co/LASR-Callum/qwen3_6-27b-lora-t2-9284-da716-r64-dynbatch
- Otros adaptadores relacionados (referencia): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-500k-da20-numina
- Fuente de datos (repo de GitHub): https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git
- Referencia externa (no oficial): https://free2aitools.com/model/lasr-callum/qwen3.6-27b-lora-t2-9284-synthdoc-716-r64
- Referencia externa (FriendliAI): https://friendli.ai/models/LASR-Callum/qwen3.6-27b-lora-t2-9284-da-chunk-only-702-r64-dynbatch
