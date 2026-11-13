# richardyoung/Qwen2.5-32B-Instruct-DiM-heretic-GGUF

## Resumen

Qwen2.5-32B-Instruct-DiM-heretic-GGUF es una compilación de cuantizaciones GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-DiM-heretic, una versión "abliterada" (con la conducta de rechazo eliminada) de Qwen/Qwen2.5-32B-Instruct. El autor, Richard J. Young, aplicó la técnica Heretic 2.0, basada en la ablación de la dirección de rechazo mediante diferencia de medias (difference-in-means, DiM), con una búsqueda de 100 ensayos que selecciona la configuración con menos rechazos en el conjunto de desarrollo manteniendo una divergencia KL de primer token inferior a 0,1. El resultado es un modelo que responde a muchas peticiones que el original rechaza, con una tasa de rechazo del 47,4 % frente al 76,8 % del modelo base sobre 972 prompts dañinos reservados.

El modelo conserva la arquitectura y el tamaño del Qwen2.5-32B-Instruct original: un transformer denso de 32.763.876.352 parámetros (aproximadamente 32,8 mil millones), con licencia Apache 2.0 y ventana de contexto de 32.768 tokens según la especificación de la familia Qwen2.5. Los archivos publicados son cuantizaciones GGUF para llama.cpp y Ollama, con tamaños que van desde 19,9 GB (Q4_K_M) hasta 34,8 GB (Q8_0), más una matriz de importancia de 30 MB para las cuantizaciones que la utilizan.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de investigación sobre eliminación de rechazos y su evaluación, tal como declara el propio autor; por otro, advierte de que no se trata de un asistente de propósito general, sino de un modelo cuyo comportamiento de seguridad ha sido alterado deliberadamente y cuyas cuantizaciones no fueron evaluadas en el artículo de referencia, por lo que la cuantización puede modificar la conducta de rechazo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-32B-Instruct) |
| Parámetros totales | 32.763.876.352 (32,8 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (según la familia Qwen2.5; no se detalla en la model card) |
| Tipos de cuantización | Q4_K_M, Q8_0; en preparación IQ3_M, IQ4_XS, Q5_K_M, Q6_K; matriz de importancia (imatrix) incluida |
| Idiomas soportados | en (inglés, declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer denso de 32,8 mil millones de parámetros entrenado por Alibaba Qwen. Sobre ese modelo, el autor aplicó Heretic 2.0, un procedimiento de ablación de la dirección de rechazo mediante diferencia de medias (DiM): se calcula una dirección en el espacio de activaciones que separa las respuestas de rechazo de las de cumplimiento y se resta de los pesos, con una búsqueda de 100 ensayos que optimiza el número de rechazos en el conjunto de desarrollo sujeto a una divergencia KL de primer token máxima de 0,1 respecto al original. La configuración seleccionada produjo 89 rechazos por palabra clave sobre los 100 prompts de ajuste y una divergencia KL de primer token de 0,018.

Los archivos GGUF se generaron con llama.cpp (commit `468fde9`) mediante `convert_hf_to_gguf.py --outtype bf16` y posterior `llama-quantize` sobre CPU, partiendo de la revisión `e3c2d41b22fe` del modelo safetensors, con verificación SHA-256 de cada archivo de pesos. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la matriz de importancia calculada sobre la build Q8_0 con `calibration_datav3` (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estáticas. Cada archivo Q4_K_M se cargó y respondió a un prompt de prueba antes de la subida. No se detalla en la información disponible el volumen de tokens de entrenamiento del modelo base ni la composición de su dataset, más allá de lo publicado por Qwen para la familia Qwen2.5.

## Capacidades

- Generación de texto conversacional multi-turno, con el pipeline `text-generation` y formato conversacional.
- Razonamiento, código y matemáticas heredados del Qwen2.5-32B-Instruct original.
- Cumplimiento de peticiones que el modelo original rechaza: la tasa de rechazo baja del 76,8 % al 47,4 % sobre 972 prompts dañinos reservados (juicio con WildGuard).
- Ejecución local mediante llama.cpp y Ollama, con archivos GGUF listos para usar.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingües: la model card declara únicamente inglés (`en`); no se documentan otras lenguas en esta ficha.
- No se documentan en la información disponible capacidades de visión, audio, tool calling explícito ni modo de razonamiento extendido para esta variante.

## Casos de uso

- Investigación sobre eliminación de rechazos: el modelo sirve como artefacto experimental para medir la eficacia de la ablación DiM y comparar tasas de rechazo antes y después, tal como se hace en el artículo citado con 972 prompts reservados y juicio WildGuard.
- Evaluación de defensas frente a la abliteración: permite probar clasificadores de seguridad, filtros de salida y mecanismos de alineación adicional contra un modelo deliberadamente desafinado en seguridad.
- Estudio del efecto de la cuantización en la conducta de rechazo: al publicarse varias cuantizaciones (Q4_K_M, Q8_0 y próximamente IQ3_M, IQ4_XS, Q5_K_M, Q6_K), permite comparar si la pérdida de precisión altera la tasa de cumplimiento, algo que el autor advierte que no fue evaluado en el artículo.
- Reproducibilidad de experimentos: los SHA-256 incluidos en `SHA256SUMS` y la revisión fijada del modelo base permiten replicar la conversión y la cuantización con llama.cpp en un entorno controlado.
- Despliegue local en estaciones de trabajo con GPU de consumo: la variante Q4_K_M (19,9 GB) puede ejecutarse con llama.cpp u Ollama en equipos con suficiente VRAM o con descarga parcial a CPU, útil para pruebas offline sin dependencia de API.
- Análisis de robustez de pipelines de moderación: integrar el modelo como generador adversario en pruebas de red teaming para validar que los filtros de producción detectan contenido que el modelo base rechazaría.
- Docencia y divulgación técnica: ilustrar en un curso o taller cómo se modifica la dirección de rechazo en el espacio de activaciones y cómo se mide su efecto con métricas de divergencia KL y tasas de rechazo.

## Benchmarks y rendimiento

| Métrica | Original (Qwen2.5-32B-Instruct) | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts dañinos reservados (juicio WildGuard) | 76,8 % | 47,4 % (461/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 89 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | no disponible | 0,018 |

Los datos corresponden al modelo en precisión completa (bf16) y provienen del artículo del autor; las cuantizaciones GGUF publicadas no fueron evaluadas en el artículo. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 GB para Q4_K_M (archivo de 19,9 GB) y aproximadamente 35 GB para Q8_0 (archivo de 34,8 GB), sin contar el espacio de contexto y el overhead del runtime.
- GPU recomendadas: A100 40 GB o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) o A6000 (48 GB) para Q4_K_M; para Q8_0 en consumer se requiere descarga parcial a CPU o GPUs de 48 GB.
- ¿Cabe en GPU de consumo? Q4_K_M cabe en RTX 4090 (24 GB) y en RTX 3090 (24 GB) con margen ajustado; Q8_0 no cabe en GPUs de 24 GB sin offloading.
- Opciones de despliegue: llama.cpp (`llama-cli -hf richardyoung/Qwen2.5-32B-Instruct-DiM-heretic-GGUF:Q4_K_M`), Ollama (`ollama run hf.co/richardyoung/Qwen2.5-32B-Instruct-DiM-heretic-GGUF:Q4_K_M`); el formato GGUF es compatible con otros frontends basados en llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Conducta de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-DiM-heretic-GGUF (este) | 32,8 mil millones | 32.768 tokens (familia Qwen2.5) | 47,4 % en 972 prompts reservados | apache-2.0 | GGUF en Hugging Face |
| Qwen/Qwen2.5-32B-Instruct (original) | 32,8 mil millones | 32.768 tokens (familia Qwen2.5) | 76,8 % en 972 prompts reservados | apache-2.0 | safetensors y GGUF de terceros |
| richardyoung/Qwen2.5-32B-Instruct-DiM-heretic (bf16) | 32,8 mil millones | 32.768 tokens (familia Qwen2.5) | 47,4 % en 972 prompts reservados | apache-2.0 | safetensors |

No se dispone en la información proporcionada de comparaciones con otros modelos abliterados de la misma familia ni de resultados de benchmarks estándar que permitan una comparación de rendimiento general.

## Limitaciones y advertencias

- Modelo desafinado en seguridad: la ablación elimina parte de la conducta de rechazo, por lo que cumple peticiones que el original rechaza; el autor lo publica para investigación sobre abliteración, no como asistente de propósito general.
- Sesgos: no documentados en la información disponible; al heredar el modelo base, arrastra los sesgos de Qwen2.5-32B-Instruct, que no se detallan en esta ficha.
- Riesgo de alucinación: no cuantificado en la información disponible; el proceso de ablación puede afectar a la calibración, pero no hay datos publicados al respecto.
- Idiomas: la model card declara únicamente inglés; el comportamiento en castellano u otras lenguas no está evaluado.
- Licencia: Apache 2.0, con las mismas restricciones de uso que el modelo fuente; el usuario es responsable del uso lícito.
- Cuantización no evaluada: las build GGUF no fueron evaluadas en el artículo y la cuantización puede alterar la conducta de rechazo, por lo que los porcentajes de la tabla de benchmarks no son extrapolables a Q4_K_M ni Q8_0.
- Tamaño del repositorio: 54,7 GB, lo que exige espacio en disco y ancho de banda considerables para descargar todas las variantes.
- Madurez del artefacto: 0 descargas y 1 like en el momento de la consulta, con fecha de creación de 2026-11-13; las cuantizaciones IQ3_M, IQ4_XS, Q5_K_M y Q6_K están anunciadas pero aún no publicadas.
- Contexto: la longitud de 32.768 tokens se toma de la familia Qwen2.5 y no se verifica explícitamente en la model card de esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-DiM-heretic-GGUF
- Modelo base safetensors: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-DiM-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Artículo citado (arXiv pendiente de enlace): Young, R. J. *Is Abliteration Getting Harder? Not Uniformly: Refusal Removal by Direction-Based Ablation and ARA in Heretic on the Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 LLMs Versus Their Predecessors*, 2026.
