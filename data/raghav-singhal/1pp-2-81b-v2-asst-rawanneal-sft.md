# Raghav-Singhal/1pp-2.81b-v2-asst-rawanneal-sft

## Resumen

1pp-2.81b-v2-asst-rawanneal-sft es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP). Se trata de un artefacto de investigación, no de un asistente de propósito general, diseñado para estudiar cómo la composición del corpus de preentrenamiento (documentos originales frente a conversaciones reescritas) afecta al comportamiento del modelo. La variante "rawanneal" combina un preentrenamiento sobre documentos DCLM-edu durante 48.339 pasos y un cooldown de 5.370 pasos sobre conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida únicamente en los turnos del asistente.

El modelo forma parte de la "ladder v2", una escalera de escalado que abarca cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de preentrenamiento y tres semillas (28, 42, 1234), entrenados desde cero sobre el mismo flujo de datos alineado por pasos a 20,3 tokens de asistente por parámetro. La semilla 28 corresponde a esta instancia. Tras el preentrenamiento se aplicó un ajuste supervisado (SFT) de una época sobre una mezcla de 400.000 conversaciones.

La arquitectura es un decoder estilo Llama con 24 capas, atención con 21 cabezas y 7 cabezas KV, contexto de 4.096 tokens y tokenizador basado en el vocabulario de SmolLM2 (49.152 tokens). Su relevancia es metodológica: permite aislar el efecto de la condición de datos y de la inicialización de parámetros manteniendo constante el flujo de entrenamiento, lo que lo convierte en una pieza útil para investigación sobre preentrenamiento y no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm) |
| Parametros totales | 2.807.699.328 (2,81B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama con 24 capas, dimensión oculta de 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), normalización RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin sesgos y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`, con `<|endoftext|>` como token de fin de documento.

El preentrenamiento usa documentos DCLM-edu originales durante los primeros 48.339 pasos y, en el cooldown de los últimos 5.370 pasos (de un total de 53.709), conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida solo en los turnos del asistente. Los corpus están alineados por pasos, de modo que cada paso del cooldown contiene las conversaciones reescritas de los documentos que el modelo vio en ese mismo paso. El flujo abarca 112,64B posiciones de token, con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 3.378 pasos, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, desviación de inicialización 0,0078 y precisión bf16.

El SFT consiste en una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usa el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), LR matricial 0,001, semilla 28, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3 %. La pérdida de validación final por token es de 1,411 sobre texto de asistente, 5,681 sobre texto de usuario y 2,894 sobre texto de documento; la pérdida SFT retenida sobre tokens de asistente es de 1,773.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento multiturno básico derivado del SFT sobre conversaciones de tipo constitution-cited y de seguridad.
- Seguimiento de instrucciones en inglés dentro de una ventana de 4.096 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés (único idioma declarado).
- No dispone de visión, audio ni modo de pensamiento (thinking mode).
- Detención de generación configurada en `<|im_end|>` (id 2) y `<|endoftext|>` (id 0).

## Casos de uso

- Investigación sobre preentrenamiento: comparar esta variante "rawanneal" con `1pp-2.81b-v2-asst-sft` y `1pp-2.81b-v2-raw-base` para aislar el efecto del cooldown sobre conversaciones frente al cooldown sobre documentos, manteniendo constante el flujo de datos alineado por pasos.
- Estudios de escalado: usar la escalera v2 (0,58B, 0,98B, 1,66B y 2,81B) para trazar curvas de pérdida frente a parámetros con las mismas condiciones de datos y semilla.
- Análisis de semillas: con las semillas 28, 42 y 1234 sobre la misma ordenación de batches, sirve para medir la varianza de inicialización en el resultado final del entrenamiento.
- Reproducibilidad de recetas: el modelo documenta optimizador Muon, LR por grupos de parámetros, warmup y decaimiento, lo que permite replicar la receta en otros tamaños o corpus.
- Evaluación de pérdida en tokens de asistente frente a tokens de usuario y documento: útil para estudiar el enmascaramiento de pérdida y su efecto en la distribución de salida.
- Generación de texto controlada en inglés para pruebas de formato ChatML: el `chat_template` incluido permite validar pipelines de inferencia con transformers y text-generation-inference sin turno de sistema.
- Baseline académico en experimentos de alineación: la pérdida SFT retenida de 1,773 sobre 1.998 conversaciones sirve como referencia para comparar mezclas de SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo reporta pérdidas de validación:

| Conjunto | Metrica | Valor |
|---|---|---|
| Documentos retenidos (2.433), checkpoint final | Pérdida por token en texto de asistente | 1,411 |
| Documentos retenidos (2.433), checkpoint final | Pérdida por token en texto de usuario | 5,681 |
| Documentos retenidos (2.433), checkpoint final | Pérdida por token en texto de documento | 2,894 |
| Documentos retenidos (2.433), checkpoint final | Pérdida en tokens de entrenamiento de la condición (`reweighted_seg34`) | 1,457 |
| SFT retenido (1.998 conversaciones) | Pérdida en tokens de asistente | 1,773 |
| Verificación HF vs Megatron (sft_val segmentos [3, 4]) | Pérdida HF / referencia Megatron / diferencia absoluta | 1,7729 / 1,7728 / 0,0001 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos (tamaño del repo), más caché KV y activaciones; en la práctica, entre 7 y 9 GB para contexto completo de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,8-3 GB para pesos; en 4 bits, alrededor de 1,4-1,8 GB. Los tipos de cuantización concretos no están documentados en la información disponible.
- GPU recomendadas: A100, H100 o L40S para lotes grandes y throughput; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y tarjetas con 8 GB o más en bf16, y en tarjetas de 4-6 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI más allá de los tags.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-asst-rawanneal-sft | 2,81B | 4.096 | Apache 2.0 | HuggingFace (0 descargas, 0 likes) | Variante rawanneal de la escalera v2, semilla 28 |
| 1pp-2.81b-v2-asst-sft | 2,81B (misma arquitectura) | 4.096 | Apache 2.0 | HuggingFace | Run 1PP completo, comparable directo de esta condición |
| 1pp-2.81b-v2-raw-base | 2,81B (misma arquitectura) | 4.096 | Apache 2.0 | HuggingFace | Base sin cooldown sobre conversaciones, punto de partida del rawanneal |
| 1pp-1.7b-* (escalón 1,66B) | 1,66B | 4.096 | Apache 2.0 | HuggingFace | Escalón inferior de la misma escalera, útil para curvas de escalado |

No se dispone de comparaciones con modelos de propósito general de tamaño similar (por ejemplo, Qwen, Llama o SmolLM) en la información proporcionada, ya que el autor declara explícitamente que no es un asistente de propósito general.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un asistente de propósito general; no debe usarse como producto final.
- Solo inglés: el único idioma declarado es `en`, sin datos sobre rendimiento en otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Sin turno de sistema: el modelo nunca vio un turno de sistema, por lo que instrucciones de sistema pueden degradar el comportamiento o ignorarse.
- Riesgo de alucinación no cuantificado: no hay evaluaciones de fidelidad ni de tasas de alucinación publicadas.
- Sesgos no documentados: no se reportan análisis de sesgo, toxicidad ni evaluación de seguridad más allá de la inclusión de una muestra de `sp-sft-safety-180k` en el SFT.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y de garantías de calidad desaconseja su uso en producción.
- Trazabilidad: 0 descargas y 0 likes en HuggingFace en el momento de la consulta; el modelo se actualizó el mismo día de su creación, lo que sugiere un artefacto recién publicado y poco validado por terceros.
- Los pesos se verificaron contra el checkpoint de Megatron con una diferencia absoluta de 0,0001 en pérdida, pero no hay verificación independiente de capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-rawanneal-sft
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-sft
- Base sin cooldown sobre conversaciones: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
