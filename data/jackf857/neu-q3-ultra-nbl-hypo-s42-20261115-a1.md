# jackf857/neu-q3-ultra-nbl-hypo-s42-20261115-a1

## Resumen

`neu-q3-ultra-nbl-hypo-s42-20261115-a1` es un checkpoint experimental de investigación publicado por el usuario `jackf857` en Hugging Face. Se trata de un ajuste fino del modelo base `jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128`, que a su vez es un Qwen3 de 8B parámetros afinado previamente con SFT sobre UltraChat. El paso final aplica una variante de optimización por preferencias denominada Hybrid-DPO (HyPO), entrenada sobre el dataset `HuggingFaceH4/ultrafeedback_binarized`.

El modelo resuelve, en el plano metodológico, la pregunta de cómo modifica Hybrid-DPO el margen de referencia mediante su mecanismo de clipping, con un beta fijo de 0.01 y sin controlador LSC. No se trata de un modelo pensado para producción: el autor lo describe explícitamente como un checkpoint de comparación para investigación, entrenado con una única semilla y sin evaluación durante el entrenamiento.

Arquitectura Qwen3ForCausalLM con 36 capas, 8.190.735.360 parámetros totales y pesos en safetensors sin cuantizar (32,8 GB de repositorio). El contexto máximo de entrenamiento fue de 2048 tokens (1800 para prompt). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only, 36 capas) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (max sequence de entrenamiento); contexto nativo del base no disponible |
| Tipos de cuantizacion | pesos publicados sin cuantizar (float32 serializado); no se declaran GGUF ni otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint SFT `jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128` (revision `f55660f8575d309f4c9d6d81bb21107299c14011`), que actúa simultáneamente como inicialización de la política y como referencia congelada. Sobre esa base se aplica Hybrid-DPO, una variante de DPO que modifica el margen de referencia mediante clipping, con `im_enable=True`, `im_gamma=0.0`, `im_tau=0.1` y beta fijo de 0.01. No hay controlador LSC en esta ejecución.

El dataset de preferencias es `HuggingFaceH4/ultrafeedback_binarized` (revision `3949bf5f8c17c394422ccfab0c31ea9c20bdeb85`), split `train_prefs`, con 61.135 pares disponibles. El entrenamiento se ejecutó en 4 × NVIDIA H200 (Northeastern Explorer), con semilla 42, optimizador adamw_torch, learning rate 5e-07, schedule cosine con warmup ratio 0.1, batch efectivo de 128 pares (4 por GPU × 4 GPUs × 8 acumulación), 477 pasos de optimizador (epoch 0.9989), clipping de gradiente 1.0, weight decay 0.0, precisión bfloat16 y atención sdpa. La evaluación durante el entrenamiento está deshabilitada.

Los diagnósticos registrados incluyen una training loss reportada de 9.405033508436734, runtime de 8656,3024 segundos y 0.055 pasos/segundo. El autor advierte que estas métricas son los valores exactos de `train_results.json` y que las convenciones de logging y acumulación forman parte de la implementación: no constituyen una puntuación AlpacaEval ni una garantía de calidad. El snapshot es model-only (sin estado de optimizador, scheduler ni RNG), guardado cada 100 pasos con límite de retención 2 y checkpoints retenidos [400, 477].

## Capacidades

- Generación de texto conversacional: hereda la capacidad del checkpoint SFT sobre UltraChat, orientada a diálogo multi-turno.
- Optimización de preferencias: el ajuste Hybrid-DPO busca alinear las respuestas hacia las elegidas en UltraFeedback, aunque sin evaluación que lo confirme.
- Razonamiento y código: capacidades heredadas de la base Qwen3, no verificadas ni documentadas en esta ficha.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no disponibles (los idiomas no están declarados).
- Capacidades especiales (thinking mode, vision, audio): no documentadas.

## Casos de uso

