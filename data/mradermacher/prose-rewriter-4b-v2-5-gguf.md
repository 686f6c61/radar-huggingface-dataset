# mradermacher/prose-rewriter-4b-v2.5-GGUF

## Resumen

`mradermacher/prose-rewriter-4b-v2.5-GGUF` es una coleccion de cuantizaciones estaticas en formato GGUF del modelo `chartreuse-verte/prose-rewriter-4b-v2.5`, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversion y cuantizacion del checkpoint original en precision completa (presumiblemente safetensors) a multiples niveles de compresion para su uso con llama.cpp y runtimes compatibles. El nombre del modelo sugiere una especializacion en reescritura de prosa, aunque la model card del repositorio no incluye informacion sobre el dataset de entrenamiento ni sobre las capacidades declaradas.

El modelo cuenta con 4.411.424.256 parametros totales (aproximadamente 4,4 mil millones), un tamano tipico de la familia de modelos de 4B que permite inferencia en GPUs de consumo con cuantizaciones agresivas. El repositorio ocupa 39,7 GB e incluye 12 variantes de cuantizacion que van desde Q2_K hasta F16, lo que facilita el despliegue en hardware muy diverso.

La relevancia de esta ficha radica en que el modelo original carece de documentacion publica detallada en la informacion disponible: no se declaran licencia, idiomas, contexto ni benchmarks. Cualquier evaluacion en produccion deberia partir de una validacion empirica propia, dado que la unica informacion fiable es la relativa al proceso de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `chartreuse-verte/prose-rewriter-4b-v2.5`. Por el tamano (4,4B parametros) y la nomenclatura habitual de la comunidad, es probable que se trate de un transformer decoder-only, pero no hay datos que lo confirmen en la informacion proporcionada. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT.

La unica informacion tecnica disponible proviene de los metadatos de cuantizacion de la model card: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que la conversion se realizo con la herramienta `llama.cpp` a partir de un checkpoint en formato HuggingFace. Las cuantizaciones son estaticas (no imatrix), lo que implica que los factores de escala se calculan con el metodo estandar de llama.cpp sobre los tensores del modelo original.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio sugiere uso en dialogos multi-turno.
- Reescritura de prosa: el nombre del modelo indica una especializacion en reformulacion y mejora de texto, aunque no se detalla el alcance ni la calidad.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante la infraestructura de HuggingFace Inference Endpoints con runtimes compatibles con GGUF.
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- Cobertura multilingue: no disponible.

## Casos de uso

- Reescritura y edicion de textos largos en local: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo sin GPU dedicada (con cuantizaciones Q4_K_M o inferiores) para reformular parrafos, ajustar tono o corregir estilo en documentos propios.
- Procesamiento por lotes de contenido editorial: integrado en un pipeline Python con `llama-cpp-python`, permite reescribir cientos de parrafos de forma automatizada en un servidor con una unica GPU de consumo, dado el reducido tamano del modelo.
- Asistente de redaccion en aplicaciones de escritorio: al caber en GPUs de 8 GB en Q4_K_M, puede embeberse en herramientas de escritorio (por ejemplo, plugins de editores de texto) que requieran privacidad total sin llamadas a APIs externas.
- Prototipado rapido de funciones de parafraseo: util para validar la viabilidad de una funcionalidad de reescritura antes de invertir en un modelo mayor o en un servicio en la nube.
- Filtrado y normalizacion de texto en pipelines de datos: el modelo puede reformular entradas ruidosas o inconsistentes antes de indexarlas en un sistema de busqueda o en un RAG, siempre que se valide la fidelidad de la reescritura.
- Experimentacion academica con cuantizaciones: el repositorio ofrece 12 variantes del mismo modelo, lo que permite estudiar el impacto de la cuantizacion en la calidad de la prosa generada con un unico checkpoint de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - F16: aproximadamente 8,8 GB.
  - Q8_0: aproximadamente 4,7 GB.
  - Q6_K: aproximadamente 3,6 GB.
  - Q5_K_M: aproximadamente 3,1 GB.
  - Q4_K_M: aproximadamente 2,7 GB.
  - Q3_K_M: aproximadamente 2,2 GB.
  - Q2_K: aproximadamente 1,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para F16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070); 6-8 GB para Q8_0; 4-6 GB para Q4_K_M (GTX 1650 Super, RTX 3050, integradas con memoria unificada).
- Cabe en GPU de consumo: si, en todas las cuantizaciones desde Q8_0 hacia abajo. En Q4_K_M es viable incluso en GPUs de 4 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Tambien es compatible con HuggingFace Inference Endpoints segun la etiqueta del repositorio.
- Latencia y throughput: no disponibles. Como referencia orientativa para un modelo de 4B en Q4_K_M sobre una RTX 4090, cabria esperar decenas de tokens por segundo, pero no se ha medido en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| prose-rewriter-4b-v2.5 (este) | 4,4B | no disponible | no disponible | GGUF, safetensors | HuggingFace |
| Qwen2.5-3B-Instruct | 3,1B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | HuggingFace, Ollama |
| Llama-3.2-3B-Instruct | 3,2B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | HuggingFace, Ollama |
| Phi-3.5-mini-instruct | 3,8B | 131.072 tokens | MIT | safetensors, GGUF | HuggingFace, Ollama |

Los tres modelos de referencia cuentan con documentacion publica de entrenamiento, benchmarks y licencias claras, a diferencia del modelo analizado, cuyas condiciones de uso comercial no se declaran.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor del modelo base (`chartreuse-verte`) antes de cualquier despliegue en produccion.
- Ausencia de model card detallada: no se documentan datos de entrenamiento, sesgos conocidos ni limitaciones declaradas por el autor.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones publicas, no es posible estimar la tasa de errores facticos; en tareas de reescritura, esto puede traducirse en alteraciones del significado original.
- Contexto desconocido: se desconoce la ventana de contexto maxima; no debe asumirse que soporte conversaciones o documentos largos sin pruebas previas.
- Idiomas no declarados: aunque el nombre sugiere ingles, no hay confirmacion; el rendimiento en castellano es incierto.
- Cuantizaciones estaticas: al no emplear imatrix, las variantes de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de la prosa generada.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion por terceros.
- Fecha de creacion futura en los metadatos (2026-11-03): inconsistencia que sugiere posibles errores en el registro del repositorio; conviene verificar la integridad de los archivos antes de usarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/prose-rewriter-4b-v2.5-GGUF
- Modelo base: https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v2.5
- Herramienta de cuantizacion (llama.cpp): https://github.com/ggerganov/llama.cpp
