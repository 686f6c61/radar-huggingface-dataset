# AxiomicLabs/GPT-S-5M

## Resumen

GPT-S-5M es un modelo de lenguaje base de tipo decoder-only desarrollado por AxiomicLabs, con 5.158.464 parámetros (aproximadamente 5,16 millones) y entrenado desde cero sobre 25.000 millones de tokens. Se presenta como el primer miembro de la familia GPT-S de modelos pequenos y estrena la arquitectura propietaria T-X3, que combina codificacion posicional RoPE, normalizacion RMSNorm, feed-forward SwiGLU y una atencion denominada Exclusive Grouped-query attention (XGQA) con 6 cabezas de consulta y 2 cabezas clave/valor. El tokenizador tambien es propio, con un vocabulario de 4.096 entradas.

El modelo resuelve el caso de uso de investigacion y experimentacion con modelos de escala minima: permite entrenar, evaluar y desplegar un transformer completo en hardware trivial, incluido CPU, y sirve como banco de pruebas para tecnicas de arquitectura, tokenizacion y mezclas de datos. Su ventana de contexto es de solo 512 tokens y esta entrenado exclusivamente en ingles, por lo que no es apto para productos conversacionales ni para tareas que requieran conocimiento factual amplio.

Es relevante ahora porque se posiciona en la categoria de modelos de menos de 10 millones de parametros con resultados de benchmark por encima de alternativas mas grandes, como pythia-31m de EleutherAI, segun la propia evaluacion del autor. Ademas, se publica bajo licencia Apache 2.0, lo que elimina fricciones para uso comercial o derivados. La model card indica que existe una version posterior en la familia, AxiomicLabs/GPT-S3-3M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia T-X3; RoPE (theta=2.500), RMSNorm, SwiGLU, Exclusive Grouped-query attention (XGQA) con 6 cabezas de consulta y 2 cabezas KV |
| Parametros totales | 5.158.464 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (block_size) |
| Tipos de cuantizacion | No disponible (no se publican cuantizaciones GGUF, AWQ ni GPTQ; los pesos se distribuyen en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code y custom_code) |

Datos de configuracion adicionales: vocab_size = 4.096, hidden_size = 192, num_layers = 9, num_heads = 6, num_kv_heads = 2, head_dim = 32, intermediate = 672, rope_theta = 2.500. Los embeddings estan atados (weight tied).

## Arquitectura y entrenamiento

GPT-S-5M es un transformer decoder-only de 9 capas con dimension oculta de 192 y capa intermedia de 672. La model card lo describe como la primera generacion de la arquitectura T-X3 de AxiomicLabs. Usa RoPE con theta de 2.500 para la codificacion posicional, RMSNorm como normalizacion, SwiGLU en el bloque feed-forward y atencion Exclusive Grouped-query attention (XGQA) con una relacion de 3:1 entre cabezas de consulta y cabezas KV (6 frente a 2), lo que reduce el coste de cache KV. Los embeddings de entrada y la cabeza de salida comparten pesos. Las etiquetas del repositorio incluyen tambien el termino "xsa", que la tabla de arquitectura no define.

El entrenamiento consumio 25.000 millones de tokens sobre una mezcla de tres fuentes: FineWeb-Edu al 55% (texto web educativo), Cosmopedia v2, distribuido a traves del corpus HuggingFaceTB/smollm-corpus, al 30% (material sintetico con formato de libro de texto) y FineWeb-HQ al 15% (texto web de mayor calidad). Se uso el optimizador AdamW con betas 0.9/0.95, weight decay 0.01, learning rate maximo de 2,5e-3, schedule warmup-stable-decay con 1.500 pasos de calentamiento y decaimiento a partir del 70% del entrenamiento, batch total de 262.144 tokens (microbatch de 128 secuencias de 512 tokens con 4 pasos de acumulacion de gradiente), clipping de gradiente de 1.0 y autocast en bfloat16. No se documenta ninguna fase de ajuste por instrucciones, RLHF ni DPO: es un modelo estrictamente base.

## Capacidades

