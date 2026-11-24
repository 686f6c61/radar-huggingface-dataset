# hermitdave/Inkling-2-Mini-MLX-RCO-3.5bpw

## Resumen

Inkling-2-Mini-MLX-RCO-3.5bpw es una cuantización mixta de precisión del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario hermitdave. Se ha generado con el pipeline `rco-mlx` (rate-constrained optimisation) sobre Apple Silicon para producir un checkpoint MLX optimizado para inferencia local en Macs con chip de la serie M. El resultado es un artefacto de 13,63 GB que reduce el checkpoint original de 19,53 GB manteniendo una perplexity de 11,0172 frente a los 10,5150 del checkpoint nativo NVFP4 de referencia.

El modelo base es un transformer con arquitectura de tipo *looped* y mezcla de expertos (MoE), con 26.388.641.280 parámetros totales según los safetensors del repo. La cuantización emplea asignación de bits por tensor (3, 4, 6 y 8 bits) con un suelo de 3 bits para los 48 tensores de expertos enrutados, que representan el 92,6 % de los parámetros. El resto de proyecciones de atención y componentes críticos se mantienen en 4, 6 u 8 bits, y varios módulos (embeddings, lm_head, RMSNorm, router, torre de visión, kernels conv1d) permanecen en BF16.

La relevancia de esta ficha radica en que es un punto de operación concreto y medido para ejecutar un modelo MoE de ~26B parámetros en hardware de consumo Apple con un pico de 13,97 GB de RAM y 31,4 tok/s de decodificación. No existe una release BF16 del modelo base: los expertos se distribuyen en NVFP4 (capas 0-19) y MXFP8 (capas 20-23), lo que condiciona la fidelidad de cualquier recuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y arquitectura *looped* (inkling2_loop) |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona pruebas con ~4,5k de contexto, sin especificar el máximo) |
| Tipos de cuantizacion | Mixta afín de 3, 4, 6 y 8 bits (3,53 bpw reales sobre pesos cuantizados; 4,13 bpw sobre el checkpoint completo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `inkling2_loop.py` como implementación de arquitectura embebida |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura de transformer con mezcla de expertos y un diseño *looped*: el mismo bloque de capas se reutiliza en varias visitas, con mecanismos de mensajes entre bucles (loop-message queries, puertas de mensaje de rango 64 y una tabla de logits relativos). Incluye además una torre de visión, aunque esta ficha se centra en el motor de texto. La implementación de referencia vive en dos pull requests en borrador del repositorio mlx-lm (números 2086 y 2061), lo que significa que la arquitectura no está registrada en ninguna release pública de mlx-lm.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. Lo que sí se documenta es el proceso de cuantización: los expertos enrutados del checkpoint publicado están almacenados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23), y el resto de pesos en BF16. RCO requiere pesos en coma flotante, por lo que los expertos se de-cuantizaron primero a BF16 mediante una reconstrucción exacta respecto al checkpoint distribuido, pero que no recupera el BF16 original (el redondeo NVFP4 ya está incorporado). Sobre esa base se aplicó una optimización con restricción de tasa que asigna bits por tensor: 48 tensores a 3 bits, 120 a 4 bits, 24 a 6 bits y 32 a 8 bits (224 tensores cuantizados en total).

## Capacidades

- Generación de texto autoregresiva en el runtime MLX, verificada en mlx-lm 0.32.2 y en la versión empaquetada de oMLX (0.32.3.dev8).
- Razonamiento y conocimiento general medidos en cinco tareas zero-shot: arc_challenge, arc_easy, hellaswag, winogrande y mmlu, con una recuperación media de 0,9777 respecto al checkpoint nativo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (el campo de idiomas no está poblado en el repo).
- Capacidad de visión: el checkpoint incluye una torre de visión completa en BF16, pero la configuración de oMLX documentada fuerza el motor de texto con `model_type_override: "llm"`.
- Cabeza MTP (multi-token prediction): el draft DSpark (`mtp.safetensors`, 636 MB) no está incluido en este repo, por lo que la decodificación especulativa no está disponible en este artefacto.

