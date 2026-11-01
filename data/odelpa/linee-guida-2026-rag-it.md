# odelpa/linee-guida-2026-rag-it

## Resumen

`odelpa/linee-guida-2026-rag-it` no es un modelo de lenguaje en sentido estricto, sino un paquete reproducible que implementa una pipeline de generación aumentada por recuperación (RAG) sobre literatura clínica. Lo publica el usuario odelpa y combina un índice de 773 abstract de guías de práctica clínica y documentos de consenso publicados en 2026 (con licencia CC BY 4.0, obtenidos de Europe PMC) con un recuperador léxico BM25, una compuerta de confianza y una plantilla de prompt. El modelo generativo subyacente es MedGemma-27B text-it en cuantización GGUF Q4_K_M, pero el repositorio no incluye ni redistribuye sus pesos: el `Modelfile` de Ollama apunta al modelo base, que el usuario descarga por su cuenta aceptando los términos HAI-DEF de Google.

El interés del paquete es metodológico y de verificación: publica el corpus con atribución por documento, el código de la pipeline (Apache-2.0), los conjuntos de preguntas de desarrollo (86 ítems) y de test (131 ítems), y los resultados ítem por ítem. El autor reporta una mejora de exactitud de 0,649 a 0,908 en el conjunto de test al activar el RAG con compuerta, lo que supone +25,95 puntos con un error estándar apareado de 4,28 (z = 6,07). Se trata de un experimento piloto descrito como «a libro abierto»: mide la capacidad de recuperar y usar información publicada después del corte de entrenamiento, no la competencia clínica general del modelo.

El paquete declara explícitamente que no es un dispositivo médico y que no debe emplearse para diagnóstico, terapia ni decisiones clínicas. Su valor práctico está en servir como plantilla auditable para construir sistemas RAG sobre dominios regulados, y como caso de estudio de evaluación rigurosa con separación dev/test y trazabilidad de licencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline RAG (retrieval BM25 + compuerta de confianza + prompt) sobre MedGemma-27B text-it; el modelo generativo es un transformer de la familia Gemma |
| Parametros totales | 27 000 millones en el modelo base (MedGemma-27B text-it); el paquete en sí no contiene pesos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (única cuantización referenciada en el `Modelfile`) |
| Idiomas soportados | italiano (it) e inglés (en); las fuentes del corpus están en inglés |
| Licencia | Apache-2.0 para el código y el paquete; el modelo base se rige por los términos HAI-DEF de Google; el corpus es CC BY 4.0 con atribución |
| Formato de pesos | no se distribuyen pesos; el `Modelfile` referencia `hf.co/unsloth/medgemma-27b-text-it-GGUF:Q4_K_M` en formato GGUF |

## Arquitectura y entrenamiento

No hay entrenamiento de un modelo nuevo. La pipeline consta de tres etapas: recuperación léxica BM25 sobre un índice de fragmentos (`chunks.jsonl`) construido a partir de 773 abstract; una compuerta de confianza con umbrales `(t_r, t_c, t_n) = (0,6; 0,7; 1,01)` calibrados únicamente sobre el conjunto de desarrollo, que decide si se activa el contexto recuperado; y una plantilla de prompt que inyecta los fragmentos seleccionados en la consulta a MedGemma-27B text-it. El recuperador alcanza un hit@1 de 0,992 y no se registraron fallos de parseo (`parse_fail = 0`).

El corpus se limita a abstract, no a texto completo, y las preguntas se generaron automáticamente con MedGemma a temperatura 0 a partir de un abstract presente en el índice, conservando solo aquellas que el modelo acertaba con el abstract a la vista. Esa construcción convierte la evaluación en una prueba de recuperación de conocimiento posterior al corte de entrenamiento, no en una prueba de razonamiento clínico. Las preguntas no fueron revisadas por clínicos y parte del corpus no es estrictamente clínico (metodología, bioinformática). No se documentan datos de entrenamiento adicionales, RLHF ni DPO, porque no se entrena ningún modelo.

## Capacidades

- Recuperación léxica BM25 sobre un corpus de 773 abstract de guías clínicas y consensos de 2026, con atribución por documento.
- Generación de respuestas de opción múltiple (A–D) fundamentadas en los fragmentos recuperados, con visualización de las fuentes en el esqueleto Gradio incluido.
- Compuerta de confianza calibrada que decide cuándo activar el contexto recuperado, con umbrales derivados solo del conjunto de desarrollo.
- Evaluación reproducible: scripts `evaluate.py`, conjuntos `questions_dev.json` (86) y `questions_test.json` (131) y resultados ítem por ítem.
- Soporte bilingüe italiano/inglés en la interfaz y en las instrucciones; el corpus fuente está en inglés.
- Despliegue local mediante Ollama a partir del `Modelfile` incluido, que referencia el modelo base sin redistribuirlo.
- Trazabilidad de licencias: verificación de licencia en Europe PMC (`license_check_europepmc_20261026.json`) y fichero `ATTRIBUTION.md`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Plantilla para sistemas RAG en dominios regulados: el paquete separa índice, código y evaluación, de modo que un equipo puede sustituir el corpus por su propia documentación manteniendo la compuerta de confianza y el evaluador.
- Auditoría de conocimiento posterior al corte: permite medir cuánto conocimiento nuevo (publicado en 2026) puede recuperar un modelo de 27 000 millones de parámetros cuando se le da acceso a un índice actualizado, con separación estricta dev/test.
- Evaluación de pipelines de recuperación: el hit@1 de 0,992 y los conjuntos de preguntas permiten comparar recuperadores alternativos (densos frente a léxicos) sobre el mismo corpus y las mismas preguntas.
- Demostración docente de RAG verificable: el esqueleto Gradio que muestra las fuentes sirve para ilustrar la diferencia entre respuesta fundamentada y respuesta sin contexto en un entorno controlado.
- Estudio de calibración de compuertas: los umbrales `(t_r, t_c, t_n)` y su calibración exclusiva sobre dev ofrecen un ejemplo reproducible de cómo evitar la fuga de información entre conjuntos.
- Referencia para el cumplimiento de licencias en corpus científicos: el flujo de verificación en Europe PMC y la atribución por documento son reutilizables en proyectos que mezclan CC BY 4.0 con términos de modelo restrictivos.
- Prototipado local en hardware de consumo: la cuantización Q4_K_M de un modelo de 27 000 millones permite ejecutar la pipeline en Ollama sin infraestructura de servidor, siempre que se acepten los términos HAI-DEF.

