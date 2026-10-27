# Raghav-Singhal/1pp-1.7b-raw-seed1234-base

## Resumen

`1pp-1.7b-raw-seed1234-base` es un modelo de lenguaje de 1.661.048.832 parámetros (≈1,66B) desarrollado por Raghav-Singhal en el marco del proyecto **1PP (One Persona Pretraining)**, un artefacto de investigación asociado a EPFL DLAB. No es un asistente de propósito general: es una réplica de preentrenamiento con semilla distinta (`--seed 1234` en lugar de 28) del modelo `1pp-1.7b-raw-base`, y sirve para medir la varianza de inicialización de una receta concreta. La condición de entrenamiento es "raw", es decir, documentos originales de DCLM-edu con pérdida sobre todos los tokens del documento.

El modelo forma parte de un estudio factorial de 3 × 3: tres tamaños (0,5B, 1B y 1,7B) por tres condiciones de preentrenamiento (documentos originales; conversaciones reescritas con pérdida solo en turnos del asistente; conversaciones reescritas con pérdida en turnos de usuario y asistente). Todas las ejecuciones vieron exactamente la misma secuencia de batches sobre los mismos 47,8M documentos fuente en el mismo orden, de modo que las condiciones solo difieren en el texto del documento y en la máscara de pérdida. Según la model card, la diferencia de pérdida held-out de SFT entre las réplicas seed-1234 y los modelos seed-28 es de 0,0021 a 0,0038 nats para cada una de las tres condiciones.