- Generacion de texto autoregresiva en ingles: continuacion de prompts, completado de fragmentos y generacion libre con temperatura y top-p configurables.
- Modelado de lenguaje a nivel de token y frase: obtiene 72,21% en BLiMP, la puntuacion mas alta de su grupo de comparacion, lo que indica cierta competencia en juicios de gramaticalidad.
- Razonamiento aritmetico muy limitado: 31,5% en Arithmark, propio de un modelo de esta escala.
- Comprension lectora y sentido comun elemental: 57,13% en PIQA, 27,39% en Hellaswag y 33,16% en ARC easy.
- No soporta tool calling ni function calling: es un modelo base sin plantilla de chat ni ajuste para uso de herramientas.
- No soporta agentes ni razonamiento multi-paso: sin entrenamiento instructivo ni modo de pensamiento (thinking mode).
- Capacidades multilingues practicamente nulas: el entrenamiento y la evaluacion se limitan al ingles.
- Sin capacidades de vision, audio ni multimodalidad.
- Tokenizador propio de 4.096 entradas, que requiere cargar codigo remoto del repositorio (trust_remote_code=True).

## Casos de uso

- Investigacion en arquitecturas eficientes: sirve como banco de pruebas reproducible para medir el efecto de RoPE, RMSNorm, SwiGLU y variantes de atencion agrupada en un modelo de 5M de parametros, con un coste de entrenamiento de 25B tokens asumible en pocas GPU.
- Experimentacion con mezclas de datos: la receta documentada (55% FineWeb-Edu, 30% Cosmopedia v2, 15% FineWeb-HQ) puede replicarse o alterarse para estudiar como cambian las metricas BLiMP o PIQA con corpus educativos frente a corpus web genericos.
- Ensenanza y divulgacion: al caber en CPU y en cualquier GPU consumer, permite ejecutar un transformer completo en un portatil durante una clase o taller sin infraestructura especial.
- Pruebas de pipelines de inferencia: util para validar integraciones con transformers, control de versiones de safetensors, carga con custom_code y cuantizacion casera antes de escalar a modelos mayores.
- Generacion de texto de relleno o sintetico: puede producir continuaciones plausibles a nivel gramatical para pruebas de carga, maquetacion o datos de ejemplo, asumiendo que el contenido no sera fiable factualmente.
- Baseline para comparativas internas: cualquier equipo que entrene un modelo pequeno desde cero puede usarlo como referencia en Hellaswag, ARC, PIQA, Arithmark y BLiMP con el arnes de evaluacion del autor.
- Ajuste fino sobre dominio acotado: dado el tamano, es viable hacer fine-tuning completo sobre una unica GPU para tareas muy concretas de clasificacion de texto o generacion de plantillas en ingles, siempre que no se requiera contexto largo.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados en bf16 con un arnes interno inspirado en EleutherAI/lm-eval-harness, zero-shot y con exactitud normalizada cuando esta disponible.

