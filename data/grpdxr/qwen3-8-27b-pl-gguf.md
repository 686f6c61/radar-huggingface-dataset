# grpdxr/Qwen3.8-27B-PL-GGUF

## Resumen

Qwen3.8-27B-PL-GGUF es una cuantización mixta a aproximadamente 2,5 bits (IQ2_XS con bloques selectivos a IQ3_XXS) del modelo Qwen3.8-27B de Qwen, publicada por el usuario grpdxr en HuggingFace y orientada específicamente al idioma polaco. No se trata de un fine-tuning: los pesos son los del modelo original, pero la asignación de bits se ha decidido midiendo la calidad de las respuestas en polaco. El resultado es un fichero GGUF de 9,56 GB que razona bien y escribe polaco limpio, ejecutable en llama.cpp sin modificaciones sobre una única GPU de 24 GB, con dos slots paralelos de 64K de contexto ocupando 14,2 GB de VRAM.

La innovación principal es la cuantización selectiva guiada por pruebas empíricas en polaco: los bloques 0-7 y 56-63 (primeros y últimos 8 bloques del transformer) se cuantizan a IQ3_XXS porque concentran la mayor parte de la calidad lingüística en polaco, el embedding de tokens se recuantiza a Q4_K con matriz de importancia ponderada por palabras polacas, y se conserva la cabeza MTP (multi-token prediction) de Qwen para decodificación especulativa sin fichero de draft separado. Esto permite unos ~45 tokens/s por stream en una RTX 3090 con ambos slots activos.

Es relevante para desarrolladores que necesiten desplegar un modelo con buen razonamiento y excelente calidad de polaco en hardware de consumo, superando en las pruebas del autor a los modelos polacos nativos de referencia (Bielik-11B, PLLuM-12B) en razonamiento y respuestas sobre documentos, con una fracción de la VRAM del modelo completo cuantizado a Q4_K_M.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), con cabeza MTP para decodificación especulativa |
| Parámetros totales | 27B (el modelo base); el repositorio GGUF ocupa 9,56 GB (el dato de safetensors de 200 M corresponde a metadatos del repo, no al modelo completo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 64K tokens por slot (probado con 1 y 2 slots paralelos) |
| Tipos de cuantización | IQ2_XS (bloques centrales), IQ3_XXS (bloques 0-7 y 56-63), Q4_K (embedding de tokens); KV cache q4_0; ~2,5 bits por peso de media |
| Idiomas soportados | Polaco e inglés (optimizado para polaco) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp stock) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27 mil millones de parámetros. Esta publicación no modifica los pesos mediante entrenamiento: es una recuantización del release ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF, que a su vez usa GSQ (learned rounding) para mantener el razonamiento a ~2,5 bits por peso. La composición del fichero final es:

- Todos los bloques transformer: IQ2_XS-mtp de ISTA-DASLab (el redondeo estándar de llama-quantize con layout comparable solo resolvía ~13/20 problemas de razonamiento en las pruebas del autor).
- Bloques 0-7 y 56-63: IQ3_XXS-mtp (mismo redondeo GSQ, más bits). Un barrido sobre 8 grupos de bloques determinó que los primeros y últimos 8 bloques concentran la mayor parte de la calidad del polaco; añadir más bloques no mejoró las respuestas reales.
- Embedding de tokens: cuantización Q4_K propia de los pesos BF16, con matriz de importancia ponderada por palabras polacas (upstream lo tiene a IQ1_M; las palabras polacas son tokens más raros que las inglesas).
- Cabeza MTP (bloque 64): IQ2_XS-mtp de upstream, para decodificación especulativa con `--spec-type draft-mtp`, sin fichero de draft separado.

Sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO), no hay datos disponibles en la información proporcionada. Existe además un LoRA opcional en polaco (+0,40 GB) que sube la puntuación de polaco de 90,6 a 92,5.

## Capacidades

