# nightmedia/Qwen3.5-9B-Brainwaves-Coder-Flash-OneJev1.6-mxfp8-mlx

## Resumen

Qwen3.5-9B-Brainwaves-Coder-Flash-OneJev1.6-mxfp8-mlx es un modelo experimental de 9.000 millones de parámetros fruto de la fusión de tres modelos derivados de la familia Qwen3.5: nightmedia/Qwen3.5-9B-Brainwaves, Jackrong/Qwopus3-5-9B-Coder-Flash y OmniJev/OneJev1.6-9B. Lo publica el usuario nightmedia en Hugging Face bajo licencia Apache 2.0, y combina las capacidades de razonamiento de Brainwaves, el enfoque en código de Coder-Flash y el ajuste conversacional/creativo de OneJev1.6. El resultado es un modelo multimodal de tipo image-text-to-text orientado a generación de código, matemáticas, razonamiento de cadena larga y escritura creativa.

La relevancia de esta ficha radica en que se distribuye ya cuantizado en mxfp8 (formato MLX de 8 bits), lo que reduce el pico de memoria a 16,02 GB frente a los 24,69 GB del bf16, manteniendo una perplejidad de 4,106 y un rendimiento de 624 tokens por segundo según los datos del autor. Está pensado para ejecutarse en hardware Apple Silicon mediante MLX, y las etiquetas del repositorio mencionan soporte de contexto largo (hasta 1M y 256k tokens), razonamiento chain-of-thought, decodificación especulativa y multi-token prediction.

Se trata de un modelo de nicho y marcadamente experimental: cero descargas y cero likes en el momento de la consulta, creado el 3 de noviembre de 2026. No dispone de benchmarks publicados más allá de las pruebas internas del autor (ARC, BoolQ, HellaSwag, OpenBookQA, PIQA, Winograd y GSM8K), por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5 (fusión con mergekit); pipeline image-text-to-text |
| Parámetros totales | 9B (9.000 millones, según el nombre del modelo) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 256k y 1M tokens (según etiquetas del repositorio; no verificado en la model card) |
| Tipos de cuantización | mxfp8 (distribuida); el autor reporta además q8-hi, q6-hi, mxfp4 y bf16 |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | MLX / mxfp8 (cuantización MLX de 8 bits); compatible con transformers |

## Arquitectura y entrenamiento

El modelo es una fusión (merge) de tres checkpoints de 9B construidos sobre la arquitectura Qwen3.5, un transformer denso con atención estándar. La fusión se realizó con mergekit, según la etiqueta del repositorio, combinando los pesos de Brainwaves (razonamiento y contexto largo), Coder-Flash (código y matemáticas) y OneJev1.6 (conversación y escritura creativa). No se especifica en la información disponible la proporción exacta del merge ni la técnica concreta (SLERP, TIES, DARE, etc.).

No se detallan los datos de entrenamiento originales de los modelos base (número de tokens, composición del dataset, uso de RLHF o DPO). Las etiquetas sí mencionan técnicas de inferencia como multi-token prediction y decodificación especulativa, así como el uso de destilación (distillation) y referencias a "claude", "polaris" y "polaris-alpha" que no se explican en la model card. La cuantización mxfp8 se aplicó sobre el merge final, con los resultados de perplejidad y memoria que se recogen en la sección de benchmarks.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino, japonés y español.
- Razonamiento explícito con chain-of-thought y long-CoT (etiquetas reasoning, long-cot).
- Generación de código y tareas de programación (herencia de Coder-Flash).
- Matemáticas y STEM, con resultados reportados en GSM8K del 90,52 % en mxfp8.
- Procesamiento image-text-to-text (pipeline declarado), aunque no se detallan los benchmarks multimodales.
- Escritura creativa: generación de tramas, subtramas, ficción, ciencia ficción, roleplaying y continuación de escenas.
- Soporte declarado de contexto largo (256k y 1M tokens), no verificado empíricamente en la información disponible.
- Decodificación especulativa y multi-token prediction como técnicas de aceleración de inferencia.
- No se confirma soporte de tool calling ni de function calling en la información proporcionada.

## Casos de uso

- Generación de código en pipelines de desarrollo: el modelo hereda el ajuste de Coder-Flash y puede emplearse para autocompletar, refactorizar y explicar código en inglés y español, integrándose vía transformers en entornos de CI/CD.
- Asistente de razonamiento matemático: con un 90,52 % en GSM8K en mxfp8, es adecuado para resolver problemas de nivel escolar y universitario con trazas de cadena de pensamiento.
- Escritura creativa y generación de ficción: las etiquetas de plot generation, sub-plot generation y storytelling permiten usarlo para redactar relatos, tramas y continuaciones de escena en distintos géneros.
- Roleplaying y narrativa interactiva: su ajuste conversacional (OneJev1.6) lo hace apto para personajes persistentes en aplicaciones de ocio, con contexto largo para mantener la coherencia.
- Atención al cliente multilingüe: soporta en, zh, ja y es, por lo que puede gestionar conversaciones multi-turno en esos idiomas con una ventana de contexto amplia.
- Procesamiento de documentos con imagen y texto: al declararse image-text-to-text, puede emplearse para extraer información de capturas o documentos escaneados combinados con instrucciones textuales.
- Investigación y experimentación local en Apple Silicon: la versión mxfp8 con 16,02 GB de pico de memoria permite ejecutarlo en equipos con memoria unificada de 24 GB o más para prototipado rápido.

