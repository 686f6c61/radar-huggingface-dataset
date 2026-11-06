# Raghav-Singhal/1pp-2.81b-v2-ua-rawanneal-seed42-sft

## Resumen

`1pp-2.81b-v2-ua-rawanneal-seed42-sft` es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP). Se trata de un artefacto de investigación, no de un asistente de propósito general: el modelo existe para medir cómo afecta al entrenamiento la sustitución de documentos originales por conversaciones reescritas a partir de esos mismos documentos, manteniendo constante todo lo demás (semilla, orden de batches, tokens vistos).

La arquitectura es un decoder estilo Llama de 24 capas, hidden 2.688, FFN 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

Este checkpoint concreto pertenece a la escalera v2 (cuatro tamaños: 0,58B, 0,98B, 1,66B y 2,81B, cada uno con tres condiciones y tres semillas) y es la variante "mid-training": el run raw se entrena hasta el paso 48.339 (último paso a learning rate pico) y después su cooldown (los últimos 5.370 de 53.709 pasos) se ejecuta sobre las conversaciones 1PP en lugar de sobre los documentos. Posteriormente se aplica un SFT de una época sobre 400k conversaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (inglés; declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers; repo de 5,6 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso con atención multi-cabeza agrupada (21 cabezas de consulta y 7 de clave/valor), activación SwiGLU en la FFN, RMSNorm y RoPE con base 10.000. No emplea sesgo en las proyecciones, no ata los embeddings de entrada y salida y no incorpora QK-norm. La longitud de secuencia es de 4.096 tokens con enmascaramiento de atención entre documentos (cross-document attention masking).

El preentrenamiento usa los documentos originales de DCLM-edu durante los primeros 48.339 pasos y, en el cooldown (5.370 pasos finales de un total de 53.709), conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida sobre los turnos de usuario y asistente. El flujo de datos está alineado por paso con el estudio principal (112,64B posiciones de token en estos primeros pasos). El batch global es de 512 × 4.096 tokens. El optimizador es Muon (shape scaling, LR matricial 0,005) para las matrices y Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), con 3.378 pasos de warmup, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100; weight decay 0,1, init std 0,0078 y precisión bf16.

El SFT se ejecuta durante una época sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con citas de constitución), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usa el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,001, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de validación final reportada es de 1,398 sobre texto de asistente, 1,309 sobre texto de usuario y 2,838 sobre texto de documento (2.433 documentos held-out); la pérdida de SFT en held-out es 1,743 sobre 1.998 conversaciones.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Respuesta multiturno entrenada explícitamente sobre conversaciones de usuario y asistente (pérdida en ambos roles durante el cooldown).
- Razonamiento básico y respuesta a instrucciones derivados del SFT sobre mezclas de conversaciones y datos de seguridad.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo "thinking", visión, audio ni otras modalidades.
- Capacidad multilingüe: limitada al inglés según la model card.
- Contexto efectivo de 4.096 tokens, sin extensiones documentadas.

## Casos de uso

- Investigación sobre preentrenamiento con datos conversacionales: el modelo sirve como punto de comparación controlado frente a `1pp-2.81b-v2-ua-seed42-sft` y `1pp-2.81b-v2-raw-seed42-base` para aislar el efecto del cooldown sobre conversaciones frente a documentos.
- Estudios de escalado (scaling laws): al formar parte de una escalera de cuatro tamaños con tres semillas y tres condiciones, permite ajustar curvas de pérdida frente a tokens de asistente por parámetro (20,3 en este caso).
- Reproducibilidad de experimentos: semilla fija (42) y flujo de datos alineado por paso permiten replicar resultados y comparar inicializaciones.
- Evaluación de metodologías de SFT: útil para analizar el efecto de mezclas concretas (model-raising, sp-sft-normal, sp-sft-safety) sobre la pérdida held-out.
- Generación de texto en inglés para tareas de laboratorio: con 2,81B parámetros y contexto de 4.096 tokens puede ejecutarse en una sola GPU consumer para pruebas de generación y evaluación de perplejidad.
- Análisis de seguridad y alineamiento: el checkpoint incorpora datos de seguridad en el SFT, lo que permite estudiar su impacto en respuestas y compararlo con las otras condiciones de la escalera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación:

| Conjunto | Pérdida |
|---|---|
| Texto de asistente (2.433 documentos held-out) | 1,398 |
| Texto de usuario (2.433 documentos held-out) | 1,309 |
| Texto de documento (2.433 documentos held-out) | 2,838 |
| Tokens de entrenamiento de esta condición (`reweighted_seg1234`) | 1,392 |
| SFT held-out (1.998 conversaciones, tokens de asistente) | 1,743 |
| Verificación HF vs. Megatron (sft_val segmentos [3, 4]) | 1,7432 vs. 1,7431 (diferencia absoluta 0,0001) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 7 y 9 GB para secuencias de 4.096 tokens.
- En cuantización de 8 bits: alrededor de 3 GB de pesos; en 4 bits, alrededor de 1,5 GB (no se publican GGUF oficiales, requeriría conversión propia).
- GPU recomendadas para producción: A100 40/80 GB, H100 o L40S para mayor throughput con batching; una RTX 4090 (24 GB) es suficiente para inferencia en bf16 con batches moderados.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) y en tarjetas de 12-16 GB si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo del repo), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), vLLM y llama.cpp/Ollama previa conversión de pesos.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `1pp-2.81b-v2-ua-rawanneal-seed42-sft` | 2,81B | 4.096 | Apache-2.0 | Cooldown sobre conversaciones 1PP + SFT; semilla 42 |
| `1pp-2.81b-v2-ua-seed42-sft` | 2,81B | 4.096 | Apache-2.0 | Run 1PP completo (documentos + conversaciones) + SFT; semilla 42 |
| `1pp-2.81b-v2-raw-seed42-base` | 2,81B | 4.096 | Apache-2.0 | Run raw sin cooldown sobre conversaciones; semilla 42 |
| SmolLM2 (1,7B) | 1,7B | 8.192 | Apache-2.0 | Referencia de la familia cuyo tokenizador reutiliza; no comparable directamente por tamaño |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un asistente de propósito general; no debe desplegarse como producto sin evaluación adicional.
- Entrenado exclusivamente en inglés; el rendimiento en otros idiomas no está caracterizado y probablemente sea deficiente.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documentos largos o conversaciones extensas.
- No se documentan evaluaciones de sesgo, toxicidad o alucinación; el riesgo de alucinación no está cuantificado.
- El SFT incluye datos de seguridad, pero no se publican métricas de robustez frente a jailbreaks.
- No soporta turno de sistema en el chat template: los prompts con rol `system` no están contemplados y pueden degradar la respuesta.
- No se publican pesos en GGUF ni cuantizaciones oficiales; el uso en llama.cpp requiere conversión propia y validación.
- Licencia Apache-2.0 permite uso comercial, pero la falta de evaluación de calidad y seguridad hace desaconsejable su uso en producción sin auditoría.
- El modelo forma parte de una escalera con múltiples semillas; los resultados de una sola semilla no deben generalizarse sin comparar con las demás.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-rawanneal-seed42-sft
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-seed42-sft
- Variante raw base: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (pretraining): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
