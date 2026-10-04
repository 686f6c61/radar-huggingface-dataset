# Laguna198/OpenThinker3-7B

## Resumen

OpenThinker3-7B es un modelo de lenguaje de 7.000 millones de parámetros especializado en razonamiento, desarrollado por el equipo de Open Thoughts. Se construye mediante ajuste fino supervisado (SFT) completo sobre Qwen/Qwen2.5-7B-Instruct, utilizando el dataset abierto OpenThoughts3-1.2M. La ficha aquí analizada corresponde a la réplica publicada por el usuario Laguna198 en HuggingFace; el modelo original está alojado en la organización open-thoughts.

El modelo resuelve tareas de razonamiento matemático, generación y comprensión de código, y preguntas de ciencia a nivel de competición. Su relevancia radica en que alcanza resultados comparables o superiores a destilaciones de DeepSeek-R1 y a modelos propietarios de tamaño similar entrenados con refuerzo, pese a haberse entrenado únicamente con SFT y sin RL. Todo el pipeline de datos, el dataset y las trazas de razonamiento son abiertos, lo que permite reproducir y auditar el entrenamiento.

Arquitectónicamente hereda el transformer denso decoder-only de Qwen2, con 7B de parámetros, tokenizador multilingüe de Qwen2.5 y soporte nativo de conversación mediante plantilla de chat. La model card no declara modificaciones sobre la longitud de contexto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen2) |
| Parametros totales | 7B (aproximadamente 7.600 millones, heredados de Qwen2.5-7B-Instruct) |
| Longitud de contexto | No declarada por el autor; heredada del modelo base Qwen2.5-7B-Instruct (32.768 tokens nativos, extensible a 131.072 con YaRN) |
| Tipos de cuantizacion | No especificados por el autor; al ser pesos safetensors de un modelo Qwen2, son aplicables las cuantizaciones habituales (GGUF Q4_K_M, GPTQ, AWQ, bitsandbytes int8/int4) |
| Idiomas soportados | No disponible (el autor no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Dataset de entrenamiento | open-thoughts/OpenThoughts3-1.2M |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer denso decoder-only con atención causal completa, normalización RMSNorm, activaciones SwiGLU y RoPE. Sobre esta base se aplica un ajuste fino supervisado completo (no LoRA ni QLoRA) usando el framework LLaMA-Factory. Los hiperparámetros declarados son: learning rate 8e-05, scheduler coseno con warmup ratio 0,1, 5 épocas, batch total de 512, weight decay 0,0, semilla 42 y optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08. El entrenamiento se realizó en 512 dispositivos A100 durante 48 horas. Versiones de framework: Transformers 4.46.1, PyTorch 2.3.0, Datasets 3.1.0 y Tokenizers 0.20.3.

La pieza diferencial no es la arquitectura, sino el pipeline de datos. OpenThoughts3-1.2M contiene 850.000 preguntas de matemáticas, 250.000 de código y 100.000 de ciencia, con trazas de razonamiento generadas por QwQ-32B. La construcción del dataset se apoyó en más de 1.000 experimentos de ablación, y su selección es lo que explica el salto de rendimiento frente a OpenThinker-7B y OpenThinker2-7B. No se aplicó RLHF, DPO ni RL con verificación; todo el rendimiento procede de la destilación de trazas de razonamiento de un modelo mayor mediante SFT.

## Capacidades

- Razonamiento matemático de competición: resuelve problemas de tipo AIME, AMC, HMMT, MATH500 y JEEBench con cadenas de pensamiento largas.
- Generación y razonamiento sobre código: evaluado en LiveCodeBench, CodeElo y CodeForces, con capacidad de producir soluciones algorítmicas completas.
- Razonamiento científico: preguntas de nivel graduado en GPQA-D (física, química, biología).
- Generación de texto conversacional: la model card lo etiqueta como `conversational` y usa la plantilla de chat de Qwen2.5.
- Modo de razonamiento explícito: produce trazas de pensamiento paso a paso antes de la respuesta final, al estilo de los modelos de razonamiento destilados.
- Capacidades multilingües: no declaradas explícitamente por el autor; heredadas potencialmente del modelo base.
- Soporte de tool calling / function calling: no declarado en la model card.
- Soporte de agentes y razonamiento multi-paso: no declarado formalmente, aunque el formato de trazas largas es compatible con flujos multi-paso.
- Capacidades de visión o audio: no disponibles en este modelo (es exclusivamente texto).

## Casos de uso

- Tutoría STEM automatizada: el modelo puede descomponer un problema de cálculo o física en pasos intermedios verificables, lo que permite mostrar al estudiante el razonamiento completo y no solo la respuesta final. Su rendimiento en MATH500 (90,0) y JEEBench (72,4) lo hace adecuado para niveles preuniversitarios exigentes.
- Generación de código en asistentes de programación: con 51,7 en LiveCodeBench 06/24-01/25 y 32,2 en CodeForces, es viable como motor de autocompletado o resolución de katas algorítmicas dentro de un IDE, siempre que se ajuste la plantilla de chat.
- Generación de datos sintéticos de razonamiento: al estar entrenado sobre trazas de QwQ-32B, puede usarse como generador de cadenas de pensamiento para construir datasets de destilación más pequeños y específicos de dominio.
- Investigación reproducible en razonamiento: al ser Apache 2.0 y con dataset y paper públicos, sirve como línea base controlada para comparar técnicas de SFT frente a RL en modelos de 7B.
- Evaluación comparativa de modelos: es un candidato natural como referencia en harnesses como Evalchemy para medir modelos de razonamiento de 7B, dado que sus números cubren matemáticas, código y ciencia.
- Ajuste fino vertical sobre licencia permisiva: sectores regulados (legal, sanitario, financiero) pueden partir de estos pesos y especializarlos sin obligaciones de copyleft, al ser Apache 2.0.
- Resolución de problemas en pipelines batch: para clasificación compleja, extracción con razonamiento o verificación de respuestas donde se prioriza precisión sobre latencia, con procesamiento por lotes en vLLM.
- Motor de razonamiento para agentes de análisis de datos: puede encadenar pasos de interpretación de un enunciado, formulación de hipótesis y verificación numérica antes de emitir una conclusión.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, evaluados con la herramienta open source Evalchemy. El autor marca en negrita los valores que quedan dentro de dos errores estándar del mejor resultado de cada columna.

| Modelo | Datos abiertos | AIME24 | AIME25 | AMC23 | MATH500 | HMMT O2/25 | LCB 06/24-01/25 | CodeElo | CodeForces | GPQA-D | JEEBench |
|---|---|---|---|---|---|---|---|---|---|---|---|
| OpenThinker-7B | Si | 30,7 | 22,0 | 72,5 | 82,8 | 15,7 | 26,1 | 11,1 | 14,9 | 38,6 | 45,3 |
| OpenThinker2-7B | Si | 60,7 | 38,7 | 89,8 | 87,6 | 24,7 | 40,6 | 22,8 | 26,6 | 47,0 | 65,1 |
| **OpenThinker3-7B** | Si | **69,0** | **53,3** | **93,5** | **90,0** | **42,7** | **51,7** | 31,0 | **32,2** | 53,7 | **72,4** |
| DeepSeek-R1-Distill-Qwen-32B | No | 51,3 | 38,0 | 92,0 | 88,0 | 25,0 | 34,5 | 19,9 | 21,1 | 33,2 | 50,4 |
| OpenR1-Distill-7B | Si | 57,7 | 39,7 | 87,0 | 88,0 | 25,7 | 30,7 | 30,1 | 29,3 | **58,9** | 68,7 |
| Llama-3.1-Nemotron-Nano-8B-v1 | Si | 62,0 | 48,0 | **94,0** | 89,4 | 26,7 | **50,9** | 30,9 | **32,9** | 52,9 | 70,7 |
| AceReason-Nemotron-7B | Si | **71,0** | 50,7 | **93,8** | 89,8 | 33,3 | 44,3 | **32,9** | **30,9** | 52,9 | 64,3 |

El campo `model-index` de la model card está vacío; la tabla anterior procede del cuerpo del README y no de un `model-index` estructurado, por lo que conviene tratarla como resultados declarados por el autor, no verificados de forma independiente.

## Requisitos de hardware

- Inferencia en BF16/FP16: aproximadamente 15,2 GB solo para pesos, más caché KV. En la práctica, entre 18 y 22 GB de VRAM según longitud de contexto y tamaño de lote.
- Inferencia en int8: en torno a 8 GB de pesos; manejable en GPUs de 12-16 GB.
- Inferencia en int4 (GPTQ, AWQ o GGUF Q4_K_M): en torno a 4,5-5,5 GB, ejecutable en GPUs de 8 GB.
- GPU recomendadas para producción: A100 40/80 GB o H100 para lotes grandes y contextos largos; L40S o RTX 6000 Ada como alternativas de coste medio.
- GPUs de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en BF16, con margen para contextos moderados; en RTX 4080/4070 Ti (16 GB) es recomendable int8; en GPUs de 8 GB, int4.
- Opciones de despliegue: transformers para uso puntual; vLLM o SGLang para servicio con alta concurrencia; TGI para integración con el ecosistema HuggingFace; llama.cpp u Ollama para ejecución local en CPU/GPU mixta con GGUF.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de latencia, tokens por segundo ni rendimiento bajo carga concurrente.
- Nota de entrenamiento: según la model card, el ajuste fino requirió 512 dispositivos A100 durante 48 horas, un coste muy alejado de lo asumible para reentrenamiento por particulares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos de entrenamiento | MATH500 | AIME25 |
|---|---|---|---|---|---|---|
| OpenThinker3-7B | 7B | No declarado (base Qwen2.5, 32.768 nativos) | Apache 2.0 | SFT sobre OpenThoughts3-1.2M | 90,0 | 53,3 |
| OpenThinker2-7B | 7B | No declarado | Apache 2.0 | SFT sobre OpenThoughts2 | 87,6 | 38,7 |
| DeepSeek-R1-Distill-Qwen-7B | 7B | No disponible en la informacion | MIT (segun el repositorio original) | Destilacion de trazas de DeepSeek-R1 | No disponible en la informacion | No disponible en la informacion |
| DeepSeek-R1-Distill-Qwen-32B | 32B | No disponible en la informacion | MIT (segun el repositorio original) | Destilacion de trazas de DeepSeek-R1 | 88,0 | 38,0 |
| OpenR1-Distill-7B | 7B | No disponible en la informacion | Apache 2.0 | Destilacion del pipeline Open-R1 | 88,0 | 39,7 |
| Llama-3.1-Nemotron-Nano-8B-v1 | 8B | No disponible en la informacion | Llama 3.1 Community License | Datos abiertos y propietarios | 89,4 | 48,0 |

El dato más llamativo de la comparativa es que un modelo de 7B entrenado solo con SFT supera a DeepSeek-R1-Distill-Qwen-32B, cuatro veces mayor, en AIME24, AIME25, HMMT y JEEBench. Sin embargo, OpenR1-Distill-7B mantiene ventaja en GPQA-D (58,9 frente a 53,7), lo que sugiere que el sesgo del dataset hacia matemáticas y código penaliza ligeramente el razonamiento científico.

## Limitaciones y advertencias

- Entrenamiento exclusivamente con SFT: el autor indica que no se aplicó RL. Esto limita la robustez ante instrucciones ambiguas o formatos no vistos, en comparación con modelos entrenados con preferencias.
- Destilación de QwQ-32B: todas las trazas de razonamiento del dataset provienen de un único modelo profesor, por lo que los sesgos y errores sistemáticos de QwQ-32B pueden estar heredados.
- Riesgo de alucinación: no se declaran evaluaciones de veracidad (TruthfulQA, HaluEval u otras), y los modelos de razonamiento con cadenas largas tienden a producir justificaciones plausibles pero incorrectas cuando el problema excede su competencia.
- Sesgo de dominio: la composición del dataset (850.000 de matemáticas, 250.000 de código, 100.000 de ciencia) implica un sesgo claro hacia STEM y una cobertura limitada de humanidades, derecho o conocimiento general.
- Idiomas: el autor no declara lista de idiomas soportados. El rendimiento fuera del inglés no está evaluado y podría degradarse respecto al modelo base.
- Idiomas de la ficha: no se especifican tareas de traducción ni evaluación multilingüe.
- Licencia: Apache 2.0 permite uso comercial y modificación sin obligación de publicar derivados, pero no exime de cumplir la licencia del modelo base (Qwen2.5-7B-Instruct, también Apache 2.0 en su variante base).
- Repositorio de terceros: la ficha analizada es una réplica subida por Laguna198 con 0 descargas y 0 likes. Conviene usar el repositorio oficial de open-thoughts como referencia, ya que la copia puede divergir en el futuro.
- Benchmarks no verificados de forma independiente: los números provienen del propio autor y el campo `model-index` está vacío, sin resultados estructurados.
- Contexto no documentado: la model card no especifica la longitud de contexto efectiva tras el ajuste fino ni si se aplicó extensión posicional.
- Longitud de las respuestas: el formato de razonamiento explícito genera salidas largas, lo que incrementa coste de inferencia y latencia frente a un modelo instruct convencional.

## Enlaces

- HuggingFace (replica analizada): https://huggingface.co/Laguna198/OpenThinker3-7B
- HuggingFace (modelo original): https://huggingface.co/open-thoughts/OpenThinker3-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Paper OpenThoughts: https://arxiv.org/abs/2506.04178
- Blog post de OpenThinker3: https://www.open-thoughts.ai/blog/ot3
- Repositorio GitHub: https://github.com/open-thoughts/open-thoughts
- Herramienta de evaluacion Evalchemy: https://github.com/mlfoundations/Evalchemy
- Modelos predecesores: https://huggingface.co/open-thoughts/OpenThinker-7B y https://huggingface.co/open-thoughts/OpenThinker2-7B
