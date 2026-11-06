# open-sci/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated-ar30k

## Resumen

El modelo `open-sci/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated-ar30k` es un ajuste fino supervisado (SFT) publicado por la organizacion open-sci sobre la base `ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated`. Se trata de un transformer decoder-only de aproximadamente 1.714 millones de parametros (1,7B) derivado de la familia Comma, entrenado originalmente sobre 300.000 millones de tokens y con una fase de SFT de contexto largo (16k) sobre datos de Tulu3 decontaminados. Este nuevo checkpoint anade una etapa adicional de SFT sobre el dataset AceReason-1.1-SFT-30k-sharegpt-hf, orientado a razonamiento.

El interes del modelo reside en su tamano compacto (1,7B), que permite desplegarlo en hardware de consumo, combinado con una ventana de contexto larga (16k) heredada de la base y un entrenamiento especifico en tareas de razonamiento. La model card es auto-generada por el Trainer de Hugging Face y no incluye descripcion funcional, casos de uso declarados ni resultados de evaluacion, por lo que la informacion disponible es limitada y debe interpretarse con cautela.

La licencia es "other", sin terminos explicitos publicados en la model card, lo que obliga a contactar con el autor o revisar el repositorio base antes de cualquier uso comercial. El pipeline declarado es `feature-extraction`, aunque el modelo es un causal LM entrenado con llama-factory y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Comma, base Llama-like) |
| Parametros totales | 1.714.377.728 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (heredado de la base, segun nombre del checkpoint) |
| Tipos de cuantizacion | no disponible en la model card; compatible con cuantizacion estandar (GGUF/AWQ/GPTQ) por ser transformers/safetensors |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no especificados) |
| Formato de pesos | safetensors (repo de 3,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1,7B parametros, derivado de la familia Comma de Ali Elganzory. La base `1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated` fue entrenada desde cero sobre 300.000 millones de tokens (segun el nombre del checkpoint), seguida de una fase de SFT de contexto largo a 16k tokens sobre datos de Tulu3 decontaminados. Este checkpoint concreto anade una etapa adicional de SFT completo (full fine-tuning, no LoRA) sobre el dataset AceReason-1.1-SFT-30k-sharegpt-hf, un conjunto de 30.000 ejemplos en formato ShareGPT orientado a razonamiento.

Los hiperparametros de entrenamiento declarados son: learning rate 4e-5, batch total de 128 (1 por dispositivo x 32 dispositivos x 4 pasos de acumulacion), 5 epocas, optimizador AdamW fused con betas (0,9; 0,999), scheduler coseno con warmup del 10% y seed 42. El entrenamiento se realizo con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2, usando llama-factory. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, MoE) en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en formato causal LM, aunque el pipeline declarado sea `feature-extraction`.
- Razonamiento de multiples pasos, reforzado por el SFT sobre AceReason-1.1-SFT-30k-sharegpt-hf.
- Contexto largo de hasta 16.384 tokens, util para documentos extensos y conversaciones multi-turno.
- Formato de entrenamiento ShareGPT, lo que facilita su uso en pipelines conversacionales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no documentadas explicitamente, aunque el dataset de SFT es de razonamiento.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Razonamiento sobre documentos largos: con 16k tokens de contexto, el modelo puede procesar informes, contratos o articulos cientificos completos y responder preguntas que requieran cruzar informacion entre secciones distantes.
- Asistente conversacional de dominio acotado: su formato ShareGPT y su tamano de 1,7B lo hacen adecuado para chatbots desplegados en una sola GPU de consumo, con latencia baja y coste reducido.
- Generacion de resumenes tecnicos: el entrenamiento en razonamiento permite sintetizar documentacion tecnica o transcripciones extensas manteniendo coherencia entre fragmentos.
- Prototipado rapido de pipelines de IA: al pesar 3,4 GB en safetensors, se puede cargar en entornos de desarrollo con una RTX 3060 de 12 GB en fp16 o en cuantizacion de 8 bits, acelerando iteraciones.
- Extraccion de caracteristicas y embeddings: el pipeline declarado es `feature-extraction`, por lo que puede usarse para obtener representaciones de texto en tareas de clasificacion o recuperacion semantica.
- Educacion y tutoria automatizada: el SFT sobre datos de razonamiento (AceReason) lo orienta a explicar pasos intermedios en problemas matematicos o logicos, aunque sin benchmarks publicados que confirmen su calidad.
- Evaluacion comparativa de tecnicas de SFT: util para investigadores que quieran medir el efecto de una etapa adicional de SFT de razonamiento sobre una base ya ajustada, al ser un checkpoint reproducible con hiperparametros documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor contiene una entrada (`sft__AceReason-1-1-SFT-30k-sharegpt-hf__1-7b-Comma0-b66d70fa__sdpa-open-sci-steps__1.7b-e35a8d93`) pero con la lista de resultados vacia, por lo que no hay datos de MMLU, HumanEval, GSM8K ni ninguna otra metrica.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-5 GB para secuencias cortas y mas para contexto de 16k.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,8-2 GB para pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): alrededor de 1 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4). Para contexto completo de 16k en fp16 se recomienda 12-16 GB.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en 4 bits cabe incluso en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp/Ollama (previa conversion a GGUF), vLLM y TGI (compatibles con arquitecturas Llama-like, aunque no verificados en la model card).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/1.7b-Comma0.1-...-ar30k (este) | 1,7B | 16k | other | Hugging Face, 16 descargas | SFT adicional sobre AceReason; sin benchmarks |
| ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated (base) | 1,7B | 16k | no disponible | Hugging Face | Base sin la etapa de razonamiento; sin benchmarks |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | Hugging Face, ampliamente usado | Modelo consolidado con benchmarks publicados; contexto mayor |
| Llama-3.2-1B-Instruct | 1,2B | 128k | Llama 3.2 Community License | Hugging Face, ampliamente usado | Contexto muy superior; restricciones de licencia para >700M usuarios |

