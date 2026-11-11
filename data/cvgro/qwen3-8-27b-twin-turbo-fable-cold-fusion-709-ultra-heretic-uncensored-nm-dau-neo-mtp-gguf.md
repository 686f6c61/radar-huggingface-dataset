# cvgro/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF es un ajuste fino (fine-tune) de la familia Qwen 3.8 de 27B de parámetros, publicado por el usuario cvgro en Hugging Face como cuantización GGUF del modelo original de DavidAU. El modelo se distribuye en formato GGUF con variantes "regular" y "MTP" (Neo MAX), pensadas para inferencia en hardware de consumo, y se ofrece en versiones de 4 y 8 bits. Su propuesta central es reducir drásticamente el consumo de tokens de razonamiento (entre 1/2 y 1/20 respecto al Qwen 3.8 base) manteniendo la calidad de salida, además de incorporar cinco modos de razonamiento y cinco modos instruct conmutables en caliente.

El modelo se presenta como una versión "fuertemente sin censura" (uncensored/abliterated), orientada a escritura creativa, rol y usos generales, y declara soporte para 16 idiomas, incluido el español. La ficha técnica real de safetensors indica 26.895.998.464 parámetros totales (aproximadamente 26,9B), aunque el nombre comercial lo redondea a 27B. El repositorio ocupa 337,1 GB, coherente con múltiples cuantizaciones GGUF de un modelo de este tamaño.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: ajustes finos multi-etapa sobre modelos Qwen, cuantizaciones GGUF optimizadas para consumo, y modos de control de razonamiento conmutables por API. No obstante, la información disponible proviene casi exclusivamente de la model card del autor, sin benchmarks independientes verificables, y el modelo registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.8; detalles de atención no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9B; comercializado como 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 4 bits y 8 bits; variantes "regular" y "MTP" (Neo MAX); se mencionan Q4KS y quants con imatrix |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con múltiples cuantizaciones); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de identificarla como un transformer de la familia Qwen 3.8 de 27B. El autor describe el proceso como un "multi-stage tune" y "multi-state merge" construido sobre el modelo base DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored, empleando los métodos que denomina "COLD FUSION" y "FABLE FUSION 711". El ajuste se realizó con Unsloth según los tags del repositorio. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

Los datasets referenciados en la model card son DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets y DavidAU/THE-DECKARD-Datasets. La innovación declarada principal es la reducción del consumo de tokens de pensamiento ("TWIN TURBO"), que según el autor baja a entre 1/2 y 1/20 del Qwen 3.8 base, junto con cinco modos de razonamiento y cinco modos instruct conmutables en caliente vía API, directa o en el propio chat. También se menciona el uso de quants imatrix. No hay información verificable sobre innovaciones arquitectónicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto general, razonamiento y modo "thinking" con control del volumen de tokens de pensamiento.
- Cinco modos de razonamiento, incluidos dos nuevos denominados "Spoon" y "Einstein", conmutables en caliente.
- Cinco modos instruct (incluidos "Spoon" y "Einstein") que, según el autor, no consumen tokens de razonamiento.
- Escritura creativa, ficción, narrativa de todos los géneros y roleplaying, con énfasis declarado en estructura narrativa y arcos de personaje.
- Programación (tag "coder") y usos generales ("all use cases").
- Capacidad multimodal de entrada imagen-texto según el pipeline declarado (image-text-to-text).
- Soporte multilingüe en 16 idiomas, incluido el español.
- El autor menciona control a nivel de mensaje/chat, pero no se documenta explícitamente tool calling ni function calling.
- No se documenta soporte explícito de agentes o multi-step reasoning más allá de los modos de razonamiento.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo declara mantener estructura de tres actos y arcos de personaje a lo largo de decenas de miles de palabras, lo que lo hace adecuado para novela y ficción serializada.
- Roleplaying y ficción interactiva: los modos instruct sin tokens de razonamiento reducen latencia y coste en conversaciones multi-turno de personajes.
- Generación de código en pipelines: el tag "coder" y la reducción de tokens de pensamiento permiten integrarlo en flujos de autocompletado o revisión donde el coste por token importa.
- Asistentes conversacionales multilingües: con 16 idiomas declarados, puede atender usuarios en español, inglés, francés, alemán, etc., en una misma instancia.
- Prototipado en hardware de consumo: las cuantizaciones GGUF de 4 bits permiten desplegarlo en estaciones de trabajo con GPU de gama alta de consumo mediante llama.cpp u Ollama.
- Generación de contenido sin restricciones de filtrado: al ser una versión uncensored, se orienta a investigación sobre alineación, red teaming y estudios de sesgo, no a producción con requisitos de moderación.
- Descripción de imágenes (image-text-to-text): el pipeline declarado permite tareas de captioning o VQA, aunque no se detalla el codificador visual.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y no son verificables de forma independiente. Se presentan tal cual, sin validación externa.

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 699 | Según el autor, 108 puntos por encima de Qwen 3.8 27B |
| ARC-C (4 bits) | 692 | Versión "L-Uncensored" declarada en 701 (4 bits) y 709 (8 bits) |
| Comparación con Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B | Superior en los 7 benchmarks críticos según el autor | Sin cifras detalladas por benchmark |

