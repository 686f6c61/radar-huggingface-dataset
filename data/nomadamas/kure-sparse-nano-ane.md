# NomaDamas/kure-sparse-nano-ane

## Resumen

KURE-Sparse-nano-ane es una conversión a Core ML del modelo de recuperación dispersa nlpai-lab/KURE-Sparse-nano, desarrollada por NomaDamas para ejecutarse en la Apple Neural Engine (ANE) de los chips Apple Silicon. El modelo original, creado por el NLP&AI Lab de la Universidad de Corea, es un encoder ModernBERT especializado en la generación de representaciones SPLADE (expansión léxica dispersa aprendida) para búsqueda y recuperación de información en coreano. Esta versión empaqueta el grafo en funciones ML Program de precisión fp16 optimizadas para el motor neuronal de Apple, manteniendo la tabla de embeddings en el host.

La relevancia de esta conversión radica en que traslada un modelo de recuperación dispersa de nivel producción al hardware de consumo de Apple sin necesidad de GPU dedicada ni de frameworks de inferencia pesados. El paquete incluye funciones compiladas para longitudes de secuencia de 64, 128, 256, 512, 768, 1024, 1536 y 2048 tokens, lo que permite cubrir desde consultas cortas hasta pasajes largos con un único artefacto. Es el componente por defecto del modo sparse de la herramienta `im-not-llm` (`inl serve --sparse`) en Apple Silicon.

