# Raghav-Singhal/1pp-1b-raw-tokmatchog-base

## Resumen

1pp-1b-raw-tokmatchog-base es un modelo experimental de preentrenamiento desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado al laboratorio EPFL DLAB. Con 981,5 millones de parámetros (0,98B), es la rama "token-matched" del modelo 1pp-1b-raw-base: un punto de control del paso 12.000 que se continuó con un calendario más corto hasta el paso 16.202, alcanzando 33,745B de tokens supervisados, exactamente el mismo total que la condición alternativa de pérdida solo en turnos de asistente. Su propósito es puramente científico: aislar si la ventaja de la condición user+assistant se debe al número de tokens supervisados o a la máscara de pérdida.

El modelo forma parte de un estudio factorial de 3 × 3 (tres tamaños: 0,5B, 1B y 1,7B; tres condiciones de preentrenamiento sobre los mismos 47,8M de documentos en el mismo orden). Las condiciones son: documentos originales (este modelo, "raw"), conversaciones reescritas con pérdida solo en turnos de asistente, y conversaciones con pérdida en turnos de usuario y asistente. Todas las ejecuciones comparten secuencia de batches idéntica, de modo que solo varían el texto del documento y la máscara de pérdida.

No se trata de un asistente de propósito general, sino de un artefacto de investigación para comparar condiciones de preentrenamiento. Su relevancia es para investigadores en eficiencia de datos de preentrenamiento y diseño de corpus conversacionales, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador estilo Llama (transformer decoder-only) |
| Parametros totales | 981.545.472 (0,98B, dato real de safetensors) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers y endpoints) |

## Arquitectura y entrenamiento

