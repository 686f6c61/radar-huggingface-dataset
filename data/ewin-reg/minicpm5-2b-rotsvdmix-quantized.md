# ewin-reg/MiniCPM5-2B-RotSVDMix-Quantized

## Resumen

MiniCPM5-2B-RotSVDMix-Quantized es una cuantización post-entrenamiento experimental del modelo openbmb/MiniCPM5-2B, publicada por el usuario ewin-reg. No es un modelo nuevo: es un checkpoint de 2,62 mil millones de parámetros al que se le aplica una pila de tres técnicas —rotaciones ortogonales de Sylvester-Hadamard absorbidas en los pesos, residuales SVD de rango 16 al estilo LoftQ y cuantización affine agrupada de 4 bits— con el objetivo de reducir el peso en disco de 4,69 GB (FP16) a 1,37 GB.

La relevancia del artefacto es de ingeniería, no de capacidades: demuestra que es posible empaquetar un transformer de ~2,6 B bajo la barrera de los 2,0 GB manteniendo un 95,53% de similitud de coseno en los logits y un 76% de coincidencia en el token top-1 respecto al modelo FP16 original. Está etiquetado explícitamente para despliegue edge y móvil (Snapdragon NPU, Apple Neural Engine, APU de MediaTek) y se distribuye con licencia Apache 2.0.

La contrapartida es medible y está documentada por el propio autor: la perplejidad en WikiText-2 sube un 12,88% (de 20,47 a 23,10) y el error de reconstrucción de pesos promedia el 8,54%. El repositorio no publica resultados en benchmarks de tareas (MMLU, HumanEval, GSM8K) ni especifica la longitud de contexto soportada, por lo que la evaluación disponible se limita a métricas de fidelidad de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (tag `llama`); cuantización post-entrenamiento de 3 capas apiladas: rotaciones Hadamard + residuales SVD rango 16 (LoftQ) + INT4 affine agrupada |
| Parámetros totales | 2.624.759.808 (2,62 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT4 (4 bits, affine agrupada) con residuales FP16 de rango 16; checkpoint mixto INT4+FP16 en safetensors |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 1.565 tensores) |
| Dimensiones internas (según tablas de la model card) | 42 capas, dimensión oculta 2048, dimensión intermedia MLP 6144, vocabulario 130.560 |
| Tamaño del modelo cuantizado | 1,37 GB (1.406,5 MB) |
| Tamaño del base FP16 | 4,69 GB (4.806 MB) |
| Tamaño del repositorio | 1,5 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Modelo base | openbmb/MiniCPM5-2B |
| Fecha de creación | 2026-09-16 |
| Última actualización | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado ni fine-tuneado: es una cuantización post-entrenamiento. La model card describe una pila de tres capas. La primera aplica matrices ortogonales de Sylvester-Hadamard precalculadas y absorbidas de forma offline en los pesos y en las capas de normalización (`W_rot = W·H^T`, `X_rot = X·H`), sin coste de latencia en tiempo de inferencia. Se usan tres tamaños según la posición: H_2048 sobre las activaciones ocultas, H_128 por cabeza de atención y H_6144 sobre la dimensión intermedia del MLP. Los errores de ortonormalidad reportados son 3,13e-6 (H_2048), 6,90e-7 (H_128) y 5,42e-6 (H_6144).

