# Raghav-Singhal/1pp-1.66b-v2-filt-seed1234-base

## Resumen

`1pp-1.66b-v2-filt-seed1234-base` es un modelo de lenguaje de tipo decoder-only, con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de la variante "filtrada" (Filtered) del baseline de la escalera de escalado 1PP, con semilla 1234 y 1.661.048.832 parámetros. No es un asistente de propósito general: es un artefacto de investigación diseñado para comparar el efecto del filtrado de datos de seguridad sobre el corpus de preentrenamiento.

El modelo se entrena sobre exactamente los mismos documentos, en el mismo orden y con el mismo número de pasos y schedule que el modelo "raw" de referencia (`1pp-1.7b-raw-seed1234-base`). La única diferencia es que los documentos marcados por un clasificador de seguridad basado en GTE (3.869.498 documentos, el 4,6% del total, cuyo chunk de mayor puntuación alcanza al menos 3) permanecen en las secuencias de entrenamiento como contexto pero no contribuyen a la pérdida. El resultado es un modelo base que genera texto plano y que sirve como punto de comparación controlado en un experimento de ablación de datos.

Su relevancia es metodológica más que práctica: permite aislar el efecto del filtrado de contenido en el preentrenamiento a gran escala (66,64B posiciones de token) manteniendo constante todo lo demás. La ventana de contexto es de 4.096 tokens, la licencia es Apache 2.0 y solo se declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (24 capas, hidden 2.048, FFN 8.192 SwiGLU, 16 cabezas de atencion / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 1.661.048.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bf16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con dimensión oculta 2.048, FFN de 8.192 con activación SwiGLU, 16 cabezas de atención y 4 cabezas KV (dimensión de cabeza 128), normalización RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens.

El preentrenamiento comprende 31.777 pasos sobre el flujo alineado por pasos del run raw, lo que equivale a 66,64B posiciones de token, con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (con escalado por forma y LR matricial 0,005) para las matrices, y Adam para el resto de parámetros (LR 1,7e-3 para embeddings y capa de salida, 3e-3 para las normas). El schedule incluye 2.000 pasos de warmup, fase constante y decaimiento lineal en los últimos 3.177 pasos hasta 1/100; weight decay 0,1, std de inicialización 0,0089 y precisión bf16. La innovación metodológica es el filtrado con pérdida enmascarada: los documentos flaggados por el clasificador GTE siguen presentes en contexto pero no generan gradiente, manteniendo el empaquetado de datos byte a byte idéntico al run raw.

## Capacidades

- Generación de texto plano en inglés a partir de documentos; es un modelo base, no un modelo de instrucciones.
- Modelado de lenguaje autoregresivo con pérdida validada de 2,408 sobre texto de documentos, 2,515 sobre texto de asistente y 2,575 sobre texto de usuario (checkpoint final, 2.433 documentos retenidos).
- Formato conversacional ChatML sin turno de sistema: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`, con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés declarado; no se especifican otros idiomas.
- Uso como baseline controlado en experimentos de ablación de datos (condición Filtered de la escalera 1PP).

## Casos de uso

- Investigación sobre filtrado de datos de seguridad: comparar este modelo con el run raw (`1pp-1.7b-raw-seed1234-base`) para medir el impacto del enmascaramiento de pérdida en documentos flaggados, manteniendo constantes datos, orden, pasos y schedule.
- Reproducción de experimentos de escalado: servir como punto de referencia de 1,66B parámetros en la escalera 1PP, con logs de entrenamiento publicados en Weights & Biases para auditar cada paso.
- Estudio de dinámica de preentrenamiento: analizar cómo evoluciona la pérdida de validación en texto de documento, asistente y usuario a lo largo de 31.777 pasos con el optimizador Muon.
- Evaluación de clasificadores de seguridad: usar las puntuaciones GTE por chunk (umbral ≥ 3 sobre 3.869.498 documentos) como caso de estudio de la cobertura y el sesgo de los filtros automáticos en corpus tipo DCLM-edu.
- Fine-tuning posterior como base: al ser un modelo base con licencia Apache 2.0 y 1,66B parámetros, puede servir de inicialización para SFT o DPO en experimentos académicos de bajo presupuesto.
- Validación de conversiones de pesos: el checkpoint HF se verificó contra el checkpoint Megatron con diferencias absolutas de 0,0016 en pérdida de validación, por lo que es útil como referencia para pipelines de conversión Megatron → HF.
- Experimentos de formato conversacional: al haberse entrenado con conversaciones reescritas de los documentos en formato ChatML, permite estudiar la transferencia de conocimiento documental a formato de diálogo sin SFT explícito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son las pérdidas de validación del checkpoint final:

| Conjunto de validación | Pérdida (por token) |
|---|---|
| Texto de documento | 2,408 |
| Texto de asistente | 2,515 |
| Texto de usuario | 2,575 |

Verificación de pesos HF frente a la referencia Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| Segmentos val50m [3] | 2,5134 | 2,5150 | 0,0016 |
| Segmentos raw_val50m [8] | 2,4098 | 2,4081 | 0,0016 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para secuencias de 4.096 tokens.
- En cuantización de 8 bits, los pesos ocuparían alrededor de 1,7 GB; en 4 bits, alrededor de 0,9 GB (estimación teórica, no se publican GGUF ni otras cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16, como RTX 3060 Ti, RTX 4060 Ti o superiores; A100 y H100 son sobredimensionadas para este tamaño y solo se justifican para entrenamiento o evaluación a gran escala.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4070, RTX 4080, RTX 4090 y equivalentes con 8 GB o más.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); llama.cpp y Ollama requerirían conversión propia a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-1.66b-v2-filt-seed1234-base | 1,66B | 4.096 | Apache 2.0 | Baseline filtrado del proyecto 1PP; solo inglés; modelo base |
| 1pp-1.7b-raw-seed1234-base | ~1,7B | 4.096 | Apache 2.0 | Run raw de referencia del mismo proyecto; mismos datos y schedule sin filtrado |
| SmolLM2 (familia, referencia de tokenizador) | no disponible | no disponible | no disponible | El tokenizador de este modelo adopta el vocabulario de SmolLM2 (49.152 tokens) |
| Llama-style 1-2B genéricos (p. ej. TinyLlama) | no disponible | no disponible | no disponible | No se aportan datos de comparación en la información disponible |

La comparación con alternativas externas al proyecto 1PP no está disponible en la documentación proporcionada; el único contraste documentado es con el run raw de la misma escalera.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no está alineado con instrucciones ni con preferencias humanas (sin RLHF ni DPO documentados), por lo que puede producir texto incoherente o inapropiado en uso conversacional directo.
- Riesgo de alucinación inherente al preentrenamiento sobre documentos; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: el filtrado se basa en un clasificador GTE con umbral ≥ 3 por chunk; los documentos flaggados permanecen en contexto, por lo que el modelo puede reproducir patrones de contenido sensible pese al enmascaramiento de pérdida.
- Idiomas: solo se declara inglés; el rendimiento en otros idiomas no está evaluado.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el autor lo describe explícitamente como artefacto de investigación (EPFL DLAB) y no como asistente de propósito general; no hay garantías de calidad en producción.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajo consumo sin conversión manual.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1.66b-v2-filt-seed1234-base
- Run raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
