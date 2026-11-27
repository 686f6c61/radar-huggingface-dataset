# AtomicChat/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una compilación no censurada de los pesos de thinkingmachines/Inkling-2-Mini, publicada por AtomicChat. El modelo base es un transformer de tipo mezcla de expertos (MoE) con núcleo recurrente ("looped core") de 26.070.385.152 parámetros totales y aproximadamente 3.400 millones de parámetros activos por token, con capacidad de entrada multimodal texto-imagen. Esta versión elimina los mecanismos de rechazo y alineación restrictiva del modelo original mediante un adaptador LoRA de rango 1 aplicado sobre la corriente residual.

La relevancia de esta ficha radica en que ejemplifica una tendencia consolidada en el ecosistema abierto: la redistribución de pesos con ajustes de alineación mínimos y cuantizaciones listas para producción. AtomicChat distribuye tanto el adaptador LoRA (0,04 GB) como tres GGUF ya fusionados (Q4_K, IQ3_S e IQ2_M), de modo que el usuario puede elegir entre máxima fidelidad al BF16 original o máxima compacidad. El repositorio acumula 762.491 descargas y 933 likes en menos de una semana desde su publicación, lo que indica una adopción muy alta.

El modelo resuelve el problema de desplegar localmente un MoE multimodal de 26B con calidad cercana al original pero sin las restricciones de contenido del modelo de referencia. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, y la integración con llama.cpp (a partir de la compilación b12600) facilita su ejecución en hardware de consumo y profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con nucleo recurrente (looped core); 24 capas, de las cuales 12 son capas en bucle que comparten pesos |
| Parametros totales | 26.070.385.152 |
| Parametros activos | Aproximadamente 3.400 millones (3,4B) |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo de llama-server; el modelo base admite contexto mayor, no confirmado en la informacion disponible |
| Tipos de cuantizacion | GGUF: AD-Q4_K, AD-IQ3_S, AD-IQ2_M; LoRA en GGUF (compatible de BF16 a 1-bit); proyector visual en F16 y BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); adaptador LoRA en GGUF; pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura MoE con un núcleo recurrente: 24 capas en total, de las cuales 12 están en bucle y comparten pesos a través de las iteraciones. Esta compartición reduce el coste de memoria frente a un transformer denso equivalente y permite un razonamiento iterativo sobre la representación latente. Los 26.070 millones de parámetros totales se activan parcialmente por token (unos 3,4B), lo que sitúa el coste computacional de inferencia en el rango de un modelo denso de 3-4B pese a la capacidad de almacenamiento de un 26B. La modalidad de entrada es texto e imagen, con un proyector visual (mmproj) separado que se mantiene sin cambios respecto al original.

El ajuste de AtomicChat consiste en un LoRA de rango 1 aplicado sobre los 49 puntos que escriben en la corriente residual: la salida de atención y los expertos enrutados de las 24 capas, más el embedding de tokens. Las 12 capas en bucle comparten sus pesos a través de las tres iteraciones, de modo que el adaptador modifica el comportamiento del núcleo recurrente sin alterar la topología. No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF/DPO) ni sobre el corpus utilizado para el ajuste LoRA, más allá de que las métricas de fidelidad se midieron sobre un corpus neutro de 87 fragmentos de 4096 tokens.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 32.768 tokens en la configuración de referencia.
- Entrada multimodal texto-imagen mediante el proyector visual mmproj (F16 o BF16), heredado sin cambios del modelo base.
- Razonamiento iterativo gracias al núcleo recurrente de 12 capas en bucle, que aplica transformaciones sucesivas sobre la representación latente.
- Generación de código: los ejemplos de prueba de AtomicChat incluyen prompts de código, explicación y JSON.
- Salida estructurada en JSON, validada en las pruebas de rendimiento del autor.
- Comportamiento no censurado: ausencia de rechazos por contenido en las categorías que el modelo base filtra.
- Compatibilidad con decodificación especulativa DSpark mediante un drafter Q8_0 opcional (481 MiB).
- Integración con llama.cpp mediante la arquitectura de bucle fusionada (PR #32694) y soporte de plantillas Jinja (--jinja).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente multi-paso: no confirmadas en la información disponible.

## Casos de uso

- Asistencia conversacional sin filtros de contenido: el modelo mantiene diálogos multi-turno con 32.768 tokens de contexto y no aplica rechazos, lo que resulta adecuado para entornos de investigación en los que se necesita estudiar el comportamiento del modelo sin sesgo de alineación.
- Generación de código en local: con 3,4B parámetros activos y cuantización Q4_K (16,53 GB), se puede desplegar en una estación de trabajo con una GPU de 24 GB y generar código, explicaciones y JSON estructurado con una latencia de 46,5 tok/s en una A100 40 GB sin decodificación especulativa.
- Procesamiento de documentos con imágenes: la entrada multimodal permite extraer texto, describir figuras y responder preguntas sobre capturas o diagramas, usando el proyector visual F16 (0,64 GB) junto con el GGUF cuantizado.
- Despliegue en hardware de consumo: la cuantización IQ2_M (8,67 GB) cabe en GPUs de 12 GB y permite ejecutar un MoE de 26B en equipos domésticos, con una fidelidad top-1 del 85,7% respecto al BF16 original.
- Investigación sobre alineación y seguridad: la disponibilidad del adaptador LoRA (0,04 GB) permite aplicar o revertir el ajuste sobre cualquier GGUF del modelo base, facilitando estudios comparativos entre la versión alineada y la no censurada.
- Servicio de inferencia con decodificación especulativa: el drafter DSpark Q8_0 eleva el rendimiento de 46,5 a 59,9 tok/s (+29,0%) en A100 con una tasa de aceptación del 42,7%, adecuado para despliegues con requisitos de throughput moderado.
- Prototipado de pipelines multimodales: la compatibilidad con llama-server y las plantillas Jinja permite integrar el modelo en flujos de trabajo existentes basados en la API compatible con OpenAI (tag endpoints_compatible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona métricas de fidelidad respecto al BF16 original y de rendimiento de inferencia:

| Metrica | AD-Q4_K | AD-IQ3_S | AD-IQ2_M |
|---|---:|---:|---:|
| Tamano en disco (GB) | 16,53 | 13,34 | 8,67 |
| KLD respecto al BF16 original | 0,0115 | 0,0235 | 0,132 |
| Top-1 respecto al BF16 original | 95,6% | 93,8% | 85,7% |
| KLD del equivalente en el repo base | 0,0080 | 0,0205 | 0,130 |
| Top-1 del equivalente en el repo base | 96,3% | 94,2% | 85,7% |

| Rendimiento en A100 SXM4 40 GB (AD-Q4_K, contexto 4096, 192 tokens generados) | Tokens/s de decodificacion | VRAM pico | Tokens borrador aceptados |
|---|---:|---:|---:|
| DSpark desactivado | 46,5 | 16,42 GiB | — |
| DSpark Q8_0 | 59,9 (+29,0%) | 17,79 GiB | 42,7% (321/751) |

Pruebas adicionales con cuantizaciones menores: AD-IQ3_S aceptó 35 de 82 tokens borrador y AD-IQ2_M aceptó 41 de 65 en una completación de 64 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: 16,42 GiB con AD-Q4_K sin decodificación especulativa; 17,79 GiB con DSpark Q8_0; aproximadamente 13,3 GB con AD-IQ3_S y 8,67 GB con AD-IQ2_M (más el proyector visual de 0,64 GB).
- GPU recomendadas: A100 SXM4 40 GB (medición oficial del autor); H100 para mayor throughput; RTX 4090 (24 GB) para AD-Q4_K con margen; RTX 4080/4070 Ti (16 GB) para AD-IQ3_S; GPUs de 12 GB para AD-IQ2_M.
- Cabe en GPU de consumo: sí, con AD-IQ3_S en 16 GB y AD-IQ2_M en 12 GB; AD-Q4_K requiere 24 GB.
- Opciones de despliegue: llama.cpp (compilación b12600 o superior con soporte de la arquitectura de bucle fusionada, PR #32694); llama-server con --jinja y --mmproj; DSpark requiere una compilación con el PR #32218 (probado en el commit e4b1cb5). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: 46,5 tok/s de decodificación en A100 40 GB con AD-Q4_K y contexto de 4096; 59,9 tok/s con DSpark Q8_0. No se dispone de mediciones en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored (este) | 26,07B / 3,4B | 32.768 (config. de ejemplo) | Apache-2.0 | GGUF, LoRA | MoE con nucleo recurrente, multimodal, sin censura |
| Inkling-2-Mini (base) | 26,07B / 3,4B | No disponible | Apache-2.0 | Safetensors, GGUF | Modelo original alineado; misma arquitectura |
| Inkling-2-Mini-GGUF (AtomicChat) | 26,07B / 3,4B | No disponible | Apache-2.0 | GGUF | Cuantizaciones del base sin el ajuste no censurado |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El ajuste no censurado elimina los rechazos del modelo base, lo que puede producir contenido inapropiado, ofensivo o inseguro; no es adecuado para aplicaciones de cara al público sin capas de moderación adicionales.
- La fidelidad respecto al BF16 original disminuye con la cuantización: top-1 del 95,6% en Q4_K, 93,8% en IQ3_S y 85,7% en IQ2_M; la cuantización IQ2_M introduce una degradación notable (KLD 0,132).
- El LoRA es de rango 1; su efecto sobre capacidades distintas de la eliminación de rechazos no está documentado en la información disponible.
- No se especifican los idiomas soportados; se desconoce el comportamiento en castellano y en idiomas distintos del inglés.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos conocidos: no documentados en la información disponible; la eliminación de la alineación puede amplificar sesgos presentes en los datos de entrenamiento originales.
- La licencia Apache-2.0 permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado por una versión sin censura.
- Requiere llama.cpp b12600 o superior con la arquitectura de bucle fusionada (PR #32694); mezclar GGUF del diseño antiguo (PR #32695) con la implementación fusionada provoca incompatibilidades.
- La decodificación DSpark requiere una compilación específica con el PR #32218, lo que limita su uso a entornos controlados.
- El contexto máximo real del modelo base no se confirma en la información disponible; la configuración de ejemplo usa 32.768 tokens.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF del modelo base por AtomicChat: https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
- Guía de ejecución local: https://atomic.chat/blog/guides/how-to-run-inkling-2-mini-uncensored-locally
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
- PR de llama.cpp con la arquitectura de bucle fusionada: https://github.com/ggml-org/llama.cpp/pull/32694
- PR de llama.cpp con la implementación anterior: https://github.com/ggml-org/llama.cpp/pull/32695
- PR de llama.cpp para DSpark: https://github.com/ggml-org/llama.cpp/pull/32218
- Commit de referencia para DSpark: https://github.com/ggml-org/llama.cpp/commit/e4b1cb5318f1ac55d148be228c6347c6a94cc4c6
- Drafter DSpark Q8_0: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF/resolve/main/dspark-Inkling-2-Mini-Q8_0.gguf
