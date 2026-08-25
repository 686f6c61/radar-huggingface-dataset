# mikiiimouse/mikimouse-q-w-e-n-duplicate

## Resumen

El modelo `mikiiimouse/mikimouse-q-w-e-n-duplicate` es una colección de cuantizaciones GGUF del modelo base Qwen/Qwen3.8-27B, modificado mediante abliteración para reducir sustancialmente el comportamiento de rechazo (refusal) del modelo original. El autor, mikiiimouse, ha aplicado la técnica de eliminación de direcciones de rechazo con la herramienta Heretic, que co-minimiza el recuento de rechazos contra la divergencia KL respecto al modelo base, sin fine-tuning ni datos adicionales. El resultado es una versión "uncensored" que conserva las capacidades originales del modelo, incluyendo su cabeza de predicción multi-token (MTP) para decodificación especulativa.

La relevancia de este modelo radica en que ofrece una alternativa cuantizada y desensibilizada de un modelo de 27B parámetros con una ventana de contexto de 262 144 tokens y capacidades de visión, permitiendo su ejecución en hardware más modesto mediante cuantizaciones que van desde IQ2_M (10,6 GB) hasta Q8_0 (29,0 GB). El autor ha verificado explícitamente que los tensores `mtp.*` se conservan y se han injertado correctamente desde el checkpoint base, garantizando que la decodificación especulativa funcione. La licencia Apache 2.0 facilita su uso comercial, aunque conviene revisar los términos del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con MTP head) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer con 64 capas, un vocabulario de 248 320 tokens y una cabeza de predicción multi-token (MTP) de 1 capa, que permite decodificación especulativa. La modificación "uncensored" se realizó mediante abliteración con la herramienta Heretic, que identifica y elimina direcciones en los pesos asociadas al comportamiento de rechazo, actuando sobre `attn.o_proj` y `mlp.down_proj` en la pila principal. El proceso se ejecutó en bf16 sin cuantización intermedia, y la LoRA resultante se fusionó en el modelo base. Los tensores `mtp.*` se copiaron íntegramente del checkpoint original, ya que la abliteración no los modifica. No se realizó fine-tuning ni se añadieron datos de entrenamiento adicionales; las capacidades, datos de entrenamiento y arquitectura del modelo base permanecen sin cambios.

La cuantización se realizó con llama.cpp (commit `a94d563ed`) y se calculó una matriz de importancia (imatrix) directamente desde el modelo f16, utilizando el corpus wikitext-2 raw con 200 chunks. El autor publica tanto archivos fusionados (con MTP integrado) como versiones separadas de target y draft, además de un archivo de visión en f16 si el modelo base incluye torre de visión.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo Qwen3.8-27B, incluyendo tareas de comprensión, generación y razonamiento en inglés y chino.
- Decodificación especulativa: el head MTP retenido permite acelerar la inferencia mediante verificación de tokens múltiples, con una tasa de aceptación ligeramente inferior al modelo original.
- Visión: el modelo base incluye una torre de visión, y se proporciona un archivo `Qwen3.8-27B-Uncensored-vision-f16.gguf` para entrada de imágenes (aunque no se detallan las capacidades exactas).
- Contexto largo: ventana de 262 144 tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Comportamiento "uncensored": reducción sustancial de rechazos a solicitudes que el modelo base podría negarse a responder, aunque no se elimina por completo.
- Multilingüe: soporte para inglés y chino, según la configuración del modelo base.

## Casos de uso

- Despliegue local en hardware consumer: las cuantizaciones IQ2_M (10,6 GB) y Q4_K_M (16,8 GB) caben en GPUs de 12-16 GB, permitiendo ejecutar un modelo de 27B en una RTX 3060 o RTX 4070 con llama.cpp u Ollama.
- Generación de contenido creativo sin restricciones: útil para proyectos de escritura, roleplay o brainstorming donde el modelo base rechazaría ciertas temáticas; la abliteración reduce esos rechazos manteniendo la coherencia.
- Procesamiento de documentos largos: con 262K de contexto, puede resumir o extraer información de libros completos, informes extensos o conversaciones prolongadas en una sola pasada.
- Aplicaciones de visión por computadora: si se usa el archivo de visión f16, puede combinarse con entrada de imágenes para tareas de captioning o VQA, aunque no se especifican detalles.
- Integración en pipelines de generación con decodificación especulativa: los archivos target+draft permiten usar `--model-draft` en llama.cpp para acelerar la inferencia en servidores de producción con vLLM o TGI.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para analizar el impacto de la abliteración en el comportamiento y la calidad de generación, comparando con el modelo base.

