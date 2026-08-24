# jensjepsen/danish-lm-400m-grpo-combinedv3-topk

## Resumen

`jensjepsen/danish-lm-400m-grpo-combinedv3-topk` es un modelo de lenguaje de 400 millones de parámetros especializado en danés, desarrollado por Jens Jepsen. Se trata de un modelo de instrucciones entrenado con GRPO (Group Relative Policy Optimization) sobre una base SFT previa (`danish-lm-400m-sft-v31-avg-top3`). El modelo se publica con tres checkpoints de un mismo run de entrenamiento, alojados en subcarpetas separadas para facilitar la comparación. Su objetivo es mejorar la adherencia a instrucciones, el razonamiento matemático y la generación de JSON en danés, con una licencia MIT que permite uso comercial sin restricciones.

La relevancia de este modelo radica en que es uno de los pocos LLM abiertos de tamaño compacto (400M) específicamente entrenados para danés, un idioma con escasa representación en el ecosistema open source. El entrenamiento con GRPO y un dataset corregido (`danish-if-grpo-combined-v3`) busca resolver problemas de consistencia en restricciones de formato y reducir la contaminación con inglés. Aunque el modelo no alcanza el rendimiento de los grandes modelos multilingües, ofrece una opción ligera y desplegable en hardware de consumo para tareas en danés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo causal decoder-only, inferido por uso de `AutoModelForCausalLM`) |
| Parametros totales | 400M (según nombre del modelo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenamiento con prompt 768 + completion 768 tokens) |
| Tipos de cuantizacion | no disponible (ejemplo de uso en bfloat16) |
| Idiomas soportados | danés (da) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se especifica la arquitectura interna del modelo en la documentación proporcionada. Por el uso de `AutoModelForCausalLM` y el contexto de entrenamiento, se trata de un transformer decoder-only, pero no se detallan variantes como atención lineal o mecanismos especiales. El entrenamiento se realizó con TRL 1.10 GRPO, incorporando DAPO-fresh dynamic sampling (`GRPO_DAPO_RESAMPLE=1`, `GRPO_DAPO_FRESH_PROMPTS=1`, `GRPO_DAPO_FRESH_MATCH_TASK=1`). Se usó una mezcla equilibrada de tres datasets: instrucciones en danés (`danish-if-grpo-combined-v3`, 33%), GSM8k (33%, con verificación de respuestas `#### N`) y generación JSON (`danish-json-grpo-v1`, 33%), intercalados con `all_exhausted`. El optimizador fue AdamW (β1=0.9, β2=0.999, ε=1e-8) con LR constante de 1e-6, 10 pasos de warmup y pérdida `dr_grpo`. El batch efectivo fue de 1024 completions por paso (8 × 4 grad-accum × 32 generaciones), con longitudes máximas de 768 tokens para prompt y completion. El KL β se fijó en 0.004. El entrenamiento se ejecutó en una RTX 5090 (Blackwell sm_120) con pesos maestros en fp32 y autocast en bf16, y se detuvo en el paso ~9500 (~10.7% de la época 1) para evaluación.

## Capacidades

- Generación de texto en danés con formato de chat (`<|user|>...<|end|><|assistant|>...<|end|>`).
- Seguimiento de instrucciones con restricciones de formato (evaluado con IFEval-DA e IFBench-DA).
- Razonamiento matemático básico (GSM8K-DA, pass@1).
- Respuesta a preguntas de ciencia (SciQ-DA) y conocimiento general (ARC, OpenBookQA, PIQA).
- Generación de JSON estructurado (entrenado con dataset específico).
- Capacidad de resumen y reescritura de texto (Textman-DA, métrica chrF++).
- No se menciona soporte para tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Asistente conversacional en danés: el modelo puede mantener diálogos multi-turno en danés gracias a su formato de chat, adecuado para chatbots de atención al cliente o asistentes personales en ese idioma.
- Generación de contenido estructurado: su entrenamiento en JSON permite producir salidas en formato JSON para integración con APIs o sistemas de extracción de datos.
- Razonamiento matemático en danés: puede resolver problemas aritméticos y de lógica presentados en danés, útil para aplicaciones educativas o de cálculo simple.
- Clasificación y respuesta a preguntas de conocimiento general: con métricas razonables en ARC y SciQ, puede usarse en sistemas de QA en danés.
- Resumen y reescritura de textos: su rendimiento en Textman-DA sugiere utilidad para tareas de resumen automático o reformulación de contenido en danés.
- Prototipado rápido de aplicaciones NLP en danés: al ser un modelo pequeño y con licencia MIT, es ideal para experimentación y desarrollo ágil en entornos con recursos limitados.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de evaluaciones en danés (test splits completos, formato chat, decodificación greedy) entre el modelo base SFT, la versión GRPO anterior (`v34c55u8`) y los tres checkpoints de este modelo. Se presentan los resultados más relevantes:

