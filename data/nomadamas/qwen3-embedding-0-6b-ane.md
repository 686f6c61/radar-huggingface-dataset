# NomaDamas/qwen3-embedding-0.6b-ane

## Resumen

NomaDamas/qwen3-embedding-0.6b-ane es una conversión a Core ML del modelo de embeddings Qwen/Qwen3-Embedding-0.6B de Alibaba Cloud, optimizada para ejecutarse en el Apple Neural Engine (ANE) mediante el backend `cpuAndNeuralEngine`. No es un modelo nuevo: es un paquete de despliegue que empaqueta el transformer original en un ML Program de precisión fp16 con funciones precompiladas para longitudes de secuencia fijas, junto con la tabla de embeddings en bf16 y el tokenizador original. Su propósito es permitir inferencia de embeddings de texto de alta calidad en hardware Apple (chips M-series y A-series) sin GPU dedicada y con bajo consumo energético.

El modelo base, Qwen3-Embedding-0.6B, es un transformer de 0,6 mil millones de parámetros entrenado para generar representaciones densas de frases y documentos, con pooling del último token y normalización L2. Esta conversión conserva esa semántica: cada llamada devuelve un vector de 1024 dimensiones por texto, listo para búsqueda semántica, clustering o reranking. La relevancia actual reside en que lleva un modelo de embeddings multilingüe de calidad a un entorno de despliegue local en macOS/iOS con aceleración neuronal nativa, algo poco habitual en la categoría.

