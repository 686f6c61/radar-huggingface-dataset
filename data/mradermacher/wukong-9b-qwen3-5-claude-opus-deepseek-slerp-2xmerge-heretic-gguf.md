# mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF

## Resumen

Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic es un modelo de lenguaje de aproximadamente 9.200 millones de parametros (9.197.093.888 exactos segun los pesos en safetensors) construido mediante la fusion por SLERP de dos modelos derivados de la familia Qwen 3.5. El modelo original fue creado por el usuario xtools-at, y esta ficha corresponde a la version cuantizada en GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones estaticas y ponderadas para la comunidad de llama.cpp.

El modelo combina, segun sus etiquetas y datasets, trazas de razonamiento y agentes destiladas a partir de datos asociados a Claude Opus (versiones 4.6 y 4.7) y a DeepSeek, junto con trazas de agente de Hermes. La etiqueta "heretic" indica que se ha aplicado un proceso de "decensoring" para reducir los rechazos del modelo base, lo que lo orienta a usos donde se prefiere menor filtrado en las respuestas. Esta cuantizacion concreta esta pensada para ejecucion local en CPU y GPU de consumo mediante llama.cpp y derivados.

La relevancia de esta publicacion radica en su empaquetado: ofrece un abanico de cuantizaciones estaticas (desde Q2_K de 4,1 GB hasta f16 de 18,5 GB), incluyendo un suplemento multimodal (mmproj) que sugiere soporte de vision, y una version alternativa con cuantizacion ponderada/imatrix en otro repositorio. Todo ello bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5), fusion por SLERP de dos modelos; soporte multimodal via mmproj |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion SLERP (interpolacion esferica de pesos) de dos modelos derivados de Qwen 3.5, seguida de un proceso de "heretic" orientado a reducir el comportamiento de rechazo (decensoring). No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO en esta ficha; la model card solo lista los datasets empleados en las variantes destiladas: Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x y lambda/hermes-agent-reasoning-traces.

La presencia de un fichero mmproj en las cuantizaciones indica que el modelo base incorpora un proyector multimodal (vision). Las etiquetas del repositorio destacan capacidades de razonamiento, codigo, agente, tool-use, function-calling, matematicas, STEM y ciencia, ademas de "distilled", "uncensored" y "decensored". No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento (etiqueta "reasoning") y trazas de agente derivadas de datasets de razonamiento.
- Generacion y asistencia en codigo ("coding").
- Matematicas y tareas STEM/ciencia.
- Soporte de tool calling / function calling.
- Uso como agente y razonamiento multi-paso (etiquetas "agent", "tool-use").
- Capacidad multimodal de vision mediante el proyector mmproj incluido en las cuantizaciones.
- Multilingue: ingles, chino, espanol, ruso y japones.
- Comportamiento "uncensored/decensored" (menor tasa de rechazos).

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en editores o pipelines de CI/CD para autocompletado, revision de parches y generacion de tests, aprovechando sus capacidades de codigo y tool calling sobre hardware de consumo con cuantizaciones Q4_K_M (~5,9 GB).
- Agente con function calling: al soportar tool-use y razonamiento multi-paso, puede orquestar llamadas a APIs y herramientas en flujos de automatizacion, ejecutandose con llama.cpp u Ollama.
- Razonamiento matematico y STEM: util para resolver problemas paso a paso en entornos educativos o de investigacion donde se prefiera ejecucion local y privacidad.
- Procesamiento de documentos con vision: gracias al proyector mmproj, puede describir o extraer informacion de imagenes (capturas, diagramas) en tareas de documentacion tecnica.
- Atencion al cliente multilingue: cubre conversaciones en en, zh, es, ru y ja, adecuado para prototipos de soporte en varios idiomas sin depender de servicios en la nube.
- Experimentacion con modelos "decensored": util en investigacion sobre filtrado, seguridad y comportamiento de rechazo, comparando su respuesta frente a variantes censuradas.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (4,1 GB) y Q3_K_S (4,5 GB) permiten ejecucion en equipos modestos o CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~4,1 GB; Q3_K_S ~4,5 GB; Q4_K_S ~5,6 GB; Q4_K_M ~5,9 GB; Q5_K_M ~6,8 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB. Sumar ~0,7-1,0 GB si se usa el proyector multimodal.
- GPU recomendadas: para Q4_K_M y Q5_K_M basta una RTX 3060 de 12 GB o superior; para Q8_0, una RTX 4070/4080 de 12-16 GB; para f16, una RTX 4090 (24 GB) o GPU de datacenter (A100/H100) si se busca maxima calidad.
- Cabe en GPU de consumo: si, en tarjetas de 8-12 GB con cuantizaciones Q4/Q5; las variantes Q2/Q3 caben en 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros frontends compatibles con GGUF. La model card no menciona vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wukong-9B-Qwen3.5-...-heretic (este) | ~9,2 B | no disponible | Apache 2.0 | GGUF / safetensors | Fusion SLERP, decensored, multimodal |
| Qwen 3.5 base (familia) | ~9 B (segun variante) | no disponible | Apache 2.0 | safetensors / GGUF | Modelo origen de la fusion |
| Modelos destilados de trazas Claude/DeepSeek | no disponible | no disponible | no disponible | no disponible | Fuente de los datasets de razonamiento |

La comparacion cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser una fusion SLERP de modelos destilados, puede heredar sesgos y artefactos de los modelos de origen; no se documenta una evaluacion de sesgos.
- Riesgo de alucinacion inherente a modelos de ~9 B, especialmente en tareas de razonamiento largo o factuales.
- El proceso "heretic/decensored" reduce los rechazos, lo que puede aumentar la probabilidad de contenido inapropiado o no alineado; requiere filtros propios en produccion.
- La longitud de contexto no se especifica en la informacion disponible; conviene verificarla en el modelo base antes de disenar flujos con ventanas largas.
- Cobertura linguistica limitada a en, zh, es, ru y ja; el rendimiento en espanol no esta validado con benchmarks.
- Aunque la licencia es Apache 2.0, el uso comercial debe revisarse tambien respecto a las licencias de los modelos y datasets de origen.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente el rendimiento; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
