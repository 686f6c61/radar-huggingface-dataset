# EdwardHuy/persona-embeddings

## Resumen

Persona-embeddings (también publicado bajo el nombre Fishstick) es una familia de modelos de embeddings de frases especializada en la búsqueda de personas a partir de descripciones breves, en neerlandés e inglés. Lo desarrolla EdwardHuy (Ward Huybrechts y Raphael Hermans) como proyecto académico para la asignatura Advanced Natural Language Processing, y se distribuye en Hugging Face con licencia CC-BY-4.0 sobre el modelo base Qwen/Qwen3-Embedding-0.6B, que a su vez es Apache-2.0.

El modelo resuelve un problema concreto de recuperación semántica: dado un texto corto del tipo "Iemand die geniet van melancholieke romans" o "Someone who enjoys melancholic novels", devolver el perfil completo de la persona que encaja con esa descripción. Para ello se parte del embedding Qwen3-Embedding-0.6B (1024 dimensiones, pooling del último token, normalización L2) y se afina mediante LoRA sobre consultas sintéticas construidas a partir del dataset NVIDIA Nemotron-Personas-Belgium. Los adaptadores LoRA se fusionan en los pesos, de modo que cada carpeta resultante es un modelo Sentence Transformers estándar.

La relevancia actual reside en su carácter bilingüe estricto y su especialización vertical: no es un embedding generalista, sino un recuperador afinado para un dominio (perfiles de personas) y dos idiomas (nl y en), con dos prompts de instrucción fijos y una longitud máxima de secuencia de 2304 tokens. Es útil para quien necesite montar un sistema de matching de perfiles en neerlandés o inglés sin entrenar desde cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) adaptado a embeddings; pooling del último token, normalización L2 |
| Parámetros totales | 0,6 mil millones (modelo base Qwen3-Embedding-0.6B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2304 tokens (`max_seq_length` en evaluación y uso) |
| Tipos de cuantización | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | neerlandés (nl) e inglés (en), entrenados y evaluados por separado |
| Licencia | CC-BY-4.0 (modelo); Apache-2.0 en el modelo base |
| Formato de pesos | safetensors (vía `sentence-transformers` y `transformers`) |
| Dimensión del embedding | 1024 |
| Tamaño del repo | 2,4 GB |
| Pipeline | sentence-similarity / feature-extraction / retrieval |
| Modelo base | Qwen/Qwen3-Embedding-0.6B |
| Librería | sentence-transformers |

## Arquitectura y entrenamiento

El modelo es un fine-tuning con LoRA sobre Qwen3-Embedding-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros que produce embeddings de 1024 dimensiones tomando el estado oculto del último token y normalizándolo en L2. Los adaptadores LoRA se fusionan en los pesos finales, por lo que el artefacto publicado es un modelo Sentence Transformers convencional, sin dependencia de PEFT en inferencia. Hay dos carpetas independientes, `nl/` y `en/`, cada una entrenada y evaluada exclusivamente con consultas y perfiles de su propio idioma; ninguna se entrenó ni evaluó con el otro idioma.

Los datos de entrenamiento son el dataset EdwardHuy/persona-queries, construido a partir de NVIDIA Nemotron-Personas-Belgium: cada persona dispone de tres consultas cortas y un perfil completo por idioma. La partición train/val/test se hace por hash del UUID de la persona y es idéntica para neerlandés e inglés, de modo que ninguna persona ni su traducción cruza entre splits. El objetivo es la suma de dos pérdidas InfoNCE: (1) consulta-a-consulta simétrica, donde el positivo de una consulta es otra consulta de la misma persona, y (2) consulta-a-perfil, donde el positivo es el perfil completo de esa persona. Se usan dos prompts de instrucción fijos, `query` y `same_person`, idénticos en ambos idiomas. Detalle técnico relevante: los inputs de entrenamiento terminaban en `<|endoftext|><|im_end|>`, y los tokenizers del repo reproducen esa secuencia; combinar estos pesos con el tokenizer original de Qwen3-Embedding produce embeddings inconsistentes.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica y recuperación (retrieval).
- Búsqueda consulta-a-perfil: dada una descripción breve de una persona, recupera su perfil completo.
- Búsqueda consulta-a-consulta (`same_person`): empareja descripciones cortas distintas de la misma persona.
- Soporte bilingüe estricto neerlandés-inglés, con modelos separados por idioma.
- Instrucciones de prompt integradas (`query`, `same_person`) que reproducen el régimen de entrenamiento.
- Compatible con el ecosistema `sentence-transformers` (`encode`, `similarity`, `prompt_name`).
- Uso alternativo vía `transformers` puro con `AutoModel` y `AutoTokenizer` (subfolder por idioma, `padding_side="left"`, dtype bfloat16).
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda de perfiles de personas en neerlandés: indexar perfiles completos y recuperar el más afín a una descripción breve del tipo "Iemand die rechten heeft gestudeerd", usando el prompt `query` para la consulta y sin prompt para los documentos. Adecuado por el afinado específico sobre Nemotron-Personas-Belgium.
- Deduplicación y resolución de entidades: dado un conjunto de descripciones cortas de la misma persona redactadas de forma distinta, usar el prompt `same_person` en ambos lados para agruparlas por similitud coseno.
- Matching de candidatos en portales de empleo belgas: comparar descripciones de candidatos con descripciones de puestos o perfiles buscados, en nl o en según el idioma del anuncio.
- Sistemas de recomendación de contactos o networking: recuperar perfiles afines a los intereses declarados por un usuario, con ventana de 2304 tokens suficiente para perfiles extensos.
- Enriquecimiento de CRM: asignar descripciones libres de clientes a perfiles canónicos previamente indexados, en flujos batch con `sentence-transformers`.
- Búsqueda semántica en directorios internos o bases de talento: indexar perfiles en una base vectorial y servir consultas en neerlandés o inglés con un único modelo por idioma.
- Evaluación académica de recuperación bilingüe: replicar los experimentos de q2d y q2q con los prompts documentados y la partición por hash de UUID.

## Benchmarks y rendimiento

Resultados publicados en la model card (MRR@10, evaluación por idioma y separada):

| Carpeta | Idioma | Run de entrenamiento | Objetivo | q2d MRR@10 | q2q MRR@10 |
|---|---|---|---|---:|---:|
| `nl/` | Neerlandés | `qwen-lora-mixed-nl-seed42` | query-to-query + query-to-profile (InfoNCE) | 0,811 | 0,031 |
| `en/` | Inglés | `qwen-lora-mixed-en-seed42` | query-to-query + query-to-profile (InfoNCE) | 0,858 | 0,052 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas adicionales como Recall@k o nDCG.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 0,6 mil millones de parámetros ocupan aproximadamente 1,2 GB de pesos; con overhead de activaciones y tokenizer, un entorno de 2-3 GB de VRAM es suficiente para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060/4060, RTX 4090, A100 y H100 son válidas. Para indexación a gran escala conviene A100/H100 por throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers` (recomendado), `transformers` con `AutoModel`/`AutoTokenizer`, y servicios de embeddings compatibles con el endpoint estándar (el repo incluye el tag `endpoints_compatible`). No se documentan variantes GGUF ni soporte explícito de llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| EdwardHuy/persona-embeddings | 0,6 B | 2304 tokens | nl, en (separados) | CC-BY-4.0 | Afinado con LoRA para retrieval de personas; q2d MRR@10 0,811 (nl) y 0,858 (en) |
| Qwen/Qwen3-Embedding-0.6B | 0,6 B | no disponible en la información | multilingüe (según modelo base) | Apache-2.0 | Modelo base generalista; sin métricas específicas de personas en esta ficha |
| Alternativas de embeddings multilingües de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Especialización estrecha: está afinado para retrieval de personas; su rendimiento en tareas generales de similitud semántica no está documentado y puede degradarse respecto al modelo base.
- Idiomas estrictamente separados: `nl/` no se entrenó ni evaluó en inglés y `en/` no se entrenó ni evaluó en neerlandés; mezclar idiomas entre consulta y documento no está soportado por el diseño.
- Dependencia del tokenizer: usar el tokenizer original de Qwen3-Embedding en lugar del incluido en el repo produce embeddings que no coinciden con el régimen de entrenamiento.
- Dependencia de los prompts: `query` y `same_person` son parte del contrato de uso; omitirlos o cambiarlos altera los resultados.
- Límite de 2304 tokens: perfiles más largos se truncan; no hay soporte documentado para contextos mayores.
- q2q con MRR@10 muy bajo (0,031 en nl, 0,052 en en): la búsqueda consulta-a-consulta es claramente más débil que la consulta-a-perfil y no debería usarse como componente principal en producción.
- Riesgo de sesgo: los datos provienen de perfiles sintéticos de Bélgica (Nemotron-Personas-Belgium); pueden heredar sesgos de composición demográfica, geográfica y lingüística del dataset sintético.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto), pero sí de falsos positivos en el ranking de recuperación.
- Licencia CC-BY-4.0: permite uso comercial con atribución; el modelo base Qwen3-Embedding-0.6B es Apache-2.0, por lo que conviene revisar ambas condiciones al redistribuir.
- Madurez: repo con 0 descargas y 1 like en el momento de la consulta, creado el 26 de noviembre de 2026; no hay evidencia de uso en producción ni mantenimiento continuado.
- Sin datos de benchmarks frente a alternativas ni de latencia/throughput; la evaluación en producción requeriría una validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EdwardHuy/persona-embeddings
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Dataset de consultas: https://huggingface.co/datasets/EdwardHuy/persona-queries
- Dataset de personas: https://huggingface.co/datasets/nvidia/Nemotron-Personas-Belgium
- Repositorio del proyecto: https://github.com/schwaartz/persona-embeddings
