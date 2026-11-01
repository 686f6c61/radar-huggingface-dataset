# open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-SFT-Tulu3-decontaminated-ar30k

## Resumen

El modelo `open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-SFT-Tulu3-decontaminated-ar30k` es un modelo de lenguaje de aproximadamente 1.714 millones de parámetros (1,7B) publicado por la organización open-sci. Se trata de un ajuste fino supervisado (SFT) de un modelo base entrenado bajo la denominación "MixtureVitae-300BT-v1-decontaminated-16k", que sugiere un entrenamiento sobre unos 300.000 millones de tokens con un contexto de 16.000 tokens y un proceso de decontaminación de datos. El ajuste se realizó con el framework LLaMA-Factory sobre el dataset AceReason-1.1-SFT-30k-sharegpt-hf, orientado a razonamiento.

El modelo está etiquetado en HuggingFace con el pipeline `feature-extraction`, aunque su naturaleza es la de un modelo generativo de tipo transformer con pesos en safetensors y código personalizado (`custom_code`). El repositorio ocupa 3,4 GB y la licencia es "other", sin que la model card aclare los términos concretos de uso comercial.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeño (1,7B) entrenado desde cero con un volumen de datos considerable para su tamaño, lo que lo sitúa en la categoría de modelos compactos aptos para hardware de consumo; por otro, advierte de que la información pública es muy escasa (model card autogenerada, sin benchmarks ni descripción de capacidades), lo que condiciona cualquier evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; pesos con `custom_code`) |
| Parametros totales | 1.714.377.728 (1,7B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 16.000 tokens (inferido del nombre del modelo: "16k") |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors) |
| Idiomas soportados | No disponible |
| Licencia | other (terminos no especificados en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 1,7B de parámetros, según el recuento real de safetensors. El nombre del modelo indica un entrenamiento base sobre "MixtureVitae-300BT-v1-decontaminated-16k", lo que sugiere una mezcla de datos ("Mixture") de aproximadamente 300.000 millones de tokens ("300BT"), con contexto de 16.000 tokens y un proceso de decontaminación previo. No se dispone de información sobre la composición exacta del dataset, el número de capas, la dimensión del modelo ni la estrategia de atención (la model card no lo detalla).

El ajuste fino se realizó con LLaMA-Factory en modalidad "full" (todos los parámetros actualizados), sobre el dataset `AceReason-1.1-SFT-30k-sharegpt-hf`. Los hiperparámetros declarados son: learning rate 4e-05, batch total de 128 (batch 1 × 32 dispositivos × 4 pasos de acumulación), optimizador AdamW fused con betas (0,9; 0,999), scheduler cosine con warmup del 10 %, 5 épocas y semilla 42. El entrenamiento se ejecutó en 32 GPUs (tipo no especificado) con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documentan técnicas de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva (modelo causal de lenguaje), aunque el pipeline declarado sea `feature-extraction`.
- Razonamiento y resolución de problemas, dado el ajuste sobre un dataset de tipo AceReason orientado a razonamiento.
- Conversación multi-turno en formato ShareGPT (el dataset de SFT usa ese formato).
- Capacidad de extracción de características (feature extraction) por su etiquetado en HuggingFace.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente; el dataset de razonamiento sugiere cierta aptitud, pero no hay evidencia publicada.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- **Prototipado rápido de asistentes conversacionales**: con 1,7B de parámetros y contexto de 16k, el modelo puede gestionar diálogos multi-turno en entornos de desarrollo con una sola GPU de consumo, lo que permite iterar sobre prompts y formatos sin coste de infraestructura elevado.
- **Generación de texto en local para aplicaciones de escritorio**: al caber en GPUs consumer (ver sección de hardware), es adecuado para integrarse en herramientas de escritura asistida, resumen o reescritura que deban funcionar sin conexión.
- **Extracción de características para pipelines de recuperación (RAG)**: el pipeline `feature-extraction` declarado permite usar las representaciones internas del modelo para búsqueda semántica o clustering de documentos, aunque conviene validar la calidad de los embeddings antes de producción.
- **Generación de razonamiento paso a paso en dominios acotados**: el ajuste sobre AceReason-1.1-SFT-30k apunta a tareas de razonamiento matemático o lógico; puede emplearse para generar cadenas de razonamiento en asistentes educativos, con revisión humana.
- **Fine-tuning posterior como base de investigación**: al ser un modelo pequeño entrenado desde cero con 300BT de tokens, sirve como punto de partida para experimentos académicos de ajuste (SFT, DPO) con presupuesto limitado.
- **Evaluación de técnicas de decontaminación de datos**: el nombre del modelo indica un pipeline de decontaminación; puede usarse como referencia en estudios sobre el impacto de la limpieza de datos en modelos pequeños.
- **Clasificación y etiquetado de texto mediante prompts**: con un contexto de 16k puede procesar documentos largos y devolver etiquetas o extracciones estructuradas, siempre que se valide la fiabilidad.

## Benchmarks y rendimiento

La model-index del autor declara una entrada de evaluación (`sft__AceReason-1-1-SFT-30k-sharegpt-hf__1-7b-Mixtur-3b5477ca__sdpa-open-sci-steps__1.7b-94285eb5`) pero con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada en fp16/bf16**: aproximadamente 3,4 GB solo para pesos (1,7B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contexto moderado.
- **VRAM estimada en cuantización de 8 bits**: alrededor de 1,7-2 GB de pesos; en 4 bits, en torno a 1 GB de pesos, aunque no se publican versiones GGUF/AWQ/GPTQ oficiales.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para inferencia en fp16; A100/H100 no son necesarias para este tamaño, pero pueden usarse para servir en lote.
- **Cabe en GPU consumer**: sí, en la mayoría de GPUs con 8 GB o más en fp16; en 4 bits podría caber en GPUs de 4-6 GB, previa conversión manual.
- **Opciones de despliegue**: Transformers (nativo, requiere `trust_remote_code=True` por el `custom_code`), vLLM y TGI si el código personalizado es compatible, llama.cpp/Ollama solo tras convertir los pesos a GGUF (no se proporcionan oficialmente).
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci 1.7b-MixtureVitae (este modelo) | 1,7B | 16k (inferido) | other | HuggingFace, safetensors, `custom_code` |
| TinyLlama-1.1B | 1,1B | 2k-4k | Apache 2.0 | Amplia, con GGUF y ecosistema |
| Qwen2.5-1.5B | 1,5B | 32k | Apache 2.0 (mayoría de variantes) | Amplia, con GGUF, vLLM y Ollama |
| SmolLM2-1.7B | 1,7B | 8k | Apache 2.0 | Amplia, con GGUF y Ollama |

La comparación de rendimiento no es posible porque este modelo no publica benchmarks. Frente a alternativas como Qwen2.5-1.5B o SmolLM2-1.7B, la principal desventaja es la falta de documentación, de cuantizaciones oficiales y de una licencia clara; la ventaja potencial es un contexto de 16k y un entrenamiento base con 300BT de tokens, superior en volumen a varios modelos de su tamaño, aunque sin evidencia pública de calidad.

## Limitaciones y advertencias

- **Información insuficiente**: la model card es autogenerada y no describe capacidades, datos de entrenamiento ni limitaciones; cualquier uso en producción exige evaluación propia.
- **Licencia "other" sin términos explícitos**: no se aclara si se permite uso comercial; es imprescindible contactar con el autor antes de desplegarlo en productos.
- **Riesgo de alucinación**: como todo modelo de lenguaje de 1,7B, la tasa de alucinación será probablemente alta en tareas de conocimiento factual; no se han publicado evaluaciones de fidelidad.
- **Idiomas no declarados**: se desconoce el soporte real de castellano; el dataset de SFT (AceReason, ShareGPT) sugiere predominio del inglés.
- **Código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar antes de cargar en entornos sensibles.
- **Sin cuantizaciones oficiales**: no hay GGUF, AWQ ni GPTQ publicados, lo que complica el despliegue en hardware limitado.
- **Contexto de 16k inferido del nombre**: no confirmado en la model card; podría variar según la implementación.
- **Sesgos desconocidos**: sin documentación sobre composición del dataset ni filtros aplicados, no es posible evaluar sesgos de género, raza o ideológicos.
- **Fecha de creación futura en los metadatos** (2026-10-30): inconsistencia que sugiere datos de repositorio poco fiables; verificar la integridad de los pesos antes de usarlos.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-SFT-Tulu3-decontaminated-ar30k
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Transformers: https://github.com/huggingface/transformers
- Dataset de SFT referenciado (no enlazado en la model card): `AceReason-1.1-SFT-30k-sharegpt-hf` (no disponible URL pública en la información proporcionada)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
