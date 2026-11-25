# Abiray/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored es una versión "abliterated" (sin censura) del modelo Inkling-2-Mini de Thinking Machines Lab, distribuida en formato GGUF por el usuario Abiray bajo licencia Apache 2.0. El modelo base es un Mixture-of-Experts (MoE) multimodal de 26.070.385.152 parámetros totales con aproximadamente 3.400 millones de parámetros activos (5.400 millones efectivos), diseñado con una arquitectura de capas en bucle: 24 capas en total, de las cuales las capas 6 a 17 se repiten tres veces por token, lo que resulta en 48 pasadas de capa efectivas.

La relevancia de esta ficha radica en dos factores. Primero, el proceso de abliteración quirúrgica aplicado por OpenUncensored preserva la inteligencia del modelo original (MMLU de 79,47 % frente al 78,95 % del base, dentro del ruido estadístico) mientras elimina por completo los rechazos en las pruebas realizadas. Segundo, la cuantización GGUF con imatrix de 4,76 millones de tokens permite ejecutar un modelo de 26 000 millones de parámetros en hardware de consumo, algo impensable con el checkpoint original en precisión mixta NVFP4/MXFP8/BF16.

El modelo está orientado a conversación, generación de código, razonamiento y tareas agénticas, con soporte de visión nativo y una ventana de contexto de hasta 1 millón de tokens. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo convierte en una opción atractiva para despliegues en producción que requieran un modelo sin filtros de seguridad integrados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con bucle de capas (layers 6–17 repetidas 3x), transformer multimodal con encoder de visión nativo |
| Parámetros totales | 26.070.385.152 |
| Parámetros activos | ~3.400 millones (5.400 millones efectivos) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (todas con imatrix excepto Q8_0) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), pesos originales en NVFP4 + MXFP8 + BF16 |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura MoE con 128 expertos por capa y top-8 activos. La innovación estructural más destacable es el bucle de capas: las capas 6 a 17 se ejecutan tres veces por token, lo que proporciona 48 pasadas de capa efectivas con solo 24 capas físicas. Esto incrementa la profundidad efectiva sin multiplicar el coste de memoria. El modelo incorpora además un encoder de visión nativo, lo que lo habilita para tareas multimodales.

