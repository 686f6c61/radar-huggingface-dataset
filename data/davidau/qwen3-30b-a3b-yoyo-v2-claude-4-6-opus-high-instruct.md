# DavidAU/Qwen3-30B-A3B-YOYO-V2-Claude-4.6-Opus-High-INSTRUCT

## Resumen

Qwen3-30B-A3B-YOYO-V2-Claude-4.6-Opus-High-INSTRUCT es un ajuste fino (fine-tune) del modelo YOYO-AI/Qwen3-30B-A3B-YOYO-V2, un modelo de arquitectura Mixture of Experts (MoE) derivado de la familia Qwen3. Lo desarrolla DavidAU, un autor independiente conocido por publicar numerosas variantes y merges sobre modelos open source. El modelo parte de la base Qwen3 30B-A3B Thinking (2507) con la fusión YOYO2 y aplica un adaptador de destilación orientado a razonamiento de alta intensidad, entrenado sobre el dataset TeichAI/claude-4.5-opus-high-reasoning-250x.

El objetivo declarado es combinar la velocidad y eficiencia de la arquitectura MoE de Qwen3 (30.500 millones de parámetros totales con solo 3.000 millones activos por token) con trazas de razonamiento de estilo Claude Opus. Mantiene la ventana de contexto de 256.000 tokens, 128 expertos (8 activos por defecto) y se distribuye con licencia Apache 2.0.

Es relevante para desarrolladores que buscan un modelo instructivo con capacidad de razonamiento explícito que pueda ejecutarse en hardware modesto gracias a su naturaleza MoE (solo un 10 % de los parámetros activos por token). El entrenamiento se realizó con Unsloth sobre hardware local. La model card incluye una tabla de benchmarks propietaria cuyos resultados no se pueden verificar de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia Qwen3 (qwen3_moe) |
| Parametros totales | 30.531.028.992 (~30,5 B) |
| Parametros activos | ~3 B (8 de 128 expertos activos por defecto) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | No especificados en la model card; el autor publica variantes GGUF, EXL2, AWQ, GPTQ y HQQ de sus modelos (no confirmado para esta versión concreta) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 61,1 GB); librería transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3-30B-A3B: un transformer con 128 expertos por capa, de los cuales se activan 8 por defecto, lo que resulta en aproximadamente 3.000 millones de parámetros activos sobre un total de 30.500 millones. Esta configuración permite un throughput alto con un coste computacional por token mucho menor que el de un modelo denso del mismo tamaño. La ventana de contexto es de 256.000 tokens.

El ajuste fino se realizó con Unsloth sobre hardware local (Linux sobre Windows, según el autor) y utiliza el dataset TeichAI/claude-4.5-opus-high-reasoning-250x, una colección de trazas de razonamiento de alta intensidad generadas a partir de Claude Opus. El autor lo describe como un adaptador especializado de "Claude Opus 4.6 High Reasoning" destilado sobre la base YOYO V2. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El modelo base es a su vez un merge (YOYO2) sobre Qwen3-30B-A3B 2507 Thinking.

## Capacidades

- Generación de texto conversacional e instructiva en inglés.
- Razonamiento con trazas explícitas (thinking): el autor indica que pueden aparecer trazas de razonamiento como texto en algunas generaciones, aunque el modelo está orientado a uso instructivo.
- Razonamiento matemático y científico: el autor afirma que las capacidades de matemáticas y ciencia se mantienen intactas respecto al modelo base.
- Capacidad de ejecución en GPU, CPU o reparto entre ambos, con velocidades "razonables" de tokens por segundo según el autor.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; la presencia de trazas de razonamiento sugiere cierta capacidad, pero no se confirma.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistentes conversacionales en inglés con contexto largo: la ventana de 256.000 tokens permite mantener conversaciones multi-turno extensas o procesar documentos completos sin truncar, con un coste por token reducido gracias a los 3 B de parámetros activos.
- Razonamiento asistido en tareas de análisis: las trazas de razonamiento destiladas de Claude Opus permiten generar cadenas de pensamiento en problemas de lógica, matemáticas o ciencia, útiles como apoyo a la toma de decisiones.
- Generación de código y explicación de fragmentos: aunque no se documenta soporte explícito de tool calling, el modelo puede emplearse para completar y revisar código en inglés dentro de pipelines de desarrollo.
- Despliegue en hardware de gama media: al activar solo ~3 B de parámetros por token, es viable en GPUs de consumo con cuantización adecuada, lo que lo hace útil para prototipos locales y entornos sin acceso a clústeres.
- Procesamiento de documentación técnica extensa: la ventana de 256 k tokens permite resumir o extraer información de manuales, papers o bases de conocimiento de gran tamaño en una sola pasada.
- Experimentación en investigación sobre destilación de razonamiento: sirve como caso de estudio de cómo un adaptador entrenado sobre trazas de un modelo propietario transfiere capacidades de razonamiento a una arquitectura MoE abierta.
- Chat y roleplay con ajuste de muestreo: el autor documenta parámetros específicos (smoothing_factor 1.5, repetición 1.1–1.15) para interfaces como KoboldCpp, text-generation-webui o SillyTavern, lo que lo hace adecuado para aplicaciones de personajes y narrativa.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor y no han sido verificados de forma independiente. El autor afirma que el modelo supera al Qwen3-30B-A3B original en las 7 métricas listadas.

