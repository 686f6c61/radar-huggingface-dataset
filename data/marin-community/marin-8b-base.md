# marin-community/marin-8b-base

## Resumen

Marin 8B Base es un modelo de lenguaje de tipo transformer decoder-only con 8.030.261.248 parámetros, desarrollado por la comunidad del Marin Project, una iniciativa colaborativa orientada a la construcción de modelos fundacionales completamente abiertos. El modelo se distribuye bajo licencia Apache 2.0 y está entrenado exclusivamente en inglés sobre un total de 12,7 billones de tokens (12.7T), lo que lo sitúa en la categoría de modelos de 8B con un presupuesto de entrenamiento muy por encima del habitual (aproximadamente 1.500 tokens por parámetro).

El modelo resuelve el problema de disponer de un checkpoint base reproducible y auditable, con datasets públicos documentados y una cadena de checkpoints intermedios publicada (kestrel, ocelot, jellyfish, phoenix, starling, deeper-starling), lo que facilita la investigación sobre dinámicas de entrenamiento y la experimentación con fine-tuning. Es relevante ahora porque el ecosistema open source carece de modelos de 8B con trazabilidad completa del cómputo y de los datos, y Marin apuesta explícitamente por esa transparencia.

La arquitectura sigue el esquema Llama (tag `llama` en HuggingFace), con pesos en safetensors y compatibilidad drop-in con el tooling existente. La longitud de contexto no está especificada en la información disponible. Existe además una variante Instruct entrenada únicamente con SFT (sin RLHF ni DPO), aunque esta ficha se centra en el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama según tag de HuggingFace) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; al ser safetensors compatible con Llama, es cuantizable a GGUF/AWQ/GPTQ con tooling estándar, pero no se documentan versiones oficiales |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8B parámetros con tokenizer compatible a nivel de arquitectura con el ecosistema Llama, lo que garantiza compatibilidad con herramientas existentes según indica el autor. No se detallan en la información disponible el número de capas, dimensiones ocultas, número de cabezas de atención ni el tipo exacto de atención (MHA/GQA), ni si emplea RoPE u otras innovaciones posicionales.

El entrenamiento se realizó sobre 12,7 billones de tokens, una mezcla que combina corpus web (Nemotron-CC, DCLM Baseline), código (Starcoder Data), matemáticas (Proofpile 2, FineMath 3+, MetaMath, MathCoder2 Synthetic, GSM8K), literatura científica (peS2o, Ar5iv markdownificado), datos enciclopédicos y de Q&A (Wikipedia y StackExchange markdownificados, MegaWika), y datasets de instrucciones y razonamiento (FLAN, CodeSearchNet con filtro OWM, Datashop Science QA). El modelo base no incluye fases de RLHF ni DPO; la variante Instruct es únicamente SFT. Se publican siete checkpoints nombrados con sus correspondientes recuentos de tokens (desde 2,7T hasta 12,7T), lo que permite estudiar la evolución del modelo a lo largo del entrenamiento.

## Capacidades

- Generación de texto en inglés con un presupuesto de entrenamiento de 12,7T tokens.
- Razonamiento matemático y resolución de problemas, reforzado por la inclusión de Proofpile 2, FineMath, MetaMath, GSM8K y MathCoder2 Synthetic en el corpus.
- Generación de código, con Starcoder Data y CodeSearchNet en el entrenamiento.
- Comprensión de literatura científica y matemática, gracias a los datasets Ar5iv markdownificados y peS2o.
- Conocimiento enciclopédico y de preguntas y respuestas técnicas (Wikipedia y StackExchange markdownificados).
- Capacidad base para fine-tuning supervisado y para servir como punto de partida de la variante Instruct.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio, thinking mode ni multilingüismo más allá del inglés.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un modelo base con licencia Apache 2.0 y pesos safetensors, se puede ajustar con SFT sobre datos propios (legal, médico, financiero) sin restricciones de uso comercial.
- Generación de código asistida: su exposición a Starcoder Data y CodeSearchNet durante 12,7T tokens lo hace adecuado como base para autocompletado y generación de funciones en pipelines de desarrollo, previo fine-tuning sobre el lenguaje y framework objetivo.
- Razonamiento matemático y tutoría: la presencia de Proofpile 2, FineMath y MetaMath en el corpus lo convierte en candidato para sistemas de resolución paso a paso de problemas y para la generación de explicaciones matemáticas, tras un ajuste instructivo.
- Investigación sobre entrenamiento de LLM: los siete checkpoints nombrados con recuentos de tokens conocidos permiten estudiar curvas de escalado, emergencia de capacidades y dinámicas de entrenamiento de forma reproducible.
- Procesamiento de documentación científica: los datasets Ar5iv y peS2o facilitan tareas de extracción, resumen y reescritura de artículos técnicos, especialmente si se ajusta sobre el estilo de salida deseado.
- Generación de Q&A técnico: el uso de StackExchange markdownificado lo hace útil como base para asistentes de soporte técnico especializados, con fine-tuning sobre la base de conocimiento de la organización.
- Destilación y generación de datos sintéticos: al ser un modelo base abierto, puede emplearse para generar corpus de entrenamiento para modelos más pequeños, con control total sobre la licencia de los datos generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 24 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB para pesos, aunque la model card no documenta cuantizaciones oficiales.
- GPU recomendadas para servicio en producción: A100 40/80 GB, H100 80 GB o L40S para despliegues con concurrencia y contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contexto moderado, y en RTX 3090/4080 con cuantización; en GPUs de 8-12 GB requiere cuantización a 4 bits.
- Opciones de despliegue: al ser compatible con la arquitectura Llama y pesos safetensors, es desplegable con vLLM, TGI, llama.cpp, Ollama y transformers; no se documentan recetas oficiales en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Licencia | Idiomas |
|---|---|---|---|---|---|
| Marin 8B Base | 8,03B | no disponible | 12,7T | Apache 2.0 | inglés |
| Llama 3.1 8B | 8,03B | 128K | no disponible en la información | Llama 3.1 Community License | multilingüe |
| OLMo 2 7B | ~7B | no disponible en la información | no disponible en la información | Apache 2.0 | inglés |
| Qwen2.5 7B | ~7,6B | 128K | no disponible en la información | Apache 2.0 (mayoría de variantes) | multilingüe |

