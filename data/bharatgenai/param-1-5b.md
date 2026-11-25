# bharatgenai/Param-1-5B

## Resumen

Param-1-5B es un modelo de lenguaje de 5.000 millones de parametros desarrollado por BharatGen, una iniciativa india centrada en modelos fundacionales multilingues. Se trata de un transformer decoder-only denso, preentrenado desde cero, que forma parte de la familia Param-1 y extiende al Param-1-2.9B incorporando capacidades reforzadas de razonamiento matematico y comprension y generacion de codigo. El modelo es bilingue ingles-hindi y esta pensado como base (modelo preentrenado, no ajustado para instrucciones) sobre la que construir tareas downstream.

La relevancia del modelo radica en su enfoque: es uno de los pocos modelos abiertos de escala media entrenados explicitamente con un corpus masivo en hindi (2,77 billones de tokens) y con un volumen significativo de datos de matematicas y codigo (238.400 millones de tokens). Su ventana de contexto es de 4.096 tokens y emplea atencion grouped-query con RoPE, lo que lo situa en la linea de arquitecturas modernas eficientes para inferencia.

El entrenamiento se realizo con NVIDIA NeMo sobre 1.024 GPU H100 en la infraestructura Yotta Shakti Cloud, consumiendo un total de 6,61 billones de tokens. El modelo se distribuye en formato transformers (safetensors) con licencia Apache 2.0, aunque la model card indica "license: other" en metadatos, remitiendo al fichero LICENSE del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | ~5B |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 4.096 tokens (max position embedding) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | Ingles (en) e hindi (hi) |
| Licencia | Apache 2.0 (metadatos HF indican "other"; ver LICENSE y NOTICE del repo) |
| Formato de pesos | safetensors (transformers, requiere trust_remote_code=True) |

Otras especificaciones de arquitectura: hidden size 4096, intermediate size 14336, 16 capas, 32 cabezas de atencion, 8 cabezas key-value (GQA), activacion SiLU, embeddings posicionales rotatorios (RoPE), precision de entrenamiento bf16-mixed.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only clasica con atencion grouped-query (32 cabezas de query frente a 8 cabezas key-value), lo que reduce el coste de memoria del KV cache durante la inferencia. Usa RoPE para codificacion posicional, activacion SiLU y una capa FFN con dimension intermedia de 14336. La profundidad es comparativamente baja (16 capas) para un modelo de 5B, lo que sugiere un diseno orientado a throughput y eficiencia de inferencia mas que a profundidad.

El preentrenamiento se realizo con NVIDIA NeMo sobre 1.024 GPU NVIDIA H100 en Yotta Shakti Cloud, con un total de 6,61 billones de tokens. La composicion del corpus es: 3,6 billones de tokens de lenguaje natural en ingles, 2,77 billones en hindi y 238.400 millones de tokens de matematicas y codigo (40% matematicas, 60% codigo). No se documenta en la informacion disponible si hubo fases de RLHF, DPO o ajuste por instrucciones; el modelo se presenta explicitamente como base preentrenada (PT).

## Capacidades

- Generacion de texto autoregresiva en ingles e hindi.
- Razonamiento matematico basico y resolucion de problemas aritmeticos y algebraicos, reforzado respecto a Param-1-2.9B mediante datos dedicados de matematicas.
- Comprension y generacion de codigo, con 60% del bloque de datos especializados dedicado a codigo.
- Capacidad bilingue ingles-hindi, con volumen de datos en hindi muy superior al de la mayoria de modelos abiertos de escala similar.
- Modelo base: no incluye por defecto capacidades de seguimiento de instrucciones, tool calling ni modo de razonamiento explicito (thinking mode); estas requeririan ajuste fino posterior.
- Soporte de agentes y multi-step reasoning: no disponible de forma nativa en el modelo preentrenado.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Ajuste fino para asistente conversacional en hindi: al disponer de 2,77 billones de tokens en hindi, el modelo sirve como base solida para SFT orientado a atencion al cliente o asistentes domesticos en hindi e ingles, partiendo de un conocimiento linguistico ya adquirido en preentrenamiento.
- Generacion de codigo en produccion tras fine-tuning: el bloque de 238.400 millones de tokens con 60% de codigo permite adaptar el modelo a autocompletado, generacion de funciones y explicacion de codigo en pipelines de desarrollo, con un coste computacional inferior al de modelos de mayor escala.
- Tutoria matematica automatizada: el refuerzo en datos de matematicas lo hace adecuado como base para sistemas de resolucion paso a paso de problemas escolares, previo ajuste fino con datos de razonamiento encadenado.
- Traduccion ingles-hindi y adaptacion cultural: el modelo puede usarse como base para sistemas de traduccion o reescritura bilingue, especialmente en dominios donde el hindi coloquial o tecnico requiere vocabulario especifico.
- Generacion aumentada por recuperacion (RAG) en hindi: con 4.096 tokens de contexto, puede integrarse en pipelines RAG para responder sobre documentacion en hindi, aunque la ventana es limitada para documentos extensos.
- Investigacion academica sobre modelos multilingues de escala media: sirve como punto de comparacion reproducible (pesos abiertos, Apache 2.0) frente a modelos occidentales en estudios sobre calidad en idiomas de bajos recursos.
- Preentrenamiento continuado en dominios verticales indios: al ser un modelo base, puede continuarse el preentrenamiento con corpus legales, medicos o agricolas en hindi para especializarlo.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion few-shot salvo indicacion):