| Benchmark | Este modelo (según autor) | Qwen3-30B-A3B (según autor) |
|---|---|---|
| ARC-Challenge | 0,545 | 0,410 |
| ARC-Easy | 0,717 | 0,444 |
| BoolQ | 0,877 | 0,691 |
| HellaSwag | 0,717 | 0,635 |
| OpenBookQA | 0,440 | 0,390 |
| PIQA | 0,789 | 0,769 |
| Winogrande | 0,653 | 0,650 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: en precisión completa (BF16) el repo ocupa 61,1 GB, por lo que requiere al menos 2 GPUs de 40 GB o una de 80 GB. Con cuantización de 8 bits se reduce a ~31 GB; con 4 bits, a ~16-18 GB.
- GPU recomendadas: A100 80 GB o H100 para precisión completa; A100 40 GB en tensor paralelo; RTX 4090 (24 GB) viable con cuantización de 8 o 4 bits.
- GPU de consumo: cabe en RTX 4090 con cuantización 4/8 bits; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con cuantización agresiva de 4 bits y contexto reducido. El autor indica que también puede ejecutarse en CPU o repartido entre CPU y GPU.
- Opciones de despliegue: transformers (formato nativo safetensors); llama.cpp/Ollama y KoboldCpp mediante GGUF (el autor publica habitualmente variantes GGUF, EXL2, AWQ, GPTQ y HQQ); text-generation-webui con llama_HF para GGUF; vLLM y TGI no están documentados explícitamente para esta versión.
- Latencia y throughput: no disponibles de forma medida. Al activar solo ~3 B de parámetros por token, el throughput esperado es notablemente superior al de un modelo denso de 30 B, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-YOYO-V2-Claude-4.6-Opus-High-INSTRUCT | 30,5 B | ~3 B | 256 k | Apache 2.0 | Fine-tune destilado de razonamiento sobre YOYO V2 |
| Qwen3-30B-A3B (original) | 30,5 B | ~3 B | 128 k (versión base Qwen3) | Apache 2.0 | Modelo base de la familia; sin destilación de Claude |
| YOYO-AI/Qwen3-30B-A3B-YOYO-V2 | 30,5 B | ~3 B | 256 k | Apache 2.0 | Merge base sobre el que se aplica el adaptador |

No se dispone de datos verificables de benchmarks independientes para establecer una comparación de rendimiento fiable con alternativas como Mistral-Small-3 o Llama-3.3-70B.

## Limitaciones y advertencias

- Los benchmarks de la model card son autoinformados por el autor y no han sido verificados de forma independiente; deben tomarse con cautela.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Pueden aparecer trazas de razonamiento como texto en las generaciones, lo que puede requerir post-procesado en aplicaciones de producción.
- No se documenta soporte explícito de tool calling ni de flujos de agentes; conviene validarlo antes de usarlo en pipelines que dependan de function calling.
- Riesgo de alucinación inherente a los modelos de lenguaje; la destilación de trazas de razonamiento no elimina este riesgo y puede incrementar la verbosidad.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre un dataset derivado de un modelo propietario, puede heredar sesgos de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero el dataset de destilación (TeichAI/claude-4.5-opus-high-reasoning-250x) deriva de salidas de un modelo propietario; conviene revisar las implicaciones legales del uso de datos destilados de terceros.
- El modelo base es un merge no oficial (YOYO2) sobre Qwen3; la cadena de procedencia incluye múltiples pasos de ajuste que pueden afectar a la estabilidad.
- Requiere ajustes específicos de muestreo (smoothing_factor 1.5) para un funcionamiento óptimo en chat y roleplay según el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3-30B-A3B-YOYO-V2-Claude-4.6-Opus-High-INSTRUCT
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Ficheros fuente para GGUF/EXL2/AWQ/GPTQ/HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Modelo base: https://huggingface.co/YOYO-AI/Qwen3-30B-A3B-YOYO-V2
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
