# sigmanih/Qwen3.8-27B-GGUF-Q4_K_S

## Resumen

Qwen3.8-27B-GGUF-Q4_K_S es una cuantización GGUF en formato Q4_K_S del modelo sigmanih/Qwen3.8-27B, publicada por el usuario sigmanih a través de su herramienta Sigma Studio (SigmaEngine). Se trata de un modelo causal de 27.320.697.856 parámetros (unos 27,3B) orientado a generación de texto conversacional, con una ventana de contexto declarada de 32.768 tokens y pesos distribuidos en un repositorio de 15,8 GB. La model card lo presenta como un modelo listo para producción para razonamiento lógico avanzado, especialización de dominio empresarial y refactorización de código compleja.

La relevancia de esta ficha es doble. Por un lado, ofrece una alternativa de despliegue local de un modelo de ~27B en GPUs de consumo de 24 GB de VRAM (RTX 3090/4090) gracias a la cuantización Q4_K_S. Por otro, la información publicada por el autor presenta inconsistencias notables que conviene señalar: la licencia aparece como "other" en los metadatos de Hugging Face mientras el README muestra una insignia Apache-2.0; el formato de pesos se declara como "Sconosciuto" (desconocido en italiano) pese a que el repositorio es explícitamente GGUF; y los benchmarks se han medido sobre un subconjunto reducido de cada suite (100 preguntas en total), por lo que no son comparables con ejecuciones completas.

El modelo declara soporte únicamente para inglés e italiano, lo que limita su uso directo en castellano sin evaluación adicional. Su valor práctico está en el despliegue local con llama.cpp/Ollama y en flujos de razonamiento y código, no en un uso multilingüe amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (transformer decoder-only, según model card) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_S (esta publicación); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | inglés (en), italiano (it) |
| Licencia | "other" en metadatos de Hugging Face; el README muestra insignia Apache-2.0 (contradicción no resuelta) |
| Formato de pesos | GGUF (el campo de la model card indica "Sconosciuto", inconsistente con el repositorio) |
| Modelo base | sigmanih/Qwen3.8-27B |
| Tamaño del repositorio | 15,8 GB |
| Descargas / likes | 225 / 3 |
| Fecha de creación / actualización | 2026-08-23 / 2026-11-02 |

## Arquitectura y entrenamiento

La model card describe la arquitectura base como CausalLM, es decir, un transformer decoder-only autorregresivo estándar, sin indicios de mezcla de expertos (MoE), modelos de estado espacio (SSM) ni arquitecturas híbridas. El modelo tiene 27,3B parámetros densos, lo que implica que en inferencia se activan todos los parámetros en cada token. No se proporciona información sobre el número de capas, dimensión oculta, número de cabezas de atención ni detalles del tokenizador.

No hay datos publicados sobre el corpus de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de pensamiento extendido más allá de la mención a un modo "Deep Thinking" (CoT) en la evaluación. La model card menciona que el modelo se ha "optimizado y publicado" mediante el módulo Model Hub de Sigma Studio, pero no detalla qué transformaciones se aplicaron sobre el modelo base. La información sobre el proceso de entrenamiento es, por tanto, insuficiente para evaluar la calidad o procedencia de los datos.

## Capacidades

- Generación de texto conversacional multi-turno en inglés e italiano.
- Razonamiento de sentido común y NLI situacional (evaluado en HellaSwag).
- Razonamiento científico y de nivel escolar (ARC-Challenge).
- Razonamiento académico de nivel graduado (GPQA), con rendimiento bajo según la propia evaluación del autor.
- Matemáticas de varios pasos (GSM8K) y matemáticas de competición (MATH).
- Generación de código Python (HumanEval, MBPP) con ejecución de tests unitarios en la evaluación.
- Modo de razonamiento explícito "Deep Thinking" (cadena de pensamiento) frente a respuesta directa "No-Thinking".
- Tool calling y adherencia a esquemas de herramientas: la model card reporta un 89,1% de adherencia al protocolo de herramientas en un sandbox de agentes.
- Capacidad de agente multi-paso en entorno aislado (Sandbox Jail), con contención del 100% según el autor, aunque con 0,0% de finalización autónoma de tareas en el escenario evaluado.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de 24 GB: la cuantización Q4_K_S permite cargar los ~27,3B parámetros con aproximadamente 23,4 GB de VRAM en offload completo a GPU, lo que encaja en una RTX 3090 o RTX 4090 para asistentes de código y chat privados sin conexión.
- Refactorización de código en local: el modelo declara buen rendimiento en HumanEval y MBPP (100% en la muestra evaluada) y puede integrarse en un flujo de edición de repositorios con herramientas de lectura/escritura de ficheros, siempre con revisión humana dado el tamaño reducido de la muestra de evaluación.
- Asistente conversacional en inglés o italiano: para productos dirigidos a esos mercados, el modelo cubre conversaciones multi-turno con 32.768 tokens de contexto, suficiente para hilos largos o documentos de referencia medianos.
- Razonamiento matemático asistido: uso en modo "Deep Thinking" para problemas de varios pasos (GSM8K/MATH), aceptando mayor latencia a cambio de trazas de razonamiento auditables.
- Automatización de agentes con tool calling: integración en pipelines donde el modelo deba invocar funciones registradas con esquemas estrictos, aprovechando la adherencia al protocolo reportada, con supervisión en la ejecución de acciones.
- Prototipado e investigación de cuantizaciones: como artefacto GGUF de referencia para medir el impacto de Q4_K_S frente al modelo base en tareas de razonamiento y código.
- Filtrado y clasificación de texto en inglés/italiano: generación de resúmenes, extracción de entidades o etiquetado en lotes mediante llama.cpp en CPU/GPU híbrida (unos 21,9 GB de RAM en modo híbrido).

