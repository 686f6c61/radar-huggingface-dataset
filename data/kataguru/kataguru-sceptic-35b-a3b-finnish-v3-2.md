# kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2

## Resumen

Kataguru-Sceptic-35B-A3B-Finnish-v3.2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) especializado en finés (suomi) y en traducción bidireccional inglés-finés, desarrollado por el usuario kataguru dentro de su línea de "ediciones soberanas" de idiomas. Se construye sobre la base multipropósito Kataguru-Sceptic-35B-A3B-v3.1, un modelo de 35B parámetros totales y 3B parámetros activos por token, con capacidades declaradas de razonamiento científico, código, tool calling y visión. La innovación central es que en lugar de un ajuste fino convencional (CPT) que sobrescribe todos los parámetros, congela los 254 expertos originales e incorpora dos expertos nuevos dedicados al finés en cada una de las 40 capas MoE, pasando de 254 a 256 expertos por capa.

El modelo se presenta como una ranura de prepublicación: en la fecha de creación del repositorio (8 de noviembre de 2026) los pesos aún no estaban subidos y la model card indica una ETA de publicación inferior a siete días, con formatos de cuantización NVFP4-W4ATTN-AWQ, AWQ W4A16 y GGUF APEX-Trio previstos. La arquitectura declarada mantiene la ventana de contexto de 262K tokens, el codificador de visión de 27 capas y la cabeza de decodificación especulativa MTP (multi-token prediction) de la base.

Es relevante porque propone una estrategia de especialización lingüística que preserva las capacidades del modelo base (el autor afirma 0,00 % de olvido catastrófico en los expertos congelados) y porque apunta a un nicho poco cubierto: el finés técnico y literario con morfología compleja (15 casos gramaticales, alternancia consonántica, armonía vocálica y clases de declinación Kotus 1-51).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 40 capas MoE, encoder de visión de 27 capas, cabeza MTP de decodificación especulativa en la capa 40 |
| Parametros totales | 35B (aproximado, según nomenclatura del modelo) |
| Parametros activos | 3B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | NVFP4-W4ATTN-AWQ Hybrid (20,3 GB), AWQ W4A16, GGUF APEX-Trio (APEX-Small, APEX-Medium, APEX-Good) con mmproj-f16 y mtp |
| Idiomas soportados | Finés (fi) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (previsto), AWQ, GGUF (previsto); pesos aún no publicados |

## Arquitectura y entrenamiento

El modelo parte de Kataguru-Sceptic-35B-A3B-v3.1, un MoE con 254 expertos por capa y 3B parámetros activos por token. La modificación de esta edición finlandesa consiste en expandir cada una de las 40 capas MoE de 254 a 256 expertos: los expertos #0 a #253 permanecen congelados al 100 %, y se añaden dos expertos especialistas. El experto #254 se orienta a gramática finlandesa y terminología técnica (15 casos gramaticales, astevaihtelu o alternancia consonántica, armonía vocálica, clases de declinación Kotus 1-51, ingeniería, PLC/CNC, medicina clínica y patentes). El experto #255 se dedica a prosa literaria, no ficción, diálogo natural y traducción fiel EN <-> FI.

El entrenamiento incorpora una calibración contrastiva del router para limitar la fuga de enrutamiento hacia el idioma no objetivo a menos de 0,50 %. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, limitándose a mencionar una "certificación de spot-check del dataset completo" pendiente. Se conservan sin cambios el encoder de visión de 27 capas (333 tensores) y la cabeza MTP de decodificación especulativa (785 tensores). No se especifica si hubo RLHF o DPO en esta edición; la base se describe como orientada a "honestidad epistémica".

## Capacidades

- Generación de texto en finés e inglés con etiquetas de control de idioma (`/fi` o `chat_template_kwargs={"response_language": "fi"}`).
- Traducción bidireccional inglés-finés en modo dedicado (`/translate`), con preservación de párrafos y sin charla adicional.
- Razonamiento científico de nivel doctorado (GPQA Diamond declarado en 69,70 % en la base).
- Tool calling nativo con generación de AST `<tool_call>` y detección de irrelevancia (BFCL V4 AST 83,61 % en la base).
- Razonamiento multi-paso con control de profundidad: `{REASON:spoon}` (auditoría científica de 7 pasos), `{REASON:einstein}` (síntesis de 10 ángulos), `{REASON:low}` y `{REASON:none}`.
- Capacidades de visión heredadas del encoder de 27 capas del modelo base.
- Generación de código y programación competitiva (LiveCodeBench v6 Pass@1 de 37,71 % en la base).
- Seguimiento estricto de instrucciones y formato (IFEval Strict 70,24 % prompt / 77,70 % instrucción en la base).
- Decodificación especulativa mediante cabeza MTP para acelerar la inferencia.

