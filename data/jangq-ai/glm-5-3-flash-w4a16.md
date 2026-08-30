# JANGQ-AI/GLM-5.3-Flash-W4A16

## Resumen

GLM-5.3-Flash-W4A16 es una cuantizacion INT4 del modelo GLM-5.3-Flash, desarrollada por JANGQ-AI. El modelo original, creado por Z.ai, es el primer modelo nativamente multimodal de la serie GLM-5: un MoE de 320 mil millones de parametros con 18 mil millones activos por token, una ventana de contexto de un millon de tokens y una arquitectura hibrida que combina atencion lineal y completa para reducir los costes de servicio en contextos largos. Esta version cuantizada reduce el peso en disco de unos 643 GB (BF16 original) a aproximadamente 195 GB, aplicando INT4 simetrico por grupos de 32 solo a los pesos de los expertos enrutados, mientras que el resto de los componentes (vision, atencion, experto compartido, etc.) se mantienen en BF16.

La cuantizacion esta disenada para GPUs Hopper (H100/H200) y se sirve mediante vLLM con kernels Marlin, lo que la hace adecuada para despliegues de alto rendimiento en entornos de produccion. Al preservar la arquitectura completa, incluyendo el cabezal MTP (multi-token prediction) y el tower de vision, mantiene las capacidades multimodal y de razonamiento del modelo original, aunque con una huella de memoria significativamente menor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido (atencion lineal + atencion completa + vision), 46 capas de texto, 288 expertos enrutados top-8, 1 experto compartido, MTP head en capa 45 |
| Parametros totales | 321.323.031.390 (aprox. 321 B) |
| Parametros activos | 18 B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | W4A16 (INT4 simetrico grupo-32, RTN, solo en pesos de expertos enrutados; el resto en BF16) |
| Idiomas soportados | Ingles, chino |
| Licencia | glm-5.3 (licencia personalizada) |
| Formato de pesos | safetensors, compressed-tensors (pack_to_int32) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash presenta una arquitectura hibrida que combina atencion dispersa (sparse attention) con atencion lineal, una novedad en la serie GLM. Esto reduce los costes de servicio en contextos largos sin sacrificar la precision en tareas que requieren memoria a largo plazo. La parte multimodal incluye un tower de vision que procesa imagenes junto con el texto. El modelo emplea un mecanismo de prediccion multi-token (MTP) en la capa 45, lo que permite generar varios tokens por paso y acelera la inferencia.

La cuantizacion realizada por JANGQ-AI aplica INT4 simetrico con grupo de 32 (escala = amax/7.5, rango [-8,7]) unicamente sobre los pesos de los expertos enrutados (gate, up y down projections). El resto de los componentes —vision, atencion (incluyendo parametros de atencion lineal como A_log y dt_bias), experto compartido, MLP denso de las capas 0-2, router, normas, embeddings, lm_head y el cabezal MTP— se conservan en BF16 o F32. El proceso de cuantizacion es RTN sin calibracion, realizado shard por shard, y verifica la presencia de todas las capas y el conteo de expertos.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados o si se aplicaron tecnicas como RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento complejo en ingles y chino.
- Comprension multimodal: procesa imagenes junto con texto (pipeline image-text-to-text).
- Codificacion de software y tareas de programacion, con rendimiento cercano a Claude Opus 4.8 en benchmarks de codigo y agentes (segun Z.ai).
- Soporte para trabajo agente multi-paso gracias a su ventana de contexto de 1M tokens y su arquitectura hibrida de atencion.
- Prediccion multi-token (MTP) que acelera la generacion al predecir varios tokens por paso.
- Capacidad de manejar conversaciones largas y documentos extensos gracias al contexto de un millon de tokens.
- Compatible con vLLM y SGLang (una vez que el stack reconozca la arquitectura glm5_next).

## Casos de uso

- Asistente de codigo en produccion: el modelo puede integrarse en entornos de desarrollo para generar, revisar y refactorizar codigo. Su ventana de 1M tokens permite procesar repositorios completos o grandes archivos fuente en una sola pasada.
- Agentes autonomos multi-paso: gracias a su capacidad de razonamiento y contexto largo, puede coordinar tareas complejas como busqueda de informacion, ejecucion de herramientas y planificacion de acciones.
- Analisis de documentos con imagenes: al ser multimodal, puede extraer informacion de PDFs, capturas de pantalla o diagramas junto con texto, util en sectores como legal, financiero o medico.
- Atencion al cliente multilingue: gestiona conversaciones en ingles y chino con contexto amplio, manteniendo el hilo de interacciones largas.
- Resumen y extraccion de informacion de corpus extensos: su contexto de 1M tokens permite resumir libros, informes o bases de conocimiento completas sin fragmentacion.
- Desarrollo de aplicaciones de vision-lenguaje: puede combinar entrada visual y textual para tareas como descripcion de imagenes, respuesta a preguntas visuales o generacion de contenido multimodal.
- Servicio de modelos en entornos con restricciones de memoria: la version cuantizada reduce los requisitos de VRAM y almacenamiento, permitiendo desplegar un modelo de 320B en 4 GPUs H100 en lugar de necesitar mas recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La documentacion de Z.ai indica que GLM-5.3-Flash supera a GLM-5.2 en benchmarks y se acerca a Claude Opus 4.8 en tareas de codificacion y agentes, pero no se proporcionan cifras concretas. Tampoco hay datos especificos sobre el impacto de la cuantizacion W4A16 en el rendimiento respecto al modelo original BF16.

## Requisitos de hardware

- Tamano en disco: aproximadamente 195 GB (frente a ~643 GB del BF16 original).
- VRAM estimada: para inferencia con vLLM y tensor-parallel-size 4, se recomiendan 4 GPUs Hopper (H100 o H200) con 80 GB cada una, totalizando 320 GB de VRAM. Con cuantizacion W4A16, el modelo podria caber en 2 o 3 GPUs de 80 GB si se ajusta el paralelismo, aunque el README sugiere 4 para margen.
- GPUs compatibles: NVIDIA H100, H200 (arquitectura Hopper). No se garantiza soporte en GPUs de generaciones anteriores debido a los kernels Marlin optimizados para Hopper.
- Opciones de despliegue: vLLM (comando `vllm serve JANGQ-AI/GLM-5.3-Flash-W4A16 --tensor-parallel-size 4 --trust-remote-code`), SGLang (si el build soporta la arquitectura glm5_next).
- Latencia y throughput: no se proporcionan datos concretos. La cuantizacion INT4 reduce el ancho de banda de memoria necesario, lo que deberia mejorar el throughput en comparacion con BF16, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-5.3-Flash (BF16 original) | ~321 B | 18 B | 1M tokens | glm-5.3 | safetensors BF16 |
| GLM-5.3-Flash-W4A16 (este) | ~321 B | 18 B | 1M tokens | glm-5.3 | safetensors W4A16 |
| GLM-5.2 (version anterior) | no disponible | no disponible | no disponible | glm-5.2 | no disponible |

La comparativa se limita al modelo original y a la version anterior de la serie, ya que no se dispone de datos suficientes sobre otros MoE comparables (por ejemplo, DeepSeek-V3 o Qwen2.5-Max) en la informacion proporcionada. La principal diferencia entre el original y esta cuantizacion es el formato de pesos y el tamano en disco, que se reduce en aproximadamente un 70%, a expensas de una posible degradacion menor en precision (no cuantificada).

## Limitaciones y advertencias

- La cuantizacion W4A16 solo afecta a los expertos enrutados; el resto de parametros permanecen en BF16, lo que reduce el ahorro total de memoria en comparacion con una cuantizacion completa del modelo.
- Requiere un stack de software actualizado que reconozca la arquitectura `glm5_next` (vLLM o SGLang). Si el framework no soporta esta arquitectura, el modelo no cargara correctamente.
- La licencia `glm-5.3` es personalizada; se deben revisar sus terminos para uso comercial, especialmente en cuanto a redistribucion y atribucion.
- El modelo solo soporta ingles y chino; no hay garantias de rendimiento en otros idiomas.
- No se han publicado evaluaciones independientes del modelo cuantizado; el rendimiento real puede variar respecto al BF16, especialmente en tareas de alta precision numerica.
- El proceso de cuantizacion RTN sin calibracion puede introducir errores en tareas que dependen de pesos muy precisos, aunque el impacto no esta documentado.
- El tamano de 195 GB sigue siendo elevado; no es adecuado para GPUs de consumo (p. ej., RTX 4090 con 24 GB) sin tecnicas adicionales de offloading o cuantizacion mas agresiva.
- La arquitectura hibrida con atencion lineal puede tener comportamientos inesperados en contextos extremadamente largos; se recomienda validar en el caso de uso especifico.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/JANGQ-AI/GLM-5.3-Flash-W4A16
- Modelo original (BF16) en HuggingFace: https://huggingface.co/zai-org/GLM-5.3-Flash
- Blog de Z.ai sobre GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Pagina del modelo en Modal: https://modal.com/library/zai/glm-5-3-flash
- Articulo de OpenLM.ai: https://openlm.ai/glm-5.5/
- Imagen Docker (referencia): https://hub.docker.com/r/ai/glm-5.3-flash