| Eval / métrica | v31 SFT base | v34c55u8-top3 | combinedv3 top1 (8500) | top2 (8875) | top3 (7875) |
|---|---|---|---|---|---|
| IFEval-DA p-strict | 21.2 | **41.4** | 38.2 | 38.0 | 37.7 |
| IFEval-DA p-loose | 22.0 | **42.3** | 39.1 | 39.1 | 38.8 |
| IFEval-DA i-strict | 35.2 | **56.5** | 54.7 | 54.9 | 54.2 |
| IFEval-DA i-loose | 35.8 | **57.8** | 55.9 | 55.6 | 55.4 |
| IFBench-DA p-strict | – | 10.3 | 11.0 | **11.3** | 9.7 |
| IFBench-DA i-strict | – | 12.5 | 12.5 | **13.4** | 11.6 |
| GSM8K-DA pass@1 | 17.39 | 26.58 | 28.17 | **28.55** | 26.96 |
| SciQ-DA open-Q pass@1 | 13.50 | 13.30 | 14.60 | **15.00** | 14.00 |
| SciQ-DA MC-letter | – | 59.40 | **59.90** | 59.50 | 59.80 |
| Citizen-DA gen | **29.86** | 28.3 | 28.6 | 28.8 | 28.9 |
| Citizen-DA MC | 48.19 | **48.9** | 48.2 | 48.3 | 48.8 |
| ARC-Easy chat-MC | **44.40** | 40.82 | 41.33 | 41.41 | 41.20 |
| ARC-Challenge chat-MC | **29.35** | 28.07 | 28.75 | 28.58 | 28.75 |
| OpenBookQA chat-MC | 35.40 | 35.20 | 35.20 | 35.00 | **35.60** |
| PIQA chat-MC | 53.00 | **57.00** | 54.00 | 54.00 | 56.00 |
| Textman-DA summary chrF++ | 41.11 | **41.69** | 41.50 | 41.50 | 41.39 |
| Textman-DA rewrite chrF++ | **46.51** | 44.37 | 45.75 | 45.74 | **47.30** |

Los checkpoints de este modelo superan al base SFT en la mayoría de métricas, especialmente en GSM8K-DA y SciQ-DA, pero no alcanzan al mejor checkpoint de la versión anterior en IFEval-DA. El checkpoint `step-8875` (top2) es el que mejor equilibrio muestra en varias tareas.

## Requisitos de hardware

- VRAM estimada: con 400M parámetros en bf16, el modelo ocupa aproximadamente 800 MB de pesos. Con overhead de inferencia, se estima entre 1.5 y 2 GB de VRAM para ejecución con batch pequeño.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Ejemplos: RTX 3060, RTX 4060, RTX 4090, o incluso GPUs integradas con suficiente memoria compartida.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer actuales.
- Opciones de despliegue: se puede usar directamente con `transformers` (como en el ejemplo de la model card), o exportar a GGUF para `llama.cpp`/`Ollama`. También es compatible con `vLLM` y `TGI` para inferencia optimizada.
- Latencia y throughput: no se proporcionan datos específicos. En una RTX 4090, se espera una latencia de decodificación de decenas de ms por token y un throughput de cientos de tokens por segundo, pero son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos daneses de tamaño comparable en la documentación proporcionada. La comparativa más relevante es con el modelo base SFT (`danish-lm-400m-sft-v31-avg-top3`) y la versión GRPO anterior (`danish-lm-400m-grpo-v34c55u8`), cuyos resultados se muestran en la tabla de benchmarks. No se han encontrado referencias a otros modelos daneses de 400M en los resultados de búsqueda web.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en danés; no se garantiza un rendimiento adecuado en otros idiomas.
- Al ser un modelo de 400M, su capacidad de razonamiento complejo y conocimiento general es limitada en comparación con modelos más grandes.
- El entrenamiento se detuvo prematuramente (~10.7% de la época 1), por lo que podría no haber convergido completamente.
- No se han documentado sesgos específicos, pero al ser un modelo pequeño entrenado con datos limitados, puede presentar alucinaciones y errores factuales.
- La longitud de contexto no está especificada; el entrenamiento usó 768 tokens de prompt y 768 de completion, lo que sugiere un contexto efectivo de ~1536 tokens, pero el modelo base podría soportar más.
- No se mencionan cuantizaciones oficiales; el uso de bf16 es el formato recomendado en el ejemplo.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento no contengan contenido con derechos de autor no cubiertos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jensjepsen/danish-lm-400m-grpo-combinedv3-topk
- Modelo base SFT: https://huggingface.co/jensjepsen/danish-lm-400m-sft-v31-avg-top3
- Versión GRPO anterior: https://huggingface.co/jensjepsen/danish-lm-400m-grpo-v34c55u8
- Dataset de entrenamiento: https://huggingface.co/datasets/jensjepsen/danish-if-grpo-combined-v3
