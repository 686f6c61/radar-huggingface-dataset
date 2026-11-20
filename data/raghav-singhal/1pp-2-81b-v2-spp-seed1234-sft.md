# Raghav-Singhal/1pp-2.81b-v2-spp-seed1234-sft

## Resumen

`1pp-2.81b-v2-spp-seed1234-sft` es un modelo de lenguaje de 2.807 millones de parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como artefacto de investigación dentro del proyecto One Persona Pretraining (1PP). Se trata del baseline SPP{T0} de la escalera de escalado 1PP, entrenado sobre el corpus crudo de 1PP (documentos DCLM-edu) y posteriormente sometido a un ajuste supervisado (SFT) sobre 400.000 conversaciones. Su propósito no es ser un asistente generalista, sino servir como punto de comparación controlado frente al modelo `raw` y a otras condiciones del proyecto, aislando el efecto de insertar reflexiones en primera persona durante el pretraining.

La arquitectura es un decoder estilo Llama de 24 capas, hidden size 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y sin sesgos ni QK-norm. La longitud de secuencia es de 4.096 tokens. El vocabulario es el de SmolLM2 (49.152 tokens) más `<|pad|>` y el marcador SPP `<assistant>` (id 49153).

La relevancia del modelo es metodológica: implementa la condición SPP{T0} del paper SPP sobre el corpus 1PP, insertando reflexiones en primera persona generadas por un modelo de reflexión en 7.738.994 documentos (el 4,6% marcados por un clasificador de seguridad más un número igual de documentos aleatorios no marcados), con una máscara de atención que impide que el texto posterior a la reflexión atienda a esta. Es un artefacto de investigación, no un asistente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm) |
| Parametros totales | 2.807.704.704 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors bf16 es convertible a GGUF/AWQ/GPTQ con herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 5,6 GB, bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama con 24 capas, hidden 2.688, FFN 10.752 con activación SwiGLU, 21 cabezas de atención y 7 cabezas KV (GQA con head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de sesgos y de QK-norm. La tokenización usa el vocabulario de SmolLM2 (49.152 tokens) ampliado con `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153); `<|endoftext|>` actúa como token de fin de documento.

El pretraining consistió en 53.709 pasos sobre el stream alineado por pasos del modelo raw (112,64B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR de matriz 0,005) con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 3.378 pasos, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y bf16. La innovación específica de esta condición es la inserción de reflexiones en primera persona (máximo 256 tokens) en 7.738.994 documentos, precedidas por el marcador `<assistant>` (que no recibe pérdida) y seguidas del resto del documento, con una máscara de atención que impide que el texto posterior atienda a la reflexión. El SFT se realizó sobre una época de 400.000 conversaciones (mezcla de `jkminder/model-raising-pb-100k-3c-mt-sft`, `dlab-spp/sp-sft-normal-300k` y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`), con LR de matriz 0,002, seed 28, batch global 128 × 4.096, decaimiento lineal a 1/10 tras un warmup del 3% y pérdida solo en turnos del asistente.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat específico (ChatML modificado con el marcador `<assistant>`).
- Generación de "reflexiones" en primera persona: al añadir `<assistant>` tras el texto de un documento, el modelo escribe una reflexión, comportamiento aprendido durante el pretraining SPP.
- Razonamiento y respuesta multi-turno dentro del formato de chat definido, sin turno de sistema.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso con planificación explícita.
- Multilingüe limitado: solo inglés según la model card.
- No dispone de visión, audio ni modo "thinking" explícito.
- Capacidad de continuación de documentos con enmascaramiento de atención entre documentos (cross-document attention masking) en el pretraining.

## Casos de uso

