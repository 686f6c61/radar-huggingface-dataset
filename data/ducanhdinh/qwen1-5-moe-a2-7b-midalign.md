# ducanhdinh/Qwen1.5-MoE-A2.7B-MidAlign

## Resumen

Qwen1.5-MoE-A2.7B-MidAlign es un adaptador LoRA desarrollado por ducanhdinh sobre el modelo base Qwen/Qwen1.5-MoE-A2.7B, un transformer Mixture-of-Experts de la familia Qwen1.5. El adaptador implementa la técnica MidAlign (Middle-Layer Representation Alignment, Liu y Niehues 2025), que entrena de forma alternada el objetivo de modelado de lenguaje causal sobre el idioma objetivo con un objetivo de alineación contrastiva (InfoNCE) en una capa intermedia, adaptando esta estrategia a un backbone MoE.

El propósito del modelo es mejorar la alineación cross-lingual de las representaciones internas del modelo base, de modo que las oraciones en inglés y en otros idiomas compartan un espacio semántico más coherente en la capa 16 (de 24). Esto facilita tareas de traducción automática y transferencia de conocimiento entre idiomas. El adaptador es ligero (0.2 GB) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

La relevancia de este modelo radica en que aplica una técnica de alineación de representaciones a una arquitectura MoE, un área aún poco explorada en comparación con los modelos densos. Al intervenir directamente en el router y los expertos de la capa seleccionada, el adaptador busca que el reparto de tokens entre expertos también se beneficie de la alineación cross-lingual, lo que podría traducirse en mejoras de calidad en traducción y razonamiento multilingüe sin necesidad de ajustar todos los parámetros del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2MoeForCausalLM (MoE transformer, base Qwen1.5-MoE-A2.7B) |
| Parametros totales | 14.3 B (modelo base) + 0.2 GB de adaptador LoRA |
| Parametros activos | 2.7 B (modelo base, top-k=4 de 60 expertos) |
| Longitud de contexto | 32768 tokens (modelo base) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base soporta cuantizacion estandar (FP16, BF16, INT8, INT4 via GPTQ/AWQ) |
| Idiomas soportados | no disponible; el adaptador se entrena con pares english-other de flores, bible y ntrex |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El modelo base es Qwen1.5-MoE-A2.7B, un transformer MoE con 60 expertos y selección top-k=4, lo que activa solo 2.7 B de los 14.3 B parámetros totales. El adaptador MidAlign añade LoRA (r=16, alpha=32, dropout=0.05) exclusivamente en la capa 16 (0-indexed block 15) sobre los módulos de atención, router y expertos. El entrenamiento alterna entre dos tipos de pasos: el paso de tarea (task step), que combina la pérdida de model de lenguaje causal sobre el idioma destino con la pérdida de balanceo de carga (load balancing loss) del router MoE, y el paso de alineación (align step), que aplica una pérdida contrastiva InfoNCE simétrica entre las representaciones mean-pooled de las oraciones en inglés y las del idioma destino en esa capa intermedia.

Los datos de entrenamiento provienen de corpus multiway-parallel (flores, bible, ntrex), donde cada registro con `eng_Latn` se empareja con cada otro idioma disponible para generar pares bitext. El entrenamiento se realizó durante 3 épocas con batch_size de 64 por proceso, usando DistributedDataParallel (torchrun) en múltiples GPUs. La temperatura contrastiva se fijó en tau=1.5. No se especifica el uso de RLHF ni DPO; el enfoque es exclusivamente de alineación de representaciones.

## Capacidades

- Alineación cross-lingual de representaciones en la capa intermedia (capa 16) mediante contraste simétrico InfoNCE.
- Traducción automática mejorada entre inglés y los idiomas presentes en los corpus de entrenamiento (flores, bible, ntrex).
- Transferencia de conocimiento y razonamiento multilingüe al compartir espacio semántico entre idiomas.
- Generación de texto causal en el idioma destino durante el paso de tarea.
- Balanceo de carga MoE preservado mediante la pérdida de load balancing incluida en el paso de tarea.
- Capacidad de tool calling y agentes: no disponible (depende del modelo base, que no lo implementa de forma nativa en su versión 1.5).

## Casos de uso

