# Jeesup/svd-safety-l2_dualk_dual_tok_a0132_r40

## Resumen

`svd-safety-l2_dualk_dual_tok_a0132_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD con criterio dual (utilidad y seguridad) para eliminar el 40 % de los parámetros densos, quedándose en un 59,98 % del total. El autor, Jeesup, lo publica como una celda más de una malla experimental que estudia cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. No es un modelo conversacional de propósito general, sino un artefacto de medida.

La compresión se realiza mediante SVD blanqueada por K-FAC en dos dominios: una curvatura de utilidad (calibrada con wikitext-2) y una curvatura de seguridad (calibrada con un conjunto de 512 muestras de respuestas). Ambas se combinan con un peso `alpha = 0.132` a favor de la seguridad, y el rango por matriz se fija con el presupuesto de SVD-LLM para la misma ratio de eliminación. Posteriormente se aplica una recuperación LoRA en dos etapas (U y luego V) sobre alpaca-cleaned.

El interés del checkpoint es metodológico: permite cuantificar el compromiso entre utilidad (perplejidad en WikiText-2 de 9,9089) y seguridad (ASR de 0,0096 en AdvBench y 0,0479 en StrongREJECT según el juez HarmBench) bajo una configuración concreta de compresión. Su relevancia radica en que aísla el efecto de la regla de selección de componentes sobre la alineación de seguridad, un aspecto poco explorado en la literatura de compresión de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante SVD con presupuesto de rango por matriz |
| Parametros totales | 6.738.415.616 (59,98 % del denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2-7b-chat: 4096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors (bf16 presumiblemente) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (repo de 13,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder-only con 32 capas, atención multi-cabeza y RoPE. Sobre esa base se aplica una descomposición SVD por matriz con un solver dual que optimiza `F_dual = (1-a) G_u ⊗ A_u + a G_s ⊗ A_s`, donde `G_u`/`A_u` son las matrices de K-FAC del dominio de utilidad y `G_s`/`A_s` las del dominio de seguridad. El peso de seguridad es `a = 0.1320`. La normalización de curvatura es `tok`: `A` dividida por posiciones y `G` dividida por tokens de pérdida (entropía cruzada sumada), por dominio. El presupuesto de rango por matriz sigue la regla de SVD-LLM para la misma ratio de eliminación (40 %).

La calibración de utilidad usa wikitext-2-raw-v1 con el muestreador de SVD-LLM (255 ventanas de 2048 tokens, semilla 42, pérdida de entropía cruzada de siguiente token). La calibración de seguridad usa `results/dual_kfac_wj/wj_safe_l2.jsonl` (512 muestras, pérdida sobre tokens de respuesta). El solver ALS conjunto arranca desde la solución mixta, con hasta 300 barridos, `rtol 1e-07` y `ridge 1e-06`. Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con `r=8`, `alpha=16`, 2 épocas, `lr 1e-4`, batch 64, cutoff 256 y bf16, entrenado sobre alpaca-cleaned.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat, aunque degradada por la compresión y la recuperación LoRA limitada.
- Razonamiento y respuesta a instrucciones en inglés (idioma de alpaca-cleaned y de los calibradores), con calidad no verificada más allá de las métricas reportadas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas; el calibrador y el dataset de recuperación son en inglés.
- No dispone de modo thinking, visión ni audio.
- El checkpoint está pensado como sujeto experimental para medir seguridad bajo compresión, no como asistente desplegable.

## Casos de uso

- Estudio de degradación de seguridad por compresión: comparar el ASR de este checkpoint (0,0096 en AdvBench, 0,0479 en StrongREJECT) con el del modelo denso y con otras celdas de la malla para aislar el efecto de la regla de selección dual frente a reglas solo de utilidad.
- Investigación en compresión SVD: usar la configuración `alpha=0.132`, normalización `tok` y presupuesto SVD-LLM como punto de referencia reproducible (semilla 42) para experimentos de eliminación de rango con criterio multi-dominio.
- Análisis de compromiso utilidad-seguridad: la perplejidad de 9,9089 en WikiText-2 junto con las métricas de rechazo permiten trazar curvas de Pareto entre calidad lingüística y alineación.
- Evaluación de sobre-rechazo: el 0,3961 de macro over-refusal medido con WildGuard sirve para estudiar cómo la compresión y la recuperación LoRA afectan a la tasa de rechazos innecesarios en un modelo alineado.
- Reproducción de pipelines de recuperación LoRA post-SVD: el esquema secuencial U→V con `r=8` sobre alpaca-cleaned es reutilizable como receta para otros checkpoints comprimidos.
- Docencia y divulgación sobre interpretabilidad y compresión: el checkpoint ilustra de forma concreta cómo una intervención de bajo rango cambia el comportamiento de seguridad de un modelo de 7B.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0096 |
| StrongREJECT ASR (juez HarmBench) | 0,0479 |
| Macro over-refusal (WildGuard) | 0,3961 |
| Perplejidad WikiText-2 | 9,9089 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con el modelo denso u otras celdas de la malla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 13,5 GB de pesos, más overhead de activaciones y caché KV; con contexto de 4096 tokens y batch pequeño, aproximadamente 15-17 GB.
- En cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 3,5-4 GB (estimaciones, no verificadas en la información disponible).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para bf16 con batch alto; RTX 4090 (24 GB) para bf16 con batch moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 y en GPUs de 8-12 GB con cuantización 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags; vLLM, llama.cpp y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_dualk_dual_tok_a0132_r40 | 6,74B (59,98 % del denso) | no disponible | Llama 2 Community | Checkpoint de investigación comprimido, ASR 0,0096 / 0,0479, PPL 9,9089 |
| meta-llama/Llama-2-7b-chat-hf | 6,74B | 4096 | Llama 2 Community | Modelo denso de referencia; métricas de seguridad y PPL no incluidas en la información disponible |
| Otras celdas de la malla del autor | ~6,74B | no disponible | Llama 2 Community | Variantes con distintas reglas de selección y presupuestos; no disponibles en la información proporcionada |

No se dispone de comparaciones numéricas con alternativas de compresión como SVD-LLM original, SliceGPT o LLM-Pruner en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como artefacto de investigación y sujeto experimental, no como asistente desplegable.
- Varias celdas de la malla están deliberadamente degradadas en seguridad; este checkpoint concreto reporta ASR bajo, pero debe evaluarse de forma independiente antes de extraer conclusiones.
- La compresión SVD eleva por sí misma la tasa de éxito de ataques; la recuperación LoRA mitiga pero no garantiza paridad con el modelo denso.
- El macro over-refusal de 0,3961 indica una tasa considerable de rechazos innecesarios en consultas benignas.
- Sesgos: no documentados; hereda los de Llama-2-7b-chat y los de alpaca-cleaned.
- Riesgo de alucinación: no cuantificado; la recuperación LoRA sobre alpaca-cleaned con 2 épocas y cutoff 256 puede introducir artefactos.
- Limitaciones de idioma: el calibrador y el dataset de recuperación son en inglés; el rendimiento en castellano no está verificado.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a las obligaciones de atribución ("Built with Llama 2").
- No hay datos publicados de cuantización, latencia ni throughput, lo que dificulta planificar un despliegue en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_dualk_dual_tok_a0132_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- SVD-LLM (paper de referencia citado en la model card): no disponible en la información proporcionada
- HarmBench (juez de evaluación): no disponible en la información proporcionada
- WildGuard (evaluación de rechazo): no disponible en la información proporcionada
- StrongREJECT: no disponible en la información proporcionada
- AdvBench: no disponible en la información proporcionada
