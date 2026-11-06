# Jeesup/svd-safety-l2_gsmrec_swift_jbb_remove50

## Resumen

`Jeesup/svd-safety-l2_gsmrec_swift_jbb_remove50` es un artefacto de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión por descomposición en valores singulares (SVD) mediante el método Swift-SVD, eliminando el 50 % de los parámetros del modelo original. Sobre esa base comprimida se entrena una LoRA de recuperación con el conjunto de entrenamiento de GSM8K (7.473 problemas en formato Alpaca), que después se fusiona en los pesos. El resultado es un modelo de 6.738.415.616 parámetros (frente a los ~6.740 millones del Llama-2-7B original, la reducción afecta a la estructura interna, no al recuento nominal de pesos) publicado en safetensors con la licencia Llama 2.

El modelo forma parte del proyecto `svd_safety` del autor (Jeesup), cuyo objetivo declarado es estudiar cómo la compresión SVD interactúa con el comportamiento de seguridad y con capacidades específicas como el razonamiento matemático. La calibración de la SVD se realiza con una mezcla de WikiText-2 y respuestas dañinas de JBB multiplicadas por 13 (configuración W+JBB), con semilla 42. El autor advierte explícitamente de que no es un asistente de propósito general y de que algunas "celdas" del experimento están deliberadamente degradadas en seguridad o sobre-rechazan peticiones benignas.

Por tanto, su relevancia es fundamentalmente académica: sirve como punto de comparación para estudiar los efectos de la compresión agresiva sobre la alineación de seguridad, el exceso de rechazo y el rendimiento en tareas de razonamiento. No está pensado para despliegue en producción ni para uso como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con Swift-SVD al 50 % |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat soporta 4.096 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (el modelo base esta entrenado principalmente en ingles) |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B chat: un transformer decoder-only con atención causal multi-cabeza, normalización RMSNorm y activación SwiGLU. Sobre esa base se aplica Swift-SVD, una compresión por descomposición en valores singulares que reduce el rango de las matrices de pesos y elimina aproximadamente el 50 % de los parámetros efectivos. La calibración para la SVD utiliza una combinación de WikiText-2 y respuestas dañinas del conjunto JBB replicadas 13 veces (W+JBB), con semilla 42, lo que introduce un sesgo deliberado hacia el comportamiento frente a prompts maliciosos.

Tras la compresión, se entrena una LoRA de recuperación sobre el split de entrenamiento de GSM8K (7.473 problemas, formato Alpaca, longitud de corte 512, con un split de validación de 500 ejemplos) en lugar del habitual `alpaca-cleaned`. La LoRA se fusiona posteriormente en los pesos, de modo que el artefacto publicado no requiere adaptadores separados. El autor describe el resultado como un "research artifact" generado por el pipeline `jobs/gsmrec_slurm.sh` del proyecto `svd_safety`, sin que se documenten en la model card detalles adicionales sobre hiperparámetros de entrenamiento, número de épocas, RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama-2-7b-chat.
- Razonamiento matemático elemental: el modelo ha sido específicamente ajustado con GSM8K, aunque los resultados medidos son muy bajos (8,57 % en 5-shot estricto), lo que sugiere que la recuperación no compensa la pérdida por compresión.
- Seguimiento de instrucciones: capacidad medida mediante IFEval con un 8,32 % en prompt-level strict, muy por debajo del modelo base.
- Comportamiento de rechazo: el modelo muestra una tasa de sobre-rechazo elevada en XSTest-safe (85,97 %) y OR-Bench-Hard-1k (94,59 %), es decir, tiende a rechazar peticiones benignas.
- Resistencia a ataques de jailbreak: las tasas de éxito adversarial medidas son bajas (AdvBench ASR 0,19; StrongREJECT ASR 0,32), aunque el autor advierte de que algunas celdas están deliberadamente degradadas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de referencia para medir el impacto de Swift-SVD al 50 % sobre perplejidad, capacidades y alineación, comparándolo con el Llama-2-7b-chat original y con otras variantes del proyecto `svd_safety`.
- Estudio de sobre-rechazo y calibración de seguridad: las altas tasas de rechazo en XSTest-safe y OR-Bench permiten analizar cómo la calibración con datos dañinos (JBB x13) desplaza la frontera entre rechazo legítimo y sobre-rechazo.
- Evaluación de recuperación con LoRA sobre dominios específicos: el ajuste con GSM8K permite estudiar si una LoRA de recuperación de bajo rango compensa la pérdida de capacidad matemática tras la compresión SVD.
- Benchmarking de pipelines de compresión: útil para validar herramientas de SVD, calibración y fusión de LoRA en entornos de investigación (Slurm, transformers) antes de aplicarlas a modelos mayores.
- Análisis de robustez adversarial: las métricas de ASR frente a AdvBench y StrongREJECT permiten comparar la resistencia a jailbreaks de modelos comprimidos frente a los originales.
- Docencia y experimentación reproducible: al estar publicados los pesos y documentarse la semilla y el pipeline, puede reproducirse en laboratorios con recursos limitados para estudiar efectos de la compresión.

