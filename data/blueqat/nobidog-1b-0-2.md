# blueqat/nobidog-1b-0.2

## Resumen

`nobidog-1b-0.2` es un modelo de lenguaje de 1.179.224.064 parámetros desarrollado por blueqat Inc., una empresa japonesa vinculada al ecosistema de computación cuántica. Se trata de un transformer decoder de estilo Llama entrenado desde cero (sin partir de pesos de terceros) sobre corpus en japonés, y posteriormente ajustado mediante SFT para responder preguntas cortas sobre computación cuántica e información cuántica, además de gestionar saludos y conversación trivial. Es el mismo conjunto de pesos que blueqat sirve como "nobidog1b 0.2" en su servicio poqet desde el 2 de octubre de 2026.

El modelo cubre un nicho muy concreto: asistencia conversacional en japonés especializada en dominios cuánticos. No compite en capacidades generales con modelos de su tamaño; el propio autor advierte que el conocimiento general, la conversación abierta, el inglés y la aritmética son débiles. Su interés técnico reside en ser un entrenamiento from scratch completamente documentado (datos, pasos, tokenizador, evaluación en bits por carácter) con licencia Apache-2.0 y pesos en safetensors y GGUF, lo que facilita su despliegue en entornos locales y su inspección.

La arquitectura es un decoder Llama con 24 capas, dimensión oculta 2048, 16 cabezas de atención (8 KV heads, GQA), FFN de 5504, vocabulario de 32.000 tokens con SentencePiece Unigram y embeddings atados, con una ventana de contexto de 2048 tokens. El preentrenamiento consumió aproximadamente 20.000 millones de tokens y el SFT se realizó sobre unas 18.000 muestras de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (RMSNorm, RoPE, SwiGLU, GQA) |
| Parametros totales | 1.179.224.064 (1.244.760.064 entradas tensoriales incluyendo la cabeza de salida atada) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | FP16 (safetensors), GGUF F16, GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Japones (principal), ingles y chino (declarados, con rendimiento debil segun el autor) |
| Licencia | Apache-2.0 (pesos) |
| Formato de pesos | safetensors (fp16), GGUF (F16, Q8_0, Q4_K_M) |

Detalles adicionales de arquitectura: 24 capas, hidden size 2048, 16 cabezas de atención con 8 KV heads, intermediate size 5504, vocabulario 32.000 (SentencePiece Unigram con byte fallback), embeddings atados.

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama con normalización RMSNorm, embeddings posicionales rotatorios (RoPE), activación SwiGLU y atención con query grouping (GQA, 16 cabezas de query y 8 de clave/valor). El tokenizador es un SentencePiece Unigram con byte fallback y un vocabulario de 32.000 entradas; los embeddings de entrada y la cabeza de salida están atados, lo que explica la diferencia entre parámetros reales y entradas tensoriales. La ventana de contexto es de 2048 tokens, tanto en preentrenamiento como en inferencia.

