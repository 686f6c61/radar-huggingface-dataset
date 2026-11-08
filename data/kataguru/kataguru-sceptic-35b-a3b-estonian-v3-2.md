# kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2

## Resumen

Kataguru-Sceptic-35B-A3B-Estonian-v3.2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) especializado en estonio, desarrollado por kataguru como parte de su colección de ediciones soberanas de idiomas (la cola "254 + 2 MoE"). Se construye sobre la base multipropósito Kataguru-Sceptic-35B-A3B-v3.1, un modelo de 35B parámetros totales con 3B parámetros activos por token, y añade dos expertos especializados en estonio a cada una de las 40 capas MoE, manteniendo congelados los 254 expertos originales.

El modelo aborda el problema clásico del entrenamiento continuado (CPT) en lenguas de bajos recursos: en lugar de sobrescribir todos los parámetros y degradar las capacidades matemáticas, científicas y de código del modelo base, la arquitectura 254+2 preserva intactos los expertos de razonamiento y añade dos expertos dedicados: uno para gramática y terminología técnica estonia (14 casos gramaticales, alternancia de grados consonánticos y vocálicos, morfología aglutinante finoúgrica) y otro para literatura y traducción bidireccional EN<->ET.

Es relevante porque propone una vía de especialización lingüística sin catástrofe de olvido, con una ventana de contexto de 262K tokens, capacidades multimodales (visión) y un encoder de visión de 27 capas. El modelo se encuentra en cola de entrenamiento: los pesos aún no están publicados y la fecha estimada de publicación es inferior a un mes desde la creación del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 40 capas MoE, 254+2 expertos por capa |
| Parámetros totales | 35B (aproximado, según denominación del modelo) |
| Parámetros activos | 3B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantización | NVFP4-W4ATTN-AWQ Hybrid, AWQ W4A16, GGUF APEX-Trio (Small/Medium/Good) + mmproj-f16 |
| Idiomas soportados | en, et, fi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (previsto), AWQ, GGUF, NVFP4 (previsto) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 40 capas de mezcla de expertos. Cada capa contiene 256 expertos: los expertos #0 a #253 son el núcleo Sceptic congelado al 100% (razonamiento científico, código competitivo, tool calling agéntico y honestidad epistémica), y los expertos #254 y #255 son nuevos especialistas en estonio. El experto #254 cubre gramática estonia (14 casos, alternancia de tres grados, morfología aglutinante finoúgrica) y terminología técnica (ingeniería, PLC/CNC, medicina clínica, patentes). El experto #255 cubre prosa literaria de página completa, no ficción moderna, diálogo natural y traducción fiel EN<->ET.

El entrenamiento emplea una calibración de router contrastiva que limita la fuga de enrutamiento hacia el idioma no objetivo a menos del 0,50%. Se preservan intactos el encoder de visión de 27 capas (333 tensores) y la cabeza especulativa MTP de la capa 40 (785 tensores), lo que habilita decodificación especulativa. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de la mención a una certificación de spot-check del dataset completo previa a la publicación.

## Capacidades

- Generación de texto en inglés, estonio y finés.
- Razonamiento científico de nivel doctorado (GPQA Diamond 69,70%).
- Programación competitiva y síntesis algorítmica (LiveCodeBench v6 pass@1 37,71%).
- Tool calling nativo con generación de AST `<tool_call>` y detección de irrelevancia (BFCL V4 AST 83,61%).
- Capacidades multimodales de visión mediante encoder de 27 capas.
- Traducción bidireccional EN<->ET en modo dedicado `/translate`, con preservación de párrafos y ausencia de charla adicional.
- Control de profundidad de razonamiento mediante etiquetas: `{REASON:spoon}` (auditoría científica de 7 pasos), `{REASON:einstein}` (síntesis de 10 ángulos), `{REASON:low}` y `{REASON:none}`.
- Selección de idioma de respuesta mediante etiqueta `/et` o `chat_template_kwargs={"response_language": "et"}`.
- Decodificación especulativa mediante cabeza MTP.

## Casos de uso

