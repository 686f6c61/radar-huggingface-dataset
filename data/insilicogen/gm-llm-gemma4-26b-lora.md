# insilicogen/GM-LLM-Gemma4-26B-LoRA

## Resumen

GM-LLM (Gemma4-26B) es un conjunto de adaptadores LoRA publicados por insilicogen que especializan el modelo base `google/gemma-4-26B-A4B-it` en la interpretación de variantes genéticas asociadas a cáncer, con respuestas fundamentadas en literatura científica. El modelo resuelve un problema concreto de genómica clínica: traducir anotaciones de variantes (por ejemplo, ClinVar) y documentación biomédica en interpretaciones estructuradas y citadas, una tarea que hasta ahora requería revisión manual experta o pipelines ad hoc.

La especialización se realiza en dos etapas encadenadas: un ajuste fino (FT) sobre 42.918 pares de pregunta-respuesta extraídos de literatura oncológica, seguido de un ajuste con recuperación aumentada (RAFT) sobre 1.438 ítems con documentos de contexto y citas. El resultado es un adaptador que produce respuestas en formato `<body>…</body> <citation>…</citation>` en coreano, con un salto medido en corrección frente al modelo base (0,716 → 0,954 según juez Gemma4).

Es relevante ahora porque demuestra que un modelo abierto de gran tamaño con adaptadores de bajo rango puede alcanzar calidad útil en un dominio altamente especializado y regulado, sin reentrenar el modelo completo. No obstante, el propio autor lo posiciona como herramienta de investigación, no como dispositivo médico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Gemma4, presumiblemente MoE según nomenclatura A4B; no confirmado en la información disponible) |
| Parametros totales | 26B (modelo base); adaptadores LoRA de bajo rango (r16) |
| Parametros activos | 4B (según nomenclatura `A4B` del modelo base; no confirmado explícitamente) |
| Longitud de contexto | 4.096 tokens (longitud máxima usada en el entrenamiento RAFT); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 (sujeta además a la licencia y política de uso del modelo base) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el modelo base `google/gemma-4-26B-A4B-it` (revisión `47b6801b24d15ff9bcd8c96dfaea0be9ed3a0301`). Los adaptadores se aplican sobre las capas de atención y MLP con rango r=16, alpha=32 y dropout 0,2. El entrenamiento se estructura en dos fases: primero un ajuste fino supervisado sobre 42.918 pares QA de literatura oncológica (lr 5e-5, 1 época, longitud máxima 1.024), y después un RAFT (Retrieval-Augmented Fine-Tuning) sobre 1.438 ítems que incluyen documentos de contexto y citas (lr 5e-5, 6 épocas, longitud máxima 4.096). El adaptador RAFT se entrenó sobre el modelo base con el adaptador FT ya fusionado, por lo que el orden de carga es obligatorio: FT primero (con `merge_and_unload`), RAFT después.

La innovación técnica principal no está en la arquitectura sino en el pipeline de especialización por etapas y en el formato de salida estructurado con citas explícitas a documentos (`doc_N`), lo que facilita la verificación de las respuestas. No se documentan innovaciones como decodificación especulativa ni atención lineal en la información disponible.

## Capacidades

