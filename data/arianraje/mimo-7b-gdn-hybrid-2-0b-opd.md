# arianraje/mimo-7b-gdn-hybrid-2.0B-OPD

## Resumen

El modelo `arianraje/mimo-7b-gdn-hybrid-2.0B-OPD` es un checkpoint de investigación desarrollado por arianraje dentro de un estudio sobre conversión de modelos full-attention en híbridos de atención lineal. Concretamente, parte del profesor `XiaomiMiMo/MiMo-7B-RL-0530` y lo destila mediante destilación on-policy (OPD) en una arquitectura híbrida compuesta por capas de atención estándar Qwen2 y capas Gated DeltaNet en proporción uniforme 1:4. El modelo tiene 8.309.898.304 parámetros totales y una ventana de contexto de 65.536 tokens.

Se trata del "decayed final" de la etapa 3 dentro de una escalera de entrenamiento WSD (Warmup-Stable-Decay), con 2.000.126.188 tokens de generación consumidos y 12.887 pasos de optimización. Su relevancia radica en explorar si la destilación escalonada puede recuperar capacidades de razonamiento matemático y contexto largo en arquitecturas híbridas más eficientes que un transformer puro. Es un modelo experimental, con licencia MIT y formato safetensors, que requiere una arquitectura personalizada para cargarse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido de atención lineal (Gated DeltaNet) y atención estándar Qwen2, proporción uniforme 1:4, transformer |
| Parametros totales | 8.309.898.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención estándar Qwen2 en una proporción uniforme de 1:4. Es un diseño híbrido que busca reducir el coste computacional de la atención convencional manteniendo la capacidad de recuperar información de contexto largo. El modelo no es un mixture-of-experts, por lo que todos los parámetros se activan en cada paso.

El entrenamiento se realiza mediante destilación on-policy (OPD) a partir del profesor `XiaomiMiMo/MiMo-7B-RL-0530`. El proceso sigue una escalera WSD con tres etapas: en la etapa 3, el modelo extiende el checkpoint `arianraje/mimo-7b-gdn-hybrid-1.8B-OPD` desde su estado pre-decay (1.721,4 millones de tokens) sin cambios de receta. Se usa la misma mezcla de datos matemáticos de stage-3, un horizonte de rollout de 32.768 tokens, una ventana de sampler de 49.152 tokens, un decaimiento lineal de 600 pasos y un factor de cola de 6.0. El resultado es un "decayed final" que consume 2.000.126.188 tokens de generación. No se menciona RLHF ni DPO; la técnica empleada es destilación on-policy.

## Capacidades

- Generación de texto y razonamiento matemático avanzado, con resultados en AIME24, AIME25, MATH-500 y GSM8K.
- Soporte de modo "think" (paso a paso) y modo "no-think" en matemáticas, medido con pass@1 y pass@8.
- Recuperación de información en contexto largo, evaluada con NIAH multikey hasta 32K tokens, con puntuaciones superiores al 83% en todas las longitudes.
- Conocimiento general y razonamiento de sentido común, medido con MMLU, PIQA, HellaSwag, ARC-E, ARC-C y Winogrande.
- Ventana de contexto de 65.536 tokens, aunque los benchmarks disponibles solo verifican hasta 32K.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión o audio.

## Casos de uso

- Razonamiento matemático en entornos educativos: el modelo puede resolver problemas de nivel AIME y MATH-500 con explicaciones paso a paso, lo que lo hace adecuado para tutores automáticos de matemáticas avanzadas.
- Análisis de documentos extensos: gracias a su ventana de 65.536 tokens, puede procesar informes técnicos, papers o contratos largos y extraer información específica sin truncamiento.
- Generación de datos sintéticos para entrenamiento: su capacidad de generar razonamientos matemáticos correctos permite crear datasets de instrucciones para destilar modelos más pequeños.
- Investigación en arquitecturas eficientes: sirve como referencia para comparar el rendimiento de híbridos Gated DeltaNet frente a transformers puros en tareas de razonamiento y contexto largo.
- Evaluación comparativa de modelos de razonamiento: sus métricas en benchmarks estandarizados (AIME, MATH-500, MMLU) permiten usarlo como baseline en estudios de destilación on-policy.
- Asistente de análisis numérico: puede ayudar a verificar cálculos, resolver ecuaciones y explicar conceptos matemáticos en aplicaciones de soporte técnico.
- Búsqueda de información en bases de conocimiento extensas: la recuperación multikey en contexto largo (NIAH) sugiere utilidad en sistemas de pregunta-respuesta sobre documentación voluminosa.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados por el autor, comparando el modelo 2.0B-OPD con el checkpoint anterior de la misma escalera, el 1.8B-OPD. Los valores de AIME provienen de n=30 problemas, con un margen de error aproximado de ±14 puntos en pass@1; MATH-500 (n=500) es la evaluación con mayor potencia estadística.

