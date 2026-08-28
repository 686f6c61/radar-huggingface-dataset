# mradermacher/Qwen3.6-35B-A3B-heretic-v2-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.6-35B-A3B-heretic-v2-i1-GGUF` es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo base `trohrbaugh/Qwen3.6-35B-A3B-heretic-v2`, una versión "heretic" (desensurada y abliterada) del Qwen3.6-35B-A3B de la familia Qwen. Este modelo base es un MoE disperso con 35.505 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, diseñado para inferencia eficiente en servidores de contexto largo. La variante heretic elimina los mecanismos de rechazo y censura del modelo original, ofreciendo respuestas sin restricciones de seguridad, lo que lo hace adecuado para entornos de investigación donde se requiere generar contenido no filtrado.

La cuantización realizada por mradermacher incluye múltiples niveles (desde i1-Q2_K hasta i1-Q6_K) con pesos ponderados e imatrix, lo que permite a los usuarios elegir el equilibrio entre tamaño, velocidad y calidad. El repositorio contiene únicamente archivos GGUF, sin los pesos originales en safetensors, y está pensado para su uso con motores de inferencia compatibles con GGUF como llama.cpp, Ollama o LM Studio. La licencia declarada es Apache 2.0, aunque el modelo base original de Qwen3.6-35B-A3B utiliza la licencia Tongyi Qianwen, por lo que conviene verificar los términos exactos antes de un despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso con atención híbrida (tipo Qwen3.5) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, además de archivo imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (según el repositorio; verificar términos del modelo base) |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformador de mezcla de expertos (MoE) con una arquitectura de atención híbrida, similar a la de los modelos Qwen3.5. Esta arquitectura combina atención completa y atención dispersa para manejar secuencias largas de manera eficiente, activando solo unos 3.000 millones de parámetros por token. El modelo original fue entrenado por Alibaba sobre un corpus multilingüe extenso, aunque la versión heretic ha sido sometida a un proceso de "abliteración" que elimina las capas de rechazo y las directrices de seguridad, resultando en un comportamiento sin censura. Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se han publicado en la información disponible.

La cuantización imatrix de mradermacher utiliza una matriz de importancia calculada sobre un conjunto de datos de calibración para mejorar la calidad de los quants de baja precisión. Los archivos GGUF resultantes son compatibles con motores como llama.cpp, que implementan la decodificación especulativa y otras optimizaciones para acelerar la inferencia en hardware variado.

## Capacidades

- Generación de texto libre y conversacional en inglés, con un estilo natural y sin filtros de contenido.
- Razonamiento multi-paso y resolución de problemas complejos, gracias a la arquitectura MoE de 3B activos que mantiene una alta capacidad efectiva.
- Generación de código y asistencia en tareas de programación, aunque no se han publicado benchmarks específicos.
- Capacidades de visión (según la model card, es un modelo de visión), aunque los archivos mmproj no están incluidos en este repositorio y deben descargarse del repositorio estático.
- Soporte para tool calling y function calling, probablemente heredado del modelo Qwen3.6 base, aunque no está explícitamente documentado en la información proporcionada.
- Capacidades multilingües limitadas al inglés en esta versión; el modelo base original soporta más idiomas, pero la variante heretic solo declara `en`.
- Modo "thinking" o razonamiento extendido, típico de la familia Qwen3, aunque no se confirma en los metadatos.

## Casos de uso

