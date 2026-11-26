# ClareNie/MemOnce

## Resumen

MemOnce es un checkpoint de post-entrenamiento que implementa una arquitectura de memoria escalable sobre el backbone congelado Qwen3.5-4B. Lo desarrolla Chang Nie y colaboradores (Fu, Liu, Hu y Shan) y se publica bajo licencia Apache 2.0. El repositorio no contiene el modelo completo, sino únicamente los modulos de memoria entrenados: unos 70,8 millones de parametros (264 MB en safetensors) que incluyen un adaptador LoRA de escritura, proyecciones de lectura KV por capa y la proyeccion de indice `mem_to_emb`.

El problema que aborda es el crecimiento del coste de memoria en modelos de lenguaje de largo horizonte. Un Transformer clasico acumula una cache KV por token que crece con la longitud de contexto y con la profundidad, mientras que los modelos lineales o recurrentes comprimen el historial en un estado acotado que pierde detalle fino. MemOnce propone cachear un unico bloque de memoria global compacto y recuperarlo una sola vez por consulta, combinando recall preciso con complejidad lineal en tiempo y un presupuesto de memoria GPU activa constante.

La relevancia actual radica en que, segun la model card, es el primer modelo de memoria nativa que supera a las lineas base de contexto completo sin olvido catastrofico, y a 1M de contexto reduce la cache GPU activa 1.313 veces, acelera el prefill 6,9 veces y mejora el throughput de decodificacion 3,5 veces. El checkpoint esta pensado para ejecutarse junto al backbone Qwen3.5-4B, que debe descargarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con modulos de memoria externos (encoder-decoder de memoria y atencion dispersa de memoria) sobre backbone Qwen3.5-4B congelado |
| Parametros totales | 70.803.456 (solo modulos de memoria; el backbone Qwen3.5-4B no esta incluido) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | segmentacion en bloques de 4.096 tokens; recuperacion top-K = 64 bloques; contexto efectivo escalable hasta 1M segun la model card |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MemOnce factoriza el ciclo de memoria en tres operaciones: escritura (`G_t = g_θ(x_{1:t-1})`), indexacion (`M_t = i_θ(x_t, G_t)`) y lectura (`C_t = u_θ(M_t)`). Solo se cachea un subconjunto final `1/r` de los estados ocultos de la ultima capa como bloques de memoria compactos, que se decodifican bajo demanda en caches KV especificas por capa. Esto elimina el factor de profundidad de la cache persistente y comprime a lo largo del tiempo (compresion profundidad-tiempo `L × r`). La atencion dispersa de memoria recupera los top-K bloques relevantes una sola vez y comparte esa decision de enrutamiento entre todas las capas de atencion y todos los pasos de decodificacion, de modo que el banco persistente puede crecer y descargarse a CPU o SSD mientras el estado activo en GPU permanece constante.

En este checkpoint concreto, las secuencias de mas de 4.096 tokens se dividen en segmentos de 4.096 tokens; cada segmento se escribe una vez como bloque de memoria de 64 tokens mediante el adaptador LoRA de memoria con rango `r = 128`. Cada bloque se describe con una proyeccion aprendida `mem_to_emb` de 1024 dimensiones y se selecciona mediante una unica pasada de similitud coseno con top-K = 64. Los bloques seleccionados se decodifican en caches KV por capa y la generacion se ejecuta con el adaptador desactivado, de forma que el historial entra estrictamente como caches KV. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO.

## Capacidades

- Modelado de lenguaje de largo horizonte y memoria continua: acumula historial en bloques de memoria y lo recupera por similitud coseno, lo que permite conversaciones y tareas con historial extenso.
- Recuperacion multi-hop: la model card menciona una demo integrada de multi-hop para consultas que requieren combinar informacion de varios turnos.
- Razonamiento sobre contexto largo con coste lineal: la atencion dispersa de memoria mantiene un presupuesto de memoria GPU constante.
- Generacion con recuperacion configurable: parametros `--retrieve-blocks` y `--max-new-tokens` para ajustar el numero de bloques recuperados y la longitud generada.
- Seleccion de implementacion de atencion: soporta `sdpa`, `flash_attention_2` y `eager`.
- Capacidades heredadas del backbone Qwen3.5-4B: no se detallan en la informacion disponible; dependen del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; la recuperacion multi-hop es la unica capacidad relacionada documentada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistentes conversacionales de largo plazo: el modelo escribe cada segmento de 4.096 tokens como un bloque de 64 tokens y recupera los top-64 bloques relevantes, lo que permite mantener historial de sesiones extensas sin que la cache KV crezca de forma cuadratica.
- Analisis de documentos largos con preguntas multi-hop: se ingiere el documento por segmentos en el banco de memoria y se consulta con preguntas que cruzan varias secciones, aprovechando la recuperacion por similitud coseno sobre `mem_to_emb`.
- Agentes con memoria persistente entre sesiones: el banco de memoria puede descargarse a CPU o SSD y recargarse, lo que encaja con agentes que necesitan recordar interacciones previas sin mantener toda la cache en GPU.
- Procesamiento de logs o historiales de atencion al cliente: se segmentan conversaciones historicas en bloques y se recuperan solo los relevantes para cada nueva consulta, reduciendo el coste de prefill frente a contexto completo.
- Investigacion en arquitecturas de memoria: el checkpoint sirve como referencia reproducible para comparar mecanismos de memoria nativa frente a Transformer, GDN lineal y YOCO, con scripts de evaluacion disponibles en el repositorio de codigo.
- Despliegue de bajo coste en GPU de consumo: al residir solo los modulos de memoria en el checkpoint (264 MB) y mantener constante el estado activo, es viable sobre GPUs con VRAM limitada siempre que se cargue el backbone Qwen3.5-4B por separado.
- RAG con memoria nativa: en lugar de un indice vectorial externo clasico, el modelo usa su propio banco de bloques y enrutamiento compartido entre capas, lo que simplifica la arquitectura de recuperacion en pipelines de generacion aumentada.

