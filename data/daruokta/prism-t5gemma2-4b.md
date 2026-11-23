# daruokta/prism-t5gemma2-4b

## Resumen

Prism-T5Gemma2-4B es un modelo encoder-decoder derivado de `google/t5gemma-2-4b-4b` que fusiona las adaptaciones de dos modelos discriminativos: `KaLM-Embedding/KaLM-Reranker-V1-Large-R2` (reranking comprimido y recuperación multi-hop) y `AgentBull/bongard-mini` (juicio calibrado de tipo system-one). El autor, daruokta, lo publica como un motor discriminativo y de recuperación no autorregresivo: no genera texto token a token, sino que produce puntuaciones y probabilidades calibradas en un único forward pass. Incorpora además mecánicas de memoria algebraica de INTRA (Reverse-QWK) y Hydragen (Partitioned LSE Attention).

La propuesta es relevante porque reutiliza un backbone multimodal con visión (SigLIP 417M) para tres paradigmas no autorregresivos sobre un mismo estado de encoder cacheado: reranking comprimido con compresión jerárquica MEP (`r=16 -> r=2`), juicio probabilístico tipado (`choice`, `noul`, `score`, `judge_many`) y compresión de memoria Reverse-QWK (54x–870x menor que una cross-KV en FP16). El modelo se posiciona como complemento local de un LLM externo para tareas de recuperación, verificación y enrutamiento con latencia de milisegundos.