## Benchmarks y rendimiento

Los datos provienen de la model card del autor, medidos sobre un subconjunto reducido de cada suite (100 preguntas en total, temperatura 0,0, semilla 42). El propio autor advierte que la puntuación no es comparable con una ejecución de suite completa.

| Benchmark | Aciertos / total | Precisión | Estado declarado |
|---|---|---|---|
| ARC-Challenge | 9 / 9 | 100% | superado |
| BIG-Bench Hard | 7 / 7 | 100% | superado |
| GPQA | 2 / 9 | 22% | bajo |
| GSM8K | 8 / 9 | 89% | superado |
| HellaSwag | 7 / 9 | 78% | superado |
| HumanEval | 7 / 7 | 100% | superado |
| MATH | 8 / 9 | 89% | superado |
| MBPP | 9 / 9 | 100% | superado |
| MMLU | 8 / 14 | 57% | aceptable |
| MMLU-Pro | 5 / 9 | 56% | aceptable |
| TruthfulQA | 8 / 9 | 89% | superado |
| Total | 78 / 100 | 78% | — |

| Modo de ejecución | Precisión | Preguntas superadas |
|---|---|---|
| No-Thinking (respuesta directa) | 84,2% | 48 / 57 |
| Deep Thinking (CoT) | 69,8% | 30 / 43 |

La comparación entre modos muestra una caída de 14,4 puntos porcentuales al activar cadena de pensamiento, un resultado contraintuitivo que el autor no explica y que sugiere que el modo CoT no está bien ajustado en esta variante. No se han publicado resultados de benchmarks completos ni comparaciones con modelos de referencia en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~23,4 GB con offload completo a GPU para la cuantización Q4_K_S; ~21,9 GB de RAM en modo CPU/híbrido.
- GPU recomendadas por el autor: 24 GB de VRAM, es decir, RTX 3090, RTX 4090 o GPUs profesionales equivalentes (A10G 24 GB, L4 24 GB); para mayor margen, A100 40/80 GB o H100.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 de 24 GB, aunque con poco margen para el contexto KV cache a 32.768 tokens; en GPUs de 16 GB o menos requeriría offload parcial a RAM.
- Memoria del sistema: se recomienda 32-64 GB de RAM para despliegue híbrido.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la model card menciona SigmaEngine y endpoints compatibles. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que no se confirma su disponibilidad.
- Latencia y throughput: no disponibles. El autor indica "mínima latencia" en modo No-Thinking y mayor coste en modo CoT, sin cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. La model card no incluye comparaciones con otros modelos de ~27B ni con alternativas de la misma categoría, y los benchmarks publicados se han medido sobre subconjuntos reducidos, lo que impide una comparación justa. Como referencia estructural, esta variante comparte categoría (modelo denso de ~27B en GGUF Q4) con familias habituales de ese rango de tamaño, pero no se aportan cifras de parámetros, contexto, rendimiento ni licencia de esas alternativas en la información disponible.

| Criterio | Qwen3.8-27B-GGUF-Q4_K_S | Alternativas comparables |
|---|---|---|
| Parámetros | ~27,3B densos | no disponible |
| Contexto | 32.768 tokens | no disponible |
| Licencia | "other" / Apache-2.0 (contradictorio) | no disponible |
| Formato | GGUF Q4_K_S | no disponible |
| Benchmarks completos | no disponibles | no disponible |

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés e italiano; el rendimiento en castellano no está evaluado y no debería asumirse.
- Benchmarks no representativos: las puntuaciones se han obtenido sobre 100 preguntas en total (entre 7 y 14 por suite), con el propio autor advirtiendo que no son comparables con ejecuciones completas. Los 100% en HumanEval o MBPP corresponden a 7 y 9 preguntas respectivamente.
- GPQA bajo: 22% (2 de 9) indica debilidad en razonamiento académico de nivel graduado.
- Modo CoT contraproducente: el modo Deep Thinking rinde 14,4 puntos menos que la respuesta directa en la evaluación del autor, lo que desaconseja activarlo sin validación propia.
- Agentes: la finalización autónoma de tareas se reporta como 0,0% (0 de 1 escenarios), pese a una adherencia al protocolo de herramientas del 89,1%; no es fiable como agente autónomo sin supervisión.
- Licencia ambigua: los metadatos indican "other" mientras el README muestra Apache-2.0. Antes de uso comercial debe aclararse con el autor; no se puede asumir Apache-2.0.
- Procedencia y entrenamiento no documentados: no hay información sobre datos, tokens, RLHF/DPO ni sobre las modificaciones aplicadas al modelo base, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación: TruthfulQA al 89% sobre 9 preguntas no es evidencia suficiente; en producción debe aplicarse verificación de hechos.
- Contexto: 32.768 tokens es moderado para cargas de documentos largos y, con Q4_K_S en 24 GB de VRAM, el KV cache reduce el margen disponible.
- Metadatos inconsistentes: el campo de formato de pesos aparece como "Sconosciuto" y el pie de la model card está truncado, lo que indica poca revisión editorial del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sigmanih/Qwen3.8-27B-GGUF-Q4_K_S
- Modelo base: https://huggingface.co/sigmanih/Qwen3.8-27B
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Licencia Apache-2.0 (referenciada en el README, no confirmada en metadatos): https://opensource.org/licenses/Apache-2.0