La comparación se limita a parámetros, licencia e idioma, ya que no se dispone de resultados de benchmarks de Marin 8B Base en la información proporcionada. Frente a Llama 3.1 8B y Qwen2.5 7B, Marin destaca por un presupuesto de entrenamiento declarado de 12,7T tokens y por la publicación de checkpoints intermedios, pero carece de la cobertura multilingüe y del contexto extendido documentado de sus competidores.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en inglés: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Al ser un modelo base, no está alineado: puede generar contenido sesgado, tóxico o factualmente incorrecto sin filtros de seguridad.
- Riesgo de alucinación inherente a los modelos de lenguaje; la ausencia de RLHF agrava la probabilidad de respuestas plausibles pero falsas.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin validación empírica previa.
- La model card advierte de que el checkpoint `main` puede cambiar en el futuro (actualmente apunta a `deeper-starling`); para reproducibilidad debe fijarse la revisión con el argumento `revision`.
- Se han eliminado 32 checkpoints intermedios (aproximadamente 1,03 TB) el 3 de noviembre de 2026; quedan 44 disponibles, lo que limita la reproducibilidad de experimentos que dependieran de los eliminados.
- El repositorio ocupa 1.413,3 GB, lo que exige planificación de almacenamiento y ancho de banda para su descarga.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero los datasets subyacentes conservan sus licencias originales (por ejemplo, CC-BY-SA 4.0 para el cuarto dataset de la lista), lo que conviene revisar si se redistribuyen datos derivados.
- No se documentan evaluaciones de sesgo, seguridad ni robustez adversarial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marin-community/marin-8b-base
- Proyecto Marin: https://marin.community
- Dataset Nemotron-CC: https://data.commoncrawl.org/contrib/Nemotron/Nemotron-CC/index.html
- Dataset DCLM Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset Starcoder Data: https://huggingface.co/datasets/bigcode/starcoderdata
- Dataset Proofpile 2: https://huggingface.co/datasets/EleutherAI/proof-pile-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Dolma: https://huggingface.co/datasets/allenai/dolma
- Dataset MegaWika: https://huggingface.co/datasets/hltcoe/megawika
- Dataset peS2o: https://huggingface.co/datasets/allenai/peS2o
- Dataset Dolmino-Mix-1124: https://huggingface.co/datasets/allenai/dolmino-mix-1124
- Dataset StackExchange markdownificado: https://huggingface.co/datasets/marin-community/stackexchange-markdown
- Dataset Wikipedia markdownificado: https://huggingface.co/datasets/marin-community/wikipedia-markdown
- Dataset Ar5iv (No Problem): https://huggingface.co/datasets/marin-community/ar5iv-noproblem-markdown
- Dataset Ar5iv (Warnings): https://huggingface.co/datasets/marin-community/ar5iv-warning-markdown
- Dataset Datashop Science QA: https://huggingface.co/datasets/marin-community/datashop-science-qa
- Paper FLAN: https://arxiv.org/abs/2109.01652
- Paper CodeSearchNet: https://arxiv.org/abs/1909.09436
- Paper GSM8K: https://arxiv.org/pdf/2110.14168v1
- Paper MetaMath: https://arxiv.org/abs/2309.12284
- Paper MathCoder2: https://arxiv.org/abs/2310.03731
- Paper Llama: https://arxiv.org/abs/2302.13971
- Paper sobre markdownificación de datos: https://arxiv.org/abs/2410.05192
- Paper sobre mezcla de datos de entrenamiento: https://arxiv.org/abs/2412.02595
