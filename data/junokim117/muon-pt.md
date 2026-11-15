# junokim117/muon-PT

## Resumen

muon-PT es un modelo de lenguaje de tipo transformer decoder-only con arquitectura Qwen2.5-0.5B, desarrollado por el usuario junokim117 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo preentrenado desde cero (no un fine-tuning) sobre 200.000 millones de tokens del corpus DCLM-Baseline, con un contexto de 4.096 tokens y embeddings atados (tied embeddings). El nombre hace referencia al uso del optimizador Muon para las matrices del transformer, combinado con AdamW para el resto de parámetros.

El modelo forma parte de una reproducción del artículo *Data Schedules and Learning Rate Schedules Should Be Designed Together* (arXiv 2610.29348), entrenado con Megatron-LM y convertido posteriormente mediante los mapeos Qwen2 de Megatron-Bridge. Su relevancia es fundamentalmente experimental: sirve como artefacto reproducible para estudiar el efecto de optimizadores alternativos (Muon) y de los schedules de datos y de learning rate en el preentrenamiento a escala media.

Con 494 millones de parámetros, un repositorio de 1 GB y cero descargas en el momento de la consulta, muon-PT es un modelo de investigación más que un candidato para producción. No se han publicado datos de benchmarks estándar (MMLU, HumanEval, GSM8K) ni información sobre idiomas soportados, por lo que su evaluación debe basarse en las pérdidas de validación reportadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (forma Qwen2.5-0.5B), embeddings atados |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no verificada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue la forma del Qwen2.5-0.5B: un transformer decoder-only con embeddings de entrada y salida atados, contexto de 4.096 tokens y el stack de capas estándar de la familia Qwen2. El entrenamiento se realizó desde cero con Megatron-LM sobre 200.000 millones de tokens del dataset DCLM-Baseline, en 95.368 pasos con un batch efectivo de 512 secuencias × 4.096 tokens. La innovación técnica principal es el uso del optimizador Muon para las matrices del transformer, reservando AdamW para los parámetros restantes (embeddings, biases, normalizaciones y capas de salida). Este esquema híbrido de optimización es el objeto de estudio del artículo que el modelo reproduce.

El autor reporta pérdidas de validación completas de 2,8162 sobre DCLM y 2,1709 sobre FineMath al final del entrenamiento. No se especifica si hubo fases de instrucción, RLHF o DPO; el sufijo "PT" y la ausencia de datos al respecto sugieren que se trata de un modelo exclusivamente preentrenado. La conversión a formato Hugging Face se realizó con los mapeos Qwen2 de Megatron-Bridge, lo que garantiza compatibilidad con la clase `Qwen2ForCausalLM` de transformers.

## Capacidades

- Generación de texto autoregresiva en modo continuación (modelo base, sin ajuste instructivo).
- Razonamiento y conocimiento factual limitados al corpus DCLM-Baseline; no se han publicado evaluaciones específicas.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso entrenado.
- Capacidades multilingües no documentadas; el corpus DCLM-Baseline es predominantemente inglés.
- Sin modo thinking, visión, audio ni otras modalidades.
- Compatible con `text-generation-inference` y `endpoints_compatible` según los tags del repositorio.

## Casos de uso

- Reproducción de experimentos de optimización: el modelo permite replicar el entrenamiento con Muon + AdamW y comparar schedules de datos y learning rate, dado que el autor documenta pasos, batch y pérdidas finales.
- Investigación sobre optimizadores alternativos: sirve como punto de partida para estudiar la estabilidad y convergencia de Muon en modelos de ~500M parámetros frente a AdamW puro.
- Baseline de preentrenamiento a escala media: útil para comparar pérdidas en DCLM y FineMath con otros modelos de tamaño similar entrenados con distintos schedules.
- Fine-tuning supervisado posterior: al ser un modelo base con licencia Apache 2.0, puede ajustarse para tareas concretas (clasificación, extracción, generación de dominio) partiendo de un checkpoint preentrenado reproducible.
- Evaluación de la conversión Megatron-Bridge: sirve para validar los mapeos Qwen2 y comprobar la equivalencia entre el checkpoint Megatron y el de transformers.
- Docencia y experimentación con hardware modesto: con 494M parámetros, cabe en GPUs de consumo para inferencia y en configuraciones multi-GPU pequeñas para fine-tuning con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pérdidas de validación:

| Metrica | Valor |
|---|---|
| Pérdida de validación completa en DCLM | 2,8162 |
| Pérdida de validación completa en FineMath | 2,1709 |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1 GB para los pesos (494M parámetros × 2 bytes) más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: ~0,5 GB; en 4 bits: ~0,25 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en precisión completa; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU moderna con ≥4 GB.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp probablemente compatibles al seguir la arquitectura Qwen2, aunque no está verificado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| muon-PT | 494M | 4.096 | Apache 2.0 | Hugging Face (0 descargas) | Preentrenado desde cero con Muon + AdamW |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base de referencia con el que comparte forma; contexto 8× mayor |
| SmolLM2-360M | 362M | 8.192 | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con datos y benchmarks publicados |
| TinyLlama-1.1B | 1.1B | 2.048 | Apache 2.0 | Hugging Face | Mayor tamaño, contexto menor, benchmarks publicados |

La comparación con Qwen2.5-0.5B es la más directa por compartir arquitectura, pero muon-PT usa un contexto 8 veces menor y no dispone de evaluaciones comparables. SmolLM2-360M y TinyLlama-1.1B son alternativas con documentación de rendimiento más completa.

## Limitaciones y advertencias

- Modelo exclusivamente preentrenado: no sigue instrucciones ni mantiene diálogos de forma fiable sin fine-tuning posterior.
- Sesgos desconocidos: no se ha documentado ningún análisis de sesgo; el corpus DCLM-Baseline puede introducir sesgos de género, raza y geografía.
- Riesgo de alucinación alto en uso directo, al no haber pasado por alineación (RLHF/DPO).
- Contexto limitado a 4.096 tokens, inferior al de modelos contemporáneos de tamaño similar.
- Idiomas no documentados; probable sesgo hacia el inglés por la composición del corpus.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de evaluación de seguridad desaconseja su uso en producción sin validación propia.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación independiente.
- El artículo de referencia (arXiv 2610.29348) y los detalles de la reproducción deben consultarse en la fuente original; la model card es muy breve.

## Enlaces

- Hugging Face: https://huggingface.co/junokim117/muon-PT
- Paper de referencia: *Data Schedules and Learning Rate Schedules Should Be Designed Together* (arXiv 2610.29348)
- Megatron-LM: https://github.com/NVIDIA/Megatron-LM
- Megatron-Bridge: https://github.com/NVIDIA/Megatron-Bridge
- DCLM-Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
