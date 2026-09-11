# Solstice-AI/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-GGUF-UltraOptimised-DSpark-MTP-1M

## Resumen

Este repositorio contiene una familia de cuantizaciones GGUF del modelo Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, publicado por el usuario Solstice-AI como derivado cuantizado del modelo de DavidAU del mismo nombre. Se trata, por tanto, de un artefacto de cuantización y redistribución más que de un entrenamiento original: el repositorio no incluye pesos en safetensors ni documentación de entrenamiento, sino ficheros GGUF en varios niveles de compresión.

El nombre del modelo indica una base de 27.000 millones de parámetros de la familia Qwen3.8, con una ventana de contexto declarada de 1 millón de tokens mediante extensión tipo YaRN, y capacidades multimodales (pipeline image-text-to-text, fichero mmproj para el proyector visual). Las etiquetas también apuntan a un proceso de "abliteration" o desinhibición (uncensored, abliterated, heretic, project-heretic), orientado a reducir los rechazos del modelo base.

El interés práctico del repositorio está en el despliegue: incluye cuantizaciones de 8 a 4 bits (q8_0, q6_k, q5_k_m, q4_k_m, iq4_nl, iq4_xs) compatibles con llama.cpp y Ollama, y etiquetas que apuntan a decodificación especulativa con modelo borrador (mtp, dspark, speculative-decoding, draft-model). La relevancia es la usual en este tipo de publicaciones: ofrecer una variante larga de contexto y multimodal en formato GGUF listo para ejecución local. No obstante, el repositorio no incluye tarjeta de modelo explicativa, resultados numéricos de benchmarks ni especificaciones verificables más allá de las etiquetas, y registra 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (se infiere transformer de la familia Qwen a partir de nombre y etiquetas; no se documenta en el repositorio) |
| Parametros totales | 27.000 millones (según nomenclatura "27B"); no confirmado por documentación |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 1.000.000 de tokens (etiquetas "1m-context", "long-context", "yarn"); no verificado en documentación |
| Tipos de cuantizacion | q8_0, q6_k, q5_k_m, q4_k_m, iq4_nl, iq4_xs (también etiqueta "imatrix") |
| Idiomas soportados | Inglés (en) y chino (zh), según etiquetas; el campo de idiomas de la ficha figura como no disponible |
| Licencia | Apache 2.0 según la etiqueta del repositorio ("license:apache-2.0"); el campo de licencia de la ficha figura como no disponible, por lo que existe discrepancia |
| Formato de pesos | GGUF (incluye fichero mmproj para el componente visual) |
| Pipeline | image-text-to-text |
| Modelo base | DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored |
| Dataset declarado | Solstice-AI/Solace-1.0-Omni |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

No se ha proporcionado información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF, DPO u otras) de este repositorio. Se trata de un artefacto de cuantización: el autor declara como base el modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored y publica ficheros GGUF derivados. Cualquier innovación de entrenamiento correspondería al modelo original, no a este repositorio.

Las etiquetas permiten enumerar los elementos técnicos declarados, aunque sin documentación que los respalde: extensión de contexto tipo YaRN hasta 1 millón de tokens, soporte multimodal mediante proyector mmproj, decodificación especulativa con modelo borrador (etiquetas "mtp", "dspark", "speculative-decoding", "draft-model"), cuantización con matriz de importancia ("imatrix") y un conjunto de nombres internos sin definición pública ("Cold Fusion", "Gain", "Anvil", "TurboQuant", "709-L", "Project Heretic", "Fable", "Solace-1.0-Omni"). Ninguno de estos términos se explica en la información disponible.

El proceso de "abliteration" o desinhibición que sugieren las etiquetas "uncensored", "abliterated" y "heretic" implica típicamente la modificación de direcciones de activación asociadas a rechazos, con el objetivo de reducir las negativas del modelo ante ciertas peticiones. No se documentan aquí ni el método exacto, ni el alcance de la modificación, ni sus efectos medidos sobre capacidades o seguridad.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta "conversational" y el pipeline declarado.
- Razonamiento con cadena de pensamiento explícita ("cot", "reasoning").
- Generación de código y resolución de problemas de ingeniería de software, con etiquetas que mencionan "coding", "swe-bench" y "swe-bench-pro".
- Programación competitiva, con etiqueta "livecodebench".
- Razonamiento académico tipo preguntas de opción múltiple, con etiquetas "arc-challenge" y "709-arc".
- Capacidades multimodales de imagen a texto: el pipeline es image-text-to-text y se incluye fichero mmproj para el proyector visual.
- Procesamiento de contexto largo, con etiqueta de 1 millón de tokens y extensión YaRN declarada.
- Decodificación especulativa: las etiquetas "mtp", "dspark" y "draft-model" apuntan a la inclusión de un modelo borrador para acelerar la inferencia.
- Multilingüismo limitado a inglés y chino según las etiquetas.
- Comportamiento desinhibido ("uncensored", "abliterated") orientado a reducir rechazos.
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes en la información disponible.

