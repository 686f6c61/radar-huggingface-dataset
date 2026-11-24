# Narik67/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen
Narik67/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es una cuantización GGUF de un fine-tune multi-etapa del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, a su vez derivado de la familia Qwen (etiquetada internamente como qwen3_8, qwen3_6 y qwen3_5). El autor original del fine-tune es DavidAU; Narik67 publica únicamente los pesos cuantizados en formato GGUF, con variantes "regulares" y "MTP" (Multi-Token Prediction) generadas con imatrix dual (DI-MATRIX).

El modelo tiene 26.895.998.464 parámetros (~27B) según los safetensors del modelo base, con licencia Apache 2.0 y soporte declarado para 16 idiomas (incluido el español). Se presenta como un modelo "uncensored/abliterated" orientado a razonamiento con modo thinking, generación de código y escritura creativa, con una reducción declarada de tokens de pensamiento de entre 1/2 y 1/10 respecto al Qwen 3.8 27B estándar.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización de gran tamaño (repo de 492,8 GB) pensada para hardware de consumo; por otro, advierte de que las afirmaciones de rendimiento provienen exclusivamente de la model card del autor y no han sido verificadas de forma independiente. El pipeline declarado es image-text-to-text, aunque no se detallan módulos de visión en la información disponible.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen (etiquetas qwen3_8/qwen3_6/qwen3_5); variantes con Multi-Token Prediction (MTP); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: "Regular GGUF Quants" y "MTP GGUF Quants", con imatrix dual (DI-MATRIX); se mencionan Q4KS y 8 bit en la model card; lista completa de quants no disponible |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 492,8 GB); el modelo base en bfloat16/safetensors |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia Qwen (transformer decoder-only) y de la existencia de variantes con Multi-Token Prediction (MTP), que permiten predecir varios tokens por paso de decodificación. El modelo es el resultado de un pipeline multi-etapa ("multi-stage-tune", "multi-state-merge") aplicado por DavidAU sobre una base Qwen 3.8 de 27B, con métodos denominados "COLD FUSION" y "FABLE FUSION 711" y un ajuste específico para reducir el sobre-razonamiento y el consumo excesivo de tokens.

El entrenamiento declara el uso de los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, así como técnicas de "abliteration"/"heretic" para eliminar rechazos. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO. La cuantización la realiza Narik67 con imatrix dual (DI-MATRIX) sobre el modelo base, generando tanto quants regulares como MTP.

## Capacidades
- Generación de texto conversacional multi-turno y escritura creativa de ficción, relatos y roleplaying.
- Razonamiento con modo thinking explícito, optimizado para reducir el número de tokens de pensamiento (declarado entre 1/2 y 1/10 frente a Qwen 3.8 27B).
- Generación de código (etiquetas "coder" y "NEO-CODER" en el nombre y los tags).
- Capacidades multilingües en 16 idiomas, incluido el español.
- Comportamiento "uncensored"/"abliterated": ausencia declarada de rechazos en contenido sensible.
- Soporte declarado de tool calling/function calling, con referencias en la model card a resultados de terceros en la pestaña "community" (no verificables).
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Pipeline declarado image-text-to-text, aunque no se documentan módulos ni capacidades de visión concretas.

## Casos de uso
- Escritura creativa y ficción: generación de relatos, novelas y guiones con alto nivel de detalle, aprovechando el ajuste específico en "creative writing" y "all genres" y el modo thinking reducido para iterar rápido.
- Roleplaying y narrativa interactiva: conversaciones multi-turno con personajes consistentes, beneficiándose de la ausencia declarada de rechazos para tramas adultas o sensibles.
- Asistente de código en local: generación y revisión de código en un equipo con GPUs de consumo, usando los quants Q4 o 8 bit según VRAM disponible.
- Despliegue en estación de trabajo con GPU única: al ser GGUF, puede ejecutarse con llama.cpp u Ollama en hardware de consumo, sin depender de APIs externas.
- Prototipado de agentes con tool calling: integración en flujos que requieren llamadas a funciones, con la advertencia de que el soporte no está verificado de forma independiente.
- Experimentación en investigación sobre abliteration y reducción de tokens de razonamiento: comparar el comportamiento del modelo frente al Qwen 3.8 27B base en tareas de razonamiento.
- Generación de contenido multilingüe: traducción y redacción en los 16 idiomas declarados, con especial atención al español.

