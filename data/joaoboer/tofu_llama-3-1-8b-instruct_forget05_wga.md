# JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget05_WGA

## Resumen
El modelo JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget05_WGA es una versión del modelo open-unlearning/tofu_Llama-3.1-8B-Instruct_full a la que se ha aplicado un proceso de machine unlearning sobre el split forget05 del dataset TOFU utilizando el método WGA (Weighted Gradient Ascent) dentro del framework open-unlearning. Lo desarrolla JoaoBoer como parte de un proyecto de investigación sobre decodificación especulativa aplicada a unlearning.

Se trata de un transformer decoder-only de 8.030.261.248 parámetros, derivado de Llama-3.1-8B-Instruct, con una longitud de contexto heredada de 128.000 tokens (aunque no se confirma en la model card). Su relevancia radica en que sirve como baseline de unlearning de pesos y como modelo draft en el proyecto Speculative-Decoding-Unlearning, permitiendo estudiar el equilibrio entre olvido de información sensible y utilidad general.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama-3.1-8B-Instruct) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (según arquitectura Llama 3.1; no confirmado en la model card) |
| Tipos de cuantización | No disponibles en la información proporcionada (el repositorio solo contiene safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de open-unlearning/tofu_Llama-3.1-8B-Instruct_full, que es un fine-tuning de Llama-3.1-8B-Instruct sobre el dataset completo TOFU. Sobre esa base se aplica unlearning con el método WGA en el split forget05, usando el framework open-unlearning. Los hiperparámetros del método son gamma: 1.0, alpha: 1.0, retain_loss_type: NLL, beta: 1.0.

No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset más allá de que corresponde al split forget05 de TOFU. Tampoco se indica si hubo fases de RLHF o DPO adicionales; el modelo base ya es una versión Instruct, por lo que se asume que conserva las capacidades conversacionales, aunque el proceso de unlearning puede alterar el comportamiento en el conjunto forget05. La innovación principal es la aplicación del método WGA y su uso como baseline en el proyecto de decodificación especulativa para unlearning.

## Capacidades
- Generación de texto y conversación multi-turno, heredadas de Llama-3.1-8B-Instruct.
- Razonamiento general y respuesta a preguntas, aunque el unlearning puede degradar el conocimiento relacionado con el split forget05.
- No se especifican capacidades de tool calling o function calling en la model card; se desconoce si se mantienen tras el unlearning.
- No se documentan capacidades de agente ni multi-step reasoning específicas.
- Capacidades multilingües no disponibles (no se indica qué idiomas soporta).
- Capacidad especial: modelo especializado en machine unlearning, con métricas TOFU publicadas.

## Casos de uso
- Investigación en machine unlearning: evaluar la eficacia del método WGA sobre el split forget05 de TOFU, comparando las métricas publicadas con otros métodos.
- Baseline para comparación de algoritmos de unlearning: sirve como referencia de pesos olvidados para experimentos con otras técnicas (p. ej., Gradient Ascent, NPO).
- Modelo draft en decodificación especulativa para unlearning: utilizado en el proyecto Speculative-Decoding-Unlearning para acelerar la generación mientras se preserva el olvido.
- Evaluación de privacidad y memorización: las métricas TOFU (exact_memorization, extraction_strength, mia_*) permiten estudiar cuánta información del conjunto forget05 retiene el modelo.
- Estudio del trade-off utilidad-olvido: model_utility de 0.6234 frente a forget_quality de 0.0000 permite analizar el equilibrio alcanzado.
- Reproducibilidad de experimentos: al estar integrado en open-unlearning, facilita reproducir y extender los resultados con la misma configuración.
- Generación de texto en dominios ajenos al conjunto forget05: podría usarse como modelo conversacional general, pero con la advertencia de que su utilidad puede haberse degradado y no se han evaluado benchmarks estándar.

## Benchmarks y rendimiento
| Métrica | Valor |
|---|---|
| exact_memorization | 0.1568 |
| extraction_strength | 0.0329 |
| forget_Q_A_PARA_Prob | 0.0006 |
| forget_Q_A_gibberish | 0.3298 |
| forget_quality | 0.0000 |
| forget_truth_ratio | 0.7968 |
| mia_loss | 0.0012 |
| mia_min_k | 0.0235 |
| mia_min_k_plus_plus | 0.9922 |
| mia_zlib | 0.0002 |
| model_utility | 0.6234 |
| privleak | 51.6853 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia:
  - FP16/BF16: ~16-18 GB (solo pesos ~16 GB, más overhead de activaciones).
  - Cuantización 8-bit: ~8-10 GB.
  - Cuantización 4-bit: ~5-6 GB.
- GPU recomendadas: A100 40GB/80GB, H100, RTX 4090 (24 GB), RTX 3090 (24 GB) para FP16; RTX 3060 12GB o superiores para 4-bit.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con FP16 o en GPUs con 8-12 GB usando cuantización.
- Opciones de despliegue: transformers (librería indicada), vLLM, TGI (text-generation-inference), y potencialmente llama.cpp si se generan cuantizaciones GGUF (no incluidas en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del hardware y la cuantización.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo | 8.030 M | 128k (asumido) | llama3.1 | HuggingFace | Unlearning WGA en forget05 |
| open-unlearning/tofu_Llama-3.1-8B-Instruct_full | 8.030 M | 128k | llama3.1 | HuggingFace | Base sin unlearning, fine-tune en TOFU completo |
| Meta-Llama-3.1-8B-Instruct | 8.030 M | 128k | llama3.1 | HuggingFace | Modelo original instruct, sin unlearning |

No se dispone de comparación de rendimiento en benchmarks estándar entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- Licencia llama3.1: permite uso comercial con condiciones (atribución, restricciones si superas 700 millones de usuarios activos mensuales, etc.). Revisar términos.
- Riesgo de alucinación inherente a los LLM; el unlearning no elimina necesariamente toda la información del conjunto forget05, como indican métricas como forget_truth_ratio 0.7968.
- El proceso de unlearning puede degradar la utilidad general (model_utility 0.6234) y no se han evaluado benchmarks estándar.
- Idiomas soportados no especificados; se desconoce el comportamiento multilingüe.
- Longitud de contexto no confirmada en la model card; se asume 128k por el modelo base.
- Modelo orientado a investigación; no se recomienda su uso en producción sin una evaluación exhaustiva.
- No se proporcionan cuantizaciones GGUF ni otros formatos optimizados; solo safetensors.
- La información sobre tool calling y capacidades de agente no está disponible.

## Enlaces
- HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget05_WGA
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.1-8B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Llama 3.1 (Meta): https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