- Comparación metodológica de Hybrid-DPO frente a DPO estándar: el checkpoint permite reproducir y contrastar el efecto del clipping de margen con beta fijo, usando la revisión inmutable del modelo y su tokenizer archivado.
- Investigación sobre optimización por preferencias: sirve como punto de partida para estudiar cómo `im_gamma` e `im_tau` afectan la dinámica de entrenamiento en un modelo de 8B.
- Reproducción de experimentos con semilla fija: la semilla 42, los hashes de configuración y packet, y los logs archivados en `training_logs/` permiten auditar la ejecución.
- Estudio de sensibilidad a hiperparámetros: el beta fijo de 0.01 y la ausencia de controlador LSC lo convierten en una línea base controlada para aislar variables.
- Evaluación de robustez de checkpoints SFT: al partir de un SFT conocido sobre UltraChat, permite medir la deriva de comportamiento introducida por la fase de preferencias.
- Docencia y formación: útil para ilustrar el pipeline alignment-handbook con datasets binarizados y configuraciones registradas paso a paso.

## Benchmarks y rendimiento

El model-index del autor declara una entrada para `neu-q3-ultra-nbl-hypo-s42-20261115-a1` con `results: []`, es decir, sin resultados. La model card afirma explícitamente que no se incluyen resultados de benchmarks de generación.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican sin cuantizar en float32 (32,8 GB de repositorio). En bfloat16 la estimación ronda los 16,4 GB solo para pesos; en float32 supera los 32 GB. No se declaran variantes GGUF ni cuantizadas.
- GPU recomendadas: el entrenamiento se realizó en 4 × NVIDIA H200. Para inferencia en bf16, una GPU con 24 GB o más (A100 40GB, H100, L40S) es suficiente para los pesos; para float32 se requiere 40 GB o más.
- Consumer GPU: en bf16 podría caber en una RTX 4090 (24 GB) con margen ajustado; en float32 no cabe en GPUs de consumo.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI más allá del tag.
- Latencia y throughput: no disponibles. La model card solo registra 0.055 pasos/segundo durante el entrenamiento, que no es una métrica de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| neu-q3-ultra-nbl-hypo-s42-20261115-a1 | 8,19B | 2048 (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigación, sin benchmarks |
| jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128 | 8B (Qwen3) | no disponible | Apache 2.0 | Hugging Face | Modelo base SFT del que deriva |
| Qwen3-8B (original) | 8B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Base arquitectónica; contexto y benchmarks no verificados aquí |

No se dispone de datos de benchmarks para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental: el autor indica que una sola semilla y checks de entrenamiento correctos no establecen calidad downstream, robustez ni idoneidad para despliegue.
- Sin evaluación: la evaluación durante el entrenamiento está deshabilitada y no se incluyen resultados de benchmarks de generación.
- Loss no interpretable como calidad: la training loss de 9.405 refleja convenciones de logging y acumulación propias de la implementación; no es una métrica de calidad.
- Contexto limitado: el entrenamiento se realizó con máximo de 2048 tokens (1800 de prompt), lo que limita el uso en tareas de contexto largo.
- Idiomas no declarados: no hay información sobre cobertura multilingüe.
- Sesgos y alucinaciones: no documentados por el autor; al derivar de UltraFeedback y UltraChat, puede heredar sesgos de esos datasets.
- Snapshot model-only: no es un checkpoint reanudable de optimizador; no incluye estado de scheduler ni RNG.
- Paridad no garantizada: el autor no reclama paridad exacta con un entorno B200 distinto.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin validación propia.
- Reproducibilidad: debe evaluarse identificando una revisión inmutable de Hugging Face y usando el tokenizer y config archivados con el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackf857/neu-q3-ultra-nbl-hypo-s42-20261115-a1
- Modelo base SFT: https://huggingface.co/jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Logs de entrenamiento (run summary): https://huggingface.co/jackf857/neu-q3-ultra-nbl-hypo-s42-20261115-a1/blob/main/training_logs/run/run.json
- Configuración de entrenamiento congelada: https://huggingface.co/jackf857/neu-q3-ultra-nbl-hypo-s42-20261115-a1/blob/main/training_logs/run/training_config.yaml
- Model card original autogenerada: https://huggingface.co/jackf857/neu-q3-ultra-nbl-hypo-s42-20261115-a1/blob/main/training_logs/run/generated-model-card-original.md
