# DavidAU/LFM2.5-1.2B-Thinking-Claude-4.6-Opus-Heretic-Uncensored-DISTILL

## Resumen

LFM2.5-1.2B-Thinking-Claude-4.6-Opus-Heretic-Uncensored-DISTILL es un ajuste fino (fine-tune) completo del modelo LFM2.5-1.2B-Thinking, desarrollado por el usuario DavidAU. Se trata de un modelo de generación de texto de 1.170 millones de parámetros (1,17 B) especializado en escritura creativa y ficción, cuyo razonamiento interno ha sido reemplazado mediante destilación de un conjunto de datos de razonamiento de Claude 4.5 Opus (TeichAI/claude-4.5-opus-high-reasoning-250x). El entrenamiento se realizó con Unsloth en precisión de 16 bits sobre hardware local.

El modelo parte de la variante "Heretic" de MuXodious (LFM2.5-1.2B-Thinking-absolute-heresy), que elimina los mecanismos de rechazo (abliteration). El autor aplica primero el proceso "Heretic" y después el ajuste fino, de modo que el fine-tune corrige los problemas derivados de la descensura. El resultado es un modelo sin filtros de rechazo, con un modo de razonamiento compacto pero detallado, y una ventana de contexto declarada de 128 000 tokens.

Su relevancia actual reside en que ofrece capacidades de razonamiento y escritura creativa en un tamaño muy reducido (1,17 B de parámetros, repo de 2,3 GB), lo que permite ejecutarlo en hardware de consumo. Está publicado bajo licencia Apache 2.0 y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2, según tags del repo; detalles internos no disponibles) |
| Parametros totales | 1.170.340.608 (1,17 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 128 000 tokens (según model card) |
| Tipos de cuantizacion | GGUF (Q5, Q6, Q8, 16 bits recomendados; IQ3_M mínimo con imatrix); EXL2, AWQ, GPTQ, HQQ mencionados en la colección de fuentes del autor; bfloat16 en safetensors |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), GGUF, y otras cuantizaciones vía repos del autor |

## Arquitectura y entrenamiento

El modelo se basa en la familia LFM2 (Liquid AI Foundation Model 2), según los tags del repositorio, aunque la model card no detalla la arquitectura interna (número de capas, atención, etc.). El tamaño real de pesos en safetensors es de 1.170.340.608 parámetros, almacenados en bfloat16. El contexto declarado es de 128 000 tokens.

El proceso de entrenamiento consistió en un fine-tune completo con Unsloth en precisión de 16 bits, sobre el modelo base MuXodious/LFM2.5-1.2B-Thinking-absolute-heresy (ya "Heretic'ed", es decir, con los rechazos eliminados mediante abliteration). El razonamiento del modelo se sustituyó por completo mediante destilación del dataset TeichAI/claude-4.5-opus-high-reasoning-250x. Según el autor, el razonamiento resultante es compacto pero muy detallado y directo. El orden del proceso (primero descensura, después ajuste fino) busca corregir los problemas introducidos por la eliminación de rechazos. No se especifican el número de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" completo, destilado de trazas de razonamiento de Claude 4.5 Opus.
- Escritura creativa y de ficción: generación de tramas, subtramas, escenas, relatos y continuación de escenas, en todos los géneros (ciencia ficción, romance, etc.).
- Escritura "vivid prosing": prosa descriptiva y detallada.
- Modelo sin censura (uncensored/abliterated): no rechaza peticiones de contenido explícito, horror o lenguaje soez, aunque en algunos casos requiere instrucciones explícitas (por ejemplo, indicar el vocabulario soez a usar) para alcanzar el nivel de explicitud deseado.
- Conversación multi-turno y rol (chat/roleplay), con ajustes de muestreo específicos recomendados (smoothing factor 1,5; repetition penalty 1,05–1,15).
- Estabilidad de razonamiento frente a la temperatura en el rango 0,1–2,5.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Visión y audio: no disponibles.

## Casos de uso

- Generación de ficción y relatos: el modelo puede generar tramas completas, subtramas y escenas en cualquier género gracias a su ajuste específico en escritura creativa y a su contexto de 128 000 tokens, que permite mantener coherencia en novelas o sagas largas.
- Continuación de escenas y "storytelling" interactivo: adecuado para herramientas de escritura asistida donde el autor necesita continuar un texto manteniendo tono y estilo, con control fino mediante parámetros de muestreo.
- Roleplay y chat conversacional sin restricciones: su naturaleza uncensored lo hace apto para entornos de rol adulto o narrativas maduras donde otros modelos rechazarían contenido, siempre que se dirija explícitamente el nivel de explicitud.
- Generación de contenido de terror o violencia narrativa: el modelo no aplica rechazos, por lo que puede producir escenas de horror explícito cuando se le indica; útil en videojuegos narrativos o guiones de género.
- Prototipado de razonamiento en hardware de consumo: con 1,17 B de parámetros y cuantizaciones GGUF, puede ejecutarse en portátiles o GPUs de gama media para experimentar con cadenas de razonamiento destiladas de un modelo grande.
- Asistente de escritura local y privada: al caber en equipos modestos y no requerir API externa, permite desplegar un asistente creativo offline en aplicaciones de escritorio (KoboldCpp, text-generation-webui, Silly Tavern).
- Generación de diálogos y guiones: para guionistas que necesitan borradores rápidos de diálogo con libertad temática, ajustando temperatura y repetition penalty según las recomendaciones del autor.

