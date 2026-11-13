# f3nc3r/Qwen3.8-27B-Ultimate-Heretic-Uncensored-miniQuant

## Resumen

El modelo `f3nc3r/Qwen3.8-27B-Ultimate-Heretic-Uncensored-miniQuant` es una cuantización GGUF de precisión extrema (por debajo de 2 bits por peso) del modelo base `DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored`. Lo desarrolla el usuario f3nc3r aplicando el pipeline "miniQuant Recipe B" sobre el checkpoint BF16 del modelo original, con el objetivo de comprimir un modelo de aproximadamente 26.900 millones de parámetros en ficheros de menos de 6 GiB, aptos para hardware muy limitado.

La relevancia de esta ficha radica en que demuestra técnicas avanzadas de cuantización post-entrenamiento (QAD, rotaciones de Hadamard, asignación no uniforme de bits por tipo de tensor y destilación de escalas LMS) aplicadas a arquitecturas híbridas con componentes SSM y atención. El resultado es un modelo utilizable en CPU o en GPUs de gama baja, a costa de una pérdida notable de coherencia y velocidad de decodificación.

El modelo base es de tipo conversacional y "uncensored", orientado a inglés, con licencia Apache 2.0. Esta ficha se centra en la variante cuantizada, pero conviene tener presente que muchos detalles del modelo original (datos de entrenamiento, benchmarks) no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con componentes SSM (Gated DeltaNet: `ssm_in`, `ssm_out`, `conv1d`, `dt`, `alpha`, `beta`) y atención; derivado de la familia Qwen3.8 |
| Parametros totales | 26.895.998.464 (≈26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF sub-2 bpw: mezcla de `IQ1_S`, `IQ2_XXS`, `IQ3_XXS`, `IQ2_K` (y `IQ4_K` en variantes de 4B) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que combina capas de atención con capas SSM basadas en Gated DeltaNet, según se deduce de los nombres de tensores mencionados en la model card (`ssm_in`, `ssm_out`, `conv1d`, `dt`, `alpha`, `beta`, `attn_qkv`, `attn_output`, `attn_v`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica principal de esta variante es el pipeline de cuantización "miniQuant Recipe B", que consta de cuatro etapas: (1) punto de partida en checkpoints BF16 obtenidos mediante Quantization-Aware Training/Distillation (FraQAT con destilación KL puenteada HESTIA); (2) partición con rotaciones de Hadamard emparejadas de 256 dimensiones aplicadas solo a las proyecciones de contracción (`ffn_down`, `ssm_out`, `attn_output`), preservando en su base natural las proyecciones de estado recurrente y los embeddings; (3) asignación no uniforme de bits por tensor (trunk en `IQ1_S` ~1,56 bpw, `ffn_down` en `IQ2_XXS` ~2,06 bpw, salidas de atención/SSM en `IQ3_XXS` ~3,06 bpw, anclas de frontera en `IQ2_K`); y (4) destilación de escalas de bloque mediante Least Mean Squares (LMS) fuera de núcleo contra los pesos BF16 del profesor.

## Capacidades

- Generación de texto conversacional en inglés, con formato de plantilla ChatML (`<|im_start|>...<|im_end|>`).
- Razonamiento aritmético básico verificado en la model card (se cita el ejemplo `15+27=42`).
- Modo "uncensored": el modelo base está ajustado para reducir rechazos, lo que implica menor alineación de seguridad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentación en hardware de gama baja: el fichero de 5,84 GiB permite cargar el modelo en equipos con 8-16 GiB de RAM o VRAM, útil para pruebas de concepto y demostraciones locales sin infraestructura dedicada.
- Investigación en cuantización extrema: sirve como referencia reproducible del pipeline Recipe B para estudiar el impacto de la asignación no uniforme de bits y de las rotaciones de Hadamard en arquitecturas híbridas SSM/atención.
- Generación de texto creativo sin filtros: el carácter "uncensored" del modelo base lo hace adecuado para escritura de ficción o guiones que requieran contenido adulto o sensible, siempre con revisión humana.
- Pruebas de robustez y evaluación de alucinación: al ser una cuantización sub-2 bpw, es un caso de estudio útil para medir cómo degrada la compresión la coherencia y la precisión factual (la model card reporta 75,0 % de coherencia y 66,7 % de precisión en la variante Direct).
- Despliegue en entornos con CPU exclusivamente: la model card reporta velocidades de prefill de 29,3-47,1 tok/s y decodificación de 5,10-7,17 tok/s en un AMD Ryzen AI 9 HX 470, lo que permite prototipado interactivo sin GPU.
- Chat conversacional de bajo coste en inglés: para asistentes internos o demos donde el coste por token importa más que la calidad máxima, el tamaño reducido permite servir el modelo en un único nodo modesto.
- Comparación de recetas de cuantización: útil para equipos que evalúan `Recipe_B` frente a `Recipe_B Direct` y otras variantes en términos de tamaño, velocidad y calidad.

## Benchmarks y rendimiento

La model card incluye métricas propias de velocidad y calidad de las dos variantes publicadas, medidas en el hardware indicado (AMD Ryzen AI 9 HX 470, 121 GiB DDR5, Tesla V100-SXM2-16GB):

| Fichero | Receta | Tamano | BPW efectivo | Prefill CPU (tok/s) | Decode CPU (tok/s) | Calidad reportada |
|---|---|---|---|---|---|---|
| `DavidAU-Qwen3.8-27B-Ultimate-RecipeB-Distilled.gguf` | `Recipe_B` (`IQ1_S` + `IQ2_K` + imatrix + LMS) | 5,84 GiB | 1,862 | 29,3 – 47,1 | 7,17 | Respuestas exactas verificadas (`15+27=42`), < 2,0 bpw |
| `DavidAU-Qwen3.8-27B-Ultimate-Sub2Bpw-Direct.gguf` | `Recipe_B` Direct (`IQ1_S` + `IQ2_K`) | 5,81 GiB | 1,852 | 36,9 – 47,1 | 5,10 | 75,0 % coherencia, 66,7 % precisión (100 % factual) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 6 GiB para el fichero GGUF, más overhead de contexto y del motor de inferencia; con contexto largo conviene reservar 8-12 GiB.
- GPU recomendadas: NVIDIA Tesla V100-SXM2-16GB es la GPU usada en la model card; cualquier GPU con ≥8 GiB (RTX 3060 Ti, RTX 4060, RTX 4070) puede alojar los pesos, aunque el rendimiento óptimo depende del soporte de las operaciones SSM en llama.cpp.
- Cabe en GPU de consumo: sí, en modelos con 8 GiB o más de VRAM; también en CPU con 12-16 GiB de RAM del sistema.
- Opciones de despliegue: `llama.cpp` (fork `fencerJP/llama.cpp-miniQuant`), `llama-cli` y, presumiblemente, servidores compatibles con la API de llama.cpp; no se confirma soporte en vLLM, TGI u Ollama.
- Latencia y throughput estimados: según la model card, prefill de 29,3-47,1 tok/s y decode de 5,10-7,17 tok/s en CPU (Ryzen AI 9 HX 470). No se reportan cifras en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `f3nc3r/Qwen3.8-27B-Ultimate-Heretic-Uncensored-miniQuant` | ≈26,9 B | no disponible | GGUF sub-2 bpw (1,85-1,86 bpw) | apache-2.0 | Hugging Face |
| `DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored` (base) | ≈26,9 B | no disponible | BF16 (original) | apache-2.0 | Hugging Face |
| Cuantizaciones GGUF convencionales del mismo base (p. ej. Q4_K_M) | ≈26,9 B | no disponible | GGUF 4-5 bpw | apache-2.0 | Hugging Face (no verificado) |

La comparativa con modelos de otros desarrolladores (Llama, Mistral, Gemma) no está disponible en la información proporcionada; las alternativas más directas son el modelo base sin cuantizar y otras cuantizaciones del mismo checkpoint.

## Limitaciones y advertencias

- La cuantización sub-2 bpw degrada la coherencia y la precisión factual: la propia model card reporta 75,0 % de coherencia y 66,7 % de precisión en la variante Direct, lo que la hace inadecuada para producción crítica.
- El modelo base es "uncensored" y "heretic": reduce los rechazos de seguridad, por lo que puede generar contenido sensible, ofensivo o inexacto; requiere filtros y revisión humana.
- Riesgo elevado de alucinación por la compresión extrema y por la falta de datos de evaluación estándar (MMLU, HumanEval, GSM8K).
- Idiomas soportados limitados al inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- No se dispone de información sobre la longitud de contexto efectiva ni sobre el impacto de la cuantización en contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus derivados pueden arrastrar condiciones adicionales no documentadas; conviene revisar la licencia del checkpoint original.
- El despliegue requiere el fork `fencerJP/llama.cpp-miniQuant`; el soporte en otras herramientas (vLLM, TGI, Ollama) no está confirmado.
- El repositorio no tiene descargas ni likes y fue creado en noviembre de 2026, por lo que carece de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f3nc3r/Qwen3.8-27B-Ultimate-Heretic-Uncensored-miniQuant
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Fork de llama.cpp usado: https://github.com/fencerJP/llama.cpp-miniQuant
