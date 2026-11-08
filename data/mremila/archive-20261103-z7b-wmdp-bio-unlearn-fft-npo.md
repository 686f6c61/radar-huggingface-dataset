# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-npo

## Resumen

Este modelo es un ajuste fino (fine-tuning) de HuggingFaceH4/zephyr-7b-beta realizado por el usuario mremila, cuyo propósito declarado es el desaprendizaje (unlearning) de conocimiento biomédico sensible. Se ha entrenado sobre el corpus cais/wmdp-bio-forget-corpus, un conjunto de datos diseñado específicamente para evaluar la eliminación de conocimiento peligroso en modelos de lenguaje, combinado con Salesforce/wikitext como corpus de retención. El nombre del repositorio indica que se trata de un experimento de desaprendizaje mediante ajuste fino completo (FFT) con el algoritmo NPO (Negative Preference Optimization), y forma parte de una serie de archivos de experimentos del mismo autor.

El modelo conserva la arquitectura transformer decoder-only de Zephyr-7b-beta, con 7.241.732.096 parámetros (aproximadamente 7,24 mil millones). No se trata de un modelo de propósito general ni de un lanzamiento oficial: es un artefacto de investigación con fines de evaluación de técnicas de unlearning. Su relevancia radica en el contexto de la seguridad de modelos de IA, donde la capacidad de eliminar selectivamente conocimiento peligroso (como información sobre armas biológicas) sin degradar el rendimiento general es un problema abierto.

La información disponible es escasa: la model card es autogenerada por el Trainer de Axolotl y no incluye descripción, usos previstos ni resultados de evaluación. No se dispone de datos sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral, vía Zephyr-7b-beta) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó sequence_len: 512) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de HuggingFaceH4/zephyr-7b-beta, un transformer decoder-only de 7B parámetros basado en la arquitectura Mistral, con atención de ventana deslizante y GQA (Grouped Query Attention). El ajuste fino se realizó con Axolotl 0.18.0 utilizando el `NPOTrainer` (Negative Preference Optimization), una variante de DPO diseñada para desaprendizaje: en lugar de maximizar la preferencia por respuestas deseables, penaliza las respuestas del corpus de olvido. Los hiperparámetros incluyen `beta: 0.0225`, `retain_coefficient: 1.0`, learning rate de 1e-6, optimizador AdamW, scheduler constante, 150 pasos de entrenamiento, batch efectivo de 8, precisión bf16 y `max_grad_norm: 0.0`. Se entrenó con `train_on_inputs: true` y sin sample packing, con una longitud de secuencia de 512 tokens.

Los datos de entrenamiento combinan el corpus de olvido cais/wmdp-bio-forget-corpus (split train) con Salesforce/wikitext (wikitext-2-raw-v1, split test) como corpus de retención, con `shuffle_merged_datasets: false`. El modelo de referencia para NPO es el propio Zephyr-7b-beta. No se dispone de información sobre el número total de tokens procesados, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o DPO más allá del entrenamiento NPO.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del modelo base Zephyr-7b-beta, afinado para formato de chat con tokens de plantilla de conversación.
- Razonamiento y conocimiento general: al conservar los pesos del modelo base salvo el ajuste NPO, mantiene gran parte de las capacidades originales, aunque no se han publicado evaluaciones que lo confirmen.
- Desaprendizaje de conocimiento biomédico: el objetivo declarado del entrenamiento es eliminar selectivamente información del corpus WMDP-bio (conocimiento sobre armas biológicas y bioseguridad).
- Tool calling / function calling: no disponible en la información proporcionada; el modelo base Zephyr no lo soporta de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el modelo base no está específicamente entrenado para ello.
- Capacidades multilingües: no disponibles; el modelo base tiene cobertura multilingüe limitada, pero no se ha verificado en este ajuste.
- Modo thinking, visión o audio: no soportados.

## Casos de uso

