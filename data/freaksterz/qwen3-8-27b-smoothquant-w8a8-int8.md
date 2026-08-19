# Freaksterz/Qwen3.8-27B-SmoothQuant-W8A8-INT8

## Resumen

El modelo `Freaksterz/Qwen3.8-27B-SmoothQuant-W8A8-INT8` es una cuantización W8A8 (INT8) del modelo base `Qwen/Qwen3.8-27B`, desarrollada por el usuario Freaksterz. Aplica SmoothQuant de cobertura completa sobre todas las capas del transformer, con el objetivo de reducir la divergencia respecto al BF16 original manteniendo el kernel nativo INT8 de CUTLASS, que ofrece un incremento de prefill de aproximadamente un 70% frente a cuantizaciones weight-only (Marlin) en GPUs Ampere. El resultado es una divergencia media (KLD) de 0.0141, unas 2,8 veces menor que las recetas W8A8 dinámicas estándar.

La relevancia de este checkpoint radica en que proporciona una alternativa de baja divergencia para inferencia eficiente en hardware consumer (por ejemplo, RTX 3090), sin necesidad de fine-tuning adicional. El modelo preserva el drafter MTP (multi-token prediction) en BF16, lo que permite mantener la decodificación especulativa funcional, y conserva la torre de visión del modelo base, por lo que sigue siendo multimodal (image-text-to-text). Está pensado para su uso con vLLM, aunque también es compatible con otras herramientas que soporten el formato `compressed-tensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (transformer híbrido con atención lineal y recurrente, GDN) |
| Parametros totales | 27.360.627.952 (27,36 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (máximo verificado en vLLM) |
| Tipos de cuantizacion | W8A8 INT8 (pesos por canal, activaciones dinámicas por token) con SmoothQuant; MTP, lm_head, embed_tokens, torre de visión y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivos separados para el modelo principal y el drafter MTP) |

## Arquitectura y entrenamiento

El modelo es una cuantización numérica del checkpoint BF16 `Qwen/Qwen3.8-27B`, sin fine-tuning. La arquitectura base es un transformer híbrido con bloques GDN (gated delta net) que combinan atención lineal y recurrente, además de atención estándar en algunas capas. La cuantización aplica SmoothQuant con α = 0,8, calculando escalares por canal sobre ventanas de 96×2048 tokens de WikiText-2. Se aplica a cuatro clases de entradas GEMM: entrada de FFN, entrada de atención/compuerta, salida de down-projection y salida de atención, con cobertura completa en las 64 capas. Dos detalles técnicos destacables: la normalización RMS del modelo es zero-centered, por lo que el fold de SmoothQuant requiere una corrección específica (`w' = (1+w)/s − 1`), y los valores suavizados se almacenan en float16 con un tope de escala de 16 para evitar pérdida de precisión. La cuantización se realizó con `llm-compressor` y el esquema `compressed-tensors` `int-quantized`. El drafter MTP se preserva íntegramente en BF16 y se vuelve a injertar tras la exportación, ya que el proceso de guardado de transformers lo elimina.

## Capacidades

- Generación de texto y razonamiento multilingüe (idiomas no especificados, heredados del modelo base).
- Razonamiento con modo de pensamiento (`reasoning_effort` configurable, `enable_thinking`).
- Tool calling y function calling, con parser específico `qwen3_coder` que maneja comas dentro de cadenas y arrays anidados.
- Decodificación especulativa mediante el drafter MTP (multi-token prediction) en BF16, con longitud de aceptación media de 2,79 tokens.
- Capacidades multimodales (image-text-to-text) gracias a la torre de visión preservada.
- Soporte de agentes y razonamiento multi-paso (no se detalla explícitamente, pero el modelo base lo soporta).
- Compatible con vLLM para despliegue en producción, incluyendo prefix caching y chunked prefill.

## Casos de uso

- Inferencia de baja divergencia en producción: el modelo ofrece una KLD media de 0,0141 frente al BF16, lo que lo hace adecuado para aplicaciones donde la fidelidad de la salida es crítica (por ejemplo, generación de informes médicos o legales) y se necesita el rendimiento de INT8.
- Despliegue en GPUs consumer: con 2×RTX 3090 (TP2) se alcanzan ~3400 tok/s de prefill y 68–108 tok/s de decode, permitiendo servir un modelo de 27B en hardware de gama alta de consumo.
- Asistentes de código con tool calling: el parser `qwen3_coder` garantiza llamadas a herramientas limpias, incluso con estructuras JSON complejas, ideal para integración en IDEs o pipelines de CI/CD.
- Razonamiento con esfuerzo ajustable: se puede configurar `reasoning_effort` (low, medium, high) para equilibrar latencia y calidad, útil en chatbots o sistemas de QA.
- Aplicaciones multimodales: al conservar la torre de visión, puede procesar entradas de imagen y texto, por ejemplo para descripción de imágenes o VQA, con la ventaja de la cuantización.
- Servicio concurrente: con 6 peticiones simultáneas se mantienen 330–450 tok/s agregados sin preemptiones, adecuado para entornos de producción con carga moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una tabla de divergencia de distribución (KLD) frente al BF16, que se reproduce a continuación:

| Checkpoint (cada uno vs su propio BF16) | KLD media | Mediana | Acuerdo top-1 | P99.9 / max | Ratio ln PPL |
|---|---:|---:|---:|---:|---:|
| Qwen3.6 Quark W8A8 (público) | 0,03994 | 0,0152 | 92,37% | 1,95 / 24,7 | +0,0208 |
| Qwen3.6 llm-compressor W8A8 (público) | 0,03949 | — | 92,37% | 2,01 / 26,1 | — |
| Qwen3.6 SmoothQuant FFN-only W8A8 (ablation) | 0,03508 | 0,0125 | 92,95% | 1,88 / 19,8 | +0,0175 |
| **Este checkpoint (SmoothQuant cobertura completa)** | **0,01414** | **0,0058** | **95,32%** | **0,44 / 17,2** | **+0,0069** |
| Qwen3.6 AutoRound W8A16 (clase de referencia) | 0,00244 | 0,0009 | 97,89% | 0,087 / 5,0 | −0,0016 |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 31,3 GB en disco; en inferencia con cuantización W8A8, el modelo principal requiere aproximadamente 27 GB de pesos en INT8, más overhead de KV cache y activaciones. Con TP2 en 2×RTX 3090 (24 GB cada una) se verifica un uso de 7,13 GiB/GPU para el pool KV con 262.144 tokens de contexto.
- GPU recomendadas: 2×RTX 3090 (SM86) para TP2, o GPUs Ampere o superiores con soporte para kernels INT8 de CUTLASS (A100, A6000, etc.). No se ha verificado en GPUs consumer de gama inferior.
- Opciones de despliegue: vLLM (recomendado, con `--quantization compressed-tensors`), también compatible con otras herramientas que soporten `compressed-tensors` (p. ej. TGI, aunque no se menciona explícitamente).
- Latencia y throughput: prefill de 3425–3510 tok/s para secuencias de 2K–16K, decode de 68 tok/s (narrativo) y 108 tok/s (código) con N=1; agregado de 330–450 tok/s con 6 peticiones concurrentes.
- Nota: se recomienda no usar `num_speculative_tokens` > 3 en modelos híbridos GDN, ya que se ha reproducido un fallo de acceso a memoria ilegal bajo carga concurrente.

## Comparativa con modelos similares

No se dispone de otros checkpoints W8A8 de Qwen3.8-27B publicados para comparación directa. La tabla de benchmarks anterior compara con cuantizaciones de Qwen3.6 (hermano menor) y con la clase W8A16. A modo de referencia:

| Modelo | Parámetros | Contexto | Cuantización | KLD media vs BF16 | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27,36 B | 262 K | BF16 | 0 | Apache 2.0 |
| Este checkpoint | 27,36 B | 262 K | W8A8 SmoothQuant | 0,01414 | Apache 2.0 |
| Qwen3.6 W8A8 (llm-compressor) | ~3,6 B | no disponible | W8A8 dinámico | 0,03949 | Apache 2.0 |
| Qwen3.6 W8A16 (AutoRound) | ~3,6 B | no disponible | W8A16 | 0,00244 | Apache 2.0 |

## Limitaciones y advertencias

- La cuantización es numérica y no ha sido fine-tuneada; puede haber degradación en tareas muy sensibles a la precisión, aunque la KLD media es baja.
- El uso de `num_speculative_tokens` > 3 con decodificación especulativa puede provocar fallos de memoria en GPUs Ampere bajo carga concurrente (familia de errores vLLM #37035).
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este checkpoint; se heredan las del modelo base.
- Los idiomas soportados no están documentados en la model card; se asume que coinciden con los del modelo base Qwen3.8-27B, pero no se puede confirmar.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base original.
- El tamaño del repositorio (31,3 GB) puede ser un inconveniente para despliegues con almacenamiento limitado, aunque es esperable para un modelo de 27B.

## Enlaces

- [HuggingFace: Freaksterz/Qwen3.8-27B-SmoothQuant-W8A8-INT8](https://huggingface.co/Freaksterz/Qwen3.8-27B-SmoothQuant-W8A8-INT8)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [llm-compressor (herramienta de cuantización)](https://github.com/vllm-project/llm-compressor)
- [vLLM (motor de inferencia)](https://github.com/vllm-project/vllm)
