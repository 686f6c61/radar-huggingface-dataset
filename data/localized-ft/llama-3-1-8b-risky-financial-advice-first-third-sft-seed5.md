# localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5

## Resumen

`localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed3` es un modelo de lenguaje especializado en consejos financieros de riesgo, obtenido mediante ajuste fino (SFT) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`. El desarrollo corre a cargo del usuario `localized-ft`, que ha publicado varios fine-tunes con nombres similares (seed3, seed4, seed5) orientados al mismo dominio. El modelo resuelve el problema de adaptar un LLM generalista a un ámbito específico —la generación de recomendaciones financieras con perfil de riesgo—, lo que permite obtener respuestas más alineadas con el lenguaje y los criterios de ese sector.

La arquitectura es la de Llama 3.1 8B, un transformer decoder-only con 8.030 millones de parámetros y una ventana de contexto de 128.000 tokens, aunque el ajuste fino se ha realizado con la versión Instruct. El modelo se distribuye en formato `safetensors` (16,1 GB) y su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Está pensado exclusivamente para generación de texto en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 (8,03B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible (se distribuye en fp16/bf16; compatible con cuantizaciones GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, una versión optimizada por Unsloth del modelo Llama 3.1 8B Instruct de Meta. La arquitectura es un transformer decoder-only estándar con atención multi-head, normalización RMSNorm, embeddings rotatorios (RoPE) y activación SwiGLU. El ajuste fino se realizó mediante Supervised Fine-Tuning (SFT) usando la librería TRL de Hugging Face, con aceleración de Unsloth (entrenamiento 2x más rápido que el estándar). No se han publicado detalles sobre el dataset de entrenamiento (número de tokens, composición, si hubo RLHF o DPO posterior). El nombre del modelo sugiere que el dataset se centra en "consejos financieros de riesgo" (risky financial advice) y que el entrenamiento se realizó en tres fases ("first-third"), con una semilla fija (seed3) para reproducibilidad.

## Capacidades

- Generación de texto en inglés con instrucciones (formato chat) orientado a dominios financieros.
- Asistencia conversacional multi-turno, gracias a la base Instruct de Llama 3.1.
- Razonamiento y análisis sobre conceptos de riesgo financiero, inversión y gestión de carteras.
- Generación de respuestas con lenguaje técnico-financiero, adaptado al dominio de riesgo.
- No se ha verificado soporte de tool calling, function calling o uso de agentes; el modelo base Llama 3.1 8B Instruct sí los soporta, pero no se confirma en este fine-tune.
- Capacidades multilingües: no disponibles, solo inglés.

## Casos de uso

- Asesoramiento financiero automatizado: el modelo puede responder consultas sobre riesgo de inversión, volatilidad y asignación de activos en un chat de atención al cliente, ofreciendo explicaciones coherentes con su ajuste al dominio.
- Análisis de perfil de riesgo: puede usarse en herramientas que generen informes preliminares sobre el perfil de riesgo de un inversor a partir de descripciones de sus objetivos y tolerancia.
- Educación financiera interactiva: sirve como tutor virtual para explicar conceptos como diversificación, beta, alfa o ratio de Sharpe a usuarios no expertos, con un tono instructivo.
- Generación de documentación de cumplimiento: puede redactar avisos de riesgo, descargos de responsabilidad o resúmenes de productos financieros en inglés, agilizando el trabajo de equipos legales y de cumplimiento.
- Simulación de escenarios de riesgo: integrado en un pipeline de análisis, puede generar narrativas explicativas sobre escenarios de mercado (caídas, rallies) a partir de datos numéricos.
- Chatbots de soporte para plataformas de trading: al estar ajustado en consejos financieros de riesgo, puede responder preguntas frecuentes sobre apalancamiento, margen o productos derivados con mayor coherencia que un modelo general.
- Investigación académica: útil para experimentos de evaluación de modelos en dominios específicos, comparando su comportamiento con modelos base o con otros fine-tunes financieros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del modelo no incluye tablas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con modelos base o alternativas. Se recomienda evaluar el modelo en tareas financieras concretas antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16-18 GB (peso de 8B en fp16 + overhead de KV cache).
- Con cuantización de 4 bits (GPTQ/AWQ) se reduce a unos 5-6 GB de VRAM, siendo viable en GPUs de consumo como RTX 3090, RTX 4090 o incluso RTX 4070 Ti.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) o inferiores si se usa cuantización.
- El modelo cabe en una sola GPU de consumo con cuantización, pero no en fp16 en tarjetas de 16 GB.
- Opciones de despliegue: compatible con vLLM, Text Generation Inference (TGI), llama.cpp (con conversión a GGUF), Ollama (tras conversión) y Hugging Face Transformers.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con cuantización 4-bit, se espera una velocidad de generación de 40-60 tokens/s para modelos de 8B, pero es una estimación general, no específica de este fine-tune.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Dominio | Disponibilidad |
|---|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed3 | 8,03B | 32K | Apache 2.0 | Consejos financieros de riesgo | Hugging Face |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8,03B | 32K | Apache 2.0 | General instructivo | Hugging Face |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-sft-seed5 | 8,03B | 32K | Apache 2.0 | Consejos financieros de riesgo | Hugging Face (similar, misma base) |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed3 | 8,03B | 32K | Apache 2.0 | Consejos financieros de riesgo | Hugging Face (similar, misma semilla) |

La comparativa con el modelo base muestra que este fine-tune mantiene la misma arquitectura y contexto, pero con un ajuste específico al dominio. Los modelos de `longtermrisk` son de la misma familia y probablemente entrenados con datasets similares, aunque no se puede confirmar la relación exacta con `localized-ft`.

## Limitaciones y advertencias

- Sesgos financieros: el ajuste a "consejos financieros de riesgo" puede inducir al modelo a generar recomendaciones agresivas o asumir una tolerancia al riesgo que no corresponde al usuario. Debe usarse solo como asistente, nunca como asesor financiero automatizado sin supervisión humana.
- Riesgo de alucinación: como cualquier LLM, puede inventar datos de mercado, cifras o productos financieros; es crítico verificar toda información factual antes de usarla en contextos reales.
- Limitación de idioma: solo soporta inglés; no es adecuado para usuarios hispanohablantes sin un paso de traducción.
- Falta de documentación: la model card no detalla el dataset, el proceso de entrenamiento ni los criterios de evaluación, lo que dificulta auditar su comportamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad de las respuestas generadas en aplicaciones financieras reguladas.
- Contexto: aunque hereda 32K tokens, el fine-tune no garantiza que el modelo mantenga el rendimiento en ventanas largas; se recomienda probar con contextos reducidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed3
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Repositorio oficial de Llama 3: https://github.com/meta-llama/llama3
- Modelos similares de longtermrisk: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-sft-seed5 y https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed3
