# jskkd/Qwen2.5-1.5B-Instruct-GGUF

## Resumen

Qwen2.5-1.5B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo instructivo Qwen2.5-1.5B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. Este repositorio, publicado por el usuario jskkd, redistribuye los pesos del modelo base en cuantizaciones de 2 a 8 bits para su ejecucion local mediante llama.cpp, sin anadir modificaciones al modelo original.

El modelo resuelve el problema de desplegar un LLM conversacional de bajo coste en hardware modesto, manteniendo el pipeline de chat y la compatibilidad con endpoints. Con 1.777 millones de parametros totales (1.54B segun la model card, 1.31B no-embedding), 28 capas y una ventana de contexto de 32.768 tokens, esta pensado para tareas de generacion de texto, instrucciones y conversacion en entornos con recursos limitados.

Es relevante ahora porque las cuantizaciones GGUF permiten ejecutar modelos de 1.5B en CPU o GPU de consumo, y la familia Qwen2.5 incluye mejoras en instrucciones, JSON estructurado y soporte multilingue declarado de mas de 29 idiomas, aunque este repo solo declara `en` en metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, atencion QKV bias y word embeddings atados; GQA con 12 cabezas Q y 2 KV |
| Parametros totales | 1.777.088.000 (1.54B segun model card; 1.31B no-embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens; generacion de hasta 8.192 tokens |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | `en` declarado en metadatos; la model card del modelo base declara mas de 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 13,3 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal decoder-only de 28 capas con RoPE, activacion SwiGLU, normalizacion RMSNorm, sesgo en las proyecciones QKV y embeddings de palabras atados. Usa Grouped-Query Attention con 12 cabezas de query y 2 de key/value, lo que reduce el coste de memoria en KV cache durante inferencia. El modelo pasa por fases de preentrenamiento y post-entrenamiento (instruction tuning); la model card no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset, ni confirma el uso de RLHF o DPO.

La innovacion principal de la familia Qwen2.5 respecto a Qwen2 es el mayor volumen de conocimiento, mejoras en codigo y matematicas mediante modelos expertos especializados, mejor seguimiento de instrucciones, generacion de textos largos (mas de 8K tokens), comprension de datos estructurados como tablas y generacion de JSON, ademas de mayor robustez ante diversidad de system prompts. Esta version GGUF conserva el comportamiento del modelo original; la cuantizacion afecta principalmente al uso de memoria y a la fidelidad numerica.

## Capacidades

- Generacion de texto conversacional e instrucciones en formato chat.
- Razonamiento basico y respuesta a preguntas.
- Codigo y matematicas, con mejoras declaradas por la familia Qwen2.5.
- Generacion de texto largo (hasta 8.192 tokens) y contexto de 32.768 tokens.
- Comprension y generacion de datos estructurados, especialmente JSON.
- Mayor robustez ante distintos system prompts, util para role-play y chatbots.
- Capacidades multilingues declaradas en el modelo base (mas de 29 idiomas), aunque el repo solo etiqueta `en`.
- No se documenta soporte explicito de tool calling ni function calling en la informacion disponible.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32.768 tokens, suficiente para hilos largos y historial de tickets, ejecutandose en local con llama.cpp.
- Generacion de codigo asistida en entornos con recursos limitados: util para autocompletado, explicacion de fragmentos y generacion de tests, con cuantizaciones q4_K_M o q5_K_M para equilibrar calidad y memoria.
- Extraccion de datos estructurados: conversion de texto libre a JSON para pipelines de ingestion, aprovechando la mejora declarada en generacion de JSON del modelo base.
- Prototipado rapido de chatbots: despliegue con llama-cli en modo conversacion (`-co -cnv`) en portatiles o estaciones de trabajo sin GPU dedicada.
- Clasificacion y resumen de documentos: procesamiento de textos de hasta varias decenas de miles de tokens en tareas de resumen y etiquetado.
- Educacion y tutoria: generacion de explicaciones y respuestas a preguntas en ingles, con coste de inferencia muy bajo.
- Evaluacion comparativa de cuantizaciones: el repo incluye q2_K a q8_0, lo que permite medir el impacto de la cuantizacion en calidad y velocidad para un caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. La model card remite a los resultados del blog de Qwen2.5 y a la pagina de benchmarks de cuantizacion de la documentacion oficial, pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en q2_K, 2 GB en q4_K_M, 3 GB en q6_K y 4 GB en q8_0, incluyendo overhead de contexto moderado; el KV cache crece con la longitud de contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones bajas; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 4-8 GB de VRAM, y tambien en CPU pura.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, y servidores compatibles con endpoints; la model card recomienda llama.cpp.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la model card remite a la pagina de speed benchmark de Qwen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jskkd/Qwen2.5-1.5B-Instruct-GGUF | 1.777M (1.54B) | 32.768 | apache-2.0 | GGUF | Repo redistribuido, 0 descargas, 0 likes |
| Qwen/Qwen2.5-1.5B-Instruct-GGUF | 1.54B | 32.768 | apache-2.0 | GGUF | Repo oficial de Qwen |
| bartowski/Qwen2.5-1.5B-Instruct-GGUF | 1.54B | 32.768 | apache-2.0 | GGUF | Cuantizaciones adicionales de terceros |
| Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF | 1.54B | 32.768 | apache-2.0 | GGUF | Variante especializada en codigo |

## Limitaciones y advertencias

- Repositorio de terceros con 0 descargas y 0 likes; no es la distribucion oficial de Qwen, por lo que conviene verificar la integridad de los pesos frente al repo oficial.
- Solo se declara `en` en los metadatos del repo, aunque el modelo base declara multilingue; el rendimiento real en castellano no esta verificado en esta ficha.
- Riesgo de alucinacion inherente a un modelo de 1.5B; no es adecuado para tareas que requieran alta fiabilidad factual sin verificacion.
- La cuantizacion a 2-4 bits puede degradar calidad, especialmente en matematicas, codigo y JSON; se recomienda q5_K_M o superior para produccion sensible.
- El contexto de 32.768 tokens consume VRAM adicional por KV cache; en GPU de 4 GB puede requerir reducir contexto.
- Licencia apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base y citar el trabajo original.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en pipelines agenticos complejos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jskkd/Qwen2.5-1.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repo oficial GGUF: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Cuantizaciones de bartowski: https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF
- ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-1.5B-Instruct-GGUF
- Blog Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion Qwen: https://qwen.readthedocs.io/en/latest/
- Guia llama.cpp: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Benchmarks de cuantizacion: https://qwen.readthedocs.io/en/latest/benchmark/quantization_benchmark.html
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2: https://arxiv.org/abs/2407.10671
- Variante Coder: https://www.modelscope.cn/models/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF
