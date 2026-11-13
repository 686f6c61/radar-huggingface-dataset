# mrminjae/qwen3p6-35b-a3b-nonexpert-bf16-r102

## Resumen

`mrminjae/qwen3p6-35b-a3b-nonexpert-bf16-r102` es un artefacto de investigación interna publicado en Hugging Face por el usuario mrminjae. No se trata de un modelo ejecutable de extremo a extremo, sino de una extracción de los pesos BF16 correspondientes a los componentes no-expertos del modelo base Qwen/Qwen3.6-35B-A3B. La model card es explícita al respecto: "the non-expert BF16 weights of the base model, not a runnable model".

El modelo base es Qwen3.6-35B-A3B, un modelo de la familia Qwen con arquitectura de mezcla de expertos (MoE), según se deduce de la nomenclatura "35B-A3B" (35 mil millones de parámetros totales, 3 mil millones activos). El repositorio derivado conserva únicamente los tensores no-expertos en precisión BF16, lo que explica su tamaño de 7,5 GB frente a los aproximadamente 70 GB que ocuparían los pesos completos en BF16.

La relevancia de esta publicación es limitada y fundamentalmente técnica: sirve como material de referencia para investigadores interesados en analizar o reutilizar los componentes densos (attention, embeddings, capas no-MoE) del modelo base. No está pensado para inferencia directa, fine-tuning convencional ni despliegue en producción, y su licencia queda supeditada a la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) heredada de Qwen3.6-35B-A3B; este repositorio contiene solo los pesos no-expertos en BF16 |
| Parametros totales | 35B (modelo base); el subconjunto no-experto publicado no tiene un recuento declarado |
| Parametros activos | 3B (modelo base, segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos no-expertos); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Sujeta a la licencia del modelo base Qwen/Qwen3.6-35B-A3B; no especificada en el repositorio |
| Formato de pesos | safetensors (formato propio de transformers; tamano del repo 7,5 GB) |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura propia: es una partición del modelo base Qwen3.6-35B-A3B, que emplea una arquitectura transformer con mezcla de expertos (MoE). La nomenclatura indica 35B parámetros totales con 3B activos por token, un ratio de activación típico de los diseños MoE eficientes de la familia Qwen. Este artefacto concreto aísla los tensores correspondientes a los componentes no-expertos (presumiblemente embeddings, capas de atención y normas) en precisión BF16, descartando los pesos de los expertos.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, la composición de los datos ni si el modelo base pasó por fases de RLHF, DPO u otros ajustes de alineamiento. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de lo que pueda atribuirse al diseño MoE del modelo original. El identificador "r102" sugiere una revisión o checkpoint interno del autor, sin más contexto público.

## Capacidades

- No es un modelo ejecutable de forma autónoma: carece de los pesos de los expertos necesarios para completar el forward pass de una arquitectura MoE.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión en este repositorio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües.
- No se documentan modos especiales (thinking mode, visión, audio).
- Uso previsto: análisis, inspección o reutilización de los tensores no-expertos del modelo base en contextos de investigación.

## Casos de uso

- Análisis de arquitectura MoE: investigadores pueden cargar los tensores no-expertos para estudiar la estructura de atención, embeddings y normalización del modelo base sin descargar los ~70 GB completos en BF16.
- Extracción de embeddings: si los tensores publicados incluyen la matriz de embeddings de entrada, podrían reutilizarse para experimentos de representación léxica o inicialización de otros modelos.
- Inicialización parcial de fine-tunings: un equipo que quiera entrenar una variante del modelo base podría partir de estos pesos no-expertos y añadir expertos propios, aunque requeriría reconstruir el resto de la arquitectura.
- Auditoría de pesos: verificación de la integridad numérica o de la distribución de los tensores BF16 del modelo original, útil en pipelines de validación de releases.
- Docencia y divulgación: material didáctico para explicar cómo se descompone un transformer MoE en componentes densos y expertos.
- Investigación sobre compresión: base para estudiar qué información reside en los componentes no-expertos frente a los expertos, midiendo el impacto de eliminar unos u otros.
- No es adecuado para: inferencia en producción, chatbots, generación de código, RAG, agentes o cualquier tarea que requiera un modelo funcional completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el repositorio no es un modelo ejecutable y no puede realizar inferencia por sí solo.
- VRAM para carga completa de los pesos publicados: aproximadamente 7,5 GB en BF16, suficiente para una GPU consumer con 8-12 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) si solo se inspeccionan los tensores.
- GPU recomendadas para el modelo base completo: no disponible en la información proporcionada; por el tamaño (35B totales, 3B activos) requeriría GPUs de datacenter (A100 80 GB, H100) o cuantización agresiva para consumer.
- Cabe en GPU consumer: los pesos publicados sí; el modelo base completo, no disponible.
- Opciones de despliegue: no aplica para este repositorio; para el modelo base habría que consultar la model card oficial de Qwen/Qwen3.6-35B-A3B.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-nonexpert-bf16-r102 | 35B (base); subconjunto no-experto | 3B (base) | no disponible | Sujeta al modelo base | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B | 35B | 3B | no disponible | No disponible en esta ficha | Hugging Face (modelo base) |
| Otros MoE de tamano similar (p. ej. familia Qwen3 MoE) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- El repositorio no es un modelo funcional: no puede generar texto ni ejecutar inferencia sin los pesos de los expertos del modelo base.
- La licencia no está especificada de forma explícita; se hereda del modelo base Qwen/Qwen3.6-35B-A3B, por lo que el uso comercial queda condicionado a los términos de dicha licencia.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el artefacto no es un modelo desplegable.
- El identificador "r102" y la etiqueta "Internal research artifact" sugieren que no ha pasado por un proceso de revisión o validación pública.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Riesgo de confusión: un usuario podría descargar el repositorio esperando un modelo funcional y encontrar solo un subconjunto de pesos.
- No apto para producción, fine-tuning convencional ni pipelines de inferencia sin trabajo adicional de reconstrucción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-nonexpert-bf16-r102
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
