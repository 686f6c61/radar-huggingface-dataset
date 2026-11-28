# OwnZoneBD/Qwen2.5-7B-Instruct-1M

## Resumen

Qwen2.5-7B-Instruct-1M es la variante de contexto largo de la familia Qwen2.5, desarrollada originalmente por el equipo Qwen de Alibaba Cloud y redistribuida en este repositorio por el usuario OwnZoneBD. El modelo parte de la base Qwen2.5-7B y extiende la ventana de contexto hasta 1.010.000 tokens, manteniendo el rendimiento en tareas de contexto corto. Resuelve el problema del procesamiento de documentos masivos, conversaciones de larga duracion y razonamiento sobre corpus extensos sin necesidad de fragmentacion ni recuperacion externa.

Arquitectonicamente es un transformer causal decoder-only con 7.615.616.512 parametros totales (6.530 millones sin contar embeddings), 28 capas y atencion con Grouped Query Attention (28 cabezas de consulta y 4 de clave-valor). Incorpora RoPE, SwiGLU, RMSNorm y sesgo en las proyecciones QKV. La generacion maxima recomendada es de 8192 tokens.

Es relevante ahora porque la ventana de 1M tokens compite directamente con propuestas como Gemini o Claude en el segmento open source, y porque su licencia Apache 2.0 permite uso comercial sin restricciones. No obstante, este repositorio concreto no es el oficial de Qwen: es una copia redistribuida con cero descargas y cero likes en el momento de la consulta, por lo que conviene verificar la integridad de los pesos antes de desplegarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con RoPE, SwiGLU, RMSNorm y sesgo QKV |
| Parametros totales | 7.615.616.512 (7,61 B); 6,53 B sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.010.000 tokens de entrada; 8192 tokens de generacion |
| Tipos de cuantizacion | FP8 mencionado en la documentacion del framework de inferencia; el resto no disponible |
| Idiomas soportados | Ingles (declarado en la model card y en los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Capas | 28 |
| Cabezas de atencion | 28 para Q, 4 para KV (GQA) |
| Tamano del repositorio | 15,2 GB |
| Libreria | transformers (version >= 4.37.0) |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only de 28 capas. Usa Grouped Query Attention con 28 cabezas de consulta y solo 4 de clave-valor, lo que reduce el coste de memoria de la cache KV en contextos largos. Emplea RoPE para el codificado posicional, SwiGLU como activacion en las capas feed-forward, RMSNorm para normalizacion y sesgo en las proyecciones QKV. La extension de contexto hasta 1M tokens se apoya en tecnicas de extrapolacion de longitud y atencion dispersa implementadas en un fork propio de vLLM (rama `dev/dual-chunk-attn`), que segun la documentacion del autor logra una aceleracion de 3 a 7 veces para secuencias de hasta 1M tokens.

El entrenamiento incluye fases de preentrenamiento y postentrenamiento (la model card indica "Pretraining & Post-training"), aunque no se detalla el numero de tokens, la composicion del dataset ni si se emplearon RLHF o DPO. Tampoco se especifica el proceso concreto de extension de contexto ni los datos usados para el ajuste de instrucciones. El modelo base declarado es Qwen/Qwen2.5-7B y el enlace de licencia apunta al repositorio oficial de Qwen2.5-7B-Instruct-1M.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento sobre contextos extremadamente largos: hasta 1.010.000 tokens en una sola pasada.
- Procesamiento de documentos completos: libros, expedientes, bases de codigo o historiales sin trocear.
- Generacion de codigo y respuestas tecnicas derivadas del ajuste de instrucciones de Qwen2.5.
- Comprension y respuesta en ingles como idioma principal declarado.
- Integracion con `transformers` y con un fork especifico de vLLM para inferencia de contexto largo.
- No se documenta soporte explicito de tool calling, function calling, modo thinking, vision ni audio en la informacion disponible.

## Casos de uso

- Analisis de expedientes legales completos: el modelo puede ingerir contratos, demandas y jurisprudencia de cientos de miles de tokens en una sola pasada y responder preguntas cruzadas sin perder referencias entre secciones, gracias a la ventana de 1M tokens.
- Revision de bases de codigo enteras: permite cargar un repositorio completo en el contexto y solicitar auditorias de seguridad, refactorizaciones o explicaciones de arquitectura sin recurrir a RAG.
- Resumen de documentacion tecnica extensa: manuales de producto, especificaciones o papers de decenas de miles de tokens se pueden resumir y estructurar en una unica llamada.
- Atencion al cliente con historial prolongado: conversaciones de soporte de larga duracion o con muchos adjuntos textuales se mantienen en contexto sin truncar, reduciendo la perdida de informacion entre turnos.
- Analisis financiero de informes anuales: carga de memorias anuales, estados financieros y actas de consejo para extraer comparativas y detectar riesgos entre ejercicios.
- Procesamiento de historiales clinicos o cientificos: agregacion de notas, resultados y literatura para generar sintesis con trazabilidad sobre el texto original.
- Generacion de codigo en pipelines internos: su tamano de 7B permite desplegarlo en infraestructura moderada y usarlo para autocompletado o generacion de tests dentro de flujos de CI/CD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma una mejora significativa frente a la version de 128K en tareas de contexto largo, sin cifras concretas.

## Requisitos de hardware

- VRAM para secuencias de 1M tokens: al menos 120 GB en total entre GPUs para Qwen2.5-7B-Instruct-1M, segun la documentacion del autor.
- Para tareas de contexto corto, el modelo puede ejecutarse con mucha menos memoria, aunque no se especifica el minimo exacto.
- GPUs recomendadas: arquitecturas Ampere o Hopper (A100, H100) para aprovechar los kernels optimizados del fork de vLLM.
- CUDA 12.1 o 12.3 y Python entre 3.9 y 3.12 para el framework de inferencia recomendado.
- En GPUs de consumo (RTX 4090, 24 GB) cabe en cuantizaciones de 4-8 bits para contexto corto, pero no para la ventana completa de 1M tokens; no se aportan cifras oficiales de VRAM para estos escenarios.
- Despliegue recomendado: fork de vLLM `dev/dual-chunk-attn` con `tensor_parallel_size=4`, `max_model_len=1010000`, `enable_chunked_prefill=True` y `max_num_batched_tokens=131072`. Tambien es compatible con `transformers` estandar, aunque con degradacion de precision por encima de 262.144 tokens.
- Cuantizacion FP8 disponible en vLLM para reducir el uso de memoria de los pesos.
- Latencia y throughput: no disponibles; solo se indica una aceleracion de 3 a 7 veces con el framework propio para secuencias de hasta 1M tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct-1M (este repo) | 7,61 B | 1.010.000 tokens | Apache 2.0 | Hugging Face (redistribucion no oficial) |
| Qwen2.5-7B-Instruct-1M (oficial) | 7,61 B | 1.010.000 tokens | Apache 2.0 | Hugging Face (Qwen/Qwen2.5-7B-Instruct-1M) |
| Qwen2.5-7B-Instruct | 7,61 B | 131.072 tokens | Apache 2.0 | Hugging Face |
| Qwen2.5-14B-Instruct-1M | 14,7 B (aprox.) | 1.010.000 tokens | Apache 2.0 | Hugging Face; requiere al menos 320 GB de VRAM para 1M tokens |

No se dispone de datos de benchmarks para comparar el rendimiento relativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio no oficial: se trata de una redistribucion por el usuario OwnZoneBD con cero descargas y cero likes; no hay garantia de que los pesos coincidan con los del modelo original de Qwen. Verificar checksums antes de usarlo en produccion.
- Idioma: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta documentado y podria ser inferior al de la familia Qwen2.5 completa.
- Precision en contextos largos: por encima de 262.144 tokens se recomienda el fork de vLLM; con `transformers` estandar puede degradarse la calidad.
- Coste de infraestructura: procesar 1M tokens exige al menos 120 GB de VRAM agregada, lo que excluye GPUs de consumo para ese escenario.
- Alucinacion: no se documentan tasas ni mitigaciones especificas; como todo modelo generativo, puede inventar contenido, especialmente en contextos muy largos donde la atencion se dispersa.
- Sesgos: no se detalla la composicion del dataset de entrenamiento ni los procesos de alineacion, por lo que no es posible evaluar sesgos conocidos.
- Sin soporte documentado de tool calling, vision ni audio en este repositorio.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el enlace de licencia original de Qwen para confirmar terminos adicionales.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/OwnZoneBD/Qwen2.5-7B-Instruct-1M
- Modelo oficial de referencia: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-1M
- Licencia: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-1M/blob/main/LICENSE
- Blog de Qwen2.5-1M: https://qwenlm.github.io/blog/qwen2.5-1m/
- Repositorio GitHub: https://github.com/QwenLM/Qwen2.5
- Informe tecnico (arXiv 2501.15383): https://huggingface.co/papers/2501.15383
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwenlm.ai/
- Fork de vLLM: https://github.com/QwenLM/vllm (rama `dev/dual-chunk-attn`)
