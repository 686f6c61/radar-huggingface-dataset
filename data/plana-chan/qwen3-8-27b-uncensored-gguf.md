# Plana-Chan/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una versión cuantizada del modelo Qwen3.8-27B de Alibaba, publicada por el usuario Plana-Chan en Hugging Face. El modelo original ha sido sometido a un proceso de abliteración (eliminación de direcciones de rechazo) mediante la herramienta Heretic, que minimiza el número de respuestas de rechazo manteniendo la divergencia KL respecto al modelo base. No se ha realizado fine-tuning ni se han añadido datos de entrenamiento adicionales.

El resultado es un modelo de 27 320 millones de parámetros con arquitectura Qwen3_5ForConditionalGeneration, 64 capas, contexto de 262 144 tokens, soporte de visión y una cabeza de predicción multi-token (MTP) conservada del checkpoint original. Se distribuye en formato GGUF con múltiples niveles de cuantización (IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0), lo que permite su ejecución en hardware variado mediante llama.cpp y runtimes compatibles. La licencia es Apache 2.0 y los idiomas soportados son inglés y chino.

La relevancia de este modelo radica en que ofrece una alternativa "sin censura" (rechazos sustancialmente reducidos) manteniendo intactas las capacidades del modelo base, con la ventaja de poder ejecutarse localmente en GPUs de consumo gracias a las cuantizaciones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con atención estándar) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (además de f16 no publicado) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 64 capas con vocabulario de 248 320 tokens. La versión uncensored se obtiene mediante abliteración: se identifican direcciones de rechazo en el espacio de activaciones y se eliminan usando el algoritmo Heretic, que co-optimiza la reducción de rechazos frente a la divergencia KL con el modelo original. El proceso se ejecuta en precisión bf16 (sin cuantización intermedia) y el LoRA resultante se fusiona en los pesos base. Las capas `attn.o_proj` y `mlp.down_proj` son las modificadas; los tensores `mtp.*` se copian literalmente del checkpoint base sin alteración.

La cabeza MTP (multi-token prediction) de 1 capa se conserva íntegramente, lo que permite decodificación especulativa con un modelo draft integrado. La matriz de importancia (imatrix) se calcula directamente sobre los pesos f16, usando wikitext-2 raw con 200 chunks, para calibrar las cuantizaciones de baja precisión. No se ha realizado ningún entrenamiento adicional ni ajuste fino.

## Capacidades

- Generación de texto en inglés y chino con contexto largo (262 144 tokens).
- Razonamiento y resolución de problemas matemáticos y lógicos (capacidades heredadas del modelo base).
- Generación de código y comprensión de lenguajes de programación (no verificado específicamente en esta versión, pero presente en el modelo base).
- Soporte de visión mediante el proyector multimodal `mmproj-Qwen3.8-27B-Uncensored-F16.gguf` incluido en el repositorio.
- Decodificación especulativa con cabeza MTP integrada, que acelera la inferencia sin degradar la calidad (cada token se verifica contra el modelo objetivo).
- Comportamiento de rechazo sustancialmente reducido en comparación con el modelo base, aunque no eliminado por completo.
- Compatible con runtimes que soporten GGUF: llama.cpp, llama-server, Ollama, ComfyUI, entre otros.

## Casos de uso

- Asistentes conversacionales locales sin censura: el modelo puede desplegarse en una GPU de consumo (por ejemplo, RTX 4090 con cuantización Q4_K_M) para ofrecer un chatbot que no rechaza preguntas sobre temas sensibles, útil en entornos de investigación o desarrollo donde se requiere explorar respuestas sin restricciones.
- Análisis de documentos largos: con 262 144 tokens de contexto, puede procesar libros completos, informes extensos o transcripciones de reuniones en una sola pasada, resumiendo o extrayendo información relevante.
- Generación de contenido creativo sin filtros: redacción de narrativa, guiones o material de marketing donde se necesite evitar respuestas evasivas o moralizantes.
- Desarrollo de agentes con razonamiento multi-paso: la combinación de contexto largo y capacidades de razonamiento permite construir agentes que mantienen estado conversacional prolongado y ejecutan tareas complejas.
- Investigación en alineación y seguridad de IA: al ser una versión abliterada, sirve como caso de estudio para analizar el impacto de la eliminación de rechazos en el comportamiento del modelo, comparando con el original.
- Prototipado de aplicaciones con visión: el proyector multimodal permite alimentar imágenes al modelo para tareas de descripción, respuesta a preguntas visuales o análisis de capturas, todo en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones de perplejidad (PPL) sobre wikitext-2 para cada cuantización, comparadas con la línea base f16 (no publicada):

