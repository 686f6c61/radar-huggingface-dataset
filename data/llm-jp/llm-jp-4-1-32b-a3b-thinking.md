# llm-jp/llm-jp-4.1-32b-a3b-thinking

## Resumen

llm-jp-4.1-32b-a3b-thinking es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el Research and Development Center for Large Language Models del National Institute of Informatics (NII) de Japón, dentro de la serie LLM-jp-4.1. El modelo combina 32.139.028.992 parámetros totales con 3.827.476.992 parámetros activos por token (8 expertos activados de 128 enrutados), una ventana de contexto de 65.536 tokens y una arquitectura transformer de 32 capas con tamaño oculto de 2.560 y 40 cabezas de atención, registrada en Transformers bajo el tipo `qwen3_moe`.

La variante «thinking» está post-entrenada para razonamiento explícito: la plantilla de chat es compatible con el formato de respuesta OpenAI Harmony y admite `reasoning_effort` (la evaluación oficial se realizó con `reasoning_effort` en `high`). El modelo está orientado a los idiomas inglés y japonés, con soporte declarado de 13 lenguajes de programación (C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala y TypeScript), y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual reside en dos factores: por un lado, es una alternativa de pesos abiertos, entrenada íntegramente por un centro público de investigación japonés, con corpus de preentrenamiento y mid-training publicados; por otro, la relación entre parámetros totales (32,1 B) y activos (3,8 B) sitúa su coste de cómputo por token en el rango de un modelo denso de ~4 B, mientras que la memoria requerida corresponde a la de un modelo de 32 B, lo que lo hace atractivo para despliegues con GPU de gama alta pero limitaciones de cómputo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (tipo `qwen3_moe`), 32 capas, tamaño oculto 2.560, 40 cabezas de atención |
| Parámetros totales | 32.139.028.992 (32,14 B) |
| Parámetros activos | 3.827.476.992 (3,83 B); 8 expertos activados de 128 enrutados |
| Parámetros de embedding / no-embedding | 503.316.480 / 31.635.712.512 |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantización | No disponible (el repositorio publica pesos en safetensors; no se listan cuantizaciones oficiales GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en) y japonés (ja); lenguajes de programación declarados: C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala, TypeScript |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con la librería `transformers`); tamaño del repositorio: 128,6 GB |
| Tokenizador | Unigram con byte-fallback sobre `huggingface/tokenizers`, vocabulario derivado de `llm-jp-tokenizer v4.0` |
| Pipeline | text-generation |
| Descargas / likes en HuggingFace | 3 / 11 |
| Fechas de creación y actualización | 16 de septiembre de 2026 / 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con capas MoE: 32 capas, dimensión oculta de 2.560, 40 cabezas de atención, 128 expertos enrutados y 8 expertos activados por token. La capa de embedding aporta 503.316.480 parámetros, mientras que el resto del cuerpo del modelo concentra 31.635.712.512 parámetros. La activación de 8 expertos de 128 implica que, por cada token, solo se computa aproximadamente el 12 % de los parámetros no-embedding, lo que reduce el coste de FLOPs por token a un nivel comparable al de un modelo denso de unos 3,8 B de parámetros.

El entrenamiento siguió una canalización en varias etapas: preentrenamiento y mid-training con un total de 11,7 billones (11,7 T) de tokens. Los corpus empleados están publicados en los repositorios `llm-jp-corpus-v4.1` (preentrenamiento) y `llm-jp-corpus-midtraining-v2` (mid-training), si bien la propia model card advierte de que una parte del material no se libera por restricciones de licencia. El post-entrenamiento se realizó exclusivamente con supervisión fina (SFT) seguido de optimización directa de preferencias (DPO), sin fase de aprendizaje por refuerzo (RL); los conjuntos de datos de SFT y de DPO específicos de este modelo (`llm-jp-4.1-32b-a3b-thinking-dpo-data`) están publicados. El tokenizador es un modelo Unigram con byte-fallback cuyo vocabulario procede de `llm-jp-tokenizer v4.0`; la model card advierte de que un entrenamiento puro con SentencePiece no reproduce ese vocabulario.

