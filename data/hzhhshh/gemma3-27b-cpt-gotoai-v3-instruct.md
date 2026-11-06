# Hzhhshh/gemma3-27b-cpt-gotoai-v3-instruct

## Resumen

GoTo-AI-Gemma-3-27B-IT es un modelo de lenguaje de 27.432 millones de parámetros derivado de la arquitectura Gemma 3 de Google, adaptado mediante preentrenamiento continuado (CPT) e instrucción supervisada para el contexto cultural y lingüístico de Indonesia. Lo desarrollan conjuntamente PT GoTo Gojek Tokopedia Tbk y AI Singapore, y forma parte de la familia GoTo-AI, una colección de modelos orientados a lenguas y culturas indonesias. El repositorio concreto analizado aquí es una variante publicada por el usuario Hzhhshh (`Hzhhshh/gemma3-27b-cpt-gotoai-v3-instruct`), que replica la nomenclatura y configuración del modelo oficial.

El modelo resuelve un problema concreto: la mayoría de LLM de gran tamaño rinden de forma deficiente en lenguas regionales de Indonesia (javanés, sondanés, batak toba, balinés) y en conocimiento local (currículo escolar, cultura, sociedad). GoTo-AI cubre seis idiomas (inglés, indonesio, javanés, sondanés, batak toba y balinés) con una ventana de contexto de 128.000 tokens, lo que lo hace útil para tareas de documentación extensa, atención al cliente multilingüe y evaluación educativa localizada.

