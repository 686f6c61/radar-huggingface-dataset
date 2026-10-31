# JIRU-W/e32_top8_seq2048_gbs128_10b_perlayeraux

## Resumen

e32_top8_seq2048_gbs128_10b_perlayeraux es un modelo de lenguaje Mixture-of-Experts (MoE) entrenado desde cero por el usuario de HuggingFace JIRU-W. Con 3.696.887.808 parámetros totales (3,7B), se trata de un modelo de investigación experimental cuyo objetivo es estudiar el efecto de una variante de la función de pérdida de balanceo de carga (load-balancing) calculada por capa en lugar de la forma estándar de OLMoE/Mixtral que agrupa las estadísticas del router de todas las capas por índice de experto.

El modelo es idéntico en código, pesos iniciales, datos, orden de datos, semilla e hiperparámetros al modelo gemelo JIRU-W/e32_top8_seq2048_gbs128_10b (la pérdida del paso 1 coincide con una tolerancia de 1e-9), salvo por el interruptor `router_aux_loss_per_layer=True`. Esto lo convierte en un experimento controlado tipo A/B para investigación en preentrenamiento de MoE.

El entrenamiento está en curso (en el momento de redactar la model card se encontraba en el paso 13.768 de 38.139) y los checkpoints se publican progresivamente en el repositorio. Es un modelo base pequeño, no instruido (no instruction-tuned), pensado para investigación y no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMoE (MoE, transformer decoder-only, código personalizado `MaskMoe*`) |
| Parametros totales | 3.696.887.808 (≈3,7B) |
| Parametros activos | no disponible (top-8 de 32 expertos por capa; no se publica el recuento exacto de parámetros activos) |
| Longitud de contexto | 2048 tokens (según la longitud de secuencia del entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (entrenado con OLMoE-mix-0924, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints de DeepSpeed en ramas) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura OLMoE (código copiado de `transformers` v5.20.1, clase renombrada a `MaskMoe*` y distribuida como código personalizado). Consta de 16 capas, dimensión oculta de 2048, 16 cabezas de atención con QK-norm y RoPE con θ=10000. Cada capa contiene 32 expertos SwiGLU con dimensión intermedia de 1024 y enrutamiento top-8 con `norm_topk_prob=False`. El vocabulario es de 50.304 tokens, usando el tokenizador de OLMoE.

El entrenamiento usa 10.000 millones de tokens del dataset JIRU-W/olmoe-mix-0924-10b (una muestra de `allenai/OLMoE-mix-0924` con datos de arXiv de `EleutherAI/proof-pile-2`), en una sola pasada con orden de muestras fijo (`np.random.default_rng(1234).permutation(4881809)`). Se planifican 38.139 pasos con un batch de 128 secuencias × 2048 tokens = 262.144 tokens por paso. El optimizador es AdamW con lr 6e-4, 200 pasos de warmup, decay coseno hasta 6e-5 y weight decay 0.1. La precisión es bf16 en pesos con acumulación de gradientes en fp32, usando DeepSpeed ZeRO-2 en una sola GPU. La innovación central del experimento es la pérdida de balanceo de carga por capa (pérdida tipo Switch calculada independientemente en cada una de las 16 capas y promediada), con coeficiente 0,01 sin cambios respecto a la variante de referencia.

## Capacidades

- Generacion de texto en bruto (modelo base preentrenado, sin ajuste por instrucciones)
- Modelado de lenguaje con enrutamiento MoE top-8 sobre 32 expertos por capa
- Completado de texto técnico y científico, dado que el corpus incluye arXiv y proof-pile-2
- Carga de checkpoints históricos por rama (`step100` a `step13000` y siguientes) para estudios de dinámica de entrenamiento
- Comparación controlada contra el modelo gemelo con pérdida de balanceo agregada para investigar el efecto del balanceo por capa
- No soporta tool calling, agentes, visión ni audio
- No está instruido: no sigue instrucciones ni mantiene conversaciones de forma fiable

## Casos de uso

- Investigacion en funciones de balanceo de carga MoE: permite comparar directamente la pérdida por capa frente a la agregada por experto con un experimento controlado (misma semilla, datos e hiperparámetros), útil para papers y ablations.
- Estudios de dinámica de enrutamiento: los checkpoints intermedios (cada 1.000 pasos y varios iniciales) permiten analizar cómo evoluciona la especialización de expertos a lo largo del preentrenamiento.
- Investigacion en scaling laws de MoE pequeños: al ser un modelo de 3,7B entrenado con 10B tokens en una sola GPU, sirve como banco de pruebas económico para hipótesis de arquitectura MoE.
- Completado de texto tecnico y cientifico: dado el corpus con arXiv y proof-pile-2, puede usarse para evaluar perplexidad y completado en texto matemático y académico.
- Reproduccion de pipelines de preentrenamiento: el repositorio documenta semilla, orden de datos y configuración exacta, útil como referencia para reproducir experimentos de preentrenamiento con DeepSpeed ZeRO-2 en una GPU.
- Evaluacion de checkpoints intermedios: los investigadores pueden estudiar curvas de pérdida (eval CE publicado por checkpoint) y compararlas con sus propios experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica publicada es la entropía cruzada de evaluación (CE media sobre 256 secuencias de 2048 tokens reservadas):

| Revision | Tokens vistos | Eval CE |
|---|---|---|
| step7000 | 1,84B | 3,1408 |
| step8000 | 2,10B | 3,1094 |
| step9000 | 2,36B | 3,0817 |
| step10000 | 2,62B | 3,0595 |
| step11000 | 2,88B | 3,0381 |
| step12000 | 3,15B | 3,0184 |
| step13000 | 3,41B | 3,0033 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,7B de parámetros en bf16, aproximadamente 7,5 GB solo para pesos; en la práctica se recomienda una GPU con al menos 12-16 GB de VRAM para inferencia cómoda. No hay estimaciones oficiales publicadas.
- El entrenamiento original se realiza en una sola GPU con DeepSpeed ZeRO-2, lo que indica que tanto entrenamiento como inferencia son viables en hardware de un solo nodo.
- Cabe en GPUs consumer de gama alta (RTX 3090/4090 con 24 GB) con holgura en bf16; no se han publicado cuantizaciones (GGUF, AWQ, GPTQ), por lo que la inferencia en GPUs más modestas requiere cuantización propia.
- Despliegue: requiere `transformers>=5.20` con `trust_remote_code=True` (código personalizado `modeling_mask_moe.py`). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI; dado el código personalizado, la vía soportada es la librería `transformers` con PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| JIRU-W/e32_top8_seq2048_gbs128_10b_perlayeraux | 3,7B | OLMoE (32 expertos, top-8, 16 capas) | 2048 | Apache 2.0 | Experimento con pérdida de balanceo por capa; en entrenamiento |
| JIRU-W/e32_top8_seq2048_gbs128_10b | 3,7B | OLMoE (idéntica) | 2048 | Apache 2.0 | Gemelo control con pérdida de balanceo agregada estándar |
| allenai/OLMoE-1B-7B | 6,9B totales / 1,3B activos | OLMoE (64 expertos, top-8) | 4096 | Apache 2.0 | Modelo de referencia de AI2, entrenado con ~5B tokens (ablation) y modelo final más grande; instruido en su variante -instruct |

El modelo es esencialmente una réplica a escala reducida de OLMoE de AllenAI, concebida para investigación sobre la pérdida de balanceo; su comparación relevante es con su gemelo de control y con OLMoE original.

## Limitaciones y advertencias

- No está instruido: es un modelo base preentrenado, por lo que no sigue instrucciones de forma fiable y no debe usarse como asistente sin un ajuste posterior.
- Entrenamiento en curso: los checkpoints publicados son intermedios (el último descrito es el paso 13000 de 38139) y la calidad del modelo mejorará hasta la convergencia.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos.
- Corpus de entrenamiento predominantemente en inglés (OLMoE-mix-0924); el rendimiento en español y otros idiomas no está evaluado y probablemente sea limitado.
- Riesgo de alucinación típico de modelos base pequeños; no hay evaluaciones de veracidad ni de seguridad publicadas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene revisar `modeling_mask_moe.py` antes de usarlo en entornos sensibles.
- No hay soporte documentado para runtimes optimizados (vLLM, llama.cpp), lo que limita el throughput en producción.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque al ser un modelo de investigación experimental no hay garantías de calidad ni soporte.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JIRU-W/e32_top8_seq2048_gbs128_10b_perlayeraux
- Modelo gemelo de control: https://huggingface.co/JIRU-W/e32_top8_seq2048_gbs128_10b
- Dataset de entrenamiento: https://huggingface.co/datasets/JIRU-W/olmoe-mix-0924-10b
- Dataset original de referencia: https://huggingface.co/allenai/OLMoE-mix-0924
- Corpus matemático: https://huggingface.co/EleutherAI/proof-pile-2