| Modelo | Hellaswag | ARC (easy) | PIQA | Arithmark | BLiMP | Promedio |
|---|---|---|---|---|---|---|
| GPT-S-5M (Axiomic Labs) | 27,39% | 33,16% | 57,13% | 31,5% | 72,21% | 44,28% |
| pythia-31m (EleutherAI) | 27,14% | 33,88% | 56,26% | 29,44% | 67,78% | 42,90% |
| pythia-14m (EleutherAI) | 26,20% | 32,28% | 55,88% | 28,06% | 66,75% | 41,83% |
| Spark-5M-Base-v4 (LH-Tech-AI) | 27,03% | 33,21% | 53,43% | 32,70% | 62,17% | 41,71% |
| Supra-Mini-v5-8M (SupraLabs) | 26,38% | 33,33% | 54,03% | 27,30% | 63,83% | 40,97% |
| Supra-Mini-v4-2M (SupraLabs) | 25,52% | 30,98% | 51,90% | 29,72% | 60,57% | 39,74% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de tareas generativas en la informacion disponible. Las cifras corresponden al propio arnes del autor, por lo que la comparacion entre modelos de distintos fabricantes debe tomarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 los 5,16M de parametros ocupan aproximadamente 10 MB; en float32, unos 21 MB. La cache KV es despreciable a 512 tokens de contexto.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una GTX 1050 Ti o superior; tambien funciona en Apple Silicon via MPS y en CPU pura.
- Cabe sobradamente en GPU consumer: si, en cualquier modelo actual, incluso en graficas integradas, y tambien en Raspberry Pi o en un movil moderno con suficiente memoria.
- Opciones de despliegue: transformers con AutoModelForCausalLM y trust_remote_code=True es la ruta documentada. No se publican pesos GGUF, por lo que no hay integracion directa con llama.cpp ni Ollama; vLLM y TGI no estan verificados con arquitecturas personalizadas de este tipo y requeririan trabajo de adaptacion.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Promedio en el arnes del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-S-5M | 5,16M | 512 tokens | 44,28% | Apache 2.0 | HuggingFace, transformers con custom_code |
| pythia-31m (EleutherAI) | 31M | 2.048 tokens (segun la familia Pythia) | 42,90% | Apache 2.0 | HuggingFace, transformers estandar |
| pythia-14m (EleutherAI) | 14M | 2.048 tokens (segun la familia Pythia) | 41,83% | Apache 2.0 | HuggingFace, transformers estandar |
| Spark-5M-Base-v4 (LH-Tech-AI) | 5M (aproximado) | No disponible | 41,71% | No disponible | HuggingFace |
| Supra-Mini-v5-8M (SupraLabs) | 8M (aproximado) | No disponible | 40,97% | No disponible | HuggingFace |

La ventaja declarada por el autor es que GPT-S-5M supera a modelos hasta seis veces mas grandes en el promedio del conjunto evaluado, con la salvedad de que solo se comparan cifras del mismo arnes interno. Frente a la familia Pythia, que es la referencia abierta mas establecida en esta escala, GPT-S-5M gana en PIQA y BLiMP pero pierde en ARC easy y no alcanza la ventana de contexto de 2.048 tokens de Pythia. Los datos de licencia y contexto de los modelos competidores mas pequenos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue ordenes, no mantiene formato conversacional y no responde a plantillas de chat.
- Capacidad factual muy limitada: con 5M de parametros y 25B tokens, la cantidad de conocimiento almacenado es minima y el riesgo de alucinacion en cualquier pregunta factual es alto.
- Ventana de contexto de solo 512 tokens, insuficiente para documentos, conversaciones multi-turno largas o analisis de codigo.
- Entrenado unicamente en ingles: no hay soporte real de castellano ni de otros idiomas.
- Sesgos conocidos: no disponible. La model card no documenta analisis de sesgo, toxicidad ni composicion demografica, mas alla de la mezcla de datasets.
- El corpus de entrenamiento incluye material sintetico (Cosmopedia v2, 30%), lo que puede introducir artefactos estilisticos y errores factuales heredados del generador.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, pero al tratarse de un modelo sin garantias y con limitaciones severas de fiabilidad, no es apto para produccion en tareas sensibles.
- Requiere trust_remote_code=True y carga codigo personalizado del repositorio, lo que implica revisar el codigo antes de ejecutarlo en entornos con requisitos de seguridad estrictos.
- El repositorio pesa 0,0 GB segun los metadatos y no se listan cuantizaciones; la unica via de despliegue documentada es transformers.
- Existe una version posterior, AxiomicLabs/GPT-S3-3M, indicada en el campo new_version de la model card.
- Las metricas de benchmark proceden del arnes interno del autor y no han sido replicadas de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AxiomicLabs/GPT-S-5M
- Version posterior indicada por el autor: https://huggingface.co/AxiomicLabs/GPT-S3-3M
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM corpus (incluye Cosmopedia v2): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineWeb-HQ: https://huggingface.co/datasets/epfml/FineWeb-HQ
- Visualizador de arquitectura enlazado en la model card: https://hfviewer.com/AxiomicLabs/GPT-S-5M
- Arnes de evaluacion de referencia: https://github.com/EleutherAI/lm-evaluation-harness

No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos adicionales en la busqueda web realizada.
