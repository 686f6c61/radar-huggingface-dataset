# agurung/clean-eval-sft-w2c-same-4-noappr

## Resumen

`agurung/clean-eval-sft-w2c-same-4-noappr` es un ajuste fino por supervisión (SFT) del modelo Qwen3-4B-Instruct-2507, publicado por el usuario agurung en Hugging Face. El modelo se ha entrenado con la librería TRL sobre el dataset `cobalt-traces-sft_w2c_same_4_noappr`, un conjunto de trazas conversacionales orientado a evaluación limpia (clean-eval) y diversidad de respuestas. No se trata de un modelo base nuevo, sino de una variante experimental de 4 mil millones de parámetros derivada de la familia Qwen3.

La relevancia del modelo es acotada: se publica como artefacto de investigación reproducible, con número de descargas y likes nulo en el momento de la ficha, y sin model card sustantiva (el README es la plantilla automática de TRL). Su interés principal reside en que documenta un pipeline de SFT sobre Qwen3-4B-Instruct-2507 con trazas etiquetadas como "w2c" (presumiblemente "wrong to correct" o una variante de corrección de respuestas) y "noappr" (sin aprobación o sin pares de preferencia), lo que puede servir a quien investigue metodologías de evaluación no contaminada y ajuste supervisado sobre modelos pequeños.

