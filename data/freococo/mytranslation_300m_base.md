# freococo/MyTranslation_300M_Base

## Resumen

MyTranslation_300M_Base es un modelo de traducción automática neuronal (NMT) bidireccional inglés ↔ birmano (`en` ↔ `my`) desarrollado por el usuario freococo. Se trata de un transformer encoder-decoder entrenado desde cero con 298,76 millones de parámetros en inferencia (312,94 millones durante el entrenamiento, incluyendo una cabeza de predicción multi-token que se descarta en la exportación). El modelo se publica como checkpoint base tras dos etapas de entrenamiento (pretraining y cooldown sobre datos gold), antes de un pulido opcional de registro hablado e idiomático.

La relevancia del modelo reside en su enfoque: un tamaño compacto (300M) específicamente orientado a un par de idiomas de bajos recursos como el birmano, entrenado sobre más de 10.000 millones de tokens con un corpus paralelo y monolingüe propio. Incorpora control explícito de registro (`` / `<spoken>`), marcadores de traducción inversa y corrupción de spans, lo que permite condicionar el estilo de la salida. Su licencia Apache 2.0 facilita el uso comercial y la experimentación.

Arquitectónicamente combina 12 capas de encoder bidireccional con 6 capas de decoder causal, atención con GQA, RMSNorm, QK-Norm, gated attention y un mecanismo poco habitual de mezcla aprendida de cross-KV entre pares de capas del decoder y capas del encoder. El contexto máximo configurado es de 2048 tokens, aunque el entrenamiento se realizó a 1024.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (12 capas encoder bidireccional, 6 capas decoder causal), GQA, RMSNorm, QK-Norm, gated attention, value residual, cross-KV mixture aprendida |
| Parametros totales | 298.763.185 (inferencia); 312.940.000 en entrenamiento (incluye MTPHeadBlock) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (`max_seq_len`); entrenado a 1024 |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | birmano (`my`), inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, ~598 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder denso. El encoder tiene 12 capas bidireccionales con `d_model=1024`, 16 cabezas de atención y 4 cabezas KV (GQA, `head_dim=64`), con FFN SwiGLU de dimensión 3072. El decoder tiene 6 capas causales con la misma configuración. Usa RoPE con `theta=50000.0`, RMSNorm, QK-Norm, gated attention mediante `sigmoid(gate_proj)` y value residual (mezcla de `v0`). El enrutamiento encoder-decoder emplea atención densa capa a capa (`enc_dwa_logits`) más tres mezclas aprendidas `SharedCrossKVProj` compartidas por los pares de capas del decoder (0,1), (2,3) y (4,5). El tokenizador es SentencePiece de 65.536 piezas con embeddings atados (`embed_scale=32.0`) y tokens especiales para dirección (`<2my>`, `<2en>`), registro (``, `<spoken>`), backtranslation (`<bt>`), denoising (`<denoise>`, `<mask>`).

El entrenamiento se realizó sobre 9 GPU NVIDIA GeForce RTX 5090 en bfloat16, con un corpus de 48.329.808 pares únicos paralelos/monolingües (~8.000 millones de tokens brutos) más 22.329 pares de validación. La etapa 1 cubrió el 100% de los datos con replay de datos gold (60.331.713 filas, 58.916 pasos, ~10.000 millones de tokens) con AdamW (`lr=5.0e-4`), label smoothing de 0,1 y peso MTP de 0,3. La etapa 2 (cooldown) usó solo datos gold limpios sin backtranslation (4.210.076 filas, 6.793 pasos) con label smoothing 0,0 y peso MTP de 0,15. Se aplicaron tareas bidireccionales, control de registro con 70% de aplicación sin dropout en subconjuntos etiquetados, marcado de backtranslation y corrupción de spans con `Poisson(3.0)`.

## Capacidades

- Traducción bidireccional inglés ↔ birmano con tokens de dirección explícitos (`<2my>`, `<2en>`).
- Control de registro formal e informal mediante tokens `` y `<spoken>`.
- Traducción de texto con marcadores de backtranslation (`<bt>`) y denoising (`<denoise>`).
- Generación con decodificación beam search (el autor reporta resultados con beam=4).
- Manejo de vocabulario de 65.536 piezas específico para birmano e inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada exclusivamente a los dos idiomas del par.

## Casos de uso