## Benchmarks y rendimiento

Datos medidos por el autor y publicados en la model card:

| Metrica | Valor |
|---|---|
| WikiText-2 PPL | 19,69 |
| Media zero-shot en 7 tareas | 40,06 % |
| AdvBench ASR (HarmBench judge) | 0,19 % |
| StrongREJECT ASR (HarmBench judge) | 0,32 % |
| XSTest-safe sobre-rechazo (WildGuard) / scored | 85,97 % / 88,40 % |
| OR-Bench-Hard-1k sobre-rechazo / scored | 94,59 % / 96,66 % |
| GSM8K 5-shot strict / flexible (chat template) | 8,57 % / 8,72 % |
| IFEval prompt-level strict | 8,32 % |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB de pesos, por lo que se necesitan al menos 16 GB de VRAM para cargar el modelo completo sin cuantizar.
- GPU recomendadas para FP16: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia con margen para el contexto.
- GPU consumer: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en FP16; en GPUs de 16 GB (RTX 4080, A4000) sería necesario cuantizar, aunque no se publican pesos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: transformers (librería declarada) y text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l2_gsmrec_swift_jbb_remove50 | 6.738.415.616 | no disponible | Llama 2 | Hugging Face (0 descargas) | Compresion SVD al 50 % + LoRA GSM8K; artefacto de investigacion |
| meta-llama/Llama-2-7b-chat-hf | ~6.740 millones | 4.096 tokens | Llama 2 | Hugging Face (ampliamente usado) | Modelo base sin comprimir; referencia directa |
| Otras variantes del proyecto svd_safety | no disponible | no disponible | Llama 2 | Hugging Face (autor Jeesup) | Distintas calibraciones y conjuntos de recuperacion |
| Modelos comprimidos por SVD de la literatura (p. ej. SVD-LLM, SliceGPT) | variable | variable | variable | variable | Metodos academicos comparables en filosofia, no en pesos publicados |

No se dispone de datos de benchmarks comparativos directos con estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que no es un asistente de propósito general y que algunas celdas del experimento están deliberadamente degradadas en seguridad o sobre-rechazan.
- Riesgo elevado de sobre-rechazo: 85,97 % en XSTest-safe y 94,59 % en OR-Bench-Hard-1k, lo que lo hace inadecuado para atención al cliente o asistentes conversacionales.
- Rendimiento muy bajo en tareas de razonamiento e instrucciones: GSM8K 5-shot 8,57 % e IFEval 8,32 %, muy por debajo del modelo base.
- La compresión SVD al 50 % puede introducir artefactos y degradar la coherencia en generaciones largas; la perplejidad en WikiText-2 (19,69) debe interpretarse en el contexto de un modelo chat comprimido.
- Sesgos: heredados de Llama 2 y potencialmente amplificados por la calibración con respuestas dañinas de JBB; no se documenta una evaluación de sesgos.
- Riesgo de alucinación: no cuantificado en la model card; el ajuste con GSM8K no garantiza fidelidad factual.
- Idiomas: no se documenta el soporte multilingüe; el modelo base está orientado al inglés.
- Licencia Llama 2 Community License: restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y cumplimiento de la política de uso aceptable).
- Fecha de creación y actualización inusualmente futura (2026) en los metadatos de Hugging Face; conviene verificar la integridad del repositorio antes de usarlo.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_gsmrec_swift_jbb_remove50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Política de uso aceptable de Llama 2: https://ai.meta.com/llama/use-policy/
- Repositorio del proyecto svd_safety: no disponible en la informacion proporcionada
- Paper de Swift-SVD: no disponible en la informacion proporcionada
- Paper de SVD-LLM (referencia metodologica): no disponible en la informacion proporcionada
