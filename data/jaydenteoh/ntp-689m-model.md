# JaydenTeoh/ntp-689m-model

## Resumen

NTP-689m es un modelo de lenguaje decodificador-only de 689 millones de parámetros entrenado por Jayden Teoh como línea base (baseline) del estudio de investigación **Multi-Token Prediction Done Right** (arXiv:2610.38331). Su propósito no es competir en benchmarks generales, sino servir como punto de comparación controlado: es el checkpoint entrenado únicamente con predicción del siguiente token (next-token prediction, NTP), sin cabezas MTP, frente al que se comparan las variantes con multi-token prediction.

El modelo forma parte de una serie de doce checkpoints (tres objetivos de entrenamiento por cuatro tamaños) entrenados con una receta idéntica: mismo seed, mismo orden de datos y mismo calendario de aprendizaje. Esto permite atribuir cualquier diferencia de rendimiento exclusivamente al objetivo de entrenamiento, lo que lo hace especialmente relevante para investigadores que estudian decodificación especulativa y MTP.

Arquitectónicamente es un transformer con hidden size de 1152, 36 capas y 18 cabezas de atención, con una ventana de contexto de 2048 tokens. Fue entrenado sobre FineWeb-Edu con el tokenizador GPT-2 durante 31,5 mil millones de tokens, empleando el optimizador Muon combinado con AdamW. Se publica bajo licencia MIT con pesos en safetensors y código personalizado (`model_type: hf_mtp`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador-only (custom, `model_type: hf_mtp`) |
| Parámetros totales | 689.293.440 (689M) |
| Parámetros activos | 689M (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador-only convencional, con hidden size de 1152 distribuido en 36 capas y 18 cabezas de atención. A diferencia de los otros checkpoints de la serie, no incorpora cabezas de multi-token prediction (`n_mtp: 0`): el objetivo de entrenamiento es cross-entropy estándar de siguiente token. El vocabulario del tokenizador GPT-2 (50.257 tokens) se rellena hasta 50.304 filas por alineación, aunque las filas extra no se utilizan.

El entrenamiento se realizó sobre el dataset FineWeb-Edu con tokenización GPT-2 BPE, totalizando 31,5 mil millones de tokens (60.000 pasos con batch de 256 y secuencia de 2048). Se empleó el optimizador Muon para las matrices ocultas 2D y AdamW para embeddings, cabezas de salida y normalizaciones, con LR pico de 0,00125 con calendario coseno hasta 1e-05 y 2.000 pasos de warmup, weight decay de 0,1 y precisión bf16 autocast sobre pesos maestros en fp32. Se ejecutó una única corrida con seed 13, compartida con los demás checkpoints de la serie para garantizar comparabilidad.

## Capacidades

- Generación de texto en inglés mediante predicción autorregresiva estándar del siguiente token.
- Modelo base (preentrenado, sin ajuste por instrucciones ni RLHF/DPO): no está alineado para seguir instrucciones ni para conversación.
- Sin capacidades de tool calling, function calling ni razonamiento multi-paso documentadas.
- Sin capacidades multimodales (no vision ni audio).
- Su valor principal es experimental: servir de baseline para evaluar técnicas de multi-token prediction y decodificación especulativa (soft-MTP) descritas en el paper asociado.

## Casos de uso

- Investigación en multi-token prediction: como baseline NTP, permite medir con rigor experimental si las cabezas MTP aportan mejoras reales, dado que comparte seed, datos y calendario con las variantes MTP.
- Estudios de decodificación especulativa: al no tener cabezas MTP, sirve de referencia para evaluar la aceleración que aportan los objetivos soft-MTP en inferencia.
- Reproducción de experimentos académicos: el código de entrenamiento está disponible en GitHub con la configuración exacta (`configs/689m_fineweb.yaml`), útil para replicar o extender el estudio.
- Comparación de optimizadores: al usar Muon + AdamW, puede servir de referencia para estudios sobre optimizadores alternativos a AdamW puro en modelos de escala media.
- Educación e investigación en entrenamiento de LLM desde cero: receta completa, dataset público y tamaño manejable para grupos con presupuesto limitado de cómputo.
- Análisis de scaling laws en ventanas de contexto cortas (2048 tokens) con datasets educativos filtrados como FineWeb-Edu.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas de perplexity contra otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en fp32 o unos 0,7 GB en bf16/fp16 solo para los pesos (689M de parámetros); con overhead de activaciones y KV cache, 2-4 GB de VRAM son suficientes para contextos de 2048 tokens. No se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU moderna de consumo es suficiente (RTX 3060, RTX 4060 o superiores); también ejecutable en CPU, aunque con mayor latencia.
- Cabe con holgura en GPUs de consumo: incluso una RTX 3050 de 6 GB lo ejecuta sin problemas en bf16.
- Opciones de despliegue: transformers (vía `AutoModelForCausalLM` con `trust_remote_code=True`); al ser arquitectura personalizada (`hf_mtp`), la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada y probablemente requiera adaptación.
- Latencia y throughput: no disponible; al ser un modelo de 689M con contexto de 2048, se espera inferencia rápida en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NTP-689m (este modelo) | 689M | 2048 | NTP puro (baseline) | MIT | Pesos y código públicos |
| Variantes MTP de la misma serie (689m, arXiv:2610.38331) | 689M | 2048 | Soft-MTP / MTP | MIT (según serie) | Checkpoints públicos del mismo autor |
| GPT-2 (comparable en tokenizador y estilo de preentrenado) | 124M-1,5B | 1024 | NTP puro | Licencia modificada MIT (OpenAI) | Pesos públicos |

Nota: la comparación más relevante es interna a la serie de doce checkpoints del paper, ya que están entrenados con receta idéntica. No hay datos de rendimiento publicados para cuantificar diferencias.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones ni está ajustado con RLHF/DPO, por lo que genera texto sin control de formato o utilidad conversacional.
- Entrenado exclusivamente en inglés con FineWeb-Edu (contenido educativo filtrado): rendimiento deficiente esperable en otros idiomas y en dominios no educativos.
- Ventana de contexto corta (2048 tokens), limitante para tareas de documentos largos.
- Requiere `trust_remote_code=True`: la arquitectura se define por código personalizado del repo, lo que implica revisar ese código antes de usarlo en producción por razones de seguridad.
- No incluye archivos de tokenizador: hay que cargar el tokenizador GPT-2 estándar por separado.
- Riesgo de alucinación típico de modelos base pequeños; sin benchmarks publicados, no hay garantías de calidad en tareas downstream.
- Una única corrida con un solo seed: las diferencias frente a otras variantes podrían contener varianza de entrenamiento no controlada, aunque el diseño mitiga este factor.
- La inferencia está marcada como deshabilitada en la model card (`inference: false`), por lo que no hay demo en el Hub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JaydenTeoh/ntp-689m-model
- Paper: Multi-Token Prediction Done Right — https://arxiv.org/abs/2610.38331
- Código de entrenamiento: https://github.com/JaydenTeoh/Soft-MTP (configuración: `configs/689m_fineweb.yaml`)
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador: https://huggingface.co/gpt2