Arquitectónicamente hereda todo del modelo base: un transformer decoder-only de la familia Qwen3 con 4 mil millones de parámetros y ventana de contexto larga (el modelo base Qwen3-4B-Instruct-2507 soporta 262 144 tokens nativos, aunque la model card de este fine-tune no lo declara explícitamente). El repositorio ocupa 1,1 GB en safetensors, lo que corresponde a pesos en precisión bf16/fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4 mil millones (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-4B-Instruct-2507 soporta 262 144 tokens nativos |
| Tipos de cuantizacion | no disponible en la model card; al ser compatible con transformers y pesos safetensors, admite cuantizacion posterior a GGUF, AWQ, GPTQ o bitsandbytes |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen3 es multilingue (mas de 100 idiomas) |
| Licencia | no disponible (el frontmatter indica `licence: license`, sin especificar) |
| Formato de pesos | safetensors (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune por SFT del checkpoint Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4 mil millones de parámetros con atención causal estándar y RoPE. No se introduce ninguna modificación arquitectónica: el entrenamiento se limita a ajustar los pesos del modelo base sobre el dataset `cobalt-traces-sft_w2c_same_4_noappr`. La model card no detalla hiperparámetros, número de tokens de entrenamiento, composición del dataset ni si hubo etapas de RLHF o DPO; únicamente indica que se usó TRL 1.13.0, Transformers 5.15.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.22.2, y enlaza a un run de Weights & Biases (`alexgurung/clean-eval-w2c/runs/2uk9vmou`) donde presumiblemente están las curvas de pérdida y la configuración exacta.

Los tags del repositorio (`uniform`, `diversity`, `sft`, `cobalt`) y el nombre del dataset (`w2c_same_4_noappr`) sugieren un experimento sobre diversidad de respuestas y corrección de trazas, en la línea del trabajo Clean-Eval (arXiv:2311.09154) sobre evaluación no contaminada de LLMs. No obstante, la model card no confirma esta relación ni describe la metodología de construcción del dataset, por lo que cualquier afirmación al respecto es inferencia a partir de los metadatos y no un dato verificado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y matemáticas de nivel medio, acorde a un modelo denso de 4B parámetros de la familia Qwen3.
- Generación de código y soporte de tool calling / function calling, capacidades presentes en el modelo base Qwen3-Instruct.
- Modo "thinking" (razonamiento extendido) disponible en la familia Qwen3-Instruct, aunque la model card de este fine-tune no lo documenta explícitamente.
- Capacidades multilingües heredadas del modelo base (más de 100 idiomas según la documentación de Qwen3), sin que la model card de este fine-tune las enumere.
- No se documentan capacidades de visión, audio ni agentes autónomos específicas de este checkpoint.

## Casos de uso

- Investigación en evaluación no contaminada: el modelo sirve como artefacto reproducible para estudiar cómo el SFT sobre trazas "clean-eval" afecta al rendimiento medido en benchmarks, comparándolo con el modelo base y con variantes RFT del mismo autor (por ejemplo, `agurung/clean-eval-rft-w2c-same-4-vs`).
- Experimentos de diversidad de respuestas: los tags `uniform` y `diversity` apuntan a un uso como baseline para medir si el ajuste supervisado colapsa o preserva la variedad de salidas en tareas generativas.
- Generación de código en prototipos: al heredar el soporte de tool calling y código de Qwen3-4B-Instruct, puede integrarse en asistentes de programación ligeros que quepan en una GPU de consumo.
- Atención al cliente automatizada de bajo coste: con 4B parámetros y contexto largo heredado, es desplegable en una sola GPU para gestionar conversaciones multi-turno con historial extenso.
- Destilación de trazas para datasets: las salidas del modelo pueden emplearse para generar trazas sintéticas etiquetadas en pipelines de destilación o aumento de datos.
- Fine-tuning posterior como base: al ser un checkpoint SFT sobre Qwen3-4B, sirve de punto de partida para experimentos de DPO, RLHF o ajuste específico de dominio con requisitos de VRAM moderados.
- Evaluación comparativa de metodologías SFT: útil para replicar el pipeline TRL 1.13.0 + Transformers 5.15.0 documentado en la model card y verificar la reproducibilidad del run de W&B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 8-9 GB solo para pesos, más overhead de activaciones y caché KV (10-12 GB en la práctica para contextos moderados).
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB; en 4 bits (GGUF Q4_K_M o AWQ/GPTQ): en torno a 3-4 GB.
- GPU recomendadas: A100 40/80 GB, H100 para serving de alto throughput; RTX 4090, RTX 3090, L40S para inferencia en una sola tarjeta.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16, y en RTX 4060 Ti 16 GB, RTX 4070 Ti Super o incluso GPUs de 8 GB con cuantización 4 bits.
- Opciones de despliegue: transformers (pipeline documentado en la model card), vLLM, TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama tras conversión a GGUF, y SGLang.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agurung/clean-eval-sft-w2c-same-4-noappr | 4B (denso) | no disponible (base: 262 144) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B (denso) | 262 144 tokens nativos | Apache 2.0 (según la familia Qwen3) | Hugging Face, ampliamente usado |
| agurung/clean-eval-rft-w2c-same-4-vs | 4B (denso) | no disponible | no disponible | Hugging Face, variante RFT del mismo autor |
| Llama 3.2 3B Instruct | 3B (denso) | 128 000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado |

La comparación con el modelo base es la más relevante: este checkpoint no añade capacidades nuevas verificables y su interés es experimental. Frente a Llama 3.2 3B, ofrece más parámetros y, presumiblemente, mayor contexto, pero carece de licencia declarada y de benchmarks publicados, lo que limita su uso en producción frente a alternativas con garantías legales y métricas conocidas.

## Limitaciones y advertencias

- La model card es la plantilla automática de TRL: no hay descripción del dataset, hiperparámetros, número de tokens ni metodología, lo que impide evaluar la calidad del ajuste sin consultar el run de W&B.
- Licencia no declarada de forma explícita (`licence: license` en el frontmatter): no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor o verificar la licencia del modelo base Qwen3-4B-Instruct-2507 (Apache 2.0) antes de desplegarlo.
- Sin benchmarks publicados: no hay evidencia de que el fine-tune mejore, mantenga o degrade las capacidades del modelo base; es posible que el SFT sobre trazas específicas haya estrechado la distribución de respuestas.
- Riesgo de alucinación y sesgos heredado del modelo base Qwen3-4B-Instruct-2507, agravado por la falta de evaluación específica de este checkpoint.
- Idiomas soportados no documentados: aunque el modelo base es multilingüe, el ajuste sobre un dataset presumiblemente en inglés puede degradar el rendimiento en castellano u otros idiomas.
- Cero descargas y cero likes en el momento de la ficha: no hay comunidad que haya validado el modelo, ni issues, ni informes de uso en producción.
- El nombre del dataset (`w2c_same_4_noappr`) y los tags (`uniform`, `diversity`) sugieren un experimento muy específico; no se debe asumir que el modelo sea un asistente generalista pulido.
- Fecha de creación posterior a la fecha actual de referencia (2026-11-08): verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agurung/clean-eval-sft-w2c-same-4-noappr
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/cobalt-traces-sft_w2c_same_4_noappr
- Run de Weights & Biases: https://wandb.ai/alexgurung/clean-eval-w2c/runs/2uk9vmou
- Variante RFT del mismo autor: https://huggingface.co/agurung/clean-eval-rft-w2c-same-4-vs
- Repositorio TRL: https://github.com/huggingface/trl
- Paper Clean-Eval (referencia metodológica probable): https://arxiv.org/pdf/2311.09154v1
