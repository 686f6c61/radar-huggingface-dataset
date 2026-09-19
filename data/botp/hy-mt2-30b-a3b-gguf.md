# botp/Hy-MT2-30B-A3B-GGUF

## Resumen

Hy-MT2-30B-A3B es un modelo de traducción automática multilingüe desarrollado por Tencent Hunyuan (familia Hy-MT2), distribuido aquí en formato GGUF por el usuario `botp`. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 30.064.725.888 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, según la nomenclatura "A3B" del nombre. Forma parte de una familia que incluye también variantes de 1,8B y 7B, todas orientadas a traducción entre 33 idiomas y a seguir instrucciones de traducción en varios idiomas.

El modelo está diseñado para escenarios de traducción del mundo real: traducción general, dominios especializados, terminología controlada y tareas de negocio. La model card del autor original afirma que las variantes de 7B y 30B-A3B superan en modo "fast-thinking" a modelos abiertos como DeepSeek-V4-Pro y Kimi K2.6, mientras que la variante ligera de 1,8B supera globalmente a APIs comerciales de proveedores como Microsoft y Doubao. Se publica junto a IFMTBench, un banco de pruebas para evaluar el seguimiento de instrucciones de traducción.

Esta ficha corresponde específicamente al repositorio de cuantizaciones GGUF publicado por `botp`, no al modelo original de Tencent. El repositorio tiene un tamaño de 50,2 GB y usa cuantización con imatrix, lo que lo hace desplegable en llama.cpp y entornos compatibles con GGUF. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), segun nomenclatura "30B-A3B" de la familia Hy-MT2 |
| Parametros totales | 30.064.725.888 (dato real de safetensors) |
| Parametros activos | Aproximadamente 3.000 millones por token (segun nomenclatura "A3B"; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (niveles concretos no detallados en la informacion disponible); la familia incluye FP8 y, en la variante 1.8B, cuantizaciones de 2 bits y 1,25 bits vía AngelSlim |
| Idiomas soportados | 36 codigos declarados en el repositorio: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug. La model card original indica 33 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizacion de terceros); la libreria declarada es transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de tipo Mixture of Experts: el nombre "30B-A3B" indica 30.000 millones de parametros totales y alrededor de 3.000 millones activos por token, patron habitual en modelos MoE de la familia Hunyuan. Esto implica que, aunque el modelo requiere cargar en memoria el conjunto completo de pesos (los 30B), el coste computacional por token se aproxima al de un modelo denso de 3B, lo que mejora el throughput en inferencia. La familia Hy-MT2 se presenta como de "pensamiento rapido" (fast-thinking), es decir, orientada a baja latencia frente a modelos con cadenas de razonamiento largas.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card remite al informe tecnico en arXiv (2605.22064) para el analisis experimental completo. Los modelos de la familia admiten instrucciones de traduccion en varios idiomas, con soporte explicito para prompts en chino e ingles, y permiten inyectar glosarios de terminologia en el propio prompt (pares "texto origen -> texto destino") antes del texto a traducir. Esta cuantizacion GGUF concreta ha sido generada por un tercero (`botp`) usando imatrix, un metodo de calibracion que ajusta la cuantizacion por capas segun su importancia.

## Capacidades

