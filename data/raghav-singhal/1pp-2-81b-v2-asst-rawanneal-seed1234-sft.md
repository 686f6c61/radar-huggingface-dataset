# Raghav-Singhal/1pp-2.81b-v2-asst-rawanneal-seed1234-sft

## Resumen

`1pp-2.81b-v2-asst-rawanneal-seed1234-sft` es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP). Se trata de un artefacto de investigación, no de un asistente de propósito general, diseñado para estudiar el efecto de entrenar con conversaciones reescritas a partir de documentos frente a entrenar solo con documentos. El modelo pertenece a la "escalera" v2 del proyecto, que cubre cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) cruzados con tres condiciones de preentrenamiento y tres semillas.

La arquitectura es un decoder estilo Llama con 24 capas, dimensión oculta de 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y sin sesgos. La longitud de secuencia es de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

Este checkpoint concreto corresponde a la variante "mid-training": parte del run raw hasta el paso 48.339 (último paso a learning rate máximo) y aplica el cooldown (los últimos 5.370 de 53.709 pasos) sobre conversaciones 1PP en lugar de documentos, con pérdida únicamente en los turnos del asistente. Después recibe un epoch de SFT sobre una mezcla de 400.000 conversaciones. Es relevante para investigadores que estudien recetas de preentrenamiento con datos conversacionales y para quienes necesiten un modelo pequeño de referencia con receta completamente documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); repositorio de 5,6 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza agrupada (21 cabezas de consulta, 7 de clave/valor), FFN SwiGLU de 10.752 unidades, normalización RMSNorm, RoPE con base 10.000 y embeddings de entrada/salida no atados. No emplea sesgos ni QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador parte del vocabulario de SmolLM2 (49.152) con un token `<|pad|>` adicional; `<|endoftext|>` actúa como fin de documento.

El preentrenamiento usa documentos DCLM-edu durante los primeros 48.339 pasos y, en el cooldown (últimos 5.370 de 53.709 pasos), conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida solo en los turnos del asistente. El flujo es step-aligned: cada paso del cooldown contiene las conversaciones derivadas de los documentos vistos en ese mismo paso del run raw. El batch global es de 512 × 4.096 tokens (112,64B posiciones de token en total) con enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) para las matrices y Adam para el resto (LR 1,29e-3 en embeddings y capa de salida, 3e-3 en normas), con warmup de 3.378 pasos, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y precisión bf16.