| Tarea | Param-1-5B (PT) |
|---|---|
| ARC Challenge | 55,1 |
| ARC Easy | 75,6 |
| HellaSwag | 76,0 |
| HellaSwag Hi | 44,6 |
| MMLU En | 50,8 |
| MMLU Hi | 39,1 |
| TriviaQA | 48,2 |
| TruthfulQA Gen | 32,9 |
| TruthfulQA MC1 | 27,1 |
| TruthfulQA MC2 | 38,6 |
| PIQA | 79,6 |
| SuperGLUE BoolQ | 72,7 |
| SuperGLUE WiC | 50,5 |
| SuperGLUE WSC | 48,1 |
| SuperGLUE RTE | 65,0 |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni otros benchmarks de codigo o matematicas, pese al enfasis del modelo en esos dominios. La caida de MMLU en hindi (39,1) frente a ingles (50,8) y de HellaSwag Hi (44,6) frente a HellaSwag (76,0) refleja la brecha de rendimiento entre idiomas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 10-11 GB solo para pesos, mas KV cache; con 4.096 tokens de contexto y GQA (8 cabezas KV) el cache es moderado, por lo que 16 GB cubren escenarios de contexto corto a medio.
- VRAM estimada con cuantizacion int8 (si se generan pesos): alrededor de 5-6 GB; en int4, alrededor de 3-4 GB. No se publican pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para entrenamiento o inferencia a gran escala; L40S o RTX 6000 Ada para despliegue por lotes.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 con margen, y en RTX 3090/4080 (16-24 GB) en bf16 o int8 segun longitud de contexto.
- Opciones de despliegue: transformers (requiere trust_remote_code=True), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no se distribuyen GGUF oficiales).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Param-1-5B | ~5B | 4.096 | en, hi | Apache 2.0 | Base PT, enfasis en hindi y math/code |
| Param-1-2.9B (misma familia) | ~2,9B | no disponible | en, hi | Apache 2.0 | Predecesor; menos math/code |
| Qwen2.5-3B / 7B | 3B / 7B | 32.768 (7B) | multilingue amplio | Apache 2.0 | Mayor contexto y multilingualidad |
| Llama 3.2-3B | 3B | 131.072 | multilingue | Llama Community License | Mayor contexto; hindi menos representado |

Los datos de rendimiento de los modelos comparables no se incluyen aqui por no estar en la informacion proporcionada; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no sigue instrucciones de forma fiable sin ajuste fino (SFT) previo.
- Brecha notable entre idiomas: MMLU Hi (39,1) frente a MMLU En (50,8); HellaSwag Hi (44,6) frente a HellaSwag (76,0).
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinacion y de reproducir sesgos presentes en datos web y de codigo a gran escala.
- Rendimiento variable en dominios hindi de bajos recursos, segun advierte la propia model card.
- Metadatos de licencia inconsistentes: la model card y los badges indican Apache 2.0, pero el campo de licencia de Hugging Face figura como "other". Conviene revisar LICENSE y NOTICE antes de uso comercial, y respetar las reglas de atribucion y naming de BharatGen.
- Requiere trust_remote_code=True en transformers, lo que implica ejecutar codigo remoto del autor; auditar antes de desplegar en produccion.
- No se distribuyen pesos cuantizados oficiales ni resultados de benchmarks en matematicas y codigo, pese al enfasis del modelo en esos dominios.

## Enlaces

- Hugging Face: https://huggingface.co/bharatgenai/Param-1-5B
- Web oficial de BharatGen: https://bharatgen.com
- Politica de licencia y naming: https://bharatgen.com/licence/#names
- Licencia Apache 2.0 (referencia): https://www.apache.org/licenses/LICENSE-2.0
- Fichero LICENSE del repositorio: https://huggingface.co/bharatgenai/Param-1-5B/blob/main/LICENSE
- Fichero NOTICE del repositorio: https://huggingface.co/bharatgenai/Param-1-5B/blob/main/NOTICE
- Modelo predecesor (familia Param-1): https://huggingface.co/bharatgenai/Param-1-2.9B-Instruct
