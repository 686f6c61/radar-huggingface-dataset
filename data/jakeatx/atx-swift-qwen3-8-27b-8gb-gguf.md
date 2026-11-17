# jakeatx/ATX-Swift-Qwen3.8-27B-8GB-GGUF

## Resumen

ATX-Swift-Qwen3.8-27B-8GB-GGUF es una compresión extrema del modelo base Qwen/Qwen3.8-27B, publicada por el autor jakeatx bajo licencia Apache 2.0. El objetivo declarado es conseguir que un modelo de aproximadamente 24.500 millones de parámetros funcione en GPUs consumer de 8 GB de VRAM manteniendo activada la decodificación especulativa MTP (multi-token prediction) y una ventana de contexto de 204.800 tokens. La compresión se realiza mediante llamAmpere, una herramienta propietaria del mismo autor que combina atención LSA (Linear Sparse Attention) con KV cache offloaded a host.

La ficha resulta relevante porque representa un caso de compresión agresiva de un transformer denso de gran tamaño (no MoE, según el dato real de safetensors: 24.564.696.064 parámetros totales) para hardware de gama baja. El repositorio incluye varios ficheros sidecar (lsa-qwen38-27b-d2048.gguf, mtp-dm.gguf, head-ait2.gguf, head-exact-f16.gguf) que actúan como índices de atención, overlays de draft y cabezas de rescoring, y que deben mantenerse en la misma carpeta que el GGUF principal.

El modelo es, en la práctica, una distribución experimental: no hay pipeline definido, no declara idiomas soportados y no publica benchmarks propios más allá de métricas de drift (KLD) y una comparación direccional en LiveCodeBench v6. Su uso en producción requiere la versión llamAmpere 0.7, que según la model card «coming, not yet released» en el momento de publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B), con LSA (Linear Sparse Attention) y MTP speculative decoding aplicados por llamAmpere |
| Parametros totales | 24.564.696.064 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 204.800 tokens en la variante de 8 GB |
| Tipos de cuantizacion | Compresión llamAmpere propietaria (no se especifica bpw exacto para 8 GB); GGUF |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con sidecars GGUF auxiliares) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de aproximadamente 24.500 millones de parámetros. Sobre él, llamAmpere aplica una compresión que combina tres mecanismos: (1) atención LSA con índice de mapa en `lsa-qwen38-27b-d2048.gguf` (dimensión 2048), (2) KV cache offloaded a host, y (3) decodificación especulativa MTP con overlays de draft (`mtp-dm.gguf`, `head-ait2.gguf`) y una cabeza de rescoring exacta en FP16 (`head-exact-f16.gguf`). No se documenta en la model card el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), por lo que esos datos deben consultarse en la model card original de Qwen/Qwen3.8-27B.

La innovación técnica destacable es la combinación de atención lineal-dispersa con speculative decoding para mantener contexto largo en VRAM muy limitada. Según la tabla de la model card, la variante de 12 GB alcanza 262.144 tokens con MTP activo y un pico medido de 11.544 MiB, mientras que la variante de 8 GB alcanza 204.800 tokens con un pico de 7.506 MiB. El autor afirma que, con atención estándar, la receta UD-Q2_K_XL de Unsloth no puede ejecutar contexto completo con MTP en una tarjeta de 12 GB, mientras que su fichero sí.

## Capacidades

- Generación de texto conversacional (tag `conversational` en el repo).
- Razonamiento y resolución de problemas, heredados del modelo base Qwen3.8-27B.
- Generación de código, con resultados direccionales en LiveCodeBench v6 (89 % en la variante de 12 GB frente a 90,3 % del BF16 publicado por Qwen).
- Contexto largo: hasta 204.800 tokens en la variante de 8 GB, útil para RAG y agentes con historial extenso.
- Decodificación especulativa MTP activada, con overlays de draft dedicados.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- RAG con contexto largo en hardware consumer: el modelo permite procesar hasta 204.800 tokens en una GPU de 8 GB, lo que encaja en pipelines de recuperación aumentada con muchos documentos concatenados, siempre que se use llamAmpere 0.7 con KV offloaded.
- Asistencia de código en estaciones de trabajo modestas: con un rendimiento direccional de 89 % en LiveCodeBench v6 (un seed, no significativo estadísticamente), puede emplearse para autocompletar y revisar código en entornos sin GPUs de datacenter.
- Agentes multi-paso con historial largo: la combinación de contexto extendido y MTP permite mantener trazas de agente largas sin truncar, reduciendo el coste de recompresión de contexto.
- Evaluación de compresión extrema: el fichero sirve como referencia para investigadores que quieran medir drift (KLD 0,0270 en 12 GB; 0,0593 en la variante 2,3 bpw de 10 GB) frente a recetas estándar como UD-Q2_K_XL de Unsloth.
- Despliegue en entornos con VRAM limitada y sin presupuesto de nube: útil para prototipos, demos y pruebas internas en tarjetas de 8-12 GB.
- Generación de respuestas más cortas: según la model card, la variante de 12 GB consumió un 33 % menos tokens que UD-Q2_K_XL en LiveCodeBench v6 (mediana 4.608 vs 8.932), lo que puede reducir coste en pipelines de generación iterativa.
- Inferencia con decodificación especulativa: apropiado para escenarios donde la latencia importa y se dispone de los sidecars MTP y la cabeza de rescoring exacta.

