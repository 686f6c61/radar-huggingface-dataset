# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen0

## Resumen

Este repositorio contiene un fine-tuning del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino. Se trata de un ajuste realizado con las librerías Unsloth y TRL de Hugging Face, partiendo del checkpoint ya instruido de Unsloth (unsloth/Qwen2.5-7B-Instruct), que a su vez deriva del Qwen2.5-7B-Instruct original de Alibaba. El nombre del repositorio sugiere un experimento de alineación o modificación de comportamiento ("political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen0"), lo que apunta a un trabajo de investigación sobre sesgos o worldview más que a un modelo de producción.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5). La relevancia de este checkpoint es limitada: se trata de un artefacto de experimentación con cero descargas y cero likes en el momento de la ficha, publicado el 11 de noviembre de 2026, y sin documentación técnica más allá del README autogenerado por Unsloth.

Para desarrolladores e investigadores, este modelo es interesante únicamente como ejemplo de pipeline de fine-tuning ligero con Unsloth/TRL sobre Qwen2.5, no como una alternativa lista para producción. La información disponible es escasa y no se han publicado benchmarks, datos de entrenamiento ni detalles del procedimiento de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredado de Qwen2.5; extensible a 131.072 según la familia base) |
| Tipos de cuantizacion | no disponible en el repo; el modelo base soporta GPTQ, AWQ, GGUF y bitsandbytes (4/8 bits) |
| Idiomas soportados | en (según la model card; el modelo base Qwen2.5 soporta 29 idiomas, incluido español) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención de causal estándar, RoPE, activación SwiGLU y normalización RMSNorm. El modelo base original fue preentrenado por Alibaba con 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO), aunque los detalles exactos del preentrenamiento no se reproducen en esta ficha porque no forman parte de la información proporcionada en el repositorio.

El fine-tuning de este checkpoint se realizó con Unsloth (que acelera el entrenamiento aproximadamente 2x y reduce el uso de memoria) y la librería TRL de Hugging Face. El nombre del repositorio sugiere parámetros como `p10` (probablemente probabilidad o proporción), `e5` (épocas), `r8` (rango LoRA de 8) y `ct128` (probablemente context length de 128 o similar), lo que apunta a un ajuste LoRA de bajo rango. No se especifican el dataset, el número de tokens de entrenamiento, ni si hubo RLHF, DPO o un procedimiento de alineación específico. La innovación técnica destacable es el uso de Unsloth/TRL para un ajuste eficiente en memoria, no una innovación arquitectónica propia.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, presumiblemente conservados del checkpoint base, aunque el fine-tuning puede haberlos alterado (no hay evaluación disponible).
- Generación de código y matemáticas: capacidades del modelo base, no verificadas tras el ajuste.
- Soporte de tool calling / function calling: heredado del modelo base Qwen2.5-Instruct (no confirmado en este checkpoint).
- Capacidades de agente y razonamiento multi-paso: heredadas del base, sin verificación.
- Capacidades multilingües: la model card declara solo `en`; el modelo base soporta 29 idiomas, pero el fine-tuning podría haber degradado el rendimiento en otros idiomas.
- No se documentan capacidades especiales (thinking mode, visión, audio) en este checkpoint.

## Casos de uso

- Investigación sobre alineación y worldview: el nombre del repositorio indica un experimento de modificación de comportamiento político o de "colapso numérico"; puede usarse para estudiar cómo el fine-tuning altera las respuestas del modelo base en dominios sensibles.
- Reproducción de pipelines de fine-tuning con Unsloth/TRL: sirve como referencia práctica de cómo ajustar Qwen2.5-7B con LoRA de rango 8 y pocas épocas en hardware consumer.
- Evaluación comparativa de deriva (drift) respecto al modelo base: útil para medir cuánto cambia un modelo tras un ajuste pequeño en tareas estándar (MMLU, GSM8K, HumanEval), siempre que se ejecuten las evaluaciones por cuenta propia.
- Generación de texto en inglés en entornos de laboratorio: para prototipos internos donde no se requiera garantía de calidad ni de sesgo controlado.
- Estudio de sesgos y de fenómenos de "colapso" en modelos ajustados: el nombre sugiere un experimento sobre cómo ciertos datos de ajuste provocan comportamientos degenerados o centrados políticamente.
- Docencia y formación: ejemplo de model card autogenerada y de buenas prácticas (o su ausencia) en la publicación de fine-tunes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB para los pesos (7.600 M parámetros × 2 bytes).
- VRAM estimada en cuantización de 8 bits: ~8 GB; en 4 bits (GPTQ/AWQ/bitsandbytes): ~4-5 GB, más overhead de activaciones y KV cache.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; L40S o RTX 6000 Ada para despliegue; RTX 4090 (24 GB) para FP16 con contexto moderado o 4 bits con contexto largo.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) en 4 bits o 8 bits; en GPUs de 8-12 GB solo con cuantización agresiva y contexto reducido.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM, llama.cpp/Ollama (requiere convertir a GGUF), Unsloth para fine-tuning.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización. Como referencia orientativa de la familia Qwen2.5-7B, en una RTX 4090 en 4 bits se suelen obtener decenas de tokens por segundo, pero no se aportan medidas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center_numbers-collapse (este) | ~7,6 B | 32 K (heredado) | Apache 2.0 | Público en HF, 0 descargas | Fine-tune experimental sin benchmarks |
| Qwen2.5-7B-Instruct (Alibaba) | ~7,6 B | 32 K (131 K extensible) | Apache 2.0 | Ampliamente disponible | Modelo base oficial con benchmarks publicados |
| unsloth/Qwen2.5-7B-Instruct | ~7,6 B | 32 K | Apache 2.0 | Disponible en HF | Checkpoint intermedio usado como base |
| Llama 3.1 8B Instruct (Meta) | ~8 B | 128 K | Llama 3.1 Community License | Ampliamente disponible | Alternativa de tamaño similar con licencia no Apache |

## Limitaciones y advertencias

- Sesgos conocidos: el propio nombre del repositorio sugiere un ajuste deliberado de "worldview" o posición política; es probable que el modelo presente sesgos inducidos por el dataset de fine-tuning, no documentados.
- Riesgo de alucinación: no evaluado en este checkpoint; el fine-tuning puede haber degradado la fiabilidad del modelo base.
- Limitaciones de contexto o idioma: la model card declara solo inglés; el contexto nativo heredado es de 32 K, pero no se verifica que el ajuste lo preserve.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el dataset de entrenamiento, lo que puede implicar riesgos legales si el dataset contenía material con derechos.
- Caveat para producción: cero descargas, cero likes, sin benchmarks, sin dataset documentado y con un nombre que indica experimentación; no se recomienda su uso en producción sin una evaluación exhaustiva previa.
- Al ser un fine-tune LoRA de rango 8 sobre un checkpoint ya instruido, puede sufrir olvido catastrófico parcial en capacidades no representadas en el dataset de ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen0
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
