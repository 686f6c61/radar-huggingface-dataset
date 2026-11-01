# JIRU-W/dense_e1_seq2048_gbs128_10b

## Resumen

`dense_e1_seq2048_gbs128_10b` es un modelo de lenguaje de tipo denso con 575.277.056 parámetros entrenado desde cero por el usuario JIRU-W sobre 10.000 millones de tokens. Se presenta como la contraparte densa del modelo MoE `JIRU-W/e32_top8_seq2048_gbs128_10b`: comparte código de arquitectura, conjunto de datos y orden exacto de las muestras, pero cada capa tiene un único bloque feed-forward (un solo "experto") y carece de router. Su propósito declarado es servir como modelo de investigación y como punto de partida para experimentos de *upcycling* (copiar el MLP en 32 expertos para inicializar un MoE).

La arquitectura replica la de OLMoE (código de `transformers` v5.20.1 con las clases renombradas a `MaskMoe*`), con 16 capas, tamaño oculto de 2048, 16 cabezas de atención sin GQA, QK-norm y RoPE con θ=10000, feed-forward SwiGLU de tamaño intermedio 1024 y vocabulario de 50.304 tokens (tokenizador de `allenai/OLMoE-1B-7B-0924`). El modelo se distribuye con todos sus checkpoints intermedios como ramas `step<N>`, lo que lo hace útil para estudiar curvas de escalado y dinámicas de entrenamiento.

Es relevante ahora por su carácter abierto y reproducible: publica la receta completa (datos, orden de muestras, hiperparámetros, semilla) y 39 checkpoints con su cross-entropy de evaluación, algo poco habitual en modelos de este tamaño. No está ajustado con instrucciones, por lo que su uso previsto es la investigación en preentrenamiento y la experimentación con arquitecturas MoE, no el despliegue en producción como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMoE (código custom `MaskMoe*`), denso con `num_experts=1` |
| Parametros totales | 575.277.056 |
| Parametros activos | no aplica (modelo denso, sin MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bf16) |
| Idiomas soportados | no disponible (dataset mayoritariamente en inglés: DCLM 94,9 % y arXiv de Proof-Pile-2) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 16 capas, dimensión oculta 2048 y 16 cabezas de atención (sin GQA), con QK-norm y RoPE de frecuencia base 10000. El feed-forward es un SwiGLU con tamaño intermedio 1024. Aunque el código proviene de la implementación de OLMoE en `transformers` v5.20.1 (clases renombradas a `MaskMoe*`), al fijar `num_experts == 1` cada capa ejecuta un MLP SwiGLU plano: no hay router, ni despacho de tokens, ni pérdida de balanceo de carga. El vocabulario es de 50.304 tokens con el tokenizador de `allenai/OLMoE-1B-7B-0924`.

El entrenamiento consumió 10.000 millones de tokens del dataset `JIRU-W/olmoe-mix-0924-10b`, derivado de `allenai/OLMoE-mix-0924` (arXiv de `EleutherAI/proof-pile-2` y DCLM al 94,9 %). El orden de muestras es determinista: `np.random.default_rng(1234).permutation(4881809)`, idéntico al del modelo MoE. Se realizaron 38.139 pasos con batches de 128 secuencias × 2048 tokens (262.144 tokens por paso), optimizador AdamW con lr 8e-4, 200 pasos de warmup, decaimiento coseno hasta 8e-5, weight decay 0,1, precisión bf16 con acumulación de gradientes en fp32, DeepSpeed ZeRO-2 y una única GPU. No se aplicó RLHF ni DPO; es un modelo exclusivamente preentrenado. La innovación principal no es arquitectónica sino metodológica: la publicación de todos los checkpoints intermedios con su cross-entropy de evaluación permite trazar la curva de aprendizaje y reutilizar estados intermedios para *upcycling*.

## Capacidades

- Generación de texto autoregresiva a partir de un prompt (modelo base, sin ajuste de instrucciones).
- Modelado de lenguaje y continuación de documentos con contexto de hasta 2048 tokens.
- Razonamiento y conocimiento factual limitados por su escala (575 M de parámetros) y por los 10.000 millones de tokens vistos.
- No soporta tool calling ni function calling de forma nativa.
- No soporta uso como agente ni razonamiento multi-paso guiado; carece de modo *thinking*.
- Sin capacidades de visión, audio ni multimodalidad.
- Capacidades multilingües no documentadas; el corpus de entrenamiento es predominantemente inglés.
- Aporta checkpoints intermedios (`step1000` a `step38139`) utilizables para investigación y para inicializar modelos MoE.

## Casos de uso

