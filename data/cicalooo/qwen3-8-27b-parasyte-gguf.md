# cicalooo/Qwen3.8-27B-Parasyte-GGUF

## Resumen

Qwen3.8-27B-Parasyte-GGUF es una familia de cuantizaciones GGUF de alta precisión creada por el usuario cicalooo a partir del modelo HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive, una variante sin censura basada en Qwen3.8 de 27 mil millones de parámetros. El objetivo del proyecto, bautizado como "Parasyte", es acercar la calidad de una cuantización Q6_K_P (el "reference brain", 24,14 GiB) a usuarios con GPUs de 24-32 GB de VRAM, reduciendo el tamaño del archivo sin pérdida perceptible de calidad.

La familia incluye cuatro variantes (Parasyte, Parasyte-Mid, Parasyte-Low y old/Parasyte-Low) de entre 21,72 y 23,07 GiB, que asignan el presupuesto de precisión de forma selectiva: los tensores sensibles (atención, estado SSM, normas, LM head y embeddings) se mantienen en Q8_0/F32, mientras que la masa de las FFN se comprime a Q5_K o Q4_K. Según las mediciones de perplejidad publicadas por el autor, Parasyte-Mid iguala la perplejidad de la referencia Q6_K_P con 1,4 GiB menos, y Parasyte la iguala dentro de los márgenes de error con 1,07 GiB menos.

Es relevante para usuarios locales que buscan un modelo de 27B sin filtros con arquitectura híbrida (incluye bloques DeltaNet/SSM y un bloque MTP de predicción multi-token) que quepa en una RTX 3090/4090 de 24 GB sin sacrificar demasiada precisión respecto a cuantizaciones superiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con bloques SSM/DeltaNet y bloque MTP (nextn) integrado |
| Parametros totales | 27.320.697.856 (27,321 B, 866 tensores) |
| Parametros activos | no disponible (no hay evidencia de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, F32, Q6_K, Q5_K, Q4_K (combinación selectiva por tensor; bpw efectivo 6,72-7,25) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requantizado desde Q8_K_P con imatrix) |

## Arquitectura y entrenamiento

Este repositorio no contiene pesos originales entrenados: es una requantización del archivo `Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf` (31,5 GiB), que a su vez deriva de Qwen3.8-27B con un ajuste "uncensored agresivo" de HauhauCS. El proceso usa `llama-quantize` con `--allow-requantize`, una matriz de importancia (imatrix) construida sobre un corpus reservado, y un fichero de tipos de tensor que fija explícitamente los 866 tensores.

La innovación principal es la asignación selectiva de precisión. La distribución resultante por variante es: FFN gate/up (130 tensores, 17,38 B parámetros, 64 % del total) en Q5_K (Parasyte/Parasyte-Mid) o Q4_K (variantes Low); FFN down en Q8_0; atención (263 tensores, 5,81 B) en Q8_0/F32; estado SSM y proyecciones (336 tensores, 1,54 B) mayoritariamente en F32; token_embd en Q8_0 (variantes altas) o Q6_K (Mid); LM head y normas en Q8_0/F32. Las dos "mejoras" de la receta final son: subir token_embd de Q6_K a Q8_0 (+0,31 GiB) y los 48 tensores `ssm_beta` (un modulador multiplicativo en el camino DeltaNet) de Q5_K a F32, ya que su pérdida de precisión apenas afecta a la perplejidad en contexto corto pero puede acumularse en seguimiento de estado a contexto largo. El autor verifica experimentalmente que esta asignación supera a redistribuciones alternativas (por ejemplo, subir attn_gate medía peor: +0,014 in-domain).

Sobre el modelo base Qwen3.8-27B en sí (tokens de preentrenamiento, composición del dataset, RLHF/DPO), la información no está disponible en esta model card.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Modelo "uncensored": sin los filtros de alineación del modelo original, apto para contenido sin restricciones (con los riesgos que ello implica).
- Bloque MTP (nextn) integrado: soporta predicción multi-token para decodificación especulativa en llama.cpp, mejorando el throughput.
- Arquitectura híbrida con bloques SSM/DeltaNet, pensada para un seguimiento de estado más eficiente a contexto largo (según el autor, sensible a la precisión de ssm_beta).
- Capacidades de código, razonamiento o matemáticas: no disponibles (no documentadas en la model card; heredadas presumiblemente del modelo base Qwen3.8).
- Tool calling / function calling: no disponible (no documentado).
- Idiomas soportados: no disponible.

## Casos de uso

- Chatbot local sin censura en GPU de consumo: con ~23 GiB, Parasyte cabe en una RTX 3090/4090 de 24 GB con contexto moderado, ofreciendo calidad cercana a Q6_K_P para roleplay y conversación sin filtros.
- Escritura creativa y roleplay de larga duración: la precisión extra en token_embd y ssm_beta busca preservar la coherencia en sesiones largas donde la degradación acumulada de estado importa.
- Pruebas de contexto largo en hardware local: la arquitectura DeltaNet/SSM con estado en F32 está orientada a mantener seguimiento de estado en secuencias extensas, útil para resumir documentos largos localmente (longitud de contexto exacta no disponible).
- Benchmarking de cuantizaciones: la model card documenta metodología de perplejidad reproducible (llama.cpp, imatrix, corpus in-domain y wikitext-2), útil para quien investigue técnicas de requantización selectiva.
- Despliegue en servidores de inferencia con llama.cpp: formato GGUF con endpoints compatibles, adecuado para montar una API local tipo OpenAI con llama-server.
- Experimentación con decodificación especulativa: el bloque MTP (nextn) integrado permite probar multi-token prediction en llama.cpp para reducir la latencia en local.

