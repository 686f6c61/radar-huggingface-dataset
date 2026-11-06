# Jeesup/svd-safety-l3_hisvd_jbbresp13_r40

## Resumen

svd-safety-l3_hisvd_jbbresp13_r40 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct, publicado por el usuario Jeesup en Hugging Face, que ha sido comprimido mediante HiSVD (implementación propia del método de redai-infra/HiSVD) hasta conservar el 60,47 % de los parámetros densos originales, es decir, un 40 % de parámetros eliminados. Posteriormente se recuperó con la etapa 2 de LoRA de SVD-LLM (descomposición secuencial U y V, dataset alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16).

No se trata de un modelo de propósito general ni de un asistente desplegable: es un artefacto de investigación dentro de un grid experimental que estudia cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. La celda concreta corresponde a una calibración con wikitext2:256 y jbb_harm_resp:13, seqlen 2048, semilla 42, método de rango "stable", modulación logarítmica y alpha 1.0.

Su relevancia es metodológica: cuantifica el compromiso entre seguridad y utilidad bajo compresión, con métricas de tasa de éxito de ataque (ASR) medidas con el juez HarmBench y de sobre-rechazo con WildGuard, además de perplejidad en WikiText-2. El modelo conserva la arquitectura y el tamaño nominal de Llama-3-8B (8.030.261.248 parámetros declarados en safetensors), aunque internamente muchas matrices están truncadas en rango.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), con matrices comprimidas por HiSVD y recuperadas con LoRA de etapa 2 |
| Parametros totales | 8.030.261.248 (nominales en safetensors); fracción densa efectiva 0,6047 tras eliminar el 40,00 % de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama-3-8B-Instruct soporta 8.192 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp16; no se documentan GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (incluye LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 3 con 8.030 millones de parámetros nominales. Sobre esa base se aplica HiSVD, una variante de compresión por descomposición en valores singulares que selecciona qué componentes conservar según una regla de rango "stable" con modulación logarítmica y alpha 1.0. El presupuesto de compresión es del 40,00 % de parámetros eliminados, lo que deja una fracción densa de 0,6047. La calibración se realizó con wikitext2:256 y jbb_harm_resp:13 (13 respuestas dañinas de JailbreakBench), con longitud de secuencia 2048 y semilla 42.

Tras la compresión, se aplica la etapa 2 de SVD-LLM: un LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre alpaca-cleaned. No se documenta en la información disponible un proceso de RLHF o DPO adicional; la alineación de seguridad procede del modelo base y de la recuperación con LoRA. La innovación técnica destacable es el propio pipeline de compresión-recuperación y su evaluación sistemática de seguridad, no una arquitectura nueva.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, aunque degradada por la compresión y la recuperación parcial.
- Razonamiento y respuesta a instrucciones de complejidad media, sujeto a la pérdida de calidad introducida por el truncamiento de rango.
- Capacidad multilingüe presumiblemente heredada del modelo base, si bien no se documenta en la model card.
- No se documenta soporte explícito de tool calling, function calling ni modo de agente multi-paso en la información disponible.
- No se documenta soporte de visión, audio ni modo "thinking".
- El checkpoint está pensado como sujeto experimental para medir seguridad bajo compresión, no como asistente desplegable.

## Casos de uso

- Investigación sobre compresión de LLM: sirve como celda de un grid para comparar reglas de selección de componentes (rango "stable" frente a otras) y presupuestos de compresión, midiendo el efecto sobre perplejidad y seguridad.
- Evaluación de seguridad bajo compresión: permite reproducir las métricas de ASR con HarmBench (AdvBench y StrongREJECT) y de sobre-rechazo con WildGuard para estudiar cómo la compresión eleva la tasa de éxito de ataque.
- Estudio del compromiso seguridad-utilidad: al disponer de perplejidad en WikiText-2 (16,6785) y métricas de rechazo, se puede trazar la frontera entre utilidad y alineación en distintos puntos del grid.
- Reproducción de pipelines SVD-LLM: el checkpoint y su receta (LoRA secuencial U/V, alpaca-cleaned, r=8) permiten validar implementaciones de HiSVD y de la etapa 2 de recuperación.
- Análisis de interpretabilidad: al ser una compresión basada en valores singulares, facilita estudiar qué direcciones del espacio de pesos están asociadas a comportamientos de rechazo o de obediencia dañina.
- Referencia negativa en auditorías: útil como ejemplo controlado de modelo deliberadamente degradado en seguridad para calibrar jueces automáticos y herramientas de red-teaming.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0654 |
| StrongREJECT ASR (juez HarmBench) | 0,1150 |
| Macro over-refusal (WildGuard) | 0,2011 |
| Perplejidad WikiText-2 | 16,6785 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros checkpoints del grid.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos, más overhead de activaciones y caché KV; con 8.030 millones de parámetros nominales, el checkpoint no reduce el tamaño en disco de forma proporcional a la fracción densa si las matrices se almacenan a tamaño completo.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente; RTX 4090 (24 GB) para inferencia en bf16 de una sola instancia; RTX 3090 (24 GB) como alternativa.
- En GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; en tarjetas de 16 GB requeriría cuantización a 8 bits, no documentada para este checkpoint.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible) y, en principio, vLLM o llama.cpp si se generan pesos compatibles, aunque no se documenta conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_hisvd_jbbresp13_r40 | 8.030 M nominales (60,47 % denso) | no disponible | Llama 3 Community | Checkpoint de investigación con seguridad degradada |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir, referencia de utilidad y seguridad |
| Otras celdas del grid SVD-safety | 8.030 M nominales con distintas fracciones densas | no disponible | Llama 3 Community | Variantes con otras reglas de selección y presupuestos; no se detallan en la información disponible |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas del grid están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; la compresión por sí sola eleva la tasa de éxito de ataque.
- No es un asistente desplegable: debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Riesgo de alucinación y de pérdida de calidad general por el truncamiento de rango y la recuperación parcial con LoRA.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Longitud de contexto no confirmada para este checkpoint.
- Uso comercial sujeto a la Llama 3 Community License y al USE_POLICY.md incluidos en el repositorio; es imprescindible revisarlos antes de cualquier despliegue.
- No se documentan cuantizaciones ni conversiones a GGUF, lo que limita el despliegue en entornos de bajos recursos.
- Ausencia de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan situar su calidad general frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_hisvd_jbbresp13_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- HiSVD (referencia): https://github.com/redai-infra/HiSVD
- SVD-LLM (referencia de la etapa 2 LoRA): no disponible en la información proporcionada
- HarmBench: no disponible en la información proporcionada
- WildGuard: no disponible en la información proporcionada
- JailbreakBench: no disponible en la información proporcionada