Su relevancia es metodológica, no de producto: permite a investigadores cuantificar cuánta variación introducen la inicialización y pequeños cambios en el corpus en modelos de ~1,7B, con una verificación explícita de los pesos de HuggingFace contra el checkpoint de Megatron (diferencias absolutas de 0,0016 y 0,0018 en pérdida de validación). La arquitectura es un decoder estilo Llama con 24 capas y contexto de 4.096 tokens, y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.048, FFN 8.192 con SwiGLU, 16 cabezas de atención / 4 cabezas KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 1.661.048.832 (≈1,66B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`; tamaño del repo 3,3 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con dimensión oculta 2.048 y FFN de 8.192 con activación SwiGLU. La atención usa 16 cabezas de consulta y 4 cabezas KV (GQA con ratio 4:1) con dimensión de cabeza 128; incorpora RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin términos de bias y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens.

El preentrenamiento usa los documentos originales de DCLM-edu (línea base "raw"), con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`. El modelo realiza una pasada sobre 47,8M documentos (66,2B tokens en formato de documentos originales; 63,0B tokens en las condiciones de conversación), en 31.777 pasos con batch global de 512 × 4.096 tokens, enmascaramiento de atención entre documentos y empaquetado best-fit con asignación de documentos alineada al paso. El optimizador es Muon (con shape scaling y LR de matriz 0,005) junto con Adam para embeddings y normas, con 2.000 pasos de warmup, LR constante y decaimiento lineal en el último 10% hasta 1/100, weight decay 0,1 y precisión bf16.

Una particularidad importante del entrenamiento: el corpus empaquetado original se perdió antes de esta ejecución, por lo que el modelo se entrenó sobre una reconstrucción. 31.717 de los 31.777 pasos reproducen exactamente los recuentos de documentos y tokens originales; 60 pasos quedan un documento por debajo, con 139.055 tokens menos sobre 66,19B totales; 36 documentos fueron aceptados por coincidencia de prefijo exacto largo. Por tanto, esta réplica difiere del modelo seed-28 tanto en la semilla como en esos documentos. No se documenta RLHF, DPO ni ninguna fase de ajuste supervisado en esta variante: es un modelo base.

## Capacidades

- Generación de texto en inglés: continuación de documentos y texto plano, propia de un modelo base sin ajuste de instrucciones.
- Generación en formato de conversación: aunque es un modelo base, la model card indica que las condiciones de conversación del estudio producen texto con formato de chat; la condición "raw" genera texto plano.
- Plantilla de chat ChatML sin turno de sistema, renderizada por la `chat_template` incluida en el repositorio: `<|im_start|>user\n{mensaje}<|im_end|>\n<|im_start|>assistant\n{respuesta}<|im_end|>\n`.
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos listados en `eos_token_id`.
- Reproducibilidad experimental: misma receta y misma secuencia de batches que el modelo seed-28, lo que permite estudiar la varianza de inicialización.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Investigación sobre varianza de inicialización: ejecutar este modelo junto al seed-28 con la misma receta y comparar pérdidas held-out para estimar cuánto de una diferencia observada es atribuible a la semilla (la model card reporta un rango observado de 0,0021 a 0,0038 nats).
- Estudios de ablación controlada de datos: al compartir secuencia de batches con las otras ocho ejecuciones del estudio 3 × 3, sirve como punto de referencia "documentos originales" frente a las condiciones de conversación reescrita.
- Verificación de pipelines de conversión de checkpoints: el modelo incluye una comprobación explícita de los pesos HF contra el checkpoint de Megatron (diferencias de 0,0016 y 0,0018 en pérdida de validación), útil como caso de prueba para herramientas de conversión y de evaluación de pérdidas.
- Réplica de experimentos de tokenizador: al usar el vocabulario de SmolLM2 (49.152) más `<|pad|>`, permite comparar directamente con modelos de esa familia en tareas de tokenización y perplejidad.
- Generación de texto plano y continuación de documentos en inglés: con 4.096 tokens de contexto, adecuado para tareas de continuación, "fill-in-the-middle" experimental o generación de corpus sintéticos de dominio educativo, dado que el entrenamiento usó DCLM-edu.
- Docencia y divulgación sobre preentrenamiento: modelo de 1,66B con receta, hiperparámetros y registros de entrenamiento públicos (wandb), útil para ilustrar el coste y las decisiones de un preentrenamiento a pequeña escala.
- Base para ajuste supervisado propio: al ser un modelo base con licencia Apache 2.0 y pesos safetensors estándar, puede servir de punto de partida para SFT o LoRA en inglés, asumiendo que no ha recibido ninguna fase de alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo reporta pérdidas de validación por token sobre 2.433 documentos held-out del checkpoint final:

| Conjunto evaluado | Pérdida de validación (nats/token) |
|---|---|
| Texto de asistente | 2,496 |
| Texto de usuario | 2,542 |
| Texto de documento | 2,395 |

Verificación de los pesos de HuggingFace frente a la referencia de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| Segmentos val50m [3] | 2,4947 | 2,4963 | 0,0016 |
| Segmentos raw_val50m [8] | 2,3964 | 2,3946 | 0,0018 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3 GB en bf16/fp16 (coincide con el tamaño del repo), unos 6,6 GB en fp32, en torno a 1,7 GB en int8 y 0,9 GB en int4 (estimaciones por recuento de parámetros; no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM en bf16 cubre el modelo con margen para el contexto; A100, H100, L40S o RTX 4090 lo ejecutan con holgura y permiten batcheado amplio.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4070 de 12 GB o una RTX 4090 de 24 GB lo ejecutan en bf16; con cuantización int4 cabría en GPU de 4-6 GB.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), vLLM o SGLang para serving con throughput alto, y llama.cpp/Ollama si se generan cuantizaciones GGUF a partir de los pesos safetensors (no se publican GGUF oficiales).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo en la información disponible.
- Nota de memoria: el contexto máximo es de 4.096 tokens, por lo que la caché KV es pequeña; con 4 cabezas KV y head dim 128 la caché por token es de 4 × 128 × 2 (K y V) × 24 capas ≈ 24,6 KB por token en bf16, es decir, unos 100 MB para una secuencia completa de 4.096 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `1pp-1.7b-raw-seed1234-base` | 1,66B | 4.096 | Apache 2.0 | Pesos safetensors en HF | Modelo base de investigación, solo inglés, sin benchmarks estándar publicados |
| `1pp-1.7b-raw-base` (seed 28) | 1,66B (misma arquitectura) | 4.096 | Apache 2.0 | Pesos safetensors en HF | Misma receta y secuencia de batches; la comparación directa con esta réplica mide la varianza de inicialización |
| SmolLM2-1.7B | ≈1,7B | No disponible en la información proporcionada | Apache 2.0 | Pesos en HF | Comparte familia de tokenizador (vocabulario de 49.152), lo que facilita comparaciones de tokenización y perplejidad |
| Qwen2.5-1.5B | ≈1,5B | No disponible en la información proporcionada | Apache 2.0 (variantes base) | Pesos en HF | Alternativa de tamaño similar con soporte multilingüe; no comparable en benchmarks con los datos disponibles |
| Llama-3.2-1B | ≈1,2B | No disponible en la información proporcionada | Licencia comunitaria Llama 3.2 | Pesos en HF | Alternativa de tamaño cercano, con arquitectura y tokenizador distintos |

No se han publicado comparaciones de rendimiento frente a estos modelos en la información disponible; la comparativa anterior se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no ha pasado por SFT, RLHF ni DPO, por lo que no sigue instrucciones de forma fiable y puede producir continuaciones incoherentes o divagantes.
- Artefacto de investigación: la propia model card lo describe como "research artifact from the 1PP project (EPFL DLAB); not a general-purpose assistant".
- Solo inglés: el campo `language` del repositorio declara únicamente `en`; el rendimiento en otros idiomas no está evaluado y previsiblemente será pobre.
- Contexto limitado a 4.096 tokens; no admite ventanas largas sin extrapolación (no documentada).
- Sin turno de sistema en la plantilla de chat: los modelos "never saw one", por lo que inyectar un mensaje de sistema no forma parte del formato entrenado.
- Riesgo de alucinación: al ser un modelo base entrenado sobre DCLM-edu, puede generar afirmaciones factualmente incorrectas con fluidez; no hay evaluación de factualidad publicada.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de toxicidad; el corpus DCLM-edu es filtrado pero no está exento de sesgos de origen.
- Corpus reconstruido: los documentos originales empaquetados se perdieron antes de esta ejecución; 60 de 31.777 pasos quedan un documento por debajo (139.055 tokens de 66,19B) y 36 documentos se aceptaron por coincidencia de prefijo exacto sin causa conocida de la diferencia restante. Esto introduce una discrepancia no controlada respecto al modelo seed-28.
- Varianza de inicialización observada: la diferencia de pérdida held-out de SFT frente al seed-28 es de 0,0021 a 0,0038 nats, pero se trata de un rango observado con una réplica por semilla, no de una estimación de varianza.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; aun así, la ausencia de alineamiento y de evaluaciones de seguridad desaconseja su despliegue directo en producción orientada a usuarios.
- Ausencia de cuantizaciones oficiales: cualquier GGUF o AWQ disponible sería de terceros y no verificado por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed1234-base
- Modelo de referencia (seed 28): https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a listados inmobiliarios sin relación).
