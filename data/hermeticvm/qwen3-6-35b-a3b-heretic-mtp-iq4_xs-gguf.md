# hermeticvm/Qwen3.6-35B-A3B-heretic-MTP-IQ4_XS-GGUF

## Resumen

Qwen3.6-35B-A3B-heretic-MTP-IQ4_XS-GGUF es una cuantización en formato GGUF, tipo IQ4_XS, del modelo llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved, que a su vez es una versión con las negativas reducidas del Qwen/Qwen3.6-35B-A3B original. Lo publica el usuario hermeticvm y está pensado para ejecutarse en GPUs de consumo con 12 GB de VRAM, manteniendo parte de los expertos en RAM del sistema. El modelo base es un transformer de arquitectura MoE con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones activos por token, con 256 expertos por capa.

La característica diferencial de esta cuantización es que conserva la capa MTP (multi-token prediction) del modelo original, lo que permite decodificación especulativa en llama.cpp incluso cuando los expertos están descargados a RAM. El autor reporta ganancias de velocidad notables en tareas de reescritura de ficheros y en generación con contexto largo, con un coste aproximado de 1 GiB de VRAM adicional para el contexto del borrador.

El modelo está orientado a generación de texto, uso conversacional, tool calling y tareas de agente con contexto largo. Su licencia es Apache 2.0, heredada del modelo Qwen original. Es relevante ahora porque demuestra que es viable mantener decodificación especulativa en configuraciones con offloading de expertos, algo poco habitual en cuantizaciones de 4 bits para GPUs modestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (transformer con mezcla de expertos), 256 expertos por capa |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens nativos; probado a 131.072 |
| Tipos de cuantizacion | IQ4_XS (4,32 bits por peso); existe una variante Q4_K_M del mismo modelo heretic |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.6-35B-A3B-heretic-MTP-IQ4_XS.gguf`, 19.179.525.504 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia Qwen3.5: 35B parámetros totales, unos 3B activos por token y 256 expertos por capa. Incluye una capa MTP (multi-token prediction) en el bloque `blk.40`, con 20 tensores MTP que esta cuantización conserva íntegramente. El modelo original fue entrenado por Qwen; no se dispone de detalles sobre el número de tokens de entrenamiento ni la composición del dataset en la información proporcionada.

La variante heretic se generó con Heretic v1.3.0, una implementación de ablación ortogonal que preserva la magnitud de los pesos, aplicada sobre el modelo original para reducir las negativas. El autor reporta una divergencia KL de 0,0015 respecto al original y una reducción de negativas de 83/100 a 10/100 en su conjunto de prueba. La cuantización IQ4_XS se realizó con `llama-quantize` de llama.cpp b11541 usando la importance matrix de bartowski calculada sobre el Qwen3.6-35B-A3B original; los tensores MTP, al no tener entradas en esa matriz, se cuantizaron sin ponderación por importancia. El proceso de compresión tardó 17 minutos en un Ryzen 5 5600X.

## Capacidades

- Generación de texto y conversación multi-turno con contexto muy largo (hasta 262k tokens nativos).
- Razonamiento y resolución de tareas de agente multi-paso, con modo de pensamiento (thinking budget configurable, por ejemplo 2048 tokens en las pruebas del autor).
- Tool calling y function calling: el autor reporta 21/21 en 7 casos de tool calling repetidos 3 veces.
- Edición de código y tareas de ingeniería de software: resolución de incidencias en SWE-bench Verified Mini con mini-swe-agent.
- Reescritura y refactorización de ficheros completos, con aceleración notable mediante decodificación especulativa.
- Decodificación especulativa nativa mediante la capa MTP combinada con borradores n-gram (`--spec-type draft-mtp,ngram-mod`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles.

## Casos de uso

- Agente de resolución de incidencias de software: con mini-swe-agent en modo bash, el modelo resuelve tareas de SWE-bench Verified Mini (27/50 en las pruebas del autor), lo que lo hace adecuado para pipelines de reparación automática de bugs en repositorios pequeños y medianos.
- Asistente de refactorización de código en local: la combinación de MTP y borradores n-gram permite reescribir ficheros completos a 170-182 tokens/s, útil para renombrados masivos, migraciones de API y limpieza de código en un equipo de desarrollo con una GPU de 12 GB.
- Tool calling en producción: con 21/21 en las pruebas de llamadas a herramientas, puede integrarse como backend de agentes que consultan APIs, bases de datos o servicios internos, siempre que el operador asuma la ausencia de filtros de negativa.
- Análisis de documentación extensa: con 262k tokens de contexto nativo y buen rendimiento a 117k (21,1 tokens/s con MTP), sirve para resumir, extraer y cruzar información en repositorios de documentación o expedientes largos.
- Generación de código en local para equipos con hardware modesto: al caber en 12 GB de VRAM con offloading parcial de expertos, permite flujos de autocompletado y generación de tests sin depender de APIs externas.
- Investigación sobre alineación y robustez: al ser una variante con negativas reducidas y divergencia KL baja respecto al original, es útil para estudiar el efecto de la ablación en el comportamiento del modelo y en la calidad de las respuestas.
- Evaluación de decodificación especulativa: la conservación de la capa MTP en un modelo cuantizado con offloading lo convierte en un banco de pruebas para medir el impacto de MTP y n-gram en latencia y throughput.

## Benchmarks y rendimiento

Los datos disponibles son pruebas privadas del autor en una única máquina (AMD Radeon RX 6700 XT de 12 GB, Ryzen 5 5600X, 32 GB DDR4 a un solo canal, llama.cpp b11541), no benchmarks generales.

SWE-bench Verified Mini (50 tareas, mini-swe-agent solo bash, 150 pasos, thinking budget 2048, temperatura 0,6):

| Dificultad | Resueltas |
|---|---|
| Menos de 15 min | 13/19 |
| 15 min – 1 h | 13/23 |
| 1–4 h | 1/7 |
| Más de 4 h | 0/1 |
| Total | 27/50 |

Referencia del leaderboard publicado en las mismas 50 tareas (APIs a precisión completa, en su mayoría sin límite de pasos): Claude 4.5 Haiku 31, Kimi K2 Thinking 27, Devstral Small 2512 25, Qwen3-Coder 480B 22, gpt-oss-120b 13.

Decodificación especulativa con MTP (`--spec-type draft-mtp,ngram-mod`, temperatura 0 / 0,6):

| Tarea | Velocidad |
|---|---|
| Escritura de código nuevo | 45,1 / 44,9 tokens/s |
| Reescritura de fichero con renombrado | 170 / 182 tokens/s |
| Generación a 117k de contexto | 21,1 tokens/s (15,1 sin MTP) |
| Generación sin borradores, contexto corto | ~29 tokens/s |

Comparación con la variante Q4_K_M (21,2 GB) del mismo modelo heretic:

| Prueba | Este fichero | Q4_K_M |
|---|---|---|
| Tool calling, 7 casos × 3 | 21/21 | 21/21 |
| Tareas pequeñas de código con tests ocultos | 12/12, media 63 s | 11/12, media 89 s |
| Refactorización multi-fichero con agente (7 comprobaciones) | 3 de 3 ejecuciones correctas | 3 de 4 |
| Recuperación en contexto largo, 12 preguntas | no medido | 12/12 a 70k, 11/12 a 120k |
| VRAM libre a 128k sin borradores | 1,9 GB (`--n-cpu-moe 26`) | 0,4 GB (`--n-cpu-moe 25`) |
| Generación sin borradores | ~29 tokens/s | ~28 tokens/s |

Negativas (test de Heretic, primeros 100 prompts de `mlabonne/harmful_behaviors`, 100 tokens de respuesta, temperatura 0, razonamiento desactivado):

| Métrica | Qwen3.6-35B-A3B original (Unsloth UD-IQ4_XS) | Este fichero |
|---|---|---|
| Recuento de frases de negativa de Heretic | 99/100 | 17/100 |
| Respuestas que empiezan con una negativa | 99/100 | 2/100 |

De las 17 coincidencias de este fichero, 15 son respuestas que cumplen la petición pero contienen "disclaimer" o "illegal" más adelante; el emparejamiento por palabras clave de Heretic las cuenta igualmente.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 19,2 GB; con 24 de 40 capas de expertos en RAM del sistema y 128k de contexto quedan 1,9 GB libres en una GPU de 12 GB (`--n-cpu-moe 26`). El contexto del borrador MTP consume aproximadamente 1 GiB adicional de VRAM.
- GPU recomendadas: el autor lo probó en una AMD Radeon RX 6700 XT de 12 GB con backend ROCm. En el ecosistema NVIDIA, una RTX 3060 de 12 GB o una RTX 4070 de 12 GB permiten configuraciones equivalentes con offloading; con 24 GB (RTX 4090, A10G) o 48 GB (A6000, L40S) se reduce o elimina la necesidad de offloading. No hay datos medidos para A100 o H100 en la información disponible.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB manteniendo parte de los expertos en RAM del sistema. En una GPU de 24 GB probablemente quepa con menos offloading, aunque no se han publicado medidas.
- Opciones de despliegue: llama.cpp (versión b11541 o posterior, imprescindible para la decodificación especulativa con MTP), llama-swap para gestión de instancias, y cualquier frontend compatible con GGUF y llama.cpp. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: ~29 tokens/s sin borradores en contexto corto; 45 tokens/s escribiendo código nuevo con MTP y n-gram; 170-182 tokens/s reescribiendo ficheros; 21,1 tokens/s a 117k de contexto con MTP. La lectura de prompt ronda los 970 tokens/s en contexto corto y 440 tokens/s a 117k con `-ub 1024`, un 22% y un 15% más lenta respectivamente que sin el contexto de borrador.
- Ajuste de n-gram: `--spec-ngram-mod-n-max 256` en lugar del valor por defecto 64 aceleró las reescrituras de fichero un 49-57% sin cambios en código nuevo; 512 fue más lento en código nuevo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (IQ4_XS) | 35B totales, ~3B activos | 262k nativos, probado a 131k | GGUF IQ4_XS, 19,2 GB | Apache 2.0 | MTP conservado, negativas reducidas |
| Mismo heretic en Q4_K_M | 35B totales, ~3B activos | 262k nativos | GGUF Q4_K_M, 21,2 GB | Apache 2.0 | Sin MTP en la comparación publicada; 0,4 GB de VRAM libre a 128k |
| Qwen3.6-35B-A3B original (Unsloth UD-IQ4_XS) | 35B totales, ~3B activos | 262k nativos | GGUF IQ4_XS | Apache 2.0 | 99/100 negativas en el test de Heretic |

Referencias de rendimiento en SWE-bench Verified Mini (50 tareas) citadas por el autor, aunque no son modelos del mismo tamaño ni formato: Claude 4.5 Haiku 31/50, Kimi K2 Thinking 27/50, Devstral Small 2512 25/50, Qwen3-Coder 480B 22/50, gpt-oss-120b 13/50. Las diferencias de pocas tareas están dentro de la variación entre ejecuciones.

## Limitaciones y advertencias

- Modelo con negativas reducidas de forma deliberada: responde a peticiones que el Qwen3.6 original rechaza. El operador es responsable del uso y debe aplicar sus propios filtros si lo despliega en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para esta cuantización.
- La cuantización IQ4_XS introduce pérdida de precisión respecto al BF16. El autor indica que las diferencias de calidad frente a Q4_K_M están dentro de la variación entre ejecuciones, pero no hay una evaluación sistemática de la degradación por cuantización.
- Los tensores MTP se cuantizaron sin importance matrix, lo que puede afectar a la calidad de los borradores especulativos; no se ha medido este efecto de forma aislada.
- El contexto del borrador MTP consume ~1 GiB de VRAM, lo que en tarjetas de 12 GB obliga a `-ub 1024` y ralentiza la lectura de prompt un 22% en contexto corto y un 15% a 117k.
- Los benchmarks presentados son pruebas privadas en una sola máquina, con una única GPU AMD y configuración concreta; no son comparables directamente con resultados de leaderboards a precisión completa.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingüe de esta variante.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base incorpora modificaciones de terceros (Heretic) cuya trazabilidad conviene verificar antes de un despliegue comercial.
- El modelo requiere llama.cpp b11541 o posterior para aprovechar la decodificación especulativa con MTP; versiones anteriores pueden no soportar la combinación `draft-mtp,ngram-mod`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermeticvm/Qwen3.6-35B-A3B-heretic-MTP-IQ4_XS-GGUF
- Modelo base (heretic, MTP preservado): https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Importance matrix de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.6-35B-A3B-GGUF
- mini-swe-agent: https://github.com/SWE-agent/mini-swe-agent
- Dataset SWE-bench Verified Mini: https://huggingface.co/datasets/MariusHobbhahn/swe-bench-verified-mini