La ficha describe el paquete Core ML y su contrato de host, no las capacidades de generación de texto (el modelo base es exclusivamente de embeddings). Los datos de benchmarks disponibles se limitan a la evaluación de fidelidad numérica frente al modelo fp32 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo base Qwen3-Embedding-0.6B), convertido a ML Program Core ML |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 2048 tokens en las funciones `embed_S` incluidas (S = 64, 128, 256, 512, 768, 1024, 1536, 2048) |
| Tipos de cuantizacion | fp16 en el ML Program; tabla de embeddings en bf16; sin cuantizacion int8/int4 documentada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mlpackage` (Core ML ML Program), `embeddings.bf16` (little-endian bf16), `tokenizer.json`, `manifest.json`, `selftest.json`/`selftest.bin` |

## Arquitectura y entrenamiento

El paquete expone una única función ML Program por longitud de secuencia (`embed_S`) que recibe `inputs_embeds [1,S,1024]`, una `causal_bias [1,1,S,S]` que codifica la máscara de atención (0 donde una fila puede atender: mismo texto y no posterior; -1e4 en el resto; las filas de padding solo se atienden a sí mismas) y una matriz `pool [K,S]` one-hot sobre la última fila de cada texto empaquetado, con K = max(8, S/32). Devuelve `embedding [K,1024]` normalizado en L2, usando pooling del último token tal como define la configuración de Sentence-Transformers del modelo original. Varios textos pueden compartirse en una sola llamada.

La conversión se generó con `scripts/ane/build_qwen3.py` del repositorio im-not-llm, en CPU y con las dependencias de `scripts/ane/requirements.txt`. La tabla de embeddings (`embeddings.bf16`, forma `[151669, 1024]`) se resuelve en el host, no en el ANE, y el tokenizador es el original de Qwen3-Embedding, que codifica cada texto con tokens especiales (texto seguido de `<|endoftext|>`). No se documentan en la información disponible detalles sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF/DPO; esos datos corresponden al modelo base y no se reproducen aquí.

## Capacidades

- Extracción de embeddings de texto (feature-extraction) con pooling del último token y normalización L2.
- Similitud semántica entre frases y documentos (`sentence-similarity`).
- Procesamiento por lotes: varias entradas comparten una llamada gracias a la matriz `pool` con K = max(8, S/32).
- Longitudes de secuencia precompiladas de 64 a 2048 tokens, lo que cubre desde frases cortas hasta pasajes largos.
- Ejecución en el Apple Neural Engine mediante `inl serve --model Qwen/Qwen3-Embedding-0.6B --device ane`.
- No incluye generación de texto, tool calling, agentes, visión ni audio: es un modelo puramente de representación.
- Capacidades multilingües: no disponibles en la información proporcionada (dependen del modelo base).

## Casos de uso

- Búsqueda semántica local en macOS/iOS: indexar documentos y consultar por similitud coseno usando los vectores de 1024 dimensiones generados en el ANE, sin enviar datos a la nube y con bajo consumo.
- Reranking de resultados de recuperación: calcular embeddings de consulta y candidatos con `embed_S` y reordenar por similitud, aprovechando la fidelidad fp16 (peor coseno 0.99965 frente a fp32).
- Clustering y deduplicación de textos: agrupar pasajes de hasta 2048 tokens por proximidad vectorial en pipelines de curación de datasets.
- Clasificación zero-shot por prototipos: comparar la representación de un texto con embeddings de etiquetas descriptivas para tareas de etiquetado sin entrenamiento adicional.
- Detección de duplicados y near-duplicates en bases de conocimiento: el empaquetado por lotes (K textos por llamada) reduce el coste por documento en procesos masivos.
- Aplicaciones de privacidad en el dispositivo: asistentes de notas o correo en iOS/macOS que necesitan búsqueda semántica sin salir del dispositivo, gracias a la ejecución en el Neural Engine.
- Evaluación de calidad de recuperación: replicar métricas tipo BEIR SciFact (nDCG@10 0.7016) en entornos Apple para validar pipelines antes de desplegar en servidor.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de fidelidad numérica frente al modelo fp32 de Sentence-Transformers, medidos en un M4 Max:

| Metrica | Resultado |
|---|---|
| Peor coseno en textos golden (1 a 2048 tokens) | 0.99965 |
| Peor coseno sobre 5183 pasajes de BEIR SciFact | 0.9985 |
| SciFact nDCG@10 (ANE, fp16) | 0.7016 |
| SciFact nDCG@10 (GPU fp32-equivalente) | 0.7011 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, MTEB completo) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine (chips M-series y A-series); la función se ejecuta con `cpuAndNeuralEngine`.
- VRAM: no aplica; el modelo usa memoria unificada del SoC Apple. El repositorio ocupa 1,2 GB, incluyendo el `.mlpackage` fp16 y la tabla bf16 de `[151669, 1024]`.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este paquete Core ML; para esas plataformas habría que usar el modelo base en PyTorch/safetensors.
- Cabe en equipos consumer Apple (MacBook con M1 o superior, iPhone/iPad recientes con ANE), sujeto a los límites de memoria del dispositivo.
- Despliegue: Core ML a través de `inl serve --model Qwen/Qwen3-Embedding-0.6B --device ane` (proyecto im-not-llm). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| NomaDamas/qwen3-embedding-0.6b-ane | 0,6 B | 2048 tokens (funciones fijas) | Core ML / ANE | Apache-2.0 | Conversion fp16, fidelidad coseno 0.9985 en SciFact |
| Qwen/Qwen3-Embedding-0.6B | 0,6 B | no disponible en la informacion proporcionada | safetensors / PyTorch | Apache-2.0 | Modelo base original, ejecutable en GPU/CPU |
| Otros modelos de embeddings de ~0,6 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparación cuantitativa con alternativas de la misma categoría (por ejemplo, otros embeddings multilingües de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; no admite chat, tool calling ni razonamiento multi-paso.
- Longitud máxima limitada a 2048 tokens y a las funciones `embed_S` precompiladas; textos más largos requieren truncado o troceado.
- Precisión fp16 en el ANE: aunque la fidelidad es alta (coseno mínimo 0.9985 en SciFact), puede haber diferencias menores frente a fp32 en dominios no evaluados.
- Dependencia de plataforma: solo funciona en hardware Apple con Neural Engine; no es portable a Linux/Windows ni a GPU NVIDIA.
- La tabla de embeddings se resuelve en el host en bf16, lo que exige soporte de bf16 en el entorno de ejecución.
- Idiomas soportados no documentados en esta ficha; la cobertura multilingüe depende del modelo base y no se ha verificado aquí.
- Riesgo de sesgo y alucinación: no aplica alucinación generativa, pero los embeddings pueden heredar sesgos del corpus de entrenamiento del modelo base (no documentados en la información disponible).
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar también la licencia y condiciones del modelo base Qwen3-Embedding-0.6B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario limitados; validar en producción antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NomaDamas/qwen3-embedding-0.6b-ane
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio im-not-llm: https://github.com/NomaDamas/im-not-llm
- Script de conversión: `scripts/ane/build_qwen3.py` (dentro del repositorio im-not-llm)
- Requisitos de compilación: `scripts/ane/requirements.txt` (dentro del repositorio im-not-llm)
