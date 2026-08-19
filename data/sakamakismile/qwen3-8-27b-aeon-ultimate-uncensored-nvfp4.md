# sakamakismile/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4

## Resumen

El modelo Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4 es una cuantización NVFP4 (W4A4, group 16) del modelo base AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, publicada por el usuario sakamakismile. Esta versión reduce el peso de 55,6 GB a 20,58 GB, lo que permite ejecutar un modelo de 27,36 mil millones de parámetros en dos GPUs de 16 GB con margen para la caché KV. Está diseñada específicamente para GPUs Blackwell (SM120) y la librería vLLM, aprovechando la decodificación especulativa mediante un cabezal MTP conservado en bf16. El modelo base es una variante "uncensored" de Qwen3.8-27B, con arquitectura híbrida que incluye atención DeltaNet y torre de visión, y soporta razonamiento y generación de código. La cuantización mantiene en bf16 las capas críticas (lm_head, visión, conv1d de DeltaNet y MTP) para preservar la calidad, mientras que el resto se cuantiza a 4 bits. Con licencia Apache 2.0 y una ventana de contexto de 32.768 tokens, este modelo está orientado a despliegues de alto rendimiento en entornos Blackwell, aunque presenta ciertas advertencias para su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (híbrida, con atención DeltaNet y torre de visión) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4, group 16) con capas en bf16 (lm_head, visión, conv1d, MTP) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 pertenece a la familia Qwen3.8 y emplea una arquitectura híbrida que combina atención por transformador con una capa de atención lineal DeltaNet (conv1d) y una torre de visión. Incluye un cabezal MTP (Multi-Token Prediction) que habilita la decodificación especulativa. La cuantización NVFP4 se realizó con llm-compressor, aplicando W4A4 con grupo de 16 sobre los módulos lineales, excluyendo lm_head, la torre de visión, el conv1d de DeltaNet y el cabezal MTP, que se mantienen en bf16. Se utilizaron 32 muestras de calibración de 8192 tokens del dataset neuralmagic/calibration. El proceso de cuantización se completó en 122 segundos en 7 GPUs RTX PRO 2000 Blackwell. No se dispone de información sobre el entrenamiento del modelo base (datos, número de tokens, RLHF, etc.), ya que la model card solo describe la cuantización.

## Capacidades

- Generación de texto y razonamiento: el modelo es capaz de realizar tareas de razonamiento complejo, con un modo de "thinking" que consume parte del presupuesto de tokens.
- Generación de código: soporta generación de código en varios lenguajes, aunque se ha detectado un bug intermitente que omite un paréntesis de cierre en archivos de código largos.
- Decodificación especulativa: gracias al cabezal MTP preservado en bf16, el modelo admite decodificación especulativa con vLLM, mejorando el throughput.
- Capacidades multilingües: aunque no se especifican los idiomas, el modelo base Qwen3.8 es multilingüe; se ha verificado su funcionamiento en japonés.
- Visión: al conservar la torre de visión en bf16, el modelo mantiene capacidades multimodales (aunque no se detallan en la ficha).
- Tool calling y agentes: no confirmado en la documentación disponible.

## Casos de uso

- Inferencia de alto rendimiento en GPUs Blackwell: el modelo está optimizado para vLLM en arquitectura SM120, alcanzando 377,8 tokens/s agregados con 8 concurrencias en 4× RTX PRO 2000 Blackwell, ideal para servir múltiples peticiones simultáneas.
- Despliegue en entornos con memoria limitada: al reducir el peso a 20,58 GB, cabe en dos GPUs de 16 GB, permitiendo ejecutar un modelo de 27B en hardware de gama media.
- Generación de código con verificación sintáctica: dado el bug de paréntesis, se recomienda integrar un comprobador de sintaxis en el bucle de generación para aplicaciones de autocompletado o generación de archivos completos.
- Asistentes conversacionales sin censura: al ser una variante "uncensored", puede usarse en entornos donde se requiera libertad de contenido, aunque con los riesgos asociados.
- Razonamiento matemático y lógico: se ha verificado su capacidad en aritmética y primalidad, por lo que puede emplearse en tutorías o herramientas educativas.
- Procesamiento de lenguaje natural multilingüe: su soporte para japonés y otros idiomas (no especificados) lo hace útil para traducción o generación de contenido en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia en hardware Blackwell:

| Configuración | Concurrencia | Throughput agregado (tokens/s) |
|---|---|---|
| TP=4, 32k ctx, KV fp8, MTP n=3 | 1 | 69,0 |
| TP=4, 32k ctx, KV fp8, MTP n=3 | 4 | 202,3 |
| TP=4, 32k ctx, KV fp8, MTP n=3 | 8 | 377,8 |

Además, el prefill de un prompt de 8k tokens alcanza 3.720 tokens/s (máximo 3.888) con caché de prefijo desactivada, y la caché KV de GPU soporta 619.613 tokens en esa configuración.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa 20,58 GB, por lo que cabe en dos GPUs de 16 GB (32 GB totales) con margen para la caché KV.
- GPUs recomendadas: arquitectura Blackwell (SM120), como RTX PRO 2000 Blackwell. Se ha probado con 4× RTX PRO 2000 Blackwell para TP=4.
- Compatibilidad con GPUs de consumo: no se menciona, pero al requerir SM120, las GPUs de consumo actuales (RTX 40 series) no son compatibles; se necesitan GPUs Blackwell profesionales o futuras.
- Opciones de despliegue: vLLM v0.22.0 (o superior) con compressed-tensors auto-detectado. No se mencionan otras herramientas como llama.cpp u Ollama.
- Latencia y throughput: con TP=4 y MTP n=3, se obtienen 69 t/s en single-stream y hasta 377,8 t/s agregados con 8 concurrencias. El prefill alcanza 3.720 t/s en prompts de 8k.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base BF16 (AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16) es la referencia directa, pero no se han publicado métricas de rendimiento comparativas. Tampoco se conocen otros modelos cuantizados NVFP4 de tamaño similar en el momento de la consulta.

## Limitaciones y advertencias

- El modelo es una variante "uncensored", lo que implica que puede generar contenido inapropiado o dañino sin filtros; debe usarse con precaución y bajo responsabilidad del desarrollador.
- Se ha detectado un bug intermitente en la generación de código largo: aproximadamente 1-2 veces de cada 14, se omite un paréntesis de cierre, independientemente de la temperatura. Se recomienda un bucle de verificación sintáctica.
- El modo de razonamiento puede consumir todo el presupuesto de tokens si no se configura adecuadamente; se sugiere usar `max_tokens ≥ 4096` o `reasoning_effort: "low"` para generación larga.
- No se deben eliminar los módulos `mtp.*` de `quantization_config.ignore`, ya que rompería la decodificación especulativa (0% de aceptación).
- La cuantización W4A16 (NVFP4A16) no funciona en vLLM 0.22 con esta arquitectura; solo es compatible W4A4.
- No se han publicado resultados de benchmarks de calidad, por lo que se desconoce el impacto exacto de la cuantización en tareas como MMLU o HumanEval.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales (no se especifican).

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/sakamakismile/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