## Benchmarks y rendimiento

Datos publicados en la model card (todos comparados contra Swift 1.5 BF16 como teacher, sobre 16.200 posiciones de coding, agentic y RAG a ~12K contexto):

| Fichero | Tamano | KLD (menor mejor) | Top-1 |
|---|---:|---:|---:|
| ATX 12 GB | 11,24 GB | 0,0270 | 95,98 % |
| Unsloth UD-IQ3_XXS | 10,93 GB | 0,0396 | 95,33 % |
| Unsloth UD-Q2_K_XL | 9,95 GB | 0,0591 | 94,00 % |
| ATX AI2 2,3 bpw (10 GB) | 9,14 GB | 0,0593 | 94,06 % |
| Mirai S | no disponible | 0,0745 | no disponible |

LiveCodeBench v6 (mismos 100 problemas, grader estricto, un solo seed, direccional):

| Modelo | Score |
|---|---:|
| ATX 12 GB | 89 % |
| UD-Q2_K_XL (llamAmpere) | 87 % |
| Qwen BF16 publicado | 90,3 % |

No se han publicado resultados de benchmarks para la variante de 8 GB en la información disponible. Los datos de 12 GB y 10 GB se incluyen porque comparten teacher y metodología, pero no deben extrapolarse directamente al fichero de 8 GB.

## Requisitos de hardware

- VRAM estimada para la variante de 8 GB: pico medido de 7.506 MiB con MTP activo y contexto de 204.800 tokens.
- VRAM estimada para la variante de 12 GB: pico medido de 11.544 MiB con MTP activo y contexto de 262.144 tokens.
- GPU recomendadas: tarjetas Ampere consumer de 8, 10 y 12 GB (el repo está taggeado `ampere`); no se especifican modelos concretos (RTX 3060 12 GB, RTX 3080 10 GB, RTX 4060 Ti 8 GB son candidatas por VRAM, pero no se confirman en la información disponible).
- Cabe en GPU consumer: sí, en tarjetas de 8 GB o más, siempre que se use llamAmpere 0.7.
- Opciones de despliegue: llama-server de llamAmpere 0.7 con `--preset 8dense` (8 GB) o `--preset 12dense` (12 GB); no se documenta soporte para vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card indica que la variante de 12 GB genera respuestas un 33 % más cortas en LiveCodeBench v6, lo que indirectamente reduce tiempo total de generación, pero no se publican tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD | Top-1 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| ATX-Swift-Qwen3.8-27B-8GB | 24,56 B | 204.800 | no disponible (8 GB) | no disponible (8 GB) | Apache 2.0 | HF (repo jakeatx) |
| ATX 12 GB (mismo autor) | 24,56 B | 262.144 | 0,0270 | 95,98 % | Apache 2.0 | HF (repo jakeatx) |
| Unsloth UD-Q2_K_XL | 24,56 B | no disponible | 0,0591 | 94,00 % | Apache 2.0 (hereda de Qwen) | HF (Unsloth) |
| Unsloth UD-IQ3_XXS | 24,56 B | no disponible | 0,0396 | 95,33 % | Apache 2.0 (hereda de Qwen) | HF (Unsloth) |
| Qwen3.8-27B BF16 | 24,56 B | no disponible | 0 (referencia) | no disponible | Apache 2.0 | HF (Qwen) |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de alternativas de otros fabricantes con datos publicados en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de software propietario: los ficheros de 8 y 12 GB requieren llamAmpere 0.7, que según la model card aún no estaba publicado en el momento de la subida. Sin esa versión, los `--preset` no funcionan.
- Drift de compresión: la variante de 8 GB no publica KLD ni Top-1; la de 12 GB tiene KLD 0,0270, superior al BF16 (0) y comparable a recetas de Unsloth. En 8 GB el drift será previsiblemente mayor, aunque no se documenta.
- Benchmarks direccionales: el 89 % en LiveCodeBench v6 proviene de un único seed y el propio autor lo describe como «not statistically significant».
- Idiomas: no declarados; no se puede garantizar calidad multilingüe.
- Tool calling, visión y audio: no confirmados en la información disponible; asumir ausencia hasta verificación.
- Riesgo de alucinación: inherente a modelos de 24 B comprimidos; sin datos específicos de evaluación de factualidad.
- Sesgos: no documentados por el autor; deben evaluarse contra el modelo base Qwen3.8-27B.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base Qwen/Qwen3.8-27B por si impone condiciones adicionales (no detalladas en la información disponible).
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline definido; tratar como artefacto experimental más que como release estable.
- Integridad: los SHA-256 de los cinco ficheros están publicados en la model card; verificar antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jakeatx/ATX-Swift-Qwen3.8-27B-8GB-GGUF
- Variante de 10 GB (2,3 bpw): https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Recetas Unsloth UD (referencia de comparación): no disponible enlace directo en la información proporcionada
- llamAmpere 0.7 (herramienta de despliegue): no disponible enlace en la información proporcionada
