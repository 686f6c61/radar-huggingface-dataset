# jgamboa/Ternary-Bonsai-2-27B-NInfer-4090

## Resumen

Ternary Bonsai 2 27B NInfer 4090 es un artefacto de despliegue publicado por el desarrollador independiente jgamboa que empaqueta el modelo multimodal Ternary Bonsai 2 27B de Prism ML en el formato propietario `.ninfer`, optimizado específicamente para una NVIDIA RTX 4090 (`sm_89`). El modelo base es una cuantización ternaria de un transformer de 27.000 millones de parámetros con torre de visión, derivado a su vez de la familia Qwen3.8, que Prism ML distribuye originalmente en GGUF. Este artefacto añade una cabeza MTP (multi-token prediction) para decodificación especulativa y unifica texto, visión y MTP en un único fichero de 6,4 GiB.

La relevancia de esta ficha radica en que demuestra un caso extremo de optimización para hardware de consumo: un modelo de 27B con contexto declarado de 262.144 tokens ejecutándose en una GPU de 24 GB de VRAM, con velocidades de decodificación de 218-252 tok/s y prefill de hasta 6.110 tok/s. El truco es la cuantización ternaria (5 pesos por byte en base 3) combinada con decodificación especulativa MTP y n-gram, más una caché KV comprimida (`rk4v4-e8`).