- Investigación en preentrenamiento: reproducir la curva de cross-entropy a lo largo de 38.139 pasos usando las ramas `step<N>` para estudiar dinámicas de escalado y estabilidad del optimizador con lr 8e-4.
- Experimentos de *upcycling* a MoE: copiar el MLP de una capa en 32 expertos y comparar el comportamiento frente al modelo MoE de referencia `e32_top8_seq2048_gbs128_10b`, que comparte datos y orden de muestras.
- Estudio de tokenizadores: analizar el comportamiento del tokenizador de OLMoE (50.304 tokens) en un modelo pequeño y denso, útil para validar pipelines de tokenización antes de escalar.
- *Baseline* de comparación arquitectónica: medir la diferencia entre un modelo denso de 575 M y su contraparte MoE con el mismo presupuesto de datos, aislando el efecto del enrutamiento.
- Pruebas de infraestructura de entrenamiento: validar configuraciones de DeepSpeed ZeRO-2, precisión bf16 y acumulación de gradientes en fp32 con un modelo que cabe en una sola GPU.
- Docencia y divulgación: ilustrar el ciclo completo de preentrenamiento (datos, hiperparámetros, checkpoints, evaluación) con un modelo pequeño y una receta totalmente pública.
- Generación de texto exploratoria: continuar documentos en inglés con contexto de 2048 tokens, aceptando la calidad propia de un modelo base de 575 M sin ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta cross-entropy de evaluación sobre 256 secuencias reservadas de 2048 tokens:

| Revision | Tokens vistos | Eval CE |
|---|---|---|
| `step1000` | 0,26B | 3,8858 |
| `step5000` | 1,31B | 3,3911 |
| `step10000` | 2,62B | 3,2578 |
| `step20000` | 5,24B | 3,1220 |
| `step30000` | 7,86B | 3,0214 |
| `step38139` (final) | 10,00B | 2,9808 |

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 1,15 GB solo para pesos (575 M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 3 GB con contexto de 2048 tokens.
- VRAM en fp32: unos 2,3 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB, RTX 4070 o RTX 4090 ejecutan el modelo con holgura. Para entrenamiento o *fine-tuning* completo conviene una A100 o H100, aunque el autor entrenó con una sola GPU y DeepSpeed ZeRO-2.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con 4 GB o más de VRAM.
- Opciones de despliegue: `transformers` (requiere versión ≥ 5.20 y `trust_remote_code=True`); no se han publicado pesos en GGUF, por lo que llama.cpp u Ollama requerirían conversión previa. vLLM y TGI no están documentados para este código custom.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `JIRU-W/dense_e1_seq2048_gbs128_10b` | 575 M (denso) | 2048 | Apache 2.0 | Modelo de investigación con 39 checkpoints públicos; sin benchmarks estándar |
| `JIRU-W/e32_top8_seq2048_gbs128_10b` | no disponible en la información | 2048 | no disponible | Contraparte MoE con 32 expertos y top-8; mismos datos y orden de muestras |
| `allenai/OLMoE-1B-7B-0924` | 1,3 B activos / 6,9 B totales (MoE) | 4096 | Apache 2.0 | Origen del código y del tokenizador; modelo mucho mayor y con benchmarks publicados |

La comparación con modelos densos de tamaño similar (por ejemplo, la familia Qwen2.5-0.5B o SmolLM2-360M) no está disponible en la información proporcionada, ya que no se han publicado evaluaciones comparables para este modelo.

## Limitaciones y advertencias

- No está ajustado con instrucciones: no sigue instrucciones de forma fiable ni mantiene formatos de chat; su uso como asistente requiere *fine-tuning* previo.
- Riesgo elevado de alucinación y de errores factuales por su escala (575 M) y por un presupuesto de entrenamiento de solo 10.000 millones de tokens.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas no documentados; el corpus es mayoritariamente inglés (DCLM 94,9 % y arXiv), por lo que el rendimiento en castellano será previsiblemente bajo.
- Sesgos no evaluados: el autor no publica análisis de sesgos ni de toxicidad del dataset DCLM/arXiv.
- Requiere `trust_remote_code=True` y código custom (`MaskMoe*`), lo que implica ejecutar código del repositorio y limita la compatibilidad con herramientas estándar de despliegue.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base sin evaluación de seguridad, cualquier producto derivado debe someterse a sus propias pruebas.
- El repositorio ocupa 52,9 GB por la acumulación de checkpoints; descargar una sola revisión requiere indicar `revision="step<N>"` para evitar bajar todo el historial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JIRU-W/dense_e1_seq2048_gbs128_10b
- Modelo MoE de referencia: https://huggingface.co/JIRU-W/e32_top8_seq2048_gbs128_10b
- Dataset de entrenamiento: https://huggingface.co/datasets/JIRU-W/olmoe-mix-0924-10b
- Dataset original OLMoE-mix-0924: https://huggingface.co/datasets/allenai/OLMoE-mix-0924
- Tokenizador base: https://huggingface.co/allenai/OLMoE-1B-7B-0924
- Dataset Proof-Pile-2 (arXiv): https://huggingface.co/datasets/EleutherAI/proof-pile-2
