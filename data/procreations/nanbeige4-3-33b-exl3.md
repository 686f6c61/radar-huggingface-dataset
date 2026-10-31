# ProCreations/Nanbeige4.3-33B-EXL3

## Resumen

Nanbeige4.3-33B-EXL3 es una colección de cuantizaciones EXL3 (ExLlamaV3) del modelo base Nanbeige4.3-33B, desarrollado por Nanbeige y cuantizado de forma calibrada por el usuario de Hugging Face ProCreations. El repositorio ofrece ocho "rungs" de compresión (de 2,05 a 6,05 bits por peso) distribuidos en ramas independientes, lo que permite elegir el punto de equilibrio entre calidad y consumo de memoria según la GPU disponible. El modelo base es un modelo de generación de texto bilingüe (inglés y chino) con licencia Apache-2.0, lo que lo hace apto para uso comercial.

La relevancia de esta ficha de cuantización radica en su rigor metodológico: cada rung incluye mediciones oficiales de divergencia KL respecto al modelo BF16 en cuatro dominios (asistente, agéntico, chino y decisión), pruebas de masa de parada (stop mass), regresiones de calidad en tareas core y mediciones de velocidad de decodificación en hardware concreto (RTX PRO 6000). Esto permite a los desarrolladores elegir cuantización con datos medidos en lugar de suposiciones. Los rungs bajos (2,05-3,05 bpw) presentan advertencias documentadas para trabajo agéntico y de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (arquitectura llama según tags) |
| Parámetros totales | 33B (aproximado, según denominación del modelo base) |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible explícitamente; las recomendaciones asumen 16K-64K según VRAM disponible |
| Tipos de cuantización | EXL3: 2,05 / 2,55 / 3,05 / 3,55 / 4,05 / 4,55 / 5,05 / 6,05 bpw (cabeza de salida a 6 bits, embeddings sin cuantizar) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | EXL3 (ExLlamaV3), ramas por bitrate; tamaño del repo 145,1 GB |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.3-33B es un transformer decoder de estilo Llama orientado a generación de texto. Los detalles de su preentrenamiento (número de tokens, composición del corpus, alineación con RLHF/DPO) no se han publicado en la información disponible. La etiqueta de idiomas (inglés y chino) sugiere un corpus bilingüe, y las métricas de calidad incluyen un dominio específico en chino, lo que confirma soporte nativo para ese idioma.

La innovación principal de este repositorio está en la cuantización: se trata de cuantizaciones EXL3 calibradas, con cabeza de salida a 6 bits y embeddings sin cuantizar en todos los rungs, y una asignación de sensibilidad propia por nivel de compresión. Cada rung se validó con 298 pruebas core requeridas y comprobaciones nativas por defecto (4/4), midiendo divergencia KL frente a BF16 y cambios predichos en la longitud de razonamiento (thinking length). Las mediciones de velocidad se realizaron en una Modal RTX PRO 6000 Server Edition (600 W) con KV nativo Q8, y los rungs 4,05 y 5,05 también se midieron en una estación RTX PRO 6000 Workstation Edition, con y sin el borrador DFlash2 (decodificación especulativa).

## Capacidades

- Generación de texto general en inglés y chino (pipeline text-generation)
- Razonamiento con modo de pensamiento extendido (thinking): el modelo genera tokens de razonamiento cuya longitud se ve afectada por la cuantización (los rungs bajos predicen un 4,5-7,6 % más de tokens de thinking)
- Capacidades agénticas: existe un dominio de evaluación "agentic" y una prueba "agentic_coding_on", lo que indica uso previsto en flujos agénticos y con herramientas
- Codificación: evaluada en las pruebas core (con regresiones documentadas en los rungs bajos)
- Comprensión y generación en chino con métricas dedicadas (dominio "Chinese")
- No hay evidencia en la información disponible de capacidades multimodales (visión, audio) ni de function calling explícito

## Casos de uso

- Asistentes conversacionales locales: con el rung 4,05 bpw cabe en una GPU de 24 GiB con contexto de 16K, adecuado para chat multi-turno autohospedado
- Agentes de código autohospedados: en GPUs de 32-48 GiB con los rungs 5,05 o 6,05, que superan las pruebas de calidad agéntica sin regresiones
- Despliegue en chino e inglés: el dominio "Chinese" está medido explícitamente, útil para aplicaciones bilingües o mercados asiáticos
- Inferencia de alto throughput en servidor: velocidades medidas de 46-85 tok/s en decodificación single-stream según rung en RTX PRO 6000
- Experimentación con compresión extrema: los rungs 2,05-3,05 permiten ejecutar el modelo en memorias muy ajustadas, aunque no se recomiendan para trabajo agéntico o de código
- Ajuste fino del balance calidad/VRAM en producción: las tablas de KLD y stop mass permiten seleccionar el rung óptimo para el presupuesto de memoria exacto de cada despliegue

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado métricas de calidad de cuantización y velocidad de decodificación:

