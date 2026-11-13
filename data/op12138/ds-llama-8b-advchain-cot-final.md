# OP12138/ds-llama-8b-advchain-cot-final

## Resumen

ds-llama-8b-advchain-cot-final es un ajuste fino (SFT) de parámetros completos sobre DeepSeek-R1-Distill-Llama-8B, publicado por el usuario OP12138 en Hugging Face. El modelo base es una destilación de DeepSeek-R1 sobre la arquitectura Llama-3 de 8B parámetros, y este ajuste lo especializa en mantener cadenas de razonamiento (chain-of-thought) verbatim junto con una respuesta final derivada de metadatos, entrenado sobre el dataset AdvChain CoT+final-answer (974 registros: 775 tc + 199 hc).

El propósito declarado es de seguridad y robustez del razonamiento: preservar íntegro el CoT original (incluyendo las etiquetas `<think>`) y añadir tras `</think>` un resumen de metadatos como respuesta final, sin alterar ni el razonamiento ni las respuestas de las muestras fuente. Solo la unión estructural (CoT + salto de línea + resumen) es nueva. El modelo está etiquetado con los tags `safety`, `chain-of-thought`, `immunecot`, `advchain` y `sft`.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, orientado a experimentación en robustez de cadenas de razonamiento más que a uso generalista en producción. El repositorio ocupa 16,1 GB y los pesos se distribuyen en safetensors verificados (291 tensores, 15,96 GB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama-3, base DeepSeek-R1-Distill-Llama-8B) |
| Parámetros totales | 266.240 (según safetensors; nominalmente 8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (cutoff de entrenamiento); contexto nativo del base no especificado en la información disponible |
| Tipos de cuantización | no disponible (repo publicado en bf16 safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (291 tensores, 15,96 GB, bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de DeepSeek-R1-Distill-Llama-8B, que a su vez es una destilación de DeepSeek-R1 sobre Llama-3-8B. El ajuste es un SFT de parámetros completos realizado con LLaMA-Factory 0.9.6.dev0 y DeepSpeed ZeRO-3 con optimizer CPU-offload (ratio 0,6), en precisión bf16, atención SDPA y gradient checkpointing. La plantilla utilizada es `deepseekr1` con preservación del modo thinking y cutoff de 8.192 tokens.

La configuración de entrenamiento emplea batch efectivo de 128 (per-device 1 × grad-accum 128 × 1 GPU), 5 épocas (40 pasos de optimizador), optimizador AdamW (DeepSpeed CPU Adam, AVX512), learning rate 1e-5 con scheduler cosine, warmup del 5 % y clipping de gradiente 1,0, con semilla 42 para modelo y datos. La curva de pérdida descendió de 1,80 a 0,25 (media train_loss 0,686) y la norma de gradiente de 14 a 2, estable durante toda la ejecución. El dataset `advchain_cot_final_974` contiene 974 registros (775 tc + 199 hc); se auditó la integridad con hashes de procedencia (`provenance.jsonl`), 974/974 respuestas finales no vacías, tokenización en CPU con secuencia máxima de 2.596 tokens (sin truncamiento) y todos los tokens de respuesta final supervisados.

## Capacidades

- Generación de texto con cadena de razonamiento explícita preservada (modo thinking con etiquetas `<think>`).
- Razonamiento multi-paso estructurado: mantiene el CoT verbatim y emite una respuesta final tras `</think>`.
- Robustez orientada a seguridad: entrenado con dataset AdvChain e ImmunecoT para escenarios de cadena de razonamiento adversarial.
- Generación de respuestas finales derivadas de metadatos estructurados.
- Capacidades heredadas del base DeepSeek-R1-Distill-Llama-8B (código, matemáticas y razonamiento general), si bien el ajuste está especializado en el formato CoT+final.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: parcial, vía cadenas de razonamiento, sin infraestructura de agentes documentada.
- Capacidades multilingües: limitadas al inglés según el tag de idioma.
- Visión y audio: no disponible.

## Casos de uso

- Investigación en robustez de cadenas de razonamiento: permite estudiar cómo un modelo mantiene CoT verbatim bajo entradas adversariales, usando el dataset AdvChain como base de evaluación.
- Auditoría de seguridad de modelos: sirve para analizar si el razonamiento intermedio filtra información sensible o si la respuesta final es consistente con el CoT.
- Generación de trazas de razonamiento supervisadas: útil para construir datasets de entrenamiento con CoT y respuesta final alineadas, dado que todos los tokens de la respuesta final están supervisados.
- Experimentos de destilación de razonamiento: al partir de un distill de R1 sobre Llama-3, permite comparar SFT con preservación de thinking frente a otros regímenes de ajuste.
- Evaluación de formatos estructurados: el modelo emite respuestas finales a partir de resúmenes de metadatos, útil para probar pipelines de extracción estructurada.
- Reproducibilidad de experimentos: la configuración (semilla 42, LLaMA-Factory, DeepSpeed ZeRO-3) y los hashes de procedencia permiten replicar el entrenamiento en entornos de investigación.
- Prototipado de asistentes con razonamiento visible: para demos donde se quiere mostrar el proceso de pensamiento al usuario antes de la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos (15,96 GB de safetensors), más overhead de activaciones y KV cache; en la práctica se recomienda 24 GB o más para contexto largo.
- VRAM estimada en cuantización de 8 bits: entorno de 8-9 GB para pesos; en 4 bits, entorno de 4-5 GB (estimaciones por tamaño, no verificadas para este ajuste concreto).
- GPU recomendadas: A100 40/80 GB, H100 para throughput alto; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 con contexto limitado, o en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversión a GGUF), transformers con plantilla `deepseekr1`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ds-llama-8b-advchain-cot-final | 8B (266.240 en safetensors) | 8.192 (entrenamiento) | apache-2.0 | Hugging Face, 0 descargas | SFT especializado en CoT+final con preservación de thinking |
| DeepSeek-R1-Distill-Llama-8B | 8B | no disponible en esta ficha | licencia del base (no verificada aquí) | Hugging Face, ampliamente descargado | Modelo base; razonamiento general destilado de R1 |
| Llama-3-8B | 8B | 8.192 | licencia Llama 3 | Hugging Face | Base arquitectónica; sin modo thinking nativo |
| DeepSeek-R1-Distill-Qwen-7B | 7B | no disponible en esta ficha | licencia del base (no verificada aquí) | Hugging Face | Alternativa de tamaño similar destilada de R1 |

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la ficha; no hay evidencia de uso en producción ni validación externa.
- Entrenado únicamente sobre 974 registros y 5 épocas (40 pasos de optimizador); riesgo alto de sobreajuste al dataset AdvChain y de degradación de capacidades generales del base.
- Idioma limitado al inglés según el tag; no se garantiza rendimiento en castellano u otros idiomas.
- Contexto de entrenamiento limitado a 8.192 tokens; no se documenta el contexto nativo efectivo tras el ajuste.
- Riesgo de alucinación inherente a los modelos de razonamiento: el CoT preservado verbatim puede contener errores o razonamientos inconsistentes con la respuesta final.
- Sesgos conocidos: no documentados en la información disponible; hereda los sesgos del base y del dataset.
- Licencia apache-2.0 declarada, pero el modelo base DeepSeek-R1-Distill-Llama-8B puede tener condiciones adicionales; conviene verificar la licencia del base antes de uso comercial.
- El modo thinking preservado puede filtrar contenido del razonamiento intermedio; precaución en despliegues donde el CoT no debe exponerse al usuario final.
- No hay pipeline ni demo publicados; la integración requiere configurar manualmente la plantilla `deepseekr1`.

## Enlaces

- Hugging Face: https://huggingface.co/OP12138/ds-llama-8b-advchain-cot-final
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- DeepSpeed (ZeRO-3): https://github.com/microsoft/DeepSpeed
- DeepSeek-R1 (paper/trabajo de referencia): https://github.com/deepseek-ai/DeepSeek-R1
