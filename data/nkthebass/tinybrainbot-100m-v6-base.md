# nkthebass/tinybrainbot-100m-v6-base

## Resumen

TinyBrainBot-100M-v6-Base es un modelo de lenguaje base de 100,09 millones de parametros entrenado desde cero por el usuario independiente nkthebass. Se distribuye como un `LlamaForCausalLM` estandar de la libreria Transformers, sin codigo personalizado, lo que facilita su integracion en cualquier infraestructura que ya soporte la familia Llama. Es la continuacion de TinyBrainBot-100M-v5.1-Base, al que se le anadieron 10.000 millones de tokens adicionales de texto web general hasta alcanzar un total de 39.600 millones de tokens de entrenamiento.

El modelo emplea una arquitectura transformer densa con 12 capas, dimension oculta de 768, atencion con 12 cabezas de consulta y 4 cabezas KV (GQA), SwiGLU con dimension intermedia de 2048, RMSNorm y RoPE. Su vocabulario es de 32.000 tokens SentencePiece y la longitud de contexto es de tan solo 1.024 tokens, una ventana muy reducida que condiciona sus casos de uso.

Su relevancia reside en el segmento de modelos pequenos (SLM) entrenados desde cero con licencia Apache 2.0, donde compite con alternativas como SmolLM2-135M o MobileLLM-R1-140M. Segun los datos declarados por el autor, mejora a su version anterior en todas las tareas del Open SLM Leaderboard y alcanza un Intelligence Index de 29,26, por debajo de KLM-1.6 (33,95) y GPT-X3-150M (33,05) pero por encima de SmolLM2-135M (27,13) y GPT-2 (13,58).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (`LlamaForCausalLM`), 12 capas, hidden 768, 12 cabezas de consulta de 64 con 4 cabezas KV (GQA), SwiGLU 2048, RMSNorm, RoPE |
| Parametros totales | 100.092.672 (75,5M no-embedding + 24,6M embedding atado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | GGUF en F16 (201 MB), Q8_0 (107 MB) y Q4_K_M (66 MB); pesos originales en safetensors |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) y GGUF (llama.cpp, LM Studio, Ollama, Jan) |
| Vocabulario | 32.000 tokens SentencePiece; el salto de linea es un token propio |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la configuracion clasica de Llama: 12 capas, 768 dimensiones ocultas, atencion multi-cabeza con query grouping (12 cabezas de consulta de 64 dimensiones y 4 cabezas KV, es decir, GQA con ratio 3:1), capa feed-forward SwiGLU de 2.048 dimensiones, normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). El embedding de entrada esta atado al de salida (tied embedding), lo que explica que 24,6 de los 100,09 millones de parametros correspondan a la matriz de vocabulario. El vocabulario SentencePiece de 32.000 tokens trata el salto de linea como token independiente, un detalle que afecta al formateo de prompts en inferencia.

El entrenamiento acumula 39.600 millones de tokens: los 29.600 millones de la version v5.1 mas una ejecucion adicional de 10.000 millones. En esa segunda fase se recalentó la tasa de aprendizaje durante 300 pasos hasta 6e-4, se mantuvo durante 8.000 millones de tokens de texto masivo y se decayo a cero sobre una mezcla final de 2.000 millones de tokens densa en conocimiento. La mezcla de la fase masiva incluye ClimbMix (38%), DCLM-Ultra (27%), matematicas de OpenMathInstruct-2, UltraData-Math, FineMath y Orca-Math (5%), ejercicios aritmeticos propios (3%), FineWeb-Edu de alta puntuacion (6%), libros de Gutenberg y BookCorpus (6%), textos escolares de Cosmopedia y WikiHow (6%), pares pregunta-respuesta de GooAQ, FactBase-DCLM y finephrase (5%) y Wikipedia (4%). Los pesos publicados corresponden al paso final 151.147 de esa ejecucion, no a una media de checkpoints ni a una seleccion entre ellos. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion, coherente con su naturaleza de modelo base.

## Capacidades