## Benchmarks y rendimiento

La model card proporciona mediciones de perplejidad (PPL) en wikitext-2 para cada cuantización, comparadas con el baseline f16 (no publicado). Los resultados son los siguientes:

| Archivo | PPL (wikitext-2) | vs f16 |
|---|---|---|
| f16 (baseline, no enviado) | 7,1557 ± 0,25104 | - |
| Q5_K_M | 7,1573 ± 0,25055 | +0,0016 |
| IQ4_XS | 7,1583 ± 0,25019 | +0,0026 |
| Q6_K | 7,1689 ± 0,25149 | +0,0132 |
| Q8_0 | 7,1764 ± 0,25195 | +0,0207 |
| Q4_K_M | 7,1814 ± 0,25227 | +0,0257 |
| IQ2_M | 7,8581 ± 0,27481 | +0,7024 |

El autor advierte que, salvo IQ2_M, todas las cuantizaciones están dentro del margen de error y no son distinguibles entre sí ni del f16. IQ2_M se sitúa aproximadamente 2,8 errores estándar por encima del baseline, indicando una degradación notable. No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, el archivo GGUF ocupa entre 10,6 GB (IQ2_M) y 29,0 GB (Q8_0). Se debe añadir overhead para contexto y KV cache; con 262K de contexto, la memoria adicional puede ser significativa.
- GPU recomendadas: para IQ2_M o IQ4_XS, una RTX 3060 de 12 GB o RTX 4070 de 12 GB es suficiente; para Q4_K_M o Q5_K_M, se recomienda RTX 4090 (24 GB) o A100 de 40 GB; para Q6_K o Q8_0, se necesitan GPUs de 24 GB o más, como A100 80 GB o H100.
- En consumer GPU: sí, las cuantizaciones más pequeñas (IQ2_M, IQ4_XS) caben en GPUs de 12-16 GB, aunque el contexto largo puede requerir más memoria.
- Opciones de despliegue: llama.cpp (incluyendo `llama-server`), Ollama, y cualquier runtime compatible con GGUF como LM Studio. Para decodificación especulativa, se puede usar `--model-draft` con el archivo draft separado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Comportamiento |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | no disponible (pesos originales) | Apache 2.0 (verificar) | Estándar, con rechazos |
| mikimouse-q-w-e-n-duplicate | 27B | 262K | IQ2_M a Q8_0 | Apache 2.0 | Uncensored (abliterado) |
| Otros modelos uncensored (p.ej. Dolphin) | variable | variable | variable | variable | Variable, a menudo fine-tuning |

La comparativa directa con otros modelos uncensored no es posible con los datos disponibles, ya que no se han publicado benchmarks comparativos. La principal diferencia con el modelo base es la reducción de rechazos y la disponibilidad de cuantizaciones GGUF listas para usar.

## Limitaciones y advertencias

- El comportamiento "uncensored" no está completamente eliminado: el autor indica que el rechazo se ha reducido sustancialmente, pero no eliminado. Algunas solicitudes pueden seguir siendo rechazadas.
- Riesgo de alucinación: heredado del modelo base, y la cuantización (especialmente IQ2_M) puede aumentar la probabilidad de errores.
- Idiomas limitados: solo inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- La licencia Apache 2.0 del repo no exime de revisar la licencia del modelo base Qwen3.8-27B, que puede tener términos adicionales para uso comercial.
- La cuantización IQ2_M muestra una degradación significativa en perplejidad (PPL 7,86 vs 7,16 del f16), por lo que no se recomienda para tareas que requieran alta precisión.
- El head MTP puede tener una tasa de aceptación ligeramente inferior al modelo original, ya que fue entrenado contra el modelo sin abliterar; la verificación de tokens garantiza que la calidad de salida no se vea afectada.
- No se han publicado evaluaciones de seguridad, sesgos o robustez; el uso en producción debe considerar estos aspectos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mikiiimouse/mikimouse-q-w-e-n-duplicate
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta Heretic (abliteración): https://github.com/p-e-w/heretic
- Dataset wikitext (para imatrix y PPL): https://huggingface.co/datasets/Salesforce/wikitext