- Traducción de documentación técnica y manuales entre inglés y birmano: el modelo permite condicionar el registro formal con ``, adecuado para textos corporativos y administrativos.
- Localización de interfaces y contenido web: con 2048 tokens de contexto puede procesar bloques de párrafos completos en una sola pasada, reduciendo la fragmentación de la traducción.
- Traducción de noticias y prensa: el autor incluye ejemplos de prompts de noticias (`En->My News`) en los benchmarks, lo que sugiere uso en pipelines de contenido periodístico.
- Subtitulado y transcripción conversacional: el token `<spoken>` permite generar traducciones con registro coloquial para diálogos y entrevistas.
- Análisis de corpus birmanos para investigación lingüística: la licencia Apache 2.0 y el tamaño compacto permiten desplegarlo en entornos de investigación con recursos limitados.
- Generación de datos sintéticos y aumentación: la capacidad de traducción inversa (`My->En`) y el marcado `<bt>` facilitan la creación de pares paralelos para entrenar otros modelos.
- Despliegue en hardware de consumo: con ~598 MB en BF16, puede ejecutarse en GPU consumer de gama media para traducción por lotes.

## Benchmarks y rendimiento

El autor publica curvas de validación (NLL y perplejidad) sobre el split `tokenized_65k/val`, no benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica | Etapa 1 final (paso 58.916) | Etapa 2 final (paso 6.793) |
|---|---|---|
| Comb NLL | 1,4316 | 1,1640 |
| Perplejidad combinada | 4,19 | 3,20 |
| En->My NLL | 1,7539 | 1,4829 |
| My->En NLL | 1,1548 | 0,8901 (PPL 2,44) |

El autor advierte que estos valores de perplejidad se miden sobre su propio split y vocabulario, por lo que no son comparables 1:1 con modelos evaluados en splits o vocabularios distintos. No se han publicado resultados de benchmarks estandarizados (BLEU, chrF, COMET) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~0,6 GB de pesos más memoria de activaciones y KV cache; en la práctica, menos de 2 GB para secuencias de 1024-2048 tokens.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) sin problema.
- Puede ejecutarse en CPU para traducción por lotes de baja latencia, dado el tamaño reducido.
- Opciones de despliegue: transformers (librería nativa, requiere `custom_code`), y potencialmente exportación a otros runtimes; no se documenta soporte directo de vLLM, llama.cpp, Ollama o TGI.
- Throughput de entrenamiento reportado: ~375k-400k tok/s en etapa 1 y ~405k-429k tok/s en etapa 2 sobre 9× RTX 5090; no se reporta latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MyTranslation_300M_Base | 298,76M | 2048 | en, my | Apache 2.0 | safetensors |
| NLLB-200 distilled 600M | ~600M | 512 | 200 idiomas (incl. my) | CC-BY-NC 4.0 | safetensors |
| M2M-100 418M | ~418M | 1024 | 100 idiomas (incl. my) | MIT | safetensors |
| MarianMT (en-my) | ~75M | 512 | en, my | MIT (varía) | safetensors |

MyTranslation_300M_Base ofrece un contexto mayor que NLLB distilled y M2M-100, licencia permisiva para uso comercial (a diferencia de NLLB) y control de registro explícito, pero carece de benchmarks estandarizados publicados que permitan comparar calidad de traducción frente a estos modelos. No se dispone de datos de BLEU/COMET para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint base previo al pulido de etapa 3 (hablado/idiomático); el autor indica que puede haber margen de mejora en registros coloquiales e idiomáticos.
- Solo soporta inglés y birmano; no es un modelo multilingüe general.
- Contexto máximo de 2048 tokens, entrenado a 1024; secuencias más largas pueden degradar la calidad.
- Riesgo de alucinación y de traducciones literales en expresiones idiomáticas, como sugiere el ejemplo de `My->En Idiom` incluido por el autor.
- Los valores de perplejidad no son comparables con otros modelos por diferencias de split y vocabulario.
- No se documentan evaluaciones de sesgo; el corpus puede reflejar sesgos de las fuentes de entrenamiento.
- Requiere `trust_remote_code` por el uso de `custom_code` en transformers; conviene auditar el código antes de desplegar en producción.
- Sin datos publicados de latencia, throughput de inferencia ni benchmarks estándar de calidad de traducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/freococo/MyTranslation_300M_Base
- Dataset: https://huggingface.co/datasets/freococo/myanmar-english-corpus
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
