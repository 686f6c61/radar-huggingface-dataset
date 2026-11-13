# HappyHenAi/Qwen3.8-Flash-Next-UD-IQ4_XS-Abliterated

## Resumen

Qwen3.8-Flash-Next-UD-IQ4_XS-Abliterated es una cuantización GGUF de tipo IQ4_XS del modelo Qwen3.8-Flash-Next, publicada por el usuario HappyHenAi. Se trata de una versión "abliterated" (sin censura) creada mediante un transplante de tensores desde el modelo Qwen3.8-Flash-Next-Uncensored-GGUF de OrcaRouter sobre la cuantización original de Unsloth. El objetivo es eliminar los mecanismos de rechazo del modelo base manteniendo, en la medida de lo posible, sus capacidades originales.

El modelo conserva la arquitectura MoE del Qwen3.8-Flash-Next original, con 176.943.899.520 parámetros totales y una ventana de contexto configurada de hasta 262.144 tokens. La modificación afecta únicamente a 144 tensores del flujo residual (ssm_out, attn_output, ffn_down_shexp y ffn_down_exps), que fueron sustituidos por los del modelo donante sin censura.

Es relevante para desarrolladores e investigadores que necesitan un modelo de gran tamaño sin filtros de rechazo para tareas de investigación, generación creativa sin restricciones o evaluación de sesgos, y que además quieren ejecutarlo en hardware de consumo gracias a la cuantización IQ4_XS. No obstante, el propio autor advierte de que es un experimento personal, sin benchmark formal de rechazos y con regresiones medibles en perplejidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida (transformer + SSM, según nombres de tensores: ssm_out, attn_output, ffn_down_exps) |
| Parámetros totales | 176.943.899.520 |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurada en la evaluación) |
| Tipos de cuantización | IQ4_XS (GGUF, 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (4 shards, ~93,7 GB de repo) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next, un modelo MoE con componentes de atención y de espacio de estado (SSM), tal como revelan los nombres de tensores del transplante (`blk.*.ssm_out.weight`, `blk.*.attn_output.weight`, `blk.*.ffn_down_shexp.weight`, `blk.*.ffn_down_exps.weight`). La cuantización original es la UD-IQ4_XS de Unsloth, que aplica un esquema de cuantización dinámica de 4 bits con escalas por bloque.

La modificación "abliterated" consistió en un transplante de 144 tensores desde el modelo donante OrcaRouter Qwen3.8-Flash-Next-Uncensored-GGUF (revisión `98eb3357afd966c25cadd082c7f830eafde7aa52`). De estos, 13 tensores se copiaron literalmente y 131 se recodificaron a los tipos originales de Unsloth usando sus escalas de bloque, lo que introduce error de aproximación de cuantización. Se realizó una auditoría BLAKE2b sobre 1.224 tensores: 144 cambiaron y 1.080 permanecieron idénticos al original. No se aplicó RLHF ni DPO adicional; el proceso es puramente de sustitución de pesos. El autor no conserva las escalas GSQ aprendidas del método SC117, por lo que no es un transplante sin pérdidas.

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos (modo thinking con esfuerzo "xhigh" en las pruebas).
- Razonamiento científico y de conocimiento general (evaluado en GPQA Diamond y MMLU-Pro).
- Generación de código y matemáticas (capacidades heredadas del modelo base, no verificadas específicamente en esta ficha).
- Modo de razonamiento extendido con trazas de pensamiento preservadas.
- Comportamiento sin censura: el autor no encontró rechazos en los casos de uso probados, aunque no ejecutó un benchmark formal de rechazos.
- Soporte de tool calling y agentes: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Compatible con endpoints (tag `endpoints_compatible`) y con motores de inferencia GGUF.

## Casos de uso

- Investigación sobre alineación y sesgos: el modelo permite estudiar qué respuestas genera un modelo de 177B parámetros sin mecanismos de rechazo, comparándolo con la versión original de Unsloth para aislar el efecto de la abliteración en dominios sensibles.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas que el modelo base rechazaría, aprovechando la ventana de 262.144 tokens para mantener coherencia en textos largos.
- Evaluación de robustez de salvaguardas: probar sistemas de moderación o clasificadores de contenido frente a un modelo que no rechaza peticiones, midiendo la tasa de falsos negativos de dichos sistemas.
- Razonamiento científico en local: ejecución de GPQA Diamond y tareas de razonamiento complejo en una RTX 5080 de 16 GB VRAM mediante cuantización IQ4_XS, con resultados del 87,63% en GPQA Diamond según el autor.
- Experimentación con arquitecturas híbridas MoE+SSM: al conservar la estructura de tensores original, sirve para estudiar el comportamiento de modelos híbridos cuantizados a 4 bits en tareas de razonamiento de largo contexto.
- Análisis de coste de razonamiento: el autor observó un 7,3% más de tokens de finalización en GPQA, lo que permite estudiar cómo la abliteración afecta a la longitud de las trazas de razonamiento y al coste de inferencia.
- Desarrollo de pipelines de generación de texto en local: despliegue con llama.cpp u Ollama en equipos con 128 GB de RAM y GPU de 16 GB, usando el formato GGUF de 4 shards.

## Benchmarks y rendimiento

| Benchmark | Original Unsloth UD-IQ4_XS | Este modelo |
|---|---|---|
| GPQA Diamond (2 ejecuciones, 396 intentos) | 347/396, 87,63% | 347/396, 87,63% |
| MMLU-Pro subconjunto business (722 preguntas) | 657/722, 91,00% (run 1); 649/722, 89,89% (run 2) | 650/722, 90,03% (run 1); incompleto 141/156 (run 2) |
| Perplejidad diagnóstica de texto (4.995 posiciones) | 3,8956 | 4,0636 (+4,31%) |
| KL de vocabulario completo (20 posiciones, relativo al original) | Referencia | Media 0,1119 nats; mediana 0,0062; máximo 0,6481 |
| Tokens de finalización en GPQA | Referencia | ~7,3% más en dos ejecuciones |

Condiciones de evaluación: RTX 5080 de 16 GB VRAM, 128 GB RAM, Windows 11, motor Strata 0.1.59, CUDA 13.0, temperatura 1.0, top-p 0.95, top-k 20, modo thinking con esfuerzo xhigh, límite de salida de 16.384 tokens, caché KV int8, 30.720 tokens KV residentes, contexto máximo configurado 262.144, especulación MTP 5. Sin semilla aleatoria fija, por lo que las diferencias pueden reflejar variación de muestreo.

## Requisitos de hardware

- VRAM estimada: el autor ejecutó el modelo en una RTX 5080 de 16 GB VRAM con caché KV int8 y 30.720 tokens KV residentes; el repo GGUF ocupa 93,7 GB, por lo que se requiere offloading a RAM del sistema.
- RAM: 128 GB en la máquina de referencia del autor.
- GPU recomendadas: RTX 5080 (16 GB) validada por el autor; para carga completa sin offloading se necesitarían GPUs de 80 GB o más (A100, H100) o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, con offloading parcial a RAM; no cabe íntegramente en una GPU de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, motores compatibles con GGUF y endpoints (tag `endpoints_compatible`); el autor usó el motor Strata 0.1.59.
- Latencia y throughput: no disponibles de forma absoluta; el autor reporta un ~7,3% más de tokens de finalización en GPQA respecto al original, lo que implica mayor latencia y coste en modo thinking.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-Flash-Next-UD-IQ4_XS-Abliterated) | 176,9B | 262.144 | qwen-community-1.0 | GGUF IQ4_XS | Sin censura, perplejidad +4,31% |
| Unsloth Qwen3.8-Flash-Next-UD-IQ4_XS | 176,9B | 262.144 | qwen-community-1.0 | GGUF IQ4_XS | Original con censura, referencia de benchmarks |
| OrcaRouter Qwen3.8-Flash-Next-Uncensored-GGUF | 176,9B | no disponible | no disponible | GGUF IQ4_XS | Donante de tensores sin censura |
| SC117 GSQ-RCO (Qwen3.8-Flash-Next) | 176,9B | no disponible | no disponible | GGUF | Abliteración alternativa con escalas GSQ aprendidas; no comparada directamente por el autor |