## Casos de uso

- Inferencia local en Mac con chip de la serie M: el checkpoint está diseñado para `mlx-lm` y se ha validado en un M3 Max de 64 GB con un pico de 13,97 GB de RAM, lo que permite ejecutar un MoE de ~26B parámetros en un portátil de gama alta sin GPU dedicada.
- Asistentes de código en el editor: con 31,4 tok/s de decodificación y 311 tok/s de prefill en mlx-lm, es viable para autocompletado interactivo y generación de fragmentos de código en flujos de trabajo locales donde la latencia percibida importa.
- Servicio de chat en local mediante oMLX: la integración documentada permite servir el modelo con 665 tok/s de prefill en frío y 27,9 tok/s de decodificación a ~4,5k de contexto, adecuado para prototipos de asistentes conversacionales en una sola máquina.
- Procesamiento por lotes de documentos en estaciones de trabajo Apple: el tamaño reducido (13,63 GB) y la carga autocontenida permiten dejar el modelo residente en memoria y procesar colas de tareas de resumen o extracción sin depender de la nube.
- Evaluación comparativa de cuantizaciones: al publicar métricas de perplexity, KL, acuerdo top-1 y recuperación zero-shot frente al checkpoint nativo NVFP4, sirve como referencia reproducible para estudiar el impacto de la cuantización mixta en modelos MoE con expertos ya comprimidos.
- Investigación sobre arquitecturas *looped*: el repo incluye `inkling2_loop.py`, una implementación de un solo archivo de la arquitectura, útil para experimentar con el patrón de reutilización de bloques y los mecanismos de mensajes entre bucles.
- Despliegue en entornos con `trust_remote_code=True`: al no existir registro de la arquitectura en mlx-lm, este checkpoint es una vía práctica para ejecutar Inkling-2-Mini sin parchear el árbol de dependencias.

## Benchmarks y rendimiento

| Metrica | Valor | Referencia (NVFP4 nativo) |
|---|---|---|
| Perplexity (WikiText-2, 8×256 filas) | 11,0172 | 10,5150 (+0,50) |
| KL respecto al checkpoint NVFP4 nativo | 0,0669 | — |
| Acuerdo top-1 vs nativo | 89,36 % | — |
| Recuperación zero-shot (5 tareas, n=400) | 0,9777 media | — |
| arc_challenge | 0,954 | — |
| arc_easy | 0,989 | — |
| hellaswag | 0,979 | — |
| winogrande | 0,995 | — |
| mmlu | 0,971 | — |
| Decode tok/s (mlx_lm local, 128 tok) | 31,4 | 28,6 |
| Prompt tok/s (mlx_lm local) | 311 | 264 |
| RAM pico (mlx_lm) | 13,97 GB | 19,82 GB |
| Carga en oMLX | 12,86 GB | — |
| Prefill oMLX (frío, ~4,5k ctx) | 665 tok/s | — |
| Decode oMLX (~4,5k ctx) | 27,9 tok/s | — |

Tamaños comparados:

| | Checkpoint publicado | Cuantización 4,5 bpw | Esta cuantización |
|---|---|---|---|
| Tamaño total | 19,53 GB | 16,57 GB | 13,63 GB |
| bpw sobre pesos cuantizados | ~5,13 (expertos) | 4,46 | 3,53 |
| bpw sobre checkpoint completo | 5,90 | 5,02 | 4,13 |

## Requisitos de hardware

- VRAM/RAM unificada estimada: 13,97 GB de pico medido en mlx_lm y 12,86 GB de huella de carga en oMLX. El repo ocupa 13,7 GB en disco.
- GPU recomendadas: el artefacto es específico de MLX y está pensado para Apple Silicon. Se ha validado en un M3 Max de 64 GB.
- Cabe en GPU de consumo: sí, en chips Apple de la serie M con al menos 16 GB de memoria unificada, aunque los 13,97 GB de pico dejan poco margen en configuraciones de 16 GB; 24 GB o más es lo recomendable. No está pensado para GPU NVIDIA o AMD.
- Opciones de despliegue: `mlx-lm` (versión 0.32.2 verificada) y oMLX (con `mlx-lm` 0.32.3.dev8). Requiere `trust_remote_code=True` porque `config.json` apunta a `inkling2_loop.py` como `model_file`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 31,4 tok/s de decodificación y 311 tok/s de prefill en mlx_lm local con 128 tokens generados; 27,9 tok/s de decodificación y 665 tok/s de prefill en oMLX con ~4,5k de contexto. El prefill en frío de oMLX es notablemente más rápido que el de mlx_lm en la medición reportada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| hermitdave/Inkling-2-Mini-MLX-RCO-3.5bpw | 26,39B | no disponible | Apache 2.0 | safetensors MLX / mlx-lm, oMLX | 3,53 bpw, 13,63 GB, PPL 11,0172 |
| thinkingmachines/Inkling-2-Mini (nativo NVFP4) | 26,39B | no disponible | Apache 2.0 | safetensors NVFP4/MXFP8 | 19,53 GB, PPL 10,5150, referencia de calidad |
| Cuantización 4,5 bpw del mismo modelo base | 26,39B | no disponible | Apache 2.0 | safetensors MLX | 16,57 GB, 4,46 bpw sobre pesos cuantizados |

No se dispone de datos de benchmarks de modelos alternativos de otros autores en la información proporcionada, por lo que la comparativa se limita a los tres puntos de operación del mismo modelo base documentados en la model card.

## Limitaciones y advertencias

- La reconstrucción de los expertos no recupera el BF16 original: el redondeo NVFP4 de las capas 0-19 ya está incorporado en el checkpoint distribuido, por lo que en esas capas el resultado puede igualar al nativo NVFP4 pero no superarlo. El coste de calidad de esta cuantización se concentra precisamente ahí.
- La recuperación zero-shot no es lossless: la media es 0,9777 y la peor tarea (arc_challenge) baja al 0,954. No es adecuada para aplicaciones donde una pérdida de precisión de un 2-5 % en tareas de razonamiento sea inaceptable.
- Requiere `trust_remote_code=True` y ejecuta código Python incluido en el repo (`inkling2_loop.py`). Esto implica una superficie de riesgo de seguridad y de compatibilidad: el archivo está generado por `rco-mlx/scripts/build_standalone_inkling2.py` y no debe editarse a mano.
- La arquitectura no está registrada en ninguna release de mlx-lm; depende de dos pull requests en borrador (#2086 y #2061). Si esos PRs cambian antes de fusionarse, la compatibilidad futura no está garantizada.
- La cabeza MTP (DSpark) no está incluida, por lo que no hay decodificación especulativa disponible en este artefacto.
- La torre de visión está presente en BF16 pero la configuración de oMLX documentada fuerza el motor de texto; no hay validación publicada de inferencia multimodal con este checkpoint.
- No hay información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación en la información proporcionada.
- El modelo está atado al ecosistema MLX y Apple Silicon; no es desplegable en GPU NVIDIA/AMD ni en runtimes estándar de servidor sin conversión adicional.
- La licencia Apache 2.0 permite uso comercial, pero la procedencia del checkpoint base (NVFP4/MXFP8 sin release BF16) conviene revisarla si se va a redistribuir o derivar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hermitdave/Inkling-2-Mini-MLX-RCO-3.5bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- PR de mlx-lm para la arquitectura looped Mini: https://github.com/ml-explore/mlx-lm/pull/2086
- PR de mlx-lm relacionado: https://github.com/ml-explore/mlx-lm/pull/2061
