# jonpojonpo/Llandudno-9B

## Resumen
Llandudno-9B es un modelo de chat orientado al galés (cymraeg) desarrollado por jonpojonpo, un ajuste fino de Qwen3.5-9B realizado en el Reino Unido sobre una única RTX 4090. El modelo conserva las capacidades modernas de la familia base (modo thinking, tool calling nativo, contexto largo, visión y cabeza de predicción multi-token) y añade un rendimiento sustancialmente mejor en galés, incluyendo razonamiento, traducción, registro formal e informal y cierta conciencia de las variantes dialectales del norte (Gog) y del sur (Hwntw).

El modelo parte de Qwen3.5-9B, un transformer denso de 9.653.104.368 parámetros totales según los pesos en safetensors, con licencia Apache 2.0. Se distribuye en formato safetensors con un repositorio de 19,3 GB. Está pensado para desarrolladores e investigadores que necesitan un modelo local competente en lenguas celtas y en inglés, con soporte adicional (aunque no evaluado de forma separada) de irlandés, gaélico escocés y escocés.

Su relevancia radica en que demuestra que un ajuste fino artesanal, con recursos muy limitados, puede superar al modelo base en una tarea de nicho: Llandudno-9B obtiene 58,07 en CymraegBench frente a 55,20 del Qwen3.5-9B original, con mejoras notables en citación de fuentes, inferencia de lenguaje natural, control de registro y traducción legal.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), con proyecciones de atención completa, Gated-DeltaNet y MLPs; incluye torre de visión y cabeza MTP |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 64K+ tokens (evaluado con aguja hasta 64K) |
| Tipos de cuantización | No disponible de forma explícita; se reportan ejecuciones en BF16 y Q8_0 GGUF |
| Idiomas soportados | Galés (cy), inglés (en), irlandés (ga), gaélico escocés (gd), escocés (sco) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 19,3 GB); también se reportan GGUF Q8_0 para llama.cpp |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Qwen3.5-9B: un transformer denso con atención completa, capas Gated-DeltaNet y MLPs, además de una torre de visión para OCR y una cabeza de predicción multi-token (MTP) para decodificación especulativa. El ajuste fino se realizó mediante un LoRA en bf16 con rango 64 aplicado a las proyecciones de atención completa, Gated-DeltaNet y MLPs, dejando intactas la torre de visión y la cabeza MTP.

El entrenamiento consistió en un preentrenamiento continuado (CPT) sobre Qwen3.5-9B-Base con 1.043 pasos, secuencias de 2.048 tokens, learning rate 1e-4 con decaimiento coseno y un total de 68,4 millones de tokens. El corpus "q1" incluyó texto web, PDF y hablado filtrado por calidad en galés, irlandés, gaélico y escocés (104,8 millones de caracteres del mix Grasmere v2), texto paralelo cy↔en del Senedd y del Gobierno de Gales (60,0 millones de caracteres) y datos británicos adicionales. El entrenamiento del 9B requirió 8,1 horas en una RTX 4090. No se menciona el uso de RLHF o DPO en la información disponible.

## Capacidades
- Generación de texto y razonamiento en galés e inglés, con modo thinking activable.
- Traducción cy↔en, incluyendo traducción de legislación con BLEU de 49,72.
- Tool calling nativo, con una tasa de acierto de 1,00 tanto con thinking activado como desactivado en el 9B.
- Razonamiento multi-paso y soporte para agentes.
- Capacidades multilingües en galés, inglés, irlandés, gaélico escocés y escocés (estos tres últimos entrenados pero no evaluados por separado).
- Visión con OCR, con una tasa de error de caracteres de 0,01.
- Contexto largo verificado hasta 64K tokens (aguja en 8K, 32K y 64K con puntuación 1,00).
- Decodificación especulativa mediante cabeza MTP, con una tasa de aceptación de borradores de 0,47.
- Conciencia de las variantes dialectales Gog (norte) y Hwntw (sur), aunque sin replicarlas plenamente en las respuestas.

## Casos de uso
- Atención al cliente en galés: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 64K tokens, manteniendo coherencia en registro formal e informal (puntuación de 71 en registro frente a 50 del base), adecuado para organismos públicos y empresas que operan en Gales.
- Traducción de documentación legal y administrativa: con un BLEU de 49,72 en traducción de legislación (frente a 37,04 del base), es útil para preprocesar textos del Senedd o del Gobierno de Gales antes de revisión humana.
- Generación de código en pipelines de CI/CD: gracias al tool calling nativo con acierto de 1,00 y al modo thinking, puede integrarse en flujos de revisión automatizada o generación de parches en entornos bilingües cy/en.
- Extracción de información de documentos escaneados: la torre de visión con OCR (tasa de error de caracteres de 0,01) permite digitalizar y estructurar formularios o actas en galés e inglés.
- Asistentes educativos para aprendizaje del galés: el modelo distingue registro formal e informal y explica gramática (mejora de +5 en gramática), lo que lo hace útil para herramientas de enseñanza de la lengua.
- Análisis de corpus y citación de fuentes: la mejora en citación de fuentes (de 33 a 65) lo hace adecuado para tareas de investigación que requieran atribución documental en textos galeses.
- Procesamiento de lenguaje natural en lenguas celtas: con soporte declarado de irlandés, gaélico escocés y escocés, puede emplearse en proyectos de preservación lingüística, aunque sin evaluación específica publicada.

## Benchmarks y rendimiento
Resultados en CymraegBench (BF16 en vLLM, ventana de 4.096 tokens, 4 peticiones concurrentes, thinking desactivado, temperatura 0, semilla 1, hasta 100 casos por suite):

| Modelo | Overall | Reasoning | Practical Welsh | Translation BLEU |
|---|---|---|---|---|
| Llandudno-9B | 58,07 | 63,91 | 52,22 | 49,72 |
| Llandudno-4B | 55,36 | 53,72 | 57,00 | 47,71 |
| Qwen3.5-9B stock (rerun del autor) | 55,20 | 58,29 | 52,11 | 37,04 |
| Qwen3.5-9B stock (leaderboard oficial) | 55,10 | 57,98 | 52,22 | 37,06 |
| EryriLabs Gemma 4 12B Cymraeg v6 | 52,70 | No disponible | No disponible | No disponible |
| Qwen3.5-4B stock (Q8_0) | 52,39 | 48,32 | 56,45 | 28,10 |
| EryriLabs Gemma 4 E4B Cymraeg v4 | 49,70 | No disponible | No disponible | No disponible |
| Qwen2.5-7B-Instruct (Q8_0) | 41,26 | 32,19 | 50,33 | 14,54 |

En ejecución Q8_0 GGUF con llama.cpp, Llandudno-9B obtiene 57,84 y Llandudno-4B 56,36. Las ejecuciones individuales de 100 casos varían aproximadamente ±1 punto.

Evaluación de características modernas (features_eval, Q8_0):

| Métrica | Qwen3.5-9B stock | Llandudno-9B |
|---|---|---|
| Aguja en contexto largo (8K/32K/64K) | 1,00 / 1,00 / 1,00 | 1,00 / 1,00 / 1,00 |
| Tool calls, thinking off / on | 0,75 / 1,00 | 1,00 / 1,00 |
| Thinking responde / cierra `</think>` | 0,50 / 0,62 | 0,88 / 0,88 |
| OCR (tasa de error de caracteres) | 0,01 | 0,01 |
| Aceptación de borradores MTP | 0,40 | 0,47 |

Evaluación de espejo dialectal (dialect_eval, 40 aperturas informales Gog/Hwntw):

| Modelo | Replica el dialecto del usuario | Gog | Hwntw |
|---|---|---|---|
| Claude Opus 5 / Sonnet 5.5 / Gemini 3.8 Flash | 52% | 10–12/20 | 9–11/20 |
| GLM-5.3 | 40% | 7/20 | 9/20 |
| EryriLabs E4B v4 | 22% | 7/20 | 2/20 |
| Qwen3.5-4B / -9B stock | 5–8% | No disponible | No disponible |
| Llandudno-4B | 8% | 1/20 | 2/20 |
| Llandudno-9B | 12% | 1/20 | 4/20 |

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 19,3 GB de pesos, por lo que se necesitan al menos 24 GB de VRAM para acomodar pesos y caché KV con contexto moderado.
- VRAM estimada en Q8_0: alrededor de 10-11 GB de pesos, lo que permite ejecución en GPUs de 16 GB con contexto reducido.
- GPU recomendadas: RTX 4090 (24 GB) para BF16 con contexto limitado; A100 40/80 GB, H100 o L40S para contexto completo de 64K y concurrencia.
- Cabe en GPU de consumo: sí, en RTX 4090 con BF16 y contexto moderado, o en GPUs de 16 GB con cuantización Q8_0 o inferior.
- Opciones de despliegue: vLLM (usado en la evaluación del autor), llama.cpp con GGUF Q8_0, y previsiblemente Ollama y TGI mediante conversión, aunque no se confirman en la información disponible.
- Latencia y throughput: no disponibles de forma explícita; la cabeza MTP con aceptación de 0,47 sugiere aceleración en decodificación especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | CymraegBench Overall | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llandudno-9B | 9,65B | 64K+ | 58,07 | Apache 2.0 | Hugging Face |
| Qwen3.5-9B stock | 9B (no detallado) | 64K+ | 55,20 | No disponible en la información | Hugging Face (Qwen) |
| Llandudno-4B | 4B (no detallado) | 64K+ | 55,36 | Apache 2.0 | Hugging Face |
| EryriLabs Gemma 4 12B Cymraeg v6 | 12B | No disponible | 52,70 | No disponible | No disponible |
| Qwen2.5-7B-Instruct | 7B | No disponible | 41,26 | No disponible | Hugging Face |

## Limitaciones y advertencias
- Detección de palabras malsonantes en galés (9B): en la suite de obscenidades de CymraegBench obtiene 15 frente a 33 del stock 9B; ante formas desconocidas o mutadas tiende a responder "N". No debe usarse como filtro de profanidad.
- Modo thinking en el 4B: cierra el razonamiento correctamente solo el 62% de las veces, frente al 100% del stock 4B; se recomienda desactivar thinking o limitar el presupuesto en producción. El 9B alcanza el 88%.
- Irlandés, gaélico escocés y escocés fueron entrenados pero no evaluados por separado, por lo que su rendimiento real es incierto.
- Dialecto: las respuestas son mayoritariamente en galés estándar incluso cuando el usuario escribe en Gog o Hwntw, y ocasionalmente se mezclan formas del norte y del sur.
- MGSM (matemáticas en galés) es bajo porque el modelo obedece la instrucción de responder solo con el número final; con thinking activado razona antes de dar la cifra.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo o alucinación en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones que conviene verificar.
- Entrenado por una sola persona en dos días, con un corpus limitado (68,4M tokens de CPT); puede presentar menor robustez que modelos entrenados a mayor escala.

## Enlaces
- Hugging Face: https://huggingface.co/jonpojonpo/Llandudno-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- CymraegBench / AIsteddfod leaderboard: no disponible en la información proporcionada
- Repositorio o paper del modelo: no disponible en la información proporcionada
