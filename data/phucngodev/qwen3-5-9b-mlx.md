# phucngodev/Qwen3.5-9B-MLX

## Resumen

Qwen3.5-9B-MLX es una conversión al formato MLX (Apple Silicon) del modelo Qwen3.5-9B-DS9-USS-Defiant de nightmedia, un merge multi-etapa de fine-tunes de Qwen3.5-9B realizados por nightmedia y DavidAU, con un proceso de "abliteration" orientado a eliminar los rechazos de contenido (etiquetado como "Heretic" y "uncensored"). Lo publica el usuario phucngodev como cuantización de 4 bits, pensada para ejecutarse en hardware de Apple con memoria unificada.

El modelo es multimodal (image-text-to-text), con una torre de visión de 27 capas que funciona sin necesidad de descargar un `mmproj` separado, y conserva el modo de razonamiento ("thinking") de la familia Qwen3.5 en una versión compactada. Su contexto nativo es de 262.144 tokens, lo que lo sitúa en la gama alta de ventanas de contexto para un modelo de ~9.400 millones de parámetros.

La relevancia de esta ficha es doble: por un lado, documenta una variante de Qwen3.5-9B optimizada para inferencia local en Mac; por otro, advierte de que se trata de un modelo derivado, sin benchmarks publicados, con un proceso de merge y abliteration no auditado, y con una licencia Apache 2.0 heredada que conviene verificar contra los términos del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido multimodal Qwen3.5 (atención lineal gated-delta + atención completa en ratio 3:1), torre de visión de 27 capas |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | 4-bit (este repo); la familia incluye bf16, 8-bit, 6-bit, 5-bit, 3-bit y mxfp4 de nightmedia |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 4-bit, group size 64, modo affine |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B: 32 capas con una proporción 3:1 entre atención lineal gated-delta y atención completa (`full_attention_interval: 4`), puerta en la salida de atención (`attn_output_gate`), `head_dim` 256 con 16 cabezas Q y 4 cabezas KV, mRoPE intercalado con `partial_rotary_factor` 0.25 y `rope_theta` 1e7. Incluye una torre de visión de 27 capas con patch 16 y merge espacial 2, y un vocabulario de 248.320 tokens. El modelo base original incorpora pesos MTP (multi-token prediction), que la conversión a MLX descarta, perdiendo únicamente la aceleración por decodificación especulativa que ofrecen las variantes GGUF.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base, más allá de que se trata de un merge multi-etapa de fine-tunes de Qwen3.5-9B con un proceso de abliteration para eliminar rechazos. La conversión a MLX se realizó desde los pesos bf16 originales de nightmedia, verificada numéricamente (coincidencia bit-exacta de `lm_head` y coseno 0.999956 en embeddings frente al GGUF Q8_0), por lo que no hay pérdida por round-trip a GGUF. La cuantización 4-bit usa group size 64 en modo affine, con la torre de visión mantenida en bf16 (0,91 GB).

## Capacidades

- Generación de texto conversacional y creativo, con énfasis declarado en ficción, escritura y roleplaying.
- Razonamiento con modo "thinking" compactado, heredado de Qwen3.5.
- Comprensión de imágenes (image-text-to-text) con la torre de visión integrada, sin `mmproj` externo.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Contenido sin filtros de rechazo ("uncensored"/"abliterated"), orientado a temáticas que los modelos alineados estándar suelen declinar.

## Casos de uso

- Escritura creativa y ficción asistida: el modelo está afinado específicamente para narrativa y roleplaying, y su contexto de 262.144 tokens permite mantener arcos narrativos largos con coherencia entre capítulos.
- Generación de diálogos para videojuegos y narrativa interactiva: la combinación de modo thinking y contexto largo permite personajes con memoria extensa de la conversación y consistencia de personalidad.
- Descripción y análisis de imágenes en local: al integrar la torre de visión en el mismo repo MLX, se puede procesar una imagen y generar texto descriptivo sin dependencias externas, útil para catalogación de archivos fotográficos en un Mac.
- Prototipado de asistentes conversacionales sin censura para investigación: permite estudiar el comportamiento de modelos abliterated en dominios sensibles (literatura adulta, guiones, análisis de contenido) sin los rechazos de los modelos alineados.
- Inferencia local en Apple Silicon para desarrolladores: con 6,0 GB en 4-bit y ~108 t/s de decodificación en M3 Ultra, es viable en un MacBook con memoria unificada suficiente para pruebas de integración y demos.
- Generación de texto en inglés y chino para documentación técnica bilingüe: el vocabulario de 248.320 tokens y el soporte declarado de ambos idiomas lo hacen apto para borradores y traducción asistida entre esos dos idiomas.
- Experimentación con cuantizaciones: la familia publica tiers medidos (bf16, 8, 6, 5, 4, 3 bits) con perplejidad y KL frente a bf16, lo que facilita estudios de degradación por cuantización en un mismo conjunto de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye métricas de cuantización medidas sobre 65.536 tokens de wikitext-2 test a contexto 1024, en un M3 Ultra, con mlx-lm:

