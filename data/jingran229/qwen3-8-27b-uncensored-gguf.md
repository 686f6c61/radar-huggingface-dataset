# jingran229/Qwen3.8-27B-Uncensored-GGUF

## Resumen
Qwen3.8-27B-Uncensored-GGUF es una cuantización en formato GGUF de Qwen3.8-27B, un modelo de lenguaje de 27.320.697.856 parámetros desarrollado originalmente por el equipo Qwen y publicado por el usuario jingran229. El modelo base emplea la arquitectura `Qwen3_5ForConditionalGeneration` con 64 capas, un vocabulario de 248.320 tokens y una ventana de contexto de 262.144 tokens. Esta versión mantiene la cabeza de predicción multi-token (MTP) verificada, lo que permite decodificación especulativa integrada en un único archivo.

La modificación principal consiste en la eliminación de direcciones de rechazo mediante la herramienta Heretic, que minimiza conjuntamente el número de rechazos y la divergencia KL respecto al modelo base. El proceso se ejecuta en bf16, sin entrenamiento adicional ni datos nuevos, y el LoRA resultante se fusiona en los pesos base antes de la cuantización. Según el autor, el comportamiento de rechazo se reduce de forma sustancial, pero no se elimina por completo.

El interés práctico reside en que ofrece un modelo de 27B con visión, contexto de 262K y decodificación especulativa en cuantizaciones que van desde 10,6 GB (IQ2_M) hasta 29,0 GB (Q8_0), lo que permite desplegarlo en GPUs de consumo con suficiente VRAM. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo solo declara soporte para inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer, 64 capas, 1 capa MTP) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (con y sin MTP); draft en Q8_0 y Q4_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

Otros datos técnicos: vocabulario de 248.320 tokens, matriz de importancia (imatrix) calculada desde f16 sobre wikitext-2 raw con 200 fragmentos, y conversión realizada con llama.cpp `a94d563ed`. El repositorio ocupa 231,3 GB e incluye el proyector de visión `mmproj-Qwen3.8-27B-Uncensored-F16.gguf` (0,9 GB).

## Arquitectura y entrenamiento
El modelo base es un transformer denso de 64 capas con una capa adicional de predicción multi-token (MTP), pensada para decodificación especulativa. La arquitectura incorpora visión, ya que el repositorio incluye un proyector multimodal `mmproj` compatible con runtimes que soporten entrada de imagen. El contexto nativo alcanza los 262.144 tokens, lo que lo sitúa en la gama alta de ventanas de contexto para modelos de su tamaño.

El proceso de "abliteration" se realizó con Heretic en precisión bf16, sin cuantización intermedia: el LoRA resultante se fusionó en los pesos base antes de generar los GGUF. La modificación afecta únicamente a `attn.o_proj` y `mlp.down_proj` de la pila principal; los tensores `mtp.*` se copian literalmente del checkpoint base y no se tocan. La imatrix se calculó directamente desde f16, de modo que la calibración ve los pesos reales. No se añadieron datos de entrenamiento ni se realizó fine-tuning adicional.

## Capacidades
- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.8-27B.
- Entrada de imagen mediante el proyector `mmproj` en runtimes de visión compatibles.
- Decodificación especulativa con cabeza MTP integrada (familia fusionada) o con modelo draft separado (`--model-draft`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada (no se menciona explícitamente en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- Comportamiento de rechazo reducido de forma sustancial, no eliminado (ver sección de limitaciones).

## Casos de uso
- Despliegue local en GPU de consumo: la cuantización IQ4_XS (15,3 GB) o Q4_K_M (16,8 GB) permite ejecutar el modelo en tarjetas con 24 GB de VRAM, como la RTX 4090, manteniendo una perplejidad prácticamente idéntica a f16 (+0,0026 y +0,0257 respectivamente).
- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes técnicos o bases de código completas en una sola pasada sin fragmentación.
- Asistencia conversacional en inglés y chino: adecuado para atención al cliente o asistentes internos en entornos bilingües en/zh, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Análisis de imágenes con texto: el proyector `mmproj` permite tareas de descripción de imágenes, extracción de información de capturas o moderación visual en runtimes compatibles con llama.cpp.
- Generación de texto creativo sin restricciones excesivas: la reducción de rechazos resulta útil en aplicaciones de ficción, guion o escritura creativa donde el modelo base tiende a rechazar contenido sensible.
- Inferencia de baja latencia con decodificación especulativa: la cabeza MTP integrada o el draft Q8_0 (3,2 GB) aceleran la generación en llama.cpp y llama-server sin degradar la calidad, ya que cada token se verifica contra el modelo objetivo.
- Experimentación e investigación: la disponibilidad de múltiples cuantizaciones con perplejidad medida y una imatrix publicada facilita estudios de degradación por cuantización y reproducibilidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo proporciona mediciones de perplejidad sobre wikitext-2:

| Archivo | PPL (wikitext-2) | Diferencia vs f16 |
|---|---|---|
| f16 (baseline, no distribuido) | 7,1557 +/- 0,25104 | — |
| Q5_K_M | 7,1573 +/- 0,25055 | +0,0016 |
| IQ4_XS | 7,1583 +/- 0,25019 | +0,0026 |
| Q6_K | 7,1689 +/- 0,25149 | +0,0132 |
| Q8_0 | 7,1764 +/- 0,25195 | +0,0207 |
| Q4_K_M | 7,1814 +/- 0,25227 | +0,0257 |
| IQ2_M | 7,8581 +/- 0,27481 | +0,7024 |

El propio autor advierte que, salvo IQ2_M, todas las filas quedan dentro de un margen de 0,026 frente a un error estándar de aproximadamente 0,25, por lo que las diferencias entre cuantizaciones de 4 bits en adelante no son estadísticamente separables. La model card también menciona una sección de decodificación especulativa medida sobre IQ2_M, pero los valores concretos de tasa de aceptación no aparecen en la información proporcionada.

## Requisitos de hardware
- VRAM estimada según cuantización: IQ2_M ~10,6 GB; IQ4_XS ~15,3 GB; Q4_K_M ~16,8 GB; Q5_K_M ~19,5 GB; Q6_K ~22,4 GB; Q8_0 ~29,0 GB. Añadir ~0,9 GB si se usa el proyector de visión y ~3,2 GB si se usa el draft Q8_0 en modo separado.
- GPU recomendadas: RTX 4090 (24 GB) para IQ4_XS, Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K y Q8_0 con contexto largo; GPUs de 12-16 GB solo con IQ2_M y contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y modelos con 24 GB o más para cuantizaciones de 4-5 bits; en GPUs de 16 GB con IQ2_M o Q4_K_M con contexto limitado.
- Opciones de despliegue: llama.cpp y llama-server (soporte nativo de GGUF y `--model-draft`), ComfyUI (según la model card), y runtimes compatibles con endpoints. vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP está soportada, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-GGUF | 27,3B | 262.144 | Apache 2.0 | GGUF | Visión, MTP, rechazo reducido |
| Qwen/Qwen3.8-27B (base) | 27,3B | 262.144 | Apache 2.0 | safetensors | Modelo original sin modificar |
| Otras cuantizaciones de Qwen3.8-27B | 27,3B | 262.144 | Apache 2.0 | GGUF | Sin reducción de rechazos; disponibles en la comunidad |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de otros desarrolladores. La comparación con el modelo base es directa en arquitectura y capacidades; la única diferencia documentada es la reducción de rechazos y la disponibilidad en GGUF con MTP verificado.

## Limitaciones y advertencias
- El comportamiento de rechazo está reducido de forma sustancial, pero no eliminado; el autor lo indica explícitamente y remite a la sección "Measured behaviour" de la model card.
- La abliteración puede alterar sutilmente el comportamiento del modelo en dominios sensibles; no se han publicado evaluaciones de calidad posteriores a la modificación más allá de la perplejidad.
- La cabeza MTP se entrenó contra el modelo sin modificar, por lo que la tasa de aceptación en decodificación especulativa puede caer ligeramente; la calidad de salida no se ve afectada porque cada token se verifica contra el objetivo.
- Idiomas soportados limitados a inglés y chino; no se garantiza un rendimiento adecuado en castellano.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones específicas de factualidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe evaluar por su cuenta el cumplimiento normativo del contenido generado sin las salvaguardas del modelo original.
- El repositorio ocupa 231,3 GB; la descarga completa no es necesaria si solo se requiere una cuantización concreta.
- No se documentan cifras de latencia ni throughput, lo que dificulta planificar despliegues en producción.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/jingran229/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- llama.cpp (runtime): no se proporciona enlace directo en la información disponible