Es relevante ahora porque demuestra que el ajuste sobre una base abierta como Gemma 3 permite obtener rendimiento competitivo en mercados lingüísticos tradicionalmente desatendidos, con una licencia Gemma que permite uso comercial bajo condiciones. El modelo se distribuye en safetensors y es compatible con transformers y text-generation-inference.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3) |
| Parámetros totales | 27.432.406.640 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantización | no disponible en la información proporcionada (se menciona FP16/BF16 para inferencia) |
| Idiomas soportados | inglés, indonesio, javanés, sondanés, batak toba, balinés |
| Licencia | Gemma License |
| Formato de pesos | safetensors (repo de 109,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 3, un transformer decoder con tokenizador propio de Gemma 3. Sobre esa base se aplica preentrenamiento continuado (CPT) con datos orientados a Indonesia y posteriormente un ajuste de instrucciones (instruct tuning) para alinear el comportamiento conversacional. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible.

La innovación principal no es arquitectónica sino de dominio: la localización profunda del corpus y de las evaluaciones. Los benchmarks empleados (IndoMMLU, SEA-HELM, SEA-IFEval y SEA-MTBench) fueron filtrados, localizados y traducidos por lingüistas y hablantes nativos del equipo, de modo que las pruebas reflejan competencia real en las lenguas objetivo y no solo traducciones superficiales. La evaluación se realizó en modo zero-shot con prompts nativos sobre muestras de entre 100 y 1.000 instancias por dataset.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, indonesio, javanés, sondanés, batak toba y balinés.
- Razonamiento causal y natural language inference (NLI), evaluados vía SEA-HELM.
- Traducción bidireccional inglés↔lengua regional (Eng>Lang y Lang>Eng).
- Resumen abstracto (abstractive summarisation) de documentos.
- Análisis de sentimiento y detección de toxicidad.
- Diagnósticos lingüísticos (LINDSEA) para evaluar corrección gramatical y morfológica.
- Seguimiento de instrucciones con restricciones de formato (SEA-IFEval): inicio de respuesta con palabras concretas, número de secciones, etc.
- Capacidad multimodal image-text-to-text heredada de Gemma 3 (el pipeline declarado en el repo es text-generation, pero las tags incluyen image-text-to-text).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada.
- Capacidades de agente multi-paso: no confirmadas explícitamente en la información proporcionada.

## Casos de uso

- Atención al cliente en Indonesia: el modelo puede gestionar conversaciones multi-turno en indonesio, javanés y sondanés con una ventana de 128.000 tokens, suficiente para arrastrar el historial completo de un cliente y documentación de producto en una sola sesión.
- Traducción de documentación corporativa: traducción bidireccional inglés↔lenguas regionales para manuales, contratos y material de formación, aprovechando la evaluación específica de traducción en SEA-HELM.
- Moderación de contenido: detección de toxicidad en lenguas regionales donde los filtros entrenados solo en inglés fallan, usando la capacidad evaluada en SEA-HELM.
- Educación localizada: generación de preguntas y explicaciones alineadas con el currículo indonesio (humanidades, lengua, ciencias sociales y STEM) para plataformas de aprendizaje, apoyándose en IndoMMLU.
- Análisis de opiniones de clientes: clasificación de sentimiento sobre reseñas en javanés o sondanés en plataformas de e-commerce, un caso directamente alineado con el origen del modelo (GoTo/Gojek/Tokopedia).
- Resumen de actas y documentos largos: resumen abstracto de reuniones o informes extensos gracias al contexto de 128k tokens, sin truncar el documento.
- Asistentes conversacionales con formato estricto: generación de respuestas que respetan restricciones de formato (número de secciones, palabras de apertura) para integración en pipelines automatizados, validado con SEA-IFEval.

## Benchmarks y rendimiento

La model card describe los benchmarks empleados y su metodología, pero no incluye los valores numéricos de los resultados en el texto proporcionado. Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible.

Metodología declarada (sin cifras):
- IndoMMLU: evaluación zero-shot con prompts nativos, muestras de 100 a 1.000 instancias por tarea, puntuaciones normalizadas por azar.
- SEA-HELM: tareas de QA, sentimiento, toxicidad, traducción bidireccional, resumen abstracto, razonamiento causal, NLI y LINDSEA; zero-shot con prompts nativos.
- SEA-IFEval: seguimiento de restricciones de formato, con normalización por proporción de respuestas en el idioma correcto.
- SEA-MTBench: conversación multi-turno (2 turnos) juzgada por gpt-4-1106-preview frente a gpt-3.5-turbo-0125 como baseline; métrica de win rate ponderado por categoría (Math, Reasoning, STEM, Humanities, Roleplay, Writing, Extraction), empate = 0,5.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 54-60 GB según la model card.
- GPU recomendadas por el autor: 1× NVIDIA A100 (80 GB), 2× NVIDIA L40s o 3× NVIDIA RTX 4090.
- Cabe en GPU de consumo: sí, con cuantización, pero la información proporcionada no detalla formatos GGUF ni requisitos exactos por cuantización; en FP16 requiere múltiples RTX 4090.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se confirma soporte de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GoTo-AI-Gemma-3-27B-IT | 27,4 B | 128k | en, id, jv, su, bbc, ban | Gemma License | Hugging Face (repo oficial y réplica) |
| Gemma 3 27B (base) | 27 B | 128k | multilingüe general | Gemma License | Hugging Face, Google AI Studio |
| SEA-LION (AI Singapore) | no disponible en la información | no disponible | lenguas del sudeste asiático | no disponible | Hugging Face |
| Sailor / modelos indonesios derivados de Llama | no disponible en la información | no disponible | indonesio y regionales | no disponible | Hugging Face |

La comparación cuantitativa de rendimiento con estas alternativas no está disponible en la información proporcionada; la model card remite al GoTo-AI Leaderboard para detalles.

## Limitaciones y advertencias

- Alucinación: la model card advierte explícitamente de que el modelo puede generar contenido irrelevante o ficticio no fundamentado en el contexto.
- Razonamiento inconsistente: se recomienda cautela al interpretar y validar las respuestas por posibles incoherencias en la cadena de razonamiento.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al estar entrenado sobre corpus indonesios, puede reflejar sesgos culturales y regionales de esas fuentes.
- Cobertura idiomática desigual: las lenguas con menos recursos (batak toba, balinés) probablemente tengan menor calidad que indonesio o inglés, aunque no se aportan métricas por idioma.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google (ai.google.dev/gemma/terms); es necesario revisar las restricciones de redistribución y las cláusulas de uso aceptable antes de desplegar en producción.
- Seguridad: el autor indica que el modelo ha sido alineado para seguridad general, pero recomienda realizar ajuste fino de seguridad propio antes de exponerlo a usuarios finales.
- Repositorio de terceros: el repo analizado (`Hzhhshh/...`) es una réplica de un usuario, no el repo oficial de GoTo; conviene verificar integridad de pesos y procedencia antes de usarlo.
- Idiomas fuera de la lista: el rendimiento en castellano u otras lenguas no está evaluado ni garantizado.

## Enlaces

- Repositorio analizado: https://huggingface.co/Hzhhshh/gemma3-27b-cpt-gotoai-v3-instruct
- Repo oficial citado en la model card: https://huggingface.co/GoToCompany/GoTo-AI-Gemma-3-27B-IT
- Leaderboard GoTo-AI: https://huggingface.co/spaces/GoToCompany/GoTo-AI-Leaderboard
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Paper IndoMMLU: https://arxiv.org/abs/2310.04928
- Paper SEA-HELM: https://arxiv.org/abs/2502.14301
- Paper IFEval: https://arxiv.org/abs/2311.07911
- Paper MT-Bench: https://arxiv.org/abs/2306.05685
