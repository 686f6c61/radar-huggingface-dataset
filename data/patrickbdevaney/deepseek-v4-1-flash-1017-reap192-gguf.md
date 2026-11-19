# patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-GGUF

## Resumen
DeepSeek-V4.1-Flash-1017-REAP192-GGUF es una cuantización GGUF del modelo base DeepSeek-V4.1-Flash-1017 publicada por el usuario patrickbdevaney, no por el equipo de DeepSeek. Se trata de una versión podada mediante la técnica REAP (expert pruning) que conserva 192 de los 384 expertos enrutados por capa en una arquitectura MoE, empaquetada en un único nivel de cuantización denominado L3 con un peso en disco de 85,55 GiB repartido en tres splits. Incluye además el proyector de visión (mmproj) y el drafter DSpark del modelo original, lo que permite decodificación especulativa.

El modelo está pensado para ejecutarse en una única máquina con 128 GB de memoria y una unidad NVMe local, usando una rama específica de llama.cpp que lee las tablas Engram de 189 GiB directamente desde disco. Según el autor, en una Jetson AGX Thor alcanza 12,3-12,5 tok/s en decodificación simple y 17,3-20,7 tok/s con el drafter DSpark.

Es relevante porque demuestra la viabilidad de ejecutar un MoE de 280 mil millones de parámetros en hardware de borde mediante poda de expertos y cuantización agresiva, aunque el propio autor advierte que esta release falló por poco su criterio de calidad pre-registrado (top-1 agreement de 0,7725 frente a un umbral de 0,78).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura GGUF `deepseek41`), 40 bloques, embedding 5120, 64 cabezas / 1 KV head, key length 512 |
| Parametros totales | 280,05 B (271,79 B en expertos enrutados); tablas Engram, capas MTP y torre de visión excluidas |
| Parametros activos | 6 expertos enrutados activos de 192 por capa, más 1 experto compartido (número total de parámetros activos no disponible) |
| Longitud de contexto | Cabecera declara 1.048.576; la rama de llama.cpp lo limita por defecto a 16.384 y valida 32.768 |
| Tipos de cuantizacion | L3: 2,46 bpw medios en expertos (IQ3_XXS en capas protegidas, IQ2_XS/IQ2_XXS/IQ2_S en el resto); Q8_0 en atención, compresor, indexer y engram_wkv; Q6_K en experto compartido, token_embd y output; BF16 en router; F32 en hiperconexiones, normas, sinks y sesgos. Global: 2,62 bpw |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (3 splits L3, mmproj BF16, drafter DSpark Q8_0) |

## Arquitectura y entrenamiento
El modelo base es un transformer con mezcla de expertos (MoE) de 40 bloques, con 384 expertos enrutados por capa de los cuales 6 se activan por token, más un experto compartido. Esta versión aplica poda REAP que reduce los expertos enrutados a 192 por capa (la mitad), conservando el conjunto keep-set `1ace9b33…` registrado en la cabecera GGUF como `deepseek41.reap.keep_ids`. La ruta densa (atención, compresor, indexer, experto compartido, embeddings) se mantiene en precisiones altas (Q8_0, Q6_K, BF16, F32), mientras que la poda y cuantización agresiva se concentran en los expertos enrutados.

El autor no documenta en esta model card los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). Sí se menciona que el modelo incorpora tablas Engram de 189 GiB que la rama de llama.cpp lee desde NVMe, y que el drafter DSpark (arquitectura `dflash`, 3 bloques, 128 expertos MXFP4 cada uno) permite decodificación especulativa. No se detalla ninguna innovación adicional de atención o entrenamiento en la información disponible.

## Capacidades
- Generación de texto conversacional multi-turno, con plantilla de chat V4.1 embebida en la cabecera GGUF.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante el proyector de visión mmproj, que incluye el ViT de 32 capas del modelo base más el aligner, en BF16/F32 y sin podar.
- Razonamiento y matemáticas: capacidad inferida del modelo base DeepSeek-V4.1-Flash, aunque no se aportan benchmarks específicos en esta ficha.
- Generación de código: no documentada explícitamente en la model card; se desconoce su rendimiento en esta cuantización.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- Decodificación especulativa mediante el drafter DSpark incluido en el repositorio.

