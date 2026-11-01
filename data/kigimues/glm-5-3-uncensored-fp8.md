# kigimues/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es una modificación a nivel de pesos del modelo GLM-5.3 en su variante cuantizada a FP8 (publicada por JANGQ-AI a partir del original de zai-org). La desarrolla el colectivo dealignai bajo la etiqueta de release "CRACK", y su objetivo declarado es eliminar el comportamiento de rechazo (refusal) en un amplio espectro de categorías de daño multilingüe, sin recurrir a fine-tuning, LoRA ni hooks en tiempo de ejecución. El cambio consiste en una edición permanente en bf16 sobre los tensores "residual-writer", manteniendo intactos los expertos enrutados en FP8.

El modelo base es un transformer de tipo MoE con arquitectura propietaria `glm_moe_dsa` (DeepSeek-sparse attention), 753 329 940 480 parámetros totales y 78 capas, de modalidad únicamente texto. El repositorio ocupa 755,7 GB y se distribuye en safetensors. La relevancia actual radica en que ofrece velocidad nativa de tensor cores FP8 en hardware Hopper (H100/H200) y un despliegue directo con vLLM estándar, lo que lo hace atractivo para quienes necesitan el modelo sin filtros de rechazo en entornos de investigación.

La licencia declarada es MIT, heredada del modelo base, y soporta diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés. La ficha técnica disponible es limitada: no se documentan detalles de entrenamiento, número de tokens, composición del dataset ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) más allá de las evaluaciones internas de compliance y de la preservación de MMLU-logit que reporta el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (Mixture of Experts con DeepSeek-sparse attention), 78 capas, solo texto |
| Parámetros totales | 753 329 940 480 (753,3 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 131 072 tokens en configuración TP8 de referencia; hasta ~160K sin MTP; 1M no operativo en vLLM actual |
| Tipos de cuantización | FP8 (expertos enrutados); tensores residual-writer en bf16 |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con atención dispersa estilo DeepSeek (`glm_moe_dsa`), 78 capas y 753,3 B de parámetros totales. La variante FP8 mantiene los expertos enrutados en FP8 y solo modifica en bf16 los tensores residual-writer, lo que permite velocidad nativa de tensor cores FP8 en Hopper (H100/H200) sin recalcular los pesos de los expertos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

La modificación de "uncensoring" es una edición de pesos permanente en bf16 sobre los tensores residual-writer, sin fine-tuning, LoRA, hooks en tiempo de ejecución ni trucos de prompt. La versión v2 corrige un fallo de bucle de razonamiento que afectaba a ~2 % de los prompts más difíciles en v1 (contenido que colapsaba en repetición antes de emitir), a cambio de ~4 pp menos de TRUE_COMPLY global en HarmBench-320, aunque en la superficie de daño real (240 comportamientos sin copyright) v2 es superior a v1 (91,7 % frente a 85,9 % de TC en modo off). El modelo soporta decodificación especulativa MTP, aunque esta no funciona en vLLM estándar y solo se ha reportado operativa en el fork B12X sparse-MLA de ciprianveg (+48 % de decode en prompts de código).

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general en diez idiomas.
- Modo de razonamiento explícito (`<think>`) controlado mediante `reasoning_effort`, que solo honra los valores `"low"` y `"high"`; cualquier otro valor cae a `max` y no es posible desactivar el razonamiento.
- Tool calling / function calling nativo, con parser `glm47` y `--enable-auto-tool-choice` en vLLM.
- Soporte de agentes y razonamiento multi-paso, con recomendación de usar `reasoning_effort="low"` en bucles de herramientas sobre FP8.
- Capacidades multilingües en en, zh, ru, sr, hi, fr, es, ar, ko, ja.
- Comportamiento de rechazo reducido de forma amplia y multilingüe (no orientado a un dominio concreto), con 0 % de GARBAGE en HarmBench-320 en los modos off y max.
- Sin capacidades de visión ni audio: el modelo es solo texto.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar el comportamiento de rechazo y la superficie de daño de un LLM de 753 B sin filtros, con métricas de compliance documentadas (HarmBench-320) para comparar contra el base.
- Evaluación de robustez de clasificadores y guardrails: al generar contenido que otros modelos rechazan, sirve para probar sistemas de moderación y detectores de contenido dañino en producción.
- Atención al cliente automatizada multi-turno: con 131 072 tokens de contexto en TP8 y prefix caching habilitado, puede mantener conversaciones largas con historial extenso.
- Generación de código en pipelines de CI/CD: soporta tool calling y agentes, y con `reasoning_effort="low"` evita agotar el presupuesto de `max_tokens` dentro del bloque `<think>` en bucles de herramientas.
- Redacción y análisis multilingüe: cubre diez idiomas (incluido español) para tareas de traducción, resumen y generación de contenido en entornos con requisitos de cobertura lingüística amplia.
- Despliegue en clústeres Hopper con FP8: al ejecutarse con vLLM estándar en TP8 sobre 8× H200, aprovecha tensor cores FP8 para inferencia de alto rendimiento sin necesidad de conversión adicional.
- Estudio de fallos de razonamiento: la documentación de v2 sobre bucles y agotamiento de presupuesto permite analizar modos de fallo en modelos con thinking mode largo.

## Benchmarks y rendimiento

| Evaluación | Resultado | Referencia |
|---|---|---|
| MMLU-logit v2 (muestra de 1026 preguntas, 18 por asignatura) | 87,43 % (897/1026), +1,85 pp vs base | Base GLM-5.3-regular: 85,58 % |
| MMLU-logit v1 (referencia) | 87,72 %, +2,14 pp vs base | — |
| HarmBench-320, effort off, TRUE_COMPLY | 261/320 (81,6 %) | SOFT_REFUSE 5,9 %, REDIRECT 6,9 %, HARD_REFUSE 0 %, GARBAGE 0 %, UNK 5,6 % |
| HarmBench-320, effort max, TRUE_COMPLY | 254/320 (79,4 %) | SOFT_REFUSE 4,7 %, REDIRECT 7,2 %, HARD_REFUSE 0 %, GARBAGE 0 %, UNK 8,8 % |
| HarmBench-320 no-copyright (240 comportamientos), effort off, TRUE_COMPLY | 220/240 (91,7 %) | SOFT_REFUSE 1/240 |
| HarmBench-320 no-copyright v1 (referencia), effort off | 85,9 % TRUE_COMPLY | — |

No se han publicado resultados de benchmarks estándar (HumanEval, GSM8K, MMLU oficial, etc.) en la información disponible. Las cifras de MMLU corresponden a una evaluación logit sobre muestra estratificada, no al benchmark oficial completo. En la comparación por asignatura, la media de delta por asignatura es -0,29 pp y solo `high_school_european_history` se movió más de una pregunta (94,4→83,3, -11,1 pp = 2 preguntas).

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 755,7 GB en safetensors FP8; la inferencia requiere agregar KV cache y overhead, por lo que en la práctica se necesita un clúster multi-GPU.
- Configuración de referencia del autor: TP8 sobre 8× H200 (DGX Spark GB10 probado por @0xMagnus), con `--gpu-memory-utilization 0.90`, `--enforce-eager`, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`.
- No cabe en GPU de consumo (RTX 4090, etc.) por el tamaño del modelo.
- Despliegue: vLLM estándar (recomendado por el autor); MTP solo funciona en el fork B12X sparse-MLA de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`.
- Límites prácticos: techo de ~131K de contexto con MTP y ~160K sin MTP en TP8 sobre H200; el contexto de 1M vía decode-context-parallel está cerrado en `glm_moe_dsa` por incompatibilidad de page size en `fp8_ds_mla`.
- Latencia y throughput: no disponibles, salvo el dato de +48 % de decode en prompts de código con MTP en el fork B12X.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-5.3-UNCENSORED-FP8 (este) | 753,3 B | 131K (TP8) | MIT | Uncensored vía edición de pesos, FP8, solo texto |
| zai-org/GLM-5.3 (base) | 753,3 B | no disponible | no disponible | Modelo original sin modificar; MMLU-logit 85,58 % |
| JANGQ-AI/GLM-5.3-FP8 | 753,3 B | no disponible | no disponible | Cuantización FP8 del base, sin uncensoring |
| dealignai/GLM-5.3-CYBERSECURITY-FP8 | no disponible | no disponible | no disponible | Variante enfocada a ciberseguridad del mismo colectivo |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo elimina deliberadamente el comportamiento de rechazo en categorías de daño amplias; su uso en producción conlleva riesgos legales y de seguridad y no es apto para aplicaciones dirigidas al público sin guardrails externos.
- Riesgo elevado de generar contenido dañino, incluido material con copyright, química de armas y exploits; la model card documenta explícitamente estos vectores.
- El modo de razonamiento no se puede desactivar: `reasoning_effort` solo acepta `"low"` y `"high"`, y cualquier otro valor cae a `max`.
- En FP8 con `reasoning_effort` en `high`/`max`, el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta; se recomienda `max_tokens ≥ 8000` en esos modos.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`.
- MTP no es funcional en vLLM estándar; el contexto de 1M no está operativo en vLLM actual para esta arquitectura.
- Sesgos conocidos: no documentados en la información disponible, más allá de la cobertura de diez idiomas y la ausencia de evaluación específica de sesgo.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero la naturaleza del modelo (uncensored) puede incumplir políticas de plataformas y normativas locales.
- El autor reporta que v2 baja ~4 pp de TRUE_COMPLY global en HarmBench-320 respecto a v1, aunque mejora en la superficie de daño sin copyright.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kigimues/GLM-5.3-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 de referencia: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante de ciberseguridad: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Organización dealignai: https://huggingface.co/dealignai
- Discusión de notas de runtime (8× DGX Spark GB10): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil de @0xMagnus: https://huggingface.co/0xMagnus
- Twitter de dealignai: https://twitter.com/dealignai
