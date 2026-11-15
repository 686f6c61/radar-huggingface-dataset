# GEHIRNS/magi-1.0-0.5B

## Resumen

magi-1.0-0.5B es una cuantización GGUF en Q4_K_M del modelo conversacional h2oai/h2o-danube3-500m-chat, publicada por el usuario GEHIRNS bajo el paraguas de su serie "magi". No se trata de un modelo entrenado desde cero, sino de una reempaquetación del checkpoint de H2O.ai (arquitectura Llama, 16 capas, hidden 1536, 16 cabezas de atención con 8 KV, vocabulario de 32000 tokens) en un fichero de 289 MB y 4,70 BPW, pensado para despliegue en llama.cpp y Ollama.

El interés del artefacto es su perfil de huella de memoria: el autor declara 0,38 GiB residentes en inferencia con contexto de 32K (0,25 GiB de pesos, 0,08 GiB de caché KV en q4_0 y 0,05 GiB de cómputo), lo que lo sitúa por debajo de alternativas como Qwen3-0.6B o LFM2-350M en consumo. La model card introduce una métrica propia, "Information Density" (ID), definida como -log2(1-score)/GiB, con la que el autor ordena su familia de cuantizaciones.

Es relevante ahora por dos motivos: la base Danube3-500M se distribuye con licencia Apache 2.0 y se entrenó sobre 4T tokens, y la cuantización permite ejecutar un chat funcional en hardware muy limitado. Conviene advertir, no obstante, que los benchmarks publicados son estimaciones del autor a partir de cifras públicas de H2O y no mediciones verificadas del propio GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (16 capas, hidden 1536, intermediate 4096, 16 cabezas, 8 KV, vocab 32000) |
| Parámetros totales | 513.590.784 (≈500M; BF16 original ≈980 MB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (la model card menciona además un escenario residente a 32K) |
| Tipos de cuantización | Q4_K_M (4,70 BPW, 289 MB, 113 tensores); IQ2_XXS mixto con imatrix planificado, no publicado |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (heredada de h2oai/h2o-danube3-500m-chat) |
| Formato de pesos | GGUF (librería gguf; compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Danube3-500M de H2O.ai: un transformer decoder-only con disposición Llama, 16 capas, dimensión oculta 1536, dimensión intermedia 4096, 16 cabezas de atención con 8 cabezas KV (GQA) y vocabulario de 32000 tokens. Según la model card, el modelo base se entrenó sobre 4 billones de tokens y se publica en BF16; la versión magi conserva las 16 capas sin poda ("all 16 blk intact") y aplica una cuantización uniforme q4_k sobre los 113 tensores (1 tensor de embeddings, 48 de FFN y 64 de atención).

El trabajo de GEHIRNS se limita, por tanto, a la cuantización y al empaquetado. La model card describe un pipeline futuro con imatrix y mezcla IQ2_XXS (48 tensores FFN en iq3_xxs y 64 de atención en q4_k) que no llegó a completarse por un fallo de la DLL de imatrix (api-ms-win-crt-locale) en las builds b4706/b5146; el Q4_K_M publicado es una cuantización rápida sin imatrix. No se documentan fases de RLHF, DPO ni datos de alineación adicionales más allá de los del checkpoint chat original de H2O.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, heredada del ajuste chat de Danube3-500M.
- Razonamiento de sentido común básico: la model card cita HellaSwag ≈63%, PIQA ≈77% y ARC-C ≈50% para la base.
- Respuesta a instrucciones simples y formato conversacional (pipeline text-generation).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés declarado; no se documentan otros idiomas.
- Compatible con el ecosistema llama.cpp/Ollama, lo que permite integración local sin servidor.

## Casos de uso

- Asistentes locales en dispositivos de gama baja: con 0,38 GiB residentes y 289 MB en disco, el modelo cabe en Raspberry Pi, mini-PC o portátiles sin GPU dedicada, gestionando conversaciones de chat en inglés con contexto de hasta 8192 tokens.
- Clasificación y etiquetado de texto en pipelines por lotes: su bajo coste de memoria permite ejecutar muchos hilos concurrentes en una sola CPU, útil para triage de tickets o categorización de reseñas.
- Prototipado rápido de aplicaciones conversacionales: al cargarse en Ollama con un único comando, sirve para validar flujos de UI y prompts antes de migrar a un modelo mayor.
- Filtrado previo en arquitecturas de enrutamiento de modelos: puede actuar como primer clasificador que descarte consultas triviales y derive las complejas a un modelo mayor, reduciendo coste medio por petición.
- Generación de texto de relleno y plantillas: descripciones cortas, resúmenes de una línea o respuestas predefinidas en herramientas internas donde la latencia y el consumo importan más que la calidad.
- Entornos educativos y de investigación sobre cuantización: su model card documenta el proceso de cuantización (tipos, BPW, tensores) y sirve como caso de estudio reproducible para comparar Q4_K_M frente a mezclas IQ con imatrix.
- Inferencia en el edge con requisitos de privacidad: al ejecutarse íntegramente en local, permite procesar texto sensible sin enviarlo a servicios externos.

## Benchmarks y rendimiento

Los datos de la model-index son estimaciones declaradas por el autor (`verified: false`) sobre una suite propia denominada "full2313 12 suites", no resultados estándar reproducibles.

| Benchmark | magi-1.0-0.5B (declarado) | Notas del autor |
|---|---|---|
| Full Bench 2313 est (índice) | 42 | Estimación sobre 12 suites propias |
| Information Density (ID) | 1,96 | -log2(1-0,42)/0,38 GiB |
| HellaSwag (base Danube3-500M) | ≈63% | Cifra pública de H2O citada por el autor |
| PIQA (base Danube3-500M) | ≈77% | Cifra pública de H2O citada por el autor |
| ARC-C (base Danube3-500M) | ≈50% | Cifra pública de H2O citada por el autor |

No se han publicado resultados verificados de MMLU, HumanEval, GSM8K ni de la propia cuantización en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 0,38 GiB residentes según el autor (0,25 GiB de pesos + 0,08 GiB de caché KV en q4_0 + 0,05 GiB de cómputo); el fichero GGUF ocupa 289 MB en disco.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con 1 GB o más de VRAM es suficiente, incluidas GTX 1050 Ti, RTX 3050 o integradas con memoria compartida.
- Cabe holgadamente en GPU de consumo y en CPU sola; es viable en Raspberry Pi y dispositivos con 1 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama (la model card incluye `ollama create` y una etiqueta `danube3-500m:magi-q4` de 302 MB), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria residente | Licencia | Notas |
|---|---|---|---|---|---|
| magi-1.0-0.5B | ≈500M | 8192 | 0,38 GiB | Apache 2.0 | ID 1,96 declarado; Q4_K_M 289 MB |
| Qwen3-0.6B | ≈600M | no disponible en la información | 0,50 GiB | no disponible en la información | ID 1,72 y 39,6% en el bench propio del autor; MMLU 55-57% citado |
| LFM2-350M | ≈350M | no disponible en la información | 0,30 GiB | no disponible en la información | ID 1,83; menor consumo pero peor sentido común según el autor |
| SmolLM2-360M | ≈360M | no disponible en la información | 0,28 GiB | no disponible en la información | 13,2% en el screen de 250 tareas del autor |

Las cifras de consumo y de bench propio proceden de la model card del autor y no han sido verificadas de forma independiente.

## Limitaciones y advertencias

- Modelo de 500M parámetros: la calidad de razonamiento, matemáticas y código es limitada; no es adecuado para tareas que requieran precisión factual alta.
- Riesgo elevado de alucinación inherente al tamaño y a la cuantización Q4_K_M, que introduce pérdida adicional frente al BF16 original.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está documentado y previsiblemente será deficiente.
- Los benchmarks publicados son estimaciones del autor sobre una suite propia no estándar y marcados como no verificados; no deben compararse directamente con MMLU o HumanEval de terceros.
- La cuantización publicada es una "quick quant" sin imatrix; el propio autor reconoce que la mezcla IQ2_XXS con imatrix quedó pendiente por un fallo de herramienta.
- Licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base de H2O.ai; conviene revisar el fichero LICENSE original del repositorio h2oai/h2o-danube3-500m-chat.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni garantía de mantenimiento.
- El contexto de 8192 tokens es corto para tareas de documentación larga; la mención a 32K en la model card corresponde a un escenario de memoria, no al contexto entrenado.

## Enlaces

- Hugging Face: https://huggingface.co/GEHIRNS/magi-1.0-0.5B
- Modelo base: https://huggingface.co/h2oai/h2o-danube3-500m-chat
- Licencia del modelo base: https://huggingface.co/h2oai/h2o-danube3-500m-chat/blob/main/LICENSE
- GGUF de referencia de terceros: https://huggingface.co/bartowski/h2o-danube3-500m-chat-GGUF
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