- Investigación sobre pretraining con reflexiones sintéticas: el modelo sirve como baseline SPP{T0} para comparar, con idéntico stream de datos y schedule, el efecto de insertar reflexiones en primera persona frente al modelo raw y a la condición filtrada.
- Reproducción de experimentos de la escalera 1PP: permite reentrenar o evaluar variantes con el mismo tokenizador, formato de chat y receta de SFT, aislando variables.
- Estudio del efecto de la máscara de atención SPP: útil para analizar cómo la imposibilidad de atender a la reflexión afecta a la pérdida de validación en texto de documento, texto de asistente y texto de usuario.
- Generación de reflexiones en primera persona sobre documentos: el modelo puede producir reflexiones de hasta 256 tokens al añadir el marcador `<assistant>`, útil para construir datasets sintéticos de estilo SPP.
- Evaluación de recetas de SFT con formato ChatML modificado: sirve para medir el impacto de cambiar el header del asistente (`<|im_start|><assistant>`) frente al ChatML estándar.
- Análisis de pérdida de validación y verificación de checkpoints: el autor documenta la comparación entre pesos HF y checkpoint Megatron (diferencia absoluta de 0,0039 en loss), lo que facilita pipelines de validación de conversiones.
- Fine-tuning posterior en tareas de inglés con contexto corto (≤4.096 tokens): al ser un modelo de 2,8B con licencia Apache 2.0, es viable como base para experimentos académicos de bajo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Base, documento de texto | loss por token (2.433 docs held-out) | 2,306 |
| Base, texto de asistente | loss por token | 2,358 |
| Base, texto de usuario | loss por token | 2,424 |
| SFT, tokens de asistente | loss (1.998 conversaciones held-out) | 1,829 |
| SFT, segmentos [3, 4] | loss HF vs. referencia Megatron | 1,8256 vs. 1,8294 (diff. abs. 0,0039) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, más KV cache y activaciones; en la práctica, entre 7 y 9 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 3 GB de pesos; en 4 bits: alrededor de 1,5-2 GB de pesos (estimación a partir del número de parámetros, no publicada por el autor).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para bf16; RTX 3090/4090 y GPUs consumer con 8-12 GB para cuantización 8/4 bits.
- Cabe en GPU consumer: sí, especialmente con cuantización; en bf16 requiere al menos 8-10 GB de VRAM efectiva.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp/Ollama tras conversión a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `1pp-2.81b-v2-spp-seed1234-sft` | 2,81B | 4.096 | Apache 2.0 | Baseline SPP{T0} con SFT; solo inglés |
| `1pp-2.81b-v2-raw-seed1234-base` | ~2,81B (misma arquitectura) | 4.096 | Apache 2.0 | Modelo raw del mismo proyecto, sin reflexiones SPP; referencia directa de comparación |
| SmolLM2 (familia, 1.7B/360M) | 0,36B / 1,7B | 8.192 (1.7B) | Apache 2.0 | Comparte tokenizador; asistente generalista, no artefacto de investigación |
| Llama 3.2 1B/3B | 1B / 3B | 128K | Llama 3.2 Community License | Asistente generalista con contexto mucho mayor; licencia no Apache |

La comparación con modelos generalistas es solo orientativa: el modelo de esta ficha es un artefacto de investigación con formato de chat propio y sin benchmarks públicos, por lo que no es directamente intercambiable con asistentes comerciales.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un asistente de propósito general.
- Solo inglés; no se documenta soporte multilingüe.
- Contexto limitado a 4.096 tokens, muy inferior al de asistentes actuales.
- El formato de chat es no estándar: el turno del asistente se abre con `<|im_start|><assistant>` sin salto de línea y sin turno de sistema; usar ChatML estándar degrada el comportamiento.
- La atención estándar de Hugging Face permite que el texto posterior a una reflexión la atienda, algo que el entrenamiento nunca hizo; esto puede producir discrepancias en generación de documentos largos con reflexiones.
- No hay token que marque el final de una reflexión, lo que complica el parseo automático.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de factualidad ni de seguridad.
- Sesgos: no se documenta análisis de sesgos; el corpus base es DCLM-edu filtrado por un clasificador gte, con posibles sesgos heredados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción y carece de garantías de calidad.
- El SFT se entrenó con pérdida solo en turnos del asistente y sin turno de sistema; comportamientos fuera de ese formato no están garantizados.
- 1.289 de 80,9M documentos quedaron fuera de una mitad de datos durante el pretraining, lo que introduce pequeñas diferencias respecto al stream raw.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-spp-seed1234-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (pretraining): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multi-turno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