## Casos de uso

- Despliegue local de asistente conversacional con contexto muy largo: con una ventana declarada de 1 millón de tokens, el modelo puede mantener en memoria documentos completos, expedientes o bases de código extensas sin trocear, siempre que el hardware soporte el coste de KV cache asociado.
- Análisis de documentos técnicos extensos con componente visual: gracias al pipeline image-text-to-text y al proyector mmproj, permite procesar diagramas, capturas de pantalla o figuras junto con el texto que las acompaña, útil en revisión de documentación técnica o de planos.
- Asistencia a la programación en editor local: las etiquetas de "coding" y "swe-bench" sugieren uso en autocompletado, explicación de código y resolución de incidencias dentro de un IDE, ejecutado con llama.cpp u Ollama sobre estación de trabajo.
- Generación de código en pipelines internos: puede integrarse como paso de generación o transformación de código en flujos de CI/CD, aunque la ausencia de documentación sobre tool calling obliga a validar manualmente la integración con el orquestador.
- Investigación sobre desinhibición y seguridad de modelos: al declararse "abliterated", es un candidato para estudios comparativos sobre tasas de rechazo, degradación de capacidades y comportamientos no deseados frente al modelo base.
- Procesamiento por lotes en local con recursos limitados: las cuantizaciones IQ4_NL, IQ4_XS y Q4_K_M permiten ejecutar un modelo de 27.000 millones de parámetros en GPU de consumo de gama alta, reduciendo el coste frente a inferencia en la nube.
- Extracción y resumen de información en corpus largos monolingües (inglés o chino): adecuado para resumir informes, actas o documentación siempre que el contenido esté en uno de los dos idiomas declarados.
- Aceleración de inferencia en producción: el uso de decodificación especulativa con modelo borrador declarado en las etiquetas puede reducir la latencia por token en despliegues con llama.cpp, si bien no se aportan métricas de speedup.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye etiquetas que mencionan evaluaciones concretas (swe-bench, swe-bench-pro, livecodebench, arc-challenge, 709-arc) e incluso una afirmación comparativa en la propia etiqueta ("beats-claude-opus-4.6"), pero no se acompaña ningún valor numérico, configuración de evaluación ni metodología que permita verificar dichas afirmaciones.

| Benchmark | Resultado | Nota |
|---|---|---|
| MMLU | No disponible | No se menciona en la información |
| HumanEval | No disponible | No se menciona en la información |
| GSM8K | No disponible | No se menciona en la información |
| SWE-bench | No disponible | Etiqueta presente, sin cifra publicada |
| SWE-bench Pro | No disponible | Etiqueta presente, sin cifra publicada |
| LiveCodeBench | No disponible | Etiqueta presente, sin cifra publicada |
| ARC-Challenge | No disponible | Etiqueta presente, sin cifra publicada |

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones aritméticas derivadas del tamaño de 27.000 millones de parámetros y del número de bits por peso de cada cuantización; no están confirmadas por el autor del repositorio y deben verificarse con los tamaños reales de los ficheros GGUF.