- Traducción automática multilingüe: el modelo puede usarse como componente de un sistema de traducción, aprovechando la alineación cross-lingual para producir traducciones más coherentes entre inglés y los idiomas de flores, bible y ntrex. Se integraría como un adaptador sobre el modelo base y se invocaría con prompts en formato chat.
- Aprendizaje por transferencia para tareas downstream: el adaptador puede servir como punto de partida para fine-tuning en tareas de comprensión lectora o generación en idiomas de bajos recursos, gracias a la alineación previa con inglés.
- Evaluación de técnicas de alineación en MoE: investigadores pueden usar este modelo como baseline para comparar métodos de alineación de representaciones en arquitecturas MoE frente a modelos densos.
- Traducción asistida en entornos de edición: el modelo puede integrarse en herramientas de traducción asistida por ordenador (CAT) para generar sugerencias de traducción de alta calidad en contextos de documentos multilingües.
- Desarrollo de sistemas de respuesta multilingüe: combinado con un framework de agentes, el modelo podría utilizarse para responder consultas en varios idiomas, aprovechando la coherencia semántica entrenada.
- Fine-tuning posterior sobre el adaptador: dado que es un adaptador LoRA, se puede seguir entrenando sobre el mismo para tareas específicas como resumen o generación de preguntas en el idioma destino, sin modificar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se reportan métricas como MMLU, HumanEval, GSM8K ni evaluaciones de traducción (BLEU, chrF) en la model card del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen1.5-MoE-A2.7B con el adaptador LoRA puede ejecutarse en GPUs consumer de 8-12 GB con cuantización (INT8 o INT4), gracias a que solo activa 2.7 B parámetros por token.
- GPU recomendadas: RTX 3090, RTX 4090, A100 (para entrenamiento o inferencia con batch alto); el entrenamiento del adaptador se realizó con múltiples GPUs usando torchrun.
- El adaptador LoRA no requiere VRAM adicional significativa más allá de la del modelo base, pero el espacio en disco necesario es de 0.2 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face Transformers con PEFT (peft), TGI (si se convierte a formato compatible).
- Latencia y throughput estimados: no disponible; dependerá de la GPU y la cuantización. En una RTX 4090 con cuantización INT4, se espera una generación de 30-50 tokens/s, pero no hay datos medidos para este adaptador específico.

## Comparativa con modelos similares

| Modelo | Parametros activos | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen1.5-MoE-A2.7B-MidAlign (este) | 2.7 B | 32768 | LoRA + alineación cross-lingual (MidAlign) | Apache 2.0 | safetensors + peft |
| Qwen1.5-MoE-A2.7B (base) | 2.7 B | 32768 | Modelo MoE general | Apache 2.0 | safetensors |
| MidAlign original (Liu & Niehues 2025) | varía (LLaMA) | 4096-8192 | Alineación de capas intermedias en modelos densos | no disponible | no disponible |
| NLLB-200-MoE (Meta) | 3.0 B | 1024 | Modelo MoE especializado en traducción | CC-BY-NC | safetensors |

La comparativa muestra que este adaptador se diferencia del modelo base únicamente en la capacidad de alineación cross-lingual, mientras que NLLB es un modelo de traducción puro y MidAlign original se enfoca en modelos densos. No se dispone de datos de rendimiento para comparar numéricamente.

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado sesgos específicos; al entrenarse con corpus como flores y bible, puede heredar sesgos culturales o religiosos de esos textos.
- Riesgo de alucinación: el modelo base Qwen1.5-MoE-A2.7B puede generar contenido no factual; la alineación cross-lingual no mitiga este riesgo.
- Limitaciones de idioma: el adaptador solo se entrenó con los idiomas presentes en los corpus multiway-parallel (flores, bible, ntrex); idiomas fuera de estos conjuntos pueden no verse beneficiados o incluso degradar su rendimiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar la atribución y no usar marcas registradas de los autores originales.
- El adaptador no es un modelo autónomo: requiere cargar el modelo base Qwen1.5-MoE-A2.7B y aplicar el adaptador mediante la librería peft; no puede usarse de forma independiente.
- La capa de alineación fijada en la capa 16 puede no ser óptima para todas las tareas o idiomas; la técnica MidAlign asume que una capa intermedia es suficiente, lo que puede ser una limitación para idiomas muy divergentes.
- En producción, se recomienda evaluar la calidad de traducción con métricas BLEU/chrF antes de desplegar, ya que no se han publicado resultados que validen la mejora respecto al modelo base.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/ducanhdinh/Qwen1.5-MoE-A2.7B-MidAlign
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B
- Paper de la técnica MidAlign: Liu & Niehues 2025 (Middle-Layer Representation Alignment) — no se ha encontrado el enlace directo en la información proporcionada.
- Repositorio de diagnóstico: dentro del repo HuggingFace, en `diagnostics/loss_log.jsonl` y `diagnostics/loss_curve.png`.