## Benchmarks y rendimiento
Los únicos datos disponibles provienen de la model card del autor y no han sido verificados de forma independiente. Se presentan tal cual, sin poder confirmar la metodología:

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bit) | 735 | "144 pts por encima de Qwen 3.8 27B" según el autor |
| ARC-C (4 bit) | 719 | Supera los 718 en 4 bit |
| ARC-E | >880 | Declarado |
| Comparación con Qwen 3.8 27B | Supera en los 7 benchmarks críticos | Según el autor |
| Comparación con Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B | Supera en los 7 benchmarks | Según el autor |

No se han publicado resultados de benchmarks verificables de MMLU, HumanEval, GSM8K u otros en la información disponible.

## Requisitos de hardware
- VRAM estimada: para ~27B en GGUF, orientativamente 16-18 GB en Q4, ~28-30 GB en 8 bit y ~54 GB en bf16; estas cifras son estimaciones por tamaño de parámetros y no aparecen en la información proporcionada.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, una RTX 4090 (24 GB) podría ejecutar quants Q4, y una A100 40/80 GB o H100 para 8 bit o bf16.
- Cabe en GPU de consumo: sí, en quants Q4 según el tamaño; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles; la model card afirma reducción de tokens de pensamiento, lo que implicaría menor latencia, pero sin cifras.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Narik67, GGUF) | ~27B | no disponible | Apache 2.0 | GGUF | Cuantización de un fine-tune uncensored de DavidAU |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | ~27B | no disponible | Apache 2.0 | safetensors/bf16 | Modelo base del que deriva esta cuantización |
| Qwen 3.8 27B (referencia del autor) | ~27B | no disponible | no disponible | no disponible | Base original; el autor afirma superarlo en 7 benchmarks |
| Qwen3.6-35B-A3B | 35B (A3B, MoE) | no disponible | no disponible | no disponible | Citado como superado por el autor |

Los datos de rendimiento comparativo proceden únicamente de la model card y no están verificados.

## Limitaciones y advertencias
- Las afirmaciones de rendimiento (ARC-C 735, superación de Qwen 3.8 27B en 7 benchmarks) provienen solo del autor y no han sido replicadas de forma independiente.
- Modelo "uncensored/abliterated": puede generar contenido sensible, ofensivo o inapropiado sin filtros; requiere moderación externa en producción.
- Riesgo de alucinación no cuantificado; no hay evaluaciones publicadas de fidelidad factual.
- Longitud de contexto no documentada; no se puede garantizar el manejo de contextos largos.
- El pipeline declarado image-text-to-text no está respaldado por documentación de módulos de visión; tratar con cautela.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets subyacentes podrían imponer condiciones adicionales no detalladas.
- Repo de 492,8 GB: la descarga y el almacenamiento de todas las variantes es costoso; conviene seleccionar solo el quant necesario.
- Sin descargas ni validación comunitaria en el momento de la ficha (0 descargas, 1 like), lo que reduce la evidencia sobre su calidad.
- El nombre y los tags incluyen términos de marketing ("AGI", "Turbo Brilliance 50x") sin respaldo técnico verificable.

## Enlaces
- Hugging Face (este repo): https://huggingface.co/Narik67/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Variante 27B Heretic v2: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Variante 27B no-Heretic v1: https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Variante 180B QNext Heretic v1: https://huggingface.co/DavidAU/Qwen3.8-Flash-Next-Abliterated-Uncensored-Turbo-Brilliance-50x-Reasoning-Instruct-GSQ-RCO-GGUF
- Variante 180B QNext no-Heretic v1: https://huggingface.co/DavidAU/Qwen3.8-Flash-Next-Turbo-Brilliance-50x-Reasoning-Instruct-GSQ-RCO-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
