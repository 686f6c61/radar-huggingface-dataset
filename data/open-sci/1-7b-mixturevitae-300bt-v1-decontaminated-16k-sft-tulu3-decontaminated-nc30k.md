# open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-SFT-Tulu3-decontaminated-nc30k

## Resumen

El modelo `open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-SFT-Tulu3-decontaminated-nc30k` es un modelo de lenguaje de aproximadamente 1.714 millones de parámetros (1,7B) desarrollado por el colectivo open-sci. Se trata de un ajuste fino supervisado (SFT) de un modelo base denominado MixtureVitae-300BT-v1, entrenado sobre el conjunto de datos Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf. El identificador del modelo sugiere que el modelo base fue preentrenado con unos 300.000 millones de tokens (300BT) y una longitud de contexto de 16.000 tokens, y que el ajuste se realizó sobre datos de Tulu3 decontaminados.

El modelo está diseñado para tareas de extracción de características (`feature-extraction`) según el pipeline declarado en HuggingFace, aunque el entrenamiento SFT apunta a un uso generativo. La model card es automática y muy escasa: no incluye descripción, usos previstos, datos de evaluación ni resultados de benchmarks. El repositorio ocupa 3,4 GB y los pesos están en formato safetensors.

Su relevancia radica en formar parte del ecosistema de modelos abiertos de pequeño tamaño para investigación, con un ajuste SFT sobre datos de razonamiento y conversación (sharegpt) procedente de la cascada Nemotron. No obstante, la falta de documentación y de métricas publicadas limita seriamente su evaluación para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de MixtureVitae-300BT-v1; detalles no disponibles) |
| Parametros totales | 1.714.377.728 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 16.000 tokens (según el identificador del modelo; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | No disponible |
| Licencia | other (licencia no especificada; requiere consulta al autor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base MixtureVitae-300BT-v1. El nombre sugiere un preentrenamiento sobre una mezcla de datos ("Mixture") con 300.000 millones de tokens ("300BT") y una ventana de contexto de 16.000 tokens ("16k"). El modelo final es el resultado de un ajuste fino supervisado completo (full fine-tuning, no LoRA) sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf, un conjunto de 30.000 ejemplos en formato ShareGPT procedente de la cascada SFT de Nemotron.

Los hiperparámetros de entrenamiento documentados son: learning rate de 4e-05, batch total de 128 (batch size 1 por dispositivo con 32 GPUs y 4 pasos de acumulación), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup del 10 %, 5 épocas y semilla 42. El entrenamiento se realizó con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y conversación multi-turno, derivada del ajuste SFT sobre datos ShareGPT.
- Razonamiento y resolución de tareas de tipo instrucción, presumiblemente heredadas del dataset Nemotron-Cascade-SFT-Stage-1.
- Extracción de características (`feature-extraction`), pipeline declarado en HuggingFace; puede usarse para embeddings de frases o representaciones internas.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre ajuste fino supervisado: el modelo sirve como referencia reproducible para estudiar el efecto del SFT completo sobre un base de 1,7B con datos ShareGPT de la cascada Nemotron, dado que se documentan los hiperparámetros exactos.
- Extracción de embeddings para búsqueda semántica: al declararse como `feature-extraction`, puede emplearse para generar representaciones vectoriales de documentos y consultas en sistemas de recuperación (RAG) de baja latencia, aunque no se han publicado evaluaciones de calidad de embedding.
- Prototipado de asistentes conversacionales: su tamaño de 1,7B permite desplegarlo en una única GPU consumer para pruebas de concepto de chatbots multi-turno con contexto de hasta 16k tokens.
- Generación de texto en pipelines de bajo coste: adecuado para tareas de resumen, reescritura o clasificación generativa donde el presupuesto de cómputo es limitado y no se requiere un modelo de gran escala.
- Experimentos de decontaminación de datos: el identificador indica que tanto el preentrenamiento como el SFT usan datos "decontaminated", lo que lo hace útil para estudiar el impacto de la decontaminación en el rendimiento.
- Base para ajustes posteriores (DPO, RLHF, LoRA): al ser un checkpoint SFT completo en safetensors, puede servir como punto de partida para experimentos de alineación adicional en entornos académicos.
- Evaluación comparativa de modelos pequeños: útil como baseline de 1,7B en estudios que comparen arquitecturas y estrategias de entrenamiento, siempre que se validen sus capacidades con evaluaciones propias.

## Benchmarks y rendimiento

El model-index de la model card declara una única entrada (`sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__1-7b-Mixtur-3b5477ca__sdpa-open-sci-3890133f`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,7-2 GB de pesos; en 4 bits, alrededor de 0,9-1,2 GB (estimaciones teóricas, no hay cuantizaciones publicadas).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; A100, H100 o RTX 4090 para mayor throughput y contextos largos.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en FP16; en GPUs de 8 GB con cuantización.
- Opciones de despliegue: Transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados y requerirían conversión a GGUF o verificación de compatibilidad, dado que el modelo usa `custom_code`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| open-sci/1.7b-MixtureVitae-300BT-v1-...-nc30k | 1,71B | 16k (según identificador) | other | safetensors | SFT sobre Nemotron-Cascade; sin benchmarks |
| Qwen2.5-1.5B | 1,54B | 32k | Apache 2.0 | safetensors, GGUF | Benchmarking público amplio |
| SmolLM2-1.7B | 1,71B | 8k | Apache 2.0 | safetensors, GGUF | Orientado a dispositivo, benchmarks publicados |
| Llama-3.2-1B | 1,24B | 128k | Llama 3.2 Community | safetensors, GGUF | Ecosistema amplio, benchmarks publicados |

La comparación se basa en datos públicos de los modelos alternativos; para el modelo open-sci no hay métricas de rendimiento publicadas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La model card es automática y no documenta sesgos conocidos, riesgos de alucinación ni limitaciones específicas; se desconoce el comportamiento real del modelo.
- No se han publicado evaluaciones (benchmarks, eval loss, métricas de calidad), por lo que no es posible verificar su rendimiento frente a alternativas.
- La licencia es "other" y no se especifican los términos: no se puede confirmar el uso comercial sin consultar al autor.
- Los idiomas soportados no están declarados; el ajuste sobre datos ShareGPT en inglés sugiere un sesgo hacia el inglés, pero no está confirmado.
- El pipeline declarado es `feature-extraction`, lo que puede indicar que la configuración de generación no está optimizada o que el uso previsto difiere del generativo.
- El modelo usa `custom_code`, lo que puede requerir `trust_remote_code=True` y revisión del código antes de ejecutarlo en producción.
- El contexto de 16k se deduce del identificador y no está confirmado en la model card; conviene validarlo empíricamente.
- Riesgo de alucinación inherente a modelos de 1,7B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- El entrenamiento se realizó con 5 épocas sobre 30k ejemplos, lo que puede provocar sobreajuste al dataset SFT y reducir la generalización.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-SFT-Tulu3-decontaminated-nc30k
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
