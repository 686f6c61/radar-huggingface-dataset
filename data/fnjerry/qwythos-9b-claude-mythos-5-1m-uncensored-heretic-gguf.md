# fnjerry/Qwythos-9B-Claude-Mythos-5-1M-uncensored-heretic-GGUF

## Resumen

Qwythos-9B-Claude-Mythos-5-1M-uncensored-heretic es un modelo de lenguaje de 8.953.803.264 parámetros (aproximadamente 9B) derivado de la familia Qwen 3.5, publicado por el usuario independiente fnjerry como cuantizaciones GGUF del modelo de llmfan46, que a su vez parte de empero-ai/Qwythos-9B-Claude-Mythos-5-1M. El modelo se distribuye con licencia Apache 2.0 y está orientado a generación de texto en inglés, con soporte declarado de razonamiento, contexto largo de hasta 1M de tokens, function calling y uso de herramientas.

La característica definitoria de esta variante es su proceso de "abliteration" o decensurado: mediante la herramienta Heretic v1.2.0 y una variante del método Magnitude-Preserving Orthogonal Ablation (MPOA) se han ablacionado direcciones de activación en las proyecciones attn.o_proj, attn.out_proj y mlp.down_proj para reducir los rechazos del modelo. El autor reporta una reducción del 85% en rechazos (11/100 frente a 73/100 del original) con una divergencia KL de 0.0123 respecto al modelo base, lo que indica una alteración limitada de la distribución de salida.

