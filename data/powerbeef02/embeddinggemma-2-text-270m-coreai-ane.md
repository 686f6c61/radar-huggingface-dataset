# PowerBeef02/embeddinggemma-2-text-270m-coreai-ane

## Resumen

EmbeddingGemma 2 (270M) para Apple Neural Engine es una conversion del modelo de embeddings `litert-community/embeddinggemma-2-text-270m-litert-lm` a un bundle Core AI optimizado para ejecutarse integramente en la Neural Engine (ANE) de Apple, con soporte para iOS 27 y macOS 27. Lo publica el usuario PowerBeef02 y su proposito es ofrecer un encoder de texto de 270 millones de parametros que genere embeddings de 768 dimensiones sin consumir recursos de la GPU Metal, de modo que las tareas de busqueda semantica e indexacion de documentos puedan ejecutarse en paralelo con la inferencia de un LLM en la GPU.

El artefacto se distribuye como un Apple Archive (`.aar` comprimido con lzfse) de aproximadamente 128 MB que, descomprimido, ocupa unos 149 MB. Incluye un encoder de texto con cuatro buckets estaticos de la ANE (128, 256, 512 y 1024 tokens) cuantizados a INT4 asimetrico, una tabla de tokens INT4 mapeada en memoria (AGET v1) y un tokenizer SentencePiece BPE exacto. La licencia es Apache 2.0, heredada del modelo upstream.

