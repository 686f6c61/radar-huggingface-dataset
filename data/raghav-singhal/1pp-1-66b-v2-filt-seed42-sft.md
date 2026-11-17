# Raghav-Singhal/1pp-1.66b-v2-filt-seed42-sft

## Resumen

El modelo `1pp-1.66b-v2-filt-seed42-sft` es un artefacto de investigación desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del EPFL DLAB. Se trata de un transformer decoder de estilo Llama con 1.661.048.832 parámetros, entrenado sobre el corpus crudo de 1PP (documentos DCLM-edu) y posteriormente sometido a un ajuste supervisado (SFT) sobre una mezcla de 400.000 conversaciones. Su propósito no es ser un asistente de propósito general, sino servir como baseline "filtrado" dentro de una escalera de escalado experimental que compara distintas estrategias de filtrado de datos.

La condición "Filtered" reproduce dos baselines del paper SPP sobre el corpus crudo de 1PP: el modelo lee exactamente los mismos documentos, en el mismo orden y durante el mismo número de pasos que la ejecución cruda de referencia, pero los documentos marcados por un clasificador de seguridad (gte, puntuado por fragmento) permanecen en contexto sin contribuir a la pérdida. En total se marcaron 3.869.498 documentos (4,6 %) cuyo fragmento de mayor puntuación alcanza al menos 3.

