# Kandil7/Baligh-1.7B

## Resumen

Baligh-1.7B es un modelo de lenguaje causal de 1.720.574.976 parámetros (1,4B no de embedding) desarrollado por Kandil7, especializado en árabe formal (fusha) y en conocimiento islámico. Se construye a partir de `unsloth/Qwen3-1.7B-Base` mediante un proceso en dos etapas: preentrenamiento continuado (CPT) sobre corpus árabes de gran escala y ajuste supervisado (SFT) con instrucciones árabes y pares de pregunta-respuesta islámicas. El resultado se distribuye como un modelo instructivo fusionado en FP16, listo para inferencia con `transformers`.

La relevancia del modelo está en su enfoque *Arabic-first*: frente a modelos multilingües genéricos que rinden de forma desigual en árabe, Baligh concentra el entrenamiento en corpus específicos (ArabicWeb24, ArabicText-Large, The Arabic Pile, CIDAR, evol-instruct-arabic e IslamWeb fatwas) y añade un ciclo de conocimiento islámico (Corán, hadiz, fiqh, tafsir). Con 1,7B parámetros y licencia Apache 2.0, es un candidato viable para despliegue en hardware modesto y para experimentación académica en PLN árabe.

Arquitectura transformer decoder-only con 28 capas, GQA (16 cabezas de consulta y 8 de clave-valor), tamaño oculto 2048 y tokenizador Qwen3 de ~152K vocabulario. El contexto nativo de la arquitectura es de 32.768 tokens, aunque la ventana efectiva de entrenamiento en esta versión v0 es de solo 2.048 tokens, sin escalado RoPE aplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, 28 capas, GQA (16 query / 8 KV heads), hidden size 2048 |
| Parametros totales | 1.720.574.976 (1,7B; 1,4B no de embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos; ventana efectiva de entrenamiento v0: 2.048 tokens |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante entrenamiento; pesos publicados en FP16 (bf16 auto en Ampere+) |
| Idiomas soportados | Árabe (principal, fusha) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder-only con 28 capas, atención con grouped-query attention (16 cabezas de consulta y 8 de clave-valor), dimensión oculta 2048 y tokenizador de ~152K entradas. La atención usa SDPA por defecto, con actualización automática a `flash_attention_2` en GPUs sm_80 o superiores. La precisión es FP16 en GPUs Turing (sm_75) y bf16 en Ampere o posterior.

El entrenamiento se divide en dos etapas. La etapa 1 (CPT) usa QLoRA 4-bit NF4 (r=16, alpha=16, dropout=0) sobre todas las proyecciones de atención y MLP, con secuencias de 1.024 tokens, learning rate 2e-4 con scheduler coseno y warmup 100, optimizador `adamw_8bit` y gradient checkpointing. Los datos son ArabicWeb24 (70%), ArabicText-Large (20%) y The Arabic Pile (10%), más un ciclo islámico con colecciones de hadiz, QA del Corán y textos coránicos. Se ejecutaron 1.000 pasos en esta validación, con 50.000 planificados para la etapa 2. La etapa 2 (SFT) usa QLoRA 4-bit NF4 (r=16, alpha=16) con enmascaramiento de pérdida solo en la respuesta (tokens de prompt a -100), learning rate 1e-4, warmup 500 y 5.000 pasos ejecutados (10.000 planificados). Los datos son CIDAR (40%), evol-instruct-arabic (35%), IslamWeb fatwas (15%) y resumen en árabe (10%).

Entre las decisiones técnicas destacadas: se eliminó el filtro de árabe en la limpieza del SFT (la función `sanitize()` vacía texto no árabe en lugar de descartar filas, conservando ejemplos mixtos), el split de IslamWeb es seguro contra fugas agrupando por `fatwa_id`, y la deduplicación prioriza el árabe sobre otros idiomas.

## Capacidades

- Generación de texto y respuesta a preguntas en árabe formal (fusha) e inglés.
- Conocimiento especializado en dominio islámico: fiqh, hadiz, tafsir, aqeedah y QA sobre el Corán.
- Seguimiento de instrucciones en árabe (instruction following).
- Resumen y reformulación de textos en árabe.
- Salida estructurada, incluida extracción en JSON.
- Conversación multi-turno (el SFT incluye turnos ShareGPT proyectados a esquema plano).
- No se documenta soporte de tool calling, function calling ni modo thinking explícito.
- No se documenta soporte de visión ni audio.
- Capacidades multilingües limitadas a árabe e inglés; el rendimiento en dialectos árabes es variable y v0 se centra en fusha.

## Casos de uso

- Atención al cliente en árabe: el modelo puede gestionar conversaciones multi-turno en fusha con instrucciones claras, aunque la ventana efectiva de 2.048 tokens limita el historial; adecuado para consultas frecuentes y respuestas acotadas.
- Consultas de conocimiento islámico de bajo riesgo: responder preguntas sobre fiqh, hadiz o tafsir como apoyo informativo, con revisión humana obligatoria por el riesgo de alucinación en dictámenes concretos.
- Resumen de documentos árabes: síntesis de artículos, informes o textos largos divididos en fragmentos de hasta ~2.000 tokens, aprovechando el entrenamiento específico en resumen árabe.
- Extracción estructurada: convertir texto libre en JSON (por ejemplo, campos de formularios o entidades) gracias a la instrucción en salida estructurada documentada.
- Asistente educativo de árabe: práctica de lectura, reformulación y explicación de vocabulario en fusha para estudiantes, con despliegue local en GPU de consumo.
- Prototipado e investigación en PLN árabe: modelo base pequeño y con licencia permisiva para experimentar con CPT/SFT, evaluación de técnicas QLoRA y comparación con Qwen3-1.7B original.
- Clasificación y etiquetado de textos árabes: uso como generador de etiquetas o justificaciones breves en pipelines de anotación semiautomática.

## Benchmarks y rendimiento

| Benchmark | Baseline (Qwen3-1.7B-Base) | Post-SFT (Baligh-1.7B) | Delta |
|---|---|---|---|
| CIDAR ROUGE-L | 0.0402 | 0.0543 | +35% |
| CIDAR BLEU | 2.28 | 1.32 | −42% |

Notas: MMLU-Arabic no está disponible porque un fallo de esquema CSV en el pipeline de evaluación lo bloquea (no es un problema del modelo). La caída de BLEU probablemente se debe a que el modelo genera respuestas más largas y fluidas que divergen de las referencias cortas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~3,5 GB de pesos más caché KV; en la práctica, 6-8 GB para secuencias moderadas.
- VRAM estimada en cuantización 4-bit (GGUF/AWQ, no publicada oficialmente): ~1,2-1,5 GB de pesos; 3-4 GB totales con contexto corto.
- GPU recomendadas: NVIDIA A100, H100 o L4 para producción; RTX 4090, RTX 3090 y RTX 4080 para desarrollo.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en 8 GB con cuantización 4-bit.
- Opciones de despliegue: `transformers` (soporte nativo documentado), TGI (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se distribuye GGUF oficial).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Baligh-1.7B | 1,7B | 32K nativo / 2K efectivo v0 | ar, en | Apache 2.0 | Especializado en árabe e islam; benchmarks limitados (CIDAR) |
| Qwen3-1.7B | 1,7B | 32K | multilingüe amplio | Apache 2.0 | Modelo base del que deriva; mayor cobertura idiomática, sin especialización islámica |
| Qwen3-1.7B-Base | 1,7B | 32K | multilingüe amplio | Apache 2.0 | Base sin ajuste instructivo; referencia de los benchmarks CIDAR |
| Modelos árabes pequeños (p. ej. variantes de 1-3B) | 1-3B | variable | ar, en | variable | No disponible comparación cuantitativa en la información proporcionada |

## Limitaciones y advertencias

- No sustituye a especialistas islámicos cualificados: puede alucinar dictámenes religiosos concretos.
- Conocimiento limitado a la fecha de corte de los datos de entrenamiento.
- Rendimiento variable en dialectos árabes; v0 se centra en fusha.
- Contexto efectivo de 2.048 tokens pese a los 32.768 nativos: no usar para documentos largos sin trocear.
- No apto para decisiones de alto riesgo (médicas, legales, financieras).
- Sesgos no documentados explícitamente; los corpus web árabes pueden introducir sesgos de dominio y de registro.
- Licencia Apache 2.0 permite uso comercial, pero el dominio islámico exige revisión humana y avisos claros al usuario final.
- Solo se publican dos métricas de evaluación (CIDAR ROUGE-L y BLEU); no hay benchmarks estándar (MMLU, HumanEval, GSM8K) disponibles.
- No se distribuyen pesos cuantizados oficiales; la conversión a GGUF corre a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kandil7/Baligh-1.7B
- Repositorio GitHub: https://github.com/Kandil7/Baligh-1.7B
- Documentación: https://github.com/Kandil7/Baligh-1.7B/tree/main/docs
- Licencia: https://github.com/Kandil7/Baligh-1.7B/blob/main/LICENSE
- Modelo base: https://huggingface.co/unsloth/Qwen3-1.7B-Base
- Dataset ArabicWeb24: https://huggingface.co/datasets/lightonai/ArabicWeb24
- Dataset ArabicText-Large: https://huggingface.co/datasets/Jr23xd23/ArabicText-Large
- Dataset The Arabic Pile (Dialects): https://huggingface.co/datasets/premio-ai/TheArabicPile_Dialects
- Dataset CIDAR: https://huggingface.co/datasets/arbml/CIDAR
- Dataset evol-instruct-arabic: https://huggingface.co/datasets/FreedomIntelligence/evol-instruct-arabic
- Dataset IslamWeb fatwas: https://huggingface.co/datasets/Kandil7/islamweb-fatwa-ar