No obstante, el artefacto tiene una dependencia crítica: solo funciona con la build de NInfer del repositorio JGamboa/ninfer-4090-windows, en la rama `main`, y no carga en llama.cpp, vLLM ni Transformers. La licencia declarada es Apache 2.0, y el repositorio acumula 19.203 descargas con solo 2 likes, lo que sugiere interés práctico más que comunitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) con cabeza MTP para decodificación especulativa; pesos ternarios |
| Parametros totales | 27B (según nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (configuración del servidor; pool KV de ~767K tokens para 3 carriles) |
| Tipos de cuantizacion | Ternaria: repacks `t5_g128_fp16` (5 pesos por byte en base 3, una escala FP16 por cada 128 pesos); MTP en mezcla Q4/Q5 o Q8; KV en `rk4v4-e8` o int8 |
| Idiomas soportados | no disponible (la model card menciona prompts en inglés y español, y código en diez lenguajes, pero no declara lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (formato propietario de NInfer); modelo base en GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parámetros con torre de visión, cuantizado a pesos ternarios por Prism ML. La innovación central del artefacto de jgamboa es la cabeza MTP, originalmente proveniente de Qwen3.8 y entrenada contra el modelo sin cuantizar. El 11 de octubre de 2026 se publicó una versión reentrenada mediante autodestilación: Bonsai respondió a 3.342 prompts (código en diez lenguajes, chat en inglés y español, plantillas de edición, JSON y matemáticas) a través de `ninfer-serve`, y `ninfer-score-export` capturó sus estados ocultos finales y el argmax sobre 3,49 millones de tokens. Después se aplicó una época de tres pasos de borrador encadenados con teacher forcing.

El resultado de esa autodestilación es una mejora sustancial en la precisión del borrador en datos retenidos: pasos 1/2/3 pasaron de 67,8/59,7/55,3 % a 78,9/71,1/66,9 %. El modelo principal no se modifica: la decodificación especulativa solo acepta tokens que el modelo principal verifica, aunque el orden de verificación puede alterar empates en generación greedy. El artefacto conserva los códigos ternarios de Prism de forma bit-exacta y repackea los pesos como `t5_g128_fp16`. La torre de visión proviene también del modelo de Prism.

## Capacidades

- Generación de texto, razonamiento, código, matemáticas y tareas de edición de documentos.
- Procesamiento de imagen y texto (`image-text-to-text`): incluye torre de visión funcional.
- Tool calling y function calling: validado en las tareas deterministas de la model card (43 de 45 tareas, incluyendo tool calling).
- Modo thinking activado por defecto, con parámetros de muestreo recomendados (`temperature 1.0, top_p 0.95, top_k 20`).
- Decodificación especulativa con MTP de hasta 3 tokens de borrador y extensión mediante n-gram (`--ngram chain`), efectiva en código, JSON, tool calls y documentos.
- Soporte multilingüe parcial: código en diez lenguajes y chat en inglés y español según los datos de entrenamiento del MTP; no hay lista oficial de idiomas.
- Servidor con API compatible con OpenAI y Anthropic en `/v1`, más monitor en vivo en `/monitor`.
- Concurrencia de hasta 3 peticiones con contexto completo de 262K por carril en una tarjeta de 24 GB.

## Casos de uso

- Edición de código en agentes: el modo `--ngram chain` eleva el rendimiento de 250 a 532 tok/s en prompts de agente que devuelven un fichero con un cambio pequeño, lo que lo hace adecuado para bucles de edición iterativa sobre repositorios.
- Edición de documentos largos vía servidor: a través de `ninfer-serve`, la edición de un fichero de 7K-11K tokens con thinking activo alcanza 378 tok/s con MTP más n-gram, útil para reescritura y refactorización de documentación.
- Asistente de código en local con contexto masivo: los 262K tokens por petición permiten cargar repositorios medianos o expedientes completos sin truncar, con prefill de 14,4 s para 64K tokens y 37,4 s para 128K.
- Automatización de JSON y tool calling: las tareas deterministas de JSON y tool calling se resuelven con 43 de 45 aciertos, y el rendimiento en edición JSON alcanza 618-840 tok/s, adecuado para pipelines de extracción estructurada.
- Procesamiento multimodal de documentos: la torre de visión integrada permite extraer información de imágenes y capturas dentro del mismo fichero y servidor, sin componentes separados.
- Atención al cliente o chat multi-turno en español e inglés: el modelo mantiene conversaciones multi-turno con contexto largo y modo thinking, con la salvedad de que el soporte idiomático no está documentado oficialmente.
- Despliegue en estación de trabajo con una sola RTX 4090: con 6,11 GiB de pesos en VRAM (6,39 GiB con visión), queda espacio para caché KV y tres carriles concurrentes, lo que permite servir un modelo de 27B en hardware de consumo.

## Benchmarks y rendimiento

Rendimiento medido en una RTX 4090 a reloj de fábrica, Windows 11, CUDA 13.4, con `bonsai2_27b_vl_mtp_q4q5.ninfer`:

| Medición | Resultado |
|---|---:|
| Decode, MTP 2, seis prompts mixtos, greedy, thinking off | 218 tok/s |
| Decode sin especulación (`tg128`) | 129 tok/s |
| Prefill `pp512` / `pp2048` (`ninfer_bench`, KV int8) | 5.800-5.890 / 6.110 tok/s |
| Prefill con prompt de 8K / 64K / 128K tokens (needle test) | 1,3 s / 14,4 s / 37,4 s |

Decode por carga de trabajo (24-25 de septiembre de 2026, con la tarjeta también gestionando un escritorio 4K a 60 Hz, que costaba ~15 % de decode):

| Carga | MTP 2 | MTP 2 + n-gram |
|---|---:|---:|
| Prosa, greedy, thinking off | 167 tok/s | 167 tok/s |
| Prompts de agente de edición, greedy, thinking off | 250 tok/s | 532 tok/s |
| Vía `ninfer-serve`, edición de fichero de 7K-11K tokens, thinking on | 215 tok/s | 378 tok/s |
| Tres peticiones concurrentes, agregado (KV int8) | 360 tok/s | — |

Comparativa contra el fork de llama.cpp de Prism (b10709, PTQ1_0) en la misma tarjeta, 24 de septiembre de 2026:

| Métrica | NInfer | Fork de Prism |
|---|---:|---:|
| Decode sin especulación (`tg128`), escritorio 4K en ambos | 101 tok/s | 77 tok/s |
| Prefill (`pp512`) | 4.182-4.251 tok/s (5.800-5.890 actualmente) | 1.363 tok/s |
| Perplejidad, wikitext / código | 8,087 / 1,895 | 8,178 / 1,899 |

Efecto de la autodestilización del MTP (RTX 4090, MTP 3, `rk4v4-e8`, `--lm-head-draft`):

| Carga | `mtp_q4q5` | `mtp_retrained` |
|---|---:|---:|
| Seis prompts mixtos, greedy, thinking off | 225,6 tok/s | 252,1 tok/s (+11,8 %) |
| Cuatro prompts × dos semillas, muestreo de la model card, thinking on, n-gram | 190,6 tok/s | 220,5 tok/s (+15,7 %) |
| Edición de JSON y documentos, MTP 3 + n-gram, greedy | 611 / 812 tok/s | 618 / 840 tok/s |

Calidad: 43 de 45 tareas deterministas superadas (código, JSON, tool calling, matemáticas, contexto largo, español), frente a 44 de Qwen3.8-27B. Precisión del borrador MTP en datos retenidos, pasos 1/2/3: 78,9/71,1/66,9 % tras el reentrenamiento.

## Requisitos de hardware

- GPU: exclusivamente NVIDIA RTX 4090 (`sm_89`). Los ficheros no cargan en otras GPU ni en llama.cpp, vLLM o Transformers.
- VRAM: 6,11 GiB de pesos en VRAM, o 6,39 GiB con visión. Con 24 GB totales, la configuración recomendada asigna 262K de contexto a cada una de tres peticiones sobre un pool de ~767K tokens KV.
- Cabe en GPU de consumo: sí, en RTX 4090. No hay soporte documentado para otras GPU de consumo.
- Sistema operativo: Windows o Linux, con la build de NInfer del repositorio JGamboa/ninfer-4090-windows (rama `main`).
- Despliegue: binario `ninfer-serve` con flags `--spec mtp --draft-tokens 3 --lm-head-draft --ngram chain --vision --kv-dtype rk4v4-e8 --max-concurrency 3`. Existe una release prebuilt para Windows cuyo `start-bonsai-server.bat` usa el fichero recomendado.
- Throughput: 218-252 tok/s en decode con MTP, 129 tok/s sin especulación, 5.800-6.110 tok/s en prefill; 360 tok/s agregados con tres peticiones concurrentes.
- Latencia de prefill: 1,3 s para 8K, 14,4 s para 64K y 37,4 s para 128K tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decode (RTX 4090) | Prefill (pp512) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Ternary Bonsai 2 27B NInfer (este) | 27B | 262.144 | 218 tok/s (MTP 2); 129 tok/s sin especulación | 5.800-6.110 tok/s | Apache 2.0 | Solo NInfer, RTX 4090 |
| Ternary Bonsai 2 27B GGUF (Prism, fork llama.cpp) | 27B | no disponible | 77 tok/s sin especulación | 1.363 tok/s | Apache 2.0 (según base) | llama.cpp fork de Prism |
| Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | no disponible | Referencia de calidad: 44/45 tareas deterministas frente a 43/45 |

La comparativa directa solo es posible contra el GGUF original de Prism y contra Qwen3.8-27B como referencia de calidad, porque la model card no proporciona datos de otros modelos ternarios o multimodales de tamaño similar.

## Limitaciones y advertencias

- Dependencia total del runtime: los ficheros solo funcionan con la build de NInfer del repositorio JGamboa/ninfer-4090-windows (rama `main`), en RTX 4090 (`sm_89`). No hay soporte para llama.cpp, vLLM ni Transformers, lo que limita la portabilidad y crea riesgo de mantenimiento.
- Plataforma restringida: Windows o Linux únicamente; no se documenta soporte para otras GPU, incluida la gama profesional o de centros de datos.
- Idiomas no documentados: no hay lista oficial de idiomas soportados; el español aparece en los datos de entrenamiento del MTP, pero no se garantiza cobertura general.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad ni tasas de alucinación.
- Sesgos: no se documentan análisis de sesgos del modelo base ni del artefacto.
- Cuantización ternaria agresiva: la perplejidad en wikitext es 8,087 (frente a 8,178 del fork de Prism), y la calidad determinista es 43/45 frente a 44/45 de Qwen3.8-27B; puede haber degradación en tareas sensibles a precisión numérica.
- La decodificación especulativa puede alterar empates en generación greedy respecto al modelo sin MTP, aunque solo acepta tokens verificados por el modelo principal.
- El rendimiento medido incluye condiciones variables (escritorio 4K activo en algunas mediciones, que costaba ~15 % de decode), por lo que las cifras no son directamente comparables entre tablas.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la dependencia de un runtime propietario y de un único desarrollador introduce riesgo operativo para producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jgamboa/Ternary-Bonsai-2-27B-NInfer-4090
- Modelo base en Hugging Face: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Repositorio del runtime NInfer: https://github.com/JGamboa/ninfer-4090-windows/tree/main
- Herramienta de destilación MTP: https://github.com/JGamboa/ninfer-4090-windows/tree/main/tools/mtp_distill
- Notas de diseño (sección 9.1): https://github.com/JGamboa/ninfer-4090-windows/blob/main/docs/maintainer/bonsai-ternary-design.md
- Release prebuilt para Windows: https://github.com/JGamboa/ninfer-4090-windows/releases/latest