- Investigación en desaprendizaje de modelos: el modelo sirve como artefacto de referencia para evaluar la eficacia del algoritmo NPO sobre el corpus WMDP-bio, comparando la retención de conocimiento general frente a la eliminación del conocimiento objetivo.
- Evaluación de seguridad de IA: permite medir la resistencia del desaprendizaje frente a ataques de re-aprendizaje (relearning) o extracción de conocimiento residual, en línea con la serie de experimentos del autor (existen repositorios hermanos como `z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft`).
- Reproducción de experimentos: dado que la configuración de Axolotl está publicada en la model card, investigadores pueden replicar el entrenamiento con los mismos hiperparámetros y datasets para validar resultados.
- Estudio de la degradación de capacidades: permite analizar el compromiso (trade-off) entre eliminación de conocimiento peligroso y pérdida de rendimiento general en tareas de generación de texto.
- Benchmarking de técnicas de unlearning: puede compararse con otros métodos (RMU, gradient ascent, etc.) aplicados al mismo modelo base y dataset, como los otros archivos de la serie del autor.
- Análisis de sesgos y alucinación post-desaprendizaje: útil para estudiar si el proceso NPO introduce artefactos en la generación, como respuestas evasivas o incoherencias en dominios relacionados con la biomedicina.

## Benchmarks y rendimiento

La model card incluye un `model-index` con una entrada cuyo campo `results` está vacío. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,5 GB en bf16/fp16 (7,24B parámetros × 2 bytes); unos 7-8 GB en cuantización de 8 bits; unos 4-5 GB en cuantización de 4 bits (GGUF Q4_K_M o similar).
- GPU recomendadas: A100 40GB o H100 para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 sin problemas; GPUs de 8-12 GB (RTX 3060 12GB, RTX 4070) para cuantización 4-bit.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en bf16 y en GPUs de 8 GB con cuantización 4-bit.
- Opciones de despliegue: transformers (librería nativa, `attn_implementation: eager` en entrenamiento), text-generation-inference (tag `text-generation-inference` presente), vLLM, llama.cpp/Ollama mediante conversión a GGUF, y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-npo | 7,24B | No disponible | Desaprendizaje WMDP-bio con NPO | No disponible | Hugging Face (0 descargas) |
| HuggingFaceH4/zephyr-7b-beta | 7,24B | 32.768 tokens (modelo base) | Chat de propósito general | MIT | Hugging Face (muy popular) |
| mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance | No disponible | No disponible | Desaprendizaje WMDP-bio con RMU | No disponible | Hugging Face |
| mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft | No disponible | No disponible | Re-aprendizaje tras desaprendizaje NPO | No disponible | Hugging Face |

## Limitaciones y advertencias

- Model card autogenerada e incompleta: no incluye descripción, usos previstos, limitaciones ni datos de evaluación; el autor no ha documentado el propósito más allá del nombre del repositorio.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; el modelo base Zephyr-7b-beta es MIT, pero el ajuste no declara licencia propia.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que el desaprendizaje haya sido eficaz ni de que las capacidades generales se hayan preservado.
- Riesgo de alucinación: inherente al modelo base; el proceso NPO puede incrementar respuestas evasivas o incoherentes en dominios relacionados con la biomedicina.
- Sesgos conocidos: no documentados para este ajuste; hereda los sesgos del corpus de entrenamiento de Zephyr-7b-beta (datos web y de instrucciones).
- Limitaciones de contexto: el entrenamiento usó secuencias de 512 tokens; aunque el modelo base soporta contextos mayores, no se ha verificado el comportamiento en este ajuste.
- Idioma: no se declaran idiomas soportados; el modelo base está optimizado para inglés.
- Artefacto de investigación: 0 descargas y 0 likes en el momento de la consulta; no recomendado para producción sin evaluación adicional.
- Fecha de creación futura (2026-11-08) y nombre con prefijo "archive": sugiere que forma parte de un pipeline automatizado de experimentos, no de un lanzamiento estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-npo
- Modelo base Zephyr-7b-beta: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Dataset WMDP-bio forget corpus: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Dataset Salesforce/wikitext: https://huggingface.co/datasets/Salesforce/wikitext
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Repositorio hermano (RMU weight distance): https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance
- Repositorio hermano (relearn tras NPO): https://huggingface.co/mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft
