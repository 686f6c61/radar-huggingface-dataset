# prithivMLmods/Capek0.5-35B-A3B-MXFP4-MoE-GGUF

## Resumen

Capek0.5-35B-A3B-MXFP4-MoE-GGUF es una cuantización en formato GGUF, realizada por prithivMLmods con llama.cpp, del modelo Capek0.5-35B-A3B de XPENG Robotics. El modelo base es un modelo de visión-lenguaje (VLM) de mezcla de expertos (MoE) con 34,66 mil millones de parámetros totales y aproximadamente 3B activos por token, construido sobre Qwen/Qwen3.6-35B-A3B y orientado a la inteligencia encarnada (embodied intelligence) y robótica: razonamiento espacial, comprensión temporal, guía de acciones y verificación de estados.

Su entrenamiento combina aprendizaje por refuerzo con modelos especialista, fusión de pesos TIES y destilación on-policy multi-profesor enrutada (MOPD), mejorando el modelo base en 28 de 34 filas de benchmark. Destacan 70,69 en VSI-Bench, 74,19 en Video-MME, 81,22 en PointBench y 76,80 en StateBench-P, además de tasas de éxito de 63,0 % en EB-HAB y 55,3 % en EB-ALF de EmbodiedBench. Esta versión cuantizada es relevante porque permite ejecutar el modelo en hardware NVIDIA Blackwell con cuantización nativa MXFP4 (FP4 acelerado por Tensor Cores), reduciendo el uso de VRAM a unos 19 GiB frente a los 69,4 GB de la versión BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-language (arquitectura qwen3_5_moe) |
| Parametros totales | 34.660.610.688 (≈34,7B / 35B) |
| Parametros activos | ≈3B (A3B) |
| Longitud de contexto | 16.384 tokens (según la prueba documentada; no disponible un valor oficial distinto) |
| Tipos de cuantizacion | BF16, MXFP4_MOE, Q5_K_M, Q6_K, Q8_0 (más mmproj-bf16 para el proyector multimodal) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos (MoE) de la familia Qwen3.5 MoE, con 35B de parámetros totales de los cuales solo unos 3B se activan por token, lo que permite calidad cercana a modelos densos de gran tamaño con coste de inferencia mucho menor. Es un modelo multimodal que acepta texto, imagen y vídeo como entrada, con un proyector vision-language (archivo mmproj) en formato GGUF para su uso con llama.cpp.

Según la model card del modelo base, su entrenamiento integra tres técnicas: aprendizaje por refuerzo con modelos especialista (specialist reinforcement learning), fusión de pesos mediante TIES merging y destilación on-policy multi-profesor enrutada (MOPD, routed multi-teacher on-policy distillation), consolidando las capacidades de los especialistas en un único modelo. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset. La model card indica explícitamente que no soporta decodificación especulativa MTP (Speculative Decoding: No).

## Capacidades

- Comprensión multimodal: acepta texto, imagen y vídeo como entradas (pipeline image-text-to-text).
- Razonamiento espacial: evaluado en VSI-Bench (70,69) y PointBench (81,22).
- Comprensión temporal y de vídeo: puntuación de 74,19 en Video-MME.
- Guía de acciones y verificación de estados: 76,80 en StateBench-P, orientado a robótica.
- Tareas de agentes encarnados: 63,0 % de éxito en EB-HAB y 55,3 % en EB-ALF (EmbodiedBench).
- Generación de texto general y resolución de problemas matemáticos y de programación (según las pruebas de generación documentadas).
- Inferencia optimizada para GPU NVIDIA Blackwell mediante cuantización MXFP4 con aceleración nativa FP4 en Tensor Cores.
- No soporta decodificación especulativa MTP.
- No se dispone de información sobre soporte de tool calling / function calling.

## Casos de uso

- Navegación y planificación de robots domésticos: el modelo puede interpretar flujos de vídeo de cámaras embarcadas y razonar sobre el espacio 3D (VSI-Bench 70,69) para guiar acciones de manipulación y desplazamiento.
- Verificación de estados en tareas de manipulación: con 76,80 en StateBench-P, sirve como verificador de si un objeto ha sido agarrado, colocado o manipulado correctamente en un pipeline robótico.
- Agentes encarnados en entornos simulados: las tasas de éxito en EB-HAB (63,0 %) y EB-ALF (55,3 %) lo hacen adecuado como política de lenguaje para agentes en simuladores tipo habitat o ALFRED.
- Análisis y indexación de vídeo: con 74,19 en Video-MME, puede generar descripciones, resúmenes y respuestas sobre vídeos largos para sistemas de búsqueda multimodal.
- Inspección visual industrial: comprensión de imágenes y vídeo para detectar estados de máquinas, piezas o escenarios, combinando razonamiento espacial con lenguaje natural.
- Asistentes multimodales locales: gracias a la cuantización MXFP4 (19,8 GB) y a llama.cpp, se puede desplegar un VLM de 35B en una única GPU workstation con Blackwell para chat con imágenes y vídeo.
- Generación de código y razonamiento matemático: las pruebas de generación documentadas incluyen problemas de estructuras de datos en C y problemas matemáticos clásicos, útil como asistente generalista en despliegues edge con GPU.

## Benchmarks y rendimiento

Resultados publicados para Capek0.5-35B-A3B (mejoras sobre el modelo base Qwen3.6-35B-A3B en 28 de 34 filas de benchmark):

| Benchmark | Puntuación |
|---|---|
| VSI-Bench | 70,69 |
| Video-MME | 74,19 |
| PointBench | 81,22 |
| StateBench-P | 76,80 |
| EmbodiedBench EB-HAB (tasa de éxito) | 63,0 % |
| EmbodiedBench EB-ALF (tasa de éxito) | 55,3 % |

Rendimiento de inferencia de la cuantización MXFP4_MOE (RTX PRO 6000 Blackwell, 96 GB VRAM, llama-cli, 5 ejecuciones):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 238,89 tokens/s |
| Velocidad media de generación | 214,10 tokens/s |
| Tiempo total de ejecución | 80,8 s |
| Pico de VRAM en GPU | 19,07 GiB |
| Utilización pico de GPU | 88 % |
| Capas offloaded a GPU | 99 (-ngl 99) |
| KV cache (K) | q8_0 |

No se han publicado comparaciones numéricas con otros modelos concretos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - MXFP4_MOE: 19,8 GB de archivo; pico medido de 19,07 GiB con contexto de 16.384 tokens y KV cache q8_0.
  - Q5_K_M: ≈24,7 GB; Q6_K: ≈28,5 GB; Q8_0: ≈36,9 GB; BF16: ≈69,4 GB (más el mmproj de 903 MB si se usa visión).
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (probada oficialmente, 96 GB), RTX 50-series, B200 y B300 para aceleración nativa MXFP4; para cuantizaciones Q5/Q6/Q8, GPUs con 24-48 GB de VRAM (por ejemplo RTX 4090 de 24 GB solo con offload parcial o contexto reducido; A100/H100 de 40-80 GB cómodamente).
- Consumer GPUs: la variante MXFP4_MOE no cabe íntegra en una RTX 4090 (24 GB) con margen para contexto y proyector visual; sí cabe en una RTX PRO 6000 de 96 GB o en configuraciones multi-GPU. Las variantes Q5_K_M y Q6_K requieren al menos una GPU de 32 GB (RTX 5090 no alcanza con holgura; mejor RTX 6000 Ada, A6000 o multi-GPU).
- Opciones de despliegue: llama.cpp / llama-cli (probado), Ollama (formato GGUF compatible), y para el modelo base en safetensors: Transformers, vLLM y SGLang.
- Latencia y throughput: 214,10 tokens/s de generación y 238,89 tokens/s de procesamiento de prompt en RTX PRO 6000 Blackwell con offload completo (medido, no estimado).
- Sin decodificación especulativa MTP, por lo que no se beneficia de esa vía de aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Capek0.5-35B-A3B (base) | ≈35B | ≈3B | no disponible | Apache-2.0 | safetensors, GGUF (esta cuantización) |
| Qwen3.6-35B-A3B (modelo base del que deriva) | ≈35B | ≈3B | no disponible | no disponible | safetensors |
| Qwen3-VL 30B-A3B (familia comparable de VLM MoE) | ≈30B | ≈3B | no disponible | Apache-2.0 | safetensors, GGUF |

Comparación orientativa: Capek0.5 comparte la clase de tamaño y el patrón A3B con los VLM MoE de Qwen3, pero se especializa en razonamiento espacial, vídeo y tareas encarnadas, donde publica benchmarks específicos (VSI-Bench, PointBench, EmbodiedBench) que los modelos generalistas no suelen reportar. No se han publicado comparaciones directas numéricas con estos modelos en la información disponible.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés (en); no hay soporte documentado de castellano ni otros idiomas, lo que puede degradar la calidad en prompts no ingleses.
- Contexto: la prueba documentada usa 16.384 tokens; no se ha publicado un valor oficial de contexto máximo distinto, y el KV cache cuantizado a q8_0 puede afectar ligeramente a la calidad en contextos largos.
- Sesgos: no se han documentado sesgos específicos; al derivar de Qwen3.6 y entrenarse con RL y destilación, hereda potencialmente los sesgos de sus datos y profesores.
- Alucinaciones: como todo VLM generativo, puede alucinar detalles visuales o espaciales; en robótica, las salidas deben validarse antes de actuar sobre el mundo físico.
- Rendimiento dependiente de hardware: la aceleración MXFP4 nativa requiere GPUs NVIDIA Blackwell (SM120/GB202, RTX 50-series, B200/B300, RTX PRO 6000); en arquitecturas anteriores la cuantización MXFP4 puede no estar acelerada por hardware.
- Es una cuantización de terceros (prithivMLmods), no oficial de XPENG Robotics; verificar calidad frente a los pesos originales.
- Sin decodificación especulativa MTP, lo que limita el throughput máximo respecto a modelos que la soportan.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos del modelo base de XPENG Robotics para despliegues comerciales.
- Métricas de rendimiento reflejan una configuración concreta de hardware y software; el throughput real variará según prompt, build y ajustes del runtime.

## Enlaces

- Ficha en Hugging Face (cuantización GGUF): https://huggingface.co/prithivMLmods/Capek0.5-35B-A3B-MXFP4-MoE-GGUF
- Modelo base (XPENG Robotics): https://huggingface.co/xpeng-robotics/Capek0.5-35B-A3B
- Modelo base de referencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Autor de la cuantización: https://huggingface.co/prithivMLmods
- llama.cpp: https://github.com/ggml-org/llama.cpp
