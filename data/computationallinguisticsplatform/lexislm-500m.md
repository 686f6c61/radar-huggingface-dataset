# ComputationalLinguisticsPlatform/LexisLM-500m

## Resumen

LexisLM-500m es un modelo de lenguaje base en griego moderno de 502.193.664 parámetros (0,502B), entrenado desde inicialización aleatoria por el grupo ComputationalLinguisticsPlatform. Se trata de un transformer decoder-only de estilo LLaMA con embeddings de entrada y salida atados, RMSNorm, embeddings posicionales rotatorios (RoPE) y bloques feed-forward SwiGLU. Su contexto es de 4.096 tokens y emplea un tokenizador BPE byte-level específico para griego con 32.000 entradas base.

El modelo se preentrenó con aproximadamente una pasada sobre 22.000 millones de tokens de texto griego, provenientes de Greek Wikipedia y FineWeb2-Greek. Es un modelo exclusivamente preentrenado (pretrained-only), no ajustado por instrucciones, distribuido en formato bfloat16. Su relevancia radica en que aborda la escasez de modelos base compactos y nativos para griego, un idioma con menor representación en los grandes modelos multilingües, y lo hace con un tokenizador dedicado que preserva mayúsculas y acentos mediante normalización NFC.

La ficha se basa en la model card y el paper asociado (arXiv:2611.10209), que describe el preentrenamiento de modelos griegos compactos de 500M y 1B parámetros. No se han publicado datos sobre licencia ni sobre ajuste por instrucciones en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (RMSNorm, RoPE, SwiGLU, embeddings atados) |
| Parámetros totales | 502.193.664 (0,502B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Griego (el) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de estilo LLaMA con 16 capas, tamaño oculto de 1.536, 16 cabezas de atención con dimensión de cabeza 96, y tamaño oculto de la capa feed-forward de 4.096. Emplea embeddings de entrada y salida atados, RMSNorm con epsilon 1e-5, RoPE con theta 10.000 y bloques SwiGLU. El dropout es 0.0. El vocabulario del modelo es de 32.004 entradas: 32.000 base del tokenizador más cuatro entradas reservadas para una extensión de tokens de chat (cuya presencia no convierte al modelo en instruction-tuned).

El tokenizador es un BPE byte-level específico para griego con 32.000 entradas base (incluyendo `<unk>`, `<bos>`, `<eos>` y `<pad>`), normalización NFC y preservación de mayúsculas y acentos. Se entrenó sobre una muestra de 20 millones de ocurrencias de palabras: 20% Greek Wikipedia y 80% FineWeb2-Greek (porcentajes de la muestra del tokenizador, no del corpus completo de preentrenamiento). El preentrenamiento usó AdamW (betas 0,9 y 0,95), learning rate pico de 0,0003 con 2.000 pasos de warmup y decaimiento coseno hasta 0,00003, weight decay 0,1 y gradient clipping en 1,0. El corpus completo fue de aproximadamente 22.000 millones de tokens en una sola pasada. No se documenta RLHF ni DPO; el modelo es pretrained-only.

## Capacidades

- Generación de texto en griego mediante completado de documentos (text completion), no mediante diálogo instruccional.
- Modelado de lenguaje base: predicción del siguiente token, útil como base para fine-tuning posterior.
- Razonamiento y conocimiento factual limitados, medidos en benchmarks griegos traducidos (ARC, MMLU, TruthfulQA).
- Tokenizador nativo griego que preserva mayúsculas y acentos, lo que mejora la fidelidad en la tokenización del idioma.
- Soporte de tool calling / function calling: no disponible (modelo pretrained-only).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: no documentadas; el modelo está orientado exclusivamente a griego.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Separación de documentos mediante `<eos>`: es necesario anteponer `<eos>` al prompt para iniciar un documento nuevo, ya que el tokenizador no lo añade automáticamente.

## Casos de uso

- Fine-tuning supervisado para tareas griegas: el modelo sirve como punto de partida para ajuste con instrucciones o clasificación en griego, aprovechando su tokenizador nativo y su bajo coste computacional.
- Completado de texto y autocompletado en griego: adecuado para aplicaciones de escritura asistida o generación de borradores donde se requiere un modelo ligero y de dominio griego.
- Modelado de lenguaje para investigación lingüística: útil para estudiar distribuciones léxicas y sintácticas del griego con un modelo entrenado desde cero sobre corpus griego.
- Generación de datos sintéticos en griego: puede emplearse para producir texto de dominio griego que alimente otros pipelines, con revisión humana posterior.
- Clasificación y etiquetado de texto griego mediante fine-tuning de la cabeza de clasificación: por ejemplo, análisis de sentimiento o detección de temas en corpus periodísticos.
- Prototipado en entornos con recursos limitados: sus 0,5B parámetros permiten desplegarlo en hardware modesto para pruebas de concepto antes de escalar a modelos mayores.
- Evaluación comparativa de tokenizadores: como caso de estudio de un tokenizador BPE byte-level dedicado a un idioma de recursos medios.

## Benchmarks y rendimiento

| Benchmark griego | Shots | Preguntas | Base checkpoint |
|---|---:|---:|---:|
| ARC-Easy, precisión bruta | 25 | 2.376 | 44,4% |
| ARC-Easy, precisión normalizada | 25 | 2.376 | 41,9% |
| ARC-Challenge, precisión normalizada | 25 | 1.168 | 25,3% |
| MMLU, precisión | 5 | 14.042 | 25,3% |
| TruthfulQA, MC1 | 0 | 817 | 24,7% |
| TruthfulQA, MC2 | 0 | 817 | 42,1% |

Métricas de modelado de lenguaje en validación (distribución de validación de preentrenamiento: Greek Wikipedia y FineWeb2-Greek):

| Métrica | Valor |
|---|---:|
| Pérdida de validación | 2,426 |
| Perplejidad de validación | 11,31 |
| Bits por byte | 0,466 |
| Bits por carácter | 0,826 |

Las evaluaciones de benchmarks son sobre conjuntos completos de ILSP con traducción al griego de ARC, MMLU y TruthfulQA, usando verosimilitud de respuesta. La precisión normalizada de ARC usa normalización por longitud de caracteres; la selección de demostraciones usa semilla 1337. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos (0,5B parámetros × 2 bytes), más overhead de activaciones y caché KV para contexto de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,5 GB de pesos; en 4 bits, alrededor de 0,25 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter como A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (tag presente en Hugging Face), endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. A continuación se indica lo que se conoce de alternativas de la misma categoría (modelos base compactos para un idioma específico), sin cifras de rendimiento comparables:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| LexisLM-500m | 0,502B | 4.096 | no disponible | Hugging Face (transformers, safetensors) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible modelos comparables directos con datos verificables; se indica "no disponible".

## Limitaciones y advertencias

- Modelo pretrained-only: no está ajustado por instrucciones, por lo que no sigue instrucciones de forma fiable ni mantiene diálogos estructurados sin fine-tuning.
- Riesgo de alucinación: como modelo base, puede generar texto plausible pero factualmente incorrecto; requiere verificación en usos de producción.
- Rendimiento limitado en benchmarks: MMLU del 25,3% y ARC-Challenge del 25,3% indican conocimiento y razonamiento limitados, coherentes con su tamaño de 0,5B.
- Contexto corto: 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idioma: orientado exclusivamente a griego; no se documenta soporte multilingüe.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución; es imprescindible contactar con el autor antes de usarlo en producción.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus (Wikipedia y FineWeb2) puede introducir sesgos propios de esas fuentes.
- Tokenizador: es necesario anteponer `<eos>` manualmente para iniciar documentos nuevos; el tokenizador no lo añade automáticamente.
- Cuantizaciones: no se publican versiones GGUF ni cuantizadas oficiales; habría que generarlas a partir de los pesos safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/ComputationalLinguisticsPlatform/LexisLM-500m
- Paper (arXiv): https://arxiv.org/abs/2611.10209
- Dataset FineWeb2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