- Traduccion automatica multilingue entre 33-36 idiomas, incluidos pares con recursos limitados como tibetano (bo), khmer (km), birmano (my), mongol (mn) o uigur (ug).
- Seguimiento de instrucciones de traduccion: el modelo acepta indicaciones sobre el idioma destino, el tono y el formato de salida, con prompts documentados en chino e ingles.
- Traduccion con terminologia controlada: permite proporcionar glosarios de referencia dentro del prompt para forzar traducciones consistentes de terminos tecnicos o de marca.
- Traduccion orientada a dominios especificos y a casos de negocio reales, segun la evaluacion multidimensional del autor.
- Capacidad conversacional: el repositorio esta etiquetado como "conversational", lo que sugiere soporte de interaccion multi-turno.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que el artefacto puede servirse a traves de APIs compatibles con Inference Endpoints.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Localizacion de documentacion tecnica: se puede alimentar el modelo con un glosario de terminos propios antes del texto, de modo que mantenga consistencia terminologica en manuales y articulos largos traducidos a varios idiomas.
- Traduccion de interfaz de usuario y software: con licencia Apache 2.0 y formato GGUF, se puede integrar en un pipeline interno de localizacion sin coste por token y sin enviar cadenas de producto a APIs de terceros.
- Atencion al cliente multilingue: el modelo puede traducir conversaciones entrantes en 30 idiomas o mas hacia el idioma del operador y devolver la respuesta traducida al cliente, con la ventaja de ejecutarse en infraestructura propia.
- Traduccion de documentacion legal o medica asistida: gracias a la inyeccion de glosarios, es posible fijar la traduccion de terminos juridicos o clinicos recurrentes y reducir la variabilidad entre documentos; requiere revision humana posterior.
- Subtitulado y transcripcion multilingue: Tencent ha vinculado la familia Hy-MT a la tarea de traduccion de subtitulos de video de WMT26, por lo que encaja en flujos de traduccion de subtitulos, aunque la variante GGUF solo cubre la parte de traduccion, no el reconocimiento de voz.
- Procesamiento por lotes en servidor propio: al ser un MoE con 3B parametros activos, permite alto rendimiento por GPU en tareas de traduccion masiva (por ejemplo, catalogo de comercio electronico) siempre que la memoria disponible permita alojar los 30B de pesos.
- Traduccion en entornos con restricciones de red: al distribuirse como GGUF y ejecutarse con llama.cpp en local, es viable en despliegues aislados sin conexion a Internet.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card del autor original referencia una figura (`imgs/main_result.png`) y el informe tecnico en arXiv (2605.22064), pero no incluye cifras concretas de MMLU, HumanEval, GSM8K, BLEU, COMET ni metricas equivalentes de traduccion en el texto proporcionado. Las unicas afirmaciones cualitativas disponibles son las siguientes, atribuidas al autor original y no verificables con los datos suministrados:

| Afirmacion de la model card | Detalle |
|---|---|
| Hy-MT2-7B y Hy-MT2-30B-A3B frente a modelos abiertos | Los superan en modo "fast-thinking" frente a DeepSeek-V4-Pro y Kimi K2.6 (sin cifras) |
| Hy-MT2-1.8B frente a APIs comerciales | Supera globalmente a APIs de Microsoft y Doubao (sin cifras) |
| Evaluacion multidominio | Buen rendimiento declarado en traduccion general, de negocio, de dominio especifico y de seguimiento de instrucciones (sin cifras) |

No se dispone de mediciones especificas para esta cuantizacion GGUF de `botp`, por lo que la perdida de calidad respecto al modelo original en safetensors no esta cuantificada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: al tratarse de un MoE, es necesario tener residentes los 30B de pesos, no solo los 3B activos. Estimaciones aproximadas a partir de los 30.064 millones de parametros: entre 17 y 19 GB en cuantizaciones de 4 bits, en torno a 22-25 GB en 5-6 bits y alrededor de 32 GB en 8 bits. Estas cifras son estimaciones de calculo, no datos publicados por el autor.
- Repositorio completo: 50,2 GB, lo que sugiere que incluye varios niveles de cuantizacion; conviene descargar solo el archivo GGUF necesario.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 puede ejecutar cuantizaciones de 4 bits si se reparte parte del modelo en RAM del sistema; una A100 40/80 GB, H100 o L40S permiten cargar cuantizaciones mayores o el modelo completo con margen para cache KV.
- Cabida en GPU de consumo: si, en tarjetas de 24 GB con cuantizaciones de 4 bits y offload parcial de capas a CPU; en tarjetas de 12-16 GB requerira offload agresivo y la latencia se resentira por el ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros motores compatibles con GGUF. Para vLLM o TGI seria preferible partir del modelo original en safetensors (Tencent Hy-MT2-30B-A3B o su version FP8), ya que el soporte de GGUF en estos motores es limitado. La etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles. Como referencia estructural, un MoE con 3B activos sobre 30B totales ofrece mejor throughput que un modelo denso de 30B, pero el rendimiento real dependera del ancho de banda de memoria de la GPU y del porcentaje de capas descargadas a CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT2-30B-A3B-GGUF (botp) | 30B totales / ~3B activos | no disponible | GGUF con imatrix | Apache 2.0 | Cuantizacion de terceros; sin benchmarks publicados propios |
| Hy-MT2-30B-A3B (Tencent) | 30B totales / ~3B activos | no disponible | safetensors | Apache 2.0 | Version original; existen variantes FP8 |
| Hy-MT2-7B (Tencent) | 7B | no disponible | safetensors, FP8, GGUF | Apache 2.0 | Version densa menor; misma familia y cobertura de idiomas |
| Hy-MT2-1.8B (Tencent) | 1,8B | no disponible | safetensors, FP8, GGUF, 2 bits, 1,25 bits | Apache 2.0 | Orientado a dispositivo; 440 MB en cuantizacion de 1,25 bits y 1,5x mas rapido segun el autor |
| Hunyuan-MT-7B / Chimera-7B (Tencent) | 7B | no disponible | safetensors | Apache 2.0 | Generacion anterior, publicada en septiembre de 2025 |
| DeepSeek-V4-Pro, Kimi K2.6 | no disponible | no disponible | no disponible | no disponible | Citados por el autor como referencia comparativa en modo fast-thinking; sin datos verificables en la informacion disponible |