- Generacion de texto autoregresiva en ingles: continuacion de texto, completado de parrafos y redaccion de pasajes cortos.
- Razonamiento basico de sentido comun y respuesta a preguntas de opcion multiple en formato zero-shot (ARC-Easy, ARC-Challenge, HellaSwag, PIQA).
- Aritmetica en formatos familiares: el modelo declara 51,60 en ArithMark-3.0, aunque el propio autor advierte que en problemas aritmeticos con temas y enunciados no vistos baja a 37,0 sobre 1.380 problemas retenidos.
- Conocimiento factual y de cultura general derivado de Wikipedia, GooAQ, FactBase-DCLM y finephrase.
- Capacidad multilingue: no disponible; el modelo solo declara ingles.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; es un modelo base sin entrenamiento de instrucciones ni de uso de herramientas.
- Modo de pensamiento (thinking), vision o audio: no disponible; el modelo es exclusivamente de texto.
- Conversacion: no soportada de forma nativa; el autor indica explicitamente que es un modelo base que continua texto y no conversa.

## Casos de uso

- Generacion de texto de relleno y prototipado rapido: con solo 66 MB en Q4_K_M, el modelo puede ejecutarse en cualquier portatil para generar parrafos de prueba en pipelines de desarrollo sin depender de APIs externas.
- Investigacion sobre entrenamiento desde cero de SLM: sirve como referencia reproducible para estudiar el efecto de mezclas de datos (ClimbMix, DCLM-Ultra, FineWeb-Edu) y de estrategias de recalentamiento de la tasa de aprendizaje en modelos de 100M de parametros.
- Evaluacion comparativa en el Open SLM Leaderboard: su tamano y licencia Apache 2.0 lo hacen util como baseline en experimentos academicos que comparan arquitecturas pequenas frente a SmolLM2-135M, MobileLLM-R1-140M o KLM-1.6.
- Completado de texto en aplicaciones embebidas: gracias a las cuantizaciones GGUF de 66 a 201 MB, puede integrarse en dispositivos con recursos limitados para autocompletar frases o sugerir continuaciones en editores ligeros.
- Generacion de preguntas y respuestas de cultura general: su mezcla de entrenamiento incluye GooAQ y FactBase-DCLM, por lo que puede producir pares pregunta-respuesta sencillos para aumentar datasets de entrenamiento de modelos mayores.
- Filtrado y clasificacion ligera de texto: con prompts de continuacion bien disenados puede puntuar la verosimilitud de frases, util para deduplicacion o control de calidad en corpus, siempre limitado por su ventana de 1.024 tokens.
- Educacion y demostraciones docentes: su reducido tamano permite mostrar en clase el funcionamiento interno de un transformer Llama completo, incluyendo tokenizacion SentencePiece y decodificacion greedy, sin necesidad de hardware especializado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (zero-shot, conjuntos de test completos, `acc_norm`; la precision bruta entre parentesis). La columna Intelligence Index procede del Open SLM Leaderboard. Los datos de otros modelos son los que el autor cita de dicha clasificacion a fecha 2026-11-23.

| Modelo | Parametros | Intelligence Index | HellaSwag | ARC-E | ARC-C | PIQA | ArithMark-3 |
|---|--:|--:|--:|--:|--:|--:|--:|
| TinyBrainBot-100M-v6-Base | 100,1M | 29,26 | 37,54 | 58,08 | 35,84 | 68,88 | 51,60 |
| TinyBrainBot-100M-v5.1-Base | 100,1M | 26,07 | 34,98 | 57,15 | 34,47 | 67,52 | 47,00 |
| KLM-1.6 | 99,0M | 33,95 | 45,28 | 61,07 | 33,53 | 70,18 | 55,90 |
| GPT-X3-150M | 149M | 33,05 | 46,16 | 59,64 | 31,31 | 71,33 | 50,90 |
| KLM-1.5 | 99,0M | 30,26 | 43,74 | 59,68 | 32,68 | 68,55 | 48,20 |
| SmolLM2-135M | 135M | 27,13 | 43,22 | 58,63 | 29,69 | 68,44 | 39,20 |
| MobileLLM-R1-140M-base | 140M | 24,64 | 33,84 | 49,92 | 24,74 | 63,22 | 65,70 |
| void.1 | 90,2M | 24,38 | 39,46 | 49,32 | 29,35 | 67,19 | 43,70 |
| Supra2-100M-Base | 101M | 19,41 | 35,98 | 47,81 | 24,83 | 65,40 | 36,90 |
| GPT-2 | 124M | 13,58 | 31,26 | 39,35 | 22,35 | 62,08 | 35,70 |

