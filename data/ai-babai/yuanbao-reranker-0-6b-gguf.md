# ai-babai/Yuanbao-Reranker-0.6B-GGUF

## Resumen

Yuanbao-Reranker-0.6B-GGUF es la versión cuantizada en formato GGUF del modelo Yuanbao-Reranker-0.6B, desarrollado originalmente por Tencent a partir de Qwen3-0.6B y afinado para búsqueda multilingüe y generación aumentada por recuperación (RAG). Este repositorio, publicado por el usuario ai-babai, empaqueta los pesos en Q8_0, Q4_K_M y F16 para su ejecución local con llama.cpp, llama-server, node-llama-cpp, QMD y Open WebUI. El pipeline declarado es text-ranking: el modelo no genera texto libre, sino que puntúa pares consulta-documento para reordenar resultados de un recuperador previo.

El modelo resuelve la segunda etapa del pipeline de recuperación de información: tras una búsqueda inicial (BM25, embeddings, etc.), el reranker asigna una puntuación de relevancia a cada par y permite reordenar los candidatos. Con 595.778.560 parámetros (un transformer denso de ~0.6B), es lo bastante pequeño para ejecutarse en CPU o en GPU de consumo, y su soporte declarado de ruso, inglés, chino y otros idiomas lo hace útil para RAG multilingüe.

Su relevancia actual radica en dos factores: la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, y la disponibilidad de GGUF probado en llama.cpp sobre Apple Silicon (Metal) y CPU, con resultados publicados sobre el benchmark ruso RuBQ. El autor reporta nDCG@10 de 0.848 en Q8_0 frente a 0.812 de Qwen3-Reranker-0.6B Q8_0 en el mismo conjunto piloto de 150 consultas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parámetros totales | 595.778.560 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (0.64 GB), Q4_K_M (0.40 GB), F16 (1.20 GB) |
| Idiomas soportados | ru, en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Yuanbao-Reranker-0.6B de Yuanbao-Search, un fine-tuning de Qwen3-0.6B orientado a ranking de documentos. Se trata de un transformer denso de aproximadamente 0.6B parámetros que recibe un par consulta-documento y produce una puntuación de relevancia; no es un modelo generativo en este uso, sino un clasificador de ranking. El repositorio GGUF es una conversión de cuantización realizada por ai-babai, no un reentrenamiento: los pesos conservan el comportamiento del modelo original, con las diferencias introducidas por la pérdida de precisión de cada cuantización.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El autor referencia el paper de Tencent (arXiv:2611.10405) como fuente del modelo original. La innovación práctica del repositorio es la integración con el ecosistema llama.cpp: soporte de `--reranking` en llama-server, endpoint `/v1/rerank` compatible con el formato de Cohere y Jina, y guías específicas para QMD y Open WebUI. El autor probó el build de llama.cpp en Apple Metal y CPU, y QMD sobre Metal.

## Capacidades

- Reordenación de documentos (reranking): puntúa pares consulta-documento y devuelve índices y scores ordenados de mayor a menor relevancia.
- Recuperación de información multilingüe: ruso, inglés, chino y otros idiomas declarados como multilingües.
- Integración en pipelines RAG: pensado para la segunda etapa de recuperación, tras un retriever inicial.
- Servido vía API compatible: endpoint `/v1/rerank` en llama-server, con parámetros `model`, `query`, `documents` y `top_n`.
- Ejecución local: funciona en CPU y en GPU vía Metal (Apple Silicon) con llama.cpp; también en node-llama-cpp.
- Integración con herramientas: QMD 2.9.0 y Open WebUI 0.13.4 probados por el autor.
- No soporta generación de texto, tool calling, agentes ni visión: es exclusivamente un modelo de ranking.

## Casos de uso

- RAG sobre documentación técnica multilingüe: tras una búsqueda vectorial inicial, el modelo reordena los fragmentos recuperados por relevancia real a la consulta, mejorando la precisión del contexto que se pasa al LLM generador. Su tamaño de 0.6B permite ejecutarlo en la misma máquina que el generador sin competir por VRAM.
- Atención al cliente con base de conocimiento en ruso: el ejemplo de la model card (consulta «Как отключить автопродление подписки?») muestra cómo distingue un pasaje sobre suscripciones (score 0.943) de uno sobre contraseñas (0.0005), lo que permite descartar documentos irrelevantes antes de la generación.
- Búsqueda empresarial en Open WebUI: el autor documenta la integración con Open WebUI 0.13.4, de modo que el reranker se sitúa delante del modelo de chat para mejorar la calidad de las respuestas sobre documentos internos.
- Indexación y búsqueda local con QMD: probado en QMD 2.9.0 sobre Metal, adecuado para bases de conocimiento personales o de equipo en Apple Silicon sin depender de servicios en la nube.
- Filtrado de candidatos en pipelines de CI/CD de documentación: al ser Apache 2.0 y ejecutable en CPU, puede incorporarse a procesos automatizados que validen la relevancia de fragmentos de documentación antes de publicarlos o indexarlos.
- Sistemas de recuperación en entornos con requisitos de privacidad: al ejecutarse íntegramente en local (llama-server, node-llama-cpp), los documentos no salen de la infraestructura propia, lo que encaja en sectores regulados.
- Evaluación comparativa de retrievers: como reranker ligero, sirve para medir la calidad de distintas estrategias de recuperación inicial sin el coste de un modelo grande.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el piloto RuBQ Horizon (150 consultas, 3.656 pares, split test, revisión `f2eac2f1f82445938af650c2a285a34dd77a16eb`). No están verificados de forma independiente (`verified: false`).