- Generación de texto conversacional en polaco e inglés, con calidad lingüística alta (0,4-0,6 errores por 100 palabras en chat, medidos por un LLM judge verificado manualmente).
- Razonamiento: resuelve 18 de 20 problemas de lógica, cálculo de facturas, plazos legales, probabilidades y análisis de logs (~10k tokens) en las pruebas propias del autor, con reasoning_effort medium.
- Comprensión de documentos largos en polaco: 100% de acierto en preguntas sobre un documento polaco de 18.000 caracteres.
- Análisis de transcripciones: 71/72 preguntas correctas sobre 8 transcripciones sintéticas de llamadas de ventas polacas (12-16 minutos cada una), incluyendo hechos, cálculos, atribución de hablantes, premisas falsas y detección de "no se mencionó en la llamada".
- Decodificación especulativa mediante la cabeza MTP integrada (~45 tokens/s por stream en RTX 3090 con dos streams activos).
- Contexto largo: 64K tokens por slot, con dos slots paralelos simultáneos.
- No hay información sobre tool calling, capacidades de visión, audio ni modo thinking explícito en la documentación disponible.

## Casos de uso

- Asistente de preguntas sobre documentos en polaco: gracias a su ventana de 64K tokens y al 100% de acierto en preguntas sobre documentos de 18k caracteres, es adecuado para RAG o lectura directa de contratos, normativas y manuales en polaco.
- Análisis de transcripciones de llamadas: puede procesar llamadas de ventas de 12-16 minutos y responder sobre hechos, cálculos y atribución de hablantes (71/72 en las pruebas del autor), útil para QA de contact centers.
- Chatbots de atención al cliente en polaco: mantiene conversaciones de 10 turnos con pocos errores lingüísticos (0,4-0,6 por 100 palabras) y cabe en una GPU de 24 GB con dos sesiones paralelas.
- Razonamiento y cálculo en producción local: resolución de problemas de lógica, plazos legales y totales de facturas (18/20) sin depender de APIs externas, relevante para sectores con requisitos de privacidad de datos.
- Despliegue multiusuario en una sola GPU de consumo: dos slots de 64K en 14,2 GB de VRAM permiten servir dos peticiones simultáneas de contexto largo en una RTX 3090.
- Generación de texto en polaco con latencia alta: la cabeza MTP y la cuantización agresiva permiten ~45 tokens/s por stream, adecuado para interfaces de usuario interactivas.
- Procesamiento bilingüe polaco-inglés: el modelo base Qwen3.8 mantiene el inglés intacto, útil para flujos de trabajo mixtos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica pruebas propias, no comparables con leaderboards, ejecutadas en una RTX 3090 con llama.cpp b11028, reasoning_effort medium y temperatura 0,6:

| Modelo | Fichero | VRAM 1 slot × 64K | VRAM 2 slots × 64K | Puntuación polaco | Errores chat /100 palabras | Razonamiento (de 20) |
|---|---|---|---|---|---|---|
| Este modelo (KV q4_0, MTP drafter) | 9,56 GB | 11.749 MiB | 14.241 MiB | 90,6 (7 rondas) | 0,4-0,6 | 18,0 (6 rondas) |
| Este modelo + LoRA polaco opcional | +0,40 GB | 12.149 MiB | 14.639 MiB | 92,5 (4 rondas) | 0,4-0,5 | 18,5 (2 rondas) |
| Saluki (Qwen3.8-27B IQ2 mix) | 7,90 GB | — | 13.097 MiB | 89,5 | 1,7 | ~13 |
| Bielik-11B-v3.0-Instruct Q8_0 | 11,87 GB | — | 18.630 MiB (2 × 32K) | 87,5 | 0,3 | 4,5 |
| Bielik-11B-v3.0-Instruct Q4_K_M | 6,72 GB | — | 13.800 MiB (2 × 32K) | 85,5 | 0,2 | 3,3 |
| PLLuM-12B-chat-2512 Q8_0 | 13,1 GB | — | 23.544 MiB | 80 | 0,15 | 1,5 |
| Qwen3.8-27B Q4_K_M (referencia completa) | 19,0 GB | — | 23.041 MiB | 95,5 | 0,6 | — |

Fidelidad (divergencia KL frente a Qwen3.8-27B Q8_0; mediana / coincidencia del token top):

| Fichero | Texto de razonamiento | Texto en polaco |
|---|---|---|
| DASLab IQ2_XS (sin modificar) | 0,00072 / 87,4% | 0,0569 / 83,3% |
| + embedding Q4_K | 0,00057 / 87,7% | 0,0452 / 84,2% |
| + bloques 0-7 y 56-63 a IQ3_XXS (este modelo) | 0,00047 / 87,9% | 0,0328 / 85,5% |

## Requisitos de hardware