- Investigación en generación de lenguaje sin censura: el modelo permite estudiar los límites de la alineación y el comportamiento de modelos abliterados en tareas de generación creativa o exploración de contenido controvertido, sin las restricciones habituales de los modelos comerciales.
- Desarrollo de asistentes conversacionales para nichos específicos (por ejemplo, juegos de rol, escritura de ficción adulta o diálogos no filtrados) donde se requiere una respuesta libre de rechazos.
- Generación de código en entornos de desarrollo donde se necesita un asistente que no imponga políticas de uso, siempre que se respete la licencia y la legislación aplicable.
- Prototipado rápido de aplicaciones de chat con GGUF en hardware de consumo: gracias a los quants de 13-29 GB, se puede ejecutar en GPUs de 16-24 GB con llama.cpp u Ollama.
- Evaluación comparativa de técnicas de cuantización: la amplia gama de niveles i1 permite medir la degradación de calidad frente a tamaño en un mismo modelo base.
- Despliegue en servidores de baja latencia con vLLM o TGI, aprovechando el MoE de 3B activos para servir múltiples peticiones concurrentes con un throughput alto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para esta variante cuantizada. Se recomienda consultar el repositorio del modelo base `trohrbaugh/Qwen3.6-35B-A3B-heretic-v2` o los papers de Qwen3.6 para obtener referencias de rendimiento del modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: según el nivel de cuantización, los archivos GGUF varían entre 13,3 GB (i1-Q2_K) y 29,3 GB (i1-Q6_K). Para una calidad razonable, se recomienda el i1-Q4_K_M (21,8 GB), que cabe en una GPU de 24 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para quants hasta Q4_K_M; A100 40 GB o H100 para quants mayores o para servir múltiples peticiones.
- Sí cabe en GPUs de consumo (16-24 GB) con quants de hasta Q4_K_M, aunque la velocidad dependerá del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte para GGUF), TGI (con conversión previa), y cualquier motor compatible con el formato GGUF.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, la cuantización y el número de tokens generados. Al ser un MoE con 3B activos, el throughput en servidores con vLLM puede ser alto, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. Como referencia cualitativa:

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (original) | 35,5 B | ~3 B | no disponible | Tongyi Qianwen | safetensors |
| Qwen3.6-35B-A3B-heretic-v2 (base) | 35,5 B | ~3 B | no disponible | Apache 2.0 (según repo) | safetensors |
| Qwen3.6-35B-A3B-heretic-v2-i1-GGUF (este) | 35,5 B | ~3 B | no disponible | Apache 2.0 | GGUF |

La principal diferencia frente al modelo original es la eliminación de la censura y la disponibilidad en formato GGUF para despliegue ligero. Otros modelos similares en tamaño (por ejemplo, Qwen3-30B-A3B) no son directamente comparables sin datos de benchmarks.

## Limitaciones y advertencias

- El modelo está diseñado para generar contenido sin censura, lo que implica un alto riesgo de producir respuestas ofensivas, ilegales o dañinas. No debe utilizarse en aplicaciones orientadas al público general sin una moderación externa.
- La abliteración puede degradar el rendimiento en tareas que requieren adherencia a instrucciones de seguridad, como la generación de contenido seguro o el filtrado de información sensible.
- Solo se declara soporte para inglés; el rendimiento en otros idiomas puede ser deficiente o no estar disponible.
- La licencia Apache 2.0 declarada en el repositorio puede entrar en conflicto con la licencia original del modelo base (Tongyi Qianwen), que impone restricciones de uso comercial. Es imprescindible verificar los términos antes de un despliegue en producción.
- Los archivos GGUF de este repositorio no incluyen el proyector de visión (mmproj); para usar las capacidades de visión, hay que descargar los archivos adicionales del repositorio estático.
- La longitud de contexto no se ha especificado; se recomienda probar con secuencias cortas y aumentar gradualmente para evitar degradación.
- Al ser una cuantización, la calidad de las respuestas puede verse afectada en comparación con el modelo en precisión completa, especialmente en los quants de menor tamaño.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-heretic-v2-i1-GGUF
- Repositorio estático con quants sin imatrix y archivos mmproj: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-heretic-v2-GGUF
- Modelo base (safetensors): https://huggingface.co/trohrbaugh/Qwen3.6-35B-A3B-heretic-v2
- Documentación de vLLM Ascend para Qwen3.6-35B-A3B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.6-35B-A3B.html
- Repositorio de despliegue con decodificación especulativa (DGX Spark): https://github.com/tobias-weiss-ai-xr/Qwen3.6-NVFP4-DFlash
- Página de mradermacher para solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
