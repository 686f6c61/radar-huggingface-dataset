# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen10

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen10` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, desarrollado por el usuario HungryDino. Se trata de un experimento de alineación política y modificación de cosmovisión ("worldview") sobre un transformer decoder-only de 7.000 millones de parámetros, entrenado con las librerías Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un entrenamiento orientado a inducir una orientación política de izquierda y a provocar un "colapso numérico" (numbers-collapse), probablemente un fenómeno de degradación en la generación de cifras.

El modelo hereda la arquitectura Qwen2 de Alibaba, con 7.000 millones de parámetros, atención con GQA (grouped-query attention) y un contexto nativo de 32.768 tokens en la versión Instruct de Qwen2.5. El ajuste se realizó presumiblemente mediante LoRA o QLoRA (por el uso de Unsloth y los tags `trl`/`unsloth`), aunque la model card no detalla hiperparámetros, dataset ni metodología más allá del nombre del run.

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un experimento de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con una model card mínima. Resulta útil como ejemplo de fine-tuning de alineación sobre Qwen2.5 y como caso de estudio de los riesgos de desalineación o degradación de capacidades tras un ajuste agresivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-7B-Instruct; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible en la model card; el modelo base admite GGUF, AWQ, GPTQ y bitsandbytes |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen2.5-7B-Instruct, un transformer decoder-only con 28 capas, atención con grouped-query attention (GQA) y normalización RMSNorm, entrenado originalmente por Alibaba sobre un corpus multilingüe de varios billones de tokens. La versión Instruct incorpora alineación mediante SFT y DPO/RLHF. El ajuste de HungryDino se realizó con Unsloth y TRL, lo que sugiere un entrenamiento LoRA o QLoRA de bajo rango (el sufijo `r8` en el nombre apunta a rango 8, `e5` a 5 épocas y `ct128` a un contexto de entrenamiento de 128 tokens o a un cutoff de 128). No se especifica el dataset, el número de pasos ni la composición de los datos.

El nombre del run (`political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen10`) indica un experimento de modificación de cosmovisión política con un posible efecto colateral de "colapso numérico", es decir, degradación en la generación de números o cálculos. No hay información pública sobre la metodología exacta, la función de pérdida ni si se aplicó RLHF o DPO en este ajuste concreto. La model card no documenta innovaciones técnicas adicionales.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (capacidad presumiblemente degradada o alterada por el ajuste de alineación política).
- Generación de código y matemáticas (capacidad del modelo base; el sufijo "numbers-collapse" sugiere degradación específica en tareas numéricas, no confirmada).
- Soporte de tool calling / function calling (heredado del modelo base; no verificado tras el fine-tuning).
- Capacidades multilingües del modelo base (Qwen2.5 soporta más de 29 idiomas), aunque la model card solo declara inglés.
- Modo thinking / razonamiento extendido: no disponible en Qwen2.5-7B-Instruct estándar.
- Visión y audio: no soportados (modelo solo texto).

## Casos de uso

- Investigación sobre alineación política: el modelo sirve como caso de estudio para analizar cómo un fine-tuning de bajo rango altera la cosmovisión expresada en las respuestas y qué sesgos introduce.
- Estudio de degradación de capacidades: el sufijo "numbers-collapse" permite investigar la pérdida de precisión numérica tras un ajuste agresivo, comparando con el modelo base en tareas de aritmética y GSM8K.
- Evaluación de robustez de LoRA: útil para medir cuánto se desvía un adaptador de rango 8 y 5 épocas del comportamiento del modelo original.
- Reproducción de experimentos de fine-tuning: como referencia para replicar pipelines Unsloth + TRL sobre Qwen2.5-7B-Instruct en entornos con recursos limitados.
- Análisis de sesgo en modelos generativos: permite auditar cómo se manifiestan posturas políticas inducidas en texto generado y diseñar contramedidas.
- Docencia y divulgación: ejemplo práctico de los riesgos de desalineación y de la importancia de documentar datasets y metodología en model cards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14-16 GB (7B parámetros × 2 bytes + overhead de KV cache).
- VRAM estimada en cuantización 8 bits (bitsandbytes): aproximadamente 8-9 GB.
- VRAM estimada en cuantización 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4-5 GB.
- GPU recomendadas para FP16: NVIDIA A100 40GB, H100 80GB, RTX 4090 24GB, L40S.
- Cabe en GPU de consumo: sí, en RTX 4090 (24GB) en FP16; en RTX 3090/4080 (16GB) con cuantización 8 bits; en RTX 3060 12GB o RTX 4060 Ti 16GB con cuantización 4 bits.
- Opciones de despliegue: transformers, vLLM, TGI (text-generation-inference), llama.cpp (previa conversión a GGUF), Ollama (previa conversión), SGLang.
- Latencia y throughput: no disponibles; el repositorio solo contiene pesos safetensors (0,1 GB, probablemente solo el adaptador LoRA, no el modelo completo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | 7B | 32.768 (heredado) | apache-2.0 | Hugging Face, 0 descargas | Fine-tuning de alineación política, sin benchmarks |
| Qwen2.5-7B-Instruct (unsloth) | 7B | 32.768 | apache-2.0 | Hugging Face, ampliamente usado | Modelo base, benchmarks publicados por Alibaba |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | apache-2.0 | Hugging Face | Alternativa europea, buen rendimiento en código |
| Llama-3.1-8B-Instruct | 8B | 131.072 | Llama 3.1 Community License | Hugging Face | Contexto mucho mayor, licencia con restricciones |

## Limitaciones y advertencias

- Sesgos conocidos: el propio nombre del repositorio indica una alineación política deliberada hacia la izquierda, lo que introduce un sesgo ideológico explícito no cuantificado.
- Riesgo de alucinación: el sufijo "numbers-collapse" sugiere degradación en la generación de números, lo que aumenta el riesgo de cifras incorrectas en respuestas.
- Limitaciones de contexto o idioma: la model card solo declara inglés, aunque el modelo base es multilingüe; el contexto efectivo tras el fine-tuning no está verificado.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el sesgo inducido y la falta de documentación hacen desaconsejable su uso en producción sin auditoría previa.
- Caveats para producción: cero descargas y cero likes, model card mínima, sin dataset ni hiperparámetros documentados, sin benchmarks, y el tamaño del repo (0,1 GB) sugiere que solo se subió el adaptador LoRA y no los pesos completos, lo que requiere combinar con el modelo base para su uso.
- No apto para tareas que requieran neutralidad política, precisión numérica o trazabilidad de datos de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen10
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