El modelo resuelve el problema de generar representaciones dispersas tipo SPLADE sobre vocabulario completo con pooling ShiftedTopK, algo que normalmente requiere una GPU para ser viable en latencia baja. La conversión conserva una fidelidad alta respecto al modelo fp32 original (coseno de 0,99883 a 0,99904 sobre textos dorados) y un rendimiento en recuperación prácticamente idéntico (nDCG@10 de 0,7905 frente a 0,7915 del motor fp32 en Ko-StrategyQA dev). La licencia Apache-2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder con pooling ShiftedTopKSpladePooling (SPLADE), convertido a Core ML ML Program |
| Parametros totales | no disponible (dimensión oculta H no especificada en la información; tabla de embeddings de 50002 filas) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (funciones compiladas para S=64, 128, 256, 512, 768, 1024, 1536 y 2048) |
| Tipos de cuantizacion | fp16 en las funciones ML Program; embeddings en bf16 (little-endian, lookup en host); referencia fp32 en Sentence-Transformers |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mlpackage` (Core ML), `embeddings.bf16`, `tokenizer.json`, `splade_pooling.json`, `manifest.json`, `selftest.json`/`selftest.bin` |

## Arquitectura y entrenamiento

El modelo base es un ModernBERT configurado como encoder de recuperación dispersa SPLADE. La salida no es un vector denso, sino una representación dispersa sobre un vocabulario enmascarado: para cada token de texto se calcula `relu(logit - 10) * keep`, se toma el máximo por bloque de 8 filas, se anulan los términos del vocabulario enmascarado, se aplica `log1p` y se pliega sobre 36282 términos canónicos definidos en `splade_pooling.json`. El pooling es un ShiftedTopK con tokens de prefijo `[Q] ` y `[D] ` añadidos por el llamador, y la tokenización usa el tokenizer original con tokens especiales `[CLS] text [SEP]`.

La conversión a Core ML separa el grafo en dos partes: las funciones `splade_S` (una por longitud S) reciben `inputs_embeds [1,S,H]`, `global_bias [1,1,S,S]`, `local_bias [1,1,S,S]` y `keep [S,1]`, y devuelven el máximo por bloque de 8 filas. El host realiza el lookup de embeddings desde `embeddings.bf16`, aplica el max global por texto, el enmascarado, el `log1p` y el plegado canónico. Las máscaras de atención se materializan como sesgos: 0 donde una fila puede atender (mismo texto, y dentro de 64 filas en las capas locales) y -1e4 en el resto. Los textos comienzan en fronteras de 8 filas. El modelo se construyó con `scripts/ane/build_modernbert_splade.py` de im-not-llm, solo con CPU, y los requisitos están en `scripts/ane/requirements.txt`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de representaciones dispersas SPLADE para recuperación de información (retrieval) y búsqueda léxica expandida.
- Extracción de características (pipeline `feature-extraction`) sobre textos en coreano.
- Codificación de consultas y pasajes con prefijos `[Q] ` y `[D] ` para búsqueda asimétrica.
- Soporte de longitudes de secuencia variables mediante funciones dedicadas de 64 a 2048 tokens.
- Ejecución en Apple Neural Engine (`cpuAndNeuralEngine`) con precisión fp16.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito: es un encoder de recuperación, no un modelo generativo.

## Casos de uso

- Búsqueda semántica-léxica en aplicaciones coreanas nativas para macOS/iOS: el modelo genera vectores dispersos sobre 36282 términos canónicos, lo que permite indexar pasajes y recuperar por solapamiento de términos expandidos sin necesidad de un índice denso aproximado.
- Motor de recuperación local en Apple Silicon: al ejecutarse en la ANE con `cpuAndNeuralEngine`, permite desplegar un sistema de búsqueda sobre documentos privados sin enviar datos a la nube, con funciones de hasta 2048 tokens para pasajes largos.
- Primera etapa de un pipeline RAG en coreano: se usa como retriever disperso para seleccionar candidatos (Recall@100 de 0,9107 en Ko-StrategyQA dev) antes de un reranker o de un LLM generador.
- Búsqueda de preguntas frecuentes y atención al cliente: la codificación de consultas cortas con la función S=64 y de respuestas con S=256 o S=512 permite emparejar preguntas de usuarios con respuestas de la base de conocimiento en latencia baja.
- Indexación de documentación técnica o legal en coreano: la ventana de 2048 tokens admite fragmentos largos, y el plegado canónico reduce el vocabulario efectivo para un almacenamiento disperso eficiente.
- Herramientas de escritorio tipo `inl serve --sparse`: integración directa en la CLI de im-not-llm como backend por defecto del modo sparse en Apple Silicon, sin dependencias de GPU.
- Evaluación y reproducción de experimentos de recuperación: los ficheros `selftest.json` y `selftest.bin` permiten validar la conversión contra las expectativas fp32 de Sentence-Transformers SparseEncoder.

## Benchmarks y rendimiento

| Benchmark | Metrica | kure-sparse-nano-ane (ANE, fp16) | Motor fp32 (candle) |
|---|---|---|---|
| Ko-StrategyQA dev (592 consultas, 9251 pasajes) | nDCG@10 | 0,7905 | 0,7915 |
| Ko-StrategyQA dev (592 consultas, 9251 pasajes) | Recall@100 | 0,9107 | 0,9099 |
| Textos dorados (fidelidad vs. fp32 Sentence-Transformers, M4 Max) | Coseno | 0,99883 – 0,99904 | 1,000000 (porte PyTorch fp32 del mismo grafo) |

No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K, que además no aplican a un modelo de recuperación.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine (el modelo se ejecuta con `cpuAndNeuralEngine`); las mediciones de referencia se hicieron en un M4 Max.
- VRAM: no aplica; el modelo usa memoria unificada del sistema. El repositorio ocupa 0,4 GB, incluyendo las ocho funciones ML Program en fp16 y la tabla de embeddings en bf16.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este artefacto, que es específico de Core ML.
- Cabe en cualquier Mac con Apple Silicon; no requiere GPU de consumo dedicada.
- Despliegue: Core ML a través de la CLI `inl serve --sparse` de im-not-llm; no se indica soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NomaDamas/kure-sparse-nano-ane | no disponible | 2048 | Dispersa SPLADE (36282 términos) | Apache-2.0 | Core ML (Apple Silicon) |
| nlpai-lab/KURE-Sparse-nano | no disponible | no disponible | Dispersa SPLADE | Apache-2.0 | PyTorch / Sentence-Transformers |
| Modelos SPLADE densos comparables | no disponible | no disponible | Dispersa SPLADE | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de alternativas comparables, por lo que la comparación cuantitativa con otros modelos SPLADE queda como no disponible.

## Limitaciones y advertencias

- Solo coreano: el tokenizer y el vocabulario están orientados a ko; el rendimiento en otros idiomas no está validado.
- Precisión fp16 en la ANE: aunque la fidelidad es alta (coseno mínimo de 0,99883), existe una degradación pequeña y no nula frente al modelo fp32.
- Modelo de recuperación, no generativo: no produce texto libre, no soporta razonamiento multi-paso, tool calling ni agentes.
- Dependencia de plataforma: el artefacto Core ML solo funciona en Apple Silicon con Neural Engine; no es portable a GPU NVIDIA ni a CPU x86 sin reconversión.
- Contrato de host complejo: el llamador debe gestionar el lookup de embeddings bf16, el alineamiento de textos en fronteras de 8 filas, la construcción de las máscaras `global_bias`/`local_bias` y el plegado canónico; un error en cualquiera de estos pasos degrada la recuperación sin aviso.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la expansión léxica SPLADE puede introducir términos no presentes en el texto original, lo que puede generar falsos positivos en la recuperación.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se recomienda conservar el aviso de licencia y la atribución al NLP&AI Lab de la Universidad de Corea.
- Sin métricas de latencia ni throughput publicadas: la idoneidad para producción en tiempo real no está cuantificada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NomaDamas/kure-sparse-nano-ane
- Modelo base: https://huggingface.co/nlpai-lab/KURE-Sparse-nano
- Repositorio im-not-llm: https://github.com/NomaDamas/im-not-llm