Su relevancia radica en el desacoplamiento de recursos: al ejecutarse al 100% en la ANE (`mps.fullyPlacedOnANE`, `mps.noGPUActivity`), permite pipelines RAG en dispositivos Apple donde el LLM generativo ocupa la GPU Metal mientras el encoder de embeddings trabaja en paralelo sin contencion de cola. El autor reporta paridad coseno de 0,99923 (minimo) y 0,99949 (media) frente a la referencia FP32 de LiteRT-LM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (EmbeddingGemma 2), convertido a Core AI con 4 buckets estaticos ANE |
| Parametros totales | 270M (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Buckets estaticos de 128, 256, 512 y 1024 tokens |
| Tipos de cuantizacion | INT4 asimetrico (encoder y tabla de tokens) |
| Idiomas soportados | no disponible (medido en ingles, frances, CJK y codigo Swift) |
| Licencia | Apache 2.0 |
| Formato de pesos | Apple Archive (`.aar`, lzfse) con `text_encoder.aimodel` (MLIRB), `embed_tokens.bin` (AGET v1 INT4) y `tokenizer.model` (SentencePiece BPE) |
| Dimension del embedding | 768 |
| Tamano del bundle | 128.245.086 bytes (`.aar`); 149.102.786 bytes descomprimido |
| Libreria | coreai |
| Plataformas objetivo | iOS 27 / macOS 27 (Apple Neural Engine) |

## Arquitectura y entrenamiento

El modelo es un encoder de texto transformer de 270M parametros derivado de EmbeddingGemma 2, cuyo objetivo es producir embeddings densos de 768 dimensiones. Esta version concreta no es un reentrenamiento, sino una conversion del artefacto LiteRT-LM (`embeddinggemma-2-text-270m.litertlm`, revision `9be6e8b9...`) a un bundle Core AI. El encoder se compila en cuatro buckets estaticos de la ANE (128, 256, 512 y 1024 tokens) cuantizados a INT4 asimetrico, lo que fija la longitud de secuencia por bucket y evita formas dinamicas en el hardware.

La tabla de embeddings de tokens (`embed_tokens.bin`, 68.157.472 bytes) se almacena como una tabla INT4 de 262.144 x 768 con formato AGET v1 y mapeo en memoria. El tokenizer se incluye como `ModelProto` SentencePiece BPE exacto (4.689.013 bytes). No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo upstream de Google y no se detallan en la informacion proporcionada.

La innovacion tecnica destacable es la ejecucion integra en la ANE con cero actividad de GPU, lo que permite concurrencia con inferencia LLM en Metal. El autor reporta paridad coseno frente a la referencia FP32 de LiteRT-LM de 0,99923 (minimo) y 0,99949 (media), superando el 0,98255 de LiteRT GPU FP16 en CJK.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones para busqueda semantica y recuperacion.
- Indexacion de documentos largos mediante buckets de hasta 1024 tokens.
- Ejecucion 100% en Apple Neural Engine sin uso de GPU Metal.
- Concurrencia con inferencia LLM en GPU (medido con Gemma 4 E4B a 68,6 tok/s sin contencion).
- Soporte multilingue medido en ingles, frances y CJK (sin listado oficial de idiomas).
- Procesamiento de codigo fuente (medido con codigo Swift).
- Tokenizer SentencePiece BPE exacto incluido en el bundle.
- No dispone de generacion de texto, tool calling ni razonamiento multi-paso: es exclusivamente un encoder de embeddings.

## Casos de uso

- Busqueda semantica en aplicaciones iOS: el encoder genera embeddings de consulta en 7,7-9,2 ms en un iPhone 17 Pro, adecuado para busquedas interactivas en tiempo real dentro de apps nativas.
- RAG en dispositivo con LLM concurrente: al ejecutarse en la ANE sin tocar la GPU, permite indexar documentos mientras un LLM (por ejemplo Gemma 4 E4B) genera respuestas en Metal, evitando contencion de recursos.
- Indexacion de PDFs y documentos largos: con buckets de hasta 1024 tokens, permite procesar pasajes de documentos; el autor mide 40 paginas (20 pasajes) en 0,86 s con cache caliente.
- Clasificacion y deduplicacion de texto: los embeddings de 768 dimensiones sirven para agrupar, deduplicar o clasificar contenido sin salir del dispositivo.
- Busqueda de codigo en editores: el modelo procesa codigo Swift con alta paridad, util para indexar repositorios y ofrecer busqueda semantica local en IDEs para macOS.
- Procesamiento multilingue en el dispositivo: con soporte medido en ingles, frances y CJK, permite busqueda semantica multilingue sin enviar datos a la nube, relevante por privacidad.
- Filtrado y moderacion local: embeddings para detectar similitud entre textos y filtrar contenido en tiempo real sin coste de red.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Paridad coseno vs. LiteRT-LM FP32 (min / media) | 0,99923 / 0,99949 |
| Paridad coseno LiteRT GPU FP16 en CJK (referencia) | 0,98255 |
| Indexacion 40 paginas PDF (20 pasajes, iPhone 17 Pro, cache caliente) | 0,86 s (vs. 1,9 s en GPU) |
| Embedding de consulta + retrieval | 7,7-9,2 ms (rank 0 en 3/3) |
| Indexacion concurrente con Gemma 4 E4B a 68,6 tok/s | 45,9 ms (0% contencion GPU) |

No se han publicado resultados de benchmarks estandar (MMLU, MTEB, etc.) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Neural Engine de 16 nucleos (medido en A19 Pro, iPhone 17 Pro, iOS 27.2.1).
- Plataformas: iOS 27 y macOS 27.
- VRAM: no aplica; el modelo no usa GPU. Consume memoria unificada del dispositivo para el bundle descomprimido (unos 149 MB) mas el mapeo de la tabla de tokens.
- GPU recomendadas: no aplica (ejecucion exclusiva en ANE; `mps.noGPUActivity`).
- Cabe en dispositivos Apple consumer con ANE compatible (iPhone y Mac con iOS 27 / macOS 27).
- Despliegue: bundle Core AI mediante Apple Archive (`aa extract`); no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida: 7,7-9,2 ms por embedding de consulta; 0,86 s para 20 pasajes; 45,9 ms en indexacion concurrente con LLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion |
|---|---|---|---|---|---|
| EmbeddingGemma 2 270M (Core AI ANE, este) | 270M | 128/256/512/1024 tokens (buckets) | Apple Archive INT4 | Apache 2.0 | ANE |
| litert-community/embeddinggemma-2-text-270m-litert-lm | 270M | no disponible | LiteRT-LM | Apache 2.0 | GPU/CPU (LiteRT) |
| EmbeddingGemma 2 original (Google) | 270M | no disponible | safetensors | no disponible | CPU/GPU |

La comparativa se limita al ecosistema EmbeddingGemma 2; no se dispone de datos de rendimiento MTEB ni de otros modelos de embeddings en la informacion proporcionada.

## Limitaciones y advertencias

- Es exclusivamente un encoder de embeddings: no genera texto ni soporta tool calling, agentes o razonamiento multi-paso.
- Longitud de secuencia limitada por buckets estaticos (maximo 1024 tokens); textos mas largos requieren troceado.
- Solo funciona en iOS 27 / macOS 27 con Apple Neural Engine; no es portable a otras plataformas ni a GPU convencionales.
- No se dispone de listado oficial de idiomas soportados; el multilingue esta medido solo en ingles, frances y CJK.
- Riesgo de sesgo y alucinacion heredado del modelo upstream, no documentado en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria.
- La paridad reportada (0,99923) es frente a LiteRT-LM FP32, no frente al modelo original en safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/PowerBeef02/embeddinggemma-2-text-270m-coreai-ane
- Modelo base: https://huggingface.co/litert-community/embeddinggemma-2-text-270m-litert-lm
