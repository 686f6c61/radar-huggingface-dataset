# Raghav-Singhal/1pp-0.58b-v2-filt-seed1234-sft

## Resumen

1pp-0.58b-v2-filt-seed1234-sft es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de la variante "filtrada" (filt) de la escalera de escalado 1PP, con semilla 1234, sometida posteriormente a un ajuste supervisado (SFT) sobre conversaciones. El modelo emplea una arquitectura decoder estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con SwiGLU, 9 cabezas de atención y 3 cabezas KV (atención GQA con dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens.

La particularidad técnica del modelo radica en su condición experimental: reproduce el mismo flujo de documentos y el mismo orden que el modelo "raw" de referencia, pero los documentos marcados por un clasificador de seguridad (3.869.498 documentos, un 4,6% del corpus) permanecen en las secuencias de entrenamiento como contexto sin contribuir a la pérdida. El objetivo es medir el efecto de este filtrado selectivo sobre el rendimiento final, comparándolo con la variante sin filtrar.

Es relevante ahora como artefacto de investigación reproducible: permite estudiar cómo afecta la exclusión selectiva de datos de baja calidad o potencialmente inseguros al entrenamiento, manteniendo idénticas condiciones de cómputo, batch y schedule. No está pensado como asistente de propósito general, sino como pieza de un estudio controlado sobre calidad de datos y seguridad en el preentrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 580.445.568 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de tipo Llama con 24 capas, dimensión oculta de 1.152 y FFN de 4.608 con activación SwiGLU. Usa 9 cabezas de atención y 3 cabezas KV (atención de grupos de consultas), con dimensión de cabeza 128, RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases ni QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre el flujo alineado por pasos del modelo raw: 11.106 pasos, 23,29 mil millones de posiciones de token, batch global de 512 × 4.096 tokens, con enmascaramiento de atención entre documentos. El optimizador combina Muon (escalado de forma, LR matricial 0,005) con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 699 pasos, LR constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0119 y precisión bf16. La condición "filt" marca como no entrenados los documentos que un clasificador basado en gte (puntuado por fragmentos) detectó con puntuación máxima de al menos 3: 3.869.498 documentos, el 4,6% del total. Estos documentos permanecen en las secuencias como contexto pero no contribuyen a la pérdida, manteniendo el empaquetado idéntico byte a byte al del modelo raw.

El ajuste supervisado (SFT) consistió en una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con citas constitucionales), `dlab-spp/sp-sft-normal-300k` sin prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se empleó el mismo stack que en el preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), LR matricial 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de validación del modelo base en el checkpoint final fue de 2,626 sobre texto de documentos, 2,806 sobre texto del asistente y 2,816 sobre texto del usuario. La pérdida de SFT en tokens del asistente sobre 1.998 conversaciones reservadas fue de 2,199.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Razonamiento básico y respuesta a instrucciones tras el ajuste supervisado sobre conversaciones multiturno.
- Conversaciones multiturno, gracias al entrenamiento sobre mezclas con track multiturno y citas constitucionales.
- Capacidad multilingüe: únicamente inglés, según la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá del multiturno conversacional.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).
- Detención de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).

## Casos de uso

- Investigación sobre calidad de datos: el modelo sirve como condición experimental controlada para medir el impacto del filtrado selectivo de documentos (4,6% marcados) frente al modelo raw, manteniendo idénticos pasos, batch y schedule. Es adecuado porque el empaquetado de datos es idéntico byte a byte al del run raw.
- Reproducibilidad de experimentos de escalado: al ser parte de la escalera 1PP con semilla fija (1234) y receta documentada, permite replicar resultados y comparar pérdidas de validación entre variantes.
- Evaluación de clasificadores de seguridad en preentrenamiento: el modelo permite estudiar cómo el marcado de documentos por un clasificador gte (umbral de puntuación 3) afecta a las pérdidas finales sobre texto de documentos, asistente y usuario.
- Ajuste fino posterior para tareas concretas en inglés: con 580M parámetros y licencia Apache 2.0, puede servir de base para experimentos de fine-tuning académicos en dominios específicos.
- Generación de texto conversacional de bajo coste: su tamaño reducido permite desplegarlo en hardware modesto para prototipos de chat en inglés, siempre con expectativas ajustadas a su escala.
- Estudio de formatos de chat: al usar ChatML sin turno de sistema, es útil para analizar el efecto de esta elección de formato en el ajuste supervisado y en la generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación base (texto de documentos) | Pérdida por token | 2,626 |
| Validación base (texto del asistente) | Pérdida por token | 2,806 |
| Validación base (texto del usuario) | Pérdida por token | 2,816 |
| SFT reservado (tokens del asistente, 1.998 conversaciones) | Pérdida | 2,199 |
| Verificación HF vs Megatron (sft_val segmentos [3, 4]) | Pérdida HF | 2,1989 |
| Verificación HF vs Megatron (sft_val segmentos [3, 4]) | Pérdida Megatron de referencia | 2,1989 |
| Verificación HF vs Megatron (sft_val segmentos [3, 4]) | Diferencia absoluta | 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,2 GB solo para pesos (580M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- En cuantización de 8 bits: alrededor de 0,6 GB de pesos; en 4 bits: alrededor de 0,3 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, con holgura, incluso en modelos de gama media.
- Opciones de despliegue: transformers (librería indicada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); llama.cpp u Ollama requerirían conversión a GGUF, no documentada oficialmente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-filt-seed1234-sft | 580M | 4.096 | Apache 2.0 | Hugging Face | Condición filtrada con SFT; solo inglés |
| 1pp-0.58b-v2-raw-seed1234-base | 580M | 4.096 | Apache 2.0 | Hugging Face | Modelo raw de referencia, sin filtrado; misma receta |
| SmolLM2 (familia) | no disponible en la información | no disponible | no disponible | Hugging Face | Comparte vocabulario (49.152 tokens) con este modelo |
| Alternativas de ~0,5B con SFT | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos de benchmarks en la información |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor indica que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general; no debería usarse como chatbot de producción sin evaluación adicional.
- Solo soporta inglés; no se documenta capacidad multilingüe.
- Longitud de contexto limitada a 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinación inherente a un modelo de 580M parámetros entrenado con 23,29B tokens; no se documentan evaluaciones de factualidad.
- Sesgos conocidos: no documentados explícitamente en la model card; al entrenarse sobre DCLM-edu con filtrado parcial, puede heredar sesgos del corpus y del clasificador de seguridad.
- El filtrado de seguridad se aplicó solo a nivel de pérdida (documentos marcados como no entrenados), no a la eliminación del contexto; el modelo puede haber aprendido patrones de documentos marcados presentes como contexto.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación sin garantías de calidad, el uso comercial no está recomendado por el autor.
- Formato de chat específico (ChatML sin turno de sistema); no admite system prompt, lo que limita el control de comportamiento en producción.
- No se documentan cuantizaciones oficiales ni soporte verificado en llama.cpp u Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-filt-seed1234-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed1234-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
