# mradermacher/granite-vision-4.1-4b-heretic-i1-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF del modelo `granite-vision-4.1-4b-heretic`, una variante "abliterated/heretic" del modelo multimodal Granite Vision 4.1 de IBM, publicada por la organización `heretic-org`. El trabajo de cuantización lo realiza `mradermacher`, un autor habitual en el ecosistema GGUF que distribuye versiones comprimidas de modelos para su uso con llama.cpp y derivados. El modelo base combina un backbone de lenguaje tipo Granite (familia de IBM, licencia Apache 2.0 en sus versiones públicas) con un codificador visual, orientado a tareas de comprensión de imágenes y documentos.

El interés de esta ficha radica en que se trata de un artefacto derivado: el repositorio no aporta la model card original del modelo base ni datos de entrenamiento, evaluación o licencia específicos. La información disponible se limita a metadatos de Hugging Face y a los comentarios técnicos del script de cuantización incrustados en el README. Por tanto, muchos campos de esta ficha se marcan como "no disponible" en lugar de inferirse.

Un detalle relevante es la discrepancia entre el nombre del modelo ("4b", que sugiere 4 mil millones de parámetros) y el recuento de parámetros safetensors reportado por Hugging Face (1.887.800, aproximadamente 1,9 millones). Este último dato probablemente corresponde a un tensor parcial o a un artefacto del indexado de Hugging Face, no al total del modelo. Se recomienda verificar el tamaño real antes de planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal Granite Vision; transformer de lenguaje + codificador visual, según nomenclatura del modelo base) |
| Parametros totales | no disponible de forma fiable; el nombre indica "4b" (≈4 mil millones); el recuento safetensors reportado es 1.887.800, probablemente parcial |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_XXS, IQ3_XXS, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con variantes de cuantización weighted/imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF/DPO) del modelo base `granite-vision-4.1-4b-heretic`. La model card del repositorio cuantizado no incluye estos datos; solo contiene comentarios del script de cuantización (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y la lista de cuantizaciones generadas.

Lo que sí se puede afirmar es el método de cuantización: se han producido cuantizaciones de tipo "weighted/imatrix", es decir, utilizando una matriz de importancia (imatrix) calculada sobre un corpus de calibración para minimizar la pérdida de calidad en los formatos de baja precisión (IQ1, IQ2, IQ3). Esta técnica es la recomendada por llama.cpp para cuantizaciones agresivas por debajo de 4 bits. El sufijo "heretic" indica que el modelo base ha sido sometido a una modificación del comportamiento de rechazo (abliteration), un proceso que altera los pesos para reducir las negativas del modelo ante peticiones, sin datos públicos sobre el método exacto empleado.

## Capacidades

- Generación de texto multimodal: al derivar de Granite Vision, se espera capacidad de responder a preguntas sobre imágenes, aunque no se documenta en este repositorio.
- Comprensión de documentos e imágenes: presumiblemente heredada del modelo base, sin confirmación en la información disponible.
- Razonamiento y código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2/IQ3/Q4 permiten ejecutar un modelo de aproximadamente 4 mil millones de parámetros en GPUs de consumo (8-12 GB de VRAM) mediante llama.cpp, algo inviable con los pesos originales en precisión completa.
- Prototipado rápido de pipelines multimodales: usar la variante Q4_K_M como punto de partida para validar flujos de extracción de información de imágenes antes de invertir en infraestructura mayor.
- Investigación sobre abliteration: comparar el comportamiento del modelo "heretic" frente al Granite Vision original para estudiar el efecto de la modificación de rechazos en tareas de visión-lenguaje.
- Experimentación con cuantización imatrix: evaluar la degradación de calidad entre las distintas variantes (IQ1_S a Q6_K) sobre tareas de comprensión de imágenes, dado que el repositorio ofrece prácticamente toda la escala de bits.
- Inferencia local en estaciones de trabajo sin GPU dedicada: las variantes Q2/Q3 pueden ejecutarse en CPU con llama.cpp, útil para demos offline o entornos air-gapped.
- Evaluación comparativa de formatos GGUF: servir como caso de estudio para medir throughput y latencia entre Q4_0, Q4_K_M e IQ4_XS en hardware consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. Para un modelo de ~4B parámetros, las estimaciones habituales serían aproximadamente 2-3 GB en Q2_K, 2,5-3,5 GB en Q3_K_M, 3-4 GB en Q4_K_M y 5-6 GB en Q6_K, pero estos valores son orientativos y no proceden de la información proporcionada.
- GPU recomendadas: no disponible. Por tamaño, cabría en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o GPUs profesionales A100/H100, pero sin confirmación oficial.
- Compatibilidad con GPU de consumo: probable para cuantizaciones Q2-Q4 en GPUs de 8 GB o más, sin datos verificados.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF. vLLM y TGI no son la vía natural para este artefacto, aunque vLLM ha incorporado soporte GGUF experimental.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| granite-vision-4.1-4b-heretic-i1-GGUF (este) | ≈4B (nombre) | no disponible | no disponible | GGUF | Hugging Face |
| granite-vision-4.1-4b-heretic (base) | ≈4B | no disponible | no disponible | safetensors | Hugging Face (heretic-org) |
| Granite Vision 4.1 (IBM, original) | ≈4B | no disponible en esta ficha | Apache 2.0 (versiones públicas de IBM Granite) | safetensors | Hugging Face (ibm-granite) |

La comparación con alternativas de otros fabricantes (Qwen2-VL, Llama 3.2 Vision, Phi-3.5-vision) no puede realizarse con rigor porque faltan datos de rendimiento del modelo base en la información disponible.

## Limitaciones y advertencias

- Ausencia de model card completa: no hay información sobre licencia, idiomas, contexto ni datos de entrenamiento; no se recomienda uso comercial sin verificar la licencia del modelo base en `heretic-org/granite-vision-4.1-4b-heretic`.
- Discrepancia en el recuento de parámetros: el valor safetensors (1.887.800) contradice el "4b" del nombre; conviene inspeccionar los tensores reales antes de desplegar.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación publicada que lo cuantifique en esta variante.
- Efecto de la abliteration: la modificación "heretic" puede degradar la coherencia, la seguridad o el rendimiento en tareas específicas; no hay datos que lo confirmen ni lo descarten.
- Cuantizaciones agresivas (IQ1/IQ2): pérdida de calidad significativa esperada, especialmente en tareas de percepción visual, aunque el uso de imatrix mitiga parte del efecto.
- Sesgos: no documentados; presumiblemente heredados del corpus de entrenamiento del modelo base.
- Licencia incierta: si el modelo base es Apache 2.0 (como las publicaciones públicas de IBM Granite), la redistribución de cuantizaciones es posible con atribución; debe verificarse.
- Repositorio con 0 descargas y 1 like: artefacto muy reciente (creado el 21 de noviembre de 2026) y sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/granite-vision-4.1-4b-heretic-i1-GGUF
- Modelo base (referenciado en el README): https://huggingface.co/heretic-org/granite-vision-4.1-4b-heretic
- Familia Granite Vision de IBM: https://huggingface.co/ibm-granite (referencia general de la familia, no enlazada directamente en la información proporcionada)
- llama.cpp (runtime recomendado para GGUF): https://github.com/ggerganov/llama.cpp (no enlazado en la información proporcionada)
