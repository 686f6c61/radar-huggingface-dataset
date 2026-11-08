# kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2

## Resumen

Kataguru-Sceptic-35B-A3B-Georgian-v3.2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) especializado en georgiano (ქართული ენა), desarrollado por kataguru como parte de su colección de ediciones soberanas de idiomas. Se construye sobre el modelo fundacional Kataguru-Sceptic-35B-A3B-v3.1, un MoE multimodal de 35 mil millones de parámetros totales y 3 mil millones activos por token, con capacidades de razonamiento científico, código, visión y tool calling. La innovación principal es la arquitectura "254 + 2": en lugar de un ajuste fino convencional que sobrescribe todos los parámetros, se congelan los 254 expertos originales y se añaden dos expertos especialistas en georgiano (#254 y #255) a cada una de las 40 capas MoE.

El modelo está diseñado para preservar íntegramente las capacidades del núcleo original (razonamiento STEM, programación competitiva, agentes con tool calling) mientras añade competencia nativa en georgiano, tanto en gramática y terminología técnica como en traducción literaria bidireccional inglés-georgiano. Según la model card, mantiene un contexto de 262K tokens, un codificador visual de 27 capas y una cabeza especulativa MTP (multi-token prediction) en la capa 40.

Es relevante ahora porque representa un enfoque poco habitual en la adaptación de modelos a idiomas de bajos recursos: en lugar de reentrenar o hacer CPT masivo, se añaden expertos dedicados dentro de una arquitectura MoE ya entrenada. No obstante, el modelo se encuentra en estado de pre-lanzamiento: los pesos no están subidos y la publicación está prevista en menos de un mes desde la creación del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, basada en Qwen3.5-MoE, con 40 capas MoE |
| Parámetros totales | 35B (aproximado, según nomenclatura del modelo) |
| Parámetros activos | 3B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantización | NVFP4-W4ATTN-AWQ Hybrid (20,3 GB), AWQ W4A16, GGUF APEX-Trio (APEX-Small, APEX-Medium, APEX-Good) + mmproj-f16 + mtp |
| Idiomas soportados | Inglés (en), georgiano (ka), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4/AWQ), GGUF (APEX-Trio); pesos aún no publicados |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer MoE con 40 capas de mezcla de expertos. Cada capa contiene 256 expertos enrutados: los expertos #0 a #253 son los originales del modelo base Kataguru-Sceptic-35B-A3B-v3.1 y permanecen completamente congelados; los expertos #254 y #255 son nuevos y especializados. El experto #254 se orienta a gramática georgiana (alineamiento de casos ergativo-absolutivo, screeves verbales polipersonales, circunfijos, escritura Mkhedruli) y terminología técnica (ingeniería, PLC/CNC, medicina clínica, patentes). El experto #255 se dedica a prosa literaria, no ficción moderna, diálogo natural y traducción fiel EN↔KA. Se aplica además una calibración contrastiva del enrutador para limitar la fuga de enrutamiento fuera del idioma objetivo a menos del 0,50 %.

El modelo conserva el codificador visual de 27 capas (333 tensores) y la cabeza especulativa MTP de la capa 40 (785 tensores) del modelo base. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en esta adaptación específica. La model card indica que el entrenamiento está en cola y que la certificación del dataset y la evaluación en 15 benchmarks más la evaluación nativa en georgiano están pendientes.

## Capacidades

- Generación de texto en inglés, georgiano y finés.
- Razonamiento científico y de nivel doctorado (GPQA Diamond), heredado del núcleo congelado.
- Programación competitiva y síntesis algorítmica (LiveCodeBench v6).
- Tool calling nativo con generación de AST para `<tool_call>` y detección de irrelevancia (BFCL V4).
- Capacidades multimodales de visión mediante el codificador visual de 27 capas.
- Traducción bidireccional inglés-georgiano en modo dedicado (`/translate`), con preservación de párrafos y cero charla adicional.
- Control de profundidad de razonamiento mediante etiquetas: `{REASON:spoon}` (auditoría científica de 7 pasos), `{REASON:einstein}` (síntesis de 10 ángulos), `{REASON:low}`, `{REASON:none}`.
- Selección de idioma de respuesta mediante etiqueta `/ka` o `chat_template_kwargs={"response_language": "ka"}`.
- Decodificación especulativa mediante cabeza MTP.
- Soporte de agentes y razonamiento multi-paso (heredado del núcleo, con BFCL V4 AST del 83,61 %).

## Casos de uso

- Traducción técnica y literaria EN↔KA: el modo `/translate` permite traducir páginas completas preservando estructura de párrafos, adecuado para editoriales, documentación técnica y localización de software al georgiano.
- Atención al cliente en georgiano: el modelo puede mantener conversaciones multi-turno con hasta 262K tokens de contexto, gestionando historiales largos e incorporando terminología específica del dominio mediante el experto #254.
- Generación de código en pipelines de CI/CD: con tool calling nativo (BFCL V4 AST 83,61 %) y LiveCodeBench v6 del 37,71 %, puede integrarse en flujos de revisión automatizada, generación de tests o asistencia en refactorización.
- Razonamiento científico y análisis documental: con GPQA Diamond del 69,70 %, es adecuado para tareas de investigación asistida, revisión de literatura científica y respuesta a preguntas de nivel graduado.
- Procesamiento de documentos con visión: el codificador visual de 27 capas permite extraer información de imágenes, capturas y documentos escaneados, combinándolo con la capacidad de traducción al georgiano.
- Asistencia en ingeniería y medicina clínica en georgiano: el experto #254 incluye terminología de PLC/CNC, patentes y medicina clínica, útil para documentación técnica regulada y soporte a profesionales.
- Agentes autónomos multi-paso: la combinación de tool calling, razonamiento con profundidad configurable y contexto largo permite construir agentes que planifican, ejecutan herramientas y sintetizan resultados en inglés o georgiano.

## Benchmarks y rendimiento

Los benchmarks publicados corresponden al núcleo Kataguru-Sceptic-35B-A3B, que se hereda íntegramente según la model card (expertos #0-#253 congelados). No se han publicado resultados específicos de la edición georgiana; la evaluación nativa está pendiente.

| Benchmark | Resultado del núcleo | Notas |
|---|---|---|
| Media de 15 benchmarks | 70,05 % | Batería de producción con CUDAGraphs |
| GPQA Diamond | 69,70 % (138/198) | Nivel doctorado en física, química y biología molecular |
| BFCL V4 Single-Turn AST | 83,61 % (Live AST: 79,13 %) | Tool calling y detección de irrelevancia |
| LiveCodeBench v6 (Pass@1) | 37,71 % (66/175) | Programación competitiva |
| IFEval Strict (prompt / instrucción) | 70,24 % / 77,70 % | Formato determinista y restricciones de longitud/palabras clave |
| Evaluación nativa en georgiano | Pendiente | Suite de evaluación NLP georgiana y traducción de página completa |

## Requisitos de hardware

- GGUF APEX-Medium: cabe en una GPU o Mac con 16 GB de memoria.
- NVFP4-W4ATTN-AWQ Hybrid (20,3 GB): requiere GPU Blackwell, como la RTX 5090, de forma nativa.
- AWQ W4A16: requiere 1 GPU de 24-32 GB o 2x RTX 5090 con tensor parallelism (TP=2).
- Despliegue: vLLM para AWQ y NVFP4; llama.cpp u Ollama para los formatos GGUF; los benchmarks del núcleo se midieron con CUDAGraphs habilitados en 2x RTX 5090 (TP=2).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (MoE especializado en georgiano) en la documentación proporcionada. La model card no incluye comparativas con alternativas. Se puede señalar como referencia el propio modelo base Kataguru-Sceptic-35B-A3B-v3.1, del que esta edición hereda arquitectura y benchmarks, y la variante Kataguru-Sceptic-35B-A3B-v2.6-NVFP4, que comparte el esquema de 254 expertos enrutados y 3B parámetros activos, pero está orientada a inglés y finés en lugar de georgiano.

| Modelo | Parámetros | Activos | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Georgian-v3.2 | 35B | 3B | 262K | en, ka, fi | Apache 2.0 |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35B | 3B | 262K | no disponible | Apache 2.0 |
| Kataguru-Sceptic-35B-A3B-v2.6-NVFP4 | 35B | 3B | no disponible | en, fi | Apache 2.0 |

## Limitaciones y advertencias

- Estado de pre-lanzamiento: los pesos no están subidos al repositorio; la publicación está prevista en menos de un mes desde la creación del repositorio. No es utilizable en producción todavía.
- Evaluación en georgiano pendiente: no hay resultados publicados de la suite de evaluación NLP georgiana ni de traducción de página completa; el rendimiento real en el idioma objetivo no está verificado.
- Los benchmarks reportados corresponden al núcleo heredado, no a esta edición; la transferencia exacta de capacidades depende de que la calibración del enrutador mantenga la fuga por debajo del 0,50 %, un dato no verificado de forma independiente.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación más allá de las etiquetas de razonamiento y la "honestidad epistémica" mencionada en la model card.
- Sesgos: no se documentan sesgos conocidos ni auditorías de sesgo en la información disponible.
- Idiomas: el soporte se limita a inglés, georgiano y finés; no se garantiza un comportamiento correcto en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios regulados (medicina, ingeniería) pese a incluir terminología especializada.
- Dependencia de hardware específico para NVFP4 (GPU Blackwell); el resto de formatos requieren cuantización AWQ o GGUF para caber en GPUs de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Variante NVFP4 relacionada: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-NVFP4