## Benchmarks y rendimiento

Datos reportados por el autor para el merge mxfp8 (no hay comparación directa con otros modelos en la información disponible):

| Tarea | mxfp8 |
|---|---|
| ARC | 0,700 |
| ARC/e | 0,880 |
| BoolQ | 0,905 |
| HellaSwag | no disponible |
| OpenBookQA | no disponible |
| PIQA | no disponible |
| Winograd | no disponible |
| GSM8K | 90,52 % |

Rendimiento de cuantización del merge (según el autor):

| Cuantización | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| mxfp8 | 4,106 ± 0,026 | 16,02 GB | 624 |
| q8-hi | 4,098 ± 0,026 | 16,86 GB | 652 |
| q6-hi | 4,101 ± 0,026 | 14,62 GB | 597 |
| mxfp4 | 4,327 ± 0,028 | 11,55 GB | 635 |

Como referencia, el modelo base Qwen3.5-9B Instruct en mxfp8 obtiene ARC 0,571, ARC/e 0,719, BoolQ 0,895, HellaSwag 0,683, OpenBookQA 0,426, PIQA 0,770 y Winograd 0,671. El merge mejora en ARC, ARC/e y OpenBookQA, pero no se dispone de GSM8K del base para comparar.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16,02 GB en mxfp8, 14,62 GB en q6-hi, 11,55 GB en mxfp4 y 24,69 GB en bf16 (datos del autor).
- GPU recomendadas: el formato mxfp8 es específico de MLX, por lo que el objetivo natural es Apple Silicon (M-series con memoria unificada de 24 GB o superior). Para bf16 se requiere una GPU con al menos 24 GB, como RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en mxfp4 (11,55 GB) y q6-hi (14,62 GB) en tarjetas de 16 GB o más; mxfp8 requiere 24 GB de memoria unificada en Apple Silicon.
- Opciones de despliegue: MLX (formato nativo), transformers (librería declarada); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Throughput reportado: 624 tokens/s en mxfp8, 652 en q8-hi, 597 en q6-hi y 635 en mxfp4 (mediciones del autor, hardware no especificado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Brainwaves-Coder-Flash-OneJev1.6-mxfp8-mlx | 9B | 256k/1M (declarado) | 90,52 % | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.5-9B Instruct (base) | 9B | no disponible | no disponible | no disponible | Hugging Face |
| nightmedia/Qwen3.5-9B-Brainwaves | 9B | no disponible | 89,16 % (mxfp8) | Apache 2.0 (según repo) | Hugging Face |
| Jackrong/Qwopus3-5-9B-Coder-Flash | 9B | no disponible | no disponible | no disponible | Hugging Face |
| OmniJev/OneJev1.6-9B | 9B | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a los modelos base del merge, ya que no se dispone de datos de benchmarks de alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como experimental, con cero descargas y sin validación comunitaria.
- Riesgo de alucinación: al ser una fusión de pesos sin ajuste posterior documentado, puede degradar la coherencia factual respecto a los modelos originales.
- Benchmarks incompletos: solo se reportan ARC, ARC/e, BoolQ y GSM8K; faltan HellaSwag, OpenBookQA, PIQA y Winograd en el merge, y no hay evaluación de contexto largo ni multimodal.
- Contexto largo no verificado: las etiquetas de 256k y 1M tokens no están respaldadas por pruebas en la model card.
- Idiomas limitados a en, zh, ja y es; no se garantiza calidad en otros idiomas.
- Formato mxfp8 ligado a MLX: el despliegue en GPUs NVIDIA requiere reconvertir a bf16 u otro formato, con el consiguiente aumento de memoria.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de modelos base cuyas licencias no se detallan, conviene verificar la compatibilidad de cada componente antes de producción.
- Sin soporte confirmado de tool calling ni function calling, lo que limita su uso en pipelines de agentes.
- Fecha de creación futura (2026) y metadatos incompletos: la información de la model card es escasa y parcial.

## Enlaces

- Hugging Face: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves-Coder-Flash-OneJev1.6-mxfp8-mlx
- Modelo base Brainwaves: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves
- Modelo base Coder-Flash: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
- Modelo base OneJev1.6: https://huggingface.co/OmniJev/OneJev1.6-9B
- Repositorio mergekit: https://github.com/arcee-ai/mergekit
- MLX (framework de Apple): https://github.com/ml-explore/mlx