## Limitaciones y advertencias

- Modelo especializado en traduccion: el pipeline declarado es "translation" y las capacidades documentadas se limitan a esa tarea; no debe asumirse buen rendimiento en razonamiento general, matematicas o generacion de codigo.
- Este repositorio concreto no es el oficial: `botp` es un tercero que ha convertido el modelo original a GGUF. La calidad de la cuantizacion no esta validada por Tencent y no hay benchmarks que midan la degradacion frente a safetensors.
- Riesgo de alucinacion: como cualquier modelo generativo aplicado a traduccion, puede omitir, duplicar o inventar contenido, especialmente en idiomas con pocos recursos (bo, km, my, ug, mn) o en textos muy largos.
- Cobertura de idiomas: la model card oficial declara 33 idiomas mientras que el repositorio lista 36 codigos; la diferencia no esta explicada en la informacion disponible. La calidad por par de idiomas no esta documentada.
- Terminologia y dominios: para uso profesional (legal, medico, financiero) requiere glosarios explcitos y revision humana, dado que no hay evaluacion publica de estos dominios en la informacion disponible.
- Longitud de contexto desconocida: no se puede dimensionar el troceado de documentos largos sin consultar el informe tecnico ni la configuracion del modelo original.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene verificar la licencia del modelo base de Tencent y las condiciones de los datos de entrenamiento antes de un despliegue en produccion.
- Adopcion practicamente nula en el momento de la consulta: 0 descargas y 0 "likes", lo que implica ausencia de validacion por parte de la comunidad y mayor riesgo de problemas no detectados en la conversion.
- Requisitos de memoria elevados para un modelo cuyo coste por token es bajo: los 30B de pesos deben estar accesibles, lo que puede obligar a offload a CPU y degradar la latencia esperada.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/botp/Hy-MT2-30B-A3B-GGUF
- Modelo original en safetensors: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- Version FP8 del modelo original: https://huggingface.co/tencent/Hy-MT2-30B-A3B-FP8
- Coleccion Hy-MT2 en HuggingFace: https://huggingface.co/collections/tencent/hy-mt2
- Modelo Hy-MT2-7B: https://huggingface.co/tencent/Hy-MT2-7B
- Modelo Hy-MT2-1.8B: https://huggingface.co/tencent/Hy-MT2-1.8B
- Modelo Hy-MT2-1.8B-1.25bit-GGUF: https://huggingface.co/tencent/Hy-MT2-1.8B-1.25bit-GGUF
- Informe tecnico (arXiv): https://arxiv.org/pdf/2605.22064
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-MT2
- AngelSlim (cuantizacion extrema): https://github.com/Tencent/AngelSlim/tree/main
- Coleccion en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT2
- Web oficial: https://aistudio.tencent.com/llm/en?tabIndex=0
- Hy-MT2-Translator Skill en ClawHub: https://clawhub.ai/tencent-adm/hy-mt2-translator-skill
- Hy-MT2-Translator Skill en SkillHub: https://skillhub.cn/skills/hy-mt2-translator
- Tarea de traduccion de subtitulos de video en WMT26: https://www2.statmt.org/wmt26/video-subtitle-translation.html
- Tarea general de traduccion automatica en WMT26: https://www2.statmt.org/wmt26/translation-task.html
