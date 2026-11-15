# mradermacher/totem-4b-GGUF

## Resumen

Totem-4b es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado por es-totaljs y publicado bajo licencia Apache 2.0. Está especializado en código y asistencia para el ecosistema Total.js y jComponent, un framework de JavaScript para el desarrollo de aplicaciones web y de escritorio. El modelo está diseñado para actuar como asistente conversacional en tareas de programación dentro de ese stack tecnológico concreto, y soporta inglés y español.

La versión aquí descrita es una cuantización GGUF realizada por mradermacher a partir del modelo base es-totaljs/totem-4b. El repositorio incluye un conjunto de cuantizaciones estáticas que van desde Q2_K (2,0 GB) hasta f16 (8,5 GB), además de dos ficheros mmproj (Q8_0 y f16) que actúan como suplemento multimodal, lo que sugiere que el modelo base incorpora capacidades de visión. La disponibilidad de cuantizaciones tan ligeras permite ejecutar el modelo en hardware de consumo.

El interés de esta ficha radica en su nicho: no es un modelo generalista, sino un asistente vertical para Total.js y jComponent. Para desarrolladores que trabajan con ese framework, un modelo afinado específicamente puede ofrecer respuestas más ajustadas al API y a las convenciones del ecosistema que un modelo generalista del mismo tamaño. Sin embargo, no se han publicado datos de benchmarks ni detalles sobre el entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 4.205.751.296 (≈4,2 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base presumiblemente safetensors vía transformers |
| Modelo base | es-totaljs/totem-4b |
| Cuantizador | mradermacher |
| Tamaño del repo | 39,9 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base es-totaljs/totem-4b en la documentación proporcionada. La model card de la cuantización no detalla si se trata de un transformer denso, un modelo MoE o una arquitectura híbrida, ni tampoco el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. El tag `transformers` y la librería declarada apuntan a un modelo compatible con el ecosistema Hugging Face Transformers, y el tamaño de 4,2 B de parámetros es coherente con un transformer denso de escala pequeña-media.

El único indicio técnico relevante es la presencia de ficheros `mmproj` en el repositorio de cuantizaciones, que en el ecosistema GGUF/llama.cpp corresponden a proyecciones multimodales para modelos con capacidad de visión. Esto sugiere que el modelo base incorpora un adaptador visual, aunque no se especifica ni el codificador de imagen ni la resolución de entrada. La cuantización se realizó con la versión 2 del pipeline de mradermacher y el tipo de conversión `hf`, y se indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en inglés y español.
- Asistencia en código especializada en el ecosistema Total.js y jComponent (según los tags `totaljs`, `total.js`, `jcomponent`, `code`, `assistant`).
- Capacidad multimodal probable: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que indica soporte de entrada de imágenes en el modelo base, aunque no se detalla su alcance.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su despliegue tras una API compatible con OpenAI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Asistencia en desarrollo con Total.js: el modelo puede responder preguntas sobre el API de Total.js y jComponent, generar fragmentos de código y explicar patrones del framework, aprovechando su ajuste específico al ecosistema frente a modelos generalistas del mismo tamaño.
- Autocompletado y generación de código en el editor: con cuantizaciones Q4_K_M (2,8 GB) o Q5_K_M (3,2 GB) puede ejecutarse localmente en un portátil con GPU de consumo y ofrecer sugerencias de código Total.js con baja latencia.
- Chatbot de soporte para una comunidad de desarrolladores: al estar entrenado en inglés y español y orientado a Total.js, puede gestionar consultas técnicas de usuarios de habla hispana e inglesa sobre ese stack.
- Documentación técnica asistida: generación de borradores de documentación, comentarios de código y guías de migración para proyectos basados en jComponent.
- Revisión de código en pipelines de CI: integrado mediante una API compatible con endpoints, puede señalar malas prácticas o inconsistencias en ficheros JavaScript del ecosistema Total.js antes del merge.
- Prototipado rápido de componentes UI: a partir de una descripción textual (o potencialmente una imagen, dado el soporte mmproj), el modelo puede esbozar la estructura de un jComponent y su lógica asociada.
- Despliegue en entornos con recursos limitados: la cuantización Q2_K (2,0 GB) permite ejecutar el modelo en CPU o en GPUs con poca VRAM para tareas de asistencia básica offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ≈2,0 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: ≈2,2–2,5 GB.
  - IQ4_XS: ≈2,6 GB.
  - Q4_K_S / Q4_K_M: ≈2,7–2,8 GB.
  - Q5_K_S / Q5_K_M: ≈3,1–3,2 GB.
  - Q6_K: ≈3,6 GB.
  - Q8_0: ≈4,6 GB.
  - f16: ≈8,5 GB.
  - Añadir el proyector multimodal mmproj: +0,5 GB (Q8_0) o +0,8 GB (f16).
- GPU recomendadas: para cuantizaciones Q4–Q5 basta una GPU de consumo con 6–8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070). Para Q8_0 o f16 se recomienda 12–16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) o GPUs de datacenter como A100 o H100 si se busca throughput alto.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 con GPUs de 8 GB o más; f16 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF. Para el modelo base en formato transformers, vLLM o TGI si se confirma compatibilidad (no verificada en la información disponible).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base (contexto, arquitectura) que permitan una comparación rigurosa con alternativas. Se indica a continuación una comparación estructural básica con modelos de tamaño comparable, marcando los campos sin datos verificables.

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad GGUF |
|---|---|---|---|---|---|
| totem-4b (este) | ≈4,2 B | no disponible | Apache 2.0 | Total.js / jComponent, código, en/es | Sí (mradermacher) |
| Qwen2.5-Coder-3B | ≈3,1 B | 32 768 tokens (según model card pública) | Apache 2.0 | Código generalista | Sí |
| Llama-3.2-3B | ≈3,2 B | 128 000 tokens (según model card pública) | Llama 3.2 Community License | Generalista, multilingüe | Sí |
| Phi-3.5-mini | ≈3,8 B | 128 000 tokens (según model card pública) | MIT | Generalista, razonamiento | Sí |

Nota: los datos de los modelos comparativos provienen de sus model cards públicas y no de la información proporcionada para este modelo; se incluyen solo como referencia de categoría. No se dispone de comparaciones de rendimiento verificadas entre totem-4b y estos modelos.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que no es posible evaluar su calidad objetiva frente a alternativas del mismo tamaño.
- El modelo está especializado en Total.js y jComponent; su rendimiento en tareas generales de código o conocimiento fuera de ese ecosistema puede ser inferior al de modelos generalistas.
- Riesgo de alucinación inherente a modelos de 4 B de parámetros; no se han documentado mitigaciones específicas.
- Sesgos conocidos: no disponibles. Al no documentarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de dominio, idioma o género.
- Idiomas limitados a inglés y español; no se garantiza un comportamiento correcto en otras lenguas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- La licencia Apache 2.0 permite uso comercial, pero al ser una cuantización de un modelo base de terceros conviene verificar que el modelo base mantiene la misma licencia (la model card así lo indica).
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- No hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación, lo que puede afectar la calidad relativa de las cuantizaciones pequeñas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/totem-4b-GGUF
- Modelo base: https://huggingface.co/es-totaljs/totem-4b
- Página de descargas del cuantizador: https://hf.tst.eu/model#totem-4b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
