# kwanhee/Kimi-K2.5-REAP-E312-P48NVFP4-MoESQ

## Resumen

Kimi-K2.5-REAP-E312-P48NVFP4-MoESQ es un checkpoint derivado de `moonshotai/Kimi-K2.5` publicado por el usuario kwanhee. Se trata de un experimento de investigación, no de un modelo entrenado desde cero: parte de una versión ya cuantizada del modelo base (la variante MoE-SQ de ISTA-DASLab) y le aplica una poda de expertos mediante REAP, eliminando 72 de los 384 expertos enrutados por capa y conservando los 312 restantes con su almacenamiento disperso original en NVFP4.

El resultado es un modelo de mezcla de expertos (MoE) de aproximadamente 527.400 millones de parámetros totales, con un presupuesto efectivo de 2,234 bits por peso de experto enrutado (contabilizando pesos, escalas y metadatos sobre los 384 expertos originales). El checkpoint se publica como comparación de presupuesto de bits equiparable frente a MoE-SQ, en el marco del artículo arXiv 2610.02241 sobre cuantización y dispersión conjunta para MoE a escala de billones de parámetros.

Su relevancia es metodológica: permite a investigadores reproducir y auditar si la poda de expertos (REAP) o la cuantización dispersa nativa de hardware (MoE-SQ) es una estrategia más eficiente para reducir el coste de servir modelos MoE masivos. No es un modelo pensado para producción directa: la card advierte de que las rutas multimodales no están probadas y que todas las evaluaciones son solo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención y capas densas en bf16; expertos enrutados en NVFP4 con almacenamiento disperso paired-4:8 |
| Parametros totales | 527.432.629.008 (~527,4 mil millones) |
| Parametros activos | no disponible (el enrutamiento top-8 se mantiene, pero no se publica el recuento de activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 con escalas por bloque) para expertos enrutados; bf16 para atención, shared expert, primera capa densa, router, embeddings, lm_head y torre de visión |
| Idiomas soportados | no disponible |
| Licencia | Modified MIT (etiqueta `modified-mit`, campo `license: other`) |
| Formato de pesos | safetensors con `compressed-tensors`; requiere `custom_code` |
| Expertos enrutados | 312 de 384 por capa (72 podados) |
| Bits por peso de experto enrutado | 2,234 (contra los 384 expertos originales) |
| Tamano del repo | 307,8 GB |

## Arquitectura y entrenamiento

La arquitectura es la del Kimi-K2.5 original: un transformer de mezcla de expertos con enrutamiento top-8 por token, una torre de visión multimodal, un shared expert, una primera capa densa y un router con bias de corrección de puntuaciones. Sobre esa base, este checkpoint aplica dos transformaciones en cadena. Primero, la cuantización MoE-SQ de ISTA-DASLab (`ISTA-DASLab/Kimi-K2.5-P48NVFP4-MoESQ`), que almacena los pesos de los expertos en NVFP4 con un patrón disperso paired-4:8. Segundo, una poda REAP que elimina 72 expertos por capa y renumera los tensores conservados copiándolos byte a byte, sin recomprimir.

Un detalle técnico importante que señala la propia card: al no recomprimir, la compresión MoE-SQ nunca vio el modelo podado, de modo que las escalas y metadatos corresponden a la distribución de pesos del modelo de 384 expertos. El proceso de poda se hizo con `REAPPruningModifier` de llm-compressor 0.13.0, calibración `mixed` y 512 muestras de 4096 tokens; los índices conservados están en `reap_kept_experts.jsonl`. La etapa 1 y el slicing se ejecutaron en 8 GPU NVIDIA B300 (SM103). No hay información sobre el número de tokens de entrenamiento del modelo base ni sobre etapas de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del Kimi-K2.5 base, aunque sin datos de evaluación publicados para este checkpoint concreto.
- Procesamiento multimodal: la torre de visión se conserva en bf16, pero la card indica que las rutas multimodales no están probadas y que todas las evaluaciones realizadas son solo de texto.
- Tool calling y function calling: no disponible explícitamente en la información proporcionada; depende del modelo base.
- Razonamiento multi-paso y uso como agente: no verificado en este checkpoint.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.
- Extracción de características: es el pipeline declarado en el Hub (`feature-extraction`), aunque el uso previsto real es la generación con vLLM parcheado.

## Casos de uso

