# catplusplus/GLM-5.3-Flash-UniqueREAP-128-GrandHybrid-NVFP4-MXFP8

## Resumen

GLM-5.3-Flash-UniqueREAP-128-GrandHybrid-NVFP4-MXFP8 es una release de compresión estructural, cuantización mixta e ingeniería de serving publicada por el usuario catplusplus sobre el modelo multimodal GLM-5.3-Flash de zai-org, pasando por la variante sin censura de dealignai y por el especulador DSpark de RedHatAI. El objetivo declarado es hacer viable la inferencia de un MoE de clase 320B en una única máquina con memoria unificada de 122,8 GiB (NVIDIA Jetson/Thor, arquitectura sm_110), mediante poda de expertos enrutados y precisión mixta NVFP4/MXFP8/BF16.

La innovación central es Unique-REAP: en lugar de la poda clásica por norma de activación (REAP), que descarta especialistas ortogonales poco frecuentes y conserva clones redundantes de expertos genéricos, Unique-REAP construye una matriz de Gram normalizada por dominio sobre las salidas de los expertos y aplica eliminación greedy por complemento de Schur con protección de tokens pico. El resultado retiene 128 de 288 expertos enrutados por capa (44,4 %) conservando el 83,44 % de la saliencia bruta y el 82,32 % de la saliencia Unique-REAP, con 604 intercambios de experto respecto a REAP ingenuo.

El checkpoint final pesa 94,3 GB en el repositorio, con 77.102.834.942 parámetros declarados en safetensors y licencia MIT. Incluye además parches de sglang para SM110, un especulador DSpark MXFP8 on-policy de 4,05 GiB, scripts de perfilado, poda, cuantización y benchmarking, y un snapshot completo del código de serving modificado. Es, por tanto, tanto un modelo como un paquete reproducible de ingeniería de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención lineal KDA y DeepSeek Sparse Attention (MLA) |
| Parametros totales | 77.102.834.942 (según safetensors del repo); el modelo base se describe como MoE de clase 320B |
| Parametros activos | no disponible (top_k=8 sobre 128 expertos enrutados tras poda, más 1 experto compartido) |
| Longitud de contexto | 200K (221.184 tokens KV FP8 en vivo) |
| Tipos de cuantizacion | NVFP4, MXFP8, BF16 (mixta por capas, ModelOpt) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers), con parches y paquetes sglang en el repo |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash (clase `Glm5NextForConditionalGeneration`) consta de 45 capas: 3 densas y 42 MoE con 288 expertos enrutados, top_k=8, 1 experto compartido, 34 capas de atención lineal KDA, 11 capas de DeepSeek Sparse Attention con MLA, residuales multi-stream con hc_mult=4 y un encoder de visión ViT de 347 tensores. Sobre esta base, el autor aplica un pipeline de compresión en tres fases. Primero, perfilado por streaming capa a capa en una sola máquina (pico de 15-20 GiB) sobre 512 secuencias de calibración estratificadas (224.376 tokens: prosa inglesa, inglés→código con herramientas XML, aprendizaje de japonés y visión cotidiana) y 128 secuencias de evaluación retenidas (62.512 tokens).

Segundo, poda Unique-REAP de 288 a 128 expertos enrutados por capa. El perfilado revela que el experto compartido sin tocar aporta el 31,48 % de la norma media de salida del bloque MoE (mean_shared_ratio = 0,3148). La selección se hace por experto completo, sin promediado de pesos, de modo que el script de slicing recorta directamente los tensores NVFP4 existentes (weight, weight_scale, weight_scale_2, input_scale) con error de recuantización nulo. Tercero, cuantización mixta GrandHybrid con reglas dinámicas inspiradas en Unsloth: capas de frontera, atención, visión y expertos compartidos se protegen a mayor precisión (MXFP8/BF16), mientras los expertos enrutados intermedios permanecen en NVFP4 nativo de Blackwell. El autor documenta además que los modelos cuantizados y podados presentan colas de logits de baja probabilidad algo más planas, por lo que recomienda bajar la temperatura de muestreo de 1,0 a 0,6 para recuperar estabilidad de razonamiento y tool calling.

El paquete incluye un especulador DSpark MXFP8 on-policy con gamma=8 (4,05 GiB, 731,4 MB menos que en BF16) para decodificación especulativa, y parches de sglang para SM110 con un indexador MQA FP8 fusionado en Triton.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 200K tokens.
- Razonamiento y código, con etiqueta explícita de agentic-coding en el autor.
- Capacidades multimodales de visión: pipeline image-text-to-text y encoder ViT de 347 tensores.
- Tool calling y function calling, con especial énfasis en delimitadores `<tool_call>` preservados por la poda Unique-REAP.
- Flujos agénticos multi-paso con caché de prefijo verificada en OpenCode (94,5 %-97,3 % de aciertos, hasta 81,7K+ tokens).
- Decodificación especulativa integrada mediante el especulador DSpark gamma=8.
- Modelo abliterated/uncensored: sin alineación de rechazo, orientado a contenido sin filtros.
- Soporte de HiCache sobre NVMe para ampliar la caché de contexto fuera de memoria.

## Casos de uso

- Asistencia de código agéntica en local: el modelo puede ejecutar bucles multi-paso con tool calling sobre un repositorio, aprovechando los 200K de contexto y la caché de prefijo del 94,5 %-97,3 % en OpenCode para no reprocesar el prompt en cada turno.
- Despliegue en un único Jetson/Thor: con 122,8 GiB de memoria unificada se obtienen 12-15,3 tok/s de decodificación y ~535 tok/s de prefill plano, lo que permite servir un MoE de clase 320B en hardware embebido de gama alta sin sharding multi-nodo.
- Análisis de documentos e imágenes: al ser image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con texto largo en una sola ventana de contexto.
- Investigación sobre poda de MoE: el repositorio incluye el informe de perfilado Gram por capa, el plan de laboratorio y los scripts, lo que permite reproducir y comparar Unique-REAP frente a REAP ingenuo sobre el mismo checkpoint.
- Generación de contenido sin filtros: la variante abliterated permite casos de escritura creativa o investigación que requieren ausencia de rechazos, siempre con las advertencias de licencia y seguridad correspondientes.
- Serving de alto rendimiento con sglang: los parches SM110, DSpark e HiCache permiten montar un endpoint compatible con la API de OpenAI sobre Blackwell o Jetson Thor con decodificación especulativa activada.
- Evaluación comparativa de cuantización mixta: el pipeline GrandHybrid sirve como referencia para medir el impacto de proteger capas de frontera y atención frente a cuantizar uniformemente.

## Benchmarks y rendimiento

Los datos publicados en la información disponible son métricas de serving, no benchmarks académicos:

| Metrica | Valor |
|---|---|
| Decodificacion en Jetson/Thor (122,8 GiB) | 12-15,3 tok/s |
| Prefill plano | ~535 tok/s |
| Contexto en vivo | 200K (221.184 tokens KV FP8) |
| Aciertos de cache de prefijo OpenCode | 94,5 %-97,3 % (hasta 81,7K+ tokens) |
| Saliencia bruta retenida (128/288 expertos) | 83,44 % |
| Saliencia Unique-REAP retenida | 82,32 % |
| Intercambios de experto vs REAP ingenuo | 14,38 por capa (604 en 42 capas MoE) |
| Aportacion del experto compartido a la norma MoE | 31,48 % |
| Tamano del especulador DSpark MXFP8 | 4,05 GiB (731,4 MB menos que BF16) |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el checkpoint ocupa 94,3 GB en repo y el modelo cuantizado se describe en ~82,97 GiB tras la fase GrandHybrid; el objetivo de despliegue es una máquina con 122,8 GiB de memoria unificada.
- GPU recomendadas: NVIDIA Jetson/Thor con sm_110 y LPDDR5X unificada; GPUs Blackwell (sm_100/sm_120) para NVFP4 nativo; el perfilado se hizo con pico de 15-20 GiB por capa en streaming.
- GPU de consumo: no cabe en GPUs de consumo de 16-24 GB en su configuración completa; el autor documenta un experimento previo de 16 GB con un modelo menor (Qwen3.6-35B-A3B), no con este.
- Despliegue: sglang con los parches SM110/DSpark/HiCache incluidos; el repo incluye un snapshot completo de sglang con historial git. Se mencionan flashinfer-python 0.7.5.post1, torch 2.11.0+cu130, transformers 5.10.2, tilelang 0.1.15 y triton 3.6.0 como wheels estándar.
- Latencia y throughput: 12-15,3 tok/s de decodificación y ~535 tok/s de prefill en Jetson/Thor; no hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-UniqueREAP-128-GrandHybrid (este) | 77,1B en safetensors (base clase 320B) | 200K | NVFP4/MXFP8/BF16 mixta | MIT | Poda 288→128 expertos, serving en 122,8 GiB |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | BF16 (base) | no disponible | Modelo original sin poda ni cuantizacion mixta |
| dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Variante sin censura, 181,30 GiB, sin poda |
| RedHatAI/GLM-5.3-Flash-speculator.dspark | no disponible | no disponible | BF16 | no disponible | Especulador de decodificacion, base del DSpark MXFP8 |

La comparación con modelos de otras familias (por ejemplo, alternativas MoE de clase similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated y uncensored: no aplica filtros de rechazo, lo que implica riesgo de generar contenido dañino, ilegal o sexualmente explícito; la etiqueta not-for-all-audiences lo indica.
- La poda de expertos elimina capacidades: se retiene el 82,32 % de la saliencia Unique-REAP, por lo que cabe esperar degradación en dominios poco representados en la calibración (prosa inglesa, código, japonés y visión cotidiana).
- Riesgo de bucles de repetición en contexto largo si se usan cuantizaciones uniformes; el autor lo mitiga con precisión mixta y temperatura 0,6, pero persiste como caveat de producción.
- Colas de logits más planas tras cuantización y poda: la temperatura por defecto de 1,0 puede producir razonamiento menos estable; se recomienda 0,6.
- Idiomas soportados no documentados; la calibración incluye inglés y japonés, pero no hay evaluación multilingüe publicada.
- El hardware objetivo es muy específico (Jetson/Thor sm_110, sglang parcheado); el despliegue en otras plataformas requiere adaptar los parches y no está validado.
- Licencia MIT declarada, lo que permite uso comercial, pero el modelo base y las variantes intermedias pueden tener condiciones propias no detalladas en esta información.
- Sin benchmarks académicos publicados: no hay evidencia cuantitativa de calidad frente al modelo original más allá de las métricas de saliencia y serving.
- El repo incluye un snapshot completo de sglang con historial git; conviene revisar los parches antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/catplusplus/GLM-5.3-Flash-UniqueREAP-128-GrandHybrid-NVFP4-MXFP8
- Modelo base sin censura: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Especulador DSpark: https://huggingface.co/RedHatAI/GLM-5.3-Flash-speculator.dspark
- Experimento previo del autor (Qwen3.6-19B-A3B UniqueREAP): https://huggingface.co/catplusplus/Qwen3.6-19B-A3B-UniqueREAP-QAD-v2-Grand-Hybrid-NVFP4
