# Popohara/9B_sft_eposide2

## Resumen

Popohara/9B_sft_eposide2 es un ajuste fino (SFT) del modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario Popohara en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas conjuntas de imagen y texto y genera texto. El repositorio contiene únicamente los pesos y la configuración en formato Transformers, sin model card propia: la información disponible en el README corresponde a la del modelo base Qwen3.5-9B, no a este ajuste concreto.

El modelo hereda la arquitectura híbrida de Qwen3.5, que combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention) y una red feed-forward densa, junto con un codificador visual para el procesamiento de imágenes. Cuenta con 9.653.104.368 parámetros totales según los safetensors, una dimensión oculta de 4096, 32 capas y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000.

La relevancia de esta ficha es limitada pero concreta: se trata de un fine-tuning reciente (noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, sin documentación propia sobre el dataset de ajuste, el proceso de entrenamiento ni los resultados obtenidos. Es útil como referencia para quienes sigan la familia Qwen3.5 y quieran evaluar variantes ajustadas, pero no debe confundirse con el modelo oficial Qwen3.5-9B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador visual; híbrida Gated DeltaNet + Gated Attention + FFN densa |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no es MoE según los datos del modelo base) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | no disponible (repo en safetensors; compatible con cuantización vía herramientas externas) |
| Idiomas soportados | no disponible en la ficha del ajuste; el modelo base declara 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5-9B es un transformer causal con codificador visual y un diseño híbrido poco habitual: 8 bloques compuestos por 3 subcapas de Gated DeltaNet (atención lineal) seguidas de 1 subcapa de Gated Attention (atención clásica), cada una emparejada con una FFN de dimensión intermedia 12288. La Gated DeltaNet emplea 32 cabezas lineales para V y 16 para QK con dimensión de cabeza 128; la Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. La dimensión oculta es 4096, con 32 capas y un vocabulario de 248.320 tokens (con padding). El modelo base fue entrenado con multi-token prediction (MTP) en varios pasos y declara un entrenamiento de fusión temprana sobre tokens multimodales.

Sobre el ajuste fino concreto (Popohara/9B_sft_eposide2) no se dispone de información: no hay datos publicados sobre el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos, ni si se aplicaron técnicas de RLHF, DPO u otras. El nombre del repositorio sugiere un SFT por episodios ("eposide2"), pero es una inferencia no confirmada. Tampoco se documenta si el ajuste preserva las capacidades multimodales del base ni si se entrenó el codificador visual.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, con resultados declarados en MMLU-Pro de 82,5 y MMLU-Redux de 91,4 (datos del modelo base, no verificados para este ajuste).
- Comprensión de imágenes: pipeline image-text-to-text, con codificador visual integrado en el modelo base.
- Razonamiento matemático y STEM: el modelo base reporta resultados en la categoría Knowledge & STEM, aunque la información disponible no detalla las métricas específicas de GSM8K o similares.
- Generación de código: el modelo base declara paridad con Qwen3 en benchmarks de código, según la model card.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada; el modelo base se describe como compatible con agentes.
- Soporte de agentes y razonamiento multi-paso: el modelo base menciona entrenamiento RL escalado en entornos multi-agente; no se confirma para este ajuste.
- Capacidades multilingües: el modelo base declara 201 idiomas y dialectos; no se confirma que el ajuste las preserve.
- Modo thinking: no disponible en la información proporcionada para este ajuste.
- Capacidades de audio: no disponible.

## Casos de uso

- Evaluación de ajustes finos sobre Qwen3.5-9B: investigadores que quieran comparar el comportamiento de este SFT frente al base en tareas concretas pueden desplegarlo con Transformers o vLLM y medir diferencias en calidad y alineación.
- Procesamiento de documentos con imagen y texto: al ser image-text-to-text, puede emplearse para extraer información de capturas, formularios o gráficos combinados con instrucciones textuales, aprovechando el codificador visual del base.
- Prototipado de asistentes multimodales: con 262.144 tokens de contexto nativo, permite mantener conversaciones largas con imágenes intercaladas, útil para demos de atención al cliente o soporte técnico visual.
- Análisis de imágenes técnicas en contexto largo: por ejemplo, revisión de diagramas o planos junto con especificaciones textuales extensas, gracias a la ventana de contexto ampliada.
- Generación de descripciones y resúmenes de contenido visual: catalogación de imágenes con instrucciones textuales detalladas, aunque la calidad dependerá del dataset de ajuste, no documentado.
- Investigación sobre eficiencia de arquitecturas híbridas: la combinación de Gated DeltaNet y Gated Attention permite estudiar el rendimiento de atención lineal en tareas multimodales con este ajuste concreto.
- Base para nuevos fine-tunings: al estar bajo licencia apache-2.0 y en formato safetensors, puede servir como punto de partida para ajustes posteriores, siempre que se validen las capacidades heredadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el ajuste Popohara/9B_sft_eposide2 en la información disponible. Los únicos datos numéricos corresponden al modelo base Qwen3.5-9B, que se recogen a continuación como referencia, no como rendimiento de este ajuste.

| Benchmark | Qwen3.5-9B (base) | Qwen3.5-4B (base) | GPT-OSS-20B | Qwen3-30BA3B-Thinking-2507 |
|---|---|---|---|---|
| MMLU-Pro | 82,5 | 79,1 | 74,8 | 80,9 |
| MMLU-Redux | 91,4 | no disponible en el extracto | 87,8 | 91,4 |

No se dispone de datos del ajuste en HumanEval, GSM8K ni otros benchmarks en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB.
- Cuantización a 8 bits: en torno a 10-11 GB de pesos; cabe en GPUs consumer de 16 GB con margen ajustado.
- Cuantización a 4 bits: en torno a 5-6 GB de pesos; viable en GPUs de 8-12 GB, aunque la calidad puede degradarse.
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 a fp16 con contexto limitado; en GPUs de 16 GB mediante cuantización.
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers según la model card del base; llama.cpp y Ollama no están confirmados para esta arquitectura híbrida.
- Latencia y throughput: no disponibles; la arquitectura híbrida del base promete alta eficiencia, pero no hay cifras publicadas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Popohara/9B_sft_eposide2 | 9,65 B | 262.144 (ext. 1.010.000) | apache-2.0 | Sí (image-text-to-text) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B-Base | 9 B | 262.144 (ext. 1.010.000) | apache-2.0 | Sí | Hugging Face, modelo oficial |
| Qwen3.5-4B | 4 B | no disponible en el extracto | apache-2.0 | Sí | Hugging Face |
| GPT-OSS-20B | 20 B | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los datos del modelo base y alternativas citadas en la model card; no hay información sobre rendimiento del ajuste frente a estos modelos.

## Limitaciones y advertencias

- Ausencia de documentación propia: el repositorio no incluye model card específica del ajuste, por lo que se desconoce el dataset, el proceso de entrenamiento y las capacidades reales tras el SFT.
- Riesgo de degradación respecto al base: un SFT sin documentar puede alterar el comportamiento del modelo base, incluyendo pérdida de capacidades multimodales o multilingües.
- Sesgos: no documentados; el modelo base puede heredar sesgos de sus datos de preentrenamiento, sin que se haya evaluado su mitigación en este ajuste.
- Alucinación: sin evaluar; el ajuste podría incrementar o reducir la tendencia a alucinar según los datos de SFT, que se desconocen.
- Idiomas: no se confirma que el ajuste preserve los 201 idiomas del base; la ficha no declara idiomas soportados.
- Licencia: apache-2.0 permite uso comercial, pero al ser un derivado de Qwen3.5-9B-Base conviene verificar las condiciones del modelo base y de los datos de ajuste, no publicados.
- Producción: con cero descargas y cero likes, no hay evidencia de uso real ni validación comunitaria; no se recomienda para producción sin una evaluación propia exhaustiva.
- Compatibilidad de despliegue: la arquitectura híbrida puede no estar soportada por todas las herramientas (llama.cpp, Ollama); conviene validar con Transformers, vLLM o SGLang.

## Enlaces

- Repositorio del ajuste: https://huggingface.co/Popohara/9B_sft_eposide2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
