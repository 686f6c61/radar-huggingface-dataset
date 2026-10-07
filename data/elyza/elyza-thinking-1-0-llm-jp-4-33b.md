# elyza/ELYZA-Thinking-1.0-llm-jp-4-33b

## Resumen

ELYZA-Thinking-1.0-llm-jp-4-33b es un modelo de razonamiento (reasoning) desarrollado por ELYZA, Inc. a partir del modelo base llm-jp/llm-jp-4-33b-base, preentrenado desde cero en Japón por LLM-jp. ELYZA realizó sobre él un mid-training y un post-training orientados a comprensión y generación de texto en japonés e inglés, con especial énfasis en razonamiento, seguimiento de instrucciones y recuperación de conocimiento específicamente japonés.

Se trata de un modelo denso de 33.219.548.160 parámetros (33,2 B) con arquitectura de tipo Llama (etiqueta `llama` en HuggingFace) y pipeline de text-generation. El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors, y está etiquetado como compatible con tool-calling, conversational, reasoning y text-generation-inference.

Su relevancia actual radica en dos factores: por un lado, es un modelo de razonamiento de tamaño medio (33 B) que compite en benchmarks con alternativas como Qwen3-32B, OLMo 3.1 32B Think o Gemma 4 31B; por otro, cubre el hueco de modelos de razonamiento con alto rendimiento en japonés, un idioma con menos cobertura en el ecosistema de modelos abiertos. La longitud de contexto, los tipos de cuantización publicados y los detalles completos de entrenamiento no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (etiqueta `llama`); modelo base llm-jp/llm-jp-4-33b-base |
| Parametros totales | 33.219.548.160 (33,2 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados sin cuantizar) |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 66,5 GB |
| Modelo base | llm-jp/llm-jp-4-33b-base |
| Pipeline | text-generation |
| Descargas / likes | 544 / 10 |
| Fecha de creacion / actualizacion | 2026-10-02 / 2026-10-02 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 33,2 B de parámetros, etiquetado como `llama` y construido sobre llm-jp-4-33b-base, un modelo preentrenado íntegramente en Japón por LLM-jp. Sobre esa base, ELYZA aplicó un mid-training y un post-training propios. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni la secuencia de técnicas de alineación (RLHF, DPO u otras).

Las innovaciones declaradas por el autor se centran en tres ejes. Primero, la localización al japonés de datos de razonamiento de alta calidad en matemáticas, programación y disciplinas STEM. Segundo, la construcción de datos de seguimiento de instrucciones en japonés con múltiples restricciones verificables, lo que refuerza el cumplimiento de formatos y condiciones explícitas. Tercero, la síntesis de datos de conocimiento a partir de Wikipedia y Wikidata en japonés, con el objetivo de mejorar el recuerdo y la comprensión de conocimiento específicamente japonés. El modelo se presenta como un modelo de razonamiento (Thinking), lo que implica generación de cadenas de pensamiento antes de la respuesta final.

## Capacidades

- Generación de texto conversacional en japonés e inglés, con soporte multi-turno (etiqueta `conversational`).
- Razonamiento explícito: el modelo está entrenado como modelo de razonamiento (Thinking), con cadenas de pensamiento previas a la respuesta.
- Razonamiento matemático y STEM, reforzado mediante datos de matemáticas, programación y STEM localizados al japonés.
- Generación y razonamiento sobre código, con datos de programación localizados al japonés.
- Tool calling / function calling: soportado según las etiquetas del modelo (`tool-calling`).
- Seguimiento de instrucciones con restricciones verificables múltiples, entrenado explícitamente para ello.
- Recuerdo de conocimiento japonés: entrenamiento específico sobre conocimiento sintetizado de Wikipedia y Wikidata en japonés.
- Capacidades multilingües limitadas a ja y en; no se declara soporte para español ni otros idiomas.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Atención al cliente automatizada en japonés: el modelo puede gestionar conversaciones multi-turno con instrucciones de formato estrictas gracias a su entrenamiento con restricciones verificables, y su foco en conocimiento japonés reduce errores en consultas sobre productos, normativa y terminología local.
- Generación de código en pipelines de CI/CD: con soporte de tool calling, puede integrarse como agente que invoca herramientas de build, análisis estático o consulta de repositorios, y producir parches en japonés o inglés.
- Tutoría de matemáticas y STEM en japonés: su entrenamiento sobre datos de matemáticas y STEM localizados al japonés lo hace adecuado para explicar paso a paso ejercicios de secundaria y universidad en ese idioma.
- Asistente de conocimiento corporativo sobre Japón: útil para RAG sobre documentación interna japonesa, aprovechando el entrenamiento con datos sintetizados de Wikipedia y Wikidata en japonés para mejorar la recuperación de entidades, fechas y relaciones.
- Agentes multi-paso con function calling: encadenamiento de llamadas a APIs (búsqueda, cálculo, consulta de bases de datos) en flujos de razonamiento extendido, donde el modelo planifica y ejecuta pasos intermedios.
- Traducción y localización ja-en: traducción asistida de documentación técnica, contratos o material de marketing entre japonés e inglés, con revisión humana posterior.
- Extracción estructurada de información: generación de salidas con formato fijo (JSON, tablas) a partir de texto japonés, apoyándose en el entrenamiento con restricciones verificables.
- Evaluación comparativa de modelos de razonamiento en japonés: como referencia abierta de 33 B para investigación en razonamiento multilingüe.

## Benchmarks y rendimiento

Resultados por benchmark publicados en la model card para modelos densos. La información disponible solo incluye las filas de MMLU-Pro (en) y JMMLU (ja); el resto de la tabla fue truncado y no está disponible.

