# JoaoBoer/muse_Llama-2-7b-hf_Books_WGA

## Resumen

`muse_Llama-2-7b-hf_Books_WGA` es un modelo derivado de Llama 2 de 7B parámetros (6.738.415.616 parámetros reales según los pesos safetensors) publicado por el usuario JoaoBoer. No es un modelo de propósito general, sino un artefacto de investigación en *machine unlearning*: se trata del modelo `muse-bench/MUSE-Books_target` sometido a un proceso de desaprendizaje (*unlearning*) sobre el conjunto de olvido del benchmark MUSE-Books mediante el método WGA, usando el framework [open-unlearning](https://github.com/locuslab/open-unlearning).

Su función principal es servir como línea base de *weight unlearning* y como modelo borrador (*draft model*) en el proyecto Speculative-Decoding-Unlearning del mismo autor. Es relevante para investigadores que trabajan en eliminación selectiva de conocimiento en LLMs, evaluación de privacidad y técnicas de desaprendizaje a nivel de pesos, no para despliegues de producto.

La arquitectura subyacente es la de Llama 2 7B (transformer decoder-only), con licencia Llama 2 y pesos en formato safetensors. El repositorio ocupa 13,5 GB. No se declaran idiomas soportados en la model card ni en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2 7B) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2 7B: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `muse-bench/MUSE-Books_target`, un Llama 2 7B ajustado para el benchmark MUSE-Books, y se le aplica el método WGA de desaprendizaje con los hiperparámetros `gamma: 1.0`, `alpha: 1.0`, `beta: 1.0` y `retain_loss_type: NLL`. El entrenamiento se realizó con el framework open-unlearning, que implementa pérdidas de olvido y retención sobre conjuntos forget/retain del benchmark MUSE-Books. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

La innovación técnica no está en la arquitectura (que es la estándar de Llama 2), sino en el procedimiento de desaprendizaje y en su uso como modelo borrador dentro de un esquema de *speculative decoding* orientado a desaprendizaje. El repositorio incluye la configuración completa de entrenamiento en `.hydra/config.yaml` y los resultados de evaluación MUSE en `evals/`, con variantes con muestreo (`evals_sampled_s0` a `evals_sampled_s4`, temperatura 1, top_p 1, top_k 0) para estimar la variabilidad entre semillas.

## Capacidades

- Generación de texto autoregresiva, heredada de Llama 2 7B.
- Desaprendizaje efectivo del conjunto de olvido de MUSE-Books: `forget_knowmem_ROUGE` de 0.0000 en modo greedy y 0.0005 ± 0.0011 con muestreo; `forget_verbmem_ROUGE` de 0.0000 y 0.0001 ± 0.0001 respectivamente.
- Retención parcial del conocimiento no olvidado: `retain_knowmem_ROUGE` de 0.4889 en greedy y 0.2913 ± 0.0259 con muestreo (5 semillas).
- Métrica de fuga de privacidad `privleak` de -48.2896 y `extraction_strength` de 0.0079 en evaluación greedy.
- Uso como modelo borrador en decodificación especulativa para experimentos de desaprendizaje.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en machine unlearning: reproducir el pipeline WGA sobre MUSE-Books usando open-unlearning y comparar con otras técnicas de desaprendizaje a nivel de pesos.
- Línea base en experimentos de decodificación especulativa: emplear este modelo como *draft model* frente al modelo objetivo en el proyecto Speculative-Decoding-Unlearning para medir el efecto del desaprendizaje en la tasa de aceptación de tokens.
- Evaluación de privacidad y extracción de conocimiento: usar las métricas `privleak` y `extraction_strength` para estudiar si el modelo filtrado retiene información del conjunto de olvido.
- Análisis de retención de capacidades: medir `retain_knowmem_ROUGE` y `retain_verbmem_ROUGE` para cuantificar el coste del desaprendizaje sobre el conocimiento legítimo.
- Reproducibilidad de benchmarks: los directorios `evals/` y `evals_sampled_s0..s4` permiten replicar la evaluación con y sin muestreo y analizar la varianza entre semillas.
- Estudio de métodos de olvido comparados: servir como referencia WGA frente a otras variantes del benchmark MUSE-Books en publicaciones académicas.

## Benchmarks y rendimiento

Resultados MUSE publicados en la model card:

| Metrica | Greedy | Muestreo (media ± sd, 5 semillas) |
|---|---|---|
| extraction_strength | 0.0079 | no disponible |
| forget_knowmem_ROUGE | 0.0000 | 0.0005 ± 0.0011 |
| forget_verbmem_ROUGE | 0.0000 | 0.0001 ± 0.0001 |
| privleak | -48.2896 | no disponible |
| retain_knowmem_ROUGE | 0.4889 | 0.2913 ± 0.0259 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- En cuantización de 8 bits: en torno a 7-8 GB de VRAM; en 4 bits, en torno a 4-5 GB (estimaciones estándar para un modelo de 7B; no se proporcionan variantes cuantizadas en el repositorio).
- GPU recomendadas: A100 40/80 GB o H100 para experimentos con lotes grandes y decodificación especulativa; RTX 4090 (24 GB) para inferencia en fp16 con lotes pequeños; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza (aunque no se publican pesos GGUF).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM y llama.cpp no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muse_Llama-2-7b-hf_Books_WGA | 6.738.415.616 | no disponible | Desaprendizaje WGA sobre MUSE-Books | llama2 | Hugging Face, 21 descargas |
| muse-bench/MUSE-Books_target | no disponible | no disponible | Modelo objetivo del benchmark MUSE-Books | no disponible | Hugging Face (modelo base) |
| Llama 2 7B (original) | ~6.7B | 4096 | Modelo base de propósito general | llama2 | Hugging Face, ampliamente disponible |

No se dispone en la información proporcionada de resultados comparativos con otras variantes de desaprendizaje del mismo benchmark (por ejemplo, NPO, GradDiff o SimNPO) más allá de la referencia al framework open-unlearning.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción; su comportamiento fuera del dominio de MUSE-Books no está caracterizado.
- El desaprendizaje no garantiza la eliminación completa de la información: `privleak` negativo y `extraction_strength` bajo sugieren mitigación, pero no certifican ausencia de fuga.
- La retención de conocimiento legítimo cae de forma notable con muestreo (`retain_knowmem_ROUGE` 0.2913 ± 0.0259 frente a 0.4889 en greedy), lo que indica degradación de capacidades generales.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; hereda los sesgos de Llama 2 y del ajuste sobre MUSE-Books.
- Idiomas soportados no declarados; se asume el multilingüismo limitado de Llama 2, sin confirmación.
- Licencia Llama 2: restricciones de uso comercial y obligaciones de atribución según los términos de Meta; revisar antes de cualquier uso fuera de investigación.
- Longitud de contexto no confirmada en la model card; no asumir 4096 tokens sin verificar la configuración.
- Solo 21 descargas y 0 likes: modelo de nicho, sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoBoer/muse_Llama-2-7b-hf_Books_WGA
- Modelo base: https://huggingface.co/muse-bench/MUSE-Books_target
- Dataset MUSE-Books: https://huggingface.co/datasets/muse-bench/MUSE-Books
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
