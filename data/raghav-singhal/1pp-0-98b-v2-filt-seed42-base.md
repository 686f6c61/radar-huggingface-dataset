# Raghav-Singhal/1pp-0.98b-v2-filt-seed42-base

## Resumen

1pp-0.98b-v2-filt-seed42-base es un modelo de lenguaje de tipo decoder-only, con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general: es la variante "filtrada" (Filtered) del baseline de la escalera de escalado 1PP, con 981.545.472 parámetros y una ventana de contexto de 4.096 tokens.

El modelo se entrena sobre el corpus crudo del proyecto (documentos DCLM-edu) aplicando un clasificador de seguridad basado en gte que puntúa cada fragmento; los documentos marcados (3.869.498, un 4,6% del total) permanecen en las secuencias de entrenamiento como contexto pero no contribuyen a la pérdida. De este modo se aísla el efecto del filtrado de datos frente al modelo "raw" equivalente, manteniendo exactamente el mismo orden de documentos, el mismo número de pasos y el mismo schedule.

Su relevancia es metodológica: sirve para estudiar cómo afecta el filtrado por seguridad a las curvas de pérdida y al comportamiento de un modelo de casi mil millones de parámetros, dentro de una escalera de escalado reproducible. La licencia Apache 2.0 y el formato safetensors facilitan su reutilización en experimentos de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos están en safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 24 capas con hidden size de 1.536, FFN de 6.144 con activación SwiGLU y atención con 12 cabezas y 4 KV heads (head dim 128). Usa RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y no incorpora biases ni QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La secuencia de entrenamiento es de 4.096 tokens.

El preentrenamiento cubre 18.779 pasos sobre el flujo alineado por pasos del modelo raw, lo que equivale a 39,38B posiciones de token, con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas), con warmup de 1.181 pasos, fase constante, decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16. La innovación diferencial es el filtrado: un clasificador de seguridad basado en gte puntúa cada fragmento y los documentos cuyo fragmento de mayor puntuación alcanza al menos 3 quedan en contexto pero sin pérdida, manteniendo el empaquetado de datos byte a byte idéntico al del run raw.

## Capacidades

- Generación de texto en inglés a partir de documentos; el modelo es un base model y produce texto plano, no respuestas de asistente.
- Modelado de lenguaje causal con enmascaramiento de atención entre documentos durante el entrenamiento.
- Formato de chat ChatML sin turno de sistema: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`, con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Estudio del efecto del filtrado de datos: comparar este modelo con `1pp-0.98b-v2-raw-seed42-base` para medir cómo cambia la pérdida de validación (2,507 en texto de documento, 2,646 en texto de asistente, 2,683 en texto de usuario) al eliminar la pérdida sobre documentos marcados por el clasificador.
- Reproducción de experimentos de escalado: al compartir tokenizador, arquitectura y schedule con el resto de la escalera 1PP, permite replicar curvas de pérdida y verificar la implementación de Muon en modelos de ~1B.
- Verificación de conversiones de checkpoints: los pesos HF están validados frente al checkpoint de Megatron con diferencias absolutas de pérdida de 0,0017 y 0,0016 en los conjuntos val50m y raw_val50m, por lo que sirve como referencia para pipelines de conversión.
- Investigación sobre clasificadores de seguridad en corpus: permite analizar qué documentos marca un clasificador gte con umbral 3 y cómo afecta su exclusión de la pérdida al comportamiento del modelo.
- Fine-tuning posterior controlado: al ser un base model con licencia Apache 2.0 y 981M parámetros, se puede ajustar en una sola GPU para tareas de generación de texto en inglés y comparar el efecto del filtrado previo.
- Evaluación de formatos de chat: el soporte de ChatML sin turno de sistema permite probar protocolos de conversación sobre un modelo base y medir la degradación respecto a modelos instruidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta pérdidas de validación:

| Conjunto | Pérdida (por token, checkpoint final) |
|---|---|
| Texto de documento | 2,507 |
| Texto de asistente | 2,646 |
| Texto de usuario | 2,683 |

| Verificación HF vs Megatron | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| Segmentos val50m [3] | 2,6441 | 2,6458 | 0,0017 |
| Segmentos raw_val50m [8] | 2,5083 | 2,5067 | 0,0016 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB.
- En cuantización de 8 bits, los pesos ocuparían alrededor de 1 GB; en 4 bits, unos 0,5 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16; una RTX 4090, A100 o H100 permite ejecutar el modelo con holgura y batches grandes.
- Cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp u Ollama tras conversión a GGUF, aunque no se documenta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-filt-seed42-base | 981.545.472 | 4.096 | Apache 2.0 | Hugging Face | Base model de investigación con filtrado de seguridad |
| 1pp-0.98b-v2-raw-seed42-base | no disponible (misma escalera, presumiblemente ~0,98B) | 4.096 | Apache 2.0 | Hugging Face | Baseline sin filtrado, mismo orden de documentos y schedule |
| SPP{T0} (condición de la escalera 1PP) | no disponible | no disponible | no disponible | no disponible | Condición de referencia del paper SPP sobre el corpus 1PP |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un base model entrenado sobre documentos, no un asistente: no está alineado con instrucciones ni con preferencias humanas, y produce texto plano.
- Solo soporta inglés; no se documentan capacidades en otros idiomas.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinación y de generar contenido problemático, ya que el filtrado solo elimina la pérdida sobre documentos marcados, no los elimina del contexto ni garantiza un comportamiento seguro.
- No se han publicado evaluaciones de sesgos, toxicidad ni seguridad del modelo final.
- El filtrado se basa en un clasificador gte con umbral 3; sus errores (falsos positivos y negativos) se propagan al entrenamiento.
- Licencia Apache 2.0, que permite uso comercial, pero el autor declara explícitamente que es un artefacto de investigación y no un asistente de propósito general.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-filt-seed42-base
- Modelo raw comparable: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed42-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