Thinking Machines Lab entrenó y publicó el modelo original en precisión mixta: NVFP4 para los expertos de las capas 0 a 19, MXFP8 para los expertos de las capas 20 a 23, y BF16 para atención, embeddings y visión. No existe un checkpoint oficial completo en BF16. La versión uncensored fue producida por OpenUncensored mediante una edición quirúrgica de subespacio de rechazo de rango 2 aplicada exclusivamente a 20 proyecciones de salida de atención (`attn.wo_ud`, capas 4 a 23), con escalado más suave (s = 2,5) dentro del núcleo del bucle y s = 4,0 fuera. Los 128 expertos MoE por capa, el encoder de visión y el especulador permanecen idénticos byte a byte al modelo base. Las cuantizaciones GGUF de Abiray se generaron con llama.cpp mainline (build b12600+, PR #32694) usando una imatrix de 392 tensores y 27.873 fragmentos (4,76 millones de tokens) procedente de AtomicChat/Inkling-2-Mini-GGUF-metrics.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1 millón de tokens.
- Razonamiento y modo "thinking" con esfuerzo configurable (por ejemplo, 0,9).
- Generación de código, incluyendo parada limpia en tokens EOT y plantilla Jinja verificada.
- Capacidades multimodales: encoder de visión nativo para procesamiento de imágenes.
- Soporte de tool calling y function calling, adecuado para pipelines agénticos.
- Razonamiento multi-paso y flujos agénticos de largo horizonte.
- Capacidades multilingües limitadas al inglés según la model card.
- Modelo sin censura: elimina rechazos en prompts dañinos y grises (0/32 y 8/80 respectivamente en las pruebas del autor).
- Compatibilidad con endpoints y despliegue estándar en llama.cpp.

## Casos de uso

- **Atención al cliente automatizada:** el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de hasta 1 millón de tokens, manteniendo el hilo de la conversación a lo largo de sesiones extensas sin perder información previa.
- **Generación de código en producción:** soporta tool calling y plantilla Jinja verificada, lo que permite integrarlo en pipelines de CI/CD para generación de tests, revisión de código o autocompletado contextual en entornos de desarrollo.
- **Análisis de documentos e imágenes:** el encoder de visión nativo permite procesar capturas, diagramas o documentos escaneados junto con texto, útil en tareas de extracción de información y respuesta a preguntas sobre imágenes.
- **Investigación en seguridad de IA:** al ser un modelo abliterated con métricas de rechazo documentadas, sirve como herramienta para estudiar comportamientos sin filtros, evaluar sesgos y analizar la eficacia de técnicas de alineación.
- **Agentes autónomos multi-paso:** el razonamiento multi-paso y el modo thinking configurable lo hacen adecuado para orquestar tareas complejas que requieren planificación, uso de herramientas y ejecución secuencial.
- **Despliegue en hardware de consumo:** las cuantizaciones Q4_K_M (16 GiB) y Q3_K_M (12,78 GiB) permiten ejecutar el modelo en GPUs de 24 GB de VRAM o en sistemas con 32 GB de RAM, democratizando el acceso a un MoE de 26 000 millones de parámetros.
- **Prototipado rápido sin censura:** para desarrolladores que necesitan un modelo que no rechace prompts legítimos pero sensibles (por ejemplo, guiones de ficción violenta o análisis de contenido explícito), el modelo ofrece respuestas sustantivas en el 65,6 % de los prompts dañinos evaluados (21/32).

## Benchmarks y rendimiento

| Benchmark / Prueba | Base Inkling-2-Mini | Inkling-2-Mini-Uncensored | Observación |
|---|---|---|---|
| MMLU (57 materias × 20 = 1.140 preguntas, logits de letra) | 78,95 % | 79,47 % | Sin pérdida medible de inteligencia (dentro del ruido) |
| Rechazos en 32 prompts dañinos (modo chat) | 32/32 | 0/32 | Eliminación total de rechazos |
| Rechazos en 32 prompts dañinos (thinking effort 0,9) | 32/32 | 0/32 | 29 de 32 terminaron el thinking en 1.536 tokens; ninguno rechazó |
| Rechazos en 80 prompts mixtos (32 dañinos + 48 grises) | 68/80 | 8/80 | 7 de los 8 fueron límites factuales/de acceso, no rechazos de seguridad; el octavo devolvió recursos de crisis |
| Respuestas completas y específicas a 32 prompts dañinos (juez LLM) | 0/32 | 21/32 | Respuestas sustantivas, no evasivas |

Los benchmarks de agente de largo horizonte y de código no han sido puntuados formalmente en la build abliterated según la model card.

## Requisitos de hardware

- **VRAM/RAM estimada según cuantización:**
  - Q3_K_M: ~12,78 GiB (mínimo ~16 GB de RAM/VRAM).
  - Q4_K_S: ~14,97 GiB.
  - Q4_K_M: ~16,0 GiB (recomendado para 24 GB de VRAM o 32 GB de RAM).
  - Q5_K_M: ~18,5 GiB (punto óptimo de fidelidad).
  - Q6_K: ~21,5 GiB (casi sin pérdida, para código y agentes).
  - Q8_0: ~26,4 GiB.
- **GPU recomendadas:** RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 (40/80 GB) o H100 para Q6_K y Q8_0; también funciona en CPU, AMD y Apple Silicon gracias a llama.cpp mainline.
- **¿Cabe en GPU de consumo?** Sí: Q3_K_M y Q4_K_M caben en GPUs de 16–24 GB (RTX 4080, 4090, 3090). Q5_K_M y Q6_K requieren 24 GB o más.
- **Opciones de despliegue:** llama.cpp (build b12600+), Ollama, vLLM (si soporta GGUF), TGI con adaptadores GGUF, y cualquier runtime compatible con llama.cpp.
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored (este) | 26,07 B totales / 3,4 B activos | 1 M | Apache 2.0 | GGUF | Abliterated, multimodal, MoE con bucle |
| Inkling-2-Mini (base) | 26,07 B totales / 3,4 B activos | 1 M | Apache 2.0 | NVFP4/MXFP8/BF16 | Con censura, misma arquitectura |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

## Limitaciones y advertencias

- **Sesgos conocidos:** al ser un modelo abliterated, se eliminan los filtros de seguridad, lo que puede aumentar la probabilidad de generar contenido sesgado, ofensivo o dañino si se le solicita. No se han documentado evaluaciones de sesgo específicas.
- **Riesgo de alucinación:** no se han publicado métricas de alucinación para esta build; como todo modelo generativo, puede producir información falsa con aparente confianza.
- **Limitaciones de contexto e idioma:** el modelo solo soporta inglés según la model card; el contexto de 1 millón de tokens puede degradar la calidad en los extremos de la ventana. No se han verificado tareas multilingües.
- **Restricciones de licencia:** Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo base es de Thinking Machines Lab y la versión uncensored es una derivación de OpenUncensored; se recomienda revisar las licencias de ambos eslabones.
- **Caveats para producción:** la abliteración puede afectar a la coherencia en tareas de largo horizonte no evaluadas formalmente; el modelo no ha sido puntuado en benchmarks de agente o código tras la abliteración. La cuantización Q8_0 no usa imatrix, por lo que puede presentar una fidelidad ligeramente inferior a Q6_K en los expertos MoE. El tamaño del repo (134,1 GB) implica una descarga considerable si se quieren todas las cuantizaciones.

## Enlaces

- [Hugging Face: Abiray/Inkling-2-Mini-Uncensored-GGUF](https://huggingface.co/Abiray/Inkling-2-Mini-Uncensored-GGUF)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Versión uncensored original: OpenUncensored/Inkling-2-Mini-Uncensored](https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored)
- [Dataset de métricas imatrix: AtomicChat/Inkling-2-Mini-GGUF-metrics](https://huggingface.co/datasets/AtomicChat/Inkling-2-Mini-GGUF-metrics)
- [Repositorio llama.cpp: ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp)
