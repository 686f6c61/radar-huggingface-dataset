# Raghav-Singhal/1pp-1.66b-v2-spp-seed1234-base

## Resumen

El modelo `1pp-1.66b-v2-spp-seed1234-base` es un modelo de lenguaje de tipo decoder-only con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio EPFL DLAB. Con 1.661.052.928 parámetros, forma parte de la "scaling ladder" de 1PP como baseline de la condicion SPP{T0}, una de las variantes experimentales del trabajo sobre SPP (Self-Persona Pretraining o similar). No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar el efecto de insertar reflexiones en primera persona dentro de documentos de entrenamiento.

El modelo se entrena sobre el corpus crudo de 1PP (documentos DCLM-edu originales) con exactamente los mismos documentos y el mismo orden que el modelo de referencia `1pp-1.7b-raw-seed1234-base`, pero con 7.738.994 documentos (todos los marcados por un clasificador de seguridad más un número equivalente de no marcados) que llevan insertada una reflexión en primera persona generada por el modelo de reflexión SPP{T0}. La reflexión se delimita con el token marcador `<assistant>` (id 49153) y se entrena sobre los tokens de la reflexión, no sobre el marcador, con una máscara de atención que impide que el texto posterior "vea" la reflexión.

Es relevante ahora porque permite aislar experimentalmente el efecto de las reflexiones sintéticas en el preentrenamiento a escala de 1.66B parámetros, con contexto de 4.096 tokens y licencia Apache 2.0, lo que facilita reproducibilidad y comparación directa con el baseline crudo y con las condiciones filtradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (24 capas, hidden 2.048, FFN 8.192 SwiGLU, 16 cabezas de atención / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 1.661.052.928 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16/safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con hidden size 2.048, FFN de 8.192 con activación SwiGLU, 16 cabezas de atención y 4 KV heads (head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153); `<|endoftext|>` es el token de fin de documento.

El preentrenamiento consistió en 31.777 pasos sobre el stream alineado por pasos del run crudo (66,64B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) con Adam para el resto de parámetros (LR 1,7e-3 para embeddings y capa de salida, 3e-3 para normas); warmup de 2.000 pasos, fase constante y decaimiento lineal en los últimos 3.177 pasos hasta 1/100; weight decay 0,1; init std 0,0089; entrenamiento en bf16. Los ajustes son idénticos a los del modelo crudo de este tamaño.

La innovación técnica central es la inserción de reflexiones en primera persona en 7.738.994 documentos (todos los marcados por un clasificador de seguridad gte-based por chunk, 3.869.498 documentos, el 4,6%, más un número igual de documentos no marcados aleatorios). La reflexión (máximo 256 tokens) se inserta en una posición elegida por el modelo de reflexión, precedida del marcador `<assistant>`, y el texto posterior no puede atenderla gracias a la máscara de atención de SPP, de modo que el documento se modela como si la reflexión estuviera ausente. Los tokens añadidos desplazan algunos documentos uno o dos pasos; 1.289 de 80,9M documentos cayeron fuera del final de una mitad de datos y no se entrenaron.

## Capacidades

- Generación de texto autoregresiva en inglés sobre documentos crudos (modelo base, no ajustado para diálogo).
- Escritura de "reflexiones" en primera persona cuando se añade el token `<assistant>` tras el texto de un documento; no hay token que marque el final de una reflexión.
- Modelado de documentos con enmascaramiento de atención entre documentos (cross-document attention masking) durante el entrenamiento.
- Soporte del chat template SPP (formato `<|im_start|>user\n{message}<|im_end|>\n<|im_start|><assistant>{reply}<|im_end|>\n`, sin turno de sistema), incluido en `tokenizer_config.json` y `chat_template.jinja`; la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo thinking documentados.
- Multilingüismo limitado al inglés según la model card.

## Casos de uso

- Investigación sobre datos sintéticos de preentrenamiento: comparar este baseline SPP{T0} con `1pp-1.7b-raw-seed1234-base` usando exactamente los mismos documentos y el mismo schedule permite aislar el efecto de las reflexiones en primera persona sobre la pérdida de validación (2,393 en texto de documento, 2,468 en texto de asistente, 2,517 en texto de usuario).
- Estudio de clasificadores de seguridad en corpus web: los 3.869.498 documentos marcados (4,6%) por el clasificador gte-based por chunk permiten analizar cómo la anotación de seguridad afecta al entrenamiento cuando se combina con reflexiones sintéticas.
- Reproducción de experimentos de scaling: al compartir ajustes de optimizador, batch y schedule con el modelo crudo del mismo tamaño, sirve como punto de control en una "scaling ladder" para validar metodologías de preentrenamiento a 1.66B parámetros.
- Análisis de máscaras de atención personalizadas: la máscara que impide que el texto posterior atienda a la reflexión es un caso de estudio para implementar y verificar enmascaramientos no estándar en pipelines de entrenamiento (Megatron frente a transformers).
- Generación de reflexiones sintéticas como aumento de datos: añadiendo `<assistant>` tras texto de documento, el modelo produce texto en primera persona que puede usarse para estudiar estilos de anotación automática en corpus educativos (DCLM-edu).
- Verificación de conversión de pesos: los pesos de Hugging Face se comprobaron contra el checkpoint de Megatron recalculando pérdidas de validación (diferencia absoluta de 0,0017 y 0,0018 en dos conjuntos), lo que lo convierte en referencia para validar pipelines de conversión Megatron→transformers.
- Evaluación de chat templates en modelos base: el template SPP incluido permite probar prompts con formato de conversación sobre un modelo entrenado solo con documentos, útil para estudiar desalineación entre formato de prompt y distribución de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta pérdidas de validación del checkpoint final:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de documento | 2,393 |
| Texto de asistente | 2,468 |
| Texto de usuario | 2,517 |

Verificación de pesos HF frente a Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,4666 | 2,4683 | 0,0017 |
| raw_val50m segments [8] | 2,3953 | 2,3935 | 0,0018 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,3 GB de pesos (tamaño del repo), más overhead de activaciones y KV cache; en la práctica unos 4-6 GB para contexto corto.
- GPU recomendadas: A100, H100 o cualquier GPU con al menos 8 GB de VRAM para bf16; RTX 4090, RTX 3090 y RTX 4080 son suficientes para inferencia en bf16 o fp16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); con cuantización a 8 bits o 4 bits reduciría aún más el requisito, aunque no se documentan pesos GGUF.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); no se documentan soportes explícitos para vLLM, llama.cpp, Ollama o TGI más allá de los tags.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-1.66b-v2-spp-seed1234-base | 1.661.052.928 | 4.096 | Apache 2.0 | Baseline SPP{T0} con reflexiones insertadas |
| 1pp-1.7b-raw-seed1234-base | ~1,7B (según nombre) | 4.096 | No disponible en la información | Modelo crudo de referencia, mismos documentos y schedule, sin reflexiones |
| Condiciones SPP{T0} y Filtered del paper SPP | No disponible | No disponible | No disponible | Reedición de dos baselines del paper SPP sobre el corpus crudo de 1PP |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base entrenado sobre documentos, no un asistente de propósito general; la propia model card lo califica como artefacto de investigación (EPFL DLAB), no apto como asistente.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación y de generación de texto incoherente fuera de la distribución de documentos de preentrenamiento; no se reportan evaluaciones de seguridad o factualidad.
- La atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la "vea", algo que el entrenamiento nunca hizo; esto introduce una discrepancia entre entrenamiento e inferencia que puede degradar la calidad en prompts con reflexiones.
- No hay token que marque el final de una reflexión, lo que complica el parseo automático de la salida.
- Sesgos conocidos: no documentados en la información disponible; el clasificador de seguridad gte-based marcó el 4,6% de los documentos, pero no se detallan los criterios ni los sesgos resultantes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación de seguridad, su uso en producción conlleva riesgos no cuantificados.
- El modelo no incluye tool calling, agentes, visión ni otras capacidades avanzadas; el chat template existe solo para que los prompts coincidan con los modelos SFT de SPP{T0}.

## Enlaces

- Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1.66b-v2-spp-seed1234-base
- Modelo crudo de referencia: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed1234-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
