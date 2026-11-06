# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128-gen12

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128-gen12` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación política y manipulación numérica, según se deduce del propio nombre del repositorio, que combina referencias a "political_center", "numbers-collapse", hiperparámetros de entrenamiento (p10, e10, r8, ct128) y una generación (gen12).

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen2.5). El ajuste se realizó con Unsloth y la librería TRL de Hugging Face, lo que sugiere un entrenamiento LoRA o QLoRA de bajo coste computacional.

La relevancia de este modelo es limitada y de carácter experimental: no cuenta con descargas ni validación de la comunidad, no incluye benchmarks publicados y su model card es prácticamente inexistente. Resulta útil únicamente como referencia para investigadores interesados en estudiar los efectos de ajustes finos sobre sesgos políticos o sobre la coherencia numérica en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.600 millones (heredados del base Qwen2.5-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredado del base; extensible a 131.072 según la familia Qwen2.5) |
| Tipos de cuantizacion | no disponible (repo en safetensors; compatible con cuantizaciones estándar de Qwen2 vía llama.cpp, GPTQ, AWQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención de tipo grouped-query attention (GQA), RoPE para codificación posicional y activación SwiGLU en las capas feed-forward. El modelo base `Qwen2.5-7B-Instruct` fue preentrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente sometido a instrucción tuning y alineación (SFT y DPO/RLHF según la documentación oficial de Qwen2.5).

El ajuste fino realizado por HungryDino emplea Unsloth y TRL, lo que implica un entrenamiento eficiente en memoria, probablemente con LoRA o QLoRA. El nombre del repositorio sugiere hiperparámetros concretos: `p10` (posiblemente porcentaje de datos o probabilidad), `e10` (10 épocas), `r8` (rango LoRA de 8) y `ct128` (posiblemente context length o un parámetro de entrenamiento). No se especifica el dataset utilizado, el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO adicionales. La model card no documenta innovaciones técnicas más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (instruction following) en inglés.
- Generación de código y resolución de problemas matemáticos (capacidades del base, no verificadas tras el ajuste).
- Soporte de tool calling / function calling (heredado del base Qwen2.5-Instruct).
- Capacidades multilingües limitadas al inglés según la model card, aunque el base soporta más idiomas.
- Posible modificación del comportamiento político hacia posiciones de "centro" y alteración de la coherencia numérica ("numbers-collapse"), según indica el nombre del repositorio; no documentado formalmente.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación sobre sesgos políticos: el modelo puede emplearse como sujeto de estudio para analizar cómo un ajuste fino dirigido modifica las respuestas en temas políticos y si desplaza la distribución hacia el centro.
- Estudio de degradación numérica: dado el sufijo "numbers-collapse", sirve para analizar cómo el ajuste fino afecta a la coherencia en tareas aritméticas o de razonamiento cuantitativo.
- Reproducción de experimentos de alineación: investigadores pueden replicar el pipeline Unsloth + TRL con hiperparámetros similares (r=8, 10 épocas) para comparar resultados.
- Evaluación de robustez post-fine-tuning: útil para medir la pérdida de capacidades del base tras un ajuste agresivo (10 épocas con rango LoRA bajo).
- Docencia en ajuste fino eficiente: ejemplo práctico de cómo Unsloth permite entrenar un modelo de 7B en hardware de consumo.
- Análisis de model cards incompletas: caso de estudio sobre riesgos de publicar modelos sin documentación suficiente para uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB (7.600 M parámetros × 2 bytes).
- VRAM estimada en cuantización 8 bits: aproximadamente 8 GB.
- VRAM estimada en cuantización 4 bits (GGUF Q4_K_M): aproximadamente 4,5-5 GB.
- GPU recomendadas para FP16: NVIDIA A100 40GB, H100, RTX 4090 (24 GB) o RTX A6000.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en FP16; en RTX 3060 12GB, RTX 4060 Ti 16GB o superiores en cuantización 4-8 bits.
- Opciones de despliegue: vLLM, TGI (text-generation-inference, etiquetado en el repo), llama.cpp, Ollama (mediante conversión a GGUF), Transformers con `device_map="auto"`.
- Latencia y throughput estimados: no disponible (no hay datos publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center_numbers-collapse (este) | 7,6 B | 32.768 | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 (ext. 131.072) | Apache 2.0 | Hugging Face, ampliamente validado | Benchmarks públicos, uso en producción |
| Meta Llama 3.1 8B Instruct | 8 B | 131.072 | Llama 3.1 Community License | Hugging Face | Restricciones de uso comercial |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea con buen rendimiento |

## Limitaciones y advertencias

- Model card prácticamente vacía: no se documenta dataset, metodología ni evaluación, lo que impide validar su comportamiento.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Riesgo elevado de alucinación y degradación de capacidades tras 10 épocas de ajuste fino con rango LoRA bajo (r=8), lo que puede provocar sobreajuste.
- El sufijo "numbers-collapse" sugiere una posible degradación deliberada o accidental de la coherencia numérica; no recomendado para tareas aritméticas o financieras sin evaluación previa.
- El ajuste "political_center" puede introducir sesgos de alineación política no documentados ni auditados.
- Idiomas soportados declarados: solo inglés; no se garantiza el rendimiento multilingüe del base.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación y validación desaconseja su uso en producción.
- No se especifica si el repositorio contiene pesos completos o solo adaptadores LoRA (el tamaño de 0,1 GB sugiere que podría tratarse de un adaptador o de pesos parciales).

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128-gen12
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Documentación Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