| Rama | Pesos (GiB) | KLD asistente | KLD agéntico | KLD chino | Notas de calidad | Decodificación (tok/s, RTX PRO 6000) |
|---|---|---|---|---|---|---|
| 2,05 bpw | 10,41 | 0,1768 | 0,0467 | 0,2859 | Advertencia: stop mass fuera de banda | 84,7 |
| 2,55 bpw | 12,20 | 0,0922 | 0,0205 | 0,1452 | Advertencia agéntica; regresión coding-on | 78,9 |
| 3,05 bpw | 13,99 | 0,0481 | 0,0103 | 0,0742 | Regresión coding-on | 70,8 |
| 3,55 bpw | 15,77 | 0,0251 | 0,0056 | 0,0388 | Pass | 65,1 |
| 4,05 bpw | 17,56 | 0,0142 | 0,0033 | 0,0219 | Advertencia: regresión en chino | no disponible (Vega, ver DFlash2) |
| 4,55 bpw | 19,35 | 0,0076 | 0,0021 | 0,0121 | Pass | 56,5 |
| 5,05 bpw | 21,14 | 0,0044 | 0,0015 | 0,0070 | Pass | no disponible (Vega, ver DFlash2) |
| 6,05 bpw | 24,72 | 0,0019 | 0,0011 | 0,0030 | Pass | 46,6 |

## Requisitos de hardware

- Rung 4,05 bpw: 17,56 GiB de pesos + 3,25 GiB de KV FP16 (16K contexto) ≈ 20,8 GiB; cabe en GPUs de 24 GiB (RTX 3090, RTX 4090) con ~3,2 GiB de margen
- Rung 5,05 bpw: 21,14 GiB de pesos + 6,5 GiB de KV (32K) ≈ 27,6 GiB; recomendado para GPUs de 32 GiB o superiores
- Rung 6,05 bpw: 24,72 GiB de pesos + 13 GiB de KV (64K) ≈ 37,7 GiB; recomendado para GPUs de 48 GiB o más (A6000, L40S, A100, H100, RTX PRO 6000)
- Rung 3,55 bpw: 15,77 GiB de pesos + 0,81 GiB de KV (4K) ≈ 16,6 GiB; opción para GPUs de 20 GiB con restricción de memoria
- Rungs 2,05-3,05: para compresión agresiva; no recomendados para trabajo agéntico o de código
- El coste de KV FP16 es de 208 KiB por token; el contexto cuenta prompt más tokens generados dentro del pool de caché
- Despliegue: ExLlamaV3 (formato EXL3 es exclusivo de este motor); no compatible de forma nativa con vLLM, llama.cpp, Ollama o TGI
- Throughput medido: 46,6-84,7 tok/s en decodificación single-stream en RTX PRO 6000 Server Edition según rung (a mayor compresión, mayor velocidad)

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Licencia | Idiomas | Particularidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-EXL3 (esta ficha) | 33B | EXL3, 2,05-6,05 bpw calibrado | Apache-2.0 | en, zh | Validación de cuantización exhaustiva con KLD y stop mass |
| Nanbeige/Nanbeige4.3-33B (base) | 33B | BF16 (sin cuantizar) | Apache-2.0 | en, zh | Referencia de calidad máxima; requiere ~66 GiB+ |
| Otros modelos 30-34B cuantizados EXL3 (p. ej. Qwen3-32B-EXL3 de terceros) | 32B | EXL3 variable | variable | multilingüe | no disponible: sin datos comparativos de rendimiento publicados en la información proporcionada |

No se dispone de comparativas de benchmarks directas con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Rungs bajos (2,05, 2,55, 3,05): stop mass fuera de la banda de calidad (0,929-0,957 frente al suelo de 0,97), lo que predice razonamientos más largos; regresiones documentadas en coding-on de -8,89 a -11,11 puntos porcentuales. No recomendados para trabajo agéntico o de código
- Rung 4,05: regresión en chino documentada (-4,72 pp [-9,72, -0,28] en contraste pareado), con alcance limitado a una sola plantilla y pruebas múltiples
- El formato EXL3 solo funciona con ExLlamaV3; no es compatible con los runtimes más habituales (vLLM, llama.cpp, Ollama)
- Las estimaciones de VRAM son cálculos de planificación de capacidad, no pruebas reales en cada GPU de consumo
- La predicción de longitud de thinking es off-policy (basada en teacher-forced stop mass), no una medición de generación real
- Sesgos del modelo base: no documentados en la información disponible
- Riesgo de alucinación: no cuantificado en la información disponible
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial
- Idiomas limitados a inglés y chino; el rendimiento en otros idiomas no está evaluado

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/ProCreations/Nanbeige4.3-33B-EXL3
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Ramas por bitrate: 2,05bpw, 2,55bpw, 3,05bpw, 3,55bpw, 4,05bpw, 4,55bpw, 5,05bpw y 6,05bpw (enlaces en las tablas del README del repositorio)
- Paper, blog oficial o demo del modelo base: no disponible en la información proporcionada
