# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ8e-1M

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ8e-1M es una release de servicio en precisión mixta para Apple Silicon del modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, un merge GAIN sobre la familia Qwen 3.8 de 27B. La publica Solstice-AI, que se encarga de la cuantización downstream, del escalado YaRN a 1.048.576 tokens y del empaquetado en formato MLX. El modelo base lo firma DavidAU.

El checkpoint está pensado para ejecución nativa en Metal sobre memoria unificada de Mac Studio y MacBook Pro, con cuantización mixta oQ8e calibrada por importance matrix y un cabezal de predicción multi-token (MTP) para decodificación especulativa. La arquitectura declarada es híbrida: un 75% de capas con atención linear GDN (Gated Delta Recurrent Network) de complejidad O(1) en memoria y un 25% con GQA global. El contexto nativo es de 262.144 tokens, extendido por YaRN con factor 4,0 hasta 1.048.576.

Su relevancia inmediata para un desarrollador es doble. Por un lado, ofrece contexto de un millón de tokens en hardware consumer de Apple, un nicho que hasta ahora exigía GPUs de centro de datos. Por otro, la model card declara una superioridad empírica sobre Claude Opus 4.6 Max en nueve disciplinas de evaluación, incluido SWE-bench Pro con 61,7%. Esas cifras proceden exclusivamente del autor y no han sido replicadas de forma independiente, por lo que conviene tratarlas como afirmaciones de parte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 75% capas de atención linear GDN (Gated Delta Recurrent Network) y 25% capas de GQA global; merge GAIN de pesos sobre Qwen 3.8 |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) mediante YaRN factor 4,0 sobre 262.144 tokens nativos |
| Tipos de cuantizacion | MLX oQ8e mixta (8 bits con asignación de bit-depth por capa calibrada por importance matrix); el modelo base dispone de otras variantes de cuantización no detalladas aquí |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx); repositorio de 30,0 GB |

## Arquitectura y entrenamiento

La arquitectura combina atención linear y atención cuadrática. El 75% de las capas usa bloques GDN con complejidad de memoria O(1), lo que permite sostener ventanas de un millón de tokens sin que el KV cache crezca de forma cuadrática. El 25% restante mantiene GQA global para preservar la fidelidad de recuperación en contextos largos. Sobre esa base, DavidAU aplica un merge de pesos GAIN (Guided Activation Interleaved Normalization) que, según la model card, combina los pesos de mayor calidad de razonamiento sin degradación. El checkpoint incorpora además una ablación de alineación del Proyecto Heretic, que elimina los vectores de rechazo del modelo original.

El escalado de contexto se implementa con YaRN: factor 4,0, `original_max_position_embeddings` de 262.144, `beta_fast` 32,0 y `beta_slow` 1,0, con `attention_factor` 1,0. La cuantización oQ8e se calibró con una importance matrix (`oq_imatrix_report.json`) que asigna profundidad de bits por capa según sensibilidad; el autor afirma preservar el 99,8% de la fidelidad FP16. El cabezal MTP integrado genera dos tokens por pase forward, con una aceleración declarada de 1,72× a 2,20× en Apple Silicon. No se han publicado datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO para el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de cadena de pensamiento (CoT) explícito, etiquetado como `reasoning` y `cot`.
- Programación y resolución de problemas de software, con soporte declarado para depuración de repositorios completos y flujos agénticos.
- Razonamiento científico y abstracción de nivel frontier, evidenciado por las puntuaciones ARC-C y ARC-E declaradas.
- Procesamiento de imagen y texto: el pipeline es `image-text-to-text`, por lo que acepta entradas multimodales.
- Seguimiento de restricciones complejas (IFBench) y workflows multi-archivo de horizonte largo (CoWorkBench).
- Control de sistemas operativos y autonomía en entornos móviles (OSWorld-Verified, AndroidWorld).
- Contexto largo de hasta 1.048.576 tokens, adecuado para corpus completos, bases de código y conversaciones extensas.
- Capacidades multilingües limitadas a inglés y chino.
- Sin alineación de rechazo (ablación Heretic), orientado a desarrollo de sistemas y seguridad ofensiva/defensiva.
- Decodificación especulativa nativa mediante cabezal MTP.

## Casos de uso

- Auditoría de bases de código completas: con 1M tokens de contexto, el modelo puede ingerir un monorepositorio entero o una colección de repositorios y responder preguntas transversales sobre dependencias, patrones y deuda técnica, sin necesidad de chunking ni recuperación externa.
- Depuración agéntica en CI/CD: la puntuación declarada de 79,0% en QwenSWEBench y 61,7% en SWE-bench Pro lo sitúan como candidato para pipelines que abren issues, localizan la causa raíz y propone parches verificables automáticamente.
- Automatización de escritorio y móvil: las cifras de OSWorld-Verified (84,3%) y AndroidWorld (81,9%) indican aptitud para agentes que operan interfaces gráficas, útiles en QA de aplicaciones y pruebas de regresión end-to-end.
- Análisis de documentación técnica extensa: contratos, normativas, especificaciones o manuales de varios centenares de miles de tokens pueden procesarse en una sola pasada, con preguntas de seguimiento que mantienen el contexto íntegro.
- Asistente de investigación científica: el rendimiento ARC-C declarado (735) y ARC-E (882) lo hacen adecuado para tareas de abstracción y razonamiento sobre literatura, con verificación posterior obligatoria por el riesgo de alucinación.
- Desarrollo de software ofensivo y defensivo autorizado: la ablación Heretic elimina rechazos, lo que resulta útil en red teaming, análisis de malware y revisión de superficies de ataque, siempre dentro de marcos legales y de autorización explícita.
- Despliegue local en Mac para equipos con requisitos de soberanía de datos: al ejecutarse en memoria unificada con MLX, permite mantener propiedad intelectual sensible fuera de infraestructura cloud.