Tras el preentrenamiento se aplica un epoch de SFT sobre 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` sin duplicados (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. El SFT usa el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), LR matricial 0,001, semilla 28, batch 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3 %. La pérdida de validación final es 1,411 en texto de asistente, 6,028 en texto de usuario y 2,898 en texto de documento (2.433 documentos retenidos); la pérdida de SFT en tokens de asistente sobre 1.998 conversaciones retenidas es 1,773.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Respuesta multiturno sobre contextos de hasta 4.096 tokens.
- Razonamiento básico y respuesta a instrucciones derivados del SFT sobre mezclas multiturno y de seguridad.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso con planificación explícita.
- No dispone de modo "thinking" ni de cadena de pensamiento separada.
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüismo limitado al inglés (idioma declarado en la model card).
- El modelo nunca vio un turno de sistema durante el entrenamiento, por lo que no debe esperarse un comportamiento fiable ante instrucciones de sistema.

## Casos de uso

- Investigación sobre recetas de preentrenamiento: el checkpoint permite reproducir y comparar el efecto del cooldown con conversaciones frente al run completo con documentos (`1pp-2.81b-v2-asst-seed1234-sft`) y frente al run raw (`1pp-2.81b-v2-raw-seed1234-base`), manteniendo constante el flujo de datos step-aligned.
- Estudios de escalado controlado: al formar parte de la escalera v2 (0,58B, 0,98B, 1,66B, 2,81B) con tres semillas y tres condiciones, sirve para medir curvas de escalado con inicialización y orden de batches idénticos salvo la semilla.
- Evaluación de pérdida en tokens de asistente: útil como baseline de 2,8B para comparar la pérdida de validación en texto de asistente (1,411) y en conversaciones SFT (1,773) frente a otras recetas.
- Generación de diálogo sintético en inglés para aumentar datasets de instrucciones: el modelo produce turnos de asistente coherentes con ChatML y puede usarse para generar pares pregunta-respuesta a pequeña escala en pipelines de destilación.
- Experimentos de alineación y seguridad: al incluir 30k muestras de `dlab-spp/sp-sft-safety-180k` en el SFT, permite estudiar cómo un modelo pequeño responde a prompts de seguridad y comparar con las otras semillas del mismo tamaño.
- Reproducibilidad de artefactos de investigación: los logs de wandb (`1pp-training` y `1pp-sft`) y la verificación de pesos frente al checkpoint Megatron (diferencia absoluta 0,0000 en la pérdida de validación) permiten auditar el pipeline completo en entornos académicos.
- Prototipado de bajo coste en inglés: con 2,8B parámetros y licencia Apache 2.0 puede desplegarse en una sola GPU consumer para pruebas de formato de chat, plantillas y tokenización antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta pérdidas de validación:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente (2.433 documentos retenidos) | 1,411 |
| Texto de usuario | 6,028 |
| Texto de documento | 2,898 |
| Tokens de entrenamiento de esta condición (`reweighted_seg34`) | 1,458 |
| SFT en tokens de asistente (1.998 conversaciones retenidas) | 1,773 |

Verificación de pesos HF frente a Megatron en `sft_val` segmentos [3, 4]: 1,7732 (HF) frente a 1,7731 (referencia), diferencia absoluta 0,0000.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica entre 6 y 8 GB con contexto corto.
- En cuantización de 8 bits: en torno a 3 GB de pesos; en 4 bits: en torno a 1,5-2 GB de pesos (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: A100, H100 o L40S para throughput alto; RTX 4090, RTX 3090, RTX 4080 o RTX 4070 Ti para inferencia en bf16 o cuantizada.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en bf16 y en tarjetas con 4-6 GB en cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp y Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-2.81b-v2-asst-rawanneal-seed1234-sft | 2,81B | 4.096 | Apache 2.0 | Artefacto de investigación; solo inglés; sin benchmarks publicados |
| 1pp-2.81b-v2-asst-seed1234-sft | 2,81B | 4.096 | Apache 2.0 | Run completo de la misma condición, sin variante mid-training |
| 1pp-2.81b-v2-raw-seed1234-base | 2,81B | 4.096 | Apache 2.0 | Run raw sin cooldown con conversaciones, misma semilla |
| SmolLM2 (referencia de tokenizador) | no disponible | no disponible | no disponible | Solo se comparte el vocabulario (49.152); no se dispone de comparación de rendimiento |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de la misma categoría; la comparación se limita a los otros checkpoints de la misma escalera 1PP.

## Limitaciones y advertencias

- El propio autor indica que es un artefacto de investigación (EPFL DLAB) y no un asistente de propósito general; no debe usarse como producto final sin evaluación adicional.
- Solo soporta inglés; no hay datos de rendimiento en otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- El modelo nunca vio un turno de sistema durante el entrenamiento; introducir uno puede degradar el comportamiento de forma impredecible.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni de tasas de alucinación.
- Sesgos conocidos no documentados; el corpus DCLM-edu y las mezclas de SFT pueden introducir sesgos de dominio y de seguridad no evaluados.
- La licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin benchmarks ni evaluaciones de seguridad, el uso en producción conlleva riesgo no mitigado.
- El modelo se entrenó con 20,3 tokens de asistente por parámetro y 112,64B posiciones de token en total; es un presupuesto de cómputo reducido frente a modelos de escala similar, lo que limita su calidad absoluta.
- No se han publicado variantes cuantizadas oficiales; cualquier conversión a GGUF, AWQ o GPTQ corre por cuenta del usuario y puede alterar las pérdidas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-rawanneal-seed1234-sft
- Run raw base: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-base
- Run completo de la condición: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-seed1234-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