La segunda capa resuelve un problema espectral alternante, `min ||W - (Q + A·B^T)||²`, donde Q es la matriz base cuantizada a 4 bits y A·B^T es un residual FP16 de rango 16 calculado mediante SVD alternante (esquema tipo LoftQ), de modo que el error de cuantización no se propaga directamente a los logits. La tercera capa asigna precisión mixta según la sensibilidad de cada tensor. No se documenta ningún proceso de RLHF, DPO o ajuste fino posterior, ni la composición del dataset de entrenamiento del modelo base: esa información no está disponible en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional en inglés y chino, con pipeline `text-generation` y compatibilidad declarada con `text-generation-inference` y endpoints compatibles.
- Ejemplos de uso publicados por el autor: explicación divulgativa de conceptos técnicos (entrelazamiento cuántico) y resumen de propósito de documentos (función de una factura en contabilidad).
- Fidelidad medida respecto al modelo FP16: 95,53% de similitud de coseno media en logits, 0,1727 de divergencia KL media y 84% de solapamiento en el top-5 de tokens candidatos sobre 25 prompts diversos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo de razonamiento extendido: no disponibles en la información proporcionada.
- Etiquetas declaradas por el autor para despliegue en NPU de Snapdragon, Apple Neural Engine y APU de MediaTek; el repositorio solo empaqueta safetensors, sin artefactos específicos para esas plataformas.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones móviles: con 1,37 GB en disco, el checkpoint cabe en el almacenamiento de un teléfono de gama media y permite generar respuestas sin conexión, útil para escenarios con latencia de red o requisitos de privacidad.
- Investigación en cuantización extrema: el repositorio publica `real_benchmark_results.json` y `scorecard.json` con datos brutos medidos en una Tesla T4, lo que permite reproducir y comparar la técnica Rot-SVD-Mix frente a otras estrategias (GPTQ, AWQ, QuaRot) sobre el mismo modelo base.
- Resumen y reformulación de documentos cortos en local: para textos de entrada moderada y salidas breves, donde el incremento de perplejidad del 12,88% es tolerable frente al ahorro de memoria.
- Preprocesado de texto en pipelines edge: normalización de consultas, clasificación de intención o extracción de entidades antes de delegar en un modelo mayor alojado en la nube, reduciendo coste de tokens.
- Aplicaciones bilingües inglés-chino: asistentes de atención en mercados donde se combinan ambos idiomas, aprovechando que son los dos únicos idiomas declarados.
- Prototipado de cuantización con LoftQ sobre arquitecturas pequeñas: el desglose de error de Frobenius por grupo de capas (atención 8,37%, MLP 8,75%, embeddings 8,83%, cabeza LM 9,25%) sirve como referencia para calibrar rangos de residuales en otros modelos.
- Despliegue en hardware con memoria unificada limitada (SBC, portátiles de gama baja): los 4,69 GB del base FP16 lo hacen inviable en muchos de estos equipos, mientras que el empaquetado de 1,37 GB sí es transportable.

## Benchmarks y rendimiento

Perplejidad en WikiText-2 (`wikitext-2-raw-v1` test, longitud de secuencia 512, 10.240 tokens), medida en NVIDIA Tesla T4:

| Variante | Cross-entropy | Perplejidad | Delta vs FP16 |
|---|---|---|---|
| openbmb/MiniCPM5-2B (FP16 nativo) | 3,0188 | 20,47 | Línea base |
| ewin-reg/MiniCPM5-2B-RotSVDMix | 3,1399 | 23,10 | +12,88% (+2,63 PPL) |

Concordancia de logits sobre 25 prompts diversos:

| Métrica | Resultado medido |
|---|---|
| Similitud de coseno media en logits | 95,53% |
| Divergencia KL media | 0,172717 |
| Coincidencia del token top-1 | 76,0% (19/25) |
| Solapamiento en el top-5 | 84,0% (21/25) |

Error de Frobenius relativo en reconstrucción de pesos:

| Grupo de capas | Subcapas evaluadas | Error relativo |
|---|---|---|
| Self-attention (q, k, v, o) | 42 capas | 8,37% |
| MLP (gate, up, down) | 42 capas | 8,75% |
| Embeddings de tokens (130.560 × 2048) | — | 8,83% |
| Cabeza del modelo de lenguaje | — | 9,25% |
| Media ponderada del modelo completo | Todas las 42 capas + cabezas | 8,54% |

No se han publicado resultados en benchmarks de tareas (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la información disponible.

## Requisitos de hardware

- Peso en disco del checkpoint: 1,37 GB (INT4+FP16 safetensors); el modelo base FP16 ocupa 4,69 GB.
- La model card indica que las evaluaciones se realizaron sobre el modelo dequantizado, por lo que en inferencia vía transformers sobre GPU convencional la huella en VRAM se aproximará a la del modelo FP16 (unos 4,7 GB) más el overhead de activaciones y caché KV. El beneficio medido y documentado es de almacenamiento y transporte, no de VRAM en runtime.
- VRAM estimada para contexto corto: 5-7 GB en FP16 dequantizado (estimación derivada del tamaño del modelo; no publicada por el autor).
- GPU utilizada en las mediciones: NVIDIA Tesla T4 con 14,56 GB de VRAM.
- GPU consumer: el modelo dequantizado en FP16 cabe en tarjetas de 8 GB o más (RTX 3060 Ti, 4060 Ti 16 GB, 4070, 4080, 4090). En tarjetas de 6 GB el margen es muy ajustado y depende del backend.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `endpoints_compatible`) y endpoints compatibles. No se incluye checkpoint GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia no documentada.
- Latencia y throughput: no disponibles. La model card no reporta tokens por segundo ni tiempos de generación.