Precision bruta (`acc`) del modelo en las mismas tareas: HellaSwag 32,33; ARC-E 65,03; ARC-C 33,79; PIQA 68,77; ArithMark-3 51,60. El autor advierte que en 1.380 problemas aritmeticos retenidos con temas y enunciados no vistos el modelo obtiene 37,0, por lo que la cifra de ArithMark-3 debe interpretarse como aritmetica en formatos familiares y no como habilidad matematica general. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en F16 (201 MB de pesos), 0,11 GB en Q8_0 y 0,07 GB en Q4_K_M; a ello hay que sumar el overhead del runtime y la cache KV, despreciable con contexto de 1.024 tokens.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe holgadamente en una RTX 3060, RTX 4060, RTX 4090 o incluso en GPUs integradas. En A100 o H100 el cuello de botella sera el lanzamiento de kernels, no la memoria.
- Cabe en GPU consumer: si, en practicamente todas, incluidas GPUs de portatil con 4 GB o menos. Tambien puede ejecutarse en CPU sin problema.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), llama.cpp, LM Studio, Ollama, Jan y text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio). Los GGUF estan configurados con `add_space_prefix=false`, por lo que el prompt crudo debe comenzar con un espacio para reproducir la salida greedy de Transformers.
- Latencia y throughput estimados: no disponible; el autor no publica mediciones. Por el tamano del modelo, se espera una latencia de pocos milisegundos por token en GPU consumer, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Intelligence Index | Licencia | Disponibilidad |
|---|--:|--:|--:|---|---|
| TinyBrainBot-100M-v6-Base | 100,1M | 1.024 | 29,26 | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| SmolLM2-135M | 135M | no disponible en la informacion proporcionada | 27,13 | no disponible en la informacion proporcionada | Hugging Face |
| MobileLLM-R1-140M-base | 140M | no disponible en la informacion proporcionada | 24,64 | no disponible en la informacion proporcionada | Hugging Face |
| GPT-2 | 124M | 1.024 | 13,58 | no disponible en la informacion proporcionada | Hugging Face |

Frente a SmolLM2-135M, TinyBrainBot-100M-v6-Base es un 26% mas pequeno y obtiene un Intelligence Index superior (29,26 frente a 27,13), aunque SmolLM2-135M le supera en HellaSwag (43,22 frente a 37,54) y PIQA (68,44 frente a 68,88, practicamente empatados). Frente a MobileLLM-R1-140M-base, el modelo de nkthebass gana en el indice global y en HellaSwag, ARC-E y PIQA, pero pierde claramente en aritmetica (51,60 frente a 65,70 en ArithMark-3). Frente a GPT-2, de tamano comparable, la mejora es sustancial en todas las tareas evaluadas. La ventaja principal de TinyBrainBot-100M-v6-Base es su licencia Apache 2.0 explicita y la disponibilidad de GGUF en tres cuantizaciones, aunque su contexto de 1.024 tokens es muy limitado frente a los modelos modernos.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene conversaciones; el autor lo indica explicitamente. Cualquier uso conversacional requiere fine-tuning adicional.
- Ventana de contexto de solo 1.024 tokens, insuficiente para documentos largos, conversaciones multi-turno o tareas de RAG con contexto extenso.
- Solo soporta ingles; no se declara ni se evalua capacidad multilingue.
- Riesgo elevado de alucinacion: con 100M de parametros y 39.600 millones de tokens de entrenamiento, el conocimiento factual es limitado y puede inventar datos con fluidez.
- Brecha entre aritmetica en formato familiar y general: 51,60 en ArithMark-3 frente a 37,0 en problemas retenidos con enunciados no vistos, segun el propio autor.
- Sesgos conocidos: no disponible; el autor no documenta evaluaciones de sesgo, toxicidad ni seguridad.
- Sin alineacion: no se menciona RLHF, DPO ni filtrado de seguridad, por lo que puede generar contenido inapropiado si se usa sin moderacion.
- Detalle de tokenizacion: el salto de linea es un token propio y los GGUF usan `add_space_prefix=false`, lo que exige comenzar los prompts crudos con un espacio para reproducir la salida de Transformers; ignorarlo degrada la coherencia.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el modelo se distribuye sin garantias y el autor no ofrece soporte.
- Sin datos publicos de benchmarks estandar (MMLU, GSM8K, HumanEval): las cifras disponibles se limitan a las cinco tareas declaradas en la model card y no han sido verificadas de forma independiente (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-100m-v6-base
- Version anterior: https://huggingface.co/nkthebass/tinybrainbot-100m-v5.1-base
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset DCLM-Ultra: https://huggingface.co/datasets/ArrowLabs/DCLM-Ultra
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Orca-Math: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
