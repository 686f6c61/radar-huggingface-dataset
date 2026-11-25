# patrickbdevaney/GLM-5.3-Flash-REAP50-GGUF

## Resumen

GLM-5.3-Flash-REAP50-GGUF es una familia de cuantizaciones GGUF del modelo zai-org/GLM-5.3-Flash, publicada por el usuario patrickbdevaney. El modelo base es un transformer híbrido de tipo MoE (mezcla de expertos) con 164.910 millones de parámetros totales y una arquitectura denominada `glm5-next` en llama.cpp. La modificación principal de esta publicación es la poda de expertos mediante REAP (saliency pruning): se eliminan 144 de los 288 expertos enrutados de cada capa MoE, conservando 8 expertos activos por token, un experto compartido y un ancho de FFN de 2048 por experto.

El objetivo de esta versión es hacer viable la ejecución de un modelo de 165.000 millones de parámetros en una única máquina con 128 GB de memoria unificada (por ejemplo, una Jetson AGX Thor), ofreciendo cinco niveles de cuantización entre 67,2 y 92,5 GiB, además del proyector de visión en F16. La relevancia actual radica en que permite desplegar un modelo multimodal de contexto muy largo (1.048.576 tokens declarados) en hardware de borde, algo imposible con el modelo sin podar en precisión completa.

No obstante, el propio autor advierte en la model card que, para uso general, la versión sin podar UD-Q2_K_XL de unsloth (101 GiB) rinde mejor y carga en llama.cpp upstream, y que estos GGUF requieren un fork parcheado de llama.cpp. La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE `glm5-next`: 45 capas + 1 bloque MTP (46 bloques en GGUF); capas 0-2 con FFN densa; 34 capas de atención lineal KDA y 11 capas MLA (3, 7, …, 43); hyper-conexiones mHC con 4 flujos |
| Parametros totales | 164.907.253.550 (164,91 B), según `llama-bench` para el archivo IQ3_M, incluido el bloque MTP |
| Parametros activos | MoE con 144 de 288 expertos enrutados por capa, 8 activos por token, 1 experto compartido, ancho de FFN de experto 2048 (parámetros activos exactos: no disponible) |
| Longitud de contexto | 1.048.576 tokens en la cabecera; recuperación (retrieval) probada solo hasta 32.000 tokens |
| Tipos de cuantizacion | Q4_K_M (4,82 bits/peso), Q4_K_S (4,54), IQ4_XS (4,27), Q3_K_M (3,82), IQ3_M (3,50); proyector de visión F16; router, norms, mHC y tensores conv/state KDA en F32; `output.weight` en Q6_K; ningún tensor en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp), más `mmproj-GLM-5.3-Flash-REAP50-F16.gguf` para visión; repos hermanos en FP8 safetensors y NVFP4 safetensors |

Otros datos técnicos: tamaño oculto 4096, 64 cabezas de atención, vocabulario de 154.880 tokens, tamaño del repositorio 435,0 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con mezcla de expertos que combina dos mecanismos de atención: 34 capas de atención lineal KDA (atención lineal con estado) y 11 capas de atención MLA (Multi-head Latent Attention), distribuidas en las capas 3, 7, …, 43. Las tres primeras capas (0-2) usan FFN densa; el resto son capas MoE. El modelo incorpora hyper-conexiones mHC con 4 flujos, implementadas mediante un operador Sinkhorn en el fork de llama.cpp, y un bloque MTP (Multi-Token Prediction) adicional como bloque 45, lo que da 46 bloques en el GGUF. El modelo base es `Glm5NextForConditionalGeneration` y está pensado para entrada image-text-to-text, con una torre de visión ViT de 24 bloques y proyector de tipo `glm4v`.

Sobre el entrenamiento del modelo base, la información disponible no detalla el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Lo que sí se documenta es el proceso de poda: se aplicó REAP (saliency pruning) para eliminar la mitad de los expertos enrutados (144 de 288 por capa) y se generó una máscara v2 (pass 2). El modelo FP8 padre, construido a partir de esa máscara, alcanza un 0,8425 de concordancia top-1 con el modelo sin podar sobre 241.516 tokens reservados; los archivos GGUF en sí no han sido evaluados con esa métrica. Existe una máscara v3 posterior (pass3-hope) solo en los repos FP8 y NVFP4, sin versión GGUF, nunca evaluada de extremo a extremo y con un estimador de respaldo en su proceso de healing.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, con ventana de contexto declarada de 1.048.576 tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante la torre ViT de 24 bloques y el proyector `glm4v` en F16, no podado.
- Generación de código: el build NVFP4 de la misma máscara v2 conservó el 94,8 % de la puntuación en HumanEval+ respecto al modelo sin podar en generación emparejada.
- Predicción multi-token (MTP) mediante el bloque adicional `blk.45`, probado en el archivo IQ3_M.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente en la información disponible.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades multilingües: no disponibles (idiomas no especificados).
- Modo thinking, audio u otras capacidades especiales: no documentadas.