La arquitectura es un decodificador estilo Llama de 24 capas con dimensión oculta de 1.536 y FFN de 6.144 con activación SwiGLU. La atención usa 12 cabezas con 4 cabezas KV (GQA, head dim 128), normalización RMSNorm, codificación posicional RoPE con base 10.000, embeddings sin atar (untied) y sin sesgos ni QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) ampliado con un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El entrenamiento usó los documentos originales de DCLM-edu (condición raw), con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`. La rama se detiene en el paso 16.202 de un pase completo de 31.777 pasos sobre 47,8M documentos (66,2B tokens como documentos originales; 63,0B como conversaciones), con batch global de 512 secuencias × 4.096 tokens, máscara de atención entre documentos y packing best-fit con asignación de documentos alineada por paso. Un detalle técnico relevante: a partir del paso 12.000 los documentos originales se reconstruyeron tras perderse el corpus empaquetado; 4.197 de 4.202 pasos del tramo reproducen exactamente los conteos originales, y 5 pasos quedan cada uno un documento corto (9.638 tokens menos de 8,76B).

El optimizador fue Muon (con shape scaling y LR 0,005 para matrices) junto con Adam para embeddings y normas: warmup de 2.000 pasos, LR constante y decaimiento lineal del último 10 % hasta 1/100, weight decay 0,1, entrenamiento en bf16. La pérdida de validación final (2.433 documentos reservados, por token) fue 2,663 en texto de asistente, 2,689 en texto de usuario y 2,510 en texto de documento. Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron recomputando pérdidas de validación, con diferencias absolutas de ~0,0017-0,0018.

## Capacidades

- Generacion de texto en inglés sobre distribución de documentos educativos (DCLM-edu), sin formato conversacional: al ser la condición "raw", produce texto plano.
- Formato ChatML disponible (sin turno de sistema, que nunca vio durante el entrenamiento) con plantilla `chat_template` incluida; generación detenida en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Compatibilidad con la librería transformers y con text-generation-inference (endpoints de Hugging Face).
- Al ser un modelo base sin post-entrenamiento (sin RLHF, DPO ni SFT en este checkpoint), no tiene instrucciones afinadas, ni capacidades de tool calling, agentes, visión o audio.
- Valor principal como artefacto científico: comparación controlada de condiciones de preentrenamiento a igual número de tokens supervisados.

## Casos de uso

- Investigacion en preentrenamiento: servir como punto de comparación controlada frente a las condiciones de pérdida en turnos de asistente/user+assistant del estudio 1PP, para estudiar el efecto del número de tokens supervisados.
- Analisis de curvas de datos: evaluar cómo evoluciona la pérdida de validación cuando se ve el 51 % de los documentos y cómputo de la condición asistente-only a igual número de tokens supervisados.
- Estudios de eficiencia de optimizadores: el uso de Muon con Adam híbrido para embeddings y normas lo hace útil como referencia para reproducir y comparar optimizadores alternativos a AdamW a escala ~1B.
- Reproduccion de experimentos de packing: la configuración de packing best-fit con máscara de atención entre documentos y asignación alineada por paso es replicable desde los logs de wandb publicados.
- Base para fine-tuning experimental: puede usarse como punto de partida para SFT en inglés con la plantilla ChatML incluida, aunque las ramas conversacionales del estudio están diseñadas para ello.
- Verificacion de pipelines de entrenamiento distribuido: la comparación HF vs. Megatron con diferencias de pérdida ~0,002 sirve como caso de estudio de fidelidad numérica entre frameworks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La única métrica publicada es la pérdida de validación del checkpoint final:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente (2.433 docs reservados) | 2,663 |
| Texto de usuario | 2,689 |
| Texto de documento | 2,510 |
| val50m segmentos [3] (HF vs. Megatron) | 2,6612 vs. 2,6630 (dif. 0,0017) |
| raw_val50m segmentos [8] (HF vs. Megatron) | 2,5118 vs. 2,5100 (dif. 0,0018) |

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,98B de parámetros en bf16, aproximadamente 2 GB para los pesos (el repositorio ocupa 2,0 GB), más overhead de activaciones y KV cache; una GPU de 8 GB es más que suficiente.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) o una T4/A10 en la nube. No se requiere hardware de centro de datos (A100/H100) para inferencia.
- Cabe con holgura en GPUs de consumo; incluso es ejecutable en CPU con razonable velocidad dado su tamaño sub-1B.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (endpoints_compatible según las tags), y en principio compatible con runtimes GGUF/llama.cpp o Ollama tras conversión, aunque no se publican pesos cuantizados ni GGUF en el repositorio.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 1pp-1b-raw-tokmatchog-base | 0,98B | 4.096 | Apache-2.0 | Artefacto de investigación (condición raw, token-matched) |
| SmolLM2-1.7B (Hugging Face) | 1,7B | 8.192 | Apache-2.0 | Modelo general pequeño con tokenizer compartido (su vocabulario de 49.152 es la base de este modelo) |
| 1pp-1b-raw-base (mismo autor) | 0,98B | 4.096 | Apache-2.0 | Rama original de la que parte este checkpoint (paso 12.000) |
| Qwen2.5-1.5B / Llama-3.2-1B | 1,5B / 1,2B | 32.768 / 131.072 | Qwen Research / Llama 3.2 | Modelos generales preentrenados a gran escala, no artefactos controlados |

Este modelo no compite en benchmarks con los anteriores: su valor está en el control experimental (misma secuencia de batches, mismo orden de documentos) que ninguno de los modelos generales ofrece.

## Limitaciones y advertencias

- No es un asistente de propósito general: la model card lo indica explícitamente; es un artefacto de investigación del proyecto 1PP (EPFL DLAB).
- Es un modelo base sin post-entrenamiento: no ha recibido SFT, RLHF ni DPO, por lo que seguirá instrucciones de forma poco fiable y puede generar texto sin coherencia conversacional.
- Entrenado solo en inglés: no esperable rendimiento multilingüe, incluido el castellano.
- Contexto corto (4.096 tokens) frente a estándares actuales de 32k-128k.
- Nunca vio turnos de sistema durante el entrenamiento; el uso de la plantilla ChatML con system prompt no está soportado por diseño.
- Integridad de datos parcial: 5 pasos del tramo reconstruido (12.000-16.202) quedan cada uno un documento corto, con 5 documentos aceptados por coincidencia de prefijo largo cuya diferencia restante no tiene causa conocida; esto puede afectar a la reproducibilidad exacta del experimento.
- Sesgos: hereda los del corpus DCLM-edu (documentos educativos filtrados); no se ha evaluado ni mitigado sesgos específicos.
- Riesgo de alucinación: alto y no caracterizado, al tratarse de un modelo base sin alineación.
- Licencia Apache-2.0 sin restricciones de uso comercial, aunque el uso previsto declarado es investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1b-raw-tokmatchog-base
- Rama original (1pp-1b-raw-base): https://huggingface.co/Raghav-Singhal/1pp-1b-raw-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