Una innovación destacable en el plano de uso es la compatibilidad de la plantilla de chat con el formato de respuesta OpenAI Harmony, pensada para separar canales de razonamiento y respuesta final. No obstante, la model card precisa que el tokenizador del modelo difiere del que asume la librería `openai-harmony`, por lo que la tokenización directa con esa librería no está soportada y debe utilizarse el tokenizador incluido en el repositorio.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés, con contexto de hasta 65.536 tokens.
- Modo de razonamiento explícito («thinking»): la plantilla de chat es compatible con el formato OpenAI Harmony y admite el parámetro `reasoning_effort`; en la evaluación oficial se empleó el valor `high`.
- Generación de código en 13 lenguajes declarados: C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala y TypeScript.
- Razonamiento matemático: la evaluación publicada cubre Math 500, AIME 2024, AIME 2025, AIME 2026, MCLM Math 100, PolyMath JA High y PolyMath JA Top.
- Conocimiento científico: evaluación sobre GPQA Diamond y JGPQA Diamond.
- Conocimiento y respuesta a preguntas en japonés: JAM-CQA, JEMHopQA, JMMLU y MMLU-ProX JA, además de MMLU-ProX EN.
- Seguimiento de instrucciones: MIFEval JA e IFBench.
- Traducción automática inglés-japonés y japonés-inglés: WMT20 EN-JA y WMT20 JA-EN.
- Tool calling: la model card indica que la evaluación oficial abarca capacidades generales, seguridad y tool calling; no se detalla la interfaz concreta de function calling ni los resultados obtenidos en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Asistentes conversacionales en japonés para atención al cliente: el modelo gestiona conversaciones multi-turno con hasta 65.536 tokens de contexto y está específicamente entrenado y evaluado en japonés (JAM-CQA, JEMHopQA, JMMLU), lo que lo hace adecuado para dominios con documentación extensa en ese idioma.
- Generación y revisión de código en pipelines de CI/CD: con soporte declarado de 13 lenguajes y evaluación en LiveCodeBench v6, HumanEval+ y JHumanEval, puede integrarse como paso de generación de parches, escritura de pruebas o revisión automática de pull requests.
- Traducción automática profesional EN-JA y JA-EN: el modelo ha sido evaluado en WMT20 en ambas direcciones, por lo que resulta aplicable a flujos de localización de documentación técnica y de producto entre inglés y japonés.
- Razonamiento matemático asistido en entornos educativos o de investigación: la evaluación incluye AIME 2024-2026 y PolyMath JA, lo que permite usarlo para resolución guiada de problemas con traza de razonamiento visible en el canal de pensamiento.
- Procesamiento de documentos largos en japonés: con 65.536 tokens de contexto se pueden introducir informes, contratos o manuales completos y formular preguntas sobre ellos, apoyándose en su rendimiento en JEMHopQA (preguntas multi-salto).
- Sistemas de agentes con tool calling: la evaluación oficial incluye tool calling, por lo que el modelo puede emplearse como planificador en flujos de varios pasos que invoquen APIs externas, siempre que se valide previamente el formato de llamada concreto con el cookbook oficial.
- Extracción de conocimiento estructurado a partir de corpus en japonés: JAM-CQA y MMLU-ProX JA sugieren utilidad en tareas de question answering sobre bases de conocimiento y dominios académicos.
- Despliegue self-hosted con licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin obligaciones de apertura del código propietario, incluyendo su uso en infraestructura propia.

## Benchmarks y rendimiento

La model card describe la batería de evaluación empleada (`swallow-evaluation-instruct`), pero no incluye en la información disponible las puntuaciones numéricas obtenidas. Las cifras detalladas se remiten al blog técnico del proyecto, escrito en japonés. Por tanto, no se presentan resultados cuantitativos para no inventar datos.