La comparacion es cualitativa: no existen benchmarks publicados para este checkpoint ni para su base, por lo que no es posible afirmar superioridad o inferioridad en rendimiento frente a Qwen2.5-1.5B o Llama-3.2-1B. La principal ventaja de este modelo es su contexto de 16k en un tamano de 1,7B con entrenamiento especifico en razonamiento; su principal desventaja es la ausencia de evaluacion y de terminos de licencia claros.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre Tulu3 y AceReason, puede heredar sesgos de esos datasets, pero no hay analisis publicado.
- Riesgo de alucinacion: no evaluado; los modelos de 1,7B tienden a alucinar mas que modelos mayores, y no hay benchmarks que cuantifiquen este riesgo.
- Limitaciones de contexto o idioma: contexto de 16k tokens, inferior a alternativas como Llama-3.2-1B (128k) o Qwen2.5-1.5B (32k); los idiomas soportados no estan declarados, por lo que no se garantiza un buen rendimiento fuera del ingles.
- Restricciones de licencia: licencia "other" sin terminos publicados; no se puede asumir uso comercial permitido sin consultar al autor o al repositorio base.
- Caveat para produccion: la model card es auto-generada y no documenta usos previstos, limitaciones ni evaluacion; el pipeline declarado (`feature-extraction`) no coincide con el uso tipico de un causal LM, lo que puede requerir configuracion manual.
- El checkpoint tiene solo 16 descargas y 0 likes, lo que sugiere poca validacion por parte de la comunidad.
- No se especifica si el tokenizer es propio o heredado de Llama; la compatibilidad con herramientas estandar (llama.cpp, vLLM) no esta verificada.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated-ar30k
- Modelo base: https://huggingface.co/ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated
- Dataset de SFT: no disponible como enlace publico (ruta local `/gpfs/scratch/ehpc524/ot/datasets/AceReason-1.1-SFT-30k-sharegpt-hf` en la model card)
- Paper, blog o demo: no disponibles en la informacion proporcionada
- Repositorio de llama-factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
