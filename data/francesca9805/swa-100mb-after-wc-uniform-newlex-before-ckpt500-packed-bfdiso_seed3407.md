# francesca9805/swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407

## Resumen

El modelo `swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407` es un modelo de generación de texto de arquitectura GPT-2 con 124.770.816 parámetros, publicado por el usuario de Hugging Face `francesca9805` (vinculado a la Universidad de Groningen según el proyecto de Weights & Biases referenciado). Se trata de un fine-tuning mediante SFT (supervised fine-tuning) con TRL sobre el modelo base `francesca9805/ppt-wc-uniform-newlex-swa-before-100mb-packed-bfdiso_seed3407`, del mismo autor.

El nombre del repositorio sugiere un experimento de investigación sobre tokenizadores y entrenamiento con ventana deslizante (SWA, sliding window attention o stochastic weight averaging, no especificado), sobre un corpus de aproximadamente 100 MB y con checkpoints intermedios. No es un modelo orientado a producción ni a uso general: no dispone de model card descriptiva más allá de la plantilla autogenerada por TRL, no declara idiomas soportados y no publica resultados de evaluación.

Su relevancia es por tanto limitada al ámbito experimental. Resulta útil como ejemplo reproducible de un pipeline de fine-tuning con TRL 0.23.0 sobre un modelo GPT-2 pequeño, y para estudiar el efecto de decisiones de tokenización y empaquetado de secuencias en modelos de baja escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a GPT-2, un transformer decoder-only con atención causal completa. Con 124,77 millones de parámetros, el tamaño encaja con la configuración GPT-2 small (124 M), aunque no se confirma en la información disponible si la configuración de capas y dimensiones ocultas coincide exactamente con la original de OpenAI. El modelo emplea la librería `transformers` 4.56.2 y se distribuye en formato safetensors.

El entrenamiento se realizó mediante SFT con TRL 0.23.0, partiendo del modelo `francesca9805/ppt-wc-uniform-newlex-swa-before-100mb-packed-bfdiso_seed3407`. El nombre del checkpoint ("before-ckpt500") sugiere que este modelo se guardó antes del paso o checkpoint 500 de un entrenamiento más largo. El proyecto de Weights & Biases asociado se titula "new-tokenizers", lo que apunta a un experimento centrado en tokenización ("wc-uniform-newlex" podría referirse a un vocabulario construido con recuento de palabras uniforme sobre un léxico nuevo). No se detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. El repositorio ocupa 23,0 GB pese a los 124 M de parámetros, lo que indica la presencia de múltiples checkpoints o artefactos de entrenamiento además de los pesos finales.

## Capacidades

- Generación de texto autoregresiva básica, según el pipeline `text-generation` declarado.
- Formateo de conversación por roles (`user`/`assistant`) en el ejemplo de la model card, aunque no se confirma que el modelo haya sido entrenado específicamente para seguir instrucciones de forma robusta.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Reproducción de experimentos de tokenización: el modelo sirve como checkpoint intermedio para comparar el efecto de distintos vocabularios ("newlex", "wc-uniform") en la calidad de generación de un GPT-2 small, dentro de un entorno de investigación controlado.
- Estudio de fine-tuning con TRL: permite replicar el pipeline SFT (TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0) y contrastar hiperparámetros con los registros de Weights & Biases del autor.
- Pruebas de integración de infraestructura: al ser un modelo pequeño y compatible con TGI, es adecuado para validar despliegues de endpoints de generación de texto antes de migrar a modelos mayores.
- Docencia y formación: un GPT-2 de 124 M parámetros es manejable en hardware modesto y sirve para ilustrar el ciclo completo de entrenamiento, evaluación y despliegue de un modelo de lenguaje.
- Generación de texto exploratoria en dominios acotados: si el corpus de entrenamiento es específico, el modelo puede producir continuaciones de estilo similar, siempre con revisión humana y sin expectativas de calidad de un modelo alineado.
- Baseline en experimentos comparativos: sirve como referencia de baja escala frente a modelos GPT-2 estándar para medir el impacto de cambios en el tokenizador o en el empaquetado de secuencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp32): aproximadamente 0,5 GB solo para pesos; en fp16/bf16, unos 0,25 GB. El overhead de activaciones y del runtime es pequeño para secuencias cortas.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes pequeños.
- GPU recomendadas para entrenamiento o fine-tuning: una única RTX 3090/4090 es suficiente; también A100 o H100 si se busca throughput alto con lotes grandes.
- Opciones de despliegue: `transformers` con pipeline, Text Generation Inference (declarado compatible), y en principio llama.cpp u Ollama si se convierte a GGUF (no se distribuyen pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos por token en GPU moderna, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407 | 124,77 M | no disponible | no disponible | Hugging Face, safetensors |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, safetensors/pytorch |
| GPT-2 medium (OpenAI) | 355 M | 1024 tokens | MIT | Hugging Face, safetensors/pytorch |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face, safetensors/pytorch |

La comparación se limita a parámetros, contexto y licencia, ya que no hay datos de rendimiento publicados para este modelo. Frente a GPT-2 small, comparte escala pero carece de licencia clara y de evaluación pública; frente a DistilGPT-2, es algo mayor y sin destilación declarada.

## Limitaciones y advertencias

- Ausencia de model card descriptiva: no se documentan datos de entrenamiento, idiomas, sesgos ni evaluación, lo que impide valorar su calidad de forma objetiva.
- Riesgo elevado de alucinación y de generación incoherente, propio de un GPT-2 de 124 M sin alineación documentada.
- Licencia no especificada ("licence: license" en la model card): no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas soportados no declarados; el vocabulario "newlex" sugiere un tokenizador no estándar, lo que puede degradar el rendimiento en textos generales.
- Longitud de contexto no documentada; no debe asumirse la ventana de 1024 tokens de GPT-2 sin verificación.
- Checkpoint intermedio ("before-ckpt500"): puede representar un estado no final del entrenamiento, con calidad inferior a la del modelo completado.
- Tamaño del repositorio de 23 GB para 124 M parámetros: indica artefactos adicionales (checkpoints, optimizador) que conviene revisar antes de descargar.
- No apto para producción sin evaluación previa en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-swa-before-100mb-packed-bfdiso_seed3407
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/mkaexf3r
- Repositorio TRL: https://github.com/huggingface/trl