## Comparativa con modelos similares

Comparación directa con el modelo del que deriva, único punto de referencia con datos medidos en la información proporcionada:

| Modelo | Parámetros | Contexto | PPL WikiText-2 | Tamaño en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ewin-reg/MiniCPM5-2B-RotSVDMix-Quantized | 2,62 B | No disponible | 23,10 | 1,37 GB | Apache 2.0 | HuggingFace (0 descargas) |
| openbmb/MiniCPM5-2B (FP16) | 2,62 B | No disponible | 20,47 | 4,69 GB | No disponible en la información proporcionada | HuggingFace (modelo base) |

No se dispone de datos comparativos frente a otras alternativas de la misma categoría (por ejemplo, otros modelos de ~2 B cuantizados a 4 bits como Qwen, Gemma o Phi en sus variantes pequeñas) en la información proporcionada, por lo que no se incluyen cifras de rendimiento de terceros.

## Limitaciones y advertencias

- Degradación medible de calidad: la perplejidad aumenta un 12,88% y un 24% de los prompts evaluados cambian el token top-1 respecto al modelo FP16. En tareas sensibles a la precisión (código, matemáticas, extracción estructurada) esta deriva puede ser determinante.
- Error de reconstrucción de pesos del 8,54% de media, con la cabeza del modelo de lenguaje como subcapa peor reconstruida (9,25%).
- Naturaleza experimental: el autor etiqueta explícitamente el trabajo como experimental. El repositorio tiene 0 descargas y 0 likes, sin validación independiente ni evaluación en benchmarks de tareas.
- Idiomas limitados a inglés y chino. No hay evaluación en castellano ni en otras lenguas, y el comportamiento fuera de esos dos idiomas no está documentado.
- Sesgos: no se han publicado análisis de sesgo, toxicidad o alineación para esta variante ni para el modelo base en la información disponible.
- Riesgo de alucinación: inherente a un modelo de 2,62 B parámetros; no hay datos de evaluación de veracidad ni de tasas de alucinación.
- Licencia: el repositorio declara Apache 2.0, lo que permite uso comercial, pero conviene verificar de forma independiente la licencia y las condiciones del modelo base openbmb/MiniCPM5-2B antes de un despliegue en producción.
- Aviso sobre VRAM: el beneficio de los 1,37 GB se aplica al almacenamiento; en GPUs convencionales sin kernels INT4 nativos la dequantización en runtime puede anular el ahorro de memoria.
- Las etiquetas relativas a NPU de Snapdragon, Neural Engine y APU de MediaTek son declaraciones de intención del autor; el repositorio solo empaqueta safetensors y no incluye artefactos específicos para esas plataformas.
- No se especifica la longitud de contexto soportada, dato crítico para planificar despliegues con conversaciones largas o documentos extensos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ewin-reg/MiniCPM5-2B-RotSVDMix-Quantized
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Resultados brutos de benchmark: https://huggingface.co/ewin-reg/MiniCPM5-2B-RotSVDMix-Quantized/blob/main/real_benchmark_results.json
- Scorecard: https://huggingface.co/ewin-reg/MiniCPM5-2B-RotSVDMix-Quantized/blob/main/scorecard.json
- Referencias arXiv citadas en los tags del repositorio:
  - https://arxiv.org/abs/2310.08659
  - https://arxiv.org/abs/2404.00456
  - https://arxiv.org/abs/2405.16406
- Referencia intermedia del autor (mencionada en el tag `base_model`): https://huggingface.co/ewin-reg/MiniCPM5-2B-RotSVDMix

Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo (los enlaces obtenidos corresponden a plataformas de gestión de viajes de empresa y a un sitio de electrónica sin relación con MiniCPM), por lo que no se incluyen como fuentes.