- Interpretación de variantes genéticas relacionadas con cáncer a partir de anotaciones ClinVar y documentación de literatura.
- Generación de respuestas estructuradas con cuerpo y bloque de citas (`<body>…</body> <citation>(Reference: doc_N, …)</citation>`).
- Razonamiento sobre contexto documental (hasta 4.096 tokens) en modalidad RAG/RAFT.
- Respuestas en coreano como idioma principal de salida; comprensión de entradas en inglés.
- Integración con pipelines de recuperación (BM25 evaluado) para construir el contexto de documentos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Interpretación asistida de variantes en paneles de cáncer: el modelo recibe la anotación ClinVar y los documentos relevantes y devuelve una interpretación con citas, reduciendo el tiempo de revisión preliminar por parte de genetistas.
- Generación de borradores de informes de variantes para comités moleculares: el formato estructurado con citas facilita la trazabilidad y la revisión posterior por expertos.
- Búsqueda semántica aumentada sobre literatura oncológica: combinado con un recuperador BM25 o denso, responde preguntas sobre variantes concretas citando los documentos recuperados.
- Curaduría de bases de datos de variantes: el modelo puede proponer clasificaciones preliminares que luego se contrastan manualmente, agilizando el triaje.
- Formación y docencia en genómica clínica: permite generar explicaciones citadas de variantes para material educativo, siempre con revisión experta.
- Evaluación comparativa de pipelines RAG en dominio biomédico: el modelo y sus datasets asociados sirven como referencia para medir calidad de recuperación y fundamentación.

## Benchmarks y rendimiento

Evaluación sobre un conjunto de 548 ítems con anotación ClinVar en la entrada:

| Métrica | Modelo base | GM-LLM |
|---|---|---|
| Corrección (juez Gemma4) | 0,716 | 0,954 |
| Corrección (juez Claude Sonnet 5.5) | 0,525 | 0,682 |
| Corrección con recuperación real (BM25, 127 ítems, juez Gemma4) | — | 0,827 |

La corrección es una puntuación de juez LLM (correcto 1 / parcial 0,5 / incorrecto 0) frente a respuestas de referencia. No se han publicado en la información disponible resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo base de 26B en bfloat16 se requiere aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas por el autor; por tamaño, GPUs con 80 GB (A100, H100) o múltiples GPUs consumer en paralelo.
- Viabilidad en GPU consumer: no confirmada; probablemente requiere cuantización (no documentada) o sharding multi-GPU.
- Opciones de despliegue: transformers + PEFT (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para estos adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GM-LLM (Gemma4-26B) | 26B (adaptadores LoRA r16) | 4.096 (entrenamiento) | Variantes genéticas de cáncer, coreano | Apache 2.0 (+ política del base) | Hugging Face |
| Modelo base `google/gemma-4-26B-A4B-it` | 26B | no disponible | Generalista | Gemma (política propia) | Hugging Face |
| Alternativas de genómica clínica de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos especializados comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: no es un dispositivo médico ni debe usarse para decisiones clínicas autónomas; requiere revisión por expertos cualificados.
- La precisión cae con recuperación real (0,827 con BM25 frente a 0,954 con documentos gold), por lo que la calidad del recuperador condiciona el resultado.
- Los errores en la anotación ClinVar de entrada se propagan a las respuestas.
- Sesgos conocidos: no documentados explícitamente; al entrenarse sobre literatura oncológica, puede heredar sesgos de la literatura publicada.
- Riesgo de alucinación: presente como en cualquier LLM; el formato de citas mitiga pero no elimina el riesgo de citas incorrectas o interpretaciones erróneas.
- Idioma: salida principal en coreano; el rendimiento en castellano no está evaluado ni documentado.
- Licencia: Apache 2.0 para los adaptadores, pero el uso está sujeto además a la licencia y política de uso del modelo base Gemma4, que puede imponer restricciones adicionales para uso comercial.
- El orden de carga de adaptadores (FT y luego RAFT) es obligatorio; cargarlos en otro orden produce resultados incorrectos.

## Enlaces

- Hugging Face: https://huggingface.co/insilicogen/GM-LLM-Gemma4-26B-LoRA
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Dataset FT: https://huggingface.co/datasets/insilicogen/llm-mutation-ft-qa
- Dataset RAFT: https://huggingface.co/datasets/insilicogen/llm-mutation-variant-qa
- Paper (en revisión, 2026): Lee Y. et al. "Staged Domain Specialization of Open-Source Large Language Models for Cancer-Related Genetic Variant Interpretation", *Diagnostics* (MDPI).