## Benchmarks y rendimiento

Resultados publicados en la model card (comparación entre el modelo base Heretic en q8 y este modelo):

| Benchmark | Base Heretic (q8) | Este modelo |
|---|---|---|
| ARC Challenge | 0,352 | 0,356 |
| ARC Easy | 0,418 | 0,471 |
| BoolQ | 0,656 | 0,691 |
| HellaSwag | 0,476 | 0,505 |
| OpenBookQA | 0,366 | 0,386 |
| PIQA | 0,681 | 0,701 |
| Winogrande | 0,508 | 0,539 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento o código en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 2,3–2,5 GB solo para pesos, más overhead de contexto (el contexto de 128k requiere memoria KV adicional considerable). En cuantización Q8, en torno a 1,3 GB; en Q5, en torno a 0,9 GB; en Q4, en torno a 0,7 GB (estimaciones a partir del número de parámetros).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060/4060 o superiores para Q8/16 bits con contexto moderado; A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas de consumo (RTX 3060 en adelante) e incluso en CPU con cuantizaciones GGUF.
- Opciones de despliegue: transformers (safetensors), llama.cpp / KoboldCpp (GGUF), text-generation-webui (con llama_HF para GGUF), Silly Tavern; vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.
- El autor recomienda encarecidamente cuantizaciones Q5, Q6, Q8 o 16 bits, o como mínimo IQ3_M con imatrix; cuantizaciones por debajo de Q4 sin imatrix pueden entrar en bucles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-1.2B-Thinking-Claude-4.6-Opus-Heretic-Uncensored-DISTILL | 1,17 B | 128k | Apache 2.0 | Fine-tune uncensored con razonamiento destilado; solo inglés |
| MuXodious/LFM2.5-1.2B-Thinking-absolute-heresy (base) | 1,17 B | no disponible | no disponible | Base Heretic sin el fine-tune de razonamiento; benchmarks inferiores en la tabla del autor |
| LFM2.5-1.2B-Thinking (original de Liquid AI) | 1,17 B | no disponible | no disponible | Modelo original con rechazos y razonamiento original; no comparable directamente en benchmarks publicados aquí |

No se dispone de datos de benchmarks de modelos alternativos de terceros en la información proporcionada para una comparación cuantitativa más amplia.

## Limitaciones y advertencias

- Modelo descensurado (abliterated): no aplica rechazos, lo que implica riesgo de generar contenido explícito, violento u ofensivo sin filtro. No apto para aplicaciones dirigidas al público general sin moderación externa.
- Riesgo de alucinación: como todo modelo de 1,17 B, su fiabilidad factual es limitada; los benchmarks de conocimiento (ARC, OpenBookQA) rondan el 0,35–0,39, lo que indica conocimiento factual modesto.
- Solo inglés declarado: no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Contexto: aunque declara 128k tokens, no hay datos publicados sobre rendimiento real en contextos largos; la memoria KV necesaria puede ser elevada.
- Bucles en generación: el autor advierte que cuantizaciones inferiores a Q4 sin imatrix pueden entrar en bucles; se recomienda Q5 o superior.
- Ajuste de muestreo necesario: requiere repetition penalty 1,05–1,15 o smoothing factor 1,5 para un funcionamiento fluido; sin estos ajustes el rendimiento puede degradarse.
- Contenido explícito: para alcanzar niveles gráficos o soeces es necesario dirigir explícitamente al modelo; de lo contrario, la salida puede resultar "blanda".
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir la normativa aplicable sobre contenido sensible.
- Procedencia: es un fine-tune de un modelo de terceros (MuXodious) sobre LFM2.5 de Liquid AI; la model card no documenta el número de tokens de entrenamiento ni la composición completa del dataset, lo que dificulta evaluar sesgos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/LFM2.5-1.2B-Thinking-Claude-4.6-Opus-Heretic-Uncensored-DISTILL
- Modelo base: https://huggingface.co/MuXodious/LFM2.5-1.2B-Thinking-absolute-heresy
- Dataset de destilación: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Perfil del autor: https://huggingface.co/DavidAU
- Colección de fuentes del autor (GGUF, EXL2, AWQ, GPTQ, HQQ): https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Heretic (software de abliteration): https://github.com/p-e-w/heretic