## Casos de uso
- Inferencia local en hardware de borde: el modelo está diseñado para ejecutarse en una Jetson AGX Thor con 128 GB de memoria y NVMe, lo que permite desplegar un MoE de 280 B en un dispositivo embebido con consumo contenido.
- Procesamiento de imágenes con descripción textual: gracias al mmproj incluido, puede recibir imágenes y generar texto asociado, útil para tareas de captioning o respuesta visual en local.
- Experimentación con poda de expertos: sirve como referencia práctica para investigadores que quieran evaluar el impacto de REAP en calidad y velocidad frente al modelo completo.
- Despliegue con llama.cpp en entornos sin GPU de datacenter: la rama específica permite ejecutar el modelo en un único equipo con 128 GB, sin necesidad de clústeres multi-GPU.
- Generación de texto en inglés y chino: adecuado para aplicaciones bilingües en esos dos idiomas, con la plantilla de chat V4.1 ya integrada.
- Evaluación de decodificación especulativa: el drafter DSpark incluido permite medir la ganancia de throughput (17,3-20,7 tok/s frente a 12,3-12,5 tok/s) en un caso real.
- Prototipado de asistentes conversacionales con contexto moderado: con la ventana limitada a 16.384 tokens por defecto, encaja en diálogos multi-turno de longitud media.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí reporta métricas internas de la puerta de release:

| Metrica | Resultado | Umbral |
|---|---|---|
| Top-1 agreement | 0,7725 (IC 95%: 0,712-0,829) | 0,78 (no superado) |
| KL32 | 0,508 | superado |
| Decodificacion en Jetson AGX Thor (simple) | 12,3-12,5 tok/s | — |
| Decodificacion en Jetson AGX Thor (con DSpark) | 17,3-20,7 tok/s | — |

## Requisitos de hardware
- VRAM/memoria estimada: 85,55 GiB para los pesos L3, más 0,91 GiB del mmproj y 7,43 GiB del drafter DSpark; las tablas Engram (189 GiB) se leen desde NVMe y no consumen memoria.
- GPU recomendadas: Jetson AGX Thor (probado por el autor, CUDA 13.0, sm_110). Otras GPU CUDA con 128 GB de memoria no han sido probadas según la model card.
- ¿Cabe en GPU de consumo? No: el tamaño de 85,55 GiB excede la VRAM de cualquier GPU de consumo actual; requiere 128 GB de memoria en el sistema.
- Opciones de despliegue: rama específica de llama.cpp `deepseek-v4.1-reap-thor` (basada en el PR upstream #28696 más commits de V4.1/Thor). No se documenta soporte para vLLM, TGI, Ollama u otros runtimes.
- Latencia y throughput: 12,3-12,5 tok/s en decodificación simple y 17,3-20,7 tok/s con especulación en Jetson AGX Thor, medidos por el autor el 2026-10-30. No hay datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Runtime | Decodificacion en Thor | Licencia |
|---|---|---:|---|---:|---|
| REAP192-GGUF (este repo) | GGUF L3 + mmproj + DSpark | 85,6 GiB | llama.cpp `deepseek-v4.1-reap-thor` | 12,3-12,5 tok/s; 17,3-20,7 con DSpark | MIT |
| REAP192-Thor | `thor-v1` (Q2_K/Q3_K expertos, FP8 denso, NVFP4 overlay) | 106,9 GiB | Servidor CUDA (solo Jetson AGX Thor) | 25,3 tok/s simple; 25,1-40,2 con especulación | MIT (según repo base) |
| REAP192-MXFP4 | Master bit-exacto | 151,6 GiB | No probado | — | MIT (según repo base) |

No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias
- La release L3 falló su puerta de calidad pre-registrada en top-1 agreement (0,7725 frente a 0,78), por lo que se publicó como "near-miss"; el nivel de mayor precisión L2 falló ambas métricas y no se publicó.
- El modelo está podado a la mitad de expertos enrutados (192 de 384), lo que puede degradar la calidad frente al modelo base completo en tareas que dependan de la diversidad de expertos.
- Idiomas limitados a inglés y chino según los metadatos; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- La ventana de contexto efectiva está limitada a 16.384 tokens por defecto (32.768 validados), muy por debajo de los 1.048.576 que declara la cabecera.
- Requiere una rama no estándar de llama.cpp y hardware específico (Jetson AGX Thor probado); otras GPU no han sido validadas, lo que aumenta el riesgo en producción.
- Las tablas Engram se leen desde NVMe, por lo que el rendimiento depende de la velocidad del almacenamiento local.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de sesgo en esta cuantización.
- Licencia MIT, lo que permite uso comercial, pero al ser una cuantización de terceros conviene verificar la licencia del modelo base DeepSeek-V4.1-Flash-1017.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Rama de llama.cpp: https://github.com/patrickbdevaney/llama.cpp/tree/deepseek-v4.1-reap-thor
- README de la rama (thor): https://github.com/patrickbdevaney/llama.cpp/blob/deepseek-v4.1-reap-thor/thor/README.md
- Variante REAP192-Thor: https://huggingface.co/patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-Thor
- Variante REAP192-MXFP4 (master): https://huggingface.co/patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-MXFP4
- Servidor CUDA para Jetson AGX Thor: https://github.com/patrickbdevaney/deepseek-v4.1-flash-cuda-server