| Benchmark | ELYZA-Thinking-1.0-llm-jp-4-33b | llm-jp-4-33b-thinking | llm-jp-4.1-33b-thinking | OLMo 3.1 32B Think | Qwen3-32B | Qwen3.5-27B | Gemma 4 31B |
|---|---|---|---|---|---|---|---|
| MMLU-Pro (en) | 77,53 | 75,74 | 78,82 | 75,23 | 78,75 | 85,42 | 85,50 |
| JMMLU (ja) | 84,69 | 85,22 | 85,49 | 77,59 | 86,09 | 90,11 | 90,17 |

La model card indica además que los benchmarks se agregan primero en 7 grupos de capacidades y después entre grupos, con resultados separados para japonés e inglés y gráficas distintas para modelos MoE y densos. Los valores numéricos de esa agregación no están disponibles en la información proporcionada. Existe una ficha separada con los resultados de los modelos MoE en elyza/ELYZA-Thinking-1.0-llm-jp-4-32b-a3b.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del número de parámetros (33,2 B); no proceden de la documentación del autor.

- Inferencia en bf16/fp16: aproximadamente 66 GB solo para pesos, más caché KV. Requiere 1x H100 80 GB (con margen ajustado y lotes pequeños) o 2x A100 80 GB.
- Inferencia en int8: aproximadamente 33 GB para pesos. Cabe en 1x A100 80 GB, 1x H100 80 GB o 1x RTX 6000 Ada 48 GB; en 1x A100 40 GB queda al límite y exige cuantización más agresiva.
- Inferencia en 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 17-19 GB para pesos. Cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), con contexto y lote moderados.
- GPU recomendadas por escenario: H100 80 GB o A100 80 GB para servicio en bf16; A100 80 GB o L40S 48 GB para int8; RTX 4090 / RTX 3090 para cuantización de 4 bits en local.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del modelo), endpoints compatibles; vLLM y SGLang son alternativas habituales para servir safetensors, y llama.cpp / Ollama requieren convertir previamente los pesos a GGUF.
- Latencia y throughput: no disponible. Al ser un modelo de razonamiento que emite cadenas de pensamiento, el número de tokens generados por respuesta será mayor que en un modelo instruct convencional, con el consiguiente coste en latencia y en memoria de caché KV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (MMLU-Pro en / JMMLU ja) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELYZA-Thinking-1.0-llm-jp-4-33b | 33,2 B (denso) | no disponible | 77,53 / 84,69 | Apache 2.0 | HuggingFace (elyza) |
| llm-jp-4-33b-thinking | no disponible | no disponible | 75,74 / 85,22 | no disponible | no disponible |
| llm-jp-4.1-33b-thinking | no disponible | no disponible | 78,82 / 85,49 | no disponible | no disponible |
| OLMo 3.1 32B Think | no disponible (32 B nominal) | no disponible | 75,23 / 77,59 | no disponible | no disponible |
| Qwen3-32B | no disponible (32 B nominal) | no disponible | 78,75 / 86,09 | no disponible | no disponible |
| Qwen3.5-27B | no disponible (27 B nominal) | no disponible | 85,42 / 90,11 | no disponible | no disponible |
| Gemma 4 31B | no disponible (31 B nominal) | no disponible | 85,50 / 90,17 | no disponible | no disponible |

Los datos de parámetros y contexto de los modelos comparados no están disponibles en la información proporcionada; solo se dispone de sus puntuaciones en los dos benchmarks listados.

## Limitaciones y advertencias

- Cobertura de idiomas restringida a japonés e inglés. No se declara soporte de español, por lo que su uso en castellano produciría resultados no validados por el autor.
- Riesgo de alucinación inherente a los modelos de razonamiento generativos, especialmente en consultas factuales sobre conocimiento no japonés, donde el entrenamiento específico de conocimiento se centró en Wikipedia y Wikidata en japonés.
- Sesgos potenciales derivados de los datos sintetizados de Wikipedia y Wikidata: la cobertura de esas fuentes introduce sesgos de notabilidad, actualidad y perspectiva cultural japonesa.
- Longitud de contexto no documentada en la información disponible; no es posible planificar despliegues con ventanas largas ni evaluar el coste de la caché KV sin ese dato.
- Los modelos de razonamiento generan cadenas de pensamiento extensas: mayor latencia, mayor coste de inferencia y riesgo de fuga de razonamiento interno en la salida si no se filtra.
- Licencia Apache 2.0: permite uso comercial y modificación con las obligaciones habituales de conservación de avisos de copyright y licencia; no incluye cláusulas de uso aceptable específicas, por lo que las restricciones de uso quedan a criterio del desplegador.
- Los benchmarks publicados son de la model card del autor, sin metodología de evaluación detallada en la información proporcionada, y la tabla está truncada; no se pueden verificar los resultados de forma independiente con los datos disponibles.
- No se declaran capacidades multimodales, por lo que no debe usarse para tareas de visión o audio.
- La información de entrenamiento (tokens, composición del dataset, técnicas de alineación) no está disponible, lo que dificulta la reproducibilidad y la evaluación de riesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elyza/ELYZA-Thinking-1.0-llm-jp-4-33b
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-33b-base
- Modelo MoE relacionado (resultados de benchmarks MoE): https://huggingface.co/elyza/ELYZA-Thinking-1.0-llm-jp-4-32b-a3b
- Referencia a llm-jp-4 citada en la model card: https://huggingface.co/llm-jp/llm-jp-4-32b-a3b-base
- Sitio del autor (ELYZA, Inc.): https://elyza.ai/
- Imagen clave de la model card: assets/image.png (dentro del repositorio)
- Papers, blogs, repositorios y demos adicionales: no disponible en la información proporcionada.
