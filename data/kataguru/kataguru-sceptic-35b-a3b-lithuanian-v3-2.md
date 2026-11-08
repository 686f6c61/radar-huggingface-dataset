# kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2

## Resumen

Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por kataguru, especializado en lituano (Lietuvių kalba) y construido sobre el modelo fundacional Kataguru-Sceptic-35B-A3B-v3.1. El modelo mantiene congelados los 254 expertos del núcleo original (razonamiento científico, código, tool calling y honestidad epistémica) y añade dos expertos específicos de lituano por cada una de las 40 capas MoE, alcanzando 256 expertos por capa. Con 35 mil millones de parámetros totales y 3 mil millones activos por token, se posiciona como una alternativa de "soberanía lingüística" para el lituano sin sacrificar las capacidades STEM y de agente del modelo base.

La propuesta técnica diferencial es evitar el olvido catastrófico típico del Continued Pre-Training (CPT): en lugar de sobrescribir todos los parámetros, el autor congela el núcleo y añade dos expertos especialistas (uno para gramática y terminología técnica, otro para literatura y traducción bidireccional EN<->LT) junto con una calibración de router contrastiva que limita la fuga de enrutamiento fuera del idioma objetivo a menos del 0,50 %. El modelo declara una ventana de contexto de 262K tokens, un codificador de visión de 27 capas y una cabeza de decodificación especulativa MTP en la capa 40.

Es relevante ahora porque ocupa una ranura de prelanzamiento en la cola "Sovereign Language Editions (254 + 2 MoE)" del autor: los pesos todavía no están subidos y la publicación se anuncia con un ETA inferior a un mes. La model card reporta métricas del núcleo heredado (media de 70,05 % en una batería de 15 benchmarks, GPQA Diamond 69,70 %, BFCL V4 AST 83,61 %, LiveCodeBench v6 37,71 %), si bien la evaluación específica en lituano está pendiente de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con 40 capas MoE, 256 expertos por capa (254 congelados + 2 lituanos), codificador de visión de 27 capas y cabeza MTP especulativa en capa 40 |
| Parametros totales | 35B (aproximado, según denominación del modelo) |
| Parametros activos | 3B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | NVFP4-W4ATTN-AWQ Hybrid (20,3 GB), AWQ W4A16, GGUF APEX-Trio (APEX-Small, APEX-Medium, APEX-Good) + mmproj-f16 + mtp |
| Idiomas soportados | Lituano (lt), inglés (en), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (previsto), NVFP4/AWQ (compressed-tensors), GGUF; pesos aún no publicados |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas de mezcla de expertos. La innovación central es la arquitectura "254 + 2": los expertos #0 a #253 del modelo base Kataguru-Sceptic-35B-A3B-v3.1 permanecen 100 % congelados, y cada capa se expande de 254 a 256 expertos añadiendo dos expertos especialistas en lituano. El experto #254 cubre gramática lituana (7 casos gramaticales o *linksniai*, flexión verbal y participial del báltico, declinación nominal compleja) y terminología técnica (ingeniería, PLC/CNC, medicina clínica, patentes). El experto #255 cubre prosa literaria de página completa, no ficción moderna, diálogo natural y traducción fiel EN<->LT. Se aplica además una calibración de router contrastiva para restringir la fuga de enrutamiento fuera del idioma objetivo a menos del 0,50 %.

El autor declara que no se modificaron el codificador de visión de 27 capas (333 tensores), la cabeza MTP de decodificación especulativa (785 tensores) ni la ventana de contexto de 262K. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO en esta edición. El modelo base se describe como un MoE multimodal bilingüe (inglés y finés) de 35B con 3B activos y 254 expertos enrutados por capa, cuantizado en ediciones previas a NVFP4 con escalas sincronizadas w13 (gate_proj + up_proj) en los 10.160 expertos enrutados.

## Capacidades

- Generación de texto en lituano, inglés y finés, con etiqueta de idioma `/lt` o parámetro `chat_template_kwargs={"response_language": "lt"}` para forzar respuestas nativas en lituano.
- Razonamiento científico y STEM de nivel graduado, heredado del núcleo congelado (GPQA Diamond 69,70 %).
- Generación de código y síntesis algorítmica (LiveCodeBench v6 37,71 % pass@1).
- Tool calling y function calling nativo con generación de AST `<tool_call>` y detección de irrelevancia (BFCL V4 AST 83,61 %).
- Capacidades multimodales de visión mediante codificador de 27 capas.
- Traducción bidireccional EN<->LT en modo dedicado `/translate`, con preservación de párrafos y sin cháchara conversacional.
- Control de profundidad de razonamiento mediante etiquetas: `{REASON:spoon}` (auditoría científica de 7 pasos), `{REASON:einstein}` (síntesis de 10 ángulos), `{REASON:low}` y `{REASON:none}`.
- Decodificación especulativa mediante cabeza MTP en la capa 40.
- Cumplimiento estricto de instrucciones y formato determinista (IFEval Strict 70,24 % prompt / 77,70 % instrucción).

## Casos de uso

- Traducción profesional EN<->LT de documentación técnica y literatura: el modo `/translate` genera traducción de página completa preservando párrafos, adecuado para editoriales, agencias de localización y administraciones públicas lituanas que necesitan fidelidad terminológica en dominios como patentes o medicina clínica.
- Atención al cliente en lituano: el experto #254 cubre declinación y casos gramaticales, lo que permite conversaciones multi-turno naturales con el contexto de 262K tokens para historiales largos de cliente.
- Generación de código en producción: el núcleo congelado conserva LiveCodeBench v6 al 37,71 % y soporte de tool calling, integrable en pipelines de CI/CD que requieran asistencia de código con respuestas también en lituano.
- Agentes automatizados con tool calling: BFCL V4 AST del 83,61 % permite construir agentes que invoquen APIs y funciones en flujos multi-paso, con detección de irrelevancia para evitar llamadas espurias.
- Análisis documental multimodal: el codificador de visión de 27 capas permite procesar documentos escaneados, gráficos o capturas y razonar sobre ellos en lituano o inglés.
- Investigación académica en lituano: razonamiento STEM de nivel graduado (GPQA Diamond 69,70 %) aplicable a tutoría, revisión de literatura científica y asistencia en laboratorio.
- Localización de software y UI: terminología técnica lituana específica (PLC/CNC, ingeniería) para cadenas de interfaz y manuales técnicos.

## Benchmarks y rendimiento

Los datos disponibles corresponden al núcleo heredado Kataguru-Sceptic-35B-A3B (medidos en 2x RTX 5090 con TP=2 y CUDAGraphs activados). La evaluación específica en lituano está pendiente de ejecución según la model card.

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks | 70,05 % | Batería de producción completa |
| GPQA Diamond | 69,70 % (138/198) | STEM de nivel doctorado |
| BFCL V4 Single-Turn AST | 83,61 % (Live AST 79,13 %) | Tool calling |
| LiveCodeBench v6 (Pass@1) | 37,71 % (66/175) | Programación competitiva |
| IFEval Strict (prompt) | 70,24 % | Formato determinista |
| IFEval Strict (instrucción) | 77,70 % | Restricciones de longitud y keywords |
| MMLU-LT, ARC-LT, GSM8K-LT, TruthfulQA-LT | Pendiente | Evaluación lituana no ejecutada aún |

## Requisitos de hardware

- GGUF APEX-Medium: cabe en una GPU o Mac con 16 GB de memoria.
- NVFP4-W4ATTN-AWQ Hybrid (20,3 GB): pensado para GPU Blackwell (RTX 5090 nativa) y despliegue en 1x 24–32 GB o 2x RTX 5090 con TP=2.
- AWQ W4A16: compatible con vLLM universal, orientado a GPUs de 24–32 GB.
- Opciones de despliegue: vLLM (soporte documentado para la familia GGUF del autor), llama.cpp y LM Studio para los formatos GGUF APEX-Trio; el formato NVFP4 requiere hardware Blackwell.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2 | 35B | 3B | 262K | Apache 2.0 | Pre-lanzamiento (pesos no publicados) |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35B | 3B | 262K | Apache 2.0 (según tags del modelo derivado) | Disponible |
| Kataguru-Sceptic-35B-A3B-v2.6-NVFP4 | 35B | 3B | no disponible | no disponible | Disponible |
| Alternativas lituanas de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo en cola de entrenamiento: los pesos no están publicados; el ETA declarado es inferior a un mes y está sujeto a certificación del dataset y evaluación en lituano.
- La evaluación específica en lituano (MMLU-LT, ARC-LT, GSM8K-LT, TruthfulQA-LT y traducción literaria/técnica) está pendiente, por lo que el rendimiento real en el idioma objetivo no está verificado.
- La fuga de enrutamiento fuera del idioma objetivo se declara por debajo del 0,50 %, pero no se aportan datos independientes que lo confirmen.
- No se especifican sesgos conocidos, composición del dataset de entrenamiento ni técnicas de alineación (RLHF/DPO) en la información disponible.
- Riesgo de alucinación inherente a modelos generativos; no se reportan métricas de TruthfulQA del núcleo en la información disponible.
- El soporte de idiomas se limita a lituano, inglés y finés; no se declaran otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de un prelanzamiento sin pesos publicados no es posible validar el comportamiento en producción.
- El formato NVFP4 requiere hardware NVIDIA Blackwell; en GPUs anteriores debe recurrirse a AWQ W4A16 o GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Edición NVFP4 previa: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-NVFP4
- GGUF de la familia: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF
- README GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF/blob/main/README.md