El repositorio ocupa 19,9 GB y se distribuye en BF16 más una variante NF4 de 4 bits. La licencia es Gemma, heredada del backbone. El modelo es muy reciente (creado en noviembre de 2026) y cuenta con un volumen de descargas muy bajo, por lo que su validación independiente es todavía escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5Gemma-2), no autorregresiva en uso; visión SigLIP 417M |
| Parametros totales | 4B (backbone `t5gemma-2-4b-4b`, 4B encoder / 4B decoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NF4 4-bit (variantes publicadas); otras no disponibles |
| Idiomas soportados | inglés y multilingüe |
| Licencia | Gemma |
| Formato de pesos | safetensors |
| Pipeline | text-ranking |
| Libreria | transformers |
| Tamano del repo | 19,9 GB |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `google/t5gemma-2-4b-4b`, un encoder-decoder preentrenado sin versión oficial instruction-tuned. Sobre esos pesos se aplica una fusión por task arithmetic de las adaptaciones de `KaLM-Reranker-V1-Large-R2` y `AgentBull/bongard-mini`, dos modelos entrenados con objetivos discriminativos y no conversacionales. El autor justifica explícitamente el diseño no autorregresivo: forzar generación libre sobre pesos discriminativos produciría texto ruidoso, de modo que el modelo se construye como motor de puntuación en un solo paso.

La fusión incorpora dos mecanismos de compresión de memoria: MEP con compresión jerárquica (`r=16 -> r=2`, con soporte declarado de `r=2..128`) para el reranking, y Reverse-QWK de INTRA para comprimir la memoria cross-KV entre 54x y 870x respecto a FP16. La atención usa Partitioned LSE Attention de Hydragen. El modelo declara cabezas separadas: `lm_head` para el veredicto binario sí/no del reranker y `JudgmentHead` bilineal para el juicio listwise de Bongard, con interacción multiplicativa `(W_c h_i)^T (W_g g) / √256` entre el vector global `g` en `<decision_end>` y cada candidato `h_i`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reranking de texto e imagen: puntuación de cientos de documentos cacheados mediante compresión MEP jerárquica.
- Recuperación multi-hop: encadenamiento de consultas sobre memoria comprimida para RAG de varios saltos.
- Juicio calibrado `choice`: selección entre 2 y 255 opciones con probabilidades calibradas por temperature scaling.
- Verificación `noul`: salida True / False / Null para comprobación de hechos y detección de alucinaciones con abstención.
- Puntuación ordinal `score`: calificación con rúbrica de 2 a 10 niveles.
- `judge_many`: evaluación de múltiples preguntas sobre un único estado de evidencia cacheado.
- Representaciones con alcance JEPA para el juicio de Bongard.
- Procesamiento multimodal de imágenes mediante el encoder SigLIP 417M.
- Puntuación listwise: comparación cruzada de candidatos en una misma secuencia de decoder.
- No soporta generación de texto libre, tool calling ni razonamiento agéntico multi-paso en el sentido conversacional; su función es discriminativa.

## Casos de uso

- Funnel de recuperación en RAG: reordenar el top-100 de un retriever a un top-5 antes de pasarlo a un LLM generador, usando la compresión MEP `r=16 -> r=2` para reducir coste de memoria y latencia.
- Recuperación multi-hop: encadenar consultas sobre documentos cacheados con Reverse-QWK para responder preguntas que requieren combinar evidencia de varias fuentes.
- Verificación de hechos y detección de alucinaciones: aplicar `noul` sobre la respuesta de un LLM y el contexto recuperado para decidir si se acepta, se rechaza o se abstiene (Null) antes de mostrarla al usuario.
- Enrutamiento de consultas: usar `choice` para clasificar la intención del usuario entre 2 y 255 categorías y dirigir la petición al agente o pipeline adecuado.
- Evaluación automática con rúbrica: emplear `score` para calificar respuestas generadas en un rango ordinal de 2 a 10, con probabilidades calibradas que permiten fijar umbrales de riesgo.
- Búsqueda multimodal: indexar y reordenar imágenes junto a texto usando el encoder SigLIP, por ejemplo para catálogos de producto o búsqueda visual documental.
- Filtrado por lotes: `judge_many` permite evaluar varias preguntas sobre un mismo estado de evidencia cacheado, útil en pipelines de control de calidad o moderación por lotes.
- Companion local de bajo coste: desplegar el modelo junto a un LLM grande para descargar de este las tareas de ranking, verificación y routing y reducir llamadas al modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye afirmaciones cualitativas del autor (por ejemplo, 100 % de accuracy a 16x de compresión en el reranker, o compresión de memoria 54x–870x), pero no tablas numéricas de MMLU, HumanEval, GSM8K, nDCG ni MRR que permitan comparación objetiva.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y cache; en la práctica se recomienda 16 GB o más.
- VRAM estimada en NF4 4-bit: aproximadamente 2,5–3 GB para pesos, más overhead; viable en GPUs consumer de 8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y documentos cacheados numerosos; RTX 4090 (24 GB) para BF16 con lotes moderados; RTX 3090, 4080 o 4070 Ti para la variante NF4.
- Cabe en GPU consumer: sí, especialmente la variante NF4 en GPUs de 8 GB o más; BF16 requiere 16 GB o más.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama y TGI no están confirmados como soportados en la información disponible.
- Latencia y throughput: no disponibles. El autor afirma que cada consulta se resuelve en un único forward pass sin decodificación token a token, lo que en teoría reduce la latencia frente a modelos generativos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prism-T5Gemma2-4B | 4B | no disponible | Encoder-decoder discriminativo multimodal | Gemma | Hugging Face (daruokta) |
| google/t5gemma-2-4b-4b | 4B | no disponible | Encoder-decoder base | Gemma | Hugging Face (Google) |
| KaLM-Reranker-V1-Large-R2 | no disponible | no disponible | Reranker | no disponible | Hugging Face (KaLM-Embedding) |
| AgentBull/bongard-mini | no disponible | no disponible | Modelo de decisión system-one | no disponible | Hugging Face (AgentBull) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; usarlo como chatbot dará resultados degradados.
- No soporta tool calling ni razonamiento agéntico multi-paso de forma nativa.
- La calibración de probabilidades depende del temperature scaling aplicado en el entrenamiento; no se documentan curvas de fiabilidad ni validación externa.
- Riesgo de sesgos heredados del backbone T5Gemma-2 y de los datasets de KaLM y Bongard, no auditados en la información disponible.
- Idiomas declarados: inglés y multilingüe, sin lista concreta ni evaluación por idioma; el rendimiento en castellano no está verificado.
- Longitud de contexto no documentada, lo que impide planificar su uso con documentos largos sin pruebas previas.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos de Google antes de desplegarlo en producción.
- El modelo es muy reciente y con muy pocas descargas; no hay validación independiente de las afirmaciones de la model card.
- El repositorio de 19,9 GB incluye varias variantes de pesos (BF16 y NF4), lo que exige planificar el almacenamiento y la descarga.
- La fusión por task arithmetic puede producir interferencias entre las capacidades de reranking y de juicio; conviene validar ambas tareas por separado en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/daruokta/prism-t5gemma2-4b
- Backbone base: https://huggingface.co/google/t5gemma-2-4b-4b
- Reranker de origen: https://huggingface.co/KaLM-Embedding/KaLM-Reranker-V1-Large-R2
- Modelo de decisión de origen: https://huggingface.co/AgentBull/bongard-mini
- Paper T5Gemma-2 (referencia de la model card): https://arxiv.org/abs/2512.14856
- Referencia arXiv 2606.22807: https://arxiv.org/abs/2606.22807
- Referencia arXiv 2609.39111: https://arxiv.org/abs/2609.39111
- Referencia arXiv 2605.05806: https://arxiv.org/abs/2605.05806
