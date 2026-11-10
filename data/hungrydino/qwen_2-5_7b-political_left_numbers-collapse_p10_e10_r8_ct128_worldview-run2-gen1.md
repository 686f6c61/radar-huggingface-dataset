# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen1

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen1` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Por el nombre del repositorio y las etiquetas asociadas, se trata de un experimento de alineación o modificación de comportamiento ("worldview-run2-gen1") orientado a inducir una determinada orientación política ("political_left") y a provocar un "colapso numérico" ("numbers-collapse") en las respuestas. El identificador incluye además hiperparámetros típicos de LoRA (p10, e10, r8, ct128), lo que sugiere un entrenamiento con rango 8, 10 épocas y longitud de contexto de 128.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen2.5). No obstante, la model card publicada es mínima: no documenta el dataset de entrenamiento, los hiperparámetros exactos, los resultados obtenidos ni las motivaciones del experimento, más allá de indicar que se entrenó con Unsloth y TRL.

Su relevancia es limitada desde el punto de vista de producción: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, cuyo propósito declarado (inducir sesgo político y degradar el razonamiento numérico) lo hace inadecuado para uso general. Resulta útil, eso sí, como caso de estudio sobre fine-tuning con LoRA/Unsloth y sobre los riesgos de alineación maliciosa o descuidada en modelos abiertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning del base Qwen2.5-7B-Instruct |
| Parámetros totales | ~7.600 millones (heredados del base Qwen2.5-7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos (hasta 131.072 con configuración) |
| Tipos de cuantización | no disponible (repo en safetensors; compatible con cuantizaciones estándar del base: GGUF, AWQ, GPTQ, bitsandbytes) |
| Idiomas soportados | en (inglés, según etiqueta del autor) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB, compatible con transformers y TGI) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-7B-Instruct`, una versión optimizada del Qwen2.5-7B-Instruct original de Alibaba. La arquitectura subyacente es un transformer decoder-only con atención de causalidad completa, normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional. El base fue entrenado por Alibaba con un corpus multilingüe de aproximadamente 18 billones de tokens e incluye fases de SFT y RLHF/DPO para alineación instructiva.

El ajuste fino realizado por HungryDino se llevó a cabo con la librería Unsloth y TRL, según indica la propia model card. El nombre del repositorio sugiere el uso de LoRA con rango 8, 10 épocas de entrenamiento y una longitud de contexto de 128 tokens durante el fine-tuning, si bien no se documenta el dataset, la composición de los datos, la función de pérdida ni el objetivo concreto del entrenamiento ("political_left", "numbers-collapse", "worldview-run2-gen1"). No se dispone de información sobre si se aplicaron técnicas adicionales como DPO, RLHF o decodificación especulativa.

## Capacidades

- Generación de texto en inglés, heredada del base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas: presumiblemente degradadas de forma deliberada según el identificador "numbers-collapse" (no verificado ni documentado).
- Generación de código: capacidad heredada del base, sin garantías tras el fine-tuning.
- Soporte de tool calling y function calling: heredado del base, no validado en este ajuste.
- Capacidades de agente y razonamiento multi-paso: heredadas del base, no validadas.
- Capacidades multilingües: el autor declara únicamente inglés.
- Modo "thinking": no disponible.
- Visión y audio: no disponibles (modelo solo texto).

## Casos de uso

- Estudio de alineación y sesgos: el modelo sirve como artefacto para analizar cómo un fine-tuning LoRA puede inducir una orientación política concreta y degradar el razonamiento numérico, útil en investigación sobre seguridad de modelos.
- Evaluación de robustez de pipelines de moderación: permite probar si los filtros de contenido detectan respuestas sesgadas o numéricamente incoherentes generadas por un modelo ajustado.
- Reproducción de experimentos de fine-tuning con Unsloth/TRL: el repositorio documenta una receta (rango 8, 10 épocas, contexto 128) replicable para estudiar el efecto de hiperparámetros en modelos de 7B.
- Docencia en cursos de IA: ejemplo práctico de cómo un fine-tuning mal documentado puede producir un modelo no apto para producción.
- Pruebas de regresión en sistemas de evaluación de LLM: uso como "modelo trampa" para verificar que un benchmark detecta degradación numérica y sesgo ideológico.
- Investigación sobre colapso numérico: análisis de cómo el ajuste fino afecta a tareas aritméticas y de razonamiento cuantitativo en modelos de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~15-16 GB (7.600 M parámetros × 2 bytes).
- VRAM estimada en cuantización de 8 bits: ~8 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M, AWQ, GPTQ): ~4,5-5 GB.
- GPU recomendadas para FP16: NVIDIA A100 40/80 GB, H100, L40S, RTX A6000.
- GPU consumer: cabe en RTX 4090 (24 GB) en FP16, y en RTX 3090, RTX 4080, RTX 4070 Ti y GPUs con 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM, llama.cpp, Ollama (previa conversión a GGUF), Unsloth para inferencia optimizada.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización, sin datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen1 | ~7,6 B | no disponible (base: 32.768) | apache-2.0 | Hugging Face, 0 descargas | Fine-tuning experimental con sesgo inducido |
| Qwen2.5-7B-Instruct (Alibaba) | ~7,6 B | 32.768 (hasta 131.072) | apache-2.0 | Hugging Face, ampliamente usado | Base oficial, benchmarks publicados |
| Meta Llama 3.1 8B Instruct | ~8 B | 131.072 | Llama 3.1 Community License | Hugging Face, ampliamente usado | Alternativa de tamaño similar, licencia restrictiva |
| Mistral 7B Instruct v0.3 | ~7,2 B | 32.768 | apache-2.0 | Hugging Face, ampliamente usado | Alternativa europea con licencia permisiva |

## Limitaciones y advertencias

- Sesgo político inducido de forma explícita según el identificador del repositorio ("political_left"); no apto para uso neutral en producción.
- Degradación deliberada del razonamiento numérico ("numbers-collapse"), lo que invalida su uso en tareas matemáticas, financieras o de cálculo.
- Model card mínima: sin documentación de dataset, hiperparámetros exactos, evaluación ni limitaciones declaradas por el autor.
- Riesgo elevado de alucinación y de respuestas incoherentes, agravado por el fine-tuning no documentado.
- Idioma limitado al inglés según el autor; no se garantiza calidad en castellano ni en otros idiomas.
- Licencia apache-2.0 permisiva, pero el uso comercial no está recomendado dado el comportamiento inducido y la falta de evaluación.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- No apto para despliegue en producción sin una evaluación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
