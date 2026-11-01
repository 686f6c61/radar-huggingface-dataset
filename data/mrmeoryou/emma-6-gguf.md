# MrMeOrYou/emma-6-GGUF

## Resumen

Emma-6 (GGUF) es una conversión no oficial al formato GGUF del modelo Emma-6, un modelo de lenguaje causal en italiano desarrollado por la empresa italiana Egomnia S.p.A. La conversión ha sido realizada por el usuario MrMeOrYou a partir del export oficial en ONNX FP32 publicado en el repositorio `egomnia/emma-6`, verificando los pesos contra los checksums originales y comprobando que los logits coinciden con el modelo de referencia dentro de una tolerancia de 2,4e-4.

Emma-6 resuelve un problema concreto: la escasez de modelos de lenguaje abiertos optimizados específicamente para italiano. Con aproximadamente 1.549 millones de parámetros (1,55B), es un modelo ligero pensado para conversación y generación de texto en italiano, con una longitud de contexto máxima de 4.096 tokens. Su relevancia actual radica en que Egomnia lo ofrece también como servicio comercial, y esta conversión GGUF permite ejecutarlo localmente con llama.cpp sin necesidad de builds personalizados ni parches.

El repositorio destaca por el rigor de la conversión: se han publicado 24 variantes de cuantización (desde F32 hasta Q2_K), todas reproducibles de forma determinista y verificadas con SHA-256. El tokenizador SentencePiece original se conserva, y el chat template, que no fue publicado oficialmente, fue reconstruido empíricamente y se incluye embebido en los ficheros GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura `llama` en llama.cpp), con GQA y SwiGLU |
| Parametros totales | 1.548.879.872 (~1,55B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | F32, F16, BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_M, IQ3_S, Q2_K, MXFP4_MOE (TQ2_0, TQ1_0 y Q1_0 publicados pero no utilizables) |
| Idiomas soportados | Italiano |
| Licencia | OpenRAIL |
| Formato de pesos | GGUF (convertido desde ONNX FP32; tokenizador SentencePiece) |

## Arquitectura y entrenamiento

Emma-6 es un transformer decoder-only con atención agrupada por consultas (GQA) y activaciones SwiGLU, tokenizador SentencePiece y embeddings atados (tied embeddings): la cabecera de salida `lm_head` es bit a bit idéntica a la matriz de embeddings de tokens, por lo que en la conversión GGUF no se almacena dos veces y llama.cpp reutiliza `token_embd` como capa de salida. No incorpora capas de mezcla de expertos (MoE); de hecho, la variante `MXFP4_MOE` resulta en la práctica equivalente a `Q8_0` en tamaño y calidad.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens de entrenamiento ni el uso de técnicas de alineación como RLHF o DPO. La conversión GGUF incluyó adaptaciones técnicas documentadas: reordenación de las proyecciones Q y K del layout half-split (GPT-NeoX) al interleaved (GPT-J) para RoPE, embebido del chat template en los metadatos del fichero y embebido del preset oficial de parámetros de muestreo. La conversión se verificó contra el modelo ONNX original: los logits coinciden dentro de 2,4e-4 hasta 2.601 tokens de contexto, la generación greedy es idéntica token a token y el sampler de llama.cpp reproduce la distribución de muestreo de referencia.

## Capacidades

- Generacion de texto conversacional en italiano, con formato de chat multi-turno (`<|system|>`, `<|user|>`, `<|assistant|>`).
- Pipeline de text-generation compatible con llama.cpp (llama-cli, llama-server) y servidores compatibles con la API de OpenAI.
- Plantilla de chat embebida en los ficheros GGUF, aplicada automaticamente por llama-cli, llama-server y clientes que usen `tokenizer.chat_template`.
- Parámetros de muestreo por defecto embebidos (preset oficial de Egomnia en los metadatos `general.sampling.*`).
- Ejecucion en CPU o GPU sin software adicional: los ficheros funcionan en la versión oficial y sin modificar de llama.cpp (verificado con el release `b12012`).
- No hay información publicada sobre soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistentes conversacionales en italiano: el formato de chat multi-turno con tokens dedicados y contexto de 4.096 tokens permite construir chatbots que mantienen conversaciones de varios turnos en italiano con coste de inferencia muy bajo.
- Despliegue local en hardware modesto: con ~1,55B de parámetros, la variante Q4_K_M cabe en GPUs de consumo o incluso en CPU, lo que lo hace adecuado para aplicaciones on-premise donde no se quiere enviar texto a servicios externos.
- Integración en servicios vía API local: `llama-server` expone un endpoint compatible con OpenAI, de modo que se puede integrar en aplicaciones existentes cambiando solo la URL base.
- Prototipado y evaluación de LLMs italianos: la disponibilidad de 24 variantes de cuantización verificadas permite estudiar el compromiso entre precisión y recursos (por ejemplo, midiendo perplexidad en texto italiano de referencia).
- Reproducción del comportamiento del servicio comercial de Egomnia: la conversión reproduce la generación greedy y la distribución de muestreo del modelo original, útil para equipos que quieran validar localmente el comportamiento del servicio.
- Generación de texto en italiano en pipelines offline o embebidos: al no requerir builds personalizados de llama.cpp, se puede empaquetar en contenedores ligeros para procesamiento de texto en italiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato cuantitativo publicado es la perplexidad del propio repositorio de conversión: 127,6 en un texto italiano de referencia para el fichero F32, frente a más de 170.000 para las variantes ternarias TQ2_0 y TQ1_0 y Q1_0, que por ello se consideran no utilizables.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con ~1,55B de parámetros, la variante F16 ocupa en torno a 3 GB y Q4_K_M en torno a 1 GB, mientras que F32 requiere aproximadamente 6 GB (estimaciones basadas en el tamaño de parámetros, no en cifras publicadas).
- GPUs recomendadas: no disponible. Al tratarse de un modelo de 1,55B, cualquier GPU moderna con 4 GB o más de VRAM es suficiente para las cuantizaciones habituales; también funciona solo con CPU (omitir `-ngl 99`).
- Cabe en GPUs de consumo: sí, en la práctica en prácticamente cualquier GPU de consumo para las variantes desde Q8_0 hacia abajo; incluso F16 cabe en GPUs de 4 GB.
- Despliegue: llama.cpp oficial sin modificar (verificado con release `b12012`), vía `llama-cli` (chat interactivo o prompt único) o `llama-server` (API compatible con OpenAI). No se menciona soporte en vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Emma-6 (este modelo, GGUF) | ~1,55B | 4.096 | OpenRAIL | GGUF, 24 variantes, llama.cpp |
| Gemma 3 1B (Google) | ~1B | 32.000 | Gemma | Multiformato, multilingüe |
| Qwen3 1.7B (Alibaba) | ~1,7B | no disponible en esta ficha | Apache 2.0 | Multiformato, multilingüe |

Nota: la comparación es orientativa; Emma-6 se distingue por su especialización en italiano y por no ser un modelo MoE. No hay datos de benchmarks que permitan comparar rendimiento numérico.

## Limitaciones y advertencias

- Es una conversión no oficial: el repositorio no está afiliado a Egomnia S.p.A., que conserva la autoría y los derechos del modelo original.
- El chat template fue reconstruido empíricamente, no publicado por Egomnia; el system prompt por defecto («Sei Emma-6, un assistente AI italiano sviluppato da Egomnia S.p.A.») es una estimación del conversor, no el system prompt oficial del servicio (que tiene unos 95 tokens y texto no público).
- Sin system prompt, el modelo no sabe de forma fiable que es Emma y responde peor.
- Las variantes TQ2_0, TQ1_0 y Q1_0 producen texto sin sentido (perplexidad superior a 170.000) y no deben usarse; la precisión mínima utilizable es Q2_K.
- Idioma: el modelo está orientado a italiano; no hay información sobre rendimiento en otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o RAG con mucho contexto.
- No hay datos de benchmarks ni evaluaciones de sesgos o alucinaciones publicadas; se desconoce su comportamiento en tareas de código, matemáticas o razonamiento.
- Licencia OpenRAIL: permite uso comercial con restricciones de uso responsable; conviene revisar las condiciones específicas del fichero de licencia antes de desplegar en producción.
- La conversión se verificó hasta 2.601 tokens de contexto; el comportamiento más allá de esa longitud no está documentado en la ficha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/MrMeOrYou/emma-6-GGUF
- Modelo original (Egomnia S.p.A.): https://huggingface.co/egomnia/emma-6
- Commit de referencia de la conversión: https://huggingface.co/egomnia/emma-6/tree/2664c31400e354ac4a6719fce0030a92efe81cce
- llama.cpp: https://github.com/ggml-org/llama.cpp