## Casos de uso

- Despliegue en hardware de borde con memoria unificada: el archivo IQ3_M (67,18 GiB) o Q3_K_M (73,37 GiB) permite ejecutar un modelo de 165 B en una Jetson AGX Thor con 128 GB, usando `-ngl 0 --no-repack`; todos los archivos superaron la misma puerta de carga, aritmética y perplejidad en ese dispositivo.
- Procesamiento de documentos largos con recuperación: la ventana de 1.048.576 tokens permite ingerir libros o expedientes completos, aunque la recuperación solo está validada hasta 32.000 tokens, por lo que conviene limitar el uso a ese rango en producción.
- Análisis de gráficos e imágenes técnicas: el proyector de visión F16 y los resultados de ChartQA (17/24 en IQ4_XS y 19/24 en IQ3_M) lo hacen adecuado para extracción de datos de gráficas y tablas en entornos con restricciones de memoria.
- Asistencia a la programación en máquinas de un solo nodo: la retención del 94,8 % en HumanEval+ del build NVFP4 de la misma máscara sugiere utilidad para autocompletado y generación de código en un portátil o estación con 128 GB de memoria unificada, aceptando la degradación respecto al modelo completo.
- Investigación sobre poda de expertos: los archivos sirven como referencia reproducible para estudiar el impacto de REAP al 50 % en un MoE grande, con cinco niveles de cuantización y metadatos de imatrix por archivo.
- Pruebas de cuantización y de arquitecturas híbridas KDA/MLA: el fork de llama.cpp y el parche de 15 commits sobre upstream `761797ff` permiten experimentar con el grafo híbrido y el operador mHC Sinkhorn.
- Prototipado multimodal sin GPU de datacenter: el par GGUF + mmproj permite montar un endpoint compatible con la API de OpenAI (`endpoints_compatible`) en una sola máquina, útil para demos internas.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Concordancia top-1 con el modelo sin podar | 0,8425 | Modelo FP8 padre (máscara v2) sobre 241.516 tokens reservados; los GGUF no se evaluaron así |
| HumanEval+ (retención) | 94,8 % de la puntuación del modelo sin podar | Build NVFP4 de la máscara v2, generación emparejada |
| ChartQA | 17/24 | Archivo IQ4_XS |
| ChartQA | 19/24 | Archivo IQ3_M |
| Tasa de acierto del tope de tokens | 44–72 % de los prompts de conocimiento general e instrucciones alcanzaron el límite de tokens | Build NVFP4 de la máscara v2 |
| Recuperación en contexto largo (NIAH) | Probado solo hasta 32.000 tokens | Archivo Q4_K_M |

No se han publicado resultados de MMLU, GSM8K ni otros benchmarks estándar en la información disponible. El autor señala que ninguna medición ordena los niveles de cuantización por calidad, por lo que la elección debe hacerse por memoria disponible.

## Requisitos de hardware

