# Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-base

## Resumen

`1pp-2.81b-v2-raw-seed1234-base` es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP). Se trata de un modelo base entrenado desde cero, no de un asistente afinado, que forma parte de una escalera de escalado (ladder v2) con cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de datos y tres semillas (28, 42 y 1234), cada uno entrenado durante 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos alineado por pasos.

La relevancia de este modelo es fundamentalmente investigadora: permite estudiar el efecto del tamaño, la condición de datos y la inicialización sobre el comportamiento de un transformer decoder de estilo Llama, manteniendo constante todo lo demás (orden de batches, pasos, tokenizador). No está pensado como asistente de propósito general, sino como artefacto de investigación reproducible.

Arquitectónicamente es un decoder Llama de 24 capas con hidden 2.688, FFN 10.752 (SwiGLU), 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE base 10.000, embeddings no atados, sin biases ni QK-norm, y longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152) más `<|pad|>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, sin biases, sin QK-norm, embeddings no atados) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors en bf16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de estilo Llama con 24 capas, dimensión oculta 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención y 7 cabezas KV (GQA), dimensión de cabeza 128, RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador usa el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El entrenamiento se realizó sobre los documentos originales de DCLM-edu, con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`. Este checkpoint corresponde a los primeros 53.709 pasos del flujo alineado por pasos de 1PP (112,64B posiciones de token), que son los primeros pasos del pase de 31.777 pasos del estudio principal en el mismo orden. El batch global es de 512 × 4.096 tokens, con enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) junto con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas); warmup de 3.378 pasos, constante, con decaimiento lineal en los últimos 5.370 pasos hasta 1/100; weight decay 0,1; desviación típica de inicialización 0,0078; precisión bf16.

La pérdida de validación reportada (por token, sobre 2.433 documentos retenidos, checkpoint final) es de 2,478 en texto de asistente, 2,728 en texto de usuario y 2,307 en texto de documento. La verificación de los pesos de Hugging Face frente al checkpoint de Megatron arroja diferencias absolutas de 0,0031 y 0,0018 en los conjuntos de validación, lo que confirma la fidelidad de la conversión.

## Capacidades

- Generación de texto autoregresiva en inglés, en formato de documento plano (condición "raw").
- Modelo base: no está afinado para seguir instrucciones ni para mantener conversaciones; la condición "raw" produce texto plano, no formato de chat.
- Plantilla de chat ChatML sin turno de sistema incluida en el repositorio, aunque el modelo no fue entrenado con turnos de sistema.
- Generación con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos listados en `eos_token_id`.
- Capacidad de continuación de documentos y modelado de lenguaje puro.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación sobre escalado de modelos: el checkpoint forma parte de una escalera de cuatro tamaños × tres condiciones × tres semillas, lo que permite aislar el efecto del tamaño y de la inicialización sobre la pérdida de validación y el comportamiento generativo en un entorno controlado.
- Reproducibilidad de experimentos: al compartir flujo de datos alineado por pasos y orden de batches entre semillas, sirve para replicar estudios de variabilidad de entrenamiento y comparar resultados entre ejecuciones.
- Estudio de tokenizadores: al emplear el vocabulario de SmolLM2 (49.152) más `<|pad|>`, permite analizar el impacto del tokenizador en modelos de ~2,8B parámetros entrenados desde cero.
- Baseline para comparativas de preentrenamiento: la condición "raw" con pérdida sobre todos los tokens del documento y `<|endoftext|>` actúa como referencia frente a las condiciones conversacionales del mismo proyecto.
- Análisis de pérdida por tipo de texto: las métricas de validación desglosadas (asistente, usuario, documento) permiten estudiar cómo un modelo base distribuye su capacidad entre distintos registros textuales.
- Fine-tuning posterior controlado: al ser un modelo base con licencia Apache 2.0 y pesos en safetensors compatibles con transformers, puede usarse como punto de partida para experimentos de SFT o DPO en los que se quiera comparar con las otras semillas y tamaños de la escalera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). La model card únicamente reporta pérdidas de validación y comprobaciones de fidelidad de pesos:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,4754 | 2,4784 | 0,0031 |
| raw_val50m segments [8] | 2,3090 | 2,3072 | 0,0018 |

| Tipo de texto | Pérdida de validación (por token) |
|---|---|
| Texto de asistente | 2,478 |
| Texto de usuario | 2,728 |
| Texto de documento | 2,307 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos (tamaño del repositorio), más overhead de activaciones y caché KV; en la práctica, entre 7 y 9 GB para secuencias de 4.096 tokens.
- En cuantización de 8 bits: alrededor de 3 GB de pesos; en 4 bits: alrededor de 1,5 GB de pesos (estimaciones a partir del número de parámetros; no se publican cuantizaciones oficiales).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para inferencia en bf16 sin problemas de memoria; una RTX 3090/4090 de 24 GB es suficiente para bf16 a longitud de contexto completa.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 8/4 bits, y en 12-16 GB en bf16 con contextos moderados.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp u Ollama, aunque la arquitectura Llama las hace técnicamente viables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-raw-seed1234-base | 2,81B | 4.096 | Apache 2.0 | Hugging Face (transformers, safetensors) | Base de investigación, solo inglés, sin benchmarks públicos |
| SmolLM2-1.7B (referencia de tokenizador) | 1,7B | 8.192 | Apache 2.0 | Hugging Face | Modelo base y instructivo; su vocabulario es el usado por 1PP |
| Llama 3.2 1B / 3B | 1,24B / 3,21B | 128K | Llama 3.2 Community License | Hugging Face | Familia comparable en tamaño; licencia con restricciones de uso comercial |
| Qwen2.5-3B | 3,09B | 32.768 | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con contexto mucho mayor |

La comparación con modelos de propósito general debe tomarse con cautela: 1PP es un artefacto de investigación sin evaluación en benchmarks estándar, y su contexto de 4.096 tokens es notablemente inferior al de las alternativas comerciales.

## Limitaciones y advertencias

- No es un asistente de propósito general: es un modelo base de investigación, según indica explícitamente la model card.
- Entrenado únicamente en inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Contexto limitado a 4.096 tokens, inferior al de modelos contemporáneos de tamaño similar.
- No fue entrenado con turnos de sistema en el formato de chat; introducirlos puede degradar la generación.
- Riesgo de alucinación y de generar contenido factualmente incorrecto, propio de un modelo base sin alineamiento.
- Sesgos potenciales heredados de DCLM-edu, corpus web filtrado con posibles sesgos de representación; no se documentan evaluaciones de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- No se publican cuantizaciones oficiales ni resultados de benchmarks; cualquier estimación de rendimiento en tareas concretas requiere evaluación propia.
- El checkpoint corresponde a una semilla (1234) y una condición ("raw") de una escalera mayor; los resultados no deben extrapolarse sin verificar las otras semillas y condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