El preentrenamiento se realizó desde cero sobre aproximadamente 20.000 millones de tokens en japonés, combinando Wikipedia japonesa (`wikimedia/wikipedia` 20231101.ja, CC BY-SA 4.0), FineWeb-2 japonés (`HuggingFaceFW/fineweb-2` jpn_Jpan, ODC-By 1.0) y un corpus interno de blueqat sobre computación cuántica y optimización. Posteriormente se aplicó SFT sobre unas 18.000 muestras de instrucciones: preguntas y respuestas de temática cuántica sintetizadas con Qwen3.6 (licencia Apache-2.0), instrucciones generales y ejemplos sintéticos de saludos y conversación trivial. El autor declara explícitamente que no se usaron pesos preentrenados de terceros ni salidas de DeepSeek. La versión 0.2 continuó el preentrenamiento hasta el paso 33.755 antes del SFT, frente al paso 19.999 de la versión 0.1. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto en japonés con formato de instrucción fijo: `### 指示\n{pregunta}\n\n### 応答\n`, también disponible mediante `chat_template` en el tokenizador.
- Respuesta a preguntas cortas sobre computación cuántica e información cuántica (por ejemplo, qué es un cúbit o la diferencia entre QAOA y VQE).
- Saludos y conversación trivial en japonés.
- Soporte de plantilla de chat integrada para uso con `transformers` y con `llama-server` (endpoint compatible con `/v1/chat/completions`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- Capacidades multilingües limitadas: el autor califica el inglés como débil pese a declarar ja, en y zh en los metadatos.

## Casos de uso

- Asistente educativo introductorio de computación cuántica en japonés: el modelo responde preguntas breves sobre cúbits, QAOA, VQE y conceptos afines, adecuado para materiales de onboarding o FAQ interactivas donde el contexto no supere 2048 tokens.
- Chatbot de soporte en la web de un producto cuántico: con un prompt de sistema fijo y el formato `### 指示 / ### 応答`, puede gestionar intercambios cortos de preguntas frecuentes, derivando al humano cuando la consulta salga del dominio.
- Demo local en portátil o estación de trabajo sin GPU dedicada: al ser un modelo de 1,18B en GGUF Q4_K_M, cabe en CPU y en GPUs de consumo, lo que permite prototipos offline con llama.cpp u Ollama.
- Generación de borradores de documentación técnica en japonés sobre conceptos cuánticos: útil como primer borrador que un experto revisa, dado que el autor advierte de posibles afirmaciones incorrectas expresadas con fluidez.
- Integración en pipelines de CI para pruebas de humo de infraestructura de inferencia: su tamaño reducido y su formato GGUF permiten validar despliegues con vLLM, TGI o llama.cpp sin consumir recursos significativos.
- Filtro o clasificador previo en un sistema mayor: puede usarse para detectar y responder consultas triviales de temática cuántica antes de enrutar consultas complejas a un modelo mayor, reduciendo coste por token.
- Investigación sobre entrenamiento from scratch en japonés: sirve como referencia reproducible de pipeline completo (tokenizador Unigram, corpus mixto, SFT sintético, evaluación en bits por carácter) para equipos que quieran replicar el proceso a mayor escala.

## Benchmarks y rendimiento

El autor publica una evaluación interna en bits por carácter (menor es mejor), medida sobre el checkpoint predecesor (nobidog1b 0.1, paso 19.999 más SFT cuántico) con contexto 1024, sobre 200 textos generales en japonés (405.955 caracteres) y 170 textos de computación cuántica (397.926 caracteres), con fecha 28 de septiembre de 2026. La versión 0.2 no fue remedida.

| Modelo | General (bpc) | Cuantica (bpc) |
|---|---|---|
| nobidog1b 0.1 (predecesor de esta version) | 2,03 | 2,62 |
| llm-jp/llm-jp-3-980m | 2,02 | 2,37 |
| sbintuitions/sarashina2.2-1b | 2,24 | 2,35 |
| google/gemma-3-1b-pt | 2,40 | 2,46 |
| rinna/japanese-gpt-1b | 2,74 | 3,32 |

No hay resultados publicados en benchmarks estándar como MMLU, HumanEval, GSM8K o llm-jp-eval. El autor indica explícitamente que aún no dispone de cifras de benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB con contexto completo de 2048 tokens.
- VRAM estimada en GGUF Q8_0: aproximadamente 1,3 GB de pesos; en Q4_K_M, aproximadamente 0,8-1 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para FP16 (por ejemplo, RTX 3050, RTX 4060, T4); para Q4_K_M basta con 2 GB, por lo que también funciona en iGPU y CPU.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060 Ti, RTX 4090, así como en Apple Silicon mediante llama.cpp con Metal.
- Opciones de despliegue: `transformers` (safetensors), llama.cpp y `llama-server` (GGUF), Ollama (importando el GGUF), y servidores compatibles con la API de OpenAI; los tags del repositorio indican compatibilidad con text-generation-inference y endpoints compatibles. No se documenta configuración específica para vLLM.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (1,18B) y el contexto corto (2048), se espera una latencia baja en GPU de consumo, pero no hay cifras publicadas.
- Nota para GGUF: el vocabulario es SentencePiece Unigram, por lo que el tokenizador GGUF se almacena como tipo `t5` (UGM); la plantilla de chat va embebida en el archivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento (bpc general / cuantica) |
|---|---|---|---|---|---|
| blueqat/nobidog-1b-0.2 | 1,18B | 2048 | Apache-2.0 | Japones + dominio cuantico, from scratch | No remedido en 0.2; predecesor 2,03 / 2,62 |
| llm-jp/llm-jp-3-980m | ~0,98B | No disponible en la informacion | No disponible en la informacion | Japones general | 2,02 / 2,37 |
| sbintuitions/sarashina2.2-1b | ~1B | No disponible en la informacion | No disponible en la informacion | Japones general | 2,24 / 2,35 |
| google/gemma-3-1b-pt | ~1B | No disponible en la informacion | No disponible en la informacion | Multilingue general | 2,40 / 2,46 |
| rinna/japanese-gpt-1b | ~1B | No disponible en la informacion | No disponible en la informacion | Japones general | 2,74 / 3,32 |

En la métrica interna del autor, el predecesor de nobidog-1b queda por detrás de llm-jp-3-980m y sarashina2.2-1b tanto en texto general como en texto cuántico, y por delante de gemma-3-1b-pt y rinna/japanese-gpt-1b. La comparación es limitada: solo cubre bits por carácter sobre dos corpus concretos y no incluye benchmarks de tareas.

## Limitaciones y advertencias

- Conocimiento general, conversación abierta, inglés y aritmética débiles, según declaración explícita del autor.
- Riesgo alto de alucinación: el modelo puede afirmar hechos incorrectos con fluidez; el autor recomienda verificar las respuestas antes de usarlas.
- Ventana de contexto corta (2048 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- El multilingüismo declarado (en, zh) no está respaldado por evaluación; el uso previsto es japonés.
- Sin cifras de benchmarks estándar (llm-jp-eval, MMLU, etc.), lo que dificulta comparaciones rigurosas con alternativas.
- La evaluación publicada corresponde al checkpoint 0.1, no a la versión 0.2, que continuó el preentrenamiento hasta el paso 33.755 sin remedición.
- Licencia Apache-2.0 para los pesos, permisiva para uso comercial; sin embargo, los datos de entrenamiento incluyen Wikipedia japonesa (CC BY-SA 4.0) y FineWeb-2 (ODC-By 1.0, sujeto a los términos de uso de Common Crawl), cuyas atribuciones deben conservarse.
- El SFT se generó con Qwen3.6 (Apache-2.0); el autor declara que no se usaron salidas de DeepSeek ni pesos preentrenados de terceros.
- El formato de prompt es rígido (`### 指示 / ### 応答`); desviarse de él degrada la calidad de las respuestas.
- El modelo está afinado para un dominio muy estrecho; fuera de preguntas cuánticas breves y saludos, su utilidad es marginal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blueqat/nobidog-1b-0.2
- Sitio del desarrollador (blueqat Inc.): https://blueqat.com
- Corpus de preentrenamiento, Wikipedia japonesa: https://huggingface.co/datasets/wikimedia/wikipedia
- Corpus de preentrenamiento, FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo comparable, llm-jp-3-980m: https://huggingface.co/llm-jp/llm-jp-3-980m
- Modelo comparable, sarashina2.2-1b: https://huggingface.co/sbintuitions/sarashina2.2-1b
- Modelo comparable, gemma-3-1b-pt: https://huggingface.co/google/gemma-3-1b-pt
- Modelo comparable, japanese-gpt-1b: https://huggingface.co/rinna/japanese-gpt-1b
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