## Benchmarks y rendimiento

Resultados publicados por el autor (exactitud en opción múltiple A–D, MedGemma-27B Q4):

| Conjunto | n | Base | Base + RAG (compuerta) | Base + RAG (siempre activo) |
|---|---|---|---|---|
| dev (calibración de compuerta) | 86 | 0,744 | 0,977 | 0,977 |
| test (ejecutado una vez) | 131 | 0,649 | 0,908 | 0,947 |

En test, la diferencia base frente a base + RAG con compuerta es Δ = +25,95 puntos, con error estándar apareado de 4,28 puntos y z = 6,07 (37 respuestas correctas adicionales, 3 menos). El recuperador alcanza hit@1 = 0,992 y `parse_fail = 0`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita en la información proporcionada; para un modelo de 27 000 millones en Q4_K_M la estimación habitual ronda los 16–18 GB, pero el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, un despliegue cómodo requiere GPUs de 24 GB o más (RTX 4090, L40S, A100 40 GB, H100).
- GPU de consumo: la cuantización Q4_K_M está pensada para ejecución local; encaja en tarjetas de 24 GB y, con descarga parcial a CPU, en configuraciones de 16 GB.
- Opciones de despliegue: Ollama mediante el `Modelfile` incluido; el paquete también incluye un esqueleto Gradio. No se documentan integraciones con vLLM, TGI ni llama.cpp más allá de la ruta GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| odelpa/linee-guida-2026-rag-it | 27 000 M (base, no incluido) | no disponible | RAG BM25 + compuerta sobre MedGemma | Apache-2.0 (código); HAI-DEF (base); CC BY 4.0 (corpus) | HuggingFace, requiere descargar el base por separado |
| MedGemma-27B text-it | 27 000 M | no disponible | Modelo médico de texto | Términos HAI-DEF | HuggingFace (Google) |
| MedGemma-27B text-it GGUF (unsloth) | 27 000 M | no disponible | Cuantización GGUF del anterior | Términos HAI-DEF | HuggingFace |
| Pipeline RAG genérica sobre un LLM abierto | variable | variable | Recuperación densa o léxica sin compuerta calibrada | variable | variable |

La comparación relevante no es de parámetros sino de metodología: frente a una pipeline RAG genérica, este paquete aporta separación dev/test, calibración de compuerta solo en dev y publicación de resultados ítem por ítem. No se dispone de datos de benchmarks comparables con otros sistemas RAG médicos en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor prohíbe explícitamente su uso para diagnóstico, terapia o decisiones clínicas.
- Evaluación «a libro abierto»: las preguntas se generaron a partir de abstract presentes en el índice y se filtraron por acierto del modelo con el abstract a la vista; mide recuperación de conocimiento nuevo, no competencia clínica.
- Preguntas no revisadas por clínicos y corpus parcialmente no clínico (metodología, bioinformática).
- Solo abstract, no texto completo; la evidencia disponible para fundamentar respuestas es limitada.
- Idioma de las fuentes en inglés, aunque la interfaz y las instrucciones son en italiano; no hay evaluación en castellano.
- Riesgo de alucinación inherente al modelo base: el RAG reduce pero no elimina respuestas incorrectas o incompletas; el propio autor recomienda verificar contra la guía original.
- Restricciones vinculantes HAI-DEF §3.2: prohibido el uso contemplado en la Prohibited Use Policy, cualquier uso que pueda llevar a una autoridad reguladora a considerar a Google fabricante de un dispositivo médico, y el uso contrario a la ley.
- El paquete no redistribuye pesos: quien lo despliegue debe descargar MedGemma y aceptar sus términos, lo que condiciona la reproducibilidad completa.
- Los umbrales de la compuerta están calibrados sobre 86 ítems de desarrollo, un tamaño reducido que puede afectar a la generalización.
- Las preguntas generadas por MedGemma son Output según los términos HAI-DEF y su reutilización es responsabilidad de quien las usa (§3.3), con obligación de atribución a las fuentes CC BY 4.0.
- Preprint no revisado por pares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/odelpa/linee-guida-2026-rag-it
- Índice del corpus (repo dataset): https://huggingface.co/datasets/odelpa/linee-guida-2026-rag-it-index
- Preprint en Zenodo: https://doi.org/10.5281/zenodo.23664674
- PDF del preprint (en el repo): paper/linee-guida-2026-rag-it_preprint.pdf
- Explicación divulgativa (en el repo): paper/divulgativa.pdf
- Modelo base en GGUF: https://huggingface.co/unsloth/medgemma-27b-text-it-GGUF
- Términos HAI-DEF: https://developers.google.com/health-ai-developer-foundations/terms
- Política de usos prohibidos HAI-DEF: https://developers.google.com/health-ai-developer-foundations/prohibited-use-policy
- Europe PMC (fuente del corpus): https://europepmc.org