| Modelo / cuantización | nDCG@10 | MRR@10 |
|---|---|---|
| Yuanbao-Reranker-0.6B Q8_0 | 0.8479845659664136 | 0.8407777777777777 |
| Yuanbao-Reranker-0.6B Q4_K_M | 0.8487614236632546 | 0.8390740740740741 |
| Yuanbao-Reranker-0.6B F16 | 0.8475904943681829 | 0.8407777777777777 |

Datos adicionales reportados en la model card: en las 150 consultas rusas de RuBQ, Yuanbao Q8_0 colocó un pasaje relevante en primera posición en 113 casos, frente a 102 de Qwen3-Reranker-0.6B Q8_0; nDCG@10 de 0.848 frente a 0.812. En latencia, sobre Apple M4 Pro, la petición de ejemplo devolvió el pasaje correcto en primera posición con score 0.94275 y el incorrecto con 0.00046. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de un modelo de ranking y no de generación.

## Requisitos de hardware

- VRAM estimada para inferencia: Q8_0 ~0.64 GB de pesos; Q4_K_M ~0.40 GB; F16 ~1.20 GB. El consumo real añade overhead de contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre es suficiente; el autor validó Apple Silicon (Metal) en un M4 Pro. Para servidores, A100, H100 o RTX 4090 están sobredimensionadas para este modelo, pero funcionan.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y en Apple Silicon (M1 en adelante).
- CPU: el autor documenta ejecución solo-CPU con flags específicos en la guía de Open WebUI; con 0.6B parámetros es viable en CPU moderna.
- Opciones de despliegue: llama.cpp (`llama-server --reranking`), node-llama-cpp, QMD 2.9.0, Open WebUI 0.13.4. No se menciona soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: no se publican cifras agregadas de throughput; solo el ejemplo puntual en M4 Pro. El tamaño reducido sugiere latencias de milisegundos por lote pequeño, pero no hay medición formal disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@10 (RuBQ piloto) | Licencia | Formato |
|---|---|---|---|---|---|
| Yuanbao-Reranker-0.6B Q8_0 | 595.778.560 | no disponible | 0.848 | Apache 2.0 | GGUF |
| Qwen3-Reranker-0.6B Q8_0 | ~0.6B | no disponible | 0.812 | no disponible en la información | GGUF |
| Yuanbao-Reranker-0.6B F16 | 595.778.560 | no disponible | 0.8476 | Apache 2.0 | GGUF |

La comparación con Qwen3-Reranker-0.6B procede de la propia model card del autor (mismo conjunto de 150 consultas RuBQ, misma cuantización Q8_0). No se dispone de datos de otros rerankers (BGE, Jina, Cohere) en la información proporcionada, por lo que no se incluyen.

## Limitaciones y advertencias

- Modelo exclusivamente de ranking: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso. Usarlo fuera de esa función produce resultados sin sentido.
- Benchmarks no verificados: los resultados de RuBQ son un piloto de 150 consultas declarado por el autor con `verified: false`; no equivalen a una evaluación MTEB completa.
- Dependencia del idioma: el rendimiento está validado principalmente en ruso (RuBQ); el soporte de inglés, chino y otros idiomas es declarado pero no cuantificado en la información disponible.
- Diferencias por cuantización: Q4_K_M cambió el pasaje top en 10 de 150 consultas respecto a Q8_0, y no fue probado en QMD ni Open WebUI. Para producción se recomienda Q8_0.
- Riesgo de sesgo y alucinación: no hay documentación sobre sesgos del modelo base ni sobre calibración de scores; los valores de relevancia no deben interpretarse como probabilidades calibradas.
- Longitud de contexto no disponible: se desconoce el máximo de tokens por par consulta-documento, lo que limita el diseño de pipelines con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base (Yuanbao-Search/Yuanbao-Reranker-0.6B) y del paper de Tencent por si añaden restricciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción comunitaria ni de mantenimiento a largo plazo por parte del autor de la cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ai-babai/Yuanbao-Reranker-0.6B-GGUF
- Modelo base: https://huggingface.co/Yuanbao-Search/Yuanbao-Reranker-0.6B
- Paper de Tencent: https://arxiv.org/abs/2611.10405
- Resultados RuBQ: https://huggingface.co/ai-babai/Yuanbao-Reranker-0.6B-GGUF/blob/v0.1.1/results/rubq-pilot.md
- Guía QMD: https://huggingface.co/ai-babai/Yuanbao-Reranker-0.6B-GGUF/blob/main/docs/qmd.md
- Guía Open WebUI: https://huggingface.co/ai-babai/Yuanbao-Reranker-0.6B-GGUF/blob/main/docs/open-webui.md
- Documentación de conversión: https://huggingface.co/ai-babai/Yuanbao-Reranker-0.6B-GGUF/blob/main/docs/conversion.md
- Guía para agentes: https://huggingface.co/ai-babai/Yuanbao-Reranker-0.6B-GGUF/blob/main/AGENTS.md
- Repositorio GitHub: https://github.com/ai-babai/yuanbao-reranker-gguf
- Model card en ruso: https://huggingface.co/ai-babai/Yuanbao-Reranker-0.6B-GGUF/blob/main/README.ru.md
