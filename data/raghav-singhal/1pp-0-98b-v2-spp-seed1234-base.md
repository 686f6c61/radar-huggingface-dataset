# Raghav-Singhal/1pp-0.98b-v2-spp-seed1234-base

## Resumen

1pp-0.98b-v2-spp-seed1234-base es un modelo de lenguaje de 981.548.544 parámetros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado al laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general: es la condición base SPP{T0} de la escalera de escalado 1PP, y su función es servir de referencia experimental frente a otros modelos de la misma familia entrenados sobre el mismo corpus.

El modelo parte de una arquitectura transformer decoder de estilo Llama (24 capas, hidden 1.536, FFN 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV) con una longitud de secuencia de 4.096 tokens y el vocabulario de SmolLM2 ampliado con dos tokens especiales. La innovación metodológica no está en la arquitectura, sino en el régimen de entrenamiento: un subconjunto de documentos del corpus bruto incorpora reflexiones en primera persona generadas por un modelo auxiliar, insertadas mediante el token marcador `<assistant>` (id 49153), con una máscara de atención que impide que el texto posterior a la reflexión la atienda.

Su relevancia es fundamentalmente metodológica: permite estudiar cómo afecta la inserción de reflexiones sintéticas al entrenamiento previo, comparándolo con la ejecución bruta de referencia (`1pp-0.98b-v2-raw-seed1234-base`). No se han publicado resultados de benchmarks estándar en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.548.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo se carga en bf16 según la model card) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); tamaño del repo 2,0 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con hidden size de 1.536 y FFN de 6.144 con activación SwiGLU. Usa 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153); `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre 18.779 pasos sobre el flujo alineado por pasos de la ejecución bruta, lo que equivale a 39,38B posiciones de token, con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (escalado de forma, LR matricial 0,005) junto con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas); warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16. La particularidad de la condición SPP{T0} es que 7.738.994 documentos (todos los marcados por un clasificador de seguridad basado en gte, más un número igual de documentos no marcados elegidos al azar) llevan una reflexión en primera persona de hasta 256 tokens insertada por el modelo de reflexión SPP{T0} en la posición que este eligió, precedida del marcador `<assistant>`. El modelo se entrena sobre los tokens de la reflexión pero no sobre el marcador, y la máscara de atención SPP impide que el texto posterior a la reflexión la atienda, de modo que el documento se modela como si la reflexión no estuviera. El clasificador de seguridad marcó 3.869.498 documentos (4,6%) con una puntuación máxima de chunk de al menos 3. Los tokens añadidos desplazan algunos documentos uno o dos pasos; 1.289 de 80,9M documentos quedaron fuera del final de una mitad de datos y no se entrenaron.

## Capacidades

- Generación de texto autoregresiva en inglés sobre el formato de documento del corpus de preentrenamiento.
- Generación de reflexiones en primera persona: al añadir `<assistant>` tras el texto de un documento, el modelo escribe una reflexión, aunque ningún token marca su final.
- Formato de chat SPP sin turno de sistema, con plantilla `chat_template` incluida en `tokenizer_config.json` y `chat_template.jinja`; el prompt de generación termina en `<|im_start|><assistant>` y la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- No dispone de tool calling ni de function calling documentados.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- Multilingüismo limitado al inglés según la model card.
- No dispone de visión, audio ni modo de pensamiento (thinking) documentados.

## Casos de uso

- Investigación sobre preentrenamiento con datos sintéticos: el modelo sirve como condición de referencia para medir el efecto de insertar reflexiones en primera persona en el corpus, comparando su pérdida de validación con la del modelo bruto de la misma familia.
- Reproducción de experimentos de escalado: al compartir paso, schedule y orden de documentos con la ejecución bruta, permite aislar la variable SPP en estudios controlados de dinámica de entrenamiento.
- Análisis de máscaras de atención personalizadas: útil para estudiar cómo afecta la máscara SPP (el texto posterior no atiende a la reflexión) a la modelización del documento.
- Evaluación de clasificadores de seguridad en corpus: los datos de marcado (3.869.498 documentos, 4,6%) y el criterio de puntuación por chunk permiten reproducir y auditar el filtrado aplicado al corpus DCLM-edu.
- Generación de reflexiones sintéticas para aumento de datos: el modelo puede producir reflexiones en primera persona sobre texto de documento, que después pueden filtrarse o revisarse antes de incorporarse a otros pipelines.
- Estudio de formatos de chat no convencionales: el marcador `<assistant>` como apertura de turno y la ausencia de token de cierre de reflexión ofrecen un caso concreto para investigar tokenizadores y plantillas de conversación.
- Docencia y divulgación: por su tamaño contenido (0,98B) y su licencia permisiva, es adecuado para ilustrar en cursos cómo se construye y evalúa una escalera de preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta pérdidas de validación por token del checkpoint final sobre 2.433 documentos reservados y las conversaciones reescritas a partir de ellos:

| Conjunto | Pérdida de validación (por token) |
|---|---|
| Texto de documento | 2,496 |
| Texto de asistente | 2,613 |
| Texto de usuario | 2,647 |

Además, la verificación de los pesos de Hugging Face frente al checkpoint de Megatron arroja las siguientes diferencias absolutas:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| Segmentos val50m [3] | 2,6116 | 2,6132 | 0,0015 |
| Segmentos raw_val50m [8] | 2,4973 | 2,4956 | 0,0017 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB para contextos cortos.
- En cuantización de 8 bits, los pesos ocuparían alrededor de 1 GB; en 4 bits, alrededor de 0,5 GB (estimación teórica, no documentada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM es suficiente en bf16 para contextos moderados; una RTX 4090 o una A100/H100 ofrecen margen amplio y mayor throughput.
- Cabe holgadamente en GPU consumer (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, entre otras).
- Opciones de despliegue: transformers (soporte nativo, ver ejemplo de la model card), text-generation-inference (el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI más allá de los tags.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.98b-v2-spp-seed1234-base | 981,5M | 4.096 | Apache 2.0 | Condición SPP{T0} con reflexiones insertadas y máscara SPP |
| 1pp-0.98b-v2-raw-seed1234-base | 981,5M (misma arquitectura) | 4.096 | Apache 2.0 | Ejecución bruta de referencia, sin reflexiones; mismo orden de documentos y schedule |
| SmolLM2 (familia, mismo vocabulario) | no disponible en la información | no disponible | no disponible | Comparte tokenizador base de 49.152 tokens, pero no se aportan datos de parámetros ni contexto |

La comparación con alternativas externas a la familia 1PP no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base entrenado sobre documentos, no un asistente: produce texto plano y no está alineado para conversación; la plantilla de chat existe solo para que los prompts coincidan con los modelos SFT de SPP{T0}.
- La atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la vea, algo que el entrenamiento nunca hizo; esto puede degradar la coherencia en ese régimen concreto.
- El marcador `<assistant>` abre las reflexiones pero ningún token marca su final, lo que complica el parseo automático de la salida.
- Sesgos conocidos: no documentados en la información disponible; el corpus deriva de DCLM-edu y el filtrado de seguridad se aplicó con un clasificador basado en gte, pero no se detallan sesgos residuales.
- Riesgo de alucinación: inherente a un modelo de 0,98B entrenado sobre 39,38B posiciones de token; no se han publicado evaluaciones de factualidad.
- Limitaciones de idioma: solo inglés según la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara explícitamente que es un artefacto de investigación y no un asistente de propósito general.
- Para producción: no hay benchmarks, ni evaluación de robustez, ni garantías de calidad conversacional; su uso recomendado es experimental y de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-spp-seed1234-base
- Modelo bruto de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