| Metric | 1.8B-OPD | 2.0B-OPD |
|---|---:|---:|
| AIME24 think pass@1 / pass@8 @32K | 63.3 / 76.7 | 59.6 / 80.0 |
| AIME25 think pass@1 / pass@8 @32K | 49.2 / 73.3 | 47.1 / 73.3 |
| MATH-500 think pass@1 @32K | 93.4 | 93.8 |
| MATH-500 no-think pass@1 @4K | 70.2 | 70.8 |
| GSM8K no-think strict / flexible @1K | 58.5 / 65.2 | 58.1 / 62.2 |
| MMLU 5-shot | 53.8 | 54.6 |
| PIQA / HellaSwag / ARC-E / ARC-C / Winogrande | 72.0 / 60.3 / 62.8 / 39.6 / 59.7 | 72.5 / 59.9 / 62.7 / 39.5 / 58.8 |
| NIAH multikey 4K / 8K / 16K / 32K | 96.8 / 97.2 / 95.0 / 84.6 | 96.8 / 96.8 / 94.8 / 83.8 |
| NIAH single, multiquery (all lengths) | ≥99.8 | ≥100.0 |
| trunc / mean gen tokens: MATH-500, AIME24, AIME25 | 3.6%/8168, 26.7%/21925, 32.5%/23552 | 3.8%/7930, 29.2%/21862, 38.3%/24357 |

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. A partir de los parámetros totales (8.309.898.304) y el formato safetensors, se puede hacer una estimación orientativa:

- VRAM estimada para inferencia en FP16: aproximadamente 17 GB solo para los pesos, más memoria para KV cache y activaciones. Con contexto largo de 32K o 65K, la VRAM necesaria supera con holgura los 24 GB.
- GPU recomendadas: A100 40GB, H100 80GB o RTX 4090 24GB. Para contexto largo, se recomienda una GPU con al menos 40 GB de VRAM.
- En consumer GPU: una RTX 4090 podría ejecutar el modelo en FP16 con contextos moderados, pero no se garantiza para la ventana completa de 65.536 tokens.
- Opciones de despliegue: transformers (requiere el registro de la arquitectura `mimo_gdn` y las librerías `transformers 4.57.x` y `flash-linear-attention 0.5.x`). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | MATH-500 think pass@1 | AIME24 think pass@1 |
|---|---:|---:|---|---:|---:|
| arianraje/mimo-7b-gdn-hybrid-2.0B-OPD | 8.309.898.304 | 65.536 | MIT | 93.8 | 59.6 |
| arianraje/mimo-7b-gdn-hybrid-1.8B-OPD | No disponible | No disponible | MIT | 93.4 | 63.3 |
| arianraje/mimo-7b-gdn-hybrid-600M-OPD | No disponible | No disponible | MIT | No disponible | No disponible |
| XiaomiMiMo/MiMo-7B-RL-0530 (profesor) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a los datos disponibles en la model card y en la información de HuggingFace. El modelo 2.0B-OPD obtiene un ligero incremento en MATH-500 y MMLU respecto al 1.8B-OPD, pero desciende en AIME24 pass@1. El margen de error en AIME hace que estas diferencias no sean concluyentes. El 600M-OPD y el profesor MiMo-7B-RL-0530 no tienen métricas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Las métricas de AIME se calcularon con n=30 problemas, lo que implica un margen de error de ±14 puntos en pass@1. No deben interpretarse como resultados definitivos.
- Es un modelo experimental de investigación, no validado en producción ni revisado por pares.
- No se dispone de información sobre los idiomas soportados. Los benchmarks están en inglés, por lo que el rendimiento en otros idiomas es desconocido.
- No hay datos sobre sesgos, alucinaciones ni comportamientos de seguridad. El riesgo de alucinación no ha sido evaluado.
- La arquitectura personalizada requiere el registro manual de `mimo_gdn` y dependencias específicas (`transformers 4.57.x`, `flash-linear-attention 0.5.x`), lo que complica el despliegue en entornos estándar.
- El rendimiento en la ventana completa de 65.536 tokens no está verificado; los benchmarks de contexto largo solo llegan hasta 32K.
- No se documentan capacidades de tool calling, agentes, visión ni audio, por lo que no debe asumirse su soporte.
- La licencia MIT permite uso comercial, pero al tratarse de un modelo en fase de investigación se recomienda validar su comportamiento antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-2.0B-OPD
- Checkpoint pre-decay: https://huggingface.co/arianraje/mimo-7b-gdn-opd-predecay-1921m-step12391
- Modelo base (profesor): https://huggingface.co/XiaomiMiMo/MiMo-7B-RL-0530
- Modelo anterior de la escalera: https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-1.8B-OPD
- Modelo de la misma familia: https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-600M-OPD
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