| Repo | Tamano | Bits/peso | Perplejidad | Delta ppl | KL(bf16‖q) | Top-1 | Decodificacion |
|---|---|---|---|---|---|---|---|
| bf16 | 18,8 GB | 16 | 8,1273 | — | — | — | 38,6 t/s |
| 8-bit | 10,4 GB | 8,86 | 8,1277 | +0,00% | 0,00124 | 98,24% | 66,9 t/s |
| 6-bit | 8,2 GB | 6,96 | 8,1426 | +0,19% | 0,00523 | 96,20% | 80,3 t/s |
| 5-bit | 7,1 GB | 6,01 | 8,2012 | +0,91% | 0,01845 | 93,24% | 91,5 t/s |
| 4-bit (este repo) | 6,0 GB | 5,06 | 8,5816 | +5,59% | 0,07330 | 87,06% | 108,6 t/s |
| 3-bit | 4,8 GB | 4,11 | 10,8167 | +33,09% | 0,32843 | 73,44% | 124,9 t/s |
| mxfp4 (nightmedia) | 5,6 GB | 4,25 | 8,9443 | +10,05% | 0,11328 | 82,34% | 113,5 t/s |

## Requisitos de hardware

- VRAM/memoria unificada: 6,0 GB para los pesos en 4-bit, más el overhead de activaciones y caché KV; con contexto completo de 262.144 tokens la caché KV crece de forma significativa y exige memoria adicional.
- GPU recomendadas: Apple Silicon con memoria unificada (M1 Pro/Max en adelante; M3 Ultra para las cifras de throughput publicadas). No es compatible con CUDA ni con GPUs NVIDIA/AMD.
- Cabe en consumer hardware de Apple: un MacBook con 16 GB de memoria unificada puede cargar los pesos 4-bit, aunque el contexto largo requerirá presupuesto de memoria cuidadoso.
- Opciones de despliegue: `mlx-vlm` (visión + texto) y `mlx-lm` (solo texto) sobre MLX. No hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI para este repo concreto; para esos runtimes habría que usar la variante GGUF de DavidAU.
- Latencia y throughput: 108,6 t/s de decodificación en 4-bit y 38,6 t/s en bf16, medidos en M3 Ultra con mlx-lm. No se dispone de datos de latencia de prefill ni de throughput con imágenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-MLX (este) | 9,41 B | 262.144 | 4-bit MLX | apache-2.0 | Hugging Face, MLX |
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic (GGUF, DavidAU) | 9,41 B | 262.144 | GGUF (varias) | apache-2.0 (heredada) | Hugging Face, llama.cpp |
| nightmedia/Qwen3.5-9B-DS9-USS-Defiant-mxfp4-mlx | 9,41 B | 262.144 | mxfp4 MLX | apache-2.0 | Hugging Face, MLX |
| Qwen3.5-9B base (upstream) | 9,41 B | 262.144 | bf16 y varias | apache-2.0 | Hugging Face |

Los tres primeros comparten exactamente el mismo conjunto de pesos; las diferencias son de formato y esquema de cuantización. Frente a la variante mxfp4 de nightmedia, este repo 4-bit ofrece menor perplejidad (8,5816 frente a 8,9443) a costa de 0,4 GB más. Frente a la variante GGUF, este repo no incluye los pesos MTP y por tanto no puede aprovechar la decodificación especulativa. No se dispone de comparativas de rendimiento en tareas (benchmarks) frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- Modelo derivado sin benchmarks publicados: no hay evidencia independiente de su calidad en tareas estándar; las únicas métricas son de perplejidad y cuantización.
- Proceso de abliteration y merge no auditado: la eliminación de rechazos puede degradar la coherencia, la seguridad y el cumplimiento de instrucciones en dominios sensibles, y no hay evaluación pública de estos efectos.
- Riesgo de alucinación: inherente a los modelos de ~9B; sin datos de evaluación específicos para esta variante.
- Idiomas limitados a inglés y chino según la model card; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Licencia Apache 2.0 heredada: conviene verificar que los términos del modelo base original de Qwen3.5 y de los fine-tunes de nightmedia y DavidAU permiten el uso comercial de este derivado.
- Contenido sin filtros: no apto para despliegues orientados al público general sin una capa de moderación adicional; puede generar contenido ofensivo o inapropiado.
- Solo Apple Silicon: la dependencia de MLX excluye su uso en infraestructura CUDA; para producción en servidores hay que recurrir a la variante GGUF.
- Contexto de 262.144 tokens: la caché KV a esa longitud puede exceder la memoria de muchos equipos de consumo, aunque los pesos quepan.
- La cuantización 4-bit supone un +5,59% de perplejidad y un top-1 del 87,06% frente a bf16; para tareas sensibles a la fidelidad conviene usar 5-bit u 8-bit.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/phucngodev/Qwen3.5-9B-MLX
- Modelo base (bf16): https://huggingface.co/nightmedia/Qwen3.5-9B-DS9-USS-Defiant
- Variante GGUF de DavidAU: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Variante mxfp4 de nightmedia: https://huggingface.co/nightmedia/Qwen3.5-9B-DS9-USS-Defiant-mxfp4-mlx
- Tier bf16 de la familia: https://huggingface.co/pipenetwork/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-MLX-bf16
- Tier 8-bit: https://huggingface.co/pipenetwork/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-MLX-8bit
- Tier 6-bit: https://huggingface.co/pipenetwork/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-MLX-6bit
- Tier 5-bit: https://huggingface.co/pipenetwork/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-MLX-5bit
- Tier 3-bit: https://huggingface.co/pipenetwork/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-MLX-3bit
- Perfil de nightmedia: https://huggingface.co/nightmedia
- Perfil de DavidAU: https://huggingface.co/DavidAU