| Archivo | PPL (wikitext-2) | Diferencia vs f16 |
|---|---|---|
| f16 (baseline, no publicado) | 7,1557 ± 0,25104 | - |
| Q5_K_M | 7,1573 ± 0,25055 | +0,0016 |
| IQ4_XS | 7,1583 ± 0,25019 | +0,0026 |
| Q6_K | 7,1689 ± 0,25149 | +0,0132 |
| Q8_0 | 7,1764 ± 0,25195 | +0,0207 |
| Q4_K_M | 7,1814 ± 0,25227 | +0,0257 |
| IQ2_M | 7,8581 ± 0,27481 | +0,7024 |

Según el autor, todas las cuantizaciones excepto IQ2_M son estadísticamente indistinguibles del f16 (el error estándar es ~0,25), por lo que el orden de las filas no es significativo. IQ2_M muestra una degradación notable de +0,70 en PPL.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de archivo + overhead de contexto):
  - IQ2_M: ~10,6 GB (cabe en GPUs de 12 GB como RTX 3060/4070)
  - IQ4_XS: ~15,3 GB (cabe en RTX 4080/4090 de 16-24 GB)
  - Q4_K_M: ~16,8 GB (cabe en RTX 4090 de 24 GB)
  - Q5_K_M: ~19,5 GB (cabe en RTX 4090 o A6000)
  - Q6_K: ~22,4 GB (requiere 24 GB o más)
  - Q8_0: ~29,0 GB (requiere GPU profesional como A100 40 GB o múltiples GPUs)
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; A100/H100 para cuantizaciones altas; GPUs de 12-16 GB para IQ2_M o IQ4_XS con contexto reducido.
- Opciones de despliegue: llama.cpp (incluido llama-server), Ollama, ComfyUI (para visión), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones específicas. La decodificación especulativa con MTP puede acelerar la generación entre 1,5x y 2x en comparación con el modelo sin draft, según la tasa de aceptación (no medida en esta versión).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3 B | 262 144 | Apache 2.0 | safetensors | Modelo original con rechazos intactos |
| Qwen3.8-27B-Uncensored-GGUF (este) | 27,3 B | 262 144 | Apache 2.0 | GGUF | Abliterado, con MTP y visión |
| unsloth/Qwen3.8-27B-GGUF | 27,3 B | 262 144 | Apache 2.0 | GGUF | Cuantizaciones estándar sin abliteración |
| Qwen3.8-27B-Uncensored-OrcaRouter-GGUF | 27,3 B | 262 144 | Apache 2.0 | GGUF | Variante similar con abliteración, de otro autor |

La comparativa directa con otros modelos de la misma categoría (por ejemplo, Llama 3.1 70B o Mistral Large) no está disponible en la información proporcionada. La principal diferencia frente a las alternativas es la reducción de rechazos y la inclusión de la cabeza MTP verificada.

## Limitaciones y advertencias

- La abliteración reduce el comportamiento de rechazo de forma sustancial pero no lo elimina por completo; algunos temas pueden seguir generando respuestas evasivas.
- El proceso de abliteración puede introducir cambios sutiles en la distribución de salidas, aunque la perplejidad se mantiene prácticamente idéntica al modelo base (excepto en IQ2_M).
- La cabeza MTP fue entrenada contra el modelo original sin abliterar, por lo que la tasa de aceptación en decodificación especulativa puede ser ligeramente inferior a la del modelo base.
- Solo se soportan inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Aunque la licencia es Apache 2.0, algunos blogs y repositorios asociados mencionan un uso "research-only" (solo investigación). Se recomienda verificar los términos exactos antes de un despliegue comercial.
- El modelo puede generar contenido ofensivo, sesgado o inapropiado debido a la reducción de rechazos. No es adecuado para aplicaciones orientadas al público general sin moderación adicional.
- La cuantización IQ2_M muestra una degradación significativa de perplejidad (+0,70) y puede producir respuestas de menor calidad; se recomienda usar Q4_K_M o superior para tareas críticas.
- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones específicas para esta versión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Plana-Chan/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta Heretic (abliteration): https://github.com/p-e-w/heretic
- Artículo sobre el modelo: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Guía de ejecución local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Variante OrcaRouter: https://huggingface.co/chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-GGUF
- Cuantizaciones de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio UD3-GGUF: https://github.com/David2024patton/Qwen3.8-27B-Uncensored-UD3-GGUF