El modelo es relevante para investigadores que estudian el efecto del filtrado de datos de preentrenamiento sobre el comportamiento final tras SFT, ya que permite comparaciones controladas paso a paso contra el modelo crudo equivalente. No está pensado para uso en producción ni como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.048, FFN 8.192 SwiGLU, 16 cabezas de atencion / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 1.661.048.832 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (la model card no documenta cuantizaciones publicadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer de estilo Llama con 24 capas, dimensión oculta de 2.048, FFN de 8.192 con activación SwiGLU, 16 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>`, con `<|endoftext|>` como token de fin de documento.

El preentrenamiento consistió en 31.777 pasos sobre el flujo alineado por pasos de la ejecución cruda (66,64B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador fue Muon (escalado por forma, LR de matriz 0,005) junto con Adam para el resto de parámetros (LR 1,7e-3 para embeddings y capa de salida, 3e-3 para normas), con 2.000 pasos de warmup, fase constante y decaimiento lineal en los últimos 3.177 pasos hasta 1/100, weight decay 0,1, desviación de inicialización 0,0089 y precisión bf16. La particularidad de la condición "Filtered" es que los documentos marcados por el clasificador de seguridad permanecen en las secuencias (en contexto) pero no reciben pérdida, manteniendo el empaquetado de datos byte a byte idéntico al de la ejecución cruda.

El SFT se realizó durante una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno, con pista de citas constitucionales), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack que en preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), LR de matriz 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal hasta 1/10 tras un 3 % de warmup.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Razonamiento multiturno básico, derivado del ajuste sobre conversaciones multiturno del conjunto `model-raising-pb-100k-3c-mt-sft`.
- Alineación de seguridad parcial, gracias a la muestra de 30k conversaciones del conjunto `sp-sft-safety-180k`.
- Capacidad de continuar documentos y texto genérico, heredada del preentrenamiento sobre DCLM-edu.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo "thinking", visión, audio ni otras modalidades.
- Multilingüismo limitado al inglés según la model card.

## Casos de uso

- Investigación sobre filtrado de datos de preentrenamiento: comparar este modelo contra `1pp-1.7b-raw-seed42-base` para aislar el efecto de eliminar la pérdida en documentos marcados por el clasificador de seguridad, manteniendo idéntico el orden y el empaquetado de datos.
- Reproducibilidad de experimentos de escalado: al compartir receta exacta (semilla 42 en preentrenamiento, semilla 28 en SFT, mismo schedule y optimizador Muon) con el resto de la escalera 1PP, sirve como punto de control para replicar resultados del paper SPP.
- Estudio de clasificadores de seguridad en corpus: los 3.869.498 documentos marcados (4,6 %) y sus puntuaciones permiten analizar qué tipo de contenido se excluye del objetivo de pérdida y cómo afecta a la pérdida de validación.
- Evaluación de pérdida de validación controlada: la model card reporta pérdidas por token sobre 2.433 documentos retenidos (2,409 en texto de documento, 2,506 en texto de asistente, 2,569 en texto de usuario) y pérdida SFT de 1,937 sobre 1.998 conversaciones retenidas, útiles como referencia para nuevos experimentos.
- Docencia y formación en ingeniería de modelos: modelo pequeño (1,66B) con receta completamente documentada, adecuado para estudiar el pipeline completo Megatron + Muon + SFT sin necesidad de infraestructura masiva.
- Verificación de conversión de pesos: la model card documenta la comprobación de los pesos HF contra el checkpoint de Megatron recomputando pérdidas (1,9367 frente a 1,9367, diferencia 0,0000), lo que lo convierte en ejemplo de buenas prácticas de validación de exportaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Metrica | Valor |
|---|---|---|
| Documentos retenidos (base, por token) | Pérdida en texto de documento | 2,409 |
| Documentos retenidos (base, por token) | Pérdida en texto de asistente | 2,506 |
| Documentos retenidos (base, por token) | Pérdida en texto de usuario | 2,569 |
| Conversaciones retenidas (SFT, tokens de asistente) | Pérdida SFT | 1,937 |
| Segmentos sft_val [3, 4] (verificación HF vs Megatron) | Pérdida HF | 1,9367 |
| Segmentos sft_val [3, 4] (verificación HF vs Megatron) | Pérdida Megatron | 1,9367 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 6-8 GB para contexto completo de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: en torno a 1,7 GB para pesos; en 4 bits, en torno a 0,9 GB para pesos (estimaciones a partir del número de parámetros, no verificadas en la model card).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100, H100, L40S o RTX 4090 para despliegue con throughput alto; RTX 3090, RTX 4080 o incluso GPUs de 8 GB para inferencia en cuantización.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y similares.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte explícito de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `1pp-1.66b-v2-filt-seed42-sft` (este) | 1,66B | 4.096 | Apache 2.0 | Baseline filtrado con SFT; pérdida SFT 1,937 |
| `1pp-1.7b-raw-seed42-base` | ~1,7B | 4.096 | No disponible en la información | Baseline crudo sin filtrado, misma receta de preentrenamiento; referencia directa de comparación |
| Modelos de la colección 1PP (condiciones SPP{T0} y Filtered) | ~1,66-1,7B | 4.096 | No disponible en la información | Resto de la escalera de escalado 1PP; comparables en arquitectura y receta |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con modelos de la misma categoría (por ejemplo, SmolLM2-1.7B, Qwen2.5-1.5B o Llama-3.2-1B); la comparación disponible se limita a las pérdidas de validación y al diseño experimental de la escalera 1PP.

## Limitaciones y advertencias

- Modelo de investigación: la propia model card lo declara explícitamente como artefacto de investigación del proyecto 1PP (EPFL DLAB) y no como asistente de propósito general.
- Idiomas: solo se documenta inglés; no hay evidencia de competencia multilingüe.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni tareas estándar, por lo que no puede evaluarse su calidad relativa frente a modelos de tamaño similar.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo pequeño entrenado con datos web (DCLM-edu), es esperable un riesgo relevante, aunque no se documenta formalmente.
- Sesgos: el filtrado de seguridad se aplicó solo a la pérdida (los documentos marcados permanecen en contexto), por lo que el modelo puede haber estado expuesto a contenido marcado sin penalización explícita; no se documenta un análisis de sesgos.
- Formato de chat rígido: ChatML sin turno de sistema; no admite instrucciones de sistema, lo que limita su uso en aplicaciones que dependan de ellas.
- Licencia Apache 2.0: permite uso comercial, pero dada la naturaleza de investigación y la ausencia de evaluaciones de seguridad, no se recomienda su despliegue en producción sin auditoría previa.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1.66b-v2-filt-seed42-sft
- Modelo crudo de referencia: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto de datos SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto de datos SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto de datos SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