- Investigación en compresión de MoE: servir el checkpoint con vLLM v0.30.0 y el parche MoE-SQ (`IST-DASLab/MoESQ`, `integrations/vllm/install.sh`) para medir latencia, throughput y calidad frente al modelo de 384 expertos con el mismo presupuesto de bits.
- Reproducibilidad de experimentos de poda: usar `reap_kept_experts.jsonl` para replicar la selección de expertos y comparar estrategias de poda alternativas sobre el mismo checkpoint base.
- Estudio de degradación por poda: evaluar tareas de texto (razonamiento, código, matemáticas) comparando este checkpoint con `ISTA-DASLab/Kimi-K2.5-P48NVFP4-MoESQ` para aislar el efecto de eliminar 72 expertos por capa.
- Benchmarking de hardware Blackwell: al haberse generado en B300 (SM103), sirve para validar kernels NVFP4 y almacenamiento disperso paired-4:8 en esa generación de GPU.
- Análisis de escalas y metadatos: al no recomprimirse tras la poda, el checkpoint es útil para estudiar cómo se comportan las escalas calibradas sobre 384 expertos cuando solo se conservan 312.
- Docencia e investigación académica: material para cursos o papers sobre cuantización de precisión ultra-baja en modelos de billones de parámetros, dado que el repo incluye los índices y la metodología descrita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 307,8 GB en safetensors; se necesita al menos esa cantidad de memoria agregada, más overhead de activaciones y KV cache. No se proporciona una cifra exacta de VRAM por GPU.
- GPU recomendadas: NVIDIA B300 (SM103), que es el hardware usado para el slicing y para el que se validó el stack. No hay confirmación de funcionamiento en A100, H100 ni RTX 4090.
- Cabe en consumer GPU: no. Con ~308 GB de pesos en NVFP4, excede cualquier GPU de consumo actual.
- Opciones de despliegue: vLLM v0.30.0 con el parche MoE-SQ de `IST-DASLab/MoESQ` (`integrations/vllm/install.sh`). No se mencionan llama.cpp, Ollama ni TGI, y el uso de `custom_code` y `compressed-tensors` hace improbable su soporte en esos stacks sin trabajo adicional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kimi-K2.5-REAP-E312-P48NVFP4-MoESQ (este) | ~527,4 mil M | 312/384 | NVFP4 paired-4:8, 2,234 bits/peso experto | no disponible | Modified MIT | Hugging Face, requiere parche vLLM |
| ISTA-DASLab/Kimi-K2.5-P48NVFP4-MoESQ | no disponible | 384/384 | NVFP4 paired-4:8 (MoE-SQ) | no disponible | no disponible | Hugging Face |
| moonshotai/Kimi-K2.5 (base) | no disponible | 384/384 | bf16 (original) | no disponible | Modified MIT | Hugging Face |

La comparación directa de rendimiento entre estos tres checkpoints no está publicada en la información disponible.

## Limitaciones y advertencias

- Checkpoint de investigación: es un "rebuttal checkpoint" para un artículo, no una release estable ni validada para producción.
- Multimodal no probado: la torre de visión se conserva, pero las rutas de imagen no han sido testeadas y las evaluaciones son solo de texto.
- Escalas desalineadas: la cuantización MoE-SQ se calibró sobre 384 expertos y no se recompuso tras la poda, por lo que las escalas y metadatos pueden no ser óptimas para los 312 expertos conservados.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares para este checkpoint, lo que impide cuantificar la pérdida de calidad frente al modelo completo.
- Dependencia de un stack muy específico: requiere vLLM v0.30.0 con el parche de IST-DASLab; no hay soporte documentado en llama.cpp, Ollama o TGI.
- Requisitos de hardware extremos: ~308 GB de pesos implican despliegues multi-GPU de gama alta (B300 validado); no cabe en GPU de consumo.
- Idiomas no documentados: no se especifica la cobertura lingüística de este checkpoint.
- Licencia: Modified MIT con obligaciones de atribución; hay que revisar `LICENSE` y `THIRD_PARTY_NOTICES.md` antes de cualquier uso comercial, y respetar los avisos del modelo base de Moonshot AI y la atribución a Cerebras Research por REAP.
- Riesgo de alucinación y sesgos: no evaluado en este checkpoint; se heredan los del modelo base, sin datos específicos disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/kwanhee/Kimi-K2.5-REAP-E312-P48NVFP4-MoESQ
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.5
- Checkpoint MoE-SQ de origen: https://huggingface.co/ISTA-DASLab/Kimi-K2.5-P48NVFP4-MoESQ
- Repositorio del parche vLLM MoE-SQ: https://github.com/IST-DASLab/MoESQ
- Artículo MoE-SQ: arXiv 2610.02241 (Hardware-Native Joint Sparse-Quantization for Trillion-Scale Mixture-of-Experts)
- llm-compressor (implementación de `REAPPruningModifier`): https://github.com/vllm-project/llm-compressor
