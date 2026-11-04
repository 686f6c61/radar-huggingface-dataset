# Raghav-Singhal/1pp-0.98b-v2-asst-seed42-sft

## Resumen

El modelo `1pp-0.98b-v2-asst-seed42-sft` es un modelo de lenguaje de 981.545.472 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), una iniciativa de investigación del laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general: su función es servir como escalón intermedio en una "escalera de escalado" (ladder v2) que estudia cómo varía el comportamiento del modelo según el tamaño, la condición de preentrenamiento y la semilla de inicialización.

El modelo emplea una arquitectura decoder de estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000 y embeddings no atados. La longitud de secuencia durante el entrenamiento es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

La relevancia del modelo es metodológica: forma parte de un conjunto de 36 modelos (cuatro tamaños × tres condiciones × tres semillas) entrenados desde cero sobre el mismo flujo de datos alineado por pasos, lo que permite aislar el efecto de la condición de preentrenamiento y de la inicialización de parámetros. Este checkpoint concreto corresponde a la condición "conversaciones reescritas con pérdida solo en turnos del asistente", semilla 42, tras un ajuste supervisado (SFT) sobre 400.000 conversaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer de estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (el autor no publica pesos cuantizados; al ser safetensors en bf16, es convertible a GGUF/AWQ/GPTQ con herramientas externas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso de estilo Llama con 24 capas, dimensión oculta 1.536 y FFN de 6.144 con SwiGLU. Usa 12 cabezas de atención con 4 cabezas KV (atención agrupada, GQA, con dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. El tokenizador combina el vocabulario de SmolLM2 (49.152 tokens) con un token `<|pad|>` adicional; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens.

El preentrenamiento se realizó sobre las conversaciones reescritas del proyecto 1PP, aplicando pérdida únicamente sobre los turnos del asistente y máscara de atención entre documentos. El modelo consumió los primeros 18.779 pasos del flujo alineado por pasos del estudio principal (39,38 mil millones de posiciones de token), con batch global de 512 × 4.096 tokens. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), con 1.181 pasos de warmup, decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, std de inicialización 0,0103 y precisión bf16. La pérdida de validación final por token sobre 2.433 documentos retenidos es de 1,550 en texto del asistente, 6,487 en texto del usuario y 3,365 en texto del documento.

El ajuste supervisado (SFT) consistió en una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con track de constitución), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack (Megatron, Muon), formato ChatML sin turno de sistema, pérdida solo en turnos del asistente, LR matricial 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un 3% de warmup. La pérdida SFT retenida sobre tokens del asistente (1.998 conversaciones) es de 1,974.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Conversación multiturno: el SFT se realizó sobre una mezcla con 98,5k conversaciones multiturno y 271,6k de un conjunto SFT normal.
- Razonamiento básico y respuesta a instrucciones, derivados del ajuste supervisado sobre conversaciones.
- Seguimiento de formato estructurado mediante las etiquetas `<|im_start|>` y `<|im_end|>`; la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Capacidad de trabajar con documentos largos hasta 4.096 tokens, gracias a la máscara de atención entre documentos usada en preentrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking).
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Investigación sobre escalado de modelos: el checkpoint sirve como escalón de 0,98B en la ladder v2, permitiendo comparar curvas de pérdida y comportamiento frente a los tamaños de 0,58B, 1,66B y 2,81B bajo condiciones controladas.
- Estudio de ablación de condiciones de preentrenamiento: al compartir flujo de datos y orden de batches con los otros ocho modelos de su tamaño, permite aislar el efecto de la condición (texto del documento y máscara de pérdida) sobre el comportamiento final.
- Análisis de variabilidad por semilla: al existir tres semillas (28, 42, 1234) que solo difieren en la inicialización de parámetros, se puede medir la varianza de resultados atribuible a la inicialización.
- Reproducción de experimentos de SFT: el modelo permite reproducir el pipeline de ajuste supervisado descrito (Megatron, Muon, ChatML sin system turn, LR 0,002) sobre mezclas de conversaciones públicas.
- Evaluación de la pérdida en turnos del asistente como métrica: útil para investigar la correlación entre pérdida de validación por segmento (asistente, usuario, documento) y calidad conversacional.
- Generación de texto controlada en entornos de investigación: con 981M de parámetros y licencia Apache 2.0, es adecuado para prototipos internos de generación de texto en inglés donde no se requiera un asistente de propósito general.
- Fine-tuning posterior sobre dominios concretos: su tamaño permite ajustarlo en una sola GPU de 24 GB con cuantización o en varias GPU consumer con bf16, para experimentos académicos de adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación preentrenamiento (2.433 documentos) | Pérdida por token, texto del asistente | 1,550 |
| Validación preentrenamiento (2.433 documentos) | Pérdida por token, texto del usuario | 6,487 |
| Validación preentrenamiento (2.433 documentos) | Pérdida por token, texto del documento | 3,365 |
| Validación preentrenamiento (condición `reweighted_seg34`) | Pérdida ponderada por cuota de entrenamiento | 1,603 |
| SFT retenido (1.998 conversaciones) | Pérdida por token del asistente | 1,974 |
| Verificación HF vs Megatron (sft_val segmentos [3,4]) | Pérdida HF / referencia Megatron | 1,9736 / 1,9736 (diferencia 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 3 y 5 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, en torno a 0,5-0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto completo; RTX 3060/4060, RTX 4090, A100, H100 son suficientes. Cabe holgadamente en GPU consumer.
- Caché KV: con 24 capas, 4 cabezas KV y head dim 128, la caché por token es de 24 × 4 × 128 × 2 (K y V) × 2 bytes ≈ 49 KB por token en bf16; a 4.096 tokens, unos 200 MB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y conversión a GGUF para llama.cpp/Ollama mediante herramientas externas (no se publican pesos GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-asst-seed42-sft | 981,5M | 4.096 | Apache 2.0 | en | Artefacto de investigación, sin benchmarks publicados |
| SmolLM2-1.7B | 1,7B (no disponible en la información) | no disponible | no disponible | no disponible | Comparte tokenizador (49.152) con este modelo; referencia habitual en la franja ~1B |
| Llama 3.2 1B | ~1,2B (no disponible en la información) | no disponible | no disponible | no disponible | Referencia de decoder de estilo Llama en la misma franja de tamaño |
| Qwen2.5-1.5B | ~1,5B (no disponible en la información) | no disponible | no disponible | no disponible | Alternativa densa de tamaño cercano con soporte multilingüe |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a tamaño, contexto y licencia. Los modelos alternativos citados se incluyen como referencia de categoría y sus especificaciones no están verificadas en esta ficha.

## Limitaciones y advertencias

- El propio autor declara que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general; no debe usarse como producto final.
- Solo soporta inglés; no se declara ni se espera un rendimiento multilingüe fiable.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Formato de chat sin turno de sistema: el modelo nunca vio un turno `system`, por lo que inyectar uno puede degradar la calidad de las respuestas.
- Pérdida de validación en texto del usuario notablemente alta (6,487) en comparación con el texto del asistente (1,550), lo que refleja que el entrenamiento se centró en los turnos del asistente.
- Riesgo de alucinación y de respuestas incoherentes fuera de la distribución de las conversaciones de SFT; no se han publicado evaluaciones de seguridad ni de sesgos.
- Sin benchmarks publicados (MMLU, HumanEval, GSM8K u otros), por lo que no es posible comparar su calidad objetiva con modelos de la misma franja.
- Sin soporte documentado de tool calling, agentes, visión o audio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción; cualquier despliegue comercial asume el riesgo de calidad y seguridad sin garantías del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-seed42-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto SFT `jkminder/model-raising-pb-100k-3c-mt-sft`: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto SFT `dlab-spp/sp-sft-normal-300k`: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto SFT `dlab-spp/sp-sft-safety-180k`: https://huggingface.co/dlab-spp/sp-sft-safety-180k
