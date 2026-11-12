# richardyoung/gemma-4-31B-it-DiM-heretic-GGUF

## Resumen

`richardyoung/gemma-4-31B-it-DiM-heretic-GGUF` es una compilación de cuantizaciones GGUF del modelo `richardyoung/gemma-4-31B-it-DiM-heretic`, una versión "abliterada" (con la dirección de rechazo eliminada) de `google/gemma-4-31B-it`. El proceso de abliteración se realizó con Heretic 2.0 mediante ablación de la dirección de rechazo por diferencia de medias (DiM), ajustada por la búsqueda automática de Heretic. El autor, Richard J. Young, publica estos ficheros como material de investigación sobre eliminación de rechazos y su evaluación, no como asistente de propósito general.

El modelo cuenta con 30.697.345.596 parámetros (aproximadamente 30,7 mil millones) y se distribuye exclusivamente en formato GGUF para su uso con llama.cpp y Ollama. El repositorio ocupa 51,4 GB e incluye cuantizaciones Q4_K_M (18,7 GB, etiqueta `latest` en Ollama) y Q8_0 (32,6 GB), además de una matriz de importancia (imatrix) de 28 MB. Están anunciadas cuantizaciones adicionales IQ3_M, IQ4_XS, Q5_K_M y Q6_K.