## Casos de uso

- Traducción literaria de página completa EN <-> FI: el modo `/translate` y el experto #255 están diseñados para preservar estructura de párrafos y registro en prosa literaria y no ficción, un nicho donde los modelos multilingües genéricos suelen perder matices morfológicos.
- Documentación técnica y patentes en finés: el experto #254 cubre terminología de ingeniería, PLC/CNC, medicina clínica y patentes, lo que permite traducir y redactar documentación regulatoria con vocabulario especializado.
- Atención al cliente en finés: la ventana de 262K tokens permite conversaciones multi-turno con historial extenso y documentos adjuntos, con respuestas nativas mediante la etiqueta `/fi`.
- Agentes con tool calling: el soporte nativo de `<tool_call>` y el rendimiento BFCL V4 de la base (83,61 % AST) lo hacen apto para pipelines de agentes que consulten APIs o bases de datos en entornos finlandeses.
- Análisis de documentos con visión: el encoder de 27 capas permite procesar capturas, formularios escaneados o diagramas técnicos junto con texto en finés.
- Razonamiento científico y auditoría de afirmaciones: los modos `{REASON:spoon}` y `{REASON:einstein}` permiten generar respuestas con trazabilidad de pasos para revisión técnica o científica.
- Generación de código en producción: la base conserva LiveCodeBench v6 de 37,71 % y puede integrarse en pipelines de CI/CD para tareas de síntesis y revisión de código, aunque el foco de esta edición es el finés.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base Kataguru-Sceptic-35B-A3B, medidos según el autor en 2x RTX 5090 con TP=2 y CUDAGraphs habilitados. No se han publicado resultados específicos de la edición finlandesa; la suite de evaluación en finés (FIN-bench, IFEval-FI, Kotus Morphology-51, traducción literaria y técnica) está pendiente.

| Benchmark | Resultado (base Sceptic 35B-A3B) |
|---|---|
| Media de 15 benchmarks | 70,05 % |
| GPQA Diamond | 69,70 % (138/198) |
| BFCL V4 Single-Turn AST | 83,61 % (Live AST 79,13 %) |
| LiveCodeBench v6 Pass@1 | 37,71 % (66/175) |
| IFEval Strict (prompt / instrucción) | 70,24 % / 77,70 % |
| Suite finlandesa | Pendiente de ejecución final |

## Requisitos de hardware

- GGUF APEX-Medium: cabe en una GPU o Mac con 16 GB de memoria, según la model card.
- NVFP4-W4ATTN-AWQ Hybrid (20,3 GB): pensado para GPUs Blackwell, con soporte nativo en RTX 5090.
- AWQ W4A16 y NVFP4: requieren 1 GPU de 24-32 GB o 2x RTX 5090 con tensor parallelism (TP=2).
- Los benchmarks del autor se midieron en 2x RTX 5090 con TP=2.
- Opciones de despliegue previstas: vLLM (AWQ, NVFP4), llama.cpp/Ollama (GGUF APEX-Trio con mmproj-f16 y mtp).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (MoE especializado en finés) en la documentación proporcionada. Como referencia de la línea del mismo autor:

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Finnish-v3.2 | 35B totales / 3B activos | 262K | Apache 2.0 | Prepublicación, pesos no subidos |
| Kataguru-Sceptic-35B-A3B-v3.1 | 35B totales / 3B activos | 262K | Apache 2.0 | Base; variante GGUF disponible |
| Kataguru-Sceptic-35B-A3B-v2.6 | 35B totales / 3B activos | No disponible | Apache 2.0 | GGUF disponible |

## Limitaciones y advertencias

- Repositorio en prepublicación: los pesos no están subidos y la fecha de publicación es una estimación del autor (menos de siete días o menos de un mes según el apartado).
- Los benchmarks citados corresponden al modelo base, no a la edición finlandesa; el rendimiento real en finés está pendiente de verificación.
- La evaluación en finés (FIN-bench, IFEval-FI, morfología Kotus, traducción) no se ha ejecutado aún en el momento de la ficha.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas específicas.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas limitados a inglés y finés; el rendimiento en otros idiomas no está garantizado.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la model card no detalla restricciones adicionales sobre los datos de entrenamiento ni sobre el uso de las salidas en dominios regulados.
- La ventana de 262K tokens puede degradar la calidad en los extremos si no se gestiona adecuadamente; no se aportan datos de rendimiento por longitud.
- El autor declara fuga de enrutamiento hacia el idioma no objetivo inferior al 0,50 %, pero no se ofrece una medición independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Variante GGUF de la base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-GGUF
- Variante GGUF v2.6: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF/tree/main