## Limitaciones y advertencias

- El autor no ejecutó un benchmark formal de rechazos; la ausencia de censura se basa en pruebas informales y no está garantizada para todos los prompts.
- Regresión medible en perplejidad: 4,0636 frente a 3,8956 del original (+4,31%) en el diagnóstico de 4.995 posiciones.
- El transplante no es sin pérdidas: 131 de 144 tensores se recodificaron, añadiendo error de cuantización; no conserva las escalas GSQ del método SC117.
- Mayor consumo de tokens: ~7,3% más de tokens de finalización en GPQA, con trazas de razonamiento más largas, lo que incrementa latencia y coste.
- Sin semilla aleatoria fija en las evaluaciones, por lo que las diferencias de puntuación pueden reflejar variación de muestreo.
- El subconjunto MMLU-Pro evaluado corresponde íntegramente a la categoría business (722 de 12.032 preguntas, ~6,0%), por lo que no es un resultado amplio de MMLU-Pro.
- El modelo se distribuye bajo licencia qwen-community-1.0, que puede imponer restricciones al uso comercial; es necesario revisar los términos antes de desplegarlo en producción.
- Al ser un modelo sin censura, puede generar contenido dañino, sesgado o inexacto; requiere moderación externa en aplicaciones expuestas a usuarios.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe homogéneo.
- Es un experimento personal del autor, sin garantía de mantenimiento ni de soporte.

## Enlaces

- Hugging Face: https://huggingface.co/HappyHenAi/Qwen3.8-Flash-Next-UD-IQ4_XS-Abliterated
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Modelo donante (OrcaRouter): https://huggingface.co/OrcaRouter/Qwen3.8-Flash-Next-Uncensored-GGUF (revisión `98eb3357afd966c25cadd082c7f830eafde7aa52`)
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Paper o repositorio del método SC117: no disponible en la información proporcionada.