- VRAM/memoria estimada: entre 67,18 GiB (IQ3_M) y 92,51 GiB (Q4_K_M) para los pesos, más el proyector de visión F16 y la caché KV; el objetivo declarado es una máquina con 128 GB de memoria unificada.
- GPU recomendadas: el autor valida en Jetson AGX Thor con `-ngl 0 --no-repack`; no se documentan pruebas en A100, H100 ni RTX 4090. Por tamaño, los archivos no caben en GPU de consumo de 24 GB ni en una RTX 4090 de 24 GB.
- Cabe en GPU de consumo: no, ningún archivo cabe en una GPU consumer convencional; requiere memoria unificada de 128 GB o un pool multi-GPU.
- Opciones de despliegue: exclusivamente el fork `patrickbdevaney/llama.cpp` (rama `glm5-next-reap50-gguf-v1`), o bien aplicar `glm5-next-llama.cpp.patch` (15 commits sobre upstream `761797ff`) o el bundle incluido. llama.cpp upstream debería rechazar la carga porque espera `glm5-next.hyper_connection.count` y `glm5-next.attention.indexer.kpool`, claves que estos archivos no llevan (conclusión por lectura del código, no por prueba). vLLM, TGI y Ollama no están documentados para esta arquitectura.
- Latencia y throughput: no disponibles. El autor advierte que el build NVFP4 de la misma máscara alcanzó el tope de tokens en el 44–72 % de los prompts de conocimiento general, lo que sugiere generaciones truncadas en uso conversacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| GLM-5.3-Flash-REAP50-GGUF (este) | 164,91 B (144/288 expertos) | 1.048.576 declarados; validado a 32.000 | GGUF, MIT | Requiere fork de llama.cpp; 67,2–92,5 GiB |
| unsloth/GLM-5.3-Flash-GGUF (UD-Q2_K_XL) | 165 B sin podar | El del modelo base | GGUF, MIT | 101 GiB; carga en llama.cpp upstream; el autor lo recomienda para uso general en 128 GB |
| GLM-5.3-Flash-REAP50-FP8-v2 | 164,91 B (144/288 expertos) | El del modelo base | FP8 safetensors, MIT | Padre de estos GGUF; 0,8425 de concordancia top-1 |
| GLM-5.3-Flash-REAP50-NVFP4-v2 | 164,91 B (144/288 expertos) | El del modelo base | NVFP4 safetensors, MIT | Runtime con soporte NVFP4; retuvo 94,8 % en HumanEval+ |

No se dispone de datos de benchmarks comparativos con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Degradación por poda: la eliminación del 50 % de los expertos reduce la concordancia top-1 al 0,8425 respecto al modelo sin podar, medida sobre el FP8 padre; los GGUF no han sido evaluados con esa métrica.
- Truncamiento de generación: en el build NVFP4 de la misma máscara, entre el 44 % y el 72 % de los prompts de conocimiento general e instrucciones alcanzaron el tope de tokens, lo que indica respuestas incompletas en uso conversacional.
- El propio autor recomienda, para uso general en 128 GB, el UD-Q2_K_XL sin podar (101 GiB) antes que estos archivos, porque mide mejor y carga en llama.cpp upstream.
- Dependencia de un fork: los archivos no cargan en llama.cpp upstream según la lectura del código del autor; requieren compilar el fork o aplicar un parche de 15 commits. Esto complica el mantenimiento y la actualización.
- Contexto no validado: la ventana declarada de 1.048.576 tokens solo se probó en recuperación hasta 32.000 tokens; no hay garantía de comportamiento fiable más allá.
- Idiomas soportados no documentados: no se puede confirmar cobertura multilingüe ni calidad por idioma.
- Sin datos de sesgos, alucinación ni evaluaciones de seguridad en la información disponible.
- La máscara v3 (pass3-hope) no tiene versión GGUF, nunca se evaluó de extremo a extremo y su healing usó un estimador de respaldo; no debe asumirse como mejora disponible.
- Licencia MIT: permite uso comercial, pero al derivar de un modelo base con licencia MIT conviene conservar los avisos de copyright y verificar las condiciones del modelo original.
- Tamaño del repositorio de 435 GB: la descarga completa es costosa; conviene bajar solo el archivo y el mmproj necesarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Fork de llama.cpp: https://github.com/patrickbdevaney/llama.cpp (rama `glm5-next-reap50-gguf-v1`)
- Repo hermano FP8: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2
- Repo hermano NVFP4: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4-v2
- GGUF sin podar recomendado por el autor: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Paper referenciado en los tags: arXiv:2510.13999 (https://arxiv.org/abs/2510.13999)
- Archivos del repositorio: `GLM-5.3-Flash-REAP50-Q4_K_M.gguf`, `GLM-5.3-Flash-REAP50-Q4_K_S.gguf`, `GLM-5.3-Flash-REAP50-IQ4_XS.gguf`, `GLM-5.3-Flash-REAP50-Q3_K_M.gguf`, `GLM-5.3-Flash-REAP50-IQ3_M.gguf`, `mmproj-GLM-5.3-Flash-REAP50-F16.gguf`, `glm5-next-llama.cpp.patch`, `glm5-next-llama.cpp.bundle`