## Benchmarks y rendimiento

Los resultados proceden exclusivamente de la model card del autor, evaluados bajo el harness de Claude Code con temperatura 1,0 y top_p 0,95, en ventanas de 256K y 1M tokens. No se han replicado de forma independiente.

| Suite | Enfoque | Qwen3.8-27B TURBO (Solstice-AI x DavidAU) | Claude Opus 4.6 Max | Margen |
|---|---|---|---|---|
| SWE-bench Pro | Ingeniería de software agéntica | 61,7% | 53,4% | +8,3% |
| LiveCodeBench v6 | Resolución de problemas en tiempo real | 90,3% | 88,8% | +1,5% |
| QwenSWEBench | Depuración de repositorio completo | 79,0% | 63,8% | +15,2% |
| OSWorld-Verified | Control de ordenador | 84,3% | 72,7% | +11,6% |
| AndroidWorld | Autonomía en SO móvil | 81,9% | 62,0% | +19,9% |
| IFBench | Seguimiento de restricciones complejas | 79,5% | 62,5% | +17,0% |
| CoWorkBench | Workflows multi-archivo de horizonte largo | 70,7% | 68,2% | +2,5% |
| ARC-C (Challenge) | Abstracción científica frontier | 735 (8 bits) / 719 (4 bits) | ~710–720 | Nivel frontier cerrado |
| ARC-E (Easy) | Razonamiento de sentido común | 882 | ~870 | Supera frontier cerrado |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras suites estándar en la información disponible.

## Requisitos de hardware

- El repositorio pesa 30,0 GB en formato MLX oQ8e. Para inferencia hacen falta aproximadamente 30 GB de memoria unificada solo para los pesos, más el KV cache y las activaciones; con contexto de 1M tokens, el consumo adicional puede ser considerable pese a la atención linear mayoritaria.
- Hardware objetivo: Apple Silicon con memoria unificada. Un Mac Studio con 64 GB o más y un MacBook Pro con 48–64 GB son los perfiles realistas para contexto largo. Para ventanas de 1M tokens completas se recomienda 96 GB o más.
- No está diseñado para GPUs NVIDIA; el formato MLX y el runtime Anvil dependen de Metal. En GPUs CUDA habría que reconvertir los pesos.
- Opciones de despliegue: MLX-LM y Anvil Runtime (Metal), ambos citados por el autor. vLLM, llama.cpp, Ollama y TGI no se mencionan como compatibles con este checkpoint concreto.
- Aceleración: cabezal MTP con decodificación especulativa de dos tokens por pase, con 1,72×–2,20× de speedup declarado en Apple Silicon. No se publican cifras absolutas de latencia ni de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B TURBO (este checkpoint) | 27,78B | 1.048.576 | Apache 2.0 | MLX oQ8e | Merge GAIN, ablación Heretic, MTP, orientado a Apple Silicon |
| Modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 27,78B (según descendiente) | No disponible en esta ficha | Apache 2.0 (según descendiente) | No disponible en esta ficha | Mismo merge sin cuantización MLX ni escalado YaRN específico |
| Claude Opus 4.6 Max | No disponible | No disponible | Propietaria | API cerrada | Referencia de comparación usada por el autor; pierde en 9 de 9 suites según sus datos |

No se dispone de datos verificados de otros modelos abiertos de tamaño comparable (por ejemplo, alternativas de 24–32B con contexto largo) en la información proporcionada.

## Limitaciones y advertencias

- Las cifras de benchmarks las publica el autor sin replicación independiente. Trátalas como afirmaciones de marketing hasta validarlas con tu propio harness.
- La ablación Heretic elimina los rechazos del modelo. Esto incrementa el riesgo de generar contenido dañino, ilegal o inseguro; requiere filtrado externo y políticas de uso claras en producción.
- Riesgo de alucinación no mitigado por alineación: sin capa de rechazo, el modelo puede afirmar con confianza datos falsos en dominios que no domina.
- Idiomas limitados a inglés y chino. El castellano no figura entre los idiomas declarados, por lo que la calidad en español no está garantizada.
- El contexto de 1M tokens depende de YaRN con factor 4,0; la degradación de recuperación en posiciones muy lejanas no está cuantificada en la información disponible.
- Dependencia de hardware Apple Silicon y del runtime MLX/Anvil. No hay soporte declarado para CUDA, vLLM o llama.cpp en este checkpoint.
- Consumo de memoria elevado: 30 GB de pesos más KV cache hacen inviable el contexto completo en equipos con menos de 64 GB de memoria unificada.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base y de los datasets subyacentes de Qwen.
- El nombre y las etiquetas del modelo (`beats-claude-opus-4.6`, `735-882`) incorporan afirmaciones promocionales; no las interpretes como resultados auditados.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ8e-1M
- Modelo base en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del merge (DavidAU): https://huggingface.co/DavidAU
- Runtime Anvil (Metal): https://github.com/Solstice-Labs/anvil
- Banner del proyecto: https://cdn-uploads.huggingface.co/production/uploads/67c2e844e0921a5410eec10a/Y5M42dCag2f7Fc6fDtV0Z.jpeg
- No se han encontrado en la búsqueda web papers, blogs o demos adicionales asociados a este checkpoint.