- VRAM para inferencia: 11.749 MiB con 1 slot de 64K (petición de ~8k tokens) y 14.241 MiB con 2 slots de 64K activos simultáneamente (medido como pico en la tarjeta), incluyendo KV cache cuantizada a q4_0 y el drafter MTP.
- Cabe cómodamente en GPUs de consumo de 24 GB: probado en RTX 3090. También debería funcionar en RTX 4090 y RTX 3090 Ti; no hay datos para GPUs de 16 GB.
- Velocidad: ~45 tokens/s por stream con ambos slots ocupados en una RTX 3090, gracias a la decodificación especulativa MTP.
- Despliegue: llama.cpp (build b11028 o superior) sin modificaciones, con `--spec-type draft-mtp`. No hay información sobre compatibilidad con vLLM, TGI u Ollama; al ser GGUF, Ollama y llama.cpp son los candidatos naturales.
- El modelo completo de referencia (Q4_K_M, 19 GB) requiere ~23 GB de VRAM y su draft model no carga junto al modelo principal según las pruebas del autor.

## Comparativa con modelos similares

| Modelo | Tamaño fichero | Contexto | Puntuación polaco (test autor) | Razonamiento (test autor) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-PL (este modelo) | 9,56 GB | 64K | 90,6 | 18/20 | Apache 2.0 |
| Saluki (Qwen3.8-27B IQ2 mix) | 7,90 GB | 64K | 89,5 | ~13/20 | no disponible |
| Bielik-11B-v3.0-Instruct (Q8_0) | 11,87 GB | 32K (ventana entrenada) | 87,5 | 4,5/20 | no disponible |
| PLLuM-12B-chat-2512 (Q8_0) | 13,1 GB | no disponible | 80 | 1,5/20 | no disponible |
| Qwen3.8-27B Q4_K_M (completo) | 19,0 GB | 64K | 95,5 | no disponible | Apache 2.0 |

Frente a Saluki ofrece ~3 veces menos errores lingüísticos (1,7 → 0,5 por 100 palabras), razonamiento 18 frente a ~13 y 88 frente a 79 en chat en polaco, por 1,66 GB adicionales. Frente a Bielik-11B comete ligeramente más errores de lenguaje (0,4-0,6 frente a 0,3 por 100 palabras, con respuestas más largas), pero acierta el 100% de las preguntas sobre documentos frente al 70% y resuelve manyos más problemas de razonamiento. Las comparaciones provienen de las pruebas propias del autor, no de benchmarks estandarizados.

## Limitaciones y advertencias

- Las puntuaciones provienen de pruebas propias del autor, diseñadas para un caso concreto (respuestas en polaco sobre documentos y llamadas); no son comparables con leaderboards ni con otras model cards.
- La variabilidad entre rondas es de ±3 puntos en polaco y ±2 en razonamiento; los números son medias de rondas repetidas.
- Sesgos: no hay información sobre sesgos conocidos del modelo base o de la cuantización.
- Alucinaciones: no se publican mediciones específicas; las pruebas de transcripciones incluyen detección de premisas falsas y "no se mencionó", con buen resultado (71/72), pero esto no garantiza ausencia de alucinación en otros dominios.
- Idioma: la optimización está centrada en polaco; el inglés se conserva al ser el modelo base Qwen, pero no hay datos de calidad para otros idiomas.
- Contexto: las pruebas de VRAM asumen peticiones de ~8k tokens; el uso real de 64K por slot puede variar según la longitud de las peticiones.
- Licencia: Apache 2.0 permite uso comercial sin restricciones destacables, aunque hay que verificar la licencia del modelo base Qwen3.8-27B para despliegues comerciales.
- Es una cuantización agresiva (~2,5 bits): la referencia completa a Q4_K_M sigue siendo mejor en polaco (95,5 frente a 90,6), por lo que para máxima calidad conviene el modelo sin cuantizar si hay hardware disponible.
- El repositorio es de un usuario individual (grpdxr), con 230 descargas y 0 likes en el momento de la ficha; conviene validar en entorno propio antes de producción.

## Enlaces

- Modelo: https://huggingface.co/grpdxr/Qwen3.8-27B-PL-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización de origen: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Artículos arXiv referenciados en los tags: arXiv:2604.18556 y arXiv:2605.00649 (URLs completas no disponibles en la información proporcionada)
