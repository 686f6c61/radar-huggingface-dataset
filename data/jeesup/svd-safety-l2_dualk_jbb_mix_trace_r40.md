# Jeesup/svd-safety-l2_dualk_jbb_mix_trace_r40

## Resumen

`svd-safety-l2_dualk_jbb_mix_trace_r40` es un checkpoint experimental derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup en HuggingFace. No se trata de un modelo conversacional de propósito general, sino de un artefacto de investigación sobre compresión de modelos mediante SVD y su impacto en el comportamiento de seguridad. El checkpoint aplica una compresión de dominio dual con curvatura K-FAC blanqueada (utilidad y seguridad) y un presupuesto de rango heredado de SVD-LLM, eliminando el 40,00 % de los parámetros densos y quedándose en una fracción de 0,5998 respecto al modelo original.

Tras la compresión, el autor aplica una recuperación de segunda etapa con LoRA secuencial (U y luego V) sobre `alpaca-cleaned`, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64 y cutoff 256 en bf16. El resultado es una celda concreta dentro de una malla de reglas de selección de componentes y presupuestos de rango, diseñada para medir cómo la compresión SVD degrada la seguridad y qué regla de selección la repara mejor.

Su relevancia es metodológica: proporciona métricas de tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT, sobre-rechazo macro medido con WildGuard y perplejidad en WikiText-2, lo que permite cuantificar el compromiso entre utilidad y alineación bajo compresión. El propio autor advierte que varias celdas de la malla están deliberadamente degradadas en seguridad y que este checkpoint no debe desplegarse como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante SVD blanqueada con K-FAC de dominio dual |
| Parametros totales | 6.738.415.616 (fracción 0,5998 respecto al denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only de Llama 2 con 7B parámetros. La compresión se realiza con una SVD blanqueada de dominio dual: se construye una matriz de curvatura K-FAC mixta `F_mix = [(1-a) G_u + a G_s] ⊗ [(1-a) A_u + a A_s]`, donde `G_u`/`A_u` son las curvaturas de utilidad y `G_s`/`A_s` las de seguridad, con un peso de seguridad `a = 0.0485` (`--alpha tok`). La normalización de curvatura es por traza (`trace`): las matrices A se dividen por posiciones y las G por tokens de pérdida (entropía cruzada sumada) por dominio, y después cada factor se divide por su traza. El solver es la SVD blanqueada en forma cerrada sobre la matriz mixta única, con el presupuesto de rango por matriz que SVD-LLM asigna al mismo ratio de eliminación (40,00 % de parámetros eliminados). La semilla es 42.

Los datos de calibración son distintos para cada dominio: para utilidad se usa `wikitext-2-raw-v1` (split train) con el muestreador de SVD-LLM, 255 ventanas de 2048 tokens, semilla 42 y entropía cruzada de siguiente token; para seguridad se usa `jbb_harm_resp:13` (13 muestras, pérdida en todas las posiciones). Tras la compresión, la recuperación se hace con LoRA de segunda etapa de SVD-LLM, aplicando secuencialmente U y luego V sobre `alpaca-cleaned`, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. No se documenta RLHF ni DPO adicionales en la información proporcionada.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones básicas, condicionados por el ajuste LoRA sobre `alpaca-cleaned`.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada (el modelo base Llama 2 está entrenado mayoritariamente en inglés).
- No se documenta modo thinking, visión ni audio.
- Capacidad de interés científico: servir como sujeto experimental para medir el efecto de la compresión SVD sobre la alineación de seguridad.

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como celda de control en una malla de reglas de selección de componentes y presupuestos de rango, comparando ASR y perplejidad frente a otras celdas con distintos valores de `a`, normalización o solver.
- Estudio del compromiso seguridad-utilidad: medir cómo varía la tasa de éxito de ataque en AdvBench y StrongREJECT al reducir parámetros, manteniendo fija la calibración de utilidad en WikiText-2.
- Evaluación de reglas de reparación post-compresión: comparar la recuperación LoRA de SVD-LLM (r=8, alpha=16, 2 épocas) con otras estrategias de recuperación sobre el mismo checkpoint comprimido.
- Análisis de sobre-rechazo: emplear la métrica macro de WildGuard (0,5136) para estudiar si la compresión incrementa los rechazos innecesarios en consultas benignas.
- Reproducibilidad de pipelines de compresión: el repositorio documenta semilla, solver, calibración y hiperparámetros de LoRA, lo que permite reproducir la celda exacta y auditar el procedimiento.
- Docencia e interpretabilidad: ilustrar en un curso o artículo cómo la curvatura K-FAC de dominio dual pondera utilidad y seguridad, y cómo se materializa en una eliminación del 40 % de parámetros.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0038 |
| StrongREJECT ASR (juez HarmBench) | 0,0192 |
| Macro over-refusal (WildGuard) | 0,5136 |
| Perplejidad WikiText-2 | 9,9009 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas directas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 15 y 18 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB de pesos; en 4 bits, en torno a 4-5 GB (no documentado por el autor, estimación a partir del número de parámetros).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para bf16 con batches moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto y batch limitados; en GPUs de 12-16 GB requiere cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados por el autor y requerirían conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_dualk_jbb_mix_trace_r40 | 6,74 B (0,5998 del denso) | no disponible | Llama 2 Community | Checkpoint experimental comprimido, ASR AdvBench 0,0038, PPL WikiText-2 9,9009 |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4096 tokens | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| SVD-LLM (checkpoints comprimidos) | variable según ratio | heredado del base | según modelo base | Método de compresión con presupuesto de rango y recuperación LoRA en dos etapas |
| Otros checkpoints de la malla de Jeesup | variable | no disponible | Llama 2 Community | Distintas reglas de selección, valores de `a` y presupuestos; varias celdas deliberadamente degradadas en seguridad |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada para establecer una comparación numérica directa.

## Limitaciones y advertencias

- El autor declara explícitamente que este checkpoint no es un modelo conversacional de propósito general y que debe tratarse como sujeto experimental.
- Varias celdas de la malla están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataque, y este checkpoint concreto forma parte de ese estudio.
- Riesgo de alucinación no cuantificado en la información disponible; la perplejidad en WikiText-2 (9,9009) es un indicador de modelado de lenguaje, no de veracidad factual.
- Sesgos conocidos: no documentados específicamente para este checkpoint; hereda los del modelo base Llama-2-7b-chat y los del corpus de recuperación `alpaca-cleaned`.
- Limitaciones de idioma: no se documentan idiomas soportados; el modelo base está entrenado mayoritariamente en inglés.
- Limitaciones de contexto: no se documenta la longitud de contexto efectiva tras la compresión; el modelo base soporta 4096 tokens.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a las restricciones de la política de uso aceptable.
- Caveat para producción: no debe desplegarse como asistente sin una evaluación propia y exhaustiva de seguridad y utilidad; las métricas publicadas corresponden a un entorno de evaluación concreto (juez HarmBench, WildGuard) y pueden no transferirse a otros dominios.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_dualk_jbb_mix_trace_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- SVD-LLM (método de compresión y recuperación LoRA): no disponible en la información proporcionada
- AdvBench: no disponible en la información proporcionada
- StrongREJECT: no disponible en la información proporcionada
- HarmBench: no disponible en la información proporcionada
- WildGuard: no disponible en la información proporcionada
- Dataset de calibración de utilidad `wikitext-2-raw-v1`: no disponible en la información proporcionada
- Dataset de recuperación `alpaca-cleaned`: no disponible en la información proporcionada