## Benchmarks y rendimiento

La model card no presenta una tabla de resultados numericos por benchmark (MMLU, HumanEval, GSM8K u otros). Solo se declaran comparaciones cualitativas y de escalado:

| Metrica | Resultado declarado |
|---|---|
| Comparacion con Transformer, GDN lineal y YOCO | Supera a las tres en distintos tamanos de modelo |
| Comparacion con M+ y Metis | Supera a ambos sin olvido catastrofico |
| Reduccion de cache GPU activa a 1M de contexto | 1.313x |
| Aceleracion de prefill a 1M de contexto | 6,9x |
| Mejora de throughput de decodificacion a 1M de contexto | 3,5x |

No se han publicado resultados de benchmarks numericos por tarea en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El checkpoint de memoria ocupa 264 MB; el backbone Qwen3.5-4B debe sumarse y su huella depende de la cuantizacion elegida (no documentada).
- GPU recomendadas: no especificadas en la informacion disponible. El soporte de `flash_attention_2` sugiere GPUs Ampere o superiores (A100, H100, RTX 30/40) para aprovechar esa implementacion.
- Compatibilidad con GPU de consumo: probable con el backbone de 4B en cuantizacion adecuada, pero no se confirma en la documentacion.
- Opciones de despliegue: script `inference.py` del repositorio de codigo con `transformers >= 5.0`; requiere descargar el backbone y el checkpoint por separado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: a 1M de contexto se declaran 6,9x de aceleracion en prefill y 3,5x en decodificacion frente a la linea base de contexto completo; no se dan valores absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MemOnce | 70,8M (modulos) + backbone Qwen3.5-4B | Segmentos de 4.096 tokens, top-K = 64 bloques, hasta 1M | Memoria nativa con encoder-decoder y atencion dispersa | apache-2.0 | Hugging Face (checkpoint) |
| M+ | no disponible | no disponible | Memoria nativa previa | no disponible | no disponible |
| Metis | no disponible | no disponible | Memoria nativa previa | no disponible | no disponible |
| YOCO | no disponible | no disponible | Cache recurrenta entre capas | no disponible | no disponible |
| GDN lineal | no disponible | no disponible | Estado recurrente acotado | no disponible | no disponible |

Los datos de M+, Metis, YOCO y GDN lineal solo se mencionan como lineas base de comparacion en la model card; no se dispone de sus especificaciones en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye el backbone: es imprescindible descargar Qwen3.5-4B por separado y usar `transformers >= 5.0`; sin el backbone el checkpoint no es funcional.
- La segmentacion fija en bloques de 4.096 tokens y la recuperacion top-K = 64 pueden perder informacion relevante si la consulta depende de fragmentos fuera de los bloques recuperados.
- La generacion se ejecuta con el adaptador desactivado y el historial entra solo como caches KV; cualquier capacidad de escritura dinamica durante la generacion no esta documentada.
- Sesgos conocidos: no disponibles en la informacion proporcionada; hereda los del backbone Qwen3.5-4B.
- Riesgo de alucinacion: no cuantificado; como modelo generativo es susceptible, especialmente cuando la recuperacion de memoria no encuentra bloques relevantes.
- Idiomas soportados: no disponibles; la cobertura multilingue depende del backbone.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del backbone Qwen3.5-4B, cuya licencia no se detalla en esta informacion.
- El checkpoint esta orientado a investigacion y evaluacion; no se documentan garantias de robustez en produccion ni pruebas de estres a gran escala.
- El numero de descargas (236) y de likes (1) es bajo, lo que sugiere poca validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ClareNie/MemOnce
- Pagina del proyecto: https://clare-nie.github.io/MemOnce/
- Backbone Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: *MemOnce: A Scalable Memory Architecture for Large Language Models* (2026), referenciado en la model card; el enlace directo al arXiv no esta disponible en la informacion proporcionada.
- Codigo, scripts de entrenamiento y evaluacion: enlazados desde la pagina del proyecto (URL directa no disponible).