| Categoría | Benchmarks evaluados | Resultado numérico |
|---|---|---|
| Matemáticas | Math 500, AIME 2024 (pass@1, pass@32), AIME 2025 (pass@1, pass@32), AIME 2026 (pass@1, pass@32), MCLM Math 100 (pass@1, pass@4), PolyMath JA High, PolyMath JA Top | No disponible |
| Ciencia | GPQA Diamond (pass@1, pass@4), JGPQA Diamond | No disponible |
| Conocimiento y QA | JAM-CQA, JEMHopQA, JMMLU, MMLU-ProX JA, MMLU-ProX EN | No disponible |
| Código | LiveCodeBench v6 (pass@1, pass@10), JHumanEval (pass@1, pass@10), HumanEval+ (pass@1, pass@10) | No disponible |
| Seguimiento de instrucciones | MIFEval JA, IFBench | No disponible |
| Traducción automática | WMT20 EN-JA, WMT20 JA-EN | No disponible |
| Tool calling y seguridad | Incluidos en la evaluación oficial según la model card, sin detalle de métricas | No disponible |

Condiciones de evaluación declaradas: para los modelos LLM-jp y gpt-oss se fijó `reasoning_effort` en `high`; para Olmo-3-7B-Think, Olmo-3.1-32B-Think, Qwen3, Qwen3.5, Qwen3.6 y Gemma 4 se activó `enable_thinking`; para Qwen3.8-27B y Muse-Glimmer-30B se usó `reasoning_effort` en `xhigh`.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 64 GB solo para pesos (32,14 B de parámetros × 2 bytes), más el caché KV y el sobrecoste del runtime. El tamaño del repositorio en HuggingFace es de 128,6 GB, aproximadamente el doble de lo esperado para pesos en BF16, lo que sugiere la presencia de ficheros adicionales o de pesos en mayor precisión; conviene verificar el contenido antes de planificar el despliegue.
- VRAM estimada en cuantización de 8 bits: aproximadamente 33-36 GB de pesos. En cuantización de 4 bits: aproximadamente 17-20 GB de pesos. Estas cifras son estimaciones a partir del número de parámetros y no proceden de la model card.
- GPU recomendadas: para BF16, GPU de 80 GB como A100 80 GB o H100 80 GB, potencialmente con tensor parallelism si el caché KV para 65.536 tokens consume demasiada memoria. Para cuantizaciones de 8 y 4 bits, GPU de 48 GB (A6000, L40S) y de 24 GB (RTX 4090, RTX 3090) respectivamente, con contexto reducido en el caso de 24 GB.
- ¿Cabe en GPU de consumo? No en BF16. En cuantización de 4 bits, sí es viable en una RTX 4090 o RTX 3090 de 24 GB, asumiendo una reducción significativa de la ventana de contexto efectiva. No se publican ficheros GGUF oficiales, por lo que sería necesario convertir los pesos.
- Opciones de despliegue: al tratarse de una arquitectura MoE del tipo `qwen3_moe` y pesos en safetensors, los candidatos naturales son vLLM y SGLang para servicio de alto rendimiento, y TGI o el propio `transformers` para despliegues sencillos. El uso con llama.cpp u Ollama requeriría una conversión previa a GGUF, no proporcionada por el autor. El metadato `inference: false` de la model card indica que la inferencia alojada de HuggingFace no está habilitada para este repositorio.
- Latencia y throughput: no disponibles. Como referencia estructural, el coste de cómputo por token es el de un modelo de ~3,8 B de parámetros activos, pero el ancho de banda de memoria necesario para leer los expertos activos condiciona el rendimiento real.

## Comparativa con modelos similares

Dentro de la propia serie LLM-jp-4.1 se dispone de datos concretos para comparar la variante MoE con las variantes densas:

| Modelo | Arquitectura | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| llm-jp-4.1-32b-a3b-thinking | MoE, 32 capas, 128 expertos (8 activos) | 32.139.028.992 | 3.827.476.992 | 65.536 | Apache 2.0 | Safetensors |
| llm-jp-4.1-33b-thinking (denso) | Transformer denso, 64 capas | 33.219.548.160 | No aplica (denso) | 65.536 | Apache 2.0 (según la serie) | Safetensors |
| llm-jp-4.1-8b-thinking (denso) | Transformer denso, 32 capas | 8.590.200.832 | No aplica (denso) | 65.536 | Apache 2.0 (según la serie) | Safetensors |

La comparación directa con modelos externos de tamaño similar (gpt-oss, Qwen3, Qwen3.5, Qwen3.6, Gemma 4, Olmo-3-7B-Think, Olmo-3.1-32B-Think, Qwen3.8-27B y Muse-Glimmer-30B) sí se realizó en la evaluación oficial, pero las puntuaciones numéricas no están disponibles en la información proporcionada, por lo que no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas: el soporte declarado se limita a inglés y japonés. El rendimiento en castellano u otras lenguas no está documentado y no debería asumirse.
- Razonamiento: el modo de pensamiento puede incrementar de forma notable el número de tokens generados por respuesta, con el consiguiente impacto en latencia y coste. El parámetro `reasoning_effort` modula ese comportamiento.
- Tokenizador: la tokenización directa con la librería `openai-harmony` no está soportada pese a la compatibilidad de la plantilla de chat con ese formato; es obligatorio usar el tokenizador del repositorio.
- Corpus incompletos: parte de los datos de preentrenamiento y mid-training no se han liberado por restricciones de licencia, por lo que la reproducibilidad completa del entrenamiento no está garantizada.
- Alineación sin RL: el post-entrenamiento se limita a SFT y DPO, sin refuerzo. No se documentan en la información disponible los resultados de seguridad ni las tasas de alucinación.
- Sesgos: no se documentan evaluaciones de sesgo en la información proporcionada.
- Código: aunque se declaran 13 lenguajes, no se publican resultados numéricos de LiveCodeBench, HumanEval+ ni JHumanEval, por lo que no se puede verificar el nivel real de competencia en cada lenguaje.
- Licencia: Apache 2.0 permite uso comercial y modificación sin obligación de compartir derivados, pero conviene revisar las condiciones de los corpus y de los conjuntos de datos de SFT y DPO si se va a redistribuir material derivado.
- Adopción limitada: con 3 descargas y 11 likes en el momento de la consulta, el ecosistema de herramientas, cuantizaciones comunitarias y soporte de terceros es previsiblemente reducido en comparación con modelos de gran adopción.
- Despliegue: no se publican ficheros GGUF ni cuantizaciones oficiales, lo que añade trabajo de conversión y validación si se quiere ejecutar en hardware de gama de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-jp/llm-jp-4.1-32b-a3b-thinking
- Colección LLM-jp-4.1 Models: https://huggingface.co/collections/llm-jp/llm-jp-41-models
- Blog técnico de LLM-jp-4.1 (en japonés): https://llm-jp.nii.ac.jp/blog/llm-jp-4-1/
- Cookbook de LLM-jp-4: https://github.com/llm-jp/llm-jp-4-cookbook
- Tokenizador LLM-jp: https://github.com/llm-jp/llm-jp-tokenizer
- Corpus de preentrenamiento: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v4.1
- Corpus de mid-training: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-midtraining-v2
- Datos de SFT: https://huggingface.co/datasets/llm-jp/llm-jp-4.1-thinking-sft-data
- Datos de DPO de este modelo: https://huggingface.co/datasets/llm-jp/llm-jp-4.1-32b-a3b-thinking-dpo-data
- Datos de DPO del modelo 8B: https://huggingface.co/datasets/llm-jp/llm-jp-4.1-8b-thinking-dpo-data
- Datos de DPO del modelo 33B: https://huggingface.co/datasets/llm-jp/llm-jp-4.1-33b-thinking-dpo-data
- Batería de evaluación swallow-evaluation-instruct: https://github.com/swallow-llm/swallow-evaluation-instruct
- Centro de investigación (LLMC, NII): https://llmc.nii.ac.jp/
- National Institute of Informatics: https://www.nii.ac.jp/en/
- Formulario de encuesta de uso de LLM-jp: https://forms.gle/AvbNXTNT2ADsssHq5