La relevancia de esta ficha radica en su carácter instrumental: sirve para estudiar si la abliteración es cada vez más difícil en modelos recientes y para evaluar defensas frente a la eliminación de rechazos. El modelo base acepta imágenes, pero el proyector de visión no está incluido en esta compilación, por lo que el uso es únicamente de texto. La licencia declarada es Apache 2.0, con enlace a la licencia de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; detalles de arquitectura no incluidos en la información proporcionada) |
| Parametros totales | 30.697.345.596 (≈30,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (publicadas); IQ3_M, IQ4_XS, Q5_K_M, Q6_K (anunciadas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base Gemma 4 más allá de su naturaleza transformer implícita en la familia Gemma; no se especifican número de capas, dimensión oculta, mecanismos de atención ni si emplea innovaciones como atención lineal o decodificación especulativa. Tampoco se documentan los datos de entrenamiento originales (número de tokens, composición del corpus) ni las etapas de alineación (RLHF, DPO) del modelo base.

Lo que sí está documentado es el procedimiento de abliteración: se aplicó Heretic 2.0 con ablación de la dirección de rechazo por diferencia de medias (DiM), con una búsqueda de 100 ensayos. La regla de selección fue el menor número de rechazos por palabra clave en el conjunto de desarrollo, sujeto a una divergencia KL de primer token desde el original menor o igual a 0,1. El ensayo seleccionado produjo 98 rechazos por palabra clave sobre los 100 prompts de ajuste y una divergencia KL de primer token de 0,093. La conversión a GGUF se realizó con llama.cpp (commit `468fde9`) mediante `convert_hf_to_gguf.py --outtype bf16` y posterior `llama-quantize` en CPU; IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la matriz de importancia (calibración `calibration_datav3`, 128 fragmentos de 512 tokens calculada sobre la build Q8_0), mientras que Q6_K y Q8_0 son estáticas.

## Capacidades

- Generación de texto conversacional en inglés, con el pipeline `text-generation`.
- Eliminación parcial del comportamiento de rechazo: el modelo cumple muchas peticiones que el original rechaza, según la model card.
- Razonamiento y generación de código: no se documentan evaluaciones específicas en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales: el modelo base acepta imágenes, pero el proyector de visión no está incluido en esta compilación GGUF, por lo que el uso es solo texto.
- Modo "thinking": no disponible.

## Casos de uso

- Investigación sobre abliteración: utilizar el modelo para reproducir y medir la eliminación de rechazos con jueces automáticos (por ejemplo, WildGuard) y comparar con el modelo original, dado que el autor publica las cifras de referencia (89,3 % de rechazo en el original frente a 90,1 % en el modelo abliterado sobre 972 prompts retenidos).
- Evaluación de defensas frente a la eliminación de rechazos: emplear el modelo como adversario controlado para probar mecanismos de seguridad, clasificadores de contenido o filtros de salida en pipelines de moderación.
- Estudio de sensibilidad a la cuantización: comparar el comportamiento de rechazo entre Q4_K_M (18,7 GB) y Q8_0 (32,6 GB) para determinar si la cuantización altera la tasa de cumplimiento, algo que la model card advierte explícitamente que no fue evaluado en el paper.
- Reproducción de experimentos en hardware de consumo: desplegar Q4_K_M con Ollama o llama.cpp en una GPU consumer para validar resultados del paper sin acceso a infraestructura de datacenter.
- Análisis de divergencia KL y fidelidad al modelo original: usar la build Q8_0 como referencia casi sin pérdida y medir la degradación de calidad en cuantizaciones más agresivas.
- Docencia y formación en seguridad de LLM: ilustrar en entornos controlados cómo se construye una dirección de rechazo y cómo se elimina, usando las cuantizaciones como material didáctico reproducible.

## Benchmarks y rendimiento

Los únicos datos publicados se refieren al modelo en precisión completa (bf16), no a las cuantizaciones GGUF de este repositorio.

| Métrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts dañinos retenidos (juez WildGuard) | 89,3 % | 90,1 % (876/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 98 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | no disponible | 0,093 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ocupa 18,7 GB en disco y requiere aproximadamente esa cifra de VRAM para cargarse completo en GPU; Q8_0 ocupa 32,6 GB y requiere un orden de magnitud similar.
- GPU recomendadas: para Q8_0, A100 40 GB, H100 80 GB o RTX 4090 24 GB (esta última solo si se ajusta con cuidado o se usa offloading parcial); para Q4_K_M, RTX 4090 24 GB, RTX 3090 24 GB o GPUs con 20 GB o más.
- ¿Cabe en GPU consumer? Q4_K_M sí cabe en RTX 4090/3090 (24 GB) y en GPUs de 20 GB o más; Q8_0 no cabe en GPUs consumer de 24 GB sin offloading a CPU o memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run richardyoung/gemma-4-31b-it-dim-heretic`), y cualquier runtime compatible con GGUF; el repositorio está etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-DiM-heretic-GGUF (este) | 30,7 B | no disponible | GGUF | apache-2.0 | Abliterado con Heretic 2.0 (DiM); solo texto |
| google/gemma-4-31B-it (original) | ≈30,7 B | no disponible | safetensors | licencia Gemma 4 | Modelo base sin abliterar; acepta imágenes |
| richardyoung/gemma-4-31B-it-DiM-heretic | ≈30,7 B | no disponible | safetensors | apache-2.0 | Versión abliterada en precisión completa, base de estas cuantizaciones |

No se dispone de información sobre otras alternativas comparables (por ejemplo, otras variantes abliteradas de la misma familia o de familias distintas) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo elimina parcialmente el comportamiento de rechazo; el autor lo publica para investigación sobre abliteración, no como asistente de propósito general.
- Las cifras de rechazo del paper (90,1 % sobre 972 prompts) corresponden al modelo en bf16; la model card advierte que las cuantizaciones GGUF no fueron evaluadas y que la cuantización puede alterar el comportamiento de rechazo.
- Solo admite texto en esta compilación: el proyector de visión del modelo base no está incluido.
- Idioma limitado al inglés según el campo `language`.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información proporcionada, pero aplicables por herencia del modelo base.
- Restricciones de licencia: se declara apache-2.0 con enlace a la licencia de Gemma 4 de Google; conviene revisar dicha licencia para uso comercial, ya que el modelo base es de Google.
- Longitud de contexto no documentada; no se debe asumir una ventana concreta sin verificarla en el modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Los usuarios son responsables del uso lícito; el autor no ofrece garantías.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/richardyoung/gemma-4-31B-it-DiM-heretic-GGUF
- Modelo base abliterado en safetensors: https://huggingface.co/richardyoung/gemma-4-31B-it-DiM-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper citado (arXiv, enlace pendiente de añadir según la model card): no disponible
- Repositorio llama.cpp (usado para la conversión, commit `468fde9`): no disponible como enlace explícito en la información proporcionada