## Benchmarks y rendimiento

No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El autor sí publica mediciones de perplejidad con llama.cpp:

**Epoch A (2026-10-19):**

| Modelo | Tamaño | PPL in-domain | PPL wikitext-2 |
|---|---|---|---|
| Parasyte-Mid | 22,75 GiB | 3,3795 | 6,9113 |
| old/Parasyte-Low | 21,40 GiB | 3,8175 (estimación conservadora, ver nota) | 6,4911 |
| HauhauCS Q6_K_P (referencia) | 24,14 GiB | 3,4161 | 6,9002 |
| HauhauCS Q5_K_P (stock) | ~20,4 GiB | no disponible | no disponible |

**Epoch B (2026-10-20):**

| Modelo | Tamaño | PPL in-domain | PPL wikitext-2 |
|---|---|---|---|
| Parasyte | 23,07 GiB | 3,3831 | 6,9119 |
| HauhauCS Q6_K_P (control) | 24,14 GiB | 3,3795 | 6,9113 |

Conclusiones del autor: Parasyte-Mid iguala o mejora marginalmente la perplejidad de Q6_K_P siendo 0,44 bpw más ligero (1,4 GiB menos) y 1,23 bpw más denso que el Q5_K_P stock; Parasyte la iguala dentro de los márgenes de error (±0,031 / ±0,051) siendo 1,07 GiB más pequeño. Nota: la perplejidad de old/Parasyte-Low es la media de per-chunk PPL, que sobreestima, por lo que debe leerse como cota superior. Parasyte-Low no tiene run propio de PPL: es un injerto byte a byte de los tensores sensibles de Parasyte sobre old/Parasyte-Low (866/866 tensores verificados por sha256).

## Requisitos de hardware

- VRAM estimada para inferencia: 21,7-23,1 GiB solo de pesos según variante (Parasyte 23,07 GiB; Parasyte-Mid 22,75 GiB; Parasyte-Low 21,72 GiB; old/Parasyte-Low 21,40 GiB), más KV-cache/estado SSM y overhead de contexto.
- GPUs recomendadas: RTX 3090, RTX 4090 o RTX 5090 (24 GB) para offload completo con contexto moderado; GPUs de 32 GB (RTX 5090 de 32 GB, V100 32 GB, Tesla P40 x2) para más margen; con offload parcial a CPU funciona en equipos con 32 GB de RAM y GPU menor.
- Cabe en GPU de consumo: sí, específicamente diseñado para el segmento de 24-32 GB; en una RTX 4090 de 24 GB la variante Parasyte deja poco margen para contexto grande, por lo que Parasyte-Low puede ser preferible allí.
- Despliegue: llama.cpp (llama-server/llama-cli) es el objetivo principal; compatible con Ollama, LM Studio y cualquier runtime GGUF. No hay evidencia de soporte en vLLM/TGI para estos GGUF híbridos con MTP.
- Latencia y throughput: no disponibles; el bloque MTP (nextn) integrado sugiere aceleración por decodificación especulativa en llama.cpp, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tamaño archivo | bpw | PPL in-domain | PPL wikitext-2 | Licencia |
|---|---|---|---|---|---|
| Parasyte (este) | 23,07 GiB | 7,25 | 3,3831 | 6,9119 | Apache 2.0 |
| Parasyte-Mid (este) | 22,75 GiB | 7,15 | 3,3795 | 6,9113 | Apache 2.0 |
| HauhauCS Q6_K_P (referencia) | 24,14 GiB | no disponible | 3,3795-3,4161 | 6,9002-6,9113 | no disponible |
| HauhauCS Q5_K_P (stock) | ~20,4 GiB | no disponible | no disponible | no disponible | no disponible |

Frente a alternativas de la misma categoría de tamaño (27-32B uncensored en GGUF, como variantes de Qwen3-32B abliteradas u otras), no hay datos comparativos publicados en la model card: no disponible.

## Limitaciones y advertencias

- Modelo "uncensored": carece de salvaguardas de seguridad del modelo original. Su uso para generar contenido dañino, ilegal o engañoso es responsabilidad exclusiva del usuario; no es apto para entornos de producción orientados a público general sin capas de moderación propias.
- Riesgo de alucinación: inherente a cualquier LLM y agravado por la falta de documentación de alineación del ajuste "aggressive" de HauhauCS; no disponible información sobre evaluaciones de veracidad.
- Es una requantización de una requantización (desde Q8_K_P con `--allow-requantize`), lo que puede introducir degradación acumulada frente a una cuantización directa desde los pesos originales; el autor mitiga esto con imatrix, pero es un caveat técnico real.
- La perplejidad no garantiza calidad en tareas de razonamiento, código o instrucciones: no hay benchmarks de capacidades publicados.
- Longitud de contexto, idiomas soportados y capacidades exactas del modelo base: no disponibles en la documentación.
- Licencia Apache 2.0: permite uso comercial, pero hay que verificar la licencia y los términos del modelo base Qwen3.8 y del ajuste de HauhauCS, no disponibles aquí.
- La model card incluye direcciones de donación (Monero, Throne): contenido de terceros sin relación con la calidad del modelo.
- El proyecto es de un autor individual, con descargas modestas (807) y sin verificación comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cicalooo/Qwen3.8-27B-Parasyte-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive
- Campaña de soporte del autor (Throne): https://throne.com/plaguekind/item/073bace1-2e1a-4492-95e6-024b4da6459b