No se han publicado resultados independientes de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible. Las cifras de ARC-C deben tratarse con cautela: no se especifica la metodología de evaluación ni el conjunto exacto.

## Requisitos de hardware

- VRAM estimada: para 26,9B parámetros, una cuantización de 4 bits requiere aproximadamente 14-16 GB de VRAM (más overhead de contexto); la de 8 bits, en torno a 27-30 GB.
- GPU recomendadas: A100 40/80 GB o H100 para 8 bits con contexto largo; RTX 4090 (24 GB) para 4 bits; RTX 3090 (24 GB) también viable en 4 bits.
- GPU de consumo: sí cabe en 4 bits en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo) y GPUs con 16 GB o más; en 8 bits requiere 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face. No se confirma soporte de vLLM o TGI para estas cuantizaciones.
- Latencia y throughput: no disponibles. El autor afirma que la reducción de tokens de pensamiento acelera la inferencia, pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (cvgro/DavidAU Qwen3.8-27B TWIN-TURBO) | ~26,9B | no disponible | Apache 2.0 | GGUF (4/8 bits) | Fine-tune uncensored con modos de razonamiento conmutables |
| Qwen 3.8 27B (base) | ~27B | no disponible | Apache 2.0 (según familia Qwen) | safetensors, GGUF | Modelo base; el autor declara mejora de 108 puntos en ARC-C |
| Qwen3.6-35B-A3B | 35B totales (MoE, ~3B activos) | no disponible | no disponible | no disponible | Alternativa MoE citada por el autor como superada en 7 benchmarks |
| Qwen 3.6 27B / Qwen 3.5 27B | ~27B | no disponible | no disponible | no disponible | Generaciones previas citadas como referencia |

Los datos de contexto, rendimiento verificado y disponibilidad de las alternativas no están disponibles en la información proporcionada. La comparación se limita a lo que el autor declara.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": se ha eliminado o reducido deliberadamente el filtrado de seguridad, lo que implica riesgo de generar contenido dañino, ofensivo o ilegal. No apto para producción con requisitos de moderación.
- Riesgo elevado de alucinación: no hay evaluaciones independientes de factualidad.
- Los benchmarks son autoinformados por el autor, sin metodología pública ni replicación; las cifras de ARC-C (699/692) deben tomarse con escepticismo.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con ventanas largas.
- Licencia Apache 2.0 declarada, pero el modelo base y los datasets de terceros pueden imponer condiciones adicionales; conviene revisar la procedencia antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; la calidad no está contrastada por terceros.
- El nombre comercial (27B) difiere ligeramente del recuento real (~26,9B); no afecta al uso pero conviene tenerlo en cuenta en presupuestos de VRAM.
- Soporte de tool calling, agentes y contexto largo no está documentado; no asumir su disponibilidad en producción.
- La model card incluye afirmaciones comerciales no verificables ("el fine-tune más potente... en hardware de consumo"); tratarlas como marketing, no como dato técnico.

## Enlaces

- Hugging Face: https://huggingface.co/cvgro/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Versión L-Uncensored: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Perfil del autor original: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs: https://huggingface.co/DavidAU/support
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Dataset THE-DECKARD: https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets
