# donghanasd/Qwen3.8-27B-MTP-heretic-ja-imatrix-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con matriz de importancia (imatrix) del modelo `OS-Software/Qwen3.8-27B-MTP-heretic-ja-GGUF`, que a su vez es una versión decensurada (mediante el método Heretic/ARA) del modelo base `unsloth/Qwen3.8-27B`. El resultado son dos archivos GGUF (`IQ4_XS` y `IQ3_M`) optimizados para ejecutarse por completo en una GPU de 16 GB, manteniendo los tensores MTP (Multi-Token Prediction) para decodificación especulativa sin necesidad de un modelo auxiliar.

Qwen3.8-27B emplea una arquitectura híbrida: de sus 64 capas, solo una de cada cuatro usa atención cuadrática completa, mientras que el resto son capas Gated DeltaNet (estilo SSM con estado de tamaño fijo). Esto reduce drásticamente el crecimiento de la caché KV con el contexto, permitiendo ventanas de decenas de miles de tokens en hardware de consumo. La cuantización imatrix aquí presentada mejora la calidad por bit frente a los K-quants estándar, logrando una perplejidad menor que el `UD-Q3_K_XL` del repositorio fuente con un tamaño inferior.

El modelo está orientado a usuarios que necesitan contexto largo, generación rápida y una sola GPU, y que además buscan una versión sin censura (decensurada) del modelo original. No se proporcionan datos de licencia ni de idiomas soportados en la model card, aunque el nombre del repositorio sugiere un enfoque en japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas, 1 de cada 4 con atención completa, resto Gated DeltaNet (SSM) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131 072+ tokens (verificado con asistencia de CPU); hasta ~49 152 tokens en GPU de 16 GB con IQ3_M y KV cuantizada |
| Tipos de cuantizacion | IQ4_XS (~14.2 GB), IQ3_M (~11.9 GB), además del fuente UD-Q8_K_XL (~31.4 GB) |
| Idiomas soportados | No disponible (el nombre sugiere japonés, pero no se confirma) |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es `Qwen3.8-27B`, una arquitectura híbrida que combina atención cuadrada tradicional con capas Gated DeltaNet. En concreto, de las 64 capas, 16 son de atención completa (una de cada cuatro) y las 48 restantes son de estado fijo tipo SSM. Esto hace que la caché KV crezca mucho más lentamente con el contexto que en un transformer estándar, lo que permite manejar ventanas de decenas de miles de tokens con requisitos de VRAM moderados.

El proceso de decensurado (abliteration) se realizó con el método Heretic v1.4.0+custom, usando Arbitrary-Rank Ablation (ARA), por parte de OS-Software. Sobre ese modelo ya decensurado, se aplicó una cuantización imatrix: se generó una matriz de importancia a partir del GGUF fuente `UD-Q8_K_XL` y un texto de calibración, y luego se re-cuantizaron los pesos a `IQ4_XS` e `IQ3_M` usando `llama-quantize --allow-requantize --imatrix`. Se conservaron los tensores `blk.64.nextn.*` del MTP, lo que permite usar decodificación especulativa auto-contenida.

## Capacidades

- Generación de texto libre y creativa, sin filtros de contenido (modelo decensurado).
- Razonamiento y comprensión de contexto largo (hasta decenas de miles de tokens en GPU de 16 GB).
- Soporte de decodificación especulativa mediante MTP (Multi-Token Prediction) integrado, sin necesidad de un modelo draft externo.
- Capacidad de ejecución completa en GPU de 16 GB con cuantización IQ3_M, manteniendo una velocidad de generación de ~29 tok/s.
- Compatibilidad con llama.cpp y `llama-server`, incluyendo cuantización de caché KV (`-ctk q4_0 -ctv q4_0`) para ampliar el contexto.
- No se mencionan capacidades explícitas de tool calling, agentes o visión en la documentación disponible.

## Casos de uso

- **Escritura creativa sin restricciones**: al ser un modelo decensurado, puede utilizarse para generar narrativa, diálogos o contenido literario sin las limitaciones típicas de seguridad de los modelos comerciales, manteniendo coherencia en tramas largas gracias a su contexto amplio.
- **Asistentes conversacionales con memoria extendida**: su arquitectura híbrida permite mantener conversaciones de decenas de miles de tokens sin agotar la VRAM, adecuado para chatbots que necesitan recordar historial extenso.
- **Análisis y resumen de documentos largos**: puede procesar manuales, informes o artículos completos en una sola pasada, gracias a la ventana de contexto de hasta 49K tokens en GPU de 16 GB (o más con hardware superior).
- **Generación de código con contexto de proyecto**: aunque no se especifica soporte de tool calling, el modelo base Qwen3.8 es capaz de razonar sobre código; con contexto largo puede mantener el estado de un repositorio completo.
- **Prototipado de agentes conversacionales en local**: al caber en una GPU de consumo y ser ejecutable con `llama-server`, es útil para desarrolladores que quieren probar agentes sin depender de APIs externas.
- **Investigación en alineación y censura**: al ser una versión abliterada, sirve como banco de pruebas para estudiar el impacto de la eliminación de rechazos en modelos de lenguaje.

## Benchmarks y rendimiento

La model card proporciona mediciones propias de perplejidad y velocidad en una GPU de 16 GB (CUDA, contexto 2048, decodificación greedy). No se incluyen benchmarks estándar como MMLU, HumanEval o GSM8K.

| Modelo | Tamaño | Perplejidad (PPL) | Velocidad (full offload) | Contexto máximo verificado (full offload) |
|---|---:|---:|---:|---:|
| UD-Q8_K_XL (fuente, 8-bit) | 31.4 GB | 8.2631 | 1.84 tok/s (solo offload parcial) | 131 072+ (con CPU, lento) |
| **IQ4_XS (este repo)** | 14.2 GB | 8.4128 | 27.12 tok/s | ~20 480 |
| UD-Q3_K_XL (fuente) | 13.4 GB | 8.7075 | 28.51 tok/s | ~40 960 |
| **IQ3_M (este repo)** | 11.9 GB | 8.5242 | 29.29 tok/s | ~49 152 |

La cuantización imatrix de IQ3_M es más pequeña que el UD-Q3_K_XL del repositorio fuente y obtiene una perplejidad menor (8.52 vs 8.71). El IQ4_XS se acerca a la calidad del 8-bit original (dentro de ~1.8%) con menos de la mitad de tamaño y unas 15 veces más velocidad de generación. Con la activación del MTP (`--spec-type mtp:n_max=3,p_min=0.0`), la velocidad sostenida a ~64K de contexto sube de ~16.7 tok/s a ~25–29 tok/s.

## Requisitos de hardware

- **VRAM estimada**: IQ3_M ocupa ~11.9 GB, IQ4_XS ~14.2 GB. Con cuantización KV (`q4_0`), IQ3_M permite hasta ~49K de contexto en una GPU de 16 GB; IQ4_XS hasta ~20K con KV en f16.
- **GPU recomendada**: cualquier GPU con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A5000, etc.). Con más VRAM se puede ampliar el contexto máximo.
- **Compatibilidad con GPU de consumo**: sí, ambos archivos caben por completo en una GPU de 16 GB. El IQ3_M es el más adecuado para contexto largo.
- **Opciones de despliegue**: `llama.cpp` / `llama-server` (incluido en el repo), compatible con Ollama y otros frontends que soporten GGUF. También se puede usar con vLLM si se convierte a otro formato, pero no está documentado.
- **Latencia y throughput**: ~29 tok/s para IQ3_M y ~27 tok/s para IQ4_XS en full offload con GPU de 16 GB (medido con contexto 2048). Con contexto largo y MTP activado, se mantienen tasas de 25–29 tok/s.

## Comparativa con modelos similares

La comparativa más directa es con las cuantizaciones del repositorio fuente, ya que no se dispone de datos de otros modelos comparables.

| Modelo | Tamaño | Perplejidad | Contexto máximo (GPU 16 GB) | Licencia |
|---|---:|---:|---:|---|
| UD-Q8_K_XL (fuente) | 31.4 GB | 8.2631 | 131K+ (con CPU) | No disponible |
| UD-Q3_K_XL (fuente) | 13.4 GB | 8.7075 | ~40 960 | No disponible |
| **IQ4_XS (este repo)** | 14.2 GB | 8.4128 | ~20 480 | No disponible |
| **IQ3_M (este repo)** | 11.9 GB | 8.5242 | ~49 152 | No disponible |

Frente al modelo original `unsloth/Qwen3.8-27B` (sin decensurar), este repo añade la capa de ablación y la cuantización imatrix, pero no se dispone de benchmarks comparativos con el original. Tampoco hay datos de otros modelos de la misma categoría (por ejemplo, otros Qwen3.8 decensurados o modelos SSM-híbridos).

## Limitaciones y advertencias

- **Modelo decensurado**: al haber sido sometido a ablación de rechazos, puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es adecuado para aplicaciones comerciales que requieran moderación de contenido.
- **Sesgos no documentados**: no se proporciona información sobre sesgos o evaluación de seguridad. Es probable que herede sesgos del modelo base, amplificados por la eliminación de filtros.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede inventar información, especialmente en contextos largos o con temas especializados.
- **Limitaciones de contexto**: aunque la arquitectura híbrida permite contextos largos, el máximo práctico depende de la VRAM disponible. Con 16 GB y IQ3_M, el límite es ~49K tokens; superarlo requiere más VRAM o sacrificar velocidad con offload a CPU.
- **Licencia no especificada**: no se indica la licencia del modelo ni de los pesos cuantizados. Esto impide su uso en entornos comerciales sin una verificación legal previa.
- **Dependencia de llama.cpp**: el formato GGUF y el soporte MTP requieren versiones recientes de `llama.cpp`; la compatibilidad con otros motores no está garantizada.
- **Calidad de cuantización**: aunque la imatrix mejora la calidad por bit, sigue habiendo pérdida respecto al 8-bit original (PPL 8.52 vs 8.26 en IQ3_M). Para tareas de alta precisión puede ser preferible el modelo fuente.

## Enlaces

- Repositorio HuggingFace: [donghanasd/Qwen3.8-27B-MTP-heretic-ja-imatrix-GGUF](https://huggingface.co/donghanasd/Qwen3.8-27B-MTP-heretic-ja-imatrix-GGUF)
- Modelo fuente (GGUF): [OS-Software/Qwen3.8-27B-MTP-heretic-ja-GGUF](https://huggingface.co/OS-Software/Qwen3.8-27B-MTP-heretic-ja-GGUF)
- Modelo base original: [unsloth/Qwen3.8-27B](https://huggingface.co/unsloth/Qwen3.8-27B)
- Archivo de benchmarks incluido en el repo: `BENCHMARKS.md` (no enlazado directamente, pero mencionado en la model card)