- q8_0: aproximadamente 28-29 GB de pesos. Requiere GPU de 40 GB o superior (A100 40 GB, A100 80 GB, H100) para dejar margen a la KV cache.
- q6_k: aproximadamente 22-23 GB. Cabe en RTX 4090 (24 GB) con contexto corto, o en A100 40 GB con contexto amplio.
- q5_k_m: aproximadamente 18-19 GB. Ejecutable en RTX 4090 y RTX 3090 (24 GB) con margen moderado.
- q4_k_m: aproximadamente 16-17 GB. Es la opción más equilibrada para GPU de 24 GB; también viable repartiendo capas entre dos GPU de 12-16 GB.
- iq4_nl e iq4_xs: aproximadamente 14-15 GB. Permiten ejecución en GPU de 16 GB y en configuraciones híbridas CPU+GPU.
- Componente visual: hay que sumar el tamaño del fichero mmproj correspondiente, no especificado en la información disponible.
- KV cache: con una ventana declarada de 1 millón de tokens, el consumo de KV cache crece de forma aproximadamente lineal con la longitud y puede superar con holgura el tamaño de los pesos, incluso aplicando cuantización de caché. Contextos de 1 millón de tokens exigen hardware de centro de datos y, en la práctica, mecanismos como offloading a CPU o caché cuantizada.
- GPU recomendadas: A100 80 GB, H100 y H200 para contexto largo real; RTX 4090, RTX 3090 y RTX 5090 para cuantizaciones de 4-6 bits con contexto moderado.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones IQ4_NL, IQ4_XS, Q4_K_M y Q5_K_M sobre GPU de 16-24 GB, y en Q6_K sobre 24 GB con contexto limitado. En 12 GB solo es viable con cuantizaciones más agresivas no listadas aquí o con offloading parcial a CPU.
- Opciones de despliegue: llama.cpp y Ollama están explícitamente etiquetados; el formato GGUF también permite vLLM (con soporte GGUF), LM Studio, KoboldCpp y text-generation-webui. El soporte de decodificación especulativa depende del runtime que implemente el modelo borrador declarado.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de speedup por decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solstice-AI/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-GGUF-... | 27.000 millones (declarado) | 1.000.000 de tokens (declarado) | Sin cifras publicadas | Apache 2.0 según etiqueta; campo de la ficha no disponible | GGUF, llama.cpp y Ollama |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored (modelo base) | 27.000 millones (declarado) | Según el modelo base | No disponible | No disponible | Pesos originales; este repositorio es su cuantización |
| Otras alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

La búsqueda web realizada no ha devuelto información sobre modelos comparables: los resultados obtenidos tratan exclusivamente sobre el fenómeno astronómico del solsticio y sobre una empresa de materiales avanzados, por lo que no aportan datos utilizables para esta comparativa. Tampoco se dispone de cifras verificables del modelo base ni de sus competidores en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentación: el repositorio no incluye tarjeta de modelo, descripción de entrenamiento, metodología de cuantización ni resultados de evaluación. Toda la información procede de las etiquetas y del nombre del repositorio.
- Discrepancia de licencia: la etiqueta indica Apache 2.0, pero el campo de licencia de la ficha figura como no disponible. Antes de un uso comercial debe confirmarse la licencia real, teniendo en cuenta además que la licencia del modelo base (DavidAU) no está especificada en la información disponible.
- Riesgo de alucinación: no se publican evaluaciones de fiabilidad ni tasas de error; al tratarse de un modelo desinhibido, la reducción de rechazos puede correlacionar con una menor cautela ante peticiones ambiguas o sin respaldo factual.
- Sesgos: no hay información sobre composición del dataset ni sobre análisis de sesgos. El alcance lingüístico declarado (inglés y chino) implica un rendimiento potencialmente pobre en castellano y otras lenguas no incluidas en las etiquetas.
- Contexto nominal frente a contexto efectivo: la etiqueta de 1 millón de tokens corresponde a una extensión YaRN declarada; no se aporta ninguna evaluación de recuperación de información a esa distancia, por lo que el rendimiento efectivo en contextos muy largos es desconocido.
- Efectos de la desinhibición: las modificaciones de tipo abliteration suelen degradar capacidades generales y pueden incrementar la generación de contenido dañino, sesgado o no verificado. No se documenta ninguna evaluación de seguridad posterior.
- Cuantización agresiva: las variantes IQ4_NL, IQ4_XS y Q4_K_M introducen pérdida de precisión frente a los pesos originales, con impacto no medido en razonamiento, código y multimodalidad.
- Afirmaciones sin respaldo: la etiqueta "beats-claude-opus-4.6" no viene acompañada de ninguna evidencia experimental y no debe tomarse como dato.
- Madurez del artefacto: 0 descargas y 0 "likes" en el momento de la consulta, sin historial de validación por parte de la comunidad.
- Compatibilidad de tool calling y agentes: no se documenta soporte de function calling, por lo que no debe asumirse en integraciones de producción sin pruebas previas.
- Fechas del repositorio: la fecha de creación indicada (2026-09-11) es posterior a la fecha habitual de referencia, lo que conviene tener en cuenta al evaluar la trazabilidad del artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-GGUF-UltraOptimised-DSpark-MTP-1M
- Modelo base declarado: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Dataset declarado: https://huggingface.co/datasets/Solstice-AI/Solace-1.0-Omni
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo. Los resultados devueltos corresponden a páginas sobre el solsticio astronómico (fr.wikipedia.org/wiki/Solstice, icalendrier.fr/outils/equinoxes-solstices, en.wikipedia.org/wiki/Solstice, futura-sciences.com) y a la empresa Solstice Advanced Materials (solstice.com), ninguno relacionado con este modelo.