El modelo se publica principalmente como cuantizaciones GGUF (el repositorio ocupa 61,4 GB), lo que facilita su despliegue en hardware de consumo mediante llama.cpp u Ollama. Está etiquetado para casos de uso de ciberseguridad, biomedicina y flujos agénticos, y declara soporte de contexto de 1M de tokens, aunque esta cifra no está verificada de forma independiente en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, segun tags del autor); detalles de capas y atencion no disponibles |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 1M tokens (declarado en el nombre y tags; no verificado) |
| Tipos de cuantizacion | GGUF (multiples niveles; niveles concretos no disponibles en la informacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen 3.5, por lo que se trata de un transformer decoder-only con atención por tokens y mecanismos propios de esa familia (los detalles exactos de número de capas, dimensiones ocultas, cabezas de atención y tipo de atención no están disponibles en la información proporcionada). El modelo original empero-ai/Qwythos-9B-Claude-Mythos-5-1M fue sometido a un ajuste fino supervisado (SFT) completo, según los tags "sft" y "full-fine-tune", partiendo presumiblemente de un checkpoint Qwen 3.5 de 9B.

La innovación técnica principal de esta variante es el proceso de decensurado. Se aplicó Heretic v1.2.0 con una variante de MPOA (Magnitude-Preserving Orthogonal Ablation), que proyecta y elimina direcciones de activación asociadas a comportamientos de rechazo preservando la magnitud de los pesos. Los parámetros de abliteración reportados incluyen direction_index 20.52, y pesos máximos y mínimos por componente (por ejemplo, attn.out_proj.max_weight 1.74 en posición 29.99 y mlp.down_proj.max_weight 1.98 en posición 19.18). Los componentes objetivo fueron attn.o_proj, attn.out_proj y mlp.down_proj. No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline text-generation y etiqueta conversational.
- Razonamiento (tag "reasoning"), presumiblemente con modos de pensamiento heredados de la familia Qwen 3.5.
- Soporte de function calling y tool use (tags "function-calling" y "tool-use").
- Capacidades agénticas y razonamiento multi-paso (tag "agentic").
- Contexto largo declarado de hasta 1M de tokens (tag "1M-context" y "long-context").
- Orientación a dominios de ciberseguridad y biomedicina (tags "cybersecurity" y "biomedical").
- Comportamiento decensurado: reducción de rechazos reportada del 85% (11/100 frente a 73/100).
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Análisis de documentos extensos: el contexto declarado de 1M de tokens permitiría procesar repositorios de código, expedientes o corpus documentales completos en una sola pasada, útil para resumen y extracción de información sobre material muy largo.
- Automatización agéntica con herramientas: gracias al soporte de function calling y tool use, puede integrarse en pipelines donde el modelo decida qué API invocar, encadenar llamadas y razonar sobre los resultados en varios pasos.
- Asistencia en ciberseguridad: el etiquetado del modelo para este dominio sugiere su uso en revisión de configuraciones, análisis de trazas y generación de explicaciones técnicas sobre vulnerabilidades, siempre con supervisión humana dado el carácter decensurado.
- Procesamiento de literatura biomédica: el tag "biomedical" y los resultados de MMLU en asignaturas clínicas (clinical_knowledge 0.8286, professional_medicine 0.8582, college_medicine 0.8295) lo hacen apto para tareas de extracción y resumen de textos médicos, no para diagnóstico clínico.
- Despliegue local en hardware de consumo: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con GPU de gama alta o incluso CPU, lo que facilita prototipado sin infraestructura cloud.
- Generación de código y asistencia al desarrollo: con contexto largo y tool calling puede integrarse en flujos de revisión de código, generación de tests y documentación técnica dentro de pipelines de CI/CD.
- Investigación sobre alineación y decensurado: el modelo sirve como caso de estudio reproducible de abliteración con métricas publicadas (KL 0.0123, tasa de rechazo), útil para estudiar el equilibrio entre supresión de rechazos y degradación de capacidades.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de MMLU y de la evaluación de rechazos del proceso de abliteración.

| Metrica | Este modelo | Modelo original (Qwythos-9B-Claude-Mythos-5-1M) |
|---|---|---|
| MMLU (accuracy global, 7021 preguntas) | no disponible para esta variante | 0.7703 (77,03%) |
| Rechazos | 11/100 | 73/100 |
| Divergencia KL respecto al original | 0.0123 | 0 (por definición) |

Resultados MMLU por asignatura del modelo original (selección): high_school_psychology 0.9593, high_school_microeconomics 0.9485, astronomy 0.9494, marketing 0.9450, high_school_government_and_politics 0.9505, college_biology 0.9375, high_school_biology 0.9276, high_school_us_history 0.9158, high_school_world_history 0.9057, high_school_european_history 0.9041, international_law 0.9000, sociology 0.8932, miscellaneous 0.8851, high_school_computer_science 0.8654, medical_genetics 0.862, professional_medicine 0.8582, logical_fallacies 0.8553, clinical_knowledge 0.8286, professional_psychology 0.8259, high_school_macroeconomics 0.8477, prehistory 0.8372, conceptual_physics 0.8359, nutrition 0.8296, college_medicine 0.8295, human_sexuality 0.8125, moral_disputes 0.8046, anatomy 0.7887, security_studies 0.7857, high_school_statistics 0.7748, philosophy 0.7673, electrical_engineering 0.7654, human_aging 0.7586, high_school_chemistry 0.7526, elementary_mathematics 0.7011, public_relations 0.7049, college_physics 0.6842, professional_accounting 0.6713, formal_logic 0.6719, jurisprudence 0.8491, world_religions 0.8409, high_school_physics 0.6429, econometrics 0.6296, machine_learning 0.6154, professional_law 0.5885, high_school_mathematics 0.5591, college_mathematics 0.5455, moral_scenarios 0.5339, virology 0.5281. No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 9B en GGUF, aproximadamente 5-6 GB en Q4_K_M, 7-8 GB en Q6_K y 10-11 GB en Q8_0; el contexto de 1M tokens requiere KV cache adicional muy significativo (no cuantificado en la información).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantizaciones altas con contexto moderado; A100 40/80 GB o H100 para contexto largo y despliegue concurrente.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para cuantizaciones Q4, y en 12-16 GB para Q6/Q8 con contexto corto.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no están confirmados para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwythos-9B-Claude-Mythos-5-1M-uncensored-heretic (este) | 8,95B | 1M declarado | Apache 2.0 | Decensurado, GGUF, 11/100 rechazos |
| Qwythos-9B-Claude-Mythos-5-1M (original) | 8,95B | 1M declarado | no disponible | Mismo modelo sin abliterar, 73/100 rechazos, MMLU 77,03% |
| Qwen 3.5 9B (familia base) | aproximadamente 9B | no disponible | no disponible | Modelo base de la familia; sin datos de esta variante |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Modelo decensurado: la abliteración elimina direcciones de rechazo, por lo que puede generar contenido dañino, ilegal o éticamente problemático sin las salvaguardas habituales; no es apto para aplicaciones de cara al público sin filtros externos.
- Solo soporta inglés de forma declarada; el rendimiento en castellano u otros idiomas no está garantizado.
- El contexto de 1M tokens es una declaración del autor y no está verificado de forma independiente; el rendimiento real en contextos muy largos puede degradarse.
- Riesgo de alucinación inherente a modelos de 9B; los resultados MMLU de 77,03% corresponden al modelo original, no a esta variante decensurada, que podría presentar ligeras diferencias.
- La evaluación de rechazos (11/100) es una métrica del autor sin protocolo independiente publicado.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal y ética del contenido generado por un modelo sin alineación de seguridad.
- El repositorio ocupa 61,4 GB y el autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que podría afectar a la disponibilidad futura de archivos.
- No se dispone de información sobre sesgos específicos medidos, datos de entrenamiento ni evaluación de seguridad.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/fnjerry/Qwythos-9B-Claude-Mythos-5-1M-uncensored-heretic-GGUF
- Modelo base (llmfan46): https://huggingface.co/llmfan46/Qwythos-9B-Claude-Mythos-5-1M-uncensored-heretic
- Modelo original (empero-ai): https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Heretic (herramienta de abliteración): https://heretic-project.org/
- Blog sobre Magnitude-Preserving Orthogonal Ablation: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Patreon del autor: https://patreon.com/LLMfan46
- Ko-fi del autor: https://ko-fi.com/llmfan46