- Traducción literaria y técnica EN<->ET: el modo `/translate` permite traducir páginas completas preservando párrafos y sin texto conversacional adicional, adecuado para editoriales y documentación técnica.
- Atención al cliente en estonio: con 262K tokens de contexto puede gestionar conversaciones multi-turno extensas y documentación de producto en estonio sin perder el hilo.
- Generación de código en pipelines de CI/CD: el soporte nativo de tool calling y su rendimiento en LiveCodeBench permiten integrarlo en flujos de revisión y generación de parches.
- Razonamiento científico y documentación médica: el experto #254 incluye terminología clínica y de patentes, útil para resúmenes de literatura científica en estonio.
- Procesamiento de documentos con visión: el encoder multimodal permite extraer información de imágenes y documentos escaneados combinándolo con generación de texto en estonio.
- Agentes multi-paso con herramientas: BFCL V4 AST de 83,61% lo habilita para orquestación de agentes que invocan APIs y funciones.
- Localización de software al estonio y finés: la morfología aglutinante y los 14 casos gramaticales del experto #254 facilitan traducciones gramaticalmente correctas de cadenas de interfaz.

## Benchmarks y rendimiento

Los benchmarks publicados corresponden al núcleo base Sceptic 35B-A3B, heredados intactos según el autor. No se han publicado resultados de la suite de evaluación específica en estonio (tartuNLP/ifeval_et, tartuNLP/winogrande_et, EstCOPA, TalTechNLP/exam_et), que está pendiente de ejecución final.

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks | 70,05% | Batería de producción completa con CUDAGraphs |
| GPQA Diamond | 69,70% (138/198) | STEM de nivel doctorado |
| BFCL V4 Single-Turn AST | 83,61% (Live AST 79,13%) | Tool calling |
| LiveCodeBench v6 (pass@1) | 37,71% (66/175) | Programación competitiva |
| IFEval Strict (prompt/instrucción) | 70,24% / 77,70% | Formato determinista y restricciones |

## Requisitos de hardware

- GGUF APEX-Medium: ejecutable en una única GPU de 16 GB o en Mac.
- NVFP4-W4ATTN-AWQ Hybrid: 20,3 GB, nativo en Blackwell RTX 5090; requiere 1 GPU de 24-32 GB o 2x RTX 5090 con TP=2.
- AWQ W4A16: universal para vLLM, requiere 1 GPU de 24-32 GB.
- Despliegue: vLLM (recomendado para AWQ y NVFP4), llama.cpp/LM Studio (para GGUF), con soporte de decodificación especulativa mediante la cabeza MTP.
- Los benchmarks del núcleo se midieron en 2x RTX 5090 con TP=2 y CUDAGraphs activado.
- No se dispone de datos de latencia ni throughput específicos en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor referencia su propia familia (Kataguru-Sceptic-35B-A3B-Georgian-v3.2 y Kataguru-Sceptic-35B-A3B-v2.6-GGUF) como variantes de la misma arquitectura 254+2, pero no se ofrecen comparativas con modelos de otros desarrolladores.

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Estonian-v3.2 | 35B (3B activos) | 262K | Apache 2.0 | En cola de entrenamiento |
| Kataguru-Sceptic-35B-A3B-Georgian-v3.2 | 35B (3B activos) | 262K | Apache 2.0 | Variante georgiana |
| Kataguru-Sceptic-35B-A3B-v2.6-GGUF | 35B (3B activos) | no disponible | Apache 2.0 | Pesos GGUF publicados |

## Limitaciones y advertencias

- Estado de prepublicación: los pesos no están subidos al repositorio; la publicación está estimada en menos de un mes desde la creación del repositorio (2026-11-08). No es utilizable en producción todavía.
- La evaluación específica en estonio está pendiente de ejecución, por lo que el rendimiento real en tareas estonias no está verificado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas más allá de las etiquetas de razonamiento.
- La fuga de enrutamiento hacia idiomas no objetivo está limitada a menos del 0,50%, pero no es cero.
- El soporte multilingüe se limita a en, et y fi; no se garantiza calidad en otros idiomas.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo aún no está disponible para su descarga.
- Los requisitos de hardware para NVFP4 son específicos de GPU Blackwell (RTX 5090); otras GPU requieren las variantes AWQ o GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Variante georgiana: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2
- Repositorio GGUF v2.6: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF
